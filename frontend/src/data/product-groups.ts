/**
 * Единый справочник 24 групп товаров и упаковки, подлежащих переработке.
 * Источник: Перечень товаров (приложение к постановлению КМ КР).
 * Данные импортированы из файла «Группы и подгруппы.xlsx».
 * Используется в калькуляторе, декларациях, отчётах о переработке.
 */

import wasteGroupsData from './waste-groups.json'
import { generatedSubgroups } from './product-subgroups-generated'
import { UTILIZATION_RATES_2025 } from './rates'

export interface ProductGroup {
  value: string
  label: string
  code: string
  baseRate: number
  unit: string
  recyclingStandard: number // Норматив переработки (%)
}

export interface ProductSubgroup {
  value: string
  label: string
  code: string
  rateMultiplier: number
  type: 'product' | 'packaging'
  // Товары (группы 1-18)
  gskpCode?: string
  tnvedCode?: string
  tnvedName?: string
  // Упаковка (группы 19-24)
  packagingMaterial?: string
  packagingLetterCode?: string
  packagingDigitalCode?: string
}

// Полный справочник из Excel (327 позиций в 18 группах товаров + 6 групп упаковки)
export const wasteGroups = wasteGroupsData as Array<{
  id: number
  name: string
  items: Array<{
    name: string
    gskpCode: string
    tnvedCode: string
    tnvedOriginal: string
  }>
}>

// 24 группы: 18 групп товаров + 6 групп упаковки, с базовыми ставками утилизационного сбора (сом/тонна)
// Ставки (Сус) импортируются из единого источника: data/rates.ts (ПКМ КР №730)
export const productGroups: ProductGroup[] = [
  // Группы товаров (1-18)
  { value: 'group_1', label: '1. Изделия из гофрированной бумаги/картона', code: '4808', baseRate: UTILIZATION_RATES_2025[1], unit: 'сом/т', recyclingStandard: 30 },
  { value: 'group_2', label: '2. Изделия из негофрированной бумаги/картона', code: '4819', baseRate: UTILIZATION_RATES_2025[2], unit: 'сом/т', recyclingStandard: 30 },
  { value: 'group_3', label: '3. Масла', code: '2710', baseRate: UTILIZATION_RATES_2025[3], unit: 'сом/т', recyclingStandard: 30 },
  { value: 'group_4', label: '4. Шины, покрышки и камеры резиновые', code: '4011', baseRate: UTILIZATION_RATES_2025[4], unit: 'сом/т', recyclingStandard: 30 },
  { value: 'group_5', label: '5. Изделия из резины (за исключением шин)', code: '4009', baseRate: UTILIZATION_RATES_2025[5], unit: 'сом/т', recyclingStandard: 20 },
  { value: 'group_6', label: '6. Изделия пластмассовые упаковочные', code: '3923', baseRate: UTILIZATION_RATES_2025[6], unit: 'сом/т', recyclingStandard: 20 },
  { value: 'group_7', label: '7. Изделия пластмассовые прочие', code: '3922', baseRate: UTILIZATION_RATES_2025[7], unit: 'сом/т', recyclingStandard: 20 },
  { value: 'group_8', label: '8. Стекло полое', code: '7010', baseRate: UTILIZATION_RATES_2025[8], unit: 'сом/т', recyclingStandard: 20 },
  { value: 'group_9', label: '9. Компьютеры и периферийное оборудование, офисное оборудование', code: '8471', baseRate: UTILIZATION_RATES_2025[9], unit: 'сом/т', recyclingStandard: 20 },
  { value: 'group_10', label: '10. Мониторы, приемники телевизионные', code: '8528', baseRate: UTILIZATION_RATES_2025[10], unit: 'сом/т', recyclingStandard: 20 },
  { value: 'group_11', label: '11. Элементы первичные и батареи первичных элементов', code: '8506', baseRate: UTILIZATION_RATES_2025[11], unit: 'сом/т', recyclingStandard: 20 },
  { value: 'group_12', label: '12. Аккумуляторы свинцовые', code: '8507', baseRate: UTILIZATION_RATES_2025[12], unit: 'сом/т', recyclingStandard: 20 },
  { value: 'group_13', label: '13. Батареи аккумуляторные', code: '8507', baseRate: UTILIZATION_RATES_2025[13], unit: 'сом/т', recyclingStandard: 20 },
  { value: 'group_14', label: '14. Оборудование электрическое осветительное', code: '8539', baseRate: UTILIZATION_RATES_2025[14], unit: 'сом/т', recyclingStandard: 20 },
  { value: 'group_15', label: '15. Техника бытовая крупная', code: '8418', baseRate: UTILIZATION_RATES_2025[15], unit: 'сом/т', recyclingStandard: 20 },
  { value: 'group_16', label: '16. Техника бытовая мелкая, инструмент ручной', code: '8516', baseRate: UTILIZATION_RATES_2025[16], unit: 'сом/т', recyclingStandard: 20 },
  { value: 'group_17', label: '17. Оборудование холодильное и вентиляционное', code: '8418', baseRate: UTILIZATION_RATES_2025[17], unit: 'сом/т', recyclingStandard: 20 },
  { value: 'group_18', label: '18. Фильтры для двигателей внутреннего сгорания', code: '8421', baseRate: UTILIZATION_RATES_2025[18], unit: 'сом/т', recyclingStandard: 20 },
  // Группы упаковки (19-24)
  { value: 'group_19', label: '19. Упаковка из полимерных материалов, не содержащих галогены', code: '3923', baseRate: UTILIZATION_RATES_2025[19], unit: 'сом/т', recyclingStandard: 20 },
  { value: 'group_20', label: '20. Упаковка из полимерных материалов, содержащих галоген', code: '3904', baseRate: UTILIZATION_RATES_2025[20], unit: 'сом/т', recyclingStandard: 20 },
  { value: 'group_21', label: '21. Упаковка из комбинированных материалов', code: '4811', baseRate: UTILIZATION_RATES_2025[21], unit: 'сом/т', recyclingStandard: 20 },
  { value: 'group_22', label: '22. Упаковка из гофрированного картона', code: '4819', baseRate: UTILIZATION_RATES_2025[22], unit: 'сом/т', recyclingStandard: 20 },
  { value: 'group_23', label: '23. Упаковка из бумаги и негофрированного картона', code: '4819', baseRate: UTILIZATION_RATES_2025[23], unit: 'сом/т', recyclingStandard: 20 },
  { value: 'group_24', label: '24. Упаковка стеклянная', code: '7010', baseRate: UTILIZATION_RATES_2025[24], unit: 'сом/т', recyclingStandard: 20 },
]

// Подгруппы для каждой из 24 групп — импортированы из CSV (336 позиций)
export const productSubgroups: Record<string, ProductSubgroup[]> = generatedSubgroups


// Группировка для отображения секций
export const productGroupSections = [
  { letter: 'А', title: 'Бумага и картон', from: 0, to: 2 },
  { letter: 'Б', title: 'Масла и шины', from: 2, to: 5 },
  { letter: 'В', title: 'Пластмассы и стекло', from: 5, to: 8 },
  { letter: 'Г', title: 'Электроника и оборудование', from: 8, to: 14 },
  { letter: 'Д', title: 'Бытовая техника и фильтры', from: 14, to: 18 },
  { letter: 'Е', title: 'Упаковка (полимеры, комбинированные, картон, бумага, стекло)', from: 18, to: 24 },
]

/**
 * Получить товары из JSON-справочника по номеру группы
 */
export function getWasteGroupItems(groupId: number) {
  const group = wasteGroups.find(g => g.id === groupId)
  return group?.items || []
}

/**
 * Получить номер группы из value ключа (e.g. 'group_4' → 4)
 */
export function getGroupIdFromValue(value: string): number {
  const match = value.match(/group_(\d+)/)
  return match ? parseInt(match[1]) : 0
}

/**
 * Получить данные подгруппы по group и subgroup value
 */
export function getSubgroupData(groupValue: string, subgroupValue: string): ProductSubgroup | undefined {
  const subs = productSubgroups[groupValue]
  return subs?.find(s => s.value === subgroupValue)
}

/**
 * Найти подгруппу по group value и code (ТН ВЭД)
 */
export function getSubgroupByCode(groupValue: string, code: string): ProductSubgroup | undefined {
  const subs = productSubgroups[groupValue]
  return subs?.find(s => s.code === code)
}

/**
 * Определить, является ли группа упаковкой (группы 19-24)
 */
export function isPackagingGroup(groupValue: string): boolean {
  const num = getGroupIdFromValue(groupValue)
  return num >= 19 && num <= 24
}

/**
 * Legacy mock subgroup keys → Russian labels.
 * The calculation store uses these hardcoded keys in mock data,
 * but they don't match the generated subgroup values (g6_sub_0, etc.).
 */
const legacySubgroupLabels: Record<string, string> = {
  'g1_corrugated_boxes': 'Изделия из гофрированной бумаги и картона',
  'g1_paper_packaging': 'Упаковка из бумаги и картона',
  'g2_paper_packaging': 'Упаковка из бумаги и картона',
  'g2_newspapers': 'Газеты и периодические издания',
  'g3_plastic_film': 'Плёнка и изделия из пластмасс',
  'g4_metal_cans': 'Тара и упаковка из металла',
  'g4_aluminum_cans': 'Банки алюминиевые',
  'g5_glass_colored': 'Стекло полое цветное',
  'g5_flat_glass': 'Стекло листовое',
  'g6_bottles_small': 'Бутылки и мелкая тара из пластмасс',
  'g6_containers': 'Тара и контейнеры из пластмасс',
  'g7_composite': 'Комбинированная упаковка',
  'g8_bottles_clear': 'Стекло полое бесцветное',
  'g8_bottles_colored': 'Стекло полое цветное',
  'g9_wood_packaging': 'Тара и упаковка из древесины',
  'g10_textile': 'Текстильная упаковка',
}

/**
 * Get human-readable subgroup label.
 * Tries generated subgroups first, then legacy mock keys.
 */
export function getSubgroupLabel(groupValue: string, subgroupValue: string): string {
  // Try generated subgroups
  const subs = productSubgroups[groupValue]
  const sub = subs?.find(s => s.value === subgroupValue)
  if (sub) return sub.label
  // Try legacy mock keys
  if (legacySubgroupLabels[subgroupValue]) return legacySubgroupLabels[subgroupValue]
  return subgroupValue
}
