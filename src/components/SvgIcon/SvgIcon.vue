<!-- 使用方式 -->
<!-- 
<SvgIcon name="icon-name" size="20" color="red" />
name是图标名称，不需要加 icon- 前缀
size是图标大小，可以是数字（单位px）或字符串（如 '2em'）
color是图标颜色
-->

<template>
  <svg class="svg-icon" :style="iconStyle" aria-hidden="true">
    <use :xlink:href="symbolId"></use>
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  // 图标名称（不需要加 icon- 前缀）
  name: {
    type: String,
    required: true
  },
  // 图标大小，可以是数字（单位px）或字符串（如 '2em', '1rem'）
  size: {
    type: [Number, String],
    default: '1rem' // 使用 rem 单位以支持响应式适配
  },
  // 图标颜色
  color: {
    type: String,
    default: ''
  }
})

// 拼接 symbol id
const symbolId = computed(() => `#icon-${props.name}`)

// 计算样式
const iconStyle = computed(() => {
  const style: Record<string, string> = {}
  const rootValue = 16 // 与 postcss-pxtorem 的 rootValue 保持一致

  // 处理大小
  if (props.size) {
    let size: string
    if (typeof props.size === 'number') {
      // 数字类型，转换为 rem
      size = `${props.size / rootValue}rem`
    } else if (/^\d+$/.test(props.size)) {
      // 纯数字字符串，转换为 rem
      size = `${parseFloat(props.size) / rootValue}rem`
    } else {
      // 已带单位的字符串（如 '2em', '1rem'），直接使用
      size = props.size
    }
    style.width = size
    style.height = size
  }

  // 处理颜色
  if (props.color) {
    style.fill = props.color
  }

  return style
})

</script>

<style lang="less">
.svg-icon {
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}
</style>
