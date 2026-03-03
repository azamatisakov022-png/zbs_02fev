import type { CorrectionStatusType, AccountStatusType } from '@/constants/statuses'

export type TransactionType =
  | 'charge'
  | 'payment'
  | 'correction'
  | 'offset'
  | 'refund'
  | 'penalty'
  | 'penalty_payment'

export interface AccountTransaction {
  id: number
  date: string
  type: TransactionType
  calculationId: number
  calculationNumber: string
  description: string
  chargeAmount: number
  paymentAmount: number
  offsetAmount: number
  balance: number
}

export interface CorrectionItem {
  group: string
  subgroup: string
  volume: number
  recyclingStandard: number
  volumeToRecycle: number
  previousTransferred: number
  previousExported: number
  additionalTransferred: number
  additionalExported: number
  oldTaxableVolume: number
  newTaxableVolume: number
  rate: number
  difference: number
}

export interface CorrectionRequest {
  id: number
  date: string
  calculationId: number
  calculationNumber: string
  company: string
  comment?: string
  items: CorrectionItem[]
  totalCorrectionAmount: number
  action: 'balance' | 'refund'
  status: CorrectionStatusType
  documents: string[]
}

export interface CompanyAccount {
  id: number
  company: string
  inn: string
  balance: number
  status: AccountStatusType
  transactions: AccountTransaction[]
}

export interface SubmitCorrectionPayload {
  calculationId: number
  calculationNumber: string
  company: string
  comment?: string
  items: CorrectionItem[]
  totalCorrectionAmount: number
  action: 'balance' | 'refund'
  documents: string[]
}
