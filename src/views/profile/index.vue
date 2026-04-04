<template>
  <div class="personal-center">
    <div class="page-header-simple">
      <div class="header-content">
        <el-avatar :size="80" :src="userInfo?.avatar || defaultAvatar" class="avatar" />
        <div class="welcome">
          <h1>您好，{{ userInfo?.username || '用户' }}</h1>
          <p>{{ userInfo?.department || '未设置部门' }} · {{ userInfo?.position || '未设置职位' }}</p>
        </div>
      </div>
    </div>

    <div class="main-layout">
      <aside class="sidebar">
        <SettingsSidebar :active-menu="activeMenu" @update:active-menu="activeMenu = $event" />
      </aside>

      <main class="content">
        <div class="page-header">
          <h2>{{ pageTitle }}</h2>
          <p class="page-desc">{{ pageDesc }}</p>
        </div>
        <keep-alive>
          <component 
            :is="currentComponent" 
            :user="profileUserInfo"
            :messages="messages"
            :settings="systemSettings"
            @updateProfile="handleUpdateProfile"
            @updateAvatar="handleUpdateAvatar"
            @markAsRead="handleMarkAsRead"
            @markAllAsRead="handleMarkAllAsRead"
            @clearReadMessages="handleClearReadMessages"
            @deleteMessage="handleDeleteMessage"
          />
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
import ChangePassword from './components/ChangePassword.vue'
import SystemSettings from './components/SystemSettings.vue'
import MessageCenter from './components/MessageCenter.vue'
import HelpFeedback from './components/HelpFeedback.vue'
import { useUserStore } from '@/store/modules/user'
import type { SystemSettings as SysSettings, Message } from './utils/personal'

const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)
const activeMenu = ref('profile')

const profileUserInfo = computed(() => ({
  id: userInfo.value?.id,
  username: userInfo.value?.username,
  avatar: userInfo.value?.avatar,
  email: userInfo.value?.email,
  phone: userInfo.value?.phone,
  department: userInfo.value?.department,
  position: userInfo.value?.position
}))

// 系统设置
const systemSettings = ref<SysSettings>({
  notification: { emailNotify: true, smsNotify: false, taskReminder: true },
  privacy: { profileVisibility: 'contacts', searchable: true },
  accountSecurity: { twoFactorAuth: false, loginAlert: true },
  appearance: { theme: 'light', fontSize: 'medium' }
})

// 消息列表
const messages = ref<Message[]>([
  { id: 1, title: '系统升级通知', content: '系统将于今晚22:00进行升级维护，预计持续2小时。', type: 'system', isRead: false, createdAt: new Date(2026, 3, 2, 14, 30) },
  { id: 2, title: '新任务提醒', content: '您有一个待处理任务，请及时处理。', type: 'task', isRead: false, createdAt: new Date(2026, 3, 2, 9, 0) },
  { id: 3, title: '会议提醒', content: '下午3点项目启动会，地点：会议室A。', type: 'reminder', isRead: true, createdAt: new Date(2026, 3, 1, 8, 0) }
])

const componentMap: Record<string, any> = {
  profile: ProfileForm,
  password: ChangePassword,
  system: SystemSettings,
  message: MessageCenter,
  help: HelpFeedback
}

const currentComponent = computed(() => componentMap[activeMenu.value] || ProfileForm)

const pageTitle = computed(() => {
  const titles: Record<string, string> = { 
    profile: '个人档案', 
    password: '修改密码',
    system: '系统设置', 
    message: '消息中心', 
    help: '帮助与反馈' 
  }
  return titles[activeMenu.value] || '个人中心'
})

const pageDesc = computed(() => {
  const descs: Record<string, string> = {
    profile: '管理您的个人信息与头像',
    password: '修改登录密码，保障账户安全',
    system: '配置通知、隐私与安全选项',
    message: '查看系统通知与任务提醒',
    help: '常见问题与人工反馈'
  }
  return descs[activeMenu.value] || ''
})

const defaultAvatar = 'https://cube.elemecdn.com/0/88/03b01d2d5f2b9e2e7d5f8e2e7d5f8e2e.png'

const handleUpdateProfile = async () => {
  await userStore.getUserInfo()
  ElMessage.success('更新成功')
}

const handleUpdateAvatar = async () => {
  await userStore.getUserInfo()
}

const handleMarkAsRead = (id: number) => {
  const msg = messages.value.find(m => m.id === id)
  if (msg) msg.isRead = true
}

const handleMarkAllAsRead = () => {
  messages.value.forEach(m => m.isRead = true)
}

const handleClearReadMessages = () => {
  messages.value = messages.value.filter(m => !m.isRead)
}

const handleDeleteMessage = (id: number) => {
  messages.value = messages.value.filter(m => m.id !== id)
}

onMounted(async () => {
  if (!userStore.initialized) {
    userStore.initUserInfo()
  }
  await userStore.getUserInfo()
})
</script>

<style scoped lang="scss">
.personal-center {
  min-height: 100vh;
  background: var(--gray-50);
}

.page-header-simple {
  background: var(--white);
  padding: 20px 24px;
  border-bottom: 1px solid var(--gray-200);

  .header-content {
    display: flex;
    align-items: center;
    gap: 16px;

    .avatar {
      border: 1px solid var(--gray-200);
    }

    .welcome h1 {
      margin: 0 0 4px;
      font-size: 18px;
      font-weight: 600;
      color: var(--gray-900);
    }

    .welcome p {
      margin: 0;
      font-size: 13px;
      color: var(--gray-500);
    }
  }
}

.main-layout {
  display: flex;
  padding: 16px;
  gap: 16px;
  max-width: 1200px;
  margin: 0 auto;

  .sidebar {
    width: 200px;
    flex-shrink: 0;
  }

  .content {
    flex: 1;
    min-width: 0;

    .page-header {
      margin-bottom: 12px;

      h2 {
        font-size: 15px;
        font-weight: 600;
        color: var(--gray-800);
        margin: 0 0 3px;
      }

      .page-desc {
        font-size: 12px;
        color: var(--gray-500);
        margin: 0;
      }
    }
  }
}
</style>
