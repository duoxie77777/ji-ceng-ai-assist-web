import type { UploadFile } from 'element-plus'
import type { s } from 'vue-router/dist/router-CWoNjPRp.mjs'

export type ApprovalStatus = 'in_progress' | 'passed' | 'rejected' | 'draft'

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
  name: string
}

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
  processList: ApprovalProcess[]
  recordList: ApprovalRecord[]
  files: ApprovalFile[]
  chargeUsers: string[]
}

export interface ApproverItem {
  id: number
  name: string
  department: string
  position: string
  avatar: string
}

export type ApprovalTypeValue = 'expense' | 'leave' | 'purchase' | 'document' | 'other'
export type UrgencyValue = 'normal' | 'urgent' | 'very_urgent'

export interface CreateApprovalForm {
  type: ApprovalTypeValue | ''
  urgency: UrgencyValue
  title: string
  content: string
  approvers: ApproverItem[]
  ccPersons: number[]
  fileList: UploadFile[]
  approvalNo: string
  status: 'draft' | 'submitted'
}

export interface PersonItem extends ApproverItem {}