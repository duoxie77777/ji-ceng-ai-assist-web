<template>
    <div class="documentHeader">
        <div class="documentHeader-content flex-align-center">
            <div class="documentHeader-content-item flex-center" v-for="(item, index) in contentMap" :key="index">
                <svg-icon :name="item.icon" />
                <div class="documentHeader-content-item-title">{{ item.title }}</div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'
const contentMap = reactive<Record<string, any>>([
    {
        title: "新建文档",
        icon: "icon-table",
    }, {
        title: "新建表格",
        icon: "icon-table",
    }, {
        title: "新建幻灯片",
        icon: "icon-table",
    }, {
        title: "新建思维导图",
        icon: "icon-table",
    }, {
        title: "新建流程图",
        icon: "icon-table",
    },
])
</script>

<style scoped lang="less">
.documentHeader {
    padding: 0 20px;
    height: 100%;

    .documentHeader-content {
        gap: 40px;
        height: 100%;

        .documentHeader-content-item {
            cursor: default;
            font-size: 12px;
            background-color: var(--blue-400);
            color: var(--white);
            padding: 7px 14px;
            border-radius: 10px;
        }
    }
}
</style>