<!--
  KyrgyzstanCutoutMap — Leaflet-карта Кыргызстана с настоящими OSM-тайлами
  (улицы, дороги, рельеф, города), маской «вырезанной под фон страницы»
  снаружи страны и pin-маркерами объектов.

  - Внутри страны: настоящая OSM-карта с улицами и адресами
  - Снаружи: маска цвета фона (по умолчанию белый), визуально страна «вырезана»
  - Маркеры — pin-shape (SVG flag), цвет по типу
  - Click на маркер: flyTo(latlng, 13) + popup
  - maxBounds + minZoom не дают пользователю выехать
-->
<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import 'leaflet/dist/leaflet.css'
import { LMap, LTileLayer, LMarker, LPopup } from '@vue-leaflet/vue-leaflet'
import L from 'leaflet'

export interface CutoutMarker {
  id: number | string
  type: string
  lat: number
  lng: number
  name: string
  address?: string
  phone?: string
  status?: string
  description?: string
}

const props = withDefaults(
  defineProps<{
    markers: CutoutMarker[]
    /** Высота карты (CSS). Дефолт 600px. */
    height?: string
    /** Цвет inverse-маски за пределами КР (под фон страницы-контейнера). */
    maskColor?: string
    /** Цвета маркеров по типу. */
    typeColors?: Record<string, string>
    /** Z-уровень для flyTo при клике на маркер. */
    flyToZoom?: number
  }>(),
  {
    height: '600px',
    maskColor: '#ffffff',
    typeColors: () => ({}),
    flyToZoom: 13,
  },
)

const emit = defineEmits<{
  markerClick: [marker: CutoutMarker]
}>()

// ────────── Константы по Кыргызстану ──────────
const KG_CENTER: [number, number] = [41.5, 74.8]
const KG_BOUNDS: L.LatLngBoundsLiteral = [
  [39.0, 69.1],
  [43.4, 80.5],
]
const KG_MIN_ZOOM = 6
const KG_MAX_ZOOM = 18
const KG_DEFAULT_ZOOM = 7

const COLORS_DEFAULT: Record<string, string> = {
  landfills: '#22c55e',
  recyclers: '#2563eb',
  reception: '#eab308',
  dumps: '#dc2626',
  payers: '#9333ea',
}
const colorFor = (type: string) =>
  props.typeColors[type] ?? COLORS_DEFAULT[type] ?? '#64748b'

// ────────── Map state ──────────
const mapRef = ref<{ leafletObject?: L.Map } | null>(null)
const mapReady = ref(false)
const oblastsGeo = ref<GeoJSON.FeatureCollection | null>(null)
let maskLayer: L.Polygon | null = null
let bordersLayer: L.GeoJSON | null = null

// ────────── Pin SVG icon factory ──────────
function pinIcon(color: string, hovered = false): L.DivIcon {
  const size = hovered ? 38 : 32
  const stroke = hovered ? '#0f172a' : '#1e293b'
  return L.divIcon({
    className: 'kg-pin-marker',
    html: `<svg width="${size}" height="${size}" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="pinSh${size}" x="-50%" y="-30%" width="200%" height="160%">
          <feDropShadow dx="0" dy="2" stdDeviation="1.5" flood-opacity="0.35"/>
        </filter>
      </defs>
      <path filter="url(#pinSh${size})" d="M16 1.5C9.65 1.5 4.5 6.65 4.5 13c0 7.5 11.5 17.5 11.5 17.5S27.5 20.5 27.5 13c0-6.35-5.15-11.5-11.5-11.5z"
        fill="${color}" stroke="${stroke}" stroke-width="1.6"/>
      <circle cx="16" cy="13" r="4.5" fill="white" stroke="${stroke}" stroke-width="1"/>
    </svg>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  }) as L.DivIcon
}

// ────────── GeoJSON loading + mask + borders ──────────
async function loadAndApplyMask() {
  try {
    const resp = await fetch('/geo/kyrgyzstan-admin1.geojson')
    if (!resp.ok) throw new Error('GeoJSON load failed: ' + resp.status)
    const data: GeoJSON.FeatureCollection = await resp.json()
    oblastsGeo.value = data
    applyOverlays()
  } catch (e) {
    console.warn('[KyrgyzstanCutoutMap] GeoJSON load failed:', e)
  }
}

function buildMaskLatLngs(fc: GeoJSON.FeatureCollection): L.LatLngExpression[][] {
  const WORLD: L.LatLngExpression[] = [
    [85, -180],
    [85, 180],
    [-85, 180],
    [-85, -180],
  ]
  const holes: L.LatLngExpression[][] = []
  for (const feat of fc.features) {
    const g = feat.geometry
    if (!g) continue
    if (g.type === 'Polygon') {
      const ring = (g.coordinates[0] as number[][]).map(
        ([lng, lat]) => [lat, lng] as [number, number],
      )
      holes.push(ring)
    } else if (g.type === 'MultiPolygon') {
      for (const poly of g.coordinates as number[][][][]) {
        const ring = (poly[0] as number[][]).map(
          ([lng, lat]) => [lat, lng] as [number, number],
        )
        holes.push(ring)
      }
    }
  }
  return [WORLD, ...holes]
}

function applyOverlays() {
  const map = mapRef.value?.leafletObject
  if (!map || !oblastsGeo.value) return

  // Маска (inverse polygon) — цвет фона страницы
  if (maskLayer) {
    maskLayer.remove()
    maskLayer = null
  }
  maskLayer = L.polygon(buildMaskLatLngs(oblastsGeo.value), {
    color: props.maskColor,
    fillColor: props.maskColor,
    fillOpacity: 1,
    weight: 0,
    stroke: false,
    interactive: false,
    smoothFactor: 0.5,
  })
  maskLayer.addTo(map)

  // Тонкая внешняя граница страны
  if (bordersLayer) {
    bordersLayer.remove()
    bordersLayer = null
  }
  bordersLayer = L.geoJSON(oblastsGeo.value, {
    style: () => ({
      color: '#1e293b',
      weight: 1.4,
      fill: false,
      opacity: 0.7,
    }),
    interactive: false,
  })
  bordersLayer.addTo(map)
}

watch(
  () => props.maskColor,
  () => applyOverlays(),
)

const onMapReady = () => {
  mapReady.value = true
  // Не блокируем ready — загружаем GeoJSON отдельно
  loadAndApplyMask()
}

// ────────── Markers ──────────
const validMarkers = computed(() =>
  props.markers.filter(m => Number.isFinite(m.lat) && Number.isFinite(m.lng)),
)

const onMarkerClick = (m: CutoutMarker) => {
  const map = mapRef.value?.leafletObject
  if (map) {
    map.flyTo([m.lat, m.lng], props.flyToZoom, { duration: 0.7 })
  }
  emit('markerClick', m)
}

// ────────── Public API (exposed for parent via ref) ──────────
function getLeafletMap(): L.Map | null {
  return (mapRef.value?.leafletObject as L.Map | undefined) ?? null
}

function zoomIn() {
  getLeafletMap()?.zoomIn()
}

function zoomOut() {
  getLeafletMap()?.zoomOut()
}

/** Вернуть вид всей страны целиком. */
function resetView(duration = 1) {
  const map = getLeafletMap()
  if (!map) return
  map.flyTo(KG_CENTER, KG_DEFAULT_ZOOM, { duration })
}

/** Запросить геолокацию пользователя и перелететь туда (с ограничением по maxBounds). */
function locate() {
  if (!navigator.geolocation) return
  navigator.geolocation.getCurrentPosition(
    pos => {
      const map = getLeafletMap()
      if (!map) return
      map.flyTo([pos.coords.latitude, pos.coords.longitude], 12, { duration: 1.2 })
    },
    () => {
      /* silently fail if denied / unavailable */
    },
    { timeout: 8000, enableHighAccuracy: false },
  )
}

function flyTo(lat: number, lng: number, zoom = 13, duration = 0.8) {
  getLeafletMap()?.flyTo([lat, lng], zoom, { duration })
}

function flyToBounds(b: L.LatLngBoundsExpression, opts?: L.FitBoundsOptions) {
  getLeafletMap()?.flyToBounds(b, { padding: [50, 50], duration: 0.8, ...opts })
}

defineExpose({
  getLeafletMap,
  zoomIn,
  zoomOut,
  resetView,
  locate,
  flyTo,
  flyToBounds,
  /** Геттер для backward-compat (старый код читал `.leafletObject`) */
  get leafletObject() {
    return mapRef.value?.leafletObject
  },
})

// При смене набора маркеров — ничего; vue-leaflet сам перерисует
watch(validMarkers, async () => {
  await nextTick()
})

onMounted(() => {
  // Если @ready уже сработал до загрузки GeoJSON — applyOverlays выйдет early
  // и сработает после loadAndApplyMask.
})
</script>

<template>
  <div class="kg-cutout-map" :style="{ height, '--mask-color': maskColor }">
    <LMap
      ref="mapRef"
      :zoom="KG_DEFAULT_ZOOM"
      :center="KG_CENTER"
      :min-zoom="KG_MIN_ZOOM"
      :max-zoom="KG_MAX_ZOOM"
      :max-bounds="KG_BOUNDS"
      :max-bounds-viscosity="1.0"
      :world-copy-jump="false"
      :use-global-leaflet="false"
      :options="{ zoomControl: true, attributionControl: true }"
      class="h-full w-full"
      @ready="onMapReady"
    >
      <LTileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        :subdomains="'abc'"
        :max-zoom="19"
      />

      <LMarker
        v-for="m in validMarkers"
        :key="`${m.type}-${m.id}`"
        :lat-lng="[m.lat, m.lng]"
        :icon="pinIcon(colorFor(m.type))"
        @click="onMarkerClick(m)"
      >
        <LPopup :options="{ maxWidth: 320, className: 'kg-cutout-popup' }">
          <div class="popup-body">
            <div class="popup-title">{{ m.name }}</div>
            <div v-if="m.status" class="popup-status">
              <span class="popup-status-dot" :style="{ background: colorFor(m.type) }"></span>
              {{ m.status }}
            </div>
            <div v-if="m.address" class="popup-row">
              <span class="popup-key">Адрес:</span> {{ m.address }}
            </div>
            <div v-if="m.phone" class="popup-row">
              <span class="popup-key">Тел:</span> {{ m.phone }}
            </div>
            <div v-if="m.description" class="popup-row popup-desc">
              {{ m.description }}
            </div>
            <div class="popup-coords">
              <span class="popup-key">Коорд:</span>
              <span class="popup-coords-val">{{ m.lat.toFixed(4) }}, {{ m.lng.toFixed(4) }}</span>
            </div>
          </div>
        </LPopup>
      </LMarker>
    </LMap>
  </div>
</template>

<style scoped>
.kg-cutout-map {
  position: relative;
  width: 100%;
  background: var(--mask-color, #ffffff);
  border-radius: 12px;
  overflow: hidden;
}
:deep(.leaflet-container) {
  background: var(--mask-color, #ffffff);
  font-family: system-ui, -apple-system, sans-serif;
}
:deep(.kg-pin-marker) {
  background: transparent !important;
  border: none !important;
  cursor: pointer;
}
:deep(.kg-pin-marker svg) {
  transition: transform 0.15s ease;
}
:deep(.kg-pin-marker:hover svg) {
  transform: scale(1.15) translateY(-2px);
}
:deep(.kg-cutout-popup .leaflet-popup-content-wrapper) {
  border-radius: 10px;
  padding: 0;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.18);
}
:deep(.kg-cutout-popup .leaflet-popup-content) {
  margin: 12px 14px;
  font-size: 12px;
  line-height: 1.45;
}
:deep(.popup-title) {
  font-weight: 700;
  font-size: 13px;
  color: #0f172a;
  margin-bottom: 6px;
}
:deep(.popup-status) {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #475569;
  background: #f1f5f9;
  padding: 3px 8px;
  border-radius: 999px;
  margin-bottom: 8px;
}
:deep(.popup-status-dot) {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}
:deep(.popup-row) {
  color: #475569;
  margin-top: 3px;
}
:deep(.popup-key) {
  color: #94a3b8;
  margin-right: 4px;
}
:deep(.popup-desc) {
  margin-top: 8px;
  padding-top: 6px;
  border-top: 1px solid #f1f5f9;
  font-style: italic;
  color: #64748b;
}
:deep(.popup-coords) {
  margin-top: 6px;
  font-family: ui-monospace, 'SF Mono', monospace;
  font-size: 11px;
}
:deep(.popup-coords-val) {
  color: #475569;
}
</style>
