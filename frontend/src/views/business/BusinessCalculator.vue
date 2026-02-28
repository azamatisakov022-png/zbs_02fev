<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { validators, scrollToFirstError } from '../../utils/validators'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import SkeletonLoader from '../../components/dashboard/SkeletonLoader.vue'
import DataTable from '../../components/dashboard/DataTable.vue'
import EmptyState from '../../components/dashboard/EmptyState.vue'
import { productGroups, productSubgroups, getSubgroupLabel, type ProductSubgroup } from '../../data/product-groups'
import { getNormativeForGroup } from '../../data/recycling-norms'
import ProductGroupSelector from '../../components/ProductGroupSelector.vue'
import TnvedCode from '../../components/TnvedCode.vue'
import { generateCalculationExcel } from '../../utils/excelExport'
import { tnvedNotes, tnvedNotesSource } from '../../data/tnved-notes'
import { calculationStore, type CalculationStatus, type PaymentData } from '../../stores/calculations'
import { accountStore } from '../../stores/account'
import { CalcStatus, statusI18nKey } from '../../constants/statuses'
import { getStatusBadgeVariant } from '../../utils/statusVariant'
import { addWorkingDays, calculatePaymentDeadline, getRemainingDays, formatDateRu, formatDateShort } from '../../utils/dateUtils'
import InstructionDrawer from '../../components/InstructionDrawer.vue'
import { instructionCalculationHtml } from '../../data/instructionCalculation'
import { useBusinessMenu } from '../../composables/useRoleMenu'
import { toastStore } from '../../stores/toast'
import { notificationStore } from '../../stores/notifications'
import ConfirmDialog from '../../components/common/ConfirmDialog.vue'

const { roleTitle, menuItems } = useBusinessMenu()
const { t } = useI18n()

const router = useRouter()

const viewCalculation = (id: number) => {
  router.push({ path: `/business/calculations/${id}`, query: { from: 'calculations' } })
}
const mockAction = (action: string) => {
  toastStore.show({ type: 'info', title: action })
}

// Loading state
const isLoading = ref(true)
onMounted(() => { setTimeout(() => { isLoading.value = false }, 500) })

// View state
type ViewMode = 'list' | 'wizard' | 'result' | 'payment'
const viewMode = ref<ViewMode>('list')
const currentStep = ref(1)
const totalSteps = 3

const steps = computed(() => [
  { number: 1, title: t('businessCalc.stepPeriod') },
  { number: 2, title: t('businessCalc.stepProducts') },
  { number: 3, title: t('businessCalc.stepResult') },
])

// Draft saved notification
const showDraftNotification = ref(false)

// Confirm dialog state
const confirmDialog = ref({
  visible: false,
  title: '',
  message: '',
  icon: 'warning' as 'warning' | 'danger' | 'info' | 'success',
  confirmText: '',
  confirmColor: 'green' as 'green' | 'red' | 'orange',
  onConfirm: () => {},
})
const openConfirm = (opts: Partial<typeof confirmDialog.value> & { onConfirm: () => void }) => {
  Object.assign(confirmDialog.value, {
    visible: true,
    title: opts.title || t('businessCalc.confirmDefaultTitle'),
    message: opts.message || '',
    icon: opts.icon || 'warning',
    confirmText: opts.confirmText || t('businessCalc.confirmDefaultText'),
    confirmColor: opts.confirmColor || 'green',
    onConfirm: opts.onConfirm,
  })
}
const handleConfirm = () => {
  confirmDialog.value.visible = false
  confirmDialog.value.onConfirm()
}
const handleCancel = () => {
  confirmDialog.value.visible = false
}
const showRates = ref(false)
const showInstruction = ref(false)

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

const downloadExcel = (calcId: number) => {
  const calc = calculationStore.getCalculationById(calcId)
  if (!calc) return
  const recon = accountStore.getReconciliationForCalculation(calc.id)
  generateCalculationExcel(calc, companyData, recon)
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
  // Year-based norm from recycling-norms.ts
  const selectedYear = parseInt(calculationYear.value) || 2026
  const normFraction = getNormativeForGroup(item.group, selectedYear)
  item.recyclingStandard = Math.round(normFraction * 100)

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

// Гр.8 + Гр.9 validation: sum must not exceed Гр.5 (total volume)
const getVolumeError = (item: ProductItem): string => {
  const vol = parseFloat(item.volume) || 0
  const transferred = parseFloat(item.transferredToRecycling) || 0
  const exported = parseFloat(item.exportedFromKR) || 0
  if (vol > 0 && (transferred + exported) > vol) {
    return t('businessCalc.volumeExceedError')
  }
  return ''
}

// Norm status info (not an error)
type NormStatus = { met: boolean; message: string }
const getNormStatus = (item: ProductItem): NormStatus | null => {
  const vol = parseFloat(item.volume) || 0
  if (!item.group || vol <= 0) return null
  const transferred = parseFloat(item.transferredToRecycling) || 0
  const exported = parseFloat(item.exportedFromKR) || 0
  if (transferred + exported >= item.volumeToRecycle) {
    return { met: true, message: t('businessCalc.normMet') }
  }
  const taxable = item.taxableVolume
  if (taxable > 0) {
    return { met: false, message: t('businessCalc.normNotMet', { volume: taxable.toFixed(2) }) }
  }
  return null
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
  return totalAmount.value.toLocaleString() + ' ' + t('businessCalc.som')
})

const tnvedNotesOpen = ref(false)
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
    date: now.toLocaleDateString(),
    dueDate: deadline ? formatDateShort(deadline) : '—'
  }
  currentStep.value = 3
}

const startWizard = () => {
  currentStep.value = 1
  viewMode.value = 'wizard'
  formSubmitted.value = false
}

const backToList = () => {
  viewMode.value = 'list'
  currentStep.value = 1
  formSubmitted.value = false
  calculationQuarter.value = ''
  importDate.value = ''
  productItems.value = [{ id: 1, group: '', subgroup: '', gskpCode: '', tnvedCode: '', volume: '', recyclingStandard: 0, volumeToRecycle: 0, transferredToRecycling: '', recycledFile: null, exportedFromKR: '', exportedFile: null, taxableVolume: 0, rate: 0, amount: 0 }]
}

const createDeclaration = () => {
  toastStore.show({ type: 'info', title: t('businessCalc.declarationTitle'), message: t('businessCalc.declarationToast') })
}

// Form validation
const formSubmitted = ref(false)
const validationErrors = ref<Record<string, string>>({})

const formErrors = computed(() => {
  const errors: Record<string, string> = {}

  // Period validation
  if (payerType.value === 'producer') {
    const quarterErr = validators.required(calculationQuarter.value, t('businessCalc.calcPeriodLabel'))
    if (quarterErr) errors.quarter = t('businessCalc.errSelectPeriod')
  } else {
    const dateErr = validators.required(importDate.value, t('businessCalc.importDateLabel'))
    if (dateErr) errors.importDate = t('businessCalc.errSelectImportDate')
  }

  // Items array must have at least 1 item with group and volume
  const validItems = productItems.value.filter(i => i.group && i.volume && parseFloat(i.volume) > 0)
  if (validItems.length === 0) {
    errors.products = t('businessCalc.errAddPosition')
  }

  // Per-item field validations
  productItems.value.forEach((item, index) => {
    // Group required
    const groupErr = validators.required(item.group, t('businessCalc.errSelectGroup'))
    if (groupErr) errors[`product_${index}_group`] = t('businessCalc.errSelectGroup')

    // Volume (Гр.5): required + positiveNumber
    const volRequired = validators.required(item.volume, t('businessCalc.volumeLabel'))
    if (volRequired) {
      errors[`product_${index}_volume`] = t('businessCalc.errEnterVolume')
    } else {
      const volPositive = validators.positiveNumber(item.volume, t('businessCalc.volumeLabel'))
      if (volPositive) {
        errors[`product_${index}_volume`] = volPositive
      } else if (parseFloat(item.volume) <= 0) {
        errors[`product_${index}_volume`] = t('businessCalc.errVolumePositive')
      }
    }

    const vol = parseFloat(item.volume) || 0

    // Transferred to recycling (Гр.8): positiveNumber, maxValue(volume)
    if (item.transferredToRecycling !== '') {
      const trPositive = validators.positiveNumber(item.transferredToRecycling, 'Гр.8')
      if (trPositive) {
        errors[`product_${index}_transferred`] = trPositive
      } else if (vol > 0) {
        const trMax = validators.maxValue(item.transferredToRecycling, vol, 'Гр.8')
        if (trMax) errors[`product_${index}_transferred`] = trMax
      }
    }

    // Exported from KR (Гр.9): positiveNumber, maxValue(volume)
    if (item.exportedFromKR !== '') {
      const exPositive = validators.positiveNumber(item.exportedFromKR, 'Гр.9')
      if (exPositive) {
        errors[`product_${index}_exported`] = exPositive
      } else if (vol > 0) {
        const exMax = validators.maxValue(item.exportedFromKR, vol, 'Гр.9')
        if (exMax) errors[`product_${index}_exported`] = exMax
      }
    }

    // Custom: transferred + exported <= volume
    const transferred = parseFloat(item.transferredToRecycling) || 0
    const exported = parseFloat(item.exportedFromKR) || 0
    if (vol > 0 && (transferred + exported) > vol) {
      errors[`product_${index}_sum`] = t('businessCalc.errSumExceedsVolume')
    }
  })

  return errors
})

const hasErrors = computed(() => Object.keys(formErrors.value).length > 0)

const validateStep1 = (): boolean => {
  const errors: Record<string, string> = {}
  if (payerType.value === 'producer') {
    if (!calculationQuarter.value) {
      errors.quarter = t('businessCalc.errSelectQuarter')
    }
  } else {
    if (!importDate.value) {
      errors.importDate = t('businessCalc.errSelectImportDateShort')
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
      errors[`product_${index}_group`] = t('businessCalc.errSelectGroup')
    }
    if (!item.volume || parseFloat(item.volume) <= 0) {
      errors[`product_${index}_volume`] = t('businessCalc.errEnterVolumeAboveZero')
    }
    if (item.group && item.volume && parseFloat(item.volume) > 0) {
      hasValidProduct = true
    }
  })

  if (!hasValidProduct) {
    errors.products = t('businessCalc.errAddProductWithData')
  }

  validationErrors.value = errors
  return Object.keys(errors).length === 0
}

const handleStep1Next = () => {
  formSubmitted.value = true
  // Check period-related errors from formErrors
  const step1HasErrors = payerType.value === 'producer'
    ? !!formErrors.value.quarter
    : !!formErrors.value.importDate
  if (step1HasErrors) {
    scrollToFirstError()
    return
  }
  formSubmitted.value = false
  if (validateStep1()) {
    nextStep()
  }
}

const handleStep2Calculate = () => {
  formSubmitted.value = true
  // Check step 2 relevant errors (products, per-item fields)
  const step2ErrorKeys = Object.keys(formErrors.value).filter(
    k => k === 'products' || k.startsWith('product_')
  )
  if (step2ErrorKeys.length > 0) {
    scrollToFirstError()
    return
  }
  formSubmitted.value = false
  if (validateStep2()) {
    performCalculation()
  }
}

// Export / Print handlers
const handleDownloadPdf = () => {
  toastStore.show({ type: 'info', title: 'PDF', message: t('businessCalc.pdfToast') })
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

// Recalculate norms when year changes
watch(calculationYear, () => {
  productItems.value.forEach(item => {
    if (item.group) {
      updateItemRate(item)
    }
  })
})

// Table data for history
const columns = computed(() => [
  { key: 'number', label: t('businessCalc.colNumber'), width: '10%' },
  { key: 'period', label: t('businessCalc.colPeriod'), width: '8%' },
  { key: 'amount', label: t('businessCalc.colAmount'), width: '12%' },
  { key: 'createdAt', label: t('businessCalc.colCalcDate'), width: '10%' },
  { key: 'status', label: t('businessCalc.colStatus'), width: '12%' },
])

const calculations = computed(() => {
  return calculationStore.getBusinessCalculations(companyData.name).map(c => ({
    id: c.id,
    number: c.number,
    period: c.period,
    amount: c.totalAmount.toLocaleString() + ' ' + t('businessCalc.som'),
    createdAt: c.date,
    status: c.status,
    rejectionReason: c.rejectionReason,
    rejectedAt: c.rejectedAt,
    rejectedBy: c.rejectedBy,
    paymentRejectionReason: c.paymentRejectionReason,
    totalAmount: c.totalAmount,
    parentId: c.parentId,
    parentNumber: c.parentId ? calculationStore.getCalculationById(c.parentId)?.number : undefined,
  }))
})

const statusStyles: Record<string, string> = {
  [CalcStatus.DRAFT]: 'background:#F3F4F6;color:#6B7280',
  [CalcStatus.UNDER_REVIEW]: 'background:#FEF3C7;color:#92400E',
  [CalcStatus.APPROVED]: 'background:#D1FAE5;color:#065F46',
  [CalcStatus.PAID]: 'background:#DBEAFE;color:#1D4ED8',
  [CalcStatus.REJECTED]: 'background:#FEE2E2;color:#991B1B',
  [CalcStatus.PAYMENT_PENDING]: 'background:#EDE9FE;color:#6D28D9',
  [CalcStatus.PAYMENT_REJECTED]: 'background:#FEE2E2;color:#991B1B',
}
const getStatusStyle = (status: string) => statusStyles[status] || 'background:#F3F4F6;color:#6B7280'

// Row class for colored left indicator
const calcRowClass = (row: Record<string, any>) => {
  const map: Record<string, string> = {
    [CalcStatus.PAID]: 'calc-row--paid',
    [CalcStatus.APPROVED]: 'calc-row--accepted',
    [CalcStatus.UNDER_REVIEW]: 'calc-row--review',
    [CalcStatus.DRAFT]: 'calc-row--draft',
    [CalcStatus.REJECTED]: 'calc-row--rejected',
    [CalcStatus.PAYMENT_PENDING]: 'calc-row--pay-review',
    [CalcStatus.PAYMENT_REJECTED]: 'calc-row--pay-rejected',
  }
  return map[row.status] || ''
}

// Rejection tooltip
const tooltipRowId = ref<number | null>(null)
const tooltipPos = ref({ top: 0, left: 0 })
let tooltipTimer: ReturnType<typeof setTimeout> | null = null

const showTooltip = (id: number, event: MouseEvent) => {
  if (tooltipTimer) clearTimeout(tooltipTimer)
  const el = event.currentTarget as HTMLElement
  tooltipTimer = setTimeout(() => {
    const rect = el.getBoundingClientRect()
    tooltipPos.value = {
      top: rect.bottom + 8,
      left: Math.min(rect.left, window.innerWidth - 420),
    }
    tooltipRowId.value = id
  }, 200)
}
const hideTooltip = () => {
  if (tooltipTimer) clearTimeout(tooltipTimer)
  tooltipRowId.value = null
}

// More menu (⋯)
const openMenuId = ref<number | null>(null)
const toggleMenu = (id: number) => {
  openMenuId.value = openMenuId.value === id ? null : id
}
const closeMenu = () => {
  openMenuId.value = null
}

// Save as draft
const saveDraft = () => {
  const now = new Date()
  const num = String(Math.floor(Math.random() * 900) + 100)
  const calcData = {
    number: calculationResult.value.number || `РС-${now.getFullYear()}-${num}`,
    date: calculationResult.value.date || now.toLocaleDateString(),
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
  calculationStore.addCalculation(calcData, CalcStatus.DRAFT)
  viewMode.value = 'list'
  currentStep.value = 1
  showDraftNotification.value = true
  setTimeout(() => { showDraftNotification.value = false }, 4000)
}

// Submit for review
const submitForReview = () => {
  formSubmitted.value = true
  if (hasErrors.value) {
    scrollToFirstError()
    return
  }
  openConfirm({
    icon: 'warning',
    title: t('businessCalc.confirmSendTitle'),
    message: t('businessCalc.confirmSendMessage'),
    confirmText: t('businessCalc.confirmSendBtn'),
    confirmColor: 'green',
    onConfirm: () => {
      const now = new Date()
      const num = String(Math.floor(Math.random() * 900) + 100)
      const calcData = {
        number: calculationResult.value.number || `РС-${now.getFullYear()}-${num}`,
        date: calculationResult.value.date || now.toLocaleDateString(),
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
      calculationStore.addCalculation(calcData, CalcStatus.UNDER_REVIEW)
      notificationStore.add({
        type: 'info',
        title: t('businessCalc.notifNewCalc'),
        message: t('businessCalc.notifNewCalcMessage', { company: companyData.name }),
        role: 'eco-operator'
      })
      notificationStore.add({
        type: 'success',
        title: t('businessCalc.notifCalcSent'),
        message: t('businessCalc.notifCalcSentMessage'),
        role: 'business',
        link: '/business/calculator'
      })
      viewMode.value = 'result'
    },
  })
}

// Resubmit rejected calculation
const resubmitCalculation = (id: number) => {
  openConfirm({
    icon: 'warning',
    title: t('businessCalc.confirmResendTitle'),
    message: t('businessCalc.confirmResendMessage'),
    confirmText: t('businessCalc.confirmResendBtn'),
    confirmColor: 'green',
    onConfirm: () => {
      calculationStore.resubmitCalculation(id)
    },
  })
}

// Copy rejected calculation and open for editing
const copyAndFixCalculation = (sourceId: number) => {
  const copy = calculationStore.copyCalculation(sourceId)
  if (copy) {
    toastStore.show({ type: 'success', title: t('businessCalc.copyCreated'), message: t('businessCalc.copyCreatedMessage') })
    router.push({ path: '/business/calculations/' + copy.id, query: { from: 'calculations' } })
  }
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
    paymentAmountError.value = t('businessCalc.paymentAmountMismatch', { amount: paymentCalcAmount.value.toLocaleString() })
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
    toastStore.show({ type: 'warning', title: t('businessCalc.invalidFormat'), message: t('businessCalc.allowedFormats') })
    return
  }
  if (file.size > 10 * 1024 * 1024) {
    toastStore.show({ type: 'warning', title: t('businessCalc.fileTooLarge'), message: t('businessCalc.maxFileSize') })
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
    :roleTitle="roleTitle"
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
          {{ $t('businessCalc.draftSaved') }}
        </div>
      </Transition>
    </Teleport>

    <!-- LIST VIEW -->
    <template v-if="viewMode === 'list'">
      <div class="content__header mb-6">
        <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b] mb-2">{{ $t('businessCalc.pageTitle') }}</h1>
        <p class="text-[#64748b]">{{ $t('businessCalc.pageSubtitle') }}</p>
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
            <h2 class="text-xl lg:text-2xl font-bold mb-2">{{ $t('businessCalc.bannerTitle') }}</h2>
            <p class="text-white/80 text-sm lg:text-base">{{ $t('businessCalc.bannerDescription') }}</p>
          </div>
          <button
            @click="startWizard"
            class="flex items-center justify-center gap-2 bg-white text-[#f59e0b] px-6 py-3 lg:px-8 lg:py-4 rounded-xl font-semibold hover:bg-amber-50 transition-colors shadow-lg flex-shrink-0"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            {{ $t('businessCalc.startCalc') }}
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
          <p class="font-medium text-[#1e293b]">{{ $t('businessCalc.infoTitle') }}</p>
          <p class="text-sm text-[#64748b]">{{ $t('businessCalc.infoDescription') }}
            <button @click="showInstruction = true" class="text-[#2D8B4E] hover:underline font-medium inline-flex items-center gap-1 mt-1">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {{ $t('businessCalc.instructionLink') }}
            </button>
          </p>
        </div>
      </div>

      <template v-if="isLoading">
        <div class="mb-6"><SkeletonLoader variant="card" /></div>
        <SkeletonLoader variant="table" />
      </template>

      <template v-if="!isLoading">
      <!-- Stats -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
          <p class="text-sm text-[#64748b] mb-1">{{ $t('businessCalc.totalCalcs') }}</p>
          <p class="text-2xl font-bold text-[#1e293b]">12</p>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
          <p class="text-sm text-[#64748b] mb-1">{{ $t('businessCalc.paidForYear') }}</p>
          <p class="text-2xl font-bold text-[#10b981]">161 050 {{ $t('businessCalc.som') }}</p>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
          <p class="text-sm text-[#64748b] mb-1">{{ $t('businessCalc.toPay') }}</p>
          <p class="text-2xl font-bold text-[#f59e0b]">0 {{ $t('businessCalc.som') }}</p>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
          <p class="text-sm text-[#64748b] mb-1">{{ $t('businessCalc.lastCalc') }}</p>
          <p class="text-2xl font-bold text-[#2563eb]">Q4 2025</p>
        </div>
      </div>

      <!-- History Table -->
      <div class="mb-4">
        <h2 class="text-lg font-semibold text-[#1e293b] mb-4">{{ $t('businessCalc.historyTitle') }}</h2>
      </div>

      <DataTable :columns="columns" :data="calculations" :actions="true" :rowClass="calcRowClass">
        <template #empty>
          <EmptyState
            :icon="'<svg class=&quot;w-10 h-10&quot; fill=&quot;none&quot; viewBox=&quot;0 0 40 40&quot; stroke=&quot;currentColor&quot; stroke-width=&quot;1.5&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; d=&quot;M15 11.67h10m0 16.66v-5m-5 5h.017M15 28.33h.017M15 23.33h.017M20 23.33h.017M25 18.33h.017M20 18.33h.017M15 18.33h.017M11.67 35h16.66A3.33 3.33 0 0031.67 31.67V8.33A3.33 3.33 0 0028.33 5H11.67A3.33 3.33 0 008.33 8.33v23.34A3.33 3.33 0 0011.67 35z&quot;/></svg>'"
            :title="$t('businessCalc.emptyTitle')"
            :description="$t('businessCalc.emptyDescription')"
            :actionLabel="$t('businessCalc.emptyAction')"
            @action="startWizard()"
          />
        </template>
        <template #cell-number="{ value, row }">
          <span class="font-mono font-medium text-[#2563eb]">{{ value }}</span>
          <div v-if="row.parentNumber" class="text-[11px] text-amber-600 mt-0.5">{{ $t('businessCalc.resubmitted', { number: row.parentNumber }) }}</div>
        </template>
        <template #cell-amount="{ value }">
          <span class="font-semibold text-[#1e293b]">{{ value }}</span>
        </template>
        <template #cell-status="{ value, row }">
          <!-- Отклонено: badge + warning icon + tooltip on hover -->
          <div
            v-if="value === 'rejected'"
            class="status-badge-wrap"
            @mouseenter="showTooltip(row.id, $event)"
            @mouseleave="hideTooltip()"
          >
            <span
              :style="getStatusStyle(value)"
              style="display:inline-flex;align-items:center;gap:4px;border-radius:12px;padding:4px 12px;font-size:12px;font-weight:500;white-space:nowrap;cursor:default"
            >
              {{ value }}
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="flex-shrink:0"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </span>
            <!-- Tooltip -->
            <div
              v-if="tooltipRowId === row.id"
              class="status-tooltip"
              :style="{ top: tooltipPos.top + 'px', left: tooltipPos.left + 'px' }"
            >
              <div class="status-tooltip__arrow"></div>
              <div class="status-tooltip__title">{{ $t('businessCalc.rejectionReason') }}</div>
              <div class="status-tooltip__text">{{ row.rejectionReason }}</div>
              <div v-if="row.rejectedBy || row.rejectedAt" class="status-tooltip__meta">
                <template v-if="row.rejectedBy">{{ row.rejectedBy }}</template>
                <template v-if="row.rejectedBy && row.rejectedAt"> &middot; </template>
                <template v-if="row.rejectedAt">{{ row.rejectedAt }}</template>
              </div>
            </div>
          </div>
          <!-- Оплачено: checkmark badge -->
          <span
            v-else-if="value === 'paid'"
            :style="getStatusStyle(value)"
            style="display:inline-flex;align-items:center;gap:4px;border-radius:12px;padding:4px 12px;font-size:12px;font-weight:500;white-space:nowrap"
          >
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="flex-shrink:0"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
            {{ value }}
          </span>
          <!-- All other statuses: simple badge -->
          <span
            v-else
            :style="getStatusStyle(value)"
            style="display:inline-block;border-radius:12px;padding:4px 12px;font-size:12px;font-weight:500;white-space:nowrap"
          >{{ value }}</span>
        </template>
        <template #actions="{ row }">
          <div class="act-wrap">
            <!-- Черновик: [Отправить (filled green)] [Редактировать (outline)] [⋯ → Удалить] -->
            <template v-if="row.status === 'draft'">
              <button @click="calculationStore.submitForReview(row.id)" class="act-btn act-btn--filled act-btn--green">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                {{ $t('businessCalc.sendBtn') }}
              </button>
              <router-link :to="{ path: '/business/calculations/' + row.id, query: { from: 'calculations', edit: 'true' } }" class="act-btn act-btn--outline">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                {{ $t('businessCalc.editBtn') }}
              </router-link>
              <div class="act-more-wrap">
                <button class="act-more" @click.stop="toggleMenu(row.id)">&#x22EF;</button>
                <div v-if="openMenuId === row.id" class="act-dropdown" @mouseleave="closeMenu">
                  <button class="act-dropdown__item act-dropdown__item--red" @click="mockAction($t('businessCalc.deleteBtn') + ' ' + row.number); closeMenu()">
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    {{ $t('businessCalc.deleteBtn') }}
                  </button>
                </div>
              </div>
            </template>
            <!-- На проверке: [Просмотреть (outline)] -->
            <template v-else-if="row.status === 'under_review'">
              <router-link :to="{ path: '/business/calculations/' + row.id, query: { from: 'calculations' } }" class="act-btn act-btn--outline">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                {{ $t('businessCalc.viewBtn') }}
              </router-link>
            </template>
            <!-- Принято: [Оплатить (filled green)] [Просмотреть (outline)] [⋯ → PDF, Excel] -->
            <template v-else-if="row.status === 'approved'">
              <button @click="openPaymentForm(row.id, row.totalAmount, row.number)" class="act-btn act-btn--filled act-btn--green">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                {{ $t('businessCalc.payBtn') }} {{ row.totalAmount.toLocaleString() }} {{ $t('businessCalc.som') }}
              </button>
              <router-link :to="{ path: '/business/calculations/' + row.id, query: { from: 'calculations' } }" class="act-btn act-btn--outline">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                {{ $t('businessCalc.viewBtn') }}
              </router-link>
              <div class="act-more-wrap">
                <button class="act-more" @click.stop="toggleMenu(row.id)">&#x22EF;</button>
                <div v-if="openMenuId === row.id" class="act-dropdown" @mouseleave="closeMenu">
                  <button class="act-dropdown__item" @click="router.push({ path: '/business/calculations/' + row.id, query: { from: 'calculations', print: 'true' } }); closeMenu()">
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    {{ $t('businessCalc.downloadPdf') }}
                  </button>
                  <button class="act-dropdown__item" @click="downloadExcel(row.id); closeMenu()">
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    {{ $t('businessCalc.downloadExcel') }}
                  </button>
                </div>
              </div>
            </template>
            <!-- Оплачено: [Просмотреть (outline)] [⋯ → PDF, Excel] -->
            <template v-else-if="row.status === 'paid'">
              <router-link :to="{ path: '/business/calculations/' + row.id, query: { from: 'calculations' } }" class="act-btn act-btn--outline">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                {{ $t('businessCalc.viewBtn') }}
              </router-link>
              <div class="act-more-wrap">
                <button class="act-more" @click.stop="toggleMenu(row.id)">&#x22EF;</button>
                <div v-if="openMenuId === row.id" class="act-dropdown" @mouseleave="closeMenu">
                  <button class="act-dropdown__item" @click="router.push({ path: '/business/calculations/' + row.id, query: { from: 'calculations', print: 'true' } }); closeMenu()">
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    {{ $t('businessCalc.downloadPdf') }}
                  </button>
                  <button class="act-dropdown__item" @click="downloadExcel(row.id); closeMenu()">
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    {{ $t('businessCalc.downloadExcel') }}
                  </button>
                </div>
              </div>
            </template>
            <!-- Отклонено: [Исправить (filled orange)] [Просмотреть (outline)] -->
            <template v-else-if="row.status === 'rejected'">
              <router-link :to="{ path: '/business/calculations/' + row.id, query: { from: 'calculations', edit: 'true' } }" class="act-btn act-btn--filled act-btn--orange">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                {{ $t('businessCalc.fixBtn') }}
              </router-link>
              <router-link :to="{ path: '/business/calculations/' + row.id, query: { from: 'calculations' } }" class="act-btn act-btn--outline">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                {{ $t('businessCalc.viewBtn') }}
              </router-link>
            </template>
            <!-- Оплата на проверке: [Просмотреть (outline)] -->
            <template v-else-if="row.status === 'payment_pending'">
              <router-link :to="{ path: '/business/calculations/' + row.id, query: { from: 'calculations' } }" class="act-btn act-btn--outline">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                {{ $t('businessCalc.viewBtn') }}
              </router-link>
            </template>
            <!-- Оплата отклонена: [Подтвердить оплату (filled orange)] [Просмотреть (outline)] -->
            <template v-else-if="row.status === 'payment_rejected'">
              <button @click="openPaymentForm(row.id, row.totalAmount, row.number)" class="act-btn act-btn--filled act-btn--orange">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                {{ $t('businessCalc.confirmPayment') }}
              </button>
              <router-link :to="{ path: '/business/calculations/' + row.id, query: { from: 'calculations' } }" class="act-btn act-btn--outline">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                {{ $t('businessCalc.viewBtn') }}
              </router-link>
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
            <span class="font-medium text-[#64748b]">{{ $t('businessCalc.ratesTitle') }}</span>
            <span v-if="!showRates" class="text-xs text-[#94a3b8] ml-2 hidden sm:inline">{{ $t('businessCalc.ratesExpand') }}</span>
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
                  <p class="font-bold text-[#1e293b]">{{ group.baseRate.toLocaleString() }} {{ $t('businessCalc.som') }}</p>
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
            {{ $t('businessCalc.backToList') }}
          </button>
          <div class="flex items-center justify-between gap-4">
            <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b]">{{ $t('businessCalc.pageTitle') }}</h1>
            <button @click="showInstruction = true" class="flex items-center gap-2 text-[#2D8B4E] hover:bg-[#ecfdf5] px-4 py-2 rounded-xl transition-colors text-sm font-medium flex-shrink-0">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ $t('businessCalc.instructionBtn') }}
            </button>
          </div>
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
            <h2 class="text-xl font-semibold text-[#1e293b] mb-6">{{ $t('businessCalc.periodAndPayerTitle') }}</h2>

            <div class="space-y-6">
              <!-- Payer Type Toggle -->
              <div>
                <label class="block text-sm font-medium text-[#1e293b] mb-3">{{ $t('businessCalc.payerTypeLabel') }}</label>
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
                  >{{ $t('businessCalc.producer') }}</button>
                  <button
                    type="button"
                    @click="payerType = 'importer'"
                    :class="[
                      'px-6 py-3 text-sm font-medium transition-all duration-200',
                      payerType === 'importer'
                        ? 'bg-[#f59e0b] text-white shadow-sm'
                        : 'text-[#64748b] hover:text-[#1e293b] hover:bg-white'
                    ]"
                  >{{ $t('businessCalc.importer') }}</button>
                </div>
              </div>

              <!-- Producer: Quarter + Year -->
              <div v-if="payerType === 'producer'" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-[#1e293b] mb-2">{{ $t('businessCalc.calcPeriodLabel') }} <span class="text-[#EF4444]">*</span></label>
                  <select
                    v-model="calculationQuarter"
                    :class="[
                      'w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2',
                      (validationErrors.quarter || (formSubmitted && formErrors.quarter))
                        ? 'border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]/20 vld-input--error'
                        : 'border-[#e2e8f0] focus:border-[#f59e0b] focus:ring-[#f59e0b]/20'
                    ]"
                    @change="validationErrors.quarter && delete validationErrors.quarter"
                  >
                    <option value="">{{ $t('businessCalc.selectQuarter') }}</option>
                    <option value="Q1">{{ $t('businessCalc.quarterI') }}</option>
                    <option value="Q2">{{ $t('businessCalc.quarterII') }}</option>
                    <option value="Q3">{{ $t('businessCalc.quarterIII') }}</option>
                    <option value="Q4">{{ $t('businessCalc.quarterIV') }}</option>
                  </select>
                  <p v-if="validationErrors.quarter" class="mt-1 text-xs text-[#EF4444]">{{ validationErrors.quarter }}</p>
                  <p v-else-if="formSubmitted && formErrors.quarter" class="vld-error" data-validation-error>
                    <span class="vld-error__icon">&#9888;</span> {{ formErrors.quarter }}
                  </p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-[#1e293b] mb-2">{{ $t('businessCalc.yearLabel') }}</label>
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
                  <p class="font-medium text-[#1e293b]">{{ $t('businessCalc.deadlineTitle') }}</p>
                  <p class="text-sm text-[#64748b]">{{ $t('businessCalc.deadlineBefore', { date: producerDeadlineFormatted }) }}</p>
                </div>
              </div>

              <!-- Importer: Date picker + Year -->
              <div v-if="payerType === 'importer'" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-[#1e293b] mb-2">{{ $t('businessCalc.importDateLabel') }} <span class="text-[#EF4444]">*</span></label>
                  <input
                    type="date"
                    v-model="importDate"
                    :class="[
                      'w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2',
                      (validationErrors.importDate || (formSubmitted && formErrors.importDate))
                        ? 'border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]/20 vld-input--error'
                        : 'border-[#e2e8f0] focus:border-[#f59e0b] focus:ring-[#f59e0b]/20'
                    ]"
                    @change="validationErrors.importDate && delete validationErrors.importDate"
                  />
                  <p v-if="validationErrors.importDate" class="mt-1 text-xs text-[#EF4444]">{{ validationErrors.importDate }}</p>
                  <p v-else-if="formSubmitted && formErrors.importDate" class="vld-error" data-validation-error>
                    <span class="vld-error__icon">&#9888;</span> {{ formErrors.importDate }}
                  </p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-[#1e293b] mb-2">{{ $t('businessCalc.yearLabel') }}</label>
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
                  <p class="font-medium text-[#1e293b]">{{ $t('businessCalc.deadlineTitle') }}</p>
                  <p class="text-sm text-[#64748b]">{{ $t('businessCalc.deadlineBeforeWithDays', { date: importerDeadlineFormatted, days: importerDaysLeft }) }}</p>
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
                  <p class="font-medium text-red-800">{{ $t('businessCalc.deadlineExpired') }}</p>
                  <p class="text-sm text-red-600">{{ $t('businessCalc.deadlineWas', { date: importerDeadlineFormatted }) }}</p>
                </div>
              </div>

              <div class="bg-[#f8fafc] rounded-xl p-5 border border-[#e2e8f0]">
                <div class="flex items-center gap-2 mb-4">
                  <svg class="w-5 h-5 text-[#f59e0b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <h3 class="font-medium text-[#1e293b]">{{ $t('businessCalc.payerDataTitle') }}</h3>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs text-[#64748b] mb-1">{{ $t('businessCalc.companyNameLabel') }}</label>
                    <input type="text" :value="companyData.name" readonly class="w-full px-3 py-2 bg-white border border-[#e2e8f0] rounded-lg text-[#1e293b] cursor-not-allowed" />
                  </div>
                  <div>
                    <label class="block text-xs text-[#64748b] mb-1">{{ $t('businessCalc.innLabel') }}</label>
                    <input type="text" :value="companyData.inn" readonly class="w-full px-3 py-2 bg-white border border-[#e2e8f0] rounded-lg text-[#1e293b] cursor-not-allowed" />
                  </div>
                  <div class="sm:col-span-2">
                    <label class="block text-xs text-[#64748b] mb-1">{{ $t('businessCalc.addressLabel') }}</label>
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
                  <p class="font-medium text-[#1e293b]">{{ $t('businessCalc.paymentTermsTitle') }}</p>
                  <p class="text-sm text-[#64748b]" v-html="$t('businessCalc.paymentTermsText')"></p>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 2: Products -->
          <div v-if="currentStep === 2" class="p-6 lg:p-8">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 class="text-xl font-semibold text-[#1e293b]">{{ $t('businessCalc.productsTitle') }}</h2>
              <button @click="importFromDeclaration" class="flex items-center gap-2 text-[#f59e0b] hover:bg-amber-50 px-4 py-2 rounded-lg transition-colors">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                {{ $t('businessCalc.importFromDeclaration') }}
              </button>
            </div>

            <p v-if="formSubmitted && formErrors.products" class="vld-error mb-4" data-validation-error>
              <span class="vld-error__icon">&#9888;</span> {{ formErrors.products }}
            </p>

            <div class="space-y-4">
              <div v-for="(item, index) in productItems" :key="item.id" class="cf-card">
                <!-- Card header -->
                <div class="flex items-center justify-between mb-4">
                  <span class="text-sm font-semibold text-[#64748b]">{{ $t('businessCalc.positionN', { n: index + 1 }) }}</span>
                  <button v-if="productItems.length > 1" @click="removeProductItem(item.id)" class="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors" :title="$t('businessCalc.deletePosition')">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                <!-- BLOCK 1: Product group selection -->
                <div class="cf-info">
                  <ProductGroupSelector
                    :group="item.group"
                    :subgroup="item.subgroup"
                    @update:group="(v: string) => { item.group = v; item.subgroup = ''; item.tnvedCode = ''; updateItemRate(item) }"
                    @update:subgroup="(v: string) => { item.subgroup = v; updateItemRate(item) }"
                    @subgroup-selected="(data: ProductSubgroup | null) => { if (data) item.tnvedCode = data.code }"
                    accent-color="#f59e0b"
                  />
                  <p v-if="validationErrors[`product_${index}_group`]" class="mt-1 text-xs text-[#EF4444]">{{ validationErrors[`product_${index}_group`] }}</p>
                  <p v-else-if="formSubmitted && formErrors[`product_${index}_group`]" class="vld-error" data-validation-error>
                    <span class="vld-error__icon">&#9888;</span> {{ formErrors[`product_${index}_group`] }}
                  </p>

                  <!-- ГСКП code for producers -->
                  <div v-if="payerType === 'producer' && item.group" class="mt-3">
                    <label class="block text-xs text-[#64748b] mb-1">{{ $t('businessCalc.gskpCodeLabel') }}</label>
                    <input
                      type="text"
                      v-model="item.gskpCode"
                      :placeholder="$t('businessCalc.gskpCodePlaceholder')"
                      class="w-full max-w-xs px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#f59e0b] text-sm"
                    />
                  </div>
                </div>

                <!-- BLOCK 2: Data entry (amber top border) -->
                <div class="cf-data" v-if="item.group">
                  <div class="cf-data__header">{{ $t('businessCalc.calcDataHeader') }}</div>

                  <!-- Volume input (Гр.5) -->
                  <div class="cf-data__fields">
                    <div class="cf-data__field">
                      <label class="cf-data__label">{{ $t('businessCalc.volumeLabel') }}</label>
                      <input
                        type="number"
                        v-model="item.volume"
                        @input="calculateAmount(item); validationErrors[`product_${index}_volume`] && delete validationErrors[`product_${index}_volume`]"
                        step="0.01" min="0" placeholder="0.00"
                        :class="['cf-data__input', (validationErrors[`product_${index}_volume`] || (formSubmitted && formErrors[`product_${index}_volume`])) ? 'cf-data__input--error' : '']"
                      />
                      <span class="cf-data__hint">{{ $t('businessCalc.volumeHint') }}</span>
                      <p v-if="validationErrors[`product_${index}_volume`]" class="text-xs text-[#EF4444] mt-1">{{ validationErrors[`product_${index}_volume`] }}</p>
                      <p v-else-if="formSubmitted && formErrors[`product_${index}_volume`]" class="vld-error" data-validation-error>
                        <span class="vld-error__icon">&#9888;</span> {{ formErrors[`product_${index}_volume`] }}
                      </p>
                    </div>
                    <div class="cf-data__field">
                      <label class="cf-data__label">{{ $t('businessCalc.transferredLabel') }}</label>
                      <input
                        type="number"
                        v-model="item.transferredToRecycling"
                        @input="calculateAmount(item)"
                        step="0.01" min="0" placeholder="0.00"
                        :class="['cf-data__input', (getVolumeError(item) || (formSubmitted && formErrors[`product_${index}_transferred`])) ? 'cf-data__input--error' : '']"
                      />
                      <span class="cf-data__hint">{{ $t('businessCalc.transferredHint') }}</span>
                      <p v-if="formSubmitted && formErrors[`product_${index}_transferred`]" class="vld-error" data-validation-error>
                        <span class="vld-error__icon">&#9888;</span> {{ formErrors[`product_${index}_transferred`] }}
                      </p>
                    </div>
                    <div class="cf-data__field">
                      <label class="cf-data__label">{{ $t('businessCalc.exportedLabel') }}</label>
                      <input
                        type="number"
                        v-model="item.exportedFromKR"
                        @input="calculateAmount(item)"
                        step="0.01" min="0" placeholder="0.00"
                        :class="['cf-data__input', (getVolumeError(item) || (formSubmitted && formErrors[`product_${index}_exported`])) ? 'cf-data__input--error' : '']"
                      />
                      <span class="cf-data__hint">{{ $t('businessCalc.exportedHint') }}</span>
                      <p v-if="formSubmitted && formErrors[`product_${index}_exported`]" class="vld-error" data-validation-error>
                        <span class="vld-error__icon">&#9888;</span> {{ formErrors[`product_${index}_exported`] }}
                      </p>
                    </div>
                  </div>

                  <!-- File attachments -->
                  <div class="fc-row">
                    <!-- Договор на переработку -->
                    <input :id="'recycled-file-' + item.id" type="file" class="hidden" @change="handleRecycledFileSelect(item, $event)" />
                    <label v-if="!item.recycledFile" :for="'recycled-file-' + item.id" :class="['fc-card', (parseFloat(item.transferredToRecycling) || 0) > 0 ? 'fc-card--warn' : '']">
                      <div class="fc-card__icon fc-card__icon--blue">
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      </div>
                      <div class="fc-card__text">
                        <span class="fc-card__title">{{ $t('businessCalc.recyclingContract') }}</span>
                        <span class="fc-card__desc">{{ $t('businessCalc.fileHint') }}</span>
                      </div>
                      <span class="fc-card__btn">
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        {{ $t('businessCalc.uploadBtn') }}
                      </span>
                    </label>
                    <div v-else class="fc-card fc-card--done">
                      <div class="fc-card__icon fc-card__icon--green">
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <div class="fc-card__text">
                        <span class="fc-card__title">{{ item.recycledFile.name }}</span>
                        <span class="fc-card__desc fc-card__desc--green">{{ $t('businessCalc.uploaded') }}</span>
                      </div>
                      <button @click="removeRecycledFile(item)" class="fc-card__remove" :title="$t('businessCalc.deleteFile')">
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>

                    <!-- ГТД на вывоз -->
                    <input :id="'exported-file-' + item.id" type="file" class="hidden" @change="handleExportedFileSelect(item, $event)" />
                    <label v-if="!item.exportedFile" :for="'exported-file-' + item.id" :class="['fc-card', (parseFloat(item.exportedFromKR) || 0) > 0 ? 'fc-card--warn' : '']">
                      <div class="fc-card__icon fc-card__icon--purple">
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                      </div>
                      <div class="fc-card__text">
                        <span class="fc-card__title">{{ $t('businessCalc.gtdExport') }}</span>
                        <span class="fc-card__desc">{{ $t('businessCalc.fileHint') }}</span>
                      </div>
                      <span class="fc-card__btn">
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        {{ $t('businessCalc.uploadBtn') }}
                      </span>
                    </label>
                    <div v-else class="fc-card fc-card--done">
                      <div class="fc-card__icon fc-card__icon--green">
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <div class="fc-card__text">
                        <span class="fc-card__title">{{ item.exportedFile.name }}</span>
                        <span class="fc-card__desc fc-card__desc--green">{{ $t('businessCalc.uploaded') }}</span>
                      </div>
                      <button @click="removeExportedFile(item)" class="fc-card__remove" :title="$t('businessCalc.deleteFile')">
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  </div>

                  <!-- Validation error: Гр.8 + Гр.9 > Гр.5 -->
                  <div v-if="getVolumeError(item)" class="norm-msg norm-msg--error" data-validation-error>
                    <svg class="norm-msg__icon" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                    {{ getVolumeError(item) }}
                  </div>
                  <p v-else-if="formSubmitted && formErrors[`product_${index}_sum`]" class="vld-error mt-3" data-validation-error>
                    <span class="vld-error__icon">&#9888;</span> {{ formErrors[`product_${index}_sum`] }}
                  </p>

                  <!-- Norm status info -->
                  <div v-else-if="getNormStatus(item)" :class="['norm-msg', getNormStatus(item)!.met ? 'norm-msg--success' : 'norm-msg--warning']">
                    <svg v-if="getNormStatus(item)!.met" class="norm-msg__icon" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <svg v-else class="norm-msg__icon" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {{ getNormStatus(item)!.message }}
                  </div>

                  <!-- Computed values grid -->
                  <div class="cf-data__computed">
                    <div class="cf-data__computed-cell">
                      <span class="cf-data__computed-label">{{ $t('businessCalc.normLabel') }}</span>
                      <span class="cf-data__computed-value">{{ item.recyclingStandard ? item.recyclingStandard + '%' : '—' }}</span>
                    </div>
                    <div class="cf-data__computed-cell">
                      <span class="cf-data__computed-label">{{ $t('businessCalc.toRecycleLabel') }}</span>
                      <span class="cf-data__computed-value" style="color:#6366f1">{{ item.volumeToRecycle ? item.volumeToRecycle.toFixed(2) + ' ' + $t('businessCalc.ton') : '0.00 ' + $t('businessCalc.ton') }}</span>
                    </div>
                    <div class="cf-data__computed-cell">
                      <span class="cf-data__computed-label">{{ $t('businessCalc.taxableVolumeLabel') }}</span>
                      <span class="cf-data__computed-value">{{ item.taxableVolume ? item.taxableVolume.toFixed(2) + ' ' + $t('businessCalc.ton') : '0.00 ' + $t('businessCalc.ton') }}</span>
                    </div>
                    <div class="cf-data__computed-cell">
                      <span class="cf-data__computed-label">{{ $t('businessCalc.remainingLabel') }}</span>
                      <span class="cf-data__computed-value" :style="{ color: getRemaining(item) <= 0 ? '#10b981' : '#f59e0b' }">{{ getRemaining(item).toFixed(2) }} {{ $t('businessCalc.ton') }}</span>
                    </div>
                    <div class="cf-data__computed-cell">
                      <span class="cf-data__computed-label">{{ $t('businessCalc.rateLabel') }}</span>
                      <span class="cf-data__computed-value">{{ item.rate.toLocaleString() }} {{ $t('businessCalc.somPerTon') }}</span>
                    </div>
                  </div>

                  <!-- Summary: Amount -->
                  <div class="cf-data__summary">
                    <span class="cf-data__summary-label">{{ $t('businessCalc.amountLabel') }}</span>
                    <span class="cf-data__summary-value">{{ item.amount.toLocaleString() }} {{ $t('businessCalc.som') }}</span>
                  </div>
                </div>
              </div>
            </div>

            <button @click="addProductItem" class="mt-4 flex items-center gap-2 text-[#f59e0b] hover:bg-amber-50 px-4 py-2 rounded-lg transition-colors">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              {{ $t('businessCalc.addPosition') }}
            </button>

            <!-- Total banner -->
            <div class="cf-total-banner mt-8">
              <div class="cf-total-banner__grid">
                <div class="cf-total-banner__cell">
                  <span class="cf-total-banner__cell-label">{{ $t('businessCalc.totalVolumeLabel') }}</span>
                  <span class="cf-total-banner__cell-value">{{ totalVolume }} {{ $t('businessCalc.ton') }}</span>
                </div>
                <div class="cf-total-banner__cell">
                  <span class="cf-total-banner__cell-label">{{ $t('businessCalc.totalToRecycleLabel') }}</span>
                  <span class="cf-total-banner__cell-value" style="color:#6366f1">{{ totalVolumeToRecycle }} {{ $t('businessCalc.ton') }}</span>
                </div>
                <div class="cf-total-banner__cell">
                  <span class="cf-total-banner__cell-label">{{ $t('businessCalc.totalTransferredLabel') }}</span>
                  <span class="cf-total-banner__cell-value" style="color:#10b981">{{ totalTransferred }} {{ $t('businessCalc.ton') }}</span>
                </div>
                <div class="cf-total-banner__cell">
                  <span class="cf-total-banner__cell-label">{{ $t('businessCalc.totalExportedLabel') }}</span>
                  <span class="cf-total-banner__cell-value" style="color:#2563eb">{{ totalExported }} {{ $t('businessCalc.ton') }}</span>
                </div>
                <div class="cf-total-banner__cell">
                  <span class="cf-total-banner__cell-label">{{ $t('businessCalc.totalTaxableLabel') }}</span>
                  <span class="cf-total-banner__cell-value">{{ totalTaxableVolume }} {{ $t('businessCalc.ton') }}</span>
                </div>
              </div>
              <div class="cf-total-banner__bottom">
                <span class="cf-total-banner__label">{{ $t('businessCalc.totalToPay') }}</span>
                <span class="cf-total-banner__value" style="color:#f59e0b">{{ formattedTotalAmount }}</span>
              </div>
            </div>
          </div>

          <!-- Step 3: Result -->
          <div v-if="currentStep === 3" class="p-6 lg:p-8">
            <h2 class="text-xl font-semibold text-[#1e293b] mb-6">{{ $t('businessCalc.resultTitle') }}</h2>

            <div class="bg-[#f8fafc] rounded-xl p-5 border border-[#e2e8f0] mb-6">
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <p class="text-sm text-[#64748b] mb-1">{{ $t('businessCalc.calcNumberLabel') }}</p>
                  <p class="font-bold text-[#1e293b] font-mono">{{ calculationResult.number }}</p>
                </div>
                <div>
                  <p class="text-sm text-[#64748b] mb-1">{{ $t('businessCalc.calcDateLabel') }}</p>
                  <p class="font-bold text-[#1e293b]">{{ calculationResult.date }}</p>
                </div>
                <div>
                  <p class="text-sm text-[#64748b] mb-1">{{ $t('businessCalc.paymentDueLabel') }}</p>
                  <p class="font-bold" :style="{ color: deadlineStatus && (deadlineStatus.overdue || deadlineStatus.days <= 5) ? '#DC2626' : '#f59e0b' }">
                    {{ calculationResult.dueDate }}
                  </p>
                  <p v-if="deadlineStatus" class="text-xs mt-0.5" :style="{ color: deadlineStatus.overdue ? '#DC2626' : '#94a3b8' }">
                    <template v-if="deadlineStatus.overdue">{{ $t('businessCalc.overdueDays', { days: deadlineStatus.days }) }}</template>
                    <template v-else>{{ $t('businessCalc.remainingDays', { days: deadlineStatus.days }) }}</template>
                  </p>
                </div>
              </div>
            </div>

            <div class="bg-gradient-to-r from-[#f59e0b] to-[#d97706] rounded-2xl p-6 text-white mb-6">
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p class="text-white/80 mb-1">{{ $t('businessCalc.feeAmountLabel') }}</p>
                  <p class="text-3xl lg:text-4xl font-bold">{{ formattedTotalAmount }}</p>
                </div>
                <div class="flex items-center gap-2">
                  <span class="px-4 py-2 bg-white/20 rounded-lg text-sm font-medium">
                    {{ payerType === 'producer' ? calculationQuarter + ' ' + calculationYear : $t('businessCalc.importPrefix') + ' ' + (importDate ? new Date(importDate).toLocaleDateString() : '') }}
                  </span>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden mb-6">
              <div class="px-5 py-4 border-b border-[#e2e8f0]">
                <h3 class="font-semibold text-[#1e293b]">{{ $t('businessCalc.detailsTitle') }}</h3>
              </div>
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead class="bg-[#f8fafc]">
                    <tr class="text-left text-[#64748b]">
                      <th class="px-4 py-3 font-medium">{{ $t('businessCalc.thGroupSubgroup') }}</th>
                      <th class="px-4 py-3 font-medium text-right">{{ $t('businessCalc.thVolumeT') }}</th>
                      <th class="px-4 py-3 font-medium text-right">{{ $t('businessCalc.thNormPct') }}</th>
                      <th class="px-4 py-3 font-medium text-right">{{ $t('businessCalc.thToRecycleT') }}</th>
                      <th class="px-4 py-3 font-medium text-right">{{ $t('businessCalc.thTransferredT') }}</th>
                      <th class="px-4 py-3 font-medium text-right">{{ $t('businessCalc.thExportedT') }}</th>
                      <th class="px-4 py-3 font-medium text-right">{{ $t('businessCalc.thTaxableT') }}</th>
                      <th class="px-4 py-3 font-medium text-right">{{ $t('businessCalc.thRate') }}</th>
                      <th class="px-4 py-3 font-medium text-right">{{ $t('businessCalc.thAmount') }}</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-[#e2e8f0]">
                    <tr v-for="item in productItems.filter(i => i.group && i.volume)" :key="item.id" class="hover:bg-[#f8fafc]">
                      <td class="px-4 py-3">
                        <span class="text-[#1e293b] block">{{ getGroupLabel(item.group) }}</span>
                        <span class="text-xs text-[#94a3b8]">{{ getSubgroupLabel(item.group, item.subgroup) }}</span>
                        <span v-if="item.tnvedCode" class="block text-xs text-[#94a3b8] font-mono mt-0.5">ТН ВЭД <TnvedCode :code="item.tnvedCode" /></span>
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
                      <td class="px-4 py-3">{{ $t('businessCalc.totalRow') }}</td>
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

            <!-- Примечания к кодам ТН ВЭД -->
            <div class="border border-[#e2e8f0] rounded-xl overflow-hidden">
              <button
                @click="tnvedNotesOpen = !tnvedNotesOpen"
                class="w-full flex items-center justify-between px-5 py-3.5 bg-[#f8fafc] hover:bg-[#f1f5f9] transition-colors text-left"
              >
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-[#3B82F6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span class="text-sm font-medium text-[#1e293b]">{{ $t('businessCalc.tnvedNotesTitle') }}</span>
                </div>
                <svg
                  class="w-4 h-4 text-[#94a3b8] transition-transform duration-200"
                  :class="{ 'rotate-180': tnvedNotesOpen }"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <Transition name="slide">
                <div v-if="tnvedNotesOpen" class="px-5 py-4 border-t border-[#e2e8f0] bg-white">
                  <ul class="space-y-2">
                    <li v-for="(text, key) in tnvedNotes" :key="key" class="flex gap-2 text-sm text-[#475569]">
                      <span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#EFF6FF] text-[#3B82F6] text-xs font-bold flex-shrink-0 mt-0.5">{{ key }}</span>
                      <span>{{ text }}</span>
                    </li>
                  </ul>
                  <p class="mt-3 text-xs text-[#94a3b8] italic">{{ tnvedNotesSource }}</p>
                </div>
              </Transition>
            </div>

            <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
              <div class="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div>
                <p class="font-medium text-[#1e293b]">{{ $t('businessCalc.paymentDetailsTitle') }}</p>
                <p class="text-sm text-[#64748b]" v-html="$t('businessCalc.paymentDetailsText')"></p>
              </div>
            </div>

            <!-- Графа 13: Сверка платежей -->
            <div class="g13-container mt-4">
              <div class="g13-header">
                <h3 class="g13-title">{{ $t('businessCalc.g13Title') }}</h3>
                <div class="g13-tooltip-wrap">
                  <svg class="w-4 h-4 text-[#94a3b8] cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div class="g13-tooltip">{{ $t('businessCalc.g13Tooltip') }}</div>
                </div>
              </div>
              <div class="g13-cards">
                <div class="g13-card">
                  <span class="g13-card__label">{{ $t('businessCalc.g13Charged') }}</span>
                  <span class="g13-card__value">0 {{ $t('businessCalc.som') }}</span>
                  <span class="g13-card__sub">{{ $t('businessCalc.g13NotSubmitted') }}</span>
                </div>
                <div class="g13-card">
                  <span class="g13-card__label">{{ $t('businessCalc.g13Paid') }}</span>
                  <span class="g13-card__value g13-card__value--green">0 {{ $t('businessCalc.som') }}</span>
                  <span class="g13-card__sub">{{ $t('businessCalc.g13NotSubmitted') }}</span>
                </div>
                <div class="g13-card g13-card--diff g13-card--zero">
                  <span class="g13-card__label">{{ $t('businessCalc.g13Difference') }}</span>
                  <span class="g13-card__value g13-card__value--gray">{{ $t('businessCalc.g13NoDebt') }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Navigation Buttons -->
          <div class="px-6 lg:px-8 py-4 bg-[#f8fafc] border-t border-[#e2e8f0] flex flex-col-reverse sm:flex-row justify-between gap-3 sm:gap-4 sticky bottom-0 z-10 rounded-b-2xl">
            <button
              v-if="currentStep > 1"
              @click="prevStep"
              class="btn-action btn-action-ghost"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              {{ $t('businessCalc.backBtn') }}
            </button>
            <div v-else></div>

            <div class="flex flex-col sm:flex-row gap-3">
              <button
                v-if="currentStep === 1"
                @click="handleStep1Next"
                class="btn-action btn-action-primary"
              >
                {{ $t('businessCalc.nextBtn') }}
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <button
                v-if="currentStep === 2"
                @click="handleStep2Calculate"
                class="btn-action btn-action-primary"
                :disabled="formSubmitted && hasErrors"
                :title="formSubmitted && hasErrors ? $t('businessCalc.fixFormErrors') : ''"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                {{ $t('businessCalc.calculateBtn') }}
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
                  {{ $t('businessCalc.saveDraftBtn') }}
                </button>

                <button
                  @click="submitForReview"
                  class="btn-action btn-action-primary"
                  :disabled="formSubmitted && hasErrors"
                  :title="formSubmitted && hasErrors ? $t('businessCalc.fixFormErrors') : ''"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  {{ $t('businessCalc.submitForReview') }}
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
        <div class="w-24 h-24 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
          <svg class="w-12 h-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b] mb-4">{{ $t('businessCalc.sentTitle') }}</h1>

        <div class="bg-white rounded-2xl p-6 shadow-sm border border-[#e2e8f0] mb-8">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <p class="text-sm text-[#64748b] mb-1">{{ $t('businessCalc.sentCalcNumber') }}</p>
              <p class="text-lg font-bold text-[#f59e0b] font-mono">{{ calculationResult.number }}</p>
            </div>
            <div>
              <p class="text-sm text-[#64748b] mb-1">{{ $t('businessCalc.sentAmount') }}</p>
              <p class="text-lg font-bold text-[#1e293b]">{{ formattedTotalAmount }}</p>
            </div>
            <div>
              <p class="text-sm text-[#64748b] mb-1">{{ $t('businessCalc.sentDate') }}</p>
              <p class="text-lg font-bold text-[#1e293b]">{{ calculationResult.date }}</p>
            </div>
          </div>
        </div>

        <!-- What's next info block -->
        <div class="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-8 text-left">
          <h3 class="font-semibold text-[#1e293b] mb-3 flex items-center gap-2">
            <svg class="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {{ $t('businessCalc.whatsNext') }}
          </h3>
          <ol class="text-sm text-[#475569] space-y-2 list-decimal list-inside">
            <li>{{ $t('businessCalc.nextStep1') }}</li>
            <li>{{ $t('businessCalc.nextStep2') }}</li>
            <li>{{ $t('businessCalc.nextStep3') }}</li>
          </ol>
        </div>

        <div class="flex justify-center">
          <button
            @click="backToList"
            class="flex items-center justify-center gap-2 px-6 py-3 bg-[#f59e0b] text-white rounded-xl font-medium hover:bg-[#d97706] transition-colors"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            {{ $t('businessCalc.goToList') }}
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
            {{ $t('businessCalc.backToList') }}
          </button>
          <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b] mb-2">{{ $t('businessCalc.paymentConfirmTitle') }}</h1>
          <p class="text-[#64748b]">{{ $t('businessCalc.paymentCalcInfo', { number: paymentCalcNumber, amount: paymentCalcAmount.toLocaleString() }) }}</p>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] p-6 lg:p-8">
          <div class="space-y-5">
            <!-- Payment order number -->
            <div>
              <label class="block text-sm font-medium text-[#1e293b] mb-2">{{ $t('businessCalc.paymentOrderLabel') }}</label>
              <input
                v-model="paymentForm.paymentOrderNumber"
                type="text"
                :placeholder="$t('businessCalc.paymentOrderPlaceholder')"
                class="w-full px-4 py-3 border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#f59e0b] focus:ring-2 focus:ring-[#f59e0b]/20"
              />
            </div>

            <!-- Payment date -->
            <div>
              <label class="block text-sm font-medium text-[#1e293b] mb-2">{{ $t('businessCalc.paymentDateLabel') }}</label>
              <input
                v-model="paymentForm.paymentDate"
                type="text"
                :placeholder="$t('businessCalc.paymentDatePlaceholder')"
                onfocus="this.type='date'"
                onblur="if(!this.value)this.type='text'"
                class="w-full px-4 py-3 border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#f59e0b] focus:ring-2 focus:ring-[#f59e0b]/20"
              />
            </div>

            <!-- Payer bank -->
            <div>
              <label class="block text-sm font-medium text-[#1e293b] mb-2">{{ $t('businessCalc.payerBankLabel') }}</label>
              <input
                v-model="paymentForm.payerBank"
                type="text"
                :placeholder="$t('businessCalc.payerBankPlaceholder')"
                class="w-full px-4 py-3 border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#f59e0b] focus:ring-2 focus:ring-[#f59e0b]/20"
              />
            </div>

            <!-- Transfer amount -->
            <div>
              <label class="block text-sm font-medium text-[#1e293b] mb-2">{{ $t('businessCalc.transferAmountLabel') }}</label>
              <input
                v-model="paymentForm.transferAmount"
                @input="validatePaymentAmount"
                type="number"
                :placeholder="paymentCalcAmount.toLocaleString()"
                class="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2"
                :class="paymentAmountError ? 'border-red-300 focus:border-red-400 focus:ring-red-200' : 'border-[#e2e8f0] focus:border-[#f59e0b] focus:ring-[#f59e0b]/20'"
              />
              <p v-if="paymentAmountError" class="mt-1 text-sm text-red-600">{{ paymentAmountError }}</p>
            </div>

            <!-- File upload -->
            <div>
              <label class="block text-sm font-medium text-[#1e293b] mb-2">{{ $t('businessCalc.paymentScanLabel') }}</label>
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
                <p class="text-[#1e293b] font-medium mb-1">{{ $t('businessCalc.dropFileHere') }}</p>
                <p class="text-sm text-[#64748b]">{{ $t('businessCalc.fileFormats') }}</p>
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
              <label class="block text-sm font-medium text-[#1e293b] mb-2">{{ $t('businessCalc.commentLabel') }}</label>
              <textarea
                v-model="paymentForm.comment"
                rows="3"
                :placeholder="$t('businessCalc.commentPlaceholder')"
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
              {{ $t('businessCalc.cancelBtn') }}
            </button>
            <button
              @click="submitPayment"
              :disabled="!canSubmitPayment"
              class="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#10b981] text-white rounded-lg font-medium hover:bg-[#059669] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              {{ $t('businessCalc.submitPaymentBtn') }}
            </button>
          </div>
        </div>
      </div>
    </template>
    <InstructionDrawer v-model="showInstruction" :title="$t('businessCalc.instructionDrawerTitle')" :contentHtml="instructionCalculationHtml" />
    <ConfirmDialog
      :visible="confirmDialog.visible"
      :title="confirmDialog.title"
      :message="confirmDialog.message"
      :icon="confirmDialog.icon"
      :confirmText="confirmDialog.confirmText"
      :confirmColor="confirmDialog.confirmColor"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    />
  </DashboardLayout>
</template>

<style scoped>
/* ── Validation error styles ── */
.vld-error {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #EF4444;
  margin-top: 4px;
  line-height: 1.3;
}
.vld-error__icon {
  flex-shrink: 0;
}
.vld-input--error {
  border-color: #EF4444 !important;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
.slide-enter-active { transition: max-height 0.25s ease, opacity 0.2s ease; overflow: hidden; }
.slide-leave-active { transition: max-height 0.2s ease, opacity 0.15s ease; overflow: hidden; }
.slide-enter-from, .slide-leave-to { max-height: 0; opacity: 0; }
.slide-enter-to, .slide-leave-from { max-height: 500px; opacity: 1; }

/* ── File-card attachments ── */
.fc-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid #e2e8f0;
}
.fc-card {
  display: flex;
  align-items: center;
  gap: 14px;
  border: 1.5px dashed #CBD5E1;
  border-radius: 12px;
  padding: 16px 20px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
  min-width: 280px;
}
.fc-card:hover {
  border-color: #3B82F6;
  background: #F8FAFC;
  box-shadow: 0 2px 8px rgba(59,130,246,0.08);
}
.fc-card--warn {
  border-color: #FBBF24;
  background: #FFFBEB;
}
.fc-card--warn:hover {
  border-color: #F59E0B;
  background: #FEF3C7;
}
.fc-card--done {
  border: 1.5px solid #D1FAE5;
  background: #F0FDF4;
  cursor: default;
}
.fc-card--done:hover {
  border-color: #D1FAE5;
  background: #F0FDF4;
  box-shadow: none;
}
.fc-card__icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.fc-card__icon--blue {
  background: #F1F5F9;
  color: #3B82F6;
}
.fc-card__icon--purple {
  background: #F1F5F9;
  color: #8B5CF6;
}
.fc-card__icon--green {
  background: #D1FAE5;
  color: #059669;
}
.fc-card__text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.fc-card__title {
  font-weight: 600;
  font-size: 14px;
  color: #1E293B;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.fc-card__desc {
  font-size: 12px;
  color: #94A3B8;
  margin-top: 2px;
}
.fc-card__desc--green {
  color: #059669;
  font-weight: 500;
}
.fc-card__btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #EFF6FF;
  color: #3B82F6;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
  flex-shrink: 0;
}
.fc-card:hover .fc-card__btn {
  background: #3B82F6;
  color: white;
}
.fc-card--warn .fc-card__btn {
  background: #FEF3C7;
  color: #D97706;
}
.fc-card--warn:hover .fc-card__btn {
  background: #F59E0B;
  color: white;
}
.fc-card__remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: #FEE2E2;
  color: #EF4444;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}
.fc-card__remove:hover {
  background: #EF4444;
  color: white;
}

/* ── Action buttons ── */
.act-wrap {
  display: flex;
  gap: 6px;
  justify-content: flex-end;
  align-items: center;
  flex-wrap: wrap;
}
.act-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  white-space: nowrap;
  text-decoration: none;
  transition: all 0.15s ease;
}
.act-btn--filled {
  color: white;
  border: none;
}
.act-btn--green { background: #22c55e; }
.act-btn--green:hover { background: #16a34a; box-shadow: 0 2px 8px rgba(34,197,94,0.25); }
.act-btn--orange { background: #f59e0b; }
.act-btn--orange:hover { background: #d97706; box-shadow: 0 2px 8px rgba(245,158,11,0.25); }
.act-btn--outline {
  background: transparent;
  color: #475569;
  border: 1px solid #e2e8f0;
}
.act-btn--outline:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #1e293b;
}

/* More menu (⋯) */
.act-more-wrap {
  position: relative;
}
.act-more {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 30px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: transparent;
  color: #9ca3af;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  letter-spacing: 2px;
  transition: all 0.15s;
}
.act-more:hover {
  background: #f3f4f6;
  color: #6b7280;
  border-color: #d1d5db;
}
.act-dropdown {
  position: absolute;
  right: 0;
  top: calc(100% + 4px);
  z-index: 10;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1), 0 4px 10px rgba(0,0,0,0.05);
  min-width: 170px;
  padding: 4px;
  overflow: hidden;
}
.act-dropdown__item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 400;
  color: #374151;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.1s;
  white-space: nowrap;
}
.act-dropdown__item:hover {
  background: #f3f4f6;
}
.act-dropdown__item--red {
  color: #dc2626;
}
.act-dropdown__item--red:hover {
  background: #fef2f2;
}

/* ── Status row left-border indicators ── */
:deep(.calc-row--paid td:first-child) {
  box-shadow: inset 4px 0 0 #22c55e;
}
:deep(.calc-row--accepted td:first-child) {
  box-shadow: inset 4px 0 0 #3b82f6;
}
:deep(.calc-row--review td:first-child) {
  box-shadow: inset 4px 0 0 #f59e0b;
}
:deep(.calc-row--draft td:first-child) {
  box-shadow: inset 4px 0 0 #d1d5db;
}
:deep(.calc-row--rejected td:first-child) {
  box-shadow: inset 4px 0 0 #ef4444;
}
:deep(.calc-row--rejected) {
  background: #fffbeb !important;
}
:deep(.calc-row--rejected.table-row:hover) {
  background: #fef9c3 !important;
}
:deep(.calc-row--pay-review td:first-child) {
  box-shadow: inset 4px 0 0 #f97316;
}
:deep(.calc-row--pay-rejected td:first-child) {
  box-shadow: inset 4px 0 0 #ef4444;
}

/* ── Rejection tooltip ── */
.status-badge-wrap {
  position: relative;
  display: inline-block;
}
.status-tooltip {
  position: fixed;
  z-index: 9999;
  background: white;
  border: 1px solid #fecaca;
  border-radius: 10px;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1);
  max-width: 320px;
  min-width: 240px;
  padding: 12px 16px;
}
.status-tooltip__arrow {
  position: absolute;
  top: -6px;
  left: 20px;
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-bottom: 6px solid #fecaca;
}
.status-tooltip__arrow::after {
  content: '';
  position: absolute;
  top: 2px;
  left: -5px;
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-bottom: 5px solid white;
}
.status-tooltip__title {
  font-weight: 600;
  font-size: 13px;
  color: #991b1b;
  margin-bottom: 4px;
}
.status-tooltip__text {
  font-size: 13px;
  color: #374151;
  line-height: 1.5;
  margin-bottom: 8px;
}
.status-tooltip__meta {
  font-size: 11px;
  color: #9ca3af;
}

/* ── Card-form ── */
.cf-card {
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 14px;
  padding: 24px;
  margin-bottom: 16px;
}

/* ── Info block (product group selection) ── */
.cf-info {
  background: #F8FAFC;
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 16px;
}

/* ── Data entry block (amber themed) ── */
.cf-data {
  border-top: 2px solid #f59e0b;
  padding-top: 16px;
}
.cf-data__header {
  font-size: 13px;
  font-weight: 600;
  color: #f59e0b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 14px;
}
.cf-data__fields {
  display: flex;
  gap: 16px;
}
.cf-data__field {
  flex: 1;
  min-width: 0;
}
.cf-data__label {
  display: block;
  font-size: 13px;
  color: #475569;
  font-weight: 500;
  margin-bottom: 6px;
}
.cf-data__input {
  width: 100%;
  padding: 12px 16px;
  border: 1.5px solid #E2E8F0;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  color: #1E293B;
  background: white;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  -moz-appearance: textfield;
}
.cf-data__input::-webkit-inner-spin-button,
.cf-data__input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.cf-data__input:focus {
  border-color: #f59e0b;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
}
.cf-data__input--error {
  border-color: #FCA5A5;
  background: #FEF2F2;
}
.cf-data__input--error:focus {
  border-color: #F87171;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}
.cf-data__hint {
  display: block;
  font-size: 11px;
  color: #94A3B8;
  margin-top: 6px;
  line-height: 1.4;
}


/* ── Norm status / validation messages ── */
.norm-msg {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.4;
}
.norm-msg__icon {
  flex-shrink: 0;
}
.norm-msg--success {
  background: #F0FDF4;
  border: 1px solid #BBF7D0;
  color: #15803D;
}
.norm-msg--warning {
  background: #FFFBEB;
  border: 1px solid #FDE68A;
  color: #92400E;
}
.norm-msg--error {
  background: #FEF2F2;
  border: 1px solid #FECACA;
  color: #DC2626;
}

/* ── Computed values grid ── */
.cf-data__computed {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px dashed #e2e8f0;
}
.cf-data__computed-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: #F8FAFC;
  border-radius: 8px;
  padding: 10px 12px;
}
.cf-data__computed-label {
  font-size: 11px;
  text-transform: uppercase;
  color: #94A3B8;
  font-weight: 600;
  letter-spacing: 0.3px;
}
.cf-data__computed-value {
  font-size: 16px;
  font-weight: 700;
  color: #1E293B;
}

/* ── Summary (amount) ── */
.cf-data__summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
  padding: 14px 20px;
  background: linear-gradient(135deg, rgba(245,158,11,0.08), rgba(217,119,6,0.08));
  border-radius: 10px;
  border: 1px solid rgba(245,158,11,0.15);
}
.cf-data__summary-label {
  font-weight: 600;
  font-size: 14px;
  color: #1E293B;
}
.cf-data__summary-value {
  font-weight: 800;
  font-size: 18px;
  color: #f59e0b;
}

/* ── Total banner ── */
.cf-total-banner {
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  padding: 20px 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
.cf-total-banner__grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
}
.cf-total-banner__cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.cf-total-banner__cell-label {
  font-size: 11px;
  color: #94A3B8;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}
.cf-total-banner__cell-value {
  font-size: 16px;
  font-weight: 700;
  color: #1E293B;
}
.cf-total-banner__bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}
.cf-total-banner__label {
  font-size: 18px;
  font-weight: 600;
  color: #1E293B;
}
.cf-total-banner__value {
  font-size: 28px;
  font-weight: 800;
}

/* ── Mobile ── */
@media (max-width: 640px) {
  .cf-data__fields {
    flex-direction: column;
  }
  .cf-data__computed {
    grid-template-columns: repeat(2, 1fr);
  }
  .cf-data__summary {
    flex-direction: column;
    align-items: flex-start;
  }
  .cf-total-banner__grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .cf-total-banner__bottom {
    flex-direction: column;
    align-items: flex-start;
  }
  .fc-card {
    min-width: 0;
    padding: 12px 14px;
    gap: 10px;
  }
  .fc-card__icon {
    width: 36px;
    height: 36px;
  }
  .fc-card__icon svg {
    width: 16px;
    height: 16px;
  }
  .fc-card__btn {
    padding: 6px 12px;
    font-size: 12px;
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

/* Графа 13 styles */
.g13-container {
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 14px;
  padding: 20px;
}
.g13-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}
.g13-title {
  font-size: 14px;
  font-weight: 600;
  color: #475569;
}
.g13-tooltip-wrap {
  position: relative;
}
.g13-tooltip-wrap:hover .g13-tooltip {
  opacity: 1;
  visibility: visible;
}
.g13-tooltip {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: calc(100% + 8px);
  width: 320px;
  padding: 10px 14px;
  background: #1e293b;
  color: #f1f5f9;
  font-size: 12px;
  line-height: 1.5;
  border-radius: 8px;
  opacity: 0;
  visibility: hidden;
  transition: all 0.15s;
  z-index: 50;
  pointer-events: none;
}
.g13-cards {
  display: flex;
  gap: 16px;
}
@media (max-width: 768px) {
  .g13-cards { flex-direction: column; }
}
.g13-card {
  flex: 1;
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 10px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.g13-card--diff {
  border-left-width: 3px;
}
.g13-card--debt {
  border-left-color: #EF4444;
  background: #FEF2F2;
}
.g13-card--overpay {
  border-left-color: #059669;
  background: #F0FDF4;
}
.g13-card--zero {
  border-left-color: #64748B;
  background: #F8FAFC;
}
.g13-card__label {
  font-size: 12px;
  color: #94A3B8;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}
.g13-card__value {
  font-size: 20px;
  font-weight: 700;
  color: #1E293B;
}
.g13-card__value--green { color: #059669; }
.g13-card__value--red { color: #EF4444; }
.g13-card__value--gray { color: #64748B; }
.g13-card__sub {
  font-size: 11px;
  color: #94A3B8;
}
</style>
