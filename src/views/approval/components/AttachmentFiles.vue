<template>
    <!-- 附件展示组件：展示文件列表、预览/下载功能 -->
    <div class="attachment-box">
        <!-- 空状态提示：无附件时显示 -->
        <div v-if="!files || files.length === 0" class="empty-tip">{{ COMMON_TEXT.NO_ATTACHMENT }}</div>

        <!-- 附件列表：遍历展示每个文件及操作按钮 -->
        <div v-for="(file, idx) in files" :key="idx" class="file-item">
            <div class="file-info-left">
                <el-image v-if="isImageFile(file)" :src="getImageUrl(file)" class="file-thumb" fit="cover">
                    <template #error>
                        <el-icon><Picture /></el-icon>
                    </template>
                </el-image>
                <el-icon v-else><Document /></el-icon>
                <span class="file-name">{{ file.name || file.url?.split('/').pop() || '未知文件' }}</span>
            </div>
            <div class="btns">
                <el-button type="primary" link @click="openPreview(file)" :disabled="!canPreview(file)">
                    预览
                </el-button>
                <el-button type="primary" link @click="download(file)" :disabled="!canDownload(file)">
                    下载
                </el-button>
            </div>
        </div>

        <!-- 文件预览弹窗 -->
        <el-dialog @close="handleDialogClose" v-model="showDialog" title="文件预览" width="85%" top="5vh" append-to-body>
            <div class="preview-body">
                <img v-if="isImage" :src="previewUrl" class="preview-img" />
                <div v-else class="not-support">
                    <el-icon size="40"><Document /></el-icon>
                    <p>{{ COMMON_TEXT.FILE_INVALID_PREVIEW }}</p>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Document, Picture } from '@element-plus/icons-vue'
import { COMMON_TEXT } from '../utils/types'
import type { ApprovalFile } from '../utils/types'

const props = defineProps<{
    files: any[]
}>()

const showDialog = ref(false)
const previewUrl = ref('')
const isImage = ref(false)

// 判断是否为图片文件
const isImageFile = (file: any) => {
    const name = file?.name || file?.url || ''
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(name)
}

// 获取图片缩略图URL
const getImageUrl = (file: any) => {
    // 优先使用本地 raw 对象
    if (file?.raw) return URL.createObjectURL(file.raw)
    // 其次使用服务器URL
    if (file?.url) return file.url
    return ''
}

// 判断是否可以预览
const canPreview = (file: any) => {
    return !!(file?.raw || file?.url)
}

// 判断是否可以下载
const canDownload = (file: any) => {
    return !!(file?.raw || file?.url)
}

// 打开预览
const openPreview = async (file: any) => {
    try {
        // 优先使用本地 raw 对象
        if (file?.raw) {
            isImage.value = file.raw.type?.startsWith('image/') ?? isImageFile(file)
            previewUrl.value = URL.createObjectURL(file.raw)
        }
        // 其次使用服务器URL
        else if (file?.url) {
            isImage.value = isImageFile(file)
            previewUrl.value = file.url
        } else {
            ElMessage.warning(COMMON_TEXT.FILE_INVALID_PREVIEW);
            return;
        }
        showDialog.value = true;
    } catch (err) {
        console.error('预览失败:', err);
        ElMessage.error(COMMON_TEXT.PREVIEW_FAILED);
    }
};

// 下载文件
const download = (file: any) => {
    try {
        let url = '';
        let filename = file?.name || file?.url?.split('/').pop() || '下载文件';

        // 优先使用本地 raw 对象
        if (file?.raw) {
            url = URL.createObjectURL(file.raw)
        }
        // 其次使用服务器URL
        else if (file?.url) {
            url = file.url
        } else {
            ElMessage.warning(COMMON_TEXT.FILE_INVALID_DOWNLOAD)
            return;
        }

        const a = document.createElement('a')
        a.href = url
        a.download = filename
        a.click()
        if (file?.raw) {
            URL.revokeObjectURL(url)
        }
    } catch (err) {
        console.error('下载失败:', err)
        ElMessage.error('下载失败')
    }
};

const handleDialogClose = () => {
    // 只释放本地创建的对象URL，不释放服务器URL
    if (previewUrl.value && !previewUrl.value.startsWith('http')) {
        URL.revokeObjectURL(previewUrl.value);
    }
    previewUrl.value = '';
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
    padding: 8px 12px;
    border: 1px solid var(--gray-200);
    border-radius: 6px;
    margin-bottom: 8px;
    background: var(--gray-50);

    .file-info-left {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 1;
        overflow: hidden;
        
        .el-icon {
            color: var(--gray-500);
        }
    }

    &:hover {
        border-color: var(--blue-300);
        background: var(--white);
    }
}

.file-thumb {
    width: 32px;
    height: 32px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--gray-100);
    color: var(--gray-400);
}

.file-name {
    font-size: 13px;
    color: var(--gray-700);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.btns {
    display: flex;
    gap: 4px;
}

.empty-tip {
    color: var(--gray-500);
    font-size: 13px;
    padding: 10px 0;
}

.preview-body {
    min-height: 40vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

.preview-img {
    max-width: 100%;
    max-height: 70vh;
}

.not-support {
    text-align: center;
    color: var(--gray-500);
    .el-icon {
        margin-bottom: 16px;
    }
}
</style>
