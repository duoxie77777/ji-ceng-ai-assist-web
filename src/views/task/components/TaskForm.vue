<template>
  <el-dialog v-model="visible" :title="isEdit ? '编辑任务' : '创建任务'" width="600px" :close-on-click-modal="false">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="任务名称" prop="title">
        <el-input v-model="form.title" placeholder="请输入任务名称" />
      </el-form-item>
      <el-form-item label="任务描述" prop="description">
        <el-input v-model="form.description" type="textarea" :rows="4" placeholder="请填写描述内容" />
      </el-form-item>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="截止日期" prop="deadline">
            <el-date-picker v-model="form.deadline" type="date" placeholder="选择截止日期" format="YYYY-MM-DD"
              value-format="YYYY-MM-DD" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="优先级" prop="priority">
            <el-select v-model="form.priority" placeholder="选择优先级">
              <el-option v-for="(label, value) in priorityOptions" :key="value" :label="label" :value="value" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="任务类型" prop="type">
            <el-select v-model="form.type" placeholder="选择任务类型">
              <el-option v-for="(label, value) in typeOptions" :key="value" :label="label" :value="value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="负责人" prop="assignee">
            <el-select v-model="form.assignee" placeholder="选择负责人">
              <el-option label="张审查员" value="张审查员" />
              <el-option label="李主任" value="李主任" />
              <el-option label="张建国" value="张建国" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item v-if="isEdit" label="任务进度" prop="progress">
        <el-slider v-model="form.progress" :min="0" :max="100" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { TaskPriority, TaskType, TaskStatus, TaskPriorityText, TaskTypeText } from '../utils/type'
import type { Task } from '../utils/type'

const props = defineProps<{ visible: boolean; task: Task; isEdit: boolean }>()
const emit = defineEmits<{ (e: 'update:visible', value: boolean): void; (e: 'save', task: Task): void }>()

const visible = ref(props.visible)
const formRef = ref<FormInstance>()
const form = reactive<Task>({
  id: 0,
  title: '',
  description: '',
  createTime: '',
  deadline: '',
  status: TaskStatus.PENDING,
  priority: TaskPriority.MEDIUM,
  type: TaskType.WORK,
  creator: '',
  assignee: '',
  progress: 0,
  attachments: [],
  logs: []
})

const priorityOptions = TaskPriorityText
const typeOptions = TaskTypeText

const rules = reactive<FormRules<Task>>({
  title: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
  description: [{ required: true, message: '请输入任务描述', trigger: 'blur' }],
  deadline: [{ required: true, message: '请选择截止日期', trigger: 'change' }],
  priority: [{ required: true, message: '请选择优先级', trigger: 'change' }],
  type: [{ required: true, message: '请选择任务类型', trigger: 'change' }],
  assignee: [{ required: true, message: '请选择负责人', trigger: 'change' }]
})

watch(() => props.visible, (val) => {
  visible.value = val
  if (val) Object.assign(form, props.task)
})
watch(visible, (val) => emit('update:visible', val))
watch(visible, (val) => { if (!val) formRef.value?.resetFields() })

const handleSubmit = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
    emit('save', { ...form })
  } catch {
    ElMessage.error('请填写完整任务信息')
  }
}
</script>

<style scoped></style>