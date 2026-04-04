<template>
  <div class="notice-panel">
    <div class="panel-header">
      <h3>通知公告</h3>
      <el-badge :value="unreadCount" type="danger" />
    </div>
    <div class="notice-list">
      <div v-for="notice in notices" :key="notice.id" class="notice-item" @click="viewNotice(notice)">
        <div class="notice-dot" :class="{ unread: !notice.isRead }"></div>
        <div class="notice-content">
          <div class="notice-title" :class="{ unread: !notice.isRead }">{{ notice.title }}</div>
          <div class="notice-time">{{ notice.time }}</div>
        </div>
      </div>
      <div v-if="notices.length === 0" class="empty-state">
        <el-icon>
          <Bell />
        </el-icon>
        <p>暂无通知</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Bell } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useHomeStore } from '../utils/store'

const homeStore = useHomeStore()
const notices = computed(() => homeStore.notices)
const unreadCount = computed(() => notices.value.filter(n => !n.isRead).length)

const viewNotice = (notice: any) => {
  ElMessage.info(notice.title)
}
</script>

<style scoped>
.notice-panel {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.panel-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.notice-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
}

.notice-list::-webkit-scrollbar {
  width: 4px;
}

.notice-list::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 2px;
}

.notice-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  background: #f9fafb;
  cursor: pointer;
  transition: all 0.2s;
}

.notice-item:hover {
  background: #f3f4f6;
}

.notice-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #d1d5db;
  flex-shrink: 0;
  margin-top: 4px;
}

.notice-dot.unread {
  background: #ef4444;
}

.notice-content {
  flex: 1;
}

.notice-title {
  font-size: 14px;
  color: #1f2937;
  margin-bottom: 4px;
  line-height: 1.4;
}

.notice-title.unread {
  font-weight: 500;
}

.notice-time {
  font-size: 12px;
  color: #6b7280;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: #9ca3af;
}

.empty-state .el-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-state p {
  font-size: 14px;
  margin: 0;
}

@media (max-width: 768px) {
  .notice-panel {
    padding: 16px;
  }
}
</style>
