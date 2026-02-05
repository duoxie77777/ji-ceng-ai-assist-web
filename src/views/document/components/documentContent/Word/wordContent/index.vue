<template>
    <div class="word-content" ref="containerRef">
        <div class="document-container">
            <div class="paper" ref="paperRef">
                <div 
                    class="editor" 
                    ref="editorRef"
                    contenteditable="true"
                    @input="handleInput"
                    @paste="handlePaste"
                    @keydown="handleKeydown"
                    @mouseup="handleSelection"
                >
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'

// 定义 props
const props = defineProps<{
    modelValue?: string
}>()

// 定义事件
const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void
    (e: 'selectionChange'): void
}>()

// refs
const containerRef = ref<HTMLElement | null>(null)
const paperRef = ref<HTMLElement | null>(null)
const editorRef = ref<HTMLElement | null>(null)

// 保存选区
let savedRange: Range | null = null

// 初始化编辑器
const initEditor = () => {
    if (editorRef.value) {
        editorRef.value.innerHTML = props.modelValue || '<p><br></p>'
    }
}

// 处理输入
const handleInput = () => {
    if (editorRef.value) {
        emit('update:modelValue', editorRef.value.innerHTML)
    }
}

// 处理粘贴
const handlePaste = (e: ClipboardEvent) => {
    e.preventDefault()
    const text = e.clipboardData?.getData('text/plain')
    if (text) {
        document.execCommand('insertText', false, text)
    }
}

// 处理键盘事件
const handleKeydown = (e: KeyboardEvent) => {
    // Tab 键缩进
    if (e.key === 'Tab') {
        e.preventDefault()
        if (e.shiftKey) {
            document.execCommand('outdent', false)
        } else {
            document.execCommand('indent', false)
        }
    }
}

// 处理选区变化
const handleSelection = () => {
    saveSelection()
    emit('selectionChange')
}

// 保存选区
const saveSelection = () => {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
        savedRange = selection.getRangeAt(0).cloneRange()
    }
}

// 恢复选区
const restoreSelection = () => {
    if (savedRange) {
        const selection = window.getSelection()
        selection?.removeAllRanges()
        selection?.addRange(savedRange)
    }
}

// 执行命令
const execCommand = (command: string, value?: string) => {
    editorRef.value?.focus()
    restoreSelection()
    document.execCommand(command, false, value)
    handleInput()
}

// 插入 HTML
const insertHtml = (html: string) => {
    editorRef.value?.focus()
    restoreSelection()
    document.execCommand('insertHTML', false, html)
    handleInput()
}

// 设置行高
const setLineHeight = (value: string) => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return
    
    const range = selection.getRangeAt(0)
    let container = range.commonAncestorContainer
    
    // 找到最近的块级元素
    while (container && container.nodeType === Node.TEXT_NODE) {
        container = container.parentNode as Node
    }
    
    if (container && container instanceof HTMLElement) {
        // 找到段落级别的元素
        let block = container
        while (block && !['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI'].includes(block.tagName)) {
            if (block.parentElement && block.parentElement !== editorRef.value) {
                block = block.parentElement
            } else {
                break
            }
        }
        
        if (block) {
            block.style.lineHeight = value
        }
    }
    
    handleInput()
}

// 获取编辑器内容
const getContent = () => {
    return editorRef.value?.innerHTML || ''
}

// 设置编辑器内容
const setContent = (html: string) => {
    if (editorRef.value) {
        editorRef.value.innerHTML = html
    }
}

// 聚焦编辑器
const focus = () => {
    editorRef.value?.focus()
}

// 暴露方法
defineExpose({
    execCommand,
    insertHtml,
    setLineHeight,
    getContent,
    setContent,
    focus
})

onMounted(() => {
    nextTick(() => {
        initEditor()
    })
})
</script>

<style scoped lang="scss">
.word-content {
    flex: 1;
    overflow: auto;
    background-color: var(--gray-100);
    padding: 1.5rem;
}

.document-container {
    display: flex;
    justify-content: center;
    min-height: 100%;
}

.paper {
    width: 210mm;
    min-height: 297mm;
    background-color: var(--white);
    box-shadow: var(--shadow-md);
    padding: 2.54cm;
    box-sizing: border-box;
    margin-bottom: 1.5rem;
}

.editor {
    width: 100%;
    min-height: calc(297mm - 5.08cm);
    outline: none;
    font-family: 'Microsoft YaHei', '微软雅黑', sans-serif;
    font-size: 1rem;
    line-height: 1.75;
    color: var(--gray-900);

    &:empty::before {
        content: '在此输入内容...';
        color: var(--gray-400);
        pointer-events: none;
    }

    // 标题样式
    :deep(h1) {
        font-size: 2rem;
        font-weight: 700;
        margin: 1.5rem 0 1rem;
        line-height: 1.4;
        color: var(--gray-900);
    }

    :deep(h2) {
        font-size: 1.5rem;
        font-weight: 700;
        margin: 1.25rem 0 0.75rem;
        line-height: 1.4;
        color: var(--gray-900);
    }

    :deep(h3) {
        font-size: 1.25rem;
        font-weight: 700;
        margin: 1rem 0 0.5rem;
        line-height: 1.4;
        color: var(--gray-900);
    }

    :deep(h4) {
        font-size: 1.125rem;
        font-weight: 700;
        margin: 0.75rem 0 0.5rem;
        line-height: 1.4;
        color: var(--gray-900);
    }

    // 段落样式
    :deep(p) {
        margin: 0.5rem 0;
        text-indent: 0;
    }

    // 引用样式
    :deep(blockquote) {
        margin: 1rem 0;
        padding: 0.75rem 1rem;
        border-left: 4px solid var(--blue-400);
        background-color: var(--blue-50);
        color: var(--gray-700);
        font-style: italic;
    }

    // 列表样式
    :deep(ul),
    :deep(ol) {
        margin: 0.5rem 0;
        padding-left: 2rem;
    }

    :deep(li) {
        margin: 0.25rem 0;
    }

    // 链接样式
    :deep(a) {
        color: var(--blue-500);
        text-decoration: underline;
        
        &:hover {
            color: var(--blue-600);
        }
    }

    // 图片样式
    :deep(img) {
        max-width: 100%;
        height: auto;
        margin: 0.5rem 0;
        border-radius: 0.25rem;
    }

    // 表格样式
    :deep(table) {
        width: 100%;
        border-collapse: collapse;
        margin: 1rem 0;
        
        td, th {
            border: 1px solid var(--gray-300);
            padding: 0.5rem;
            min-width: 3rem;
        }
        
        th {
            background-color: var(--gray-100);
            font-weight: 600;
        }
    }

    // 分割线样式
    :deep(hr) {
        border: none;
        border-top: 1px solid var(--gray-300);
        margin: 1.5rem 0;
    }

    // 代码样式
    :deep(code) {
        font-family: 'Consolas', 'Monaco', monospace;
        background-color: var(--gray-100);
        padding: 0.125rem 0.375rem;
        border-radius: 0.25rem;
        font-size: 0.875rem;
    }

    :deep(pre) {
        background-color: var(--gray-100);
        padding: 1rem;
        border-radius: 0.5rem;
        overflow-x: auto;
        
        code {
            background: none;
            padding: 0;
        }
    }
}

// 打印样式
@media print {
    .word-content {
        padding: 0;
        background: none;
        overflow: visible;
    }

    .paper {
        box-shadow: none;
        margin: 0;
        padding: 0;
        width: 100%;
        min-height: auto;
    }
}
</style>
