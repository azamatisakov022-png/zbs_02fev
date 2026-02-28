<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import { calculationStore } from '../../stores/calculations'
import { refundStore } from '../../stores/refunds'
import { productGroups, productSubgroups } from '../../data/product-groups'
import { useBusinessMenu } from '../../composables/useRoleMenu'
import { toastStore } from '../../stores/toast'
import { CalcStatus } from '../../constants/statuses'

const router = useRouter()
const { roleTitle, menuItems } = useBusinessMenu()
const { t } = useI18n()

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
  calculationStore.state.calculations.filter(c => c.status === CalcStatus.PAID)
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
  <DashboardLayout role="business" :roleTitle="roleTitle" userName="ОсОО «ТехПром»" :menuItems="menuItems">

    <!-- FORM VIEW -->
    <template v-if="viewMode === 'form'">
      <div class="max-w-6xl mx-auto">
        <!-- Back button -->
        <div class="mb-6">
          <button @click="router.push('/business/refunds')" class="flex items-center gap-2 text-[#64748b] hover:text-[#1e293b] mb-4">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {{ $t('businessRefundNew.backToApplications') }}
          </button>
          <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b]">{{ $t('businessRefundNew.title') }}</h1>
        </div>

        <!-- Step 1: Select paid calculation -->
        <div class="bg-white rounded-2xl p-5 lg:p-6 shadow-sm border border-[#e2e8f0] mb-6">
          <h2 class="text-lg font-semibold text-[#1e293b] mb-1 flex items-center gap-2">
            <div class="w-7 h-7 rounded-full bg-[#10b981] text-white flex items-center justify-center text-sm font-bold">1</div>
            {{ $t('businessRefundNew.selectPaidCalc') }}
          </h2>
          <p class="text-sm text-[#64748b] mb-4 ml-9">{{ $t('businessRefundNew.refundOnlyPaid') }}</p>

          <div class="ml-9">
            <select
              v-model="selectedCalcId"
              @change="onSelectCalculation"
              class="w-full px-4 py-3 border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/20 bg-white"
            >
              <option :value="null" disabled>— {{ $t('businessRefundNew.selectCalcOption') }} —</option>
              <option v-for="calc in paidCalculations" :key="calc.id" :value="calc.id">
                {{ calc.number }} | {{ calc.period }} | {{ formatAmount(calc.totalAmount) }}
              </option>
            </select>

            <div v-if="paidCalculations.length === 0" class="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <div class="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p class="font-medium text-amber-800">{{ $t('businessRefundNew.noPaidCalcs') }}</p>
                <p class="text-sm text-amber-700">{{ $t('businessRefundNew.noPaidCalcsDesc') }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 2: Refund items table -->
        <div v-if="selectedCalculation && refundItems.length > 0" class="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] mb-6">
          <div class="p-5 lg:p-6 border-b border-[#e2e8f0]">
            <h2 class="text-lg font-semibold text-[#1e293b] mb-1 flex items-center gap-2">
              <div class="w-7 h-7 rounded-full bg-[#10b981] text-white flex items-center justify-center text-sm font-bold">2</div>
              {{ $t('businessRefundNew.refundItems') }}
            </h2>
            <p class="text-sm text-[#64748b] ml-9">{{ $t('businessRefundNew.specifyExportedMass') }}</p>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="text-left text-[#64748b] bg-[#f8fafc]">
                  <th class="px-4 py-3 font-medium">{{ $t('businessRefundNew.group') }}</th>
                  <th class="px-4 py-3 font-medium">{{ $t('businessRefundNew.subgroup') }}</th>
                  <th class="px-4 py-3 font-medium text-right">{{ $t('businessRefundNew.importMass') }}</th>
                  <th class="px-4 py-3 font-medium text-right">{{ $t('businessRefundNew.previouslyPaid') }}</th>
                  <th class="px-4 py-3 font-medium text-center">{{ $t('businessRefundNew.exportedFromKR') }}</th>
                  <th class="px-4 py-3 font-medium text-right">{{ $t('businessRefundNew.refundAmount') }}</th>
                </tr>
              </thead>
              <tbody class="text-[#1e293b]">
                <tr
                  v-for="(item, index) in refundItems"
                  :key="index"
                  class="border-t border-[#e2e8f0]"
                  :class="{ 'bg-red-50': hasExportExceedsVolume(item) }"
                >
                  <td class="px-4 py-3 text-xs max-w-[200px]">
                    <span class="block truncate" :title="getGroupLabel(item.group)">{{ getGroupLabel(item.group) }}</span>
                  </td>
                  <td class="px-4 py-3 text-xs max-w-[180px]">
                    <span class="block truncate" :title="getSubgroupLabel(item.group, item.subgroup)">{{ getSubgroupLabel(item.group, item.subgroup) }}</span>
                  </td>
                  <td class="px-4 py-3 text-right font-medium">{{ item.volume }}</td>
                  <td class="px-4 py-3 text-right font-medium text-green-600">{{ item.paidAmount.toLocaleString() }}</td>
                  <td class="px-4 py-3">
                    <div class="flex flex-col items-center">
                      <input
                        v-model="item.exportedFromKR"
                        type="text"
                        inputmode="decimal"
                        placeholder="0.0"
                        :class="[
                          'w-28 px-3 py-2 border rounded-lg text-center text-sm focus:outline-none transition-colors',
                          hasExportExceedsVolume(item)
                            ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                            : 'border-[#e2e8f0] focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/20'
                        ]"
                      />
                      <span v-if="hasExportExceedsVolume(item)" class="text-xs text-red-500 mt-1">
                        {{ $t('businessRefundNew.noMoreThan', { volume: item.volume }) }}
                      </span>
                    </div>
                  </td>
                  <td class="px-4 py-3 text-right font-semibold" :class="getRefundAmount(item) > 0 ? 'text-[#10b981]' : 'text-[#64748b]'">
                    {{ getRefundAmount(item) > 0 ? getRefundAmount(item).toLocaleString() : '—' }}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="border-t-2 border-[#1e293b] bg-[#f8fafc]">
                  <td colspan="5" class="px-4 py-3 font-semibold text-[#1e293b]">{{ $t('businessRefundNew.totalRefund') }}</td>
                  <td class="px-4 py-3 text-right font-bold text-lg text-[#10b981]">
                    {{ totalRefundAmount > 0 ? formatAmount(totalRefundAmount) : '—' }}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <!-- Step 3: Document upload -->
        <div v-if="selectedCalculation" class="bg-white rounded-2xl p-5 lg:p-6 shadow-sm border border-[#e2e8f0] mb-6">
          <h2 class="text-lg font-semibold text-[#1e293b] mb-1 flex items-center gap-2">
            <div class="w-7 h-7 rounded-full bg-[#10b981] text-white flex items-center justify-center text-sm font-bold">3</div>
            {{ $t('businessRefundNew.supportingDocuments') }} <span class="text-red-500">*</span>
          </h2>
          <p class="text-sm text-[#64748b] mb-4 ml-9">{{ $t('businessRefundNew.supportingDocsDesc') }}</p>

          <div class="ml-9">
            <label class="flex items-center justify-center gap-2 w-full px-4 py-4 border-2 border-dashed border-[#e2e8f0] rounded-xl hover:border-[#10b981] hover:bg-green-50 transition-colors cursor-pointer">
              <svg class="w-6 h-6 text-[#64748b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span class="text-[#64748b] font-medium">{{ $t('businessRefundNew.selectFiles') }}</span>
              <input type="file" multiple class="hidden" @change="onFileSelect" />
            </label>

            <div v-if="documents.length > 0" class="mt-4 space-y-2">
              <div
                v-for="(doc, idx) in documents"
                :key="idx"
                class="flex items-center justify-between px-4 py-2.5 bg-[#f8fafc] rounded-lg border border-[#e2e8f0]"
              >
                <div class="flex items-center gap-2">
                  <svg class="w-5 h-5 text-[#10b981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span class="text-sm text-[#1e293b]">{{ doc }}</span>
                </div>
                <button @click="removeDocument(idx)" class="text-[#64748b] hover:text-red-500 transition-colors p-1">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div v-if="documents.length === 0" class="mt-3 text-xs text-amber-600">
              {{ $t('businessRefundNew.attachAtLeastOne') }}
            </div>
          </div>
        </div>

        <!-- Total summary -->
        <div v-if="selectedCalculation && totalRefundAmount > 0" class="bg-gradient-to-r from-[#10b981]/10 to-[#059669]/10 rounded-2xl p-5 lg:p-6 border border-[#10b981]/20 mb-6">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p class="text-sm text-[#64748b] mb-1">{{ $t('businessRefundNew.calculation') }}: <span class="font-mono font-medium text-[#1e293b]">{{ selectedCalculation.number }}</span></p>
              <p class="text-sm text-[#64748b]">{{ $t('common.period') }}: {{ selectedCalculation.period }}</p>
            </div>
            <div class="text-right">
              <p class="text-sm text-[#64748b] mb-1">{{ $t('businessRefundNew.totalRefundAmount') }}</p>
              <p class="text-3xl font-bold text-[#10b981]">{{ formatAmount(totalRefundAmount) }}</p>
            </div>
          </div>
        </div>

        <!-- Action buttons -->
        <div class="flex flex-col sm:flex-row justify-end gap-3 mb-8">
          <button
            @click="router.push('/business/refunds')"
            class="flex items-center justify-center gap-2 px-5 py-2.5 border border-[#e2e8f0] rounded-lg text-[#64748b] hover:bg-white transition-colors"
          >
            {{ $t('common.cancel') }}
          </button>
          <button
            @click="saveDraft"
            class="flex items-center justify-center gap-2 px-5 py-2.5 border border-[#e2e8f0] rounded-lg text-[#64748b] hover:bg-white transition-colors"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            {{ $t('businessRefundNew.saveDraft') }}
          </button>
          <button
            @click="createRefund"
            :disabled="!canSubmit"
            class="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#10b981] text-white rounded-lg font-medium hover:bg-[#059669] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

        <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b] mb-4">
          {{ $t('businessRefundNew.successTitle', { number: createdRefund?.number }) }}
        </h1>

        <div class="bg-white rounded-2xl p-6 shadow-sm border border-[#e2e8f0] mb-8">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <p class="text-sm text-[#64748b] mb-1">{{ $t('businessRefundNew.applicationNumber') }}</p>
              <p class="text-lg font-bold text-[#10b981] font-mono">{{ createdRefund?.number }}</p>
            </div>
            <div>
              <p class="text-sm text-[#64748b] mb-1">{{ $t('businessRefundNew.refundAmountLabel') }}</p>
              <p class="text-lg font-bold text-[#1e293b]">{{ createdRefund ? formatAmount(createdRefund.amount) : '' }}</p>
            </div>
            <div>
              <p class="text-sm text-[#64748b] mb-1">{{ $t('businessRefundNew.submissionDate') }}</p>
              <p class="text-lg font-bold text-[#1e293b]">{{ createdRefund?.date }}</p>
            </div>
          </div>
        </div>

        <p class="text-[#64748b] mb-8">
          {{ $t('businessRefundNew.successLine1') }}<br />
          {{ $t('businessRefundNew.successLine2') }}
        </p>

        <button
          @click="router.push('/business/refunds')"
          class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#10b981] text-white rounded-xl font-medium hover:bg-[#059669] transition-colors"
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
