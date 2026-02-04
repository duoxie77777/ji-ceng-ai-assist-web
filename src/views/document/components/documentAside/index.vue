<template>
    <div class="documentAside">
        <div class="documentAside-content">
            <div class="documentAside-content-item flex-align-center" v-for="(item, index) in contentMap" :key="index">
                <svg-icon size="26" :name="assignIcon(item.type)"></svg-icon>
                <div class="content-item-info flex">
                    <div class="item-title">{{ item.title }}</div>
                    <div class="flex-justify-between" style="width: 100%;">
                        <div class="item-desc">{{ item.desc }}</div>
                        <div class="item-time">{{ item.time }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'

const iconMap: Record<string, string> = {
    document: "qiweizaixianwendang-fill",
    table: "qiweizaixianbiaoge-fill",
    slide: "qiweiyanshiwengao-fill",
    collect: "qiweishoujibiao-fill",
    flow: "qiweiliuchengtu-fill",
    mind: "qiweisiweidaotu-fill",
    other: "qitawenjian-fill",
}

const contentMap = reactive<Record<string, any>>([
    {
        title: "在线文档",
        type: "document",
        time: "2025-01-01",
        desc: "这是一个在线文档这是一个在线文档这是一个在线文档这是一个在线文档这是一个在线文档这是一个在线文档这是一个在线文档"
    },
    {
        title: "在线表格",
        type: "table",
        time: "2025-01-01",
        desc: "这是一个在线表格1231231"
    },
    {
        title: "在线幻灯片",
        type: "slide",
        time: "2025-01-01",
        desc: "这是一个在线幻灯片"
    },
    {
        title: "在线收集表",
        type: "collect",
        time: "2025-01-01",
        desc: "这是一个在线收集表"
    },
    {
        title: "在线流程图",
        type: "flow",
        time: "2025-01-01",
        desc: "这是一个在线流程图"
    },
    {
        title: "在线思维导图",
        type: "mind",
        time: "2025-01-01",
        desc: "这是一个在线思维导图"
    }, {
        title: "在线文档",
        type: "document",
        time: "2025-01-01",
        desc: "这是一个在线文档这是一个在线文档这是一个在线文档这是一个在线文档这是一个在线文档这是一个在线文档这是一个在线文档"
    },
    {
        title: "在线表格",
        type: "table",
        time: "2025-01-01",
        desc: "这是一个在线表格1231231"
    },
    {
        title: "在线幻灯片",
        type: "slide",
        time: "2025-01-01",
        desc: "这是一个在线幻灯片"
    },
    {
        title: "在线收集表",
        type: "collect",
        time: "2025-01-01",
        desc: "这是一个在线收集表"
    },
    {
        title: "在线流程图",
        type: "flow",
        time: "2025-01-01",
        desc: "这是一个在线流程图"
    },
    {
        title: "在线思维导图",
        type: "mind",
        time: "2025-01-01",
        desc: "这是一个在线思维导图"
    }, {
        title: "在线文档",
        type: "document",
        time: "2025-01-01",
        desc: "这是一个在线文档这是一个在线文档这是一个在线文档这是一个在线文档这是一个在线文档这是一个在线文档这是一个在线文档"
    },
    {
        title: "在线表格",
        type: "table",
        time: "2025-01-01",
        desc: "这是一个在线表格1231231"
    },
    {
        title: "在线幻灯片",
        type: "slide",
        time: "2025-01-01",
        desc: "这是一个在线幻灯片"
    },
    {
        title: "在线收集表",
        type: "collect",
        time: "2025-01-01",
        desc: "这是一个在线收集表"
    },
    {
        title: "在线流程图",
        type: "flow",
        time: "2025-01-01",
        desc: "这是一个在线流程图"
    },
    {
        title: "在线思维导图",
        type: "mind",
        time: "2025-01-01",
        desc: "这是一个在线思维导图"
    }, {
        title: "在线文档",
        type: "document",
        time: "2025-01-01",
        desc: "这是一个在线文档这是一个在线文档这是一个在线文档这是一个在线文档这是一个在线文档这是一个在线文档这是一个在线文档"
    },
    {
        title: "在线表格",
        type: "table",
        time: "2025-01-01",
        desc: "这是一个在线表格1231231"
    },
    {
        title: "在线幻灯片",
        type: "slide",
        time: "2025-01-01",
        desc: "这是一个在线幻灯片"
    },
    {
        title: "在线收集表",
        type: "collect",
        time: "2025-01-01",
        desc: "这是一个在线收集表"
    },
    {
        title: "在线流程图",
        type: "flow",
        time: "2025-01-01",
        desc: "这是一个在线流程图"
    },
    {
        title: "在线思维导图",
        type: "mind",
        time: "2025-01-01",
        desc: "这是一个在线思维导图"
    }
])

const assignIcon = (type: string) => {
    return iconMap[type] || iconMap["other"]
}
</script>

<style scoped lang="less">
.documentAside-content-item {
    padding: 15px 10px;
    box-shadow: 0 1px 0 0 var(--gray-200);

    &:hover {
        cursor: pointer;
        background-color: var(--gray-100);
    }

    .content-item-info {
        font-size: 10px;
        flex: 1;
        padding-left: 10px;
        color: var(--gray-500);
        flex-direction: column;
        gap: 5px;

        .item-title {
            color: var(--gray-800);
            font-size: 12px;
        }

        .item-desc {
            color: var(--gray-600);
            text-overflow: ellipsis;
            overflow: hidden;
            white-space: nowrap;
            flex: 1;
            max-width: 150px;
        }

    }
}
</style>