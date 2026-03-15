<template>
    <div class="approval-info">
        <div class="info-section">
            <h4>审批基本信息</h4>
            <el-descriptions :column="1" border>
                <el-descriptions-item label="申请编号">{{ approval.id }}</el-descriptions-item>
                <el-descriptions-item label="项目类型">{{ approval.type }}</el-descriptions-item>
                <el-descriptions-item label="拟稿人">{{ approval.author }}</el-descriptions-item>
                <el-descriptions-item label="批文文号">{{ approval.docNo }}</el-descriptions-item>
            </el-descriptions>
        </div>

        <div class="info-section">
            <h4>收发信息</h4>
            <el-descriptions :column="1" border>
                <el-descriptions-item label="主送">{{ approval.mainSend }}</el-descriptions-item>
                <el-descriptions-item label="分送">{{ approval.ccList.join('、') }}</el-descriptions-item>
            </el-descriptions>
        </div>

        <div class="file-section">
            <h3>文件信息</h3>
            <AttachmentFiles :files="approval.files" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { Document, View, Download } from '@element-plus/icons-vue'
import type { ApprovalItem } from '../utils/types'
import AttachmentFiles from './AttachmentFiles.vue'

defineProps<{
    approval: ApprovalItem
}>()
</script>

<style scoped lang="less">
.approval-info {
    width: 380px;
    background: var(--white);
    border-left: 1px solid var(--gray-200);
    height: 100%;
    overflow-y: auto;
    padding: 32px 24px;
    box-shadow: -2px 0 12px var(--shadow-md);

    .info-section {
        margin-bottom: 32px;

        .section-title {
            font-size: 16px;
            font-weight: 600;
            color: var(--gray-900);
            margin-bottom: 16px;
            padding-bottom: 8px;
            border-bottom: 2px solid var(--blue-500);
        }

        .info-item {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px dashed var(--gray-200);

            .label {
                color: var(--gray-600);
                font-size: 14px;
            }

            .value {
                color: var(--gray-900);
                font-size: 14px;
                font-weight: 500;
                text-align: right;
            }
        }
    }

    .create-btn-wrapper {
        position: sticky;
        bottom: 0;
        background: var(--white);
        padding-top: 16px;
        border-top: 1px solid var(--gray-200);

        .el-button {
            width: 100%;
            padding: 14px;
            font-size: 16px;
            font-weight: 600;
            border-radius: 8px;
            background: var(--blue-500);
            border-color: var(--blue-500);
            transition: all 0.3s ease;

            &:hover {
                background: var(--blue-400);
                border-color: var(--blue-400);
                transform: translateY(-2px);
                box-shadow: var(--shadow-blue);
            }
        }
    }

    .file-section {
        margin-top: 20px;
    }

    .file-section h3 {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 12px;
    }
}
</style>