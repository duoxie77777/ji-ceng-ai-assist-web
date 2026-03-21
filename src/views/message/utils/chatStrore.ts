import { defineStore } from 'pinia';
import type { Conversation, Message, User, SearchResult } from '@/views/message/utils/chat';
import { nextTick } from 'vue';
import {
  formatDate,
  formatTime,
  MESSAGE_TYPE,
  SEARCH_RESULT_TYPE,
  LAYOUT_CONST
} from '@/views/message/utils/chat';

// 聊天状态管理
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
    // 初始化聊天模拟数据
    initChatData() {
      try {
        // 模拟用户1
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

        // 模拟用户2
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

        // 初始化会话和消息
        this.conversations = [
          {
            id: 'conv-1',
            participant: defaultUser1,
            lastMessage: 'Hey there! 👋 I\'m new here...',
            lastMessageTime: formatTime(new Date().toISOString()),
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
                type: MESSAGE_TYPE.TEXT,
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
                type: MESSAGE_TYPE.TEXT,
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
                type: MESSAGE_TYPE.FILE,
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
            lastMessageTime: formatTime(new Date().toISOString()),
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
                type: MESSAGE_TYPE.TEXT,
              },
            ],
          },
        ];
        this.activeConvId = 'conv-1';
      } catch (e) {
        console.error('初始化Mock聊天数据失败：', e);
      }
    },

    // 保存聊天数据
    saveChatData() {
      console.log('后续对接后端API');
    },

    // 切换会话
    switchConversation(id: string) {
      this.conversations.forEach(conv => {
        conv.isActive = conv.id === id;
      });
      this.activeConvId = id;

      const conv = this.conversations.find(c => c.id === id);
      if (conv) {
        // 标记已读
        conv.messages.forEach(msg => {
          if (!msg.isOwn && !msg.isRead) {
            msg.isRead = true;
          }
        });
        conv.unreadCount = 0;
        this.saveChatData();
      }
    },

    // 发送文本消息
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
        type: MESSAGE_TYPE.TEXT,
      };

      conv.messages.push(newMsg);
      conv.lastMessage = content;
      conv.lastMessageTime = formatTime(new Date().toISOString());
      this.saveChatData();

      // 模拟回复
      this.mockReply(conv.id);
    },

    // 发送文件消息
    sendFileMessage(file: File, fileUrl?: string) {
      if (!file || !this.activeConvId) return;

      const conv = this.conversations.find(c => c.id === this.activeConvId);
      if (!conv) return;

      const url = fileUrl || URL.createObjectURL(file);
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
        type: MESSAGE_TYPE.FILE,
        fileInfo: {
          name: file.name,
          size: file.size,
          url,
          type: file.type || 'application/octet-stream',
          isImage,
        },
      };

      conv.messages.push(newMsg);
      conv.lastMessage = isImage ? `[图片] ${file.name}` : `[文件] ${file.name}`;
      conv.lastMessageTime = formatTime(new Date().toISOString());
      this.saveChatData();
    },

    // 模拟对方回复消息
    mockReply(convId: string) {
      setTimeout(() => {
        const conv = this.conversations.find(c => c.id === convId);
        if (!conv) return;

        const lastMsg = conv.messages.at(-1);
        const replyContent = `收到：${lastMsg?.content || lastMsg?.fileInfo?.name || '消息'}，我稍后回复你～`;

        const replyMsg: Message = {
          id: (Date.now() + 100).toString(),
          senderId: conv.participant.id,
          senderName: conv.participant.name,
          senderAvatar: conv.participant.avatar,
          content: replyContent,
          timestamp: new Date().toISOString(),
          isOwn: false,
          isRead: conv.isActive,
          type: MESSAGE_TYPE.TEXT,
        };

        conv.messages.push(replyMsg);
        conv.lastMessage = replyContent;
        conv.lastMessageTime = formatTime(new Date().toISOString());

        // 未激活会话增加未读数
        if (!conv.isActive) {
          conv.unreadCount += 1;
        }

        this.saveChatData();
      }, 1000);
    },

    // 格式化文件大小
    formatFileSize(bytes: number) {
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    },

    // 搜索会话/消息
    searchChats(keyword: string) {
      this.searchKeyword = keyword.trim();
      this.searchResults = [];

      if (!this.searchKeyword) return;

      const lowerKeyword = this.searchKeyword.toLowerCase();

      this.conversations.forEach(conv => {
        const convName = conv.participant.name.toLowerCase();
        const results: SearchResult[] = [];

        // 搜索联系人名称
        if (convName.includes(lowerKeyword)) {
          const matchText = conv.participant.name.replace(
            new RegExp(`(${this.searchKeyword})`, 'gi'),
            '<span class="highlight">$1</span>'
          );
          results.push({
            type: SEARCH_RESULT_TYPE.CONVERSATION,
            conversationId: conv.id,
            conversationName: conv.participant.name,
            matchText,
          });
        }

        // 搜索消息内容/文件名
        conv.messages.forEach(msg => {
          let searchContent = '';
          if (msg.type === MESSAGE_TYPE.TEXT) {
            searchContent = msg.content.toLowerCase();
          } else if (msg.type === MESSAGE_TYPE.FILE && msg.fileInfo) {
            searchContent = msg.fileInfo.name.toLowerCase();
          }

          if (searchContent.includes(lowerKeyword)) {
            let matchContent = '';
            if (msg.type === MESSAGE_TYPE.TEXT) {
              matchContent = msg.content.replace(
                new RegExp(`(${this.searchKeyword})`, 'gi'),
                '<span class="highlight">$1</span>'
              );
            } else if (msg.type === MESSAGE_TYPE.FILE && msg.fileInfo) {
              matchContent = `[文件] ${msg.fileInfo.name.replace(
                new RegExp(`(${this.searchKeyword})`, 'gi'),
                '<span class="highlight">$1</span>'
              )}`;
            }

            results.push({
              type: SEARCH_RESULT_TYPE.MESSAGE,
              conversationId: conv.id,
              conversationName: conv.participant.name,
              content: msg.type === MESSAGE_TYPE.TEXT ? msg.content : msg.fileInfo?.name,
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

    // 高亮指定消息
    setSingleMsgHighlight(msgId: string) {
      this.highlightMsgId = msgId;
      setTimeout(() => {
        this.highlightMsgId = '';
      }, LAYOUT_CONST.HIGHLIGHT_DURATION);
    },

    // 选择搜索结果（切换会话+定位消息）
    selectSearchResult(result: SearchResult) {
      this.switchConversation(result.conversationId);
      this.clearSearch();

      nextTick(() => {
        if (result.type === SEARCH_RESULT_TYPE.MESSAGE && result.content && result.msgId) {
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
    // 获取当前激活的会话
    activeConversation: (state) => {
      return state.conversations.find(c => c.id === state.activeConvId) || state.conversations[0] || null;
    },

    // 消息按日期分组
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
        lastGroup?.messages.push(msg);
      });

      return groups;
    },
  }
});