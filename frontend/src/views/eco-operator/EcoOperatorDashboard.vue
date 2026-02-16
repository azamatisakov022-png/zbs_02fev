<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import SkeletonLoader from '../../components/dashboard/SkeletonLoader.vue'
import StatsCard from '../../components/dashboard/StatsCard.vue'
import LineChart from '../../components/charts/LineChart.vue'
import BarChart from '../../components/charts/BarChart.vue'
import { icons, statsIcons } from '../../utils/menuIcons'
import { calculationStore } from '../../stores/calculations'
import { refundStore } from '../../stores/refunds'
import { reportStore } from '../../stores/reports'

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

const allCalcs = computed(() => calculationStore.state.calculations)

const stats = computed(() => [
  {
    title: 'Входящих расчётов',
    value: String(allCalcs.value.filter(c => c.status === 'На проверке').length),
    icon: statsIcons.pending,
    color: 'orange' as const
  },
  {
    title: 'Принято за месяц',
    value: String(allCalcs.value.filter(c => c.status === 'Принято' || c.status === 'Оплачено').length),
    icon: statsIcons.approved,
    color: 'green' as const
  },
  {
    title: 'Оплат на проверке',
    value: String(allCalcs.value.filter(c => c.status === 'Оплата на проверке').length),
    icon: statsIcons.payment,
    color: 'purple' as const
  },
  {
    title: 'Сумма за месяц',
    value: allCalcs.value.reduce((s, c) => s + c.totalAmount, 0).toLocaleString('ru-RU') + ' сом',
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
  { company: 'ОсОО «ТехПром»', type: 'Декларация о товарах', date: '20.01.2025', status: 'Новая' },
  { company: 'ОАО «СтройМаркет»', type: 'Декларация об упаковке', date: '19.01.2025', status: 'На рассмотрении' },
  { company: 'ОсОО «ПищеПром»', type: 'Декларация о товарах', date: '18.01.2025', status: 'Принята' },
]

const getStatusClass = (status: string) => {
  switch (status) {
    case 'Новая': return 'badge badge-info'
    case 'На рассмотрении': return 'badge badge-warning'
    case 'Принята': return 'badge badge-success'
    case 'Отклонена': return 'badge badge-danger'
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
    roleTitle="ГП «Эко Оператор»"
    userName="ОсОО «ЭкоПереработка»"
    :menuItems="menuItems"
  >
    <div class="content__header mb-8">
      <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b] mb-2">Главная</h1>
      <p class="text-[#64748b]">Приём и обработка деклараций от плательщиков</p>
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

      <!-- Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <LineChart
          :data="monthlyAccepted"
          color="#0e888d"
          :height="280"
          title="Принято расчётов по месяцам"
        />
        <BarChart
          :data="topOrganizations"
          :height="280"
          title="Топ-5 организаций по сумме утильсбора"
        />
      </div>

      <!-- Quick Actions & Statistics -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-[#e2e8f0]">
          <h3 class="text-lg font-semibold text-[#1e293b] mb-4">Быстрые действия</h3>
          <div class="space-y-3">
            <router-link to="/eco-operator/incoming-declarations" class="flex items-center gap-3 p-4 rounded-xl bg-[#f8fafc] hover:bg-[#e8f5f5] transition-colors">
              <div class="w-10 h-10 rounded-lg bg-[#2563eb] flex items-center justify-center text-white" v-html="icons.document"></div>
              <div>
                <span class="font-medium text-[#1e293b] block">Входящие декларации</span>
                <span class="text-sm text-[#64748b]">12 новых</span>
              </div>
            </router-link>
            <router-link to="/eco-operator/incoming-reports" class="flex items-center gap-3 p-4 rounded-xl bg-[#f8fafc] hover:bg-[#e8f5f5] transition-colors">
              <div class="w-10 h-10 rounded-lg bg-[#10b981] flex items-center justify-center text-white" v-html="icons.report"></div>
              <div>
                <span class="font-medium text-[#1e293b] block">Входящие отчёты</span>
                <span class="text-sm text-[#64748b]">5 новых</span>
              </div>
            </router-link>
            <router-link to="/eco-operator/my-reports" class="flex items-center gap-3 p-4 rounded-xl bg-[#f8fafc] hover:bg-[#e8f5f5] transition-colors">
              <div class="w-10 h-10 rounded-lg bg-[#f59e0b] flex items-center justify-center text-white" v-html="icons.registries"></div>
              <div>
                <span class="font-medium text-[#1e293b] block">Подать отчёт о переработке</span>
                <span class="text-sm text-[#64748b]">Отчётность за период</span>
              </div>
            </router-link>
          </div>
        </div>

        <div class="bg-white rounded-2xl p-6 shadow-sm border border-[#e2e8f0]">
          <h3 class="text-lg font-semibold text-[#1e293b] mb-4">Статистика переработки</h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-[#64748b]">Пластик</span>
              <div class="flex items-center gap-3">
                <div class="w-32 h-2 bg-[#f1f5f9] rounded-full overflow-hidden">
                  <div class="h-full bg-[#2563eb] rounded-full" style="width: 75%"></div>
                </div>
                <span class="font-medium text-[#1e293b]">189 т</span>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-[#64748b]">Бумага/картон</span>
              <div class="flex items-center gap-3">
                <div class="w-32 h-2 bg-[#f1f5f9] rounded-full overflow-hidden">
                  <div class="h-full bg-[#10b981] rounded-full" style="width: 60%"></div>
                </div>
                <span class="font-medium text-[#1e293b]">124 т</span>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-[#64748b]">Стекло</span>
              <div class="flex items-center gap-3">
                <div class="w-32 h-2 bg-[#f1f5f9] rounded-full overflow-hidden">
                  <div class="h-full bg-[#f59e0b] rounded-full" style="width: 35%"></div>
                </div>
                <span class="font-medium text-[#1e293b]">52 т</span>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-[#64748b]">Металл</span>
              <div class="flex items-center gap-3">
                <div class="w-32 h-2 bg-[#f1f5f9] rounded-full overflow-hidden">
                  <div class="h-full bg-[#6366f1] rounded-full" style="width: 20%"></div>
                </div>
                <span class="font-medium text-[#1e293b]">22 т</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Declarations Table -->
      <div class="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] overflow-hidden mb-8">
        <div class="px-6 py-4 border-b border-[#e2e8f0] flex items-center justify-between">
          <h2 class="text-lg font-semibold text-[#1e293b]">Последние декларации</h2>
          <router-link to="/eco-operator/incoming-declarations" class="text-[#2563eb] text-sm font-medium hover:underline">
            Все декларации →
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
              {{ decl.status }}
            </span>
          </div>
        </div>
      </div>

    </template>
  </DashboardLayout>
</template>
