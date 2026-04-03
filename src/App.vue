<template>
  <router-view v-slot="{ Component }">
    <Suspense>
      <template #default>
        <component :is="Component" />
      </template>
      <template #fallback>
        <div class="global-loading">
          <div class="loading-spinner"></div>
        </div>
      </template>
    </Suspense>
  </router-view>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useThemeStore } from '@/store'

onMounted(() => {
  const themeStore = useThemeStore()
  themeStore.init()
})
</script>

<style scoped lang="less">
.global-loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  // background: rgba(255, 255, 255, 0.8);
  background: linear-gradient(180deg, #e6f0ff 0%, #f0f7ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--gray-200);
  border-top-color: var(--blue-500);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
