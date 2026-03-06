<script setup lang="ts">
defineProps<{
  text: string
  width?: string
}>()
</script>

<template>
  <div class="app-tooltip-wrap">
    <slot />
    <div class="app-tooltip" :style="width ? { width } : undefined">{{ text }}</div>
  </div>
</template>

<style scoped>
.app-tooltip-wrap {
  position: relative;
  display: inline-flex;
}

.app-tooltip-wrap:hover .app-tooltip {
  opacity: 1;
  visibility: visible;
}

.app-tooltip {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: calc(100% + 8px);
  width: 320px;
  padding: 10px 14px;
  background: #1e293b;
  color: #f1f5f9;
  font-size: 13px;
  line-height: 1.5;
  border-radius: 8px;
  opacity: 0;
  visibility: hidden;
  transition: all 0.15s;
  z-index: 50;
  pointer-events: none;
  white-space: normal;
}
</style>
