<template>
  <div class="message-dialog">
    <!-- 通过插槽自定义内容 -->
    <slot />
  </div>
</template>

<script setup lang="ts">
// 这里主要作为二次封装的入口文件
// 实际的封装逻辑在对应的index.ts中导出
</script>

<style lang="less">
.el-message-box {
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  min-width: 380px;
}

/* 标题 */
.el-message-box__title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  text-align: center;
  margin: 0;
  padding: var(--spacing-lg) var(--spacing-xl) var(--spacing-md);
}

.el-message-box__header.show-close {
  padding-right: 0 !important;
}

/* 关闭按钮 */
.el-message-box__headerbtn {
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition-fast);
  transform: rotate(0deg);

  /* 增加可访问性 */
  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }

  /* 增加悬停状态的视觉反馈 */
  &:hover {
    transform: rotate(90deg);

    .el-message-box__close {
      color: var(--color-danger);
    }
  }
}


/* 内容 */
.el-message-box__content {
  padding: var(--spacing-sm) var(--spacing-xl) var(--spacing-md);
  font-size: 14px;
  color: var(--text-secondary);
  text-align: center;
  line-height: 1.5;
}

.el-message-box__message p {
  margin: 0;
  color: var(--text-secondary);
}

/* 图标 */
.el-message-box__message .el-icon {
  font-size: 32px;
  margin-bottom: var(--spacing-md);
  display: block;
}

.el-message-box__message .el-icon-success {
  color: var(--color-success);
}

.el-message-box__message .el-icon-warning {
  color: #f59e0b;
}

.el-message-box__message .el-icon-error {
  color: var(--color-danger);
}

.el-message-box__message .el-icon-info {
  color: var(--color-primary);
}

/* 按钮区域 */
.el-message-box__btns {
  padding: var(--spacing-lg) var(--spacing-xl) var(--spacing-xl);
  display: flex;
  justify-content: center;
  gap: var(--spacing-lg);
}

/* 按钮 - 使用主题变量 */
.el-button {
  padding: var(--spacing-sm) var(--spacing-xl);
  font-size: 14px;
  font-weight: 500;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  color: var(--text-secondary);
  min-width: 80px;
  height: 32px;
  line-height: 1;
  transition: var(--transition-fast);
}

.el-button:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  transform: translateY(-1px);
}

.el-button--primary {
  background: var(--color-primary);
  color: var(--text-white);
  border-color: var(--color-primary);
  box-shadow: var(--shadow-button-primary);
  transition: var(--transition-fast);
  outline: none !important;
}

.el-button--primary:hover {
  background: var(--color-primary-hover);
  border-color: var(--color-primary-hover);
  color: var(--text-white);
  transform: translateY(-1px);
  box-shadow: var(--shadow-button-hover);
}

/* 只有一个按钮时居中 */
.el-message-box__btns:has(.el-button:only-child) {
  .el-button {
    min-width: 100px;
  }
}

/* 不同类型的特殊背景 */
.el-message-box--success {
  .el-message-box__header {
    background: var(--color-success-bg);
  }
}

.el-message-box--warning {
  .el-message-box__header {
    background: #fffbeb;
  }
}

.el-message-box--error {
  .el-message-box__header {
    background: #fef2f2;
  }
}

.el-message-box--info {
  .el-message-box__header {
    background: var(--color-primary-light);
  }
}
</style>