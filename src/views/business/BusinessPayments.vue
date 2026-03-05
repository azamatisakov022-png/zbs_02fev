<!-- DEPRECATED: функционал перенесён в BusinessAccount.vue -->
<!-- Роут /business/payments теперь редиректит на /business/account -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import DataTable from '../../components/dashboard/DataTable.vue'
import EmptyState from '../../components/dashboard/EmptyState.vue'
import SkeletonLoader from '../../components/dashboard/SkeletonLoader.vue'
import { AppButton, AppBadge } from '../../components/ui'
import { getStatusBadgeVariant } from '../../utils/statusVariant'
import { statusI18nKey } from '../../constants/statuses'
import { useBusinessMenu } from '../../composables/useRoleMenu'
import { toastStore } from '../../stores/toast'
import { useAccountStore } from '../../stores/account'

const router = useRouter()
const { t } = useI18n()

const { roleTitle, menuItems } = useBusinessMenu()
const accountStore = useAccountStore()

const handlePrint = () => { window.print() }

// Loading state
const isLoading = ref(true)
onMounted(async () => { await accountStore.fetchAll(); isLoading.value = false })

// View state
type ViewMode = 'list' | 'wizard' | 'processing' | 'success'
const viewMode = ref<ViewMode>('list')
const currentStep = ref(1)

const steps = computed(() => [
  { number: 1, title: t('businessPayments.stepSelectPayment') },
  { number: 2, title: t('businessPayments.stepPaymentMethod') },
  { number: 3, title: t('businessPayments.stepConfirmation') },
])

// Pending payments
interface PendingPayment {
  id: number
  number: string
  type: string
  period: string
  amount: number
  dueDate: string
  isOverdue: boolean
  selected: boolean
}

const pendingPayments = ref<PendingPayment[]>([
  { id: 1, number: 'РС-2026-018', type: 'Утилизационный сбор', period: 'Q1 2026', amount: 48500, dueDate: '20.04.2026', isOverdue: false, selected: false },
])

const hasPendingPayments = computed(() => pendingPayments.value.length > 0)
const selectedPayments = computed(() => pendingPayments.value.filter(p => p.selected))
const totalSelectedAmount = computed(() => selectedPayments.value.reduce((sum, p) => sum + p.amount, 0))

const togglePaymentSelection = (payment: PendingPayment) => {
  payment.selected = !payment.selected
}

const selectAllPayments = () => {
  const allSelected = pendingPayments.value.every(p => p.selected)
  pendingPayments.value.forEach(p => p.selected = !allSelected)
}

// Payment method
type PaymentMethod = 'card' | 'bank' | 'qr' | ''
const paymentMethod = ref<PaymentMethod>('')

const paymentMethods = computed(() => [
  { id: 'card', name: t('businessPayments.methodCard'), description: t('businessPayments.methodCardDesc'), icon: 'card', commission: '0%' },
  { id: 'bank', name: t('businessPayments.methodBank'), description: t('businessPayments.methodBankDesc'), icon: 'bank', commission: '0%' },
  { id: 'qr', name: t('businessPayments.methodQr'), description: t('businessPayments.methodQrDesc'), icon: 'qr', commission: '0%' },
])

// Card form
const cardNumber = ref('')
const cardExpiry = ref('')
const cardCvv = ref('')
const cardHolder = ref('')

// Company & bank data
const companyData = computed(() => ({ name: accountStore.myAccount?.company || '', inn: accountStore.myAccount?.inn || '' }))
const bankRequisites = computed(() => ({
  recipient: 'Государственный экологический фонд КР',
  inn: '00000000000000',
  account: '1234567890123456',
  bank: 'Национальный банк КР',
  bik: '123456',
  purpose: `Утилизационный сбор за Q1 2026, ${companyData.value.name}, ИНН ${companyData.value.inn}`
}))

// Navigation
const nextStep = () => { if (currentStep.value < 3) currentStep.value++ }
const prevStep = () => { if (currentStep.value > 1) currentStep.value-- }
const goToStep = (step: number) => { if (step <= currentStep.value) currentStep.value = step }

// Payment result
const paymentResult = ref({ number: '', date: '', time: '' })

const processPayment = () => {
  viewMode.value = 'processing'
  setTimeout(() => {
    const now = new Date()
    paymentResult.value = {
      number: `ПЛ-${now.getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    }
    viewMode.value = 'success'
  }, 2000)
}

const startWizard = () => {
  currentStep.value = 1
  paymentMethod.value = ''
  pendingPayments.value.forEach(p => p.selected = true)
  viewMode.value = 'wizard'
}

const backToList = () => {
  viewMode.value = 'list'
  currentStep.value = 1
  paymentMethod.value = ''
  pendingPayments.value.forEach(p => p.selected = false)
}

// Computed
const canProceedStep1 = computed(() => selectedPayments.value.length > 0)
const canProceedStep2 = computed(() => paymentMethod.value !== '')

const formatAmount = (amount: number) => amount.toLocaleString() + ' ' + t('businessPayments.som')

const formatCardNumber = (value: string) => {
  const cleaned = value.replace(/\D/g, '').slice(0, 16)
  const groups = cleaned.match(/.{1,4}/g)
  return groups ? groups.join(' ') : cleaned
}

const handleCardInput = (e: Event) => {
  const input = e.target as HTMLInputElement
  const cleaned = input.value.replace(/\D/g, '').slice(0, 16)
  cardNumber.value = cleaned
  input.value = formatCardNumber(cleaned)
}

const handleExpiryInput = (e: Event) => {
  const input = e.target as HTMLInputElement
  let value = input.value.replace(/\D/g, '').slice(0, 4)
  if (value.length >= 2) value = value.slice(0, 2) + '/' + value.slice(2)
  cardExpiry.value = value
  input.value = value
}

// History table
const columns = computed(() => [
  { key: 'number', label: t('businessPayments.colNumber'), width: '10%' },
  { key: 'type', label: t('businessPayments.colType'), width: '15%' },
  { key: 'period', label: t('businessPayments.colPeriod'), width: '8%' },
  { key: 'amount', label: t('businessPayments.colAmount'), width: '10%' },
  { key: 'paidAt', label: t('businessPayments.colPaidAt'), width: '10%' },
  { key: 'status', label: t('businessPayments.colStatus'), width: '10%' },
])

interface PaymentRecord {
  id: number
  number: string
  type: string
  period: string
  amount: string
  paidAt: string
  status: string
  calcNumber?: string
  calcId?: number
  paymentOrderNumber?: string
  bank?: string
  fileName?: string
}

const paymentHistory = ref<PaymentRecord[]>([
  { id: 1, number: 'ПЛ-2026-0156', type: 'Утилизационный сбор', period: 'Q4 2025', amount: '45 200 сом', paidAt: '18.01.2026', status: 'Оплачен', calcNumber: 'РС-2026-015', calcId: 3, paymentOrderNumber: 'ПП-00412', bank: 'Оптима Банк', fileName: 'платёжное_поручение_0412.pdf' },
  { id: 2, number: 'ПЛ-2025-0892', type: 'Утилизационный сбор', period: 'Q3 2025', amount: '38 750 сом', paidAt: '12.10.2025', status: 'Оплачен', calcNumber: 'РС-2025-087', calcId: 2, paymentOrderNumber: 'ПП-00389', bank: 'Оптима Банк' },
  { id: 3, number: 'ПЛ-2025-0567', type: 'Утилизационный сбор', period: 'Q2 2025', amount: '41 300 сом', paidAt: '08.07.2025', status: 'Оплачен', calcNumber: 'РС-2025-054', calcId: 1, bank: 'РСК Банк' },
  { id: 4, number: 'ПЛ-2025-0234', type: 'Утилизационный сбор', period: 'Q1 2025', amount: '35 800 сом', paidAt: '15.04.2025', status: 'Оплачен', calcNumber: 'РС-2025-021', calcId: 1 },
])

// Payment detail modal
const selectedPayment = ref<PaymentRecord | null>(null)

const openPaymentDetail = (row: PaymentRecord) => {
  selectedPayment.value = row
}
const closePaymentDetail = () => {
  selectedPayment.value = null
}
const goToCalculation = (calcId: number) => {
  closePaymentDetail()
  router.push(`/business/calculations/${calcId}`)
}

</script>

<template>
  <DashboardLayout role="business" :roleTitle="roleTitle" :userName="companyData.name" :menuItems="menuItems">
    <!-- LIST VIEW -->
    <template v-if="viewMode === 'list'">
      <div class="content__header mb-6">
        <h1 class="bpay-page-title text-2xl lg:text-3xl font-bold mb-2">{{ $t('businessPayments.pageTitle') }}</h1>
        <p class="bpay-muted">{{ $t('businessPayments.pageSubtitle') }}</p>
      </div>

      <!-- CTA Banner -->
      <div class="bpay-cta-banner">
        <div class="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div class="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        <div class="relative flex flex-col lg:flex-row lg:items-center gap-6">
          <div class="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <svg class="w-8 h-8 lg:w-10 lg:h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <div class="flex-1">
            <h2 class="text-xl lg:text-2xl font-bold mb-2">{{ $t('businessPayments.ctaTitle') }}</h2>
            <p class="text-white/80 text-sm lg:text-base">{{ $t('businessPayments.ctaDesc') }}</p>
          </div>
          <button @click="startWizard" :disabled="!hasPendingPayments" class="bpay-cta-btn flex items-center justify-center gap-2 bg-white px-6 py-3 lg:px-8 lg:py-4 rounded-xl font-semibold hover:bg-purple-50 transition-colors shadow-lg flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            {{ $t('businessPayments.payNow') }}
          </button>
        </div>
      </div>

      <!-- Pending Alert -->
      <div v-if="hasPendingPayments" class="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
        <div class="flex items-start gap-3">
          <div class="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div class="flex-1">
            <p class="bpay-dark font-medium">{{ $t('businessPayments.unpaidBills') }}</p>
            <p class="bpay-muted text-sm">{{ $t('businessPayments.count') }}: {{ pendingPayments.length }} | {{ $t('businessPayments.sum') }}: <span class="font-semibold text-amber-600">{{ formatAmount(pendingPayments.reduce((s, p) => s + p.amount, 0)) }}</span></p>
          </div>
          <button @click="startWizard" class="text-amber-600 hover:text-amber-700 font-medium text-sm">{{ $t('businessPayments.payArrow') }}</button>
        </div>
      </div>
      <div v-else class="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
        <div class="flex items-start gap-3">
          <div class="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <p class="bpay-dark font-medium">{{ $t('businessPayments.allPaid') }}</p>
            <p class="bpay-muted text-sm">{{ $t('businessPayments.noDebt') }}</p>
          </div>
        </div>
      </div>

      <template v-if="isLoading">
        <div class="mb-6"><SkeletonLoader variant="card" /></div>
        <SkeletonLoader variant="table" />
      </template>

      <template v-if="!isLoading">
      <!-- Stats -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="bpay-stat-card bg-white rounded-xl p-4 shadow-sm">
          <p class="bpay-stat-label text-sm mb-1">{{ $t('businessPayments.totalPayments') }}</p>
          <p class="bpay-dark text-2xl font-bold">16</p>
        </div>
        <div class="bpay-stat-card bg-white rounded-xl p-4 shadow-sm">
          <p class="bpay-stat-label text-sm mb-1">{{ $t('businessPayments.paidForYear') }}</p>
          <p class="bpay-value-green text-2xl font-bold">161 050 {{ $t('businessPayments.som') }}</p>
        </div>
        <div class="bpay-stat-card bg-white rounded-xl p-4 shadow-sm">
          <p class="bpay-stat-label text-sm mb-1">{{ $t('businessPayments.toPay') }}</p>
          <p class="bpay-value-amber text-2xl font-bold">{{ formatAmount(pendingPayments.reduce((s, p) => s + p.amount, 0)) }}</p>
        </div>
        <div class="bpay-stat-card bg-white rounded-xl p-4 shadow-sm">
          <p class="bpay-stat-label text-sm mb-1">{{ $t('businessPayments.lastPayment') }}</p>
          <p class="bpay-value-purple text-2xl font-bold">18.01.2025</p>
        </div>
      </div>

      <!-- Payment Methods -->
      <div class="bpay-card">
        <h3 class="bpay-dark font-semibold mb-4 flex items-center gap-2">
          <svg class="bpay-icon-purple w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
          {{ $t('businessPayments.paymentMethodsTitle') }}
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="bpay-method-item flex items-center gap-3 p-3 rounded-lg">
            <div class="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center"><svg class="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg></div>
            <div><p class="bpay-dark font-medium text-sm">{{ $t('businessPayments.methodCard') }}</p><p class="bpay-muted text-xs">{{ $t('businessPayments.methodCardDesc') }}</p></div>
          </div>
          <div class="bpay-method-item flex items-center gap-3 p-3 rounded-lg">
            <div class="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center"><svg class="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg></div>
            <div><p class="bpay-dark font-medium text-sm">{{ $t('businessPayments.methodQrShort') }}</p><p class="bpay-muted text-xs">MBANK, O!Деньги</p></div>
          </div>
          <div class="bpay-method-item flex items-center gap-3 p-3 rounded-lg">
            <div class="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center"><svg class="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg></div>
            <div><p class="bpay-dark font-medium text-sm">{{ $t('businessPayments.methodBank') }}</p><p class="bpay-muted text-xs">{{ $t('businessPayments.byRequisites') }}</p></div>
          </div>
        </div>
      </div>

      <!-- History -->
      <div class="mb-4"><h2 class="bpay-dark text-lg font-semibold mb-4">{{ $t('businessPayments.paymentHistory') }}</h2></div>
      <DataTable :columns="columns" :data="paymentHistory" :actions="true">
        <template #empty>
          <EmptyState
            :icon="'<svg class=&quot;w-10 h-10&quot; fill=&quot;none&quot; viewBox=&quot;0 0 40 40&quot; stroke=&quot;currentColor&quot; stroke-width=&quot;1.5&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; d=&quot;M20 13.33v5m0 0v5m0-5h5m-5 0h-5M35 20a15 15 0 11-30 0 15 15 0 0130 0z&quot;/><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; d=&quot;M20 8.33c-1.38 0-2.5.75-2.5 1.67s1.12 1.67 2.5 1.67 2.5.75 2.5 1.66-1.12 1.67-2.5 1.67m0-6.67c.93 0 1.73.34 2.17.83M20 8.33V6.67m0 1.66v6.67m0 0v1.67m0-1.67c-.93 0-1.73-.34-2.17-.83&quot;/></svg>'"
            :title="$t('businessPayments.noPayments')"
            :description="$t('businessPayments.noPaymentsDesc')"
          />
        </template>
        <template #cell-number="{ value }"><span class="bpay-mono-purple font-mono font-medium">{{ value }}</span></template>
        <template #cell-amount="{ value }"><span class="bpay-dark font-semibold">{{ value }}</span></template>
        <template #cell-status="{ value }"><AppBadge :variant="getStatusBadgeVariant(value)">{{ $t(statusI18nKey[value] || value) }}</AppBadge></template>
        <template #actions="{ row }">
          <div class="flex items-center justify-end gap-2">
            <AppButton variant="ghost" size="sm" @click="openPaymentDetail(row)">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              {{ $t('businessPayments.view') }}
            </AppButton>
            <AppButton variant="outline" size="sm" @click="handlePrint()">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              {{ $t('businessPayments.downloadPdf') }}
            </AppButton>
          </div>
        </template>
      </DataTable>
      </template>
    </template>

    <!-- WIZARD VIEW -->
    <template v-else-if="viewMode === 'wizard'">
      <div class="max-w-6xl mx-auto">
        <div class="mb-6">
          <button @click="backToList" class="bpay-back-btn flex items-center gap-2 mb-4">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            {{ $t('businessPayments.backToList') }}
          </button>
          <h1 class="bpay-dark text-2xl lg:text-3xl font-bold">{{ $t('businessPayments.wizardTitle') }}</h1>
        </div>

        <!-- Progress -->
        <div class="bpay-card">
          <div class="flex items-center justify-between">
            <template v-for="(step, index) in steps" :key="step.number">
              <button @click="goToStep(step.number)" :class="['flex items-center gap-2 lg:gap-3', step.number <= currentStep ? 'cursor-pointer' : 'cursor-not-allowed']">
                <div :class="['w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center font-semibold text-sm lg:text-base transition-colors', currentStep >= step.number ? 'bpay-step-active' : 'bpay-step-inactive']">
                  <svg v-if="currentStep > step.number" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                  <span v-else>{{ step.number }}</span>
                </div>
                <span :class="['hidden sm:block text-sm lg:text-base font-medium', currentStep >= step.number ? 'bpay-dark' : 'bpay-muted']">{{ step.title }}</span>
              </button>
              <div v-if="index < steps.length - 1" :class="['flex-1 h-1 mx-2 lg:mx-4 rounded-full', currentStep > step.number ? 'bpay-progress-filled' : 'bpay-progress-empty']"></div>
            </template>
          </div>
        </div>

        <!-- Steps -->
        <div class="bpay-card bpay-card--flush">
          <!-- Step 1 -->
          <div v-if="currentStep === 1" class="p-6 lg:p-8">
            <h2 class="bpay-dark text-xl font-semibold mb-6">{{ $t('businessPayments.selectBills') }}</h2>
            <div class="space-y-3 mb-6">
              <div v-for="payment in pendingPayments" :key="payment.id" @click="togglePaymentSelection(payment)" :class="['p-4 rounded-xl border-2 cursor-pointer transition-all', payment.selected ? 'bpay-selectable-active' : 'bpay-selectable-idle']">
                <div class="flex items-center gap-4">
                  <div :class="['w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors', payment.selected ? 'bpay-check-active' : 'bpay-check-idle']">
                    <svg v-if="payment.selected" class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <div class="flex-1">
                    <div class="flex items-center justify-between mb-1">
                      <span class="bpay-mono-purple font-mono font-medium">{{ payment.number }}</span>
                      <span class="bpay-dark font-bold">{{ formatAmount(payment.amount) }}</span>
                    </div>
                    <div class="flex items-center justify-between text-sm">
                      <span class="bpay-muted">{{ payment.type }} • {{ payment.period }}</span>
                      <span class="bpay-muted">{{ $t('businessPayments.dueDate') }}: {{ payment.dueDate }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="bpay-summary-card">
              <div class="flex items-center justify-between">
                <div>
                  <p class="bpay-muted text-sm mb-1">{{ $t('businessPayments.selected') }}: {{ selectedPayments.length }}</p>
                  <button @click="selectAllPayments" class="bpay-link-purple text-sm hover:underline">{{ pendingPayments.every(p => p.selected) ? $t('businessPayments.deselectAll') : $t('businessPayments.selectAll') }}</button>
                </div>
                <div class="text-right">
                  <p class="bpay-muted text-sm mb-1">{{ $t('businessPayments.total') }}</p>
                  <p class="bpay-value-purple text-2xl font-bold">{{ formatAmount(totalSelectedAmount) }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 2 -->
          <div v-if="currentStep === 2" class="p-6 lg:p-8">
            <h2 class="bpay-dark text-xl font-semibold mb-6">{{ $t('businessPayments.selectPaymentMethod') }}</h2>
            <div class="space-y-3">
              <div v-for="method in paymentMethods" :key="method.id" @click="paymentMethod = method.id as PaymentMethod" :class="['p-4 rounded-xl border-2 cursor-pointer transition-all', paymentMethod === method.id ? 'bpay-selectable-active' : 'bpay-selectable-idle']">
                <div class="flex items-center gap-4">
                  <div :class="['w-12 h-12 rounded-xl flex items-center justify-center', paymentMethod === method.id ? 'bpay-method-icon-active' : 'bpay-method-icon-idle']">
                    <svg v-if="method.icon === 'card'" :class="['w-6 h-6', paymentMethod === method.id ? 'text-white' : 'bpay-muted']" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                    <svg v-if="method.icon === 'bank'" :class="['w-6 h-6', paymentMethod === method.id ? 'text-white' : 'bpay-muted']" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    <svg v-if="method.icon === 'qr'" :class="['w-6 h-6', paymentMethod === method.id ? 'text-white' : 'bpay-muted']" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                  </div>
                  <div class="flex-1">
                    <p class="bpay-dark font-medium">{{ method.name }}</p>
                    <p class="bpay-muted text-sm">{{ method.description }}</p>
                  </div>
                  <span class="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">{{ method.commission }}</span>
                </div>
              </div>
            </div>
            <div class="bpay-divider-top mt-6 pt-4 flex items-center justify-between">
              <span class="bpay-muted">{{ $t('businessPayments.amountToPay') }}:</span>
              <span class="bpay-value-purple text-xl font-bold">{{ formatAmount(totalSelectedAmount) }}</span>
            </div>
          </div>

          <!-- Step 3 -->
          <div v-if="currentStep === 3" class="p-6 lg:p-8">
            <h2 class="bpay-dark text-xl font-semibold mb-6">{{ $t('businessPayments.paymentConfirmation') }}</h2>

            <!-- Card Form -->
            <div v-if="paymentMethod === 'card'" class="space-y-6">
              <div class="bpay-total-card">
                <div class="flex justify-between items-start mb-8">
                  <div class="text-xs opacity-60">{{ $t('businessPayments.methodCard') }}</div>
                  <svg class="w-12 h-8 text-white/80" viewBox="0 0 48 32" fill="currentColor"><circle cx="16" cy="16" r="14" fill="#EB001B" opacity="0.8"/><circle cx="32" cy="16" r="14" fill="#F79E1B" opacity="0.8"/></svg>
                </div>
                <div class="font-mono text-xl tracking-wider mb-4">{{ cardNumber ? formatCardNumber(cardNumber) : '•••• •••• •••• ••••' }}</div>
                <div class="flex justify-between text-sm">
                  <div><div class="text-xs opacity-60 mb-1">{{ $t('businessPayments.cardHolder') }}</div><div>{{ cardHolder || $t('businessPayments.cardHolderPlaceholder') }}</div></div>
                  <div><div class="text-xs opacity-60 mb-1">{{ $t('businessPayments.cardExpiry') }}</div><div>{{ cardExpiry || 'MM/YY' }}</div></div>
                </div>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="sm:col-span-2">
                  <label class="bpay-label block text-sm font-medium mb-2">{{ $t('businessPayments.cardNumber') }}</label>
                  <input type="text" :value="formatCardNumber(cardNumber)" @input="handleCardInput" placeholder="0000 0000 0000 0000" class="bpay-input w-full px-4 py-3 rounded-xl font-mono" />
                </div>
                <div>
                  <label class="bpay-label block text-sm font-medium mb-2">{{ $t('businessPayments.expiryDate') }}</label>
                  <input type="text" :value="cardExpiry" @input="handleExpiryInput" placeholder="MM/YY" class="bpay-input w-full px-4 py-3 rounded-xl font-mono" />
                </div>
                <div>
                  <label class="bpay-label block text-sm font-medium mb-2">CVV</label>
                  <input type="password" v-model="cardCvv" maxlength="3" placeholder="•••" class="bpay-input w-full px-4 py-3 rounded-xl font-mono" />
                </div>
                <div class="sm:col-span-2">
                  <label class="bpay-label block text-sm font-medium mb-2">{{ $t('businessPayments.ownerName') }}</label>
                  <input type="text" v-model="cardHolder" placeholder="IVAN IVANOV" class="bpay-input w-full px-4 py-3 rounded-xl uppercase" />
                </div>
              </div>
            </div>

            <!-- Bank Transfer -->
            <div v-if="paymentMethod === 'bank'" class="space-y-4">
              <div class="bpay-panel rounded-xl p-5">
                <h3 class="bpay-dark font-medium mb-4">{{ $t('businessPayments.requisitesTitle') }}</h3>
                <div class="space-y-3 text-sm">
                  <div class="flex justify-between"><span class="bpay-muted">{{ $t('businessPayments.recipient') }}:</span><span class="bpay-dark font-medium">{{ bankRequisites.recipient }}</span></div>
                  <div class="flex justify-between"><span class="bpay-muted">{{ $t('businessPayments.inn') }}:</span><span class="bpay-dark font-mono">{{ bankRequisites.inn }}</span></div>
                  <div class="flex justify-between"><span class="bpay-muted">{{ $t('businessPayments.account') }}:</span><span class="bpay-dark font-mono">{{ bankRequisites.account }}</span></div>
                  <div class="flex justify-between"><span class="bpay-muted">{{ $t('businessPayments.bank') }}:</span><span class="bpay-dark">{{ bankRequisites.bank }}</span></div>
                  <div class="bpay-divider-top pt-2"><span class="bpay-muted">{{ $t('businessPayments.purpose') }}:</span><p class="bpay-dark font-medium mt-1">{{ bankRequisites.purpose }}</p></div>
                </div>
              </div>
              <button disabled :title="$t('businessPayments.receiptDisabledTooltip')" class="bpay-btn-disabled w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl cursor-not-allowed opacity-60">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                {{ $t('businessPayments.downloadReceipt') }}
              </button>
            </div>

            <!-- QR -->
            <div v-if="paymentMethod === 'qr'" class="text-center">
              <div class="bpay-qr-frame bg-white border-2 rounded-2xl p-6 inline-block mb-4">
                <div class="bpay-qr-bg w-48 h-48 rounded-lg flex items-center justify-center">
                  <svg class="w-40 h-40 text-white" viewBox="0 0 100 100"><rect x="10" y="10" width="25" height="25" fill="currentColor"/><rect x="65" y="10" width="25" height="25" fill="currentColor"/><rect x="10" y="65" width="25" height="25" fill="currentColor"/><rect x="15" y="15" width="15" height="15" fill="#1e293b"/><rect x="70" y="15" width="15" height="15" fill="#1e293b"/><rect x="15" y="70" width="15" height="15" fill="#1e293b"/><rect x="20" y="20" width="5" height="5" fill="currentColor"/><rect x="75" y="20" width="5" height="5" fill="currentColor"/><rect x="20" y="75" width="5" height="5" fill="currentColor"/><rect x="40" y="40" width="20" height="20" fill="currentColor"/><rect x="45" y="45" width="10" height="10" fill="#1e293b"/></svg>
                </div>
              </div>
              <p class="bpay-dark font-medium mb-2">{{ $t('businessPayments.scanQr') }}</p>
              <p class="bpay-muted text-sm">{{ $t('businessPayments.openApp') }}</p>
            </div>

            <!-- Summary -->
            <div class="bpay-divider-top mt-6 pt-4">
              <div class="bpay-panel rounded-xl p-4">
                <div class="flex items-center justify-between mb-2"><span class="bpay-muted">{{ $t('businessPayments.payer') }}:</span><span class="bpay-dark font-medium">{{ companyData.name }}</span></div>
                <div class="bpay-divider-top flex items-center justify-between pt-2"><span class="bpay-dark font-medium">{{ $t('businessPayments.sum') }}:</span><span class="bpay-value-purple text-xl font-bold">{{ formatAmount(totalSelectedAmount) }}</span></div>
              </div>
            </div>
          </div>

          <!-- Navigation -->
          <div class="bpay-nav-bar px-6 lg:px-8 py-4 flex flex-col-reverse sm:flex-row justify-between gap-3 sm:gap-4 sticky bottom-0 z-10 rounded-b-2xl">
            <AppButton v-if="currentStep > 1" variant="secondary" @click="prevStep">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>{{ $t('businessPayments.back') }}
            </AppButton>
            <div v-else></div>
            <div class="flex flex-col sm:flex-row gap-3">
              <button v-if="currentStep < 3" @click="nextStep" :disabled="(currentStep === 1 && !canProceedStep1) || (currentStep === 2 && !canProceedStep2)" class="bpay-btn-primary flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {{ $t('businessPayments.next') }}<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
              </button>
              <AppButton v-if="currentStep === 3 && paymentMethod === 'card'" variant="primary" @click="processPayment">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{{ $t('businessPayments.payBtn') }} {{ formatAmount(totalSelectedAmount) }}
              </AppButton>
              <button v-if="currentStep === 3 && paymentMethod === 'bank'" @click="backToList" class="bpay-btn-primary flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-colors">{{ $t('businessPayments.done') }}</button>
              <AppButton v-if="currentStep === 3 && paymentMethod === 'qr'" variant="primary" @click="processPayment">{{ $t('businessPayments.iPaid') }}</AppButton>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- PROCESSING -->
    <template v-else-if="viewMode === 'processing'">
      <div class="max-w-md mx-auto text-center py-20">
        <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-purple-100 flex items-center justify-center">
          <svg class="bpay-icon-purple w-10 h-10 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        </div>
        <h2 class="bpay-dark text-xl font-bold mb-2">{{ $t('businessPayments.processingPayment') }}</h2>
        <p class="bpay-muted">{{ $t('businessPayments.dontClosePage') }}</p>
      </div>
    </template>

    <!-- SUCCESS -->
    <template v-else-if="viewMode === 'success'">
      <div class="max-w-2xl mx-auto text-center py-12">
        <div class="w-24 h-24 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
          <svg class="w-12 h-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
        </div>
        <h1 class="bpay-dark text-2xl lg:text-3xl font-bold mb-4">{{ $t('businessPayments.paymentSuccess') }}</h1>
        <div class="bpay-card mb-8">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div><p class="bpay-muted text-sm mb-1">{{ $t('businessPayments.number') }}</p><p class="bpay-value-purple text-lg font-bold font-mono">{{ paymentResult.number }}</p></div>
            <div><p class="bpay-muted text-sm mb-1">{{ $t('businessPayments.sum') }}</p><p class="bpay-dark text-lg font-bold">{{ formatAmount(totalSelectedAmount) }}</p></div>
            <div><p class="bpay-muted text-sm mb-1">{{ $t('businessPayments.date') }}</p><p class="bpay-dark text-lg font-bold">{{ paymentResult.date }} {{ paymentResult.time }}</p></div>
          </div>
        </div>
        <p class="bpay-muted mb-8">{{ $t('businessPayments.receiptSentToEmail') }}</p>
        <div class="flex flex-col sm:flex-row justify-center gap-4">
          <button disabled :title="$t('businessPayments.receiptDisabledTooltip')" class="bpay-btn-disabled flex items-center justify-center gap-2 px-6 py-3 rounded-xl cursor-not-allowed opacity-60">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>{{ $t('businessPayments.downloadReceipt') }}
          </button>
          <button @click="backToList" class="bpay-btn-primary flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>{{ $t('businessPayments.toPaymentList') }}
          </button>
        </div>
      </div>
    </template>
    <!-- Payment Detail Modal -->
    <Teleport to="body">
      <Transition name="pd-fade">
        <div v-if="selectedPayment" class="pd-overlay" @click.self="closePaymentDetail">
          <Transition name="pd-scale" appear>
            <div class="pd-modal">
              <!-- Header -->
              <div class="pd-header">
                <h2 class="pd-title">{{ $t('businessPayments.paymentNum') }} {{ selectedPayment.number }}</h2>
                <button class="pd-close" @click="closePaymentDetail">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <!-- Info grid -->
              <div class="pd-grid">
                <div class="pd-field">
                  <span class="pd-label">{{ $t('businessPayments.colType') }}</span>
                  <span class="pd-value">{{ selectedPayment.type }}</span>
                </div>
                <div class="pd-field">
                  <span class="pd-label">{{ $t('businessPayments.colPeriod') }}</span>
                  <span class="pd-value">{{ selectedPayment.period }}</span>
                </div>
                <div class="pd-field">
                  <span class="pd-label">{{ $t('businessPayments.colAmount') }}</span>
                  <span class="pd-value pd-value--bold">{{ selectedPayment.amount }}</span>
                </div>
                <div class="pd-field">
                  <span class="pd-label">{{ $t('businessPayments.colPaidAt') }}</span>
                  <span class="pd-value">{{ selectedPayment.paidAt }}</span>
                </div>
                <div class="pd-field">
                  <span class="pd-label">{{ $t('businessPayments.colStatus') }}</span>
                  <span class="pd-badge">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg>
                    {{ selectedPayment.status }}
                  </span>
                </div>
                <div class="pd-field" v-if="selectedPayment.calcNumber">
                  <span class="pd-label">{{ $t('businessPayments.linkedCalc') }}</span>
                  <button class="pd-link" @click="goToCalculation(selectedPayment.calcId!)">{{ selectedPayment.calcNumber }}</button>
                </div>
                <div class="pd-field" v-if="selectedPayment.paymentOrderNumber">
                  <span class="pd-label">{{ $t('businessPayments.ppNumber') }}</span>
                  <span class="pd-value font-mono">{{ selectedPayment.paymentOrderNumber }}</span>
                </div>
                <div class="pd-field" v-if="selectedPayment.bank">
                  <span class="pd-label">{{ $t('businessPayments.bank') }}</span>
                  <span class="pd-value">{{ selectedPayment.bank }}</span>
                </div>
              </div>

              <!-- Attached file -->
              <div v-if="selectedPayment.fileName" class="pd-file">
                <svg class="bpay-icon-purple w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <span class="bpay-file-name text-sm">{{ selectedPayment.fileName }}</span>
              </div>

              <!-- Footer -->
              <div class="pd-footer">
                <button class="pd-btn pd-btn--outline" @click="handlePrint()">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  {{ $t('businessPayments.downloadPdf') }}
                </button>
                <button class="pd-btn pd-btn--secondary" @click="closePaymentDetail">{{ $t('businessPayments.close') }}</button>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </DashboardLayout>
</template>

<style scoped>
.bpay-page-title {
  color: #1e293b;
}
.bpay-dark {
  color: #1e293b;
}
.bpay-muted {
  color: #64748b;
}
.bpay-mono-purple {
  color: #8b5cf6;
}
.bpay-icon-purple {
  color: #8b5cf6;
}
.bpay-value-purple {
  color: #8b5cf6;
}
.bpay-value-green {
  color: #10b981;
}
.bpay-value-amber {
  color: #f59e0b;
}
.bpay-link-purple {
  color: #8b5cf6;
}
.bpay-cta-btn {
  color: #8b5cf6;
}
.bpay-stat-card {
  border: 1px solid #e2e8f0;
}
.bpay-stat-label {
  color: #64748b;
}
.bpay-method-item {
  background: #f8fafc;
}
.bpay-panel {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}
.bpay-divider-top {
  border-top: 1px solid #e2e8f0;
}
.bpay-back-btn {
  color: #64748b;
}
.bpay-back-btn:hover {
  color: #1e293b;
}
.bpay-step-active {
  background: #8b5cf6;
  color: white;
}
.bpay-step-inactive {
  background: #e2e8f0;
  color: #64748b;
}
.bpay-progress-filled {
  background: #8b5cf6;
}
.bpay-progress-empty {
  background: #e2e8f0;
}
.bpay-selectable-active {
  border-color: #8b5cf6;
  background: rgb(250 245 255);
}
.bpay-selectable-idle {
  border-color: #e2e8f0;
}
.bpay-selectable-idle:hover {
  border-color: rgba(139, 92, 246, 0.5);
}
.bpay-check-active {
  border-color: #8b5cf6;
  background: #8b5cf6;
}
.bpay-check-idle {
  border-color: #d1d5db;
}
.bpay-method-icon-active {
  background: #8b5cf6;
}
.bpay-method-icon-idle {
  background: #f1f5f9;
}
.bpay-label {
  color: #1e293b;
}
.bpay-input {
  border: 1px solid #e2e8f0;
}
.bpay-input:focus {
  outline: none;
  border-color: #8b5cf6;
}
.bpay-btn-primary {
  background: #8b5cf6;
  color: white;
}
.bpay-btn-primary:hover {
  background: #7c3aed;
}
.bpay-btn-disabled {
  border: 1px solid #cbd5e1;
  color: #94a3b8;
}
.bpay-nav-bar {
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}
.bpay-qr-frame {
  border-color: #e2e8f0;
}
.bpay-qr-bg {
  background: #1e293b;
}
.bpay-file-name {
  color: #374151;
}
.bpay-cta-banner {
  margin-bottom: 24px;
  background: linear-gradient(to right, #8b5cf6, #7c3aed);
  border-radius: 16px;
  padding: 24px 32px;
  color: white;
  position: relative;
  overflow: hidden;
}
@media (min-width: 1024px) {
  .bpay-cta-banner { padding: 32px; }
}
.bpay-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  border: 1px solid #e2e8f0;
  margin-bottom: 24px;
}
.bpay-card--flush {
  padding: 0;
  overflow: hidden;
}
.bpay-summary-card {
  background: linear-gradient(to right, rgba(139,92,246,0.1), rgba(124,58,237,0.1));
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(139,92,246,0.2);
}
.bpay-total-card {
  background: linear-gradient(to right, #1e293b, #334155);
  border-radius: 16px;
  padding: 24px;
  color: white;
}

@media print {
  .dashboard-layout > aside,
  .dashboard-layout > main > header,
  .lg\:hidden {
    display: none !important;
  }
  .lg\:ml-72 {
    margin-left: 0 !important;
  }
}

/* Payment Detail Modal */
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
  font-size: 12px;
  color: #94a3b8;
  font-weight: 500;
}
.pd-value {
  font-size: 14px;
  color: #1e293b;
}
.pd-value--bold {
  font-weight: 700;
  color: #8b5cf6;
}
.pd-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
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
  color: #8b5cf6;
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
  color: #7c3aed;
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
</style>
