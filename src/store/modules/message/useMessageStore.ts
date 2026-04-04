import { defineStore } from 'pinia'
import { messageApi, type Conversation, type Message } from '@/api/message/message'

export const useMessageStore = defineStore('message', {
  state: () => ({
    conversations: [] as Conversation[],
    currentConversation: null as Conversation | null,
    messages: [] as Message[],
    unreadCount: 0,
    loading: false,
    messagePage: 1,
    messagePageSize: 20,
    messageTotal: 0,
  }),
  getters: {
    hasMoreMessages: (state) => state.messages.length < state.messageTotal,
  },
  actions: {
    setConversations(conversations: Conversation[]) {
      this.conversations = conversations
    },
    setCurrentConversation(conversation: Conversation | null) {
      this.currentConversation = conversation
    },
    setMessages(messages: Message[]) {
      this.messages = messages
    },
    addMessages(messages: Message[]) {
      this.messages = [...this.messages, ...messages]
    },
    setUnreadCount(count: number) {
      this.unreadCount = count
    },
    setLoading(loading: boolean) {
      this.loading = loading
    },
    async fetchConversations(userId: number) {
      this.setLoading(true)
      try {
        const conversations = await messageApi.getConversations(userId)
        this.setConversations(conversations)
      } catch (error) {
        console.error('获取会话列表失败:', error)
      } finally {
        this.setLoading(false)
      }
    },
    async createConversation(data: {
      type: 'private' | 'group'
      creatorId: number
      participantId?: number
      chatGroupId?: number
    }) {
      this.setLoading(true)
      try {
        console.log('[Store] 创建会话请求数据:', data)
        const conversation = await messageApi.createConversation(data)
        console.log('[Store] 创建会话返回数据:', conversation)
        this.conversations.unshift(conversation)
        return conversation
      } catch (error: any) {
        console.error('[Store] 创建会话失败:', error)
        console.error('[Store] 错误信息:', error.message)
        console.error('[Store] 错误响应:', error.response?.data)
        throw error
      } finally {
        this.setLoading(false)
      }
    },
    async deleteConversation(id: string | number, userId: number) {
      this.setLoading(true)
      try {
        await messageApi.deleteConversation(id, userId)
        this.conversations = this.conversations.filter((c) => c.id !== id)
        if (this.currentConversation?.id === id) {
          this.setCurrentConversation(null)
        }
      } catch (error) {
        console.error('删除会话失败:', error)
        throw error
      } finally {
        this.setLoading(false)
      }
    },
    async fetchMessages(conversationId: string | number, page: number =1) {
      this.setLoading(true)
      try {
        const result = await messageApi.getMessages(conversationId, page, this.messagePageSize)
        if (page ===1) {
          this.setMessages(result.messages)
        } else {
          this.addMessages(result.messages)
        }
        this.messagePage = page
        this.messageTotal = result.total
      } catch (error) {
        console.error('获取消息列表失败:', error)
      } finally {
        this.setLoading(false)
      }
    },
    async sendMessage(data: {
      conversationId: string | number
      senderId: number
      type: 'text' | 'image' | 'file' | 'audio' | 'video' | 'system'
      content: string
      fileId?: number
    }) {
      try {
        const message = await messageApi.sendMessage(data)
        this.messages.push(message)
        const conversation = this.conversations.find((c) => c.id === data.conversationId)
        if (conversation) {
          conversation.lastMessage = data.content
          conversation.lastMessageTime = new Date().toISOString()
        }
        return message
      } catch (error) {
        console.error('发送消息失败:', error)
        throw error
      }
    },
    async deleteMessage(id: string, userId: number) {
      try {
        await messageApi.deleteMessage(id, userId)
        this.messages = this.messages.filter((m) => m.id !== id)
      } catch (error) {
        console.error('删除消息失败:', error)
        throw error
      }
    },
    async recallMessage(id: string, userId: number) {
      try {
        const message = await messageApi.recallMessage(id, userId)
        const index = this.messages.findIndex((m) => m.id === id)
        if (index !== -1) {
          this.messages[index] = message
        }
        return message
      } catch (error) {
        console.error('撤回消息失败:', error)
        throw error
      }
    },
    async markAsRead(conversationId: string | number, userId: number) {
      try {
        await messageApi.markConversationRead(conversationId, userId)
        const conversation = this.conversations.find((c) => c.id === conversationId)
        if (conversation) {
          conversation.unreadCount = 0
        }
      } catch (error) {
        console.error('标记已读失败:', error)
      }
    },
    async fetchUnreadCount(userId: number) {
      try {
        const result = await messageApi.getUnreadCount(userId)
        this.setUnreadCount(result.total)
      } catch (error) {
        console.error('获取未读消息数失败:', error)
      }
    },
  },
})
