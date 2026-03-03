import { type CalcStatusType } from '../constants/statuses'
import i18n from '../i18n'

export type DocumentType = 'gtd' | 'act' | 'invoice_goods' | 'invoice' | 'contract' | 'other'

export function getDocumentTypeLabel(type: DocumentType): string {
  const key = {
    gtd: 'documentType.gtd',
    act: 'documentType.act',
    invoice_goods: 'documentType.invoiceGoods',
    invoice: 'documentType.invoice',
    contract: 'documentType.contract',
    other: 'documentType.other',
  }[type]
  return key ? i18n.global.t(key) : type
}

export interface AttachedDocument {
  id: number
  fileName: string
  fileSize: number
  fileType: string
  docType: DocumentType
  dataUrl: string
}

export interface ProductItem {
  id: number
  group: string
  subgroup: string
  gskpCode: string
  tnvedCode: string
  volume: string
  recyclingStandard: number
  volumeToRecycle: number
  transferredToRecycling: string
  exportedFromKR: string
  taxableVolume: number
  rate: number
  amount: number
}

export type CalculationStatus = CalcStatusType

export type AuditAction = 'created' | 'submitted' | 'assigned' | 'unassigned' | 'approved' | 'revision' | 'rejected' | 'resubmitted' | 'fee_payment_uploaded' | 'fee_payment_confirmed' | 'penalty_payment_uploaded' | 'penalty_payment_confirmed' | 'completed'

export interface AuditEntry {
  id: string
  timestamp: string
  action: AuditAction
  userId: string
  userName: string
  userRole: 'payer' | 'operator'
  comment?: string
  metadata?: Record<string, any>
}

export interface PaymentData {
  paymentOrderNumber: string
  paymentDate: string
  payerBank: string
  transferAmount: number
  fileName: string
  fileType: string
  fileDataUrl: string
  comment?: string
}

export interface Calculation {
  id: number
  number: string
  date: string
  company: string
  inn: string
  address?: string
  period: string
  quarter: string
  year: string
  payerType?: 'producer' | 'importer'
  importDate?: string
  dueDate?: string
  items: ProductItem[]
  totalAmount: number
  status: CalculationStatus
  rejectionReason?: string
  rejectedAt?: string
  rejectedBy?: string
  parentId?: number
  paidAt?: string
  payment?: PaymentData
  paymentRejectionReason?: string
  attachedFiles?: string[]
  documents?: AttachedDocument[]
  assignedTo?: string
  assignedName?: string
  history?: AuditEntry[]
  penaltyFixedDate?: string | null
  penaltyFixedAmount?: number | null
  penaltyFixedDays?: number | null
  feePayment?: PaymentData
  penaltyPayment?: PaymentData
  revisionComment?: string
  approvedAt?: string
  feeConfirmedAt?: string
  penaltyConfirmedAt?: string
}
