<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import DataTable from '../../components/dashboard/DataTable.vue'
import { AppButton, AppBadge } from '../../components/ui'
import { getStatusBadgeVariant } from '../../utils/statusVariant'
import { DeclStatus } from '../../constants/statuses'
import { useAdminMenu } from '../../composables/useRoleMenu'

const { t } = useI18n()
const { roleTitle, menuItems } = useAdminMenu()

const columns = computed(() => [
  { key: 'number', label: t('adminDecls.colNumber'), width: '9%' },
  { key: 'company', label: t('adminDecls.colOrganization'), width: '15%' },
  { key: 'type', label: t('adminDecls.colDeclType'), width: '18%' },
  { key: 'period', label: t('adminDecls.colPeriod'), width: '8%' },
  { key: 'submittedAt', label: t('adminDecls.colSubmittedAt'), width: '9%' },
  { key: 'status', label: t('adminDecls.colStatus'), width: '10%' },
])

interface Declaration {
  id: number; number: string; company: string; type: string; period: string; submittedAt: string; status: string
  amount?: string; items?: string
}

const declarations = ref<Declaration[]>([
  { id: 1, number: 'ДК-2026-052', company: 'ОсОО "ТехПром"', type: 'Декларация о товарах и упаковке', period: 'Q4 2025', submittedAt: '21.01.2026', status: DeclStatus.UNDER_REVIEW, amount: '245,600 сом', items: '12 позиций' },
  { id: 2, number: 'ДК-2026-051', company: 'ОАО "СтройМаркет"', type: 'Декларация о товарах и упаковке', period: 'Q4 2025', submittedAt: '20.01.2026', status: DeclStatus.UNDER_REVIEW, amount: '189,400 сом', items: '8 позиций' },
  { id: 3, number: 'ДК-2026-050', company: 'ОсОО "ПищеПром"', type: 'Декларация о товарах и упаковке', period: 'Q4 2025', submittedAt: '20.01.2026', status: DeclStatus.APPROVED, amount: '312,800 сом', items: '15 позиций' },
  { id: 4, number: 'ДК-2026-048', company: 'ИП Асанов Б.К.', type: 'Декларация о товарах и упаковке', period: 'Q4 2025', submittedAt: '19.01.2026', status: DeclStatus.APPROVED, amount: '78,200 сом', items: '4 позиции' },
  { id: 5, number: 'ДК-2026-045', company: 'ОсОО "ТехПром"', type: 'Декларация о товарах и упаковке', period: 'Q3 2025', submittedAt: '15.10.2025', status: DeclStatus.APPROVED, amount: '198,500 сом', items: '10 позиций' },
  { id: 6, number: 'ДК-2026-042', company: 'ОАО "МегаТорг"', type: 'Декларация о товарах и упаковке', period: 'Q4 2025', submittedAt: '14.01.2026', status: DeclStatus.REJECTED, amount: '456,100 сом', items: '20 позиций' },
])

// Filters
const searchQuery = ref('')
const filterPeriod = ref('')
const filterStatus = ref('')

const filteredDeclarations = computed(() => {
  return declarations.value.filter(d => {
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      if (!d.number.toLowerCase().includes(q) && !d.company.toLowerCase().includes(q)) return false
    }
    if (filterPeriod.value && d.period !== filterPeriod.value) return false
    if (filterStatus.value && d.status !== filterStatus.value) return false
    return true
  })
})

// View modal
const showViewModal = ref(false)
const viewingDecl = ref<Declaration | null>(null)

function openView(decl: Declaration) {
  viewingDecl.value = decl
  showViewModal.value = true
}

// Accept/Reject
const showConfirmModal = ref(false)
const confirmAction = ref<'accept' | 'reject'>('accept')
const confirmDecl = ref<Declaration | null>(null)
const rejectReason = ref('')

function openConfirm(decl: Declaration, action: 'accept' | 'reject') {
  confirmDecl.value = decl
  confirmAction.value = action
  rejectReason.value = ''
  showConfirmModal.value = true
}

function executeAction() {
  if (confirmDecl.value) {
    confirmDecl.value.status = confirmAction.value === 'accept' ? DeclStatus.APPROVED : DeclStatus.REJECTED
  }
  showConfirmModal.value = false
}

// Export
function exportToExcel() {
  const headers = [t('adminDecls.csvNumber'), t('adminDecls.csvOrganization'), t('adminDecls.csvType'), t('adminDecls.csvPeriod'), t('adminDecls.csvSubmittedAt'), t('adminDecls.csvStatus')]
  const rows = filteredDeclarations.value.map(d => [d.number, d.company, d.type, d.period, d.submittedAt, d.status])
  const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `declarations_${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
}

// Download PDF stub
function downloadPdf(decl: Declaration) {
  const blob = new Blob([`Декларация ${decl.number}\nОрганизация: ${decl.company}\nПериод: ${decl.period}\nСумма: ${decl.amount}`], { type: 'text/plain' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${decl.number}.txt`
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
        <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b] mb-2">{{ $t('adminDecls.title') }}</h1>
        <p class="text-[#64748b]">{{ $t('adminDecls.subtitle') }}</p>
      </div>
      <AppButton variant="primary" @click="exportToExcel">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
        {{ $t('adminDecls.exportExcel') }}
      </AppButton>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]"><p class="text-sm text-[#64748b] mb-1">{{ $t('adminDecls.totalDecls') }}</p><p class="text-2xl font-bold text-[#1e293b]">{{ declarations.length }}</p></div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]"><p class="text-sm text-[#64748b] mb-1">{{ $t('adminDecls.accepted') }}</p><p class="text-2xl font-bold text-[#10b981]">{{ declarations.filter(d => d.status === 'approved').length }}</p></div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]"><p class="text-sm text-[#64748b] mb-1">{{ $t('adminDecls.onReview') }}</p><p class="text-2xl font-bold text-[#f59e0b]">{{ declarations.filter(d => d.status === 'under_review').length }}</p></div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]"><p class="text-sm text-[#64748b] mb-1">{{ $t('adminDecls.rejected') }}</p><p class="text-2xl font-bold text-[#ef4444]">{{ declarations.filter(d => d.status === 'rejected').length }}</p></div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-2xl p-4 shadow-sm border border-[#e2e8f0] mb-6">
      <div class="flex flex-wrap gap-4">
        <input v-model="searchQuery" type="text" :placeholder="$t('adminDecls.searchPlaceholder')" class="flex-1 min-w-[200px] px-4 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb]" />
        <select v-model="filterPeriod" class="px-4 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb]">
          <option value="">{{ $t('adminDecls.allPeriods') }}</option>
          <option value="Q4 2025">Q4 2025</option><option value="Q3 2025">Q3 2025</option><option value="Q2 2025">Q2 2025</option><option value="Q1 2025">Q1 2025</option>
        </select>
        <select v-model="filterStatus" class="px-4 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb]">
          <option value="">{{ $t('adminDecls.allStatuses') }}</option>
          <option value="under_review">{{ $t('status.underReview') }}</option><option value="approved">{{ $t('status.approved') }}</option><option value="rejected">{{ $t('status.rejected') }}</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <DataTable :columns="columns" :data="filteredDeclarations" :actions="true">
      <template #cell-number="{ value }"><span class="font-mono font-medium text-[#2563eb]">{{ value }}</span></template>
      <template #cell-company="{ value }"><span class="font-medium text-[#1e293b]">{{ value }}</span></template>
      <template #cell-status="{ value }"><AppBadge :variant="getStatusBadgeVariant(value)">{{ $t('status.' + (value === 'under_review' ? 'underReview' : value)) }}</AppBadge></template>
      <template #actions="{ row }">
        <div class="flex items-center justify-end gap-2">
          <AppButton variant="ghost" size="sm" @click="openView(row)">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            {{ $t('adminDecls.btnView') }}
          </AppButton>
          <AppButton v-if="row.status === 'under_review'" variant="primary" size="sm" @click="openConfirm(row, 'accept')">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
            {{ $t('adminDecls.btnAccept') }}
          </AppButton>
          <AppButton v-if="row.status === 'under_review'" variant="danger" size="sm" @click="openConfirm(row, 'reject')">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            {{ $t('adminDecls.btnReject') }}
          </AppButton>
          <AppButton variant="outline" size="sm" @click="downloadPdf(row)">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            {{ $t('adminDecls.btnDownloadPdf') }}
          </AppButton>
        </div>
      </template>
    </DataTable>

    <!-- View Modal -->
    <Teleport to="body">
      <div v-if="showViewModal && viewingDecl" class="modal-overlay fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" style="backdrop-filter:blur(4px);" @click="(e: MouseEvent) => handleOverlay(e, () => showViewModal = false)">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
          <div class="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <p class="font-mono text-[#2563eb] font-medium">{{ viewingDecl.number }}</p>
              <h3 class="text-lg font-bold text-[#1e293b]">{{ viewingDecl.type }}</h3>
            </div>
            <button @click="showViewModal = false" class="p-2 text-gray-400 hover:text-gray-600 rounded-lg"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
          <div class="p-6">
            <div class="bg-[#f8fafc] rounded-xl p-4 grid grid-cols-2 gap-4 text-sm">
              <div><p class="text-[#94a3b8]">{{ $t('adminDecls.labelOrganization') }}</p><p class="text-[#1e293b] font-medium">{{ viewingDecl.company }}</p></div>
              <div><p class="text-[#94a3b8]">{{ $t('adminDecls.labelPeriod') }}</p><p class="text-[#1e293b] font-medium">{{ viewingDecl.period }}</p></div>
              <div><p class="text-[#94a3b8]">{{ $t('adminDecls.labelSubmittedAt') }}</p><p class="text-[#1e293b] font-medium">{{ viewingDecl.submittedAt }}</p></div>
              <div><p class="text-[#94a3b8]">{{ $t('adminDecls.labelStatus') }}</p><AppBadge :variant="getStatusBadgeVariant(viewingDecl.status)">{{ $t('status.' + (viewingDecl.status === 'under_review' ? 'underReview' : viewingDecl.status)) }}</AppBadge></div>
              <div><p class="text-[#94a3b8]">{{ $t('adminDecls.labelFeeAmount') }}</p><p class="text-[#1e293b] font-bold">{{ viewingDecl.amount }}</p></div>
              <div><p class="text-[#94a3b8]">{{ $t('adminDecls.labelItems') }}</p><p class="text-[#1e293b] font-medium">{{ viewingDecl.items }}</p></div>
            </div>
          </div>
          <div class="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
            <AppButton v-if="viewingDecl.status === 'under_review'" variant="danger" @click="showViewModal = false; openConfirm(viewingDecl!, 'reject')">{{ $t('adminDecls.btnReject') }}</AppButton>
            <AppButton v-if="viewingDecl.status === 'under_review'" variant="primary" @click="showViewModal = false; openConfirm(viewingDecl!, 'accept')">{{ $t('adminDecls.btnAccept') }}</AppButton>
            <AppButton v-else variant="primary" @click="showViewModal = false">{{ $t('adminDecls.btnClose') }}</AppButton>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Confirm Accept/Reject Modal -->
    <Teleport to="body">
      <div v-if="showConfirmModal && confirmDecl" class="modal-overlay fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" style="backdrop-filter:blur(4px);" @click="(e: MouseEvent) => handleOverlay(e, () => showConfirmModal = false)">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md">
          <div class="p-6 text-center">
            <div :class="['w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4', confirmAction === 'accept' ? 'bg-green-100' : 'bg-red-100']">
              <svg v-if="confirmAction === 'accept'" class="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
              <svg v-else class="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </div>
            <h3 class="text-xl font-bold text-[#1e293b] mb-2">{{ confirmAction === 'accept' ? $t('adminDecls.confirmAcceptTitle') : $t('adminDecls.confirmRejectTitle') }}</h3>
            <p class="text-[#64748b]"><span class="font-medium text-[#1e293b]">{{ confirmDecl.number }}</span> {{ $t('adminDecls.from') }} {{ confirmDecl.company }}</p>
          </div>
          <div v-if="confirmAction === 'reject'" class="px-6 pb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('adminDecls.rejectReasonLabel') }}</label>
            <textarea v-model="rejectReason" rows="3" :placeholder="$t('adminDecls.rejectReasonPlaceholder')" class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"></textarea>
          </div>
          <div class="flex items-center justify-center gap-3 px-6 pb-6">
            <AppButton variant="secondary" class="flex-1" @click="showConfirmModal = false">{{ $t('adminDecls.cancel') }}</AppButton>
            <button @click="executeAction" :class="['flex-1 px-5 py-2.5 text-white rounded-xl font-medium transition-colors', confirmAction === 'accept' ? 'bg-[#10b981] hover:bg-[#059669]' : 'bg-red-500 hover:bg-red-600']">
              {{ confirmAction === 'accept' ? $t('adminDecls.btnAccept') : $t('adminDecls.btnReject') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </DashboardLayout>
</template>
