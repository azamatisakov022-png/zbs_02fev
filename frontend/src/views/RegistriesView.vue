<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import 'leaflet/dist/leaflet.css'
import { LMap, LTileLayer, LMarker, LPopup } from '@vue-leaflet/vue-leaflet'
import L from 'leaflet'

// Map center - Kyrgyzstan
const mapCenter = ref<[number, number]>([41.2, 74.7])
const mapZoom = ref(7)

// Search
const searchQuery = ref('')
const searchResults = ref<MapPoint[]>([])
const showSearchResults = ref(false)

// Layer types
type LayerType = 'recyclers' | 'reception' | 'landfills' | 'producers'

// Map layers
const layers = ref<{ id: LayerType; name: string; icon: string; visible: boolean; color: string }[]>([
  { id: 'recyclers', name: 'Переработчики', icon: '♻️', visible: true, color: '#22c55e' },
  { id: 'reception', name: 'Пункты приёма', icon: '📍', visible: true, color: '#3b82f6' },
  { id: 'landfills', name: 'Полигоны/свалки', icon: '🏭', visible: true, color: '#f97316' },
  { id: 'producers', name: 'Производители', icon: '🏢', visible: true, color: '#a855f7' },
])

// Map point interface
interface MapPoint {
  id: number
  type: LayerType
  name: string
  lat: number
  lng: number
  address: string
  phone: string
  status: 'active' | 'inactive' | 'pending'
  description?: string
}

// Test data - Recyclers (green) - 12 points
const recyclers: MapPoint[] = [
  { id: 1, type: 'recyclers', name: 'ОсОО «ЭкоПереработка»', lat: 42.8746, lng: 74.5698, address: 'г. Бишкек, ул. Жибек Жолу, 555', phone: '+996 312 45-67-89', status: 'active' },
  { id: 2, type: 'recyclers', name: 'ОсОО «СтеклоРесурс»', lat: 42.8432, lng: 74.6123, address: 'г. Бишкек, ул. Фрунзе, 123', phone: '+996 312 34-56-78', status: 'active' },
  { id: 3, type: 'recyclers', name: 'ОсОО «ПластикТех»', lat: 42.8612, lng: 74.5890, address: 'г. Бишкек, ул. Токтогула, 89', phone: '+996 312 23-45-67', status: 'active' },
  { id: 4, type: 'recyclers', name: 'ОсОО «Ош-Ресайкл»', lat: 40.5283, lng: 72.7985, address: 'г. Ош, ул. Курманжан Датки, 45', phone: '+996 3222 5-12-34', status: 'active' },
  { id: 5, type: 'recyclers', name: 'ОсОО «ЮжПереработка»', lat: 40.5412, lng: 72.8123, address: 'г. Ош, ул. Ленина, 78', phone: '+996 3222 4-56-78', status: 'active' },
  { id: 6, type: 'recyclers', name: 'ОсОО «Джалал-Эко»', lat: 41.0387, lng: 73.0012, address: 'г. Джалал-Абад, ул. Токтогула, 56', phone: '+996 3722 2-34-56', status: 'active' },
  { id: 7, type: 'recyclers', name: 'ОсОО «Иссык-Куль Ресурс»', lat: 42.4901, lng: 78.3923, address: 'г. Каракол, ул. Гебзе, 23', phone: '+996 3922 5-67-89', status: 'active' },
  { id: 8, type: 'recyclers', name: 'ОсОО «ТокмокПласт»', lat: 42.8412, lng: 75.2856, address: 'г. Токмок, ул. Промышленная, 12', phone: '+996 3138 2-12-34', status: 'pending' },
  { id: 9, type: 'recyclers', name: 'ОсОО «НарынЭко»', lat: 41.4287, lng: 75.9912, address: 'г. Нарын, ул. Ленина, 45', phone: '+996 3522 5-23-45', status: 'active' },
  { id: 10, type: 'recyclers', name: 'ОсОО «МеталлРесурс»', lat: 42.8923, lng: 74.5234, address: 'г. Бишкек, ул. Ахунбаева, 156', phone: '+996 312 56-78-90', status: 'active' },
  { id: 11, type: 'recyclers', name: 'ОсОО «БумагаТех»', lat: 42.8234, lng: 74.6345, address: 'г. Бишкек, ул. Московская, 234', phone: '+996 312 67-89-01', status: 'inactive' },
  { id: 12, type: 'recyclers', name: 'ОсОО «Талас-Ресайкл»', lat: 42.5187, lng: 72.2356, address: 'г. Талас, ул. Бердике Баатыра, 12', phone: '+996 3422 5-34-56', status: 'active' },
]

// Test data - Reception points (blue) - 18 points
const receptionPoints: MapPoint[] = [
  { id: 101, type: 'reception', name: 'Пункт приёма №1', lat: 42.8821, lng: 74.5823, address: 'г. Бишкек, ул. Киевская, 45', phone: '+996 555 12-34-56', status: 'active' },
  { id: 102, type: 'reception', name: 'Пункт приёма №2', lat: 42.8567, lng: 74.6012, address: 'г. Бишкек, ул. Боконбаева, 78', phone: '+996 555 23-45-67', status: 'active' },
  { id: 103, type: 'reception', name: 'Пункт приёма №3', lat: 42.8712, lng: 74.5567, address: 'г. Бишкек, ул. Исанова, 34', phone: '+996 555 34-56-78', status: 'active' },
  { id: 104, type: 'reception', name: 'Пункт приёма №4', lat: 42.8345, lng: 74.5789, address: 'г. Бишкек, ул. Тыныстанова, 56', phone: '+996 555 45-67-89', status: 'active' },
  { id: 105, type: 'reception', name: 'Пункт приёма №5', lat: 42.8923, lng: 74.6234, address: 'г. Бишкек, ул. Манаса, 123', phone: '+996 555 56-78-90', status: 'active' },
  { id: 106, type: 'reception', name: 'Пункт приёма №6', lat: 42.8456, lng: 74.5345, address: 'г. Бишкек, мкр. Джал, 45', phone: '+996 555 67-89-01', status: 'active' },
  { id: 107, type: 'reception', name: 'Пункт приёма №7', lat: 42.8789, lng: 74.6456, address: 'г. Бишкек, мкр. Аламедин, 78', phone: '+996 555 78-90-12', status: 'pending' },
  { id: 108, type: 'reception', name: 'Пункт приёма №8', lat: 42.8234, lng: 74.5123, address: 'г. Бишкек, ул. Ахунбаева, 89', phone: '+996 555 89-01-23', status: 'active' },
  { id: 109, type: 'reception', name: 'Пункт приёма Ош-1', lat: 40.5367, lng: 72.8056, address: 'г. Ош, ул. Масалиева, 23', phone: '+996 550 12-34-56', status: 'active' },
  { id: 110, type: 'reception', name: 'Пункт приёма Ош-2', lat: 40.5189, lng: 72.7834, address: 'г. Ош, ул. Навои, 45', phone: '+996 550 23-45-67', status: 'active' },
  { id: 111, type: 'reception', name: 'Пункт приёма Ош-3', lat: 40.5456, lng: 72.8178, address: 'г. Ош, ул. Раззакова, 67', phone: '+996 550 34-56-78', status: 'active' },
  { id: 112, type: 'reception', name: 'Пункт приёма Ош-4', lat: 40.5234, lng: 72.7923, address: 'г. Ош, мкр. Черёмушки, 12', phone: '+996 550 45-67-89', status: 'inactive' },
  { id: 113, type: 'reception', name: 'Пункт приёма Каракол', lat: 42.4823, lng: 78.4012, address: 'г. Каракол, ул. Токтогула, 34', phone: '+996 557 12-34-56', status: 'active' },
  { id: 114, type: 'reception', name: 'Пункт приёма Токмок', lat: 42.8356, lng: 75.2967, address: 'г. Токмок, ул. Ленина, 56', phone: '+996 558 12-34-56', status: 'active' },
  { id: 115, type: 'reception', name: 'Пункт приёма Джалал-Абад', lat: 41.0312, lng: 72.9945, address: 'г. Джалал-Абад, ул. Ленина, 78', phone: '+996 559 12-34-56', status: 'active' },
  { id: 116, type: 'reception', name: 'Пункт приёма Нарын', lat: 41.4356, lng: 75.9823, address: 'г. Нарын, ул. Ленина, 89', phone: '+996 556 12-34-56', status: 'active' },
  { id: 117, type: 'reception', name: 'Пункт приёма Талас', lat: 42.5234, lng: 72.2412, address: 'г. Талас, ул. Сарыгулова, 12', phone: '+996 551 12-34-56', status: 'active' },
  { id: 118, type: 'reception', name: 'Пункт приёма Баткен', lat: 40.0623, lng: 70.8234, address: 'г. Баткен, ул. Ленина, 23', phone: '+996 552 12-34-56', status: 'pending' },
]

// Test data - Landfills (orange) - 7 points
const landfills: MapPoint[] = [
  { id: 201, type: 'landfills', name: 'Полигон ТБО «Бишкек»', lat: 42.9234, lng: 74.4567, address: 'Чуйская обл., с. Ново-Павловка', phone: '+996 312 98-76-54', status: 'active', description: 'Основной полигон г. Бишкек' },
  { id: 202, type: 'landfills', name: 'Полигон ТБО «Ош»', lat: 40.4923, lng: 72.7456, address: 'Ошская обл., пригород г. Ош', phone: '+996 3222 8-76-54', status: 'active', description: 'Основной полигон г. Ош' },
  { id: 203, type: 'landfills', name: 'Полигон ТБО «Джалал-Абад»', lat: 41.0567, lng: 72.9567, address: 'Джалал-Абадская обл.', phone: '+996 3722 7-65-43', status: 'active', description: 'Региональный полигон' },
  { id: 204, type: 'landfills', name: 'Полигон ТБО «Каракол»', lat: 42.4567, lng: 78.4234, address: 'Иссык-Кульская обл.', phone: '+996 3922 6-54-32', status: 'pending', description: 'На реконструкции' },
  { id: 205, type: 'landfills', name: 'Полигон ТБО «Нарын»', lat: 41.4012, lng: 76.0123, address: 'Нарынская обл.', phone: '+996 3522 5-43-21', status: 'active', description: 'Региональный полигон' },
  { id: 206, type: 'landfills', name: 'Свалка «Токмок» (закрытая)', lat: 42.8567, lng: 75.3123, address: 'Чуйская обл., г. Токмок', phone: '+996 3138 4-32-10', status: 'inactive', description: 'Закрыта, рекультивация' },
  { id: 207, type: 'landfills', name: 'Полигон ТБО «Талас»', lat: 42.4923, lng: 72.2678, address: 'Таласская обл.', phone: '+996 3422 3-21-09', status: 'active', description: 'Региональный полигон' },
]

// Test data - Producers (purple) - 10 points
const producers: MapPoint[] = [
  { id: 301, type: 'producers', name: 'ОсОО «Кока-Кола Бишкек Ботлерс»', lat: 42.8345, lng: 74.5567, address: 'г. Бишкек, ул. Фучика, 14/1', phone: '+996 312 54-32-10', status: 'active', description: 'Производство напитков' },
  { id: 302, type: 'producers', name: 'ОАО «Бишкексут»', lat: 42.8567, lng: 74.5234, address: 'г. Бишкек, ул. Фрунзе, 480', phone: '+996 312 43-21-09', status: 'active', description: 'Молочная продукция' },
  { id: 303, type: 'producers', name: 'ОсОО «Шоро»', lat: 42.8789, lng: 74.5890, address: 'г. Бишкек, ул. Ибраимова, 29', phone: '+996 312 32-10-98', status: 'active', description: 'Производство напитков' },
  { id: 304, type: 'producers', name: 'ОсОО «Арпа»', lat: 42.8123, lng: 74.6012, address: 'г. Бишкек, ул. Льва Толстого, 36', phone: '+996 312 21-09-87', status: 'active', description: 'Пивоваренная компания' },
  { id: 305, type: 'producers', name: 'ОсОО «Акун»', lat: 40.5123, lng: 72.8234, address: 'г. Ош, ул. Исакова, 45', phone: '+996 3222 1-98-76', status: 'active', description: 'Молочная продукция' },
  { id: 306, type: 'producers', name: 'ОАО «Кыргызский текстиль»', lat: 42.8456, lng: 74.6234, address: 'г. Бишкек, ул. Жибек Жолу, 498', phone: '+996 312 10-98-76', status: 'active', description: 'Текстильное производство' },
  { id: 307, type: 'producers', name: 'ОсОО «ЭНЕРГОПРОМ»', lat: 42.8678, lng: 74.5012, address: 'г. Бишкек, ул. Сухэ-Батора, 5', phone: '+996 312 09-87-65', status: 'pending', description: 'Электротехника' },
  { id: 308, type: 'producers', name: 'ОсОО «Интергласс»', lat: 42.8234, lng: 75.2789, address: 'г. Токмок, ул. Промышленная, 25', phone: '+996 3138 8-76-54', status: 'active', description: 'Стекольное производство' },
  { id: 309, type: 'producers', name: 'ОАО «Кантский цементный завод»', lat: 42.8923, lng: 74.8456, address: 'г. Кант, ул. Заводская, 1', phone: '+996 3132 2-34-56', status: 'active', description: 'Производство цемента' },
  { id: 310, type: 'producers', name: 'ОсОО «Южный пластик»', lat: 40.5345, lng: 72.7789, address: 'г. Ош, ул. Промышленная, 12', phone: '+996 3222 3-45-67', status: 'active', description: 'Пластиковая тара' },
]

// All points
const allPoints = computed<MapPoint[]>(() => [
  ...recyclers,
  ...receptionPoints,
  ...landfills,
  ...producers,
])

// Filtered points based on layer visibility
const visiblePoints = computed(() => {
  return allPoints.value.filter(point => {
    const layer = layers.value.find(l => l.id === point.type)
    return layer?.visible
  })
})

// Custom icon factory
const createIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${color};
      width: 28px;
      height: 28px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid white;
      box-shadow: 0 2px 5px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  })
}

// Icons by type
const getMarkerIcon = (type: LayerType) => {
  const layer = layers.value.find(l => l.id === type)
  return createIcon(layer?.color || '#666')
}

// Status label and color
const getStatusInfo = (status: string) => {
  switch (status) {
    case 'active': return { label: 'Активен', color: 'bg-green-100 text-green-700' }
    case 'inactive': return { label: 'Неактивен', color: 'bg-gray-100 text-gray-700' }
    case 'pending': return { label: 'На проверке', color: 'bg-yellow-100 text-yellow-700' }
    default: return { label: 'Неизвестно', color: 'bg-gray-100 text-gray-700' }
  }
}

// Type label
const getTypeLabel = (type: LayerType) => {
  const layer = layers.value.find(l => l.id === type)
  return layer?.name || type
}

// Toggle layer visibility
const toggleLayer = (layerId: LayerType) => {
  const layer = layers.value.find(l => l.id === layerId)
  if (layer) layer.visible = !layer.visible
}

// Search functionality
const performSearch = () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    showSearchResults.value = false
    return
  }

  const query = searchQuery.value.toLowerCase()
  searchResults.value = allPoints.value.filter(point =>
    point.name.toLowerCase().includes(query) ||
    point.address.toLowerCase().includes(query)
  ).slice(0, 10)
  showSearchResults.value = searchResults.value.length > 0
}

// Go to point on map
const goToPoint = (point: MapPoint) => {
  mapCenter.value = [point.lat, point.lng]
  mapZoom.value = 14
  showSearchResults.value = false
  searchQuery.value = point.name

  // Make sure the layer is visible
  const layer = layers.value.find(l => l.id === point.type)
  if (layer && !layer.visible) {
    layer.visible = true
  }
}

// Watch search query
watch(searchQuery, () => {
  performSearch()
})

// Count by type
const countByType = computed(() => ({
  recyclers: recyclers.length,
  reception: receptionPoints.length,
  landfills: landfills.length,
  producers: producers.length,
  total: allPoints.value.length,
}))
</script>

<template>
  <div class="py-10 lg:py-[60px]">
    <!-- Page header -->
    <div class="container-main">
      <h1 class="text-2xl md:text-[28px] lg:text-[30px] font-bold text-[#415861] uppercase mb-2 lg:mb-[12px]">
        ГИС-Карта
      </h1>
      <p class="text-base md:text-lg lg:text-[20px] font-medium text-[#415861]">
        Интерактивная карта объектов обращения с отходами Кыргызской Республики
      </p>
    </div>

    <!-- Map section -->
    <div class="container-main pt-6 lg:pt-[30px]">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- Map Area -->
        <div class="lg:col-span-3">
          <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="relative h-[400px] lg:h-[550px]">
              <!-- Leaflet Map -->
              <LMap
                :zoom="mapZoom"
                :center="mapCenter"
                :use-global-leaflet="false"
                class="h-full w-full z-0"
              >
                <LTileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  layer-type="base"
                  name="OpenStreetMap"
                />

                <!-- Markers -->
                <LMarker
                  v-for="point in visiblePoints"
                  :key="point.id"
                  :lat-lng="[point.lat, point.lng]"
                  :icon="getMarkerIcon(point.type)"
                >
                  <LPopup :options="{ maxWidth: 300 }">
                    <div class="min-w-[250px]">
                      <div class="flex items-start justify-between mb-2">
                        <h4 class="font-semibold text-gray-900 text-sm pr-2">{{ point.name }}</h4>
                        <span :class="['px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap', getStatusInfo(point.status).color]">
                          {{ getStatusInfo(point.status).label }}
                        </span>
                      </div>
                      <div class="space-y-1.5 text-xs">
                        <p class="flex items-start gap-2">
                          <span class="text-gray-400 flex-shrink-0">Тип:</span>
                          <span class="text-gray-700">{{ getTypeLabel(point.type) }}</span>
                        </p>
                        <p class="flex items-start gap-2">
                          <span class="text-gray-400 flex-shrink-0">Адрес:</span>
                          <span class="text-gray-700">{{ point.address }}</span>
                        </p>
                        <p class="flex items-start gap-2">
                          <span class="text-gray-400 flex-shrink-0">Телефон:</span>
                          <span class="text-gray-700">{{ point.phone }}</span>
                        </p>
                        <p v-if="point.description" class="flex items-start gap-2">
                          <span class="text-gray-400 flex-shrink-0">Описание:</span>
                          <span class="text-gray-700">{{ point.description }}</span>
                        </p>
                      </div>
                    </div>
                  </LPopup>
                </LMarker>
              </LMap>

              <!-- Search overlay -->
              <div class="absolute top-4 left-4 w-72 z-[1000]" @click.stop>
                <div class="relative">
                  <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="Поиск на карте..."
                    class="w-full pl-10 pr-4 py-2.5 bg-white border-0 rounded-lg shadow-md focus:ring-2 focus:ring-[#0e888d]"
                    @focus="showSearchResults = searchResults.length > 0"
                  />
                </div>

                <!-- Search results dropdown -->
                <div
                  v-if="showSearchResults"
                  class="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-64 overflow-y-auto"
                >
                  <div
                    v-for="result in searchResults"
                    :key="result.id"
                    @click="goToPoint(result)"
                    class="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                  >
                    <div class="flex items-center gap-2">
                      <div
                        class="w-3 h-3 rounded-full flex-shrink-0"
                        :style="{ backgroundColor: layers.find(l => l.id === result.type)?.color }"
                      ></div>
                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-gray-900 truncate">{{ result.name }}</p>
                        <p class="text-xs text-gray-500 truncate">{{ result.address }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Legend overlay -->
              <div class="absolute bottom-4 left-4 bg-white rounded-lg shadow-md p-3 z-[1000]">
                <p class="text-xs font-semibold text-gray-700 mb-2">Легенда</p>
                <div class="space-y-1.5">
                  <div v-for="layer in layers" :key="layer.id" class="flex items-center gap-2">
                    <div class="w-4 h-4 rounded-full" :style="{ backgroundColor: layer.color }"></div>
                    <span class="text-xs text-gray-600">{{ layer.name }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-4">
          <!-- Layers -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h3 class="font-semibold text-[#415861] mb-4">Слои карты</h3>
            <div class="space-y-3">
              <label
                v-for="layer in layers"
                :key="layer.id"
                class="flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors"
                :class="layer.visible ? 'bg-[#e8f5f5]' : 'bg-gray-50 hover:bg-gray-100'"
              >
                <div class="flex items-center gap-3">
                  <input
                    type="checkbox"
                    :checked="layer.visible"
                    @change="toggleLayer(layer.id)"
                    class="w-4 h-4 text-[#0e888d] border-gray-300 rounded focus:ring-[#0e888d]"
                  />
                  <div
                    class="w-4 h-4 rounded-full"
                    :style="{ backgroundColor: layer.color }"
                  ></div>
                  <span class="text-sm font-medium" :class="layer.visible ? 'text-[#415861]' : 'text-gray-500'">{{ layer.name }}</span>
                </div>
                <span class="text-xs px-2 py-1 rounded-full" :class="layer.visible ? 'bg-[#0e888d] text-white' : 'bg-gray-200 text-gray-600'">
                  {{ layer.id === 'recyclers' ? countByType.recyclers :
                     layer.id === 'reception' ? countByType.reception :
                     layer.id === 'landfills' ? countByType.landfills :
                     countByType.producers }}
                </span>
              </label>
            </div>
          </div>

          <!-- Quick Stats -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h3 class="font-semibold text-[#415861] mb-4">Сводка</h3>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-500">Всего объектов</span>
                <span class="font-bold text-[#415861]">{{ countByType.total }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-500">Переработчиков</span>
                <span class="font-bold text-green-600">{{ countByType.recyclers }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-500">Пунктов приёма</span>
                <span class="font-bold text-blue-600">{{ countByType.reception }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-500">Полигонов</span>
                <span class="font-bold text-orange-600">{{ countByType.landfills }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-500">Производителей</span>
                <span class="font-bold text-purple-600">{{ countByType.producers }}</span>
              </div>
            </div>
          </div>

          <!-- Info block -->
          <div class="bg-[#e8f5f5] rounded-xl p-4">
            <div class="flex items-start gap-3">
              <div class="w-8 h-8 bg-[#0e888d] rounded-full flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-[#415861] mb-1">Публичные данные</p>
                <p class="text-xs text-[#70868f]">
                  На карте отображаются только организации с актуальными лицензиями и разрешениями
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
/* Fix for Leaflet markers */
.custom-marker {
  background: transparent !important;
  border: none !important;
}

/* Leaflet popup styling */
.leaflet-popup-content-wrapper {
  border-radius: 12px;
  padding: 0;
}

.leaflet-popup-content {
  margin: 12px 14px;
}

.leaflet-popup-close-button {
  top: 8px !important;
  right: 8px !important;
}
</style>
