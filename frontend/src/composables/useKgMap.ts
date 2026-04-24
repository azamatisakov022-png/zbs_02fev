// Константы и помощники Leaflet-карты Кыргызстана — единый источник
// для всех компонентов (MapCoordinatePicker, EcoOperatorRecyclerDetail,
// EmployeeMap, MinistryLandfills, MinistryCollectionPoints).

import type { LatLngBoundsExpression, LatLngExpression, LatLngTuple, PathOptions } from 'leaflet'

// ─── Тайлы (OpenStreetMap) ────────────────────────────────────────────
export const KG_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
export const KG_TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
export const KG_TILE_SUBDOMAINS = 'abc'

// ─── Вид карты по умолчанию ───────────────────────────────────────────
// Центр Кыргызстана ~ (41.2°N, 74.8°E) — примерно между Бишкеком и Нарыном.
export const KG_CENTER: LatLngTuple = [41.2044, 74.7661]
export const KG_DEFAULT_ZOOM = 7
export const KG_MIN_ZOOM = 6
export const KG_MAX_ZOOM = 18

// ─── Границы страны ───────────────────────────────────────────────────
// Прямоугольник, охватывающий всю территорию КР (SW-угол, NE-угол).
// Используется как `maxBounds`, чтобы нельзя было увести карту в другой регион.
export const KG_BOUNDS: LatLngBoundsExpression = [
  [39.1, 69.2], // south-west (Баткенская обл., граница с Таджикистаном)
  [43.3, 80.3], // north-east (Иссык-Куль, граница с Китаем)
]

// ─── Кастомная Leaflet-пане для «маски» (затемнение вне страны) ────────
// Используется на картах, где области КР выделяются поверх затемнённого фона.
export const KG_MASK_PANE = 'kg-mask-pane'
export const KG_MASK_PANE_Z = 400 // выше tilePane (200), ниже overlayPane (400)

// ─── Стили заливки областей ───────────────────────────────────────────
/** Заливка областей КР по умолчанию — лёгкий цвет бренда с тонкой границей. */
export const oblastStyle: PathOptions = {
  color: '#1e293b',
  weight: 1.2,
  fillColor: '#ecfdf5',
  fillOpacity: 0.35,
  opacity: 0.7,
}

/** Подсветка области при наведении курсора. */
export const oblastHoverStyle: PathOptions = {
  color: '#0e888d',
  weight: 2,
  fillColor: '#a7f3d0',
  fillOpacity: 0.5,
  opacity: 1,
}

/** Стиль маски (затемнение вне КР) — рендерится в kg-mask-pane. */
export const maskStyle: PathOptions = {
  pane: KG_MASK_PANE,
  color: '#ffffff',
  fillColor: '#ffffff',
  fillOpacity: 1,
  weight: 0,
  stroke: false,
  interactive: false,
  smoothFactor: 0.5,
}

// ─── Загрузка GeoJSON областей КР ─────────────────────────────────────
/**
 * Загружает GeoJSON административных областей КР из публичной папки.
 * При ошибке (404 / сеть) бросает Error — вызывающий код должен ловить.
 */
export async function loadKgOblasts(): Promise<GeoJSON.FeatureCollection> {
  const resp = await fetch('/geo/kyrgyzstan-admin1.geojson')
  if (!resp.ok) throw new Error(`KG oblasts GeoJSON load failed: HTTP ${resp.status}`)
  return (await resp.json()) as GeoJSON.FeatureCollection
}

// ─── Построение «маски» (inverse-polygon) вокруг страны ───────────────
/**
 * Строит массив LatLng-колец для Leaflet.polygon: внешнее кольцо — весь
 * мир, «дырки» — области КР. Используется чтобы выделить страну поверх
 * затемнённого фона.
 */
export function buildMaskLatLngs(fc: GeoJSON.FeatureCollection): LatLngExpression[][] {
  const WORLD: LatLngExpression[] = [
    [85, -180],
    [85, 180],
    [-85, 180],
    [-85, -180],
  ]
  const holes: LatLngExpression[][] = []
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
