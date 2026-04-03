// src/store/modules/approval.ts
import { defineStore } from 'pinia'
import type { ApprovalItem, CreateApprovalForm } from '@/views/approval/utils/types'
import { ApprovalStatusEnum } from '@/views/approval/utils/types'
import { getMockApprovalList, operateApproval, createApproval } from '@/views/approval/utils/mock'

export const useApprovalStore = defineStore('approval', {
  state: () => ({
    list: [] as ApprovalItem[],
    loading: false,
    total: 0,
  }),
  getters: {
    pendingCount: (state) => state.list.filter(item => item.status === ApprovalStatusEnum.IN_PROGRESS).length,
    completedCount: (state) => state.list.filter(item => item.status === ApprovalStatusEnum.PASSED || item.status === ApprovalStatusEnum.REJECTED).length,
  },
  actions: {
    async fetchList(params: { tab?: string; keyword?: string } = {}) {
      this.loading = true
      try {
        // 模拟 API 延迟
        await new Promise(resolve => setTimeout(resolve, 300))
        let list = getMockApprovalList()
        const { tab, keyword } = params

        if (tab === 'in_progress') {
          list = list.filter(item => item.status === ApprovalStatusEnum.IN_PROGRESS)
        } else if (tab === 'processed') {
          list = list.filter(item => item.status === ApprovalStatusEnum.PASSED || item.status === ApprovalStatusEnum.REJECTED)
        }
        if (keyword) {
          const kw = keyword.toLowerCase()
          list = list.filter(item => item.title.toLowerCase().includes(kw) || item.docNo.toLowerCase().includes(kw))
        }
        this.list = list
        this.total = list.length
      } finally {
        this.loading = false
      }
    },
    async approveItem(id: string, action: 'agree' | 'reject', comment: string) {
      const result = await operateApproval(id, action, comment)
      if (result.success && result.data) {
        const index = this.list.findIndex(item => item.id === id)
        if (index !== -1) this.list[index] = result.data
      }
      return result
    },
    async createItem(formData: CreateApprovalForm) {
      const newItem = await createApproval(formData)
      this.list.unshift(newItem)
      this.total++
      return newItem
    },
  },
})