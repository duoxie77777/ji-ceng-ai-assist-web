<template>
  <div class="document-page">
    <!-- 顶部 -->
    <header>
      <documentHeader />
    </header>

    <!-- 中间：侧边栏 + 主内容 -->
    <div class="document-body">
      <aside>
        <documentAside />
      </aside>
      <main>
        <documentContent />
      </main>
    </div>
  </div>
</template>

<script lang="ts" setup>
import documentHeader from './components/documentHeader/index.vue';
import documentContent from './components/documentContent/index.vue';
import documentAside from './components/documentAside/index.vue';
</script>

<style scoped lang="less">
.document-page {
  max-width: 100%;
  height: 100%;
  background: var(--white);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

header {
  width: 100%;
  height: 60px;
  box-shadow: inset 0 -1px 2px -1px var(--gray-200);
  flex-shrink: 0;
}

.document-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

aside {
  width: 240px;
  flex-shrink: 0;
  overflow-y: auto;
  box-shadow: inset -1px 0 2px -1px var(--gray-200);
}

main {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}
</style>