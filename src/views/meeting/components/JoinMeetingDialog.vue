<template>
  <el-dialog 
    :model-value="visible"
    @update:model-value="$emit('update:visible', $event)"
    title="加入会议" 
    width="400px"
  >
    <el-form label-position="top">
      <el-form-item label="会议号">
        <el-input v-model="meetingId" placeholder="请输入会议号" />
      </el-form-item>
      <el-form-item label="您的名称">
        <el-input v-model="userName" placeholder="请输入您的名称" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="$emit('update:visible', false)">取消</el-button>
      <el-button type="primary" @click="handleJoin">加入会议</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits(['update:visible', 'joined'])

const meetingId = ref('')
const userName = ref('')

watch(() => props.visible, (val) => {
  if (!val) {
    meetingId.value = ''
    userName.value = ''
  }
})

const handleJoin = () => {
  if (!meetingId.value) {
    ElMessage.warning('请输入会议号')
    return
  }
  emit('joined', { meetingId: meetingId.value, userName: userName.value })
  emit('update:visible', false)
  ElMessage.success(`正在加入会议: ${meetingId.value}`)
}
</script>
