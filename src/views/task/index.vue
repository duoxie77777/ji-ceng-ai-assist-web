<template>
  <div class="task-center-container">
    <div class="task-header">
      <div class="header-left">
        <h2 class="page-title">任务中心</h2>
        <el-button type="primary" @click="openCreateTask">
          <el-icon>
            <Plus />
          </el-icon>创建任务
        </el-button>
        <el-button @click="exportTaskReport">
          <el-icon>
            <Download />
          </el-icon>导出报告
        </el-button>
      </div>
      <div class="header-right">
        <el-input v-model="searchKey" placeholder="搜索任务名称/负责人" :prefix-icon="Search" style="width: 300px" clearable />
      </div>
    </div>

    <TaskStats :stats="taskStats" @refresh="loadTaskData" @filter="handleStatFilter" />

    <TaskList :tasks="filteredTasks" :filters="currentFilters" @view-detail="openTaskDetail" @edit-task="openEditTask"
      @delete-task="handleDeleteTask" @change-status="handleChangeStatus" />

    <TaskForm v-model:visible="taskFormVisible" :task="currentTask" :is-edit="isEditTask" @save="handleSaveTask" />
    <TaskDetail v-model:visible="taskDetailVisible" :task="currentTask" @update="handleUpdateTask" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Plus, Download, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import TaskList from './components/TastList.vue'
import TaskDetail from './components/TaskDetail.vue'
import TaskForm from './components/TaskForm.vue'
import TaskStats from './components/TaskStats.vue'
import { TaskStatus, TaskPriority, TaskType, type Task, type TaskStatsData, type TaskFilter, type TaskStatusType } from './utils/type'
import { useTaskStore } from '@/store/modules/task/useTaskStore'
import { useUserStore } from '@/store/modules/user'
const userStore = useUserStore()

const taskStore = useTaskStore()

const searchKey = ref('')
const taskFormVisible = ref(false)
const taskDetailVisible = ref(false)
const isEditTask = ref(false)
const currentTask = ref<Task>({
  id: 0,
  title: '',
  description: '',
  createTime: '',
  deadline: '',
  status: TaskStatus.PENDING,
  priority: TaskPriority.MEDIUM,
  type: TaskType.WORK,
  creator: '',
  assignee: '',
  progress: 0,
  attachments: [],
  logs: []
})
const currentFilters = ref<TaskFilter>({
  status: '',
  priority: '',
  type: '',
  sortBy: 'createTime',
  sortOrder: 'desc'
})

const taskList = computed(() => taskStore.tasks)

const taskStats = computed<TaskStatsData>(() => {
  const list = taskList.value
  return {
    total: list.length,
    pending: list.filter(t => t.status === TaskStatus.PENDING).length,
    processing: list.filter(t => t.status === TaskStatus.PROCESSING).length,
    completed: list.filter(t => t.status === TaskStatus.COMPLETED).length,
    overdue: list.filter(t => t.status === TaskStatus.OVERDUE).length,
    byPriority: {
      [TaskPriority.HIGH]: list.filter(t => t.priority === TaskPriority.HIGH).length,
      [TaskPriority.MEDIUM]: list.filter(t => t.priority === TaskPriority.MEDIUM).length,
      [TaskPriority.LOW]: list.filter(t => t.priority === TaskPriority.LOW).length
    },
    byType: {
      [TaskType.WORK]: list.filter(t => t.type === TaskType.WORK).length,
      [TaskType.MEETING]: list.filter(t => t.type === TaskType.MEETING).length,
      [TaskType.INSPECTION]: list.filter(t => t.type === TaskType.INSPECTION).length,
      [TaskType.OTHER]: list.filter(t => t.type === TaskType.OTHER).length
    }
  }
})

// 筛选 + 排序（已完成沉底）
const filteredTasks = computed(() => {
  let list = [...taskList.value]
  const kw = searchKey.value.toLowerCase()
  if (kw) {
    list = list.filter(t => t.title.toLowerCase().includes(kw) || t.assignee.toLowerCase().includes(kw))
  }
  if (currentFilters.value.status) {
    list = list.filter(t => t.status === currentFilters.value.status)
  }
  if (currentFilters.value.priority) {
    list = list.filter(t => t.priority === currentFilters.value.priority)
  }
  if (currentFilters.value.type) {
    list = list.filter(t => t.type === currentFilters.value.type)
  }
  const { sortBy, sortOrder } = currentFilters.value
  list.sort((a, b) => {
    // 如果排序字段是优先级，需要将高->中->低映射为数值
    if (sortBy === 'priority') {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      const aVal = priorityOrder[a.priority as keyof typeof priorityOrder] || 0
      const bVal = priorityOrder[b.priority as keyof typeof priorityOrder] || 0
      return sortOrder === 'desc' ? bVal - aVal : aVal - bVal
    }
    // 日期字段比较
    const aVal = new Date(a[sortBy as 'createTime' | 'deadline']).getTime()
    const bVal = new Date(b[sortBy as 'createTime' | 'deadline']).getTime()
    return sortOrder === 'desc' ? bVal - aVal : aVal - bVal
  })

  list.sort((a, b) => {
    if (a.status === TaskStatus.COMPLETED && b.status !== TaskStatus.COMPLETED) return 1
    if (a.status !== TaskStatus.COMPLETED && b.status === TaskStatus.COMPLETED) return -1
    return 0
  })
  return list
})

const openCreateTask = () => {
  isEditTask.value = false
  // 确保获取到用户名，如果拿不到就给一个默认字符串
  const currentUserName = userStore.username || '当前用户'
  currentTask.value = {
    id: 0,
    title: '',
    description: '',
    createTime: new Date().toISOString().split('T')[0],
    deadline: '',
    status: TaskStatus.PENDING,
    priority: TaskPriority.MEDIUM,
    type: TaskType.WORK,
    creator: currentUserName,
    assignee: currentUserName,
    progress: 0,
    attachments: [],
    logs: []
  }
  taskFormVisible.value = true
}

const openEditTask = (task: Task) => {
  isEditTask.value = true
  currentTask.value = { ...task }
  taskFormVisible.value = true
}

const openTaskDetail = (task: Task) => {
  currentTask.value = { ...task }
  taskDetailVisible.value = true
}

const handleSaveTask = (task: Task) => {
  if (task.id) {
    taskStore.updateTask(task)
    ElMessage.success('任务更新成功')
  } else {
    const newTask: Task = {
      ...task,
      id: Date.now(),
      createTime: new Date().toISOString().split('T')[0],
      logs: [{ id: Date.now(), operator: '系统', operation: '创建任务', time: new Date().toLocaleString() }]
    }
    taskStore.addTask(newTask)
    ElMessage.success('任务创建成功')
  }
  taskFormVisible.value = false
}

const handleDeleteTask = (id: number) => {
  ElMessageBox.confirm('确定要删除该任务吗？', '提示', { type: 'warning' })
    .then(() => { taskStore.deleteTask(id); ElMessage.success('任务删除成功') })
    .catch(() => { })
}

const handleUpdateTask = (task: Task) => {
  taskStore.updateTask(task)
  ElMessage.success('任务更新成功')
  taskDetailVisible.value = false
}

const handleChangeStatus = (id: number, status: TaskStatusType) => {
  const task = taskList.value.find(t => t.id === id)
  if (task) {
    const updated = { ...task, status }
    if (status === TaskStatus.COMPLETED) updated.progress = 100
    taskStore.updateTask(updated)
    ElMessage.success('状态变更成功')
  }
}

const loadTaskData = () => {
  taskStore.fetchTasks()
  ElMessage.success('数据刷新成功')
}

const handleStatFilter = (status: TaskStatusType | 'total') => {
  if (status === 'total') currentFilters.value.status = ''
  else currentFilters.value.status = status
}

const exportTaskReport = () => {
  ElMessage.success('任务报告导出成功')
}

onMounted(() => {
  taskStore.fetchTasks()
})
</script>

<style scoped lang="scss">
.task-center-container {
  padding: 20px;
  background: var(--gray-50);
  min-height: 100vh;

  .task-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 15px 20px;
    background: var(--white);
    border-radius: 8px;
    box-shadow: var(--shadow-sm);

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;

      .page-title {
        margin: 0;
        font-size: 18px;
        color: var(--gray-800);
        font-weight: 600;
      }
    }
  }
}
</style>