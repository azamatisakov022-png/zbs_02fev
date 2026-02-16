<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import DataTable from '../../components/dashboard/DataTable.vue'
import EmptyState from '../../components/dashboard/EmptyState.vue'
import SkeletonLoader from '../../components/dashboard/SkeletonLoader.vue'
import { icons } from '../../utils/menuIcons'
import { calculationStore } from '../../stores/calculations'
import { reportStore } from '../../stores/reports'
import { refundStore } from '../../stores/refunds'
import { accountStore } from '../../stores/account'

const router = useRouter()

const menuItems = computed(() => [
  { id: 'dashboard', label: 'Главная', icon: icons.dashboard, route: '/eco-operator' },
  { id: 'incoming-calculations', label: 'Входящие расчёты', icon: icons.calculator, route: '/eco-operator/calculations', badge: calculationStore.getCalcReviewCount() },
  { id: 'incoming-declarations', label: 'Входящие декларации', icon: icons.document, route: '/eco-operator/incoming-declarations' },
  { id: 'incoming-reports', label: 'Входящие отчёты', icon: icons.report, route: '/eco-operator/incoming-reports', badge: reportStore.getPendingCount() },
  { id: 'refunds', label: 'Заявки на возврат', icon: icons.refund, route: '/eco-operator/refunds', badge: refundStore.getPendingRefundsCount() },
  { id: 'accounts', label: 'Лицевые счета', icon: icons.money, route: '/eco-operator/accounts' },
  { id: 'analytics', label: 'Аналитика и отчёты', icon: icons.analytics, route: '/eco-operator/analytics' },
  { id: 'profile', label: 'Профили компаний', icon: icons.profile, route: '/eco-operator/profile' },
  { id: 'recyclers-registry', label: 'Реестр переработчиков', icon: icons.recycle, route: '/eco-operator/recyclers' },
])

// Loading state
const isLoading = ref(true)
onMounted(() => { setTimeout(() => { isLoading.value = false }, 500) })

// All accounts from store
const allAccounts = computed(() => accountStore.getAllAccounts())

// Search filter
const searchQuery = ref('')

const filteredAccounts = computed(() => {
  if (!searchQuery.value) return allAccounts.value
  const q = searchQuery.value.toLowerCase()
  return allAccounts.value.filter(a =>
    a.company.toLowerCase().includes(q) || a.inn.includes(q)
  )
})

// Stats
const totalCompanies = computed(() => allAccounts.value.length)
const positiveBalanceCount = computed(() => accountStore.getAccountsWithPositiveBalance().length)
const debtCount = computed(() => accountStore.getAccountsWithDebt().length)
const monthlyIncome = computed(() => accountStore.getTotalMonthlyIncome())

// Table columns
const columns = [
  { key: 'company', label: 'Наименование организации', width: '22%' },
  { key: 'inn', label: 'ИНН', width: '14%' },
  { key: 'balance', label: 'Баланс', width: '14%' },
  { key: 'lastPayment', label: 'Последнее поступление', width: '16%' },
  { key: 'status', label: 'Статус', width: '10%' },
]

// Table data with computed fields
const tableData = computed(() => {
  return filteredAccounts.value.map(acc => {
    const lastPaymentTx = [...acc.transactions].reverse().find(t => t.paymentAmount > 0)
    return {
      id: acc.id,
      company: acc.company,
      inn: acc.inn,
      balance: acc.balance,
      lastPayment: lastPaymentTx ? `${lastPaymentTx.date} — ${lastPaymentTx.paymentAmount.toLocaleString('ru-RU')} сом` : '—',
      status: acc.status,
    }
  })
})

// Balance formatting
const formatBalance = (balance: number): string => {
  const formatted = Math.abs(balance).toLocaleString('ru-RU')
  if (balance > 0) return '+' + formatted + ' сом'
  if (balance < 0) return '-' + formatted + ' сом'
  return '0 сом'
}

const getBalanceClass = (balance: number): string => {
  if (balance > 0) return 'text-[#10b981] font-semibold'
  if (balance < 0) return 'text-[#ef4444] font-semibold'
  return 'text-[#94a3b8] font-medium'
}

const getStatusStyle = (status: string) => {
  if (status === 'Активен') return 'background:#D1FAE5;color:#065F46'
  return 'background:#FEE2E2;color:#991B1B'
}

const viewPayer = (row: { id: number }) => {
  router.push(`/eco-operator/accounts/${row.id}`)
}

const isFiltersActive = computed(() => !!searchQuery.value)
const resetFilters = () => { searchQuery.value = '' }
</script>

<template>
  <DashboardLayout
    role="eco-operator"
    roleTitle="ГП Эко Оператор"
    userName="Экологический оператор"
    :menuItems="menuItems"
  >
    <div class="mb-6">
      <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b] mb-2">Лицевые счета плательщиков</h1>
      <p class="text-[#64748b]">Управление лицевыми счетами и корректировками</p>
    </div>

    <!-- Stat Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 border border-blue-200 shadow-sm">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </div>
          <p class="text-sm font-medium text-blue-800">Всего компаний</p>
        </div>
        <p class="text-3xl font-bold text-blue-900">{{ totalCompanies }}</p>
      </div>

      <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-5 border border-green-200 shadow-sm">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <p class="text-sm font-medium text-green-800">Положительный баланс</p>
        </div>
        <p class="text-3xl font-bold text-green-900">{{ positiveBalanceCount }}</p>
      </div>

      <div class="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-5 border border-red-200 shadow-sm">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
          </div>
          <p class="text-sm font-medium text-red-800">Задолженность</p>
        </div>
        <p class="text-3xl font-bold text-red-900">{{ debtCount }}</p>
      </div>

      <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-5 border border-purple-200 shadow-sm">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <p class="text-sm font-medium text-purple-800">Поступления за месяц</p>
        </div>
        <p class="text-3xl font-bold text-purple-900">{{ monthlyIncome.toLocaleString('ru-RU') }} <span class="text-lg font-semibold">сом</span></p>
      </div>
    </div>

    <template v-if="isLoading">
      <div class="mb-6"><SkeletonLoader variant="card" /></div>
      <SkeletonLoader variant="table" />
    </template>

    <template v-if="!isLoading">
      <div class="bg-white rounded-2xl p-4 shadow-sm border border-[#e2e8f0] mb-6">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Поиск по названию компании или ИНН..."
          class="w-full px-4 py-2.5 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb] text-sm"
        />
      </div>

      <DataTable :columns="columns" :data="tableData" :actions="true">
        <template #cell-company="{ value }">
          <span class="font-semibold text-[#1e293b]">{{ value }}</span>
        </template>
        <template #cell-inn="{ value }">
          <span class="font-mono text-[#374151] text-xs">{{ value }}</span>
        </template>
        <template #cell-balance="{ row }">
          <span :class="getBalanceClass(row.balance)">{{ formatBalance(row.balance) }}</span>
        </template>
        <template #cell-lastPayment="{ value }">
          <span class="text-[#374151] text-sm">{{ value }}</span>
        </template>
        <template #cell-status="{ value }">
          <span
            :style="getStatusStyle(value)"
            style="display:inline-block;border-radius:12px;padding:4px 12px;font-size:12px;font-weight:500;white-space:nowrap"
          >{{ value }}</span>
        </template>
        <template #actions="{ row }">
          <button
            @click="viewPayer(row)"
            class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg bg-[#3B82F6] text-white hover:bg-[#2563EB] transition-colors shadow-sm"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            Детали
          </button>
        </template>
        <template #empty>
          <EmptyState
            v-if="isFiltersActive"
            icon='<svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>'
            title="Ничего не найдено"
            description="Попробуйте изменить параметры поиска"
            actionLabel="Сбросить фильтры"
            @action="resetFilters"
          />
          <EmptyState
            v-else
            icon='<svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>'
            title="Нет лицевых счетов"
            description="Плательщики пока не зарегистрированы в системе"
          />
        </template>
      </DataTable>
    </template>
  </DashboardLayout>
</template>
