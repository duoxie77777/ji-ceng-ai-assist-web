<template>
  <div class="coverage-card glass-card">
    <div class="card-header">
      <span class="header-dot"></span>
      <h3>近30天事项类型分布</h3>
      <span class="date-range">2026.03.01 - 2026.03.30</span>
    </div>
    <div class="coverage-list">
      <div v-for="item in typeDistribution" :key="item.label" class="coverage-item">
        <div class="item-label">
          <span class="color-dot" :style="{ backgroundColor: item.color }"></span>
          <span>{{ item.label }}</span>
        </div>
        <div class="item-value">
          <span class="count">{{ item.count }}件</span>
          <span class="percent">{{ item.percent }}%</span>
        </div>
      </div>
    </div>
    <div class="total-bar">
      <div v-for="item in typeDistribution" :key="item.label" class="bar-segment"
        :style="{ width: item.percent + '%', backgroundColor: item.color }"></div>
    </div>
    <div class="ai-tip">
      <el-icon>
        <ChatDotRound />
      </el-icon>
      <span>AI预测：下周民政服务事项预计增长12%，请提前安排人手。</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChatDotRound } from '@element-plus/icons-vue'
import { useHomeStore } from '../utils/store'

const homeStore = useHomeStore()
const typeDistribution = homeStore.typeDistribution
</script>

<style scoped>
.ai-tip {
  margin-top: 16px;
  padding: 8px 12px;
  background: var(--blue-50);
  border-radius: 8px;
  font-size: 12px;
  color: var(--blue-700);
  display: flex;
  align-items: center;
  gap: 8px;
}

.coverage-card {
  padding: 20px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: var(--shadow-md);
}

.card-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 8px;
}

.header-dot {
  width: 4px;
  height: 18px;
  background: var(--blue-500);
  border-radius: 2px;
  margin-right: 8px;
}

h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: var(--gray-900);
}

.date-range {
  font-size: 13px;
  color: var(--gray-500);
}

.coverage-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.coverage-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 15px;
}

.item-label {
  display: flex;
  align-items: center;
  gap: 12px;
}

.color-dot {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.item-value {
  display: flex;
  gap: 24px;
}

.count {
  font-weight: 600;
  color: var(--gray-800);
}

.percent {
  color: var(--gray-600);
}

.total-bar {
  margin-top: 20px;
  display: flex;
  height: 10px;
  border-radius: 5px;
  overflow: hidden;
}

.bar-segment {
  height: 100%;
  transition: width 0.3s;
}
</style>