<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import DataTable from '../../components/dashboard/DataTable.vue'
import { icons } from '../../utils/menuIcons'
import { productGroups, productSubgroups, type ProductSubgroup } from '../../data/product-groups'
import ProductGroupSelector from '../../components/ProductGroupSelector.vue'
import { calculationStore, type CalculationStatus, type PaymentData } from '../../stores/calculations'

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
type ViewMode = 'list' | 'wizard' | 'result' | 'payment'
const viewMode = ref<ViewMode>('list')
const currentStep = ref(1)
const totalSteps = 3

const steps = [
  { number: 1, title: 'Период и данные' },
  { number: 2, title: 'Товары и упаковка' },
  { number: 3, title: 'Результат расчёта' },
]

// Draft saved notification
const showDraftNotification = ref(false)
const showRates = ref(false)

// Form data - Step 1
const calculationQuarter = ref('')
const calculationYear = ref('2026')

// Company data (from profile - readonly)
const companyData = {
  name: 'ОсОО «ТехПром»',
  inn: '01234567890123',
  address: 'г. Бишкек, ул. Московская, 123',
  director: 'Иванов Иван Иванович',
  phone: '+996 555 123 456',
  email: 'info@techprom.kg'
}

// Form data - Step 2
interface ProductItem {
  id: number
  group: string
  subgroup: string
  tnvedCode: string
  mass: string
  rate: number
  amount: number
}

const productItems = ref<ProductItem[]>([
  { id: 1, group: '', subgroup: '', tnvedCode: '', mass: '', rate: 0, amount: 0 }
])

let nextProductId = 2

const addProductItem = () => {
  productItems.value.push({
    id: nextProductId++,
    group: '',
    subgroup: '',
    tnvedCode: '',
    mass: '',
    rate: 0,
    amount: 0
  })
}

const removeProductItem = (id: number) => {
  if (productItems.value.length > 1) {
    productItems.value = productItems.value.filter(item => item.id !== id)
  }
}

const updateItemRate = (item: ProductItem) => {
  const group = productGroups.find(g => g.value === item.group)
  if (!group) {
    item.rate = 0
    item.amount = 0
    item.tnvedCode = ''
    return
  }

  let multiplier = 1
  item.tnvedCode = group.code

  if (item.subgroup) {
    const subgroups = productSubgroups[item.group]
    const sub = subgroups?.find(s => s.value === item.subgroup)
    if (sub) {
      item.tnvedCode = sub.code
      multiplier = sub.rateMultiplier
    }
  }

  item.rate = Math.round(group.baseRate * multiplier)
  calculateAmount(item)
}

const calculateAmount = (item: ProductItem) => {
  const mass = parseFloat(item.mass) || 0
  item.amount = Math.round(mass * item.rate)
}

const getSubgroupsForGroup = (group: string) => {
  return productSubgroups[group] || []
}

// Import from declaration mock
const importFromDeclaration = () => {
  productItems.value = [
    { id: nextProductId++, group: 'group_6', subgroup: 'g6_bottles_small', tnvedCode: '3923', mass: '12.5', rate: 8500, amount: 106250 },
    { id: nextProductId++, group: 'group_1', subgroup: 'g1_corrugated_boxes', tnvedCode: '4819 10', mass: '8.3', rate: 4200, amount: 34860 },
    { id: nextProductId++, group: 'group_8', subgroup: 'g8_bottles_clear', tnvedCode: '7010', mass: '5.2', rate: 2800, amount: 14560 },
  ]
}

// Computed
const canProceedStep1 = computed(() => {
  return calculationQuarter.value && calculationYear.value
})

const canProceedStep2 = computed(() => {
  return productItems.value.some(item => item.group && item.mass && parseFloat(item.mass) > 0)
})

const totalMass = computed(() => {
  return productItems.value
    .reduce((sum, item) => sum + (parseFloat(item.mass) || 0), 0)
    .toFixed(2)
})

const totalAmount = computed(() => {
  return productItems.value.reduce((sum, item) => sum + item.amount, 0)
})

const formattedTotalAmount = computed(() => {
  return totalAmount.value.toLocaleString('ru-RU') + ' сом'
})

const getGroupLabel = (value: string) => {
  return productGroups.find(g => g.value === value)?.label || value
}

const getSubgroupLabel = (group: string, subgroup: string) => {
  return productSubgroups[group]?.find(s => s.value === subgroup)?.label || subgroup
}

// Navigation
const nextStep = () => {
  if (currentStep.value < totalSteps) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const goToStep = (step: number) => {
  if (step <= currentStep.value) {
    currentStep.value = step
  }
}

// Result
const calculationResult = ref({
  number: '',
  date: '',
  dueDate: ''
})

const performCalculation = () => {
  const now = new Date()
  const num = String(Math.floor(Math.random() * 900) + 100)
  const dueDate = new Date(now)
  dueDate.setDate(dueDate.getDate() + 30)

  calculationResult.value = {
    number: `РС-${now.getFullYear()}-${num}`,
    date: now.toLocaleDateString('ru-RU'),
    dueDate: dueDate.toLocaleDateString('ru-RU')
  }
  currentStep.value = 3
}

const startWizard = () => {
  currentStep.value = 1
  viewMode.value = 'wizard'
}

const backToList = () => {
  viewMode.value = 'list'
  currentStep.value = 1
  calculationQuarter.value = ''
  productItems.value = [{ id: 1, group: '', subgroup: '', tnvedCode: '', mass: '', rate: 0, amount: 0 }]
}

const createDeclaration = () => {
  alert('Создание декларации на основе расчёта')
}

// Watch for changes in mass to recalculate
watch(productItems, () => {
  productItems.value.forEach(item => {
    if (item.group && item.mass) {
      calculateAmount(item)
    }
  })
}, { deep: true })

// Table data for history
const columns = [
  { key: 'number', label: 'Номер', width: '10%' },
  { key: 'period', label: 'Период', width: '8%' },
  { key: 'amount', label: 'Сумма', width: '12%' },
  { key: 'createdAt', label: 'Дата расчёта', width: '10%' },
  { key: 'status', label: 'Статус', width: '12%' },
]

const calculations = computed(() => {
  return calculationStore.getBusinessCalculations(companyData.name).map(c => ({
    id: c.id,
    number: c.number,
    period: c.period,
    amount: c.totalAmount.toLocaleString('ru-RU') + ' сом',
    createdAt: c.date,
    status: c.status,
    rejectionReason: c.rejectionReason,
    paymentRejectionReason: c.paymentRejectionReason,
    totalAmount: c.totalAmount,
  }))
})

const getStatusClass = (status: string) => {
  switch (status) {
    case 'Черновик': return 'bg-gray-100 text-gray-800'
    case 'На проверке': return 'bg-yellow-100 text-yellow-800'
    case 'Принято': return 'bg-green-100 text-green-800'
    case 'Отклонено': return 'bg-red-100 text-red-800'
    case 'Оплата на проверке': return 'bg-purple-100 text-purple-800'
    case 'Оплачено': return 'bg-blue-100 text-blue-800'
    case 'Оплата отклонена': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

// Save as draft
const saveDraft = () => {
  const now = new Date()
  const num = String(Math.floor(Math.random() * 900) + 100)
  const calcData = {
    number: calculationResult.value.number || `РС-${now.getFullYear()}-${num}`,
    date: calculationResult.value.date || now.toLocaleDateString('ru-RU'),
    company: companyData.name,
    inn: companyData.inn,
    quarter: calculationQuarter.value,
    year: calculationYear.value,
    items: productItems.value.filter(i => i.group && i.mass).map(i => ({ ...i })),
    totalAmount: totalAmount.value,
  }
  calculationStore.addCalculation(calcData, 'Черновик')
  viewMode.value = 'list'
  currentStep.value = 1
  showDraftNotification.value = true
  setTimeout(() => { showDraftNotification.value = false }, 4000)
}

// Submit for review
const submitForReview = () => {
  if (!confirm('Отправить расчёт на проверку Эко Оператору? После отправки редактирование будет недоступно.')) return
  const now = new Date()
  const num = String(Math.floor(Math.random() * 900) + 100)
  const calcData = {
    number: calculationResult.value.number || `РС-${now.getFullYear()}-${num}`,
    date: calculationResult.value.date || now.toLocaleDateString('ru-RU'),
    company: companyData.name,
    inn: companyData.inn,
    quarter: calculationQuarter.value,
    year: calculationYear.value,
    items: productItems.value.filter(i => i.group && i.mass).map(i => ({ ...i })),
    totalAmount: totalAmount.value,
  }
  calculationStore.addCalculation(calcData, 'На проверке')
  viewMode.value = 'result'
}

// Resubmit rejected calculation
const resubmitCalculation = (id: number) => {
  if (!confirm('Отправить расчёт повторно на проверку?')) return
  calculationStore.resubmitCalculation(id)
}

// Payment confirmation form
const paymentCalcId = ref<number | null>(null)
const paymentCalcAmount = ref(0)
const paymentCalcNumber = ref('')
const paymentForm = ref({
  paymentOrderNumber: '',
  paymentDate: '',
  payerBank: '',
  transferAmount: '',
  comment: '',
})
const paymentFile = ref<{ name: string; type: string; dataUrl: string } | null>(null)
const paymentDragOver = ref(false)
const paymentAmountError = ref('')

const openPaymentForm = (calcId: number, calcAmount: number, calcNumber: string) => {
  paymentCalcId.value = calcId
  paymentCalcAmount.value = calcAmount
  paymentCalcNumber.value = calcNumber
  paymentForm.value = { paymentOrderNumber: '', paymentDate: '', payerBank: '', transferAmount: '', comment: '' }
  paymentFile.value = null
  paymentAmountError.value = ''
  viewMode.value = 'payment'
}

const canSubmitPayment = computed(() => {
  return paymentForm.value.paymentOrderNumber.trim()
    && paymentForm.value.paymentDate
    && paymentForm.value.payerBank.trim()
    && paymentForm.value.transferAmount
    && paymentFile.value
    && !paymentAmountError.value
})

const validatePaymentAmount = () => {
  const amount = parseFloat(paymentForm.value.transferAmount)
  if (!amount) {
    paymentAmountError.value = ''
    return
  }
  if (amount !== paymentCalcAmount.value) {
    paymentAmountError.value = `Сумма не совпадает с суммой расчёта (${paymentCalcAmount.value.toLocaleString('ru-RU')} сом)`
  } else {
    paymentAmountError.value = ''
  }
}

const handlePaymentFileDrop = (e: DragEvent) => {
  paymentDragOver.value = false
  const file = e.dataTransfer?.files[0]
  if (file) processPaymentFile(file)
}

const handlePaymentFileSelect = (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) processPaymentFile(file)
}

const processPaymentFile = (file: File) => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png']
  if (!allowedTypes.includes(file.type)) {
    alert('Допустимые форматы: PDF, JPG, PNG')
    return
  }
  if (file.size > 10 * 1024 * 1024) {
    alert('Максимальный размер файла: 10 МБ')
    return
  }
  const reader = new FileReader()
  reader.onload = () => {
    paymentFile.value = {
      name: file.name,
      type: file.type,
      dataUrl: reader.result as string,
    }
  }
  reader.readAsDataURL(file)
}

const removePaymentFile = () => {
  paymentFile.value = null
}

const submitPayment = () => {
  if (!paymentCalcId.value || !paymentFile.value) return
  const payment: PaymentData = {
    paymentOrderNumber: paymentForm.value.paymentOrderNumber.trim(),
    paymentDate: paymentForm.value.paymentDate,
    payerBank: paymentForm.value.payerBank.trim(),
    transferAmount: parseFloat(paymentForm.value.transferAmount),
    fileName: paymentFile.value.name,
    fileType: paymentFile.value.type,
    fileDataUrl: paymentFile.value.dataUrl,
    comment: paymentForm.value.comment.trim() || undefined,
  }
  calculationStore.submitPayment(paymentCalcId.value, payment)
  viewMode.value = 'list'
}

const cancelPayment = () => {
  viewMode.value = 'list'
}

// Download receipt (mock)
const downloadReceipt = () => {
  const receiptText = `КВИТАНЦИЯ НА ОПЛАТУ УТИЛИЗАЦИОННОГО СБОРА
========================================

Номер расчёта: ${calculationResult.value.number}
Дата: ${calculationResult.value.date}
Сумма к оплате: ${formattedTotalAmount.value}
Срок оплаты: ${calculationResult.value.dueDate}

РЕКВИЗИТЫ ДЛЯ ОПЛАТЫ:
Получатель: Государственный экологический фонд КР
ИНН получателя: 00000000000000
Расчётный счёт: 1234567890123456
Банк: Национальный банк КР (НБКР)
БИК: 044583001
Назначение платежа: Утилизационный сбор по расчёту ${calculationResult.value.number}

Плательщик: ${companyData.name}
ИНН плательщика: ${companyData.inn}
`
  const blob = new Blob([receiptText], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `Квитанция_${calculationResult.value.number}.txt`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <DashboardLayout
    role="business"
    roleTitle="Бизнес"
    userName="ОсОО «ТехПром»"
    :menuItems="menuItems"
  >
    <!-- Draft saved notification -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showDraftNotification" class="fixed top-6 right-6 z-[200] bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          Черновик сохранён
        </div>
      </Transition>
    </Teleport>

    <!-- LIST VIEW -->
    <template v-if="viewMode === 'list'">
      <div class="content__header mb-6">
        <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b] mb-2">Расчёт утилизационного сбора</h1>
        <p class="text-[#64748b]">Расчёт суммы утилизационного сбора за товары и упаковку</p>
      </div>

      <!-- CTA Banner -->
      <div class="mb-6 bg-gradient-to-r from-[#f59e0b] to-[#d97706] rounded-2xl p-6 lg:p-8 text-white relative overflow-hidden">
        <div class="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div class="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        <div class="relative flex flex-col lg:flex-row lg:items-center gap-6">
          <div class="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <svg class="w-8 h-8 lg:w-10 lg:h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div class="flex-1">
            <h2 class="text-xl lg:text-2xl font-bold mb-2">Рассчитать утилизационный сбор</h2>
            <p class="text-white/80 text-sm lg:text-base">Узнайте сумму утилизационного сбора на основе массы товаров и упаковки. Ставки применяются автоматически согласно категории товара.</p>
          </div>
          <button
            @click="startWizard"
            class="flex items-center justify-center gap-2 bg-white text-[#f59e0b] px-6 py-3 lg:px-8 lg:py-4 rounded-xl font-semibold hover:bg-amber-50 transition-colors shadow-lg flex-shrink-0"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Начать расчёт
          </button>
        </div>
      </div>

      <!-- Info Alert -->
      <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <div class="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
          <svg class="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p class="font-medium text-[#1e293b]">Информация о расчёте</p>
          <p class="text-sm text-[#64748b]">Утилизационный сбор рассчитывается на основе массы товаров и упаковки по ставкам, установленным Правительством КР. После расчёта вы можете сразу перейти к оплате или создать декларацию.</p>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
          <p class="text-sm text-[#64748b] mb-1">Всего расчётов</p>
          <p class="text-2xl font-bold text-[#1e293b]">12</p>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
          <p class="text-sm text-[#64748b] mb-1">Оплачено за год</p>
          <p class="text-2xl font-bold text-[#10b981]">161 050 сом</p>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
          <p class="text-sm text-[#64748b] mb-1">К оплате</p>
          <p class="text-2xl font-bold text-[#f59e0b]">0 сом</p>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
          <p class="text-sm text-[#64748b] mb-1">Последний расчёт</p>
          <p class="text-2xl font-bold text-[#2563eb]">Q4 2025</p>
        </div>
      </div>

      <!-- History Table -->
      <div class="mb-4">
        <h2 class="text-lg font-semibold text-[#1e293b] mb-4">История расчётов</h2>
      </div>

      <DataTable :columns="columns" :data="calculations" :actions="true">
        <template #cell-number="{ value }">
          <span class="font-mono font-medium text-[#2563eb]">{{ value }}</span>
        </template>
        <template #cell-amount="{ value }">
          <span class="font-semibold text-[#1e293b]">{{ value }}</span>
        </template>
        <template #cell-status="{ value, row }">
          <div>
            <span :class="['px-3 py-1 rounded-full text-xs font-medium', getStatusClass(value)]">
              {{ value }}
            </span>
            <div v-if="value === 'Отклонено' && row.rejectionReason" class="mt-1 text-xs text-red-600">
              Причина: {{ row.rejectionReason }}
            </div>
            <div v-if="value === 'Оплата отклонена' && row.paymentRejectionReason" class="mt-1 text-xs text-red-600">
              Причина: {{ row.paymentRejectionReason }}
            </div>
          </div>
        </template>
        <template #actions="{ row }">
          <div class="flex items-center justify-end gap-2">
            <button
              class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#3B82F6] text-white hover:bg-[#2563EB] transition-colors shadow-sm"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Просмотреть
            </button>
            <button
              v-if="row.status === 'Отклонено'"
              @click="resubmitCalculation(row.id)"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#F59E0B] text-white hover:bg-[#D97706] transition-colors shadow-sm"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Повторно
            </button>
            <button
              v-if="row.status === 'Принято' || row.status === 'Оплата отклонена'"
              @click="openPaymentForm(row.id, row.totalAmount, row.number)"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#10B981] text-white hover:bg-[#059669] transition-colors shadow-sm"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Подтвердить оплату
            </button>
            <button
              v-if="row.status === 'Черновик'"
              @click="calculationStore.submitForReview(row.id)"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#F59E0B] text-white hover:bg-[#D97706] transition-colors shadow-sm"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              На проверку
            </button>
            <button
              class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#8B5CF6] text-white hover:bg-[#7C3AED] transition-colors shadow-sm"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Скачать PDF
            </button>
          </div>
        </template>
      </DataTable>

      <!-- Rates Info (collapsible) -->
      <div class="mt-6 rounded-2xl border border-[#e2e8f0] overflow-hidden">
        <button
          @click="showRates = !showRates"
          class="w-full flex items-center justify-between px-5 py-4 bg-[#f8fafc] hover:bg-[#f1f5f9] transition-colors text-left"
        >
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-[#94a3b8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="font-medium text-[#64748b]">Актуальные ставки утилизационного сбора (сом/тонна)</span>
            <span v-if="!showRates" class="text-xs text-[#94a3b8] ml-2 hidden sm:inline">— нажмите чтобы развернуть</span>
          </div>
          <svg
            :class="['w-5 h-5 text-[#94a3b8] transition-transform duration-300', showRates ? 'rotate-180' : '']"
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          leave-active-class="transition-all duration-200 ease-in"
          enter-from-class="max-h-0 opacity-0"
          enter-to-class="max-h-[500px] opacity-100"
          leave-from-class="max-h-[500px] opacity-100"
          leave-to-class="max-h-0 opacity-0"
        >
          <div v-show="showRates" class="overflow-hidden">
            <div class="px-5 pb-5 pt-3 bg-white border-t border-[#e2e8f0]">
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div v-for="group in productGroups" :key="group.value" class="bg-[#f8fafc] rounded-lg p-3">
                  <p class="text-xs text-[#64748b] mb-1">{{ group.label }}</p>
                  <p class="font-bold text-[#1e293b]">{{ group.baseRate.toLocaleString() }} сом</p>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </template>

    <!-- WIZARD VIEW -->
    <template v-else-if="viewMode === 'wizard'">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="mb-6">
          <button @click="backToList" class="flex items-center gap-2 text-[#64748b] hover:text-[#1e293b] mb-4">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Назад к списку
          </button>
          <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b]">Расчёт утилизационного сбора</h1>
        </div>

        <!-- Progress Steps -->
        <div class="bg-white rounded-2xl p-4 lg:p-6 shadow-sm border border-[#e2e8f0] mb-6">
          <div class="flex items-center justify-between">
            <template v-for="(step, index) in steps" :key="step.number">
              <button
                @click="goToStep(step.number)"
                :class="[
                  'flex items-center gap-2 lg:gap-3',
                  step.number <= currentStep ? 'cursor-pointer' : 'cursor-not-allowed'
                ]"
              >
                <div
                  :class="[
                    'w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center font-semibold text-sm lg:text-base transition-colors',
                    currentStep === step.number
                      ? 'bg-[#f59e0b] text-white'
                      : currentStep > step.number
                        ? 'bg-[#f59e0b] text-white'
                        : 'bg-[#e2e8f0] text-[#64748b]'
                  ]"
                >
                  <svg v-if="currentStep > step.number" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span v-else>{{ step.number }}</span>
                </div>
                <span
                  :class="[
                    'hidden sm:block text-sm lg:text-base font-medium',
                    currentStep >= step.number ? 'text-[#1e293b]' : 'text-[#64748b]'
                  ]"
                >
                  {{ step.title }}
                </span>
              </button>
              <div
                v-if="index < steps.length - 1"
                :class="[
                  'flex-1 h-1 mx-2 lg:mx-4 rounded-full',
                  currentStep > step.number ? 'bg-[#f59e0b]' : 'bg-[#e2e8f0]'
                ]"
              ></div>
            </template>
          </div>
        </div>

        <!-- Step Content -->
        <div class="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] overflow-hidden">
          <!-- Step 1: Basic Data -->
          <div v-if="currentStep === 1" class="p-6 lg:p-8">
            <h2 class="text-xl font-semibold text-[#1e293b] mb-6">Период и данные плательщика</h2>

            <div class="space-y-6">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-[#1e293b] mb-2">Расчётный период *</label>
                  <select
                    v-model="calculationQuarter"
                    class="w-full px-4 py-3 border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#f59e0b] focus:ring-2 focus:ring-[#f59e0b]/20"
                  >
                    <option value="">Выберите квартал</option>
                    <option value="Q1">I квартал</option>
                    <option value="Q2">II квартал</option>
                    <option value="Q3">III квартал</option>
                    <option value="Q4">IV квартал</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-[#1e293b] mb-2">Год *</label>
                  <select
                    v-model="calculationYear"
                    class="w-full px-4 py-3 border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#f59e0b] focus:ring-2 focus:ring-[#f59e0b]/20"
                  >
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                    <option value="2028">2028</option>
                    <option value="2029">2029</option>
                    <option value="2030">2030</option>
                  </select>
                </div>
              </div>

              <div class="bg-[#f8fafc] rounded-xl p-5 border border-[#e2e8f0]">
                <div class="flex items-center gap-2 mb-4">
                  <svg class="w-5 h-5 text-[#f59e0b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <h3 class="font-medium text-[#1e293b]">Данные плательщика (из профиля)</h3>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs text-[#64748b] mb-1">Наименование</label>
                    <input type="text" :value="companyData.name" readonly class="w-full px-3 py-2 bg-white border border-[#e2e8f0] rounded-lg text-[#1e293b] cursor-not-allowed" />
                  </div>
                  <div>
                    <label class="block text-xs text-[#64748b] mb-1">ИНН</label>
                    <input type="text" :value="companyData.inn" readonly class="w-full px-3 py-2 bg-white border border-[#e2e8f0] rounded-lg text-[#1e293b] cursor-not-allowed" />
                  </div>
                  <div class="sm:col-span-2">
                    <label class="block text-xs text-[#64748b] mb-1">Адрес</label>
                    <input type="text" :value="companyData.address" readonly class="w-full px-3 py-2 bg-white border border-[#e2e8f0] rounded-lg text-[#1e293b] cursor-not-allowed" />
                  </div>
                </div>
              </div>

              <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <div class="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p class="font-medium text-[#1e293b]">Срок уплаты</p>
                  <p class="text-sm text-[#64748b]">Утилизационный сбор уплачивается ежеквартально не позднее 20-го числа месяца, следующего за отчётным кварталом</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 2: Products -->
          <div v-if="currentStep === 2" class="p-6 lg:p-8">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 class="text-xl font-semibold text-[#1e293b]">Товары и упаковка</h2>
              <button @click="importFromDeclaration" class="flex items-center gap-2 text-[#f59e0b] hover:bg-amber-50 px-4 py-2 rounded-lg transition-colors">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Импорт из декларации
              </button>
            </div>

            <div class="space-y-4">
              <div v-for="(item, index) in productItems" :key="item.id" class="bg-[#f8fafc] rounded-xl p-4 border border-[#e2e8f0]">
                <div class="flex items-center justify-between mb-4">
                  <span class="text-sm font-medium text-[#64748b]">Позиция {{ index + 1 }}</span>
                  <button v-if="productItems.length > 1" @click="removeProductItem(item.id)" class="text-red-500 hover:bg-red-50 p-1 rounded transition-colors">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                <ProductGroupSelector
                  :group="item.group"
                  :subgroup="item.subgroup"
                  @update:group="(v: string) => { item.group = v; item.subgroup = ''; item.tnvedCode = ''; updateItemRate(item) }"
                  @update:subgroup="(v: string) => { item.subgroup = v; updateItemRate(item) }"
                  @subgroup-selected="(data: ProductSubgroup | null) => { if (data) item.tnvedCode = data.code }"
                  accent-color="#f59e0b"
                />

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                  <div>
                    <label class="block text-xs text-[#64748b] mb-1">Масса (тонн)</label>
                    <input type="number" v-model="item.mass" @input="calculateAmount(item)" step="0.01" min="0" placeholder="0.00" class="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#f59e0b] text-sm" />
                  </div>
                </div>

                <div v-if="item.group" class="mt-3 pt-3 border-t border-[#e2e8f0] flex flex-wrap items-center gap-4 text-sm">
                  <div class="flex items-center gap-2">
                    <span class="text-[#64748b]">Ставка:</span>
                    <span class="font-medium text-[#1e293b]">{{ item.rate.toLocaleString() }} сом/т</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-[#64748b]">Сумма:</span>
                    <span class="font-bold text-[#f59e0b]">{{ item.amount.toLocaleString() }} сом</span>
                  </div>
                </div>
              </div>
            </div>

            <button @click="addProductItem" class="mt-4 flex items-center gap-2 text-[#f59e0b] hover:bg-amber-50 px-4 py-2 rounded-lg transition-colors">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Добавить позицию
            </button>

            <div class="mt-6 pt-4 border-t border-[#e2e8f0]">
              <div class="bg-gradient-to-r from-[#f59e0b]/10 to-[#d97706]/10 rounded-xl p-5 border border-[#f59e0b]/20">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <p class="text-sm text-[#64748b] mb-1">Общая масса</p>
                    <p class="text-xl font-bold text-[#1e293b]">{{ totalMass }} тонн</p>
                  </div>
                  <div class="text-right">
                    <p class="text-sm text-[#64748b] mb-1">Итого к оплате</p>
                    <p class="text-2xl font-bold text-[#f59e0b]">{{ formattedTotalAmount }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 3: Result -->
          <div v-if="currentStep === 3" class="p-6 lg:p-8">
            <h2 class="text-xl font-semibold text-[#1e293b] mb-6">Результат расчёта</h2>

            <div class="bg-[#f8fafc] rounded-xl p-5 border border-[#e2e8f0] mb-6">
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <p class="text-sm text-[#64748b] mb-1">Номер расчёта</p>
                  <p class="font-bold text-[#1e293b] font-mono">{{ calculationResult.number }}</p>
                </div>
                <div>
                  <p class="text-sm text-[#64748b] mb-1">Дата расчёта</p>
                  <p class="font-bold text-[#1e293b]">{{ calculationResult.date }}</p>
                </div>
                <div>
                  <p class="text-sm text-[#64748b] mb-1">Срок оплаты</p>
                  <p class="font-bold text-[#f59e0b]">{{ calculationResult.dueDate }}</p>
                </div>
              </div>
            </div>

            <div class="bg-gradient-to-r from-[#f59e0b] to-[#d97706] rounded-2xl p-6 text-white mb-6">
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p class="text-white/80 mb-1">Сумма утилизационного сбора</p>
                  <p class="text-3xl lg:text-4xl font-bold">{{ formattedTotalAmount }}</p>
                </div>
                <div class="flex items-center gap-2">
                  <span class="px-4 py-2 bg-white/20 rounded-lg text-sm font-medium">
                    {{ calculationQuarter }} {{ calculationYear }}
                  </span>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden mb-6">
              <div class="px-5 py-4 border-b border-[#e2e8f0]">
                <h3 class="font-semibold text-[#1e293b]">Детализация расчёта</h3>
              </div>
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead class="bg-[#f8fafc]">
                    <tr class="text-left text-[#64748b]">
                      <th class="px-5 py-3 font-medium">Категория</th>
                      <th class="px-5 py-3 font-medium">Подкатегория</th>
                      <th class="px-5 py-3 font-medium text-right">Масса (т)</th>
                      <th class="px-5 py-3 font-medium text-right">Ставка (сом/т)</th>
                      <th class="px-5 py-3 font-medium text-right">Сумма (сом)</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-[#e2e8f0]">
                    <tr v-for="item in productItems.filter(i => i.group && i.mass)" :key="item.id" class="hover:bg-[#f8fafc]">
                      <td class="px-5 py-3 text-[#1e293b]">{{ getGroupLabel(item.group) }}</td>
                      <td class="px-5 py-3 text-[#64748b]">{{ getSubgroupLabel(item.group, item.subgroup) }}</td>
                      <td class="px-5 py-3 text-right font-medium">{{ item.mass }}</td>
                      <td class="px-5 py-3 text-right">{{ item.rate.toLocaleString() }}</td>
                      <td class="px-5 py-3 text-right font-bold text-[#f59e0b]">{{ item.amount.toLocaleString() }}</td>
                    </tr>
                  </tbody>
                  <tfoot class="bg-[#f8fafc] font-semibold">
                    <tr>
                      <td colspan="2" class="px-5 py-3">Итого</td>
                      <td class="px-5 py-3 text-right">{{ totalMass }}</td>
                      <td class="px-5 py-3 text-right">—</td>
                      <td class="px-5 py-3 text-right text-[#f59e0b]">{{ totalAmount.toLocaleString() }}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
              <div class="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div>
                <p class="font-medium text-[#1e293b]">Реквизиты для оплаты</p>
                <p class="text-sm text-[#64748b]">Получатель: Государственный экологический фонд КР<br/>ИНН: 00000000000000 | Р/с: 1234567890123456 | Банк: НБКР</p>
              </div>
            </div>
          </div>

          <!-- Navigation Buttons -->
          <div class="px-6 lg:px-8 py-4 bg-[#f8fafc] border-t border-[#e2e8f0] flex flex-col sm:flex-row justify-between gap-4">
            <button
              v-if="currentStep > 1"
              @click="prevStep"
              class="flex items-center justify-center gap-2 px-5 py-2.5 border border-[#e2e8f0] rounded-lg text-[#64748b] hover:bg-white transition-colors"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              Назад
            </button>
            <div v-else></div>

            <div class="flex flex-col sm:flex-row gap-3">
              <button
                v-if="currentStep === 1"
                @click="nextStep"
                :disabled="!canProceedStep1"
                class="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#f59e0b] text-white rounded-lg font-medium hover:bg-[#d97706] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Далее
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <button
                v-if="currentStep === 2"
                @click="performCalculation"
                :disabled="!canProceedStep2"
                class="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#f59e0b] text-white rounded-lg font-medium hover:bg-[#d97706] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Рассчитать
              </button>

              <!-- Step 3: Actions -->
              <template v-if="currentStep === 3">
                <button
                  @click="saveDraft"
                  class="flex items-center justify-center gap-2 px-5 py-2.5 border border-[#e2e8f0] rounded-lg text-[#64748b] hover:bg-white transition-colors"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  Сохранить черновик
                </button>

                <button
                  @click="submitForReview"
                  class="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#f59e0b] text-white rounded-lg font-medium hover:bg-[#d97706] transition-colors"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Отправить на проверку
                </button>
              </template>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- RESULT VIEW (After Submit) -->
    <template v-else-if="viewMode === 'result'">
      <div class="max-w-2xl mx-auto text-center py-12">
        <div class="w-24 h-24 mx-auto mb-6 rounded-full bg-amber-100 flex items-center justify-center">
          <svg class="w-12 h-12 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b] mb-4">Расчёт отправлен на проверку!</h1>

        <div class="bg-white rounded-2xl p-6 shadow-sm border border-[#e2e8f0] mb-8">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <p class="text-sm text-[#64748b] mb-1">Номер расчёта</p>
              <p class="text-lg font-bold text-[#f59e0b] font-mono">{{ calculationResult.number }}</p>
            </div>
            <div>
              <p class="text-sm text-[#64748b] mb-1">Сумма к оплате</p>
              <p class="text-lg font-bold text-[#1e293b]">{{ formattedTotalAmount }}</p>
            </div>
            <div>
              <p class="text-sm text-[#64748b] mb-1">Срок оплаты</p>
              <p class="text-lg font-bold text-[#f59e0b]">{{ calculationResult.dueDate }}</p>
            </div>
          </div>
        </div>

        <!-- Payment requisites block -->
        <div class="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-8 text-left">
          <h3 class="font-semibold text-[#1e293b] mb-3">Реквизиты для банковского перевода</h3>
          <div class="text-sm text-[#64748b] space-y-1">
            <p><span class="font-medium text-[#1e293b]">Получатель:</span> Государственный экологический фонд КР</p>
            <p><span class="font-medium text-[#1e293b]">ИНН:</span> 00000000000000</p>
            <p><span class="font-medium text-[#1e293b]">Расчётный счёт:</span> 1234567890123456</p>
            <p><span class="font-medium text-[#1e293b]">Банк:</span> Национальный банк КР (НБКР)</p>
            <p><span class="font-medium text-[#1e293b]">Назначение платежа:</span> Утилизационный сбор по расчёту {{ calculationResult.number }}</p>
          </div>
        </div>

        <p class="text-[#64748b] mb-8">
          Расчёт утилизационного сбора отправлен на проверку Эко Оператору.<br/>
          После принятия расчёта произведите оплату по указанным реквизитам и загрузите подтверждение.
        </p>

        <div class="flex flex-col sm:flex-row justify-center gap-4">
          <button
            @click="downloadReceipt"
            class="flex items-center justify-center gap-2 px-6 py-3 border border-[#e2e8f0] rounded-xl text-[#1e293b] hover:bg-[#f8fafc] transition-colors"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Скачать квитанцию
          </button>
          <button
            disabled
            class="flex items-center justify-center gap-2 px-6 py-3 bg-[#10b981] text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Доступно после принятия расчёта"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Подтвердить оплату
          </button>
          <button
            @click="backToList"
            class="flex items-center justify-center gap-2 px-6 py-3 bg-[#f59e0b] text-white rounded-xl font-medium hover:bg-[#d97706] transition-colors"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            К списку расчётов
          </button>
        </div>
      </div>
    </template>

    <!-- PAYMENT CONFIRMATION VIEW -->
    <template v-else-if="viewMode === 'payment'">
      <div class="max-w-2xl mx-auto">
        <div class="mb-6">
          <button @click="cancelPayment" class="flex items-center gap-2 text-[#64748b] hover:text-[#1e293b] mb-4">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Назад к списку
          </button>
          <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b] mb-2">Подтверждение оплаты</h1>
          <p class="text-[#64748b]">Расчёт {{ paymentCalcNumber }} | Сумма: {{ paymentCalcAmount.toLocaleString('ru-RU') }} сом</p>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] p-6 lg:p-8">
          <div class="space-y-5">
            <!-- Payment order number -->
            <div>
              <label class="block text-sm font-medium text-[#1e293b] mb-2">Номер платёжного поручения *</label>
              <input
                v-model="paymentForm.paymentOrderNumber"
                type="text"
                placeholder="Например: ПП-00412"
                class="w-full px-4 py-3 border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#f59e0b] focus:ring-2 focus:ring-[#f59e0b]/20"
              />
            </div>

            <!-- Payment date -->
            <div>
              <label class="block text-sm font-medium text-[#1e293b] mb-2">Дата оплаты *</label>
              <input
                v-model="paymentForm.paymentDate"
                type="date"
                class="w-full px-4 py-3 border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#f59e0b] focus:ring-2 focus:ring-[#f59e0b]/20"
              />
            </div>

            <!-- Payer bank -->
            <div>
              <label class="block text-sm font-medium text-[#1e293b] mb-2">Банк плательщика *</label>
              <input
                v-model="paymentForm.payerBank"
                type="text"
                placeholder="Например: Оптима Банк"
                class="w-full px-4 py-3 border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#f59e0b] focus:ring-2 focus:ring-[#f59e0b]/20"
              />
            </div>

            <!-- Transfer amount -->
            <div>
              <label class="block text-sm font-medium text-[#1e293b] mb-2">Сумма перевода (сом) *</label>
              <input
                v-model="paymentForm.transferAmount"
                @input="validatePaymentAmount"
                type="number"
                :placeholder="paymentCalcAmount.toLocaleString('ru-RU')"
                class="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2"
                :class="paymentAmountError ? 'border-red-300 focus:border-red-400 focus:ring-red-200' : 'border-[#e2e8f0] focus:border-[#f59e0b] focus:ring-[#f59e0b]/20'"
              />
              <p v-if="paymentAmountError" class="mt-1 text-sm text-red-600">{{ paymentAmountError }}</p>
            </div>

            <!-- File upload -->
            <div>
              <label class="block text-sm font-medium text-[#1e293b] mb-2">Скан/фото платёжного поручения *</label>
              <div
                v-if="!paymentFile"
                @dragover.prevent="paymentDragOver = true"
                @dragleave="paymentDragOver = false"
                @drop.prevent="handlePaymentFileDrop"
                :class="[
                  'border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer',
                  paymentDragOver ? 'border-[#f59e0b] bg-amber-50' : 'border-[#e2e8f0] hover:border-[#f59e0b]'
                ]"
                @click="($refs.fileInput as HTMLInputElement)?.click()"
              >
                <svg class="w-10 h-10 mx-auto mb-3 text-[#64748b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p class="text-[#1e293b] font-medium mb-1">Перетащите файл сюда или нажмите для выбора</p>
                <p class="text-sm text-[#64748b]">PDF, JPG, PNG — до 10 МБ</p>
                <input ref="fileInput" type="file" accept=".pdf,.jpg,.jpeg,.png" class="hidden" @change="handlePaymentFileSelect" />
              </div>
              <div v-else class="bg-[#f8fafc] rounded-xl p-4 border border-[#e2e8f0] flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <svg class="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p class="font-medium text-[#1e293b] text-sm">{{ paymentFile.name }}</p>
                    <p class="text-xs text-[#64748b]">{{ paymentFile.type }}</p>
                  </div>
                </div>
                <button @click="removePaymentFile" class="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Comment -->
            <div>
              <label class="block text-sm font-medium text-[#1e293b] mb-2">Комментарий</label>
              <textarea
                v-model="paymentForm.comment"
                rows="3"
                placeholder="Дополнительная информация (необязательно)"
                class="w-full px-4 py-3 border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#f59e0b] focus:ring-2 focus:ring-[#f59e0b]/20"
              ></textarea>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-col sm:flex-row justify-end gap-3 mt-8 pt-6 border-t border-[#e2e8f0]">
            <button
              @click="cancelPayment"
              class="flex items-center justify-center gap-2 px-5 py-2.5 border border-[#e2e8f0] rounded-lg text-[#64748b] hover:bg-white transition-colors"
            >
              Отмена
            </button>
            <button
              @click="submitPayment"
              :disabled="!canSubmitPayment"
              class="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#10b981] text-white rounded-lg font-medium hover:bg-[#059669] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Отправить на проверку
            </button>
          </div>
        </div>
      </div>
    </template>
  </DashboardLayout>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
