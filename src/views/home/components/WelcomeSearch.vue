<template>
  <div class="welcome-card glass-card">
    <h1>欢迎使用工作台</h1>
    <div class="search-container">
      <el-input v-model="search" placeholder="请输入您想搜索的内容" :prefix-icon="Search" clearable @keyup.enter="handleSearch" />
    </div>
    <div class="search-tip">
      <span>常用搜索：</span>
      <a v-for="tag in commonSearches" :key="tag" href="javascript:;" @click="searchTag(tag)">{{ tag }}</a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useHomeStore } from '../utils/store'

const store = useHomeStore()
const search = ref('')
const commonSearches = store.commonSearches

const handleSearch = () => {
  if (search.value.trim()) {
    ElMessage.info(`搜索：${search.value}`)
  }
}
const searchTag = (tag: string) => {
  search.value = tag
  handleSearch()
}
</script>

<style scoped>
.welcome-card {
  padding: 20px 24px;
}

h1 {
  font-size: 26px;
  font-weight: 700;
  color: var(--gray-900);
  margin: 0 0 16px 0;
}

.search-container {
  margin-bottom: 12px;
}

.search-container :deep(.el-input__wrapper) {
  border-radius: 40px;
  background: var(--white);
  padding: 8px 16px;
  box-shadow: 0 0 0 1px var(--gray-200) inset;
}

.search-container :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px var(--blue-500) inset;
}

.search-tip {
  font-size: 14px;
  color: var(--gray-600);
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.search-tip a {
  color: var(--blue-500);
  text-decoration: none;
  padding: 4px 12px;
  background: rgba(51, 112, 255, 0.1);
  border-radius: 20px;
  transition: background 0.2s;
}

.search-tip a:hover {
  background: rgba(51, 112, 255, 0.2);
}
</style>