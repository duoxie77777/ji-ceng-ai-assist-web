import { defineStore } from 'pinia'

export const useHomeStore = defineStore('home', {
  state: () => ({
    currentDate: '2026.03.30',
    currentDateTime: '2026.03.30 16:00',
    commonSearches: ['入园企业', '两重点一重大', '知识库'],
    notices: [
      { title: '甲醇燃料汽车非常排放测量异常报警', time: '3个月前', isRead: false },
      { title: '江苏省甲醇燃料常规污染物排放测...', time: '3个月前', isRead: true },
      { title: '关于甲醇燃料汽车非常排放测量报...', time: '6个月前', isRead: true },
    ],
    tasks: [
      { name: '待审批', count: 12, percent: 2, iconColor: '#f97316', barColor: '#f97316', textColor: '#f97316' },
      { name: '待审查', count: 5, percent: 1, iconColor: '#3b82f6', barColor: '#3b82f6', textColor: '#3b82f6' },
      { name: '任务代办', count: 26, percent: 6, iconColor: '#10b981', barColor: '#10b981', textColor: '#10b981' },
    ],
    functions: [
      { name: '视频会议', bgColor: '#3b82f6' },
      { name: '会议中心', bgColor: '#8b5cf6' },
      { name: '在线文档', bgColor: '#06b6d4' },
      { name: '任务中心', bgColor: '#f59e0b' },
      { name: '消息中心', bgColor: '#ef4444' },
      { name: '审批流转', bgColor: '#10b981' },
      { name: 'AI咨询', bgColor: '#ec489a' },
      { name: '应用中心', bgColor: '#64748b' },
    ],
    typeDistribution: [
      { label: '民政服务', count: 324, percent: 32.4, color: '#facc15' },
      { label: '农业农村', count: 218, percent: 21.8, color: '#4ade80' },
      { label: '综治平安', count: 186, percent: 18.6, color: '#f87171' },
      { label: '民情事项', count: 142, percent: 14.2, color: '#60a5fa' },
      { label: '安全生产', count: 78, percent: 7.8, color: '#a78bfa' },
      { label: '医疗卫生', count: 52, percent: 5.2, color: '#34d399' },
    ],
    actions: {
      async fetchTypeDistribution() {
        // 调用 API 更新 typeDistribution
      }
    },
  }),
})