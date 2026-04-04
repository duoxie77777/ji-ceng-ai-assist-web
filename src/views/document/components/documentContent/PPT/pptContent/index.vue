<template>
  <div class="ppt-content" ref="containerRef" @click="handleCanvasClick">
    <div 
      class="canvas-wrapper"
      :style="{
        transform: `scale(${zoom})`,
        width: `${canvasWidth}px`,
        height: `${canvasHeight}px`
      }"
    >
      <div 
        class="canvas"
        ref="canvasRef"
        :style="canvasStyle"
        @mousedown="handleCanvasMouseDown"
      >
        <div v-if="showGridLines" class="grid-lines"></div>
        
        <div
          v-for="element in slideElements"
          :key="element.id"
          class="element-wrapper"
          :class="{
            active: activeElementIds.includes(element.id),
            locked: element.isLocked
          }"
          :style="getElementWrapperStyle(element)"
          @mousedown.stop="handleElementMouseDown($event, element)"
          @dblclick.stop="handleElementDblClick(element)"
        >
          <div class="element-content" :style="getElementStyle(element)">
            <TextElement 
              v-if="element.type === 'text'" 
              :element="element"
              :is-editing="editingElementId === element.id"
              @update="handleElementUpdate"
              @blur="handleTextBlur"
            />
            <ImageElement 
              v-else-if="element.type === 'image'" 
              :element="element"
            />
            <ShapeElement 
              v-else-if="element.type === 'shape'" 
              :element="element"
            />
          </div>
          
          <template v-if="activeElementIds.includes(element.id) && !element.isLocked">
            <div 
              v-for="handle in resizeHandles" 
              :key="handle.position"
              class="resize-handle"
              :class="handle.position"
              @mousedown.stop="handleResizeStart($event, element, handle.position)"
            ></div>
            <div 
              class="rotate-handle"
              @mousedown.stop="handleRotateStart($event, element)"
            ></div>
          </template>
        </div>

        <div 
          v-if="selectionBox.show"
          class="selection-box"
          :style="selectionBoxStyle"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { usePPTStore } from '../store'
import TextElement from './elements/TextElement.vue'
import ImageElement from './elements/ImageElement.vue'
import ShapeElement from './elements/ShapeElement.vue'
import type { PPTElement } from '../types'

const store = usePPTStore()
const containerRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLElement | null>(null)

const zoom = computed(() => store.zoom)
const canvasWidth = computed(() => store.canvasWidth)
const canvasHeight = computed(() => store.canvasHeight)
const showGridLines = computed(() => store.showGridLines)
const slideElements = computed(() => store.activeSlide?.elements || [])
const activeElementIds = computed(() => store.activeElementIds)

const editingElementId = ref<string | null>(null)

const canvasStyle = computed(() => {
  const slide = store.activeSlide
  if (!slide) return {}
  
  const { background } = slide
  if (background.type === 'solid') {
    return { backgroundColor: background.color }
  } else if (background.type === 'gradient' && background.gradient) {
    const { type, colors, angle } = background.gradient
    const colorStops = colors.map(c => `${c.color} ${c.offset * 100}%`).join(', ')
    if (type === 'linear') {
      return { background: `linear-gradient(${angle || 0}deg, ${colorStops})` }
    } else {
      return { background: `radial-gradient(circle, ${colorStops})` }
    }
  } else if (background.type === 'image' && background.image) {
    return {
      backgroundImage: `url(${background.image.src})`,
      backgroundSize: background.image.fit,
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }
  }
  return { backgroundColor: '#ffffff' }
})

const resizeHandles = [
  { position: 'tl', cursor: 'nwse-resize' },
  { position: 't', cursor: 'ns-resize' },
  { position: 'tr', cursor: 'nesw-resize' },
  { position: 'r', cursor: 'ew-resize' },
  { position: 'br', cursor: 'nwse-resize' },
  { position: 'b', cursor: 'ns-resize' },
  { position: 'bl', cursor: 'nesw-resize' },
  { position: 'l', cursor: 'ew-resize' }
]

const selectionBox = ref({
  show: false,
  startX: 0,
  startY: 0,
  endX: 0,
  endY: 0
})

const selectionBoxStyle = computed(() => ({
  left: `${Math.min(selectionBox.value.startX, selectionBox.value.endX)}px`,
  top: `${Math.min(selectionBox.value.startY, selectionBox.value.endY)}px`,
  width: `${Math.abs(selectionBox.value.endX - selectionBox.value.startX)}px`,
  height: `${Math.abs(selectionBox.value.endY - selectionBox.value.startY)}px`
}))

let isDragging = false
let dragStartX = 0
let dragStartY = 0
let dragElements: { id: string; startLeft: number; startTop: number }[] = []

let isResizing = false
let resizeElement: PPTElement | null = null
let resizeHandle = ''
let resizeStartX = 0
let resizeStartY = 0
let resizeStartLeft = 0
let resizeStartTop = 0
let resizeStartWidth = 0
let resizeStartHeight = 0

let isRotating = false
let rotateElement: PPTElement | null = null
let rotateCenterX = 0
let rotateCenterY = 0
let rotateStartAngle = 0

let isSelecting = false

function getElementWrapperStyle(element: PPTElement) {
  return {
    left: `${element.left}px`,
    top: `${element.top}px`,
    width: `${element.width}px`,
    height: `${element.height}px`,
    transform: `rotate(${element.rotate}deg)`,
    zIndex: element.zIndex,
    opacity: element.opacity ?? 1
  }
}

function getElementStyle(element: PPTElement) {
  const style: Record<string, string> = {}
  
  if (element.type === 'image' && element.imageContent) {
    style.objectFit = element.imageContent.fit
  }
  
  return style
}

function handleCanvasClick(e: MouseEvent) {
  if (e.target === canvasRef.value || e.target === containerRef.value) {
    store.clearActiveElementIds()
    editingElementId.value = null
  }
}

function handleCanvasMouseDown(e: MouseEvent) {
  if (e.target === canvasRef.value) {
    const rect = canvasRef.value!.getBoundingClientRect()
    const x = (e.clientX - rect.left) / zoom.value
    const y = (e.clientY - rect.top) / zoom.value
    
    isSelecting = true
    selectionBox.value = {
      show: true,
      startX: x,
      startY: y,
      endX: x,
      endY: y
    }
    
    document.addEventListener('mousemove', handleSelecting)
    document.addEventListener('mouseup', handleSelectEnd)
  }
}

function handleSelecting(e: MouseEvent) {
  if (!isSelecting || !canvasRef.value) return
  
  const rect = canvasRef.value.getBoundingClientRect()
  selectionBox.value.endX = (e.clientX - rect.left) / zoom.value
  selectionBox.value.endY = (e.clientY - rect.top) / zoom.value
}

function handleSelectEnd() {
  if (isSelecting) {
    const box = selectionBox.value
    const minX = Math.min(box.startX, box.endX)
    const maxX = Math.max(box.startX, box.endX)
    const minY = Math.min(box.startY, box.endY)
    const maxY = Math.max(box.startY, box.endY)
    
    const selectedIds = slideElements.value
      .filter(el => {
        const elRight = el.left + el.width
        const elBottom = el.top + el.height
        return el.left >= minX && elRight <= maxX && el.top >= minY && elBottom <= maxY
      })
      .map(el => el.id)
    
    if (selectedIds.length > 0) {
      store.setActiveElementIds(selectedIds)
    }
    
    selectionBox.value.show = false
    isSelecting = false
  }
  
  document.removeEventListener('mousemove', handleSelecting)
  document.removeEventListener('mouseup', handleSelectEnd)
}

function handleElementMouseDown(e: MouseEvent, element: PPTElement) {
  if (element.isLocked) return
  
  if (!activeElementIds.value.includes(element.id)) {
    if (e.shiftKey) {
      store.setActiveElementIds([...activeElementIds.value, element.id])
    } else {
      store.setActiveElementIds([element.id])
    }
  }
  
  isDragging = true
  dragStartX = e.clientX
  dragStartY = e.clientY
  dragElements = activeElementIds.value.map(id => {
    const el = slideElements.value.find(e => e.id === id)!
    return { id, startLeft: el.left, startTop: el.top }
  })
  
  document.addEventListener('mousemove', handleDragging)
  document.addEventListener('mouseup', handleDragEnd)
}

function handleDragging(e: MouseEvent) {
  if (!isDragging) return
  
  const deltaX = (e.clientX - dragStartX) / zoom.value
  const deltaY = (e.clientY - dragStartY) / zoom.value
  
  dragElements.forEach(({ id, startLeft, startTop }) => {
    store.updateElement(id, {
      left: Math.max(0, startLeft + deltaX),
      top: Math.max(0, startTop + deltaY)
    })
  })
}

function handleDragEnd() {
  if (isDragging) {
    store.saveHistory()
    isDragging = false
  }
  document.removeEventListener('mousemove', handleDragging)
  document.removeEventListener('mouseup', handleDragEnd)
}

function handleElementDblClick(element: PPTElement) {
  if (element.type === 'text') {
    editingElementId.value = element.id
  }
}

function handleElementUpdate(id: string, updates: Partial<PPTElement>) {
  store.updateElement(id, updates)
}

function handleTextBlur() {
  editingElementId.value = null
  store.saveHistory()
}

function handleResizeStart(e: MouseEvent, element: PPTElement, handle: string) {
  isResizing = true
  resizeElement = element
  resizeHandle = handle
  resizeStartX = e.clientX
  resizeStartY = e.clientY
  resizeStartLeft = element.left
  resizeStartTop = element.top
  resizeStartWidth = element.width
  resizeStartHeight = element.height
  
  document.addEventListener('mousemove', handleResizing)
  document.addEventListener('mouseup', handleResizeEnd)
}

function handleResizing(e: MouseEvent) {
  if (!isResizing || !resizeElement) return
  
  const deltaX = (e.clientX - resizeStartX) / zoom.value
  const deltaY = (e.clientY - resizeStartY) / zoom.value
  
  let newLeft = resizeStartLeft
  let newTop = resizeStartTop
  let newWidth = resizeStartWidth
  let newHeight = resizeStartHeight
  
  if (resizeHandle.includes('l')) {
    newWidth = Math.max(20, resizeStartWidth - deltaX)
    newLeft = resizeStartLeft + resizeStartWidth - newWidth
  }
  if (resizeHandle.includes('r')) {
    newWidth = Math.max(20, resizeStartWidth + deltaX)
  }
  if (resizeHandle.includes('t')) {
    newHeight = Math.max(20, resizeStartHeight - deltaY)
    newTop = resizeStartTop + resizeStartHeight - newHeight
  }
  if (resizeHandle.includes('b')) {
    newHeight = Math.max(20, resizeStartHeight + deltaY)
  }
  
  store.updateElement(resizeElement.id, {
    left: newLeft,
    top: newTop,
    width: newWidth,
    height: newHeight
  })
}

function handleResizeEnd() {
  if (isResizing) {
    store.saveHistory()
    isResizing = false
    resizeElement = null
  }
  document.removeEventListener('mousemove', handleResizing)
  document.removeEventListener('mouseup', handleResizeEnd)
}

function handleRotateStart(e: MouseEvent, element: PPTElement) {
  isRotating = true
  rotateElement = element
  
  const centerX = element.left + element.width / 2
  const centerY = element.top + element.height / 2
  rotateCenterX = centerX
  rotateCenterY = centerY
  
  const rect = containerRef.value!.getBoundingClientRect()
  const mouseX = (e.clientX - rect.left) / zoom.value
  const mouseY = (e.clientY - rect.top) / zoom.value
  
  rotateStartAngle = Math.atan2(mouseY - centerY, mouseX - centerX) * 180 / Math.PI - element.rotate
  
  document.addEventListener('mousemove', handleRotating)
  document.addEventListener('mouseup', handleRotateEnd)
}

function handleRotating(e: MouseEvent) {
  if (!isRotating || !rotateElement) return
  
  const rect = containerRef.value!.getBoundingClientRect()
  const mouseX = (e.clientX - rect.left) / zoom.value
  const mouseY = (e.clientY - rect.top) / zoom.value
  
  let angle = Math.atan2(mouseY - rotateCenterY, mouseX - rotateCenterX) * 180 / Math.PI - rotateStartAngle
  
  angle = Math.round(angle / 15) * 15
  
  store.updateElement(rotateElement.id, { rotate: angle })
}

function handleRotateEnd() {
  if (isRotating) {
    store.saveHistory()
    isRotating = false
    rotateElement = null
  }
  document.removeEventListener('mousemove', handleRotating)
  document.removeEventListener('mouseup', handleRotateEnd)
}

function handleKeydown(e: KeyboardEvent) {
  if (editingElementId.value) return
  
  const selectedElements = store.activeElements
  if (selectedElements.length === 0) return
  
  const step = e.shiftKey ? 10 : 1
  
  switch (e.key) {
    case 'ArrowLeft':
      e.preventDefault()
      selectedElements.forEach(el => {
        store.updateElement(el.id, { left: el.left - step })
      })
      break
    case 'ArrowRight':
      e.preventDefault()
      selectedElements.forEach(el => {
        store.updateElement(el.id, { left: el.left + step })
      })
      break
    case 'ArrowUp':
      e.preventDefault()
      selectedElements.forEach(el => {
        store.updateElement(el.id, { top: el.top - step })
      })
      break
    case 'ArrowDown':
      e.preventDefault()
      selectedElements.forEach(el => {
        store.updateElement(el.id, { top: el.top + step })
      })
      break
  }
}

function handleKeyup(e: KeyboardEvent) {
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
    store.saveHistory()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  document.addEventListener('keyup', handleKeyup)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('keyup', handleKeyup)
})
</script>

<style scoped lang="scss">
.ppt-content {
  flex: 1;
  overflow: auto;
  background-color: var(--gray-100);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.canvas-wrapper {
  position: relative;
  transform-origin: center center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.canvas {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: var(--white);
  overflow: hidden;
}

.grid-lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(to right, var(--gray-200) 1px, transparent 1px),
    linear-gradient(to bottom, var(--gray-200) 1px, transparent 1px);
  background-size: 20px 20px;
  pointer-events: none;
  opacity: 0.5;
}

.element-wrapper {
  position: absolute;
  cursor: move;
  user-select: none;

  &.locked {
    cursor: not-allowed;
    opacity: 0.7;
  }

  &.active {
    outline: 2px solid var(--blue-500);
    outline-offset: 1px;
  }
}

.element-content {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.resize-handle {
  position: absolute;
  width: 8px;
  height: 8px;
  background-color: var(--white);
  border: 1px solid var(--blue-500);
  border-radius: 2px;
  z-index: 10;

  &.tl {
    top: -4px;
    left: -4px;
    cursor: nwse-resize;
  }
  &.t {
    top: -4px;
    left: 50%;
    transform: translateX(-50%);
    cursor: ns-resize;
  }
  &.tr {
    top: -4px;
    right: -4px;
    cursor: nesw-resize;
  }
  &.r {
    right: -4px;
    top: 50%;
    transform: translateY(-50%);
    cursor: ew-resize;
  }
  &.br {
    bottom: -4px;
    right: -4px;
    cursor: nwse-resize;
  }
  &.b {
    bottom: -4px;
    left: 50%;
    transform: translateX(-50%);
    cursor: ns-resize;
  }
  &.bl {
    bottom: -4px;
    left: -4px;
    cursor: nesw-resize;
  }
  &.l {
    left: -4px;
    top: 50%;
    transform: translateY(-50%);
    cursor: ew-resize;
  }
}

.rotate-handle {
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  width: 12px;
  height: 12px;
  background-color: var(--blue-500);
  border-radius: 50%;
  cursor: grab;
  z-index: 10;

  &::before {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    width: 1px;
    height: 18px;
    background-color: var(--blue-500);
  }

  &:active {
    cursor: grabbing;
  }
}

.selection-box {
  position: absolute;
  border: 1px dashed var(--blue-500);
  background-color: rgba(59, 130, 246, 0.1);
  pointer-events: none;
}
</style>
