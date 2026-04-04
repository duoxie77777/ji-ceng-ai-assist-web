<template>
  <div class="profile-form">
    <!-- 头像卡片 -->
    <el-card shadow="never" class="avatar-card">
      <div class="avatar-section">
        <div class="avatar-wrapper">
          <el-avatar :size="100" :src="previewAvatar || user?.avatar" />
          <div class="avatar-overlay" @click="triggerUpload">
            <el-icon><Camera /></el-icon>
            <span>更换头像</span>
          </div>
        </div>
        <div class="avatar-info">
          <h3>{{ user?.username || '用户' }}</h3>
          <p>{{ user?.department || '未设置部门' }} · {{ user?.position || '未设置职位' }}</p>
        </div>
        <input 
          ref="fileInput" 
          type="file" 
          accept="image/*" 
          style="display: none" 
          @change="handleFileChange"
        />
      </div>
    </el-card>

    <!-- 基本信息卡片 -->
    <el-card shadow="never" class="info-card">
      <template #header>
        <div class="card-header">
          <span>
            <svg-icon name="notepad__easy" size="20" />
            个人档案
          </span>
          <el-button v-if="!isEditing" type="primary" plain size="small" @click="enterEditMode">
            <el-icon><Edit /></el-icon> 编辑档案
          </el-button>
          <span v-else>
            <el-button type="primary" size="small" @click="saveProfile">保存</el-button>
            <el-button size="small" @click="cancelEdit">取消</el-button>
          </span>
        </div>
      </template>

      <el-form :model="formData" :rules="rules" ref="formRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="账号">
              <el-input v-model="formData.username" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="部门">
              <el-input v-model="formData.department" :disabled="!isEditing" placeholder="请输入部门" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="职位">
              <el-input v-model="formData.position" :disabled="!isEditing" placeholder="请输入职位" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="formData.email" :disabled="!isEditing" placeholder="请输入邮箱" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="电话" prop="phone">
              <el-input v-model="formData.phone" :disabled="!isEditing" placeholder="请输入电话" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Edit, Camera } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/modules/user'

interface UserProfile {
  id?: number
  username?: string
  avatar?: string
  email?: string
  phone?: string
  department?: string
  position?: string
}

const props = defineProps<{ user?: UserProfile }>()
const emit = defineEmits(['updateProfile', 'updateAvatar'])

const userStore = useUserStore()
const isEditing = ref(false)
const fileInput = ref<HTMLInputElement>()
const previewAvatar = ref<string>('')
const formRef = ref()

const formData = reactive({
  username: '',
  email: '',
  phone: '',
  department: '',
  position: ''
})

const rules = {
  email: [
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
}

// 监听用户信息变化
watch(() => props.user, (val) => {
  if (val) {
    formData.username = val.username || ''
    formData.email = val.email || ''
    formData.phone = val.phone || ''
    formData.department = val.department || ''
    formData.position = val.position || ''
  }
}, { immediate: true, deep: true })

const triggerUpload = () => {
  fileInput.value?.click()
}

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  // 预览头像
  const reader = new FileReader()
  reader.onload = (e) => {
    previewAvatar.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
  
  // 上传到服务器
  try {
    const result = await userStore.uploadAvatar(file)
    ElMessage.success('头像上传成功')
    emit('updateAvatar', result.avatar)
  } catch (error: any) {
    ElMessage.error(error.message || '头像上传失败')
    previewAvatar.value = ''
  }
  
  // 清空 input
  target.value = ''
}

const saveProfile = async () => {
  try {
    await formRef.value?.validate()
    await userStore.updateUserInfo({
      email: formData.email,
      phone: formData.phone,
      department: formData.department,
      position: formData.position
    })
    ElMessage.success('档案已更新')
    isEditing.value = false
  } catch (error) {
    // 验证失败
  }
}

const cancelEdit = () => {
  if (props.user) {
    formData.email = props.user.email || ''
    formData.phone = props.user.phone || ''
    formData.department = props.user.department || ''
    formData.position = props.user.position || ''
  }
  isEditing.value = false
}

const enterEditMode = () => {
  isEditing.value = true
}
</script>

<style scoped lang="scss">
.profile-form {
  display: flex;
  flex-direction: column;
  gap: 16px;

  .avatar-card {
    border-radius: 8px;
    border: 1px solid var(--gray-200);

    .avatar-section {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 10px 0;

      .avatar-wrapper {
        position: relative;
        cursor: pointer;

        &:hover .avatar-overlay {
          opacity: 1;
        }

        .avatar-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: white;
          opacity: 0;
          transition: opacity 0.3s;

          span {
            font-size: 12px;
            margin-top: 4px;
          }
        }
      }

      .avatar-info {
        h3 {
          margin: 0 0 6px;
          font-size: 18px;
          font-weight: 600;
          color: var(--gray-900);
        }

        p {
          margin: 0;
          font-size: 13px;
          color: var(--gray-500);
        }
      }
    }
  }

  .info-card {
    border-radius: 8px;
    border: 1px solid var(--gray-200);

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
}
</style>
