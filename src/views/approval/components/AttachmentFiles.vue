<template>
  <div class="attachment-box">
    <div v-if="!files || files.length === 0" class="empty-tip">暂无附件</div>

    <div v-for="(file, idx) in files" :key="idx" class="file-item">
      <span class="file-name">{{ file.name }}</span>
      <div class="btns">
        <el-button type="primary" size="small" @click="openPreview(file)" :disabled="!file?.raw">
          预览
        </el-button>
        <el-button size="small" @click="download(file)">下载</el-button>
      </div>
    </div>

    <el-dialog v-model="showDialog" title="文件预览" width="85%" top="5vh" append-to-body>
      <div class="preview-body">
        <!-- 图片 -->
        <img v-if="isImage" :src="previewUrl" class="preview-img" />

        <!-- Markdown -->
        <div v-else-if="isMarkdown" class="markdown-preview" v-html="mdContent"></div>

        <!-- 不支持预览的文件 -->
        <div v-else class="not-support">
          <svg-icon name="wenjian" size="40" />
          <p>该类型文件暂不支持在线预览，请下载后查看</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  files: {
    type: Array,
    default: () => []
  }
})

const showDialog = ref(false)
const previewUrl = ref('')
const mdContent = ref('')

// 判断是否图片
const isImage = (file) => {
  if (!file?.raw) return false
  return file.raw.type.startsWith('image/')
}

// 判断是否 MD
const isMarkdown = (file) => {
  if (!file?.name) return false
  return file.name.endsWith('.md') || file.name.endsWith('.markdown')
}

const openPreview = async (file) => {
  // 先判断 file 和 file.raw 是否存在
  if (!file || !file.raw) {
    ElMessage.warning('文件已失效，无法预览')
    return
  }

  try {
    // 只有确认是 Blob/File 类型，才调用 createObjectURL
    previewUrl.value = URL.createObjectURL(file.raw)

    if (isMarkdown(file)) {
      const text = await file.raw.text()
      mdContent.value = parseMarkdown(text)
    } else {
      mdContent.value = ''
    }

    showDialog.value = true
  } catch (err) {
    console.error('预览失败:', err)
    ElMessage.error('预览失败，请检查文件')
  }
}

// 下载
const download = (file) => {
  if (!file || !file.raw) {
    ElMessage.warning('文件已失效，无法下载')
    return
  }
  try {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(file.raw)
    a.download = file.name
    a.click()
    URL.revokeObjectURL(a.href)
  } catch (err) {
    console.error('下载失败:', err)
    ElMessage.error('下载失败')
  }
}

// MD 简易格式化（不用装库，自带基础样式）
const parseMarkdown = async (text) => {
  return text
    .replace(/\n/g, '<br>')
    .replace(/### (.*?)(<br>|$)/g, '<h3>$1</h3>')
    .replace(/## (.*?)(<br>|$)/g, '<h2>$1</h2>')
    .replace(/# (.*?)(<br>|$)/g, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
}
</script>

<style scoped>
.attachment-box { padding: 10px 0; }
.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border: 1px solid #eee;
  border-radius: 6px;
  margin-bottom: 8px;
  background: #fafafa;
}
.file-name { font-size: 14px; font-weight: 500; }
.btns { display: flex; gap: 6px; }
.empty-tip { color: #999; font-size: 13px; padding: 10px; }

.preview-body {
  min-height: 60vh;
  max-height: 75vh;
  overflow-y: auto;
  padding: 10px;
}
.preview-img {
  max-width: 100%;
  max-height: 70vh;
  margin: 0 auto;
  display: block;
}
.markdown-preview {
  line-height: 1.7;
  font-size: 15px;
}
.markdown-preview h1 { font-size: 24px; margin: 16px 0 8px; }
.markdown-preview h2 { font-size: 20px; margin: 14px 0 6px; }
.markdown-preview h3 { font-size: 18px; margin: 12px 0 6px; }
.markdown-preview strong { color: #333; }
.markdown-preview em { color: #666; }
.markdown-preview pre {
  background: #f6f6f6;
  padding: 12px;
  border-radius: 6px;
  overflow-x: auto;
}

.not-support {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}
.not-support svg-icon {
  margin-bottom: 12px;
}
</style>