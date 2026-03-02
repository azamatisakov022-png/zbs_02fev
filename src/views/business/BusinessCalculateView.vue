<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { validators, scrollToFirstError } from '../../utils/validators'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import { productGroups, productSubgroups, getSubgroupLabel, type ProductSubgroup } from '../../data/product-groups'
import { getNormativeForGroup } from '../../data/recycling-norms'
import ProductGroupSelector from '../../components/ProductGroupSelector.vue'
import TnvedCode from '../../components/TnvedCode.vue'
import { tnvedNotes, tnvedNotesSource } from '../../data/tnved-notes'
import { calculationStore, type PaymentData } from '../../stores/calculations'
import { CalcStatus } from '../../constants/statuses'
import { calculatePaymentDeadline, getRemainingDays, formatDateRu, formatDateShort } from '../../utils/dateUtils'
import { calculatePenalty, getOverdueDays, PENALTY_DAILY_RATE } from '../../utils/penalty'
import { PAYMENT_ACCOUNTS } from '../../config/payment-accounts'
import { formatNum } from '../../utils/formatNumber'
import InstructionDrawer from '../../components/InstructionDrawer.vue'
import { instructionCalculationHtml } from '../../data/instructionCalculation'
import { useBusinessMenu } from '../../composables/useRoleMenu'
import { toastStore } from '../../stores/toast'
import { notificationStore } from '../../stores/notifications'
import ConfirmDialog from '../../components/common/ConfirmDialog.vue'
import PenaltyInfo from '../../components/PenaltyInfo.vue'
import CustomSelect from '../../components/ui/CustomSelect.vue'
import type { SelectOption } from '../../components/ui/CustomSelect.vue'

const { roleTitle, menuItems } = useBusinessMenu()
const { t } = useI18n()
const router = useRouter()

const showInstruction = ref(false)

const currentStep = ref(1)
const totalSteps = 3

const steps = computed(() => [
  { number: 1, title: t('businessCalc.stepPeriod') },
  { number: 2, title: t('businessCalc.stepProducts') },
  { number: 3, title: t('businessCalc.stepResult') },
])

const showDraftNotification = ref(false)

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

type PayerType = 'producer' | 'importer'
const payerType = ref<PayerType>('importer')
const calculationQuarter = ref('')
const calculationYear = ref('2026')
const importDate = ref('')

const quarterOptions = computed<SelectOption[]>(() => [
  { value: null, label: t('businessCalc.selectQuarter') },
  { value: 'Q1', label: t('businessCalc.quarterI') },
  { value: 'Q2', label: t('businessCalc.quarterII') },
  { value: 'Q3', label: t('businessCalc.quarterIII') },
  { value: 'Q4', label: t('businessCalc.quarterIV') },
])

const yearOptions = computed<SelectOption[]>(() => [
  { value: '2025', label: '2025' },
  { value: '2026', label: '2026' },
  { value: '2027', label: '2027' },
  { value: '2028', label: '2028' },
  { value: '2029', label: '2029' },
  { value: '2030', label: '2030' },
])

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

const dateInputMax = computed(() => {
  const maxYear = new Date().getFullYear() + 1
  return `${maxYear}-12-31`
})

const isOverdue = computed(() => {
  return !!(deadlineStatus.value && deadlineStatus.value.overdue)
})

const penaltyData = computed(() => {
  if (!isOverdue.value || !currentDeadline.value || totalAmount.value <= 0) return null
  return calculatePenalty(totalAmount.value, currentDeadline.value)
})

const penaltyOverdueDays = computed(() => {
  if (!currentDeadline.value) return 0
  return getOverdueDays(currentDeadline.value)
})

const penaltyProgressPercent = computed(() => {
  if (!penaltyData.value) return 0
  return Math.min(100, Math.round((penaltyData.value.totalPenalty / penaltyData.value.debtAmount) * 100))
})

const feePurpose = computed(() => {
  const period = payerType.value === 'producer'
    ? calculationQuarter.value + ' ' + calculationYear.value
    : t('businessCalc.importPrefix') + ' ' + (importDate.value ? new Date(importDate.value).toLocaleDateString() : '')
  return t('payment.feePaymentPurpose', { period, number: calculationResult.value.number })
})

const penaltyPurpose = computed(() => {
  if (!penaltyData.value) return ''
  return t('payment.penaltyPaymentPurpose', { number: calculationResult.value.number, days: penaltyData.value.overdueDays })
})

const copyRequisites = async (type: 'utilization_fee' | 'penalty') => {
  const acc = PAYMENT_ACCOUNTS[type]
  const amount = type === 'utilization_fee'
    ? totalAmount.value
    : penaltyData.value?.totalPenalty ?? 0
  const purpose = type === 'utilization_fee' ? feePurpose.value : penaltyPurpose.value
  const text = [
    `${t('payment.recipient')}: ${acc.recipient}`,
    `${t('payment.bankLabel')}: ${acc.bank}`,
    `${t('payment.accountNumber')}: ${acc.account}`,
    `${t('payment.bikLabel')}: ${acc.bik}`,
    `${t('payment.innLabel')}: ${acc.inn}`,
    `${t('payment.amountLabel')}: ${amount.toLocaleString()} ${t('penalty.som')}`,
    `${t('payment.purposeLabel')}: ${purpose}`,
  ].join('\n')
  try {
    await navigator.clipboard.writeText(text)
    toastStore.show({ type: 'success', title: t('payment.copiedToast') })
  } catch {
    toastStore.show({ type: 'info', title: t('payment.copiedToast') })
  }
}

const companyData = {
  name: 'ОсОО «ТехПром»',
  inn: '01234567890123',
  address: 'г. Бишкек, ул. Московская, 123',
  director: 'Иванов Иван Иванович',
  phone: '+996 555 123 456',
  email: 'info@techprom.kg'
}

interface ProductItem {
  id: number
  group: string
  subgroup: string
  gskpCode: string
  tnvedCode: string
  volume: string
  recyclingStandard: number
  volumeToRecycle: number
  transferredToRecycling: string
  recycledFile: { name: string } | null
  exportedFromKR: string
  exportedFile: { name: string } | null
  taxableVolume: number
  rate: number
  amount: number
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
  item.volumeToRecycle = Math.round(vol * item.recyclingStandard / 100 * 100) / 100
  const transferred = parseFloat(item.transferredToRecycling) || 0
  const exported = parseFloat(item.exportedFromKR) || 0
  item.taxableVolume = Math.max(0, Math.round((item.volumeToRecycle - transferred - exported) * 100) / 100)
  item.amount = Math.round(item.taxableVolume * item.rate)
}

const getVolumeError = (item: ProductItem): string => {
  const vol = parseFloat(item.volume) || 0
  const transferred = parseFloat(item.transferredToRecycling) || 0
  const exported = parseFloat(item.exportedFromKR) || 0
  if (vol > 0 && (transferred + exported) > vol) {
    return t('businessCalc.volumeExceedError')
  }
  return ''
}

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

const canProceedStep1 = computed(() => {
  if (payerType.value === 'producer') {
    return calculationQuarter.value && calculationYear.value
  }
  return importDate.value && calculationYear.value
})

const canProceedStep2 = computed(() => {
  return productItems.value.some(item => item.group && item.volume && parseFloat(item.volume) > 0)
})

const totalVolume = computed(() => {
  return productItems.value
    .reduce((sum, item) => sum + (parseFloat(item.volume) || 0), 0)
    .toFixed(2)
})

const totalVolumeToRecycle = computed(() => {
  return productItems.value
    .reduce((sum, item) => sum + (item.volumeToRecycle || 0), 0)
    .toFixed(2)
})

const totalTransferred = computed(() => {
  return productItems.value
    .reduce((sum, item) => sum + (parseFloat(item.transferredToRecycling) || 0), 0)
    .toFixed(2)
})

const totalExported = computed(() => {
  return productItems.value
    .reduce((sum, item) => sum + (parseFloat(item.exportedFromKR) || 0), 0)
    .toFixed(2)
})

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

const backToList = () => {
  router.push('/business/calculator')
}

const createDeclaration = () => {
  toastStore.show({ type: 'info', title: t('businessCalc.declarationTitle'), message: t('businessCalc.declarationToast') })
}

const formSubmitted = ref(false)
const validationErrors = ref<Record<string, string>>({})

const formErrors = computed(() => {
  const errors: Record<string, string> = {}

  if (payerType.value === 'producer') {
    const quarterErr = validators.required(calculationQuarter.value, t('businessCalc.calcPeriodLabel'))
    if (quarterErr) errors.quarter = t('businessCalc.errSelectPeriod')
  } else {
    const dateErr = validators.required(importDate.value, t('businessCalc.importDateLabel'))
    if (dateErr) errors.importDate = t('businessCalc.errSelectImportDate')
  }

  const validItems = productItems.value.filter(i => i.group && i.volume && parseFloat(i.volume) > 0)
  if (validItems.length === 0) {
    errors.products = t('businessCalc.errAddPosition')
  }

  productItems.value.forEach((item, index) => {
    const groupErr = validators.required(item.group, t('businessCalc.errSelectGroup'))
    if (groupErr) errors[`product_${index}_group`] = t('businessCalc.errSelectGroup')

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

    if (item.transferredToRecycling !== '') {
      const trPositive = validators.positiveNumber(item.transferredToRecycling, 'Гр.8')
      if (trPositive) {
        errors[`product_${index}_transferred`] = trPositive
      } else if (vol > 0) {
        const trMax = validators.maxValue(item.transferredToRecycling, vol, 'Гр.8')
        if (trMax) errors[`product_${index}_transferred`] = trMax
      }
    }

    if (item.exportedFromKR !== '') {
      const exPositive = validators.positiveNumber(item.exportedFromKR, 'Гр.9')
      if (exPositive) {
        errors[`product_${index}_exported`] = exPositive
      } else if (vol > 0) {
        const exMax = validators.maxValue(item.exportedFromKR, vol, 'Гр.9')
        if (exMax) errors[`product_${index}_exported`] = exMax
      }
    }

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

const handleDownloadPdf = () => {
  toastStore.show({ type: 'info', title: 'PDF', message: t('businessCalc.pdfToast') })
}

const handlePrint = () => {
  window.print()
}

watch(productItems, () => {
  productItems.value.forEach(item => {
    if (item.group && item.volume) {
      calculateAmount(item)
    }
  })
}, { deep: true })

watch(calculationYear, () => {
  productItems.value.forEach(item => {
    if (item.group) {
      updateItemRate(item)
    }
  })
})

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
  router.push('/business/calculator')
}

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
      const newCalc = calculationStore.addCalculation(calcData, CalcStatus.UNDER_REVIEW)
      notificationStore.add({
        type: 'info',
        title: t('businessCalc.notifNewCalc'),
        message: t('businessCalc.notifNewCalcMessage', { company: companyData.name }),
        role: 'eco-operator',
        link: `/eco-operator/calculations/${newCalc.id}`
      })
      notificationStore.add({
        type: 'success',
        title: t('businessCalc.notifCalcSent'),
        message: t('businessCalc.notifCalcSentMessage'),
        role: 'business',
        link: '/business/calculator'
      })
      router.push('/business/calculator')
    },
  })
}

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

    <div class="max-w-6xl mx-auto">
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
            <div>
              <label class="block text-[17px] font-semibold text-[#1e293b] mb-3">{{ $t('businessCalc.payerTypeLabel') }}</label>
              <div class="inline-flex rounded-xl border border-[#e2e8f0] overflow-hidden bg-[#f8fafc]">
                <button
                  type="button"
                  @click="payerType = 'producer'"
                  :class="[
                    'px-6 py-3 text-[17px] font-medium transition-all duration-200',
                    payerType === 'producer'
                      ? 'bg-[#f59e0b] text-white shadow-sm'
                      : 'text-[#64748b] hover:text-[#1e293b] hover:bg-white'
                  ]"
                >{{ $t('businessCalc.producer') }}</button>
                <button
                  type="button"
                  @click="payerType = 'importer'"
                  :class="[
                    'px-6 py-3 text-[17px] font-medium transition-all duration-200',
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
                <label class="block text-[17px] font-semibold text-[#1e293b] mb-2">{{ $t('businessCalc.calcPeriodLabel') }} <span class="text-[#EF4444]">*</span></label>
                <CustomSelect
                  :modelValue="calculationQuarter || null"
                  @update:modelValue="(v: string | number | null) => { calculationQuarter = String(v || ''); validationErrors.quarter && delete validationErrors.quarter }"
                  :options="quarterOptions"
                  :compact="true"
                  :placeholder="$t('businessCalc.selectQuarter')"
                />
                <p v-if="validationErrors.quarter" class="mt-1 text-[17px] font-medium text-[#EF4444]">{{ validationErrors.quarter }}</p>
                <p v-else-if="formSubmitted && formErrors.quarter" class="vld-error" data-validation-error>
                  <span class="vld-error__icon">&#9888;</span> {{ formErrors.quarter }}
                </p>
              </div>
              <div>
                <label class="block text-[17px] font-semibold text-[#1e293b] mb-2">{{ $t('businessCalc.yearLabel') }}</label>
                <CustomSelect
                  :modelValue="calculationYear"
                  @update:modelValue="(v: string | number | null) => { calculationYear = String(v || '2026') }"
                  :options="yearOptions"
                  :compact="true"
                />
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
                <p class="text-[17px] font-medium text-[#64748b]">{{ $t('businessCalc.deadlineBefore', { date: producerDeadlineFormatted }) }}</p>
              </div>
            </div>

            <!-- Importer: Date picker + Year -->
            <div v-if="payerType === 'importer'" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-[17px] font-semibold text-[#1e293b] mb-2">{{ $t('businessCalc.importDateLabel') }} <span class="text-[#EF4444]">*</span></label>
                <input
                  type="date"
                  v-model="importDate"
                  min="2020-01-01"
                  :max="dateInputMax"
                  :class="[
                    'w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 text-[17px]',
                    (validationErrors.importDate || (formSubmitted && formErrors.importDate))
                      ? 'border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]/20 vld-input--error'
                      : 'border-[#e2e8f0] focus:border-[#f59e0b] focus:ring-[#f59e0b]/20'
                  ]"
                  @change="validationErrors.importDate && delete validationErrors.importDate"
                />
                <p v-if="validationErrors.importDate" class="mt-1 text-[17px] font-medium text-[#EF4444]">{{ validationErrors.importDate }}</p>
                <p v-else-if="formSubmitted && formErrors.importDate" class="vld-error" data-validation-error>
                  <span class="vld-error__icon">&#9888;</span> {{ formErrors.importDate }}
                </p>
              </div>
              <div>
                <label class="block text-[17px] font-semibold text-[#1e293b] mb-2">{{ $t('businessCalc.yearLabel') }}</label>
                <CustomSelect
                  :modelValue="calculationYear"
                  @update:modelValue="(v: string | number | null) => { calculationYear = String(v || '2026') }"
                  :options="yearOptions"
                  :compact="true"
                />
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
                <p class="text-[17px] font-medium text-[#64748b]">{{ $t('businessCalc.deadlineBeforeWithDays', { date: importerDeadlineFormatted, days: importerDaysLeft }) }}</p>
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
                <p class="text-[17px] font-medium text-red-600">{{ $t('businessCalc.deadlineWas', { date: importerDeadlineFormatted }) }}</p>
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
                  <label class="block text-[17px] font-semibold text-[#64748b] mb-1">{{ $t('businessCalc.companyNameLabel') }}</label>
                  <input type="text" :value="companyData.name" readonly class="w-full px-3 py-2 bg-white border border-[#e2e8f0] rounded-lg text-[#1e293b] cursor-not-allowed text-[17px]" />
                </div>
                <div>
                  <label class="block text-[17px] font-semibold text-[#64748b] mb-1">{{ $t('businessCalc.innLabel') }}</label>
                  <input type="text" :value="companyData.inn" readonly class="w-full px-3 py-2 bg-white border border-[#e2e8f0] rounded-lg text-[#1e293b] cursor-not-allowed text-[17px]" />
                </div>
                <div class="sm:col-span-2">
                  <label class="block text-[17px] font-semibold text-[#64748b] mb-1">{{ $t('businessCalc.addressLabel') }}</label>
                  <input type="text" :value="companyData.address" readonly class="w-full px-3 py-2 bg-white border border-[#e2e8f0] rounded-lg text-[#1e293b] cursor-not-allowed text-[17px]" />
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
                <p class="text-[17px] font-medium text-[#64748b]" v-html="$t('businessCalc.paymentTermsText')"></p>
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
              <div class="flex items-center justify-between mb-4">
                <span class="text-[17px] font-semibold text-[#64748b]">{{ $t('businessCalc.positionN', { n: index + 1 }) }}</span>
                <button v-if="productItems.length > 1" @click="removeProductItem(item.id)" class="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors" :title="$t('businessCalc.deletePosition')">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              <div class="cf-info">
                <ProductGroupSelector
                  :group="item.group"
                  :subgroup="item.subgroup"
                  @update:group="(v: string) => { item.group = v; item.subgroup = ''; item.tnvedCode = ''; updateItemRate(item) }"
                  @update:subgroup="(v: string) => { item.subgroup = v; updateItemRate(item) }"
                  @subgroup-selected="(data: ProductSubgroup | null) => { if (data) item.tnvedCode = data.code }"
                  accent-color="#f59e0b"
                />
                <p v-if="validationErrors[`product_${index}_group`]" class="mt-1 text-[17px] font-medium text-[#EF4444]">{{ validationErrors[`product_${index}_group`] }}</p>
                <p v-else-if="formSubmitted && formErrors[`product_${index}_group`]" class="vld-error" data-validation-error>
                  <span class="vld-error__icon">&#9888;</span> {{ formErrors[`product_${index}_group`] }}
                </p>

                <div v-if="payerType === 'producer' && item.group" class="mt-3">
                  <label class="block text-[17px] font-semibold text-[#64748b] mb-1">{{ $t('businessCalc.gskpCodeLabel') }}</label>
                  <input
                    type="text"
                    v-model="item.gskpCode"
                    :placeholder="$t('businessCalc.gskpCodePlaceholder')"
                    class="w-full max-w-xs px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#f59e0b] text-[17px]"
                  />
                </div>
              </div>

              <div class="cf-data" v-if="item.group">
                <div class="cf-data__header">{{ $t('businessCalc.calcDataHeader') }}</div>

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
                    <p v-if="validationErrors[`product_${index}_volume`]" class="text-[17px] font-medium text-[#EF4444] mt-1">{{ validationErrors[`product_${index}_volume`] }}</p>
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

                <div v-if="getVolumeError(item)" class="norm-msg norm-msg--error" data-validation-error>
                  <svg class="norm-msg__icon" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                  {{ getVolumeError(item) }}
                </div>
                <p v-else-if="formSubmitted && formErrors[`product_${index}_sum`]" class="vld-error mt-3" data-validation-error>
                  <span class="vld-error__icon">&#9888;</span> {{ formErrors[`product_${index}_sum`] }}
                </p>

                <div v-else-if="getNormStatus(item)" :class="['norm-msg', getNormStatus(item)!.met ? 'norm-msg--success' : 'norm-msg--warning']">
                  <svg v-if="getNormStatus(item)!.met" class="norm-msg__icon" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <svg v-else class="norm-msg__icon" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {{ getNormStatus(item)!.message }}
                </div>

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
                <p class="text-[17px] font-medium text-[#64748b] mb-1">{{ $t('businessCalc.calcNumberLabel') }}</p>
                <p class="font-bold text-[#1e293b] font-mono">{{ calculationResult.number }}</p>
              </div>
              <div>
                <p class="text-[17px] font-medium text-[#64748b] mb-1">{{ $t('businessCalc.calcDateLabel') }}</p>
                <p class="font-bold text-[#1e293b]">{{ calculationResult.date }}</p>
              </div>
              <div>
                <p class="text-[17px] font-medium text-[#64748b] mb-1">{{ $t('businessCalc.paymentDueLabel') }}</p>
                <p class="font-bold" :style="{ color: deadlineStatus && (deadlineStatus.overdue || deadlineStatus.days <= 5) ? '#DC2626' : '#f59e0b' }">
                  {{ calculationResult.dueDate }}
                </p>
                <p v-if="deadlineStatus" class="text-[17px] font-medium mt-0.5" :style="{ color: deadlineStatus.overdue ? '#DC2626' : '#94a3b8' }">
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
                <p v-if="isOverdue && penaltyData && penaltyData.overdueDays > 0" class="text-xs mt-1.5" style="color: #fecaca">
                  {{ $t('payment.overduePreview', { days: penaltyData.overdueDays, penalty: penaltyData.totalPenalty.toLocaleString() }) }}
                </p>
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

          <!-- TN VED notes -->
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

          <!-- Графа 13 -->
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

          <PenaltyInfo
            v-if="isOverdue && penaltyData && penaltyData.overdueDays > 0"
            :debtAmount="totalAmount"
            :dueDate="currentDeadline"
            class="mt-6"
          />

          <!-- Payment details -->
          <div class="pay-details mt-6">
            <h3 class="pay-details__title">{{ $t('payment.paymentDetailsTitle') }}</h3>
            <div class="pay-details__cards">
              <div class="pay-card pay-card--fee">
                <div class="pay-card__head">
                  <span class="pay-card__label">{{ $t('payment.payment1Title') }}</span>
                  <span class="pay-card__amount pay-card__amount--green">{{ totalAmount.toLocaleString('ru-RU', { minimumFractionDigits: 2 }) }} {{ $t('penalty.som') }}</span>
                </div>
                <div class="pay-card__rows">
                  <div class="pay-card__row"><span class="pay-card__key">{{ $t('payment.recipient') }}</span><span class="pay-card__val">{{ PAYMENT_ACCOUNTS.utilization_fee.recipient }}</span></div>
                  <div class="pay-card__row"><span class="pay-card__key">{{ $t('payment.bankLabel') }}</span><span class="pay-card__val">{{ PAYMENT_ACCOUNTS.utilization_fee.bank }}</span></div>
                  <div class="pay-card__row"><span class="pay-card__key">{{ $t('payment.accountNumber') }}</span><span class="pay-card__val font-mono">{{ PAYMENT_ACCOUNTS.utilization_fee.account }}</span></div>
                  <div class="pay-card__row"><span class="pay-card__key">{{ $t('payment.bikLabel') }}</span><span class="pay-card__val font-mono">{{ PAYMENT_ACCOUNTS.utilization_fee.bik }}</span></div>
                  <div class="pay-card__row"><span class="pay-card__key">{{ $t('payment.innLabel') }}</span><span class="pay-card__val font-mono">{{ PAYMENT_ACCOUNTS.utilization_fee.inn }}</span></div>
                  <div class="pay-card__row"><span class="pay-card__key">{{ $t('payment.purposeLabel') }}</span><span class="pay-card__val text-xs">{{ feePurpose }}</span></div>
                </div>
                <div class="pay-card__actions">
                  <button @click="copyRequisites('utilization_fee')" class="pay-card__btn">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                    {{ $t('payment.copyRequisites') }}
                  </button>
                  <button disabled class="pay-card__btn pay-card__btn--disabled" :title="$t('payment.receiptTooltip')">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    {{ $t('payment.downloadReceipt') }}
                  </button>
                </div>
              </div>
              <div v-if="isOverdue && penaltyData && penaltyData.overdueDays > 0" class="pay-card pay-card--penalty">
                <div class="pay-card__head">
                  <span class="pay-card__label">{{ $t('payment.payment2Title') }}</span>
                  <span class="pay-card__amount pay-card__amount--amber">{{ penaltyData.totalPenalty.toLocaleString('ru-RU', { minimumFractionDigits: 2 }) }} {{ $t('penalty.som') }}</span>
                </div>
                <div class="pay-card__rows">
                  <div class="pay-card__row"><span class="pay-card__key">{{ $t('payment.recipient') }}</span><span class="pay-card__val">{{ PAYMENT_ACCOUNTS.penalty.recipient }}</span></div>
                  <div class="pay-card__row"><span class="pay-card__key">{{ $t('payment.bankLabel') }}</span><span class="pay-card__val">{{ PAYMENT_ACCOUNTS.penalty.bank }}</span></div>
                  <div class="pay-card__row"><span class="pay-card__key">{{ $t('payment.accountNumber') }}</span><span class="pay-card__val font-mono">{{ PAYMENT_ACCOUNTS.penalty.account }}</span></div>
                  <div class="pay-card__row"><span class="pay-card__key">{{ $t('payment.bikLabel') }}</span><span class="pay-card__val font-mono">{{ PAYMENT_ACCOUNTS.penalty.bik }}</span></div>
                  <div class="pay-card__row"><span class="pay-card__key">{{ $t('payment.purposeLabel') }}</span><span class="pay-card__val text-xs">{{ penaltyPurpose }}</span></div>
                </div>
                <div class="pay-card__actions">
                  <button @click="copyRequisites('penalty')" class="pay-card__btn">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                    {{ $t('payment.copyRequisites') }}
                  </button>
                  <button disabled class="pay-card__btn pay-card__btn--disabled" :title="$t('payment.receiptTooltip')">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    {{ $t('payment.downloadReceipt') }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Summary block -->
          <div v-if="isOverdue && penaltyData && penaltyData.overdueDays > 0" class="summary-block mt-6">
            <h3 class="summary-block__title">{{ $t('payment.summaryTitle') }}</h3>
            <div class="summary-block__row">
              <div>
                <span>{{ $t('businessCalc.feeAmountLabel') }}</span>
                <p class="summary-block__sub">&rarr; {{ PAYMENT_ACCOUNTS.utilization_fee.recipient }}, {{ $t('payment.accountNumber').toLowerCase() }} ...{{ PAYMENT_ACCOUNTS.utilization_fee.account.slice(-4) }}</p>
              </div>
              <span class="font-bold">{{ totalAmount.toLocaleString('ru-RU', { minimumFractionDigits: 2 }) }} {{ $t('penalty.som') }}</span>
            </div>
            <div class="summary-block__row" style="color:#fbbf24">
              <div>
                <span>{{ $t('payment.penaltyRowLabel', { days: penaltyData.overdueDays }) }}</span>
                <p class="summary-block__sub">&rarr; {{ PAYMENT_ACCOUNTS.penalty.recipient }}, {{ $t('payment.accountNumber').toLowerCase() }} ...{{ PAYMENT_ACCOUNTS.penalty.account.slice(-4) }}</p>
              </div>
              <span class="font-bold">{{ penaltyData.totalPenalty.toLocaleString('ru-RU', { minimumFractionDigits: 2 }) }} {{ $t('penalty.som') }}</span>
            </div>
            <div class="summary-block__sep"></div>
            <div class="summary-block__row summary-block__row--total">
              <span>{{ $t('payment.grandTotal') }}</span>
              <span>{{ penaltyData.totalToPay.toLocaleString('ru-RU', { minimumFractionDigits: 2 }) }} {{ $t('penalty.som') }}</span>
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
.fc-card__icon--blue { background: #F1F5F9; color: #3B82F6; }
.fc-card__icon--purple { background: #F1F5F9; color: #8B5CF6; }
.fc-card__icon--green { background: #D1FAE5; color: #059669; }
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
.fc-card__desc { font-size: 12px; color: #94A3B8; margin-top: 2px; }
.fc-card__desc--green { color: #059669; font-weight: 500; }
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
.fc-card:hover .fc-card__btn { background: #3B82F6; color: white; }
.fc-card--warn .fc-card__btn { background: #FEF3C7; color: #D97706; }
.fc-card--warn:hover .fc-card__btn { background: #F59E0B; color: white; }
.fc-card__remove {
  display: flex; align-items: center; justify-content: center;
  width: 32px; height: 32px; border-radius: 8px; border: none;
  background: #FEE2E2; color: #EF4444; cursor: pointer;
  transition: all 0.2s ease; flex-shrink: 0;
}
.fc-card__remove:hover { background: #EF4444; color: white; }

.cf-card {
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 14px;
  padding: 24px;
  margin-bottom: 16px;
}
.cf-info {
  background: #F8FAFC;
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 16px;
}
.cf-data { border-top: 2px solid #f59e0b; padding-top: 16px; }
.cf-data__header {
  font-size: 13px; font-weight: 600; color: #f59e0b;
  text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 14px;
}
.cf-data__fields { display: flex; gap: 16px; }
.cf-data__field { flex: 1; min-width: 0; }
.cf-data__label {
  display: block; font-size: 15px; color: #475569;
  font-weight: 600; margin-bottom: 6px;
}
.cf-data__input {
  width: 100%; padding: 12px 16px; border: 1.5px solid #E2E8F0;
  border-radius: 10px; font-size: 16px; font-weight: 600; color: #1E293B;
  background: white; outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  -moz-appearance: textfield;
}
.cf-data__input::-webkit-inner-spin-button,
.cf-data__input::-webkit-outer-spin-button {
  -webkit-appearance: none; margin: 0;
}
.cf-data__input:focus { border-color: #f59e0b; box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1); }
.cf-data__input--error { border-color: #FCA5A5; background: #FEF2F2; }
.cf-data__input--error:focus { border-color: #F87171; box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1); }
.cf-data__hint {
  display: block; font-size: 13px; color: #94A3B8;
  margin-top: 6px; line-height: 1.4;
}

.norm-msg {
  display: flex; align-items: center; gap: 8px; margin-top: 12px;
  padding: 10px 14px; border-radius: 10px; font-size: 13px;
  font-weight: 500; line-height: 1.4;
}
.norm-msg__icon { flex-shrink: 0; }
.norm-msg--success { background: #F0FDF4; border: 1px solid #BBF7D0; color: #15803D; }
.norm-msg--warning { background: #FFFBEB; border: 1px solid #FDE68A; color: #92400E; }
.norm-msg--error { background: #FEF2F2; border: 1px solid #FECACA; color: #DC2626; }

.cf-data__computed {
  display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px;
  margin-top: 16px; padding-top: 14px; border-top: 1px dashed #e2e8f0;
}
.cf-data__computed-cell {
  display: flex; flex-direction: column; gap: 4px;
  background: #F8FAFC; border-radius: 8px; padding: 10px 12px;
}
.cf-data__computed-label {
  font-size: 11px; text-transform: uppercase; color: #94A3B8;
  font-weight: 600; letter-spacing: 0.3px;
}
.cf-data__computed-value { font-size: 16px; font-weight: 700; color: #1E293B; }

.cf-data__summary {
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 8px; margin-top: 16px; padding: 14px 20px;
  background: linear-gradient(135deg, rgba(245,158,11,0.08), rgba(217,119,6,0.08));
  border-radius: 10px; border: 1px solid rgba(245,158,11,0.15);
}
.cf-data__summary-label { font-weight: 600; font-size: 14px; color: #1E293B; }
.cf-data__summary-value { font-weight: 800; font-size: 18px; color: #f59e0b; }

.cf-total-banner {
  background: white; border: 1px solid #E2E8F0; border-radius: 16px;
  padding: 20px 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
.cf-total-banner__grid {
  display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px;
  margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #e2e8f0;
}
.cf-total-banner__cell { display: flex; flex-direction: column; gap: 4px; }
.cf-total-banner__cell-label {
  font-size: 11px; color: #94A3B8; font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.3px;
}
.cf-total-banner__cell-value { font-size: 16px; font-weight: 700; color: #1E293B; }
.cf-total-banner__bottom {
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 12px;
}
.cf-total-banner__label { font-size: 18px; font-weight: 600; color: #1E293B; }
.cf-total-banner__value { font-size: 28px; font-weight: 800; }

@media (max-width: 640px) {
  .cf-data__fields { flex-direction: column; }
  .cf-data__computed { grid-template-columns: repeat(2, 1fr); }
  .cf-data__summary { flex-direction: column; align-items: flex-start; }
  .cf-total-banner__grid { grid-template-columns: repeat(2, 1fr); }
  .cf-total-banner__bottom { flex-direction: column; align-items: flex-start; }
  .fc-card { min-width: 0; padding: 12px 14px; gap: 10px; }
  .fc-card__icon { width: 36px; height: 36px; }
  .fc-card__icon svg { width: 16px; height: 16px; }
  .fc-card__btn { padding: 6px 12px; font-size: 12px; }
}

.g13-container { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 14px; padding: 20px; }
.g13-header { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
.g13-title { font-size: 14px; font-weight: 600; color: #475569; }
.g13-tooltip-wrap { position: relative; }
.g13-tooltip-wrap:hover .g13-tooltip { opacity: 1; visibility: visible; }
.g13-tooltip {
  position: absolute; left: 50%; transform: translateX(-50%);
  bottom: calc(100% + 8px); width: 320px; padding: 10px 14px;
  background: #1e293b; color: #f1f5f9; font-size: 12px; line-height: 1.5;
  border-radius: 8px; opacity: 0; visibility: hidden;
  transition: all 0.15s; z-index: 50; pointer-events: none;
}
.g13-cards { display: flex; gap: 16px; }
@media (max-width: 768px) { .g13-cards { flex-direction: column; } }
.g13-card {
  flex: 1; background: white; border: 1px solid #E2E8F0; border-radius: 10px;
  padding: 16px; display: flex; flex-direction: column; gap: 4px;
}
.g13-card--diff { border-left-width: 3px; }
.g13-card--zero { border-left-color: #64748B; background: #F8FAFC; }
.g13-card__label { font-size: 12px; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.02em; }
.g13-card__value { font-size: 20px; font-weight: 700; color: #1E293B; }
.g13-card__value--green { color: #059669; }
.g13-card__value--gray { color: #64748B; }
.g13-card__sub { font-size: 11px; color: #94A3B8; }

.pay-details { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; }
.pay-details__title { font-size: 18px; font-weight: 700; color: #1e293b; margin-bottom: 16px; }
.pay-details__cards { display: grid; grid-template-columns: 1fr; gap: 16px; }
@media (min-width: 768px) { .pay-details__cards { grid-template-columns: 1fr 1fr; } }

.pay-card { border-radius: 12px; padding: 20px; }
.pay-card--fee { background: #ecfdf5; border: 1px solid #a7f3d0; }
.pay-card--penalty { background: #fffbeb; border: 1px solid #fde68a; }
.pay-card__head { margin-bottom: 12px; }
.pay-card__label { display: block; font-size: 13px; font-weight: 600; color: #64748b; margin-bottom: 4px; }
.pay-card__amount { display: block; font-size: 22px; font-weight: 900; }
.pay-card__amount--green { color: #059669; }
.pay-card__amount--amber { color: #d97706; }
.pay-card__rows { margin-bottom: 12px; }
.pay-card__row {
  display: flex; justify-content: space-between; gap: 8px;
  padding: 4px 0; font-size: 13px; color: #1e293b;
}
.pay-card__key { color: #64748b; flex-shrink: 0; }
.pay-card__val { text-align: right; word-break: break-all; }
.pay-card__actions { display: flex; flex-wrap: wrap; gap: 8px; }
.pay-card__btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 6px 12px; font-size: 12px; font-weight: 500;
  border-radius: 8px; border: 1px solid #e2e8f0; background: #fff;
  color: #1e293b; cursor: pointer; transition: background 0.15s;
}
.pay-card__btn:hover { background: #f1f5f9; }
.pay-card__btn--disabled { opacity: 0.5; cursor: not-allowed; }
.pay-card__btn--disabled:hover { background: #fff; }

.summary-block { background: #1e293b; color: #fff; border-radius: 12px; padding: 20px 24px; }
.summary-block__title { font-size: 16px; font-weight: 700; margin-bottom: 12px; }
.summary-block__row {
  display: flex; justify-content: space-between; align-items: flex-start;
  padding: 8px 0; font-size: 14px;
}
.summary-block__row--total { font-size: 14px; color: rgba(255,255,255,0.7); }
.summary-block__row--total span:last-child { font-size: 24px; font-weight: 900; color: #fff; }
.summary-block__sub { font-size: 12px; color: rgba(255,255,255,0.5); margin-top: 2px; }
.summary-block__sep { border-top: 1px solid rgba(255,255,255,0.2); margin: 4px 0; }

@media print {
  .dashboard-layout > aside,
  .dashboard-layout > main > header,
  .lg\:hidden { display: none !important; }
  .lg\:ml-72 { margin-left: 0 !important; }
}
</style>
