<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  variant?: 'info' | 'success' | 'warning' | 'error'
  title?: string
  icon?: string
  closable?: boolean
  bg?: string
  borderColor?: string
  color?: string
}>()

defineEmits<{
  (e: 'close'): void
}>()

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'success': return 'app-alert--success'
    case 'warning': return 'app-alert--warning'
    case 'error': return 'app-alert--error'
    default: return 'app-alert--info'
  }
})

const customStyle = computed(() => {
  const s: Record<string, string> = {}
  if (props.bg) s.background = props.bg
  if (props.borderColor) s['border-color'] = props.borderColor
  if (props.color) s.color = props.color
  return Object.keys(s).length ? s : undefined
})

const defaultIcon = computed(() => {
  if (props.icon) return props.icon
  switch (props.variant) {
    case 'success':
      return '<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>'
    case 'warning':
      return '<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>'
    case 'error':
      return '<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>'
    default:
      return '<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>'
  }
})
</script>

<template>
  <div class="app-alert" :class="variantClasses" :style="customStyle">
    <div class="app-alert__icon" v-html="defaultIcon" />
    <div class="app-alert__body">
      <p v-if="title" class="app-alert__title">{{ title }}</p>
      <div class="app-alert__content"><slot /></div>
    </div>
    <button v-if="closable" class="app-alert__close" @click="$emit('close')">
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
    </button>
  </div>
</template>

<style scoped>
.app-alert {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid;
}

.app-alert--info {
  background: #eff6ff;
  border-color: #bfdbfe;
  color: #1e40af;
}
.app-alert--success {
  background: #f0fdf4;
  border-color: #bbf7d0;
  color: #166534;
}
.app-alert--warning {
  background: #fffbeb;
  border-color: #fde68a;
  color: #92400e;
}
.app-alert--error {
  background: #fef2f2;
  border-color: #fecaca;
  color: #991b1b;
}

.app-alert__icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.app-alert--info .app-alert__icon { background: #dbeafe; }
.app-alert--success .app-alert__icon { background: #dcfce7; }
.app-alert--warning .app-alert__icon { background: #fef3c7; }
.app-alert--error .app-alert__icon { background: #fee2e2; }

.app-alert__body { flex: 1; min-width: 0; }

.app-alert__title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 2px;
}

.app-alert__content {
  font-size: 15px;
  font-weight: 500;
}

.app-alert__close {
  flex-shrink: 0;
  padding: 4px;
  border-radius: 6px;
  opacity: 0.6;
  transition: opacity 0.15s;
  cursor: pointer;
}
.app-alert__close:hover { opacity: 1; }
</style>
