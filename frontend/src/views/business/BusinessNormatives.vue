<script setup lang="ts">
import { ref } from 'vue'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import { useBusinessMenu } from '../../composables/useRoleMenu'
import { UTILIZATION_RATES_2025, getRateByGroup } from '../../data/rates'

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
const feeRateGroups: FeeRateGroup[] = [
  {
    groupLetter: 'А',
    groupTitle: 'Бумага и картон',
    items: [
      { id: 1, name: 'Изделия из гофрированной бумаги/картона', rate: getRateByGroup(1), unit: 'сом/тонна', effectiveDate: '01.01.2025' },
      { id: 2, name: 'Изделия из негофрированной бумаги/картона', rate: getRateByGroup(2), unit: 'сом/тонна', effectiveDate: '01.01.2025' },
    ],
  },
  {
    groupLetter: 'Б',
    groupTitle: 'Масла, шины и резина',
    items: [
      { id: 3, name: 'Масла', rate: getRateByGroup(3), unit: 'сом/тонна', effectiveDate: '01.01.2025' },
      { id: 4, name: 'Шины, покрышки и камеры резиновые', rate: getRateByGroup(4), unit: 'сом/тонна', effectiveDate: '01.01.2025' },
      { id: 5, name: 'Изделия из резины (за исключением шин)', rate: getRateByGroup(5), unit: 'сом/тонна', effectiveDate: '01.01.2025' },
    ],
  },
  {
    groupLetter: 'В',
    groupTitle: 'Пластмассы и стекло',
    items: [
      { id: 6, name: 'Изделия пластмассовые упаковочные', rate: getRateByGroup(6), unit: 'сом/тонна', effectiveDate: '01.01.2025' },
      { id: 7, name: 'Изделия пластмассовые прочие', rate: getRateByGroup(7), unit: 'сом/тонна', effectiveDate: '01.01.2025' },
      { id: 8, name: 'Стекло полое', rate: getRateByGroup(8), unit: 'сом/тонна', effectiveDate: '01.01.2025' },
    ],
  },
  {
    groupLetter: 'Г',
    groupTitle: 'Электроника и оборудование',
    items: [
      { id: 9, name: 'Компьютеры и периферийное оборудование', rate: getRateByGroup(9), unit: 'сом/тонна', effectiveDate: '01.01.2025' },
      { id: 10, name: 'Мониторы, приёмники телевизионные', rate: getRateByGroup(10), unit: 'сом/тонна', effectiveDate: '01.01.2025' },
      { id: 11, name: 'Элементы первичные и батареи', rate: getRateByGroup(11), unit: 'сом/тонна', effectiveDate: '01.01.2025' },
      { id: 12, name: 'Аккумуляторы свинцовые', rate: getRateByGroup(12), unit: 'сом/тонна', effectiveDate: '01.01.2025' },
      { id: 13, name: 'Батареи аккумуляторные', rate: getRateByGroup(13), unit: 'сом/тонна', effectiveDate: '01.01.2025' },
      { id: 14, name: 'Оборудование электрическое осветительное', rate: getRateByGroup(14), unit: 'сом/тонна', effectiveDate: '01.01.2025' },
    ],
  },
  {
    groupLetter: 'Д',
    groupTitle: 'Бытовая техника и фильтры',
    items: [
      { id: 15, name: 'Техника бытовая крупная', rate: getRateByGroup(15), unit: 'сом/тонна', effectiveDate: '01.01.2025' },
      { id: 16, name: 'Техника бытовая мелкая, инструмент ручной', rate: getRateByGroup(16), unit: 'сом/тонна', effectiveDate: '01.01.2025' },
      { id: 17, name: 'Оборудование холодильное и вентиляционное', rate: getRateByGroup(17), unit: 'сом/тонна', effectiveDate: '01.01.2025' },
      { id: 18, name: 'Фильтры для двигателей внутреннего сгорания', rate: getRateByGroup(18), unit: 'сом/тонна', effectiveDate: '01.01.2025' },
    ],
  },
  {
    groupLetter: 'Е',
    groupTitle: 'Упаковка',
    items: [
      { id: 19, name: 'Упаковка из полимерных материалов (без галогенов)', rate: getRateByGroup(19), unit: 'сом/тонна', effectiveDate: '01.01.2025' },
      { id: 20, name: 'Упаковка из полимерных материалов (с галогеном)', rate: getRateByGroup(20), unit: 'сом/тонна', effectiveDate: '01.01.2025' },
      { id: 21, name: 'Упаковка из комбинированных материалов', rate: getRateByGroup(21), unit: 'сом/тонна', effectiveDate: '01.01.2025' },
      { id: 22, name: 'Упаковка из гофрированного картона', rate: getRateByGroup(22), unit: 'сом/тонна', effectiveDate: '01.01.2025' },
      { id: 23, name: 'Упаковка из бумаги и негофрированного картона', rate: getRateByGroup(23), unit: 'сом/тонна', effectiveDate: '01.01.2025' },
      { id: 24, name: 'Упаковка стеклянная', rate: getRateByGroup(24), unit: 'сом/тонна', effectiveDate: '01.01.2025' },
    ],
  },
]

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
        <h1 class="text-2xl font-bold text-gray-900">Нормативы и ставки</h1>
        <p class="text-gray-600 mt-1">Нормативы утилизации и ставки утилизационного сбора по 24 группам товаров (ПКМ КР №322)</p>
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
            <h2 class="text-xl font-bold">Нормативы и ставки на {{ currentYear }} год</h2>
            <p class="text-white/80 mt-1 max-w-2xl">
              Проценты обязательной переработки и ставки утилизационного сбора согласно постановлению КМ КР №322.
            </p>
            <div class="flex items-center gap-4 mt-4">
              <router-link to="/legislation" class="inline-flex items-center gap-2 px-4 py-2 bg-white text-[#0e888d] rounded-lg font-medium hover:bg-gray-100 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Законодательство
              </router-link>
              <router-link to="/business/calculator" class="inline-flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Рассчитать сбор
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
          Нормативы утилизации
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
          Ставки утильсбора
        </button>
      </div>

      <!-- Table: Unified 24-group norms -->
      <div v-if="activeTab === 'norms'" class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 class="text-lg font-semibold text-gray-900">Нормативы переработки отходов от использования товаров (2025–2030)</h3>
          <p class="text-sm text-gray-500 mt-1">Минимальный процент товаров, который должен быть переработан от общего объёма</p>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full min-w-[700px]">
            <thead>
              <tr class="bg-[#0e888d] text-white">
                <th class="px-3 py-4 text-center text-sm font-semibold w-12">№</th>
                <th class="px-4 py-4 text-left text-sm font-semibold">Категория товара</th>
                <th
                  v-for="year in years"
                  :key="year"
                  class="px-4 py-4 text-center text-sm font-semibold"
                  :class="year === currentYear ? 'bg-[#0b6d71] ring-2 ring-white/50' : ''"
                >
                  {{ year }}
                  <span v-if="year === currentYear" class="block text-xs font-normal opacity-80">текущий</span>
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
            <h3 class="text-lg font-semibold text-gray-900">Ставки утилизационного сбора по 24 группам товаров РОП</h3>
            <p class="text-sm text-gray-500 mt-1">Согласно постановлению Кабинета Министров КР №322</p>
          </div>
        </div>

        <div v-for="group in feeRateGroups" :key="group.groupLetter" class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <!-- Group header -->
          <div class="px-6 py-3 bg-[#e8f5f5] border-b border-[#d1e7e8] flex items-center gap-3">
            <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#0e888d] text-white text-sm font-bold">{{ group.groupLetter }}</span>
            <span class="font-semibold text-[#0e888d]">ГРУППА {{ group.groupLetter }} — {{ group.groupTitle }}</span>
          </div>
          <!-- Group table -->
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="bg-gray-50 border-b border-gray-200">
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">№</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Группа товаров</th>
                  <th class="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Ставка</th>
                  <th class="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Ед. измерения</th>
                  <th class="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Дата вступления в силу</th>
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
            <p class="font-medium text-gray-900">Порядок расчёта</p>
            <p class="text-sm text-gray-600 mt-1">
              Утилизационный сбор = Ставка x Масса (кол-во) x Коэффициент Н<sub>пер</sub>.
              Используйте <router-link to="/business/calculator" class="text-[#0e888d] font-medium hover:underline">калькулятор утильсбора</router-link> для автоматического расчёта.
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
                <h3 class="text-lg font-semibold text-gray-900">Пример расчёта утилизационного сбора</h3>
                <p class="text-sm text-gray-600">Импорт шин (группа №4)</p>
              </div>
            </div>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div class="space-y-3">
                <h4 class="font-semibold text-gray-900 mb-4">Исходные данные:</h4>
                <div class="flex justify-between py-2 border-b border-amber-200/50">
                  <span class="text-gray-600">Категория:</span>
                  <span class="font-medium text-gray-900">Шины, покрышки и камеры резиновые (№4)</span>
                </div>
                <div class="flex justify-between py-2 border-b border-amber-200/50">
                  <span class="text-gray-600">Масса партии:</span>
                  <span class="font-medium text-gray-900">5 тонн</span>
                </div>
                <div class="flex justify-between py-2 border-b border-amber-200/50">
                  <span class="text-gray-600">Год расчёта:</span>
                  <span class="font-medium text-gray-900">2026</span>
                </div>
                <div class="flex justify-between py-2 border-b border-amber-200/50">
                  <span class="text-gray-600">Операция:</span>
                  <span class="font-medium text-gray-900">Импорт</span>
                </div>
                <div class="flex justify-between py-2 border-b border-amber-200/50">
                  <span class="text-gray-600">Ставка (С<sub>ус</sub>):</span>
                  <span class="font-medium text-gray-900">12 345 сом/тонна</span>
                </div>
                <div class="flex justify-between py-2 border-b border-amber-200/50">
                  <span class="text-gray-600">Норматив переработки (2026):</span>
                  <span class="font-medium text-[#0e888d]">30%</span>
                </div>
                <div class="flex justify-between py-2">
                  <span class="text-gray-600">Коэффициент (Н<sub>пер</sub>):</span>
                  <span class="font-medium text-gray-900">1 − 0,30 = <strong>0,70</strong></span>
                </div>
              </div>
              <div class="bg-white rounded-xl p-5 border border-amber-200">
                <h4 class="font-semibold text-gray-900 mb-4">Расчёт:</h4>
                <div class="space-y-4">
                  <div class="p-4 bg-gray-50 rounded-lg font-mono text-sm">
                    <p class="text-gray-600 mb-2">Формула:</p>
                    <p class="text-gray-900 font-semibold">У<sub>сб</sub> = С<sub>ус</sub> × М × Н<sub>пер</sub></p>
                  </div>
                  <div class="p-4 bg-[#0e888d]/10 rounded-lg font-mono text-sm">
                    <p class="text-gray-600 mb-2">Подставляем значения:</p>
                    <p class="text-gray-900">У<sub>сб</sub> = 12 345 × 5 × 0,70</p>
                  </div>
                  <div class="p-4 bg-[#0e888d] text-white rounded-lg text-center">
                    <p class="text-sm opacity-80 mb-1">Итого к оплате:</p>
                    <p class="text-2xl font-bold">43 207,50 сом</p>
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
            <p class="font-medium text-gray-900">Формула расчёта коэффициента Н<sub>пер</sub></p>
            <p class="text-sm text-gray-600 mt-1">
              Значение Н<sub>пер</sub> для расчёта = 1 − (норматив в процентах / 100).
              <br/>
              <span class="text-gray-500">Например, для шин в 2026 году: Н<sub>пер</sub> = 1 − 0,30 = <strong>0,70</strong></span>
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
          <h4 class="font-semibold text-gray-900 mb-1">Что такое норматив?</h4>
          <p class="text-sm text-gray-600">
            Минимальный процент товаров или упаковки, который должен быть переработан от общего объёма
          </p>
        </div>

        <div class="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-5 border border-amber-200">
          <div class="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center mb-3">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h4 class="font-semibold text-gray-900 mb-1">Ежегодный рост</h4>
          <p class="text-sm text-gray-600">
            Нормативы увеличиваются ежегодно согласно плану достижения целевых показателей к 2030 году (80%)
          </p>
        </div>

        <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border border-green-200">
          <div class="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mb-3">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h4 class="font-semibold text-gray-900 mb-1">Как выполнить?</h4>
          <p class="text-sm text-gray-600">
            Заключите договоры с лицензированными переработчиками или уплатите утилизационный сбор
          </p>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>
