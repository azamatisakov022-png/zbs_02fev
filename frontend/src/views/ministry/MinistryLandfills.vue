<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import { useEmployeeMenu } from '../../composables/useRoleMenu'
import {
  landfillStore,
  getFillPercent,
  type Landfill,
  type LandfillType,
  type LandfillStatus,
} from '../../stores/landfills'

import 'leaflet/dist/leaflet.css'
import { LMap, LTileLayer, LMarker, LPopup } from '@vue-leaflet/vue-leaflet'
import L from 'leaflet'

const router = useRouter()
const { t } = useI18n()
const { roleTitle, menuItems } = useEmployeeMenu()

// ==================== VIEW STATE ====================
const viewMode = ref<'list' | 'map'>('list')
const showAddModal = ref(false)

// ==================== FILTERS ====================
const searchQuery = ref('')
const filterRegion = ref('')
const filterType = ref('')
const filterStatus = ref('')

// ==================== MAP STATE ====================
const mapCenter = ref<[number, number]>([41.5, 74.5])
const mapZoom = ref(7)
const mapRef = ref<any>(null)

// ==================== COMPUTED ====================

const uniqueRegions = computed(() => {
  const regions = landfillStore.state.landfills.map(l => l.region)
  return [...new Set(regions)].sort()
})

const filteredLandfills = computed(() => {
  let result = landfillStore.state.landfills

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(
      l => l.name.toLowerCase().includes(q) || l.region.toLowerCase().includes(q)
    )
  }

  if (filterRegion.value) {
    result = result.filter(l => l.region === filterRegion.value)
  }

  if (filterType.value) {
    result = result.filter(l => l.type === filterType.value)
  }

  if (filterStatus.value) {
    result = result.filter(l => l.status === filterStatus.value)
  }

  return result
})

// Stats
const totalCount = computed(() => landfillStore.state.landfills.length)

const activeCount = computed(() =>
  landfillStore.state.landfills.filter(l => l.status === 'active').length
)

const criticalFillCount = computed(() =>
  landfillStore.state.landfills.filter(l => {
    if (l.designCapacity === 0) return false
    return l.currentVolume / l.designCapacity > 0.85
  }).length
)

const totalCapacity = computed(() => {
  const sum = landfillStore.state.landfills.reduce((s, l) => s + l.designCapacity, 0)
  return (sum / 1000).toFixed(1)
})

// ==================== HELPERS ====================

const getTypeLabel = (type: LandfillType): string => {
  switch (type) {
    case 'sanitary':
      return 'Санитарный полигон'
    case 'unauthorized':
      return 'Несанкц. свалка'
    case 'sorting':
      return 'Сортировочная станция'
  }
}

const getTypeBadgeClass = (type: LandfillType): string => {
  switch (type) {
    case 'sanitary':
      return 'bg-blue-100 text-blue-800'
    case 'unauthorized':
      return 'bg-red-100 text-red-800'
    case 'sorting':
      return 'bg-purple-100 text-purple-800'
  }
}

const getStatusLabel = (status: LandfillStatus): string => {
  switch (status) {
    case 'active':
      return 'Действующий'
    case 'closed':
      return 'Закрыт'
    case 'recultivation':
      return 'На рекультивации'
  }
}

const getStatusBadgeClass = (status: LandfillStatus): string => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800'
    case 'closed':
      return 'bg-gray-100 text-gray-800'
    case 'recultivation':
      return 'bg-orange-100 text-orange-800'
  }
}

const getFillBarColorClass = (percent: number): string => {
  if (percent > 85) return 'bg-red-500'
  if (percent >= 60) return 'bg-yellow-500'
  return 'bg-green-500'
}

const formatCapacity = (val: number): string => {
  return val.toLocaleString('ru-RU')
}

// ==================== MAP HELPERS ====================

const createMarkerIcon = (status: LandfillStatus) => {
  const colors: Record<LandfillStatus, string> = {
    active: '#22c55e',
    closed: '#9ca3af',
    recultivation: '#f97316',
  }
  return L.divIcon({
    className: 'custom-marker',
    html: '<div style="background-color:' + colors[status] + ';width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 5px rgba(0,0,0,0.3);"></div>',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  })
}

const goToDetail = (landfill: Landfill) => {
  router.push('/ministry/landfills/' + landfill.id)
}

// ==================== ADD FORM ====================

const newLandfill = ref({
  name: '',
  type: 'sanitary' as LandfillType,
  region: '',
  district: '',
  settlement: '',
  operator: '',
  designCapacity: 0,
  currentVolume: 0,
  openYear: new Date().getFullYear(),
  expiryYear: new Date().getFullYear() + 20,
  lat: 0,
  lng: 0,
})

const isFormValid = computed(() => {
  return newLandfill.value.name.trim() !== '' && newLandfill.value.region.trim() !== ''
})

const resetForm = () => {
  newLandfill.value = {
    name: '',
    type: 'sanitary',
    region: '',
    district: '',
    settlement: '',
    operator: '',
    designCapacity: 0,
    currentVolume: 0,
    openYear: new Date().getFullYear(),
    expiryYear: new Date().getFullYear() + 20,
    lat: 0,
    lng: 0,
  }
}

const saveLandfill = () => {
  if (!isFormValid.value) return

  landfillStore.addLandfill({
    name: newLandfill.value.name,
    type: newLandfill.value.type,
    status: 'active',
    operator: newLandfill.value.operator,
    region: newLandfill.value.region,
    district: newLandfill.value.district,
    settlement: newLandfill.value.settlement,
    address: '',
    lat: newLandfill.value.lat || 42.87,
    lng: newLandfill.value.lng || 74.59,
    openYear: newLandfill.value.openYear,
    expiryYear: newLandfill.value.expiryYear,
    hazardClasses: ['IV', 'V'],
    designCapacity: newLandfill.value.designCapacity,
    currentVolume: newLandfill.value.currentVolume,
    monthlyIntake: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    wasteAcceptance: [],
    infrastructure: {
      fencing: false,
      weighControl: false,
      monitoring: false,
      drainage: false,
      leachateCollection: false,
      fireSafety: false,
      ecoMonitoring: false,
    },
    permits: {
      operationPermit: { number: '', date: '', expiry: '' },
      ecoConclusion: { number: '', date: '' },
    },
    documents: [],
  })

  resetForm()
  showAddModal.value = false
}

const cancelAdd = () => {
  resetForm()
  showAddModal.value = false
}

// ==================== FILTER RESET ====================

const isFiltersActive = computed(
  () => !!(searchQuery.value || filterRegion.value || filterType.value || filterStatus.value)
)

const resetAllFilters = () => {
  searchQuery.value = ''
  filterRegion.value = ''
  filterType.value = ''
  filterStatus.value = ''
}
</script>

<template>
  <DashboardLayout
    role="employee"
    :roleTitle="roleTitle"
    userName="Мамытова Айгуль"
    :menuItems="menuItems"
  >
    <div class="space-y-6">
      <!-- ==================== HEADER ==================== -->
      <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b] mb-1">
            Полигоны ТБО
          </h1>
          <p class="text-[#64748b] text-sm">
            Реестр полигонов и объектов размещения твёрдых бытовых отходов
          </p>
        </div>

        <div class="flex items-center gap-3 flex-shrink-0">
          <!-- View mode toggle -->
          <div class="inline-flex rounded-lg border border-[#e2e8f0] overflow-hidden">
            <button
              @click="viewMode = 'list'"
              :class="[
                'px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2',
                viewMode === 'list'
                  ? 'bg-[#2563eb] text-white'
                  : 'bg-white text-[#64748b] hover:bg-[#f8fafc]',
              ]"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              Список
            </button>
            <button
              @click="viewMode = 'map'"
              :class="[
                'px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2',
                viewMode === 'map'
                  ? 'bg-[#2563eb] text-white'
                  : 'bg-white text-[#64748b] hover:bg-[#f8fafc]',
              ]"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Карта
            </button>
          </div>

          <!-- Add button -->
          <button
            @click="showAddModal = true"
            class="inline-flex items-center gap-2 px-4 py-2 bg-[#2563eb] text-white text-sm font-medium rounded-lg hover:bg-[#1d4ed8] transition-colors"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Добавить полигон
          </button>
        </div>
      </div>

      <!-- ==================== STATS ==================== -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Total -->
        <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <svg class="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <p class="text-sm text-[#64748b]">Всего полигонов</p>
              <p class="text-2xl font-bold text-[#1e293b]">{{ totalCount }}</p>
            </div>
          </div>
        </div>

        <!-- Active -->
        <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <svg class="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p class="text-sm text-[#64748b]">Действующих</p>
              <p class="text-2xl font-bold text-[#10b981]">{{ activeCount }}</p>
            </div>
          </div>
        </div>

        <!-- Critical fill -->
        <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
              <svg class="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <p class="text-sm text-[#64748b]">Заполненность >85%</p>
              <p class="text-2xl font-bold text-[#ef4444]">{{ criticalFillCount }}</p>
            </div>
          </div>
        </div>

        <!-- Total capacity -->
        <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <svg class="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <p class="text-sm text-[#64748b]">Общая ёмкость</p>
              <p class="text-2xl font-bold text-[#7c3aed]">{{ totalCapacity }} тыс. т</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ==================== FILTERS ==================== -->
      <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
        <div class="flex flex-wrap gap-3">
          <div class="relative flex-1 min-w-[200px]">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Поиск по названию, региону..."
              class="w-full pl-9 pr-4 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb] text-sm"
            />
          </div>

          <select
            v-model="filterRegion"
            class="px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb] text-sm bg-white"
          >
            <option value="">Все регионы</option>
            <option v-for="region in uniqueRegions" :key="region" :value="region">
              {{ region }}
            </option>
          </select>

          <select
            v-model="filterType"
            class="px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb] text-sm bg-white"
          >
            <option value="">Все типы</option>
            <option value="sanitary">Санитарный полигон</option>
            <option value="unauthorized">Несанкционированная свалка</option>
            <option value="sorting">Мусоросортировочная станция</option>
          </select>

          <select
            v-model="filterStatus"
            class="px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb] text-sm bg-white"
          >
            <option value="">Все статусы</option>
            <option value="active">Действующий</option>
            <option value="closed">Закрыт</option>
            <option value="recultivation">На рекультивации</option>
          </select>

          <button
            v-if="isFiltersActive"
            @click="resetAllFilters"
            class="px-3 py-2 text-sm text-[#ef4444] hover:bg-red-50 rounded-lg transition-colors"
          >
            Сбросить
          </button>
        </div>
      </div>

      <!-- ==================== LIST MODE ==================== -->
      <template v-if="viewMode === 'list'">
        <div
          v-if="filteredLandfills.length > 0"
          class="grid grid-cols-1 lg:grid-cols-2 gap-4"
        >
          <div
            v-for="landfill in filteredLandfills"
            :key="landfill.id"
            @click="goToDetail(landfill)"
            class="border border-gray-200 rounded-xl bg-white p-5 hover:shadow-md transition-shadow cursor-pointer"
          >
            <!-- Badges row -->
            <div class="flex items-center gap-2 mb-3">
              <span
                :class="[
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  getTypeBadgeClass(landfill.type),
                ]"
              >
                {{ getTypeLabel(landfill.type) }}
              </span>
              <span
                :class="[
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  getStatusBadgeClass(landfill.status),
                ]"
              >
                {{ getStatusLabel(landfill.status) }}
              </span>
            </div>

            <!-- Name -->
            <h3 class="text-base font-semibold text-[#1e293b] mb-3">
              {{ landfill.name }}
            </h3>

            <!-- Location & Operator -->
            <div class="space-y-1.5 mb-4">
              <div class="flex items-start gap-2 text-sm text-[#64748b]">
                <svg class="w-4 h-4 mt-0.5 flex-shrink-0 text-[#94a3b8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{{ landfill.region }}, {{ landfill.district }}</span>
              </div>
              <div v-if="landfill.operator && landfill.operator !== '\u2014'" class="flex items-start gap-2 text-sm text-[#64748b]">
                <svg class="w-4 h-4 mt-0.5 flex-shrink-0 text-[#94a3b8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span>{{ landfill.operator }}</span>
              </div>
            </div>

            <!-- Fill level -->
            <div class="mb-4">
              <div class="flex items-center justify-between text-sm mb-1.5">
                <span class="text-[#64748b]">Заполненность:</span>
                <span
                  class="font-semibold"
                  :class="{
                    'text-green-600': getFillPercent(landfill) < 60,
                    'text-yellow-600': getFillPercent(landfill) >= 60 && getFillPercent(landfill) <= 85,
                    'text-red-600': getFillPercent(landfill) > 85,
                  }"
                >
                  {{ getFillPercent(landfill) }}%
                </span>
              </div>
              <div class="w-full h-2 bg-[#f1f5f9] rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all"
                  :class="getFillBarColorClass(getFillPercent(landfill))"
                  :style="{ width: Math.min(getFillPercent(landfill), 100) + '%' }"
                ></div>
              </div>
              <p class="text-xs text-[#94a3b8] mt-1">
                {{ formatCapacity(landfill.currentVolume) }} / {{ formatCapacity(landfill.designCapacity) }} тыс. т
              </p>
            </div>

            <!-- Bottom info -->
            <div class="flex items-center justify-between text-xs text-[#64748b] pt-3 border-t border-[#f1f5f9]">
              <span>Класс опасности: {{ landfill.hazardClasses.join(', ') }}</span>
              <span>Срок эксплуатации: до {{ landfill.expiryYear }} г.</span>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-else class="text-center py-12 text-gray-500">
          <svg class="w-12 h-12 text-[#d1d5db] mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <p class="text-lg font-medium">Нет полигонов</p>
          <p class="text-sm mt-1">Нет полигонов, соответствующих выбранным фильтрам</p>
          <button
            v-if="isFiltersActive"
            @click="resetAllFilters"
            class="mt-4 px-4 py-2 text-sm text-[#2563eb] hover:bg-blue-50 rounded-lg transition-colors"
          >
            Сбросить фильтры
          </button>
        </div>
      </template>

      <!-- ==================== MAP MODE ==================== -->
      <template v-if="viewMode === 'map'">
        <div class="bg-white rounded-xl shadow-sm border border-[#e2e8f0] overflow-hidden">
          <div class="h-[600px]">
            <LMap
              ref="mapRef"
              :zoom="mapZoom"
              :center="mapCenter"
              :use-global-leaflet="false"
              class="h-full w-full"
            >
              <LTileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
                layer-type="base"
                name="OpenStreetMap"
              />
              <LMarker
                v-for="landfill in filteredLandfills"
                :key="landfill.id"
                :lat-lng="[landfill.lat, landfill.lng]"
                :icon="createMarkerIcon(landfill.status)"
              >
                <LPopup>
                  <div class="min-w-[220px]">
                    <h4 class="font-semibold text-[#1e293b] text-sm mb-2">
                      {{ landfill.name }}
                    </h4>
                    <div class="space-y-1 text-xs text-[#64748b] mb-3">
                      <p>
                        <span class="font-medium text-[#475569]">Тип:</span>
                        {{ getTypeLabel(landfill.type) }}
                      </p>
                      <p>
                        <span class="font-medium text-[#475569]">Статус:</span>
                        {{ getStatusLabel(landfill.status) }}
                      </p>
                      <p>
                        <span class="font-medium text-[#475569]">Заполненность:</span>
                        {{ getFillPercent(landfill) }}%
                      </p>
                    </div>
                    <button
                      @click="goToDetail(landfill)"
                      class="text-xs text-[#2563eb] hover:text-[#1d4ed8] font-medium"
                    >
                      Подробнее &rarr;
                    </button>
                  </div>
                </LPopup>
              </LMarker>
            </LMap>
          </div>

          <!-- Map legend -->
          <div class="px-4 py-3 bg-[#f8fafc] border-t border-[#e2e8f0]">
            <div class="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-[#64748b]">
              <span class="font-medium text-[#475569]">Легенда:</span>
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-[#22c55e] inline-block"></span>
                <span>Действующий</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-[#9ca3af] inline-block"></span>
                <span>Закрыт</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-[#f97316] inline-block"></span>
                <span>На рекультивации</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Filtered count -->
        <p class="text-sm text-[#94a3b8]">
          Показано на карте: {{ filteredLandfills.length }} из {{ totalCount }}
        </p>
      </template>
    </div>

    <!-- ==================== ADD MODAL ==================== -->
    <Teleport to="body">
      <div
        v-if="showAddModal"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        @click.self="cancelAdd"
      >
        <div class="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <!-- Modal header -->
          <div class="px-6 py-4 border-b border-[#e2e8f0] flex items-center justify-between">
            <h3 class="text-lg font-semibold text-[#1e293b]">Добавить полигон</h3>
            <button
              @click="cancelAdd"
              class="text-[#94a3b8] hover:text-[#64748b] transition-colors"
            >
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Modal body -->
          <div class="p-6 space-y-5">
            <!-- Name -->
            <div>
              <label class="block text-sm font-medium text-[#1e293b] mb-1">
                Название <span class="text-red-500">*</span>
              </label>
              <input
                v-model="newLandfill.name"
                type="text"
                placeholder="Например: Бишкекский санитарный полигон ТБО"
                class="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb] text-sm"
              />
            </div>

            <!-- Type -->
            <div>
              <label class="block text-sm font-medium text-[#1e293b] mb-1">Тип</label>
              <select
                v-model="newLandfill.type"
                class="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb] text-sm bg-white"
              >
                <option value="sanitary">Санитарный полигон</option>
                <option value="unauthorized">Несанкционированная свалка</option>
                <option value="sorting">Мусоросортировочная станция</option>
              </select>
            </div>

            <!-- Location row -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-[#1e293b] mb-1">
                  Регион <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="newLandfill.region"
                  type="text"
                  placeholder="г. Бишкек"
                  class="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb] text-sm"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-[#1e293b] mb-1">Район</label>
                <input
                  v-model="newLandfill.district"
                  type="text"
                  placeholder="Свердловский район"
                  class="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb] text-sm"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-[#1e293b] mb-1">Населённый пункт</label>
                <input
                  v-model="newLandfill.settlement"
                  type="text"
                  placeholder="г. Бишкек"
                  class="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb] text-sm"
                />
              </div>
            </div>

            <!-- Operator -->
            <div>
              <label class="block text-sm font-medium text-[#1e293b] mb-1">Оператор</label>
              <input
                v-model="newLandfill.operator"
                type="text"
                placeholder="МП Тазалык"
                class="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb] text-sm"
              />
            </div>

            <!-- Capacity row -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-[#1e293b] mb-1">
                  Проектная ёмкость, тыс. тонн
                </label>
                <input
                  v-model.number="newLandfill.designCapacity"
                  type="number"
                  min="0"
                  placeholder="5000"
                  class="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb] text-sm"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-[#1e293b] mb-1">
                  Текущий объём, тыс. тонн
                </label>
                <input
                  v-model.number="newLandfill.currentVolume"
                  type="number"
                  min="0"
                  placeholder="0"
                  class="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb] text-sm"
                />
              </div>
            </div>

            <!-- Year row -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-[#1e293b] mb-1">Год открытия</label>
                <input
                  v-model.number="newLandfill.openYear"
                  type="number"
                  min="1950"
                  class="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb] text-sm"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-[#1e293b] mb-1">
                  Срок эксплуатации до
                </label>
                <input
                  v-model.number="newLandfill.expiryYear"
                  type="number"
                  min="2024"
                  max="2100"
                  class="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb] text-sm"
                />
              </div>
            </div>

            <!-- Coordinates -->
            <div>
              <label class="block text-sm font-medium text-[#1e293b] mb-1">Координаты</label>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <input
                    v-model.number="newLandfill.lat"
                    type="number"
                    step="0.0001"
                    placeholder="Широта (42.87)"
                    class="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb] text-sm"
                  />
                </div>
                <div>
                  <input
                    v-model.number="newLandfill.lng"
                    type="number"
                    step="0.0001"
                    placeholder="Долгота (74.59)"
                    class="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb] text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Modal footer -->
          <div class="px-6 py-4 border-t border-[#e2e8f0] flex items-center justify-end gap-3">
            <button
              @click="cancelAdd"
              class="px-4 py-2 text-sm font-medium text-[#64748b] bg-white border border-[#e2e8f0] rounded-lg hover:bg-[#f8fafc] transition-colors"
            >
              Отмена
            </button>
            <button
              @click="saveLandfill"
              :disabled="!isFormValid"
              :class="[
                'px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors',
                isFormValid
                  ? 'bg-[#2563eb] hover:bg-[#1d4ed8]'
                  : 'bg-[#94a3b8] cursor-not-allowed',
              ]"
            >
              Сохранить
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </DashboardLayout>
</template>

<style scoped>
:deep(.custom-marker) {
  background: transparent !important;
  border: none !important;
}
</style>
