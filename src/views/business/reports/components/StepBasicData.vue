<script setup lang="ts">
import AppInput from '@/components/ui/AppInput.vue'
import Select from '@/components/ui/general/Select.vue'
import type { SelectOption } from '@/types/select'

defineProps<{
  reportingYear: string
  yearOptions: SelectOption[]
  companyData: { name: string; inn: string; address: string }
  yearNormativeHigh: number
  yearNormativeStandard: number
  formSubmitted: boolean
  formErrors: Record<string, string>
}>()

defineEmits<{
  (e: 'update:reportingYear', value: string): void
}>()
</script>

<template>
  <div class="p-6 lg:p-8">
    <h2 class="text-[27px] font-semibold text-[#1e293b] mb-6">{{ $t('businessReports.step1Title') }}</h2>

    <div class="space-y-6">
      <Select
        :modelValue="reportingYear"
        @update:modelValue="$emit('update:reportingYear', $event)"
        :options="yearOptions"
        :label="$t('businessReports.reportingYear')"
        variant="form"
        :error="formSubmitted && formErrors['reportingYear'] ? formErrors['reportingYear'] : ''"
      />

      <div class="bg-[#f8fafc] rounded-xl p-5 border border-[#e2e8f0]">
        <div class="flex items-center gap-2 mb-4">
          <svg class="w-5 h-5 text-[#10b981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h3 class="font-medium text-[#1e293b]">{{ $t('businessReports.companyDataTitle') }}</h3>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AppInput
            :label="$t('businessReports.companyName')"
            :modelValue="companyData.name"
            disabled
          />
          <AppInput
            :label="$t('businessReports.inn')"
            :modelValue="companyData.inn"
            disabled
          />
          <div class="sm:col-span-2">
            <AppInput
              :label="$t('businessReports.address')"
              :modelValue="companyData.address"
              disabled
            />
          </div>
        </div>
      </div>

      <div class="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
        <div class="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
          <svg class="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p class="font-medium text-[#1e293b]">{{ $t('businessReports.normativeInfo', { year: reportingYear, high: yearNormativeHigh, standard: yearNormativeStandard }) }}</p>
          <p class="text-[16px] text-[#64748b]">{{ $t('businessReports.normativeDescription') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
