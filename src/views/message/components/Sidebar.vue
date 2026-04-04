<template>
  <div class="sidebar">
    <!-- 搜索框 -->
    <div class="search-bar">
      <input type="text" v-model="searchKeyword" :placeholder="UI_TEXT.SEARCH_PLACEHOLDER" @input="handleSearch" />
      <button v-if="searchKeyword" @click="chatStore.clearSearch()">
        <svg-icon name="cuo" size="16" />
      </button>
      <button v-else>
        <svg-icon name="sousuo" size="26" />
      </button>
    </div>

    <!-- 搜索结果列表 -->
    <div v-if="chatStore.searchKeyword" class="search-results">
      <div v-if="chatStore.searchResults.length === 0" class="no-results">
        {{ noResultText }}
      </div>
      <div v-else class="result-item" v-for="result in chatStore.searchResults"
        :key="result.conversationId + result.msgId" @click="handleResultClick(result)">
        <div v-if="result.type === SearchResultType.CONVERSATION" class="conv-result">
          <div class="result-type">联系人</div>
          <div class="result-content" v-html="result.matchText"></div>
        </div>
        <div v-if="result.type === SearchResultType.MESSAGE" class="msg-result">
          <div class="result-type">消息 · {{ result.conversationName }}</div>
          <div class="result-content" v-html="result.matchText"></div>
          <div class="result-time">{{ formatTime(result.timestamp, 'sidebar') }}</div>
        </div>
      </div>
    </div>

    <!-- 会话列表 -->
    <div v-else class="conversations-list">
      <div v-for="conversation in chatStore.conversations" :key="conversation.id"
        :class="['conversation-item', { active: conversation.id === chatStore.activeConvId }]"
        @click="chatStore.switchConversation(conversation.id)"
        @contextmenu.prevent="showDeleteMenu(conversation.id, $event)">
        <el-avatar :size="48" :src="conversation.participant.avatar || defaultAvatar" class="avatar">
          {{ getAvatarText(conversation.participant.name) }}
        </el-avatar>
        <div class="conversation-info">
          <div class="name">{{ conversation.participant.name || '未知用户' }}</div>
          <div class="last-message">{{ conversation.lastMessage || '暂无消息' }}</div>
        </div>
        <div class="conversation-meta">
          <div class="time">{{ formatTime(conversation.lastMessageTime, 'sidebar') }}</div>
          <div v-if="conversation.unreadCount > 0" class="unread-badge">
            {{ conversation.unreadCount }}
          </div>
        </div>
      </div>
      <div v-if="chatStore.conversations.length === 0" class="empty-state">
        <el-empty description="暂无会话" :image-size="80" />
      </div>
    </div>

    <!-- 右键菜单 -->
    <div v-if="contextMenuVisible" class="context-menu" :style="{ top: contextMenuY + 'px', left: contextMenuX + 'px' }"
      @click.stop="hideContextMenu">
      <div class="context-menu-item" @click="handleDelete">
        <el-icon><Delete /></el-icon>
        <span>删除会话</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Delete } from '@element-plus/icons-vue'
import { useChatStore } from '@/views/message/utils/chatStrore'
import { SearchResultType } from '@/views/message/utils/type'
import { UI_TEXT, formatTime } from '@/views/message/utils/chat'

const chatStore = useChatStore()

const defaultAvatar = 'https://cube.elemecdn.com/0/88/03b01d2d5f2b9e2e7d5f8e2e7d5f8e2e.png'

// 右键菜单状态
const contextMenuVisible = ref(false)
const contextMenuX = ref(0)
const contextMenuY = ref(0)
const currentDeleteId = ref<number | null>(null)

const getAvatarText = (name: string) => {
  if (!name) return ''
  const match = name.match(/[A-Za-z0-9\u4e00-\u9fa5]/)
  return match ? match[0].toUpperCase() : ''
}

const searchKeyword = computed({
  get: () => chatStore.searchKeyword,
  set: (val) => { chatStore.searchKeyword = val }
})

const noResultText = computed(() => UI_TEXT.NO_SEARCH_RESULT)

const handleSearch = () => {
  // chatStore.searchChats(searchKeyword.value)
}

const handleResultClick = (result: any) => {
  chatStore.switchConversation(result.conversationId)
  chatStore.searchKeyword = ''
}

const showDeleteMenu = (id: number, event: MouseEvent) => {
  currentDeleteId.value = id
  contextMenuX.value = event.clientX
  contextMenuY.value = event.clientY
  contextMenuVisible.value = true
  
  const hideHandler = () => {
    hideContextMenu()
    document.removeEventListener('click', hideHandler)
  }
  document.addEventListener('click', hideHandler)
}

const hideContextMenu = () => {
  contextMenuVisible.value = false
  currentDeleteId.value = null
}

const handleDelete = () => {
  if (currentDeleteId.value) {
    chatStore.deleteConversation(currentDeleteId.value)
  }
  hideContextMenu()
}

// 点击其他地方关闭菜单
const closeMenuOnBodyClick = () => {
  if (contextMenuVisible.value) {
    hideContextMenu()
  }
}

// 监听全局点击事件
import { onMounted, onUnmounted } from 'vue'
onMounted(() => {
  document.addEventListener('click', closeMenuOnBodyClick)
})
onUnmounted(() => {
  document.removeEventListener('click', closeMenuOnBodyClick)
})
</script>

<style scoped lang="scss">
.sidebar {
  width: 350px;
  border-right: 1px solid var(--gray-200);
  padding: 16px 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--white);
}

.search-bar {
  position: relative;
  display: flex;
  align-items: center;
  padding: 0 16px;
  margin-bottom: 16px;

  input {
    width: 100%;
    padding: 10px 36px;
    border: 1px solid var(--gray-200);
    border-radius: 18px;
    font-size: 14px;
    outline: none;

    &:focus {
      border-color: var(--blue-500);
    }
  }

  button {
    position: absolute;
    right: 24px;
    background: none;
    border: none;
    font-size: 16px;
    cursor: pointer;
    color: var(--gray-600);

    &:first-of-type {
      left: 24px;
      right: auto;
    }
  }
}

.search-results {
  padding: 0 16px;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
}

.no-results {
  padding: 20px 0;
  color: var(--gray-400);
  text-align: center;
  font-size: 14px;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 0;
}

.conversations-list {
  flex: 1;
  overflow-y: auto;
}

.conversation-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--gray-50);
  }

  &.active {
    background-color: var(--blue-50);
  }

  .avatar {
    flex-shrink: 0;
    margin-right: 12px;
  }

  .conversation-info {
    flex: 1;
    min-width: 0;

    .name {
      font-weight: 500;
      color: var(--gray-800);
      margin-bottom: 4px;
      font-size: 14px;
    }

    .last-message {
      font-size: 13px;
      color: var(--gray-500);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .conversation-meta {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-left: 8px;

    .time {
      font-size: 12px;
      color: var(--gray-400);
      white-space: nowrap;
    }

    .unread-badge {
      background-color: var(--red-500);
      color: white;
      font-size: 11px;
      padding: 1px 5px;
      border-radius: 10px;
      min-width: 16px;
      text-align: center;
    }

    .delete-btn {
      opacity: 0;
      visibility: hidden;
      transition: all 0.2s;
      color: var(--gray-400);
      padding: 2px;
      min-width: auto;
      width: auto;
      height: auto;
      
      &:hover {
        color: var(--red-500);
      }
    }
  }

  .conversation-item:hover .delete-btn {
    opacity: 1;
    visibility: visible;
  }
}

.result-item {
  padding: 12px 8px;
  border-bottom: 1px solid var(--gray-100);
  cursor: pointer;

  &:hover {
    background: var(--gray-50);
    border-radius: 8px;
  }
}

.result-type {
  font-size: 12px;
  color: var(--gray-400);
  margin-bottom: 4px;
}

.result-content {
  font-size: 14px;
  line-height: 1.4;
}

.highlight {
  color: var(--blue-500);
  font-weight: 600;
}

.msg-result .result-time {
  font-size: 11px;
  color: var(--gray-400);
  margin-top: 4px;
}

.conversations-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 16px;
}

.conversation-item {
  display: flex;
  align-items: center;
  padding: 12px 8px;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 8px;

  &.active {
    background: var(--blue-50);
  }

  &:hover {
    background: var(--gray-50);
  }
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-right: 12px;
  object-fit: cover;
}

.conversation-info {
  flex: 1;
  overflow: hidden;
}

.name {
  font-weight: 600;
  font-size: 15px;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.last-message {
  font-size: 13px;
  color: var(--gray-600);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.conversation-meta {
  text-align: right;
}

.time {
  font-size: 11px;
  color: var(--gray-400);
  margin-bottom: 4px;
}

.unread-badge {
  background: var(--blue-500);
  color: var(--white);
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 10px;
}

// 右键菜单样式
.context-menu {
  position: fixed;
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 4px 0;
  z-index: 9999;
  min-width: 120px;

  .context-menu-item {
    padding: 8px 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: var(--gray-700);

    &:hover {
      background-color: var(--gray-100);
      color: var(--red-500);
    }

    .el-icon {
      font-size: 14px;
    }
  }
}
</style>