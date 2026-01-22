<template>
    <div>
        home
        <SvgIcon name="React"/>
        <button @click="handleLogin()">登录</button>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { userApi } from '@/api/user/user'
const username = ref('admin')
const password = ref('123456')

const handleLogin = async () => {
  try {
    const result = await userApi.login({
      username: username.value,
      password: password.value,
    })
    
    // 保存 token
    localStorage.setItem('token', result.token)
    console.log('登录成功', result)
    
    // 获取用户信息
    const userInfo = await userApi.getInfo()
    console.log('用户信息', userInfo)
    
  } catch (error) {
    console.error('登录失败', error)
  }
}
</script>

<style scoped lang="less"></style>