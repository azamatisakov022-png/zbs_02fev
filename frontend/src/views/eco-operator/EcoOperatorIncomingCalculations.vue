<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import DataTable from '../../components/dashboard/DataTable.vue'
import EmptyState from '../../components/dashboard/EmptyState.vue'
import { calculationStore, type Calculation } from '../../stores/calculations'
import { productGroups, getSubgroupLabel, getSubgroupData, isPackagingGroup } from '../../data/product-groups'
import { AppButton, AppBadge } from '../../components/ui'
import { getStatusBadgeVariant } from '../../utils/statusVariant'
import { CalcStatus } from '../../constants/statuses'
import { useEcoOperatorMenu } from '../../composables/useRoleMenu'
import SectionGuide from '../../components/common/SectionGuide.vue'

const router = useRouter()
const { t } = useI18n()
const { roleTitle, menuItems } = useEcoOperatorMenu()

// Tabs
const activeTab = ref<'calculations' | 'payments'>('calculations')

// ========================
// CALCULATIONS TAB
// ========================
const columns = computed(() => [
  { key: 'number', label: t('ecoIncomingCalcs.colNumber'), width: '9%' },
  { key: 'company', label: t('ecoIncomingCalcs.colPayer'), width: '14%' },
  { key: 'inn', label: t('ecoIncomingCalcs.colInn'), width: '10%' },
  { key: 'payerTypeLabel', label: t('ecoIncomingCalcs.colType'), width: '8%' },
  { key: 'date', label: t('ecoIncomingCalcs.colDateSubmitted'), width: '8%' },
  { key: 'itemCount', label: t('ecoIncomingCalcs.colItems'), width: '6%' },
  { key: 'totalAmount', label: t('ecoIncomingCalcs.colAmount'), width: '10%' },
  { key: 'status', label: t('ecoIncomingCalcs.colStatus'), width: '10%' },
])

// Filters
const searchQuery = ref('')
const statusFilter = ref('')
const periodFilter = ref('')

const filteredCalculations = computed(() => {
  let list = calculationStore.state.calculations.filter(c => c.status !== CalcStatus.DRAFT)
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(c => c.number.toLowerCase().includes(q) || c.company.toLowerCase().includes(q) || c.inn.includes(q))
  }
  if (statusFilter.value) {
    list = list.filter(c => c.status === statusFilter.value)
  }
  if (periodFilter.value) {
    list = list.filter(c => c.year === periodFilter.value)
  }
  return list
    .sort((a, b) => {
      // Sort by date descending (newer first)
      const da = a.date.split('.').reverse().join('')
      const db = b.date.split('.').reverse().join('')
      return db.localeCompare(da)
    })
    .map(c => ({
      ...c,
      totalAmountFormatted: c.totalAmount.toLocaleString() + ' ' + t('ecoIncomingCalcs.som'),
      payerTypeLabel: c.payerType === 'importer' ? t('ecoIncomingCalcs.importer') : t('ecoIncomingCalcs.producer'),
      itemCount: c.items.length,
    }))
})

// Stats
const totalCount = computed(() => calculationStore.state.calculations.filter(c => c.status !== CalcStatus.DRAFT).length)
const pendingCount = computed(() => calculationStore.state.calculations.filter(c => c.status === CalcStatus.UNDER_REVIEW).length)
const approvedCount = computed(() => calculationStore.state.calculations.filter(c => c.status === CalcStatus.APPROVED || c.status === CalcStatus.PAID || c.status === CalcStatus.PAYMENT_PENDING).length)
const rejectedCount = computed(() => calculationStore.state.calculations.filter(c => c.status === CalcStatus.REJECTED).length)

const getStatusClass = (status: string) => {
  switch (status) {
    case 'draft': return 'bg-gray-100 text-gray-800'
    case 'under_review': return 'bg-yellow-100 text-yellow-800'
    case 'approved': return 'bg-green-100 text-green-800'
    case 'rejected': return 'bg-red-100 text-red-800'
    case 'payment_pending': return 'bg-purple-100 text-purple-800'
    case 'paid': return 'bg-blue-100 text-blue-800'
    case 'payment_rejected': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

// Detail view
const selectedCalculation = ref<Calculation | null>(null)
const showDetail = ref(false)
const rejectionReason = ref('')
const showRejectForm = ref(false)

const openDetail = (row: any) => {
  router.push({ path: `/eco-operator/calculations/${row.id}`, query: { from: 'incoming-calculations' } })
}

const openDetailModal = (row: any) => {
  const calc = calculationStore.state.calculations.find(c => c.id === row.id)
  if (calc) {
    selectedCalculation.value = calc
    showDetail.value = true
    showRejectForm.value = false
    rejectionReason.value = ''
    showPaymentRejectForm.value = false
    paymentRejectionReason.value = ''
  }
}

const closeDetail = () => {
  showDetail.value = false
  selectedCalculation.value = null
  showRejectForm.value = false
  rejectionReason.value = ''
  showPaymentRejectForm.value = false
  paymentRejectionReason.value = ''
}

const approveCalc = () => {
  if (selectedCalculation.value) {
    calculationStore.approveCalculation(selectedCalculation.value.id)
    closeDetail()
  }
}

const rejectCalc = () => {
  if (selectedCalculation.value && rejectionReason.value.trim()) {
    calculationStore.rejectCalculation(selectedCalculation.value.id, rejectionReason.value.trim())
    closeDetail()
  }
}

const getGroupLabel = (value: string) => {
  return productGroups.find(g => g.value === value)?.label || value
}

// ========================
// PAYMENTS TAB
// ========================
const paymentColumns = computed(() => [
  { key: 'number', label: t('ecoIncomingCalcs.colCalcNumber'), width: '10%' },
  { key: 'company', label: t('ecoIncomingCalcs.colOrganization'), width: '18%' },
  { key: 'totalAmount', label: t('ecoIncomingCalcs.colAmount'), width: '10%' },
  { key: 'paymentDate', label: t('ecoIncomingCalcs.colPaymentDate'), width: '10%' },
  { key: 'paymentOrderNumber', label: t('ecoIncomingCalcs.colPaymentOrderNum'), width: '10%' },
  { key: 'status', label: t('ecoIncomingCalcs.colStatus'), width: '12%' },
])

const paymentSearchQuery = ref('')

const paymentPendingCount = computed(() => calculationStore.getPaymentPendingCount())

const filteredPayments = computed(() => {
  let list = calculationStore.state.calculations.filter(c =>
    c.status === CalcStatus.PAYMENT_PENDING || c.status === CalcStatus.PAID || c.status === CalcStatus.PAYMENT_REJECTED
  )
  if (paymentSearchQuery.value) {
    const q = paymentSearchQuery.value.toLowerCase()
    list = list.filter(c => c.number.toLowerCase().includes(q) || c.company.toLowerCase().includes(q))
  }
  return list.map(c => ({
    ...c,
    totalAmountFormatted: c.totalAmount.toLocaleString() + ' ' + t('ecoIncomingCalcs.som'),
    paymentDate: c.payment?.paymentDate || '',
    paymentOrderNumber: c.payment?.paymentOrderNumber || '',
  }))
})

// Payment detail
const showPaymentRejectForm = ref(false)
const paymentRejectionReason = ref('')

const approvePayment = () => {
  if (selectedCalculation.value) {
    calculationStore.approvePayment(selectedCalculation.value.id)
    closeDetail()
  }
}

const rejectPayment = () => {
  if (selectedCalculation.value && paymentRejectionReason.value.trim()) {
    calculationStore.rejectPayment(selectedCalculation.value.id, paymentRejectionReason.value.trim())
    closeDetail()
  }
}

// Empty state helpers
const allCalculations = computed(() => calculationStore.state.calculations.filter(c => c.status !== CalcStatus.DRAFT))
const isCalcFiltersActive = computed(() => !!(searchQuery.value || statusFilter.value || periodFilter.value))

const allPayments = computed(() => calculationStore.state.calculations.filter(c =>
  c.status === CalcStatus.PAYMENT_PENDING || c.status === CalcStatus.PAID || c.status === CalcStatus.PAYMENT_REJECTED
))
const isPaymentFiltersActive = computed(() => !!paymentSearchQuery.value)

const resetCalcFilters = () => {
  searchQuery.value = ''
  statusFilter.value = ''
  periodFilter.value = ''
}

const resetPaymentFilters = () => {
  paymentSearchQuery.value = ''
}
</script>

<template>
  <DashboardLayout
    role="eco-operator"
    :roleTitle="roleTitle"
    userName="ОсОО «ЭкоПереработка»"
    :menuItems="menuItems"
  >
    <div class="mb-6">
      <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b] mb-2">{{ $t('pages.ecoOperator.calculationsTitle') }}</h1>
      <p class="text-[#64748b]">{{ $t('pages.ecoOperator.calculationsSubtitle') }}</p>
    </div>

    <SectionGuide
      :title="$t('ecoIncomingCalcs.guideTitle')"
      :description="$t('ecoIncomingCalcs.guideDescription')"
      :actions="[$t('ecoIncomingCalcs.guideAction1'), $t('ecoIncomingCalcs.guideAction2'), $t('ecoIncomingCalcs.guideAction3'), $t('ecoIncomingCalcs.guideAction4')]"
      storageKey="eco-calculations"
    />

    <!-- Large Dashboard Stat Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-5 border border-yellow-200 shadow-sm">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p class="text-sm font-medium text-yellow-800">{{ $t('ecoIncomingCalcs.statUnderReview') }}</p>
        </div>
        <p class="text-3xl font-bold text-yellow-900">{{ pendingCount }}</p>
        <p class="text-xs text-yellow-600 mt-1">{{ $t('ecoIncomingCalcs.statAwaitingReview') }}</p>
      </div>
      <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-5 border border-purple-200 shadow-sm">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <p class="text-sm font-medium text-purple-800">{{ $t('ecoIncomingCalcs.statPaymentReview') }}</p>
        </div>
        <p class="text-3xl font-bold text-purple-900">{{ paymentPendingCount }}</p>
        <p class="text-xs text-purple-600 mt-1">{{ $t('ecoIncomingCalcs.statAwaitingPaymentConfirm') }}</p>
      </div>
      <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-5 border border-green-200 shadow-sm">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p class="text-sm font-medium text-green-800">{{ $t('ecoIncomingCalcs.statApprovedMonth') }}</p>
        </div>
        <p class="text-3xl font-bold text-green-900">{{ approvedCount }}</p>
        <p class="text-xs text-green-600 mt-1">{{ $t('ecoIncomingCalcs.statCalcsApproved') }}</p>
      </div>
      <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 border border-blue-200 shadow-sm">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <p class="text-sm font-medium text-blue-800">{{ $t('ecoIncomingCalcs.statTotalMonth') }}</p>
        </div>
        <p class="text-3xl font-bold text-blue-900">{{ totalCount }}</p>
        <p class="text-xs text-blue-600 mt-1">{{ $t('ecoIncomingCalcs.statTotalCalcs') }}</p>
      </div>
    </div>

    <!-- Yellow Alert Banner -->
    <div v-if="pendingCount > 0 || paymentPendingCount > 0" class="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-center gap-3">
      <div class="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center flex-shrink-0">
        <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      </div>
      <div>
        <p class="text-sm font-semibold text-yellow-900">{{ $t('ecoIncomingCalcs.attentionRequired') }}</p>
        <p class="text-xs text-yellow-700">
          <span v-if="pendingCount > 0">{{ pendingCount }} {{ pendingCount === 1 ? $t('ecoIncomingCalcs.newCalcSingular') : $t('ecoIncomingCalcs.newCalcPlural') }} {{ $t('ecoIncomingCalcs.onReview') }}</span>
          <span v-if="pendingCount > 0 && paymentPendingCount > 0"> · </span>
          <span v-if="paymentPendingCount > 0">{{ paymentPendingCount }} {{ paymentPendingCount === 1 ? $t('ecoIncomingCalcs.paymentSingular') : $t('ecoIncomingCalcs.paymentPlural') }} {{ $t('ecoIncomingCalcs.onConfirmation') }}</span>
        </p>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex gap-1 mb-6 bg-[#f1f5f9] rounded-xl p-1">
      <button
        @click="activeTab = 'calculations'"
        :class="[
          'flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
          activeTab === 'calculations' ? 'bg-white text-[#1e293b] shadow-sm' : 'text-[#64748b] hover:text-[#1e293b]'
        ]"
      >
        {{ $t('ecoIncomingCalcs.tabCalculations') }}
        <span v-if="pendingCount > 0" class="ml-1.5 px-1.5 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs">{{ pendingCount }}</span>
      </button>
      <button
        @click="activeTab = 'payments'"
        :class="[
          'flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
          activeTab === 'payments' ? 'bg-white text-[#1e293b] shadow-sm' : 'text-[#64748b] hover:text-[#1e293b]'
        ]"
      >
        {{ $t('ecoIncomingCalcs.tabPayments') }}
        <span v-if="paymentPendingCount > 0" class="ml-1.5 px-1.5 py-0.5 bg-purple-100 text-purple-800 rounded-full text-xs">{{ paymentPendingCount }}</span>
      </button>
    </div>

    <!-- CALCULATIONS TAB -->
    <template v-if="activeTab === 'calculations'">

      <!-- Filters -->
      <div class="bg-white rounded-2xl p-4 shadow-sm border border-[#e2e8f0] mb-6">
        <div class="flex flex-wrap gap-4">
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="$t('ecoIncomingCalcs.searchPlaceholder')"
            class="flex-1 min-w-[200px] px-4 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb]"
          />
          <select v-model="statusFilter" class="px-4 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb]">
            <option value="">{{ $t('common.allStatuses') }}</option>
            <option value="under_review">{{ $t('status.underReview') }}</option>
            <option value="approved">{{ $t('status.approved') }}</option>
            <option value="rejected">{{ $t('status.rejected') }}</option>
            <option value="payment_pending">{{ $t('status.paymentPending') }}</option>
            <option value="paid">{{ $t('status.paid') }}</option>
            <option value="payment_rejected">{{ $t('status.paymentRejected') }}</option>
          </select>
          <select v-model="periodFilter" class="px-4 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb]">
            <option value="">{{ $t('ecoIncomingCalcs.allPeriods') }}</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
          </select>
        </div>
      </div>

      <!-- Table -->
      <DataTable :columns="columns" :data="filteredCalculations" :actions="true">
        <template #cell-number="{ value }">
          <span class="font-mono font-medium text-[#2563eb]">{{ value }}</span>
        </template>
        <template #cell-company="{ value }">
          <span class="font-medium text-[#1e293b]">{{ value }}</span>
        </template>
        <template #cell-payerTypeLabel="{ value }">
          <span class="text-xs text-[#64748b]">{{ value }}</span>
        </template>
        <template #cell-itemCount="{ value }">
          <span class="text-[#1e293b]">{{ value }}</span>
        </template>
        <template #cell-totalAmount="{ row }">
          <span class="font-semibold text-[#1e293b]">{{ row.totalAmountFormatted }}</span>
        </template>
        <template #cell-status="{ value }">
          <AppBadge :variant="getStatusBadgeVariant(value)">{{ value }}</AppBadge>
        </template>
        <template #actions="{ row }">
          <div class="flex items-center justify-end gap-2">
            <AppButton variant="ghost" size="sm" @click="openDetail(row)">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {{ $t('common.view') }}
            </AppButton>
          </div>
        </template>
        <template #empty>
          <EmptyState
            v-if="isCalcFiltersActive && allCalculations.length > 0"
            icon='<svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>'
            :title="$t('empty.noSearchResults')"
            :description="$t('empty.noSearchResultsDesc')"
            :actionLabel="$t('empty.resetFilters')"
            @action="resetCalcFilters"
          />
          <EmptyState
            v-else
            icon='<svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>'
            :title="$t('ecoIncomingCalcs.emptyCalcsTitle')"
            :description="$t('ecoIncomingCalcs.emptyCalcsDesc')"
          />
        </template>
      </DataTable>
    </template>

    <!-- PAYMENTS TAB -->
    <template v-if="activeTab === 'payments'">

      <!-- Filters -->
      <div class="bg-white rounded-2xl p-4 shadow-sm border border-[#e2e8f0] mb-6">
        <div class="flex flex-wrap gap-4">
          <input
            v-model="paymentSearchQuery"
            type="text"
            :placeholder="$t('ecoIncomingCalcs.searchPaymentPlaceholder')"
            class="flex-1 min-w-[200px] px-4 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb]"
          />
        </div>
      </div>

      <!-- Table -->
      <DataTable :columns="paymentColumns" :data="filteredPayments" :actions="true">
        <template #cell-number="{ value }">
          <span class="font-mono font-medium text-[#2563eb]">{{ value }}</span>
        </template>
        <template #cell-company="{ value }">
          <span class="font-medium text-[#1e293b]">{{ value }}</span>
        </template>
        <template #cell-totalAmount="{ row }">
          <span class="font-semibold text-[#1e293b]">{{ row.totalAmountFormatted }}</span>
        </template>
        <template #cell-status="{ value }">
          <AppBadge :variant="getStatusBadgeVariant(value)">{{ value }}</AppBadge>
        </template>
        <template #actions="{ row }">
          <div class="flex items-center justify-end gap-2">
            <AppButton variant="ghost" size="sm" @click="openDetailModal(row)">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {{ $t('ecoIncomingCalcs.details') }}
            </AppButton>
            <AppButton
              v-if="row.status === 'payment_pending'"
              variant="secondary" size="sm"
              @click="openDetailModal(row)"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              {{ $t('ecoIncomingCalcs.review') }}
            </AppButton>
          </div>
        </template>
        <template #empty>
          <EmptyState
            v-if="isPaymentFiltersActive && allPayments.length > 0"
            icon='<svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>'
            :title="$t('empty.noSearchResults')"
            :description="$t('empty.noSearchResultsDesc')"
            :actionLabel="$t('empty.resetFilters')"
            @action="resetPaymentFilters"
          />
          <EmptyState
            v-else
            icon='<svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>'
            :title="$t('ecoIncomingCalcs.emptyPaymentsTitle')"
            :description="$t('ecoIncomingCalcs.emptyPaymentsDesc')"
          />
        </template>
      </DataTable>
    </template>

    <!-- Detail Modal -->
    <Teleport to="body">
      <div v-if="showDetail && selectedCalculation" class="fixed inset-0 bg-black/50 z-[100] flex items-start justify-center pt-8 overflow-y-auto" @click.self="closeDetail">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 mb-8">
          <!-- Modal Header -->
          <div class="flex items-center justify-between p-6 border-b border-[#e2e8f0]">
            <div>
              <h2 class="text-xl font-bold text-[#1e293b]">{{ $t('ecoIncomingCalcs.calcNumber') }} {{ selectedCalculation.number }}</h2>
              <p class="text-sm text-[#64748b]">{{ $t('ecoIncomingCalcs.fromDate') }} {{ selectedCalculation.date }}</p>
            </div>
            <div class="flex items-center gap-3">
              <AppBadge :variant="getStatusBadgeVariant(selectedCalculation.status)">{{ selectedCalculation.status }}</AppBadge>
              <button @click="closeDetail" class="p-2 text-[#64748b] hover:bg-gray-100 rounded-lg">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Modal Body -->
          <div class="p-6 space-y-6">
            <!-- Company Info -->
            <div class="bg-[#f8fafc] rounded-xl p-4 border border-[#e2e8f0]">
              <h3 class="font-semibold text-[#1e293b] mb-3">{{ $t('ecoIncomingCalcs.payerData') }}</h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <span class="text-[#64748b]">{{ $t('ecoIncomingCalcs.organizationLabel') }}</span>
                  <span class="ml-2 font-medium text-[#1e293b]">{{ selectedCalculation.company }}</span>
                </div>
                <div>
                  <span class="text-[#64748b]">{{ $t('ecoIncomingCalcs.innLabel') }}</span>
                  <span class="ml-2 font-medium text-[#1e293b]">{{ selectedCalculation.inn }}</span>
                </div>
                <div>
                  <span class="text-[#64748b]">{{ $t('ecoIncomingCalcs.periodLabel') }}</span>
                  <span class="ml-2 font-medium text-[#1e293b]">{{ selectedCalculation.period }}</span>
                </div>
                <div>
                  <span class="text-[#64748b]">{{ $t('ecoIncomingCalcs.calcDateLabel') }}</span>
                  <span class="ml-2 font-medium text-[#1e293b]">{{ selectedCalculation.date }}</span>
                </div>
              </div>
            </div>

            <!-- Items Table -->
            <div>
              <h3 class="font-semibold text-[#1e293b] mb-3">{{ $t('ecoIncomingCalcs.calcDetails') }}</h3>
              <div class="overflow-x-auto border border-[#e2e8f0] rounded-xl">
                <table class="w-full text-sm">
                  <thead class="bg-[#f8fafc]">
                    <tr class="text-left text-[#64748b]">
                      <th class="px-4 py-3 font-medium">{{ $t('ecoIncomingCalcs.thCategory') }}</th>
                      <th class="px-4 py-3 font-medium">{{ $t('ecoIncomingCalcs.thSubcategory') }}</th>
                      <th class="px-4 py-3 font-medium">{{ $t('ecoIncomingCalcs.thGskpMaterial') }}</th>
                      <th class="px-4 py-3 font-medium">{{ $t('ecoIncomingCalcs.thTnvedTrts') }}</th>
                      <th class="px-4 py-3 font-medium">{{ $t('ecoIncomingCalcs.thName') }}</th>
                      <th class="px-4 py-3 font-medium text-right">{{ $t('ecoIncomingCalcs.thVolume') }}</th>
                      <th class="px-4 py-3 font-medium text-right">{{ $t('ecoIncomingCalcs.thRate') }}</th>
                      <th class="px-4 py-3 font-medium text-right">{{ $t('ecoIncomingCalcs.thAmount') }}</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-[#e2e8f0]">
                    <tr v-for="item in selectedCalculation.items" :key="item.id" class="hover:bg-[#f8fafc]">
                      <td class="px-4 py-3 text-[#1e293b]">{{ getGroupLabel(item.group) }}</td>
                      <td class="px-4 py-3 text-[#64748b]">{{ getSubgroupLabel(item.group, item.subgroup) }}</td>
                      <template v-if="!isPackagingGroup(item.group)">
                        <td class="px-4 py-3 font-mono text-xs text-[#64748b]">{{ getSubgroupData(item.group, item.subgroup)?.gskpCode || '—' }}</td>
                        <td class="px-4 py-3 font-mono text-xs text-[#64748b]">{{ getSubgroupData(item.group, item.subgroup)?.tnvedCode || '—' }}</td>
                        <td class="px-4 py-3 text-xs text-[#64748b]">{{ getSubgroupData(item.group, item.subgroup)?.tnvedName || '—' }}</td>
                      </template>
                      <template v-else>
                        <td class="px-4 py-3 text-xs text-[#64748b]">{{ getSubgroupData(item.group, item.subgroup)?.packagingMaterial || '—' }}</td>
                        <td class="px-4 py-3 font-mono text-xs text-[#64748b]">{{ getSubgroupData(item.group, item.subgroup)?.packagingLetterCode || '—' }}</td>
                        <td class="px-4 py-3 font-mono text-xs text-[#64748b]">{{ getSubgroupData(item.group, item.subgroup)?.packagingDigitalCode || '—' }}</td>
                      </template>
                      <td class="px-4 py-3 text-right font-medium">{{ item.volume }}</td>
                      <td class="px-4 py-3 text-right">{{ item.rate.toLocaleString() }} {{ $t('ecoIncomingCalcs.somPerTon') }}</td>
                      <td class="px-4 py-3 text-right font-bold text-[#f59e0b]">{{ item.amount.toLocaleString() }} {{ $t('ecoIncomingCalcs.som') }}</td>
                    </tr>
                  </tbody>
                  <tfoot class="bg-[#f8fafc] font-semibold">
                    <tr>
                      <td colspan="7" class="px-4 py-3">{{ $t('ecoIncomingCalcs.total') }}</td>
                      <td class="px-4 py-3 text-right text-[#f59e0b]">{{ selectedCalculation.totalAmount.toLocaleString() }} {{ $t('ecoIncomingCalcs.som') }}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <!-- Payment Info (if payment exists) -->
            <div v-if="selectedCalculation.payment" class="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <h3 class="font-semibold text-purple-800 mb-3">{{ $t('ecoIncomingCalcs.paymentData') }}</h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-4">
                <div>
                  <span class="text-purple-600">{{ $t('ecoIncomingCalcs.paymentOrderLabel') }}</span>
                  <span class="ml-2 font-medium text-[#1e293b]">{{ selectedCalculation.payment.paymentOrderNumber }}</span>
                </div>
                <div>
                  <span class="text-purple-600">{{ $t('ecoIncomingCalcs.paymentDateLabel') }}</span>
                  <span class="ml-2 font-medium text-[#1e293b]">{{ selectedCalculation.payment.paymentDate }}</span>
                </div>
                <div>
                  <span class="text-purple-600">{{ $t('ecoIncomingCalcs.payerBankLabel') }}</span>
                  <span class="ml-2 font-medium text-[#1e293b]">{{ selectedCalculation.payment.payerBank }}</span>
                </div>
                <div>
                  <span class="text-purple-600">{{ $t('ecoIncomingCalcs.transferAmountLabel') }}</span>
                  <span class="ml-2 font-medium text-[#1e293b]">{{ selectedCalculation.payment.transferAmount.toLocaleString() }} {{ $t('ecoIncomingCalcs.som') }}</span>
                </div>
                <div v-if="selectedCalculation.payment.comment" class="sm:col-span-2">
                  <span class="text-purple-600">{{ $t('ecoIncomingCalcs.commentLabel') }}</span>
                  <span class="ml-2 text-[#1e293b]">{{ selectedCalculation.payment.comment }}</span>
                </div>
              </div>

              <!-- File preview -->
              <div class="bg-white rounded-lg p-3 border border-purple-200">
                <p class="text-sm font-medium text-[#1e293b] mb-2">{{ $t('ecoIncomingCalcs.paymentOrder') }}</p>
                <div v-if="selectedCalculation.payment.fileDataUrl && selectedCalculation.payment.fileType.startsWith('image/')" class="rounded-lg overflow-hidden border border-[#e2e8f0]">
                  <img :src="selectedCalculation.payment.fileDataUrl" :alt="selectedCalculation.payment.fileName" class="max-w-full max-h-64 object-contain mx-auto" />
                </div>
                <div v-else class="flex items-center gap-3 p-3 bg-[#f8fafc] rounded-lg">
                  <svg class="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div>
                    <p class="font-medium text-[#1e293b] text-sm">{{ selectedCalculation.payment.fileName }}</p>
                    <p class="text-xs text-[#64748b]">{{ $t('ecoIncomingCalcs.pdfDocument') }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Rejection reason if rejected -->
            <div v-if="selectedCalculation.status === 'rejected' && selectedCalculation.rejectionReason" class="bg-red-50 border border-red-200 rounded-xl p-4">
              <p class="font-medium text-red-800 mb-1">{{ $t('ecoIncomingCalcs.calcRejectionReason') }}</p>
              <p class="text-sm text-red-700">{{ selectedCalculation.rejectionReason }}</p>
            </div>

            <!-- Payment rejection reason -->
            <div v-if="selectedCalculation.status === 'payment_rejected' && selectedCalculation.paymentRejectionReason" class="bg-red-50 border border-red-200 rounded-xl p-4">
              <p class="font-medium text-red-800 mb-1">{{ $t('ecoIncomingCalcs.paymentRejectionReason') }}</p>
              <p class="text-sm text-red-700">{{ selectedCalculation.paymentRejectionReason }}</p>
            </div>

            <!-- Reject Calculation Form -->
            <div v-if="showRejectForm" class="bg-red-50 border border-red-200 rounded-xl p-4">
              <h3 class="font-semibold text-red-800 mb-3">{{ $t('ecoIncomingCalcs.specifyRejectionReason') }}</h3>
              <textarea
                v-model="rejectionReason"
                rows="3"
                :placeholder="$t('ecoIncomingCalcs.calcRejectionPlaceholder')"
                class="w-full px-4 py-3 border border-red-200 rounded-lg focus:outline-none focus:border-red-400 text-sm"
              ></textarea>
              <div class="flex justify-end gap-3 mt-3">
                <AppButton variant="secondary" @click="showRejectForm = false">
                  {{ $t('common.cancel') }}
                </AppButton>
                <AppButton
                  variant="danger"
                  @click="rejectCalc"
                  :disabled="!rejectionReason.trim()"
                >
                  {{ $t('common.confirm') }}
                </AppButton>
              </div>
            </div>

            <!-- Reject Payment Form -->
            <div v-if="showPaymentRejectForm" class="bg-red-50 border border-red-200 rounded-xl p-4">
              <h3 class="font-semibold text-red-800 mb-3">{{ $t('ecoIncomingCalcs.specifyPaymentRejectionReason') }}</h3>
              <textarea
                v-model="paymentRejectionReason"
                rows="3"
                :placeholder="$t('ecoIncomingCalcs.paymentRejectionPlaceholder')"
                class="w-full px-4 py-3 border border-red-200 rounded-lg focus:outline-none focus:border-red-400 text-sm"
              ></textarea>
              <div class="flex justify-end gap-3 mt-3">
                <AppButton variant="secondary" @click="showPaymentRejectForm = false">
                  {{ $t('common.cancel') }}
                </AppButton>
                <AppButton
                  variant="danger"
                  @click="rejectPayment"
                  :disabled="!paymentRejectionReason.trim()"
                >
                  {{ $t('common.confirm') }}
                </AppButton>
              </div>
            </div>
          </div>

          <!-- Modal Footer: Calculation review actions -->
          <div v-if="selectedCalculation.status === 'under_review' && !showRejectForm" class="flex justify-end gap-3 p-6 border-t border-[#e2e8f0]">
            <AppButton variant="danger" @click="showRejectForm = true">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              {{ $t('ecoIncomingCalcs.rejectCalc') }}
            </AppButton>
            <AppButton variant="primary" @click="approveCalc">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              {{ $t('ecoIncomingCalcs.approveCalc') }}
            </AppButton>
          </div>

          <!-- Modal Footer: Payment review actions -->
          <div v-else-if="selectedCalculation.status === 'payment_pending' && !showPaymentRejectForm" class="flex justify-end gap-3 p-6 border-t border-[#e2e8f0]">
            <AppButton variant="danger" @click="showPaymentRejectForm = true">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              {{ $t('ecoIncomingCalcs.rejectPayment') }}
            </AppButton>
            <AppButton variant="primary" @click="approvePayment">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              {{ $t('ecoIncomingCalcs.confirmPayment') }}
            </AppButton>
          </div>

          <!-- Close button for other statuses -->
          <div v-else-if="selectedCalculation.status !== 'under_review' && selectedCalculation.status !== 'payment_pending'" class="flex justify-end p-6 border-t border-[#e2e8f0]">
            <AppButton variant="secondary" @click="closeDetail">
              {{ $t('common.close') }}
            </AppButton>
          </div>
        </div>
      </div>
    </Teleport>
  </DashboardLayout>
</template>
