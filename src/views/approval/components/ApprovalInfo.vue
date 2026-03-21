<template>
    <!-- 审批信息侧边栏：展示审批详情、文件附件 -->
    <div class="approval-info">
        <!-- 审批信息分段展示：基本信息/收发信息 -->
        <template v-for="(section, index) in renderSections" :key="index">
      <div class="info-section">
        <h4>{{ section.title }}</h4>
        <el-descriptions :column="1" border>
          <el-descriptions-item
            v-for="item in section.fields"
            :key="item.prop"
            :label="item.label"
          >
            {{ item.formatter ? item.formatter(approval[item.prop]) : (approval[item.prop] || '-') }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </template>

        <!-- 附件展示区域：渲染上传的附件列表 -->
        <div class="file-section">
            <h3>文件信息</h3>
            <AttachmentFiles :files="approval.files || []" />
        </div>
    </div>
</template>

<script setup lang="ts">
import type { ApprovalItem, ApprovalFieldConfig } from '../utils/types'
import AttachmentFiles from './AttachmentFiles.vue'
import { APPROVAL_INFO_FIELDS, APPROVAL_SEND_FIELDS } from '../utils/types'

defineProps<{
    approval: ApprovalItem
}>()

// 渲染分段配置：拆分审批信息为不同板块展示
const renderSections: Array<{ title: string; fields: ApprovalFieldConfig[] }> = [
  { title: '审批基本信息', fields: APPROVAL_INFO_FIELDS },
  { title: '收发信息', fields: APPROVAL_SEND_FIELDS },
]
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
        color: var(--gray-900);
    }
}
</style>