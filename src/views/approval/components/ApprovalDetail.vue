<template>
  <div class="approval-detail">
    <div class="detail-header">
      <div class="header-left">
        <h2 class="detail-title">{{ approval.title }}</h2>
        <div class="detail-meta">
          <el-tag size="small" :class="`tag-type-${approval.type}`">{{ approval.type }}</el-tag>
          <span class="meta-item">文号: {{ approval.docNo }}</span>
          <span class="meta-item">发起: {{ approval.author }}</span>
          <span class="meta-item">时间: {{ approval.createTime }}</span>
        </div>
      </div>
      <div class="header-right">
        <el-button type="primary" size="large" @click="handleAgree">同意</el-button>
        <el-button size="large" @click="handleReject">驳回</el-button>
      </div>
    </div>

    <div class="ai-card">
      <div class="card-title" @click="showAiDetail = !showAiDetail">
        <el-icon>
          <UserFilled />
        </el-icon>
        <span>AI 辅助分析</span>
        <el-icon class="toggle-icon" :class="{ rotate: showAiDetail }">
          <ArrowDown />
        </el-icon>
      </div>
      <div class="card-body" v-show="showAiDetail">
        <div class="ai-row">
          <span class="ai-label">关键标签</span>
          <div class="ai-tags">
            <el-tag v-for="tag in getKeyTags()" :key="tag" size="small">{{ tag }}</el-tag>
          </div>
        </div>
        <div class="ai-row">
          <span class="ai-label">处理建议</span>
          <p class="ai-suggestion">{{ getAiSuggestion() }}</p>
        </div>
      </div>
    </div>

    <div class="content-section">
      <h3 class="section-title">事项正文</h3>
      <div class="content-body" v-html="getContentHtml()"></div>
    </div>

    <!-- 审批流程 -->
    <div class="process-section">
      <h3 class="section-title">审批流程</h3>
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
                {{ item.status }}
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

const props = defineProps({ approval: Object })
const emit = defineEmits(['approve'])
const showAiDetail = ref(true)
// 用于格式化时间
const formatDate = (fullTime) => {
  return fullTime.split(' ')[0]
}
const formatTime = (fullTime) => {
  return fullTime.split(' ')[1]
}

const getKeyTags = () => {
  const type = props.approval?.type
  if (type === '民情事项') return ['民生诉求', '基层反馈', '需协调']
  if (type === '农业农村') return ['春耕补贴', '耕地核实', '惠农政策']
  if (type === '民政服务') return ['养老服务', '上门办理', '便民服务']
  if (type === '综治平安') return ['矛盾调解', '平安建设', '网格事件']
  return ['事项办理']
}

const getAiSuggestion = () => {
  const type = props.approval?.type
  if (type === '民情事项') return '建议1个工作日内联系群众核实情况，3个工作日内反馈处理结果。'
  if (type === '农业农村') return '建议尽快核实耕地面积，匹配最新惠农补贴政策，加快审批流程。'
  if (type === '民政服务') return '建议优先安排上门服务，做好老人信息登记，提升服务满意度。'
  if (type === '综治平安') return '建议立即介入调解，避免矛盾扩大，做好记录归档。'
  return '请按流程及时处理。'
}

const getContentHtml = () => {
  return props.approval?.processList?.[0]?.comment || '暂无内容'
}

const handleAgree = async () => {
  const btn = document.querySelector('.el-button--primary')
  if (btn) {
    btn.style.transform = 'scale(0.95)'
    btn.disabled = true
  }
  await new Promise(r => setTimeout(r, 300))

  ElMessageBox.prompt('请输入审批意见', '同意审批', {
    confirmButtonText: '确认', cancelButtonText: '取消'
  }).then(({ value }) => {
    emit('approve', { id: props.approval.id, result: 'agree', comment: value })
    ElMessage.success('已同意')
  }).catch(() => ElMessage.info('已取消'))

  setTimeout(() => {
    if (btn) {
      btn.style.transform = 'scale(1)'
      btn.disabled = false
    }
  }, 800)
}

const handleReject = () => {
  ElMessageBox.prompt('请输入驳回理由', '驳回审批', {
    confirmButtonText: '确认', cancelButtonText: '取消'
  }).then(({ value }) => {
    if (!value) return ElMessage.warning('请输入驳回理由')
    emit('approve', { id: props.approval.id, result: 'reject', comment: value })
    ElMessage.success('已驳回')
  }).catch(() => ElMessage.info('已取消'))
}
</script>

<style scoped lang="less">
.approval-detail {
  flex: 1;
  padding: 32px 40px;
  background: var(--gray-100);
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
        border-radius: 8px;
        padding: 12px 16px;
        box-shadow: var(--shadow-sm);

        .status-tag {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          color: #fff;
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