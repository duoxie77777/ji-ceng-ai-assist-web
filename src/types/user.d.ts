export interface UserInfo {
  id?: number
  username: string
  avatar?: string
  email?: string
  phone?: string
  department?: string
  position?: string
  nickname?: string
  roles?: string[]
  permissions?: string[]
  createTime?: string
  lastLoginTime?: string
  bio?: string
  sex?: '男' | '女' | '保密'
  address?: {
    country?: string
    city?: string
    detail?: string
  }
  company?: string
  relation?: string
}

export interface LoginParams {
  username: string
  password: string
  rememberMe?: boolean
  captcha?: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: UserInfo
  success?: boolean
  message?: string
}
