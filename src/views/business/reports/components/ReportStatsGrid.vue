<script setup lang="ts">
defineProps<{
  yearNormativeStandard: number
  yearNormativeHigh: number
}>()
</script>

<template>
  <div class="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
    <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
      <p class="text-[16px] text-[#64748b] mb-1">{{ $t('businessReports.normativeRecycling') }}</p>
      <p class="text-[24px] font-bold text-[#1e293b]">{{ yearNormativeStandard }}%</p>
      <p class="text-[14px] text-[#94a3b8] mt-1">{{ $t('businessReports.groups14', { percent: yearNormativeHigh }) }}</p>
    </div>
    <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
      <p class="text-[16px] text-[#64748b] mb-1">{{ $t('businessReports.declaredForYear') }}</p>
      <p class="text-[24px] font-bold text-[#2563eb]">26.0 {{ $t('businessReports.tons') }}</p>
    </div>
    <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
      <p class="text-[16px] text-[#64748b] mb-1">{{ $t('businessReports.recycled') }}</p>
      <p class="text-[24px] font-bold text-[#10b981]">25.1 {{ $t('businessReports.tons') }}</p>
    </div>
    <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
      <p class="text-[16px] text-[#64748b] mb-1">{{ $t('businessReports.normativeFulfillment') }}</p>
      <p class="text-[24px] font-bold text-[#10b981]">96.5%</p>
    </div>
    <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
      <p class="text-[16px] text-[#64748b] mb-1">{{ $t('businessReports.avgFulfillment') }}</p>
      <p class="text-[24px] font-bold text-[#059669]">96.5%</p>
    </div>
    <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
      <p class="text-[16px] text-[#64748b] mb-1">{{ $t('businessReports.surchargeLabel') }}</p>
      <p class="text-[24px] font-bold text-[#ef4444]">0 {{ $t('businessReports.som') }}</p>
    </div>
  </div>
</template>
