<script setup lang="ts">
import { computed } from 'vue'
import { fmt, ruPlural, type LicenseUI, type StatusKey, type KindId } from './registry'
import StatCard from './StatCard.vue'
import MiniIcon from './MiniIcon.vue'
import SearchBar from './SearchBar.vue'
import FilterChips from './FilterChips.vue'
import EmptyState from './EmptyState.vue'

const props = defineProps<{
  data: LicenseUI[]
  query: string
  filters: { status: StatusKey | 'all'; kinds: KindId[]; region: string }
  counts: { all: number; active: number; expiring: number; expired: number }
  today: Date
}>()

defineEmits<{
  (e: 'update:query', v: string): void
  (e: 'open', lic: LicenseUI): void
  (e: 'setStatus', s: StatusKey | 'all'): void
  (e: 'toggleKind', k: KindId): void
  (e: 'setRegion', r: string): void
  (e: 'reset'): void
}>()

const filtered = computed(() => {
  const q = props.query.trim().toLowerCase()
  return props.data.filter(l => {
    if (q && !`${l.num} ${l.inn} ${l.org}`.toLowerCase().includes(q)) return false
    if (props.filters.status !== 'all' && l.status.key !== props.filters.status) return false
    if (props.filters.kinds.length && !l.kinds.some(k => props.filters.kinds.includes(k))) return false
    if (props.filters.region && l.region !== props.filters.region) return false
    return true
  })
})

const sorted = computed(() =>
  [...filtered.value].sort((a, b) => a.expires.getTime() - b.expires.getTime())
)

const range = computed(() => {
  if (props.data.length === 0) {
    const y = props.today.getFullYear()
    return { start: new Date(y, 0, 1), end: new Date(y + 1, 0, 1), total: 1 }
  }
  const allIssued = props.data.map(l => l.issued.getTime())
  const allExpires = props.data.map(l => l.expires.getTime())
  const rMin = new Date(Math.min(...allIssued))
  const rMax = new Date(Math.max(...allExpires))
  const start = new Date(rMin.getFullYear(), rMin.getMonth(), 1)
  const end = new Date(rMax.getFullYear(), rMax.getMonth() + 2, 1)
  return { start, end, total: end.getTime() - start.getTime() }
})

const yearTicks = computed(() => {
  const ticks: Date[] = []
  for (let y = range.value.start.getFullYear(); y <= range.value.end.getFullYear(); y++) {
    ticks.push(new Date(y, 0, 1))
  }
  return ticks
})

function pct(d: Date) {
  return ((d.getTime() - range.value.start.getTime()) / range.value.total) * 100
}

function todayPct() {
  return pct(props.today)
}

function barFor(lic: LicenseUI) {
  const left = pct(lic.issued)
  const right = pct(lic.expires)
  const width = Math.max(2, right - left)
  const hue = lic.kindMeta.hue
  const isDanger = lic.status.key === 'expired'
  const isWarn = lic.status.key === 'expiring'
  const color = isDanger ? 'var(--lr-rose)' : isWarn ? 'var(--lr-amber)' : `oklch(55% 0.14 ${hue})`
  const bg = isDanger
    ? `repeating-linear-gradient(45deg, ${color}, ${color} 4px, rgba(178,59,59,0.7) 4px, rgba(178,59,59,0.7) 8px)`
    : `linear-gradient(90deg, ${color}, ${color}dd)`
  return { left, right, width, color, bg, isDanger }
}
</script>

<template>
  <div class="timeline">
    <!-- Stats -->
    <div class="timeline__stats">
      <StatCard
        kind="neutral"
        label="Всего"
        :value="counts.all"
        hint="в реестре"
        :active="filters.status === 'all'"
        @click="$emit('setStatus', 'all')"
      >
        <template #icon><MiniIcon /></template>
      </StatCard>
      <StatCard
        kind="success"
        label="Действующие"
        :value="counts.active"
        :sub="counts.all ? `${Math.round((counts.active / counts.all) * 100)}%` : '0%'"
        :hint="`на ${fmt(today)}`"
        :active="filters.status === 'active'"
        @click="$emit('setStatus', 'active')"
      >
        <template #icon><MiniIcon /></template>
      </StatCard>
      <StatCard
        kind="warn"
        label="Истекают в 90 дн."
        :value="counts.expiring"
        hint="требуют продления"
        :active="filters.status === 'expiring'"
        @click="$emit('setStatus', 'expiring')"
      >
        <template #icon><MiniIcon warn /></template>
      </StatCard>
      <StatCard
        kind="muted"
        label="Истёкшие"
        :value="counts.expired"
        hint="в архиве"
        :active="filters.status === 'expired'"
        @click="$emit('setStatus', 'expired')"
      >
        <template #icon><MiniIcon danger /></template>
      </StatCard>
    </div>

    <!-- Search + filters -->
    <div class="timeline__panel">
      <SearchBar :model-value="query" @update:model-value="$emit('update:query', $event)" :results="filtered.length" />
      <FilterChips
        :active-kinds="filters.kinds"
        :active-status="filters.status"
        :counts="counts"
        @toggle-kind="$emit('toggleKind', $event)"
        @set-status="$emit('setStatus', $event)"
      />
    </div>

    <!-- Timeline -->
    <div class="timeline__card">
      <div class="timeline__header">
        <div>
          <div class="timeline__title">Шкала действия лицензий</div>
          <div class="timeline__subtitle">
            {{ filtered.length }} {{ ruPlural(filtered.length, ['запись', 'записи', 'записей']) }}
            · отсортировано по дате истечения
          </div>
        </div>
        <div class="legend">
          <span class="legend__item">
            <span class="legend__swatch" style="background: var(--lr-brand)" /> действует
          </span>
          <span class="legend__item">
            <span class="legend__swatch" style="background: var(--lr-amber)" /> истекает
          </span>
          <span class="legend__item">
            <span
              class="legend__swatch"
              style="background: repeating-linear-gradient(45deg, var(--lr-rose), var(--lr-rose) 3px, rgba(178,59,59,0.6) 3px, rgba(178,59,59,0.6) 6px)"
            /> истёкшая
          </span>
        </div>
      </div>

      <!-- Header row -->
      <div class="timeline__cols-head">
        <div>Организация</div>
        <div>Вид</div>
        <div class="timeline__ticks">
          <div
            v-for="(t, i) in yearTicks"
            :key="i"
            class="timeline__tick-label"
            :style="{ left: `${pct(t)}%` }"
            v-show="pct(t) >= 0 && pct(t) <= 100"
          >
            {{ t.getFullYear() }}
          </div>
          <div class="timeline__today-label" :style="{ left: `${todayPct()}%` }">Сегодня</div>
        </div>
      </div>

      <!-- Tracks -->
      <div class="timeline__tracks">
        <EmptyState v-if="sorted.length === 0" :query="query" @clear="$emit('reset')" />
        <div
          v-for="l in sorted"
          :key="l.num"
          class="track"
          @click="emit('open', l)"
        >
          <div class="track__org">
            <div
              class="track__kind"
              :style="{
                background: `oklch(94% 0.05 ${l.kindMeta.hue})`,
                color: `oklch(35% 0.12 ${l.kindMeta.hue})`,
              }"
            >
              {{ l.kindMeta.short }}
            </div>
            <div class="track__org-text">
              <div class="track__org-name">{{ l.org }}</div>
              <div class="track__org-num mono">{{ l.num }}</div>
            </div>
          </div>
          <div class="track__kind-label">{{ l.kindMeta.label.split(' ')[0] }}</div>
          <div class="track__lane">
            <div
              v-for="(t, i) in yearTicks"
              :key="i"
              class="track__grid"
              :style="{ left: `${pct(t)}%` }"
              v-show="pct(t) >= 0 && pct(t) <= 100"
            />
            <div class="track__today" :style="{ left: `${todayPct()}%` }" />
            <div
              class="track__bar"
              :style="{
                left: `${barFor(l).left}%`,
                width: `${barFor(l).width}%`,
                background: barFor(l).bg,
                boxShadow: `0 2px 8px -2px ${barFor(l).color}66`,
              }"
            >
              <span class="track__bar-date mono">{{ fmt(l.issued) }}</span>
              <span class="track__bar-date mono">{{ fmt(l.expires) }}</span>
            </div>
            <div
              class="track__days"
              :style="{
                left: `${Math.min(barFor(l).right, 98)}%`,
                transform: barFor(l).right > 90 ? 'translateX(-100%)' : 'translateX(4px)',
                color: barFor(l).color,
              }"
            >
              <template v-if="barFor(l).isDanger">истекла {{ Math.abs(l.status.days) }} дн. назад</template>
              <template v-else>{{ l.status.days }} дн.</template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.timeline {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.timeline__stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
.timeline__panel {
  background: #fff;
  border: 1px solid var(--lr-line);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.timeline__card {
  background: #fff;
  border: 1px solid var(--lr-line);
  border-radius: 16px;
  overflow: hidden;
}
.timeline__header {
  padding: 16px 24px;
  border-bottom: 1px solid var(--lr-line);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.timeline__title {
  font-size: 15px;
  font-weight: 600;
}
.timeline__subtitle {
  font-size: 12px;
  color: var(--lr-ink-3);
  margin-top: 2px;
}
.legend {
  display: flex;
  gap: 14px;
  align-items: center;
  font-size: 11px;
  color: var(--lr-ink-3);
}
.legend__item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.legend__swatch {
  width: 22px;
  height: 8px;
  border-radius: 3px;
}
.timeline__cols-head {
  display: grid;
  grid-template-columns: 300px 120px 1fr;
  align-items: center;
  padding: 10px 24px;
  font-size: 11px;
  color: var(--lr-ink-4);
  font-weight: 600;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  border-bottom: 1px solid var(--lr-line);
}
.timeline__ticks {
  position: relative;
  height: 20px;
}
.timeline__tick-label {
  position: absolute;
  top: 0;
  transform: translateX(-50%);
  font-size: 11px;
  color: var(--lr-ink-3);
  font-weight: 500;
}
.timeline__today-label {
  position: absolute;
  top: 0;
  transform: translateX(-50%);
  background: var(--lr-brand);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
}
.timeline__tracks {
  padding: 8px 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.track {
  display: grid;
  grid-template-columns: 300px 120px 1fr;
  align-items: center;
  padding: 12px 0;
  border-top: 1px solid var(--lr-line-2);
  cursor: pointer;
}
.track__org {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-right: 16px;
}
.track__kind {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: grid;
  place-items: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}
.track__org-text {
  min-width: 0;
}
.track__org-name {
  font-size: 13.5px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.track__org-num {
  font-size: 11px;
  color: var(--lr-ink-4);
  margin-top: 1px;
}
.track__kind-label {
  font-size: 11px;
  color: var(--lr-ink-3);
}
.track__lane {
  position: relative;
  height: 36px;
}
.track__grid {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;
  background: var(--lr-line-2);
}
.track__today {
  position: absolute;
  top: -2px;
  bottom: -2px;
  width: 2px;
  background: var(--lr-brand);
  opacity: 0.35;
  border-radius: 1px;
}
.track__bar {
  position: absolute;
  top: 8px;
  height: 20px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
  color: #fff;
  font-size: 11px;
  font-weight: 600;
}
.track__bar-date {
  font-size: 10px;
  opacity: 0.9;
}
.track__days {
  position: absolute;
  top: 32px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}
.mono {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
}
@media (max-width: 900px) {
  .timeline__stats {
    grid-template-columns: 1fr 1fr;
  }
  .timeline__cols-head,
  .track {
    grid-template-columns: 180px 80px 1fr;
  }
}
</style>
