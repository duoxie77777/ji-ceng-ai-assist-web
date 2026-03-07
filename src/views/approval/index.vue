<template>
  <div class="approval-page">
    <ApprovalSidebar
      :list="filteredList"
      :active-tab="activeTab"
      :search-keyword="searchKeyword"
      @update:active-tab="activeTab = $event"
      @update:search-keyword="searchKeyword = $event"
      @select="handleSelect"
    />

    <ApprovalDetail ref="detailRef" v-if="selectedApproval" :approval="selectedApproval" />
    <ApprovalInfo v-if="selectedApproval" :approval="selectedApproval" />

    <el-drawer v-model="showCreateDrawer" title="发起事项" size="80%" direction="rtl" :close-on-click-modal="false">
      <CreateApproval @submit="handleCreateApproval" @cancel="showCreateDrawer = false" />
    </el-drawer>

    <div class="create-btn-wrapper">
      <el-button type="primary" @click="showCreateDrawer = true">发起事项</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import ApprovalSidebar from './components/ApprovalSidebar.vue'
import ApprovalDetail from './components/ApprovalDetail.vue'
import ApprovalInfo from './components/ApprovalInfo.vue'
import CreateApproval from './components/CreateApproval.vue'
import type { ApprovalItem } from './utils/types'

// 模拟当前登录用户（谁登录，就只能看到自己负责的事件）
const currentUser = ref('李主任')
// const currentUser = ref('张主任')
// const currentUser = ref('何芸')
// const currentUser = ref('张建国')

const approvalList = ref<ApprovalItem[]>([
  {
    id: 'MQ20260223001',
    title: '李家村春耕农资补贴申请',
    department: '李家村村委会',
    status: 'in_progress',
    createTime: '2026-02-23 09:15',
    type: '农业农村', // 事件类型
    author: '张建国',
    docNo: '李村发〔2026〕08号',
    mainSend: '镇农业农村办公室',
    ccList: ['镇分管领导'],
    chargeUsers: ['李主任'], // 负责这件事的人
    processList: [
      { time: '2026-02-23 09:15', status: '发起上报', user: '张建国', comment: '申请春耕农资补贴', type: 'primary' },
      { time: '2026-02-23 10:30', status: '办理中', user: '李主任', comment: '正在核实', type: 'warning' },
    ],
    recordList: [],
    files: [
      { name: '春耕补贴申请_AI生成版.docx' },
    ]
  },
  {
    id: 'MQ20260222002',
    title: '养老资格认证上门服务预约',
    department: '镇便民服务中心',
    status: 'in_progress',
    createTime: '2026-02-22 14:20',
    type: '民政服务',
    author: '陈丽',
    docNo: '便服〔2026〕03号',
    mainSend: '镇民政办',
    ccList: [],
    chargeUsers: ['张主任'],
    processList: [
      { time: '2026-02-22 14:20', status: '发起上报', user: '陈丽', comment: '申请上门办理养老认证', type: 'primary' },
    ],
    recordList: [],
    files: [{ name: '老人名单.xlsx' }]
  },
  {
    id: 'MQ20260221003',
    title: '王家坳矛盾纠纷处置',
    department: '王家坳网格',
    status: 'in_progress',
    createTime: '2026-02-21 11:05',
    type: '综治平安',
    author: '刘敏',
    docNo: '王网〔2026〕12号',
    mainSend: '镇综治办',
    ccList: [],
    chargeUsers: ['何芸'],
    processList: [
      { time: '2026-02-21 11:05', status: '发起上报', user: '刘敏', comment: '矛盾纠纷上报', type: 'primary' },
    ],
    recordList: [],
    files: []
  },
  {
    id: 'MQ20260220004',
    title: '村民饮水困难诉求处理',
    department: '李家村村委会',
    status: 'in_progress',
    createTime: '2026-02-20 16:30',
    type: '民情事项',
    author: '张建国',
    docNo: '李村发〔2026〕09号',
    mainSend: '镇政府',
    ccList: [],
    chargeUsers: ['王副镇长'],
    processList: [
      { time: '2026-02-20 16:30', status: '发起上报', user: '张建国', comment: '村民饮水困难', type: 'primary' },
    ],
    recordList: [],
    files: []
  }
])

// 标签页按【事件类型】分类
const activeTab = ref('all')
const searchKeyword = ref('')
const selectedApproval = ref<ApprovalItem | null>(null)
const showCreateDrawer = ref(false)
const detailRef = ref()


// 核心：只显示当前用户【负责的事件】
const filteredList = computed(() => {
  return approvalList.value.filter(item => 
    item.chargeUsers.includes(currentUser.value)
  )
})

// 监听筛选后的列表，传递给子组件
watch(filteredList, (val) => {
  if (val.length && !selectedApproval.value) {
    selectedApproval.value = val[0]
  }
}, { immediate: true })

const handleSelect = (item: ApprovalItem) => {
  selectedApproval.value = item
  if (detailRef.value?.$el) detailRef.value.$el.scrollTop = 0
}

const handleCreateApproval = (formData: any) => {
  const newItem: ApprovalItem = {
    id: 'MQ' + Date.now(),
    title: formData.title,
    department: '本级部门',
    status: 'in_progress',
    createTime: new Date().toLocaleString(),
    type: formData.type,
    author: '当前用户',
    docNo: '自定义文号',
    mainSend: '',
    ccList: [],
    chargeUsers: formData.chargeUsers || [],
    processList: [{ time: new Date().toLocaleString(), status: '发起上报', user: '我', comment: formData.content, type: 'primary' }],
    recordList: [],
    files: formData.fileList || []
  }
  approvalList.value.unshift(newItem)
  ElMessage.success('事项已上报！')
  showCreateDrawer.value = false
}
</script>

<style scoped lang="less">

.approval-page {
  display: flex;
  height: 100%;
  background: #fff;
  position: relative;
}
.create-btn-wrapper {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 10;
}
</style>