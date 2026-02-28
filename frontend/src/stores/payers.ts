import { reactive } from 'vue'
import api, { silentApi } from '../api/client'
import i18n from '../i18n'

// ── Types ──────────────────────────────────────────────────

export type PayerCategory = 'importer' | 'producer' | 'both'
export type PayerSubcategory = 'eaeu' | 'thirdCountry'
export type ReportingStatus = 'onTime' | 'expected' | 'overdue'
export type SettlementStatus = 'clear' | 'overpaid' | 'debt'
export type SystemStatus = 'active' | 'suspended' | 'excluded'
export type DeclarationStatus = 'draft' | 'review' | 'approved' | 'rejected' | 'paid'
export type PaymentStatus = 'completed' | 'pending' | 'rejected'

export interface PayerDeclaration {
  id: string
  period: string
  operationType: string
  mass: number
  amount: number
  status: DeclarationStatus
  submittedAt: string
}

export interface PayerPayment {
  id: string
  date: string
  amount: number
  method: string
  status: PaymentStatus
}

export interface AuditEntry {
  date: string
  action: string
  user: string
  details: string
}

export interface PayerComment {
  id: number
  date: string
  author: string
  text: string
}

export interface PayerDocument {
  id: number
  name: string
  type: string
  size: string
  uploadedAt: string
}

export interface Payer {
  id: number
  name: string
  shortName: string
  opf: string
  inn: string
  region: string
  category: PayerCategory
  subcategory?: PayerSubcategory
  declarationsCount: number
  lastCalculationDate: string
  reportingStatus: ReportingStatus
  lastPaymentDate: string
  lastPaymentAmount: number
  totalCharged: number
  totalPaid: number
  settlementStatus: SettlementStatus
  settlementAmount: number
  registeredAt: string
  contactPerson: string
  contactPhone: string
  contactEmail: string
  legalAddress: string
  actualAddress: string
  director: string
  directorPosition: string
  website: string
  oked: string
  systemStatus: SystemStatus
  suspensionReason: string
  lastUpdated: string
  lastUpdatedBy: string
  declarations: PayerDeclaration[]
  payments: PayerPayment[]
  auditLog: AuditEntry[]
  comments: PayerComment[]
  documents: PayerDocument[]
}

// ── Labels ─────────────────────────────────────────────────

export function getCategoryLabel(cat: PayerCategory): string {
  return i18n.global.t(`payer.category.${cat}`)
}
export const categoryColors: Record<PayerCategory, string> = {
  importer: 'bg-blue-100 text-blue-800',
  producer: 'bg-purple-100 text-purple-800',
  both: 'bg-indigo-100 text-indigo-800',
}
export function getSubcategoryLabel(sub: PayerSubcategory): string {
  return i18n.global.t(`payer.subcategory.${sub}`)
}
export function getReportingLabel(status: ReportingStatus): string {
  return i18n.global.t(`payer.reporting.${status}`)
}
export const reportingColors: Record<ReportingStatus, string> = {
  onTime: 'bg-green-100 text-green-800',
  expected: 'bg-yellow-100 text-yellow-800',
  overdue: 'bg-red-100 text-red-800',
}
export function getSettlementLabel(status: SettlementStatus): string {
  return i18n.global.t(`payer.settlement.${status}`)
}
export const settlementColors: Record<SettlementStatus, string> = {
  clear: 'bg-green-100 text-green-800',
  overpaid: 'bg-blue-100 text-blue-800',
  debt: 'bg-red-100 text-red-800',
}
export function getSystemStatusLabel(status: SystemStatus): string {
  return i18n.global.t(`payer.systemStatus.${status}`)
}
export const systemStatusColors: Record<SystemStatus, string> = {
  active: 'bg-green-100 text-green-800',
  suspended: 'bg-yellow-100 text-yellow-800',
  excluded: 'bg-red-100 text-red-800',
}
export function getDeclarationStatusLabel(status: DeclarationStatus): string {
  return i18n.global.t(`payer.declarationStatus.${status}`)
}
export const declarationStatusColors: Record<DeclarationStatus, string> = {
  draft: 'bg-gray-100 text-gray-700',
  review: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  paid: 'bg-blue-100 text-blue-800',
}
export function getPaymentStatusLabel(status: PaymentStatus): string {
  return i18n.global.t(`payer.paymentStatus.${status}`)
}
export const paymentStatusColors: Record<PaymentStatus, string> = {
  completed: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  rejected: 'bg-red-100 text-red-800',
}

let nextCommentId = 1

const state = reactive<{ payers: Payer[]; loading: boolean }>({
  loading: false,
  payers: [],
})

// ── Store API ──────────────────────────────────────────────

async function fetchAll() {
  state.loading = true
  try {
    const { data } = await api.get('/payers')
    if (Array.isArray(data)) {
      state.payers = data
    } else if (data?.content && Array.isArray(data.content)) {
      state.payers = data.content
    }
  } catch { /* keep local data */ } finally {
    state.loading = false
  }
}

function getAll(): Payer[] {
  return state.payers
}

function getById(id: number): Payer | undefined {
  return state.payers.find(p => p.id === id)
}

function getTotal(): number {
  return state.payers.length
}

function getActiveCount(): number {
  return state.payers.filter(p => p.systemStatus === 'active').length
}

function getSuspendedCount(): number {
  return state.payers.filter(p => p.systemStatus === 'suspended').length
}

function getDebtCount(): number {
  return state.payers.filter(p => p.settlementStatus === 'debt').length
}

function getTotalCharged(): number {
  return state.payers.reduce((sum, p) => sum + p.totalCharged, 0)
}

function getTotalPaid(): number {
  return state.payers.reduce((sum, p) => sum + p.totalPaid, 0)
}

function addComment(payerId: number, author: string, text: string): void {
  const payer = state.payers.find(p => p.id === payerId)
  if (payer) {
    payer.comments.push({
      id: nextCommentId++,
      date: new Date().toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      author,
      text,
    })
  }
  silentApi.post(`/payers/${payerId}/comments`, { author, text }).catch(() => {})
}

let nextDocId = 1

function addDocument(payerId: number, name: string, type: string, size: string): void {
  const payer = state.payers.find(p => p.id === payerId)
  if (payer) {
    payer.documents.push({
      id: nextDocId++,
      name,
      type,
      size,
      uploadedAt: new Date().toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    })
  }
  silentApi.post(`/payers/${payerId}/documents`, { name, type, size }).catch(() => {})
}

export function formatMoney(value: number): string {
  return value.toLocaleString('ru-RU')
}

export const payerStore = {
  state,
  fetchAll,
  getAll,
  getById,
  getTotal,
  getActiveCount,
  getSuspendedCount,
  getDebtCount,
  getTotalCharged,
  getTotalPaid,
  addComment,
  addDocument,
}
