<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import { useAdminMenu } from '../../composables/useRoleMenu'
import { analyticsStore } from '../../stores/analytics'

const { roleTitle, menuItems } = useAdminMenu()

onMounted(() => {
  analyticsStore.fetchAll('month')
})

// Period filter
const selectedPeriod = ref('year')

// Key metrics
const metrics = computed(() => {
  const s = analyticsStore.state.summary
  if (!s) return [
    { label: 'Всего собрано', value: '456.7 млн', subvalue: 'сом', change: '+15.2%', trend: 'up' },
    { label: 'Переработано отходов', value: '67,890', subvalue: 'тонн', change: '+12.4%', trend: 'up' },
    { label: 'Активных организаций', value: '2,456', subvalue: '', change: '+234', trend: 'up' },
    { label: 'Выдано лицензий', value: '189', subvalue: '', change: '+28', trend: 'up' },
  ]
  const fmtMln = (n: number) => n >= 1_000_000 ? (n / 1_000_000).toFixed(1) + ' млн' : n.toLocaleString('ru-RU')
  return [
    { label: 'Всего собрано', value: fmtMln(s.totalCollected), subvalue: 'сом', change: `${s.collectionRate}%`, trend: 'up' },
    { label: 'Переработано отходов', value: s.totalRecycled.toLocaleString('ru-RU'), subvalue: 'тонн', change: `${s.recyclingRate}%`, trend: s.recyclingRate >= 0 ? 'up' : 'down' },
    { label: 'Активных организаций', value: s.activePayers.toLocaleString('ru-RU'), subvalue: '', change: `${s.totalPayers}`, trend: 'up' },
    { label: 'Выдано лицензий', value: '189', subvalue: '', change: '+28', trend: 'up' },
  ]
})

// System stats
const systemStats = computed(() => {
  const s = analyticsStore.state.summary
  return {
    totalUsers: 3245,
    activeUsers: 2891,
    totalDeclarations: s?.pendingDeclarations ?? 12456,
    totalReports: s?.pendingCalculations ?? 8934,
    avgProcessingTime: 2.4,
    systemUptime: 99.8,
  }
})

// Monthly revenue data
const monthLabels: Record<string, string> = {
  '01': 'Янв', '02': 'Фев', '03': 'Мар', '04': 'Апр', '05': 'Май', '06': 'Июн',
  '07': 'Июл', '08': 'Авг', '09': 'Сен', '10': 'Окт', '11': 'Ноя', '12': 'Дек',
}

const monthlyDataFallback = [
  { month: 'Янв', revenue: 32.5, target: 30 },
  { month: 'Фев', revenue: 34.2, target: 32 },
  { month: 'Мар', revenue: 38.6, target: 35 },
  { month: 'Апр', revenue: 41.2, target: 38 },
  { month: 'Май', revenue: 39.8, target: 40 },
  { month: 'Июн', revenue: 43.5, target: 42 },
  { month: 'Июл', revenue: 45.1, target: 44 },
  { month: 'Авг', revenue: 42.8, target: 45 },
  { month: 'Сен', revenue: 48.2, target: 46 },
  { month: 'Окт', revenue: 51.4, target: 48 },
  { month: 'Ноя', revenue: 49.6, target: 50 },
  { month: 'Дек', revenue: 53.8, target: 52 },
]

const monthlyData = computed(() => {
  const income = analyticsStore.state.income
  if (!income.length) return monthlyDataFallback
  return income.map(d => {
    const mk = d.period.length >= 7 ? d.period.slice(5, 7) : d.period
    return {
      month: monthLabels[mk] || d.period,
      revenue: d.collected / 1_000_000, // convert to millions
      target: d.charged / 1_000_000,
    }
  })
})

// Regional breakdown
const regionalDataFallback = [
  { region: 'г. Бишкек', revenue: 185.4, organizations: 1245, share: 40.6 },
  { region: 'Чуйская область', revenue: 78.2, organizations: 456, share: 17.1 },
  { region: 'г. Ош', revenue: 52.6, organizations: 298, share: 11.5 },
  { region: 'Ошская область', revenue: 38.4, organizations: 178, share: 8.4 },
  { region: 'Джалал-Абадская обл.', revenue: 32.1, organizations: 145, share: 7.0 },
  { region: 'Иссык-Кульская обл.', revenue: 28.5, organizations: 89, share: 6.2 },
  { region: 'Нарынская область', revenue: 18.2, organizations: 56, share: 4.0 },
  { region: 'Таласская область', revenue: 14.1, organizations: 42, share: 3.1 },
  { region: 'Баткенская область', revenue: 9.2, organizations: 27, share: 2.1 },
]

const regionalData = computed(() => {
  const regions = analyticsStore.state.regions
  if (!regions.length) return regionalDataFallback
  const totalWaste = regions.reduce((s, r) => s + r.totalWaste, 0) || 1
  return regions.map(r => ({
    region: r.region,
    revenue: Math.round(r.totalWaste / 100) / 10, // convert to millions
    organizations: r.payersCount,
    share: Math.round(r.totalWaste / totalWaste * 1000) / 10,
  }))
})

// Category breakdown
const categoryData = ref([
  { category: 'Упаковка', amount: 178.5, percentage: 39.1, color: 'bg-blue-500' },
  { category: 'Электроника', amount: 98.4, percentage: 21.5, color: 'bg-purple-500' },
  { category: 'Батареи', amount: 65.2, percentage: 14.3, color: 'bg-orange-500' },
  { category: 'Шины', amount: 52.1, percentage: 11.4, color: 'bg-green-500' },
  { category: 'Масла', amount: 38.6, percentage: 8.5, color: 'bg-red-500' },
  { category: 'Прочее', amount: 23.9, percentage: 5.2, color: 'bg-gray-500' },
])

const formatNumber = (num: number) => num.toLocaleString('ru-RU')
const maxRevenue = computed(() => Math.max(...monthlyData.value.map(d => Math.max(d.revenue, d.target))))

// Compliance circles from recycling data
const complianceItemsFallback = [
  { label: 'Пластик', pct: 80, color: '#22c55e' },
  { label: 'Бумага', pct: 90, color: '#22c55e' },
  { label: 'Стекло', pct: 70, color: '#eab308' },
  { label: 'Металл', pct: 95, color: '#22c55e' },
  { label: 'Электроника', pct: 45, color: '#ef4444' },
  { label: 'Батареи', pct: 60, color: '#eab308' },
]

const complianceItems = computed(() => {
  const data = analyticsStore.state.recycling
  if (!data.length) return complianceItemsFallback
  return data.slice(0, 6).map(r => {
    const pct = Math.round(r.recyclingPercent)
    const color = pct >= 80 ? '#22c55e' : pct >= 60 ? '#eab308' : '#ef4444'
    return { label: r.wasteGroup, pct, color }
  })
})

// Export report
const exportReport = () => {
  const bom = '\uFEFF'
  let csv = bom + 'Раздел;Показатель;Значение\n'

  // Metrics
  metrics.value.forEach(m => {
    csv += `Ключевые показатели;${m.label};${m.value} ${m.subvalue} (${m.change})\n`
  })

  // Monthly data
  monthlyData.value.forEach(d => {
    csv += `Динамика по месяцам;${d.month} — Факт;${d.revenue} млн сом\n`
    csv += `Динамика по месяцам;${d.month} — План;${d.target} млн сом\n`
  })

  // Regional data
  regionalData.value.forEach(r => {
    csv += `По регионам;${r.region};${r.revenue} млн сом / ${r.organizations} орг. / ${r.share}%\n`
  })

  // Category data
  categoryData.value.forEach(c => {
    csv += `По категориям;${c.category};${c.amount} млн сом (${c.percentage}%)\n`
  })

  // System stats
  csv += `Система;Всего пользователей;${systemStats.value.totalUsers}\n`
  csv += `Система;Активных пользователей;${systemStats.value.activeUsers}\n`
  csv += `Система;Всего деклараций;${systemStats.value.totalDeclarations}\n`
  csv += `Система;Всего отчётов;${systemStats.value.totalReports}\n`
  csv += `Система;Среднее время обработки;${systemStats.value.avgProcessingTime} дней\n`
  csv += `Система;Аптайм;${systemStats.value.systemUptime}%\n`

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `analytics_report_${selectedPeriod.value}_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <DashboardLayout
    role="admin"
    :roleTitle="roleTitle"
    userName="Иван Петров"
    :menuItems="menuItems"
  >
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Аналитика системы</h1>
          <p class="text-gray-600 mt-1">Сводная статистика и показатели эффективности</p>
        </div>
        <div class="flex items-center gap-3">
          <select v-model="selectedPeriod" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500">
            <option value="month">Месяц</option>
            <option value="quarter">Квартал</option>
            <option value="year">Год</option>
          </select>
          <button @click="exportReport" class="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Экспорт отчёта
          </button>
        </div>
      </div>

      <!-- Key Metrics -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div v-for="metric in metrics" :key="metric.label" class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <p class="text-sm text-gray-500">{{ metric.label }}</p>
          <div class="flex items-end gap-2 mt-1">
            <p class="text-2xl font-bold text-gray-900">{{ metric.value }}</p>
            <p v-if="metric.subvalue" class="text-gray-500 mb-0.5">{{ metric.subvalue }}</p>
          </div>
          <div class="flex items-center gap-1 mt-2">
            <span :class="metric.trend === 'up' ? 'text-green-600' : 'text-red-600'" class="text-sm font-medium flex items-center gap-0.5">
              <svg v-if="metric.trend === 'up'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              {{ metric.change }}
            </span>
            <span class="text-xs text-gray-500">vs прошлый год</span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Revenue Chart -->
        <div class="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="font-semibold text-gray-900">Динамика сборов по месяцам</h3>
            <div class="flex items-center gap-4 text-sm">
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-full bg-rose-500"></div>
                <span class="text-gray-600">Факт</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-full bg-gray-300"></div>
                <span class="text-gray-600">План</span>
              </div>
            </div>
          </div>
          <div class="h-64 flex items-end gap-2">
            <div v-for="data in monthlyData" :key="data.month" class="flex-1 flex flex-col items-center gap-1">
              <div class="w-full flex gap-0.5 items-end h-48">
                <div
                  class="flex-1 bg-gray-200 rounded-t"
                  :style="{ height: `${(data.target / maxRevenue) * 100}%` }"
                ></div>
                <div
                  class="flex-1 bg-rose-500 rounded-t transition-all hover:bg-rose-600"
                  :style="{ height: `${(data.revenue / maxRevenue) * 100}%` }"
                  :title="`${data.revenue} млн сом`"
                ></div>
              </div>
              <span class="text-xs text-gray-500">{{ data.month }}</span>
            </div>
          </div>
        </div>

        <!-- Category Breakdown -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="font-semibold text-gray-900 mb-6">Структура по категориям</h3>
          <div class="space-y-4">
            <div v-for="cat in categoryData" :key="cat.category">
              <div class="flex items-center justify-between text-sm mb-1">
                <span class="text-gray-600">{{ cat.category }}</span>
                <span class="font-medium text-gray-900">{{ cat.amount }} млн</span>
              </div>
              <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div :class="cat.color" class="h-full rounded-full" :style="{ width: `${cat.percentage}%` }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Regional Performance -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 class="font-semibold text-gray-900">Сборы по регионам</h3>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Регион</th>
                  <th class="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Сборы (млн)</th>
                  <th class="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Орг-ции</th>
                  <th class="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Доля</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="region in regionalData" :key="region.region" class="hover:bg-gray-50">
                  <td class="px-6 py-3 text-sm font-medium text-gray-900">{{ region.region }}</td>
                  <td class="px-6 py-3 text-sm text-gray-900 text-right font-medium">{{ region.revenue }}</td>
                  <td class="px-6 py-3 text-sm text-gray-600 text-right">{{ region.organizations }}</td>
                  <td class="px-6 py-3 text-right">
                    <div class="flex items-center justify-end gap-2">
                      <div class="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div class="h-full bg-rose-500 rounded-full" :style="{ width: `${region.share}%` }"></div>
                      </div>
                      <span class="text-sm text-gray-600">{{ region.share }}%</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- System Stats -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="font-semibold text-gray-900 mb-6">Показатели системы</h3>
          <div class="grid grid-cols-2 gap-4">
            <div class="p-4 bg-gray-50 rounded-xl">
              <p class="text-sm text-gray-500">Всего пользователей</p>
              <p class="text-2xl font-bold text-gray-900 mt-1">{{ formatNumber(systemStats.totalUsers) }}</p>
              <p class="text-xs text-green-600 mt-1">{{ formatNumber(systemStats.activeUsers) }} активных</p>
            </div>
            <div class="p-4 bg-gray-50 rounded-xl">
              <p class="text-sm text-gray-500">Всего деклараций</p>
              <p class="text-2xl font-bold text-gray-900 mt-1">{{ formatNumber(systemStats.totalDeclarations) }}</p>
              <p class="text-xs text-gray-500 mt-1">за всё время</p>
            </div>
            <div class="p-4 bg-gray-50 rounded-xl">
              <p class="text-sm text-gray-500">Всего отчётов</p>
              <p class="text-2xl font-bold text-gray-900 mt-1">{{ formatNumber(systemStats.totalReports) }}</p>
              <p class="text-xs text-gray-500 mt-1">за всё время</p>
            </div>
            <div class="p-4 bg-gray-50 rounded-xl">
              <p class="text-sm text-gray-500">Среднее время обработки</p>
              <p class="text-2xl font-bold text-gray-900 mt-1">{{ systemStats.avgProcessingTime }}</p>
              <p class="text-xs text-gray-500 mt-1">дней</p>
            </div>
            <div class="p-4 bg-green-50 rounded-xl col-span-2">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-500">Аптайм системы</p>
                  <p class="text-2xl font-bold text-green-600 mt-1">{{ systemStats.systemUptime }}%</p>
                </div>
                <div class="w-16 h-16 relative">
                  <svg class="w-16 h-16 transform -rotate-90">
                    <circle cx="32" cy="32" r="28" stroke="#e5e7eb" stroke-width="6" fill="none" />
                    <circle cx="32" cy="32" r="28" stroke="#22c55e" stroke-width="6" fill="none" stroke-dasharray="176" :stroke-dashoffset="176 - (176 * systemStats.systemUptime / 100)" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Compliance Overview -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 class="font-semibold text-gray-900 mb-6">Выполнение нормативов переработки (по стране)</h3>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div v-for="item in complianceItems" :key="item.label" class="text-center p-4 bg-gray-50 rounded-xl">
            <p class="text-sm text-gray-500 mb-2">{{ item.label }}</p>
            <div class="relative w-16 h-16 mx-auto">
              <svg class="w-16 h-16 transform -rotate-90">
                <circle cx="32" cy="32" r="28" stroke="#e5e7eb" stroke-width="6" fill="none" />
                <circle cx="32" cy="32" r="28" :stroke="item.color" stroke-width="6" fill="none" stroke-dasharray="176" :stroke-dashoffset="176 - (176 * item.pct / 100)" />
              </svg>
              <span class="absolute inset-0 flex items-center justify-center text-sm font-bold" :style="{ color: item.color }">{{ item.pct }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>
