<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import { calculationStore } from '../../stores/calculations'
import { accountStore } from '../../stores/account'
import { productGroups, getSubgroupLabel } from '../../data/product-groups'
import InstructionDrawer from '../../components/InstructionDrawer.vue'
import { instructionCalculationHtml } from '../../data/instructionCalculation'
import { validators, scrollToFirstError } from '../../utils/validators'
import { useBusinessMenu } from '../../composables/useRoleMenu'
import { CalcStatus } from '../../constants/statuses'

const { t } = useI18n()
const router = useRouter()
const { roleTitle, menuItems } = useBusinessMenu()

const showInstruction = ref(false)
const formSubmitted = ref(false)

// Correction comment / reason
const correctionComment = ref('')

// View mode
type ViewMode = 'form' | 'success'
const viewMode = ref<ViewMode>('form')

// Step 1: Selected calculation
const selectedCalculationId = ref<number | null>(null)

// Paid calculations
const paidCalculations = computed(() =>
  calculationStore.state.calculations.filter(c => c.status === CalcStatus.PAID)
)

// Selected calculation object
const selectedCalculation = computed(() => {
  if (!selectedCalculationId.value) return null
  return calculationStore.state.calculations.find(c => c.id === selectedCalculationId.value) || null
})

// Correction items
interface CorrectionRow {
  group: string
  subgroup: string
  volume: number
  recyclingStandard: number
  volumeToRecycle: number
  previousTransferred: number
  previousExported: number
  additionalTransferred: number
  additionalExported: number
  rate: number
  oldTaxableVolume: number
}

const correctionItems = ref<CorrectionRow[]>([])

// When calculation is selected, populate correction items
function onCalculationSelect() {
  const calc = selectedCalculation.value
  if (!calc) {
    correctionItems.value = []
    return
  }
  correctionItems.value = calc.items.map(item => ({
    group: item.group,
    subgroup: item.subgroup,
    volume: parseFloat(item.volume) || 0,
    recyclingStandard: item.recyclingStandard,
    volumeToRecycle: item.volumeToRecycle,
    previousTransferred: parseFloat(item.transferredToRecycling) || 0,
    previousExported: parseFloat(item.exportedFromKR) || 0,
    additionalTransferred: 0,
    additionalExported: 0,
    rate: item.rate,
    oldTaxableVolume: item.taxableVolume,
  }))
}

// Get group label
function getGroupLabel(groupValue: string): string {
  const group = productGroups.find(g => g.value === groupValue)
  return group ? group.label : groupValue
}

// Computed: new taxable volume per row
function getNewTaxableVolume(row: CorrectionRow): number {
  const totalTransferred = row.previousTransferred + row.additionalTransferred
  const totalExported = row.previousExported + row.additionalExported
  return Math.max(0, row.volumeToRecycle - totalTransferred - totalExported)
}

// Computed: difference per row (positive means refund/credit)
function getDifference(row: CorrectionRow): number {
  const newTaxable = getNewTaxableVolume(row)
  return Math.round((row.oldTaxableVolume - newTaxable) * row.rate * 100) / 100
}

// Validation per row: sum of recycling + export must not exceed Гр.5 (total volume)
function isRowValid(row: CorrectionRow): boolean {
  const totalUsed = row.previousTransferred + row.additionalTransferred + row.previousExported + row.additionalExported
  return totalUsed <= row.volume
}

// Norm status for correction row
type CorrNormStatus = { met: boolean; message: string }
function getCorrNormStatus(row: CorrectionRow): CorrNormStatus | null {
  const totalTransferred = row.previousTransferred + row.additionalTransferred
  const totalExported = row.previousExported + row.additionalExported
  if (totalTransferred + totalExported >= row.volumeToRecycle) {
    return { met: true, message: t('businessCorrection.normMet') }
  }
  const newTaxable = getNewTaxableVolume(row)
  if (newTaxable > 0) {
    return { met: false, message: t('businessCorrection.normNotMet', { volume: newTaxable.toFixed(2) }) }
  }
  return null
}

// Has any row with validation error
const hasValidationErrors = computed(() =>
  correctionItems.value.some(row => !isRowValid(row))
)

// Has any additional data entered
const hasAdditionalData = computed(() =>
  correctionItems.value.some(row => row.additionalTransferred > 0 || row.additionalExported > 0)
)

// Total correction amount
const totalCorrectionAmount = computed(() =>
  correctionItems.value.reduce((sum, row) => sum + getDifference(row), 0)
)

// Has any additional processing entered
const hasAdditionalProcessing = computed(() =>
  correctionItems.value.some(row => row.additionalTransferred > 0)
)

// Has any additional export entered
const hasAdditionalExport = computed(() =>
  correctionItems.value.some(row => row.additionalExported > 0)
)

// Document uploads
const docs = ref<Record<string, string>>({
  processingContract: '',
  processingAct: '',
  processingLicense: '',
  exportGtd: '',
  exportInvoice: '',
  exportTransport: '',
})

function handleDocUpload(key: string, event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    docs.value[key] = input.files[0].name
  }
}

function clearDoc(key: string) {
  docs.value[key] = ''
}

// Action selection
type CorrectionAction = 'balance' | 'refund'
const correctionAction = ref<CorrectionAction>('balance')

// New amount per row after correction
function getNewAmount(row: CorrectionRow): number {
  return Math.round(getNewTaxableVolume(row) * row.rate * 100) / 100
}

// Format amount
function formatAmount(amount: number): string {
  return amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + ' ' + t('businessCorrection.som')
}

// Submit correction
function submitCorrection() {
  formSubmitted.value = true

  if (hasErrors.value) {
    scrollToFirstError()
    return
  }

  const calc = selectedCalculation.value
  if (!calc) return

  const documents: string[] = Object.values(docs.value).filter(Boolean)

  accountStore.submitCorrection({
    calculationId: calc.id,
    calculationNumber: calc.number,
    company: calc.company,
    comment: correctionComment.value.trim(),
    items: correctionItems.value.map(row => ({
      group: row.group,
      subgroup: row.subgroup,
      volume: row.volume,
      recyclingStandard: row.recyclingStandard,
      volumeToRecycle: row.volumeToRecycle,
      previousTransferred: row.previousTransferred,
      previousExported: row.previousExported,
      additionalTransferred: row.additionalTransferred,
      additionalExported: row.additionalExported,
      oldTaxableVolume: row.oldTaxableVolume,
      newTaxableVolume: getNewTaxableVolume(row),
      rate: row.rate,
      difference: getDifference(row),
    })),
    totalCorrectionAmount: totalCorrectionAmount.value,
    action: correctionAction.value,
    documents,
  })

  viewMode.value = 'success'
}

// Form-level validation errors
const formErrors = computed(() => {
  const errors: Record<string, string> = {}

  // Comment / reason is required, minimum 10 characters
  const commentRequired = validators.required(correctionComment.value.trim(), t('businessCorrection.validatorCorrectionReason'))
  if (commentRequired) {
    errors.comment = commentRequired
  } else {
    const commentMin = validators.minLength(correctionComment.value.trim(), 10, t('businessCorrection.validatorCorrectionReason'))
    if (commentMin) errors.comment = commentMin
  }

  // Calculation must be selected
  const calcRequired = validators.required(selectedCalculationId.value, t('businessCorrection.validatorCalculation'))
  if (calcRequired) errors.calculation = calcRequired

  // At least one row must have additional data
  if (selectedCalculationId.value && !hasAdditionalData.value) {
    errors.items = t('businessCorrection.validationSpecifyVolumes')
  }

  // Per-row validation: additionalTransferred and additionalExported must be non-negative
  correctionItems.value.forEach((row, index) => {
    const transferredErr = validators.positiveNumber(row.additionalTransferred, t('businessCorrection.validatorAdditionalRecycling'))
    if (transferredErr) errors[`row_${index}_transferred`] = transferredErr

    const exportedErr = validators.positiveNumber(row.additionalExported, t('businessCorrection.validatorAdditionalExport'))
    if (exportedErr) errors[`row_${index}_exported`] = exportedErr

    // Sum must not exceed volume (Гр.5)
    if (!isRowValid(row)) {
      errors[`row_${index}_overflow`] = t('businessCorrection.validationSumExceedsRow', { volume: row.volume })
    }
  })

  // Correction amount must be positive
  if (selectedCalculationId.value && hasAdditionalData.value && totalCorrectionAmount.value <= 0) {
    errors.amount = t('businessCorrection.validationPositiveAmount')
  }

  return errors
})

const hasErrors = computed(() => Object.keys(formErrors.value).length > 0)

// Can submit
const canSubmit = computed(() =>
  selectedCalculationId.value !== null &&
  hasAdditionalData.value &&
  !hasValidationErrors.value &&
  !hasErrors.value &&
  totalCorrectionAmount.value > 0
)
</script>

<template>
  <DashboardLayout role="business" :roleTitle="roleTitle" userName="ОсОО «ТехПром»" :menuItems="menuItems">
    <!-- FORM VIEW -->
    <template v-if="viewMode === 'form'">
      <!-- Header with back button -->
      <div class="mb-6">
        <button
          @click="router.push('/business/account')"
          class="flex items-center gap-2 text-[#64748b] hover:text-[#1e293b] mb-4 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {{ $t('businessCorrection.backToAccount') }}
        </button>
        <div class="flex items-center justify-between gap-4">
          <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b]">{{ $t('businessCorrection.title') }}</h1>
          <button @click="showInstruction = true" class="flex items-center gap-2 text-[#2D8B4E] hover:bg-[#ecfdf5] px-4 py-2 rounded-xl transition-colors text-sm font-medium flex-shrink-0">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ $t('businessCorrection.instruction') }}
          </button>
        </div>
      </div>

      <!-- Step 1: Select paid calculation -->
      <div class="bg-white rounded-2xl p-5 lg:p-6 shadow-sm border border-[#e2e8f0] mb-6">
        <h2 class="text-lg font-semibold text-[#1e293b] mb-4 flex items-center gap-2">
          <span class="w-7 h-7 rounded-full bg-[#8b5cf6] text-white text-sm font-bold flex items-center justify-center">1</span>
          {{ $t('businessCorrection.step1Title') }}
        </h2>
        <select
          v-model="selectedCalculationId"
          @change="onCalculationSelect"
          :class="['w-full px-4 py-3 border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#8b5cf6] text-[#1e293b] bg-white', { 'vld-input--error': formSubmitted && formErrors['calculation'] }]"
        >
          <option :value="null" disabled>{{ $t('businessCorrection.selectCalculation') }}</option>
          <option v-for="calc in paidCalculations" :key="calc.id" :value="calc.id">
            {{ calc.number }} от {{ calc.date }} -- {{ formatAmount(calc.totalAmount) }}
          </option>
        </select>
        <p v-if="formSubmitted && formErrors['calculation']" class="vld-error" data-validation-error>
          <span class="vld-error__icon">&#9888;</span> {{ formErrors['calculation'] }}
        </p>
        <p v-if="paidCalculations.length === 0" class="mt-3 text-sm text-[#f59e0b]">
          {{ $t('businessCorrection.noPaidCalculations') }}
        </p>
      </div>

      <!-- Step 2: Items table -->
      <div v-if="selectedCalculation" class="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] mb-6">
        <div class="p-5 lg:p-6 border-b border-[#e2e8f0]">
          <h2 class="text-lg font-semibold text-[#1e293b] flex items-center gap-2">
            <span class="w-7 h-7 rounded-full bg-[#8b5cf6] text-white text-sm font-bold flex items-center justify-center">2</span>
            {{ $t('businessCorrection.positionsOfCalc') }} {{ selectedCalculation.number }}
          </h2>
          <p class="text-sm text-[#64748b] mt-1">{{ $t('businessCorrection.specifyAdditionalVolumes') }}</p>
        </div>

        <div class="p-5 lg:p-6 pt-4 lg:pt-4">
          <!-- Position cards -->
          <div
            v-for="(row, index) in correctionItems"
            :key="index"
            :class="['cf-card', !isRowValid(row) ? 'cf-card--invalid' : '']"
          >
            <!-- BLOCK 1: Info (readonly) -->
            <div class="cf-info">
              <div class="cf-info__title">{{ index + 1 }}. {{ getGroupLabel(row.group) }}</div>
              <div class="cf-info__subtitle">{{ row.subgroup ? getSubgroupLabel(row.group, row.subgroup) : '—' }}</div>
              <div class="cf-info__grid">
                <div class="cf-info__cell">
                  <span class="cf-info__label">{{ $t('businessCorrection.gr5Volume') }}</span>
                  <span class="cf-info__value">{{ row.volume }} <span class="cf-info__unit">{{ $t('businessCorrection.tons') }}</span></span>
                </div>
                <div class="cf-info__cell">
                  <span class="cf-info__label">{{ $t('businessCorrection.gr6Standard') }}</span>
                  <span class="cf-info__value">{{ row.recyclingStandard }}<span class="cf-info__unit">%</span></span>
                </div>
                <div class="cf-info__cell">
                  <span class="cf-info__label">{{ $t('businessCorrection.gr7ToRecycle') }}</span>
                  <span class="cf-info__value">{{ row.volumeToRecycle.toFixed(2) }} <span class="cf-info__unit">{{ $t('businessCorrection.tons') }}</span></span>
                </div>
                <div class="cf-info__cell">
                  <span class="cf-info__label">{{ $t('businessCorrection.gr8PrevTransferred') }}</span>
                  <span class="cf-info__value">{{ row.previousTransferred }} <span class="cf-info__unit">{{ $t('businessCorrection.tons') }}</span></span>
                </div>
                <div class="cf-info__cell">
                  <span class="cf-info__label">{{ $t('businessCorrection.gr9PrevExported') }}</span>
                  <span class="cf-info__value">{{ row.previousExported }} <span class="cf-info__unit">{{ $t('businessCorrection.tons') }}</span></span>
                </div>
                <div class="cf-info__cell">
                  <span class="cf-info__label">{{ $t('businessCorrection.gr11Rate') }}</span>
                  <span class="cf-info__value">{{ row.rate.toLocaleString() }} <span class="cf-info__unit">{{ $t('businessCorrection.somPerTon') }}</span></span>
                </div>
              </div>
            </div>

            <!-- BLOCK 2: Correction inputs -->
            <div class="cf-correction">
              <div class="cf-correction__header">{{ $t('businessCorrection.specifyAdditionalVolumesHeader') }}</div>
              <div class="cf-correction__inputs">
                <div class="cf-correction__field">
                  <label class="cf-correction__label">{{ $t('businessCorrection.additionalRecycling') }}</label>
                  <input
                    type="number"
                    v-model.number="row.additionalTransferred"
                    min="0" step="0.01" placeholder="0.00"
                    :class="['cf-correction__input', !isRowValid(row) ? 'cf-correction__input--error' : '']"
                  />
                  <span class="cf-correction__hint">{{ $t('businessCorrection.additionalRecyclingHint') }}</span>
                </div>
                <div class="cf-correction__field">
                  <label class="cf-correction__label">{{ $t('businessCorrection.additionalExportKR') }}</label>
                  <input
                    type="number"
                    v-model.number="row.additionalExported"
                    min="0" step="0.01" placeholder="0.00"
                    :class="['cf-correction__input', !isRowValid(row) ? 'cf-correction__input--error' : '']"
                  />
                  <span class="cf-correction__hint">{{ $t('businessCorrection.additionalExportHint') }}</span>
                </div>
              </div>

              <!-- Validation error: sum exceeds Гр.5 -->
              <div v-if="!isRowValid(row)" class="norm-msg norm-msg--error">
                <svg class="norm-msg__icon" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                {{ $t('businessCorrection.sumExceedsVolume', { volume: row.volume }) }}
              </div>

              <!-- Norm status info -->
              <div v-else-if="getCorrNormStatus(row)" :class="['norm-msg', getCorrNormStatus(row)!.met ? 'norm-msg--success' : 'norm-msg--warning']">
                <svg v-if="getCorrNormStatus(row)!.met" class="norm-msg__icon" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <svg v-else class="norm-msg__icon" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {{ getCorrNormStatus(row)!.message }}
              </div>

              <!-- Summary row -->
              <div
                class="cf-correction__summary"
                :class="getDifference(row) > 0 ? 'cf-correction__summary--positive' : getDifference(row) < 0 ? 'cf-correction__summary--negative' : 'cf-correction__summary--neutral'"
              >
                <span class="cf-correction__summary-left">{{ $t('businessCorrection.newTaxableVolume') }} <strong>{{ getNewTaxableVolume(row).toFixed(2) }} {{ $t('businessCorrection.tons') }}</strong></span>
                <span
                  class="cf-correction__summary-right"
                  :style="{ color: getDifference(row) > 0 ? '#059669' : getDifference(row) < 0 ? '#EF4444' : '#64748B' }"
                >{{ $t('businessCorrection.gr12Sum', { amount: getNewAmount(row).toLocaleString() }) }}</span>
              </div>
            </div>
          </div>

          <!-- Total correction -->
          <div v-if="correctionItems.length > 0" class="cf-total">
            <span class="cf-total__label">{{ $t('businessCorrection.totalCorrection') }}</span>
            <span
              class="cf-total__value"
              :style="{ color: totalCorrectionAmount > 0 ? '#059669' : totalCorrectionAmount < 0 ? '#EF4444' : '#64748B' }"
            >{{ $t('businessCorrection.difference') }} {{ totalCorrectionAmount > 0 ? '+' : '' }}{{ formatAmount(totalCorrectionAmount) }}</span>
          </div>
        </div>

        <!-- Validation warning -->
        <div v-if="hasValidationErrors" class="px-5 py-3 bg-red-50 border-t border-red-200 rounded-b-2xl">
          <p class="text-sm text-red-600 flex items-center gap-2">
            <svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            {{ $t('businessCorrection.validationSumExceeds') }}
          </p>
        </div>
        <div v-if="formSubmitted && formErrors['items']" class="px-5 py-3">
          <p class="vld-error" data-validation-error>
            <span class="vld-error__icon">&#9888;</span> {{ formErrors['items'] }}
          </p>
        </div>
      </div>

      <!-- Document upload section -->
      <div v-if="selectedCalculation" class="bg-white rounded-2xl p-5 lg:p-6 shadow-sm border border-[#e2e8f0] mb-6">
        <h2 class="text-lg font-semibold text-[#1e293b] mb-4 flex items-center gap-2">
          <span class="w-7 h-7 rounded-full bg-[#10b981] text-white text-sm font-bold flex items-center justify-center">3</span>
          {{ $t('businessCorrection.step3Title') }}
        </h2>

        <!-- No data entered yet -->
        <p v-if="!hasAdditionalProcessing && !hasAdditionalExport" class="text-sm text-[#9ca3af] py-4">
          {{ $t('businessCorrection.noDataForDocs') }}
        </p>

        <!-- Processing documents -->
        <div v-if="hasAdditionalProcessing" class="doc-section mb-4">
          <p class="font-semibold text-[15px] text-[#1e293b] mb-1">&#9851; {{ $t('businessCorrection.recyclingSection') }}</p>
          <p class="text-[13px] text-[#6b7280] mb-4">{{ $t('businessCorrection.recyclingDocsDesc') }}</p>

          <div class="doc-cards-list">
            <!-- Doc 1: Contract -->
            <label
              class="doc-card"
              :class="docs.processingContract ? 'doc-card--done' : ''"
            >
              <input type="file" class="hidden" @change="handleDocUpload('processingContract', $event)" accept=".pdf,.jpg,.png,.doc,.docx" />
              <div class="doc-card__icon" :class="docs.processingContract ? 'doc-card__icon--done' : ''">
                <svg v-if="!docs.processingContract" class="w-5 h-5 text-[#94a3b8]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                <svg v-else class="w-5 h-5 text-[#10b981]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
              </div>
              <div class="doc-card__info">
                <p class="doc-card__title">{{ $t('businessCorrection.docContract') }}</p>
                <p class="doc-card__desc" v-if="!docs.processingContract">{{ $t('businessCorrection.docContractDesc') }}</p>
                <p class="doc-card__desc doc-card__desc--done" v-else>{{ docs.processingContract }}</p>
              </div>
              <div class="doc-card__action" v-if="!docs.processingContract">
                <span class="doc-card__upload-btn">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                  {{ $t('businessCorrection.upload') }}
                </span>
              </div>
              <div v-else class="doc-card__status">
                <span class="text-xs font-medium text-[#10b981]">{{ $t('businessCorrection.uploaded') }}</span>
                <button @click.prevent="clearDoc('processingContract')" class="doc-card__remove" :title="$t('common.delete')">&times;</button>
              </div>
            </label>

            <!-- Doc 2: Act -->
            <label
              class="doc-card"
              :class="docs.processingAct ? 'doc-card--done' : ''"
            >
              <input type="file" class="hidden" @change="handleDocUpload('processingAct', $event)" accept=".pdf,.jpg,.png,.doc,.docx" />
              <div class="doc-card__icon" :class="docs.processingAct ? 'doc-card__icon--done' : ''">
                <svg v-if="!docs.processingAct" class="w-5 h-5 text-[#94a3b8]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                <svg v-else class="w-5 h-5 text-[#10b981]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
              </div>
              <div class="doc-card__info">
                <p class="doc-card__title">{{ $t('businessCorrection.docAct') }}</p>
                <p class="doc-card__desc" v-if="!docs.processingAct">{{ $t('businessCorrection.docActDesc') }}</p>
                <p class="doc-card__desc doc-card__desc--done" v-else>{{ docs.processingAct }}</p>
              </div>
              <div class="doc-card__action" v-if="!docs.processingAct">
                <span class="doc-card__upload-btn">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                  {{ $t('businessCorrection.upload') }}
                </span>
              </div>
              <div v-else class="doc-card__status">
                <span class="text-xs font-medium text-[#10b981]">{{ $t('businessCorrection.uploaded') }}</span>
                <button @click.prevent="clearDoc('processingAct')" class="doc-card__remove" :title="$t('common.delete')">&times;</button>
              </div>
            </label>

            <!-- Doc 3: License (optional) -->
            <label
              class="doc-card"
              :class="docs.processingLicense ? 'doc-card--done' : ''"
            >
              <input type="file" class="hidden" @change="handleDocUpload('processingLicense', $event)" accept=".pdf,.jpg,.png,.doc,.docx" />
              <div class="doc-card__icon" :class="docs.processingLicense ? 'doc-card__icon--done' : ''">
                <svg v-if="!docs.processingLicense" class="w-5 h-5 text-[#94a3b8]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                <svg v-else class="w-5 h-5 text-[#10b981]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
              </div>
              <div class="doc-card__info">
                <div class="flex items-center gap-2 flex-wrap">
                  <p class="doc-card__title" style="margin:0">{{ $t('businessCorrection.docLicense') }}</p>
                  <span class="doc-optional-badge">{{ $t('businessCorrection.optional') }}</span>
                </div>
                <p class="doc-card__desc" v-if="!docs.processingLicense">{{ $t('businessCorrection.docLicenseDesc') }}</p>
                <p class="doc-card__desc doc-card__desc--done" v-else>{{ docs.processingLicense }}</p>
              </div>
              <div class="doc-card__action" v-if="!docs.processingLicense">
                <span class="doc-card__upload-btn">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                  {{ $t('businessCorrection.upload') }}
                </span>
              </div>
              <div v-else class="doc-card__status">
                <span class="text-xs font-medium text-[#10b981]">{{ $t('businessCorrection.uploaded') }}</span>
                <button @click.prevent="clearDoc('processingLicense')" class="doc-card__remove" :title="$t('common.delete')">&times;</button>
              </div>
            </label>
          </div>
        </div>

        <!-- Export documents -->
        <div v-if="hasAdditionalExport" class="doc-section">
          <p class="font-semibold text-[15px] text-[#1e293b] mb-1">&#128666; {{ $t('businessCorrection.exportSection') }}</p>
          <p class="text-[13px] text-[#6b7280] mb-4">{{ $t('businessCorrection.exportDocsDesc') }}</p>

          <div class="doc-cards-list">
            <!-- Doc 1: GTD -->
            <label
              class="doc-card"
              :class="docs.exportGtd ? 'doc-card--done' : ''"
            >
              <input type="file" class="hidden" @change="handleDocUpload('exportGtd', $event)" accept=".pdf,.jpg,.png,.doc,.docx" />
              <div class="doc-card__icon" :class="docs.exportGtd ? 'doc-card__icon--done' : ''">
                <svg v-if="!docs.exportGtd" class="w-5 h-5 text-[#94a3b8]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                <svg v-else class="w-5 h-5 text-[#10b981]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
              </div>
              <div class="doc-card__info">
                <p class="doc-card__title">{{ $t('businessCorrection.docGtd') }}</p>
                <p class="doc-card__desc" v-if="!docs.exportGtd">{{ $t('businessCorrection.docGtdDesc') }}</p>
                <p class="doc-card__desc doc-card__desc--done" v-else>{{ docs.exportGtd }}</p>
              </div>
              <div class="doc-card__action" v-if="!docs.exportGtd">
                <span class="doc-card__upload-btn">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                  {{ $t('businessCorrection.upload') }}
                </span>
              </div>
              <div v-else class="doc-card__status">
                <span class="text-xs font-medium text-[#10b981]">{{ $t('businessCorrection.uploaded') }}</span>
                <button @click.prevent="clearDoc('exportGtd')" class="doc-card__remove" :title="$t('common.delete')">&times;</button>
              </div>
            </label>

            <!-- Doc 2: Invoice -->
            <label
              class="doc-card"
              :class="docs.exportInvoice ? 'doc-card--done' : ''"
            >
              <input type="file" class="hidden" @change="handleDocUpload('exportInvoice', $event)" accept=".pdf,.jpg,.png,.doc,.docx" />
              <div class="doc-card__icon" :class="docs.exportInvoice ? 'doc-card__icon--done' : ''">
                <svg v-if="!docs.exportInvoice" class="w-5 h-5 text-[#94a3b8]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                <svg v-else class="w-5 h-5 text-[#10b981]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
              </div>
              <div class="doc-card__info">
                <p class="doc-card__title">{{ $t('businessCorrection.docInvoice') }}</p>
                <p class="doc-card__desc" v-if="!docs.exportInvoice">{{ $t('businessCorrection.docInvoiceDesc') }}</p>
                <p class="doc-card__desc doc-card__desc--done" v-else>{{ docs.exportInvoice }}</p>
              </div>
              <div class="doc-card__action" v-if="!docs.exportInvoice">
                <span class="doc-card__upload-btn">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                  {{ $t('businessCorrection.upload') }}
                </span>
              </div>
              <div v-else class="doc-card__status">
                <span class="text-xs font-medium text-[#10b981]">{{ $t('businessCorrection.uploaded') }}</span>
                <button @click.prevent="clearDoc('exportInvoice')" class="doc-card__remove" :title="$t('common.delete')">&times;</button>
              </div>
            </label>

            <!-- Doc 3: Transport -->
            <label
              class="doc-card"
              :class="docs.exportTransport ? 'doc-card--done' : ''"
            >
              <input type="file" class="hidden" @change="handleDocUpload('exportTransport', $event)" accept=".pdf,.jpg,.png,.doc,.docx" />
              <div class="doc-card__icon" :class="docs.exportTransport ? 'doc-card__icon--done' : ''">
                <svg v-if="!docs.exportTransport" class="w-5 h-5 text-[#94a3b8]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                <svg v-else class="w-5 h-5 text-[#10b981]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
              </div>
              <div class="doc-card__info">
                <p class="doc-card__title">{{ $t('businessCorrection.docTransport') }}</p>
                <p class="doc-card__desc" v-if="!docs.exportTransport">{{ $t('businessCorrection.docTransportDesc') }}</p>
                <p class="doc-card__desc doc-card__desc--done" v-else>{{ docs.exportTransport }}</p>
              </div>
              <div class="doc-card__action" v-if="!docs.exportTransport">
                <span class="doc-card__upload-btn">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                  {{ $t('businessCorrection.upload') }}
                </span>
              </div>
              <div v-else class="doc-card__status">
                <span class="text-xs font-medium text-[#10b981]">{{ $t('businessCorrection.uploaded') }}</span>
                <button @click.prevent="clearDoc('exportTransport')" class="doc-card__remove" :title="$t('common.delete')">&times;</button>
              </div>
            </label>
          </div>
        </div>
      </div>

      <!-- Step 3.5: Correction reason / comment -->
      <div v-if="selectedCalculation" class="bg-white rounded-2xl p-5 lg:p-6 shadow-sm border border-[#e2e8f0] mb-6">
        <h2 class="text-lg font-semibold text-[#1e293b] mb-4 flex items-center gap-2">
          <span class="w-7 h-7 rounded-full bg-[#f59e0b] text-white text-sm font-bold flex items-center justify-center">4</span>
          {{ $t('businessCorrection.step4Title') }} <span class="text-red-500">*</span>
        </h2>
        <p class="text-sm text-[#64748b] mb-3">{{ $t('businessCorrection.step4Desc') }}</p>
        <textarea
          v-model="correctionComment"
          rows="4"
          :placeholder="$t('businessCorrection.step4Placeholder')"
          :class="['w-full px-4 py-3 border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#f59e0b] text-[#1e293b] bg-white resize-y', { 'vld-input--error': formSubmitted && formErrors['comment'] }]"
        ></textarea>
        <p v-if="formSubmitted && formErrors['comment']" class="vld-error" data-validation-error>
          <span class="vld-error__icon">&#9888;</span> {{ formErrors['comment'] }}
        </p>
        <p v-else class="text-xs text-[#94a3b8] mt-1">{{ correctionComment.trim().length }} / 10 {{ $t('businessCorrection.minChars') }}</p>
      </div>

      <!-- Total correction amount (visible only when data entered) -->
      <div v-if="selectedCalculation && hasAdditionalData" class="cf-total-banner mb-6">
        <span class="cf-total-banner__label">{{ $t('businessCorrection.correctionAmountLabel') }}</span>
        <span
          class="cf-total-banner__value"
          :style="{ color: totalCorrectionAmount > 0 ? '#059669' : totalCorrectionAmount < 0 ? '#EF4444' : '#64748B' }"
        >{{ totalCorrectionAmount > 0 ? '+' : '' }}{{ formatAmount(totalCorrectionAmount) }}</span>
        <p v-if="formSubmitted && formErrors['amount']" class="vld-error w-full" data-validation-error>
          <span class="vld-error__icon">&#9888;</span> {{ formErrors['amount'] }}
        </p>
      </div>

      <!-- Action selection -->
      <div v-if="selectedCalculation && hasAdditionalData" class="bg-white rounded-2xl p-5 lg:p-6 shadow-sm border border-[#e2e8f0] mb-6">
        <h2 class="text-lg font-semibold text-[#1e293b] mb-4 flex items-center gap-2">
          <span class="w-7 h-7 rounded-full bg-[#8b5cf6] text-white text-sm font-bold flex items-center justify-center">5</span>
          {{ $t('businessCorrection.step5Title') }}
        </h2>
        <div class="space-y-3">
          <label class="flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all" :class="correctionAction === 'balance' ? 'border-[#8b5cf6] bg-purple-50' : 'border-[#e2e8f0] hover:border-[#8b5cf6]/50'">
            <input type="radio" v-model="correctionAction" value="balance" class="w-4 h-4 text-[#8b5cf6]" />
            <div>
              <p class="font-medium text-[#1e293b]">{{ $t('businessCorrection.actionBalance') }}</p>
              <p class="text-sm text-[#64748b]">{{ $t('businessCorrection.actionBalanceDesc') }}</p>
            </div>
          </label>
          <label class="flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all" :class="correctionAction === 'refund' ? 'border-[#8b5cf6] bg-purple-50' : 'border-[#e2e8f0] hover:border-[#8b5cf6]/50'">
            <input type="radio" v-model="correctionAction" value="refund" class="w-4 h-4 text-[#8b5cf6]" />
            <div>
              <p class="font-medium text-[#1e293b]">{{ $t('businessCorrection.actionRefund') }}</p>
              <p class="text-sm text-[#64748b]">{{ $t('businessCorrection.actionRefundDesc') }}</p>
            </div>
          </label>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="flex flex-col sm:flex-row gap-4">
        <button
          @click="submitCorrection"
          :disabled="!canSubmit || (formSubmitted && hasErrors)"
          class="flex items-center justify-center gap-2 px-6 py-3 bg-[#10b981] text-white rounded-xl font-semibold hover:bg-[#059669] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {{ $t('businessCorrection.submitCorrection') }}
        </button>
        <button
          @click="router.push('/business/account')"
          class="flex items-center justify-center gap-2 px-6 py-3 border border-[#e2e8f0] text-[#64748b] rounded-xl font-medium hover:bg-[#f8fafc] transition-colors"
        >
          {{ $t('common.cancel') }}
        </button>
      </div>
    </template>

    <!-- SUCCESS VIEW -->
    <template v-else-if="viewMode === 'success'">
      <div class="max-w-2xl mx-auto text-center py-12">
        <div class="w-24 h-24 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
          <svg class="w-12 h-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b] mb-4">{{ $t('businessCorrection.successTitle') }}</h1>
        <p class="text-[#64748b] mb-2 text-lg">
          {{ $t('businessCorrection.successMessage') }}
        </p>
        <p class="text-sm text-[#64748b] mb-8">
          {{ $t('businessCorrection.successNotification') }}
        </p>
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-[#e2e8f0] mb-8">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
            <div>
              <p class="text-sm text-[#64748b] mb-1">{{ $t('businessCorrection.calculation') }}</p>
              <p class="text-lg font-bold text-[#8b5cf6] font-mono">{{ selectedCalculation?.number }}</p>
            </div>
            <div>
              <p class="text-sm text-[#64748b] mb-1">{{ $t('businessCorrection.correctionAmount') }}</p>
              <p class="text-lg font-bold text-[#10b981]">+{{ formatAmount(totalCorrectionAmount) }}</p>
            </div>
          </div>
        </div>
        <button
          @click="router.push('/business/account')"
          class="flex items-center justify-center gap-2 px-8 py-3 bg-[#8b5cf6] text-white rounded-xl font-medium hover:bg-[#7c3aed] transition-colors mx-auto"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {{ $t('businessCorrection.returnToAccount') }}
        </button>
      </div>
    </template>

    <InstructionDrawer v-model="showInstruction" :title="$t('businessCorrection.instructionDrawerTitle')" :contentHtml="instructionCalculationHtml" />
  </DashboardLayout>
</template>

<style scoped>
.doc-section {
  background: white;
  border-radius: 14px;
  padding: 20px;
  border: 1px solid #E2E8F0;
}
.doc-cards-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.doc-card {
  display: flex;
  align-items: center;
  gap: 14px;
  border: 1.5px dashed #CBD5E1;
  border-radius: 10px;
  padding: 14px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
}
.doc-card:hover {
  background: #F8FAFC;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.doc-card:hover .doc-card__upload-btn {
  background: #3B82F6;
  color: white;
}
.doc-card--done {
  border: 1.5px solid #D1FAE5;
  background: #F0FDF4;
  cursor: default;
}
.doc-card--done:hover {
  background: #F0FDF4;
  transform: none;
  box-shadow: none;
}
.doc-card__icon {
  width: 40px;
  height: 40px;
  min-width: 40px;
  border-radius: 50%;
  background: #F1F5F9;
  display: flex;
  align-items: center;
  justify-content: center;
}
.doc-card__icon--done {
  background: #D1FAE5;
}
.doc-card__info {
  flex: 1;
  min-width: 0;
}
.doc-card__title {
  font-weight: 600;
  font-size: 14px;
  color: #1E293B;
  margin: 0 0 2px 0;
  text-decoration: none;
}
.doc-card__desc {
  font-size: 12.5px;
  color: #64748B;
  margin: 0;
}
.doc-card__desc--done {
  color: #10b981;
}
.doc-optional-badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 500;
  color: #94A3B8;
  background: #F1F5F9;
  border-radius: 6px;
  padding: 2px 8px;
  white-space: nowrap;
}
.doc-card__action {
  flex-shrink: 0;
}
.doc-card__upload-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #EFF6FF;
  color: #3B82F6;
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
  white-space: nowrap;
}
.doc-card__status {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.doc-card__remove {
  background: none;
  border: none;
  color: #ef4444;
  font-size: 18px;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
  padding: 0 2px;
  transition: color 0.15s;
}
.doc-card__remove:hover {
  color: #dc2626;
}

/* ── Card-form ── */
.cf-card {
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 14px;
  padding: 24px;
  margin-bottom: 16px;
}
.cf-card--invalid {
  border-color: #FCA5A5;
}

/* ── Info block (readonly) ── */
.cf-info {
  background: #F8FAFC;
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 16px;
}
.cf-info__title {
  font-size: 16px;
  font-weight: 700;
  color: #0F172A;
  line-height: 1.4;
}
.cf-info__subtitle {
  font-size: 13px;
  color: #64748B;
  margin-top: 2px;
  line-height: 1.4;
}
.cf-info__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px 16px;
  margin-top: 14px;
}
.cf-info__cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.cf-info__label {
  font-size: 11px;
  text-transform: uppercase;
  color: #94A3B8;
  font-weight: 600;
  letter-spacing: 0.3px;
}
.cf-info__value {
  font-size: 18px;
  font-weight: 700;
  color: #1E293B;
}
.cf-info__unit {
  font-size: 13px;
  color: #94A3B8;
  font-weight: 400;
}

/* ── Correction block ── */
.cf-correction {
  border-top: 2px solid #22C55E;
  padding-top: 16px;
}
.cf-correction__header {
  font-size: 13px;
  font-weight: 600;
  color: #22C55E;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 14px;
}
.cf-correction__inputs {
  display: flex;
  gap: 16px;
}
.cf-correction__field {
  flex: 1;
  min-width: 0;
}
.cf-correction__label {
  display: block;
  font-size: 13px;
  color: #475569;
  font-weight: 500;
  margin-bottom: 6px;
}
.cf-correction__input {
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
.cf-correction__input::-webkit-inner-spin-button,
.cf-correction__input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.cf-correction__input:focus {
  border-color: #22C55E;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
}
.cf-correction__input--error {
  border-color: #FCA5A5;
  background: #FEF2F2;
}
.cf-correction__input--error:focus {
  border-color: #F87171;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}
.cf-correction__hint {
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

/* ── Summary row ── */
.cf-correction__summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  border-radius: 10px;
  padding: 14px 20px;
  margin-top: 16px;
}
.cf-correction__summary--positive {
  background: #F0FDF4;
}
.cf-correction__summary--negative {
  background: #FEF2F2;
}
.cf-correction__summary--neutral {
  background: #F8FAFC;
}
.cf-correction__summary-left {
  font-weight: 600;
  font-size: 14px;
  color: #1E293B;
}
.cf-correction__summary-right {
  font-weight: 700;
  font-size: 16px;
}

/* ── Total block (inside card area) ── */
.cf-total {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  background: white;
  border: 2px solid #22C55E;
  border-radius: 14px;
  padding: 20px;
  margin-top: 8px;
}
.cf-total__label {
  font-weight: 700;
  font-size: 16px;
  color: #1E293B;
}
.cf-total__value {
  font-size: 20px;
  font-weight: 800;
}

/* ── Total banner (standalone) ── */
.cf-total-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  background: white;
  border-radius: 2xl;
  padding: 20px 24px;
  border: 1px solid #E2E8F0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  border-radius: 16px;
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

/* ── Validation ── */
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

/* ── Mobile ── */
@media (max-width: 640px) {
  .cf-info__grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .cf-correction__inputs {
    flex-direction: column;
  }
  .cf-correction__summary {
    flex-direction: column;
    align-items: flex-start;
  }
  .cf-total {
    flex-direction: column;
    align-items: flex-start;
  }
  .cf-total-banner {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
