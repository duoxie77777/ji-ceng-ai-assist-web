import { get, post, put, upload } from '@/utils/request'

export interface UserInfo {
  id: number
  username: string
  avatar?: string
  email?: string
  phone?: string
  department?: string
  position?: string
  createdAt?: string
}

export interface LoginParams {
  username: string
  password: string
}

export interface LoginResult {
  accessToken: string
  refreshToken: string
  user: UserInfo
}

export interface RefreshTokenParams {
  refreshToken: string
}

export interface RefreshTokenResult {
  accessToken: string
  refreshToken: string
}

export interface ChangePasswordParams {
  oldPassword: string
  newPassword: string
}

export interface UploadAvatarResult {
  avatar: string
}

export const userApi = {
  login: (data: LoginParams) =>
    post<LoginResult>('/auth/login', data, { skipAuth: true }),

  register: (data: LoginParams & { email?: string; phone?: string; department?: string; position?: string }) => {
    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(data.username)}&background=random&color=fff&size=200`
    return post<LoginResult>('/auth/register', {
      ...data,
      avatar: defaultAvatar
    }, { skipAuth: true })
  },

  refreshToken: (refreshToken: string) =>
    post<RefreshTokenResult>('/auth/refresh', { refreshToken }),

  logout: () =>
    post<void>('/auth/logout'),

  getUserInfo: () =>
    get<UserInfo>('/user/info'),

  updateUserInfo: (data: Partial<UserInfo>) =>
    put<UserInfo>('/user/info', data),

  changePassword: (data: ChangePasswordParams) =>
    put<{ message: string }>('/user/password', data),

  uploadAvatar: (file: File) =>
    upload<UploadAvatarResult>('/user/avatar', file, 'file'),

  getUserById: (id: number) =>
    get<UserInfo>(`/user/${id}`),

  searchUsers: (keyword: string) =>
    get<UserInfo[]>('/user/search', { keyword }),
}
