<script setup lang="ts">
import { computed } from 'vue'
import type { StatusInfo } from './registry'

const props = withDefaults(defineProps<{ status: StatusInfo; compact?: boolean }>(), { compact: false })

const map = {
  active: { bg: 'var(--lr-brand-050)', fg: 'var(--lr-brand-700)', dot: '#10B981', label: 'Действует' },
  expiring: { bg: 'var(--lr-amber-050)', fg: 'var(--lr-amber)', dot: '#F59A2E', label: 'Истекает' },
  expired: { bg: 'var(--lr-rose-050)', fg: 'var(--lr-rose)', dot: '#B23B3B', label: 'Истекла' },
}
const c = computed(() => map[props.status.key])
const label = computed(() => (props.status.label === 'Отозвана' ? 'Отозвана' : c.value.label))
</script>

<template>
  <span
    class="status-badge"
    :style="{
      padding: compact ? '3px 9px' : '5px 11px',
      fontSize: compact ? '11px' : '12px',
      background: c.bg,
      color: c.fg,
    }"
  >
    <span
      class="status-badge__dot"
      :style="{
        background: c.dot,
        boxShadow: status.key === 'active' ? `0 0 0 3px ${c.bg}` : 'none',
      }"
    />
    {{ label }}
  </span>
</template>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  border-radius: 999px;
  font-weight: 600;
}
.status-badge__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
</style>
