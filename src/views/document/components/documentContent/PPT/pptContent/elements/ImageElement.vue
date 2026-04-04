<template>
  <div class="image-element">
    <img 
      :src="imageSrc" 
      :style="imageStyle"
      :alt="element.name || 'image'"
      draggable="false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PPTElement } from '../../types'

const props = defineProps<{
  element: PPTElement
}>()

const imageSrc = computed(() => props.element.imageContent?.src || '')
const imageStyle = computed(() => {
  const ic = props.element.imageContent
  if (!ic) return {}
  
  return {
    objectFit: ic.fit,
    transform: `${ic.flipH ? 'scaleX(-1)' : ''} ${ic.flipV ? 'scaleY(-1)' : ''}`.trim() || 'none',
    width: '100%',
    height: '100%'
  }
})
</script>

<style scoped lang="scss">
.image-element {
  width: 100%;
  height: 100%;
  overflow: hidden;
  
  img {
    display: block;
    width: 100%;
    height: 100%;
  }
}
</style>
