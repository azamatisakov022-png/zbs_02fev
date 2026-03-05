<script setup lang="ts">
import type { PayerType } from '@/types/calculator'
import type { SelectOption } from '@/types/select'
import Select from '@/components/ui/general/Select.vue'
import DatePicker from '@/components/ui/general/DatePicker.vue'
import AppInput from '@/components/ui/AppInput.vue'

defineProps<{
  payerType: PayerType
  calculationQuarter: string
  calculationYear: string
  importDate: string
  companyData: { name: string; inn: string; address: string; director: string; phone: string; email: string }
  formSubmitted: boolean
  formErrors: Record<string, string>
  validationErrors: Record<string, string>
  quarterOptions: SelectOption[]
  yearOptions: SelectOption[]
  dateInputMax: string
  producerDeadlineFormatted: string
  importerDeadlineFormatted: string
  importerDaysLeft: number | null
  importerDeadlinePassed: boolean
}>()

const emit = defineEmits<{
  (e: 'update:payerType', value: PayerType): void
  (e: 'update:calculationQuarter', value: string): void
  (e: 'update:calculationYear', value: string): void
  (e: 'update:importDate', value: string): void
  (e: 'clear-validation', key: string): void
}>()
</script>

<template>
  <div class="p-6 lg:p-8">
    <h2 class="sp-section-title font-semibold text-slate-800 mb-6">{{ $t('businessCalc.periodAndPayerTitle') }}</h2>

    <div class="space-y-6">
      <div>
        <label class="step-label mb-3">{{ $t('businessCalc.payerTypeLabel') }}</label>
        <div class="inline-flex rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
          <button
            type="button"
            @click="emit('update:payerType', 'producer')"
            :class="[
              'px-6 py-3 sp-text font-semibold transition-all duration-200',
              payerType === 'producer'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-800 hover:bg-white'
            ]"
          >{{ $t('businessCalc.producer') }}</button>
          <button
            type="button"
            @click="emit('update:payerType', 'importer')"
            :class="[
              'px-6 py-3 sp-text font-semibold transition-all duration-200',
              payerType === 'importer'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-800 hover:bg-white'
            ]"
          >{{ $t('businessCalc.importer') }}</button>
        </div>
      </div>

      <div v-if="payerType === 'producer'" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Select
            variant="form"
            :label="$t('businessCalc.calcPeriodLabel')"
            :modelValue="calculationQuarter || null"
            @update:modelValue="(v: string | number | null) => { emit('update:calculationQuarter', String(v || '')); emit('clear-validation', 'quarter') }"
            :options="quarterOptions"
            :placeholder="$t('businessCalc.selectQuarter')"
          />
          <p v-if="validationErrors.quarter" class="vld-error">{{ validationErrors.quarter }}</p>
          <p v-else-if="formSubmitted && formErrors.quarter" class="vld-error" data-validation-error>
            <span class="vld-error__icon">&#9888;</span> {{ formErrors.quarter }}
          </p>
        </div>
        <div>
          <Select
            variant="form"
            :label="$t('businessCalc.yearLabel')"
            :modelValue="calculationYear"
            @update:modelValue="(v: string | number | null) => { emit('update:calculationYear', String(v || '2026')) }"
            :options="yearOptions"
          />
        </div>
      </div>

      <div v-if="payerType === 'producer' && producerDeadlineFormatted" class="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <div class="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
          <svg class="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p class="sp-text font-semibold text-slate-800">{{ $t('businessCalc.deadlineTitle') }}</p>
          <p class="sp-text font-medium text-slate-600">{{ $t('businessCalc.deadlineBefore', { date: producerDeadlineFormatted }) }}</p>
        </div>
      </div>

      <div v-if="payerType === 'importer'" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <DatePicker
            variant="form"
            :label="$t('businessCalc.importDateLabel')"
            :modelValue="importDate"
            @update:modelValue="(v: string) => { emit('update:importDate', v); emit('clear-validation', 'importDate') }"
            :error="validationErrors.importDate || (formSubmitted && formErrors.importDate ? formErrors.importDate : '')"
            :max="dateInputMax"
          />
        </div>
        <div>
          <Select
            variant="form"
            :label="$t('businessCalc.yearLabel')"
            :modelValue="calculationYear"
            @update:modelValue="(v: string | number | null) => { emit('update:calculationYear', String(v || '2026')) }"
            :options="yearOptions"
          />
        </div>
      </div>

      <div v-if="payerType === 'importer' && importerDeadlineFormatted && !importerDeadlinePassed" class="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <div class="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
          <svg class="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p class="sp-text font-semibold text-slate-800">{{ $t('businessCalc.deadlineTitle') }}</p>
          <p class="sp-text font-medium text-slate-600">{{ $t('businessCalc.deadlineBeforeWithDays', { date: importerDeadlineFormatted, days: importerDaysLeft }) }}</p>
        </div>
      </div>

      <div v-if="payerType === 'importer' && importerDeadlineFormatted && importerDeadlinePassed" class="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
        <div class="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
          <svg class="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <div>
          <p class="sp-text font-semibold text-red-800">{{ $t('businessCalc.deadlineExpired') }}</p>
          <p class="sp-text font-medium text-red-600">{{ $t('businessCalc.deadlineWas', { date: importerDeadlineFormatted }) }}</p>
        </div>
      </div>

      <div class="bg-slate-50 rounded-xl p-5 border border-slate-200">
        <div class="flex items-center gap-2 mb-4">
          <svg class="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h3 class="sp-text font-semibold text-slate-800">{{ $t('businessCalc.payerDataTitle') }}</h3>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AppInput
            :label="$t('businessCalc.companyNameLabel')"
            :modelValue="companyData.name"
            disabled
          />
          <AppInput
            :label="$t('businessCalc.innLabel')"
            :modelValue="companyData.inn"
            disabled
          />
          <div class="sm:col-span-2">
            <AppInput
              :label="$t('businessCalc.addressLabel')"
              :modelValue="companyData.address"
              disabled
            />
          </div>
        </div>
      </div>

      <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <div class="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
          <svg class="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p class="sp-text font-semibold text-slate-800">{{ $t('businessCalc.paymentTermsTitle') }}</p>
          <p class="sp-text font-medium text-slate-600" v-html="$t('businessCalc.paymentTermsText')"></p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.step-label {
  display: block;
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
}

.sp-section-title {
  font-size: 27px;
}

.sp-text {
  font-size: 20px;
}
</style>
