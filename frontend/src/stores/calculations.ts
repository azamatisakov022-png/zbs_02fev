import { reactive } from 'vue'
import api, { silentApi } from '../api/client'
import { calculatePaymentDeadline, formatDateShort } from '../utils/dateUtils'

export type DocumentType = 'gtd' | 'act' | 'invoice_goods' | 'invoice' | 'contract' | 'other'

export const documentTypeLabels: Record<DocumentType, string> = {
  gtd: 'ГТД',
  act: 'Акт приёма-передачи',
  invoice_goods: 'Товарная накладная',
  invoice: 'Инвойс',
  contract: 'Договор с переработчиком',
  other: 'Иное',
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

export type CalculationStatus =
  | 'Черновик'
  | 'На проверке'
  | 'Принято'
  | 'Отклонено'
  | 'Оплата на проверке'
  | 'Оплачено'
  | 'Оплата отклонена'

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
}

let nextId = 1

const state = reactive<{ calculations: Calculation[]; loading: boolean }>({
  loading: false,
  calculations: [],
})

// Backend status → Frontend display status
const backendStatusToFrontend: Record<string, CalculationStatus> = {
  draft: 'Черновик',
  submitted: 'На проверке',
  under_review: 'На проверке',
  approved: 'Принято',
  rejected: 'Отклонено',
  paid: 'Оплачено',
  partially_paid: 'Оплата на проверке',
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
  const status = backendStatusToFrontend[c.status] || 'Черновик'
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
    rejectionReason: status === 'Отклонено' ? c.reviewComment : undefined,
    rejectedBy: status === 'Отклонено' ? c.reviewedBy : undefined,
    rejectedAt: status === 'Отклонено' && c.reviewedAt
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
}, status: CalculationStatus = 'Черновик'): Calculation {
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
      if (status === 'На проверке') {
        silentApi.post(`/calculations/${resp.data.id}/submit`).catch(() => {})
      }
    }
  }).catch(() => {})

  return calc
}

function submitForReview(id: number) {
  const calc = state.calculations.find(c => c.id === id)
  if (calc && (calc.status === 'Черновик' || calc.status === 'Отклонено')) {
    calc.status = 'На проверке'
    calc.rejectionReason = undefined
  }
  silentApi.post(`/calculations/${id}/submit`).catch(() => {})
}

function approveCalculation(id: number) {
  const calc = state.calculations.find(c => c.id === id)
  if (calc && calc.status === 'На проверке') {
    calc.status = 'Принято'
  }
  silentApi.post(`/calculations/${id}/approve`).catch(() => {})
}

function rejectCalculation(id: number, reason: string, rejectedBy?: string) {
  const calc = state.calculations.find(c => c.id === id)
  if (calc && calc.status === 'На проверке') {
    calc.status = 'Отклонено'
    calc.rejectionReason = reason
    calc.rejectedAt = new Date().toLocaleDateString('ru-RU')
    calc.rejectedBy = rejectedBy
  }
  silentApi.post(`/calculations/${id}/reject`, { reason, rejectedBy }).catch(() => {})
}

function submitPayment(id: number, payment: PaymentData) {
  const calc = state.calculations.find(c => c.id === id)
  if (calc && (calc.status === 'Принято' || calc.status === 'Оплата отклонена')) {
    calc.payment = payment
    calc.status = 'Оплата на проверке'
    calc.paymentRejectionReason = undefined
  }
  silentApi.post(`/calculations/${id}/payment`, payment).catch(() => {})
}

function approvePayment(id: number) {
  const calc = state.calculations.find(c => c.id === id)
  if (calc && calc.status === 'Оплата на проверке') {
    calc.status = 'Оплачено'
    calc.paidAt = new Date().toLocaleDateString('ru-RU')
  }
  silentApi.post(`/calculations/${id}/payment/approve`).catch(() => {})
}

function rejectPayment(id: number, reason: string) {
  const calc = state.calculations.find(c => c.id === id)
  if (calc && calc.status === 'Оплата на проверке') {
    calc.status = 'Оплата отклонена'
    calc.paymentRejectionReason = reason
  }
  silentApi.post(`/calculations/${id}/payment/reject`, { reason }).catch(() => {})
}

function markAsPaid(id: number) {
  const calc = state.calculations.find(c => c.id === id)
  if (calc && calc.status === 'Принято') {
    calc.status = 'Оплачено'
    calc.paidAt = new Date().toLocaleDateString('ru-RU')
  }
  silentApi.post(`/calculations/${id}/mark-paid`).catch(() => {})
}

function resubmitCalculation(id: number) {
  const calc = state.calculations.find(c => c.id === id)
  if (calc && calc.status === 'Отклонено') {
    calc.status = 'На проверке'
    calc.rejectionReason = undefined
  }
  silentApi.post(`/calculations/${id}/resubmit`).catch(() => {})
}

function updateCalculationItems(id: number, items: ProductItem[], totalAmount: number) {
  const calc = state.calculations.find(c => c.id === id)
  if (calc && (calc.status === 'Черновик' || calc.status === 'Отклонено')) {
    calc.items = items
    calc.totalAmount = totalAmount
  }
  silentApi.put(`/calculations/${id}/items`, { items, totalAmount }).catch(() => {})
}

function updateCalculationDocuments(id: number, documents: AttachedDocument[]) {
  const calc = state.calculations.find(c => c.id === id)
  if (calc) {
    calc.documents = documents
  }
  silentApi.put(`/calculations/${id}/documents`, { documents }).catch(() => {})
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
    status: 'Черновик',
    parentId: sourceId,
    attachedFiles: src.attachedFiles ? [...src.attachedFiles] : undefined,
  }
  state.calculations.unshift(copy)
  return copy
}

function getCalculationById(id: number): Calculation | undefined {
  return state.calculations.find(c => c.id === id)
}

function getBusinessCalculations(company: string) {
  return state.calculations.filter(c => c.company === company)
}

function getPendingCount() {
  return state.calculations.filter(c => c.status === 'На проверке' || c.status === 'Оплата на проверке').length
}

function getPaymentPendingCount() {
  return state.calculations.filter(c => c.status === 'Оплата на проверке').length
}

function getCalcReviewCount() {
  return state.calculations.filter(c => c.status === 'На проверке').length
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
}
