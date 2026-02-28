<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import SkeletonLoader from '../../components/dashboard/SkeletonLoader.vue'
import StatsCard from '../../components/dashboard/StatsCard.vue'
import LineChart from '../../components/charts/LineChart.vue'
import BarChart from '../../components/charts/BarChart.vue'
import { icons, statsIcons } from '../../utils/menuIcons'
import { calculationStore } from '../../stores/calculations'
import { useEcoOperatorMenu } from '../../composables/useRoleMenu'
import SectionGuide from '../../components/common/SectionGuide.vue'
import { CalcStatus, DeclStatus } from '../../constants/statuses'

const { t } = useI18n()
const { roleTitle, menuItems } = useEcoOperatorMenu()

const allCalcs = computed(() => calculationStore.state.calculations)

const stats = computed(() => [
  {
    title: t('ecoDashboard.incomingCalcs'),
    value: String(allCalcs.value.filter(c => c.status === CalcStatus.UNDER_REVIEW).length),
    icon: statsIcons.pending,
    color: 'orange' as const
  },
  {
    title: t('ecoDashboard.acceptedMonth'),
    value: String(allCalcs.value.filter(c => c.status === CalcStatus.APPROVED || c.status === CalcStatus.PAID).length),
    icon: statsIcons.approved,
    color: 'green' as const
  },
  {
    title: t('ecoDashboard.paymentsOnReview'),
    value: String(allCalcs.value.filter(c => c.status === CalcStatus.PAYMENT_PENDING).length),
    icon: statsIcons.payment,
    color: 'purple' as const
  },
  {
    title: t('ecoDashboard.amountMonth'),
    value: allCalcs.value.reduce((s, c) => s + c.totalAmount, 0).toLocaleString() + ' ' + t('ecoDashboard.som'),
    icon: statsIcons.money,
    color: 'blue' as const
  },
])

// Mock monthly data for line chart
const monthlyAccepted = [
  { label: 'Авг', value: 12 },
  { label: 'Сен', value: 18 },
  { label: 'Окт', value: 15 },
  { label: 'Ноя', value: 22 },
  { label: 'Дек', value: 28 },
  { label: 'Янв', value: 35 },
  { label: 'Фев', value: 19 },
]

// Bar chart: top organizations by amount
const topOrganizations = [
  { label: 'ОАО «СтройМаркет»', value: 9583, color: '#2563eb' },
  { label: 'ОсОО «ТехПром»', value: 6322, color: '#0e888d' },
  { label: 'ИП Асанов', value: 4085, color: '#f59e0b' },
  { label: 'ОсОО «ПищеПром»', value: 3322, color: '#10b981' },
  { label: 'ОсОО «НовоТрейд»', value: 2150, color: '#6366f1' },
]

const recentDeclarations = [
  { company: 'ОсОО «ТехПром»', type: 'Декларация о товарах', date: '20.01.2025', status: DeclStatus.DRAFT },
  { company: 'ОАО «СтройМаркет»', type: 'Декларация об упаковке', date: '19.01.2025', status: DeclStatus.UNDER_REVIEW },
  { company: 'ОсОО «ПищеПром»', type: 'Декларация о товарах', date: '18.01.2025', status: DeclStatus.APPROVED },
]

const getStatusClass = (status: string) => {
  switch (status) {
    case 'draft': return 'badge badge-info'
    case 'under_review': return 'badge badge-warning'
    case 'approved': return 'badge badge-success'
    case 'rejected': return 'badge badge-danger'
    default: return 'badge badge-neutral'
  }
}

const isLoading = ref(true)
onMounted(() => {
  setTimeout(() => { isLoading.value = false }, 500)
})
</script>

<template>
  <DashboardLayout
    role="eco-operator"
    :roleTitle="roleTitle"
    :userName="$t('ecoDashboard.userName')"
    :menuItems="menuItems"
  >
    <div class="content__header mb-8">
      <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b] mb-2">{{ $t('pages.ecoOperator.dashboardTitle') }}</h1>
      <p class="text-[#64748b]">{{ $t('pages.ecoOperator.dashboardSubtitle') }}</p>
    </div>

    <SectionGuide
      :title="$t('ecoDashboard.guideTitle')"
      :description="$t('ecoDashboard.guideDescription')"
      :actions="[$t('ecoDashboard.guideAction1'), $t('ecoDashboard.guideAction2'), $t('ecoDashboard.guideAction3')]"
      storageKey="eco-dashboard"
    />

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

      <!-- Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <LineChart
          :data="monthlyAccepted"
          color="#0e888d"
          :height="280"
          :title="$t('ecoDashboard.chartAcceptedByMonth')"
        />
        <BarChart
          :data="topOrganizations"
          :height="280"
          :title="$t('ecoDashboard.chartTopOrgs')"
        />
      </div>

      <!-- Quick Actions & Statistics -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-[#e2e8f0]">
          <h3 class="text-lg font-semibold text-[#1e293b] mb-4">{{ $t('ecoDashboard.quickActions') }}</h3>
          <div class="space-y-3">
            <router-link to="/eco-operator/incoming-declarations" class="flex items-center gap-3 p-4 rounded-xl bg-[#f8fafc] hover:bg-[#e8f5f5] transition-colors">
              <div class="w-10 h-10 rounded-lg bg-[#2563eb] flex items-center justify-center text-white" v-html="icons.document"></div>
              <div>
                <span class="font-medium text-[#1e293b] block">{{ $t('ecoDashboard.incomingDeclarations') }}</span>
                <span class="text-sm text-[#64748b]">{{ $t('ecoDashboard.newCount12') }}</span>
              </div>
            </router-link>
            <router-link to="/eco-operator/incoming-reports" class="flex items-center gap-3 p-4 rounded-xl bg-[#f8fafc] hover:bg-[#e8f5f5] transition-colors">
              <div class="w-10 h-10 rounded-lg bg-[#10b981] flex items-center justify-center text-white" v-html="icons.report"></div>
              <div>
                <span class="font-medium text-[#1e293b] block">{{ $t('ecoDashboard.recyclingReports') }}</span>
                <span class="text-sm text-[#64748b]">{{ $t('ecoDashboard.newCount5') }}</span>
              </div>
            </router-link>
            <router-link to="/eco-operator/analytics" class="flex items-center gap-3 p-4 rounded-xl bg-[#f8fafc] hover:bg-[#e8f5f5] transition-colors">
              <div class="w-10 h-10 rounded-lg bg-[#f59e0b] flex items-center justify-center text-white" v-html="icons.registries"></div>
              <div>
                <span class="font-medium text-[#1e293b] block">{{ $t('ecoDashboard.submitRecyclingReport') }}</span>
                <span class="text-sm text-[#64748b]">{{ $t('ecoDashboard.reportingForPeriod') }}</span>
              </div>
            </router-link>
          </div>
        </div>

        <div class="bg-white rounded-2xl p-6 shadow-sm border border-[#e2e8f0]">
          <h3 class="text-lg font-semibold text-[#1e293b] mb-4">{{ $t('ecoDashboard.recyclingStats') }}</h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-[#64748b]">{{ $t('ecoDashboard.plastic') }}</span>
              <div class="flex items-center gap-3">
                <div class="w-32 h-2 bg-[#f1f5f9] rounded-full overflow-hidden">
                  <div class="h-full bg-[#2563eb] rounded-full" style="width: 75%"></div>
                </div>
                <span class="font-medium text-[#1e293b]">189 {{ $t('ecoDashboard.tons') }}</span>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-[#64748b]">{{ $t('ecoDashboard.paperCardboard') }}</span>
              <div class="flex items-center gap-3">
                <div class="w-32 h-2 bg-[#f1f5f9] rounded-full overflow-hidden">
                  <div class="h-full bg-[#10b981] rounded-full" style="width: 60%"></div>
                </div>
                <span class="font-medium text-[#1e293b]">124 {{ $t('ecoDashboard.tons') }}</span>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-[#64748b]">{{ $t('ecoDashboard.glass') }}</span>
              <div class="flex items-center gap-3">
                <div class="w-32 h-2 bg-[#f1f5f9] rounded-full overflow-hidden">
                  <div class="h-full bg-[#f59e0b] rounded-full" style="width: 35%"></div>
                </div>
                <span class="font-medium text-[#1e293b]">52 {{ $t('ecoDashboard.tons') }}</span>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-[#64748b]">{{ $t('ecoDashboard.metal') }}</span>
              <div class="flex items-center gap-3">
                <div class="w-32 h-2 bg-[#f1f5f9] rounded-full overflow-hidden">
                  <div class="h-full bg-[#6366f1] rounded-full" style="width: 20%"></div>
                </div>
                <span class="font-medium text-[#1e293b]">22 {{ $t('ecoDashboard.tons') }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Declarations Table -->
      <div class="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] overflow-hidden mb-8">
        <div class="px-6 py-4 border-b border-[#e2e8f0] flex items-center justify-between">
          <h2 class="text-lg font-semibold text-[#1e293b]">{{ $t('ecoDashboard.recentDeclarations') }}</h2>
          <router-link to="/eco-operator/incoming-declarations" class="text-[#2563eb] text-sm font-medium hover:underline">
            {{ $t('ecoDashboard.allDeclarations') }}
          </router-link>
        </div>
        <div class="divide-y divide-[#f1f5f9]">
          <div
            v-for="decl in recentDeclarations"
            :key="decl.company + decl.date"
            class="px-6 py-4 flex items-center justify-between hover:bg-[#f8fafc] transition-colors"
          >
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 rounded-lg bg-[#f1f5f9] flex items-center justify-center">
                <span>📋</span>
              </div>
              <div>
                <p class="font-medium text-[#1e293b]">{{ decl.company }}</p>
                <p class="text-sm text-[#64748b]">{{ decl.type }} • {{ decl.date }}</p>
              </div>
            </div>
            <span :class="getStatusClass(decl.status)">
              {{ decl.status === 'draft' ? $t('status.draft') : decl.status === 'under_review' ? $t('status.underReview') : decl.status === 'approved' ? $t('status.approvedFem') : decl.status === 'rejected' ? $t('status.rejectedFem') : decl.status }}
            </span>
          </div>
        </div>
      </div>

    </template>
  </DashboardLayout>
</template>
