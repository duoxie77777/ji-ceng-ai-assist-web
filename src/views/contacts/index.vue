<template>
  <div class="contact-book">
    <div class="page-header">
      <div class="header-content">
        <h1>通讯录</h1>
        <p>连接朋友与同事 · 随时随地</p>
        <div class="header-stats">
          <div class="stat-item">
            <span class="stat-number">{{ friends.length }}</span>
            <span class="stat-label">好友</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ newFriendRequests.length }}</span>
            <span class="stat-label">申请</span>
          </div>
        </div>
      </div>
      <div class="wave-wrapper">
        <svg class="wave" viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path fill="white" fill-opacity="0.2"
            d="M0,64L80,69C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z" />
        </svg>
      </div>
    </div>

    <div class="main-layout">
      <ContactSidebar :active-menu="activeMenu" :friend-count="friends.length"
        :new-friend-count="newFriendRequests.length" @update:active-menu="activeMenu = $event"
        @add-friend="openAddFriendDialog" />

      <main class="main-content">
        <div class="content-header">
          <div class="header-title">
            <h2>{{ currentMenuTitle }}</h2>
          </div>
          <div class="header-actions">
            <el-input v-model="searchKeyword" placeholder="搜索姓名/单位/部门/职务" prefix-icon="Search" clearable
              style="width: 260px" />
            <el-button v-if="activeMenu === MenuType.CUSTOM_GROUPS" type="primary" :icon="Plus" size="small"
              @click="openAddGroupDialog">
              新建分组
            </el-button>
          </div>
        </div>

        <div class="content-list" v-loading="loading">
          <!-- 好友列表 -->
          <ContactListView v-if="activeMenu === MenuType.FRIENDS" :type="ListType.FRIENDS" :list="friends"
            :search-keyword="searchKeyword" @detail="openFriendDetail" @delete="deleteFriend" @chat="chatWithFriend"
            @add-to-group="openAddToGroupDialog" />

          <!-- 自定义分组 -->
          <div v-else-if="activeMenu === MenuType.CUSTOM_GROUPS" class="custom-groups-container">
            <div class="groups-list">
              <div v-for="group in customGroups" :key="group.id" class="group-item">
                <div class="group-header">
                  <h3>
                    {{ group.name }}
                    <el-button link @click="renameGroup(group)">重命名</el-button>
                    <el-button link type="danger" @click="deleteGroup(group.id)">删除</el-button>
                  </h3>
                  <el-button type="primary" link @click="openAddFriendToGroupDialog(group)">添加联系人</el-button>
                </div>
                <div class="card-grid">
                  <div v-for="friend in getFriendsInGroup(group.id)" :key="friend.id" class="friend-card"
                    @click="openFriendDetail(friend)">
                    <div class="card-avatar"><el-avatar :size="56" :src="friend.avatar">{{ friend.name.charAt(0)
                        }}</el-avatar></div>
                    <div class="card-info">
                      <div class="info-name">{{ friend.name }}</div>
                      <div class="info-position">{{ friend.position }}</div>
                      <div class="info-company">{{ friend.company }}</div>
                    </div>
                    <div class="card-actions">
                      <el-button type="danger" link size="small"
                        @click.stop="removeFriendFromGroup(group.id, friend.id)">移出</el-button>
                    </div>
                  </div>
                  <div v-if="getFriendsInGroup(group.id).length === 0" class="empty-placeholder"><el-empty
                      description="暂无联系人" /></div>
                </div>
              </div>
            </div>
          </div>

          <!-- 好友申请 -->
          <ContactListView v-else-if="activeMenu === MenuType.NEW_FRIENDS" :type="ListType.REQUESTS"
            :list="newFriendRequests" :search-keyword="searchKeyword" @accept="acceptFriend" @reject="rejectFriend" />

          <!-- 群聊 -->
          <ContactListView v-else-if="activeMenu === MenuType.GROUPS" :type="ListType.GROUPS" :list="groups"
            :search-keyword="searchKeyword" @join-group="joinGroup" />
        </div>
      </main>
    </div>

    <!-- 添加好友弹窗 -->
    <el-dialog v-model="addFriendDialogVisible" title="添加好友" width="600px">
      <div class="add-friend-content">
        <div class="search-box">
          <el-input 
            v-model="searchKeywordForAdd" 
            placeholder="搜索用户名、邮箱或手机号" 
            prefix-icon="Search"
            clearable
            @input="handleSearchUsers"
          />
        </div>
        
        <div v-loading="searchLoading" class="search-results-container">
          <div v-if="searchResults.length > 0" class="search-results">
            <div 
              v-for="user in searchResults" 
              :key="user.id" 
              :class="['search-result-item', { selected: selectedUser?.id === user.id }]"
              @click="selectUser(user)"
            >
              <el-avatar :size="48" :src="user.avatar">{{ user.username?.charAt(0) }}</el-avatar>
              <div class="user-info">
                <div class="user-name">{{ user.username }}</div>
                <div class="user-detail">
                  <span v-if="user.department">{{ user.department }}</span>
                  <span v-if="user.position">{{ user.position }}</span>
                  <span v-if="user.email">{{ user.email }}</span>
                </div>
              </div>
              <el-button 
                v-if="selectedUser?.id === user.id" 
                type="primary" 
                size="small"
              >
                已选择
              </el-button>
              <el-button 
                v-else 
                type="primary" 
                size="small"
                @click.stop="selectUserAndAdd(user)"
              >
                添加
              </el-button>
            </div>
          </div>
          
          <div v-else-if="searchKeywordForAdd" class="empty-search-result">
            <el-empty description="未找到相关用户" />
          </div>
          
          <div v-else class="search-placeholder">
            <el-empty description="请输入关键词搜索用户" :image-size="80" />
          </div>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="addFriendDialogVisible = false">取消</el-button>
        <el-button 
          type="primary" 
          @click="submitAddFriend" 
          :disabled="!selectedUser"
        >
          确认添加
        </el-button>
      </template>
    </el-dialog>

    <!-- 好友详情弹窗 -->
    <el-dialog v-model="friendDetailVisible" title="好友详情" width="600px">
      <div v-if="currentFriend" class="friend-detail">
        <div class="detail-header">
          <el-avatar :size="80" :src="currentFriend.avatar">{{ currentFriend.name.charAt(0) }}</el-avatar>
          <div class="detail-basic">
            <h2>{{ currentFriend.name }}</h2>
            <div class="detail-position">{{ currentFriend.position || DEFAULT_TEXT }}</div>
            <div class="detail-relation" v-if="currentFriend.relation">
              <el-tag type="info">{{ currentFriend.relation }}</el-tag>
            </div>
          </div>
        </div>
        <el-divider />
        <el-descriptions :column="2" border>
          <el-descriptions-item v-for="field in DETAIL_FIELDS" :key="field.label" :label="field.label">
            {{ getFieldValue(currentFriend, field.field) }}
          </el-descriptions-item>
          <el-descriptions-item label="分组" :span="2">
            <el-tag v-for="group in getFriendGroups(currentFriend.id)" :key="group.id" closable
              @close="removeFriendFromGroup(group.id, currentFriend.id)">
              {{ group.name }}
            </el-tag>
            <el-button type="text" size="small" @click="openAddToGroupDialog(currentFriend)">添加分组</el-button>
          </el-descriptions-item>
        </el-descriptions>
        <div class="detail-actions" style="margin-top: 20px; text-align: right">
          <el-button type="primary" :icon="ChatDotRound" @click="chatWithFriend(currentFriend)">聊天</el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 分组弹窗集合 -->
    <GroupDialogs :add-group-visible="addGroupDialogVisible" :rename-group-visible="renameGroupDialogVisible"
      :add-to-group-visible="addToGroupDialogVisible" :add-friend-to-group-visible="addFriendToGroupDialogVisible"
      :custom-groups="customGroups" :friends="friends" :friend-group-maps="friendGroupMaps"
      :current-friend="addToGroupFriend" :current-group="currentOperateGroup"
      @update:add-group-visible="addGroupDialogVisible = $event"
      @update:rename-group-visible="renameGroupDialogVisible = $event"
      @update:add-to-group-visible="addToGroupDialogVisible = $event"
      @update:add-friend-to-group-visible="addFriendToGroupDialogVisible = $event" @add-group="handleAddGroup"
      @rename-group="handleRenameGroup" @add-to-group="handleAddToGroup"
      @add-friend-to-group="handleAddFriendToGroup" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, ChatDotRound } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useRouter } from 'vue-router'
import ContactSidebar from './components/ContactSidebar.vue'
import ContactListView from './components/ContactList.vue'
import GroupDialogs from './components/GroupDialogs.vue'
import {
  MenuType,
  ListType,
  BadgeType,
  DEFAULT_TEXT,
  DETAIL_FIELDS,
  ADD_FRIEND_FORM_FIELDS,
  getFieldValue,
  type ContactItem
} from './utils/contact'
import { useContactsStore } from '@/store/modules/contacts/useContactsStore'
import { useUserStore } from '@/store/modules/user'
import { userApi } from '@/api/user/user'
import { contactsApi } from '@/api/contacts/contacts'

const router = useRouter()
const contactsStore = useContactsStore()
const userStore = useUserStore()

const getCurrentUserId = (): number => {
  const userId = userStore.userInfo?.id
  return userId || 0
}

// 类型定义
interface Friend {
  id: number
  name: string
  avatar?: string
  company: string
  department: string
  mobile?: string
  email?: string
  relation?: string
  position?: string
}
interface FriendRequest { id: number; name: string; avatar?: string; company: string; message?: string }
interface Group { id: number; name: string; memberCount: number; description: string }
interface CustomGroup { id: number; name: string }
interface FriendGroupMap { friendId: number; groupId: number }
interface SearchResult {
  id: number
  username: string
  avatar?: string
  email?: string
  phone?: string
  department?: string
  position?: string
}

// 响应式数据
const loading = computed(() => contactsStore.loading)
const activeMenu = ref<MenuType>(MenuType.FRIENDS)
const searchKeyword = ref('')
const friendDetailVisible = ref(false)
const currentFriend = ref<Friend | null>(null)
const addFriendDialogVisible = ref(false)
const searchResults = ref<SearchResult[]>([])
const selectedUser = ref<SearchResult | null>(null)
const searchKeywordForAdd = ref('')
const searchLoading = ref(false)

// 分组数据
const customGroups = computed(() => contactsStore.groups.map(g => ({ id: Number(g.id), name: g.name })))
const friendGroupMaps = ref<FriendGroupMap[]>([])

// 好友列表
const friends = computed(() => contactsStore.friends.map(f => ({
  id: Number(f.friendId),  // 使用好友的用户 ID，而不是好友关系表的 ID
  name: f.friend.username,
  avatar: f.friend.avatar,
  company: f.friend.department || '',
  department: f.friend.department || '',
  position: f.friend.position || '',
  mobile: f.friend.phone || '',
  email: f.friend.email || '',
  relation: f.relation || '',
})))

const newFriendRequests = computed(() => contactsStore.friendRequests.map(r => ({
  requestId: Number(r.id),        // 申请表的 ID（用于同意/拒绝操作）
  id: Number(r.fromUserId),       // 发送申请的用户的 ID（用于显示和跳转）
  name: r.fromUser.username,
  avatar: r.fromUser.avatar,
  company: r.fromUser.department || '',
  message: r.message || '',
})))

const groups = computed(() => contactsStore.chatGroups.map(g => ({
  id: Number(g.id),
  name: g.name,
  memberCount: g.memberCount,
  description: g.description || '',
})))

// 分组弹窗状态
const addGroupDialogVisible = ref(false)
const renameGroupDialogVisible = ref(false)
const addToGroupDialogVisible = ref(false)
const addFriendToGroupDialogVisible = ref(false)
const addToGroupFriend = ref<Friend | null>(null)
const currentOperateGroup = ref<CustomGroup | null>(null)

// 计算属性
const currentMenuTitle = computed(() => {
  const titles: Record<MenuType, string> = {
    [MenuType.FRIENDS]: '好友',
    [MenuType.NEW_FRIENDS]: '好友申请',
    [MenuType.GROUPS]: '群聊',
    [MenuType.CUSTOM_GROUPS]: '分组'
  }
  return titles[activeMenu.value]
})

const handleSearchUsers = async () => {
  if (!searchKeywordForAdd.value) {
    searchResults.value = []
    return
  }
  
  searchLoading.value = true
  try {
    const results = await userApi.searchUsers(searchKeywordForAdd.value)
    searchResults.value = results
  } catch (error) {
    console.error('搜索用户失败:', error)
    searchResults.value = []
    ElMessage.error('搜索失败')
  } finally {
    searchLoading.value = false
  }
}

const selectUser = (user: SearchResult) => {
  selectedUser.value = user
}

const selectUserAndAdd = async (user: SearchResult) => {
  selectedUser.value = user
  await submitAddFriend()
}

const submitAddFriend = async () => {
  if (!selectedUser.value) {
    ElMessage.warning('请先选择要添加的用户')
    return
  }
  
  try {
    // 发送好友申请，而不是直接添加
    await contactsApi.sendFriendRequest({
      fromUserId: Number(getCurrentUserId()),
      toUserId: Number(selectedUser.value.id),
    })
    ElMessage.success('好友申请已发送，等待对方接受')
    addFriendDialogVisible.value = false
    selectedUser.value = null
    searchResults.value = []
    searchKeywordForAdd.value = ''
    // 刷新好友申请列表
    await contactsStore.fetchFriendRequests(getCurrentUserId())
  } catch (error: any) {
    console.error('发送好友申请失败:', error)
    ElMessage.error(error.message || '发送申请失败')
  }
}

const openAddFriendDialog = () => {
  addFriendDialogVisible.value = true
  searchKeywordForAdd.value = ''
  searchResults.value = []
  selectedUser.value = null
}

const deleteFriend = async (id: number) => {
  if (!id) {
    ElMessage.warning('好友信息错误')
    return
  }
  ElMessageBox.confirm('确定移除该好友？删除后聊天记录也将被清除', '提示', { 
    type: 'warning',
    confirmButtonText: '确定删除',
    cancelButtonText: '取消'
  }).then(async () => {
    try {
      await contactsStore.deleteFriend(Number(id), Number(getCurrentUserId()))
      ElMessage.success('已移除')
      await contactsStore.fetchFriends(getCurrentUserId())
    } catch (error: any) {
      console.error('删除失败:', error)
      ElMessage.error(error.message || '删除失败')
    }
  }).catch(() => { })
}

const acceptFriend = async (item: any) => {
  const requestId = item.requestId
  const userId = getCurrentUserId()
  
  if (!requestId || !userId) {
    ElMessage.warning('申请信息错误')
    return
  }
  
  try {
    await contactsStore.acceptFriendRequest(requestId, userId)
    ElMessage.success('已添加为好友')
    await contactsStore.fetchFriendRequests(userId)
    await contactsStore.fetchFriends(userId)
  } catch (error: any) {
    console.error('接受失败:', error)
    ElMessage.error(error.response?.data?.message || error.message || '接受失败')
  }
}

const rejectFriend = async (item: any) => {
  const requestId = item.requestId
  const userId = getCurrentUserId()
  
  if (!requestId || !userId) {
    ElMessage.warning('申请信息错误')
    return
  }
  
  try {
    await contactsStore.rejectFriendRequest(requestId, userId)
    ElMessage.info('已拒绝申请')
    await contactsStore.fetchFriendRequests(userId)
  } catch (error: any) {
    console.error('拒绝失败:', error)
    ElMessage.error(error.response?.data?.message || error.message || '拒绝失败')
  }
}

const joinGroup = (group: Group) => ElMessage.info(`进入群聊：${group.name} (演示功能)`)
const openFriendDetail = (friend: Friend) => {
  currentFriend.value = friend
  friendDetailVisible.value = true
}
const chatWithFriend = (friend: Friend) => {
  if (!friend.id) {
    ElMessage.warning('好友信息不完整')
    return
  }
  try {
    router.push({ path: '/message', query: { friendId: String(friend.id) } })
  } catch (error) {
    console.error('跳转聊天页面失败:', error)
    ElMessage.error('跳转失败，请重试')
  }
}

// 分组方法
const openAddGroupDialog = () => { addGroupDialogVisible.value = true }
const handleAddGroup = async (name: string) => {
  try {
    if (!name || !name.trim()) {
      ElMessage.warning('请输入分组名称')
      return
    }
    await contactsStore.createGroup({
      userId: Number(getCurrentUserId()),
      name: name.trim(),
    })
    ElMessage.success('分组添加成功')
    addGroupDialogVisible.value = false
  } catch (error: any) {
    console.error('添加分组失败:', error)
    ElMessage.error(error.message || '添加分组失败')
  }
}

const renameGroup = (group: CustomGroup) => {
  if (!group || !group.id) {
    ElMessage.warning('分组信息错误')
    return
  }
  currentOperateGroup.value = group
  renameGroupDialogVisible.value = true
}
const handleRenameGroup = async (id: number, newName: string) => {
  try {
    if (!id || !newName || !newName.trim()) {
      ElMessage.warning('分组名称不能为空')
      return
    }
    await contactsStore.updateGroup(Number(id), { name: newName.trim() })
    ElMessage.success('重命名成功')
    renameGroupDialogVisible.value = false
  } catch (error: any) {
    console.error('重命名失败:', error)
    ElMessage.error(error.message || '重命名失败')
  }
}

const deleteGroup = async (groupId: number) => {
  if (!groupId) {
    ElMessage.warning('分组信息错误')
    return
  }
  ElMessageBox.confirm('确定删除分组？', '提示', { type: 'warning' }).then(async () => {
    try {
      await contactsStore.deleteGroup(Number(groupId), Number(getCurrentUserId()))
      ElMessage.success('删除成功')
    } catch (error: any) {
      console.error('删除失败:', error)
      ElMessage.error(error.message || '删除失败')
    }
  }).catch(() => { })
}

const openAddToGroupDialog = (friend: Friend) => {
  addToGroupFriend.value = friend
  addToGroupDialogVisible.value = true
}
const handleAddToGroup = async (friendId: number, groupIds: number[]) => {
  try {
    if (!friendId || groupIds.length === 0) {
      ElMessage.warning('请选择分组')
      return
    }
    for (const groupId of groupIds) {
      if (groupId) {
        await contactsStore.addFriendToGroup(Number(groupId), Number(friendId))
      }
    }
    ElMessage.success('分组设置成功')
  } catch (error: any) {
    console.error('设置分组失败:', error)
    ElMessage.error(error.message || '设置分组失败')
  }
}

const openAddFriendToGroupDialog = (group: CustomGroup) => {
  if (!group || !group.id) {
    ElMessage.warning('分组信息不完整')
    return
  }
  currentOperateGroup.value = group
  addFriendToGroupDialogVisible.value = true
}
const handleAddFriendToGroup = async (friendId: number, groupId: number) => {
  try {
    if (!friendId || !groupId) {
      ElMessage.warning('请选择联系人和分组')
      return
    }
    await contactsStore.addFriendToGroup(Number(groupId), Number(friendId))
    ElMessage.success('添加成功')
  } catch (error: any) {
    console.error('添加失败:', error)
    ElMessage.error(error.message || '添加失败')
  }
}

const removeFriendFromGroup = async (groupId: number, friendId: number) => {
  try {
    if (!groupId || !friendId) {
      ElMessage.warning('参数错误')
      return
    }
    await contactsStore.removeFriendFromGroup(Number(groupId), Number(friendId))
    ElMessage.success('移出成功')
  } catch (error: any) {
    console.error('移出分组失败:', error)
    ElMessage.error(error.message || '移出失败')
  }
}

const getFriendGroups = (friendId: number) => {
  return customGroups.value.filter(group => friendGroupMaps.value.some(m => m.friendId === friendId && m.groupId === group.id))
}
const getFriendsInGroup = (groupId: number) => {
  const ids = friendGroupMaps.value.filter(m => m.groupId === groupId).map(m => m.friendId)
  return friends.value.filter(f => ids.includes(f.id))
}

onMounted(async () => {
  const userId = getCurrentUserId()
  await Promise.all([
    contactsStore.fetchFriends(userId),
    contactsStore.fetchFriendRequests(userId),
    contactsStore.fetchGroups(userId),
    contactsStore.fetchChatGroups(userId),
  ])
})
</script>

<style scoped lang="scss">
.contact-book {
  min-height: 100vh;
  background: var(--white);
}

.page-header {
  position: relative;
  background: var(--white);
  padding: 20px 24px;
  border-bottom: 1px solid var(--gray-200);

  .header-content {
    position: relative;
    z-index: 2;

    h1 {
      margin: 0 0 4px;
      font-size: 18px;
      font-weight: 600;
      color: var(--gray-900);
    }

    p {
      margin: 0 0 12px;
      font-size: 13px;
      color: var(--gray-500);
    }

    .header-stats {
      display: flex;
      gap: 24px;

      .stat-item {
        text-align: center;

        .stat-number {
          display: block;
          font-size: 20px;
          font-weight: 600;
          color: var(--gray-900);
        }

        .stat-label {
          font-size: 12px;
          color: var(--gray-500);
        }
      }
    }
  }

  .wave-wrapper {
    display: none;
  }
}

.main-layout {
  display: flex;
  padding: 16px;
  gap: 16px;
}

.main-content {
  flex: 1;

  .content-header {
    background: var(--white);
    border-radius: 6px;
    padding: 12px 16px;
    margin-bottom: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: 1px solid var(--gray-200);

    h2 {
      font-size: 15px;
      font-weight: 600;
      color: var(--gray-800);
    }
  }

  .content-list {
    background: transparent;
    padding: 0;
  }
}

// 自定义分组样式（使用主题变量）
.custom-groups-container {
  .groups-list {
    display: flex;
    flex-direction: column;
    gap: 12px;

    .group-item {
      background: var(--white);
      border-radius: 6px;
      padding: 14px;
      border: 1px solid var(--gray-200);

      .group-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;

        h3 {
          margin: 0;
          font-size: 14px;
          color: var(--gray-800);
        }
      }
    }
  }

  .card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 12px;
  }

  .friend-card {
    background: var(--white);
    border-radius: 6px;
    padding: 12px;
    display: flex;
    align-items: flex-start;
    gap: 10px;
    cursor: pointer;
    border: 1px solid var(--gray-200);

    &:hover {
      border-color: var(--gray-300);
    }

    .card-info {
      flex: 1;

      .info-name {
        font-weight: 500;
        margin-bottom: 3px;
        color: var(--gray-800);
        font-size: 13px;
      }

      .info-position {
        color: var(--gray-600);
        font-size: 12px;
        margin-bottom: 2px;
      }

      .info-company {
        font-size: 11px;
        color: var(--gray-500);
      }
    }

    .card-actions {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
  }
}

// 好友详情弹窗
.friend-detail {
  .detail-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 16px;

    .detail-basic h2 {
      margin: 0 0 6px;
      font-size: 18px;
      color: var(--gray-800);
    }

    .detail-position {
      font-size: 14px;
      color: var(--gray-600);
    }
  }
}

.empty-placeholder {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px 0;
}

.add-friend-content {
  .search-box {
    margin-bottom: 16px;
  }

  .search-results-container {
    min-height: 300px;
    max-height: 400px;
    overflow-y: auto;
    border: 1px solid var(--gray-200);
    border-radius: 4px;
    padding: 16px;

    .search-results {
      .search-result-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        margin-bottom: 8px;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;
        border: 1px solid transparent;

        &:hover {
          background-color: var(--gray-50);
          border-color: var(--gray-200);
        }

        &.selected {
          background-color: var(--blue-50);
          border-color: var(--blue-200);
        }

        .el-avatar {
          flex-shrink: 0;
        }

        .user-info {
          flex: 1;
          min-width: 0;

          .user-name {
            font-weight: 600;
            color: var(--gray-800);
            margin-bottom: 4px;
            font-size: 14px;
          }

          .user-detail {
            font-size: 12px;
            color: var(--gray-500);
            display: flex;
            gap: 8px;
            flex-wrap: wrap;

            span {
              &:not(:last-child)::after {
                content: '·';
                margin-left: 8px;
                color: var(--gray-300);
              }
            }
          }
        }
      }
    }

    .empty-search-result,
    .search-placeholder {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 200px;
    }
  }
}

.search-results {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid var(--gray-200);
  border-radius: 4px;
  margin-bottom: 16px;

  .search-result-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px;
    border-bottom: 1px solid var(--gray-100);
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background-color: var(--gray-50);
    }

    &:last-child {
      border-bottom: none;
    }

    .user-info {
      flex: 1;

      .user-name {
        font-weight: 500;
        color: var(--gray-800);
        margin-bottom: 2px;
      }

      .user-detail {
        font-size: 12px;
        color: var(--gray-500);
      }
    }
  }
}

.selected-user {
  background: var(--gray-50);
  border: 1px solid var(--gray-200);
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 16px;

  .selected-user-info {
    display: flex;
    align-items: center;
    gap: 12px;

    .user-details {
      flex: 1;

      .user-name {
        font-weight: 500;
        color: var(--gray-800);
        margin-bottom: 2px;
      }

      .user-detail {
        font-size: 12px;
        color: var(--gray-500);
      }
    }
  }
}
</style>