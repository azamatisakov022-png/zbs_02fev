<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import DataTable from '../../components/dashboard/DataTable.vue'
import EmptyState from '../../components/dashboard/EmptyState.vue'
import SkeletonLoader from '../../components/dashboard/SkeletonLoader.vue'
import { reportStore, type Report } from '../../stores/reports'
import { productGroups, getSubgroupByCode, isPackagingGroup } from '../../data/product-groups'
import { getNormativeForGroup } from '../../data/recycling-norms'
import { generateRecyclingReportExcel } from '../../utils/excelExport'
import { AppButton, AppBadge } from '../../components/ui'
import { getStatusBadgeVariant } from '../../utils/statusVariant'
import { ReportStatus } from '../../constants/statuses'
import { useEcoOperatorMenu } from '../../composables/useRoleMenu'
import { toastStore } from '../../stores/toast'
import SectionGuide from '../../components/common/SectionGuide.vue'
import { notificationStore } from '../../stores/notifications'

const router = useRouter()
const { t } = useI18n()
const { roleTitle, menuItems } = useEcoOperatorMenu()

// Loading state
const isLoading = ref(true)
onMounted(async () => {
  await reportStore.fetchAll()
  isLoading.value = false
})

const columns = computed(() => [
  { key: 'number', label: t('ecoIncomingReports.colNumber'), width: '9%' },
  { key: 'company', label: t('ecoIncomingReports.colOrganization'), width: '15%' },
  { key: 'inn', label: t('ecoIncomingReports.colInn'), width: '11%' },
  { key: 'year', label: t('ecoIncomingReports.colPeriod'), width: '7%' },
  { key: 'date', label: t('ecoIncomingReports.colDateSubmitted'), width: '9%' },
  { key: 'processingPercent', label: t('ecoIncomingReports.colCompletion'), width: '8%' },
  { key: 'status', label: t('ecoIncomingReports.colStatus'), width: '10%' },
])

// Filters
const searchQuery = ref('')
const statusFilter = ref('')
const periodFilter = ref('')

const filteredReports = computed(() => {
  let list = reportStore.state.reports.filter(r => r.status !== ReportStatus.DRAFT)
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(r => r.number.toLowerCase().includes(q) || r.company.toLowerCase().includes(q) || r.inn.includes(q))
  }
  if (statusFilter.value) {
    list = list.filter(r => r.status === statusFilter.value)
  }
  if (periodFilter.value) {
    list = list.filter(r => r.year === periodFilter.value)
  }
  return list
})

// Stats
const totalCount = computed(() => reportStore.state.reports.filter(r => r.status !== ReportStatus.DRAFT).length)
const pendingCount = computed(() => reportStore.state.reports.filter(r => r.status === ReportStatus.UNDER_REVIEW).length)
const approvedCount = computed(() => reportStore.state.reports.filter(r => r.status === ReportStatus.APPROVED).length)
const rejectedCount = computed(() => reportStore.state.reports.filter(r => r.status === ReportStatus.REJECTED).length)

const getStatusClass = (status: string) => {
  switch (status) {
    case 'draft': return 'bg-gray-100 text-gray-800'
    case 'under_review': return 'bg-yellow-100 text-yellow-800'
    case 'approved': return 'bg-green-100 text-green-800'
    case 'rejected': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getPercentClass = (percent: number) => {
  if (percent >= 100) return 'text-[#10b981] font-semibold'
  if (percent >= 80) return 'text-[#f59e0b] font-semibold'
  return 'text-[#ef4444] font-semibold'
}

const getWasteTypeLabel = (value: string) => {
  return productGroups.find(g => g.value === value)?.label || value
}

// Detail modal
const selectedReport = ref<Report | null>(null)
const showDetail = ref(false)
const rejectionReason = ref('')
const showRejectForm = ref(false)

const openDetail = (row: any) => {
  const report = reportStore.state.reports.find(r => r.id === row.id)
  if (report) {
    selectedReport.value = report
    showDetail.value = true
    showRejectForm.value = false
    rejectionReason.value = ''
  }
}

const closeDetail = () => {
  showDetail.value = false
  selectedReport.value = null
  showRejectForm.value = false
  rejectionReason.value = ''
}

// Confirmation modals
const showApproveConfirm = ref(false)
const approveComment = ref('')
const showReturnModal = ref(false)
const returnComment = ref('')

// Toast
const toastMessage = ref('')
const toastType = ref<'success' | 'danger' | 'warning'>('success')
const showToast = ref(false)

const displayToast = (message: string, type: 'success' | 'danger' | 'warning' = 'success') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  setTimeout(() => { showToast.value = false }, 3000)
}

const openApproveConfirm = () => {
  approveComment.value = ''
  showApproveConfirm.value = true
}

const confirmApprove = () => {
  if (selectedReport.value) {
    reportStore.approveReport(selectedReport.value.id, approveComment.value.trim() || undefined)
    notificationStore.add({
      type: 'success',
      title: t('ecoIncomingReports.notifReportApproved'),
      message: t('ecoIncomingReports.notifReportApprovedMsg', { number: selectedReport.value.number }),
      role: 'business'
    })
    showApproveConfirm.value = false
    closeDetail()
    displayToast(t('ecoIncomingReports.toastReportApproved'), 'success')
  }
}

const openReturnModal = () => {
  returnComment.value = ''
  showReturnModal.value = true
}

const confirmReturn = () => {
  if (selectedReport.value && returnComment.value.trim().length >= 10) {
    reportStore.returnReportForRevision(selectedReport.value.id, returnComment.value.trim())
    showReturnModal.value = false
    closeDetail()
    displayToast(t('ecoIncomingReports.toastReturnedForRevision'), 'warning')
  }
}

const rejectReport = () => {
  if (selectedReport.value && rejectionReason.value.trim().length >= 10) {
    reportStore.rejectReport(selectedReport.value.id, rejectionReason.value.trim())
    notificationStore.add({
      type: 'warning',
      title: t('ecoIncomingReports.notifReportRejected'),
      message: t('ecoIncomingReports.notifReportRejectedMsg', { number: selectedReport.value.number, reason: rejectionReason.value.trim() }),
      role: 'business'
    })
    showRejectForm.value = false
    closeDetail()
    displayToast(t('ecoIncomingReports.toastReportRejected'), 'danger')
  }
}

const downloadReportExcel = () => {
  if (!selectedReport.value) return
  generateRecyclingReportExcel(selectedReport.value, {
    name: selectedReport.value.company || '',
    inn: selectedReport.value.inn || '',
    address: '',
  })
}

// Empty state helpers
const allReports = computed(() => reportStore.state.reports.filter(r => r.status !== ReportStatus.DRAFT))
const isFiltersActive = computed(() => !!(searchQuery.value || statusFilter.value || periodFilter.value))

const resetFilters = () => {
  searchQuery.value = ''
  statusFilter.value = ''
  periodFilter.value = ''
}
</script>

<template>
  <DashboardLayout
    role="eco-operator"
    :roleTitle="roleTitle"
    userName="ОсОО «ЭкоПереработка»"
    :menuItems="menuItems"
  >
    <div class="mb-6">
      <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b] mb-2">{{ $t('pages.ecoOperator.incomingReportsTitle') }}</h1>
      <p class="text-[#64748b]">{{ $t('pages.ecoOperator.incomingReportsSubtitle') }}</p>
    </div>

    <SectionGuide
      :title="$t('ecoIncomingReports.guideTitle')"
      :description="$t('ecoIncomingReports.guideDescription')"
      :actions="[$t('ecoIncomingReports.guideAction1'), $t('ecoIncomingReports.guideAction2'), $t('ecoIncomingReports.guideAction3'), $t('ecoIncomingReports.guideAction4')]"
      storageKey="eco-recycling-reports"
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
          <p class="text-sm font-medium text-yellow-800">{{ $t('ecoIncomingReports.statUnderReview') }}</p>
        </div>
        <p class="text-3xl font-bold text-yellow-900">{{ pendingCount }}</p>
        <p class="text-xs text-yellow-600 mt-1">{{ $t('ecoIncomingReports.statReportsUnderReview') }}</p>
      </div>
      <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-5 border border-green-200 shadow-sm">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p class="text-sm font-medium text-green-800">{{ $t('ecoIncomingReports.statApproved') }}</p>
        </div>
        <p class="text-3xl font-bold text-green-900">{{ approvedCount }}</p>
        <p class="text-xs text-green-600 mt-1">{{ $t('ecoIncomingReports.statReportsApproved') }}</p>
      </div>
      <div class="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-5 border border-red-200 shadow-sm">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p class="text-sm font-medium text-red-800">{{ $t('ecoIncomingReports.statRejected') }}</p>
        </div>
        <p class="text-3xl font-bold text-red-900">{{ rejectedCount }}</p>
        <p class="text-xs text-red-600 mt-1">{{ $t('ecoIncomingReports.statReportsRejected') }}</p>
      </div>
      <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 border border-blue-200 shadow-sm">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <p class="text-sm font-medium text-blue-800">{{ $t('ecoIncomingReports.statTotalReports') }}</p>
        </div>
        <p class="text-3xl font-bold text-blue-900">{{ totalCount }}</p>
        <p class="text-xs text-blue-600 mt-1">{{ $t('ecoIncomingReports.statTotalReportsDesc') }}</p>
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
        <p class="text-sm font-semibold text-yellow-900">{{ $t('ecoIncomingReports.attentionRequired') }}</p>
        <p class="text-xs text-yellow-700">{{ pendingCount }} {{ pendingCount === 1 ? $t('ecoIncomingReports.newReportSingular') : $t('ecoIncomingReports.newReportPlural') }} {{ $t('ecoIncomingReports.alertCheckAndDecide') }}</p>
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
          :placeholder="$t('ecoIncomingReports.searchPlaceholder')"
          class="flex-1 min-w-[200px] px-4 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb]"
        />
        <select v-model="statusFilter" class="px-4 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb]">
          <option value="">{{ $t('common.allStatuses') }}</option>
          <option value="under_review">{{ $t('status.underReview') }}</option>
          <option value="approved">{{ $t('status.approvedMasc') }}</option>
          <option value="rejected">{{ $t('status.rejectedMasc') }}</option>
          <option value="revision">{{ $t('status.revision') }}</option>
        </select>
        <select v-model="periodFilter" class="px-4 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb]">
          <option value="">{{ $t('ecoIncomingReports.allPeriods') }}</option>
          <option value="2024">2024</option>
          <option value="2025">2025</option>
          <option value="2026">2026</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <DataTable :columns="columns" :data="filteredReports" :actions="true">
      <template #cell-number="{ value }">
        <span class="font-mono font-medium text-[#2563eb]">{{ value }}</span>
      </template>
      <template #cell-company="{ value }">
        <span class="font-medium text-[#1e293b]">{{ value }}</span>
      </template>
      <template #cell-year="{ value }">
        <span>{{ value }} {{ $t('ecoIncomingReports.yearSuffix') }}</span>
      </template>
      <template #cell-processingPercent="{ value }">
        <span :class="getPercentClass(value)">{{ value }}%</span>
      </template>
      <template #cell-status="{ value }">
        <AppBadge :variant="getStatusBadgeVariant(value)">{{ value }}</AppBadge>
      </template>
      <template #actions="{ row }">
        <div class="flex flex-wrap items-center justify-end gap-2">
          <AppButton variant="ghost" size="sm" @click="router.push({ path: '/eco-operator/reports/' + row.id, query: { from: 'incoming-reports' } })">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {{ $t('ecoIncomingReports.details') }}
          </AppButton>
          <AppButton
            v-if="row.status === 'under_review'"
            variant="secondary" size="sm"
            @click="openDetail(row)"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            {{ $t('ecoIncomingReports.review') }}
          </AppButton>
        </div>
      </template>
      <template #empty>
        <EmptyState
          v-if="isFiltersActive && allReports.length > 0"
          icon='<svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>'
          :title="$t('empty.noSearchResults')"
          :description="$t('empty.noSearchResultsDesc')"
          :actionLabel="$t('empty.resetFilters')"
          @action="resetFilters"
        />
        <EmptyState
          v-else
          icon='<svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>'
          :title="$t('ecoIncomingReports.emptyReportsTitle')"
          :description="$t('ecoIncomingReports.emptyReportsDesc')"
        />
      </template>
    </DataTable>
    </template>

    <!-- Detail Modal -->
    <Teleport to="body">
      <div v-if="showDetail && selectedReport" class="fixed inset-0 bg-black/50 z-[100] flex items-start justify-center pt-8 overflow-y-auto" @click.self="closeDetail">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 mb-8">
          <!-- Modal Header -->
          <div class="flex items-center justify-between p-6 border-b border-[#e2e8f0]">
            <div>
              <h2 class="text-xl font-bold text-[#1e293b]">{{ $t('ecoIncomingReports.reportNumber') }} {{ selectedReport.number }}</h2>
              <p class="text-sm text-[#64748b]">{{ $t('ecoIncomingReports.fromDate') }} {{ selectedReport.date }}</p>
            </div>
            <div class="flex items-center gap-3">
              <AppBadge :variant="getStatusBadgeVariant(selectedReport.status)">{{ selectedReport.status }}</AppBadge>
              <button @click="closeDetail" class="p-2 text-[#64748b] hover:bg-gray-100 rounded-lg">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Modal Body -->
          <div class="p-6 space-y-6">
            <!-- Company Info -->
            <div class="bg-[#f8fafc] rounded-xl p-4 border border-[#e2e8f0]">
              <h3 class="font-semibold text-[#1e293b] mb-3">{{ $t('ecoIncomingReports.organizationData') }}</h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <span class="text-[#64748b]">{{ $t('ecoIncomingReports.organizationLabel') }}</span>
                  <span class="ml-2 font-medium text-[#1e293b]">{{ selectedReport.company }}</span>
                </div>
                <div>
                  <span class="text-[#64748b]">{{ $t('ecoIncomingReports.innLabel') }}</span>
                  <span class="ml-2 font-medium text-[#1e293b]">{{ selectedReport.inn }}</span>
                </div>
                <div>
                  <span class="text-[#64748b]">{{ $t('ecoIncomingReports.reportingPeriodLabel') }}</span>
                  <span class="ml-2 font-medium text-[#1e293b]">{{ selectedReport.year }} {{ $t('ecoIncomingReports.yearSuffix') }}</span>
                </div>
                <div>
                  <span class="text-[#64748b]">{{ $t('ecoIncomingReports.submissionDateLabel') }}</span>
                  <span class="ml-2 font-medium text-[#1e293b]">{{ selectedReport.date }}</span>
                </div>
              </div>
            </div>

            <!-- Processing Summary Cards -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div class="bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
                <p class="text-xs text-[#64748b] mb-1">{{ $t('ecoIncomingReports.declared') }}</p>
                <p class="text-xl font-bold text-[#2563eb]">{{ selectedReport.totalDeclared }} т</p>
              </div>
              <div class="bg-green-50 rounded-xl p-4 text-center border border-green-100">
                <p class="text-xs text-[#64748b] mb-1">{{ $t('ecoIncomingReports.processed') }}</p>
                <p class="text-xl font-bold text-[#10b981]">{{ selectedReport.totalProcessed }} т</p>
              </div>
              <div :class="[
                'rounded-xl p-4 text-center border',
                selectedReport.processingPercent >= 100 ? 'bg-green-50 border-green-100' : selectedReport.processingPercent >= 80 ? 'bg-yellow-50 border-yellow-100' : 'bg-red-50 border-red-100'
              ]">
                <p class="text-xs text-[#64748b] mb-1">{{ $t('ecoIncomingReports.completion') }}</p>
                <p :class="[
                  'text-xl font-bold',
                  selectedReport.processingPercent >= 100 ? 'text-[#10b981]' : selectedReport.processingPercent >= 80 ? 'text-[#f59e0b]' : 'text-[#ef4444]'
                ]">{{ selectedReport.processingPercent }}%</p>
              </div>
            </div>

            <!-- Processing Items Table -->
            <div>
              <h3 class="font-semibold text-[#1e293b] mb-3">{{ $t('ecoIncomingReports.processingDetails') }}</h3>
              <div class="overflow-x-auto border border-[#e2e8f0] rounded-xl">
                <table class="w-full text-sm border-collapse">
                  <thead class="bg-[#f8fafc]">
                    <tr class="text-left text-[#64748b]">
                      <th class="px-4 py-3 font-medium" style="min-width: 200px">{{ $t('ecoIncomingReports.thProductGroup') }}</th>
                      <th class="px-4 py-3 font-medium" style="min-width: 120px">{{ $t('ecoIncomingReports.thGskpMaterial') }}</th>
                      <th class="px-4 py-3 font-medium" style="min-width: 120px">{{ $t('ecoIncomingReports.thTnvedTrts') }}</th>
                      <th class="px-4 py-3 font-medium" style="min-width: 150px">{{ $t('ecoIncomingReports.thName') }}</th>
                      <th class="px-4 py-3 font-medium text-right" style="min-width: 100px">{{ $t('ecoIncomingReports.thDeclared') }}</th>
                      <th class="px-4 py-3 font-medium text-right" style="min-width: 100px">{{ $t('ecoIncomingReports.thProcessed') }}</th>
                      <th class="px-4 py-3 font-medium text-right" style="min-width: 80px">%</th>
                      <th class="px-4 py-3 font-medium" style="min-width: 150px">{{ $t('ecoIncomingReports.thRecycler') }}</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-[#e2e8f0]">
                    <tr v-for="item in selectedReport.items" :key="item.id" class="hover:bg-[#f8fafc]">
                      <td class="px-4 py-3 text-[#1e293b]">{{ getWasteTypeLabel(item.wasteType) }}</td>
                      <template v-if="!isPackagingGroup(item.wasteType)">
                        <td class="px-4 py-3 font-mono text-xs text-[#64748b]">{{ getSubgroupByCode(item.wasteType, item.wasteCode)?.gskpCode || '—' }}</td>
                        <td class="px-4 py-3 font-mono text-xs text-[#64748b]">{{ item.wasteCode }}</td>
                        <td class="px-4 py-3 text-xs text-[#64748b]">{{ getSubgroupByCode(item.wasteType, item.wasteCode)?.tnvedName || '—' }}</td>
                      </template>
                      <template v-else>
                        <td class="px-4 py-3 text-xs text-[#64748b]">{{ getSubgroupByCode(item.wasteType, item.wasteCode)?.packagingMaterial || '—' }}</td>
                        <td class="px-4 py-3 font-mono text-xs text-[#64748b]">{{ getSubgroupByCode(item.wasteType, item.wasteCode)?.packagingLetterCode || '—' }}</td>
                        <td class="px-4 py-3 font-mono text-xs text-[#64748b]">{{ getSubgroupByCode(item.wasteType, item.wasteCode)?.packagingDigitalCode || '—' }}</td>
                      </template>
                      <td class="px-4 py-3 text-right font-medium">{{ item.declared }}</td>
                      <td class="px-4 py-3 text-right font-medium text-[#10b981]">{{ item.processed }}</td>
                      <td class="px-4 py-3 text-right font-semibold" :class="((parseFloat(item.processed) / parseFloat(item.declared)) * 100) >= (getNormativeForGroup(item.wasteType, parseInt(selectedReport.year)) * 100) ? 'text-[#10b981]' : 'text-[#ef4444]'">
                        {{ ((parseFloat(item.processed) / parseFloat(item.declared)) * 100).toFixed(1) }}%
                      </td>
                      <td class="px-4 py-3 text-xs text-[#64748b]">{{ item.recycler }}</td>
                    </tr>
                  </tbody>
                  <tfoot class="bg-[#f8fafc] font-semibold">
                    <tr>
                      <td colspan="4" class="px-4 py-3">{{ $t('ecoIncomingReports.total') }}</td>
                      <td class="px-4 py-3 text-right">{{ selectedReport.totalDeclared }} т</td>
                      <td class="px-4 py-3 text-right text-[#10b981]">{{ selectedReport.totalProcessed }} т</td>
                      <td class="px-4 py-3 text-right" :class="selectedReport.processingPercent >= (getNormativeForGroup(selectedReport.items[0]?.wasteType || 'group_5', parseInt(selectedReport.year)) * 100) ? 'text-[#10b981]' : 'text-[#ef4444]'">{{ selectedReport.processingPercent }}%</td>
                      <td class="px-4 py-3"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <!-- Documents -->
            <div v-if="selectedReport.files.length > 0" class="bg-[#f8fafc] rounded-xl p-4 border border-[#e2e8f0]">
              <h3 class="font-semibold text-[#1e293b] mb-3">{{ $t('ecoIncomingReports.attachedDocuments') }} ({{ selectedReport.files.length }})</h3>
              <div class="space-y-2">
                <div v-for="file in selectedReport.files" :key="file.id" class="flex items-center gap-3 bg-white rounded-lg px-4 py-3 border border-[#e2e8f0]">
                  <div class="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                    <svg class="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div class="flex-1">
                    <p class="text-sm font-medium text-[#1e293b]">{{ file.name }}</p>
                    <p class="text-xs text-[#64748b]">{{ file.size }}</p>
                  </div>
                  <button @click="toastStore.show({ type: 'info', title: $t('ecoIncomingReports.downloadTitle'), message: $t('ecoIncomingReports.downloadUnavailableMsg') })" class="text-[#2563eb] hover:text-[#1d4ed8] text-sm font-medium">{{ $t('common.download') }}</button>
                </div>
              </div>
            </div>
            <div v-else class="bg-[#f8fafc] rounded-xl p-4 border border-[#e2e8f0]">
              <h3 class="font-semibold text-[#1e293b] mb-2">{{ $t('ecoIncomingReports.attachedDocuments') }}</h3>
              <p class="text-sm text-[#64748b]">{{ $t('ecoIncomingReports.noDocumentsAttached') }}</p>
            </div>

            <!-- Excel Export Button -->
            <div class="flex justify-end">
              <AppButton variant="primary" size="sm" @click="downloadReportExcel">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                {{ $t('ecoIncomingReports.downloadExcel') }}
              </AppButton>
            </div>

            <!-- Rejection reason if rejected -->
            <div v-if="selectedReport.status === 'rejected' && selectedReport.rejectionReason" class="bg-red-50 border border-red-200 rounded-xl p-4">
              <p class="font-medium text-red-800 mb-1">{{ $t('ecoIncomingReports.rejectionReason') }}</p>
              <p class="text-sm text-red-700">{{ selectedReport.rejectionReason }}</p>
            </div>

            <!-- Reject Form -->
            <div v-if="showRejectForm" class="bg-red-50 border border-red-200 rounded-xl p-4">
              <h3 class="font-semibold text-red-800 mb-3">{{ $t('ecoIncomingReports.specifyRejectionReason') }}</h3>
              <textarea
                v-model="rejectionReason"
                rows="3"
                :placeholder="$t('ecoIncomingReports.rejectionPlaceholder')"
                class="w-full px-4 py-3 border border-red-200 rounded-lg focus:outline-none focus:border-red-400 text-sm"
              ></textarea>
              <p class="text-xs text-[#94a3b8] mt-1 mb-3">{{ $t('ecoIncomingReports.minChars') }}</p>
              <div class="flex justify-end gap-3">
                <AppButton variant="secondary" @click="showRejectForm = false">
                  {{ $t('common.cancel') }}
                </AppButton>
                <AppButton
                  variant="danger"
                  @click="rejectReport"
                  :disabled="rejectionReason.trim().length < 10"
                >
                  {{ $t('ecoIncomingReports.rejectReport') }}
                </AppButton>
              </div>
            </div>
          </div>

          <!-- Review result banner for processed reports -->
          <div v-if="selectedReport.status === 'approved' && selectedReport.reviewDate" class="mx-6 mb-4 bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
            <svg class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
            <div>
              <p class="font-medium text-green-800">{{ $t('ecoIncomingReports.reportApprovedBy', { date: selectedReport.reviewDate, reviewer: selectedReport.reviewer }) }}</p>
            </div>
          </div>
          <div v-if="selectedReport.status === 'revision' && selectedReport.rejectionReason" class="mx-6 mb-4 bg-orange-50 border border-orange-200 rounded-xl p-4">
            <p class="font-medium text-orange-800 mb-1">{{ $t('ecoIncomingReports.returnedForRevision', { date: selectedReport.reviewDate }) }}</p>
            <p class="text-sm text-orange-700">{{ selectedReport.rejectionReason }}</p>
          </div>

          <!-- History log -->
          <div v-if="selectedReport.history && selectedReport.history.length > 0" class="mx-6 mb-4">
            <h3 class="font-semibold text-[#1e293b] mb-3">{{ $t('ecoIncomingReports.reviewHistory') }}</h3>
            <div class="space-y-3">
              <div v-for="entry in selectedReport.history" :key="entry.id" class="flex items-start gap-3">
                <div :class="[
                  'w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0',
                  entry.action.includes('принят') ? 'bg-green-500' :
                  entry.action.includes('отклонён') ? 'bg-red-500' :
                  entry.action.includes('доработку') ? 'bg-orange-500' : 'bg-blue-500'
                ]"></div>
                <div>
                  <p class="text-sm text-[#1e293b]"><span class="font-medium">{{ entry.action }}</span> — {{ entry.user }}</p>
                  <p class="text-xs text-[#94a3b8]">{{ entry.date }}</p>
                  <p v-if="entry.comment" class="text-xs text-[#64748b] mt-1">{{ entry.comment }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Modal Footer: Review actions -->
          <div v-if="selectedReport.status === 'under_review' && !showRejectForm" class="flex flex-wrap justify-end gap-3 p-6 border-t border-[#e2e8f0]">
            <AppButton variant="danger" @click="showRejectForm = true">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              {{ $t('ecoIncomingReports.reject') }}
            </AppButton>
            <button @click="openReturnModal" class="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              {{ $t('ecoIncomingReports.forRevision') }}
            </button>
            <button @click="openApproveConfirm" class="flex items-center gap-2 px-4 py-2 bg-[#22C55E] text-white rounded-lg hover:bg-[#16A34A] transition-colors text-sm font-medium">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              {{ $t('ecoIncomingReports.approveReport') }}
            </button>
          </div>

          <!-- Close button for other statuses -->
          <div v-else-if="selectedReport.status !== 'under_review'" class="flex justify-end p-6 border-t border-[#e2e8f0]">
            <AppButton variant="secondary" @click="closeDetail">
              {{ $t('common.close') }}
            </AppButton>
          </div>
        </div>
      </div>
    </Teleport>
    <!-- Approve Confirmation Modal -->
    <Teleport to="body">
      <div v-if="showApproveConfirm" class="fixed inset-0 z-[110] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showApproveConfirm = false"></div>
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
          <h3 class="text-lg font-semibold text-[#1e293b] mb-2">{{ $t('ecoIncomingReports.approveReportQuestion') }}</h3>
          <p class="text-sm text-[#64748b] mb-4">{{ $t('ecoIncomingReports.approveReportConfirm', { number: selectedReport?.number }) }}</p>
          <textarea
            v-model="approveComment"
            rows="3"
            :placeholder="$t('ecoIncomingReports.commentOptional')"
            class="w-full px-4 py-3 border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20 resize-none mb-4 text-sm"
          ></textarea>
          <div class="flex justify-end gap-3">
            <button @click="showApproveConfirm = false" class="px-4 py-2 border border-[#e2e8f0] rounded-lg text-[#64748b] hover:bg-[#f8fafc] transition-colors text-sm font-medium">{{ $t('common.cancel') }}</button>
            <button @click="confirmApprove" class="px-4 py-2 bg-[#22C55E] text-white rounded-lg hover:bg-[#16A34A] transition-colors text-sm font-medium">{{ $t('common.confirm') }}</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Return for Revision Modal -->
    <Teleport to="body">
      <div v-if="showReturnModal" class="fixed inset-0 z-[110] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showReturnModal = false"></div>
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
          <h3 class="text-lg font-semibold text-[#1e293b] mb-2">{{ $t('ecoIncomingReports.returnForRevisionTitle') }}</h3>
          <p class="text-sm text-[#64748b] mb-4">{{ $t('ecoIncomingReports.reportFromCompany', { number: selectedReport?.number, company: selectedReport?.company }) }}</p>
          <label class="block text-sm font-medium text-[#1e293b] mb-2">{{ $t('ecoIncomingReports.specifyWhatToFix') }}</label>
          <textarea
            v-model="returnComment"
            rows="4"
            :placeholder="$t('ecoIncomingReports.returnPlaceholder')"
            class="w-full px-4 py-3 border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200 resize-none mb-1 text-sm"
          ></textarea>
          <p class="text-xs text-[#94a3b8] mb-4">{{ $t('ecoIncomingReports.minChars') }}</p>
          <div class="flex justify-end gap-3">
            <button @click="showReturnModal = false" class="px-4 py-2 border border-[#e2e8f0] rounded-lg text-[#64748b] hover:bg-[#f8fafc] transition-colors text-sm font-medium">{{ $t('common.cancel') }}</button>
            <button @click="confirmReturn" :disabled="returnComment.trim().length < 10" class="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">{{ $t('ecoIncomingReports.returnForRevisionBtn') }}</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Toast Notification -->
    <Teleport to="body">
      <Transition name="toast">
        <div v-if="showToast" :class="[
          'fixed top-6 right-6 z-[200] px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium flex items-center gap-2',
          toastType === 'success' ? 'bg-[#22C55E]' : toastType === 'danger' ? 'bg-red-500' : 'bg-orange-500'
        ]">
          <svg v-if="toastType === 'success'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
          <svg v-else-if="toastType === 'danger'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
          {{ toastMessage }}
        </div>
      </Transition>
    </Teleport>
  </DashboardLayout>
</template>

<style scoped>
.toast-enter-active { transition: all 0.3s ease-out; }
.toast-leave-active { transition: all 0.3s ease-in; }
.toast-enter-from { opacity: 0; transform: translateX(100px); }
.toast-leave-to { opacity: 0; transform: translateX(100px); }
</style>
