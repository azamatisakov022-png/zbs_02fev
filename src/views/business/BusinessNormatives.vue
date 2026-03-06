<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import { useAccountStore } from '../../stores/account'
import { useBusinessMenu } from '../../composables/useRoleMenu'
import { getRateByGroup } from '../../data/rates'
import { AppTabs, AppPageHeader } from '../../components/ui'
import NormsTable from './components/normatives/NormsTable.vue'
import RatesTab from './components/normatives/RatesTab.vue'
import CalculationExample from './components/normatives/CalculationExample.vue'
import InfoCards from './components/normatives/InfoCards.vue'

const { t } = useI18n()
const { roleTitle, menuItems } = useBusinessMenu()
const accountStore = useAccountStore()

onMounted(() => { accountStore.fetchAll() })

const currentYear = 2026
const years = [2025, 2026, 2027, 2028, 2029, 2030]

const activeTab = ref<'norms' | 'rates'>('norms')

const tabItems = computed(() => [
  { key: 'norms', label: t('businessNorms.tabNorms') },
  { key: 'rates', label: t('businessNorms.tabRates') },
])

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
</script>

<template>
  <DashboardLayout
    role="business"
    :roleTitle="roleTitle"
    :userName="accountStore.myAccount?.company || ''"
    :menuItems="menuItems"
  >
    <div class="bn-page">
      <AppPageHeader :title="$t('businessNorms.pageTitle')" :subtitle="$t('businessNorms.pageSubtitle')" subtitleSize="22px" subtitleColor="#4b5563" titleColor="#111827" />

      <div class="bn-banner">
        <div class="bn-banner-inner">
          <div class="bn-banner-icon">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h2 class="bn-banner-title">{{ $t('businessNorms.bannerTitle', { year: currentYear }) }}</h2>
            <p class="bn-banner-desc">{{ $t('businessNorms.bannerDesc') }}</p>
            <div class="bn-banner-links">
              <router-link to="/legislation" class="bn-link-primary">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                {{ $t('businessNorms.legislation') }}
              </router-link>
              <router-link to="/business/calculator" class="bn-link-secondary">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                {{ $t('businessNorms.calculateFee') }}
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <AppTabs v-model="activeTab" :tabs="tabItems" activeBg="#0e888d" />

      <NormsTable
        v-if="activeTab === 'norms'"
        :norms="norms"
        :years="years"
        :currentYear="currentYear"
      />

      <RatesTab
        v-if="activeTab === 'rates'"
        :feeRateGroups="feeRateGroups"
      />

      <template v-if="activeTab === 'norms'">
        <CalculationExample />
      </template>

      <InfoCards />
    </div>
  </DashboardLayout>
</template>

<style scoped>
.bn-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.bn-banner {
  background: linear-gradient(to right, #0e888d, #0b6d71);
  border-radius: 16px;
  padding: 24px;
  color: #fff;
}
.bn-banner-inner {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}
.bn-banner-icon {
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.bn-banner-title {
  font-size: 26px;
  font-weight: 700;
}
.bn-banner-desc {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 4px;
  max-width: 42rem;
}
.bn-banner-links {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 16px;
}
.bn-link-primary {
  font-size: 21px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 500;
  background: #fff;
  color: #0e888d;
  transition: background-color 0.15s;
}
.bn-link-primary:hover {
  background: #f3f4f6;
}
.bn-link-secondary {
  font-size: 21px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  border-radius: 8px;
  font-weight: 500;
  transition: background-color 0.15s;
}
.bn-link-secondary:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
