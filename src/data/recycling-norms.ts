// Нормативы утилизации отходов на 2025-2030 гг.
// Источник: первоисточник (постановление КМ КР), rop-data.json
// Две тарифные группы:
//   «high»     — группы 1-4   (бумага/картон, масла, шины)
//   «standard» — группы 5-24  (остальные товары + вся упаковка)

export type NormativeTier = 'high' | 'standard'

// Нормативы Нпер по годам (доля, НЕ проценты: 0.2 = 20%)
export const normativeTiers: Record<NormativeTier, Record<number, number>> = {
  high: {
    2025: 0.2,
    2026: 0.3,
    2027: 0.5,
    2028: 0.6,
    2029: 0.7,
    2030: 0.8,
  },
  standard: {
    2025: 0.1,
    2026: 0.2,
    2027: 0.4,
    2028: 0.5,
    2029: 0.7,
    2030: 0.8,
  },
}

// Группы 1-4 → «high», группы 5-24 → «standard»
const HIGH_TIER_GROUPS = [1, 2, 3, 4]

/**
 * Определить тарифную группу для номера группы (1-24)
 */
export function getNormativeTier(groupNumber: number): NormativeTier {
  return HIGH_TIER_GROUPS.includes(groupNumber) ? 'high' : 'standard'
}

/**
 * Получить значение норматива Нпер для группы и года
 * @param groupKey - ключ группы (e.g. 'group_4')
 * @param year - год (2025-2030)
 * @returns доля норматива (0.0 - 1.0)
 */
export function getNormativeForGroup(groupKey: string, year: number): number {
  const match = groupKey.match(/group_(\d+)/)
  if (!match) return 0
  const groupNumber = parseInt(match[1])
  const tier = getNormativeTier(groupNumber)
  return normativeTiers[tier][year] || 0
}

/**
 * Рассчитать утилизационный сбор
 * Усб = Сус × Мтв/уп × Нпер
 * @param rate - ставка Сус (сом/тонну)
 * @param mass - масса Мтв/уп (тонны)
 * @param normative - норматив Нпер (доля 0.0-1.0)
 * @returns сумма утилизационного сбора (сом), округлённая до целого
 */
export function calculateUtilizationFee(rate: number, mass: number, normative: number): number {
  return Math.round(rate * mass * normative)
}

/**
 * Рассчитать утилизационный сбор при самостоятельной переработке
 * Усб = Сус × max(0, Куст - Кфакт)
 * @param rate - ставка Сус (сом/тонну)
 * @param requiredAmount - установленное количество Куст (тонны)
 * @param actualProcessed - фактически переработано Кфакт (тонны)
 * @returns сумма утилизационного сбора (сом), округлённая до целого
 */
export function calculateUtilizationFeeSelfProcessing(
  rate: number,
  requiredAmount: number,
  actualProcessed: number,
): number {
  const difference = Math.max(0, requiredAmount - actualProcessed)
  return Math.round(rate * difference)
}

// --- Обратная совместимость ---
// Старые экспорты для компонентов, которые могут их использовать

export interface RecyclingNorm {
  id: number
  category: string
  categoryKey: string
  rates: Record<number, number>
}

// Нормативы для товаров (24 группы) — все используют 2-тарифную систему
export const goodsNorms: RecyclingNorm[] = []
export const packagingNorms: RecyclingNorm[] = []

/**
 * @deprecated Используйте getNormativeForGroup вместо этой функции
 */
export function getRecyclingNorm(categoryKey: string, year: number, type: 'goods' | 'packaging' = 'goods'): number | null {
  return null
}

/**
 * @deprecated Используйте getNormativeForGroup вместо этой функции
 */
export function getRecyclingNormForProduct(groupKey: string, _subgroupKey: string | null, year: number): number {
  return getNormativeForGroup(groupKey, year) * 100
}

// Маппинг групп → тарифных категорий (для обратной совместимости)
export const productGroupToNormMapping: Record<string, { type: 'goods' | 'packaging', categoryKey: string }> = {}
