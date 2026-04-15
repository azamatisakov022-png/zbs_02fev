<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import SectionGuide from '../../components/common/SectionGuide.vue'
import KyrgyzstanCutoutMap from '../../components/maps/KyrgyzstanCutoutMap.vue'
import MapCoordinatePicker from '../../components/MapCoordinatePicker.vue'
import { useEmployeeMenu } from '../../composables/useRoleMenu'
import { useI18n } from 'vue-i18n'
import { toastStore } from '../../stores/toast'
import { useGisPublicData } from '../../composables/useGisPublicData'

// ─── Источник данных карты — общий composable. Тот же что и у /registries. ───
const {
  landfills: backendLandfills,
  recyclers: backendRecyclers,
  collectionPoints: backendCollectionPoints,
  dumps: backendDumps,
} = useGisPublicData()
import {
  KG_CENTER,
  KG_DEFAULT_ZOOM,
  KG_MIN_ZOOM,
  KG_MAX_ZOOM,
  KG_BOUNDS,
  KG_TILE_URL,
  KG_TILE_ATTRIBUTION,
  KG_TILE_SUBDOMAINS,
  KG_MASK_PANE,
  KG_MASK_PANE_Z,
  loadKgOblasts,
  oblastStyle,
  oblastHoverStyle,
  buildMaskLatLngs,
  maskStyle,
} from '../../composables/useKgMap'

const { t } = useI18n()
const { roleTitle, menuItems } = useEmployeeMenu()

// ==================== MAP STATE ====================
const mapCenter = ref<[number, number]>([...KG_CENTER])
const mapZoom = ref(KG_DEFAULT_ZOOM)
const mapRef = ref<any>(null)
const mapSearchQuery = ref('')
const mapSearchResults = ref<MapPoint[]>([])
const showMapSearchResults = ref(false)
const oblastsGeo = ref<GeoJSON.FeatureCollection | null>(null)

type LayerType = 'recyclers' | 'reception' | 'landfills' | 'dumps' | 'payers'

// На карте показываем только основные слои объектов.
// Слой 'payers' оставлен в типе (используется реестрами ниже на странице),
// но на карте как маркеры не отображается.
const layerVisibility = ref<Record<LayerType, boolean>>({
  landfills: true, recyclers: true, reception: true, dumps: true, payers: false,
})
const layers = computed(() => [
  { id: 'landfills' as LayerType, name: t('employeeMap.layerLandfills'), icon: '🟢', visible: layerVisibility.value.landfills, color: '#22c55e' },
  { id: 'recyclers' as LayerType, name: t('employeeMap.layerRecyclers'), icon: '🔵', visible: layerVisibility.value.recyclers, color: '#2563EB' },
  { id: 'reception' as LayerType, name: t('employeeMap.layerReception'), icon: '🟡', visible: layerVisibility.value.reception, color: '#EAB308' },
  { id: 'dumps' as LayerType, name: t('employeeMap.layerDumps'), icon: '🟠', visible: layerVisibility.value.dumps, color: '#DC2626' },
])

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
}

// ==================== REGISTRY STATE ====================
const activeRegistry = ref<LayerType>('landfills')
const registrySearchQuery = ref('')
const showViewModal = ref(false)
const showEditModal = ref(false)
const showDeleteConfirm = ref(false)
const showNotification = ref(false)
const notificationMessage = ref('')
const isCreating = ref(false)

const showCoordPicker = ref(false)
const pickerCoords = ref<{ lat: number; lng: number } | null>(null)
const activeFormForPicker = ref<any>(null)

const openCoordPicker = (form: any) => {
  activeFormForPicker.value = form
  pickerCoords.value = (form.gpsLat && form.gpsLng) ? { lat: parseFloat(form.gpsLat), lng: parseFloat(form.gpsLng) } : null
  showCoordPicker.value = true
}

const onPickerConfirm = (coords: { lat: number; lng: number }) => {
  if (activeFormForPicker.value) {
    activeFormForPicker.value.gpsLat = String(coords.lat)
    activeFormForPicker.value.gpsLng = String(coords.lng)
  }
}

const registries = computed(() => [
  { id: 'landfills' as LayerType, name: t('employeeMap.layerLandfills'), icon: '🟢', color: '#22c55e' },
  { id: 'recyclers' as LayerType, name: t('employeeMap.layerRecyclers'), icon: '🔵', color: '#2563EB' },
  { id: 'reception' as LayerType, name: t('employeeMap.layerReception'), icon: '🟡', color: '#EAB308' },
  { id: 'dumps' as LayerType, name: t('employeeMap.layerDumps'), icon: '🟠', color: '#DC2626' },
  { id: 'payers' as LayerType, name: t('employeeMap.layerPayers'), icon: '🟣', color: '#9333EA' },
])

const regions = ['г. Бишкек', 'г. Ош', 'Чуйская обл.', 'Ошская обл.', 'Джалал-Абадская обл.', 'Иссык-Кульская обл.', 'Нарынская обл.', 'Таласская обл.', 'Баткенская обл.']
const wasteTypeOptions = ['Пластик', 'Бумага', 'Картон', 'Стекло', 'Металл', 'Алюминий', 'Электроника', 'Батарейки', 'Текстиль', 'Органика', 'Шины', 'Масла', 'Строительные', 'Бытовые']

// ==================== LANDFILLS ====================
interface Landfill {
  id: number; name: string; region: string; district: string; type: string; area: number; volume: number
  wasteTypes: string[]; gpsLat: string; gpsLng: string; address: string; organization: string
  discoveryDate: string; status: string; photo: string; notes: string
}

// Маппинг backend → frontend-shape для таблиц EmployeeMap.
const landfills = computed(() => backendLandfills.value.map(l => ({
  id: l.id,
  name: l.name ?? '',
  region: l.region ?? '',
  district: '',
  type: l.type === 'MUNICIPAL'
    ? t('employeeMap.statusSanctioned')
    : (l.type === 'INDUSTRIAL' || l.type === 'HAZARDOUS')
      ? 'Промышленный отвал'
      : t('employeeMap.statusUnsanctioned'),
  area: Number(l.area ?? 0),
  volume: Number(l.currentVolume ?? 0),
  wasteTypes: [] as string[],
  gpsLat: l.latitude != null ? String(l.latitude) : '',
  gpsLng: l.longitude != null ? String(l.longitude) : '',
  address: l.address ?? '',
  organization: l.operator ?? '',
  discoveryDate: l.yearOpened ? '01.01.' + l.yearOpened : '',
  status: l.status === 'ACTIVE' ? t('employeeMap.statusActive')
    : l.status === 'CLOSED' ? t('employeeMap.statusClosed')
    : t('employeeMap.statusReconstruction'),
  photo: '',
  notes: '',
})))

const selectedLandfill = ref<Landfill | null>(null)
const landfillForm = ref<Landfill>({ id: 0, name: '', region: '', district: '', type: '', area: 0, volume: 0, wasteTypes: [], gpsLat: '', gpsLng: '', address: '', organization: '', discoveryDate: '', status: '', photo: '', notes: '' })

const filteredLandfills = computed(() => {
  if (!registrySearchQuery.value) return landfills.value
  const q = registrySearchQuery.value.toLowerCase()
  return landfills.value.filter(l => l.name.toLowerCase().includes(q) || l.region.toLowerCase().includes(q))
})

// ==================== RECEPTION POINTS ====================
interface ReceptionPoint {
  id: number; name: string; region: string; district: string; address: string; gpsLat: string; gpsLng: string
  wasteTypes: string[]; workingHours: string; phone: string; email: string; organization: string; status: string; notes: string
}

const receptionPoints = computed(() => backendCollectionPoints.value.map(p => ({
  id: p.id,
  name: p.name ?? '',
  region: p.region ?? '',
  district: '',
  address: p.address ?? '',
  gpsLat: p.latitude != null ? String(p.latitude) : '',
  gpsLng: p.longitude != null ? String(p.longitude) : '',
  wasteTypes: p.wasteTypes ?? [],
  workingHours: p.operatingHours ?? '',
  phone: p.contactPhone ?? '',
  email: '',
  organization: p.operator ?? '',
  status: p.status === 'ACTIVE' ? t('employeeMap.statusWorking')
    : p.status === 'RENOVATING' ? t('employeeMap.statusTempClosed')
    : t('employeeMap.statusClosed'),
  notes: '',
})))

const selectedReception = ref<ReceptionPoint | null>(null)
const receptionForm = ref<ReceptionPoint>({ id: 0, name: '', region: '', district: '', address: '', gpsLat: '', gpsLng: '', wasteTypes: [], workingHours: '', phone: '', email: '', organization: '', status: '', notes: '' })

const filteredReception = computed(() => {
  if (!registrySearchQuery.value) return receptionPoints.value
  const q = registrySearchQuery.value.toLowerCase()
  return receptionPoints.value.filter(r => r.name.toLowerCase().includes(q) || r.region.toLowerCase().includes(q) || r.address.toLowerCase().includes(q))
})

// ==================== RECYCLERS ====================
interface Recycler {
  id: number; name: string; inn: string; address: string; gpsLat: string; gpsLng: string; director: string
  contactPerson: string; phone: string; email: string; activityType: string; wasteTypes: string[]
  capacity: number; licenseNumber: string; licenseExpiry: string; region: string; status: string; notes: string
}

const recyclers = computed(() => backendRecyclers.value.map(r => ({
  id: r.id,
  name: r.companyName ?? '',
  inn: r.inn ?? '',
  address: r.address ?? '',
  gpsLat: r.latitude != null ? String(r.latitude) : '',
  gpsLng: r.longitude != null ? String(r.longitude) : '',
  director: '',
  contactPerson: '',
  phone: r.phone ?? '',
  email: r.email ?? '',
  activityType: (r.wasteTypes ?? []).join(', '),
  wasteTypes: r.wasteTypes ?? [],
  capacity: 0,
  licenseNumber: r.licenseNumber ?? '',
  licenseExpiry: r.licenseExpiry ?? '',
  region: r.region ?? '',
  status: r.status === 'ACTIVE' ? t('employeeMap.statusActive')
    : r.status === 'SUSPENDED' ? t('employeeMap.statusSuspended')
    : t('employeeMap.statusInactive'),
  notes: '',
})))

const selectedRecycler = ref<Recycler | null>(null)
const recyclerForm = ref<Recycler>({ id: 0, name: '', inn: '', address: '', gpsLat: '', gpsLng: '', director: '', contactPerson: '', phone: '', email: '', activityType: '', wasteTypes: [], capacity: 0, licenseNumber: '', licenseExpiry: '', region: '', status: '', notes: '' })

const filteredRecyclers = computed(() => {
  if (!registrySearchQuery.value) return recyclers.value
  const q = registrySearchQuery.value.toLowerCase()
  return recyclers.value.filter(r => r.name.toLowerCase().includes(q) || r.inn.includes(q) || r.region.toLowerCase().includes(q))
})

// ==================== PRODUCERS ====================
interface Producer {
  id: number; name: string; inn: string; address: string; gpsLat: string; gpsLng: string; director: string
  contactPerson: string; phone: string; email: string; productType: string; packagingTypes: string[]
  annualVolume: number; region: string; status: string; notes: string
}

const producers = ref<Producer[]>([
  { id: 1, name: 'ОсОО «Кока-Кола Бишкек Ботлерс»', inn: '01234567891301', address: 'г. Бишкек, ул. Фучика, 14/1', gpsLat: '42.8345', gpsLng: '74.5567', director: 'Иванов Петр', contactPerson: 'Сидорова Анна', phone: '+996 312 54-32-10', email: 'info@coca-cola.kg', productType: 'Производство напитков', packagingTypes: ['ПЭТ-бутылки', 'Алюминиевые банки'], annualVolume: 50000, region: 'г. Бишкек', status: 'Активен', notes: '' },
  { id: 2, name: 'ОАО «Бишкексут»', inn: '01234567891302', address: 'г. Бишкек, ул. Фрунзе, 480', gpsLat: '42.8567', gpsLng: '74.5234', director: 'Асанов Кубат', contactPerson: 'Жумабаева Айгуль', phone: '+996 312 43-21-09', email: 'info@bishkeksut.kg', productType: 'Молочная продукция', packagingTypes: ['ПЭТ-бутылки', 'Тетрапак', 'Пластиковые стаканы'], annualVolume: 25000, region: 'г. Бишкек', status: 'Активен', notes: '' },
  { id: 3, name: 'ОсОО «Шоро»', inn: '01234567891303', address: 'г. Бишкек, ул. Ибраимова, 29', gpsLat: '42.8789', gpsLng: '74.5890', director: 'Эгембердиева Жылдыз', contactPerson: 'Токтосунов Азамат', phone: '+996 312 32-10-98', email: 'info@shoro.kg', productType: 'Производство напитков', packagingTypes: ['ПЭТ-бутылки', 'Стеклянные бутылки'], annualVolume: 15000, region: 'г. Бишкек', status: 'Активен', notes: '' },
  { id: 4, name: 'ОсОО «Арпа»', inn: '01234567891304', address: 'г. Бишкек, ул. Льва Толстого, 36', gpsLat: '42.8123', gpsLng: '74.6012', director: 'Касымов Эрнис', contactPerson: 'Бейшенова Айжан', phone: '+996 312 21-09-87', email: 'info@arpa.kg', productType: 'Пивоваренная компания', packagingTypes: ['Стеклянные бутылки', 'Алюминиевые банки', 'ПЭТ-бутылки'], annualVolume: 35000, region: 'г. Бишкек', status: 'Активен', notes: '' },
  { id: 5, name: 'ОсОО «Южный пластик»', inn: '01234567891305', address: 'г. Ош, ул. Промышленная, 12', gpsLat: '40.5345', gpsLng: '72.7789', director: 'Мамытов Бакыт', contactPerson: 'Асанова Динара', phone: '+996 3222 3-45-67', email: 'south@plastic.kg', productType: 'Производство пластиковой тары', packagingTypes: ['ПЭТ-бутылки', 'Пластиковые контейнеры'], annualVolume: 8000, region: 'г. Ош', status: 'На проверке', notes: '' },
])

const selectedProducer = ref<Producer | null>(null)
const producerForm = ref<Producer>({ id: 0, name: '', inn: '', address: '', gpsLat: '', gpsLng: '', director: '', contactPerson: '', phone: '', email: '', productType: '', packagingTypes: [], annualVolume: 0, region: '', status: '', notes: '' })

const filteredProducers = computed(() => {
  if (!registrySearchQuery.value) return producers.value
  const q = registrySearchQuery.value.toLowerCase()
  return producers.value.filter(p => p.name.toLowerCase().includes(q) || p.inn.includes(q) || p.region.toLowerCase().includes(q))
})

// ==================== DUMPS ====================
interface Dump {
  id: number; name: string; region: string; address: string; gpsLat: string; gpsLng: string
  area: number; discoveryDate: string; dumpStatus: string; notes: string
}

const dumpStatusLabels: Record<string, string> = {
  ACTIVE: t('employeeMap.statusDiscovered'),
  UNDER_CLEANUP: t('employeeMap.statusLiquidating'),
  CLEANED: t('employeeMap.statusLiquidated'),
  MONITORING: 'Под наблюдением',
}
const dumps = computed(() => backendDumps.value.map(d => ({
  id: d.id,
  name: d.name ?? '',
  region: d.region ?? '',
  address: d.address ?? '',
  gpsLat: d.latitude != null ? String(d.latitude) : '',
  gpsLng: d.longitude != null ? String(d.longitude) : '',
  area: Number(d.area ?? 0),
  discoveryDate: d.discoveredDate ?? '',
  dumpStatus: dumpStatusLabels[d.status ?? ''] ?? d.status ?? '',
  notes: d.notes ?? '',
})))

const selectedDump = ref<Dump | null>(null)
const dumpForm = ref<Dump>({ id: 0, name: '', region: '', address: '', gpsLat: '', gpsLng: '', area: 0, discoveryDate: '', dumpStatus: '', notes: '' })

const dumpPhotos = ref<Array<{ name: string; data: string; size: string }>>([])

const handleDumpPhotoUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files) return
  const files = Array.from(input.files)
  for (const file of files) {
    if (dumpPhotos.value.length >= 5) break
    const reader = new FileReader()
    reader.onload = () => {
      const sizeKB = Math.round(file.size / 1024)
      dumpPhotos.value.push({
        name: file.name,
        data: reader.result as string,
        size: sizeKB > 1024 ? (sizeKB / 1024).toFixed(1) + ' ' + t('employeeMap.mb') : sizeKB + ' ' + t('employeeMap.kb'),
      })
    }
    reader.readAsDataURL(file)
  }
  input.value = ''
}

const removeDumpPhoto = (index: number) => {
  dumpPhotos.value.splice(index, 1)
}

const filteredDumps = computed(() => {
  if (!registrySearchQuery.value) return dumps.value
  const q = registrySearchQuery.value.toLowerCase()
  return dumps.value.filter(d => d.name.toLowerCase().includes(q) || d.region.toLowerCase().includes(q))
})

// ==================== PAYERS ====================
interface Payer {
  id: number; name: string; inn: string; region: string; address: string; gpsLat: string; gpsLng: string
  phone: string; category: string; calcStatus: string
}

const payers = ref<Payer[]>([
  { id: 61, name: 'ОсОО «Кока-Кола Бишкек Ботлерс»', inn: '02907202010020', region: 'г. Бишкек', address: 'ул. Фучика, 14/1', gpsLat: '42.8345', gpsLng: '74.5567', phone: '+996 312 54-32-10', category: 'Крупный импортёр', calcStatus: 'Оплачен' },
  { id: 62, name: 'ОАО «Бишкексут»', inn: '01204200010399', region: 'г. Бишкек', address: 'ул. Фрунзе, 480', gpsLat: '42.8567', gpsLng: '74.5234', phone: '+996 312 43-21-09', category: 'Производитель', calcStatus: 'Оплачен' },
  { id: 63, name: 'ОсОО «Шоро»', inn: '02406200210072', region: 'г. Бишкек', address: 'ул. Ибраимова, 29', gpsLat: '42.8789', gpsLng: '74.5890', phone: '+996 312 32-10-98', category: 'Производитель', calcStatus: 'На проверке' },
  { id: 64, name: 'ОсОО «Арпа»', inn: '02502200310045', region: 'г. Бишкек', address: 'ул. Льва Толстого, 36', gpsLat: '42.8123', gpsLng: '74.6012', phone: '+996 312 21-09-87', category: 'Производитель', calcStatus: 'Оплачен' },
  { id: 65, name: 'ОсОО «Южный Пластик»', inn: '12308200110089', region: 'г. Ош', address: 'ул. Промышленная, 12', gpsLat: '40.5345', gpsLng: '72.7789', phone: '+996 3222 3-45-67', category: 'Производитель', calcStatus: 'Просрочен' },
  { id: 66, name: 'ОсОО «ИнтерГласс»', inn: '02309200410156', region: 'Чуйская обл.', address: 'г. Токмок, ул. Промышленная, 25', gpsLat: '42.8234', gpsLng: '75.2789', phone: '+996 3138 8-76-54', category: 'Производитель', calcStatus: 'Оплачен' },
  { id: 67, name: 'ОсОО «Азия Фуд»', inn: '02410200510234', region: 'г. Бишкек', address: 'ул. Жибек Жолу, 498', gpsLat: '42.8456', gpsLng: '74.6234', phone: '+996 312 10-98-76', category: 'Импортёр', calcStatus: 'На проверке' },
  { id: 68, name: 'ОсОО «ЭнергоПром»', inn: '02511200610312', region: 'г. Бишкек', address: 'ул. Сухэ-Батора, 5', gpsLat: '42.8678', gpsLng: '74.5012', phone: '+996 312 09-87-65', category: 'Импортёр', calcStatus: 'Оплачен' },
])

const selectedPayer = ref<Payer | null>(null)
const payerForm = ref<Payer>({ id: 0, name: '', inn: '', region: '', address: '', gpsLat: '', gpsLng: '', phone: '', category: '', calcStatus: '' })

const filteredPayers = computed(() => {
  if (!registrySearchQuery.value) return payers.value
  const q = registrySearchQuery.value.toLowerCase()
  return payers.value.filter(p => p.name.toLowerCase().includes(q) || p.inn.includes(q) || p.region.toLowerCase().includes(q))
})

// ==================== MAP POINTS FROM BACKEND ====================
// Источник — общий composable useGisPublicData (см. выше).
// Producers и payers намеренно не добавляются на карту.

const allMapPoints = computed<MapPoint[]>(() => {
  const points: MapPoint[] = []
  landfills.value.forEach(l => {
    if (l.gpsLat && l.gpsLng) {
      points.push({
        id: l.id, type: 'landfills', name: l.name, lat: parseFloat(l.gpsLat), lng: parseFloat(l.gpsLng),
        address: l.address || l.region, phone: '', status: l.status, description: l.notes,
      })
    }
  })
  receptionPoints.value.forEach(r => {
    if (r.gpsLat && r.gpsLng) {
      points.push({
        id: r.id, type: 'reception', name: r.name, lat: parseFloat(r.gpsLat), lng: parseFloat(r.gpsLng),
        address: r.address, phone: r.phone, status: r.status, description: r.notes,
      })
    }
  })
  recyclers.value.forEach(r => {
    if (r.gpsLat && r.gpsLng) {
      points.push({
        id: r.id, type: 'recyclers', name: r.name, lat: parseFloat(r.gpsLat), lng: parseFloat(r.gpsLng),
        address: r.address, phone: r.phone, status: r.status, description: r.activityType,
      })
    }
  })
  dumps.value.forEach(d => {
    if (d.gpsLat && d.gpsLng) {
      points.push({
        id: d.id, type: 'dumps', name: d.name, lat: parseFloat(d.gpsLat), lng: parseFloat(d.gpsLng),
        address: d.address || d.region, phone: '', status: d.dumpStatus, description: d.notes,
      })
    }
  })
  return points
})

const visiblePoints = computed(() => {
  return allMapPoints.value.filter(point => {
    const layer = layers.value.find(l => l.id === point.type)
    return layer?.visible ?? false
  })
})

// ==================== CLUSTERING ====================
interface ClusterItem { type: 'cluster'; lat: number; lng: number; count: number; points: MapPoint[] }
interface MarkerItem { type: 'marker'; point: MapPoint }
type DisplayItem = ClusterItem | MarkerItem

// Сетка пересчитана под ограничения по стране (minZoom=6).
const getGridSize = (zoom: number): number => {
  if (zoom <= 7) return 1.0
  if (zoom <= 8) return 0.6
  if (zoom <= 9) return 0.35
  if (zoom <= 10) return 0.2
  if (zoom <= 11) return 0.1
  return 0
}

const displayItems = computed<DisplayItem[]>(() => {
  const gridSize = getGridSize(mapZoom.value)
  if (gridSize === 0) {
    return visiblePoints.value.map(p => ({ type: 'marker' as const, point: p }))
  }
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
      let latSum = 0; let lngSum = 0
      points.forEach(p => { latSum += p.lat; lngSum += p.lng })
      items.push({ type: 'cluster', lat: latSum / points.length, lng: lngSum / points.length, count: points.length, points })
    }
  })
  return items
})

const onClusterClick = (cluster: ClusterItem) => {
  const map = mapRef.value?.leafletObject as L.Map | undefined
  if (!map || cluster.points.length === 0) return
  const latlngs = cluster.points.map(p => L.latLng(p.lat, p.lng))
  const bounds = L.latLngBounds(latlngs)
  const diagMeters =
    bounds.isValid() && bounds.getNorthEast().distanceTo(bounds.getSouthWest())
  if (typeof diagMeters === 'number' && diagMeters > 200) {
    map.flyToBounds(bounds, {
      padding: [60, 60],
      duration: 0.6,
      maxZoom: KG_MAX_ZOOM,
    })
  } else {
    const next = Math.min(map.getZoom() + 3, KG_MAX_ZOOM)
    map.flyTo([cluster.lat, cluster.lng], next, { duration: 0.6 })
  }
}

// ==================== MAP FUNCTIONS ====================
const createIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color:${color};width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 5px rgba(0,0,0,0.3);"></div>`,
    iconSize: [28, 28], iconAnchor: [14, 28], popupAnchor: [0, -28],
  })
}

const getMarkerIcon = (type: LayerType) => {
  const layer = layers.value.find(l => l.id === type)
  return createIcon(layer?.color || '#666')
}

const createClusterIcon = (count: number) => {
  const size = count > 20 ? 50 : count > 10 ? 44 : 38
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color:#0e888d;width:${size}px;height:${size}px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(14,136,141,0.4);display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:${count > 99 ? 12 : 14}px;">${count}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

// ==================== ОБЛАСТИ КЫРГЫЗСТАНА (GeoJSON + маска) ====================
const oblastStyleFn = () => oblastStyle
const oblastGeoJsonOptions = {
  onEachFeature: (feature: GeoJSON.Feature, layer: L.Layer) => {
    const pathLayer = layer as L.Path
    const name = (feature.properties as Record<string, string> | null)?.shapeName ?? ''
    if (name) pathLayer.bindTooltip(name, { sticky: true, className: 'oblast-tooltip' })
    pathLayer.on({
      mouseover: () => pathLayer.setStyle(oblastHoverStyle),
      mouseout: () => pathLayer.setStyle(oblastStyle),
    })
  },
}

// Маска «мир минус КР» добавляется императивно после готовности карты —
// ей нужен собственный pane между tilePane (200) и overlayPane (400).
const mapReady = ref(false)
let maskLayer: L.Polygon | null = null

const ensureMaskPane = (map: L.Map) => {
  if (!map.getPane(KG_MASK_PANE)) {
    const pane = map.createPane(KG_MASK_PANE)
    pane.style.zIndex = KG_MASK_PANE_Z
    pane.style.pointerEvents = 'none'
  }
}

const applyKgMask = () => {
  const map = mapRef.value?.leafletObject as L.Map | undefined
  if (!map || !oblastsGeo.value) return
  ensureMaskPane(map)
  if (maskLayer) {
    maskLayer.remove()
    maskLayer = null
  }
  maskLayer = L.polygon(buildMaskLatLngs(oblastsGeo.value), maskStyle).addTo(map)
}

const onMapReady = () => {
  mapReady.value = true
}

watch([mapReady, oblastsGeo], ([ready, data]) => {
  if (ready && data) applyKgMask()
})

onMounted(async () => {
  // Загружаем данные из сторов — без fetchAll() сторы остаются пустыми
  // и на карте не появляются маркеры. Ошибки подавлены в самих сторах.
  // Данные подгружаются через useGisPublicData (см. composables/useGisPublicData.ts)

  try {
    oblastsGeo.value = await loadKgOblasts()
  } catch (err) {
    console.warn('[EmployeeMap] Failed to load Kyrgyzstan oblasts GeoJSON:', err)
  }
})

const getStatusInfo = (status: string) => {
  const colorMap: Record<string, string> = {
    [t('employeeMap.statusActive')]: 'bg-green-100 text-green-700',
    [t('employeeMap.statusWorking')]: 'bg-green-100 text-green-700',
    [t('employeeMap.statusClosed')]: 'bg-gray-100 text-gray-700',
    [t('employeeMap.statusTempClosed')]: 'bg-yellow-100 text-yellow-700',
    [t('employeeMap.statusOnCheck')]: 'bg-yellow-100 text-yellow-700',
    [t('employeeMap.statusReconstruction')]: 'bg-blue-100 text-blue-700',
    [t('employeeMap.statusDiscovered')]: 'bg-red-100 text-red-700',
    [t('employeeMap.statusLiquidating')]: 'bg-orange-100 text-orange-700',
    [t('employeeMap.statusLiquidated')]: 'bg-green-100 text-green-700',
    [t('employeeMap.statusPaid')]: 'bg-green-100 text-green-700',
    [t('employeeMap.statusOverdue')]: 'bg-red-100 text-red-700',
  }
  return { label: status, color: colorMap[status] || 'bg-gray-100 text-gray-700' }
}

const getTypeLabel = (type: LayerType) => {
  const layer = layers.value.find(l => l.id === type)
  return layer?.name || type
}

const toggleLayer = (layerId: LayerType) => {
  layerVisibility.value[layerId] = !layerVisibility.value[layerId]
}

const performMapSearch = () => {
  if (!mapSearchQuery.value.trim()) {
    mapSearchResults.value = []
    showMapSearchResults.value = false
    return
  }
  const query = mapSearchQuery.value.toLowerCase()
  mapSearchResults.value = allMapPoints.value.filter(point =>
    point.name.toLowerCase().includes(query) || point.address.toLowerCase().includes(query)
  ).slice(0, 10)
  showMapSearchResults.value = mapSearchResults.value.length > 0
}

watch(mapSearchQuery, performMapSearch)

// Go to point on map (used by map search and table row clicks)
const goToMapPoint = (point: MapPoint) => {
  mapCenter.value = [point.lat, point.lng]
  mapZoom.value = 14
  showMapSearchResults.value = false
  mapSearchQuery.value = point.name

  if (!layerVisibility.value[point.type]) layerVisibility.value[point.type] = true
}

// Click on table row to go to map
const onTableRowClick = (item: any, type: LayerType) => {
  if (item.gpsLat && item.gpsLng) {
    const lat = parseFloat(item.gpsLat)
    const lng = parseFloat(item.gpsLng)
    if (!isNaN(lat) && !isNaN(lng)) {
      mapCenter.value = [lat, lng]
      mapZoom.value = 14
      if (!layerVisibility.value[type]) layerVisibility.value[type] = true

      // Scroll to map
      nextTick(() => {
        document.querySelector('.map-container')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    }
  }
}

// ==================== REGISTRY CRUD FUNCTIONS ====================
const getStatusClass = (status: string) => {
  const map: Record<string, string> = {
    [t('employeeMap.statusActive')]: 'bg-green-100 text-green-700',
    [t('employeeMap.statusWorking')]: 'bg-green-100 text-green-700',
    [t('employeeMap.statusClosed')]: 'bg-gray-100 text-gray-700',
    [t('employeeMap.statusTempClosed')]: 'bg-yellow-100 text-yellow-700',
    [t('employeeMap.statusOnCheck')]: 'bg-yellow-100 text-yellow-700',
    [t('employeeMap.statusReconstruction')]: 'bg-blue-100 text-blue-700',
    [t('employeeMap.statusSuspended')]: 'bg-red-100 text-red-700',
    [t('employeeMap.statusRecultivated')]: 'bg-teal-100 text-teal-700',
    [t('employeeMap.statusDiscovered')]: 'bg-red-100 text-red-700',
    [t('employeeMap.statusLiquidating')]: 'bg-orange-100 text-orange-700',
    [t('employeeMap.statusLiquidated')]: 'bg-green-100 text-green-700',
    [t('employeeMap.statusPaid')]: 'bg-green-100 text-green-700',
    [t('employeeMap.statusOverdue')]: 'bg-red-100 text-red-700',
  }
  return map[status] || 'bg-gray-100 text-gray-700'
}

const openView = (item: any) => {
  if (activeRegistry.value === 'landfills') selectedLandfill.value = item
  else if (activeRegistry.value === 'reception') selectedReception.value = item
  else if (activeRegistry.value === 'recyclers') selectedRecycler.value = item
  else if (activeRegistry.value === 'producers') selectedProducer.value = item
  else if (activeRegistry.value === 'dumps') selectedDump.value = item
  else if (activeRegistry.value === 'payers') selectedPayer.value = item
  showViewModal.value = true
}

const openEdit = (item: any) => {
  isCreating.value = false
  if (activeRegistry.value === 'landfills') { landfillForm.value = { ...item }; selectedLandfill.value = item }
  else if (activeRegistry.value === 'reception') { receptionForm.value = { ...item }; selectedReception.value = item }
  else if (activeRegistry.value === 'recyclers') { recyclerForm.value = { ...item }; selectedRecycler.value = item }
  else if (activeRegistry.value === 'producers') { producerForm.value = { ...item }; selectedProducer.value = item }
  else if (activeRegistry.value === 'dumps') { dumpForm.value = { ...item }; selectedDump.value = item }
  else if (activeRegistry.value === 'payers') { payerForm.value = { ...item }; selectedPayer.value = item }
  showEditModal.value = true
}

const openCreate = () => {
  isCreating.value = true
  if (activeRegistry.value === 'landfills') {
    landfillForm.value = { id: Math.max(0, ...landfills.value.map(l => l.id)) + 1, name: '', region: '', district: '', type: t('employeeMap.statusSanctioned'), area: 0, volume: 0, wasteTypes: [], gpsLat: '', gpsLng: '', address: '', organization: '', discoveryDate: '', status: t('employeeMap.statusActive'), photo: '', notes: '' }
  } else if (activeRegistry.value === 'reception') {
    receptionForm.value = { id: Math.max(0, ...receptionPoints.value.map(r => r.id)) + 1, name: '', region: '', district: '', address: '', gpsLat: '', gpsLng: '', wasteTypes: [], workingHours: '', phone: '', email: '', organization: '', status: t('employeeMap.statusWorking'), notes: '' }
  } else if (activeRegistry.value === 'recyclers') {
    recyclerForm.value = { id: Math.max(0, ...recyclers.value.map(r => r.id)) + 1, name: '', inn: '', address: '', gpsLat: '', gpsLng: '', director: '', contactPerson: '', phone: '', email: '', activityType: '', wasteTypes: [], capacity: 0, licenseNumber: '', licenseExpiry: '', region: '', status: t('employeeMap.statusActive'), notes: '' }
  } else if (activeRegistry.value === 'producers') {
    producerForm.value = { id: Math.max(0, ...producers.value.map(p => p.id)) + 1, name: '', inn: '', address: '', gpsLat: '', gpsLng: '', director: '', contactPerson: '', phone: '', email: '', productType: '', packagingTypes: [], annualVolume: 0, region: '', status: t('employeeMap.statusActive'), notes: '' }
  } else if (activeRegistry.value === 'dumps') {
    dumpForm.value = { id: Math.max(0, ...dumps.value.map(d => d.id)) + 1, name: '', region: '', address: '', gpsLat: '', gpsLng: '', area: 0, discoveryDate: '', dumpStatus: t('employeeMap.statusDiscovered'), notes: '' }
  } else if (activeRegistry.value === 'payers') {
    payerForm.value = { id: Math.max(0, ...payers.value.map(p => p.id)) + 1, name: '', inn: '', region: '', address: '', gpsLat: '', gpsLng: '', phone: '', category: '', calcStatus: '' }
  }
  showEditModal.value = true
}

const openDelete = (item: any) => {
  if (activeRegistry.value === 'landfills') selectedLandfill.value = item
  else if (activeRegistry.value === 'reception') selectedReception.value = item
  else if (activeRegistry.value === 'recyclers') selectedRecycler.value = item
  else if (activeRegistry.value === 'producers') selectedProducer.value = item
  else if (activeRegistry.value === 'dumps') selectedDump.value = item
  else if (activeRegistry.value === 'payers') selectedPayer.value = item
  showDeleteConfirm.value = true
}

// ═══════════════════════════════════════════════════════════════════════════
// CRUD-операции через backend API + автоматический refresh публичной карты.
// При успешном сохранении вызываем refresh useGisPublicData → главная страница
// (/registries) и эта же страница увидят изменения мгновенно.
// ═══════════════════════════════════════════════════════════════════════════
import api from '../../api/client'
import { loadGisPublicData } from '../../composables/useGisPublicData'

// ─── Мапперы frontend-form → backend-DTO ───
const mapLandfillToBackend = (form: Landfill): Record<string, unknown> => ({
  name: form.name,
  // Тип: «Санкционированная» = MUNICIPAL, «Промышленный отвал» = INDUSTRIAL,
  // «Несанкционированная» = используется для DUMPS отдельно — здесь MIXED.
  type: form.type === 'Промышленный отвал' ? 'INDUSTRIAL'
      : form.type === t('employeeMap.statusUnsanctioned') ? 'MIXED'
      : 'MUNICIPAL',
  region: form.region || null,
  address: form.address || null,
  latitude: form.gpsLat ? parseFloat(form.gpsLat) : null,
  longitude: form.gpsLng ? parseFloat(form.gpsLng) : null,
  area: form.area || null,
  status: form.status === t('employeeMap.statusActive') ? 'ACTIVE'
        : form.status === t('employeeMap.statusClosed') ? 'CLOSED'
        : 'SUSPENDED',
  operator: form.organization || null,
})

const mapReceptionToBackend = (form: ReceptionPoint): Record<string, unknown> => ({
  name: form.name,
  region: form.region || null,
  address: form.address || null,
  latitude: form.gpsLat ? parseFloat(form.gpsLat) : null,
  longitude: form.gpsLng ? parseFloat(form.gpsLng) : null,
  wasteTypes: form.wasteTypes,
  operatingHours: form.workingHours || null,
  contactPhone: form.phone || null,
  operator: form.organization || null,
  status: form.status === t('employeeMap.statusWorking') ? 'ACTIVE'
        : form.status === t('employeeMap.statusTempClosed') ? 'RENOVATING'
        : 'CLOSED',
})

const mapDumpToBackend = (form: Dump): Record<string, unknown> => ({
  name: form.name,
  region: form.region || null,
  address: form.address || null,
  latitude: form.gpsLat ? parseFloat(form.gpsLat) : null,
  longitude: form.gpsLng ? parseFloat(form.gpsLng) : null,
  area: form.area || null,
  status: form.dumpStatus === t('employeeMap.statusLiquidating') ? 'UNDER_CLEANUP'
        : form.dumpStatus === t('employeeMap.statusLiquidated') ? 'CLEANED'
        : form.dumpStatus === 'Под наблюдением' ? 'MONITORING'
        : 'ACTIVE',
  notes: form.notes || null,
  discoveredDate: form.discoveryDate || null,
})

const mapRecyclerToBackend = (form: Recycler): Record<string, unknown> => ({
  companyName: form.name,
  legalForm: 'ОсОО',
  inn: form.inn,
  region: form.region || null,
  address: form.address || null,
  latitude: form.gpsLat ? parseFloat(form.gpsLat) : null,
  longitude: form.gpsLng ? parseFloat(form.gpsLng) : null,
  director: form.director || null,
  contactPerson: form.contactPerson || null,
  phone: form.phone || null,
  email: form.email || null,
  licenseNumber: form.licenseNumber || null,
  licenseExpiry: form.licenseExpiry || null,
  status: form.status === t('employeeMap.statusActive') ? 'ACTIVE'
        : form.status === t('employeeMap.statusSuspended') ? 'SUSPENDED'
        : 'INACTIVE',
})

// ─── Универсальный shower toast ───
const showSuccess = (msg: string) => toastStore.show({ type: 'success', title: 'Сохранено', message: msg })
const showErr = (e: unknown) => {
  const msg = (e as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message
    ?? (e as { message?: string })?.message
    ?? 'Ошибка сервера'
  toastStore.show({ type: 'error', title: 'Ошибка сохранения', message: msg })
}

const saveItem = async () => {
  try {
    if (activeRegistry.value === 'landfills') {
      const dto = mapLandfillToBackend(landfillForm.value)
      if (isCreating.value) await api.post('/landfills', dto)
      else await api.put(`/landfills/${landfillForm.value.id}`, dto)
      await loadGisPublicData(true)
      showSuccess('Полигон сохранён в БД')
    } else if (activeRegistry.value === 'reception') {
      const dto = mapReceptionToBackend(receptionForm.value)
      if (isCreating.value) await api.post('/collection-points', dto)
      else await api.put(`/collection-points/${receptionForm.value.id}`, dto)
      await loadGisPublicData(true)
      showSuccess('Пункт приёма сохранён в БД')
    } else if (activeRegistry.value === 'recyclers') {
      const dto = mapRecyclerToBackend(recyclerForm.value)
      if (isCreating.value) await api.post('/recyclers', dto)
      else await api.put(`/recyclers/${recyclerForm.value.id}`, dto)
      await loadGisPublicData(true)
      showSuccess('Переработчик сохранён в БД')
    } else if (activeRegistry.value === 'dumps') {
      const dto = mapDumpToBackend(dumpForm.value)
      if (isCreating.value) await api.post('/dumps', dto)
      else await api.put(`/dumps/${dumpForm.value.id}`, dto)
      await loadGisPublicData(true)
      showSuccess('Свалка сохранена в БД')
    } else {
      // producers / payers пока локально (нет backend-сущности)
      toastStore.show({ type: 'info', title: 'Локальное сохранение', message: 'Этот реестр пока хранится локально. Backend-интеграция в следующем этапе.' })
    }
    showEditModal.value = false
  } catch (err) {
    showErr(err)
  }
}

const deleteItem = async () => {
  try {
    if (activeRegistry.value === 'landfills' && selectedLandfill.value) {
      // У landfill backend нет DELETE — отправляем полный DTO со статусом CLOSED.
      const dto = {
        ...mapLandfillToBackend({ ...selectedLandfill.value, status: t('employeeMap.statusClosed') }),
      }
      await api.put(`/landfills/${selectedLandfill.value.id}`, dto)
      await loadGisPublicData(true)
      showSuccess('Полигон помечен как закрытый')
    } else if (activeRegistry.value === 'reception' && selectedReception.value) {
      await api.delete(`/collection-points/${selectedReception.value.id}`)
      await loadGisPublicData(true)
      showSuccess('Пункт приёма удалён')
    } else if (activeRegistry.value === 'dumps' && selectedDump.value) {
      await api.delete(`/dumps/${selectedDump.value.id}`)
      await loadGisPublicData(true)
      showSuccess('Свалка удалена')
    } else if (activeRegistry.value === 'recyclers' && selectedRecycler.value) {
      await api.post(`/recyclers/${selectedRecycler.value.id}/toggle-status`)
      await loadGisPublicData(true)
      showSuccess('Статус переработчика переключён')
    } else {
      toastStore.show({ type: 'info', title: 'Локальное удаление', message: 'Этот реестр пока локальный.' })
    }
    showDeleteConfirm.value = false
  } catch (err) {
    showErr(err)
  }
}

const toggleWasteType = (form: any, type: string) => {
  const key = 'wasteTypes' in form ? 'wasteTypes' : 'packagingTypes'
  const idx = form[key].indexOf(type)
  if (idx === -1) form[key].push(type)
  else form[key].splice(idx, 1)
}

const getSelectedItemName = () => {
  if (activeRegistry.value === 'landfills') return selectedLandfill.value?.name
  if (activeRegistry.value === 'reception') return selectedReception.value?.name
  if (activeRegistry.value === 'recyclers') return selectedRecycler.value?.name
  if (activeRegistry.value === 'producers') return selectedProducer.value?.name
  if (activeRegistry.value === 'dumps') return selectedDump.value?.name
  if (activeRegistry.value === 'payers') return selectedPayer.value?.name
  return ''
}

const getRegistryAddButtonText = () => {
  return t('common.add')
}

const countByType = computed(() => ({
  landfills: landfills.value.length,
  reception: receptionPoints.value.length,
  recyclers: recyclers.value.length,
  producers: producers.value.length,
  dumps: dumps.value.length,
  payers: payers.value.length,
  total: allMapPoints.value.length,
}))
</script>

<template>
  <DashboardLayout role="employee" :roleTitle="roleTitle" userName="Мамытова Айгуль" :menuItems="menuItems">
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">{{ $t('pages.employee.mapTitle') }}</h1>
          <p class="text-gray-600 mt-1">{{ $t('pages.employee.mapSubtitle') }}</p>
        </div>
        <div class="flex items-center gap-2">
          <button @click="toastStore.show({ type: 'info', title: $t('common.export'), message: $t('employeeMap.exportNotReady') })" class="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            {{ $t('common.export') }}
          </button>
          <button @click="openCreate" class="px-4 py-2 bg-sky-600 text-white rounded-lg font-medium hover:bg-sky-700 transition-colors flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
            {{ getRegistryAddButtonText() }}
          </button>
        </div>
      </div>

      <SectionGuide
        :title="$t('employeeMap.guideTitle')"
        :description="$t('employeeMap.guideDescription')"
        :actions="[$t('employeeMap.guideAction1'), $t('employeeMap.guideAction2'), $t('employeeMap.guideAction3'), $t('employeeMap.guideAction4')]"
        storageKey="employee-gis-map"
      />

      <!-- Horizontal Filter Bar -->
      <div class="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div class="flex items-center gap-3 px-4 py-3 flex-wrap">
          <!-- Search -->
          <div class="relative w-[220px] flex-shrink-0">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input
              v-model="mapSearchQuery"
              type="text"
              :placeholder="$t('employeeMap.searchObject')"
              class="w-full h-9 pl-9 pr-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              @focus="showMapSearchResults = mapSearchResults.length > 0"
              @blur="setTimeout(() => showMapSearchResults = false, 200)"
            />
            <div v-if="showMapSearchResults" class="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-48 overflow-y-auto z-50">
              <div v-for="result in mapSearchResults" :key="`${result.type}-${result.id}`" @mousedown.prevent="goToMapPoint(result)" class="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0">
                <div class="flex items-center gap-2">
                  <div class="w-2.5 h-2.5 rounded-full flex-shrink-0" :style="{ backgroundColor: layers.find(l => l.id === result.type)?.color }"></div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 truncate">{{ result.name }}</p>
                    <p class="text-[11px] text-gray-500 truncate">{{ result.address }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- Map Section -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="relative" style="height: calc(100vh - 360px); min-height: 350px; max-height: 600px;">
          <KyrgyzstanCutoutMap
            :markers="(visiblePoints as any)"
            height="100%"
            mask-color="#ffffff"
          />

          <!-- ══ Слои (floating control — слева-сверху) ══ -->
          <div
            class="absolute top-4 left-4 z-[1000] bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/70 overflow-hidden"
            style="min-width: 200px;"
          >
            <div class="px-3 py-2 bg-gray-50/80 border-b border-gray-100">
              <p class="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Слои</p>
            </div>
            <div class="p-1.5 space-y-0.5">
              <label
                v-for="layer in layers"
                :key="layer.id"
                class="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors select-none"
              >
                <input
                  type="checkbox"
                  :checked="layer.visible"
                  @change="toggleLayer(layer.id)"
                  class="w-4 h-4 rounded border-gray-300 text-[#0e888d] focus:ring-[#0e888d] focus:ring-offset-0 cursor-pointer"
                />
                <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" :style="{ backgroundColor: layer.color }"></span>
                <span class="text-[13px] font-medium flex-1" :class="layer.visible ? 'text-gray-900' : 'text-gray-400'">
                  {{ layer.name }}
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Registry Tabs -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
        <div class="flex flex-wrap gap-2">
          <button v-for="reg in registries" :key="reg.id" @click="activeRegistry = reg.id; registrySearchQuery = ''" :class="['px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2', activeRegistry === reg.id ? 'bg-sky-100 text-sky-700' : 'text-gray-600 hover:bg-gray-100']">
            <span>{{ reg.icon }}</span>
            <span>{{ reg.name }}</span>
            <span class="px-1.5 py-0.5 text-xs rounded-full" :class="activeRegistry === reg.id ? 'bg-sky-200' : 'bg-gray-200'">{{ countByType[reg.id] }}</span>
          </button>
        </div>
      </div>

      <!-- Search -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div class="relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input v-model="registrySearchQuery" type="text" :placeholder="$t('common.search')" class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500" />
        </div>
      </div>

      <!-- LANDFILLS TABLE -->
      <div v-if="activeRegistry === 'landfills'" class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 bg-gray-50"><h3 class="font-semibold text-gray-900">{{ $t('employeeMap.registryLandfills') }}</h3></div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{{ $t('common.name') }}</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{{ $t('common.region') }}</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{{ $t('common.type') }}</th>
                <th class="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">{{ $t('employeeMap.area') }}</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{{ $t('common.status') }}</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{{ $t('common.actions') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="item in filteredLandfills" :key="item.id" @click="onTableRowClick(item, 'landfills')" class="hover:bg-sky-50 cursor-pointer transition-colors">
                <td class="px-4 py-3 font-medium text-gray-900">{{ item.name }}</td>
                <td class="px-4 py-3 text-sm text-gray-600">{{ item.region }}</td>
                <td class="px-4 py-3 text-sm"><span :class="item.type === 'Санкционированный' ? 'text-green-600' : 'text-red-600'">{{ item.type }}</span></td>
                <td class="px-4 py-3 text-sm text-right text-gray-900">{{ item.area }} га</td>
                <td class="px-4 py-3 text-center"><span :class="['px-2 py-1 rounded-full text-xs font-medium', getStatusClass(item.status)]">{{ item.status }}</span></td>
                <td class="px-4 py-3" @click.stop>
                  <div class="flex items-center justify-center gap-1">
                    <button @click="openView(item)" :title="$t('common.view')" class="p-1.5 text-gray-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg></button>
                    <button @click="openEdit(item)" :title="$t('common.edit')" class="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                    <button @click="openDelete(item)" :title="$t('common.delete')" class="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- RECEPTION TABLE -->
      <div v-if="activeRegistry === 'reception'" class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 bg-gray-50"><h3 class="font-semibold text-gray-900">{{ $t('employeeMap.registryReception') }}</h3></div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{{ $t('common.name') }}</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{{ $t('common.region') }}</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{{ $t('employeeMap.address') }}</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{{ $t('employeeMap.wasteTypes') }}</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{{ $t('common.status') }}</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{{ $t('common.actions') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="item in filteredReception" :key="item.id" @click="onTableRowClick(item, 'reception')" class="hover:bg-sky-50 cursor-pointer transition-colors">
                <td class="px-4 py-3 font-medium text-gray-900">{{ item.name }}</td>
                <td class="px-4 py-3 text-sm text-gray-600">{{ item.region }}</td>
                <td class="px-4 py-3 text-sm text-gray-600">{{ item.address }}</td>
                <td class="px-4 py-3"><div class="flex flex-wrap gap-1"><span v-for="wt in item.wasteTypes.slice(0, 3)" :key="wt" class="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">{{ wt }}</span><span v-if="item.wasteTypes.length > 3" class="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">+{{ item.wasteTypes.length - 3 }}</span></div></td>
                <td class="px-4 py-3 text-center"><span :class="['px-2 py-1 rounded-full text-xs font-medium', getStatusClass(item.status)]">{{ item.status }}</span></td>
                <td class="px-4 py-3" @click.stop>
                  <div class="flex items-center justify-center gap-1">
                    <button @click="openView(item)" :title="$t('common.view')" class="p-1.5 text-gray-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg></button>
                    <button @click="openEdit(item)" :title="$t('common.edit')" class="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                    <button @click="openDelete(item)" :title="$t('common.delete')" class="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- RECYCLERS TABLE -->
      <div v-if="activeRegistry === 'recyclers'" class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 bg-gray-50"><h3 class="font-semibold text-gray-900">{{ $t('employeeMap.registryRecyclers') }}</h3></div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{{ $t('common.name') }}</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{{ $t('employeeMap.inn') }}</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{{ $t('common.region') }}</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{{ $t('employeeMap.activityType') }}</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{{ $t('common.status') }}</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{{ $t('common.actions') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="item in filteredRecyclers" :key="item.id" @click="onTableRowClick(item, 'recyclers')" class="hover:bg-sky-50 cursor-pointer transition-colors">
                <td class="px-4 py-3 font-medium text-gray-900">{{ item.name }}</td>
                <td class="px-4 py-3 text-sm font-mono text-gray-600">{{ item.inn }}</td>
                <td class="px-4 py-3 text-sm text-gray-600">{{ item.region }}</td>
                <td class="px-4 py-3 text-sm text-gray-600">{{ item.activityType }}</td>
                <td class="px-4 py-3 text-center"><span :class="['px-2 py-1 rounded-full text-xs font-medium', getStatusClass(item.status)]">{{ item.status }}</span></td>
                <td class="px-4 py-3" @click.stop>
                  <div class="flex items-center justify-center gap-1">
                    <button @click="openView(item)" :title="$t('common.view')" class="p-1.5 text-gray-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg></button>
                    <button @click="openEdit(item)" :title="$t('common.edit')" class="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                    <button @click="openDelete(item)" :title="$t('common.delete')" class="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- PRODUCERS TABLE -->
      <div v-if="activeRegistry === 'producers'" class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 bg-gray-50"><h3 class="font-semibold text-gray-900">{{ $t('employeeMap.registryProducers') }}</h3></div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{{ $t('common.name') }}</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{{ $t('employeeMap.inn') }}</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{{ $t('common.region') }}</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{{ $t('employeeMap.productType') }}</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{{ $t('common.status') }}</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{{ $t('common.actions') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="item in filteredProducers" :key="item.id" @click="onTableRowClick(item, 'producers')" class="hover:bg-sky-50 cursor-pointer transition-colors">
                <td class="px-4 py-3 font-medium text-gray-900">{{ item.name }}</td>
                <td class="px-4 py-3 text-sm font-mono text-gray-600">{{ item.inn }}</td>
                <td class="px-4 py-3 text-sm text-gray-600">{{ item.region }}</td>
                <td class="px-4 py-3 text-sm text-gray-600">{{ item.productType }}</td>
                <td class="px-4 py-3 text-center"><span :class="['px-2 py-1 rounded-full text-xs font-medium', getStatusClass(item.status)]">{{ item.status }}</span></td>
                <td class="px-4 py-3" @click.stop>
                  <div class="flex items-center justify-center gap-1">
                    <button @click="openView(item)" :title="$t('common.view')" class="p-1.5 text-gray-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg></button>
                    <button @click="openEdit(item)" :title="$t('common.edit')" class="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                    <button @click="openDelete(item)" :title="$t('common.delete')" class="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- DUMPS TABLE -->
      <div v-if="activeRegistry === 'dumps'" class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 bg-gray-50"><h3 class="font-semibold text-gray-900">{{ $t('employeeMap.registryDumps') }}</h3></div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{{ $t('common.name') }}</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{{ $t('common.region') }}</th>
                <th class="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">{{ $t('employeeMap.areaHa') }}</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{{ $t('employeeMap.discoveryDate') }}</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{{ $t('common.status') }}</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{{ $t('common.actions') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="item in filteredDumps" :key="item.id" @click="onTableRowClick(item, 'dumps')" class="hover:bg-red-50 cursor-pointer transition-colors">
                <td class="px-4 py-3 font-medium text-gray-900">{{ item.name }}</td>
                <td class="px-4 py-3 text-sm text-gray-600">{{ item.region }}</td>
                <td class="px-4 py-3 text-sm text-right text-gray-900">{{ item.area }}</td>
                <td class="px-4 py-3 text-sm text-gray-600">{{ item.discoveryDate }}</td>
                <td class="px-4 py-3 text-center"><span :class="['px-2 py-1 rounded-full text-xs font-medium', getStatusClass(item.dumpStatus)]">{{ item.dumpStatus }}</span></td>
                <td class="px-4 py-3" @click.stop>
                  <div class="flex items-center justify-center gap-1">
                    <button @click="openView(item)" :title="$t('common.view')" class="p-1.5 text-gray-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg></button>
                    <button @click="openEdit(item)" :title="$t('common.edit')" class="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                    <button @click="openDelete(item)" :title="$t('common.delete')" class="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- PAYERS TABLE -->
      <div v-if="activeRegistry === 'payers'" class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 bg-gray-50"><h3 class="font-semibold text-gray-900">{{ $t('employeeMap.registryPayers') }}</h3></div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{{ $t('common.name') }}</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{{ $t('employeeMap.inn') }}</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{{ $t('employeeMap.category') }}</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{{ $t('common.region') }}</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{{ $t('employeeMap.calcStatus') }}</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{{ $t('common.actions') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="item in filteredPayers" :key="item.id" @click="onTableRowClick(item, 'payers')" class="hover:bg-purple-50 cursor-pointer transition-colors">
                <td class="px-4 py-3 font-medium text-gray-900">{{ item.name }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 font-mono">{{ item.inn }}</td>
                <td class="px-4 py-3 text-sm text-gray-600">{{ item.category }}</td>
                <td class="px-4 py-3 text-sm text-gray-600">{{ item.region }}</td>
                <td class="px-4 py-3 text-center"><span :class="['px-2 py-1 rounded-full text-xs font-medium', getStatusClass(item.calcStatus)]">{{ item.calcStatus }}</span></td>
                <td class="px-4 py-3" @click.stop>
                  <div class="flex items-center justify-center gap-1">
                    <button @click="openView(item)" :title="$t('common.view')" class="p-1.5 text-gray-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg></button>
                    <button @click="openEdit(item)" :title="$t('common.edit')" class="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- View Modal -->
    <Teleport to="body">
      <div v-if="showViewModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          <div class="p-6 border-b border-gray-200 flex items-center justify-between">
            <h3 class="text-xl font-bold text-gray-900">{{ $t('employeeMap.viewRecord') }}</h3>
            <button @click="showViewModal = false" class="p-2 text-gray-400 hover:text-gray-600"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
          <div class="p-6 overflow-y-auto max-h-[calc(90vh-130px)]">
            <!-- Landfill view -->
            <div v-if="activeRegistry === 'landfills' && selectedLandfill" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div><label class="text-sm text-gray-500">{{ $t('common.name') }}</label><p class="font-medium">{{ selectedLandfill.name }}</p></div>
                <div><label class="text-sm text-gray-500">{{ $t('common.status') }}</label><p><span :class="['px-2 py-1 rounded-full text-xs font-medium', getStatusClass(selectedLandfill.status)]">{{ selectedLandfill.status }}</span></p></div>
                <div><label class="text-sm text-gray-500">{{ $t('common.region') }}</label><p>{{ selectedLandfill.region }}</p></div>
                <div><label class="text-sm text-gray-500">{{ $t('employeeMap.district') }}</label><p>{{ selectedLandfill.district }}</p></div>
                <div><label class="text-sm text-gray-500">{{ $t('common.type') }}</label><p>{{ selectedLandfill.type }}</p></div>
                <div><label class="text-sm text-gray-500">{{ $t('employeeMap.area') }}</label><p>{{ selectedLandfill.area }} {{ $t('employeeMap.ha') }}</p></div>
                <div><label class="text-sm text-gray-500">{{ $t('employeeMap.volume') }}</label><p>{{ selectedLandfill.volume?.toLocaleString() }} {{ $t('common.tons') }}</p></div>
                <div><label class="text-sm text-gray-500">{{ $t('employeeMap.organization') }}</label><p>{{ selectedLandfill.organization || '—' }}</p></div>
                <div class="col-span-2"><label class="text-sm text-gray-500">{{ $t('employeeMap.address') }}</label><p>{{ selectedLandfill.address }}</p></div>
                <div><label class="text-sm text-gray-500">GPS</label><p class="font-mono text-sm">{{ selectedLandfill.gpsLat }}, {{ selectedLandfill.gpsLng }}</p></div>
                <div><label class="text-sm text-gray-500">{{ $t('employeeMap.discoveryDate') }}</label><p>{{ selectedLandfill.discoveryDate || '—' }}</p></div>
                <div class="col-span-2"><label class="text-sm text-gray-500">{{ $t('employeeMap.wasteTypes') }}</label><div class="flex flex-wrap gap-1 mt-1"><span v-for="wt in selectedLandfill.wasteTypes" :key="wt" class="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded">{{ wt }}</span></div></div>
                <div class="col-span-2" v-if="selectedLandfill.notes"><label class="text-sm text-gray-500">{{ $t('employeeMap.notes') }}</label><p>{{ selectedLandfill.notes }}</p></div>
              </div>
            </div>
            <!-- Reception view -->
            <div v-if="activeRegistry === 'reception' && selectedReception" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div><label class="text-sm text-gray-500">{{ $t('common.name') }}</label><p class="font-medium">{{ selectedReception.name }}</p></div>
                <div><label class="text-sm text-gray-500">{{ $t('common.status') }}</label><p><span :class="['px-2 py-1 rounded-full text-xs font-medium', getStatusClass(selectedReception.status)]">{{ selectedReception.status }}</span></p></div>
                <div><label class="text-sm text-gray-500">{{ $t('common.region') }}</label><p>{{ selectedReception.region }}</p></div>
                <div><label class="text-sm text-gray-500">{{ $t('employeeMap.district') }}</label><p>{{ selectedReception.district }}</p></div>
                <div class="col-span-2"><label class="text-sm text-gray-500">{{ $t('employeeMap.address') }}</label><p>{{ selectedReception.address }}</p></div>
                <div><label class="text-sm text-gray-500">{{ $t('employeeMap.workingHours') }}</label><p>{{ selectedReception.workingHours }}</p></div>
                <div><label class="text-sm text-gray-500">{{ $t('employeeMap.phone') }}</label><p>{{ selectedReception.phone }}</p></div>
                <div><label class="text-sm text-gray-500">Email</label><p>{{ selectedReception.email }}</p></div>
                <div><label class="text-sm text-gray-500">{{ $t('employeeMap.organization') }}</label><p>{{ selectedReception.organization }}</p></div>
                <div><label class="text-sm text-gray-500">GPS</label><p class="font-mono text-sm">{{ selectedReception.gpsLat }}, {{ selectedReception.gpsLng }}</p></div>
                <div class="col-span-2"><label class="text-sm text-gray-500">{{ $t('employeeMap.wasteTypes') }}</label><div class="flex flex-wrap gap-1 mt-1"><span v-for="wt in selectedReception.wasteTypes" :key="wt" class="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">{{ wt }}</span></div></div>
              </div>
            </div>
            <!-- Recycler view -->
            <div v-if="activeRegistry === 'recyclers' && selectedRecycler" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div><label class="text-sm text-gray-500">{{ $t('common.name') }}</label><p class="font-medium">{{ selectedRecycler.name }}</p></div>
                <div><label class="text-sm text-gray-500">{{ $t('common.status') }}</label><p><span :class="['px-2 py-1 rounded-full text-xs font-medium', getStatusClass(selectedRecycler.status)]">{{ selectedRecycler.status }}</span></p></div>
                <div><label class="text-sm text-gray-500">{{ $t('employeeMap.inn') }}</label><p class="font-mono">{{ selectedRecycler.inn }}</p></div>
                <div><label class="text-sm text-gray-500">{{ $t('common.region') }}</label><p>{{ selectedRecycler.region }}</p></div>
                <div class="col-span-2"><label class="text-sm text-gray-500">{{ $t('employeeMap.address') }}</label><p>{{ selectedRecycler.address }}</p></div>
                <div><label class="text-sm text-gray-500">{{ $t('employeeMap.director') }}</label><p>{{ selectedRecycler.director }}</p></div>
                <div><label class="text-sm text-gray-500">{{ $t('employeeMap.contactPerson') }}</label><p>{{ selectedRecycler.contactPerson }}</p></div>
                <div><label class="text-sm text-gray-500">{{ $t('employeeMap.phone') }}</label><p>{{ selectedRecycler.phone }}</p></div>
                <div><label class="text-sm text-gray-500">Email</label><p>{{ selectedRecycler.email }}</p></div>
                <div><label class="text-sm text-gray-500">{{ $t('employeeMap.activityType') }}</label><p>{{ selectedRecycler.activityType }}</p></div>
                <div><label class="text-sm text-gray-500">{{ $t('employeeMap.capacity') }}</label><p>{{ selectedRecycler.capacity?.toLocaleString() }} {{ $t('employeeMap.tonsPerYear') }}</p></div>
                <div><label class="text-sm text-gray-500">{{ $t('employeeMap.license') }}</label><p class="font-mono text-sky-600">{{ selectedRecycler.licenseNumber }}</p></div>
                <div><label class="text-sm text-gray-500">{{ $t('employeeMap.validUntil') }}</label><p>{{ selectedRecycler.licenseExpiry }}</p></div>
                <div class="col-span-2"><label class="text-sm text-gray-500">{{ $t('employeeMap.wasteTypes') }}</label><div class="flex flex-wrap gap-1 mt-1"><span v-for="wt in selectedRecycler.wasteTypes" :key="wt" class="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">{{ wt }}</span></div></div>
              </div>
            </div>
            <!-- Producer view -->
            <div v-if="activeRegistry === 'producers' && selectedProducer" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div><label class="text-sm text-gray-500">{{ $t('common.name') }}</label><p class="font-medium">{{ selectedProducer.name }}</p></div>
                <div><label class="text-sm text-gray-500">{{ $t('common.status') }}</label><p><span :class="['px-2 py-1 rounded-full text-xs font-medium', getStatusClass(selectedProducer.status)]">{{ selectedProducer.status }}</span></p></div>
                <div><label class="text-sm text-gray-500">{{ $t('employeeMap.inn') }}</label><p class="font-mono">{{ selectedProducer.inn }}</p></div>
                <div><label class="text-sm text-gray-500">{{ $t('common.region') }}</label><p>{{ selectedProducer.region }}</p></div>
                <div class="col-span-2"><label class="text-sm text-gray-500">{{ $t('employeeMap.address') }}</label><p>{{ selectedProducer.address }}</p></div>
                <div><label class="text-sm text-gray-500">{{ $t('employeeMap.director') }}</label><p>{{ selectedProducer.director }}</p></div>
                <div><label class="text-sm text-gray-500">{{ $t('employeeMap.contactPerson') }}</label><p>{{ selectedProducer.contactPerson }}</p></div>
                <div><label class="text-sm text-gray-500">{{ $t('employeeMap.phone') }}</label><p>{{ selectedProducer.phone }}</p></div>
                <div><label class="text-sm text-gray-500">Email</label><p>{{ selectedProducer.email }}</p></div>
                <div><label class="text-sm text-gray-500">{{ $t('employeeMap.productType') }}</label><p>{{ selectedProducer.productType }}</p></div>
                <div><label class="text-sm text-gray-500">{{ $t('employeeMap.annualVolume') }}</label><p>{{ selectedProducer.annualVolume?.toLocaleString() }} {{ $t('common.tons') }}</p></div>
                <div class="col-span-2"><label class="text-sm text-gray-500">{{ $t('employeeMap.packagingTypes') }}</label><div class="flex flex-wrap gap-1 mt-1"><span v-for="pt in selectedProducer.packagingTypes" :key="pt" class="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">{{ pt }}</span></div></div>
              </div>
            </div>
          </div>
          <div class="p-6 border-t border-gray-200 flex justify-end"><button @click="showViewModal = false" class="px-4 py-2 bg-sky-600 text-white rounded-lg font-medium hover:bg-sky-700">{{ $t('common.close') }}</button></div>
        </div>
      </div>
    </Teleport>

    <!-- Edit Modal -->
    <Teleport to="body">
      <div v-if="showEditModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          <div class="p-6 border-b border-gray-200 flex items-center justify-between">
            <h3 class="text-xl font-bold text-gray-900">{{ isCreating ? $t('employeeMap.createRecord') : $t('employeeMap.editRecord') }}</h3>
            <button @click="showEditModal = false" class="p-2 text-gray-400 hover:text-gray-600"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
          <div class="p-6 overflow-y-auto max-h-[calc(90vh-180px)] space-y-4">
            <!-- Landfill form -->
            <template v-if="activeRegistry === 'landfills'">
              <div class="grid grid-cols-2 gap-4">
                <div class="col-span-2"><label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('common.name') }} *</label><input v-model="landfillForm.name" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('common.region') }}</label><select v-model="landfillForm.region" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"><option value="">{{ $t('employeeMap.select') }}</option><option v-for="r in regions" :key="r" :value="r">{{ r }}</option></select></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('employeeMap.district') }}</label><input v-model="landfillForm.district" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('common.type') }}</label><select v-model="landfillForm.type" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"><option :value="$t('employeeMap.statusSanctioned')">{{ $t('employeeMap.statusSanctioned') }}</option><option :value="$t('employeeMap.statusUnsanctioned')">{{ $t('employeeMap.statusUnsanctioned') }}</option></select></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('common.status') }}</label><select v-model="landfillForm.status" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"><option :value="$t('employeeMap.statusActive')">{{ $t('employeeMap.statusActive') }}</option><option :value="$t('employeeMap.statusClosed')">{{ $t('employeeMap.statusClosed') }}</option><option :value="$t('employeeMap.statusReconstruction')">{{ $t('employeeMap.statusReconstruction') }}</option><option :value="$t('employeeMap.statusRecultivated')">{{ $t('employeeMap.statusRecultivated') }}</option></select></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('employeeMap.areaHa') }}</label><input v-model.number="landfillForm.area" type="number" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('employeeMap.volumeT') }}</label><input v-model.number="landfillForm.volume" type="number" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div class="col-span-2"><label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('employeeMap.address') }}</label><input v-model="landfillForm.address" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('employeeMap.gpsLat') }}</label><input v-model="landfillForm.gpsLat" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" placeholder="42.8746" /></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('employeeMap.gpsLng') }}</label><input v-model="landfillForm.gpsLng" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" placeholder="74.5698" /></div>
                <div class="col-span-2"><button type="button" @click="openCoordPicker(landfillForm)" class="px-4 py-2 text-sm font-medium text-sky-600 border border-sky-300 rounded-lg hover:bg-sky-50 transition-colors flex items-center gap-2"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>{{ $t('employeeMap.pickOnMap') }}</button></div>
                <div class="col-span-2"><label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('employeeMap.organization') }}</label><input v-model="landfillForm.organization" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div class="col-span-2"><label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('employeeMap.wasteTypes') }}</label><div class="flex flex-wrap gap-2"><button v-for="wt in wasteTypeOptions" :key="wt" @click="toggleWasteType(landfillForm, wt)" :class="['px-3 py-1.5 text-sm rounded-lg border transition-colors', landfillForm.wasteTypes.includes(wt) ? 'bg-orange-100 border-orange-300 text-orange-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100']">{{ wt }}</button></div></div>
                <div class="col-span-2"><label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('employeeMap.notes') }}</label><textarea v-model="landfillForm.notes" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"></textarea></div>
              </div>
            </template>
            <!-- Reception form -->
            <template v-if="activeRegistry === 'reception'">
              <div class="grid grid-cols-2 gap-4">
                <div class="col-span-2"><label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('common.name') }} *</label><input v-model="receptionForm.name" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('common.region') }}</label><select v-model="receptionForm.region" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"><option value="">{{ $t('employeeMap.select') }}</option><option v-for="r in regions" :key="r" :value="r">{{ r }}</option></select></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('employeeMap.district') }}</label><input v-model="receptionForm.district" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div class="col-span-2"><label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('employeeMap.address') }}</label><input v-model="receptionForm.address" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('employeeMap.gpsLat') }}</label><input v-model="receptionForm.gpsLat" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('employeeMap.gpsLng') }}</label><input v-model="receptionForm.gpsLng" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div class="col-span-2"><button type="button" @click="openCoordPicker(receptionForm)" class="px-4 py-2 text-sm font-medium text-sky-600 border border-sky-300 rounded-lg hover:bg-sky-50 transition-colors flex items-center gap-2"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>{{ $t('employeeMap.pickOnMap') }}</button></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('employeeMap.workingHours') }}</label><input v-model="receptionForm.workingHours" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" placeholder="09:00-18:00" /></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('common.status') }}</label><select v-model="receptionForm.status" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"><option :value="$t('employeeMap.statusWorking')">{{ $t('employeeMap.statusWorking') }}</option><option :value="$t('employeeMap.statusTempClosed')">{{ $t('employeeMap.statusTempClosed') }}</option><option :value="$t('employeeMap.statusClosed')">{{ $t('employeeMap.statusClosed') }}</option></select></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('employeeMap.phone') }}</label><input v-model="receptionForm.phone" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">Email</label><input v-model="receptionForm.email" type="email" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div class="col-span-2"><label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('employeeMap.organization') }}</label><input v-model="receptionForm.organization" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div class="col-span-2"><label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('employeeMap.wasteTypes') }}</label><div class="flex flex-wrap gap-2"><button v-for="wt in wasteTypeOptions" :key="wt" @click="toggleWasteType(receptionForm, wt)" :class="['px-3 py-1.5 text-sm rounded-lg border transition-colors', receptionForm.wasteTypes.includes(wt) ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100']">{{ wt }}</button></div></div>
              </div>
            </template>
            <!-- Recycler form -->
            <template v-if="activeRegistry === 'recyclers'">
              <div class="grid grid-cols-2 gap-4">
                <div class="col-span-2"><label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('common.name') }} *</label><input v-model="recyclerForm.name" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('employeeMap.inn') }}</label><input v-model="recyclerForm.inn" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('common.region') }}</label><select v-model="recyclerForm.region" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"><option value="">{{ $t('employeeMap.select') }}</option><option v-for="r in regions" :key="r" :value="r">{{ r }}</option></select></div>
                <div class="col-span-2"><label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('employeeMap.address') }}</label><input v-model="recyclerForm.address" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('employeeMap.gpsLat') }}</label><input v-model="recyclerForm.gpsLat" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('employeeMap.gpsLng') }}</label><input v-model="recyclerForm.gpsLng" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div class="col-span-2"><button type="button" @click="openCoordPicker(recyclerForm)" class="px-4 py-2 text-sm font-medium text-sky-600 border border-sky-300 rounded-lg hover:bg-sky-50 transition-colors flex items-center gap-2"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>{{ $t('employeeMap.pickOnMap') }}</button></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('employeeMap.director') }}</label><input v-model="recyclerForm.director" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('employeeMap.contactPerson') }}</label><input v-model="recyclerForm.contactPerson" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('employeeMap.phone') }}</label><input v-model="recyclerForm.phone" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">Email</label><input v-model="recyclerForm.email" type="email" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('employeeMap.activityType') }}</label><input v-model="recyclerForm.activityType" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('employeeMap.capacityTonsYear') }}</label><input v-model.number="recyclerForm.capacity" type="number" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('employeeMap.license') }}</label><input v-model="recyclerForm.licenseNumber" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('common.status') }}</label><select v-model="recyclerForm.status" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"><option :value="$t('employeeMap.statusActive')">{{ $t('employeeMap.statusActive') }}</option><option :value="$t('employeeMap.statusOnCheck')">{{ $t('employeeMap.statusOnCheck') }}</option><option :value="$t('employeeMap.statusSuspended')">{{ $t('employeeMap.statusSuspended') }}</option></select></div>
                <div class="col-span-2"><label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('employeeMap.wasteTypes') }}</label><div class="flex flex-wrap gap-2"><button v-for="wt in wasteTypeOptions" :key="wt" @click="toggleWasteType(recyclerForm, wt)" :class="['px-3 py-1.5 text-sm rounded-lg border transition-colors', recyclerForm.wasteTypes.includes(wt) ? 'bg-green-100 border-green-300 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100']">{{ wt }}</button></div></div>
              </div>
            </template>
            <!-- Producer form -->
            <template v-if="activeRegistry === 'producers'">
              <div class="grid grid-cols-2 gap-4">
                <div class="col-span-2"><label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('common.name') }} *</label><input v-model="producerForm.name" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('employeeMap.inn') }}</label><input v-model="producerForm.inn" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('common.region') }}</label><select v-model="producerForm.region" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"><option value="">{{ $t('employeeMap.select') }}</option><option v-for="r in regions" :key="r" :value="r">{{ r }}</option></select></div>
                <div class="col-span-2"><label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('employeeMap.address') }}</label><input v-model="producerForm.address" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('employeeMap.gpsLat') }}</label><input v-model="producerForm.gpsLat" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('employeeMap.gpsLng') }}</label><input v-model="producerForm.gpsLng" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div class="col-span-2"><button type="button" @click="openCoordPicker(producerForm)" class="px-4 py-2 text-sm font-medium text-sky-600 border border-sky-300 rounded-lg hover:bg-sky-50 transition-colors flex items-center gap-2"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>{{ $t('employeeMap.pickOnMap') }}</button></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('employeeMap.director') }}</label><input v-model="producerForm.director" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('employeeMap.contactPerson') }}</label><input v-model="producerForm.contactPerson" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('employeeMap.phone') }}</label><input v-model="producerForm.phone" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">Email</label><input v-model="producerForm.email" type="email" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('employeeMap.productType') }}</label><input v-model="producerForm.productType" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('employeeMap.annualVolumeT') }}</label><input v-model.number="producerForm.annualVolume" type="number" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('common.status') }}</label><select v-model="producerForm.status" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"><option :value="$t('employeeMap.statusActive')">{{ $t('employeeMap.statusActive') }}</option><option :value="$t('employeeMap.statusOnCheck')">{{ $t('employeeMap.statusOnCheck') }}</option><option :value="$t('employeeMap.statusSuspended')">{{ $t('employeeMap.statusSuspended') }}</option></select></div>
                <div class="col-span-2"><label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('employeeMap.packagingTypes') }}</label><div class="flex flex-wrap gap-2"><button v-for="pt in ['ПЭТ-бутылки', 'Стеклянные бутылки', 'Алюминиевые банки', 'Тетрапак', 'Пластиковые контейнеры', 'Пластиковые стаканы', 'Картонная упаковка']" :key="pt" @click="toggleWasteType(producerForm, pt)" :class="['px-3 py-1.5 text-sm rounded-lg border transition-colors', producerForm.packagingTypes.includes(pt) ? 'bg-purple-100 border-purple-300 text-purple-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100']">{{ pt }}</button></div></div>
              </div>
            </template>
            <!-- Dump form -->
            <template v-if="activeRegistry === 'dumps'">
              <div class="grid grid-cols-2 gap-4">
                <div class="col-span-2"><label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('common.name') }} *</label><input v-model="dumpForm.name" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('common.region') }}</label><select v-model="dumpForm.region" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"><option value="">{{ $t('employeeMap.select') }}</option><option v-for="r in regions" :key="r" :value="r">{{ r }}</option></select></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('common.status') }}</label><select v-model="dumpForm.dumpStatus" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"><option :value="$t('employeeMap.statusDiscovered')">{{ $t('employeeMap.statusDiscovered') }}</option><option :value="$t('employeeMap.statusLiquidating')">{{ $t('employeeMap.statusLiquidating') }}</option><option :value="$t('employeeMap.statusLiquidated')">{{ $t('employeeMap.statusLiquidated') }}</option></select></div>
                <div class="col-span-2"><label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('employeeMap.addressLocation') }}</label><input v-model="dumpForm.address" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('employeeMap.gpsLat') }}</label><input v-model="dumpForm.gpsLat" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" placeholder="42.8746" /></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('employeeMap.gpsLng') }}</label><input v-model="dumpForm.gpsLng" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" placeholder="74.5698" /></div>
                <div class="col-span-2"><button type="button" @click="openCoordPicker(dumpForm)" class="px-4 py-2 text-sm font-medium text-sky-600 border border-sky-300 rounded-lg hover:bg-sky-50 transition-colors flex items-center gap-2"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>{{ $t('employeeMap.pickOnMap') }}</button></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('employeeMap.areaHa') }}</label><input v-model.number="dumpForm.area" type="number" step="0.1" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('employeeMap.discoveryDate') }}</label><input v-model="dumpForm.discoveryDate" type="text" placeholder="01.01.2024" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div class="col-span-2"><label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('employeeMap.notes') }}</label><textarea v-model="dumpForm.notes" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"></textarea></div>
                <!-- Photo upload -->
                <div class="col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('employeeMap.photosMax5') }}</label>
                  <div class="flex flex-wrap gap-3 mb-3">
                    <div v-for="(photo, idx) in dumpPhotos" :key="idx" class="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 group">
                      <img :src="photo.data" :alt="photo.name" class="w-full h-full object-cover" />
                      <button @click="removeDumpPhoto(idx)" class="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">&times;</button>
                      <p class="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[9px] text-center py-0.5 truncate">{{ photo.size }}</p>
                    </div>
                    <label v-if="dumpPhotos.length < 5" class="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-sky-400 hover:bg-sky-50 transition-colors">
                      <svg class="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
                      <span class="text-[10px] text-gray-400 mt-0.5">{{ $t('employeeMap.photo') }}</span>
                      <input type="file" accept=".jpg,.jpeg,.png" multiple class="hidden" @change="handleDumpPhotoUpload" />
                    </label>
                  </div>
                </div>
              </div>
            </template>
            <!-- Payer form -->
            <template v-if="activeRegistry === 'payers'">
              <div class="grid grid-cols-2 gap-4">
                <div class="col-span-2"><label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('common.name') }} *</label><input v-model="payerForm.name" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('employeeMap.inn') }}</label><input v-model="payerForm.inn" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('common.region') }}</label><select v-model="payerForm.region" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"><option value="">{{ $t('employeeMap.select') }}</option><option v-for="r in regions" :key="r" :value="r">{{ r }}</option></select></div>
                <div class="col-span-2"><label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('employeeMap.address') }}</label><input v-model="payerForm.address" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('employeeMap.gpsLat') }}</label><input v-model="payerForm.gpsLat" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('employeeMap.gpsLng') }}</label><input v-model="payerForm.gpsLng" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div class="col-span-2"><button type="button" @click="openCoordPicker(payerForm)" class="px-4 py-2 text-sm font-medium text-sky-600 border border-sky-300 rounded-lg hover:bg-sky-50 transition-colors flex items-center gap-2"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>{{ $t('employeeMap.pickOnMap') }}</button></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('employeeMap.phone') }}</label><input v-model="payerForm.phone" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('employeeMap.category') }}</label><input v-model="payerForm.category" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" /></div>
              </div>
            </template>
          </div>
          <div class="p-6 border-t border-gray-200 flex justify-end gap-3">
            <button @click="showEditModal = false" class="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">{{ $t('common.cancel') }}</button>
            <button @click="saveItem" class="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 font-medium">{{ isCreating ? $t('common.add') : $t('common.save') }}</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Delete Confirm Modal -->
    <Teleport to="body">
      <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
          <div class="text-center">
            <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">{{ $t('employeeMap.deleteRecordTitle') }}</h3>
            <p class="text-gray-600 mb-6">{{ $t('employeeMap.deleteRecordConfirm', { name: getSelectedItemName() }) }}</p>
            <div class="flex gap-3 justify-center">
              <button @click="showDeleteConfirm = false" class="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">{{ $t('common.cancel') }}</button>
              <button @click="deleteItem" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium">{{ $t('common.delete') }}</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Success Notification -->
    <Teleport to="body">
      <div v-if="showNotification" class="fixed top-4 right-4 z-[100] bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
        <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
        <span class="font-medium">{{ notificationMessage }}</span>
      </div>
    </Teleport>
    <MapCoordinatePicker
      :visible="showCoordPicker"
      :modelValue="pickerCoords"
      @update:visible="showCoordPicker = $event"
      @update:modelValue="onPickerConfirm"
    />
  </DashboardLayout>
</template>

<style>
.custom-marker { background: transparent !important; border: none !important; }
.leaflet-popup-content-wrapper { border-radius: 12px; padding: 0; }
.leaflet-popup-content { margin: 12px 14px; }
.leaflet-popup-close-button { top: 8px !important; right: 8px !important; }
.oblast-tooltip {
  background: rgba(15, 23, 42, 0.88);
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
}
.oblast-tooltip::before { display: none; }
</style>
