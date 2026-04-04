<template>
  <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" class="create-form">
    <el-form-item label="事项类型" prop="type">
      <el-select v-model="form.type" placeholder="请选择" clearable>
        <el-option v-for="item in APPROVAL_TYPE_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
    </el-form-item>

    <el-form-item label="事项标题" prop="title">
      <el-input v-model="form.title" placeholder="请输入事项标题" />
    </el-form-item>

    <el-form-item label="负责人员" prop="chargeUsers">
      <el-select v-model="form.chargeUsers" multiple placeholder="选择负责领导">
        <el-option v-for="item in CHARGE_USER_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
    </el-form-item>

    <el-form-item label="内容说明" prop="content">
      <el-input v-model="form.content" type="textarea" :rows="4" placeholder="请输入内容说明" />
    </el-form-item>

    <el-form-item label="附件上传">
      <el-upload v-model:file-list="form.fileList" :auto-upload="false" :on-change="handleFileChange"
        :before-upload="beforeFileUpload" list-type="text">
        <el-button type="primary" size="small">选择文件</el-button>
      </el-upload>
    </el-form-item>

    <div class="btns">
      <el-button @click="emit('cancel')">取消</el-button>
      <el-button @click="handleDraft" :loading="isSubmitting">保存草稿</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="isSubmitting">提交上报</el-button>
    </div>
  </el-form>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { UploadFile, UploadProps, FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import {
  COMMON_TEXT,
  APPROVAL_TYPE_OPTIONS,
  CHARGE_USER_OPTIONS,
  UPLOAD_CONFIG,
  getEmptyForm,
  isValidFile,
  ApprovalTypeEnum
} from '../utils/types'
import type { CreateApprovalForm } from '../utils/types'
import { useUserStore } from '@/store/modules/user'

const props = defineProps<{ initialData?: CreateApprovalForm | null }>()
const emit = defineEmits(['submit', 'draft', 'cancel'])

// 获取用户 store
const userStore = useUserStore()

const form = ref<CreateApprovalForm>(getEmptyForm())
watch(() => props.initialData, (data) => {
  if (data) form.value = { ...data }
  else form.value = getEmptyForm()
}, { immediate: true })

const formRef = ref<FormInstance>()
const isSubmitting = ref(false)

const rules: FormRules = {
  type: [{ required: true, message: COMMON_TEXT.FORM_REQUIRED_TYPE, trigger: 'change' }],
  title: [{ required: true, message: COMMON_TEXT.FORM_REQUIRED_TITLE, trigger: 'blur' }],
  chargeUsers: [{ required: true, message: COMMON_TEXT.FORM_REQUIRED_CHARGE_USER, trigger: 'change' }],
  content: [{ required: true, message: COMMON_TEXT.FORM_REQUIRED_CONTENT, trigger: 'blur' }]
}

const beforeFileUpload: UploadProps['beforeUpload'] = (file) => {
  if (file.size > UPLOAD_CONFIG.MAX_SIZE) {
    ElMessage.error(`文件大小不能超过${UPLOAD_CONFIG.MAX_SIZE / 1024 / 1024}MB`)
    return false
  }
  const ext = '.' + file.name.split('.').pop()?.toLowerCase()
  if (!UPLOAD_CONFIG.ACCEPT_TYPES.includes(ext as any)) {
    ElMessage.error(`仅支持上传${UPLOAD_CONFIG.ACCEPT_TYPES.join('、')}格式文件`)
    return false
  }
  return true
}

const handleFileChange = (file: UploadFile) => {
  if (file.status === UPLOAD_CONFIG.FILE_STATUS.READY) {
    form.value.fileList = form.value.fileList.filter(f => f.uid !== file.uid)
    form.value.fileList.push(file)
  }
}

const handleDraft = () => {
  emit('draft', { ...form.value })
}

const handleSubmit = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
    isSubmitting.value = true
    
    // 上传文件，获取文件 URL
    const uploadedFiles: { name: string; url: string }[] = []
    
    for (const fileItem of form.value.fileList) {
      // el-upload 的 file 对象有 raw 属性
      const rawFile = fileItem.raw as File | undefined
      
      if (rawFile) {
        try {
          const result = await uploadFile(rawFile)
          uploadedFiles.push({ name: result.name, url: result.url })
        } catch (err: any) {
          console.error('文件上传失败:', fileItem.name, err)
          ElMessage.error(`文件 ${fileItem.name} 上传失败`)
        }
      } else if (fileItem.url) {
        // 如果没有 raw，可能是已上传过的文件，直接使用 url
        uploadedFiles.push({ name: fileItem.name, url: fileItem.url })
      }
    }
    
    emit('submit', { ...form.value, files: uploadedFiles })
  } catch (err) {
    console.error(err)
  } finally {
    isSubmitting.value = false
  }
}

// 使用消息模块的文件上传接口
const uploadFile = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  // uploaderId 必须，且后端期望 number 类型
  formData.append('uploaderId', String(userStore.userInfo?.id || 1))
  
  const response = await fetch('/api/message/files/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
    },
    body: formData
  })
  
  const result = await response.json()
  
  if (!response.ok || result.code !== 0) {
    throw new Error(result.message || '上传失败')
  }
  
  // 返回上传后的文件信息
  return {
    url: result.data.fileUrl,
    name: result.data.originalName || file.name
  }
}
</script>

<style scoped lang="less">
.create-form {
  padding: 20px 0;
  background: var(--white);
}

.btns {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 20px;
  border-top: 1px solid var(--gray-100);
}
</style>