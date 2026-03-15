<template>
  <div class="approval-page">
    <ApprovalSidebar
      :list="filteredList"
      :active-tab="activeTab"
      :search-keyword="searchKeyword"
      :selected="selectedApproval"
      @update:active-tab="activeTab = $event"
      @update:search-keyword="searchKeyword = $event"
      @select="handleSelect"
      
    />

    <ApprovalDetail 
      ref="detailRef" 
      v-if="selectedApproval" 
      :approval="selectedApproval" 
      @approve="handleApproval"
    />
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
import { ref, watch, computed, ComputedRef } from 'vue'
import { ElMessage } from 'element-plus'
import ApprovalSidebar from './components/ApprovalSidebar.vue'
import ApprovalDetail from './components/ApprovalDetail.vue'
import ApprovalInfo from './components/ApprovalInfo.vue'
import CreateApproval from './components/CreateApproval.vue'
import type { ApprovalItem, ApprovalProcess } from './utils/types'
// 模拟当前登录用户
const currentUser = ref('李主任')

// 从本地存储读取数据（实现持久化），无数据则用初始数据
const getApprovalList = (): ApprovalItem[] => {
  const stored = localStorage.getItem('approvalList')
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch (e) {
      console.error('解析本地存储数据失败', e)
    }
  }
  
  // 初始数据
  return [
    {
      id: 'MQ20260223001',
      title: '李家村春耕农资补贴申请',
      department: '李家村村委会',
      status: 'in_progress',
      createTime: '2026-02-23 09:15',
      type: '农业农村',
      author: '张建国',
      docNo: '李村发〔2026〕08号',
      mainSend: '镇农业农村办公室',
      ccList: ['镇分管领导'],
      chargeUsers: ['李主任'],
      processList: [
        { time: '2026-02-23 09:15', status: '发起上报', user: '张建国', comment: '申请春耕农资补贴', type: 'primary' },
        { time: '2026-02-23 10:30', status: '办理中', user: '李主任', comment: '正在核实', type: 'warning' },
      ],
      recordList: [],
      files: [{ name: '春耕补贴申请_AI生成版.docx' }]
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
  ]
}

// 初始化审批列表（持久化）
const approvalList = ref<ApprovalItem[]>(getApprovalList())

// 保存到本地存储（监听数据变化）
watch(approvalList, (newVal) => {
  localStorage.setItem('approvalList', JSON.stringify(newVal))
}, { deep: true })

// 标签页/搜索/选中项/抽屉状态
const activeTab = ref('all')
const searchKeyword = ref('')
const selectedApproval = ref<ApprovalItem | null>(null)
const showCreateDrawer = ref(false)
const detailRef = ref()

// 筛选当前用户负责的事件
const filteredList = computed(() => {
  return approvalList.value.filter(item => 
    item.chargeUsers.includes(currentUser.value)
  )
}) as ComputedRef<ApprovalItem[]>

// 监听筛选列表，默认选中第一个
watch(filteredList, (val) => {
  if (val.length && !selectedApproval.value) {
    selectedApproval.value = val[0] as ApprovalItem
  }
}, { immediate: true })

// 选择事项
const handleSelect = (item: ApprovalItem) => {
  selectedApproval.value = item
  if (detailRef.value?.$el) detailRef.value.$el.scrollTop = 0
}

// 创建事项（优化：持久化 + 字段完善）
const handleCreateApproval = (formData: any) => {
  // 生成唯一ID
  const generateId = () => {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `MQ${year}${month}${day}${random}`
  }

  // 格式化时间
  const formatTime = () => {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}`
  }

  const newItem: ApprovalItem = {
    id: generateId(),
    title: formData.title,
    department: '本级部门',
    status: 'in_progress',
    createTime: formatTime(),
    type: formData.type,
    author: currentUser.value, // 发起人改为当前登录用户
    docNo: `${formData.type.substring(0, 2)}〔${new Date().getFullYear()}〕${Math.floor(Math.random() * 100).toString().padStart(2, '0')}号`,
    mainSend: '',
    ccList: [],
    chargeUsers: formData.chargeUsers || [],
    processList: [{ 
      time: formatTime(), 
      status: '发起上报', 
      user: currentUser.value, 
      comment: formData.content, 
      type: 'primary' 
    }],
    recordList: [],
    files: formData.files.map((f: any) => ({
      name: f.name,
      raw: f.raw // 必须保留 raw 对象，否则刷新后无法预览
    })) || []
  
  }

  // 添加到列表（持久化自动触发）
  approvalList.value.unshift(newItem)
  
  ElMessage.success('事项已上报！')
  showCreateDrawer.value = false
  
  // 自动选中新建的事项
  selectedApproval.value = newItem
}

// 处理审批（同意/驳回）
const handleApproval = (data: { id: string, result: 'agree' | 'reject', comment: string }) => {
  const { id, result, comment } = data
  
  if (!comment.trim()) {
    ElMessage.warning('请填写审批理由！')
    return
  }

  const targetIndex = approvalList.value.findIndex(item => item.id === id)
  if (targetIndex === -1) {
    ElMessage.error('未找到该事项！')
    return
  }

  const currentTime = formatTime()
  
  // 严格按照 ApprovalProcess 类型创建 processItem
  const processItem: ApprovalProcess = {
    time: currentTime,
    status: result === 'agree' ? '已同意' : '已驳回',
    user: currentUser.value,
    comment: comment,
    type: result === 'agree' ? 'success' : 'danger'
  }

  // 更新事项状态和审批流程（类型已匹配，无报错）
  approvalList.value[targetIndex].processList.push(processItem)
  approvalList.value[targetIndex].status = result === 'agree' ? 'passed' : 'rejected'

  // 更新选中项的状态（实时刷新视图）
  if (selectedApproval.value?.id === id) {
    selectedApproval.value = {
      ...selectedApproval.value,
      processList: [...approvalList.value[targetIndex].processList],
      status: approvalList.value[targetIndex].status
    } as ApprovalItem
  }

  ElMessage.success(`已${result === 'agree' ? '同意' : '驳回'}该事项！`)
}

// 工具函数：格式化时间
const formatTime = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
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