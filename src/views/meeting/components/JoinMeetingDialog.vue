<template>
  <el-dialog
    v-model="visible"
    title="加入会议"
    width="500px"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="会议号" prop="roomId">
        <el-input v-model="form.roomId" placeholder="请输入会议号" />
      </el-form-item>
      
      <el-form-item label="昵称" prop="username">
        <el-input v-model="form.username" placeholder="请输入您的昵称" />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <span class="link-text" @click="handleClose">取消</span>
      <span class="link-text" @click="handleConfirm">加入</span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success', roomId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const visible = ref(false)
const formRef = ref()

const form = ref({
  roomId: '',
  username: ''
})

const rules = {
  roomId: [{ required: true, message: '请输入会议号', trigger: 'blur' }],
  username: [{ required: true, message: '请输入昵称', trigger: 'blur' }]
}

watch(() => props.modelValue, (val) => {
  visible.value = val
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

const handleClose = () => {
  visible.value = false
  resetForm()
}

const handleConfirm = async () => {
  try {
    await formRef.value?.validate()
    emit('success', form.value.roomId)
  } catch (error) {
    console.error('加入会议失败:', error)
  }
}

const resetForm = () => {
  form.value = {
    roomId: '',
    username: ''
  }
  formRef.value?.resetFields()
}
</script>

<style scoped>
.el-dialog {
  border-radius: 8px;
}

.el-form-item {
  margin-bottom: 20px;
}
</style>
