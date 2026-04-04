<template>
  <div class="ppt-header">
    <div class="toolbar">
      <div class="toolbar-group">
        <el-tooltip content="撤销 (Ctrl+Z)" placement="bottom">
          <div class="toolbar-btn" :class="{ disabled: !canUndo }" @click="handleUndo">
            <el-icon><RefreshLeft /></el-icon>
          </div>
        </el-tooltip>
        <el-tooltip content="重做 (Ctrl+Y)" placement="bottom">
          <div class="toolbar-btn" :class="{ disabled: !canRedo }" @click="handleRedo">
            <el-icon><RefreshRight /></el-icon>
          </div>
        </el-tooltip>
      </div>

      <div class="toolbar-divider"></div>

      <div class="toolbar-group">
        <el-tooltip content="添加幻灯片" placement="bottom">
          <div class="toolbar-btn" @click="handleAddSlide">
            <el-icon><Plus /></el-icon>
          </div>
        </el-tooltip>
        <el-tooltip content="删除幻灯片" placement="bottom">
          <div class="toolbar-btn" :class="{ disabled: slides.length <= 1 }" @click="handleDeleteSlide">
            <el-icon><Minus /></el-icon>
          </div>
        </el-tooltip>
      </div>

      <div class="toolbar-divider"></div>

      <div class="toolbar-group">
        <el-dropdown trigger="click" @command="handleInsertElement">
          <div class="toolbar-btn insert-btn">
            <el-icon><Plus /></el-icon>
            <span>插入</span>
            <el-icon class="arrow"><ArrowDown /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="text">
                <el-icon><EditPen /></el-icon>
                <span>文本</span>
              </el-dropdown-item>
              <el-dropdown-item command="image">
                <el-icon><Picture /></el-icon>
                <span>图片</span>
              </el-dropdown-item>
              <el-dropdown-item command="shape">
                <el-icon><Share /></el-icon>
                <span>形状</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>

      <div class="toolbar-divider"></div>

      <div class="toolbar-group" v-if="activeElements.length > 0">
        <el-tooltip content="复制 (Ctrl+C)" placement="bottom">
          <div class="toolbar-btn" @click="handleCopy">
            <el-icon><CopyDocument /></el-icon>
          </div>
        </el-tooltip>
        <el-tooltip content="粘贴 (Ctrl+V)" placement="bottom">
          <div class="toolbar-btn" @click="handlePaste">
            <el-icon><DocumentCopy /></el-icon>
          </div>
        </el-tooltip>
        <el-tooltip content="删除 (Delete)" placement="bottom">
          <div class="toolbar-btn" @click="handleDelete">
            <el-icon><Delete /></el-icon>
          </div>
        </el-tooltip>
      </div>

      <div class="toolbar-divider" v-if="activeElements.length > 0"></div>

      <div class="toolbar-group" v-if="activeElements.length > 1">
        <el-dropdown trigger="click" @command="handleAlign">
          <div class="toolbar-btn">
            <el-icon><Grid /></el-icon>
            <span>对齐</span>
            <el-icon class="arrow"><ArrowDown /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="left">左对齐</el-dropdown-item>
              <el-dropdown-item command="center">水平居中</el-dropdown-item>
              <el-dropdown-item command="right">右对齐</el-dropdown-item>
              <el-dropdown-item divided command="top">顶部对齐</el-dropdown-item>
              <el-dropdown-item command="middle">垂直居中</el-dropdown-item>
              <el-dropdown-item command="bottom">底部对齐</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>

      <div class="toolbar-divider" v-if="activeElements.length > 1"></div>

      <div class="toolbar-group" v-if="activeElements.length === 1 && activeElements[0]?.type === 'text'">
        <el-select v-model="fontFamily" class="font-select" size="small" @change="handleFontChange">
          <el-option label="微软雅黑" value="Microsoft YaHei" />
          <el-option label="宋体" value="SimSun" />
          <el-option label="黑体" value="SimHei" />
          <el-option label="楷体" value="KaiTi" />
          <el-option label="Arial" value="Arial" />
          <el-option label="Times New Roman" value="Times New Roman" />
        </el-select>
        <el-select v-model="fontSize" class="size-select" size="small" @change="handleFontSizeChange">
          <el-option v-for="size in fontSizes" :key="size" :label="size + 'px'" :value="size" />
        </el-select>
      </div>

      <div class="toolbar-divider" v-if="activeElements.length === 1 && activeElements[0]?.type === 'text'"></div>

      <div class="toolbar-group" v-if="activeElements.length === 1 && activeElements[0]?.type === 'text'">
        <el-tooltip content="加粗 (Ctrl+B)" placement="bottom">
          <div class="toolbar-btn" :class="{ active: isBold }" @click="handleBold">
            <span class="format-icon bold">B</span>
          </div>
        </el-tooltip>
        <el-tooltip content="斜体 (Ctrl+I)" placement="bottom">
          <div class="toolbar-btn" :class="{ active: isItalic }" @click="handleItalic">
            <span class="format-icon italic">I</span>
          </div>
        </el-tooltip>
        <el-tooltip content="下划线 (Ctrl+U)" placement="bottom">
          <div class="toolbar-btn" :class="{ active: isUnderline }" @click="handleUnderline">
            <span class="format-icon underline">U</span>
          </div>
        </el-tooltip>
        <el-tooltip content="文字颜色" placement="bottom">
          <div class="color-picker-wrapper">
            <el-color-picker v-model="fontColor" size="small" @change="handleFontColorChange" />
          </div>
        </el-tooltip>
      </div>

      <div class="toolbar-divider" v-if="activeElements.length === 1 && activeElements[0]?.type === 'text'"></div>

      <div class="toolbar-group" v-if="activeElements.length === 1 && activeElements[0]?.type === 'text'">
        <el-tooltip content="左对齐" placement="bottom">
          <div class="toolbar-btn" :class="{ active: textAlign === 'left' }" @click="handleTextAlign('left')">
            <svg class="icon-svg" viewBox="0 0 1024 1024"><path d="M192 192h640v64H192zM192 384h448v64H192zM192 576h640v64H192zM192 768h448v64H192z"/></svg>
          </div>
        </el-tooltip>
        <el-tooltip content="居中对齐" placement="bottom">
          <div class="toolbar-btn" :class="{ active: textAlign === 'center' }" @click="handleTextAlign('center')">
            <svg class="icon-svg" viewBox="0 0 1024 1024"><path d="M192 192h640v64H192zM288 384h448v64H288zM192 576h640v64H192zM288 768h448v64H288z"/></svg>
          </div>
        </el-tooltip>
        <el-tooltip content="右对齐" placement="bottom">
          <div class="toolbar-btn" :class="{ active: textAlign === 'right' }" @click="handleTextAlign('right')">
            <svg class="icon-svg" viewBox="0 0 1024 1024"><path d="M192 192h640v64H192zM384 384h448v64H384zM192 576h640v64H192zM384 768h448v64H384z"/></svg>
          </div>
        </el-tooltip>
      </div>

      <div class="toolbar-right">
        <div class="toolbar-group">
          <el-tooltip content="网格线" placement="bottom">
            <div class="toolbar-btn" :class="{ active: showGridLines }" @click="handleToggleGridLines">
              <el-icon><Grid /></el-icon>
            </div>
          </el-tooltip>
        </div>

        <div class="toolbar-divider"></div>

        <div class="toolbar-group zoom-group">
          <el-tooltip content="缩小" placement="bottom">
            <div class="toolbar-btn" @click="handleZoomOut">
              <el-icon><ZoomOut /></el-icon>
            </div>
          </el-tooltip>
          <span class="zoom-value">{{ Math.round(zoom * 100) }}%</span>
          <el-tooltip content="放大" placement="bottom">
            <div class="toolbar-btn" @click="handleZoomIn">
              <el-icon><ZoomIn /></el-icon>
            </div>
          </el-tooltip>
        </div>

        <div class="toolbar-divider"></div>

        <div class="toolbar-group">
          <el-dropdown trigger="click" @command="handleExport">
            <el-button type="primary" size="small">
              <el-icon><Download /></el-icon>
              <span>导出</span>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="json">导出 JSON</el-dropdown-item>
                <el-dropdown-item command="pptx">导出 PPTX</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>

    <input 
      type="file" 
      ref="imageInputRef" 
      accept="image/*" 
      style="display: none" 
      @change="handleImageSelect"
    />

    <el-dialog v-model="showShapeDialog" title="选择形状" width="400px">
      <div class="shape-grid">
        <div 
          v-for="shape in shapes" 
          :key="shape.type" 
          class="shape-item"
          @click="handleSelectShape(shape.type)"
        >
          <svg viewBox="0 0 100 100" class="shape-preview">
            <path :d="shape.path" fill="#4A90E2" stroke="#357ABD" stroke-width="2"/>
          </svg>
          <span>{{ shape.name }}</span>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { usePPTStore } from '../store'
import { 
  RefreshLeft, 
  RefreshRight, 
  Plus, 
  Minus,
  ArrowDown,
  EditPen,
  Picture,
  Share,
  CopyDocument,
  DocumentCopy,
  Delete,
  Grid,
  ZoomIn,
  ZoomOut,
  Download
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { PPTElement } from '../types'

const store = usePPTStore()
const imageInputRef = ref<HTMLInputElement | null>(null)
const showShapeDialog = ref(false)

const slides = computed(() => store.slides)
const activeElements = computed(() => store.activeElements)
const zoom = computed(() => store.zoom)
const showGridLines = computed(() => store.showGridLines)
const canUndo = computed(() => store.history && store.historyIndex > 0)
const canRedo = computed(() => store.history && store.historyIndex < (store.history.length || 0) - 1)

const fontFamily = ref('Microsoft YaHei')
const fontSize = ref(24)
const fontColor = ref('#333333')
const fontSizes = [12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64, 72]

const isBold = computed(() => {
  const el = activeElements.value[0]
  return el?.textContent?.fontWeight === 'bold'
})

const isItalic = computed(() => {
  const el = activeElements.value[0]
  return el?.textContent?.fontStyle === 'italic'
})

const isUnderline = computed(() => {
  const el = activeElements.value[0]
  return el?.textContent?.textDecoration === 'underline'
})

const textAlign = computed(() => {
  return activeElements.value[0]?.textContent?.textAlign || 'left'
})

const shapes = [
  { type: 'rect', name: '矩形', path: 'M10,10 L90,10 L90,90 L10,90 Z' },
  { type: 'circle', name: '圆形', path: 'M50,10 A40,40 0 1,1 50,90 A40,40 0 1,1 50,10' },
  { type: 'triangle', name: '三角形', path: 'M50,10 L90,90 L10,90 Z' },
  { type: 'star', name: '星形', path: 'M50,10 L61,35 L88,35 L67,52 L76,80 L50,63 L24,80 L33,52 L12,35 L39,35 Z' },
  { type: 'arrow', name: '箭头', path: 'M10,40 L60,40 L60,25 L90,50 L60,75 L60,60 L10,60 Z' },
  { type: 'diamond', name: '菱形', path: 'M50,10 L90,50 L50,90 L10,50 Z' }
]

function handleUndo() {
  store.undo()
}

function handleRedo() {
  store.redo()
}

function handleAddSlide() {
  store.addSlide()
}

function handleDeleteSlide() {
  store.deleteSlide(store.activeSlideIndex)
}

function handleInsertElement(command: string) {
  switch (command) {
    case 'text':
      store.addTextElement()
      break
    case 'image':
      imageInputRef.value?.click()
      break
    case 'shape':
      showShapeDialog.value = true
      break
  }
}

function handleImageSelect(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (event) => {
      store.addImageElement(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }
  if (imageInputRef.value) {
    imageInputRef.value.value = ''
  }
}

function handleSelectShape(type: string) {
  store.addShapeElement(type)
  showShapeDialog.value = false
}

function handleCopy() {
  store.copyElements()
}

function handlePaste() {
  store.pasteElements()
}

function handleDelete() {
  store.deleteActiveElements()
}

function handleAlign(direction: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') {
  store.alignElements(direction)
}

function handleFontChange(value: string) {
  if (activeElements.value[0]?.textContent) {
    store.updateElement(activeElements.value[0].id, {
      textContent: { ...activeElements.value[0].textContent, fontFamily: value }
    }, true)
  }
}

function handleFontSizeChange(value: number) {
  if (activeElements.value[0]?.textContent) {
    store.updateElement(activeElements.value[0].id, {
      textContent: { ...activeElements.value[0].textContent, fontSize: value }
    }, true)
  }
}

function handleFontColorChange(value: string) {
  if (activeElements.value[0]?.textContent) {
    store.updateElement(activeElements.value[0].id, {
      textContent: { ...activeElements.value[0].textContent, fontColor: value }
    }, true)
  }
}

function handleBold() {
  if (activeElements.value[0]?.textContent) {
    const newWeight = isBold.value ? 'normal' : 'bold'
    store.updateElement(activeElements.value[0].id, {
      textContent: { ...activeElements.value[0].textContent, fontWeight: newWeight }
    }, true)
  }
}

function handleItalic() {
  if (activeElements.value[0]?.textContent) {
    const newStyle = isItalic.value ? 'normal' : 'italic'
    store.updateElement(activeElements.value[0].id, {
      textContent: { ...activeElements.value[0].textContent, fontStyle: newStyle }
    }, true)
  }
}

function handleUnderline() {
  if (activeElements.value[0]?.textContent) {
    const newDecoration = isUnderline.value ? 'none' : 'underline'
    store.updateElement(activeElements.value[0].id, {
      textContent: { ...activeElements.value[0].textContent, textDecoration: newDecoration }
    }, true)
  }
}

function handleTextAlign(align: 'left' | 'center' | 'right') {
  if (activeElements.value[0]?.textContent) {
    store.updateElement(activeElements.value[0].id, {
      textContent: { ...activeElements.value[0].textContent, textAlign: align }
    }, true)
  }
}

function handleToggleGridLines() {
  store.toggleGridLines()
}

function handleZoomIn() {
  store.setZoom(zoom.value + 0.1)
}

function handleZoomOut() {
  store.setZoom(zoom.value - 0.1)
}

function handleExport(command: string) {
  if (command === 'json') {
    const data = JSON.stringify({
      title: store.title,
      slides: store.slides,
      theme: store.theme,
      canvasWidth: store.canvasWidth,
      canvasHeight: store.canvasHeight
    }, null, 2)
    
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${store.title}.json`
    a.click()
    URL.revokeObjectURL(url)
  } else if (command === 'pptx') {
    ElMessage.warning('PPTX 导出功能开发中')
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.ctrlKey || e.metaKey) {
    switch (e.key.toLowerCase()) {
      case 'z':
        e.preventDefault()
        if (e.shiftKey) {
          store.redo()
        } else {
          store.undo()
        }
        break
      case 'y':
        e.preventDefault()
        store.redo()
        break
      case 'c':
        if (activeElements.value.length > 0) {
          e.preventDefault()
          store.copyElements()
        }
        break
      case 'v':
        e.preventDefault()
        store.pasteElements()
        break
      case 'b':
        if (activeElements.value[0]?.type === 'text') {
          e.preventDefault()
          handleBold()
        }
        break
      case 'i':
        if (activeElements.value[0]?.type === 'text') {
          e.preventDefault()
          handleItalic()
        }
        break
      case 'u':
        if (activeElements.value[0]?.type === 'text') {
          e.preventDefault()
          handleUnderline()
        }
        break
    }
  }
  
  if (e.key === 'Delete' && activeElements.value.length > 0) {
    e.preventDefault()
    store.deleteActiveElements()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped lang="scss">
.ppt-header {
  width: 100%;
  background-color: var(--white);
  border-bottom: 1px solid var(--gray-200);
  flex-shrink: 0;
}

.toolbar {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  gap: 0.25rem;
  flex-wrap: wrap;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 0.125rem;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 1.75rem;
  height: 1.75rem;
  padding: 0 0.375rem;
  border-radius: 0.25rem;
  cursor: pointer;
  color: var(--gray-700);
  transition: all 0.2s ease;
  font-size: 0.875rem;

  &:hover:not(.disabled) {
    background-color: var(--blue-50);
    color: var(--blue-600);
  }

  &.active {
    background-color: var(--blue-100);
    color: var(--blue-600);
  }

  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .arrow {
    margin-left: 0.125rem;
    font-size: 0.75rem;
  }
}

.insert-btn {
  span {
    margin: 0 0.25rem;
    font-size: 0.875rem;
  }
}

.toolbar-divider {
  width: 1px;
  height: 1.25rem;
  background-color: var(--gray-200);
  margin: 0 0.5rem;
}

.toolbar-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.zoom-group {
  .zoom-value {
    min-width: 3rem;
    text-align: center;
    font-size: 0.75rem;
    color: var(--gray-600);
  }
}

.font-select {
  width: 7rem;
}

.size-select {
  width: 4.5rem;
}

.format-icon {
  font-size: 0.875rem;
  font-weight: 600;

  &.bold {
    font-weight: 700;
  }

  &.italic {
    font-style: italic;
  }

  &.underline {
    text-decoration: underline;
  }
}

.icon-svg {
  width: 1rem;
  height: 1rem;
  fill: currentColor;
}

.color-picker-wrapper {
  display: flex;
  align-items: center;
}

.shape-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.shape-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.75rem;
  border: 1px solid var(--gray-200);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--blue-400);
    background-color: var(--blue-50);
  }

  .shape-preview {
    width: 3rem;
    height: 3rem;
    margin-bottom: 0.5rem;
  }

  span {
    font-size: 0.75rem;
    color: var(--gray-600);
  }
}
</style>
