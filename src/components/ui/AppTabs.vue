<script setup lang="ts">
import { computed } from 'vue'

interface Tab {
  key: string
  label: string
  count?: number
  icon?: string
}

const props = defineProps<{
  tabs: Tab[]
  modelValue: string
  variant?: 'pill' | 'underline'
  size?: 'sm' | 'md'
  activeColor?: string
  activeBg?: string
  activeTextColor?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const variantClass = computed(() => `app-tabs--${props.variant || 'pill'}`)
const sizeClass = computed(() => `app-tabs--${props.size || 'md'}`)

const tabStyle = (tab: Tab) => {
  if (tab.key !== props.modelValue) return undefined
  const s: Record<string, string> = {}
  if (props.activeBg) s.background = props.activeBg
  if (props.activeTextColor) s.color = props.activeTextColor
  if (props.activeColor && props.variant === 'underline') s['border-color'] = props.activeColor
  return Object.keys(s).length ? s : undefined
}
</script>

<template>
  <div class="app-tabs" :class="[variantClass, sizeClass]">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      class="app-tabs__tab"
      :class="{ 'app-tabs__tab--active': modelValue === tab.key }"
      :style="tabStyle(tab)"
      @click="emit('update:modelValue', tab.key)"
    >
      <span v-if="tab.icon" class="app-tabs__icon" v-html="tab.icon" />
      {{ tab.label }}
      <span v-if="tab.count !== undefined" class="app-tabs__count">{{ tab.count }}</span>
    </button>
  </div>
</template>

<style scoped>
.app-tabs {
  display: inline-flex;
  gap: 0;
}

.app-tabs--pill {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  border: 1px solid #e5e7eb;
  padding: 4px;
}

.app-tabs--underline {
  border-bottom: 2px solid #e5e7eb;
  gap: 0;
}

.app-tabs__tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
  transition: all 0.15s;
  cursor: pointer;
  white-space: nowrap;
  border: none;
  background: transparent;
}

.app-tabs--md .app-tabs__tab {
  padding: 10px 20px;
  font-size: 16px;
}
.app-tabs--sm .app-tabs__tab {
  padding: 6px 14px;
  font-size: 14px;
}

.app-tabs--pill .app-tabs__tab {
  border-radius: 8px;
  color: #4b5563;
}
.app-tabs--pill .app-tabs__tab:hover:not(.app-tabs__tab--active) {
  background: #f3f4f6;
}
.app-tabs--pill .app-tabs__tab--active {
  background: var(--color-primary);
  color: #fff;
}

.app-tabs--underline .app-tabs__tab {
  color: #64748b;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  border-radius: 0;
}
.app-tabs--underline .app-tabs__tab:hover:not(.app-tabs__tab--active) {
  color: #1e293b;
}
.app-tabs--underline .app-tabs__tab--active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

.app-tabs__icon {
  display: inline-flex;
  align-items: center;
}
.app-tabs__icon :deep(svg) { width: 16px; height: 16px; }

.app-tabs__count {
  font-size: 12px;
  padding: 1px 6px;
  border-radius: 10px;
  background: rgba(0,0,0,0.1);
}
.app-tabs__tab--active .app-tabs__count {
  background: rgba(255,255,255,0.2);
}
</style>
