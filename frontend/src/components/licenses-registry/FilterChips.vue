<script setup lang="ts">
import { KINDS, type KindId, type StatusKey } from './registry'

defineProps<{
  activeKinds: KindId[]
  activeStatus: StatusKey | 'all'
  counts: { all: number; active: number; expiring: number; expired: number }
  kindStats?: Record<string, number>
}>()

defineEmits<{
  (e: 'toggleKind', k: KindId): void
  (e: 'setStatus', s: StatusKey | 'all'): void
}>()

const statusOpts: { k: StatusKey | 'all'; label: string; key: 'all' | 'active' | 'expiring' | 'expired' }[] = [
  { k: 'all', label: 'Все', key: 'all' },
  { k: 'active', label: 'Действующие', key: 'active' },
  { k: 'expiring', label: 'Истекают', key: 'expiring' },
  { k: 'expired', label: 'Истёкшие', key: 'expired' },
]

const kindsList = Object.values(KINDS)

function chipStyle(active: boolean, hue?: number) {
  if (!active) {
    return {
      background: '#fff',
      color: 'var(--lr-ink-2)',
      borderColor: 'var(--lr-line)',
    }
  }
  if (hue != null) {
    return {
      background: `oklch(95% 0.05 ${hue})`,
      color: `oklch(30% 0.1 ${hue})`,
      borderColor: `oklch(85% 0.08 ${hue})`,
    }
  }
  return {
    background: 'var(--lr-ink)',
    color: '#fff',
    borderColor: 'var(--lr-ink)',
  }
}

function countFor(k: 'all' | 'active' | 'expiring' | 'expired', counts: { all: number; active: number; expiring: number; expired: number }) {
  return counts[k]
}
</script>

<template>
  <div class="filter-chips">
    <div class="filter-chips__row">
      <span class="filter-chips__label">Статус</span>
      <button
        v-for="o in statusOpts"
        :key="o.k"
        class="chip"
        :style="chipStyle(activeStatus === o.k)"
        @click="$emit('setStatus', o.k)"
      >
        {{ o.label }} <span class="chip__count">{{ countFor(o.key, counts) }}</span>
      </button>
    </div>
    <div class="filter-chips__row">
      <span class="filter-chips__label">Вид деятельности</span>
      <button
        v-for="k in kindsList"
        :key="k.id"
        class="chip"
        :style="chipStyle(activeKinds.includes(k.id), k.hue)"
        @click="$emit('toggleKind', k.id)"
      >
        <span class="chip__swatch" :style="{ background: `oklch(62% 0.14 ${k.hue})` }" />
        {{ k.label }}
        <span v-if="kindStats && kindStats[k.id]" class="chip__count">{{ kindStats[k.id] }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.filter-chips {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.filter-chips__row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.filter-chips__label {
  font-size: 11px;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: var(--lr-ink-4);
  font-weight: 600;
  margin-right: 4px;
}
.chip {
  padding: 7px 12px;
  border-radius: 999px;
  border: 1px solid;
  font-size: 12.5px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.12s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.chip__count {
  opacity: 0.65;
  margin-left: 4px;
}
.chip__swatch {
  width: 8px;
  height: 8px;
  border-radius: 3px;
}
</style>
