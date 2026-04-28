<script setup lang="ts">
defineProps<{ mt?: boolean }>()
</script>

<template>
  <div class="section-label" :class="{ 'section-label--mt': mt }">
    <span class="section-label__text">
      <slot />
    </span>
    <span v-if="$slots.right" class="section-label__right">
      <slot name="right" />
    </span>
  </div>
</template>

<style scoped>
.section-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: var(--lf-ink-4);
  margin-bottom: 12px;
}
.section-label--mt {
  margin-top: 20px;
}
.section-label__text {
  color: var(--lf-ink-3);
}
</style>
