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

const columns = [
  { key: 'number', label: 'Номер заявки', width: '12%' },
  { key: 'company', label: 'Плательщик', width: '18%' },
  { key: 'date', label: 'Дата', width: '9%' },
  { key: 'calculationNumber', label: 'Связанный расчёт', width: '14%' },
  { key: 'totalRefund', label: 'Сумма возврата', width: '12%' },
  { key: 'status', label: 'Статус', width: '12%' },
]

// Filters
const searchQuery = ref('')
const statusFilter = ref('')

const filteredRefunds = computed(() => {
  let list = [...refundStore.state.refunds]
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(r => r.number.toLowerCase().includes(q) || r.company.toLowerCase().includes(q) || r.inn.includes(q))
  }
  if (statusFilter.value) {
    list = list.filter(r => r.status === statusFilter.value)
  }
  return list
})

// Stats
const totalCount = computed(() => refundStore.state.refunds.length)
const pendingCount = computed(() => refundStore.state.refunds.filter(r => r.status === 'На рассмотрении' || r.status === 'Новая').length)
const approvedCount = computed(() => refundStore.state.refunds.filter(r => r.status === 'Одобрена').length)
const rejectedCount = computed(() => refundStore.state.refunds.filter(r => r.status === 'Отклонена').length)

const getStatusClass = (status: string) => {
  switch (status) {
    case 'Новая': return 'bg-blue-100 text-blue-800'
    case 'На рассмотрении': return 'bg-yellow-100 text-yellow-800'
    case 'Одобрена': return 'bg-green-100 text-green-800'
    case 'Отклонена': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const viewRefund = (row: any) => {
  router.push(`/eco-operator/refunds/${row.id}`)
}

// Empty state helpers
const allRefunds = computed(() => refundStore.state.refunds)
const isFiltersActive = computed(() => !!(searchQuery.value || statusFilter.value))

const resetFilters = () => {
  searchQuery.value = ''
  statusFilter.value = ''
}
</script>

<template>
  <DashboardLayout
    role="eco-operator"
    roleTitle="ГП Эко Оператор"
    userName="Экологический оператор"
    :menuItems="menuItems"
  >
    <div class="mb-6">
      <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b] mb-2">Заявки на возврат утилизационного сбора</h1>
      <p class="text-[#64748b]">Входящие заявки на возврат утилизационного сбора от плательщиков</p>
    </div>

    <!-- Gradient Stat Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-5 border border-yellow-200 shadow-sm">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p class="text-sm font-medium text-yellow-800">На рассмотрении</p>
        </div>
        <p class="text-3xl font-bold text-yellow-900">{{ pendingCount }}</p>
        <p class="text-xs text-yellow-600 mt-1">заявок ожидают решения</p>
      </div>
      <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-5 border border-green-200 shadow-sm">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p class="text-sm font-medium text-green-800">Одобрено</p>
        </div>
        <p class="text-3xl font-bold text-green-900">{{ approvedCount }}</p>
        <p class="text-xs text-green-600 mt-1">заявок одобрено</p>
      </div>
      <div class="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-5 border border-red-200 shadow-sm">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p class="text-sm font-medium text-red-800">Отклонено</p>
        </div>
        <p class="text-3xl font-bold text-red-900">{{ rejectedCount }}</p>
        <p class="text-xs text-red-600 mt-1">заявок отклонено</p>
      </div>
      <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 border border-blue-200 shadow-sm">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <p class="text-sm font-medium text-blue-800">Всего заявок</p>
        </div>
        <p class="text-3xl font-bold text-blue-900">{{ totalCount }}</p>
        <p class="text-xs text-blue-600 mt-1">всего получено</p>
      </div>
    </div>

    <!-- Yellow Alert Banner -->
    <div v-if="pendingCount > 0" class="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-center gap-3">
      <div class="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center flex-shrink-0">
        <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      </div>
      <div>
        <p class="text-sm font-semibold text-yellow-900">Требуется внимание</p>
        <p class="text-xs text-yellow-700">{{ pendingCount }} {{ pendingCount === 1 ? 'новая заявка' : 'новых заявок' }} на рассмотрении. Проверьте данные и примите решение.</p>
      </div>
    </div>

    <template v-if="isLoading">
      <div class="mb-6"><SkeletonLoader variant="card" /></div>
      <SkeletonLoader variant="table" />
    </template>

    <template v-if="!isLoading">
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
          <option value="Новая">Новая</option>
          <option value="На рассмотрении">На рассмотрении</option>
          <option value="Одобрена">Одобрена</option>
          <option value="Отклонена">Отклонена</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <DataTable :columns="columns" :data="filteredRefunds" :actions="true">
      <template #cell-number="{ value }">
        <span class="font-mono font-medium text-[#2563eb]">{{ value }}</span>
      </template>
      <template #cell-company="{ value }">
        <span class="font-medium text-[#1e293b]">{{ value }}</span>
      </template>
      <template #cell-calculationNumber="{ value }">
        <span class="font-mono text-sm text-[#64748b]">{{ value }}</span>
      </template>
      <template #cell-totalRefund="{ value }">
        <span class="font-semibold text-[#10b981]">{{ value.toLocaleString('ru-RU') }} сом</span>
      </template>
      <template #cell-status="{ value }">
        <span :class="['px-3 py-1 rounded-full text-xs font-medium', getStatusClass(value)]">
          {{ value }}
        </span>
      </template>
      <template #actions="{ row }">
        <div class="flex items-center justify-end gap-2">
          <button
            @click="viewRefund(row)"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#3B82F6] text-white hover:bg-[#2563EB] transition-colors shadow-sm"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Просмотреть
          </button>
        </div>
      </template>
      <template #empty>
        <EmptyState
          v-if="isFiltersActive && allRefunds.length > 0"
          icon='<svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>'
          title="Ничего не найдено"
          description="Попробуйте изменить параметры поиска"
          actionLabel="Сбросить фильтры"
          @action="resetFilters"
        />
        <EmptyState
          v-else
          icon='<svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>'
          title="Нет заявок на возврат"
          description="Заявки на возврат утилизационного сбора пока не поступали"
        />
      </template>
    </DataTable>
    </template>
  </DashboardLayout>
</template>
