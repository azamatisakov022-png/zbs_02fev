import { reactive } from 'vue'
import api from '../api/client'
import { authStore } from './auth'

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

let nextTxId = 1
let nextCorrId = 1

const state = reactive<{
  loading: boolean
  // Current business user's company key (ОсОО «ТехПром»)
  currentCompany: string
  // All company accounts (for eco-operator view)
  accounts: CompanyAccount[]
  corrections: CorrectionRequest[]
}>({
  loading: false,
  currentCompany: '',
  accounts: [],
  corrections: [],
})

async function fetchAll() {
  state.loading = true
  try {
    const role = authStore.state.user?.role
    if (role === 'business') {
      const { data } = await api.get('/accounts/my')
      if (data && data.id) {
        // Map backend response to local CompanyAccount format
        const acc: CompanyAccount = {
          id: data.id,
          company: data.companyName || '',
          inn: data.companyInn || '',
          balance: data.balance || 0,
          status: 'Активен',
          transactions: [],
        }
        const existing = state.accounts.find(a => a.inn === acc.inn)
        if (existing) {
          existing.balance = acc.balance
        } else {
          state.accounts.unshift(acc)
        }
        state.currentCompany = acc.company
      }
    } else {
      const { data } = await api.get('/accounts')
      if (Array.isArray(data)) {
        state.accounts = data
      }
    }
  } catch { /* keep local data */ } finally {
    state.loading = false
  }
}

async function fetchCorrections() {
  try {
    const { data } = await api.get('/accounts/corrections')
    if (Array.isArray(data)) {
      state.corrections = data
    }
  } catch { /* keep local */ }
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
