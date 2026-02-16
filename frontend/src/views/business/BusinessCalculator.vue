<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import SkeletonLoader from '../../components/dashboard/SkeletonLoader.vue'
import DataTable from '../../components/dashboard/DataTable.vue'
import EmptyState from '../../components/dashboard/EmptyState.vue'
import { icons } from '../../utils/menuIcons'
import { productGroups, productSubgroups, getSubgroupLabel, type ProductSubgroup } from '../../data/product-groups'
// recyclingStandard now comes from product group, not year-based norms
import ProductGroupSelector from '../../components/ProductGroupSelector.vue'
import { calculationStore, type CalculationStatus, type PaymentData } from '../../stores/calculations'
import { addWorkingDays, calculatePaymentDeadline, getRemainingDays, formatDateRu, formatDateShort } from '../../utils/dateUtils'

const menuItems = [
  { id: 'dashboard', label: 'Главная', icon: icons.dashboard, route: '/business' },
  { id: 'account', label: 'Лицевой счёт', icon: icons.money, route: '/business/account' },
  { id: 'calculator', label: 'Расчёт утильсбора', icon: icons.calculator, route: '/business/calculator' },
  { id: 'reports', label: 'Отчёты о переработке', icon: icons.report, route: '/business/reports' },
  { id: 'declarations', label: 'Декларации', icon: icons.document, route: '/business/declarations' },
  { id: 'payments', label: 'Платежи', icon: icons.payment, route: '/business/payments' },
  { id: 'documents', label: 'Документы', icon: icons.folder, route: '/business/documents' },
  { id: 'normatives', label: 'Нормативы и ставки', icon: icons.registries, route: '/business/normatives' },
  { id: 'profile', label: 'Профиль компании', icon: icons.building, route: '/business/profile' },
]

const router = useRouter()

const viewCalculation = (id: number) => {
  router.push(`/business/calculations/${id}`)
}
const mockAction = (action: string) => {
  alert(action)
}

// Loading state
const isLoading = ref(true)
onMounted(() => { setTimeout(() => { isLoading.value = false }, 500) })

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
type PayerType = 'producer' | 'importer'
const payerType = ref<PayerType>('importer')
const calculationQuarter = ref('')
const calculationYear = ref('2026')
const importDate = ref('')

// Deadline calculation (using dateUtils)
const currentDeadline = computed(() => {
  return calculatePaymentDeadline(payerType.value, {
    quarter: calculationQuarter.value,
    year: calculationYear.value,
    importDate: importDate.value,
  })
})

const currentDeadlineFormatted = computed(() => {
  if (!currentDeadline.value) return ''
  return formatDateRu(currentDeadline.value)
})

const currentDeadlineShort = computed(() => {
  if (!currentDeadline.value) return ''
  return formatDateShort(currentDeadline.value)
})

const deadlineStatus = computed(() => {
  if (!currentDeadline.value) return null
  return getRemainingDays(currentDeadline.value)
})

// Legacy aliases used in template
const producerDeadline = computed(() => payerType.value === 'producer' ? currentDeadline.value : null)
const producerDeadlineFormatted = computed(() => payerType.value === 'producer' ? currentDeadlineFormatted.value : '')
const importerDeadline = computed(() => payerType.value === 'importer' ? currentDeadline.value : null)
const importerDeadlineFormatted = computed(() => payerType.value === 'importer' ? currentDeadlineFormatted.value : '')
const importerDaysLeft = computed(() => {
  if (!importerDeadline.value) return null
  const status = getRemainingDays(importerDeadline.value)
  return status.overdue ? 0 : status.days
})
const importerDeadlinePassed = computed(() => {
  if (!importerDeadline.value) return false
  return getRemainingDays(importerDeadline.value).overdue
})

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
  group: string           // Гр.1
  subgroup: string        // Гр.2
  gskpCode: string        // Гр.3: Код ГСКП (производители)
  tnvedCode: string       // Гр.4: Код ТН ВЭД (импортёры)
  volume: string          // Гр.5: Объём (масса) товаров/упаковки (тонн)
  recyclingStandard: number // Гр.6: Норматив переработки (%)
  volumeToRecycle: number  // Гр.7 = Гр.5 × Гр.6 / 100
  transferredToRecycling: string // Гр.8: Передано на переработку (тонн)
  recycledFile: { name: string } | null
  exportedFromKR: string  // Гр.9: Вывезено из КР (тонн)
  exportedFile: { name: string } | null
  taxableVolume: number   // Гр.10 = max(0, Гр.7 - Гр.8 - Гр.9)
  rate: number            // Гр.11: Ставка (сом/т)
  amount: number          // Гр.12 = Гр.10 × Гр.11
}

const emptyItem = (): ProductItem => ({
  id: nextProductId++,
  group: '',
  subgroup: '',
  gskpCode: '',
  tnvedCode: '',
  volume: '',
  recyclingStandard: 0,
  volumeToRecycle: 0,
  transferredToRecycling: '',
  recycledFile: null,
  exportedFromKR: '',
  exportedFile: null,
  taxableVolume: 0,
  rate: 0,
  amount: 0,
})

let nextProductId = 2

const productItems = ref<ProductItem[]>([
  { id: 1, group: '', subgroup: '', gskpCode: '', tnvedCode: '', volume: '', recyclingStandard: 0, volumeToRecycle: 0, transferredToRecycling: '', recycledFile: null, exportedFromKR: '', exportedFile: null, taxableVolume: 0, rate: 0, amount: 0 }
])

const addProductItem = () => {
  productItems.value.push(emptyItem())
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
    item.recyclingStandard = 0
    item.amount = 0
    item.tnvedCode = ''
    return
  }

  let multiplier = 1
  item.tnvedCode = group.code
  item.recyclingStandard = group.recyclingStandard

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
  const vol = parseFloat(item.volume) || 0
  // Гр.7: Объём к переработке = Гр.5 × Гр.6 / 100
  item.volumeToRecycle = vol * item.recyclingStandard / 100
  const transferred = parseFloat(item.transferredToRecycling) || 0
  const exported = parseFloat(item.exportedFromKR) || 0
  // Гр.10: Облагаемый объём = max(0, Гр.7 - Гр.8 - Гр.9)
  item.taxableVolume = Math.max(0, item.volumeToRecycle - transferred - exported)
  // Гр.12: Сумма = Гр.10 × Гр.11
  item.amount = Math.round(item.taxableVolume * item.rate)
}

// Гр.8 validation: transferred to recycling
const getTransferredError = (item: ProductItem): string => {
  const transferred = parseFloat(item.transferredToRecycling) || 0
  const exported = parseFloat(item.exportedFromKR) || 0
  if (transferred > 0 && transferred > item.volumeToRecycle) {
    return 'Не может превышать объём к переработке (Гр.7)'
  }
  if (transferred > 0 && exported > 0 && transferred + exported > item.volumeToRecycle) {
    return 'Сумма Гр.8 и Гр.9 не может превышать объём к переработке'
  }
  return ''
}

// Гр.9 validation: exported from KR
const getExportedError = (item: ProductItem): string => {
  const transferred = parseFloat(item.transferredToRecycling) || 0
  const exported = parseFloat(item.exportedFromKR) || 0
  if (exported > 0 && exported > item.volumeToRecycle) {
    return 'Не может превышать объём к переработке (Гр.7)'
  }
  if (transferred > 0 && exported > 0 && transferred + exported > item.volumeToRecycle) {
    return 'Сумма Гр.8 и Гр.9 не может превышать объём к переработке'
  }
  return ''
}

// Гр.9 exported file handling
const handleExportedFileSelect = (item: ProductItem, event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    item.exportedFile = { name: file.name }
  }
  input.value = ''
}

const removeExportedFile = (item: ProductItem) => {
  item.exportedFile = null
}

// Гр.8 recycled file handling
const handleRecycledFileSelect = (item: ProductItem, event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    item.recycledFile = { name: file.name }
  }
  input.value = ''
}

const removeRecycledFile = (item: ProductItem) => {
  item.recycledFile = null
}

const getSubgroupsForGroup = (group: string) => {
  return productSubgroups[group] || []
}

// Import from declaration mock
const importFromDeclaration = () => {
  const items: ProductItem[] = [
    { id: nextProductId++, group: 'group_6', subgroup: 'g6_bottles_small', gskpCode: '', tnvedCode: '3923', volume: '12.5', recyclingStandard: 20, volumeToRecycle: 0, transferredToRecycling: '', recycledFile: null, exportedFromKR: '', exportedFile: null, taxableVolume: 0, rate: 0, amount: 0 },
    { id: nextProductId++, group: 'group_1', subgroup: 'g1_corrugated_boxes', gskpCode: '', tnvedCode: '4819 10', volume: '8.3', recyclingStandard: 20, volumeToRecycle: 0, transferredToRecycling: '', recycledFile: null, exportedFromKR: '', exportedFile: null, taxableVolume: 0, rate: 0, amount: 0 },
    { id: nextProductId++, group: 'group_8', subgroup: 'g8_bottles_clear', gskpCode: '', tnvedCode: '7010', volume: '5.2', recyclingStandard: 10, volumeToRecycle: 0, transferredToRecycling: '', recycledFile: null, exportedFromKR: '', exportedFile: null, taxableVolume: 0, rate: 0, amount: 0 },
  ]
  items.forEach(item => {
    updateItemRate(item)
  })
  productItems.value = items
}

// Computed
const canProceedStep1 = computed(() => {
  if (payerType.value === 'producer') {
    return calculationQuarter.value && calculationYear.value
  }
  return importDate.value && calculationYear.value
})

const canProceedStep2 = computed(() => {
  return productItems.value.some(item => item.group && item.volume && parseFloat(item.volume) > 0)
})

// Гр.5 total
const totalVolume = computed(() => {
  return productItems.value
    .reduce((sum, item) => sum + (parseFloat(item.volume) || 0), 0)
    .toFixed(2)
})

// Гр.7 total
const totalVolumeToRecycle = computed(() => {
  return productItems.value
    .reduce((sum, item) => sum + (item.volumeToRecycle || 0), 0)
    .toFixed(2)
})

// Гр.8 total
const totalTransferred = computed(() => {
  return productItems.value
    .reduce((sum, item) => sum + (parseFloat(item.transferredToRecycling) || 0), 0)
    .toFixed(2)
})

// Гр.9 total
const totalExported = computed(() => {
  return productItems.value
    .reduce((sum, item) => sum + (parseFloat(item.exportedFromKR) || 0), 0)
    .toFixed(2)
})

// Гр.10 total
const totalTaxableVolume = computed(() => {
  return productItems.value
    .reduce((sum, item) => sum + (item.taxableVolume || 0), 0)
    .toFixed(2)
})

const totalAmount = computed(() => {
  return productItems.value.reduce((sum, item) => sum + item.amount, 0)
})

const formattedTotalAmount = computed(() => {
  return totalAmount.value.toLocaleString('ru-RU') + ' сом'
})

// Expandable positions (Step 2)
const expandedPositions = ref<Set<number>>(new Set())
const togglePosition = (id: number) => {
  if (expandedPositions.value.has(id)) {
    expandedPositions.value.delete(id)
  } else {
    expandedPositions.value.add(id)
  }
}
const isPositionExpanded = (id: number) => expandedPositions.value.has(id)
const getRemaining = (item: ProductItem) => {
  const toRecycle = item.volumeToRecycle || 0
  const transferred = parseFloat(item.transferredToRecycling) || 0
  const exported = parseFloat(item.exportedFromKR) || 0
  return +(toRecycle - transferred - exported).toFixed(4)
}

const getGroupLabel = (value: string) => {
  return productGroups.find(g => g.value === value)?.label || value
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
  const deadline = currentDeadline.value

  calculationResult.value = {
    number: `РС-${now.getFullYear()}-${num}`,
    date: now.toLocaleDateString('ru-RU'),
    dueDate: deadline ? formatDateShort(deadline) : '—'
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
  importDate.value = ''
  productItems.value = [{ id: 1, group: '', subgroup: '', gskpCode: '', tnvedCode: '', volume: '', recyclingStandard: 0, volumeToRecycle: 0, transferredToRecycling: '', recycledFile: null, exportedFromKR: '', exportedFile: null, taxableVolume: 0, rate: 0, amount: 0 }]
}

const createDeclaration = () => {
  alert('Создание декларации на основе расчёта')
}

// Form validation
const validationErrors = ref<Record<string, string>>({})

const validateStep1 = (): boolean => {
  const errors: Record<string, string> = {}
  if (payerType.value === 'producer') {
    if (!calculationQuarter.value) {
      errors.quarter = 'Выберите квартал'
    }
  } else {
    if (!importDate.value) {
      errors.importDate = 'Выберите дату ввоза'
    }
  }
  validationErrors.value = errors
  return Object.keys(errors).length === 0
}

const validateStep2 = (): boolean => {
  const errors: Record<string, string> = {}
  let hasValidProduct = false

  productItems.value.forEach((item, index) => {
    if (!item.group) {
      errors[`product_${index}_group`] = 'Выберите группу товара'
    }
    if (!item.volume || parseFloat(item.volume) <= 0) {
      errors[`product_${index}_volume`] = 'Введите объём больше 0'
    }
    if (item.group && item.volume && parseFloat(item.volume) > 0) {
      hasValidProduct = true
    }
  })

  if (!hasValidProduct) {
    errors.products = 'Добавьте хотя бы один товар с заполненной группой и массой'
  }

  validationErrors.value = errors
  return Object.keys(errors).length === 0
}

const handleStep1Next = () => {
  if (validateStep1()) {
    nextStep()
  }
}

const handleStep2Calculate = () => {
  if (validateStep2()) {
    performCalculation()
  }
}

// Export / Print handlers
const handleDownloadPdf = () => {
  alert('Функция скачивания PDF в разработке')
}

const handlePrint = () => {
  window.print()
}

// Watch for changes in volume/deductions to recalculate
watch(productItems, () => {
  productItems.value.forEach(item => {
    if (item.group && item.volume) {
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

const statusStyles: Record<string, string> = {
  'Черновик': 'background:#F3F4F6;color:#6B7280',
  'На проверке': 'background:#FEF3C7;color:#92400E',
  'Принято': 'background:#D1FAE5;color:#065F46',
  'Оплачено': 'background:#DBEAFE;color:#1D4ED8',
  'Отклонено': 'background:#FEE2E2;color:#991B1B',
  'Оплата на проверке': 'background:#EDE9FE;color:#6D28D9',
  'Оплата отклонена': 'background:#FEE2E2;color:#991B1B',
}
const getStatusStyle = (status: string) => statusStyles[status] || 'background:#F3F4F6;color:#6B7280'

// Save as draft
const saveDraft = () => {
  const now = new Date()
  const num = String(Math.floor(Math.random() * 900) + 100)
  const calcData = {
    number: calculationResult.value.number || `РС-${now.getFullYear()}-${num}`,
    date: calculationResult.value.date || now.toLocaleDateString('ru-RU'),
    company: companyData.name,
    inn: companyData.inn,
    address: companyData.address,
    quarter: calculationQuarter.value,
    year: calculationYear.value,
    payerType: payerType.value,
    importDate: payerType.value === 'importer' ? importDate.value : undefined,
    items: productItems.value.filter(i => i.group && i.volume).map(i => ({ ...i })),
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
    address: companyData.address,
    quarter: calculationQuarter.value,
    year: calculationYear.value,
    payerType: payerType.value,
    importDate: payerType.value === 'importer' ? importDate.value : undefined,
    items: productItems.value.filter(i => i.group && i.volume).map(i => ({ ...i })),
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
    roleTitle="Плательщик"
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
          <p class="text-sm text-[#64748b]">Утилизационный сбор рассчитывается на основе массы товаров и упаковки товаров согласно ставкам и нормативам, установленным Кабинетом Министров Кыргызской Республики.</p>
        </div>
      </div>

      <template v-if="isLoading">
        <div class="mb-6"><SkeletonLoader variant="card" /></div>
        <SkeletonLoader variant="table" />
      </template>

      <template v-if="!isLoading">
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
        <template #empty>
          <EmptyState
            :icon="'<svg class=&quot;w-10 h-10&quot; fill=&quot;none&quot; viewBox=&quot;0 0 40 40&quot; stroke=&quot;currentColor&quot; stroke-width=&quot;1.5&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; d=&quot;M15 11.67h10m0 16.66v-5m-5 5h.017M15 28.33h.017M15 23.33h.017M20 23.33h.017M25 18.33h.017M20 18.33h.017M15 18.33h.017M11.67 35h16.66A3.33 3.33 0 0031.67 31.67V8.33A3.33 3.33 0 0028.33 5H11.67A3.33 3.33 0 008.33 8.33v23.34A3.33 3.33 0 0011.67 35z&quot;/></svg>'"
            title="У вас пока нет расчётов"
            description="Создайте первый расчёт утилизационного сбора"
            actionLabel="Создать расчёт"
            @action="startWizard()"
          />
        </template>
        <template #cell-number="{ value }">
          <span class="font-mono font-medium text-[#2563eb]">{{ value }}</span>
        </template>
        <template #cell-amount="{ value }">
          <span class="font-semibold text-[#1e293b]">{{ value }}</span>
        </template>
        <template #cell-status="{ value }">
          <span
            :style="getStatusStyle(value)"
            style="display:inline-block;border-radius:12px;padding:4px 12px;font-size:12px;font-weight:500;white-space:nowrap"
          >{{ value }}</span>
        </template>
        <template #actions="{ row }">
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px">
            <!-- Черновик -->
            <template v-if="row.status === 'Черновик'">
              <button
                @click="calculationStore.submitForReview(row.id)"
                class="calc-action-btn"
                style="background:#F59E0B;color:white"
              >Отправить на проверку</button>
              <div style="display:flex;gap:12px">
                <button @click="mockAction('Редактирование расчёта ' + row.number)" class="calc-action-link">Редактировать</button>
                <button @click="mockAction('Удаление расчёта ' + row.number)" class="calc-action-link" style="color:#EF4444">Удалить</button>
              </div>
            </template>
            <!-- На проверке -->
            <template v-else-if="row.status === 'На проверке'">
              <span style="background:#FEF3C7;color:#92400E;border-radius:12px;padding:4px 12px;font-size:12px;white-space:nowrap">⏳ На проверке ГП Эко Оператора</span>
              <router-link :to="'/business/calculations/' + row.id" class="calc-action-link" style="color:#2563EB">Просмотреть</router-link>
            </template>
            <!-- Принято -->
            <template v-else-if="row.status === 'Принято'">
              <div class="calc-accepted-actions">
                <router-link :to="'/business/calculations/' + row.id" class="calc-trio-btn calc-trio-btn--blue">
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  Просмотреть
                </router-link>
                <button
                  @click="mockAction('Переход к оплате расчёта ' + row.number + ' на сумму ' + row.totalAmount.toLocaleString('ru-RU') + ' сом')"
                  class="calc-trio-btn calc-trio-btn--green"
                >
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                  Оплатить {{ row.totalAmount.toLocaleString('ru-RU') }} сом
                </button>
                <button @click="mockAction('Скачивание PDF расчёта ' + row.number)" class="calc-trio-btn calc-trio-btn--purple">
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  Скачать PDF
                </button>
              </div>
            </template>
            <!-- Оплачено -->
            <template v-else-if="row.status === 'Оплачено'">
              <span style="background:#D1FAE5;color:#065F46;border-radius:12px;padding:4px 12px;font-size:12px;white-space:nowrap">✅ Оплачено</span>
              <div style="display:flex;gap:12px">
                <router-link :to="'/business/calculations/' + row.id" class="calc-action-link" style="color:#2563EB">Просмотреть</router-link>
                <button @click="mockAction('Скачивание PDF расчёта ' + row.number)" class="calc-action-link">Скачать PDF</button>
                <button @click="mockAction('Создание декларации по расчёту ' + row.number)" class="calc-action-link">Создать декларацию</button>
              </div>
            </template>
            <!-- Отклонено -->
            <template v-else-if="row.status === 'Отклонено'">
              <button
                @click="mockAction('Создание копии расчёта для исправления')"
                class="calc-action-btn"
                style="background:#EF4444;color:white"
              >Исправить и отправить</button>
              <div
                v-if="row.rejectionReason"
                style="font-size:11px;color:#DC2626;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"
                :title="row.rejectionReason"
              >❌ Причина: {{ row.rejectionReason }}</div>
            </template>
            <!-- Оплата на проверке -->
            <template v-else-if="row.status === 'Оплата на проверке'">
              <span style="background:#EDE9FE;color:#6D28D9;border-radius:12px;padding:4px 12px;font-size:12px;white-space:nowrap">⏳ Оплата на проверке</span>
              <router-link :to="'/business/calculations/' + row.id" class="calc-action-link" style="color:#2563EB">Просмотреть</router-link>
            </template>
            <!-- Оплата отклонена -->
            <template v-else-if="row.status === 'Оплата отклонена'">
              <button
                @click="openPaymentForm(row.id, row.totalAmount, row.number)"
                class="calc-action-btn"
                style="background:#F59E0B;color:white"
              >Подтвердить оплату</button>
              <div style="display:flex;gap:12px">
                <router-link :to="'/business/calculations/' + row.id" class="calc-action-link" style="color:#2563EB">Просмотреть</router-link>
              </div>
              <div
                v-if="row.paymentRejectionReason"
                style="font-size:11px;color:#DC2626;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"
                :title="row.paymentRejectionReason"
              >❌ Причина: {{ row.paymentRejectionReason }}</div>
            </template>
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
    </template>

    <!-- WIZARD VIEW -->
    <template v-else-if="viewMode === 'wizard'">
      <div class="max-w-6xl mx-auto">
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
                      ? 'bg-[#2D8B4E] text-white step-active-pulse'
                      : currentStep > step.number
                        ? 'bg-[#2D8B4E] text-white'
                        : 'bg-[#e2e8f0] text-[#64748b]'
                  ]"
                >
                  <svg v-if="currentStep > step.number" class="w-5 h-5 step-check-enter" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                  'flex-1 h-1 mx-2 lg:mx-4 rounded-full transition-all duration-500',
                  currentStep > step.number ? 'bg-[#2D8B4E]' : 'bg-[#e2e8f0]'
                ]"
              ></div>
            </template>
          </div>
        </div>

        <!-- Step Content -->
        <div class="bg-white rounded-2xl shadow-sm border border-[#e2e8f0]">
          <!-- Step 1: Basic Data -->
          <div v-if="currentStep === 1" class="p-6 lg:p-8">
            <h2 class="text-xl font-semibold text-[#1e293b] mb-6">Период и данные плательщика</h2>

            <div class="space-y-6">
              <!-- Payer Type Toggle -->
              <div>
                <label class="block text-sm font-medium text-[#1e293b] mb-3">Тип плательщика</label>
                <div class="inline-flex rounded-xl border border-[#e2e8f0] overflow-hidden bg-[#f8fafc]">
                  <button
                    type="button"
                    @click="payerType = 'producer'"
                    :class="[
                      'px-6 py-3 text-sm font-medium transition-all duration-200',
                      payerType === 'producer'
                        ? 'bg-[#f59e0b] text-white shadow-sm'
                        : 'text-[#64748b] hover:text-[#1e293b] hover:bg-white'
                    ]"
                  >Производитель</button>
                  <button
                    type="button"
                    @click="payerType = 'importer'"
                    :class="[
                      'px-6 py-3 text-sm font-medium transition-all duration-200',
                      payerType === 'importer'
                        ? 'bg-[#f59e0b] text-white shadow-sm'
                        : 'text-[#64748b] hover:text-[#1e293b] hover:bg-white'
                    ]"
                  >Импортёр</button>
                </div>
              </div>

              <!-- Producer: Quarter + Year -->
              <div v-if="payerType === 'producer'" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-[#1e293b] mb-2">Расчётный период <span class="text-[#EF4444]">*</span></label>
                  <select
                    v-model="calculationQuarter"
                    :class="[
                      'w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2',
                      validationErrors.quarter
                        ? 'border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]/20'
                        : 'border-[#e2e8f0] focus:border-[#f59e0b] focus:ring-[#f59e0b]/20'
                    ]"
                    @change="validationErrors.quarter && delete validationErrors.quarter"
                  >
                    <option value="">Выберите квартал</option>
                    <option value="Q1">I квартал</option>
                    <option value="Q2">II квартал</option>
                    <option value="Q3">III квартал</option>
                    <option value="Q4">IV квартал</option>
                  </select>
                  <p v-if="validationErrors.quarter" class="mt-1 text-xs text-[#EF4444]">{{ validationErrors.quarter }}</p>
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

              <!-- Producer deadline alert -->
              <div v-if="payerType === 'producer' && producerDeadlineFormatted" class="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                <div class="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p class="font-medium text-[#1e293b]">Срок подачи расчёта и оплаты</p>
                  <p class="text-sm text-[#64748b]">до {{ producerDeadlineFormatted }}</p>
                </div>
              </div>

              <!-- Importer: Date picker + Year -->
              <div v-if="payerType === 'importer'" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-[#1e293b] mb-2">Дата ввоза товаров на территорию КР <span class="text-[#EF4444]">*</span></label>
                  <input
                    type="date"
                    v-model="importDate"
                    :class="[
                      'w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2',
                      validationErrors.importDate
                        ? 'border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]/20'
                        : 'border-[#e2e8f0] focus:border-[#f59e0b] focus:ring-[#f59e0b]/20'
                    ]"
                    @change="validationErrors.importDate && delete validationErrors.importDate"
                  />
                  <p v-if="validationErrors.importDate" class="mt-1 text-xs text-[#EF4444]">{{ validationErrors.importDate }}</p>
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

              <!-- Importer deadline alert -->
              <div v-if="payerType === 'importer' && importerDeadlineFormatted && !importerDeadlinePassed" class="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                <div class="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p class="font-medium text-[#1e293b]">Срок подачи расчёта и оплаты</p>
                  <p class="text-sm text-[#64748b]">до {{ importerDeadlineFormatted }}. Осталось {{ importerDaysLeft }} рабочих дней</p>
                </div>
              </div>

              <!-- Importer deadline PASSED alert -->
              <div v-if="payerType === 'importer' && importerDeadlineFormatted && importerDeadlinePassed" class="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                <div class="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <p class="font-medium text-red-800">Срок подачи истёк. Просрочка.</p>
                  <p class="text-sm text-red-600">Крайний срок был: {{ importerDeadlineFormatted }}</p>
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
                  <p class="font-medium text-[#1e293b]">Сроки уплаты утилизационного сбора</p>
                  <p class="text-sm text-[#64748b]">а) производителями товаров, упаковки товаров — ежеквартально, не позднее 15 числа месяца, следующего за кварталом;<br/>б) импортёрами товаров, упаковки товаров — по факту ввоза товаров, упаковки товаров на территорию Кыргызской Республики, не позднее 15 рабочих дней с момента возникновения такого факта.</p>
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

            <!-- Table header hint -->
            <div class="pos-table-header">
              <div class="pos-table-header__cols">
                <span class="pos-table-header__col pos-table-header__col--group">Группа / Подгруппа</span>
                <span class="pos-table-header__col">Объём (гр.5)</span>
                <span class="pos-table-header__col">К переработке (гр.7)</span>
                <span class="pos-table-header__col">Доп. переработка / вывоз</span>
                <span class="pos-table-header__col pos-table-header__col--chevron"></span>
              </div>
              <span class="pos-table-header__hint">Нажмите на строку для подробностей</span>
            </div>

            <div class="space-y-4">
              <div v-for="(item, index) in productItems" :key="item.id" class="rounded-lg p-6 border border-[#e2e8f0] mb-5">
                <div class="flex items-center justify-between mb-4">
                  <span class="text-sm font-medium text-[#64748b]">Позиция {{ index + 1 }}</span>
                  <button v-if="productItems.length > 1" @click="removeProductItem(item.id)" class="text-red-500 hover:bg-red-50 p-1 rounded transition-colors">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
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

                <!-- Validation error for group -->
                <p v-if="validationErrors[`product_${index}_group`]" class="mt-1 text-xs text-[#EF4444]">{{ validationErrors[`product_${index}_group`] }}</p>

                <!-- ГСКП code for producers -->
                <div v-if="payerType === 'producer' && item.group" class="mt-3">
                  <label class="block text-xs text-[#64748b] mb-1">Гр.3: Код ГСКП</label>
                  <input
                    type="text"
                    v-model="item.gskpCode"
                    placeholder="Введите код ГСКП"
                    class="w-full max-w-xs px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#f59e0b] text-sm"
                  />
                </div>

                <!-- Compact row: 4 columns + chevron -->
                <div class="pos-row mt-4" @click="togglePosition(item.id)">
                  <div class="pos-row__cell pos-row__cell--group">
                    <span class="pos-row__group-name">{{ getGroupLabel(item.group) || 'Не выбрана' }}</span>
                    <span class="pos-row__subgroup-name">{{ getSubgroupLabel(item.group, item.subgroup) || '—' }}</span>
                  </div>
                  <div class="pos-row__cell pos-row__cell--input" @click.stop>
                    <span class="pos-row__label">Гр.5: Объём (т)</span>
                    <input
                      type="number"
                      v-model="item.volume"
                      @input="calculateAmount(item); validationErrors[`product_${index}_volume`] && delete validationErrors[`product_${index}_volume`]"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      :class="[
                        'pos-row__input',
                        validationErrors[`product_${index}_volume`] ? 'pos-row__input--error' : ''
                      ]"
                    />
                    <p v-if="validationErrors[`product_${index}_volume`]" class="mt-0.5 text-xs text-[#EF4444]">{{ validationErrors[`product_${index}_volume`] }}</p>
                  </div>
                  <div class="pos-row__cell pos-row__cell--computed">
                    <span class="pos-row__label">Гр.7: К переработке (т)</span>
                    <span class="pos-row__value text-[#6366f1]">{{ item.volumeToRecycle ? item.volumeToRecycle.toFixed(2) : '0.00' }}</span>
                  </div>
                  <div class="pos-row__cell pos-row__cell--input" @click.stop>
                    <span class="pos-row__label">Доп. переработка / вывоз</span>
                    <div class="pos-row__dual-inputs">
                      <div class="pos-row__mini-field">
                        <span class="pos-row__mini-label">Гр.8 Переработка</span>
                        <input
                          type="number"
                          v-model="item.transferredToRecycling"
                          @input="calculateAmount(item)"
                          step="0.01" min="0" placeholder="0.00"
                          :class="['pos-row__input pos-row__input--mini', getTransferredError(item) ? 'pos-row__input--error' : '']"
                        />
                      </div>
                      <div class="pos-row__mini-field">
                        <span class="pos-row__mini-label">Гр.9 Вывоз</span>
                        <input
                          type="number"
                          v-model="item.exportedFromKR"
                          @input="calculateAmount(item)"
                          step="0.01" min="0" placeholder="0.00"
                          :class="['pos-row__input pos-row__input--mini', getExportedError(item) ? 'pos-row__input--error' : '']"
                        />
                      </div>
                    </div>
                    <p v-if="getTransferredError(item)" class="mt-0.5 text-xs text-[#EF4444]">{{ getTransferredError(item) }}</p>
                    <p v-if="getExportedError(item)" class="mt-0.5 text-xs text-[#EF4444]">{{ getExportedError(item) }}</p>
                  </div>
                  <button class="pos-row__chevron" :class="{ 'pos-row__chevron--open': isPositionExpanded(item.id) }" @click.stop="togglePosition(item.id)" type="button" title="Подробности">
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                  </button>
                </div>

                <!-- Expandable details -->
                <div class="pos-expand" :class="{ 'pos-expand--open': isPositionExpanded(item.id) }">
                  <div class="pos-expand__inner">
                    <div class="pos-expand__grid">
                      <div class="pos-expand__item">
                        <span class="pos-expand__label">Норматив (гр.6)</span>
                        <span class="pos-expand__value">{{ item.recyclingStandard ? item.recyclingStandard + '%' : '—' }}</span>
                      </div>
                      <div class="pos-expand__item">
                        <span class="pos-expand__label">К переработке (гр.7)</span>
                        <span class="pos-expand__value">{{ item.volumeToRecycle ? item.volumeToRecycle.toFixed(2) + ' т' : '0.00 т' }}</span>
                      </div>
                      <div class="pos-expand__item">
                        <span class="pos-expand__label">Ранее передано (гр.8)</span>
                        <span class="pos-expand__value">{{ item.transferredToRecycling || '0' }} т</span>
                      </div>
                      <div class="pos-expand__item">
                        <span class="pos-expand__label">Ранее вывезено (гр.9)</span>
                        <span class="pos-expand__value">{{ item.exportedFromKR || '0' }} т</span>
                      </div>
                      <div class="pos-expand__item">
                        <span class="pos-expand__label">Облагаемый объём (гр.10)</span>
                        <span class="pos-expand__value">{{ item.taxableVolume ? item.taxableVolume.toFixed(2) + ' т' : '0.00 т' }}</span>
                      </div>
                      <div class="pos-expand__item">
                        <span class="pos-expand__label">Остаток к переработке</span>
                        <span class="pos-expand__value" :style="{ color: getRemaining(item) <= 0 ? '#10b981' : '#f59e0b', fontWeight: 700 }">
                          {{ getRemaining(item).toFixed(2) }} т
                        </span>
                      </div>
                    </div>
                    <!-- File attachments -->
                    <div class="pos-expand__files">
                      <div class="pos-expand__file-item" @click.stop>
                        <input :id="'recycled-file-' + item.id" type="file" class="hidden" @change="handleRecycledFileSelect(item, $event)" />
                        <div v-if="item.recycledFile" class="attach-link attach-link--done">
                          <span class="attach-link__file">{{ item.recycledFile.name }}</span>
                          <button @click="removeRecycledFile(item)" class="attach-link__remove" title="Удалить файл">&times;</button>
                        </div>
                        <label v-else :for="'recycled-file-' + item.id" :class="['attach-link', (parseFloat(item.transferredToRecycling) || 0) > 0 ? 'attach-link--warn' : '']">
                          {{ (parseFloat(item.transferredToRecycling) || 0) > 0 ? 'Прикрепите договор на переработку' : 'Прикрепить договор на переработку' }}
                        </label>
                      </div>
                      <div class="pos-expand__file-item" @click.stop>
                        <input :id="'exported-file-' + item.id" type="file" class="hidden" @change="handleExportedFileSelect(item, $event)" />
                        <div v-if="item.exportedFile" class="attach-link attach-link--done">
                          <span class="attach-link__file">{{ item.exportedFile.name }}</span>
                          <button @click="removeExportedFile(item)" class="attach-link__remove" title="Удалить файл">&times;</button>
                        </div>
                        <label v-else :for="'exported-file-' + item.id" :class="['attach-link', (parseFloat(item.exportedFromKR) || 0) > 0 ? 'attach-link--warn' : '']">
                          {{ (parseFloat(item.exportedFromKR) || 0) > 0 ? 'Прикрепите ГТД на вывоз' : 'Прикрепить ГТД на вывоз' }}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- СТРОКА 3: Итог (Графы 11-12) -->
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mt-3 bg-[#f8fafc] border-t border-dashed border-[#e5e7eb] rounded-b-lg px-4 py-3">
                  <span class="text-sm text-[#374151]">Гр.11 Ставка: <strong>{{ item.rate.toLocaleString('ru-RU') }}</strong> сом/т</span>
                  <span class="text-lg font-bold text-[#f59e0b]">Гр.12 Сумма: {{ item.amount.toLocaleString('ru-RU') }} сом</span>
                </div>
              </div>
            </div>

            <button @click="addProductItem" class="mt-4 flex items-center gap-2 text-[#f59e0b] hover:bg-amber-50 px-4 py-2 rounded-lg transition-colors">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Добавить позицию
            </button>

            <div class="mt-8 pt-6 border-t border-[#e2e8f0]">
              <div class="bg-gradient-to-r from-[#f59e0b]/10 to-[#d97706]/10 rounded-xl p-5 border border-[#f59e0b]/20">
                <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p class="text-xs text-[#64748b] mb-1">Гр.5: Общий объём</p>
                    <p class="text-lg font-bold text-[#1e293b]">{{ totalVolume }} т</p>
                  </div>
                  <div>
                    <p class="text-xs text-[#64748b] mb-1">Гр.7: К переработке</p>
                    <p class="text-lg font-bold text-[#6366f1]">{{ totalVolumeToRecycle }} т</p>
                  </div>
                  <div>
                    <p class="text-xs text-[#64748b] mb-1">Гр.8: Передано</p>
                    <p class="text-lg font-bold text-[#10b981]">{{ totalTransferred }} т</p>
                  </div>
                  <div>
                    <p class="text-xs text-[#64748b] mb-1">Гр.9: Вывезено из КР</p>
                    <p class="text-lg font-bold text-[#2563eb]">{{ totalExported }} т</p>
                  </div>
                </div>
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-[#f59e0b]/20">
                  <div>
                    <p class="text-xs text-[#64748b] mb-1">Гр.10: Облагаемый объём</p>
                    <p class="text-lg font-bold text-[#1e293b]">{{ totalTaxableVolume }} т</p>
                  </div>
                  <div class="sm:text-right">
                    <p class="text-xs text-[#64748b] mb-1">Гр.12: Итого к оплате</p>
                    <p class="text-2xl font-bold text-[#10b981]">{{ formattedTotalAmount }}</p>
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
                  <p class="font-bold" :style="{ color: deadlineStatus && (deadlineStatus.overdue || deadlineStatus.days <= 5) ? '#DC2626' : '#f59e0b' }">
                    {{ calculationResult.dueDate }}
                  </p>
                  <p v-if="deadlineStatus" class="text-xs mt-0.5" :style="{ color: deadlineStatus.overdue ? '#DC2626' : '#94a3b8' }">
                    <template v-if="deadlineStatus.overdue">Просрочено на {{ deadlineStatus.days }} дн.!</template>
                    <template v-else>Осталось {{ deadlineStatus.days }} дн.</template>
                  </p>
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
                    {{ payerType === 'producer' ? calculationQuarter + ' ' + calculationYear : 'Ввоз ' + (importDate ? new Date(importDate).toLocaleDateString('ru-RU') : '') }}
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
                      <th class="px-4 py-3 font-medium">Группа / подгруппа</th>
                      <th class="px-4 py-3 font-medium text-right">Гр.5 Объём (т)</th>
                      <th class="px-4 py-3 font-medium text-right">Гр.6 Норм. (%)</th>
                      <th class="px-4 py-3 font-medium text-right">Гр.7 К перер. (т)</th>
                      <th class="px-4 py-3 font-medium text-right">Гр.8 Передано (т)</th>
                      <th class="px-4 py-3 font-medium text-right">Гр.9 Вывезено (т)</th>
                      <th class="px-4 py-3 font-medium text-right">Гр.10 Облаг. (т)</th>
                      <th class="px-4 py-3 font-medium text-right">Гр.11 Ставка</th>
                      <th class="px-4 py-3 font-medium text-right">Гр.12 Сумма</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-[#e2e8f0]">
                    <tr v-for="item in productItems.filter(i => i.group && i.volume)" :key="item.id" class="hover:bg-[#f8fafc]">
                      <td class="px-4 py-3">
                        <span class="text-[#1e293b] block">{{ getGroupLabel(item.group) }}</span>
                        <span class="text-xs text-[#94a3b8]">{{ getSubgroupLabel(item.group, item.subgroup) }}</span>
                      </td>
                      <td class="px-4 py-3 text-right font-medium">{{ item.volume }}</td>
                      <td class="px-4 py-3 text-right">{{ item.recyclingStandard }}%</td>
                      <td class="px-4 py-3 text-right text-[#6366f1]">{{ item.volumeToRecycle.toFixed(2) }}</td>
                      <td class="px-4 py-3 text-right text-[#10b981]">{{ item.transferredToRecycling || '0' }}</td>
                      <td class="px-4 py-3 text-right text-[#2563eb]">{{ item.exportedFromKR || '0' }}</td>
                      <td class="px-4 py-3 text-right font-medium">{{ item.taxableVolume.toFixed(2) }}</td>
                      <td class="px-4 py-3 text-right">{{ item.rate.toLocaleString() }}</td>
                      <td class="px-4 py-3 text-right font-bold text-[#f59e0b]">{{ item.amount.toLocaleString() }}</td>
                    </tr>
                  </tbody>
                  <tfoot class="bg-[#f8fafc] font-semibold">
                    <tr>
                      <td class="px-4 py-3">Итого</td>
                      <td class="px-4 py-3 text-right">{{ totalVolume }}</td>
                      <td class="px-4 py-3 text-right">—</td>
                      <td class="px-4 py-3 text-right text-[#6366f1]">{{ totalVolumeToRecycle }}</td>
                      <td class="px-4 py-3 text-right text-[#10b981]">{{ totalTransferred }}</td>
                      <td class="px-4 py-3 text-right text-[#2563eb]">{{ totalExported }}</td>
                      <td class="px-4 py-3 text-right">{{ totalTaxableVolume }}</td>
                      <td class="px-4 py-3 text-right">—</td>
                      <td class="px-4 py-3 text-right text-[#f59e0b]">{{ totalAmount.toLocaleString() }}</td>
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
              class="btn-action btn-action-ghost"
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
                @click="handleStep1Next"
                class="btn-action btn-action-primary"
              >
                Далее
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <button
                v-if="currentStep === 2"
                @click="handleStep2Calculate"
                class="btn-action btn-action-primary"
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
                  class="btn-action btn-action-ghost"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  Сохранить черновик
                </button>

                <button
                  @click="submitForReview"
                  class="btn-action btn-action-primary"
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
              <p class="text-lg font-bold" :style="{ color: deadlineStatus && (deadlineStatus.overdue || deadlineStatus.days <= 5) ? '#DC2626' : '#f59e0b' }">
                {{ calculationResult.dueDate }}
              </p>
              <p v-if="deadlineStatus" class="text-xs mt-0.5" :style="{ color: deadlineStatus.overdue ? '#DC2626' : '#94a3b8' }">
                <template v-if="deadlineStatus.overdue">Просрочено на {{ deadlineStatus.days }} дн.!</template>
                <template v-else>Осталось {{ deadlineStatus.days }} дн.</template>
              </p>
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

/* Attach link-buttons under recycled/exported fields */
.attach-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #2563eb;
  cursor: pointer;
  text-decoration: underline dashed;
  text-underline-offset: 3px;
  transition: color 0.15s;
}

.attach-link:hover {
  color: #1d4ed8;
  text-decoration: underline solid;
}

.attach-link--warn {
  color: #d97706;
  text-decoration: underline dashed #d97706;
}

.attach-link--warn:hover {
  color: #b45309;
  text-decoration: underline solid #b45309;
}

.attach-link--done {
  color: #059669;
  cursor: default;
  text-decoration: none;
  gap: 6px;
}

.attach-link__file {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.attach-link__remove {
  color: #ef4444;
  font-size: 16px;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
  padding: 0 2px;
  border: none;
  background: none;
  transition: color 0.15s;
}

.attach-link__remove:hover {
  color: #dc2626;
}

/* Contextual action buttons in history table */
.calc-action-btn {
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}
.calc-action-btn:hover {
  filter: brightness(0.9);
}
.calc-action-link {
  background: none;
  border: none;
  font-size: 12px;
  color: #6B7280;
  cursor: pointer;
  padding: 0;
  transition: all 0.2s ease;
  text-decoration: none;
  white-space: nowrap;
}
.calc-action-link:hover {
  text-decoration: underline;
  opacity: 0.8;
}

/* Accepted status actions — compact pill buttons, right-aligned */
.calc-accepted-actions {
  display: flex;
  gap: 6px;
  justify-content: flex-end;
  margin-left: auto;
}
.calc-trio-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  border: none;
  border-radius: 16px;
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 500;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  white-space: nowrap;
  width: auto;
}
.calc-trio-btn--blue {
  background: #3B82F6;
}
.calc-trio-btn--blue:hover {
  background: #2563EB;
  box-shadow: 0 3px 10px rgba(59,130,246,0.3);
}
.calc-trio-btn--green {
  background: #22C55E;
}
.calc-trio-btn--green:hover {
  background: #16A34A;
  box-shadow: 0 3px 10px rgba(34,197,94,0.3);
}
.calc-trio-btn--purple {
  background: #8B5CF6;
}
.calc-trio-btn--purple:hover {
  background: #7C3AED;
  box-shadow: 0 3px 10px rgba(139,92,246,0.3);
}

/* ── Expandable positions table (Step 2) ── */
.pos-table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding: 0 4px;
}
.pos-table-header__cols {
  display: none;
}
.pos-table-header__hint {
  font-size: 12px;
  color: #94a3b8;
  font-style: italic;
  margin-left: auto;
}
@media (min-width: 1024px) {
  .pos-table-header__cols {
    display: flex;
    flex: 1;
    gap: 12px;
    align-items: center;
  }
  .pos-table-header__col {
    font-size: 11px;
    font-weight: 600;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .pos-table-header__col--group {
    flex: 2;
  }
  .pos-table-header__col:not(.pos-table-header__col--group):not(.pos-table-header__col--chevron) {
    flex: 1;
    text-align: center;
  }
  .pos-table-header__col--chevron {
    width: 40px;
    flex-shrink: 0;
  }
}

/* Compact row */
.pos-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-start;
  padding: 14px 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.15s ease, box-shadow 0.15s ease;
}
.pos-row:hover {
  background: #f1f5f9;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}
.pos-row__cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.pos-row__cell--group {
  flex: 2;
  min-width: 140px;
}
.pos-row__cell--input,
.pos-row__cell--computed {
  flex: 1;
  min-width: 120px;
}
.pos-row__group-name {
  font-weight: 600;
  font-size: 14px;
  color: #1e293b;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.pos-row__subgroup-name {
  font-size: 12px;
  color: #64748b;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.pos-row__label {
  font-size: 11px;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  font-weight: 500;
}
.pos-row__value {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.4;
}
.pos-row__input {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #1e293b;
  background: white;
  transition: border-color 0.15s;
  outline: none;
}
.pos-row__input:focus {
  border-color: #f59e0b;
}
.pos-row__input--error {
  border-color: #ef4444 !important;
}
.pos-row__input--mini {
  padding: 6px 8px;
  font-size: 13px;
}
.pos-row__dual-inputs {
  display: flex;
  gap: 8px;
}
.pos-row__mini-field {
  flex: 1;
  min-width: 0;
}
.pos-row__mini-label {
  display: block;
  font-size: 10px;
  color: #94a3b8;
  margin-bottom: 2px;
  white-space: nowrap;
}

/* Chevron */
.pos-row__chevron {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  transition: transform 0.3s ease, color 0.2s, background 0.2s;
  flex-shrink: 0;
  align-self: center;
  margin-top: 8px;
}
.pos-row__chevron:hover {
  background: #e2e8f0;
  color: #1e293b;
}
.pos-row__chevron--open {
  transform: rotate(180deg);
  color: #f59e0b;
}

/* Expandable details */
.pos-expand {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}
.pos-expand--open {
  max-height: 500px;
}
.pos-expand__inner {
  padding: 16px;
  background: #f8fafc;
  border-top: 1px dashed #e2e8f0;
}
.pos-expand__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px 24px;
}
.pos-expand__item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.pos-expand__label {
  font-size: 11px;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-weight: 500;
}
.pos-expand__value {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
}
.pos-expand__files {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid #e2e8f0;
}
.pos-expand__file-item {
  flex: 1;
  min-width: 200px;
}

/* Mobile: stack columns */
@media (max-width: 767px) {
  .pos-row {
    flex-direction: column;
    gap: 10px;
  }
  .pos-row__cell--group,
  .pos-row__cell--input,
  .pos-row__cell--computed {
    flex: none;
    width: 100%;
    min-width: 0;
  }
  .pos-row__chevron {
    align-self: flex-end;
    margin-top: -32px;
  }
  .pos-expand__grid {
    grid-template-columns: repeat(2, 1fr);
  }
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
</style>
