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

let nextId = 3

const state = reactive<{ refunds: Refund[]; loading: boolean }>({
  loading: false,
  refunds: [
    {
      id: 1,
      number: 'ВЗ-2026-001',
      date: '05.02.2026',
      calculationId: 1,
      calculationNumber: 'РС-2026-015',
      company: 'ОсОО «ТехПром»',
      inn: '01234567890123',
      items: [
        { group: 'group_6', subgroup: 'g6_bottles_small', mass: '3.5', paidAmount: 3296, exportedMass: '0.8', refundAmount: 1507, rate: 9418 },
        { group: 'group_1', subgroup: 'g1_corrugated_boxes', mass: '2.1', paidAmount: 2013, exportedMass: '0.5', refundAmount: 479, rate: 4793 },
      ],
      totalRefund: 1986,
      status: 'На рассмотрении',
      documents: ['GTD_export_001.pdf', 'invoice_export_001.pdf'],
    },
    {
      id: 2,
      number: 'ВЗ-2026-002',
      date: '28.01.2026',
      calculationId: 1,
      calculationNumber: 'РС-2026-015',
      company: 'ОсОО «ТехПром»',
      inn: '01234567890123',
      items: [
        { group: 'group_8', subgroup: 'g8_bottles_clear', mass: '2.4', paidAmount: 1013, exportedMass: '0.3', refundAmount: 253, rate: 4219 },
      ],
      totalRefund: 253,
      status: 'Одобрена',
      documents: ['GTD_export_002.pdf', 'transport_doc_002.pdf', 'invoice_002.pdf'],
    },
  ],
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
