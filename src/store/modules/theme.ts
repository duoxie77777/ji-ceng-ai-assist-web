import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(false)

  // 初始化：从 localStorage 读取
  const init = () => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark') {
      isDark.value = true
    } else if (savedTheme === 'light') {
      isDark.value = false
    } else {
      // 未保存，跟随系统
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    applyTheme()
  }

  // 切换主题
  const toggleTheme = () => {
    isDark.value = !isDark.value
    saveTheme()
    applyTheme()
  }

  // 保存到 localStorage
  const saveTheme = () => {
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
  }

  // 应用主题到 body
  const applyTheme = () => {
    if (isDark.value) {
      document.body.classList.add('dark')
    } else {
      document.body.classList.remove('dark')
    }
  }

  // 监听系统主题变化（仅当用户未手动选择时）
  watch(isDark, () => {
    saveTheme()
    applyTheme()
  })

  return {
    isDark,
    init,
    toggleTheme
  }
})
