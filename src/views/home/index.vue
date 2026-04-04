<template>
  <div class="home-container">
    <div class="welcome-section">
      <div class="welcome-content">
        <h2>{{ greeting }}，{{ userName }}</h2>
        <p class="date-time">{{ currentDate }} {{ currentTime }}</p>
      </div>
      <div class="weather-section">
        <svg-icon name="tianqing" size="20" />
        <span>晴 26°C</span>
      </div>
    </div>

    <div class="stats-section">
      <div v-for="stat in stats" :key="stat.title" class="stat-item">
        <div class="stat-icon">
          <svg-icon :name="stat.icon" size="24" />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-title">{{ stat.title }}</div>
        </div>
      </div>
    </div>

    <div class="main-content">
      <div class="left-section">
        <div class="section-card">
          <div class="section-header">
            <h3>任务中心</h3>
            <span class="link-text" @click="goToTasks">查看全部</span>
          </div>
          <div class="task-list">
            <div v-for="task in tasks" :key="task.id" class="task-item" @click="handleTaskClick(task)">
              <div class="task-icon">
                <svg-icon :name="task.icon" size="18" />
              </div>
              <div class="task-info">
                <div class="task-title">{{ task.title }}</div>
                <div class="task-meta">{{ task.count }}项 · {{ task.time }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="section-card">
          <div class="section-header">
            <h3>待办事项</h3>
            <span class="link-text" @click="goToTasks">添加任务</span>
          </div>
          <div class="todo-list">
            <div v-for="todo in todos" :key="todo.id" class="todo-item">
              <el-checkbox :model-value="todo.completed" @change="toggleTodo(todo)" />
              <div class="todo-content">
                <div class="todo-title" :class="{ completed: todo.completed }">{{ todo.title }}</div>
                <div class="todo-meta">
                  <el-tag v-if="todo.priority === 'high'" size="small" type="danger">紧急</el-tag>
                  <el-tag v-else-if="todo.priority === 'medium'" size="small" type="warning">重要</el-tag>
                  <span class="todo-time">{{ todo.time }}</span>
                </div>
              </div>
              <span class="delete-text" @click="deleteTodo(todo.id)">删除</span>
            </div>
            <div v-if="todos.length === 0" class="empty-tip">暂无待办事项</div>
          </div>
        </div>
      </div>

      <div class="right-section">
        <div class="section-card">
          <div class="section-header">
            <h3>通知公告</h3>
            <el-badge :value="unreadCount" type="danger" />
          </div>
          <div class="notice-list">
            <div v-for="notice in notices" :key="notice.id" class="notice-item" @click="viewNotice(notice)">
              <div class="notice-dot" :class="{ unread: !notice.isRead }"></div>
              <div class="notice-content">
                <div class="notice-title" :class="{ unread: !notice.isRead }">{{ notice.title }}</div>
                <div class="notice-time">{{ notice.time }}</div>
              </div>
            </div>
            <div v-if="notices.length === 0" class="empty-tip">暂无通知</div>
          </div>
        </div>

        <div class="section-card">
          <div class="section-header">
            <h3>事项趋势</h3>
            <span class="date-label">近7天</span>
          </div>
          <div ref="chartRef" class="chart-container"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import SvgIcon from '@/components/SvgIcon/SvgIcon.vue'
import { useTaskStore } from '@/store/modules/task/useTaskStore'
import { useApprovalStore } from '@/store/modules/services/approval'
import { useUserStore } from '@/store/modules/user'
import { useHomeStore } from './utils/store'
import { TaskStatus } from '@/views/task/utils/type'

const router = useRouter()
const taskStore = useTaskStore()
const approvalStore = useApprovalStore()
const userStore = useUserStore()
const homeStore = useHomeStore()

const userName = computed(() => userStore.userInfo?.username || '用户')

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了'
  if (hour < 9) return '早上好'
  if (hour < 12) return '上午好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  return '晚上好'
})

const currentDate = ref('')
const currentTime = ref('')
let timer: number | null = null

const updateTime = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const weekDays = ['日', '一', '二', '三', '四', '五', '六']
  const weekDay = weekDays[now.getDay()]
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  
  currentDate.value = `${year}年${month}月${day}日 星期${weekDay}`
  currentTime.value = `${hours}:${minutes}`
}

onMounted(() => {
  updateTime()
  timer = window.setInterval(updateTime, 60000)
  taskStore.fetchTasks()
  approvalStore.fetchList()
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})

const stats = [
  {
    title: '待审批',
    value: approvalStore.pendingCount,
    icon: 'jinggao'
  },
  {
    title: '待处理任务',
    value: taskStore.pendingCount,
    icon: 'naozhong'
  },
  {
    title: '已完成',
    value: approvalStore.completedCount,
    icon: 'xingxing'
  },
  {
    title: '今日事项',
    value: 28,
    icon: 'zhibi'
  }
]

const tasks = [
  {
    id: 1,
    title: '待审批事项',
    count: approvalStore.pendingCount,
    time: '今日',
    icon: 'jinggao'
  },
  {
    id: 2,
    title: '待处理任务',
    count: taskStore.pendingCount,
    time: '今日',
    icon: 'naozhong'
  },
  {
    id: 3,
    title: '即将到期',
    count: 3,
    time: '3天内',
    icon: 'xingxing'
  }
]

const todos = computed(() => {
  return taskStore.tasks
    .filter(t => t.status === TaskStatus.PENDING || t.status === TaskStatus.PROCESSING)
    .slice(0, 5)
    .map(t => ({
      id: t.id,
      title: t.title,
      priority: t.priority === 'high' ? 'high' : t.priority === 'medium' ? 'medium' : 'low',
      time: t.deadline ? new Date(t.deadline).toLocaleDateString() : '无截止日期',
      completed: t.status === TaskStatus.COMPLETED
    }))
})

const notices = computed(() => homeStore.notices)
const unreadCount = computed(() => notices.value.filter(n => !n.isRead).length)

const chartRef = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null

onMounted(() => {
  if (!chartRef.value) return
  chart = echarts.init(chartRef.value)

  const option = {
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '8%',
      right: '4%',
      top: '10%',
      bottom: '12%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      axisLine: {
        lineStyle: {
          color: '#e5e7eb'
        }
      },
      axisLabel: {
        color: '#6b7280',
        fontSize: 11
      },
      axisTick: {
        show: false
      }
    },
    yAxis: {
      type: 'value',
      splitLine: {
        lineStyle: {
          color: '#f3f4f6',
          type: 'dashed'
        }
      },
      axisLabel: {
        color: '#6b7280',
        fontSize: 11
      },
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      }
    },
    series: [
      {
        name: '事项数量',
        type: 'line',
        data: [12, 18, 15, 22, 20, 8, 10],
        smooth: true,
        lineStyle: {
          color: '#3b82f6',
          width: 2
        },
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: {
          color: '#3b82f6'
        }
      }
    ]
  }

  chart.setOption(option)
  window.addEventListener('resize', () => chart?.resize())
})

onUnmounted(() => {
  chart?.dispose()
  window.removeEventListener('resize', () => chart?.resize())
})

const handleTaskClick = (task: any) => {
  if (task.title === '待审批事项') {
    router.push({ path: '/approval', query: { tab: 'in_progress' } })
  } else {
    router.push({ path: '/task' })
  }
}

const toggleTodo = (todo: any) => {
  const task = taskStore.tasks.find(t => t.id === todo.id)
  if (task) {
    const newStatus = todo.completed ? TaskStatus.PENDING : TaskStatus.COMPLETED
    taskStore.updateTask({ ...task, status: newStatus, progress: todo.completed ? 0 : 100 })
  }
}

const deleteTodo = (id: number) => {
  taskStore.deleteTask(id)
}

const viewNotice = (notice: any) => {
  ElMessage.info(notice.title)
}

const goToTasks = () => {
  router.push({ path: '/task' })
}
</script>

<style scoped>
.home-container {
  width: 100%;
  min-height: calc(100vh - 60px);
  background: var(--white);
  padding: 20px;
}

.welcome-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: var(--white);
  border: 1px solid var(--gray-200);
  border-radius: 8px;
  margin-bottom: 20px;
}

.welcome-content h2 {
  font-size: 20px;
  font-weight: 600;
  color: var(--gray-900);
  margin: 0 0 8px 0;
}

.date-time {
  font-size: 14px;
  color: var(--gray-600);
  margin: 0;
}

.weather-section {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--gray-600);
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--white);
  border: 1px solid var(--gray-200);
  border-radius: 8px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: var(--gray-900);
  margin-bottom: 4px;
}

.stat-title {
  font-size: 14px;
  color: var(--gray-600);
}

.main-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
}

.left-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.right-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-card {
  background: var(--white);
  border: 1px solid var(--gray-200);
  border-radius: 8px;
  padding: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--gray-900);
  margin: 0;
}

.link-text {
  font-size: 14px;
  color: #3b82f6;
  cursor: pointer;
  transition: color 0.2s;
}

.link-text:hover {
  color: #2563eb;
}

.date-label {
  font-size: 12px;
  color: var(--gray-600);
  background: var(--gray-100);
  padding: 4px 8px;
  border-radius: 4px;
}

.task-list,
.todo-list,
.notice-list {
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
  background: var(--gray-50);
  cursor: pointer;
  transition: background 0.2s;
}

.task-item:hover {
  background: var(--gray-100);
}

.task-icon {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  background: var(--white);
  border: 1px solid var(--gray-200);
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
  color: var(--gray-900);
  margin-bottom: 4px;
}

.task-meta {
  font-size: 12px;
  color: var(--gray-600);
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  background: var(--gray-50);
}

.todo-content {
  flex: 1;
}

.todo-title {
  font-size: 14px;
  color: var(--gray-900);
  margin-bottom: 4px;
}

.todo-title.completed {
  text-decoration: line-through;
  color: var(--gray-500);
}

.todo-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.todo-time {
  font-size: 12px;
  color: var(--gray-600);
}

.delete-text {
  font-size: 12px;
  color: #ef4444;
  cursor: pointer;
  transition: color 0.2s;
}

.delete-text:hover {
  color: #dc2626;
}

.notice-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  background: var(--gray-50);
  cursor: pointer;
  transition: background 0.2s;
}

.notice-item:hover {
  background: var(--gray-100);
}

.notice-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--gray-300);
  flex-shrink: 0;
  margin-top: 4px;
}

.notice-dot.unread {
  background: #ef4444;
}

.notice-content {
  flex: 1;
}

.notice-title {
  font-size: 14px;
  color: var(--gray-900);
  margin-bottom: 4px;
}

.notice-title.unread {
  font-weight: 500;
}

.notice-time {
  font-size: 12px;
  color: var(--gray-600);
}

.chart-container {
  width: 100%;
  height: 200px;
}

.empty-tip {
  text-align: center;
  color: var(--gray-500);
  padding: 40px 0;
  font-size: 14px;
}

@media (max-width: 1200px) {
  .stats-section {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .main-content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .stats-section {
    grid-template-columns: 1fr;
  }
  
  .welcome-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .home-container {
    padding: 16px;
  }
}
</style>
