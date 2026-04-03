/**
 * 用户信息接口
 */
export interface UserInfo {
  /** 用户ID */
  id?: number
  /** 用户名 */
  username: string
  /** 邮箱 */
  email?: string
  /** 昵称 */
  nickname?: string
  /** 头像URL */
  avatar?: string
  /** 角色列表 */
  roles?: string[]
  /** 权限列表 */
  permissions?: string[]
  /** 手机号 */
  phone?: string
  /** 创建时间 */
  createTime?: string
  /** 最后登录时间 */
  lastLoginTime?: string
  // 扩展字段（用于通讯录/聊天）
  bio?: string;           // 职业/签名
  sex?: '男' | '女' | '保密';
  address?: {
    country?: string;
    city?: string;
    detail?: string;
  };
  department?: string;    // 部门
  position?: string;      // 职位
  relation?: string;      // 关系标签（本局/智库等）
  company?: string;       // 单位

}

/**
 * 登录参数接口
 */
export interface LoginParams {
  /** 用户名 */
  username: string
  /** 密码 */
  password: string
  /** 记住我 */
  rememberMe?: boolean
  /** 验证码 */
  captcha?: string
}

/**
 * 登录响应接口
 */
export interface LoginResponse {
  /** 访问令牌 */
  token?: string
  /** 刷新令牌 */
  refreshToken?: string
  /** 令牌类型 */
  tokenType?: string
  /** 过期时间（秒） */
  expiresIn?: number
  /** 用户信息 */
  userInfo?: UserInfo
  /** 是否成功 */
  success?: boolean
  /** 错误信息 */
  message?: string
}