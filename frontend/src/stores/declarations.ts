import { reactive } from 'vue'
import api, { silentApi } from '../api/client'
import { DeclStatus, type DeclStatusType } from '../constants/statuses'
import i18n from '../i18n'

export type DeclarationStatus = DeclStatusType

export interface DeclarationCalcItem {
  number: string
  period: string
  categories: string
  mass: number
  amount: number
  calcStatus: string
  acceptedDate: string
}

export interface DeclarationReportItem {
  number: string
  period: string
  categories: string
  processed: number
  credited: number
  reportStatus: string
  acceptedDate: string
}

export interface DeclarationPayment {
  date: string
  number: string
  amount: number
  method: string
  paymentStatus: string
}

export interface DeclarationDocument {
  id: number
  name: string
  size: string
  source: string
}

export interface HistoryEntry {
  id: number
  action: string
  date: string
  user: string
  comment?: string
}

export interface Declaration {
  id: number
  number: string
  submittedAt: string
  submittedBy: string
  company: string
  opf: string
  inn: string
  address: string
  contactPerson: string
  phone: string
  email: string
  reportingYear: string

  calculationCount: number
  totalCharged: number
  totalPaid: number
  balance: number

  calculations: DeclarationCalcItem[]
  reports: DeclarationReportItem[]
  payments: DeclarationPayment[]
  documents: DeclarationDocument[]

  status: DeclarationStatus
  reviewComment?: string
  reviewDate?: string
  reviewer?: string
  history: HistoryEntry[]
}

let nextHistoryId = 1

const state = reactive<{ declarations: Declaration[]; loading: boolean }>({
  loading: false,
  declarations: [],
})

async function fetchAll() {
  state.loading = true
  try {
    const { data } = await api.get('/declarations')
    if (Array.isArray(data)) {
      state.declarations = data
    } else if (data?.content && Array.isArray(data.content)) {
      state.declarations = data.content
    }
  } catch { /* keep local data */ } finally {
    state.loading = false
  }
}

function getById(id: number): Declaration | undefined {
  return state.declarations.find(d => d.id === id)
}

function approveDeclaration(id: number, comment?: string) {
  const decl = state.declarations.find(d => d.id === id)
  if (!decl || (decl.status !== DeclStatus.UNDER_REVIEW)) return
  const now = new Date()
  decl.status = DeclStatus.APPROVED
  decl.reviewComment = comment || undefined
  decl.reviewDate = now.toLocaleDateString()
  decl.reviewer = 'Асанов Б.Т.'
  decl.history.push({
    id: nextHistoryId++,
    action: i18n.global.t('declarationAction.approved'),
    date: `${now.toLocaleDateString()} ${now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`,
    user: 'Асанов Б.Т.',
    comment: comment || undefined,
  })
  silentApi.post(`/declarations/${id}/approve`, { comment }).catch(() => {})
}

function rejectDeclaration(id: number, reason: string) {
  const decl = state.declarations.find(d => d.id === id)
  if (!decl || (decl.status !== DeclStatus.UNDER_REVIEW)) return
  const now = new Date()
  decl.status = DeclStatus.REJECTED
  decl.reviewComment = reason
  decl.reviewDate = now.toLocaleDateString()
  decl.reviewer = 'Асанов Б.Т.'
  decl.history.push({
    id: nextHistoryId++,
    action: i18n.global.t('declarationAction.rejected'),
    date: `${now.toLocaleDateString()} ${now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`,
    user: 'Асанов Б.Т.',
    comment: reason,
  })
  silentApi.post(`/declarations/${id}/reject`, { reason }).catch(() => {})
}

function returnForRevision(id: number, comment: string) {
  const decl = state.declarations.find(d => d.id === id)
  if (!decl || (decl.status !== DeclStatus.UNDER_REVIEW)) return
  const now = new Date()
  decl.status = DeclStatus.REVISION
  decl.reviewComment = comment
  decl.reviewDate = now.toLocaleDateString()
  decl.reviewer = 'Асанов Б.Т.'
  decl.history.push({
    id: nextHistoryId++,
    action: i18n.global.t('declarationAction.returnedForRevision'),
    date: `${now.toLocaleDateString()} ${now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`,
    user: 'Асанов Б.Т.',
    comment,
  })
  silentApi.post(`/declarations/${id}/return`, { comment }).catch(() => {})
}

function resubmitDeclaration(id: number) {
  const decl = state.declarations.find(d => d.id === id)
  if (!decl || (decl.status !== DeclStatus.REVISION && decl.status !== DeclStatus.REJECTED)) return
  const now = new Date()
  decl.status = DeclStatus.UNDER_REVIEW
  decl.reviewComment = undefined
  decl.reviewDate = undefined
  decl.reviewer = undefined
  decl.history.push({
    id: nextHistoryId++,
    action: i18n.global.t('declarationAction.resubmitted'),
    date: `${now.toLocaleDateString()} ${now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`,
    user: decl.submittedBy,
  })
  silentApi.post(`/declarations/${id}/resubmit`).catch(() => {})
}

let nextId = 1

function addDeclaration(data: {
  company: string
  opf: string
  inn: string
  address: string
  contactPerson: string
  phone: string
  email: string
  reportingYear: string
  calculationCount: number
  totalCharged: number
  totalPaid: number
  balance: number
  calculations: DeclarationCalcItem[]
  reports: DeclarationReportItem[]
  payments: DeclarationPayment[]
  documents: DeclarationDocument[]
}, status: DeclarationStatus = DeclStatus.UNDER_REVIEW): Declaration {
  const now = new Date()
  const num = String(state.declarations.length + 1).padStart(4, '0')
  const decl: Declaration = {
    id: nextId++,
    number: `ДЕК-${now.getFullYear()}-${num}`,
    submittedAt: now.toLocaleDateString(),
    submittedBy: data.contactPerson || data.company,
    ...data,
    status,
    history: [{
      id: nextHistoryId++,
      action: status === DeclStatus.DRAFT ? 'Черновик создан' : 'Декларация подана',
      date: `${now.toLocaleDateString()} ${now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`,
      user: data.contactPerson || data.company,
    }],
  }
  state.declarations.unshift(decl)
  silentApi.post('/declarations', data).catch(() => {})
  return decl
}

function submitDraft(id: number) {
  const decl = state.declarations.find(d => d.id === id)
  if (!decl || decl.status !== DeclStatus.DRAFT) return
  const now = new Date()
  decl.status = DeclStatus.UNDER_REVIEW
  decl.submittedAt = now.toLocaleDateString()
  decl.history.push({
    id: nextHistoryId++,
    action: 'Декларация подана',
    date: `${now.toLocaleDateString()} ${now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`,
    user: decl.submittedBy,
  })
  silentApi.post(`/declarations/${id}/submit`).catch(() => {})
}

function getPendingCount() {
  return state.declarations.filter(d => d.status === DeclStatus.UNDER_REVIEW).length
}

function getByCompany(company: string) {
  return state.declarations.filter(d => d.company === company)
}

export const declarationStore = {
  state,
  fetchAll,
  getById,
  addDeclaration,
  submitDraft,
  approveDeclaration,
  rejectDeclaration,
  returnForRevision,
  resubmitDeclaration,
  getPendingCount,
  getByCompany,
}
