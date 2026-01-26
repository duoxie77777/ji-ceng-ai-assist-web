import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo, LoginParams, LoginResponse } from '@/types/user'
import { userApi } from '@/api/user/user'
import { useRouter } from 'vue-router'
import { ElMessageBoxPro } from '@/components/custom/ElMessageBoxPro'

// Token存储键名
const TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const USER_INFO_KEY = 'user_info'

// 用户认证Store
export const useUserStore = defineStore('user', () => {
  // ==================== State ====================

  // 用户信息
  const userInfo = ref<UserInfo | null>(null)

  // 访问令牌
  const token = ref<string>('')

  // 刷新令牌
  const refreshToken = ref<string>('')

  // 令牌过期时间
  const tokenExpireTime = ref<number>(0)

  // 是否已登录
  const isLoggedIn = computed(() => !!token.value && !!userInfo.value)

  // 加载状态
  const loading = ref(false)

  // 初始化状态
  const initialized = ref(false)

  // ==================== Getters ====================

  // 用户ID
  const userId = computed(() => userInfo.value?.id)

  // 用户名
  const username = computed(() => userInfo.value?.username)

  // 用户昵称
  const nickname = computed(() => userInfo.value?.nickname || userInfo.value?.username)

  // 用户头像
  const avatar = computed(() => userInfo.value?.avatar)

  // 用户角色
  const roles = computed(() => userInfo.value?.roles || [])

  // 用户权限
  const permissions = computed(() => userInfo.value?.permissions || [])

  // 是否为管理员
  const isAdmin = computed(() => roles.value.includes('admin'))

  // ==================== Actions ====================

  // 初始化用户信息（从localStorage恢复）
  const initUserInfo = () => {
    if (initialized.value) return

    try {
      const savedToken = localStorage.getItem(TOKEN_KEY)
      const savedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
      const savedUserInfo = localStorage.getItem(USER_INFO_KEY)

      if (savedToken) {
        token.value = savedToken
      }

      if (savedRefreshToken) {
        refreshToken.value = savedRefreshToken
      }

      if (savedUserInfo) {
        userInfo.value = JSON.parse(savedUserInfo)
      }

      initialized.value = true
    } catch (error) {
      console.error('初始化用户信息失败:', error)
      clearAuth()
    }
  }

  // 用户登录
  const login = async (params: LoginParams): Promise<LoginResponse> => {
    loading.value = true

    try {
      const response = await userApi.login(params)

      if (response.success && response.token) {
        // 保存认证信息
        await setAuth(response)

        // 获取用户信息
        if (response.userInfo) {
          userInfo.value = response.userInfo
          saveToLocalStorage()
        } else {
          // 如果没有用户信息，尝试获取
          await getUserInfo()
        }

        return {
          success: true,
          message: '登录成功',
          ...response
        }
      } else {
        throw new Error(response.message || '登录失败')
      }
    } catch (error: any) {
      console.error('登录失败:', error)
      return {
        success: false,
        message: error.message || '登录失败，请检查用户名和密码'
      }
    } finally {
      loading.value = false
    }
  }

  // 用户登出
  const logout = async (showConfirm = true) => {
    if (showConfirm) {
      const confirmed = await ElMessageBoxPro.confirm({
        title: '确认退出',
        message: '确定要退出登录吗？',
        type: 'warning',
        confirmButtonText: '确定退出',
        cancelButtonText: '取消'
      })

      if (!confirmed) return
    }

    try {
      // 调用登出API
      await userApi.logout()
    } catch (error) {
      console.error('登出API调用失败:', error)
    } finally {
      // 无论API是否成功，都清除本地认证信息
      clearAuth()

      // 跳转到登录页
      const router = useRouter()
      router.push('/login')
    }
  }

  // 获取用户信息
  const getUserInfo = async () => {
    try {
      loading.value = true
      const response = await userApi.getUserInfo()

      if (response.success && response.data) {
        userInfo.value = response.data
        saveToLocalStorage()
        return response.data
      } else {
        throw new Error(response.message || '获取用户信息失败')
      }
    } catch (error: any) {
      console.error('获取用户信息失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 更新用户信息
  const updateUserInfo = async (info: Partial<UserInfo>) => {
    try {
      loading.value = true
      const response = await userApi.updateUserInfo(info)

      if (response.success && response.data) {
        userInfo.value = { ...userInfo.value, ...response.data }
        saveToLocalStorage()
        return response.data
      } else {
        throw new Error(response.message || '更新用户信息失败')
      }
    } catch (error: any) {
      console.error('更新用户信息失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 刷新令牌
  const refreshAuthToken = async (): Promise<boolean> => {
    if (!refreshToken.value) {
      return false
    }

    try {
      const response = await userApi.refreshToken(refreshToken.value)

      if (response.success && response.token) {
        token.value = response.token
        if (response.refreshToken) {
          refreshToken.value = response.refreshToken
        }
        saveToLocalStorage()
        return true
      }

      return false
    } catch (error) {
      console.error('刷新令牌失败:', error)
      clearAuth()
      return false
    }
  }

  // 设置认证信息
  const setAuth = async (authData: LoginResponse) => {
    token.value = authData.token || ''
    refreshToken.value = authData.refreshToken || ''

    if (authData.expiresIn) {
      tokenExpireTime.value = Date.now() + (authData.expiresIn * 1000)
    }

    saveToLocalStorage()
  }

  // 清除认证信息
  const clearAuth = () => {
    userInfo.value = null
    token.value = ''
    refreshToken.value = ''
    tokenExpireTime.value = 0

    // 清除localStorage
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USER_INFO_KEY)
  }

  // 保存到localStorage
  const saveToLocalStorage = () => {
    if (token.value) {
      localStorage.setItem(TOKEN_KEY, token.value)
    }

    if (refreshToken.value) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken.value)
    }

    if (userInfo.value) {
      localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo.value))
    }
  }

  // 检查令牌是否有效
  const checkTokenValid = (): boolean => {
    if (!token.value) {
      return false
    }

    if (tokenExpireTime.value && Date.now() > tokenExpireTime.value) {
      return false
    }

    return true
  }

  // 初始化
  initUserInfo()

  return {
    // State
    userInfo,
    token,
    refreshToken,
    tokenExpireTime,
    loading,
    initialized,

    // Getters
    isLoggedIn,
    userId,
    username,
    nickname,
    avatar,
    roles,
    permissions,
    isAdmin,

    // Actions
    login,
    logout,
    getUserInfo,
    updateUserInfo,
    refreshAuthToken,
    setAuth,
    clearAuth,
    checkTokenValid,
    initUserInfo
  }
})