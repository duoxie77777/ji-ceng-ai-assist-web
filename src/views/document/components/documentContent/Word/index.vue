<template>
    <div class="word-wrapper">
        <WordHeader 
            @command="handleCommand" 
            @insert-html="handleInsertHtml"
            @line-height="handleLineHeight"
        />
        <WordContent 
            ref="contentRef" 
            v-model="content"
            @selection-change="handleSelectionChange"
        />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import WordHeader from './wordHeader/index.vue'
import WordContent from './wordContent/index.vue'

// 编辑器内容
const content = ref('')

// 编辑器引用
const contentRef = ref<InstanceType<typeof WordContent> | null>(null)

// 处理工具栏命令
const handleCommand = (command: string, value?: string) => {
    contentRef.value?.execCommand(command, value)
}

// 处理插入 HTML
const handleInsertHtml = (html: string) => {
    contentRef.value?.insertHtml(html)
}

// 处理行高变化
const handleLineHeight = (value: string) => {
    contentRef.value?.setLineHeight(value)
}

// 处理选区变化
const handleSelectionChange = () => {
    // 可以在这里更新工具栏状态
}
</script>

<style scoped lang="scss">
.word-wrapper {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background-color: var(--gray-50);
}
</style>