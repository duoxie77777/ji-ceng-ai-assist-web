import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import type { ApiResponse, InternalConfig } from './types'
import {
    HTTP_ERROR_MAP,
    BUSINESS_ERROR_MAP,
    AUTH_ERROR_CODES,
    SUCCESS_CODE
} from './types'
import axios from 'axios'

let isRefreshing = false
let refreshSubscribers: ((token: string) => void)[] = []

const subscribeTokenRefresh = (cb: (token: string) => void) => {
    refreshSubscribers.push(cb)
}

const onTokenRefreshed = (token: string) => {
    refreshSubscribers.forEach(cb => cb(token))
    refreshSubscribers = []
}

const refreshAccessToken = async (): Promise<string> => {
    const refreshToken = localStorage.getItem('refreshToken')
    if (!refreshToken) {
        throw new Error('No refresh token')
    }

    try {
        const response = await axios.post('/api/auth/refresh', { refreshToken })
        const result = response.data

        if (result.code === 0) {
            const { accessToken, refreshToken: newRefreshToken } = result.data
            localStorage.setItem('token', accessToken)
            localStorage.setItem('refreshToken', newRefreshToken)
            return accessToken
        } else {
            throw new Error(result.message || 'Token refresh failed')
        }
    } catch (error: any) {
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message)
        }
        throw error
    }
}

export const onRequest = (config: InternalConfig): InternalConfig => {
    if (!config.skipAuth) {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
    }
    return config
}

export const onRequestError = (error: AxiosError): Promise<never> => {
    return Promise.reject(error)
}

export const onResponse = (response: AxiosResponse<ApiResponse>): any => {
    if (response.config.responseType === 'blob') {
        return response
    }

    const { code, data, message } = response.data

    if (code === SUCCESS_CODE) {
        return data
    }

    const errMsg = BUSINESS_ERROR_MAP[code] || message || '请求失败'
    handleError(errMsg, response.config as InternalConfig)

    if (AUTH_ERROR_CODES.includes(code)) {
        handleAuthError()
    }

    const error = new Error(errMsg)
    error.name = 'BusinessError'
    return Promise.reject(error)
}

export const onResponseError = async (error: AxiosError): Promise<never> => {
    const status = error.response?.status
    const config = error.config as InternalConfig & { _retry?: boolean }

    // 401 错误处理：跳过登录和注册接口的 token 刷新
    if (status === 401 && !config._retry && !config.skipAuth) {
        if (isRefreshing) {
            return new Promise((resolve) => {
                subscribeTokenRefresh((token: string) => {
                    config.headers!.Authorization = `Bearer ${token}`
                    resolve(axios(config))
                })
            })
        }

        config._retry = true
        isRefreshing = true

        try {
            const newToken = await refreshAccessToken()
            onTokenRefreshed(newToken)
            config.headers!.Authorization = `Bearer ${newToken}`
            return axios(config)
        } catch (refreshError) {
            handleAuthError()
            return Promise.reject(refreshError)
        } finally {
            isRefreshing = false
        }
    }

    // 从后端响应中提取错误消息
    let errMsg = '网络连接失败'
    if (status) {
        const backendMessage = (error.response?.data as any)?.message
        errMsg = backendMessage || HTTP_ERROR_MAP[status] || `请求失败 (${status})`
    }

    handleError(errMsg, config)

    // 只有非登录/注册接口的 401 错误才触发登出
    if (status === 401 && !config.skipAuth) {
        handleAuthError()
    }

    // 创建新的错误对象，包含后端返回的 message
    const customError = new Error(errMsg) as any
    customError.response = error.response
    customError.config = error.config
    customError.code = error.code
    return Promise.reject(customError)
}

const handleError = (message: string, config?: InternalConfig): void => {
    if (config?.showError !== false) {
        console.error('[Request Error]', message)
    }
}

const handleAuthError = (): void => {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('userInfo')
    const currentPath = window.location.pathname
    if (currentPath !== '/login') {
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`
    }
}
