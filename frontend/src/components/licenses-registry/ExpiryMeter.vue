<script setup lang="ts">
import { computed } from 'vue'
import { daysBetween, fmt, type LicenseUI } from './registry'

const props = withDefaults(defineProps<{ lic: LicenseUI; compact?: boolean; today?: Date }>(), {
  compact: false,
})

const today = computed(() => props.today || new Date())

const pct = computed(() => {
  const total = Math.max(1, daysBetween(props.lic.issued, props.lic.expires))
  const passed = daysBetween(props.lic.issued, today.value)
  return Math.max(0, Math.min(100, (passed / total) * 100))
})

const color = computed(() => {
  const k = props.lic.status.key
  return k === 'expired' ? 'var(--lr-rose)' : k === 'expiring' ? 'var(--lr-amber)' : 'var(--lr-brand)'
})

const daysLabel = computed(() => {
  const d = props.lic.status.days
  return props.lic.status.key === 'expired' ? `${Math.abs(d)} дн. назад` : `${d} дн.`
})
</script>

<template>
  <div class="meter" :style="{ minWidth: compact ? '140px' : '200px' }">
    <div class="meter__top">
      <span class="mono">{{ fmt(lic.issued) }}</span>
      <span class="mono meter__days" :style="{ color }">{{ daysLabel }}</span>
    </div>
    <div class="meter__bar">
      <div class="meter__fill" :style="{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}99)` }" />
      <div class="meter__cursor" :style="{ left: `${pct}%`, background: color }" />
    </div>
    <div v-if="!compact" class="meter__bottom">
      <span>выдана</span>
      <span>действует до <span class="mono">{{ fmt(lic.expires) }}</span></span>
    </div>
  </div>
</template>

<style scoped>
.meter {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.meter__top {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--lr-ink-3);
}
.meter__days {
  font-weight: 600;
}
.meter__bar {
  height: 6px;
  border-radius: 4px;
  background: var(--lr-line-2);
  overflow: visible;
  position: relative;
}
.meter__fill {
  position: absolute;
  inset: 0 auto 0 0;
  border-radius: 4px;
}
.meter__cursor {
  position: absolute;
  top: -2px;
  width: 2px;
  height: 10px;
  border-radius: 1px;
}
.meter__bottom {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--lr-ink-4);
}
.mono {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
}
</style>
