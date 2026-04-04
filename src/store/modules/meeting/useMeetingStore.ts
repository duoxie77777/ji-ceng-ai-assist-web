import { defineStore } from 'pinia'
import { meetingApi, type Meeting, type MeetingParticipant } from '@/api/meeting/meeting'

export const useMeetingStore = defineStore('meeting', {
  state: () => ({
    meetings: [] as Meeting[],
    scheduledMeetings: [] as Meeting[],
    ongoingMeetings: [] as Meeting[],
    historyMeetings: [] as Meeting[],
    currentMeeting: null as Meeting | null,
    loading: false,
    historyTotal: 0,
    historyPage:1,
    historyPageSize: 10,
  }),
  getters: {
    scheduledCount: (state) => state.scheduledMeetings.length,
    ongoingCount: (state) => state.ongoingMeetings.length,
    historyCount: (state) => state.historyTotal,
  },
  actions: {
    setMeetings(meetings: Meeting[]) {
      this.meetings = meetings
    },
    setScheduledMeetings(meetings: Meeting[]) {
      this.scheduledMeetings = meetings
    },
    setOngoingMeetings(meetings: Meeting[]) {
      this.ongoingMeetings = meetings
    },
    setHistoryMeetings(meetings: Meeting[], total: number) {
      this.historyMeetings = meetings
      this.historyTotal = total
    },
    setCurrentMeeting(meeting: Meeting | null) {
      this.currentMeeting = meeting
    },
    addMeeting(meeting: Meeting) {
      this.meetings.unshift(meeting)
      if (meeting.status === 'scheduled') {
        this.scheduledMeetings.unshift(meeting)
      }
    },
    updateMeeting(updated: Meeting) {
      const index = this.meetings.findIndex(m => m.id === updated.id)
      if (index !== -1) {
        this.meetings[index] = updated
      }
      const scheduledIndex = this.scheduledMeetings.findIndex(m => m.id === updated.id)
      if (scheduledIndex !== -1) {
        this.scheduledMeetings[scheduledIndex] = updated
      }
      const ongoingIndex = this.ongoingMeetings.findIndex(m => m.id === updated.id)
      if (ongoingIndex !== -1) {
        this.ongoingMeetings[ongoingIndex] = updated
      }
    },
    removeMeeting(id: number) {
      this.meetings = this.meetings.filter(m => m.id !== id)
      this.scheduledMeetings = this.scheduledMeetings.filter(m => m.id !== id)
      this.ongoingMeetings = this.ongoingMeetings.filter(m => m.id !== id)
    },
    setLoading(loading: boolean) {
      this.loading = loading
    },
    async fetchScheduledMeetings(userId: number) {
      this.setLoading(true)
      try {
        const meetings = await meetingApi.getScheduled(userId)
        this.setScheduledMeetings(meetings)
      } catch (error) {
        console.error('获取预定会议失败:', error)
      } finally {
        this.setLoading(false)
      }
    },
    async fetchOngoingMeetings(userId: number) {
      this.setLoading(true)
      try {
        const meetings = await meetingApi.getOngoing(userId)
        this.setOngoingMeetings(meetings)
      } catch (error) {
        console.error('获取进行中会议失败:', error)
      } finally {
        this.setLoading(false)
      }
    },
    async fetchHistoryMeetings(userId: number, page: number =1) {
      this.setLoading(true)
      this.historyPage = page
      try {
        const result = await meetingApi.getHistory(userId, page, this.historyPageSize)
        this.setHistoryMeetings(result.meetings, result.total)
      } catch (error) {
        console.error('获取历史会议失败:', error)
      } finally {
        this.setLoading(false)
      }
    },
    async createMeeting(data: any) {
      this.setLoading(true)
      try {
        const meeting = await meetingApi.create(data)
        this.addMeeting(meeting)
        return meeting
      } catch (error) {
        console.error('创建会议失败:', error)
        throw error
      } finally {
        this.setLoading(false)
      }
    },
    async updateMeeting(data: any) {
      this.setLoading(true)
      try {
        const meeting = await meetingApi.update(data)
        this.updateMeeting(meeting)
        return meeting
      } catch (error) {
        console.error('更新会议失败:', error)
        throw error
      } finally {
        this.setLoading(false)
      }
    },
    async cancelMeeting(id: number, userId: number) {
      this.setLoading(true)
      try {
        const meeting = await meetingApi.cancel({ id, userId })
        this.removeMeeting(id)
        return meeting
      } catch (error) {
        console.error('取消会议失败:', error)
        throw error
      } finally {
        this.setLoading(false)
      }
    },
    async startMeeting(roomId: string) {
      this.setLoading(true)
      try {
        const meeting = await meetingApi.start(roomId)
        this.updateMeeting(meeting)
        return meeting
      } catch (error) {
        console.error('开始会议失败:', error)
        throw error
      } finally {
        this.setLoading(false)
      }
    },
    async endMeeting(roomId: string) {
      this.setLoading(true)
      try {
        const meeting = await meetingApi.end(roomId)
        this.updateMeeting(meeting)
        return meeting
      } catch (error) {
        console.error('结束会议失败:', error)
        throw error
      } finally {
        this.setLoading(false)
      }
    },
    async joinMeeting(data: any) {
      this.setLoading(true)
      try {
        const participant = await meetingApi.join(data)
        return participant
      } catch (error) {
        console.error('加入会议失败:', error)
        throw error
      } finally {
        this.setLoading(false)
      }
    },
    async leaveMeeting(meetingId: number, userId: number) {
      this.setLoading(true)
      try {
        await meetingApi.leave({ meetingId, userId })
        this.setCurrentMeeting(null)
      } catch (error) {
        console.error('离开会议失败:', error)
        throw error
      } finally {
        this.setLoading(false)
      }
    },
  },
})
