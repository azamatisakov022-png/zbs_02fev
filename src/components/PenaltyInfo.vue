<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { calculatePenalty, getOverdueDays, PENALTY_DAILY_RATE, PENALTY_CAP_MULTIPLIER } from '../utils/penalty'
import { formatNum } from '../utils/formatNumber'

const props = withDefaults(defineProps<{
  debtAmount: number
  dueDate: string | Date
  showTotal?: boolean
  compact?: boolean
}>(), {
  showTotal: true,
  compact: false,
})

const { t } = useI18n()
const detailsOpen = ref(false)

const penalty = computed(() => calculatePenalty(props.debtAmount, props.dueDate))
const overdueDays = computed(() => penalty.value.overdueDays)
const dailyPenalty = computed(() => penalty.value.dailyPenalty)
const totalPenalty = computed(() => penalty.value.totalPenalty)
const capReached = computed(() => penalty.value.capReached)
const totalToPay = computed(() => penalty.value.totalToPay)

const dueDateFormatted = computed(() => {
  if (typeof props.dueDate === 'string') return props.dueDate
  const d = props.dueDate
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}.${mm}.${yyyy}`
})
</script>

<template>
  <!-- Compact mode: single inline line -->
  <span v-if="compact && overdueDays > 0" class="penalty-info-compact">
    + {{ t('penaltyInfo.title').toLowerCase() }} {{ formatNum(totalPenalty, 0) }} {{ t('penalty.som') }} ({{ overdueDays }} {{ t('penaltyInfo.daysUnit') }})
  </span>

  <!-- Normal mode: full card -->
  <div v-else-if="!compact && overdueDays > 0" class="penalty-info">
    <!-- Header -->
    <div class="penalty-info-header">
      <span class="penalty-info-title">
        <svg class="penalty-info-icon" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
        </svg>
        {{ t('penaltyInfo.title') }}
      </span>
      <button @click="detailsOpen = !detailsOpen" class="penalty-info-toggle">
        {{ detailsOpen ? t('penaltyInfo.hide') : t('penaltyInfo.details') }} {{ detailsOpen ? '\u25B4' : '\u25BE' }}
      </button>
    </div>

    <!-- Summary -->
    <div class="penalty-info-summary">
      <span class="penalty-info-amount">{{ formatNum(totalPenalty, 0) }} {{ t('penalty.som') }}</span>
      <span class="penalty-info-days">{{ overdueDays }} {{ t('penaltyInfo.daysUnit') }}</span>
      <span class="penalty-info-basis">{{ t('penaltyInfo.legalBasis') }}</span>
    </div>

    <!-- Expandable details -->
    <div v-if="detailsOpen" class="penalty-details">
      <div class="penalty-details-row">
        <span class="penalty-details-label">{{ t('penaltyInfo.debtAmount') }}</span>
        <span class="penalty-details-value">{{ formatNum(props.debtAmount, 2) }} {{ t('penalty.som') }}</span>
      </div>
      <div class="penalty-details-row">
        <span class="penalty-details-label">{{ t('penaltyInfo.dueDate') }}</span>
        <span class="penalty-details-value">{{ dueDateFormatted }}</span>
      </div>
      <div class="penalty-details-row">
        <span class="penalty-details-label">{{ t('penaltyInfo.overdueDays') }}</span>
        <span class="penalty-details-value">{{ overdueDays }} {{ t('penaltyInfo.daysUnit') }}</span>
      </div>
      <div class="penalty-details-row">
        <span class="penalty-details-label">{{ t('penaltyInfo.dailyRate') }}</span>
        <span class="penalty-details-value">{{ t('penaltyInfo.dailyRateValue') }}</span>
      </div>
      <div class="penalty-details-sep"></div>
      <div class="penalty-details-row">
        <span class="penalty-details-label">{{ t('penaltyInfo.dailyPenalty') }}</span>
        <span class="penalty-details-value">{{ formatNum(dailyPenalty, 2) }} {{ t('penalty.som') }}</span>
      </div>
      <div class="penalty-details-row">
        <span class="penalty-details-label">{{ t('penaltyInfo.totalPenalty') }}</span>
        <span class="penalty-details-value penalty-details-value--accent">{{ formatNum(totalPenalty, 2) }} {{ t('penalty.som') }}</span>
      </div>
      <div class="penalty-details-row">
        <span class="penalty-details-label">{{ t('penaltyInfo.limit') }}</span>
        <span v-if="!capReached" class="penalty-details-value">{{ t('penaltyInfo.limitNotReached') }}</span>
        <span v-else class="penalty-details-value penalty-details-value--warn">{{ t('penaltyInfo.limitReached') }}</span>
      </div>
    </div>

    <!-- Total to pay -->
    <div v-if="showTotal" class="penalty-total-line">
      <span class="penalty-total-label">{{ t('penaltyInfo.totalToPay') }}</span>
      <span class="penalty-total-value">{{ formatNum(totalToPay, 0) }} {{ t('penalty.som') }}</span>
    </div>
  </div>
</template>

<style scoped>
.penalty-info {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px 24px;
}

.penalty-info-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.penalty-info-title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
  font-weight: 600;
  color: #64748b;
}

.penalty-info-icon {
  width: 18px;
  height: 18px;
  color: #94a3b8;
  flex-shrink: 0;
}

.penalty-info-toggle {
  background: none;
  border: none;
  font-size: 13px;
  color: #64748b;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background 0.15s;
}
.penalty-info-toggle:hover {
  background: #e2e8f0;
}

.penalty-info-summary {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.penalty-info-amount {
  font-size: 20px;
  font-weight: 700;
  color: #d97706;
}

.penalty-info-days {
  display: inline-flex;
  align-items: center;
  font-size: 13px;
  font-weight: 500;
  color: #92400e;
  background: #fef3c7;
  border-radius: 6px;
  padding: 2px 10px;
}

.penalty-info-basis {
  font-size: 11px;
  color: #94a3b8;
}

.penalty-details {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 24px;
  font-size: 13px;
}

.penalty-details-sep {
  grid-column: 1 / -1;
  border-top: 1px solid #e2e8f0;
  margin: 4px 0;
}

.penalty-details-label {
  color: #64748b;
}

.penalty-details-value {
  text-align: right;
  font-weight: 600;
  color: #1e293b;
}

.penalty-details-value--accent {
  color: #d97706;
  font-weight: 700;
}

.penalty-details-value--warn {
  color: #dc2626;
  font-size: 12px;
  font-weight: 600;
}

.penalty-total-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #e2e8f0;
}

.penalty-total-label {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
}

.penalty-total-value {
  font-size: 18px;
  font-weight: 900;
  color: #1e293b;
}

/* Compact inline mode */
.penalty-info-compact {
  display: inline;
  font-size: 12px;
  font-weight: 500;
  color: #d97706;
}
</style>
