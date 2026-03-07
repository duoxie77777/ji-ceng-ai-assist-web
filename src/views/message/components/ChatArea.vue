<template>
  <div class="chat-area">
    <div class="chat-header">
      <div class="user-info">
        <img :src="activeConversation?.participant.avatar" class="avatar" />
        <div>
          <h3>{{ activeConversation?.participant.name || '未知联系人' }}</h3>
        </div>
      </div>
      <div class="header-actions">
          <button @click="toggleDetailPanel"><svg-icon size="26" name="ren" /></button>
      </div>
    </div>

    <div class="messages-container" ref="messagesContainer">
      <div v-if="!activeConversation || groupedMessages.length === 0" class="empty-message">
        暂无聊天记录，开始聊聊吧～
      </div>

      <div v-else>
        <div v-for="group in groupedMessages" :key="group.date" class="message-group">
          <div class="date-divider">{{ group.date }}</div>
          <div v-for="msg in group.messages" :key="msg.id" :data-msg-id="msg.id" :class="[
            'message',
            msg.isOwn ? 'own' : 'other',
            msg.id === chatStore.highlightMsgId ? 'msg-flash' : ''
          ]">
            <div class="message-bubble">
              <div class="sender-name" v-if="!msg.isOwn">{{ msg.senderName }}</div>

              <div v-if="msg.type === 'text'" class="text-content">
                {{ msg.content }}
              </div>

              <div v-if="msg.type === 'file'">
                <div v-if="msg.fileInfo?.isImage" class="image-content" @click="previewImage(msg.fileInfo.url)">
                  <img :src="msg.fileInfo.url" :alt="msg.fileInfo.name" class="preview-img" loading="lazy" />
                </div>

                <div v-else class="file-content" @click="downloadFile(msg)">
                  <span class="file-icon"><i class="icon">&#xe68f;</i></span>
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
    <div v-if="previewImageUrl" class="image-preview-mask" @click="previewImageUrl = ''">
      <img :src="previewImageUrl" alt="预览图片" class="preview-mask-img" @click.stop />
    </div>

    <div class="input-area">
      <div class="attach-wrapper" ref="attachWrapperRef">
        <button class="attach-btn" @click="toggleAttachMenu">
          <svg-icon name="jia" size="26" />
        </button>
        <div v-if="showAttachMenu" class="attach-menu">
          <div class="menu-item" @click="triggerFileInput">
            <svg-icon name="wenjian-" size="22" class="menu-icon" />
            <span class="menu-text">文件</span>
          </div>
        </div>
      </div>

      <input ref="fileInputRef" type="file" class="file-input" @change="handleFileUpload" accept="*" />

      <input type="text" v-model="newMessage" placeholder="Write your message..." @keyup.enter="sendMessage" />
      
      <div class="input-actions">
        <button @click="sendMessage" class="send-btn">
          <svg-icon name="send-message" size="26" />
        </button>
      </div>
      
      <div v-if="showEmptyTip" class="empty-tip">发送消息不能为空</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, computed, onMounted, onUnmounted } from 'vue';
import { useChatStore } from '@/views/message/utils/chatStrore';
import type { Conversation, Message } from '../utils/chat';

const chatStore = useChatStore();
const newMessage = ref('');
const messagesContainer = ref<HTMLElement | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);
const previewImageUrl = ref('');
const showEmptyTip = ref(false);
const highlightMsgId = ref('');
let highlightTimer: NodeJS.Timeout | null = null;
let tipTimer: NodeJS.Timeout | null = null;

const showAttachMenu = ref(false);
const attachWrapperRef = ref<HTMLElement | null>(null);

const previewImage = (url: string) => {
  previewImageUrl.value = url;
  document.body.style.overflow = 'hidden';
};

watch(previewImageUrl, (val) => {
  if (!val) {
    document.body.style.overflow = 'auto';
  }
});

const props = defineProps<{
  activeConversation: Conversation | null;
}>();

const emit = defineEmits<{
  'toggle-detail': [];
}>();

const groupedMessages = computed(() => chatStore.groupedMessages);

watch([() => props.activeConversation, () => groupedMessages.value], () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
}, { immediate: true });

const formatTime = (iso: string) => {
  const d = new Date(iso);
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')} ${d.getHours() >= 12 ? 'pm' : 'am'}`;
};

const formatFileSize = (bytes: number) => {
  return chatStore.formatFileSize(bytes);
};

const sendMessage = () => {
  const trimedMsg = newMessage.value.trim();
  if (!trimedMsg) {
    showEmptyTip.value = true;
    if (tipTimer) clearTimeout(tipTimer);
    tipTimer = setTimeout(() => {
      showEmptyTip.value = false;
    }, 3000);
    return; 
  }
  chatStore.sendMessage(trimedMsg);
  newMessage.value = '';
  showEmptyTip.value = false;
  if (tipTimer) clearTimeout(tipTimer);

  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

watch(newMessage, (val) => {
  if (val.trim() && showEmptyTip.value) {
    showEmptyTip.value = false;
    if (tipTimer) clearTimeout(tipTimer);
  }
});

const toggleAttachMenu = () => {
  showAttachMenu.value = !showAttachMenu.value;
};

const triggerFileInput = () => {
  if (fileInputRef.value) {
    fileInputRef.value.click();
  }
  showAttachMenu.value = false;
};

const handleFileUpload = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    chatStore.sendFileMessage(file);
    target.value = '';
    nextTick(() => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
      }
    });
  }
};

const downloadFile = (msg: Message) => {
  if (!msg.fileInfo || !msg.fileInfo.url) return;

  const a = document.createElement('a');
  a.href = msg.fileInfo.url;
  a.download = msg.fileInfo.name || '下载文件';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

const toggleDetailPanel = () => {
  emit('toggle-detail');
};

const scrollToTargetMessage = (conversationId: string, content: string, msgId?: string) => {
  if (chatStore.activeConvId !== conversationId) return;

  nextTick(() => {
    if (!messagesContainer.value) return;

    const msgElements = messagesContainer.value.querySelectorAll('.message');
    let targetElement: HTMLElement | null = null;

    if (msgId) {
      targetElement = messagesContainer.value.querySelector(`.message[data-msg-id="${msgId}"]`) as HTMLElement;
    } else {
      msgElements.forEach(el => {
        const textContent = el.querySelector('.text-content')?.textContent?.trim() || '';
        const fileName = el.querySelector('.file-name')?.textContent?.trim() || '';

        if (textContent === content || fileName === content) {
          targetElement = el as HTMLElement;
        }
      });
    }

    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });

      if (highlightTimer) clearTimeout(highlightTimer);
      highlightMsgId.value = targetElement.getAttribute('data-msg-id') || '';

      highlightTimer = setTimeout(() => {
        highlightMsgId.value = '';
      }, 1000);
    }
  });
};

const handleClickOutside = (e: MouseEvent) => {
  if (attachWrapperRef.value && !attachWrapperRef.value.contains(e.target as Node)) {
    showAttachMenu.value = false;
  }
};

onMounted(() => {
  const handleScrollToMessage = (e: CustomEvent) => {
    const { conversationId, content, msgId } = e.detail;
    scrollToTargetMessage(conversationId, content, msgId);
  };

  window.addEventListener('scrollToMessage', handleScrollToMessage as EventListener);
  document.addEventListener('click', handleClickOutside);

  onUnmounted(() => {
    window.removeEventListener('scrollToMessage', handleScrollToMessage as EventListener);
    document.removeEventListener('click', handleClickOutside);
  });
});
</script>

<style scoped>
.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
  height: 100%;
  min-height: 0;
}

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

.empty-message {
  text-align: center;
  padding: 40px 0;
  color: #9ca3af;
  font-size: 14px;
}

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

.message {
  display: flex;
  margin-bottom: 8px;
  transition: background-color 0.2s ease;
}

@keyframes highlightFade {
  0% {
    background-color: #1e40af;
    opacity: 1;
  }

  100% {
    background-color: transparent;
    border-color: transparent;
  }
}

.msg-flash .message-bubble {
  animation: highlightFade 1s ease-out forwards;
  border: 2px solid #1e40af;
  background-color: #1e40af !important;
}

.msg-flash .text-content,
.msg-flash .sender-name,
.msg-flash .timestamp,
.msg-flash .read-status {
  color: white !important;
  font-weight: 600;
  animation: none !important;
}

.message-highlight {
  background-color: #fffbeb;
  border-radius: 8px;
  padding: 4px;
}

.msg-highlight .message-bubble {
  background-color: #1e40af !important;
  color: white !important;
}

.msg-highlight.own .message-bubble {
  background-color: #1e40af !important;
}

.msg-highlight.other .message-bubble {
  background-color: #1e40af !important;
}

.msg-highlight .text-content,
.msg-highlight .sender-name,
.msg-highlight .timestamp,
.msg-highlight .read-status {
  color: white !important;
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

.icon {
  font-size: 18px;
  color: #666;
}

.input-area {
  padding: 12px 20px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
}

.attach-wrapper {
  position: relative;
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
  transition: background-color 0.2s;
}

.attach-btn:hover {
  background: #e5e7eb;
}

.attach-menu {
  position: absolute;
  bottom: 42px; 
  left: 0;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 8px 0;
  width: 120px;
  z-index: 100;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
}

.menu-item:hover {
  background: #f3f4f6;
}

.menu-icon {
  display: inline-block;
  width: 22px;
  height: 22px;
}

.menu-text {
  flex: 1;
}

.file-input {
  display: none;
}

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

</style>