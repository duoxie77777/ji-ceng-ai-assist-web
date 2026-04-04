<template>
  <div class="task-board">
    <div class="board-header">
      <h3>任务中心</h3>
      <el-button link type="primary" @click="goToTasks">查看全部</el-button>
    </div>
    <div class="task-list">
      <div v-for="task in tasks" :key="task.id" class="task-item" @click="handleTaskClick(task)">
        <div class="task-icon" :style="{ backgroundColor: task.color + '20' }">
          <svg-icon :name="task.icon" size="20" :style="{ color: task.color }" />
        </div>
        <div class="task-info">
          <div class="task-title">{{ task.title }}</div>
          <div class="task-meta">
            <span class="task-count">{{ task.count }}项</span>
            <span class="task-time">{{ task.time }}</span>
          </div>
        </div>
        <el-icon class="arrow-icon">
          <ArrowRight />
        </el-icon>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowRight } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { useApprovalStore } from '@/store/modules/services/approval'
import { useTaskStore } from '@/store/modules/task/useTaskStore'
import SvgIcon from '@/components/SvgIcon/SvgIcon.vue'

const router = useRouter()
const approvalStore = useApprovalStore()
const taskStore = useTaskStore()

const tasks = [
  {
    id: 1,
    title: '待审批事项',
    count: approvalStore.pendingCount,
    time: '今日',
    icon: 'jinggao',
    color: '#f97316'
  },
  {
    id: 2,
    title: '待处理任务',
    count: taskStore.pendingCount,
    time: '今日',
    icon: 'naozhong',
    color: '#3b82f6'
  },
  {
    id: 3,
    title: '即将到期',
    count: 3,
    time: '3天内',
    icon: 'xingxing',
    color: '#ef4444'
  }
]

const handleTaskClick = (task: any) => {
  if (task.title === '待审批事项') {
    router.push({ path: '/approval', query: { tab: 'in_progress' } })
  } else {
    router.push({ path: '/task' })
  }
}

const goToTasks = () => {
  router.push({ path: '/task' })
}
</script>

<style scoped>
.task-board {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.board-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.board-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  background: #f9fafb;
  cursor: pointer;
  transition: all 0.2s;
}

.task-item:hover {
  background: #f3f4f6;
  transform: translateX(4px);
}

.task-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.task-info {
  flex: 1;
}

.task-title {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 4px;
}

.task-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #6b7280;
}

.arrow-icon {
  color: #9ca3af;
  font-size: 16px;
}

@media (max-width: 768px) {
  .task-board {
    padding: 16px;
  }
}
</style>
