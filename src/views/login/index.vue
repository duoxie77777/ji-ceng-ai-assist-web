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
  background: linear-gradient(135deg, var(--blue-500) 0%, var(--purple-500) 100%);
  position: relative;
  overflow: hidden;

  // 添加装饰性背景元素
  &::before,
  &::after {
    content: '';
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
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
  padding: 48px 40px;
  background: var(--white);
  border-radius: 16px;
  box-shadow: var(--shadow-login);
  position: relative;
  z-index: 1;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;

  h1 {
    font-size: 28px;
    font-weight: 600;
    color: var(--gray-900);
    margin: 0 0 8px 0;
  }

  p {
    font-size: 14px;
    color: var(--gray-500);
    margin: 0;
  }
}

.login-form {
  .form-item {
    margin-bottom: 20px;

    label {
      display: block;
      margin-bottom: 8px;
      font-size: 14px;
      font-weight: 500;
      color: var(--gray-900);
    }

    input {
      width: 100%;
      height: 44px;
      padding: 0 16px;
      border: 1px solid var(--gray-200);
      border-radius: 8px;
      font-size: 14px;
      box-sizing: border-box;
      transition: all 0.2s;
      background: var(--gray-50);
      color: var(--gray-900);

      &:focus {
        outline: none;
        border-color: var(--blue-500);
        background: var(--white);
        box-shadow: var(--shadow-focus);
      }

      &::placeholder {
        color: var(--gray-400);
      }
    }
  }

  .login-btn {
    width: 100%;
    height: 44px;
    margin-top: 8px;
    background: var(--blue-500);
    color: var(--white);
    border: none;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;

    &:hover:not(:disabled) {
      background: var(--blue-400);
      transform: translateY(-1px);
      box-shadow: var(--shadow-blue-lg);
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
    margin-top: 24px;
    padding-top: 20px;
    border-top: 1px solid var(--gray-200);
    text-align: center;

    p {
      font-size: 12px;
      color: var(--gray-500);
      margin: 0;
    }
  }
}
</style>
