// ==================== 菜单类型 ====================
export const MenuType = {
  FRIENDS: 'friends',
  NEW_FRIENDS: 'newFriends',
  GROUPS: 'groups',
  CUSTOM_GROUPS: 'customGroups'
} as const
export type MenuType = typeof MenuType[keyof typeof MenuType]

// ==================== 列表类型 ====================
export const ListType = {
  FRIENDS: 'friends',
  REQUESTS: 'requests',
  GROUPS: 'groups'
} as const
export type ListType = typeof ListType[keyof typeof ListType]

// ==================== 关系标签 ====================
export const RelationType = {
  FRIEND: '好友',
  CLASSMATE: '同学',
  COLLEAGUE: '同事',
  NONE: ''
} as const
export type RelationType = typeof RelationType[keyof typeof RelationType]

// ==================== Badge 类型常量 ====================
export const BadgeType = {
  FRIEND: 'friend',
  NEW_FRIEND: 'newFriend'
} as const
export type BadgeType = typeof BadgeType[keyof typeof BadgeType]

// ==================== 默认文本常量（消除魔法字符串） ====================
export const DEFAULT_TEXT = '未设置'

// ==================== 好友详情弹窗字段配置 ====================
export const DETAIL_FIELDS = [
  { label: '组织', field: 'company' },
  { label: '部门', field: 'department' },
  { label: '手机号', field: 'mobile' },
  { label: '邮箱', field: 'email' }
] as const

// ==================== 添加好友表单字段配置 ====================
export const ADD_FRIEND_FORM_FIELDS = [
  { prop: 'name', label: '姓名', placeholder: '请输入姓名' },
  { prop: 'position', label: '职务', placeholder: '请输入职务' },
  { prop: 'company', label: '组织', placeholder: '请输入组织' },
  { prop: 'department', label: '部门', placeholder: '请输入部门' },
  { prop: 'mobile', label: '手机号', placeholder: '请输入手机号' },
  { prop: 'email', label: '邮箱', placeholder: '请输入邮箱' }
] as const

// ==================== 辅助函数：获取字段值，空值显示默认文本 ====================
export function getFieldValue<T extends Record<string, any>>(obj: T, field: keyof T): string {
  const value = obj[field]
  return value && value !== '' ? String(value) : DEFAULT_TEXT
}

// ==================== 部门颜色映射 ====================
export const DEPT_COLOR_MAP: Record<string, string> = {
  'AI应用处': 'var(--blue-500)',
  '政策法规处': 'var(--green-500)',
  '技术研发部': 'var(--orange-500)',
  '人事科': 'var(--red-500)',
  '实习基地': 'var(--gray-500)',
  '基础教育科': 'var(--purple-500)'
}

// ==================== 联系人项接口 ====================
export interface ContactItem {
  id: string | number
  name: string
  avatar?: string
  position?: string
  department?: string
  company?: string
  relation?: string
  mobile?: string
  email?: string
}