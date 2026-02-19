<template>
  <div class="detail-panel" v-if="activeUser">
    <div class="panel-header">
      <button class="close-btn" @click="closePanel">×</button>
    </div>
    <div class="user-card">
      <img :src="activeUser.avatar" class="large-avatar" />
      <h2>{{ activeUser.name }}</h2>
      <p class="email">{{ activeUser.email }}</p>
      <div class="contact-actions">
        <button>📞</button>
        <button>📹</button>
      </div>
    </div>
    <div class="section">
      <h3>信息</h3>
      <p><strong>姓名</strong>: {{ activeUser.name }}</p>
      <p><strong>职业</strong>: {{ activeUser.bio }}</p>
      <p><strong>电话</strong>: {{ activeUser.phone }}</p>
      <p><strong>性别</strong>: {{ activeUser.sex }}</p>
    </div>
    <div class="section">
      <h3>住址</h3>
      <p><strong>城市</strong>: {{ activeUser.address.country }}</p>
    </div>
    <div class="section">
      <h3>Upload attachments</h3>
      <div class="attachment-list">
        <div v-for="att in attachments" :key="att.id" class="attachment-item">
          <span>{{ att.name }}</span>
          <button @click="downloadAttachment(att)">⬇️</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { User, Attachment } from '../utils/chat';

const props = defineProps<{
  activeUser: User | null;
  attachments: Attachment[];
}>();

const emit = defineEmits<{
  'close-panel': [];
}>();

const closePanel = () => {
  emit('close-panel');
};

const downloadAttachment = (att: Attachment) => {
  window.open(att.url, '_blank');
};
</script>

<style scoped>
.detail-panel {
  width: 320px;
  background: #fff;
  border-left: 1px solid #e5e7eb;
  padding: 20px;
  overflow-y: auto;
  height: 100%;
}
.panel-header {
  text-align: right;
}
.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #6b7280;
}
.user-card {
  text-align: center;
  margin-bottom: 24px;
}
.large-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 12px;
}
.user-card h2 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 4px;
}
.email {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 16px;
}
.contact-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}
.contact-actions button {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f3f4f6;
  border: none;
  font-size: 16px;
  cursor: pointer;
}
.section {
  margin-bottom: 24px;
}
.section h3 {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.section p {
  font-size: 14px;
  margin-bottom: 8px;
}
.section strong {
  color: #111827;
}
.attachment-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.attachment-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f9fafb;
  border-radius: 8px;
  font-size: 13px;
}
.attachment-item button {
  background: none;
  border: none;
  cursor: pointer;
  color: #3b82f6;
}
</style>