<template>
  <!-- 联系人详情面板：展示用户信息、联系方式等 -->
  <div class="detail-panel" v-if="activeUser">

    <!-- 面板头部：关闭按钮 -->
    <div class="panel-header">
      <button class="close-btn" @click="closePanel">
        <svg-icon name="cuo" size="20" />
      </button>
    </div>

    <!-- 用户卡片：头像、名称、邮箱、操作按钮 -->
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


    <!-- 信息卡片：基础信息/地址信息 -->
    <div class="info-card">
      <div class="section">
        <h3 class="section-title">{{ UI_TEXT.BASIC_INFO }}</h3>
        <div class="info-list">
          <div class="info-item">
            <span :class="CSS_CLASS_NAME.INFO_LABEL">{{ USER_INFO_LABEL.NAME }}</span>
            <span :class="CSS_CLASS_NAME.INFO_VALUE">{{ activeUser.name || USER_INFO_LABEL.UNFILLED }}</span>
          </div>
          <div class="info-item">
            <span :class="CSS_CLASS_NAME.INFO_LABEL">{{ USER_INFO_LABEL.BIO }}</span>
            <span :class="CSS_CLASS_NAME.INFO_VALUE">{{ activeUser.bio || USER_INFO_LABEL.UNFILLED }}</span>
          </div>
          <div class="info-item">
            <span :class="CSS_CLASS_NAME.INFO_LABEL">{{ USER_INFO_LABEL.PHONE }}</span>
            <span :class="CSS_CLASS_NAME.INFO_VALUE">{{ activeUser.phone || USER_INFO_LABEL.UNFILLED }}</span>
          </div>
          <div class="info-item">
            <span :class="CSS_CLASS_NAME.INFO_LABEL">{{ USER_INFO_LABEL.SEX }}</span>
            <span :class="CSS_CLASS_NAME.INFO_VALUE">{{ activeUser.sex || USER_INFO_LABEL.UNFILLED }}</span>
          </div>
        </div>
      </div>

      <!-- 地址信息区域 -->
      <div class="section">
        <h3 class="section-title">{{ UI_TEXT.ADDRESS_INFO }}</h3>
        <div class="info-list">
          <div class="info-item">
            <span :class="CSS_CLASS_NAME.INFO_LABEL">{{ USER_INFO_LABEL.COUNTRY }}</span>
            <span :class="CSS_CLASS_NAME.INFO_VALUE">{{ activeUser.address?.country || USER_INFO_LABEL.UNFILLED }}</span>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import type { User, Attachment } from '../utils/chat';
// 导入新增的常量
import { USER_INFO_LABEL, UI_TEXT, CSS_CLASS_NAME } from '../utils/chat';

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

<style scoped lang="less">
// 样式部分完全保留，无修改
.detail-panel {
  width: 320px;
  background: var(--white);
  border-left: 1px solid var(--gray-200);
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
  color: var(--gray-600);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
  &:hover {
    color: var(--red-500);
  }
}

// .close-btn:hover {
//   background-color: #e2e8f0;
//   color: #334155;
// }

.user-card {
  text-align: center;
  background: linear-gradient(135deg, var(--blue-50) 0%, var(--blue-200) 100%);
  border-radius: 16px;
  padding: 24px 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px var(--gray-200);
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
  border: 4px solid var(--white);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.avatar-status {
  position: absolute;
  bottom: 6px;
  right: 6px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 3px solid var(--white);
}

.avatar-status.online {
  background-color: var(--mint-500);
}

.user-name {
  font-size: 20px;
  font-weight: 600;
  color: var(--gray-900);
  margin: 0 0 8px;
  letter-spacing: 0.2px;
}

.user-email {
  font-size: 14px;
  color: var(--gray-600);
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
  background-color: var(--white);
  color: var(--blue-500);
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.2);
}

.call-btn:hover {
  background-color: var(--blue-500);
  color: var(--white);
  transform: scale(1.05);
}

.video-btn {
  background-color: var(--white);
  color: var(--mint-500); // 对应 #10b981 (薄荷绿)
  box-shadow: 0 2px 6px rgba(16, 185, 129, 0.2);
}

.video-btn:hover {
  background-color: var(--mint-500);
  color: var(--white);
  transform: scale(1.05);
}

.info-card,
.attachments-card {
  background-color: var(--white);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px var(--gray-200); // 用主题灰替代原来的阴影色
}

.section {
  margin-top: 15px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--gray-600);
  margin: 0 0 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--gray-100); // 对应 #f1f5f9
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
  padding: 10px 0;
  font-size: 14px;

  .label {
    color: var(--gray-700);
  }

  .value {
    color: var(--gray-900);
    font-weight: 500;
  }
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
  background-color: var(--gray-50);
  border-radius: 8px;
  font-size: 13px;
  transition: background-color 0.2s ease;
}

.attachment-item:hover {
  background-color: var(--gray-100);
}

.file-name {
  color: var(--gray-800);
  max-width: 180px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.download-btn {
  background-color: var(--blue-500);
  color: var(--white);
  border: none;
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.download-btn:hover {
  background-color: var(--blue-600);
}
</style>