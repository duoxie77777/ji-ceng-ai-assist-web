<template>
  <div class="meeting-page">
    <!-- 侧边栏导航 -->
    <div class="meeting-sidebar">
      <div class="sidebar-header">
        <h2>会议中心</h2>
        <p class="subtitle">在线会议平台</p>
      </div>

      <div class="sidebar-nav">
        <div 
          class="nav-item"
          :class="{ active: activeView === 'scheduled' }"
          @click="activeView = 'scheduled'"
        >
          <div class="nav-icon">
            <el-icon><Bell /></el-icon>
          </div>
          <div class="nav-info">
            <span class="nav-label">预定会议</span>
            <span v-if="meetingStore.scheduledCount > 0" class="nav-count">{{ meetingStore.scheduledCount }}</span>
          </div>
        </div>

        <div 
          class="nav-item"
          :class="{ active: activeView === 'ongoing' }"
          @click="activeView = 'ongoing'"
        >
          <div class="nav-icon">
            <el-icon><VideoCamera /></el-icon>
          </div>
          <div class="nav-info">
            <span class="nav-label">进行中</span>
            <span v-if="meetingStore.ongoingCount > 0" class="nav-count status-ongoing">{{ meetingStore.ongoingCount }}</span>
          </div>
        </div>

        <div 
          class="nav-item"
          :class="{ active: activeView === 'history' }"
          @click="activeView = 'history'"
        >
          <div class="nav-icon">
            <el-icon><Document /></el-icon>
          </div>
          <div class="nav-info">
            <span class="nav-label">历史会议</span>
          </div>
        </div>

        <div 
          class="nav-item"
          :class="{ active: activeView === 'calendar' }"
          @click="activeView = 'calendar'"
        >
          <div class="nav-icon">
            <el-icon><Calendar /></el-icon>
          </div>
          <div class="nav-info">
            <span class="nav-label">日历视图</span>
          </div>
        </div>
      </div>

      <div class="sidebar-actions">
        <el-button type="primary" class="action-btn" @click="showCreateDialog = true">
          <el-icon><Plus /></el-icon>
          预定会议
        </el-button>
        <el-button class="action-btn" @click="showJoinDialog = true">
          <el-icon><VideoPlay /></el-icon>
          加入会议
        </el-button>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="meeting-main">
      <!-- 预定会议列表 -->
      <div v-if="activeView === 'scheduled'" class="content-view">
        <div class="view-header">
          <h3>预定会议</h3>
          <span class="view-count">共 {{ scheduledMeetings.length }} 个会议</span>
        </div>

        <div v-if="scheduledMeetings.length === 0" class="empty-state">
          <el-icon :size="64"><Bell /></el-icon>
          <p>暂无预定会议</p>
          <el-button type="primary" @click="showCreateDialog = true">立即预定</el-button>
        </div>

        <div v-for="meeting in scheduledMeetings" :key="meeting.id" class="meeting-card" @click="viewMeeting(meeting)">
          <div class="card-top">
            <div class="time-badge">
              <el-icon><Clock /></el-icon>
              <span>{{ formatMeetingTime(meeting.startTime) }}</span>
            </div>
            <el-tag size="small" v-if="isMeetingSoon(meeting)">即将开始</el-tag>
          </div>
          
          <div class="card-content">
            <h4 class="card-title">{{ meeting.title }}</h4>
            <p v-if="meeting.description" class="card-desc">{{ meeting.description }}</p>
            
            <div class="card-meta">
              <div class="meta-item">
                <el-icon><User /></el-icon>
                <span>{{ meeting.host?.username || '未知' }}</span>
              </div>
              <div class="meta-item">
                <el-icon><User /></el-icon>
                <span>{{ meeting.participants?.length || 0 }}人</span>
              </div>
            </div>
          </div>

          <div class="card-actions">
            <el-button type="primary" size="small" @click.stop="handleStart(meeting)">开始会议</el-button>
            <el-button size="small" @click.stop="handleEdit(meeting)">编辑</el-button>
            <el-button size="small" type="danger" @click.stop="handleCancel(meeting)">取消</el-button>
          </div>
        </div>
      </div>

      <!-- 进行中会议列表 -->
      <div v-if="activeView === 'ongoing'" class="content-view">
        <div class="view-header">
          <h3>进行中会议</h3>
          <span class="view-count">共 {{ ongoingMeetings.length }} 个会议</span>
        </div>

        <div v-if="ongoingMeetings.length === 0" class="empty-state">
          <el-icon :size="64"><VideoCamera /></el-icon>
          <p>暂无进行中会议</p>
          <el-button type="primary" @click="showCreateDialog = true">立即预定</el-button>
        </div>

        <div v-for="meeting in ongoingMeetings" :key="meeting.id" class="meeting-card ongoing" @click="viewMeeting(meeting)">
          <div class="card-top">
            <div class="time-badge">
              <el-icon><Clock /></el-icon>
              <span>{{ formatMeetingTime(meeting.startTime) }}</span>
            </div>
            <el-tag size="small" type="success">进行中</el-tag>
          </div>
          
          <div class="card-content">
            <h4 class="card-title">{{ meeting.title }}</h4>
            <p v-if="meeting.description" class="card-desc">{{ meeting.description }}</p>
            
            <div class="card-meta">
              <div class="meta-item">
                <el-icon><User /></el-icon>
                <span>{{ meeting.host?.username || '未知' }}</span>
              </div>
              <div class="meta-item">
                <el-icon><User /></el-icon>
                <span>{{ meeting.participants?.length || 0 }}人</span>
              </div>
            </div>
          </div>

          <div class="card-actions">
            <el-button type="primary" size="small" @click.stop="handleJoin(meeting)">加入会议</el-button>
          </div>
        </div>
      </div>

      <!-- 历史会议列表 -->
      <div v-if="activeView === 'history'" class="content-view">
        <div class="view-header">
          <h3>历史会议</h3>
          <span class="view-count">共 {{ historyMeetings.length }} 个会议</span>
        </div>

        <div v-if="historyMeetings.length === 0" class="empty-state">
          <el-icon :size="64"><Document /></el-icon>
          <p>暂无历史会议</p>
        </div>

        <div v-for="meeting in historyMeetings" :key="meeting.id" class="meeting-card history" @click="viewMeeting(meeting)">
          <div class="card-top">
            <div class="time-badge">
              <el-icon><Clock /></el-icon>
              <span>{{ formatMeetingTime(meeting.startTime) }}</span>
            </div>
            <el-tag size="small" type="info">已结束</el-tag>
          </div>
          
          <div class="card-content">
            <h4 class="card-title">{{ meeting.title }}</h4>
            <p v-if="meeting.description" class="card-desc">{{ meeting.description }}</p>
            
            <div class="card-meta">
              <div class="meta-item">
                <el-icon><User /></el-icon>
                <span>{{ meeting.host?.username || '未知' }}</span>
              </div>
              <div class="meta-item">
                <el-icon><User /></el-icon>
                <span>{{ meeting.participants?.length || 0 }}人</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="historyMeetings.length > 0" class="pagination-wrapper">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="historyTotal"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>

      <!-- 日历视图 -->
      <div v-if="activeView === 'calendar'" class="calendar-view">
        <div class="calendar-header">
          <div class="calendar-nav">
            <el-button :icon="ArrowLeft" circle @click="prevMonth" />
            <h3 class="calendar-title">{{ currentYear }}年 {{ currentMonth + 1 }}月</h3>
            <el-button :icon="ArrowRight" circle @click="nextMonth" />
            <el-button size="small" @click="goToToday">今天</el-button>
          </div>
        </div>

        <div class="calendar-grid">
          <div class="calendar-weekdays">
            <div v-for="day in weekDays" :key="day" class="weekday">{{ day }}</div>
          </div>
          <div class="calendar-dates">
            <div 
              v-for="day in calendarDays" 
              :key="day.date"
              class="calendar-day"
              :class="{ 
                'other-month': !day.isCurrentMonth,
                'is-today': day.isToday,
                'has-meeting': day.meetings.length > 0
              }"
              @click="selectDate(day)"
            >
              <div class="day-number">{{ day.day }}</div>
              <div class="day-meetings">
                <div 
                  v-for="meeting in day.meetings.slice(0, 3)" 
                  :key="meeting.id"
                  class="meeting-tag"
                  :class="getMeetingStatusClass(meeting)"
                  :title="meeting.title"
                  @click.stop="viewMeeting(meeting)"
                >
                  {{ meeting.title }}
                </div>
                <div v-if="day.meetings.length > 3" class="more-meetings">
                  +{{ day.meetings.length - 3 }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 选中日期的会议列表 -->
        <div v-if="selectedDateMeetings.length > 0" class="selected-date-meetings">
          <h4 class="meetings-title">
            <el-icon><Calendar /></el-icon>
            {{ selectedDateStr }} 的会议 ({{ selectedDateMeetings.length }})
          </h4>
          <div class="meetings-list">
            <div 
              v-for="meeting in selectedDateMeetings" 
              :key="meeting.id"
              class="meeting-item"
              @click="viewMeeting(meeting)"
            >
              <div class="meeting-time">
                <el-icon><Clock /></el-icon>
                {{ formatTimeOnly(meeting.startTime) }}
              </div>
              <div class="meeting-info">
                <div class="meeting-title">{{ meeting.title }}</div>
                <div class="meeting-participants">
                  <el-icon><User /></el-icon>
                  {{ meeting.participants?.length || 0 }}人
                </div>
              </div>
              <el-tag 
                size="small" 
                :type="getMeetingStatusType(meeting)"
              >
                {{ getMeetingStatusText(meeting) }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>
    </div>

    <CreateMeetingDialog 
      v-model="showCreateDialog" 
      @success="handleCreateSuccess"
    />

    <JoinMeetingDialog 
      v-model="showJoinDialog"
      @success="handleJoinSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMeetingStore } from '@/store/modules/meeting/useMeetingStore'
import { useUserStore } from '@/store/modules/user'
import {
  Bell,
  VideoCamera,
  Document,
  Calendar,
  Plus,
  VideoPlay,
  Clock,
  User,
  ArrowLeft,
  ArrowRight
} from '@element-plus/icons-vue'
import CreateMeetingDialog from './components/CreateMeetingDialog.vue'
import JoinMeetingDialog from './components/JoinMeetingDialog.vue'

const router = useRouter()
const meetingStore = useMeetingStore()
const userStore = useUserStore()

const activeView = ref('scheduled')
const showCreateDialog = ref(false)
const showJoinDialog = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)

// 日历相关
const currentDate = ref(new Date())
const currentYear = computed(() => currentDate.value.getFullYear())
const currentMonth = computed(() => currentDate.value.getMonth())
const selectedDateMeetings = ref<any[]>([])
const selectedDateStr = ref('')

const weekDays = ['日', '一', '二', '三', '四', '五', '六']

const scheduledMeetings = computed(() => meetingStore.scheduledMeetings)
const ongoingMeetings = computed(() => meetingStore.ongoingMeetings)
const historyMeetings = computed(() => meetingStore.historyMeetings)
const historyTotal = computed(() => meetingStore.historyTotal)

// 日历天数计算
const calendarDays = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value
  
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const prevLastDay = new Date(year, month, 0)
  
  const startDayOfWeek = firstDay.getDay()
  const totalDays = lastDay.getDate()
  
  const days = []
  const today = new Date()
  
  // 添加上个月的日期
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const day = prevLastDay.getDate() - i
    const date = new Date(year, month - 1, day)
    days.push({
      day,
      date: date.toISOString(),
      isCurrentMonth: false,
      isToday: isSameDay(date, today),
      meetings: getMeetingsForDate(date)
    })
  }
  
  // 添加当月的日期
  for (let day = 1; day <= totalDays; day++) {
    const date = new Date(year, month, day)
    days.push({
      day,
      date: date.toISOString(),
      isCurrentMonth: true,
      isToday: isSameDay(date, today),
      meetings: getMeetingsForDate(date)
    })
  }
  
  // 添加下个月的日期
  const remainingDays = 42 - days.length
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(year, month + 1, day)
    days.push({
      day,
      date: date.toISOString(),
      isCurrentMonth: false,
      isToday: isSameDay(date, today),
      meetings: getMeetingsForDate(date)
    })
  }
  
  return days
})

const isSameDay = (date1: Date, date2: Date) => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate()
}

const getMeetingsForDate = (date: Date) => {
  const allMeetings = [
    ...scheduledMeetings.value,
    ...ongoingMeetings.value
  ]
  
  return allMeetings.filter(meeting => {
    const meetingDate = new Date(meeting.startTime)
    return isSameDay(meetingDate, date)
  })
}

const prevMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1)
}

const goToToday = () => {
  currentDate.value = new Date()
}

const selectDate = (day: any) => {
  selectedDateStr.value = new Date(day.date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  selectedDateMeetings.value = day.meetings
}

const getMeetingStatusClass = (meeting: any) => {
  const now = new Date()
  const startTime = new Date(meeting.startTime)
  
  if (meeting.status === 'ongoing' || now >= startTime) {
    return 'ongoing'
  }
  return 'scheduled'
}

const getMeetingStatusType = (meeting: any) => {
  const now = new Date()
  const startTime = new Date(meeting.startTime)
  
  if (meeting.status === 'ongoing' || now >= startTime) {
    return 'success'
  }
  return ''
}

const getMeetingStatusText = (meeting: any) => {
  const now = new Date()
  const startTime = new Date(meeting.startTime)
  
  if (meeting.status === 'ongoing' || now >= startTime) {
    return '进行中'
  }
  return '未开始'
}

const isMeetingSoon = (meeting: any) => {
  const now = new Date()
  const startTime = new Date(meeting.startTime)
  const diff = startTime.getTime() - now.getTime()
  return diff > 0 && diff < 30 * 60 * 1000 // 30 分钟内
}

onMounted(() => {
  const userId = userStore.userInfo?.id || 0
  meetingStore.fetchScheduledMeetings(userId)
  meetingStore.fetchOngoingMeetings(userId)
  meetingStore.fetchHistoryMeetings(userId)
})

const formatMeetingTime = (time: string | undefined) => {
  if (!time) return '未设置时间'
  const date = new Date(time)
  const now = new Date()
  const diff = date.getTime() - now.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days > 0) return `${days}天后`
  if (days < 0) return '已过期'
  
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

const formatTimeOnly = (time: string | undefined) => {
  if (!time) return ''
  const date = new Date(time)
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

const viewMeeting = (meeting: any) => {
  console.log('查看会议:', meeting)
}

const handleStart = async (meeting: any) => {
  try {
    await meetingStore.startMeeting(meeting.roomId)
    router.push({ path: `/meeting/room/${meeting.roomId}` })
  } catch (error) {
    console.error('开始会议失败:', error)
  }
}

const handleJoin = (meeting: any) => {
  router.push({ path: `/meeting/room/${meeting.roomId}` })
}

const handleEdit = (meeting: any) => {
  console.log('编辑会议:', meeting)
}

const handleCancel = async (meeting: any) => {
  try {
    await meetingStore.cancelMeeting(meeting.id, userStore.userInfo?.id || 0)
  } catch (error) {
    console.error('取消会议失败:', error)
  }
}

const handleCreateSuccess = () => {
  showCreateDialog.value = false
  const userId = userStore.userInfo?.id || 0
  meetingStore.fetchScheduledMeetings(userId)
}

const handleJoinSuccess = (roomId: string) => {
  showJoinDialog.value = false
  router.push({ path: `/meeting/room/${roomId}` })
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  const userId = userStore.userInfo?.id || 0
  meetingStore.fetchHistoryMeetings(userId, currentPage.value)
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  const userId = userStore.userInfo?.id || 0
  meetingStore.fetchHistoryMeetings(userId, page)
}
</script>

<style scoped>
.meeting-page {
  display: flex;
  width: 100%;
  height: 100%;
  background: #f5f7fa;
}

/* 侧边栏样式 */
.meeting-sidebar {
  width: 240px;
  background: #fff;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 24px 20px;
  border-bottom: 1px solid #e4e7ed;
}

.sidebar-header h2 {
  font-size: 20px;
  color: #303133;
  margin: 0 0 4px 0;
  font-weight: 600;
}

.sidebar-header .subtitle {
  font-size: 12px;
  color: #909399;
  margin: 0;
}

.sidebar-nav {
  flex: 1;
  padding: 16px 12px;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  margin-bottom: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-item:hover {
  background: #f5f7fa;
}

.nav-item.active {
  background: #ecf5ff;
}

.nav-item.active .nav-icon {
  color: #409eff;
}

.nav-item.active .nav-label {
  color: #409eff;
  font-weight: 600;
}

.nav-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #606266;
  margin-right: 12px;
  font-size: 20px;
}

.nav-info {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-label {
  font-size: 14px;
  color: #606266;
}

.nav-count {
  font-size: 12px;
  color: #909399;
  background: #f5f7fa;
  padding: 2px 8px;
  border-radius: 10px;
}

.nav-count.status-ongoing {
  background: #f0f9eb;
  color: #67c23a;
}

.sidebar-actions {
  padding: 20px;
  border-top: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-btn {
  width: 100%;
}

/* 主内容区样式 */
.meeting-main {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.content-view {
  max-width: 1200px;
  margin: 0 auto;
}

.view-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.view-header h3 {
  font-size: 18px;
  color: #303133;
  margin: 0;
  font-weight: 600;
}

.view-count {
  font-size: 14px;
  color: #909399;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: #fff;
  border-radius: 8px;
  color: #909399;
}

.empty-state .el-icon {
  color: #c0c4cc;
  margin-bottom: 16px;
}

.empty-state p {
  font-size: 16px;
  margin-bottom: 20px;
  color: #606266;
}

/* 会议卡片样式 */
.meeting-card {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.meeting-card:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border-color: #409eff;
}

.meeting-card.ongoing {
  border-left: 4px solid #67c23a;
}

.meeting-card.history {
  border-left: 4px solid #909399;
}

.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.time-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #606266;
}

.card-content {
  margin-bottom: 16px;
}

.card-title {
  font-size: 16px;
  color: #303133;
  margin: 0 0 8px 0;
  font-weight: 600;
}

.card-desc {
  font-size: 14px;
  color: #909399;
  margin: 0 0 12px 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-meta {
  display: flex;
  gap: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #909399;
}

.card-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding-top: 12px;
  border-top: 1px solid #e4e7ed;
}

.pagination-wrapper {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

/* 日历视图样式 */
.calendar-view {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e4e7ed;
}

.calendar-nav {
  display: flex;
  align-items: center;
  gap: 16px;
}

.calendar-title {
  font-size: 18px;
  color: #303133;
  margin: 0;
  min-width: 200px;
  text-align: center;
  font-weight: 600;
}

.calendar-grid {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
}

.weekday {
  padding: 12px;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  color: #606266;
}

.calendar-dates {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: #e4e7ed;
}

.calendar-day {
  min-height: 100px;
  background: #fff;
  padding: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.calendar-day:hover {
  background: #f5f7fa;
}

.calendar-day.other-month {
  background: #fafafa;
  color: #c0c4cc;
}

.calendar-day.is-today {
  background: #ecf5ff;
}

.calendar-day.is-today .day-number {
  background: #409eff;
  color: #fff;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.calendar-day.has-meeting {
  border-left: 3px solid #409eff;
}

.day-number {
  font-size: 14px;
  font-weight: 500;
  color: #606266;
  margin-bottom: 8px;
}

.day-meetings {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.meeting-tag {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: #fff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  background: #409eff;
  cursor: pointer;
  transition: all 0.2s;
}

.meeting-tag:hover {
  transform: scale(1.02);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.4);
}

.meeting-tag.ongoing {
  background: #67c23a;
}

.more-meetings {
  font-size: 12px;
  color: #909399;
  text-align: center;
  padding: 2px;
}

.selected-date-meetings {
  margin-top: 24px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
}

.meetings-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 16px 0;
}

.meetings-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.meeting-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.2s;
}

.meeting-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateX(4px);
}

.meeting-time {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #606266;
  min-width: 100px;
}

.meeting-info {
  flex: 1;
}

.meeting-participants {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
}
</style>
