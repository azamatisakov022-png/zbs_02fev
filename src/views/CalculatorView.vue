<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  productGroups,
  productSubgroups,
  isPackagingGroup,
  type ProductGroup,
  type ProductSubgroup,
} from '@/data/product-groups'
import { getNormativeForGroup, normativeTiers, getNormativeTier } from '@/data/recycling-norms'
import Select from '@/components/ui/general/Select.vue'
import DatePicker from '@/components/ui/general/DatePicker.vue'
import { toastStore } from '@/stores/toast'
import ProductGroupSelector from '@/components/ProductGroupSelector.vue'
import PenaltyCalculator from '@/components/penalty/PenaltyCalculator.vue'
import { calculatePenalty } from '@/utils/penalty'
import { downloadElementAsPdf } from '@/utils/pdfExport'
import { PAYMENT_ACCOUNTS } from '@/config/payment-accounts'

const { t } = useI18n()

interface CalcRow {
  id: number
  group: string
  subgroup: string
  subgroupData: ProductSubgroup | null
  volume: string
  recyclingStandard: number
  volumeToRecycle: number
  rate: number
  amount: number
}

const activeTab = ref<'calculator' | 'penalty'>('calculator')

const penaltyDebtAmount = ref('')
const penaltyDueDate = ref('')
const penaltyResult = ref<ReturnType<typeof calculatePenalty> | null>(null)

function calculatePenaltyForm() {
  const amount = parseFloat(penaltyDebtAmount.value)
  if (!amount || amount <= 0 || !penaltyDueDate.value) return
  const [y, m, d] = penaltyDueDate.value.split('-')
  const dueDate = new Date(+y, +m - 1, +d)
  penaltyResult.value = calculatePenalty(amount, dueDate)
}

function clearPenaltyForm() {
  penaltyDebtAmount.value = ''
  penaltyDueDate.value = ''
  penaltyResult.value = null
}

const isPenaltyFormValid = computed(() => {
  const amount = parseFloat(penaltyDebtAmount.value)
  return amount > 0 && !!penaltyDueDate.value
})

const showInlinePenalty = ref(false)
const inlinePenaltyDate = ref('')
const inlinePenaltyResult = computed(() => {
  if (!inlinePenaltyDate.value || totalAmount.value <= 0) return null
  const [y, m, d] = inlinePenaltyDate.value.split('-')
  const dueDate = new Date(+y, +m - 1, +d)
  const result = calculatePenalty(totalAmount.value, dueDate)
  return result.overdueDays > 0 ? result : null
})

let nextRowId = 1
const operationType = ref<'import' | 'production'>('import')
const year = ref(2026)

const yearOptions = [
  { value: 2025, label: '2025' },
  { value: 2026, label: '2026' },
  { value: 2027, label: '2027' },
  { value: 2028, label: '2028' },
  { value: 2029, label: '2029' },
  { value: 2030, label: '2030' },
]
const rows = ref<CalcRow[]>([createRow()])
const showResult = ref(false)
const resultRows = ref<CalcRow[]>([])
const totalAmount = ref(0)

function createRow(): CalcRow {
  return {
    id: nextRowId++,
    group: '',
    subgroup: '',
    subgroupData: null,
    volume: '',
    recyclingStandard: 0,
    volumeToRecycle: 0,
    rate: 0,
    amount: 0,
  }
}

function addRow() {
  if (rows.value.length >= 10) return
  rows.value.push(createRow())
}

function removeRow(id: number) {
  if (rows.value.length <= 1) return
  rows.value = rows.value.filter(r => r.id !== id)
}

function onGroupUpdate(row: CalcRow, value: string) {
  row.group = value
  row.subgroup = ''
  row.subgroupData = null
  recalcRow(row)
}

function onSubgroupUpdate(row: CalcRow, value: string) {
  row.subgroup = value
}

function onSubgroupSelected(row: CalcRow, data: ProductSubgroup | null) {
  row.subgroupData = data
  recalcRow(row)
}

function recalcRow(row: CalcRow) {
  const group = productGroups.find(g => g.value === row.group)
  if (!group) {
    row.recyclingStandard = 0
    row.volumeToRecycle = 0
    row.rate = 0
    row.amount = 0
    return
  }

  const normFraction = getNormativeForGroup(row.group, year.value)
  row.recyclingStandard = Math.round(normFraction * 100)

  let multiplier = 1
  if (row.subgroup && row.subgroupData) {
    multiplier = row.subgroupData.rateMultiplier
  }
  row.rate = Math.round(group.baseRate * multiplier)

  const vol = parseFloat(String(row.volume)) || 0
  row.volumeToRecycle = +(vol * row.recyclingStandard / 100).toFixed(4)
  row.amount = Math.round(row.volumeToRecycle * row.rate * 100) / 100
}

watch(rows, () => {
  rows.value.forEach(r => {
    if (r.group) recalcRow(r)
  })
}, { deep: true })

watch(year, () => {
  rows.value.forEach(r => {
    if (r.group) recalcRow(r)
  })
})

function getVolumeError(row: CalcRow): string {
  const val = String(row.volume).trim()
  if (!val) return ''
  const num = parseFloat(val)
  if (isNaN(num)) return t('calculatorPage.errorNumeric')
  if (num <= 0) return t('calculatorPage.errorPositive')
  if (num > 99999) return t('calculatorPage.errorMax')
  return ''
}

const isFormValid = computed(() => {
  return rows.value.some(r => {
    if (!r.group) return false
    const vol = parseFloat(String(r.volume))
    return !isNaN(vol) && vol > 0
  })
})

function calculate() {
  rows.value.forEach(r => recalcRow(r))
  resultRows.value = rows.value
    .filter(r => r.group && parseFloat(String(r.volume)) > 0)
    .map(r => ({ ...r }))
  totalAmount.value = resultRows.value.reduce((sum, r) => sum + r.amount, 0)
  showResult.value = true
  nextTick(() => {
    document.getElementById('calc-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

function clearForm() {
  rows.value = [createRow()]
  showResult.value = false
  resultRows.value = []
  totalAmount.value = 0
}

function newCalculation() {
  clearForm()
  nextTick(() => { window.scrollTo({ top: 0, behavior: 'smooth' }) })
}

function fmt(n: number): string {
  return n.toLocaleString()
}
function fmtDec(n: number): string {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function getGroupLabel(value: string): string {
  return productGroups.find(g => g.value === value)?.label || '—'
}

function getSubgroupLabel(row: CalcRow): string {
  if (!row.subgroupData) return '—'
  return row.subgroupData.label
}

const pdfLoading = ref(false)

async function downloadPdf() {
  const el = document.getElementById('calculation-result')
  if (!el) return

  pdfLoading.value = true
  try {
    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10)
    const filename = `Расчёт_УС_${dateStr}.pdf`
    await downloadElementAsPdf(el, filename)
  } catch {
    toastStore.show({ type: 'error', title: t('calculatorPage.pdfErrorTitle'), message: t('calculatorPage.pdfErrorMessage') })
  } finally {
    pdfLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#f8fafc]">
    <div class="container-main pt-8 lg:pt-10">
      <div class="text-white rounded-2xl py-10 lg:py-14 px-6 text-center" style="background: linear-gradient(135deg, #0d9488 0%, #10b981 100%)">
        <h1 class="text-3xl lg:text-4xl font-bold mb-3">{{ activeTab === 'calculator' ? $t('calculatorPage.title') : $t('penalty.penaltyTabTitle') }}</h1>
        <p class="text-white/80 text-base lg:text-lg max-w-2xl mx-auto">
          {{ activeTab === 'calculator' ? $t('calculatorPage.subtitle') : $t('penalty.penaltyTabSubtitle') }}
        </p>
      </div>
    </div>

    <div class="container-main mt-6">
      <div class="inline-flex bg-[#f1f5f9] rounded-xl p-1">
        <button
          @click="activeTab = 'calculator'"
          :class="['px-5 py-2.5 rounded-lg text-sm font-semibold transition-all',
            activeTab === 'calculator'
              ? 'bg-white text-[#1e293b] shadow-sm'
              : 'text-[#64748b] hover:text-[#1e293b]']"
        >{{ $t('calculatorPage.tabFeeCalculator') }}</button>
        <button
          @click="activeTab = 'penalty'"
          :class="['px-5 py-2.5 rounded-lg text-sm font-semibold transition-all',
            activeTab === 'penalty'
              ? 'bg-white text-[#1e293b] shadow-sm'
              : 'text-[#64748b] hover:text-[#1e293b]']"
        >{{ $t('calculatorPage.tabPenaltyCalculator') }}</button>
      </div>
    </div>

    <div class="container-main py-8 lg:py-10">

      <div v-if="activeTab === 'penalty'" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] p-6">
            <h2 class="text-lg font-bold text-[#1e293b] mb-5">{{ $t('penalty.title') }}</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label class="block text-sm font-medium text-[#1e293b] mb-2">{{ $t('penalty.debtAmount') }}</label>
                <div class="relative">
                  <input
                    type="number"
                    v-model="penaltyDebtAmount"
                    :placeholder="$t('penalty.enterAmount')"
                    step="0.01" min="0"
                    class="w-full px-4 py-2.5 border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/20 text-sm pr-16"
                  />
                  <span class="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#94a3b8]">{{ $t('penalty.som') }}</span>
                </div>
              </div>
              <div>
                <DatePicker
                  v-model="penaltyDueDate"
                  variant="form"
                  :label="$t('penalty.dueDate')"
                  min="2020-01-01"
                  :max="`${new Date().getFullYear() + 1}-12-31`"
                />
              </div>
            </div>
            <div class="flex flex-wrap gap-3 mt-5">
              <button @click="calculatePenaltyForm" :disabled="!isPenaltyFormValid"
                :class="['flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all shadow-sm',
                  isPenaltyFormValid
                    ? 'bg-[#10b981] text-white hover:bg-[#059669] hover:shadow-md'
                    : 'bg-[#e2e8f0] text-[#94a3b8] cursor-not-allowed']">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                {{ $t('penalty.calculate') }}
              </button>
              <button @click="clearPenaltyForm"
                class="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium border border-[#e2e8f0] text-[#64748b] hover:bg-white hover:border-[#94a3b8] transition-colors">
                {{ $t('calculatorPage.clear') }}
              </button>
            </div>
          </div>

          <Transition
            enter-active-class="transition-all duration-500 ease-out"
            enter-from-class="opacity-0 translate-y-4"
            enter-to-class="opacity-100 translate-y-0"
          >
            <div v-if="penaltyResult && penaltyResult.overdueDays > 0">
              <PenaltyCalculator
                :debtAmount="penaltyResult.debtAmount"
                :dueDate="penaltyResult.dueDate"
              />
            </div>
          </Transition>

          <div v-if="penaltyResult && penaltyResult.overdueDays === 0" class="bg-green-50 rounded-2xl border border-green-200 p-6 text-center">
            <svg class="w-12 h-12 text-green-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <p class="text-lg font-semibold text-green-800">{{ $t('penalty.notOverdue') }}</p>
          </div>
        </div>

        <div class="lg:col-span-1">
          <div class="sticky top-6 space-y-6">
            <div class="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] p-6">
              <div class="flex items-center gap-2 mb-4">
                <div class="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                  <svg class="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 class="font-bold text-[#1e293b]">{{ $t('penalty.article37Title') }}</h3>
              </div>
              <p class="text-sm text-[#64748b] leading-relaxed mb-4">
                {{ $t('penalty.article37Text') }}
              </p>
              <p class="text-xs text-[#94a3b8]">{{ $t('penalty.article37Source') }}</p>
            </div>

            <div class="bg-[#fefce8] rounded-2xl border border-[#fde68a] p-5">
              <div class="flex items-start gap-2">
                <svg class="w-5 h-5 text-[#d97706] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p class="text-xs text-[#92400e]" v-html="$t('calculatorPage.disclaimer')"></p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'calculator'" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 space-y-6">

          <div class="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] p-6">
            <h2 class="text-lg font-bold text-[#1e293b] mb-5">{{ $t('calculatorPage.params') }}</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label class="block text-sm font-medium text-[#1e293b] mb-2">{{ $t('calculatorPage.operationType') }}</label>
                <div class="flex gap-4">
                  <label class="flex items-center gap-2 cursor-pointer select-none">
                    <input type="radio" v-model="operationType" value="import"
                      class="w-4 h-4 text-[#10b981] focus:ring-[#10b981]/20 border-[#e2e8f0]" />
                    <span class="text-sm text-[#1e293b]">{{ $t('calculatorPage.import') }}</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer select-none">
                    <input type="radio" v-model="operationType" value="production"
                      class="w-4 h-4 text-[#10b981] focus:ring-[#10b981]/20 border-[#e2e8f0]" />
                    <span class="text-sm text-[#1e293b]">{{ $t('calculatorPage.production') }}</span>
                  </label>
                </div>
              </div>
              <div>
                <Select
                  v-model="year"
                  :options="yearOptions"
                  variant="form"
                  :label="$t('calculatorPage.yearCalc')"
                />
              </div>
            </div>
          </div>

          <div class="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] p-6">
            <div class="flex items-center justify-between mb-5">
              <h2 class="text-lg font-bold text-[#1e293b]">{{ $t('calculatorPage.goodsAndPackaging') }}</h2>
              <span class="text-xs text-[#94a3b8]">{{ rows.length }} / 10</span>
            </div>

            <div class="space-y-5">
              <div v-for="(row, idx) in rows" :key="row.id"
                class="relative bg-[#f8fafc] rounded-xl p-5 border border-[#e2e8f0]">

                <div class="flex items-center justify-between mb-4">
                  <span class="text-xs font-semibold text-[#94a3b8] uppercase tracking-wide">{{ $t('calculatorPage.position') }} {{ idx + 1 }}</span>
                  <button v-if="rows.length > 1" @click="removeRow(row.id)"
                    class="w-7 h-7 rounded-lg flex items-center justify-center text-[#94a3b8] hover:text-red-500 hover:bg-red-50 transition-colors"
                    :title="$t('calculatorPage.removePosition')">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <ProductGroupSelector
                  :group="row.group"
                  :subgroup="row.subgroup"
                  :accentColor="'#10b981'"
                  @update:group="onGroupUpdate(row, $event)"
                  @update:subgroup="onSubgroupUpdate(row, $event)"
                  @subgroupSelected="onSubgroupSelected(row, $event)"
                />

                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                  <div>
                    <label class="block text-xs text-[#64748b] mb-1">
                      {{ $t('calculatorPage.massTons') }}
                      <span class="relative group inline-block ml-1 cursor-help">
                        <svg class="w-3.5 h-3.5 inline text-[#94a3b8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[#1e293b] text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                          {{ $t('calculatorPage.tonHint') }}
                        </span>
                      </span>
                    </label>
                    <div class="relative">
                      <input
                        type="number"
                        v-model="row.volume"
                        placeholder="0.00"
                        step="0.001" min="0" max="99999"
                        class="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/20 text-sm pr-12"
                      />
                      <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#94a3b8]">{{ $t('calculatorPage.tons') }}</span>
                    </div>
                    <p v-if="getVolumeError(row)" class="text-xs text-red-500 mt-1">{{ getVolumeError(row) }}</p>
                  </div>

                  <div>
                    <label class="block text-xs text-[#64748b] mb-1">{{ $t('calculatorPage.recyclingStandard') }}</label>
                    <div class="w-full px-3 py-2 bg-gray-50 border border-[#e2e8f0] rounded-lg text-sm text-[#1e293b] font-medium">
                      {{ row.group ? row.recyclingStandard + '%' : '—' }}
                    </div>
                  </div>

                  <div>
                    <label class="block text-xs text-[#64748b] mb-1">{{ $t('calculatorPage.toRecycleT') }}</label>
                    <div class="w-full px-3 py-2 bg-gray-50 border border-[#e2e8f0] rounded-lg text-sm text-[#1e293b] font-medium">
                      {{ row.group ? fmtDec(row.volumeToRecycle) : '—' }}
                    </div>
                  </div>

                  <div>
                    <label class="block text-xs text-[#64748b] mb-1">{{ $t('calculatorPage.rateSomT') }}</label>
                    <div class="w-full px-3 py-2 bg-gray-50 border border-[#e2e8f0] rounded-lg text-sm text-[#1e293b] font-medium">
                      {{ row.group ? fmt(row.rate) : '—' }}
                    </div>
                  </div>
                </div>

                <div v-if="row.group && parseFloat(String(row.volume)) > 0" class="mt-3 pt-3 border-t border-[#e2e8f0] flex items-center justify-between">
                  <span class="text-xs text-[#64748b]">
                    Расчёт: {{ fmtDec(row.volumeToRecycle) }} т &times; {{ fmt(row.rate) }} сом/т
                  </span>
                  <span class="text-sm font-bold text-[#1e293b]">{{ fmtDec(row.amount) }} {{ $t('calculatorPage.som') }}</span>
                </div>
              </div>
            </div>

            <button v-if="rows.length < 10" @click="addRow"
              class="mt-4 w-full py-3 border-2 border-dashed border-[#d1d5db] rounded-xl text-sm font-medium text-[#64748b] hover:border-[#10b981] hover:text-[#10b981] hover:bg-[#f0fdf4] transition-colors">
              <svg class="w-4 h-4 inline mr-1 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              {{ $t('calculatorPage.addPosition') }}
            </button>
          </div>

          <div class="bg-[#f8fafc] rounded-2xl border border-[#e2e8f0] p-5">
            <div class="flex items-start gap-3 mb-4">
              <svg class="w-5 h-5 text-[#64748b] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div class="text-xs text-[#64748b] space-y-1">
                <p><strong>{{ $t('calculatorPage.formulaLabel') }}</strong> {{ $t('calculatorPage.formulaText') }}</p>
                <p>{{ $t('calculatorPage.formulaNote') }}</p>
                <p>{{ $t('calculatorPage.ratesNote') }}</p>
              </div>
            </div>

            <div class="flex flex-wrap gap-3">
              <button @click="calculate" :disabled="!isFormValid"
                :class="['flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all shadow-sm',
                  isFormValid
                    ? 'bg-[#10b981] text-white hover:bg-[#059669] hover:shadow-md'
                    : 'bg-[#e2e8f0] text-[#94a3b8] cursor-not-allowed']">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                {{ $t('calculatorPage.calculate') }}
              </button>
              <button @click="clearForm"
                class="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium border border-[#e2e8f0] text-[#64748b] hover:bg-white hover:border-[#94a3b8] transition-colors">
                {{ $t('calculatorPage.clear') }}
              </button>
            </div>
          </div>

          <Transition
            enter-active-class="transition-all duration-500 ease-out"
            enter-from-class="opacity-0 translate-y-4"
            enter-to-class="opacity-100 translate-y-0"
          >
            <div v-if="showResult" id="calc-result" class="space-y-6">
              <div id="calculation-result" class="bg-[#f0fdf4] rounded-2xl border-2 border-[#86efac] p-6">
                <h3 class="text-lg font-bold text-[#065f46] mb-4">{{ $t('calculatorPage.result') }}</h3>

                <div class="overflow-x-auto mb-4">
                  <table class="w-full text-sm border-collapse">
                    <thead>
                      <tr class="text-left text-[#047857]">
                        <th class="px-3 py-2 bg-[#dcfce7] rounded-tl-lg font-semibold">{{ $t('calculatorPage.group') }}</th>
                        <th class="px-3 py-2 bg-[#dcfce7] font-semibold">{{ $t('calculatorPage.subgroup') }}</th>
                        <th class="px-3 py-2 bg-[#dcfce7] text-right font-semibold">{{ $t('calculatorPage.massT') }}</th>
                        <th class="px-3 py-2 bg-[#dcfce7] text-center font-semibold">{{ $t('calculatorPage.normPercent') }}</th>
                        <th class="px-3 py-2 bg-[#dcfce7] text-right font-semibold">{{ $t('calculatorPage.toRecycleShort') }}</th>
                        <th class="px-3 py-2 bg-[#dcfce7] text-right font-semibold">{{ $t('calculatorPage.rate') }}</th>
                        <th class="px-3 py-2 bg-[#dcfce7] rounded-tr-lg text-right font-semibold">{{ $t('calculatorPage.amountSom') }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="r in resultRows" :key="r.id" class="border-b border-[#bbf7d0]">
                        <td class="px-3 py-2.5 text-[#1e293b] text-xs">{{ getGroupLabel(r.group) }}</td>
                        <td class="px-3 py-2.5 text-[#64748b] text-xs max-w-[200px] truncate" :title="getSubgroupLabel(r)">{{ getSubgroupLabel(r) }}</td>
                        <td class="px-3 py-2.5 text-right font-medium text-[#1e293b]">{{ fmtDec(parseFloat(String(r.volume)) || 0) }}</td>
                        <td class="px-3 py-2.5 text-center text-[#1e293b]">{{ r.recyclingStandard }}%</td>
                        <td class="px-3 py-2.5 text-right text-[#1e293b]">{{ fmtDec(r.volumeToRecycle) }}</td>
                        <td class="px-3 py-2.5 text-right text-[#1e293b]">{{ fmt(r.rate) }}</td>
                        <td class="px-3 py-2.5 text-right font-bold text-[#065f46]">{{ fmtDec(r.amount) }}</td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr class="bg-[#dcfce7]">
                        <td class="px-3 py-3 font-bold text-[#065f46] rounded-bl-lg" colspan="6">{{ $t('calculatorPage.total') }}</td>
                        <td class="px-3 py-3 text-right font-bold text-[#065f46] rounded-br-lg text-lg">{{ fmtDec(totalAmount) }}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div class="bg-white rounded-xl p-5 text-center border border-[#bbf7d0]">
                  <p class="text-sm text-[#64748b] mb-1">{{ $t('calculatorPage.totalFee') }}</p>
                  <p class="text-3xl lg:text-4xl font-bold text-[#15803d]">{{ fmtDec(totalAmount) }} {{ $t('calculatorPage.som') }}</p>
                  <p class="text-xs text-[#94a3b8] mt-2">{{ $t('calculatorPage.year') }}: {{ year }} &middot; {{ operationType === 'import' ? $t('calculatorPage.import') : $t('calculatorPage.production') }}</p>
                </div>
              </div>

              <div class="flex flex-wrap gap-3">
                <button @click="downloadPdf" :disabled="pdfLoading"
                  :class="['flex items-center gap-2 px-5 py-2.5 bg-white rounded-xl text-sm font-medium border border-[#e2e8f0] transition-colors shadow-sm',
                    pdfLoading ? 'text-[#94a3b8] cursor-wait' : 'text-[#1e293b] hover:border-[#10b981] hover:text-[#10b981]']">
                  <svg v-if="pdfLoading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  {{ $t('calculatorPage.downloadPdf') }}
                </button>
                <button @click="newCalculation"
                  class="flex items-center gap-2 px-5 py-2.5 bg-[#10b981] rounded-xl text-sm font-semibold text-white hover:bg-[#059669] transition-colors shadow-sm">
                  {{ $t('calculatorPage.newCalc') }}
                </button>
              </div>

              <div class="border border-[#e2e8f0] rounded-xl overflow-hidden">
                <button @click="showInlinePenalty = !showInlinePenalty" class="w-full flex items-center justify-between px-5 py-3 bg-[#f8fafc] hover:bg-[#f1f5f9] transition-colors text-left">
                  <span class="text-sm font-medium text-[#1e293b]">{{ $t('payment.inlinePenaltyTitle') }}</span>
                  <svg :class="['w-4 h-4 text-[#94a3b8] transition-transform', showInlinePenalty ? 'rotate-180' : '']" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                </button>
                <div v-if="showInlinePenalty" class="p-5 border-t border-[#e2e8f0] bg-white">
                  <div class="flex flex-col sm:flex-row gap-3 mb-4">
                    <div class="flex-1">
                      <DatePicker
                        v-model="inlinePenaltyDate"
                        variant="form"
                        size="sm"
                        :label="$t('penalty.dueDate')"
                        min="2020-01-01"
                        :max="`${new Date().getFullYear() + 1}-12-31`"
                      />
                    </div>
                    <div class="flex-1">
                      <label class="block text-xs text-[#64748b] mb-1">{{ $t('penalty.debtAmount') }}</label>
                      <p class="px-3 py-2 text-sm font-semibold text-[#1e293b]">{{ fmtDec(totalAmount) }} {{ $t('calculatorPage.som') }}</p>
                    </div>
                  </div>
                  <div v-if="inlinePenaltyResult" class="space-y-3">
                    <div class="bg-[#fef2f2] border border-[#fecaca] rounded-lg p-4 text-sm">
                      <div class="flex justify-between py-1"><span class="text-[#64748b]">{{ $t('penalty.overdueDays') }}</span><span class="font-semibold text-[#DC2626]">{{ inlinePenaltyResult.overdueDays }} {{ $t('payment.calDays') }}</span></div>
                      <div class="flex justify-between py-1"><span class="text-[#64748b]">{{ $t('penalty.dailyPenalty') }}</span><span class="font-semibold">{{ inlinePenaltyResult.dailyPenalty.toLocaleString('ru-RU', { minimumFractionDigits: 2 }) }} {{ $t('penalty.som') }}</span></div>
                      <div class="border-t border-[#fecaca] mt-1 pt-1 flex justify-between"><span class="font-semibold">{{ $t('penalty.totalPenalty') }}</span><span class="font-bold text-[#DC2626] text-lg">{{ inlinePenaltyResult.totalPenalty.toLocaleString('ru-RU', { minimumFractionDigits: 2 }) }} {{ $t('penalty.som') }}</span></div>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div class="bg-[#ecfdf5] border border-[#a7f3d0] rounded-lg p-3">
                        <p class="font-semibold text-[#065f46] mb-1">{{ $t('payment.payment1Title') }}</p>
                        <p>{{ PAYMENT_ACCOUNTS.utilization_fee.recipient }}</p>
                        <p class="font-mono">{{ $t('payment.accountNumber') }}: {{ PAYMENT_ACCOUNTS.utilization_fee.account }}</p>
                      </div>
                      <div class="bg-[#fef2f2] border border-[#fecaca] rounded-lg p-3">
                        <p class="font-semibold text-[#991b1b] mb-1">{{ $t('payment.payment2Title') }}</p>
                        <p>{{ PAYMENT_ACCOUNTS.penalty.recipient }}</p>
                        <p class="font-mono">{{ $t('payment.accountNumber') }}: {{ PAYMENT_ACCOUNTS.penalty.account }}</p>
                      </div>
                    </div>
                  </div>
                  <p v-else-if="inlinePenaltyDate" class="text-sm text-[#10b981]">{{ $t('penalty.notOverdue') }}</p>
                </div>
              </div>
            </div>
          </Transition>
        </div>

        <div class="lg:col-span-1">
          <div class="sticky top-6 space-y-6">

            <div class="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] p-6">
              <div class="flex items-center gap-2 mb-4">
                <div class="w-8 h-8 rounded-lg bg-[#ecfdf5] flex items-center justify-center">
                  <svg class="w-5 h-5 text-[#10b981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 class="font-bold text-[#1e293b]">{{ $t('calculatorPage.about') }}</h3>
              </div>
              <ul class="space-y-3 text-sm text-[#64748b]">
                <li class="flex items-start gap-2">
                  <svg class="w-4 h-4 text-[#10b981] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                  <span v-html="$t('calculatorPage.aboutItem1')"></span>
                </li>
                <li class="flex items-start gap-2">
                  <svg class="w-4 h-4 text-[#10b981] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                  <span v-html="$t('calculatorPage.aboutItem2')"></span>
                </li>
                <li class="flex items-start gap-2">
                  <svg class="w-4 h-4 text-[#10b981] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                  <span v-html="$t('calculatorPage.aboutItem3')"></span>
                </li>
                <li class="flex items-start gap-2">
                  <svg class="w-4 h-4 text-[#10b981] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                  <span v-html="$t('calculatorPage.aboutItem4')"></span>
                </li>
              </ul>

              <div class="mt-5 pt-4 border-t border-[#e2e8f0]">
                <p class="text-xs text-[#94a3b8] mb-1">{{ $t('calculatorPage.questions') }}</p>
                <p class="text-sm text-[#1e293b]">eco-operator@gov.kg</p>
                <p class="text-sm text-[#1e293b]">+996 312 XXX XXX</p>
              </div>

              <router-link to="/login"
                class="mt-5 flex items-center justify-center gap-2 w-full py-3 bg-[#10b981] text-white rounded-xl text-sm font-semibold hover:bg-[#059669] transition-colors">
                {{ $t('calculatorPage.loginLink') }}
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </router-link>
            </div>

            <div class="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] p-6">
              <h3 class="font-bold text-[#1e293b] mb-3">{{ $t('calculatorPage.normsByYears') }}</h3>
              <div class="overflow-x-auto">
                <table class="w-full text-xs">
                  <thead>
                    <tr class="text-[#64748b]">
                      <th class="pb-2 text-left font-medium">{{ $t('calculatorPage.year') }}</th>
                      <th class="pb-2 text-center font-medium">{{ $t('calculatorPage.groups14') }}</th>
                      <th class="pb-2 text-center font-medium">{{ $t('calculatorPage.groups524') }}</th>
                    </tr>
                  </thead>
                  <tbody class="text-[#1e293b]">
                    <tr v-for="y in [2025, 2026, 2027, 2028, 2029, 2030]" :key="y"
                      :class="['border-t border-[#f1f5f9]', y === year ? 'bg-[#ecfdf5] font-semibold' : '']">
                      <td class="py-1.5">{{ y }}</td>
                      <td class="py-1.5 text-center">{{ Math.round(normativeTiers.high[y] * 100) }}%</td>
                      <td class="py-1.5 text-center">{{ Math.round(normativeTiers.standard[y] * 100) }}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p class="text-xs text-[#94a3b8] mt-3">
                {{ $t('calculatorPage.groups14desc') }}<br>
                {{ $t('calculatorPage.groups524desc') }}
              </p>
            </div>

            <div class="bg-[#fefce8] rounded-2xl border border-[#fde68a] p-5">
              <div class="flex items-start gap-2">
                <svg class="w-5 h-5 text-[#d97706] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p class="text-xs text-[#92400e]" v-html="$t('calculatorPage.disclaimer')"></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type="number"] {
  -moz-appearance: textfield;
}
</style>
