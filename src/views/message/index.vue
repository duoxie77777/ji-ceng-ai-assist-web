<template>
  <div class="chat-page">
    <Sidebar :conversations="chatStore.conversations" :activeConvId="chatStore.activeConvId"
      @conversation-selected="chatStore.switchConversation" />
    <ChatArea :activeConversation="chatStore.activeConversation"
      @toggle-detail="chatStore.showDetailPanel = !chatStore.showDetailPanel" />
    <DetailPanel v-if="chatStore.showDetailPanel && chatStore.activeConversation"
      :activeUser="chatStore.activeConversation?.participant || null" :attachments="activeAttachments"
      @close-panel="chatStore.showDetailPanel = false" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useChatStore } from './utils/chatStrore';
import Sidebar from './components/Sidebar.vue';
import ChatArea from './components/ChatArea.vue';
import DetailPanel from './components/DetailPanel.vue';
import { FileType } from '@/views/message/utils/type';

// 初始化聊天状态
const route = useRoute();
const chatStore = useChatStore();

const activeAttachments = ref([
  { id: 'att-1', name: 'Billing issue', type: FileType.PDF, url: '#' },
  { id: 'att-2', name: 'Purchase order receipt', type: FileType.PDF, url: '#' },
]);

onMounted(async () => {
  await chatStore.initChatData();
  // 处理通讯录跳转过来的 friendId
  const friendId = route.query.friendId as string;
  if (friendId) {
    await chatStore.activateOrCreateConversation(friendId);
  }
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