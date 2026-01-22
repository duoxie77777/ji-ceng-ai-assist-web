import type { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios'

// ================== 类型定义 ==================

/** 后端统一响应结构 */
export interface ApiResponse<T = any> {
    code: number
    data: T
    message: string
}

/** 扩展请求配置 */
export interface RequestConfig extends AxiosRequestConfig {
    /** 跳过 Token 认证 */
    skipAuth?: boolean
    /** 显示错误提示（默认 true） */
    showError?: boolean
    /** 重试次数 */
    retryCount?: number
    /** 重试延迟 ms */
    retryDelay?: number
}

/** 内部请求配置 */
export interface InternalConfig extends InternalAxiosRequestConfig {
    skipAuth?: boolean
    showError?: boolean
    retryCount?: number
    retryDelay?: number
    _currentRetry?: number
}

// ================== 常量配置 ==================

/** HTTP 状态码消息 */
export const HTTP_ERROR_MAP: Record<number, string> = {
    400: '请求参数错误',
    401: '请登录后操作',
    403: '没有访问权限',
    404: '请求资源不存在',
    500: '服务器错误',
    502: '网关错误',
    503: '服务不可用',
    504: '网关超时',
}

/** 业务错误码消息 */
export const BUSINESS_ERROR_MAP: Record<number, string> = {
    10001: '用户未登录',
    10002: 'Token 已过期',
    10003: '权限不足',
}

/** 需要重新登录的错误码 */
export const AUTH_ERROR_CODES = [10001, 10002]

/** 成功状态码 */
export const SUCCESS_CODE = 0
