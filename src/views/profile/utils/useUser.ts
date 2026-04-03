import { ref } from 'vue'
import type { UserInfo, SystemSettings, Message } from './personal'
import { MESSAGE_TYPES } from './personal'

export function useUser() {
  const userInfo = ref<UserInfo>({
    avatar: 'https://picsum.photos/id/64/200/200',
    name: '张三',
    username: 'zhangshan',
    email: 'zhang@example.com',
    phone: '13800138000',
    province: '北京市',
    city: '北京市',
    address: '朝阳区xxx大厦',
    zipCode: '100000',
    position: '产品经理',
    department: '产品部'
  })

  const systemSettings = ref<SystemSettings>({
    notification: { emailNotify: true, smsNotify: false, taskReminder: true },
    privacy: { profileVisibility: 'contacts', searchable: true },
    accountSecurity: { twoFactorAuth: false, loginAlert: true },
    appearance: { theme: 'light', fontSize: 'medium' }
  })

  const messages = ref<Message[]>([
    { id: 1, title: '系统升级通知', content: '系统将于今晚22:00进行升级维护。', type: MESSAGE_TYPES.SYSTEM, isRead: false, createdAt: new Date() },
    { id: 2, title: '新任务提醒', content: '您有一个待处理任务。', type: MESSAGE_TYPES.TASK, isRead: false, createdAt: new Date() }
  ])

  const updateUserInfo = (newInfo: Partial<UserInfo>) => { userInfo.value = { ...userInfo.value, ...newInfo } }
  const updateSystemSettings = (newSettings: Partial<SystemSettings>) => { systemSettings.value = { ...systemSettings.value, ...newSettings } }
  const markMessageAsRead = (id: number) => { const msg = messages.value.find(m => m.id === id); if (msg) msg.isRead = true }
  const markAllAsRead = () => messages.value.forEach(m => m.isRead = true)
  const deleteMessage = (id: number) => { messages.value = messages.value.filter(m => m.id !== id) }
  const clearReadMessages = () => { messages.value = messages.value.filter(m => !m.isRead) }

  return {
    userInfo,
    systemSettings,
    messages,
    updateUserInfo,
    updateSystemSettings,
    markMessageAsRead,
    markAllAsRead,
    deleteMessage,
    clearReadMessages,
  }
}