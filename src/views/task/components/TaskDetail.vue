<template>
  <el-dialog v-model="visibleComputed" title="任务详情" width="800px" :close-on-click-modal="false">
    <div v-if="task" class="task-detail-container">
      <div class="detail-section">
        <h3 class="section-title">基本信息</h3>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="任务名称">{{ task.title }}</el-descriptions-item>
          <el-descriptions-item label="任务状态">
            <el-tag :type="getStatusTagType(task.status)">{{ getStatusText(task.status) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="优先级">
            <el-tag :type="getPriorityTagType(task.priority)">{{ getPriorityText(task.priority) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="任务类型">{{ getTypeText(task.type) }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ task.createTime }}</el-descriptions-item>
          <el-descriptions-item label="截止日期">{{ task.deadline }}</el-descriptions-item>
          <el-descriptions-item label="创建人">{{ task.creator }}</el-descriptions-item>
          <el-descriptions-item label="负责人">{{ task.assignee }}</el-descriptions-item>
          <el-descriptions-item label="任务进度">
            <el-progress :percentage="task.progress" :color="getProgressColor(task.progress)" />
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <div class="detail-section">
        <h3 class="section-title">任务描述</h3>
        <div class="desc-content">{{ task.description || '暂无描述' }}</div>
      </div>

      <div v-if="task.attachments?.length" class="detail-section">
        <h3 class="section-title">相关附件</h3>
        <div class="attach-list">
          <div v-for="(file, idx) in task.attachments" :key="idx" class="attach-item">
            <el-icon>
              <Document />
            </el-icon>
            <span>{{ file }}</span>
            <el-button type="text" size="small">下载</el-button>
          </div>
        </div>
      </div>

      <div v-if="task.logs?.length" class="detail-section">
        <h3 class="section-title">更新日志</h3>
        <el-timeline>
          <el-timeline-item v-for="log in task.logs" :key="log.id" :timestamp="log.time" placement="top">
            <div class="log-item">
              <span class="log-operator">{{ log.operator }}</span>
              <span class="log-operation">{{ log.operation }}</span>
              <span v-if="log.remark" class="log-remark">{{ log.remark }}</span>
            </div>
          </el-timeline-item>
        </el-timeline>
      </div>
    </div>
    <div v-else class="empty-placeholder">暂无任务数据</div>
    <template #footer>
      <el-button @click="visibleComputed = false">关闭</el-button>
      <el-button type="primary" @click="handleUpdate">更新任务</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Document } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { TaskStatus, TaskPriority, TaskType, TaskStatusText, TaskPriorityText, TaskTypeText, TagType } from '../utils/type'
import type { Task, TaskStatusType, TaskPriorityType, TaskTypeType } from '../utils/type'
import { useTaskStore } from '@/store/modules/task/useTaskStore'
const TAG_TYPE = TagType

const props = defineProps<{ visible: boolean; task: Task }>()
const emit = defineEmits<{ (e: 'update:visible', value: boolean): void; (e: 'update', task: Task): void }>()

const taskStore = useTaskStore()
const visibleComputed = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})


const getStatusTagType = (status: TaskStatusType): TagType => ({
  [TaskStatus.PENDING]: TagType.WARNING,
  [TaskStatus.PROCESSING]: TagType.PRIMARY,
  [TaskStatus.COMPLETED]: TagType.SUCCESS,
  [TaskStatus.OVERDUE]: TagType.DANGER
}[status] || TagType.INFO)
const getPriorityTagType = (priority: TaskPriorityType): TagType => ({
  [TaskPriority.HIGH]: TagType.DANGER,
  [TaskPriority.MEDIUM]: TagType.WARNING,
  [TaskPriority.LOW]: TagType.SUCCESS
}[priority] || TagType.INFO)

const getStatusText = (status: TaskStatusType) => TaskStatusText[status]
const getPriorityText = (priority: TaskPriorityType) => TaskPriorityText[priority]
const getTypeText = (type: TaskTypeType) => TaskTypeText[type]

const getProgressColor = (progress: number) => {
  if (progress < 30) return 'var(--red-500)'
  if (progress < 70) return 'var(--orange-500)'
  return 'var(--green-500)'
}

const handleUpdate = async () => {
  if (props.task) {
    try {
      await taskStore.updateTask(props.task)
      ElMessage.success('任务已更新')
      visibleComputed.value = false
      emit('update', props.task)
    } catch {
      ElMessage.error('任务更新失败')
    }
  }
}
</script>

<style scoped lang="scss">
.task-detail-container {
  .detail-section {
    margin-bottom: 20px;

    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--gray-800);
      margin-bottom: 12px;
    }

    .desc-content {
      padding: 12px;
      background: var(--gray-50);
      border-radius: 4px;
      color: var(--gray-600);
      line-height: 1.6;
    }

    .attach-list {
      display: flex;
      flex-direction: column;
      gap: 8px;

      .attach-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        background: var(--gray-50);
        border-radius: 4px;
      }
    }

    .log-item {
      .log-operator {
        font-weight: 600;
        margin-right: 8px;
      }

      .log-operation {
        color: var(--gray-600);
      }

      .log-remark {
        color: var(--gray-500);
        font-size: 12px;
        margin-left: 8px;
      }
    }
  }
}
</style>