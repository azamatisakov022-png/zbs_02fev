<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import { useCalculationStore } from '../../stores/calculations'
import { refundStore } from '../../stores/refunds'
import { productGroups, productSubgroups } from '../../data/product-groups'
import Select from '@/components/ui/general/Select.vue'
import type { SelectOption } from '@/types/select'
import { useAccountStore } from '../../stores/account'
import { useBusinessMenu } from '../../composables/useRoleMenu'
import { toastStore } from '../../stores/toast'
import { CalcStatus } from '../../constants/statuses'

const router = useRouter()
const { roleTitle, menuItems } = useBusinessMenu()
const accountStore = useAccountStore()
const { t } = useI18n()

onMounted(() => { accountStore.fetchAll() })
const calcStore = useCalculationStore()

// View mode
type ViewMode = 'form' | 'success'
const viewMode = ref<ViewMode>('form')

// Helpers
const getGroupLabel = (value: string) => productGroups.find(g => g.value === value)?.label || value
const getSubgroupLabel = (group: string, subgroup: string) => productSubgroups[group]?.find(s => s.value === subgroup)?.label || subgroup || '—'
const formatAmount = (amount: number) => amount.toLocaleString() + ' ' + t('businessRefundNew.som')

// Step 1: Select a paid calculation
const selectedCalcId = ref<number | null>(null)

const paidCalculations = computed(() =>
  calcStore.calculations.filter(c => c.status === CalcStatus.PAID)
)

const paidCalcOptions = computed<SelectOption[]>(() =>
  paidCalculations.value.map(calc => ({
    value: calc.id,
    label: `${calc.number} | ${calc.period} | ${formatAmount(calc.totalAmount)}`,
  }))
)

const selectedCalculation = computed(() =>
  paidCalculations.value.find(c => c.id === selectedCalcId.value) || null
)

// Refund items mapped from the selected calculation
interface LocalRefundItem {
  group: string
  subgroup: string
  volume: string
  paidAmount: number
  exportedFromKR: string
  rate: number
}

const refundItems = ref<LocalRefundItem[]>([])

const onSelectCalculation = () => {
  const calc = selectedCalculation.value
  if (!calc) {
    refundItems.value = []
    return
  }
  refundItems.value = calc.items.map(item => ({
    group: item.group,
    subgroup: item.subgroup,
    volume: item.volume,
    paidAmount: item.amount,
    exportedFromKR: '',
    rate: item.rate,
  }))
}

// Computed refund amounts per row
const getRefundAmount = (item: LocalRefundItem): number => {
  const exported = parseFloat(item.exportedFromKR)
  if (isNaN(exported) || exported <= 0) return 0
  return Math.round(exported * item.rate)
}

const hasExportExceedsVolume = (item: LocalRefundItem): boolean => {
  const exported = parseFloat(item.exportedFromKR)
  const volume = parseFloat(item.volume)
  if (isNaN(exported) || isNaN(volume)) return false
  return exported > volume
}

// Total refund amount
const totalRefundAmount = computed(() =>
  refundItems.value.reduce((sum, item) => sum + getRefundAmount(item), 0)
)

// Documents
const documents = ref<string[]>([])

const onFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files) return
  for (let i = 0; i < input.files.length; i++) {
    const name = input.files[i].name
    if (!documents.value.includes(name)) {
      documents.value.push(name)
    }
  }
  input.value = ''
}

const removeDocument = (index: number) => {
  documents.value.splice(index, 1)
}

// Validation
const hasAnyExport = computed(() =>
  refundItems.value.some(item => {
    const v = parseFloat(item.exportedFromKR)
    return !isNaN(v) && v > 0
  })
)

const hasValidationErrors = computed(() =>
  refundItems.value.some(item => hasExportExceedsVolume(item))
)

const canSubmit = computed(() =>
  selectedCalculation.value &&
  hasAnyExport.value &&
  !hasValidationErrors.value &&
  documents.value.length > 0
)

// Submit
const createdRefund = ref<{ number: string; amount: number; date: string } | null>(null)

const createRefund = () => {
  const calc = selectedCalculation.value
  if (!calc || !canSubmit.value) return

  const items = refundItems.value
    .filter(item => {
      const v = parseFloat(item.exportedFromKR)
      return !isNaN(v) && v > 0
    })
    .map(item => ({
      group: item.group,
      subgroup: item.subgroup,
      volume: item.volume,
      paidAmount: item.paidAmount,
      exportedFromKR: item.exportedFromKR,
      refundAmount: getRefundAmount(item),
      rate: item.rate,
    }))

  const refund = refundStore.createRefund({
    calculationId: calc.id,
    calculationNumber: calc.number,
    company: calc.company,
    inn: calc.inn,
    items,
    totalRefund: totalRefundAmount.value,
    documents: [...documents.value],
  })

  createdRefund.value = {
    number: refund.number,
    amount: refund.totalRefund,
    date: refund.date,
  }
  viewMode.value = 'success'
}

const saveDraft = () => {
  toastStore.show({ type: 'success', title: t('businessRefundNew.draftSaved') })
}
</script>

<template>
  <DashboardLayout role="business" :roleTitle="roleTitle" :userName="accountStore.myAccount?.company || ''" :menuItems="menuItems">

    <!-- FORM VIEW -->
    <template v-if="viewMode === 'form'">
      <div class="max-w-6xl mx-auto">
        <!-- Back button -->
        <div class="mb-6">
          <button @click="router.push('/business/refunds')" class="brn-back-btn">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {{ $t('businessRefundNew.backToApplications') }}
          </button>
          <h1 class="brn-page-title">{{ $t('businessRefundNew.title') }}</h1>
        </div>

        <!-- Step 1: Select paid calculation -->
        <div class="brn-card">
          <h2 class="brn-step-title font-semibold mb-1 flex items-center gap-2">
            <div class="brn-step-num w-7 h-7 rounded-full text-white flex items-center justify-center text-sm font-bold">1</div>
            {{ $t('businessRefundNew.selectPaidCalc') }}
          </h2>
          <p class="brn-step-desc mb-4 ml-9">{{ $t('businessRefundNew.refundOnlyPaid') }}</p>

          <div class="ml-9">
            <Select
              v-model="selectedCalcId"
              :options="paidCalcOptions"
              :placeholder="'— ' + $t('businessRefundNew.selectCalcOption') + ' —'"
              variant="form"
              @change="onSelectCalculation"
            />

            <div v-if="paidCalculations.length === 0" class="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <div class="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p class="brn-warn-title font-medium text-amber-800">{{ $t('businessRefundNew.noPaidCalcs') }}</p>
                <p class="brn-warn-desc text-amber-700">{{ $t('businessRefundNew.noPaidCalcsDesc') }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 2: Refund items table -->
        <div v-if="selectedCalculation && refundItems.length > 0" class="brn-card brn-card--no-pad">
          <div class="brn-card-header p-5 lg:p-6">
            <h2 class="brn-step-title font-semibold mb-1 flex items-center gap-2">
              <div class="brn-step-num w-7 h-7 rounded-full text-white flex items-center justify-center text-sm font-bold">2</div>
              {{ $t('businessRefundNew.refundItems') }}
            </h2>
            <p class="brn-step-desc ml-9">{{ $t('businessRefundNew.specifyExportedMass') }}</p>
          </div>

          <div class="overflow-x-auto">
            <table class="brn-table w-full">
              <thead>
                <tr class="brn-thead-row text-left">
                  <th class="px-4 py-3 font-medium">{{ $t('businessRefundNew.group') }}</th>
                  <th class="px-4 py-3 font-medium">{{ $t('businessRefundNew.subgroup') }}</th>
                  <th class="px-4 py-3 font-medium text-right">{{ $t('businessRefundNew.importMass') }}</th>
                  <th class="px-4 py-3 font-medium text-right">{{ $t('businessRefundNew.previouslyPaid') }}</th>
                  <th class="px-4 py-3 font-medium text-center">{{ $t('businessRefundNew.exportedFromKR') }}</th>
                  <th class="px-4 py-3 font-medium text-right">{{ $t('businessRefundNew.refundAmount') }}</th>
                </tr>
              </thead>
              <tbody class="brn-tbody">
                <tr
                  v-for="(item, index) in refundItems"
                  :key="index"
                  class="brn-table-row"
                  :class="{ 'bg-red-50': hasExportExceedsVolume(item) }"
                >
                  <td class="brn-cell-group px-4 py-3">
                    <span class="block truncate" :title="getGroupLabel(item.group)">{{ getGroupLabel(item.group) }}</span>
                  </td>
                  <td class="brn-cell-subgroup px-4 py-3">
                    <span class="block truncate" :title="getSubgroupLabel(item.group, item.subgroup)">{{ getSubgroupLabel(item.group, item.subgroup) }}</span>
                  </td>
                  <td class="brn-cell-md px-4 py-3 text-right font-medium">{{ item.volume }}</td>
                  <td class="brn-cell-md px-4 py-3 text-right font-medium text-green-600">{{ item.paidAmount.toLocaleString() }}</td>
                  <td class="px-4 py-3">
                    <div class="flex flex-col items-center">
                      <input
                        v-model="item.exportedFromKR"
                        type="text"
                        inputmode="decimal"
                        placeholder="0.0"
                        :class="[
                          'brn-input-export w-28 px-3 py-2 border rounded-lg text-center focus:outline-none transition-colors',
                          hasExportExceedsVolume(item)
                            ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                            : 'brn-input-export--normal'
                        ]"
                      />
                      <span v-if="hasExportExceedsVolume(item)" class="brn-cell-sm text-red-500 mt-1">
                        {{ $t('businessRefundNew.noMoreThan', { volume: item.volume }) }}
                      </span>
                    </div>
                  </td>
                  <td class="brn-cell-refund px-4 py-3 text-right font-semibold" :class="getRefundAmount(item) > 0 ? 'brn-text-green' : 'brn-text-muted'">
                    {{ getRefundAmount(item) > 0 ? getRefundAmount(item).toLocaleString() : '—' }}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="brn-tfoot-row">
                  <td colspan="5" class="brn-tfoot-label px-4 py-3 font-semibold">{{ $t('businessRefundNew.totalRefund') }}</td>
                  <td class="brn-tfoot-value px-4 py-3 text-right font-bold">
                    {{ totalRefundAmount > 0 ? formatAmount(totalRefundAmount) : '—' }}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <!-- Step 3: Document upload -->
        <div v-if="selectedCalculation" class="brn-card">
          <h2 class="brn-step-title font-semibold mb-1 flex items-center gap-2">
            <div class="brn-step-num w-7 h-7 rounded-full text-white flex items-center justify-center text-sm font-bold">3</div>
            {{ $t('businessRefundNew.supportingDocuments') }} <span class="text-red-500">*</span>
          </h2>
          <p class="brn-step-desc mb-4 ml-9">{{ $t('businessRefundNew.supportingDocsDesc') }}</p>

          <div class="ml-9">
            <label class="brn-upload-label flex items-center justify-center gap-2 w-full px-4 py-4 border-2 border-dashed rounded-xl hover:bg-green-50 transition-colors cursor-pointer">
              <svg class="brn-icon-muted w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span class="brn-upload-text font-medium">{{ $t('businessRefundNew.selectFiles') }}</span>
              <input type="file" multiple class="hidden" @change="onFileSelect" />
            </label>

            <div v-if="documents.length > 0" class="mt-4 space-y-2">
              <div
                v-for="(doc, idx) in documents"
                :key="idx"
                class="brn-doc-item flex items-center justify-between px-4 py-2.5 rounded-lg"
              >
                <div class="flex items-center gap-2">
                  <svg class="brn-icon-green w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span class="brn-doc-name">{{ doc }}</span>
                </div>
                <button @click="removeDocument(idx)" class="brn-doc-remove transition-colors p-1">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div v-if="documents.length === 0" class="brn-cell-sm mt-3 text-amber-600">
              {{ $t('businessRefundNew.attachAtLeastOne') }}
            </div>
          </div>
        </div>

        <!-- Total summary -->
        <div v-if="selectedCalculation && totalRefundAmount > 0" class="brn-summary rounded-2xl p-5 lg:p-6 mb-6">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p class="brn-step-desc mb-1">{{ $t('businessRefundNew.calculation') }}: <span class="brn-text-dark font-mono font-medium">{{ selectedCalculation.number }}</span></p>
              <p class="brn-step-desc">{{ $t('common.period') }}: {{ selectedCalculation.period }}</p>
            </div>
            <div class="text-right">
              <p class="brn-step-desc mb-1">{{ $t('businessRefundNew.totalRefundAmount') }}</p>
              <p class="brn-summary-total font-bold">{{ formatAmount(totalRefundAmount) }}</p>
            </div>
          </div>
        </div>

        <!-- Action buttons -->
        <div class="flex flex-col sm:flex-row justify-end gap-3 mb-8">
          <button
            @click="router.push('/business/refunds')"
            class="brn-btn-secondary flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg transition-colors"
          >
            {{ $t('common.cancel') }}
          </button>
          <button
            @click="saveDraft"
            class="brn-btn-secondary flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg transition-colors"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            {{ $t('businessRefundNew.saveDraft') }}
          </button>
          <button
            @click="createRefund"
            :disabled="!canSubmit"
            class="brn-btn-primary flex items-center justify-center gap-2 px-6 py-2.5 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ $t('businessRefundNew.submitApplication') }}
          </button>
        </div>
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

        <h1 class="brn-page-title mb-4">
          {{ $t('businessRefundNew.successTitle', { number: createdRefund?.number }) }}
        </h1>

        <div class="brn-card mb-8">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <p class="brn-step-desc mb-1">{{ $t('businessRefundNew.applicationNumber') }}</p>
              <p class="brn-success-value font-bold font-mono brn-text-green">{{ createdRefund?.number }}</p>
            </div>
            <div>
              <p class="brn-step-desc mb-1">{{ $t('businessRefundNew.refundAmountLabel') }}</p>
              <p class="brn-success-value font-bold brn-text-dark">{{ createdRefund ? formatAmount(createdRefund.amount) : '' }}</p>
            </div>
            <div>
              <p class="brn-step-desc mb-1">{{ $t('businessRefundNew.submissionDate') }}</p>
              <p class="brn-success-value font-bold brn-text-dark">{{ createdRefund?.date }}</p>
            </div>
          </div>
        </div>

        <p class="brn-step-desc mb-8">
          {{ $t('businessRefundNew.successLine1') }}<br />
          {{ $t('businessRefundNew.successLine2') }}
        </p>

        <button
          @click="router.push('/business/refunds')"
          class="brn-btn-primary inline-flex items-center justify-center gap-2 px-6 py-3 text-white rounded-xl font-medium transition-colors"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          {{ $t('businessRefundNew.toApplicationsList') }}
        </button>
      </div>
    </template>

  </DashboardLayout>
</template>

<style scoped>
.brn-back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  color: #64748b;
  margin-bottom: 16px;
  transition: color 0.15s;
}
.brn-back-btn:hover { color: #1e293b; }
.brn-page-title {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
}
@media (min-width: 1024px) {
  .brn-page-title { font-size: 34px; }
}
.brn-card {
  background: white;
  border-radius: 16px;
  padding: 20px 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  border: 1px solid #e2e8f0;
  margin-bottom: 24px;
}
@media (min-width: 1024px) {
  .brn-card { padding: 24px; }
}
.brn-card--no-pad {
  padding: 0;
}
.brn-step-title {
  font-size: 22px;
  color: #1e293b;
}
.brn-step-num {
  background-color: #10b981;
}
.brn-step-desc {
  font-size: 16px;
  color: #64748b;
}
.brn-warn-title {
  font-size: 18px;
}
.brn-warn-desc {
  font-size: 16px;
}
.brn-card-header {
  border-bottom: 1px solid #e2e8f0;
}
.brn-table {
  font-size: 16px;
}
.brn-thead-row {
  color: #64748b;
  background-color: #f8fafc;
}
.brn-tbody {
  color: #1e293b;
}
.brn-table-row {
  border-top: 1px solid #e2e8f0;
}
.brn-cell-sm {
  font-size: 14px;
}
.brn-cell-group {
  font-size: 14px;
  max-width: 200px;
}
.brn-cell-subgroup {
  font-size: 14px;
  max-width: 180px;
}
.brn-cell-md {
  font-size: 16px;
}
.brn-input-export {
  font-size: 16px;
}
.brn-input-export--normal {
  border-color: #e2e8f0;
}
.brn-input-export--normal:focus {
  border-color: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
}
.brn-cell-refund {
  font-size: 24px;
}
.brn-text-green {
  color: #10b981;
}
.brn-text-muted {
  color: #64748b;
}
.brn-text-dark {
  color: #1e293b;
}
.brn-tfoot-row {
  border-top: 2px solid #1e293b;
  background-color: #f8fafc;
}
.brn-tfoot-label {
  font-size: 18px;
  color: #1e293b;
}
.brn-tfoot-value {
  font-size: 22px;
  color: #10b981;
}
.brn-upload-label {
  border-color: #e2e8f0;
}
.brn-upload-label:hover {
  border-color: #10b981;
}
.brn-upload-text {
  color: #64748b;
  font-size: 16px;
}
.brn-icon-muted {
  color: #64748b;
}
.brn-icon-green {
  color: #10b981;
}
.brn-doc-item {
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
}
.brn-doc-name {
  font-size: 16px;
  color: #1e293b;
}
.brn-doc-remove {
  color: #64748b;
}
.brn-doc-remove:hover {
  color: #ef4444;
}
.brn-summary {
  background: linear-gradient(to right, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1));
  border: 1px solid rgba(16, 185, 129, 0.2);
}
.brn-summary-total {
  font-size: 34px;
  color: #10b981;
}
.brn-btn-secondary {
  border: 1px solid #e2e8f0;
  color: #64748b;
}
.brn-btn-secondary:hover {
  background-color: white;
}
.brn-btn-primary {
  background-color: #10b981;
}
.brn-btn-primary:hover {
  background-color: #059669;
}
.brn-success-value {
  font-size: 22px;
}
</style>
