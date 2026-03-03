<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import SkeletonLoader from '../../components/dashboard/SkeletonLoader.vue'
import DataTable from '../../components/dashboard/DataTable.vue'
import EmptyState from '../../components/dashboard/EmptyState.vue'
import { productGroups } from '../../data/product-groups'
import { generateCalculationExcel } from '../../utils/excelExport'
import { useCalculationStore } from '../../stores/calculations'
import { useAccountStore } from '../../stores/account'
import { CalcStatus, statusI18nKey } from '../../constants/statuses'
import { calculatePenalty, getOverdueDays } from '../../utils/penalty'
import { formatNum } from '../../utils/formatNumber'
import InstructionDrawer from '../../components/InstructionDrawer.vue'
import { instructionCalculationHtml } from '../../data/instructionCalculation'
import { useBusinessMenu } from '../../composables/useRoleMenu'
import { toastStore } from '../../stores/toast'
import ConfirmDialog from '../../components/common/ConfirmDialog.vue'
import PaymentPanel from '../../components/payment/PaymentPanel.vue'

const { roleTitle, menuItems } = useBusinessMenu()
const { t } = useI18n()
const router = useRouter()
const account = useAccountStore()
const calcStore = useCalculationStore()

const expandedCalcId = ref<number | null>(null)
const togglePayment = (id: number) => {
  expandedCalcId.value = expandedCalcId.value === id ? null : id
}

const mockAction = (action: string) => {
  toastStore.show({ type: 'info', title: action })
}
const isLoading = ref(true)
onMounted(async () => {
  await account.fetchAll()
  await calcStore.fetchMyCalc()
  isLoading.value = false
})

const viewMode = ref<'list'>('list')

const showDraftNotification = ref(false)

const confirmDialog = ref({
  visible: false,
  title: '',
  message: '',
  icon: 'warning' as 'warning' | 'danger' | 'info' | 'success',
  confirmText: '',
  confirmColor: 'green' as 'green' | 'red' | 'orange',
  onConfirm: () => {},
})
const handleConfirm = () => {
  confirmDialog.value.visible = false
  confirmDialog.value.onConfirm()
}
const handleCancel = () => {
  confirmDialog.value.visible = false
}

const showRates = ref(false)
const showInstruction = ref(false)

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

const startWizard = () => {
  router.push('/business/calculator/calculate')
}

const columns = computed(() => [
  { key: 'number', label: t('businessCalc.colNumber'), width: '14%' },
  { key: 'period', label: t('businessCalc.colPeriod'), width: '10%' },
  { key: 'amount', label: t('businessCalc.colAmount'), width: '16%' },
  { key: 'createdAt', label: t('businessCalc.colCalcDate'), width: '12%' },
  { key: 'status', label: t('businessCalc.colStatus'), width: '14%' },
])

const myCalcRows = computed(() => {
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
      id: c.id,
      number: c.number,
      period: c.period,
      amount: c.totalAmount.toLocaleString() + ' ' + t('businessCalc.som'),
      createdAt: c.date,
      status: c.status,
      rejectionReason: c.rejectionReason,
      rejectedAt: c.rejectedAt,
      rejectedBy: c.rejectedBy,
      paymentRejectionReason: c.paymentRejectionReason,
      totalAmount: c.totalAmount,
      parentId: c.parentId,
      parentNumber: c.parentId ? calcStore.getCalculationById(c.parentId)?.number : undefined,
      penaltyInfo,
    }
  })
})

const totalCalcsCount = computed(() => calcStore.myCalculations.length)
const totalPaidAmount = computed(() => {
  return calcStore.myCalculations
    .filter(c => c.status === CalcStatus.PAID || c.status === CalcStatus.COMPLETED)
    .reduce((sum, c) => sum + c.totalAmount, 0)
})
const totalToPayAmount = computed(() => {
  return calcStore.myCalculations
    .filter(c => c.status === CalcStatus.APPROVED || c.status === CalcStatus.FEE_PAID)
    .reduce((sum, c) => sum + c.totalAmount, 0)
})
const lastCalcPeriod = computed(() => {
  if (calcStore.myCalculations.length === 0) return '—'
  return calcStore.myCalculations[0].period || '—'
})

const statusStyles: Record<string, string> = {
  [CalcStatus.DRAFT]: 'background:#F3F4F6;color:#6B7280',
  [CalcStatus.UNDER_REVIEW]: 'background:#FEF3C7;color:#92400E',
  [CalcStatus.APPROVED]: 'background:#D1FAE5;color:#065F46',
  [CalcStatus.PAID]: 'background:#DBEAFE;color:#1D4ED8',
  [CalcStatus.REJECTED]: 'background:#FEE2E2;color:#991B1B',
  [CalcStatus.PAYMENT_PENDING]: 'background:#EDE9FE;color:#6D28D9',
  [CalcStatus.PAYMENT_REJECTED]: 'background:#FEE2E2;color:#991B1B',
  [CalcStatus.FEE_PAID]: 'background:#FEF3C7;color:#92400E',
  [CalcStatus.PENALTY_PAID]: 'background:#DBEAFE;color:#1D4ED8',
  [CalcStatus.COMPLETED]: 'background:#D1FAE5;color:#065F46',
}
const getStatusStyle = (status: string) => statusStyles[status] || 'background:#F3F4F6;color:#6B7280'

const calcRowClass = (row: Record<string, any>) => {
  const map: Record<string, string> = {
    [CalcStatus.PAID]: 'calc-row--paid',
    [CalcStatus.APPROVED]: 'calc-row--accepted',
    [CalcStatus.UNDER_REVIEW]: 'calc-row--review',
    [CalcStatus.DRAFT]: 'calc-row--draft',
    [CalcStatus.REJECTED]: 'calc-row--rejected',
    [CalcStatus.PAYMENT_PENDING]: 'calc-row--pay-review',
    [CalcStatus.PAYMENT_REJECTED]: 'calc-row--pay-rejected',
    [CalcStatus.FEE_PAID]: 'calc-row--fee-paid',
    [CalcStatus.PENALTY_PAID]: 'calc-row--penalty-paid',
    [CalcStatus.COMPLETED]: 'calc-row--completed',
  }
  return map[row.status] || ''
}


</script>

<template>
  <DashboardLayout
    role="business"
    :roleTitle="roleTitle"
    :userName="companyData.name"
    :menuItems="menuItems"
  >
    <!-- Draft saved notification -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showDraftNotification" class="fixed top-6 right-6 z-[200] bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          {{ $t('businessCalc.draftSaved') }}
        </div>
      </Transition>
    </Teleport>

    <!-- LIST VIEW -->
    <template v-if="viewMode === 'list'">
      <div class="content__header mb-6">
        <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b] mb-2">{{ $t('businessCalc.pageTitle') }}</h1>
        <p class="text-[#64748b]">{{ $t('businessCalc.pageSubtitle') }}</p>
      </div>

      <!-- CTA Banner -->
      <div class="mb-6 bg-gradient-to-r from-[#f59e0b] to-[#d97706] rounded-2xl p-6 lg:p-8 text-white relative overflow-hidden">
        <div class="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div class="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        <div class="relative flex flex-col lg:flex-row lg:items-center gap-6">
          <div class="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <svg class="w-8 h-8 lg:w-10 lg:h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div class="flex-1">
            <h2 class="text-xl lg:text-2xl font-bold mb-2">{{ $t('businessCalc.bannerTitle') }}</h2>
            <p class="text-white/80 text-sm lg:text-base">{{ $t('businessCalc.bannerDescription') }}</p>
          </div>
          <button
            @click="startWizard"
            class="flex items-center justify-center gap-2 bg-white text-[#f59e0b] px-6 py-3 lg:px-8 lg:py-4 rounded-xl font-semibold hover:bg-amber-50 transition-colors shadow-lg flex-shrink-0"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            {{ $t('businessCalc.startCalc') }}
          </button>
        </div>
      </div>

      <!-- Info Alert -->
      <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <div class="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
          <svg class="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p class="font-medium text-[#1e293b]">{{ $t('businessCalc.infoTitle') }}</p>
          <p class="text-sm text-[#64748b]">{{ $t('businessCalc.infoDescription') }}
            <button @click="showInstruction = true" class="text-[#2D8B4E] hover:underline font-medium inline-flex items-center gap-1 mt-1">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {{ $t('businessCalc.instructionLink') }}
            </button>
          </p>
        </div>
      </div>

      <template v-if="isLoading">
        <div class="mb-6"><SkeletonLoader variant="card" /></div>
        <SkeletonLoader variant="table" />
      </template>

      <template v-if="!isLoading">
      <!-- Stats -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
          <p class="text-sm text-[#64748b] mb-1">{{ $t('businessCalc.totalCalcs') }}</p>
          <p class="text-2xl font-bold text-[#1e293b]">{{ totalCalcsCount }}</p>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
          <p class="text-sm text-[#64748b] mb-1">{{ $t('businessCalc.paidForYear') }}</p>
          <p class="text-2xl font-bold text-[#10b981]">{{ formatNum(totalPaidAmount, 0) }} {{ $t('businessCalc.som') }}</p>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
          <p class="text-sm text-[#64748b] mb-1">{{ $t('businessCalc.toPay') }}</p>
          <p class="text-2xl font-bold text-[#f59e0b]">{{ formatNum(totalToPayAmount, 0) }} {{ $t('businessCalc.som') }}</p>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
          <p class="text-sm text-[#64748b] mb-1">{{ $t('businessCalc.lastCalc') }}</p>
          <p class="text-2xl font-bold text-[#2563eb]">{{ lastCalcPeriod }}</p>
        </div>
      </div>

      <!-- History Table -->
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
            <span v-if="myCalcRows.length > 0" class="history-card__count">{{ myCalcRows.length }}</span>
          </div>
          <button @click="startWizard" class="history-card__new-btn">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            {{ $t('businessCalc.newCalcBtn') }}
          </button>
        </div>

      <DataTable :columns="columns" :data="myCalcRows" :actions="true" :rowClass="calcRowClass">
        <template #empty>
          <EmptyState
            :icon="'<svg class=&quot;w-10 h-10&quot; fill=&quot;none&quot; viewBox=&quot;0 0 40 40&quot; stroke=&quot;currentColor&quot; stroke-width=&quot;1.5&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; d=&quot;M15 11.67h10m0 16.66v-5m-5 5h.017M15 28.33h.017M15 23.33h.017M20 23.33h.017M25 18.33h.017M20 18.33h.017M15 18.33h.017M11.67 35h16.66A3.33 3.33 0 0031.67 31.67V8.33A3.33 3.33 0 0028.33 5H11.67A3.33 3.33 0 008.33 8.33v23.34A3.33 3.33 0 0011.67 35z&quot;/></svg>'"
            :title="$t('businessCalc.emptyTitle')"
            :description="$t('businessCalc.emptyDescription')"
            :actionLabel="$t('businessCalc.emptyAction')"
            @action="startWizard()"
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
            <span class="font-semibold text-[#1e293b]">{{ value }}</span>
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
          <div class="act-wrap">
            <!-- Черновик: [Отправить (filled green)] [Редактировать (outline)] [⋯ → Удалить] -->
            <template v-if="row.status === 'draft'">
              <button @click="calcStore.submitForReview(row.id)" class="act-btn act-btn--filled act-btn--green">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                {{ $t('businessCalc.sendBtn') }}
              </button>
              <router-link :to="{ path: '/business/calculations/' + row.id, query: { from: 'calculations', edit: 'true' } }" class="act-btn act-btn--outline">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                {{ $t('businessCalc.editBtn') }}
              </router-link>
              <button class="act-icon act-icon--red" :title="$t('businessCalc.deleteBtn')" @click="mockAction($t('businessCalc.deleteBtn') + ' ' + row.number)">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </template>
            <!-- На проверке: [Просмотреть (outline)] -->
            <template v-else-if="row.status === 'under_review'">
              <router-link :to="{ path: '/business/calculations/' + row.id, query: { from: 'calculations' } }" class="act-btn act-btn--outline">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                {{ $t('businessCalc.viewBtn') }}
              </router-link>
            </template>
            <!-- Принято: [Оплатить → PaymentView (filled green)] [Просмотреть (outline)] [⋯ → PDF, Excel] -->
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
            <!-- Подано / На рассмотрении: [Просмотреть (outline)] -->
            <template v-else-if="row.status === 'submitted' || row.status === 'in_review'">
              <router-link :to="{ path: '/business/calculations/' + row.id, query: { from: 'calculations' } }" class="act-btn act-btn--outline">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                {{ $t('businessCalc.viewBtn') }}
              </router-link>
            </template>
            <!-- На доработке: [Исправить (filled orange)] [Просмотреть (outline)] -->
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
            <!-- Сбор оплачен: [Оплатить пеню → PaymentView (filled orange)] [Просмотреть (outline)] -->
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
            <!-- Завершено: [Закрыто badge (green)] [Просмотреть (outline)] -->
            <template v-else-if="row.status === 'completed'">
              <span class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                {{ $t('businessCalc.closedBadge') }}
              </span>
              <router-link :to="{ path: '/business/calculations/' + row.id, query: { from: 'calculations' } }" class="act-btn act-btn--outline">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                {{ $t('businessCalc.viewBtn') }}
              </router-link>
            </template>
            <!-- Оплачено: [Просмотреть (outline)] [⋯ → PDF, Excel] -->
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
            <!-- Отклонено: [Исправить (filled orange)] [Просмотреть (outline)] -->
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
            <!-- Оплата на проверке: [Просмотреть (outline)] -->
            <template v-else-if="row.status === 'payment_pending'">
              <router-link :to="{ path: '/business/calculations/' + row.id, query: { from: 'calculations' } }" class="act-btn act-btn--outline">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                {{ $t('businessCalc.viewBtn') }}
              </router-link>
            </template>
            <!-- Оплата отклонена: [Подтвердить оплату → PaymentView (filled orange)] [Просмотреть (outline)] -->
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
      </div>

      <!-- Rates Info (collapsible) -->
      <div class="mt-6 rounded-2xl border border-[#e2e8f0] overflow-hidden">
        <button
          @click="showRates = !showRates"
          class="w-full flex items-center justify-between px-5 py-4 bg-[#f8fafc] hover:bg-[#f1f5f9] transition-colors text-left"
        >
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-[#94a3b8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="font-medium text-[#64748b]">{{ $t('businessCalc.ratesTitle') }}</span>
            <span v-if="!showRates" class="text-xs text-[#94a3b8] ml-2 hidden sm:inline">{{ $t('businessCalc.ratesExpand') }}</span>
          </div>
          <svg
            :class="['w-5 h-5 text-[#94a3b8] transition-transform duration-300', showRates ? 'rotate-180' : '']"
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          leave-active-class="transition-all duration-200 ease-in"
          enter-from-class="max-h-0 opacity-0"
          enter-to-class="max-h-[500px] opacity-100"
          leave-from-class="max-h-[500px] opacity-100"
          leave-to-class="max-h-0 opacity-0"
        >
          <div v-show="showRates" class="overflow-hidden">
            <div class="px-5 pb-5 pt-3 bg-white border-t border-[#e2e8f0]">
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div v-for="group in productGroups" :key="group.value" class="bg-[#f8fafc] rounded-lg p-3">
                  <p class="text-xs text-[#64748b] mb-1">{{ group.label }}</p>
                  <p class="font-bold text-[#1e293b]">{{ group.baseRate.toLocaleString() }} {{ $t('businessCalc.som') }}</p>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
      </template>
    </template>

    <InstructionDrawer v-model="showInstruction" :title="$t('businessCalc.instructionDrawerTitle')" :contentHtml="instructionCalculationHtml" />
    <ConfirmDialog
      :visible="confirmDialog.visible"
      :title="confirmDialog.title"
      :message="confirmDialog.message"
      :icon="confirmDialog.icon"
      :confirmText="confirmDialog.confirmText"
      :confirmColor="confirmDialog.confirmColor"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    />
  </DashboardLayout>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}


/* ── History card ── */
.history-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06);
}

.history-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;
  background: linear-gradient(to right, #fafbfc, #fff);
}

.history-card__title-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}

.history-card__icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #eff6ff;
  color: #3b82f6;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.history-card__title {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  line-height: 1.3;
}

.history-card__subtitle {
  font-size: 13px;
  color: #94a3b8;
  margin: 2px 0 0;
}

.history-card__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 26px;
  height: 26px;
  padding: 0 8px;
  border-radius: 13px;
  background: #3b82f6;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.history-card__new-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #f59e0b;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
}

.history-card__new-btn:hover {
  background: #d97706;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
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
    gap: 12px;
    padding: 16px;
  }

  .history-card__new-btn {
    width: 100%;
    justify-content: center;
  }
}

/* ── Cell styles ── */
.cell-number__value {
  font-family: ui-monospace, SFMono-Regular, 'Cascadia Code', monospace;
  font-weight: 600;
  font-size: 13px;
  color: #2563eb;
}

.cell-number__resubmit {
  font-size: 11px;
  color: #d97706;
  margin-top: 2px;
}

.cell-period {
  display: inline-block;
  padding: 3px 10px;
  background: #f0f9ff;
  color: #0369a1;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.cell-date {
  font-size: 13px;
  color: #64748b;
  font-weight: 400;
}

/* ── Action buttons ── */
.act-wrap {
  display: flex;
  gap: 6px;
  justify-content: flex-end;
  align-items: center;
  flex-wrap: wrap;
}
.act-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  white-space: nowrap;
  text-decoration: none;
  transition: all 0.15s ease;
}
.act-btn--filled {
  color: white;
  border: none;
}
.act-btn--green { background: #22c55e; }
.act-btn--green:hover { background: #16a34a; box-shadow: 0 2px 8px rgba(34,197,94,0.25); }
.act-btn--orange { background: #f59e0b; }
.act-btn--orange:hover { background: #d97706; box-shadow: 0 2px 8px rgba(245,158,11,0.25); }
.act-btn--outline {
  background: transparent;
  color: #475569;
  border: 1px solid #e2e8f0;
}
.act-btn--outline:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #1e293b;
}

/* Icon-only action button */
.act-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s;
}
.act-icon:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #1e293b;
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

/* ── Status row left-border indicators ── */
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

/* ── Status cell ── */
.status-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border-radius: 12px;
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  width: fit-content;
}

.status-reason {
  font-size: 11px;
  color: #991b1b;
  line-height: 1.4;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* Penalty badge in calc list */
.penalty-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 500;
  color: #DC2626;
  background: #FEF2F2;
  border: 1px solid #FECACA;
  border-radius: 6px;
  padding: 2px 8px;
  margin-top: 4px;
}

/* ── Amount cell 3-line ── */
.amount-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.amount-cell__penalty {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 500;
  color: #d97706;
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 6px;
  padding: 2px 8px;
}
.amount-cell__total {
  font-size: 12px;
  font-weight: 700;
  color: #1e293b;
  margin-top: 2px;
}

/* ── Row status colors (new) ── */
.calc-row--fee-paid { border-left: 3px solid #f59e0b; }
.calc-row--penalty-paid { border-left: 3px solid #3b82f6; }
.calc-row--completed { border-left: 3px solid #059669; }

/* ── Inline payment expand row ── */
.payment-expand-row td {
  padding: 0 !important;
  border-bottom: none;
}

/* ── Gray (collapse) button variant ── */
.act-btn--gray {
  background: #64748b !important;
  color: #fff !important;
}
.act-btn--gray:hover {
  background: #475569 !important;
}
</style>
