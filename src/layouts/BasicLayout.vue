<template>
  <div class="feishu-layout">
    <!-- 左侧侧边栏 -->
    <aside :class="['sidebar', { collapsed: isCollapsed }]">
      <!-- Logo 区域 -->
      <div class="logo-section">
        <div class="logo">
          <span v-if="!isCollapsed">
            <img v-if="themeStore.isDark" src="@/assets/logoText-dark.png" alt="Logo">
            <img v-else src="@/assets/logoText.png" alt="Logo">
          </span>
          <span v-else>
            <img v-if="themeStore.isDark" src="@/assets/logo-dark.png" alt="Logo">
            <img v-else src="@/assets/logo.png" alt="Logo">
          </span>
        </div>
      </div>

      <!-- 菜单列表 -->
      <nav class="nav-menu">
        <div v-for="menu in menuList" :key="menu.path" :class="['menu-item', { active: isMenuActive(menu.path) }]"
          @click="navigateTo(menu.path)">
          <span class="menu-icon">
            <SvgIcon v-if="menu.meta.icon" :name="menu.meta.icon" :color="isMenuActive(menu.path) ? '#ffffff' : ''" />
          </span>
          <span v-if="!isCollapsed" class="menu-title">{{ menu.meta.title }}</span>
        </div>
      </nav>

      <!-- 折叠按钮 -->
      <div class="collapse-btn" @click="toggleCollapse">
        <span class="collapse-icon">{{ isCollapsed ? '→' : '←' }}</span>
      </div>
    </aside>

    <!-- 主体区域 -->
    <div class="main-container">
      <!-- 顶部导航栏 -->
      <header class="header">
        <div class="header-left">
          <div class="breadcrumb">
            <span class="breadcrumb-item">{{ currentPageTitle }}</span>
          </div>
        </div>
        <div class="header-right">
          <!-- 搜索框 -->
          <el-input class="search-box" placeholder="搜索..." clearable>
            <template #prefix>
              <el-icon class="search-icon">
                <Search />
              </el-icon>
            </template>
          </el-input>

          <!-- 主题切换 -->
          <div class="theme-toggle" @click="themeStore.toggleTheme">
            <span class="theme-icon">{{ themeStore.isDark ? '🌙' : '☀️' }}</span>
          </div>

          <!-- 用户信息 -->
          <div class="user-section" @click="toggleUserMenu">
            <div class="user-avatar">{{ userInitial }}</div>
            <span class="user-name">{{ userInfo?.username || '用户' }}</span>
            <span class="dropdown-icon">▼</span>
          </div>

          <!-- 用户菜单下拉 -->
          <div v-if="showUserMenu" class="user-menu-dropdown">
            <div class="user-info-header">
              <div class="user-avatar-large">{{ userInitial }}</div>
              <div class="user-details">
                <div class="username">{{ userInfo?.username || '用户' }}</div>
                <div class="user-email">{{ userInfo?.email || 'user@example.com' }}</div>
              </div>
            </div>
            <div class="menu-divider"></div>
            <div class="menu-item" @click="handleLogout">
              <span class="menu-icon">🚪</span>
              <span>退出登录</span>
            </div>
          </div>
        </div>
      </header>

      <!-- 内容区域 -->
      <!-- <el-watermark :font="watermarkFont" :content="watermarkContent"> -->
        <main class="content">
          <router-view />
        </main>
      <!-- </el-watermark> -->

    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import SvgIcon from '@/components/SvgIcon/SvgIcon.vue'
import { userApi } from '@/api/user/user'
import { menuApi } from '@/api/menu/menu'
import { resetPermissionGuard } from '@/router/guards/permission'
import type { MenuItemMock } from '../../mock/menu'
import { ElMessageBoxPro } from '@/components/custom/ElMessageBoxPro'
import { getFormattedCurrentTime } from "@/utils/time/timeUtils"
import { useUserStore, useThemeStore } from '@/store'
const router = useRouter()
const route = useRoute()
const themeStore = useThemeStore()

// 状态
const isCollapsed = ref(false)
const showUserMenu = ref(false)
const userInfo = ref<any>(null)
const menuList = ref<MenuItemMock[]>([])


// 水印内容(用户姓名+时间)
const watermarkContent = ref(['admin', getFormattedCurrentTime()])
const watermarkFont = reactive({
  color: 'rgba(0, 0, 0, .15)',
  fontSize: 14,
})

// 计算属性
const userInitial = computed(() => {
  return userInfo.value?.username?.charAt(0).toUpperCase() || 'U'
})

const currentPageTitle = computed(() => {
  const currentMenu = menuList.value.find(menu => route.path.startsWith(menu.path))
  return currentMenu?.meta.title || '首页'
})

// 方法
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const isMenuActive = (path: string) => {
  return route.path.startsWith(path)
}

const navigateTo = (path: string) => {
  router.push(path)
}

const handleLogout = async () => {
  try {
    await ElMessageBoxPro.confirm({
      message: '确定要退出登录吗？'
    })
    await userApi.logout()
    localStorage.removeItem('token')
    resetPermissionGuard()
    router.push('/login')
  } catch (error: any) {
    if (error === 'cancel' || error?.message?.includes('cancel')) {
      return
    }
    console.error('退出登录失败:', error)
  }
}

// 加载数据
onMounted(async () => {
  try {
    // 加载用户信息
    userInfo.value = await userApi.getInfo()

    // 加载菜单数据
    const menus = await menuApi.getMenuList()
    menuList.value = menus
  } catch (error) {
    console.error('加载数据失败:', error)
  }
})

// 点击外部关闭用户菜单
watch(showUserMenu, (newVal) => {
  if (newVal) {
    const handler = () => {
      showUserMenu.value = false
      document.removeEventListener('click', handler)
    }
    setTimeout(() => {
      document.addEventListener('click', handler)
    }, 0)
  }
})

</script>

<style scoped lang="less">
.feishu-layout {
  display: flex;
  height: 100vh;
  background: var(--gray-50);
  overflow: hidden;
  transition: all 0.2s;
}

// 侧边栏样式
.sidebar {
  width: 240px;
  background: var(--white);
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  position: relative;
  z-index: 100;
  user-select: none;

  &.collapsed {
    width: 64px;
  }
}

.logo-section {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  // padding: 0 16px;
  border-bottom: 1px solid var(--gray-200);
}

.logo {
  display: flex;
  align-items: center;
  color: var(--gray-900);
  font-weight: 600;
  font-size: 18px;
  cursor: pointer;

  .logo-text {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .logo-icon {
    font-size: 20px;
    font-weight: bold;
  }

  img {
    width: 100%;
    height: 36px;
  }
}

.nav-menu {
  flex: 1;
  padding: 8px 0;
  overflow-y: auto;
  overflow-x: hidden;
  border-right: 1px solid var(--gray-200);

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--gray-400);
    border-radius: 2px;
  }
}

.menu-item {
  display: flex;
  align-items: center;
  height: 40px;
  padding: 0 16px;
  margin: 2px 8px;
  border-radius: 6px;
  color: var(--gray-600);
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    background: var(--gray-100);
    color: var(--blue-500);
  }

  &.active {
    background: var(--blue-500);
    color: var(--white);
  }

  .menu-icon {
    font-size: 18px;
    margin-right: 12px;
    min-width: 18px;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;

    svg {
      fill: currentColor;
    }
  }

  .menu-title {
    font-size: 14px;
    flex: 1;
  }
}

.sidebar.collapsed .menu-item {
  justify-content: center;
  padding: 0;

  .menu-icon {
    margin-right: 0;
  }
}

.collapse-btn {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-top: 1px solid var(--gray-200);
  cursor: pointer;
  color: var(--gray-600);
  transition: all 0.2s;
  border-right: 1px solid var(--gray-200);

  &:hover {
    background: var(--gray-100);
    color: var(--blue-500);
  }

  .collapse-icon {
    font-size: 14px;
  }
}

// 主容器样式
.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

// 顶部导航栏
.header {
  height: 56px;
  background: var(--white);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  border-bottom: 1px solid var(--gray-200);
  box-shadow: var(--shadow-sm);
  transition: all 0.2s;
}

.header-left {
  display: flex;
  align-items: center;
}

.breadcrumb {
  display: flex;
  align-items: center;

  .breadcrumb-item {
    font-size: 16px;
    font-weight: 500;
    color: var(--gray-900);
  }
}

.header-right {
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
}

.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: var(--gray-100);
  }

  .theme-icon {
    font-size: 18px;
  }
}

.search-box {
  width: 200px;

  :deep(.el-input__wrapper) {
    background: var(--gray-100);
    box-shadow: none;
    border-radius: 8px;
    padding: 4px 12px;
    transition: all 0.2s;
    height: 32px;

    &:hover {
      background: var(--gray-100);
    }

    &.is-focus {
      background: var(--white);
      box-shadow: var(--shadow-focus);
    }
  }

  :deep(.el-input__inner) {
    color: var(--gray-900);
    font-size: 14px;
    height: 100%;
    line-height: 1;

    &::placeholder {
      color: var(--gray-400);
    }
  }

  :deep(.el-input__prefix) {
    color: var(--gray-500);
    font-size: 14px;
  }

  :deep(.el-input__suffix) {
    color: var(--gray-500);
  }
}

.user-section {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: var(--gray-100);
  }
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--blue-500) 0%, var(--purple-500) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--white);
  font-size: 14px;
  font-weight: 500;
}

.user-name {
  font-size: 14px;
  color: var(--gray-900);
  font-weight: 500;
}

.dropdown-icon {
  font-size: 10px;
  color: var(--gray-500);
  transition: transform 0.2s;
}

.user-menu-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: var(--white);
  border-radius: 12px;
  box-shadow: var(--shadow-md);
  min-width: 280px;
  padding: 8px;
  z-index: 1000;

  .user-info-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;

    .user-avatar-large {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--blue-500) 0%, var(--purple-500) 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--white);
      font-size: 18px;
      font-weight: 600;
      flex-shrink: 0;
    }

    .user-details {
      flex: 1;
      min-width: 0;

      .username {
        font-size: 15px;
        font-weight: 600;
        color: var(--gray-900);
        margin-bottom: 4px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .user-email {
        font-size: 12px;
        color: var(--gray-500);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }

  .menu-divider {
    height: 1px;
    background: var(--gray-200);
    margin: 8px 0;
  }

  .menu-item {
    display: flex;
    align-items: center;
    padding: 10px 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    color: var(--gray-900);
    font-size: 14px;

    &:hover {
      background: var(--gray-100);
    }

    .menu-icon {
      margin-right: 10px;
      font-size: 16px;
    }
  }
}

// 内容区域
.content {
  flex: 1;
  overflow-y: auto;
  background: var(--gray-50);
  height: calc(100vh - 56px);

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--gray-400);
    border-radius: 4px;

    &:hover {
      background: var(--gray-500);
    }
  }
}
</style>
