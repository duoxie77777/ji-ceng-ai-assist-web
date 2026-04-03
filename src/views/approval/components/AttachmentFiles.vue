<template>
    <!-- 附件展示组件：展示文件列表、预览/下载功能 -->
    <div class="attachment-box">
        <!-- 空状态提示：无附件时显示 -->
        <div v-if="!files || files.length === 0" class="empty-tip">{{ COMMON_TEXT.NO_ATTACHMENT }}</div>

        <!-- 附件列表：遍历展示每个文件及操作按钮 -->
        <div v-for="(file, idx) in files" :key="idx" class="file-item">
            <span class="file-name">{{ file.name }}</span>
            <div class="btns">
                <el-button type="primary" size="small" @click="openPreview(file)" :disabled="!file?.raw">
                    预览
                </el-button>
                <el-button size="small" @click="download(file)">下载</el-button>
            </div>
        </div>

        <!-- 文件预览弹窗：根据文件类型展示不同预览方式 -->
        <el-dialog @close="handleDialogClose" v-model="showDialog" title="文件预览" width="85%" top="5vh" append-to-body>
            <div class="preview-body">
                <!-- 图片预览：渲染图片 -->
                <img v-if="isImage" :src="previewUrl" class="preview-img" />

                <!-- Markdown预览：解析MD并渲染HTML -->
                <div v-else-if="isMarkdown" class="markdown-preview" v-html="mdContent"></div>

                <!-- 不支持预览：提示不支持的文件类型 -->
                <div v-else class="not-support">
                    <svg-icon name="wenjian" size="40" />
                    <p>{{ COMMON_TEXT.FILE_INVALID_PREVIEW }}</p>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { COMMON_TEXT, isValidFile } from '../utils/types'

// 接收父组件传递的文件列表：展示对应的附件
const props = defineProps({
    files: {
        type: Array,
        default: () => []
    }
})

// 预览弹窗状态：控制弹窗显示/隐藏
const showDialog = ref(false)
// 预览地址：存储文件预览的临时URL
const previewUrl = ref('')
// MD内容：存储解析后的Markdown HTML
const mdContent = ref('')
// 当前预览文件：记录正在预览的文件
const previewFile = ref(null)

// 判断是否为图片文件：用于区分预览类型
const isImage = (file) => {
    if (!isValidFile(file)) return false
    return file.raw.type.startsWith('image/')
}

// 判断是否为Markdown文件：用于区分预览类型
const isMarkdown = (file) => {
    if (!file?.name) return false
    return file.name.endsWith('.md') || file.name.endsWith('.markdown')
}

// 打开预览弹窗
const openPreview = async (file) => {
    if (!isValidFile(file)) {
        ElMessage.warning(COMMON_TEXT.FILE_INVALID_PREVIEW);
        return;
    }

    try {
        previewFile.value = file
        previewUrl.value = URL.createObjectURL(file.raw);
        mdContent.value = isMarkdown(file) ? marked.parse(await file.raw.text()) : '';
        showDialog.value = true;
    } catch (err) {
        console.error('预览失败:', err);
        ElMessage.error(COMMON_TEXT.PREVIEW_FAILED);
    }
};

// 下载文件
const download = (file) => {
    if (!isValidFile(file)) {
        ElMessage.warning(COMMON_TEXT.FILE_INVALID_DOWNLOAD)
        return;
    }
    try {
        const a = document.createElement('a')
        a.href = URL.createObjectURL(file.raw)
        a.download = file.name
        a.click()
        URL.revokeObjectURL(a.href)
    } catch (err) {
        console.error('下载失败:', err)
        ElMessage.error(COMMON_TEXT.DOWNLOAD_FAILED || '下载失败')
    }
};

// 关闭弹窗
const handleDialogClose = () => {
    if (previewUrl.value) {
        URL.revokeObjectURL(previewUrl.value);
        previewUrl.value = '';
    }
    previewFile.value = null;
    showDialog.value = false;
};
</script>

<style scoped lang="less">
.attachment-box {
    padding: 10px 0;
}

.file-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 12px;
    border: 1px solid var(--gray-200);
    border-radius: 6px;
    margin-bottom: 8px;
    background: var(--white);

    &:hover {
        border-color: var(--blue-300);
        box-shadow: var(--shadow-sm);
    }
}

.file-name {
    font-size: 14px;
    font-weight: 500;
}

.btns {
    display: flex;
    gap: 6px;
}

.empty-tip {
    color: var(--gray-500);
    background: var(--gray-50);
    font-size: 13px;
    padding: 10px;
}

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

.markdown-preview h1 {
    font-size: 24px;
    margin: 16px 0 8px;
}

.markdown-preview h2 {
    font-size: 20px;
    margin: 14px 0 6px;
}

.markdown-preview h3 {
    font-size: 18px;
    margin: 12px 0 6px;
}

.markdown-preview strong {
    color: var(--gray-800);
}

.markdown-preview em {
    color: var(--gray-600);
}

.markdown-preview pre {
    background: var(--gray-100);
    padding: 12px;
    border-radius: 6px;
    overflow-x: auto;
}

.not-support {
    text-align: center;
    padding: 60px 20px;
    color: var(--gray-600);
}

.not-support svg-icon {
    margin-bottom: 12px;
}
</style>