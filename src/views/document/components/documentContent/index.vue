<template>
    <div class="documentContent flex-center">
        <div class="no-data flex-center" v-if="hasRouteMatched">
            <svg-icon class="documentContent-icon" name="xinjiandocument" size="100"></svg-icon>
            <div class="no-data-text">让我们打开文件开始工作吧~</div>
        </div>
        <router-view v-else></router-view>
    </div>
</template>

<script lang="ts" setup>
import { useRoute } from 'vue-router'
import { computed } from 'vue'

// 获取当前路由实例
const route = useRoute()

const hasRouteMatched = computed(() => {
    console.log('当前路由名称：', route.name);
    return route.name === 'Document'
})
</script>

<style scoped lang="less">
.documentContent {
    height: 100%;
    width: 100%;

    .no-data {
        flex-direction: column;
        color: var(--gray-300);
        user-select: none;

        .documentContent-icon {
            color: var(--gray-300);
        }
    }
}
</style>