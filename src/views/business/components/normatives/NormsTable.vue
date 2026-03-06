<script setup lang="ts">
defineProps<{
  norms: { id: number; category: string; rates: Record<number, number> }[]
  years: number[]
  currentYear: number
}>()

const getRateColorClass = (rate: number) => {
  if (rate >= 60) return 'text-red-600'
  if (rate >= 30) return 'text-orange-600'
  return 'text-green-600'
}
</script>

<template>
  <div class="nt-card">
    <div class="nt-card-header">
      <h3 class="nt-section-title">{{ $t('businessNorms.normsTableTitle') }}</h3>
      <p class="nt-description">{{ $t('businessNorms.normsTableDesc') }}</p>
    </div>
    <div class="overflow-x-auto">
      <table class="nt-table">
        <thead>
          <tr class="nt-thead-row">
            <th class="nt-th nt-th--center nt-th--narrow">№</th>
            <th class="nt-th nt-th--left">{{ $t('businessNorms.productCategory') }}</th>
            <th
              v-for="year in years"
              :key="year"
              class="nt-th nt-th--center"
              :class="{ 'nt-year-current': year === currentYear }"
            >
              {{ year }}
              <span v-if="year === currentYear" class="nt-year-label">{{ $t('businessNorms.current') }}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, index) in norms"
            :key="item.id"
            class="nt-row"
            :class="{ 'nt-row--striped': index % 2 !== 0 }"
          >
            <td class="nt-cell nt-cell--id">{{ item.id }}</td>
            <td class="nt-cell nt-cell--category">{{ item.category }}</td>
            <td
              v-for="year in years"
              :key="year"
              class="nt-cell nt-cell--rate"
              :class="{ 'nt-cell--current': year === currentYear }"
            >
              <span :class="getRateColorClass(item.rates[year])" class="nt-rate-value">
                {{ item.rates[year] }}%
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.nt-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  border: 1px solid #e5e7eb;
  overflow: hidden;
}
.nt-card-header {
  padding: 16px 24px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}
.nt-section-title {
  font-size: 26px;
  font-weight: 600;
  color: #111827;
}
.nt-description {
  font-size: 20px;
  color: #6b7280;
  margin-top: 4px;
}
.nt-table {
  width: 100%;
  min-width: 700px;
}
.nt-thead-row {
  background-color: #0e888d;
  color: #fff;
}
.nt-th {
  font-size: 21px;
  padding: 12px 16px;
  font-weight: 600;
}
.nt-th--center {
  text-align: center;
}
.nt-th--left {
  text-align: left;
}
.nt-th--narrow {
  width: 48px;
}
.nt-year-current {
  background-color: #0b6d71;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.5);
}
.nt-year-label {
  display: block;
  font-size: 19px;
  font-weight: 400;
  opacity: 0.8;
}
.nt-row {
  background: #fff;
  transition: background-color 0.15s;
}
.nt-row--striped {
  background: #f9fafb;
}
.nt-row:hover {
  background-color: rgba(14, 136, 141, 0.05);
}
.nt-cell {
  font-size: 21px;
  padding: 12px 16px;
}
.nt-cell--id {
  text-align: center;
  color: #6b7280;
  font-family: ui-monospace, monospace;
}
.nt-cell--category {
  font-weight: 500;
  color: #111827;
}
.nt-cell--rate {
  text-align: center;
}
.nt-cell--current {
  background-color: rgba(14, 136, 141, 0.1);
  font-weight: 700;
}
.nt-rate-value {
  font-weight: 600;
}
</style>
