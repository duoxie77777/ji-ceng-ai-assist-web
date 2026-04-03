<template>
  <aside class="meeting-sidebar">
    <!-- 即将开始 -->
    <div class="sidebar-section upcoming">
      <div class="section-header">
        <h3>
          <el-icon><AlarmClock /></el-icon>
          即将开始
        </h3>
        <el-badge :value="upcomingMeetings.length" :max="9" />
      </div>
      <div class="upcoming-list" v-if="upcomingMeetings.length">
        <div 
          v-for="meeting in upcomingMeetings" 
          :key="meeting.id" 
          class="upcoming-card"
          :class="meeting.type"
        >
          <div class="card-countdown">
            <span class="countdown-value">{{ meeting.countdown }}</span>
            <span class="countdown-label">后开始</span>
          </div>
          <div class="card-main">
            <div class="meeting-title">{{ meeting.title }}</div>
            <div class="meeting-meta">
              <span><el-icon><Clock /></el-icon>{{ meeting.startTime }}</span>
              <span><el-icon><User /></el-icon>{{ meeting.participants }}人</span>
            </div>
          </div>
          <el-button type="primary" size="small" @click="$emit('join', meeting)">
            加入
          </el-button>
        </div>
      </div>
      <el-empty v-else description="暂无即将开始的会议" :image-size="60" />
    </div>

    <!-- 最近会议 -->
    <div class="sidebar-section recent">
      <div class="section-header">
        <h3>
          <el-icon><Clock /></el-icon>
          最近会议
        </h3>
        <el-button text size="small">查看全部</el-button>
      </div>
      <div class="recent-list">
        <div 
          v-for="meeting in recentMeetings" 
          :key="meeting.id" 
          class="recent-item"
          @click="$emit('view', meeting)"
        >
          <div class="item-icon" :class="meeting.type">
            <el-icon><VideoCamera /></el-icon>
          </div>
          <div class="item-content">
            <div class="item-title">{{ meeting.title }}</div>
            <div class="item-meta">
              <span>{{ meeting.date }}</span>
              <span>{{ meeting.duration }}分钟</span>
            </div>
          </div>
          <div class="item-status" :class="meeting.status">
            {{ getStatusLabel(meeting.status) }}
          </div>
        </div>
      </div>
    </div>

    <!-- 快捷操作 -->
    <div class="sidebar-section quick-actions">
      <div class="section-header">
        <h3>
          <el-icon><Grid /></el-icon>
          快捷操作
        </h3>
      </div>
      <div class="action-grid">
        <div class="action-item" @click="$emit('schedule')">
          <div class="action-icon schedule">
            <el-icon><Calendar /></el-icon>
          </div>
          <span>预约会议</span>
        </div>
        <div class="action-item" @click="$emit('instant')">
          <div class="action-icon instant">
            <el-icon><VideoCamera /></el-icon>
          </div>
          <span>即时会议</span>
        </div>
        <div class="action-item" @click="$emit('join-by-id')">
          <div class="action-icon join">
            <el-icon><Link /></el-icon>
          </div>
          <span>加入会议</span>
        </div>
        <div class="action-item" @click="$emit('recordings')">
          <div class="action-icon record">
            <el-icon><Film /></el-icon>
          </div>
          <span>会议录制</span>
        </div>
      </div>
    </div>
  </aside>
</template>

<script lang="ts" setup>
import { AlarmClock, Clock, User, VideoCamera, Grid, Calendar, Link, Film } from '@element-plus/icons-vue'

interface UpcomingMeeting {
  id: string
  title: string
  type: string
  startTime: string
  participants: number
  countdown: string
}

interface RecentMeeting {
  id: string
  title: string
  type: string
  date: string
  duration: number
  status: string
}

defineProps<{
  upcomingMeetings: UpcomingMeeting[]
  recentMeetings: RecentMeeting[]
}>()

defineEmits(['join', 'view', 'schedule', 'instant', 'join-by-id', 'recordings'])

const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    completed: '已结束',
    ongoing: '进行中',
    cancelled: '已取消'
  }
  return map[status] || status
}
</script>

<style scoped lang="less">
.meeting-sidebar {
  width: 300px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;

  .sidebar-section {
    background: var(--white);
    border-radius: 8px;
    border: 1px solid var(--gray-200);
    padding: 14px;

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;

      h3 {
        display: flex;
        align-items: center;
        gap: 6px;
        margin: 0;
        font-size: 14px;
        font-weight: 600;
        color: var(--gray-800);
      }
    }
  }

  .upcoming {
    .upcoming-list {
      display: flex;
      flex-direction: column;
      gap: 10px;

      .upcoming-card {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px;
        border-radius: 6px;
        background: var(--gray-50);
        transition: all 0.2s ease;

        &:hover { background: var(--gray-100); }

        &.important {
          background: var(--red-50);
          border: 1px solid rgba(245, 63, 63, 0.15);
        }

        .card-countdown {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 4px 8px;
          background: var(--white);
          border-radius: 6px;
          min-width: 48px;

          .countdown-value {
            font-size: 12px;
            font-weight: 600;
            color: var(--gray-800);
          }

          .countdown-label {
            font-size: 10px;
            color: var(--gray-500);
          }
        }

        .card-main {
          flex: 1;
          min-width: 0;

          .meeting-title {
            font-size: 13px;
            font-weight: 500;
            color: var(--gray-800);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            margin-bottom: 4px;
          }

          .meeting-meta {
            display: flex;
            gap: 10px;
            font-size: 11px;
            color: var(--gray-500);

            span {
              display: flex;
              align-items: center;
              gap: 4px;
            }
          }
        }
      }
    }
  }

  .recent {
    .recent-list {
      display: flex;
      flex-direction: column;

      .recent-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover { background: var(--gray-50); }

        .item-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 6px;
          font-size: 14px;

          &.normal {
            background: var(--gray-100);
            color: var(--gray-600);
          }

          &.important {
            background: var(--gray-100);
            color: var(--gray-600);
          }
        }

        .item-content {
          flex: 1;
          min-width: 0;

          .item-title {
            font-size: 12px;
            font-weight: 500;
            color: var(--gray-800);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .item-meta {
            display: flex;
            gap: 8px;
            font-size: 11px;
            color: var(--gray-500);

            span::after {
              content: '·';
              margin-left: 8px;
            }

            span:last-child::after { display: none; }
          }
        }

        .item-status {
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 4px;

          &.completed {
            background: var(--gray-100);
            color: var(--gray-600);
          }

          &.ongoing {
            background: var(--green-50);
            color: var(--green-500);
          }
        }
      }
    }
  }

  .quick-actions {
    .action-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;

      .action-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        padding: 12px;
        border-radius: 6px;
        background: var(--gray-50);
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          background: var(--gray-100);
        }

        .action-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 6px;
          font-size: 16px;

          &.schedule {
            background: var(--gray-200);
            color: var(--gray-700);
          }

          &.instant {
            background: var(--gray-200);
            color: var(--gray-700);
          }

          &.join {
            background: var(--gray-200);
            color: var(--gray-700);
          }

          &.record {
            background: var(--gray-200);
            color: var(--gray-700);
          }
        }

        span {
          font-size: 12px;
          color: var(--gray-700);
        }
      }
    }
  }
}
</style>
