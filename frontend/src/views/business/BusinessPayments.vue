<script setup lang="ts">
import { ref, computed } from 'vue'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import DataTable from '../../components/dashboard/DataTable.vue'
import { icons } from '../../utils/menuIcons'

const menuItems = [
  { id: 'dashboard', label: 'Главная', icon: icons.dashboard, route: '/business' },
  { id: 'calculator', label: 'Расчёт утильсбора', icon: icons.calculator, route: '/business/calculator' },
  { id: 'reports', label: 'Отчёты о переработке', icon: icons.report, route: '/business/reports' },
  { id: 'declarations', label: 'Декларации', icon: icons.document, route: '/business/declarations' },
  { id: 'payments', label: 'Платежи', icon: icons.payment, route: '/business/payments' },
  { id: 'documents', label: 'Документы', icon: icons.folder, route: '/business/documents' },
  { id: 'normatives', label: 'Нормативы и ставки', icon: icons.registries, route: '/business/normatives' },
  { id: 'profile', label: 'Профиль компании', icon: icons.building, route: '/business/profile' },
]

// View state
type ViewMode = 'list' | 'wizard' | 'processing' | 'success'
const viewMode = ref<ViewMode>('list')
const currentStep = ref(1)

const steps = [
  { number: 1, title: 'Выбор платежа' },
  { number: 2, title: 'Способ оплаты' },
  { number: 3, title: 'Подтверждение' },
]

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

const paymentMethods = [
  { id: 'card', name: 'Банковская карта', description: 'Visa, MasterCard, Элкарт', icon: 'card', commission: '0%' },
  { id: 'bank', name: 'Банковский перевод', description: 'По реквизитам в любом банке', icon: 'bank', commission: '0%' },
  { id: 'qr', name: 'QR-код (MBANK, O!Деньги)', description: 'Сканируйте QR в мобильном приложении', icon: 'qr', commission: '0%' },
]

// Card form
const cardNumber = ref('')
const cardExpiry = ref('')
const cardCvv = ref('')
const cardHolder = ref('')

// Company & bank data
const companyData = { name: 'ОсОО «ТехПром»', inn: '01234567890123' }
const bankRequisites = {
  recipient: 'Государственный экологический фонд КР',
  inn: '00000000000000',
  account: '1234567890123456',
  bank: 'Национальный банк КР',
  bik: '123456',
  purpose: 'Утилизационный сбор за Q1 2026, ОсОО «ТехПром», ИНН 01234567890123'
}

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
      date: now.toLocaleDateString('ru-RU'),
      time: now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
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

const formatAmount = (amount: number) => amount.toLocaleString('ru-RU') + ' сом'

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
const columns = [
  { key: 'number', label: 'Номер', width: '10%' },
  { key: 'type', label: 'Тип платежа', width: '15%' },
  { key: 'period', label: 'Период', width: '8%' },
  { key: 'amount', label: 'Сумма', width: '10%' },
  { key: 'paidAt', label: 'Дата оплаты', width: '10%' },
  { key: 'status', label: 'Статус', width: '10%' },
]

const paymentHistory = ref([
  { id: 1, number: 'ПЛ-2026-0156', type: 'Утилизационный сбор', period: 'Q4 2025', amount: '45 200 сом', paidAt: '18.01.2026', status: 'Оплачен' },
  { id: 2, number: 'ПЛ-2025-0892', type: 'Утилизационный сбор', period: 'Q3 2025', amount: '38 750 сом', paidAt: '12.10.2025', status: 'Оплачен' },
  { id: 3, number: 'ПЛ-2025-0567', type: 'Утилизационный сбор', period: 'Q2 2025', amount: '41 300 сом', paidAt: '08.07.2025', status: 'Оплачен' },
  { id: 4, number: 'ПЛ-2025-0234', type: 'Утилизационный сбор', period: 'Q1 2025', amount: '35 800 сом', paidAt: '15.04.2025', status: 'Оплачен' },
])

const getStatusClass = (status: string) => {
  switch (status) {
    case 'Оплачен': return 'bg-green-100 text-green-800'
    case 'В обработке': return 'bg-yellow-100 text-yellow-800'
    case 'Отклонён': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}
</script>

<template>
  <DashboardLayout role="business" roleTitle="Бизнес" userName="ОсОО «ТехПром»" :menuItems="menuItems">
    <!-- LIST VIEW -->
    <template v-if="viewMode === 'list'">
      <div class="content__header mb-6">
        <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b] mb-2">Платежи</h1>
        <p class="text-[#64748b]">Оплата утилизационного сбора и история платежей</p>
      </div>

      <!-- CTA Banner -->
      <div class="mb-6 bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] rounded-2xl p-6 lg:p-8 text-white relative overflow-hidden">
        <div class="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div class="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        <div class="relative flex flex-col lg:flex-row lg:items-center gap-6">
          <div class="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <svg class="w-8 h-8 lg:w-10 lg:h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <div class="flex-1">
            <h2 class="text-xl lg:text-2xl font-bold mb-2">Оплатить утилизационный сбор</h2>
            <p class="text-white/80 text-sm lg:text-base">Оплатите онлайн картой, через QR-код или получите реквизиты для банковского перевода.</p>
          </div>
          <button @click="startWizard" :disabled="!hasPendingPayments" class="flex items-center justify-center gap-2 bg-white text-[#8b5cf6] px-6 py-3 lg:px-8 lg:py-4 rounded-xl font-semibold hover:bg-purple-50 transition-colors shadow-lg flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            Оплатить сейчас
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
            <p class="font-medium text-[#1e293b]">У вас есть неоплаченные счета</p>
            <p class="text-sm text-[#64748b]">Количество: {{ pendingPayments.length }} | Сумма: <span class="font-semibold text-amber-600">{{ formatAmount(pendingPayments.reduce((s, p) => s + p.amount, 0)) }}</span></p>
          </div>
          <button @click="startWizard" class="text-amber-600 hover:text-amber-700 font-medium text-sm">Оплатить →</button>
        </div>
      </div>
      <div v-else class="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
        <div class="flex items-start gap-3">
          <div class="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <p class="font-medium text-[#1e293b]">Все платежи оплачены</p>
            <p class="text-sm text-[#64748b]">У вас нет задолженности</p>
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
          <p class="text-sm text-[#64748b] mb-1">Всего платежей</p>
          <p class="text-2xl font-bold text-[#1e293b]">16</p>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
          <p class="text-sm text-[#64748b] mb-1">Оплачено за год</p>
          <p class="text-2xl font-bold text-[#10b981]">161 050 сом</p>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
          <p class="text-sm text-[#64748b] mb-1">К оплате</p>
          <p class="text-2xl font-bold text-[#f59e0b]">{{ formatAmount(pendingPayments.reduce((s, p) => s + p.amount, 0)) }}</p>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
          <p class="text-sm text-[#64748b] mb-1">Последний платёж</p>
          <p class="text-2xl font-bold text-[#8b5cf6]">18.01.2025</p>
        </div>
      </div>

      <!-- Payment Methods -->
      <div class="bg-white rounded-2xl p-5 shadow-sm border border-[#e2e8f0] mb-6">
        <h3 class="font-semibold text-[#1e293b] mb-4 flex items-center gap-2">
          <svg class="w-5 h-5 text-[#8b5cf6]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
          Способы оплаты
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="flex items-center gap-3 p-3 bg-[#f8fafc] rounded-lg">
            <div class="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center"><svg class="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg></div>
            <div><p class="font-medium text-[#1e293b] text-sm">Банковская карта</p><p class="text-xs text-[#64748b]">Visa, MasterCard, Элкарт</p></div>
          </div>
          <div class="flex items-center gap-3 p-3 bg-[#f8fafc] rounded-lg">
            <div class="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center"><svg class="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg></div>
            <div><p class="font-medium text-[#1e293b] text-sm">QR-код</p><p class="text-xs text-[#64748b]">MBANK, O!Деньги</p></div>
          </div>
          <div class="flex items-center gap-3 p-3 bg-[#f8fafc] rounded-lg">
            <div class="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center"><svg class="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg></div>
            <div><p class="font-medium text-[#1e293b] text-sm">Банковский перевод</p><p class="text-xs text-[#64748b]">По реквизитам</p></div>
          </div>
        </div>
      </div>

      <!-- History -->
      <div class="mb-4"><h2 class="text-lg font-semibold text-[#1e293b] mb-4">История платежей</h2></div>
      <DataTable :columns="columns" :data="paymentHistory" :actions="true">
        <template #cell-number="{ value }"><span class="font-mono font-medium text-[#8b5cf6]">{{ value }}</span></template>
        <template #cell-amount="{ value }"><span class="font-semibold text-[#1e293b]">{{ value }}</span></template>
        <template #cell-status="{ value }"><span :class="['px-3 py-1 rounded-full text-xs font-medium', getStatusClass(value)]">{{ value }}</span></template>
        <template #actions>
          <div class="flex items-center justify-end gap-2">
            <button class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#3B82F6] text-white hover:bg-[#2563EB] transition-colors shadow-sm">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              Просмотреть
            </button>
            <button class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#8B5CF6] text-white hover:bg-[#7C3AED] transition-colors shadow-sm">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Скачать PDF
            </button>
          </div>
        </template>
      </DataTable>
    </template>

    <!-- WIZARD VIEW -->
    <template v-else-if="viewMode === 'wizard'">
      <div class="max-w-3xl mx-auto">
        <div class="mb-6">
          <button @click="backToList" class="flex items-center gap-2 text-[#64748b] hover:text-[#1e293b] mb-4">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Назад к списку
          </button>
          <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b]">Оплата утилизационного сбора</h1>
        </div>

        <!-- Progress -->
        <div class="bg-white rounded-2xl p-4 lg:p-6 shadow-sm border border-[#e2e8f0] mb-6">
          <div class="flex items-center justify-between">
            <template v-for="(step, index) in steps" :key="step.number">
              <button @click="goToStep(step.number)" :class="['flex items-center gap-2 lg:gap-3', step.number <= currentStep ? 'cursor-pointer' : 'cursor-not-allowed']">
                <div :class="['w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center font-semibold text-sm lg:text-base transition-colors', currentStep >= step.number ? 'bg-[#8b5cf6] text-white' : 'bg-[#e2e8f0] text-[#64748b]']">
                  <svg v-if="currentStep > step.number" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                  <span v-else>{{ step.number }}</span>
                </div>
                <span :class="['hidden sm:block text-sm lg:text-base font-medium', currentStep >= step.number ? 'text-[#1e293b]' : 'text-[#64748b]']">{{ step.title }}</span>
              </button>
              <div v-if="index < steps.length - 1" :class="['flex-1 h-1 mx-2 lg:mx-4 rounded-full', currentStep > step.number ? 'bg-[#8b5cf6]' : 'bg-[#e2e8f0]']"></div>
            </template>
          </div>
        </div>

        <!-- Steps -->
        <div class="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] overflow-hidden">
          <!-- Step 1 -->
          <div v-if="currentStep === 1" class="p-6 lg:p-8">
            <h2 class="text-xl font-semibold text-[#1e293b] mb-6">Выберите счета для оплаты</h2>
            <div class="space-y-3 mb-6">
              <div v-for="payment in pendingPayments" :key="payment.id" @click="togglePaymentSelection(payment)" :class="['p-4 rounded-xl border-2 cursor-pointer transition-all', payment.selected ? 'border-[#8b5cf6] bg-purple-50' : 'border-[#e2e8f0] hover:border-[#8b5cf6]/50']">
                <div class="flex items-center gap-4">
                  <div :class="['w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors', payment.selected ? 'border-[#8b5cf6] bg-[#8b5cf6]' : 'border-[#d1d5db]']">
                    <svg v-if="payment.selected" class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <div class="flex-1">
                    <div class="flex items-center justify-between mb-1">
                      <span class="font-mono font-medium text-[#8b5cf6]">{{ payment.number }}</span>
                      <span class="font-bold text-[#1e293b]">{{ formatAmount(payment.amount) }}</span>
                    </div>
                    <div class="flex items-center justify-between text-sm">
                      <span class="text-[#64748b]">{{ payment.type }} • {{ payment.period }}</span>
                      <span class="text-[#64748b]">Срок: {{ payment.dueDate }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="bg-gradient-to-r from-[#8b5cf6]/10 to-[#7c3aed]/10 rounded-xl p-5 border border-[#8b5cf6]/20">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-[#64748b] mb-1">Выбрано: {{ selectedPayments.length }}</p>
                  <button @click="selectAllPayments" class="text-sm text-[#8b5cf6] hover:underline">{{ pendingPayments.every(p => p.selected) ? 'Снять выбор' : 'Выбрать все' }}</button>
                </div>
                <div class="text-right">
                  <p class="text-sm text-[#64748b] mb-1">Итого</p>
                  <p class="text-2xl font-bold text-[#8b5cf6]">{{ formatAmount(totalSelectedAmount) }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 2 -->
          <div v-if="currentStep === 2" class="p-6 lg:p-8">
            <h2 class="text-xl font-semibold text-[#1e293b] mb-6">Выберите способ оплаты</h2>
            <div class="space-y-3">
              <div v-for="method in paymentMethods" :key="method.id" @click="paymentMethod = method.id as PaymentMethod" :class="['p-4 rounded-xl border-2 cursor-pointer transition-all', paymentMethod === method.id ? 'border-[#8b5cf6] bg-purple-50' : 'border-[#e2e8f0] hover:border-[#8b5cf6]/50']">
                <div class="flex items-center gap-4">
                  <div :class="['w-12 h-12 rounded-xl flex items-center justify-center', paymentMethod === method.id ? 'bg-[#8b5cf6]' : 'bg-[#f1f5f9]']">
                    <svg v-if="method.icon === 'card'" :class="['w-6 h-6', paymentMethod === method.id ? 'text-white' : 'text-[#64748b]']" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                    <svg v-if="method.icon === 'bank'" :class="['w-6 h-6', paymentMethod === method.id ? 'text-white' : 'text-[#64748b]']" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    <svg v-if="method.icon === 'qr'" :class="['w-6 h-6', paymentMethod === method.id ? 'text-white' : 'text-[#64748b]']" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                  </div>
                  <div class="flex-1">
                    <p class="font-medium text-[#1e293b]">{{ method.name }}</p>
                    <p class="text-sm text-[#64748b]">{{ method.description }}</p>
                  </div>
                  <span class="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">{{ method.commission }}</span>
                </div>
              </div>
            </div>
            <div class="mt-6 pt-4 border-t border-[#e2e8f0] flex items-center justify-between">
              <span class="text-[#64748b]">Сумма к оплате:</span>
              <span class="text-xl font-bold text-[#8b5cf6]">{{ formatAmount(totalSelectedAmount) }}</span>
            </div>
          </div>

          <!-- Step 3 -->
          <div v-if="currentStep === 3" class="p-6 lg:p-8">
            <h2 class="text-xl font-semibold text-[#1e293b] mb-6">Подтверждение платежа</h2>

            <!-- Card Form -->
            <div v-if="paymentMethod === 'card'" class="space-y-6">
              <div class="bg-gradient-to-r from-[#1e293b] to-[#334155] rounded-2xl p-6 text-white">
                <div class="flex justify-between items-start mb-8">
                  <div class="text-xs opacity-60">Банковская карта</div>
                  <svg class="w-12 h-8 text-white/80" viewBox="0 0 48 32" fill="currentColor"><circle cx="16" cy="16" r="14" fill="#EB001B" opacity="0.8"/><circle cx="32" cy="16" r="14" fill="#F79E1B" opacity="0.8"/></svg>
                </div>
                <div class="font-mono text-xl tracking-wider mb-4">{{ cardNumber ? formatCardNumber(cardNumber) : '•••• •••• •••• ••••' }}</div>
                <div class="flex justify-between text-sm">
                  <div><div class="text-xs opacity-60 mb-1">Владелец</div><div>{{ cardHolder || 'ИМЯ ФАМИЛИЯ' }}</div></div>
                  <div><div class="text-xs opacity-60 mb-1">Срок</div><div>{{ cardExpiry || 'MM/YY' }}</div></div>
                </div>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="sm:col-span-2">
                  <label class="block text-sm font-medium text-[#1e293b] mb-2">Номер карты</label>
                  <input type="text" :value="formatCardNumber(cardNumber)" @input="handleCardInput" placeholder="0000 0000 0000 0000" class="w-full px-4 py-3 border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#8b5cf6] font-mono" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-[#1e293b] mb-2">Срок действия</label>
                  <input type="text" :value="cardExpiry" @input="handleExpiryInput" placeholder="MM/YY" class="w-full px-4 py-3 border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#8b5cf6] font-mono" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-[#1e293b] mb-2">CVV</label>
                  <input type="password" v-model="cardCvv" maxlength="3" placeholder="•••" class="w-full px-4 py-3 border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#8b5cf6] font-mono" />
                </div>
                <div class="sm:col-span-2">
                  <label class="block text-sm font-medium text-[#1e293b] mb-2">Имя владельца</label>
                  <input type="text" v-model="cardHolder" placeholder="IVAN IVANOV" class="w-full px-4 py-3 border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#8b5cf6] uppercase" />
                </div>
              </div>
            </div>

            <!-- Bank Transfer -->
            <div v-if="paymentMethod === 'bank'" class="space-y-4">
              <div class="bg-[#f8fafc] rounded-xl p-5 border border-[#e2e8f0]">
                <h3 class="font-medium text-[#1e293b] mb-4">Реквизиты для оплаты</h3>
                <div class="space-y-3 text-sm">
                  <div class="flex justify-between"><span class="text-[#64748b]">Получатель:</span><span class="font-medium text-[#1e293b]">{{ bankRequisites.recipient }}</span></div>
                  <div class="flex justify-between"><span class="text-[#64748b]">ИНН:</span><span class="font-mono text-[#1e293b]">{{ bankRequisites.inn }}</span></div>
                  <div class="flex justify-between"><span class="text-[#64748b]">Счёт:</span><span class="font-mono text-[#1e293b]">{{ bankRequisites.account }}</span></div>
                  <div class="flex justify-between"><span class="text-[#64748b]">Банк:</span><span class="text-[#1e293b]">{{ bankRequisites.bank }}</span></div>
                  <div class="pt-2 border-t border-[#e2e8f0]"><span class="text-[#64748b]">Назначение:</span><p class="font-medium text-[#1e293b] mt-1">{{ bankRequisites.purpose }}</p></div>
                </div>
              </div>
              <button class="w-full flex items-center justify-center gap-2 px-4 py-3 border border-[#8b5cf6] text-[#8b5cf6] rounded-xl hover:bg-purple-50 transition-colors">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Скачать квитанцию
              </button>
            </div>

            <!-- QR -->
            <div v-if="paymentMethod === 'qr'" class="text-center">
              <div class="bg-white border-2 border-[#e2e8f0] rounded-2xl p-6 inline-block mb-4">
                <div class="w-48 h-48 bg-[#1e293b] rounded-lg flex items-center justify-center">
                  <svg class="w-40 h-40 text-white" viewBox="0 0 100 100"><rect x="10" y="10" width="25" height="25" fill="currentColor"/><rect x="65" y="10" width="25" height="25" fill="currentColor"/><rect x="10" y="65" width="25" height="25" fill="currentColor"/><rect x="15" y="15" width="15" height="15" fill="#1e293b"/><rect x="70" y="15" width="15" height="15" fill="#1e293b"/><rect x="15" y="70" width="15" height="15" fill="#1e293b"/><rect x="20" y="20" width="5" height="5" fill="currentColor"/><rect x="75" y="20" width="5" height="5" fill="currentColor"/><rect x="20" y="75" width="5" height="5" fill="currentColor"/><rect x="40" y="40" width="20" height="20" fill="currentColor"/><rect x="45" y="45" width="10" height="10" fill="#1e293b"/></svg>
                </div>
              </div>
              <p class="text-[#1e293b] font-medium mb-2">Сканируйте QR-код</p>
              <p class="text-sm text-[#64748b]">Откройте MBANK или O!Деньги</p>
            </div>

            <!-- Summary -->
            <div class="mt-6 pt-4 border-t border-[#e2e8f0]">
              <div class="bg-[#f8fafc] rounded-xl p-4">
                <div class="flex items-center justify-between mb-2"><span class="text-[#64748b]">Плательщик:</span><span class="font-medium text-[#1e293b]">{{ companyData.name }}</span></div>
                <div class="flex items-center justify-between pt-2 border-t border-[#e2e8f0]"><span class="font-medium text-[#1e293b]">Сумма:</span><span class="text-xl font-bold text-[#8b5cf6]">{{ formatAmount(totalSelectedAmount) }}</span></div>
              </div>
            </div>
          </div>

          <!-- Navigation -->
          <div class="px-6 lg:px-8 py-4 bg-[#f8fafc] border-t border-[#e2e8f0] flex flex-col sm:flex-row justify-between gap-4">
            <button v-if="currentStep > 1" @click="prevStep" class="flex items-center justify-center gap-2 px-5 py-2.5 border border-[#e2e8f0] rounded-lg text-[#64748b] hover:bg-white transition-colors">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>Назад
            </button>
            <div v-else></div>
            <div class="flex flex-col sm:flex-row gap-3">
              <button v-if="currentStep < 3" @click="nextStep" :disabled="(currentStep === 1 && !canProceedStep1) || (currentStep === 2 && !canProceedStep2)" class="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#8b5cf6] text-white rounded-lg font-medium hover:bg-[#7c3aed] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                Далее<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
              </button>
              <button v-if="currentStep === 3 && paymentMethod === 'card'" @click="processPayment" class="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#10b981] text-white rounded-lg font-medium hover:bg-[#059669] transition-colors">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>Оплатить {{ formatAmount(totalSelectedAmount) }}
              </button>
              <button v-if="currentStep === 3 && paymentMethod === 'bank'" @click="backToList" class="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#8b5cf6] text-white rounded-lg font-medium hover:bg-[#7c3aed] transition-colors">Готово</button>
              <button v-if="currentStep === 3 && paymentMethod === 'qr'" @click="processPayment" class="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#10b981] text-white rounded-lg font-medium hover:bg-[#059669] transition-colors">Я оплатил</button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- PROCESSING -->
    <template v-else-if="viewMode === 'processing'">
      <div class="max-w-md mx-auto text-center py-20">
        <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-purple-100 flex items-center justify-center">
          <svg class="w-10 h-10 text-[#8b5cf6] animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        </div>
        <h2 class="text-xl font-bold text-[#1e293b] mb-2">Обработка платежа...</h2>
        <p class="text-[#64748b]">Не закрывайте страницу</p>
      </div>
    </template>

    <!-- SUCCESS -->
    <template v-else-if="viewMode === 'success'">
      <div class="max-w-2xl mx-auto text-center py-12">
        <div class="w-24 h-24 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
          <svg class="w-12 h-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
        </div>
        <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b] mb-4">Платёж успешно проведён!</h1>
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-[#e2e8f0] mb-8">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div><p class="text-sm text-[#64748b] mb-1">Номер</p><p class="text-lg font-bold text-[#8b5cf6] font-mono">{{ paymentResult.number }}</p></div>
            <div><p class="text-sm text-[#64748b] mb-1">Сумма</p><p class="text-lg font-bold text-[#1e293b]">{{ formatAmount(totalSelectedAmount) }}</p></div>
            <div><p class="text-sm text-[#64748b] mb-1">Дата</p><p class="text-lg font-bold text-[#1e293b]">{{ paymentResult.date }} {{ paymentResult.time }}</p></div>
          </div>
        </div>
        <p class="text-[#64748b] mb-8">Квитанция отправлена на email</p>
        <div class="flex flex-col sm:flex-row justify-center gap-4">
          <button class="flex items-center justify-center gap-2 px-6 py-3 border border-[#e2e8f0] rounded-xl text-[#1e293b] hover:bg-[#f8fafc] transition-colors">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>Скачать квитанцию
          </button>
          <button @click="backToList" class="flex items-center justify-center gap-2 px-6 py-3 bg-[#8b5cf6] text-white rounded-xl font-medium hover:bg-[#7c3aed] transition-colors">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>К списку платежей
          </button>
        </div>
      </div>
    </template>
  </DashboardLayout>
</template>
