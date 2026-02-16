<script setup lang="ts">
import { ref } from 'vue'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import { icons } from '../../utils/menuIcons'

const menuItems = [
  { id: 'dashboard', label: 'Главная', icon: icons.dashboard, route: '/employee' },
  { id: 'compliance', label: 'Контроль исполнения', icon: icons.compliance, route: '/employee/compliance' },
  { id: 'licenses', label: 'Лицензии', icon: icons.license, route: '/employee/licenses' },
  { id: 'waste-types', label: 'Виды отходов', icon: icons.recycle, route: '/employee/waste-types' },
  { id: 'landfills', label: 'Полигоны и свалки', icon: icons.landfill, route: '/employee/landfills' },
  { id: 'reports', label: 'Отчётность', icon: icons.report, route: '/employee/reports' },
  { id: 'map', label: 'ГИС-карта', icon: icons.map, route: '/employee/map' },
  { id: 'profile', label: 'Мой профиль', icon: icons.profile, route: '/employee/profile' },
]

// Period filter
const selectedPeriod = ref('year')
const periods = [
  { id: 'month', name: 'Месяц' },
  { id: 'quarter', name: 'Квартал' },
  { id: 'year', name: 'Год' },
]

// Key metrics
const metrics = ref([
  { label: 'Собрано утильсбора', value: '245.8 млн', change: '+12.4%', trend: 'up', icon: '💰' },
  { label: 'Переработано отходов', value: '34,560 т', change: '+8.2%', trend: 'up', icon: '♻️' },
  { label: 'Зарегистрировано организаций', value: '1,847', change: '+156', trend: 'up', icon: '🏢' },
  { label: 'Выдано лицензий', value: '89', change: '+12', trend: 'up', icon: '📜' },
])

// Waste by category
const wasteByCategory = ref([
  { category: 'Пластик', volume: 12450, percentage: 36, color: 'bg-blue-500' },
  { category: 'Бумага и картон', volume: 8900, percentage: 26, color: 'bg-green-500' },
  { category: 'Стекло', volume: 5670, percentage: 16, color: 'bg-purple-500' },
  { category: 'Металл', volume: 4320, percentage: 13, color: 'bg-orange-500' },
  { category: 'Электроника', volume: 2100, percentage: 6, color: 'bg-red-500' },
  { category: 'Прочее', volume: 1120, percentage: 3, color: 'bg-gray-500' },
])

// Monthly data for chart
const monthlyData = ref([
  { month: 'Янв', declarations: 145, reports: 89, fees: 18.5 },
  { month: 'Фев', declarations: 156, reports: 92, fees: 19.2 },
  { month: 'Мар', declarations: 178, reports: 105, fees: 21.4 },
  { month: 'Апр', declarations: 189, reports: 112, fees: 22.8 },
  { month: 'Май', declarations: 201, reports: 118, fees: 24.1 },
  { month: 'Июн', declarations: 215, reports: 125, fees: 25.6 },
  { month: 'Июл', declarations: 198, reports: 115, fees: 23.2 },
  { month: 'Авг', declarations: 210, reports: 122, fees: 24.8 },
  { month: 'Сен', declarations: 225, reports: 130, fees: 26.3 },
  { month: 'Окт', declarations: 238, reports: 138, fees: 27.9 },
  { month: 'Ноя', declarations: 245, reports: 142, fees: 28.5 },
  { month: 'Дек', declarations: 256, reports: 148, fees: 29.8 },
])

// Regional performance
const regionalData = ref([
  { region: 'г. Бишкек', organizations: 845, fees: 125.4, compliance: 94 },
  { region: 'Чуйская область', organizations: 312, fees: 45.2, compliance: 88 },
  { region: 'г. Ош', organizations: 198, fees: 28.6, compliance: 91 },
  { region: 'Ошская область', organizations: 145, fees: 18.4, compliance: 85 },
  { region: 'Джалал-Абадская обл.', organizations: 124, fees: 12.8, compliance: 82 },
  { region: 'Иссык-Кульская обл.', organizations: 98, fees: 8.6, compliance: 87 },
  { region: 'Нарынская область', organizations: 56, fees: 3.2, compliance: 79 },
  { region: 'Таласская область', organizations: 42, fees: 2.4, compliance: 81 },
  { region: 'Баткенская область', organizations: 27, fees: 1.2, compliance: 76 },
])

// Top companies
const topCompanies = ref([
  { name: 'ОсОО «КолаКР»', fees: 12.5, declarations: 24 },
  { name: 'ОсОО «Шоро»', fees: 8.9, declarations: 18 },
  { name: 'ОАО «Кыргыз Алтын»', fees: 7.2, declarations: 12 },
  { name: 'ОсОО «FINCA Bank»', fees: 5.8, declarations: 8 },
  { name: 'ОсОО «Газпром Нефть Азия»', fees: 5.4, declarations: 15 },
])

const formatNumber = (num: number) => num.toLocaleString('ru-RU')
const maxMonthlyValue = Math.max(...monthlyData.value.map(d => d.declarations))
</script>

<template>
  <DashboardLayout
    role="employee"
    roleTitle="Сотрудник МПРЭТН КР"
    userName="Мамытова Айгуль"
    :menuItems="menuItems"
  >
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Аналитика</h1>
          <p class="text-gray-600 mt-1">Статистика и отчётность по системе учёта отходов</p>
        </div>
        <div class="flex items-center gap-3">
          <div class="flex rounded-lg border border-gray-300 overflow-hidden">
            <button
              v-for="period in periods"
              :key="period.id"
              @click="selectedPeriod = period.id"
              :class="[
                'px-4 py-2 text-sm font-medium transition-colors',
                selectedPeriod === period.id
                  ? 'bg-sky-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              ]"
            >
              {{ period.name }}
            </button>
          </div>
          <button class="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Экспорт
          </button>
        </div>
      </div>

      <!-- Key Metrics -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          v-for="metric in metrics"
          :key="metric.label"
          class="bg-white rounded-xl shadow-sm border border-gray-200 p-5"
        >
          <div class="flex items-start justify-between">
            <div>
              <p class="text-sm text-gray-500">{{ metric.label }}</p>
              <p class="text-2xl font-bold text-gray-900 mt-1">{{ metric.value }}</p>
              <div class="flex items-center gap-1 mt-2">
                <span :class="metric.trend === 'up' ? 'text-green-600' : 'text-red-600'" class="text-sm font-medium">
                  {{ metric.change }}
                </span>
                <span class="text-xs text-gray-500">vs прошлый период</span>
              </div>
            </div>
            <div class="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center text-2xl">
              {{ metric.icon }}
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Chart Area -->
        <div class="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="font-semibold text-gray-900">Динамика показателей</h3>
            <div class="flex items-center gap-4 text-sm">
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-full bg-sky-500"></div>
                <span class="text-gray-600">Декларации</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-full bg-green-500"></div>
                <span class="text-gray-600">Отчёты</span>
              </div>
            </div>
          </div>

          <!-- Simple Bar Chart -->
          <div class="h-64 flex items-end gap-2">
            <div
              v-for="data in monthlyData"
              :key="data.month"
              class="flex-1 flex flex-col items-center gap-1"
            >
              <div class="w-full flex gap-1 items-end h-48">
                <div
                  class="flex-1 bg-sky-500 rounded-t transition-all hover:bg-sky-600"
                  :style="{ height: `${(data.declarations / maxMonthlyValue) * 100}%` }"
                  :title="`Декларации: ${data.declarations}`"
                ></div>
                <div
                  class="flex-1 bg-green-500 rounded-t transition-all hover:bg-green-600"
                  :style="{ height: `${(data.reports / maxMonthlyValue) * 100}%` }"
                  :title="`Отчёты: ${data.reports}`"
                ></div>
              </div>
              <span class="text-xs text-gray-500">{{ data.month }}</span>
            </div>
          </div>
        </div>

        <!-- Waste by Category -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="font-semibold text-gray-900 mb-6">Структура отходов</h3>

          <!-- Donut chart placeholder -->
          <div class="relative w-40 h-40 mx-auto mb-6">
            <svg class="w-full h-full transform -rotate-90">
              <circle cx="80" cy="80" r="60" stroke="#e5e7eb" stroke-width="20" fill="none" />
              <circle
                v-for="(item, index) in wasteByCategory"
                :key="item.category"
                cx="80" cy="80" r="60"
                :stroke="item.color.replace('bg-', '').includes('blue') ? '#3b82f6' : item.color.replace('bg-', '').includes('green') ? '#22c55e' : item.color.replace('bg-', '').includes('purple') ? '#a855f7' : item.color.replace('bg-', '').includes('orange') ? '#f97316' : item.color.replace('bg-', '').includes('red') ? '#ef4444' : '#6b7280'"
                stroke-width="20"
                fill="none"
                :stroke-dasharray="`${item.percentage * 3.77} 377`"
                :stroke-dashoffset="`${-wasteByCategory.slice(0, index).reduce((sum, i) => sum + i.percentage, 0) * 3.77}`"
              />
            </svg>
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="text-center">
                <p class="text-2xl font-bold text-gray-900">34.5K</p>
                <p class="text-xs text-gray-500">тонн</p>
              </div>
            </div>
          </div>

          <div class="space-y-3">
            <div
              v-for="item in wasteByCategory"
              :key="item.category"
              class="flex items-center justify-between"
            >
              <div class="flex items-center gap-2">
                <div :class="['w-3 h-3 rounded-full', item.color]"></div>
                <span class="text-sm text-gray-600">{{ item.category }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium text-gray-900">{{ formatNumber(item.volume) }} т</span>
                <span class="text-xs text-gray-500">({{ item.percentage }}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Regional Performance -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 class="font-semibold text-gray-900">Показатели по регионам</h3>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Регион</th>
                  <th class="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Орг-ции</th>
                  <th class="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Сборы (млн)</th>
                  <th class="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Соответствие</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="region in regionalData" :key="region.region" class="hover:bg-gray-50">
                  <td class="px-6 py-3 text-sm font-medium text-gray-900">{{ region.region }}</td>
                  <td class="px-6 py-3 text-sm text-gray-600 text-right">{{ region.organizations }}</td>
                  <td class="px-6 py-3 text-sm text-gray-900 text-right font-medium">{{ region.fees }}</td>
                  <td class="px-6 py-3 text-right">
                    <div class="flex items-center justify-end gap-2">
                      <div class="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          class="h-full rounded-full"
                          :class="region.compliance >= 90 ? 'bg-green-500' : region.compliance >= 80 ? 'bg-yellow-500' : 'bg-red-500'"
                          :style="{ width: `${region.compliance}%` }"
                        ></div>
                      </div>
                      <span class="text-sm font-medium" :class="region.compliance >= 90 ? 'text-green-600' : region.compliance >= 80 ? 'text-yellow-600' : 'text-red-600'">
                        {{ region.compliance }}%
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Top Companies -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 class="font-semibold text-gray-900">Топ плательщиков утильсбора</h3>
          </div>
          <div class="p-4">
            <div class="space-y-4">
              <div
                v-for="(company, index) in topCompanies"
                :key="company.name"
                class="flex items-center gap-4"
              >
                <div
                  class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white"
                  :class="index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-400' : 'bg-gray-300'"
                >
                  {{ index + 1 }}
                </div>
                <div class="flex-1">
                  <p class="font-medium text-gray-900">{{ company.name }}</p>
                  <p class="text-sm text-gray-500">{{ company.declarations }} деклараций</p>
                </div>
                <div class="text-right">
                  <p class="font-bold text-gray-900">{{ company.fees }} млн</p>
                  <p class="text-xs text-gray-500">сом</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Compliance Overview -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 class="font-semibold text-gray-900 mb-6">Соответствие нормативам переработки</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div class="text-center p-4 bg-gray-50 rounded-xl">
            <p class="text-sm text-gray-500 mb-2">Пластик</p>
            <div class="relative w-16 h-16 mx-auto">
              <svg class="w-16 h-16 transform -rotate-90">
                <circle cx="32" cy="32" r="28" stroke="#e5e7eb" stroke-width="6" fill="none" />
                <circle cx="32" cy="32" r="28" stroke="#22c55e" stroke-width="6" fill="none" stroke-dasharray="176" stroke-dashoffset="35" />
              </svg>
              <span class="absolute inset-0 flex items-center justify-center text-sm font-bold text-green-600">80%</span>
            </div>
            <p class="text-xs text-gray-500 mt-2">Норма: 20%</p>
          </div>
          <div class="text-center p-4 bg-gray-50 rounded-xl">
            <p class="text-sm text-gray-500 mb-2">Бумага</p>
            <div class="relative w-16 h-16 mx-auto">
              <svg class="w-16 h-16 transform -rotate-90">
                <circle cx="32" cy="32" r="28" stroke="#e5e7eb" stroke-width="6" fill="none" />
                <circle cx="32" cy="32" r="28" stroke="#22c55e" stroke-width="6" fill="none" stroke-dasharray="176" stroke-dashoffset="26" />
              </svg>
              <span class="absolute inset-0 flex items-center justify-center text-sm font-bold text-green-600">85%</span>
            </div>
            <p class="text-xs text-gray-500 mt-2">Норма: 25%</p>
          </div>
          <div class="text-center p-4 bg-gray-50 rounded-xl">
            <p class="text-sm text-gray-500 mb-2">Стекло</p>
            <div class="relative w-16 h-16 mx-auto">
              <svg class="w-16 h-16 transform -rotate-90">
                <circle cx="32" cy="32" r="28" stroke="#e5e7eb" stroke-width="6" fill="none" />
                <circle cx="32" cy="32" r="28" stroke="#eab308" stroke-width="6" fill="none" stroke-dasharray="176" stroke-dashoffset="53" />
              </svg>
              <span class="absolute inset-0 flex items-center justify-center text-sm font-bold text-yellow-600">70%</span>
            </div>
            <p class="text-xs text-gray-500 mt-2">Норма: 30%</p>
          </div>
          <div class="text-center p-4 bg-gray-50 rounded-xl">
            <p class="text-sm text-gray-500 mb-2">Металл</p>
            <div class="relative w-16 h-16 mx-auto">
              <svg class="w-16 h-16 transform -rotate-90">
                <circle cx="32" cy="32" r="28" stroke="#e5e7eb" stroke-width="6" fill="none" />
                <circle cx="32" cy="32" r="28" stroke="#22c55e" stroke-width="6" fill="none" stroke-dasharray="176" stroke-dashoffset="18" />
              </svg>
              <span class="absolute inset-0 flex items-center justify-center text-sm font-bold text-green-600">90%</span>
            </div>
            <p class="text-xs text-gray-500 mt-2">Норма: 35%</p>
          </div>
          <div class="text-center p-4 bg-gray-50 rounded-xl">
            <p class="text-sm text-gray-500 mb-2">Электроника</p>
            <div class="relative w-16 h-16 mx-auto">
              <svg class="w-16 h-16 transform -rotate-90">
                <circle cx="32" cy="32" r="28" stroke="#e5e7eb" stroke-width="6" fill="none" />
                <circle cx="32" cy="32" r="28" stroke="#ef4444" stroke-width="6" fill="none" stroke-dasharray="176" stroke-dashoffset="88" />
              </svg>
              <span class="absolute inset-0 flex items-center justify-center text-sm font-bold text-red-600">50%</span>
            </div>
            <p class="text-xs text-gray-500 mt-2">Норма: 40%</p>
          </div>
          <div class="text-center p-4 bg-gray-50 rounded-xl">
            <p class="text-sm text-gray-500 mb-2">Батареи</p>
            <div class="relative w-16 h-16 mx-auto">
              <svg class="w-16 h-16 transform -rotate-90">
                <circle cx="32" cy="32" r="28" stroke="#e5e7eb" stroke-width="6" fill="none" />
                <circle cx="32" cy="32" r="28" stroke="#eab308" stroke-width="6" fill="none" stroke-dasharray="176" stroke-dashoffset="62" />
              </svg>
              <span class="absolute inset-0 flex items-center justify-center text-sm font-bold text-yellow-600">65%</span>
            </div>
            <p class="text-xs text-gray-500 mt-2">Норма: 50%</p>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>
