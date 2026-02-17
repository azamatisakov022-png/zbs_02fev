<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import DataTable from '../../components/dashboard/DataTable.vue'
import EmptyState from '../../components/dashboard/EmptyState.vue'
import SkeletonLoader from '../../components/dashboard/SkeletonLoader.vue'
import { accountStore } from '../../stores/account'
import { useBusinessMenu } from '../../composables/useRoleMenu'

const router = useRouter()
const { roleTitle, menuItems } = useBusinessMenu()

// Loading state
const isLoading = ref(true)
onMounted(() => { setTimeout(() => { isLoading.value = false }, 500) })

// Balance
const balance = computed(() => accountStore.getCurrentBalance())
const transactions = computed(() => accountStore.getTransactions())

// Stats
const totalTransactions = computed(() => transactions.value.length)
const totalCharged = computed(() =>
  transactions.value.reduce((sum, t) => sum + t.chargeAmount, 0)
)
const totalPaid = computed(() =>
  transactions.value.reduce((sum, t) => sum + t.paymentAmount, 0)
)
const totalCorrections = computed(() =>
  transactions.value
    .filter(t => t.type === 'correction')
    .reduce((sum, t) => sum + t.offsetAmount, 0)
)

// Format amounts
const formatAmount = (amount: number) => amount.toLocaleString('ru-RU') + ' сом'

// Type labels and styling
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

const getTypeColor = (type: string) => {
  switch (type) {
    case 'charge': return 'text-red-600'
    case 'payment': return 'text-green-600'
    case 'correction': return 'text-blue-600'
    case 'offset': return 'text-yellow-600'
    case 'refund': return 'text-purple-600'
    default: return 'text-[#64748b]'
  }
}

const getTypeBgColor = (type: string) => {
  switch (type) {
    case 'charge': return 'bg-red-100'
    case 'payment': return 'bg-green-100'
    case 'correction': return 'bg-blue-100'
    case 'offset': return 'bg-yellow-100'
    case 'refund': return 'bg-purple-100'
    default: return 'bg-gray-100'
  }
}

// Table columns
const columns = [
  { key: 'date', label: 'Дата', width: '8%' },
  { key: 'type', label: 'Операция', width: '18%' },
  { key: 'calculationNumber', label: 'Расчёт', width: '12%' },
  { key: 'chargeAmount', label: 'Начислено', width: '12%' },
  { key: 'paymentAmount', label: 'Оплачено', width: '12%' },
  { key: 'offsetAmount', label: 'Зачтено', width: '12%' },
  { key: 'balance', label: 'Баланс', width: '12%' },
]
</script>

<template>
  <DashboardLayout role="business" :roleTitle="roleTitle" userName="ОсОО «ТехПром»" :menuItems="menuItems">
    <!-- Header -->
    <div class="content__header mb-6">
      <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b] mb-2">Лицевой счёт</h1>
      <p class="text-[#64748b]">Баланс, начисления, оплаты и корректировки</p>
    </div>

    <!-- Loading State -->
    <template v-if="isLoading">
      <div class="mb-6"><SkeletonLoader variant="card" /></div>
      <div class="mb-6"><SkeletonLoader variant="card" /></div>
      <SkeletonLoader variant="table" />
    </template>

    <template v-if="!isLoading">
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
          <!-- Balance Info -->
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
                Переплата: {{ formatAmount(balance) }}
              </p>
              <p v-else-if="balance < 0" class="text-2xl lg:text-3xl font-bold text-red-700">
                Задолженность: {{ formatAmount(Math.abs(balance)) }}
              </p>
              <p v-else class="text-2xl lg:text-3xl font-bold text-slate-600">
                Баланс: 0 сом
              </p>
              <p v-if="balance > 0" class="text-sm text-green-600 mt-1">Доступно для зачёта в счёт будущих оплат</p>
              <p v-else-if="balance < 0" class="text-sm text-red-600 mt-1">Необходимо оплатить</p>
              <p v-else class="text-sm text-slate-500 mt-1">Задолженности нет</p>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <router-link
              to="/business/account/correction"
              class="flex items-center justify-center gap-2 px-5 py-3 border-2 border-blue-500 text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Подать корректировку
            </router-link>
            <button
              v-if="balance > 0"
              class="flex items-center justify-center gap-2 px-5 py-3 bg-[#64748b] text-white rounded-xl font-semibold hover:bg-[#475569] transition-colors"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              Запросить возврат средств
            </button>
          </div>
        </div>
      </div>

      <!-- Stats Row -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="bg-white rounded-2xl p-4 shadow-sm border border-[#e2e8f0]">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <svg class="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <p class="text-sm text-[#64748b] mb-1">Всего операций</p>
          <p class="text-2xl font-bold text-[#1e293b]">{{ totalTransactions }}</p>
        </div>

        <div class="bg-white rounded-2xl p-4 shadow-sm border border-[#e2e8f0]">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <svg class="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
          <p class="text-sm text-[#64748b] mb-1">Начислено</p>
          <p class="text-2xl font-bold text-red-600">{{ formatAmount(totalCharged) }}</p>
        </div>

        <div class="bg-white rounded-2xl p-4 shadow-sm border border-[#e2e8f0]">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <svg class="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </div>
          </div>
          <p class="text-sm text-[#64748b] mb-1">Оплачено</p>
          <p class="text-2xl font-bold text-green-600">{{ formatAmount(totalPaid) }}</p>
        </div>

        <div class="bg-white rounded-2xl p-4 shadow-sm border border-[#e2e8f0]">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <svg class="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
          </div>
          <p class="text-sm text-[#64748b] mb-1">Корректировки</p>
          <p class="text-2xl font-bold text-purple-600">{{ formatAmount(totalCorrections) }}</p>
        </div>
      </div>

      <!-- Transaction History -->
      <div class="mb-4">
        <h2 class="text-lg font-semibold text-[#1e293b] mb-4">История операций</h2>
      </div>

      <DataTable :columns="columns" :data="transactions" :actions="false">
        <template #empty>
          <EmptyState
            :icon="'<svg class=&quot;w-10 h-10&quot; fill=&quot;none&quot; viewBox=&quot;0 0 40 40&quot; stroke=&quot;currentColor&quot; stroke-width=&quot;1.5&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; d=&quot;M20 13.33v5m0 0v5m0-5h5m-5 0h-5M35 20a15 15 0 11-30 0 15 15 0 0130 0z&quot;/></svg>'"
            title="Нет операций"
            description="Операции появятся после первого начисления"
          />
        </template>

        <!-- Date -->
        <template #cell-date="{ value }">
          <span class="text-sm text-[#1e293b] whitespace-nowrap">{{ value }}</span>
        </template>

        <!-- Type -->
        <template #cell-type="{ row }">
          <div class="flex items-center gap-2">
            <div :class="['w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0', getTypeBgColor(row.type)]">
              <!-- charge: red downward arrow -->
              <svg v-if="row.type === 'charge'" :class="['w-4 h-4', getTypeColor(row.type)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
              <!-- payment: green upward arrow -->
              <svg v-else-if="row.type === 'payment'" :class="['w-4 h-4', getTypeColor(row.type)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              <!-- correction: blue return arrow -->
              <svg v-else-if="row.type === 'correction'" :class="['w-4 h-4', getTypeColor(row.type)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              <!-- offset: yellow arrow -->
              <svg v-else-if="row.type === 'offset'" :class="['w-4 h-4', getTypeColor(row.type)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <!-- refund: purple outward arrow -->
              <svg v-else-if="row.type === 'refund'" :class="['w-4 h-4', getTypeColor(row.type)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <div>
              <span :class="['text-sm font-medium', getTypeColor(row.type)]">{{ getTypeLabel(row.type) }}</span>
              <p class="text-xs text-[#94a3b8] leading-tight mt-0.5">{{ row.description }}</p>
            </div>
          </div>
        </template>

        <!-- Calculation Number -->
        <template #cell-calculationNumber="{ row }">
          <router-link
            :to="`/business/calculations/${row.calculationId}`"
            class="font-mono text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors"
          >
            {{ row.calculationNumber }}
          </router-link>
        </template>

        <!-- Charge Amount -->
        <template #cell-chargeAmount="{ value }">
          <span v-if="value > 0" class="text-sm font-medium text-red-600">
            -{{ value.toLocaleString('ru-RU') }} сом
          </span>
          <span v-else class="text-sm text-[#cbd5e1]">&mdash;</span>
        </template>

        <!-- Payment Amount -->
        <template #cell-paymentAmount="{ value }">
          <span v-if="value > 0" class="text-sm font-medium text-green-600">
            +{{ value.toLocaleString('ru-RU') }} сом
          </span>
          <span v-else class="text-sm text-[#cbd5e1]">&mdash;</span>
        </template>

        <!-- Offset Amount -->
        <template #cell-offsetAmount="{ value }">
          <span v-if="value > 0" class="text-sm font-medium text-purple-600">
            {{ value.toLocaleString('ru-RU') }} сом
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
            {{ value.toLocaleString('ru-RU') }} сом
          </span>
        </template>
      </DataTable>
    </template>
  </DashboardLayout>
</template>

<style scoped>
@media print {
  .dashboard-layout > aside,
  .dashboard-layout > main > header,
  .lg\:hidden {
    display: none !important;
  }
  .lg\:ml-72 {
    margin-left: 0 !important;
  }
}
</style>
