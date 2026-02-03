<script setup lang="ts">
import { ref, computed } from 'vue'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import { icons } from '../../utils/menuIcons'

const menuItems = [
  { id: 'dashboard', label: 'Главная', icon: icons.dashboard, route: '/business' },
  { id: 'reports', label: 'Отчёты', icon: icons.report, route: '/business/reports' },
  { id: 'declarations', label: 'Декларации', icon: icons.document, route: '/business/declarations' },
  { id: 'calculator', label: 'Расчёт утильсбора', icon: icons.calculator, route: '/business/calculator' },
  { id: 'payments', label: 'Платежи', icon: icons.payment, route: '/business/payments' },
  { id: 'documents', label: 'Документы', icon: icons.folder, route: '/business/documents' },
  { id: 'normatives', label: 'Нормативы переработки', icon: icons.registries, route: '/business/normatives' },
  { id: 'recyclers', label: 'Переработчики отходов', icon: icons.recycle, route: '/business/recyclers' },
  { id: 'profile', label: 'Профиль компании', icon: icons.building, route: '/business/profile' },
]

// Current year selection
const selectedYear = ref(2024)
const years = [2024, 2025, 2026, 2027, 2028]

// Category filter
const selectedCategory = ref('all')
const categories = [
  { id: 'all', name: 'Все категории', icon: '📦' },
  { id: 'packaging', name: 'Упаковка', icon: '📦' },
  { id: 'electronics', name: 'Электроника', icon: '💻' },
  { id: 'batteries', name: 'Батареи и аккумуляторы', icon: '🔋' },
  { id: 'tires', name: 'Шины', icon: '⚫' },
  { id: 'oils', name: 'Масла', icon: '🛢️' },
  { id: 'vehicles', name: 'Транспортные средства', icon: '🚗' },
]

// Search
const searchQuery = ref('')

// Normatives data
interface Normative {
  id: number
  category: string
  categoryName: string
  productType: string
  code: string
  unit: string
  rates: {
    [year: number]: number
  }
  description: string
  legislation: string
}

const normatives = ref<Normative[]>([
  // Упаковка
  {
    id: 1,
    category: 'packaging',
    categoryName: 'Упаковка',
    productType: 'Бумага и картон',
    code: 'УП-01',
    unit: '%',
    rates: { 2024: 20, 2025: 25, 2026: 30, 2027: 35, 2028: 40 },
    description: 'Упаковка из бумаги, картона, гофрокартона',
    legislation: 'ПП КР №234 от 15.03.2023',
  },
  {
    id: 2,
    category: 'packaging',
    categoryName: 'Упаковка',
    productType: 'Пластик (ПЭТ)',
    code: 'УП-02',
    unit: '%',
    rates: { 2024: 15, 2025: 20, 2026: 25, 2027: 30, 2028: 35 },
    description: 'Пластиковая упаковка из полиэтилентерефталата',
    legislation: 'ПП КР №234 от 15.03.2023',
  },
  {
    id: 3,
    category: 'packaging',
    categoryName: 'Упаковка',
    productType: 'Пластик (ПП, ПЭ)',
    code: 'УП-03',
    unit: '%',
    rates: { 2024: 10, 2025: 15, 2026: 20, 2027: 25, 2028: 30 },
    description: 'Полипропилен, полиэтилен высокого и низкого давления',
    legislation: 'ПП КР №234 от 15.03.2023',
  },
  {
    id: 4,
    category: 'packaging',
    categoryName: 'Упаковка',
    productType: 'Стекло',
    code: 'УП-04',
    unit: '%',
    rates: { 2024: 25, 2025: 30, 2026: 35, 2027: 40, 2028: 45 },
    description: 'Стеклянная тара и упаковка',
    legislation: 'ПП КР №234 от 15.03.2023',
  },
  {
    id: 5,
    category: 'packaging',
    categoryName: 'Упаковка',
    productType: 'Металл (алюминий)',
    code: 'УП-05',
    unit: '%',
    rates: { 2024: 30, 2025: 35, 2026: 40, 2027: 45, 2028: 50 },
    description: 'Алюминиевые банки и упаковка',
    legislation: 'ПП КР №234 от 15.03.2023',
  },
  {
    id: 6,
    category: 'packaging',
    categoryName: 'Упаковка',
    productType: 'Металл (жесть)',
    code: 'УП-06',
    unit: '%',
    rates: { 2024: 25, 2025: 30, 2026: 35, 2027: 40, 2028: 45 },
    description: 'Жестяная тара и упаковка',
    legislation: 'ПП КР №234 от 15.03.2023',
  },
  {
    id: 7,
    category: 'packaging',
    categoryName: 'Упаковка',
    productType: 'Комбинированная упаковка',
    code: 'УП-07',
    unit: '%',
    rates: { 2024: 5, 2025: 10, 2026: 15, 2027: 20, 2028: 25 },
    description: 'Tetra Pak и аналогичная многослойная упаковка',
    legislation: 'ПП КР №234 от 15.03.2023',
  },
  // Электроника
  {
    id: 8,
    category: 'electronics',
    categoryName: 'Электроника',
    productType: 'Крупная бытовая техника',
    code: 'ЭЛ-01',
    unit: '%',
    rates: { 2024: 35, 2025: 40, 2026: 45, 2027: 50, 2028: 55 },
    description: 'Холодильники, стиральные машины, плиты и т.д.',
    legislation: 'ПП КР №312 от 20.05.2023',
  },
  {
    id: 9,
    category: 'electronics',
    categoryName: 'Электроника',
    productType: 'Мелкая бытовая техника',
    code: 'ЭЛ-02',
    unit: '%',
    rates: { 2024: 30, 2025: 35, 2026: 40, 2027: 45, 2028: 50 },
    description: 'Пылесосы, микроволновки, тостеры и т.д.',
    legislation: 'ПП КР №312 от 20.05.2023',
  },
  {
    id: 10,
    category: 'electronics',
    categoryName: 'Электроника',
    productType: 'ИТ и телекоммуникации',
    code: 'ЭЛ-03',
    unit: '%',
    rates: { 2024: 40, 2025: 45, 2026: 50, 2027: 55, 2028: 60 },
    description: 'Компьютеры, телефоны, планшеты, принтеры',
    legislation: 'ПП КР №312 от 20.05.2023',
  },
  {
    id: 11,
    category: 'electronics',
    categoryName: 'Электроника',
    productType: 'Осветительное оборудование',
    code: 'ЭЛ-04',
    unit: '%',
    rates: { 2024: 45, 2025: 50, 2026: 55, 2027: 60, 2028: 65 },
    description: 'Лампы, светильники, LED-оборудование',
    legislation: 'ПП КР №312 от 20.05.2023',
  },
  // Батареи
  {
    id: 12,
    category: 'batteries',
    categoryName: 'Батареи и аккумуляторы',
    productType: 'Портативные батареи',
    code: 'БТ-01',
    unit: '%',
    rates: { 2024: 25, 2025: 30, 2026: 35, 2027: 40, 2028: 45 },
    description: 'Батарейки AA, AAA, CR и аналогичные',
    legislation: 'ПП КР №312 от 20.05.2023',
  },
  {
    id: 13,
    category: 'batteries',
    categoryName: 'Батареи и аккумуляторы',
    productType: 'Автомобильные аккумуляторы',
    code: 'БТ-02',
    unit: '%',
    rates: { 2024: 50, 2025: 55, 2026: 60, 2027: 65, 2028: 70 },
    description: 'Свинцово-кислотные и литий-ионные АКБ для ТС',
    legislation: 'ПП КР №312 от 20.05.2023',
  },
  {
    id: 14,
    category: 'batteries',
    categoryName: 'Батареи и аккумуляторы',
    productType: 'Промышленные аккумуляторы',
    code: 'БТ-03',
    unit: '%',
    rates: { 2024: 55, 2025: 60, 2026: 65, 2027: 70, 2028: 75 },
    description: 'Аккумуляторы для промышленного оборудования',
    legislation: 'ПП КР №312 от 20.05.2023',
  },
  // Шины
  {
    id: 15,
    category: 'tires',
    categoryName: 'Шины',
    productType: 'Легковые шины',
    code: 'ШН-01',
    unit: '%',
    rates: { 2024: 20, 2025: 25, 2026: 30, 2027: 35, 2028: 40 },
    description: 'Шины для легковых автомобилей',
    legislation: 'ПП КР №287 от 10.04.2023',
  },
  {
    id: 16,
    category: 'tires',
    categoryName: 'Шины',
    productType: 'Грузовые шины',
    code: 'ШН-02',
    unit: '%',
    rates: { 2024: 25, 2025: 30, 2026: 35, 2027: 40, 2028: 45 },
    description: 'Шины для грузовых автомобилей и автобусов',
    legislation: 'ПП КР №287 от 10.04.2023',
  },
  {
    id: 17,
    category: 'tires',
    categoryName: 'Шины',
    productType: 'Специальные шины',
    code: 'ШН-03',
    unit: '%',
    rates: { 2024: 15, 2025: 20, 2026: 25, 2027: 30, 2028: 35 },
    description: 'Шины для сельхозтехники и спецтехники',
    legislation: 'ПП КР №287 от 10.04.2023',
  },
  // Масла
  {
    id: 18,
    category: 'oils',
    categoryName: 'Масла',
    productType: 'Моторные масла',
    code: 'МС-01',
    unit: '%',
    rates: { 2024: 30, 2025: 35, 2026: 40, 2027: 45, 2028: 50 },
    description: 'Моторные масла для двигателей внутреннего сгорания',
    legislation: 'ПП КР №287 от 10.04.2023',
  },
  {
    id: 19,
    category: 'oils',
    categoryName: 'Масла',
    productType: 'Трансмиссионные масла',
    code: 'МС-02',
    unit: '%',
    rates: { 2024: 25, 2025: 30, 2026: 35, 2027: 40, 2028: 45 },
    description: 'Масла для коробок передач и редукторов',
    legislation: 'ПП КР №287 от 10.04.2023',
  },
  {
    id: 20,
    category: 'oils',
    categoryName: 'Масла',
    productType: 'Гидравлические масла',
    code: 'МС-03',
    unit: '%',
    rates: { 2024: 20, 2025: 25, 2026: 30, 2027: 35, 2028: 40 },
    description: 'Масла для гидравлических систем',
    legislation: 'ПП КР №287 от 10.04.2023',
  },
  // Транспортные средства
  {
    id: 21,
    category: 'vehicles',
    categoryName: 'Транспортные средства',
    productType: 'Легковые автомобили',
    code: 'ТС-01',
    unit: '%',
    rates: { 2024: 80, 2025: 82, 2026: 84, 2027: 86, 2028: 88 },
    description: 'Легковые автомобили категории M1',
    legislation: 'ПП КР №345 от 25.06.2023',
  },
  {
    id: 22,
    category: 'vehicles',
    categoryName: 'Транспортные средства',
    productType: 'Грузовые автомобили',
    code: 'ТС-02',
    unit: '%',
    rates: { 2024: 75, 2025: 78, 2026: 81, 2027: 84, 2028: 87 },
    description: 'Грузовые автомобили категорий N1, N2, N3',
    legislation: 'ПП КР №345 от 25.06.2023',
  },
  {
    id: 23,
    category: 'vehicles',
    categoryName: 'Транспортные средства',
    productType: 'Мотоциклы',
    code: 'ТС-03',
    unit: '%',
    rates: { 2024: 70, 2025: 73, 2026: 76, 2027: 79, 2028: 82 },
    description: 'Мотоциклы и мопеды категорий L1-L7',
    legislation: 'ПП КР №345 от 25.06.2023',
  },
])

// Filtered normatives
const filteredNormatives = computed(() => {
  return normatives.value.filter(n => {
    const matchesCategory = selectedCategory.value === 'all' || n.category === selectedCategory.value
    const matchesSearch = !searchQuery.value ||
      n.productType.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      n.code.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      n.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchesCategory && matchesSearch
  })
})

// Group by category for display
const groupedNormatives = computed(() => {
  const groups: { [key: string]: Normative[] } = {}
  filteredNormatives.value.forEach(n => {
    if (!groups[n.categoryName]) {
      groups[n.categoryName] = []
    }
    groups[n.categoryName].push(n)
  })
  return groups
})

// Get rate change indicator
const getRateChange = (rates: { [year: number]: number }, year: number) => {
  const currentRate = rates[year]
  const prevRate = rates[year - 1]
  if (!prevRate) return null
  return currentRate - prevRate
}

// Get color class based on rate level
const getRateColorClass = (rate: number) => {
  if (rate >= 50) return 'text-red-600 bg-red-50'
  if (rate >= 30) return 'text-orange-600 bg-orange-50'
  return 'text-green-600 bg-green-50'
}

// Company compliance status (mock data)
const complianceStatus = ref({
  packaging: { required: 20, actual: 18, status: 'warning' },
  electronics: { required: 35, actual: 38, status: 'success' },
  batteries: { required: 25, actual: 25, status: 'success' },
})

// Modal state for details
const showDetailsModal = ref(false)
const selectedNormative = ref<Normative | null>(null)

const openDetails = (normative: Normative) => {
  selectedNormative.value = normative
  showDetailsModal.value = true
}

const closeDetails = () => {
  showDetailsModal.value = false
  selectedNormative.value = null
}
</script>

<template>
  <DashboardLayout
    role="business"
    roleTitle="Бизнес"
    userName="ОсОО «ТехПром»"
    :menuItems="menuItems"
  >
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Нормативы переработки</h1>
        <p class="text-gray-600 mt-1">Требуемые проценты утилизации по категориям товаров</p>
      </div>

      <!-- CTA Banner -->
      <div class="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-6 text-white">
        <div class="flex items-start justify-between">
          <div class="flex items-start gap-4">
            <div class="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h2 class="text-xl font-bold">Нормативы утилизации на {{ selectedYear }} год</h2>
              <p class="text-indigo-100 mt-1 max-w-2xl">
                Проценты обязательной переработки отходов от использования товаров.
                Нормативы ежегодно увеличиваются согласно утверждённому графику.
              </p>
              <div class="flex items-center gap-4 mt-4">
                <a href="/legislation" class="inline-flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Законодательство
                </a>
                <a href="/business/calculator" class="inline-flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30 transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Рассчитать сбор
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Your Compliance Status -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Ваше соответствие нормативам ({{ selectedYear }})
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="p-4 rounded-xl border-2" :class="complianceStatus.packaging.status === 'success' ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-gray-600">Упаковка</span>
              <span :class="complianceStatus.packaging.status === 'success' ? 'text-green-600' : 'text-yellow-600'" class="text-xs font-medium px-2 py-1 rounded-full" :style="{ backgroundColor: complianceStatus.packaging.status === 'success' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(234, 179, 8, 0.2)' }">
                {{ complianceStatus.packaging.status === 'success' ? 'Выполнено' : 'Внимание' }}
              </span>
            </div>
            <div class="flex items-end gap-2">
              <span class="text-2xl font-bold" :class="complianceStatus.packaging.status === 'success' ? 'text-green-700' : 'text-yellow-700'">
                {{ complianceStatus.packaging.actual }}%
              </span>
              <span class="text-sm text-gray-500 mb-1">из {{ complianceStatus.packaging.required }}%</span>
            </div>
            <div class="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all"
                :class="complianceStatus.packaging.status === 'success' ? 'bg-green-500' : 'bg-yellow-500'"
                :style="{ width: `${Math.min(100, (complianceStatus.packaging.actual / complianceStatus.packaging.required) * 100)}%` }"
              ></div>
            </div>
          </div>

          <div class="p-4 rounded-xl border-2 border-green-200 bg-green-50">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-gray-600">Электроника</span>
              <span class="text-green-600 text-xs font-medium px-2 py-1 rounded-full" style="background-color: rgba(34, 197, 94, 0.2)">Выполнено</span>
            </div>
            <div class="flex items-end gap-2">
              <span class="text-2xl font-bold text-green-700">{{ complianceStatus.electronics.actual }}%</span>
              <span class="text-sm text-gray-500 mb-1">из {{ complianceStatus.electronics.required }}%</span>
            </div>
            <div class="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div class="h-full bg-green-500 rounded-full" style="width: 100%"></div>
            </div>
          </div>

          <div class="p-4 rounded-xl border-2 border-green-200 bg-green-50">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-gray-600">Батареи</span>
              <span class="text-green-600 text-xs font-medium px-2 py-1 rounded-full" style="background-color: rgba(34, 197, 94, 0.2)">Выполнено</span>
            </div>
            <div class="flex items-end gap-2">
              <span class="text-2xl font-bold text-green-700">{{ complianceStatus.batteries.actual }}%</span>
              <span class="text-sm text-gray-500 mb-1">из {{ complianceStatus.batteries.required }}%</span>
            </div>
            <div class="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div class="h-full bg-green-500 rounded-full" style="width: 100%"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div class="flex flex-col lg:flex-row gap-4">
          <!-- Year selector -->
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-gray-700">Год:</span>
            <div class="flex rounded-lg border border-gray-300 overflow-hidden">
              <button
                v-for="year in years"
                :key="year"
                @click="selectedYear = year"
                :class="[
                  'px-3 py-1.5 text-sm font-medium transition-colors',
                  selectedYear === year
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                ]"
              >
                {{ year }}
              </button>
            </div>
          </div>

          <!-- Search -->
          <div class="flex-1">
            <div class="relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Поиск по названию или коду..."
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        <!-- Category tabs -->
        <div class="flex flex-wrap gap-2 mt-4">
          <button
            v-for="cat in categories"
            :key="cat.id"
            @click="selectedCategory = cat.id"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2',
              selectedCategory === cat.id
                ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
            ]"
          >
            <span>{{ cat.icon }}</span>
            {{ cat.name }}
          </button>
        </div>
      </div>

      <!-- Normatives Table -->
      <div v-for="(items, categoryName) in groupedNormatives" :key="categoryName" class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">{{ categoryName }}</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-200">
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Код</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Вид продукции</th>
                <th
                  v-for="year in years"
                  :key="year"
                  class="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider"
                  :class="year === selectedYear ? 'text-indigo-700 bg-indigo-50' : 'text-gray-600'"
                >
                  {{ year }}
                </th>
                <th class="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Действия</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="item in items" :key="item.id" class="hover:bg-gray-50">
                <td class="px-6 py-4">
                  <span class="font-mono text-sm text-indigo-600 bg-indigo-50 px-2 py-1 rounded">{{ item.code }}</span>
                </td>
                <td class="px-6 py-4">
                  <div>
                    <p class="font-medium text-gray-900">{{ item.productType }}</p>
                    <p class="text-sm text-gray-500 truncate max-w-xs">{{ item.description }}</p>
                  </div>
                </td>
                <td
                  v-for="year in years"
                  :key="year"
                  class="px-4 py-4 text-center"
                  :class="year === selectedYear ? 'bg-indigo-50' : ''"
                >
                  <div class="flex flex-col items-center">
                    <span
                      class="font-bold text-lg px-2 py-0.5 rounded"
                      :class="year === selectedYear ? getRateColorClass(item.rates[year]) : 'text-gray-700'"
                    >
                      {{ item.rates[year] }}%
                    </span>
                    <span
                      v-if="getRateChange(item.rates, year)"
                      class="text-xs mt-0.5"
                      :class="getRateChange(item.rates, year)! > 0 ? 'text-red-500' : 'text-green-500'"
                    >
                      {{ getRateChange(item.rates, year)! > 0 ? '+' : '' }}{{ getRateChange(item.rates, year) }}%
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4 text-center">
                  <button
                    @click="openDetails(item)"
                    class="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
                  >
                    Подробнее
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="Object.keys(groupedNormatives).length === 0" class="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-1">Нормативы не найдены</h3>
        <p class="text-gray-500">Попробуйте изменить параметры поиска</p>
      </div>

      <!-- Info cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
          <div class="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mb-3">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h4 class="font-semibold text-gray-900 mb-1">Что такое норматив?</h4>
          <p class="text-sm text-gray-600">
            Минимальный процент товаров, который должен быть переработан от общего объёма выпущенной продукции
          </p>
        </div>

        <div class="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-5 border border-amber-200">
          <div class="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center mb-3">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h4 class="font-semibold text-gray-900 mb-1">Ежегодный рост</h4>
          <p class="text-sm text-gray-600">
            Нормативы увеличиваются ежегодно на 3-5% согласно плану достижения целевых показателей
          </p>
        </div>

        <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border border-green-200">
          <div class="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mb-3">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h4 class="font-semibold text-gray-900 mb-1">Как выполнить?</h4>
          <p class="text-sm text-gray-600">
            Заключите договоры с лицензированными переработчиками или уплатите утилизационный сбор
          </p>
        </div>
      </div>
    </div>

    <!-- Details Modal -->
    <Teleport to="body">
      <div v-if="showDetailsModal && selectedNormative" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">Детали норматива</h3>
            <button @click="closeDetails" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="p-6 space-y-6">
            <!-- Header info -->
            <div class="flex items-start gap-4">
              <div class="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <span class="text-2xl">
                  {{ categories.find(c => c.id === selectedNormative.category)?.icon || '📦' }}
                </span>
              </div>
              <div>
                <span class="text-sm text-indigo-600 font-medium">{{ selectedNormative.code }}</span>
                <h4 class="text-xl font-bold text-gray-900">{{ selectedNormative.productType }}</h4>
                <p class="text-gray-500">{{ selectedNormative.categoryName }}</p>
              </div>
            </div>

            <!-- Description -->
            <div>
              <h5 class="text-sm font-medium text-gray-500 mb-1">Описание</h5>
              <p class="text-gray-900">{{ selectedNormative.description }}</p>
            </div>

            <!-- Rates by year -->
            <div>
              <h5 class="text-sm font-medium text-gray-500 mb-3">Нормативы по годам</h5>
              <div class="flex items-end gap-2">
                <div
                  v-for="year in years"
                  :key="year"
                  class="flex-1 text-center"
                >
                  <div
                    class="bg-indigo-100 rounded-t-lg transition-all"
                    :style="{ height: `${selectedNormative.rates[year] * 2}px` }"
                    :class="year === selectedYear ? 'bg-indigo-500' : 'bg-indigo-200'"
                  ></div>
                  <div class="py-2 text-center border-t-2" :class="year === selectedYear ? 'border-indigo-500' : 'border-gray-200'">
                    <p class="text-lg font-bold" :class="year === selectedYear ? 'text-indigo-600' : 'text-gray-700'">
                      {{ selectedNormative.rates[year] }}%
                    </p>
                    <p class="text-xs text-gray-500">{{ year }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Legislation reference -->
            <div class="bg-gray-50 rounded-lg p-4">
              <h5 class="text-sm font-medium text-gray-500 mb-1">Нормативный документ</h5>
              <p class="text-gray-900 font-medium">{{ selectedNormative.legislation }}</p>
              <a href="/legislation" class="text-indigo-600 hover:text-indigo-800 text-sm mt-2 inline-flex items-center gap-1">
                Посмотреть в разделе законодательства
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>

            <!-- Actions -->
            <div class="flex gap-3 pt-4 border-t border-gray-200">
              <a
                href="/business/calculator"
                class="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors text-center"
              >
                Рассчитать сбор
              </a>
              <a
                href="/business/recyclers"
                class="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors text-center"
              >
                Найти переработчика
              </a>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </DashboardLayout>
</template>
