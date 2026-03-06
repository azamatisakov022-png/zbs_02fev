<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  padding?: 'none' | 'sm' | 'md' | 'lg'
  radius?: 'sm' | 'md' | 'lg'
  shadow?: boolean
  hoverable?: boolean
  selected?: boolean
  hoverColor?: string
  selectedColor?: string
  borderColor?: string
  bg?: string
  noBorder?: boolean
  title?: string
  subtitle?: string
  headerBorder?: boolean
}>()

defineSlots<{
  default: () => any
  header: () => any
  'header-actions': () => any
}>()

const customStyle = computed(() => {
  const s: Record<string, string> = {}
  if (props.bg) s.background = props.bg
  if (props.borderColor) s['border-color'] = props.borderColor
  if (props.hoverColor) s['--card-hover-color'] = props.hoverColor
  if (props.selectedColor) s['--card-selected-color'] = props.selectedColor
  return Object.keys(s).length ? s : undefined
})
</script>

<template>
  <div
    :class="[
      'app-card',
      `app-card--pad-${padding || 'md'}`,
      `app-card--radius-${radius || 'md'}`,
      {
        'app-card--shadow': shadow !== false,
        'app-card--hoverable': hoverable,
        'app-card--selected': selected,
        'app-card--no-border': noBorder,
        'app-card--custom-hover': !!hoverColor,
        'app-card--custom-selected': !!selectedColor,
      }
    ]"
    :style="customStyle"
  >
    <div v-if="title || subtitle || $slots.header || $slots['header-actions']" :class="['app-card__header', { 'app-card__header--border': headerBorder }]">
      <div v-if="$slots.header" class="app-card__header-content">
        <slot name="header" />
      </div>
      <div v-else class="app-card__header-content">
        <h3 v-if="title" class="app-card__title">{{ title }}</h3>
        <p v-if="subtitle" class="app-card__subtitle">{{ subtitle }}</p>
      </div>
      <div v-if="$slots['header-actions']" class="app-card__header-actions">
        <slot name="header-actions" />
      </div>
    </div>
    <slot />
  </div>
</template>

<style scoped>
.app-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.app-card--no-border { border: none; }

.app-card--radius-sm { border-radius: 10px; }
.app-card--radius-md { border-radius: 16px; }
.app-card--radius-lg { border-radius: 20px; }

.app-card--pad-none { padding: 0; }
.app-card--pad-sm { padding: 12px; }
.app-card--pad-md { padding: 20px; }
.app-card--pad-lg { padding: 28px; }

.app-card--shadow { box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05); }

.app-card--hoverable {
  cursor: pointer;
}
.app-card--hoverable:hover {
  border-color: #0e888d;
  box-shadow: 0 4px 12px rgba(14, 136, 141, 0.1);
}

.app-card--custom-hover:hover {
  border-color: var(--card-hover-color) !important;
  box-shadow: 0 4px 12px color-mix(in srgb, var(--card-hover-color) 15%, transparent) !important;
}

.app-card--selected {
  border-color: #0e888d;
  box-shadow: 0 2px 8px rgba(14, 136, 141, 0.1);
}

.app-card--custom-selected {
  border-color: var(--card-selected-color) !important;
  box-shadow: 0 2px 8px color-mix(in srgb, var(--card-selected-color) 15%, transparent) !important;
}

.app-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.app-card__header--border {
  padding-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
}

.app-card__header-content {
  flex: 1;
  min-width: 0;
}

.app-card__title {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
}

.app-card__subtitle {
  font-size: 14px;
  color: #64748b;
  margin-top: 2px;
}

.app-card__header-actions {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
