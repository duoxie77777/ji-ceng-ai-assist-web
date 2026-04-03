<template>
  <div class="approval-sidebar">
    <div class="search-box">
      <el-input :model-value="searchKeyword" @input="$emit('update:searchKeyword', $event)" placeholder="搜索事项名称/文号"
        clearable>
        <template #prefix><svg-icon name="sousuo" size="28" /></template>
      </el-input>
    </div>

    <div class="tab-list">
      <div v-for="tab in APPROVAL_TABS" :key="tab.key" class="tab-item" :class="{ active: activeTab === tab.key }"
        @click="emit('update:activeTab', tab.key)">
        {{ tab.label }}
      </div>
    </div>

    <div class="list-container">
      <div v-for="item in filteredList" :key="item.id" class="list-item" :class="{ active: selected?.id === item.id }"
        @click="emit('select', item)">
        <div class="item-title">{{ item.title }}</div>
        <div class="item-info">
          <el-tag size="small" type="primary">{{ item.type }}</el-tag>
          <span class="time">{{ item.createTime }}</span>
        </div>
        <div class="item-status">
          <el-tag size="small" :type="APPROVAL_STATUS_TAG_TYPE[item.status]">{{ APPROVAL_STATUS_LABEL[item.status]
            }}</el-tag>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { APPROVAL_TABS, ApprovalTabEnum, ApprovalStatusEnum, APPROVAL_STATUS_TAG_TYPE, APPROVAL_STATUS_LABEL } from '../utils/types';
import type { ApprovalItem } from '../utils/types';

const props = defineProps<{
  list: ApprovalItem[];
  activeTab: string;
  searchKeyword: string;
  selected: ApprovalItem | null;
}>();

const emit = defineEmits(['update:activeTab', 'update:searchKeyword', 'select']);

const filteredList = computed(() => {
  let list = props.list;
  if (props.activeTab === ApprovalStatusEnum.IN_PROGRESS) {
    list = list.filter(item => item.status === ApprovalStatusEnum.IN_PROGRESS);
  } else if (props.activeTab === ApprovalTabEnum.PROCESSED) {
    list = list.filter(item => item.status === ApprovalStatusEnum.PASSED || item.status === ApprovalStatusEnum.REJECTED);
  }
  if (props.searchKeyword) {
    const kw = props.searchKeyword.toLowerCase();
    list = list.filter(item => item.title.toLowerCase().includes(kw) || item.docNo.toLowerCase().includes(kw));
  }
  return list;
});
</script>

<style scoped lang="scss">
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
      display: flex;
      justify-content: space-between;
      margin-top: 8px;
    }

    .item-status {
      margin-top: 8px;
    }
  }
}
</style>