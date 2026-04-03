<template>
  <div class="task-card glass-card">
    <div class="card-header">
      <span class="header-dot"></span>
      <h3>任务中心</h3>
      <span class="data-time">数据时间：{{ currentDate }}</span>
    </div>
    <div class="task-grid">
      <div v-for="task in taskStats" :key="task.name" class="task-item" @click="handleTaskClick(task.name)">
        <div class="task-header">
          <div class="task-info">
            <div class="task-count">{{ task.count }}<span class="unit">条</span></div>
            <div class="task-name">{{ task.name }}</div>
          </div>
          <div class="task-icon" :style="{ color: task.iconColor }">
            <span v-if="task.name === TaskCardType.PENDING_APPROVAL">
              <svg-icon name="jinggao" size="28" />
            </span>
            <span v-else-if="task.name === TaskCardType.PENDING_REVIEW">
              <svg-icon name="naozhong" size="28" />
            </span>
            <span v-else>
              <svg-icon name="xingxing" size="30" />
            </span>
          </div>
        </div>
        <div class="progress-wrapper">
          <div class="progress-label">
            <span>处理进度</span>
            <span :style="{ color: task.textColor }">{{ task.percent }}%</span>
          </div>
          <el-progress :percentage="task.percent" :stroke-width="8" :show-text="false" :color="task.barColor" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useHomeStore } from '../utils/store'
import { useApprovalStore } from '@/store/modules/services/approval'
import { useTaskStore } from '@/store/modules/task/useTaskStore'
import { TaskCardType } from '../utils/constants'
import SvgIcon from '@/components/SvgIcon/SvgIcon.vue'
const router = useRouter()
const homeStore = useHomeStore()
const approvalStore = useApprovalStore()
const taskStore = useTaskStore()
const currentDate = homeStore.currentDate

// 任务统计数据（从 store 获取）
const taskStats = computed(() => [
  {
    name: TaskCardType.PENDING_APPROVAL,
    count: approvalStore.pendingCount,
    percent: Math.min(100, approvalStore.pendingCount * 10),
    iconColor: '#f97316',
    barColor: '#f97316',
    textColor: '#f97316'
  },
  {
    name: TaskCardType.PENDING_APPROVAL,
    count: approvalStore.pendingCount,
    percent: Math.min(100, approvalStore.pendingCount * 8),
    iconColor: '#3b82f6',
    barColor: '#3b82f6',
    textColor: '#3b82f6'
  },
  {
    name: TaskCardType.TASK_AGENT,
    count: taskStore.pendingCount,
    percent: Math.min(100, taskStore.pendingCount * 5),
    iconColor: '#10b981',
    barColor: '#10b981',
    textColor: '#10b981'
  }
])

const handleTaskClick = (taskName: string) => {
  if (taskName === TaskCardType.PENDING_APPROVAL || taskName === TaskCardType.PENDING_REVIEW) {
    router.push({ path: '/approval', query: { tab: 'in_progress' } })
  } else {
    router.push({ path: '/task' })
  }
}
</script>

<style scoped>
.task-card {
  padding: 20px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: var(--shadow-md);
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.header-dot {
  width: 4px;
  height: 18px;
  background: var(--blue-500);
  border-radius: 2px;
  margin-right: 8px;
}

h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: var(--gray-900);
}

.data-time {
  font-size: 13px;
  color: var(--gray-500);
  margin-left: 12px;
}

.task-grid {
  display: flex;
  gap: 20px;
}

.task-item {
  flex: 1;
  background: linear-gradient(135deg, var(--white), var(--gray-50));
  border-radius: 16px;
  padding: 20px;
  border: 1px solid var(--gray-100);
  cursor: pointer;
  transition: transform 0.2s;
}

.task-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.task-info {
  flex: 1;
}

.task-count {
  font-size: 36px;
  font-weight: 700;
  color: var(--gray-900);
  line-height: 1;
}

.unit {
  font-size: 14px;
  color: var(--gray-600);
  margin-left: 4px;
}

.task-name {
  font-size: 16px;
  font-weight: 500;
  color: var(--gray-700);
  margin-top: 6px;
}

.task-icon {
  font-size: 28px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--white);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-sm);
}

.progress-wrapper {
  width: 100%;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  margin-bottom: 8px;
}

.progress-label span:first-child {
  color: var(--gray-600);
}
</style>