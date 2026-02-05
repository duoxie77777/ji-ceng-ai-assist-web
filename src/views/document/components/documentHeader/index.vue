<template>
    <div class="documentHeader">
        <div class="documentHeader-content flex-align-center">
            <div class="documentHeader-content-item flex-center" v-for="(item, index) in contentMap" :key="index"
                @click="toPage(item)">
                <svg-icon :name="assignIcon(item.type)" />
                <div class="documentHeader-content-item-title">{{ item.title }}</div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'
import { assignIcon, assignRoute } from '@/views/document/utils/assign'
import { useRouter } from 'vue-router'
const router = useRouter()
const contentMap = reactive<Record<string, any>>([
    {
        title: "新建文档",
        type: "Word",
    }, {
        title: "新建表格",
        type: "Excel",
    }, {
        title: "新建幻灯片",
        type: "PPT",
    }, {
        title: "新建收集表",
        type: "CollectionForm",
    }, {
        title: "新建流程图",
        type: "FlowChart",
    }, {
        title: "新建思维导图",
        type: "MindMap",
    },
])

const toPage = (item: Record<string, any>) => {
    router.push(assignRoute(item.type))
}
</script>

<style scoped lang="less">
.documentHeader {
    padding: 0 20px;
    height: 100%;

    .documentHeader-content {
        gap: 20px;
        height: 100%;

        .documentHeader-content-item {
            cursor: default;
            gap: 5px;
            font-size: 12px;
            color: var(--gray-900);
            padding: 7px 14px;
            border-radius: 5px;
        }

        .documentHeader-content-item:hover {
            cursor: pointer;
            background-color: var(--gray-100);
        }
    }
}
</style>