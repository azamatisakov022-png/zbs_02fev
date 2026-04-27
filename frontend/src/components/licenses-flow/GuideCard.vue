<script setup lang="ts">
defineProps<{
  step: number
  total: number
  title: string
  description?: string
}>()
</script>

<template>
  <div class="guide">
    <div class="guide__eyebrow">Шаг {{ step }} из {{ total }}</div>
    <div class="guide__title">{{ title }}</div>
    <div v-if="description" class="guide__text">{{ description }}</div>
  </div>
</template>

<style scoped>
.guide {
  position: relative;
  padding: 18px 20px;
  border-radius: 14px;
  color: #fff;
  background: linear-gradient(135deg, #0d9488 0%, #14b8a6 50%, #10b981 100%);
  border: none;
  box-shadow: 0 8px 24px -10px rgba(13, 148, 136, 0.55);
  overflow: hidden;
}
.guide::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(120% 80% at 0% 0%, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0) 60%);
  pointer-events: none;
}
.guide > * {
  position: relative;
}
.guide__eyebrow {
  font-size: 11px;
  opacity: 0.85;
  font-weight: 700;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}
.guide__title {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.3px;
  margin-top: 4px;
}
.guide__text {
  font-size: 12.5px;
  opacity: 0.92;
  margin-top: 8px;
  line-height: 1.55;
}
</style>
