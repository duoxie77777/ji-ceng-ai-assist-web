<template>
  <div class="chat-area">
    <!-- 聊天头部：展示联系人信息和操作按钮 -->
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

    <!-- 消息展示容器：按日期分组展示消息列表 -->
    <div class="messages-container" ref="messagesContainer">
      <div v-if="!activeConversation || groupedMessages.length === 0" class="empty-message">
        {{ STATUS_TEXT.EMPTY_MESSAGE }}
      </div>

      <div v-else>
        <div v-for="group in groupedMessages" :key="group.date" class="message-group">
          <div class="date-divider">{{ group.date }}</div>
          <!-- 单条消息：区分自己/对方，支持文本/文件类型 -->
          <div v-for="msg in group.messages" :key="msg.id" :data-msg-id="msg.id" :class="[
            'message',
            msg.isOwn ? 'own' : 'other',
            msg.id === chatStore.highlightMsgId ? CSS_CLASS_NAME.MSG_FLASH : ''
          ]">
            <div class="message-bubble">

              <!-- 对方消息显示发送者名称 -->
              <div class="sender-name" v-if="!msg.isOwn">{{ msg.senderName }}</div>

              <div v-if="msg.type === MESSAGE_TYPE.TEXT" class="text-content">
                {{ msg.content }}
              </div>
              <!-- 文件类型消息：区分图片/普通文件 -->
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

              <!-- 消息底部：时间戳 + 已读/未读状态 -->
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

      <!-- 输入区域：文本输入、文件上传、发送按钮 -->
      <input ref="fileInputRef" type="file" class="file-input" @change="handleFileUpload" accept="*" />
      <input type="text" v-model="newMessage" :placeholder="UI_TEXT.MESSAGE_PLACEHOLDER" @keyup.enter="sendMessage" />
      <div class="input-actions">
        <button @click="sendMessage" class="send-btn">
          <svg-icon name="send-message" size="26" />
        </button>
      </div>
      <!-- 空消息提示 -->
      <div v-if="showEmptyTip" class="empty-tip">{{ STATUS_TEXT.EMPTY_MESSAGE_TIP }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, computed, onMounted, onUnmounted } from 'vue';
import { useChatStore } from '@/views/message/utils/chatStrore';
import type { Conversation, Message } from '../utils/chat';
import {
  STATUS_TEXT,
  MESSAGE_TYPE,
  formatTime,
  LAYOUT_CONST,
  CSS_CLASS_NAME,
  UI_TEXT
} from '../utils/chat';

// 状态管理
const chatStore = useChatStore();
// 新消息输入内容
const newMessage = ref('');
// 消息容器DOM引用（用于滚动到底部）
const messagesContainer = ref<HTMLElement | null>(null);
// 文件选择器DOM引用
const fileInputRef = ref<HTMLInputElement | null>(null);
// 预览图片URL
const previewImageUrl = ref('');
// 空消息提示显示状态
const showEmptyTip = ref(false);
// 附件菜单显示状态
const showAttachMenu = ref(false);
// 附件菜单容器DOM引用（用于点击外部关闭）
const attachWrapperRef = ref<HTMLElement | null>(null);

// 存储生成的ObjectURL，用于卸载时释放
const createdFileUrls = ref<string[]>([]);

// 预览图片：打开遮罩层展示大图
const previewImage = (url: string) => {
  previewImageUrl.value = url;
  document.body.style.overflow = 'hidden';
};
// 监听图片预览状态：关闭时恢复页面滚动
watch(previewImageUrl, (val) => {
  if (!val) {
    document.body.style.overflow = 'auto';
  }
});
// 组件Props：当前激活的会话
const props = defineProps<{
  activeConversation: Conversation | null;
}>();
// 组件事件：触发侧边栏切换
const emit = defineEmits<{
  'toggle-detail': [];
}>();

// 计算属性：按日期分组后的消息列表
const groupedMessages = computed(() => chatStore.groupedMessages);

// 监听会话/消息变化：自动滚动到底部
watch([() => props.activeConversation, () => groupedMessages.value], () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
}, { immediate: true });


const formatFileSize = (bytes: number) => {
  return chatStore.formatFileSize(bytes);
};

// 发送文本消息：校验内容 -> 调用store发送 -> 清空输入 -> 滚动到底部
const sendMessage = () => {
  const trimedMsg = newMessage.value.trim();
  if (!trimedMsg) {
    showEmptyTip.value = true;
    setTimeout(() => {
      showEmptyTip.value = false;
    }, LAYOUT_CONST.TIP_DISAPPEAR_TIME);
    return;
  }
  chatStore.sendMessage(trimedMsg);
  newMessage.value = '';
  showEmptyTip.value = false;

  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

// 监听输入内容：输入非空时关闭空提示
watch(newMessage, (val) => {
  if (val.trim() && showEmptyTip.value) {
    showEmptyTip.value = false;
  }
});

// 切换附件菜单显示/隐藏
const toggleAttachMenu = () => {
  showAttachMenu.value = !showAttachMenu.value;
};

const triggerFileInput = () => {
  fileInputRef.value?.click();
  showAttachMenu.value = false;
};

// 处理文件上传：获取文件 -> 调用store发送 -> 清空选择框 -> 滚动到底部
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

const toggleDetailPanel = () => {
  emit('toggle-detail');
};

// 滚动到指定消息位置：通过ID/内容定位 -> 平滑滚动 -> 高亮消息
const scrollToTargetMessage = (conversationId: string, content: string, msgId?: string) => {
  if (chatStore.activeConvId !== conversationId) return;

  nextTick(() => {
    if (!messagesContainer.value) return;

    const targetElement = msgId
      ? messagesContainer.value.querySelector(`.message[data-msg-id="${msgId}"]`) as HTMLElement
      : Array.from(messagesContainer.value.querySelectorAll('.message')).find(el => {
        const textContent = el.querySelector('.text-content')?.textContent?.trim() || '';
        const fileName = el.querySelector('.file-name')?.textContent?.trim() || '';
        return textContent === content || fileName === content;
      }) as HTMLElement;

    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });

      chatStore.setSingleMsgHighlight(msgId || '');
    }
  });
};

const handleClickOutside = (e: MouseEvent) => {
  if (attachWrapperRef.value && !attachWrapperRef.value.contains(e.target as Node)) {
    showAttachMenu.value = false;
  }
};

const handleScrollToMessage = (e: CustomEvent) => {
  const { conversationId, content, msgId } = e.detail;
  scrollToTargetMessage(conversationId, content, msgId);
};

onMounted(() => {
  window.addEventListener('scrollToMessage', handleScrollToMessage as EventListener);
  document.addEventListener('click', handleClickOutside);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && previewImageUrl.value) {
      previewImageUrl.value = '';
    }
  });
});

onUnmounted(() => {
  window.removeEventListener('scrollToMessage', handleScrollToMessage as EventListener);
  document.removeEventListener('click', handleClickOutside);
  // 释放所有生成的ObjectURL，避免内存泄漏
  createdFileUrls.value.forEach(url => {
    URL.revokeObjectURL(url);
  });
  createdFileUrls.value = [];
});
</script>

<style scoped lang="less">
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
  color: var(--gray-900);
}

.last-seen {
  font-size: 13px;
  color: var(--gray-600);
}

.header-actions {
  display: flex;
  gap: 12px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.header-actions {
  button {
    background: none;
    border: none;
    font-size: 16px;
    cursor: pointer;
    color: var(--color-text-secondary);
  }
}

// 消息容器
.messages-container {
  flex: 1;
  padding: 16px 20px;
  overflow-y: auto;
  background: var(--color-bg-page);
}

// 空状态提示
.empty-message {
  text-align: center;
  padding: 40px 0;
  color: var(--color-text-placeholder);
  font-size: 14px;
}

// 消息分组
.message-group {
  margin-bottom: 16px;
}

// 时间分割线
.date-divider {
  text-align: center;
  font-size: 12px;
  color: var(--color-text-placeholder);
  margin: 8px 0;
  padding: 4px 0;
  background: var(--color-bg-light);
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

// 消息高亮闪烁状态
.msg-flash {
  & .message-bubble {
    animation: highlightFade 1s ease-out forwards;
    border: 2px solid #1e40af !important;
    background-color: #1e40af !important;
  }

  & .text-content,
  & .sender-name,
  & .timestamp,
  & .read-status {
    color: #ffffff !important;
    font-weight: 600;
    animation: none !important;
  }
}

// 消息高亮普通状态（非闪烁）
.message-highlight {
  background-color: #fffbeb; // 浅黄背景，突出显示
  border-radius: 8px;
  padding: 4px;
}

// 基础消息容器样式（适配主题变量）
.message-container {
  flex: 1;
  padding: var(--spacing-md, 16px) var(--spacing-lg, 20px);
  overflow-y: auto;
  background: var(--color-bg-page, #f9fafb);
}

// 消息分组样式
.message-group {
  margin-bottom: var(--spacing-lg, 20px);

  & .date-divider {
    text-align: center;
    font-size: 12px;
    color: var(--color-text-placeholder, #9ca3af);
    margin: 8px 0;
  }
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
}

.timestamp {
  font-size: 11px;
  color: var(--gray-600);
}

.read-status {
  font-size: 10px;
  color: var(--gray-600);
}

.file-content {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 0;
}

// 文件图标
.file-icon {
  font-size: 18px;
  color: var(--blue-500);
}

// 文件信息容器
.file-info {
  flex: 1;
}

// 文件名
.file-name {
  font-size: 14px;
  color: var(--mint-500);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

// 文件大小
.file-size {
  font-size: 12px;
  color: var(--gray-600);
}

// 通用图标
.icon {
  font-size: 18px;
  color: var(--gray-600);
}

// 输入区域（聊天底部）
.input-area {
  padding: 12px 20px;
  border-top: 1px solid var(--gray-200);
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
}

.attach-wrapper {
  position: relative;
}

// 文件附件按钮样式（适配主题变量）
:export {
  // 基础颜色变量（对应你的全局 theme 变量）
  --attach-btn-bg: #f3f4f6; // 按钮默认背景色
  --attach-btn-hover: #e5e7eb; // 按钮 hover 背景色
  --menu-bg: #fff; // 菜单背景色
  --menu-shadow: rgba(0, 0, 0, 0.1); // 菜单阴影色
  --menu-text: #333; // 菜单文字色
}

// 附件按钮样式
.attach-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  // 使用主题背景色变量
  background-color: var(--attach-btn-bg);
  border: none;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

// 按钮 hover 样式
.attach-btn:hover {
  // 使用主题 hover 背景色变量
  background-color: var(--attach-btn-hover);
}

// 附件菜单容器
.attach-menu {
  position: absolute;
  bottom: 42px;
  left: 0;
  // 使用主题背景色变量
  background-color: var(--menu-bg);
  border-radius: 8px;
  box-shadow: 0 2px 10px var(--menu-shadow);
  padding: 8px 0;
  width: 120px;
  z-index: 100;
}

// 菜单项样式
.menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  // 使用主题文字色变量
  color: var(--menu-text);
}

.menu-item:hover {
  background: var(--gray-50);
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
  border: 1px solid var(--gray-200);
  border-radius: 20px;
  font-size: 14px;
  outline: none;
}

.input-area input[type="text"]:focus {
  border-color: var(--blue-500);
}

.input-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

// 输入区域动作按钮（如表情、附件等）
.input-actions button {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: var(--gray-600);
}

// 发送按钮（核心样式）
.send-btn {
  background: var(--blue-500) !important;
  color: var(--white) !important;
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

// 输入区域动作按钮（如表情、附件等）
.input-actions button {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: var(--gray-600);
}

// 发送按钮（核心样式）
.send-btn {
  background: var(--blue-500) !important;
  color: var(--white) !important;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
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
}

.preview-mask-img {
  max-width: 90%;
  max-height: 90%;
  // 关键：保持图片原始宽高比，完整显示
  object-fit: contain;
  border-radius: 8px;
}
</style>