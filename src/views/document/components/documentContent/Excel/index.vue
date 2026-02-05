<template>
    <div class="excel-wrapper">
        <excelHeader />
        <excelContent />
    </div>
</template>

<script setup>
import excelHeader from './excelHeader/index.vue';
import excelContent from './excelContent/index.vue';
</script>


<style scoped lang="scss">
.excel-wrapper {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}
</style>
