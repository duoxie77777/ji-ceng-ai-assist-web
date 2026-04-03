<template>
  <div class="approval-page">
    <ApprovalSidebar :list="filteredList" :active-tab="activeTab" :search-keyword="searchKeyword"
      :selected="selectedApproval" @update:active-tab="activeTab = $event"
      @update:search-keyword="searchKeyword = $event" @select="handleSelect" />

    <ApprovalDetail ref="detailRef" v-if="selectedApproval" :approval="selectedApproval" @approve="handleApproval" />
    <ApprovalInfo v-if="selectedApproval" :approval="selectedApproval" />

    <el-drawer v-model="showCreateDrawer" title="发起事项" size="80%" direction="rtl" :close-on-click-modal="false"
      destroy-on-close @close="resetCreateDrawer">
      <CreateApproval ref="createApprovalRef" :initial-data="editingDraftData" @submit="handleCreateApproval"
        @draft="handleSaveDraft" @cancel="showCreateDrawer = false" />
    </el-drawer>

    <el-drawer v-model="showDraftDrawer" title="草稿箱" size="50%" direction="rtl">
      <el-table :data="draftList" border stripe>
        <el-table-column label="事项类型" prop="type" />
        <el-table-column label="事项标题" prop="title" />
        <el-table-column label="保存时间" prop="saveTime" />
        <el-table-column label="操作" width="180px">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="editDraft(row)">编辑</el-button>
            <el-button type="danger" size="small" @click="deleteDraft(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-drawer>

    <div class="create-btn-wrapper">
      <el-button type="primary" @click="openCreateDrawer">发起事项</el-button>
      <el-button @click="showDraftDrawer = true">草稿箱</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import ApprovalSidebar from './components/ApprovalSidebar.vue'
import ApprovalDetail from './components/ApprovalDetail.vue'
import ApprovalInfo from './components/ApprovalInfo.vue'
import CreateApproval from './components/CreateApproval.vue'
import type { ApprovalItem, ApprovalProcess, CreateApprovalForm, DraftItem } from './utils/types'
import {
  ApprovalTypeEnum,
  ApprovalStatusEnum,
  ApprovalTabEnum,
  ApprovalActionEnum,
  ApprovalActionMap,
  MESSAGE,
  CURRENT_USER,
  formatDateTime,
  generateApprovalId,
  generateDocNo,
  COMMON_TEXT,
} from './utils/types'

// 当前用户
const currentUser = CURRENT_USER

// 日期格式化
const formatTime = (date: Date = new Date()): string => formatDateTime(date).full

// 草稿箱
const showDraftDrawer = ref(false)
const draftList = ref<DraftItem[]>([])
const editingDraftId = ref<string | null>(null)
const editingDraftData = ref<CreateApprovalForm | null>(null)

// 打开发起抽屉
const openCreateDrawer = () => {
  resetCreateDrawer()
  showCreateDrawer.value = true
}

// 重置草稿编辑状态
const resetCreateDrawer = () => {
  editingDraftId.value = null
  editingDraftData.value = null
}

// 删除草稿
const deleteDraft = (id: string) => {
  ElMessageBox.confirm('确定删除该草稿吗？', '提示', { type: 'warning' }).then(() => {
    draftList.value = draftList.value.filter(d => d.id !== id)
    ElMessage.success('草稿已删除')
  }).catch(() => { })
}

// 编辑草稿
const editDraft = (draft: DraftItem) => {
  editingDraftId.value = draft.id
  const convertedFileList = (draft.fileList || []).map(f => ({
    name: f.name,
    uid: f.uid || Date.now(),
    status: f.status || 'ready',
    raw: undefined
  }))
  editingDraftData.value = {
    type: draft.type,
    title: draft.title,
    content: draft.content,
    chargeUsers: draft.chargeUsers,
    fileList: convertedFileList,
    status: 'draft'
  }
  showDraftDrawer.value = false
  showCreateDrawer.value = true
}

// 保存草稿
const handleSaveDraft = (formData: CreateApprovalForm) => {
  const now = new Date()
  const draftId = editingDraftId.value || generateApprovalId()
  const existingIndex = draftList.value.findIndex(d => d.id === draftId)
  const draft: DraftItem = {
    id: draftId,
    type: formData.type,
    title: formData.title,
    content: formData.content,
    chargeUsers: formData.chargeUsers,
    fileList: formData.fileList.map(f => ({ name: f.name, uid: f.uid, status: f.status })),
    saveTime: formatDateTime(now).full
  }
  if (existingIndex >= 0) draftList.value[existingIndex] = draft
  else draftList.value.unshift(draft)
  ElMessage.success('草稿已保存')
  showCreateDrawer.value = false
  resetCreateDrawer()
}

// 模拟审批列表数据
const getMockApprovalList = (): ApprovalItem[] => {
  const now = new Date()
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
  const fourDaysAgo = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000)
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
      processList: [
        { time: formatDateTime(yesterday).full, status: ApprovalStatusEnum.IN_PROGRESS, user: '张建国', comment: '申请春耕农资补贴', type: ApprovalActionMap.submit.tagType },
        { time: formatDateTime(new Date(yesterday.getTime() + 1 * 60 * 60 * 1000)).full, status: ApprovalStatusEnum.IN_PROGRESS, user: '李主任', comment: '正在核实', type: ApprovalActionMap.submit.tagType }
      ],
      recordList: [],
      files: [{ name: '春耕补贴申请_AI生成版.docx' }]
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
      processList: [{ time: formatDateTime(twoDaysAgo).full, status: ApprovalStatusEnum.IN_PROGRESS, user: '陈丽', comment: '申请上门办理养老认证', type: ApprovalActionMap.submit.tagType }],
      recordList: [],
      files: [{ name: '老人名单.xlsx' }]
    },
    {
      id: 'MQ20260221003',
      title: '王家坳矛盾纠纷处置',
      department: '王家坳网格',
      status: ApprovalStatusEnum.IN_PROGRESS,
      createTime: formatDateTime(threeDaysAgo).full,
      type: ApprovalTypeEnum.SOCIAL_SECURITY,
      author: '刘敏',
      docNo: '王网〔2026〕12号',
      mainSend: '镇综治办',
      ccList: [],
      chargeUsers: ['何芸'],
      processList: [{ time: formatDateTime(threeDaysAgo).full, status: ApprovalStatusEnum.IN_PROGRESS, user: '刘敏', comment: '矛盾纠纷上报', type: ApprovalActionMap.submit.tagType }],
      recordList: [],
      files: []
    },
    {
      id: 'MQ20260220004',
      title: '村民饮水困难诉求处理',
      department: '李家村村委会',
      status: ApprovalStatusEnum.IN_PROGRESS,
      createTime: formatDateTime(fourDaysAgo).full,
      type: ApprovalTypeEnum.PEOPLE_AFFAIRS,
      author: '张建国',
      docNo: '李村发〔2026〕09号',
      mainSend: '镇政府',
      ccList: [],
      chargeUsers: ['王副镇长'],
      processList: [{ time: formatDateTime(fourDaysAgo).full, status: ApprovalStatusEnum.IN_PROGRESS, user: '张建国', comment: '村民饮水困难', type: ApprovalActionMap.submit.tagType }],
      recordList: [],
      files: []
    }
  ]
}

const approvalList = ref<ApprovalItem[]>(getMockApprovalList())
const activeTab = ref(ApprovalTabEnum.ALL)
const searchKeyword = ref('')
const selectedApproval = ref<ApprovalItem | null>(null)
const showCreateDrawer = ref(false)
const detailRef = ref()

// 筛选当前用户负责的事项
const filteredList = computed(() => approvalList.value.filter(item => item.chargeUsers.includes(currentUser)))

// 默认选中第一个
watch(filteredList, (val) => {
  if (val.length && !selectedApproval.value) selectedApproval.value = val[0]
}, { immediate: true })

const handleSelect = (item: ApprovalItem) => {
  selectedApproval.value = item
  if (detailRef.value?.$el) detailRef.value.$el.scrollTop = 0
}

// 创建新审批
const handleCreateApproval = (formData: CreateApprovalForm & { files?: any[] }) => {
  const now = new Date()
  const newItem: ApprovalItem = {
    id: generateApprovalId(),
    title: formData.title,
    department: '本级部门',
    status: ApprovalStatusEnum.IN_PROGRESS,
    createTime: formatTime(now),
    type: formData.type,
    author: currentUser,
    docNo: generateDocNo(formData.type),
    mainSend: '',
    ccList: [],
    chargeUsers: formData.chargeUsers,
    processList: [{
      time: formatTime(now),
      status: ApprovalActionMap.submit.status,
      user: currentUser,
      comment: formData.content,
      type: ApprovalActionMap.submit.tagType
    }],
    recordList: [],
    files: formData.files || []
  }
  if (editingDraftId.value) deleteDraft(editingDraftId.value)
  approvalList.value.unshift(newItem)
  ElMessage.success(MESSAGE.SUBMIT_SUCCESS)
  showCreateDrawer.value = false
  resetCreateDrawer()
}

// 处理审批
const handleApproval = (data: { id: string; result: ApprovalActionEnum; comment: string }) => {
  const { id, result, comment } = data
  if (!comment.trim()) {
    ElMessage.warning(COMMON_TEXT.APPROVAL_REQUIRE_COMMENT)
    return
  }
  const targetIndex = approvalList.value.findIndex(item => item.id === id)
  if (targetIndex === -1) {
    ElMessage.error(COMMON_TEXT.APPROVAL_NOT_FOUND)
    return
  }

  const targetItem = approvalList.value[targetIndex]!
  const actionConfig = ApprovalActionMap[result]!

  const processItem: ApprovalProcess = {
    time: formatTime(),
    status: actionConfig.status,
    user: currentUser,
    comment,
    type: actionConfig.tagType
  }

  targetItem.processList.push(processItem)
  targetItem.status = actionConfig.status

  if (selectedApproval.value?.id === id) {
    selectedApproval.value = { ...selectedApproval.value, processList: targetItem.processList, status: targetItem.status }
  }
  ElMessage.success(MESSAGE.OPER_SUCCESS)
}
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