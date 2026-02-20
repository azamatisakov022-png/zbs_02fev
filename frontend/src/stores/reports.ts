import { reactive } from 'vue'
import api, { silentApi } from '../api/client'

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

export type ReportStatus = 'Черновик' | 'На проверке' | 'Принят' | 'Отклонён' | 'На доработке'

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
  status: ReportStatus
  rejectionReason?: string
  reviewDate?: string
  reviewer?: string
  history: ReportHistoryEntry[]
}

let nextId = 100000

const state = reactive<{ reports: Report[]; loading: boolean }>({
  loading: false,
  reports: [],
})

const backendStatusMap: Record<string, ReportStatus> = {
  draft: 'Черновик',
  submitted: 'На проверке',
  approved: 'Принят',
  rejected: 'Отклонён',
  revision_requested: 'На доработке',
}

function mapBackendReport(r: any): Report {
  const items: ProcessingItem[] = (r.items || []).map((it: any, idx: number) => ({
    id: it.id || idx + 1,
    wasteType: it.wasteGroup || '',
    wasteCode: it.wasteCode || '',
    declared: it.volumeReceived != null ? String(it.volumeReceived) : '',
    processed: it.volumeProcessed != null ? String(it.volumeProcessed) : '',
    recycler: '',
    contractNumber: '',
    contractDate: '',
  }))
  const totalDeclared = items.reduce((s, i) => s + (parseFloat(i.declared) || 0), 0)
  const totalProcessed = items.reduce((s, i) => s + (parseFloat(i.processed) || 0), 0)
  return {
    id: r.id,
    number: r.number || '',
    date: r.createdAt ? new Date(r.createdAt).toLocaleDateString('ru-RU') : '',
    company: r.recyclerName || '',
    inn: r.submitterInn || '',
    year: r.period || '',
    items,
    files: [],
    totalDeclared,
    totalProcessed,
    processingPercent: totalDeclared > 0 ? Math.round((totalProcessed / totalDeclared) * 100) : 0,
    status: backendStatusMap[r.status] || r.status || 'Черновик',
    history: [],
  }
}

async function fetchAll() {
  state.loading = true
  try {
    const { data } = await api.get('/reports')
    let backendReports: any[] = []
    if (Array.isArray(data)) {
      backendReports = data
    } else if (data?.data && Array.isArray(data.data)) {
      backendReports = data.data
    } else if (data?.content && Array.isArray(data.content)) {
      backendReports = data.content
    }
    if (backendReports.length > 0) {
      const mapped = backendReports.map(mapBackendReport)
      // Merge: keep local reports (high IDs) that aren't on backend
      const backendIds = new Set(mapped.map(r => r.id))
      const localOnly = state.reports.filter(r => r.id >= 100000 && !backendIds.has(r.id))
      state.reports = [...mapped, ...localOnly]
    }
  } catch { /* keep local data */ } finally {
    state.loading = false
  }
}

function addReport(data: {
  company: string
  inn: string
  year: string
  items: ProcessingItem[]
  files: UploadedFile[]
  totalDeclared: number
  totalProcessed: number
  processingPercent: number
}, status: ReportStatus = 'Черновик'): Report {
  const now = new Date()
  const num = String(Math.floor(Math.random() * 900) + 100)
  const report: Report = {
    id: nextId++,
    number: `РП-${now.getFullYear()}-${num}`,
    date: now.toLocaleDateString('ru-RU'),
    company: data.company,
    inn: data.inn,
    year: data.year,
    items: data.items,
    files: data.files,
    totalDeclared: data.totalDeclared,
    totalProcessed: data.totalProcessed,
    processingPercent: data.processingPercent,
    status,
    history: [{ id: Date.now(), action: 'Отчёт создан', date: now.toLocaleDateString('ru-RU'), user: data.company }],
  }
  state.reports.unshift(report)
  silentApi.post('/reports', data).then(resp => {
    if (resp.data?.id) {
      report.id = resp.data.id
      report.number = resp.data.number || report.number
      // If submitting immediately, trigger submit on backend
      if (status === 'На проверке') {
        silentApi.post(`/reports/${resp.data.id}/submit`).catch(() => {})
      }
    }
  }).catch(() => {})
  return report
}

function submitForReview(id: number) {
  const report = state.reports.find(r => r.id === id)
  if (report && (report.status === 'Черновик' || report.status === 'Отклонён')) {
    report.status = 'На проверке'
    report.rejectionReason = undefined
  }
  silentApi.post(`/reports/${id}/submit`).catch(() => {})
}

function approveReport(id: number, comment?: string) {
  const report = state.reports.find(r => r.id === id)
  if (report && report.status === 'На проверке') {
    const now = new Date()
    report.status = 'Принят'
    report.reviewDate = now.toLocaleDateString('ru-RU')
    report.reviewer = 'Асанов Б.Т.'
    report.history.push({
      id: Date.now(),
      action: 'Отчёт принят',
      date: `${now.toLocaleDateString('ru-RU')} ${now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`,
      user: 'Асанов Б.Т.',
      comment,
    })
  }
  silentApi.post(`/reports/${id}/approve`, { comment }).catch(() => {})
}

function rejectReport(id: number, reason: string) {
  const report = state.reports.find(r => r.id === id)
  if (report && report.status === 'На проверке') {
    const now = new Date()
    report.status = 'Отклонён'
    report.rejectionReason = reason
    report.reviewDate = now.toLocaleDateString('ru-RU')
    report.reviewer = 'Асанов Б.Т.'
    report.history.push({
      id: Date.now(),
      action: 'Отчёт отклонён',
      date: `${now.toLocaleDateString('ru-RU')} ${now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`,
      user: 'Асанов Б.Т.',
      comment: reason,
    })
  }
  silentApi.post(`/reports/${id}/reject`, { reason }).catch(() => {})
}

function returnReportForRevision(id: number, comment: string) {
  const report = state.reports.find(r => r.id === id)
  if (report && report.status === 'На проверке') {
    const now = new Date()
    report.status = 'На доработке'
    report.rejectionReason = comment
    report.reviewDate = now.toLocaleDateString('ru-RU')
    report.reviewer = 'Асанов Б.Т.'
    report.history.push({
      id: Date.now(),
      action: 'Возвращён на доработку',
      date: `${now.toLocaleDateString('ru-RU')} ${now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`,
      user: 'Асанов Б.Т.',
      comment,
    })
  }
  silentApi.post(`/reports/${id}/return`, { comment }).catch(() => {})
}

function getBusinessReports(company: string) {
  return state.reports.filter(r => r.company === company)
}

function getPendingCount() {
  return state.reports.filter(r => r.status === 'На проверке').length
}

export const reportStore = {
  state,
  fetchAll,
  addReport,
  submitForReview,
  approveReport,
  rejectReport,
  returnReportForRevision,
  getBusinessReports,
  getPendingCount,
}
