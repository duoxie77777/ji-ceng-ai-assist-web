<template>
  <div class="func-card">
    <div class="card-header">
      <span class="header-dot"></span>
      <h3>常用功能</h3>
    </div>
    <div class="func-grid">
      <div v-for="func in functions" :key="func.name" class="func-item" @click="handleFuncClick(func.name)">
        <div class="func-icon">
          <span v-if="func.name.includes('视频')">
            <svg-icon name="Videocam" size="24" />
          </span>
          <span v-else-if="func.name.includes('会议')">
            <svg-icon name="huiyizhongxin" size="24" />
          </span>
          <span v-else-if="func.name.includes('文档')">
            <svg-icon name="zaixianwendang1" size="24" />
          </span>
          <span v-else-if="func.name.includes('任务')">
            <svg-icon name="zhibi" size="24" />
          </span>
          <span v-else-if="func.name.includes('消息')">
            <svg-icon name="yunduo" size="24" />
          </span>
          <span v-else-if="func.name.includes('审批')">
            <svg-icon name="notepad__easy" size="24" />
          </span>
          <span v-else-if="func.name.includes('AI')">
            <svg-icon name="jiqiren" size="24" />
          </span>
          <span v-else>
            <svg-icon name="yingyongzhongxin1" size="24" />
          </span>
        </div>
        <span class="func-name">{{ func.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useHomeStore } from '../utils/store'
import { FUNC_ROUTE_MAP } from '../utils/constants'

const router = useRouter()
const store = useHomeStore()
const functions = store.functions

const handleFuncClick = (name: string) => {
  const path = FUNC_ROUTE_MAP[name]
  if (path) {
    router.push(path)
  } else {
    ElMessage.info(`${name} 功能开发中`)
  }
}
</script>

<style scoped>
.func-card {
  padding: 20px;
  border-radius: 8px;
  background: var(--white);
  border: 1px solid var(--gray-200);
  min-height: 280px;
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.header-dot {
  width: 3px;
  height: 16px;
  background: var(--blue-500);
  border-radius: 2px;
  margin-right: 8px;
}

h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: var(--gray-900);
}

.func-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.func-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px 8px;
  border-radius: 8px;
  background: var(--gray-50);
  border: 1px solid var(--gray-100);
  color: var(--gray-700);
  transition: all 0.2s;
  cursor: pointer;
}

.func-item:hover {
  background: var(--gray-100);
  border-color: var(--gray-200);
  color: var(--blue-500);
}

.func-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.func-name {
  font-size: 13px;
  font-weight: 400;
  text-align: center;
}
</style>