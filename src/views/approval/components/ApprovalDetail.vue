<template>
  <div class="approval-detail">
    <div class="detail-header">
      <div>
        <h2 class="detail-title">{{ approval.title }}</h2>
        <div class="detail-meta">
          <el-tag size="small" :type="TagTypeEnum.PRIMARY">{{ approval.type }}</el-tag>
          <span class="meta-item">文号: {{ approval.docNo }}</span>
          <span class="meta-item">发起: {{ approval.author }}</span>
          <span class="meta-item">时间: {{ approval.createTime }}</span>
        </div>
      </div>
      <div v-if="canShowOperateBtn && approval.status === ApprovalStatusEnum.IN_PROGRESS" class="header-right">
        <el-button type="primary" size="large" @click="handleApprove(ApprovalActionEnum.AGREE)">同意</el-button>
        <el-button size="large" @click="handleApprove(ApprovalActionEnum.REJECT)">驳回</el-button>
      </div>
    </div>

    <div class="ai-card">
      <div class="card-title" @click="showAiDetail = !showAiDetail">
        <el-icon>
          <UserFilled />
        </el-icon><span>AI 辅助分析</span>
        <el-icon class="toggle-icon" :class="{ rotate: showAiDetail }">
          <ArrowDown />
        </el-icon>
      </div>
      <div class="card-body" v-show="showAiDetail">
        <div class="ai-row"><span class="ai-label">关键标签</span>
          <div class="ai-tags"><el-tag v-for="tag in getKeyTags" :key="tag" size="small">{{ tag }}</el-tag></div>
        </div>
        <div class="ai-row"><span class="ai-label">处理建议</span>
          <p class="ai-suggestion">{{ getAiSuggestion }}</p>
        </div>
      </div>
    </div>

    <div class="content-section">
      <h3 class="section-title">事项正文</h3>
      <div class="content-body" v-html="getContentHtml()"></div>
    </div>

    <div class="process-section">
      <h3 class="section-title">审批流程</h3>
      <div class="custom-timeline">
        <div v-for="(item, idx) in approval.processList" :key="idx" class="timeline-item">
          <div class="timeline-left">
            <div class="timeline-time"><span class="date">{{ formatDate(item.time) }}</span><span class="time">{{
              formatTime(item.time) }}</span></div>
          </div>
          <div class="timeline-center">
            <div class="timeline-dot" :class="`dot-${item.type}`"></div>
            <div class="timeline-line" v-if="idx !== approval.processList.length - 1"></div>
          </div>
          <div class="timeline-right">
            <div class="timeline-content">
              <div class="status-tag" :class="`tag-${item.type}`">{{ getStatusText(item.status) }}</div>
              <div class="handler">{{ item.user }}</div>
              <div class="comment" v-if="item.comment">{{ item.comment }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { UserFilled, ArrowDown } from '@element-plus/icons-vue';
import {
  ApprovalStatusEnum,
  ApprovalActionEnum,
  ApprovalActionMap,
  TagTypeEnum,
  AI_TAGS,
  AI_SUGGESTION,
  COMMON_TEXT,
  CURRENT_USER
} from '../utils/types';
import type { ApprovalItem } from '../utils/types';

const props = defineProps<{ approval: ApprovalItem }>();
const emit = defineEmits(['approve']);

const canShowOperateBtn = computed(() => props.approval.author !== CURRENT_USER && props.approval.status === ApprovalStatusEnum.IN_PROGRESS);
const showAiDetail = ref(true);

const getStatusText = (status: string) => {
  const entry = Object.values(ApprovalActionMap).find(v => v.status === status);
  return entry ? entry.text : status;
};
const formatDate = (full: string) => full.split(' ')[0];
const formatTime = (full: string) => full.split(' ')[1];
const getKeyTags = computed(() => AI_TAGS[props.approval.type] || AI_TAGS.DEFAULT);
const getAiSuggestion = computed(() => AI_SUGGESTION[props.approval.type] || AI_SUGGESTION.DEFAULT);
const getContentHtml = () => props.approval.processList[0]?.comment || COMMON_TEXT.NO_ATTACHMENT;

const handleApprove = async (type: ApprovalActionEnum) => {
  const isAgree = type === ApprovalActionEnum.AGREE;
  const msg = isAgree ? '请输入审批意见' : '请输入驳回理由';
  const title = isAgree ? '同意审批' : '驳回审批';
  try {
    const { value: comment } = await ElMessageBox.prompt(msg, title, {
      inputValidator: val => val.trim() !== '',
      confirmButtonText: isAgree ? '确认同意' : '确认驳回',
      cancelButtonText: '取消',
      inputErrorMessage: '请输入内容'
    });
    emit('approve', { id: props.approval.id, result: type, comment });
    ElMessage.success(isAgree ? '已同意' : '已驳回');
  } catch (err) {
    if (err !== 'cancel') ElMessage.error('操作失败');
    else ElMessage.info('已取消');
  }
};
</script>

<style scoped lang="less">
.approval-detail {
  flex: 1;
  padding: 40px;
  background: var(--gray-50);
  overflow-y: auto;

  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding-bottom: 24px;
    border-bottom: 1px solid var(--gray-200);
    margin-bottom: 24px;

    .detail-title {
      font-size: 28px;
      font-weight: 700;
      color: var(--gray-900);
      margin-bottom: 16px;
    }

    .detail-meta {
      display: flex;
      align-items: center;
      gap: 20px;
      flex-wrap: wrap;

      .tag-type-民情事项 {
        color: var(--purple-500);
        background: var(--blue-50);
        border-color: var(--blue-200);
      }

      .tag-type-农业农村 {
        color: var(--green-500);
        background: var(--green-50);
        border-color: var(--green-50);
      }

      .tag-type-民政服务 {
        color: var(--mint-500);
        background: var(--mint-50);
        border-color: var(--mint-200);
      }

      .tag-type-综治平安 {
        color: var(--red-500);
        background: var(--red-50);
        border-color: var(--red-50);
      }

      .meta-item {
        font-size: 15px;
        color: var(--gray-600);
      }
    }

    .header-right {
      display: flex;
      gap: 12px;
    }

    .el-button {
      padding: 12px 24px;
      font-size: 15px;
      font-weight: 500;
      border-radius: 8px;
      transition: all 0.3s ease;

      &--primary {
        background: var(--blue-500);
        border-color: var(--blue-500);

        &:hover {
          background: var(--blue-400);
          border-color: var(--blue-400);
          transform: translateY(-2px);
          box-shadow: var(--shadow-blue);
        }
      }

      &--danger {
        background: var(--red-500);
        border-color: var(--red-500);

        &:hover {
          background: var(--red-600);
          border-color: var(--red-600);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
      }

      &--default {
        &:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
      }
    }
  }

  .ai-card,
  .content-section,
  .process-section {
    background: var(--white);
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: var(--shadow-md);
    transition: all 0.3s ease;

    &:hover {
      box-shadow: var(--shadow-lg);
      transform: translateY(-2px);
    }

    .card-title,
    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--gray-900);
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
  }
}

/* 自定义时间线样式*/
.custom-timeline {
  position: relative;
  padding-left: 0;

  .timeline-item {
    display: flex;
    margin-bottom: 24px;
    position: relative;

    .timeline-left {
      width: 120px;
      flex-shrink: 0;
      padding-right: 16px;
      text-align: right;

      .timeline-time {
        display: flex;
        flex-direction: column;
        gap: 4px;

        .date {
          font-size: 14px;
          color: var(--gray-600);
        }

        .time {
          font-size: 12px;
          color: var(--gray-500);
        }
      }
    }

    .timeline-center {
      width: 20px;
      flex-shrink: 0;
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;

      .timeline-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: var(--gray-300);
        z-index: 2;

        &.dot-primary {
          background: var(--blue-500);
        }

        &.dot-success {
          background: var(--green-500);
        }

        &.dot-warning {
          background: var(--orange-500);
        }

        &.tag-warning {
          background: var(--orange-500);
        }
      }

      .timeline-line {
        width: 2px;
        height: 100%;
        background: var(--gray-200);
        position: absolute;
        top: 12px;
        z-index: 1;
      }
    }

    .timeline-right {
      flex: 1;

      .timeline-content {
        background: var(--white);
        border-left: 4px solid var(--gray-300);
        box-shadow: var(--shadow-sm);
        padding: 12px 16px;

        .status-tag {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          color: var(--white);
          margin-bottom: 8px;

          &.tag-primary {
            background: var(--blue-500);
          }

          &.tag-success {
            background: var(--green-500);
          }

          &.tag-warning {
            background: var(--warning-color);
          }

          &.tag-danger {
            background: var(--red-500);
          }
        }

        .handler {
          font-size: 14px;
          color: var(--gray-700);
          margin-bottom: 4px;
        }

        .comment {
          font-size: 13px;
          color: var(--gray-600);
          line-height: 1.5;
        }
      }
    }
  }
}
</style>