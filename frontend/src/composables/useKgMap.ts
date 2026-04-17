// Константы Leaflet-карты Кыргызстана — единый источник для всех компонентов
// (MapCoordinatePicker, EcoOperatorRecyclerDetail, EmployeeMap).

import type { LatLngBoundsExpression, LatLngTuple } from 'leaflet'

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
