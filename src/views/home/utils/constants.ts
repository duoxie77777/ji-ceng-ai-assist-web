
// 任务卡片类型
export const TaskCardType = {
    PENDING_APPROVAL: '待审批',
    PENDING_REVIEW: '待审查',
    TASK_AGENT: '任务代办',
}

// 事项类型
import { ApprovalTypeEnum } from '@/views/approval/utils/types'
export { ApprovalTypeEnum }

// 图例数据项类型
export interface LegendItem {
    label: string
    color: string
}

// 民情事项趋势图例
export const TREND_LEGENDS: LegendItem[] = [
    { label: '民情事项', color: '#3b82f6' },
    { label: '农业农村', color: '#10b981' },
    { label: '民政服务', color: '#f59e0b' },
    { label: '综治平安', color: '#ef4444' },
]

// 事项类型分布数据
export const TYPE_DISTRIBUTION: LegendItem[] = [
    { label: '民政服务', color: '#facc15' },
    { label: '农业农村', color: '#4ade80' },
    { label: '综治平安', color: '#f87171' },
    { label: '民情事项', color: '#60a5fa' },
    { label: '安全生产', color: '#a78bfa' },
    { label: '医疗卫生', color: '#34d399' },
]

// 通知公告状态文本
export const NOTICE_STATUS = {
    READ: '已读',
    UNREAD: '未读',
} as const

// 常用功能路由映射
export const FUNC_ROUTE_MAP: Record<string, string> = {
    视频会议: '/video-meeting',
    会议中心: '/meeting-center',
    在线文档: '/documents',
    任务中心: '/task',
    消息中心: '/message',
    审批流转: '/approval',
    AI咨询: '/ai-consult',
    应用中心: '/apps',
}