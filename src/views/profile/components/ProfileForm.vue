<template>
  <div class="profile-form">
    <el-card shadow="never" class="info-card">
      <template #header>
        <div class="card-header">
          <span>
            <svg-icon name="notepad__easy" size="20" />
            个人档案</span>
          <el-button v-if="!isEditing" type="primary" plain size="small" @click="enterEditMode">
            <el-icon>
              <Edit />
            </el-icon> 编辑档案
          </el-button>
          <span v-else>
            <el-button type="primary" size="small" @click="saveProfile">保存</el-button>
            <el-button size="small" @click="cancelEdit">取消</el-button>
          </span>
        </div>
      </template>

      <el-form :model="formData" :rules="rules" ref="formRef" label-width="100px">
        <el-row :gutter="20">
          <el-col v-for="field in PROFILE_FIELDS" :key="field.prop" :span="field.span">
            <el-form-item :label="field.label" :prop="field.prop">
              <el-input v-model="formData[field.prop]" :disabled="!isEditing" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="地址">
          <el-row :gutter="16">
            <el-col v-for="addr in ADDRESS_FIELDS" :key="addr.prop" :span="addr.span">
              <el-input v-model="formData[addr.prop]" :placeholder="addr.label" :disabled="!isEditing" />
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="偏好设置">
          <el-select v-model="formData.zipCode" :disabled="!isEditing" placeholder="智能摘要频率">
            <el-option label="每日推送" value="daily" /><el-option label="实时预警" value="realtime" />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Edit } from '@element-plus/icons-vue'
import type { UserInfo } from '../utils/personal'
import { PROFILE_FIELDS, ADDRESS_FIELDS } from '../utils/personal'

const props = defineProps<{ user: UserInfo }>()
const emit = defineEmits(['updateProfile'])



const isEditing = ref(false)
const formData = reactive({ ...props.user })
watch(() => props.user, (val) => {
  Object.assign(formData, val)
}, { deep: true, immediate: true })

const saveProfile = () => {
  emit('updateProfile', formData)
  isEditing.value = false
  ElMessage.success('档案已更新')
}
const cancelEdit = () => {
  Object.assign(formData, props.user)
  isEditing.value = false
}
const enterEditMode = () => { isEditing.value = true }
</script>

<style scoped lang="scss">
.profile-form {
  .info-card {
    border-radius: 24px;
    background: var(--white);
    box-shadow: var(--shadow-sm);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--gray-200);
    padding-bottom: 12px;
  }

  :deep(.el-input__wrapper) {
    border-radius: 12px;
  }
}
</style>