<template>
    <div class="excel-container" ref="containerRef">
        <HotTable 
            ref="hotRef"
            :data="tableData" 
            :colHeaders="colHeaders" 
            :rowHeaders="true" 
            :readOnly="false" 
            :autoColumnSize="false"
            :width="tableWidth"
            :height="tableHeight"
            :stretchH="'all'"
            :cells="cellConfig" 
            licenseKey="non-commercial-and-evaluation" 
        />
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { HotTable } from '@handsontable/vue3';
import 'handsontable/styles/handsontable.css';
import { registerAllModules } from 'handsontable/registry';
registerAllModules();

const containerRef = ref(null);
const hotRef = ref(null);
const tableWidth = ref(800);
const tableHeight = ref(600);

// 生成 26 个英文字母列头（A~Z）
const colHeaders = ref([]);
for (let i = 0; i < 26; i++) {
    // 利用 ASCII 码转换生成英文字母（A 的 ASCII 码是 65）
    colHeaders.value.push(String.fromCharCode(65 + i));
}

// 单元格配置函数
const cellConfig = (instance, row, col, prop) => {
    const cellProperties = {};
    // 设置固定宽高
    cellProperties.width = 120;  // 单元格宽度
    cellProperties.height = 30; // 单元格高度
    return cellProperties;
};

// 生成模拟表格数据（5行26列，与列头数量匹配，保证表头正常渲染）
const tableData = Array.from({ length: 100 }, (_, rowIndex) => {
    // 每行生成26个数据项，与列头（A~Z）一一对应
    return Array.from({ length: 26 }, (_, colIndex) => {
        // 填充模拟数据，格式：行号-列号（如 0-A、1-B）
        return ``;
    });
});

// 更新表格尺寸
const updateSize = () => {
    if (containerRef.value) {
        tableWidth.value = containerRef.value.offsetWidth;
        tableHeight.value = containerRef.value.offsetHeight;
    }
};

// 监听容器大小变化
let resizeObserver = null;

onMounted(() => {
    nextTick(() => {
        updateSize();
    });
    
    resizeObserver = new ResizeObserver(() => {
        updateSize();
    });
    if (containerRef.value) {
        resizeObserver.observe(containerRef.value);
    }
});

onUnmounted(() => {
    if (resizeObserver) {
        resizeObserver.disconnect();
    }
});
</script>


<style scoped lang="scss">
@use './Excel.scss';

.excel-container {
    width: 100%;
    flex: 1;
    overflow: hidden;
}
</style>
