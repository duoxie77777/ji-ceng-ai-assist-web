<template>
  <div class="shape-element">
    <svg 
      viewBox="0 0 100 100" 
      preserveAspectRatio="none"
      :style="svgStyle"
    >
      <path 
        :d="shapePath" 
        :fill="shapeFill"
        :stroke="shapeStroke"
        :stroke-width="shapeStrokeWidth"
      />
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PPTElement } from '../../types'

const props = defineProps<{
  element: PPTElement
}>()

const shapePath = computed(() => props.element.shapeContent?.path || '')
const shapeFill = computed(() => props.element.shapeContent?.fill || '#4A90E2')
const shapeStroke = computed(() => props.element.shapeContent?.stroke || '#357ABD')
const shapeStrokeWidth = computed(() => props.element.shapeContent?.strokeWidth || 2)

const svgStyle = computed(() => {
  const shadow = props.element.shapeContent?.shadow
  if (!shadow) return {}
  
  return {
    filter: `drop-shadow(${shadow.h}px ${shadow.v}px ${shadow.blur}px ${shadow.color})`
  }
})
</script>

<style scoped lang="scss">
.shape-element {
  width: 100%;
  height: 100%;
  
  svg {
    width: 100%;
    height: 100%;
    display: block;
  }
}
</style>
