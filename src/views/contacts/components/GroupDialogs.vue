<template>
  <!-- 新建分组弹窗 -->
  <el-dialog v-model="localAddGroupVisible" title="新建智能分组" width="400px">
    <el-input v-model="newGroupName" placeholder="分组名称，如：重点项目组" />
    <template #footer>
      <el-button @click="localAddGroupVisible = false">取消</el-button>
      <el-button type="primary" @click="handleAddGroup">确认</el-button>
    </template>
  </el-dialog>

  <!-- 重命名分组弹窗 -->
  <el-dialog v-model="localRenameGroupVisible" title="重命名分组" width="400px">
    <el-input v-model="renameForm.name" placeholder="新分组名称" />
    <template #footer>
      <el-button @click="localRenameGroupVisible = false">取消</el-button>
      <el-button type="primary" @click="handleRenameGroup">确认</el-button>
    </template>
  </el-dialog>

  <!-- 添加到分组弹窗（为好友选择分组） -->
  <el-dialog v-model="localAddToGroupVisible" title="添加到分组" width="400px">
    <div v-if="currentFriend">
      <p>将 {{ currentFriend.name }} 添加到：</p>
      <el-checkbox-group v-model="selectedGroupIds">
        <el-checkbox v-for="group in customGroups" :key="group.id" :label="group.id">
          {{ group.name }}
        </el-checkbox>
      </el-checkbox-group>
    </div>
    <template #footer>
      <el-button @click="localAddToGroupVisible = false">取消</el-button>
      <el-button type="primary" @click="handleAddToGroup">确认</el-button>
    </template>
  </el-dialog>

  <!-- 选择联系人加入分组弹窗（从分组内添加） -->
  <el-dialog v-model="localAddFriendToGroupVisible" title="选择联系人加入分组" width="500px">
    <el-select v-model="selectedFriendId" placeholder="请选择联系人" style="width: 100%">
      <el-option v-for="friend in friends" :key="friend.id" :label="friend.name" :value="friend.id" />
    </el-select>
    <template #footer>
      <el-button @click="localAddFriendToGroupVisible = false">取消</el-button>
      <el-button type="primary" @click="handleAddFriendToGroup">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  addGroupVisible: boolean
  renameGroupVisible: boolean
  addToGroupVisible: boolean
  addFriendToGroupVisible: boolean
  customGroups: any[]
  friends: any[]
  friendGroupMaps: any[]
  currentFriend: any | null
  currentGroup: any | null
}>()

const emit = defineEmits([
  'update:addGroupVisible',
  'update:renameGroupVisible',
  'update:addToGroupVisible',
  'update:addFriendToGroupVisible',
  'addGroup',
  'renameGroup',
  'addToGroup',
  'addFriendToGroup'
])

// 双向绑定弹窗显示状态
const localAddGroupVisible = computed({
  get: () => props.addGroupVisible,
  set: (val) => emit('update:addGroupVisible', val)
})
const localRenameGroupVisible = computed({
  get: () => props.renameGroupVisible,
  set: (val) => emit('update:renameGroupVisible', val)
})
const localAddToGroupVisible = computed({
  get: () => props.addToGroupVisible,
  set: (val) => emit('update:addToGroupVisible', val)
})
const localAddFriendToGroupVisible = computed({
  get: () => props.addFriendToGroupVisible,
  set: (val) => emit('update:addFriendToGroupVisible', val)
})

// 表单数据
const newGroupName = ref('')
const renameForm = ref({ id: 0, name: '' })
const selectedGroupIds = ref<number[]>([])
const selectedFriendId = ref<number>(0)

// 监听弹窗打开，初始化数据
import { watch } from 'vue'
watch(() => props.renameGroupVisible, (visible) => {
  if (visible && props.currentGroup) {
    renameForm.value = { id: props.currentGroup.id, name: props.currentGroup.name }
  }
})
watch(() => props.addToGroupVisible, (visible) => {
  if (visible && props.currentFriend) {
    // 预选该好友已加入的分组
    selectedGroupIds.value = props.friendGroupMaps
      .filter(m => m.friendId === props.currentFriend.id)
      .map(m => m.groupId)
  }
})

// 事件处理
const handleAddGroup = () => {
  if (newGroupName.value.trim()) {
    emit('addGroup', newGroupName.value.trim())
    newGroupName.value = ''
    localAddGroupVisible.value = false
  }
}
const handleRenameGroup = () => {
  if (renameForm.value.name.trim()) {
    emit('renameGroup', renameForm.value.id, renameForm.value.name.trim())
    localRenameGroupVisible.value = false
  }
}
const handleAddToGroup = () => {
  if (props.currentFriend) {
    emit('addToGroup', props.currentFriend.id, selectedGroupIds.value)
    localAddToGroupVisible.value = false
  }
}
const handleAddFriendToGroup = () => {
  if (selectedFriendId.value && props.currentGroup) {
    emit('addFriendToGroup', selectedFriendId.value, props.currentGroup.id)
    selectedFriendId.value = 0
    localAddFriendToGroupVisible.value = false
  }
}
</script>