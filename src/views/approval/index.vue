<template>
  <div class="approval-page">
    <ApprovalSidebar 
      :list="approvalList" 
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
import { ref, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import ApprovalSidebar from './components/ApprovalSidebar.vue'
import ApprovalDetail from './components/ApprovalDetail.vue'
import ApprovalInfo from './components/ApprovalInfo.vue'
import CreateApproval from './components/CreateApproval.vue'
import { approvalApi, ApprovalStatus } from '@/api/approval/approval'
import { useUserStore } from '@/store/modules/user'
import type { ApprovalItem, CreateApprovalForm, DraftItem } from './utils/types'
import {
  ApprovalTabEnum,
  ApprovalActionEnum,
  generateApprovalId,
  formatDateTime,
} from './utils/types'

const userStore = useUserStore()
const currentUserId = userStore.userInfo?.id || 0

// 审批列表
const approvalList = ref<ApprovalItem[]>([])
const activeTab = ref(ApprovalTabEnum.ALL)
const searchKeyword = ref('')
const selectedApproval = ref<ApprovalItem | null>(null)
const loading = ref(false)

// 转换后端数据到前端视图模型
const transformData = (backendData: any[]): ApprovalItem[] => {
  return backendData.map(item => {
    // 强制解析并规范化 files 列表
    let fileList: any[] = [];
    try {
      const rawFiles = typeof item.files === 'string' ? JSON.parse(item.files) : item.files;
      if (Array.isArray(rawFiles)) {
        fileList = rawFiles.map(f => {
          // 如果是字符串，直接作为 URL（相对路径通过 Vite 代理访问）
          if (typeof f === 'string') {
            const url = f.startsWith('http://') || f.startsWith('https://') ? f : f;
            return { name: f.split('/').pop(), url };
          }
          // 如果是对象
          if (f && typeof f === 'object') {
            if (f.url) return { name: f.name || f.url.split('/').pop(), url: f.url };
            if (f.name) return { name: f.name, url: f.name };
          }
          return null;
        }).filter(Boolean);
      }
    } catch (e) {
      console.error('Files parse error:', e);
    }

    return {
      id: item.businessId,
      dbId: item.id,
      title: item.title,
      content: item.content,
      department: item.department || '未知部门',
      status: item.status,
      createTime: formatDateTime(new Date(item.createdAt)).full,
      type: item.type,
      author: item.author?.username || '未知',
      docNo: item.docNo,
      mainSend: '',
      ccList: [],
      chargeUsers: ['领导'], // 模拟显示
      processList: (item.records || []).map((rec: any) => ({
        time: formatDateTime(new Date(rec.createdAt)).full,
        status: rec.action === 'agree' ? 'passed' : (rec.action === 'reject' ? 'rejected' : 'in_progress'),
        user: rec.user?.username || '系统',
        comment: rec.opinion || '',
        type: rec.action === 'agree' ? 'success' : (rec.action === 'reject' ? 'danger' : 'primary')
      })),
      recordList: [],
      files: fileList
    };
  });
}

const fetchList = async () => {
  loading.value = true
  try {
    const res = await approvalApi.getList({ 
      userId: currentUserId,
      status: activeTab.value,
      keyword: searchKeyword.value
    })
    const newList = transformData(res)
    approvalList.value = newList
    
    // 如果有选中的事项，同步更新选中的数据内容
    if (selectedApproval.value) {
      const updated = newList.find(item => item.dbId === selectedApproval.value?.dbId)
      if (updated) {
        selectedApproval.value = updated
      }
    } else if (newList.length > 0) {
      selectedApproval.value = newList[0]
    }
  } finally {
    loading.value = false
  }
}

watch([activeTab, searchKeyword], () => {
  fetchList()
})

const handleSelect = (item: ApprovalItem) => {
  selectedApproval.value = item
}

// 发起审批
const handleCreateApproval = async (formData: CreateApprovalForm) => {
  try {
    // 获取文件 URL 列表
    const fileUrls = (formData.files || []).map((f: any) => f.url || f.name)
    
    await approvalApi.create({
      title: formData.title,
      content: formData.content,
      type: formData.type,
      authorId: currentUserId,
      chargeUserIds: [1], // 模拟
      status: ApprovalStatus.IN_PROGRESS,
      files: fileUrls
    })
    
    // 如果是从草稿提交，则从草稿箱中移除
    if (editingDraftId.value) {
      draftList.value = draftList.value.filter(d => d.id !== editingDraftId.value)
      saveDraftsToLocal()
      resetCreateDrawer()
    }
    
    ElMessage.success('发起审批成功')
    showCreateDrawer.value = false
    fetchList()
  } catch (error) {
    ElMessage.error('发起失败')
  }
}

// 审批处理
const handleApproval = async ({ result, comment }: { result: string, comment: string }) => {
  if (!selectedApproval.value?.dbId) return
  try {
    await approvalApi.updateStatus({
      approvalId: selectedApproval.value.dbId,
      userId: currentUserId,
      action: result, // result 是 'agree' 或 'reject'
      opinion: comment
    })
    ElMessage.success('审批处理成功')
    fetchList()
  } catch (error) {
    ElMessage.error('处理失败')
  }
}

// 草稿相关逻辑
const showDraftDrawer = ref(false)
const draftList = ref<DraftItem[]>([])
const editingDraftId = ref<string | null>(null)
const editingDraftData = ref<CreateApprovalForm | null>(null)
const showCreateDrawer = ref(false)

// 从本地加载草稿
const loadDraftsFromLocal = () => {
  const saved = localStorage.getItem('approval_drafts')
  if (saved) {
    try {
      draftList.value = JSON.parse(saved)
    } catch (e) {
      console.error('加载草稿失败', e)
    }
  }
}

// 保存草稿到本地
const saveDraftsToLocal = () => {
  localStorage.setItem('approval_drafts', JSON.stringify(draftList.value))
}

const openCreateDrawer = () => {
  editingDraftId.value = null
  editingDraftData.value = null
  showCreateDrawer.value = true
}

const resetCreateDrawer = () => {
  editingDraftId.value = null
  editingDraftData.value = null
}

const handleSaveDraft = (formData: CreateApprovalForm) => {
  const now = new Date()
  const draftId = editingDraftId.value || generateApprovalId()
  const existingIndex = draftList.value.findIndex(d => d.id === draftId)
  
  // 处理附件：如果是图片，则尝试保存 base64 以便预览
  const processFiles = async () => {
    const fileListWithData = await Promise.all(formData.fileList.map(async (f) => {
      const isImage = f.raw?.type.startsWith('image/')
      let dataUrl = ''
      if (isImage && f.raw) {
        dataUrl = await new Promise((resolve) => {
          const reader = new FileReader()
          reader.onload = (e) => resolve(e.target?.result as string)
          reader.readAsDataURL(f.raw!)
        })
      }
      return { 
        name: f.name, 
        uid: f.uid, 
        status: f.status,
        size: f.size,
        type: f.raw?.type || '',
        dataUrl: dataUrl // 存储图片的 base64
      }
    }))

    const draft: DraftItem = {
      id: draftId,
      type: formData.type,
      title: formData.title,
      content: formData.content,
      chargeUsers: formData.chargeUsers,
      fileList: fileListWithData as any,
      saveTime: formatDateTime(now).full
    }

    if (existingIndex >= 0) {
      draftList.value[existingIndex] = draft
    } else {
      draftList.value.unshift(draft)
    }
    
    saveDraftsToLocal()
    ElMessage.success('草稿已保存')
    showCreateDrawer.value = false
    resetCreateDrawer()
  }

  processFiles()
}

const editDraft = (draft: DraftItem) => {
  editingDraftId.value = draft.id
  editingDraftData.value = {
    type: draft.type,
    title: draft.title,
    content: draft.content,
    chargeUsers: draft.chargeUsers,
    fileList: (draft.fileList || []).map((f: any) => {
      // 如果有 dataUrl，将其转换回 Blob/File 对象
      let rawFile: File | null = null
      if (f.dataUrl) {
        const arr = f.dataUrl.split(',')
        const mime = arr[0].match(/:(.*?);/)[1]
        const bstr = atob(arr[1])
        let n = bstr.length
        const u8arr = new Uint8Array(n)
        while(n--) {
          u8arr[n] = bstr.charCodeAt(n)
        }
        rawFile = new File([u8arr], f.name, { type: mime })
      } else {
        rawFile = new File([], f.name, { type: f.type })
      }

      return {
        ...f,
        raw: rawFile
      }
    }) as any,
    status: 'draft'
  }
  showDraftDrawer.value = false
  showCreateDrawer.value = true
}

const deleteDraft = (id: string) => {
  ElMessageBox.confirm('确定删除该草稿吗？', '提示', { type: 'warning' }).then(() => {
    draftList.value = draftList.value.filter(d => d.id !== id)
    saveDraftsToLocal()
    ElMessage.success('草稿已删除')
  })
}

onMounted(() => {
  fetchList()
  loadDraftsFromLocal()
})
</script>

<style scoped lang="scss">
.approval-page {
  display: flex;
  height: calc(100vh - 60px);
  background: var(--white);
  position: relative;
}

.create-btn-wrapper {
  position: absolute;
  right: 40px;
  bottom: 40px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 100;

  .el-button {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    height: 44px;
    padding: 0 24px;
    border-radius: 22px;
  }
}
</style>
