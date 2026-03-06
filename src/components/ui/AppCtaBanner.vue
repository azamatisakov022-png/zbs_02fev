<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  title: string
  description?: string
  color?: 'green' | 'blue' | 'purple' | 'sky' | 'amber' | 'emerald'
  gradientFrom?: string
  gradientTo?: string
}>()

defineSlots<{
  icon: () => any
  action: () => any
  default: () => any
}>()

const colorPresets: Record<string, { from: string; to: string }> = {
  green: { from: '#10b981', to: '#059669' },
  blue: { from: '#2563eb', to: '#1d4ed8' },
  purple: { from: '#8b5cf6', to: '#7c3aed' },
  sky: { from: '#0ea5e9', to: '#0284c7' },
  amber: { from: '#f59e0b', to: '#d97706' },
  emerald: { from: '#059669', to: '#0d9488' },
}

const bannerStyle = computed(() => {
  const preset = colorPresets[props.color || 'green']
  const from = props.gradientFrom || preset?.from || '#10b981'
  const to = props.gradientTo || preset?.to || '#059669'
  return { background: `linear-gradient(to right, ${from}, ${to})` }
})
</script>

<template>
  <div class="cta-banner" :style="bannerStyle">
    <div class="cta-banner__circle cta-banner__circle--top"></div>
    <div class="cta-banner__circle cta-banner__circle--bottom"></div>
    <div class="cta-banner__body">
      <div class="cta-banner__icon-box">
        <slot name="icon" />
      </div>
      <div class="cta-banner__text">
        <h2 class="cta-banner__title">{{ title }}</h2>
        <p v-if="description" class="cta-banner__desc">{{ description }}</p>
      </div>
      <div v-if="$slots.action" class="cta-banner__action">
        <slot name="action" />
      </div>
    </div>
    <slot />
  </div>
</template>

<style scoped>
.cta-banner {
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  padding: 24px 32px;
  color: #fff;
}
@media (min-width: 1024px) {
  .cta-banner { padding: 32px; }
}

.cta-banner__circle {
  position: absolute;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.05);
}
.cta-banner__circle--top {
  width: 256px;
  height: 256px;
  top: 0;
  right: 0;
  transform: translate(50%, -50%);
}
.cta-banner__circle--bottom {
  width: 192px;
  height: 192px;
  bottom: 0;
  left: 0;
  transform: translate(-50%, 50%);
}

.cta-banner__body {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
@media (min-width: 1024px) {
  .cta-banner__body {
    flex-direction: row;
    align-items: center;
  }
}

.cta-banner__icon-box {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
@media (min-width: 1024px) {
  .cta-banner__icon-box {
    width: 80px;
    height: 80px;
  }
}

.cta-banner__text {
  flex: 1;
  min-width: 0;
}

.cta-banner__title {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 8px;
}
@media (min-width: 1024px) {
  .cta-banner__title { font-size: 24px; }
}

.cta-banner__desc {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
}

.cta-banner__action {
  flex-shrink: 0;
}
</style>
