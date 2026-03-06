<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { calculatePenalty, PENALTY_DAILY_RATE, PENALTY_CAP_MULTIPLIER } from '../../utils/penalty'

const props = withDefaults(defineProps<{
  debtAmount: number
  dueDate: string | Date
  payerName?: string
  compact?: boolean
  showLegalBase?: boolean
}>(), {
  compact: false,
  showLegalBase: true,
})

const { t } = useI18n()

function parseDueDate(val: string | Date): Date {
  if (val instanceof Date) return val
  const [d, m, y] = val.split('.')
  return new Date(+y, +m - 1, +d)
}

const penalty = computed(() => {
  if (!props.debtAmount || !props.dueDate) return null
  return calculatePenalty(props.debtAmount, parseDueDate(props.dueDate))
})

const progressPercent = computed(() => {
  if (!penalty.value || penalty.value.overdueDays === 0) return 0
  const pct = (penalty.value.totalPenalty / (props.debtAmount * PENALTY_CAP_MULTIPLIER)) * 100
  return Math.min(pct, 100)
})

const progressColor = computed(() => {
  const pct = progressPercent.value
  if (pct < 30) return '#22c55e'
  if (pct < 70) return '#f59e0b'
  return '#ef4444'
})

const progressBgColor = computed(() => {
  const pct = progressPercent.value
  if (pct < 30) return '#dcfce7'
  if (pct < 70) return '#fef3c7'
  return '#fee2e2'
})

function fmtMoney(n: number): string {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
</script>

<template>
  <!-- Compact mode: single-row badge -->
  <div v-if="compact && penalty && penalty.overdueDays > 0"
    class="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg text-sm">
    <svg class="w-4 h-4 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <span class="text-red-700 font-medium">
      {{ $t('penalty.compactTemplate', { penalty: fmtMoney(penalty.totalPenalty), days: penalty.overdueDays, total: fmtMoney(penalty.totalToPay) }) }}
    </span>
  </div>

  <!-- Full mode: card -->
  <div v-else-if="!compact && penalty && penalty.overdueDays > 0"
    class="bg-white rounded-2xl border-2 border-red-200 p-6">

    <!-- Header -->
    <div class="flex items-center gap-3 mb-5">
      <div class="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
        <svg class="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div>
        <h3 class="font-bold text-red-800 text-base">{{ $t('penalty.title') }}</h3>
        <p v-if="payerName" class="text-sm text-red-600">{{ payerName }}</p>
      </div>
    </div>

    <!-- Overdue days -->
    <div class="flex items-center gap-3 mb-4 bg-red-50 rounded-xl p-4">
      <span class="text-3xl font-bold text-red-600">{{ penalty.overdueDays }}</span>
      <div>
        <p class="text-sm font-semibold text-red-800">{{ $t('penalty.overdueDays') }}</p>
        <p class="text-xs text-red-600">{{ $t('penalty.calendarDays') }}</p>
      </div>
    </div>

    <!-- Calculation details -->
    <div class="space-y-3 mb-5">
      <div class="flex justify-between items-center py-2 border-b border-gray-100">
        <span class="text-sm text-gray-600">{{ $t('penalty.debtAmount') }}</span>
        <span class="text-sm font-semibold text-gray-900">{{ fmtMoney(penalty.debtAmount) }} {{ $t('penalty.som') }}</span>
      </div>
      <div class="flex justify-between items-center py-2 border-b border-gray-100">
        <span class="text-sm text-gray-600">{{ $t('penalty.dailyRate') }}</span>
        <span class="text-sm font-medium text-gray-900">{{ $t('penalty.dailyRateValue') }} ({{ (PENALTY_DAILY_RATE * 100).toFixed(2) }}%)</span>
      </div>
      <div class="flex justify-between items-center py-2 border-b border-gray-100">
        <span class="text-sm text-gray-600">{{ $t('penalty.dailyPenalty') }}</span>
        <span class="text-sm font-medium text-gray-900">{{ fmtMoney(penalty.dailyPenalty) }} {{ $t('penalty.som') }}</span>
      </div>
    </div>

    <!-- Progress bar to 100% cap -->
    <div class="mb-5">
      <div class="flex justify-between items-center mb-1.5">
        <span class="text-xs text-gray-500">{{ $t('penalty.progressLabel') }}</span>
        <span class="text-xs font-semibold" :style="{ color: progressColor }">{{ progressPercent.toFixed(1) }}%</span>
      </div>
      <div class="h-2.5 rounded-full overflow-hidden" :style="{ background: progressBgColor }">
        <div class="h-full rounded-full transition-all duration-500" :style="{ width: progressPercent + '%', background: progressColor }"></div>
      </div>
      <p v-if="penalty.capReached" class="text-xs text-red-600 font-medium mt-1.5">
        {{ $t('penalty.capReached') }}
      </p>
    </div>

    <!-- Total penalty -->
    <div class="bg-red-50 rounded-xl p-4 mb-4">
      <div class="flex justify-between items-center mb-2">
        <span class="text-sm text-red-700">{{ $t('penalty.totalPenalty') }}</span>
        <span class="text-lg font-bold text-red-700">{{ fmtMoney(penalty.totalPenalty) }} {{ $t('penalty.som') }}</span>
      </div>
    </div>

    <!-- Total to pay -->
    <div class="bg-gray-900 rounded-xl p-4 text-center">
      <p class="text-sm text-gray-300 mb-1">{{ $t('penalty.totalToPay') }}</p>
      <p class="text-2xl font-bold text-white">{{ fmtMoney(penalty.totalToPay) }} {{ $t('penalty.som') }}</p>
    </div>

    <!-- Legal base footer -->
    <p v-if="showLegalBase" class="text-xs text-gray-400 mt-4 text-center">
      {{ $t('penalty.legalBase') }}
    </p>
  </div>
</template>
