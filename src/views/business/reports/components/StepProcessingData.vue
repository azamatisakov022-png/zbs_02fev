<script setup lang="ts">
import { AppButton, AppAlert, AppStatCard } from '@/components/ui'
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
      <AppButton
        variant="ghost"
        @click="$emit('importFromDeclaration')"
        :icon="'<svg class=&quot;w-5 h-5&quot; fill=&quot;none&quot; viewBox=&quot;0 0 24 24&quot; stroke=&quot;currentColor&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; stroke-width=&quot;2&quot; d=&quot;M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12&quot; /></svg>'"
        :label="$t('businessReports.importFromDeclarations')"
        color="#10b981"
      />
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

    <AppButton
      variant="ghost"
      @click="$emit('addItem')"
      :icon="'<svg class=&quot;w-5 h-5&quot; fill=&quot;none&quot; viewBox=&quot;0 0 24 24&quot; stroke=&quot;currentColor&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; stroke-width=&quot;2&quot; d=&quot;M12 4v16m8-8H4&quot; /></svg>'"
      :label="$t('businessReports.addPosition')"
      color="#10b981"
      class="mt-4"
    />

    <div class="spd-divider mt-8 pt-6">
      <div class="flex items-center gap-2 mb-4">
        <svg class="w-5 h-5 spd-icon-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="spd-subtitle font-semibold">{{ $t('businessReports.reportSummary') }}</h3>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <AppStatCard :label="$t('businessReports.declared')" :value="totalDeclared + ' ' + $t('businessReports.tons')" color="blue" bg="#eff6ff" borderColor="#bfdbfe" :centered="true" />
        <AppStatCard :label="$t('businessReports.requiredByNormative')" :value="totalRequiredProcessing.toFixed(2) + ' ' + $t('businessReports.tons')" color="purple" bg="#faf5ff" borderColor="#e9d5ff" :centered="true" />
        <AppStatCard :label="$t('businessReports.actuallyProcessed')" :value="totalProcessed + ' ' + $t('businessReports.tons')" color="green" bg="#f0fdf4" borderColor="#bbf7d0" :centered="true" />
        <AppStatCard
          :label="$t('businessReports.normativeFulfillment')"
          :bg="overallFulfillmentPercent >= 100 ? '#ecfdf5' : overallFulfillmentPercent >= 50 ? '#fffbeb' : '#fef2f2'"
          :borderColor="overallFulfillmentPercent >= 100 ? '#a7f3d0' : overallFulfillmentPercent >= 50 ? '#fde68a' : '#fecaca'"
          :valueColor="getFulfillmentColor(overallFulfillmentPercent)"
          :centered="true"
        >
          {{ overallFulfillmentPercent.toFixed(1) }}%
        </AppStatCard>
      </div>

      <AppAlert v-if="totalSurcharge > 0" variant="error" :title="$t('businessReports.preliminarySurcharge')" class="mb-4">
        <p class="text-lg font-bold text-red-700 mt-1">{{ totalSurcharge.toLocaleString() }} {{ $t('businessReports.som') }}</p>
        <p class="spd-surcharge-note text-red-600 mt-1">{{ $t('businessReports.surchargeNote') }}</p>
      </AppAlert>

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
