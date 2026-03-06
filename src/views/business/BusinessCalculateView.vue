<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { validators, scrollToFirstError } from '../../utils/validators'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import { AppButton, AppCard } from '../../components/ui'
import { useCalculationStore } from '../../stores/calculations'
import { CalcStatus } from '../../constants/statuses'
import { calculatePaymentDeadline, getRemainingDays, formatDateRu, formatDateShort } from '../../utils/dateUtils'
import { calculatePenalty, getOverdueDays } from '../../utils/penalty'
import { PAYMENT_ACCOUNTS } from '../../config/payment-accounts'
import InstructionDrawer from '../../components/InstructionDrawer.vue'
import { instructionCalculationHtml } from '../../data/instructionCalculation'
import { useBusinessMenu } from '../../composables/useRoleMenu'
import { toastStore } from '../../stores/toast'
import { useAccountStore } from '../../stores/account'
import { notificationStore } from '../../stores/notifications'
import ConfirmDialog from '../../components/common/ConfirmDialog.vue'
import type { SelectOption } from '@/types/select'
import type { CalculatorProductItem, PayerType, ConfirmDialogState, CalculationResult } from '@/types/calculator'
import { emptyItem, updateItemRate, calculateAmount, buildCalcData, copyRequisites, getNextProductId } from '@/helpers/calculatorHelpers'
import { useProductGroupStore } from '@/stores/product-groups'

import CalculatorStepper from './components/calculator/CalculatorStepper.vue'
import StepPeriod from './components/calculator/StepPeriod.vue'
import StepProducts from './components/calculator/StepProducts.vue'
import StepResult from './components/calculator/StepResult.vue'
import NavigationButtons from './components/calculator/NavigationButtons.vue'

const { roleTitle, menuItems } = useBusinessMenu()
const { t } = useI18n()
const router = useRouter()
const calcStore = useCalculationStore()
const accountStore = useAccountStore()
const productGroupStore = useProductGroupStore()

onMounted(() => {
  accountStore.fetchAll()
  if (productGroupStore.groups.length === 0) {
    productGroupStore.fetchGroups()
  }
})

const showInstruction = ref(false)
const currentStep = ref(1)
const totalSteps = 3

const steps = computed(() => [
  { number: 1, title: t('businessCalc.stepPeriod') },
  { number: 2, title: t('businessCalc.stepProducts') },
  { number: 3, title: t('businessCalc.stepResult') },
])

const showDraftNotification = ref(false)

const confirmDialog = ref<ConfirmDialogState>({
  visible: false,
  title: '',
  message: '',
  icon: 'warning',
  confirmText: '',
  confirmColor: 'green',
  onConfirm: () => {},
})

const openConfirm = (opts: Partial<ConfirmDialogState> & { onConfirm: () => void }) => {
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

const deadlineStatus = computed(() => {
  if (!currentDeadline.value) return null
  return getRemainingDays(currentDeadline.value)
})

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

const companyData = computed(() => ({
  name: accountStore.myAccount?.company || '',
  inn: accountStore.myAccount?.inn || '',
  address: '',
  director: '',
  phone: '',
  email: '',
}))

const productItems = ref<CalculatorProductItem[]>([
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

const onGroupChanged = (item: CalculatorProductItem) => {
  const groupNumber = productGroupStore.getGroupNumberFromValue(item.group)
  if (groupNumber && productGroupStore.getSubgroups(groupNumber).length === 0) {
    productGroupStore.fetchSubgroups(groupNumber)
  }
  updateItemRate(item, calculationYear.value)
}

const onSubgroupChanged = (item: CalculatorProductItem) => {
  updateItemRate(item, calculationYear.value)
}

const importFromDeclaration = () => {
  const items: CalculatorProductItem[] = [
    { id: getNextProductId(), group: 'group_6', subgroup: 'g6_bottles_small', gskpCode: '', tnvedCode: '3923', volume: '12.5', recyclingStandard: 20, volumeToRecycle: 0, transferredToRecycling: '', recycledFile: null, exportedFromKR: '', exportedFile: null, taxableVolume: 0, rate: 0, amount: 0 },
    { id: getNextProductId(), group: 'group_1', subgroup: 'g1_corrugated_boxes', gskpCode: '', tnvedCode: '4819 10', volume: '8.3', recyclingStandard: 20, volumeToRecycle: 0, transferredToRecycling: '', recycledFile: null, exportedFromKR: '', exportedFile: null, taxableVolume: 0, rate: 0, amount: 0 },
    { id: getNextProductId(), group: 'group_8', subgroup: 'g8_bottles_clear', gskpCode: '', tnvedCode: '7010', volume: '5.2', recyclingStandard: 10, volumeToRecycle: 0, transferredToRecycling: '', recycledFile: null, exportedFromKR: '', exportedFile: null, taxableVolume: 0, rate: 0, amount: 0 },
  ]
  items.forEach(item => {
    updateItemRate(item, calculationYear.value)
  })
  productItems.value = items
}

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

const calculationResult = ref<CalculationResult>({
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

const clearValidation = (key: string) => {
  if (validationErrors.value[key]) {
    delete validationErrors.value[key]
  }
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
      updateItemRate(item, calculationYear.value)
    }
  })
})

const saveDraft = () => {
  const calcData = buildCalcData({
    calculationResultNumber: calculationResult.value.number,
    calculationResultDate: calculationResult.value.date,
    companyName: companyData.value.name,
    companyInn: companyData.value.inn,
    companyAddress: companyData.value.address,
    quarter: calculationQuarter.value,
    year: calculationYear.value,
    payerType: payerType.value,
    importDate: importDate.value,
    items: productItems.value,
    totalAmount: totalAmount.value,
  })
  calcStore.addCalculation(calcData, CalcStatus.DRAFT)
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
      const calcData = buildCalcData({
        calculationResultNumber: calculationResult.value.number,
        calculationResultDate: calculationResult.value.date,
        companyName: companyData.value.name,
        companyInn: companyData.value.inn,
        companyAddress: companyData.value.address,
        quarter: calculationQuarter.value,
        year: calculationYear.value,
        payerType: payerType.value,
        importDate: importDate.value,
        items: productItems.value,
        totalAmount: totalAmount.value,
      })
      const newCalc = calcStore.addCalculation(calcData, CalcStatus.UNDER_REVIEW)
      notificationStore.add({
        type: 'info',
        title: t('businessCalc.notifNewCalc'),
        message: t('businessCalc.notifNewCalcMessage', { company: companyData.value.name }),
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

const handleCopyRequisites = (type: 'utilization_fee' | 'penalty') => {
  const amount = type === 'utilization_fee'
    ? totalAmount.value
    : penaltyData.value?.totalPenalty ?? 0
  const purpose = type === 'utilization_fee' ? feePurpose.value : penaltyPurpose.value
  copyRequisites(
    type,
    amount,
    purpose,
    {
      recipient: t('payment.recipient'),
      bank: t('payment.bankLabel'),
      account: t('payment.accountNumber'),
      bik: t('payment.bikLabel'),
      inn: t('payment.innLabel'),
      amount: t('payment.amountLabel'),
      purpose: t('payment.purposeLabel'),
      som: t('penalty.som'),
    },
    () => toastStore.show({ type: 'success', title: t('payment.copiedToast') }),
    () => toastStore.show({ type: 'info', title: t('payment.copiedToast') }),
  )
}
</script>

<template>
  <DashboardLayout
    role="business"
    :roleTitle="roleTitle"
    :userName="companyData.name"
    :menuItems="menuItems"
  >
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showDraftNotification" class="bcv-notification fixed top-6 right-6 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          {{ $t('businessCalc.draftSaved') }}
        </div>
      </Transition>
    </Teleport>

    <div class="max-w-6xl mx-auto">
      <div class="mb-6">
        <AppButton
          variant="back"
          @click="backToList"
          class="mb-4"
          :icon="'<svg class=&quot;w-5 h-5&quot; fill=&quot;none&quot; viewBox=&quot;0 0 24 24&quot; stroke=&quot;currentColor&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; stroke-width=&quot;2&quot; d=&quot;M10 19l-7-7m0 0l7-7m-7 7h18&quot; /></svg>'"
          :label="$t('businessCalc.backToList')"
        />
        <div class="flex items-center justify-between gap-4">
          <h1 class="bcv-title text-2xl lg:text-3xl font-bold">{{ $t('businessCalc.pageTitle') }}</h1>
          <AppButton
            variant="ghost"
            @click="showInstruction = true"
            :icon="'<svg class=&quot;w-4 h-4&quot; fill=&quot;none&quot; viewBox=&quot;0 0 24 24&quot; stroke=&quot;currentColor&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; stroke-width=&quot;2&quot; d=&quot;M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z&quot; /></svg>'"
            :label="$t('businessCalc.instructionBtn')"
            color="#2D8B4E"
          />
        </div>
      </div>

      <CalculatorStepper
        :steps="steps"
        :currentStep="currentStep"
        @go-to-step="goToStep"
      />

      <AppCard padding="none">
        <StepPeriod
          v-if="currentStep === 1"
          :payerType="payerType"
          :calculationQuarter="calculationQuarter"
          :calculationYear="calculationYear"
          :importDate="importDate"
          :companyData="companyData"
          :formSubmitted="formSubmitted"
          :formErrors="formErrors"
          :validationErrors="validationErrors"
          :quarterOptions="quarterOptions"
          :yearOptions="yearOptions"
          :dateInputMax="dateInputMax"
          :producerDeadlineFormatted="producerDeadlineFormatted"
          :importerDeadlineFormatted="importerDeadlineFormatted"
          :importerDaysLeft="importerDaysLeft"
          :importerDeadlinePassed="importerDeadlinePassed"
          @update:payerType="payerType = $event"
          @update:calculationQuarter="calculationQuarter = $event"
          @update:calculationYear="calculationYear = $event"
          @update:importDate="importDate = $event"
          @clear-validation="clearValidation"
        />

        <StepProducts
          v-if="currentStep === 2"
          :productItems="productItems"
          :payerType="payerType"
          :formSubmitted="formSubmitted"
          :formErrors="formErrors"
          :validationErrors="validationErrors"
          :totalVolume="totalVolume"
          :totalVolumeToRecycle="totalVolumeToRecycle"
          :totalTransferred="totalTransferred"
          :totalExported="totalExported"
          :totalTaxableVolume="totalTaxableVolume"
          :formattedTotalAmount="formattedTotalAmount"
          @add-item="addProductItem"
          @remove-item="removeProductItem"
          @import-declaration="importFromDeclaration"
          @group-changed="onGroupChanged"
          @subgroup-changed="onSubgroupChanged"
          @clear-validation="clearValidation"
        />

        <StepResult
          v-if="currentStep === 3"
          :productItems="productItems"
          :calculationResult="calculationResult"
          :totalAmount="totalAmount"
          :formattedTotalAmount="formattedTotalAmount"
          :payerType="payerType"
          :calculationQuarter="calculationQuarter"
          :calculationYear="calculationYear"
          :importDate="importDate"
          :deadlineStatus="deadlineStatus"
          :isOverdue="isOverdue"
          :penaltyData="penaltyData"
          :currentDeadline="currentDeadline"
          :totalVolume="totalVolume"
          :totalVolumeToRecycle="totalVolumeToRecycle"
          :totalTransferred="totalTransferred"
          :totalExported="totalExported"
          :totalTaxableVolume="totalTaxableVolume"
          :feePurpose="feePurpose"
          :penaltyPurpose="penaltyPurpose"
          @copy-requisites="handleCopyRequisites"
        />

        <NavigationButtons
          :currentStep="currentStep"
          :totalSteps="totalSteps"
          :formSubmitted="formSubmitted"
          :hasErrors="hasErrors"
          @next="handleStep1Next"
          @back="prevStep"
          @calculate="handleStep2Calculate"
          @save-draft="saveDraft"
          @submit="submitForReview"
        />
      </AppCard>
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
.bcv-notification {
  z-index: 200;
}
.bcv-title {
  color: #1e293b;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

@media print {
  .dashboard-layout > aside,
  .dashboard-layout > main > header,
  .lg\:hidden { display: none !important; }
  .lg\:ml-72 { margin-left: 0 !important; }
}
</style>
