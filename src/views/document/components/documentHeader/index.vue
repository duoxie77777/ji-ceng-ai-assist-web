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
        icon: "qiweizaixianwendang-fill",
    }, {
        title: "新建表格",
        icon: "qiweizaixianbiaoge-fill",
    }, {
        title: "新建幻灯片",
        icon: "qiweiyanshiwengao-fill",
    }, {
        title: "新建收集表",
        icon: "qiweishoujibiao-fill",
    }, {
        title: "新建流程图",
        icon: "qiweiliuchengtu-fill",
    }, {
        title: "新建思维导图",
        icon: "qiweisiweidaotu-fill",
    },
])
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