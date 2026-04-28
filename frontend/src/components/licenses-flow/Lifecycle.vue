<script setup lang="ts">
import { computed } from 'vue'
import type { LicenseApplicationStatus } from '../../types/licenses'

const props = defineProps<{ status: LicenseApplicationStatus }>()

type Step = { id: string; label: string; icon: 'draft' | 'bolt' | 'send' | 'eye' | 'pin' | 'stamp' }
const STEPS: Step[] = [
  { id: 'draft', label: 'Черновик', icon: 'draft' },
  { id: 'payment_pending', label: 'Оплата', icon: 'bolt' },
  { id: 'submitted', label: 'Подана', icon: 'send' },
  { id: 'under_review', label: 'Рассмотрение', icon: 'eye' },
  { id: 'site_visit_done', label: 'Выезд', icon: 'pin' },
  { id: 'approved', label: 'Выдана', icon: 'stamp' },
]

const order: Record<LicenseApplicationStatus, number> = {
  draft: 0,
  payment_pending: 1,
  submitted: 2,
  under_review: 3,
  site_visit_done: 4,
  approved: 5,
  rejected: 5,
}

const currentIdx = computed(() => order[props.status])
const isRejected = computed(() => props.status === 'rejected')

function stateFor(i: number): 'done' | 'active' | 'future' | 'rejected' {
  if (isRejected.value && i === 5) return 'rejected'
  if (i < currentIdx.value) return 'done'
  if (i === currentIdx.value) return 'active'
  return 'future'
}
</script>

<template>
  <div class="lifecycle">
    <template v-for="(s, i) in STEPS" :key="s.id">
      <div class="lifecycle__item" :class="[`lifecycle__item--${stateFor(i)}`]">
        <span class="lifecycle__bubble">
          <svg v-if="stateFor(i) === 'done'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <path d="M5 12l5 5L20 7" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <svg v-else-if="stateFor(i) === 'rejected'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <path d="M6 6l12 12M18 6L6 18" stroke-linecap="round" />
          </svg>
          <span v-else>{{ i + 1 }}</span>
        </span>
        <span class="lifecycle__label">{{ s.label }}</span>
      </div>
      <div
        v-if="i < STEPS.length - 1"
        class="lifecycle__bar"
        :class="{
          'lifecycle__bar--done': i < currentIdx,
          'lifecycle__bar--active': i === currentIdx - 1,
        }"
      />
    </template>
  </div>
</template>

<style scoped>
.lifecycle {
  display: flex;
  align-items: center;
  gap: 4px;
  overflow-x: auto;
}
.lifecycle__item {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-width: 88px;
  padding: 2px 4px;
}
.lifecycle__bubble {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 13px;
  font-weight: 700;
  transition: all 0.15s ease;
}
.lifecycle__item--future .lifecycle__bubble {
  background: #fff;
  color: var(--lf-ink-4);
  border: 2px solid var(--lf-line);
}
.lifecycle__item--active .lifecycle__bubble {
  background: var(--lf-indigo);
  color: #fff;
  box-shadow: 0 0 0 4px var(--lf-indigo-050);
  animation: lf-pulse 1.8s ease-in-out infinite;
}
.lifecycle__item--done .lifecycle__bubble {
  background: var(--lf-brand);
  color: #fff;
}
.lifecycle__item--rejected .lifecycle__bubble {
  background: var(--lf-rose);
  color: #fff;
}
.lifecycle__label {
  font-size: 12px;
  color: var(--lf-ink-3);
  white-space: nowrap;
  font-weight: 500;
}
.lifecycle__item--active .lifecycle__label {
  color: var(--lf-ink);
  font-weight: 700;
}
.lifecycle__item--done .lifecycle__label {
  color: var(--lf-ink-2);
}
.lifecycle__bar {
  flex: 1;
  height: 2px;
  background: var(--lf-line);
  border-radius: 1px;
  min-width: 16px;
  margin-bottom: 22px;
  transition: background 0.2s ease;
}
.lifecycle__bar--done {
  background: var(--lf-brand);
}
.lifecycle__bar--active {
  background: linear-gradient(90deg, var(--lf-brand), var(--lf-accent));
}

@keyframes lf-pulse {
  0%, 100% { box-shadow: 0 0 0 4px var(--lf-indigo-050); }
  50% { box-shadow: 0 0 0 8px rgba(79, 70, 229, 0.12); }
}

@media (max-width: 720px) {
  .lifecycle__label {
    display: none;
  }
  .lifecycle__item {
    min-width: 0;
  }
  .lifecycle__bar {
    margin-bottom: 0;
  }
}
</style>
