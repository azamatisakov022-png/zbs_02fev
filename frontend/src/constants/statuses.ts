// Calculation statuses (aligned with swagger: draft, submitted, under_review, approved, rejected, paid, partially_paid)
export const CalcStatus = {
  DRAFT: 'draft',
  UNDER_REVIEW: 'under_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  PAYMENT_PENDING: 'payment_pending',
  PAID: 'paid',
  PAYMENT_REJECTED: 'payment_rejected',
  SUBMITTED: 'submitted',
  IN_REVIEW: 'in_review',
  REVISION: 'revision',
  FEE_PAID: 'fee_paid',
  PENALTY_PAID: 'penalty_paid',
  COMPLETED: 'completed',
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

// Feedback statuses
export const FeedbackStatus = {
  NEW: 'new',
  IN_PROGRESS: 'in_progress',
  UNDER_REVIEW: 'under_review',
  RESOLVED: 'resolved',
  REJECTED: 'rejected',
} as const
export type FeedbackStatusType = typeof FeedbackStatus[keyof typeof FeedbackStatus]

// Feedback categories
export const FeedbackCategory = {
  COMPLAINT: 'complaint',
  SUGGESTION: 'suggestion',
  INFO_REQUEST: 'info_request',
  VIOLATION_REPORT: 'violation_report',
} as const
export type FeedbackCategoryType = typeof FeedbackCategory[keyof typeof FeedbackCategory]

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
  submitted: 'status.submitted',
  in_review: 'status.inReview',
  fee_paid: 'status.feePaid',
  penalty_paid: 'status.penaltyPaid',
  completed: 'status.completed',
  in_progress: 'status.inProgress',
  resolved: 'status.resolved',
}
