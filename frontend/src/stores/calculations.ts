import { reactive } from 'vue'
import api, { silentApi } from '../api/client'
import { calculatePaymentDeadline, formatDateShort } from '../utils/dateUtils'
import { calculatePenalty, getOverdueDays } from '../utils/penalty'
import { CalcStatus, type CalcStatusType } from '../constants/statuses'
import i18n from '../i18n'
import { notificationStore } from './notifications'
import { silentCatch } from '../utils/logError'

export type DocumentType = 'gtd' | 'act' | 'invoice_goods' | 'invoice' | 'contract' | 'other'

export function getDocumentTypeLabel(type: DocumentType): string {
  const key = {
    gtd: 'documentType.gtd',
    act: 'documentType.act',
    invoice_goods: 'documentType.invoiceGoods',
    invoice: 'documentType.invoice',
    contract: 'documentType.contract',
    other: 'documentType.other',
  }[type]
  return key ? i18n.global.t(key) : type
}

export interface AttachedDocument {
  id: number
  fileName: string
  fileSize: number
  fileType: string
  docType: DocumentType
  dataUrl: string
}

export interface ProductItem {
  id: number
  group: string           // Гр.1: Группа товаров/упаковки
  subgroup: string        // Гр.2: Подгруппа
  gskpCode: string        // Гр.3: Код ГСКП (для производителей)
  tnvedCode: string       // Гр.4: Код ТН ВЭД (для импортёров, авто из подгруппы)
  volume: string          // Гр.5: Объём (масса) товаров/упаковки (тонн)
  recyclingStandard: number // Гр.6: Норматив переработки (%)
  volumeToRecycle: number  // Гр.7: Объём к переработке = Гр.5 × Гр.6 / 100
  transferredToRecycling: string // Гр.8: Передано на переработку (тонн)
  exportedFromKR: string  // Гр.9: Вывезено из КР (тонн)
  taxableVolume: number   // Гр.10: Облагаемый объём = max(0, Гр.7 - Гр.8 - Гр.9)
  rate: number            // Гр.11: Ставка утильсбора (сом/т)
  amount: number          // Гр.12: Сумма = Гр.10 × Гр.11
}

export type CalculationStatus = CalcStatusType

export type AuditAction = 'created' | 'submitted' | 'assigned' | 'unassigned' | 'approved' | 'revision' | 'rejected' | 'resubmitted' | 'fee_payment_uploaded' | 'fee_payment_confirmed' | 'penalty_payment_uploaded' | 'penalty_payment_confirmed' | 'completed'

export interface AuditEntry {
  id: string
  timestamp: string
  action: AuditAction
  userId: string
  userName: string
  userRole: 'payer' | 'operator'
  comment?: string
  metadata?: Record<string, any>
}

export interface PaymentData {
  paymentOrderNumber: string
  paymentDate: string
  payerBank: string
  transferAmount: number
  fileName: string
  fileType: string
  fileDataUrl: string
  comment?: string
}

export interface Calculation {
  id: number
  number: string
  date: string
  company: string
  inn: string
  address?: string
  period: string
  quarter: string
  year: string
  payerType?: 'producer' | 'importer'
  importDate?: string
  dueDate?: string
  items: ProductItem[]
  totalAmount: number
  status: CalculationStatus
  rejectionReason?: string
  rejectedAt?: string
  rejectedBy?: string
  parentId?: number
  paidAt?: string
  payment?: PaymentData
  paymentRejectionReason?: string
  attachedFiles?: string[]
  documents?: AttachedDocument[]
  assignedTo?: string
  assignedName?: string
  history?: AuditEntry[]
  penaltyFixedDate?: string | null
  penaltyFixedAmount?: number | null
  penaltyFixedDays?: number | null
  feePayment?: PaymentData
  penaltyPayment?: PaymentData
  revisionComment?: string
  approvedAt?: string
  feeConfirmedAt?: string
  penaltyConfirmedAt?: string
}

let nextId = 1

const state = reactive<{ calculations: Calculation[]; loading: boolean }>({
  loading: false,
  calculations: [],
})

// Backend status → Frontend status
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

async function fetchAll() {
  state.loading = true
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
    state.calculations = backendCalcs.map(mapBackendCalc)
  } catch { /* keep empty on error */ } finally {
    state.loading = false
  }
}

function addCalculation(data: {
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
  state.calculations.unshift(calc)

  // Map to backend CalculationCreateRequest format
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
      // Sync local calc with backend ID and number
      calc.id = resp.data.id
      calc.number = resp.data.number || calc.number
      // If submitting immediately, trigger submit on backend
      if (status === CalcStatus.UNDER_REVIEW) {
        silentApi.post(`/calculations/${resp.data.id}/submit`).catch(silentCatch('calculations.submitAfterCreate'))
      }
    }
  }).catch(silentCatch('calculations.create'))

  return calc
}

function submitForReview(id: number) {
  const calc = state.calculations.find(c => c.id === id)
  if (calc && (calc.status === CalcStatus.DRAFT || calc.status === CalcStatus.REJECTED || calc.status === CalcStatus.REVISION)) {
    const isResubmit = calc.status === CalcStatus.REJECTED || calc.status === CalcStatus.REVISION
    calc.status = CalcStatus.UNDER_REVIEW
    calc.rejectionReason = undefined
    calc.revisionComment = undefined
    if (isResubmit) {
      addAuditEntry(id, { action: 'resubmitted', userId: 'payer-1', userName: calc.company, userRole: 'payer' })
    } else {
      addAuditEntry(id, { action: 'submitted', userId: 'payer-1', userName: calc.company, userRole: 'payer' })
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
  silentApi.post(`/calculations/${id}/submit`).catch(silentCatch('calculations.submit'))
}

function approveCalculation(id: number) {
  const calc = state.calculations.find(c => c.id === id)
  if (calc && (calc.status === CalcStatus.UNDER_REVIEW || calc.status === CalcStatus.IN_REVIEW)) {
    calc.status = CalcStatus.APPROVED
    calc.approvedAt = new Date().toLocaleDateString('ru-RU')
    addAuditEntry(id, {
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
  silentApi.post(`/calculations/${id}/approve`).catch(silentCatch('calculations.approve'))
}

function rejectCalculation(id: number, reason: string, rejectedBy?: string) {
  const calc = state.calculations.find(c => c.id === id)
  if (calc && (calc.status === CalcStatus.UNDER_REVIEW || calc.status === CalcStatus.IN_REVIEW)) {
    calc.status = CalcStatus.REJECTED
    calc.rejectionReason = reason
    calc.rejectedAt = new Date().toLocaleDateString('ru-RU')
    calc.rejectedBy = rejectedBy
    addAuditEntry(id, { action: 'rejected', userId: 'operator-1', userName: 'Оператор', userRole: 'operator', comment: reason })
    const t = i18n.global.t as any
    notificationStore.add({
      type: 'error',
      title: t('notif.calcRejectedTitle'),
      message: t('notif.calcRejectedMessage', { number: calc.number, reason }),
      role: 'business',
      link: `/business/calculations/${calc.id}`,
    })
  }
  silentApi.post(`/calculations/${id}/reject`, { reason, rejectedBy }).catch(silentCatch('calculations.reject'))
}

function submitPayment(id: number, payment: PaymentData) {
  const calc = state.calculations.find(c => c.id === id)
  if (calc && (calc.status === CalcStatus.APPROVED || calc.status === CalcStatus.PAYMENT_REJECTED)) {
    calc.payment = payment
    calc.status = CalcStatus.PAYMENT_PENDING
    calc.paymentRejectionReason = undefined
  }
  silentApi.post(`/calculations/${id}/payment`, payment).catch(silentCatch('calculations.submitPayment'))
}

function approvePayment(id: number) {
  const calc = state.calculations.find(c => c.id === id)
  if (calc && calc.status === CalcStatus.PAYMENT_PENDING) {
    calc.status = CalcStatus.PAID
    calc.paidAt = new Date().toLocaleDateString('ru-RU')
  }
  silentApi.post(`/calculations/${id}/payment/approve`).catch(silentCatch('calculations.approvePayment'))
}

function rejectPayment(id: number, reason: string) {
  const calc = state.calculations.find(c => c.id === id)
  if (calc && calc.status === CalcStatus.PAYMENT_PENDING) {
    calc.status = CalcStatus.PAYMENT_REJECTED
    calc.paymentRejectionReason = reason
  }
  silentApi.post(`/calculations/${id}/payment/reject`, { reason }).catch(silentCatch('calculations.rejectPayment'))
}

function markAsPaid(id: number) {
  const calc = state.calculations.find(c => c.id === id)
  if (calc && calc.status === CalcStatus.APPROVED) {
    calc.status = CalcStatus.PAID
    calc.paidAt = new Date().toLocaleDateString('ru-RU')
  }
  silentApi.post(`/calculations/${id}/mark-paid`).catch(silentCatch('calculations.markAsPaid'))
}

function resubmitCalculation(id: number) {
  const calc = state.calculations.find(c => c.id === id)
  if (calc && (calc.status === CalcStatus.REJECTED || calc.status === CalcStatus.REVISION)) {
    calc.status = CalcStatus.UNDER_REVIEW
    calc.rejectionReason = undefined
    calc.revisionComment = undefined
    addAuditEntry(id, {
      action: 'resubmitted',
      userId: 'payer-1',
      userName: calc.company,
      userRole: 'payer',
    })
  }
  silentApi.post(`/calculations/${id}/resubmit`).catch(silentCatch('calculations.resubmit'))
}

function updateCalculationItems(id: number, items: ProductItem[], totalAmount: number) {
  const calc = state.calculations.find(c => c.id === id)
  if (calc && (calc.status === CalcStatus.DRAFT || calc.status === CalcStatus.REJECTED)) {
    calc.items = items
    calc.totalAmount = totalAmount
  }
  silentApi.put(`/calculations/${id}/items`, { items, totalAmount }).catch(silentCatch('calculations.updateItems'))
}

function updateCalculationDocuments(id: number, documents: AttachedDocument[]) {
  const calc = state.calculations.find(c => c.id === id)
  if (calc) {
    calc.documents = documents
  }
  silentApi.put(`/calculations/${id}/documents`, { documents }).catch(silentCatch('calculations.updateDocuments'))
}

function copyCalculation(sourceId: number): Calculation | undefined {
  const src = state.calculations.find(c => c.id === sourceId)
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
  state.calculations.unshift(copy)
  return copy
}

function addAuditEntry(id: number, entry: Omit<AuditEntry, 'id' | 'timestamp'>) {
  const calc = state.calculations.find(c => c.id === id)
  if (!calc) return
  if (!calc.history) calc.history = []
  calc.history.push({
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    ...entry,
  })
}

function assignToMe(id: number, userId: string, userName: string) {
  const calc = state.calculations.find(c => c.id === id)
  if (calc && (calc.status === CalcStatus.UNDER_REVIEW || calc.status === CalcStatus.SUBMITTED)) {
    calc.status = CalcStatus.IN_REVIEW
    calc.assignedTo = userId
    calc.assignedName = userName
    addAuditEntry(id, { action: 'assigned', userId, userName, userRole: 'operator' })
  }
  silentApi.post(`/calculations/${id}/assign`).catch(silentCatch('calculations.assign'))
}

function unassign(id: number) {
  const calc = state.calculations.find(c => c.id === id)
  if (calc && calc.status === CalcStatus.IN_REVIEW) {
    calc.status = CalcStatus.UNDER_REVIEW
    addAuditEntry(id, { action: 'unassigned', userId: calc.assignedTo || '', userName: calc.assignedName || '', userRole: 'operator' })
    calc.assignedTo = undefined
    calc.assignedName = undefined
  }
  silentApi.post(`/calculations/${id}/unassign`).catch(silentCatch('calculations.unassign'))
}

function sendToRevision(id: number, comment: string) {
  const calc = state.calculations.find(c => c.id === id)
  if (calc && calc.status === CalcStatus.IN_REVIEW) {
    calc.status = CalcStatus.REVISION
    calc.revisionComment = comment
    addAuditEntry(id, { action: 'revision', userId: calc.assignedTo || 'operator-1', userName: calc.assignedName || 'Оператор', userRole: 'operator', comment })
    const t = i18n.global.t as any
    notificationStore.add({
      type: 'warning',
      title: t('notif.calcRevisionTitle'),
      message: t('notif.calcRevisionMessage', { number: calc.number, comment }),
      role: 'business',
      link: `/business/calculations/${calc.id}`,
    })
  }
  silentApi.post(`/calculations/${id}/revision`, { comment }).catch(silentCatch('calculations.sendToRevision'))
}

function uploadFeeReceipt(id: number, data: PaymentData) {
  const calc = state.calculations.find(c => c.id === id)
  if (calc) {
    calc.feePayment = data
    addAuditEntry(id, { action: 'fee_payment_uploaded', userId: 'payer-1', userName: calc.company, userRole: 'payer' })
    const t = i18n.global.t as any
    notificationStore.add({
      type: 'info',
      title: t('notif.feeReceiptUploadedTitle'),
      message: t('notif.feeReceiptUploadedMessage', { number: calc.number, company: calc.company }),
      role: 'eco-operator',
      link: `/eco-operator/calculations/${calc.id}`,
    })
  }
  silentApi.post(`/calculations/${id}/fee-receipt`, data).catch(silentCatch('calculations.uploadFeeReceipt'))
}

function confirmFeePayment(id: number) {
  const calc = state.calculations.find(c => c.id === id)
  if (!calc) return
  calc.status = CalcStatus.FEE_PAID
  calc.feeConfirmedAt = new Date().toLocaleDateString('ru-RU')

  // Freeze penalty at current date
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

  addAuditEntry(id, { action: 'fee_payment_confirmed', userId: 'operator-1', userName: 'Оператор', userRole: 'operator' })

  const t = i18n.global.t as any

  // If no penalty, close immediately
  if (!calc.penaltyFixedAmount || calc.penaltyFixedAmount <= 0) {
    calc.status = CalcStatus.COMPLETED
    addAuditEntry(id, { action: 'completed', userId: 'system', userName: 'Система', userRole: 'operator' })
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

  silentApi.post(`/calculations/${id}/confirm-fee`).catch(silentCatch('calculations.confirmFee'))
}

function uploadPenaltyReceipt(id: number, data: PaymentData) {
  const calc = state.calculations.find(c => c.id === id)
  if (calc) {
    calc.penaltyPayment = data
    addAuditEntry(id, { action: 'penalty_payment_uploaded', userId: 'payer-1', userName: calc.company, userRole: 'payer' })
    const t = i18n.global.t as any
    notificationStore.add({
      type: 'info',
      title: t('notif.penaltyReceiptUploadedTitle'),
      message: t('notif.penaltyReceiptUploadedMessage', { number: calc.number, company: calc.company }),
      role: 'eco-operator',
      link: `/eco-operator/calculations/${calc.id}`,
    })
  }
  silentApi.post(`/calculations/${id}/penalty-receipt`, data).catch(silentCatch('calculations.uploadPenaltyReceipt'))
}

function confirmPenaltyPayment(id: number) {
  const calc = state.calculations.find(c => c.id === id)
  if (!calc) return
  calc.status = CalcStatus.COMPLETED
  calc.penaltyConfirmedAt = new Date().toLocaleDateString('ru-RU')
  addAuditEntry(id, { action: 'penalty_payment_confirmed', userId: 'operator-1', userName: 'Оператор', userRole: 'operator' })
  addAuditEntry(id, { action: 'completed', userId: 'system', userName: 'Система', userRole: 'operator' })
  const t = i18n.global.t as any
  notificationStore.add({
    type: 'success',
    title: t('notif.calcCompletedTitle'),
    message: t('notif.calcCompletedMessage', { number: calc.number }),
    role: 'business',
    link: `/business/calculations/${calc.id}/payment`,
  })
  silentApi.post(`/calculations/${id}/confirm-penalty`).catch(silentCatch('calculations.confirmPenalty'))
}

function getSubmittedCount() {
  return state.calculations.filter(c => c.status === CalcStatus.UNDER_REVIEW || c.status === CalcStatus.SUBMITTED).length
}

function getInReviewCount() {
  return state.calculations.filter(c => c.status === CalcStatus.IN_REVIEW).length
}

function getAwaitingPaymentConfirmCount() {
  return state.calculations.filter(c =>
    c.status === CalcStatus.APPROVED ||
    c.status === CalcStatus.FEE_PAID ||
    (c.feePayment && c.status !== CalcStatus.COMPLETED && c.status !== CalcStatus.PAID)
  ).length
}

function getCalculationById(id: number): Calculation | undefined {
  return state.calculations.find(c => c.id === id)
}

function getBusinessCalculations(company: string) {
  return state.calculations.filter(c => c.company === company)
}

function getPendingCount() {
  return state.calculations.filter(c => c.status === CalcStatus.UNDER_REVIEW || c.status === CalcStatus.PAYMENT_PENDING).length
}

function getPaymentPendingCount() {
  return state.calculations.filter(c => c.status === CalcStatus.PAYMENT_PENDING).length
}

function getCalcReviewCount() {
  return state.calculations.filter(c => c.status === CalcStatus.UNDER_REVIEW).length
}

export const calculationStore = {
  state,
  fetchAll,
  addCalculation,
  submitForReview,
  approveCalculation,
  rejectCalculation,
  submitPayment,
  approvePayment,
  rejectPayment,
  markAsPaid,
  resubmitCalculation,
  updateCalculationItems,
  updateCalculationDocuments,
  copyCalculation,
  getCalculationById,
  getBusinessCalculations,
  getPendingCount,
  getPaymentPendingCount,
  getCalcReviewCount,
  addAuditEntry,
  assignToMe,
  unassign,
  sendToRevision,
  uploadFeeReceipt,
  confirmFeePayment,
  uploadPenaltyReceipt,
  confirmPenaltyPayment,
  getSubmittedCount,
  getInReviewCount,
  getAwaitingPaymentConfirmCount,
}
