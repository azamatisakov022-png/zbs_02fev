<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import { useAdminMenu } from '../../composables/useRoleMenu'
import { UTILIZATION_RATES_2025 } from '../../data/rates'

const { t } = useI18n()
const { roleTitle, menuItems } = useAdminMenu()

// --- Types ---
interface WasteType {
  id: number
  code: string
  name: string
  hazardClass: number
  unit: string
}

interface ProductGroup {
  id: number
  code: string
  name: string
  rate: number
}

interface Region {
  id: number
  code: string
  name: string
  type: string
}

interface MeasureUnit {
  id: number
  code: string
  name: string
  abbreviation: string
}

interface ActivityType {
  id: number
  codeOKED: string
  name: string
  category: string
}

interface Currency {
  id: number
  isoCode: string
  name: string
  rateToSom: number
  updatedAt: string
}

type ReferenceItem = WasteType | ProductGroup | Region | MeasureUnit | ActivityType | Currency

// --- Reference type definitions ---
interface ReferenceType {
  id: string
  title: string
  icon: string
  count: number
  countLabel: string
  fields: string[]
  fieldKeys: string[]
  fieldPlaceholders: string[]
}

const refIcons: Record<string, string> = {
  waste: '<svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>',
  products: '<svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>',
  regions: '<svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>',
  units: '<svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>',
  activities: '<svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>',
  currencies: '<svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>',
}

const refFieldKeysMap: Record<string, string[]> = {
  waste: ['code', 'name', 'hazardClass', 'unit'],
  products: ['code', 'name', 'rate'],
  regions: ['code', 'name', 'type'],
  units: ['code', 'name', 'abbreviation'],
  activities: ['codeOKED', 'name', 'category'],
  currencies: ['isoCode', 'name', 'rateToSom', 'updatedAt'],
}

const refCounts: Record<string, number> = {
  waste: 45, products: 28, regions: 9, units: 12, activities: 18, currencies: 5,
}

const refLocaleKeys: Record<string, { title: string; countLabel: string; fields: string[]; placeholders: string[] }> = {
  waste: {
    title: 'adminRefs.refWasteTitle',
    countLabel: 'adminRefs.refWasteCountLabel',
    fields: ['adminRefs.refWasteField1', 'adminRefs.refWasteField2', 'adminRefs.refWasteField3', 'adminRefs.refWasteField4'],
    placeholders: ['adminRefs.refWastePh1', 'adminRefs.refWastePh2', 'adminRefs.refWastePh3', 'adminRefs.refWastePh4'],
  },
  products: {
    title: 'adminRefs.refProductsTitle',
    countLabel: 'adminRefs.refProductsCountLabel',
    fields: ['adminRefs.refProductsField1', 'adminRefs.refProductsField2', 'adminRefs.refProductsField3'],
    placeholders: ['adminRefs.refProductsPh1', 'adminRefs.refProductsPh2', 'adminRefs.refProductsPh3'],
  },
  regions: {
    title: 'adminRefs.refRegionsTitle',
    countLabel: 'adminRefs.refRegionsCountLabel',
    fields: ['adminRefs.refRegionsField1', 'adminRefs.refRegionsField2', 'adminRefs.refRegionsField3'],
    placeholders: ['adminRefs.refRegionsPh1', 'adminRefs.refRegionsPh2', 'adminRefs.refRegionsPh3'],
  },
  units: {
    title: 'adminRefs.refUnitsTitle',
    countLabel: 'adminRefs.refUnitsCountLabel',
    fields: ['adminRefs.refUnitsField1', 'adminRefs.refUnitsField2', 'adminRefs.refUnitsField3'],
    placeholders: ['adminRefs.refUnitsPh1', 'adminRefs.refUnitsPh2', 'adminRefs.refUnitsPh3'],
  },
  activities: {
    title: 'adminRefs.refActivitiesTitle',
    countLabel: 'adminRefs.refActivitiesCountLabel',
    fields: ['adminRefs.refActivitiesField1', 'adminRefs.refActivitiesField2', 'adminRefs.refActivitiesField3'],
    placeholders: ['adminRefs.refActivitiesPh1', 'adminRefs.refActivitiesPh2', 'adminRefs.refActivitiesPh3'],
  },
  currencies: {
    title: 'adminRefs.refCurrenciesTitle',
    countLabel: 'adminRefs.refCurrenciesCountLabel',
    fields: ['adminRefs.refCurrenciesField1', 'adminRefs.refCurrenciesField2', 'adminRefs.refCurrenciesField3', 'adminRefs.refCurrenciesField4'],
    placeholders: ['adminRefs.refCurrenciesPh1', 'adminRefs.refCurrenciesPh2', 'adminRefs.refCurrenciesPh3', 'adminRefs.refCurrenciesPh4'],
  },
}

const referenceTypes = computed<ReferenceType[]>(() =>
  ['waste', 'products', 'regions', 'units', 'activities', 'currencies'].map(id => {
    const lk = refLocaleKeys[id]
    return {
      id,
      title: t(lk.title),
      icon: refIcons[id],
      count: refCounts[id],
      countLabel: t(lk.countLabel),
      fields: lk.fields.map(k => t(k)),
      fieldKeys: refFieldKeysMap[id],
      fieldPlaceholders: lk.placeholders.map(k => t(k)),
    }
  })
)

// --- Mock data ---
const wasteData = ref<Record<string, any>[]>([
  { id: 1, code: '01.01.01', name: 'Отходы бумаги и картона', hazardClass: 5, unit: 'кг' },
  { id: 2, code: '01.01.02', name: 'Отходы пластиковой упаковки', hazardClass: 4, unit: 'кг' },
  { id: 3, code: '01.02.01', name: 'Отходы стекла тарного', hazardClass: 5, unit: 'кг' },
  { id: 4, code: '02.01.01', name: 'Отходы металлов чёрных', hazardClass: 4, unit: 'т' },
  { id: 5, code: '02.01.02', name: 'Отходы металлов цветных', hazardClass: 3, unit: 'кг' },
  { id: 6, code: '03.01.01', name: 'Отходы древесины необработанной', hazardClass: 5, unit: 'м3' },
  { id: 7, code: '04.01.01', name: 'Отходы нефтепродуктов', hazardClass: 2, unit: 'л' },
  { id: 8, code: '04.02.01', name: 'Отходы химических растворителей', hazardClass: 1, unit: 'л' },
  { id: 9, code: '05.01.01', name: 'Отходы пищевые (органические)', hazardClass: 5, unit: 'кг' },
  { id: 10, code: '05.02.01', name: 'Отходы текстильные (ткани)', hazardClass: 4, unit: 'кг' },
])

// Ставки из единого источника data/rates.ts (ПКМ КР №730, сом/т)
const productsData = ref<Record<string, any>[]>([
  { id: 1, code: 'ГТ-001', name: 'Изделия пластмассовые упаковочные', rate: UTILIZATION_RATES_2025[6] },
  { id: 2, code: 'ГТ-002', name: 'Стекло полое', rate: UTILIZATION_RATES_2025[8] },
  { id: 3, code: 'ГТ-003', name: 'Изделия из гофрированной бумаги/картона', rate: UTILIZATION_RATES_2025[1] },
  { id: 4, code: 'ГТ-004', name: 'Аккумуляторы свинцовые', rate: UTILIZATION_RATES_2025[12] },
  { id: 5, code: 'ГТ-005', name: 'Компьютеры и периферийное оборудование', rate: UTILIZATION_RATES_2025[9] },
  { id: 6, code: 'ГТ-006', name: 'Батареи аккумуляторные', rate: UTILIZATION_RATES_2025[13] },
  { id: 7, code: 'ГТ-007', name: 'Шины, покрышки и камеры резиновые', rate: UTILIZATION_RATES_2025[4] },
  { id: 8, code: 'ГТ-008', name: 'Техника бытовая мелкая, инструмент ручной', rate: UTILIZATION_RATES_2025[16] },
])

const regionsData = ref<Record<string, any>[]>([
  { id: 1, code: 'KG-B', name: 'Бишкек', type: 'город' },
  { id: 2, code: 'KG-O', name: 'Ош', type: 'город' },
  { id: 3, code: 'KG-C', name: 'Чуйская область', type: 'область' },
  { id: 4, code: 'KG-J', name: 'Джалал-Абадская область', type: 'область' },
  { id: 5, code: 'KG-Y', name: 'Ысык-Кёльская область', type: 'область' },
  { id: 6, code: 'KG-N', name: 'Нарынская область', type: 'область' },
  { id: 7, code: 'KG-T', name: 'Таласская область', type: 'область' },
  { id: 8, code: 'KG-BA', name: 'Баткенская область', type: 'область' },
  { id: 9, code: 'KG-OS', name: 'Ошская область', type: 'область' },
])

const unitsData = ref<Record<string, any>[]>([
  { id: 1, code: 'KG', name: 'Килограмм', abbreviation: 'кг' },
  { id: 2, code: 'T', name: 'Тонна', abbreviation: 'т' },
  { id: 3, code: 'L', name: 'Литр', abbreviation: 'л' },
  { id: 4, code: 'PCS', name: 'Штука', abbreviation: 'шт' },
  { id: 5, code: 'M3', name: 'Кубический метр', abbreviation: 'м3' },
  { id: 6, code: 'M2', name: 'Квадратный метр', abbreviation: 'м2' },
  { id: 7, code: 'M', name: 'Метр', abbreviation: 'м' },
  { id: 8, code: 'G', name: 'Грамм', abbreviation: 'г' },
  { id: 9, code: 'ML', name: 'Миллилитр', abbreviation: 'мл' },
  { id: 10, code: 'SET', name: 'Комплект', abbreviation: 'компл' },
])

const activitiesData = ref<Record<string, any>[]>([
  { id: 1, codeOKED: '38.11', name: 'Сбор неопасных отходов', category: 'Обращение с отходами' },
  { id: 2, codeOKED: '38.12', name: 'Сбор опасных отходов', category: 'Обращение с отходами' },
  { id: 3, codeOKED: '38.21', name: 'Обработка и утилизация неопасных отходов', category: 'Переработка' },
  { id: 4, codeOKED: '38.22', name: 'Обработка и утилизация опасных отходов', category: 'Переработка' },
  { id: 5, codeOKED: '38.31', name: 'Демонтаж техники и оборудования', category: 'Демонтаж' },
  { id: 6, codeOKED: '38.32', name: 'Утилизация отсортированных материалов', category: 'Утилизация' },
  { id: 7, codeOKED: '39.00', name: 'Восстановление загрязнённых территорий', category: 'Рекультивация' },
  { id: 8, codeOKED: '46.77', name: 'Оптовая торговля отходами и ломом', category: 'Торговля' },
])

const currenciesData = ref<Record<string, any>[]>([
  { id: 1, isoCode: 'KGS', name: 'Кыргызский сом', rateToSom: 1.00, updatedAt: '13.02.2026' },
  { id: 2, isoCode: 'USD', name: 'Доллар США', rateToSom: 89.45, updatedAt: '13.02.2026' },
  { id: 3, isoCode: 'EUR', name: 'Евро', rateToSom: 96.82, updatedAt: '13.02.2026' },
  { id: 4, isoCode: 'RUB', name: 'Российский рубль', rateToSom: 0.97, updatedAt: '13.02.2026' },
  { id: 5, isoCode: 'KZT', name: 'Казахстанский тенге', rateToSom: 0.18, updatedAt: '13.02.2026' },
])

// --- Data map ---
const dataMap: Record<string, ReturnType<typeof ref<Record<string, any>[]>>> = {
  waste: wasteData,
  products: productsData,
  regions: regionsData,
  units: unitsData,
  activities: activitiesData,
  currencies: currenciesData,
}

// --- Active reference & state ---
const activeReference = ref<string | null>(null)
const searchQuery = ref('')
const editingCell = reactive<{ rowId: number | null; fieldKey: string | null }>({ rowId: null, fieldKey: null })
const editingValue = ref<string>('')
const savingCell = ref(false)
const showAddModal = ref(false)
const addFormData = reactive<Record<string, string>>({})
const addFormErrors = reactive<Record<string, string>>({})
const addSaving = ref(false)
const addSuccess = ref(false)
const deleteConfirmId = ref<number | null>(null)

// --- Computed ---
const activeRefType = computed(() => referenceTypes.value.find(r => r.id === activeReference.value) || null)

const activeData = computed(() => {
  if (!activeReference.value) return []
  const dataRef = dataMap[activeReference.value]
  if (!dataRef) return []
  const data = dataRef.value
  if (!searchQuery.value.trim()) return data
  const q = searchQuery.value.toLowerCase()
  return data.filter((row: Record<string, any>) => {
    return Object.values(row).some(val =>
      String(val).toLowerCase().includes(q)
    )
  })
})

let nextIds: Record<string, number> = {
  waste: 11,
  products: 9,
  regions: 10,
  units: 11,
  activities: 9,
  currencies: 6,
}

// --- Card click handler ---
function selectReference(refId: string) {
  if (activeReference.value === refId) {
    activeReference.value = null
  } else {
    activeReference.value = refId
    searchQuery.value = ''
    cancelEdit()
    deleteConfirmId.value = null
  }
}

// --- Inline editing ---
function startEdit(rowId: number, fieldKey: string, currentValue: any) {
  editingCell.rowId = rowId
  editingCell.fieldKey = fieldKey
  editingValue.value = String(currentValue)
}

function cancelEdit() {
  editingCell.rowId = null
  editingCell.fieldKey = null
  editingValue.value = ''
  savingCell.value = false
}

function saveEdit() {
  if (!activeReference.value || editingCell.rowId === null || !editingCell.fieldKey) return
  savingCell.value = true
  const dataRef = dataMap[activeReference.value]
  const rowId = editingCell.rowId
  const fieldKey = editingCell.fieldKey
  const newValue = editingValue.value

  setTimeout(() => {
    const row = dataRef.value.find((r: Record<string, any>) => r.id === rowId)
    if (row) {
      const original = row[fieldKey]
      if (typeof original === 'number') {
        row[fieldKey] = Number(newValue) || 0
      } else {
        row[fieldKey] = newValue
      }
    }
    savingCell.value = false
    cancelEdit()
  }, 600)
}

// --- Delete row ---
function confirmDelete(rowId: number) {
  deleteConfirmId.value = rowId
}

function cancelDelete() {
  deleteConfirmId.value = null
}

function executeDelete(rowId: number) {
  if (!activeReference.value) return
  const dataRef = dataMap[activeReference.value]
  dataRef.value = dataRef.value.filter((r: Record<string, any>) => r.id !== rowId)
  deleteConfirmId.value = null
}

// --- Add record ---
function openAddModal() {
  if (!activeRefType.value) return
  Object.keys(addFormData).forEach(k => delete addFormData[k])
  Object.keys(addFormErrors).forEach(k => delete addFormErrors[k])
  activeRefType.value.fieldKeys.forEach(key => {
    addFormData[key] = ''
  })
  addSuccess.value = false
  addSaving.value = false
  showAddModal.value = true
}

function closeAddModal() {
  showAddModal.value = false
  addSuccess.value = false
}

function validateAddForm(): boolean {
  Object.keys(addFormErrors).forEach(k => delete addFormErrors[k])
  if (!activeRefType.value) return false
  let valid = true
  activeRefType.value.fieldKeys.forEach((key, index) => {
    if (!addFormData[key] || !addFormData[key].trim()) {
      addFormErrors[key] = t('adminRefs.fieldRequired', { field: activeRefType.value!.fields[index] })
      valid = false
    }
  })
  return valid
}

function submitAddRecord() {
  if (!validateAddForm() || !activeReference.value || !activeRefType.value) return
  addSaving.value = true

  setTimeout(() => {
    const dataRef = dataMap[activeReference.value!]
    const newRow: Record<string, any> = { id: nextIds[activeReference.value!]++ }
    activeRefType.value!.fieldKeys.forEach(key => {
      const val = addFormData[key].trim()
      if (key === 'hazardClass' || key === 'rate' || key === 'rateToSom') {
        newRow[key] = Number(val) || 0
      } else {
        newRow[key] = val
      }
    })
    dataRef.value.push(newRow)
    addSaving.value = false
    addSuccess.value = true
  }, 800)
}

function handleOverlayClick(e: MouseEvent) {
  if ((e.target as HTMLElement).classList.contains('modal-overlay')) {
    closeAddModal()
  }
}

// --- Card color accents ---
const cardAccents: Record<string, string> = {
  waste: 'border-l-red-500',
  products: 'border-l-blue-500',
  regions: 'border-l-green-500',
  units: 'border-l-purple-500',
  activities: 'border-l-amber-500',
  currencies: 'border-l-teal-500',
}

const cardIconBg: Record<string, string> = {
  waste: 'bg-red-100 text-red-600',
  products: 'bg-blue-100 text-blue-600',
  regions: 'bg-green-100 text-green-600',
  units: 'bg-purple-100 text-purple-600',
  activities: 'bg-amber-100 text-amber-600',
  currencies: 'bg-teal-100 text-teal-600',
}
</script>

<template>
  <DashboardLayout
    role="admin"
    :roleTitle="roleTitle"
    userName="Иван Петров"
    :menuItems="menuItems"
  >
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold text-[#415861]">{{ $t('adminRefs.title') }}</h1>
        <p class="text-[#64748b] mt-1">{{ $t('adminRefs.subtitle') }}</p>
      </div>

      <!-- Reference Type Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div
          v-for="refType in referenceTypes"
          :key="refType.id"
          @click="selectReference(refType.id)"
          :class="[
            'bg-white rounded-2xl shadow-sm border-l-4 border border-[#e5e7eb] p-5 cursor-pointer transition-all duration-200 hover:shadow-md group',
            cardAccents[refType.id],
            activeReference === refType.id
              ? 'ring-2 ring-[#0e888d] border-[#0e888d] shadow-md'
              : 'hover:border-[#0e888d]/40'
          ]"
        >
          <div class="flex items-start gap-4">
            <!-- Icon -->
            <div
              :class="[
                'w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors',
                activeReference === refType.id ? 'bg-[#0e888d] text-white' : cardIconBg[refType.id]
              ]"
              v-html="refType.icon"
            />

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between mb-1">
                <h3 class="text-lg font-semibold text-[#415861] group-hover:text-[#0e888d] transition-colors">
                  {{ refType.title }}
                </h3>
                <span class="text-sm font-medium text-[#64748b] bg-[#f8fafc] px-2.5 py-0.5 rounded-full">
                  {{ refType.count }} {{ refType.countLabel }}
                </span>
              </div>
              <div class="flex flex-wrap gap-1.5 mt-2">
                <span
                  v-for="field in refType.fields"
                  :key="field"
                  class="text-xs text-[#64748b] bg-[#f1f5f9] px-2 py-0.5 rounded"
                >
                  {{ field }}
                </span>
              </div>
            </div>
          </div>

          <!-- Expand indicator -->
          <div class="flex items-center justify-end mt-3">
            <span class="text-xs text-[#94a3b8] group-hover:text-[#0e888d] transition-colors flex items-center gap-1">
              {{ activeReference === refType.id ? $t('adminRefs.collapse') : $t('adminRefs.expand') }}
              <svg
                :class="[
                  'w-4 h-4 transition-transform duration-200',
                  activeReference === refType.id ? 'rotate-180' : ''
                ]"
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </div>
        </div>
      </div>

      <!-- Expanded Table Section -->
      <Transition name="expand">
        <div
          v-if="activeReference && activeRefType"
          class="bg-white rounded-2xl shadow-sm border border-[#e5e7eb] overflow-hidden"
        >
          <!-- Section header -->
          <div class="px-6 py-4 border-b border-[#f1f5f9] bg-[#f8fafc]">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div class="flex items-center gap-3">
                <div
                  :class="['w-10 h-10 rounded-lg flex items-center justify-center', cardIconBg[activeReference]]"
                  v-html="activeRefType.icon"
                />
                <div>
                  <h2 class="text-lg font-bold text-[#415861]">{{ activeRefType.title }}</h2>
                  <p class="text-sm text-[#64748b]">{{ activeData.length }} {{ $t('adminRefs.ofRecords') }} {{ dataMap[activeReference].value.length }} {{ $t('adminRefs.records') }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <!-- Search -->
                <div class="relative">
                  <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    v-model="searchQuery"
                    type="text"
                    :placeholder="$t('adminRefs.searchPlaceholder')"
                    class="pl-9 pr-4 py-2 border border-[#e5e7eb] rounded-lg text-sm focus:outline-none focus:border-[#0e888d] w-64"
                  />
                </div>
                <!-- Add button -->
                <button
                  @click.stop="openAddModal"
                  class="flex items-center gap-2 bg-[#0e888d] text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-[#0a6d71] transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  {{ $t('adminRefs.addRecord') }}
                </button>
              </div>
            </div>
          </div>

          <!-- Table -->
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="bg-[#f8fafc] border-b border-[#e5e7eb]">
                  <th class="px-4 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wide w-12">
                    #
                  </th>
                  <th
                    v-for="(field, idx) in activeRefType.fields"
                    :key="idx"
                    class="px-4 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wide"
                  >
                    {{ field }}
                  </th>
                  <th class="px-4 py-3 text-right text-xs font-semibold text-[#64748b] uppercase tracking-wide w-40">
                    {{ $t('adminRefs.actions') }}
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#f1f5f9]">
                <tr
                  v-for="(row, rowIndex) in activeData"
                  :key="row.id"
                  class="hover:bg-[#f8fafc]/60 transition-colors"
                >
                  <td class="px-4 py-3 text-sm text-[#94a3b8] font-mono">
                    {{ rowIndex + 1 }}
                  </td>
                  <td
                    v-for="(fieldKey, fIdx) in activeRefType.fieldKeys"
                    :key="fIdx"
                    class="px-4 py-3"
                  >
                    <!-- Editing state -->
                    <div
                      v-if="editingCell.rowId === row.id && editingCell.fieldKey === fieldKey"
                      class="flex items-center gap-2"
                    >
                      <input
                        v-model="editingValue"
                        type="text"
                        class="px-2 py-1 border border-[#0e888d] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#0e888d] w-full max-w-[200px]"
                        @keyup.enter="saveEdit"
                        @keyup.escape="cancelEdit"
                      />
                      <button
                        @click="saveEdit"
                        :disabled="savingCell"
                        class="p-1 text-white bg-[#0e888d] rounded hover:bg-[#0a6d71] transition-colors disabled:opacity-50"
                        :title="$t('adminRefs.saveBtn')"
                      >
                        <svg v-if="!savingCell" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <svg v-else class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      </button>
                      <button
                        @click="cancelEdit"
                        class="p-1 text-[#64748b] bg-[#f1f5f9] rounded hover:bg-[#e2e8f0] transition-colors"
                        :title="$t('adminRefs.cancelBtn')"
                      >
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <!-- Display state (clickable) -->
                    <span
                      v-else
                      @click.stop="startEdit(row.id, fieldKey, row[fieldKey])"
                      class="text-sm text-[#415861] cursor-pointer hover:text-[#0e888d] hover:bg-[#e8f5f5] px-1.5 py-0.5 rounded transition-colors inline-block"
                      :title="$t('adminRefs.clickToEditTooltip')"
                    >
                      {{ row[fieldKey] }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-right">
                    <!-- Delete confirmation -->
                    <div v-if="deleteConfirmId === row.id" class="flex items-center justify-end gap-2">
                      <span class="text-xs text-red-600 font-medium">{{ $t('adminRefs.deleteConfirm') }}</span>
                      <button
                        @click.stop="executeDelete(row.id)"
                        class="px-2 py-1 text-xs font-medium text-white bg-red-500 rounded hover:bg-red-600 transition-colors"
                      >
                        {{ $t('adminRefs.yes') }}
                      </button>
                      <button
                        @click.stop="cancelDelete"
                        class="px-2 py-1 text-xs font-medium text-[#64748b] bg-[#f1f5f9] rounded hover:bg-[#e2e8f0] transition-colors"
                      >
                        {{ $t('adminRefs.no') }}
                      </button>
                    </div>
                    <!-- Normal actions -->
                    <button
                      v-else
                      @click.stop="confirmDelete(row.id)"
                      class="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      {{ $t('adminRefs.deleteBtn') }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Empty state -->
          <div v-if="activeData.length === 0" class="px-6 py-12 text-center">
            <svg class="w-12 h-12 text-[#cbd5e1] mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p class="text-[#64748b] font-medium">{{ $t('adminRefs.noRecordsFound') }}</p>
            <p class="text-sm text-[#94a3b8] mt-1">{{ $t('adminRefs.tryChangeSearch') }}</p>
            <button
              @click="searchQuery = ''"
              class="mt-3 text-sm text-[#0e888d] font-medium hover:underline"
            >
              {{ $t('adminRefs.resetSearch') }}
            </button>
          </div>

          <!-- Footer info -->
          <div class="px-6 py-3 border-t border-[#f1f5f9] bg-[#f8fafc] flex items-center justify-between">
            <p class="text-xs text-[#94a3b8]">
              {{ $t('adminRefs.clickToEdit') }}
            </p>
            <p class="text-xs text-[#94a3b8]">
              {{ $t('adminRefs.lastUpdated') }}
            </p>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Add Record Modal -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div
          v-if="showAddModal && activeRefType"
          class="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
          style="background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);"
          @click="handleOverlayClick"
        >
          <Transition name="modal-scale" mode="out-in">
            <!-- Success state -->
            <div
              v-if="addSuccess"
              key="success"
              class="bg-white rounded-2xl shadow-2xl w-full max-w-md text-center"
            >
              <div class="p-8">
                <div class="w-16 h-16 rounded-full bg-[#e8f5f5] flex items-center justify-center mx-auto mb-4">
                  <svg class="w-8 h-8 text-[#0e888d]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 class="text-xl font-bold text-[#415861] mb-2">{{ $t('adminRefs.recordAdded') }}</h3>
                <p class="text-[#64748b]">
                  {{ $t('adminRefs.recordAddedTextPre') }}
                  <span class="font-medium text-[#415861]">"{{ activeRefType.title }}"</span>
                  {{ $t('adminRefs.recordAddedTextPost') }}
                </p>
              </div>
              <div class="px-8 pb-8">
                <button
                  @click="closeAddModal"
                  class="w-full py-3 bg-[#0e888d] text-white rounded-xl font-medium hover:bg-[#0a6d71] transition-colors"
                >
                  {{ $t('adminRefs.close') }}
                </button>
              </div>
            </div>

            <!-- Form state -->
            <div
              v-else
              key="form"
              class="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <!-- Header -->
              <div class="flex items-center justify-between p-6 border-b border-[#f1f5f9]">
                <div>
                  <h3 class="text-xl font-bold text-[#415861]">{{ $t('adminRefs.addRecordModalTitle') }}</h3>
                  <p class="text-sm text-[#64748b] mt-1">{{ $t('adminRefs.referenceLabel') }} {{ activeRefType.title }}</p>
                </div>
                <button
                  @click="closeAddModal"
                  class="p-2 text-[#94a3b8] hover:text-[#415861] hover:bg-[#f1f5f9] rounded-lg transition-colors"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- Fields -->
              <div class="p-6 space-y-4">
                <div
                  v-for="(fieldKey, idx) in activeRefType.fieldKeys"
                  :key="fieldKey"
                >
                  <label class="block text-sm font-medium text-[#415861] mb-1.5">
                    {{ activeRefType.fields[idx] }}
                    <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="addFormData[fieldKey]"
                    type="text"
                    :placeholder="activeRefType.fieldPlaceholders[idx]"
                    :class="[
                      'w-full px-4 py-2.5 border rounded-xl focus:outline-none transition-colors',
                      addFormErrors[fieldKey]
                        ? 'border-red-400 focus:border-red-500 bg-red-50/50'
                        : 'border-[#e5e7eb] focus:border-[#0e888d]'
                    ]"
                  />
                  <p v-if="addFormErrors[fieldKey]" class="mt-1 text-xs text-red-500">
                    {{ addFormErrors[fieldKey] }}
                  </p>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex items-center justify-end gap-3 p-6 border-t border-[#f1f5f9]">
                <button
                  @click="closeAddModal"
                  class="px-5 py-2.5 text-[#64748b] border border-[#e5e7eb] rounded-xl font-medium hover:bg-[#f8fafc] transition-colors"
                >
                  {{ $t('adminRefs.cancelBtn') }}
                </button>
                <button
                  @click="submitAddRecord"
                  :disabled="addSaving"
                  :class="[
                    'flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-colors',
                    addSaving
                      ? 'bg-[#e5e7eb] text-[#94a3b8] cursor-not-allowed'
                      : 'bg-[#0e888d] text-white hover:bg-[#0a6d71]'
                  ]"
                >
                  <svg v-if="addSaving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  {{ addSaving ? $t('adminRefs.saving') : $t('adminRefs.addRecord') }}
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </DashboardLayout>
</template>

<style scoped>
.expand-enter-active {
  transition: all 0.35s ease-out;
}
.expand-leave-active {
  transition: all 0.25s ease-in;
}
.expand-enter-from {
  opacity: 0;
  transform: translateY(-12px);
  max-height: 0;
}
.expand-enter-to {
  max-height: 2000px;
}
.expand-leave-from {
  max-height: 2000px;
}
.expand-leave-to {
  opacity: 0;
  transform: translateY(-12px);
  max-height: 0;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-scale-enter-active {
  transition: all 0.25s ease-out;
}
.modal-scale-leave-active {
  transition: all 0.15s ease-in;
}
.modal-scale-enter-from {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}
.modal-scale-leave-to {
  opacity: 0;
  transform: scale(0.97) translateY(-5px);
}
</style>
