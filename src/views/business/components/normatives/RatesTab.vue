<script setup lang="ts">
interface FeeRateGroup {
  groupLetter: string
  groupTitle: string
  items: {
    id: number
    name: string
    rate: number
    unit: string
    effectiveDate: string
  }[]
}

defineProps<{
  feeRateGroups: FeeRateGroup[]
}>()
</script>

<template>
  <div class="space-y-5">
    <div class="rt-card">
      <div class="rt-card-header">
        <h3 class="rt-section-title">{{ $t('businessNorms.ratesTableTitle') }}</h3>
        <p class="rt-description">{{ $t('businessNorms.ratesTableDesc') }}</p>
      </div>
    </div>

    <div v-for="group in feeRateGroups" :key="group.groupLetter" class="rt-card">
      <div class="rt-group-header">
        <span class="rt-group-badge">{{ group.groupLetter }}</span>
        <span class="rt-group-title">{{ $t('businessNorms.groupLabel') }} {{ group.groupLetter }} — {{ group.groupTitle }}</span>
      </div>
      <div class="overflow-x-auto">
        <table class="rt-table">
          <thead>
            <tr class="rt-thead-row">
              <th class="rt-th rt-th--left">№</th>
              <th class="rt-th rt-th--left">{{ $t('businessNorms.productGroupCol') }}</th>
              <th class="rt-th rt-th--right">{{ $t('businessNorms.rateCol') }}</th>
              <th class="rt-th rt-th--center">{{ $t('businessNorms.unitCol') }}</th>
              <th class="rt-th rt-th--center">{{ $t('businessNorms.effectiveDateCol') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, index) in group.items"
              :key="item.id"
              class="rt-row"
              :class="{ 'rt-row--striped': index % 2 !== 0 }"
            >
              <td class="rt-cell rt-cell--id">{{ item.id }}</td>
              <td class="rt-cell rt-cell--name">{{ item.name }}</td>
              <td class="rt-cell rt-cell--rate">{{ item.rate.toLocaleString() }}</td>
              <td class="rt-cell rt-cell--unit">{{ item.unit }}</td>
              <td class="rt-cell rt-cell--date">{{ item.effectiveDate }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="rt-note">
      <div class="rt-note-icon">
        <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div>
        <p class="rt-note-title">{{ $t('businessNorms.calcProcedure') }}</p>
        <p class="rt-note-text">
          {{ $t('businessNorms.calcFormula') }}
          {{ $t('businessNorms.useCalc1') }} <router-link to="/business/calculator" class="rt-accent-link">{{ $t('businessNorms.feeCalculator') }}</router-link> {{ $t('businessNorms.useCalc2') }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.rt-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  border: 1px solid #e5e7eb;
  overflow: hidden;
}
.rt-card-header {
  padding: 16px 24px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}
.rt-section-title {
  font-size: 26px;
  font-weight: 600;
  color: #111827;
}
.rt-description {
  font-size: 20px;
  color: #6b7280;
  margin-top: 4px;
}
.rt-group-header {
  background-color: #e8f5f5;
  border-bottom: 1px solid #d1e7e8;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.rt-group-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #0e888d;
  color: #fff;
  font-size: 20px;
  font-weight: 700;
}
.rt-group-title {
  font-size: 22px;
  font-weight: 600;
  color: #0e888d;
}
.rt-table {
  width: 100%;
}
.rt-thead-row {
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}
.rt-th {
  font-size: 19px;
  padding: 12px 24px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.rt-th--left { text-align: left; }
.rt-th--right { text-align: right; }
.rt-th--center { text-align: center; }
.rt-row {
  background: #fff;
  transition: background-color 0.15s;
}
.rt-row--striped {
  background: #f9fafb;
}
.rt-row:hover {
  background-color: rgba(14, 136, 141, 0.05);
}
.rt-cell {
  font-size: 21px;
  padding: 12px 24px;
}
.rt-cell--id {
  color: #6b7280;
  font-family: ui-monospace, monospace;
}
.rt-cell--name {
  font-weight: 500;
  color: #111827;
}
.rt-cell--rate {
  font-size: 21px;
  font-weight: 700;
  color: #0e888d;
  text-align: right;
}
.rt-cell--unit {
  color: #6b7280;
  text-align: center;
}
.rt-cell--date {
  color: #6b7280;
  text-align: center;
}
.rt-note {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.rt-note-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #dbeafe;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.rt-note-title {
  font-size: 22px;
  font-weight: 500;
  color: #111827;
}
.rt-note-text {
  font-size: 21px;
  color: #4b5563;
  margin-top: 4px;
}
.rt-accent-link {
  color: #0e888d;
  font-weight: 500;
}
.rt-accent-link:hover {
  text-decoration: underline;
}
</style>
