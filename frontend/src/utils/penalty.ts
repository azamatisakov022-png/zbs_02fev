/**
 * Penalty calculation utilities
 * Based on application.yml: calculation.penalty.daily-rate = 0.0009 (0.09% per day)
 *
 * Ставки конфигурируются через env-переменные:
 *   VITE_PENALTY_DAILY_RATE — дневная ставка (по умолчанию 0.0009)
 *   VITE_PENALTY_CAP — потолок пени как множитель суммы долга (по умолчанию 1.0)
 * При появлении API бэкенда — заменить на серверные значения.
 */

/** Daily penalty rate: configurable, default 0.09% */
export const PENALTY_DAILY_RATE = Number(import.meta.env.VITE_PENALTY_DAILY_RATE) || 0.0009

/** Penalty cap: configurable, default 100% of debt */
export const PENALTY_CAP_MULTIPLIER = Number(import.meta.env.VITE_PENALTY_CAP) || 1.0

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
 * Calculate overdue days from a due date to today
 */
export function getOverdueDays(dueDate: string | Date): number {
  const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate
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
