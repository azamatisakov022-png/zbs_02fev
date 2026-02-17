<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import SkeletonLoader from '../../components/dashboard/SkeletonLoader.vue'
import StatsCard from '../../components/dashboard/StatsCard.vue'
import LineChart from '../../components/charts/LineChart.vue'
import PieChart from '../../components/charts/PieChart.vue'
import ProgressBar from '../../components/charts/ProgressBar.vue'
import { statsIcons } from '../../utils/menuIcons'
import { calculationStore } from '../../stores/calculations'
import { accountStore } from '../../stores/account'
import { useBusinessMenu } from '../../composables/useRoleMenu'

const { roleTitle, menuItems } = useBusinessMenu()

const actionCards = [
  {
    icon: '💰',
    title: 'Расчёт утилизационного сбора',
    description: 'Расчёт суммы утилизационного сбора за товары и упаковку',
    route: '/business/calculator',
    color: 'orange'
  },
  {
    icon: '📊',
    title: 'Подать отчёт о переработке',
    description: 'Отчёт о переработке отходов от использования товаров',
    route: '/business/reports',
    color: 'green'
  },
  {
    icon: '📝',
    title: 'Подать декларацию',
    description: 'Заполните и отправьте декларацию о товарах и упаковке',
    route: '/business/declarations',
    color: 'blue'
  }
]

const myCalcs = computed(() => calculationStore.getBusinessCalculations('ОсОО «ТехПром»'))

const stats = computed(() => [
  { title: 'Всего расчётов', value: String(myCalcs.value.length), icon: statsIcons.applications, color: 'blue' as const },
  { title: 'Оплачено', value: String(myCalcs.value.filter(c => c.status === 'Оплачено').length), icon: statsIcons.approved, color: 'green' as const },
  { title: 'На проверке', value: String(myCalcs.value.filter(c => c.status === 'На проверке' || c.status === 'Оплата на проверке').length), icon: statsIcons.pending, color: 'orange' as const },
  {
    title: 'Общая сумма',
    value: myCalcs.value.reduce((s, c) => s + c.totalAmount, 0).toLocaleString('ru-RU') + ' сом',
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
  { name: 'Декларация Q4 2024', status: 'Принята', date: '20.01.2025', type: 'declaration' },
  { name: 'Отчёт о переработке 2024', status: 'На проверке', date: '18.01.2025', type: 'report' },
  { name: 'Расчёт утильсбора Q4', status: 'Оплачен', date: '15.01.2025', type: 'calculation' },
]

const getStatusClass = (status: string) => {
  switch (status) {
    case 'Принята': return 'badge badge-success'
    case 'На проверке': return 'badge badge-warning'
    case 'Оплачен': return 'badge badge-info'
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
    role="business"
    :roleTitle="roleTitle"
    userName="ОсОО «ТехПром»"
    :menuItems="menuItems"
  >
    <div class="content__header mb-8">
      <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b] mb-2">Главная</h1>
      <p class="text-[#64748b]">Управление расчётами, отчётами и декларациями</p>
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
          accountStore.getCurrentBalance() > 0 ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-200' :
          accountStore.getCurrentBalance() < 0 ? 'bg-gradient-to-r from-red-50 to-red-100 border-red-200' :
          'bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200'
        ]">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div :class="[
                'w-12 h-12 rounded-xl flex items-center justify-center',
                accountStore.getCurrentBalance() > 0 ? 'bg-green-500' :
                accountStore.getCurrentBalance() < 0 ? 'bg-red-500' : 'bg-slate-400'
              ]">
                <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <p :class="[
                  'text-sm font-medium',
                  accountStore.getCurrentBalance() > 0 ? 'text-green-800' :
                  accountStore.getCurrentBalance() < 0 ? 'text-red-800' : 'text-slate-600'
                ]">Лицевой счёт</p>
                <p :class="[
                  'text-2xl font-bold',
                  accountStore.getCurrentBalance() > 0 ? 'text-green-900' :
                  accountStore.getCurrentBalance() < 0 ? 'text-red-900' : 'text-slate-800'
                ]">
                  {{ accountStore.getCurrentBalance() > 0 ? '+' : '' }}{{ accountStore.getCurrentBalance().toLocaleString('ru-RU') }} сом
                </p>
                <p :class="[
                  'text-xs mt-0.5',
                  accountStore.getCurrentBalance() > 0 ? 'text-green-600' :
                  accountStore.getCurrentBalance() < 0 ? 'text-red-600' : 'text-slate-500'
                ]">
                  {{ accountStore.getCurrentBalance() > 0 ? 'Переплата — доступно для зачёта' :
                     accountStore.getCurrentBalance() < 0 ? 'Задолженность — необходимо оплатить' :
                     'Задолженности нет' }}
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
          <h3 class="text-lg font-semibold text-[#1e293b] mb-2">{{ card.title }}</h3>
          <p class="text-sm text-[#64748b] leading-relaxed">{{ card.description }}</p>
        </router-link>
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <LineChart
          :data="monthlyData"
          color="#2563eb"
          :height="280"
          title="Утилизационный сбор по месяцам"
        />
        <PieChart
          :data="pieData"
          :size="200"
          title="Распределение по группам товаров"
        />
      </div>

      <!-- Progress Bars -->
      <div class="mb-8">
        <ProgressBar
          :items="normativeItems"
          title="Выполнение нормативов переработки"
        />
      </div>

      <!-- Recent Documents -->
      <div class="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] overflow-hidden">
        <div class="px-6 py-4 border-b border-[#e2e8f0] flex items-center justify-between">
          <h2 class="text-lg font-semibold text-[#1e293b]">Последние документы</h2>
          <router-link to="/business/documents" class="text-[#2563eb] text-sm font-medium hover:underline">
            Все документы →
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
                <p class="font-medium text-[#1e293b]">{{ doc.name }}</p>
                <p class="text-sm text-[#64748b]">{{ doc.date }}</p>
              </div>
            </div>
            <span :class="getStatusClass(doc.status)">
              {{ doc.status }}
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
            <h4 class="font-semibold text-lg mb-2">Напоминание о сроках подачи отчетности:</h4>
            <ul class="opacity-90 list-none pl-1" style="margin: 0;">
              <li style="margin-bottom: 4px;">— Расчет утилизационного сбора (для импортеров) — в течение 15 рабочих дней с момента ввоза.</li>
              <li style="margin-bottom: 4px;">— Для производителей — ежеквартально, не позднее 15 числа месяца, следующего за отчетным кварталом.</li>
              <li style="margin-bottom: 4px;">— Декларация и отчет о переработке — ежегодно, до 1 апреля.</li>
            </ul>
            <p class="opacity-90" style="margin-top: 12px; font-style: italic;">Просим своевременно подавать отчетность.</p>
          </div>
        </div>
      </div>
    </template>
  </DashboardLayout>
</template>
