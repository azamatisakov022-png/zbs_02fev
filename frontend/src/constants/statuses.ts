// Calculation statuses (aligned with swagger: draft, submitted, under_review, approved, rejected, paid, partially_paid)
export const CalcStatus = {
  DRAFT: 'draft',
  UNDER_REVIEW: 'under_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  PAYMENT_PENDING: 'payment_pending',
  PAID: 'paid',
  PAYMENT_REJECTED: 'payment_rejected',
} as const
export type CalcStatusType = typeof CalcStatus[keyof typeof CalcStatus]

// Report statuses
export const ReportStatus = {
  DRAFT: 'draft',
  UNDER_REVIEW: 'under_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  REVISION: 'revision',
} as const
export type ReportStatusType = typeof ReportStatus[keyof typeof ReportStatus]

// Declaration statuses
export const DeclStatus = {
  DRAFT: 'draft',
  UNDER_REVIEW: 'under_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  REVISION: 'revision',
} as const
export type DeclStatusType = typeof DeclStatus[keyof typeof DeclStatus]

// Refund statuses
export const RefundStatus = {
  NEW: 'new',
  UNDER_REVIEW: 'under_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const
export type RefundStatusType = typeof RefundStatus[keyof typeof RefundStatus]

// License statuses
export const LicenseStatus = {
  VALID: 'valid',
  EXPIRING: 'expiring',
  EXPIRED: 'expired',
  UNDER_REVIEW: 'under_review',
  REVOKED: 'revoked',
} as const

// User/Organization statuses
export const UserStatus = {
  ACTIVE: 'active',
  BLOCKED: 'blocked',
  TEMP_BLOCKED: 'temp_blocked',
  PENDING: 'pending',
  DEACTIVATED: 'deactivated',
} as const

// Correction request statuses
export const CorrectionStatus = {
  UNDER_REVIEW: 'under_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const
export type CorrectionStatusType = typeof CorrectionStatus[keyof typeof CorrectionStatus]

// Account statuses
export const AccountStatus = {
  ACTIVE: 'active',
  BLOCKED: 'blocked',
} as const
export type AccountStatusType = typeof AccountStatus[keyof typeof AccountStatus]

// i18n key mapping: status value -> i18n key under "status.*"
export const statusI18nKey: Record<string, string> = {
  draft: 'status.draft',
  under_review: 'status.underReview',
  approved: 'status.approved',
  rejected: 'status.rejected',
  paid: 'status.paid',
  payment_pending: 'status.paymentPending',
  payment_rejected: 'status.paymentRejected',
  revision: 'status.revision',
  new: 'status.new',
  valid: 'status.valid',
  expiring: 'status.expiring',
  expired: 'status.expired',
  revoked: 'status.revoked',
  active: 'status.active',
  blocked: 'status.blocked',
  temp_blocked: 'status.tempBlocked',
  pending: 'status.pending',
  deactivated: 'status.deactivated',
  suspended: 'status.suspended',
  closed: 'status.closed',
  recultivation: 'status.recultivation',
}
