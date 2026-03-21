<template>
  <div class="chat-page">
    <!-- 侧边栏（会话列表） -->
    <Sidebar :conversations="chatStore.conversations" :activeConvId="chatStore.activeConvId"
      @conversation-selected="chatStore.switchConversation" />
    <!-- 聊天区域 -->
    <ChatArea :activeConversation="chatStore.activeConversation"
      @toggle-detail="chatStore.showDetailPanel = !chatStore.showDetailPanel" />
    <!-- 联系人详情面板 -->
    <DetailPanel v-if="chatStore.showDetailPanel && chatStore.activeConversation"
      :activeUser="chatStore.activeConversation?.participant || null" :attachments="activeAttachments"
      @close-panel="chatStore.showDetailPanel = false" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useChatStore } from '@/views/message/utils/chatStrore';
import Sidebar from './components/Sidebar.vue';
import ChatArea from './components/ChatArea.vue';
import DetailPanel from './components/DetailPanel.vue';
import  { FILE_TYPE } from './utils/chat';

// 初始化聊天状态
const chatStore = useChatStore();

// 模拟附件数据
const activeAttachments = ref([
  { id: 'att-1', name: 'Billing issue', type: FILE_TYPE.PDF, url: '#' },
  { id: 'att-2', name: 'Purchase order receipt', type: FILE_TYPE.PDF, url: '#' },
]);

// 页面挂载时初始化聊天数据
onMounted(() => {
  chatStore.initChatData();
});
</script>

<style scoped lang="less">
.chat-page {
  display: flex;
  height: 100%;
  width: 100%;
  background: var(--white);
}
</style>