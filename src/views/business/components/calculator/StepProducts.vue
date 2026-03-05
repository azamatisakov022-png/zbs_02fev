<script setup lang="ts">
import type { CalculatorProductItem, PayerType } from '@/types/calculator'
import ProductItemCard from './ProductItemCard.vue'

defineProps<{
  productItems: CalculatorProductItem[]
  payerType: PayerType
  formSubmitted: boolean
  formErrors: Record<string, string>
  validationErrors: Record<string, string>
  totalVolume: string
  totalVolumeToRecycle: string
  totalTransferred: string
  totalExported: string
  totalTaxableVolume: string
  formattedTotalAmount: string
}>()

const emit = defineEmits<{
  (e: 'add-item'): void
  (e: 'remove-item', id: number): void
  (e: 'import-declaration'): void
  (e: 'group-changed', item: CalculatorProductItem): void
  (e: 'subgroup-changed', item: CalculatorProductItem): void
  (e: 'clear-validation', key: string): void
}>()
</script>

<template>
  <div class="p-6 lg:p-8">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <h2 class="spr-section-title font-semibold text-slate-800">{{ $t('businessCalc.productsTitle') }}</h2>
      <button @click="emit('import-declaration')" class="flex items-center gap-2 spr-text font-semibold text-amber-500 hover:bg-amber-50 px-4 py-2 rounded-lg transition-colors">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        {{ $t('businessCalc.importFromDeclaration') }}
      </button>
    </div>

    <p v-if="formSubmitted && formErrors.products" class="vld-error mb-4" data-validation-error>
      <span class="vld-error__icon">&#9888;</span> {{ formErrors.products }}
    </p>

    <div class="space-y-4">
      <ProductItemCard
        v-for="(item, index) in productItems"
        :key="item.id"
        :item="item"
        :index="index"
        :payerType="payerType"
        :formSubmitted="formSubmitted"
        :formErrors="formErrors"
        :validationErrors="validationErrors"
        :canRemove="productItems.length > 1"
        @remove="emit('remove-item', $event)"
        @group-changed="emit('group-changed', $event)"
        @subgroup-changed="emit('subgroup-changed', $event)"
        @clear-validation="emit('clear-validation', $event)"
      />
    </div>

    <button @click="emit('add-item')" class="mt-4 flex items-center gap-2 spr-text font-semibold text-amber-500 hover:bg-amber-50 px-4 py-2 rounded-lg transition-colors">
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
      </svg>
      {{ $t('businessCalc.addPosition') }}
    </button>

    <div class="cf-total-banner mt-8">
      <div class="cf-total-banner__grid">
        <div class="cf-total-banner__cell">
          <span class="cf-total-banner__cell-label">{{ $t('businessCalc.totalVolumeLabel') }}</span>
          <span class="cf-total-banner__cell-value">{{ totalVolume }} {{ $t('businessCalc.ton') }}</span>
        </div>
        <div class="cf-total-banner__cell">
          <span class="cf-total-banner__cell-label">{{ $t('businessCalc.totalToRecycleLabel') }}</span>
          <span class="cf-total-banner__cell-value text-indigo-500">{{ totalVolumeToRecycle }} {{ $t('businessCalc.ton') }}</span>
        </div>
        <div class="cf-total-banner__cell">
          <span class="cf-total-banner__cell-label">{{ $t('businessCalc.totalTransferredLabel') }}</span>
          <span class="cf-total-banner__cell-value text-emerald-500">{{ totalTransferred }} {{ $t('businessCalc.ton') }}</span>
        </div>
        <div class="cf-total-banner__cell">
          <span class="cf-total-banner__cell-label">{{ $t('businessCalc.totalExportedLabel') }}</span>
          <span class="cf-total-banner__cell-value text-blue-600">{{ totalExported }} {{ $t('businessCalc.ton') }}</span>
        </div>
        <div class="cf-total-banner__cell">
          <span class="cf-total-banner__cell-label">{{ $t('businessCalc.totalTaxableLabel') }}</span>
          <span class="cf-total-banner__cell-value">{{ totalTaxableVolume }} {{ $t('businessCalc.ton') }}</span>
        </div>
      </div>
      <div class="cf-total-banner__bottom">
        <span class="cf-total-banner__label">{{ $t('businessCalc.totalToPay') }}</span>
        <span class="cf-total-banner__value text-amber-500">{{ formattedTotalAmount }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cf-total-banner {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
.cf-total-banner__grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0;
  margin-bottom: 16px;
}
.cf-total-banner__cell {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 16px;
  border-right: 1px solid #e2e8f0;
}
.cf-total-banner__cell:last-child {
  border-right: none;
}
.cf-total-banner__cell-label {
  font-size: 14px;
  color: black;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.cf-total-banner__cell-value {
  font-size: 22px;
  font-weight: 700;
  color: #1e293b;
}
.cf-total-banner__bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  background: linear-gradient(135deg, #fffbeb, #fef3c7);
  border-radius: 12px;
  padding: 16px 20px;
  border: 1px solid #fde68a;
}
.cf-total-banner__label {
  font-size: 20px;
  font-weight: 700;
  color: #92400e;
}
.cf-total-banner__value {
  font-size: 32px;
  font-weight: 800;
  color: #d97706;
}

@media (max-width: 640px) {
  .cf-total-banner__grid { grid-template-columns: repeat(2, 1fr); }
  .cf-total-banner__cell { border-right: none; border-bottom: 1px solid #e2e8f0; }
  .cf-total-banner__cell:last-child { border-bottom: none; }
  .cf-total-banner__bottom { flex-direction: column; align-items: flex-start; }
}

.spr-section-title {
  font-size: 27px;
}

.spr-text {
  font-size: 20px;
}
</style>
