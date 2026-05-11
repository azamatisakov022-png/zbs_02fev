<script setup lang="ts">
import { computed } from 'vue'
import { daysBetween, type LicenseUI } from './registry'

const props = withDefaults(defineProps<{ lic: LicenseUI; size?: number; today?: Date }>(), { size: 64 })

const today = computed(() => props.today || new Date())
const r = computed(() => props.size / 2 - 4)
const C = computed(() => 2 * Math.PI * r.value)
const pct = computed(() => {
  const total = Math.max(1, daysBetween(props.lic.issued, props.lic.expires))
  const passed = Math.max(0, Math.min(total, daysBetween(props.lic.issued, today.value)))
  return passed / total
})
const color = computed(() => {
  const k = props.lic.status.key
  return k === 'expired' ? 'var(--lr-rose)' : k === 'expiring' ? 'var(--lr-amber)' : 'var(--lr-brand)'
})
const label = computed(() =>
  props.lic.status.key === 'expired' ? '-' : Math.round((1 - pct.value) * 100) + '%'
)
</script>

<template>
  <div class="ring" :style="{ width: `${size}px`, height: `${size}px` }">
    <svg :width="size" :height="size" style="transform: rotate(-90deg)">
      <circle :cx="size / 2" :cy="size / 2" :r="r" stroke="var(--lr-line-2)" stroke-width="4" fill="none" />
      <circle
        :cx="size / 2"
        :cy="size / 2"
        :r="r"
        :stroke="color"
        stroke-width="4"
        fill="none"
        :stroke-dasharray="C"
        :stroke-dashoffset="C * pct"
        stroke-linecap="round"
      />
    </svg>
    <div class="ring__center">
      <div>
        <div class="ring__value mono" :style="{ color }">{{ label }}</div>
        <div class="ring__hint">осталось</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ring {
  position: relative;
}
.ring__center {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  text-align: center;
}
.ring__value {
  font-size: 14px;
  font-weight: 700;
  line-height: 1;
}
.ring__hint {
  font-size: 9px;
  color: var(--lr-ink-4);
  letter-spacing: 0.3px;
  margin-top: 1px;
}
.mono {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
}
</style>
