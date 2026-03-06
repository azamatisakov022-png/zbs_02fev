import { defineStore } from 'pinia'
import api from '../api/client'
import { ReportStatus, type ReportStatusType } from '../constants/statuses'
import { toastStore } from './toast'
import i18n from '../i18n'
import type { Report, ProcessingItem, UploadedFile, ReportHistoryEntry } from '../types/report'

export type { ProcessingItem, UploadedFile, Report, ReportHistoryEntry, ReportStatusType }

let nextId = 100000

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
  const history: ReportHistoryEntry[] = (r.history || []).map((h: any, idx: number) => ({
    id: h.id || idx + 1,
    action: h.action || '',
    date: h.date || h.createdAt || '',
    user: h.user || h.userName || '',
    comment: h.comment,
  }))
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
    history,
  }
}

export const useReportStore = defineStore('reports', {
  state: () => ({
    reports: [] as Report[],
    loading: false,
  }),

  getters: {
    pendingCount(state): number {
      return state.reports.filter(r => r.status === ReportStatus.UNDER_REVIEW).length
    },
    businessReports(state): Report[] {
      return state.reports
    },
  },

  actions: {
    async fetchAll() {
      this.loading = true
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
          const backendIds = new Set(mapped.map(r => r.id))
          const localOnly = this.reports.filter(r => r.id >= 100000 && !backendIds.has(r.id))
          this.reports = [...mapped, ...localOnly]
        }
      } catch {
      } finally {
        this.loading = false
      }
    },

    async addReport(data: {
      company: string
      inn: string
      year: string
      items: ProcessingItem[]
      files: UploadedFile[]
      totalDeclared: number
      totalProcessed: number
      processingPercent: number
    }, status: ReportStatusType = ReportStatus.DRAFT): Promise<Report> {
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
      this.reports.unshift(report)

      try {
        const payload = {
          period: data.year,
          recyclerName: data.company,
          submitterInn: data.inn,
          items: data.items.map(item => ({
            wasteGroup: item.wasteType,
            wasteCode: item.wasteCode,
            volumeReceived: parseFloat(item.declared) || 0,
            volumeProcessed: parseFloat(item.processed) || 0,
          })),
        }
        const resp = await api.post('/reports', payload)
        const respData = resp.data?.data || resp.data
        if (respData?.id) {
          report.id = respData.id
          report.number = respData.number || report.number
          if (status === ReportStatus.UNDER_REVIEW) {
            await api.post(`/reports/${respData.id}/submit`)
          }
        }
        toastStore.show({ type: 'success', title: i18n.global.t('reportToast.createSuccess') })
      } catch {
        toastStore.show({ type: 'error', title: i18n.global.t('reportToast.createError') })
      }

      return report
    },

    async submitForReview(id: number) {
      const report = this.reports.find(r => r.id === id)
      if (report && (report.status === ReportStatus.DRAFT || report.status === ReportStatus.REJECTED)) {
        report.status = ReportStatus.UNDER_REVIEW
        report.rejectionReason = undefined
      }
      try {
        await api.post(`/reports/${id}/submit`)
        toastStore.show({ type: 'success', title: i18n.global.t('reportToast.submitSuccess') })
      } catch {
        toastStore.show({ type: 'error', title: i18n.global.t('reportToast.submitError') })
      }
    },

    async approveReport(id: number, comment?: string) {
      const report = this.reports.find(r => r.id === id)
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
      try {
        await api.post(`/reports/${id}/approve`, { comment })
        toastStore.show({ type: 'success', title: i18n.global.t('reportToast.approveSuccess') })
      } catch {
        toastStore.show({ type: 'error', title: i18n.global.t('reportToast.approveError') })
      }
    },

    async rejectReport(id: number, reason: string) {
      const report = this.reports.find(r => r.id === id)
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
      try {
        await api.post(`/reports/${id}/reject`, { reason })
        toastStore.show({ type: 'success', title: i18n.global.t('reportToast.rejectSuccess') })
      } catch {
        toastStore.show({ type: 'error', title: i18n.global.t('reportToast.rejectError') })
      }
    },

    async returnReportForRevision(id: number, comment: string) {
      const report = this.reports.find(r => r.id === id)
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
      try {
        await api.post(`/reports/${id}/return`, { comment })
        toastStore.show({ type: 'success', title: i18n.global.t('reportToast.returnSuccess') })
      } catch {
        toastStore.show({ type: 'error', title: i18n.global.t('reportToast.returnError') })
      }
    },
  },
})
