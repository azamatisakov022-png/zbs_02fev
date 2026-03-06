<script setup lang="ts">
import { AppButton, AppPageHeader, AppAlert, AppBadge, AppInfoRow } from '../../components/ui'
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import DataTable from '../../components/dashboard/DataTable.vue'
import EmptyState from '../../components/dashboard/EmptyState.vue'
import SkeletonLoader from '../../components/dashboard/SkeletonLoader.vue'
import { useAccountStore } from '../../stores/account'
import { useCalculationStore } from '../../stores/calculations'
import { useBusinessMenu } from '../../composables/useRoleMenu'
import { toastStore } from '../../stores/toast'
import { downloadElementAsPdf } from '../../utils/pdfExport'
import QRCode from 'qrcode'
import { CalcStatus } from '../../constants/statuses'
import PenaltyCalculator from '../../components/penalty/PenaltyCalculator.vue'
import { calculatePaymentDeadline } from '../../utils/dateUtils'
import { getOverdueDays, calculatePenalty } from '../../utils/penalty'
import { PAYMENT_ACCOUNTS } from '../../config/payment-accounts'
import { formatNum } from '../../utils/formatNumber'

const router = useRouter()
const { t } = useI18n()
const { roleTitle, menuItems } = useBusinessMenu()
const account = useAccountStore()
const calcStore = useCalculationStore()

const isLoading = ref(true)
onMounted(async () => {
  await account.fetchAll()
  isLoading.value = false
})

const companyName = computed(() => account.myAccount?.company || '')

const approvedCalcs = computed(() =>
  calcStore.getBusinessCalculations(companyName.value).filter(c =>
    [CalcStatus.APPROVED, CalcStatus.PAYMENT_PENDING, CalcStatus.PAID, CalcStatus.PAYMENT_REJECTED, CalcStatus.FEE_PAID, CalcStatus.PENALTY_PAID, CalcStatus.COMPLETED].includes(c.status as any)
  )
)

const totalCharged = computed(() => approvedCalcs.value.reduce((s, c) => s + c.totalAmount, 0))
const totalPaid = computed(() =>
  approvedCalcs.value.filter(c => c.status === CalcStatus.PAID || c.status === CalcStatus.COMPLETED).reduce((s, c) => s + c.totalAmount, 0)
)
const accountBalance = computed(() => totalPaid.value - totalCharged.value)

const lastPaymentDate = computed(() => {
  const paidCalcs = calcStore.getBusinessCalculations(companyName.value)
    .filter(c => c.status === CalcStatus.PAID && c.paidAt)
  if (!paidCalcs.length) return '—'
  const sorted = [...paidCalcs].sort((a, b) => {
    const [da, ma, ya] = (a.paidAt || '').split('.')
    const [db, mb, yb] = (b.paidAt || '').split('.')
    return new Date(+yb, +mb - 1, +db).getTime() - new Date(+ya, +ma - 1, +da).getTime()
  })
  return sorted[0]?.paidAt || '—'
})

const unpaidCalcs = computed(() =>
  calcStore.getBusinessCalculations(companyName.value).filter(c => c.status === CalcStatus.APPROVED)
)
const totalUnpaid = computed(() => unpaidCalcs.value.reduce((s, c) => s + c.totalAmount, 0))

const overdueCalcs = computed(() =>
  unpaidCalcs.value.filter(c => {
    const deadline = calculatePaymentDeadline(c.payerType || 'producer', {
      quarter: c.quarter,
      year: c.year,
      importDate: c.importDate,
    })
    return deadline && getOverdueDays(deadline) > 0
  })
)

const oldestOverdueDueDate = computed(() => {
  let oldest: Date | null = null
  for (const c of overdueCalcs.value) {
    const deadline = calculatePaymentDeadline(c.payerType || 'producer', {
      quarter: c.quarter,
      year: c.year,
      importDate: c.importDate,
    })
    if (deadline && (!oldest || deadline < oldest)) oldest = deadline
  }
  return oldest
})

const totalOverdueAmount = computed(() =>
  overdueCalcs.value.reduce((s, c) => s + c.totalAmount, 0)
)

const aggregatePenalty = computed(() => {
  if (!oldestOverdueDueDate.value || totalOverdueAmount.value <= 0) return null
  return calculatePenalty(totalOverdueAmount.value, oldestOverdueDueDate.value)
})

// ── BLOCK 3: Payment methods (collapsible) ──
const showPaymentMethods = ref(false)

// ── BLOCK 4: Operations history from accountStore ──
const transactions = computed(() => account.transactions)

const filterType = ref<'all' | 'charge' | 'payment'>('all')
const filterPeriod = ref<'all' | 'month' | 'quarter' | 'year'>('all')

const filteredTransactions = computed(() => {
  let result = transactions.value

  if (filterType.value !== 'all') {
    result = result.filter(t => t.type === filterType.value)
  }

  if (filterPeriod.value !== 'all') {
    const now = new Date()
    result = result.filter(t => {
      const [d, m, y] = t.date.split('.')
      const txDate = new Date(+y, +m - 1, +d)
      if (filterPeriod.value === 'month') {
        return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear()
      } else if (filterPeriod.value === 'quarter') {
        const txQ = Math.floor(txDate.getMonth() / 3)
        const nowQ = Math.floor(now.getMonth() / 3)
        return txQ === nowQ && txDate.getFullYear() === now.getFullYear()
      } else {
        return txDate.getFullYear() === now.getFullYear()
      }
    })
  }

  return result
})

const columns = computed(() => [
  { key: 'date', label: t('common.date'), width: '100px' },
  { key: 'type', label: t('common.type'), width: '120px' },
  { key: 'description', label: t('common.description'), width: undefined },
  { key: 'amount', label: t('common.amount'), width: '130px' },
  { key: 'balance', label: t('businessAccount.balance'), width: '130px' },
])

const tableData = computed(() =>
  filteredTransactions.value.map(tx => ({
    id: tx.id,
    date: tx.date,
    type: tx.type,
    typeLabel: tx.type === 'charge' ? t('businessAccount.typeCharge') : tx.type === 'payment' ? t('businessAccount.typePayment') : tx.type === 'correction' ? t('businessAccount.typeCorrection') : tx.type === 'offset' ? t('businessAccount.typeOffset') : tx.type === 'penalty' ? t('businessAccount.typePenalty') : tx.type === 'penalty_payment' ? t('businessAccount.typePenaltyPayment') : t('businessAccount.typeRefund'),
    description: tx.description,
    calculationId: tx.calculationId,
    calculationNumber: tx.calculationNumber,
    chargeAmount: tx.chargeAmount,
    paymentAmount: tx.paymentAmount,
    amount: (tx.type === 'charge' || tx.type === 'penalty') ? -tx.chargeAmount : tx.type === 'penalty_payment' ? tx.paymentAmount : tx.paymentAmount || tx.offsetAmount,
    balance: tx.balance,
  }))
)

const formatAmount = (n: number) => n.toLocaleString() + ' ' + t('common.som')

// ── Payment detail modal (for viewing past payments) ──
const showPaymentDetailModal = ref(false)
const paymentDetailData = ref<{
  calcNumber: string
  calcId: number
  date: string
  amount: number
  status: string
  paymentOrderNumber: string
  bank: string
  fileName: string | null
} | null>(null)

const openPaymentDetail = (row: any) => {
  if (row.type !== 'payment') return
  const calc = calcStore.getCalculationById(row.calculationId)
  paymentDetailData.value = {
    calcNumber: row.calculationNumber,
    calcId: row.calculationId,
    date: row.date,
    amount: row.paymentAmount,
    status: calc?.status === CalcStatus.PAID ? 'paid' : 'payment_pending',
    paymentOrderNumber: calc?.payment?.paymentOrderNumber || '—',
    bank: calc?.payment?.payerBank || '—',
    fileName: calc?.payment?.fileName || null,
  }
  showPaymentDetailModal.value = true
}

const closePaymentDetail = () => {
  showPaymentDetailModal.value = false
  paymentDetailData.value = null
}

const goToCalcFromDetail = (calcId: number) => {
  closePaymentDetail()
  router.push({ path: `/business/calculations/${calcId}`, query: { from: 'account' } })
}

const handleRowAction = (row: any) => {
  if (row.type === 'payment') {
    openPaymentDetail(row)
  } else {
    router.push({ path: `/business/calculations/${row.calculationId}`, query: { from: 'account' } })
  }
}

// ── Payment modal (for making new payments from unpaid invoices) ──
const showPaymentModal = ref(false)
const payingCalcId = ref<number | null>(null)
const payingCalc = computed(() => payingCalcId.value ? calcStore.getCalculationById(payingCalcId.value) : null)

const openPayment = (calcId: number) => {
  payingCalcId.value = calcId
  showPaymentModal.value = true
  generateQR()
}
const closePayment = () => {
  showPaymentModal.value = false
  payingCalcId.value = null
  paymentFile.value = null
  paymentFileName.value = ''
}

// Bank details — use config
const bankDetails = PAYMENT_ACCOUNTS.utilization_fee

const copyRequisites = () => {
  const c = payingCalc.value
  const text = `${t('businessAccount.recipient')}: ${bankDetails.recipient}\n${t('businessAccount.inn')}: ${bankDetails.inn}\n${t('businessAccount.bankLabel')}: ${bankDetails.bank}\n${t('businessAccount.bik')}: ${bankDetails.bik}\n${t('businessAccount.accountNumber')}: ${bankDetails.account}\n${t('businessAccount.purpose')}: ${t('businessAccount.recyclingFeeForCalc', { number: c?.number || '' })}\n${t('common.amount')}: ${c ? c.totalAmount.toLocaleString() : ''} ${t('common.som')}`
  navigator.clipboard.writeText(text)
  toastStore.show({ type: 'success', title: t('businessAccount.requisitesCopied') })
}

// Payment file upload
const paymentFile = ref<File | null>(null)
const paymentFileName = ref('')
const paymentDragOver = ref(false)

const handlePaymentFileDrop = (e: DragEvent) => {
  paymentDragOver.value = false
  const files = e.dataTransfer?.files
  if (files?.length) pickPaymentFile(files[0])
}
const handlePaymentFileSelect = (e: Event) => {
  const input = e.target as HTMLInputElement
  if (input.files?.length) pickPaymentFile(input.files[0])
}
const pickPaymentFile = (file: File) => {
  if (file.size > 10 * 1024 * 1024) {
    toastStore.show({ type: 'error', title: t('businessAccount.fileTooLarge') })
    return
  }
  paymentFile.value = file
  paymentFileName.value = file.name
}
const removePaymentFile = () => {
  paymentFile.value = null
  paymentFileName.value = ''
}

const submitPaymentConfirmation = () => {
  if (!payingCalc.value || !paymentFile.value) return
  const c = payingCalc.value
  const calc = calcStore.getCalculationById(c.id)
  if (calc) {
    ;(calc as any).status = CalcStatus.PAYMENT_PENDING
  }
  toastStore.show({ type: 'success', title: t('businessAccount.paymentDocSent'), description: t('businessAccount.ecoOperatorWillVerify') })
  closePayment()
}

// QR code
const qrDataUrl = ref('')
const generateQR = async () => {
  if (!payingCalc.value) return
  const c = payingCalc.value
  const text = `${t('businessAccount.recipient')}: ${bankDetails.recipient}\n${t('businessAccount.inn')}: ${bankDetails.inn}\n${t('businessAccount.accountNumber')}: ${bankDetails.account}\n${t('common.amount')}: ${c.totalAmount.toLocaleString()} ${t('common.som')}\n${t('businessAccount.purpose')}: ${t('businessAccount.recyclingFeeShort')} ${c.number}`
  try {
    qrDataUrl.value = await QRCode.toDataURL(text, { width: 180, margin: 2, color: { dark: '#1e293b', light: '#ffffff' } })
  } catch { qrDataUrl.value = '' }
}

// Invoice preview
const showInvoicePreview = ref(false)
const printInvoice = () => { window.print() }
const paymentDetailRef = ref<HTMLElement | null>(null)
const downloadPaymentPdf = async () => {
  const el = paymentDetailRef.value
  if (!el) return
  await downloadElementAsPdf(el, 'payment-detail.pdf')
}
</script>

<template>
  <DashboardLayout role="business" :roleTitle="roleTitle" :userName="companyName" :menuItems="menuItems">
    <AppPageHeader :title="$t('businessAccount.title')" :subtitle="$t('businessAccount.subtitle')" />

    <template v-if="isLoading">
      <div class="mb-6"><SkeletonLoader variant="card" /></div>
      <SkeletonLoader variant="table" />
    </template>

    <template v-if="!isLoading">
      <!-- BLOCK 1: Summary Cards (4 in a row) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <!-- Начислено -->
        <div class="ba-card">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
              <svg class="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <p class="ba-label">{{ $t('businessAccount.charged') }}</p>
          </div>
          <p class="ba-value font-bold">{{ formatAmount(totalCharged) }}</p>
          <p class="ba-hint mt-1">{{ $t('businessAccount.forAllTime') }}</p>
        </div>
        <!-- Оплачено -->
        <div class="ba-card">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <svg class="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
            </div>
            <p class="ba-label">{{ $t('businessAccount.paid') }}</p>
          </div>
          <p class="ba-value font-bold text-green-600">{{ formatAmount(totalPaid) }}</p>
          <p class="ba-hint mt-1">{{ $t('businessAccount.confirmed') }}</p>
        </div>
        <!-- Задолженность / Переплата -->
        <div :class="['rounded-2xl p-5 shadow-sm border', accountBalance >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200']">
          <div class="flex items-center gap-3 mb-3">
            <div :class="['w-10 h-10 rounded-xl flex items-center justify-center', accountBalance >= 0 ? 'bg-green-200' : 'bg-red-200']">
              <svg :class="['w-5 h-5', accountBalance >= 0 ? 'text-green-700' : 'text-red-700']" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <p class="ba-label">{{ accountBalance >= 0 ? $t('businessAccount.overpayment') : $t('businessAccount.debt') }}</p>
          </div>
          <p :class="['ba-value font-bold', accountBalance >= 0 ? 'text-green-700' : 'text-red-700']">{{ formatAmount(Math.abs(accountBalance)) }}</p>
          <p :class="['ba-hint-sm mt-1', accountBalance >= 0 ? 'text-green-600' : 'text-red-600']">{{ accountBalance >= 0 ? $t('businessAccount.balancePositive') : $t('businessAccount.paymentRequired') }}</p>
        </div>
        <!-- Последний платёж -->
        <div class="ba-card">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <svg class="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <p class="ba-label">{{ $t('businessAccount.lastPayment') }}</p>
          </div>
          <p class="ba-value font-bold">{{ lastPaymentDate }}</p>
          <p class="ba-hint mt-1">{{ $t('businessAccount.paymentDate') }}</p>
        </div>
      </div>

      <!-- Penalty block: aggregate overdue penalty -->
      <PenaltyCalculator
        v-if="overdueCalcs.length > 0 && oldestOverdueDueDate && totalOverdueAmount > 0"
        :debtAmount="totalOverdueAmount"
        :dueDate="oldestOverdueDueDate"
        class="mb-4"
      />
      <!-- Separate account info for debt + penalty -->
      <div v-if="aggregatePenalty && aggregatePenalty.overdueDays > 0" class="ba-penalty-box rounded-xl p-4 mb-6">
        <div class="flex justify-between py-1">
          <span class="ba-label">{{ $t('businessCalc.feeAmountLabel') }}</span>
          <span class="ba-text font-semibold">{{ totalOverdueAmount.toLocaleString() }} {{ $t('penalty.som') }} <span class="ba-hint">&rarr; {{ PAYMENT_ACCOUNTS.utilization_fee.recipient }}</span></span>
        </div>
        <div class="flex justify-between py-1">
          <span class="ba-text-danger">{{ $t('penalty.totalPenalty') }}</span>
          <span class="ba-text-danger font-semibold">{{ aggregatePenalty.totalPenalty.toLocaleString() }} {{ $t('penalty.som') }} <span class="ba-hint">&rarr; {{ PAYMENT_ACCOUNTS.penalty.recipient }}</span></span>
        </div>
        <div class="ba-penalty-total mt-1 pt-1 flex justify-between font-bold">
          <span>{{ $t('payment.grandTotal') }}</span>
          <span>{{ aggregatePenalty.totalToPay.toLocaleString() }} {{ $t('penalty.som') }}</span>
        </div>
      </div>

      <!-- BLOCK 2: Unpaid Invoices -->
      <template v-if="unpaidCalcs.length > 0">
        <AppAlert variant="warning" :title="$t('businessAccount.unpaidInvoicesWarning', { count: unpaidCalcs.length, amount: formatAmount(totalUnpaid) })" class="mb-6">
          {{ $t('businessAccount.payOnTimeWarning') }}
        </AppAlert>

        <div class="ba-card ba-card--flush">
          <div class="ba-section-header">
            <h2 class="ba-section-title">{{ $t('businessAccount.unpaidInvoices') }}</h2>
          </div>
          <!-- Desktop table -->
          <div class="hidden md:block overflow-x-auto">
            <table class="w-full ba-text">
              <thead class="ba-thead">
                <tr class="ba-thead-row">
                  <th class="px-4 py-3">{{ $t('businessAccount.calculation') }}</th>
                  <th class="px-4 py-3">{{ $t('common.period') }}</th>
                  <th class="px-4 py-3">{{ $t('common.amount') }}</th>
                  <th class="px-4 py-3">{{ $t('businessAccount.calculationDate') }}</th>
                  <th class="px-4 py-3 text-right">{{ $t('common.actions') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="c in unpaidCalcs" :key="c.id" class="ba-row-border" style="box-shadow: inset 4px 0 0 #f59e0b">
                  <td class="px-4 py-3">
                    <router-link :to="{ path: '/business/calculations/' + c.id, query: { from: 'account' } }" class="ba-calc-link font-mono font-medium text-blue-600 hover:underline">{{ c.number }}</router-link>
                  </td>
                  <td class="px-4 py-3 ba-cell-muted">{{ c.period }}</td>
                  <td class="px-4 py-3 ba-cell-bold">{{ formatNum(c.totalAmount, 0) }} {{ $t('common.som') }}</td>
                  <td class="px-4 py-3 ba-cell-muted">{{ c.date }}</td>
                  <td class="px-4 py-3 text-right">
                    <AppButton
                      variant="primary"
                      bg="#f59e0b"
                      size="sm"
                      @click="router.push('/business/calculations/' + c.id + '/payment')"
                      :icon="'<svg class=&quot;w-4 h-4&quot; fill=&quot;none&quot; viewBox=&quot;0 0 24 24&quot; stroke=&quot;currentColor&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; stroke-width=&quot;2&quot; d=&quot;M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z&quot; /></svg>'"
                      :label="$t('businessAccount.pay')"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <!-- Mobile cards -->
          <div class="md:hidden">
            <div v-for="c in unpaidCalcs" :key="'m-' + c.id" class="p-4 ba-row-border" style="border-left: 4px solid #f59e0b">
              <div class="flex justify-between items-start mb-2">
                <router-link :to="{ path: '/business/calculations/' + c.id, query: { from: 'account' } }" class="ba-calc-link font-mono font-medium text-blue-600 hover:underline">{{ c.number }}</router-link>
                <span class="ba-small-muted">{{ c.date }}</span>
              </div>
              <div class="grid grid-cols-2 gap-2 ba-text mb-3">
                <div><span class="ba-hint ba-hint-sm">{{ $t('common.period') }}</span><br>{{ c.period }}</div>
                <div><span class="ba-hint ba-hint-sm">{{ $t('common.amount') }}</span><br><strong class="ba-dark">{{ formatNum(c.totalAmount, 0) }} {{ $t('common.som') }}</strong></div>
              </div>
              <AppButton
                variant="primary"
                bg="#f59e0b"
                full-width
                @click="router.push('/business/calculations/' + c.id + '/payment')"
                :icon="'<svg class=&quot;w-4 h-4&quot; fill=&quot;none&quot; viewBox=&quot;0 0 24 24&quot; stroke=&quot;currentColor&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; stroke-width=&quot;2&quot; d=&quot;M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z&quot; /></svg>'"
                :label="$t('businessAccount.pay')"
              />
            </div>
          </div>
        </div>
      </template>

      <!-- BLOCK 3: Payment Methods (collapsible, default collapsed) -->
      <div class="ba-card ba-card--flush">
        <button @click="showPaymentMethods = !showPaymentMethods" class="ba-collapse-btn w-full px-6 py-4 flex items-center justify-between transition-colors">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
              <svg class="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
            </div>
            <h2 class="ba-section-title-sm">{{ $t('businessAccount.paymentMethods') }}</h2>
          </div>
          <svg :class="['w-5 h-5 ba-icon-muted transition-transform duration-200', showPaymentMethods ? 'rotate-180' : '']" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
        </button>
        <Transition name="collapse">
          <div v-if="showPaymentMethods" class="px-6 pb-5 ba-border-top">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <!-- Банковская карта -->
              <div class="ba-method-card flex items-start gap-3 p-4 rounded-xl">
                <div class="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                </div>
                <div>
                  <p class="ba-text font-medium ba-text-disabled">{{ $t('businessAccount.bankCard') }}</p>
                  <p class="ba-small ba-text-faint">Visa, MasterCard, {{ $t('businessAccount.elcart') }}</p>
                  <p class="ba-small text-amber-600 mt-1">{{ $t('businessAccount.comingSoonQ2') }}</p>
                </div>
              </div>
              <!-- QR-код -->
              <div class="ba-method-card flex items-start gap-3 p-4 rounded-xl">
                <div class="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                </div>
                <div>
                  <p class="ba-text font-medium ba-dark">{{ $t('businessAccount.qrCode') }}</p>
                  <p class="ba-small ba-label">{{ $t('businessAccount.qrProviders') }}</p>
                  <p class="ba-small text-amber-600 mt-1">{{ $t('businessAccount.connectionInProgress') }}</p>
                </div>
              </div>
              <!-- Банковский перевод -->
              <div class="ba-method-card flex items-start gap-3 p-4 rounded-xl">
                <div class="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                </div>
                <div>
                  <p class="ba-text font-medium ba-dark">{{ $t('businessAccount.bankTransfer') }}</p>
                  <p class="ba-small ba-label">{{ $t('businessAccount.bankTransferDesc') }}</p>
                  <div class="mt-2 ba-small ba-label space-y-0.5">
                    <p><span class="ba-icon-muted">{{ $t('businessAccount.recipient') }}:</span> {{ bankDetails.recipient }}</p>
                    <p><span class="ba-icon-muted">{{ $t('businessAccount.inn') }}:</span> <span class="font-mono">{{ bankDetails.inn }}</span></p>
                    <p><span class="ba-icon-muted">{{ $t('businessAccount.bankLabel') }}:</span> {{ bankDetails.bank }}</p>
                    <p><span class="ba-icon-muted">{{ $t('businessAccount.accountNumber') }}:</span> <span class="font-mono">{{ bankDetails.account }}</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>

      <!-- BLOCK 4: Operations History -->
      <div class="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 class="ba-section-title">{{ $t('businessAccount.operationsHistory') }}</h2>
        <div class="flex flex-wrap gap-2">
          <!-- Period filter -->
          <div class="flex gap-1 mr-2">
            <button
              v-for="opt in [{ v: 'all', l: $t('businessAccount.allTime') }, { v: 'month', l: $t('businessAccount.month') }, { v: 'quarter', l: $t('businessAccount.quarter') }, { v: 'year', l: $t('businessAccount.year') }]"
              :key="opt.v"
              @click="filterPeriod = opt.v as any"
              :class="['ba-filter-btn px-3 py-1.5 rounded-lg font-medium transition-colors', filterPeriod === opt.v ? 'bg-blue-600 text-white' : 'ba-filter-btn--inactive']"
            >{{ opt.l }}</button>
          </div>
          <!-- Type filter -->
          <div class="flex gap-1">
            <button
              v-for="opt in [{ v: 'all', l: $t('common.all') }, { v: 'charge', l: $t('businessAccount.charges') }, { v: 'payment', l: $t('businessAccount.payments') }]"
              :key="opt.v"
              @click="filterType = opt.v as any"
              :class="['ba-filter-btn px-3 py-1.5 rounded-lg font-medium transition-colors', filterType === opt.v ? 'ba-filter-btn--active-dark' : 'ba-filter-btn--inactive']"
            >{{ opt.l }}</button>
          </div>
        </div>
      </div>

      <DataTable :columns="columns" :data="tableData" :actions="true">
        <template #empty>
          <EmptyState
            :icon="'<svg class=&quot;w-10 h-10&quot; fill=&quot;none&quot; viewBox=&quot;0 0 40 40&quot; stroke=&quot;currentColor&quot; stroke-width=&quot;1.5&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; d=&quot;M20 13.33v5m0 0v5m0-5h5m-5 0h-5M35 20a15 15 0 11-30 0 15 15 0 0130 0z&quot;/></svg>'"
            :title="$t('businessAccount.noOperations')"
            :description="$t('businessAccount.noOperationsDesc')"
          />
        </template>
        <template #cell-date="{ value }">
          <span class="ba-cell-date whitespace-nowrap">{{ value }}</span>
        </template>
        <template #cell-type="{ row }">
          <AppBadge
            :variant="row.type === 'charge' ? 'danger' : row.type === 'payment' ? 'success' : row.type === 'correction' ? 'info' : row.type === 'offset' ? 'warning' : 'neutral'"
            size="sm"
          >
            <svg v-if="row.type === 'charge'" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
            <svg v-else-if="row.type === 'payment'" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
            <svg v-else class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
            {{ row.typeLabel }}
          </AppBadge>
        </template>
        <template #cell-description="{ row }">
          <div class="ba-cell-desc truncate">
            {{ row.description }}
            <router-link
              :to="{ path: '/business/calculations/' + row.calculationId, query: { from: 'account' } }"
              class="ba-small ml-1 font-mono text-blue-600 hover:underline"
            >{{ row.calculationNumber }}</router-link>
          </div>
        </template>
        <template #cell-amount="{ row }">
          <span :class="['ba-text font-semibold', row.amount > 0 ? 'text-green-600' : 'text-red-600']">
            {{ row.amount > 0 ? '+' : '' }}{{ row.amount.toLocaleString() }} {{ $t('common.som') }}
          </span>
        </template>
        <template #cell-balance="{ value }">
          <span :class="['ba-text font-bold', value > 0 ? 'text-green-600' : value < 0 ? 'text-red-600' : 'ba-icon-muted']">
            {{ value.toLocaleString() }} {{ $t('common.som') }}
          </span>
        </template>
        <template #actions="{ row }">
          <AppButton
            variant="ghost"
            size="sm"
            color="#2563eb"
            @click="handleRowAction(row)"
            :icon="'<svg class=&quot;w-3.5 h-3.5&quot; fill=&quot;none&quot; viewBox=&quot;0 0 24 24&quot; stroke=&quot;currentColor&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; stroke-width=&quot;2&quot; d=&quot;M15 12a3 3 0 11-6 0 3 3 0 016 0z&quot; /><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; stroke-width=&quot;2&quot; d=&quot;M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z&quot; /></svg>'"
            :label="row.type === 'payment' ? $t('common.details') : $t('businessAccount.open')"
          />
        </template>
      </DataTable>
    </template>

    <!-- Payment Modal (for making new payments) -->
    <Teleport to="body">
      <div v-if="showPaymentModal && payingCalc" class="pm-overlay" @click.self="closePayment">
        <div class="pm-modal">
          <!-- Header -->
          <div class="pm-header">
            <h2 class="ba-modal-title">{{ $t('businessAccount.paymentForCalc', { number: payingCalc.number }) }}</h2>
            <AppButton
              variant="icon-only"
              size="sm"
              @click="closePayment"
              :icon="'<svg class=&quot;w-5 h-5&quot; fill=&quot;none&quot; viewBox=&quot;0 0 24 24&quot; stroke=&quot;currentColor&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; stroke-width=&quot;2&quot; d=&quot;M6 18L18 6M6 6l12 12&quot; /></svg>'"
            />
          </div>

          <!-- Amount -->
          <div class="text-center py-4 ba-border-bottom">
            <p class="ba-label">{{ $t('businessAccount.amountToPay') }}</p>
            <p class="ba-amount-large font-bold mt-1">{{ payingCalc.totalAmount.toLocaleString() }} {{ $t('common.som') }}</p>
          </div>

          <div class="pm-body">
            <p class="ba-label font-semibold mb-4">{{ $t('businessAccount.choosePaymentMethod') }}:</p>

            <!-- Method 1: Bank Transfer -->
            <div class="pm-method">
              <div class="pm-method__header">
                <div class="pm-method__icon bg-blue-100 text-blue-600">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                </div>
                <div>
                  <p class="ba-text font-semibold ba-dark">{{ $t('businessAccount.bankTransfer') }}</p>
                  <p class="ba-hint">{{ $t('businessAccount.recommendedForLargeAmounts') }}</p>
                </div>
              </div>

              <div class="pm-reqs">
                <AppInfoRow :label="$t('businessAccount.recipient')" :value="bankDetails.recipient" />
                <AppInfoRow :label="$t('businessAccount.inn')" :value="bankDetails.inn" :mono="true" />
                <AppInfoRow :label="$t('businessAccount.bankLabel')" :value="bankDetails.bank" />
                <AppInfoRow :label="$t('businessAccount.bik')" :value="bankDetails.bik" :mono="true" />
                <AppInfoRow :label="$t('businessAccount.accountNumber')" :value="bankDetails.account" :mono="true" />
                <AppInfoRow :label="$t('businessAccount.purpose')" :value="$t('businessAccount.recyclingFeeForCalc', { number: payingCalc.number })" />
              </div>

              <div class="flex gap-2 mb-4">
                <AppButton
                  variant="outline"
                  size="sm"
                  @click="copyRequisites"
                  :icon="'<svg class=&quot;w-4 h-4&quot; fill=&quot;none&quot; viewBox=&quot;0 0 24 24&quot; stroke=&quot;currentColor&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; stroke-width=&quot;2&quot; d=&quot;M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3&quot; /></svg>'"
                  :label="$t('businessAccount.copyRequisites')"
                />
                <AppButton
                  variant="outline"
                  size="sm"
                  @click="showInvoicePreview = true"
                  :icon="'<svg class=&quot;w-4 h-4&quot; fill=&quot;none&quot; viewBox=&quot;0 0 24 24&quot; stroke=&quot;currentColor&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; stroke-width=&quot;2&quot; d=&quot;M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z&quot; /></svg>'"
                  :label="$t('businessAccount.downloadInvoicePdf')"
                />
              </div>

              <!-- Upload payment confirmation -->
              <p class="ba-small ba-label font-semibold mb-2">{{ $t('businessAccount.uploadConfirmationDoc') }}:</p>
              <div
                v-if="!paymentFile"
                class="pm-dropzone"
                :class="{ 'pm-dropzone--active': paymentDragOver }"
                @dragover.prevent="paymentDragOver = true"
                @dragleave="paymentDragOver = false"
                @drop.prevent="handlePaymentFileDrop"
              >
                <svg class="w-8 h-8 ba-icon-muted mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                <p class="ba-label">{{ $t('businessAccount.dragFileOr') }} <label class="text-blue-600 cursor-pointer hover:underline">{{ $t('businessAccount.selectFile') }}<input type="file" class="hidden" accept=".pdf,.jpg,.jpeg,.png" @change="handlePaymentFileSelect" /></label></p>
                <p class="ba-hint mt-1">{{ $t('businessAccount.fileFormats') }}</p>
              </div>
              <div v-else class="pm-file">
                <svg class="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span class="ba-cell-desc truncate flex-1">{{ paymentFileName }}</span>
                <AppButton
                  variant="icon-danger"
                  size="sm"
                  @click="removePaymentFile"
                  :icon="'<svg class=&quot;w-4 h-4&quot; fill=&quot;none&quot; viewBox=&quot;0 0 24 24&quot; stroke=&quot;currentColor&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; stroke-width=&quot;2&quot; d=&quot;M6 18L18 6M6 6l12 12&quot; /></svg>'"
                />
              </div>

              <AppButton
                variant="primary"
                bg="#f59e0b"
                full-width
                class="mt-3"
                @click="submitPaymentConfirmation"
                :disabled="!paymentFile"
                :label="$t('businessAccount.sendForConfirmation')"
              />
              <p class="ba-hint mt-2 text-center">{{ $t('businessAccount.ecoOperatorWillVerify') }}</p>
            </div>

            <!-- Method 2: QR Code -->
            <div class="pm-method">
              <div class="pm-method__header">
                <div class="pm-method__icon bg-purple-100 text-purple-600">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                </div>
                <div>
                  <p class="ba-text font-semibold ba-dark">{{ $t('businessAccount.qrCode') }}</p>
                  <p class="ba-hint">{{ $t('businessAccount.qrCodeDesc') }}</p>
                </div>
              </div>
              <div class="flex items-start gap-5 mt-3">
                <img v-if="qrDataUrl" :src="qrDataUrl" alt="QR-код" class="ba-qr-img rounded-lg ba-border" />
                <div class="flex-1">
                  <p class="ba-cell-desc mb-2">{{ $t('businessAccount.scanQrCode') }}</p>
                  <p class="ba-text font-semibold ba-dark mb-3">{{ $t('common.amount') }}: {{ payingCalc.totalAmount.toLocaleString() }} {{ $t('common.som') }}</p>
                  <p class="ba-hint mb-1">{{ $t('businessAccount.supportedSystems') }}:</p>
                  <p class="ba-small ba-label">{{ $t('businessAccount.qrProvidersFull') }}</p>
                  <div class="mt-3 p-2.5 bg-amber-50 border border-amber-200 rounded-lg">
                    <p class="ba-small text-amber-700">{{ $t('businessAccount.integrationInProgress') }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Method 3: Card -->
            <div class="pm-method pm-method--disabled">
              <div class="pm-method__header">
                <div class="pm-method__icon bg-gray-100 text-gray-400">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                </div>
                <div>
                  <p class="ba-text font-semibold ba-text-disabled">{{ $t('businessAccount.onlineCardPayment') }}</p>
                  <p class="ba-small ba-text-faint">Visa / MasterCard / {{ $t('businessAccount.elcart') }}</p>
                </div>
              </div>
              <div class="mt-3 p-2.5 bg-gray-50 border border-gray-200 rounded-lg">
                <p class="ba-small ba-text-disabled">{{ $t('businessAccount.acquiringComingSoon') }}</p>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="pm-footer">
            <AppButton variant="outline" @click="closePayment" :label="$t('common.close')" />
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Invoice Preview Modal (for print) -->
    <Teleport to="body">
      <div v-if="showInvoicePreview && payingCalc" class="pm-overlay" @click.self="showInvoicePreview = false">
        <div class="pm-modal pm-modal--invoice">
          <div class="pm-header">
            <h2 class="ba-modal-title">{{ $t('businessAccount.invoiceTitle') }}</h2>
            <AppButton
              variant="icon-only"
              size="sm"
              class="no-print"
              @click="showInvoicePreview = false"
              :icon="'<svg class=&quot;w-5 h-5&quot; fill=&quot;none&quot; viewBox=&quot;0 0 24 24&quot; stroke=&quot;currentColor&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; stroke-width=&quot;2&quot; d=&quot;M6 18L18 6M6 6l12 12&quot; /></svg>'"
            />
          </div>
          <div class="p-6 invoice-content">
            <div class="text-center mb-6">
              <h3 class="ba-section-title font-bold">{{ $t('businessAccount.invoiceTitleUpper') }}</h3>
              <p class="ba-label">№ {{ payingCalc.number }} от {{ payingCalc.date }}</p>
            </div>
            <div class="grid grid-cols-2 gap-6 mb-6 ba-text">
              <div>
                <p class="ba-text font-semibold mb-1">{{ $t('businessAccount.recipient') }}:</p>
                <p>{{ bankDetails.recipient }}</p>
                <p>{{ $t('businessAccount.inn') }}: {{ bankDetails.inn }}</p>
                <p>{{ bankDetails.bank }}</p>
                <p>{{ $t('businessAccount.bik') }}: {{ bankDetails.bik }}</p>
                <p>{{ $t('businessAccount.accountNumber') }}: {{ bankDetails.account }}</p>
              </div>
              <div>
                <p class="ba-text font-semibold mb-1">{{ $t('businessAccount.payer') }}:</p>
                <p>{{ payingCalc.company }}</p>
                <p>{{ $t('businessAccount.inn') }}: {{ payingCalc.inn }}</p>
                <p v-if="payingCalc.address">{{ payingCalc.address }}</p>
              </div>
            </div>
            <table class="w-full ba-text ba-border mb-4">
              <thead class="ba-thead">
                <tr>
                  <th class="ba-border px-3 py-2 text-left">#</th>
                  <th class="ba-border px-3 py-2 text-left">{{ $t('common.description') }}</th>
                  <th class="ba-border px-3 py-2 text-right">{{ $t('common.amount') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="ba-border px-3 py-2">1</td>
                  <td class="ba-border px-3 py-2">{{ $t('businessAccount.recyclingFee') }} ({{ payingCalc.period }})</td>
                  <td class="ba-border px-3 py-2 text-right font-semibold">{{ payingCalc.totalAmount.toLocaleString() }} {{ $t('common.som') }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="ba-thead">
                  <td colspan="2" class="ba-border px-3 py-2 text-right font-bold">{{ $t('businessAccount.totalToPay') }}:</td>
                  <td class="ba-border px-3 py-2 text-right font-bold ba-text-success">{{ payingCalc.totalAmount.toLocaleString() }} {{ $t('common.som') }}</td>
                </tr>
              </tfoot>
            </table>
            <p class="ba-hint">{{ $t('businessAccount.paymentPurpose') }}: {{ $t('businessAccount.recyclingFeeForCalc', { number: payingCalc.number }) }}</p>
          </div>
          <div class="pm-footer no-print">
            <AppButton variant="outline" @click="showInvoicePreview = false" :label="$t('common.close')" />
            <AppButton
              variant="primary"
              @click="printInvoice"
              :icon="'<svg class=&quot;w-4 h-4&quot; fill=&quot;none&quot; viewBox=&quot;0 0 24 24&quot; stroke=&quot;currentColor&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; stroke-width=&quot;2&quot; d=&quot;M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z&quot; /></svg>'"
              :label="$t('common.print')"
            />
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Payment Detail Modal (for viewing past payment details) -->
    <Teleport to="body">
      <Transition name="pd-fade">
        <div v-if="showPaymentDetailModal && paymentDetailData" class="pd-overlay" @click.self="closePaymentDetail">
          <Transition name="pd-scale" appear>
            <div ref="paymentDetailRef" class="pd-modal">
              <div class="pd-header">
                <h2 class="pd-title">{{ $t('businessAccount.paymentDetails') }}</h2>
                <AppButton
                  variant="icon-only"
                  size="sm"
                  @click="closePaymentDetail"
                  :icon="'<svg class=&quot;w-5 h-5&quot; fill=&quot;none&quot; viewBox=&quot;0 0 24 24&quot; stroke=&quot;currentColor&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; stroke-width=&quot;2&quot; d=&quot;M6 18L18 6M6 6l12 12&quot; /></svg>'"
                />
              </div>

              <div class="pd-grid">
                <div class="pd-field">
                  <span class="pd-label">{{ $t('businessAccount.paymentOrderNumber') }}</span>
                  <span class="pd-value font-mono">{{ paymentDetailData.paymentOrderNumber }}</span>
                </div>
                <div class="pd-field">
                  <span class="pd-label">{{ $t('businessAccount.paymentDate') }}</span>
                  <span class="pd-value">{{ paymentDetailData.date }}</span>
                </div>
                <div class="pd-field">
                  <span class="pd-label">{{ $t('businessAccount.bankLabel') }}</span>
                  <span class="pd-value">{{ paymentDetailData.bank }}</span>
                </div>
                <div class="pd-field">
                  <span class="pd-label">{{ $t('common.amount') }}</span>
                  <span class="pd-value pd-value--bold">{{ paymentDetailData.amount.toLocaleString() }} {{ $t('common.som') }}</span>
                </div>
                <div class="pd-field">
                  <span class="pd-label">{{ $t('common.status') }}</span>
                  <span class="pd-badge">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg>
                    {{ paymentDetailData.status }}
                  </span>
                </div>
                <div class="pd-field">
                  <span class="pd-label">{{ $t('businessAccount.linkedCalculation') }}</span>
                  <button class="pd-link" @click="goToCalcFromDetail(paymentDetailData.calcId)">{{ paymentDetailData.calcNumber }}</button>
                </div>
              </div>

              <div v-if="paymentDetailData.fileName" class="pd-file">
                <svg class="w-5 h-5 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <span class="ba-cell-desc">{{ paymentDetailData.fileName }}</span>
              </div>

              <div class="pd-footer">
                <AppButton
                  variant="outline"
                  @click="downloadPaymentPdf"
                  :icon="'<svg class=&quot;w-4 h-4&quot; fill=&quot;none&quot; viewBox=&quot;0 0 24 24&quot; stroke=&quot;currentColor&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; stroke-width=&quot;2&quot; d=&quot;M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4&quot; /></svg>'"
                  :label="$t('common.downloadPdf')"
                />
                <AppButton variant="outline" @click="closePaymentDetail" :label="$t('common.close')" />
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </DashboardLayout>
</template>

<style scoped>
.ba-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  border: 1px solid #e2e8f0;
}
.ba-card--flush {
  padding: 0;
  margin-bottom: 24px;
  overflow: hidden;
}
.ba-label {
  font-size: 16px;
  color: #64748b;
}
.ba-value {
  font-size: 24px;
  color: #1e293b;
}
.ba-hint {
  font-size: 14px;
  color: #94a3b8;
}
.ba-hint-sm {
  font-size: 14px;
}
.ba-text {
  font-size: 16px;
}
.ba-text-danger {
  font-size: 16px;
  color: #DC2626;
}
.ba-dark {
  color: #1e293b;
}
.ba-small {
  font-size: 14px;
}
.ba-small-muted {
  font-size: 14px;
  color: #64748b;
}
.ba-icon-muted {
  color: #94a3b8;
}
.ba-text-disabled {
  color: #9ca3af;
}
.ba-text-faint {
  color: #d1d5db;
}
.ba-text-success {
  color: #16a34a;
}
.ba-penalty-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  font-size: 16px;
}
.ba-penalty-total {
  border-top: 1px solid #e2e8f0;
  font-size: 16px;
}
.ba-section-header {
  padding: 16px 24px;
  border-bottom: 1px solid #e2e8f0;
}
.ba-section-title {
  font-size: 22px;
  font-weight: 600;
  color: #1e293b;
}
.ba-section-title-sm {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}
.ba-thead {
  background: #f8fafc;
}
.ba-thead-row {
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  color: #64748B;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.ba-row-border {
  border-bottom: 1px solid #f1f5f9;
}
.ba-calc-link {
  font-size: 16px;
}
.ba-cell-muted {
  font-size: 16px;
  color: #64748b;
}
.ba-cell-bold {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}
.ba-cell-date {
  font-size: 16px;
  color: #1e293b;
}
.ba-cell-desc {
  font-size: 16px;
  color: #374151;
}
.ba-pay-btn {
  font-size: 14px;
  background-color: #22c55e;
}
.ba-pay-btn:hover {
  background-color: #16a34a;
}
.ba-pay-btn--lg {
  font-size: 16px;
}
.ba-collapse-btn:hover {
  background: #f8fafc;
}
.ba-border-top {
  border-top: 1px solid #e2e8f0;
}
.ba-border-bottom {
  border-bottom: 1px solid #e2e8f0;
}
.ba-border {
  border: 1px solid #e2e8f0;
}
.ba-method-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}
.ba-filter-btn {
  font-size: 14px;
}
.ba-filter-btn--inactive {
  background: #f1f5f9;
  color: #64748b;
}
.ba-filter-btn--inactive:hover {
  background: #e2e8f0;
}
.ba-filter-btn--active-dark {
  background: #1e293b;
  color: white;
}
.ba-action-btn {
  font-size: 14px;
}
.ba-modal-title {
  font-size: 22px;
  font-weight: 700;
  color: #1e293b;
}
.ba-amount-large {
  font-size: 28px;
  color: #16a34a;
}
.ba-qr-img {
  width: 140px;
  height: 140px;
}
.ba-close-btn {
  font-size: 16px;
  background: #f1f5f9;
  color: #64748b;
}
.ba-close-btn:hover {
  background: #e2e8f0;
}
.ba-dark-btn {
  font-size: 16px;
  background: #1e293b;
}
.ba-dark-btn:hover {
  background: #334155;
}

/* ── Payment modal ── */
.pm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 9999;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 40px 16px;
  overflow-y: auto;
}
.pm-modal {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 640px;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
  overflow: hidden;
}
.pm-modal--invoice {
  max-width: 720px;
}
.pm-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid #e2e8f0;
}
.pm-close {
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
  border-radius: 8px;
  transition: all 0.15s;
}
.pm-close:hover { color: #1e293b; background: #f1f5f9; }
.pm-body {
  padding: 20px 24px;
  max-height: calc(100vh - 240px);
  overflow-y: auto;
}
.pm-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px 24px;
  border-top: 1px solid #e2e8f0;
}

/* Payment method cards */
.pm-method {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}
.pm-method--disabled {
  opacity: 0.6;
}
.pm-method__header {
  display: flex;
  align-items: center;
  gap: 12px;
}
.pm-method__icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* Requisites */
.pm-reqs {
  background: #f8fafc;
  border-radius: 8px;
  padding: 12px;
  margin: 12px 0;
}

/* Buttons */
.pm-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}
.pm-btn--outline {
  background: white;
  border: 1px solid #e2e8f0;
  color: #475569;
}
.pm-btn--outline:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

/* Dropzone */
.pm-dropzone {
  border: 2px dashed #d1d5db;
  border-radius: 10px;
  padding: 20px;
  text-align: center;
  transition: all 0.2s;
  cursor: pointer;
}
.pm-dropzone--active {
  border-color: #3b82f6;
  background: #eff6ff;
}

/* File row */
.pm-file {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 10px;
}

/* ── Payment Detail modal ── */
.pd-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}
.pd-modal {
  background: white;
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  padding: 24px;
  max-width: 560px;
  width: 100%;
}
.pd-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.pd-title {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
}
.pd-close {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.15s;
}
.pd-close:hover {
  background: #f1f5f9;
  color: #1e293b;
}
.pd-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}
@media (max-width: 640px) {
  .pd-grid {
    grid-template-columns: 1fr;
  }
}
.pd-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.pd-label {
  font-size: 14px;
  color: #94a3b8;
  font-weight: 500;
}
.pd-value {
  font-size: 14px;
  color: #1e293b;
}
.pd-value--bold {
  font-weight: 700;
  color: #16a34a;
}
.pd-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 15px;
  font-weight: 600;
  color: #059669;
  background: #ecfdf5;
  padding: 2px 10px;
  border-radius: 20px;
  width: fit-content;
}
.pd-link {
  font-size: 14px;
  font-weight: 600;
  color: #3b82f6;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  padding: 0;
  text-decoration: underline;
  text-decoration-style: dashed;
  text-underline-offset: 3px;
}
.pd-link:hover {
  color: #2563eb;
}
.pd-file {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  margin-bottom: 20px;
}
.pd-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}
.pd-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  border: none;
}
.pd-btn--outline {
  background: white;
  border: 1px solid #e2e8f0;
  color: #374151;
}
.pd-btn--outline:hover {
  background: #f8fafc;
}
.pd-btn--secondary {
  background: #f1f5f9;
  color: #374151;
}
.pd-btn--secondary:hover {
  background: #e2e8f0;
}

/* Animations */
.pd-fade-enter-active,
.pd-fade-leave-active {
  transition: opacity 0.2s ease;
}
.pd-fade-enter-from,
.pd-fade-leave-to {
  opacity: 0;
}
.pd-scale-enter-active {
  transition: all 0.2s ease;
}
.pd-scale-leave-active {
  transition: all 0.15s ease;
}
.pd-scale-enter-from {
  opacity: 0;
  transform: scale(0.95);
}
.pd-scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* Collapse transition */
.collapse-enter-active,
.collapse-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}
.collapse-enter-from,
.collapse-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}
.collapse-enter-to,
.collapse-leave-from {
  opacity: 1;
  max-height: 500px;
}

/* Print styles */
@media print {
  .pm-overlay { background: white !important; padding: 0 !important; }
  .pm-modal { box-shadow: none !important; max-width: 100% !important; }
  .no-print { display: none !important; }
  .pm-header { border: none !important; }
}
</style>
