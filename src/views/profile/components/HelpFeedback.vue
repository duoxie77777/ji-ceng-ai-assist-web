<template>
  <div class="help-feedback">
    <el-card class="info-card">
      <template #header>
        <div class="card-header">
          <span>
            <svg-icon name="naozi" size="20" />
            常见问题
          </span>
        </div>
      </template>
      <el-collapse>
        <el-collapse-item title="如何开启智能摘要？">
          <p>在系统设置→智能助手中开启即可。</p>
        </el-collapse-item>
        <el-collapse-item title="如何联系人工客服？">
          <p>请通过反馈表单提交，我们会在1个工作日内回复。</p>
        </el-collapse-item>
      </el-collapse>
    </el-card>
    
    <el-card class="info-card">
      <template #header>
        <div class="card-header">
          <span>
            <svg-icon name="laba" size="20" />
            反馈通道
          </span>
        </div>
      </template>
      <el-form :model="formData" ref="formRef" label-width="100px">
        <el-form-item label="问题描述">
          <el-input 
            v-model="formData.content" 
            type="textarea" 
            :rows="4" 
            placeholder="请描述您遇到的问题或建议"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit">提交反馈</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

const formRef = ref()
const formData = reactive({
  content: ''
})

const handleSubmit = () => {
  if (!formData.content.trim()) {
    ElMessage.warning('请输入反馈内容')
    return
  }
  ElMessage.success('反馈已提交，我们会尽快处理')
  formData.content = ''
}
</script>

<style scoped lang="scss">
.help-feedback {
  :deep(.el-card__header) {
    border-bottom: 1px solid var(--gray-200);
    padding: 12px 20px;
  }

  .info-card {
    border-radius: 8px;
    border: 1px solid var(--gray-200);
    margin-bottom: 16px;
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  :deep(.el-collapse-item__header) {
    font-weight: 500;
  }

  :deep(.el-textarea__inner) {
    border-radius: 6px;
  }
}
</style>
