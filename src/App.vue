<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useThemeStore } from '@/store'

onMounted(() => {
  const themeStore = useThemeStore()
  themeStore.init()
})
</script>

<style scoped lang="less"></style>
