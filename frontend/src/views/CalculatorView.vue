<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import {
  productGroups,
  productSubgroups,
  isPackagingGroup,
  type ProductGroup,
  type ProductSubgroup,
} from '../data/product-groups'
import { getNormativeForGroup, normativeTiers, getNormativeTier } from '../data/recycling-norms'
import { toastStore } from '../stores/toast'
import ProductGroupSelector from '../components/ProductGroupSelector.vue'

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

  // Year-based norm from recycling-norms.ts (e.g. group_4, 2025 → 20%)
  const normFraction = getNormativeForGroup(row.group, year.value)
  row.recyclingStandard = Math.round(normFraction * 100)

  // Rate = baseRate × subgroup multiplier
  let multiplier = 1
  if (row.subgroup && row.subgroupData) {
    multiplier = row.subgroupData.rateMultiplier
  }
  row.rate = Math.round(group.baseRate * multiplier)

  const vol = parseFloat(String(row.volume)) || 0
  // Гр.7: Volume to recycle = Volume × RecyclingStandard / 100
  row.volumeToRecycle = +(vol * row.recyclingStandard / 100).toFixed(4)
  // Amount = VolumeToRecycle × Rate (no deductions in public version)
  row.amount = Math.round(row.volumeToRecycle * row.rate * 100) / 100
}

// Recalculate when volume changes via watch
watch(rows, () => {
  rows.value.forEach(r => {
    if (r.group) recalcRow(r)
  })
}, { deep: true })

// Recalculate all rows when year changes (norms differ by year)
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
  if (isNaN(num)) return 'Введите числовое значение'
  if (num <= 0) return 'Объём должен быть больше 0'
  if (num > 99999) return 'Максимум 99 999 тонн'
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

// ─── Format helpers ───
function fmt(n: number): string {
  return n.toLocaleString('ru-RU')
}
function fmtDec(n: number): string {
  return n.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function getGroupLabel(value: string): string {
  return productGroups.find(g => g.value === value)?.label || '—'
}

function getSubgroupLabel(row: CalcRow): string {
  if (!row.subgroupData) return '—'
  return row.subgroupData.label
}

// ─── PDF Export ───
function downloadPdf() {
  const now = new Date()
  const dateStr = now.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const timeStr = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })

  const tableRows = resultRows.value.map(r => {
    return `<tr>
      <td style="padding:6px 10px;border:1px solid #d1d5db;text-align:left">${getGroupLabel(r.group)}</td>
      <td style="padding:6px 10px;border:1px solid #d1d5db;text-align:left;font-size:11px">${getSubgroupLabel(r)}</td>
      <td style="padding:6px 10px;border:1px solid #d1d5db;text-align:right">${fmtDec(parseFloat(String(r.volume)) || 0)}</td>
      <td style="padding:6px 10px;border:1px solid #d1d5db;text-align:center">${r.recyclingStandard}%</td>
      <td style="padding:6px 10px;border:1px solid #d1d5db;text-align:right">${fmtDec(r.volumeToRecycle)}</td>
      <td style="padding:6px 10px;border:1px solid #d1d5db;text-align:right">${fmt(r.rate)}</td>
      <td style="padding:6px 10px;border:1px solid #d1d5db;text-align:right;font-weight:600">${fmtDec(r.amount)}</td>
    </tr>`
  }).join('')

  const totalVol = resultRows.value.reduce((s, r) => s + (parseFloat(String(r.volume)) || 0), 0)

  const html = `<!DOCTYPE html>
<html lang="ru"><head><meta charset="utf-8">
<title>Расчёт утилизационного сбора</title>
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; margin: 40px; color: #1e293b; font-size: 13px; }
  h1 { font-size: 18px; text-align: center; margin-bottom: 4px; }
  h2 { font-size: 14px; text-align: center; color: #64748b; font-weight: normal; margin-bottom: 24px; }
  .header-line { text-align: center; font-size: 13px; color: #64748b; margin-bottom: 6px; }
  table { width: 100%; border-collapse: collapse; margin: 16px 0; }
  th { padding: 6px 10px; border: 1px solid #94a3b8; background: #f1f5f9; text-align: center; font-weight: 600; font-size: 12px; }
  .total-row td { font-weight: 700; background: #f8fafc; }
  .formula { background: #f0fdf4; border: 1px solid #bbf7d0; padding: 12px 16px; border-radius: 8px; margin: 16px 0; }
  .total-box { background: #ecfdf5; border: 2px solid #22c55e; padding: 16px; border-radius: 8px; text-align: center; margin: 16px 0; }
  .total-amount { font-size: 22px; font-weight: 700; color: #15803d; }
  .disclaimer { margin-top: 32px; padding: 12px 16px; background: #fefce8; border: 1px solid #fde68a; border-radius: 8px; font-size: 12px; color: #92400e; }
  @media print { body { margin: 20px; } }
</style></head><body>
  <div class="header-line">АИС «ГП Эко Оператор»</div>
  <h1>Предварительный расчёт утилизационного сбора</h1>
  <h2>Дата: ${dateStr}, ${timeStr}</h2>
  <div style="margin-bottom:8px">
    <strong>Тип операции:</strong> ${operationType.value === 'import' ? 'Импорт' : 'Производство'} &nbsp;
    <strong>Год:</strong> ${year.value}
  </div>
  <div class="formula"><strong>Формула:</strong> Усб = (Масса &times; Норматив / 100) &times; Ставка</div>
  <table>
    <thead><tr>
      <th style="text-align:left">Группа</th>
      <th style="text-align:left">Подгруппа</th>
      <th>Масса (т)</th>
      <th>Норматив (%)</th>
      <th>К переработке (т)</th>
      <th>Ставка (сом/т)</th>
      <th>Сумма (сом)</th>
    </tr></thead>
    <tbody>${tableRows}
      <tr class="total-row">
        <td style="padding:6px 10px;border:1px solid #94a3b8" colspan="2"><strong>ИТОГО</strong></td>
        <td style="padding:6px 10px;border:1px solid #94a3b8;text-align:right"><strong>${fmtDec(totalVol)}</strong></td>
        <td style="padding:6px 10px;border:1px solid #94a3b8" colspan="2"></td>
        <td style="padding:6px 10px;border:1px solid #94a3b8"></td>
        <td style="padding:6px 10px;border:1px solid #94a3b8;text-align:right"><strong>${fmtDec(totalAmount.value)}</strong></td>
      </tr>
    </tbody>
  </table>
  <div class="total-box">
    <div style="color:#64748b;margin-bottom:4px">Итого утилизационный сбор:</div>
    <div class="total-amount">${fmtDec(totalAmount.value)} сом</div>
  </div>
  <div class="disclaimer"><strong>Примечание:</strong> Данный расчёт является предварительным и не имеет юридической силы.</div>
  <div style="font-size:12px;color:#64748b;margin-top:24px">
    <p>Ставки: ПКМ КР №730 от 03.12.2024</p>
    <p>Нормативы переработки: ПКМ КР №322 от 15.05.2023</p>
  </div>
</body></html>`

  const w = window.open('', '_blank')
  if (!w) { toastStore.show({ type: 'warning', title: 'Окно заблокировано', message: 'Разрешите всплывающие окна для скачивания PDF' }); return }
  w.document.write(html)
  w.document.close()
  w.onload = () => { w.print() }
}
</script>

<template>
  <div class="min-h-screen bg-[#f8fafc]">
    <!-- Banner (contained, rounded, same width as content) -->
    <div class="container-main pt-8 lg:pt-10">
      <div class="text-white rounded-2xl py-10 lg:py-14 px-6 text-center" style="background: linear-gradient(135deg, #0d9488 0%, #10b981 100%)">
        <h1 class="text-3xl lg:text-4xl font-bold mb-3">Калькулятор утилизационного сбора (РОП)</h1>
        <p class="text-white/80 text-base lg:text-lg max-w-2xl mx-auto">
          Предварительный расчёт суммы утилизационного сбора согласно ПКМ КР №730
        </p>
      </div>
    </div>

    <div class="container-main py-8 lg:py-10">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- LEFT: Calculator Form -->
        <div class="lg:col-span-2 space-y-6">

          <!-- Global fields -->
          <div class="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] p-6">
            <h2 class="text-lg font-bold text-[#1e293b] mb-5">Параметры расчёта</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <!-- Operation type -->
              <div>
                <label class="block text-sm font-medium text-[#1e293b] mb-2">Тип операции</label>
                <div class="flex gap-4">
                  <label class="flex items-center gap-2 cursor-pointer select-none">
                    <input type="radio" v-model="operationType" value="import"
                      class="w-4 h-4 text-[#10b981] focus:ring-[#10b981]/20 border-[#e2e8f0]" />
                    <span class="text-sm text-[#1e293b]">Импорт</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer select-none">
                    <input type="radio" v-model="operationType" value="production"
                      class="w-4 h-4 text-[#10b981] focus:ring-[#10b981]/20 border-[#e2e8f0]" />
                    <span class="text-sm text-[#1e293b]">Производство</span>
                  </label>
                </div>
              </div>
              <!-- Year -->
              <div>
                <label class="block text-sm font-medium text-[#1e293b] mb-2">Год расчёта</label>
                <select v-model="year"
                  class="w-full px-4 py-2.5 border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/20 text-sm">
                  <option :value="2025">2025</option>
                  <option :value="2026">2026</option>
                  <option :value="2027">2027</option>
                  <option :value="2028">2028</option>
                  <option :value="2029">2029</option>
                  <option :value="2030">2030</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Product items -->
          <div class="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] p-6">
            <div class="flex items-center justify-between mb-5">
              <h2 class="text-lg font-bold text-[#1e293b]">Товары и упаковка</h2>
              <span class="text-xs text-[#94a3b8]">{{ rows.length }} / 10</span>
            </div>

            <div class="space-y-5">
              <div v-for="(row, idx) in rows" :key="row.id"
                class="relative bg-[#f8fafc] rounded-xl p-5 border border-[#e2e8f0]">

                <!-- Row header -->
                <div class="flex items-center justify-between mb-4">
                  <span class="text-xs font-semibold text-[#94a3b8] uppercase tracking-wide">Позиция {{ idx + 1 }}</span>
                  <button v-if="rows.length > 1" @click="removeRow(row.id)"
                    class="w-7 h-7 rounded-lg flex items-center justify-center text-[#94a3b8] hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="Удалить позицию">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <!-- Group + Subgroup selector (same component as ЛК) -->
                <ProductGroupSelector
                  :group="row.group"
                  :subgroup="row.subgroup"
                  :accentColor="'#10b981'"
                  @update:group="onGroupUpdate(row, $event)"
                  @update:subgroup="onSubgroupUpdate(row, $event)"
                  @subgroupSelected="onSubgroupSelected(row, $event)"
                />

                <!-- Volume + calculated fields -->
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                  <!-- Volume (Масса, тонн) -->
                  <div>
                    <label class="block text-xs text-[#64748b] mb-1">
                      Масса (тонн)
                      <span class="relative group inline-block ml-1 cursor-help">
                        <svg class="w-3.5 h-3.5 inline text-[#94a3b8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[#1e293b] text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                          1 тонна = 1 000 кг
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
                      <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#94a3b8]">тонн</span>
                    </div>
                    <p v-if="getVolumeError(row)" class="text-xs text-red-500 mt-1">{{ getVolumeError(row) }}</p>
                  </div>

                  <!-- Норматив (auto) -->
                  <div>
                    <label class="block text-xs text-[#64748b] mb-1">Норматив переработки</label>
                    <div class="w-full px-3 py-2 bg-gray-50 border border-[#e2e8f0] rounded-lg text-sm text-[#1e293b] font-medium">
                      {{ row.group ? row.recyclingStandard + '%' : '—' }}
                    </div>
                  </div>

                  <!-- Объём к переработке (auto) -->
                  <div>
                    <label class="block text-xs text-[#64748b] mb-1">К переработке (т)</label>
                    <div class="w-full px-3 py-2 bg-gray-50 border border-[#e2e8f0] rounded-lg text-sm text-[#1e293b] font-medium">
                      {{ row.group ? fmtDec(row.volumeToRecycle) : '—' }}
                    </div>
                  </div>

                  <!-- Ставка (auto) -->
                  <div>
                    <label class="block text-xs text-[#64748b] mb-1">Ставка (сом/т)</label>
                    <div class="w-full px-3 py-2 bg-gray-50 border border-[#e2e8f0] rounded-lg text-sm text-[#1e293b] font-medium">
                      {{ row.group ? fmt(row.rate) : '—' }}
                    </div>
                  </div>
                </div>

                <!-- Row total preview -->
                <div v-if="row.group && parseFloat(String(row.volume)) > 0" class="mt-3 pt-3 border-t border-[#e2e8f0] flex items-center justify-between">
                  <span class="text-xs text-[#64748b]">
                    Расчёт: {{ fmtDec(row.volumeToRecycle) }} т &times; {{ fmt(row.rate) }} сом/т
                  </span>
                  <span class="text-sm font-bold text-[#1e293b]">{{ fmtDec(row.amount) }} сом</span>
                </div>
              </div>
            </div>

            <!-- Add row -->
            <button v-if="rows.length < 10" @click="addRow"
              class="mt-4 w-full py-3 border-2 border-dashed border-[#d1d5db] rounded-xl text-sm font-medium text-[#64748b] hover:border-[#10b981] hover:text-[#10b981] hover:bg-[#f0fdf4] transition-colors">
              <svg class="w-4 h-4 inline mr-1 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Добавить ещё позицию
            </button>
          </div>

          <!-- Formula + buttons -->
          <div class="bg-[#f8fafc] rounded-2xl border border-[#e2e8f0] p-5">
            <div class="flex items-start gap-3 mb-4">
              <svg class="w-5 h-5 text-[#64748b] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div class="text-xs text-[#64748b] space-y-1">
                <p><strong>Формула:</strong> Усб = (Масса &times; Норматив / 100) &times; Ставка</p>
                <p>Если подгруппа выбрана — ставка корректируется на коэффициент подгруппы.</p>
                <p><strong>Основание:</strong> Ставки — ПКМ КР №730 от 03.12.2024.</p>
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
                Рассчитать
              </button>
              <button @click="clearForm"
                class="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium border border-[#e2e8f0] text-[#64748b] hover:bg-white hover:border-[#94a3b8] transition-colors">
                Очистить
              </button>
            </div>
          </div>

          <!-- RESULT -->
          <Transition
            enter-active-class="transition-all duration-500 ease-out"
            enter-from-class="opacity-0 translate-y-4"
            enter-to-class="opacity-100 translate-y-0"
          >
            <div v-if="showResult" id="calc-result" class="space-y-6">
              <div class="bg-[#f0fdf4] rounded-2xl border-2 border-[#86efac] p-6">
                <h3 class="text-lg font-bold text-[#065f46] mb-4">Результат расчёта</h3>

                <!-- Result table -->
                <div class="overflow-x-auto mb-4">
                  <table class="w-full text-sm border-collapse">
                    <thead>
                      <tr class="text-left text-[#047857]">
                        <th class="px-3 py-2 bg-[#dcfce7] rounded-tl-lg font-semibold">Группа</th>
                        <th class="px-3 py-2 bg-[#dcfce7] font-semibold">Подгруппа</th>
                        <th class="px-3 py-2 bg-[#dcfce7] text-right font-semibold">Масса (т)</th>
                        <th class="px-3 py-2 bg-[#dcfce7] text-center font-semibold">Норм. (%)</th>
                        <th class="px-3 py-2 bg-[#dcfce7] text-right font-semibold">К перер. (т)</th>
                        <th class="px-3 py-2 bg-[#dcfce7] text-right font-semibold">Ставка</th>
                        <th class="px-3 py-2 bg-[#dcfce7] rounded-tr-lg text-right font-semibold">Сумма (сом)</th>
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
                        <td class="px-3 py-3 font-bold text-[#065f46] rounded-bl-lg" colspan="6">ИТОГО</td>
                        <td class="px-3 py-3 text-right font-bold text-[#065f46] rounded-br-lg text-lg">{{ fmtDec(totalAmount) }}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <!-- Big total -->
                <div class="bg-white rounded-xl p-5 text-center border border-[#bbf7d0]">
                  <p class="text-sm text-[#64748b] mb-1">Итого утилизационный сбор:</p>
                  <p class="text-3xl lg:text-4xl font-bold text-[#15803d]">{{ fmtDec(totalAmount) }} сом</p>
                  <p class="text-xs text-[#94a3b8] mt-2">Год: {{ year }} &middot; {{ operationType === 'import' ? 'Импорт' : 'Производство' }}</p>
                </div>
              </div>

              <!-- Action buttons -->
              <div class="flex flex-wrap gap-3">
                <button @click="downloadPdf"
                  class="flex items-center gap-2 px-5 py-2.5 bg-white rounded-xl text-sm font-medium border border-[#e2e8f0] text-[#1e293b] hover:border-[#10b981] hover:text-[#10b981] transition-colors shadow-sm">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Скачать PDF
                </button>
                <button @click="newCalculation"
                  class="flex items-center gap-2 px-5 py-2.5 bg-[#10b981] rounded-xl text-sm font-semibold text-white hover:bg-[#059669] transition-colors shadow-sm">
                  Новый расчёт
                </button>
              </div>
            </div>
          </Transition>
        </div>

        <!-- RIGHT: Info sidebar -->
        <div class="lg:col-span-1">
          <div class="sticky top-6 space-y-6">

            <!-- About calculator -->
            <div class="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] p-6">
              <div class="flex items-center gap-2 mb-4">
                <div class="w-8 h-8 rounded-lg bg-[#ecfdf5] flex items-center justify-center">
                  <svg class="w-5 h-5 text-[#10b981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 class="font-bold text-[#1e293b]">О калькуляторе</h3>
              </div>
              <ul class="space-y-3 text-sm text-[#64748b]">
                <li class="flex items-start gap-2">
                  <svg class="w-4 h-4 text-[#10b981] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                  <span>Калькулятор для <strong class="text-[#1e293b]">предварительного расчёта</strong> утилизационного сбора</span>
                </li>
                <li class="flex items-start gap-2">
                  <svg class="w-4 h-4 text-[#10b981] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                  <span>Группа + подгруппа — <strong class="text-[#1e293b]">как в ЛК плательщика</strong></span>
                </li>
                <li class="flex items-start gap-2">
                  <svg class="w-4 h-4 text-[#10b981] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                  <span>Ставки: <strong class="text-[#1e293b]">ПКМ КР №730</strong> от 03.12.2024</span>
                </li>
                <li class="flex items-start gap-2">
                  <svg class="w-4 h-4 text-[#10b981] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                  <span>Официальный расчёт — через <strong class="text-[#1e293b]">Личный кабинет</strong></span>
                </li>
              </ul>

              <div class="mt-5 pt-4 border-t border-[#e2e8f0]">
                <p class="text-xs text-[#94a3b8] mb-1">По вопросам:</p>
                <p class="text-sm text-[#1e293b]">eco-operator@gov.kg</p>
                <p class="text-sm text-[#1e293b]">+996 312 XXX XXX</p>
              </div>

              <router-link to="/login"
                class="mt-5 flex items-center justify-center gap-2 w-full py-3 bg-[#10b981] text-white rounded-xl text-sm font-semibold hover:bg-[#059669] transition-colors">
                Войти в Личный кабинет
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </router-link>
            </div>

            <!-- Normatives table -->
            <div class="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] p-6">
              <h3 class="font-bold text-[#1e293b] mb-3">Нормативы переработки по годам</h3>
              <div class="overflow-x-auto">
                <table class="w-full text-xs">
                  <thead>
                    <tr class="text-[#64748b]">
                      <th class="pb-2 text-left font-medium">Год</th>
                      <th class="pb-2 text-center font-medium">Гр. 1-4</th>
                      <th class="pb-2 text-center font-medium">Гр. 5-24</th>
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
                Гр. 1-4: бумага/картон, масла, шины<br>
                Гр. 5-24: прочие товары и вся упаковка
              </p>
            </div>

            <!-- Disclaimer -->
            <div class="bg-[#fefce8] rounded-2xl border border-[#fde68a] p-5">
              <div class="flex items-start gap-2">
                <svg class="w-5 h-5 text-[#d97706] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p class="text-xs text-[#92400e]">
                  Данный расчёт является <strong>предварительным</strong> и не имеет юридической силы.
                  Для официальной подачи расчёта воспользуйтесь Личным кабинетом плательщика.
                </p>
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
