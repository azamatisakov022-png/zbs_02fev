import { defineStore } from 'pinia'
import api from '../api/client'
import { calculatePaymentDeadline, formatDateShort } from '../utils/dateUtils'
import { calculatePenalty, getOverdueDays } from '../utils/penalty'
import { CalcStatus, type CalcStatusType } from '../constants/statuses'
import i18n from '../i18n'
import { notificationStore } from './notifications'
import { toastStore } from './toast'
import type {
  Calculation,
  CalculationStatus,
  ProductItem,
  ItemDocument,
  AttachedDocument,
  DocumentType,
  PaymentData,
  AuditEntry,
} from '@/types/calculation'
import type { CalculatorProductItem } from '@/types/calculator'

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
  const transferred = parseFloat(i.transferredForRecycling) || 0
  const exported = parseFloat(i.exportedFromKR) || 0
  const volToRecycle = weight * norm / 100
  const taxable = Math.max(0, weight - transferred - exported)
  return {
    id: i.id,
    group: i.productGroup || '',
    subgroup: i.productSubgroup || '',
    gskpCode: i.gskpCode || '',
    tnvedCode: i.tnvedCode || '',
    volume: String(weight),
    recyclingStandard: norm,
    volumeToRecycle: volToRecycle,
    transferredToRecycling: String(transferred),
    exportedFromKR: String(exported),
    taxableVolume: taxable,
    rate: rate,
    amount: parseFloat(i.amount) || (rate * taxable),
    documents: (i.documents || []).map((d: any): ItemDocument => ({
      id: d.id,
      name: d.name || '',
      type: d.type || '',
      url: d.url || '',
      size: d.size || 0,
    })),
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

    async addCalculation(data: {
      number: string
      date: string
      company: string
      inn: string
      quarter: string
      year: string
      payerType?: 'producer' | 'importer'
      importDate?: string
      address?: string
      items: CalculatorProductItem[]
      totalAmount: number
      documents?: AttachedDocument[]
    }, status: CalculationStatus = CalcStatus.DRAFT): Promise<Calculation> {
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
        documents: data.documents,
      }
      this.calculations.unshift(calc)

      const validItems = data.items.filter(i => i.group && parseFloat(i.volume) > 0)

      const backendRequest = {
        payerType: pt === 'producer' ? 'PRODUCER' : 'IMPORTER',
        year: parseInt(data.year) || new Date().getFullYear(),
        quarter: pt === 'producer' ? data.quarter.replace('Q', '') : undefined,
        importDate: pt === 'importer' && data.importDate ? data.importDate : undefined,
        items: validItems.map(i => ({
          productGroup: i.group,
          productSubgroup: i.subgroup || undefined,
          tnvedCode: i.tnvedCode || undefined,
          gskpCode: i.gskpCode || undefined,
          productName: i.subgroup || i.group,
          weight: parseFloat(i.volume) || 0,
          transferredForRecycling: parseFloat(i.transferredToRecycling) || 0,
          exportedFromKR: parseFloat(i.exportedFromKR) || 0,
        })),
      }

      const formData = new FormData()
      formData.append('request', new Blob([JSON.stringify(backendRequest)], { type: 'application/json' }))

      validItems.forEach(i => {
        const ci = i as CalculatorProductItem
        formData.append('recyclingContracts', ci.recycledFile?.file ?? new Blob(), ci.recycledFile?.name ?? '')
        formData.append('exportGtds', ci.exportedFile?.file ?? new Blob(), ci.exportedFile?.name ?? '')
      })

      const t = i18n.global.t as any
      try {
        const resp = await api.post('/calculations', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        if (resp.data?.id) {
          calc.id = resp.data.id
          calc.number = resp.data.number || calc.number

          if (status === CalcStatus.UNDER_REVIEW) {
            api.post(`/calculations/${resp.data.id}/submit`).catch(() => {})
          }
        }
        toastStore.show({ type: 'success', title: t('toast.calcCreated'), message: t('toast.calcCreatedMessage', { number: calc.number }) })
      } catch {
        toastStore.show({ type: 'error', title: t('toast.calcCreateError'), message: t('toast.calcCreateErrorMessage') })
      }

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
      api.post(`/calculations/${id}/submit`).then(() => {
        toastStore.show({ type: 'success', title: t('toast.calcSubmitted'), message: t('toast.calcSubmittedMessage', { number: calc?.number }) })
      }).catch(() => {
        toastStore.show({ type: 'error', title: t('toast.calcSubmitError'), message: t('toast.calcSubmitErrorMessage') })
      })
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
      const t2 = i18n.global.t as any
      api.post(`/calculations/${id}/approve`).then(() => {
        toastStore.show({ type: 'success', title: t2('toast.calcApproved'), message: t2('toast.calcApprovedMessage', { number: calc?.number }) })
      }).catch(() => {
        toastStore.show({ type: 'error', title: t2('toast.calcApproveError'), message: t2('toast.calcApproveErrorMessage') })
      })
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
      api.post(`/calculations/${id}/reject`, { reason, rejectedBy }).then(() => {
        toastStore.show({ type: 'success', title: t('toast.calcRejected'), message: t('toast.calcRejectedMessage', { number: calc?.number }) })
      }).catch(() => {
        toastStore.show({ type: 'error', title: t('toast.calcRejectError'), message: t('toast.calcRejectErrorMessage') })
      })
    },

    submitPayment(id: number, payment: PaymentData) {
      const calc = this.calculations.find(c => c.id === id)
      if (calc && (calc.status === CalcStatus.APPROVED || calc.status === CalcStatus.PAYMENT_REJECTED)) {
        calc.payment = payment
        calc.status = CalcStatus.PAYMENT_PENDING
        calc.paymentRejectionReason = undefined
      }
      const t = i18n.global.t as any
      api.post(`/calculations/${id}/payment`, payment).then(() => {
        toastStore.show({ type: 'success', title: t('toast.paymentSubmitted'), message: t('toast.paymentSubmittedMessage') })
      }).catch(() => {
        toastStore.show({ type: 'error', title: t('toast.paymentSubmitError'), message: t('toast.paymentSubmitErrorMessage') })
      })
    },

    approvePayment(id: number) {
      const calc = this.calculations.find(c => c.id === id)
      if (calc && calc.status === CalcStatus.PAYMENT_PENDING) {
        calc.status = CalcStatus.PAID
        calc.paidAt = new Date().toLocaleDateString('ru-RU')
      }
      const t = i18n.global.t as any
      api.post(`/calculations/${id}/payment/approve`).then(() => {
        toastStore.show({ type: 'success', title: t('toast.paymentApproved'), message: t('toast.paymentApprovedMessage', { number: calc?.number }) })
      }).catch(() => {
        toastStore.show({ type: 'error', title: t('toast.paymentApproveError'), message: t('toast.serverError') })
      })
    },

    rejectPayment(id: number, reason: string) {
      const calc = this.calculations.find(c => c.id === id)
      if (calc && calc.status === CalcStatus.PAYMENT_PENDING) {
        calc.status = CalcStatus.PAYMENT_REJECTED
        calc.paymentRejectionReason = reason
      }
      const t = i18n.global.t as any
      api.post(`/calculations/${id}/payment/reject`, { reason }).then(() => {
        toastStore.show({ type: 'success', title: t('toast.paymentRejected'), message: t('toast.paymentRejectedMessage', { number: calc?.number }) })
      }).catch(() => {
        toastStore.show({ type: 'error', title: t('toast.paymentRejectError'), message: t('toast.serverError') })
      })
    },

    markAsPaid(id: number) {
      const calc = this.calculations.find(c => c.id === id)
      if (calc && calc.status === CalcStatus.APPROVED) {
        calc.status = CalcStatus.PAID
        calc.paidAt = new Date().toLocaleDateString('ru-RU')
      }
      const t = i18n.global.t as any
      api.post(`/calculations/${id}/mark-paid`).then(() => {
        toastStore.show({ type: 'success', title: t('toast.markedAsPaid'), message: t('toast.markedAsPaidMessage', { number: calc?.number }) })
      }).catch(() => {
        toastStore.show({ type: 'error', title: t('toast.markAsPaidError'), message: t('toast.serverError') })
      })
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
      const t = i18n.global.t as any
      api.post(`/calculations/${id}/resubmit`).then(() => {
        toastStore.show({ type: 'success', title: t('toast.calcResubmitted'), message: t('toast.calcResubmittedMessage', { number: calc?.number }) })
      }).catch(() => {
        toastStore.show({ type: 'error', title: t('toast.calcResubmitError'), message: t('toast.serverError') })
      })
    },

    async updateCalculation(id: number, payload: { items: ProductItem[]; totalAmount: number; documents?: AttachedDocument[]; documentsChanged?: boolean }) {
      const calc = this.calculations.find(c => c.id === id)
      if (calc && (calc.status === CalcStatus.DRAFT || calc.status === CalcStatus.REJECTED)) {
        calc.items = payload.items
        calc.totalAmount = payload.totalAmount
      }
      if (calc && payload.documents) {
        calc.documents = payload.documents
      }

      const t = i18n.global.t as any
      const backendItems = payload.items.filter(i => i.group && parseFloat(i.volume) > 0).map(i => ({
        productGroup: i.group,
        productSubgroup: i.subgroup || undefined,
        tnvedCode: i.tnvedCode || undefined,
        gskpCode: i.gskpCode || undefined,
        productName: i.subgroup || i.group,
        weight: parseFloat(i.volume) || 0,
        transferredForRecycling: parseFloat(i.transferredToRecycling) || 0,
        exportedFromKR: parseFloat(i.exportedFromKR) || 0,
      }))

      try {
        await api.put(`/calculations/${id}/items`, { items: backendItems })

        if (payload.documentsChanged && payload.documents) {
          const newFiles = payload.documents.filter(d => d.file)
          if (newFiles.length > 0) {
            const formData = new FormData()
            for (const doc of newFiles) {
              formData.append('files', doc.file!)
            }
            await api.put(`/calculations/${id}/documents`, formData, {
              headers: { 'Content-Type': 'multipart/form-data' },
            })
          }
        }

        toastStore.show({ type: 'success', title: t('toast.calcItemsUpdated'), message: t('toast.calcItemsUpdatedMessage') })
      } catch {
        toastStore.show({ type: 'error', title: t('toast.calcItemsUpdateError'), message: t('toast.calcItemsUpdateErrorMessage') })
      }
    },

    async deleteCalculation(id: number) {
      const calc = this.calculations.find(c => c.id === id)
      const t = i18n.global.t as any
      try {
        await api.delete(`/calculations/${id}`)
        this.calculations = this.calculations.filter(c => c.id !== id)
        this.myCalculations = this.myCalculations.filter(c => c.id !== id)
        toastStore.show({ type: 'success', title: t('toast.calcDeleted'), message: t('toast.calcDeletedMessage', { number: calc?.number }) })
      } catch {
        toastStore.show({ type: 'error', title: t('toast.calcDeleteError'), message: t('toast.calcDeleteErrorMessage') })
      }
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
      const t = i18n.global.t as any
      api.post(`/calculations/${id}/assign`).then(() => {
        toastStore.show({ type: 'success', title: t('toast.calcAssigned'), message: t('toast.calcAssignedMessage', { number: calc?.number }) })
      }).catch(() => {
        toastStore.show({ type: 'error', title: t('toast.calcAssignError'), message: t('toast.serverError') })
      })
    },

    unassign(id: number) {
      const calc = this.calculations.find(c => c.id === id)
      if (calc && calc.status === CalcStatus.IN_REVIEW) {
        calc.status = CalcStatus.UNDER_REVIEW
        this.addAuditEntry(id, { action: 'unassigned', userId: calc.assignedTo || '', userName: calc.assignedName || '', userRole: 'operator' })
        calc.assignedTo = undefined
        calc.assignedName = undefined
      }
      const t = i18n.global.t as any
      api.post(`/calculations/${id}/unassign`).then(() => {
        toastStore.show({ type: 'success', title: t('toast.calcUnassigned'), message: t('toast.calcUnassignedMessage', { number: calc?.number }) })
      }).catch(() => {
        toastStore.show({ type: 'error', title: t('toast.calcUnassignError'), message: t('toast.serverError') })
      })
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
      api.post(`/calculations/${id}/revision`, { comment }).then(() => {
        toastStore.show({ type: 'success', title: t('toast.calcRevisionSent'), message: t('toast.calcRevisionSentMessage', { number: calc?.number }) })
      }).catch(() => {
        toastStore.show({ type: 'error', title: t('toast.calcRevisionError'), message: t('toast.serverError') })
      })
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
      const t2 = i18n.global.t as any
      api.post(`/calculations/${id}/fee-receipt`, data).then(() => {
        toastStore.show({ type: 'success', title: t2('toast.feeReceiptUploaded'), message: t2('toast.feeReceiptUploadedMessage') })
      }).catch(() => {
        toastStore.show({ type: 'error', title: t2('toast.feeReceiptUploadError'), message: t2('toast.serverError') })
      })
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

      api.post(`/calculations/${id}/confirm-fee`).then(() => {
        toastStore.show({ type: 'success', title: t('toast.feeConfirmed'), message: t('toast.feeConfirmedMessage', { number: calc.number }) })
      }).catch(() => {
        toastStore.show({ type: 'error', title: t('toast.feeConfirmError'), message: t('toast.serverError') })
      })
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
      const t2 = i18n.global.t as any
      api.post(`/calculations/${id}/penalty-receipt`, data).then(() => {
        toastStore.show({ type: 'success', title: t2('toast.penaltyReceiptUploaded'), message: t2('toast.penaltyReceiptUploadedMessage') })
      }).catch(() => {
        toastStore.show({ type: 'error', title: t2('toast.penaltyReceiptUploadError'), message: t2('toast.serverError') })
      })
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
      api.post(`/calculations/${id}/confirm-penalty`).then(() => {
        toastStore.show({ type: 'success', title: t('toast.penaltyConfirmed'), message: t('toast.penaltyConfirmedMessage', { number: calc.number }) })
      }).catch(() => {
        toastStore.show({ type: 'error', title: t('toast.penaltyConfirmError'), message: t('toast.serverError') })
      })
    },
  },
})
