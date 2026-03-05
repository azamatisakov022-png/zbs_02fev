<script setup lang="ts">
import Select from '@/components/ui/general/Select.vue'
import AppInput from '@/components/ui/AppInput.vue'
import type { SelectOption } from '@/types/select'

defineProps<{
  reportingYear: string
  yearFormOptions: SelectOption[]
  companyData: { name: string; fullName: string; inn: string; okpo: string; registrationNumber: string; registrationDate: string; legalAddress: string; actualAddress: string }
  hasCalculations: boolean
  yearCalculationsCount: number
  totalAmount: number
  totalMass: number
}>()

defineEmits<{
  (e: 'update:reportingYear', value: string): void
}>()
</script>

<template>
  <div class="p-6 lg:p-8">
    <h2 class="dsb-section-title mb-6">{{ $t('businessDecl.stepBasicData') }}</h2>

    <div class="space-y-6">
      <Select
        variant="form"
        :label="$t('businessDecl.reportingYear')"
        :modelValue="reportingYear"
        @update:modelValue="(v: string | number | null) => $emit('update:reportingYear', String(v || '2026'))"
        :options="yearFormOptions"
      />

      <div class="dsb-card">
        <div class="flex items-center gap-2 mb-4">
          <svg class="w-5 h-5 dsb-icon-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h3 class="dsb-subsection-title">{{ $t('businessDecl.companyDataTitle') }}</h3>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AppInput
            :label="$t('businessDecl.companyName')"
            :modelValue="companyData.name"
            disabled
          />
          <AppInput
            :label="$t('businessDecl.inn')"
            :modelValue="companyData.inn"
            disabled
          />
          <div class="sm:col-span-2">
            <AppInput
              :label="$t('businessDecl.address')"
              :modelValue="companyData.legalAddress"
              disabled
            />
          </div>
        </div>
      </div>

      <div v-if="hasCalculations" class="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
        <div class="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
          <svg class="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p class="dsb-alert-text text-green-800">
            {{ $t('businessDecl.calcFound', { count: yearCalculationsCount, year: reportingYear }) }}
          </p>
          <p class="dsb-alert-text-medium text-green-700 mt-1">
            {{ $t('businessDecl.totalAmountAndMass', { amount: totalAmount.toLocaleString(), mass: totalMass.toFixed(1) }) }}
          </p>
        </div>
      </div>

      <div v-else class="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
        <div class="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center flex-shrink-0">
          <svg class="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <p class="dsb-alert-text text-yellow-800">{{ $t('businessDecl.noCalcsForYear') }}</p>
          <p class="dsb-alert-text-medium text-yellow-700 mt-1">{{ $t('businessDecl.noCalcsHint') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dsb-section-title {
  font-size: 27px;
  font-weight: 600;
  color: #1e293b;
}
.dsb-card {
  background-color: #f8fafc;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e2e8f0;
}
.dsb-icon-blue {
  color: #2563eb;
}
.dsb-subsection-title {
  font-size: 17px;
  font-weight: 600;
  color: #1e293b;
}
.dsb-alert-text {
  font-size: 17px;
  font-weight: 600;
}
.dsb-alert-text-medium {
  font-size: 17px;
  font-weight: 500;
}
</style>
