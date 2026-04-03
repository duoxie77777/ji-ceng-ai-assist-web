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
    grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
    gap: 16px;
  }

  .contact-card {
    display: flex;
    align-items: center;
    gap: 16px;
    background: var(--white);
    border-radius: 8px;
    padding: 16px;
    transition: all 0.2s;
    cursor: pointer;
    border: 1px solid var(--gray-200);

    &:hover {
      border-color: var(--gray-300);
    }

    .card-avatar {
      position: relative;
      flex-shrink: 0;
      width: 56px;
      height: 56px;

      :deep(.el-avatar) {
        width: 56px !important;
        height: 56px !important;
        font-size: 22px !important;
        background: var(--gray-200);
        color: var(--gray-700);
      }

      .role-tag {
        position: absolute;
        bottom: -2px;
        right: -2px;
        background: var(--gray-700);
        color: white;
        font-size: 10px;
        font-weight: 500;
        padding: 2px 6px;
        border-radius: 4px;
        white-space: nowrap;
      }
    }

    .card-info {
      flex: 1;
      min-width: 0;

      .info-name {
        display: flex;
        align-items: baseline;
        gap: 8px;
        flex-wrap: wrap;
        margin-bottom: 6px;

        .name-text {
          font-weight: 600;
          font-size: 16px;
          color: var(--gray-900);
        }

        .el-tag {
          font-size: 11px;
          padding: 0 6px;
          height: 20px;
          line-height: 18px;
        }
      }

      .info-position {
        color: var(--gray-700);
        font-size: 13px;
        font-weight: 400;
        margin-bottom: 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .info-company,
      .info-dept {
        font-size: 12px;
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
        gap: 12px;
        margin-top: 8px;
        flex-wrap: wrap;

        span {
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
      }
    }

    .card-actions {
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      gap: 6px;
      width: 60px;

      .el-button {
        font-size: 12px;
        padding: 4px 0;
        margin: 0;
      }
    }
  }

  .empty-placeholder {
    grid-column: 1 / -1;
    text-align: center;
    padding: 60px 0;
    font-size: 14px;
    color: var(--gray-400);
  }
}
</style>