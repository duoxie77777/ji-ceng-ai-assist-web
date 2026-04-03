<template>
  <div class="system-settings">
    <el-card class="info-card">
      <template #header>
        <svg-icon name="jiqiren" size="24" />
        智能助手</template>
      <el-form label-width="160px">
        <el-form-item label="智能会议摘要"><el-switch v-model="aiSettings.summary" @change="saveAI" /></el-form-item>
        <el-form-item label="实时预警推送"><el-switch v-model="aiSettings.alert" /></el-form-item>
        <el-form-item label="建议阈值"><el-slider v-model="aiSettings.threshold" :min="0" :max="100" /></el-form-item>
      </el-form>
    </el-card>
    <el-card class="info-card mt-4">
      <template #header>
        <svg-icon name="locked__easyi" size="24" />
        数据安全</template>
      <el-form><el-form-item label="操作日志审计"><el-switch v-model="security.audit" /></el-form-item></el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
const aiSettings = reactive({ summary: true, alert: true, threshold: 85 })
const security = reactive({ audit: true })
const saveAI = () => console.log('设置已保存')
</script>

<style scoped lang="scss">
.system-settings {
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