<template>
  <div class="approval-sidebar">
    <div class="sidebar-header">
      <div class="header-top">
        <h3 class="sidebar-title">事项分类</h3>
        <div class="category-selector" ref="selectorRef" @click.stop="toggleSelector">
          <div class="selector-trigger">
            <span class="selected-label">{{ getSelectedTabLabel() }}</span>
            <el-icon class="selector-icon">
              <ArrowDown :rotate="selectorOpen ? 180 : 0" />
            </el-icon>
          </div>
          
          <div v-show="selectorOpen" class="selector-dropdown">
            <div 
              v-for="t in tabs" 
              :key="t.key" 
              class="dropdown-item"
              :class="{ active: props.activeTab === t.key }"
              @click="handleTabChange(t.key)"
            >
              {{ t.label }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-input 
        v-model="localSearch" 
        placeholder="搜索事项标题/经办部门" 
        clearable
        @input="handleSearch"
        size="small"
        class="search-input"
      >
        <template #prefix>
          <el-icon class="search-icon"><Search /></el-icon>
        </template>
      </el-input>
    </div>

    <!-- 事项列表 -->
    <div class="list-box">
      <div v-if="filteredList.length === 0" class="empty-state">
        <el-empty 
          description="暂无匹配的事项" 
          :image-size="100" 
          class="empty-content"
        />
      </div>
      
      <div v-else class="card-list">
        <div 
          v-for="item in filteredList" 
          :key="item.id" 
          class="item-card"
          :class="{ active: selectedId === item.id }" 
          @click="select(item)"
        >
          <div class="card-header">
            <span class="item-type" :class="`type-${formatTypeClass(item.type)}`">
              {{ item.type }}
            </span>
            <span class="item-status" :class="`status-${item.status}`">
              {{ formatStatusText(item.status) }}
            </span>
          </div>
          <h4 class="item-title">{{ item.title || '无标题' }}</h4>
          <div class="item-footer">
            <span class="item-dept">{{ item.department || '未知部门' }}</span>
            <span class="item-time">{{ formatTime(item.createTime) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue' 
import { ElEmpty } from 'element-plus'
import { Search, ArrowDown } from '@element-plus/icons-vue'

const props = defineProps(['list', 'activeTab', 'searchKeyword'])
const emit = defineEmits(['update:active-tab', 'update:search-keyword', 'select'])

// 分类列表
const tabs = ref([
  { key: 'all', label: '全部事项' },
  { key: '民情事项', label: '民情事项' },
  { key: '农业农村', label: '农业农村' },
  { key: '民政服务', label: '民政服务' },
  { key: '综治平安', label: '综治平安' },
])

const selectorOpen = ref(false)
const localSearch = ref(props.searchKeyword || '')
const selectedId = ref('')
const selectorRef = ref(null)

const toggleSelector = () => {
  selectorOpen.value = !selectorOpen.value
}

const handleClickOutside = (e) => {
  if (selectorRef.value && !selectorRef.value.contains(e.target)) {
    selectorOpen.value = false
  }
}
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const getSelectedTabLabel = () => {
  const activeTabItem = tabs.value.find(t => t.key === props.activeTab)
  return activeTabItem ? activeTabItem.label : '全部事项'
}

const handleTabChange = (key) => {
  emit('update:active-tab', key)
  selectorOpen.value = false 
}

const filteredList = computed(() => {
  if (!Array.isArray(props.list)) return []
  
  let result = [...props.list].filter(item => item && item.id)
  
  if (props.activeTab !== 'all') {
    result = result.filter(item => item.type === props.activeTab)
  }
  
  if (localSearch.value) {
    const keyword = localSearch.value.trim().toLowerCase()
    result = result.filter(item => {
      const title = (item.title || '').toLowerCase()
      const department = (item.department || '').toLowerCase()
      return title.includes(keyword) || department.includes(keyword)
    })
  }
  
  return result
})

const formatStatusText = (status) => {
  const statusMap = {
    in_progress: '办理中',
    passed: '已办结',
    rejected: '已驳回',
    default: '未知状态'
  }
  return statusMap[status] || statusMap.default
}

const formatTypeClass = (type) => {
  return type.replace(/[^a-zA-Z0-9]/g, '_')
}

const formatTime = (time) => {
  if (!time) return '无创建时间'
  return time.length > 10 ? time.slice(0, 10) : time
}

const debounce = (fn, delay = 300) => {
  let timer = null
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}

const handleSearch = debounce(() => {
  emit('update:search-keyword', localSearch.value)
})

watch(() => props.searchKeyword, (newVal) => {
  localSearch.value = newVal || ''
}, { immediate: true })

const select = (item) => {
  if (!item) return
  selectedId.value = item.id
  emit('select', item)
}
</script>

<style scoped lang="less">

.approval-sidebar {
  width: 380px;
  background: var(--white);
  border-right: 1px solid var(--gray-200);
  height: 100vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 0 16px rgba(0, 0, 0, 0.04);
  overflow: hidden;

  .sidebar-header {
    padding: 28px 24px 20px;
    border-bottom: 1px solid var(--gray-100);

    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .sidebar-title {
      font-size: 19px;
      font-weight: 600;
      color: var(--gray-900);
      margin: 0;
      display: flex;
      align-items: center;
      gap: 8px;
      
      &::before {
        content: '';
        width: 4px;
        height: 20px;
        background: var(--blue-500);
        border-radius: 2px;
      }
    }

    .category-selector {
      position: relative;
      width: 140px;
      cursor: pointer;

      .selector-trigger {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 6px 12px;
        background: var(--gray-50);
        border: 1px solid var(--gray-200);
        border-radius: 8px;
        font-size: 14px;
        color: var(--gray-800);
        transition: all 0.2s ease;

        &:hover {
          border-color: var(--blue-300);
          background: var(--blue-50);
        }

        .selector-icon {
          font-size: 12px;
          color: var(--gray-500);
          transition: transform 0.2s ease;
        }
      }

      .selector-dropdown {
        position: absolute;
        top: calc(100% + 6px);
        left: 0;
        width: 100%;
        background: var(--white);
        border: 1px solid var(--gray-200);
        border-radius: 8px;
        box-shadow: var(--shadow-md);
        z-index: 999;
        overflow: hidden;

        .dropdown-item {
          padding: 8px 12px;
          font-size: 14px;
          color: var(--gray-700);
          transition: all 0.15s ease;

          &:hover {
            background: var(--blue-50);
            color: var(--blue-600);
          }

          &.active {
            background: var(--blue-500);
            color: var(--white);
          }
        }
      }
    }
  }

  .search-bar {
    padding: 16px 24px;
    border-bottom: 1px solid var(--gray-100);
    
    .search-input {
      --el-input-border-radius: 8px;
      --el-input-hover-border-color: var(--blue-500);
      
      :deep(.el-input__wrapper) {
        border: 1px solid var(--gray-200);
        box-shadow: var(--shadow-sm);
        transition: all 0.2s ease;
        
        &:hover {
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }
        
        &.is-focus {
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
        }
      }
      
      .search-icon {
        color: var(--gray-500);
        font-size: 15px;
      }
    }
  }

  .list-box {
    flex: 1;
    overflow-y: auto;
    padding: 16px 20px;
    background-color: var(--gray-50);
    
    .empty-state {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      padding: 40px 0;
      
      .empty-content {
        :deep(.el-empty__description) {
          color: var(--gray-500);
          font-size: 14px;
          margin-top: 12px;
        }
      }
    }
    
    .card-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .item-card {
      padding: 20px;
      background: var(--white);
      border: 1px solid var(--gray-200);
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.25s ease;
      position: relative;
      overflow: hidden;
      
      &.active {
        border-color: var(--blue-500);
        background: linear-gradient(135deg, var(--blue-50) 0%, var(--white) 100%);
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
        
        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          width: 4px;
          background: var(--blue-500);
        }
      }
      
      &:hover:not(.active) {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
        border-color: var(--gray-300);
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        .item-type {
          font-size: 12px;
          padding: 3px 10px;
          border-radius: 12px;
          font-weight: 500;
          
          &.type_民情事项 {
            color: var(--purple-500);
            background: var(--purple-50);
            border: 1px solid var(--purple-500/15);
          }
          
          &.type_农业农村 {
            color: var(--green-500);
            background: var(--green-50);
            border: 1px solid var(--green-500/15);
          }
          
          &.type_民政服务 {
            color: var(--mint-500);
            background: var(--mint-50);
            border: 1px solid var(--mint-500/15);
          }
          
          &.type_综治平安 {
            color: var(--red-500);
            background: var(--red-50);
            border: 1px solid var(--red-500/15);
          }
        }

        .item-status {
          font-size: 12px;
          padding: 3px 10px;
          border-radius: 12px;
          font-weight: 400;
          
          &.status-in_progress {
            color: var(--blue-500);
            background: var(--blue-50);
          }
          
          &.status-passed {
            color: var(--green-500);
            background: var(--green-50);
          }
          
          &.status-rejected {
            color: var(--red-500);
            background: var(--red-50);
          }
        }
      }

      .item-title {
        font-size: 15px;
        font-weight: 600;
        color: var(--gray-900);
        margin-bottom: 12px;
        line-height: 1.4;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .item-footer {
        display: flex;
        justify-content: space-between;
        font-size: 13px;
        color: var(--gray-500);
        padding-top: 8px;
        border-top: 1px solid var(--gray-100);
        
        .item-dept {
          max-width: 180px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }
  }
  
  & ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  
  & ::-webkit-scrollbar-track {
    background: var(--gray-100);
    border-radius: 3px;
  }
  
  & ::-webkit-scrollbar-thumb {
    background: var(--gray-300);
    border-radius: 3px;
    
    &:hover {
      background: var(--gray-400);
    }
  }
}
</style>