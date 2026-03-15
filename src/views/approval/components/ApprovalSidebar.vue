<template>
  <div class="approval-sidebar">
    <!-- 顶部搜索 -->
    <div class="search-box">
      <el-input :model-value="searchKeyword" @input="$emit('update:searchKeyword', $event)" placeholder="搜索事项名称/文号"
        clearable>
        <template #prefix>
          <svg-icon name="sousuo" size="28" />
        </template>
      </el-input>
    </div>

    <!-- 分类标签 -->
    <div class="tab-list">
      <div class="tab-item" :class="{ active: activeTab === 'all' }" @click="handleTab('all')">
        全部事项
      </div>
      <div class="tab-item" :class="{ active: activeTab === 'in_progress' }" @click="handleTab('in_progress')">
        办理中
      </div>
      <div class="tab-item" :class="{ active: activeTab === 'processed' }" @click="handleTab('processed')">
        已办理
      </div>
    </div>

    <!-- 列表 -->
    <div class="list-container">
      <div v-for="item in filteredList" :key="item.id" class="list-item" :class="{ active: selected?.id === item.id }"
        @click="handleSelect(item)">
        <div class="item-title">{{ item.title }}</div>
        <div class="item-info">
          <el-tag size="small" type="primary">{{ item.type }}</el-tag>
          <span class="time">{{ item.createTime }}</span>
        </div>
        <div class="item-status">
          <el-tag size="small" :type="item.status === 'in_progress'
            ? 'warning'
            : item.status === 'passed'
              ? 'success'
              : 'danger'
            ">
            {{
              item.status === 'in_progress'
                ? '办理中'
                : item.status === 'passed'
                  ? '已同意'
                  : '已驳回'
            }}
          </el-tag>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  list: {
    type: Array,
    default: () => [],
  },
  activeTab: {
    type: String,
    default: 'all',
  },
  searchKeyword: {
    type: String,
    default: '',
  },
  selected: {
    type: Object,
    default: null
  }
})

const emit = defineEmits([
  'update:activeTab',
  'update:searchKeyword',
  'select',
])

const handleTab = (tab) => {
  emit('update:activeTab', tab)
}

const handleSearch = (val) => {
  emit('update:searchKeyword', val)
}

const handleSelect = (item) => {
  emit('select', item)
}

const filteredList = computed(() => {
  let list = props.list || []

  if (props.activeTab === 'in_progress') {
    list = list.filter((item) => item.status === 'in_progress')
  } else if (props.activeTab === 'processed') {
    list = list.filter(
      (item) => item.status === 'passed' || item.status === 'rejected'
    )
  }

  if (props.searchKeyword) {
    const keyword = props.searchKeyword.toLowerCase()
    list = list.filter(
      (item) =>
        item.title.toLowerCase().includes(keyword) ||
        (item.docNo && item.docNo.toLowerCase().includes(keyword))
    )
  }

  return list
})
</script>

<style scoped>
.approval-sidebar {
  width: 360px;
  height: 100%;
  border-right: 1px solid var(--el-border-color);
  display: flex;
  flex-direction: column;
  background: #fff;
}

.search-box {
  padding: 16px;
  border-bottom: 1px solid var(--el-border-color);
}

.tab-list {
  display: flex;
  padding: 12px 16px;
  gap: 8px;
  border-bottom: 1px solid var(--el-border-color);
}

.tab-item {
  padding: 4px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.tab-item.active {
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.list-container {
  flex: 1;
  overflow-y: auto;
}

.list-item {
  padding: 16px;
  cursor: pointer;
  border-bottom: 1px solid var(--el-border-color);
}

.list-item.active {
  background-color: #e8f3ff;
  border-left: 3px solid #409eff;
}

.item-title {
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 8px;
}

.item-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.time {
  margin-left: 8px;
}

.item-status {
  margin-top: 8px;
}
</style>