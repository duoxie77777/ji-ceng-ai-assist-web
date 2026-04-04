import { defineStore } from 'pinia'
import type { Conversation, Message, User, SearchResult } from './chat'
import { MessageType, SearchResultType, GlobalEvent } from './type'
import { useMessageStore } from '@/store/modules/message/useMessageStore'
import { useUserStore } from '@/store/modules/user'
import { contactsApi } from '@/api/contacts/contacts'
import { messageApi } from '@/api/message/message'

const getCurrentUserId = (): number => {
  const userStore = useUserStore()
  const userId = userStore.userInfo?.id
  return userId || 0
}

export const useChatStore = defineStore('chat', {
  state: () => ({
    conversations: [] as Conversation[],
    activeConvId: null as number | null,
    showDetailPanel: false,
    searchKeyword: '' as string,
    searchResults: [] as SearchResult[],
    highlightMsgId: '' as string
  }),

  actions: {
    async initChatData() {
      const messageStore = useMessageStore()
      const currentUserId = getCurrentUserId()
      
      if (!currentUserId || currentUserId === 0) {
        return
      }
      
      try {
        const friends = await contactsApi.getFriends(currentUserId)
        await messageStore.fetchConversations(currentUserId)
        
        this.conversations = messageStore.conversations.map(conv => {
          const isCreator = conv.creatorId === currentUserId
          const otherUserId = isCreator ? conv.participantId : conv.creatorId
          const friend = friends?.find(f => f.friendId === otherUserId || f.userId === otherUserId)
          
          return {
            id: Number(conv.id),
            creatorId: conv.creatorId,
            participantId: conv.participantId,
            participant: {
              id: otherUserId || 0,
              name: friend?.remark || friend?.friend?.username || conv.participant?.username || '未知用户',
              avatar: friend?.friend?.avatar || conv.participant?.avatar || '',
              email: conv.participant?.email || '',
              bio: '',
              phone: conv.participant?.phone || '',
              sex: '',
              address: { country: '中国' },
              company: friend?.friend?.department || conv.participant?.department || '',
              department: friend?.friend?.department || conv.participant?.department || '',
              position: friend?.friend?.position || conv.participant?.position || '',
              relation: friend?.relation || ''
            },
            lastMessage: conv.lastMessage || '',
            lastMessageTime: conv.lastMessageTime || new Date().toISOString(),
            unreadCount: conv.unreadCount || 0,
            isActive: false,
            messages: []
          }
        })
      } catch (error) {
        console.error('初始化会话列表失败:', error)
      }
      
      if (this.conversations.length > 0) {
        this.activeConvId = this.conversations[0].id
        this.conversations[0].isActive = true
        await this.loadMessages(this.activeConvId)
      }
    },

    async loadMessages(conversationId: number) {
      const messageStore = useMessageStore()
      const currentUserId = getCurrentUserId()
        
      await messageStore.fetchMessages(conversationId)
      
      const conv = this.conversations.find(c => c.id === conversationId)
      if (conv && messageStore.messages.length > 0) {
        conv.messages = messageStore.messages.map(msg => {
          const isOwn = msg.senderId === currentUserId
          // 已读状态逻辑：直接使用后端返回的 isRead 状态
          // 后端会根据接收者是否生成了 MessageRead 记录来判断
          const isRead = (msg as any).isRead || false
          
          return {
            id: String(msg.id),
            senderId: msg.senderId,
            senderName: msg.sender?.username || '未知用户',
            senderAvatar: msg.sender?.avatar || '',
            content: msg.content,
            timestamp: msg.createdAt,
            isOwn,
            isRead,
            type: msg.type === 'text' ? MessageType.TEXT : MessageType.FILE,
            fileInfo: msg.fileId ? {
              name: '',
              size: 0,
              url: '',
              type: '',
              isImage: false
            } : undefined
          }
        })
        
        // 更新会话的未读数（统计他人发给我的未读消息）
        const unreadCount = conv.messages.filter(m => !m.isOwn && !m.isRead).length
        conv.unreadCount = unreadCount
      }
    },

    async activateOrCreateConversation(userId: number | string): Promise<Conversation | null> {
      const messageStore = useMessageStore()
      const currentUserId = getCurrentUserId()
      const numericUserId = Number(userId)
      
      if (!currentUserId || currentUserId === 0 || isNaN(numericUserId)) {
        return null
      }
      
      // 先在现有会话中查找
      let conv = this.conversations.find(c => 
        c.participant.id === numericUserId || 
        c.participantId === numericUserId
      )
      
      if (!conv) {
        try {
          // 获取好友信息
          const friends = await contactsApi.getFriends(currentUserId)
          const friend = friends?.find(f => f.friendId === numericUserId || f.userId === numericUserId)
          
          // 创建或获取后端会话
          const newConv = await messageStore.createConversation({
            type: 'private',
            creatorId: currentUserId,
            participantId: numericUserId
          })
          
          if (newConv) {
            const otherUser = newConv.participant || friend?.friend || {}
            conv = {
              id: Number(newConv.id),
              creatorId: newConv.creatorId,
              participantId: newConv.participantId,
              participant: {
                id: numericUserId,
                name: friend?.remark || otherUser.username || '未知用户',
                avatar: otherUser.avatar || '',
                email: otherUser.email || '',
                bio: otherUser.position || '',
                phone: otherUser.phone || '',
                sex: '',
                address: { country: '中国' },
                company: otherUser.department || '',
                department: otherUser.department || '',
                position: otherUser.position || '',
                relation: friend?.relation || ''
              },
              lastMessage: '',
              lastMessageTime: new Date().toISOString(),
              unreadCount: 0,
              isActive: false,
              messages: []
            }
            this.conversations.unshift(conv)
          }
        } catch (error: any) {
          console.error('激活或创建会话失败:', error)
          throw error
        }
      }
      
      if (conv) {
        await this.switchConversation(conv.id)
      }
      
      return conv
    },

    async switchConversation(id: number) {
      this.conversations.forEach(conv => {
        conv.isActive = conv.id === id
      })
      this.activeConvId = id

      const conv = this.conversations.find(c => c.id === id)
      if (conv) {
        if (!conv.messages || conv.messages.length === 0) {
          await this.loadMessages(id)
        }
        
        if (conv.messages) {
          conv.messages.forEach(msg => {
            if (!msg.isOwn && !msg.isRead) {
              msg.isRead = true
            }
          })
        }
        conv.unreadCount = 0
        
        const currentUserId = getCurrentUserId()
        const messageStore = useMessageStore()
        messageStore.markAsRead(id, currentUserId).catch(err => {
          console.error('标记已读失败:', err)
        })
      }
    },

    async deleteConversation(id: number) {
      const userStore = useUserStore()
      const currentUserId = userStore.userInfo?.id
      if (!currentUserId) return

      try {
        await messageApi.deleteConversation(id, currentUserId)
        this.conversations = this.conversations.filter(c => c.id !== id)
        if (this.activeConvId === id) {
          this.activeConvId = this.conversations.length > 0 ? this.conversations[0].id : null
        }
      } catch (error) {
        console.error('删除会话失败:', error)
      }
    },

    async sendMessage(content: string, type: MessageType = MessageType.TEXT) {
      if (!this.activeConvId || !content.trim()) return

      const userStore = useUserStore()
      const messageStore = useMessageStore()
      const currentUserId = userStore.userInfo?.id
      if (!currentUserId) return

      try {
        const msg = await messageStore.sendMessage({
          conversationId: this.activeConvId,
          senderId: currentUserId,
          type: type === MessageType.TEXT ? 'text' : 'file',
          content: content.trim()
        })

        const conv = this.conversations.find(c => c.id === this.activeConvId)
        if (conv) {
          const newMsg = {
            id: String(msg.id),
            senderId: currentUserId,
            senderName: userStore.userInfo?.username || '我',
            senderAvatar: userStore.userInfo?.avatar || '',
            content: msg.content,
            timestamp: msg.createdAt,
            isOwn: true,
            isRead: false, // 新发送的消息默认为未读（等待接收者查看）
            type: type
          }
          conv.messages.push(newMsg)
          conv.lastMessage = content.trim()
          conv.lastMessageTime = msg.createdAt
        }
      } catch (error) {
        console.error('发送消息失败:', error)
      }
    }
  },

  getters: {
    activeConversation: (state) => {
      return state.conversations.find(c => c.id === state.activeConvId) || null
    },
    groupedMessages: (state) => {
      const activeConv = state.conversations.find(c => c.id === state.activeConvId)
      if (!activeConv || !activeConv.messages) return []

      const groups: { date: string; messages: Message[] }[] = []
      activeConv.messages.forEach(msg => {
        const date = new Date(msg.timestamp).toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
        const lastGroup = groups[groups.length - 1]
        if (lastGroup && lastGroup.date === date) {
          lastGroup.messages.push(msg)
        } else {
          groups.push({ date, messages: [msg] })
        }
      })
      return groups
    }
  }
})
