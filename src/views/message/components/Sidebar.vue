<template>
  <div class="sidebar">
    <!-- 侧边栏组件：包含搜索栏、搜索结果、会话列表 -->
    <div class="search-bar">
      <input type="text" v-model="searchKeyword" :placeholder="UI_TEXT.SEARCH_PLACEHOLDER"  @input="handleSearch"
        @clear="chatStore.clearSearch()" />
      <button v-if="searchKeyword" @click="chatStore.clearSearch()">
        <svg-icon name="cuo" size="16" />
      </button>
      <button v-else>
        <svg-icon name="sousuo" size="26" />
      </button>
    </div>

    <!-- 搜索结果 -->
    <div v-if="chatStore.searchKeyword" class="search-results">
      <div v-if="chatStore.searchResults.length === 0" class="no-results">
        {{noResultText}}
      </div>
      <!-- 搜索结果列表项：区分会话/消息类型 -->
      <div v-else class="result-item" v-for="(result, index) in chatStore.searchResults" :key="index"
        :class="{ 'highlight-active': highlightIndex === index }" @click="handleResultClick(result, index)">

        <div v-if="result.type === SEARCH_RESULT_TYPE.CONVERSATION" class="conv-result">
          <div class="result-type">联系人</div>
          <div class="result-content" v-html="result.matchText"></div>
        </div>

        <div v-if="result.type === SEARCH_RESULT_TYPE.MESSAGE" class="msg-result">
          <div class="result-type">消息 · {{ result.conversationName }}</div>
          <div class="result-content" v-html="result.matchText"></div>
          <div class="result-time">{{ formatTime(result.timestamp, 'sidebar') }}</div>
        </div>
      </div>
    </div>

    <!-- 会话列表 -->
    <div v-else class="conversations-list">
      <!-- 会话项：展示头像、名称、最后消息、时间、未读数 -->
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
import { ref, computed, onUnmounted } from 'vue';
import { useChatStore } from '@/views/message/utils/chatStrore';
import { 
  UI_TEXT, 
  LAYOUT_CONST, 
  SEARCH_RESULT_TYPE,
  formatTime,
  type SearchResult 
} from '../utils/chat';

const chatStore = useChatStore();

// 搜索关键词：双向绑定仓库中的搜索词
const searchKeyword = computed({
  get: () => chatStore.searchKeyword,
  set: (val) => chatStore.searchKeyword = val,
});
// 搜索结果高亮索引（点击后短暂高亮）
const highlightIndex = ref(-1);
let highlightTimer: NodeJS.Timeout | null = null;

// 无搜索结果文本：动态替换关键词占位符
const noResultText = computed(() => {
  return UI_TEXT.NO_SEARCH_RESULT.replace('{{keyword}}', chatStore.searchKeyword);
});

// 处理搜索输入：触发仓库的搜索方法
const handleSearch = () => {
  chatStore.searchChats(searchKeyword.value);
};

// 处理搜索结果点击：选中结果并添加短暂高亮
const handleResultClick = (result: SearchResult, index: number) => {
  if (highlightTimer) clearTimeout(highlightTimer);
  highlightIndex.value = index;
  chatStore.selectSearchResult(result);
  highlightTimer = setTimeout(() => {
    highlightIndex.value = -1;
  }, LAYOUT_CONST.HIGHLIGHT_ACTIVE_DURATION); // 复用常量
};

onUnmounted(() => {
  if (highlightTimer) clearTimeout(highlightTimer);
});

</script>

<style scoped lang="less">
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
  border: 1px solid var(--gray-200); 
  border-radius: 18px;
  font-size: 14px;
  outline: none;
}

.search-bar input:focus {
  border-color: var(--blue-500); 
}

.search-bar button {
  position: absolute;
  right: 24px;
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: var(--gray-600); 
}

.search-bar button:first-of-type {
  left: 24px;
  right: auto;
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

.result-item {
  padding: 12px 8px;
  border-bottom: 1px solid var(--gray-100); 
  cursor: pointer;
}

.result-item:hover {
  background: var(--gray-50); 
  border-radius: 8px;
}

.highlight-active {
  background-color: var(--blue-500) !important; 
  color: var(--white) !important;                
  border-radius: 8px;
}

.highlight-active .result-type,
.highlight-active .result-time {
  color: var(--blue-50) !important; 
}

.highlight-active .highlight {
  color: var(--white) !important;  
  font-weight: 700;
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

.sidebar {
  width: 350px;
  border-right: 1px solid var(--gray-200);
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
  background: var(--blue-50);
}

.conversation-item:hover {
  background: var(--gray-50);
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
  text-align: center;
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
</style>