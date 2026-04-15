<script setup lang="ts">
// ════════════════════════════════════════════════════════════════════
// RegistriesView.vue — PUBLIC GIS Map Page (/registries)
// 4 visible layers: Landfills, Recyclers, Reception Points, Dumps
// Left filter panel overlay, grid-based clustering, tables below map
// ════════════════════════════════════════════════════════════════════

import { ref, reactive, computed, watch, nextTick, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import KyrgyzstanCutoutMap, { type CutoutMarker } from '../components/maps/KyrgyzstanCutoutMap.vue'
import { useGisPublicData } from '../composables/useGisPublicData'
import { productGroups, getTranslatedGroupLabel } from '../data/product-groups'

// ═══════════════════════════════════════════════════════════════════════════
// Публичный реестр читает данные через общий composable, который ходит
// на /api/v1/public/* без JWT. Тот же composable использует и ЛК сотрудника
// — гарантия что обе страницы видят одни и те же объекты.
// ═══════════════════════════════════════════════════════════════════════════
// Polling раз в 60 сек — публичная карта автоматически обновляется,
// если сотрудник МПРЭТН добавил/изменил объект в своём ЛК.
const {
  landfills: backendLandfills,
  recyclers: backendRecyclers,
  collectionPoints: backendCollectionPoints,
  dumps: backendDumps,
  error: backendError,
} = useGisPublicData({ pollIntervalMs: 60_000 })

// Приводим visiblePoints к интерфейсу CutoutMarker с краткой description-строкой.
function pointToMarker(p: { id: number; type: string; name: string; lat: number; lng: number; address?: string; phone?: string; status?: string; landfillType?: string; area?: string; fillLevel?: string; wasteTypes?: string[]; workingHours?: string; operator?: string; discoveryDate?: string; notes?: string }): CutoutMarker {
  let desc = ''
  if (p.type === 'landfills') desc = [p.landfillType, p.area, p.fillLevel ? 'заполн. ' + p.fillLevel : ''].filter(Boolean).join(' · ')
  else if (p.type === 'reception') desc = [p.wasteTypes?.slice(0, 3).join(', '), p.workingHours, p.operator].filter(Boolean).join(' · ')
  else if (p.type === 'recyclers') desc = (p.wasteTypes ?? []).slice(0, 4).join(', ')
  else if (p.type === 'dumps') desc = [p.area, p.discoveryDate ? 'обнаруж. ' + p.discoveryDate : '', p.notes].filter(Boolean).join(' · ')
  return {
    id: p.id,
    type: p.type,
    name: p.name,
    lat: p.lat,
    lng: p.lng,
    address: p.address,
    phone: p.phone,
    status: p.status,
    description: desc,
  }
}

const { t } = useI18n()

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

const gisRegions = [
  'Бишкек', 'Чуйская', 'Ошская', 'Джалал-Абадская',
  'Иссык-Кульская', 'Нарынская', 'Таласская', 'Баткенская',
]

// ════════════════════════════════════════════════════════════════════
// Types & Interfaces
// ════════════════════════════════════════════════════════════════════

type LayerType = 'landfills' | 'recyclers' | 'reception' | 'dumps'
type TabType = 'landfills' | 'recyclers' | 'reception' | 'dumps'

interface MapPoint {
  id: number
  type: LayerType
  name: string
  lat: number
  lng: number
  address: string
  phone: string
  status: string
  region?: string
  // Recyclers
  wasteTypes?: string[]
  licenseNumber?: string
  capacity?: string
  // Reception
  workingHours?: string
  operator?: string
  // Landfills
  landfillType?: string
  area?: string
  fillLevel?: string
  // Dumps
  discoveryDate?: string
  dumpStatus?: string
  notes?: string
}

interface ClusterItem {
  type: 'cluster'
  lat: number
  lng: number
  count: number
  points: MapPoint[]
}

interface MarkerItem {
  type: 'marker'
  point: MapPoint
}

type DisplayItem = ClusterItem | MarkerItem

// ════════════════════════════════════════════════════════════════════
// Layer Configuration
// ════════════════════════════════════════════════════════════════════

const layerConfig = computed(() => [
  { id: 'landfills' as LayerType, name: t('registries.layerLandfills'), color: '#22c55e', icon: '\u{1F7E2}' },
  { id: 'recyclers' as LayerType, name: t('registries.layerRecyclers'), color: '#2563EB', icon: '\u{1F535}' },
  { id: 'reception' as LayerType, name: t('registries.layerReception'), color: '#EAB308', icon: '\u{1F7E1}' },
  { id: 'dumps' as LayerType, name: t('registries.layerDumps'), color: '#DC2626', icon: '\u{1F7E0}' },
])

// ════════════════════════════════════════════════════════════════════
// Map State
// ════════════════════════════════════════════════════════════════════

const DEFAULT_CENTER: [number, number] = [41.2044, 74.7661]
const DEFAULT_ZOOM = 7

const mapRef = ref<any>(null)
const mapCenter = ref<[number, number]>([...DEFAULT_CENTER])
const mapZoom = ref(DEFAULT_ZOOM)
const mapReady = ref(false)

// ════════════════════════════════════════════════════════════════════
// Filter State
// ════════════════════════════════════════════════════════════════════

// Mobile: show/hide filter row
const mobileFiltersOpen = ref(false)

// Search on map
const mapSearchQuery = ref('')
const mapSearchResults = ref<MapPoint[]>([])
const showMapSearchResults = ref(false)

// Layer visibility
const layerVisibility = reactive<Record<LayerType, boolean>>({
  landfills: true,
  recyclers: true,
  reception: true,
  dumps: true,
})

// Region filter (global)
const regionFilter = ref('')

// Landfill status filter
const landfillStatusFilter = ref('')

// Dump status filter
const dumpStatusFilter = ref('')

// Active tab for registry tables
const activeTab = ref<TabType>('landfills')

// Highlighted row/marker
const highlightedPointId = ref<number | null>(null)

// Per-tab search
const landfillTabSearch = ref('')
const recyclerTabSearch = ref('')
const receptionTabSearch = ref('')
const dumpsTabSearch = ref('')

// Expanded waste types toggle for table rows
const expandedWasteRows = reactive(new Set<number>())

// ════════════════════════════════════════════════════════════════════
// Computed: All Map Points — строится ТОЛЬКО из данных backend.
// Конвертация backend-полей (latitude/longitude/companyName) в формат
// таблицы (lat/lng/name).
// ════════════════════════════════════════════════════════════════════

const recyclerTableData = computed(() => backendRecyclers.value.map(r => ({
  id: r.id,
  name: r.companyName ?? '',
  inn: r.inn ?? '',
  lat: r.latitude ?? 0,
  lng: r.longitude ?? 0,
  address: r.address ?? '',
  phone: r.phone ?? '',
  region: r.region ?? '',
  wasteTypes: r.wasteTypes ?? [],
  licenseNumber: r.licenseNumber ?? '',
  licenseExpiry: '',
  capacity: '',
  status: (r.status ?? 'active').toLowerCase(),
})))

const allMapPoints = computed<MapPoint[]>(() => {
  const recyclerPoints: MapPoint[] = recyclerTableData.value
    .filter(r => r.lat && r.lng)
    .map(r => ({
      id: r.id, type: 'recyclers' as LayerType, name: r.name, lat: r.lat, lng: r.lng,
      address: r.address, phone: r.phone, status: r.status, region: r.region,
      wasteTypes: r.wasteTypes, licenseNumber: r.licenseNumber, capacity: r.capacity,
    }))

  const recPoints: MapPoint[] = backendCollectionPoints.value
    .filter(p => p.latitude && p.longitude)
    .map(p => ({
      id: p.id, type: 'reception' as LayerType, name: p.name,
      lat: p.latitude!, lng: p.longitude!,
      address: p.address ?? '', phone: p.contactPhone ?? '',
      status: (p.status ?? 'active').toLowerCase(),
      region: p.region ?? '',
      wasteTypes: p.wasteTypes ?? [],
      workingHours: p.operatingHours ?? '',
      operator: p.operator ?? '',
    }))

  const landfillPoints: MapPoint[] = backendLandfills.value
    .filter(l => l.latitude && l.longitude)
    .map(l => ({
      id: l.id, type: 'landfills' as LayerType, name: l.name,
      lat: l.latitude!, lng: l.longitude!,
      address: l.address ?? '', phone: '',
      status: (l.status ?? 'active').toLowerCase(),
      region: l.region ?? '',
      landfillType: l.type ?? '',
      area: l.area != null ? `${l.area} га` : '—',
      fillLevel: l.fillPercent != null ? `${l.fillPercent}%` : '—',
    }))

  const dumpPoints: MapPoint[] = backendDumps.value
    .filter(d => d.latitude && d.longitude)
    .map(d => ({
      id: d.id, type: 'dumps' as LayerType, name: d.name,
      lat: d.latitude!, lng: d.longitude!,
      address: d.address ?? '', phone: '',
      status: (d.status ?? 'active').toLowerCase(),
      region: d.region ?? '',
      area: d.area != null ? `${d.area} ${t('registries.ha')}` : '—',
      discoveryDate: d.discoveredDate ?? '—',
      dumpStatus: (d.status ?? 'active').toLowerCase(),
      notes: d.notes ?? '',
    }))

  return [...landfillPoints, ...recyclerPoints, ...recPoints, ...dumpPoints]
})

// ════════════════════════════════════════════════════════════════════
// Computed: Visible Points (filtered by ALL filters)
// ════════════════════════════════════════════════════════════════════

const visiblePoints = computed(() => {
  return allMapPoints.value.filter(p => {
    // Layer visibility
    if (!layerVisibility[p.type]) return false

    // Region filter
    if (regionFilter.value && p.region !== regionFilter.value) return false

    // Landfill status filter
    if (p.type === 'landfills' && landfillStatusFilter.value) {
      if (landfillStatusFilter.value === 'active' && p.status !== 'active') return false
      if (landfillStatusFilter.value === 'full' && p.status !== 'full') return false
      if (landfillStatusFilter.value === 'closed' && p.status !== 'closed') return false
    }

    // Dump status filter
    if (p.type === 'dumps' && dumpStatusFilter.value) {
      if (p.dumpStatus !== dumpStatusFilter.value) return false
    }

    return true
  })
})

// ════════════════════════════════════════════════════════════════════
// Computed: Counts
// ════════════════════════════════════════════════════════════════════

const countByType = computed(() => {
  const counts: Record<string, number> = {
    landfills: 0,
    recyclers: 0,
    reception: 0,
    dumps: 0,
    total: 0,
  }
  visiblePoints.value.forEach(p => {
    counts[p.type]++
    counts.total++
  })
  return counts
})

// Счётчики берутся из allMapPoints — учитывают и сторы, и mock fallback.
const totalCountByType = computed(() => {
  const acc = { landfills: 0, recyclers: 0, reception: 0, dumps: 0, total: 0 }
  for (const p of allMapPoints.value) {
    if (p.type in acc) (acc as any)[p.type]++
    acc.total++
  }
  return acc
})

// ════════════════════════════════════════════════════════════════════
// Computed: Clustering (grid-based)
// ════════════════════════════════════════════════════════════════════

const getGridSize = (zoom: number): number => {
  if (zoom <= 7) return 2.0
  if (zoom <= 8) return 1.0
  if (zoom <= 9) return 0.5
  if (zoom <= 10) return 0.25
  return 0
}

const displayItems = computed<DisplayItem[]>(() => {
  const gridSize = getGridSize(mapZoom.value)

  // No clustering at high zoom
  if (gridSize === 0) {
    return visiblePoints.value.map(p => ({ type: 'marker' as const, point: p }))
  }

  // Grid-based clustering
  const grid: Record<string, MapPoint[]> = {}

  visiblePoints.value.forEach(p => {
    const cellX = Math.floor(p.lng / gridSize)
    const cellY = Math.floor(p.lat / gridSize)
    const key = `${cellX}:${cellY}`
    if (!grid[key]) grid[key] = []
    grid[key].push(p)
  })

  const items: DisplayItem[] = []
  Object.values(grid).forEach(points => {
    if (points.length === 1) {
      items.push({ type: 'marker', point: points[0] })
    } else {
      // Calculate center of cluster
      let latSum = 0
      let lngSum = 0
      points.forEach(p => { latSum += p.lat; lngSum += p.lng })
      items.push({
        type: 'cluster',
        lat: latSum / points.length,
        lng: lngSum / points.length,
        count: points.length,
        points,
      })
    }
  })

  return items
})

// ════════════════════════════════════════════════════════════════════
// Computed: Filtered data for registry tables
// ════════════════════════════════════════════════════════════════════

// Все реестры берут данные из allMapPoints (источник: /api/v1/public/*).
const filteredLandfills = computed(() => {
  let result = allMapPoints.value.filter(p => p.type === 'landfills')
  if (regionFilter.value) result = result.filter(l => l.region === regionFilter.value)
  if (landfillStatusFilter.value) result = result.filter(l => l.status === landfillStatusFilter.value)
  if (landfillTabSearch.value.trim()) {
    const q = landfillTabSearch.value.toLowerCase()
    result = result.filter(l => (l.name ?? '').toLowerCase().includes(q) || (l.address ?? '').toLowerCase().includes(q))
  }
  return result
})

const filteredRecyclers = computed(() => {
  let result = recyclerTableData.value
  if (regionFilter.value) result = result.filter(r => r.region === regionFilter.value)
  if (recyclerTabSearch.value.trim()) {
    const q = recyclerTabSearch.value.toLowerCase()
    result = result.filter(r => r.name.toLowerCase().includes(q) || (r.inn ?? '').includes(q))
  }
  return result
})

const filteredReceptionPoints = computed(() => {
  let result = allMapPoints.value.filter(p => p.type === 'reception')
  if (regionFilter.value) result = result.filter(p => p.region === regionFilter.value)
  if (receptionTabSearch.value.trim()) {
    const q = receptionTabSearch.value.toLowerCase()
    result = result.filter(p => (p.name ?? '').toLowerCase().includes(q) || (p.address ?? '').toLowerCase().includes(q))
  }
  return result
})

const filteredDumps = computed(() => {
  let result = allMapPoints.value.filter(p => p.type === 'dumps')
  if (regionFilter.value) result = result.filter(d => d.region === regionFilter.value)
  if (dumpStatusFilter.value) result = result.filter(d => d.dumpStatus === dumpStatusFilter.value)
  if (dumpsTabSearch.value.trim()) {
    const q = dumpsTabSearch.value.toLowerCase()
    result = result.filter(d => (d.name ?? '').toLowerCase().includes(q) || (d.address ?? '').toLowerCase().includes(q))
  }
  return result
})

// ════════════════════════════════════════════════════════════════════
// Marker Icons
// ════════════════════════════════════════════════════════════════════

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

const createClusterIcon = (count: number) => {
  const size = count > 20 ? 50 : count > 10 ? 44 : 38
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: #0e888d;
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(14,136,141,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
      font-size: ${count > 99 ? 12 : 14}px;
    ">${count}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
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

const getMarkerIcon = (point: MapPoint) => {
  const layer = layerConfig.value.find(l => l.id === point.type)
  const color = layer?.color || '#666'
  if (point.id === highlightedPointId.value) return createHighlightedIcon(color)
  return createIcon(color, 28)
}

// ════════════════════════════════════════════════════════════════════
// Map Controls
// ════════════════════════════════════════════════════════════════════

const getLeafletMap = (): L.Map | null => {
  if (!mapRef.value) return null
  // Новый CutoutMap экспонирует getLeafletMap(); старый LMap — свойство leafletObject.
  const ref = mapRef.value as any
  if (typeof ref.getLeafletMap === 'function') return ref.getLeafletMap() || null
  return ref.leafletObject || null
}

const onMapReady = () => {
  mapReady.value = true
  const map = getLeafletMap()
  if (map) {
    map.scrollWheelZoom.disable()
  }
}

const resetMapView = () => {
  const map = getLeafletMap()
  if (map) {
    map.flyTo(DEFAULT_CENTER, DEFAULT_ZOOM, { duration: 1 })
  } else {
    mapCenter.value = [...DEFAULT_CENTER]
    mapZoom.value = DEFAULT_ZOOM
  }
}

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

const flyToPoint = (lat: number, lng: number, zoom = 14) => {
  const map = getLeafletMap()
  if (map) {
    map.flyTo([lat, lng], zoom, { duration: 1 })
  } else {
    mapCenter.value = [lat, lng]
    mapZoom.value = zoom
  }
}

const onClusterClick = (cluster: ClusterItem) => {
  const map = getLeafletMap()
  if (map) {
    // Calculate bounds of cluster points
    const bounds = L.latLngBounds(cluster.points.map(p => [p.lat, p.lng] as [number, number]))
    map.flyToBounds(bounds, { padding: [50, 50], duration: 1 })
  }
}

// ════════════════════════════════════════════════════════════════════
// Search
// ════════════════════════════════════════════════════════════════════

const performMapSearch = () => {
  if (!mapSearchQuery.value.trim() || mapSearchQuery.value.trim().length < 3) {
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

  // Switch tab
  activeTab.value = point.type

  // Ensure layer is visible
  if (!layerVisibility[point.type]) {
    layerVisibility[point.type] = true
  }
}

// ════════════════════════════════════════════════════════════════════
// Map Interactions
// ════════════════════════════════════════════════════════════════════

const onMarkerClick = (point: MapPoint) => {
  highlightedPointId.value = point.id
  if (activeTab.value !== point.type) {
    activeTab.value = point.type
  }
  nextTick(() => {
    const row = document.getElementById(`row-${point.id}`)
    if (row) {
      row.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  })
}

const onTableRowClick = (item: { id: number; lat: number; lng: number; type?: LayerType }) => {
  flyToPoint(item.lat, item.lng)
  highlightedPointId.value = item.id
  const mapEl = document.getElementById('map-section')
  if (mapEl) {
    mapEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const onTableRowHover = (id: number | null) => {
  highlightedPointId.value = id
}

// ════════════════════════════════════════════════════════════════════
// Layer & Filter Controls
// ════════════════════════════════════════════════════════════════════

const toggleLayer = (layerId: LayerType) => {
  layerVisibility[layerId] = !layerVisibility[layerId]
}

const resetFilters = () => {
  regionFilter.value = ''
  landfillStatusFilter.value = ''
  dumpStatusFilter.value = '';
  (Object.keys(layerVisibility) as LayerType[]).forEach(k => {
    layerVisibility[k] = true
  })
  mapSearchQuery.value = ''
  landfillTabSearch.value = ''
  recyclerTabSearch.value = ''
  receptionTabSearch.value = ''
  dumpsTabSearch.value = ''
}

const toggleExpandedWaste = (id: number, event: Event) => {
  event.stopPropagation()
  if (expandedWasteRows.has(id)) {
    expandedWasteRows.delete(id)
  } else {
    expandedWasteRows.add(id)
  }
}

// ════════════════════════════════════════════════════════════════════
// Helpers
// ════════════════════════════════════════════════════════════════════

const getStatusInfo = (status: string) => {
  switch (status) {
    case 'active': return { label: t('registries.statusActive'), color: 'bg-green-100 text-green-700' }
    case 'full': return { label: t('registries.statusFull'), color: 'bg-orange-100 text-orange-700' }
    case 'closed': return { label: t('registries.statusClosed'), color: 'bg-red-100 text-red-700' }
    default: return { label: status, color: 'bg-gray-100 text-gray-700' }
  }
}

const getDumpStatusInfo = (status: string) => {
  switch (status) {
    case 'discovered': return { label: t('registries.statusDiscovered'), color: 'bg-red-100 text-red-700' }
    case 'liquidating': return { label: t('registries.statusLiquidating'), color: 'bg-yellow-100 text-yellow-700' }
    case 'liquidated': return { label: t('registries.statusLiquidated'), color: 'bg-green-100 text-green-700' }
    default: return { label: status, color: 'bg-gray-100 text-gray-700' }
  }
}

const getTypeLabel = (type: LayerType) => {
  return layerConfig.value.find(l => l.id === type)?.name || type
}

const getTypeBadgeClass = (type: LayerType) => {
  switch (type) {
    case 'landfills': return 'bg-green-100 text-green-700'
    case 'recyclers': return 'bg-blue-100 text-blue-700'
    case 'reception': return 'bg-yellow-100 text-yellow-700'
    case 'dumps': return 'bg-red-100 text-red-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

const getWasteGroupLabel = (groupValue: string) => {
  const group = productGroups.find(g => g.value === groupValue)
  if (!group) return groupValue
  const short = getTranslatedGroupLabel(group.value).replace(/^\d+\.\s*/, '')
  return short.length > 35 ? short.slice(0, 35) + '...' : short
}

const getFillLevelColor = (fillLevel: string) => {
  const val = parseInt(fillLevel)
  if (isNaN(val)) return ''
  if (val < 60) return 'bg-green-500'
  if (val < 80) return 'bg-yellow-500'
  if (val < 95) return 'bg-orange-500'
  return 'bg-red-500'
}

// Tab badge color classes
const getTabActiveClasses = (tab: TabType) => {
  switch (tab) {
    case 'landfills': return 'bg-green-50 text-green-700 ring-2 ring-green-300 shadow-sm'
    case 'recyclers': return 'bg-blue-50 text-blue-700 ring-2 ring-blue-300 shadow-sm'
    case 'reception': return 'bg-yellow-50 text-yellow-700 ring-2 ring-yellow-300 shadow-sm'
    case 'dumps': return 'bg-red-50 text-red-700 ring-2 ring-red-300 shadow-sm'
  }
}

const getTabBadgeClasses = (tab: TabType, isActive: boolean) => {
  if (!isActive) return 'bg-gray-200 text-gray-600'
  switch (tab) {
    case 'landfills': return 'bg-green-200 text-green-800'
    case 'recyclers': return 'bg-blue-200 text-blue-800'
    case 'reception': return 'bg-yellow-200 text-yellow-800'
    case 'dumps': return 'bg-red-200 text-red-800'
  }
}

const getTabDotColor = (tab: TabType) => {
  switch (tab) {
    case 'landfills': return 'bg-green-500'
    case 'recyclers': return 'bg-blue-500'
    case 'reception': return 'bg-yellow-500'
    case 'dumps': return 'bg-red-500'
  }
}

const getRowHighlightClass = (tab: TabType) => {
  switch (tab) {
    case 'landfills': return 'bg-green-50'
    case 'recyclers': return 'bg-blue-50'
    case 'reception': return 'bg-yellow-50'
    case 'dumps': return 'bg-red-50'
  }
}

const getRowHoverClass = (tab: TabType) => {
  switch (tab) {
    case 'landfills': return 'hover:bg-[#f0fdf4]'
    case 'recyclers': return 'hover:bg-[#eff6ff]'
    case 'reception': return 'hover:bg-[#fefce8]'
    case 'dumps': return 'hover:bg-[#fef2f2]'
  }
}

const hasActiveFilters = computed(() => {
  return regionFilter.value !== '' || landfillStatusFilter.value !== '' || dumpStatusFilter.value !== '' ||
    Object.values(layerVisibility).some(v => !v) || mapSearchQuery.value.trim() !== ''
})
</script>

<template>
  <div class="bg-[#f8fafc] pt-10 pb-6 lg:pt-[60px] lg:pb-8">
    <!-- ════════════════════════════════════════════ -->
    <!-- Page Header                                 -->
    <!-- ════════════════════════════════════════════ -->
    <div class="container-main">
      <h1 class="text-2xl md:text-[28px] lg:text-[30px] font-bold text-[#415861] uppercase mb-2 lg:mb-[12px]">
        {{ $t('registries.gisMapTitle') }}
      </h1>
      <p class="text-base md:text-lg lg:text-[20px] font-medium text-[#415861]">
        {{ $t('registries.gisMapSubtitle') }}
      </p>
    </div>

    <!-- ════════════════════════════════════════════ -->
    <!-- Horizontal Filter Bar                       -->
    <!-- ════════════════════════════════════════════ -->
    <div class="container-main pt-5 lg:pt-6">
      <div class="bg-white rounded-xl border border-gray-200 shadow-sm">
        <!-- Desktop: single row -->
        <div class="hidden md:flex items-center gap-3 px-4 py-3 flex-wrap">
          <!-- Search -->
          <div class="relative w-[220px] flex-shrink-0">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              v-model="mapSearchQuery"
              type="text"
              :placeholder="$t('registries.searchObject')"
              class="w-full h-9 pl-9 pr-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0e888d] focus:border-transparent"
              @focus="showMapSearchResults = mapSearchResults.length > 0"
              @blur="setTimeout(() => showMapSearchResults = false, 200)"
            />
            <div
              v-if="showMapSearchResults"
              class="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-48 overflow-y-auto z-50"
            >
              <div
                v-for="result in mapSearchResults"
                :key="result.id"
                @mousedown.prevent="goToPointFromSearch(result)"
                class="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
              >
                <div class="flex items-center gap-2">
                  <div class="w-2.5 h-2.5 rounded-full flex-shrink-0" :style="{ backgroundColor: layerConfig.find(l => l.id === result.type)?.color }"></div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 truncate">{{ result.name }}</p>
                    <p class="text-[11px] text-gray-500 truncate">{{ result.address }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="flex-1"></div>

          <!-- Глобальный фильтр: регион (остальные фильтры переехали внутрь
               соответствующих слоёв и вкладок реестра) -->
          <select v-model="regionFilter" class="h-9 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-[#0e888d] focus:border-transparent w-[180px] flex-shrink-0">
            <option value="">{{ $t('registries.regionAll') }}</option>
            <option v-for="region in gisRegions" :key="region" :value="region">{{ region }}</option>
          </select>

          <!-- Reset -->
          <button
            v-if="hasActiveFilters"
            @click="resetFilters"
            class="flex items-center gap-1 h-9 px-3 text-sm text-gray-500 hover:text-gray-700 transition-colors flex-shrink-0"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            {{ $t('registries.resetFilters') }}
          </button>
        </div>

        <!-- Mobile: compact row with toggle -->
        <div class="md:hidden">
          <div class="flex items-center gap-2 px-4 py-3">
            <div class="relative flex-1">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                v-model="mapSearchQuery"
                type="text"
                :placeholder="$t('registries.searchObject')"
                class="w-full h-9 pl-9 pr-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0e888d] focus:border-transparent"
                @focus="showMapSearchResults = mapSearchResults.length > 0"
                @blur="setTimeout(() => showMapSearchResults = false, 200)"
              />
              <div
                v-if="showMapSearchResults"
                class="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-48 overflow-y-auto z-50"
              >
                <div
                  v-for="result in mapSearchResults"
                  :key="result.id"
                  @mousedown.prevent="goToPointFromSearch(result)"
                  class="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                >
                  <div class="flex items-center gap-2">
                    <div class="w-2.5 h-2.5 rounded-full flex-shrink-0" :style="{ backgroundColor: layerConfig.find(l => l.id === result.type)?.color }"></div>
                    <p class="text-sm text-gray-900 truncate">{{ result.name }}</p>
                  </div>
                </div>
              </div>
            </div>
            <button
              @click="mobileFiltersOpen = !mobileFiltersOpen"
              :class="['flex items-center gap-1.5 h-9 px-3 rounded-lg text-sm font-medium border transition-colors', mobileFiltersOpen ? 'bg-[#0e888d] text-white border-[#0e888d]' : 'bg-gray-50 text-gray-700 border-gray-200']"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
              {{ $t('registries.filters') }}
              <svg :class="['w-3 h-3 transition-transform', mobileFiltersOpen ? 'rotate-180' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
            </button>
          </div>
          <!-- Expanded mobile filters (упрощены — только регион) -->
          <div v-if="mobileFiltersOpen" class="px-4 pb-3 space-y-3 border-t border-gray-100 pt-3">
            <select v-model="regionFilter" class="w-full h-9 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
              <option value="">{{ $t('registries.regionAll') }}</option>
              <option v-for="region in gisRegions" :key="region" :value="region">{{ region }}</option>
            </select>
            <button v-if="hasActiveFilters" @click="resetFilters" class="w-full h-9 text-sm text-gray-500 hover:text-gray-700 text-left">
              ✕ {{ $t('registries.resetFilters') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ════════════════════════════════════════════ -->
    <!-- Map Section                                 -->
    <!-- ════════════════════════════════════════════ -->
    <div id="map-section" class="container-main pt-3 lg:pt-4">
      <div class="relative rounded-xl overflow-hidden shadow-sm border border-gray-200" style="height: calc(100vh - 320px); min-height: 400px; max-height: 700px;">

        <!-- ── Leaflet OSM + inverse-маска цвета фона ── -->
        <KyrgyzstanCutoutMap
          ref="mapRef"
          :markers="visiblePoints.map(pointToMarker)"
          height="100%"
          mask-color="#f8fafc"
          @marker-click="(m: CutoutMarker) => onMarkerClick(allMapPoints.find(p => p.id === m.id && p.type === m.type) ?? (m as any))"
        />

        <!-- ══ Слои (floating control — слева-сверху) ══ -->
        <div
          class="absolute top-4 left-4 z-[1000] bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/70 overflow-hidden"
          style="min-width: 200px;"
        >
          <div class="px-3 py-2 bg-gray-50/80 border-b border-gray-100">
            <p class="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{{ $t('registries.layersTitle') || 'Слои' }}</p>
          </div>
          <div class="p-1.5 space-y-0.5">
            <label
              v-for="layer in layerConfig"
              :key="layer.id"
              class="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors select-none"
            >
              <input
                type="checkbox"
                :checked="layerVisibility[layer.id]"
                @change="toggleLayer(layer.id)"
                class="w-4 h-4 rounded border-gray-300 text-[#0e888d] focus:ring-[#0e888d] focus:ring-offset-0 cursor-pointer"
              />
              <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" :style="{ backgroundColor: layer.color }"></span>
              <span class="text-[13px] font-medium flex-1" :class="layerVisibility[layer.id] ? 'text-gray-900' : 'text-gray-400'">
                {{ layer.name }}
              </span>
            </label>
          </div>
        </div>

        <!-- (legacy Leaflet markup removed — replaced by KyrgyzstanInteractiveMap above) -->

        <!-- ════════════════════════════════════════════ -->
        <!-- Zoom Controls (right side)                  -->
        <!-- ════════════════════════════════════════════ -->
        <div class="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
          <!-- Zoom In -->
          <button
            @click="getLeafletMap()?.zoomIn()"
            class="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center text-gray-700 hover:bg-gray-50 hover:text-[#0e888d] transition-colors text-xl font-bold"
            :title="$t('registries.zoomIn')"
          >+</button>
          <!-- Zoom Out -->
          <button
            @click="getLeafletMap()?.zoomOut()"
            class="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center text-gray-700 hover:bg-gray-50 hover:text-[#0e888d] transition-colors text-xl font-bold"
            :title="$t('registries.zoomOut')"
          >-</button>
          <!-- Divider -->
          <div class="h-px bg-gray-200 mx-1"></div>
          <!-- Reset view -->
          <button
            @click="resetMapView"
            class="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-[#0e888d] transition-colors"
            :title="$t('registries.showFullMap')"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </button>
          <!-- Geolocation -->
          <button
            @click="locateUser"
            class="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-[#0e888d] transition-colors"
            :title="$t('registries.whereAmI')"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>

        <!-- Старая легенда убрана — слои теперь в floating control слева-сверху -->

      </div><!-- end map container -->
    </div>

    <!-- ════════════════════════════════════════════ -->
    <!-- Registry Tables Below Map                   -->
    <!-- ════════════════════════════════════════════ -->
    <div class="container-main pt-5 lg:pt-6">
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

        <!-- Registry header + Tabs -->
        <div class="px-6 pt-6 pb-4 border-b border-gray-100">
          <h2 class="text-xl md:text-2xl font-bold text-[#415861] mb-4">{{ $t('registries.registryTitle') }}</h2>

          <div class="flex flex-wrap gap-3">
            <!-- Landfills tab -->
            <button
              @click="activeTab = 'landfills'"
              :class="[
                'flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200',
                activeTab === 'landfills' ? getTabActiveClasses('landfills') : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              ]"
            >
              <span :class="['w-3 h-3 rounded-full', getTabDotColor('landfills')]"></span>
              {{ $t('registries.layerLandfills') }}
              <span :class="['text-xs px-2 py-0.5 rounded-full', getTabBadgeClasses('landfills', activeTab === 'landfills')]">
                {{ filteredLandfills.length }}
              </span>
            </button>

            <!-- Recyclers tab -->
            <button
              @click="activeTab = 'recyclers'"
              :class="[
                'flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200',
                activeTab === 'recyclers' ? getTabActiveClasses('recyclers') : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              ]"
            >
              <span :class="['w-3 h-3 rounded-full', getTabDotColor('recyclers')]"></span>
              {{ $t('registries.layerRecyclers') }}
              <span :class="['text-xs px-2 py-0.5 rounded-full', getTabBadgeClasses('recyclers', activeTab === 'recyclers')]">
                {{ filteredRecyclers.length }}
              </span>
            </button>

            <!-- Reception tab -->
            <button
              @click="activeTab = 'reception'"
              :class="[
                'flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200',
                activeTab === 'reception' ? getTabActiveClasses('reception') : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              ]"
            >
              <span :class="['w-3 h-3 rounded-full', getTabDotColor('reception')]"></span>
              {{ $t('registries.layerReception') }}
              <span :class="['text-xs px-2 py-0.5 rounded-full', getTabBadgeClasses('reception', activeTab === 'reception')]">
                {{ filteredReceptionPoints.length }}
              </span>
            </button>

            <!-- Dumps tab -->
            <button
              @click="activeTab = 'dumps'"
              :class="[
                'flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200',
                activeTab === 'dumps' ? getTabActiveClasses('dumps') : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              ]"
            >
              <span :class="['w-3 h-3 rounded-full', getTabDotColor('dumps')]"></span>
              {{ $t('registries.layerDumps') }}
              <span :class="['text-xs px-2 py-0.5 rounded-full', getTabBadgeClasses('dumps', activeTab === 'dumps')]">
                {{ filteredDumps.length }}
              </span>
            </button>
          </div>
        </div>

        <!-- ════════════════ TAB: LANDFILLS ════════════════ -->
        <div v-if="activeTab === 'landfills'" class="p-6">
          <!-- Tab search + status filter -->
          <div class="flex flex-col md:flex-row gap-3 mb-6">
            <div class="relative flex-1">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input v-model="landfillTabSearch" type="text" :placeholder="$t('registries.searchByName')"
                class="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0e888d] focus:border-transparent" />
            </div>
            <select v-model="landfillStatusFilter" class="h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:ring-2 focus:ring-[#0e888d] focus:border-transparent md:w-[200px]">
              <option value="">{{ $t('registries.landfillsAll') }}</option>
              <option value="active">{{ $t('registries.landfillsActive') }}</option>
              <option value="full">{{ $t('registries.landfillsFull') }}</option>
              <option value="closed">{{ $t('registries.landfillsClosed') }}</option>
            </select>
          </div>

          <!-- Table -->
          <div class="overflow-x-auto">
            <table class="w-full text-[14px]">
              <thead>
                <tr class="border-b border-gray-200 bg-gray-50">
                  <th class="text-left py-3 px-4 font-semibold text-gray-500 text-[14px] min-w-[200px]">{{ $t('registries.thName') }}</th>
                  <th class="text-left py-3 px-4 font-semibold text-gray-500 text-[14px] min-w-[140px]">{{ $t('registries.thType') }}</th>
                  <th class="text-left py-3 px-4 font-semibold text-gray-500 text-[14px] whitespace-nowrap">{{ $t('registries.thArea') }}</th>
                  <th class="text-left py-3 px-4 font-semibold text-gray-500 text-[14px] whitespace-nowrap">{{ $t('registries.thCapacity') }}</th>
                  <th class="text-left py-3 px-4 font-semibold text-gray-500 text-[14px] whitespace-nowrap">{{ $t('registries.thFillLevel') }}</th>
                  <th class="text-left py-3 px-4 font-semibold text-gray-500 text-[14px] min-w-[100px] whitespace-nowrap">{{ $t('registries.thRegion') }}</th>
                  <th class="text-left py-3 px-4 font-semibold text-gray-500 text-[14px] whitespace-nowrap">{{ $t('registries.thStatus') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="landfill in filteredLandfills" :key="landfill.id" :id="`row-${landfill.id}`"
                  @click="onTableRowClick({ id: landfill.id, lat: landfill.lat, lng: landfill.lng, type: 'landfills' })"
                  @mouseenter="onTableRowHover(landfill.id)" @mouseleave="onTableRowHover(null)"
                  :class="['border-b border-gray-100 cursor-pointer transition-colors duration-150',
                    highlightedPointId === landfill.id ? getRowHighlightClass('landfills') : getRowHoverClass('landfills')]"
                >
                  <td class="py-3 px-4 font-medium text-[#415861] min-w-[200px] leading-snug">{{ landfill.name }}</td>
                  <td class="py-3 px-4 text-gray-600 min-w-[140px]">{{ landfill.landfillType }}</td>
                  <td class="py-3 px-4 text-gray-600 whitespace-nowrap">{{ landfill.area }}</td>
                  <td class="py-3 px-4 text-gray-600 whitespace-nowrap">{{ landfill.capacity }}</td>
                  <td class="py-3 px-4">
                    <div v-if="landfill.fillLevel !== '—'" class="flex items-center gap-2">
                      <div class="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div class="h-full rounded-full transition-all" :class="getFillLevelColor(landfill.fillLevel)" :style="{ width: landfill.fillLevel }"></div>
                      </div>
                      <span class="text-[13px] text-gray-600">{{ landfill.fillLevel }}</span>
                    </div>
                    <span v-else class="text-gray-400">--</span>
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
            <div v-if="filteredLandfills.length === 0" class="py-12 text-center text-gray-400 text-[14px]">
              {{ $t('registries.nothingFoundByFilters') }}
            </div>
          </div>
        </div>

        <!-- ════════════════ TAB: RECYCLERS ════════════════ -->
        <div v-if="activeTab === 'recyclers'" class="p-6">
          <!-- Tab search -->
          <div class="flex flex-col md:flex-row gap-3 mb-6">
            <div class="relative flex-1">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input v-model="recyclerTabSearch" type="text" :placeholder="$t('registries.searchByNameOrInn')"
                class="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0e888d] focus:border-transparent" />
            </div>
          </div>

          <!-- Table -->
          <div class="overflow-x-auto">
            <table class="w-full text-[14px]">
              <thead>
                <tr class="border-b border-gray-200 bg-gray-50">
                  <th class="text-left py-3 px-4 font-semibold text-gray-500 text-[14px] min-w-[200px]">{{ $t('registries.thName') }}</th>
                  <th class="text-left py-3 px-4 font-semibold text-gray-500 text-[14px]">{{ $t('registries.thWasteTypes') }}</th>
                  <th class="text-left py-3 px-4 font-semibold text-gray-500 text-[14px] min-w-[120px] whitespace-nowrap">{{ $t('registries.thLicense') }}</th>
                  <th class="text-left py-3 px-4 font-semibold text-gray-500 text-[14px] min-w-[100px] whitespace-nowrap">{{ $t('registries.thRegion') }}</th>
                  <th class="text-left py-3 px-4 font-semibold text-gray-500 text-[14px] min-w-[180px]">{{ $t('registries.thAddress') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="recycler in filteredRecyclers" :key="recycler.id" :id="`row-${recycler.id}`"
                  @click="onTableRowClick({ id: recycler.id, lat: recycler.lat, lng: recycler.lng, type: 'recyclers' })"
                  @mouseenter="onTableRowHover(recycler.id)" @mouseleave="onTableRowHover(null)"
                  :class="['border-b border-gray-100 cursor-pointer transition-colors duration-150',
                    highlightedPointId === recycler.id ? getRowHighlightClass('recyclers') : getRowHoverClass('recyclers')]"
                >
                  <td class="py-3 px-4 min-w-[200px]">
                    <div class="font-medium text-[#415861] leading-snug">{{ recycler.name }}</div>
                    <div class="text-[12px] text-gray-400 mt-0.5">{{ $t('registries.innLabel') }} {{ recycler.inn }}</div>
                  </td>
                  <td class="py-3 px-4">
                    <div class="flex flex-wrap gap-1">
                      <template v-if="expandedWasteRows.has(recycler.id)">
                        <span v-for="wt in recycler.wasteTypes" :key="wt"
                          class="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[12px]" :title="getWasteGroupLabel(wt)">
                          {{ getWasteGroupLabel(wt) }}
                        </span>
                        <span @click="toggleExpandedWaste(recycler.id, $event)"
                          class="inline-block px-2 py-0.5 bg-gray-200 text-gray-600 rounded-md text-[12px] cursor-pointer hover:bg-gray-300 transition-colors">
                          {{ $t('registries.collapse') }}
                        </span>
                      </template>
                      <template v-else>
                        <span v-for="wt in recycler.wasteTypes.slice(0, 3)" :key="wt"
                          class="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[12px]" :title="getWasteGroupLabel(wt)">
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
            <div v-if="filteredRecyclers.length === 0" class="py-12 text-center text-gray-400 text-[14px]">
              {{ $t('registries.nothingFoundByFilters') }}
            </div>
          </div>
        </div>

        <!-- ════════════════ TAB: RECEPTION POINTS ════════════════ -->
        <div v-if="activeTab === 'reception'" class="p-6">
          <!-- Tab search -->
          <div class="flex flex-col md:flex-row gap-3 mb-6">
            <div class="relative flex-1">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input v-model="receptionTabSearch" type="text" :placeholder="$t('registries.searchByName')"
                class="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0e888d] focus:border-transparent" />
            </div>
          </div>

          <!-- Table -->
          <div class="overflow-x-auto">
            <table class="w-full text-[14px]">
              <thead>
                <tr class="border-b border-gray-200 bg-gray-50">
                  <th class="text-left py-3 px-4 font-semibold text-gray-500 text-[14px] min-w-[200px]">{{ $t('registries.thName') }}</th>
                  <th class="text-left py-3 px-4 font-semibold text-gray-500 text-[14px]">{{ $t('registries.thAcceptedWaste') }}</th>
                  <th class="text-left py-3 px-4 font-semibold text-gray-500 text-[14px] whitespace-nowrap">{{ $t('registries.thWorkingHours') }}</th>
                  <th class="text-left py-3 px-4 font-semibold text-gray-500 text-[14px] whitespace-nowrap">{{ $t('registries.thOperator') }}</th>
                  <th class="text-left py-3 px-4 font-semibold text-gray-500 text-[14px] min-w-[100px] whitespace-nowrap">{{ $t('registries.thRegion') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="point in filteredReceptionPoints" :key="point.id" :id="`row-${point.id}`"
                  @click="onTableRowClick({ id: point.id, lat: point.lat, lng: point.lng, type: 'reception' })"
                  @mouseenter="onTableRowHover(point.id)" @mouseleave="onTableRowHover(null)"
                  :class="['border-b border-gray-100 cursor-pointer transition-colors duration-150',
                    highlightedPointId === point.id ? getRowHighlightClass('reception') : getRowHoverClass('reception')]"
                >
                  <td class="py-3 px-4 font-medium text-[#415861] min-w-[200px] leading-snug">{{ point.name }}</td>
                  <td class="py-3 px-4">
                    <div class="flex flex-wrap gap-1">
                      <template v-if="expandedWasteRows.has(point.id)">
                        <span v-for="wt in point.wasteTypes" :key="wt"
                          class="inline-block px-2 py-0.5 bg-yellow-50 text-yellow-700 rounded-md text-[12px]">{{ wt }}</span>
                        <span @click="toggleExpandedWaste(point.id, $event)"
                          class="inline-block px-2 py-0.5 bg-gray-200 text-gray-600 rounded-md text-[12px] cursor-pointer hover:bg-gray-300 transition-colors">
                          {{ $t('registries.collapse') }}
                        </span>
                      </template>
                      <template v-else>
                        <span v-for="wt in point.wasteTypes.slice(0, 3)" :key="wt"
                          class="inline-block px-2 py-0.5 bg-yellow-50 text-yellow-700 rounded-md text-[12px]">{{ wt }}</span>
                        <span v-if="point.wasteTypes.length > 3"
                          @click="toggleExpandedWaste(point.id, $event)"
                          class="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-[12px] cursor-pointer hover:bg-gray-300 transition-colors">
                          +{{ point.wasteTypes.length - 3 }}
                        </span>
                      </template>
                    </div>
                  </td>
                  <td class="py-3 px-4 text-gray-600 whitespace-nowrap">{{ point.workingHours }}</td>
                  <td class="py-3 px-4 text-gray-600">{{ point.operator }}</td>
                  <td class="py-3 px-4 text-gray-600 whitespace-nowrap">{{ point.region }}</td>
                </tr>
              </tbody>
            </table>
            <div v-if="filteredReceptionPoints.length === 0" class="py-12 text-center text-gray-400 text-[14px]">
              {{ $t('registries.nothingFoundByFilters') }}
            </div>
          </div>
        </div>

        <!-- ════════════════ TAB: DUMPS ════════════════ -->
        <div v-if="activeTab === 'dumps'" class="p-6">
          <!-- Tab search + status filter -->
          <div class="flex flex-col md:flex-row gap-3 mb-6">
            <div class="relative flex-1">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input v-model="dumpsTabSearch" type="text" :placeholder="$t('registries.searchByName')"
                class="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0e888d] focus:border-transparent" />
            </div>
            <select v-model="dumpStatusFilter" class="h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:ring-2 focus:ring-[#0e888d] focus:border-transparent md:w-[200px]">
              <option value="">{{ $t('registries.dumpsAll') }}</option>
              <option value="discovered">{{ $t('registries.dumpDiscovered') }}</option>
              <option value="liquidating">{{ $t('registries.dumpLiquidating') }}</option>
              <option value="liquidated">{{ $t('registries.dumpLiquidated') }}</option>
            </select>
          </div>

          <!-- Table -->
          <div class="overflow-x-auto">
            <table class="w-full text-[14px]">
              <thead>
                <tr class="border-b border-gray-200 bg-gray-50">
                  <th class="text-left py-3 px-4 font-semibold text-gray-500 text-[14px] min-w-[200px]">{{ $t('registries.thName') }}</th>
                  <th class="text-left py-3 px-4 font-semibold text-gray-500 text-[14px] whitespace-nowrap">{{ $t('registries.thArea') }}</th>
                  <th class="text-left py-3 px-4 font-semibold text-gray-500 text-[14px] whitespace-nowrap">{{ $t('registries.thDiscoveryDate') }}</th>
                  <th class="text-left py-3 px-4 font-semibold text-gray-500 text-[14px] whitespace-nowrap">{{ $t('registries.thStatus') }}</th>
                  <th class="text-left py-3 px-4 font-semibold text-gray-500 text-[14px] min-w-[100px] whitespace-nowrap">{{ $t('registries.thRegion') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="dump in filteredDumps" :key="dump.id" :id="`row-${dump.id}`"
                  @click="onTableRowClick({ id: dump.id, lat: dump.lat, lng: dump.lng, type: 'dumps' })"
                  @mouseenter="onTableRowHover(dump.id)" @mouseleave="onTableRowHover(null)"
                  :class="['border-b border-gray-100 cursor-pointer transition-colors duration-150',
                    highlightedPointId === dump.id ? getRowHighlightClass('dumps') : getRowHoverClass('dumps')]"
                >
                  <td class="py-3 px-4 font-medium text-[#415861] min-w-[200px] leading-snug">{{ dump.name }}</td>
                  <td class="py-3 px-4 text-gray-600 whitespace-nowrap">{{ dump.area }} {{ $t('registries.ha') }}</td>
                  <td class="py-3 px-4 text-gray-600 whitespace-nowrap">{{ dump.discoveryDate }}</td>
                  <td class="py-3 px-4">
                    <span :class="['px-2.5 py-1 rounded-full text-[12px] font-medium whitespace-nowrap', getDumpStatusInfo(dump.dumpStatus).color]">
                      {{ getDumpStatusInfo(dump.dumpStatus).label }}
                    </span>
                  </td>
                  <td class="py-3 px-4 text-gray-600 whitespace-nowrap">{{ dump.region }}</td>
                </tr>
              </tbody>
            </table>
            <div v-if="filteredDumps.length === 0" class="py-12 text-center text-gray-400 text-[14px]">
              {{ $t('registries.nothingFoundByFilters') }}
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
