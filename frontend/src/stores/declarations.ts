import { reactive } from 'vue'
import api, { silentApi } from '../api/client'

export type DeclarationStatus = 'Черновик' | 'На рассмотрении' | 'Одобрена' | 'Отклонена' | 'На доработке'

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
  if (!decl || (decl.status !== 'На рассмотрении')) return
  const now = new Date()
  decl.status = 'Одобрена'
  decl.reviewComment = comment || undefined
  decl.reviewDate = now.toLocaleDateString('ru-RU')
  decl.reviewer = 'Асанов Б.Т.'
  decl.history.push({
    id: nextHistoryId++,
    action: 'Декларация одобрена',
    date: `${now.toLocaleDateString('ru-RU')} ${now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`,
    user: 'Асанов Б.Т.',
    comment: comment || undefined,
  })
  silentApi.post(`/declarations/${id}/approve`, { comment }).catch(() => {})
}

function rejectDeclaration(id: number, reason: string) {
  const decl = state.declarations.find(d => d.id === id)
  if (!decl || (decl.status !== 'На рассмотрении')) return
  const now = new Date()
  decl.status = 'Отклонена'
  decl.reviewComment = reason
  decl.reviewDate = now.toLocaleDateString('ru-RU')
  decl.reviewer = 'Асанов Б.Т.'
  decl.history.push({
    id: nextHistoryId++,
    action: 'Декларация отклонена',
    date: `${now.toLocaleDateString('ru-RU')} ${now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`,
    user: 'Асанов Б.Т.',
    comment: reason,
  })
  silentApi.post(`/declarations/${id}/reject`, { reason }).catch(() => {})
}

function returnForRevision(id: number, comment: string) {
  const decl = state.declarations.find(d => d.id === id)
  if (!decl || (decl.status !== 'На рассмотрении')) return
  const now = new Date()
  decl.status = 'На доработке'
  decl.reviewComment = comment
  decl.reviewDate = now.toLocaleDateString('ru-RU')
  decl.reviewer = 'Асанов Б.Т.'
  decl.history.push({
    id: nextHistoryId++,
    action: 'Возвращена на доработку',
    date: `${now.toLocaleDateString('ru-RU')} ${now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`,
    user: 'Асанов Б.Т.',
    comment,
  })
  silentApi.post(`/declarations/${id}/return`, { comment }).catch(() => {})
}

function resubmitDeclaration(id: number) {
  const decl = state.declarations.find(d => d.id === id)
  if (!decl || (decl.status !== 'На доработке' && decl.status !== 'Отклонена')) return
  const now = new Date()
  decl.status = 'На рассмотрении'
  decl.reviewComment = undefined
  decl.reviewDate = undefined
  decl.reviewer = undefined
  decl.history.push({
    id: nextHistoryId++,
    action: 'Декларация повторно подана',
    date: `${now.toLocaleDateString('ru-RU')} ${now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`,
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
}, status: DeclarationStatus = 'На рассмотрении'): Declaration {
  const now = new Date()
  const num = String(state.declarations.length + 1).padStart(4, '0')
  const decl: Declaration = {
    id: nextId++,
    number: `ДЕК-${now.getFullYear()}-${num}`,
    submittedAt: now.toLocaleDateString('ru-RU'),
    submittedBy: data.contactPerson || data.company,
    ...data,
    status,
    history: [{
      id: nextHistoryId++,
      action: status === 'Черновик' ? 'Черновик создан' : 'Декларация подана',
      date: `${now.toLocaleDateString('ru-RU')} ${now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`,
      user: data.contactPerson || data.company,
    }],
  }
  state.declarations.unshift(decl)
  silentApi.post('/declarations', data).catch(() => {})
  return decl
}

function submitDraft(id: number) {
  const decl = state.declarations.find(d => d.id === id)
  if (!decl || decl.status !== 'Черновик') return
  const now = new Date()
  decl.status = 'На рассмотрении'
  decl.submittedAt = now.toLocaleDateString('ru-RU')
  decl.history.push({
    id: nextHistoryId++,
    action: 'Декларация подана',
    date: `${now.toLocaleDateString('ru-RU')} ${now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`,
    user: decl.submittedBy,
  })
  silentApi.post(`/declarations/${id}/submit`).catch(() => {})
}

function getPendingCount() {
  return state.declarations.filter(d => d.status === 'На рассмотрении').length
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
