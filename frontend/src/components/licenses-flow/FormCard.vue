<script setup lang="ts">
withDefaults(defineProps<{ pad?: number | string; noPad?: boolean }>(), { pad: 24, noPad: false })
</script>

<template>
  <div class="form-card" :style="noPad ? undefined : { padding: typeof pad === 'number' ? `${pad}px` : pad }">
    <slot />
  </div>
</template>

<style scoped>
.form-card {
  background: #fff;
  border: 1px solid var(--lf-line);
  border-radius: 14px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
}
</style>
