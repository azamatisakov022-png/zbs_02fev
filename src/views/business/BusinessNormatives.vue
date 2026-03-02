<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import { useBusinessMenu } from '../../composables/useRoleMenu'
import { UTILIZATION_RATES_2025, getRateByGroup } from '../../data/rates'

const { t } = useI18n()
const { roleTitle, menuItems } = useBusinessMenu()

const currentYear = 2026
const years = [2025, 2026, 2027, 2028, 2029, 2030]

const activeTab = ref<'norms' | 'rates'>('norms')

// Unified 24-group norms data (ПКМ КР №322)
const norms = [
  { id: 1,  category: 'Изделия из гофрированной бумаги/картона',                          rates: { 2025: 20, 2026: 30, 2027: 50, 2028: 60, 2029: 70, 2030: 80 } },
  { id: 2,  category: 'Изделия из негофрированной бумаги/картона',                         rates: { 2025: 20, 2026: 30, 2027: 50, 2028: 60, 2029: 70, 2030: 80 } },
  { id: 3,  category: 'Масла',                                                             rates: { 2025: 20, 2026: 30, 2027: 50, 2028: 60, 2029: 70, 2030: 80 } },
  { id: 4,  category: 'Шины, покрышки и камеры резиновые',                                 rates: { 2025: 20, 2026: 30, 2027: 50, 2028: 60, 2029: 70, 2030: 80 } },
  { id: 5,  category: 'Изделия из резины (за исключением шин)',                             rates: { 2025: 10, 2026: 20, 2027: 40, 2028: 50, 2029: 70, 2030: 80 } },
  { id: 6,  category: 'Изделия пластмассовые упаковочные',                                 rates: { 2025: 10, 2026: 20, 2027: 40, 2028: 50, 2029: 70, 2030: 80 } },
  { id: 7,  category: 'Изделия пластмассовые прочие',                                      rates: { 2025: 10, 2026: 20, 2027: 40, 2028: 50, 2029: 70, 2030: 80 } },
  { id: 8,  category: 'Стекло полое',                                                      rates: { 2025: 10, 2026: 20, 2027: 40, 2028: 50, 2029: 70, 2030: 80 } },
  { id: 9,  category: 'Компьютеры и периферийное оборудование, офисное оборудование',       rates: { 2025: 10, 2026: 20, 2027: 40, 2028: 50, 2029: 70, 2030: 80 } },
  { id: 10, category: 'Мониторы, приемники телевизионные',                                  rates: { 2025: 10, 2026: 20, 2027: 40, 2028: 50, 2029: 70, 2030: 80 } },
  { id: 11, category: 'Элементы первичные и батареи первичных элементов',                   rates: { 2025: 10, 2026: 20, 2027: 40, 2028: 50, 2029: 70, 2030: 80 } },
  { id: 12, category: 'Аккумуляторы свинцовые',                                            rates: { 2025: 10, 2026: 20, 2027: 40, 2028: 50, 2029: 70, 2030: 80 } },
  { id: 13, category: 'Батареи аккумуляторные',                                            rates: { 2025: 10, 2026: 20, 2027: 40, 2028: 50, 2029: 70, 2030: 80 } },
  { id: 14, category: 'Оборудование электрическое осветительное',                           rates: { 2025: 10, 2026: 20, 2027: 40, 2028: 50, 2029: 70, 2030: 80 } },
  { id: 15, category: 'Техника бытовая крупная',                                            rates: { 2025: 10, 2026: 20, 2027: 40, 2028: 50, 2029: 70, 2030: 80 } },
  { id: 16, category: 'Техника бытовая мелкая, инструмент ручной',                          rates: { 2025: 10, 2026: 20, 2027: 40, 2028: 50, 2029: 70, 2030: 80 } },
  { id: 17, category: 'Оборудование холодильное и вентиляционное',                          rates: { 2025: 10, 2026: 20, 2027: 40, 2028: 50, 2029: 70, 2030: 80 } },
  { id: 18, category: 'Фильтры для двигателей внутреннего сгорания',                        rates: { 2025: 10, 2026: 20, 2027: 40, 2028: 50, 2029: 70, 2030: 80 } },
  { id: 19, category: 'Упаковка из полимерных материалов, не содержащих галогены',           rates: { 2025: 10, 2026: 20, 2027: 40, 2028: 50, 2029: 70, 2030: 80 } },
  { id: 20, category: 'Упаковка из полимерных материалов, содержащих галоген',               rates: { 2025: 10, 2026: 20, 2027: 40, 2028: 50, 2029: 70, 2030: 80 } },
  { id: 21, category: 'Упаковка из комбинированных материалов',                             rates: { 2025: 10, 2026: 20, 2027: 40, 2028: 50, 2029: 70, 2030: 80 } },
  { id: 22, category: 'Упаковка из гофрированного картона',                                 rates: { 2025: 10, 2026: 20, 2027: 40, 2028: 50, 2029: 70, 2030: 80 } },
  { id: 23, category: 'Упаковка из бумаги и негофрированного картона',                      rates: { 2025: 10, 2026: 20, 2027: 40, 2028: 50, 2029: 70, 2030: 80 } },
  { id: 24, category: 'Упаковка стеклянная',                                                rates: { 2025: 10, 2026: 20, 2027: 40, 2028: 50, 2029: 70, 2030: 80 } },
]

// Utility fee rates by 24 product groups (РОП)
interface FeeRateGroup {
  groupLetter: string
  groupTitle: string
  items: {
    id: number
    name: string
    rate: number
    unit: string
    effectiveDate: string
  }[]
}

// Ставки импортируются из единого источника data/rates.ts (ПКМ КР №730)
const feeRateGroups = computed<FeeRateGroup[]>(() => [
  {
    groupLetter: 'А',
    groupTitle: t('businessNorms.groupA'),
    items: [
      { id: 1, name: 'Изделия из гофрированной бумаги/картона', rate: getRateByGroup(1), unit: t('businessNorms.somPerTon'), effectiveDate: '01.01.2025' },
      { id: 2, name: 'Изделия из негофрированной бумаги/картона', rate: getRateByGroup(2), unit: t('businessNorms.somPerTon'), effectiveDate: '01.01.2025' },
    ],
  },
  {
    groupLetter: 'Б',
    groupTitle: t('businessNorms.groupB'),
    items: [
      { id: 3, name: 'Масла', rate: getRateByGroup(3), unit: t('businessNorms.somPerTon'), effectiveDate: '01.01.2025' },
      { id: 4, name: 'Шины, покрышки и камеры резиновые', rate: getRateByGroup(4), unit: t('businessNorms.somPerTon'), effectiveDate: '01.01.2025' },
      { id: 5, name: 'Изделия из резины (за исключением шин)', rate: getRateByGroup(5), unit: t('businessNorms.somPerTon'), effectiveDate: '01.01.2025' },
    ],
  },
  {
    groupLetter: 'В',
    groupTitle: t('businessNorms.groupV'),
    items: [
      { id: 6, name: 'Изделия пластмассовые упаковочные', rate: getRateByGroup(6), unit: t('businessNorms.somPerTon'), effectiveDate: '01.01.2025' },
      { id: 7, name: 'Изделия пластмассовые прочие', rate: getRateByGroup(7), unit: t('businessNorms.somPerTon'), effectiveDate: '01.01.2025' },
      { id: 8, name: 'Стекло полое', rate: getRateByGroup(8), unit: t('businessNorms.somPerTon'), effectiveDate: '01.01.2025' },
    ],
  },
  {
    groupLetter: 'Г',
    groupTitle: t('businessNorms.groupG'),
    items: [
      { id: 9, name: 'Компьютеры и периферийное оборудование', rate: getRateByGroup(9), unit: t('businessNorms.somPerTon'), effectiveDate: '01.01.2025' },
      { id: 10, name: 'Мониторы, приёмники телевизионные', rate: getRateByGroup(10), unit: t('businessNorms.somPerTon'), effectiveDate: '01.01.2025' },
      { id: 11, name: 'Элементы первичные и батареи', rate: getRateByGroup(11), unit: t('businessNorms.somPerTon'), effectiveDate: '01.01.2025' },
      { id: 12, name: 'Аккумуляторы свинцовые', rate: getRateByGroup(12), unit: t('businessNorms.somPerTon'), effectiveDate: '01.01.2025' },
      { id: 13, name: 'Батареи аккумуляторные', rate: getRateByGroup(13), unit: t('businessNorms.somPerTon'), effectiveDate: '01.01.2025' },
      { id: 14, name: 'Оборудование электрическое осветительное', rate: getRateByGroup(14), unit: t('businessNorms.somPerTon'), effectiveDate: '01.01.2025' },
    ],
  },
  {
    groupLetter: 'Д',
    groupTitle: t('businessNorms.groupD'),
    items: [
      { id: 15, name: 'Техника бытовая крупная', rate: getRateByGroup(15), unit: t('businessNorms.somPerTon'), effectiveDate: '01.01.2025' },
      { id: 16, name: 'Техника бытовая мелкая, инструмент ручной', rate: getRateByGroup(16), unit: t('businessNorms.somPerTon'), effectiveDate: '01.01.2025' },
      { id: 17, name: 'Оборудование холодильное и вентиляционное', rate: getRateByGroup(17), unit: t('businessNorms.somPerTon'), effectiveDate: '01.01.2025' },
      { id: 18, name: 'Фильтры для двигателей внутреннего сгорания', rate: getRateByGroup(18), unit: t('businessNorms.somPerTon'), effectiveDate: '01.01.2025' },
    ],
  },
  {
    groupLetter: 'Е',
    groupTitle: t('businessNorms.groupE'),
    items: [
      { id: 19, name: 'Упаковка из полимерных материалов (без галогенов)', rate: getRateByGroup(19), unit: t('businessNorms.somPerTon'), effectiveDate: '01.01.2025' },
      { id: 20, name: 'Упаковка из полимерных материалов (с галогеном)', rate: getRateByGroup(20), unit: t('businessNorms.somPerTon'), effectiveDate: '01.01.2025' },
      { id: 21, name: 'Упаковка из комбинированных материалов', rate: getRateByGroup(21), unit: t('businessNorms.somPerTon'), effectiveDate: '01.01.2025' },
      { id: 22, name: 'Упаковка из гофрированного картона', rate: getRateByGroup(22), unit: t('businessNorms.somPerTon'), effectiveDate: '01.01.2025' },
      { id: 23, name: 'Упаковка из бумаги и негофрированного картона', rate: getRateByGroup(23), unit: t('businessNorms.somPerTon'), effectiveDate: '01.01.2025' },
      { id: 24, name: 'Упаковка стеклянная', rate: getRateByGroup(24), unit: t('businessNorms.somPerTon'), effectiveDate: '01.01.2025' },
    ],
  },
])

const getRateColorClass = (rate: number) => {
  if (rate >= 60) return 'text-red-600'
  if (rate >= 30) return 'text-orange-600'
  return 'text-green-600'
}
</script>

<template>
  <DashboardLayout
    role="business"
    :roleTitle="roleTitle"
    userName="ОсОО «ТехПром»"
    :menuItems="menuItems"
  >
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold text-gray-900">{{ $t('businessNorms.pageTitle') }}</h1>
        <p class="text-gray-600 mt-1">{{ $t('businessNorms.pageSubtitle') }}</p>
      </div>

      <!-- CTA Banner -->
      <div class="bg-gradient-to-r from-[#0e888d] to-[#0b6d71] rounded-2xl p-6 text-white">
        <div class="flex items-start gap-4">
          <div class="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h2 class="text-xl font-bold">{{ $t('businessNorms.bannerTitle', { year: currentYear }) }}</h2>
            <p class="text-white/80 mt-1 max-w-2xl">
              {{ $t('businessNorms.bannerDesc') }}
            </p>
            <div class="flex items-center gap-4 mt-4">
              <router-link to="/legislation" class="inline-flex items-center gap-2 px-4 py-2 bg-white text-[#0e888d] rounded-lg font-medium hover:bg-gray-100 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                {{ $t('businessNorms.legislation') }}
              </router-link>
              <router-link to="/business/calculator" class="inline-flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                {{ $t('businessNorms.calculateFee') }}
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-1 inline-flex">
        <button
          @click="activeTab = 'norms'"
          :class="[
            'px-5 py-2.5 rounded-lg font-medium transition-colors text-sm',
            activeTab === 'norms'
              ? 'bg-[#0e888d] text-white'
              : 'text-gray-600 hover:bg-gray-100'
          ]"
        >
          {{ $t('businessNorms.tabNorms') }}
        </button>
        <button
          @click="activeTab = 'rates'"
          :class="[
            'px-5 py-2.5 rounded-lg font-medium transition-colors text-sm',
            activeTab === 'rates'
              ? 'bg-[#0e888d] text-white'
              : 'text-gray-600 hover:bg-gray-100'
          ]"
        >
          {{ $t('businessNorms.tabRates') }}
        </button>
      </div>

      <!-- Table: Unified 24-group norms -->
      <div v-if="activeTab === 'norms'" class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 class="text-lg font-semibold text-gray-900">{{ $t('businessNorms.normsTableTitle') }}</h3>
          <p class="text-sm text-gray-500 mt-1">{{ $t('businessNorms.normsTableDesc') }}</p>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full min-w-[700px]">
            <thead>
              <tr class="bg-[#0e888d] text-white">
                <th class="px-3 py-4 text-center text-sm font-semibold w-12">№</th>
                <th class="px-4 py-4 text-left text-sm font-semibold">{{ $t('businessNorms.productCategory') }}</th>
                <th
                  v-for="year in years"
                  :key="year"
                  class="px-4 py-4 text-center text-sm font-semibold"
                  :class="year === currentYear ? 'bg-[#0b6d71] ring-2 ring-white/50' : ''"
                >
                  {{ year }}
                  <span v-if="year === currentYear" class="block text-xs font-normal opacity-80">{{ $t('businessNorms.current') }}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, index) in norms"
                :key="item.id"
                :class="index % 2 === 0 ? 'bg-white' : 'bg-gray-50'"
                class="hover:bg-[#0e888d]/5 transition-colors"
              >
                <td class="px-3 py-3 text-center text-sm text-gray-500 font-mono">{{ item.id }}</td>
                <td class="px-4 py-3 text-sm font-medium text-gray-900">{{ item.category }}</td>
                <td
                  v-for="year in years"
                  :key="year"
                  class="px-4 py-3 text-center"
                  :class="year === currentYear ? 'bg-[#0e888d]/10 font-bold' : ''"
                >
                  <span :class="getRateColorClass(item.rates[year])" class="font-semibold">
                    {{ item.rates[year] }}%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Table: Utility Fee Rates (24 groups) -->
      <div v-if="activeTab === 'rates'" class="space-y-5">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 class="text-lg font-semibold text-gray-900">{{ $t('businessNorms.ratesTableTitle') }}</h3>
            <p class="text-sm text-gray-500 mt-1">{{ $t('businessNorms.ratesTableDesc') }}</p>
          </div>
        </div>

        <div v-for="group in feeRateGroups" :key="group.groupLetter" class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <!-- Group header -->
          <div class="px-6 py-3 bg-[#e8f5f5] border-b border-[#d1e7e8] flex items-center gap-3">
            <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#0e888d] text-white text-sm font-bold">{{ group.groupLetter }}</span>
            <span class="font-semibold text-[#0e888d]">{{ $t('businessNorms.groupLabel') }} {{ group.groupLetter }} — {{ group.groupTitle }}</span>
          </div>
          <!-- Group table -->
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="bg-gray-50 border-b border-gray-200">
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">№</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{{ $t('businessNorms.productGroupCol') }}</th>
                  <th class="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">{{ $t('businessNorms.rateCol') }}</th>
                  <th class="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">{{ $t('businessNorms.unitCol') }}</th>
                  <th class="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">{{ $t('businessNorms.effectiveDateCol') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(item, index) in group.items"
                  :key="item.id"
                  :class="index % 2 === 0 ? 'bg-white' : 'bg-gray-50'"
                  class="hover:bg-[#0e888d]/5 transition-colors"
                >
                  <td class="px-6 py-3 text-sm text-gray-500 font-mono">{{ item.id }}</td>
                  <td class="px-6 py-3 text-sm font-medium text-gray-900">{{ item.name }}</td>
                  <td class="px-6 py-3 text-sm font-bold text-right text-[#0e888d]">{{ item.rate.toLocaleString() }}</td>
                  <td class="px-6 py-3 text-sm text-gray-500 text-center">{{ item.unit }}</td>
                  <td class="px-6 py-3 text-sm text-gray-500 text-center">{{ item.effectiveDate }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Note -->
        <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <div class="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p class="font-medium text-gray-900">{{ $t('businessNorms.calcProcedure') }}</p>
            <p class="text-sm text-gray-600 mt-1">
              {{ $t('businessNorms.calcFormula') }}
              {{ $t('businessNorms.useCalc1') }} <router-link to="/business/calculator" class="text-[#0e888d] font-medium hover:underline">{{ $t('businessNorms.feeCalculator') }}</router-link> {{ $t('businessNorms.useCalc2') }}
            </p>
          </div>
        </div>
      </div>

      <!-- Example Calculation Block (shown for norms tab) -->
      <template v-if="activeTab === 'norms'">
        <div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-amber-200 bg-amber-100/50">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900">{{ $t('businessNorms.exampleTitle') }}</h3>
                <p class="text-sm text-gray-600">{{ $t('businessNorms.exampleSubtitle') }}</p>
              </div>
            </div>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div class="space-y-3">
                <h4 class="font-semibold text-gray-900 mb-4">{{ $t('businessNorms.initialData') }}:</h4>
                <div class="flex justify-between py-2 border-b border-amber-200/50">
                  <span class="text-gray-600">{{ $t('businessNorms.category') }}:</span>
                  <span class="font-medium text-gray-900">{{ $t('businessNorms.exCategory') }}</span>
                </div>
                <div class="flex justify-between py-2 border-b border-amber-200/50">
                  <span class="text-gray-600">{{ $t('businessNorms.batchMass') }}:</span>
                  <span class="font-medium text-gray-900">{{ $t('businessNorms.exMass') }}</span>
                </div>
                <div class="flex justify-between py-2 border-b border-amber-200/50">
                  <span class="text-gray-600">{{ $t('businessNorms.calcYear') }}:</span>
                  <span class="font-medium text-gray-900">2026</span>
                </div>
                <div class="flex justify-between py-2 border-b border-amber-200/50">
                  <span class="text-gray-600">{{ $t('businessNorms.operation') }}:</span>
                  <span class="font-medium text-gray-900">{{ $t('businessNorms.importOp') }}</span>
                </div>
                <div class="flex justify-between py-2 border-b border-amber-200/50">
                  <span class="text-gray-600">{{ $t('businessNorms.rateLabel') }} (С<sub>ус</sub>):</span>
                  <span class="font-medium text-gray-900">{{ $t('businessNorms.exRate') }}</span>
                </div>
                <div class="flex justify-between py-2 border-b border-amber-200/50">
                  <span class="text-gray-600">{{ $t('businessNorms.recyclingNorm') }} (2026):</span>
                  <span class="font-medium text-[#0e888d]">30%</span>
                </div>
                <div class="flex justify-between py-2">
                  <span class="text-gray-600">{{ $t('businessNorms.coefficient') }} (Н<sub>пер</sub>):</span>
                  <span class="font-medium text-gray-900">1 − 0,30 = <strong>0,70</strong></span>
                </div>
              </div>
              <div class="bg-white rounded-xl p-5 border border-amber-200">
                <h4 class="font-semibold text-gray-900 mb-4">{{ $t('businessNorms.calculation') }}:</h4>
                <div class="space-y-4">
                  <div class="p-4 bg-gray-50 rounded-lg font-mono text-sm">
                    <p class="text-gray-600 mb-2">{{ $t('businessNorms.formula') }}:</p>
                    <p class="text-gray-900 font-semibold">У<sub>сб</sub> = С<sub>ус</sub> × М × Н<sub>пер</sub></p>
                  </div>
                  <div class="p-4 bg-[#0e888d]/10 rounded-lg font-mono text-sm">
                    <p class="text-gray-600 mb-2">{{ $t('businessNorms.substituteValues') }}:</p>
                    <p class="text-gray-900">У<sub>сб</sub> = 12 345 × 5 × 0,70</p>
                  </div>
                  <div class="p-4 bg-[#0e888d] text-white rounded-lg text-center">
                    <p class="text-sm opacity-80 mb-1">{{ $t('businessNorms.totalToPay') }}:</p>
                    <p class="text-2xl font-bold">43 207,50 {{ $t('businessNorms.som') }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Note about Nper -->
        <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <div class="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p class="font-medium text-gray-900">{{ $t('businessNorms.nperFormulaTitle') }}</p>
            <p class="text-sm text-gray-600 mt-1">
              {{ $t('businessNorms.nperFormulaDesc') }}
              <br/>
              <span class="text-gray-500">{{ $t('businessNorms.nperExample') }}</span>
            </p>
          </div>
        </div>
      </template>

      <!-- Info cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-gradient-to-br from-[#0e888d]/10 to-[#0e888d]/5 rounded-xl p-5 border border-[#0e888d]/20">
          <div class="w-10 h-10 bg-[#0e888d] rounded-lg flex items-center justify-center mb-3">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h4 class="font-semibold text-gray-900 mb-1">{{ $t('businessNorms.infoCard1Title') }}</h4>
          <p class="text-sm text-gray-600">
            {{ $t('businessNorms.infoCard1Desc') }}
          </p>
        </div>

        <div class="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-5 border border-amber-200">
          <div class="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center mb-3">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h4 class="font-semibold text-gray-900 mb-1">{{ $t('businessNorms.infoCard2Title') }}</h4>
          <p class="text-sm text-gray-600">
            {{ $t('businessNorms.infoCard2Desc') }}
          </p>
        </div>

        <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border border-green-200">
          <div class="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mb-3">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h4 class="font-semibold text-gray-900 mb-1">{{ $t('businessNorms.infoCard3Title') }}</h4>
          <p class="text-sm text-gray-600">
            {{ $t('businessNorms.infoCard3Desc') }}
          </p>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>
