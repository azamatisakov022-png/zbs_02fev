import { defineStore } from 'pinia'
import api, { silentApi } from '../api/client'
import { calculatePaymentDeadline, formatDateShort } from '../utils/dateUtils'
import { calculatePenalty, getOverdueDays } from '../utils/penalty'
import { CalcStatus, type CalcStatusType } from '../constants/statuses'
import i18n from '../i18n'
import { notificationStore } from './notifications'
import type {
  Calculation,
  CalculationStatus,
  ProductItem,
  AttachedDocument,
  DocumentType,
  PaymentData,
  AuditEntry,
} from '@/types/calculation'

let nextId = 1

const backendStatusToFrontend: Record<string, CalcStatusType> = {
  draft: CalcStatus.DRAFT,
  submitted: CalcStatus.UNDER_REVIEW,
  under_review: CalcStatus.UNDER_REVIEW,
  approved: CalcStatus.APPROVED,
  rejected: CalcStatus.REJECTED,
  paid: CalcStatus.PAID,
  partially_paid: CalcStatus.PAYMENT_PENDING,
  in_review: CalcStatus.IN_REVIEW,
  revision: CalcStatus.REVISION,
  fee_paid: CalcStatus.FEE_PAID,
  penalty_paid: CalcStatus.PENALTY_PAID,
  completed: CalcStatus.COMPLETED,
}

function mapBackendItem(i: any): ProductItem {
  const weight = parseFloat(i.weight) || parseFloat(i.quantity) || 0
  const norm = parseFloat(i.recyclingNorm) || 0
  const rate = parseFloat(i.rate) || 0
  const volToRecycle = weight * norm / 100
  return {
    id: i.id,
    group: i.productGroup || '',
    subgroup: i.productSubgroup || '',
    gskpCode: i.gskpCode || '',
    tnvedCode: i.tnvedCode || '',
    volume: String(weight),
    recyclingStandard: norm,
    volumeToRecycle: volToRecycle,
    transferredToRecycling: '0',
    exportedFromKR: '',
    taxableVolume: volToRecycle,
    rate: rate,
    amount: parseFloat(i.amount) || 0,
  }
}

function mapBackendCalc(c: any): Calculation {
  const status = backendStatusToFrontend[c.status] || CalcStatus.DRAFT
  return {
    id: c.id,
    number: c.number || '',
    date: c.createdAt ? new Date(c.createdAt).toLocaleDateString('ru-RU') : '',
    company: c.companyName || '',
    inn: c.companyInn || '',
    period: c.quarter ? `Q${c.quarter} ${c.period || ''}` : c.period || '',
    quarter: c.quarter ? `Q${c.quarter}` : 'Q1',
    year: c.period || '',
    items: (c.items || []).map(mapBackendItem),
    totalAmount: parseFloat(c.totalAmount) || 0,
    status,
    rejectionReason: status === CalcStatus.REJECTED ? c.reviewComment : undefined,
    rejectedBy: status === CalcStatus.REJECTED ? c.reviewedBy : undefined,
    rejectedAt: status === CalcStatus.REJECTED && c.reviewedAt
      ? new Date(c.reviewedAt).toLocaleDateString('ru-RU')
      : undefined,
    documents: (c.documents || []).map((d: any) => ({
      id: d.id,
      fileName: d.name || d.fileName || '',
      fileSize: d.size || d.fileSize || 0,
      fileType: d.type || d.fileType || '',
      docType: (d.docType || 'other') as DocumentType,
      dataUrl: '',
    })),
  }
}

export const useCalculationStore = defineStore('calculations', {
  state: () => ({
    loading: false,
    calculations: [] as Calculation[],
    myCalculations: [] as Calculation[],
    currentCalculation: null as Calculation | null,
  }),

  getters: {
    pendingCount(): number {
      return this.calculations.filter(c => c.status === CalcStatus.UNDER_REVIEW || c.status === CalcStatus.PAYMENT_PENDING).length
    },

    paymentPendingCount(): number {
      return this.calculations.filter(c => c.status === CalcStatus.PAYMENT_PENDING).length
    },

    calcReviewCount(): number {
      return this.calculations.filter(c => c.status === CalcStatus.UNDER_REVIEW).length
    },

    submittedCount(): number {
      return this.calculations.filter(c => c.status === CalcStatus.UNDER_REVIEW || c.status === CalcStatus.SUBMITTED).length
    },

    inReviewCount(): number {
      return this.calculations.filter(c => c.status === CalcStatus.IN_REVIEW).length
    },

    awaitingPaymentConfirmCount(): number {
      return this.calculations.filter(c =>
        c.status === CalcStatus.APPROVED ||
        c.status === CalcStatus.FEE_PAID ||
        (c.feePayment && c.status !== CalcStatus.COMPLETED && c.status !== CalcStatus.PAID)
      ).length
    },
  },

  actions: {
    async fetchAll() {
      this.loading = true
      try {
        const { data } = await api.get('/calculations')
        let backendCalcs: any[] = []
        if (Array.isArray(data)) {
          backendCalcs = data
        } else if (data?.data && Array.isArray(data.data)) {
          backendCalcs = data.data
        } else if (data?.content && Array.isArray(data.content)) {
          backendCalcs = data.content
        }
        this.calculations = backendCalcs.map(mapBackendCalc)
      } catch { /* keep empty on error */ } finally {
        this.loading = false
      }
    },
    async fetchMyCalc() {
      try {
        const { data } = await api.get('/calculations/my')
        let backendCalcs: any[] = []
        if (Array.isArray(data)) {
          backendCalcs = data
        } else if (data?.data && Array.isArray(data.data)) {
          backendCalcs = data.data
        } else if (data?.content && Array.isArray(data.content)) {
          backendCalcs = data.content
        }
        this.myCalculations = backendCalcs.map(mapBackendCalc)
      } catch (err) {
        console.log('error', err)
      }
    },

    async fetchById(id: number) {
      this.loading = true
      try {
        const { data } = await api.get(`/calculations/${id}`)
        this.currentCalculation = mapBackendCalc(data)
        return this.currentCalculation
      } catch (err) {
        console.log('error', err)
        this.currentCalculation = null
        return null
      } finally {
        this.loading = false
      }
    },

    addCalculation(data: {
      number: string
      date: string
      company: string
      inn: string
      quarter: string
      year: string
      payerType?: 'producer' | 'importer'
      importDate?: string
      address?: string
      items: ProductItem[]
      totalAmount: number
    }, status: CalculationStatus = CalcStatus.DRAFT): Calculation {
      const pt = data.payerType || 'producer'
      const deadline = calculatePaymentDeadline(pt, {
        quarter: data.quarter,
        year: data.year,
        importDate: data.importDate,
      })
      const calc: Calculation = {
        id: nextId++,
        number: data.number,
        date: data.date,
        company: data.company,
        inn: data.inn,
        address: data.address,
        period: pt === 'importer' && data.importDate
          ? `Ввоз: ${new Date(data.importDate).toLocaleDateString('ru-RU')}`
          : `${data.quarter} ${data.year}`,
        quarter: data.quarter,
        year: data.year,
        payerType: pt,
        importDate: data.importDate,
        dueDate: deadline ? formatDateShort(deadline) : undefined,
        items: data.items,
        totalAmount: data.totalAmount,
        status,
      }
      this.calculations.unshift(calc)

      const backendRequest = {
        period: data.year,
        quarter: data.quarter.replace('Q', ''),
        documentType: 'INVOICE',
        documentNumber: data.number,
        documentDate: new Date().toISOString().split('T')[0],
        items: data.items.filter(i => i.group && parseFloat(i.volume) > 0).map(i => ({
          productGroup: i.group,
          productSubgroup: i.subgroup || undefined,
          tnvedCode: i.tnvedCode || undefined,
          gskpCode: i.gskpCode || undefined,
          productName: i.subgroup || i.group,
          quantity: parseFloat(i.volume) || 1,
          unit: 'TON',
          weight: parseFloat(i.volume) || 1,
          rate: i.rate,
          recyclingNorm: i.recyclingStandard,
        })),
      }

      silentApi.post('/calculations', backendRequest).then(resp => {
        if (resp.data?.id) {
          calc.id = resp.data.id
          calc.number = resp.data.number || calc.number
          if (status === CalcStatus.UNDER_REVIEW) {
            silentApi.post(`/calculations/${resp.data.id}/submit`).catch(() => {})
          }
        }
      }).catch(() => {})

      return calc
    },

    submitForReview(id: number) {
      const calc = this.calculations.find(c => c.id === id)
      if (calc && (calc.status === CalcStatus.DRAFT || calc.status === CalcStatus.REJECTED || calc.status === CalcStatus.REVISION)) {
        const isResubmit = calc.status === CalcStatus.REJECTED || calc.status === CalcStatus.REVISION
        calc.status = CalcStatus.UNDER_REVIEW
        calc.rejectionReason = undefined
        calc.revisionComment = undefined
        if (isResubmit) {
          this.addAuditEntry(id, { action: 'resubmitted', userId: 'payer-1', userName: calc.company, userRole: 'payer' })
        } else {
          this.addAuditEntry(id, { action: 'submitted', userId: 'payer-1', userName: calc.company, userRole: 'payer' })
        }
        const t = i18n.global.t as any
        notificationStore.add({
          type: 'info',
          title: t('notif.newCalcForReviewTitle'),
          message: t('notif.newCalcForReviewMessage', { number: calc.number, company: calc.company }),
          role: 'eco-operator',
          link: `/eco-operator/calculations/${calc.id}`,
        })
      }
      silentApi.post(`/calculations/${id}/submit`).catch(() => {})
    },

    approveCalculation(id: number) {
      const calc = this.calculations.find(c => c.id === id)
      if (calc && (calc.status === CalcStatus.UNDER_REVIEW || calc.status === CalcStatus.IN_REVIEW)) {
        calc.status = CalcStatus.APPROVED
        calc.approvedAt = new Date().toLocaleDateString('ru-RU')
        this.addAuditEntry(id, {
          action: 'approved',
          userId: 'operator-1',
          userName: 'Оператор',
          userRole: 'operator',
        })
        const t = i18n.global.t as any
        notificationStore.add({
          type: 'success',
          title: t('notif.calcApprovedTitle'),
          message: t('notif.calcApprovedMessage', { number: calc.number, amount: calc.totalAmount.toLocaleString() }),
          role: 'business',
          link: `/business/calculations/${calc.id}/payment`,
        })
      }
      silentApi.post(`/calculations/${id}/approve`).catch(() => {})
    },

    rejectCalculation(id: number, reason: string, rejectedBy?: string) {
      const calc = this.calculations.find(c => c.id === id)
      if (calc && (calc.status === CalcStatus.UNDER_REVIEW || calc.status === CalcStatus.IN_REVIEW)) {
        calc.status = CalcStatus.REJECTED
        calc.rejectionReason = reason
        calc.rejectedAt = new Date().toLocaleDateString('ru-RU')
        calc.rejectedBy = rejectedBy
        this.addAuditEntry(id, { action: 'rejected', userId: 'operator-1', userName: 'Оператор', userRole: 'operator', comment: reason })
        const t = i18n.global.t as any
        notificationStore.add({
          type: 'error',
          title: t('notif.calcRejectedTitle'),
          message: t('notif.calcRejectedMessage', { number: calc.number, reason }),
          role: 'business',
          link: `/business/calculations/${calc.id}`,
        })
      }
      silentApi.post(`/calculations/${id}/reject`, { reason, rejectedBy }).catch(() => {})
    },

    submitPayment(id: number, payment: PaymentData) {
      const calc = this.calculations.find(c => c.id === id)
      if (calc && (calc.status === CalcStatus.APPROVED || calc.status === CalcStatus.PAYMENT_REJECTED)) {
        calc.payment = payment
        calc.status = CalcStatus.PAYMENT_PENDING
        calc.paymentRejectionReason = undefined
      }
      silentApi.post(`/calculations/${id}/payment`, payment).catch(() => {})
    },

    approvePayment(id: number) {
      const calc = this.calculations.find(c => c.id === id)
      if (calc && calc.status === CalcStatus.PAYMENT_PENDING) {
        calc.status = CalcStatus.PAID
        calc.paidAt = new Date().toLocaleDateString('ru-RU')
      }
      silentApi.post(`/calculations/${id}/payment/approve`).catch(() => {})
    },

    rejectPayment(id: number, reason: string) {
      const calc = this.calculations.find(c => c.id === id)
      if (calc && calc.status === CalcStatus.PAYMENT_PENDING) {
        calc.status = CalcStatus.PAYMENT_REJECTED
        calc.paymentRejectionReason = reason
      }
      silentApi.post(`/calculations/${id}/payment/reject`, { reason }).catch(() => {})
    },

    markAsPaid(id: number) {
      const calc = this.calculations.find(c => c.id === id)
      if (calc && calc.status === CalcStatus.APPROVED) {
        calc.status = CalcStatus.PAID
        calc.paidAt = new Date().toLocaleDateString('ru-RU')
      }
      silentApi.post(`/calculations/${id}/mark-paid`).catch(() => {})
    },

    resubmitCalculation(id: number) {
      const calc = this.calculations.find(c => c.id === id)
      if (calc && (calc.status === CalcStatus.REJECTED || calc.status === CalcStatus.REVISION)) {
        calc.status = CalcStatus.UNDER_REVIEW
        calc.rejectionReason = undefined
        calc.revisionComment = undefined
        this.addAuditEntry(id, {
          action: 'resubmitted',
          userId: 'payer-1',
          userName: calc.company,
          userRole: 'payer',
        })
      }
      silentApi.post(`/calculations/${id}/resubmit`).catch(() => {})
    },

    updateCalculationItems(id: number, items: ProductItem[], totalAmount: number) {
      const calc = this.calculations.find(c => c.id === id)
      if (calc && (calc.status === CalcStatus.DRAFT || calc.status === CalcStatus.REJECTED)) {
        calc.items = items
        calc.totalAmount = totalAmount
      }
      silentApi.put(`/calculations/${id}/items`, { items, totalAmount }).catch(() => {})
    },

    updateCalculationDocuments(id: number, documents: AttachedDocument[]) {
      const calc = this.calculations.find(c => c.id === id)
      if (calc) {
        calc.documents = documents
      }
      silentApi.put(`/calculations/${id}/documents`, { documents }).catch(() => {})
    },

    copyCalculation(sourceId: number): Calculation | undefined {
      const src = this.calculations.find(c => c.id === sourceId)
      if (!src) return undefined
      const newId = nextId++
      const now = new Date()
      const dateStr = now.toLocaleDateString('ru-RU')
      const numStr = `РСЧ-${now.getFullYear()}-${String(newId).padStart(3, '0')}`
      const copy: Calculation = {
        id: newId,
        number: numStr,
        date: dateStr,
        company: src.company,
        inn: src.inn,
        address: src.address,
        period: src.period,
        quarter: src.quarter,
        year: src.year,
        payerType: src.payerType,
        importDate: src.importDate,
        dueDate: src.dueDate,
        items: src.items.map(i => ({ ...i })),
        totalAmount: src.totalAmount,
        status: CalcStatus.DRAFT,
        parentId: sourceId,
        attachedFiles: src.attachedFiles ? [...src.attachedFiles] : undefined,
      }
      this.calculations.unshift(copy)
      return copy
    },

    getCalculationById(id: number): Calculation | undefined {
      return this.calculations.find(c => c.id === id)
    },

    getBusinessCalculations(company: string): Calculation[] {
      return this.calculations.filter(c => c.company === company)
    },

    addAuditEntry(id: number, entry: Omit<AuditEntry, 'id' | 'timestamp'>) {
      const calc = this.calculations.find(c => c.id === id)
      if (!calc) return
      if (!calc.history) calc.history = []
      calc.history.push({
        id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date().toISOString(),
        ...entry,
      })
    },

    assignToMe(id: number, userId: string, userName: string) {
      const calc = this.calculations.find(c => c.id === id)
      if (calc && (calc.status === CalcStatus.UNDER_REVIEW || calc.status === CalcStatus.SUBMITTED)) {
        calc.status = CalcStatus.IN_REVIEW
        calc.assignedTo = userId
        calc.assignedName = userName
        this.addAuditEntry(id, { action: 'assigned', userId, userName, userRole: 'operator' })
      }
      silentApi.post(`/calculations/${id}/assign`).catch(() => {})
    },

    unassign(id: number) {
      const calc = this.calculations.find(c => c.id === id)
      if (calc && calc.status === CalcStatus.IN_REVIEW) {
        calc.status = CalcStatus.UNDER_REVIEW
        this.addAuditEntry(id, { action: 'unassigned', userId: calc.assignedTo || '', userName: calc.assignedName || '', userRole: 'operator' })
        calc.assignedTo = undefined
        calc.assignedName = undefined
      }
      silentApi.post(`/calculations/${id}/unassign`).catch(() => {})
    },

    sendToRevision(id: number, comment: string) {
      const calc = this.calculations.find(c => c.id === id)
      if (calc && calc.status === CalcStatus.IN_REVIEW) {
        calc.status = CalcStatus.REVISION
        calc.revisionComment = comment
        this.addAuditEntry(id, { action: 'revision', userId: calc.assignedTo || 'operator-1', userName: calc.assignedName || 'Оператор', userRole: 'operator', comment })
        const t = i18n.global.t as any
        notificationStore.add({
          type: 'warning',
          title: t('notif.calcRevisionTitle'),
          message: t('notif.calcRevisionMessage', { number: calc.number, comment }),
          role: 'business',
          link: `/business/calculations/${calc.id}`,
        })
      }
      silentApi.post(`/calculations/${id}/revision`, { comment }).catch(() => {})
    },

    uploadFeeReceipt(id: number, data: PaymentData) {
      const calc = this.calculations.find(c => c.id === id)
      if (calc) {
        calc.feePayment = data
        this.addAuditEntry(id, { action: 'fee_payment_uploaded', userId: 'payer-1', userName: calc.company, userRole: 'payer' })
        const t = i18n.global.t as any
        notificationStore.add({
          type: 'info',
          title: t('notif.feeReceiptUploadedTitle'),
          message: t('notif.feeReceiptUploadedMessage', { number: calc.number, company: calc.company }),
          role: 'eco-operator',
          link: `/eco-operator/calculations/${calc.id}`,
        })
      }
      silentApi.post(`/calculations/${id}/fee-receipt`, data).catch(() => {})
    },

    confirmFeePayment(id: number) {
      const calc = this.calculations.find(c => c.id === id)
      if (!calc) return
      calc.status = CalcStatus.FEE_PAID
      calc.feeConfirmedAt = new Date().toLocaleDateString('ru-RU')

      if (calc.dueDate) {
        const days = getOverdueDays(calc.dueDate)
        if (days > 0) {
          const p = calculatePenalty(calc.totalAmount, calc.dueDate)
          calc.penaltyFixedAmount = p.totalPenalty
          calc.penaltyFixedDays = p.overdueDays
          calc.penaltyFixedDate = new Date().toLocaleDateString('ru-RU')
        } else {
          calc.penaltyFixedAmount = 0
          calc.penaltyFixedDays = 0
          calc.penaltyFixedDate = null
        }
      } else {
        calc.penaltyFixedAmount = 0
        calc.penaltyFixedDays = 0
        calc.penaltyFixedDate = null
      }

      this.addAuditEntry(id, { action: 'fee_payment_confirmed', userId: 'operator-1', userName: 'Оператор', userRole: 'operator' })

      const t = i18n.global.t as any

      if (!calc.penaltyFixedAmount || calc.penaltyFixedAmount <= 0) {
        calc.status = CalcStatus.COMPLETED
        this.addAuditEntry(id, { action: 'completed', userId: 'system', userName: 'Система', userRole: 'operator' })
        notificationStore.add({
          type: 'success',
          title: t('notif.calcCompletedTitle'),
          message: t('notif.calcCompletedMessage', { number: calc.number }),
          role: 'business',
          link: `/business/calculations/${calc.id}/payment`,
        })
      } else {
        notificationStore.add({
          type: 'success',
          title: t('notif.feeConfirmedTitle'),
          message: t('notif.feeConfirmedMessage', { number: calc.number }),
          role: 'business',
          link: `/business/calculations/${calc.id}/payment`,
        })
      }

      silentApi.post(`/calculations/${id}/confirm-fee`).catch(() => {})
    },

    uploadPenaltyReceipt(id: number, data: PaymentData) {
      const calc = this.calculations.find(c => c.id === id)
      if (calc) {
        calc.penaltyPayment = data
        this.addAuditEntry(id, { action: 'penalty_payment_uploaded', userId: 'payer-1', userName: calc.company, userRole: 'payer' })
        const t = i18n.global.t as any
        notificationStore.add({
          type: 'info',
          title: t('notif.penaltyReceiptUploadedTitle'),
          message: t('notif.penaltyReceiptUploadedMessage', { number: calc.number, company: calc.company }),
          role: 'eco-operator',
          link: `/eco-operator/calculations/${calc.id}`,
        })
      }
      silentApi.post(`/calculations/${id}/penalty-receipt`, data).catch(() => {})
    },

    confirmPenaltyPayment(id: number) {
      const calc = this.calculations.find(c => c.id === id)
      if (!calc) return
      calc.status = CalcStatus.COMPLETED
      calc.penaltyConfirmedAt = new Date().toLocaleDateString('ru-RU')
      this.addAuditEntry(id, { action: 'penalty_payment_confirmed', userId: 'operator-1', userName: 'Оператор', userRole: 'operator' })
      this.addAuditEntry(id, { action: 'completed', userId: 'system', userName: 'Система', userRole: 'operator' })
      const t = i18n.global.t as any
      notificationStore.add({
        type: 'success',
        title: t('notif.calcCompletedTitle'),
        message: t('notif.calcCompletedMessage', { number: calc.number }),
        role: 'business',
        link: `/business/calculations/${calc.id}/payment`,
      })
      silentApi.post(`/calculations/${id}/confirm-penalty`).catch(() => {})
    },
  },
})
