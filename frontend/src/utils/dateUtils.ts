/**
 * Adds N working days (skipping Saturday=6, Sunday=0) to a start date.
 */
export function addWorkingDays(startDate: Date, days: number): Date {
  const result = new Date(startDate)
  let count = 0
  while (count < days) {
    result.setDate(result.getDate() + 1)
    const dayOfWeek = result.getDay()
    if (dayOfWeek !== 0 && dayOfWeek !== 6) count++
  }
  return result
}

/**
 * Calculates payment deadline based on payer type.
 *
 * Producer: 15th of the month following the quarter end.
 *   Q1 → April 15, Q2 → July 15, Q3 → October 15, Q4 → January 15 next year.
 *
 * Importer: import date + 15 CALENDAR days (Sat/Sun are NOT skipped).
 * Согласовано с ЭО 2026-05-12.
 */
export function calculatePaymentDeadline(
  payerType: 'producer' | 'importer',
  options: { quarter?: string; year?: string; importDate?: string }
): Date | null {
  if (payerType === 'producer') {
    const { quarter, year } = options
    if (!quarter || !year) return null
    const y = parseInt(year)
    if (isNaN(y)) return null
    const quarterMap: Record<string, { month: number; yearOffset: number }> = {
      Q1: { month: 3, yearOffset: 0 },   // April (0-based: 3)
      Q2: { month: 6, yearOffset: 0 },   // July
      Q3: { month: 9, yearOffset: 0 },   // October
      Q4: { month: 0, yearOffset: 1 },   // January next year
    }
    const mapping = quarterMap[quarter]
    if (!mapping) return null
    return new Date(y + mapping.yearOffset, mapping.month, 15)
  }

  if (payerType === 'importer') {
    const { importDate } = options
    if (!importDate) return null
    const start = new Date(importDate)
    if (isNaN(start.getTime())) return null
    // +15 КАЛЕНДАРНЫХ дней (по решению ЭО 2026-05-12).
    const result = new Date(start)
    result.setDate(result.getDate() + 15)
    return result
  }

  return null
}

/**
 * Counts CALENDAR days between two dates (Sat/Sun NOT skipped).
 */
function countCalendarDaysBetween(from: Date, to: Date): number {
  const a = new Date(from); a.setHours(0, 0, 0, 0)
  const b = new Date(to);   b.setHours(0, 0, 0, 0)
  const diffMs = b.getTime() - a.getTime()
  return Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)))
}

/**
 * Returns remaining calendar days until deadline and whether it's overdue.
 * (Унифицировано с пеней - всё считаем в календарных днях, ст. 37 ч. 3
 * Кодекса КР № 90.)
 */
export function getRemainingDays(deadline: Date): { days: number; overdue: boolean } {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(deadline)
  target.setHours(0, 0, 0, 0)
  if (target < today) {
    return { days: countCalendarDaysBetween(target, today), overdue: true }
  }
  return { days: countCalendarDaysBetween(today, target), overdue: false }
}

/**
 * Formats a Date to Russian locale string like "15 апреля 2026 г."
 */
export function formatDateRu(date: Date): string {
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

/**
 * Formats a Date to short dd.MM.yyyy format like "15.04.2026"
 */
export function formatDateShort(date: Date): string {
  return date.toLocaleDateString('ru-RU')
}
