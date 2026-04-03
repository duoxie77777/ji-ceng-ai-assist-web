// 菜单配置
export const MENU_ITEMS = [
  { key: 'profile', label: '个人档案', icon: 'User' },
  { key: 'system', label: '系统设置', icon: 'Setting' },
  { key: 'message', label: '消息中心', icon: 'Message' },
  { key: 'help', label: '帮助与反馈', icon: 'QuestionFilled' }
] as const

// 消息类型常量
export const MESSAGE_TYPES = {
  SYSTEM: 'system',
  TASK: 'task',
  REMINDER: 'reminder'
} as const

// 通用文本常量
export const UI_TEXT = {
  UNREAD: '未读',
  READ: '已读',
  MARK_READ: '标为已读',
  MARK_ALL_READ: '全部已读',
  CLEAR_READ: '清除已读',
  DELETE: '删除',
  EDIT: '编辑',
  SAVE: '保存',
  CANCEL: '取消',
  CONFIRM: '确认'
} as const

// 用户信息类型
export interface UserInfo {
  avatar: string
  name: string
  username: string
  email: string
  phone: string
  province: string
  city: string
  address: string
  zipCode: string
  position: string
  department: string
}

// 系统设置类型
export interface SystemSettings {
  notification: { emailNotify: boolean; smsNotify: boolean; taskReminder: boolean }
  privacy: { profileVisibility: 'public' | 'contacts' | 'private'; searchable: boolean }
  accountSecurity: { twoFactorAuth: boolean; loginAlert: boolean }
  appearance: { theme: 'light' | 'dark' | 'auto'; fontSize: 'small' | 'medium' | 'large' }
}

// 消息类型
export interface Message {
  id: number
  title: string
  content: string
  type: typeof MESSAGE_TYPES[keyof typeof MESSAGE_TYPES]
  isRead: boolean
  createdAt: Date
}

// 表单字段配置
export const PROFILE_FIELDS = [
  { label: '姓名', prop: 'name', span: 12 },
  { label: '账号', prop: 'username', span: 12 },
  { label: '部门', prop: 'department', span: 12 },
  { label: '职位', prop: 'position', span: 12 },
  { label: '邮箱', prop: 'email', span: 12 },
  { label: '电话', prop: 'phone', span: 12 }
] as const

// 地址字段配置
export const ADDRESS_FIELDS = [
  { label: '省份', prop: 'province', span: 8 },
  { label: '城市', prop: 'city', span: 8 },
  { label: '详细地址', prop: 'address', span: 8 }
] as const