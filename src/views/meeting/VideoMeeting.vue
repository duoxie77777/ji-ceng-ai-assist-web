<template>
  <div class="video-meeting-wrapper">
    <div v-if="!inMeeting" class="pre-meeting-screen">
      <div class="pre-meeting-header">
        <h2>视频会议</h2>
      </div>
      <div class="pre-meeting-content">
        <div class="video-preview">
          <video ref="localPreview" autoplay muted playsinline></video>
        </div>
        <div class="controls-row">
          <el-button
            :type="cameraEnabled ? 'primary' : 'danger'"
            @click="toggleCamera"
          >
            <el-icon><VideoCamera /></el-icon>
            {{ cameraEnabled ? '摄像头开启' : '摄像头关闭' }}
          </el-button>
          <el-button
            :type="micEnabled ? 'primary' : 'danger'"
            @click="toggleMic"
          >
            <el-icon><Microphone v-if="micEnabled" /><Mute v-else /></el-icon>
            {{ micEnabled ? '麦克风开启' : '麦克风关闭' }}
          </el-button>
        </div>
        <div class="meeting-actions">
          <el-button type="primary" size="large" @click="showCreateDialog = true">
            创建会议
          </el-button>
          <el-button size="large" @click="showJoinDialog = true">
            加入会议
          </el-button>
        </div>
      </div>
    </div>

    <div v-else class="in-meeting-screen">
      <div class="meeting-header">
        <div class="meeting-info">
          <h3>{{ currentMeeting?.title || '视频会议' }}</h3>
          <span class="room-id">房间号: {{ roomId }}</span>
        </div>
        <el-button type="danger" @click="leaveMeeting">离开会议</el-button>
      </div>

      <div class="meeting-content">
        <div class="videos-container">
          <div class="remote-videos">
            <div
              v-for="participant in remoteParticipants"
              :key="participant.userId"
              class="video-item"
            >
              <video
                :ref="(el: any) => setVideoRef(el, participant.userId)"
                autoplay
                playsinline
              ></video>
              <div class="video-label">
                {{ participant.username }}
                <el-icon v-if="!participant.mic"><Mute /></el-icon>
                <el-icon v-if="!participant.camera"><VideoCamera /></el-icon>
              </div>
            </div>
          </div>
          <div class="local-video">
            <video ref="localVideo" autoplay muted playsinline></video>
            <div class="video-label">{{ username }} (你)</div>
          </div>
        </div>
      </div>

      <div class="meeting-footer">
        <div class="footer-controls">
          <el-button
            :type="cameraEnabled ? 'primary' : 'danger'"
            circle
            @click="toggleCamera"
          >
            <el-icon><VideoCamera /></el-icon>
          </el-button>
          <el-button
            :type="micEnabled ? 'primary' : 'danger'"
            circle
            @click="toggleMic"
          >
            <el-icon><Microphone /></el-icon>
          </el-button>
          <el-button
            :type="screenSharing ? 'success' : ''"
            circle
            @click="toggleScreenShare"
          >
            <el-icon><Monitor /></el-icon>
          </el-button>
          <el-button type="danger" circle @click="leaveMeeting">
            <el-icon><SwitchButton /></el-icon>
          </el-button>
        </div>
      </div>

      <div v-if="subtitle" class="subtitle-container">
        <p class="subtitle-text">{{ subtitle }}</p>
      </div>
    </div>

    <CreateMeetingDialog
      v-model="showCreateDialog"
      @create="handleCreateMeeting"
    />
    <JoinMeetingDialog
      v-model="showJoinDialog"
      @join="handleJoinMeeting"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { ElMessage } from 'element-plus';
import { io } from 'socket.io-client';
import {
  VideoCamera,
  Microphone,
  Mute,
  Monitor,
  SwitchButton,
} from '@element-plus/icons-vue';
import CreateMeetingDialog from './components/CreateMeetingDialog.vue';
import JoinMeetingDialog from './components/JoinMeetingDialog.vue';

interface Participant {
  userId: string;
  username: string;
  camera: boolean;
  mic: boolean;
  screenSharing: boolean;
}

const localPreview = ref<HTMLVideoElement | null>(null);
const localVideo = ref<HTMLVideoElement | null>(null);
const showCreateDialog = ref(false);
const showJoinDialog = ref(false);
const inMeeting = ref(false);
const roomId = ref('');
const cameraEnabled = ref(true);
const micEnabled = ref(true);
const screenSharing = ref(false);
const currentMeeting = ref<any>(null);
const remoteParticipants = ref<Participant[]>([]);
const subtitle = ref('');

const localStream = ref<MediaStream | null>(null);
const peerConnections = ref<Map<string, RTCPeerConnection>>(new Map());
const remoteStreams = ref<Map<string, MediaStream>>(new Map());
const videoRefs = ref<Map<string, HTMLVideoElement>>(new Map());
let socket: any = null;
const userId = 'user_' + Date.now();
const username = '用户' + Math.floor(Math.random() * 10000);

const iceServers = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

onMounted(async () => {
  await initLocalPreview();
  initSocket();
});

onUnmounted(() => {
  if (localStream.value) {
    localStream.value.getTracks().forEach((track) => track.stop());
  }
  peerConnections.value.forEach((pc) => pc.close());
  if (socket) {
    socket.disconnect();
  }
});

async function initLocalPreview() {
  try {
    localStream.value = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    if (localPreview.value) {
      localPreview.value.srcObject = localStream.value;
    }
  } catch (err) {
    console.error('获取媒体设备失败:', err);
    ElMessage.error('无法访问摄像头或麦克风');
  }
}

function initSocket() {
  socket = io('http://localhost:3000');
  socket.on('connect', () => {
    console.log('已连接到信令服务器');
    socket.emit('login', { userId, username });
  });

  socket.on('online-users', (users: any[]) => {
    console.log('在线用户:', users);
  });

  socket.on('user-joined', (data: any) => {
    console.log('用户加入:', data);
    if (data.userId !== userId) {
      addParticipant(data.userId, data.username);
      createPeerConnection(data.userId);
    }
  });

  socket.on('user-left', (data: any) => {
    console.log('用户离开:', data);
    removeParticipant(data.userId);
  });

  socket.on('room-members', (data: any) => {
    console.log('房间成员:', data);
    data.members.forEach((member: any) => {
      if (member.userId !== userId) {
        addParticipant(member.userId, member.username);
        createPeerConnection(member.userId, true);
      }
    });
  });

  socket.on('incoming-call', async (data: any) => {
    console.log('收到呼叫:', data);
    const pc = peerConnections.value.get(data.from);
    if (pc) {
      await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('answer', { from: userId, to: data.from, answer });
    }
  });

  socket.on('call-answered', async (data: any) => {
    console.log('呼叫被接听:', data);
    const pc = peerConnections.value.get(data.from);
    if (pc) {
      await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
    }
  });

  socket.on('ice-candidate', async (data: any) => {
    console.log('收到 ICE 候选:', data);
    const pc = peerConnections.value.get(data.from);
    if (pc && data.candidate) {
      await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
    }
  });

  socket.on('media-status', (data: any) => {
    console.log('媒体状态变化:', data);
    const participant = remoteParticipants.value.find((p) => p.userId === data.from);
    if (participant) {
      if (data.camera !== undefined) participant.camera = data.camera;
      if (data.mic !== undefined) participant.mic = data.mic;
      if (data.screenSharing !== undefined) participant.screenSharing = data.screenSharing;
    }
  });

  socket.on('subtitle', (data: any) => {
    subtitle.value = data.text;
    setTimeout(() => {
      subtitle.value = '';
    }, 3000);
  });
}

function addParticipant(uid: string, uname: string) {
  const exists = remoteParticipants.value.find((p) => p.userId === uid);
  if (!exists) {
    remoteParticipants.value.push({
      userId: uid,
      username: uname,
      camera: true,
      mic: true,
      screenSharing: false,
    });
  }
}

function removeParticipant(uid: string) {
  remoteParticipants.value = remoteParticipants.value.filter((p) => p.userId !== uid);
  const pc = peerConnections.value.get(uid);
  if (pc) {
    pc.close();
    peerConnections.value.delete(uid);
  }
  remoteStreams.value.delete(uid);
  videoRefs.value.delete(uid);
}

function createPeerConnection(targetId: string, initiator: boolean = false) {
  const pc = new RTCPeerConnection({ iceServers });

  if (localStream.value) {
    localStream.value.getTracks().forEach((track) => {
      pc.addTrack(track, localStream.value!);
    });
  }

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit('ice-candidate', {
        from: userId,
        to: targetId,
        candidate: event.candidate,
      });
    }
  };

  pc.ontrack = (event) => {
    remoteStreams.value.set(targetId, event.streams[0]);
    const videoEl = videoRefs.value.get(targetId);
    if (videoEl) {
      videoEl.srcObject = event.streams[0];
    }
  };

  if (initiator) {
    pc.createOffer()
      .then((offer) => pc.setLocalDescription(offer))
      .then(() => {
        socket.emit('call', {
          from: userId,
          to: targetId,
          offer: pc.localDescription,
        });
      });
  }

  peerConnections.value.set(targetId, pc);
}

function setVideoRef(el: any, uid: string) {
  if (el) {
    videoRefs.value.set(uid, el);
    const stream = remoteStreams.value.get(uid);
    if (stream) {
      el.srcObject = stream;
    }
  }
}

async function toggleCamera() {
  cameraEnabled.value = !cameraEnabled.value;
  if (localStream.value) {
    localStream.value.getVideoTracks().forEach((track) => {
      track.enabled = cameraEnabled.value;
    });
  }
  emitMediaStatus();
}

async function toggleMic() {
  micEnabled.value = !micEnabled.value;
  if (localStream.value) {
    localStream.value.getAudioTracks().forEach((track) => {
      track.enabled = micEnabled.value;
    });
  }
  emitMediaStatus();
}

async function toggleScreenShare() {
  if (screenSharing.value) {
    screenSharing.value = false;
    if (localStream.value) {
      const videoTrack = await navigator.mediaDevices.getUserMedia({ video: true });
      const sender = peerConnections.value.values().next().value?.getSenders().find((s: any) => s.track?.kind === 'video');
      if (sender) {
        sender.replaceTrack(videoTrack.getVideoTracks()[0]);
      }
    }
  } else {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
      screenSharing.value = true;
      peerConnections.value.forEach((pc) => {
        const sender = pc.getSenders().find((s: any) => s.track?.kind === 'video');
        if (sender) {
          sender.replaceTrack(screenStream.getVideoTracks()[0]);
        }
      });
      screenStream.getVideoTracks()[0].onended = () => {
        screenSharing.value = false;
      };
    } catch (err) {
      console.error('屏幕共享失败:', err);
      ElMessage.error('屏幕共享失败');
    }
  }
  emitMediaStatus();
}

function emitMediaStatus() {
  socket.emit('media-status', {
    from: userId,
    camera: cameraEnabled.value,
    mic: micEnabled.value,
    screenSharing: screenSharing.value,
  });
}

async function handleCreateMeeting(data: any) {
  currentMeeting.value = data;
  roomId.value = data.roomId || generateRoomId();
  inMeeting.value = true;

  if (localVideo.value && localStream.value) {
    localVideo.value.srcObject = localStream.value;
  }

  socket.emit('join-room', { userId, username, roomId: roomId.value });
  showCreateDialog.value = false;
}

async function handleJoinMeeting(data: any) {
  roomId.value = data.roomId;
  inMeeting.value = true;

  if (localVideo.value && localStream.value) {
    localVideo.value.srcObject = localStream.value;
  }

  socket.emit('join-room', { userId, username, roomId: roomId.value });
  showJoinDialog.value = false;
}

function leaveMeeting() {
  socket.emit('leave-room', { userId, username });
  inMeeting.value = false;
  roomId.value = '';
  remoteParticipants.value = [];
  peerConnections.value.forEach((pc) => pc.close());
  peerConnections.value.clear();
  remoteStreams.value.clear();
  videoRefs.value.clear();
}

function generateRoomId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}
</script>

<style scoped lang="less">
.video-meeting-wrapper {
  width: 100%;
  height: 100vh;
  background: #1a1a2e;
  color: #fff;
}

.pre-meeting-screen {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 40px;

  .pre-meeting-header {
    margin-bottom: 40px;
    h2 {
      font-size: 28px;
    }
  }

  .pre-meeting-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;

    .video-preview {
      width: 400px;
      height: 300px;
      background: #000;
      border-radius: 12px;
      overflow: hidden;
      margin-bottom: 30px;

      video {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .controls-row {
      display: flex;
      gap: 20px;
      margin-bottom: 40px;
    }

    .meeting-actions {
      display: flex;
      gap: 20px;
    }
  }
}

.in-meeting-screen {
  display: flex;
  flex-direction: column;
  height: 100%;

  .meeting-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 40px;
    background: rgba(0, 0, 0, 0.3);

    .meeting-info {
      display: flex;
      align-items: center;
      gap: 20px;

      h3 {
        font-size: 20px;
        margin: 0;
      }

      .room-id {
        color: #aaa;
        font-size: 14px;
        background: rgba(255, 255, 255, 0.1);
        padding: 4px 12px;
        border-radius: 4px;
      }
    }
  }

  .meeting-content {
    flex: 1;
    display: flex;
    padding: 20px;

    .videos-container {
      flex: 1;
      display: flex;
      gap: 16px;

      .remote-videos {
        flex: 1;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 16px;

        .video-item {
          position: relative;
          background: #000;
          border-radius: 12px;
          overflow: hidden;

          video {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .video-label {
            position: absolute;
            bottom: 12px;
            left: 12px;
            background: rgba(0, 0, 0, 0.6);
            padding: 6px 12px;
            border-radius: 4px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
        }
      }

      .local-video {
        width: 240px;
        height: 180px;
        position: relative;
        background: #000;
        border-radius: 12px;
        overflow: hidden;
        flex-shrink: 0;

        video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .video-label {
          position: absolute;
          bottom: 8px;
          left: 8px;
          background: rgba(0, 0, 0, 0.6);
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 13px;
        }
      }
    }
  }

  .meeting-footer {
    padding: 20px 40px;
    background: rgba(0, 0, 0, 0.5);

    .footer-controls {
      display: flex;
      justify-content: center;
      gap: 20px;
    }
  }

  .subtitle-container {
    position: absolute;
    bottom: 120px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.7);
    padding: 12px 24px;
    border-radius: 8px;
    max-width: 60%;

    .subtitle-text {
      margin: 0;
      font-size: 16px;
      color: #fff;
    }
  }
}
</style>
