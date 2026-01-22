import type { AxiosError, AxiosResponse } from 'axios'
import type { ApiResponse, InternalConfig } from './types'
import {
    HTTP_ERROR_MAP,
    BUSINESS_ERROR_MAP,
    AUTH_ERROR_CODES,
    SUCCESS_CODE
} from './types'

// ================== 请求拦截器 ==================

export const onRequest = (config: InternalConfig): InternalConfig => {
    // 注入 Token
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

// ================== 响应拦截器 ==================

export const onResponse = (response: AxiosResponse<ApiResponse>): any => {
    // Blob 类型直接返回
    if (response.config.responseType === 'blob') {
        return response
    }

    const { code, data, message } = response.data

    // 成功
    if (code === SUCCESS_CODE) {
        return data
    }

    // 业务错误
    const errMsg = BUSINESS_ERROR_MAP[code] || message || '请求失败'
    handleError(errMsg, response.config as InternalConfig)

    // 需要重新登录
    if (AUTH_ERROR_CODES.includes(code)) {
        handleAuthError()
    }

    return Promise.reject(new Error(errMsg))
}

export const onResponseError = (error: AxiosError): Promise<never> => {
    const status = error.response?.status
    const config = error.config as InternalConfig

    // 获取错误消息
    const errMsg = status
        ? HTTP_ERROR_MAP[status] || `请求失败 (${status})`
        : '网络连接失败'

    handleError(errMsg, config)

    // 401 需要重新登录
    if (status === 401) {
        handleAuthError()
    }

    return Promise.reject(new Error(errMsg))
}

// ================== 内部方法 ==================

const handleError = (message: string, config?: InternalConfig): void => {
    if (config?.showError !== false) {
        // 这里可以替换为 UI 组件库的 message
        console.error('[Request Error]', message)
    }
}

const handleAuthError = (): void => {
    localStorage.removeItem('token')
    // 跳转登录页（根据项目路由方式调整）
    const currentPath = window.location.pathname
    if (currentPath !== '/login') {
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`
    }
}