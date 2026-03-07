<template>
  <el-form label-width="100px" class="create-form">
    <el-form-item label="事项类型" required>
      <el-select v-model="form.type" placeholder="请选择">
        <el-option label="民情事项" value="民情事项" />
        <el-option label="农业农村" value="农业农村" />
        <el-option label="民政服务" value="民政服务" />
        <el-option label="综治平安" value="综治平安" />
      </el-select>
    </el-form-item>

    <el-form-item label="事项标题" required>
      <el-input v-model="form.title" placeholder="请输入" />
    </el-form-item>

    <el-form-item label="负责人员" required>
      <el-select v-model="form.chargeUsers" multiple placeholder="选择负责领导">
        <el-option label="李主任（农业）" value="李主任" />
        <el-option label="张主任（民政）" value="张主任" />
        <el-option label="何芸（综治）" value="何芸" />
        <el-option label="王副镇长" value="王副镇长" />
      </el-select>
    </el-form-item>

    <el-form-item label="内容说明">
      <el-input v-model="form.content" type="textarea" rows="4" />
    </el-form-item>

    <div class="btns">
      <el-button @click="emit('cancel')">取消</el-button>
      <el-button type="primary" @click="submit">提交上报</el-button>
    </div>
  </el-form>
</template>

<script setup>
import { ref } from 'vue'
const emit = defineEmits(['submit', 'cancel'])
const form = ref({
  type: '',
  title: '',
  content: '',
  chargeUsers: [],
  fileList: []
})
const submit = () => emit('submit', form.value)
</script>

<style scoped lang="less">
.create-form {
  padding: 20px 0;
  animation: fadeIn 0.35s ease;
}

.btns {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 20px;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>