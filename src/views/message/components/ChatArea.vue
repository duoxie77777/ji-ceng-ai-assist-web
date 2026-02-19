<template>
  <div class="chat-area">
    <!-- 头部 -->
    <div class="chat-header">
      <div class="user-info">
        <img :src="activeConversation?.participant.avatar" class="avatar" />
        <div>
          <h3>{{ activeConversation?.participant.name || '未知联系人' }}</h3>
        </div>
      </div>
      <div class="header-actions">
        <button @click="toggleDetailPanel">👤</button>
        <button>📞</button>
        <button>📹</button>
        <button>🔗</button>
        <button>🔍</button>
        <button>⋯</button>
      </div>
    </div>

    <!-- 消息区域 -->
    <div class="messages-container" ref="messagesContainer">
      <!-- 无消息提示 -->
      <div v-if="!activeConversation || groupedMessages.length === 0" class="empty-message">
        暂无聊天记录，开始聊聊吧～
      </div>

      <!-- 有消息：按日期分组 -->
      <div v-else>
        <div v-for="group in groupedMessages" :key="group.date" class="message-group">
          <div class="date-divider">{{ group.date }}</div>
          <!-- 单条消息 -->
          <div v-for="msg in group.messages" :key="msg.id" :class="['message', msg.isOwn ? 'own' : 'other']">
            <div class="message-bubble">
              <div class="sender-name" v-if="!msg.isOwn">{{ msg.senderName }}</div>

              <!-- 文本消息 -->
              <div v-if="msg.type === 'text'" class="text-content">
                {{ msg.content }}
              </div>

              <!-- 文件消息：区分图片/非图片 -->
              <div v-if="msg.type === 'file'">
                <!-- 图片消息：直接预览 -->
                <div v-if="msg.fileInfo?.isImage" class="image-content" @click="previewImage(msg.fileInfo.url)">
                  <img :src="msg.fileInfo.url" :alt="msg.fileInfo.name" class="preview-img" loading="lazy" />
                </div>

                <!-- 非图片文件：下载样式 -->
                <div v-else class="file-content" @click="downloadFile(msg)">
                  <span class="file-icon">📎</span>
                  <div class="file-info">
                    <div class="file-name">{{ msg.fileInfo?.name || '未知文件' }}</div>
                    <div class="file-size">{{ formatFileSize(msg.fileInfo?.size || 0) }}</div>
                  </div>
                </div>
              </div>

              <div class="message-footer">
                <span class="timestamp">{{ formatTime(msg.timestamp) }}</span>
                <span v-if="msg.isOwn" class="read-status">
                  {{ msg.isRead ? '✓✓ 已读' : '✓ 未读' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 图片预览遮罩层（点击图片放大） -->
    <div v-if="previewImageUrl" class="image-preview-mask" @click="previewImageUrl = ''">
      <img :src="previewImageUrl" alt="预览图片" class="preview-mask-img" @click.stop />
    </div>



    <!-- 输入框（文件上传功能） -->
    <div class="input-area">
      <!-- 文件上传按钮（隐藏input） -->
      <label class="attach-btn">
        +
        <input ref="fileInputRef" type="file" class="file-input" @change="handleFileUpload" accept="*" />
      </label>
      <input type="text" v-model="newMessage" placeholder="Write your message..." @keyup.enter="sendMessage" />
      <div class="input-actions">
        <button>Aa</button>
        <!-- 文件图标（触发上传） -->
        <button @click="triggerFileInput">📎</button>
        <!-- 发送按钮 -->
        <button @click="sendMessage" class="send-btn">➤</button>

      </div>
      <!-- 空消息提示（默认隐藏） -->
      <div v-if="showEmptyTip" class="empty-tip">发送消息不能为空</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue';
import { useChatStore } from '@/store/modules/chatStrore';
import type { Conversation, Message } from '../utils/chat';

// 初始化Store
const chatStore = useChatStore();
const newMessage = ref('');
const messagesContainer = ref<HTMLElement | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);
const previewImageUrl = ref('');
// 空提示控制
const showEmptyTip = ref(false);
let tipTimer: NodeJS.Timeout | null = null;

// 新增：预览图片方法
const previewImage = (url: string) => {
  previewImageUrl.value = url;
  // 禁止页面滚动
  document.body.style.overflow = 'hidden';
};
// 监听预览关闭，恢复滚动
watch(previewImageUrl, (val) => {
  if (!val) {
    document.body.style.overflow = 'auto';
  }
});
// Props（加默认值）
const props = defineProps<{
  activeConversation: Conversation | null;
}>();

// 事件
const emit = defineEmits<{
  'toggle-detail': [];
}>();

// 获取分组消息（从Store的getter）
const groupedMessages = computed(() => chatStore.groupedMessages);

// 监听：会话/消息变化时滚动到底部
watch([() => props.activeConversation, () => groupedMessages.value], () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
}, { immediate: true });

// 格式化时间（小时:分钟）
const formatTime = (iso: string) => {
  const d = new Date(iso);
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')} ${d.getHours() >= 12 ? 'pm' : 'am'}`;
};

// 格式化文件大小
const formatFileSize = (bytes: number) => {
  return chatStore.formatFileSize(bytes);
};


// 发送文本消息
const sendMessage = () => {
  // 去除首尾空格后判断是否为空
  const trimedMsg = newMessage.value.trim();
  if (!trimedMsg) {
    // 显示提示
    showEmptyTip.value = true;
    // 3秒后自动隐藏提示
    if (tipTimer) clearTimeout(tipTimer);
    tipTimer = setTimeout(() => {
      showEmptyTip.value = false;
    }, 3000);
    return; // 空值直接返回，不发送
  }
  chatStore.sendMessage(trimedMsg);
  newMessage.value = '';
  // 发送后如果提示还在，立即隐藏
  showEmptyTip.value = false;
  if (tipTimer) clearTimeout(tipTimer);

  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

// 监听输入框变化：输入内容时自动隐藏提示
watch(newMessage, (val) => {
  if (val.trim() && showEmptyTip.value) {
    showEmptyTip.value = false;
    if (tipTimer) clearTimeout(tipTimer);
  }
});

// 触发文件选择框
const triggerFileInput = () => {
  if (fileInputRef.value) {
    fileInputRef.value.click();
  }
};

// 处理文件上传
const handleFileUpload = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    chatStore.sendFileMessage(file);
    // 清空选择框
    target.value = '';
    // 上传后滚动到底部
    nextTick(() => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
      }
    });
  }
};

// 下载文件
const downloadFile = (msg: Message) => {
  if (!msg.fileInfo || !msg.fileInfo.url) return;

  const a = document.createElement('a');
  a.href = msg.fileInfo.url;
  a.download = msg.fileInfo.name || '下载文件';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

// 切换详情面板
const toggleDetailPanel = () => {
  emit('toggle-detail');
};
</script>

<style scoped>
/* 基础布局 */
.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
  height: 100%;
  min-height: 0;
  /* 修复flex高度塌陷 */
}

/* 头部 */
.chat-header {
  padding: 12px 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  margin-right: 12px;
  object-fit: cover;
}

.user-info h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.last-seen {
  font-size: 13px;
  color: #6b7280;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.header-actions button {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: #6b7280;
}

/* 消息容器 */
.messages-container {
  flex: 1;
  padding: 16px 20px;
  overflow-y: auto;
  background: #f9fafb;
}

/* 无消息提示 */
.empty-message {
  text-align: center;
  padding: 40px 0;
  color: #9ca3af;
  font-size: 14px;
}

/* 日期分组 */
.message-group {
  margin-bottom: 16px;
}

.date-divider {
  text-align: center;
  font-size: 12px;
  color: #9ca3af;
  margin: 8px 0;
  padding: 4px 0;
  background: #f3f4f6;
  border-radius: 4px;
}

/* 单条消息 */
.message {
  display: flex;
  margin-bottom: 8px;
}

.message.own {
  justify-content: flex-end;
}

.message-bubble {
  max-width: 70%;
  padding: 10px 14px;
  border-radius: 18px;
  font-size: 14px;
  line-height: 1.5;
}

.message.other .message-bubble {
  background: #dbeafe;
  border-bottom-left-radius: 4px;
}

.message.own .message-bubble {
  background: #eff6ff;
  border-bottom-right-radius: 4px;
}

.sender-name {
  font-weight: 600;
  margin-bottom: 4px;
  font-size: 13px;
  color: #1e40af;
}

/* 消息底部（时间+已读） */
.message-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
}

.timestamp {
  font-size: 11px;
  color: #6b7280;
}

.read-status {
  font-size: 10px;
  color: #6b7280;
}

/* 文件消息样式 */
.file-content {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 0;
}

.file-icon {
  font-size: 18px;
  color: #3b82f6;
}

.file-info {
  flex: 1;
}

.file-name {
  font-size: 14px;
  color: #1e40af;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-size {
  font-size: 12px;
  color: #6b7280;
}

/* 输入框区域 */
.input-area {
  padding: 12px 20px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 12px;
}

.attach-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f3f4f6;
  border: none;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 隐藏文件选择框 */
.file-input {
  display: none;
}

/* 文本输入框 */
.input-area input[type="text"] {
  flex: 1;
  padding: 10px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  font-size: 14px;
  outline: none;
}

.input-area input[type="text"]:focus {
  border-color: #3b82f6;
}

/* 输入框操作按钮 */
.input-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.input-actions button {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: #6b7280;
}

/* 发送按钮 */
.send-btn {
  background: #3b82f6 !important;
  color: #fff !important;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-content {
  cursor: zoom-in;
  max-width: 200px;
  /* 预览图最大宽度 */
  border-radius: 8px;
  overflow: hidden;
}

.preview-img {
  width: 100%;
  height: auto;
  border-radius: 8px;
  transition: transform 0.2s;
}

.preview-img:hover {
  transform: scale(1.02);
}

/* 图片放大预览遮罩层 */
.image-preview-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  cursor: zoom-out;
}

.preview-mask-img {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
  border-radius: 4px;
}

.empty-tip {
  position: absolute;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  z-index: 10;
  animation: fadeInOut 3s ease;
}

@keyframes fadeInOut {
  0% {
    opacity: 0;
  }

  10% {
    opacity: 1;
  }

  90% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
}


.input-area {
  position: relative;
  padding: 12px 20px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 12px;
}
</style>