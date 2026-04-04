<template>
  <div class="change-password">
    <el-card shadow="never" class="info-card">
      <template #header>
        <div class="card-header">
          <span>
            <svg-icon name="lock" size="20" />
            修改密码
          </span>
        </div>
      </template>

      <el-form :model="formData" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="原密码" prop="oldPassword">
          <el-input 
            v-model="formData.oldPassword" 
            type="password" 
            placeholder="请输入原密码"
            show-password
          />
        </el-form-item>
        
        <el-form-item label="新密码" prop="newPassword">
          <el-input 
            v-model="formData.newPassword" 
            type="password" 
            placeholder="请输入新密码（至少6位）"
            show-password
          />
        </el-form-item>
        
        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input 
            v-model="formData.confirmPassword" 
            type="password" 
            placeholder="请再次输入新密码"
            show-password
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleSubmit">
            确认修改
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/modules/user'

const userStore = useUserStore()
const formRef = ref()
const loading = ref(false)

const formData = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const validateConfirmPassword = (rule: any, value: string, callback: any) => {
  if (value !== formData.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const rules = {
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    
    loading.value = true
    const result = await userStore.changePassword(formData.oldPassword, formData.newPassword)
    
    if (result.success) {
      ElMessage.success(result.message)
      handleReset()
    } else {
      ElMessage.error(result.message)
    }
  } catch (error) {
    // 验证失败
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  formRef.value?.resetFields()
}
</script>

<style scoped lang="scss">
.change-password {
  .info-card {
    border-radius: 8px;
    background: var(--white);
    border: 1px solid var(--gray-200);
    max-width: 500px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--gray-200);
    padding-bottom: 12px;
  }

  :deep(.el-input__wrapper) {
    border-radius: 6px;
  }
}
</style>
