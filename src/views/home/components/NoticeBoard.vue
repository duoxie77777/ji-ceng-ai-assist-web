<template>
  <div class="notice-card glass-card">
    <div class="card-header">
      <span class="header-dot"></span>
      <h3>通知公告</h3>
      <button class="more-btn">查看更多</button>
    </div>
    <div class="notice-list custom-scrollbar">
      <div v-for="item in notices" :key="item.title" class="notice-item">
        <span class="status-badge" :class="{ unread: !item.isRead, read: item.isRead }">
          {{ item.isRead ? NOTICE_STATUS.READ : NOTICE_STATUS.UNREAD }}
        </span>
        <span class="notice-title">{{ item.title }}</span>
        <span class="notice-time">{{ item.time }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useHomeStore } from '../utils/store'
import { NOTICE_STATUS } from '../utils/constants'
const store = useHomeStore()
const notices = store.notices
</script>

<style scoped>
.notice-card {
  padding: 20px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: var(--shadow-md);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.header-dot {
  width: 4px;
  height: 18px;
  background: var(--blue-500);
  border-radius: 2px;
  margin-right: 8px;
}

h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: var(--gray-900);
}

.more-btn {
  margin-left: auto;
  background: none;
  border: none;
  color: var(--gray-500);
  font-size: 13px;
  cursor: pointer;
}

.more-btn:hover {
  color: var(--blue-500);
}

.notice-list {
  flex: 1;
  overflow-y: auto;
  max-height: 220px;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: var(--gray-300);
  border-radius: 2px;
}

.notice-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--gray-100);
  font-size: 14px;
}

.notice-item:last-child {
  border-bottom: none;
}

.status-badge {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 30px;
  flex-shrink: 0;
}

.status-badge.unread {
  background: var(--blue-100);
  color: var(--blue-700);
}

.status-badge.read {
  background: var(--gray-100);
  color: var(--gray-600);
}

.notice-title {
  flex: 1;
  font-weight: 500;
  color: var(--gray-800);
  cursor: pointer;
  font-size: 14px;
}

.notice-title:hover {
  color: var(--blue-500);
}

.notice-time {
  font-size: 12px;
  color: var(--gray-500);
  flex-shrink: 0;
}
</style>