<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import { ReportStatus } from '../../constants/statuses'
import { reportStore } from '../../stores/reports'
import { productGroups, getSubgroupByCode, isPackagingGroup } from '../../data/product-groups'
import { getNormativeForGroup } from '../../data/recycling-norms'
import { generateRecyclingReportExcel } from '../../utils/excelExport'
import { downloadElementAsPdf } from '../../utils/pdfExport'
import { useEcoOperatorMenu } from '../../composables/useRoleMenu'
import { toastStore } from '../../stores/toast'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const { roleTitle, menuItems } = useEcoOperatorMenu()

const report = computed(() => {
  const id = Number(route.params.id)
  return reportStore.state.reports.find(r => r.id === id) || null
})

const getStatusClass = (status: string) => {
  switch (status) {
    case ReportStatus.DRAFT: return 'bg-gray-100 text-gray-800'
    case ReportStatus.UNDER_REVIEW: return 'bg-yellow-100 text-yellow-800'
    case ReportStatus.APPROVED: return 'bg-green-100 text-green-800'
    case ReportStatus.REJECTED: return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getGroupLabel = (value: string) => {
  return productGroups.find(g => g.value === value)?.label || value
}

const year = computed(() => parseInt(report.value?.year || '2026'))

const productItems = computed(() => {
  if (!report.value) return []
  return report.value.items.filter(i => !isPackagingGroup(i.wasteType))
})

const packagingItems = computed(() => {
  if (!report.value) return []
  return report.value.items.filter(i => isPackagingGroup(i.wasteType))
})

const getItemNormative = (item: { wasteType: string }) => {
  return getNormativeForGroup(item.wasteType, year.value)
}

const getItemSubjectToRecycle = (item: { declared: string; wasteType: string }) => {
  const declared = parseFloat(item.declared) || 0
  return declared * getItemNormative(item)
}

const getItemTotalProcessed = (item: { processed: string }) => {
  return parseFloat(item.processed) || 0
}

const getItemDeficit = (item: { declared: string; processed: string; wasteType: string }) => {
  return Math.max(0, getItemSubjectToRecycle(item) - getItemTotalProcessed(item))
}

const productTotals = computed(() => {
  const items = productItems.value
  return {
    totalDeclared: items.reduce((s, i) => s + (parseFloat(i.declared) || 0), 0),
    totalSubjectTo: items.reduce((s, i) => s + getItemSubjectToRecycle(i), 0),
    totalProcessed: items.reduce((s, i) => s + getItemTotalProcessed(i), 0),
    totalDeficit: items.reduce((s, i) => s + getItemDeficit(i), 0),
  }
})

const packagingTotals = computed(() => {
  const items = packagingItems.value
  return {
    totalDeclared: items.reduce((s, i) => s + (parseFloat(i.declared) || 0), 0),
    totalSubjectTo: items.reduce((s, i) => s + getItemSubjectToRecycle(i), 0),
    totalProcessed: items.reduce((s, i) => s + getItemTotalProcessed(i), 0),
    totalDeficit: items.reduce((s, i) => s + getItemDeficit(i), 0),
  }
})

// Reject form
const showRejectForm = ref(false)
const rejectionReason = ref('')

const approveReport = () => {
  if (report.value) {
    reportStore.approveReport(report.value.id)
  }
}

const rejectReport = () => {
  if (report.value && rejectionReason.value.trim()) {
    reportStore.rejectReport(report.value.id, rejectionReason.value.trim())
    showRejectForm.value = false
    rejectionReason.value = ''
  }
}

const downloadExcel = () => {
  if (!report.value) return
  generateRecyclingReportExcel(report.value, {
    name: report.value.company || '',
    inn: report.value.inn || '',
    address: '',
  })
}

const printAreaRef = ref<HTMLElement | null>(null)

const downloadPdf = async () => {
  const el = printAreaRef.value
  if (!el) return
  const filename = `report-${report.value?.number || 'export'}.pdf`
  await downloadElementAsPdf(el, filename)
}

const goBack = () => {
  const from = route.query.from as string
  const routes: Record<string, string> = {
    'incoming-reports': '/eco-operator/incoming-reports',
  }
  router.push(routes[from] || '/eco-operator/incoming-reports')
}

const fmt = (n: number) => n.toFixed(2)
const fmtPercent = (n: number) => (n * 100).toFixed(1) + '%'
</script>

<template>
  <DashboardLayout
    role="eco-operator"
    :roleTitle="roleTitle"
    userName="ОсОО «ЭкоПереработка»"
    :menuItems="menuItems"
  >
    <!-- Not found -->
    <div v-if="!report" class="text-center py-16">
      <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
        <svg class="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h2 class="text-xl font-bold text-[#1e293b] mb-2">{{ $t('ecoReportDetail.notFound') }}</h2>
      <p class="text-[#64748b] mb-6">{{ $t('ecoReportDetail.notFoundDesc') }}</p>
      <button @click="goBack" class="btn-back">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
        {{ $t('common.back') }}
      </button>
    </div>

    <template v-else>
      <div ref="printAreaRef">
      <!-- Back link -->
      <button @click="goBack" class="btn-back mb-4">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
        {{ $t('common.back') }}
      </button>

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div class="flex items-center gap-3 mb-1">
            <h1 class="text-xl font-bold text-[#1e293b]">{{ report.number }}</h1>
            <span :class="['px-3 py-1 rounded-full text-xs font-medium', getStatusClass(report.status)]">
              {{ $t('status.' + (report.status === 'under_review' ? 'underReview' : report.status === 'approved' ? 'approvedMasc' : report.status === 'rejected' ? 'rejectedMasc' : report.status)) }}
            </span>
          </div>
          <div class="flex items-center gap-4 text-sm text-[#64748b]">
            <span>{{ $t('ecoReportDetail.organization') }} <strong class="text-[#1e293b]">{{ report.company }}</strong></span>
            <span>{{ $t('ecoReportDetail.period') }} <strong class="text-[#1e293b]">{{ report.year }} {{ $t('ecoReportDetail.yearSuffix') }}</strong></span>
            <span>{{ $t('ecoReportDetail.submission') }} <strong class="text-[#1e293b]">{{ report.date }}</strong></span>
          </div>
        </div>
        <div class="flex items-center gap-2 flex-wrap">
          <span class="text-sm text-[#64748b]">{{ $t('ecoReportDetail.completion') }}</span>
          <span :class="[
            'text-lg font-bold',
            report.processingPercent >= 100 ? 'text-[#10b981]' : report.processingPercent >= 80 ? 'text-[#f59e0b]' : 'text-[#ef4444]'
          ]">{{ report.processingPercent }}%</span>
        </div>
      </div>

      <!-- Rejection reason -->
      <div v-if="report.status === 'rejected' && report.rejectionReason" class="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <svg class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div>
          <p class="font-medium text-red-800">{{ $t('ecoReportDetail.rejectionReason') }}</p>
          <p class="text-sm text-red-700 mt-1">{{ report.rejectionReason }}</p>
        </div>
      </div>

      <!-- Section 1: General info -->
      <div class="rd-section mb-6">
        <h2 class="rd-section__title">{{ $t('ecoReportDetail.generalInfo') }}</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <p class="rd-label">{{ $t('ecoReportDetail.orgName') }}</p>
            <p class="rd-value">{{ report.company }}</p>
          </div>
          <div>
            <p class="rd-label">{{ $t('ecoReportDetail.inn') }}</p>
            <p class="rd-value font-mono">{{ report.inn }}</p>
          </div>
          <div>
            <p class="rd-label">{{ $t('ecoReportDetail.reportPeriod') }}</p>
            <p class="rd-value">{{ report.year }} {{ $t('ecoReportDetail.yearSuffix') }}</p>
          </div>
          <div>
            <p class="rd-label">{{ $t('ecoReportDetail.submissionDate') }}</p>
            <p class="rd-value">{{ report.date }}</p>
          </div>
          <div>
            <p class="rd-label">{{ $t('ecoReportDetail.payerType') }}</p>
            <p class="rd-value">{{ $t('ecoReportDetail.payerTypeValue') }}</p>
          </div>
        </div>
      </div>

      <!-- Summary cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div class="bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
          <p class="text-xs text-[#64748b] mb-1">{{ $t('ecoReportDetail.declared') }}</p>
          <p class="text-xl font-bold text-[#2563eb]">{{ report.totalDeclared }} {{ $t('ecoReportDetail.unitTon') }}</p>
        </div>
        <div class="bg-green-50 rounded-xl p-4 text-center border border-green-100">
          <p class="text-xs text-[#64748b] mb-1">{{ $t('ecoReportDetail.processed') }}</p>
          <p class="text-xl font-bold text-[#10b981]">{{ report.totalProcessed }} {{ $t('ecoReportDetail.unitTon') }}</p>
        </div>
        <div :class="[
          'rounded-xl p-4 text-center border',
          report.processingPercent >= 100 ? 'bg-green-50 border-green-100' : report.processingPercent >= 80 ? 'bg-yellow-50 border-yellow-100' : 'bg-red-50 border-red-100'
        ]">
          <p class="text-xs text-[#64748b] mb-1">{{ $t('ecoReportDetail.completionLabel') }}</p>
          <p :class="[
            'text-xl font-bold',
            report.processingPercent >= 100 ? 'text-[#10b981]' : report.processingPercent >= 80 ? 'text-[#f59e0b]' : 'text-[#ef4444]'
          ]">{{ report.processingPercent }}%</p>
        </div>
      </div>

      <!-- Section 2: Product items table -->
      <div class="bg-white rounded-xl border border-[#e2e8f0] shadow-sm mb-6 overflow-hidden">
        <div class="px-5 py-4 border-b border-[#e2e8f0]">
          <h2 class="text-base font-semibold text-[#1e293b]">{{ $t('ecoReportDetail.productInfoTitle') }}</h2>
          <p class="text-xs text-[#64748b] mt-1">{{ $t('ecoReportDetail.productInfoSubtitle') }}</p>
        </div>

        <div v-if="productItems.length > 0" class="rd-table-wrap">
          <table class="rd-table">
            <thead>
              <tr>
                <th class="rd-th" style="min-width:40px">{{ $t('ecoReportDetail.thCol1') }}<br><span class="rd-th-sub">{{ $t('ecoReportDetail.thCol1Sub') }}</span></th>
                <th class="rd-th" style="min-width:180px">{{ $t('ecoReportDetail.thCol2') }}<br><span class="rd-th-sub">{{ $t('ecoReportDetail.thCol2Sub') }}</span></th>
                <th class="rd-th" style="min-width:80px">{{ $t('ecoReportDetail.thCol3') }}<br><span class="rd-th-sub">{{ $t('ecoReportDetail.thCol3Sub') }}</span></th>
                <th class="rd-th" style="min-width:140px">{{ $t('ecoReportDetail.thCol4') }}<br><span class="rd-th-sub">{{ $t('ecoReportDetail.thCol4Sub') }}</span></th>
                <th class="rd-th" style="min-width:90px">{{ $t('ecoReportDetail.thCol5') }}<br><span class="rd-th-sub">{{ $t('ecoReportDetail.thCol5Sub') }}</span></th>
                <th class="rd-th rd-th--num" style="min-width:90px">{{ $t('ecoReportDetail.thCol6') }}<br><span class="rd-th-sub">{{ $t('ecoReportDetail.thCol6Sub') }}</span></th>
                <th class="rd-th rd-th--num" style="min-width:70px">{{ $t('ecoReportDetail.thCol7') }}<br><span class="rd-th-sub">{{ $t('ecoReportDetail.thCol7Sub') }}</span></th>
                <th class="rd-th rd-th--num" style="min-width:100px">{{ $t('ecoReportDetail.thCol8') }}<br><span class="rd-th-sub">{{ $t('ecoReportDetail.thCol8Sub') }}</span></th>
                <th class="rd-th rd-th--num" style="min-width:100px">{{ $t('ecoReportDetail.thCol9') }}<br><span class="rd-th-sub">{{ $t('ecoReportDetail.thCol9Sub') }}</span></th>
                <th class="rd-th rd-th--num" style="min-width:100px">{{ $t('ecoReportDetail.thCol10') }}<br><span class="rd-th-sub">{{ $t('ecoReportDetail.thCol10Sub') }}</span></th>
                <th class="rd-th rd-th--num" style="min-width:100px">{{ $t('ecoReportDetail.thCol11') }}<br><span class="rd-th-sub">{{ $t('ecoReportDetail.thCol11Sub') }}</span></th>
                <th class="rd-th rd-th--num" style="min-width:110px">{{ $t('ecoReportDetail.thCol12') }}<br><span class="rd-th-sub">{{ $t('ecoReportDetail.thCol12Sub') }}</span></th>
                <th class="rd-th" style="min-width:140px">{{ $t('ecoReportDetail.thCol13') }}<br><span class="rd-th-sub">{{ $t('ecoReportDetail.thCol13Sub') }}</span></th>
                <th class="rd-th" style="min-width:80px">{{ $t('ecoReportDetail.thCol14') }}<br><span class="rd-th-sub">{{ $t('ecoReportDetail.thCol14Sub') }}</span></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in productItems" :key="item.id" class="rd-row">
                <td class="rd-td rd-td--center">{{ idx + 1 }}</td>
                <td class="rd-td">{{ getGroupLabel(item.wasteType) }}</td>
                <td class="rd-td font-mono">{{ getSubgroupByCode(item.wasteType, item.wasteCode)?.gskpCode || item.wasteCode }}</td>
                <td class="rd-td rd-td--small">{{ getSubgroupByCode(item.wasteType, item.wasteCode)?.tnvedName || '—' }}</td>
                <td class="rd-td font-mono">{{ getSubgroupByCode(item.wasteType, item.wasteCode)?.tnvedCode || item.wasteCode }}</td>
                <td class="rd-td rd-td--num">{{ fmt((parseFloat(item.declared) || 0) * 1000) }}</td>
                <td class="rd-td rd-td--num">{{ fmtPercent(getItemNormative(item)) }}</td>
                <td class="rd-td rd-td--num">{{ fmt(getItemSubjectToRecycle(item) * 1000) }}</td>
                <td class="rd-td rd-td--num">{{ fmt(getItemTotalProcessed(item) * 1000) }}</td>
                <td class="rd-td rd-td--num">0.00</td>
                <td class="rd-td rd-td--num">{{ fmt(getItemTotalProcessed(item) * 1000) }}</td>
                <td class="rd-td rd-td--num" :class="getItemDeficit(item) > 0 ? 'text-[#ef4444] font-semibold' : 'text-[#10b981]'">{{ fmt(getItemDeficit(item) * 1000) }}</td>
                <td class="rd-td rd-td--small">{{ item.contractNumber || '—' }}</td>
                <td class="rd-td rd-td--small">—</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="rd-row--total">
                <td class="rd-td" colspan="5"><strong>{{ $t('ecoReportDetail.totalRow') }}</strong></td>
                <td class="rd-td rd-td--num"><strong>{{ fmt(productTotals.totalDeclared * 1000) }}</strong></td>
                <td class="rd-td rd-td--num">—</td>
                <td class="rd-td rd-td--num"><strong>{{ fmt(productTotals.totalSubjectTo * 1000) }}</strong></td>
                <td class="rd-td rd-td--num"><strong>{{ fmt(productTotals.totalProcessed * 1000) }}</strong></td>
                <td class="rd-td rd-td--num"><strong>0.00</strong></td>
                <td class="rd-td rd-td--num"><strong>{{ fmt(productTotals.totalProcessed * 1000) }}</strong></td>
                <td class="rd-td rd-td--num" :class="productTotals.totalDeficit > 0 ? 'text-[#ef4444]' : 'text-[#10b981]'"><strong>{{ fmt(productTotals.totalDeficit * 1000) }}</strong></td>
                <td class="rd-td" colspan="2"></td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div v-else class="px-5 py-8 text-center text-sm text-[#64748b]">
          {{ $t('ecoReportDetail.noProductData') }}
        </div>
      </div>

      <!-- Section 3: Packaging items table -->
      <div class="bg-white rounded-xl border border-[#e2e8f0] shadow-sm mb-6 overflow-hidden">
        <div class="px-5 py-4 border-b border-[#e2e8f0]">
          <h2 class="text-base font-semibold text-[#1e293b]">{{ $t('ecoReportDetail.packagingInfoTitle') }}</h2>
        </div>

        <div v-if="packagingItems.length > 0" class="rd-table-wrap">
          <table class="rd-table">
            <thead>
              <tr>
                <th class="rd-th" style="min-width:40px">{{ $t('ecoReportDetail.thPkgNum') }}</th>
                <th class="rd-th" style="min-width:140px">{{ $t('ecoReportDetail.thPkgMaterial') }}</th>
                <th class="rd-th" style="min-width:80px">{{ $t('ecoReportDetail.thPkgLetterCode') }}</th>
                <th class="rd-th" style="min-width:70px">{{ $t('ecoReportDetail.thPkgDigitCode') }}</th>
                <th class="rd-th" style="min-width:160px">{{ $t('ecoReportDetail.thPkgName') }}</th>
                <th class="rd-th rd-th--num" style="min-width:90px">{{ $t('ecoReportDetail.thPkgReleased') }}</th>
                <th class="rd-th rd-th--num" style="min-width:70px">{{ $t('ecoReportDetail.thPkgNorm') }}</th>
                <th class="rd-th rd-th--num" style="min-width:100px">{{ $t('ecoReportDetail.thPkgToRecycle') }}</th>
                <th class="rd-th rd-th--num" style="min-width:100px">{{ $t('ecoReportDetail.thPkgProcessed') }}</th>
                <th class="rd-th rd-th--num" style="min-width:90px">{{ $t('ecoReportDetail.thPkgPrevPeriod') }}</th>
                <th class="rd-th rd-th--num" style="min-width:100px">{{ $t('ecoReportDetail.thPkgTotalProcessed') }}</th>
                <th class="rd-th rd-th--num" style="min-width:110px">{{ $t('ecoReportDetail.thPkgRecyclingFee') }}</th>
                <th class="rd-th" style="min-width:120px">{{ $t('ecoReportDetail.thPkgDocs') }}</th>
                <th class="rd-th" style="min-width:80px">{{ $t('ecoReportDetail.thPkgNotes') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in packagingItems" :key="item.id" class="rd-row">
                <td class="rd-td rd-td--center">{{ idx + 1 }}</td>
                <td class="rd-td">{{ getSubgroupByCode(item.wasteType, item.wasteCode)?.packagingMaterial || '—' }}</td>
                <td class="rd-td font-mono">{{ getSubgroupByCode(item.wasteType, item.wasteCode)?.packagingLetterCode || '—' }}</td>
                <td class="rd-td font-mono">{{ getSubgroupByCode(item.wasteType, item.wasteCode)?.packagingDigitalCode || '—' }}</td>
                <td class="rd-td">{{ getGroupLabel(item.wasteType) }}</td>
                <td class="rd-td rd-td--num">{{ fmt((parseFloat(item.declared) || 0) * 1000) }}</td>
                <td class="rd-td rd-td--num">{{ fmtPercent(getItemNormative(item)) }}</td>
                <td class="rd-td rd-td--num">{{ fmt(getItemSubjectToRecycle(item) * 1000) }}</td>
                <td class="rd-td rd-td--num">{{ fmt(getItemTotalProcessed(item) * 1000) }}</td>
                <td class="rd-td rd-td--num">0.00</td>
                <td class="rd-td rd-td--num">{{ fmt(getItemTotalProcessed(item) * 1000) }}</td>
                <td class="rd-td rd-td--num" :class="getItemDeficit(item) > 0 ? 'text-[#ef4444] font-semibold' : 'text-[#10b981]'">{{ fmt(getItemDeficit(item) * 1000) }}</td>
                <td class="rd-td rd-td--small">{{ item.contractNumber || '—' }}</td>
                <td class="rd-td rd-td--small">—</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="rd-row--total">
                <td class="rd-td" colspan="5"><strong>{{ $t('ecoReportDetail.totalRow') }}</strong></td>
                <td class="rd-td rd-td--num"><strong>{{ fmt(packagingTotals.totalDeclared * 1000) }}</strong></td>
                <td class="rd-td rd-td--num">—</td>
                <td class="rd-td rd-td--num"><strong>{{ fmt(packagingTotals.totalSubjectTo * 1000) }}</strong></td>
                <td class="rd-td rd-td--num"><strong>{{ fmt(packagingTotals.totalProcessed * 1000) }}</strong></td>
                <td class="rd-td rd-td--num"><strong>0.00</strong></td>
                <td class="rd-td rd-td--num"><strong>{{ fmt(packagingTotals.totalProcessed * 1000) }}</strong></td>
                <td class="rd-td rd-td--num"><strong>{{ fmt(packagingTotals.totalDeficit * 1000) }}</strong></td>
                <td class="rd-td" colspan="2"></td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div v-else class="px-5 py-8 text-center text-sm text-[#64748b]">
          {{ $t('ecoReportDetail.noPackagingData') }}
        </div>
      </div>

      <!-- Documents section -->
      <div v-if="report.files.length > 0" class="bg-white rounded-xl border border-[#e2e8f0] shadow-sm mb-6 overflow-hidden">
        <div class="px-5 py-4 border-b border-[#e2e8f0]">
          <h2 class="text-base font-semibold text-[#1e293b]">{{ $t('ecoReportDetail.attachedDocs') }} ({{ report.files.length }})</h2>
        </div>
        <div class="p-5 space-y-2">
          <div v-for="file in report.files" :key="file.id" class="flex items-center gap-3 bg-[#f8fafc] rounded-lg px-4 py-3 border border-[#e2e8f0]">
            <div class="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
              <svg class="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-[#1e293b] truncate">{{ file.name }}</p>
              <p class="text-xs text-[#64748b]">{{ file.size }}</p>
            </div>
            <button class="text-[#2563eb] hover:text-[#1d4ed8] text-sm font-medium flex-shrink-0">{{ $t('common.download') }}</button>
          </div>
        </div>
      </div>

      <!-- Reject form -->
      <div v-if="showRejectForm" class="bg-red-50 border border-red-200 rounded-xl p-5 mb-6">
        <h3 class="font-semibold text-red-800 mb-3">{{ $t('ecoReportDetail.rejectFormTitle') }}</h3>
        <textarea
          v-model="rejectionReason"
          rows="3"
          :placeholder="$t('ecoReportDetail.rejectPlaceholder')"
          class="w-full px-4 py-3 border border-red-200 rounded-lg focus:outline-none focus:border-red-400 text-sm"
        ></textarea>
        <div class="flex justify-end gap-3 mt-3">
          <button @click="showRejectForm = false" class="px-4 py-2 text-[#64748b] hover:bg-white rounded-lg text-sm">
            {{ $t('common.cancel') }}
          </button>
          <button
            @click="rejectReport"
            :disabled="!rejectionReason.trim()"
            class="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ $t('common.confirm') }}
          </button>
        </div>
      </div>

      <!-- Bottom actions -->
      <div class="flex flex-wrap items-center gap-3">
        <!-- Review actions for pending reports -->
        <template v-if="report.status === 'under_review' && !showRejectForm">
          <button
            @click="approveReport"
            class="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium rounded-full bg-[#10b981] text-white hover:bg-[#059669] transition-colors shadow-sm"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
            {{ $t('ecoReportDetail.acceptReport') }}
          </button>
          <button
            @click="showRejectForm = true"
            class="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium rounded-full border border-red-300 text-red-600 hover:bg-red-50 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            {{ $t('ecoReportDetail.reject') }}
          </button>
          <div class="w-px h-6 bg-[#e2e8f0] mx-1"></div>
        </template>

        <button
          @click="downloadExcel"
          class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full bg-[#059669] text-white hover:bg-[#047857] transition-colors shadow-sm"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
          {{ $t('ecoReportDetail.downloadExcel') }}
        </button>
        <button
          @click="downloadPdf"
          class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full bg-[#8B5CF6] text-white hover:bg-[#7C3AED] transition-colors shadow-sm"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          {{ $t('ecoReportDetail.downloadPdf') }}
        </button>
      </div>
      <div style="border-top: 1px solid #e5e7eb; margin-top: 16px; padding-top: 16px;">
        <button @click="goBack" class="btn-back">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
          {{ $t('common.back') }}
        </button>
      </div>
      </div>
    </template>
  </DashboardLayout>
</template>

<style scoped>
.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #6b7280;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: transparent;
  transition: all 0.15s;
}
.btn-back:hover {
  background: #f3f4f6;
  color: #374151;
  border-color: #9ca3af;
}
.rd-section {
  background: #F8FAFC;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
}
.rd-section__title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 16px;
}
.rd-label {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 2px;
}
.rd-value {
  font-size: 14px;
  color: #1e293b;
  font-weight: 500;
}

.rd-table-wrap {
  overflow-x: auto;
}
.rd-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.rd-th {
  background: #F1F5F9;
  padding: 8px 10px;
  font-weight: 600;
  color: #1e293b;
  border: 1px solid #e2e8f0;
  text-align: left;
  vertical-align: top;
  font-size: 12px;
  line-height: 1.3;
}
.rd-th-sub {
  font-weight: 400;
  font-size: 11px;
  color: #64748b;
}
.rd-th--num {
  text-align: right;
}
.rd-td {
  padding: 7px 10px;
  border: 1px solid #e2e8f0;
  color: #1e293b;
  vertical-align: top;
}
.rd-td--num {
  text-align: right;
  font-variant-numeric: tabular-nums;
}
.rd-td--center {
  text-align: center;
}
.rd-td--small {
  font-size: 12px;
  color: #64748b;
}
.rd-row:hover {
  background: #f8fafc;
}
.rd-row--total {
  background: #F1F5F9;
}
.rd-row--total .rd-td {
  font-weight: 600;
}
</style>
