import { reactive } from 'vue'
import api from '../api/client'

export type RefundStatus = 'Новая' | 'На рассмотрении' | 'Одобрена' | 'Отклонена'

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
  status: RefundStatus
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
    status: 'На рассмотрении',
    documents: data.documents,
  }
  state.refunds.unshift(refund)
  api.post('/refunds', data).catch(() => {})
  return refund
}

function approveRefund(id: number) {
  const refund = state.refunds.find(r => r.id === id)
  if (refund && (refund.status === 'На рассмотрении' || refund.status === 'Новая')) {
    refund.status = 'Одобрена'
  }
  api.post(`/refunds/${id}/approve`).catch(() => {})
}

function rejectRefund(id: number, reason: string) {
  const refund = state.refunds.find(r => r.id === id)
  if (refund && (refund.status === 'На рассмотрении' || refund.status === 'Новая')) {
    refund.status = 'Отклонена'
    refund.rejectionReason = reason
  }
  api.post(`/refunds/${id}/reject`, { reason }).catch(() => {})
}

function getPendingRefundsCount(): number {
  return state.refunds.filter(r => r.status === 'На рассмотрении' || r.status === 'Новая').length
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
