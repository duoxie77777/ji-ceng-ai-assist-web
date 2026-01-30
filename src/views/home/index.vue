<template>
  <div class="home-page">
    我是home
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { userApi } from '@/api/user/user'
import { resetPermissionGuard } from '@/router/guards/permission'

const router = useRouter()
const userInfo = ref<any>(null)

// 获取用户信息
onMounted(async () => {
  try {
    userInfo.value = await userApi.getInfo()
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
})

// 退出登录
const handleLogout = async () => {
  try {
    await userApi.logout()
  } catch (error) {
    console.error('退出登录失败:', error)
  } finally {
    // 清除本地数据
    localStorage.removeItem('token')
    resetPermissionGuard()
    // 跳转到登录页
    router.push('/login')
  }
}
</script>

<style scoped lang="less">
.home-page {
  padding: 24px;
  max-width: 100%;
  height: 100%;
  background: var(--gray-50);
}

</style>