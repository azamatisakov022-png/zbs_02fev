/**
 * Format a number with fixed decimal places and Russian locale separators.
 * Fixes floating-point display issues (e.g. 16.369999999999997 → "16,37").
 */
export function formatNum(value: number | string | null | undefined, decimals: number = 2): string {
  const n = typeof value === 'string' ? parseFloat(value) : (value ?? 0)
  if (isNaN(n)) return '0'
  return n.toLocaleString('ru-RU', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

/**
 * Round a number to given decimal places (fixes floating-point arithmetic).
 * Use this when STORING/COMPUTING values, not just displaying.
 */
export function roundNum(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals)
  return Math.round(value * factor) / factor
}
