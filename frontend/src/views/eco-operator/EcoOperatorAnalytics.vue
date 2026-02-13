<script setup lang="ts">
import { ref, computed } from 'vue'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import { icons } from '../../utils/menuIcons'
import { calculationStore } from '../../stores/calculations'
import { refundStore } from '../../stores/refunds'
import { reportStore } from '../../stores/reports'

const menuItems = computed(() => [
  { id: 'dashboard', label: 'Главная', icon: icons.dashboard, route: '/eco-operator' },
  { id: 'incoming-calculations', label: 'Входящие расчёты', icon: icons.calculator, route: '/eco-operator/calculations', badge: calculationStore.getCalcReviewCount() },
  { id: 'incoming-declarations', label: 'Входящие декларации', icon: icons.document, route: '/eco-operator/incoming-declarations' },
  { id: 'incoming-reports', label: 'Входящие отчёты', icon: icons.report, route: '/eco-operator/incoming-reports', badge: reportStore.getPendingCount() },
  { id: 'refunds', label: 'Заявки на возврат', icon: icons.refund, route: '/eco-operator/refunds', badge: refundStore.getPendingRefundsCount() },
  { id: 'licenses', label: 'Лицензии и документы', icon: icons.license, route: '/eco-operator/licenses' },
  { id: 'waste-types', label: 'Виды отходов', icon: icons.recycle, route: '/eco-operator/waste-types' },
  { id: 'my-reports', label: 'Мои отчёты', icon: icons.registries, route: '/eco-operator/my-reports' },
  { id: 'payments', label: 'Аналитика платежей', icon: icons.money, route: '/eco-operator/payments' },
  { id: 'analytics', label: 'Аналитика', icon: icons.analytics, route: '/eco-operator/analytics' },
  { id: 'profile', label: 'Профили компаний', icon: icons.profile, route: '/eco-operator/profile' },
])

// Регионы Кыргызстана
const regions = [
  'Бишкек',
  'Ош',
  'Чуйская область',
  'Ошская область',
  'Джалал-Абадская область',
  'Иссык-Кульская область',
  'Нарынская область',
  'Таласская область',
  'Баткенская область',
]

// Типы товаров (группы РОП)
const productTypes = [
  { id: 'plastic', name: 'Пластик и полимеры', code: 'ПЛ' },
  { id: 'paper', name: 'Бумага и картон', code: 'БК' },
  { id: 'glass', name: 'Стекло', code: 'СТ' },
  { id: 'metal', name: 'Металл', code: 'МТ' },
  { id: 'electronics', name: 'Электроника и электротехника', code: 'ЭЛ' },
  { id: 'batteries', name: 'Батареи и аккумуляторы', code: 'БА' },
  { id: 'tires', name: 'Шины и резина', code: 'ШР' },
  { id: 'oil', name: 'Масла и нефтепродукты', code: 'МН' },
  { id: 'textile', name: 'Текстиль', code: 'ТК' },
  { id: 'organic', name: 'Органические отходы', code: 'ОР' },
]

interface Company {
  id: number
  name: string
  inn: string
  type: 'ooo' | 'ip' | 'oao'
  region: string
  declarationsCount: number
  reportsCount: number
  lastDeclaration: string | null
  lastReport: string | null
  totalVolume: number
  status: 'active' | 'inactive' | 'new'
  productTypes: string[]
  volumeByProduct: Record<string, number>
}

const companies = ref<Company[]>([
  { id: 1, name: 'ОсОО "БишкекПласт"', inn: '01234567891234', type: 'ooo', region: 'Бишкек', declarationsCount: 24, reportsCount: 12, lastDeclaration: '2025-02-01', lastReport: '2025-01-31', totalVolume: 1250, status: 'active', productTypes: ['plastic', 'paper'], volumeByProduct: { plastic: 950, paper: 300 } },
  { id: 2, name: 'ОсОО "ЭкоРесайкл"', inn: '02345678912345', type: 'ooo', region: 'Бишкек', declarationsCount: 18, reportsCount: 9, lastDeclaration: '2025-02-02', lastReport: '2025-01-28', totalVolume: 890, status: 'active', productTypes: ['paper', 'glass'], volumeByProduct: { paper: 650, glass: 240 } },
  { id: 3, name: 'ИП "Асанов"', inn: '12345678901234', type: 'ip', region: 'Ош', declarationsCount: 8, reportsCount: 4, lastDeclaration: '2025-01-28', lastReport: '2025-01-15', totalVolume: 320, status: 'active', productTypes: ['glass'], volumeByProduct: { glass: 320 } },
  { id: 4, name: 'ОАО "ОшМеталл"', inn: '03456789123456', type: 'oao', region: 'Ош', declarationsCount: 36, reportsCount: 18, lastDeclaration: '2025-02-03', lastReport: '2025-01-31', totalVolume: 2100, status: 'active', productTypes: ['metal'], volumeByProduct: { metal: 2100 } },
  { id: 5, name: 'ОсОО "GreenPack"', inn: '04567891234567', type: 'ooo', region: 'Бишкек', declarationsCount: 15, reportsCount: 7, lastDeclaration: '2025-01-30', lastReport: '2025-01-25', totalVolume: 650, status: 'active', productTypes: ['plastic', 'paper'], volumeByProduct: { plastic: 450, paper: 200 } },
  { id: 6, name: 'ОсОО "ЧуйСтрой"', inn: '05678912345678', type: 'ooo', region: 'Чуйская область', declarationsCount: 12, reportsCount: 6, lastDeclaration: '2025-01-25', lastReport: '2025-01-20', totalVolume: 480, status: 'inactive', productTypes: ['metal', 'glass'], volumeByProduct: { metal: 350, glass: 130 } },
  { id: 7, name: 'ИП "Жумабеков"', inn: '23456789012345', type: 'ip', region: 'Джалал-Абадская область', declarationsCount: 5, reportsCount: 2, lastDeclaration: '2025-02-01', lastReport: null, totalVolume: 150, status: 'new', productTypes: ['paper'], volumeByProduct: { paper: 150 } },
  { id: 8, name: 'ОсОО "ИссыкКульЭко"', inn: '06789123456789', type: 'ooo', region: 'Иссык-Кульская область', declarationsCount: 28, reportsCount: 14, lastDeclaration: '2025-02-02', lastReport: '2025-01-30', totalVolume: 1800, status: 'active', productTypes: ['organic', 'paper'], volumeByProduct: { organic: 1200, paper: 600 } },
  { id: 9, name: 'ОАО "НарынМеталл"', inn: '07891234567890', type: 'oao', region: 'Нарынская область', declarationsCount: 42, reportsCount: 21, lastDeclaration: '2025-02-03', lastReport: '2025-02-01', totalVolume: 3200, status: 'active', productTypes: ['metal', 'batteries'], volumeByProduct: { metal: 2800, batteries: 400 } },
  { id: 10, name: 'ОсОО "ТаласПак"', inn: '08912345678901', type: 'ooo', region: 'Таласская область', declarationsCount: 20, reportsCount: 10, lastDeclaration: '2025-01-29', lastReport: '2025-01-28', totalVolume: 720, status: 'active', productTypes: ['paper', 'plastic'], volumeByProduct: { paper: 500, plastic: 220 } },
  { id: 11, name: 'ИП "Токтогулова"', inn: '34567890123456', type: 'ip', region: 'Баткенская область', declarationsCount: 3, reportsCount: 1, lastDeclaration: '2025-01-20', lastReport: null, totalVolume: 80, status: 'new', productTypes: ['textile'], volumeByProduct: { textile: 80 } },
  { id: 12, name: 'ОсОО "АвтоШина"', inn: '09123456789012', type: 'ooo', region: 'Бишкек', declarationsCount: 32, reportsCount: 16, lastDeclaration: '2025-02-01', lastReport: '2025-01-31', totalVolume: 2500, status: 'active', productTypes: ['tires', 'oil'], volumeByProduct: { tires: 2000, oil: 500 } },
  { id: 13, name: 'ОсОО "ЭлектроРесурс"', inn: '10234567890123', type: 'ooo', region: 'Бишкек', declarationsCount: 22, reportsCount: 11, lastDeclaration: '2025-02-02', lastReport: '2025-01-30', totalVolume: 450, status: 'active', productTypes: ['electronics', 'batteries'], volumeByProduct: { electronics: 350, batteries: 100 } },
  { id: 14, name: 'ОсОО "ОшПластик"', inn: '11345678901234', type: 'ooo', region: 'Ошская область', declarationsCount: 19, reportsCount: 9, lastDeclaration: '2025-01-31', lastReport: '2025-01-28', totalVolume: 780, status: 'active', productTypes: ['plastic'], volumeByProduct: { plastic: 780 } },
])

// Filters
const searchQuery = ref('')
const regionFilter = ref('')
const statusFilter = ref('')
const productTypeFilter = ref('')
const documentTypeFilter = ref('all')
const periodFilter = ref('month')
const sortBy = ref('name')
const sortOrder = ref<'asc' | 'desc'>('asc')

// Active analytics tab
const activeAnalyticsTab = ref<'companies' | 'products' | 'periods'>('companies')

const filteredCompanies = computed(() => {
  let result = companies.value.filter(company => {
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      if (!company.name.toLowerCase().includes(q) && !company.inn.includes(q)) {
        return false
      }
    }
    if (regionFilter.value && company.region !== regionFilter.value) {
      return false
    }
    if (statusFilter.value && company.status !== statusFilter.value) {
      return false
    }
    if (productTypeFilter.value && !company.productTypes.includes(productTypeFilter.value)) {
      return false
    }
    if (documentTypeFilter.value === 'declarations' && company.declarationsCount === 0) {
      return false
    }
    if (documentTypeFilter.value === 'reports' && company.reportsCount === 0) {
      return false
    }
    return true
  })

  result.sort((a, b) => {
    let comparison = 0
    switch (sortBy.value) {
      case 'name':
        comparison = a.name.localeCompare(b.name)
        break
      case 'declarations':
        comparison = a.declarationsCount - b.declarationsCount
        break
      case 'reports':
        comparison = a.reportsCount - b.reportsCount
        break
      case 'volume':
        comparison = a.totalVolume - b.totalVolume
        break
      case 'lastActivity':
        const aDate = a.lastDeclaration || a.lastReport || '1970-01-01'
        const bDate = b.lastDeclaration || b.lastReport || '1970-01-01'
        comparison = aDate.localeCompare(bDate)
        break
    }
    return sortOrder.value === 'asc' ? comparison : -comparison
  })

  return result
})

// Stats
const totalStats = computed(() => ({
  companies: filteredCompanies.value.length,
  declarations: filteredCompanies.value.reduce((sum, c) => sum + c.declarationsCount, 0),
  reports: filteredCompanies.value.reduce((sum, c) => sum + c.reportsCount, 0),
  volume: filteredCompanies.value.reduce((sum, c) => sum + c.totalVolume, 0),
}))

// Аналитическая таблица 1: Сводка по типам товаров
const productAnalytics = computed(() => {
  const analytics: Record<string, { name: string, code: string, companies: number, declarations: number, reports: number, volume: number }> = {}

  productTypes.forEach(pt => {
    analytics[pt.id] = { name: pt.name, code: pt.code, companies: 0, declarations: 0, reports: 0, volume: 0 }
  })

  filteredCompanies.value.forEach(company => {
    company.productTypes.forEach(pt => {
      if (analytics[pt]) {
        analytics[pt].companies++
        analytics[pt].declarations += Math.round(company.declarationsCount / company.productTypes.length)
        analytics[pt].reports += Math.round(company.reportsCount / company.productTypes.length)
        analytics[pt].volume += company.volumeByProduct[pt] || 0
      }
    })
  })

  return Object.values(analytics).filter(a => a.volume > 0).sort((a, b) => b.volume - a.volume)
})

// Аналитическая таблица 2: Сводка по периодам (кварталы)
const periodAnalytics = computed(() => {
  return [
    { period: 'Q1 2025', declarations: 45, reports: 22, volume: 3200, companies: 8 },
    { period: 'Q2 2025', declarations: 62, reports: 31, volume: 4100, companies: 10 },
    { period: 'Q3 2025', declarations: 78, reports: 38, volume: 5300, companies: 12 },
    { period: 'Q4 2025', declarations: 95, reports: 47, volume: 6800, companies: 14 },
    { period: 'Январь 2026', declarations: 35, reports: 17, volume: 2400, companies: 14 },
    { period: 'Февраль 2026', declarations: 28, reports: 14, volume: 1900, companies: 12 },
  ]
})

// Top companies by volume
const topByVolume = computed(() => {
  return [...filteredCompanies.value]
    .sort((a, b) => b.totalVolume - a.totalVolume)
    .slice(0, 5)
})

// Companies by region
const byRegion = computed(() => {
  const regionMap = new Map<string, { count: number, volume: number }>()
  filteredCompanies.value.forEach(c => {
    const existing = regionMap.get(c.region) || { count: 0, volume: 0 }
    regionMap.set(c.region, {
      count: existing.count + 1,
      volume: existing.volume + c.totalVolume
    })
  })
  return Array.from(regionMap.entries())
    .map(([region, data]) => ({ region, ...data }))
    .sort((a, b) => b.volume - a.volume)
})

// Detail modal
const showDetailModal = ref(false)
const selectedCompany = ref<Company | null>(null)

const openCompanyDetail = (company: Company) => {
  selectedCompany.value = company
  showDetailModal.value = true
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-gray-100 text-gray-500',
    new: 'bg-blue-100 text-blue-700',
  }
  return colors[status] || 'bg-gray-100 text-gray-700'
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    active: 'Активный',
    inactive: 'Неактивный',
    new: 'Новый',
  }
  return labels[status] || status
}

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    ooo: 'ОсОО',
    ip: 'ИП',
    oao: 'ОАО',
  }
  return labels[type] || type
}

const getProductTypeName = (id: string) => {
  return productTypes.find(pt => pt.id === id)?.name || id
}

const formatDate = (date: string | null) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('ru-RU')
}

const toggleSort = (field: string) => {
  if (sortBy.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = field
    sortOrder.value = 'asc'
  }
}

const getSortIcon = (field: string) => {
  if (sortBy.value !== field) return '↕'
  return sortOrder.value === 'asc' ? '↑' : '↓'
}

// Экспорт в Excel
const isExporting = ref(false)

const exportToExcel = async (type: 'companies' | 'products' | 'periods') => {
  isExporting.value = true

  // Симуляция генерации файла
  await new Promise(resolve => setTimeout(resolve, 1000))

  let csvContent = ''
  let filename = ''

  if (type === 'companies') {
    filename = 'analytics_companies.csv'
    csvContent = 'Компания,ИНН,Регион,Декларации,Отчёты,Объём (т),Статус\n'
    filteredCompanies.value.forEach(c => {
      csvContent += `"${c.name}",${c.inn},"${c.region}",${c.declarationsCount},${c.reportsCount},${c.totalVolume},${getStatusLabel(c.status)}\n`
    })
  } else if (type === 'products') {
    filename = 'analytics_products.csv'
    csvContent = 'Код,Тип товара,Компаний,Деклараций,Отчётов,Объём (т)\n'
    productAnalytics.value.forEach(p => {
      csvContent += `${p.code},"${p.name}",${p.companies},${p.declarations},${p.reports},${p.volume}\n`
    })
  } else {
    filename = 'analytics_periods.csv'
    csvContent = 'Период,Деклараций,Отчётов,Объём (т),Компаний\n'
    periodAnalytics.value.forEach(p => {
      csvContent += `"${p.period}",${p.declarations},${p.reports},${p.volume},${p.companies}\n`
    })
  }

  // Создание и скачивание файла
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
  URL.revokeObjectURL(link.href)

  isExporting.value = false
}
</script>

<template>
  <DashboardLayout
    role="eco-operator"
    roleTitle="ГП «Эко Оператор»"
    userName="ОсОО «ЭкоПереработка»"
    :menuItems="menuItems"
  >
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Аналитика по компаниям</h1>
          <p class="text-gray-600 mt-1">Статистика деклараций и отчётов от плательщиков</p>
        </div>
        <div class="flex items-center gap-3">
          <div class="relative">
            <button
              @click="exportToExcel(activeAnalyticsTab)"
              :disabled="isExporting"
              class="px-4 py-2 bg-lime-600 text-white rounded-lg font-medium hover:bg-lime-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <svg v-if="isExporting" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {{ isExporting ? 'Формирование...' : 'Скачать Excel' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">Компаний</p>
              <p class="text-2xl font-bold text-gray-900 mt-1">{{ totalStats.companies }}</p>
            </div>
            <div class="w-12 h-12 bg-lime-100 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-lime-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">Деклараций</p>
              <p class="text-2xl font-bold text-blue-600 mt-1">{{ totalStats.declarations }}</p>
            </div>
            <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">Отчётов</p>
              <p class="text-2xl font-bold text-emerald-600 mt-1">{{ totalStats.reports }}</p>
            </div>
            <div class="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">Общий объём</p>
              <p class="text-2xl font-bold text-amber-600 mt-1">{{ totalStats.volume.toLocaleString() }} т</p>
            </div>
            <div class="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Top Companies -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="font-semibold text-gray-900 mb-4">Топ-5 по объёму переработки</h3>
          <div class="space-y-3">
            <div v-for="(company, index) in topByVolume" :key="company.id" class="flex items-center gap-4">
              <div class="w-8 h-8 rounded-full bg-lime-100 flex items-center justify-center text-lime-700 font-bold text-sm">
                {{ index + 1 }}
              </div>
              <div class="flex-1">
                <div class="flex items-center justify-between mb-1">
                  <span class="font-medium text-gray-900 text-sm">{{ company.name }}</span>
                  <span class="text-sm text-gray-600">{{ company.totalVolume.toLocaleString() }} т</span>
                </div>
                <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-gradient-to-r from-lime-400 to-lime-600 rounded-full"
                    :style="{ width: `${(company.totalVolume / (topByVolume[0]?.totalVolume || 1)) * 100}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- By Region -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="font-semibold text-gray-900 mb-4">Распределение по регионам</h3>
          <div class="space-y-3">
            <div v-for="item in byRegion.slice(0, 6)" :key="item.region" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p class="font-medium text-gray-900">{{ item.region }}</p>
                <p class="text-sm text-gray-500">{{ item.count }} компаний</p>
              </div>
              <div class="text-right">
                <p class="font-bold text-lime-600">{{ item.volume.toLocaleString() }} т</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Analytics Tabs -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200">
        <div class="border-b border-gray-200">
          <div class="flex">
            <button
              @click="activeAnalyticsTab = 'companies'"
              :class="[
                'px-6 py-4 font-medium text-sm border-b-2 transition-colors',
                activeAnalyticsTab === 'companies'
                  ? 'border-lime-600 text-lime-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              ]"
            >
              По компаниям
            </button>
            <button
              @click="activeAnalyticsTab = 'products'"
              :class="[
                'px-6 py-4 font-medium text-sm border-b-2 transition-colors',
                activeAnalyticsTab === 'products'
                  ? 'border-lime-600 text-lime-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              ]"
            >
              По типам товаров
            </button>
            <button
              @click="activeAnalyticsTab = 'periods'"
              :class="[
                'px-6 py-4 font-medium text-sm border-b-2 transition-colors',
                activeAnalyticsTab === 'periods'
                  ? 'border-lime-600 text-lime-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              ]"
            >
              По периодам
            </button>
          </div>
        </div>

        <!-- Tab: Companies -->
        <div v-if="activeAnalyticsTab === 'companies'" class="p-5">
          <!-- Filters -->
          <div class="flex flex-wrap items-center gap-4 mb-6">
            <div class="flex-1 min-w-[280px]">
              <div class="relative">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Поиск по наименованию или ИНН..."
                  class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                />
              </div>
            </div>

            <select
              v-model="productTypeFilter"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
            >
              <option value="">Все типы товаров</option>
              <option v-for="pt in productTypes" :key="pt.id" :value="pt.id">{{ pt.name }}</option>
            </select>

            <select
              v-model="regionFilter"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
            >
              <option value="">Все регионы</option>
              <option v-for="region in regions" :key="region" :value="region">{{ region }}</option>
            </select>

            <select
              v-model="statusFilter"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
            >
              <option value="">Все статусы</option>
              <option value="active">Активные</option>
              <option value="inactive">Неактивные</option>
              <option value="new">Новые</option>
            </select>

            <div class="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                @click="documentTypeFilter = 'all'"
                :class="[
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                  documentTypeFilter === 'all' ? 'bg-white text-lime-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                ]"
              >
                Все
              </button>
              <button
                @click="documentTypeFilter = 'declarations'"
                :class="[
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                  documentTypeFilter === 'declarations' ? 'bg-white text-lime-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                ]"
              >
                Декларации
              </button>
              <button
                @click="documentTypeFilter = 'reports'"
                :class="[
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                  documentTypeFilter === 'reports' ? 'bg-white text-lime-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                ]"
              >
                Отчёты
              </button>
            </div>
          </div>

          <!-- Companies Table -->
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 border-y border-gray-200">
                <tr>
                  <th @click="toggleSort('name')" class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-100">
                    <div class="flex items-center gap-1">Компания <span class="text-gray-400">{{ getSortIcon('name') }}</span></div>
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Регион</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Типы товаров</th>
                  <th @click="toggleSort('declarations')" class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-100">
                    <div class="flex items-center justify-center gap-1">Декл. <span class="text-gray-400">{{ getSortIcon('declarations') }}</span></div>
                  </th>
                  <th @click="toggleSort('reports')" class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-100">
                    <div class="flex items-center justify-center gap-1">Отчёты <span class="text-gray-400">{{ getSortIcon('reports') }}</span></div>
                  </th>
                  <th @click="toggleSort('volume')" class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-100">
                    <div class="flex items-center justify-center gap-1">Объём <span class="text-gray-400">{{ getSortIcon('volume') }}</span></div>
                  </th>
                  <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Статус</th>
                  <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Действия</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="company in filteredCompanies" :key="company.id" class="hover:bg-gray-50">
                  <td class="px-4 py-4">
                    <div class="font-medium text-gray-900">{{ company.name }}</div>
                    <div class="flex items-center gap-2 mt-1">
                      <span class="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">{{ getTypeLabel(company.type) }}</span>
                      <span class="text-xs text-gray-500 font-mono">ИНН: {{ company.inn }}</span>
                    </div>
                  </td>
                  <td class="px-4 py-4 text-sm text-gray-600">{{ company.region }}</td>
                  <td class="px-4 py-4">
                    <div class="flex flex-wrap gap-1">
                      <span
                        v-for="pt in company.productTypes.slice(0, 2)"
                        :key="pt"
                        class="text-xs px-2 py-0.5 bg-lime-100 text-lime-700 rounded-full"
                      >
                        {{ getProductTypeName(pt) }}
                      </span>
                      <span v-if="company.productTypes.length > 2" class="text-xs text-gray-500">+{{ company.productTypes.length - 2 }}</span>
                    </div>
                  </td>
                  <td class="px-4 py-4 text-center">
                    <span class="font-semibold text-blue-600">{{ company.declarationsCount }}</span>
                  </td>
                  <td class="px-4 py-4 text-center">
                    <span class="font-semibold text-emerald-600">{{ company.reportsCount }}</span>
                  </td>
                  <td class="px-4 py-4 text-center">
                    <span class="font-bold text-gray-900">{{ company.totalVolume.toLocaleString() }} т</span>
                  </td>
                  <td class="px-4 py-4 text-center">
                    <span :class="['text-xs px-2 py-1 rounded-full font-medium', getStatusColor(company.status)]">
                      {{ getStatusLabel(company.status) }}
                    </span>
                  </td>
                  <td class="px-4 py-4 text-center">
                    <button @click="openCompanyDetail(company)" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#3B82F6] text-white hover:bg-[#2563EB] transition-colors shadow-sm">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Подробнее
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="filteredCompanies.length === 0" class="p-12 text-center">
            <p class="text-gray-500">Компании не найдены</p>
          </div>

          <div class="px-4 py-4 border-t border-gray-200 flex items-center justify-between">
            <p class="text-sm text-gray-500">Показано {{ filteredCompanies.length }} из {{ companies.length }} компаний</p>
          </div>
        </div>

        <!-- Tab: Products Analytics -->
        <div v-if="activeAnalyticsTab === 'products'" class="p-5">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-gray-900">Сводная таблица по типам товаров</h3>
            <button
              @click="exportToExcel('products')"
              :disabled="isExporting"
              class="px-3 py-1.5 text-sm bg-lime-100 text-lime-700 rounded-lg font-medium hover:bg-lime-200 transition-colors flex items-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Скачать
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 border-y border-gray-200">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Код</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Тип товара</th>
                  <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Компаний</th>
                  <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Деклараций</th>
                  <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Отчётов</th>
                  <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Объём (т)</th>
                  <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Доля</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="item in productAnalytics" :key="item.code" class="hover:bg-gray-50">
                  <td class="px-4 py-4">
                    <span class="font-mono text-sm bg-lime-100 text-lime-700 px-2 py-1 rounded">{{ item.code }}</span>
                  </td>
                  <td class="px-4 py-4 font-medium text-gray-900">{{ item.name }}</td>
                  <td class="px-4 py-4 text-center text-gray-600">{{ item.companies }}</td>
                  <td class="px-4 py-4 text-center font-semibold text-blue-600">{{ item.declarations }}</td>
                  <td class="px-4 py-4 text-center font-semibold text-emerald-600">{{ item.reports }}</td>
                  <td class="px-4 py-4 text-center font-bold text-gray-900">{{ item.volume.toLocaleString() }}</td>
                  <td class="px-4 py-4 text-center">
                    <div class="flex items-center gap-2">
                      <div class="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          class="h-full bg-lime-500 rounded-full"
                          :style="{ width: `${(item.volume / totalStats.volume) * 100}%` }"
                        ></div>
                      </div>
                      <span class="text-sm text-gray-600 w-12">{{ ((item.volume / totalStats.volume) * 100).toFixed(1) }}%</span>
                    </div>
                  </td>
                </tr>
              </tbody>
              <tfoot class="bg-gray-100">
                <tr>
                  <td colspan="2" class="px-4 py-3 font-bold text-gray-900">Итого</td>
                  <td class="px-4 py-3 text-center font-bold text-gray-900">{{ totalStats.companies }}</td>
                  <td class="px-4 py-3 text-center font-bold text-blue-600">{{ totalStats.declarations }}</td>
                  <td class="px-4 py-3 text-center font-bold text-emerald-600">{{ totalStats.reports }}</td>
                  <td class="px-4 py-3 text-center font-bold text-gray-900">{{ totalStats.volume.toLocaleString() }}</td>
                  <td class="px-4 py-3 text-center font-bold text-gray-900">100%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <!-- Tab: Periods Analytics -->
        <div v-if="activeAnalyticsTab === 'periods'" class="p-5">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-gray-900">Сводная таблица по периодам</h3>
            <button
              @click="exportToExcel('periods')"
              :disabled="isExporting"
              class="px-3 py-1.5 text-sm bg-lime-100 text-lime-700 rounded-lg font-medium hover:bg-lime-200 transition-colors flex items-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Скачать
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 border-y border-gray-200">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Период</th>
                  <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Деклараций</th>
                  <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Отчётов</th>
                  <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Объём (т)</th>
                  <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Активных компаний</th>
                  <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Динамика</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="(item, index) in periodAnalytics" :key="item.period" class="hover:bg-gray-50">
                  <td class="px-4 py-4 font-medium text-gray-900">{{ item.period }}</td>
                  <td class="px-4 py-4 text-center font-semibold text-blue-600">{{ item.declarations }}</td>
                  <td class="px-4 py-4 text-center font-semibold text-emerald-600">{{ item.reports }}</td>
                  <td class="px-4 py-4 text-center font-bold text-gray-900">{{ item.volume.toLocaleString() }}</td>
                  <td class="px-4 py-4 text-center text-gray-600">{{ item.companies }}</td>
                  <td class="px-4 py-4 text-center">
                    <span
                      v-if="index > 0"
                      :class="[
                        'text-sm font-medium',
                        item.volume > periodAnalytics[index - 1].volume ? 'text-green-600' : 'text-red-600'
                      ]"
                    >
                      {{ item.volume > periodAnalytics[index - 1].volume ? '↑' : '↓' }}
                      {{ Math.abs(((item.volume - periodAnalytics[index - 1].volume) / periodAnalytics[index - 1].volume) * 100).toFixed(1) }}%
                    </span>
                    <span v-else class="text-gray-400">—</span>
                  </td>
                </tr>
              </tbody>
              <tfoot class="bg-gray-100">
                <tr>
                  <td class="px-4 py-3 font-bold text-gray-900">Всего за период</td>
                  <td class="px-4 py-3 text-center font-bold text-blue-600">{{ periodAnalytics.reduce((s, p) => s + p.declarations, 0) }}</td>
                  <td class="px-4 py-3 text-center font-bold text-emerald-600">{{ periodAnalytics.reduce((s, p) => s + p.reports, 0) }}</td>
                  <td class="px-4 py-3 text-center font-bold text-gray-900">{{ periodAnalytics.reduce((s, p) => s + p.volume, 0).toLocaleString() }}</td>
                  <td class="px-4 py-3 text-center font-bold text-gray-900">—</td>
                  <td class="px-4 py-3 text-center font-bold text-gray-900">—</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- Period Chart -->
          <div class="mt-6 p-4 bg-gray-50 rounded-xl">
            <h4 class="font-medium text-gray-700 mb-4">График объёмов по периодам</h4>
            <div class="flex items-end gap-4 h-40">
              <div v-for="item in periodAnalytics" :key="item.period" class="flex-1 flex flex-col items-center">
                <div
                  class="w-full bg-gradient-to-t from-lime-500 to-lime-400 rounded-t-lg transition-all hover:from-lime-600 hover:to-lime-500"
                  :style="{ height: `${(item.volume / Math.max(...periodAnalytics.map(p => p.volume))) * 100}%` }"
                ></div>
                <p class="text-xs text-gray-500 mt-2 text-center">{{ item.period.replace(' 2025', '').replace(' 2026', '') }}</p>
                <p class="text-xs font-semibold text-gray-700">{{ (item.volume / 1000).toFixed(1) }}k</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Company Detail Modal -->
    <Teleport to="body">
      <div v-if="showDetailModal && selectedCompany" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
          <div class="p-6 border-b border-gray-200 bg-gradient-to-r from-lime-500 to-lime-600">
            <div class="flex items-start justify-between">
              <div class="text-white">
                <h3 class="text-xl font-bold">{{ selectedCompany.name }}</h3>
                <p class="text-lime-100 mt-1">{{ getTypeLabel(selectedCompany.type) }} • ИНН: {{ selectedCompany.inn }}</p>
              </div>
              <button @click="showDetailModal = false" class="p-2 text-white/80 hover:text-white">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div class="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            <div class="grid grid-cols-4 gap-4 mb-6">
              <div class="bg-blue-50 rounded-xl p-4 text-center">
                <p class="text-3xl font-bold text-blue-600">{{ selectedCompany.declarationsCount }}</p>
                <p class="text-sm text-blue-600">Деклараций</p>
              </div>
              <div class="bg-emerald-50 rounded-xl p-4 text-center">
                <p class="text-3xl font-bold text-emerald-600">{{ selectedCompany.reportsCount }}</p>
                <p class="text-sm text-emerald-600">Отчётов</p>
              </div>
              <div class="bg-amber-50 rounded-xl p-4 text-center">
                <p class="text-3xl font-bold text-amber-600">{{ selectedCompany.totalVolume.toLocaleString() }}</p>
                <p class="text-sm text-amber-600">Тонн</p>
              </div>
              <div class="bg-gray-50 rounded-xl p-4 text-center">
                <span :class="['text-sm px-3 py-1 rounded-full font-medium', getStatusColor(selectedCompany.status)]">
                  {{ getStatusLabel(selectedCompany.status) }}
                </span>
                <p class="text-sm text-gray-500 mt-2">Статус</p>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-6 mb-6">
              <div>
                <h4 class="font-semibold text-gray-900 mb-3">Информация о компании</h4>
                <div class="space-y-2">
                  <div class="flex justify-between py-2 border-b border-gray-100">
                    <span class="text-gray-500">Регион</span>
                    <span class="font-medium text-gray-900">{{ selectedCompany.region }}</span>
                  </div>
                  <div class="flex justify-between py-2 border-b border-gray-100">
                    <span class="text-gray-500">Тип организации</span>
                    <span class="font-medium text-gray-900">{{ getTypeLabel(selectedCompany.type) }}</span>
                  </div>
                  <div class="flex justify-between py-2 border-b border-gray-100">
                    <span class="text-gray-500">ИНН</span>
                    <span class="font-mono text-gray-900">{{ selectedCompany.inn }}</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 class="font-semibold text-gray-900 mb-3">Последняя активность</h4>
                <div class="space-y-2">
                  <div class="flex justify-between py-2 border-b border-gray-100">
                    <span class="text-gray-500">Последняя декларация</span>
                    <span class="font-medium text-gray-900">{{ formatDate(selectedCompany.lastDeclaration) }}</span>
                  </div>
                  <div class="flex justify-between py-2 border-b border-gray-100">
                    <span class="text-gray-500">Последний отчёт</span>
                    <span class="font-medium text-gray-900">{{ formatDate(selectedCompany.lastReport) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="mb-6">
              <h4 class="font-semibold text-gray-900 mb-3">Типы товаров</h4>
              <div class="flex flex-wrap gap-2">
                <span v-for="pt in selectedCompany.productTypes" :key="pt" class="px-3 py-1.5 bg-lime-100 text-lime-700 rounded-full text-sm font-medium">
                  {{ getProductTypeName(pt) }}
                </span>
              </div>
            </div>

            <div>
              <h4 class="font-semibold text-gray-900 mb-3">Объёмы по типам товаров</h4>
              <div class="space-y-2">
                <div v-for="pt in selectedCompany.productTypes" :key="pt" class="flex items-center gap-4">
                  <span class="w-40 text-sm text-gray-600">{{ getProductTypeName(pt) }}</span>
                  <div class="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      class="h-full bg-lime-500 rounded-full"
                      :style="{ width: `${((selectedCompany.volumeByProduct[pt] || 0) / selectedCompany.totalVolume) * 100}%` }"
                    ></div>
                  </div>
                  <span class="w-20 text-right font-semibold text-gray-900">{{ (selectedCompany.volumeByProduct[pt] || 0).toLocaleString() }} т</span>
                </div>
              </div>
            </div>
          </div>

          <div class="p-6 border-t border-gray-200 flex justify-between">
            <div class="flex gap-3">
              <button class="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition-colors">
                Декларации компании
              </button>
              <button class="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg font-medium hover:bg-emerald-200 transition-colors">
                Отчёты компании
              </button>
            </div>
            <button @click="showDetailModal = false" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </DashboardLayout>
</template>
