<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import DataTable from '@/components/dashboard/DataTable.vue'
import EmptyState from '@/components/dashboard/EmptyState.vue'
import PaymentPanel from '@/components/payment/PaymentPanel.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { useCalculationStore } from '@/stores/calculations'
import { useAccountStore } from '@/stores/account'
import { CalcStatus, statusI18nKey } from '@/constants/statuses'
import { calculatePenalty, getOverdueDays } from '@/utils/penalty'
import { getStatusStyle, calcRowClass } from '@/helpers/calculatorHelpers'
import { formatNum } from '@/utils/formatNumber'
import { generateCalculationExcel } from '@/utils/excelExport'
import { toastStore } from '@/stores/toast'

const emit = defineEmits<{
  (e: 'new-calc'): void
}>()

const { t } = useI18n()
const router = useRouter()
const calcStore = useCalculationStore()
const account = useAccountStore()

const expandedCalcId = ref<number | null>(null)
const togglePayment = (id: number) => {
  expandedCalcId.value = expandedCalcId.value === id ? null : id
}

const companyData = computed(() => ({
  name: account.myAccount?.company || '',
  inn: account.myAccount?.inn || '',
}))

const downloadExcel = (calcId: number) => {
  const calc = calcStore.getCalculationById(calcId)
  if (!calc) return
  const recon = account.getReconciliationForCalculation(calc.id)
  generateCalculationExcel(calc, companyData.value, recon)
}

const deleteTarget = ref<{ id: number; number: string } | null>(null)
const showDeleteConfirm = ref(false)

const openDeleteConfirm = (id: number, number: string) => {
  deleteTarget.value = { id, number }
  showDeleteConfirm.value = true
}

const confirmDelete = async () => {
  if (!deleteTarget.value) return
  showDeleteConfirm.value = false
  await calcStore.deleteCalculation(deleteTarget.value.id)
  deleteTarget.value = null
}

const onRowClick = (row: any) => {
  router.push({ path: `/business/calculations/${row.id}`, query: { from: 'calculations' } })
}

const columns = computed(() => [
  { key: 'number', label: t('businessCalc.colNumber'), width: '14%' },
  { key: 'period', label: t('businessCalc.colPeriod'), width: '10%' },
  { key: 'amount', label: t('businessCalc.colAmount'), width: '16%' },
  { key: 'createdAt', label: t('businessCalc.colCalcDate'), width: '12%' },
  { key: 'status', label: t('businessCalc.colStatus'), width: '14%' },
])

const rows = computed(() => {
  return calcStore.myCalculations.map(c => {
    let penaltyInfo: { overdueDays: number; totalPenalty: number } | null = null
    if (c.dueDate && c.status !== CalcStatus.PAID && c.totalAmount > 0) {
      const days = getOverdueDays(c.dueDate)
      if (days > 0) {
        const p = calculatePenalty(c.totalAmount, c.dueDate)
        penaltyInfo = { overdueDays: p.overdueDays, totalPenalty: p.totalPenalty }
      }
    }
    return {
      ...c,
      amount: c.totalAmount.toLocaleString() + ' ' + t('businessCalc.som'),
      createdAt: c.date,
      parentNumber: c.parentId ? calcStore.getCalculationById(c.parentId)?.number : undefined,
      penaltyInfo,
    }
  })
})
</script>

<template>
  <div class="history-card">
    <div class="history-card__header">
      <div class="history-card__title-wrap">
        <div class="history-card__icon">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h2 class="history-card__title">{{ $t('businessCalc.historyTitle') }}</h2>
          <p class="history-card__subtitle">{{ $t('businessCalc.historySubtitle') }}</p>
        </div>
        <span v-if="rows.length > 0" class="history-card__count">{{ rows.length }}</span>
      </div>
      <button @click="emit('new-calc')" class="history-card__new-btn">
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        {{ $t('businessCalc.newCalcBtn') }}
      </button>
    </div>

    <DataTable :columns="columns" :data="rows" :actions="true" :rowClass="calcRowClass" @row-click="onRowClick">
      <template #empty>
        <EmptyState
          :icon="'<svg class=&quot;w-10 h-10&quot; fill=&quot;none&quot; viewBox=&quot;0 0 40 40&quot; stroke=&quot;currentColor&quot; stroke-width=&quot;1.5&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; d=&quot;M15 11.67h10m0 16.66v-5m-5 5h.017M15 28.33h.017M15 23.33h.017M20 23.33h.017M25 18.33h.017M20 18.33h.017M15 18.33h.017M11.67 35h16.66A3.33 3.33 0 0031.67 31.67V8.33A3.33 3.33 0 0028.33 5H11.67A3.33 3.33 0 008.33 8.33v23.34A3.33 3.33 0 0011.67 35z&quot;/></svg>'"
          :title="$t('businessCalc.emptyTitle')"
          :description="$t('businessCalc.emptyDescription')"
          :actionLabel="$t('businessCalc.emptyAction')"
          @action="emit('new-calc')"
        />
      </template>
      <template #cell-number="{ value, row }">
        <div class="cell-number">
          <span class="cell-number__value">{{ value }}</span>
          <div v-if="row.parentNumber" class="cell-number__resubmit">{{ $t('businessCalc.resubmitted', { number: row.parentNumber }) }}</div>
        </div>
      </template>
      <template #cell-period="{ value }">
        <span class="cell-period">{{ value }}</span>
      </template>
      <template #cell-createdAt="{ value }">
        <span class="cell-date">{{ value }}</span>
      </template>
      <template #cell-amount="{ value, row }">
        <div class="amount-cell">
          <span class="amount-cell__value">{{ value }}</span>
          <div v-if="row.penaltyInfo" class="amount-cell__penalty">
            <svg class="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {{ $t('businessCalc.amountPenalty', { amount: formatNum(row.penaltyInfo.totalPenalty, 0), days: row.penaltyInfo.overdueDays }) }}
          </div>
          <div v-if="row.penaltyInfo" class="amount-cell__total">
            {{ $t('businessCalc.amountTotal', { amount: formatNum(row.totalAmount + row.penaltyInfo.totalPenalty, 0) }) }}
          </div>
        </div>
      </template>
      <template #cell-status="{ value, row }">
        <div class="status-cell">
          <span class="status-badge" :style="getStatusStyle(value)">
            <svg v-if="value === 'paid' || value === 'completed'" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
            <svg v-if="value === 'rejected' || value === 'payment_rejected'" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            {{ $t(statusI18nKey[value] || value) }}
          </span>
          <div v-if="(value === 'rejected' || value === 'payment_rejected') && row.rejectionReason" class="status-reason">
            {{ row.rejectionReason }}
          </div>
        </div>
      </template>
      <template #actions="{ row }">
        <div class="act-wrap" @click.stop>
          <template v-if="row.status === 'draft'">
            <button @click="calcStore.submitForReview(row.id)" class="act-btn act-btn--filled act-btn--green">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
              {{ $t('businessCalc.sendBtn') }}
            </button>
            <router-link :to="{ path: '/business/calculations/' + row.id, query: { from: 'calculations', edit: 'true' } }" class="act-btn act-btn--outline">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              {{ $t('businessCalc.editBtn') }}
            </router-link>
            <button class="act-icon act-icon--red" :title="$t('businessCalc.deleteBtn')" @click="openDeleteConfirm(row.id, row.number)">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </template>
          <template v-else-if="row.status === 'under_review'">
            <router-link :to="{ path: '/business/calculations/' + row.id, query: { from: 'calculations' } }" class="act-btn act-btn--outline">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              {{ $t('businessCalc.viewBtn') }}
            </router-link>
          </template>
          <template v-else-if="row.status === 'approved'">
            <button @click="togglePayment(row.id)" :class="['act-btn act-btn--filled', expandedCalcId === row.id ? 'act-btn--gray' : 'act-btn--green']">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
              {{ expandedCalcId === row.id ? $t('paymentPanel.close') : $t('businessCalc.payBtn') }} {{ expandedCalcId !== row.id ? formatNum(row.totalAmount, 0) + ' ' + $t('businessCalc.som') : '' }}
            </button>
            <router-link :to="{ path: '/business/calculations/' + row.id, query: { from: 'calculations' } }" class="act-btn act-btn--outline">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              {{ $t('businessCalc.viewBtn') }}
            </router-link>
            <button class="act-icon" :title="$t('businessCalc.downloadPdf')" @click="router.push({ path: '/business/calculations/' + row.id, query: { from: 'calculations', print: 'true' } })">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            </button>
            <button class="act-icon" :title="$t('businessCalc.downloadExcel')" @click="downloadExcel(row.id)">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            </button>
          </template>
          <template v-else-if="row.status === 'submitted' || row.status === 'in_review'">
            <router-link :to="{ path: '/business/calculations/' + row.id, query: { from: 'calculations' } }" class="act-btn act-btn--outline">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              {{ $t('businessCalc.viewBtn') }}
            </router-link>
          </template>
          <template v-else-if="row.status === 'revision'">
            <router-link :to="{ path: '/business/calculations/' + row.id, query: { from: 'calculations', edit: 'true' } }" class="act-btn act-btn--filled act-btn--orange">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              {{ $t('businessCalc.fixBtn') }}
            </router-link>
            <router-link :to="{ path: '/business/calculations/' + row.id, query: { from: 'calculations' } }" class="act-btn act-btn--outline">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              {{ $t('businessCalc.viewBtn') }}
            </router-link>
          </template>
          <template v-else-if="row.status === 'fee_paid'">
            <button @click="togglePayment(row.id)" :class="['act-btn act-btn--filled', expandedCalcId === row.id ? 'act-btn--gray' : 'act-btn--orange']">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {{ expandedCalcId === row.id ? $t('paymentPanel.close') : $t('businessCalc.payPenaltyBtn') }}
            </button>
            <router-link :to="{ path: '/business/calculations/' + row.id, query: { from: 'calculations' } }" class="act-btn act-btn--outline">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              {{ $t('businessCalc.viewBtn') }}
            </router-link>
          </template>
          <template v-else-if="row.status === 'completed'">
            <span class="closed-badge">
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
              {{ $t('businessCalc.closedBadge') }}
            </span>
            <router-link :to="{ path: '/business/calculations/' + row.id, query: { from: 'calculations' } }" class="act-btn act-btn--outline">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              {{ $t('businessCalc.viewBtn') }}
            </router-link>
          </template>
          <template v-else-if="row.status === 'paid'">
            <router-link :to="{ path: '/business/calculations/' + row.id, query: { from: 'calculations' } }" class="act-btn act-btn--outline">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              {{ $t('businessCalc.viewBtn') }}
            </router-link>
            <button class="act-icon" :title="$t('businessCalc.downloadPdf')" @click="router.push({ path: '/business/calculations/' + row.id, query: { from: 'calculations', print: 'true' } })">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            </button>
            <button class="act-icon" :title="$t('businessCalc.downloadExcel')" @click="downloadExcel(row.id)">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            </button>
          </template>
          <template v-else-if="row.status === 'rejected'">
            <router-link :to="{ path: '/business/calculations/' + row.id, query: { from: 'calculations', edit: 'true' } }" class="act-btn act-btn--filled act-btn--orange">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              {{ $t('businessCalc.fixBtn') }}
            </router-link>
            <router-link :to="{ path: '/business/calculations/' + row.id, query: { from: 'calculations' } }" class="act-btn act-btn--outline">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              {{ $t('businessCalc.viewBtn') }}
            </router-link>
          </template>
          <template v-else-if="row.status === 'payment_pending'">
            <router-link :to="{ path: '/business/calculations/' + row.id, query: { from: 'calculations' } }" class="act-btn act-btn--outline">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              {{ $t('businessCalc.viewBtn') }}
            </router-link>
          </template>
          <template v-else-if="row.status === 'payment_rejected'">
            <button @click="togglePayment(row.id)" :class="['act-btn act-btn--filled', expandedCalcId === row.id ? 'act-btn--gray' : 'act-btn--orange']">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
              {{ expandedCalcId === row.id ? $t('paymentPanel.close') : $t('businessCalc.confirmPayment') }}
            </button>
            <router-link :to="{ path: '/business/calculations/' + row.id, query: { from: 'calculations' } }" class="act-btn act-btn--outline">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              {{ $t('businessCalc.viewBtn') }}
            </router-link>
          </template>
        </div>
      </template>

      <template #row-after="{ row, colspan }">
        <tr v-if="expandedCalcId === row.id && (row.status === 'approved' || row.status === 'fee_paid' || row.status === 'payment_rejected')" class="payment-expand-row">
          <td :colspan="colspan" class="p-0">
            <PaymentPanel :calculationId="row.id" :modelValue="expandedCalcId === row.id" @close="expandedCalcId = null" />
          </td>
        </tr>
      </template>
    </DataTable>

    <ConfirmDialog
      :visible="showDeleteConfirm"
      icon="danger"
      confirmColor="red"
      :title="$t('businessCalc.deleteConfirmTitle')"
      :message="$t('businessCalc.deleteConfirmMessage', { number: deleteTarget?.number })"
      :confirmText="$t('businessCalc.deleteBtn')"
      @confirm="confirmDelete"
      @cancel="showDeleteConfirm = false"
    />
  </div>
</template>

<style scoped>
.history-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03);
}

.history-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 28px;
  border-bottom: 1px solid #f1f5f9;
  background: linear-gradient(135deg, #f8fafc 0%, #fff 100%);
}

.history-card__title-wrap {
  display: flex;
  align-items: center;
  gap: 14px;
}

.history-card__icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #dbeafe, #eff6ff);
  color: #2563eb;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.history-card__title {
  font-size: 22px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  line-height: 1.3;
}

.history-card__subtitle {
  font-size: 15px;
  color: #94a3b8;
  margin: 2px 0 0;
}

.history-card__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
  padding: 0 9px;
  border-radius: 14px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(37,99,235,0.3);
}

.history-card__new-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 22px;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(245,158,11,0.2);
}

.history-card__new-btn:hover {
  background: linear-gradient(135deg, #d97706, #b45309);
  box-shadow: 0 4px 14px rgba(245, 158, 11, 0.35);
  transform: translateY(-1px);
}

.history-card :deep(.dash-card) {
  border: none;
  border-radius: 0;
  box-shadow: none;
}

@media (max-width: 640px) {
  .history-card__header {
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
    padding: 18px 20px;
  }

  .history-card__new-btn {
    width: 100%;
    justify-content: center;
  }
}

.cell-number {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.cell-number__value {
  font-family: ui-monospace, SFMono-Regular, 'Cascadia Code', monospace;
  font-weight: 700;
  font-size: 15px;
  color: #0d2f79;
  letter-spacing: -0.01em;
}
.cell-number__value:hover {
  text-decoration: underline;
}

.cell-number__resubmit {
  font-size: 12px;
  color: #b45309;
  font-weight: 600;
  margin-top: 2px;
  background: #fffbeb;
  padding: 2px 8px;
  border-radius: 6px;
  display: inline-block;
  width: fit-content;
}

.cell-period {
  display: inline-block;
  padding: 5px 14px;
  background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
  color: #0369a1;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.cell-date {
  font-size: 15px;
  color: #64748b;
  font-weight: 500;
}

.act-wrap {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  align-items: center;
  flex-wrap: wrap;
}
.act-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 20px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 10px;
  cursor: pointer;
  white-space: nowrap;
  text-decoration: none;
  transition: all 0.2s ease;
}
.act-btn--filled {
  color: white;
  border: none;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}
.act-btn--green {
  background: linear-gradient(135deg, #22c55e, #16a34a);
}
.act-btn--green:hover {
  background: linear-gradient(135deg, #16a34a, #15803d);
  box-shadow: 0 4px 12px rgba(34,197,94,0.35);
  transform: translateY(-1px);
}
.act-btn--orange {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}
.act-btn--orange:hover {
  background: linear-gradient(135deg, #d97706, #b45309);
  box-shadow: 0 4px 12px rgba(245,158,11,0.35);
  transform: translateY(-1px);
}
.act-btn--outline {
  background: #fff;
  color: #475569;
  border: 1px solid #e2e8f0;
}
.act-btn--outline:hover {
  background: #f8fafc;
  border-color: #94a3b8;
  color: #1e293b;
}
.act-btn--gray {
  background: #64748b !important;
  color: #fff !important;
}
.act-btn--gray:hover {
  background: #475569 !important;
}

.act-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #fff;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}
.act-icon:hover {
  background: #f1f5f9;
  border-color: #94a3b8;
  color: #1e293b;
  transform: translateY(-1px);
}
.act-icon--red {
  color: #dc2626;
  border-color: #fecaca;
}
.act-icon--red:hover {
  background: #fef2f2;
  border-color: #f87171;
  color: #991b1b;
}

.closed-badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #dcfce7, #bbf7d0);
  color: #166534;
  border-radius: 9999px;
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.status-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border-radius: 20px;
  padding: 5px 14px;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  width: fit-content;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.status-reason {
  font-size: 13px;
  color: #991b1b;
  line-height: 1.4;
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.amount-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.amount-cell__value {
  font-weight: 800;
  font-size: 16px;
  color: #0f172a;
  letter-spacing: -0.01em;
}
.amount-cell__penalty {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 700;
  color: #92400e;
  background: linear-gradient(135deg, #fffbeb, #fef3c7);
  border: 1px solid #fde68a;
  border-radius: 6px;
  padding: 3px 10px;
  width: fit-content;
}
.amount-cell__total {
  font-size: 15px;
  font-weight: 800;
  color: #0f172a;
  margin-top: 2px;
}

:deep(.calc-row--paid td:first-child) {
  box-shadow: inset 4px 0 0 #22c55e;
}
:deep(.calc-row--accepted td:first-child) {
  box-shadow: inset 4px 0 0 #3b82f6;
}
:deep(.calc-row--review td:first-child) {
  box-shadow: inset 4px 0 0 #f59e0b;
}
:deep(.calc-row--draft td:first-child) {
  box-shadow: inset 4px 0 0 #d1d5db;
}
:deep(.calc-row--rejected td:first-child) {
  box-shadow: inset 4px 0 0 #ef4444;
}
:deep(.calc-row--rejected) {
  background: #fffbeb !important;
}
:deep(.calc-row--rejected.table-row:hover) {
  background: #fef9c3 !important;
}
:deep(.calc-row--pay-review td:first-child) {
  box-shadow: inset 4px 0 0 #f97316;
}
:deep(.calc-row--pay-rejected td:first-child) {
  box-shadow: inset 4px 0 0 #ef4444;
}

.calc-row--fee-paid { border-left: 3px solid #f59e0b; }
.calc-row--penalty-paid { border-left: 3px solid #3b82f6; }
.calc-row--completed { border-left: 3px solid #059669; }

.payment-expand-row td {
  padding: 0 !important;
  border-bottom: none;
}
</style>
