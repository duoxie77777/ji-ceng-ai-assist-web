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
  gap: 16px;

  .stat-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    background: var(--white);
    border-radius: 12px;
    border: 1px solid var(--gray-200);
    transition: all 0.2s ease;

    &:hover {
      box-shadow: var(--shadow-md);
      transform: translateY(-2px);
    }

    .stat-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      border-radius: 12px;
      font-size: 22px;

      &.today {
        background: var(--blue-100);
        color: var(--blue-500);
      }

      &.week {
        background: var(--green-50);
        color: var(--green-500);
      }

      &.duration {
        background: rgba(94, 76, 175, 0.1);
        color: var(--purple-500);
      }

      &.participants {
        background: var(--red-50);
        color: var(--red-500);
      }
    }

    .stat-content {
      flex: 1;

      .stat-value {
        font-size: 26px;
        font-weight: 700;
        color: var(--gray-900);
        line-height: 1.2;
      }

      .stat-label {
        font-size: 13px;
        color: var(--gray-500);
        margin-top: 4px;
      }
    }
  }
}
</style>
