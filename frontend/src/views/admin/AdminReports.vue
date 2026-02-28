<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import DataTable from '../../components/dashboard/DataTable.vue'
import { AppButton, AppBadge } from '../../components/ui'
import { getStatusBadgeVariant } from '../../utils/statusVariant'
import { ReportStatus } from '../../constants/statuses'
import { useAdminMenu } from '../../composables/useRoleMenu'

const { t } = useI18n()
const { roleTitle, menuItems } = useAdminMenu()

const columns = computed(() => [
  { key: 'number', label: t('adminReports.colNumber'), width: '9%' },
  { key: 'company', label: t('adminReports.colOrganization'), width: '15%' },
  { key: 'type', label: t('adminReports.colReportType'), width: '18%' },
  { key: 'period', label: t('adminReports.colPeriod'), width: '8%' },
  { key: 'submittedAt', label: t('adminReports.colSubmittedAt'), width: '9%' },
  { key: 'status', label: t('adminReports.colStatus'), width: '10%' },
])

interface Report {
  id: number; number: string; company: string; type: string; period: string; submittedAt: string; status: string
  recycledTons?: string; categories?: string
}

const reports = ref<Report[]>([
  { id: 1, number: 'РП-2026-018', company: 'ОсОО "ТехПром"', type: 'Отчёт о нормативах переработки', period: '2025 год', submittedAt: '21.01.2026', status: ReportStatus.UNDER_REVIEW, recycledTons: '145.2 т', categories: '5 категорий' },
  { id: 2, number: 'РП-2026-017', company: 'ОАО "СтройМаркет"', type: 'Отчёт о нормативах переработки', period: '2025 год', submittedAt: '20.01.2026', status: ReportStatus.UNDER_REVIEW, recycledTons: '89.7 т', categories: '3 категории' },
  { id: 3, number: 'РП-2026-016', company: 'ОсОО "ПищеПром"', type: 'Отчёт о нормативах переработки', period: '2025 год', submittedAt: '19.01.2026', status: ReportStatus.APPROVED, recycledTons: '210.5 т', categories: '6 категорий' },
  { id: 4, number: 'РП-2026-015', company: 'ИП Асанов Б.К.', type: 'Отчёт о нормативах переработки', period: '2025 год', submittedAt: '18.01.2026', status: ReportStatus.APPROVED, recycledTons: '32.1 т', categories: '2 категории' },
  { id: 5, number: 'РП-2026-012', company: 'ОсОО "ТехПром"', type: 'Отчёт о нормативах переработки', period: '2025 год', submittedAt: '15.07.2025', status: ReportStatus.APPROVED, recycledTons: '120.8 т', categories: '5 категорий' },
  { id: 6, number: 'РП-2026-010', company: 'ОАО "МегаТорг"', type: 'Отчёт о нормативах переработки', period: '2025 год', submittedAt: '12.01.2026', status: ReportStatus.REJECTED, recycledTons: '78.4 т', categories: '4 категории' },
])

const searchQuery = ref('')
const filterPeriod = ref('')
const filterStatus = ref('')

const filteredReports = computed(() => {
  return reports.value.filter(r => {
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      if (!r.number.toLowerCase().includes(q) && !r.company.toLowerCase().includes(q)) return false
    }
    if (filterPeriod.value && r.period !== filterPeriod.value) return false
    if (filterStatus.value && r.status !== filterStatus.value) return false
    return true
  })
})

// View
const showViewModal = ref(false)
const viewingReport = ref<Report | null>(null)

function openView(report: Report) {
  viewingReport.value = report
  showViewModal.value = true
}

// Accept/Reject
const showConfirmModal = ref(false)
const confirmAction = ref<'accept' | 'reject'>('accept')
const confirmReport = ref<Report | null>(null)
const rejectReason = ref('')

function openConfirm(report: Report, action: 'accept' | 'reject') {
  confirmReport.value = report
  confirmAction.value = action
  rejectReason.value = ''
  showConfirmModal.value = true
}

function executeAction() {
  if (confirmReport.value) {
    confirmReport.value.status = confirmAction.value === 'accept' ? ReportStatus.APPROVED : ReportStatus.REJECTED
  }
  showConfirmModal.value = false
}

function exportToExcel() {
  const headers = [t('adminReports.csvNumber'), t('adminReports.csvOrganization'), t('adminReports.csvType'), t('adminReports.csvPeriod'), t('adminReports.csvSubmittedAt'), t('adminReports.csvStatus')]
  const rows = filteredReports.value.map(r => [r.number, r.company, r.type, r.period, r.submittedAt, r.status])
  const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `reports_${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
}

function downloadPdf(report: Report) {
  const blob = new Blob([`Отчёт ${report.number}\nОрганизация: ${report.company}\nПериод: ${report.period}`], { type: 'text/plain' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${report.number}.txt`
  link.click()
}

function handleOverlay(e: MouseEvent, close: () => void) {
  if ((e.target as HTMLElement).classList.contains('modal-overlay')) close()
}
</script>

<template>
  <DashboardLayout role="admin" :roleTitle="roleTitle" userName="Иван Петров" :menuItems="menuItems">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div>
        <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b] mb-2">{{ $t('adminReports.title') }}</h1>
        <p class="text-[#64748b]">{{ $t('adminReports.subtitle') }}</p>
      </div>
      <AppButton variant="primary" @click="exportToExcel">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
        {{ $t('adminReports.exportExcel') }}
      </AppButton>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]"><p class="text-sm text-[#64748b] mb-1">{{ $t('adminReports.totalReports') }}</p><p class="text-2xl font-bold text-[#1e293b]">{{ reports.length }}</p></div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]"><p class="text-sm text-[#64748b] mb-1">{{ $t('adminReports.accepted') }}</p><p class="text-2xl font-bold text-[#10b981]">{{ reports.filter(r => r.status === 'approved').length }}</p></div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]"><p class="text-sm text-[#64748b] mb-1">{{ $t('adminReports.onReview') }}</p><p class="text-2xl font-bold text-[#f59e0b]">{{ reports.filter(r => r.status === 'under_review').length }}</p></div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]"><p class="text-sm text-[#64748b] mb-1">{{ $t('adminReports.rejected') }}</p><p class="text-2xl font-bold text-[#ef4444]">{{ reports.filter(r => r.status === 'rejected').length }}</p></div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-2xl p-4 shadow-sm border border-[#e2e8f0] mb-6">
      <div class="flex flex-wrap gap-4">
        <input v-model="searchQuery" type="text" :placeholder="$t('adminReports.searchPlaceholder')" class="flex-1 min-w-[200px] px-4 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb]" />
        <select v-model="filterPeriod" class="px-4 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb]">
          <option value="">{{ $t('adminReports.allPeriods') }}</option><option value="2025 год">2025 год</option><option value="2026 год">2026 год</option><option value="2027 год">2027 год</option><option value="2028 год">2028 год</option><option value="2029 год">2029 год</option><option value="2030 год">2030 год</option>
        </select>
        <select v-model="filterStatus" class="px-4 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb]">
          <option value="">{{ $t('adminReports.allStatuses') }}</option><option value="under_review">{{ $t('status.underReview') }}</option><option value="approved">{{ $t('status.approved') }}</option><option value="rejected">{{ $t('status.rejected') }}</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <DataTable :columns="columns" :data="filteredReports" :actions="true">
      <template #cell-number="{ value }"><span class="font-mono font-medium text-[#2563eb]">{{ value }}</span></template>
      <template #cell-company="{ value }"><span class="font-medium text-[#1e293b]">{{ value }}</span></template>
      <template #cell-status="{ value }"><AppBadge :variant="getStatusBadgeVariant(value)">{{ $t('status.' + (value === 'under_review' ? 'underReview' : value)) }}</AppBadge></template>
      <template #actions="{ row }">
        <div class="flex items-center justify-end gap-2">
          <AppButton variant="ghost" size="sm" @click="openView(row)">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            {{ $t('adminReports.btnView') }}
          </AppButton>
          <AppButton v-if="row.status === 'under_review'" variant="primary" size="sm" @click="openConfirm(row, 'accept')">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
            {{ $t('adminReports.btnAccept') }}
          </AppButton>
          <AppButton v-if="row.status === 'under_review'" variant="danger" size="sm" @click="openConfirm(row, 'reject')">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            {{ $t('adminReports.btnReject') }}
          </AppButton>
          <AppButton variant="outline" size="sm" @click="downloadPdf(row)">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            {{ $t('adminReports.btnDownloadPdf') }}
          </AppButton>
        </div>
      </template>
    </DataTable>

    <!-- View Modal -->
    <Teleport to="body">
      <div v-if="showViewModal && viewingReport" class="modal-overlay fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" style="backdrop-filter:blur(4px);" @click="(e: MouseEvent) => handleOverlay(e, () => showViewModal = false)">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
          <div class="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <p class="font-mono text-[#2563eb] font-medium">{{ viewingReport.number }}</p>
              <h3 class="text-lg font-bold text-[#1e293b]">{{ viewingReport.type }}</h3>
            </div>
            <button @click="showViewModal = false" class="p-2 text-gray-400 hover:text-gray-600 rounded-lg"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
          <div class="p-6">
            <div class="bg-[#f8fafc] rounded-xl p-4 grid grid-cols-2 gap-4 text-sm">
              <div><p class="text-[#94a3b8]">{{ $t('adminReports.labelOrganization') }}</p><p class="text-[#1e293b] font-medium">{{ viewingReport.company }}</p></div>
              <div><p class="text-[#94a3b8]">{{ $t('adminReports.labelPeriod') }}</p><p class="text-[#1e293b] font-medium">{{ viewingReport.period }}</p></div>
              <div><p class="text-[#94a3b8]">{{ $t('adminReports.labelSubmittedAt') }}</p><p class="text-[#1e293b] font-medium">{{ viewingReport.submittedAt }}</p></div>
              <div><p class="text-[#94a3b8]">{{ $t('adminReports.labelStatus') }}</p><AppBadge :variant="getStatusBadgeVariant(viewingReport.status)">{{ $t('status.' + (viewingReport.status === 'under_review' ? 'underReview' : viewingReport.status)) }}</AppBadge></div>
              <div><p class="text-[#94a3b8]">{{ $t('adminReports.labelRecycled') }}</p><p class="text-[#1e293b] font-bold">{{ viewingReport.recycledTons }}</p></div>
              <div><p class="text-[#94a3b8]">{{ $t('adminReports.labelCategories') }}</p><p class="text-[#1e293b] font-medium">{{ viewingReport.categories }}</p></div>
            </div>
          </div>
          <div class="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
            <AppButton v-if="viewingReport.status === 'under_review'" variant="danger" @click="showViewModal = false; openConfirm(viewingReport!, 'reject')">{{ $t('adminReports.btnReject') }}</AppButton>
            <AppButton v-if="viewingReport.status === 'under_review'" variant="primary" @click="showViewModal = false; openConfirm(viewingReport!, 'accept')">{{ $t('adminReports.btnAccept') }}</AppButton>
            <AppButton v-else variant="primary" @click="showViewModal = false">{{ $t('adminReports.btnClose') }}</AppButton>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Confirm Modal -->
    <Teleport to="body">
      <div v-if="showConfirmModal && confirmReport" class="modal-overlay fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" style="backdrop-filter:blur(4px);" @click="(e: MouseEvent) => handleOverlay(e, () => showConfirmModal = false)">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md">
          <div class="p-6 text-center">
            <div :class="['w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4', confirmAction === 'accept' ? 'bg-green-100' : 'bg-red-100']">
              <svg v-if="confirmAction === 'accept'" class="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
              <svg v-else class="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </div>
            <h3 class="text-xl font-bold text-[#1e293b] mb-2">{{ confirmAction === 'accept' ? $t('adminReports.confirmAcceptTitle') : $t('adminReports.confirmRejectTitle') }}</h3>
            <p class="text-[#64748b]"><span class="font-medium text-[#1e293b]">{{ confirmReport.number }}</span> {{ $t('adminReports.from') }} {{ confirmReport.company }}</p>
          </div>
          <div v-if="confirmAction === 'reject'" class="px-6 pb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('adminReports.rejectReasonLabel') }}</label>
            <textarea v-model="rejectReason" rows="3" :placeholder="$t('adminReports.rejectReasonPlaceholder')" class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 resize-none"></textarea>
          </div>
          <div class="flex items-center justify-center gap-3 px-6 pb-6">
            <AppButton variant="secondary" class="flex-1" @click="showConfirmModal = false">{{ $t('adminReports.cancel') }}</AppButton>
            <button @click="executeAction" :class="['flex-1 px-5 py-2.5 text-white rounded-xl font-medium', confirmAction === 'accept' ? 'bg-[#10b981] hover:bg-[#059669]' : 'bg-red-500 hover:bg-red-600']">
              {{ confirmAction === 'accept' ? $t('adminReports.btnAccept') : $t('adminReports.btnReject') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </DashboardLayout>
</template>
