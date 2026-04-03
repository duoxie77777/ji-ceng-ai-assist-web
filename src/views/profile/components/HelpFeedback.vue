<script setup lang="ts">

</script>

<template>
  <div class="help-feedback">
    <el-card class="info-card">
      <template #header>
        <svg-icon name="naozi" size="24" />
        常见问题</template>
      <el-collapse>
        <el-collapse-item title="如何开启智能摘要？">
          <p>在系统设置→智能助手中开启即可。</p>
        </el-collapse-item>
        <el-collapse-item title="如何联系人工客服？">
          <p>请通过反馈表单提交，我们会在1个工作日内回复。</p>
        </el-collapse-item>
      </el-collapse>
    </el-card>
    <el-card class="info-card mt-4">
      <template #header>
        <svg-icon name="laba" size="24" />
        反馈通道</template>
      <el-form><el-form-item label="问题描述"><el-input type="textarea" rows="3" placeholder="请描述您遇到的问题" /></el-form-item>
        <el-button type="primary">提交反馈</el-button></el-form>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.help-feedback {
  .info-card {
    border-radius: 24px;
    background: var(--white);
    box-shadow: var(--shadow-sm);
    margin-bottom: 20px;
  }

  .mt-4 {
    margin-top: 20px;
  }
}
</style>