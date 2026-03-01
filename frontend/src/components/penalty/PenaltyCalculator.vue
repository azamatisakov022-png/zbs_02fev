<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { calculatePenalty } from '../../utils/penalty'

const { t } = useI18n()

const props = withDefaults(defineProps<{
  debtAmount: number
  dueDate: Date | string
  payerName?: string
  compact?: boolean
}>(), {
  compact: false,
})

const result = computed(() => {
  const due = props.dueDate instanceof Date ? props.dueDate : new Date(props.dueDate)
  return calculatePenalty(props.debtAmount, due)
})

const formattedDueDate = computed(() => {
  const due = props.dueDate instanceof Date ? props.dueDate : new Date(props.dueDate)
  return due.toLocaleDateString('ru-RU')
})
</script>

<template>
  <!-- Compact mode -->
  <div v-if="compact && result.overdueDays > 0" class="bg-amber-50 border border-amber-200 rounded-xl p-3">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <svg class="w-4 h-4 text-amber-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span class="text-sm text-amber-800">
          {{ t('penalty.penaltyLabel') }}: {{ result.overdueDays }} {{ t('penalty.days') }}
        </span>
      </div>
      <span class="text-sm font-semibold text-amber-900">
        {{ result.totalPenalty.toLocaleString() }} {{ t('penalty.som') }}
      </span>
    </div>
  </div>

  <!-- Full mode -->
  <div v-else-if="!compact && result.overdueDays > 0" class="bg-amber-50 border border-amber-200 rounded-2xl p-6">
    <div class="flex items-center gap-3 mb-4">
      <div class="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
        <svg class="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div>
        <h3 class="font-semibold text-amber-900">{{ t('penalty.calculationTitle') }}</h3>
        <p class="text-xs text-amber-700">{{ t('penalty.article37') }}</p>
      </div>
    </div>

    <div class="space-y-2 text-sm">
      <div class="flex justify-between">
        <span class="text-amber-700">{{ t('penalty.debtAmount') }}</span>
        <span class="font-semibold text-amber-900">{{ result.debtAmount.toLocaleString() }} {{ t('penalty.som') }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-amber-700">{{ t('penalty.dueDate') }}</span>
        <span class="font-medium text-amber-900">{{ formattedDueDate }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-amber-700">{{ t('penalty.overdueDays') }}</span>
        <span class="font-medium text-amber-900">{{ result.overdueDays }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-amber-700">{{ t('penalty.dailyRate') }}</span>
        <span class="font-medium text-amber-900">0.1%</span>
      </div>
      <div class="border-t border-amber-200 pt-2 flex justify-between">
        <span class="font-semibold text-amber-800">{{ t('penalty.totalPenalty') }}</span>
        <span class="font-bold text-amber-900">{{ result.totalPenalty.toLocaleString() }} {{ t('penalty.som') }}</span>
      </div>
      <div class="flex justify-between">
        <span class="font-semibold text-amber-800">{{ t('penalty.totalWithPenalty') }}</span>
        <span class="font-bold text-amber-900">{{ result.totalWithPenalty.toLocaleString() }} {{ t('penalty.som') }}</span>
      </div>
    </div>
  </div>
</template>
