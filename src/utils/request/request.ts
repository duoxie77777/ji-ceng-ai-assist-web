import axios from 'axios'
import type { RequestConfig } from './types'
import { onRequest, onRequestError, onResponse, onResponseError } from './interceptors'

// 创建 axios 实例
const request = axios.create({
    baseURL: '/api',
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
})

// 注册拦截器
request.interceptors.request.use(onRequest, onRequestError)
request.interceptors.response.use(onResponse, onResponseError)

// ================== 请求方法封装 ==================
export function get<T>(url: string, params?: object, config?: RequestConfig): Promise<T> {
    return request.get(url, { params, ...config })
}

export function post<T>(url: string, data?: object, config?: RequestConfig): Promise<T> {
    return request.post(url, data, config)
}

export function put<T>(url: string, data?: object, config?: RequestConfig): Promise<T> {
    return request.put(url, data, config)
}

export function del<T>(url: string, data?: object, config?: RequestConfig): Promise<T> {
    return request.delete(url, { 
        data: data || {}, 
        ...config 
    })
}

export function patch<T>(url: string, data?: object, config?: RequestConfig): Promise<T> {
    return request.patch(url, data, config)
}

// ================== 特殊请求 ==================
// 文件上传
export function upload<T>(url: string, file: File, fieldName = 'file', config?: RequestConfig): Promise<T> {
    const formData = new FormData()
    formData.append(fieldName, file)
    return request.post(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        ...config,
    })
}

// 文件下载
export async function download(url: string, filename: string, config?: RequestConfig): Promise<void> {
    const response = await request.get(url, {
        responseType: 'blob',
        ...config,
    })
    const blob = new Blob([response.data])
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    link.click()
    URL.revokeObjectURL(link.href)
}

export default request