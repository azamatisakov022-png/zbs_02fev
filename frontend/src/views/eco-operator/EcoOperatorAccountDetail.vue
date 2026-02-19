<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import DataTable from '../../components/dashboard/DataTable.vue'
import SkeletonLoader from '../../components/dashboard/SkeletonLoader.vue'
import { accountStore, type CompanyAccount, type AccountTransaction } from '../../stores/account'
import { AppButton, AppBadge } from '../../components/ui'
import { getStatusBadgeVariant } from '../../utils/statusVariant'
import { useEcoOperatorMenu } from '../../composables/useRoleMenu'

const route = useRoute()
const router = useRouter()
const { roleTitle, menuItems } = useEcoOperatorMenu()

// Loading state
const isLoading = ref(true)
const accountNotFound = ref(false)

// Account data
const account = ref<CompanyAccount | undefined>(undefined)

onMounted(() => {
  const id = Number(route.params.id)
  account.value = accountStore.getAccountById(id)
  if (!account.value) {
    accountNotFound.value = true
  }
  setTimeout(() => { isLoading.value = false }, 500)
})

// Filter state
const filterDateFrom = ref('')
const filterDateTo = ref('')
const filterType = ref('')

// Parse date string "dd.mm.yyyy" to Date
const parseDate = (dateStr: string): Date => {
  const [d, m, y] = dateStr.split('.')
  return new Date(parseInt(y), parseInt(m) - 1, parseInt(d))
}

// Filtered transactions
const filteredTransactions = computed((): AccountTransaction[] => {
  if (!account.value) return []
  let txs = [...account.value.transactions]

  // Filter by date range
  if (filterDateFrom.value) {
    const from = new Date(filterDateFrom.value)
    txs = txs.filter(t => parseDate(t.date) >= from)
  }
  if (filterDateTo.value) {
    const to = new Date(filterDateTo.value)
    to.setHours(23, 59, 59, 999)
    txs = txs.filter(t => parseDate(t.date) <= to)
  }

  // Filter by transaction type
  if (filterType.value) {
    txs = txs.filter(t => t.type === filterType.value)
  }

  return txs
})

// Balance
const balance = computed(() => account.value?.balance ?? 0)

// Format helpers
const formatAmount = (amount: number) => amount.toLocaleString('ru-RU') + ' сом'

const formatBalance = (val: number): string => {
  const formatted = Math.abs(val).toLocaleString('ru-RU')
  if (val > 0) return '+' + formatted + ' сом'
  if (val < 0) return '-' + formatted + ' сом'
  return '0 сом'
}

// Type labels
const getTypeLabel = (type: string) => {
  switch (type) {
    case 'charge': return 'Начисление'
    case 'payment': return 'Оплата'
    case 'correction': return 'Корректировка'
    case 'offset': return 'Зачёт'
    case 'refund': return 'Возврат'
    default: return type
  }
}

// Type badge colors
const getTypeBadgeClass = (type: string) => {
  switch (type) {
    case 'charge': return 'bg-red-100 text-red-800'
    case 'payment': return 'bg-green-100 text-green-800'
    case 'correction': return 'bg-purple-100 text-purple-800'
    case 'offset': return 'bg-blue-100 text-blue-800'
    case 'refund': return 'bg-orange-100 text-orange-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

// Table columns
const columns = [
  { key: 'date', label: 'Дата', width: '10%' },
  { key: 'type', label: 'Тип', width: '12%' },
  { key: 'calculationNumber', label: 'Расчёт', width: '14%' },
  { key: 'description', label: 'Описание', width: '24%' },
  { key: 'chargeAmount', label: 'Сумма', width: '15%' },
  { key: 'balance', label: 'Баланс', width: '15%' },
]

// Reset filters
const resetFilters = () => {
  filterDateFrom.value = ''
  filterDateTo.value = ''
  filterType.value = ''
}

const isFiltersActive = computed(() => !!filterDateFrom.value || !!filterDateTo.value || !!filterType.value)
</script>

<template>
  <DashboardLayout
    role="eco-operator"
    :roleTitle="roleTitle"
    userName="Экологический оператор"
    :menuItems="menuItems"
  >
    <!-- Loading State -->
    <template v-if="isLoading">
      <div class="mb-6"><SkeletonLoader variant="card" /></div>
      <div class="mb-6"><SkeletonLoader variant="card" /></div>
      <div class="mb-6"><SkeletonLoader variant="card" /></div>
      <SkeletonLoader variant="table" />
    </template>

    <template v-if="!isLoading && accountNotFound">
      <div class="mb-6">
        <router-link
          to="/eco-operator/accounts"
          class="inline-flex items-center gap-2 text-[#2563eb] hover:text-[#1d4ed8] font-medium transition-colors"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {{ $t('common.back') }}
        </router-link>
      </div>
      <div class="bg-white rounded-2xl p-8 shadow-sm border border-[#e2e8f0] text-center">
        <div class="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 class="text-xl font-bold text-[#1e293b] mb-2">Лицевой счёт не найден</h2>
        <p class="text-[#64748b] mb-6">Лицевой счёт с указанным идентификатором не существует или был удалён.</p>
        <router-link
          to="/eco-operator/accounts"
          class="inline-flex items-center gap-2 px-5 py-3 bg-[#2563eb] text-white rounded-xl font-semibold hover:bg-[#1d4ed8] transition-colors"
        >
          Вернуться к списку
        </router-link>
      </div>
    </template>

    <template v-if="!isLoading && !accountNotFound && account">
      <!-- Back button -->
      <div class="mb-6">
        <router-link
          to="/eco-operator/accounts"
          class="inline-flex items-center gap-2 text-[#2563eb] hover:text-[#1d4ed8] font-medium transition-colors"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {{ $t('common.back') }}
        </router-link>
      </div>

      <!-- Page title -->
      <div class="mb-6">
        <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b] mb-2">{{ account.company }}</h1>
        <p class="text-[#64748b]">Детализация лицевого счёта и история операций</p>
      </div>

      <!-- Company Info Card -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-[#e2e8f0] mb-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <svg class="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h2 class="text-lg font-bold text-[#1e293b]">{{ account.company }}</h2>
              <p class="text-sm text-[#64748b]">ИНН: <span class="font-mono">{{ account.inn }}</span></p>
            </div>
          </div>
          <div>
            <AppBadge :variant="getStatusBadgeVariant(account.status)">{{ account.status }}</AppBadge>
          </div>
        </div>
      </div>

      <!-- Balance Card -->
      <div
        :class="[
          'rounded-2xl p-6 lg:p-8 mb-6 relative overflow-hidden',
          balance > 0
            ? 'bg-gradient-to-r from-green-50 to-green-100 border border-green-200'
            : balance < 0
              ? 'bg-gradient-to-r from-red-50 to-red-100 border border-red-200'
              : 'bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200'
        ]"
      >
        <div class="absolute top-0 right-0 w-48 h-48 rounded-full -translate-y-1/2 translate-x-1/2"
          :class="balance > 0 ? 'bg-green-200/30' : balance < 0 ? 'bg-red-200/30' : 'bg-slate-200/30'"
        ></div>
        <div class="absolute bottom-0 left-0 w-32 h-32 rounded-full translate-y-1/2 -translate-x-1/2"
          :class="balance > 0 ? 'bg-green-200/30' : balance < 0 ? 'bg-red-200/30' : 'bg-slate-200/30'"
        ></div>

        <div class="relative flex flex-col lg:flex-row lg:items-center gap-6">
          <div class="flex items-center gap-4 flex-1">
            <div
              :class="[
                'w-16 h-16 lg:w-20 lg:h-20 rounded-2xl flex items-center justify-center flex-shrink-0',
                balance > 0 ? 'bg-green-200/50' : balance < 0 ? 'bg-red-200/50' : 'bg-slate-200/50'
              ]"
            >
              <svg
                :class="['w-8 h-8 lg:w-10 lg:h-10', balance > 0 ? 'text-green-600' : balance < 0 ? 'text-red-600' : 'text-slate-500']"
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p v-if="balance > 0" class="text-2xl lg:text-3xl font-bold text-green-700">
                {{ formatAmount(balance) }}
              </p>
              <p v-else-if="balance < 0" class="text-2xl lg:text-3xl font-bold text-red-700">
                {{ formatAmount(Math.abs(balance)) }}
              </p>
              <p v-else class="text-2xl lg:text-3xl font-bold text-slate-600">
                0 сом
              </p>
              <p v-if="balance > 0" class="text-sm text-green-600 mt-1">Переплата</p>
              <p v-else-if="balance < 0" class="text-sm text-red-600 mt-1">Задолженность</p>
              <p v-else class="text-sm text-slate-500 mt-1">Баланс нулевой</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filter Bar -->
      <div class="bg-white rounded-2xl p-4 shadow-sm border border-[#e2e8f0] mb-6">
        <div class="flex flex-wrap items-end gap-4">
          <div class="flex flex-col">
            <label class="text-xs font-medium text-[#64748b] mb-1">Дата с</label>
            <input
              v-model="filterDateFrom"
              type="date"
              class="px-3 py-2 border border-[#e2e8f0] rounded-lg text-sm focus:outline-none focus:border-[#2563eb]"
            />
          </div>
          <div class="flex flex-col">
            <label class="text-xs font-medium text-[#64748b] mb-1">Дата по</label>
            <input
              v-model="filterDateTo"
              type="date"
              class="px-3 py-2 border border-[#e2e8f0] rounded-lg text-sm focus:outline-none focus:border-[#2563eb]"
            />
          </div>
          <div class="flex flex-col">
            <label class="text-xs font-medium text-[#64748b] mb-1">Тип операции</label>
            <select
              v-model="filterType"
              class="px-3 py-2 border border-[#e2e8f0] rounded-lg text-sm focus:outline-none focus:border-[#2563eb] bg-white min-w-[180px]"
            >
              <option value="">Все</option>
              <option value="charge">Начисление</option>
              <option value="payment">Оплата</option>
              <option value="correction">Корректировка</option>
              <option value="offset">Зачёт</option>
              <option value="refund">Возврат</option>
            </select>
          </div>
          <button
            v-if="isFiltersActive"
            @click="resetFilters"
            class="px-4 py-2 text-sm text-[#64748b] hover:text-[#1e293b] border border-[#e2e8f0] rounded-lg hover:bg-gray-50 transition-colors"
          >
            {{ $t('common.reset') }}
          </button>
        </div>
      </div>

      <!-- Transaction History Header -->
      <div class="mb-4">
        <h2 class="text-lg font-semibold text-[#1e293b]">История операций</h2>
        <p class="text-sm text-[#64748b]">{{ filteredTransactions.length }} {{ filteredTransactions.length === 1 ? 'операция' : filteredTransactions.length >= 2 && filteredTransactions.length <= 4 ? 'операции' : 'операций' }}</p>
      </div>

      <!-- Transaction Table -->
      <DataTable :columns="columns" :data="filteredTransactions" :actions="true">
        <!-- Date -->
        <template #cell-date="{ value }">
          <span class="text-sm text-[#1e293b] whitespace-nowrap">{{ value }}</span>
        </template>

        <!-- Type -->
        <template #cell-type="{ row }">
          <AppBadge :variant="getStatusBadgeVariant(getTypeLabel(row.type))">{{ getTypeLabel(row.type) }}</AppBadge>
        </template>

        <!-- Calculation Number -->
        <template #cell-calculationNumber="{ row }">
          <router-link
            :to="`/eco-operator/calculations/${row.calculationId}`"
            class="font-mono text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors"
          >
            {{ row.calculationNumber }}
          </router-link>
        </template>

        <!-- Description -->
        <template #cell-description="{ value }">
          <span class="text-sm text-[#64748b]">{{ value }}</span>
        </template>

        <!-- Amount (chargeAmount column used for combined display) -->
        <template #cell-chargeAmount="{ row }">
          <span v-if="row.chargeAmount > 0" class="text-sm font-medium text-red-600">
            -{{ row.chargeAmount.toLocaleString('ru-RU') }} сом
          </span>
          <span v-else-if="row.paymentAmount > 0" class="text-sm font-medium text-green-600">
            +{{ row.paymentAmount.toLocaleString('ru-RU') }} сом
          </span>
          <span v-else-if="row.offsetAmount > 0" class="text-sm font-medium text-blue-600">
            {{ row.offsetAmount.toLocaleString('ru-RU') }} сом
          </span>
          <span v-else class="text-sm text-[#cbd5e1]">&mdash;</span>
        </template>

        <!-- Balance -->
        <template #cell-balance="{ value }">
          <span
            :class="[
              'text-sm font-bold',
              value > 0 ? 'text-green-600' : value < 0 ? 'text-red-600' : 'text-[#94a3b8]'
            ]"
          >
            {{ value > 0 ? '+' : '' }}{{ value.toLocaleString('ru-RU') }} сом
          </span>
        </template>

        <!-- Actions -->
        <template #actions="{ row }">
          <div class="flex items-center justify-end">
            <AppButton variant="ghost" size="sm" @click="router.push({ path: `/eco-operator/calculations/${row.calculationId}`, query: { from: 'accounts' } })">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Просмотреть расчёт
            </AppButton>
          </div>
        </template>

        <!-- Empty state -->
        <template #empty>
          <div class="text-center py-12">
            <div class="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-[#1e293b] mb-1">Нет операций</h3>
            <p v-if="isFiltersActive" class="text-sm text-[#64748b] mb-4">По выбранным фильтрам операции не найдены</p>
            <p v-else class="text-sm text-[#64748b]">Операции появятся после первого начисления</p>
            <button
              v-if="isFiltersActive"
              @click="resetFilters"
              class="mt-2 px-4 py-2 text-sm font-medium text-[#2563eb] hover:text-[#1d4ed8] border border-[#2563eb] rounded-lg hover:bg-blue-50 transition-colors"
            >
              {{ $t('empty.resetFilters') }}
            </button>
          </div>
        </template>
      </DataTable>
    </template>
  </DashboardLayout>
</template>
