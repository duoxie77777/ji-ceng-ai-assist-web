<template>
  <div class="contact-list-view">
    <div class="card-grid">
      <div v-for="item in filteredList" :key="item.id" class="contact-card" @click="emit('detail', item)">
        <div class="card-avatar">
          <el-avatar :size="68" :src="item.avatar">{{ item.name?.charAt(0) || '?' }}</el-avatar>
          <div v-if="type === ListType.FRIENDS && item.position" class="role-tag">
            {{ item.position.slice(0, 2) }}
          </div>
        </div>

        <div class="card-info">
          <div class="info-name">
            <span class="name-text">{{ item.name }}</span>
            <el-tag v-if="item.relation" size="small" type="info">{{ item.relation }}</el-tag>
          </div>
          <div v-if="item.position" class="info-position">{{ item.position }}</div>
          <div class="info-company">{{ item.company }}</div>
          <div v-if="item.department" class="info-dept">{{ item.department }}</div>
          <div v-if="item.mobile || item.email" class="info-meta">
            <span v-if="item.mobile">{{ item.mobile }}</span>
            <span v-if="item.email">{{ item.email }}</span>
          </div>
        </div>

        <div class="card-actions">
          <template v-if="type === ListType.FRIENDS">
            <el-button type="primary" link size="small" @click.stop="emit('chat', item)">聊天</el-button>
            <el-button v-if="item.mobile" type="success" link size="small"
              @click.stop="emit('call', item)">通话</el-button>
            <el-button type="danger" link size="small" @click.stop="emit('delete', item.id)">移除</el-button>
            <el-button type="warning" link size="small" @click.stop="emit('addToGroup', item)">分组</el-button>
          </template>
          <template v-else-if="type === ListType.REQUESTS">
            <el-button type="primary" size="small" @click.stop="emit('accept', item.id)">同意</el-button>
            <el-button size="small" @click.stop="emit('reject', item.id)">拒绝</el-button>
          </template>
          <template v-else-if="type === ListType.GROUPS">
            <el-button type="primary" link size="small" @click.stop="emit('joinGroup', item)">进入群聊</el-button>
          </template>
        </div>
      </div>
    </div>
    <div v-if="filteredList.length === 0" class="empty-placeholder">
      <el-empty description="暂无好友，去添加一个吧～" :image-size="120" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ListType, type ContactItem } from '../utils/contact'

type ListTypeProp = typeof ListType[keyof typeof ListType]

const props = defineProps<{
  type: ListTypeProp
  list: ContactItem[]
  searchKeyword: string
}>()

const emit = defineEmits([
  'detail', 'delete', 'chat', 'call', 'addToGroup',
  'accept', 'reject', 'joinGroup'
])

const filteredList = computed(() => {
  let arr = props.list
  const kw = props.searchKeyword.toLowerCase()
  if (kw) {
    arr = arr.filter(item =>
      item.name?.toLowerCase().includes(kw) ||
      item.company?.toLowerCase().includes(kw) ||
      item.department?.toLowerCase().includes(kw) ||
      item.position?.toLowerCase().includes(kw)
    )
  }
  return arr
})
</script>

<style scoped lang="scss">
.contact-list-view {
  .card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    gap: 24px;
  }

  .contact-card {
    display: flex;
    align-items: center;
    gap: 20px;
    background: linear-gradient(135deg, var(--white) 0%, var(--gray-50) 100%);
    border-radius: 28px;
    padding: 20px;
    transition: all 0.3s cubic-bezier(0.2, 0, 0, 1);
    cursor: pointer;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.02), 0 2px 4px rgba(0, 0, 0, 0.02);
    border: 1px solid rgba(0, 0, 0, 0.04);

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 35px -12px rgba(0, 0, 0, 0.15);
      border-color: var(--blue-200);
      background: var(--white);
    }

    .card-avatar {
      position: relative;
      flex-shrink: 0;
      width: 68px;
      height: 68px;

      :deep(.el-avatar) {
        width: 68px !important;
        height: 68px !important;
        font-size: 28px !important;
        background: linear-gradient(135deg, var(--blue-400), var(--blue-600));
        color: white;
        box-shadow: 0 6px 12px rgba(0, 100, 200, 0.2);
      }

      .role-tag {
        position: absolute;
        bottom: -2px;
        right: -2px;
        background: var(--blue-500);
        color: white;
        font-size: 11px;
        font-weight: 600;
        padding: 3px 8px;
        border-radius: 20px;
        white-space: nowrap;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
      }
    }

    .card-info {
      flex: 1;
      min-width: 0;

      .info-name {
        display: flex;
        align-items: baseline;
        gap: 10px;
        flex-wrap: wrap;
        margin-bottom: 8px;

        .name-text {
          font-weight: 700;
          font-size: 18px;
          color: var(--gray-900);
          letter-spacing: -0.2px;
        }

        .el-tag {
          font-size: 12px;
          padding: 0 8px;
          height: 22px;
          line-height: 20px;
        }
      }

      .info-position {
        color: var(--blue-600);
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 6px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .info-company,
      .info-dept {
        font-size: 13px;
        color: var(--gray-600);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-bottom: 2px;
      }

      .info-meta {
        font-size: 12px;
        color: var(--gray-500);
        display: flex;
        gap: 16px;
        margin-top: 10px;
        flex-wrap: wrap;

        span {
          display: inline-flex;
          align-items: center;
          gap: 4px;

          &::before {
            content: "📞";
            font-size: 11px;
            opacity: 0.6;
          }

          &:first-child::before {
            content: "📱";
          }

          &:last-child::before {
            content: "✉️";
          }
        }
      }
    }

    .card-actions {
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      gap: 8px;
      width: 70px;

      .el-button {
        font-size: 13px;
        padding: 5px 0;
        margin: 0;
        border-radius: 40px;
        transition: all 0.2s;

        &:hover {
          transform: scale(1.02);
        }
      }
    }
  }

  .empty-placeholder {
    grid-column: 1 / -1;
    text-align: center;
    padding: 80px 0;
    font-size: 16px;
    color: var(--gray-400);
  }
}
</style>