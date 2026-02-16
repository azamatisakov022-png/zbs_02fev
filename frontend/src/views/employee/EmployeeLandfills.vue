<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
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

// --- Types ---
interface Landfill {
  id: number
  region: string
  district: string
  settlement: string
  lat: number
  lng: number
  distanceFromCenter: number
  distanceFromSettlement: number
  population: number
  servicedPopulation: number
  legalStatus: 'municipal' | 'private' | 'unauthorized'
  landDocument: boolean
  landDocumentNumber: string
  ecoDocument: boolean
  ecoDocumentNumber: string
  landCategory: string
  area: number
  fillLevel: number
  startYear: number
  tariffPhysical: number
  tariffLegal: number
  approvalDocNumber: string
  approvalDocDate: string
  wasteSchedule: string
  dailyVolume: number
  trucks: number
  excavators: number
  tractors: number
  bulldozers: number
  fencing: 'full' | 'partial' | 'none'
  plastic: number
  paper: number
  glass: number
  food: number
  other: number
}

// --- Dictionaries ---
const regions = [
  'Чуйская область', 'Ошская область', 'Джалал-Абадская область',
  'Иссык-Кульская область', 'Нарынская область', 'Таласская область',
  'Баткенская область', 'г. Бишкек', 'г. Ош'
]
const scheduleOptions = ['Ежедневный', '2 раза в неделю', '3 раза в неделю', '4 раза в неделю', '5 раз в неделю']
const fencingLabels: Record<string, string> = { full: 'Полное', partial: 'Неполное', none: 'Нет' }
const statusLabels: Record<string, string> = { municipal: 'Муниципальный', private: 'Частный', unauthorized: 'Несанкционированный' }
const statusClasses: Record<string, string> = {
  municipal: 'lf-badge--blue',
  private: 'lf-badge--gray',
  unauthorized: 'lf-badge--red'
}

// --- Mock Data ---
const landfills = reactive<Landfill[]>([
  {
    id: 1, region: 'Чуйская область', district: 'Московский район', settlement: 'с. Беловодское',
    lat: 42.8261, lng: 74.0978, distanceFromCenter: 45, distanceFromSettlement: 3,
    population: 30, servicedPopulation: 28,
    legalStatus: 'municipal', landDocument: true, landDocumentNumber: 'ЗУ-2018/0456',
    ecoDocument: true, ecoDocumentNumber: 'ЭКО-2019/112', landCategory: 'Земли промышленности',
    area: 3, fillLevel: 40, startYear: 1992,
    tariffPhysical: 50, tariffLegal: 250, approvalDocNumber: 'ТР-2023/034', approvalDocDate: '15.03.2023',
    wasteSchedule: '3 раза в неделю', dailyVolume: 12,
    trucks: 2, excavators: 1, tractors: 1, bulldozers: 0, fencing: 'partial',
    plastic: 22, paper: 15, glass: 8, food: 40, other: 15
  },
  {
    id: 2, region: 'г. Бишкек', district: 'Свердловский район', settlement: 'г. Бишкек',
    lat: 42.8746, lng: 74.5698, distanceFromCenter: 0, distanceFromSettlement: 8,
    population: 1200, servicedPopulation: 1100,
    legalStatus: 'municipal', landDocument: true, landDocumentNumber: 'ЗУ-2005/1289',
    ecoDocument: true, ecoDocumentNumber: 'ЭКО-2010/045', landCategory: 'Земли промышленности, энергетики, транспорта',
    area: 45, fillLevel: 75, startYear: 1978,
    tariffPhysical: 80, tariffLegal: 450, approvalDocNumber: 'ТР-2024/001', approvalDocDate: '01.01.2024',
    wasteSchedule: 'Ежедневный', dailyVolume: 850,
    trucks: 18, excavators: 4, tractors: 3, bulldozers: 2, fencing: 'full',
    plastic: 25, paper: 18, glass: 10, food: 35, other: 12
  },
  {
    id: 3, region: 'Ошская область', district: 'г. Ош', settlement: 'г. Ош',
    lat: 40.5283, lng: 72.7985, distanceFromCenter: 0, distanceFromSettlement: 5,
    population: 350, servicedPopulation: 320,
    legalStatus: 'municipal', landDocument: true, landDocumentNumber: 'ЗУ-2012/0678',
    ecoDocument: true, ecoDocumentNumber: 'ЭКО-2015/089', landCategory: 'Земли промышленности',
    area: 15, fillLevel: 60, startYear: 1985,
    tariffPhysical: 60, tariffLegal: 300, approvalDocNumber: 'ТР-2023/078', approvalDocDate: '10.06.2023',
    wasteSchedule: 'Ежедневный', dailyVolume: 280,
    trucks: 8, excavators: 2, tractors: 2, bulldozers: 1, fencing: 'full',
    plastic: 20, paper: 12, glass: 9, food: 42, other: 17
  },
  {
    id: 4, region: 'Иссык-Кульская область', district: 'г. Балыкчы', settlement: 'г. Балыкчы',
    lat: 42.4600, lng: 76.1870, distanceFromCenter: 140, distanceFromSettlement: 2,
    population: 45, servicedPopulation: 42,
    legalStatus: 'municipal', landDocument: true, landDocumentNumber: 'ЗУ-2005/0234',
    ecoDocument: false, ecoDocumentNumber: '', landCategory: 'Земли запаса',
    area: 5, fillLevel: 30, startYear: 2005,
    tariffPhysical: 40, tariffLegal: 200, approvalDocNumber: 'ТР-2022/156', approvalDocDate: '20.09.2022',
    wasteSchedule: '2 раза в неделю', dailyVolume: 25,
    trucks: 2, excavators: 0, tractors: 1, bulldozers: 0, fencing: 'partial',
    plastic: 18, paper: 10, glass: 7, food: 48, other: 17
  },
  {
    id: 5, region: 'Джалал-Абадская область', district: 'г. Джалал-Абад', settlement: 'г. Джалал-Абад',
    lat: 40.9333, lng: 73.0017, distanceFromCenter: 0, distanceFromSettlement: 4,
    population: 120, servicedPopulation: 105,
    legalStatus: 'municipal', landDocument: true, landDocumentNumber: 'ЗУ-2010/0512',
    ecoDocument: true, ecoDocumentNumber: 'ЭКО-2016/034', landCategory: 'Земли промышленности',
    area: 10, fillLevel: 55, startYear: 1990,
    tariffPhysical: 55, tariffLegal: 280, approvalDocNumber: 'ТР-2023/045', approvalDocDate: '05.04.2023',
    wasteSchedule: '5 раз в неделю', dailyVolume: 95,
    trucks: 4, excavators: 1, tractors: 1, bulldozers: 1, fencing: 'full',
    plastic: 21, paper: 14, glass: 8, food: 39, other: 18
  },
  {
    id: 6, region: 'Таласская область', district: 'Таласский район', settlement: 'г. Талас',
    lat: 42.5186, lng: 72.2427, distanceFromCenter: 0, distanceFromSettlement: 3,
    population: 35, servicedPopulation: 33,
    legalStatus: 'private', landDocument: true, landDocumentNumber: 'ЗУ-2015/0890',
    ecoDocument: true, ecoDocumentNumber: 'ЭКО-2016/078', landCategory: 'Земли сельскохозяйственного назначения (трансформирован)',
    area: 2, fillLevel: 20, startYear: 2015,
    tariffPhysical: 45, tariffLegal: 220, approvalDocNumber: 'ТР-2023/112', approvalDocDate: '18.07.2023',
    wasteSchedule: '2 раза в неделю', dailyVolume: 15,
    trucks: 1, excavators: 0, tractors: 1, bulldozers: 0, fencing: 'partial',
    plastic: 19, paper: 11, glass: 6, food: 45, other: 19
  },
])

// --- State ---
const searchQuery = ref('')
const filterRegion = ref('')
const expandedIds = ref<Set<number>>(new Set())
const showForm = ref(false)
const formStep = ref(1)
const editingId = ref<number | null>(null)

// --- Counts ---
const counts = computed(() => {
  const all = landfills.length
  const municipal = landfills.filter(l => l.legalStatus === 'municipal').length
  const priv = landfills.filter(l => l.legalStatus === 'private').length
  const critical = landfills.filter(l => l.fillLevel > 80).length
  return { all, municipal, priv, critical }
})

// --- Filtered ---
const filtered = computed(() => {
  let result = landfills
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(l =>
      l.region.toLowerCase().includes(q) ||
      l.district.toLowerCase().includes(q) ||
      l.settlement.toLowerCase().includes(q)
    )
  }
  if (filterRegion.value) {
    result = result.filter(l => l.region === filterRegion.value)
  }
  return result
})

// --- Expand/Collapse ---
const toggleExpand = (id: number) => {
  if (expandedIds.value.has(id)) {
    expandedIds.value.delete(id)
  } else {
    expandedIds.value.add(id)
  }
}

// --- Fill Level Helpers ---
const fillColor = (level: number) => {
  if (level > 80) return '#ef4444'
  if (level > 50) return '#f59e0b'
  return '#10b981'
}

const yearsOfOperation = (startYear: number) => {
  const years = new Date().getFullYear() - startYear
  return `С ${startYear} г., ${years} лет`
}

// --- Form ---
const emptyForm = (): Omit<Landfill, 'id'> => ({
  region: '', district: '', settlement: '',
  lat: 0, lng: 0, distanceFromCenter: 0, distanceFromSettlement: 0,
  population: 0, servicedPopulation: 0,
  legalStatus: 'municipal', landDocument: false, landDocumentNumber: '',
  ecoDocument: false, ecoDocumentNumber: '', landCategory: '',
  area: 0, fillLevel: 0, startYear: 2020,
  tariffPhysical: 0, tariffLegal: 0, approvalDocNumber: '', approvalDocDate: '',
  wasteSchedule: 'Ежедневный', dailyVolume: 0,
  trucks: 0, excavators: 0, tractors: 0, bulldozers: 0, fencing: 'none',
  plastic: 0, paper: 0, glass: 0, food: 0, other: 0
})

const form = ref<Omit<Landfill, 'id'>>(emptyForm())

const openAddForm = () => {
  editingId.value = null
  form.value = emptyForm()
  formStep.value = 1
  showForm.value = true
}

const openEditForm = (lf: Landfill) => {
  editingId.value = lf.id
  const { id, ...rest } = lf
  form.value = { ...rest }
  formStep.value = 1
  showForm.value = true
}

const cancelForm = () => {
  showForm.value = false
  editingId.value = null
}

const saveForm = () => {
  if (editingId.value !== null) {
    const idx = landfills.findIndex(l => l.id === editingId.value)
    if (idx >= 0) Object.assign(landfills[idx], form.value)
  } else {
    const maxId = landfills.reduce((m, l) => Math.max(m, l.id), 0)
    landfills.push({ id: maxId + 1, ...form.value })
  }
  showForm.value = false
  editingId.value = null
}

const stepLabels = ['Местоположение', 'Юридические данные', 'Эксплуатация', 'Техника и состав']

const morphSum = computed(() => form.value.plastic + form.value.paper + form.value.glass + form.value.food + form.value.other)

const uniqueRegions = computed(() => [...new Set(landfills.map(l => l.region))].sort())
</script>

<template>
  <DashboardLayout
    role="employee"
    roleTitle="Сотрудник МПРЭТН КР"
    userName="Мамытова Айгуль"
    :menuItems="menuItems"
  >
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div>
        <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b] mb-2">Реестр полигонов и свалок КР</h1>
        <p class="text-[#64748b]">Учёт и мониторинг полигонов твёрдых бытовых отходов</p>
      </div>
      <button @click="openAddForm" class="flex items-center gap-2 bg-[#10b981] text-white px-5 py-2.5 rounded-xl font-medium hover:bg-[#059669] transition-colors shadow-sm flex-shrink-0">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
        Добавить полигон
      </button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
        <p class="text-sm text-[#64748b] mb-1">Всего полигонов</p>
        <p class="text-2xl font-bold text-[#1e293b]">{{ counts.all }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
        <p class="text-sm text-[#64748b] mb-1">Муниципальных</p>
        <p class="text-2xl font-bold text-[#2563eb]">{{ counts.municipal }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
        <p class="text-sm text-[#64748b] mb-1">Частных</p>
        <p class="text-2xl font-bold text-[#64748b]">{{ counts.priv }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
        <p class="text-sm text-[#64748b] mb-1">Заполненность &gt; 80%</p>
        <p class="text-2xl font-bold text-[#ef4444]">{{ counts.critical }}</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-2xl p-4 shadow-sm border border-[#e2e8f0] mb-6">
      <div class="flex flex-wrap gap-4">
        <input v-model="searchQuery" type="text" placeholder="Поиск по наименованию / области..." class="flex-1 min-w-[200px] px-4 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb] text-sm" />
        <select v-model="filterRegion" class="px-4 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb] text-sm">
          <option value="">Все области</option>
          <option v-for="r in uniqueRegions" :key="r" :value="r">{{ r }}</option>
        </select>
      </div>
    </div>

    <!-- Add/Edit Form -->
    <div v-if="showForm" class="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] p-6 mb-6">
      <h2 class="text-lg font-semibold text-[#1e293b] mb-4">{{ editingId ? 'Редактирование полигона' : 'Добавление полигона' }}</h2>

      <!-- Steps -->
      <div class="flex gap-1 mb-6 overflow-x-auto">
        <button v-for="(label, i) in stepLabels" :key="i" @click="formStep = i + 1"
          :class="['lf-step', formStep === i + 1 && 'lf-step--active']">
          <span class="lf-step__num">{{ i + 1 }}</span>
          <span class="lf-step__label">{{ label }}</span>
        </button>
      </div>

      <!-- Step 1: Location -->
      <div v-if="formStep === 1" class="lf-form-grid">
        <div>
          <label class="lf-label">Область *</label>
          <select v-model="form.region" class="lf-input">
            <option value="">Выберите область</option>
            <option v-for="r in regions" :key="r" :value="r">{{ r }}</option>
          </select>
        </div>
        <div>
          <label class="lf-label">Район</label>
          <input v-model="form.district" class="lf-input" placeholder="Московский район" />
        </div>
        <div>
          <label class="lf-label">Населённый пункт</label>
          <input v-model="form.settlement" class="lf-input" placeholder="с. Беловодское" />
        </div>
        <div>
          <label class="lf-label">Широта</label>
          <input v-model.number="form.lat" type="number" step="0.000001" class="lf-input" placeholder="42.876081" />
        </div>
        <div>
          <label class="lf-label">Долгота</label>
          <input v-model.number="form.lng" type="number" step="0.000001" class="lf-input" placeholder="74.290058" />
        </div>
        <div>
          <label class="lf-label">Расстояние от обл. центра (км)</label>
          <input v-model.number="form.distanceFromCenter" type="number" class="lf-input" />
        </div>
        <div>
          <label class="lf-label">Расстояние от ближ. нас. пункта (км)</label>
          <input v-model.number="form.distanceFromSettlement" type="number" class="lf-input" />
        </div>
      </div>

      <!-- Step 2: Legal -->
      <div v-if="formStep === 2" class="lf-form-grid">
        <div>
          <label class="lf-label">Юридический статус *</label>
          <select v-model="form.legalStatus" class="lf-input">
            <option value="municipal">Муниципальный</option>
            <option value="private">Частный</option>
            <option value="unauthorized">Несанкционированный</option>
          </select>
        </div>
        <div>
          <label class="lf-label">Правоустанавливающий документ</label>
          <div class="flex items-center gap-3 mt-1">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" v-model="form.landDocument" />
              <span class="text-sm">Есть</span>
            </label>
            <input v-if="form.landDocument" v-model="form.landDocumentNumber" class="lf-input flex-1" placeholder="№ документа" />
          </div>
        </div>
        <div>
          <label class="lf-label">Экологические документы</label>
          <div class="flex items-center gap-3 mt-1">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" v-model="form.ecoDocument" />
              <span class="text-sm">Есть</span>
            </label>
            <input v-if="form.ecoDocument" v-model="form.ecoDocumentNumber" class="lf-input flex-1" placeholder="№ документа" />
          </div>
        </div>
        <div>
          <label class="lf-label">Категория земли</label>
          <input v-model="form.landCategory" class="lf-input" placeholder="Земли промышленности" />
        </div>
        <div>
          <label class="lf-label">Количество населения (тыс.)</label>
          <input v-model.number="form.population" type="number" class="lf-input" />
        </div>
        <div>
          <label class="lf-label">Обслуживаемое население (тыс.)</label>
          <input v-model.number="form.servicedPopulation" type="number" class="lf-input" />
        </div>
      </div>

      <!-- Step 3: Operation -->
      <div v-if="formStep === 3" class="lf-form-grid">
        <div>
          <label class="lf-label">Площадь (га)</label>
          <input v-model.number="form.area" type="number" step="0.1" class="lf-input" />
        </div>
        <div>
          <label class="lf-label">Текущая заполненность (%)</label>
          <input v-model.number="form.fillLevel" type="number" min="0" max="100" class="lf-input" />
        </div>
        <div>
          <label class="lf-label">Год начала эксплуатации</label>
          <input v-model.number="form.startYear" type="number" class="lf-input" placeholder="1992" />
        </div>
        <div>
          <label class="lf-label">Тариф для физ. лиц (сом)</label>
          <input v-model.number="form.tariffPhysical" type="number" class="lf-input" />
        </div>
        <div>
          <label class="lf-label">Тариф для юр. лиц (сом)</label>
          <input v-model.number="form.tariffLegal" type="number" class="lf-input" />
        </div>
        <div>
          <label class="lf-label">№ утверждающего документа</label>
          <input v-model="form.approvalDocNumber" class="lf-input" placeholder="ТР-2023/034" />
        </div>
        <div>
          <label class="lf-label">Дата утверждающего документа</label>
          <input v-model="form.approvalDocDate" class="lf-input" placeholder="15.03.2023" />
        </div>
        <div>
          <label class="lf-label">График завоза ТБО</label>
          <select v-model="form.wasteSchedule" class="lf-input">
            <option v-for="s in scheduleOptions" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>
        <div>
          <label class="lf-label">Ежедневный объём (тонн)</label>
          <input v-model.number="form.dailyVolume" type="number" class="lf-input" />
        </div>
      </div>

      <!-- Step 4: Equipment & Composition -->
      <div v-if="formStep === 4">
        <div class="lf-form-grid mb-6">
          <div>
            <label class="lf-label">Мусоровозов (шт)</label>
            <input v-model.number="form.trucks" type="number" min="0" class="lf-input" />
          </div>
          <div>
            <label class="lf-label">Экскаваторов (шт)</label>
            <input v-model.number="form.excavators" type="number" min="0" class="lf-input" />
          </div>
          <div>
            <label class="lf-label">Тракторов (шт)</label>
            <input v-model.number="form.tractors" type="number" min="0" class="lf-input" />
          </div>
          <div>
            <label class="lf-label">Бульдозеров (шт)</label>
            <input v-model.number="form.bulldozers" type="number" min="0" class="lf-input" />
          </div>
          <div>
            <label class="lf-label">Наличие ограждения</label>
            <select v-model="form.fencing" class="lf-input">
              <option value="full">Полное</option>
              <option value="partial">Неполное</option>
              <option value="none">Нет</option>
            </select>
          </div>
        </div>
        <h3 class="text-sm font-semibold text-[#1e293b] mb-3">Морфологический состав (%)</h3>
        <div class="lf-form-grid mb-2">
          <div>
            <label class="lf-label">Пластик</label>
            <input v-model.number="form.plastic" type="number" min="0" max="100" class="lf-input" />
          </div>
          <div>
            <label class="lf-label">Бумага</label>
            <input v-model.number="form.paper" type="number" min="0" max="100" class="lf-input" />
          </div>
          <div>
            <label class="lf-label">Стекло</label>
            <input v-model.number="form.glass" type="number" min="0" max="100" class="lf-input" />
          </div>
          <div>
            <label class="lf-label">Пищевые</label>
            <input v-model.number="form.food" type="number" min="0" max="100" class="lf-input" />
          </div>
          <div>
            <label class="lf-label">Прочее</label>
            <input v-model.number="form.other" type="number" min="0" max="100" class="lf-input" />
          </div>
        </div>
        <p :class="['text-xs', morphSum === 100 ? 'text-green-600' : 'text-red-500']">
          Сумма: {{ morphSum }}%{{ morphSum !== 100 ? ' (должна быть 100%)' : '' }}
        </p>
      </div>

      <!-- Form Actions -->
      <div class="flex items-center gap-3 pt-5 mt-5 border-t border-[#e2e8f0]">
        <button v-if="formStep > 1" @click="formStep--" class="px-5 py-2.5 border border-[#e2e8f0] rounded-lg text-[#64748b] hover:bg-[#f8fafc] transition-colors text-sm">
          ← Назад
        </button>
        <button v-if="formStep < 4" @click="formStep++" class="px-5 py-2.5 bg-[#2563eb] text-white rounded-lg hover:bg-[#1d4ed8] transition-colors text-sm font-medium">
          Далее →
        </button>
        <button v-if="formStep === 4" @click="saveForm" class="flex items-center gap-2 bg-[#10b981] text-white px-5 py-2.5 rounded-lg font-medium hover:bg-[#059669] transition-colors text-sm">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
          Сохранить
        </button>
        <button @click="cancelForm" class="px-5 py-2.5 border border-[#e2e8f0] rounded-lg text-[#64748b] hover:bg-[#f8fafc] transition-colors text-sm ml-auto">
          Отмена
        </button>
      </div>
    </div>

    <!-- Landfill Cards -->
    <div class="space-y-4">
      <div v-for="lf in filtered" :key="lf.id" class="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] overflow-hidden">
        <!-- Card Header (always visible) -->
        <div class="px-6 py-4 flex items-center gap-4 cursor-pointer hover:bg-[#f8fafc] transition-colors" @click="toggleExpand(lf.id)">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-3 flex-wrap mb-1">
              <h3 class="font-semibold text-[#1e293b]">{{ lf.region }}, {{ lf.district }}, {{ lf.settlement }}</h3>
              <span :class="['lf-badge', statusClasses[lf.legalStatus]]">{{ statusLabels[lf.legalStatus] }}</span>
            </div>
            <div class="flex items-center gap-6 text-sm text-[#64748b] flex-wrap">
              <span>{{ lf.area }} га</span>
              <span>{{ lf.population }} тыс. чел.</span>
              <div class="flex items-center gap-2 min-w-[180px]">
                <div class="flex-1 h-2.5 bg-[#e2e8f0] rounded-full overflow-hidden">
                  <div class="h-full rounded-full transition-all" :style="{ width: lf.fillLevel + '%', backgroundColor: fillColor(lf.fillLevel) }"></div>
                </div>
                <span class="text-xs font-semibold" :style="{ color: fillColor(lf.fillLevel) }">{{ lf.fillLevel }}%</span>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button @click.stop="openEditForm(lf)" class="px-3 py-1.5 text-xs font-medium rounded-lg bg-[#3B82F6] text-white hover:bg-[#2563EB] transition-colors">
              Редактировать
            </button>
            <svg :class="['w-5 h-5 text-[#94a3b8] transition-transform', expandedIds.has(lf.id) && 'rotate-180']" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <!-- Expanded Details -->
        <div :class="['lf-expand', expandedIds.has(lf.id) && 'lf-expand--open']">
          <div class="px-6 pb-6 pt-2 border-t border-[#e2e8f0]">
            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

              <!-- General Info -->
              <div class="lf-section">
                <h4 class="lf-section__title">Общие сведения</h4>
                <div class="lf-section__rows">
                  <div class="lf-row"><span class="lf-row__label">Население</span><span class="lf-row__value">{{ lf.population }} тыс. чел.</span></div>
                  <div class="lf-row"><span class="lf-row__label">Обслуживаемое население</span><span class="lf-row__value">{{ lf.servicedPopulation }} тыс. чел.</span></div>
                  <div class="lf-row"><span class="lf-row__label">Координаты</span><span class="lf-row__value">{{ lf.lat.toFixed(4) }}, {{ lf.lng.toFixed(4) }}</span></div>
                  <div class="lf-row"><span class="lf-row__label">От обл. центра</span><span class="lf-row__value">{{ lf.distanceFromCenter }} км</span></div>
                  <div class="lf-row"><span class="lf-row__label">От ближ. нас. пункта</span><span class="lf-row__value">{{ lf.distanceFromSettlement }} км</span></div>
                </div>
              </div>

              <!-- Documentation -->
              <div class="lf-section">
                <h4 class="lf-section__title">Документация</h4>
                <div class="lf-section__rows">
                  <div class="lf-row">
                    <span class="lf-row__label">Правоуст. документ</span>
                    <span class="lf-row__value">
                      <span v-if="lf.landDocument" class="text-green-600">Есть — {{ lf.landDocumentNumber }}</span>
                      <span v-else class="text-red-500">Нет</span>
                    </span>
                  </div>
                  <div class="lf-row">
                    <span class="lf-row__label">Экологические документы</span>
                    <span class="lf-row__value">
                      <span v-if="lf.ecoDocument" class="text-green-600">Есть — {{ lf.ecoDocumentNumber }}</span>
                      <span v-else class="text-red-500">Нет</span>
                    </span>
                  </div>
                  <div class="lf-row"><span class="lf-row__label">Категория земли</span><span class="lf-row__value">{{ lf.landCategory }}</span></div>
                </div>
              </div>

              <!-- Operation -->
              <div class="lf-section">
                <h4 class="lf-section__title">Эксплуатация</h4>
                <div class="lf-section__rows">
                  <div class="lf-row"><span class="lf-row__label">Тариф (физ. лица)</span><span class="lf-row__value">{{ lf.tariffPhysical }} сом</span></div>
                  <div class="lf-row"><span class="lf-row__label">Тариф (юр. лица)</span><span class="lf-row__value">{{ lf.tariffLegal }} сом</span></div>
                  <div class="lf-row"><span class="lf-row__label">Утв. документ</span><span class="lf-row__value">{{ lf.approvalDocNumber }} от {{ lf.approvalDocDate }}</span></div>
                  <div class="lf-row"><span class="lf-row__label">Срок эксплуатации</span><span class="lf-row__value">{{ yearsOfOperation(lf.startYear) }}</span></div>
                  <div class="lf-row"><span class="lf-row__label">График завоза ТБО</span><span class="lf-row__value">{{ lf.wasteSchedule }}</span></div>
                  <div class="lf-row"><span class="lf-row__label">Ежедневный объём</span><span class="lf-row__value">{{ lf.dailyVolume }} т</span></div>
                </div>
              </div>

              <!-- Equipment -->
              <div class="lf-section">
                <h4 class="lf-section__title">Техническое оснащение</h4>
                <div class="lf-section__rows">
                  <div class="lf-row"><span class="lf-row__label">Мусоровозов</span><span class="lf-row__value">{{ lf.trucks }} шт.</span></div>
                  <div class="lf-row"><span class="lf-row__label">Экскаваторов</span><span class="lf-row__value">{{ lf.excavators }} шт.</span></div>
                  <div class="lf-row"><span class="lf-row__label">Тракторов</span><span class="lf-row__value">{{ lf.tractors }} шт.</span></div>
                  <div class="lf-row"><span class="lf-row__label">Бульдозеров</span><span class="lf-row__value">{{ lf.bulldozers }} шт.</span></div>
                  <div class="lf-row"><span class="lf-row__label">Ограждение</span><span class="lf-row__value">{{ fencingLabels[lf.fencing] }}</span></div>
                </div>
              </div>

              <!-- Morphological Composition -->
              <div class="lf-section">
                <h4 class="lf-section__title">Морфологический состав</h4>
                <div class="space-y-2">
                  <div class="lf-morph" v-for="item in [
                    { label: 'Пластик', value: lf.plastic, color: '#2563eb' },
                    { label: 'Бумага', value: lf.paper, color: '#f59e0b' },
                    { label: 'Стекло', value: lf.glass, color: '#10b981' },
                    { label: 'Пищевые', value: lf.food, color: '#8b5cf6' },
                    { label: 'Прочее', value: lf.other, color: '#94a3b8' },
                  ]" :key="item.label">
                    <div class="flex items-center justify-between text-xs mb-0.5">
                      <span class="text-[#64748b]">{{ item.label }}</span>
                      <span class="font-medium text-[#1e293b]">{{ item.value }}%</span>
                    </div>
                    <div class="h-2 bg-[#e2e8f0] rounded-full overflow-hidden">
                      <div class="h-full rounded-full" :style="{ width: item.value + '%', backgroundColor: item.color }"></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Site -->
              <div class="lf-section">
                <h4 class="lf-section__title">Участок</h4>
                <div class="lf-section__rows">
                  <div class="lf-row"><span class="lf-row__label">Площадь участка</span><span class="lf-row__value">{{ lf.area }} га</span></div>
                  <div class="lf-row">
                    <span class="lf-row__label">Заполненность</span>
                    <span class="lf-row__value font-semibold" :style="{ color: fillColor(lf.fillLevel) }">{{ lf.fillLevel }}%</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div v-if="filtered.length === 0" class="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] p-12 text-center">
      <p class="text-[#64748b]">Полигоны не найдены. Попробуйте изменить параметры поиска.</p>
    </div>
  </DashboardLayout>
</template>

<style scoped>
.lf-badge { display: inline-block; padding: 2px 10px; border-radius: 9999px; font-size: 12px; font-weight: 500; }
.lf-badge--blue { background: #dbeafe; color: #1d4ed8; }
.lf-badge--gray { background: #f1f5f9; color: #475569; }
.lf-badge--red { background: #fee2e2; color: #dc2626; }

.lf-expand { max-height: 0; overflow: hidden; transition: max-height 0.35s ease; }
.lf-expand--open { max-height: 2000px; }

.lf-section { background: #f8fafc; border-radius: 12px; padding: 16px; }
.lf-section__title { font-size: 13px; font-weight: 600; color: #1e293b; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.03em; }
.lf-section__rows { display: flex; flex-direction: column; gap: 8px; }
.lf-row { display: flex; justify-content: space-between; gap: 8px; }
.lf-row__label { font-size: 13px; color: #64748b; flex-shrink: 0; }
.lf-row__value { font-size: 13px; color: #1e293b; text-align: right; word-break: break-word; }

.lf-morph { }

/* Form */
.lf-form-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
.lf-label { display: block; font-size: 13px; font-weight: 500; color: #1e293b; margin-bottom: 4px; }
.lf-input { width: 100%; padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; outline: none; transition: border-color 0.15s; }
.lf-input:focus { border-color: #2563eb; }

/* Steps */
.lf-step { display: flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 10px; border: 1px solid #e2e8f0; background: #fff; cursor: pointer; transition: all 0.15s; white-space: nowrap; }
.lf-step:hover { border-color: #2563eb; }
.lf-step--active { background: #2563eb; border-color: #2563eb; color: #fff; }
.lf-step__num { width: 24px; height: 24px; border-radius: 50%; background: #e2e8f0; color: #64748b; font-size: 12px; font-weight: 600; display: flex; align-items: center; justify-content: center; }
.lf-step--active .lf-step__num { background: rgba(255,255,255,0.2); color: #fff; }
.lf-step__label { font-size: 13px; font-weight: 500; }
</style>
