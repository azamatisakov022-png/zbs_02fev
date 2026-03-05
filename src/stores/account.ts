import { defineStore } from 'pinia'
import api, { silentApi } from '../api/client'
import { authStore } from './auth'
import { CorrectionStatus, AccountStatus } from '../constants/statuses'
import i18n from '../i18n'
import type {
  CompanyAccount,
  AccountTransaction,
  CorrectionRequest,
  SubmitCorrectionPayload,
} from '@/types/account'
import type { CabinetDashboard } from '@/types/dashboard'

let nextTxId = 1
let nextCorrId = 1

export const useAccountStore = defineStore('account', {
  state: () => ({
    loading: false,
    currentCompany: '',
    accounts: [] as CompanyAccount[],
    corrections: [] as CorrectionRequest[],
    dashboard: null as CabinetDashboard | null,
    dashboardLoading: false,
  }),

  getters: {
    myAccount(): CompanyAccount | undefined {
      return this.accounts.find(a => a.company === this.currentCompany)
    },

    currentBalance(): number {
      return this.myAccount?.balance ?? 0
    },

    transactions(): AccountTransaction[] {
      return this.myAccount?.transactions ?? []
    },

    hasPositiveBalance(): boolean {
      return this.currentBalance > 0
    },

    pendingCorrectionsCount(): number {
      return this.corrections.filter(c => c.status === CorrectionStatus.UNDER_REVIEW).length
    },

    allAccounts(): CompanyAccount[] {
      return this.accounts
    },

    accountsWithDebt(): CompanyAccount[] {
      return this.accounts.filter(a => a.balance < 0)
    },

    accountsWithPositiveBalance(): CompanyAccount[] {
      return this.accounts.filter(a => a.balance > 0)
    },

    totalMonthlyIncome(): number {
      const now = new Date()
      const currentMonth = now.getMonth()
      const currentYear = now.getFullYear()
      let total = 0
      for (const acc of this.accounts) {
        for (const tx of acc.transactions) {
          const [d, m, y] = tx.date.split('.')
          const txDate = new Date(parseInt(y), parseInt(m) - 1, parseInt(d))
          if (txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear && tx.paymentAmount > 0) {
            total += tx.paymentAmount
          }
        }
      }
      return total
    },
  },

  actions: {
    async fetchDashboard() {
      this.dashboardLoading = true
      try {
        const { data } = await api.get('/cabinet/dashboard')
        this.dashboard = data
      } catch {
      } finally {
        this.dashboardLoading = false
      }
    },

    async fetchAll() {
      this.loading = true
      try {
        const role = authStore.state.user?.role
        if (role === 'business') {
          const { data } = await api.get('/accounts/my')
          if (data && data.id) {
            const acc: CompanyAccount = {
              id: data.id,
              company: data.companyName || '',
              inn: data.companyInn || '',
              balance: data.balance || 0,
              status: AccountStatus.ACTIVE,
              transactions: [],
            }
            const existing = this.accounts.find(a => a.inn === acc.inn)
            if (existing) {
              existing.balance = acc.balance
            } else {
              this.accounts.unshift(acc)
            }
            this.currentCompany = acc.company
          }
        } else {
          const { data } = await api.get('/accounts')
          if (Array.isArray(data)) {
            this.accounts = data
          }
        }
      } catch {
      } finally {
        this.loading = false
      }
    },

    async fetchCorrections() {
      try {
        const { data } = await api.get('/accounts/corrections')
        if (Array.isArray(data)) {
          this.corrections = data
        }
      } catch {
      }
    },

    getTransactionsByCalculation(calcId: number): AccountTransaction[] {
      return this.transactions.filter(t => t.calculationId === calcId)
    },

    getAccountById(id: number): CompanyAccount | undefined {
      return this.accounts.find(a => a.id === id)
    },

    getReconciliationForCalculation(calcId: number, company?: string): { charged: number; paid: number; difference: number } {
      let txs: AccountTransaction[] = []
      if (company) {
        const acc = this.accounts.find(a => a.company === company)
        txs = acc?.transactions.filter(t => t.calculationId === calcId) ?? []
      } else {
        txs = this.transactions.filter(t => t.calculationId === calcId)
      }
      const charged = txs.reduce((s, t) => s + t.chargeAmount, 0)
      const paid = txs.reduce((s, t) => s + t.paymentAmount, 0)
      return { charged, paid, difference: charged - paid }
    },

    getReconciliationForCalculationGlobal(calcId: number): { charged: number; paid: number; difference: number } {
      for (const acc of this.accounts) {
        const txs = acc.transactions.filter(t => t.calculationId === calcId)
        if (txs.length > 0) {
          const charged = txs.reduce((s, t) => s + t.chargeAmount, 0)
          const paid = txs.reduce((s, t) => s + t.paymentAmount, 0)
          return { charged, paid, difference: charged - paid }
        }
      }
      return { charged: 0, paid: 0, difference: 0 }
    },

    addCharge(calcId: number, calcNumber: string, amount: number) {
      const acc = this.myAccount
      if (!acc) return
      acc.balance -= amount
      acc.transactions.push({
        id: nextTxId++, date: new Date().toLocaleDateString(), type: 'charge',
        calculationId: calcId, calculationNumber: calcNumber,
        description: i18n.global.t('accountStore.chargeDescription'),
        chargeAmount: amount, paymentAmount: 0, offsetAmount: 0, balance: acc.balance,
      })
      silentApi.post(`/accounts/${acc.id}/charge`, { calculationId: calcId, amount }).catch(() => {})
    },

    addPayment(calcId: number, calcNumber: string, amount: number) {
      const acc = this.myAccount
      if (!acc) return
      acc.balance += amount
      acc.transactions.push({
        id: nextTxId++, date: new Date().toLocaleDateString(), type: 'payment',
        calculationId: calcId, calculationNumber: calcNumber,
        description: i18n.global.t('accountStore.paymentDescription'),
        chargeAmount: 0, paymentAmount: amount, offsetAmount: 0, balance: acc.balance,
      })
      silentApi.post(`/accounts/${acc.id}/payment`, { calculationId: calcId, amount }).catch(() => {})
    },

    addCorrection(calcId: number, calcNumber: string, correctionAmount: number, description: string) {
      const acc = this.myAccount
      if (!acc) return
      acc.balance += correctionAmount
      acc.transactions.push({
        id: nextTxId++, date: new Date().toLocaleDateString(), type: 'correction',
        calculationId: calcId, calculationNumber: calcNumber, description,
        chargeAmount: 0, paymentAmount: 0, offsetAmount: correctionAmount, balance: acc.balance,
      })
    },

    addOffset(calcId: number, calcNumber: string, amount: number) {
      const acc = this.myAccount
      if (!acc) return
      acc.balance -= amount
      acc.transactions.push({
        id: nextTxId++, date: new Date().toLocaleDateString(), type: 'offset',
        calculationId: calcId, calculationNumber: calcNumber,
        description: i18n.global.t('accountStore.offsetDescription'),
        chargeAmount: 0, paymentAmount: 0, offsetAmount: amount, balance: acc.balance,
      })
    },

    addPenalty(calcId: number, calcNumber: string, amount: number, overdueDays: number) {
      const acc = this.myAccount
      if (!acc) return
      acc.balance -= amount
      acc.transactions.push({
        id: nextTxId++, date: new Date().toLocaleDateString(), type: 'penalty',
        calculationId: calcId, calculationNumber: calcNumber,
        description: i18n.global.t('accountStore.penaltyDescription'),
        chargeAmount: amount, paymentAmount: 0, offsetAmount: 0, balance: acc.balance,
      })
      silentApi.post(`/accounts/${acc.id}/penalty`, { calculationId: calcId, amount, overdueDays }).catch(() => {})
    },

    addPenaltyPayment(calcId: number, calcNumber: string, amount: number) {
      const acc = this.myAccount
      if (!acc) return
      acc.balance += amount
      acc.transactions.push({
        id: nextTxId++, date: new Date().toLocaleDateString(), type: 'penalty_payment',
        calculationId: calcId, calculationNumber: calcNumber,
        description: i18n.global.t('accountStore.penaltyPaymentDescription'),
        chargeAmount: 0, paymentAmount: amount, offsetAmount: 0, balance: acc.balance,
      })
      silentApi.post(`/accounts/${acc.id}/penalty-payment`, { calculationId: calcId, amount }).catch(() => {})
    },

    requestRefund(calcId: number, calcNumber: string, amount: number) {
      const acc = this.myAccount
      if (!acc) return
      acc.balance -= amount
      acc.transactions.push({
        id: nextTxId++, date: new Date().toLocaleDateString(), type: 'refund',
        calculationId: calcId, calculationNumber: calcNumber,
        description: i18n.global.t('accountStore.refundDescription'),
        chargeAmount: 0, paymentAmount: 0, offsetAmount: amount, balance: acc.balance,
      })
    },

    submitCorrection(payload: SubmitCorrectionPayload): CorrectionRequest {
      const correction: CorrectionRequest = {
        id: nextCorrId++,
        date: new Date().toLocaleDateString(),
        ...payload,
        status: CorrectionStatus.UNDER_REVIEW,
      }
      this.corrections.unshift(correction)
      silentApi.post(`/accounts/${this.myAccount?.id}/corrections`, payload).catch(() => {})
      return correction
    },

    approveCorrection(id: number) {
      const corr = this.corrections.find(c => c.id === id)
      if (corr && corr.status === CorrectionStatus.UNDER_REVIEW) {
        corr.status = CorrectionStatus.APPROVED
        this.addCorrection(corr.calculationId, corr.calculationNumber, corr.totalCorrectionAmount, `Корректировка по расчёту ${corr.calculationNumber}`)
      }
      silentApi.post(`/accounts/corrections/${id}/approve`).catch(() => {})
    },

    rejectCorrection(id: number) {
      const corr = this.corrections.find(c => c.id === id)
      if (corr && corr.status === CorrectionStatus.UNDER_REVIEW) {
        corr.status = CorrectionStatus.REJECTED
      }
      silentApi.post(`/accounts/corrections/${id}/reject`).catch(() => {})
    },
  },
})

