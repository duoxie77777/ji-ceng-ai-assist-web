import { get, post, put, del } from '@/utils/request'

export interface Friend {
  id: number
  userId: number
  friendId: number
  friend: {
    id: number
    username: string
    avatar?: string
    department?: string
    position?: string
    email?: string
    phone?: string
  }
  remark?: string
  relation?: string
  isBlocked: boolean
  createdAt: string
  updatedAt: string
}

export interface FriendRequest {
  id: number
  fromUserId: number
  toUserId: number
  fromUser: {
    id: number
    username: string
    avatar?: string
    department?: string
  }
  message?: string
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: string
  updatedAt: string
}

export interface ContactGroup {
  id: number
  userId: number
  name: string
  description?: string
  createdAt: string
  updatedAt: string
}

export interface ChatGroup {
  id: number
  name: string
  description?: string
  ownerId: number
  owner?: any
  avatarUrl?: string
  maxMembers: number
  createdAt: string
  updatedAt: string
}

export interface ChatGroupMember {
  id: number
  chatGroupId: number
  userId: number
  user: {
    id: number
    username: string
    avatar?: string
  }
  role: 'owner' | 'admin' | 'member'
  nickname?: string
  createdAt: string
}

export const contactsApi = {
  getFriends: (userId: number, keyword?: string) =>
    get<Friend[]>(`/contacts/friends/${userId}`, { params: { keyword } }),

  addFriend: (data: { userId: number; friendId: number; remark?: string; relation?: string }) =>
    post<Friend>('/contacts/friends', data),

  deleteFriend: (id: number, userId: number) =>
    del<void>(`/contacts/friends/${id}`, { userId }),

  getFriendDetail: (id: number) =>
    get<Friend>(`/contacts/friends/detail/${id}`),

  updateFriend: (id: number, data: { remark?: string; relation?: string }) =>
    put<Friend>(`/contacts/friends/${id}`, data),

  getFriendRequests: (userId: number) =>
    get<FriendRequest[]>(`/contacts/requests/${userId}`),

  sendFriendRequest: (data: { fromUserId: number; toUserId: number; message?: string }) =>
    post<FriendRequest>('/contacts/requests', data),

  acceptFriendRequest: (id: number, userId: number) => {
    console.error('=== [API] 同意好友申请 ===')
    console.error('申请表 ID:', id)
    console.error('当前用户 ID:', userId)
    console.error('请求 URL:', `/contacts/requests/${id}/accept`)
    console.error('请求 Body:', { userId })
    return post<void>(`/contacts/requests/${id}/accept`, { userId })
  },

  rejectFriendRequest: (id: number, userId: number) => {
    console.error('=== [API] 拒绝好友申请 ===')
    console.error('申请表 ID:', id)
    console.error('当前用户 ID:', userId)
    console.error('请求 URL:', `/contacts/requests/${id}/reject`)
    console.error('请求 Body:', { userId })
    return post<void>(`/contacts/requests/${id}/reject`, { userId })
  },

  getGroups: (userId: number) =>
    get<ContactGroup[]>(`/contacts/groups/${userId}`),

  createGroup: (data: { userId: number; name: string; description?: string }) =>
    post<ContactGroup>('/contacts/groups', data),

  updateGroup: (id: number, data: { name?: string; description?: string }) =>
    put<ContactGroup>(`/contacts/groups/${id}`, data),

  deleteGroup: (id: number, userId: number) =>
    del<void>(`/contacts/groups/${id}`, { userId }),

  addFriendToGroup: (groupId: number, friendId: number) =>
    post<void>(`/contacts/groups/${groupId}/members`, { friendId }),

  removeFriendFromGroup: (groupId: number, friendId: number) =>
    del<void>(`/contacts/groups/${groupId}/members/${friendId}`),

  getFriendGroups: (friendId: number) =>
    get<ContactGroup[]>(`/contacts/friends/${friendId}/groups`),

  getChatGroups: (userId: number) =>
    get<ChatGroup[]>(`/contacts/chat-groups/${userId}`),

  createChatGroup: (data: { name: string; ownerId: number; description?: string; memberIds?: number[] }) =>
    post<ChatGroup>('/contacts/chat-groups', data),

  joinChatGroup: (id: number, userId: number) =>
    post<void>(`/contacts/chat-groups/${id}/join`, { userId }),

  leaveChatGroup: (id: number, userId: number) =>
    post<void>(`/contacts/chat-groups/${id}/leave`, { userId }),

  getChatGroupDetail: (id: number) =>
    get<ChatGroup>(`/contacts/chat-groups/${id}`),

  getChatGroupMembers: (id: number) =>
    get<ChatGroupMember[]>(`/contacts/chat-groups/${id}/members`),
}
