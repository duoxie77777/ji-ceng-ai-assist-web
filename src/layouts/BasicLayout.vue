<template>
  <div class="feishu-layout">
    <!-- 左侧侧边栏 -->
    <aside :class="['sidebar', { collapsed: isCollapsed }]">
      <!-- Logo 区域 -->
      <div class="logo-section">
        <div class="logo">
          <span v-if="!isCollapsed" class="logo-text">基层AI</span>
          <span v-else class="logo-icon">AI</span>
        </div>
      </div>

      <!-- 菜单列表 -->
      <nav class="nav-menu">
        <div
          v-for="menu in menuList"
          :key="menu.path"
          :class="['menu-item', { active: isMenuActive(menu.path) }]"
          @click="navigateTo(menu.path)"
        >
          <span class="menu-icon">
            <SvgIcon 
              v-if="menu.meta.icon" 
              :name="menu.meta.icon" 
              :size="18"
              :color="isMenuActive(menu.path) ? '#ffffff' : ''"
            />
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
          <el-input
            class="search-box"
            placeholder="搜索..."
            clearable
          >
            <template #prefix>
              <el-icon class="search-icon">
                <Search />
              </el-icon>
            </template>
          </el-input>
          
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
      <main class="content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import SvgIcon from '@/components/SvgIcon/SvgIcon.vue'
import { userApi } from '@/api/user/user'
import { menuApi } from '@/api/menu/menu'
import { resetPermissionGuard } from '@/router/guards/permission'
import type { MenuItemMock } from '../../mock/menu'
const router = useRouter()
const route = useRoute()

// 状态
const isCollapsed = ref(false)
const showUserMenu = ref(false)
const userInfo = ref<any>(null)
const menuList = ref<MenuItemMock[]>([])

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
    await userApi.logout()
  } catch (error) {
    console.error('退出登录失败:', error)
  } finally {
    localStorage.removeItem('token')
    resetPermissionGuard()
    router.push('/login')
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
  background: var(--bg-page);
  overflow: hidden;
  transition: var(--transition-fast);
}

// 侧边栏样式
.sidebar {
  width: var(--sidebar-width);
  background: var(--bg-sidebar);
  display: flex;
  flex-direction: column;
  transition: var(--transition-normal);
  position: relative;
  z-index: 100;

  &.collapsed {
    width: var(--sidebar-collapsed-width);
  }
}

.logo-section {
  height: var(--header-height);
  display: flex;
  align-items: center;
  padding: 0 var(--spacing-lg);
  border-bottom: 1px solid var(--border-sidebar);
}

.logo {
  display: flex;
  align-items: center;
  color: var(--text-sidebar);
  font-weight: 600;
  font-size: 18px;

  .logo-text {
    display: flex;
    align-items: center;
  }

  .logo-icon {
    font-size: 20px;
    font-weight: bold;
  }
}

.nav-menu {
  flex: 1;
  padding: var(--spacing-sm) 0;
  overflow-y: auto;
  overflow-x: hidden;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--scrollbar-thumb);
    border-radius: 2px;
  }
}

.menu-item {
  display: flex;
  align-items: center;
  height: 40px;
  padding: 0 var(--spacing-lg);
  margin: 2px var(--spacing-sm);
  border-radius: var(--radius-md);
  color: var(--text-sidebar-secondary);
  cursor: pointer;
  transition: var(--transition-fast);
  white-space: nowrap;

  &:hover {
    background: var(--bg-sidebar-hover);
    color: var(--text-sidebar-hover);
  }

  &.active {
    background: var(--color-primary);
    color: var(--text-white);
  }

  .menu-icon {
    font-size: 18px;
    margin-right: var(--spacing-md);
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
  border-top: 1px solid var(--border-sidebar);
  cursor: pointer;
  color: var(--text-sidebar-secondary);
  transition: var(--transition-fast);

  &:hover {
    background: var(--bg-sidebar-hover);
    color: var(--text-sidebar-hover);
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
  height: var(--header-height);
  background: var(--bg-card);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--spacing-xl);
  border-bottom: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  transition: var(--transition-fast);
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
    color: var(--text-primary);
  }
}

.header-right {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.search-box {
  width: 200px;

  :deep(.el-input__wrapper) {
    background: var(--bg-hover);
    box-shadow: none;
    border-radius: var(--radius-lg);
    padding: 4px 12px;
    transition: var(--transition-fast);
    height: 32px;

    &:hover {
      background: var(--bg-hover);
    }

    &.is-focus {
      background: var(--bg-card);
      box-shadow: var(--shadow-search-focus);
    }
  }

  :deep(.el-input__inner) {
    color: var(--text-primary);
    font-size: 14px;
    height: 100%;
    line-height: 1;

    &::placeholder {
      color: var(--text-placeholder);
    }
  }

  :deep(.el-input__prefix) {
    color: var(--text-tertiary);
    font-size: 14px;
  }

  :deep(.el-input__suffix) {
    color: var(--text-tertiary);
  }
}

.user-section {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: 6px var(--spacing-md);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: var(--transition-fast);

  &:hover {
    background: var(--bg-hover);
  }
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--gradient-avatar);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-white);
  font-size: 14px;
  font-weight: 500;
}

.user-name {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 500;
}

.dropdown-icon {
  font-size: 10px;
  color: var(--text-tertiary);
  transition: transform 0.2s;
}

.user-menu-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: var(--spacing-sm);
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-user-menu);
  min-width: 280px;
  padding: var(--spacing-sm);
  z-index: 1000;

  .user-info-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-md);

    .user-avatar-large {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: var(--gradient-avatar);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-white);
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
        color: var(--text-primary);
        margin-bottom: var(--spacing-xs);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .user-email {
        font-size: 12px;
        color: var(--text-tertiary);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }

  .menu-divider {
    height: 1px;
    background: var(--border-color);
    margin: var(--spacing-sm) 0;
  }

  .menu-item {
    display: flex;
    align-items: center;
    padding: 10px var(--spacing-md);
    border-radius: var(--radius-lg);
    cursor: pointer;
    transition: var(--transition-fast);
    color: var(--text-primary);
    font-size: 14px;

    &:hover {
      background: var(--bg-hover);
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
  background: var(--bg-page);

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--scrollbar-thumb);
    border-radius: var(--radius-sm);

    &:hover {
      background: var(--scrollbar-thumb-hover);
    }
  }
}
</style>
