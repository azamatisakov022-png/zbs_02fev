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
      <h1 class="bd-page-title">{{ $t('businessDashboard.pageTitle') }}</h1>
      <p class="bd-page-subtitle">{{ $t('businessDashboard.pageSubtitle') }}</p>
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
                  'bd-balance-label font-medium',
                  account.currentBalance > 0 ? 'text-green-800' :
                  account.currentBalance < 0 ? 'text-red-800' : 'text-slate-600'
                ]">{{ $t('businessDashboard.personalAccount') }}</p>
                <p :class="[
                  'bd-balance-value font-bold',
                  account.currentBalance > 0 ? 'text-green-900' :
                  account.currentBalance < 0 ? 'text-red-900' : 'text-slate-800'
                ]">
                  {{ account.currentBalance > 0 ? '+' : '' }}{{ account.currentBalance.toLocaleString() }} {{ $t('businessDashboard.som') }}
                </p>
                <p :class="[
                  'bd-balance-hint mt-0.5',
                  account.currentBalance > 0 ? 'text-green-600' :
                  account.currentBalance < 0 ? 'text-red-600' : 'text-slate-500'
                ]">
                  {{ account.currentBalance > 0 ? $t('businessDashboard.overpayment') :
                     account.currentBalance < 0 ? $t('businessDashboard.debt') :
                     $t('businessDashboard.noDebt') }}
                </p>
              </div>
            </div>
            <div class="bd-balance-arrow transition-colors">
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
          class="bd-action-card group"
        >
          <div class="bd-action-card__accent absolute top-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div class="bd-action-card__icon w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-4">
            {{ card.icon }}
          </div>
          <h3 class="bd-action-card__title font-semibold mb-2">{{ card.title }}</h3>
          <p class="bd-action-card__desc leading-relaxed">{{ card.description }}</p>
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
      <div class="bd-card bd-card--overflow">
        <div class="bd-card__header">
          <h2 class="bd-section-title">{{ $t('businessDashboard.recentDocuments') }}</h2>
          <router-link to="/business/documents" class="bd-link font-medium hover:underline">
            {{ $t('businessDashboard.allDocuments') }}
          </router-link>
        </div>
        <div class="bd-doc-list">
          <div
            v-for="doc in recentDocuments"
            :key="doc.name"
            class="bd-doc-row px-6 py-4 flex items-center justify-between transition-colors"
          >
            <div class="flex items-center gap-4">
              <div class="bd-doc-icon w-10 h-10 rounded-lg flex items-center justify-center">
                <span v-if="doc.type === 'declaration'">📋</span>
                <span v-else-if="doc.type === 'report'">📊</span>
                <span v-else>💰</span>
              </div>
              <div>
                <p class="bd-doc-name font-medium">{{ doc.name }}</p>
                <p class="bd-doc-date">{{ doc.date }}</p>
              </div>
            </div>
            <span :class="['bd-doc-status', getStatusClass(doc.status)]">
              {{ $t(statusI18nKey[doc.status] || doc.status) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Info Banner -->
      <div class="bd-info-banner">
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 text-2xl">
            ℹ️
          </div>
          <div>
            <h4 class="bd-banner-title font-semibold mb-2">{{ $t('businessDashboard.reminderTitle') }}</h4>
            <ul class="opacity-90 list-none pl-1" style="margin: 0;">
              <li class="bd-banner-text" style="margin-bottom: 4px;">{{ $t('businessDashboard.reminderImporters') }}</li>
              <li class="bd-banner-text" style="margin-bottom: 4px;">{{ $t('businessDashboard.reminderProducers') }}</li>
              <li class="bd-banner-text" style="margin-bottom: 4px;">{{ $t('businessDashboard.reminderDeclaration') }}</li>
            </ul>
            <p class="bd-banner-text opacity-90" style="margin-top: 12px; font-style: italic;">{{ $t('businessDashboard.reminderFooter') }}</p>
          </div>
        </div>
      </div>
    </template>
  </DashboardLayout>
</template>

<style scoped>
.bd-page-title {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
}
@media (min-width: 1024px) {
  .bd-page-title { font-size: 34px; }
}
.bd-page-subtitle {
  font-size: 18px;
  color: #64748b;
}
.bd-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  border: 1px solid #e2e8f0;
}
.bd-card--overflow {
  overflow: hidden;
}
.bd-card__header {
  padding: 16px 24px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.bd-section-title {
  font-size: 22px;
  font-weight: 600;
  color: #1e293b;
}
.bd-action-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  border: 2px solid transparent;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}
.bd-action-card:hover {
  border-color: #2563eb;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  transform: translateY(-4px);
}
.bd-info-banner {
  margin-top: 32px;
  background: linear-gradient(to right, #2563eb, #1d4ed8);
  border-radius: 16px;
  padding: 24px;
  color: white;
}
.bd-balance-label {
  font-size: 16px;
}
.bd-balance-value {
  font-size: 24px;
}
.bd-balance-hint {
  font-size: 14px;
}
.bd-balance-arrow {
  color: #64748b;
}
.group:hover .bd-balance-arrow {
  color: #2563eb;
}
.bd-action-card__accent {
  background: linear-gradient(to right, #2563eb, #3b82f6);
}
.bd-action-card__icon {
  background: linear-gradient(to bottom right, #3b82f6, #2563eb);
}
.bd-action-card__title {
  font-size: 22px;
  color: #1e293b;
}
.bd-action-card__desc {
  font-size: 16px;
  color: #64748b;
}
.bd-link {
  color: #2563eb;
  font-size: 16px;
}
.bd-doc-list {
  border-top: none;
}
.bd-doc-list > .bd-doc-row + .bd-doc-row {
  border-top: 1px solid #f1f5f9;
}
.bd-doc-row:hover {
  background-color: #f8fafc;
}
.bd-doc-icon {
  background-color: #f1f5f9;
}
.bd-doc-name {
  font-size: 18px;
  color: #1e293b;
}
.bd-doc-date {
  font-size: 16px;
  color: #64748b;
}
.bd-doc-status {
  font-size: 16px;
}
.bd-banner-title {
  font-size: 22px;
}
.bd-banner-text {
  font-size: 18px;
}
</style>
