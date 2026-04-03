<template>
  <aside class="sidebar">
    <div class="user-info">
      <el-avatar :size="48" src="https://cube.elemecdn.com/0/88/03b01d2d5f2b9e2e7d5f8e2e7d5f8e2e.png" />
      <div class="user-detail">
        <div class="user-name">杨政通</div>
        <div class="user-status">在线</div>
      </div>
    </div>

    <div class="menu-list">
      <div v-for="item in menuItems" :key="item.key" :class="['menu-item', { active: activeMenu === item.key }]"
        @click="emit('update:activeMenu', item.key)">
        <el-icon>
          <component :is="item.icon" />
        </el-icon>
        <span class="menu-label">{{ item.label }}</span>
        <el-badge :value="item.badge === BadgeType.FRIEND ? friendCount : newFriendCount"
          :hidden="item.badge === BadgeType.FRIEND ? friendCount === 0 : newFriendCount === 0"
          :type="item.badge === BadgeType.NEW_FRIEND ? 'danger' : 'primary'" />
      </div>
    </div>

    <div class="quick-entries">
      <div v-for="entry in quickEntries" :key="entry.name" class="entry-item">
        <el-icon>
          <component :is="entry.icon" />
        </el-icon>
        <span>{{ entry.name }}</span>
      </div>
    </div>

    <!-- 添加好友按钮（底部居中） -->
    <div class="add-friend-bottom">
      <el-button type="primary" :icon="Plus" class="add-friend-btn" @click="emit('addFriend')">
        添加好友
      </el-button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { MenuType, BadgeType } from '../utils/contact'
import {
  User, UserFilled, ChatDotRound, Collection,
  Cpu, Briefcase, Service, Plus
} from '@element-plus/icons-vue'

defineProps<{
  activeMenu: MenuType
  friendCount: number
  newFriendCount: number
}>()

const emit = defineEmits<{
  (e: 'update:activeMenu', value: MenuType): void
  (e: 'addFriend'): void
}>()

const menuItems = [
  { key: MenuType.FRIENDS, label: '好友', icon: User, badge: BadgeType.FRIEND },
  { key: MenuType.NEW_FRIENDS, label: '好友申请', icon: UserFilled, badge: BadgeType.NEW_FRIEND },
  { key: MenuType.GROUPS, label: '群聊', icon: ChatDotRound, badge: null },
  { key: MenuType.CUSTOM_GROUPS, label: '分组', icon: Collection, badge: null }
]

const quickEntries = [
  { name: 'AI助手', icon: Cpu },
  { name: '工作台', icon: Briefcase },
  { name: '服务中心', icon: Service }
]
</script>

<style scoped lang="scss">
.sidebar {
  width: 260px;
  background: var(--white);
  border-radius: 8px;
  border: 1px solid var(--gray-200);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  height: fit-content;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px;
  border-bottom: 1px solid var(--gray-100);

  .user-detail {
    .user-name {
      font-weight: 600;
      font-size: 16px;
      color: var(--gray-900);
    }

    .user-status {
      font-size: 12px;
      color: var(--gray-500);
    }
  }
}

.menu-list {
  padding: 12px;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  margin-bottom: 4px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--gray-700);
  font-size: 14px;

  .el-icon {
    font-size: 18px;
    margin-right: 10px;
  }

  .menu-label {
    flex: 1;
  }

  .menu-badge {
    margin-left: auto;

    :deep(.el-badge__content) {
      background-color: var(--blue-500);
      border: none;
      font-size: 11px;
      height: 18px;
      line-height: 18px;
      padding: 0 5px;
    }
  }

  &.active {
    background: var(--blue-500);
    color: white;

    .menu-badge :deep(.el-badge__content) {
      background-color: white;
      color: var(--blue-500);
    }
  }

  &:hover:not(.active) {
    background: var(--gray-100);
    color: var(--gray-900);
  }
}

.quick-entries {
  padding: 12px;
  border-top: 1px solid var(--gray-100);
  border-bottom: 1px solid var(--gray-100);
  margin-bottom: 12px;

  .entry-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    color: var(--gray-600);
    transition: all 0.2s;

    &:hover {
      background: var(--gray-100);
      color: var(--gray-900);
    }
  }
}

.add-friend-bottom {
  padding: 0 16px 20px;
  text-align: center;
  margin-top: auto;
}

.add-friend-btn {
  width: 100%;
  height: 40px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 6px;
  background: var(--blue-500);
  border: none;
  transition: all 0.2s;

  &:hover {
    background: var(--blue-600);
  }
}
</style>