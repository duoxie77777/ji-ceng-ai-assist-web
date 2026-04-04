import { get, post, put, upload } from '@/utils/request'

export enum ApprovalStatus {
  IN_PROGRESS = 'in_progress',
  PASSED = 'passed',
  REJECTED = 'rejected',
  DRAFT = 'draft'
}

export interface ApprovalRecord {
  id: number
  node: string
  action: string
  opinion: string
  createdAt: string
  user: {
    username: string
    avatar: string
  }
}

export interface Approval {
  id: number
  businessId: string
  title: string
  content: string
  type: string
  docNo: string
  status: ApprovalStatus
  department: string
  files: string[]
  author: {
    username: string
    avatar: string
  }
  records: ApprovalRecord[]
  createdAt: string
}

export interface UploadResult {
  url: string
  filename: string
  originalname: string
}

export const approvalApi = {
  // 上传审批文件
  uploadFile: (file: File) => upload<UploadResult>('/approval/upload', file, 'file'),

  // 发起审批
  create: (data: any) => post<Approval>('/approval', data),

  // 获取审批列表
  getList: (params: { userId: number; status?: string; keyword?: string }) =>
    get<Approval[]>('/approval', params),

  // 获取详情
  getDetail: (id: number) => get<Approval>(`/approval/${id}`),

  // 处理审批
  updateStatus: (data: { approvalId: number; userId: number; action: string; opinion: string }) =>
    put<Approval>('/approval/status', data)
}
