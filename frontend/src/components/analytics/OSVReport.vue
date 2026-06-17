<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import * as XLSX from 'xlsx'
import { productGroups, getTranslatedGroupLabel } from '../../data/product-groups'

const { t, locale } = useI18n()

// ─── Controls ───
type View = 'groups' | 'payers'
const view = ref<View>('groups')
const monthIdx = ref(0)          // 0..11
const year = ref(2026)
const region = ref('all')

const yearOptions = [2025, 2026]
const regions = [
  { id: 'all', label: () => t('osv.allRegions') },
  { id: 'bishkek', label: () => 'г. Бишкек' },
  { id: 'chuy', label: () => 'Чуйская обл.' },
  { id: 'osh', label: () => 'Ошская обл.' },
  { id: 'issykkul', label: () => 'Иссык-Кульская обл.' },
  { id: 'jalalabad', label: () => 'Джалал-Абадская обл.' },
]

const dateLang = computed(() => ({ ru: 'ru-RU', ky: 'ky-KG', en: 'en-GB' } as Record<string, string>)[(locale as any).value] || 'ru-RU')
const monthOptions = computed(() =>
  Array.from({ length: 12 }, (_, i) => ({
    idx: i,
    label: new Date(2026, i, 1).toLocaleDateString(dateLang.value, { month: 'long' }),
  })),
)

const periodLabel = computed(() => {
  const m = new Date(2026, monthIdx.value, 1).toLocaleDateString(dateLang.value, { month: 'long' })
  return `${m} ${year.value}`
})

// ─── Deterministic mock (no Math.random — stable across renders) ───
function pseudo(a: number, b: number): number {
  const x = Math.sin((a * 12.9898 + b * 78.233 + year.value * 0.137) * 43758.5453)
  return x - Math.floor(x) // 0..1
}
const regionFactor = computed(() => {
  const map: Record<string, number> = { all: 1, bishkek: 0.42, chuy: 0.18, osh: 0.16, issykkul: 0.1, jalalabad: 0.14 }
  return map[region.value] ?? 1
})
const round1000 = (n: number) => Math.round(n / 1000) * 1000

interface Row { name: string; openNet: number; accrued: number; paid: number; closeNet: number }

function buildRow(name: string, seed: number): Row {
  const k = monthIdx.value + 1
  const f = regionFactor.value
  const accrued = round1000((250_000 + pseudo(seed + 1, k) * 4_200_000) * f)
  const paid = round1000(accrued * (0.55 + pseudo(seed + 7, k) * 0.4))
  const openNet = round1000((pseudo(seed + 3, k) - 0.45) * 2_400_000 * f)
  const closeNet = openNet + accrued - paid
  return { name, openNet, accrued, paid, closeNet }
}

const groupRows = computed<Row[]>(() =>
  productGroups.map((g, i) => buildRow(getTranslatedGroupLabel(g.value), i + 1)),
)

const mockPayers = [
  'ОсОО «ТехноПром»', 'ОсОО «Бишкек Трейд»', 'ОАО «ГринТех»', 'ОсОО «АлаТоо Импорт»',
  'ОсОО «Ала-Тоо Пластик»', 'ОсОО «Кыргыз Пэт»', 'ИП Садыков А.К.', 'ОсОО «Эко Упаковка»',
  'ОсОО «Манас Логистик»', 'ОсОО «Иссык-Куль Ресурс»',
]
const payerRows = computed<Row[]>(() =>
  mockPayers.map((name, i) => buildRow(name, i + 101)),
)

const rows = computed<Row[]>(() => (view.value === 'groups' ? groupRows.value : payerRows.value))

const totals = computed<Row>(() => {
  const acc = rows.value.reduce(
    (s, r) => ({
      openNet: s.openNet + r.openNet, accrued: s.accrued + r.accrued,
      paid: s.paid + r.paid, closeNet: s.closeNet + r.closeNet,
    }),
    { openNet: 0, accrued: 0, paid: 0, closeNet: 0 },
  )
  return { name: t('osv.total'), ...acc }
})

// ─── Formatting ───
const fmt = (n: number) => (n ? n.toLocaleString('ru-RU') : '—')
const dt = (net: number) => (net > 0 ? fmt(net) : '—')   // долг плательщиков
const kt = (net: number) => (net < 0 ? fmt(-net) : '—')  // переплата

// ─── Export to Excel ───
function exportExcel() {
  const head1 = [t('osv.title'), '', '', '', '', '']
  const head2 = [`${view.value === 'groups' ? t('osv.colGroup') : t('osv.colPayer')} · ${periodLabel.value}`, '', '', '', '', '']
  const cols = [
    view.value === 'groups' ? t('osv.colGroup') : t('osv.colPayer'),
    `${t('osv.openingBalance')} (${t('osv.debit')})`,
    `${t('osv.openingBalance')} (${t('osv.credit')})`,
    t('osv.accrued'), t('osv.paid'),
    `${t('osv.closingBalance')} (${t('osv.debit')})`,
    `${t('osv.closingBalance')} (${t('osv.credit')})`,
  ]
  const body = rows.value.map(r => [
    r.name, r.openNet > 0 ? r.openNet : '', r.openNet < 0 ? -r.openNet : '',
    r.accrued, r.paid, r.closeNet > 0 ? r.closeNet : '', r.closeNet < 0 ? -r.closeNet : '',
  ])
  const totalRow = [
    totals.value.name, totals.value.openNet > 0 ? totals.value.openNet : '', totals.value.openNet < 0 ? -totals.value.openNet : '',
    totals.value.accrued, totals.value.paid,
    totals.value.closeNet > 0 ? totals.value.closeNet : '', totals.value.closeNet < 0 ? -totals.value.closeNet : '',
  ]
  const aoa = [head1, head2, [], cols, ...body, totalRow]
  const ws = XLSX.utils.aoa_to_sheet(aoa)
  ws['!cols'] = [{ wch: 48 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 16 }]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'ОСВ')
  XLSX.writeFile(wb, `ОСВ_${view.value === 'groups' ? 'по_группам' : 'по_плательщикам'}_${periodLabel.value}.xlsx`)
}
</script>

<template>
  <div class="space-y-5">
    <!-- Header -->
    <div>
      <h2 class="text-xl font-bold text-[#415861]">{{ $t('osv.title') }}</h2>
      <p class="text-sm text-[#70868f] mt-1">{{ $t('osv.subtitle') }}</p>
    </div>

    <!-- Controls -->
    <div class="bg-white rounded-xl border border-gray-200 p-4 flex flex-col lg:flex-row lg:items-end gap-4">
      <!-- view toggle -->
      <div class="inline-flex bg-gray-100 rounded-lg p-1 self-start">
        <button
          v-for="opt in (['groups','payers'] as View[])"
          :key="opt"
          @click="view = opt"
          :class="['px-4 py-2 rounded-md text-sm font-medium transition-colors',
            view === opt ? 'bg-white text-[#0e888d] shadow-sm' : 'text-[#415861] hover:text-[#0e888d]']"
        >
          {{ opt === 'groups' ? $t('osv.byGroups') : $t('osv.byPayers') }}
        </button>
      </div>

      <div class="flex flex-wrap items-end gap-3 lg:ml-auto">
        <label class="text-xs text-[#64748b]">
          <span class="block mb-1">{{ $t('osv.period') }}</span>
          <span class="flex gap-2">
            <select v-model.number="monthIdx" class="px-3 py-2 border border-[#e2e8f0] rounded-lg text-sm capitalize">
              <option v-for="m in monthOptions" :key="m.idx" :value="m.idx">{{ m.label }}</option>
            </select>
            <select v-model.number="year" class="px-3 py-2 border border-[#e2e8f0] rounded-lg text-sm">
              <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
            </select>
          </span>
        </label>
        <label class="text-xs text-[#64748b]">
          <span class="block mb-1">{{ $t('osv.region') }}</span>
          <select v-model="region" class="px-3 py-2 border border-[#e2e8f0] rounded-lg text-sm">
            <option v-for="r in regions" :key="r.id" :value="r.id">{{ r.label() }}</option>
          </select>
        </label>
        <button
          @click="exportExcel"
          class="px-4 py-2 bg-[#2D8B4E] text-white rounded-lg text-sm font-medium hover:bg-[#247a42] transition-colors"
        >
          {{ $t('osv.export') }}
        </button>
      </div>
    </div>

    <!-- Legend -->
    <p class="text-xs text-[#94a3b8]">
      {{ $t('osv.debit') }} — {{ $t('osv.debitHint') }} · {{ $t('osv.credit') }} — {{ $t('osv.creditHint') }}. {{ $t('osv.currencyNote') }}
    </p>

    <!-- Table -->
    <div class="bg-white rounded-xl border border-gray-200 overflow-x-auto">
      <table class="w-full text-sm border-collapse min-w-[920px]">
        <thead>
          <tr class="bg-[#f8fafc] text-[#64748b]">
            <th rowspan="2" class="text-left px-4 py-3 font-semibold border-b border-gray-200">
              {{ view === 'groups' ? $t('osv.colGroup') : $t('osv.colPayer') }}
            </th>
            <th colspan="2" class="text-center px-4 py-2 font-semibold border-b border-l border-gray-200">{{ $t('osv.openingBalance') }}</th>
            <th rowspan="2" class="text-right px-4 py-3 font-semibold border-b border-l border-gray-200">{{ $t('osv.accrued') }}</th>
            <th rowspan="2" class="text-right px-4 py-3 font-semibold border-b border-l border-gray-200">{{ $t('osv.paid') }}</th>
            <th colspan="2" class="text-center px-4 py-2 font-semibold border-b border-l border-gray-200">{{ $t('osv.closingBalance') }}</th>
          </tr>
          <tr class="bg-[#f8fafc] text-[#64748b] text-xs">
            <th class="text-right px-4 py-2 font-medium border-b border-l border-gray-200">{{ $t('osv.debit') }}</th>
            <th class="text-right px-4 py-2 font-medium border-b border-gray-200">{{ $t('osv.credit') }}</th>
            <th class="text-right px-4 py-2 font-medium border-b border-l border-gray-200">{{ $t('osv.debit') }}</th>
            <th class="text-right px-4 py-2 font-medium border-b border-gray-200">{{ $t('osv.credit') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(r, i) in rows" :key="i" class="hover:bg-[#f0fdf4] transition-colors">
            <td class="px-4 py-2.5 text-[#1e293b] border-b border-gray-100">
              <span v-if="view === 'groups'" class="text-[#94a3b8] mr-1.5">№{{ i + 1 }}</span>{{ r.name }}
            </td>
            <td class="px-4 py-2.5 text-right tabular-nums border-b border-l border-gray-100 text-[#b45309]">{{ dt(r.openNet) }}</td>
            <td class="px-4 py-2.5 text-right tabular-nums border-b border-gray-100 text-[#0e888d]">{{ kt(r.openNet) }}</td>
            <td class="px-4 py-2.5 text-right tabular-nums border-b border-l border-gray-100 text-[#1e293b]">{{ fmt(r.accrued) }}</td>
            <td class="px-4 py-2.5 text-right tabular-nums border-b border-l border-gray-100 text-[#2D8B4E]">{{ fmt(r.paid) }}</td>
            <td class="px-4 py-2.5 text-right tabular-nums border-b border-l border-gray-100 text-[#b45309] font-medium">{{ dt(r.closeNet) }}</td>
            <td class="px-4 py-2.5 text-right tabular-nums border-b border-gray-100 text-[#0e888d] font-medium">{{ kt(r.closeNet) }}</td>
          </tr>
          <!-- Totals -->
          <tr class="bg-[#f8fafc] font-semibold text-[#1e293b]">
            <td class="px-4 py-3 border-t-2 border-gray-300">{{ totals.name }}</td>
            <td class="px-4 py-3 text-right tabular-nums border-t-2 border-l border-gray-300 text-[#b45309]">{{ dt(totals.openNet) }}</td>
            <td class="px-4 py-3 text-right tabular-nums border-t-2 border-gray-300 text-[#0e888d]">{{ kt(totals.openNet) }}</td>
            <td class="px-4 py-3 text-right tabular-nums border-t-2 border-l border-gray-300">{{ fmt(totals.accrued) }}</td>
            <td class="px-4 py-3 text-right tabular-nums border-t-2 border-l border-gray-300">{{ fmt(totals.paid) }}</td>
            <td class="px-4 py-3 text-right tabular-nums border-t-2 border-l border-gray-300 text-[#b45309]">{{ dt(totals.closeNet) }}</td>
            <td class="px-4 py-3 text-right tabular-nums border-t-2 border-gray-300 text-[#0e888d]">{{ kt(totals.closeNet) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <p class="text-xs text-[#94a3b8]">{{ $t('osv.mockNote') }}</p>
  </div>
</template>
