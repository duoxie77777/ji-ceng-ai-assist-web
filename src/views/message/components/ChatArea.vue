<template>
  <div class="chat-area">
    <!-- 聊天头部 -->
    <div class="chat-header">
      <div class="user-info">
        <img :src="activeConversation?.participant.avatar" class="avatar" />
        <div>
          <h3>{{ activeConversation?.participant.name || STATUS_TEXT.UNKNOWN_CONTACT }}</h3>
        </div>
      </div>
      <div class="header-actions">
        <button @click="toggleDetailPanel"><svg-icon size="26" name="ren" /></button>
      </div>
    </div>

    <!-- 消息列表容器 -->
    <div class="messages-container" ref="messagesContainer">
      <div v-if="!activeConversation || groupedMessages.length === 0" class="empty-message">
        {{ STATUS_TEXT.EMPTY_MESSAGE }}
      </div>
      <div v-else>
        <div v-for="group in groupedMessages" :key="group.date" class="message-group">
          <div class="date-divider">{{ group.date }}</div>
          <div v-for="msg in group.messages" :key="msg.id" :data-msg-id="msg.id"
            :class="['message', msg.isOwn ? 'own' : 'other', { 'msg-flash': msg.id === chatStore.highlightMsgId }]"
            @animationend="onMessageAnimationEnd(msg.id)">
            <div class="message-bubble">
              <div v-if="!msg.isOwn" class="sender-name">{{ msg.senderName }}</div>
              <div v-if="msg.type === MESSAGE_TYPE.TEXT" class="text-content">{{ msg.content }}</div>
              <div v-if="msg.type === MESSAGE_TYPE.FILE">
                <div v-if="msg.fileInfo?.isImage" class="image-content" @click="previewImage(msg.fileInfo.url)">
                  <img :src="msg.fileInfo.url" :alt="msg.fileInfo.name" class="preview-img" loading="lazy" />
                </div>
                <div v-else class="file-content" @click="downloadFile(msg)">
                  <span class="file-icon"><i class="icon">&#xe68f;</i></span>
                  <div class="file-info">
                    <div class="file-name">{{ msg.fileInfo?.name || STATUS_TEXT.UNKNOWN_FILE }}</div>
                    <div class="file-size">{{ formatFileSize(msg.fileInfo?.size || 0) }}</div>
                  </div>
                </div>
              </div>
              <div class="message-footer">
                <span class="timestamp">{{ formatTime(msg.timestamp) }}</span>
                <span v-if="msg.isOwn" class="read-status">
                  {{ msg.isRead ? STATUS_TEXT.READ : STATUS_TEXT.UNREAD }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 图片预览遮罩层 -->
    <div v-if="previewImageUrl" class="image-preview-mask" @click="closePreview">
      <img :src="previewImageUrl" alt="预览图片" class="preview-mask-img" @click.stop />
    </div>

    <!-- 输入区域 -->
    <div class="input-area">
      <div class="attach-wrapper" ref="attachWrapperRef">
        <button class="attach-btn" @click="toggleAttachMenu"><svg-icon name="jia" size="26" /></button>
        <div v-if="showAttachMenu" class="attach-menu">
          <div class="menu-item" @click="triggerFileInput">
            <svg-icon name="wenjian-" size="22" class="menu-icon" />
            <span class="menu-text">文件</span>
          </div>
        </div>
      </div>

      <input ref="fileInputRef" type="file" class="file-input" @change="handleFileUpload"
        accept="image/*,application/pdf,application/msword" />
      <input type="text" v-model="newMessage" :placeholder="UI_TEXT.MESSAGE_PLACEHOLDER" @keyup.enter="sendMessage" />
      <div class="input-actions">
        <button @click="sendMessage" class="send-btn"><svg-icon name="send-message" size="26" /></button>
      </div>

      <!-- 空消息提示（CSS 动画自动消失） -->
      <div v-if="showEmptyTip" class="empty-tip" @animationend="showEmptyTip = false">
        {{ STATUS_TEXT.EMPTY_MESSAGE_TIP }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, computed, onMounted, onUnmounted } from 'vue'
import { useChatStore } from '@/views/message/utils/chatStrore'
import type { Conversation, Message } from '@/views/message/utils/chat'
import { MessageType as MESSAGE_TYPE, GlobalEvent } from '@/views/message/utils/type'
import { UI_TEXT, STATUS_TEXT, formatTime, formatFileSize } from '@/views/message/utils/chat'

const chatStore = useChatStore()

const newMessage = ref('')
const messagesContainer = ref<HTMLElement | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const previewImageUrl = ref('')
const showEmptyTip = ref(false)
const showAttachMenu = ref(false)
const attachWrapperRef = ref<HTMLElement | null>(null)

const props = defineProps<{ activeConversation: Conversation | null }>()
const emit = defineEmits<{ 'toggle-detail': [] }>()

const groupedMessages = computed(() => chatStore.groupedMessages)

const onMessageAnimationEnd = (msgId: string) => {
  if (chatStore.highlightMsgId === msgId) {
    chatStore.clearMessageHighlight()
  }
}
const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

watch([() => props.activeConversation, () => groupedMessages.value], () => {
  scrollToBottom()
}, { immediate: true })

const sendMessage = () => {
  if (!newMessage.value.trim()) {
    showEmptyTip.value = true
    return
  }
  chatStore.sendMessage(newMessage.value)
  newMessage.value = ''
}

const triggerFileInput = () => {
  fileInputRef.value?.click()
  showAttachMenu.value = false
}

const handleFileUpload = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    chatStore.sendFileMessage(target.files[0])
    target.value = ''
    scrollToBottom()
  }
}

const downloadFile = (msg: Message) => {
  if (!msg.fileInfo?.url) return
  const a = document.createElement('a')
  a.href = msg.fileInfo.url
  a.download = msg.fileInfo.name || '下载文件'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

const previewImage = (url: string) => {
  previewImageUrl.value = url
  document.body.style.overflow = 'hidden'
}
const closePreview = () => {
  previewImageUrl.value = ''
  document.body.style.overflow = 'auto'
}

const toggleDetailPanel = () => emit('toggle-detail')
const handleClickOutside = (e: MouseEvent) => {
  if (attachWrapperRef.value && !attachWrapperRef.value.contains(e.target as Node)) {
    showAttachMenu.value = false
  }
}
const toggleAttachMenu = () => { showAttachMenu.value = !showAttachMenu.value }

const handleScrollToMessage = (e: CustomEvent) => {
  const { conversationId, msgId } = e.detail
  if (chatStore.activeConvId !== conversationId) return
  nextTick(() => {
    if (!messagesContainer.value) return
    const targetEl = messagesContainer.value.querySelector(`.message[data-msg-id="${msgId}"]`) as HTMLElement
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  })
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && previewImageUrl.value) {
    closePreview()
  }
}

onMounted(() => {
  window.addEventListener(GlobalEvent.SCROLL_TO_MESSAGE, handleScrollToMessage as EventListener)
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener(GlobalEvent.SCROLL_TO_MESSAGE, handleScrollToMessage as EventListener)
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped lang="scss">
.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--white);
  height: 100%;
  min-height: 0;
}

.chat-header {
  padding: 12px 20px;
  border-bottom: 1px solid var(--gray-200);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;

  .avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    margin-right: 12px;
    object-fit: cover;
  }

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--gray-900);
  }
}

.header-actions button {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--gray-600);
}

.messages-container {
  flex: 1;
  padding: 16px 20px;
  overflow-y: auto;
  background: var(--gray-50);
}

.empty-message {
  text-align: center;
  padding: 40px 0;
  color: var(--gray-400);
  font-size: 14px;
}

.message-group {
  margin-bottom: 16px;
}

.date-divider {
  text-align: center;
  font-size: 12px;
  color: var(--gray-400);
  margin: 8px 0;
  padding: 4px 0;
  background: var(--gray-100);
  border-radius: 4px;
}

.message {
  display: flex;
  margin-bottom: 8px;

  &.own {
    justify-content: flex-end;
  }

  &.other {
    justify-content: flex-start;
  }
}

.message-bubble {
  max-width: 70%;
  padding: 10px 14px;
  border-radius: 18px;
  font-size: 14px;
  line-height: 1.5;
}

.message.other .message-bubble {
  background: var(--blue-200);
  border-bottom-left-radius: 4px;
}

.message.own .message-bubble {
  background: var(--blue-50);
  border-bottom-right-radius: 4px;
}

.sender-name {
  font-weight: 600;
  margin-bottom: 4px;
  font-size: 13px;
  color: var(--blue-900);
}

.message-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;

  .timestamp {
    font-size: 11px;
    color: var(--gray-600);
  }

  .read-status {
    font-size: 10px;
    color: var(--gray-600);
  }
}

.file-content {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 0;
}

.file-info {
  flex: 1;

  .file-name {
    font-size: 14px;
    color: var(--blue-600);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .file-size {
    font-size: 12px;
    color: var(--gray-600);
  }
}

.image-content {
  cursor: zoom-in;
  max-width: 200px;
  border-radius: 8px;
  overflow: hidden;

  .preview-img {
    width: 100%;
    height: auto;
    border-radius: 8px;
    transition: transform 0.2s;

    &:hover {
      transform: scale(1.02);
    }
  }
}

.image-preview-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;

  .preview-mask-img {
    max-width: 90%;
    max-height: 90%;
    object-fit: contain;
    border-radius: 8px;
  }
}

.input-area {
  padding: 12px 20px;
  border-top: 1px solid var(--gray-200);
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;

  input[type="text"] {
    flex: 1;
    padding: 10px 16px;
    border: 1px solid var(--gray-200);
    border-radius: 20px;
    font-size: 14px;
    outline: none;

    &:focus {
      border-color: var(--blue-500);
    }
  }
}

.attach-wrapper {
  position: relative;

  .attach-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--gray-100);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      background: var(--gray-200);
    }
  }

  .attach-menu {
    position: absolute;
    bottom: 42px;
    left: 0;
    background: var(--white);
    border-radius: 8px;
    box-shadow: var(--shadow-md);
    padding: 8px 0;
    width: 120px;
    z-index: 100;

    .menu-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      cursor: pointer;
      font-size: 14px;
      color: var(--gray-800);

      &:hover {
        background: var(--gray-50);
      }
    }
  }
}

.file-input {
  display: none;
}

.input-actions .send-btn {
  background: var(--blue-500);
  color: var(--white);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-tip {
  position: absolute;
  bottom: 60px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  animation: fadeOut 2s forwards;
  pointer-events: none;
}

@keyframes fadeOut {
  0% {
    opacity: 1;
  }

  70% {
    opacity: 1;
  }

  100% {
    opacity: 0;
    visibility: hidden;
  }
}


@keyframes highlightFlash {
  0% {
    background-color: var(--blue-500);
    border-color: var(--blue-500);
    opacity: 1;
  }

  70% {
    background-color: var(--blue-500);
    border-color: var(--blue-500);
    opacity: 0.9;
  }

  100% {}
}

.msg-flash .message-bubble {
  animation: highlightFlash 0.8s ease-out forwards;
}
</style>