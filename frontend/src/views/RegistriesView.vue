<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue'
import 'leaflet/dist/leaflet.css'
import { LMap, LTileLayer, LMarker, LPopup } from '@vue-leaflet/vue-leaflet'
import L from 'leaflet'
import { recyclerStore } from '../stores/recyclers'
import { productGroups } from '../data/product-groups'

// Default map view (whole Kyrgyzstan)
const DEFAULT_CENTER: [number, number] = [41.2044, 74.7661]
const DEFAULT_ZOOM = 7

// Map refs
const mapRef = ref<any>(null)
const mapCenter = ref<[number, number]>([...DEFAULT_CENTER])
const mapZoom = ref(DEFAULT_ZOOM)
const mapReady = ref(false)

// Search on map
const mapSearchQuery = ref('')
const mapSearchResults = ref<MapPoint[]>([])
const showMapSearchResults = ref(false)

// Active tab
type TabType = 'recyclers' | 'reception' | 'landfills'
const activeTab = ref<TabType>('recyclers')

// Highlighted row/marker
const highlightedPointId = ref<number | null>(null)

// Layer types
type LayerType = 'recyclers' | 'reception' | 'landfills' | 'producers'

// Layer visibility (reactive for reliable nested property tracking)
const layerVisibility = reactive<Record<LayerType, boolean>>({
  recyclers: true,
  reception: true,
  landfills: true,
  producers: true,
})

// Map layers config
const layers = computed(() => [
  { id: 'recyclers' as LayerType, name: 'Переработчики', color: '#16A34A', tab: 'recyclers' as TabType },
  { id: 'reception' as LayerType, name: 'Пункты приёма', color: '#2563EB', tab: 'reception' as TabType },
  { id: 'landfills' as LayerType, name: 'Полигоны/свалки', color: '#EA580C', tab: 'landfills' as TabType },
  { id: 'producers' as LayerType, name: 'Производители', color: '#9333EA', tab: null },
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
  status: string
  description?: string
  region?: string
  wasteTypes?: string[]
  workingHours?: string
  licenseNumber?: string
  area?: string
  capacity?: string
  fillLevel?: string
  landfillType?: string
}

// Regions
const regions = [
  'Бишкек', 'Чуйская', 'Ошская', 'Джалал-Абадская',
  'Иссык-Кульская', 'Нарынская', 'Таласская', 'Баткенская'
]

// Waste types for reception points filter
const receptionWasteTypes = [
  'Пластик', 'Бумага/картон', 'Стекло', 'Металл',
  'Электроника', 'Батарейки', 'Шины', 'Текстиль', 'Опасные отходы'
]

// Landfill types
const landfillTypes = ['Санкционированный полигон', 'Несанкционированная свалка']

// ========================
// TEST DATA
// ========================

// Recyclers map points (from store, enriched with coords)
const recyclerCoords: Record<string, { lat: number; lng: number; region: string }> = {
  'ОсОО «ЭкоРесайкл»': { lat: 42.8746, lng: 74.5698, region: 'Бишкек' },
  'ОсОО «ГринТек»': { lat: 42.8432, lng: 74.6123, region: 'Бишкек' },
  'ОсОО «ПластПром»': { lat: 42.8612, lng: 75.0890, region: 'Чуйская' },
  'ОсОО «МеталлРесайкл»': { lat: 42.8923, lng: 74.5234, region: 'Бишкек' },
  'ОсОО «СтеклоПром»': { lat: 42.8412, lng: 75.2856, region: 'Чуйская' },
  'ОсОО «АвтоУтиль»': { lat: 42.8345, lng: 74.5567, region: 'Бишкек' },
  'ОсОО «ТекстильРесайкл»': { lat: 40.5283, lng: 72.7985, region: 'Ошская' },
  'ОсОО «СтройПереработка»': { lat: 42.8234, lng: 74.6345, region: 'Бишкек' },
}

// Reception points
interface ReceptionPointData {
  id: number
  name: string
  lat: number
  lng: number
  address: string
  phone: string
  region: string
  wasteTypes: string[]
  workingHours: string
  status: string
}

const receptionPointsData: ReceptionPointData[] = [
  { id: 101, name: 'ЭкоПункт Бишкек-1', lat: 42.8821, lng: 74.5823, address: 'г. Бишкек, ул. Ахунбаева, 45', phone: '+996 555 12-34-56', region: 'Бишкек', wasteTypes: ['Пластик', 'Бумага/картон', 'Стекло'], workingHours: 'Пн-Сб 9:00-18:00', status: 'active' },
  { id: 102, name: 'Пункт сбора батареек ГринТек', lat: 42.8567, lng: 74.6012, address: 'г. Бишкек, ул. Токтогула, 120', phone: '+996 555 23-45-67', region: 'Бишкек', wasteTypes: ['Батарейки', 'Электроника'], workingHours: 'Пн-Пт 10:00-17:00', status: 'active' },
  { id: 103, name: 'ЭкоПункт Ош', lat: 40.5367, lng: 72.8056, address: 'г. Ош, ул. Ленина, 78', phone: '+996 550 34-56-78', region: 'Ошская', wasteTypes: ['Пластик', 'Металл', 'Стекло'], workingHours: 'Пн-Сб 9:00-17:00', status: 'active' },
  { id: 104, name: 'ЭкоПункт Бишкек-2', lat: 42.8712, lng: 74.5567, address: 'г. Бишкек, ул. Манаса, 57', phone: '+996 555 45-67-89', region: 'Бишкек', wasteTypes: ['Пластик', 'Бумага/картон', 'Металл', 'Стекло'], workingHours: 'Пн-Сб 9:00-18:00', status: 'active' },
  { id: 105, name: 'Пункт приёма шин АвтоЭко', lat: 42.8345, lng: 74.5789, address: 'г. Бишкек, ул. Южная Магистраль, 88', phone: '+996 555 56-78-90', region: 'Бишкек', wasteTypes: ['Шины', 'Металл'], workingHours: 'Пн-Пт 9:00-17:00', status: 'active' },
  { id: 106, name: 'ЭкоПункт Каракол', lat: 42.4823, lng: 78.4012, address: 'г. Каракол, ул. Токтогула, 34', phone: '+996 557 12-34-56', region: 'Иссык-Кульская', wasteTypes: ['Пластик', 'Бумага/картон', 'Стекло'], workingHours: 'Пн-Пт 10:00-17:00', status: 'active' },
  { id: 107, name: 'ЭкоПункт Джалал-Абад', lat: 41.0312, lng: 72.9945, address: 'г. Джалал-Абад, ул. Ленина, 45', phone: '+996 559 12-34-56', region: 'Джалал-Абадская', wasteTypes: ['Пластик', 'Стекло', 'Текстиль'], workingHours: 'Пн-Сб 9:00-17:00', status: 'active' },
  { id: 108, name: 'Пункт опасных отходов Бишкек', lat: 42.8923, lng: 74.6234, address: 'г. Бишкек, ул. Фучика, 12', phone: '+996 555 67-89-01', region: 'Бишкек', wasteTypes: ['Батарейки', 'Электроника', 'Опасные отходы'], workingHours: 'Пн-Пт 10:00-16:00', status: 'active' },
  { id: 109, name: 'ЭкоПункт Нарын', lat: 41.4356, lng: 75.9823, address: 'г. Нарын, ул. Ленина, 89', phone: '+996 556 12-34-56', region: 'Нарынская', wasteTypes: ['Пластик', 'Бумага/картон'], workingHours: 'Пн-Пт 10:00-16:00', status: 'active' },
  { id: 110, name: 'ЭкоПункт Талас', lat: 42.5234, lng: 72.2412, address: 'г. Талас, ул. Сарыгулова, 12', phone: '+996 551 12-34-56', region: 'Таласская', wasteTypes: ['Пластик', 'Стекло', 'Металл'], workingHours: 'Пн-Пт 9:00-17:00', status: 'active' },
]

// Landfills
interface LandfillData {
  id: number
  name: string
  lat: number
  lng: number
  address: string
  phone: string
  region: string
  landfillType: string
  area: string
  capacity: string
  fillLevel: string
  status: string
}

const landfillsData: LandfillData[] = [
  { id: 201, name: 'Полигон ТБО «Бишкек»', lat: 42.9234, lng: 74.4567, address: 'Чуйская обл., с. Ново-Павловка', phone: '+996 312 98-76-54', region: 'Чуйская', landfillType: 'Санкционированный полигон', area: '50 га', capacity: '5 000 000 т', fillLevel: '72%', status: 'active' },
  { id: 202, name: 'Полигон ТБО «Ош»', lat: 40.4923, lng: 72.7456, address: 'Ошская обл., пригород г. Ош', phone: '+996 3222 8-76-54', region: 'Ошская', landfillType: 'Санкционированный полигон', area: '30 га', capacity: '2 500 000 т', fillLevel: '65%', status: 'active' },
  { id: 203, name: 'Полигон ТБО «Джалал-Абад»', lat: 41.0567, lng: 72.9567, address: 'Джалал-Абадская обл.', phone: '+996 3722 7-65-43', region: 'Джалал-Абадская', landfillType: 'Санкционированный полигон', area: '20 га', capacity: '1 500 000 т', fillLevel: '58%', status: 'active' },
  { id: 204, name: 'Полигон ТБО «Каракол»', lat: 42.4567, lng: 78.4234, address: 'Иссык-Кульская обл.', phone: '+996 3922 6-54-32', region: 'Иссык-Кульская', landfillType: 'Санкционированный полигон', area: '15 га', capacity: '800 000 т', fillLevel: '91%', status: 'full' },
  { id: 205, name: 'Свалка «Токмок»', lat: 42.8567, lng: 75.3123, address: 'Чуйская обл., г. Токмок', phone: '+996 3138 4-32-10', region: 'Чуйская', landfillType: 'Несанкционированная свалка', area: '8 га', capacity: '—', fillLevel: '—', status: 'unauthorized' },
  { id: 206, name: 'Полигон ТБО «Нарын»', lat: 41.4012, lng: 76.0123, address: 'Нарынская обл.', phone: '+996 3522 5-43-21', region: 'Нарынская', landfillType: 'Санкционированный полигон', area: '12 га', capacity: '600 000 т', fillLevel: '45%', status: 'active' },
  { id: 207, name: 'Полигон ТБО «Талас» (закрыт)', lat: 42.4923, lng: 72.2678, address: 'Таласская обл.', phone: '+996 3422 3-21-09', region: 'Таласская', landfillType: 'Санкционированный полигон', area: '10 га', capacity: '500 000 т', fillLevel: '100%', status: 'closed' },
]

// Producers (more data for proper count)
const producersPoints: MapPoint[] = [
  { id: 301, type: 'producers', name: 'ОсОО «Кока-Кола Бишкек Ботлерс»', lat: 42.8345, lng: 74.5567, address: 'г. Бишкек, ул. Фучика, 14/1', phone: '+996 312 54-32-10', status: 'active', description: 'Производство напитков' },
  { id: 302, type: 'producers', name: 'ОАО «Бишкексут»', lat: 42.8567, lng: 74.5234, address: 'г. Бишкек, ул. Фрунзе, 480', phone: '+996 312 43-21-09', status: 'active', description: 'Молочная продукция' },
  { id: 303, type: 'producers', name: 'ОсОО «Шоро»', lat: 42.8789, lng: 74.5890, address: 'г. Бишкек, ул. Ибраимова, 29', phone: '+996 312 32-10-98', status: 'active', description: 'Производство напитков' },
  { id: 304, type: 'producers', name: 'ОсОО «Арпа»', lat: 42.8123, lng: 74.6012, address: 'г. Бишкек, ул. Льва Толстого, 36', phone: '+996 312 21-09-87', status: 'active', description: 'Пивоваренная компания' },
  { id: 305, type: 'producers', name: 'ОсОО «Акун»', lat: 40.5123, lng: 72.8234, address: 'г. Ош, ул. Исакова, 45', phone: '+996 3222 1-98-76', status: 'active', description: 'Молочная продукция' },
  { id: 306, type: 'producers', name: 'ОАО «Кыргызский текстиль»', lat: 42.8456, lng: 74.6234, address: 'г. Бишкек, ул. Жибек Жолу, 498', phone: '+996 312 10-98-76', status: 'active', description: 'Текстильное производство' },
  { id: 307, type: 'producers', name: 'ОсОО «ЭНЕРГОПРОМ»', lat: 42.8678, lng: 74.5012, address: 'г. Бишкек, ул. Сухэ-Батора, 5', phone: '+996 312 09-87-65', status: 'active', description: 'Электротехника' },
  { id: 308, type: 'producers', name: 'ОсОО «Интергласс»', lat: 42.8234, lng: 75.2789, address: 'г. Токмок, ул. Промышленная, 25', phone: '+996 3138 8-76-54', status: 'active', description: 'Стекольное производство' },
  { id: 309, type: 'producers', name: 'ОАО «Кантский цементный завод»', lat: 42.8923, lng: 74.8456, address: 'г. Кант, ул. Заводская, 1', phone: '+996 3132 2-34-56', status: 'active', description: 'Производство цемента' },
  { id: 310, type: 'producers', name: 'ОсОО «Южный пластик»', lat: 40.5345, lng: 72.7789, address: 'г. Ош, ул. Промышленная, 12', phone: '+996 3222 3-45-67', status: 'active', description: 'Пластиковая тара' },
]

// ========================
// COMPUTED DATA
// ========================

const recyclerTableData = computed(() => {
  return recyclerStore.getActiveRecyclers().map(r => {
    const coords = recyclerCoords[r.name] || { lat: 42.87, lng: 74.59, region: 'Бишкек' }
    return {
      id: r.id,
      type: 'recyclers' as LayerType,
      name: r.name,
      inn: r.inn,
      lat: coords.lat,
      lng: coords.lng,
      address: r.address,
      phone: r.contactPhone,
      region: coords.region,
      wasteTypes: r.wasteTypes,
      licenseNumber: r.licenseNumber,
      licenseExpiry: r.licenseExpiry,
      status: 'active',
    }
  })
})

// All map points
const allMapPoints = computed<MapPoint[]>(() => {
  const recyclerPoints: MapPoint[] = recyclerTableData.value.map(r => ({
    id: r.id, type: 'recyclers' as LayerType, name: r.name, lat: r.lat, lng: r.lng,
    address: r.address, phone: r.phone, status: r.status, region: r.region,
    wasteTypes: r.wasteTypes, licenseNumber: r.licenseNumber,
  }))

  const recPoints: MapPoint[] = receptionPointsData.map(p => ({
    id: p.id, type: 'reception' as LayerType, name: p.name, lat: p.lat, lng: p.lng,
    address: p.address, phone: p.phone, status: p.status, region: p.region,
    wasteTypes: p.wasteTypes, workingHours: p.workingHours,
  }))

  const landfillPoints: MapPoint[] = landfillsData.map(l => ({
    id: l.id, type: 'landfills' as LayerType, name: l.name, lat: l.lat, lng: l.lng,
    address: l.address, phone: l.phone, status: l.status, region: l.region,
    landfillType: l.landfillType, area: l.area, capacity: l.capacity, fillLevel: l.fillLevel,
  }))

  return [...recyclerPoints, ...recPoints, ...landfillPoints, ...producersPoints]
})

// Visible points (filtered by layer visibility)
const visiblePoints = computed(() => {
  return allMapPoints.value.filter(p => layerVisibility[p.type])
})

// Counts by type
const countByType = computed(() => ({
  recyclers: recyclerTableData.value.length,
  reception: receptionPointsData.length,
  landfills: landfillsData.length,
  producers: producersPoints.length,
  total: recyclerTableData.value.length + receptionPointsData.length + landfillsData.length + producersPoints.length,
}))

// ========================
// FILTERS
// ========================

const recyclerSearch = ref('')
const recyclerWasteFilter = ref<string[]>([])
const recyclerRegionFilter = ref('')
const showRecyclerWasteDropdown = ref(false)

const receptionSearch = ref('')
const receptionWasteFilter = ref<string[]>([])
const receptionRegionFilter = ref('')
const showReceptionWasteDropdown = ref(false)

const landfillSearch = ref('')
const landfillTypeFilter = ref('')
const landfillRegionFilter = ref('')

const getWasteGroupLabel = (groupValue: string) => {
  const group = productGroups.find(g => g.value === groupValue)
  if (!group) return groupValue
  const short = group.label.replace(/^\d+\.\s*/, '')
  return short.length > 35 ? short.slice(0, 35) + '...' : short
}

const filteredRecyclers = computed(() => {
  let result = recyclerTableData.value
  if (recyclerSearch.value.trim()) {
    const q = recyclerSearch.value.toLowerCase()
    result = result.filter(r => r.name.toLowerCase().includes(q) || r.inn.includes(q))
  }
  if (recyclerWasteFilter.value.length > 0) {
    result = result.filter(r => recyclerWasteFilter.value.some(wt => r.wasteTypes.includes(wt)))
  }
  if (recyclerRegionFilter.value) {
    result = result.filter(r => r.region === recyclerRegionFilter.value)
  }
  return result
})

const filteredReceptionPoints = computed(() => {
  let result = [...receptionPointsData]
  if (receptionSearch.value.trim()) {
    const q = receptionSearch.value.toLowerCase()
    result = result.filter(p => p.name.toLowerCase().includes(q))
  }
  if (receptionWasteFilter.value.length > 0) {
    result = result.filter(p => receptionWasteFilter.value.some(wt => p.wasteTypes.includes(wt)))
  }
  if (receptionRegionFilter.value) {
    result = result.filter(p => p.region === receptionRegionFilter.value)
  }
  return result
})

const filteredLandfills = computed(() => {
  let result = [...landfillsData]
  if (landfillSearch.value.trim()) {
    const q = landfillSearch.value.toLowerCase()
    result = result.filter(l => l.name.toLowerCase().includes(q))
  }
  if (landfillTypeFilter.value) {
    result = result.filter(l => l.landfillType === landfillTypeFilter.value)
  }
  if (landfillRegionFilter.value) {
    result = result.filter(l => l.region === landfillRegionFilter.value)
  }
  return result
})

// Filtered IDs for map highlighting
const filteredPointIds = computed(() => {
  const ids = new Set<number>()
  if (activeTab.value === 'recyclers') {
    filteredRecyclers.value.forEach(r => ids.add(r.id))
  } else if (activeTab.value === 'reception') {
    filteredReceptionPoints.value.forEach(p => ids.add(p.id))
  } else {
    filteredLandfills.value.forEach(l => ids.add(l.id))
  }
  return ids
})

// ========================
// MARKER ICONS
// ========================

const createIcon = (color: string, size: number = 28) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${color};
      width: ${size}px;
      height: ${size}px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 2px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.35);
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  })
}

const createHighlightedIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${color};
      width: 36px;
      height: 36px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 4px solid #fbbf24;
      box-shadow: 0 0 12px rgba(251,191,36,0.6), 0 2px 8px rgba(0,0,0,0.3);
      transition: all 0.2s;
    "></div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  })
}

const tabToLayerType: Record<TabType, LayerType> = {
  recyclers: 'recyclers',
  reception: 'reception',
  landfills: 'landfills',
}

const getMarkerIcon = (point: MapPoint) => {
  const layer = layers.value.find(l => l.id === point.type)
  const color = layer?.color || '#666'

  if (point.id === highlightedPointId.value) return createHighlightedIcon(color)
  return createIcon(color, 28)
}

// ========================
// STATUS HELPERS
// ========================

const getStatusInfo = (status: string) => {
  switch (status) {
    case 'active': return { label: 'Действующий', color: 'bg-green-100 text-green-700' }
    case 'full': return { label: 'Заполнен', color: 'bg-orange-100 text-orange-700' }
    case 'closed': return { label: 'Закрыт', color: 'bg-red-100 text-red-700' }
    case 'unauthorized': return { label: 'Несанкционированный', color: 'bg-gray-200 text-gray-600' }
    case 'inactive': return { label: 'Неактивен', color: 'bg-gray-100 text-gray-700' }
    case 'pending': return { label: 'На проверке', color: 'bg-yellow-100 text-yellow-700' }
    default: return { label: status, color: 'bg-gray-100 text-gray-700' }
  }
}

const getTypeLabel = (type: LayerType) => {
  return layers.value.find(l => l.id === type)?.name || type
}

const getTypeBadgeClass = (type: LayerType) => {
  switch (type) {
    case 'recyclers': return 'bg-green-100 text-green-700'
    case 'reception': return 'bg-blue-100 text-blue-700'
    case 'landfills': return 'bg-orange-100 text-orange-700'
    case 'producers': return 'bg-purple-100 text-purple-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

// ========================
// MAP CONTROLS
// ========================

const getLeafletMap = (): L.Map | null => {
  if (!mapRef.value) return null
  // vue-leaflet exposes leafletObject
  return (mapRef.value as any).leafletObject || null
}

const onMapReady = () => {
  mapReady.value = true
  const map = getLeafletMap()
  if (map) {
    map.scrollWheelZoom.disable()
  }
}

// Reset map to full Kyrgyzstan view
const resetMapView = () => {
  const map = getLeafletMap()
  if (map) {
    map.flyTo(DEFAULT_CENTER, DEFAULT_ZOOM, { duration: 1 })
  } else {
    mapCenter.value = [...DEFAULT_CENTER]
    mapZoom.value = DEFAULT_ZOOM
  }
}

// Geolocate user
const locateUser = () => {
  if (!navigator.geolocation) return
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const map = getLeafletMap()
      if (map) {
        map.flyTo([pos.coords.latitude, pos.coords.longitude], 12, { duration: 1.5 })
      } else {
        mapCenter.value = [pos.coords.latitude, pos.coords.longitude]
        mapZoom.value = 12
      }
    },
    () => { /* silently fail if denied */ }
  )
}

// flyTo helper
const flyToPoint = (lat: number, lng: number, zoom = 14) => {
  const map = getLeafletMap()
  if (map) {
    map.flyTo([lat, lng], zoom, { duration: 1 })
  } else {
    mapCenter.value = [lat, lng]
    mapZoom.value = zoom
  }
}

// ========================
// MAP INTERACTIONS
// ========================

const performMapSearch = () => {
  if (!mapSearchQuery.value.trim()) {
    mapSearchResults.value = []
    showMapSearchResults.value = false
    return
  }
  const query = mapSearchQuery.value.toLowerCase()
  mapSearchResults.value = allMapPoints.value.filter(p =>
    p.name.toLowerCase().includes(query) || p.address.toLowerCase().includes(query)
  ).slice(0, 10)
  showMapSearchResults.value = mapSearchResults.value.length > 0
}

watch(mapSearchQuery, performMapSearch)

const goToPointFromSearch = (point: MapPoint) => {
  flyToPoint(point.lat, point.lng)
  showMapSearchResults.value = false
  mapSearchQuery.value = point.name
  highlightedPointId.value = point.id
  if (point.type === 'recyclers' || point.type === 'reception' || point.type === 'landfills') {
    activeTab.value = point.type
  }
  // Ensure layer is visible
  if (!layerVisibility[point.type]) {
    layerVisibility[point.type] = true
  }
}

// Table row click -> fly to point
const onTableRowClick = (point: { id: number; lat: number; lng: number }) => {
  flyToPoint(point.lat, point.lng)
  highlightedPointId.value = point.id
  // Scroll map into view
  const mapEl = document.getElementById('map-section')
  if (mapEl) {
    mapEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const onTableRowHover = (id: number | null) => {
  highlightedPointId.value = id
}

// Map marker click -> highlight table row
const onMarkerClick = (point: MapPoint) => {
  highlightedPointId.value = point.id
  if (point.type === 'recyclers' || point.type === 'reception' || point.type === 'landfills') {
    if (activeTab.value !== point.type) {
      activeTab.value = point.type
    }
  }
  nextTick(() => {
    const row = document.getElementById(`row-${point.id}`)
    if (row) {
      row.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  })
}

// ========================
// LAYER CONTROLS
// ========================

const toggleLayerCheckbox = (layerId: LayerType) => {
  layerVisibility[layerId] = !layerVisibility[layerId]
}

// Click on layer name -> show ONLY this type, switch tab
const selectLayerExclusive = (layerId: LayerType) => {
  // Set all to false, then enable only this one
  ;(Object.keys(layerVisibility) as LayerType[]).forEach(k => {
    layerVisibility[k] = k === layerId
  })
  // Switch tab if this type has a corresponding tab
  const layer = layers.value.find(l => l.id === layerId)
  if (layer && layer.tab) {
    activeTab.value = layer.tab
  }
}

// Toggle waste filter item
const toggleWasteFilter = (list: typeof recyclerWasteFilter, value: string) => {
  const idx = list.value.indexOf(value)
  if (idx >= 0) list.value.splice(idx, 1)
  else list.value.push(value)
}

const closeDropdowns = () => {
  showRecyclerWasteDropdown.value = false
  showReceptionWasteDropdown.value = false
}

// Expanded waste types toggle for table rows
const expandedWasteRows = reactive(new Set<number>())
const toggleExpandedWaste = (id: number, event: Event) => {
  event.stopPropagation()
  if (expandedWasteRows.has(id)) {
    expandedWasteRows.delete(id)
  } else {
    expandedWasteRows.add(id)
  }
}
</script>

<template>
  <div class="pt-10 pb-6 lg:pt-[60px] lg:pb-8" @click="closeDropdowns">
    <!-- Page header -->
    <div class="container-main">
      <h1 class="text-2xl md:text-[28px] lg:text-[30px] font-bold text-[#415861] uppercase mb-2 lg:mb-[12px]">
        ГИС-Карта
      </h1>
      <p class="text-base md:text-lg lg:text-[20px] font-medium text-[#415861]">
        Интерактивная карта объектов обращения с отходами Кыргызской Республики
      </p>
    </div>

    <!-- Map section (full width with overlay panels) -->
    <div id="map-section" class="container-main pt-6 lg:pt-[30px]">
      <div class="relative rounded-xl overflow-hidden shadow-sm border border-gray-200 h-[420px] lg:h-[550px]">
            <LMap
              ref="mapRef"
              :zoom="mapZoom"
              :center="mapCenter"
              :use-global-leaflet="false"
              :options="{ scrollWheelZoom: false, zoomControl: false }"
              class="h-full w-full z-0"
              @ready="onMapReady"
              @update:zoom="mapZoom = $event"
              @update:center="(c: any) => { mapCenter = [c.lat, c.lng] }"
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
                :icon="getMarkerIcon(point)"
                @click="onMarkerClick(point)"
              >
                <LPopup :options="{ maxWidth: 320, className: 'custom-popup' }">
                  <div class="min-w-[260px]">
                    <!-- Popup header -->
                    <div class="flex items-start justify-between mb-3">
                      <h4 class="font-bold text-gray-900 text-[14px] pr-2 leading-tight">{{ point.name }}</h4>
                      <span :class="['px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap', getTypeBadgeClass(point.type)]">
                        {{ getTypeLabel(point.type) }}
                      </span>
                    </div>

                    <!-- Status -->
                    <div class="mb-3">
                      <span :class="['px-2 py-0.5 rounded-full text-[11px] font-medium', getStatusInfo(point.status).color]">
                        {{ getStatusInfo(point.status).label }}
                      </span>
                    </div>

                    <!-- Popup body by type -->
                    <div class="space-y-2 text-[12px]">
                      <!-- Recyclers popup -->
                      <template v-if="point.type === 'recyclers'">
                        <div v-if="point.wasteTypes && point.wasteTypes.length" class="flex flex-wrap gap-1 mb-1">
                          <span v-for="wt in point.wasteTypes" :key="wt"
                            class="px-1.5 py-0.5 bg-green-50 text-green-700 rounded text-[10px]">
                            {{ getWasteGroupLabel(wt) }}
                          </span>
                        </div>
                        <p v-if="point.licenseNumber" class="flex gap-2">
                          <span class="text-gray-400 flex-shrink-0">Лицензия:</span>
                          <span class="text-gray-700">{{ point.licenseNumber }}</span>
                        </p>
                      </template>

                      <!-- Reception points popup -->
                      <template v-if="point.type === 'reception'">
                        <div v-if="point.wasteTypes && point.wasteTypes.length" class="flex flex-wrap gap-1 mb-1">
                          <span v-for="wt in point.wasteTypes" :key="wt"
                            class="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px]">
                            {{ wt }}
                          </span>
                        </div>
                        <p v-if="point.workingHours" class="flex gap-2">
                          <span class="text-gray-400 flex-shrink-0">Режим работы:</span>
                          <span class="text-gray-700">{{ point.workingHours }}</span>
                        </p>
                      </template>

                      <!-- Landfills popup -->
                      <template v-if="point.type === 'landfills'">
                        <p v-if="point.landfillType" class="flex gap-2">
                          <span class="text-gray-400 flex-shrink-0">Тип:</span>
                          <span class="text-gray-700">{{ point.landfillType }}</span>
                        </p>
                        <p v-if="point.area" class="flex gap-2">
                          <span class="text-gray-400 flex-shrink-0">Площадь:</span>
                          <span class="text-gray-700">{{ point.area }}</span>
                        </p>
                      </template>

                      <!-- Producers popup -->
                      <template v-if="point.type === 'producers'">
                        <p v-if="point.description" class="flex gap-2">
                          <span class="text-gray-400 flex-shrink-0">Продукция:</span>
                          <span class="text-gray-700">{{ point.description }}</span>
                        </p>
                      </template>

                      <!-- Common: address, phone -->
                      <p class="flex gap-2">
                        <span class="text-gray-400 flex-shrink-0">Адрес:</span>
                        <span class="text-gray-700">{{ point.address }}</span>
                      </p>
                      <p class="flex gap-2">
                        <span class="text-gray-400 flex-shrink-0">Телефон:</span>
                        <span class="text-gray-700">{{ point.phone }}</span>
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
                  v-model="mapSearchQuery"
                  type="text"
                  placeholder="Поиск на карте..."
                  class="w-full pl-10 pr-4 py-2.5 bg-white border-0 rounded-lg shadow-md focus:ring-2 focus:ring-[#0e888d] text-sm"
                  @focus="showMapSearchResults = mapSearchResults.length > 0"
                />
              </div>
              <div
                v-if="showMapSearchResults"
                class="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-64 overflow-y-auto"
              >
                <div
                  v-for="result in mapSearchResults"
                  :key="result.id"
                  @click="goToPointFromSearch(result)"
                  class="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                >
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full flex-shrink-0" :style="{ backgroundColor: layers.find(l => l.id === result.type)?.color }"></div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-gray-900 truncate">{{ result.name }}</p>
                      <p class="text-xs text-gray-500 truncate">{{ result.address }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Map control buttons (right side) -->
            <div class="absolute top-4 right-4 lg:right-[248px] z-[1000] flex flex-col gap-2">
              <!-- Zoom In -->
              <button
                @click="getLeafletMap()?.zoomIn()"
                class="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center text-gray-700 hover:bg-gray-50 hover:text-[#0e888d] transition-colors text-xl font-bold"
                title="Приблизить"
              >+</button>
              <!-- Zoom Out -->
              <button
                @click="getLeafletMap()?.zoomOut()"
                class="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center text-gray-700 hover:bg-gray-50 hover:text-[#0e888d] transition-colors text-xl font-bold"
                title="Отдалить"
              >-</button>
              <!-- Divider -->
              <div class="h-px bg-gray-200 mx-1"></div>
              <!-- Reset view -->
              <button
                @click="resetMapView"
                class="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-[#0e888d] transition-colors"
                title="Показать всю карту"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </button>
              <!-- Geolocation -->
              <button
                @click="locateUser"
                class="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-[#0e888d] transition-colors"
                title="Где я"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>

            <!-- Layers panel overlay (desktop) -->
            <div class="absolute top-4 right-4 z-[1000] hidden lg:block" @click.stop
              style="width: 220px; background: rgba(255,255,255,0.95); backdrop-filter: blur(8px); border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.12); padding: 16px;">
              <h3 class="font-bold text-[#415861] text-[14px] mb-3">Слои карты</h3>
              <div class="space-y-1.5">
                <div v-for="layer in layers" :key="layer.id"
                  class="flex items-center gap-2">
                  <input type="checkbox" :checked="layerVisibility[layer.id]"
                    @change.stop="toggleLayerCheckbox(layer.id)"
                    class="w-3.5 h-3.5 text-[#0e888d] border-gray-300 rounded focus:ring-[#0e888d] cursor-pointer" />
                  <div class="w-3 h-3 rounded-full flex-shrink-0" :style="{ backgroundColor: layer.color }"></div>
                  <span @click.stop="selectLayerExclusive(layer.id)"
                    :class="['text-[13px] font-medium cursor-pointer hover:underline flex-1', layerVisibility[layer.id] ? 'text-[#415861]' : 'text-gray-400']">
                    {{ layer.name }}
                  </span>
                  <span :class="['text-[11px] px-1.5 py-0.5 rounded-full font-medium', layerVisibility[layer.id] ? 'bg-[#0e888d] text-white' : 'bg-gray-200 text-gray-500']">
                    {{ countByType[layer.id] }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Summary panel overlay (desktop) -->
            <div class="absolute bottom-4 right-4 z-[1000] hidden lg:block"
              style="width: 220px; background: rgba(255,255,255,0.95); backdrop-filter: blur(8px); border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.12); padding: 16px;">
              <div class="flex items-center justify-between mb-2">
                <span class="text-[13px] text-gray-500">Всего объектов</span>
                <span class="font-bold text-[#415861] text-[15px]">{{ countByType.total }}</span>
              </div>
              <div class="space-y-1.5">
                <div v-for="layer in layers" :key="layer.id" class="flex items-center justify-between">
                  <div class="flex items-center gap-1.5">
                    <div class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: layer.color }"></div>
                    <span class="text-[12px] text-gray-500">{{ layer.name }}</span>
                  </div>
                  <span class="text-[13px] font-semibold" :style="{ color: layer.color }">{{ countByType[layer.id] }}</span>
                </div>
              </div>
              <p class="text-[11px] text-gray-400 mt-3 pt-2 border-t border-gray-200/60 leading-tight">
                Только организации с актуальными лицензиями и разрешениями
              </p>
            </div>
      </div>

      <!-- Mobile legend (below map, visible on small screens) -->
      <div class="lg:hidden flex flex-wrap gap-2 mt-3">
        <label v-for="layer in layers" :key="layer.id"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] cursor-pointer transition-colors"
          :class="layerVisibility[layer.id] ? 'bg-[#e8f5f5] text-[#415861]' : 'bg-gray-100 text-gray-400'">
          <input type="checkbox" :checked="layerVisibility[layer.id]" @change="toggleLayerCheckbox(layer.id)"
            class="w-3.5 h-3.5 text-[#0e888d] border-gray-300 rounded focus:ring-[#0e888d]" />
          <span class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: layer.color }"></span>
          {{ layer.name }}
          <span class="text-[11px] font-medium ml-0.5">({{ countByType[layer.id] }})</span>
        </label>
      </div>
    </div>

    <!-- Registry block under map -->
    <div class="container-main pt-5 lg:pt-6">
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <!-- Registry header -->
        <div class="px-6 pt-6 pb-4 border-b border-gray-100">
          <h2 class="text-xl md:text-2xl font-bold text-[#415861] mb-4">Реестр объектов</h2>

          <!-- Tabs -->
          <div class="flex flex-wrap gap-3">
            <button
              @click="activeTab = 'recyclers'"
              :class="[
                'flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200',
                activeTab === 'recyclers'
                  ? 'bg-green-50 text-green-700 ring-2 ring-green-300 shadow-sm'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              ]"
            >
              <span class="w-3 h-3 rounded-full bg-green-500"></span>
              Переработчики
              <span :class="['text-xs px-2 py-0.5 rounded-full', activeTab === 'recyclers' ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-600']">
                {{ countByType.recyclers }}
              </span>
            </button>

            <button
              @click="activeTab = 'reception'"
              :class="[
                'flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200',
                activeTab === 'reception'
                  ? 'bg-blue-50 text-blue-700 ring-2 ring-blue-300 shadow-sm'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              ]"
            >
              <span class="w-3 h-3 rounded-full bg-blue-500"></span>
              Пункты приёма
              <span :class="['text-xs px-2 py-0.5 rounded-full', activeTab === 'reception' ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-600']">
                {{ countByType.reception }}
              </span>
            </button>

            <button
              @click="activeTab = 'landfills'"
              :class="[
                'flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200',
                activeTab === 'landfills'
                  ? 'bg-orange-50 text-orange-700 ring-2 ring-orange-300 shadow-sm'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              ]"
            >
              <span class="w-3 h-3 rounded-full bg-orange-500"></span>
              Полигоны/свалки
              <span :class="['text-xs px-2 py-0.5 rounded-full', activeTab === 'landfills' ? 'bg-orange-200 text-orange-800' : 'bg-gray-200 text-gray-600']">
                {{ countByType.landfills }}
              </span>
            </button>
          </div>
        </div>

        <!-- ============ TAB: RECYCLERS ============ -->
        <div v-if="activeTab === 'recyclers'" class="p-6">
          <div class="flex flex-col md:flex-row gap-3 mb-6">
            <div class="relative flex-1">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input v-model="recyclerSearch" type="text" placeholder="Поиск по наименованию или ИНН..."
                class="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0e888d] focus:border-transparent" />
            </div>
            <div class="relative" @click.stop>
              <button @click="showRecyclerWasteDropdown = !showRecyclerWasteDropdown"
                class="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-100 min-w-[220px]">
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span class="truncate">{{ recyclerWasteFilter.length > 0 ? `Выбрано: ${recyclerWasteFilter.length}` : 'Что перерабатывает' }}</span>
                <svg class="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
              </button>
              <div v-if="showRecyclerWasteDropdown" class="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 w-80 max-h-72 overflow-y-auto">
                <div class="p-2">
                  <label v-for="group in productGroups" :key="group.value" class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer text-sm">
                    <input type="checkbox" :checked="recyclerWasteFilter.includes(group.value)" @change="toggleWasteFilter(recyclerWasteFilter, group.value)"
                      class="w-4 h-4 text-[#0e888d] border-gray-300 rounded focus:ring-[#0e888d]" />
                    <span class="text-gray-700 truncate">{{ group.label }}</span>
                  </label>
                </div>
                <div v-if="recyclerWasteFilter.length > 0" class="border-t border-gray-100 p-2">
                  <button @click="recyclerWasteFilter = []" class="text-xs text-red-500 hover:text-red-700 px-3 py-1">Сбросить фильтр</button>
                </div>
              </div>
            </div>
            <select v-model="recyclerRegionFilter" class="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 focus:ring-2 focus:ring-[#0e888d] min-w-[180px]">
              <option value="">Все регионы</option>
              <option v-for="region in regions" :key="region" :value="region">{{ region }}</option>
            </select>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-[14px]">
              <thead>
                <tr class="border-b border-gray-200 bg-gray-50">
                  <th class="text-left py-3 px-4 font-semibold text-gray-500 text-[14px] min-w-[200px]">Наименование</th>
                  <th class="text-left py-3 px-4 font-semibold text-gray-500 text-[14px]">Виды отходов</th>
                  <th class="text-left py-3 px-4 font-semibold text-gray-500 text-[14px] min-w-[120px] whitespace-nowrap">Лицензия</th>
                  <th class="text-left py-3 px-4 font-semibold text-gray-500 text-[14px] min-w-[100px] whitespace-nowrap">Регион</th>
                  <th class="text-left py-3 px-4 font-semibold text-gray-500 text-[14px] min-w-[180px]">Адрес</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="recycler in filteredRecyclers" :key="recycler.id" :id="`row-${recycler.id}`"
                  @click="onTableRowClick(recycler)" @mouseenter="onTableRowHover(recycler.id)" @mouseleave="onTableRowHover(null)"
                  :class="['border-b border-gray-100 cursor-pointer transition-colors duration-150 min-h-[48px]', highlightedPointId === recycler.id ? 'bg-green-50' : 'hover:bg-[#f0fdf4]']">
                  <td class="py-3 px-4 min-w-[200px]">
                    <div class="font-medium text-[#415861] leading-snug">{{ recycler.name }}</div>
                    <div class="text-[12px] text-gray-400 mt-0.5">ИНН: {{ recycler.inn }}</div>
                  </td>
                  <td class="py-3 px-4">
                    <div class="flex flex-wrap gap-1">
                      <template v-if="expandedWasteRows.has(recycler.id)">
                        <span v-for="wt in recycler.wasteTypes" :key="wt"
                          class="inline-block px-2 py-0.5 bg-green-50 text-green-700 rounded-md text-[12px]" :title="getWasteGroupLabel(wt)">
                          {{ getWasteGroupLabel(wt) }}
                        </span>
                        <span @click="toggleExpandedWaste(recycler.id, $event)"
                          class="inline-block px-2 py-0.5 bg-gray-200 text-gray-600 rounded-md text-[12px] cursor-pointer hover:bg-gray-300 transition-colors">
                          Свернуть
                        </span>
                      </template>
                      <template v-else>
                        <span v-for="wt in recycler.wasteTypes.slice(0, 3)" :key="wt"
                          class="inline-block px-2 py-0.5 bg-green-50 text-green-700 rounded-md text-[12px]" :title="getWasteGroupLabel(wt)">
                          {{ getWasteGroupLabel(wt) }}
                        </span>
                        <span v-if="recycler.wasteTypes.length > 3"
                          @click="toggleExpandedWaste(recycler.id, $event)"
                          class="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-[12px] cursor-pointer hover:bg-gray-300 transition-colors">
                          +{{ recycler.wasteTypes.length - 3 }}
                        </span>
                      </template>
                    </div>
                  </td>
                  <td class="py-3 px-4 text-gray-600 whitespace-nowrap">{{ recycler.licenseNumber }}</td>
                  <td class="py-3 px-4 text-gray-600 whitespace-nowrap">{{ recycler.region }}</td>
                  <td class="py-3 px-4 text-gray-600 min-w-[180px] leading-relaxed">{{ recycler.address }}</td>
                </tr>
              </tbody>
            </table>
            <div v-if="filteredRecyclers.length === 0" class="py-12 text-center text-gray-400 text-[14px]">Ничего не найдено по заданным фильтрам</div>
          </div>
        </div>

        <!-- ============ TAB: RECEPTION POINTS ============ -->
        <div v-if="activeTab === 'reception'" class="p-6">
          <div class="flex flex-col md:flex-row gap-3 mb-6">
            <div class="relative flex-1">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input v-model="receptionSearch" type="text" placeholder="Поиск по наименованию..."
                class="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0e888d] focus:border-transparent" />
            </div>
            <div class="relative" @click.stop>
              <button @click="showReceptionWasteDropdown = !showReceptionWasteDropdown"
                class="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-100 min-w-[220px]">
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span class="truncate">{{ receptionWasteFilter.length > 0 ? `Выбрано: ${receptionWasteFilter.length}` : 'Принимаемые отходы' }}</span>
                <svg class="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
              </button>
              <div v-if="showReceptionWasteDropdown" class="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 w-72 max-h-72 overflow-y-auto">
                <div class="p-2">
                  <label v-for="wt in receptionWasteTypes" :key="wt" class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer text-sm">
                    <input type="checkbox" :checked="receptionWasteFilter.includes(wt)" @change="toggleWasteFilter(receptionWasteFilter, wt)"
                      class="w-4 h-4 text-[#0e888d] border-gray-300 rounded focus:ring-[#0e888d]" />
                    <span class="text-gray-700">{{ wt }}</span>
                  </label>
                </div>
                <div v-if="receptionWasteFilter.length > 0" class="border-t border-gray-100 p-2">
                  <button @click="receptionWasteFilter = []" class="text-xs text-red-500 hover:text-red-700 px-3 py-1">Сбросить фильтр</button>
                </div>
              </div>
            </div>
            <select v-model="receptionRegionFilter" class="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 focus:ring-2 focus:ring-[#0e888d] min-w-[180px]">
              <option value="">Все регионы</option>
              <option v-for="region in regions" :key="region" :value="region">{{ region }}</option>
            </select>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-[14px]">
              <thead>
                <tr class="border-b border-gray-200 bg-gray-50">
                  <th class="text-left py-3 px-4 font-semibold text-gray-500 text-[14px] min-w-[200px]">Наименование</th>
                  <th class="text-left py-3 px-4 font-semibold text-gray-500 text-[14px]">Принимаемые отходы</th>
                  <th class="text-left py-3 px-4 font-semibold text-gray-500 text-[14px] whitespace-nowrap">Режим работы</th>
                  <th class="text-left py-3 px-4 font-semibold text-gray-500 text-[14px] min-w-[100px] whitespace-nowrap">Регион</th>
                  <th class="text-left py-3 px-4 font-semibold text-gray-500 text-[14px] min-w-[180px]">Адрес</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="point in filteredReceptionPoints" :key="point.id" :id="`row-${point.id}`"
                  @click="onTableRowClick({ id: point.id, lat: point.lat, lng: point.lng })"
                  @mouseenter="onTableRowHover(point.id)" @mouseleave="onTableRowHover(null)"
                  :class="['border-b border-gray-100 cursor-pointer transition-colors duration-150 min-h-[48px]', highlightedPointId === point.id ? 'bg-blue-50' : 'hover:bg-[#eff6ff]']">
                  <td class="py-3 px-4 font-medium text-[#415861] min-w-[200px] leading-snug">{{ point.name }}</td>
                  <td class="py-3 px-4">
                    <div class="flex flex-wrap gap-1">
                      <template v-if="expandedWasteRows.has(point.id)">
                        <span v-for="wt in point.wasteTypes" :key="wt" class="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[12px]">{{ wt }}</span>
                        <span @click="toggleExpandedWaste(point.id, $event)"
                          class="inline-block px-2 py-0.5 bg-gray-200 text-gray-600 rounded-md text-[12px] cursor-pointer hover:bg-gray-300 transition-colors">
                          Свернуть
                        </span>
                      </template>
                      <template v-else>
                        <span v-for="wt in point.wasteTypes.slice(0, 3)" :key="wt" class="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[12px]">{{ wt }}</span>
                        <span v-if="point.wasteTypes.length > 3"
                          @click="toggleExpandedWaste(point.id, $event)"
                          class="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-[12px] cursor-pointer hover:bg-gray-300 transition-colors">
                          +{{ point.wasteTypes.length - 3 }}
                        </span>
                      </template>
                    </div>
                  </td>
                  <td class="py-3 px-4 text-gray-600 whitespace-nowrap">{{ point.workingHours }}</td>
                  <td class="py-3 px-4 text-gray-600 whitespace-nowrap">{{ point.region }}</td>
                  <td class="py-3 px-4 text-gray-600 min-w-[180px] leading-relaxed">{{ point.address }}</td>
                </tr>
              </tbody>
            </table>
            <div v-if="filteredReceptionPoints.length === 0" class="py-12 text-center text-gray-400 text-[14px]">Ничего не найдено по заданным фильтрам</div>
          </div>
        </div>

        <!-- ============ TAB: LANDFILLS ============ -->
        <div v-if="activeTab === 'landfills'" class="p-6">
          <div class="flex flex-col md:flex-row gap-3 mb-6">
            <div class="relative flex-1">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input v-model="landfillSearch" type="text" placeholder="Поиск по наименованию..."
                class="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0e888d] focus:border-transparent" />
            </div>
            <select v-model="landfillTypeFilter" class="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 focus:ring-2 focus:ring-[#0e888d] min-w-[260px]">
              <option value="">Все типы</option>
              <option v-for="lt in landfillTypes" :key="lt" :value="lt">{{ lt }}</option>
            </select>
            <select v-model="landfillRegionFilter" class="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 focus:ring-2 focus:ring-[#0e888d] min-w-[180px]">
              <option value="">Все регионы</option>
              <option v-for="region in regions" :key="region" :value="region">{{ region }}</option>
            </select>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-[14px]">
              <thead>
                <tr class="border-b border-gray-200 bg-gray-50">
                  <th class="text-left py-3 px-4 font-semibold text-gray-500 text-[14px] min-w-[200px]">Наименование</th>
                  <th class="text-left py-3 px-4 font-semibold text-gray-500 text-[14px] min-w-[160px]">Тип</th>
                  <th class="text-left py-3 px-4 font-semibold text-gray-500 text-[14px] whitespace-nowrap">Площадь</th>
                  <th class="text-left py-3 px-4 font-semibold text-gray-500 text-[14px] whitespace-nowrap">Вместимость</th>
                  <th class="text-left py-3 px-4 font-semibold text-gray-500 text-[14px] whitespace-nowrap">Заполненность</th>
                  <th class="text-left py-3 px-4 font-semibold text-gray-500 text-[14px] min-w-[100px] whitespace-nowrap">Регион</th>
                  <th class="text-left py-3 px-4 font-semibold text-gray-500 text-[14px] whitespace-nowrap">Статус</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="landfill in filteredLandfills" :key="landfill.id" :id="`row-${landfill.id}`"
                  @click="onTableRowClick({ id: landfill.id, lat: landfill.lat, lng: landfill.lng })"
                  @mouseenter="onTableRowHover(landfill.id)" @mouseleave="onTableRowHover(null)"
                  :class="['border-b border-gray-100 cursor-pointer transition-colors duration-150 min-h-[48px]', highlightedPointId === landfill.id ? 'bg-orange-50' : 'hover:bg-[#fff7ed]']">
                  <td class="py-3 px-4 font-medium text-[#415861] min-w-[200px] leading-snug">{{ landfill.name }}</td>
                  <td class="py-3 px-4 text-gray-600 min-w-[160px]">{{ landfill.landfillType }}</td>
                  <td class="py-3 px-4 text-gray-600 whitespace-nowrap">{{ landfill.area }}</td>
                  <td class="py-3 px-4 text-gray-600 whitespace-nowrap">{{ landfill.capacity }}</td>
                  <td class="py-3 px-4">
                    <div v-if="landfill.fillLevel !== '—'" class="flex items-center gap-2">
                      <div class="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div class="h-full rounded-full transition-all"
                          :class="{
                            'bg-green-500': parseInt(landfill.fillLevel) < 60,
                            'bg-yellow-500': parseInt(landfill.fillLevel) >= 60 && parseInt(landfill.fillLevel) < 80,
                            'bg-orange-500': parseInt(landfill.fillLevel) >= 80 && parseInt(landfill.fillLevel) < 95,
                            'bg-red-500': parseInt(landfill.fillLevel) >= 95,
                          }"
                          :style="{ width: landfill.fillLevel }"></div>
                      </div>
                      <span class="text-[13px] text-gray-600">{{ landfill.fillLevel }}</span>
                    </div>
                    <span v-else class="text-gray-400">—</span>
                  </td>
                  <td class="py-3 px-4 text-gray-600 whitespace-nowrap">{{ landfill.region }}</td>
                  <td class="py-3 px-4">
                    <span :class="['px-2.5 py-1 rounded-full text-[12px] font-medium whitespace-nowrap', getStatusInfo(landfill.status).color]">
                      {{ getStatusInfo(landfill.status).label }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-if="filteredLandfills.length === 0" class="py-12 text-center text-gray-400 text-[14px]">Ничего не найдено по заданным фильтрам</div>
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

/* Hide default Leaflet zoom control */
.leaflet-control-zoom {
  display: none !important;
}

/* Leaflet popup styling */
.leaflet-popup-content-wrapper {
  border-radius: 16px !important;
  padding: 0 !important;
  box-shadow: 0 8px 30px rgba(0,0,0,0.12) !important;
  border: 1px solid rgba(0,0,0,0.06) !important;
}

.leaflet-popup-content {
  margin: 16px 18px !important;
  font-family: inherit !important;
}

.leaflet-popup-close-button {
  top: 10px !important;
  right: 10px !important;
  color: #9ca3af !important;
  font-size: 20px !important;
}

.leaflet-popup-close-button:hover {
  color: #374151 !important;
}

.leaflet-popup-tip {
  box-shadow: 0 4px 10px rgba(0,0,0,0.1) !important;
}
</style>
