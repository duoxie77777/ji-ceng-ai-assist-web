<template>
  <div class="gov-login-container">
    <!-- 背景装饰 -->
    <div class="bg-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
    </div>

    <div class="gov-login-wrapper">
      <!-- 左侧品牌区 -->
      <div class="brand-section">
        <div class="brand-logo">
          <div class="logo-inner">
            <el-icon :size="40">
              <OfficeBuilding />
            </el-icon>
          </div>
          <div class="brand-text">
            <h1>基层AI辅助平台</h1>
            <span class="sub-title">Grassroots AI Intelligence Platform</span>
          </div>
        </div>
        <div class="brand-features">
          <div class="feature-item">
            <el-icon>
              <Check />
            </el-icon> 智能公文处理
          </div>
          <div class="feature-item">
            <el-icon>
              <Check />
            </el-icon> 基层数据洞察
          </div>
          <div class="feature-item">
            <el-icon>
              <Check />
            </el-icon> 高效协同办公
          </div>
        </div>
      </div>

      <!-- 右侧登录注册卡片 -->
      <div class="gov-login-card">
        <div class="card-header">
          <h2>{{ activeTab === 'login' ? '欢迎回来' : '申请加入' }}</h2>
          <p class="tab-switch">
            {{ activeTab === 'login' ? '还没有账号？' : '已有账号？' }}
            <span @click="activeTab = activeTab === 'login' ? 'register' : 'login'">
              {{ activeTab === 'login' ? '立即注册' : '返回登录' }}
            </span>
          </p>
        </div>

        <div class="card-body">
          <!-- 切换动画 -->
          <transition name="fade-transform" mode="out-in">
            <!-- 登录表单 -->
            <el-form v-if="activeTab === 'login'" :model="formData" class="custom-form">
              <el-form-item>
                <el-input v-model="formData.username" placeholder="请输入用户名" size="large" :prefix-icon="User" />
              </el-form-item>
              <el-form-item>
                <el-input v-model="formData.password" type="password" placeholder="请输入密码" size="large"
                  :prefix-icon="Lock" show-password @keyup.enter="handleLogin" />
              </el-form-item>
              <div class="form-actions">
                <el-checkbox v-model="formData.remember">记住登录状态</el-checkbox>
                <el-button link type="primary" class="forgot-btn">忘记密码？</el-button>
              </div>
              <el-button type="primary" class="submit-btn" :loading="loading" @click="handleLogin">
                {{ loading ? '登录中...' : '进入平台' }}
              </el-button>
            </el-form>

            <!-- 注册表单 -->
            <el-form v-else :model="registerData" class="custom-form register-grid">
              <el-form-item class="full-width">
                <el-input v-model="registerData.username" placeholder="请设置用户名（至少3位）" size="large" :prefix-icon="User" />
              </el-form-item>
              <el-form-item>
                <el-input v-model="registerData.password" type="password" placeholder="请设置密码（至少6位）" size="large"
                  :prefix-icon="Lock" show-password />
              </el-form-item>
              <el-form-item>
                <el-input v-model="registerData.confirmPassword" type="password" placeholder="请再次输入密码" size="large"
                  :prefix-icon="Lock" show-password @keyup.enter="handleRegister" />
              </el-form-item>
              <el-form-item class="full-width">
                <el-input v-model="registerData.email" placeholder="电子邮箱（选填）" size="large" :prefix-icon="Message" />
              </el-form-item>
              <el-form-item class="full-width">
                <el-input v-model="registerData.phone" placeholder="联系电话（选填）" size="large" :prefix-icon="Phone" />
              </el-form-item>
              <el-form-item class="full-width">
                <el-input v-model="registerData.department" placeholder="所属部门（选填）" size="large"
                  :prefix-icon="OfficeBuilding" />
              </el-form-item>
              <el-form-item class="full-width">
                <el-input v-model="registerData.position" placeholder="职位（选填）" size="large" :prefix-icon="UserFilled" />
              </el-form-item>
              <el-button type="primary" class="submit-btn full-width" :loading="registerLoading"
                @click="handleRegister">
                {{ registerLoading ? '注册中...' : '完成注册' }}
              </el-button>
            </el-form>
          </transition>
        </div>
      </div>

      <!-- 底部信息 -->
      <div class="gov-footer">
        <p>© 2026 技术支持：政务AI研发中心</p>
        <p><el-icon>
            <WarningFilled />
          </el-icon> 安全加密传输中 | 请妥善保管账号密码</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  OfficeBuilding,
  User,
  Lock,
  Check,
  WarningFilled,
  Message,
  Phone,
  UserFilled,
} from '@element-plus/icons-vue'
import { userApi } from '@/api/user/user'
import { menuApi } from '@/api/menu/menu'
import { transformMenuToRoutes, addDynamicRoutes } from '@/router/utils/dynamicRoutes'
import { post } from '@/utils/request'
import { useUserStore } from '@/store/modules/user'

const router = useRouter()
const userStore = useUserStore()

// 标签切换
const activeTab = ref('login')
const loading = ref(false)
const registerLoading = ref(false)

// 登录表单
const formData = reactive({
  username: '',
  password: '',
  remember: false,
})

// 注册表单
const registerData = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  email: '',
  phone: '',
  department: '',
  position: '',
})

// 登录逻辑
const handleLogin = async () => {
  if (!formData.username || !formData.password) {
    ElMessage.warning('请输入用户名和密码')
    return
  }

  loading.value = true

  try {
    const result = await post('/auth/login', {
      username: formData.username,
      password: formData.password,
    })

    if (result) {
      const { accessToken, refreshToken, user } = result

      userStore.token = accessToken
      userStore.refreshToken = refreshToken || ''
      userStore.userInfo = user
      userStore.saveToLocalStorage()

      ElMessage.success('登录成功')

      const menuList = await menuApi.getMenuList()
      console.log('获取到的菜单列表:', JSON.stringify(menuList, null, 2))
      const routes = transformMenuToRoutes(menuList)
      console.log('转换后的路由:', routes)
      addDynamicRoutes(routes)

      const firstMenu = menuList[0]
      if (firstMenu) {
        router.push(firstMenu.path)
      } else {
        router.push('/home')
      }
    }
  } catch (error: any) {
    console.error('登录失败:', error)
    const errMsg = error.response?.data?.message || error.message || '登录失败，请重试'
    ElMessage.error(errMsg)
  } finally {
    loading.value = false
  }
}

// 注册逻辑
const handleRegister = async () => {
  if (!registerData.username || !registerData.password) {
    ElMessage.warning('请填写用户名和密码')
    return
  }

  if (registerData.password !== registerData.confirmPassword) {
    ElMessage.warning('两次输入的密码不一致')
    return
  }

  if (registerData.username.length < 3) {
    ElMessage.warning('用户名至少 3 位')
    return
  }

  if (registerData.password.length < 6) {
    ElMessage.warning('密码至少 6 位')
    return
  }

  registerLoading.value = true

  try {
    // 生成默认头像（使用用户名首字母）
    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(registerData.username)}&background=random&color=fff&size=200`
    
    const result = await post('/auth/register', {
      username: registerData.username,
      password: registerData.password,
      email: registerData.email || undefined,
      phone: registerData.phone || undefined,
      department: registerData.department || undefined,
      position: registerData.position || undefined,
      avatar: defaultAvatar,
    })

    if (result) {
      ElMessage.success('注册成功，请登录')
      activeTab.value = 'login'
      formData.username = registerData.username
      formData.password = registerData.password

      // 清空注册表单
      Object.assign(registerData, {
        username: '',
        password: '',
        confirmPassword: '',
        email: '',
        phone: '',
        department: '',
        position: '',
      })
    }
  } catch (error: any) {
    console.error('注册失败:', error)
    ElMessage.error(error.message || '注册失败，请重试')
  } finally {
    registerLoading.value = false
  }
}
</script>

<style scoped lang="scss">
/* 现代政务风格登录页 */
.gov-login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f2f5;
  background-image: radial-gradient(at 0% 0%, hsla(210, 100%, 23%, 0.05) 0, transparent 50%),
    radial-gradient(at 100% 100%, hsla(210, 100%, 23%, 0.05) 0, transparent 50%);
  position: relative;
  overflow: hidden;
}

/* 背景模糊装饰 */
.bg-decoration {
  position: absolute;
  width: 100%;
  height: 100%;

  .circle {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    z-index: 0;
  }

  .circle-1 {
    width: 400px;
    height: 400px;
    background: rgba(14, 58, 122, 0.1);
    top: -100px;
    right: -100px;
  }

  .circle-2 {
    width: 300px;
    height: 300px;
    background: rgba(14, 58, 122, 0.08);
    bottom: -50px;
    left: -50px;
  }
}

/* 主容器 */
.gov-login-wrapper {
  z-index: 1;
  display: flex;
  width: 1000px;
  max-width: 95vw;
  height: 600px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 24px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
  position: relative;
}

/* 左侧品牌区域 */
.brand-section {
  flex: 1.2;
  background: linear-gradient(135deg, #0e3a7a 0%, #1e56a0 100%);
  padding: 60px;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 24px 0 0 24px;

  .logo-inner {
    width: 64px;
    height: 64px;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 24px;
  }

  .brand-text h1 {
    font-size: 32px;
    margin: 0;
    font-weight: 600;
    line-height: 1.2;
  }

  .brand-text .sub-title {
    font-size: 14px;
    opacity: 0.7;
    text-transform: uppercase;
  }

  .brand-features {
    margin-top: 40px;
  }

  .feature-item {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 16px;
    font-size: 15px;
  }
}

/* 右侧登录卡片 */
.gov-login-card {
  flex: 1;
  padding: 60px 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: white;
  border-radius: 0 24px 24px 0;

  .card-header h2 {
    font-size: 28px;
    color: #1f2937;
    margin: 0 0 8px 0;
  }

  .tab-switch {
    font-size: 14px;
    color: #6b7280;
  }

  .tab-switch span {
    color: #0e3a7a;
    font-weight: 600;
    cursor: pointer;
    margin-left: 4px;
    transition: color 0.2s;

    &:hover {
      color: #1e56a0;
    }
  }
}

/* 表单样式 */
.custom-form {
  margin-top: 30px;

  :deep(.el-form-item) {
    margin-bottom: 20px;
  }

  :deep(.el-input__wrapper) {
    background-color: #f9fafb;
    border: 1px solid #e5e7eb;
    box-shadow: none !important;
    border-radius: 12px;
    transition: all 0.2s;

    &:hover,
    &.is-focus {
      border-color: #0e3a7a;
      background-color: white;
    }
  }

  .form-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }

  .submit-btn {
    width: 100%;
    height: 48px;
    font-size: 16px;
    border-radius: 12px;
    background: #0e3a7a;
    border: none;
    transition: background 0.2s;

    &:hover {
      background: #1e56a0 !important;
    }
  }
}

/* 注册网格布局 */
.register-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 15px;

  .full-width {
    grid-column: span 2;
  }
}

/* 底部版权 */
.gov-footer {
  position: absolute;
  bottom: -60px;
  width: 100%;
  text-align: center;
  color: #666;
  font-size: 13px;

  p {
    margin: 4px 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
  }
}

/* 切换动画 */
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.3s ease;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* 响应式适配 */
@media (max-width: 850px) {
  .brand-section {
    display: none;
  }

  .gov-login-wrapper {
    width: 450px;
    height: auto;
    min-height: 500px;
    padding-bottom: 40px;
    border-radius: 20px;
  }

  .gov-login-card {
    border-radius: 20px;
    padding: 40px 30px;
  }

  .gov-footer {
    bottom: 10px;
    color: #999;
  }
}

@media (max-width: 480px) {
  .gov-login-wrapper {
    margin: 20px;
  }

  .register-grid {
    grid-template-columns: 1fr;
  }
}
</style>