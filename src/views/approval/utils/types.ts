import type { UploadFile } from 'element-plus';

// ======================
// 1. 强类型枚举：审批状态/类型/标签页/操作等
// ======================
export const ApprovalStatusEnum = {
  IN_PROGRESS: 'in_progress',
  PASSED: 'passed',
  REJECTED: 'rejected',
  DRAFT: 'draft',
} as const;
export type ApprovalStatusEnum = typeof ApprovalStatusEnum[keyof typeof ApprovalStatusEnum];

export const ApprovalTypeEnum = {
  PEOPLE_AFFAIRS: '民情事项',
  AGRICULTURE: '农业农村',
  CIVIL_SERVICE: '民政服务',
  SOCIAL_SECURITY: '综治平安',
  DEFAULT: '民情事项',
} as const;
export type ApprovalTypeEnum = typeof ApprovalTypeEnum[keyof typeof ApprovalTypeEnum];

export const ApprovalTabEnum = {
  ALL: 'all',
  IN_PROGRESS: ApprovalStatusEnum.IN_PROGRESS,
  PROCESSED: 'processed',
} as const;
export const ApprovalTabLabelEnum = {
  [ApprovalTabEnum.ALL]: '全部事项',
  [ApprovalTabEnum.IN_PROGRESS]: '办理中',
  [ApprovalTabEnum.PROCESSED]: '已办理',
} as const;

export const ApprovalActionEnum = {
  AGREE: 'agree',
  REJECT: 'reject',
  SUBMIT: 'submit',
} as const;
export type ApprovalActionEnum = typeof ApprovalActionEnum[keyof typeof ApprovalActionEnum];

// 审批标签页配置
export const ApprovalTabConfig = [
  { key: ApprovalTabEnum.ALL, label: ApprovalTabLabelEnum[ApprovalTabEnum.ALL] },
  { key: ApprovalTabEnum.IN_PROGRESS, label: ApprovalTabLabelEnum[ApprovalTabEnum.IN_PROGRESS] },
  { key: ApprovalTabEnum.PROCESSED, label: ApprovalTabLabelEnum[ApprovalTabEnum.PROCESSED] }
] as const;

// 审批类型下拉配置
export const ApprovalTypeConfig = [
  { label: ApprovalTypeEnum.PEOPLE_AFFAIRS, value: ApprovalTypeEnum.PEOPLE_AFFAIRS },
  { label: ApprovalTypeEnum.AGRICULTURE, value: ApprovalTypeEnum.AGRICULTURE },
  { label: ApprovalTypeEnum.CIVIL_SERVICE, value: ApprovalTypeEnum.CIVIL_SERVICE },
  { label: ApprovalTypeEnum.SOCIAL_SECURITY, value: ApprovalTypeEnum.SOCIAL_SECURITY },
] as const;

// ======================
// 2. 审批操作映射：操作->状态/标签类型
// ======================
export const TagTypeEnum = {
  PRIMARY: 'primary',
  SUCCESS: 'success',
  WARNING: 'warning',
  DANGER: 'danger',
  INFO: 'info',
} as const;
export type TagTypeEnum = typeof TagTypeEnum[keyof typeof TagTypeEnum];

// 审批操作与状态/标签映射
export const ApprovalActionMap = {
  [ApprovalActionEnum.SUBMIT]: {
    status: ApprovalStatusEnum.IN_PROGRESS,
    tagType: TagTypeEnum.PRIMARY,
    text: '已上报',
  },
  [ApprovalActionEnum.AGREE]: {
    status: ApprovalStatusEnum.PASSED,
    tagType: TagTypeEnum.SUCCESS,
    text: '已同意',
  },
  [ApprovalActionEnum.REJECT]: {
    status: ApprovalStatusEnum.REJECTED,
    tagType: TagTypeEnum.DANGER,
    text: '已驳回',
  }
} as const;

// ======================
// 3. 核心类型定义
// ======================
export type ApprovalActionMapValue = typeof ApprovalActionMap[keyof typeof ApprovalActionMap];

// 审批流程记录项
export interface ApprovalProcess {
  time: string;
  status: ApprovalStatusEnum;
  user: string;
  comment: string;
  type: TagTypeEnum;
}

// 审批记录项
export interface ApprovalRecord {
  node: string;
  approver: string;
  avatar: string;
  result: ApprovalActionEnum;
  opinion: string;
  time: string;
}

// 审批附件文件
export interface ApprovalFile {
  name: string;
  raw?: File;
}

// 审批事项完整结构
export interface ApprovalItem {
  id: string;
  title: string;
  department: string;
  status: ApprovalStatusEnum;
  createTime: string;
  type: ApprovalTypeEnum;
  author: string;
  docNo: string;
  mainSend: string;
  ccList: string[];
  chargeUsers: string[];
  processList: ApprovalProcess[];
  recordList: ApprovalRecord[];
  files: ApprovalFile[];
  formData?: CreateApprovalForm;
}

// 新建审批表单状态
export type CreateApprovalStatusEnum = (ApprovalStatusEnum extends string ? ApprovalStatusEnum : never) | 'submitted';

// 新建审批表单结构
export interface CreateApprovalForm {
  type: ApprovalTypeEnum;
  title: string;
  content: string;
  chargeUsers: string[];
  fileList: UploadFile[];
  status: CreateApprovalStatusEnum;
}

// ======================
// 4. 常量配置：字段/提示语/用户/上传等
// ======================
export type ApprovalFieldConfig = {
  label: string;
  prop: keyof ApprovalItem;
  formatter?: (value: any) => string;
};

// 审批信息展示字段配置
export const APPROVAL_INFO_FIELDS: ApprovalFieldConfig[] = [
  { label: '申请编号', prop: 'id' },
  { label: '项目类型', prop: 'type'},
  { label: '拟稿人', prop: 'author' },
  { label: '批文文号', prop: 'docNo' },
];

// 审批主送/分送字段配置
export const APPROVAL_SEND_FIELDS: ApprovalFieldConfig[] = [
  { label: '主送', prop: 'mainSend' },
  { label: '分送', prop: 'ccList', formatter: (list: string[]) => list.join(', ') },
];

// 审批状态中文映射
export const APPROVAL_STATUS_LABEL: Record<ApprovalStatusEnum, string> = {
  [ApprovalStatusEnum.IN_PROGRESS]: ApprovalTabLabelEnum[ApprovalTabEnum.IN_PROGRESS],
  [ApprovalStatusEnum.PASSED]: '已同意',
  [ApprovalStatusEnum.REJECTED]: '已驳回',
  [ApprovalStatusEnum.DRAFT]: '草稿',
};

// 审批状态标签类型映射
export const APPROVAL_STATUS_TAG_TYPE: Record<ApprovalStatusEnum, TagTypeEnum> = {
  [ApprovalStatusEnum.IN_PROGRESS]: TagTypeEnum.WARNING,
  [ApprovalStatusEnum.PASSED]: TagTypeEnum.SUCCESS,
  [ApprovalStatusEnum.REJECTED]: TagTypeEnum.DANGER,
  [ApprovalStatusEnum.DRAFT]: TagTypeEnum.INFO,
};

// AI辅助建议配置
export const AI_SUGGESTION: Record<ApprovalTypeEnum | 'DEFAULT', string> = {
  [ApprovalTypeEnum.PEOPLE_AFFAIRS]: '建议1个工作日内联系群众核实情况，3个工作日内反馈处理结果。',
  [ApprovalTypeEnum.AGRICULTURE]: '建议尽快核实耕地面积，匹配最新惠农补贴政策，加快审批流程。',
  [ApprovalTypeEnum.CIVIL_SERVICE]: '建议优先安排上门服务，做好老人信息登记，提升服务满意度。',
  [ApprovalTypeEnum.SOCIAL_SECURITY]: '建议立即介入调解，避免矛盾扩大，做好记录归档。',
  DEFAULT: '请按流程及时处理。',
} as const;

// AI标签配置
export const AI_TAGS: Record<ApprovalTypeEnum | 'DEFAULT', string[]> = {
  [ApprovalTypeEnum.PEOPLE_AFFAIRS]: ['民生诉求', '基层反馈', '需协调'],
  [ApprovalTypeEnum.AGRICULTURE]: ['春耕补贴', '耕地核实', '惠农政策'],
  [ApprovalTypeEnum.CIVIL_SERVICE]: ['养老服务', '上门办理', '便民服务'],
  [ApprovalTypeEnum.SOCIAL_SECURITY]: ['矛盾调解', '平安建设', '网格事件'],
  DEFAULT: ['事项办理'],
} as const;

// 通用提示文本
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
  DOWNLOAD_FAILED: '下载失败',
} as const;

// 操作结果提示
export const MESSAGE = {
  SUBMIT_SUCCESS: '事项上报成功',
  DRAFT_SUCCESS: '草稿保存成功',
  OPER_SUCCESS: '操作成功',
} as const;

// 当前用户常量
export const USER = {
  CURRENT: '李主任',
} as const;

// 负责人下拉选项
export const CHARGE_USER_OPTIONS = [
  { label: '李主任（农业）', value: '李主任' },
  { label: '张主任（民政）', value: '张主任' },
  { label: '何芸（综治）', value: '何芸' },
  { label: '王副镇长', value: '王副镇长' },
] as const;

// 文件上传配置
export const UPLOAD_CONFIG = {
  MAX_SIZE: 5 * 1024 * 1024,
  ACCEPT_TYPES: ['.pdf', '.doc', '.docx', '.jpg', '.png'],
  FILE_STATUS: {
    READY: 'ready' as const,
  },
} as const;

// 新建审批国际化文本
export const CREATE_APPROVAL_LOCALE = {
  BUTTON: {
    CANCEL: '取消',
    SUBMIT: '提交上报',
    SELECT_FILE: '选择文件',
  },
  PLACEHOLDER: {
    TYPE: '请选择',
    TITLE: '请输入',
    CHARGE_USERS: '选择负责领导',
    CONTENT: '请输入内容说明',
    FILE_UPLOAD: '可上传相关附件（选填）',
  },
  VALIDATE: {
    FILE_SIZE: (size: number) => `文件大小不能超过${size / 1024 / 1024}MB`,
    FILE_TYPE: (types: string[]) => `仅支持上传${types.join('、')}格式文件`,
  },
} as const;

// 审批详情国际化文本
export const ApprovalDetailLocale = {
  title: {
    aiAnalysis: 'AI 辅助分析',
    content: '事项正文',
    process: '审批流程'
  },
  button: {
    agree: '同意',
    reject: '驳回',
    confirm: '确认',
    cancel: '取消'
  },
  modal: {
    agreeTitle: '同意审批',
    agreePrompt: '请输入审批意见（必填）',
    rejectTitle: '驳回审批',
    rejectPrompt: '请输入驳回理由（必填）',
    inputError: '{type}不能为空！'
  },
  message: {
    agreeSuccess: '已同意',
    rejectSuccess: '已驳回',
    cancel: '已取消',
    emptyContent: '暂无内容',
    emptyComment: COMMON_TEXT.APPROVAL_REQUIRE_COMMENT,
    emptyRejectReason: COMMON_TEXT.APPROVAL_REQUIRE_COMMENT.replace('审批理由', '驳回理由'),
  },
  meta: {
    docNo: '文号:',
    author: '发起:',
    time: '时间:'
  }
};

// ======================
// 5. 工具函数：格式化/生成/校验等
// ======================
// 日期格式化：返回完整/日期/时间字符串
export const formatDateTime = (date: Date | string): { full: string; date: string; time: string } => {
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  const year = targetDate.getFullYear();
  const month = String(targetDate.getMonth() + 1).padStart(2, '0');
  const day = String(targetDate.getDate()).padStart(2, '0');
  const hours = String(targetDate.getHours()).padStart(2, '0');
  const minutes = String(targetDate.getMinutes()).padStart(2, '0');
  const full = `${year}-${month}-${day} ${hours}:${minutes}`;
  return { full, date: `${year}-${month}-${day}`, time: `${hours}:${minutes}` };
};

// 生成审批唯一ID
export const generateApprovalId = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `MQ${year}${month}${day}${random}`;
};

// 生成审批文号
export const generateDocNo = (type: ApprovalTypeEnum): string => {
  const typeShort = type.substring(0, 2);
  const year = new Date().getFullYear();
  const num = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  return `${typeShort}〔${year}〕${num}号`;
};

// 校验文件有效性
export const isValidFile = (file: Partial<ApprovalFile>): file is ApprovalFile => {
  return !!(file?.name && file?.raw);
};

// 审批常量聚合导出
export const ApprovalConsts = {
  Status: ApprovalStatusEnum,
  Type: ApprovalTypeEnum,
  Tab: ApprovalTabEnum,
  TabLabel: ApprovalTabLabelEnum,
  Action: ApprovalActionEnum,
  ActionMap: ApprovalActionMap,
} as const;