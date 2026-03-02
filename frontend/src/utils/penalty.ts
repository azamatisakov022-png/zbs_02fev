/** Daily penalty rate: 0.09% of debt */
export const PENALTY_DAILY_RATE = 0.0009

/** Maximum penalty cap: 100% of debt */
export const PENALTY_CAP_MULTIPLIER = 1.0

export interface PenaltyResult {
  overdueDays: number
  dailyPenalty: number
  totalPenalty: number
  capReached: boolean
  totalToPay: number
}

/**
 * Get the number of overdue days from a due date string (dd.MM.yyyy or ISO).
 * Returns 0 if not overdue.
 */
export function getOverdueDays(dueDate: string | Date | undefined | null): number {
  if (!dueDate) return 0
  const due = parseDateInput(dueDate)
  if (!due) return 0
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  due.setHours(0, 0, 0, 0)
  const diff = now.getTime() - due.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  return days > 0 ? days : 0
}

/**
 * Calculate penalty for a given debt amount and due date.
 * Daily rate: 0.09%, capped at 100% of debt.
 */
export function calculatePenalty(
  debtAmount: number,
  dueDate: string | Date | undefined | null,
): PenaltyResult {
  const days = getOverdueDays(dueDate)
  if (days <= 0 || debtAmount <= 0) {
    return {
      overdueDays: 0,
      dailyPenalty: 0,
      totalPenalty: 0,
      capReached: false,
      totalToPay: debtAmount || 0,
    }
  }

  const dailyPenalty = Math.round(debtAmount * PENALTY_DAILY_RATE * 100) / 100
  let totalPenalty = Math.round(dailyPenalty * days * 100) / 100
  const maxPenalty = debtAmount * PENALTY_CAP_MULTIPLIER
  const capReached = totalPenalty >= maxPenalty
  if (capReached) {
    totalPenalty = maxPenalty
  }

  return {
    overdueDays: days,
    dailyPenalty,
    totalPenalty,
    capReached,
    totalToPay: debtAmount + totalPenalty,
  }
}

function parseDateInput(input: string | Date): Date | null {
  if (input instanceof Date) return new Date(input.getTime())
  if (!input) return null
  // Try dd.MM.yyyy format
  const dotMatch = input.match(/^(\d{2})\.(\d{2})\.(\d{4})$/)
  if (dotMatch) {
    return new Date(+dotMatch[3], +dotMatch[2] - 1, +dotMatch[1])
  }
  // Try ISO / yyyy-MM-dd
  const d = new Date(input)
  return isNaN(d.getTime()) ? null : d
}

export type PenaltyExemptionReason = 'court_order' | 'government_decree' | 'natural_disaster' | 'other'

export interface PenaltyExemption {
  id?: string | number
  reason: PenaltyExemptionReason
  description?: string
  startDate?: string
  endDate?: string
  active?: boolean
}

/**
 * Check if penalty exemptions list contains an active exemption.
 */
export function isExemptFromPenalty(exemptions: PenaltyExemption[]): boolean {
  if (!exemptions || exemptions.length === 0) return false
  return exemptions.some((e) => e.active !== false)
}
