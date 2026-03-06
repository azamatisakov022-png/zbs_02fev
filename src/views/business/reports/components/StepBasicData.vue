<script setup lang="ts">
import AppInput from '@/components/ui/AppInput.vue'
import Select from '@/components/ui/general/Select.vue'
import { AppAlert } from '@/components/ui'
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
    <h2 class="sbd-title font-semibold mb-6">{{ $t('businessReports.step1Title') }}</h2>

    <div class="space-y-6">
      <Select
        :modelValue="reportingYear"
        @update:modelValue="$emit('update:reportingYear', $event)"
        :options="yearOptions"
        :label="$t('businessReports.reportingYear')"
        variant="form"
        :error="formSubmitted && formErrors['reportingYear'] ? formErrors['reportingYear'] : ''"
      />

      <div class="sbd-panel rounded-xl p-5">
        <div class="flex items-center gap-2 mb-4">
          <svg class="w-5 h-5 sbd-icon-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h3 class="sbd-heading font-medium">{{ $t('businessReports.companyDataTitle') }}</h3>
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

      <AppAlert variant="success" :title="$t('businessReports.normativeInfo', { year: reportingYear, high: yearNormativeHigh, standard: yearNormativeStandard })">
        {{ $t('businessReports.normativeDescription') }}
      </AppAlert>
    </div>
  </div>
</template>

<style scoped>
.sbd-title {
  font-size: 27px;
  color: #1e293b;
}
.sbd-panel {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}
.sbd-icon-accent {
  color: #10b981;
}
.sbd-heading {
  color: #1e293b;
}
.sbd-description {
  font-size: 16px;
  color: #64748b;
}
</style>
