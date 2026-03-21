<template>
  <div class="approval-page">
    <!-- 审批侧边栏：展示列表、标签切换、搜索、选中项 -->
    <ApprovalSidebar :list="filteredList" :active-tab="activeTab" :search-keyword="searchKeyword"
      :selected="selectedApproval" @update:active-tab="activeTab = $event"
      @update:search-keyword="searchKeyword = $event" @select="handleSelect" />

    <!-- 审批详情：展示审批流程、操作审批 -->
    <ApprovalDetail ref="detailRef" v-if="selectedApproval" :approval="selectedApproval" @approve="handleApproval" />
    <!-- 审批基础信息展示 -->
    <ApprovalInfo v-if="selectedApproval" :approval="selectedApproval" />

    <!-- 发起审批抽屉弹窗 -->
    <el-drawer v-model="showCreateDrawer" title="发起事项" size="80%" direction="rtl" :close-on-click-modal="false">
      <CreateApproval @submit="handleCreateApproval" @cancel="showCreateDrawer = false" />
    </el-drawer>

    <!-- 发起事项按钮 -->
    <div class="create-btn-wrapper">
      <el-button type="primary" @click="showCreateDrawer = true">发起事项</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed} from 'vue'
import { ElMessage } from 'element-plus'
import ApprovalSidebar from './components/ApprovalSidebar.vue'
import ApprovalDetail from './components/ApprovalDetail.vue'
import ApprovalInfo from './components/ApprovalInfo.vue'
import CreateApproval from './components/CreateApproval.vue'
import type { ApprovalItem, ApprovalProcess, CreateApprovalForm } from './utils/types'
import {
  ApprovalTypeEnum,
  ApprovalStatusEnum,
  ApprovalTabEnum,
  ApprovalActionEnum,
  ApprovalActionMap,
  MESSAGE,
  USER,
  formatDateTime,
  generateApprovalId,
  generateDocNo,
  COMMON_TEXT
} from './utils/types';

// 当前登录用户
const currentUser = ref(USER.CURRENT)

// 日期格式化工具函数封装
const formatTime = (date = new Date()): string => formatDateTime(date).full;

// 生成模拟审批列表数据
const getMockApprovalList = (): ApprovalItem[] => {
  return [
    {
      id: 'MQ20260223001',
      title: '李家村春耕农资补贴申请',
      department: '李家村村委会',
      status: ApprovalStatusEnum.IN_PROGRESS,
      createTime: formatTime(new Date(2026, 1, 23, 9, 15)),
      type: ApprovalTypeEnum.AGRICULTURE,
      author: '张建国',
      docNo: '李村发〔2026〕08号',
      mainSend: '镇农业农村办公室',
      ccList: ['镇分管领导'],
      chargeUsers: ['李主任'],
      processList: [
        {
          time: formatTime(new Date(2026, 1, 23, 9, 15)),
          status: ApprovalStatusEnum.IN_PROGRESS,
          user: '张建国',
          comment: '申请春耕农资补贴',
          type: ApprovalActionMap.submit.tagType,
        },
        {
          time: formatTime(new Date(2026, 1, 23, 10, 30)),
          status: ApprovalStatusEnum.IN_PROGRESS,
          user: '李主任',
          comment: '正在核实',
          type: ApprovalActionMap.submit.tagType,
        },
      ],
      recordList: [],
      files: [{ name: '春耕补贴申请_AI生成版.docx' }],
    },
    {
      id: 'MQ20260222002',
      title: '养老资格认证上门服务预约',
      department: '镇便民服务中心',
      status: ApprovalStatusEnum.IN_PROGRESS,
      createTime: formatTime(new Date(2026, 1, 22, 14, 20)),
      type: ApprovalTypeEnum.CIVIL_SERVICE,
      author: '陈丽',
      docNo: '便服〔2026〕03号',
      mainSend: '镇民政办',
      ccList: [],
      chargeUsers: ['张主任'],
      processList: [
        {
          time: formatTime(new Date(2026, 1, 22, 14, 20)),
          status: ApprovalActionMap.submit.status,
          user: '陈丽',
          comment: '申请上门办理养老认证',
          type: ApprovalActionMap.submit.tagType,
        },
      ],
      recordList: [],
      files: [{ name: '老人名单.xlsx' }],
    },
    {
      id: 'MQ20260221003',
      title: '王家坳矛盾纠纷处置',
      department: '王家坳网格',
      status: ApprovalStatusEnum.IN_PROGRESS,
      createTime: formatTime(new Date(2026, 1, 21, 11, 5)),
      type: ApprovalTypeEnum.SOCIAL_SECURITY,
      author: '刘敏',
      docNo: '王网〔2026〕12号',
      mainSend: '镇综治办',
      ccList: [],
      chargeUsers: ['何芸'],
      processList: [
        {
          time: formatTime(new Date(2026, 1, 21, 11, 5)),
          status: ApprovalActionMap.submit.status,
          user: '刘敏',
          comment: '矛盾纠纷上报',
          type: ApprovalActionMap.submit.tagType,
        },
      ],
      recordList: [],
      files: [],
    },
    {
      id: 'MQ20260220004',
      title: '村民饮水困难诉求处理',
      department: '李家村村委会',
      status: ApprovalStatusEnum.IN_PROGRESS,
      createTime: formatTime(new Date(2026, 1, 20, 16, 30)),
      type: ApprovalTypeEnum.PEOPLE_AFFAIRS,
      author: '张建国',
      docNo: '李村发〔2026〕09号',
      mainSend: '镇政府',
      ccList: [],
      chargeUsers: ['王副镇长'],
      processList: [
        {
          time: formatTime(new Date(2026, 1, 20, 16, 30)),
          status: ApprovalActionMap.submit.status,
          user: '张建国',
          comment: '村民饮水困难',
          type: ApprovalActionMap.submit.tagType,
        },
      ],
      recordList: [],
      files: [],
    },
  ];
};

// 审批列表数据源
const approvalList = ref<ApprovalItem[]>(getMockApprovalList())

// 页面状态：标签页、搜索关键词、选中项、抽屉显隐、详情组件ref
const activeTab = ref(ApprovalTabEnum.ALL)
const searchKeyword = ref('')
const selectedApproval = ref<ApprovalItem | null>(null)
const showCreateDrawer = ref(false)
const detailRef = ref()

// 筛选当前用户负责的审批事项
const filteredList = computed(() => {
  return approvalList.value.filter(item =>
    item.chargeUsers.includes(currentUser.value)
  )
})

// 监听筛选列表，默认选中第一个事项
watch(filteredList, (val) => {
  if (val.length && !selectedApproval.value) {
    selectedApproval.value = val[0] as ApprovalItem;
  }
}, { immediate: true });

// 选中审批事项回调
const handleSelect = (item: ApprovalItem) => {
  selectedApproval.value = item;
  if (detailRef.value?.$el) {
    detailRef.value.$el.scrollTop = 0;
  }
};

// 处理发起新审批
const handleCreateApproval = (formData: CreateApprovalForm) => {
  const now = new Date();
  const newItem: ApprovalItem = {
    id: generateApprovalId(),
    title: formData.title,
    department: '本级部门',
    status: ApprovalStatusEnum.IN_PROGRESS,
    createTime: formatTime(now),
    type: formData.type,
    author: currentUser.value,
    docNo: generateDocNo(formData.type),
    mainSend: '',
    ccList: [],
    chargeUsers: formData.chargeUsers || [],
    processList: [{
      time: formatTime(now),
      status: ApprovalActionMap.submit.status,
      user: currentUser.value,
      comment: formData.content,
      type: ApprovalActionMap.submit.tagType,
    }],
    recordList: [],
    files: formData.fileList.map(f => ({ name: f.name, raw: f.raw })) || [],
  };

  approvalList.value.unshift(newItem);
  ElMessage.success(MESSAGE.SUBMIT_SUCCESS);
  showCreateDrawer.value = false;
  selectedApproval.value = newItem;
};

// 处理审批操作（同意/驳回）
const handleApproval = (data: { id: string, result: ApprovalActionEnum, comment: string }) => {
  const { id, result, comment } = data;

  // 校验审批意见必填
  if (!comment.trim()) {
    ElMessage.warning(COMMON_TEXT.APPROVAL_REQUIRE_COMMENT);
    return;
  }

  // 查找目标审批项
  const targetIndex = approvalList.value.findIndex(item => item.id === id);
  if (targetIndex === -1) {
    ElMessage.error(COMMON_TEXT.APPROVAL_NOT_FOUND);
    return;
  }

  // 构建审批流程记录
  const processItem: ApprovalProcess = {
    time: formatTime(),
    status: ApprovalActionMap[result].status,
    user: currentUser.value,
    comment: comment,
    type: ApprovalActionMap[result].tagType,
  };

  // 更新审批列表数据
  if (approvalList.value[targetIndex]) {
    approvalList.value[targetIndex].processList.push(processItem);
    approvalList.value[targetIndex].status = ApprovalActionMap[result].status;
  }
  // 更新选中项数据
  if (selectedApproval.value?.id === id) {
    selectedApproval.value = {
      ...selectedApproval.value,
      processList: [...(approvalList.value[targetIndex]?.processList ?? [])],
      status: approvalList.value[targetIndex]?.status ?? ApprovalStatusEnum.IN_PROGRESS,
    };
  }

  ElMessage.success(MESSAGE.OPER_SUCCESS);
};
</script>

<style scoped lang="less">
.approval-page {
  display: flex;
  height: 100%;
  background: var(--white);
  position: relative;
}

.create-btn-wrapper {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 10;
}
</style>