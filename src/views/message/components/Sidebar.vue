<template>
  <div class="sidebar">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <input type="text" v-model="searchKeyword" placeholder="Search conversations or messages..." @input="handleSearch"
        @clear="chatStore.clearSearch()" />
      <button v-if="searchKeyword" @click="chatStore.clearSearch()">×</button>
      <button v-else>🔍</button>
    </div>

    <!-- 搜索结果（有关键词时显示） -->
    <div v-if="chatStore.searchKeyword" class="search-results">
      <div v-if="chatStore.searchResults.length === 0" class="no-results">
        没有找到 "{{ chatStore.searchKeyword }}" 相关内容
      </div>
      <div v-else class="result-item" v-for="(result, index) in chatStore.searchResults" :key="index"
        @click="chatStore.selectSearchResult(result)">
        <!-- 会话结果 -->
        <div v-if="result.type === 'conversation'" class="conv-result">
          <div class="result-type">联系人</div>
          <div class="result-content" v-html="result.matchText"></div>
        </div>
        <!-- 消息结果 -->
        <div v-if="result.type === 'message'" class="msg-result">
          <div class="result-type">消息 · {{ result.conversationName }}</div>
          <div class="result-content" v-html="result.matchText"></div>
          <div class="result-time">{{ formatTime(result.timestamp) }}</div>
        </div>
      </div>
    </div>

    <!-- 会话列表（无搜索时显示） -->
    <div v-else class="conversations-list">
      <div v-for="conversation in chatStore.conversations" :key="conversation.id"
        :class="['conversation-item', { active: conversation.id === chatStore.activeConvId }]"
        @click="chatStore.switchConversation(conversation.id)">
        <img :src="conversation.participant.avatar" class="avatar" />
        <div class="conversation-info">
          <div class="name">{{ conversation.participant.name }}</div>
          <div class="last-message">{{ conversation.lastMessage }}</div>
        </div>
        <div class="conversation-meta">
          <div class="time">{{ conversation.lastMessageTime }}</div>
          <div v-if="conversation.unreadCount > 0" class="unread-badge">
            {{ conversation.unreadCount }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useChatStore } from '@/store/modules/chatStrore';

const chatStore = useChatStore();
const searchKeyword = computed({
  get: () => chatStore.searchKeyword,
  set: (val) => chatStore.searchKeyword = val,
});

// 处理搜索
const handleSearch = () => {
  chatStore.searchChats(searchKeyword.value);
};

// 格式化消息时间
const formatTime = (iso: string | undefined) => {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
};
</script>

<style scoped>
.search-bar {
  position: relative;
  display: flex;
  align-items: center;
  padding: 0 16px;
  margin-bottom: 16px;
}

.search-bar input {
  width: 100%;
  padding: 10px 36px;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  font-size: 14px;
  outline: none;
}

.search-bar input:focus {
  border-color: #3b82f6;
}

.search-bar button {
  position: absolute;
  right: 24px;
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: #6b7280;
}

.search-bar button:first-of-type {
  left: 24px;
  right: auto;
}

/* 搜索结果 */
.search-results {
  padding: 0 16px;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
}

.no-results {
  padding: 20px 0;
  color: #9ca3af;
  text-align: center;
  font-size: 14px;
}

.result-item {
  padding: 12px 8px;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
}

.result-item:hover {
  background: #f9fafb;
  border-radius: 8px;
}

.result-type {
  font-size: 12px;
  color: #9ca3af;
  margin-bottom: 4px;
}

.result-content {
  font-size: 14px;
  line-height: 1.4;
}

/* 关键词高亮 */
.highlight {
  color: #3b82f6;
  font-weight: 600;
}

.msg-result .result-time {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 4px;
}

/* 原有样式 */
.sidebar {
  width: 350px;
  border-right: 1px solid #e5e7eb;
  padding: 16px 0;
  height: 100%;
  display: flex;
  flex-direction: column;
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
}

.conversation-item.active {
  background: #eff6ff;
}

.conversation-item:hover {
  background: #f9fafb;
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
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.conversation-meta {
  text-align: right;
}

.time {
  font-size: 11px;
  color: #9ca3af;
  margin-bottom: 4px;
}

.unread-badge {
  background: #3b82f6;
  color: white;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 10px;
}
</style>