// Recycling norms data for 2025-2030
// Based on government regulations

export interface RecyclingNorm {
  id: number
  category: string
  categoryKey: string
  rates: Record<number, number>
}

// Norms for goods (products)
export const goodsNorms: RecyclingNorm[] = [
  { id: 1, category: 'Стиральные машины', categoryKey: 'washing_machines', rates: { 2025: 10, 2026: 15, 2027: 20, 2028: 25, 2029: 30, 2030: 35 } },
  { id: 2, category: 'Холодильники и морозильники', categoryKey: 'refrigerators', rates: { 2025: 10, 2026: 15, 2027: 20, 2028: 25, 2029: 30, 2030: 35 } },
  { id: 3, category: 'Электрические плиты', categoryKey: 'electric_stoves', rates: { 2025: 10, 2026: 15, 2027: 20, 2028: 25, 2029: 30, 2030: 35 } },
  { id: 4, category: 'Посудомоечные машины', categoryKey: 'dishwashers', rates: { 2025: 10, 2026: 15, 2027: 20, 2028: 25, 2029: 30, 2030: 35 } },
  { id: 5, category: 'Телевизоры', categoryKey: 'televisions', rates: { 2025: 15, 2026: 20, 2027: 25, 2028: 30, 2029: 35, 2030: 40 } },
  { id: 6, category: 'Компьютеры и ноутбуки', categoryKey: 'computers', rates: { 2025: 15, 2026: 20, 2027: 25, 2028: 30, 2029: 35, 2030: 40 } },
  { id: 7, category: 'Мониторы', categoryKey: 'monitors', rates: { 2025: 15, 2026: 20, 2027: 25, 2028: 30, 2029: 35, 2030: 40 } },
  { id: 8, category: 'Принтеры и сканеры', categoryKey: 'printers', rates: { 2025: 15, 2026: 20, 2027: 25, 2028: 30, 2029: 35, 2030: 40 } },
  { id: 9, category: 'Мобильные телефоны', categoryKey: 'mobile_phones', rates: { 2025: 20, 2026: 25, 2027: 30, 2028: 35, 2029: 40, 2030: 45 } },
  { id: 10, category: 'Электрические лампы', categoryKey: 'lamps', rates: { 2025: 25, 2026: 30, 2027: 35, 2028: 40, 2029: 45, 2030: 50 } },
  { id: 11, category: 'Пневматические шины', categoryKey: 'tires', rates: { 2025: 20, 2026: 25, 2027: 30, 2028: 35, 2029: 40, 2030: 45 } },
  { id: 12, category: 'Аккумуляторы', categoryKey: 'accumulators', rates: { 2025: 30, 2026: 35, 2027: 40, 2028: 45, 2029: 50, 2030: 55 } },
  { id: 13, category: 'Батарейки', categoryKey: 'batteries', rates: { 2025: 25, 2026: 30, 2027: 35, 2028: 40, 2029: 45, 2030: 50 } },
  { id: 14, category: 'Строит. материалы (пластик)', categoryKey: 'construction_plastic', rates: { 2025: 15, 2026: 20, 2027: 25, 2028: 30, 2029: 35, 2030: 40 } },
  { id: 15, category: 'Строит. материалы (металл)', categoryKey: 'construction_metal', rates: { 2025: 25, 2026: 30, 2027: 35, 2028: 40, 2029: 45, 2030: 50 } },
  { id: 16, category: 'Мебель', categoryKey: 'furniture', rates: { 2025: 10, 2026: 15, 2027: 20, 2028: 25, 2029: 30, 2030: 35 } },
  { id: 17, category: 'Текстильные изделия', categoryKey: 'textiles', rates: { 2025: 5, 2026: 10, 2027: 15, 2028: 20, 2029: 25, 2030: 30 } },
  { id: 18, category: 'Обувь', categoryKey: 'footwear', rates: { 2025: 5, 2026: 10, 2027: 15, 2028: 20, 2029: 25, 2030: 30 } },
]

// Norms for packaging
export const packagingNorms: RecyclingNorm[] = [
  { id: 1, category: 'Пластиковая упаковка', categoryKey: 'plastic_packaging', rates: { 2025: 20, 2026: 25, 2027: 30, 2028: 35, 2029: 40, 2030: 45 } },
  { id: 2, category: 'Стеклянная упаковка', categoryKey: 'glass_packaging', rates: { 2025: 40, 2026: 45, 2027: 50, 2028: 55, 2029: 60, 2030: 65 } },
  { id: 3, category: 'Металлическая упаковка', categoryKey: 'metal_packaging', rates: { 2025: 35, 2026: 40, 2027: 45, 2028: 50, 2029: 55, 2030: 60 } },
  { id: 4, category: 'Бумажная упаковка', categoryKey: 'paper_packaging', rates: { 2025: 45, 2026: 50, 2027: 55, 2028: 60, 2029: 65, 2030: 70 } },
  { id: 5, category: 'Комбинированная упаковка', categoryKey: 'combined_packaging', rates: { 2025: 15, 2026: 20, 2027: 25, 2028: 30, 2029: 35, 2030: 40 } },
  { id: 6, category: 'Деревянная упаковка', categoryKey: 'wood_packaging', rates: { 2025: 50, 2026: 55, 2027: 60, 2028: 65, 2029: 70, 2030: 75 } },
]

// Mapping from product groups (18 групп из Перечня) to norms categories
export const productGroupToNormMapping: Record<string, { type: 'goods' | 'packaging', categoryKey: string }> = {
  // Группы 1-2: Бумага/картон → packaging norms
  'group_1': { type: 'packaging', categoryKey: 'paper_packaging' },
  'group_2': { type: 'packaging', categoryKey: 'paper_packaging' },
  // Группа 3: Масла
  'group_3': { type: 'goods', categoryKey: 'construction_plastic' },
  // Группа 4: Шины
  'group_4': { type: 'goods', categoryKey: 'tires' },
  // Группа 5: Резина
  'group_5': { type: 'goods', categoryKey: 'tires' },
  // Группы 6-7: Пластмассы → packaging norms
  'group_6': { type: 'packaging', categoryKey: 'plastic_packaging' },
  'group_7': { type: 'goods', categoryKey: 'construction_plastic' },
  // Группа 8: Стекло
  'group_8': { type: 'packaging', categoryKey: 'glass_packaging' },
  // Группы 9-10: Электроника
  'group_9': { type: 'goods', categoryKey: 'computers' },
  'group_10': { type: 'goods', categoryKey: 'monitors' },
  // Группы 11-13: Батареи и аккумуляторы
  'group_11': { type: 'goods', categoryKey: 'batteries' },
  'group_12': { type: 'goods', categoryKey: 'accumulators' },
  'group_13': { type: 'goods', categoryKey: 'accumulators' },
  // Группа 14: Освещение
  'group_14': { type: 'goods', categoryKey: 'lamps' },
  // Группы 15-16: Бытовая техника
  'group_15': { type: 'goods', categoryKey: 'washing_machines' },
  'group_16': { type: 'goods', categoryKey: 'printers' },
  // Группа 17: Холодильное оборудование
  'group_17': { type: 'goods', categoryKey: 'refrigerators' },
  // Группа 18: Фильтры
  'group_18': { type: 'goods', categoryKey: 'construction_metal' },
  // Группы упаковки (19-24)
  'group_19': { type: 'packaging', categoryKey: 'plastic_packaging' },
  'group_20': { type: 'packaging', categoryKey: 'paper_packaging' },
  'group_21': { type: 'packaging', categoryKey: 'combined_packaging' },
  'group_22': { type: 'packaging', categoryKey: 'glass_packaging' },
  'group_23': { type: 'packaging', categoryKey: 'metal_packaging' },
  'group_24': { type: 'packaging', categoryKey: 'wood_packaging' },
}

/**
 * Get recycling norm percentage for a given category and year
 * @param categoryKey - The category key (e.g., 'refrigerators', 'plastic_packaging')
 * @param year - The year (2025-2030)
 * @param type - 'goods' or 'packaging'
 * @returns The norm percentage, or null if not found
 */
export function getRecyclingNorm(categoryKey: string, year: number, type: 'goods' | 'packaging' = 'goods'): number | null {
  const norms = type === 'goods' ? goodsNorms : packagingNorms
  const norm = norms.find(n => n.categoryKey === categoryKey)
  if (!norm || !norm.rates[year]) return null
  return norm.rates[year]
}

/**
 * Get recycling norm from product group key
 * @param groupKey - The product group key from calculator (e.g., 'plastic', 'electronics')
 * @param subgroupKey - The subgroup key (optional)
 * @param year - The year (2025-2030)
 * @returns The norm percentage, or a default value
 */
export function getRecyclingNormForProduct(groupKey: string, subgroupKey: string | null, year: number): number {
  // First try subgroup, then group
  const mapping = productGroupToNormMapping[subgroupKey || ''] || productGroupToNormMapping[groupKey]

  if (mapping) {
    const norm = getRecyclingNorm(mapping.categoryKey, year, mapping.type)
    if (norm !== null) return norm
  }

  // Default fallback based on group type (24 группы)
  const defaultNorms: Record<string, number> = {
    'group_1': 50,   // Гофрированная бумага
    'group_2': 50,   // Негофрированная бумага
    'group_3': 20,   // Масла
    'group_4': 25,   // Шины
    'group_5': 20,   // Резина
    'group_6': 25,   // Пластмассы упаковочные
    'group_7': 20,   // Пластмассы прочие
    'group_8': 45,   // Стекло
    'group_9': 20,   // Компьютеры
    'group_10': 20,  // Мониторы, ТВ
    'group_11': 30,  // Батарейки
    'group_12': 35,  // Аккумуляторы свинцовые
    'group_13': 35,  // Аккумуляторные батареи
    'group_14': 30,  // Освещение
    'group_15': 15,  // Крупная бытовая техника
    'group_16': 20,  // Мелкая бытовая техника
    'group_17': 15,  // Холодильное оборудование
    'group_18': 25,  // Фильтры
    'group_19': 25,  // Упаковка из пластмасс
    'group_20': 50,  // Упаковка из бумаги и картона
    'group_21': 20,  // Упаковка комбинированная (тетрапак)
    'group_22': 45,  // Упаковка из стекла
    'group_23': 40,  // Упаковка из металла
    'group_24': 55,  // Упаковка из дерева
  }

  return defaultNorms[groupKey] || 20
}

/**
 * Calculate Nper coefficient from norm percentage
 * Nper = 1 - (norm% / 100)
 */
export function calculateNperCoefficient(normPercent: number): number {
  return 1 - (normPercent / 100)
}

/**
 * Calculate utilization fee
 * Usb = Rate * Mass * Nper
 */
export function calculateUtilizationFee(rate: number, mass: number, normPercent: number): number {
  const nper = calculateNperCoefficient(normPercent)
  return Math.round(rate * mass * nper)
}
