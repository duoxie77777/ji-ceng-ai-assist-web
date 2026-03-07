
import { defineStore } from 'pinia';
import type { Conversation, Message, User, SearchResult } from '@/views/message/utils/chat';
import { nextTick } from 'vue';


function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return '未知日期';
  }

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const msgDateStr = date.toDateString();
  const todayStr = today.toDateString();
  const yesterdayStr = yesterday.toDateString();

  if (msgDateStr === todayStr) return '今天';
  if (msgDateStr === yesterdayStr) return '昨天';

  return `${date.getMonth() + 1}/${date.getDate()}`;
}
export const useChatStore = defineStore('chat', {
  state: () => ({
    conversations: [] as Conversation[],
    activeConvId: '' as string,
    showDetailPanel: false,
    searchKeyword: '' as string,
    searchResults: [] as SearchResult[],
    highlightMsgId: '' as string,
  }),

  actions: {
    // 初始化聊天数据
    initChatData() {
      try {
        const savedConversations = localStorage.getItem('chat_conversations');
        const savedActiveId = localStorage.getItem('chat_activeConvId');

        // 如果本地无数据，强制初始化默认数据
        if (!savedConversations) {
          const defaultUser1: User = {
            id: 'user-1',
            name: 'Matthew Anderson',
            avatar: 'https://robohash.org/user-1?size=150x150',
            email: 'mat_anderson@gmail.com',
            bio: 'Product Designer',
            phone: '(213) 555-1234',
            sex: '女',
            address: {
              country: 'United States of America'
            },
            isRead: false
          };

          const defaultUser2: User = {
            id: 'user-2',
            name: 'Ethan Johnson',
            avatar: 'https://robohash.org/user-2?size=150x150',
            email: 'ethan@example.com',
            bio: 'Developer',
            phone: '(213) 555-5678',
            sex: '男',
            address: {
              country: 'USA'
            },
            isRead: false
          };

          // 默认会话+消息
          this.conversations = [
            {
              id: 'conv-1',
              participant: defaultUser1,
              lastMessage: 'Hey there! 👋 I\'m new here...',
              lastMessageTime: this.formatTime(new Date()),
              unreadCount: 0,
              isActive: true,
              messages: [
                {
                  id: '1',
                  senderId: 'user-1',
                  senderName: 'Matthew Anderson',
                  senderAvatar: 'https://i.pravatar.cc/150?u=user-1',
                  content: 'Hey there! 👋 I\'m new here and I\'m really interested in the concept of tokenized real estate.',
                  timestamp: new Date('2024-06-20T17:00:00').toISOString(),
                  isOwn: false,
                  isRead: true,
                  type: 'text',
                },
                {
                  id: '2',
                  senderId: 'current-user',
                  senderName: 'John Wilson',
                  senderAvatar: 'https://i.pravatar.cc/150?u=me',
                  content: 'Hey Matthew, welcome! Tokenized real estate is a way to represent ownership in real estate properties using blockchain technology.',
                  timestamp: new Date('2024-06-20T17:20:00').toISOString(),
                  isOwn: true,
                  isRead: true,
                  type: 'text',
                },
                {
                  id: '3',
                  senderId: 'current-user',
                  senderName: 'John Wilson',
                  senderAvatar: 'https://i.pravatar.cc/150?u=me',
                  content: '',
                  timestamp: new Date('2024-06-21T09:15:00').toISOString(),
                  isOwn: true,
                  isRead: true,
                  type: 'file',
                  fileInfo: {
                    name: '房产代币化说明.pdf',
                    size: 204800,
                    url: '#',
                    type: 'application/pdf',
                  },
                },
              ],
            },
            {
              id: 'conv-2',
              participant: defaultUser2,
              lastMessage: 'Hi, John! I hope this message finds you well.',
              lastMessageTime: this.formatTime(new Date()),
              unreadCount: 1,
              isActive: false,
              messages: [
                {
                  id: '4',
                  senderId: 'user-2',
                  senderName: 'Ethan Johnson',
                  senderAvatar: 'https://i.pravatar.cc/150?u=user-2',
                  content: 'Hi, John! I hope this message finds you well.',
                  timestamp: new Date('2024-06-19T10:30:00').toISOString(),
                  isOwn: false,
                  isRead: false,
                  type: 'text',
                },
              ],
            },
          ];
          this.activeConvId = 'conv-1';
          this.saveChatData();
        } else {
          this.conversations = JSON.parse(savedConversations).map((conv: Conversation) => ({
            ...conv,
            isActive: conv.id === savedActiveId,
            messages: conv.messages.map((msg: Message) => ({
              ...msg,
              type: msg.type || 'text',
              isRead: msg.isRead || false,
              timestamp: msg.timestamp || new Date().toISOString(),
            })),
          }));
          this.activeConvId = savedActiveId || 'conv-1';
        }
      } catch (e) {
        console.error('初始化聊天数据失败：', e);
        // 出错时强制重置
        localStorage.removeItem('chat_conversations');
        localStorage.removeItem('chat_activeConvId');
        this.initChatData();
      }
    },

    // 保存数据
    saveChatData() {
      try {
        const safeConversations = JSON.parse(JSON.stringify(this.conversations));
        localStorage.setItem('chat_conversations', JSON.stringify(safeConversations));
        localStorage.setItem('chat_activeConvId', this.activeConvId);
      } catch (e) {
        console.error('保存聊天数据失败：', e);
      }
    },

    // 切换会话
    switchConversation(id: string) {
      this.conversations.forEach(conv => {
        conv.isActive = conv.id === id;
      });
      this.activeConvId = id;

      const conv = this.conversations.find(c => c.id === id);
      if (conv) {
        conv.messages.forEach(msg => {
          if (!msg.isOwn && !msg.isRead) {
            msg.isRead = true;
          }
        });
        conv.unreadCount = 0;
        this.saveChatData();
      }
    },

    // 发送文本消息（
    sendMessage(content: string) {
      if (!content.trim() || !this.activeConvId) return;

      const conv = this.conversations.find(c => c.id === this.activeConvId);
      if (!conv) return;

      const newMsg: Message = {
        id: Date.now().toString(),
        senderId: 'current-user',
        senderName: 'John Wilson',
        senderAvatar: 'https://i.pravatar.cc/150?u=me',
        content,
        timestamp: new Date().toISOString(),
        isOwn: true,
        isRead: true,
        type: 'text',
      };

      conv.messages.push(newMsg);
      conv.lastMessage = content;
      conv.lastMessageTime = this.formatTime(new Date());
      this.saveChatData();

      this.mockReply(conv.id);
    },

    sendFileMessage(file: File) {
      if (!file || !this.activeConvId) return;

      const conv = this.conversations.find(c => c.id === this.activeConvId);
      if (!conv) return;

      // 生成可下载/预览的本地URL
      const fileUrl = URL.createObjectURL(file);

      // 判断是否是图片文件
      const isImage = file.type.startsWith('image/');

      const newMsg: Message = {
        id: Date.now().toString(),
        senderId: 'current-user',
        senderName: 'John Wilson',
        senderAvatar: 'https://robohash.org/me?size=150x150',
        content: '',
        timestamp: new Date().toISOString(),
        isOwn: true,
        isRead: true,
        type: 'file',
        fileInfo: {
          name: file.name,
          size: file.size,
          url: fileUrl,
          type: file.type || 'application/octet-stream',
          isImage: isImage,
        },
      };

      conv.messages.push(newMsg);
      conv.lastMessage = isImage ? `[图片] ${file.name}` : `[文件] ${file.name}`;
      conv.lastMessageTime = this.formatTime(new Date());
      this.saveChatData();
    },

    // 模拟回复
    mockReply(convId: string) {
      setTimeout(() => {
        const conv = this.conversations.find(c => c.id === convId);
        if (!conv) return;

        const replyMsg: Message = {
          id: (Date.now() + 100).toString(),
          senderId: conv.participant.id,
          senderName: conv.participant.name,
          senderAvatar: conv.participant.avatar,
          content: `收到：${conv.messages.at(-1)?.content || conv.messages.at(-1)?.fileInfo?.name || '消息'}，我稍后回复你～`,
          timestamp: new Date().toISOString(),
          isOwn: false,
          isRead: conv.isActive, // 当前会话直接已读
          type: 'text',
        };

        conv.messages.push(replyMsg);
        conv.lastMessage = replyMsg.content;
        conv.lastMessageTime = this.formatTime(new Date());

        // 
        if (!conv.isActive) {
          conv.unreadCount += 1;
        }

        this.saveChatData(); // 
      }, 1000);
    },

    formatTime(date: Date) {
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${date.getHours()}:${minutes} ${date.getHours() >= 12 ? 'pm' : 'am'}`;
    },

    formatDate(dateStr: string) {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return '未知日期';
      }

      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const msgDateStr = date.toDateString();
      const todayStr = today.toDateString();
      const yesterdayStr = yesterday.toDateString();

      if (msgDateStr === todayStr) return '今天';
      if (msgDateStr === yesterdayStr) return '昨天';

      return `${date.getMonth() + 1}/${date.getDate()}`;
    },

    formatFileSize(bytes: number) {
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    },
    // 全局搜索（搜联系人+消息）
    searchChats(keyword: string) {
      this.searchKeyword = keyword.trim();
      this.searchResults = [];

      if (!this.searchKeyword) return;

      const lowerKeyword = this.searchKeyword.toLowerCase();

      this.conversations.forEach(conv => {
        const convName = conv.participant.name.toLowerCase();
        const results: SearchResult[] = [];

        // 1. 搜索联系人名称
        if (convName.includes(lowerKeyword)) {
          const matchText = conv.participant.name.replace(
            new RegExp(`(${this.searchKeyword})`, 'gi'),
            '<span class="highlight">$1</span>'
          );
          results.push({
            type: 'conversation',
            conversationId: conv.id,
            conversationName: conv.participant.name,
            matchText,
          });
        }

        // 2. 搜索聊天消息内容 
        conv.messages.forEach(msg => {
          let searchContent = '';
          if (msg.type === 'text') {
            searchContent = msg.content.toLowerCase();
          } else if (msg.type === 'file' && msg.fileInfo) {
            searchContent = msg.fileInfo.name.toLowerCase();
          }

          if (searchContent.includes(lowerKeyword)) {
            let matchContent = '';
            if (msg.type === 'text') {
              matchContent = msg.content.replace(
                new RegExp(`(${this.searchKeyword})`, 'gi'),
                '<span class="highlight">$1</span>'
              );
            } else if (msg.type === 'file' && msg.fileInfo) {
              matchContent = `[文件] ${msg.fileInfo.name.replace(
                new RegExp(`(${this.searchKeyword})`, 'gi'),
                '<span class="highlight">$1</span>'
              )}`;
            }

            results.push({
              type: 'message',
              conversationId: conv.id,
              conversationName: conv.participant.name,
              content: msg.type === 'text' ? msg.content : msg.fileInfo?.name,
              timestamp: msg.timestamp,
              matchText: matchContent,
              msgId: msg.id,
            });
          }
        });

        this.searchResults.push(...results);
      });
    },


    // 清空搜索
    clearSearch() {
      this.searchKeyword = '';
      this.searchResults = [];
    },
    setSingleMsgHighlight(msgId: string) {
      this.highlightMsgId = '';
      this.highlightMsgId = msgId;
      setTimeout(() => {
        this.highlightMsgId = '';
      }, 1000);
    },

    // 点击搜索结果，切换会话+定位消息
    selectSearchResult(result: SearchResult) {
      this.switchConversation(result.conversationId);
      this.clearSearch();

      nextTick(() => {
        if (result.type === 'message' && result.content && result.msgId) {
          window.dispatchEvent(new CustomEvent('scrollToMessage', {
            detail: {
              conversationId: result.conversationId,
              content: result.content,
              msgId: result.msgId,
            }
          }));
          this.setSingleMsgHighlight(result.msgId);
        }
      });
    },
  },




  getters: {
    // 当前激活的会话
    activeConversation: (state) => {
      return state.conversations.find(c => c.id === state.activeConvId) || state.conversations[0] || null;
    },

    // 分组消息
    groupedMessages() {
      const conv = this.activeConversation;
      if (!conv || !conv.messages || conv.messages.length === 0) {
        return [];
      }

      const groups: { date: string; messages: Message[] }[] = [];
      let currentDate = '';

      // 按时间排序（旧→新）
      const sortedMessages = [...conv.messages].sort((a, b) => {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      });

      sortedMessages.forEach(msg => {
        const msgDate = formatDate(msg.timestamp);

        if (msgDate !== currentDate) {
          currentDate = msgDate;
          groups.push({ date: currentDate, messages: [] });
        }

        const lastGroup = groups[groups.length - 1];
        if (lastGroup) {
          lastGroup.messages.push(msg);
        }
      });

      return groups;
    },
  }
});