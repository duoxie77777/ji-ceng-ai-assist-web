<template>
  <div class="stats-row">
    <div class="stat-card">
      <div class="stat-icon today">
        <el-icon><Calendar /></el-icon>
      </div>
      <div class="stat-content">
        <div class="stat-value">{{ todayMeetings }}</div>
        <div class="stat-label">今日会议</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon week">
        <el-icon><DataLine /></el-icon>
      </div>
      <div class="stat-content">
        <div class="stat-value">{{ weekMeetings }}</div>
        <div class="stat-label">本周会议</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon duration">
        <el-icon><Timer /></el-icon>
      </div>
      <div class="stat-content">
        <div class="stat-value">{{ totalHours }}h</div>
        <div class="stat-label">本周时长</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon participants">
        <el-icon><User /></el-icon>
      </div>
      <div class="stat-content">
        <div class="stat-value">{{ totalParticipants }}</div>
        <div class="stat-label">参会人次</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Calendar, DataLine, Timer, User } from '@element-plus/icons-vue'

defineProps<{
  todayMeetings: number
  weekMeetings: number
  totalHours: number
  totalParticipants: number
}>()
</script>

<style scoped lang="less">
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;

  .stat-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    background: var(--white);
    border-radius: 8px;
    border: 1px solid var(--gray-200);
    transition: all 0.2s ease;

    &:hover {
      border-color: var(--gray-300);
    }

    .stat-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 8px;
      font-size: 18px;

      &.today {
        background: var(--gray-100);
        color: var(--gray-700);
      }

      &.week {
        background: var(--gray-100);
        color: var(--gray-700);
      }

      &.duration {
        background: var(--gray-100);
        color: var(--gray-700);
      }

      &.participants {
        background: var(--gray-100);
        color: var(--gray-700);
      }
    }

    .stat-content {
      flex: 1;

      .stat-value {
        font-size: 22px;
        font-weight: 600;
        color: var(--gray-900);
        line-height: 1.2;
      }

      .stat-label {
        font-size: 12px;
        color: var(--gray-500);
        margin-top: 2px;
      }
    }
  }
}
</style>
