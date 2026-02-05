<template>
  <div class="meeting-page">
    <!-- 顶部操作栏 - 突出创建和加入会议 -->
    <header class="meeting-header">
      <div class="header-left">
        <h1 class="page-title">
          <span class="title-icon">
            <el-icon><VideoCamera /></el-icon>
          </span>
          会议中心
        </h1>
      </div>
      
      <!-- 核心操作区域 - 更加突出 -->
      <div class="header-actions">
        <div class="action-card create" @click="showCreateDialog = true">
          <div class="action-icon">
            <el-icon><Plus /></el-icon>
          </div>
          <div class="action-info">
            <span class="action-title">发起会议</span>
            <span class="action-desc">创建新的视频会议</span>
          </div>
        </div>
        <div class="action-card join" @click="showJoinDialog = true">
          <div class="action-icon">
            <el-icon><Link /></el-icon>
          </div>
          <div class="action-info">
            <span class="action-title">加入会议</span>
            <span class="action-desc">通过会议号加入</span>
          </div>
        </div>
      </div>
    </header>

    <!-- 主体内容 -->
    <div class="meeting-body">
      <!-- 左侧主区域 -->
      <div class="meeting-main">
        <!-- 统计卡片 -->
        <MeetingStats 
          :today-meetings="todayMeetings"
          :week-meetings="weekMeetings"
          :total-hours="totalHours"
          :total-participants="totalParticipants"
        />

        <!-- 日历 -->
        <MeetingCalendar 
          :meetings="meetings"
          v-model:view-mode="viewMode"
          @view-meeting="viewMeeting"
        />
      </div>

      <!-- 右侧边栏 -->
      <MeetingSidebar 
        :upcoming-meetings="upcomingMeetings"
        :recent-meetings="recentMeetings"
        @join="joinMeeting"
        @view="viewMeeting"
        @schedule="showCreateDialog = true"
        @instant="startInstantMeeting"
        @join-by-id="showJoinDialog = true"
        @recordings="showRecordings"
      />
    </div>

    <!-- 弹窗 -->
    <CreateMeetingDialog 
      v-model:visible="showCreateDialog"
      @created="onMeetingCreated"
    />
    <JoinMeetingDialog 
      v-model:visible="showJoinDialog"
      @joined="onMeetingJoined"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { VideoCamera, Plus, Link } from '@element-plus/icons-vue'
import MeetingStats from './components/MeetingStats.vue'
import MeetingCalendar from './components/MeetingCalendar.vue'
import MeetingSidebar from './components/MeetingSidebar.vue'
import CreateMeetingDialog from './components/CreateMeetingDialog.vue'
import JoinMeetingDialog from './components/JoinMeetingDialog.vue'

// 视图模式
const viewMode = ref('week')

// 弹窗控制
const showCreateDialog = ref(false)
const showJoinDialog = ref(false)

// 统计数据
const todayMeetings = ref(3)
const weekMeetings = ref(12)
const totalHours = ref(18)
const totalParticipants = ref(56)

// 模拟会议数据
const today = new Date().toISOString().split('T')[0] as string
const meetings = ref([
  {
    id: '1',
    title: '产品周会',
    type: 'important',
    date: today,
    startTime: '09:00',
    endTime: '10:30',
    duration: 1.5,
    participants: 8
  },
  {
    id: '2',
    title: '技术评审会',
    type: 'normal',
    date: today,
    startTime: '14:00',
    endTime: '15:00',
    duration: 1,
    participants: 5
  },
  {
    id: '3',
    title: '新员工培训',
    type: 'training',
    date: today,
    startTime: '16:00',
    endTime: '17:30',
    duration: 1.5,
    participants: 12
  }
])

// 即将开始的会议
const upcomingMeetings = ref([
  {
    id: '1',
    title: '产品周会',
    type: 'important',
    startTime: '09:00',
    participants: 8,
    countdown: '15分钟'
  },
  {
    id: '2',
    title: '技术评审会',
    type: 'normal',
    startTime: '14:00',
    participants: 5,
    countdown: '5小时'
  }
])

// 最近会议
const recentMeetings = ref([
  { id: '1', title: '产品需求评审', type: 'important', date: '今天 09:00', duration: 45, status: 'completed' },
  { id: '2', title: '技术方案讨论', type: 'normal', date: '昨天 14:00', duration: 60, status: 'completed' },
  { id: '3', title: '项目进度同步', type: 'normal', date: '昨天 10:00', duration: 30, status: 'completed' },
  { id: '4', title: '客户需求沟通', type: 'important', date: '前天 15:00', duration: 90, status: 'completed' }
])

// 会议操作
const viewMeeting = (meeting: any) => {
  ElMessage.info(`查看会议: ${meeting.title}`)
}

const joinMeeting = (meeting: any) => {
  ElMessage.success(`正在加入会议: ${meeting.title}`)
}

const onMeetingCreated = (data: any) => {
  console.log('会议已创建:', data)
}

const onMeetingJoined = (data: any) => {
  console.log('加入会议:', data)
}

const startInstantMeeting = () => {
  ElMessage.success('即时会议已创建，正在加入...')
}

const showRecordings = () => {
  ElMessage.info('会议录制功能开发中...')
}
</script>

<style scoped lang="less">
.meeting-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--gray-50);
  overflow: hidden;
}

// 顶部操作栏
.meeting-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 32px;
  background: var(--white);
  border-bottom: 1px solid var(--gray-200);

  .header-left {
    .page-title {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0;
      font-size: 22px;
      font-weight: 600;
      color: var(--gray-900);

      .title-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border-radius: 10px;
        background: var(--blue-500);
        color: white;
        font-size: 20px;
      }
    }
  }

  // 核心操作卡片 - 更加突出
  .header-actions {
    display: flex;
    gap: 16px;

    .action-card {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 16px 24px;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.25s ease;
      min-width: 200px;

      &.create {
        background: var(--blue-500);
        color: white;
        box-shadow: 0 4px 12px rgba(51, 112, 255, 0.3);

        &:hover {
          background: var(--blue-600);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(51, 112, 255, 0.4);
        }

        .action-icon {
          background: rgba(255, 255, 255, 0.2);
        }

        .action-desc {
          color: rgba(255, 255, 255, 0.8);
        }
      }

      &.join {
        background: var(--white);
        border: 2px solid var(--blue-500);
        color: var(--blue-500);

        &:hover {
          background: var(--blue-50);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(51, 112, 255, 0.15);
        }

        .action-icon {
          background: var(--blue-100);
          color: var(--blue-500);
        }

        .action-title {
          color: var(--gray-900);
        }

        .action-desc {
          color: var(--gray-500);
        }
      }

      .action-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 44px;
        height: 44px;
        border-radius: 10px;
        font-size: 22px;
      }

      .action-info {
        display: flex;
        flex-direction: column;
        gap: 2px;

        .action-title {
          font-size: 16px;
          font-weight: 600;
        }

        .action-desc {
          font-size: 12px;
        }
      }
    }
  }
}

// 主体内容
.meeting-body {
  flex: 1;
  display: flex;
  padding: 24px;
  gap: 24px;
  overflow: hidden;
}

// 左侧主区域
.meeting-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow: hidden;
}
</style>
