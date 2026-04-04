<template>
  <div class="chart-card">
    <div class="card-header">
      <span class="header-dot"></span>
      <h3>民情事项受理趋势</h3>
      <span class="date-range">近7天动态</span>
    </div>
    <div class="chart-header">
      <div class="legend">
        <div v-for="item in legends" :key="item.label" class="legend-item">
          <span class="legend-dot" :style="{ backgroundColor: item.color }"></span>
          <span>{{ item.label }}</span>
        </div>
      </div>
    </div>
    <div ref="chartRef" class="chart-container"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { TREND_LEGENDS } from '../utils/constants'

const legends = TREND_LEGENDS

const chartRef = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null

onMounted(() => {
  if (!chartRef.value) return
  chart = echarts.init(chartRef.value)

  const option = {
    tooltip: { trigger: 'axis' },
    legend: { show: false },
    grid: { left: '8%', right: '5%', top: '15%', bottom: '5%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['3.24', '3.25', '3.26', '3.27', '3.28', '3.29', '3.30'],
      axisLabel: { color: '#94a3b8', fontSize: 11 }
    },
    yAxis: {
      type: 'value',
      name: '申请数量（件）',
      axisLabel: { fontSize: 11 },
      splitLine: { lineStyle: { type: 'dashed' } }
    },
    series: [
      {
        name: '民情事项',
        type: 'line',
        data: [12, 15, 18, 22, 20, 25, 28],
        smooth: true,
        lineStyle: { color: '#3b82f6', width: 2 },
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: { color: '#3b82f6' }
      },
      {
        name: '农业农村',
        type: 'line',
        data: [8, 10, 12, 14, 13, 16, 18],
        smooth: true,
        lineStyle: { color: '#10b981', width: 2 },
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: { color: '#10b981' }
      },
      {
        name: '民政服务',
        type: 'line',
        data: [20, 22, 25, 28, 30, 32, 35],
        smooth: true,
        lineStyle: { color: '#f59e0b', width: 2 },
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: { color: '#f59e0b' }
      },
      {
        name: '综治平安',
        type: 'line',
        data: [5, 6, 8, 7, 9, 10, 12],
        smooth: true,
        lineStyle: { color: '#ef4444', width: 2 },
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: { color: '#ef4444' }
      }
    ]
  }

  chart.setOption(option)
  window.addEventListener('resize', () => chart?.resize())
})

onUnmounted(() => {
  chart?.dispose()
  window.removeEventListener('resize', () => chart?.resize())
})
</script>

<style scoped>
.chart-card {
  padding: 20px;
  border-radius: 8px;
  background: var(--white);
  border: 1px solid var(--gray-200);
  min-height: 280px;
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.header-dot {
  width: 3px;
  height: 16px;
  background: var(--blue-500);
  border-radius: 2px;
  margin-right: 8px;
}

h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: var(--gray-900);
}

.date-range {
  font-size: 12px;
  color: var(--gray-500);
  margin-left: auto;
}

.chart-header {
  margin-bottom: 12px;
}

.legend {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--gray-600);
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.chart-container {
  width: 100%;
  height: 200px;
}
</style>