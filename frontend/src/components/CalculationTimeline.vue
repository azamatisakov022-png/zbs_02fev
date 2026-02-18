<script setup lang="ts">
import { computed } from 'vue'
import type { CalculationStatus } from '../stores/calculations'

interface TimelineDates {
  created?: string
  submitted?: string
  reviewed?: string
  approved?: string
  invoiced?: string
  paid?: string
  rejected?: string
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

const steps = computed<Step[]>(() => {
  const isRejected = props.status === 'Отклонено'

  const baseSteps = [
    { key: 'created', label: 'Создан' },
    { key: 'submitted', label: 'Отправлен' },
    { key: 'reviewed', label: 'На проверке' },
  ]

  if (isRejected) {
    baseSteps.push({ key: 'rejected', label: 'Отклонён' })
  } else {
    baseSteps.push(
      { key: 'approved', label: 'Принят' },
      { key: 'invoiced', label: 'Счёт' },
      { key: 'paid', label: 'Оплачен' },
    )
  }

  // Determine current step index
  let currentIdx: number
  switch (props.status) {
    case 'Черновик': currentIdx = 0; break
    case 'На проверке': currentIdx = 2; break
    case 'Принято': currentIdx = 3; break
    case 'Оплата на проверке': currentIdx = 4; break
    case 'Оплачено': currentIdx = 5; break
    case 'Оплата отклонена': currentIdx = 3; break
    case 'Отклонено': currentIdx = 3; break
    default: currentIdx = 0
  }

  return baseSteps.map((s, i) => {
    let state: Step['state']
    if (isRejected) {
      if (i < 3) state = 'completed'
      else state = 'rejected'
    } else if (props.status === 'Оплачено') {
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

const getLineClass = (stepIndex: number) => {
  const state = steps.value[stepIndex].state
  if (state === 'completed') return 'tl__line--green'
  if (state === 'current') return 'tl__line--green'
  if (state === 'rejected') return 'tl__line--red'
  return 'tl__line--gray'
}
</script>

<template>
  <div class="tl-card">
    <!-- Desktop: horizontal timeline -->
    <div class="tl hidden md:flex">
      <template v-for="(step, i) in steps" :key="step.key">
        <!-- Connecting line before step (except first) -->
        <div v-if="i > 0" class="tl__line" :class="getLineClass(i)"></div>
        <!-- Step -->
        <div class="tl__step">
          <!-- Circle -->
          <div
            :class="[
              'tl__circle',
              step.state === 'completed' ? 'tl__circle--done' : '',
              step.state === 'current' ? 'tl__circle--current' : '',
              step.state === 'rejected' ? 'tl__circle--rejected' : '',
              step.state === 'future' ? 'tl__circle--future' : '',
            ]"
          >
            <!-- Completed: checkmark -->
            <svg v-if="step.state === 'completed'" class="tl__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
            </svg>
            <!-- Rejected: X -->
            <svg v-else-if="step.state === 'rejected'" class="tl__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <!-- Current: pulsing dot -->
            <span v-else-if="step.state === 'current'" class="tl__pulse"></span>
          </div>
          <!-- Label -->
          <span
            :class="[
              'tl__label',
              step.state === 'current' ? 'tl__label--current' : '',
              step.state === 'rejected' ? 'tl__label--rejected' : '',
              step.state === 'future' ? 'tl__label--future' : '',
            ]"
          >{{ step.label }}</span>
          <!-- Date -->
          <span v-if="step.date" class="tl__date">{{ step.date }}</span>
        </div>
      </template>
      <!-- After rejected: retry hint -->
      <template v-if="status === 'Отклонено'">
        <div class="tl__line tl__line--gray"></div>
        <div class="tl__step">
          <div class="tl__circle tl__circle--retry">
            <svg class="tl__icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <span class="tl__label tl__label--retry">Исправить</span>
        </div>
      </template>
    </div>

    <!-- Mobile: vertical timeline -->
    <div class="tl-vert md:hidden">
      <template v-for="(step, i) in steps" :key="step.key">
        <div class="tl-vert__row">
          <div class="tl-vert__track">
            <!-- Circle -->
            <div
              :class="[
                'tl__circle tl__circle--sm',
                step.state === 'completed' ? 'tl__circle--done' : '',
                step.state === 'current' ? 'tl__circle--current' : '',
                step.state === 'rejected' ? 'tl__circle--rejected' : '',
                step.state === 'future' ? 'tl__circle--future' : '',
              ]"
            >
              <svg v-if="step.state === 'completed'" class="tl__icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
              </svg>
              <svg v-else-if="step.state === 'rejected'" class="tl__icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span v-else-if="step.state === 'current'" class="tl__pulse-sm"></span>
            </div>
            <!-- Vertical line below (except last) -->
            <div v-if="i < steps.length - 1" class="tl-vert__line" :class="getLineClass(i + 1)"></div>
          </div>
          <div class="tl-vert__content">
            <span
              :class="[
                'tl__label',
                step.state === 'current' ? 'tl__label--current' : '',
                step.state === 'rejected' ? 'tl__label--rejected' : '',
                step.state === 'future' ? 'tl__label--future' : '',
              ]"
            >{{ step.label }}</span>
            <span v-if="step.date" class="tl__date">{{ step.date }}</span>
          </div>
        </div>
      </template>
      <!-- After rejected: retry -->
      <template v-if="status === 'Отклонено'">
        <div class="tl-vert__row">
          <div class="tl-vert__track">
            <div class="tl__circle tl__circle--sm tl__circle--retry">
              <svg class="tl__icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
          </div>
          <div class="tl-vert__content">
            <span class="tl__label tl__label--retry">Исправить</span>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
/* Card wrapper */
.tl-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  padding: 20px 24px;
  margin-bottom: 24px;
}

/* ── Desktop horizontal ── */
.tl {
  display: flex;
  align-items: flex-start;
}
.tl__step {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  min-width: 70px;
}
.tl__line {
  flex: 1;
  height: 2px;
  min-width: 24px;
  margin-top: 15px; /* center vertically with 32px circle */
  background: #d1d5db;
}
.tl__line--green { background: #22c55e; }
.tl__line--red { background: #ef4444; }
.tl__line--gray {
  background: transparent;
  border-top: 2px dashed #d1d5db;
  height: 0;
}

/* Circles */
.tl__circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
}
.tl__circle--sm {
  width: 24px;
  height: 24px;
}
.tl__circle--done {
  background: #22c55e;
  color: white;
}
.tl__circle--current {
  background: white;
  border: 3px solid #22c55e;
}
.tl__circle--rejected {
  background: #ef4444;
  color: white;
}
.tl__circle--future {
  background: white;
  border: 2px solid #d1d5db;
}
.tl__circle--retry {
  background: white;
  border: 2px dashed #f59e0b;
  color: #f59e0b;
}

/* Icons inside circles */
.tl__icon {
  width: 16px;
  height: 16px;
}
.tl__icon-sm {
  width: 12px;
  height: 12px;
}

/* Pulsing dot for current step */
.tl__pulse {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #22c55e;
  animation: pulse-dot 2s ease-in-out infinite;
}
.tl__pulse-sm {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #22c55e;
  animation: pulse-dot 2s ease-in-out infinite;
}
@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.7); }
}

/* Labels */
.tl__label {
  font-size: 12px;
  font-weight: 500;
  color: #374151;
  margin-top: 6px;
  white-space: nowrap;
}
.tl__label--current {
  font-weight: 700;
  color: #16a34a;
}
.tl__label--rejected {
  font-weight: 700;
  color: #dc2626;
}
.tl__label--future {
  color: #9ca3af;
}
.tl__label--retry {
  color: #d97706;
  font-weight: 600;
  font-size: 11px;
}

/* Dates */
.tl__date {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 2px;
}

/* ── Mobile vertical ── */
.tl-vert {
  display: flex;
  flex-direction: column;
}
.tl-vert__row {
  display: flex;
  gap: 12px;
  min-height: 40px;
}
.tl-vert__track {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  width: 24px;
}
.tl-vert__line {
  flex: 1;
  width: 2px;
  min-height: 16px;
  background: #d1d5db;
}
.tl-vert__line.tl__line--green { background: #22c55e; }
.tl-vert__line.tl__line--red { background: #ef4444; }
.tl-vert__line.tl__line--gray {
  background: transparent;
  border-left: 2px dashed #d1d5db;
  width: 0;
}
.tl-vert__content {
  display: flex;
  flex-direction: column;
  padding-bottom: 8px;
}
.tl-vert__content .tl__label {
  margin-top: 2px;
}
</style>
