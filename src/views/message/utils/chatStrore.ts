import { defineStore } from 'pinia'
import type { Conversation, Message, User, SearchResult } from './chat'
import { MessageType, SearchResultType, GlobalEvent } from './type'
import { formatDate, formatTime } from './chat'
import { nextTick } from 'vue'
import { useMessageStore } from '@/store/modules/message/useMessageStore'
import { useUserStore } from '@/store/modules/user'
import { userApi } from '@/api/user/user'
import { contactsApi } from '@/api/contacts/contacts'

const getCurrentUserId = (): number => {
  const userStore = useUserStore()
  const userId = userStore.userInfo?.id
  console.error('=== [用户 ID 调试] ===')
  console.error('userInfo:', userStore.userInfo)
  console.error('userId:', userId)
  console.error('userId 类型:', typeof userId)
  console.error('=====================')
  return userId || 0
}

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substring(2, 6)
}

function getLastMessageTime(messages: Message[]): string {
  if (messages.length === 0) return new Date().toISOString()
  const lastMessage = messages[messages.length - 1]
  return lastMessage?.timestamp || new Date().toISOString()
}

export const useChatStore = defineStore('chat', {
  state: () => ({
    conversations: [] as Conversation[],
    activeConvId: '' as string | number,
    showDetailPanel: false,
    searchKeyword: '' as string,
    searchResults: [] as SearchResult[],
    highlightMsgId: '' as string
  }),

  actions: {
    async initChatData() {
      const messageStore = useMessageStore()
      const userStore = useUserStore()
      const currentUserId = getCurrentUserId()
      
      console.error('=== [初始化聊天数据] ===')
      console.error('当前用户 ID:', currentUserId)
      console.error('当前用户信息:', userStore.userInfo)
      
      if (!currentUserId || currentUserId === 0) {
        console.error('错误：用户未登录')
        return
      }
      
      try {
        // 获取好友列表以获取正确的头像和昵称
        const friends = await contactsApi.getFriends(currentUserId)
        console.error('好友列表:', friends)
        
        await messageStore.fetchConversations(currentUserId)
        console.error('后端返回的会话列表:', messageStore.conversations)
        
        this.conversations = messageStore.conversations.map(conv => {
          // 重要：找出对话的另一方（不是当前用户的那个人）
          const isCreator = conv.creatorId === currentUserId
          const otherUserId = isCreator ? conv.participantId : conv.creatorId
          
          // 从好友列表中查找匹配的参与者信息
          const friend = friends?.find(f => f.friendId === otherUserId || f.userId === otherUserId)
          
          console.error(`处理会话 ${conv.id}:`, {
            conv,
            otherUserId,
            friend,
            participantName: friend?.remark || friend?.friend?.username || conv.participant?.username || '未知用户'
          })
          
          return {
            id: conv.id,
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
        
        console.error('处理后的会话列表:', this.conversations)
      } catch (error) {
        console.error('初始化会话列表失败:', error)
      }
      
      if (this.conversations.length > 0) {
        this.activeConvId = this.conversations[0].id
        this.conversations[0].isActive = true
        await this.loadMessages(this.activeConvId)
      }
    },

    async loadMessages(conversationId: string | number) {
      const messageStore = useMessageStore()
      const currentUserId = getCurrentUserId()
      
      // 将 ID 转换为数字（去除 "conv-" 前缀）
      const convId = typeof conversationId === 'string' 
        ? parseInt(conversationId.replace('conv-', ''), 10)
        : conversationId
        
      await messageStore.fetchMessages(convId)
      
      const conv = this.conversations.find(c => c.id === conversationId)
      if (conv && messageStore.messages.length > 0) {
        conv.messages = messageStore.messages.map(msg => {
          const isOwn = msg.senderId === currentUserId
          
          // 已读状态判断逻辑：
          // 1. 自己发送的消息 - 始终显示已读
          // 2. 他人的消息 - 根据是否已查看判断
          const isRead = isOwn || (msg as any).isRead || false
          
          return {
            id: msg.id,
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
        
        // 更新会话的未读数
        const unreadCount = conv.messages.filter(m => !m.isOwn && !m.isRead).length
        conv.unreadCount = unreadCount
      }
    },

    async activateOrCreateConversation(userId: string | number): Promise<Conversation | null> {
      const messageStore = useMessageStore()
      const userStore = useUserStore()
      const numericUserId = typeof userId === 'string' ? parseInt(userId) : userId
      
      const currentUserId = getCurrentUserId()
      
      if (!currentUserId || currentUserId === 0) {
        console.error('错误：用户未登录')
        return null
      }
      
      // 先查找是否已经存在与这个用户的会话
      let conv = this.conversations.find(c => c.participant.id === numericUserId)
      
      if (!conv) {
        try {
          // 先获取好友列表，获取正确的用户信息
          const friends = await contactsApi.getFriends(currentUserId)
          const friend = friends?.find(f => f.friendId === numericUserId)
          
          const newConv = await messageStore.createConversation({
            type: 'private',
            creatorId: currentUserId,
            participantId: numericUserId
          })
          
          if (newConv) {
            // 从好友列表中获取参与者信息（优先使用好友信息）
            conv = {
              id: newConv.id,
              participant: {
                id: numericUserId,
                name: friend?.remark || friend?.friend?.username || newConv.participant?.username || '新会话',
                avatar: friend?.friend?.avatar || newConv.participant?.avatar || '',
                email: friend?.friend?.email || newConv.participant?.email || '',
                bio: '',
                phone: friend?.friend?.phone || newConv.participant?.phone || '',
                sex: '',
                address: { country: '中国' },
                company: friend?.friend?.department || newConv.participant?.department || '',
                department: friend?.friend?.department || newConv.participant?.department || '',
                position: friend?.friend?.position || newConv.participant?.position || '',
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
          console.error('创建会话失败:', error)
          console.error('错误详情:', error.response?.data)
          throw error
        }
      }
      
      if (conv) {
        this.switchConversation(conv.id)
      }
      
      return conv
    },

    getUserById(id: string | number): User | null {
      return null
    },

    createConversation(user: User): Conversation {
      const now = new Date().toISOString()
      const newConv: Conversation = {
        id: user.id, // 直接使用用户 ID 作为会话 ID（临时）
        participant: user,
        lastMessage: '',
        lastMessageTime: now,
        unreadCount: 0,
        isActive: true,
        messages: []
      }
      this.conversations.unshift(newConv)
      return newConv
    },

    async switchConversation(id: string | number) {
      const messageStore = useMessageStore()
      const currentUserId = getCurrentUserId()
      
      this.conversations.forEach(conv => {
        conv.isActive = conv.id === id
      })
      this.activeConvId = id

      const conv = this.conversations.find(c => c.id === id)
      if (conv) {
        if (!conv.messages || conv.messages.length === 0) {
          await this.loadMessages(id)
        }
        
        // 将他人的未读消息标记为已读
        if (conv.messages) {
          conv.messages.forEach(msg => {
            if (!msg.isOwn && !msg.isRead) {
              msg.isRead = true
            }
          })
        }
        
        // 立即清除未读数（不需要等待后端 API）
        conv.unreadCount = 0
        
        // 将 ID 转换为数字（去除 "conv-" 前缀）
        const convId = typeof id === 'string' 
          ? parseInt(id.replace('conv-', ''), 10)
          : id
        
        // 异步调用后端 API，不阻塞 UI 更新
        messageStore.markAsRead(convId, currentUserId).catch(err => {
          console.error('标记已读失败:', err)
        })
      }
    },

    async deleteConversation(conversationId: string | number) {
      const messageStore = useMessageStore()
      const currentUserId = getCurrentUserId()
      
      // 找到会话，获取会话的创建者 ID 或参与者 ID
      const conversation = this.conversations.find(c => c.id === conversationId)
      if (!conversation) {
        throw new Error('会话不存在')
      }
      
      // 使用会话的 creatorId 作为 userId（因为后端检查的是这个）
      const deleteUserId = conversation.creatorId || currentUserId
      
      console.log('=== [删除会话调试] ===')
      console.log('conversationId:', conversationId)
      console.log('currentUserId:', currentUserId)
      console.log('conversation.creatorId:', conversation.creatorId)
      console.log('deleteUserId:', deleteUserId)
      console.log('=====================')
      
      if (!deleteUserId || deleteUserId === 0) {
        throw new Error('用户未登录或用户 ID 无效')
      }
      
      try {
        // 将 ID 转换为纯数字（去除 "conv-" 前缀）
        const convId = typeof conversationId === 'string' 
          ? parseInt(conversationId.replace('conv-', ''), 10)
          : Number(conversationId)
        
        console.log('删除会话，convId:', convId, 'userId:', deleteUserId)
        await messageStore.deleteConversation(convId, deleteUserId)
        
        // 从本地状态中移除
        this.conversations = this.conversations.filter(c => c.id !== conversationId)
        
        // 如果删除的是当前会话，清空 activeConvId
        if (this.activeConvId === conversationId) {
          this.activeConvId = ''
          this.showDetailPanel = false
        }
      } catch (error: any) {
        console.error('删除会话失败:', error)
        throw error
      }
    },

    async sendMessage(content: string) {
      if (!content.trim() || !this.activeConvId) return

      const messageStore = useMessageStore()
      const conv = this.conversations.find(c => c.id === this.activeConvId)
      if (!conv) return

      try {
        // 将 ID 转换为数字（去除 "conv-" 前缀）
        const convId = typeof this.activeConvId === 'string' 
          ? parseInt(this.activeConvId.replace('conv-', ''), 10)
          : this.activeConvId

        const newMsg = await messageStore.sendMessage({
          conversationId: convId,
          senderId: getCurrentUserId(),
          type: 'text',
          content: content.trim()
        })

        const msg: Message = {
          id: newMsg.id,
          senderId: newMsg.senderId,
          senderName: '我',
          senderAvatar: '',
          content: content.trim(),
          timestamp: newMsg.createdAt,
          isOwn: true,
          isRead: true,
          type: MessageType.TEXT
        }

        conv.messages.push(msg)
        conv.lastMessage = content.trim()
        conv.lastMessageTime = msg.timestamp

        window.dispatchEvent(new CustomEvent(GlobalEvent.MESSAGE_SENT, {
          detail: { conversationId: this.activeConvId, message: msg }
        }))
      } catch (error) {
        console.error('发送消息失败:', error)
      }
    },

    async sendFileMessage(file: File, fileUrl?: string) {
      if (!this.activeConvId) return

      const messageStore = useMessageStore()
      const conv = this.conversations.find(c => c.id === this.activeConvId)
      if (!conv) return

      const url = fileUrl || URL.createObjectURL(file)
      const isImage = file.type.startsWith('image/')

      try {
        // 将 ID 转换为数字（去除 "conv-" 前缀）
        const convId = typeof this.activeConvId === 'string' 
          ? parseInt(this.activeConvId.replace('conv-', ''), 10)
          : this.activeConvId

        const uploadedFile = await messageStore.uploadFile(file, getCurrentUserId(), convId)
        
        const newMsg = await messageStore.sendMessage({
          conversationId: convId,
          senderId: getCurrentUserId(),
          type: 'file',
          content: file.name,
          fileId: uploadedFile.id
        })

        const msg: Message = {
          id: newMsg.id,
          senderId: newMsg.senderId,
          senderName: '我',
          senderAvatar: '',
          content: '',
          timestamp: newMsg.createdAt,
          isOwn: true,
          isRead: true,
          type: MessageType.FILE,
          fileInfo: {
            name: file.name,
            size: file.size,
            url,
            type: file.type,
            isImage
          }
        }

        conv.messages.push(msg)
        conv.lastMessage = isImage ? `[图片] ${file.name}` : `[文件] ${file.name}`
        conv.lastMessageTime = msg.timestamp

        window.dispatchEvent(new CustomEvent(GlobalEvent.MESSAGE_SENT, {
          detail: { conversationId: this.activeConvId, message: msg }
        }))
      } catch (error) {
        console.error('发送文件失败:', error)
      }
    },

    searchChats(keyword: string) {
      this.searchKeyword = keyword.trim()
      this.searchResults = []
      if (!this.searchKeyword) return

      const lowerKeyword = this.searchKeyword.toLowerCase()
      this.conversations.forEach(conv => {
        const convName = conv.participant.name.toLowerCase()
        const results: SearchResult[] = []

        if (convName.includes(lowerKeyword)) {
          const matchText = conv.participant.name.replace(
            new RegExp(`(${this.searchKeyword})`, 'gi'),
            '<span class="highlight">$1</span>'
          )
          results.push({
            type: SearchResultType.CONVERSATION,
            conversationId: conv.id,
            conversationName: conv.participant.name,
            matchText
          })
        }

        conv.messages.forEach(msg => {
          let searchContent = ''
          if (msg.type === MessageType.TEXT) {
            searchContent = msg.content.toLowerCase()
          } else if (msg.type === MessageType.FILE && msg.fileInfo) {
            searchContent = msg.fileInfo.name.toLowerCase()
          }

          if (searchContent.includes(lowerKeyword)) {
            let matchContent = ''
            if (msg.type === MessageType.TEXT) {
              matchContent = msg.content.replace(
                new RegExp(`(${this.searchKeyword})`, 'gi'),
                '<span class="highlight">$1</span>'
              )
            } else if (msg.type === MessageType.FILE && msg.fileInfo) {
              matchContent = `[文件] ${msg.fileInfo.name.replace(
                new RegExp(`(${this.searchKeyword})`, 'gi'),
                '<span class="highlight">$1</span>'
              )}`
            }
            results.push({
              type: SearchResultType.MESSAGE,
              conversationId: conv.id,
              conversationName: conv.participant.name,
              content: msg.type === MessageType.TEXT ? msg.content : msg.fileInfo?.name,
              timestamp: msg.timestamp,
              matchText: matchContent,
              msgId: msg.id
            })
          }
        })
        this.searchResults.push(...results)
      })
    },

    clearSearch() {
      this.searchKeyword = ''
      this.searchResults = []
    },

    setMessageHighlight(msgId: string) {
      this.highlightMsgId = msgId
    },

    clearMessageHighlight() {
      this.highlightMsgId = ''
    },

    selectSearchResult(result: SearchResult) {
      this.switchConversation(result.conversationId)

      nextTick(() => {
        if (result.type === SearchResultType.MESSAGE && result.msgId) {
          window.dispatchEvent(new CustomEvent(GlobalEvent.SCROLL_TO_MESSAGE, {
            detail: {
              conversationId: result.conversationId,
              msgId: result.msgId,
              content: result.content
            }
          }))
          this.setMessageHighlight(result.msgId)
        }
      })
    }
  },

  getters: {
    activeConversation: (state) => {
      return state.conversations.find(c => c.id === state.activeConvId) || state.conversations[0] || null
    },

    groupedMessages: (state) => {
      const conv = state.conversations.find(c => c.id === state.activeConvId)
      if (!conv || !conv.messages.length) return []

      const groups: { date: string; messages: Message[] }[] = []
      let currentDate = ''

      const sortedMessages = [...conv.messages].sort((a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      )

      sortedMessages.forEach(msg => {
        const msgDate = formatDate(msg.timestamp)
        if (msgDate !== currentDate) {
          currentDate = msgDate
          groups.push({ date: currentDate, messages: [] })
        }
        groups[groups.length - 1].messages.push(msg)
      })
      return groups
    }
  }
})
