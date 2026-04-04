import { get, post, del } from '@/utils/request'

export interface Conversation {
  id: string
  type: 'private' | 'group'
  creatorId: number
  creator?: any
  participantId?: number
  participant?: any
  chatGroupId?: number
  lastMessage?: string
  lastMessageTime?: string
  lastMessageSenderId?: number
  unreadCount?: number
  createdAt: string
  updatedAt: string
}

export interface Message {
  id: string
  conversationId: string
  senderId: number
  sender?: any
  type: 'text' | 'image' | 'file' | 'audio' | 'video' | 'system'
  content: string
  fileId?: number
  isRecalled: boolean
  recalledAt?: string
  createdAt: string
}

export interface File {
  id: number
  uploaderId: number
  uploader?: any
  filename: string
  originalName: string
  mimetype: string
  size: number
  filePath: string
  fileUrl: string
  type: 'image' | 'document' | 'video' | 'audio' | 'other'
  conversationId?: number
  createdAt: string
}

export const messageApi = {
  getConversations: (userId: number) =>
    get<Conversation[]>(`/message/conversations/${userId}`),

  createConversation: (data: {
    type: 'private' | 'group'
    creatorId: number
    participantId?: number
    chatGroupId?: number
  }) => {
    // 确保所有 ID 都是数字类型
    const requestData = {
      ...data,
      creatorId: Number(data.creatorId),
      participantId: data.participantId ? Number(data.participantId) : undefined,
      chatGroupId: data.chatGroupId ? Number(data.chatGroupId) : undefined
    }
    console.error('=== [API 调试] 创建会话请求 ===')
    console.error('请求数据:', requestData)
    console.error('creatorId 类型:', typeof requestData.creatorId, '值:', requestData.creatorId)
    console.error('participantId 类型:', typeof requestData.participantId, '值:', requestData.participantId)
    console.error('===========================')
    
    // 验证 ID 是否有效
    if (!requestData.creatorId || requestData.creatorId <= 0) {
      console.error('❌ 错误：creatorId 无效！', requestData.creatorId)
      return Promise.reject(new Error('创建者 ID 无效'))
    }
    if (requestData.participantId && requestData.participantId <= 0) {
      console.error('❌ 错误：participantId 无效！', requestData.participantId)
      return Promise.reject(new Error('参与者 ID 无效'))
    }
    
    return post<Conversation>('/message/conversations', requestData)
  },

  deleteConversation: (id: string | number, userId: number) => {
    // 确保 ID 是纯数字
    const numericId = typeof id === 'string' 
      ? parseInt(id.replace('conv-', ''), 10)
      : Number(id)
    
    // 确保 userId 是数字
    const numericUserId = Number(userId)
    
    const requestData = { userId: numericUserId }
    console.log('[API] 删除会话请求:', {
      url: `/message/conversations/${numericId}`,
      method: 'DELETE',
      data: requestData
    })
    
    return del<void>(`/message/conversations/${numericId}`, requestData)
  },

  getConversationDetail: (id: string | number) =>
    get<Conversation>(`/message/conversations/detail/${id}`),

  markConversationRead: (id: string | number, userId: number) =>
    post<void>(`/message/conversations/${id}/read`, { userId }),

  getMessages: (conversationId: string | number, page?: number, pageSize?: number) => {
    // 将 ID 转换为数字
    const convId = typeof conversationId === 'string' 
      ? parseInt(conversationId.replace('conv-', ''), 10)
      : Number(conversationId)
    return get<{ messages: Message[]; total: number; page: number; pageSize: number }>(
      `/message/conversations/${convId}/messages`,
      { params: { page, pageSize } }
    )
  },

  sendMessage: (data: {
    conversationId: string | number
    senderId: number
    type: 'text' | 'image' | 'file' | 'audio' | 'video' | 'system'
    content: string
    fileId?: number
  }) => {
    // 确保所有 ID 都是数字类型
    const requestData = {
      ...data,
      conversationId: typeof data.conversationId === 'string' 
        ? parseInt(data.conversationId.replace('conv-', ''), 10)
        : Number(data.conversationId),
      senderId: Number(data.senderId),
      fileId: data.fileId ? Number(data.fileId) : undefined
    }
    console.log('[API] 发送消息请求数据:', requestData)
    return post<Message>('/message/messages', requestData)
  },

  deleteMessage: (id: string, userId: number) =>
    del<void>(`/message/messages/${id}`, { userId }),

  recallMessage: (id: string, userId: number) =>
    post<Message>(`/message/messages/${id}/recall`, { userId }),

  getUnreadCount: (userId: number) =>
    get<{ total: number }>(`/message/unread-count/${userId}`),

  uploadFile: (file: File, uploaderId: number, conversationId?: string | number) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('uploaderId', String(uploaderId))
    if (conversationId) {
      // 将 ID 转换为数字后转字符串
      const convId = typeof conversationId === 'string' 
        ? parseInt(conversationId.replace('conv-', ''), 10)
        : Number(conversationId)
      formData.append('conversationId', String(convId))
    }
    return post<File>('/message/files/upload', formData)
  },

  getFile: (id: number) => get<File>(`/message/files/${id}`),

  getFiles: (conversationId: string | number, page?: number, pageSize?: number) => {
    const convId = typeof conversationId === 'string' 
      ? parseInt(conversationId.replace('conv-', ''), 10)
      : Number(conversationId)
    return get<{ files: File[]; total: number; page: number; pageSize: number }>(
      `/message/conversations/${convId}/files`,
      { params: { page, pageSize } }
    )
  },

  deleteFile: (id: number, userId: number) =>
    del<void>(`/message/files/${id}`, { userId }),
}
