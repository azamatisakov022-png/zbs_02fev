<script setup lang="ts">
import type { ProcessingItem } from '@/stores/reports'
import type { SelectOption } from '@/types/select'
import type { ProductSubgroup } from '@/data/product-groups'
import ProcessingItemCard from './ProcessingItemCard.vue'

const props = defineProps<{
  processingItems: ProcessingItem[]
  itemSubgroups: Record<number, string>
  recyclerModes: Record<number, string>
  formSubmitted: boolean
  formErrors: Record<string, string>
  totalDeclared: string
  totalProcessed: string
  totalRequiredProcessing: number
  overallFulfillmentPercent: number
  totalSurcharge: number
  weightedNormativePercent: number
  processingPercent: string
  getRecyclerOptionsForItem: (item: ProcessingItem) => SelectOption[]
  getItemNormativePercent: (wasteType: string) => number
  getItemRequiredProcessing: (item: ProcessingItem) => number
  getItemFulfillmentPercent: (item: ProcessingItem) => number
  getFulfillmentColor: (percent: number) => string
  getItemRemainder: (item: ProcessingItem) => number
  getItemStatus: (item: ProcessingItem) => string
}>()

defineEmits<{
  (e: 'importFromDeclaration'): void
  (e: 'addItem'): void
  (e: 'removeItem', id: number): void
  (e: 'updateItemGroup', itemId: number, value: string): void
  (e: 'updateItemSubgroup', itemId: number, value: string): void
  (e: 'subgroupSelected', itemId: number, data: ProductSubgroup | null): void
  (e: 'updateItemDeclared', itemId: number, value: string): void
  (e: 'updateItemProcessed', itemId: number, value: string): void
  (e: 'updateItemRecycler', itemId: number, value: string): void
  (e: 'recyclerChange', itemId: number): void
  (e: 'switchToSelect', itemId: number): void
  (e: 'updateItemContractNumber', itemId: number, value: string): void
  (e: 'updateItemContractDate', itemId: number, value: string): void
}>()
</script>

<template>
  <div class="p-6 lg:p-8">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <h2 class="spd-title font-semibold">{{ $t('businessReports.step2Title') }}</h2>
      <button
        @click="$emit('importFromDeclaration')"
        class="spd-action-link flex items-center gap-2 hover:bg-green-50 px-4 py-2 rounded-lg transition-colors"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        {{ $t('businessReports.importFromDeclarations') }}
      </button>
    </div>

    <div v-if="formSubmitted && formErrors['items']" class="vld-error mb-4">
      <svg class="vld-error__icon w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      {{ formErrors['items'] }}
    </div>

    <div class="space-y-4">
      <ProcessingItemCard
        v-for="(item, index) in processingItems"
        :key="item.id"
        :item="item"
        :index="index"
        :canRemove="processingItems.length > 1"
        :itemSubgroup="itemSubgroups[item.id] || ''"
        :recyclerMode="recyclerModes[item.id] || 'select'"
        :recyclerOptions="getRecyclerOptionsForItem(item)"
        :formSubmitted="formSubmitted"
        :formErrors="formErrors"
        :normativePercent="getItemNormativePercent(item.wasteType)"
        :requiredProcessing="getItemRequiredProcessing(item)"
        :fulfillmentPercent="getItemFulfillmentPercent(item)"
        :fulfillmentColor="getFulfillmentColor(getItemFulfillmentPercent(item))"
        :remainder="getItemRemainder(item)"
        :itemStatus="getItemStatus(item)"
        @remove="$emit('removeItem', $event)"
        @updateGroup="$emit('updateItemGroup', item.id, $event)"
        @updateSubgroup="$emit('updateItemSubgroup', item.id, $event)"
        @subgroupSelected="$emit('subgroupSelected', item.id, $event)"
        @updateDeclared="$emit('updateItemDeclared', item.id, $event)"
        @updateProcessed="$emit('updateItemProcessed', item.id, $event)"
        @updateRecycler="$emit('updateItemRecycler', item.id, $event)"
        @recyclerChange="$emit('recyclerChange', item.id)"
        @switchToSelect="$emit('switchToSelect', item.id)"
        @updateContractNumber="$emit('updateItemContractNumber', item.id, $event)"
        @updateContractDate="$emit('updateItemContractDate', item.id, $event)"
      />
    </div>

    <button
      @click="$emit('addItem')"
      class="spd-action-link mt-4 flex items-center gap-2 hover:bg-green-50 px-4 py-2 rounded-lg transition-colors"
    >
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
      </svg>
      {{ $t('businessReports.addPosition') }}
    </button>

    <div class="spd-divider mt-8 pt-6">
      <div class="flex items-center gap-2 mb-4">
        <svg class="w-5 h-5 spd-icon-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="spd-subtitle font-semibold">{{ $t('businessReports.reportSummary') }}</h3>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div class="bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
          <p class="spd-stat-label font-semibold mb-1">{{ $t('businessReports.declared') }}</p>
          <p class="spd-stat-value spd-stat-value--blue font-bold">{{ totalDeclared }} {{ $t('businessReports.tons') }}</p>
        </div>
        <div class="bg-purple-50 rounded-xl p-4 text-center border border-purple-100">
          <p class="spd-stat-label font-semibold mb-1">{{ $t('businessReports.requiredByNormative') }}</p>
          <p class="spd-stat-value spd-stat-value--purple font-bold">{{ totalRequiredProcessing.toFixed(2) }} {{ $t('businessReports.tons') }}</p>
        </div>
        <div class="bg-green-50 rounded-xl p-4 text-center border border-green-100">
          <p class="spd-stat-label font-semibold mb-1">{{ $t('businessReports.actuallyProcessed') }}</p>
          <p class="spd-stat-value spd-stat-value--green font-bold">{{ totalProcessed }} {{ $t('businessReports.tons') }}</p>
        </div>
        <div :class="[
          'rounded-xl p-4 text-center border',
          overallFulfillmentPercent >= 100 ? 'bg-emerald-50 border-emerald-100' : overallFulfillmentPercent >= 50 ? 'bg-amber-50 border-amber-100' : 'bg-red-50 border-red-100'
        ]">
          <p class="spd-stat-label font-semibold mb-1">{{ $t('businessReports.normativeFulfillment') }}</p>
          <p class="spd-stat-value font-bold" :style="{ color: getFulfillmentColor(overallFulfillmentPercent) }">
            {{ overallFulfillmentPercent.toFixed(1) }}%
          </p>
        </div>
      </div>

      <div v-if="totalSurcharge > 0" class="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 flex items-start gap-3">
        <svg class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div>
          <p class="font-medium text-red-800">{{ $t('businessReports.preliminarySurcharge') }}</p>
          <p class="text-lg font-bold text-red-700 mt-1">{{ totalSurcharge.toLocaleString() }} {{ $t('businessReports.som') }}</p>
          <p class="spd-surcharge-note text-red-600 mt-1">{{ $t('businessReports.surchargeNote') }}</p>
        </div>
      </div>

      <div class="spd-formula-panel rounded-xl p-4">
        <p class="spd-formula-label mb-2 uppercase font-medium tracking-wide">{{ $t('businessReports.formulaTitle') }}</p>
        <code class="spd-formula-code block font-mono leading-relaxed">
          {{ $t('businessReports.formulaLine1') }}<br/>
          {{ $t('businessReports.formulaLine2') }}
        </code>
      </div>
    </div>
  </div>
</template>

<style scoped>
.spd-title {
  font-size: 27px;
  color: #1e293b;
}
.spd-action-link {
  color: #10b981;
}
.spd-divider {
  border-top: 1px solid #e2e8f0;
}
.spd-icon-accent {
  color: #10b981;
}
.spd-subtitle {
  font-size: 20px;
  color: #1e293b;
}
.spd-stat-label {
  font-size: 16px;
  color: #1e293b;
}
.spd-stat-value {
  font-size: 24px;
}
.spd-stat-value--blue {
  color: #2563eb;
}
.spd-stat-value--purple {
  color: #7c3aed;
}
.spd-stat-value--green {
  color: #10b981;
}
.spd-surcharge-note {
  font-size: 14px;
}
.spd-formula-panel {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}
.spd-formula-label {
  font-size: 14px;
  color: #94a3b8;
}
.spd-formula-code {
  font-size: 14px;
  color: #475569;
}
</style>
