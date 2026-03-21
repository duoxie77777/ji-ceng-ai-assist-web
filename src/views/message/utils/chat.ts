// 定义用户信息接口
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

// 单条消息接口
export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
  isRead: boolean;
  type: typeof MESSAGE_TYPE.TEXT | typeof MESSAGE_TYPE.FILE;
  fileInfo?: {
    name: string;
    size: number;
    url: string;
    type: string;
    isImage?: boolean; // 是否为图片文件
  };
}

// 会话接口
export interface Conversation {
  id: string;
  participant: User;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
  isActive: boolean;
}

// 用户信息标签常量
export const USER_INFO_LABEL = {
  NAME: '姓名',
  BIO: '职业',
  PHONE: '电话',
  SEX: '性别',
  COUNTRY: '城市/国家',
  UNFILLED: '未填写',
};

// UI文本常量
export const UI_TEXT = {
  BASIC_INFO: '基本信息',
  ADDRESS_INFO: '住址信息',
  FILE_NAME: '文件名',
  DOWNLOAD: '下载',
  MESSAGE_PLACEHOLDER: 'Write your message...',
  SEARCH_PLACEHOLDER: 'Search conversations or messages...',
  NO_SEARCH_RESULT: '没有找到 "{{keyword}}" 相关内容',
};

// 布局相关常量
export const LAYOUT_CONST = {
  TIP_DISAPPEAR_TIME: 3000, // 提示消失时间(ms)
  HIGHLIGHT_DURATION: 1000, // 消息高亮时长(ms)
  HIGHLIGHT_ACTIVE_DURATION: 2000, // 搜索结果高亮时长
};

// CSS类名常量
export const CSS_CLASS_NAME = {
  INFO_LABEL: 'info-label',
  INFO_VALUE: 'info-value',
  MESSAGE_BUBBLE: 'message-bubble',
  MSG_FLASH: 'msg-flash',
};

// 附件接口
export interface Attachment {
  id: string;
  name: string;
  type: typeof FILE_TYPE.PDF | typeof FILE_TYPE.IMAGE | typeof FILE_TYPE.UNKNOWN;
  url: string;
}

// 搜索结果接口
export interface SearchResult {
  type: typeof SEARCH_RESULT_TYPE.CONVERSATION | typeof SEARCH_RESULT_TYPE.MESSAGE;
  conversationId: string;
  conversationName: string;
  content?: string;
  timestamp?: string;
  matchText: string;
  msgId?: string;
}

// 消息类型常量
export const MESSAGE_TYPE = {
  TEXT: 'text' as const,
  FILE: 'file' as const,
};

// 文件类型常量
export const FILE_TYPE = {
  PDF: 'pdf' as const,
  IMAGE: 'image' as const,
  UNKNOWN: 'unknown' as const,
};

// 搜索结果类型常量
export const SEARCH_RESULT_TYPE = {
  CONVERSATION: 'conversation' as const,
  MESSAGE: 'message' as const,
};

// 状态文本常量
export const STATUS_TEXT = {
  UNKNOWN_CONTACT: '未知联系人',
  EMPTY_MESSAGE: '暂无聊天记录，开始聊聊吧～',
  UNKNOWN_FILE: '未知文件',
  READ: '✓✓ 已读',
  UNREAD: '✓ 未读',
  DOWNLOAD_FILE: '下载文件',
  EMPTY_MESSAGE_TIP: '发送消息不能为空',
};

// 附件名称常量
export const ATTACHMENT_NAME = {
  BILLING_ISSUE: 'Billing issue',
  PURCHASE_ORDER_RECEIPT: 'Purchase order receipt',
};

// 时间格式常量
export const TIME_FORMAT = {
  MESSAGE_TIMER: 'hh:mm a',
  HOUR_12_MARK: {
    AM: 'am',
    PM: 'pm',
  },
  SIDEBAR_TIME: 'MM/DD hh:mm',
};

// 格式化日期（今日/昨日/月/日）
export const formatDate = (dateStr: string): string => {
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
};

/**
 * 统一时间格式化函数
 * @param iso 
 * @param formatType
 */
export const formatTime = (iso: string | undefined, formatType: 'message' | 'sidebar' = 'message'): string => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '未知时间';

  if (formatType === 'sidebar') {
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${month}/${day} ${hours}:${minutes}`;
  }

  const hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const period = hours >= 12 ? TIME_FORMAT.HOUR_12_MARK.PM : TIME_FORMAT.HOUR_12_MARK.AM;
  return `${hours}:${minutes} ${period}`;
};