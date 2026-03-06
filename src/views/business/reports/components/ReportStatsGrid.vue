<script setup lang="ts">
defineProps<{
  yearNormativeStandard: number
  yearNormativeHigh: number
}>()
</script>

<template>
  <div class="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
    <div class="rsg-card bg-white rounded-xl p-4 shadow-sm">
      <p class="rsg-label mb-1">{{ $t('businessReports.normativeRecycling') }}</p>
      <p class="rsg-value rsg-value--dark font-bold">{{ yearNormativeStandard }}%</p>
      <p class="rsg-hint mt-1">{{ $t('businessReports.groups14', { percent: yearNormativeHigh }) }}</p>
    </div>
    <div class="rsg-card bg-white rounded-xl p-4 shadow-sm">
      <p class="rsg-label mb-1">{{ $t('businessReports.declaredForYear') }}</p>
      <p class="rsg-value rsg-value--blue font-bold">26.0 {{ $t('businessReports.tons') }}</p>
    </div>
    <div class="rsg-card bg-white rounded-xl p-4 shadow-sm">
      <p class="rsg-label mb-1">{{ $t('businessReports.recycled') }}</p>
      <p class="rsg-value rsg-value--green font-bold">25.1 {{ $t('businessReports.tons') }}</p>
    </div>
    <div class="rsg-card bg-white rounded-xl p-4 shadow-sm">
      <p class="rsg-label mb-1">{{ $t('businessReports.normativeFulfillment') }}</p>
      <p class="rsg-value rsg-value--green font-bold">96.5%</p>
    </div>
    <div class="rsg-card bg-white rounded-xl p-4 shadow-sm">
      <p class="rsg-label mb-1">{{ $t('businessReports.avgFulfillment') }}</p>
      <p class="rsg-value rsg-value--emerald font-bold">96.5%</p>
    </div>
    <div class="rsg-card bg-white rounded-xl p-4 shadow-sm">
      <p class="rsg-label mb-1">{{ $t('businessReports.surchargeLabel') }}</p>
      <p class="rsg-value rsg-value--red font-bold">0 {{ $t('businessReports.som') }}</p>
    </div>
  </div>
</template>

<style scoped>
.rsg-card {
  border: 1px solid #e2e8f0;
}
.rsg-label {
  font-size: 19px;
  color: #64748b;
  font-weight:600;
}
.rsg-value {
  font-size: 24px;
}
.rsg-value--dark {
  color: #1e293b;
}
.rsg-value--blue {
  color: #2563eb;
}
.rsg-value--green {
  color: #10b981;
}
.rsg-value--emerald {
  color: #059669;
}
.rsg-value--red {
  color: #ef4444;
}
.rsg-hint {
  font-size: 15px;
  color: #575858;
}
</style>
