<template>
  <div class="ppt-wrapper">
    <PPTHeader />
    <div class="ppt-main">
      <PPTThumbnails />
      <PPTContent />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import PPTHeader from './pptHeader/index.vue'
import PPTThumbnails from './pptThumbnails/index.vue'
import PPTContent from './pptContent/index.vue'
import { usePPTStore } from './store'

const store = usePPTStore()

onMounted(() => {
  store.initHistory()
})
</script>

<style scoped lang="scss">
.ppt-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: var(--gray-100);
}

.ppt-main {
  flex: 1;
  display: flex;
  overflow: hidden;
}
</style>
