<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import SkeletonLoader from '../../components/dashboard/SkeletonLoader.vue'
import StatsCard from '../../components/dashboard/StatsCard.vue'
import LineChart from '../../components/charts/LineChart.vue'
import PieChart from '../../components/charts/PieChart.vue'
import ProgressBar from '../../components/charts/ProgressBar.vue'
import { statsIcons } from '../../utils/menuIcons'
import { useCalculationStore } from '../../stores/calculations'
import { useAccountStore } from '../../stores/account'
import { useBusinessMenu } from '../../composables/useRoleMenu'
import { CalcStatus } from '../../constants/statuses'
import { statusI18nKey } from '../../constants/statuses'
import { getStatusBadgeVariant } from '../../utils/statusVariant'

const { t } = useI18n()
const { roleTitle, menuItems } = useBusinessMenu()
const account = useAccountStore()
const calcStore = useCalculationStore()

const actionCards = computed(() => [
  {
    icon: '💰',
    title: t('businessDashboard.actionCalcTitle'),
    description: t('businessDashboard.actionCalcDesc'),
    route: '/business/calculator',
    color: 'orange'
  },
  {
    icon: '📊',
    title: t('businessDashboard.actionReportTitle'),
    description: t('businessDashboard.actionReportDesc'),
    route: '/business/reports',
    color: 'green'
  },
  {
    icon: '📝',
    title: t('businessDashboard.actionDeclTitle'),
    description: t('businessDashboard.actionDeclDesc'),
    route: '/business/declarations',
    color: 'blue'
  }
])

const myCalcs = computed(() => calcStore.getBusinessCalculations(account.myAccount?.company || ''))

const stats = computed(() => [
  { title: t('businessDashboard.totalCalcs'), value: String(myCalcs.value.length), icon: statsIcons.applications, color: 'blue' as const },
  { title: t('businessDashboard.paid'), value: String(myCalcs.value.filter(c => c.status === CalcStatus.PAID).length), icon: statsIcons.approved, color: 'green' as const },
  { title: t('businessDashboard.underReview'), value: String(myCalcs.value.filter(c => c.status === CalcStatus.UNDER_REVIEW || c.status === CalcStatus.PAYMENT_PENDING).length), icon: statsIcons.pending, color: 'orange' as const },
  {
    title: t('businessDashboard.totalAmount'),
    value: myCalcs.value.reduce((s, c) => s + c.totalAmount, 0).toLocaleString() + ' ' + t('businessDashboard.som'),
    icon: statsIcons.money,
    color: 'purple' as const
  },
])

// Mock monthly data for line chart
const monthlyData = [
  { label: 'Авг', value: 85000 },
  { label: 'Сен', value: 120000 },
  { label: 'Окт', value: 95000 },
  { label: 'Ноя', value: 180000 },
  { label: 'Дек', value: 250000 },
  { label: 'Янв', value: 310000 },
  { label: 'Фев', value: 175000 },
]

// Pie chart data from calculations by group
const pieData = [
  { label: 'Пластик (группа 6)', value: 42, color: '#2563eb' },
  { label: 'Бумага/картон (группа 1)', value: 28, color: '#10b981' },
  { label: 'Стекло (группа 8)', value: 18, color: '#f59e0b' },
  { label: 'Металл (группа 5)', value: 8, color: '#6366f1' },
  { label: 'Прочее', value: 4, color: '#94a3b8' },
]

// Progress bar normative items
const normativeItems = [
  { label: 'Пластик (группа 6)', current: 11.8, target: 12.5, unit: ' т' },
  { label: 'Бумага/картон (группа 1)', current: 8.3, target: 8.3, unit: ' т' },
  { label: 'Стекло (группа 8)', current: 5.0, target: 5.2, unit: ' т' },
]

const recentDocuments = [
  { name: 'Декларация Q4 2024', status: 'approved', date: '20.01.2025', type: 'declaration' },
  { name: 'Отчёт о переработке 2024', status: 'under_review', date: '18.01.2025', type: 'report' },
  { name: 'Расчёт утильсбора Q4', status: 'paid', date: '15.01.2025', type: 'calculation' },
]

const getStatusClass = (status: string) => {
  const variant = getStatusBadgeVariant(status)
  return `badge badge-${variant}`
}

const isLoading = ref(true)
onMounted(() => {
  setTimeout(() => { isLoading.value = false }, 500)
  account.fetchAll()
})
</script>

<template>
  <DashboardLayout
    role="business"
    :roleTitle="roleTitle"
    :userName="account.myAccount?.company || ''"
    :menuItems="menuItems"
  >
    <div class="content__header mb-8">
      <h1 class="text-[28px] lg:text-[34px] font-bold text-[#1e293b] mb-2">{{ $t('businessDashboard.pageTitle') }}</h1>
      <p class="text-[18px] text-[#64748b]">{{ $t('businessDashboard.pageSubtitle') }}</p>
    </div>

    <!-- Skeleton Loading -->
    <template v-if="isLoading">
      <div class="mb-8">
        <SkeletonLoader variant="card" />
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <SkeletonLoader variant="chart" />
        <SkeletonLoader variant="chart" />
      </div>
      <SkeletonLoader variant="table" />
    </template>

    <template v-else>
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          v-for="stat in stats"
          :key="stat.title"
          :title="stat.title"
          :value="stat.value"
          :icon="stat.icon"
          :color="stat.color"
        />
      </div>

      <!-- Account Balance Card -->
      <router-link to="/business/account" class="block mb-8 group">
        <div :class="[
          'rounded-2xl p-5 border shadow-sm transition-all hover:shadow-md',
          account.currentBalance > 0 ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-200' :
          account.currentBalance < 0 ? 'bg-gradient-to-r from-red-50 to-red-100 border-red-200' :
          'bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200'
        ]">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div :class="[
                'w-12 h-12 rounded-xl flex items-center justify-center',
                account.currentBalance > 0 ? 'bg-green-500' :
                account.currentBalance < 0 ? 'bg-red-500' : 'bg-slate-400'
              ]">
                <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <p :class="[
                  'text-[16px] font-medium',
                  account.currentBalance > 0 ? 'text-green-800' :
                  account.currentBalance < 0 ? 'text-red-800' : 'text-slate-600'
                ]">{{ $t('businessDashboard.personalAccount') }}</p>
                <p :class="[
                  'text-[24px] font-bold',
                  account.currentBalance > 0 ? 'text-green-900' :
                  account.currentBalance < 0 ? 'text-red-900' : 'text-slate-800'
                ]">
                  {{ account.currentBalance > 0 ? '+' : '' }}{{ account.currentBalance.toLocaleString() }} {{ $t('businessDashboard.som') }}
                </p>
                <p :class="[
                  'text-[14px] mt-0.5',
                  account.currentBalance > 0 ? 'text-green-600' :
                  account.currentBalance < 0 ? 'text-red-600' : 'text-slate-500'
                ]">
                  {{ account.currentBalance > 0 ? $t('businessDashboard.overpayment') :
                     account.currentBalance < 0 ? $t('businessDashboard.debt') :
                     $t('businessDashboard.noDebt') }}
                </p>
              </div>
            </div>
            <div class="text-[#64748b] group-hover:text-[#2563eb] transition-colors">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
            </div>
          </div>
        </div>
      </router-link>

      <!-- Action Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <router-link
          v-for="card in actionCards"
          :key="card.title"
          :to="card.route"
          class="action-card group bg-white rounded-2xl p-6 shadow-sm border-2 border-transparent hover:border-[#2563eb] hover:shadow-lg transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
        >
          <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2563eb] to-[#3b82f6] opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-[#3b82f6] to-[#2563eb] flex items-center justify-center text-2xl mb-4">
            {{ card.icon }}
          </div>
          <h3 class="text-[22px] font-semibold text-[#1e293b] mb-2">{{ card.title }}</h3>
          <p class="text-[16px] text-[#64748b] leading-relaxed">{{ card.description }}</p>
        </router-link>
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <LineChart
          :data="monthlyData"
          color="#2563eb"
          :height="280"
          :title="$t('businessDashboard.chartMonthlyTitle')"
        />
        <PieChart
          :data="pieData"
          :size="200"
          :title="$t('businessDashboard.chartGroupsTitle')"
        />
      </div>

      <!-- Progress Bars -->
      <div class="mb-8">
        <ProgressBar
          :items="normativeItems"
          :title="$t('businessDashboard.progressTitle')"
        />
      </div>

      <!-- Recent Documents -->
      <div class="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] overflow-hidden">
        <div class="px-6 py-4 border-b border-[#e2e8f0] flex items-center justify-between">
          <h2 class="text-[22px] font-semibold text-[#1e293b]">{{ $t('businessDashboard.recentDocuments') }}</h2>
          <router-link to="/business/documents" class="text-[#2563eb] text-[16px] font-medium hover:underline">
            {{ $t('businessDashboard.allDocuments') }}
          </router-link>
        </div>
        <div class="divide-y divide-[#f1f5f9]">
          <div
            v-for="doc in recentDocuments"
            :key="doc.name"
            class="px-6 py-4 flex items-center justify-between hover:bg-[#f8fafc] transition-colors"
          >
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 rounded-lg bg-[#f1f5f9] flex items-center justify-center">
                <span v-if="doc.type === 'declaration'">📋</span>
                <span v-else-if="doc.type === 'report'">📊</span>
                <span v-else>💰</span>
              </div>
              <div>
                <p class="text-[18px] font-medium text-[#1e293b]">{{ doc.name }}</p>
                <p class="text-[16px] text-[#64748b]">{{ doc.date }}</p>
              </div>
            </div>
            <span :class="['text-[16px]', getStatusClass(doc.status)]">
              {{ $t(statusI18nKey[doc.status] || doc.status) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Info Banner -->
      <div class="mt-8 bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] rounded-2xl p-6 text-white">
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 text-2xl">
            ℹ️
          </div>
          <div>
            <h4 class="font-semibold text-[22px] mb-2">{{ $t('businessDashboard.reminderTitle') }}</h4>
            <ul class="opacity-90 list-none pl-1" style="margin: 0;">
              <li class="text-[18px]" style="margin-bottom: 4px;">{{ $t('businessDashboard.reminderImporters') }}</li>
              <li class="text-[18px]" style="margin-bottom: 4px;">{{ $t('businessDashboard.reminderProducers') }}</li>
              <li class="text-[18px]" style="margin-bottom: 4px;">{{ $t('businessDashboard.reminderDeclaration') }}</li>
            </ul>
            <p class="text-[18px] opacity-90" style="margin-top: 12px; font-style: italic;">{{ $t('businessDashboard.reminderFooter') }}</p>
          </div>
        </div>
      </div>
    </template>
  </DashboardLayout>
</template>
