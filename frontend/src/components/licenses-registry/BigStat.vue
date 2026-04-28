<script setup lang="ts">
import { computed } from 'vue'
import { monthLabel, type LicenseUI } from './registry'

const props = defineProps<{ data: LicenseUI[]; total: number; today?: Date }>()

const today = computed(() => props.today || new Date())

const months = computed(() => {
  const start = new Date(today.value.getFullYear(), today.value.getMonth() - 2, 1)
  const list: { date: Date; count: number }[] = []
  for (let i = 0; i < 12; i++) {
    list.push({ date: new Date(start.getFullYear(), start.getMonth() + i, 1), count: 0 })
  }
  for (const l of props.data) {
    const e = l.expires
    for (const m of list) {
      const next = new Date(m.date.getFullYear(), m.date.getMonth() + 1, 1)
      if (e >= m.date && e < next) m.count++
    }
  }
  return list
})

const max = computed(() => Math.max(1, ...months.value.map(m => m.count)))
const currentIdx = computed(() =>
  months.value.findIndex(
    m => m.date.getMonth() === today.value.getMonth() && m.date.getFullYear() === today.value.getFullYear()
  )
)
</script>

<template>
  <div class="big-stat">
    <div class="big-stat__halo" />
    <div class="big-stat__head">
      <div>
        <div class="big-stat__label">Всего лицензий в реестре</div>
        <div class="big-stat__value-row">
          <div class="big-stat__value">{{ total }}</div>
          <div class="big-stat__sub">за 30 дней</div>
        </div>
      </div>
    </div>
    <div class="big-stat__chart">
      <div
        v-for="(m, i) in months"
        :key="i"
        class="big-stat__bar-wrap"
      >
        <div
          class="big-stat__bar"
          :style="{
            height: `${6 + (m.count / max) * 36}px`,
            background: i === currentIdx ? '#FFD992' : 'rgba(255,255,255,.35)',
            boxShadow: i === currentIdx ? '0 0 0 2px rgba(255,217,146,.2)' : 'none',
          }"
        />
        <div class="big-stat__month">{{ monthLabel(m.date) }}</div>
      </div>
    </div>
    <div class="big-stat__legend">
      <span class="big-stat__legend-item">
        <span class="big-stat__legend-dot" />тек. месяц
      </span>
      <span>· истечения по месяцам</span>
    </div>
  </div>
</template>

<style scoped>
.big-stat {
  background: linear-gradient(135deg, #0d9488 0%, #10b981 100%);
  color: #fff;
  border-radius: 14px;
  padding: 20px 22px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-height: 128px;
  position: relative;
  overflow: hidden;
}
.big-stat__halo {
  position: absolute;
  right: -40px;
  top: -40px;
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
}
.big-stat__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
}
.big-stat__label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 600;
  letter-spacing: 0.3px;
}
.big-stat__value-row {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-top: 6px;
}
.big-stat__value {
  font-size: 44px;
  font-weight: 700;
  letter-spacing: -1.4px;
  line-height: 1;
}
.big-stat__sub {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.75);
}
.big-stat__chart {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  height: 44px;
  position: relative;
}
.big-stat__bar-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.big-stat__bar {
  width: 100%;
  border-radius: 3px;
}
.big-stat__month {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.55);
  letter-spacing: 0.3px;
}
.big-stat__legend {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.65);
  display: flex;
  gap: 14px;
  align-items: center;
}
.big-stat__legend-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
.big-stat__legend-dot {
  width: 8px;
  height: 8px;
  background: #ffd992;
  border-radius: 2px;
}
</style>
