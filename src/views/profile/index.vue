<template>
  <div class="personal-center">
    <div class="page-header-simple">
      <div class="header-content">
        <el-avatar :size="80" :src="userInfo?.avatar || defaultAvatar" class="avatar" />
        <div class="welcome">
          <h1>您好，{{ userInfo?.name || '用户' }}</h1>
          <p>智慧助手 · 今日待办 {{ unreadCount }} 项</p>
        </div>
      </div>
    </div>

    <div class="main-layout">
      <aside class="sidebar">
        <SettingsSidebar :active-menu="activeMenu" :unread-count="unreadCount" @update:active-menu="activeMenu = $event"
          @logout="handleLogout" />
      </aside>

      <main class="content">
        <div class="page-header">
          <h2>{{ pageTitle }}</h2>
          <p class="page-desc">{{ pageDesc }}</p>
        </div>
        <keep-alive>
          <component :is="currentComponent" :user="userInfo" :settings="systemSettings" :messages="messages"
            @updateAvatar="handleUpdateAvatar" @removeAvatar="handleRemoveAvatar" @updateProfile="handleUpdateProfile"
            @updateSettings="handleUpdateSettings" @markAsRead="handleMarkAsRead" @markAllAsRead="handleMarkAllAsRead"
            @clearReadMessages="handleClearReadMessages" @deleteMessage="handleDeleteMessage" />
        </keep-alive>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import SettingsSidebar from './components/SettingsSidebar.vue'
import ProfileForm from './components/ProfileForm.vue'
import SystemSettings from './components/SystemSettings.vue'
import MessageCenter from './components/MessageCenter.vue'
import HelpFeedback from './components/HelpFeedback.vue'
import { useUserStore } from '@/store/modules/user'
import type { SystemSettings as SysSettings, Message } from './utils/personal'
import { MENU_ITEMS, MESSAGE_TYPES } from './utils/personal'

const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)
const activeMenu = ref('profile')

// 系统设置
const systemSettings = ref<SysSettings>({
  notification: { emailNotify: true, smsNotify: false, taskReminder: true },
  privacy: { profileVisibility: 'contacts', searchable: true },
  accountSecurity: { twoFactorAuth: false, loginAlert: true },
  appearance: { theme: 'light', fontSize: 'medium' }
})

// 消息列表
const messages = ref<Message[]>([
  { id: 1, title: '系统升级通知', content: '系统将于今晚22:00进行升级维护，预计持续2小时。', type: MESSAGE_TYPES.SYSTEM, isRead: false, createdAt: new Date(2026, 3, 2, 14, 30) },
  { id: 2, title: '新任务提醒', content: '您有一个待处理任务，请及时处理。', type: MESSAGE_TYPES.TASK, isRead: false, createdAt: new Date(2026, 3, 2, 9, 0) },
  { id: 3, title: '会议提醒', content: '下午3点项目启动会，地点：会议室A。', type: MESSAGE_TYPES.REMINDER, isRead: true, createdAt: new Date(2026, 3, 1, 8, 0) }
])

const unreadCount = computed(() => messages.value.filter(m => !m.isRead).length)
const currentComponent = computed(() => {
  switch (activeMenu.value) {
    case 'profile': return ProfileForm
    case 'system': return SystemSettings
    case 'message': return MessageCenter
    case 'help': return HelpFeedback
    default: return ProfileForm
  }
})
const pageTitle = computed(() => {
  const titles: Record<string, string> = { profile: '个人档案', system: '系统设置', message: '消息中心', help: '帮助与反馈' }
  return titles[activeMenu.value] || '个人中心'
})
const pageDesc = computed(() => {
  const descs: Record<string, string> = {
    profile: '管理您的个人信息与偏好',
    system: '配置通知、隐私与安全选项',
    message: '查看系统通知与任务提醒',
    help: '常见问题与人工反馈'
  }
  return descs[activeMenu.value] || ''
})

const defaultAvatar = 'https://cube.elemecdn.com/0/88/03b01d2d5f2b9e2e7d5f8e2e7d5f8e2e.png'

const handleUpdateAvatar = (file: File) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    if (userInfo.value) userInfo.value.avatar = e.target?.result as string
    ElMessage.success('头像已更新')
  }
  reader.readAsDataURL(file)
}
const handleRemoveAvatar = () => { if (userInfo.value) userInfo.value.avatar = '' }
const handleUpdateProfile = (data: any) => userStore.updateUserInfo(data)
const handleUpdateSettings = (settings: any) => Object.assign(systemSettings.value, settings)
const handleMarkAsRead = (id: number) => { const msg = messages.value.find(m => m.id === id); if (msg) msg.isRead = true }
const handleMarkAllAsRead = () => messages.value.forEach(m => m.isRead = true)
const handleClearReadMessages = () => { messages.value = messages.value.filter(m => !m.isRead) }
const handleDeleteMessage = (id: number) => { messages.value = messages.value.filter(m => m.id !== id) }


onMounted(() => {
  if (!userStore.initialized) userStore.initUserInfo()
})
</script>

<style scoped lang="scss">
.personal-center {
  min-height: 100vh;
  background: var(--gray-50);
}

.page-header-simple {
  background: linear-gradient(135deg, var(--blue-700), var(--blue-500));
  padding: 32px 40px;
  margin-bottom: 24px;

  .header-content {
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    gap: 24px;

    .avatar {
      border: 3px solid white;
      box-shadow: var(--shadow-md);
    }

    .welcome h1 {
      margin: 0 0 8px;
      font-size: 28px;
      color: white;
    }

    .welcome p {
      margin: 0;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.85);
    }
  }
}

.main-layout {
  display: flex;
  padding: 0 24px 32px;
  max-width: 1400px;
  margin: 0 auto;
  gap: 24px;

  .sidebar {
    width: 280px;
    flex-shrink: 0;
  }

  .content {
    flex: 1;

    .page-header {
      margin-bottom: 20px;

      h2 {
        font-size: 24px;
        font-weight: 600;
        color: var(--gray-800);
        margin: 0 0 4px;
      }

      .page-desc {
        font-size: 14px;
        color: var(--gray-600);
      }
    }
  }
}
</style>