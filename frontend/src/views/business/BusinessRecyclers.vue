<script setup lang="ts">
import { ref, computed } from 'vue'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import { icons } from '../../utils/menuIcons'

const menuItems = [
  { id: 'dashboard', label: 'Главная', icon: icons.dashboard, route: '/business' },
  { id: 'calculator', label: 'Расчёт утильсбора', icon: icons.calculator, route: '/business/calculator' },
  { id: 'reports', label: 'Отчёты о переработке', icon: icons.report, route: '/business/reports' },
  { id: 'declarations', label: 'Декларации', icon: icons.document, route: '/business/declarations' },
  { id: 'payments', label: 'Платежи', icon: icons.payment, route: '/business/payments' },
  { id: 'documents', label: 'Документы', icon: icons.folder, route: '/business/documents' },
  { id: 'normatives', label: 'Нормативы и ставки', icon: icons.registries, route: '/business/normatives' },
  { id: 'profile', label: 'Профиль компании', icon: icons.building, route: '/business/profile' },
]

// View mode
const viewMode = ref<'grid' | 'list'>('grid')

// Filters
const searchQuery = ref('')
const selectedRegion = ref('all')
const selectedWasteType = ref('all')
const selectedCertification = ref('all')
const showOnlyPartners = ref(false)

const regions = [
  { id: 'all', name: 'Все регионы' },
  { id: 'bishkek', name: 'г. Бишкек' },
  { id: 'chui', name: 'Чуйская область' },
  { id: 'osh', name: 'г. Ош' },
  { id: 'osh-region', name: 'Ошская область' },
  { id: 'jalal-abad', name: 'Джалал-Абадская область' },
  { id: 'issyk-kul', name: 'Иссык-Кульская область' },
  { id: 'naryn', name: 'Нарынская область' },
  { id: 'talas', name: 'Таласская область' },
  { id: 'batken', name: 'Баткенская область' },
]

const wasteTypes = [
  { id: 'all', name: 'Все виды отходов' },
  { id: 'plastic', name: 'Пластик' },
  { id: 'paper', name: 'Бумага и картон' },
  { id: 'glass', name: 'Стекло' },
  { id: 'metal', name: 'Металл' },
  { id: 'electronics', name: 'Электроника' },
  { id: 'batteries', name: 'Батареи и аккумуляторы' },
  { id: 'tires', name: 'Шины' },
  { id: 'oils', name: 'Отработанные масла' },
  { id: 'organic', name: 'Органические отходы' },
]

const certifications = [
  { id: 'all', name: 'Любая сертификация' },
  { id: 'iso14001', name: 'ISO 14001' },
  { id: 'iso9001', name: 'ISO 9001' },
  { id: 'gost', name: 'ГОСТ Р' },
]

// Recyclers data
interface Recycler {
  id: number
  name: string
  logo: string
  description: string
  region: string
  regionName: string
  address: string
  phone: string
  email: string
  website: string
  wasteTypes: string[]
  wasteTypeNames: string[]
  certifications: string[]
  capacity: string
  rating: number
  reviewsCount: number
  isPartner: boolean
  isVerified: boolean
  foundedYear: number
  employeesCount: string
  processingMethods: string[]
}

const recyclers = ref<Recycler[]>([
  {
    id: 1,
    name: 'ЭкоПереработка КР',
    logo: '♻️',
    description: 'Крупнейший оператор по переработке пластиковых отходов в Кыргызстане. Современное оборудование европейского производства.',
    region: 'bishkek',
    regionName: 'г. Бишкек',
    address: 'ул. Жибек Жолу, 555',
    phone: '+996 312 90-00-01',
    email: 'info@ecorecycle.kg',
    website: 'www.ecorecycle.kg',
    wasteTypes: ['plastic', 'paper'],
    wasteTypeNames: ['Пластик', 'Бумага и картон'],
    certifications: ['ISO 14001', 'ISO 9001'],
    capacity: '5 000 тонн/год',
    rating: 4.8,
    reviewsCount: 124,
    isPartner: true,
    isVerified: true,
    foundedYear: 2015,
    employeesCount: '50-100',
    processingMethods: ['Механическая переработка', 'Грануляция'],
  },
  {
    id: 2,
    name: 'СтеклоРесурс',
    logo: '🔷',
    description: 'Специализируемся на сборе и переработке стеклянной тары. Производим вторичное сырьё для стекольной промышленности.',
    region: 'chui',
    regionName: 'Чуйская область',
    address: 'г. Токмок, ул. Промышленная, 12',
    phone: '+996 312 91-11-11',
    email: 'glass@stekloresurs.kg',
    website: 'www.stekloresurs.kg',
    wasteTypes: ['glass'],
    wasteTypeNames: ['Стекло'],
    certifications: ['ISO 14001'],
    capacity: '3 000 тонн/год',
    rating: 4.5,
    reviewsCount: 67,
    isPartner: true,
    isVerified: true,
    foundedYear: 2018,
    employeesCount: '20-50',
    processingMethods: ['Дробление', 'Сортировка по цвету'],
  },
  {
    id: 3,
    name: 'МеталлСервис',
    logo: '⚙️',
    description: 'Приём и переработка чёрных и цветных металлов. Работаем с предприятиями и населением.',
    region: 'bishkek',
    regionName: 'г. Бишкек',
    address: 'ул. Алма-Атинская, 123',
    phone: '+996 312 92-22-22',
    email: 'metal@metalservice.kg',
    website: 'www.metalservice.kg',
    wasteTypes: ['metal'],
    wasteTypeNames: ['Металл'],
    certifications: ['ГОСТ Р', 'ISO 9001'],
    capacity: '10 000 тонн/год',
    rating: 4.6,
    reviewsCount: 89,
    isPartner: false,
    isVerified: true,
    foundedYear: 2010,
    employeesCount: '100-200',
    processingMethods: ['Прессование', 'Переплавка'],
  },
  {
    id: 4,
    name: 'ЭлектроУтиль',
    logo: '💻',
    description: 'Утилизация электронного оборудования и бытовой техники. Извлечение ценных компонентов и безопасное обезвреживание.',
    region: 'bishkek',
    regionName: 'г. Бишкек',
    address: 'ул. Ахунбаева, 67А',
    phone: '+996 312 93-33-33',
    email: 'info@electroutil.kg',
    website: 'www.electroutil.kg',
    wasteTypes: ['electronics', 'batteries'],
    wasteTypeNames: ['Электроника', 'Батареи и аккумуляторы'],
    certifications: ['ISO 14001', 'ISO 9001'],
    capacity: '1 500 тонн/год',
    rating: 4.9,
    reviewsCount: 156,
    isPartner: true,
    isVerified: true,
    foundedYear: 2017,
    employeesCount: '20-50',
    processingMethods: ['Разборка', 'Извлечение компонентов', 'Безопасная утилизация'],
  },
  {
    id: 5,
    name: 'ШинПром',
    logo: '⚫',
    description: 'Переработка изношенных автомобильных шин. Производство резиновой крошки и покрытий.',
    region: 'osh',
    regionName: 'г. Ош',
    address: 'ул. Навои, 45',
    phone: '+996 3222 5-55-55',
    email: 'tires@shinprom.kg',
    website: 'www.shinprom.kg',
    wasteTypes: ['tires'],
    wasteTypeNames: ['Шины'],
    certifications: ['ISO 14001'],
    capacity: '2 000 тонн/год',
    rating: 4.3,
    reviewsCount: 42,
    isPartner: false,
    isVerified: true,
    foundedYear: 2019,
    employeesCount: '20-50',
    processingMethods: ['Измельчение', 'Пиролиз'],
  },
  {
    id: 6,
    name: 'БиоЭнерго',
    logo: '🌱',
    description: 'Переработка органических отходов в биогаз и органические удобрения. Экологичные технологии.',
    region: 'chui',
    regionName: 'Чуйская область',
    address: 'с. Новопавловка, ул. Центральная, 1',
    phone: '+996 312 94-44-44',
    email: 'bio@bioenergo.kg',
    website: 'www.bioenergo.kg',
    wasteTypes: ['organic'],
    wasteTypeNames: ['Органические отходы'],
    certifications: ['ISO 14001', 'ISO 9001'],
    capacity: '8 000 тонн/год',
    rating: 4.7,
    reviewsCount: 78,
    isPartner: true,
    isVerified: true,
    foundedYear: 2016,
    employeesCount: '50-100',
    processingMethods: ['Анаэробное сбраживание', 'Компостирование'],
  },
  {
    id: 7,
    name: 'МаслоТех',
    logo: '🛢️',
    description: 'Сбор и регенерация отработанных моторных и индустриальных масел. Производство базовых масел.',
    region: 'jalal-abad',
    regionName: 'Джалал-Абадская область',
    address: 'г. Джалал-Абад, ул. Ленина, 89',
    phone: '+996 3722 2-22-22',
    email: 'oil@maslotech.kg',
    website: 'www.maslotech.kg',
    wasteTypes: ['oils'],
    wasteTypeNames: ['Отработанные масла'],
    certifications: ['ГОСТ Р'],
    capacity: '1 000 тонн/год',
    rating: 4.4,
    reviewsCount: 35,
    isPartner: false,
    isVerified: true,
    foundedYear: 2020,
    employeesCount: '10-20',
    processingMethods: ['Регенерация', 'Очистка'],
  },
  {
    id: 8,
    name: 'КартонПак',
    logo: '📦',
    description: 'Переработка макулатуры и картона. Производство упаковочных материалов из вторсырья.',
    region: 'bishkek',
    regionName: 'г. Бишкек',
    address: 'ул. Фрунзе, 234',
    phone: '+996 312 95-55-55',
    email: 'paper@kartonpak.kg',
    website: 'www.kartonpak.kg',
    wasteTypes: ['paper'],
    wasteTypeNames: ['Бумага и картон'],
    certifications: ['ISO 9001'],
    capacity: '6 000 тонн/год',
    rating: 4.5,
    reviewsCount: 91,
    isPartner: true,
    isVerified: true,
    foundedYear: 2014,
    employeesCount: '50-100',
    processingMethods: ['Роспуск', 'Очистка', 'Формование'],
  },
  {
    id: 9,
    name: 'АккумТрейд',
    logo: '🔋',
    description: 'Утилизация аккумуляторов всех типов. Безопасное извлечение и переработка свинца и лития.',
    region: 'bishkek',
    regionName: 'г. Бишкек',
    address: 'ул. Московская, 178',
    phone: '+996 312 96-66-66',
    email: 'battery@akkumtrade.kg',
    website: 'www.akkumtrade.kg',
    wasteTypes: ['batteries'],
    wasteTypeNames: ['Батареи и аккумуляторы'],
    certifications: ['ISO 14001', 'ISO 9001', 'ГОСТ Р'],
    capacity: '500 тонн/год',
    rating: 4.8,
    reviewsCount: 63,
    isPartner: true,
    isVerified: true,
    foundedYear: 2018,
    employeesCount: '20-50',
    processingMethods: ['Дробление', 'Гидрометаллургия', 'Пирометаллургия'],
  },
  {
    id: 10,
    name: 'ПластГрупп',
    logo: '🧴',
    description: 'Переработка всех видов пластика. Производство вторичных гранул для промышленности.',
    region: 'issyk-kul',
    regionName: 'Иссык-Кульская область',
    address: 'г. Каракол, ул. Гагарина, 56',
    phone: '+996 3922 5-00-00',
    email: 'plastic@plastgroup.kg',
    website: 'www.plastgroup.kg',
    wasteTypes: ['plastic'],
    wasteTypeNames: ['Пластик'],
    certifications: ['ISO 14001'],
    capacity: '2 500 тонн/год',
    rating: 4.2,
    reviewsCount: 28,
    isPartner: false,
    isVerified: true,
    foundedYear: 2021,
    employeesCount: '10-20',
    processingMethods: ['Сортировка', 'Мойка', 'Грануляция'],
  },
])

// Filtered recyclers
const filteredRecyclers = computed(() => {
  return recyclers.value.filter(r => {
    const matchesSearch = !searchQuery.value ||
      r.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesRegion = selectedRegion.value === 'all' || r.region === selectedRegion.value
    const matchesWasteType = selectedWasteType.value === 'all' || r.wasteTypes.includes(selectedWasteType.value)
    const matchesCertification = selectedCertification.value === 'all' ||
      r.certifications.some(c => c.toLowerCase().includes(selectedCertification.value.toLowerCase()))
    const matchesPartner = !showOnlyPartners.value || r.isPartner

    return matchesSearch && matchesRegion && matchesWasteType && matchesCertification && matchesPartner
  })
})

// Statistics
const stats = computed(() => ({
  total: recyclers.value.length,
  partners: recyclers.value.filter(r => r.isPartner).length,
  totalCapacity: recyclers.value.reduce((sum, r) => {
    const num = parseInt(r.capacity.replace(/\D/g, ''))
    return sum + (isNaN(num) ? 0 : num)
  }, 0),
  regions: new Set(recyclers.value.map(r => r.region)).size,
}))

// Modal state
const showDetailsModal = ref(false)
const selectedRecycler = ref<Recycler | null>(null)
const showRequestModal = ref(false)

const openDetails = (recycler: Recycler) => {
  selectedRecycler.value = recycler
  showDetailsModal.value = true
}

const closeDetails = () => {
  showDetailsModal.value = false
  selectedRecycler.value = null
}

const openRequestModal = (recycler: Recycler) => {
  selectedRecycler.value = recycler
  showRequestModal.value = true
}

const closeRequestModal = () => {
  showRequestModal.value = false
}

// Request form
const requestForm = ref({
  wasteType: '',
  volume: '',
  frequency: 'once',
  message: '',
})

const submitRequest = () => {
  // Simulate API call
  alert(`Заявка отправлена в компанию "${selectedRecycler.value?.name}"`)
  closeRequestModal()
  requestForm.value = { wasteType: '', volume: '', frequency: 'once', message: '' }
}

// Stars display
const getStars = (rating: number) => {
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5
  return { full: fullStars, half: hasHalfStar, empty: 5 - fullStars - (hasHalfStar ? 1 : 0) }
}
</script>

<template>
  <DashboardLayout
    role="business"
    roleTitle="Плательщик"
    userName="ОсОО «ТехПром»"
    :menuItems="menuItems"
  >
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Переработчики отходов</h1>
        <p class="text-gray-600 mt-1">Найдите лицензированных партнёров для переработки ваших отходов</p>
      </div>

      <!-- CTA Banner -->
      <div class="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white">
        <div class="flex items-start justify-between">
          <div class="flex items-start gap-4">
            <div class="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <div>
              <h2 class="text-xl font-bold">Каталог лицензированных переработчиков</h2>
              <p class="text-emerald-100 mt-1 max-w-2xl">
                Выберите надёжного партнёра для выполнения нормативов утилизации.
                Все компании в каталоге имеют действующие лицензии и проверены системой.
              </p>
            </div>
          </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div class="bg-white/10 rounded-xl p-4">
            <p class="text-3xl font-bold">{{ stats.total }}</p>
            <p class="text-emerald-100 text-sm">Переработчиков</p>
          </div>
          <div class="bg-white/10 rounded-xl p-4">
            <p class="text-3xl font-bold">{{ stats.partners }}</p>
            <p class="text-emerald-100 text-sm">Ваших партнёров</p>
          </div>
          <div class="bg-white/10 rounded-xl p-4">
            <p class="text-3xl font-bold">{{ (stats.totalCapacity / 1000).toFixed(0) }}K</p>
            <p class="text-emerald-100 text-sm">тонн/год мощности</p>
          </div>
          <div class="bg-white/10 rounded-xl p-4">
            <p class="text-3xl font-bold">{{ stats.regions }}</p>
            <p class="text-emerald-100 text-sm">Регионов</p>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div class="flex flex-col lg:flex-row gap-4">
          <!-- Search -->
          <div class="flex-1">
            <div class="relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Поиск по названию или описанию..."
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          <!-- Region filter -->
          <select
            v-model="selectedRegion"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option v-for="region in regions" :key="region.id" :value="region.id">{{ region.name }}</option>
          </select>

          <!-- Waste type filter -->
          <select
            v-model="selectedWasteType"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option v-for="type in wasteTypes" :key="type.id" :value="type.id">{{ type.name }}</option>
          </select>

          <!-- Certification filter -->
          <select
            v-model="selectedCertification"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option v-for="cert in certifications" :key="cert.id" :value="cert.id">{{ cert.name }}</option>
          </select>
        </div>

        <!-- Additional filters row -->
        <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              v-model="showOnlyPartners"
              class="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
            />
            <span class="text-sm text-gray-700">Только мои партнёры</span>
          </label>

          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-500">Вид:</span>
            <button
              @click="viewMode = 'grid'"
              :class="[
                'p-2 rounded-lg transition-colors',
                viewMode === 'grid' ? 'bg-emerald-100 text-emerald-700' : 'text-gray-400 hover:text-gray-600'
              ]"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              @click="viewMode = 'list'"
              :class="[
                'p-2 rounded-lg transition-colors',
                viewMode === 'list' ? 'bg-emerald-100 text-emerald-700' : 'text-gray-400 hover:text-gray-600'
              ]"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Results count -->
      <div class="flex items-center justify-between">
        <p class="text-gray-600">
          Найдено: <span class="font-semibold text-gray-900">{{ filteredRecyclers.length }}</span> переработчиков
        </p>
      </div>

      <!-- Grid View -->
      <div v-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="recycler in filteredRecyclers"
          :key="recycler.id"
          class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
        >
          <!-- Header -->
          <div class="p-4 border-b border-gray-100">
            <div class="flex items-start gap-3">
              <div class="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                {{ recycler.logo }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <h3 class="font-semibold text-gray-900 truncate">{{ recycler.name }}</h3>
                  <svg v-if="recycler.isVerified" class="w-5 h-5 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                </div>
                <p class="text-sm text-gray-500">{{ recycler.regionName }}</p>
              </div>
              <span
                v-if="recycler.isPartner"
                class="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full flex-shrink-0"
              >
                Партнёр
              </span>
            </div>
          </div>

          <!-- Content -->
          <div class="p-4">
            <p class="text-sm text-gray-600 line-clamp-2 mb-3">{{ recycler.description }}</p>

            <!-- Waste types -->
            <div class="flex flex-wrap gap-1 mb-3">
              <span
                v-for="type in recycler.wasteTypeNames"
                :key="type"
                class="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full"
              >
                {{ type }}
              </span>
            </div>

            <!-- Rating -->
            <div class="flex items-center gap-2 mb-3">
              <div class="flex items-center">
                <template v-for="i in getStars(recycler.rating).full" :key="'full-' + i">
                  <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </template>
                <template v-if="getStars(recycler.rating).half">
                  <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <defs>
                      <linearGradient id="half">
                        <stop offset="50%" stop-color="currentColor" />
                        <stop offset="50%" stop-color="#D1D5DB" />
                      </linearGradient>
                    </defs>
                    <path fill="url(#half)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </template>
                <template v-for="i in getStars(recycler.rating).empty" :key="'empty-' + i">
                  <svg class="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </template>
              </div>
              <span class="text-sm font-medium text-gray-700">{{ recycler.rating }}</span>
              <span class="text-sm text-gray-500">({{ recycler.reviewsCount }})</span>
            </div>

            <!-- Capacity -->
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Мощность: {{ recycler.capacity }}</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="px-4 py-3 bg-gray-50 border-t border-gray-100 flex gap-2">
            <button
              @click="openDetails(recycler)"
              class="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Подробнее
            </button>
            <button
              @click="openRequestModal(recycler)"
              class="flex-1 px-3 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Отправить заявку
            </button>
          </div>
        </div>
      </div>

      <!-- List View -->
      <div v-if="viewMode === 'list'" class="space-y-3">
        <div
          v-for="recycler in filteredRecyclers"
          :key="recycler.id"
          class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
        >
          <div class="flex items-start gap-4">
            <div class="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
              {{ recycler.logo }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <div class="flex items-center gap-2">
                    <h3 class="font-semibold text-gray-900">{{ recycler.name }}</h3>
                    <svg v-if="recycler.isVerified" class="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                    <span v-if="recycler.isPartner" class="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">Партнёр</span>
                  </div>
                  <p class="text-sm text-gray-500 mt-0.5">{{ recycler.regionName }} · {{ recycler.address }}</p>
                  <p class="text-sm text-gray-600 mt-2">{{ recycler.description }}</p>
                  <div class="flex flex-wrap items-center gap-4 mt-3">
                    <div class="flex flex-wrap gap-1">
                      <span
                        v-for="type in recycler.wasteTypeNames"
                        :key="type"
                        class="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full"
                      >
                        {{ type }}
                      </span>
                    </div>
                    <div class="flex items-center gap-1">
                      <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span class="text-sm font-medium">{{ recycler.rating }}</span>
                      <span class="text-sm text-gray-500">({{ recycler.reviewsCount }})</span>
                    </div>
                    <span class="text-sm text-gray-500">Мощность: {{ recycler.capacity }}</span>
                  </div>
                </div>
                <div class="flex gap-2 flex-shrink-0">
                  <button
                    @click="openDetails(recycler)"
                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Подробнее
                  </button>
                  <button
                    @click="openRequestModal(recycler)"
                    class="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    Заявка
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="filteredRecyclers.length === 0" class="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-1">Переработчики не найдены</h3>
        <p class="text-gray-500">Попробуйте изменить параметры поиска</p>
      </div>
    </div>

    <!-- Details Modal -->
    <Teleport to="body">
      <div v-if="showDetailsModal && selectedRecycler" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
            <h3 class="text-lg font-semibold text-gray-900">Информация о компании</h3>
            <button @click="closeDetails" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="p-6 space-y-6">
            <!-- Header -->
            <div class="flex items-start gap-4">
              <div class="w-16 h-16 bg-emerald-100 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
                {{ selectedRecycler.logo }}
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <h4 class="text-xl font-bold text-gray-900">{{ selectedRecycler.name }}</h4>
                  <svg v-if="selectedRecycler.isVerified" class="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  <span v-if="selectedRecycler.isPartner" class="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">Ваш партнёр</span>
                </div>
                <p class="text-gray-500 mt-1">{{ selectedRecycler.description }}</p>
                <div class="flex items-center gap-3 mt-2">
                  <div class="flex items-center gap-1">
                    <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span class="font-medium">{{ selectedRecycler.rating }}</span>
                    <span class="text-gray-500">({{ selectedRecycler.reviewsCount }} отзывов)</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Info grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="bg-gray-50 rounded-xl p-4">
                <h5 class="text-sm font-medium text-gray-500 mb-3">Контакты</h5>
                <div class="space-y-2">
                  <div class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span class="text-sm text-gray-700">{{ selectedRecycler.address }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span class="text-sm text-gray-700">{{ selectedRecycler.phone }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span class="text-sm text-gray-700">{{ selectedRecycler.email }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    <span class="text-sm text-gray-700">{{ selectedRecycler.website }}</span>
                  </div>
                </div>
              </div>

              <div class="bg-gray-50 rounded-xl p-4">
                <h5 class="text-sm font-medium text-gray-500 mb-3">О компании</h5>
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-500">Год основания:</span>
                    <span class="text-sm font-medium text-gray-700">{{ selectedRecycler.foundedYear }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-500">Сотрудников:</span>
                    <span class="text-sm font-medium text-gray-700">{{ selectedRecycler.employeesCount }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-500">Мощность:</span>
                    <span class="text-sm font-medium text-gray-700">{{ selectedRecycler.capacity }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-500">Регион:</span>
                    <span class="text-sm font-medium text-gray-700">{{ selectedRecycler.regionName }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Waste types -->
            <div>
              <h5 class="text-sm font-medium text-gray-500 mb-3">Виды принимаемых отходов</h5>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="type in selectedRecycler.wasteTypeNames"
                  :key="type"
                  class="px-3 py-1.5 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-lg"
                >
                  {{ type }}
                </span>
              </div>
            </div>

            <!-- Processing methods -->
            <div>
              <h5 class="text-sm font-medium text-gray-500 mb-3">Методы переработки</h5>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="method in selectedRecycler.processingMethods"
                  :key="method"
                  class="px-3 py-1.5 bg-blue-100 text-blue-700 text-sm font-medium rounded-lg"
                >
                  {{ method }}
                </span>
              </div>
            </div>

            <!-- Certifications -->
            <div>
              <h5 class="text-sm font-medium text-gray-500 mb-3">Сертификаты</h5>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="cert in selectedRecycler.certifications"
                  :key="cert"
                  class="px-3 py-1.5 bg-amber-100 text-amber-700 text-sm font-medium rounded-lg flex items-center gap-1"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  {{ cert }}
                </span>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex gap-3 pt-4 border-t border-gray-200">
              <button
                @click="closeDetails(); openRequestModal(selectedRecycler)"
                class="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
              >
                Отправить заявку
              </button>
              <button
                @click="closeDetails"
                class="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Request Modal -->
    <Teleport to="body">
      <div v-if="showRequestModal && selectedRecycler" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl shadow-xl max-w-lg w-full">
          <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Заявка на сотрудничество</h3>
              <p class="text-sm text-gray-500">{{ selectedRecycler.name }}</p>
            </div>
            <button @click="closeRequestModal" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Вид отходов *</label>
              <select
                v-model="requestForm.wasteType"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">Выберите вид отходов</option>
                <option v-for="type in selectedRecycler.wasteTypeNames" :key="type" :value="type">{{ type }}</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Примерный объём *</label>
              <input
                v-model="requestForm.volume"
                type="text"
                placeholder="Например: 500 кг/месяц"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Периодичность</label>
              <div class="flex gap-3">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" v-model="requestForm.frequency" value="once" class="text-emerald-600" />
                  <span class="text-sm text-gray-700">Разовый вывоз</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" v-model="requestForm.frequency" value="regular" class="text-emerald-600" />
                  <span class="text-sm text-gray-700">Регулярно</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" v-model="requestForm.frequency" value="contract" class="text-emerald-600" />
                  <span class="text-sm text-gray-700">Договор</span>
                </label>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Комментарий</label>
              <textarea
                v-model="requestForm.message"
                rows="3"
                placeholder="Дополнительная информация..."
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              ></textarea>
            </div>

            <div class="bg-gray-50 rounded-lg p-4">
              <div class="flex items-start gap-3">
                <svg class="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="text-sm text-gray-600">
                  Ваши контактные данные будут отправлены из профиля компании.
                  Переработчик свяжется с вами для уточнения деталей.
                </p>
              </div>
            </div>
          </div>
          <div class="px-6 py-4 border-t border-gray-200 flex gap-3">
            <button
              @click="closeRequestModal"
              class="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Отмена
            </button>
            <button
              @click="submitRequest"
              :disabled="!requestForm.wasteType || !requestForm.volume"
              class="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Отправить заявку
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </DashboardLayout>
</template>
