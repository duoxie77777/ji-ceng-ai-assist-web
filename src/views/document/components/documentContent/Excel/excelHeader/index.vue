<template>
    <div class="excel-header">
        <!-- 工具栏区域 -->
        <div class="toolbar">
            <!-- 文件操作组 -->
            <div class="toolbar-group">
                <el-tooltip content="撤销" placement="bottom" :show-after="500">
                    <div class="toolbar-btn" @click="handleUndo">
                        <el-icon>
                            <RefreshLeft />
                        </el-icon>
                    </div>
                </el-tooltip>
                <el-tooltip content="重做" placement="bottom" :show-after="500">
                    <div class="toolbar-btn" @click="handleRedo">
                        <el-icon>
                            <RefreshRight />
                        </el-icon>
                    </div>
                </el-tooltip>
            </div>

            <div class="toolbar-divider"></div>

            <!-- 字体设置组 -->
            <div class="toolbar-group">
                <el-select v-model="fontFamily" class="font-select" placeholder="字体" size="small">
                    <el-option label="默认" value="default" />
                    <el-option label="宋体" value="SimSun" />
                    <el-option label="黑体" value="SimHei" />
                    <el-option label="微软雅黑" value="Microsoft YaHei" />
                    <el-option label="Arial" value="Arial" />
                </el-select>
                <el-select v-model="fontSize" class="size-select" placeholder="字号" size="small">
                    <el-option v-for="size in fontSizes" :key="size" :label="size" :value="size" />
                </el-select>
            </div>

            <div class="toolbar-divider"></div>

            <!-- 文字格式组 -->
            <div class="toolbar-group">
                <el-tooltip content="加粗" placement="bottom" :show-after="500">
                    <div class="toolbar-btn" :class="{ active: isBold }" @click="toggleBold">
                        <el-icon><i class="format-icon bold">B</i></el-icon>
                    </div>
                </el-tooltip>
                <el-tooltip content="斜体" placement="bottom" :show-after="500">
                    <div class="toolbar-btn" :class="{ active: isItalic }" @click="toggleItalic">
                        <el-icon><i class="format-icon italic">I</i></el-icon>
                    </div>
                </el-tooltip>
                <el-tooltip content="下划线" placement="bottom" :show-after="500">
                    <div class="toolbar-btn" :class="{ active: isUnderline }" @click="toggleUnderline">
                        <el-icon><i class="format-icon underline">U</i></el-icon>
                    </div>
                </el-tooltip>
                <el-tooltip content="删除线" placement="bottom" :show-after="500">
                    <div class="toolbar-btn" :class="{ active: isStrikethrough }" @click="toggleStrikethrough">
                        <el-icon><i class="format-icon strikethrough">S</i></el-icon>
                    </div>
                </el-tooltip>
            </div>

            <div class="toolbar-divider"></div>

            <!-- 颜色设置组 -->
            <div class="toolbar-group">
                <el-tooltip content="文字颜色" placement="bottom" :show-after="500">
                    <el-color-picker v-model="textColor" size="small" show-alpha />
                </el-tooltip>
                <el-tooltip content="背景颜色" placement="bottom" :show-after="500">
                    <el-color-picker v-model="bgColor" size="small" show-alpha />
                </el-tooltip>
            </div>

            <div class="toolbar-divider"></div>

            <!-- 对齐方式组 -->
            <div class="toolbar-group">
                <el-tooltip content="左对齐" placement="bottom" :show-after="500">
                    <div class="toolbar-btn" :class="{ active: alignment === 'left' }" @click="setAlignment('left')">
                        <el-icon><i class="iconfont icon-align-left"></i></el-icon>
                    </div>
                </el-tooltip>
                <el-tooltip content="居中对齐" placement="bottom" :show-after="500">
                    <div class="toolbar-btn" :class="{ active: alignment === 'center' }"
                        @click="setAlignment('center')">
                        <el-icon><i class="iconfont icon-align-center"></i></el-icon>
                    </div>
                </el-tooltip>
                <el-tooltip content="右对齐" placement="bottom" :show-after="500">
                    <div class="toolbar-btn" :class="{ active: alignment === 'right' }" @click="setAlignment('right')">
                        <el-icon><i class="iconfont icon-align-right"></i></el-icon>
                    </div>
                </el-tooltip>
            </div>

            <div class="toolbar-divider"></div>

            <!-- 边框和合并组 -->
            <div class="toolbar-group">
                <el-tooltip content="边框" placement="bottom" :show-after="500">
                    <el-dropdown trigger="click" @command="handleBorder">
                        <div class="toolbar-btn">
                            <el-icon>
                                <Grid />
                            </el-icon>
                            <el-icon class="arrow">
                                <ArrowDown />
                            </el-icon>
                        </div>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item command="all">所有边框</el-dropdown-item>
                                <el-dropdown-item command="outer">外边框</el-dropdown-item>
                                <el-dropdown-item command="inner">内边框</el-dropdown-item>
                                <el-dropdown-item command="top">上边框</el-dropdown-item>
                                <el-dropdown-item command="bottom">下边框</el-dropdown-item>
                                <el-dropdown-item command="left">左边框</el-dropdown-item>
                                <el-dropdown-item command="right">右边框</el-dropdown-item>
                                <el-dropdown-item command="none">无边框</el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </el-tooltip>
                <el-tooltip content="合并单元格" placement="bottom" :show-after="500">
                    <div class="toolbar-btn" @click="handleMerge">
                        <el-icon>
                            <Connection />
                        </el-icon>
                    </div>
                </el-tooltip>
            </div>

            <div class="toolbar-divider"></div>

            <!-- 数据操作组 -->
            <div class="toolbar-group">
                <el-tooltip content="筛选" placement="bottom" :show-after="500">
                    <div class="toolbar-btn" @click="handleFilter">
                        <el-icon>
                            <Filter />
                        </el-icon>
                    </div>
                </el-tooltip>
                <el-tooltip content="排序" placement="bottom" :show-after="500">
                    <el-dropdown trigger="click" @command="handleSort">
                        <div class="toolbar-btn">
                            <el-icon>
                                <Sort />
                            </el-icon>
                            <el-icon class="arrow">
                                <ArrowDown />
                            </el-icon>
                        </div>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item command="asc">升序排列</el-dropdown-item>
                                <el-dropdown-item command="desc">降序排列</el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </el-tooltip>
            </div>

            <div class="toolbar-divider"></div>

            <!-- 插入组 -->
            <div class="toolbar-group">
                <el-tooltip content="插入行/列" placement="bottom" :show-after="500">
                    <el-dropdown trigger="click" @command="handleInsert">
                        <div class="toolbar-btn">
                            <el-icon>
                                <Plus />
                            </el-icon>
                            <el-icon class="arrow">
                                <ArrowDown />
                            </el-icon>
                        </div>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item command="row-above">在上方插入行</el-dropdown-item>
                                <el-dropdown-item command="row-below">在下方插入行</el-dropdown-item>
                                <el-dropdown-item command="col-left">在左侧插入列</el-dropdown-item>
                                <el-dropdown-item command="col-right">在右侧插入列</el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </el-tooltip>
                <el-tooltip content="删除行/列" placement="bottom" :show-after="500">
                    <el-dropdown trigger="click" @command="handleDelete">
                        <div class="toolbar-btn">
                            <el-icon>
                                <Delete />
                            </el-icon>
                            <el-icon class="arrow">
                                <ArrowDown />
                            </el-icon>
                        </div>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item command="row">删除行</el-dropdown-item>
                                <el-dropdown-item command="col">删除列</el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </el-tooltip>
            </div>
        </div>

        <!-- 编辑栏 -->
        <div class="formula-bar">
            <div class="cell-address">
                <el-input v-model="cellAddress" size="small" readonly placeholder="A1" />
            </div>
            <div class="formula-divider"></div>
            <div class="formula-input">
                <span class="fx-label">fx</span>
                <el-input v-model="cellContent" size="small" placeholder="输入内容或公式" @keyup.enter="applyCellContent" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
    RefreshLeft,
    RefreshRight,
    Grid,
    ArrowDown,
    Connection,
    Filter,
    Sort,
    Plus,
    Delete
} from '@element-plus/icons-vue'

// 字体设置
const fontFamily = ref('default')
const fontSize = ref(12)
const fontSizes = [9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72]

// 文字格式
const isBold = ref(false)
const isItalic = ref(false)
const isUnderline = ref(false)
const isStrikethrough = ref(false)

// 颜色
const textColor = ref('#333333')
const bgColor = ref('#ffffff')

// 对齐
const alignment = ref<'left' | 'center' | 'right'>('left')

// 编辑栏
const cellAddress = ref('A1')
const cellContent = ref('')

// 事件处理函数
const handleUndo = () => {
    console.log('撤销')
}

const handleRedo = () => {
    console.log('重做')
}

const toggleBold = () => {
    isBold.value = !isBold.value
}

const toggleItalic = () => {
    isItalic.value = !isItalic.value
}

const toggleUnderline = () => {
    isUnderline.value = !isUnderline.value
}

const toggleStrikethrough = () => {
    isStrikethrough.value = !isStrikethrough.value
}

const setAlignment = (align: 'left' | 'center' | 'right') => {
    alignment.value = align
}

const handleBorder = (command: string) => {
    console.log('边框设置:', command)
}

const handleMerge = () => {
    console.log('合并单元格')
}

const handleFilter = () => {
    console.log('筛选')
}

const handleSort = (command: string) => {
    console.log('排序:', command)
}

const handleInsert = (command: string) => {
    console.log('插入:', command)
}

const handleDelete = (command: string) => {
    console.log('删除:', command)
}

const applyCellContent = () => {
    console.log('应用单元格内容:', cellContent.value)
}
</script>

<style scoped lang="scss">
.excel-header {
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
    border-bottom: 1px solid var(--gray-100);
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
    width: 1.75rem;
    height: 1.75rem;
    border-radius: 0.25rem;
    cursor: pointer;
    color: var(--gray-700);
    transition: all 0.2s ease;

    &:hover {
        background-color: var(--mint-100);
        color: var(--mint-600);
    }

    &.active {
        background-color: var(--mint-200);
        color: var(--mint-700);
    }

    .arrow {
        font-size: 0.625rem;
        margin-left: 0.125rem;
    }
}

.toolbar-divider {
    width: 1px;
    height: 1.25rem;
    background-color: var(--gray-200);
    margin: 0 0.5rem;
}

.font-select {
    width: 6rem;
}

.size-select {
    width: 4rem;
}

.format-icon {
    font-style: normal;
    font-weight: 400;
    font-size: 0.875rem;
    font-family: 'Times New Roman', serif;

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
}

.iconfont {
    font-size: 0.875rem;
}

// 对齐图标样式（临时用文字代替）
.icon-align-left::before {
    content: '≡';
    font-size: 1rem;
}

.icon-align-center::before {
    content: '≡';
    font-size: 1rem;
}

.icon-align-right::before {
    content: '≡';
    font-size: 1rem;
}

// 编辑栏样式
.formula-bar {
    display: flex;
    align-items: center;
    padding: 0.375rem 1rem;
    gap: 0.5rem;
    background-color: var(--gray-50);
}

.cell-address {
    width: 4rem;
    flex-shrink: 0;

    :deep(.el-input__wrapper) {
        background-color: var(--white);
    }

    :deep(.el-input__inner) {
        text-align: center;
        font-weight: 500;
        color: var(--gray-800);
    }
}

.formula-divider {
    width: 1px;
    height: 1.25rem;
    background-color: var(--gray-300);
}

.formula-input {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    .fx-label {
        font-style: italic;
        font-weight: 600;
        color: var(--gray-500);
        font-size: 0.875rem;
    }

    :deep(.el-input) {
        flex: 1;
    }

    :deep(.el-input__wrapper) {
        background-color: var(--white);
    }
}

// Element Plus 组件样式覆盖
:deep(.el-select) {
    .el-input__wrapper {
        background-color: var(--white);
    }
}

:deep(.el-color-picker) {
    .el-color-picker__trigger {
        width: 1.5rem;
        height: 1.5rem;
        padding: 0.125rem;
        border: 1px solid var(--gray-300);
        border-radius: 0.25rem;
    }
}
</style>