<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ warn?: boolean; danger?: boolean }>()
const bg = computed(() => (props.warn ? '#FFE7C2' : props.danger ? '#F5D1D1' : '#D8ECE0'))
const fg = computed(() => (props.warn ? '#C98116' : props.danger ? '#B23B3B' : '#0A7048'))
</script>

<template>
  <div class="mini-icon" :style="{ background: bg, color: fg }">
    <svg v-if="warn" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
      <path d="M12 9v5M12 17v.01" />
      <path d="M10.3 3.9L2.8 16.5c-.8 1.4.2 3.2 1.9 3.2h14.6c1.7 0 2.7-1.8 1.9-3.2L13.7 3.9c-.8-1.3-2.6-1.3-3.4 0z" />
    </svg>
    <svg v-else-if="danger" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
      <path d="M3 6h18M8 6V4h8v2M6 6l1 14a2 2 0 002 2h6a2 2 0 002-2l1-14" />
    </svg>
    <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
      <path d="M5 12l4 4L19 7" />
    </svg>
  </div>
</template>

<style scoped>
.mini-icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: grid;
  place-items: center;
}
</style>
