import type { UploadFile } from 'element-plus';

// ====================== 枚举定义（消除魔法字符串） ======================
export const ApprovalStatusEnum = {
  IN_PROGRESS: 'in_progress',
  PASSED: 'passed',
  REJECTED: 'rejected',
  DRAFT: 'draft'
} as const;
export type ApprovalStatusEnumType = typeof ApprovalStatusEnum[keyof typeof ApprovalStatusEnum]

export const ApprovalTypeEnum = {
  PEOPLE_AFFAIRS: '民情事项',
  AGRICULTURE: '农业农村',
  CIVIL_SERVICE: '民政服务',
  SOCIAL_SECURITY: '综治平安',
  DEFAULT: '民情事项'
} as const;
export type ApprovalType = (typeof ApprovalTypeEnum)[keyof typeof ApprovalTypeEnum];

export const ApprovalTabEnum = {
  ALL: 'all',
  IN_PROGRESS: ApprovalStatusEnum.IN_PROGRESS,
  PROCESSED: 'processed'
} as const;
export type ApprovalTab = (typeof ApprovalTabEnum)[keyof typeof ApprovalTabEnum];

export const ApprovalActionEnum = {
  AGREE: 'agree',
  REJECT: 'reject',
  SUBMIT: 'submit'
} as const;
export type ApprovalAction = (typeof ApprovalActionEnum)[keyof typeof ApprovalActionEnum];

export const TagTypeEnum = {
  PRIMARY: 'primary',
  SUCCESS: 'success',
  WARNING: 'warning',
  DANGER: 'danger',
  INFO: 'info'
} as const;
export type TagType = (typeof TagTypeEnum)[keyof typeof TagTypeEnum];

// 审批标签页配置
export const APPROVAL_TABS = [
  { key: ApprovalTabEnum.ALL, label: '全部事项' },
  { key: ApprovalTabEnum.IN_PROGRESS, label: '办理中' },
  { key: ApprovalTabEnum.PROCESSED, label: '已办理' }
] as const;

// 审批类型下拉配置
export const APPROVAL_TYPE_OPTIONS = [
  { label: ApprovalTypeEnum.PEOPLE_AFFAIRS, value: ApprovalTypeEnum.PEOPLE_AFFAIRS },
  { label: ApprovalTypeEnum.AGRICULTURE, value: ApprovalTypeEnum.AGRICULTURE },
  { label: ApprovalTypeEnum.CIVIL_SERVICE, value: ApprovalTypeEnum.CIVIL_SERVICE },
  { label: ApprovalTypeEnum.SOCIAL_SECURITY, value: ApprovalTypeEnum.SOCIAL_SECURITY }
] as const;

// 负责人选项
export const CHARGE_USER_OPTIONS = [
  { label: '李主任', value: '李主任' },
  { label: '张主任', value: '张主任' },
  { label: '何芸', value: '何芸' },
  { label: '王副镇长', value: '王副镇长' }
] as const;

// 审批操作映射
export const ApprovalActionMap = {
  [ApprovalActionEnum.SUBMIT]: { status: ApprovalStatusEnum.IN_PROGRESS, tagType: TagTypeEnum.PRIMARY, text: '已上报' },
  [ApprovalActionEnum.AGREE]: { status: ApprovalStatusEnum.PASSED, tagType: TagTypeEnum.SUCCESS, text: '已同意' },
  [ApprovalActionEnum.REJECT]: { status: ApprovalStatusEnum.REJECTED, tagType: TagTypeEnum.DANGER, text: '已驳回' }
} as const;

// 审批状态标签类型映射
export const APPROVAL_STATUS_TAG_TYPE: Record<ApprovalStatusEnumType, TagType> = {
  [ApprovalStatusEnum.IN_PROGRESS]: TagTypeEnum.WARNING,
  [ApprovalStatusEnum.PASSED]: TagTypeEnum.SUCCESS,
  [ApprovalStatusEnum.REJECTED]: TagTypeEnum.DANGER,
  [ApprovalStatusEnum.DRAFT]: TagTypeEnum.INFO
};

// 审批状态显示文本
export const APPROVAL_STATUS_LABEL: Record<ApprovalStatusEnumType, string> = {
  [ApprovalStatusEnum.IN_PROGRESS]: '办理中',
  [ApprovalStatusEnum.PASSED]: '已同意',
  [ApprovalStatusEnum.REJECTED]: '已驳回',
  [ApprovalStatusEnum.DRAFT]: '草稿'
};

// AI 建议配置
export const AI_SUGGESTION: Record<ApprovalType | 'DEFAULT', string> = {
  [ApprovalTypeEnum.PEOPLE_AFFAIRS]: '建议 1 个工作日内联系群众核实情况，3 个工作日内反馈处理结果。',
  [ApprovalTypeEnum.AGRICULTURE]: '建议尽快核实耕地面积，匹配最新惠农补贴政策，加快审批流程。',
  [ApprovalTypeEnum.CIVIL_SERVICE]: '建议优先安排上门服务，做好老人信息登记，提升服务满意度。',
  [ApprovalTypeEnum.SOCIAL_SECURITY]: '建议立即介入调解，避免矛盾扩大，做好记录归档。',
  DEFAULT: '请按流程及时处理。'
};

// AI 标签配置
export const AI_TAGS: Record<ApprovalType | 'DEFAULT', string[]> = {
  [ApprovalTypeEnum.PEOPLE_AFFAIRS]: ['民生诉求', '基层反馈', '需协调'],
  [ApprovalTypeEnum.AGRICULTURE]: ['春耕补贴', '耕地核实', '惠农政策'],
  [ApprovalTypeEnum.CIVIL_SERVICE]: ['养老服务', '上门办理', '便民服务'],
  [ApprovalTypeEnum.SOCIAL_SECURITY]: ['矛盾调解', '平安建设', '网格事件'],
  DEFAULT: ['事项办理']
};

// 通用文本
export const COMMON_TEXT = {
  NO_ATTACHMENT: '暂无附件',
  FILE_INVALID_PREVIEW: '文件已失效，无法预览',
  FILE_INVALID_DOWNLOAD: '文件已失效，无法下载',
  FORM_REQUIRED_TYPE: '请选择事项类型',
  FORM_REQUIRED_TITLE: '请输入事项标题',
  FORM_REQUIRED_CHARGE_USER: '请选择负责人员',
  FORM_REQUIRED_CONTENT: '请输入内容说明',
  APPROVAL_REQUIRE_COMMENT: '请填写审批理由！',
  APPROVAL_NOT_FOUND: '未找到该事项！',
  PREVIEW_FAILED: '预览失败，请检查文件',
  DOWNLOAD_FAILED: '下载失败'
};

// 操作结果提示
export const MESSAGE = {
  SUBMIT_SUCCESS: '事项上报成功',
  DRAFT_SUCCESS: '草稿保存成功',
  OPER_SUCCESS: '操作成功'
};

// 当前用户（后续接入后端后改为动态获取）
export const CURRENT_USER = '李主任';

// 文件上传配置
export const UPLOAD_CONFIG = {
  MAX_SIZE: 5 * 1024 * 1024,
  ACCEPT_TYPES: ['.pdf', '.doc', '.docx', '.jpg', '.png'],
  FILE_STATUS: { READY: 'ready' }
} as const;

// 审批信息展示字段配置
export const APPROVAL_INFO_FIELDS = [
  { label: '申请编号', prop: 'id' },
  { label: '项目类型', prop: 'type' },
  { label: '拟稿人', prop: 'author' },
  { label: '批文文号', prop: 'docNo' }
] as const;

export const APPROVAL_SEND_FIELDS = [
  { label: '主送', prop: 'mainSend' },
  { label: '分送', prop: 'ccList', formatter: (list: string[]) => list.join(', ') }
] as const;

// 新建审批表单默认值
export const getEmptyForm = (): CreateApprovalForm => ({
  type: ApprovalTypeEnum.DEFAULT,
  title: '',
  content: '',
  chargeUsers: [],
  fileList: [],
  status: 'draft'
});

// ====================== 类型定义 ======================
export interface ApprovalProcess {
  time: string;
  status: ApprovalStatusEnumType;
  user: string;
  comment: string;
  type: TagType;
}

export interface ApprovalRecord {
  node: string;
  approver: string;
  avatar: string;
  result: ApprovalAction;
  opinion: string;
  time: string;
}

export interface ApprovalFile {
  name: string;
  raw?: File;
}

export interface ApprovalItem {
  id: string;
  title: string;
  department: string;
  status: ApprovalStatusEnumType;
  createTime: string;
  type: ApprovalType;
  author: string;
  docNo: string;
  mainSend: string;
  ccList: string[];
  chargeUsers: string[];
  processList: ApprovalProcess[];
  recordList: ApprovalRecord[];
  files: ApprovalFile[];
}

export interface CreateApprovalForm {
  type: ApprovalType;
  title: string;
  content: string;
  chargeUsers: string[];
  fileList: UploadFile[];
  status: 'draft' | 'submitted';
}

// 草稿项
export interface DraftItem {
  id: string;
  type: ApprovalType;
  title: string;
  content: string;
  chargeUsers: string[];
  fileList: { name: string; uid?: string | number; status?: string }[];
  saveTime: string;
}

// ====================== 工具函数 ======================
export const formatDateTime = (date: Date | string): { full: string; date: string; time: string } => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return { full: `${year}-${month}-${day} ${hours}:${minutes}`, date: `${year}-${month}-${day}`, time: `${hours}:${minutes}` };
};

export const generateApprovalId = (): string => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const r = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `MQ${y}${m}${d}${r}`;
};

export const generateDocNo = (type: ApprovalType): string => {
  const short = type.substring(0, 2);
  const year = new Date().getFullYear();
  const num = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  return `${short}〔${year}〕${num}号`;
};

export const isValidFile = (file: any): file is ApprovalFile => !!(file?.name && file?.raw);