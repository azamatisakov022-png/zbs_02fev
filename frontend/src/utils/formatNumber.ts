/**
 * Format a number with space-separated thousands and 2 decimal places.
 * Example: 1234567.8 → "1 234 567.80"
 */
export function formatNum(value: number | string | null | undefined, decimals = 2): string {
  if (value == null || value === '') return '0'
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return '0'
  const fixed = num.toFixed(decimals)
  const [intPart, decPart] = fixed.split('.')
  const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  return decPart ? `${formatted}.${decPart}` : formatted
}
