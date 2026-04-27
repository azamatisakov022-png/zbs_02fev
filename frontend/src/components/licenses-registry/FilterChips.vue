<script setup lang="ts">
import { KINDS, KG_REGIONS, type KindId } from './registry'

defineProps<{
  activeKinds: KindId[]
  activeRegion: string
  kindStats?: Record<string, number>
  regionStats?: { region: string; count: number }[]
  totalRegionCount?: number
}>()

defineEmits<{
  (e: 'toggleKind', k: KindId): void
  (e: 'setRegion', r: string): void
}>()

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

function countForRegion(region: string, stats?: { region: string; count: number }[]): number {
  if (!stats) return 0
  const s = stats.find(r => r.region === region)
  return s ? s.count : 0
}
</script>

<template>
  <div class="filter-chips">
    <div class="filter-chips__row">
      <div class="filter-chips__chips">
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
      <select
        :value="activeRegion"
        class="filter-chips__select"
        @change="$emit('setRegion', ($event.target as HTMLSelectElement).value)"
      >
        <option value="">
          Регион: Все<template v-if="totalRegionCount != null"> ({{ totalRegionCount }})</template>
        </option>
        <option
          v-for="r in KG_REGIONS"
          :key="r"
          :value="r"
          :disabled="countForRegion(r, regionStats) === 0"
        >
          {{ r }}<template v-if="regionStats"> ({{ countForRegion(r, regionStats) }})</template>
        </option>
      </select>
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
  gap: 14px;
  flex-wrap: wrap;
  justify-content: space-between;
}
.filter-chips__chips {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  flex: 1;
  min-width: 0;
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
.filter-chips__select {
  flex-shrink: 0;
  min-width: 220px;
  padding: 8px 36px 8px 14px;
  border-radius: 10px;
  border: 1px solid var(--lr-line);
  background: #fff;
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  color: var(--lr-ink);
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23475569' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  transition: border-color 0.12s ease;
}
.filter-chips__select:hover {
  border-color: var(--lr-brand);
}
.filter-chips__select:focus {
  outline: none;
  border-color: var(--lr-brand);
  box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.15);
}
.filter-chips__select option:disabled {
  color: #cbd5e1;
}
</style>
