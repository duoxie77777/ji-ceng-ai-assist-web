import type { UploadFile } from 'element-plus'

export type ApprovalStatus = 'in_progress' | 'passed' | 'rejected' | 'draft'

// 审批流程项类型
export interface ApprovalProcess {
  time: string
  status: string
  user: string
  comment: string
  type: 'primary' | 'success' | 'warning' | 'danger'
}

export interface ApprovalRecord {
  node: string
  approver: string
  avatar: string
  result: string
  opinion: string
  time: string
}

export interface ApprovalFile {
  name: string,
  raw?: File
}

// 审批事项主类型
export interface ApprovalItem {
  id: string
  title: string
  department: string
  status: ApprovalStatus
  createTime: string
  type: string
  author: string
  docNo: string
  mainSend: string
  ccList: string[]
  chargeUsers: string[]
  processList: ApprovalProcess[]
  recordList: any[]
  files: ApprovalFile[]
}


export type ApprovalTypeValue = 'expense' | 'leave' | 'purchase' | 'document' | 'other'
export type UrgencyValue = 'normal' | 'urgent' | 'very_urgent'

export interface CreateApprovalForm {
  type: ApprovalTypeValue | ''
  urgency: UrgencyValue
  title: string
  content: string
  approvers: ApprovalItem[]
  ccPersons: number[]
  fileList: UploadFile[]
  approvalNo: string
  status: 'draft' | 'submitted'
}

export interface PersonItem extends ApprovalItem { }