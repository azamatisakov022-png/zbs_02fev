<script setup lang="ts">
import { AppButton, AppBadge } from '@/components/ui'
import AppInput from '@/components/ui/AppInput.vue'
import Select from '@/components/ui/general/Select.vue'
import ProductGroupSelector from '@/components/ProductGroupSelector.vue'
import type { SelectOption } from '@/types/select'
import type { ProcessingItem } from '@/stores/reports'
import type { ProductSubgroup } from '@/data/product-groups'

const props = defineProps<{
  item: ProcessingItem
  index: number
  canRemove: boolean
  itemSubgroup: string
  recyclerMode: string
  recyclerOptions: SelectOption[]
  formSubmitted: boolean
  formErrors: Record<string, string>
  normativePercent: number
  requiredProcessing: number
  fulfillmentPercent: number
  fulfillmentColor: string
  remainder: number
  itemStatus: string
}>()

defineEmits<{
  (e: 'remove', id: number): void
  (e: 'updateGroup', value: string): void
  (e: 'updateSubgroup', value: string): void
  (e: 'subgroupSelected', data: ProductSubgroup | null): void
  (e: 'updateDeclared', value: string): void
  (e: 'updateProcessed', value: string): void
  (e: 'updateRecycler', value: string): void
  (e: 'recyclerChange'): void
  (e: 'switchToSelect'): void
  (e: 'updateContractNumber', value: string): void
  (e: 'updateContractDate', value: string): void
}>()

const showSummary = (item: ProcessingItem) => {
  return item.wasteType && item.declared && item.processed
}
</script>

<template>
  <div class="pic-card rounded-lg p-6 mb-5">
    <div class="flex items-center justify-between mb-4">
      <span class="pic-position-title font-semibold">{{ $t('businessReports.position', { n: index + 1 }) }}</span>
      <AppButton
        v-if="canRemove"
        variant="icon-danger"
        size="sm"
        @click="$emit('remove', item.id)"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </AppButton>
    </div>

    <ProductGroupSelector
      :group="item.wasteType"
      :subgroup="itemSubgroup"
      @update:group="$emit('updateGroup', $event)"
      @update:subgroup="$emit('updateSubgroup', $event)"
      @subgroup-selected="$emit('subgroupSelected', $event)"
      accent-color="#10b981"
    />

    <div class="mt-4">
      <AppInput
        :label="$t('businessReports.declaredMass')"
        type="number"
        :modelValue="item.declared"
        @update:modelValue="$emit('updateDeclared', String($event))"
        placeholder="0.00"
        :error="formSubmitted && formErrors[`item_${item.id}_declared`] ? formErrors[`item_${item.id}_declared`] : ''"
      />
    </div>

    <div v-if="item.wasteType" class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
      <div>
        <label class="app-input__label">{{ $t('businessReports.normativePercent') }}</label>
        <div class="pic-normative-display w-full px-3 py-2 rounded-lg font-bold">
          {{ normativePercent.toFixed(1) }}%
        </div>
      </div>
      <div>
        <label class="app-input__label">{{ $t('businessReports.requiredProcessing') }}</label>
        <div class="pic-required-display w-full px-3 py-2 rounded-lg font-semibold">
          {{ requiredProcessing.toFixed(2) }}
        </div>
        <p class="pic-formula-hint mt-1">= {{ item.declared || '0' }} × {{ normativePercent.toFixed(1) }}% / 100</p>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
      <AppInput
        :label="$t('businessReports.processedMass')"
        type="number"
        :modelValue="item.processed"
        @update:modelValue="$emit('updateProcessed', String($event))"
        placeholder="0.00"
        :error="formSubmitted && (formErrors[`item_${item.id}_processed`] || formErrors[`item_${item.id}_processed_exceed`]) ? (formErrors[`item_${item.id}_processed`] || formErrors[`item_${item.id}_processed_exceed`]) : ''"
      />
      <div>
        <label class="app-input__label">{{ $t('businessReports.recyclerLabel') }}</label>
        <template v-if="recyclerMode !== 'manual'">
          <Select
            :modelValue="item.recycler"
            @update:modelValue="$emit('updateRecycler', $event)"
            :options="recyclerOptions"
            variant="form"
            @change="$emit('recyclerChange')"
          />
        </template>
        <template v-else>
          <div class="flex gap-1 min-w-0">
            <input
              type="text"
              :value="item.recycler"
              @input="$emit('updateRecycler', ($event.target as HTMLInputElement).value)"
              :placeholder="$t('businessReports.recyclerPlaceholder')"
              class="pic-recycler-input flex-1 min-w-0 px-3 py-2 rounded-lg focus:outline-none"
            />
            <AppButton
              variant="icon-only"
              size="sm"
              @click="$emit('switchToSelect')"
              :title="$t('businessReports.selectFromList')"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
              </svg>
            </AppButton>
          </div>
        </template>
        <div v-if="formSubmitted && formErrors[`item_${item.id}_recycler`]" class="vld-error">
          <svg class="vld-error__icon w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {{ formErrors[`item_${item.id}_recycler`] }}
        </div>
      </div>
      <AppInput
        :label="$t('businessReports.contractNumber')"
        :modelValue="item.contractNumber"
        @update:modelValue="$emit('updateContractNumber', String($event))"
        placeholder="ДГ-2024-001"
        :hint="formSubmitted && formErrors[`item_${item.id}_contract_warn`] ? formErrors[`item_${item.id}_contract_warn`] : ''"
      />
      <AppInput
        :label="$t('businessReports.contractDate')"
        type="date"
        :modelValue="item.contractDate"
        @update:modelValue="$emit('updateContractDate', String($event))"
      />
    </div>

    <div v-if="showSummary(item)" class="mt-4 rounded-lg border p-4" :style="{ borderColor: fulfillmentColor + '40', background: fulfillmentColor + '08' }">
      <div class="flex items-center gap-2 mb-3">
        <svg class="w-4 h-4" :style="{ color: fulfillmentColor }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <span class="pic-summary-title font-semibold uppercase tracking-wide">{{ $t('businessReports.itemSummary') }}</span>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <p class="pic-summary-label font-semibold mb-0.5">{{ $t('businessReports.normativeFulfillmentLabel') }}</p>
          <p class="text-lg font-bold" :style="{ color: fulfillmentColor }">
            {{ fulfillmentPercent.toFixed(1) }}%
          </p>
          <div class="mt-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div class="h-full rounded-full transition-all" :style="{ width: Math.min(fulfillmentPercent, 100) + '%', background: fulfillmentColor }"></div>
          </div>
        </div>
        <div>
          <p class="pic-summary-label font-semibold mb-0.5">{{ $t('businessReports.remainderToProcess') }}</p>
          <p class="pic-remainder-value text-lg font-bold">{{ remainder.toFixed(2) }} {{ $t('businessReports.tons') }}</p>
        </div>
        <div>
          <p class="pic-summary-label font-semibold mb-0.5">{{ $t('businessReports.statusLabel') }}</p>
          <AppBadge v-if="itemStatus === 'fulfilled'" variant="success" size="sm">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
            {{ $t('businessReports.fulfilled') }}
          </AppBadge>
          <AppBadge v-else-if="itemStatus === 'partial'" variant="warning" size="sm">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01" /></svg>
            {{ $t('businessReports.partial') }}
          </AppBadge>
          <AppBadge v-else variant="danger" size="sm">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            {{ $t('businessReports.notFulfilled') }}
          </AppBadge>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.app-input__label {
  display: block;
  font-size: 20px !important;
  font-weight: 600 !important;
  color: #1e293b !important;
  margin-bottom: 6px;
}
.pic-card {
  border: 1px solid #e2e8f0;
}
.pic-position-title {
  font-size: 20px;
  color: #1e293b;
}
.pic-normative-display {
  font-size: 16px;
  background: #F0FDF4;
  border: 1px solid #D1FAE5;
  color: #059669;
}
.pic-required-display {
  font-size: 16px;
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  color: #1E293B;
}
.pic-formula-hint {
  font-size: 13px;
  color: #94a3b8;
}
.pic-recycler-input {
  font-size: 16px;
  border: 1px solid #e2e8f0;
}
.pic-recycler-input:focus {
  border-color: #10b981;
}
.pic-summary-title {
  font-size: 16px;
  color: #1e293b;
}
.pic-summary-label {
  font-size: 16px;
  color: #1e293b;
}
.pic-remainder-value {
  color: #1e293b;
}
</style>
