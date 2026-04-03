<template>
  <div class="task-list-container">
    <div class="filter-bar">
      <div class="filter-tabs">
        <el-tag v-for="tab in statusTabs" :key="tab.value"
          :type="tab.value === filters.status ? TagType.PRIMARY : TagType.INFO" class="filter-tab"
          @click="handleStatusChange(tab.value)">
          {{ tab.label }}<el-badge :value="tab.count" :hidden="tab.count === 0" class="tab-badge" />
        </el-tag>
      </div>
      <div class="filter-selects">
        <el-select v-model="localFilters.priority" placeholder="优先级" clearable @change="handleFilterChange">
          <el-option v-for="(label, value) in priorityOptions" :key="value" :label="label" :value="value" />
        </el-select>
        <el-select v-model="localFilters.type" placeholder="任务类型" clearable @change="handleFilterChange">
          <el-option v-for="(label, value) in typeOptions" :key="value" :label="label" :value="value" />
        </el-select>
        <el-select v-model="sortConfig" placeholder="排序" @change="handleSortChange">
          <el-option label="创建时间从晚到早" value="createTime_desc" />
          <el-option label="截止时间从近到远" value="deadline_desc" />
          <el-option label="优先级从高到低" value="priority_desc" />
        </el-select>
      </div>
      <div class="filter-actions">
        <el-button type="primary" plain :disabled="selectedTasks.length === 0" @click="handleBatchProcess">
          批量处理({{ selectedTasks.length }})
        </el-button>
        <el-button plain @click="handleTagManage">标签管理</el-button>
      </div>
    </div>

    <div class="task-list">
      <div v-for="task in tasks" :key="task.id" class="task-item" :class="{
        'overdue': task.status === TaskStatus.OVERDUE,
        'high-priority': task.priority === TaskPriority.HIGH,
        'completed': task.status === TaskStatus.COMPLETED
      }">
        <div class="task-left">
          <el-checkbox v-model="selectedTasks" :label="task.id" />
          <span class="task-month">{{ task.createTime.split('-')[1] }}月</span>
        </div>
        <div class="task-content">
          <div class="task-title-row">
            <h3 class="task-title">{{ task.title }}</h3>
            <div class="task-tags">
              <el-tag v-if="task.priority === TaskPriority.HIGH" type="danger" size="small">优先</el-tag>
              <el-tag v-if="task.status === TaskStatus.OVERDUE" type="danger" size="small">逾期</el-tag>
            </div>
          </div>
          <div class="task-desc">{{ task.description }}</div>
          <div class="task-meta">
            <span class="meta-item">创建时间：{{ task.createTime }}</span>
            <span class="meta-item">来自：{{ task.creator }}</span>
            <span class="meta-item">负责人：{{ task.assignee }}</span>
          </div>
        </div>
        <div class="task-actions">
          <el-button type="primary" size="small" @click="$emit('view-detail', task)">去查看</el-button>
          <el-button v-if="task.status !== TaskStatus.COMPLETED" type="success" size="small"
            @click="$emit('change-status', task.id, TaskStatus.COMPLETED)">我已处理</el-button>
        </div>
      </div>
      <div v-if="tasks.length === 0" class="empty-tip"><el-empty description="暂无任务数据" /></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { TaskStatus, TaskPriority, TaskPriorityText, TaskTypeText, TaskStatusText, TagType, type Task, type TaskFilter, type TaskStatusType, } from '../utils/type'

const props = defineProps<{ tasks: Task[]; filters: TaskFilter }>()
const emit = defineEmits<{
  (e: 'view-detail', task: Task): void
  (e: 'edit-task', task: Task): void
  (e: 'delete-task', id: number): void
  (e: 'change-status', id: number, status: TaskStatusType): void
  (e: 'filter-change', filters: TaskFilter): void
}>()



const selectedTasks = ref<number[]>([])
const localFilters = ref({ ...props.filters })
const sortConfig = ref(`${props.filters.sortBy}_${props.filters.sortOrder}`)
const TAG_TYPE = TagType

watch(() => props.filters, (val) => {
  localFilters.value = { ...val }
  sortConfig.value = `${val.sortBy}_${val.sortOrder}`
}, { deep: true })

const statusTabs = computed(() => [
  { label: TaskStatusText[TaskStatus.PENDING], value: TaskStatus.PENDING, count: props.tasks.filter(t => t.status === TaskStatus.PENDING).length },
  { label: TaskStatusText[TaskStatus.OVERDUE], value: TaskStatus.OVERDUE, count: props.tasks.filter(t => t.status === TaskStatus.OVERDUE).length }
])
const priorityOptions = TaskPriorityText
const typeOptions = TaskTypeText

const handleStatusChange = (value: TaskStatusType | '') => {
  localFilters.value.status = localFilters.value.status === value ? '' : value
  emit('filter-change', localFilters.value)
}

const handleFilterChange = () => emit('filter-change', localFilters.value)
const handleSortChange = (value: string) => {
  const [sortBy, sortOrder] = value.split('_') as [typeof props.filters.sortBy, typeof props.filters.sortOrder]
  localFilters.value.sortBy = sortBy
  localFilters.value.sortOrder = sortOrder
  emit('filter-change', localFilters.value)
}

const handleBatchProcess = async () => {
  if (selectedTasks.value.length === 0) {
    ElMessage.warning('请先选择要处理的任务')
    return
  }
  try {
    await ElMessageBox.confirm(`确定要批量处理选中的 ${selectedTasks.value.length} 个任务吗？`, '批量处理', {
      confirmButtonText: '批量删除',
      cancelButtonText: '取消',
      type: 'warning'
    })
    selectedTasks.value.forEach(id => emit('delete-task', id))
    selectedTasks.value = []
    ElMessage.success('批量删除成功')
  } catch { }
}

const handleTagManage = () => {
  ElMessage.info('标签管理功能开发中，敬请期待')
}
</script>

<style scoped lang="scss">
.task-list-container {
  background: var(--white);
  border-radius: 8px;
  box-shadow: var(--shadow-sm);
  padding: 20px;
  margin-top: 20px;

  .filter-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid var(--gray-200);

    .filter-tabs {
      display: flex;
      gap: 10px;
    }

    .filter-tab {
      cursor: pointer;
      padding: 4px 12px;

      .tab-badge {
        margin-left: 4px;
      }
    }

    .filter-selects,
    .filter-actions {
      display: flex;
      gap: 10px;
    }
  }

  .task-list {
    display: flex;
    flex-direction: column;
    gap: 15px;

    .task-item {
      display: flex;
      align-items: flex-start;
      padding: 15px 20px;
      border: 1px solid var(--gray-200);
      border-radius: 8px;
      transition: all 0.3s;

      &:hover {
        box-shadow: var(--shadow-md);
      }

      &.overdue {
        background: var(--red-50);
        border-left: 3px solid var(--red-500);
      }

      &.high-priority {
        background: var(--orange-50);
        border-left: 3px solid var(--orange-500);
      }

      &.completed {
        opacity: 0.7;

        .task-title {
          text-decoration: line-through;
          color: var(--gray-500);
        }
      }

      .task-left {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-right: 15px;

        .task-month {
          font-size: 14px;
          font-weight: 600;
          color: var(--gray-600);
        }
      }

      .task-content {
        flex: 1;

        .task-title-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;

          .task-title {
            margin: 0;
            font-size: 16px;
            color: var(--gray-800);
            font-weight: 500;
          }

          .task-tags {
            display: flex;
            gap: 8px;
          }
        }

        .task-desc {
          font-size: 14px;
          color: var(--gray-600);
          margin-bottom: 8px;
        }

        .task-meta {
          display: flex;
          gap: 20px;
          font-size: 12px;
          color: var(--gray-500);
        }
      }

      .task-actions {
        display: flex;
        gap: 8px;
        margin-left: 20px;
      }
    }

    .empty-tip {
      padding: 40px 0;
      text-align: center;
    }
  }
}
</style>