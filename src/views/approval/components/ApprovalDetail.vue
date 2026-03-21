<template>
  <!-- 审批详情页面：展示审批标题、状态、AI分析、正文、审批流程 -->
  <div class="approval-detail">
    <!-- 详情头部：标题、元信息、审批操作按钮 -->
    <div class="detail-header">
      <div class="header-left">
        <h2 class="detail-title">{{ approval.title }}</h2>
        <div class="detail-meta">
          <el-tag size="small" :class="`tag-type-${approval.type}`">{{ approval.type }}</el-tag>
          <span class="meta-item">{{ ApprovalDetailLocale.meta.docNo }} {{ approval.docNo }}</span>
          <span class="meta-item">{{ ApprovalDetailLocale.meta.author }} {{ approval.author }}</span>
          <span class="meta-item">{{ ApprovalDetailLocale.meta.time }} {{ approval.createTime }}</span>
        </div>
      </div>
      <div class="header-right" v-if="approval.status === 'in_progress'">
        <el-button type="primary" size="large" @click="handleApprove(ApprovalConsts.Action.AGREE)">{{
          ApprovalDetailLocale.button.agree }}</el-button>
        <el-button size="large" @click="handleApprove(ApprovalConsts.Action.REJECT)">{{
          ApprovalDetailLocale.button.reject }}</el-button>
      </div>
    </div>

    <!-- AI分析卡片：展示关键标签、处理建议，可折叠 -->
    <div class="ai-card">
      <div class="card-title" @click="showAiDetail = !showAiDetail">
        <el-icon>
          <UserFilled />
        </el-icon>
        <span>{{ ApprovalDetailLocale.title.aiAnalysis }}</span>
        <el-icon class="toggle-icon" :class="{ rotate: showAiDetail }">
          <ArrowDown />
        </el-icon>
      </div>
      <div class="card-body" v-show="showAiDetail">
        <div class="ai-row">
          <span class="ai-label">关键标签</span>
          <div class="ai-tags">
            <el-tag v-for="tag in getKeyTags" :key="tag" size="small">{{ tag }}</el-tag>
          </div>
        </div>
        <div class="ai-row">
          <span class="ai-label">处理建议</span>
          <p class="ai-suggestion">{{ getAiSuggestion }}</p>
        </div>
      </div>
    </div>

    <!-- 事项正文区域：渲染审批正文内容 -->
    <div class="content-section">
      <h3 class="section-title">事项正文</h3>
      <div class="content-body" v-html="getContentHtml()"></div>
    </div>

    <!-- 审批流程区域：展示审批时间线、处理人、状态、备注 -->
    <div class="process-section">
      <h3 class="section-title">{{ ApprovalDetailLocale.title.process }}</h3>
      <div class="custom-timeline">
        <div v-for="(item, index) in approval.processList" :key="index" class="timeline-item">
          <div class="timeline-left">
            <div class="timeline-time">
              <span class="date">{{ formatDate(item.time) }}</span>
              <span class="time">{{ formatTime(item.time) }}</span>
            </div>
          </div>
          <div class="timeline-center">
            <div class="timeline-dot" :class="`dot-${item.type}`"></div>
            <div class="timeline-line" v-if="index !== approval.processList.length - 1"></div>
          </div>
          <div class="timeline-right">
            <div class="timeline-content">
              <div class="status-tag" :class="`tag-${item.type}`">
                {{ getStatusText(item.status) }}
              </div>
              <div class="handler">
                {{ item.user }}
              </div>
              <div class="comment" v-if="item.comment">
                {{ item.comment }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { UserFilled, ArrowDown } from '@element-plus/icons-vue'
import {
  ApprovalStatusEnum,
  APPROVAL_STATUS_LABEL,
  AI_TAGS,
  AI_SUGGESTION,
  COMMON_TEXT,
  formatDateTime,
  ApprovalDetailLocale,
  ApprovalConsts,
  ApprovalActionMap,
} from '../utils/types'
import App from '@/App.vue'

// 接收父组件传递的审批项：展示对应审批的完整详情
const props = defineProps({
  approval: {
    type: Object,
    required: true
  }
})

// 定义向外触发的事件：审批操作（同意/拒绝）
const emit = defineEmits(['approve'])
// AI卡片折叠状态：控制AI分析区域显示/隐藏
const showAiDetail = ref(true)

// 获取状态文本：将审批状态码转换为中文显示
const getStatusText = (status) => {
  const entry = Object.entries(ApprovalActionMap).find(
    ([_, value]) => value.status === status
  );
  return entry ? entry[1].text : status;
}

// 格式化日期：提取时间中的日期部分
const formatDate = (fullTime) => formatDateTime(fullTime).date;
// 格式化时间：提取时间中的时分秒部分
const formatTime = (fullTime) => formatDateTime(fullTime).time;

// AI关键标签：根据审批类型匹配对应的标签
const getKeyTags = computed(() => {
  const type = props.approval?.type
  return AI_TAGS[type ?? 'DEFAULT'] || AI_TAGS['DEFAULT'];
})

// AI处理建议：根据审批类型匹配对应的建议
const getAiSuggestion = computed(() => {
  const type = props.approval?.type
  return AI_SUGGESTION[type ?? 'DEFAULT'] || AI_SUGGESTION['DEFAULT'];
})

// 获取正文内容：从审批流程中提取正文，无内容时显示默认文本
const getContentHtml = () => {
  return props.approval?.processList?.[0]?.comment || COMMON_TEXT.NO_ATTACHMENT
}

// 处理审批操作：弹窗输入备注，向父组件触发审批事件
const handleApprove = async (type) => {
  try {
    const msg = type === 'agree'
      ? COMMON_TEXT.FORM_REQUIRED_CONTENT
      : COMMON_TEXT.FORM_REQUIRED_CONTENT

    const confirmText = type === 'agree' ? ApprovalDetailLocale.button.confirm : ApprovalDetailLocale.button.cancel;
    const { value } = await ElMessageBox.prompt(
      msg,
      type === 'agree' ? ApprovalDetailLocale.button.agree : ApprovalDetailLocale.button.reject,
      {
        inputValidator: val => val.trim() !== '',
        confirmButtonText: confirmText,
        cancelButtonText: ApprovalDetailLocale.button.cancel,
        inputErrorMessage: COMMON_TEXT.APPROVAL_REQUIRE_COMMENT
      }
    )

    // 向父组件传递审批结果
    emit('approve', {
      id: props.approval.id,
      result: type,
      comment: value
    })

    // 提示审批成功
    const successMessage = type === ApprovalConsts.Action.AGREE
      ? ApprovalDetailLocale.message.agreeSuccess
      : ApprovalDetailLocale.message.rejectSuccess;
    ElMessage.success(successMessage);
    
  } catch (error) {
    // 取消审批时提示
    ElMessage.info(ApprovalDetailLocale.message.cancel);
  }
}
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
          background: var(--warning-color);
        }

        &.dot-danger {
          background: var(--red-500);
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