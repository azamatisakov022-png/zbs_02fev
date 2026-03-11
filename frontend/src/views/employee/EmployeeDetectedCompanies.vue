<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import { useEmployeeMenu } from '../../composables/useRoleMenu'
import { authStore } from '../../stores/auth'
import {
  detectedCompanyStore,
  getSourceLabel,
  sourceColors,
  getStatusLabel,
  statusColors,
  type DetectedCompany,
  type DetectedCompanySource,
  type DetectedCompanyStatus,
} from '../../stores/detectedCompanies'

const router = useRouter()
const { t } = useI18n()
const { roleTitle, menuItems } = useEmployeeMenu()

// ── Filters ─────────────────────────────────────────────────
const searchQuery = ref('')
const filterSource = ref<string>('all')
const filterStatus = ref<string>('all')

function resetFilters() {
  searchQuery.value = ''
  filterSource.value = 'all'
  filterStatus.value = 'all'
}

// ── Sorting ─────────────────────────────────────────────────
const sortField = ref<string>('createdAt')
const sortDirection = ref<'asc' | 'desc'>('desc')

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
const filteredCompanies = computed<DetectedCompany[]>(() => {
  let result = detectedCompanyStore.getAll()

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    result = result.filter(c =>
      (c.companyName || '').toLowerCase().includes(q) || (c.inn || '').includes(q)
    )
  }

  if (filterSource.value !== 'all') {
    result = result.filter(c => c.source === filterSource.value)
  }

  if (filterStatus.value !== 'all') {
    result = result.filter(c => c.status === filterStatus.value)
  }

  return result
})

const sortedCompanies = computed<DetectedCompany[]>(() => {
  const list = [...filteredCompanies.value]
  const field = sortField.value
  const dir = sortDirection.value === 'asc' ? 1 : -1

  list.sort((a, b) => {
    let va: string | number = ''
    let vb: string | number = ''

    switch (field) {
      case 'companyName': va = a.companyName || ''; vb = b.companyName || ''; break
      case 'inn': va = a.inn || ''; vb = b.inn || ''; break
      case 'source': va = a.source; vb = b.source; break
      case 'status': va = a.status; vb = b.status; break
      case 'estimatedMass': va = a.estimatedMass || 0; vb = b.estimatedMass || 0; break
      case 'createdAt': va = a.createdAt || ''; vb = b.createdAt || ''; break
      default: va = a.createdAt || ''; vb = b.createdAt || ''
    }

    if (typeof va === 'number' && typeof vb === 'number') {
      return (va - vb) * dir
    }
    return String(va).localeCompare(String(vb), 'ru') * dir
  })

  return list
})

const paginatedCompanies = computed<DetectedCompany[]>(() => {
  const start = (currentPage.value - 1) * perPage.value
  return sortedCompanies.value.slice(start, start + perPage.value)
})

const filteredCount = computed(() => filteredCompanies.value.length)
const totalCount = computed(() => detectedCompanyStore.getAll().length)
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
    if (current > 3) pages.push(-1)
    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (current < total - 2) pages.push(-1)
    pages.push(total)
  }

  return pages
})

watch([searchQuery, filterSource, filterStatus, perPage], () => {
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
function navigateToCompany(company: DetectedCompany) {
  router.push(`/employee/detected-companies/${company.id}`)
}

// ── Monitoring actions ──────────────────────────────────────
const monitoringLoading = ref(false)

async function runGtsMonitoring() {
  monitoringLoading.value = true
  try {
    const result = await detectedCompanyStore.runGtsMonitoring()
    alert(t('detectedCompanies.gtsMonitoringDone', { count: result.newCompaniesFound }))
    await detectedCompanyStore.fetchAll()
  } catch {
    alert(t('detectedCompanies.monitoringError'))
  } finally {
    monitoringLoading.value = false
  }
}

async function runGnsMonitoring() {
  monitoringLoading.value = true
  try {
    const result = await detectedCompanyStore.runGnsMonitoring()
    alert(t('detectedCompanies.gnsMonitoringDone', { count: result.newCompaniesFound }))
    await detectedCompanyStore.fetchAll()
  } catch {
    alert(t('detectedCompanies.monitoringError'))
  } finally {
    monitoringLoading.value = false
  }
}

// ── Helpers ─────────────────────────────────────────────────
function formatDate(dateStr: string): string {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
  } catch {
    return dateStr
  }
}

function formatMass(mass: number | null): string {
  if (mass == null) return '—'
  return mass.toLocaleString('ru-RU')
}

// ── Init ────────────────────────────────────────────────────
onMounted(() => {
  detectedCompanyStore.fetchAll()
})
</script>

<template>
  <DashboardLayout
    role="employee"
    :roleTitle="roleTitle"
    userName="Сотрудник МПРЭТН"
    :menuItems="menuItems"
  >
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">{{ $t('detectedCompanies.title') }}</h1>
          <p class="text-gray-500 mt-1">{{ $t('detectedCompanies.subtitle') }}</p>
        </div>
        <div v-if="authStore.userRole.value === 'eco-operator' || authStore.userRole.value === 'admin'" class="flex items-center gap-2">
          <button
            @click="runGtsMonitoring"
            :disabled="monitoringLoading"
            class="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {{ $t('detectedCompanies.runGts') }}
          </button>
          <button
            @click="runGnsMonitoring"
            :disabled="monitoringLoading"
            class="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {{ $t('detectedCompanies.runGns') }}
          </button>
        </div>
      </div>

      <!-- Stats cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p class="text-sm text-gray-500">{{ $t('detectedCompanies.statsTotal') }}</p>
              <p class="text-xl font-bold text-gray-900">{{ detectedCompanyStore.state.stats.total }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <div>
              <p class="text-sm text-gray-500">{{ $t('detectedCompanies.statsNew') }}</p>
              <p class="text-xl font-bold text-red-600">{{ detectedCompanyStore.state.stats.newCount }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p class="text-sm text-gray-500">{{ $t('detectedCompanies.statsGts') }}</p>
              <p class="text-xl font-bold text-blue-600">{{ detectedCompanyStore.state.stats.gtsCount }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <p class="text-sm text-gray-500">{{ $t('detectedCompanies.statsGns') }}</p>
              <p class="text-xl font-bold text-purple-600">{{ detectedCompanyStore.state.stats.gnsCount }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
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
              :placeholder="$t('detectedCompanies.searchPlaceholder')"
              class="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
            />
          </div>

          <!-- Source -->
          <select
            v-model="filterSource"
            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
          >
            <option value="all">{{ $t('detectedCompanies.sourceAll') }}</option>
            <option value="gts">{{ $t('detectedCompanies.source.gts') }}</option>
            <option value="gns">{{ $t('detectedCompanies.source.gns') }}</option>
            <option value="self">{{ $t('detectedCompanies.source.self') }}</option>
          </select>

          <!-- Status -->
          <select
            v-model="filterStatus"
            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
          >
            <option value="all">{{ $t('detectedCompanies.statusAll') }}</option>
            <option value="new">{{ $t('detectedCompanies.status.new') }}</option>
            <option value="notified">{{ $t('detectedCompanies.status.notified') }}</option>
            <option value="registration_submitted">{{ $t('detectedCompanies.status.registration_submitted') }}</option>
            <option value="under_review">{{ $t('detectedCompanies.status.under_review') }}</option>
            <option value="revision_requested">{{ $t('detectedCompanies.status.revision_requested') }}</option>
            <option value="approved">{{ $t('detectedCompanies.status.approved') }}</option>
            <option value="rejected">{{ $t('detectedCompanies.status.rejected') }}</option>
          </select>

          <!-- Reset -->
          <button
            @click="resetFilters"
            class="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            {{ $t('detectedCompanies.resetFilters') }}
          </button>
        </div>
      </div>

      <!-- Found count -->
      <div class="text-sm text-gray-600">
        {{ $t('detectedCompanies.found') }}: <span class="font-semibold text-gray-900">{{ filteredCount }}</span> {{ $t('detectedCompanies.of') }} <span class="font-semibold text-gray-900">{{ totalCount }}</span>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">№</th>
                <th
                  class="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-100 transition-colors whitespace-nowrap"
                  @click="toggleSort('companyName')"
                >
                  {{ $t('detectedCompanies.colCompany') }}{{ sortIcon('companyName') }}
                </th>
                <th
                  class="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-100 transition-colors whitespace-nowrap"
                  @click="toggleSort('inn')"
                >
                  {{ $t('detectedCompanies.colInn') }}{{ sortIcon('inn') }}
                </th>
                <th
                  class="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-100 transition-colors whitespace-nowrap"
                  @click="toggleSort('source')"
                >
                  {{ $t('detectedCompanies.colSource') }}{{ sortIcon('source') }}
                </th>
                <th
                  class="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-100 transition-colors whitespace-nowrap"
                  @click="toggleSort('status')"
                >
                  {{ $t('detectedCompanies.colStatus') }}{{ sortIcon('status') }}
                </th>
                <th class="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">
                  {{ $t('detectedCompanies.colCodes') }}
                </th>
                <th
                  class="px-3 py-3 text-right text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-100 transition-colors whitespace-nowrap"
                  @click="toggleSort('estimatedMass')"
                >
                  {{ $t('detectedCompanies.colMass') }}{{ sortIcon('estimatedMass') }}
                </th>
                <th class="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">
                  {{ $t('detectedCompanies.colEmployee') }}
                </th>
                <th
                  class="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-100 transition-colors whitespace-nowrap"
                  @click="toggleSort('createdAt')"
                >
                  {{ $t('detectedCompanies.colDate') }}{{ sortIcon('createdAt') }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-if="paginatedCompanies.length === 0">
                <td colspan="9" class="px-6 py-12 text-center text-gray-500">
                  <div class="flex flex-col items-center gap-2">
                    <svg class="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p class="text-sm font-medium">{{ $t('detectedCompanies.noResults') }}</p>
                    <p class="text-xs text-gray-400">{{ $t('detectedCompanies.tryChangingSearch') }}</p>
                  </div>
                </td>
              </tr>
              <tr
                v-for="(company, idx) in paginatedCompanies"
                :key="company.id"
                class="cursor-pointer transition-colors"
                :class="idx % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50/50 hover:bg-gray-100/70'"
                @click="navigateToCompany(company)"
              >
                <td class="px-3 py-3 text-gray-500 font-mono text-xs">
                  {{ (currentPage - 1) * perPage + idx + 1 }}
                </td>
                <td class="px-3 py-3 font-semibold text-gray-900 whitespace-nowrap">
                  {{ company.companyName || '—' }}
                </td>
                <td class="px-3 py-3 font-mono text-xs text-gray-600 whitespace-nowrap">
                  {{ company.inn }}
                </td>
                <td class="px-3 py-3 whitespace-nowrap">
                  <span :class="['px-2.5 py-0.5 rounded-full text-xs font-semibold', sourceColors[company.source]]">
                    {{ getSourceLabel(company.source) }}
                  </span>
                </td>
                <td class="px-3 py-3 whitespace-nowrap">
                  <span :class="['px-2.5 py-0.5 rounded-full text-xs font-semibold', statusColors[company.status]]">
                    {{ getStatusLabel(company.status) }}
                  </span>
                </td>
                <td class="px-3 py-3 text-gray-600">
                  <div class="max-w-[180px] truncate" :title="company.okedCodes || company.tnvedCodes || '—'">
                    {{ company.okedCodes || company.tnvedCodes || '—' }}
                  </div>
                </td>
                <td class="px-3 py-3 text-gray-700 text-right whitespace-nowrap">
                  {{ formatMass(company.estimatedMass) }}
                </td>
                <td class="px-3 py-3 text-gray-600 whitespace-nowrap">
                  {{ company.assignedEmployeeName || '—' }}
                </td>
                <td class="px-3 py-3 text-gray-600 whitespace-nowrap">
                  {{ formatDate(company.createdAt) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-200 bg-gray-50/50">
          <div class="flex items-center gap-3">
            <label class="text-sm text-gray-600">{{ $t('detectedCompanies.showPerPage') }}:</label>
            <select
              v-model.number="perPage"
              class="px-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option :value="25">25</option>
              <option :value="50">50</option>
              <option :value="100">100</option>
            </select>
            <span class="text-sm text-gray-500">
              {{ $t('detectedCompanies.showing') }} {{ paginationFrom }}-{{ paginationTo }} {{ $t('detectedCompanies.of') }} {{ filteredCount }}
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
