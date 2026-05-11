/**
 * Penalty calculation utilities.
 *
 * Источник: ст. 37 Кодекса КР № 90 от 10.08.2018 «О неналоговых доходах».
 * https://cbd.minjust.gov.kg/111820/edition/3673/ru
 *   ч.6  - 0,09% размера недоимки за каждый календарный день просрочки;
 *   ч.4  - общая сумма пени не может превышать 100% от тела долга;
 *   ч.3  - начисление с дня, СЛЕДУЮЩЕГО за днём установленного срока.
 */

/** Daily penalty rate: 0,09% (ст. 37 ч. 6 Кодекса КР № 90). */
export const PENALTY_DAILY_RATE = 0.0009

/** Penalty cap: 100% от суммы недоимки (ст. 37 ч. 4 Кодекса КР № 90). */
export const PENALTY_CAP_MULTIPLIER = 1.0

export type PenaltyExemptionReason =
  | 'force_majeure'
  | 'government_decree'
  | 'court_decision'
  | 'payment_plan'

export interface PenaltyExemption {
  reason: PenaltyExemptionReason
  startDate: string
  endDate?: string
  documentNumber?: string
  active: boolean
}

export interface PenaltyResult {
  overdueDays: number
  dailyPenalty: number
  totalPenalty: number
  capReached: boolean
  totalToPay: number
}

/**
 * Парсит дату из разных форматов:
 *   - Date (как есть)
 *   - ISO "YYYY-MM-DD" (от бэкенда)
 *   - "DD.MM.YYYY" (formatDateShort через toLocaleDateString('ru-RU'))
 * Если не парсится - возвращает null (пеня не будет считаться).
 */
function parseDate(value: string | Date): Date | null {
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value
  }
  if (typeof value !== 'string' || !value.trim()) return null

  // ru-RU локаль: "DD.MM.YYYY"
  const ruMatch = value.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})/)
  if (ruMatch) {
    const [, d, m, y] = ruMatch
    return new Date(+y, +m - 1, +d)
  }

  // ISO YYYY-MM-DD или полный datetime
  const parsed = new Date(value)
  return isNaN(parsed.getTime()) ? null : parsed
}

/**
 * Calculate overdue days from a due date to today
 */
export function getOverdueDays(dueDate: string | Date): number {
  const due = parseDate(dueDate)
  if (!due) return 0

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  due.setHours(0, 0, 0, 0)

  const diff = today.getTime() - due.getTime()
  if (diff <= 0) return 0

  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

/**
 * Calculate penalty for a given debt amount and due date
 */
export function calculatePenalty(debtAmount: number, dueDate: string | Date): PenaltyResult {
  const overdueDays = getOverdueDays(dueDate)

  if (overdueDays <= 0) {
    return {
      overdueDays: 0,
      dailyPenalty: 0,
      totalPenalty: 0,
      capReached: false,
      totalToPay: debtAmount,
    }
  }

  const dailyPenalty = debtAmount * PENALTY_DAILY_RATE
  let totalPenalty = dailyPenalty * overdueDays
  const cap = debtAmount * PENALTY_CAP_MULTIPLIER
  const capReached = totalPenalty >= cap

  if (capReached) {
    totalPenalty = cap
  }

  return {
    overdueDays,
    dailyPenalty,
    totalPenalty,
    capReached,
    totalToPay: debtAmount + totalPenalty,
  }
}

/**
 * Check if an organization is exempt from penalty
 */
export function isExemptFromPenalty(exemptions: PenaltyExemption[]): boolean {
  if (!exemptions || exemptions.length === 0) return false
  return exemptions.some((e) => e.active)
}
