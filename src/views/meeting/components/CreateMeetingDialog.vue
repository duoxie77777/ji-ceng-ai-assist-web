<template>
  <el-dialog
    v-model="visible"
    title="预定会议"
    width="600px"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="会议标题" prop="title">
        <el-input v-model="form.title" placeholder="请输入会议标题" />
      </el-form-item>
      
      <el-form-item label="会议描述" prop="description">
        <el-input 
          v-model="form.description" 
          type="textarea" 
          :rows="3"
          placeholder="请输入会议描述"
        />
      </el-form-item>
      
      <el-form-item label="开始时间" prop="startTime">
        <el-date-picker
          v-model="form.startTime"
          type="datetime"
          placeholder="请选择开始时间"
          format="YYYY-MM-DD HH:mm"
          value-format="YYYY-MM-DD HH:mm:ss"
          :disabled-date="disabledDate"
        />
      </el-form-item>
      
      <el-form-item label="结束时间" prop="endTime">
        <el-date-picker
          v-model="form.endTime"
          type="datetime"
          placeholder="请选择结束时间"
          format="YYYY-MM-DD HH:mm"
          value-format="YYYY-MM-DD HH:mm:ss"
          :disabled-date="disabledDate"
        />
      </el-form-item>
      
      <el-form-item label="会议设置">
        <el-checkbox v-model="form.enableScreenShare">启用屏幕共享</el-checkbox>
        <el-checkbox v-model="form.enableSubtitle">启用字幕</el-checkbox>
        <el-checkbox v-model="form.isRecording">录制会议</el-checkbox>
      </el-form-item>
      
      <el-form-item label="参与人员">
        <el-select
          v-model="form.participantIds"
          multiple
          placeholder="请选择参与人员"
          style="width: 100%"
        >
          <el-option
            v-for="user in users"
            :key="user.id"
            :label="user.username"
            :value="user.id"
          />
        </el-select>
      </el-form-item>
    </el-form>
    
    <template #footer>
      <span class="link-text" @click="handleClose">取消</span>
      <span class="link-text" @click="handleConfirm">确定</span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useMeetingStore } from '@/store/modules/meeting/useMeetingStore'
import { useUserStore } from '@/store/modules/user'

interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const meetingStore = useMeetingStore()
const userStore = useUserStore()

const visible = ref(false)
const formRef = ref()

const form = ref({
  title: '',
  description: '',
  startTime: '',
  endTime: '',
  enableScreenShare: true,
  enableSubtitle: false,
  isRecording: false,
  participantIds: [] as string[]
})

const rules = {
  title: [{ required: true, message: '请输入会议标题', trigger: 'blur' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }]
}

const users = ref([
  { id: '1', username: '张三' },
  { id: '2', username: '李四' },
  { id: '3', username: '王五' }
])

watch(() => props.modelValue, (val) => {
  visible.value = val
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

const disabledDate = (time: Date) => {
  return time.getTime() < Date.now() - 24 * 60 * 60 * 1000
}

const handleClose = () => {
  visible.value = false
  resetForm()
}

const handleConfirm = async () => {
  try {
    await formRef.value?.validate()
    
    await meetingStore.createMeeting({
      ...form.value,
      hostId: userStore.userInfo?.id || 0
    })
    
    emit('success')
  } catch (error) {
    console.error('创建会议失败:', error)
  }
}

const resetForm = () => {
  form.value = {
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    enableScreenShare: true,
    enableSubtitle: false,
    isRecording: false,
    participantIds: []
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

.el-checkbox {
  margin-right: 16px;
}
</style>
