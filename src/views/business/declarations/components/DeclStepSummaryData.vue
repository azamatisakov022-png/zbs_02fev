<script setup lang="ts">
import { AppBadge } from '@/components/ui'
import { isPackagingGroup, getSubgroupData } from '@/data/product-groups'

defineProps<{
  reportingYear: string
  yearCalculations: any[]
  aggregatedItems: {
    group: string
    groupLabel: string
    subgroup: string
    subgroupLabel: string
    tnvedCode: string
    mass: number
    rate: number
    amount: number
    paidAmount: number
  }[]
  totalMass: number
  totalAmount: number
  totalPaid: number
  totalDebt: number
  yearReports: any[]
  processedByGroup: Map<string, number>
  totalProcessed: number
  showDetails: boolean
}>()

defineEmits<{
  (e: 'update:showDetails', value: boolean): void
}>()
</script>

<template>
  <div class="p-6 lg:p-8">
    <h2 class="dss-section-title mb-1">{{ $t('businessDecl.summaryTitle', { year: reportingYear }) }}</h2>
    <p class="dss-body-text mb-6">{{ $t('businessDecl.summarySubtitle', { count: yearCalculations.length }) }}</p>

    <div class="overflow-x-auto mb-6">
      <table class="w-full dss-table-text">
        <thead>
          <tr class="text-left dss-text-dark dss-thead-bg">
            <th class="px-3 py-3 font-semibold">{{ $t('businessDecl.thProductGroup') }}</th>
            <th class="px-3 py-3 font-semibold">{{ $t('businessDecl.thSubgroup') }}</th>
            <th class="px-3 py-3 font-semibold">{{ $t('businessDecl.thGskpCode') }}</th>
            <th class="px-3 py-3 font-semibold">{{ $t('businessDecl.thTnvedCode') }}</th>
            <th class="px-3 py-3 font-semibold">{{ $t('businessDecl.thName') }}</th>
            <th class="px-3 py-3 font-semibold text-right">{{ $t('businessDecl.thMassTon') }}</th>
            <th class="px-3 py-3 font-semibold text-right">{{ $t('businessDecl.thRateSom') }}</th>
            <th class="px-3 py-3 font-semibold text-right">{{ $t('businessDecl.thAmountSom') }}</th>
            <th class="px-3 py-3 font-semibold text-right">{{ $t('businessDecl.thPaidSom') }}</th>
            <th class="px-3 py-3 font-semibold text-right">{{ $t('businessDecl.thRemainderSom') }}</th>
          </tr>
        </thead>
        <tbody class="dss-text-dark">
          <tr v-for="item in aggregatedItems" :key="item.group + item.subgroup" class="dss-row-border">
            <td class="px-3 py-3 dss-cell-text">{{ item.groupLabel }}</td>
            <td class="px-3 py-3 dss-cell-text">{{ item.subgroupLabel }}</td>
            <template v-if="!isPackagingGroup(item.group)">
              <td class="px-3 py-3 font-mono dss-cell-text">{{ getSubgroupData(item.group, item.subgroup)?.gskpCode || '—' }}</td>
              <td class="px-3 py-3 font-mono dss-cell-text">{{ getSubgroupData(item.group, item.subgroup)?.tnvedCode || item.tnvedCode }}</td>
              <td class="px-3 py-3 dss-cell-text">{{ getSubgroupData(item.group, item.subgroup)?.tnvedName || '—' }}</td>
            </template>
            <template v-else>
              <td class="px-3 py-3 dss-cell-text">{{ getSubgroupData(item.group, item.subgroup)?.packagingMaterial || '—' }}</td>
              <td class="px-3 py-3 font-mono dss-cell-text">{{ getSubgroupData(item.group, item.subgroup)?.packagingLetterCode || '—' }}</td>
              <td class="px-3 py-3 font-mono dss-cell-text">{{ getSubgroupData(item.group, item.subgroup)?.packagingDigitalCode || '—' }}</td>
            </template>
            <td class="px-3 py-3 text-right font-medium">{{ item.mass.toFixed(1) }}</td>
            <td class="px-3 py-3 text-right">{{ item.rate.toLocaleString() }}</td>
            <td class="px-3 py-3 text-right font-medium">{{ item.amount.toLocaleString() }}</td>
            <td class="px-3 py-3 text-right text-green-600">{{ item.paidAmount.toLocaleString() }}</td>
            <td class="px-3 py-3 text-right" :class="item.amount - item.paidAmount > 0 ? 'text-red-600 font-medium' : 'dss-text-dark'">
              {{ (item.amount - item.paidAmount).toLocaleString() }}
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="dss-tfoot-row font-semibold dss-thead-bg">
            <td colspan="5" class="px-3 py-3">{{ $t('businessDecl.totalRow') }}</td>
            <td class="px-3 py-3 text-right">{{ totalMass.toFixed(1) }}</td>
            <td class="px-3 py-3"></td>
            <td class="px-3 py-3 text-right">{{ totalAmount.toLocaleString() }}</td>
            <td class="px-3 py-3 text-right text-green-600">{{ totalPaid.toLocaleString() }}</td>
            <td class="px-3 py-3 text-right" :class="totalDebt > 0 ? 'text-red-600' : 'dss-text-dark'">{{ totalDebt.toLocaleString() }}</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <div class="dss-accordion mb-6">
      <button
        @click="$emit('update:showDetails', !showDetails)"
        class="w-full flex items-center justify-between px-4 py-3 dss-accordion-btn"
      >
        <span class="dss-subsection-title">{{ $t('businessDecl.detailsAccordion', { count: yearCalculations.length }) }}</span>
        <svg :class="['w-5 h-5 dss-text-dark transition-transform', showDetails ? 'rotate-180' : '']" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div v-if="showDetails" class="p-4">
        <table class="w-full dss-table-text">
          <thead>
            <tr class="text-left dss-text-dark">
              <th class="pb-2 font-semibold">{{ $t('businessDecl.thCalcNumber') }}</th>
              <th class="pb-2 font-semibold">{{ $t('businessDecl.thPeriod') }}</th>
              <th class="pb-2 font-semibold">{{ $t('businessDecl.thDate') }}</th>
              <th class="pb-2 font-semibold text-right">{{ $t('businessDecl.thAmountSom') }}</th>
              <th class="pb-2 font-semibold">{{ $t('businessDecl.thPaymentStatus') }}</th>
            </tr>
          </thead>
          <tbody class="dss-text-dark">
            <tr v-for="calc in yearCalculations" :key="calc.id" class="dss-row-border">
              <td class="py-2 font-mono dss-calc-number font-medium">{{ calc.number }}</td>
              <td class="py-2">{{ calc.period }}</td>
              <td class="py-2">{{ calc.date }}</td>
              <td class="py-2 text-right font-medium">{{ calc.totalAmount.toLocaleString() }}</td>
              <td class="py-2">
                <AppBadge :variant="calc.status === 'paid' ? 'success' : 'warning'">
                  {{ calc.status === 'paid' ? $t('status.paid') : $t('businessDecl.notPaid') }}
                </AppBadge>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border border-green-200">
        <p class="dss-card-label text-green-700 mb-1">{{ $t('businessDecl.cardTotalMass') }}</p>
        <p class="dss-card-value text-green-800">{{ totalMass.toFixed(1) }} {{ $t('businessDecl.tShort') }}</p>
      </div>
      <div class="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-5 border border-orange-200">
        <p class="dss-card-label text-orange-700 mb-1">{{ $t('businessDecl.cardCharged') }}</p>
        <p class="dss-card-value text-orange-800">{{ totalAmount.toLocaleString() }} {{ $t('businessDecl.som') }}</p>
      </div>
      <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
        <p class="dss-card-label text-blue-700 mb-1">{{ $t('businessDecl.cardPaid') }}</p>
        <p class="dss-card-value text-blue-800">{{ totalPaid.toLocaleString() }} {{ $t('businessDecl.som') }}</p>
        <p v-if="totalDebt > 0" class="dss-card-label text-red-600 mt-1">{{ $t('businessDecl.debtLabel', { amount: totalDebt.toLocaleString() }) }}</p>
      </div>
    </div>

    <div v-if="yearReports.length > 0" class="bg-green-50 border border-green-200 rounded-xl p-5 mt-6">
      <div class="flex items-center gap-2 mb-4">
        <svg class="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <h3 class="dss-card-label text-green-800">{{ $t('businessDecl.recyclingDataTitle', { count: yearReports.length }) }}</h3>
      </div>
      <div class="space-y-2">
        <div v-for="item in aggregatedItems" :key="'proc_' + item.group + item.subgroup" class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 dss-table-text py-1 border-b border-green-200 last:border-0">
          <span class="text-green-900 font-medium">{{ item.groupLabel }}</span>
          <div class="flex items-center gap-4 dss-recycling-detail">
            <span class="dss-text-dark">{{ $t('businessDecl.declaredShort', { mass: item.mass.toFixed(1) }) }}</span>
            <span class="text-green-700 font-medium">{{ $t('businessDecl.processedShort', { mass: (processedByGroup.get(item.group) || 0).toFixed(1) }) }}</span>
            <span :class="[(processedByGroup.get(item.group) || 0) >= item.mass ? 'text-green-600' : 'text-orange-600', 'font-medium']">
              {{ item.mass > 0 ? (((processedByGroup.get(item.group) || 0) / item.mass) * 100).toFixed(0) : 0 }}%
            </span>
          </div>
        </div>
      </div>
      <div class="mt-3 pt-3 border-t border-green-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 font-medium">
        <span class="text-green-900">{{ $t('businessDecl.totalProcessed') }}</span>
        <span class="text-green-700">{{ $t('businessDecl.totalProcessedValue', { processed: totalProcessed.toFixed(1), total: totalMass.toFixed(1), percent: totalMass > 0 ? ((totalProcessed / totalMass) * 100).toFixed(1) : 0 }) }}</span>
      </div>
    </div>

    <div v-else class="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mt-6 flex items-start gap-3">
      <svg class="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="dss-body-text-medium text-yellow-800">{{ $t('businessDecl.noRecyclingReports', { year: reportingYear }) }}</p>
    </div>
  </div>
</template>

<style scoped>
.dss-section-title {
  font-size: 27px;
  font-weight: 600;
  color: #1e293b;
}
.dss-body-text {
  font-size: 17px;
  font-weight: 500;
  color: #1e293b;
}
.dss-body-text-medium {
  font-size: 17px;
  font-weight: 500;
}
.dss-table-text {
  font-size: 16px;
}
.dss-cell-text {
  font-size: 14px;
}
.dss-text-dark {
  color: #1e293b;
}
.dss-thead-bg {
  background-color: #f8fafc;
}
.dss-row-border {
  border-top: 1px solid #e2e8f0;
}
.dss-tfoot-row {
  border-top-width: 2px;
  border-top-style: solid;
  border-top-color: #1e293b;
}
.dss-accordion {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
}
.dss-accordion-btn {
  background-color: #f8fafc;
  transition: background-color 0.15s;
}
.dss-accordion-btn:hover {
  background-color: #f1f5f9;
}
.dss-subsection-title {
  font-size: 17px;
  font-weight: 600;
  color: #1e293b;
}
.dss-calc-number {
  color: #2563eb;
}
.dss-card-label {
  font-size: 17px;
  font-weight: 600;
}
.dss-card-value {
  font-size: 24px;
  font-weight: 700;
}
.dss-recycling-detail {
  font-size: 14px;
}
@media (min-width: 640px) {
  .dss-recycling-detail {
    font-size: 16px;
  }
}
</style>
