<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  label: string
  value?: string | number
  color?: 'green' | 'blue' | 'amber' | 'purple' | 'red'
  valueColor?: string
  bg?: string
  borderColor?: string
  centered?: boolean
}>()

const colorPresets: Record<string, string> = {
  green: '#10b981',
  blue: '#2563eb',
  amber: '#d97706',
  purple: '#8b5cf6',
  red: '#dc2626',
}

const cardStyle = computed(() => {
  const s: Record<string, string> = {}
  if (props.bg) s.background = props.bg
  if (props.borderColor) s['border-color'] = props.borderColor
  return Object.keys(s).length ? s : undefined
})

const valueStyle = computed(() => {
  const c = props.valueColor || (props.color ? colorPresets[props.color] : undefined)
  return c ? { color: c } : undefined
})
</script>

<template>
  <div
    :class="['app-stat-card', { 'app-stat-card--centered': centered }]"
    :style="cardStyle"
  >
    <p class="app-stat-card__label">{{ label }}</p>
    <p class="app-stat-card__value" :style="valueStyle">
      <slot>{{ value }}</slot>
    </p>
  </div>
</template>

<style scoped>
.app-stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.app-stat-card--centered {
  text-align: center;
}

.app-stat-card__label {
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  margin: 0 0 4px;
}

.app-stat-card__value {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}
</style>
