import { defineStore } from 'pinia'
import type { Task } from '@/views/task/utils/type'
import { TaskStatus, TaskPriority, TaskType } from '@/views/task/utils/type'

const getMockTasks = (): Task[] => [
  {
    id: 1,
    title: '李家村春耕补贴申请材料审核',
    description: '村民张建国提交的10亩耕地补贴申请，需核实面积和银行账户信息',
    createTime: '2026-04-01',
    deadline: '2026-04-10',
    status: TaskStatus.PENDING,
    priority: TaskPriority.HIGH,
    type: TaskType.WORK,
    creator: '张建国（村委）',
    assignee: '李主任',
    progress: 0,
    attachments: [],
    logs: [{ id: 1, operator: '系统', operation: '创建任务', time: '2026-04-01 09:00', remark: '来自审批流转' }]
  },
  {
    id: 2,
    title: '王家坳邻里纠纷调解',
    description: '两户村民因宅基地边界发生争执，需网格员现场调解并形成记录',
    createTime: '2026-04-02',
    deadline: '2026-04-08',
    status: TaskStatus.PROCESSING,
    priority: TaskPriority.HIGH,
    type: TaskType.INSPECTION,
    creator: '刘敏（网格员）',
    assignee: '何芸',
    progress: 30,
    attachments: [],
    logs: [{ id: 2, operator: '刘敏', operation: '创建任务', time: '2026-04-02 10:30', remark: '矛盾纠纷上报' }]
  },
  {
    id: 3,
    title: '敬老院养老资格认证上门服务',
    description: '3名80岁以上老人需上门办理人脸识别认证，请提前联系家属',
    createTime: '2026-04-03',
    deadline: '2026-04-15',
    status: TaskStatus.PENDING,
    priority: TaskPriority.MEDIUM,
    type: TaskType.WORK,
    creator: '陈丽（便民中心）',
    assignee: '张主任',
    progress: 0,
    attachments: [],
    logs: [{ id: 3, operator: '系统', operation: '创建任务', time: '2026-04-03 08:00', remark: '来自服务窗预约' }]
  },
  {
    id: 4,
    title: '杨梅坑水库安全隐患排查报告',
    description: '巡查发现坝体轻微渗漏，需邀请水利专家评估并出具报告',
    createTime: '2026-03-30',
    deadline: '2026-04-12',
    status: TaskStatus.PENDING,
    priority: TaskPriority.HIGH,
    type: TaskType.INSPECTION,
    creator: '赵安（应急办）',
    assignee: '王副镇长',
    progress: 0,
    attachments: [],
    logs: [{ id: 4, operator: '赵安', operation: '创建任务', time: '2026-03-30 14:00', remark: '安全检查发现' }]
  },
  {
    id: 5,
    title: '12345热线工单：村道路灯不亮',
    description: '群众反映村道5盏路灯损坏，影响夜间出行，需安排维修',
    createTime: '2026-04-04',
    deadline: '2026-04-09',
    status: TaskStatus.PENDING,
    priority: TaskPriority.MEDIUM,
    type: TaskType.WORK,
    creator: '系统转办',
    assignee: '供电所',
    progress: 0,
    attachments: [],
    logs: [{ id: 5, operator: '系统', operation: '创建任务', time: '2026-04-04 09:15', remark: '来自12345热线' }]
  }
]

export const useTaskStore = defineStore('task', {
  state: () => ({
    tasks: [] as Task[],
    loading: false
  }),
  getters: {
    pendingCount: (state) => state.tasks.filter(t => t.status === TaskStatus.PENDING || t.status === TaskStatus.PROCESSING).length,
    overdueCount: (state) => state.tasks.filter(t => t.status === TaskStatus.OVERDUE).length,
    completedCount: (state) => state.tasks.filter(t => t.status === TaskStatus.COMPLETED).length,
    highPriorityCount: (state) => state.tasks.filter(t => t.priority === TaskPriority.HIGH).length,
  },
  actions: {
    setTasks(tasks: Task[]) { this.tasks = tasks },
    addTask(task: Task) { this.tasks.unshift(task) },
    updateTask(updated: Task) {
      const index = this.tasks.findIndex(t => t.id === updated.id)
      if (index !== -1) this.tasks[index] = updated
    },
    deleteTask(id: number) { this.tasks = this.tasks.filter(t => t.id !== id) },
    fetchTasks() {
      if (this.tasks.length === 0) this.tasks = getMockTasks()
    }
  }
})

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: {
      avatar: '',
      name: '',
      username: '',
      email: '',
      phone: '',
      province: '',
      city: '',
      address: '',
      zipCode: '',
      position: '',
      department: ''
    },
    initialized: false
  }),
  actions: {
    initUserInfo() {
      // 模拟后端返回的数据（不持久化）
      this.userInfo = {
        avatar: 'https://cube.elemecdn.com/0/88/03b01d2d5f2b9e2e7d5f8e2e7d5f8e2e.png',
        name: '张明',
        username: 'zhangming',
        email: 'zhangming@example.com',
        phone: '13912345678',
        province: '浙江省',
        city: '杭州市',
        address: '西湖区xx路18号',
        zipCode: '310000',
        position: '高级产品经理',
        department: '产品研发部'
      }
      this.initialized = true
    },
    updateUserInfo(data: Partial<UserInfo>) {
      this.userInfo = { ...this.userInfo, ...data }
    },
    logout() {
      this.userInfo = {} as UserInfo
      this.initialized = false
    }
  }
})