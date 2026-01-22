import { get, post } from '@/utils/request'
// 类型
export interface UserInfo {
  id: number
  username: string
  avatar: string
}

export interface LoginParams {
  username: string
  password: string
}

export interface LoginResult {
  token: string
  expires: number
}

// API
export const userApi = {
  // 登录
  login: (data: LoginParams) =>
    post<LoginResult>('/auth/login', data, { skipAuth: true }),

  // 获取用户信息
  getInfo: () =>
    get<UserInfo>('/user/info'),

  // 退出登录
  logout: () =>
    post<void>('/auth/logout'),
}
