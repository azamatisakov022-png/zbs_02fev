/**
 * Penalty (пеня) calculation utilities per Article 37,
 * KR Code on Non-Tax Revenues No. 90.
 *
 * Rate: 0.09% per calendar day on the debt amount, capped at 100%.
 */

export const PENALTY_DAILY_RATE = 0.0009
export const PENALTY_CAP_MULTIPLIER = 1.0
export const PENALTY_LEGAL_BASE = 'penalty.legalBase'

export type PenaltyExemptionReason =
  | 'government_decision'
  | 'court_decision'
  | 'force_majeure'
  | 'restructuring'
  | 'tax_authority_decision'

export interface PenaltyExemption {
  reason: PenaltyExemptionReason
  documentNumber: string
  date: string
  notes?: string
  active: boolean
}

export interface PenaltyCalculation {
  debtAmount: number
  dueDate: Date
  calculationDate: Date
  overdueDays: number
  dailyPenalty: number
  totalPenalty: number
  capReached: boolean
  totalToPay: number
}

/**
 * Parse a dd.MM.yyyy string into a Date.
 */
function parseDateString(dateStr: string): Date {
  const [d, m, y] = dateStr.split('.')
  return new Date(+y, +m - 1, +d)
}

/**
 * Get the number of calendar days between dueDate and toDate.
 * Returns 0 if toDate <= dueDate (not overdue).
 */
export function getOverdueDays(dueDate: Date | string, toDate?: Date | string): number {
  const due = typeof dueDate === 'string' ? parseDateString(dueDate) : new Date(dueDate)
  const to = toDate
    ? (typeof toDate === 'string' ? parseDateString(toDate) : new Date(toDate))
    : new Date()

  due.setHours(0, 0, 0, 0)
  to.setHours(0, 0, 0, 0)

  const diffMs = to.getTime() - due.getTime()
  if (diffMs <= 0) return 0

  return Math.floor(diffMs / (1000 * 60 * 60 * 24))
}

/**
 * Calculate penalty for a single debt.
 */
export function calculatePenalty(
  debtAmount: number,
  dueDate: Date | string,
  calculationDate?: Date | string,
): PenaltyCalculation {
  const due = typeof dueDate === 'string' ? parseDateString(dueDate) : new Date(dueDate)
  const calcDate = calculationDate
    ? (typeof calculationDate === 'string' ? parseDateString(calculationDate) : new Date(calculationDate))
    : new Date()

  const overdueDays = getOverdueDays(due, calcDate)
  const dailyPenalty = Math.round(debtAmount * PENALTY_DAILY_RATE * 100) / 100
  const maxPenalty = Math.round(debtAmount * PENALTY_CAP_MULTIPLIER * 100) / 100
  const rawPenalty = Math.round(dailyPenalty * overdueDays * 100) / 100
  const totalPenalty = Math.min(rawPenalty, maxPenalty)
  const capReached = rawPenalty >= maxPenalty && overdueDays > 0

  return {
    debtAmount,
    dueDate: due,
    calculationDate: calcDate,
    overdueDays,
    dailyPenalty,
    totalPenalty,
    capReached,
    totalToPay: Math.round((debtAmount + totalPenalty) * 100) / 100,
  }
}

/**
 * Check if a payer is exempt from penalty based on active exemptions.
 */
export function isExemptFromPenalty(exemptions: PenaltyExemption[]): boolean {
  return exemptions.some(e => e.active)
}

/**
 * Calculate penalty for multiple debts.
 */
export function calculateTotalPenalty(
  debts: Array<{ amount: number; dueDate: Date | string }>,
  calculationDate?: Date | string,
): PenaltyCalculation[] {
  return debts.map(d => calculatePenalty(d.amount, d.dueDate, calculationDate))
}
