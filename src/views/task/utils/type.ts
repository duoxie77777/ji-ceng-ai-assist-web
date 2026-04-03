// 任务状态枚举
export const TaskStatus = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  OVERDUE: 'overdue'
} as const
export type TaskStatusType = typeof TaskStatus[keyof typeof TaskStatus]

// 任务优先级枚举
export const TaskPriority = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
} as const
export type TaskPriorityType = typeof TaskPriority[keyof typeof TaskPriority]

// 任务类型枚举
export const TaskType = {
  WORK: 'work',
  MEETING: 'meeting',
  INSPECTION: 'inspection',
  OTHER: 'other'
} as const
export type TaskTypeType = typeof TaskType[keyof typeof TaskType]

// UI 显示文本映射
export const TaskStatusText: Record<TaskStatusType, string> = {
  [TaskStatus.PENDING]: '待办',
  [TaskStatus.PROCESSING]: '进行中',
  [TaskStatus.COMPLETED]: '已完成',
  [TaskStatus.OVERDUE]: '逾期'
}

export const TaskPriorityText: Record<TaskPriorityType, string> = {
  [TaskPriority.HIGH]: '高',
  [TaskPriority.MEDIUM]: '中',
  [TaskPriority.LOW]: '低'
}

export const TaskTypeText: Record<TaskTypeType, string> = {
  [TaskType.WORK]: '工作任务',
  [TaskType.MEETING]: '会议任务',
  [TaskType.INSPECTION]: '核查任务',
  [TaskType.OTHER]: '其他'
}

// 任务更新日志
export interface TaskLog {
  id: number
  operator: string
  operation: string
  time: string
  remark?: string
}

// 任务实体
export interface Task {
  id: number
  title: string
  description: string
  createTime: string
  deadline: string
  status: TaskStatusType
  priority: TaskPriorityType
  type: TaskTypeType
  creator: string
  assignee: string
  progress: number
  attachments?: string[]
  logs: TaskLog[]
}

// 任务统计数据
export interface TaskStatsData {
  total: number
  pending: number
  processing: number
  completed: number
  overdue: number
  byPriority: Record<TaskPriorityType, number>
  byType: Record<TaskTypeType, number>
}

// 筛选器类型
export type TaskFilter = {
  status: TaskStatusType | ''
  priority: TaskPriorityType | ''
  type: TaskTypeType | ''
  sortBy: 'createTime' | 'deadline' | 'priority'
  sortOrder: 'asc' | 'desc'
}

export const TagType = {
  PRIMARY: 'primary',
  SUCCESS: 'success',
  WARNING: 'warning',
  DANGER: 'danger',
  INFO: 'info'
} as const
export type TagType = typeof TagType[keyof typeof TagType]