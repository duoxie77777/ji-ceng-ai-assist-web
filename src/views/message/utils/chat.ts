// 用户信息
export interface User {
  id: string;
  name: string;
  avatar: string;
  email: string;
  bio: string;
  phone: string;
  sex: string;
  address: {
    country: string;
  };
  isRead: boolean;
}

// 单条消息
export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
  isRead: boolean;
  type: 'text' | 'file';
  fileInfo?: {
    name: string;
    size: number;
    url: string;
    type: string;
    isImage?: boolean; // 标记是否是图片
  };
}

export interface Conversation {
  id: string;
  participant: User;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
  isActive: boolean; // 标记是否是当前激活的会话
}


// 附件
export interface Attachment {
  id: string;
  name: string;
  type: 'pdf' | 'image';
  url: string;
}
// 搜索栏
export interface SearchResult {
  type: 'conversation' | 'message'; // 结果类型：会话/消息
  conversationId: string; // 所属会话ID
  conversationName: string; // 会话名称
  content?: string; // 消息内容（仅message类型有）
  timestamp?: string; // 消息时间（仅message类型有）
  matchText: string; // 高亮后的匹配文本
  msgId?: string;
}