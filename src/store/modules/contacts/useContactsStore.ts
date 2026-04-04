import { defineStore } from 'pinia'
import { contactsApi, type Friend, type FriendRequest, type ContactGroup, type ChatGroup } from '@/api/contacts/contacts'

export const useContactsStore = defineStore('contacts', {
  state: () => ({
    friends: [] as Friend[],
    friendRequests: [] as FriendRequest[],
    groups: [] as ContactGroup[],
    chatGroups: [] as ChatGroup[],
    loading: false,
  }),
  getters: {
    friendCount: (state) => state.friends.length,
    requestCount: (state) => state.friendRequests.length,
  },
  actions: {
    setFriends(friends: Friend[]) {
      this.friends = friends
    },
    setFriendRequests(requests: FriendRequest[]) {
      this.friendRequests = requests
    },
    setGroups(groups: ContactGroup[]) {
      this.groups = groups
    },
    setChatGroups(groups: ChatGroup[]) {
      this.chatGroups = groups
    },
    setLoading(loading: boolean) {
      this.loading = loading
    },
    async fetchFriends(userId: number, keyword?: string) {
      this.setLoading(true)
      try {
        const friends = await contactsApi.getFriends(userId, keyword)
        this.setFriends(friends)
      } catch (error) {
        console.error('获取好友列表失败:', error)
      } finally {
        this.setLoading(false)
      }
    },
    async addFriend(data: { userId: number; friendId: number; remark?: string; relation?: string }) {
      this.setLoading(true)
      try {
        const friend = await contactsApi.addFriend(data)
        this.friends.push(friend)
        return friend
      } catch (error) {
        console.error('添加好友失败:', error)
        throw error
      } finally {
        this.setLoading(false)
      }
    },
    async deleteFriend(id: number, userId: number) {
      this.setLoading(true)
      try {
        await contactsApi.deleteFriend(id, userId)
        this.friends = this.friends.filter((f) => f.id !== id)
      } catch (error) {
        console.error('删除好友失败:', error)
        throw error
      } finally {
        this.setLoading(false)
      }
    },
    async fetchFriendRequests(userId: number) {
      this.setLoading(true)
      try {
        const requests = await contactsApi.getFriendRequests(userId)
        this.setFriendRequests(requests)
      } catch (error) {
        console.error('获取好友申请失败:', error)
      } finally {
        this.setLoading(false)
      }
    },
    async acceptFriendRequest(id: number, userId: number) {
      this.setLoading(true)
      console.error('=== [Store] 接受好友申请 ===')
      console.error('申请表 ID:', id)
      console.error('用户 ID:', userId)
      try {
        await contactsApi.acceptFriendRequest(id, userId)
        this.friendRequests = this.friendRequests.filter((r) => r.id !== id)
      } catch (error: any) {
        console.error('接受好友申请失败:', error)
        console.error('错误响应:', error.response?.data)
        throw error
      } finally {
        this.setLoading(false)
      }
    },
    async rejectFriendRequest(id: number, userId: number) {
      this.setLoading(true)
      console.error('=== [Store] 拒绝好友申请 ===')
      console.error('申请表 ID:', id)
      console.error('用户 ID:', userId)
      try {
        await contactsApi.rejectFriendRequest(id, userId)
        this.friendRequests = this.friendRequests.filter((r) => r.id !== id)
      } catch (error: any) {
        console.error('拒绝好友申请失败:', error)
        console.error('错误响应:', error.response?.data)
        throw error
      } finally {
        this.setLoading(false)
      }
    },
    async fetchGroups(userId: number) {
      this.setLoading(true)
      try {
        const groups = await contactsApi.getGroups(userId)
        this.setGroups(groups)
      } catch (error) {
        console.error('获取分组失败:', error)
      } finally {
        this.setLoading(false)
      }
    },
    async createGroup(data: { userId: number; name: string; description?: string }) {
      this.setLoading(true)
      try {
        const group = await contactsApi.createGroup(data)
        this.groups.push(group)
        return group
      } catch (error) {
        console.error('创建分组失败:', error)
        throw error
      } finally {
        this.setLoading(false)
      }
    },
    async deleteGroup(id: number, userId: number) {
      this.setLoading(true)
      try {
        await contactsApi.deleteGroup(id, userId)
        this.groups = this.groups.filter((g) => g.id !== id)
      } catch (error) {
        console.error('删除分组失败:', error)
        throw error
      } finally {
        this.setLoading(false)
      }
    },
    async fetchChatGroups(userId: number) {
      this.setLoading(true)
      try {
        const groups = await contactsApi.getChatGroups(userId)
        this.setChatGroups(groups)
      } catch (error) {
        console.error('获取群聊失败:', error)
      } finally {
        this.setLoading(false)
      }
    },
  },
})
