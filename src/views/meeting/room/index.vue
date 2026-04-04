<template>
  <div class="meeting-room">
    <div class="room-header">
      <div class="header-left">
        <span class="link-text" @click="handleLeave">退出会议</span>
      </div>
      <div class="header-center">
        <h3>{{ meetingTitle }}</h3>
        <span class="meeting-time">{{ meetingTime }}</span>
      </div>
      <div class="header-right">
        <span class="participant-count">{{ participants.length }}人</span>
      </div>
    </div>

    <div class="room-content">
      <div class="video-grid">
        <div class="video-item local-video">
          <video ref="localVideoRef" autoplay muted playsinline></video>
          <div class="video-label">我</div>
          <div class="video-controls">
            <span class="control-btn" @click="toggleCamera">
              <svg-icon :name="cameraEnabled ? 'shexiangtou' : 'shexiangtou-guanbi'" size="20" />
            </span>
            <span class="control-btn" @click="toggleMic">
              <svg-icon :name="micEnabled ? 'maikefeng' : 'maikefeng-guanbi'" size="20" />
            </span>
            <span class="control-btn" @click="toggleScreenShare">
              <svg-icon :name="screenSharing ? 'pingmugongxiang' : 'pingmugongxiang-guanbi'" size="20" />
            </span>
          </div>
        </div>
        
        <div 
          v-for="(participant, index) in participants" 
          :key="participant.userId"
          class="video-item"
        >
          <video 
            :ref="(el) => setVideoRef(el, index)" 
            autoplay 
            playsinline
          ></video>
          <div class="video-label">{{ participant.username }}</div>
        </div>
      </div>

      <div class="room-sidebar">
        <div class="sidebar-section">
          <h4>参与人员</h4>
          <div class="participant-list">
            <div class="participant-item">
              <span class="participant-name">我</span>
              <span class="participant-role">主持人</span>
            </div>
            <div 
              v-for="participant in participants" 
              :key="participant.userId"
              class="participant-item"
            >
              <span class="participant-name">{{ participant.username }}</span>
              <span class="participant-role">参与者</span>
            </div>
          </div>
        </div>

        <div class="sidebar-section">
          <h4>会议设置</h4>
          <div class="setting-list">
            <div class="setting-item">
              <span>屏幕共享</span>
              <span class="link-text" @click="toggleScreenShare">
                {{ screenSharing ? '停止共享' : '开始共享' }}
              </span>
            </div>
            <div class="setting-item">
              <span>录制会议</span>
              <span class="link-text" @click="toggleRecording">
                {{ recording ? '停止录制' : '开始录制' }}
              </span>
            </div>
            <div class="setting-item">
              <span>字幕</span>
              <span class="link-text" @click="toggleSubtitle">
                {{ subtitleEnabled ? '关闭字幕' : '开启字幕' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="room-footer">
      <div class="footer-controls">
        <span class="control-btn" @click="toggleCamera">
          <svg-icon :name="cameraEnabled ? 'shexiangtou' : 'shexiangtou-guanbi'" size="24" />
        </span>
        <span class="control-btn" @click="toggleMic">
          <svg-icon :name="micEnabled ? 'maikefeng' : 'maikefeng-guanbi'" size="24" />
        </span>
        <span class="control-btn danger" @click="handleLeave">
          <svg-icon name="guaji" size="24" />
        </span>
        <span class="control-btn" @click="toggleScreenShare">
          <svg-icon :name="screenSharing ? 'pingmugongxiang' : 'pingmugongxiang-guanbi'" size="24" />
        </span>
        <span class="control-btn" @click="toggleRecording">
          <svg-icon :name="recording ? 'luzhi-zhong' : 'luzhi'" size="24" />
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMeetingStore } from '@/store/modules/meeting/useMeetingStore'
import { useUserStore } from '@/store/modules/user'
import SvgIcon from '@/components/SvgIcon/SvgIcon.vue'

const route = useRoute()
const router = useRouter()
const meetingStore = useMeetingStore()
const userStore = useUserStore()

const roomId = route.params.roomId as string
const meetingTitle = ref('视频会议')
const meetingTime = ref(new Date().toLocaleString())

const localVideoRef = ref<HTMLVideoElement>()
const remoteVideoRefs = ref<(HTMLVideoElement | null)[]>([])

const cameraEnabled = ref(true)
const micEnabled = ref(true)
const screenSharing = ref(false)
const recording = ref(false)
const subtitleEnabled = ref(false)

const participants = ref<Array<{ userId: string; username: string }>>([])

const setVideoRef = (el: any, index: number) => {
  if (el) {
    remoteVideoRefs.value[index] = el as HTMLVideoElement
  }
}

onMounted(async () => {
  try {
    await initializeMedia()
    await joinMeeting()
    startTimer()
  } catch (error) {
    console.error('初始化会议失败:', error)
  }
})

onUnmounted(() => {
  cleanup()
})

const initializeMedia = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    })
    
    if (localVideoRef.value) {
      localVideoRef.value.srcObject = stream
    }
  } catch (error) {
    console.error('获取媒体设备失败:', error)
    cameraEnabled.value = false
    micEnabled.value = false
  }
}

const joinMeeting = async () => {
  try {
    const userId = userStore.userInfo?.id || 0
    const username = userStore.userInfo?.username || '用户'
    
    await meetingStore.joinMeeting({
      roomId,
      userId,
      username
    })
    
    participants.value = [
      { userId: '2', username: '张三' },
      { userId: '3', username: '李四' }
    ]
  } catch (error) {
    console.error('加入会议失败:', error)
  }
}

const startTimer = () => {
  setInterval(() => {
    meetingTime.value = new Date().toLocaleString()
  }, 1000)
}

const toggleCamera = async () => {
  cameraEnabled.value = !cameraEnabled.value
  if (localVideoRef.value?.srcObject) {
    const stream = localVideoRef.value.srcObject as MediaStream
    const videoTrack = stream.getVideoTracks()[0]
    if (videoTrack) {
      videoTrack.enabled = cameraEnabled.value
    }
  }
}

const toggleMic = async () => {
  micEnabled.value = !micEnabled.value
  if (localVideoRef.value?.srcObject) {
    const stream = localVideoRef.value.srcObject as MediaStream
    const audioTrack = stream.getAudioTracks()[0]
    if (audioTrack) {
      audioTrack.enabled = micEnabled.value
    }
  }
}

const toggleScreenShare = async () => {
  if (screenSharing.value) {
    stopScreenShare()
  } else {
    await startScreenShare()
  }
}

const startScreenShare = async () => {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true
    })
    
    if (localVideoRef.value) {
      localVideoRef.value.srcObject = stream
    }
    
    stream.getVideoTracks()[0].onended = () => {
      stopScreenShare()
    }
    
    screenSharing.value = true
  } catch (error) {
    console.error('启动屏幕共享失败:', error)
  }
}

const stopScreenShare = () => {
  if (localVideoRef.value?.srcObject) {
    const stream = localVideoRef.value.srcObject as MediaStream
    stream.getTracks().forEach(track => track.stop())
  }
  screenSharing.value = false
  initializeMedia()
}

const toggleRecording = () => {
  recording.value = !recording.value
  console.log(recording.value ? '开始录制' : '停止录制')
}

const toggleSubtitle = () => {
  subtitleEnabled.value = !subtitleEnabled.value
  console.log(subtitleEnabled.value ? '开启字幕' : '关闭字幕')
}

const handleLeave = async () => {
  try {
    const userId = userStore.userInfo?.id || 0
    await meetingStore.leaveMeeting('', userId)
    cleanup()
    router.push('/meeting')
  } catch (error) {
    console.error('离开会议失败:', error)
    router.push('/meeting')
  }
}

const cleanup = () => {
  if (localVideoRef.value?.srcObject) {
    const stream = localVideoRef.value.srcObject as MediaStream
    stream.getTracks().forEach(track => track.stop())
  }
  remoteVideoRefs.value.forEach(video => {
    if (video?.srcObject) {
      const stream = video.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
    }
  })
}
</script>

<style scoped>
.meeting-room {
  width: 100%;
  height: 100%;
  background: #0f0f0f;
  display: flex;
  flex-direction: column;
}

.room-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #1a1a1a;
  border-bottom: 1px solid #2a2a2a;
}

.header-left,
.header-right {
  flex: 1;
}

.header-center {
  flex: 1;
  text-align: center;
}

.header-center h3 {
  font-size: 18px;
  color: #fff;
  margin: 0 0 4px 0;
}

.meeting-time {
  font-size: 12px;
  color: #999;
}

.participant-count {
  font-size: 14px;
  color: #999;
}

.room-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.video-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 16px;
  padding: 16px;
  overflow-y: auto;
}

.video-item {
  position: relative;
  background: #1a1a1a;
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 16 / 9;
}

.video-item video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-label {
  position: absolute;
  bottom: 8px;
  left: 8px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.video-controls {
  position: absolute;
  bottom: 8px;
  right: 8px;
  display: flex;
  gap: 8px;
}

.control-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.control-btn:hover {
  background: rgba(0, 0, 0, 0.8);
}

.control-btn.danger {
  background: rgba(220, 38, 38, 0.8);
}

.control-btn.danger:hover {
  background: rgba(220, 38, 38, 1);
}

.room-sidebar {
  width: 280px;
  background: #1a1a1a;
  border-left: 1px solid #2a2a2a;
  padding: 16px;
  overflow-y: auto;
}

.sidebar-section {
  margin-bottom: 24px;
}

.sidebar-section h4 {
  font-size: 14px;
  color: #999;
  margin: 0 0 12px 0;
}

.participant-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.participant-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #2a2a2a;
  border-radius: 6px;
}

.participant-name {
  font-size: 14px;
  color: #fff;
}

.participant-role {
  font-size: 12px;
  color: #999;
}

.setting-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #2a2a2a;
  border-radius: 6px;
}

.setting-item span:first-child {
  font-size: 14px;
  color: #fff;
}

.room-footer {
  display: flex;
  justify-content: center;
  padding: 16px;
  background: #1a1a1a;
  border-top: 1px solid #2a2a2a;
}

.footer-controls {
  display: flex;
  gap: 16px;
}

.footer-controls .control-btn {
  width: 48px;
  height: 48px;
  background: #2a2a2a;
  border-radius: 8px;
}

.footer-controls .control-btn:hover {
  background: #3a3a3a;
}

.footer-controls .control-btn.danger {
  background: rgba(220, 38, 38, 0.8);
}

.footer-controls .control-btn.danger:hover {
  background: rgba(220, 38, 38, 1);
}
</style>
