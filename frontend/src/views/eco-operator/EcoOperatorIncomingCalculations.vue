<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import DataTable from '../../components/dashboard/DataTable.vue'
import EmptyState from '../../components/dashboard/EmptyState.vue'
import { calculationStore, type Calculation } from '../../stores/calculations'
import { productGroups, getSubgroupLabel, getSubgroupData, isPackagingGroup } from '../../data/product-groups'
import { AppButton, AppBadge } from '../../components/ui'
import { getStatusBadgeVariant } from '../../utils/statusVariant'
import { useEcoOperatorMenu } from '../../composables/useRoleMenu'
import SectionGuide from '../../components/common/SectionGuide.vue'

const router = useRouter()
const { roleTitle, menuItems } = useEcoOperatorMenu()

// Tabs
const activeTab = ref<'calculations' | 'payments'>('calculations')

// ========================
// CALCULATIONS TAB
// ========================
const columns = [
  { key: 'number', label: 'Номер', width: '9%' },
  { key: 'company', label: 'Плательщик', width: '14%' },
  { key: 'inn', label: 'ИНН', width: '10%' },
  { key: 'payerTypeLabel', label: 'Тип', width: '8%' },
  { key: 'date', label: 'Дата подачи', width: '8%' },
  { key: 'itemCount', label: 'Позиций', width: '6%' },
  { key: 'totalAmount', label: 'Сумма', width: '10%' },
  { key: 'status', label: 'Статус', width: '10%' },
]

// Filters
const searchQuery = ref('')
const statusFilter = ref('')
const periodFilter = ref('')

const filteredCalculations = computed(() => {
  let list = calculationStore.state.calculations.filter(c => c.status !== 'Черновик')
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
      totalAmountFormatted: c.totalAmount.toLocaleString('ru-RU') + ' сом',
      payerTypeLabel: c.payerType === 'importer' ? 'Импортёр' : 'Производитель',
      itemCount: c.items.length,
    }))
})

// Stats
const totalCount = computed(() => calculationStore.state.calculations.filter(c => c.status !== 'Черновик').length)
const pendingCount = computed(() => calculationStore.state.calculations.filter(c => c.status === 'На проверке').length)
const approvedCount = computed(() => calculationStore.state.calculations.filter(c => c.status === 'Принято' || c.status === 'Оплачено' || c.status === 'Оплата на проверке').length)
const rejectedCount = computed(() => calculationStore.state.calculations.filter(c => c.status === 'Отклонено').length)

const getStatusClass = (status: string) => {
  switch (status) {
    case 'Черновик': return 'bg-gray-100 text-gray-800'
    case 'На проверке': return 'bg-yellow-100 text-yellow-800'
    case 'Принято': return 'bg-green-100 text-green-800'
    case 'Отклонено': return 'bg-red-100 text-red-800'
    case 'Оплата на проверке': return 'bg-purple-100 text-purple-800'
    case 'Оплачено': return 'bg-blue-100 text-blue-800'
    case 'Оплата отклонена': return 'bg-red-100 text-red-800'
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
const paymentColumns = [
  { key: 'number', label: 'Номер расчёта', width: '10%' },
  { key: 'company', label: 'Организация', width: '18%' },
  { key: 'totalAmount', label: 'Сумма', width: '10%' },
  { key: 'paymentDate', label: 'Дата платежа', width: '10%' },
  { key: 'paymentOrderNumber', label: 'Номер п/п', width: '10%' },
  { key: 'status', label: 'Статус', width: '12%' },
]

const paymentSearchQuery = ref('')

const paymentPendingCount = computed(() => calculationStore.getPaymentPendingCount())

const filteredPayments = computed(() => {
  let list = calculationStore.state.calculations.filter(c =>
    c.status === 'Оплата на проверке' || c.status === 'Оплачено' || c.status === 'Оплата отклонена'
  )
  if (paymentSearchQuery.value) {
    const q = paymentSearchQuery.value.toLowerCase()
    list = list.filter(c => c.number.toLowerCase().includes(q) || c.company.toLowerCase().includes(q))
  }
  return list.map(c => ({
    ...c,
    totalAmountFormatted: c.totalAmount.toLocaleString('ru-RU') + ' сом',
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
const allCalculations = computed(() => calculationStore.state.calculations.filter(c => c.status !== 'Черновик'))
const isCalcFiltersActive = computed(() => !!(searchQuery.value || statusFilter.value || periodFilter.value))

const allPayments = computed(() => calculationStore.state.calculations.filter(c =>
  c.status === 'Оплата на проверке' || c.status === 'Оплачено' || c.status === 'Оплата отклонена'
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
      title="Входящие расчёты утилизационного сбора"
      description="Расчёты, поступившие от плательщиков для проверки и утверждения."
      :actions="['Просмотр новых расчётов', 'Проверка правильности данных', 'Одобрение или отклонение расчёта', 'Возврат на доработку с комментарием']"
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
          <p class="text-sm font-medium text-yellow-800">На проверке</p>
        </div>
        <p class="text-3xl font-bold text-yellow-900">{{ pendingCount }}</p>
        <p class="text-xs text-yellow-600 mt-1">расчётов ожидают проверки</p>
      </div>
      <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-5 border border-purple-200 shadow-sm">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <p class="text-sm font-medium text-purple-800">Оплата на проверке</p>
        </div>
        <p class="text-3xl font-bold text-purple-900">{{ paymentPendingCount }}</p>
        <p class="text-xs text-purple-600 mt-1">оплат ожидают подтверждения</p>
      </div>
      <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-5 border border-green-200 shadow-sm">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p class="text-sm font-medium text-green-800">Принято за месяц</p>
        </div>
        <p class="text-3xl font-bold text-green-900">{{ approvedCount }}</p>
        <p class="text-xs text-green-600 mt-1">расчётов принято</p>
      </div>
      <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 border border-blue-200 shadow-sm">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <p class="text-sm font-medium text-blue-800">Общая сумма за месяц</p>
        </div>
        <p class="text-3xl font-bold text-blue-900">{{ totalCount }}</p>
        <p class="text-xs text-blue-600 mt-1">всего расчётов</p>
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
        <p class="text-sm font-semibold text-yellow-900">Требуется внимание</p>
        <p class="text-xs text-yellow-700">
          <span v-if="pendingCount > 0">{{ pendingCount }} {{ pendingCount === 1 ? 'новый расчёт' : 'новых расчётов' }} на проверке</span>
          <span v-if="pendingCount > 0 && paymentPendingCount > 0"> · </span>
          <span v-if="paymentPendingCount > 0">{{ paymentPendingCount }} {{ paymentPendingCount === 1 ? 'оплата' : 'оплат' }} на подтверждении</span>
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
        Расчёты
        <span v-if="pendingCount > 0" class="ml-1.5 px-1.5 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs">{{ pendingCount }}</span>
      </button>
      <button
        @click="activeTab = 'payments'"
        :class="[
          'flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
          activeTab === 'payments' ? 'bg-white text-[#1e293b] shadow-sm' : 'text-[#64748b] hover:text-[#1e293b]'
        ]"
      >
        Проверка оплат
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
            placeholder="Поиск по номеру, компании или ИНН..."
            class="flex-1 min-w-[200px] px-4 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb]"
          />
          <select v-model="statusFilter" class="px-4 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb]">
            <option value="">Все статусы</option>
            <option value="На проверке">На проверке</option>
            <option value="Принято">Принято</option>
            <option value="Отклонено">Отклонено</option>
            <option value="Оплата на проверке">Оплата на проверке</option>
            <option value="Оплачено">Оплачено</option>
            <option value="Оплата отклонена">Оплата отклонена</option>
          </select>
          <select v-model="periodFilter" class="px-4 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb]">
            <option value="">Все периоды</option>
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
            title="Нет входящих расчётов"
            description="Все расчёты обработаны"
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
            placeholder="Поиск по номеру или компании..."
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
              Детали
            </AppButton>
            <AppButton
              v-if="row.status === 'Оплата на проверке'"
              variant="secondary" size="sm"
              @click="openDetailModal(row)"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Проверить
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
            title="Нет платежей на проверке"
            description="Все платежи обработаны"
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
              <h2 class="text-xl font-bold text-[#1e293b]">Расчёт {{ selectedCalculation.number }}</h2>
              <p class="text-sm text-[#64748b]">от {{ selectedCalculation.date }}</p>
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
              <h3 class="font-semibold text-[#1e293b] mb-3">Данные плательщика</h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <span class="text-[#64748b]">Организация:</span>
                  <span class="ml-2 font-medium text-[#1e293b]">{{ selectedCalculation.company }}</span>
                </div>
                <div>
                  <span class="text-[#64748b]">ИНН:</span>
                  <span class="ml-2 font-medium text-[#1e293b]">{{ selectedCalculation.inn }}</span>
                </div>
                <div>
                  <span class="text-[#64748b]">Период:</span>
                  <span class="ml-2 font-medium text-[#1e293b]">{{ selectedCalculation.period }}</span>
                </div>
                <div>
                  <span class="text-[#64748b]">Дата расчёта:</span>
                  <span class="ml-2 font-medium text-[#1e293b]">{{ selectedCalculation.date }}</span>
                </div>
              </div>
            </div>

            <!-- Items Table -->
            <div>
              <h3 class="font-semibold text-[#1e293b] mb-3">Детализация расчёта</h3>
              <div class="overflow-x-auto border border-[#e2e8f0] rounded-xl">
                <table class="w-full text-sm">
                  <thead class="bg-[#f8fafc]">
                    <tr class="text-left text-[#64748b]">
                      <th class="px-4 py-3 font-medium">Категория</th>
                      <th class="px-4 py-3 font-medium">Подкатегория</th>
                      <th class="px-4 py-3 font-medium">Код ГСКП / Материал</th>
                      <th class="px-4 py-3 font-medium">Код ТН ВЭД / ТР ТС</th>
                      <th class="px-4 py-3 font-medium">Наименование</th>
                      <th class="px-4 py-3 font-medium text-right">Объём (т)</th>
                      <th class="px-4 py-3 font-medium text-right">Ставка</th>
                      <th class="px-4 py-3 font-medium text-right">Сумма</th>
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
                      <td class="px-4 py-3 text-right">{{ item.rate.toLocaleString() }} сом/т</td>
                      <td class="px-4 py-3 text-right font-bold text-[#f59e0b]">{{ item.amount.toLocaleString() }} сом</td>
                    </tr>
                  </tbody>
                  <tfoot class="bg-[#f8fafc] font-semibold">
                    <tr>
                      <td colspan="7" class="px-4 py-3">Итого</td>
                      <td class="px-4 py-3 text-right text-[#f59e0b]">{{ selectedCalculation.totalAmount.toLocaleString() }} сом</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <!-- Payment Info (if payment exists) -->
            <div v-if="selectedCalculation.payment" class="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <h3 class="font-semibold text-purple-800 mb-3">Данные об оплате</h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-4">
                <div>
                  <span class="text-purple-600">Номер п/п:</span>
                  <span class="ml-2 font-medium text-[#1e293b]">{{ selectedCalculation.payment.paymentOrderNumber }}</span>
                </div>
                <div>
                  <span class="text-purple-600">Дата оплаты:</span>
                  <span class="ml-2 font-medium text-[#1e293b]">{{ selectedCalculation.payment.paymentDate }}</span>
                </div>
                <div>
                  <span class="text-purple-600">Банк плательщика:</span>
                  <span class="ml-2 font-medium text-[#1e293b]">{{ selectedCalculation.payment.payerBank }}</span>
                </div>
                <div>
                  <span class="text-purple-600">Сумма перевода:</span>
                  <span class="ml-2 font-medium text-[#1e293b]">{{ selectedCalculation.payment.transferAmount.toLocaleString('ru-RU') }} сом</span>
                </div>
                <div v-if="selectedCalculation.payment.comment" class="sm:col-span-2">
                  <span class="text-purple-600">Комментарий:</span>
                  <span class="ml-2 text-[#1e293b]">{{ selectedCalculation.payment.comment }}</span>
                </div>
              </div>

              <!-- File preview -->
              <div class="bg-white rounded-lg p-3 border border-purple-200">
                <p class="text-sm font-medium text-[#1e293b] mb-2">Платёжное поручение:</p>
                <div v-if="selectedCalculation.payment.fileDataUrl && selectedCalculation.payment.fileType.startsWith('image/')" class="rounded-lg overflow-hidden border border-[#e2e8f0]">
                  <img :src="selectedCalculation.payment.fileDataUrl" :alt="selectedCalculation.payment.fileName" class="max-w-full max-h-64 object-contain mx-auto" />
                </div>
                <div v-else class="flex items-center gap-3 p-3 bg-[#f8fafc] rounded-lg">
                  <svg class="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div>
                    <p class="font-medium text-[#1e293b] text-sm">{{ selectedCalculation.payment.fileName }}</p>
                    <p class="text-xs text-[#64748b]">PDF-документ</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Rejection reason if rejected -->
            <div v-if="selectedCalculation.status === 'Отклонено' && selectedCalculation.rejectionReason" class="bg-red-50 border border-red-200 rounded-xl p-4">
              <p class="font-medium text-red-800 mb-1">Причина отклонения расчёта</p>
              <p class="text-sm text-red-700">{{ selectedCalculation.rejectionReason }}</p>
            </div>

            <!-- Payment rejection reason -->
            <div v-if="selectedCalculation.status === 'Оплата отклонена' && selectedCalculation.paymentRejectionReason" class="bg-red-50 border border-red-200 rounded-xl p-4">
              <p class="font-medium text-red-800 mb-1">Причина отклонения оплаты</p>
              <p class="text-sm text-red-700">{{ selectedCalculation.paymentRejectionReason }}</p>
            </div>

            <!-- Reject Calculation Form -->
            <div v-if="showRejectForm" class="bg-red-50 border border-red-200 rounded-xl p-4">
              <h3 class="font-semibold text-red-800 mb-3">Укажите причину отклонения</h3>
              <textarea
                v-model="rejectionReason"
                rows="3"
                placeholder="Опишите причину отклонения расчёта..."
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
              <h3 class="font-semibold text-red-800 mb-3">Укажите причину отклонения оплаты</h3>
              <textarea
                v-model="paymentRejectionReason"
                rows="3"
                placeholder="Опишите причину отклонения оплаты..."
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
          <div v-if="selectedCalculation.status === 'На проверке' && !showRejectForm" class="flex justify-end gap-3 p-6 border-t border-[#e2e8f0]">
            <AppButton variant="danger" @click="showRejectForm = true">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Отклонить расчёт
            </AppButton>
            <AppButton variant="primary" @click="approveCalc">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Принять расчёт
            </AppButton>
          </div>

          <!-- Modal Footer: Payment review actions -->
          <div v-else-if="selectedCalculation.status === 'Оплата на проверке' && !showPaymentRejectForm" class="flex justify-end gap-3 p-6 border-t border-[#e2e8f0]">
            <AppButton variant="danger" @click="showPaymentRejectForm = true">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Отклонить оплату
            </AppButton>
            <AppButton variant="primary" @click="approvePayment">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Подтвердить оплату
            </AppButton>
          </div>

          <!-- Close button for other statuses -->
          <div v-else-if="selectedCalculation.status !== 'На проверке' && selectedCalculation.status !== 'Оплата на проверке'" class="flex justify-end p-6 border-t border-[#e2e8f0]">
            <AppButton variant="secondary" @click="closeDetail">
              {{ $t('common.close') }}
            </AppButton>
          </div>
        </div>
      </div>
    </Teleport>
  </DashboardLayout>
</template>
