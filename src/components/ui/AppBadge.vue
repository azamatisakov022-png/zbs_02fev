<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral'
  label?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  bg?: string
  color?: string
  uppercase?: boolean
}>()

const customStyle = computed(() => {
  const s: Record<string, string> = {}
  if (props.bg) s.background = props.bg
  if (props.color) s.color = props.color
  return Object.keys(s).length ? s : undefined
})
</script>

<template>
  <span
    :class="[
      'app-badge',
      `app-badge--${size || 'md'}`,
      { [`app-badge--${variant || 'neutral'}`]: !bg && !color },
      { 'app-badge--uppercase': uppercase }
    ]"
    :style="customStyle"
  >
    <slot>{{ label }}</slot>
  </span>
</template>

<style scoped>
.app-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border-radius: 20px;
  font-weight: 600;
  white-space: nowrap;
  line-height: 1.4;
}

.app-badge--xs {
  padding: 2px 8px;
  font-size: 12px;
  gap: 3px;
}
.app-badge--sm {
  padding: 3px 10px;
  font-size: 13px;
  gap: 4px;
}
.app-badge--md {
  padding: 4px 12px;
  font-size: 14px;
}
.app-badge--lg {
  padding: 5px 14px;
  font-size: 15px;
}

.app-badge--uppercase {
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.app-badge--success { background: #DCFCE7; color: #16A34A; }
.app-badge--warning { background: #FEF9C3; color: #CA8A04; }
.app-badge--danger  { background: #FEE2E2; color: #DC2626; }
.app-badge--info    { background: #DBEAFE; color: #2563EB; }
.app-badge--neutral { background: #F1F5F9; color: #64748B; }
</style>
