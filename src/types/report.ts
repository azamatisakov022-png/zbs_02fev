import type { ReportStatusType } from '@/constants/statuses'

export interface ProcessingItem {
  id: number
  wasteType: string
  wasteCode: string
  declared: string
  processed: string
  recycler: string
  contractNumber: string
  contractDate: string
}

export interface UploadedFile {
  id: number
  name: string
  size: string
  type: string
}

export interface ReportHistoryEntry {
  id: number
  action: string
  date: string
  user: string
  comment?: string
}

export interface Report {
  id: number
  number: string
  date: string
  company: string
  inn: string
  year: string
  items: ProcessingItem[]
  files: UploadedFile[]
  totalDeclared: number
  totalProcessed: number
  processingPercent: number
  status: ReportStatusType
  rejectionReason?: string
  reviewDate?: string
  reviewer?: string
  history: ReportHistoryEntry[]
}

export type ViewMode = 'wizard' | 'success'

export type ReportFormErrors = Record<string, string>
