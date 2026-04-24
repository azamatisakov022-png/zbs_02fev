<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  productGroups,
  productSubgroups,
  isPackagingGroup,
  getTranslatedSubgroupLabel,
  type ProductGroup,
  type ProductSubgroup,
} from '../data/product-groups'
import { getNormativeForGroup, normativeTiers, getNormativeTier } from '../data/recycling-norms'
import { toastStore } from '../stores/toast'
import ProductGroupSelector from '../components/ProductGroupSelector.vue'
import PenaltyCalculator from '../components/penalty/PenaltyCalculator.vue'
import { calculatePenalty } from '../utils/penalty'
import { downloadElementAsPdf } from '../utils/pdfExport'
import { PAYMENT_ACCOUNTS } from '../config/payment-accounts'
// Новые компоненты редизайна (2026-04-24): анимированные числа, donut-разбивка,
// таблица нормативов, SVG-график накопления пени.
import CountUp from '../components/calculator/CountUp.vue'
import DonutBreakdown from '../components/calculator/DonutBreakdown.vue'
import NormsTable from '../components/calculator/NormsTable.vue'
import AccrualCurve from '../components/calculator/AccrualCurve.vue'

const { t, locale: i18nLocale } = useI18n()

const dateLang = computed(() => {
  const map: Record<string, string> = { ru: 'ru-RU', ky: 'ky-KG', en: 'en-GB' }
  return map[(i18nLocale as any).value || 'ru'] || 'ru-RU'
})

// ─── Types ───
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

// ─── Tab state ───
const activeTab = ref<'calculator' | 'penalty'>('calculator')

// ─── Penalty calculator state ───
// Старое состояние (дата-based) — оставлено для обратной совместимости
// с PenaltyCalculator и PDF-экспортом.
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

// Новое состояние редизайна (days-based slider + kickers) —
// проще и нагляднее чем выбор даты.
const penaltyDebt = ref<number>(1_000_000)
const penaltyDays = ref<number>(30)
const PENALTY_RATE = 0.0009 // 0,09% в день, ст. 37 КР

const penaltyAmount = computed(() => {
  const d = Number.isFinite(penaltyDebt.value) ? penaltyDebt.value : 0
  const days = Number.isFinite(penaltyDays.value) ? penaltyDays.value : 0
  return Math.round(d * PENALTY_RATE * days)
})

const penaltyTotalToPay = computed(() => (penaltyDebt.value || 0) + penaltyAmount.value)

// ─── Inline penalty in result ───
const showInlinePenalty = ref(false)
const inlinePenaltyDate = ref('')
const inlinePenaltyResult = computed(() => {
  if (!inlinePenaltyDate.value || totalAmount.value <= 0) return null
  const [y, m, d] = inlinePenaltyDate.value.split('-')
  const dueDate = new Date(+y, +m - 1, +d)
  const result = calculatePenalty(totalAmount.value, dueDate)
  return result.overdueDays > 0 ? result : null
})

// ─── State ───
let nextRowId = 1
const operationType = ref<'import' | 'production'>('import')
const year = ref(2026)
const rows = ref<CalcRow[]>([createRow()])
const showResult = ref(false)
const resultRows = ref<CalcRow[]>([])
const totalAmount = ref(0)

// ─── Row management ───
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

// ─── Group / Subgroup handlers ───
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

// ─── Calculation ───
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

// ─── Validation ───
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

// ─── Calculate ───
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

// ─── Live-итоги для sticky-панели (новый дизайн) ───
// В отличие от старой кнопки «Рассчитать», в новом дизайне сумма обновляется
// сразу при изменении полей — как в Apple Card / Revolut калькуляторах.

// Строки готовые к показу в таблице результатов (для PDF-экспорта).
// Вычисляются на лету — не нужен флаг showResult и кнопка «Рассчитать».
const displayResultRows = computed<CalcRow[]>(() =>
  rows.value.filter(r => r.group && parseFloat(String(r.volume)) > 0),
)
const displayTotalAmount = computed(() =>
  displayResultRows.value.reduce((s, r) => s + r.amount, 0),
)

const liveTotal = computed(() =>
  rows.value.reduce((sum, r) => sum + (Number.isFinite(r.amount) ? r.amount : 0), 0),
)
const liveTotalMass = computed(() =>
  rows.value.reduce((sum, r) => {
    const v = parseFloat(String(r.volume))
    return sum + (Number.isFinite(v) ? v : 0)
  }, 0),
)
const liveTotalRecycle = computed(() =>
  rows.value.reduce((sum, r) => sum + (Number.isFinite(r.volumeToRecycle) ? r.volumeToRecycle : 0), 0),
)
function rowShare(r: CalcRow): number {
  const t = liveTotal.value
  if (!t || t <= 0) return 0
  return (r.amount / t) * 100
}
// Для donut — маппим rows в формат {id, amount, label}
const donutItems = computed(() =>
  rows.value
    .filter(r => r.group && r.amount > 0)
    .map(r => ({
      id: r.id,
      amount: r.amount,
      label: productGroups.find(g => g.value === r.group)?.label || `№ ${r.id}`,
    })),
)

// ─── Format helpers ───
function fmt(n: number): string {
  return n.toLocaleString()
}
function fmtDec(n: number): string {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
function fmtT(n: number): string {
  if (!Number.isFinite(n)) return '—'
  return n.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}
function fmtSom(n: number): string {
  return Number.isFinite(n) ? n.toLocaleString('ru-RU') : '—'
}

function getGroupLabel(value: string): string {
  return productGroups.find(g => g.value === value)?.label || '—'
}

function getSubgroupLabel(row: CalcRow): string {
  if (!row.subgroupData) return '—'
  return getTranslatedSubgroupLabel(row.subgroupData.value, row.subgroupData.label)
}

// ─── PDF Export ───
const pdfLoading = ref(false)

async function downloadPdf() {
  // Блок #calculation-result всегда в DOM (спрятан off-screen),
  // computed displayResultRows держит его актуальным. Просто делаем снимок.
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
  <div class="min-h-screen" style="background:#f8fafc">
    <!-- ═══════════════════════════════════════════════════════ -->
    <!-- HERO + TABS                                              -->
    <!-- ═══════════════════════════════════════════════════════ -->
    <section class="max-w-[1360px] mx-auto px-6 lg:px-8 pt-10">
      <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">
        <div class="max-w-2xl">
          <div class="text-[11px] uppercase tracking-[0.22em] text-brand-600 font-semibold mb-3 font-mono">
            {{ activeTab === 'calculator' ? $t('calculatorPage.heroKicker') : $t('calculatorPage.penaltyKicker') }}
          </div>
          <h1
            class="text-[38px] lg:text-[46px] leading-[1.08] font-semibold tracking-tight"
            style="color:#0f172a"
          >
            <template v-if="activeTab === 'calculator'">
              {{ $t('calculatorPage.heroTitleA') }}
              <br/>
              <span style="color:#0c6267">{{ $t('calculatorPage.heroTitleB') }}</span>.
            </template>
            <template v-else>
              {{ $t('calculatorPage.penaltyHeroA') }}
              <br/>
              <span style="color:#b91c1c">{{ $t('calculatorPage.penaltyHeroB') }}</span>.
            </template>
          </h1>
          <p v-if="activeTab === 'calculator'" class="text-[15px] text-ink-500 mt-4 max-w-[540px]">
            {{ $t('calculatorPage.heroSub') }}
          </p>
        </div>
        <!-- Tab switcher -->
        <div class="flex items-center gap-1 bg-white p-1.5 rounded-full shadow-sm w-fit" style="border: 1px solid #e2e8f0;">
          <button
            @click="activeTab = 'calculator'"
            class="px-5 py-2.5 rounded-full text-[13px] font-semibold transition-colors"
            :style="activeTab === 'calculator' ? 'background:#0f172a;color:#fff' : 'background:transparent;color:#64748b'"
          >{{ $t('calculatorPage.tabFeeCalculator') }}</button>
          <button
            @click="activeTab = 'penalty'"
            class="px-5 py-2.5 rounded-full text-[13px] font-semibold transition-colors"
            :style="activeTab === 'penalty' ? 'background:#0f172a;color:#fff' : 'background:transparent;color:#64748b'"
          >{{ $t('calculatorPage.tabPenaltyCalculator') }}</button>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════ -->
    <!-- TAB: FEE CALCULATOR                                      -->
    <!-- ═══════════════════════════════════════════════════════ -->
    <div v-if="activeTab === 'calculator'" class="max-w-[1360px] mx-auto px-6 lg:px-8 pb-20 grid grid-cols-12 gap-6">
      <!-- ───────────── LEFT: FORM ───────────── -->
      <div class="col-span-12 lg:col-span-8 space-y-4">
        <!-- Operation type + Year -->
        <div class="bg-white rounded-2xl border border-ink-200 p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="text-[11px] uppercase tracking-[0.15em] text-ink-400 font-semibold mb-3 block">
                {{ $t('calculatorPage.operationType') }}
              </label>
              <div class="grid grid-cols-2 gap-2">
                <button
                  @click="operationType = 'import'"
                  class="px-4 py-3 rounded-lg text-left transition-all"
                  :style="operationType === 'import'
                    ? 'border:1px solid #0e888d;background:#effafa;color:#0c6267'
                    : 'border:1px solid #e2e8f0;color:#334155'"
                >
                  <div class="text-[11px] uppercase tracking-[0.1em] font-semibold" style="color:#94a3b8">↓</div>
                  <div class="text-[14px] font-semibold mt-0.5">{{ $t('calculatorPage.import') }}</div>
                </button>
                <button
                  @click="operationType = 'production'"
                  class="px-4 py-3 rounded-lg text-left transition-all"
                  :style="operationType === 'production'
                    ? 'border:1px solid #0e888d;background:#effafa;color:#0c6267'
                    : 'border:1px solid #e2e8f0;color:#334155'"
                >
                  <div class="text-[11px] uppercase tracking-[0.1em] font-semibold" style="color:#94a3b8">⚙</div>
                  <div class="text-[14px] font-semibold mt-0.5">{{ $t('calculatorPage.production') }}</div>
                </button>
              </div>
            </div>
            <div>
              <label class="text-[11px] uppercase tracking-[0.15em] text-ink-400 font-semibold mb-3 block">
                {{ $t('calculatorPage.yearCalc') }}
              </label>
              <div class="flex gap-1.5 overflow-x-auto hide-scroll">
                <button
                  v-for="y in [2025, 2026, 2027, 2028, 2029, 2030]"
                  :key="y"
                  @click="year = y"
                  class="flex-1 min-w-[56px] px-3 py-3 rounded-lg text-[13px] font-semibold transition-all tabular-nums"
                  :style="year === y
                    ? 'border:1px solid #0e888d;background:#0e888d;color:#fff'
                    : 'border:1px solid #e2e8f0;color:#475569'"
                >{{ y }}</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Rows with live metric per row -->
        <div class="space-y-3">
          <div
            v-for="(row, i) in rows"
            :key="row.id"
            class="bg-white rounded-2xl border border-ink-200 overflow-hidden group hover:border-brand-300 transition-colors"
          >
            <div class="p-5">
              <!-- Row header -->
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                  <span class="w-6 h-6 rounded-full bg-ink-100 text-ink-500 text-[11px] font-mono font-semibold grid place-items-center">{{ i + 1 }}</span>
                  <span class="text-[11px] uppercase tracking-[0.12em] text-ink-400 font-semibold">{{ $t('calculatorPage.position') }}</span>
                </div>
                <button
                  v-if="rows.length > 1"
                  @click="removeRow(row.id)"
                  :title="$t('calculatorPage.removePosition')"
                  class="text-ink-300 hover:text-red-500 p-1 transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
                  </svg>
                </button>
              </div>

              <!-- Group + Subgroup selector -->
              <ProductGroupSelector
                :group="row.group"
                :subgroup="row.subgroup"
                :accentColor="'#0e888d'"
                @update:group="onGroupUpdate(row, $event)"
                @update:subgroup="onSubgroupUpdate(row, $event)"
                @subgroupSelected="onSubgroupSelected(row, $event)"
              />

              <!-- Metrics row -->
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
                <!-- Mass input -->
                <div>
                  <label class="text-[10px] uppercase tracking-[0.12em] text-ink-400 font-semibold block mb-1.5">
                    {{ $t('calculatorPage.rowMass') }}
                  </label>
                  <div class="relative">
                    <input
                      v-model="row.volume"
                      type="number" step="0.001" min="0" max="99999"
                      placeholder="0.00"
                      class="w-full px-3 py-2 bg-ink-50 border border-ink-200 focus:border-brand-600 focus:bg-white rounded-lg text-[14px] font-semibold text-ink-900 tabular-nums outline-none transition-colors pr-10"
                    />
                    <span class="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-ink-400">т</span>
                  </div>
                  <p v-if="getVolumeError(row)" class="text-[11px] text-red-500 mt-1">{{ getVolumeError(row) }}</p>
                </div>
                <!-- Norm -->
                <div>
                  <div class="text-[10px] uppercase tracking-[0.12em] text-ink-400 font-semibold mb-1.5">{{ $t('calculatorPage.rowNorm') }}</div>
                  <div class="px-3 py-2 text-[14px] font-semibold text-ink-700 tabular-nums">
                    {{ row.group ? row.recyclingStandard + '%' : '—' }}
                  </div>
                </div>
                <!-- To recycle -->
                <div>
                  <div class="text-[10px] uppercase tracking-[0.12em] text-ink-400 font-semibold mb-1.5">{{ $t('calculatorPage.rowRecycle') }}</div>
                  <div class="px-3 py-2 text-[14px] font-semibold text-emerald2-700 tabular-nums">
                    {{ row.group ? fmtT(row.volumeToRecycle) + ' т' : '—' }}
                  </div>
                </div>
                <!-- Row sum -->
                <div>
                  <div class="text-[10px] uppercase tracking-[0.12em] text-ink-400 font-semibold mb-1.5">{{ $t('calculatorPage.rowSum') }}</div>
                  <div class="px-3 py-2 text-[16px] font-semibold text-ink-900 tabular-nums leading-none">
                    <CountUp v-if="row.amount > 0" :value="row.amount" :decimals="0" />
                    <span v-else>—</span>
                    <span v-if="row.amount > 0" class="text-[11px] text-ink-400 ml-1 font-normal">с.</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Progress bar of row share in total -->
            <div v-if="row.amount > 0" class="h-1" style="background:#f1f5f9">
              <div
                class="h-full transition-all duration-500"
                :style="{ width: rowShare(row) + '%', background: 'linear-gradient(to right, #228e95, #10b981)' }"
              ></div>
            </div>
            <!-- Row footer with rate + share -->
            <div
              v-if="row.amount > 0"
              class="px-5 py-3 flex items-center justify-between flex-wrap gap-2 text-[13px]"
              style="background:rgba(241,245,249,0.6)"
            >
              <div style="color:#475569">
                {{ $t('calculatorPage.rowRate') }}
                <span class="font-mono font-semibold tabular-nums" style="color:#0f172a">{{ row.rate.toLocaleString('ru-RU') }}</span>
                <span class="font-mono" style="color:#475569">{{ $t('calculatorPage.somT') }}</span>
              </div>
              <div style="color:#475569">
                {{ $t('calculatorPage.rowShare') }}
                <span class="font-semibold tabular-nums" style="color:#0f172a">{{ rowShare(row).toFixed(1) }}%</span>
                <span class="ml-1">{{ $t('calculatorPage.rowOfTotal') }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Add row -->
        <button
          @click="addRow"
          :disabled="rows.length >= 10"
          class="w-full py-4 rounded-2xl border-2 border-dashed border-ink-300 hover:border-brand-500 hover:bg-brand-50/40 disabled:opacity-50 disabled:cursor-not-allowed text-ink-500 hover:text-brand-700 text-[14px] font-semibold transition-all"
        >
          + {{ $t('calculatorPage.addRow') }}
          <span class="text-ink-300 font-normal">· {{ $t('calculatorPage.maxRows') }}</span>
        </button>
      </div>

      <!-- ───────────── RIGHT: STICKY TOTAL ───────────── -->
      <aside class="col-span-12 lg:col-span-4">
        <div class="lg:sticky lg:top-6 space-y-4">
          <!-- Main sticky panel -->
          <div
            class="rounded-2xl overflow-hidden text-white p-7 relative"
            style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 55%, #0e4f54 100%);"
          >
            <div class="flex items-center justify-between mb-6">
              <div class="text-[11px] uppercase tracking-[0.2em] text-white/60 font-semibold font-mono">
                {{ $t('calculatorPage.totalDue') }}
              </div>
              <span class="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald2-500/20 text-emerald2-400 text-[10px] font-semibold uppercase tracking-wider">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald2-400 animate-pulse"></span>
                {{ $t('calculatorPage.liveLabel') }}
              </span>
            </div>
            <div class="text-[48px] lg:text-[52px] leading-none font-light tracking-tight tabular-nums">
              <CountUp :value="liveTotal" :decimals="0" />
            </div>
            <div class="text-[15px] text-white/70 mt-1">
              {{ $t('calculatorPage.somYearUnit', { year }) }}
            </div>

            <div class="h-px bg-white/10 my-6"></div>

            <div class="grid grid-cols-3 gap-3 text-white/80">
              <div>
                <div class="text-[10px] uppercase tracking-wider text-white/50 font-semibold mb-1">{{ $t('calculatorPage.positionsCount') }}</div>
                <div class="text-[20px] font-light tabular-nums">{{ rows.length }}</div>
              </div>
              <div>
                <div class="text-[10px] uppercase tracking-wider text-white/50 font-semibold mb-1">{{ $t('calculatorPage.massTotal') }}</div>
                <div class="text-[20px] font-light tabular-nums">{{ fmtT(liveTotalMass) }} т</div>
              </div>
              <div>
                <div class="text-[10px] uppercase tracking-wider text-white/50 font-semibold mb-1">{{ $t('calculatorPage.recycleTotal') }}</div>
                <div class="text-[20px] font-light tabular-nums text-emerald2-400">{{ fmtT(liveTotalRecycle) }} т</div>
              </div>
            </div>

            <DonutBreakdown :items="donutItems" :total="liveTotal" class="mt-6" />

            <div class="grid grid-cols-2 gap-2 mt-6">
              <button
                @click="downloadPdf"
                :disabled="pdfLoading || !isFormValid"
                class="px-4 py-3 rounded-xl text-[13px] font-semibold transition-colors"
                :style="isFormValid
                  ? 'background:#fff;color:#0f172a'
                  : 'background:rgba(255,255,255,0.2);color:rgba(255,255,255,0.5);cursor:not-allowed'"
              >
                {{ $t('calculatorPage.downloadPdf') }}
              </button>
              <button
                @click="clearForm"
                class="px-4 py-3 rounded-xl text-[13px] font-semibold transition-colors"
                style="background:rgba(255,255,255,0.1);color:#fff"
              >
                {{ $t('calculatorPage.clear') }}
              </button>
            </div>
          </div>

          <NormsTable :currentYear="year" />
        </div>
      </aside>
    </div>

    <!-- ═══════════════════════════════════════════════════════ -->
    <!-- TAB: PENALTY CALCULATOR (Variant A — slider + curve)      -->
    <!-- ═══════════════════════════════════════════════════════ -->
    <div v-if="activeTab === 'penalty'" class="max-w-[1360px] mx-auto px-6 lg:px-8 pb-20 grid grid-cols-12 gap-6">
      <!-- ───────────── LEFT: INPUTS ───────────── -->
      <div class="col-span-12 lg:col-span-7 space-y-4">
        <!-- Debt -->
        <div class="bg-white rounded-2xl border border-ink-200 p-7">
          <label class="text-[11px] uppercase tracking-[0.15em] text-ink-400 font-semibold mb-4 block">
            {{ $t('calculatorPage.penaltyDebt') }}
          </label>
          <div class="relative">
            <input
              v-model.number="penaltyDebt"
              type="number" min="0" step="50000"
              class="w-full text-[40px] lg:text-[48px] font-light text-ink-900 tabular-nums bg-transparent border-b-2 border-ink-200 focus:border-brand-600 outline-none py-2 pr-16"
            />
            <span class="absolute right-0 bottom-4 text-[16px] text-ink-400 font-medium">{{ $t('calculatorPage.som') }}</span>
          </div>
          <input
            v-model.number="penaltyDebt"
            type="range" min="0" max="10000000" step="50000"
            class="w-full mt-4 accent-brand-600"
          />
        </div>

        <!-- Days -->
        <div class="bg-white rounded-2xl border border-ink-200 p-7">
          <label class="text-[11px] uppercase tracking-[0.15em] text-ink-400 font-semibold mb-4 block">
            {{ $t('calculatorPage.penaltyDays') }}
          </label>
          <div class="flex items-baseline gap-4">
            <input
              v-model.number="penaltyDays"
              type="number" min="0" max="3650"
              class="w-32 lg:w-40 text-[40px] lg:text-[48px] font-light text-ink-900 tabular-nums bg-transparent border-b-2 border-ink-200 focus:border-brand-600 outline-none py-2"
            />
            <div v-if="penaltyDays > 0" class="text-[13px] text-ink-500">
              {{ $t('calculatorPage.penaltyApproxMonths', { m: Math.floor(penaltyDays/30), d: penaltyDays % 30 }) }}
            </div>
          </div>
          <div class="grid grid-cols-5 gap-2 mt-5">
            <button
              v-for="d in [7, 30, 60, 90, 180]"
              :key="d"
              @click="penaltyDays = d"
              :class="[
                'py-2 rounded-lg border text-[12px] font-semibold transition-all',
                penaltyDays === d ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-ink-200 text-ink-600 hover:border-ink-300'
              ]"
            >{{ d }} {{ $t('calculatorPage.penaltyDayShort') }}</button>
          </div>
        </div>

        <!-- Formula info -->
        <div class="bg-ink-100/60 rounded-2xl border border-ink-200 p-5 text-[12px] text-ink-600">
          <div class="flex items-center gap-2 mb-2 text-ink-800 font-semibold text-[13px]">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            {{ $t('calculatorPage.penaltyFormulaHeader') }}
          </div>
          {{ $t('calculatorPage.penaltyFormulaText') }}
        </div>
      </div>

      <!-- ───────────── RIGHT: RED STICKY RESULT ───────────── -->
      <aside class="col-span-12 lg:col-span-5">
        <div
          class="lg:sticky lg:top-6 rounded-2xl text-white p-7"
          style="background: linear-gradient(135deg, #7f1d1d 0%, #991b1b 55%, #0f172a 100%);"
        >
          <div class="text-[11px] uppercase tracking-[0.2em] text-white/60 font-semibold font-mono mb-4">
            {{ $t('calculatorPage.penaltyAmount') }}
          </div>
          <div class="text-[48px] lg:text-[56px] leading-none font-light tabular-nums text-red-200">
            <CountUp :value="penaltyAmount" :decimals="0" />
          </div>
          <div class="text-[15px] text-white/70 mt-1">
            {{ $t('calculatorPage.penaltyAccruedFor') }}
          </div>

          <div class="h-px bg-white/10 my-6"></div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <div class="text-[10px] uppercase tracking-wider text-white/50 font-semibold mb-1">{{ $t('calculatorPage.penaltyDebtShort') }}</div>
              <div class="text-[20px] font-light tabular-nums">{{ fmtSom(penaltyDebt) }}</div>
            </div>
            <div>
              <div class="text-[10px] uppercase tracking-wider text-white/50 font-semibold mb-1">{{ $t('calculatorPage.penaltyPlusPenalty') }}</div>
              <div class="text-[20px] font-light tabular-nums text-red-300">+{{ fmtSom(penaltyAmount) }}</div>
            </div>
          </div>

          <div class="mt-5 pt-5 border-t border-white/10">
            <div class="text-[10px] uppercase tracking-wider text-white/50 font-semibold mb-1">{{ $t('calculatorPage.penaltyTotalToPay') }}</div>
            <div class="text-[28px] lg:text-[32px] font-light tabular-nums">
              <CountUp :value="penaltyTotalToPay" :decimals="0" />
              <span class="text-[14px] text-white/50 ml-2 font-normal">{{ $t('calculatorPage.som') }}</span>
            </div>
          </div>

          <AccrualCurve :debt="penaltyDebt" :days="penaltyDays" />
        </div>
      </aside>
    </div>

    <!-- ═══════════════════════════════════════════════════════ -->
    <!-- ТЕХНИЧЕСКИЙ БЛОК ДЛЯ PDF-ЭКСПОРТА — СПРЯТАН OFF-SCREEN -->
    <!-- Пользователь его не видит, но html2canvas/jsPDF может     -->
    <!-- снять с него снимок когда кликают «Скачать PDF».          -->
    <!-- aria-hidden чтобы screen readers его игнорировали.        -->
    <!-- ═══════════════════════════════════════════════════════ -->
    <div
      id="calc-result"
      aria-hidden="true"
      style="position:absolute;left:-99999px;top:0;width:1360px;"
    >
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
              <tr v-for="r in displayResultRows" :key="r.id" class="border-b border-[#bbf7d0]">
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
                <td class="px-3 py-3 text-right font-bold text-[#065f46] rounded-br-lg text-lg">{{ fmtDec(displayTotalAmount) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Скрываем scrollbar для горизонтальной прокрутки годов */
.hide-scroll::-webkit-scrollbar {
  display: none;
}
.hide-scroll {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
/* Tabular nums — для чисел в sticky-панели */
.tabular-nums {
  font-variant-numeric: tabular-nums;
}
</style>
