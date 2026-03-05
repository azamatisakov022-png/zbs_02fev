<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { CalcStatus } from '../constants/statuses'
import type { CalculationStatus } from '@/types/calculation'

const { t } = useI18n()

interface TimelineDates {
  created?: string
  submitted?: string
  reviewed?: string
  approved?: string
  invoiced?: string
  paid?: string
  rejected?: string
  assigned?: string
  feePaid?: string
  penaltyPaid?: string
  revision?: string
  completed?: string
}

interface Props {
  status: CalculationStatus
  dates?: TimelineDates
}

const props = withDefaults(defineProps<Props>(), {
  dates: () => ({})
})

interface Step {
  key: string
  label: string
  date?: string
  state: 'completed' | 'current' | 'rejected' | 'future'
}

const isNewFlow = computed(() => {
  const newStatuses = [CalcStatus.SUBMITTED, CalcStatus.IN_REVIEW, CalcStatus.REVISION, CalcStatus.FEE_PAID, CalcStatus.PENALTY_PAID, CalcStatus.COMPLETED]
  return newStatuses.includes(props.status as any)
})

const steps = computed<Step[]>(() => {
  if (isNewFlow.value) {
    const isRevision = props.status === CalcStatus.REVISION
    const baseSteps = [
      { key: 'created', label: t('timeline.created') },
      { key: 'submitted', label: t('timeline.submitted') },
      { key: 'reviewed', label: t('timeline.underReview') },
    ]

    if (isRevision) {
      baseSteps.push({ key: 'revision', label: t('status.revision') })
    } else {
      baseSteps.push(
        { key: 'approved', label: t('timeline.approved') },
        { key: 'feePaid', label: t('status.feePaid') },
        { key: 'completed', label: t('status.completed') },
      )
    }

    let currentIdx: number
    switch (props.status) {
      case CalcStatus.SUBMITTED: currentIdx = 1; break
      case CalcStatus.IN_REVIEW: currentIdx = 2; break
      case CalcStatus.REVISION: currentIdx = 3; break
      case CalcStatus.APPROVED: currentIdx = 3; break
      case CalcStatus.FEE_PAID: currentIdx = 4; break
      case CalcStatus.PENALTY_PAID: currentIdx = 4; break
      case CalcStatus.COMPLETED: currentIdx = 5; break
      default: currentIdx = 0
    }

    return baseSteps.map((s, i) => {
      let state: Step['state']
      if (isRevision && i === 3) {
        state = 'rejected'
      } else if (props.status === CalcStatus.COMPLETED) {
        state = 'completed'
      } else if (i < currentIdx) {
        state = 'completed'
      } else if (i === currentIdx) {
        state = 'current'
      } else {
        state = 'future'
      }
      return { ...s, date: props.dates?.[s.key as keyof TimelineDates], state }
    })
  }

  const isRejected = props.status === CalcStatus.REJECTED

  const baseSteps = [
    { key: 'created', label: t('timeline.created') },
    { key: 'submitted', label: t('timeline.submitted') },
    { key: 'reviewed', label: t('timeline.underReview') },
  ]

  if (isRejected) {
    baseSteps.push({ key: 'rejected', label: t('timeline.rejected') })
  } else {
    baseSteps.push(
      { key: 'approved', label: t('timeline.approved') },
      { key: 'invoiced', label: t('timeline.invoice') },
      { key: 'paid', label: t('timeline.paid') },
    )
  }

  let currentIdx: number
  switch (props.status) {
    case CalcStatus.DRAFT: currentIdx = 0; break
    case CalcStatus.UNDER_REVIEW: currentIdx = 2; break
    case CalcStatus.APPROVED: currentIdx = 3; break
    case CalcStatus.PAYMENT_PENDING: currentIdx = 4; break
    case CalcStatus.PAID: currentIdx = 5; break
    case CalcStatus.PAYMENT_REJECTED: currentIdx = 3; break
    case CalcStatus.REJECTED: currentIdx = 3; break
    default: currentIdx = 0
  }

  return baseSteps.map((s, i) => {
    let state: Step['state']
    if (isRejected) {
      if (i < 3) state = 'completed'
      else state = 'rejected'
    } else if (props.status === CalcStatus.PAID) {
      state = 'completed'
    } else if (i < currentIdx) {
      state = 'completed'
    } else if (i === currentIdx) {
      state = 'current'
    } else {
      state = 'future'
    }

    return {
      ...s,
      date: props.dates?.[s.key as keyof TimelineDates],
      state,
    }
  })
})

const getLineState = (stepIndex: number) => {
  const state = steps.value[stepIndex].state
  if (state === 'completed') return 'done'
  if (state === 'current') return 'done'
  if (state === 'rejected') return 'rejected'
  return 'future'
}
</script>

<template>
  <div class="tl-card">
    <div class="tl-header">
      <div class="tl-header__icon-wrap">
        <svg class="tl-header__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      </div>
      <span class="tl-header__title">{{ $t('timeline.progress') }}</span>
    </div>

    <!-- Desktop: horizontal timeline -->
    <div class="tl hidden md:flex">
      <template v-for="(step, i) in steps" :key="step.key">
        <div v-if="i > 0" class="tl__line" :class="'tl__line--' + getLineState(i)"></div>
        <div class="tl__step">
          <div
            :class="[
              'tl__circle',
              'tl__circle--' + step.state,
            ]"
          >
            <svg v-if="step.state === 'completed'" class="tl__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
            </svg>
            <svg v-else-if="step.state === 'rejected'" class="tl__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span v-else-if="step.state === 'current'" class="tl__num">{{ i + 1 }}</span>
            <span v-else class="tl__num tl__num--future">{{ i + 1 }}</span>
          </div>
          <span :class="['tl__label', 'tl__label--' + step.state]">{{ step.label }}</span>
          <span v-if="step.date" class="tl__date">{{ step.date }}</span>
        </div>
      </template>
      <template v-if="status === 'rejected'">
        <div class="tl__line tl__line--retry"></div>
        <div class="tl__step">
          <div class="tl__circle tl__circle--retry">
            <svg class="tl__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <span class="tl__label tl__label--retry-text">{{ $t('timeline.retry') }}</span>
        </div>
      </template>
    </div>

    <!-- Mobile: vertical timeline -->
    <div class="tl-m md:hidden">
      <template v-for="(step, i) in steps" :key="step.key">
        <div class="tl-m__row">
          <div class="tl-m__track">
            <div :class="['tl__circle tl__circle--sm', 'tl__circle--' + step.state]">
              <svg v-if="step.state === 'completed'" class="tl__icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
              </svg>
              <svg v-else-if="step.state === 'rejected'" class="tl__icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span v-else-if="step.state === 'current'" class="tl__num-sm">{{ i + 1 }}</span>
              <span v-else class="tl__num-sm tl__num--future">{{ i + 1 }}</span>
            </div>
            <div v-if="i < steps.length - 1" class="tl-m__line" :class="'tl-m__line--' + getLineState(i + 1)"></div>
          </div>
          <div class="tl-m__content">
            <span :class="['tl__label', 'tl__label--' + step.state]">{{ step.label }}</span>
            <span v-if="step.date" class="tl__date">{{ step.date }}</span>
          </div>
        </div>
      </template>
      <template v-if="status === 'rejected'">
        <div class="tl-m__row">
          <div class="tl-m__track">
            <div class="tl__circle tl__circle--sm tl__circle--retry">
              <svg class="tl__icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
          </div>
          <div class="tl-m__content">
            <span class="tl__label tl__label--retry-text">{{ $t('timeline.retry') }}</span>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.tl-card {
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  padding: 24px;
  margin-bottom: 24px;
}

.tl-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}
.tl-header__icon-wrap {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #6366f1, #818cf8);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.tl-header__icon {
  width: 20px;
  height: 20px;
  color: white;
}
.tl-header__title {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
}

/* ── Desktop horizontal ── */
.tl {
  display: flex;
  align-items: flex-start;
  padding: 8px 0;
}
.tl__step {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  min-width: 90px;
}
.tl__line {
  flex: 1;
  height: 3px;
  min-width: 24px;
  margin-top: 19px;
  border-radius: 2px;
  transition: background 0.3s;
}
.tl__line--done {
  background: linear-gradient(90deg, #6366f1, #818cf8);
}
.tl__line--rejected {
  background: #ef4444;
}
.tl__line--future {
  background: #e2e8f0;
}
.tl__line--retry {
  background: transparent;
  border-top: 3px dashed #d1d5db;
  height: 0;
}

/* ── Circles ── */
.tl__circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  transition: all 0.3s;
}
.tl__circle--sm {
  width: 32px;
  height: 32px;
}
.tl__circle--completed {
  background: linear-gradient(135deg, #6366f1, #818cf8);
  color: white;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}
.tl__circle--current {
  background: white;
  border: 3px solid #6366f1;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15);
}
.tl__circle--rejected {
  background: linear-gradient(135deg, #ef4444, #f87171);
  color: white;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}
.tl__circle--future {
  background: #f1f5f9;
  border: 2px solid #cbd5e1;
}
.tl__circle--retry {
  background: white;
  border: 2px dashed #f59e0b;
  color: #f59e0b;
}

/* ── Icons ── */
.tl__icon {
  width: 20px;
  height: 20px;
}
.tl__icon-sm {
  width: 15px;
  height: 15px;
}

/* ── Step numbers ── */
.tl__num {
  font-size: 15px;
  font-weight: 700;
  color: #6366f1;
}
.tl__num-sm {
  font-size: 13px;
  font-weight: 700;
  color: #6366f1;
}
.tl__num--future {
  color: #94a3b8;
}

/* ── Labels ── */
.tl__label {
  font-size: 14px;
  font-weight: 500;
  margin-top: 8px;
  white-space: nowrap;
  text-align: center;
}
.tl__label--completed {
  color: #1e293b;
  font-weight: 600;
}
.tl__label--current {
  font-weight: 700;
  color: #4f46e5;
}
.tl__label--rejected {
  font-weight: 700;
  color: #dc2626;
}
.tl__label--future {
  color: #94a3b8;
}
.tl__label--retry-text {
  color: #d97706;
  font-weight: 600;
  font-size: 13px;
}

/* ── Dates ── */
.tl__date {
  font-size: 13px;
  color: #64748b;
  margin-top: 4px;
}

/* ── Mobile vertical ── */
.tl-m {
  display: flex;
  flex-direction: column;
}
.tl-m__row {
  display: flex;
  gap: 14px;
  min-height: 52px;
}
.tl-m__track {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  width: 32px;
}
.tl-m__line {
  flex: 1;
  width: 3px;
  min-height: 16px;
  border-radius: 2px;
}
.tl-m__line--done {
  background: linear-gradient(180deg, #6366f1, #818cf8);
}
.tl-m__line--rejected {
  background: #ef4444;
}
.tl-m__line--future {
  background: #e2e8f0;
}
.tl-m__content {
  display: flex;
  flex-direction: column;
  padding-bottom: 8px;
}
.tl-m__content .tl__label {
  margin-top: 4px;
  text-align: left;
}
</style>
