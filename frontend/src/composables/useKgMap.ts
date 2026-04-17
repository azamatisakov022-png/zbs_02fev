// Константы тайлов карты Кыргызстана (OpenStreetMap).
// Используется компонентами MapCoordinatePicker, EcoOperatorRecyclerDetail,
// EmployeeMap и другими, где нужна Leaflet-карта с единой конфигурацией.

export const KG_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
export const KG_TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
export const KG_TILE_SUBDOMAINS = 'abc'

// Центр Кыргызстана (Бишкек), зум по умолчанию.
export const KG_CENTER: [number, number] = [41.2044, 74.7661]
export const KG_DEFAULT_ZOOM = 7
