<script setup lang="ts">
import { computed, ref } from 'vue'
import { fmt, ruPlural, computeRegionStats, computeKindStats, type LicenseUI, type StatusKey, type KindId } from './registry'
import StatCard from './StatCard.vue'
import MiniIcon from './MiniIcon.vue'
import BigStat from './BigStat.vue'
import SearchBar from './SearchBar.vue'
import FilterChips from './FilterChips.vue'
import KindBadge from './KindBadge.vue'
import ExpiryMeter from './ExpiryMeter.vue'
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

type SortCol = 'num' | 'org' | 'issued' | 'expires' | 'status'
const sortBy = ref<{ col: SortCol; dir: 'asc' | 'desc' }>({ col: 'issued', dir: 'desc' })
const expanded = ref<string | null>(null)

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

const regionStats = computed(() => computeRegionStats(props.data))
const totalRegionCount = computed(() => regionStats.value.reduce((s, r) => s + r.count, 0))
const kindStats = computed(() => computeKindStats(props.data))

const sorted = computed(() => {
  const arr = [...filtered.value]
  const { col, dir } = sortBy.value
  arr.sort((a, b) => {
    let va: number | string
    let vb: number | string
    if (col === 'num') {
      va = a.num
      vb = b.num
    } else if (col === 'org') {
      va = a.org
      vb = b.org
    } else if (col === 'issued') {
      va = a.issued.getTime()
      vb = b.issued.getTime()
    } else if (col === 'expires') {
      va = a.expires.getTime()
      vb = b.expires.getTime()
    } else {
      va = a.status.days
      vb = b.status.days
    }
    return (va < vb ? -1 : va > vb ? 1 : 0) * (dir === 'asc' ? 1 : -1)
  })
  return arr
})

function sort(col: SortCol) {
  if (sortBy.value.col === col) {
    sortBy.value = { col, dir: sortBy.value.dir === 'asc' ? 'desc' : 'asc' }
  } else {
    sortBy.value = { col, dir: 'asc' }
  }
}

function isSorted(col: SortCol) {
  return sortBy.value.col === col
}

function toggleExpand(num: string) {
  expanded.value = expanded.value === num ? null : num
}

function barColor(lic: LicenseUI) {
  const k = lic.status.key
  return k === 'active' ? 'var(--lr-brand)' : k === 'expiring' ? 'var(--lr-amber)' : 'var(--lr-rose)'
}

const hasFilters = computed(
  () => props.query || props.filters.status !== 'all' || props.filters.kinds.length > 0 || props.filters.region !== ''
)
</script>

<template>
  <div class="dashboard">
    <!-- Stats row -->
    <div class="dashboard__stats">
      <BigStat :data="data" :total="counts.all" :today="today" />
      <StatCard
        kind="success"
        label="Действующие"
        :value="counts.active"
        :sub="`из ${counts.all}`"
        hint="все виды деятельности"
        :active="filters.status === 'active'"
        @click="$emit('setStatus', 'active')"
      >
        <template #icon><MiniIcon /></template>
      </StatCard>
      <StatCard
        kind="warn"
        label="Истекают в ближ. 90 дней"
        :value="counts.expiring"
        :sub="counts.expiring ? 'требуют продления' : 'в норме'"
        hint="напоминание отправлено"
        :active="filters.status === 'expiring'"
        @click="$emit('setStatus', 'expiring')"
      >
        <template #icon><MiniIcon warn /></template>
      </StatCard>
      <StatCard
        kind="muted"
        label="Истёкшие · отозваны"
        :value="counts.expired"
        sub="за 12 мес."
        hint="архив открытых данных"
        :active="filters.status === 'expired'"
        @click="$emit('setStatus', 'expired')"
      >
        <template #icon><MiniIcon danger /></template>
      </StatCard>
    </div>

    <!-- Search + filters (объединено: вид деятельности + регион в одном ряду) -->
    <div class="dashboard__panel">
      <SearchBar :model-value="query" @update:model-value="$emit('update:query', $event)" :results="filtered.length" />
      <FilterChips
        :active-kinds="filters.kinds"
        :active-region="filters.region"
        :kind-stats="kindStats"
        :region-stats="regionStats"
        :total-region-count="totalRegionCount"
        @toggle-kind="$emit('toggleKind', $event)"
        @set-region="$emit('setRegion', $event)"
      />
    </div>

    <!-- Summary -->
    <div class="dashboard__summary">
      <div class="dashboard__summary-left">
        Найдено <b>{{ sorted.length }}</b>
        {{ ruPlural(sorted.length, ['лицензия', 'лицензии', 'лицензий']) }}
        <button v-if="hasFilters" class="dashboard__reset" @click="$emit('reset')">
          Сбросить фильтры
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="dashboard__table">
      <table>
        <thead>
          <tr>
            <th class="th th--sortable" :class="{ 'th--active': isSorted('num') }" style="width: 148px" @click="sort('num')">
              № лицензии
              <span class="th__arrow" :class="{ 'th__arrow--asc': isSorted('num') && sortBy.dir === 'asc' }">▼</span>
            </th>
            <th class="th th--sortable" :class="{ 'th--active': isSorted('org') }" @click="sort('org')">
              Организация
              <span class="th__arrow" :class="{ 'th__arrow--asc': isSorted('org') && sortBy.dir === 'asc' }">▼</span>
            </th>
            <th class="th">Вид деятельности</th>
            <th class="th th--sortable" :class="{ 'th--active': isSorted('issued') }" style="width: 110px" @click="sort('issued')">
              Выдана
              <span class="th__arrow" :class="{ 'th__arrow--asc': isSorted('issued') && sortBy.dir === 'asc' }">▼</span>
            </th>
            <th class="th th--sortable" :class="{ 'th--active': isSorted('expires') }" style="width: 260px" @click="sort('expires')">
              Срок действия
              <span class="th__arrow" :class="{ 'th__arrow--asc': isSorted('expires') && sortBy.dir === 'asc' }">▼</span>
            </th>
            <th class="th" style="width: 60px"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="sorted.length === 0">
            <td colspan="6">
              <EmptyState :query="query" @clear="$emit('reset')" />
            </td>
          </tr>
          <template v-for="l in sorted" :key="l.num">
            <tr
              class="row"
              :class="{ 'row--open': expanded === l.num }"
              @click="toggleExpand(l.num)"
            >
              <td class="td">
                <div class="row__num">
                  <span class="row__pill" :style="{ background: barColor(l) }" />
                  <span class="mono row__num-text">{{ l.num }}</span>
                </div>
              </td>
              <td class="td">
                <div class="row__org">{{ l.org }}</div>
                <div class="row__org-meta mono">ИНН {{ l.inn }} · {{ l.region }}</div>
              </td>
              <td class="td">
                <KindBadge :kind="l.kind" />
              </td>
              <td class="td td--muted mono">{{ fmt(l.issued) }}</td>
              <td class="td">
                <ExpiryMeter :lic="l" :today="today" compact />
              </td>
              <td class="td td--right">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  class="row__chevron"
                  :class="{ 'row__chevron--open': expanded === l.num }"
                >
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </td>
            </tr>
            <tr v-if="expanded === l.num" class="row--expanded">
              <td colspan="6">
                <div class="expanded">
                  <div>
                    <div class="section-title">Адрес</div>
                    <div class="expanded__text">{{ l.address }}</div>
                    <div v-if="l.issuedByName" class="expanded__sub">Выдал: {{ l.issuedByName }}</div>
                  </div>
                  <div>
                    <div class="section-title">Регион</div>
                    <div class="expanded__text">{{ l.region }}</div>
                  </div>
                  <div>
                    <div class="section-title">Действует до</div>
                    <div class="mono expanded__expires">{{ fmt(l.expires) }}</div>
                    <div class="expanded__sub">
                      <template v-if="l.status.key === 'expired'">истекла {{ Math.abs(l.status.days) }} дн. назад</template>
                      <template v-else>осталось {{ l.status.days }} дн.</template>
                    </div>
                  </div>
                  <div class="expanded__actions">
                    <button class="btn-primary" @click.stop="emit('open', l)">
                      Подробнее
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                        <path d="M5 12h14M13 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <div class="dashboard__footer">
      <span>Источник: Министерство природных ресурсов, экологии и технического надзора КР. Закон КР № 195 от 19.10.2023.</span>
      <span>API: <span class="mono dashboard__footer-api">GET /api/v1/public/licenses</span></span>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.dashboard__stats {
  display: grid;
  grid-template-columns: 1.2fr 1fr 1fr 1fr;
  gap: 16px;
}
.dashboard__panel {
  background: #fff;
  border: 1px solid var(--lr-line);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-shadow: 0 1px 2px rgba(12, 23, 19, 0.03);
}
.dashboard__regions {
  background: #fff;
  border: 1px solid var(--lr-line);
  border-radius: 16px;
  padding: 16px 18px;
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  box-shadow: 0 1px 2px rgba(12, 23, 19, 0.03);
}
.dashboard__regions-head {
  display: flex;
  align-items: baseline;
  gap: 10px;
  flex-wrap: wrap;
  flex: 1;
  min-width: 0;
}
.dashboard__regions-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--lr-ink);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.dashboard__regions-sub {
  font-size: 12px;
  color: var(--lr-ink-3);
}
.dashboard__regions-select {
  min-width: 240px;
  padding: 9px 36px 9px 14px;
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
.dashboard__regions-select:hover {
  border-color: var(--lr-brand);
}
.dashboard__regions-select:focus {
  outline: none;
  border-color: var(--lr-brand);
  box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.15);
}
.dashboard__regions-select option:disabled {
  color: #cbd5e1;
}
.dashboard__summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
}
.dashboard__summary-left {
  font-size: 13px;
  color: var(--lr-ink-3);
}
.dashboard__summary-left b {
  color: var(--lr-ink);
}
.dashboard__reset {
  margin-left: 12px;
  font-size: 12px;
  border: none;
  background: transparent;
  color: var(--lr-brand);
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
}
.dashboard__table {
  background: #fff;
  border-radius: 16px;
  border: 1px solid var(--lr-line);
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(12, 23, 19, 0.03);
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
thead tr {
  background: #fafbfa;
  border-bottom: 1px solid var(--lr-line);
}
.th {
  padding: 12px 18px;
  text-align: left;
  font-size: 11px;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  font-weight: 600;
  color: var(--lr-ink-3);
  user-select: none;
}
.th--sortable {
  cursor: pointer;
}
.th--active {
  color: var(--lr-ink);
}
.th__arrow {
  opacity: 0.3;
  font-size: 10px;
  margin-left: 4px;
  display: inline-block;
}
.th--active .th__arrow {
  opacity: 1;
}
.th__arrow--asc {
  transform: rotate(180deg);
}
.row {
  border-bottom: 1px solid var(--lr-line-2);
  cursor: pointer;
  background: #fff;
}
.row:hover {
  background: #fafbfa;
}
.row--open {
  background: var(--lr-brand-025) !important;
}
.td {
  padding: 14px 18px;
  vertical-align: middle;
}
.td--muted {
  color: var(--lr-ink-3);
}
.td--right {
  text-align: right;
}
.row__num {
  display: flex;
  align-items: center;
  gap: 10px;
}
.row__pill {
  width: 4px;
  height: 32px;
  border-radius: 2px;
}
.row__num-text {
  font-weight: 600;
  font-size: 13px;
}
.row__org {
  font-weight: 600;
}
.row__org-meta {
  font-size: 11px;
  color: var(--lr-ink-4);
  margin-top: 2px;
}
.row__chevron {
  color: var(--lr-ink-4);
  transition: transform 0.15s;
}
.row__chevron--open {
  transform: rotate(90deg);
}
.row--expanded {
  background: var(--lr-brand-025);
}
.row--expanded > td {
  padding: 4px 24px 24px;
}
.expanded {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto;
  gap: 24px;
  padding: 16px 20px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #cfe8db;
  align-items: flex-start;
}
.expanded__text {
  font-size: 13px;
  line-height: 1.55;
}
.expanded__sub {
  font-size: 12px;
  color: var(--lr-ink-3);
  margin-top: 4px;
}
.expanded__expires {
  font-size: 18px;
  font-weight: 600;
}
.expanded__actions {
  display: flex;
  align-items: center;
  align-self: center;
}
.section-title {
  font-size: 11px;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: var(--lr-ink-4);
  font-weight: 600;
  margin-bottom: 10px;
}
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 999px;
  border: none;
  background: var(--lr-brand);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  box-shadow: 0 4px 12px -3px rgba(14, 140, 90, 0.4);
  cursor: pointer;
  font-family: inherit;
}
.dashboard__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 4px;
  font-size: 12px;
  color: var(--lr-ink-4);
}
.dashboard__footer-api {
  color: var(--lr-ink-2);
}
.mono {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
}
@media (max-width: 900px) {
  .dashboard__stats {
    grid-template-columns: 1fr 1fr;
  }
  .expanded {
    grid-template-columns: 1fr;
  }
}
</style>
