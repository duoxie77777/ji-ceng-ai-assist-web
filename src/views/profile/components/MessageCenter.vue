<template>
  <div class="message-center">
    <el-card class="info-card">
      <template #header>
        <div class="card-header">
          <span>
            <svg-icon name="wodeyouxiang" size="24" />
            消息中心</span>
          <el-button size="small" @click="emit('markAllAsRead')">全部已读</el-button>
        </div>
      </template>
      <el-tabs v-model="activeTab">
        <el-tab-pane label="未读" name="unread">
          <div v-for="msg in unreadMessages" :key="msg.id" class="msg-item unread">
            <div class="msg-icon"><el-icon>
                <Warning />
              </el-icon></div>
            <div class="msg-content"><b>{{ msg.title }}</b>
              <p>{{ msg.content }}</p><small>{{ formatTime(msg.createdAt) }}</small>
            </div>
            <el-button link type="primary" @click="emit('markAsRead', msg.id)">标为已读</el-button>
          </div>
        </el-tab-pane>
        <el-tab-pane label="已读" name="read">
          <div v-for="msg in readMessages" :key="msg.id" class="msg-item">
            <div class="msg-icon"><el-icon>
                <Check />
              </el-icon></div>
            <div class="msg-content"><b>{{ msg.title }}</b>
              <p>{{ msg.content }}</p><small>{{ formatTime(msg.createdAt) }}</small>
            </div>
            <el-button link type="danger" @click="emit('deleteMessage', msg.id)">删除</el-button>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Warning, Check } from '@element-plus/icons-vue'
import type { Message } from '../utils/personal'

const props = defineProps<{ messages: Message[] }>()
const emit = defineEmits(['markAsRead', 'markAllAsRead', 'clearReadMessages', 'deleteMessage'])

const activeTab = ref('unread')
const unreadMessages = computed(() => props.messages.filter(m => !m.isRead))
const readMessages = computed(() => props.messages.filter(m => m.isRead))
const formatTime = (d: Date) => new Date(d).toLocaleString()
</script>

<style scoped lang="scss">
.message-center {
  .info-card {
    border-radius: 24px;
    background: var(--white);
    box-shadow: var(--shadow-sm);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 4px;
    /* 增加左右内边距，让内容不贴边 */
  }

  .msg-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    border-bottom: 1px solid var(--gray-100);

    &.unread {
      background: var(--blue-50);
    }

    .msg-icon {
      font-size: 24px;
      color: var(--blue-500);
    }

    .msg-content {
      flex: 1;

      p {
        margin: 4px 0;
        color: var(--gray-600);
      }

      small {
        color: var(--gray-500);
      }
    }
  }
}
</style>