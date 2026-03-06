/**
 * Format a number with thousands separator and decimal places
 */
export function formatNum(value: number | string | null | undefined, decimals = 2): string {
  if (value == null || value === '') return '0'
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return '0'

  return num.toLocaleString('ru-RU', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}
