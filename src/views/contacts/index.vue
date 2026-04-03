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
            @call="callFriend" @add-to-group="openAddToGroupDialog" />

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
    <el-dialog v-model="addFriendDialogVisible" title="添加好友" width="500px">
      <el-form :model="newFriendForm" :rules="friendFormRules" ref="friendFormRef" label-width="80px">
        <el-form-item v-for="field in ADD_FRIEND_FORM_FIELDS" :key="field.prop" :label="field.label" :prop="field.prop">
          <el-input v-model="newFriendForm[field.prop]" :placeholder="field.placeholder" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addFriendDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAddFriend">添加</el-button>
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
          <el-button type="success" :icon="Phone" @click="callFriend(currentFriend)">通话</el-button>
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
import { Plus, ChatDotRound, Phone } from '@element-plus/icons-vue'
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

const router = useRouter()

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

// 响应式数据
const loading = ref(false)
const activeMenu = ref<MenuType>(MenuType.FRIENDS)
const searchKeyword = ref('')
const friendDetailVisible = ref(false)
const currentFriend = ref<Friend | null>(null)
const addFriendDialogVisible = ref(false)
const friendFormRef = ref<FormInstance>()

// 分组数据
const customGroups = ref<CustomGroup[]>([
  { id: 1, name: '重点工作组' },
  { id: 2, name: '专家智库' },
  { id: 3, name: '跨部门协同' }
])
const friendGroupMaps = ref<FriendGroupMap[]>([
  { friendId: 1, groupId: 1 }, { friendId: 1, groupId: 3 },
  { friendId: 2, groupId: 3 }, { friendId: 5, groupId: 1 }
])

// 好友列表
const friends = ref<Friend[]>([
  { id: 1, name: '小陈', company: '市数据局', department: 'AI应用处', relation: '同事', avatar: '', position: 'AI训练师', mobile: '13800138001', email: 'chenj@data.gov' },
  { id: 2, name: '小程', company: '市数据局', department: '政策法规处', relation: '同事', avatar: '', position: '法规专员', mobile: '13800138002', email: 'chengyy@data.gov' },
  { id: 3, name: '小芳', company: '数字政府研究院', department: '技术研发部', relation: '合作伙伴', avatar: '', position: '架构师', mobile: '13800138003' },
  { id: 4, name: '小方', company: '市教育局', department: '基础教育科', relation: '', avatar: '', position: '科长', mobile: '13800138004' },
  { id: 5, name: '小李', company: '市数据局', department: '市场推广部', relation: '同事', avatar: '', position: '推广主任', mobile: '13800138005' }
])

const newFriendRequests = ref<FriendRequest[]>([
  { id: 101, name: '王晓明', company: '市公安局', message: '想认识一下' },
  { id: 102, name: '张莉莉', company: '市大数据中心', message: '校友推荐' }
])

const groups = ref<Group[]>([
  { id: 201, name: '技术交流群', memberCount: 86, description: '技术分享与讨论' },
  { id: 202, name: '项目协作组', memberCount: 42, description: '跨部门项目协作' }
])

// 表单
const newFriendForm = reactive({ name: '', company: '', department: '', mobile: '', email: '', position: '' })
const friendFormRules: FormRules = {
  name: [{ required: true, message: '请输入姓名' }],
  company: [{ required: true, message: '请输入组织' }]
}

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

const formFields = [
  { prop: 'name', label: '姓名', placeholder: '请输入姓名' },
  { prop: 'position', label: '职务', placeholder: '请输入职务' },
  { prop: 'company', label: '组织', placeholder: '请输入组织' },
  { prop: 'department', label: '部门', placeholder: '请输入部门' },
  { prop: 'mobile', label: '手机号', placeholder: '请输入手机号' },
  { prop: 'email', label: '邮箱', placeholder: '请输入邮箱' }
]
// 方法
const openAddFriendDialog = () => { addFriendDialogVisible.value = true }
const submitAddFriend = async () => {
  if (!friendFormRef.value) return
  await friendFormRef.value.validate()
  friends.value.push({
    id: Date.now(),
    name: newFriendForm.name,
    company: newFriendForm.company,
    department: newFriendForm.department || '未填写',
    mobile: newFriendForm.mobile,
    email: newFriendForm.email,
    relation: '好友',
    position: newFriendForm.position
  })
  ElMessage.success('添加成功')
  addFriendDialogVisible.value = false
  Object.assign(newFriendForm, { name: '', company: '', department: '', mobile: '', email: '', position: '' })
}

const deleteFriend = (id: number) => {
  ElMessageBox.confirm('确定移除该好友？', '提示', { type: 'warning' }).then(() => {
    friends.value = friends.value.filter(f => f.id !== id)
    friendGroupMaps.value = friendGroupMaps.value.filter(m => m.friendId !== id)
    ElMessage.success('已移除')
  }).catch(() => { })
}

const callFriend = (friend: Friend) => {
  if (friend.mobile) ElMessage.success(`正在呼叫 ${friend.name}：${friend.mobile}`)
  else ElMessage.warning('暂无联系方式')
}

const acceptFriend = (id: number) => {
  const req = newFriendRequests.value.find(r => r.id === id)
  if (req) {
    friends.value.push({
      id: Date.now(),
      name: req.name,
      company: req.company,
      department: '待完善',
      avatar: req.avatar,
      position: '待完善',
      relation: '好友'
    })
    newFriendRequests.value = newFriendRequests.value.filter(r => r.id !== id)
    ElMessage.success('已添加为好友')
  }
}
const rejectFriend = (id: number) => {
  newFriendRequests.value = newFriendRequests.value.filter(r => r.id !== id)
  ElMessage.info('已拒绝申请')
}
const joinGroup = (group: Group) => ElMessage.info(`进入群聊：${group.name} (演示功能)`)
const openFriendDetail = (friend: Friend) => {
  currentFriend.value = friend
  friendDetailVisible.value = true
}
const chatWithFriend = (friend: Friend) => {
  router.push({ path: '/message', query: { userId: friend.id.toString() } })
}

// 分组方法
const openAddGroupDialog = () => { addGroupDialogVisible.value = true }
const handleAddGroup = (name: string) => {
  customGroups.value.push({ id: Date.now(), name })
  ElMessage.success('分组添加成功')
}
const renameGroup = (group: CustomGroup) => {
  currentOperateGroup.value = group
  renameGroupDialogVisible.value = true
}
const handleRenameGroup = (id: number, newName: string) => {
  const group = customGroups.value.find(g => g.id === id)
  if (group) group.name = newName
  ElMessage.success('重命名成功')
}
const deleteGroup = (groupId: number) => {
  ElMessageBox.confirm('确定删除分组？', '提示', { type: 'warning' }).then(() => {
    customGroups.value = customGroups.value.filter(g => g.id !== groupId)
    friendGroupMaps.value = friendGroupMaps.value.filter(m => m.groupId !== groupId)
    ElMessage.success('删除成功')
  }).catch(() => { })
}
const openAddToGroupDialog = (friend: Friend) => {
  addToGroupFriend.value = friend
  addToGroupDialogVisible.value = true
}
const handleAddToGroup = (friendId: number, groupIds: number[]) => {
  friendGroupMaps.value = friendGroupMaps.value.filter(m => m.friendId !== friendId)
  groupIds.forEach(gid => { friendGroupMaps.value.push({ friendId, groupId: gid }) })
  ElMessage.success('分组设置成功')
}
const openAddFriendToGroupDialog = (group: CustomGroup) => {
  currentOperateGroup.value = group
  addFriendToGroupDialogVisible.value = true
}
const handleAddFriendToGroup = (friendId: number, groupId: number) => {
  if (friendGroupMaps.value.some(m => m.friendId === friendId && m.groupId === groupId)) {
    ElMessage.warning('该联系人已在分组中')
    return
  }
  friendGroupMaps.value.push({ friendId, groupId })
  ElMessage.success('添加成功')
}
const removeFriendFromGroup = (groupId: number, friendId: number) => {
  friendGroupMaps.value = friendGroupMaps.value.filter(m => !(m.groupId === groupId && m.friendId === friendId))
  ElMessage.success('已移出分组')
}
const getFriendGroups = (friendId: number) => {
  return customGroups.value.filter(group => friendGroupMaps.value.some(m => m.friendId === friendId && m.groupId === group.id))
}
const getFriendsInGroup = (groupId: number) => {
  const ids = friendGroupMaps.value.filter(m => m.groupId === groupId).map(m => m.friendId)
  return friends.value.filter(f => ids.includes(f.id))
}

onMounted(() => { loading.value = false })
</script>

<style scoped lang="scss">
.contact-book {
  min-height: 100vh;
  background: var(--gray-50);
}

.page-header {
  position: relative;
  background: linear-gradient(135deg, var(--blue-700) 0%, var(--purple-500) 100%);
  padding: 40px 40px 60px;
  margin-bottom: 20px;
  overflow: hidden;

  .header-content {
    max-width: 1400px;
    margin: 0 auto;
    position: relative;
    z-index: 2;

    h1 {
      margin: 0 0 8px;
      font-size: 32px;
      font-weight: 700;
      color: white;
      letter-spacing: -0.5px;
    }

    p {
      margin: 0 0 20px;
      font-size: 16px;
      color: rgba(255, 255, 255, 0.85);
    }

    .header-stats {
      display: flex;
      gap: 32px;

      .stat-item {
        text-align: center;

        .stat-number {
          display: block;
          font-size: 28px;
          font-weight: 700;
          color: white;
        }

        .stat-label {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.7);
        }
      }
    }
  }

  .wave-wrapper {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    line-height: 0;

    .wave {
      width: 100%;
      height: 40px;
    }
  }
}

.main-layout {
  display: flex;
  padding: 0 24px 32px;
  max-width: 1400px;
  margin: 0 auto;
  gap: 24px;
}

.main-content {
  flex: 1;

  .content-header {
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(8px);
    border-radius: 32px;
    padding: 16px 24px;
    margin-bottom: 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    h2 {
      font-size: 22px;
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
    gap: 20px;

    .group-item {
      background: var(--white);
      border-radius: 12px;
      padding: 20px;

      .group-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        h3 {
          margin: 0;
          font-size: 16px;
          color: var(--gray-800);
        }
      }
    }
  }

  .card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 24px;
  }

  .friend-card {
    background: var(--white);
    border-radius: 20px;
    padding: 20px;
    display: flex;
    align-items: flex-start;
    gap: 16px;
    cursor: pointer;
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--gray-100);

    &:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    }

    .card-info {
      flex: 1;

      .info-name {
        font-weight: 700;
        margin-bottom: 4px;
        color: var(--gray-800);
      }

      .info-position {
        color: var(--blue-500);
        font-size: 13px;
        margin-bottom: 4px;
      }

      .info-company {
        font-size: 12px;
        color: var(--gray-600);
      }
    }

    .card-actions {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
  }
}

// 好友详情弹窗
.friend-detail {
  .detail-header {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 20px;

    .detail-basic h2 {
      margin: 0 0 8px;
      font-size: 24px;
      color: var(--gray-800);
    }

    .detail-position {
      font-size: 16px;
      color: var(--blue-500);
    }
  }
}

.empty-placeholder {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 0;
}
</style>