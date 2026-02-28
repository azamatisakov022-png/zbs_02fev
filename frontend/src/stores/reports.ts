import { reactive } from 'vue'
import api, { silentApi } from '../api/client'
import { ReportStatus, type ReportStatusType } from '../constants/statuses'
import i18n from '../i18n'

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

export type { ReportStatusType }

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

let nextId = 100000

const state = reactive<{ reports: Report[]; loading: boolean }>({
  loading: false,
  reports: [],
})

const backendStatusMap: Record<string, ReportStatusType> = {
  draft: ReportStatus.DRAFT,
  submitted: ReportStatus.UNDER_REVIEW,
  approved: ReportStatus.APPROVED,
  rejected: ReportStatus.REJECTED,
  revision_requested: ReportStatus.REVISION,
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
    date: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '',
    company: r.recyclerName || '',
    inn: r.submitterInn || '',
    year: r.period || '',
    items,
    files: [],
    totalDeclared,
    totalProcessed,
    processingPercent: totalDeclared > 0 ? Math.round((totalProcessed / totalDeclared) * 100) : 0,
    status: backendStatusMap[r.status] || r.status || ReportStatus.DRAFT,
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
}, status: ReportStatusType = ReportStatus.DRAFT): Report {
  const now = new Date()
  const num = String(Math.floor(Math.random() * 900) + 100)
  const report: Report = {
    id: nextId++,
    number: `РП-${now.getFullYear()}-${num}`,
    date: now.toLocaleDateString(),
    company: data.company,
    inn: data.inn,
    year: data.year,
    items: data.items,
    files: data.files,
    totalDeclared: data.totalDeclared,
    totalProcessed: data.totalProcessed,
    processingPercent: data.processingPercent,
    status,
    history: [{ id: Date.now(), action: i18n.global.t('reportAction.created'), date: now.toLocaleDateString(), user: data.company }],
  }
  state.reports.unshift(report)
  silentApi.post('/reports', data).then(resp => {
    if (resp.data?.id) {
      report.id = resp.data.id
      report.number = resp.data.number || report.number
      // If submitting immediately, trigger submit on backend
      if (status === ReportStatus.UNDER_REVIEW) {
        silentApi.post(`/reports/${resp.data.id}/submit`).catch(() => {})
      }
    }
  }).catch(() => {})
  return report
}

function submitForReview(id: number) {
  const report = state.reports.find(r => r.id === id)
  if (report && (report.status === ReportStatus.DRAFT || report.status === ReportStatus.REJECTED)) {
    report.status = ReportStatus.UNDER_REVIEW
    report.rejectionReason = undefined
  }
  silentApi.post(`/reports/${id}/submit`).catch(() => {})
}

function approveReport(id: number, comment?: string) {
  const report = state.reports.find(r => r.id === id)
  if (report && report.status === ReportStatus.UNDER_REVIEW) {
    const now = new Date()
    report.status = ReportStatus.APPROVED
    report.reviewDate = now.toLocaleDateString()
    report.reviewer = 'Асанов Б.Т.'
    report.history.push({
      id: Date.now(),
      action: i18n.global.t('reportAction.approved'),
      date: `${now.toLocaleDateString()} ${now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`,
      user: 'Асанов Б.Т.',
      comment,
    })
  }
  silentApi.post(`/reports/${id}/approve`, { comment }).catch(() => {})
}

function rejectReport(id: number, reason: string) {
  const report = state.reports.find(r => r.id === id)
  if (report && report.status === ReportStatus.UNDER_REVIEW) {
    const now = new Date()
    report.status = ReportStatus.REJECTED
    report.rejectionReason = reason
    report.reviewDate = now.toLocaleDateString()
    report.reviewer = 'Асанов Б.Т.'
    report.history.push({
      id: Date.now(),
      action: i18n.global.t('reportAction.rejected'),
      date: `${now.toLocaleDateString()} ${now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`,
      user: 'Асанов Б.Т.',
      comment: reason,
    })
  }
  silentApi.post(`/reports/${id}/reject`, { reason }).catch(() => {})
}

function returnReportForRevision(id: number, comment: string) {
  const report = state.reports.find(r => r.id === id)
  if (report && report.status === ReportStatus.UNDER_REVIEW) {
    const now = new Date()
    report.status = ReportStatus.REVISION
    report.rejectionReason = comment
    report.reviewDate = now.toLocaleDateString()
    report.reviewer = 'Асанов Б.Т.'
    report.history.push({
      id: Date.now(),
      action: i18n.global.t('reportAction.returnedForRevision'),
      date: `${now.toLocaleDateString()} ${now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`,
      user: 'Асанов Б.Т.',
      comment,
    })
  }
  silentApi.post(`/reports/${id}/return`, { comment }).catch(() => {})
}

function getBusinessReports(_company?: string) {
  return state.reports
}

function getPendingCount() {
  return state.reports.filter(r => r.status === ReportStatus.UNDER_REVIEW).length
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
