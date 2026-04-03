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
import { ref, reactive, watch } from 'vue'
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

const props = defineProps<{ initialData?: CreateApprovalForm | null }>()
const emit = defineEmits(['submit', 'draft', 'cancel'])

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
    const files = form.value.fileList.filter(isValidFile).map(f => ({ name: f.name, raw: f.raw }))
    emit('submit', { ...form.value, files })
  } catch (err) {
    console.error(err)
  } finally {
    isSubmitting.value = false
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