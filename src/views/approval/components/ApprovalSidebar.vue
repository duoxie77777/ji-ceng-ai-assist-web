<template>
  <!-- 审批侧边栏：包含搜索、分类标签、审批事项列表 -->
  <div class="approval-sidebar">
    <!-- 顶部搜索框：搜索事项名称/文号 -->
    <div class="search-box">
      <el-input :model-value="searchKeyword" @input="$emit('update:searchKeyword', $event)" placeholder="搜索事项名称/文号"
        clearable>
        <template #prefix>
          <svg-icon name="sousuo" size="28" />
        </template>
      </el-input>
    </div>

    <!-- 分类标签栏：切换审批事项分类（进行中/已处理等） -->
    <div class="tab-list">
      <div class="tab-item" v-for="tab in ApprovalTabConfig" :key="tab.key" :class="{ active: activeTab === tab.key }"
        @click="handleTab(tab.key)">
        {{ tab.label }}
      </div>
    </div>

    <!-- 审批事项列表容器：展示筛选后的审批事项 -->
    <div class="list-container">
      <div v-for="item in filteredList" :key="item.id" class="list-item" :class="{ active: selected?.id === item.id }"
        @click="handleSelect(item)">
        <div class="item-title">{{ item.title }}</div>
        <div class="item-info">
          <el-tag size="small" :type="TagTypeEnum.PRIMARY">{{ item.type }}</el-tag> <span class="time">{{
            item.createTime
            }}</span>
        </div>
        <div class="item-status">
          <el-tag size="small" :type="APPROVAL_STATUS_TAG_TYPE[item.status]">
            {{ APPROVAL_STATUS_LABEL[item.status] }}
          </el-tag>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  ApprovalTabConfig,
  ApprovalStatusEnum,
  APPROVAL_STATUS_LABEL,
  APPROVAL_STATUS_TAG_TYPE,
  TagTypeEnum,
  ApprovalTabEnum
} from '../utils/types'

// 接收父组件传递的属性：列表、激活标签、搜索关键词、选中项
const props = defineProps({
  list: {
    type: Array,
    default: () => [],
  },
  activeTab: { type: String, default: ApprovalTabConfig[0].key },
  searchKeyword: {
    type: String,
    default: '',
  },
  selected: {
    type: Object,
    default: null
  }
})

// 定义向外触发的事件：更新标签、更新搜索词、选中事项
const emit = defineEmits([
  'update:activeTab',
  'update:searchKeyword',
  'select',
])

// 切换分类标签：向父组件传递激活的标签值
const handleTab = (tab) => {
  emit('update:activeTab', tab)
}

// 处理搜索：向父组件传递搜索关键词
const handleSearch = (val) => {
  emit('update:searchKeyword', val)
}

// 选中审批事项：向父组件传递选中的事项对象
const handleSelect = (item) => {
  emit('select', item)
}

// 筛选列表：根据激活标签和搜索关键词过滤审批列表
const filteredList = computed(() => {
  let list = props.list || []

  // 按审批状态筛选（进行中/已处理）
  if (props.activeTab === ApprovalStatusEnum.IN_PROGRESS) {
    list = list.filter((item) => item.status === ApprovalStatusEnum.IN_PROGRESS)
  } else if (props.activeTab === ApprovalTabEnum.PROCESSED) {
    list = list.filter(
      (item) => item.status === ApprovalStatusEnum.PASSED || item.status === ApprovalStatusEnum.REJECTED
    );
  }

  // 按关键词搜索（标题/文号）
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

<style scoped lang="less">
.approval-sidebar {
  width: 380px;
  height: 100%;
  border-right: 1px solid var(--gray-200);
  display: flex;
  flex-direction: column;
  background: var(--white);

  .search-box {
    padding: 16px 20px;
    border-bottom: 1px solid var(--gray-100);
  }

  .tab-list {
    display: flex;
    padding: 12px 20px;
    gap: 12px;
    border-bottom: 1px solid var(--gray-100);

    .tab-item {
      padding: 6px 16px;
      border-radius: 20px;
      cursor: pointer;

      &.active {
        background: var(--blue-50);
        color: var(--blue-500);
      }

      &:hover:not(.active) {
        background: var(--gray-100);
      }
    }
  }

  .list-container {
    flex: 1;
    overflow-y: auto;
  }

  .list-item {
    padding: 20px;
    cursor: pointer;
    border-bottom: 1px solid var(--gray-100);

    &:hover {
      background-color: var(--gray-50);
    }

    &.active {
      background-color: var(--blue-50);
      border-left: 3px solid var(--blue-500);
    }

    .item-title {
      color: var(--gray-900);
    }

    .item-info {
      color: var(--gray-600);
    }
  }
}
</style>