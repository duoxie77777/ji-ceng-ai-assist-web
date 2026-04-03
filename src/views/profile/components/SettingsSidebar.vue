<template>
  <div class="settings-sidebar">
    <div class="menu-list">
      <div v-for="item in MENU_ITEMS" :key="item.key" class="menu-item" :class="{ active: activeMenu === item.key }"
        @click="handleSelect(item.key)">
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
import { User, Setting, Message, QuestionFilled } from '@element-plus/icons-vue'
import { MENU_ITEMS } from '../utils/personal'

defineProps<{ activeMenu: string; unreadCount?: number }>()
const emit = defineEmits(['update:activeMenu'])
const handleSelect = (idx: string) => {
  emit('update:activeMenu', idx)
}
</script>

<style scoped lang="scss">
.settings-sidebar {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(8px);
  border-radius: 28px;
  box-shadow: var(--shadow-sm);
  padding: 16px 0;
  width: 100%;
}

.menu-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0 16px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 40px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--gray-700);
  font-size: 15px;
  font-weight: 500;

  &:hover {
    background: var(--blue-50);
    color: var(--blue-700);
  }

  &.active {
    background: var(--blue-700);
    color: white;

    .menu-badge :deep(.el-badge__content) {
      background-color: white;
      color: var(--blue-700);
    }
  }

  .menu-icon {
    font-size: 20px;
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
      font-size: 12px;
      height: 20px;
      line-height: 20px;
      padding: 0 6px;
    }
  }
}
</style>