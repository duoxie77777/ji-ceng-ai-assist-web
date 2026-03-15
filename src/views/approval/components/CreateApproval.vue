<template>
  <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" class="create-form">
    <el-form-item label="事项类型" prop="type">
      <el-select v-model="form.type" placeholder="请选择">
        <el-option label="民情事项" value="民情事项" />
        <el-option label="农业农村" value="农业农村" />
        <el-option label="民政服务" value="民政服务" />
        <el-option label="综治平安" value="综治平安" />
      </el-select>
    </el-form-item>

    <el-form-item label="事项标题" prop="title">
      <el-input v-model="form.title" placeholder="请输入" />
    </el-form-item>

    <el-form-item label="负责人员" prop="chargeUsers">
      <el-select v-model="form.chargeUsers" multiple placeholder="选择负责领导">
        <el-option label="李主任（农业）" value="李主任" />
        <el-option label="张主任（民政）" value="张主任" />
        <el-option label="何芸（综治）" value="何芸" />
        <el-option label="王副镇长" value="王副镇长" />
      </el-select>
    </el-form-item>

    <el-form-item label="内容说明" prop="content">
      <el-input v-model="form.content" type="textarea" :rows="4" placeholder="请输入内容说明" />
    </el-form-item>

    <el-form-item label="附件上传">
      <el-upload v-model:file-list="form.fileList" :auto-upload="false" :on-change="handleFileChange" list-type="text"
        placeholder="可上传相关附件（选填）">
        <el-button type="primary" size="small">选择文件</el-button>
      </el-upload>
    </el-form-item>

    <div class="btns">
      <el-button @click="emit('cancel')">取消</el-button>
      <el-button type="primary" @click="submit">提交上报</el-button>
    </div>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { UploadFile } from 'element-plus'

const emit = defineEmits(['submit', 'cancel'])

// 表单实例
const formRef = ref()

// 表单数据
const form = ref({
  type: '',
  title: '',
  content: '',
  chargeUsers: [],
  fileList: [] as UploadFile[]
})

// 表单校验规则
const rules = reactive({
  type: [{ required: true, message: '请选择事项类型', trigger: 'change' }],
  title: [{ required: true, message: '请输入事项标题', trigger: 'blur' }],
  chargeUsers: [{ required: true, message: '请选择负责人员', trigger: 'change' }],
  content: [{ required: true, message: '请输入内容说明', trigger: 'blur' }]
})

// 文件变更处理
const handleFileChange = (file: UploadFile) => {
  // 仅处理成功选择的文件
  if (file.status === 'ready') {
    form.value.fileList = [file, ...form.value.fileList.filter(f => f.uid !== file.uid)]
  }
}

// 提交处理
const submit = () => {
  formRef.value.validate((valid: any) => {
    if (valid) {
      const files = form.value.fileList.map(f => ({
        name: f.name,
        raw: f.raw
      }))
      emit('submit', {
        ...form.value,
        files
      })
    }
  })
}
</script>

<style scoped lang="less">
.create-form {
  padding: 20px 0;
  animation: fadeIn 0.35s ease;
}

.btns {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 20px;
}

:deep(.el-upload) {
  .el-upload__input {
    display: none;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>