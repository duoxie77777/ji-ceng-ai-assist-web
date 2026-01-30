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
  border-radius: 8px;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--gray-200);
  background: var(--white);
  min-width: 380px;
}

/* 标题 */
.el-message-box__title {
  font-size: 16px;
  font-weight: 600;
  color: var(--gray-900);
  text-align: center;
  margin: 0;
  padding: 16px 24px 12px;
}

.el-message-box__header.show-close {
  padding-right: 0 !important;
}

/* 关闭按钮 */
.el-message-box__headerbtn {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  transform: rotate(0deg);

  /* 增加可访问性 */
  &:focus-visible {
    outline: 2px solid var(--blue-500);
    outline-offset: 2px;
  }

  /* 增加悬停状态的视觉反馈 */
  &:hover {
    transform: rotate(90deg);

    .el-message-box__close {
      color: var(--red-500);
    }
  }
}


/* 内容 */
.el-message-box__content {
  padding: 8px 24px 12px;
  color: var(--gray-600);
  border-radius: 16px;
}

.el-message-box__message p {
  margin: 0;
  color: var(--gray-600);
}

/* 图标 */
.el-message-box__message .el-icon {
  font-size: 32px;
  margin-bottom: 12px;
  display: block;
}

.el-message-box__message .el-icon-success {
  color: var(--green-500);
}

.el-message-box__message .el-icon-warning {
  color: #f59e0b;
}

.el-message-box__message .el-icon-error {
  color: var(--red-500);
}

.el-message-box__message .el-icon-info {
  color: var(--blue-500);
}

/* 按钮区域 */
.el-message-box__btns {
  padding: 16px 24px 24px;
  display: flex;
  justify-content: center !important;
  gap: 16px;
}

/* 按钮 - 使用主题变量 */
.el-button {
  padding: 8px 24px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 6px;
  border: 1px solid var(--gray-200);
  background: var(--white);
  color: var(--gray-600);
  min-width: 80px;
  height: 32px;
  line-height: 1;
  transition: all 0.2s;
}

.el-button:hover {
  border-color: var(--blue-500);
  color: var(--blue-500);
  transform: translateY(-1px);
}

.el-button--primary {
  background: var(--blue-500);
  color: var(--white);
  border-color: var(--blue-500);
  box-shadow: var(--shadow-blue);
  transition: all 0.2s;
  outline: none !important;
}

.el-button--primary:hover {
  background: var(--blue-400);
  border-color: var(--blue-400);
  color: var(--white);
  transform: translateY(-1px);
  box-shadow: var(--shadow-blue-lg);
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
    background: var(--green-50);
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
    background: var(--blue-50);
  }
}
</style>