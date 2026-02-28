<script setup lang="ts">
import { ref, shallowRef, computed, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

const { t } = useI18n()

interface ReceptionPoint {
  id: number
  name: string
  address: string
  phone: string
  materials: string[]
  region: string
  coordinates: [number, number] // [lng, lat]
}

// Map instance
let map: maplibregl.Map | null = null
const mapContainer = ref<HTMLElement>()
const markers = shallowRef<maplibregl.Marker[]>([])

// Filters
const selectedWasteType = ref('')
const selectedRegion = ref('')

const wasteTypes = computed(() => [
  { value: '', label: t('receptionPoints.allTypes') },
  { value: 'plastic', label: t('receptionPoints.plastic') },
  { value: 'paper', label: t('receptionPoints.paper') },
  { value: 'glass', label: t('receptionPoints.glass') },
  { value: 'metal', label: t('receptionPoints.metal') },
  { value: 'batteries', label: t('receptionPoints.batteries') },
  { value: 'electronics', label: t('receptionPoints.electronics') }
])

const regions = computed(() => [
  { value: '', label: t('receptionPoints.allRegions') },
  { value: 'bishkek', label: t('receptionPoints.regionBishkek') },
  { value: 'chui', label: t('receptionPoints.regionChui') },
  { value: 'osh', label: t('receptionPoints.regionOsh') },
  { value: 'jalal-abad', label: t('receptionPoints.regionJalalAbad') },
  { value: 'batken', label: t('receptionPoints.regionBatken') },
  { value: 'naryn', label: t('receptionPoints.regionNaryn') },
  { value: 'talas', label: t('receptionPoints.regionTalas') },
  { value: 'issyk-kul', label: t('receptionPoints.regionIssykKul') }
])

// Region centers for map navigation
const regionCenters: Record<string, { center: [number, number], zoom: number }> = {
  'bishkek': { center: [74.5698, 42.8746], zoom: 12 },
  'chui': { center: [74.8, 42.9], zoom: 9 },
  'osh': { center: [72.7985, 40.5283], zoom: 12 },
  'jalal-abad': { center: [73.0, 41.0], zoom: 9 },
  'batken': { center: [70.8194, 40.0628], zoom: 10 },
  'naryn': { center: [76.0, 41.4], zoom: 9 },
  'talas': { center: [72.2427, 42.5186], zoom: 10 },
  'issyk-kul': { center: [77.0, 42.4], zoom: 9 }
}

// Sample data with real coordinates
const receptionPoints: ReceptionPoint[] = [
  { id: 1, name: 'ЭкоСбор-1', address: 'г. Бишкек, ул. Ахунбаева, 123', phone: '+996 312 123 456', materials: ['Пластик', 'Стекло', 'Металл'], region: 'bishkek', coordinates: [74.5872, 42.8465] },
  { id: 2, name: 'Чистый город', address: 'г. Бишкек, ул. Московская, 45', phone: '+996 312 654 321', materials: ['Пластик', 'Бумага'], region: 'bishkek', coordinates: [74.5921, 42.8712] },
  { id: 3, name: 'Второсырьё Ош', address: 'г. Ош, ул. Курманжан Датка, 78', phone: '+996 322 456 789', materials: ['Стекло', 'Металл'], region: 'osh', coordinates: [72.7985, 40.5283] },
  { id: 4, name: 'Нарын-Эко', address: 'г. Нарын, ул. Ленина, 56', phone: '+996 352 234 567', materials: ['Пластик', 'Батарейки'], region: 'naryn', coordinates: [75.9911, 41.4287] },
  { id: 5, name: 'ЭкоПункт Чуй', address: 'г. Токмок, ул. Садовая, 56', phone: '+996 312 789 012', materials: ['Пластик', 'Бумага', 'Стекло'], region: 'chui', coordinates: [75.3014, 42.8421] },
  { id: 6, name: 'Зелёный Баткен', address: 'г. Баткен, ул. Мира, 34', phone: '+996 362 345 678', materials: ['Металл', 'Батарейки'], region: 'batken', coordinates: [70.8194, 40.0628] },
  { id: 7, name: 'ЭкоТалас', address: 'г. Талас, ул. Манаса, 89', phone: '+996 342 901 234', materials: ['Пластик', 'Стекло'], region: 'talas', coordinates: [72.2427, 42.5186] },
  { id: 8, name: 'Иссык-Куль Рециклинг', address: 'г. Каракол, ул. Токтогула, 67', phone: '+996 392 567 890', materials: ['Бумага', 'Металл', 'Батарейки'], region: 'issyk-kul', coordinates: [78.3936, 42.4907] },
  { id: 9, name: 'ЭкоСбор-2', address: 'г. Бишкек, ул. Жибек Жолу, 234', phone: '+996 312 111 222', materials: ['Электроника', 'Батарейки'], region: 'bishkek', coordinates: [74.6142, 42.8801] },
  { id: 10, name: 'Чистый город-2', address: 'г. Бишкек, пр. Манаса, 78', phone: '+996 312 333 444', materials: ['Пластик', 'Металл', 'Стекло'], region: 'bishkek', coordinates: [74.5534, 42.8623] },
  { id: 11, name: 'Второсырьё Ош-2', address: 'г. Ош, ул. Навои, 45', phone: '+996 322 555 666', materials: ['Бумага', 'Пластик'], region: 'osh', coordinates: [72.8123, 40.5156] },
  { id: 12, name: 'Нарын-Эко-2', address: 'г. Нарын, ул. Орозбекова, 23', phone: '+996 352 777 888', materials: ['Стекло', 'Металл', 'Бумага'], region: 'naryn', coordinates: [75.9782, 41.4352] },
  { id: 13, name: 'ЭкоПункт Чуй-2', address: 'г. Кант, ул. Центральная, 12', phone: '+996 312 999 000', materials: ['Батарейки', 'Электроника'], region: 'chui', coordinates: [74.8517, 42.8912] },
  { id: 14, name: 'Зелёный Баткен-2', address: 'г. Баткен, ул. Советская, 67', phone: '+996 362 112 233', materials: ['Пластик', 'Бумага', 'Стекло'], region: 'batken', coordinates: [70.8312, 40.0534] },
  { id: 15, name: 'ЭкоТалас-2', address: 'г. Талас, ул. Бейшеналиева, 34', phone: '+996 342 445 556', materials: ['Металл', 'Электроника'], region: 'talas', coordinates: [72.2534, 42.5098] },
  { id: 16, name: 'Иссык-Куль Рециклинг-2', address: 'г. Чолпон-Ата, ул. Советская, 89', phone: '+996 392 667 778', materials: ['Пластик', 'Стекло', 'Бумага'], region: 'issyk-kul', coordinates: [77.0856, 42.6491] },
]

const filteredPoints = computed(() => {
  let result = receptionPoints
  if (selectedRegion.value) {
    result = result.filter(p => p.region === selectedRegion.value)
  }
  return result
})

const totalCount = computed(() => filteredPoints.value.length)

// Update markers when filter changes
const updateMarkers = () => {
  // Remove old markers
  markers.value.forEach(marker => marker.remove())
  markers.value = []

  if (!map) return

  // Add new markers
  filteredPoints.value.forEach(point => {
    const el = document.createElement('div')
    el.className = 'custom-marker'
    el.innerHTML = `
      <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 0C7.16 0 0 7.16 0 16C0 28 16 40 16 40S32 28 32 16C32 7.16 24.84 0 16 0Z" fill="#0e888d"/>
        <circle cx="16" cy="16" r="8" fill="white"/>
      </svg>
    `

    const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
      <div style="font-family: system-ui, sans-serif; padding: 8px;">
        <h3 style="margin: 0 0 8px; font-size: 16px; font-weight: 600; color: #415861;">${point.name}</h3>
        <p style="margin: 0 0 4px; font-size: 13px; color: #666;">${point.address}</p>
        <p style="margin: 0 0 8px; font-size: 13px; color: #666;">${point.phone}</p>
        <div style="display: flex; flex-wrap: wrap; gap: 4px;">
          ${point.materials.map(m => `<span style="background: #e8f5f5; color: #0e888d; padding: 2px 8px; border-radius: 12px; font-size: 11px;">${m}</span>`).join('')}
        </div>
      </div>
    `)

    const marker = new maplibregl.Marker({ element: el })
      .setLngLat(point.coordinates)
      .setPopup(popup)
      .addTo(map!)

    markers.value.push(marker)
  })
}

// Watch for region filter changes
watch(selectedRegion, (newRegion) => {
  updateMarkers()

  if (map && newRegion && regionCenters[newRegion]) {
    map.flyTo({
      center: regionCenters[newRegion].center,
      zoom: regionCenters[newRegion].zoom,
      duration: 1500
    })
  } else if (map && !newRegion) {
    // Reset to show all of Kyrgyzstan
    map.flyTo({
      center: [74.5, 41.5],
      zoom: 6,
      duration: 1500
    })
  }
})

const handleSearch = () => {
  updateMarkers()
}

const handleShowOnMap = (point: ReceptionPoint) => {
  if (map) {
    map.flyTo({
      center: point.coordinates,
      zoom: 15,
      duration: 1500
    })

    // Open the popup for this point
    const marker = markers.value.find((_, index) => filteredPoints.value[index]?.id === point.id)
    if (marker) {
      marker.togglePopup()
    }
  }
}

onMounted(() => {
  if (mapContainer.value) {
    map = new maplibregl.Map({
      container: mapContainer.value,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: [74.5, 41.5], // Center of Kyrgyzstan
      zoom: 6,
      minZoom: 5,
      maxZoom: 18
    })

    map.addControl(new maplibregl.NavigationControl(), 'top-right')
    map.addControl(new maplibregl.FullscreenControl(), 'top-right')

    map.on('load', () => {
      updateMarkers()
    })
  }
})

onUnmounted(() => {
  if (map) {
    map.remove()
    map = null
  }
})
</script>

<template>
  <div class="py-10 lg:py-[60px]">
    <!-- Page header -->
    <div class="container-main">
      <h1 class="text-2xl md:text-[28px] lg:text-[30px] font-bold text-[#415861] uppercase mb-2 lg:mb-[12px]">
        {{ $t('receptionPoints.title') }}
      </h1>
      <p class="text-base md:text-lg lg:text-[20px] font-medium text-[#415861]">
        {{ $t('receptionPoints.subtitle') }}
      </p>
    </div>

    <!-- Map section with filters -->
    <div class="container-main pt-6 lg:pt-[30px]">
      <div class="bg-[#e8f5f5] rounded-[20px] p-5 lg:p-[30px]">
        <!-- Filters row -->
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4 lg:mb-[20px]">
          <h2 class="text-base lg:text-[18px] font-medium text-[#415861]">
            {{ $t('receptionPoints.mapTitle') }}
          </h2>

          <div class="flex flex-col lg:flex-row gap-3 lg:gap-[15px]">
            <!-- Waste type filter -->
            <select
              v-model="selectedWasteType"
              class="px-4 py-2.5 border border-[#e5e5e5] rounded-[10px] text-[#415861] bg-white focus:outline-none focus:border-[#0e888d] text-sm appearance-none cursor-pointer lg:w-[180px]"
            >
              <option v-for="type in wasteTypes" :key="type.value" :value="type.value">
                {{ type.label }}
              </option>
            </select>

            <!-- Region filter -->
            <select
              v-model="selectedRegion"
              class="px-4 py-2.5 border border-[#e5e5e5] rounded-[10px] text-[#415861] bg-white focus:outline-none focus:border-[#0e888d] text-sm appearance-none cursor-pointer lg:w-[180px]"
            >
              <option v-for="region in regions" :key="region.value" :value="region.value">
                {{ region.label }}
              </option>
            </select>

            <!-- Search button -->
            <button
              @click="handleSearch"
              class="bg-[#0e888d] text-white font-medium px-6 py-2.5 rounded-[10px] hover:bg-[#0a6d71] transition-colors text-sm"
            >
              {{ $t('receptionPoints.searchBtn') }}
            </button>
          </div>
        </div>

        <!-- MapLibre Map -->
        <div
          ref="mapContainer"
          class="w-full h-[300px] lg:h-[450px] rounded-[16px] overflow-hidden"
        ></div>
      </div>
    </div>

    <!-- Counter -->
    <div class="container-main pt-6 lg:pt-[30px]">
      <h2 class="text-lg lg:text-[20px] font-bold text-[#415861] uppercase">
        {{ $t('receptionPoints.foundPoints', { count: totalCount }) }}
      </h2>
    </div>

    <!-- Cards grid -->
    <div class="container-main pt-4 lg:pt-[20px]">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-[30px]">
        <div
          v-for="point in filteredPoints"
          :key="point.id"
          class="bg-[#f8fafc] rounded-[30px] p-5 lg:p-[30px] flex flex-col gap-4 lg:gap-[20px]"
        >
          <!-- Name -->
          <h3 class="text-[#415861] text-lg lg:text-[26px] font-medium leading-tight">
            {{ point.name }}
          </h3>

          <!-- Details -->
          <div class="flex flex-col gap-3">
            <!-- Address -->
            <div class="flex items-start gap-3">
              <svg class="w-6 h-6 flex-shrink-0 text-[#0e888d]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              <span class="text-[#415861] text-sm font-medium">{{ point.address }}</span>
            </div>

            <!-- Phone -->
            <div class="flex items-center gap-3">
              <svg class="w-6 h-6 flex-shrink-0 text-[#0e888d]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
              </svg>
              <span class="text-[#415861] text-sm font-medium">{{ point.phone }}</span>
            </div>

            <!-- Materials tags -->
            <div class="flex flex-wrap gap-2">
              <span
                v-for="material in point.materials"
                :key="material"
                class="bg-white border border-[#f4f4f4] rounded-[12px] px-2.5 py-1 text-xs font-medium text-black"
              >
                {{ material }}
              </span>
            </div>
          </div>

          <!-- Button -->
          <button
            @click="handleShowOnMap(point)"
            class="w-full bg-[#0e888d] text-white text-sm font-medium py-2.5 rounded-[12px] hover:bg-[#0a6d71] transition-colors"
          >
            {{ $t('receptionPoints.showOnMap') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.custom-marker {
  cursor: pointer;
  transition: transform 0.2s;
}

.custom-marker:hover {
  transform: scale(1.1);
}

.maplibregl-popup-content {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.maplibregl-popup-close-button {
  font-size: 18px;
  padding: 4px 8px;
}
</style>
