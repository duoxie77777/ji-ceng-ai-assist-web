<template>
  <div class="enforcement-card">
    <div class="stat-section">
      <div class="section-header">
        <span class="header-dot"></span>
        <h3>正在审查</h3>
        <span class="data-time">数据时间：{{ currentDateTime }}</span>
      </div>
      <div class="stats-dual">
        <div class="stat-block">
          <div class="stat-number">{{ pendingCount }}</div>
          <div class="stat-label">待审查</div>
        </div>
      </div>
    </div>
    <div class="stat-section">
      <div class="section-header">
        <span class="header-dot"></span>
        <h3>完成审查</h3>
        <span class="data-time">数据时间：{{ currentDateTime }}</span>
      </div>
      <div class="stats-dual">
        <div class="stat-block">
          <div class="stat-number">{{ completedCount }}</div>
          <div class="stat-label">已完成</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useHomeStore } from '../utils/store'
import { useApprovalStore } from '@/store/modules/services/approval'

const homeStore = useHomeStore()
const approvalStore = useApprovalStore()
const currentDateTime = homeStore.currentDateTime
const pendingCount = computed(() => approvalStore.pendingCount)
const completedCount = computed(() => approvalStore.completedCount)
</script>

<style scoped>
.enforcement-card {
  padding: 20px;
  border-radius: 8px;
  background: var(--white);
  border: 1px solid var(--gray-200);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stat-section {
  width: 100%;
}

.section-header {
  display: flex;
  align-items: baseline;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 8px;
}

.header-dot {
  width: 3px;
  height: 16px;
  background: var(--blue-500);
  border-radius: 2px;
}

h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: var(--gray-900);
}

.data-time {
  font-size: 12px;
  color: var(--gray-500);
  margin-left: auto;
}

.stats-dual {
  display: flex;
  justify-content: space-around;
  gap: 16px;
}

.stat-block {
  flex: 1;
  text-align: center;
  background: var(--gray-50);
  border-radius: 8px;
  padding: 16px 12px;
  border: 1px solid var(--gray-100);
}

.stat-number {
  font-size: 32px;
  font-weight: 600;
  color: var(--blue-500);
  line-height: 1;
}

.stat-label {
  font-size: 13px;
  color: var(--gray-600);
  margin-top: 6px;
}

.stat-section:last-child .stat-number {
  color: var(--green-500);
}
</style>