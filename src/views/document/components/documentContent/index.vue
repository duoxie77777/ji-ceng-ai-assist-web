<template>
    <div class="documentContent flex-center">
        <div class="no-data flex-center">
            <svg-icon class="documentContent-icon" name="xinjiandocument" size="100"></svg-icon>
            <div class="no-data-text">让我们打开文件开始工作吧~</div>
        </div>
    </div>
</template>

<script lang="ts" setup>
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