<template>
  <div class="task-stats-container">
    <el-row :gutter="20">
      <el-col :span="4">
        <div class="stat-card total" @click="handleCardClick('total')">
          <div class="stat-number">{{ stats.total }}</div>
          <div class="stat-label">总任务数</div>
        </div>
      </el-col>
      <el-col :span="4">
        <div class="stat-card pending" @click="handleCardClick(TaskStatus.PENDING)">
          <div class="stat-number">{{ stats.pending }}</div>
          <div class="stat-label">待办任务</div>
        </div>
      </el-col>
      <el-col :span="4">
        <div class="stat-card processing" @click="handleCardClick(TaskStatus.PROCESSING)">
          <div class="stat-number">{{ stats.processing }}</div>
          <div class="stat-label">进行中</div>
        </div>
      </el-col>
      <el-col :span="4">
        <div class="stat-card completed" @click="handleCardClick(TaskStatus.COMPLETED)">
          <div class="stat-number">{{ stats.completed }}</div>
          <div class="stat-label">已完成</div>
        </div>
      </el-col>
      <el-col :span="4">
        <div class="stat-card overdue" @click="handleCardClick(TaskStatus.OVERDUE)">
          <div class="stat-number">{{ stats.overdue }}</div>
          <div class="stat-label">逾期任务</div>
        </div>
      </el-col>
      <el-col :span="4">
        <el-button type="primary" @click="$emit('refresh')">
          <el-icon>
            <Refresh />
          </el-icon>刷新数据
        </el-button>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card class="chart-card" shadow="never">
          <template #header><span>任务优先级分布</span></template>
          <div ref="priorityChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card" shadow="never">
          <template #header><span>任务类型分布</span></template>
          <div ref="typeChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'
import { Refresh } from '@element-plus/icons-vue'
import { TaskStatus, TaskPriority, TaskType, TaskPriorityText, TaskTypeText, type TaskStatsData, type TaskStatusType } from '../utils/type'

const props = defineProps<{ stats: TaskStatsData }>()
const emit = defineEmits<{ (e: 'refresh'): void; (e: 'filter', status: TaskStatusType | 'total'): void }>()

const priorityChartRef = ref<HTMLElement>()
const typeChartRef = ref<HTMLElement>()
let priorityChart: echarts.ECharts | null = null
let typeChart: echarts.ECharts | null = null

const initPriorityChart = () => {
  if (!priorityChartRef.value) return
  if (priorityChart) priorityChart.dispose()
  priorityChart = echarts.init(priorityChartRef.value)
  priorityChart.setOption({
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left' },
    series: [{
      name: '优先级',
      type: 'pie',
      radius: '50%',
      data: [
        { value: props.stats.byPriority[TaskPriority.HIGH], name: TaskPriorityText[TaskPriority.HIGH] },
        { value: props.stats.byPriority[TaskPriority.MEDIUM], name: TaskPriorityText[TaskPriority.MEDIUM] },
        { value: props.stats.byPriority[TaskPriority.LOW], name: TaskPriorityText[TaskPriority.LOW] }
      ],
      emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.5)' } }
    }],
    dataZoom: [],
    roam: false
  })
}

const initTypeChart = () => {
  if (!typeChartRef.value) return
  if (typeChart) typeChart.dispose()
  typeChart = echarts.init(typeChartRef.value)
  typeChart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: Object.values(TaskTypeText), axisLabel: { rotate: 0, interval: 0 } },
    yAxis: { type: 'value', name: '任务数量' },
    series: [{
      name: '任务数',
      type: 'bar',
      data: [
        props.stats.byType[TaskType.WORK],
        props.stats.byType[TaskType.MEETING],
        props.stats.byType[TaskType.INSPECTION],
        props.stats.byType[TaskType.OTHER]
      ],
      itemStyle: { color: 'var(--blue-500)', borderRadius: [4, 4, 0, 0] },
      barWidth: '50%'
    }],
    dataZoom: [],
    roam: false
  })
}

watch(() => props.stats, () => { initPriorityChart(); initTypeChart() }, { deep: true })

const handleResize = () => { priorityChart?.resize(); typeChart?.resize() }
const handleCardClick = (status: TaskStatusType | 'total') => { emit('filter', status) }

onMounted(() => {
  initPriorityChart(); initTypeChart()
  window.addEventListener('resize', handleResize)
})
onUnmounted(() => {
  priorityChart?.dispose(); typeChart?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped lang="scss">
.task-stats-container {
  .stat-card {
    padding: 16px;
    border-radius: 8px;
    text-align: center;
    color: var(--gray-800);
    cursor: pointer;
    transition: all 0.2s;
    border: 1px solid var(--gray-200);
    background: var(--white);

    &:hover {
      border-color: var(--gray-300);
    }

    .stat-number {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 6px;
    }

    .stat-label {
      font-size: 13px;
      color: var(--gray-600);
    }

    &.total {
      background: var(--gray-50);
    }

    &.pending {
      background: var(--gray-50);
    }

    &.processing {
      background: var(--gray-50);
    }

    &.completed {
      background: var(--gray-50);
    }

    &.overdue {
      background: var(--gray-50);
    }
  }

  .chart-card {
    :deep(.el-card__header) {
      border-bottom: 1px solid var(--gray-200);
      font-weight: 600;
      font-size: 14px;
    }
  }

  .chart-container {
    width: 100%;
    height: 280px;
    overflow: hidden;
  }
}
</style>