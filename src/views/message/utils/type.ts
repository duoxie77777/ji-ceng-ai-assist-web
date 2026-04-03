// 消息类型
export const MessageType = {
  TEXT: 'text',
  FILE: 'file',
};
export type MessageType = typeof MessageType[keyof typeof MessageType];

// 文件类型
export const FileType = {
  PDF: 'pdf',
  IMAGE: 'image',
  UNKNOWN: 'unknown',
};
export type FileType = typeof FileType[keyof typeof FileType];

// 搜索结果类型
export const SearchResultType = {
  CONVERSATION: 'conversation',
  MESSAGE: 'message',
};
export type SearchResultType = typeof SearchResultType[keyof typeof SearchResultType];

// 路由名称
export const RouteName = {
  MESSAGE: 'message',
  CONTACT: 'contact',
};
export type RouteName = typeof RouteName[keyof typeof RouteName];

// 全局事件名称（用于组件通信）
export const GlobalEvent = {
  SCROLL_TO_MESSAGE: 'scrollToMessage',
};
export type GlobalEvent = typeof GlobalEvent[keyof typeof GlobalEvent];