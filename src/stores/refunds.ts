import { reactive } from 'vue'
import api, { silentApi } from '../api/client'
import { RefundStatus, type RefundStatusType } from '../constants/statuses'

export type { RefundStatusType }

export interface RefundItem {
  group: string
  subgroup: string
  mass: string
  paidAmount: number
  exportedMass: string
  refundAmount: number
  rate: number
}

export interface Refund {
  id: number
  number: string
  date: string
  calculationId: number
  calculationNumber: string
  company: string
  inn: string
  items: RefundItem[]
  totalRefund: number
  status: RefundStatusType
  documents: string[]
  rejectionReason?: string
}

let nextId = 1

const state = reactive<{ refunds: Refund[]; loading: boolean }>({
  loading: false,
  refunds: [],
})

async function fetchAll() {
  state.loading = true
  try {
    const { data } = await api.get('/refunds')
    if (Array.isArray(data)) {
      state.refunds = data
    } else if (data?.content && Array.isArray(data.content)) {
      state.refunds = data.content
    }
  } catch { /* keep local data */ } finally {
    state.loading = false
  }
}

function getRefundById(id: number): Refund | undefined {
  return state.refunds.find(r => r.id === id)
}

function createRefund(data: {
  calculationId: number
  calculationNumber: string
  company: string
  inn: string
  items: RefundItem[]
  totalRefund: number
  documents: string[]
}): Refund {
  const now = new Date()
  const num = String(Math.floor(Math.random() * 900) + 100)
  const refund: Refund = {
    id: nextId++,
    number: `ВЗ-${now.getFullYear()}-${num}`,
    date: now.toLocaleDateString('ru-RU'),
    calculationId: data.calculationId,
    calculationNumber: data.calculationNumber,
    company: data.company,
    inn: data.inn,
    items: data.items,
    totalRefund: data.totalRefund,
    status: RefundStatus.UNDER_REVIEW,
    documents: data.documents,
  }
  state.refunds.unshift(refund)
  silentApi.post('/refunds', data).catch(() => {})
  return refund
}

function approveRefund(id: number) {
  const refund = state.refunds.find(r => r.id === id)
  if (refund && (refund.status === RefundStatus.UNDER_REVIEW || refund.status === RefundStatus.NEW)) {
    refund.status = RefundStatus.APPROVED
  }
  silentApi.post(`/refunds/${id}/approve`).catch(() => {})
}

function rejectRefund(id: number, reason: string) {
  const refund = state.refunds.find(r => r.id === id)
  if (refund && (refund.status === RefundStatus.UNDER_REVIEW || refund.status === RefundStatus.NEW)) {
    refund.status = RefundStatus.REJECTED
    refund.rejectionReason = reason
  }
  silentApi.post(`/refunds/${id}/reject`, { reason }).catch(() => {})
}

function getPendingRefundsCount(): number {
  return state.refunds.filter(r => r.status === RefundStatus.UNDER_REVIEW || r.status === RefundStatus.NEW).length
}

export const refundStore = {
  state,
  fetchAll,
  getRefundById,
  createRefund,
  approveRefund,
  rejectRefund,
  getPendingRefundsCount,
}
