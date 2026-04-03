
import { defineStore } from 'pinia'
import type { Conversation, Message, User, SearchResult } from './chat'
import { MessageType, SearchResultType, GlobalEvent } from './type'
import { formatDate, formatTime } from './chat'
import { nextTick } from 'vue'

// 生成简单 ID
function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substring(2, 6)
}

// 辅助函数：获取会话最后一条消息的时间
function getLastMessageTime(messages: Message[]): string {
  if (messages.length === 0) return new Date().toISOString()
  const lastMessage = messages[messages.length - 1]
  return lastMessage?.timestamp || new Date().toISOString()
}

export const useChatStore = defineStore('chat', {
  state: () => ({
    conversations: [] as Conversation[],
    activeConvId: '' as string,
    showDetailPanel: false,
    searchKeyword: '' as string,
    searchResults: [] as SearchResult[],
    highlightMsgId: '' as string
  }),

  actions: {
    // 初始化模拟数据
    initChatData() {
      const mockUser1: User = {
        id: 'user-1',
        name: '陈',
        avatar: 'https://robohash.org/user-1?size=150x150',
        email: 'chenj@data.gov',
        bio: '陈局',
        phone: '13800138001',
        sex: '女',
        address: { country: '中国' },
        company: '市数据局',
        department: 'AI 应用处',
        position: '陈局',
        relation: '本局'
      }

      const mockUser2: User = {
        id: 'user-2',
        name: '程',
        avatar: 'https://robohash.org/user-2?size=150x150',
        email: 'chengyy@data.gov',
        bio: '法规专员',
        phone: '13800138002',
        sex: '女',
        address: { country: '中国' },
        company: '市数据局',
        department: '政策法规处',
        position: '法规专员',
        relation: '本局'
      }

      const messagesConv1: Message[] = [
        {
          id: '1',
          senderId: 'user-1',
          senderName: '陈',
          senderAvatar: mockUser1.avatar,
          content: '你好，欢迎加入政务协同平台！',
          timestamp: new Date('2026-04-01T10:00:00').toISOString(),
          isOwn: false,
          isRead: true,
          type: MessageType.TEXT
        },
        {
          id: '2',
          senderId: 'current-user',
          senderName: '我',
          senderAvatar: 'https://robohash.org/me?size=150x150',
          content: '谢谢，请多关照！',
          timestamp: new Date('2026-04-01T10:05:00').toISOString(),
          isOwn: true,
          isRead: true,
          type: MessageType.TEXT
        }
      ]

      const messagesConv2: Message[] = [
        {
          id: '3',
          senderId: 'user-2',
          senderName: '程',
          senderAvatar: mockUser2.avatar,
          content: '请查收最新政策文件',
          timestamp: new Date('2026-04-02T09:00:00').toISOString(), // 早上 9 点
          isOwn: false,
          isRead: false,
          type: MessageType.TEXT
        }
      ]

      this.conversations = [
        {
          id: 'conv-1',
          participant: mockUser1,
          lastMessage: messagesConv1[messagesConv1.length - 1].content,
          lastMessageTime: getLastMessageTime(messagesConv1),
          unreadCount: 0,
          isActive: true,
          messages: messagesConv1
        },
        {
          id: 'conv-2',
          participant: mockUser2,
          lastMessage: messagesConv2[messagesConv2.length - 1].content,
          lastMessageTime: getLastMessageTime(messagesConv2),
          unreadCount: 1,
          isActive: false,
          messages: messagesConv2
        }
      ]
      this.activeConvId = 'conv-1'
    },

    // 根据用户 ID 查找或创建会话（供通讯录跳转使用）
    activateOrCreateConversation(userId: string | number): Conversation | null {
      let conv = this.conversations.find(c => c.participant.id === String(userId))
      if (!conv) {
        const user = this.getUserById(userId)
        if (!user) return null
        conv = this.createConversation(user)
      }
      this.switchConversation(conv.id)
      return conv
    },

    // 模拟从全局获取用户
    getUserById(id: string | number): User | null {
      const mockUsers: User[] = [
        {
          id: '1', name: '陈', avatar: 'https://robohash.org/1?size=150x150',
          email: 'chenj@data.gov', bio: '陈局', phone: '13800138001',
          sex: '女', address: { country: '中国' }, company: '市数据局',
          department: 'AI 应用处', position: '陈局', relation: '本局'
        },
        {
          id: '2', name: '程', avatar: 'https://robohash.org/2?size=150x150',
          email: 'chengyy@data.gov', bio: '法规专员', phone: '13800138002',
          sex: '女', address: { country: '中国' }, company: '市数据局',
          department: '政策法规处', position: '法规专员', relation: '本局'
        }
      ]
      return mockUsers.find(u => u.id === String(id)) || null
    },

    // 创建新会话
    createConversation(user: User): Conversation {
      const now = new Date().toISOString()
      const newConv: Conversation = {
        id: `conv-${generateId()}`,
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

    // 切换会话
    switchConversation(id: string) {
      this.conversations.forEach(conv => {
        conv.isActive = conv.id === id
      })
      this.activeConvId = id

      const conv = this.conversations.find(c => c.id === id)
      if (conv) {
        // 标记所有收到的消息为已读
        conv.messages.forEach(msg => {
          if (!msg.isOwn && !msg.isRead) {
            msg.isRead = true
          }
        })
        conv.unreadCount = 0
      }
    },

    // 发送文本消息
    sendMessage(content: string) {
      if (!content.trim() || !this.activeConvId) return

      const conv = this.conversations.find(c => c.id === this.activeConvId)
      if (!conv) return

      const newMsg: Message = {
        id: generateId(),
        senderId: 'current-user',
        senderName: '我',
        senderAvatar: 'https://robohash.org/me?size=150x150',
        content: content.trim(),
        timestamp: new Date().toISOString(),
        isOwn: true,
        isRead: true,
        type: MessageType.TEXT
      }

      conv.messages.push(newMsg)
      conv.lastMessage = content.trim()
      conv.lastMessageTime = newMsg.timestamp  // 使用实际消息时间戳

      // 触发自定义事件，通知外部有新消息
      window.dispatchEvent(new CustomEvent(GlobalEvent.MESSAGE_SENT, {
        detail: { conversationId: this.activeConvId, message: newMsg }
      }))
    },

    // 发送文件消息
    sendFileMessage(file: File, fileUrl?: string) {
      if (!this.activeConvId) return

      const conv = this.conversations.find(c => c.id === this.activeConvId)
      if (!conv) return

      const url = fileUrl || URL.createObjectURL(file)
      const isImage = file.type.startsWith('image/')

      const newMsg: Message = {
        id: generateId(),
        senderId: 'current-user',
        senderName: '我',
        senderAvatar: 'https://robohash.org/me?size=150x150',
        content: '',
        timestamp: new Date().toISOString(),
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

      conv.messages.push(newMsg)
      conv.lastMessage = isImage ? `[图片] ${file.name}` : `[文件] ${file.name}`
      conv.lastMessageTime = newMsg.timestamp

      window.dispatchEvent(new CustomEvent(GlobalEvent.MESSAGE_SENT, {
        detail: { conversationId: this.activeConvId, message: newMsg }
      }))
    },

    // 搜索会话与消息
    searchChats(keyword: string) {
      this.searchKeyword = keyword.trim()
      this.searchResults = []
      if (!this.searchKeyword) return

      const lowerKeyword = this.searchKeyword.toLowerCase()
      this.conversations.forEach(conv => {
        const convName = conv.participant.name.toLowerCase()
        const results: SearchResult[] = []

        // 匹配联系人
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

        // 匹配消息
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

    // 清空搜索
    clearSearch() {
      this.searchKeyword = ''
      this.searchResults = []
    },

    // 高亮消息
    setMessageHighlight(msgId: string) {
      this.highlightMsgId = msgId
    },

    // 清除高亮
    clearMessageHighlight() {
      this.highlightMsgId = ''
    },

    // 选择搜索结果并跳转
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
    // 当前激活的会话
    activeConversation: (state) => {
      return state.conversations.find(c => c.id === state.activeConvId) || state.conversations[0] || null
    },

    // 按日期分组的消息列表
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