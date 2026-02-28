<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import DataTable from '../../components/dashboard/DataTable.vue'
import EmptyState from '../../components/dashboard/EmptyState.vue'
import SkeletonLoader from '../../components/dashboard/SkeletonLoader.vue'
import { accountStore } from '../../stores/account'
import { AppButton } from '../../components/ui'
import { useEcoOperatorMenu } from '../../composables/useRoleMenu'
import SectionGuide from '../../components/common/SectionGuide.vue'

const { t } = useI18n()
const router = useRouter()
const { roleTitle, menuItems } = useEcoOperatorMenu()

// Loading state
const isLoading = ref(true)
onMounted(() => { setTimeout(() => { isLoading.value = false }, 500) })

// All accounts from store
const allAccounts = computed(() => accountStore.getAllAccounts())

// Search filter
const searchQuery = ref('')

// Balance filter tabs
type BalanceFilter = 'all' | 'debt' | 'overpaid' | 'zero'
const balanceFilter = ref<BalanceFilter>('all')

const filteredAccounts = computed(() => {
  let list = allAccounts.value

  // Apply balance filter
  if (balanceFilter.value === 'debt') list = list.filter(a => a.balance < 0)
  else if (balanceFilter.value === 'overpaid') list = list.filter(a => a.balance > 0)
  else if (balanceFilter.value === 'zero') list = list.filter(a => a.balance === 0)

  // Apply search
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(a => a.company.toLowerCase().includes(q) || a.inn.includes(q))
  }

  return list
})

// Stats
const totalCompanies = computed(() => allAccounts.value.length)
const debtAccounts = computed(() => allAccounts.value.filter(a => a.balance < 0))
const overpaidAccounts = computed(() => allAccounts.value.filter(a => a.balance > 0))
const zeroAccounts = computed(() => allAccounts.value.filter(a => a.balance === 0))
const totalDebt = computed(() => debtAccounts.value.reduce((sum, a) => sum + Math.abs(a.balance), 0))
const totalOverpaid = computed(() => overpaidAccounts.value.reduce((sum, a) => sum + a.balance, 0))

// Table columns
const columns = computed(() => [
  { key: 'company', label: t('ecoAccounts.colCompanyName'), width: '22%' },
  { key: 'inn', label: t('ecoAccounts.colInn'), width: '14%' },
  { key: 'balance', label: t('ecoAccounts.colBalance'), width: '14%' },
  { key: 'lastPayment', label: t('ecoAccounts.colLastPayment'), width: '16%' },
  { key: 'status', label: t('ecoAccounts.colStatus'), width: '10%' },
])

// Table data with computed fields
const tableData = computed(() => {
  return filteredAccounts.value.map(acc => {
    const lastPaymentTx = [...acc.transactions].reverse().find(t => t.paymentAmount > 0)
    return {
      id: acc.id,
      company: acc.company,
      inn: acc.inn,
      balance: acc.balance,
      lastPayment: lastPaymentTx ? `${lastPaymentTx.date} — ${lastPaymentTx.paymentAmount.toLocaleString()} ${t('ecoAccounts.som')}` : '—',
      status: acc.status,
    }
  })
})

// Balance formatting
const formatBalance = (balance: number): string => {
  return Math.abs(balance).toLocaleString() + ' ' + t('ecoAccounts.som')
}

const getBalanceLabel = (balance: number): string => {
  if (balance < 0) return t('ecoAccounts.debt')
  if (balance > 0) return t('ecoAccounts.overpayment')
  return t('ecoAccounts.paid')
}

const getBalanceColor = (balance: number): string => {
  if (balance < 0) return '#EF4444'
  if (balance > 0) return '#F59E0B'
  return '#059669'
}

const getStatusStyle = (status: string) => {
  if (status === 'active') return 'background:#D1FAE5;color:#065F46'
  return 'background:#FEE2E2;color:#991B1B'
}

const viewPayer = (row: { id: number }) => {
  router.push(`/eco-operator/accounts/${row.id}`)
}

const isFiltersActive = computed(() => !!searchQuery.value || balanceFilter.value !== 'all')
const resetFilters = () => { searchQuery.value = ''; balanceFilter.value = 'all' }
</script>

<template>
  <DashboardLayout
    role="eco-operator"
    :roleTitle="roleTitle"
    userName="Экологический оператор"
    :menuItems="menuItems"
  >
    <div class="mb-6">
      <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b] mb-2">{{ $t('pages.ecoOperator.accountsTitle') }}</h1>
      <p class="text-[#64748b]">{{ $t('pages.ecoOperator.accountsSubtitle') }}</p>
    </div>

    <SectionGuide
      :title="$t('ecoAccounts.guideTitle')"
      :description="$t('ecoAccounts.guideDescription')"
      :actions="[$t('ecoAccounts.guideAction1'), $t('ecoAccounts.guideAction2'), $t('ecoAccounts.guideAction3'), $t('ecoAccounts.guideAction4')]"
      storageKey="eco-accounts"
    />

    <!-- KPI Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <!-- 1. Total organizations -->
      <div class="bg-white rounded-2xl p-5 border border-[#e2e8f0] shadow-sm">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 bg-[#64748b] rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </div>
          <p class="text-sm font-medium text-[#64748b]">{{ $t('ecoAccounts.totalOrganizations') }}</p>
        </div>
        <p class="text-3xl font-bold text-[#1e293b]">{{ totalCompanies }}</p>
      </div>

      <!-- 2. With debt -->
      <div class="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-5 border border-red-200 shadow-sm">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 bg-[#EF4444] rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
          </div>
          <p class="text-sm font-medium text-red-800">{{ $t('ecoAccounts.withDebt') }}</p>
        </div>
        <p class="text-3xl font-bold text-red-900">{{ debtAccounts.length }}</p>
        <p class="text-xs text-red-600 mt-1 font-medium">{{ totalDebt.toLocaleString() }} {{ $t('ecoAccounts.som') }}</p>
      </div>

      <!-- 3. Overpaid -->
      <div class="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-5 border border-amber-200 shadow-sm">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 bg-[#F59E0B] rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
          </div>
          <p class="text-sm font-medium text-amber-800">{{ $t('ecoAccounts.withOverpayment') }}</p>
        </div>
        <p class="text-3xl font-bold text-amber-900">{{ overpaidAccounts.length }}</p>
        <p class="text-xs text-amber-600 mt-1 font-medium">{{ totalOverpaid.toLocaleString() }} {{ $t('ecoAccounts.som') }}</p>
      </div>

      <!-- 4. No debt (balance = 0) -->
      <div class="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-5 border border-emerald-200 shadow-sm">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 bg-[#059669] rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
          </div>
          <p class="text-sm font-medium text-emerald-800">{{ $t('ecoAccounts.noDebt') }}</p>
        </div>
        <p class="text-3xl font-bold text-emerald-900">{{ zeroAccounts.length }}</p>
      </div>
    </div>

    <template v-if="isLoading">
      <div class="mb-6"><SkeletonLoader variant="card" /></div>
      <SkeletonLoader variant="table" />
    </template>

    <template v-if="!isLoading">
      <!-- Filter tabs + search -->
      <div class="bg-white rounded-2xl p-4 shadow-sm border border-[#e2e8f0] mb-6">
        <div class="flex flex-wrap gap-2 mb-3">
          <button
            v-for="tab in ([
              { key: 'all', label: $t('ecoAccounts.tabAll'), count: totalCompanies },
              { key: 'debt', label: $t('ecoAccounts.tabDebt'), count: debtAccounts.length },
              { key: 'overpaid', label: $t('ecoAccounts.tabOverpaid'), count: overpaidAccounts.length },
              { key: 'zero', label: $t('ecoAccounts.tabNoDebt'), count: zeroAccounts.length },
            ] as { key: BalanceFilter, label: string, count: number }[])"
            :key="tab.key"
            @click="balanceFilter = tab.key"
            :class="[
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              balanceFilter === tab.key
                ? tab.key === 'debt' ? 'bg-red-100 text-red-700'
                  : tab.key === 'overpaid' ? 'bg-amber-100 text-amber-700'
                  : tab.key === 'zero' ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-[#1e293b] text-white'
                : 'bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0]'
            ]"
          >
            {{ tab.label }}
            <span :class="[
              'ml-1.5 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-semibold',
              balanceFilter === tab.key
                ? tab.key === 'debt' ? 'bg-red-200 text-red-800'
                  : tab.key === 'overpaid' ? 'bg-amber-200 text-amber-800'
                  : tab.key === 'zero' ? 'bg-emerald-200 text-emerald-800'
                  : 'bg-white/20 text-white'
                : 'bg-[#e2e8f0] text-[#64748b]'
            ]">{{ tab.count }}</span>
          </button>
        </div>
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="$t('ecoAccounts.searchPlaceholder')"
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
          <div class="flex items-start gap-2">
            <!-- Icon -->
            <div class="mt-0.5 flex-shrink-0">
              <!-- Debt: red arrow down -->
              <svg v-if="row.balance < 0" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="#EF4444" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
              <!-- Overpaid: amber arrow up -->
              <svg v-else-if="row.balance > 0" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="#F59E0B" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
              <!-- Zero: green check -->
              <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="#059669" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
            </div>
            <div>
              <p class="font-bold text-sm leading-tight" :style="{ color: getBalanceColor(row.balance) }">{{ formatBalance(row.balance) }}</p>
              <p class="text-[11px] font-medium leading-tight mt-0.5" :style="{ color: getBalanceColor(row.balance) }">{{ getBalanceLabel(row.balance) }}</p>
            </div>
          </div>
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
          <AppButton variant="ghost" size="sm" @click="viewPayer(row)">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            {{ $t('ecoAccounts.details') }}
          </AppButton>
        </template>
        <template #empty>
          <EmptyState
            v-if="isFiltersActive"
            icon='<svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>'
            :title="$t('ecoAccounts.notFound')"
            :description="$t('ecoAccounts.tryChangeSearch')"
            :actionLabel="$t('empty.resetFilters')"
            @action="resetFilters"
          />
          <EmptyState
            v-else
            icon='<svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>'
            :title="$t('empty.noAccounts')"
            :description="$t('ecoAccounts.noPayersRegistered')"
          />
        </template>
      </DataTable>
    </template>
  </DashboardLayout>
</template>
