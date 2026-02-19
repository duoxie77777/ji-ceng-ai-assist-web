<template>
  <div class="chat-page">
    <!-- 侧边栏 -->
    <Sidebar
      :conversations="chatStore.conversations"
      :activeConvId="chatStore.activeConvId"
      @conversation-selected="chatStore.switchConversation"
    />
    <!-- 聊天框 -->
    <ChatArea
      :activeConversation="chatStore.activeConversation"
      @toggle-detail="chatStore.showDetailPanel = !chatStore.showDetailPanel"
    />
    <!-- 详细信息，默认不显示 -->
    <DetailPanel
      v-if="chatStore.showDetailPanel && chatStore.activeConversation"
      :activeUser="chatStore.activeConversation?.participant || null"
      :attachments="activeAttachments"
      @close-panel="chatStore.showDetailPanel = false"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted,ref } from 'vue';
import { useChatStore } from '@/store/modules/chatStrore';  
import Sidebar from './components/Sidebar.vue';
import ChatArea from './components/ChatArea.vue';
import DetailPanel from './components/DetailPanel.vue';
import type { Attachment } from './utils/chat'; 

const chatStore = useChatStore();

// 定义附件数据
const activeAttachments = ref([
  { id: 'att-1', name: 'Billing issue', type: 'pdf', url: '#' },
  { id: 'att-2', name: 'Purchase order receipt', type: 'pdf', url: '#' },
]);

// 页面挂载时初始化聊天数据
onMounted(() => {
  chatStore.initChatData();
});
</script>

<style scoped>
.chat-page {
  display: flex;
  height: 100%;
  width: 100%;
  background: #fff;
}
</style>