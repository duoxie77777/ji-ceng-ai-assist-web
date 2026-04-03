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
        <button class="action-btn call-btn"><svg-icon name="dianhua" size="24" /></button>
        <button class="action-btn video-btn"><svg-icon name="shipindianhua" size="24" /></button>
      </div>
    </div>

    <div class="info-card">
      <div class="section">
        <h3 class="section-title">{{ UI_TEXT.BASIC_INFO }}</h3>
        <div class="info-list">
          <div class="info-item" v-for="item in DETAIL_INFO_FIELDS" :key="item.label">
            <span :class="CSS_CLASS_NAME.INFO_LABEL">{{ item.label }}</span>
            <span :class="CSS_CLASS_NAME.INFO_VALUE">
              {{ activeUser[item.field as keyof User] || USER_INFO_LABEL.UNFILLED }}
            </span>
          </div>
        </div>
      </div>
      <div class="section">
        <h3 class="section-title">{{ UI_TEXT.ADDRESS_INFO }}</h3>
        <div class="info-list">
          <div class="info-item">
            <span :class="CSS_CLASS_NAME.INFO_LABEL">{{ USER_INFO_LABEL.COUNTRY }}</span>
            <span :class="CSS_CLASS_NAME.INFO_VALUE">
              {{ activeUser.address?.country || USER_INFO_LABEL.UNFILLED }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { User, Attachment } from '../utils/chat'
import { USER_INFO_LABEL, UI_TEXT, CSS_CLASS_NAME, DETAIL_INFO_FIELDS } from '../utils/chat'

defineProps<{
  activeUser: User | null
  attachments: Attachment[]
}>()

const emit = defineEmits<{ 'close-panel': [] }>()
const closePanel = () => emit('close-panel')
</script>

<style scoped lang="scss">
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

.user-card {
  text-align: center;
  background: linear-gradient(135deg, var(--blue-50) 0%, var(--blue-200) 100%);
  border-radius: 16px;
  padding: 24px 20px;
  margin-bottom: 20px;
  box-shadow: var(--shadow-sm);
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
  box-shadow: var(--shadow-sm);
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
  box-shadow: var(--shadow-blue);

  &:hover {
    background-color: var(--blue-500);
    color: var(--white);
    transform: scale(1.05);
  }
}

.video-btn {
  background-color: var(--white);
  color: var(--mint-500);
  box-shadow: 0 2px 6px rgba(16, 185, 129, 0.2);

  &:hover {
    background-color: var(--mint-500);
    color: var(--white);
    transform: scale(1.05);
  }
}

.info-card {
  background-color: var(--white);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: var(--shadow-sm);
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
  border-bottom: 1px solid var(--gray-100);
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

  .info-label {
    color: var(--gray-700);
  }

  .info-value {
    color: var(--gray-900);
    font-weight: 500;
  }
}
</style>