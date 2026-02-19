import { reactive } from 'vue'
import api from '../api/client'

export type TransactionType = 'charge' | 'payment' | 'correction' | 'offset' | 'refund'

export interface AccountTransaction {
  id: number
  date: string
  type: TransactionType
  calculationId: number
  calculationNumber: string
  description: string
  chargeAmount: number   // начислено (отрицательное для начислений)
  paymentAmount: number  // оплачено (положительное для оплат)
  offsetAmount: number   // зачтено
  balance: number        // нарастающий итог
}

export interface CorrectionRequest {
  id: number
  date: string
  calculationId: number
  calculationNumber: string
  company: string
  comment?: string
  items: CorrectionItem[]
  totalCorrectionAmount: number
  action: 'balance' | 'refund'
  status: 'На рассмотрении' | 'Одобрена' | 'Отклонена'
  documents: string[]
}

export interface CorrectionItem {
  group: string
  subgroup: string
  volume: number
  recyclingStandard: number
  volumeToRecycle: number
  previousTransferred: number
  previousExported: number
  additionalTransferred: number
  additionalExported: number
  oldTaxableVolume: number
  newTaxableVolume: number
  rate: number
  difference: number
}

export interface CompanyAccount {
  id: number
  company: string
  inn: string
  balance: number
  status: 'Активен' | 'Заблокирован'
  transactions: AccountTransaction[]
}

let nextTxId = 100
let nextCorrId = 2

const state = reactive<{
  // Current business user's company key (ОсОО «ТехПром»)
  currentCompany: string
  // All company accounts (for eco-operator view)
  accounts: CompanyAccount[]
  corrections: CorrectionRequest[]
}>({
  currentCompany: 'ОсОО «ТехПром»',
  accounts: [
    {
      id: 1,
      company: 'ОсОО «ТехПром»',
      inn: '01234567890123',
      balance: 0,
      status: 'Активен',
      transactions: [
        { id: 1, date: '18.01.2026', type: 'charge', calculationId: 1, calculationNumber: 'РС-2026-015', description: 'Начисление утилизационного сбора', chargeAmount: 3472, paymentAmount: 0, offsetAmount: 0, balance: -3472 },
        { id: 2, date: '25.01.2026', type: 'payment', calculationId: 1, calculationNumber: 'РС-2026-015', description: 'Оплата утилизационного сбора', chargeAmount: 0, paymentAmount: 3472, offsetAmount: 0, balance: 0 },
        { id: 3, date: '12.10.2025', type: 'charge', calculationId: 5, calculationNumber: 'РС-2025-089', description: 'Начисление утилизационного сбора', chargeAmount: 8221, paymentAmount: 0, offsetAmount: 0, balance: -8221 },
        { id: 4, date: '10.02.2026', type: 'charge', calculationId: 7, calculationNumber: 'РС-2026-379', description: 'Начисление утилизационного сбора', chargeAmount: 252180, paymentAmount: 0, offsetAmount: 0, balance: -260401 },
        { id: 5, date: '10.02.2026', type: 'payment', calculationId: 7, calculationNumber: 'РС-2026-379', description: 'Оплата утилизационного сбора', chargeAmount: 0, paymentAmount: 252180, offsetAmount: 0, balance: -8221 },
        { id: 6, date: '25.02.2026', type: 'correction', calculationId: 7, calculationNumber: 'РС-2026-379', description: 'Корректировка: переработка 10 т + вывоз 5 т', chargeAmount: 0, paymentAmount: 0, offsetAmount: 126090, balance: 117869 },
        { id: 7, date: '15.03.2026', type: 'charge', calculationId: 8, calculationNumber: 'РС-2026-385', description: 'Начисление утилизационного сбора', chargeAmount: 126090, paymentAmount: 0, offsetAmount: 0, balance: -8221 },
        { id: 8, date: '15.03.2026', type: 'offset', calculationId: 8, calculationNumber: 'РС-2026-385', description: 'Зачёт из баланса лицевого счёта', chargeAmount: 0, paymentAmount: 0, offsetAmount: 126090, balance: -8221 },
      ],
    },
    {
      id: 2,
      company: 'ОАО «СтройМаркет»',
      inn: '09876543210987',
      balance: -87390,
      status: 'Активен',
      transactions: [
        { id: 10, date: '05.01.2026', type: 'charge', calculationId: 20, calculationNumber: 'РС-2026-101', description: 'Начисление утилизационного сбора', chargeAmount: 345000, paymentAmount: 0, offsetAmount: 0, balance: -345000 },
        { id: 11, date: '12.01.2026', type: 'payment', calculationId: 20, calculationNumber: 'РС-2026-101', description: 'Оплата утилизационного сбора', chargeAmount: 0, paymentAmount: 345000, offsetAmount: 0, balance: 0 },
        { id: 12, date: '22.01.2026', type: 'charge', calculationId: 21, calculationNumber: 'РС-2026-118', description: 'Начисление утилизационного сбора', chargeAmount: 87390, paymentAmount: 0, offsetAmount: 0, balance: -87390 },
      ],
    },
    {
      id: 3,
      company: 'ОсОО «ПищеПром»',
      inn: '05432109876543',
      balance: 0,
      status: 'Активен',
      transactions: [
        { id: 20, date: '10.01.2026', type: 'charge', calculationId: 30, calculationNumber: 'РС-2026-042', description: 'Начисление утилизационного сбора', chargeAmount: 178500, paymentAmount: 0, offsetAmount: 0, balance: -178500 },
        { id: 21, date: '18.01.2026', type: 'payment', calculationId: 30, calculationNumber: 'РС-2026-042', description: 'Оплата утилизационного сбора', chargeAmount: 0, paymentAmount: 178500, offsetAmount: 0, balance: 0 },
        { id: 22, date: '30.01.2026', type: 'charge', calculationId: 31, calculationNumber: 'РС-2026-067', description: 'Начисление утилизационного сбора', chargeAmount: 94200, paymentAmount: 0, offsetAmount: 0, balance: -94200 },
        { id: 23, date: '30.01.2026', type: 'payment', calculationId: 31, calculationNumber: 'РС-2026-067', description: 'Оплата утилизационного сбора', chargeAmount: 0, paymentAmount: 94200, offsetAmount: 0, balance: 0 },
      ],
    },
    {
      id: 4,
      company: 'ИП Асанов К.Т.',
      inn: '11223344556677',
      balance: -33650,
      status: 'Активен',
      transactions: [
        { id: 30, date: '15.01.2026', type: 'charge', calculationId: 40, calculationNumber: 'РС-2026-055', description: 'Начисление утилизационного сбора', chargeAmount: 33650, paymentAmount: 0, offsetAmount: 0, balance: -33650 },
      ],
    },
    {
      id: 5,
      company: 'ОсОО «ЭкоТранс»',
      inn: '07654321098765',
      balance: 45200,
      status: 'Активен',
      transactions: [
        { id: 40, date: '20.01.2026', type: 'charge', calculationId: 50, calculationNumber: 'РС-2026-078', description: 'Начисление утилизационного сбора', chargeAmount: 210000, paymentAmount: 0, offsetAmount: 0, balance: -210000 },
        { id: 41, date: '25.01.2026', type: 'payment', calculationId: 50, calculationNumber: 'РС-2026-078', description: 'Оплата утилизационного сбора', chargeAmount: 0, paymentAmount: 210000, offsetAmount: 0, balance: 0 },
        { id: 42, date: '06.02.2026', type: 'correction', calculationId: 50, calculationNumber: 'РС-2026-078', description: 'Корректировка: переработка 8 т', chargeAmount: 0, paymentAmount: 0, offsetAmount: 45200, balance: 45200 },
      ],
    },
    {
      id: 6,
      company: 'ОсОО «КыргызИмпорт»',
      inn: '03216549870321',
      balance: 15000,
      status: 'Активен',
      transactions: [
        { id: 50, date: '08.01.2026', type: 'charge', calculationId: 60, calculationNumber: 'РС-2026-033', description: 'Начисление утилизационного сбора', chargeAmount: 520000, paymentAmount: 0, offsetAmount: 0, balance: -520000 },
        { id: 51, date: '10.01.2026', type: 'payment', calculationId: 60, calculationNumber: 'РС-2026-033', description: 'Оплата утилизационного сбора', chargeAmount: 0, paymentAmount: 535000, offsetAmount: 0, balance: 15000 },
        { id: 52, date: '01.02.2026', type: 'charge', calculationId: 61, calculationNumber: 'РС-2026-089', description: 'Начисление утилизационного сбора', chargeAmount: 15000, paymentAmount: 0, offsetAmount: 0, balance: 0 },
        { id: 53, date: '01.02.2026', type: 'offset', calculationId: 61, calculationNumber: 'РС-2026-089', description: 'Зачёт из баланса лицевого счёта', chargeAmount: 0, paymentAmount: 0, offsetAmount: 15000, balance: 0 },
        { id: 54, date: '15.02.2026', type: 'correction', calculationId: 60, calculationNumber: 'РС-2026-033', description: 'Корректировка: вывоз 3 т', chargeAmount: 0, paymentAmount: 0, offsetAmount: 15000, balance: 15000 },
      ],
    },
    {
      id: 7,
      company: 'ОсОО «АзияТрейд»',
      inn: '06543210987654',
      balance: -600512,
      status: 'Заблокирован',
      transactions: [
        { id: 60, date: '03.01.2026', type: 'charge', calculationId: 70, calculationNumber: 'РС-2026-012', description: 'Начисление утилизационного сбора', chargeAmount: 600512, paymentAmount: 0, offsetAmount: 0, balance: -600512 },
      ],
    },
  ],
  corrections: [
    {
      id: 1,
      date: '24.02.2026',
      calculationId: 7,
      calculationNumber: 'РС-2026-379',
      company: 'ОсОО «ТехПром»',
      items: [
        { group: 'group_6', subgroup: 'g6_bottles_small', volume: 500, recyclingStandard: 20, volumeToRecycle: 100, previousTransferred: 5, previousExported: 0, additionalTransferred: 10, additionalExported: 0, oldTaxableVolume: 95, newTaxableVolume: 85, rate: 9418, difference: 94180 },
        { group: 'group_1', subgroup: 'g1_corrugated_boxes', volume: 200, recyclingStandard: 30, volumeToRecycle: 60, previousTransferred: 8, previousExported: 2, additionalTransferred: 0, additionalExported: 5, oldTaxableVolume: 50, newTaxableVolume: 45, rate: 4793, difference: 23965 },
      ],
      totalCorrectionAmount: 126090,
      action: 'balance',
      status: 'Одобрена',
      documents: ['договор_переработка_пластик.pdf', 'ГТД_вывоз_картон.pdf'],
    },
  ],
})

async function fetchAll() {
  try {
    const { data } = await api.get('/accounts')
    if (Array.isArray(data)) {
      state.accounts = data
    }
  } catch { /* keep local data */ }
}

async function fetchCorrections() {
  try {
    const { data } = await api.get('/accounts/corrections')
    if (Array.isArray(data)) {
      state.corrections = data
    }
  } catch { /* keep local data */ }
}

// Helper: get current business user's account
function _getMyAccount(): CompanyAccount | undefined {
  return state.accounts.find(a => a.company === state.currentCompany)
}

// === Business-facing (single company) ===

function getCurrentBalance(): number {
  return _getMyAccount()?.balance ?? 0
}

function getTransactions(): AccountTransaction[] {
  return _getMyAccount()?.transactions ?? []
}

function getTransactionsByCalculation(calcId: number): AccountTransaction[] {
  return getTransactions().filter(t => t.calculationId === calcId)
}

function hasPositiveBalance(): boolean {
  return getCurrentBalance() > 0
}

function addCharge(calcId: number, calcNumber: string, amount: number): void {
  const acc = _getMyAccount()
  if (!acc) return
  acc.balance -= amount
  acc.transactions.push({ id: nextTxId++, date: new Date().toLocaleDateString('ru-RU'), type: 'charge', calculationId: calcId, calculationNumber: calcNumber, description: 'Начисление утилизационного сбора', chargeAmount: amount, paymentAmount: 0, offsetAmount: 0, balance: acc.balance })
  api.post(`/accounts/${acc.id}/charge`, { calculationId: calcId, amount }).catch(() => {})
}

function addPayment(calcId: number, calcNumber: string, amount: number): void {
  const acc = _getMyAccount()
  if (!acc) return
  acc.balance += amount
  acc.transactions.push({ id: nextTxId++, date: new Date().toLocaleDateString('ru-RU'), type: 'payment', calculationId: calcId, calculationNumber: calcNumber, description: 'Оплата утилизационного сбора', chargeAmount: 0, paymentAmount: amount, offsetAmount: 0, balance: acc.balance })
  api.post(`/accounts/${acc.id}/payment`, { calculationId: calcId, amount }).catch(() => {})
}

function addCorrection(calcId: number, calcNumber: string, correctionAmount: number, description: string): void {
  const acc = _getMyAccount()
  if (!acc) return
  acc.balance += correctionAmount
  acc.transactions.push({ id: nextTxId++, date: new Date().toLocaleDateString('ru-RU'), type: 'correction', calculationId: calcId, calculationNumber: calcNumber, description, chargeAmount: 0, paymentAmount: 0, offsetAmount: correctionAmount, balance: acc.balance })
}

function addOffset(calcId: number, calcNumber: string, amount: number): void {
  const acc = _getMyAccount()
  if (!acc) return
  acc.balance -= amount
  acc.transactions.push({ id: nextTxId++, date: new Date().toLocaleDateString('ru-RU'), type: 'offset', calculationId: calcId, calculationNumber: calcNumber, description: 'Зачёт из баланса лицевого счёта', chargeAmount: 0, paymentAmount: 0, offsetAmount: amount, balance: acc.balance })
}

function requestRefund(calcId: number, calcNumber: string, amount: number): void {
  const acc = _getMyAccount()
  if (!acc) return
  acc.balance -= amount
  acc.transactions.push({ id: nextTxId++, date: new Date().toLocaleDateString('ru-RU'), type: 'refund', calculationId: calcId, calculationNumber: calcNumber, description: 'Возврат денежных средств', chargeAmount: 0, paymentAmount: 0, offsetAmount: amount, balance: acc.balance })
}

function submitCorrection(data: {
  calculationId: number
  calculationNumber: string
  company: string
  comment?: string
  items: CorrectionItem[]
  totalCorrectionAmount: number
  action: 'balance' | 'refund'
  documents: string[]
}): CorrectionRequest {
  const correction: CorrectionRequest = { id: nextCorrId++, date: new Date().toLocaleDateString('ru-RU'), ...data, status: 'На рассмотрении' }
  state.corrections.unshift(correction)
  api.post(`/accounts/${_getMyAccount()?.id}/corrections`, data).catch(() => {})
  return correction
}

function approveCorrection(id: number): void {
  const corr = state.corrections.find(c => c.id === id)
  if (corr && corr.status === 'На рассмотрении') {
    corr.status = 'Одобрена'
    addCorrection(corr.calculationId, corr.calculationNumber, corr.totalCorrectionAmount, `Корректировка по расчёту ${corr.calculationNumber}`)
  }
  api.post(`/accounts/corrections/${id}/approve`).catch(() => {})
}

function rejectCorrection(id: number): void {
  const corr = state.corrections.find(c => c.id === id)
  if (corr && corr.status === 'На рассмотрении') {
    corr.status = 'Отклонена'
  }
  api.post(`/accounts/corrections/${id}/reject`).catch(() => {})
}

function getPendingCorrectionsCount(): number {
  return state.corrections.filter(c => c.status === 'На рассмотрении').length
}

// === Eco-operator-facing (all companies) ===

function getAllAccounts(): CompanyAccount[] {
  return state.accounts
}

function getAccountById(id: number): CompanyAccount | undefined {
  return state.accounts.find(a => a.id === id)
}

function getAccountsWithDebt(): CompanyAccount[] {
  return state.accounts.filter(a => a.balance < 0)
}

function getAccountsWithPositiveBalance(): CompanyAccount[] {
  return state.accounts.filter(a => a.balance > 0)
}

function getReconciliationForCalculation(calcId: number, company?: string): { charged: number; paid: number; difference: number } {
  let transactions: AccountTransaction[] = []
  if (company) {
    const acc = state.accounts.find(a => a.company === company)
    transactions = acc?.transactions.filter(t => t.calculationId === calcId) ?? []
  } else {
    transactions = getTransactions().filter(t => t.calculationId === calcId)
  }
  const charged = transactions.reduce((s, t) => s + t.chargeAmount, 0)
  const paid = transactions.reduce((s, t) => s + t.paymentAmount, 0)
  return { charged, paid, difference: charged - paid }
}

function getReconciliationForCalculationGlobal(calcId: number): { charged: number; paid: number; difference: number } {
  for (const acc of state.accounts) {
    const txs = acc.transactions.filter(t => t.calculationId === calcId)
    if (txs.length > 0) {
      const charged = txs.reduce((s, t) => s + t.chargeAmount, 0)
      const paid = txs.reduce((s, t) => s + t.paymentAmount, 0)
      return { charged, paid, difference: charged - paid }
    }
  }
  return { charged: 0, paid: 0, difference: 0 }
}

function getTotalMonthlyIncome(): number {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  let total = 0
  for (const acc of state.accounts) {
    for (const tx of acc.transactions) {
      const [d, m, y] = tx.date.split('.')
      const txDate = new Date(parseInt(y), parseInt(m) - 1, parseInt(d))
      if (txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear && tx.paymentAmount > 0) {
        total += tx.paymentAmount
      }
    }
  }
  return total
}

export const accountStore = {
  state,
  fetchAll,
  fetchCorrections,
  getCurrentBalance,
  getTransactions,
  getTransactionsByCalculation,
  hasPositiveBalance,
  addCharge,
  addPayment,
  addCorrection,
  addOffset,
  requestRefund,
  submitCorrection,
  approveCorrection,
  rejectCorrection,
  getPendingCorrectionsCount,
  getAllAccounts,
  getAccountById,
  getAccountsWithDebt,
  getAccountsWithPositiveBalance,
  getReconciliationForCalculation,
  getReconciliationForCalculationGlobal,
  getTotalMonthlyIncome,
}
