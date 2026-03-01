/**
 * Penalty (пеня) calculation utility.
 * Based on Kyrgyz legislation — 0.1% of debt per overdue day.
 */

export interface PenaltyResult {
  debtAmount: number
  dueDate: Date
  overdueDays: number
  dailyRate: number
  dailyPenalty: number
  totalPenalty: number
  totalWithPenalty: number
  totalToPay: number
  capReached: boolean
}

/**
 * Calculate penalty for overdue payment.
 * @param debtAmount — сумма задолженности (сом)
 * @param dueDate — дата, до которой нужно было оплатить
 * @param asOfDate — дата расчёта (по умолчанию — сегодня)
 */
export const PENALTY_DAILY_RATE = 0.001 // 0.1% в день
export const PENALTY_CAP_MULTIPLIER = 0.5 // максимум 50% от суммы долга

/**
 * Get number of overdue days from a due date string or Date.
 */
export function getOverdueDays(dueDate: string | Date, asOfDate: Date = new Date()): number {
  const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate
  const dueTime = new Date(due.getFullYear(), due.getMonth(), due.getDate()).getTime()
  const nowTime = new Date(asOfDate.getFullYear(), asOfDate.getMonth(), asOfDate.getDate()).getTime()
  const diffMs = nowTime - dueTime
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)))
}

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
  notes: string
  active: boolean
}

/**
 * Check if there is any active penalty exemption.
 */
export function isExemptFromPenalty(exemptions: PenaltyExemption[]): boolean {
  return exemptions.some(e => e.active)
}

export function calculatePenalty(
  debtAmount: number,
  dueDate: string | Date,
  asOfDate: Date = new Date(),
): PenaltyResult {
  const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate
  const overdueDays = getOverdueDays(due, asOfDate)
  const dailyPenalty = Math.round(debtAmount * PENALTY_DAILY_RATE * 100) / 100
  const cap = Math.round(debtAmount * PENALTY_CAP_MULTIPLIER * 100) / 100

  let totalPenalty = Math.round(debtAmount * PENALTY_DAILY_RATE * overdueDays * 100) / 100
  const capReached = totalPenalty >= cap
  if (capReached) totalPenalty = cap

  const totalToPay = Math.round((debtAmount + totalPenalty) * 100) / 100

  return {
    debtAmount,
    dueDate: due,
    overdueDays,
    dailyRate: PENALTY_DAILY_RATE,
    dailyPenalty,
    totalPenalty,
    totalWithPenalty: totalToPay,
    totalToPay,
    capReached,
  }
}
