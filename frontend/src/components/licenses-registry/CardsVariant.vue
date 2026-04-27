<script setup lang="ts">
import { computed } from 'vue'
import { fmt, type LicenseUI, type StatusKey, type KindId } from './registry'
import StatCard from './StatCard.vue'
import MiniIcon from './MiniIcon.vue'
import SearchBar from './SearchBar.vue'
import FilterChips from './FilterChips.vue'
import StatusBadge from './StatusBadge.vue'
import ExpiryRing from './ExpiryRing.vue'
import EmptyState from './EmptyState.vue'
import KindPattern from './KindPattern.vue'

const props = defineProps<{
  data: LicenseUI[]
  query: string
  filters: { status: StatusKey | 'all'; kinds: KindId[]; regions: string[] }
  counts: { all: number; active: number; expiring: number; expired: number }
  today: Date
}>()

defineEmits<{
  (e: 'update:query', v: string): void
  (e: 'open', lic: LicenseUI): void
  (e: 'setStatus', s: StatusKey | 'all'): void
  (e: 'toggleKind', k: KindId): void
  (e: 'toggleRegion', r: string): void
  (e: 'reset'): void
}>()

const filtered = computed(() => {
  const q = props.query.trim().toLowerCase()
  return props.data.filter(l => {
    if (q && !`${l.num} ${l.inn} ${l.org}`.toLowerCase().includes(q)) return false
    if (props.filters.status !== 'all' && l.status.key !== props.filters.status) return false
    if (props.filters.kinds.length && !l.kinds.some(k => props.filters.kinds.includes(k))) return false
    if (props.filters.regions.length && !props.filters.regions.includes(l.region)) return false
    return true
  })
})
</script>

<template>
  <div class="cards">
    <div class="cards__stats">
      <StatCard
        kind="neutral"
        label="Всего"
        :value="counts.all"
        hint="актуальных записей"
        :active="filters.status === 'all'"
        @click="$emit('setStatus', 'all')"
      >
        <template #icon><MiniIcon /></template>
      </StatCard>
      <StatCard
        kind="success"
        label="Действующих"
        :value="counts.active"
        :sub="counts.all ? `${Math.round((counts.active / counts.all) * 100)}%` : '0%'"
        hint="от общего числа"
        :active="filters.status === 'active'"
        @click="$emit('setStatus', 'active')"
      >
        <template #icon><MiniIcon /></template>
      </StatCard>
      <StatCard
        kind="warn"
        label="Истекают"
        :value="counts.expiring"
        sub="в 90 дней"
        hint="уведомления отправлены"
        :active="filters.status === 'expiring'"
        @click="$emit('setStatus', 'expiring')"
      >
        <template #icon><MiniIcon warn /></template>
      </StatCard>
      <StatCard
        kind="muted"
        label="Истёкшие"
        :value="counts.expired"
        hint="за последний год"
        :active="filters.status === 'expired'"
        @click="$emit('setStatus', 'expired')"
      >
        <template #icon><MiniIcon danger /></template>
      </StatCard>
    </div>

    <div class="cards__panel">
      <SearchBar :model-value="query" @update:model-value="$emit('update:query', $event)" :results="filtered.length" />
      <FilterChips
        :active-kinds="filters.kinds"
        :active-status="filters.status"
        :counts="counts"
        @toggle-kind="$emit('toggleKind', $event)"
        @set-status="$emit('setStatus', $event)"
      />
    </div>

    <div v-if="filtered.length === 0" class="cards__empty">
      <EmptyState :query="query" @clear="$emit('reset')" />
    </div>
    <div v-else class="cards__grid">
      <article
        v-for="l in filtered"
        :key="l.num"
        class="card"
        @click="emit('open', l)"
      >
        <div
          class="card__art"
          :style="{
            background: `linear-gradient(135deg, oklch(58% 0.14 ${l.kindMeta.hue}), oklch(40% 0.14 ${l.kindMeta.hue}))`,
          }"
        >
          <KindPattern :hue="l.kindMeta.hue" :shape="l.kind" />
          <div class="card__art-overlay">
            <div>
              <div class="card__num mono">{{ l.num }}</div>
              <div class="card__kind-label">{{ l.kindMeta.label }}</div>
            </div>
            <StatusBadge :status="l.status" compact />
          </div>
        </div>

        <div class="card__body">
          <div>
            <div class="card__org">{{ l.org }}</div>
            <div class="card__inn mono">ИНН {{ l.inn }}</div>
          </div>
          <div class="card__meta">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 21s-7-6-7-12a7 7 0 1114 0c0 6-7 12-7 12z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
            {{ l.region }}
          </div>
        </div>

        <div class="card__footer">
          <ExpiryRing :lic="l" :today="today" :size="64" />
          <div class="card__metrics">
            <div>
              <div class="metric__label">Выдана</div>
              <div class="metric__value mono">{{ fmt(l.issued) }}</div>
            </div>
            <div>
              <div class="metric__label">Действует до</div>
              <div class="metric__value mono">{{ fmt(l.expires) }}</div>
            </div>
            <div>
              <div class="metric__label">Статус</div>
              <div class="metric__value">{{ l.status.label }}</div>
            </div>
            <div v-if="l.issuedByName">
              <div class="metric__label">Выдал</div>
              <div class="metric__value metric__value--small">{{ l.issuedByName }}</div>
            </div>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<style scoped>
.cards {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.cards__stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
.cards__panel {
  background: #fff;
  border: 1px solid var(--lr-line);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.cards__empty {
  background: #fff;
  border: 1px solid var(--lr-line);
  border-radius: 16px;
}
.cards__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.card {
  background: #fff;
  border: 1px solid var(--lr-line);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 2px rgba(12, 23, 19, 0.03);
  transition: box-shadow 0.15s ease, transform 0.15s ease;
}
.card:hover {
  box-shadow: 0 12px 32px -16px rgba(12, 23, 19, 0.18);
  transform: translateY(-2px);
}
.card__art {
  position: relative;
  height: 120px;
  overflow: hidden;
}
.card__art-overlay {
  position: absolute;
  inset: 0;
  padding: 16px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}
.card__num {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.75);
  font-weight: 600;
  letter-spacing: 0.4px;
}
.card__kind-label {
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  margin-top: 4px;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}
.card__body {
  padding: 16px 18px 4px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.card__org {
  font-size: 16px;
  font-weight: 600;
  line-height: 1.3;
}
.card__inn {
  font-size: 11px;
  color: var(--lr-ink-4);
  margin-top: 4px;
}
.card__meta {
  display: flex;
  gap: 6px;
  align-items: center;
  font-size: 12px;
  color: var(--lr-ink-3);
}
.card__footer {
  padding: 12px 18px 16px;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 16px;
  align-items: center;
  border-top: 1px dashed var(--lr-line);
  margin-top: 8px;
}
.card__metrics {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px 12px;
}
.metric__label {
  font-size: 10px;
  color: var(--lr-ink-4);
  letter-spacing: 0.3px;
  text-transform: uppercase;
  font-weight: 600;
}
.metric__value {
  font-size: 12.5px;
  font-weight: 500;
  color: var(--lr-ink);
  margin-top: 1px;
}
.metric__value--small {
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.mono {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
}

@media (max-width: 1100px) {
  .cards__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 700px) {
  .cards__stats {
    grid-template-columns: 1fr 1fr;
  }
  .cards__grid {
    grid-template-columns: 1fr;
  }
}
</style>
