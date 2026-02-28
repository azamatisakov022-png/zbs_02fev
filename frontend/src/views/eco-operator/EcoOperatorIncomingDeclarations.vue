<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import DataTable from '../../components/dashboard/DataTable.vue'
import EmptyState from '../../components/dashboard/EmptyState.vue'
import SkeletonLoader from '../../components/dashboard/SkeletonLoader.vue'
import { declarationStore } from '../../stores/declarations'
import { AppButton, AppBadge } from '../../components/ui'
import { getStatusBadgeVariant } from '../../utils/statusVariant'
import { DeclStatus } from '../../constants/statuses'
import { useEcoOperatorMenu } from '../../composables/useRoleMenu'
import SectionGuide from '../../components/common/SectionGuide.vue'

const router = useRouter()
const { t } = useI18n()
const { roleTitle, menuItems } = useEcoOperatorMenu()

// Loading state
const isLoading = ref(true)
onMounted(() => { setTimeout(() => { isLoading.value = false }, 500) })

// Filters
const searchQuery = ref('')
const statusFilter = ref('')
const yearFilter = ref('')

// Stats
const pendingCount = computed(() => declarationStore.state.declarations.filter(d => d.status === DeclStatus.UNDER_REVIEW).length)
const approvedCount = computed(() => declarationStore.state.declarations.filter(d => d.status === DeclStatus.APPROVED).length)
const rejectedCount = computed(() => declarationStore.state.declarations.filter(d => d.status === DeclStatus.REJECTED).length)
const totalCount = computed(() => declarationStore.state.declarations.length)

// Filtered data
const filteredDeclarations = computed(() => {
  let list = declarationStore.state.declarations
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(d => d.company.toLowerCase().includes(q) || d.inn.includes(q))
  }
  if (statusFilter.value) {
    list = list.filter(d => d.status === statusFilter.value)
  }
  if (yearFilter.value) {
    list = list.filter(d => d.reportingYear === yearFilter.value)
  }
  return list
})

const isFiltersActive = computed(() => !!(searchQuery.value || statusFilter.value || yearFilter.value))
const isFilteredEmpty = computed(() => filteredDeclarations.value.length === 0 && declarationStore.state.declarations.length > 0 && isFiltersActive.value)

const resetFilters = () => {
  searchQuery.value = ''
  statusFilter.value = ''
  yearFilter.value = ''
}

// Table columns — explicit pixel widths to prevent squeezing
const columns = computed(() => [
  { key: 'number', label: t('ecoIncomingDecls.colNumber'), width: '120px' },
  { key: 'submittedAt', label: t('ecoIncomingDecls.colSubmittedAt'), width: '100px' },
  { key: 'company', label: t('ecoIncomingDecls.colPayer'), width: '160px' },
  { key: 'inn', label: t('ecoIncomingDecls.colInn'), width: '130px' },
  { key: 'reportingYear', label: t('ecoIncomingDecls.colReportingYear'), width: '60px' },
  { key: 'totalCharged', label: t('ecoIncomingDecls.colCharged'), width: '110px' },
  { key: 'totalPaid', label: t('ecoIncomingDecls.colPaid'), width: '110px' },
  { key: 'balance', label: t('ecoIncomingDecls.colBalance'), width: '110px' },
  { key: 'status', label: t('ecoIncomingDecls.colStatus'), width: '150px' },
])

// Shorten long status text for the table badge
const shortStatus = (status: string) => {
  return status
}

const formatBalance = (value: number) => {
  const sign = value > 0 ? '+' : ''
  return sign + value.toLocaleString() + ' ' + t('ecoIncomingDecls.som')
}
</script>

<template>
  <DashboardLayout
    role="eco-operator"
    :roleTitle="roleTitle"
    userName="ОсОО «ЭкоПереработка»"
    :menuItems="menuItems"
  >
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div>
        <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b] mb-2">{{ $t('ecoIncomingDecls.title') }}</h1>
        <p class="text-[#64748b]">{{ $t('ecoIncomingDecls.subtitle') }}</p>
      </div>
      <div class="flex items-center gap-3">
        <span v-if="pendingCount > 0" class="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
          {{ pendingCount }} {{ $t('ecoIncomingDecls.underReviewBadge') }}
        </span>
      </div>
    </div>

    <SectionGuide
      :title="$t('ecoIncomingDecls.title')"
      :description="$t('ecoIncomingDecls.guideDescription')"
      :actions="[$t('ecoIncomingDecls.guideAction1'), $t('ecoIncomingDecls.guideAction2'), $t('ecoIncomingDecls.guideAction3'), $t('ecoIncomingDecls.guideAction4')]"
      storageKey="eco-declarations"
    />

    <!-- Gradient Stat Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-5 border border-yellow-200 shadow-sm">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p class="text-sm font-medium text-yellow-800">{{ $t('ecoIncomingDecls.statPending') }}</p>
        </div>
        <p class="text-3xl font-bold text-yellow-900">{{ pendingCount }}</p>
        <p class="text-xs text-yellow-600 mt-1">{{ $t('ecoIncomingDecls.statPendingDesc') }}</p>
      </div>
      <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-5 border border-green-200 shadow-sm">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p class="text-sm font-medium text-green-800">{{ $t('ecoIncomingDecls.statApproved') }}</p>
        </div>
        <p class="text-3xl font-bold text-green-900">{{ approvedCount }}</p>
        <p class="text-xs text-green-600 mt-1">{{ $t('ecoIncomingDecls.statApprovedDesc') }}</p>
      </div>
      <div class="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-5 border border-red-200 shadow-sm">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p class="text-sm font-medium text-red-800">{{ $t('ecoIncomingDecls.statRejected') }}</p>
        </div>
        <p class="text-3xl font-bold text-red-900">{{ rejectedCount }}</p>
        <p class="text-xs text-red-600 mt-1">{{ $t('ecoIncomingDecls.statRejectedDesc') }}</p>
      </div>
      <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 border border-blue-200 shadow-sm">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <p class="text-sm font-medium text-blue-800">{{ $t('ecoIncomingDecls.statTotal') }}</p>
        </div>
        <p class="text-3xl font-bold text-blue-900">{{ totalCount }}</p>
        <p class="text-xs text-blue-600 mt-1">{{ $t('ecoIncomingDecls.statTotalDesc') }}</p>
      </div>
    </div>

    <!-- Yellow Alert Banner -->
    <div v-if="pendingCount > 0" class="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-center gap-3">
      <div class="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center flex-shrink-0">
        <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      </div>
      <div>
        <p class="text-sm font-semibold text-yellow-900">{{ $t('ecoIncomingDecls.attentionRequired') }}</p>
        <p class="text-xs text-yellow-700">{{ pendingCount }} {{ pendingCount === 1 ? $t('ecoIncomingDecls.declAwaitsSingular') : $t('ecoIncomingDecls.declAwaitsPlural') }} {{ $t('ecoIncomingDecls.reviewCheckDecide') }}</p>
      </div>
    </div>

    <template v-if="isLoading">
      <div class="mb-6"><SkeletonLoader variant="card" /></div>
      <SkeletonLoader variant="table" />
    </template>

    <template v-if="!isLoading">
      <!-- Filters -->
      <div class="bg-white rounded-2xl p-4 shadow-sm border border-[#e2e8f0] mb-6">
        <div class="flex flex-wrap gap-4">
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="$t('ecoIncomingDecls.searchPlaceholder')"
            class="flex-1 min-w-[200px] px-4 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb]"
          />
          <select v-model="statusFilter" class="px-4 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb]">
            <option value="">{{ $t('common.allStatuses') }}</option>
            <option value="under_review">{{ $t('status.underReview') }}</option>
            <option value="approved">{{ $t('status.approvedFem') }}</option>
            <option value="rejected">{{ $t('status.rejectedFem') }}</option>
            <option value="revision">{{ $t('status.revision') }}</option>
          </select>
          <select v-model="yearFilter" class="px-4 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb]">
            <option value="">{{ $t('ecoIncomingDecls.allYears') }}</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
            <option value="2028">2028</option>
            <option value="2029">2029</option>
            <option value="2030">2030</option>
          </select>
        </div>
      </div>

      <!-- Search no results state -->
      <div v-if="isFilteredEmpty" class="mb-6">
        <EmptyState
          icon='<svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>'
          :title="$t('ecoIncomingDecls.nothingFound')"
          :description="$t('ecoIncomingDecls.nothingFoundDesc')"
          :actionLabel="$t('ecoIncomingDecls.resetFilters')"
          @action="resetFilters"
        />
      </div>

      <!-- Table -->
      <div class="declarations-table-wrap">
      <DataTable v-if="!isFilteredEmpty" :columns="columns" :data="filteredDeclarations" :actions="true">
        <template #cell-number="{ value }">
          <span class="font-mono font-medium text-[#2563eb]">{{ value }}</span>
        </template>
        <template #cell-company="{ value }">
          <span class="font-medium text-[#1e293b]">{{ value }}</span>
        </template>
        <template #cell-inn="{ value }">
          <span class="font-mono text-sm text-[#64748b]">{{ value }}</span>
        </template>
        <template #cell-reportingYear="{ value }">
          <span>{{ value }} {{ $t('ecoIncomingDecls.year') }}</span>
        </template>
        <template #cell-totalCharged="{ value }">
          <span class="font-medium">{{ value.toLocaleString() }} {{ $t('ecoIncomingDecls.som') }}</span>
        </template>
        <template #cell-totalPaid="{ value }">
          <span class="font-medium text-[#10b981]">{{ value.toLocaleString() }} {{ $t('ecoIncomingDecls.som') }}</span>
        </template>
        <template #cell-balance="{ value }">
          <span :class="['font-medium', value < 0 ? 'text-[#ef4444]' : 'text-[#10b981]']">{{ formatBalance(value) }}</span>
        </template>
        <template #cell-status="{ value }">
          <AppBadge :variant="getStatusBadgeVariant(value)">{{ shortStatus(value) }}</AppBadge>
        </template>
        <template #actions="{ row }">
          <div class="flex items-center justify-center gap-2">
            <AppButton variant="ghost" size="sm" @click="router.push('/eco-operator/declarations/' + row.id)">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {{ $t('ecoIncomingDecls.review') }}
            </AppButton>
          </div>
        </template>
        <template #empty>
          <EmptyState
            icon='<svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>'
            :title="$t('ecoIncomingDecls.noDeclarations')"
            :description="$t('ecoIncomingDecls.noDeclarationsDesc')"
          />
        </template>
      </DataTable>
      </div>
    </template>
  </DashboardLayout>
</template>

<style scoped>
/* ===== Container: horizontal scroll when table > viewport ===== */
.declarations-table-wrap {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

/* Let table escape the dash-card overflow-hidden */
.declarations-table-wrap :deep(.dash-card) {
  overflow: visible;
}

/* Table: keep fixed layout, enforce min-width so columns never compress */
.declarations-table-wrap :deep(table) {
  table-layout: fixed !important;
  width: 100%;
  min-width: 1200px;
}

/* ===== Status column (9th) — padding + center ===== */
.declarations-table-wrap :deep(thead th:nth-child(9)) {
  text-align: center;
}
.declarations-table-wrap :deep(tbody td:nth-child(9)) {
  padding-right: 24px !important;
  text-align: center;
}

/* ===== Actions column (10th) — override DataTable 100px → 130px ===== */
.declarations-table-wrap :deep(thead th:nth-child(10)) {
  width: 130px !important;
  text-align: center;
  padding-left: 16px !important;
}
.declarations-table-wrap :deep(tbody td:nth-child(10)) {
  width: 130px !important;
  text-align: center;
  padding-left: 16px !important;
}
</style>
