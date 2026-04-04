<template>
  <div class="todo-section">
    <div class="section-header">
      <h3>待办事项</h3>
      <el-button link type="primary" @click="goToTasks">添加任务</el-button>
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
        <el-button link type="danger" size="small" @click="deleteTodo(todo.id)">
          <el-icon>
            <Delete />
          </el-icon>
        </el-button>
      </div>
      <div v-if="todos.length === 0" class="empty-state">
        <el-icon>
          <Document />
        </el-icon>
        <p>暂无待办事项</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Delete, Document } from '@element-plus/icons-vue'
import { useTaskStore } from '@/store/modules/task/useTaskStore'
import { TaskStatus } from '@/views/task/utils/type'

const router = useRouter()
const taskStore = useTaskStore()

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

const goToTasks = () => {
  router.push({ path: '/task' })
}
</script>

<style scoped>
.todo-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
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
  color: #1f2937;
  margin: 0;
}

.todo-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  background: #f9fafb;
  transition: all 0.2s;
}

.todo-item:hover {
  background: #f3f4f6;
}

.todo-content {
  flex: 1;
}

.todo-title {
  font-size: 14px;
  color: #1f2937;
  margin-bottom: 4px;
}

.todo-title.completed {
  text-decoration: line-through;
  color: #9ca3af;
}

.todo-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.todo-time {
  font-size: 12px;
  color: #6b7280;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: #9ca3af;
}

.empty-state .el-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-state p {
  font-size: 14px;
  margin: 0;
}

@media (max-width: 768px) {
  .todo-section {
    padding: 16px;
  }
}
</style>
