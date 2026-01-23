<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1>欢迎登录</h1>
        <p>基层AI辅助平台</p>
      </div>

      <form class="login-form" @submit.prevent="handleLogin">
        <div class="form-item">
          <label>用户名</label>
          <input
            v-model="formData.username"
            type="text"
            placeholder="请输入用户名"
            autocomplete="username"
          />
        </div>

        <div class="form-item">
          <label>密码</label>
          <input
            v-model="formData.password"
            type="password"
            placeholder="请输入密码"
            autocomplete="current-password"
          />
        </div>

        <button type="submit" class="login-btn" :disabled="loading">
          {{ loading ? '登录中...' : '登 录' }}
        </button>

        <div class="login-tip">
          <p>测试账号：admin / 123456</p>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { userApi } from '@/api/user/user'
import { menuApi } from '@/api/menu/menu'
import { transformMenuToRoutes, addDynamicRoutes } from '@/router/utils/dynamicRoutes'

const router = useRouter()

// 表单数据
const formData = reactive({
  username: 'admin',
  password: '123456'
})

// 加载状态
const loading = ref(false)

/**
 * 处理登录
 */
const handleLogin = async () => {
  // 表单验证
  if (!formData.username || !formData.password) {
    alert('请输入用户名和密码')
    return
  }

  loading.value = true

  try {
    // 1. 调用登录接口
    const loginResult = await userApi.login(formData)
    localStorage.setItem('token', loginResult.token)

    // 2. 获取菜单数据
    const menuList = await menuApi.getMenuList()

    // 3. 转换为路由配置并添加到路由表
    const routes = transformMenuToRoutes(menuList)
    addDynamicRoutes(routes)

    // 4. 跳转到首页（第一个菜单）
    const firstRoute = menuList[0]?.path || '/home'
    router.push(firstRoute)
  } catch (error: any) {
    console.error('登录失败:', error)
    alert(error.message || '登录失败，请重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="less">
.login-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gradient-login-bg);
  position: relative;
  overflow: hidden;

  // 添加装饰性背景元素
  &::before,
  &::after {
    content: '';
    position: absolute;
    border-radius: 50%;
    background: var(--bg-login-decoration);
  }

  &::before {
    width: 600px;
    height: 600px;
    top: -200px;
    right: -200px;
  }

  &::after {
    width: 400px;
    height: 400px;
    bottom: -150px;
    left: -150px;
  }
}

.login-card {
  width: 420px;
  padding: var(--spacing-xxxl) var(--spacing-xxl);
  background: var(--bg-card);
  border-radius: var(--radius-xxl);
  box-shadow: var(--shadow-login-card);
  position: relative;
  z-index: 1;
}

.login-header {
  text-align: center;
  margin-bottom: var(--spacing-xxl);

  h1 {
    font-size: 28px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 var(--spacing-sm) 0;
  }

  p {
    font-size: 14px;
    color: var(--text-tertiary);
    margin: 0;
  }
}

.login-form {
  .form-item {
    margin-bottom: 20px;

    label {
      display: block;
      margin-bottom: var(--spacing-sm);
      font-size: 14px;
      font-weight: 500;
      color: var(--text-primary);
    }

    input {
      width: 100%;
      height: 44px;
      padding: 0 var(--spacing-lg);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      font-size: 14px;
      box-sizing: border-box;
      transition: var(--transition-fast);
      background: var(--bg-page);
      color: var(--text-primary);

      &:focus {
        outline: none;
        border-color: var(--color-primary);
        background: var(--bg-card);
        box-shadow: var(--shadow-input-focus);
      }

      &::placeholder {
        color: var(--text-placeholder);
      }
    }
  }

  .login-btn {
    width: 100%;
    height: 44px;
    margin-top: var(--spacing-sm);
    background: var(--color-primary);
    color: var(--text-white);
    border: none;
    border-radius: var(--radius-lg);
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    transition: var(--transition-fast);

    &:hover:not(:disabled) {
      background: var(--color-primary-hover);
      transform: translateY(-1px);
      box-shadow: var(--shadow-button-hover);
    }

    &:active:not(:disabled) {
      transform: translateY(0);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  .login-tip {
    margin-top: var(--spacing-xl);
    padding-top: 20px;
    border-top: 1px solid var(--border-color);
    text-align: center;

    p {
      font-size: 12px;
      color: var(--text-tertiary);
      margin: 0;
    }
  }
}
</style>
