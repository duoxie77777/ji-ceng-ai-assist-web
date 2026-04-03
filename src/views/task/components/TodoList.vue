<template>
  <div class="todo-list-wrapper">
    <!-- 待办区 -->
    <div class="section">
      <div class="section-header">
        <h3>待办任务 <el-badge :value="pendingTodos.length" type="danger" /></h3>
      </div>
      <div v-if="pendingTodos.length === 0" class="empty-tip">暂无待办任务</div>
      <div v-else class="todo-cards">
        <div v-for="task in pendingTodos" :key="task.id" class="todo-card" :class="priorityClass(task.priority)">
          <div class="card-checkbox"><el-checkbox :model-value="false" @change="completeTask(task.id)" /></div>
          <div class="card-content">
            <div class="title">
              {{ task.title }}
              <el-tag v-if="task.priority === TaskPriority.HIGH" size="small" type="danger">高优</el-tag>
              <el-tag v-else-if="task.priority === TaskPriority.MEDIUM" size="small" type="warning">中优</el-tag>
              <el-tag v-else size="small" type="info">低优</el-tag>
              <span class="assignee" v-if="task.assignee">指派：{{ task.assignee }}</span>
            </div>
            <div class="desc" v-if="task.description">{{ task.description }}</div>
            <div class="meta">
              <span class="deadline">截止：{{ formatDate(task.deadline) }}</span>
              <span class="creator">创建人：{{ task.creator }}</span>
            </div>
          </div>
          <div class="card-actions">
            <el-button type="primary" link size="small" @click="viewDetail(task)">查看</el-button>
            <el-button type="danger" link size="small" @click="deleteTask(task.id)">删除</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 已完成区 -->
    <div class="section completed-section">
      <div class="section-header">
        <h3>已完成 <el-badge :value="completedTodos.length" type="success" /></h3>
      </div>
      <div v-if="completedTodos.length === 0" class="empty-tip">暂无已完成任务</div>
      <div v-else class="todo-cards completed-cards">
        <div v-for="task in completedTodos" :key="task.id" class="todo-card completed-card">
          <div class="card-checkbox"><el-checkbox :model-value="true" @change="restoreTask(task.id)" /></div>
          <div class="card-content">
            <div class="title completed-title">
              {{ task.title }}
              <el-tag v-if="task.priority === TaskPriority.HIGH" size="small" type="danger">高优</el-tag>
              <el-tag v-else-if="task.priority === TaskPriority.MEDIUM" size="small" type="warning">中优</el-tag>
              <el-tag v-else size="small" type="info">低优</el-tag>
              <span class="assignee" v-if="task.assignee">指派：{{ task.assignee }}</span>
            </div>
            <div class="desc" v-if="task.description">{{ task.description }}</div>
            <div class="meta">
              <span class="deadline">截止：{{ formatDate(task.deadline) }}</span>
              <span class="creator">创建人：{{ task.creator }}</span>
            </div>
          </div>
          <div class="card-actions"><el-button type="danger" link size="small"
              @click="deleteTask(task.id)">删除</el-button></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { TaskStatus, TaskPriority } from '@/views/task/utils/type'
import type { Task } from '@/views/task/utils/type'
import { useTaskStore } from '@/store/modules/task/useTaskStore'

const taskStore = useTaskStore()

const pendingTodos = computed(() => taskStore.tasks.filter(t => t.status === TaskStatus.PENDING || t.status === TaskStatus.PROCESSING))
const completedTodos = computed(() => taskStore.tasks.filter(t => t.status === TaskStatus.COMPLETED))

const priorityClass = (priority: string) => ({
  'priority-high': priority === TaskPriority.HIGH,
  'priority-medium': priority === TaskPriority.MEDIUM
})

const formatDate = (dateStr?: string) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

const viewDetail = (task: Task) => {
  ElMessageBox.alert(
    `标题：${task.title}\n描述：${task.description || '无'}\n截止日期：${formatDate(task.deadline)}\n创建人：${task.creator}\n指派给：${task.assignee || '自己'}`,
    '任务详情',
    { confirmButtonText: '关闭' }
  )
}

const completeTask = (id: number) => {
  const task = taskStore.tasks.find(t => t.id === id)
  if (task) {
    taskStore.updateTask({ ...task, status: TaskStatus.COMPLETED, progress: 100 })
    ElMessage.success('任务已完成')
  }
}

const restoreTask = (id: number) => {
  const task = taskStore.tasks.find(t => t.id === id)
  if (task) {
    taskStore.updateTask({ ...task, status: TaskStatus.PENDING })
    ElMessage.success('任务已恢复')
  }
}

const deleteTask = (id: number) => {
  ElMessageBox.confirm('确定删除该任务吗？', '提示', { type: 'warning' })
    .then(() => { taskStore.deleteTask(id); ElMessage.success('任务已删除') })
    .catch(() => { })
}
</script>

<style scoped lang="scss">
.todo-list-wrapper {
  display: flex;
  flex-direction: column;
  gap: 32px;

  .section {
    .section-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;

      h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
      }
    }

    .empty-tip {
      text-align: center;
      color: var(--gray-500);
      padding: 40px 0;
    }

    .todo-cards {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .todo-card {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px;
      background: var(--white);
      border: 1px solid var(--gray-200);
      border-radius: 12px;
      transition: all 0.2s;

      &:hover {
        box-shadow: var(--shadow-md);
      }

      &.priority-high {
        border-left: 4px solid var(--red-500);
      }

      &.priority-medium {
        border-left: 4px solid var(--orange-500);
      }

      .card-checkbox {
        padding-top: 2px;
      }

      .card-content {
        flex: 1;

        .title {
          font-weight: 600;
          font-size: 15px;
          margin-bottom: 8px;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;

          .assignee {
            font-size: 12px;
            font-weight: normal;
            color: var(--gray-500);
            background: var(--gray-100);
            padding: 2px 8px;
            border-radius: 12px;
          }
        }

        .desc {
          font-size: 13px;
          color: var(--gray-600);
          margin-bottom: 8px;
        }

        .meta {
          font-size: 12px;
          color: var(--gray-500);
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          align-items: center;
        }
      }

      .card-actions {
        display: flex;
        gap: 8px;
        align-items: center;
      }
    }

    &.completed-section .completed-card {
      opacity: 0.7;
      background: var(--gray-50);

      .completed-title {
        text-decoration: line-through;
        color: var(--gray-500);
      }
    }
  }
}
</style>