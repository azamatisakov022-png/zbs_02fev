<script setup lang="ts">
import { ref, computed } from 'vue'
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

// ========== TYPES ==========
interface RecyclingNorm {
  id: number
  wasteType: string
  normPercent: number
  factPercent: number
  volumeTons: number
  status: 'fulfilled' | 'close' | 'failed'
}

interface LicenseRecord {
  id: number
  organization: string
  licenseNumber: string
  licenseType: string
  issueDate: string
  expiryDate: string
  daysRemaining: number | null
  status: 'active' | 'expiring' | 'expired' | 'pending'
}

// ========== TABS ==========
type TabId = 'norms' | 'licenses'

const activeTab = ref<TabId>('norms')

const tabs: { id: TabId; label: string }[] = [
  { id: 'norms', label: 'Нормативы переработки' },
  { id: 'licenses', label: 'Лицензии и разрешения' },
]

// ========== HELPER ==========
const formatNumber = (num: number): string => num.toLocaleString('ru-RU')

// ========== TAB 1: RECYCLING NORMS ==========
const normsData = ref<RecyclingNorm[]>([
  { id: 1, wasteType: 'Пластик ПЭТ', normPercent: 30, factPercent: 28.5, volumeTons: 142.5, status: 'close' },
  { id: 2, wasteType: 'Пластик ПП/ПЭ', normPercent: 25, factPercent: 22.1, volumeTons: 88.4, status: 'failed' },
  { id: 3, wasteType: 'Бумага/картон', normPercent: 40, factPercent: 45.2, volumeTons: 226.0, status: 'fulfilled' },
  { id: 4, wasteType: 'Стекло', normPercent: 35, factPercent: 38.7, volumeTons: 193.5, status: 'fulfilled' },
  { id: 5, wasteType: 'Металл чёрный', normPercent: 50, factPercent: 52.3, volumeTons: 261.5, status: 'fulfilled' },
  { id: 6, wasteType: 'Металл цветной', normPercent: 45, factPercent: 41.8, volumeTons: 83.6, status: 'failed' },
  { id: 7, wasteType: 'Шины и резина', normPercent: 20, factPercent: 18.9, volumeTons: 94.5, status: 'close' },
  { id: 8, wasteType: 'Электроника', normPercent: 15, factPercent: 12.3, volumeTons: 24.6, status: 'failed' },
  { id: 9, wasteType: 'Аккумуляторы', normPercent: 60, factPercent: 58.1, volumeTons: 29.1, status: 'close' },
  { id: 10, wasteType: 'Масла отработанные', normPercent: 35, factPercent: 36.2, volumeTons: 72.4, status: 'fulfilled' },
])

const normsTotals = computed(() => ({
  volumeTons: normsData.value.reduce((s, n) => s + n.volumeTons, 0),
  avgNorm: normsData.value.reduce((s, n) => s + n.normPercent, 0) / normsData.value.length,
  avgFact: normsData.value.reduce((s, n) => s + n.factPercent, 0) / normsData.value.length,
}))

const getNormProgressColor = (norm: RecyclingNorm): string => {
  const ratio = norm.factPercent / norm.normPercent
  if (ratio >= 1) return 'bg-green-500'
  if (ratio >= 0.9) return 'bg-amber-500'
  return 'bg-red-500'
}

const getNormProgressWidth = (norm: RecyclingNorm): string => {
  const ratio = (norm.factPercent / norm.normPercent) * 100
  return `${Math.min(ratio, 100)}%`
}

const getNormStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    fulfilled: 'Выполнен',
    close: 'Близко к норме',
    failed: 'Не выполнен',
  }
  return labels[status] || status
}

const getNormStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    fulfilled: 'bg-green-100 text-green-700',
    close: 'bg-amber-100 text-amber-700',
    failed: 'bg-red-100 text-red-700',
  }
  return colors[status] || 'bg-gray-100 text-gray-700'
}

// ========== TAB 2: LICENSES ==========
const licensesData = ref<LicenseRecord[]>([
  { id: 1, organization: 'ОАО "ЭкоТех"', licenseNumber: 'ЛП-2024-0045', licenseType: 'Комплексная', issueDate: '20.06.2024', expiryDate: '20.02.2026', daysRemaining: 8, status: 'expiring' },
  { id: 2, organization: 'ОАО "ГринТех"', licenseNumber: 'ЛП-2023-0035', licenseType: 'На переработку', issueDate: '01.09.2023', expiryDate: '01.09.2025', daysRemaining: null, status: 'expired' },
  { id: 3, organization: 'ОсОО "СтеклоПром"', licenseNumber: 'ЛП-2024-0052', licenseType: 'На сбор', issueDate: '15.08.2024', expiryDate: '15.03.2026', daysRemaining: 31, status: 'expiring' },
  { id: 4, organization: 'ОсОО "МеталлПром"', licenseNumber: 'ЛП-2024-0041', licenseType: 'На переработку', issueDate: '05.04.2024', expiryDate: '05.04.2026', daysRemaining: 52, status: 'active' },
  { id: 5, organization: 'ИП Сыдыков Н.А.', licenseNumber: 'ЛП-2024-0048', licenseType: 'На сбор', issueDate: '10.07.2024', expiryDate: '10.07.2025', daysRemaining: null, status: 'expired' },
  { id: 6, organization: 'ОсОО "АвтоУтиль"', licenseNumber: 'ЛП-2025-0068', licenseType: 'На сбор', issueDate: '12.11.2025', expiryDate: '12.11.2027', daysRemaining: 638, status: 'active' },
  { id: 7, organization: 'ОсОО "ЧистыйГород"', licenseNumber: 'ЛП-2026-0003', licenseType: 'Комплексная', issueDate: '—', expiryDate: '—', daysRemaining: null, status: 'pending' },
  { id: 8, organization: 'ОсОО "ПластПром"', licenseNumber: 'ЛП-2025-0070', licenseType: 'На переработку', issueDate: '28.01.2026', expiryDate: '28.01.2028', daysRemaining: 715, status: 'active' },
])

const getLicenseStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    active: 'Действует',
    expiring: 'Истекает',
    expired: 'Истекла',
    pending: 'На рассмотрении',
  }
  return labels[status] || status
}

const getLicenseStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    expiring: 'bg-amber-100 text-amber-700',
    expired: 'bg-red-100 text-red-700',
    pending: 'bg-blue-100 text-blue-700',
  }
  return colors[status] || 'bg-gray-100 text-gray-700'
}

const getDaysRemainingDisplay = (license: LicenseRecord): string => {
  if (license.status === 'pending') return '\u2014'
  if (license.status === 'expired') return 'Истекла'
  if (license.daysRemaining !== null) {
    if (license.daysRemaining === 1) return '1 день'
    if (license.daysRemaining >= 2 && license.daysRemaining <= 4) return `${license.daysRemaining} дня`
    return `${license.daysRemaining} дней`
  }
  return '\u2014'
}

// ========== SUMMARY STATS ==========
const summaryStats = computed(() => {
  const normsNotFulfilled = normsData.value.filter(n => n.status === 'failed').length
  const licensesExpiring = licensesData.value.filter(l => l.status === 'expiring' || l.status === 'expired').length
  return { normsNotFulfilled, licensesExpiring }
})
</script>

<template>
  <DashboardLayout
    role="employee"
    roleTitle="Сотрудник МПРЭТН КР"
    userName="Мамытова Айгуль"
    :menuItems="menuItems"
  >
    <div class="space-y-6">
      <!-- Page Header -->
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Контроль исполнения</h1>
        <p class="text-gray-600 mt-1">Мониторинг выполнения нормативов переработки и контроль лицензий</p>
      </div>

      <!-- Summary Stat Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Norms not fulfilled -->
        <div class="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500">Нормативов не выполнено</p>
              <p class="text-3xl font-bold text-red-600 mt-1">{{ summaryStats.normsNotFulfilled }}</p>
            </div>
            <div class="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <p class="text-xs text-gray-400 mt-2">из {{ normsData.length }} контролируемых видов</p>
        </div>

        <!-- Licenses expiring -->
        <div class="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500">Лицензий истекает</p>
              <p class="text-3xl font-bold text-yellow-600 mt-1">{{ summaryStats.licensesExpiring }}</p>
            </div>
            <div class="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p class="text-xs text-gray-400 mt-2">лицензий истекает или уже истекли</p>
        </div>
      </div>

      <!-- Tab Navigation -->
      <div class="border-b border-gray-200">
        <nav class="flex space-x-8" aria-label="Tabs">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'py-3 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
              activeTab === tab.id
                ? 'border-[#0e888d] text-[#0e888d]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            {{ tab.label }}
          </button>
        </nav>
      </div>

      <!-- ========== TAB 1: RECYCLING NORMS ========== -->
      <div v-if="activeTab === 'norms'" class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 class="font-semibold text-gray-900">Выполнение нормативов переработки отходов</h3>
          <p class="text-sm text-gray-500 mt-1">Данные за текущий отчётный период</p>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Вид отхода</th>
                <th class="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Норматив (%)</th>
                <th class="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Факт (%)</th>
                <th class="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-48">Прогресс</th>
                <th class="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Объём (т)</th>
                <th class="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Статус</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="norm in normsData" :key="norm.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 font-medium text-gray-900">{{ norm.wasteType }}</td>
                <td class="px-6 py-4 text-center text-gray-700 font-semibold">{{ norm.normPercent }}%</td>
                <td class="px-6 py-4 text-center font-bold" :class="{
                  'text-green-600': norm.status === 'fulfilled',
                  'text-amber-600': norm.status === 'close',
                  'text-red-600': norm.status === 'failed'
                }">{{ norm.factPercent }}%</td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <div class="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        :class="['h-full rounded-full transition-all', getNormProgressColor(norm)]"
                        :style="{ width: getNormProgressWidth(norm) }"
                      ></div>
                    </div>
                    <span class="text-xs text-gray-500 w-10 text-right">{{ ((norm.factPercent / norm.normPercent) * 100).toFixed(0) }}%</span>
                  </div>
                </td>
                <td class="px-6 py-4 text-right text-gray-700 font-medium">{{ norm.volumeTons.toFixed(1) }}</td>
                <td class="px-6 py-4 text-center">
                  <span :class="['text-xs px-3 py-1 rounded-full font-medium', getNormStatusColor(norm.status)]">
                    {{ getNormStatusLabel(norm.status) }}
                  </span>
                </td>
              </tr>
            </tbody>
            <tfoot class="bg-gray-50 border-t-2 border-gray-300">
              <tr>
                <td class="px-6 py-4 font-bold text-gray-900">ИТОГО / Среднее</td>
                <td class="px-6 py-4 text-center font-bold text-gray-700">{{ normsTotals.avgNorm.toFixed(1) }}%</td>
                <td class="px-6 py-4 text-center font-bold text-gray-700">{{ normsTotals.avgFact.toFixed(1) }}%</td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <div class="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        class="h-full rounded-full bg-[#0e888d] transition-all"
                        :style="{ width: `${Math.min((normsTotals.avgFact / normsTotals.avgNorm) * 100, 100)}%` }"
                      ></div>
                    </div>
                    <span class="text-xs text-gray-500 w-10 text-right">{{ ((normsTotals.avgFact / normsTotals.avgNorm) * 100).toFixed(0) }}%</span>
                  </div>
                </td>
                <td class="px-6 py-4 text-right font-bold text-gray-900">{{ formatNumber(parseFloat(normsTotals.volumeTons.toFixed(1))) }} т</td>
                <td class="px-6 py-4"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- ========== TAB 2: LICENSES ========== -->
      <div v-if="activeTab === 'licenses'" class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 class="font-semibold text-gray-900">Лицензии и разрешения на обращение с отходами</h3>
          <p class="text-sm text-gray-500 mt-1">Мониторинг сроков действия лицензий</p>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Организация</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">&#8470; лицензии</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Вид лицензии</th>
                <th class="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Дата выдачи</th>
                <th class="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Срок действия</th>
                <th class="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Дни до истечения</th>
                <th class="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Статус</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="license in licensesData" :key="license.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 font-medium text-gray-900">{{ license.organization }}</td>
                <td class="px-6 py-4 text-gray-600 font-mono text-sm">{{ license.licenseNumber }}</td>
                <td class="px-6 py-4 text-gray-600 text-sm">{{ license.licenseType }}</td>
                <td class="px-6 py-4 text-center text-gray-600 text-sm">{{ license.issueDate }}</td>
                <td class="px-6 py-4 text-center text-gray-600 text-sm">{{ license.expiryDate }}</td>
                <td class="px-6 py-4 text-center">
                  <span :class="[
                    'font-bold',
                    license.status === 'expired' ? 'text-red-600' :
                    license.status === 'expiring' ? 'text-amber-600' :
                    license.status === 'pending' ? 'text-blue-600' :
                    'text-green-600'
                  ]">
                    {{ getDaysRemainingDisplay(license) }}
                  </span>
                </td>
                <td class="px-6 py-4 text-center">
                  <span :class="['text-xs px-3 py-1 rounded-full font-medium', getLicenseStatusColor(license.status)]">
                    {{ getLicenseStatusLabel(license.status) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  </DashboardLayout>
</template>
