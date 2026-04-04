<template>
  <div class="slide-thumbnails">
    <div class="thumbnails-header">
      <span class="title">幻灯片</span>
      <el-tooltip content="添加幻灯片" placement="bottom">
        <div class="add-btn" @click="handleAddSlide">
          <el-icon><Plus /></el-icon>
        </div>
      </el-tooltip>
    </div>
    
    <div class="thumbnails-list" ref="listRef">
      <div
        v-for="(slide, index) in slides"
        :key="slide.id"
        class="thumbnail-item"
        :class="{ active: index === activeIndex }"
        draggable="true"
        @click="handleSelectSlide(index)"
        @dragstart="handleDragStart($event, index)"
        @dragover.prevent
        @drop="handleDrop($event, index)"
        @contextmenu.prevent="handleContextMenu($event, index)"
      >
        <div class="thumbnail-number">{{ index + 1 }}</div>
        <div class="thumbnail-preview" :style="getSlideBackground(slide)">
          <div 
            v-for="element in slide.elements" 
            :key="element.id"
            class="element-preview"
            :style="getElementStyle(element)"
          >
            <template v-if="element.type === 'text'">
              <span class="text-preview">{{ element.textContent?.content }}</span>
            </template>
          </div>
        </div>
      </div>
    </div>

    <el-dropdown
      ref="contextMenuRef"
      trigger="contextmenu"
      :teleported="false"
      :virtual-triggering="true"
      :virtual-ref="triggerRef"
    >
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item @click="handleCopySlide">
            <el-icon><CopyDocument /></el-icon>
            <span>复制</span>
          </el-dropdown-item>
          <el-dropdown-item @click="handlePasteSlide" :disabled="!hasClipboardSlide">
            <el-icon><DocumentCopy /></el-icon>
            <span>粘贴</span>
          </el-dropdown-item>
          <el-dropdown-item @click="handleDeleteSlide" :disabled="slides.length <= 1">
            <el-icon><Delete /></el-icon>
            <span>删除</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePPTStore } from '../store'
import { Plus, CopyDocument, DocumentCopy, Delete } from '@element-plus/icons-vue'
import type { PPTElement, PPTSlide } from '../types'

const store = usePPTStore()
const listRef = ref<HTMLElement | null>(null)
const contextMenuRef = ref()
const triggerRef = ref<HTMLElement>()
const contextMenuIndex = ref(-1)

const slides = computed(() => store.slides)
const activeIndex = computed(() => store.activeSlideIndex)
const hasClipboardSlide = computed(() => store.clipboardData?.type === 'slide')

let draggedIndex = -1

function handleSelectSlide(index: number) {
  store.setActiveSlideIndex(index)
}

function handleAddSlide() {
  store.addSlide()
}

function handleDragStart(e: DragEvent, index: number) {
  draggedIndex = index
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', index.toString())
  }
}

function handleDrop(e: DragEvent, targetIndex: number) {
  if (draggedIndex !== -1 && draggedIndex !== targetIndex) {
    store.moveSlide(draggedIndex, targetIndex)
  }
  draggedIndex = -1
}

function handleContextMenu(e: MouseEvent, index: number) {
  contextMenuIndex.value = index
  triggerRef.value = e.target as HTMLElement
  contextMenuRef.value?.handleOpen()
}

function handleCopySlide() {
  if (contextMenuIndex.value >= 0) {
    store.copySlide(contextMenuIndex.value)
  }
}

function handlePasteSlide() {
  store.pasteSlide()
}

function handleDeleteSlide() {
  if (contextMenuIndex.value >= 0) {
    store.deleteSlide(contextMenuIndex.value)
    contextMenuIndex.value = -1
  }
}

function getSlideBackground(slide: PPTSlide) {
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
      backgroundSize: background.image.fit
    }
  }
  return { backgroundColor: '#ffffff' }
}

function getElementStyle(element: PPTElement) {
  const scale = 0.1
  return {
    left: `${element.left * scale}px`,
    top: `${element.top * scale}px`,
    width: `${element.width * scale}px`,
    height: `${element.height * scale}px`,
    transform: `rotate(${element.rotate}deg)`,
    fontSize: `${(element.textContent?.fontSize || 16) * scale}px`
  }
}
</script>

<style scoped lang="scss">
.slide-thumbnails {
  width: 180px;
  height: 100%;
  background-color: var(--gray-50);
  border-right: 1px solid var(--gray-200);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.thumbnails-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  border-bottom: 1px solid var(--gray-200);

  .title {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--gray-700);
  }

  .add-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 0.25rem;
    cursor: pointer;
    color: var(--gray-600);

    &:hover {
      background-color: var(--blue-50);
      color: var(--blue-600);
    }
  }
}

.thumbnails-list {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
}

.thumbnail-item {
  display: flex;
  align-items: flex-start;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--gray-100);
  }

  &.active {
    background-color: var(--blue-50);

    .thumbnail-preview {
      border-color: var(--blue-400);
      box-shadow: 0 0 0 2px var(--blue-100);
    }
  }
}

.thumbnail-number {
  width: 1.25rem;
  height: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  color: var(--gray-500);
  margin-right: 0.5rem;
  flex-shrink: 0;
}

.thumbnail-preview {
  width: 128px;
  height: 72px;
  background-color: var(--white);
  border: 1px solid var(--gray-200);
  border-radius: 0.25rem;
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
}

.element-preview {
  position: absolute;
  overflow: hidden;
  pointer-events: none;
}

.text-preview {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--gray-800);
}
</style>
