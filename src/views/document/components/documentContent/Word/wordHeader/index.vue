<template>
    <div class="word-header">
        <!-- 工具栏区域 -->
        <div class="toolbar">
            <!-- 文件操作组 -->
            <div class="toolbar-group">
                <el-tooltip content="撤销" placement="bottom" :show-after="500">
                    <div class="toolbar-btn" @click="execCommand('undo')">
                        <el-icon><RefreshLeft /></el-icon>
                    </div>
                </el-tooltip>
                <el-tooltip content="重做" placement="bottom" :show-after="500">
                    <div class="toolbar-btn" @click="execCommand('redo')">
                        <el-icon><RefreshRight /></el-icon>
                    </div>
                </el-tooltip>
            </div>

            <div class="toolbar-divider"></div>

            <!-- 字体设置组 -->
            <div class="toolbar-group">
                <el-select v-model="fontFamily" class="font-select" placeholder="字体" size="small" @change="changeFontFamily">
                    <el-option label="默认" value="default" />
                    <el-option label="宋体" value="SimSun" />
                    <el-option label="黑体" value="SimHei" />
                    <el-option label="微软雅黑" value="Microsoft YaHei" />
                    <el-option label="楷体" value="KaiTi" />
                    <el-option label="Arial" value="Arial" />
                    <el-option label="Times New Roman" value="Times New Roman" />
                </el-select>
                <el-select v-model="fontSize" class="size-select" placeholder="字号" size="small" @change="changeFontSize">
                    <el-option v-for="size in fontSizes" :key="size.value" :label="size.label" :value="size.value" />
                </el-select>
            </div>

            <div class="toolbar-divider"></div>

            <!-- 文字格式组 -->
            <div class="toolbar-group">
                <el-tooltip content="加粗 (Ctrl+B)" placement="bottom" :show-after="500">
                    <div class="toolbar-btn" :class="{ active: formatState.bold }" @click="execCommand('bold')">
                        <span class="format-icon bold">B</span>
                    </div>
                </el-tooltip>
                <el-tooltip content="斜体 (Ctrl+I)" placement="bottom" :show-after="500">
                    <div class="toolbar-btn" :class="{ active: formatState.italic }" @click="execCommand('italic')">
                        <span class="format-icon italic">I</span>
                    </div>
                </el-tooltip>
                <el-tooltip content="下划线 (Ctrl+U)" placement="bottom" :show-after="500">
                    <div class="toolbar-btn" :class="{ active: formatState.underline }" @click="execCommand('underline')">
                        <span class="format-icon underline">U</span>
                    </div>
                </el-tooltip>
                <el-tooltip content="删除线" placement="bottom" :show-after="500">
                    <div class="toolbar-btn" :class="{ active: formatState.strikethrough }" @click="execCommand('strikeThrough')">
                        <span class="format-icon strikethrough">S</span>
                    </div>
                </el-tooltip>
                <el-tooltip content="上标" placement="bottom" :show-after="500">
                    <div class="toolbar-btn" :class="{ active: formatState.superscript }" @click="execCommand('superscript')">
                        <span class="format-icon superscript">X<sup>2</sup></span>
                    </div>
                </el-tooltip>
                <el-tooltip content="下标" placement="bottom" :show-after="500">
                    <div class="toolbar-btn" :class="{ active: formatState.subscript }" @click="execCommand('subscript')">
                        <span class="format-icon subscript">X<sub>2</sub></span>
                    </div>
                </el-tooltip>
            </div>

            <div class="toolbar-divider"></div>

            <!-- 颜色设置组 -->
            <div class="toolbar-group">
                <el-tooltip content="文字颜色" placement="bottom" :show-after="500">
                    <div class="color-picker-wrapper">
                        <el-color-picker v-model="textColor" size="small" @change="changeTextColor" />
                        <span class="color-label">A</span>
                    </div>
                </el-tooltip>
                <el-tooltip content="背景高亮" placement="bottom" :show-after="500">
                    <div class="color-picker-wrapper">
                        <el-color-picker v-model="bgColor" size="small" @change="changeBgColor" />
                        <span class="color-label highlight">ab</span>
                    </div>
                </el-tooltip>
            </div>

            <div class="toolbar-divider"></div>

            <!-- 对齐方式组 -->
            <div class="toolbar-group">
                <el-tooltip content="左对齐" placement="bottom" :show-after="500">
                    <div class="toolbar-btn" :class="{ active: formatState.justifyLeft }" @click="execCommand('justifyLeft')">
                        <svg class="icon-svg" viewBox="0 0 1024 1024"><path d="M192 192h640v64H192zM192 384h448v64H192zM192 576h640v64H192zM192 768h448v64H192z"/></svg>
                    </div>
                </el-tooltip>
                <el-tooltip content="居中对齐" placement="bottom" :show-after="500">
                    <div class="toolbar-btn" :class="{ active: formatState.justifyCenter }" @click="execCommand('justifyCenter')">
                        <svg class="icon-svg" viewBox="0 0 1024 1024"><path d="M192 192h640v64H192zM288 384h448v64H288zM192 576h640v64H192zM288 768h448v64H288z"/></svg>
                    </div>
                </el-tooltip>
                <el-tooltip content="右对齐" placement="bottom" :show-after="500">
                    <div class="toolbar-btn" :class="{ active: formatState.justifyRight }" @click="execCommand('justifyRight')">
                        <svg class="icon-svg" viewBox="0 0 1024 1024"><path d="M192 192h640v64H192zM384 384h448v64H384zM192 576h640v64H192zM384 768h448v64H384z"/></svg>
                    </div>
                </el-tooltip>
                <el-tooltip content="两端对齐" placement="bottom" :show-after="500">
                    <div class="toolbar-btn" :class="{ active: formatState.justifyFull }" @click="execCommand('justifyFull')">
                        <svg class="icon-svg" viewBox="0 0 1024 1024"><path d="M192 192h640v64H192zM192 384h640v64H192zM192 576h640v64H192zM192 768h640v64H192z"/></svg>
                    </div>
                </el-tooltip>
            </div>

            <div class="toolbar-divider"></div>

            <!-- 列表和缩进组 -->
            <div class="toolbar-group">
                <el-tooltip content="无序列表" placement="bottom" :show-after="500">
                    <div class="toolbar-btn" :class="{ active: formatState.unorderedList }" @click="execCommand('insertUnorderedList')">
                        <svg class="icon-svg" viewBox="0 0 1024 1024"><path d="M256 224a64 64 0 1 1-128 0 64 64 0 0 1 128 0zM256 512a64 64 0 1 1-128 0 64 64 0 0 1 128 0zM256 800a64 64 0 1 1-128 0 64 64 0 0 1 128 0zM320 192h576v64H320zM320 480h576v64H320zM320 768h576v64H320z"/></svg>
                    </div>
                </el-tooltip>
                <el-tooltip content="有序列表" placement="bottom" :show-after="500">
                    <div class="toolbar-btn" :class="{ active: formatState.orderedList }" @click="execCommand('insertOrderedList')">
                        <svg class="icon-svg" viewBox="0 0 1024 1024"><path d="M320 192h576v64H320zM320 480h576v64H320zM320 768h576v64H320z"/><text x="192" y="260" font-size="160" text-anchor="middle" font-family="Arial">1</text><text x="192" y="548" font-size="160" text-anchor="middle" font-family="Arial">2</text><text x="192" y="836" font-size="160" text-anchor="middle" font-family="Arial">3</text></svg>
                    </div>
                </el-tooltip>
                <el-tooltip content="减少缩进" placement="bottom" :show-after="500">
                    <div class="toolbar-btn" @click="execCommand('outdent')">
                        <el-icon><DArrowLeft /></el-icon>
                    </div>
                </el-tooltip>
                <el-tooltip content="增加缩进" placement="bottom" :show-after="500">
                    <div class="toolbar-btn" @click="execCommand('indent')">
                        <el-icon><DArrowRight /></el-icon>
                    </div>
                </el-tooltip>
            </div>

            <div class="toolbar-divider"></div>

            <!-- 行高和段落组 -->
            <div class="toolbar-group">
                <el-tooltip content="行高" placement="bottom" :show-after="500">
                    <el-dropdown trigger="click" @command="changeLineHeight">
                        <div class="toolbar-btn">
                            <svg class="icon-svg" viewBox="0 0 1024 1024"><path d="M128 128h64v768H128zM256 192h640v64H256zM256 384h640v64H256zM256 576h640v64H256zM256 768h640v64H256z"/></svg>
                            <el-icon class="arrow"><ArrowDown /></el-icon>
                        </div>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item command="1">1.0 倍</el-dropdown-item>
                                <el-dropdown-item command="1.5">1.5 倍</el-dropdown-item>
                                <el-dropdown-item command="1.75">1.75 倍</el-dropdown-item>
                                <el-dropdown-item command="2">2.0 倍</el-dropdown-item>
                                <el-dropdown-item command="2.5">2.5 倍</el-dropdown-item>
                                <el-dropdown-item command="3">3.0 倍</el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </el-tooltip>
            </div>

            <div class="toolbar-divider"></div>

            <!-- 插入组 -->
            <div class="toolbar-group">
                <el-tooltip content="插入链接" placement="bottom" :show-after="500">
                    <div class="toolbar-btn" @click="showLinkDialog = true">
                        <el-icon><Link /></el-icon>
                    </div>
                </el-tooltip>
                <el-tooltip content="插入图片" placement="bottom" :show-after="500">
                    <div class="toolbar-btn" @click="insertImage">
                        <el-icon><Picture /></el-icon>
                    </div>
                </el-tooltip>
                <el-tooltip content="插入表格" placement="bottom" :show-after="500">
                    <div class="toolbar-btn" @click="showTableDialog = true">
                        <el-icon><Grid /></el-icon>
                    </div>
                </el-tooltip>
                <el-tooltip content="插入分割线" placement="bottom" :show-after="500">
                    <div class="toolbar-btn" @click="execCommand('insertHorizontalRule')">
                        <el-icon><Minus /></el-icon>
                    </div>
                </el-tooltip>
            </div>

            <div class="toolbar-divider"></div>

            <!-- 标题样式组 -->
            <div class="toolbar-group">
                <el-dropdown trigger="click" @command="changeHeading">
                    <div class="toolbar-btn heading-btn">
                        <span>段落样式</span>
                        <el-icon class="arrow"><ArrowDown /></el-icon>
                    </div>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item command="p">正文</el-dropdown-item>
                            <el-dropdown-item command="h1"><span style="font-size: 2em; font-weight: bold;">标题 1</span></el-dropdown-item>
                            <el-dropdown-item command="h2"><span style="font-size: 1.5em; font-weight: bold;">标题 2</span></el-dropdown-item>
                            <el-dropdown-item command="h3"><span style="font-size: 1.17em; font-weight: bold;">标题 3</span></el-dropdown-item>
                            <el-dropdown-item command="h4"><span style="font-size: 1em; font-weight: bold;">标题 4</span></el-dropdown-item>
                            <el-dropdown-item command="blockquote">引用</el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </div>

            <div class="toolbar-divider"></div>

            <!-- 清除格式 -->
            <div class="toolbar-group">
                <el-tooltip content="清除格式" placement="bottom" :show-after="500">
                    <div class="toolbar-btn" @click="execCommand('removeFormat')">
                        <el-icon><Delete /></el-icon>
                    </div>
                </el-tooltip>
            </div>
        </div>
    </div>

    <!-- 插入链接对话框 -->
    <el-dialog v-model="showLinkDialog" title="插入链接" width="400px">
        <el-form :model="linkForm" label-width="80px">
            <el-form-item label="链接文字">
                <el-input v-model="linkForm.text" placeholder="请输入链接显示文字" />
            </el-form-item>
            <el-form-item label="链接地址">
                <el-input v-model="linkForm.url" placeholder="请输入链接地址" />
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button @click="showLinkDialog = false">取消</el-button>
            <el-button type="primary" @click="insertLink">确定</el-button>
        </template>
    </el-dialog>

    <!-- 插入表格对话框 -->
    <el-dialog v-model="showTableDialog" title="插入表格" width="400px">
        <el-form :model="tableForm" label-width="80px">
            <el-form-item label="行数">
                <el-input-number v-model="tableForm.rows" :min="1" :max="20" />
            </el-form-item>
            <el-form-item label="列数">
                <el-input-number v-model="tableForm.cols" :min="1" :max="10" />
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button @click="showTableDialog = false">取消</el-button>
            <el-button type="primary" @click="insertTable">确定</el-button>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { 
    RefreshLeft, 
    RefreshRight, 
    ArrowDown,
    Link,
    Picture,
    Grid,
    Minus,
    Delete,
    DArrowLeft,
    DArrowRight
} from '@element-plus/icons-vue'

// 定义事件
const emit = defineEmits<{
    (e: 'command', command: string, value?: string): void
    (e: 'insertHtml', html: string): void
    (e: 'lineHeight', value: string): void
}>()

// 字体设置
const fontFamily = ref('default')
const fontSize = ref('3')
const fontSizes = [
    { label: '初号', value: '7' },
    { label: '小初', value: '6' },
    { label: '一号', value: '5' },
    { label: '二号', value: '4' },
    { label: '三号', value: '3' },
    { label: '四号', value: '2' },
    { label: '五号', value: '1' },
    { label: '12px', value: '1' },
    { label: '14px', value: '2' },
    { label: '16px', value: '3' },
    { label: '18px', value: '4' },
    { label: '20px', value: '5' },
    { label: '24px', value: '6' },
    { label: '32px', value: '7' },
]

// 颜色
const textColor = ref('#333333')
const bgColor = ref('#ffff00')

// 格式状态
const formatState = reactive({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    superscript: false,
    subscript: false,
    justifyLeft: true,
    justifyCenter: false,
    justifyRight: false,
    justifyFull: false,
    unorderedList: false,
    orderedList: false,
})

// 对话框
const showLinkDialog = ref(false)
const showTableDialog = ref(false)

// 表单
const linkForm = reactive({
    text: '',
    url: 'https://'
})

const tableForm = reactive({
    rows: 3,
    cols: 3
})

// 执行命令
const execCommand = (command: string, value?: string) => {
    emit('command', command, value)
    updateFormatState()
}

// 更新格式状态
const updateFormatState = () => {
    formatState.bold = document.queryCommandState('bold')
    formatState.italic = document.queryCommandState('italic')
    formatState.underline = document.queryCommandState('underline')
    formatState.strikethrough = document.queryCommandState('strikeThrough')
    formatState.superscript = document.queryCommandState('superscript')
    formatState.subscript = document.queryCommandState('subscript')
    formatState.justifyLeft = document.queryCommandState('justifyLeft')
    formatState.justifyCenter = document.queryCommandState('justifyCenter')
    formatState.justifyRight = document.queryCommandState('justifyRight')
    formatState.justifyFull = document.queryCommandState('justifyFull')
    formatState.unorderedList = document.queryCommandState('insertUnorderedList')
    formatState.orderedList = document.queryCommandState('insertOrderedList')
}

// 改变字体
const changeFontFamily = () => {
    if (fontFamily.value !== 'default') {
        execCommand('fontName', fontFamily.value)
    }
}

// 改变字号
const changeFontSize = () => {
    execCommand('fontSize', fontSize.value)
}

// 改变文字颜色
const changeTextColor = () => {
    execCommand('foreColor', textColor.value)
}

// 改变背景颜色
const changeBgColor = () => {
    execCommand('hiliteColor', bgColor.value)
}

// 改变行高
const changeLineHeight = (value: string) => {
    emit('lineHeight', value)
}

// 改变标题
const changeHeading = (tag: string) => {
    execCommand('formatBlock', tag)
}

// 插入链接
const insertLink = () => {
    const html = `<a href="${linkForm.url}" target="_blank">${linkForm.text || linkForm.url}</a>`
    emit('insertHtml', html)
    showLinkDialog.value = false
    linkForm.text = ''
    linkForm.url = 'https://'
}

// 插入图片
const insertImage = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e: Event) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (event) => {
                const html = `<img src="${event.target?.result}" style="max-width: 100%;" />`
                emit('insertHtml', html)
            }
            reader.readAsDataURL(file)
        }
    }
    input.click()
}

// 插入表格
const insertTable = () => {
    let html = '<table style="border-collapse: collapse; width: 100%;">'
    for (let i = 0; i < tableForm.rows; i++) {
        html += '<tr>'
        for (let j = 0; j < tableForm.cols; j++) {
            html += '<td style="border: 1px solid #ddd; padding: 8px; min-width: 50px;">&nbsp;</td>'
        }
        html += '</tr>'
    }
    html += '</table><p><br></p>'
    emit('insertHtml', html)
    showTableDialog.value = false
}

// 监听选区变化
const handleSelectionChange = () => {
    updateFormatState()
}

onMounted(() => {
    document.addEventListener('selectionchange', handleSelectionChange)
})

onUnmounted(() => {
    document.removeEventListener('selectionchange', handleSelectionChange)
})
</script>

<style scoped lang="scss">
.word-header {
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
    padding: 0 0.25rem;
    border-radius: 0.25rem;
    cursor: pointer;
    color: var(--gray-700);
    transition: all 0.2s ease;

    &:hover {
        background-color: var(--blue-50);
        color: var(--blue-600);
    }

    &.active {
        background-color: var(--blue-100);
        color: var(--blue-700);
    }

    .arrow {
        font-size: 0.625rem;
        margin-left: 0.125rem;
    }

    .icon-svg {
        width: 1em;
        height: 1em;
        fill: currentColor;
    }
}

.heading-btn {
    padding: 0 0.5rem;
    font-size: 0.75rem;
}

.toolbar-divider {
    width: 1px;
    height: 1.25rem;
    background-color: var(--gray-200);
    margin: 0 0.5rem;
}

.font-select {
    width: 7rem;
}

.size-select {
    width: 5rem;
}

.format-icon {
    font-style: normal;
    font-weight: 400;
    font-size: 0.875rem;
    font-family: 'Times New Roman', serif;
    line-height: 1;

    &.bold {
        font-weight: 700;
    }

    &.italic {
        font-style: italic;
    }

    &.underline {
        text-decoration: underline;
    }

    &.strikethrough {
        text-decoration: line-through;
    }

    &.superscript,
    &.subscript {
        font-size: 0.75rem;
        
        sup, sub {
            font-size: 0.5rem;
        }
    }
}

.color-picker-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    
    .color-label {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        font-size: 0.75rem;
        font-weight: 700;
        pointer-events: none;
        z-index: 1;
        
        &.highlight {
            font-size: 0.625rem;
            background: linear-gradient(to bottom, transparent 60%, currentColor 60%);
            background-clip: text;
            -webkit-background-clip: text;
        }
    }
    
    :deep(.el-color-picker__trigger) {
        width: 1.75rem;
        height: 1.75rem;
        padding: 0;
        border: none;
        border-radius: 0.25rem;
        
        .el-color-picker__color {
            border: none;
        }
        
        .el-color-picker__color-inner {
            opacity: 0.3;
        }
    }
}

// Element Plus 组件样式覆盖
:deep(.el-select) {
    .el-input__wrapper {
        background-color: var(--white);
    }
}

:deep(.el-dropdown) {
    .toolbar-btn {
        outline: none;
    }
}
</style>
