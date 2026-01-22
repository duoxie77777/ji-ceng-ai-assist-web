import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // 使用 "@" 指向根目录
      '@': resolve(__dirname, 'src')
    }
  }
})
