// TypeScript-типы модуля «Лицензии».
// Согласованы с бэкенд-энумами (kg.eco.operator.entity.enums.*).

export type BusinessType = 'payer' | 'applicant' | 'both'

export type LicenseType =
  | 'collection'
  | 'transportation'
  | 'processing'
  | 'neutralization'
  | 'storage_disposal'
  | 'complex'

export type LicenseApplicationStatus =
  | 'draft'
  | 'payment_pending'
  | 'submitted'
  | 'under_review'
  | 'site_visit_done'
  | 'approved'
  | 'rejected'

export type ApplicantType =
  | 'recycler'
  | 'landfill'
  | 'collection_point'
  | 'other'

export type ApplicantEntity = 'legal_entity' | 'sole_proprietor'

export type RejectionReason =
  | 'legal_prohibition'
  | 'court_decision'
  | 'invalid_info'
  | 'documents_mismatch'
  | 'fee_not_paid'

export type LicenseDocumentType =
  | 'application_form'
  | 'registration_cert'
  | 'payment_receipt'
  | 'waste_object_ownership'
  | 'eco_expertise_report'
  | 'eco_justification'
  | 'security_order'
  | 'sanitary_fire_approval'
  | 'quality_control_info'
  | 'measuring_equipment_list'
  | 'metrology_certificates'
  | 'personnel_info'

export type LicensePaymentStatus =
  | 'pending'
  | 'success'
  | 'failed'
  | 'expired'
  | 'manual_confirmed'

export type LicensePaymentMethod =
  | 'card'
  | 'qr'
  | 'bank_transfer'
  | 'manual_offline'

// ─── Модели ────────────────────────────────────────────

export interface DocumentItem {
  id: number
  docType: LicenseDocumentType
  fileName: string
  fileSize?: number
  uploadedAt: string
}

export interface PaymentSummary {
  id: number
  provider: string
  status: LicensePaymentStatus
  paymentMethod?: LicensePaymentMethod
  paidAt?: string
  receiptFileName?: string
}

export interface LicenseApplication {
  id: number
  status: LicenseApplicationStatus

  applicantType: ApplicantType
  applicantId?: number
  applicantEntity: ApplicantEntity
  applicantName: string
  applicantInn: string

  licenseType: LicenseType
  activityTypes: string[]
  legalAddress: string
  actualAddress: string
  contactPhone?: string
  contactEmail?: string
  contactPerson?: string

  submittedAt?: string
  deadline?: string
  daysLeft?: number
  reopenedCount?: number

  siteVisitDone?: boolean
  siteVisitDate?: string
  siteVisitInspector?: string
  siteVisitComment?: string

  rejectionReason?: RejectionReason
  rejectionComment?: string

  documents?: DocumentItem[]
  payment?: PaymentSummary

  licenseId?: number
  licenseNumber?: string

  createdAt: string
  updatedAt: string
}

export interface License {
  id: number
  licenseNumber: string
  applicationId: number
  applicantType: ApplicantType
  applicantId?: number
  applicantName: string
  applicantInn: string
  licenseType: LicenseType
  activityTypes: string[]
  legalAddress: string
  actualAddress: string
  issuedAt: string
  validUntil: string
  isPublished: boolean
  isRevoked: boolean
  revokedAt?: string
  revocationReason?: string
  issuedByName?: string
  statusLabel: 'active' | 'expiring' | 'expired' | 'revoked'
}

export interface PaymentIntent {
  paymentId: number
  paymentUrl: string
  providerOrderId: string
  provider: string
  expiresAt?: string
}

export interface PaymentStatusInfo {
  paymentId: number
  applicationId: number
  applicationStatus: LicenseApplicationStatus
  status: LicensePaymentStatus
  provider: string
  amount?: number
  paidAt?: string
  receiptUrl?: string
  errorMessage?: string
}

export interface EnumItem<T extends string = string> {
  value: T
  name: string
  labelRu: string
  extra?: Record<string, unknown>
}

// ─── Запросы ────────────────────────────────────────────

export interface CreateApplicationRequest {
  applicantType: ApplicantType
  applicantId?: number | null
  applicantEntity: ApplicantEntity
  applicantName: string
  applicantInn: string
  licenseType: LicenseType
  activityTypes: string[]
  legalAddress: string
  actualAddress: string
  contactPhone?: string
  contactEmail?: string
  contactPerson?: string
}

export interface SubmitApplicationRequest {
  paymentMode: 'online' | 'offline'
  returnUrl?: string
}

export interface RejectApplicationRequest {
  reason: RejectionReason
  comment?: string
}

export interface SiteVisitRequest {
  date: string // YYYY-MM-DD
  inspector: string
  comment?: string
}

export interface ApproveApplicationRequest {
  validUntil: string // YYYY-MM-DD
}

export interface ManualPaymentInfo {
  amount: number
  paidAt: string // ISO-8601
}
