import type { MessageType, FileType, SearchResultType } from './type'

// 用户信息（通讯录好友结构）
export interface User {
  id: string | number
  name: string
  avatar: string
  email: string
  bio: string
  phone: string
  sex: string
  address: {
    country: string
  }
  company?: string
  department?: string
  position?: string
  relation?: string
  isRead?: boolean
}

// 单条消息
export interface Message {
  id: string
  senderId: string | number
  senderName: string
  senderAvatar: string
  content: string
  timestamp: string
  isOwn: boolean
  isRead: boolean
  type: MessageType
  fileInfo?: {
    name: string
    size: number
    url: string
    type: string
    isImage?: boolean
  }
}

// 会话
export interface Conversation {
  id: string | number
  participant: User
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  messages: Message[]
  isActive: boolean
}

// 搜索结果项
export interface SearchResult {
  type: SearchResultType
  conversationId: string
  conversationName: string
  content?: string
  timestamp?: string
  matchText: string
  msgId?: string
}

// 附件（用于详情面板）
export interface Attachment {
  id: string
  name: string
  type: FileType
  url: string
}

// UI 文本常量（
export const UI_TEXT = {
  BASIC_INFO: '基本信息',
  ADDRESS_INFO: '住址信息',
  FILE_NAME: '文件名',
  DOWNLOAD: '下载',
  MESSAGE_PLACEHOLDER: '输入消息...',
  SEARCH_PLACEHOLDER: '搜索会话或消息...',
  NO_SEARCH_RESULT: '没有找到相关内容'
}

export const STATUS_TEXT = {
  UNKNOWN_CONTACT: '未知联系人',
  EMPTY_MESSAGE: '暂无聊天记录，开始聊聊吧～',
  UNKNOWN_FILE: '未知文件',
  READ: '已读',
  UNREAD: '未读',
  EMPTY_MESSAGE_TIP: '消息不能为空'
}

export const USER_INFO_LABEL = {
  NAME: '姓名',
  BIO: '职业',
  PHONE: '电话',
  SEX: '性别',
  COUNTRY: '城市/国家',
  UNFILLED: '未填写'
}

// CSS 类名常量（用于模板样式绑定）
export const CSS_CLASS_NAME = {
  INFO_LABEL: 'info-label',
  INFO_VALUE: 'info-value',
  MESSAGE_BUBBLE: 'message-bubble',
  MSG_FLASH: 'msg-flash'
}

// 格式化文件大小
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// 格式化时间（消息气泡或侧边栏）
export function formatTime(iso: string | undefined, formatType: 'message' | 'sidebar' = 'message'): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '未知时间'

  if (formatType === 'sidebar') {
    const month = d.getMonth() + 1
    const day = d.getDate()
    const hours = d.getHours()
    const minutes = String(d.getMinutes()).padStart(2, '0')
    return `${month}/${day} ${hours}:${minutes}`
  }

  const hours = d.getHours()
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const period = hours >= 12 ? '下午' : '上午'
  const displayHour = hours % 12 || 12
  return `${displayHour}:${minutes} ${period}`
}

// 格式化日期（今天/昨天/月/日）
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '未知日期'

  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const msgDateStr = date.toDateString()
  const todayStr = today.toDateString()
  const yesterdayStr = yesterday.toDateString()

  if (msgDateStr === todayStr) return '今天'
  if (msgDateStr === yesterdayStr) return '昨天'
  return `${date.getMonth() + 1}/${date.getDate()}`
}

// 详情面板字段配置
export const DETAIL_INFO_FIELDS = [
  { label: USER_INFO_LABEL.NAME, field: 'name' },
  { label: USER_INFO_LABEL.BIO, field: 'bio' },
  { label: USER_INFO_LABEL.PHONE, field: 'phone' },
  { label: USER_INFO_LABEL.SEX, field: 'sex' }
] as const