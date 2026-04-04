<template>
  <div class="welcome-banner">
    <div class="banner-content">
      <div class="greeting">
        <h1>{{ greeting }}，{{ userName }}</h1>
        <p class="date-info">{{ currentDate }} {{ currentTime }}</p>
      </div>
      <div class="weather-info">
        <el-icon class="weather-icon">
          <Sunny />
        </el-icon>
        <span>晴 26°C</span>
      </div>
    </div>
    <div class="banner-footer">
      <div class="quote">
        <el-icon>
          <ChatDotRound />
        </el-icon>
        <span>{{ dailyQuote }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { Sunny, ChatDotRound } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/modules/user'

const userStore = useUserStore()
const userName = computed(() => userStore.userInfo?.username || '用户')

const quotes = [
  '今天也要加油工作哦！',
  '保持积极的心态，一切都会好起来的。',
  '每一个努力的日子都值得被记住。',
  '相信自己，你可以做到的。',
  '今天的努力是明天的收获。'
]

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了'
  if (hour < 9) return '早上好'
  if (hour < 12) return '上午好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  return '晚上好'
})

const currentDate = ref('')
const currentTime = ref('')
const dailyQuote = ref('')

let timer: number | null = null

const updateTime = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const weekDays = ['日', '一', '二', '三', '四', '五', '六']
  const weekDay = weekDays[now.getDay()]
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  
  currentDate.value = `${year}年${month}月${day}日 星期${weekDay}`
  currentTime.value = `${hours}:${minutes}`
}

onMounted(() => {
  updateTime()
  timer = window.setInterval(updateTime, 60000)
  dailyQuote.value = quotes[Math.floor(Math.random() * quotes.length)]
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style scoped>
.welcome-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 24px;
  color: white;
  margin-bottom: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.banner-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.greeting h1 {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.date-info {
  font-size: 14px;
  opacity: 0.9;
  margin: 0;
}

.weather-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  opacity: 0.9;
}

.weather-icon {
  font-size: 24px;
}

.banner-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding-top: 16px;
}

.quote {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  opacity: 0.95;
}

@media (max-width: 768px) {
  .banner-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .greeting h1 {
    font-size: 20px;
  }
}
</style>
