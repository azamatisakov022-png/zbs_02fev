import { CalcStatus, ReportStatus, DeclStatus, RefundStatus, LicenseStatus, UserStatus } from '../constants/statuses'

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral'

const variantMap: Record<string, BadgeVariant> = {
  // Success (green)
  [CalcStatus.APPROVED]: 'success',
  [CalcStatus.PAID]: 'success',
  [LicenseStatus.VALID]: 'success',
  [UserStatus.ACTIVE]: 'success',

  // Warning (yellow/orange)
  [CalcStatus.DRAFT]: 'warning',
  [CalcStatus.UNDER_REVIEW]: 'warning',
  [CalcStatus.PAYMENT_PENDING]: 'warning',
  [DeclStatus.REVISION]: 'warning',
  [LicenseStatus.EXPIRING]: 'warning',
  [UserStatus.PENDING]: 'warning',

  // Danger (red)
  [CalcStatus.REJECTED]: 'danger',
  [CalcStatus.PAYMENT_REJECTED]: 'danger',
  [LicenseStatus.EXPIRED]: 'danger',
  [LicenseStatus.REVOKED]: 'danger',
  [UserStatus.BLOCKED]: 'danger',
  [UserStatus.TEMP_BLOCKED]: 'danger',

  // Info (blue)
  [RefundStatus.NEW]: 'info',

  // Neutral (gray)
  [UserStatus.DEACTIVATED]: 'neutral',
  suspended: 'neutral',

  // Compliance-specific
  fulfilled: 'success',
  close: 'warning',
  failed: 'danger',
  partial: 'warning',

  // Condition-specific
  good: 'success',
  warning: 'warning',
  critical: 'danger',
}

/**
 * Maps status strings to AppBadge variant names.
 * Used across all dashboard views for consistent badge coloring.
 */
export function getStatusBadgeVariant(status: string): BadgeVariant {
  return variantMap[status] || 'neutral'
}
