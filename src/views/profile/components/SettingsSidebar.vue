<template>
  <div class="settings-sidebar">
    <div class="menu-list">
      <div 
        v-for="item in MENU_ITEMS" 
        :key="item.key" 
        class="menu-item" 
        :class="{ active: activeMenu === item.key }"
        @click="handleSelect(item.key)"
      >
        <el-icon class="menu-icon">
          <component :is="item.icon" />
        </el-icon>
        <span class="menu-label">{{ item.label }}</span>
        <el-badge v-if="item.key === 'message' && unreadCount" :value="unreadCount" class="menu-badge" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { User, Lock, Setting, Message, QuestionFilled } from '@element-plus/icons-vue'
import { MENU_ITEMS } from '../utils/personal'

defineProps<{ activeMenu: string; unreadCount?: number }>()
const emit = defineEmits(['update:activeMenu'])

const handleSelect = (key: string) => {
  emit('update:activeMenu', key)
}
</script>

<style scoped lang="scss">
.settings-sidebar {
  background: var(--white);
  border-radius: 8px;
  border: 1px solid var(--gray-200);
  padding: 12px 0;
  width: 100%;
  height: fit-content;
}

.menu-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0 12px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--gray-700);
  font-size: 14px;
  font-weight: 400;

  &:hover {
    background: var(--gray-100);
    color: var(--gray-900);
  }

  &.active {
    background: var(--blue-500);
    color: white;

    .menu-badge :deep(.el-badge__content) {
      background-color: white;
      color: var(--blue-500);
    }
  }

  .menu-icon {
    font-size: 18px;
    flex-shrink: 0;
  }

  .menu-label {
    flex: 1;
    white-space: nowrap;
  }

  .menu-badge {
    flex-shrink: 0;
    margin-left: auto;

    :deep(.el-badge__content) {
      background-color: var(--red-500);
      border: none;
      font-size: 11px;
      height: 18px;
      line-height: 18px;
      padding: 0 5px;
    }
  }
}
</style>
