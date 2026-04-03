<template>
  <div class="workbench-container">
    <div class="dashboard-content">
      <div class="two-columns">
        <!-- 左侧列 -->
        <div class="left-column">
          <div class="row row-top">
            <div class="welcome-search-col">
              <WelcomeSearch />
            </div>
            <div class="notice-col">
              <NoticeBoard />
            </div>
          </div>
          <div class="row">
            <TaskCenter />
          </div>
          <div class="row">
            <QuickFuncSection />
          </div>
          <div class="row">
            <TodoList />
          </div>
        </div>

        <!-- 右侧列 -->
        <div class="right-column">
          <div class="row">
            <EnforcementStats />
          </div>
          <div class="row">
            <FaceCoverageStats />
          </div>
          <div class="row">
            <Chart />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import WelcomeSearch from './components/WelcomeSearch.vue'
import NoticeBoard from './components/NoticeBoard.vue'
import TaskCenter from './components/TaskCenter.vue'
import QuickFuncSection from './components/QuickFuncSection.vue'
import EnforcementStats from './components/EnforcementStats.vue'
import FaceCoverageStats from './components/FaceCoverageStats.vue'
import Chart from './components/Chart.vue'
import TodoList from '@/views/task/components/TodoList.vue'
import { useTaskStore } from '@/store/modules/task/useTaskStore'
import { useApprovalStore } from '@/store/modules/services/approval'

const taskStore = useTaskStore()
const approvalStore = useApprovalStore()

onMounted(() => {
  // 加载任务和审批数据
  taskStore.fetchTasks()
  approvalStore.fetchList()
})
</script>

<style scoped>
.workbench-container {
  width: 100%;
  padding: 20px;
  background: linear-gradient(180deg, var(--blue-50) 0%, #f0f7ff 100%);
  min-height: calc(100vh - 60px);
}

.dashboard-content {
  max-width: 1600px;
  margin: 0 auto;
}

.two-columns {
  display: flex;
  gap: 24px;
}

.left-column {
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.right-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.row-top {
  display: flex;
  gap: 24px;
}

.welcome-search-col,
.notice-col {
  flex: 1;
  min-width: 0;
}

.row {
  width: 100%;
}

@media (max-width: 1100px) {
  .two-columns {
    flex-direction: column;
  }

  .row-top {
    flex-direction: column;
  }
}
</style>