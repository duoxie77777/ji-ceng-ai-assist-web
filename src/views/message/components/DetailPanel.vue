<template>
  <div class="detail-panel" v-if="activeUser">
    <div class="panel-header">
      <button class="close-btn" @click="closePanel">
        <svg-icon name="cuo" size="20" />
      </button>
    </div>

    <div class="user-card">
      <div class="avatar-wrapper">
        <img :src="activeUser.avatar" class="large-avatar" :alt="activeUser.name" />
        <span class="avatar-status online"></span>
      </div>
      <h2 class="user-name">{{ activeUser.name }}</h2>
      <p class="user-email">{{ activeUser.email }}</p>

      <div class="contact-actions">
        <button class="action-btn call-btn">
          <svg-icon name="dianhua" size="24" />
        </button>
        <button class="action-btn video-btn">
          <svg-icon name="shipindianhua" size="24" />
        </button>
      </div>
    </div>

    <div class="info-card">
      <div class="section">
        <h3 class="section-title">基本信息</h3>
        <div class="info-list">
          <div class="info-item">
            <span class="info-label">姓名</span>
            <span class="info-value">{{ activeUser.name || '未填写' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">职业</span>
            <span class="info-value">{{ activeUser.bio || '未填写' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">电话</span>
            <span class="info-value">{{ activeUser.phone || '未填写' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">性别</span>
            <span class="info-value">{{ activeUser.sex || '未填写' }}</span>
          </div>
        </div>
      </div>

      <div class="section">
        <h3 class="section-title">住址信息</h3>
        <div class="info-list">
          <div class="info-item">
            <span class="info-label">城市/国家</span>
            <span class="info-value">{{ activeUser.address?.country || '未填写' }}</span>
          </div>
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
</script>

<style scoped>
.detail-panel {
  width: 320px;
  background: #f8fafc;
  border-left: 1px solid #e2e8f0;
  padding: 24px 20px;
  overflow-y: auto;
  height: 100%;
  box-sizing: border-box;
}

.panel-header {
  text-align: right;
  margin-bottom: 20px;
}

.close-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #64748b;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}

.close-btn:hover {
  background-color: #e2e8f0;
  color: #334155;
}

.user-card {
  text-align: center;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-radius: 16px;
  padding: 24px 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(148, 163, 184, 0.15);
}

.avatar-wrapper {
  position: relative;
  display: inline-block;
  margin-bottom: 16px;
}

.large-avatar {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.avatar-status {
  position: absolute;
  bottom: 6px;
  right: 6px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 3px solid #ffffff;
}

.avatar-status.online {
  background-color: #10b981;
}

.user-name {
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 8px;
  letter-spacing: 0.2px;
}

.user-email {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 20px;
}

.contact-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.action-btn {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.call-btn {
  background-color: #ffffff;
  color: #3b82f6;
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.2);
}

.call-btn:hover {
  background-color: #3b82f6;
  color: #ffffff;
  transform: scale(1.05);
}

.video-btn {
  background-color: #ffffff;
  color: #10b981;
  box-shadow: 0 2px 6px rgba(16, 185, 129, 0.2);
}

.video-btn:hover {
  background-color: #10b981;
  color: #ffffff;
  transform: scale(1.05);
}

.info-card,
.attachments-card {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(148, 163, 184, 0.1);
}

.section {
  margin-top: 15px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f1f5f9;
  text-transform: capitalize;
  letter-spacing: 0.1px;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f8fafc;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

.info-value {
  font-size: 14px;
  color: #1e293b;
  text-align: right;
  max-width: 180px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.attachment-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.attachment-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background-color: #f8fafc;
  border-radius: 8px;
  font-size: 13px;
  transition: background-color 0.2s ease;
}

.attachment-item:hover {
  background-color: #f1f5f9;
}

.file-name {
  color: #334155;
  max-width: 180px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.download-btn {
  background-color: #3b82f6;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.download-btn:hover {
  background-color: #2563eb;
}
</style>