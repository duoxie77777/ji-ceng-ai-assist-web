

import type { ApprovalItem, CreateApprovalForm } from '@/views/approval/utils/types';
import {
  ApprovalStatusEnum,
  ApprovalTypeEnum,
  ApprovalActionEnum,
  ApprovalActionMap,
  formatDateTime,
  generateApprovalId,
  generateDocNo,
  CURRENT_USER,
  TagTypeEnum,
} from '@/views/approval/utils/types';

// 辅助函数：生成随机审批记录
const generateMockProcessList = (author: string, type: ApprovalTypeEnum): any[] => {
  const now = new Date();
  const submitTime = formatDateTime(new Date(now.getTime() - 24 * 60 * 60 * 1000)).full;
  const processTime = formatDateTime(now).full;
  const baseProcess = [
    {
      time: submitTime,
      status: ApprovalStatusEnum.IN_PROGRESS,
      user: author,
      comment: `申请${type === ApprovalTypeEnum.AGRICULTURE ? '春耕补贴' : '事项处理'}`,
      type: ApprovalActionMap[ApprovalActionEnum.SUBMIT].tagType,
    },
  ];
  if (Math.random() > 0.6) {
    baseProcess.push({
      time: processTime,
      status: ApprovalStatusEnum.IN_PROGRESS,
      user: CURRENT_USER,
      comment: '正在核实中',
      type: ApprovalActionMap[ApprovalActionEnum.SUBMIT].tagType,
    });
  }
  return baseProcess;
};

// 获取模拟审批列表
export const getMockApprovalList = (): ApprovalItem[] => {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  return [
    {
      id: 'MQ20260223001',
      title: '李家村春耕农资补贴申请',
      department: '李家村村委会',
      status: ApprovalStatusEnum.IN_PROGRESS,
      createTime: formatDateTime(yesterday).full,
      type: ApprovalTypeEnum.AGRICULTURE,
      author: '张建国',
      docNo: '李村发〔2026〕08号',
      mainSend: '镇农业农村办公室',
      ccList: ['镇分管领导'],
      chargeUsers: ['李主任'],
      processList: generateMockProcessList('张建国', ApprovalTypeEnum.AGRICULTURE),
      recordList: [],
      files: [{ name: '春耕补贴申请_AI生成版.docx' }],
    },
    {
      id: 'MQ20260222002',
      title: '养老资格认证上门服务预约',
      department: '镇便民服务中心',
      status: ApprovalStatusEnum.IN_PROGRESS,
      createTime: formatDateTime(twoDaysAgo).full,
      type: ApprovalTypeEnum.CIVIL_SERVICE,
      author: '陈丽',
      docNo: '便服〔2026〕03号',
      mainSend: '镇民政办',
      ccList: [],
      chargeUsers: ['张主任'],
      processList: generateMockProcessList('陈丽', ApprovalTypeEnum.CIVIL_SERVICE),
      recordList: [],
      files: [{ name: '老人名单.xlsx' }],
    },
    {
      id: 'MQ20260221003',
      title: '王家坳矛盾纠纷处置',
      department: '王家坳网格',
      status: ApprovalStatusEnum.IN_PROGRESS,
      createTime: formatDateTime(new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)).full,
      type: ApprovalTypeEnum.SOCIAL_SECURITY,
      author: '刘敏',
      docNo: '王网〔2026〕12号',
      mainSend: '镇综治办',
      ccList: [],
      chargeUsers: ['何芸'],
      processList: generateMockProcessList('刘敏', ApprovalTypeEnum.SOCIAL_SECURITY),
      recordList: [],
      files: [],
    },
    {
      id: 'MQ20260220004',
      title: '村民饮水困难诉求处理',
      department: '李家村村委会',
      status: ApprovalStatusEnum.IN_PROGRESS,
      createTime: formatDateTime(new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000)).full,
      type: ApprovalTypeEnum.PEOPLE_AFFAIRS,
      author: '张建国',
      docNo: '李村发〔2026〕09号',
      mainSend: '镇政府',
      ccList: [],
      chargeUsers: ['王副镇长'],
      processList: generateMockProcessList('张建国', ApprovalTypeEnum.PEOPLE_AFFAIRS),
      recordList: [],
      files: [],
    },
  ];
};

// 模拟审批操作
export const operateApproval = (id: string, action: ApprovalActionEnum, comment: string): { success: boolean; data?: ApprovalItem } => {
  const list = getMockApprovalList();
  const targetIndex = list.findIndex(item => item.id === id);
  if (targetIndex === -1) return { success: false };
  const target = { ...list[targetIndex] };
  const now = new Date();
  const newStatus = action === ApprovalActionEnum.AGREE ? ApprovalStatusEnum.PASSED : ApprovalStatusEnum.REJECTED;
  const tagType = action === ApprovalActionEnum.AGREE ? TagTypeEnum.SUCCESS : TagTypeEnum.DANGER;
  target.status = newStatus;
  target.processList = target.processList ?? [];
  target.processList.push({
    time: formatDateTime(now).full,
    status: newStatus,
    user: CURRENT_USER,
    comment,
    type: tagType,
  });
  target.recordList = target.recordList ?? [];
  target.recordList.push({
    node: '审批',
    approver: CURRENT_USER,
    avatar: '',
    result: action,
    opinion: comment,
    time: formatDateTime(now).full,
  });
  return { success: true, data: target };
};

// 模拟创建审批事项（
export const createApproval = (formData: CreateApprovalForm): ApprovalItem => {
  const now = new Date();
  return {
    id: generateApprovalId(),
    title: formData.title,
    department: '本级部门',
    status: ApprovalStatusEnum.IN_PROGRESS,
    createTime: formatDateTime(now).full,
    type: formData.type,
    author: CURRENT_USER,
    docNo: generateDocNo(formData.type),
    mainSend: '',
    ccList: [],
    chargeUsers: formData.chargeUsers,
    processList: [
      {
        time: formatDateTime(now).full,
        status: ApprovalActionMap[ApprovalActionEnum.SUBMIT].status,
        user: CURRENT_USER,
        comment: formData.content,
        type: ApprovalActionMap[ApprovalActionEnum.SUBMIT].tagType,
      },
    ],
    recordList: [],
    files: formData.fileList.filter(f => f.raw).map(f => ({ name: f.name, raw: f.raw })),
  };
};