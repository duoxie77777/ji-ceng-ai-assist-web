<template>
  <el-dialog 
    :model-value="visible"
    @update:model-value="$emit('update:visible', $event)"
    title="发起会议" 
    width="520px"
    :close-on-click-modal="false"
  >
    <el-form :model="form" label-position="top" class="meeting-form">
      <el-form-item label="会议主题" required>
        <el-input v-model="form.title" placeholder="请输入会议主题" />
      </el-form-item>
      <el-form-item label="会议类型">
        <el-radio-group v-model="form.type">
          <el-radio label="normal">普通会议</el-radio>
          <el-radio label="important">重要会议</el-radio>
          <el-radio label="training">培训会议</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="会议时间" required>
        <el-date-picker
          v-model="form.dateRange"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="参会人员">
        <el-select 
          v-model="form.participants" 
          multiple 
          filterable 
          placeholder="请选择参会人员"
          style="width: 100%"
        >
          <el-option label="张三" value="zhangsan" />
          <el-option label="李四" value="lisi" />
          <el-option label="王五" value="wangwu" />
          <el-option label="赵六" value="zhaoliu" />
          <el-option label="钱七" value="qianqi" />
        </el-select>
      </el-form-item>
      <el-form-item label="会议描述">
        <el-input 
          v-model="form.description" 
          type="textarea" 
          :rows="3"
          placeholder="请输入会议描述（可选）"
        />
      </el-form-item>
      <el-form-item label="会议设置">
        <div class="meeting-settings">
          <el-checkbox v-model="form.enableVideo">开启视频</el-checkbox>
          <el-checkbox v-model="form.enableRecord">自动录制</el-checkbox>
          <el-checkbox v-model="form.enableWaitingRoom">开启等候室</el-checkbox>
        </div>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="$emit('update:visible', false)">取消</el-button>
      <el-button type="primary" @click="handleCreate">确认创建</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits(['update:visible', 'created'])

const form = reactive({
  title: '',
  type: 'normal',
  dateRange: [],
  participants: [],
  description: '',
  enableVideo: true,
  enableRecord: false,
  enableWaitingRoom: false
})

watch(() => props.visible, (val) => {
  if (!val) {
    form.title = ''
    form.type = 'normal'
    form.dateRange = []
    form.participants = []
    form.description = ''
    form.enableVideo = true
    form.enableRecord = false
    form.enableWaitingRoom = false
  }
})

const handleCreate = () => {
  if (!form.title) {
    ElMessage.warning('请输入会议主题')
    return
  }
  emit('created', { ...form })
  emit('update:visible', false)
  ElMessage.success('会议创建成功')
}
</script>

<style scoped lang="less">
.meeting-form {
  .meeting-settings {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
  }
}
</style>
