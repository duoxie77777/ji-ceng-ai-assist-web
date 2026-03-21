<template>
  <!-- 新建审批表单：包含基础信息填写、附件上传、提交/取消按钮 -->
  <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" class="create-form">
    <el-form-item label="事项类型" prop="type">
      <el-select v-model="form.type" :placeholder="CREATE_APPROVAL_LOCALE.PLACEHOLDER.TYPE" clearable>
        <el-option v-for="item in ApprovalTypeConfig" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
    </el-form-item>

    <el-form-item label="事项标题" prop="title">
      <el-input v-model="form.title" :placeholder="CREATE_APPROVAL_LOCALE.PLACEHOLDER.TITLE" />
    </el-form-item>

    <el-form-item label="负责人员" prop="chargeUsers">
      <el-select v-model="form.chargeUsers" multiple :placeholder="CREATE_APPROVAL_LOCALE.PLACEHOLDER.CHARGE_USERS">
        <el-option v-for="item in CHARGE_USER_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
    </el-form-item>

    <el-form-item label="内容说明" prop="content">
      <el-input v-model="form.content" type="textarea" :rows="4"
        :placeholder="CREATE_APPROVAL_LOCALE.PLACEHOLDER.CONTENT" />
    </el-form-item>

    <el-form-item label="附件上传">
      <!-- 附件上传组件：手动上传、文件校验、列表展示 -->
      <el-upload v-model:file-list="form.fileList" :auto-upload="false" :on-change="handleFileChange"
        :before-upload="beforeFileUpload" list-type="text" placeholder="CREATE_APPROVAL_LOCALE.PLACEHOLDER.FILE_UPLOAD">
        <el-button type="primary" size="small">{{ CREATE_APPROVAL_LOCALE.BUTTON.SELECT_FILE }}</el-button>
      </el-upload>
    </el-form-item>

    <!-- 操作按钮组：取消/提交 -->
    <div class="btns">
      <el-button @click="handleCancel">{{ CREATE_APPROVAL_LOCALE.BUTTON.CANCEL }}</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="isSubmitting">
        {{ CREATE_APPROVAL_LOCALE.BUTTON.SUBMIT }}
      </el-button>
    </div>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { UploadFile, UploadProps } from 'element-plus'
import { ElMessage } from 'element-plus'
import {
  COMMON_TEXT,
  ApprovalTypeConfig,
  ApprovalTypeEnum,
  CHARGE_USER_OPTIONS,
  UPLOAD_CONFIG,
  CREATE_APPROVAL_LOCALE,
  isValidFile,
} from '../utils/types'
import type { CreateApprovalForm } from '../utils/types'

// 定义向外触发的事件：提交表单、取消创建
const emit = defineEmits(['submit', 'cancel'])

// 表单实例：用于表单校验
const formRef = ref()
// 提交加载状态：控制按钮loading
const isSubmitting = ref(false)

// 表单数据：初始化新建审批表单默认值
const form = ref<CreateApprovalForm>({
  type: ApprovalTypeEnum.DEFAULT,
  title: '',
  content: '',
  chargeUsers: [],
  fileList: [],
  status: 'draft'
})

// 表单校验规则：必填项校验
const rules = reactive({
  type: [{ required: true, message: COMMON_TEXT.FORM_REQUIRED_TYPE, trigger: 'change' }],
  title: [{ required: true, message: COMMON_TEXT.FORM_REQUIRED_TITLE, trigger: 'blur' }],
  chargeUsers: [{ required: true, message: COMMON_TEXT.FORM_REQUIRED_CHARGE_USER, trigger: 'change' }],
  content: [{ required: true, message: COMMON_TEXT.FORM_REQUIRED_CONTENT, trigger: 'blur' }]
})

// 文件上传前校验：校验文件大小和类型
const beforeFileUpload: UploadProps['beforeUpload'] = (file) => {
  // 大小校验
  if (file.size > UPLOAD_CONFIG.MAX_SIZE) {
    ElMessage.error(CREATE_APPROVAL_LOCALE.VALIDATE.FILE_SIZE(UPLOAD_CONFIG.MAX_SIZE))
    return false
  }
  // 类型校验
  const fileExt = file.name.slice(file.name.lastIndexOf('.')).toLowerCase() as typeof UPLOAD_CONFIG.ACCEPT_TYPES[number]
  if (!UPLOAD_CONFIG.ACCEPT_TYPES.includes(fileExt)) {
    ElMessage.error(
      CREATE_APPROVAL_LOCALE.VALIDATE.FILE_TYPE(Array.from(UPLOAD_CONFIG.ACCEPT_TYPES))
    )
    return false
  }
  return true
}

// 文件变更处理：去重并更新表单文件列表
const handleFileChange = (file: UploadFile) => {
  if (file.status === UPLOAD_CONFIG.FILE_STATUS.READY) {
    form.value.fileList = form.value.fileList.filter(f => f.uid !== file.uid)
    form.value.fileList.push(file)
  }
}

// 取消处理：向父组件触发取消事件
const handleCancel = () => {
  emit('cancel')
}

// 提交处理：表单校验、格式化数据、触发提交事件
const handleSubmit = async () => {
  try {
    const valid = await formRef.value.validate()
    if (!valid) return

    isSubmitting.value = true

    // 格式化文件：过滤有效文件并整理格式
    const files = form.value.fileList
      .filter(isValidFile)
      .map(f => ({ name: f.name, raw: f.raw }))

    // 向父组件传递提交数据
    emit('submit', {
      ...form.value,
      files
    })
  } catch (error) {
    console.error('提交失败:', error)
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

.el-form-item__label {
  color: var(--gray-700);
}

.form-control {
  border-color: var(--gray-200);

  &:focus {
    border-color: var(--blue-500);
    box-shadow: var(--shadow-focus);
  }
}
</style>