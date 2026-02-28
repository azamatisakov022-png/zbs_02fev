<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import { useEmployeeMenu } from '../../composables/useRoleMenu'
import {
  payerStore,
  formatMoney,
  getCategoryLabel,
  categoryColors,
  getSubcategoryLabel,
  getReportingLabel,
  reportingColors,
  getSettlementLabel,
  settlementColors,
  getSystemStatusLabel,
  systemStatusColors,
  type Payer,
} from '../../stores/payers'

const router = useRouter()
const { t } = useI18n()
const { roleTitle, menuItems } = useEmployeeMenu()

// ── Column definitions ──────────────────────────────────────
interface ColumnDef {
  id: string
  label: string
  defaultVisible: boolean
}

const allColumns = computed<ColumnDef[]>(() => [
  { id: 'rowNum', label: t('ministryPayers.colRowNum'), defaultVisible: true },
  { id: 'name', label: t('ministryPayers.colName'), defaultVisible: true },
  { id: 'inn', label: t('ministryPayers.colInn'), defaultVisible: true },
  { id: 'region', label: t('ministryPayers.colRegion'), defaultVisible: true },
  { id: 'category', label: t('ministryPayers.colCategory'), defaultVisible: true },
  { id: 'subcategory', label: t('ministryPayers.colSubcategory'), defaultVisible: false },
  { id: 'declarationsCount', label: t('ministryPayers.colDeclarationsCount'), defaultVisible: true },
  { id: 'lastCalculationDate', label: t('ministryPayers.colLastCalculationDate'), defaultVisible: false },
  { id: 'reportingStatus', label: t('ministryPayers.colReportingStatus'), defaultVisible: true },
  { id: 'lastPaymentDate', label: t('ministryPayers.colLastPaymentDate'), defaultVisible: false },
  { id: 'lastPaymentAmount', label: t('ministryPayers.colLastPaymentAmount'), defaultVisible: false },
  { id: 'totalCharged', label: t('ministryPayers.colTotalCharged'), defaultVisible: true },
  { id: 'totalPaid', label: t('ministryPayers.colTotalPaid'), defaultVisible: true },
  { id: 'settlementStatus', label: t('ministryPayers.colSettlementStatus'), defaultVisible: true },
  { id: 'registeredAt', label: t('ministryPayers.colRegisteredAt'), defaultVisible: false },
  { id: 'contactPerson', label: t('ministryPayers.colContactPerson'), defaultVisible: false },
  { id: 'contactPhone', label: t('ministryPayers.colContactPhone'), defaultVisible: false },
  { id: 'contactEmail', label: t('ministryPayers.colContactEmail'), defaultVisible: false },
  { id: 'legalAddress', label: t('ministryPayers.colLegalAddress'), defaultVisible: false },
  { id: 'actualAddress', label: t('ministryPayers.colActualAddress'), defaultVisible: false },
  { id: 'director', label: t('ministryPayers.colDirector'), defaultVisible: false },
  { id: 'systemStatus', label: t('ministryPayers.colSystemStatus'), defaultVisible: true },
  { id: 'suspensionReason', label: t('ministryPayers.colSuspensionReason'), defaultVisible: false },
  { id: 'lastUpdated', label: t('ministryPayers.colLastUpdated'), defaultVisible: false },
  { id: 'lastUpdatedBy', label: t('ministryPayers.colLastUpdatedBy'), defaultVisible: false },
])

// ── Visible columns (persisted) ─────────────────────────────
const STORAGE_KEY = 'payersVisibleColumns'

function loadVisibleColumns(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as string[]
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {
    // ignore
  }
  return allColumns.value.filter(c => c.defaultVisible).map(c => c.id)
}

const visibleColumnIds = ref<string[]>(loadVisibleColumns())

watch(visibleColumnIds, (val) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
}, { deep: true })

const visibleColumns = computed(() =>
  allColumns.value.filter(c => visibleColumnIds.value.includes(c.id))
)

function isColumnVisible(id: string): boolean {
  return visibleColumnIds.value.includes(id)
}

function toggleColumn(id: string) {
  const idx = visibleColumnIds.value.indexOf(id)
  if (idx >= 0) {
    visibleColumnIds.value.splice(idx, 1)
  } else {
    visibleColumnIds.value.push(id)
  }
}

const showColumnSettings = ref(false)

// ── Filters ─────────────────────────────────────────────────
const searchQuery = ref('')
const filterRegion = ref('Все')
const filterSystemStatus = ref('Все')
const filterCategory = ref('Все')
const filterSettlementStatus = ref('Все')
const filterReportingStatus = ref('Все')
const registeredFrom = ref('')
const registeredTo = ref('')
const showAdvancedFilters = ref(false)

const regions = [
  'Все',
  'г. Бишкек',
  'г. Ош',
  'Чуйская область',
  'Ошская область',
  'Иссык-Кульская область',
  'Нарынская область',
  'Таласская область',
  'Баткенская область',
  'Джалал-Абадская область',
]

function resetFilters() {
  searchQuery.value = ''
  filterRegion.value = 'Все'
  filterSystemStatus.value = 'Все'
  filterCategory.value = 'Все'
  filterSettlementStatus.value = 'Все'
  filterReportingStatus.value = 'Все'
  registeredFrom.value = ''
  registeredTo.value = ''
}

// ── Sorting ─────────────────────────────────────────────────
const sortField = ref<string>('name')
const sortDirection = ref<'asc' | 'desc'>('asc')

function toggleSort(field: string) {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDirection.value = 'asc'
  }
}

function sortIcon(field: string): string {
  if (sortField.value !== field) return ''
  return sortDirection.value === 'asc' ? ' ▲' : ' ▼'
}

// ── Pagination ──────────────────────────────────────────────
const currentPage = ref(1)
const perPage = ref(25)

// ── Computed data pipeline ──────────────────────────────────
function parseDateDMY(dateStr: string): Date | null {
  if (!dateStr) return null
  const parts = dateStr.split('.')
  if (parts.length !== 3) return null
  return new Date(+parts[2], +parts[1] - 1, +parts[0])
}

const filteredPayers = computed<Payer[]>(() => {
  let result = payerStore.getAll()

  // Search
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    result = result.filter(p =>
      p.name.toLowerCase().includes(q) || p.inn.includes(q)
    )
  }

  // Region
  if (filterRegion.value !== 'Все') {
    result = result.filter(p => p.region === filterRegion.value)
  }

  // System status
  if (filterSystemStatus.value !== 'Все') {
    result = result.filter(p => p.systemStatus === filterSystemStatus.value)
  }

  // Category
  if (filterCategory.value !== 'Все') {
    result = result.filter(p => p.category === filterCategory.value)
  }

  // Settlement status
  if (filterSettlementStatus.value !== 'Все') {
    result = result.filter(p => p.settlementStatus === filterSettlementStatus.value)
  }

  // Reporting status
  if (filterReportingStatus.value !== 'Все') {
    result = result.filter(p => p.reportingStatus === filterReportingStatus.value)
  }

  // Date range
  if (registeredFrom.value) {
    const from = new Date(registeredFrom.value)
    result = result.filter(p => {
      const d = parseDateDMY(p.registeredAt)
      return d ? d >= from : false
    })
  }
  if (registeredTo.value) {
    const to = new Date(registeredTo.value)
    result = result.filter(p => {
      const d = parseDateDMY(p.registeredAt)
      return d ? d <= to : false
    })
  }

  return result
})

const sortedPayers = computed<Payer[]>(() => {
  const list = [...filteredPayers.value]
  const field = sortField.value
  const dir = sortDirection.value === 'asc' ? 1 : -1

  list.sort((a, b) => {
    let va: string | number = ''
    let vb: string | number = ''

    switch (field) {
      case 'name': va = a.name; vb = b.name; break
      case 'inn': va = a.inn; vb = b.inn; break
      case 'region': va = a.region; vb = b.region; break
      case 'category': va = a.category; vb = b.category; break
      case 'subcategory': va = a.subcategory || ''; vb = b.subcategory || ''; break
      case 'declarationsCount': va = a.declarationsCount; vb = b.declarationsCount; break
      case 'lastCalculationDate': va = a.lastCalculationDate; vb = b.lastCalculationDate; break
      case 'reportingStatus': va = a.reportingStatus; vb = b.reportingStatus; break
      case 'lastPaymentDate': va = a.lastPaymentDate; vb = b.lastPaymentDate; break
      case 'lastPaymentAmount': va = a.lastPaymentAmount; vb = b.lastPaymentAmount; break
      case 'totalCharged': va = a.totalCharged; vb = b.totalCharged; break
      case 'totalPaid': va = a.totalPaid; vb = b.totalPaid; break
      case 'settlementStatus': va = a.settlementStatus; vb = b.settlementStatus; break
      case 'registeredAt': va = a.registeredAt; vb = b.registeredAt; break
      case 'contactPerson': va = a.contactPerson; vb = b.contactPerson; break
      case 'contactPhone': va = a.contactPhone; vb = b.contactPhone; break
      case 'contactEmail': va = a.contactEmail; vb = b.contactEmail; break
      case 'legalAddress': va = a.legalAddress; vb = b.legalAddress; break
      case 'actualAddress': va = a.actualAddress; vb = b.actualAddress; break
      case 'director': va = a.director; vb = b.director; break
      case 'systemStatus': va = a.systemStatus; vb = b.systemStatus; break
      case 'suspensionReason': va = a.suspensionReason; vb = b.suspensionReason; break
      case 'lastUpdated': va = a.lastUpdated; vb = b.lastUpdated; break
      case 'lastUpdatedBy': va = a.lastUpdatedBy; vb = b.lastUpdatedBy; break
      default: va = a.name; vb = b.name
    }

    if (typeof va === 'number' && typeof vb === 'number') {
      return (va - vb) * dir
    }
    return String(va).localeCompare(String(vb)) * dir
  })

  return list
})

const paginatedPayers = computed<Payer[]>(() => {
  const start = (currentPage.value - 1) * perPage.value
  return sortedPayers.value.slice(start, start + perPage.value)
})

const filteredCount = computed(() => filteredPayers.value.length)
const totalCount = computed(() => payerStore.getTotal())
const totalPages = computed(() => Math.max(1, Math.ceil(filteredCount.value / perPage.value)))

const paginationFrom = computed(() => {
  if (filteredCount.value === 0) return 0
  return (currentPage.value - 1) * perPage.value + 1
})
const paginationTo = computed(() => {
  return Math.min(currentPage.value * perPage.value, filteredCount.value)
})

const pageNumbers = computed<number[]>(() => {
  const pages: number[] = []
  const total = totalPages.value
  const current = currentPage.value

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    pages.push(1)
    if (current > 3) pages.push(-1) // ellipsis
    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (current < total - 2) pages.push(-1) // ellipsis
    pages.push(total)
  }

  return pages
})

// Reset page when filters change
watch([searchQuery, filterRegion, filterSystemStatus, filterCategory, filterSettlementStatus, filterReportingStatus, registeredFrom, registeredTo, perPage], () => {
  currentPage.value = 1
})

function prevPage() {
  if (currentPage.value > 1) currentPage.value--
}
function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++
}
function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) currentPage.value = page
}

// ── Row click ───────────────────────────────────────────────
function navigateToPayer(payer: Payer) {
  router.push(`/ministry/payers/${payer.id}`)
}

// ── Export stubs ────────────────────────────────────────────
function exportExcel() {
  console.log('Export to Excel', filteredPayers.value.length, 'records')
}
function exportPdf() {
  console.log('Export to PDF', filteredPayers.value.length, 'records')
}
function exportCsv() {
  console.log('Export to CSV', filteredPayers.value.length, 'records')
}

// ── Close column settings on outside click ──────────────────
function onClickOutsideColumnSettings(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('.column-settings-wrapper')) {
    showColumnSettings.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', onClickOutsideColumnSettings)
})
</script>

<template>
  <DashboardLayout
    role="employee"
    :roleTitle="roleTitle"
    userName="Мамытова Айгуль"
    :menuItems="menuItems"
  >
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">{{ $t('ministryPayers.title') }}</h1>
          <p class="text-gray-500 mt-1">{{ $t('ministryPayers.subtitle') }}</p>
        </div>
        <div class="text-sm text-gray-600">
          {{ $t('ministryPayers.foundLabel') }} <span class="font-semibold text-gray-900">{{ filteredCount }}</span> {{ $t('ministryPayers.ofTotal') }} <span class="font-semibold text-gray-900">{{ totalCount }}</span> {{ $t('ministryPayers.payersUnit') }}
        </div>
      </div>

      <!-- Export & Column Settings -->
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex flex-wrap items-center gap-2">
          <button
            @click="exportExcel"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Excel
          </button>
          <button
            @click="exportPdf"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            PDF
          </button>
          <button
            @click="exportCsv"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            CSV
          </button>
        </div>

        <!-- Column Settings -->
        <div class="relative column-settings-wrapper">
          <button
            @click.stop="showColumnSettings = !showColumnSettings"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {{ $t('ministryPayers.configureColumns') }}
          </button>
          <div
            v-if="showColumnSettings"
            class="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-200 z-20 max-h-[400px] overflow-y-auto"
            @click.stop
          >
            <div class="p-3 border-b border-gray-100">
              <p class="text-sm font-semibold text-gray-900">{{ $t('ministryPayers.displayedColumns') }}</p>
            </div>
            <div class="p-2">
              <label
                v-for="col in allColumns"
                :key="col.id"
                class="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  :checked="isColumnVisible(col.id)"
                  @change="toggleColumn(col.id)"
                  class="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span class="text-sm text-gray-700">{{ col.label }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-4">
        <!-- Main filters row -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <!-- Search -->
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="$t('ministryPayers.searchPlaceholder')"
              class="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
            />
          </div>

          <!-- Region -->
          <select
            v-model="filterRegion"
            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
          >
            <option v-for="r in regions" :key="r" :value="r">{{ r === 'Все' ? $t('ministryPayers.regionAll') : r }}</option>
          </select>

          <!-- System Status -->
          <select
            v-model="filterSystemStatus"
            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
          >
            <option value="Все">{{ $t('ministryPayers.statusAll') }}</option>
            <option value="active">{{ $t('ministryPayers.statusActive') }}</option>
            <option value="suspended">{{ $t('ministryPayers.statusSuspended') }}</option>
            <option value="excluded">{{ $t('ministryPayers.statusExcluded') }}</option>
          </select>

          <!-- Toggle advanced -->
          <button
            @click="showAdvancedFilters = !showAdvancedFilters"
            class="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors"
            :class="showAdvancedFilters ? 'bg-green-50 text-green-700 border border-green-300' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            {{ $t('ministryPayers.moreFilters') }}
            <svg
              class="w-3.5 h-3.5 transition-transform"
              :class="showAdvancedFilters ? 'rotate-180' : ''"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        <!-- Advanced filters row -->
        <div v-if="showAdvancedFilters" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-3 border-t border-gray-100">
          <!-- Category -->
          <select
            v-model="filterCategory"
            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
          >
            <option value="Все">{{ $t('ministryPayers.categoryAll') }}</option>
            <option value="importer">{{ $t('ministryPayers.categoryImporter') }}</option>
            <option value="producer">{{ $t('ministryPayers.categoryProducer') }}</option>
            <option value="both">{{ $t('ministryPayers.categoryBoth') }}</option>
          </select>

          <!-- Settlement Status -->
          <select
            v-model="filterSettlementStatus"
            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
          >
            <option value="Все">{{ $t('ministryPayers.settlementAll') }}</option>
            <option value="clear">{{ $t('ministryPayers.settlementClear') }}</option>
            <option value="debt">{{ $t('ministryPayers.settlementDebt') }}</option>
            <option value="overpaid">{{ $t('ministryPayers.settlementOverpaid') }}</option>
          </select>

          <!-- Reporting Status -->
          <select
            v-model="filterReportingStatus"
            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
          >
            <option value="Все">{{ $t('ministryPayers.reportingAll') }}</option>
            <option value="onTime">{{ $t('ministryPayers.reportingOnTime') }}</option>
            <option value="expected">{{ $t('ministryPayers.reportingExpected') }}</option>
            <option value="overdue">{{ $t('ministryPayers.reportingOverdue') }}</option>
          </select>

          <!-- Date range -->
          <div class="flex items-center gap-2">
            <input
              v-model="registeredFrom"
              type="date"
              class="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              :title="$t('ministryPayers.dateFrom')"
            />
            <span class="text-gray-400 text-sm flex-shrink-0">—</span>
            <input
              v-model="registeredTo"
              type="date"
              class="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              :title="$t('ministryPayers.dateTo')"
            />
          </div>

          <!-- Reset -->
          <button
            @click="resetFilters"
            class="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            {{ $t('ministryPayers.resetFilters') }}
          </button>
        </div>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th
                  v-if="isColumnVisible('rowNum')"
                  class="sticky-col sticky-col-first px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-100 transition-colors whitespace-nowrap"
                  @click="toggleSort('rowNum')"
                >
                  {{ $t('ministryPayers.colRowNum') }}{{ sortIcon('rowNum') }}
                </th>
                <th
                  v-if="isColumnVisible('name')"
                  class="sticky-col sticky-col-second px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-100 transition-colors whitespace-nowrap"
                  @click="toggleSort('name')"
                >
                  {{ $t('ministryPayers.nameHeader') }}{{ sortIcon('name') }}
                </th>
                <template v-for="col in visibleColumns" :key="col.id">
                  <th
                    v-if="col.id !== 'rowNum' && col.id !== 'name'"
                    class="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-100 transition-colors whitespace-nowrap"
                    @click="toggleSort(col.id)"
                  >
                    {{ col.label }}{{ sortIcon(col.id) }}
                  </th>
                </template>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-if="paginatedPayers.length === 0">
                <td :colspan="visibleColumns.length" class="px-6 py-12 text-center text-gray-500">
                  <div class="flex flex-col items-center gap-2">
                    <svg class="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p class="text-sm font-medium">{{ $t('ministryPayers.notFound') }}</p>
                    <p class="text-xs text-gray-400">{{ $t('ministryPayers.tryChangeSearch') }}</p>
                  </div>
                </td>
              </tr>
              <tr
                v-for="(payer, idx) in paginatedPayers"
                :key="payer.id"
                class="cursor-pointer transition-colors"
                :class="idx % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50/50 hover:bg-gray-100/70'"
                @click="navigateToPayer(payer)"
              >
                <!-- rowNum -->
                <td
                  v-if="isColumnVisible('rowNum')"
                  class="sticky-col sticky-col-first px-3 py-3 text-gray-500 font-mono text-xs"
                  :class="idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'"
                >
                  {{ (currentPage - 1) * perPage + idx + 1 }}
                </td>

                <!-- name -->
                <td
                  v-if="isColumnVisible('name')"
                  class="sticky-col sticky-col-second px-3 py-3 font-semibold text-gray-900 whitespace-nowrap"
                  :class="idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'"
                >
                  {{ payer.name }}
                </td>

                <!-- inn -->
                <td v-if="isColumnVisible('inn') && !['rowNum','name'].includes('inn')" class="px-3 py-3 font-mono text-xs text-gray-600 whitespace-nowrap">
                  {{ payer.inn }}
                </td>

                <!-- region -->
                <td v-if="isColumnVisible('region')" class="px-3 py-3 text-gray-600 whitespace-nowrap">
                  {{ payer.region }}
                </td>

                <!-- category -->
                <td v-if="isColumnVisible('category')" class="px-3 py-3 whitespace-nowrap">
                  <span :class="['px-2.5 py-0.5 rounded-full text-xs font-semibold', categoryColors[payer.category]]">
                    {{ getCategoryLabel(payer.category) }}
                  </span>
                </td>

                <!-- subcategory -->
                <td v-if="isColumnVisible('subcategory')" class="px-3 py-3 whitespace-nowrap">
                  <span v-if="payer.subcategory" class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                    {{ getSubcategoryLabel(payer.subcategory) }}
                  </span>
                  <span v-else class="text-gray-400">&mdash;</span>
                </td>

                <!-- declarationsCount -->
                <td v-if="isColumnVisible('declarationsCount')" class="px-3 py-3 text-gray-700 text-center">
                  {{ payer.declarationsCount }}
                </td>

                <!-- lastCalculationDate -->
                <td v-if="isColumnVisible('lastCalculationDate')" class="px-3 py-3 text-gray-600 whitespace-nowrap">
                  {{ payer.lastCalculationDate || '—' }}
                </td>

                <!-- reportingStatus -->
                <td v-if="isColumnVisible('reportingStatus')" class="px-3 py-3 whitespace-nowrap">
                  <span :class="['px-2.5 py-0.5 rounded-full text-xs font-semibold', reportingColors[payer.reportingStatus]]">
                    {{ getReportingLabel(payer.reportingStatus) }}
                  </span>
                </td>

                <!-- lastPaymentDate -->
                <td v-if="isColumnVisible('lastPaymentDate')" class="px-3 py-3 text-gray-600 whitespace-nowrap">
                  {{ payer.lastPaymentDate || '—' }}
                </td>

                <!-- lastPaymentAmount -->
                <td v-if="isColumnVisible('lastPaymentAmount')" class="px-3 py-3 text-gray-700 text-right whitespace-nowrap">
                  {{ payer.lastPaymentAmount ? formatMoney(payer.lastPaymentAmount) + ' ' + $t('ministryPayers.currencySom') : '—' }}
                </td>

                <!-- totalCharged -->
                <td v-if="isColumnVisible('totalCharged')" class="px-3 py-3 text-gray-900 font-medium text-right whitespace-nowrap">
                  {{ formatMoney(payer.totalCharged) }}
                </td>

                <!-- totalPaid -->
                <td v-if="isColumnVisible('totalPaid')" class="px-3 py-3 text-gray-900 font-medium text-right whitespace-nowrap">
                  {{ formatMoney(payer.totalPaid) }}
                </td>

                <!-- settlementStatus -->
                <td v-if="isColumnVisible('settlementStatus')" class="px-3 py-3 whitespace-nowrap">
                  <span :class="['px-2.5 py-0.5 rounded-full text-xs font-semibold', settlementColors[payer.settlementStatus]]">
                    {{ getSettlementLabel(payer.settlementStatus) }}
                  </span>
                  <span
                    v-if="payer.settlementStatus !== 'clear' && payer.settlementAmount"
                    class="ml-1 text-xs text-gray-500"
                  >
                    {{ formatMoney(payer.settlementAmount) }}
                  </span>
                </td>

                <!-- registeredAt -->
                <td v-if="isColumnVisible('registeredAt')" class="px-3 py-3 text-gray-600 whitespace-nowrap">
                  {{ payer.registeredAt }}
                </td>

                <!-- contactPerson -->
                <td v-if="isColumnVisible('contactPerson')" class="px-3 py-3 text-gray-600 whitespace-nowrap">
                  {{ payer.contactPerson }}
                </td>

                <!-- contactPhone -->
                <td v-if="isColumnVisible('contactPhone')" class="px-3 py-3 text-gray-600 whitespace-nowrap">
                  {{ payer.contactPhone }}
                </td>

                <!-- contactEmail -->
                <td v-if="isColumnVisible('contactEmail')" class="px-3 py-3 text-gray-600 whitespace-nowrap">
                  {{ payer.contactEmail }}
                </td>

                <!-- legalAddress -->
                <td v-if="isColumnVisible('legalAddress')" class="px-3 py-3 text-gray-600">
                  <div class="max-w-[200px] truncate" :title="payer.legalAddress">{{ payer.legalAddress }}</div>
                </td>

                <!-- actualAddress -->
                <td v-if="isColumnVisible('actualAddress')" class="px-3 py-3 text-gray-600">
                  <div class="max-w-[200px] truncate" :title="payer.actualAddress">{{ payer.actualAddress }}</div>
                </td>

                <!-- director -->
                <td v-if="isColumnVisible('director')" class="px-3 py-3 text-gray-600 whitespace-nowrap">
                  {{ payer.director }}
                </td>

                <!-- systemStatus -->
                <td v-if="isColumnVisible('systemStatus')" class="px-3 py-3 whitespace-nowrap">
                  <span :class="['px-2.5 py-0.5 rounded-full text-xs font-semibold', systemStatusColors[payer.systemStatus]]">
                    {{ getSystemStatusLabel(payer.systemStatus) }}
                  </span>
                </td>

                <!-- suspensionReason -->
                <td v-if="isColumnVisible('suspensionReason')" class="px-3 py-3 text-gray-600">
                  <div v-if="payer.suspensionReason" class="max-w-[200px] truncate" :title="payer.suspensionReason">{{ payer.suspensionReason }}</div>
                  <span v-else class="text-gray-400">&mdash;</span>
                </td>

                <!-- lastUpdated -->
                <td v-if="isColumnVisible('lastUpdated')" class="px-3 py-3 text-gray-600 whitespace-nowrap">
                  {{ payer.lastUpdated }}
                </td>

                <!-- lastUpdatedBy -->
                <td v-if="isColumnVisible('lastUpdatedBy')" class="px-3 py-3 text-gray-600 whitespace-nowrap">
                  {{ payer.lastUpdatedBy }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-200 bg-gray-50/50">
          <div class="flex items-center gap-3">
            <label class="text-sm text-gray-600">{{ $t('ministryPayers.showLabel') }}</label>
            <select
              v-model.number="perPage"
              class="px-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option :value="25">25</option>
              <option :value="50">50</option>
              <option :value="100">100</option>
            </select>
            <span class="text-sm text-gray-500">
              {{ $t('ministryPayers.shownRange') }} {{ paginationFrom }}-{{ paginationTo }} {{ $t('ministryPayers.shownOf') }} {{ filteredCount }}
            </span>
          </div>

          <div class="flex items-center gap-1">
            <button
              @click="prevPage"
              :disabled="currentPage <= 1"
              class="px-2.5 py-1.5 text-sm font-medium rounded-lg border transition-colors"
              :class="currentPage <= 1 ? 'text-gray-300 border-gray-200 cursor-not-allowed' : 'text-gray-700 border-gray-300 hover:bg-gray-100'"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <template v-for="(page, i) in pageNumbers" :key="i">
              <span v-if="page === -1" class="px-1 text-gray-400">...</span>
              <button
                v-else
                @click="goToPage(page)"
                class="px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors"
                :class="page === currentPage
                  ? 'bg-green-600 text-white border-green-600'
                  : 'text-gray-700 border-gray-300 hover:bg-gray-100'"
              >
                {{ page }}
              </button>
            </template>

            <button
              @click="nextPage"
              :disabled="currentPage >= totalPages"
              class="px-2.5 py-1.5 text-sm font-medium rounded-lg border transition-colors"
              :class="currentPage >= totalPages ? 'text-gray-300 border-gray-200 cursor-not-allowed' : 'text-gray-700 border-gray-300 hover:bg-gray-100'"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<style scoped>
.sticky-col {
  position: sticky;
  z-index: 10;
}

.sticky-col-first {
  left: 0;
  min-width: 48px;
  box-shadow: 2px 0 4px -2px rgba(0, 0, 0, 0.06);
}

.sticky-col-second {
  left: 48px;
  min-width: 220px;
  box-shadow: 2px 0 4px -2px rgba(0, 0, 0, 0.06);
}

thead .sticky-col {
  background: rgb(249 250 251); /* bg-gray-50 */
}

tr:hover .sticky-col-first,
tr:hover .sticky-col-second {
  background: rgb(249 250 251) !important; /* bg-gray-50 on hover */
}
</style>
