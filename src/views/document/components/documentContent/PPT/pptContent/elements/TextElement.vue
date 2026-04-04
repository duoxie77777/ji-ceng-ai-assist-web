<template>
  <div 
    class="text-element"
    :style="textStyle"
    ref="textRef"
    :contenteditable="isEditing"
    @input="handleInput"
    @blur="handleBlur"
    @keydown="handleKeydown"
    @compositionstart="handleCompositionStart"
    @compositionend="handleCompositionEnd"
  ></div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import type { PPTElement } from '../../types'

const props = defineProps<{
  element: PPTElement
  isEditing: boolean
}>()

const emit = defineEmits<{
  (e: 'update', id: string, updates: Partial<PPTElement>): void
  (e: 'blur'): void
}>()

const textRef = ref<HTMLElement | null>(null)
let isUpdatingFromProps = false
let isComposing = false

const content = computed(() => props.element.textContent?.content || '')
const textStyle = computed(() => {
  const tc = props.element.textContent
  if (!tc) return {}
  
  return {
    fontFamily: tc.fontFamily,
    fontSize: `${tc.fontSize}px`,
    color: tc.fontColor,
    fontWeight: tc.fontWeight,
    fontStyle: tc.fontStyle,
    textDecoration: tc.textDecoration,
    textAlign: tc.textAlign,
    verticalAlign: tc.verticalAlign,
    lineHeight: tc.lineHeight,
    wordBreak: tc.wordBreak,
    backgroundColor: tc.fill,
    width: '100%',
    height: '100%',
    padding: '8px',
    boxSizing: 'border-box',
    outline: 'none',
    whiteSpace: 'pre-wrap',
    overflow: 'hidden',
    minHeight: '100%'
  }
})

watch(() => props.isEditing, async (newVal) => {
  if (newVal && textRef.value) {
    await nextTick()
    isUpdatingFromProps = true
    textRef.value.innerHTML = content.value
    await nextTick()
    textRef.value.focus()
    
    const range = document.createRange()
    if (textRef.value.childNodes.length > 0) {
      const lastChild = textRef.value.lastChild
      if (lastChild) {
        range.setStartAfter(lastChild)
        range.collapse(true)
      } else {
        range.selectNodeContents(textRef.value)
      }
    } else {
      range.selectNodeContents(textRef.value)
    }
    const selection = window.getSelection()
    selection?.removeAllRanges()
    selection?.addRange(range)
    isUpdatingFromProps = false
  }
})

watch(content, async (newContent) => {
  if (textRef.value && !props.isEditing && !isUpdatingFromProps) {
    isUpdatingFromProps = true
    textRef.value.innerHTML = newContent
    isUpdatingFromProps = false
  }
})

function handleCompositionStart() {
  isComposing = true
}

function handleCompositionEnd() {
  isComposing = false
  updateContent()
}

function handleInput(e: Event) {
  if (isUpdatingFromProps) return
  if (isComposing) return
  updateContent()
}

function updateContent() {
  if (!textRef.value) return
  const currentContent = textRef.value.innerText
  if (currentContent !== content.value) {
    emit('update', props.element.id, {
      textContent: {
        ...props.element.textContent!,
        content: currentContent
      }
    })
  }
}

function handleBlur() {
  if (!isComposing) {
    updateContent()
  }
  emit('blur')
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    e.preventDefault()
    textRef.value?.blur()
  }
}
</script>

<style scoped lang="scss">
.text-element {
  width: 100%;
  height: 100%;
  min-height: 100%;
  cursor: text;
  
  &:empty::before {
    content: '请输入文本';
    color: var(--gray-400);
    pointer-events: none;
  }
  
  &[contenteditable="true"] {
    cursor: text;
    user-select: text;
  }
  
  &[contenteditable="false"] {
    cursor: move;
  }
}
</style>
