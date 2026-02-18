<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import { useEmployeeMenu } from '../../composables/useRoleMenu'
import { landfillStore, type Landfill } from '../../stores/landfills'
import BarChart from '../../components/charts/BarChart.vue'
import MapCoordinatePicker from '../../components/MapCoordinatePicker.vue'
import { toastStore } from '../../stores/toast'

// Map imports
import 'leaflet/dist/leaflet.css'
import { LMap, LTileLayer, LMarker, LPopup } from '@vue-leaflet/vue-leaflet'
import L from 'leaflet'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const { roleTitle, menuItems } = useEmployeeMenu()

// --- Data ---
const landfillId = computed(() => Number(route.params.id))
const landfill = computed(() => landfillStore.getLandfillById(landfillId.value))

// --- Edit mode ---
const isEditing = ref(false)
const editData = ref({
  name: '',
  type: '' as string,
  status: '' as string,
  region: '',
  district: '',
  operator: '',
  designCapacity: 0,
  currentVolume: 0,
  lat: 0,
  lng: 0,
  expiryYear: 0,
})

const showCoordPicker = ref(false)
const pickerCoords = ref<{ lat: number; lng: number } | null>(null)

const startEditing = () => {
  if (!landfill.value) return
  editData.value = {
    name: landfill.value.name,
    type: landfill.value.type,
    status: landfill.value.status,
    region: landfill.value.region,
    district: landfill.value.district,
    operator: landfill.value.operator,
    designCapacity: landfill.value.designCapacity,
    currentVolume: landfill.value.currentVolume,
    lat: landfill.value.lat,
    lng: landfill.value.lng,
    expiryYear: landfill.value.expiryYear,
  }
  isEditing.value = true
}

const cancelEditing = () => {
  isEditing.value = false
}

const saveEditing = () => {
  if (!landfill.value) return
  landfillStore.updateLandfill(landfill.value.id, { ...editData.value })
  isEditing.value = false
  toastStore.show({ type: 'success', title: 'Сохранено', message: 'Данные полигона обновлены' })
}

const onPickerConfirm = (coords: { lat: number; lng: number }) => {
  editData.value.lat = coords.lat
  editData.value.lng = coords.lng
}

// --- Type / Status labels & styles ---
const typeLabels: Record<string, string> = {
  sanitary: 'Санитарный полигон',
  unauthorized: 'Несанкционированная свалка',
  sorting: 'Мусоросортировочная станция',
}

const statusLabels: Record<string, string> = {
  active: 'Действующий',
  closed: 'Закрыт',
  recultivation: 'Рекультивация',
}

const typeBadgeClass = computed(() => {
  if (!landfill.value) return ''
  const cls: Record<string, string> = {
    sanitary: 'bg-blue-100 text-blue-800',
    unauthorized: 'bg-red-100 text-red-800',
    sorting: 'bg-purple-100 text-purple-800',
  }
  return cls[landfill.value.type] || 'bg-gray-100 text-gray-800'
})

const statusBadgeClass = computed(() => {
  if (!landfill.value) return ''
  const cls: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    closed: 'bg-gray-200 text-gray-700',
    recultivation: 'bg-orange-100 text-orange-800',
  }
  return cls[landfill.value.status] || 'bg-gray-100 text-gray-800'
})

// --- Block 2: Capacity & Fill ---
const fillPercent = computed(() => {
  if (!landfill.value || landfill.value.designCapacity === 0) return 0
  return Math.round((landfill.value.currentVolume / landfill.value.designCapacity) * 100)
})

const fillColor = computed(() => {
  const p = fillPercent.value
  if (p < 60) return '#22c55e'   // green
  if (p <= 85) return '#eab308'  // yellow
  return '#ef4444'               // red
})

const fillBgClass = computed(() => {
  const p = fillPercent.value
  if (p < 60) return 'bg-green-100 text-green-800'
  if (p <= 85) return 'bg-yellow-100 text-yellow-800'
  return 'bg-red-100 text-red-800'
})

// SVG circular progress
const circleRadius = 80
const circleCircumference = computed(() => 2 * Math.PI * circleRadius)
const circleDashoffset = computed(() => {
  const pct = Math.min(fillPercent.value, 100) / 100
  return circleCircumference.value * (1 - pct)
})

// Monthly intake chart
const monthNames = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']

const monthlyChartData = computed(() => {
  if (!landfill.value) return []
  return landfill.value.monthlyIntake.map((val, i) => ({
    label: monthNames[i],
    value: val,
    color: '#0e888d',
  }))
})

// Forecast
const avgMonthlyIntake = computed(() => {
  if (!landfill.value) return 0
  const intake = landfill.value.monthlyIntake
  const total = intake.reduce((s, v) => s + v, 0)
  return Math.round(total / intake.length)
})

const yearsLeft = computed(() => {
  if (!landfill.value || avgMonthlyIntake.value === 0) return 0
  const remainingTons = (landfill.value.designCapacity - landfill.value.currentVolume) * 1000
  const monthsLeft = remainingTons / avgMonthlyIntake.value
  return Math.round(monthsLeft / 12)
})

const isClosedOrRecultivation = computed(() => {
  if (!landfill.value) return false
  return landfill.value.status === 'closed' || landfill.value.status === 'recultivation'
})

// --- Block 3: Waste acceptance ---
function wasteUsagePercent(accepted: number, limit: number): number {
  if (limit === 0) return 0
  return Math.round((accepted / limit) * 100)
}

function wasteUsageColor(percent: number): string {
  if (percent > 90) return 'bg-red-500'
  if (percent >= 70) return 'bg-yellow-500'
  return 'bg-green-500'
}

function wasteUsageTextColor(percent: number): string {
  if (percent > 90) return 'text-red-600'
  if (percent >= 70) return 'text-yellow-600'
  return 'text-green-600'
}

function formatNumber(n: number): string {
  return n.toLocaleString('ru-RU')
}

// --- Block 4: Infrastructure ---
interface InfraItem {
  key: keyof Landfill['infrastructure']
  label: string
}

const infraItems: InfraItem[] = [
  { key: 'fencing', label: 'Ограждение периметра' },
  { key: 'weighControl', label: 'Весовой контроль' },
  { key: 'monitoring', label: 'Система мониторинга' },
  { key: 'drainage', label: 'Дренажная система' },
  { key: 'leachateCollection', label: 'Система сбора фильтрата' },
  { key: 'fireSafety', label: 'Противопожарное оборудование' },
  { key: 'ecoMonitoring', label: 'Экологический мониторинг' },
]

const infraCount = computed(() => {
  if (!landfill.value) return 0
  return infraItems.filter(item => landfill.value!.infrastructure[item.key]).length
})

const infraPercent = computed(() => Math.round((infraCount.value / infraItems.length) * 100))

// --- Block 5: Permits & Documents ---
function isPermitExpired(expiryStr: string): boolean {
  if (!expiryStr) return false
  const parts = expiryStr.split('.')
  if (parts.length !== 3) return false
  const expiry = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]))
  return expiry < new Date()
}

// --- Block 6: Map ---
const markerIcon = computed(() => {
  if (!landfill.value) return undefined
  const colors: Record<string, string> = {
    active: '#22c55e',
    closed: '#9ca3af',
    recultivation: '#f97316',
  }
  const color = colors[landfill.value.status] || '#22c55e'
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color:${color};width:32px;height:32px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 5px rgba(0,0,0,0.3);"></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  })
})

// --- Coordinates formatting ---
const coordsText = computed(() => {
  if (!landfill.value) return ''
  const lat = landfill.value.lat.toFixed(4)
  const lng = landfill.value.lng.toFixed(4)
  return `${lat}\u00B0 N, ${lng}\u00B0 E`
})
</script>

<template>
  <DashboardLayout
    role="employee"
    :roleTitle="roleTitle"
    userName="Мамытова Айгуль"
    :menuItems="menuItems"
  >
    <!-- ==================== NOT FOUND STATE ==================== -->
    <div v-if="!landfill" class="text-center py-20">
      <p class="text-xl text-gray-500 mb-4">Полигон не найден</p>
      <button
        @click="router.push('/ministry/landfills')"
        class="text-teal-600 hover:text-teal-700 font-medium"
      >
        &larr; Вернуться к реестру
      </button>
    </div>

    <!-- ==================== MAIN CONTENT ==================== -->
    <template v-else>
      <!-- Header -->
      <div class="mb-6">
        <button
          @click="router.push('/ministry/landfills')"
          class="inline-flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700 font-medium mb-4 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Назад к реестру
        </button>
        <div class="flex flex-wrap items-center gap-3">
          <h1 class="text-2xl lg:text-3xl font-bold text-gray-900">{{ landfill.name }}</h1>
          <button
            v-if="!isEditing"
            @click="startEditing"
            class="ml-auto inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-teal-700 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Редактировать
          </button>
          <span :class="['inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold', typeBadgeClass]">
            {{ typeLabels[landfill.type] || landfill.type }}
          </span>
          <span :class="['inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold', statusBadgeClass]">
            {{ statusLabels[landfill.status] || landfill.status }}
          </span>
        </div>
      </div>

      <!-- ==================== BLOCK 1: General Info ==================== -->
      <div class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 class="text-lg font-bold text-gray-900 mb-4">Общая информация</h2>
        <!-- Edit mode -->
        <div v-if="isEditing" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Название</label>
              <input v-model="editData.name" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Тип объекта</label>
              <select v-model="editData.type" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm">
                <option value="sanitary">Санитарный полигон</option>
                <option value="unauthorized">Несанкционированная свалка</option>
                <option value="sorting">Мусоросортировочная станция</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Статус</label>
              <select v-model="editData.status" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm">
                <option value="active">Действующий</option>
                <option value="closed">Закрыт</option>
                <option value="recultivation">Рекультивация</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Оператор</label>
              <input v-model="editData.operator" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Регион</label>
              <input v-model="editData.region" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Район</label>
              <input v-model="editData.district" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Проектная ёмкость (тыс. т)</label>
              <input v-model.number="editData.designCapacity" type="number" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Текущий объём (тыс. т)</label>
              <input v-model.number="editData.currentVolume" type="number" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Срок эксплуатации до (год)</label>
              <input v-model.number="editData.expiryYear" type="number" min="2024" max="2100" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm" />
            </div>
          </div>
          <!-- Coordinates with map picker -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Координаты</label>
            <div class="flex items-center gap-3">
              <input v-model.number="editData.lat" type="number" step="0.0001" placeholder="Широта" class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm" />
              <input v-model.number="editData.lng" type="number" step="0.0001" placeholder="Долгота" class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm" />
              <button type="button" @click="pickerCoords = { lat: editData.lat, lng: editData.lng }; showCoordPicker = true" class="px-4 py-2 text-sm font-medium text-teal-700 border border-teal-300 rounded-lg hover:bg-teal-50 transition-colors flex items-center gap-2 whitespace-nowrap">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                На карте
              </button>
            </div>
          </div>
          <!-- Save / Cancel -->
          <div class="flex items-center gap-3 pt-4 border-t border-gray-200">
            <button @click="saveEditing" class="px-5 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors">Сохранить</button>
            <button @click="cancelEditing" class="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Отмена</button>
          </div>
        </div>

        <!-- View mode (existing content) -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
          <div class="flex justify-between py-2 border-b border-gray-100">
            <span class="text-sm text-gray-500">Название</span>
            <span class="text-sm font-medium text-gray-900 text-right">{{ landfill.name }}</span>
          </div>
          <div class="flex justify-between py-2 border-b border-gray-100">
            <span class="text-sm text-gray-500">Тип объекта</span>
            <span class="text-sm font-medium text-gray-900 text-right">{{ typeLabels[landfill.type] || landfill.type }}</span>
          </div>
          <div class="flex justify-between items-center py-2 border-b border-gray-100">
            <span class="text-sm text-gray-500">Статус</span>
            <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold', statusBadgeClass]">
              {{ statusLabels[landfill.status] || landfill.status }}
            </span>
          </div>
          <div class="flex justify-between py-2 border-b border-gray-100">
            <span class="text-sm text-gray-500">Оператор</span>
            <span class="text-sm font-medium text-gray-900 text-right">{{ landfill.operator }}</span>
          </div>
          <div class="flex justify-between py-2 border-b border-gray-100">
            <span class="text-sm text-gray-500">Год открытия</span>
            <span class="text-sm font-medium text-gray-900">{{ landfill.openYear }}</span>
          </div>
          <div class="flex justify-between py-2 border-b border-gray-100">
            <span class="text-sm text-gray-500">Срок эксплуатации</span>
            <span class="text-sm font-medium text-gray-900">до {{ landfill.expiryYear }} г.</span>
          </div>
          <div class="flex justify-between py-2 border-b border-gray-100">
            <span class="text-sm text-gray-500">Класс опасности</span>
            <span class="text-sm font-medium text-gray-900">{{ landfill.hazardClasses.join(', ') }}</span>
          </div>
          <div class="flex justify-between py-2 border-b border-gray-100">
            <span class="text-sm text-gray-500">Регион</span>
            <span class="text-sm font-medium text-gray-900 text-right">{{ landfill.region }}</span>
          </div>
          <div class="flex justify-between py-2 border-b border-gray-100">
            <span class="text-sm text-gray-500">Район</span>
            <span class="text-sm font-medium text-gray-900 text-right">{{ landfill.district }}</span>
          </div>
          <div class="flex justify-between py-2 border-b border-gray-100">
            <span class="text-sm text-gray-500">Населённый пункт</span>
            <span class="text-sm font-medium text-gray-900 text-right">{{ landfill.settlement }}</span>
          </div>
          <div class="flex justify-between py-2 border-b border-gray-100">
            <span class="text-sm text-gray-500">Адрес</span>
            <span class="text-sm font-medium text-gray-900 text-right">{{ landfill.address }}</span>
          </div>
          <div class="flex justify-between py-2 border-b border-gray-100">
            <span class="text-sm text-gray-500">Координаты</span>
            <span class="text-sm font-medium text-gray-900">{{ coordsText }}</span>
          </div>
          <div class="flex justify-between py-2 border-b border-gray-100">
            <span class="text-sm text-gray-500">Категория земли</span>
            <span class="text-sm font-medium text-gray-900 text-right">{{ landfill.landCategory }}</span>
          </div>
          <div class="flex justify-between py-2 border-b border-gray-100">
            <span class="text-sm text-gray-500">Население</span>
            <span class="text-sm font-medium text-gray-900">{{ landfill.population }} тыс. чел.</span>
          </div>
          <div class="flex justify-between py-2 border-b border-gray-100">
            <span class="text-sm text-gray-500">Обслуживаемое население</span>
            <span class="text-sm font-medium text-gray-900">{{ landfill.servicedPopulation }} тыс. чел.</span>
          </div>
          <div class="flex justify-between py-2 border-b border-gray-100">
            <span class="text-sm text-gray-500">Тариф (физ. лица)</span>
            <span class="text-sm font-medium text-gray-900">{{ landfill.tariffPhysical }} сом</span>
          </div>
          <div class="flex justify-between py-2 border-b border-gray-100">
            <span class="text-sm text-gray-500">Тариф (юр. лица)</span>
            <span class="text-sm font-medium text-gray-900">{{ landfill.tariffLegal }} сом</span>
          </div>
          <div class="flex justify-between py-2 border-b border-gray-100">
            <span class="text-sm text-gray-500">Ежедневный объём</span>
            <span class="text-sm font-medium text-gray-900">{{ landfill.dailyVolume }} т/день</span>
          </div>
          <div class="flex justify-between py-2 border-b border-gray-100">
            <span class="text-sm text-gray-500">График завоза ТБО</span>
            <span class="text-sm font-medium text-gray-900">{{ landfill.wasteSchedule }}</span>
          </div>
        </div>
      </div>

      <!-- ==================== BLOCK 2: Capacity & Fill Level ==================== -->
      <div class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 class="text-lg font-bold text-gray-900 mb-4">Ёмкость и заполненность</h2>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
            <p class="text-xs text-blue-600 mb-1">Проектная ёмкость</p>
            <p class="text-2xl font-bold text-blue-800">{{ formatNumber(landfill.designCapacity) }}</p>
            <p class="text-xs text-blue-500">тыс. т</p>
          </div>
          <div class="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
            <p class="text-xs text-orange-600 mb-1">Текущий объём</p>
            <p class="text-2xl font-bold text-orange-800">{{ formatNumber(landfill.currentVolume) }}</p>
            <p class="text-xs text-orange-500">тыс. т</p>
          </div>
          <div :class="['rounded-xl p-4 text-center border', fillBgClass]">
            <p class="text-xs opacity-80 mb-1">Заполненность</p>
            <p class="text-2xl font-bold">{{ fillPercent }}%</p>
            <p class="text-xs opacity-70">от проектной ёмкости</p>
          </div>
        </div>

        <div class="flex flex-col items-center mb-6">
          <svg width="220" height="220" viewBox="0 0 220 220">
            <circle cx="110" cy="110" :r="circleRadius" fill="none" stroke="#e5e7eb" stroke-width="16" />
            <circle
              cx="110" cy="110" :r="circleRadius" fill="none"
              :stroke="fillColor" stroke-width="16" stroke-linecap="round"
              :stroke-dasharray="circleCircumference" :stroke-dashoffset="circleDashoffset"
              transform="rotate(-90 110 110)" class="transition-all duration-700"
            />
            <text x="110" y="105" text-anchor="middle" :fill="fillColor" font-size="36" font-weight="bold">
              {{ fillPercent }}%
            </text>
            <text x="110" y="130" text-anchor="middle" fill="#6b7280" font-size="14">
              заполнено
            </text>
          </svg>
        </div>

        <div class="bg-gray-50 rounded-lg p-4 mb-6 text-center">
          <template v-if="isClosedOrRecultivation">
            <p class="text-sm text-gray-600">
              Полигон {{ landfill.status === 'closed' ? 'закрыт' : 'на рекультивации' }}
            </p>
          </template>
          <template v-else-if="avgMonthlyIntake > 0">
            <p class="text-sm text-gray-700">
              При текущих темпах приёма (~<span class="font-semibold">{{ formatNumber(avgMonthlyIntake) }}</span> т/мес)
              полигон будет заполнен через
              <span class="font-semibold" :class="yearsLeft <= 3 ? 'text-red-600' : yearsLeft <= 7 ? 'text-yellow-600' : 'text-green-600'">
                {{ yearsLeft }}
              </span>
              лет
            </p>
          </template>
          <template v-else>
            <p class="text-sm text-gray-500">Нет данных о поступлении отходов</p>
          </template>
        </div>

        <BarChart :data="monthlyChartData" :height="220" title="Поступление отходов по месяцам (тонн)" />
      </div>

      <!-- ==================== BLOCK 3: Waste Types Table ==================== -->
      <div class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 class="text-lg font-bold text-gray-900 mb-4">Принимаемые виды отходов</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm border-collapse">
            <thead class="bg-gray-50">
              <tr>
                <th class="text-left px-4 py-3 font-medium text-gray-500 border-b border-gray-200">Категория отходов</th>
                <th class="text-left px-4 py-3 font-medium text-gray-500 border-b border-gray-200">Класс опасности</th>
                <th class="text-right px-4 py-3 font-medium text-gray-500 border-b border-gray-200">Принято за год (т)</th>
                <th class="text-right px-4 py-3 font-medium text-gray-500 border-b border-gray-200">Лимит (т/год)</th>
                <th class="text-left px-4 py-3 font-medium text-gray-500 border-b border-gray-200" style="min-width: 180px;">Использование лимита</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in landfill.wasteAcceptance" :key="idx" class="hover:bg-gray-50 transition-colors">
                <td class="px-4 py-3 font-medium text-gray-900 border-b border-gray-100">{{ item.category }}</td>
                <td class="px-4 py-3 text-gray-600 border-b border-gray-100">{{ item.hazardClass }}</td>
                <td class="px-4 py-3 text-right font-medium text-gray-900 border-b border-gray-100">{{ formatNumber(item.acceptedPerYear) }}</td>
                <td class="px-4 py-3 text-right text-gray-600 border-b border-gray-100">{{ formatNumber(item.limitPerYear) }}</td>
                <td class="px-4 py-3 border-b border-gray-100">
                  <div class="flex items-center gap-3">
                    <div class="flex-1 bg-gray-200 rounded-full h-2.5">
                      <div
                        :class="['h-2.5 rounded-full transition-all', wasteUsageColor(wasteUsagePercent(item.acceptedPerYear, item.limitPerYear))]"
                        :style="{ width: Math.min(wasteUsagePercent(item.acceptedPerYear, item.limitPerYear), 100) + '%' }"
                      ></div>
                    </div>
                    <span :class="['text-sm font-semibold whitespace-nowrap', wasteUsageTextColor(wasteUsagePercent(item.acceptedPerYear, item.limitPerYear))]">
                      {{ wasteUsagePercent(item.acceptedPerYear, item.limitPerYear) }}%
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ==================== BLOCK 4: Infrastructure ==================== -->
      <div class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 class="text-lg font-bold text-gray-900 mb-4">Инфраструктура и оснащение</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          <div v-for="item in infraItems" :key="item.key" class="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50">
            <svg v-if="landfill.infrastructure[item.key]" class="w-5 h-5 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <svg v-else class="w-5 h-5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span class="text-sm text-gray-800">{{ item.label }}</span>
          </div>
        </div>
        <div class="bg-gray-50 rounded-lg p-4 mb-6">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-700">Оснащённость: {{ infraCount }} из {{ infraItems.length }}</span>
            <span class="text-sm font-semibold" :class="infraPercent >= 80 ? 'text-green-600' : infraPercent >= 50 ? 'text-yellow-600' : 'text-red-600'">
              {{ infraPercent }}%
            </span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2.5">
            <div class="h-2.5 rounded-full transition-all" :class="infraPercent >= 80 ? 'bg-green-500' : infraPercent >= 50 ? 'bg-yellow-500' : 'bg-red-500'" :style="{ width: infraPercent + '%' }"></div>
          </div>
        </div>

        <h3 class="text-sm font-semibold text-gray-800 mb-3">Техническое оснащение</h3>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="bg-gray-50 rounded-lg p-3 text-center border border-gray-100">
            <p class="text-2xl font-bold text-gray-900">{{ landfill.equipment.trucks }}</p>
            <p class="text-xs text-gray-500 mt-1">Мусоровозов</p>
          </div>
          <div class="bg-gray-50 rounded-lg p-3 text-center border border-gray-100">
            <p class="text-2xl font-bold text-gray-900">{{ landfill.equipment.excavators }}</p>
            <p class="text-xs text-gray-500 mt-1">Экскаваторов</p>
          </div>
          <div class="bg-gray-50 rounded-lg p-3 text-center border border-gray-100">
            <p class="text-2xl font-bold text-gray-900">{{ landfill.equipment.tractors }}</p>
            <p class="text-xs text-gray-500 mt-1">Тракторов</p>
          </div>
          <div class="bg-gray-50 rounded-lg p-3 text-center border border-gray-100">
            <p class="text-2xl font-bold text-gray-900">{{ landfill.equipment.bulldozers }}</p>
            <p class="text-xs text-gray-500 mt-1">Бульдозеров</p>
          </div>
        </div>
      </div>

      <!-- ==================== BLOCK 4.5: Morphological Composition ==================== -->
      <div class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 class="text-lg font-bold text-gray-900 mb-4">Морфологический состав отходов</h2>
        <div class="space-y-3">
          <div v-for="item in [
            { label: 'Пластик', value: landfill.morphology.plastic, color: '#2563eb' },
            { label: 'Бумага/картон', value: landfill.morphology.paper, color: '#f59e0b' },
            { label: 'Стекло', value: landfill.morphology.glass, color: '#10b981' },
            { label: 'Пищевые отходы', value: landfill.morphology.food, color: '#8b5cf6' },
            { label: 'Прочее', value: landfill.morphology.other, color: '#94a3b8' },
          ]" :key="item.label">
            <div class="flex items-center justify-between text-sm mb-1">
              <span class="text-gray-600">{{ item.label }}</span>
              <span class="font-semibold text-gray-900">{{ item.value }}%</span>
            </div>
            <div class="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div class="h-full rounded-full transition-all" :style="{ width: item.value + '%', backgroundColor: item.color }"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- ==================== BLOCK 5: Documents & Permits ==================== -->
      <div class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 class="text-lg font-bold text-gray-900 mb-4">Документы и разрешения</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div class="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-sm font-semibold text-gray-800">Разрешение на эксплуатацию</h3>
              <span v-if="landfill.permits.operationPermit.expiry && isPermitExpired(landfill.permits.operationPermit.expiry)" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">Истекло</span>
              <span v-else-if="landfill.permits.operationPermit.number" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">Действует</span>
            </div>
            <div v-if="landfill.permits.operationPermit.number" class="space-y-1 text-sm">
              <div class="flex justify-between"><span class="text-gray-500">Номер:</span><span class="font-medium text-gray-900">{{ landfill.permits.operationPermit.number }}</span></div>
              <div class="flex justify-between"><span class="text-gray-500">Дата выдачи:</span><span class="font-medium text-gray-900">{{ landfill.permits.operationPermit.date }}</span></div>
              <div class="flex justify-between"><span class="text-gray-500">Действует до:</span><span class="font-medium" :class="isPermitExpired(landfill.permits.operationPermit.expiry) ? 'text-red-600' : 'text-gray-900'">{{ landfill.permits.operationPermit.expiry }}</span></div>
            </div>
            <p v-else class="text-sm text-gray-400">Нет данных</p>
          </div>
          <div class="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <h3 class="text-sm font-semibold text-gray-800 mb-2">Экологическое заключение</h3>
            <div v-if="landfill.permits.ecoConclusion.number" class="space-y-1 text-sm">
              <div class="flex justify-between"><span class="text-gray-500">Номер:</span><span class="font-medium text-gray-900">{{ landfill.permits.ecoConclusion.number }}</span></div>
              <div class="flex justify-between"><span class="text-gray-500">Дата выдачи:</span><span class="font-medium text-gray-900">{{ landfill.permits.ecoConclusion.date }}</span></div>
            </div>
            <p v-else class="text-sm text-gray-400">Нет данных</p>
          </div>
        </div>
        <h3 class="text-sm font-semibold text-gray-800 mb-3">Прикреплённые документы</h3>
        <div v-if="landfill.documents.length > 0" class="space-y-2">
          <div v-for="(doc, idx) in landfill.documents" :key="idx" class="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors">
            <div class="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">{{ doc.name }}</p>
              <p class="text-xs text-gray-500">{{ doc.date }} &middot; {{ doc.size }}</p>
            </div>
            <div class="flex items-center gap-2 flex-shrink-0">
              <button class="text-xs font-medium text-teal-600 hover:text-teal-700 px-3 py-1.5 rounded-lg hover:bg-teal-50 transition-colors">Просмотр</button>
              <button class="text-xs font-medium text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">Скачать</button>
            </div>
          </div>
        </div>
        <p v-else class="text-sm text-gray-400">Документы не прикреплены</p>
      </div>

      <!-- ==================== BLOCK 6: Location Map ==================== -->
      <div class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-bold text-gray-900">Расположение на карте</h2>
          <router-link
            :to="{ path: '/registries', query: { lat: String(landfill.lat), lng: String(landfill.lng), zoom: '15' } }"
            class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Показать на карте
          </router-link>
        </div>
        <div class="rounded-xl overflow-hidden border border-gray-200">
          <LMap :center="[landfill.lat, landfill.lng]" :zoom="15" style="height: 300px;" :use-global-leaflet="false">
            <LTileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
            <LMarker :lat-lng="[landfill.lat, landfill.lng]" :icon="markerIcon">
              <LPopup :options="{ maxWidth: 280 }">
                <div style="font-family: system-ui, sans-serif;">
                  <p style="font-weight: 600; font-size: 14px; margin: 0 0 4px 0; color: #1e293b;">{{ landfill.name }}</p>
                  <p style="font-size: 12px; margin: 0; color: #64748b;">{{ landfill.address }}</p>
                </div>
              </LPopup>
            </LMarker>
          </LMap>
        </div>
        <div class="mt-3 flex items-center justify-between">
          <p class="text-sm text-gray-500">{{ landfill.address }}</p>
          <p class="text-xs text-gray-400 font-mono">{{ coordsText }}</p>
        </div>
      </div>
    </template>
    <MapCoordinatePicker
      :visible="showCoordPicker"
      :modelValue="pickerCoords"
      @update:visible="showCoordPicker = $event"
      @update:modelValue="onPickerConfirm"
    />
  </DashboardLayout>
</template>

<style scoped>
:deep(.custom-marker) {
  background: transparent !important;
  border: none !important;
}
</style>
