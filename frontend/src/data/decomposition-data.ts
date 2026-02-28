export interface DecompositionItem {
  id: number
  key: string
  emoji: string
  yearsMin: number
  yearsMax: number
  dangerLevel: 1 | 2 | 3 | 4 | 5
  type: 'product' | 'packaging'
}

// Sorted by yearsMin ascending
export const decompositionData: DecompositionItem[] = [
  { id: 22, key: 'paperPackaging', emoji: '📦', yearsMin: 0.25, yearsMax: 5, dangerLevel: 1, type: 'packaging' },
  { id: 24, key: 'woodPackaging', emoji: '🪵', yearsMin: 1, yearsMax: 15, dangerLevel: 1, type: 'packaging' },
  { id: 17, key: 'textile', emoji: '👕', yearsMin: 2, yearsMax: 200, dangerLevel: 2, type: 'product' },
  { id: 21, key: 'metalPackaging', emoji: '🥫', yearsMin: 10, yearsMax: 500, dangerLevel: 3, type: 'packaging' },
  { id: 18, key: 'footwear', emoji: '👟', yearsMin: 25, yearsMax: 80, dangerLevel: 2, type: 'product' },
  { id: 16, key: 'furniture', emoji: '🪑', yearsMin: 30, yearsMax: 200, dangerLevel: 2, type: 'product' },
  { id: 15, key: 'constructionMetal', emoji: '🔩', yearsMin: 50, yearsMax: 200, dangerLevel: 2, type: 'product' },
  { id: 23, key: 'combinedPackaging', emoji: '🧃', yearsMin: 50, yearsMax: 500, dangerLevel: 4, type: 'packaging' },
  { id: 3, key: 'electricStove', emoji: '🍳', yearsMin: 80, yearsMax: 300, dangerLevel: 3, type: 'product' },
  { id: 1, key: 'washingMachine', emoji: '🧺', yearsMin: 100, yearsMax: 500, dangerLevel: 4, type: 'product' },
  { id: 2, key: 'refrigerator', emoji: '❄️', yearsMin: 100, yearsMax: 500, dangerLevel: 5, type: 'product' },
  { id: 4, key: 'dishwasher', emoji: '🍽️', yearsMin: 100, yearsMax: 500, dangerLevel: 4, type: 'product' },
  { id: 11, key: 'tire', emoji: '🛞', yearsMin: 100, yearsMax: 500, dangerLevel: 4, type: 'product' },
  { id: 8, key: 'printer', emoji: '🖨️', yearsMin: 100, yearsMax: 500, dangerLevel: 4, type: 'product' },
  { id: 13, key: 'battery', emoji: '🪫', yearsMin: 100, yearsMax: 500, dangerLevel: 5, type: 'product' },
  { id: 10, key: 'electricLamp', emoji: '💡', yearsMin: 100, yearsMax: 1000, dangerLevel: 5, type: 'product' },
  { id: 12, key: 'accumulator', emoji: '🔋', yearsMin: 150, yearsMax: 500, dangerLevel: 5, type: 'product' },
  { id: 5, key: 'television', emoji: '📺', yearsMin: 200, yearsMax: 1000, dangerLevel: 5, type: 'product' },
  { id: 6, key: 'computer', emoji: '💻', yearsMin: 200, yearsMax: 1000, dangerLevel: 5, type: 'product' },
  { id: 7, key: 'monitor', emoji: '🖥️', yearsMin: 200, yearsMax: 1000, dangerLevel: 5, type: 'product' },
  { id: 9, key: 'mobilePhone', emoji: '📱', yearsMin: 200, yearsMax: 1000, dangerLevel: 5, type: 'product' },
  { id: 19, key: 'plasticPackaging', emoji: '🧴', yearsMin: 200, yearsMax: 1000, dangerLevel: 5, type: 'packaging' },
  { id: 14, key: 'constructionPlastic', emoji: '🏗️', yearsMin: 400, yearsMax: 1000, dangerLevel: 4, type: 'product' },
  { id: 20, key: 'glassPackaging', emoji: '🫙', yearsMin: 4000, yearsMax: 1000000, dangerLevel: 3, type: 'packaging' },
]

export function getDangerColor(level: 1 | 2 | 3 | 4 | 5): string {
  const colors: Record<number, string> = {
    1: '#10b981',
    2: '#84cc16',
    3: '#eab308',
    4: '#f59e0b',
    5: '#ef4444',
  }
  return colors[level]
}

export function getEraColor(yearsMin: number): string {
  if (yearsMin <= 15) return '#10b981'
  if (yearsMin <= 100) return '#eab308'
  if (yearsMin <= 500) return '#f59e0b'
  return '#ef4444'
}

export function logProgress(yearsMax: number): number {
  if (yearsMax <= 0) return 0
  return Math.min((Math.log10(yearsMax) / Math.log10(1000000)) * 100, 100)
}

export function formatYears(min: number, max: number, t: (key: string) => string): string {
  const fmt = (n: number): string => {
    if (n < 1) return `${Math.round(n * 12)} ${t('decomposition.monthsShort')}`
    return `${n.toLocaleString()} ${t('decomposition.yearsShort')}`
  }
  if (min === max) return fmt(min)
  return `${fmt(min)} — ${fmt(max)}`
}

export type FilterKey = 'all' | 'safe' | 'medium' | 'danger' | 'critical'

export function getFilterForItem(item: DecompositionItem): FilterKey {
  if (item.yearsMax <= 15) return 'safe'
  if (item.yearsMin >= 15 && item.yearsMin < 100) return 'medium'
  if (item.yearsMin >= 100 && item.yearsMin < 500) return 'danger'
  if (item.yearsMin >= 500) return 'critical'
  // overlapping ranges default
  if (item.yearsMin < 15) return 'safe'
  return 'danger'
}
