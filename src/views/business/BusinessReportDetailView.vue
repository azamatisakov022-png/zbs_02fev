<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import { reportStore } from '../../stores/reports'
import { productGroups, getSubgroupByCode, isPackagingGroup } from '../../data/product-groups'
import { getNormativeForGroup } from '../../data/recycling-norms'
import { generateRecyclingReportExcel } from '../../utils/excelExport'
import { downloadElementAsPdf } from '../../utils/pdfExport'
import { useBusinessMenu } from '../../composables/useRoleMenu'
import { ReportStatus } from '../../constants/statuses'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { roleTitle, menuItems } = useBusinessMenu()

const report = computed(() => {
  const id = Number(route.params.id)
  return reportStore.state.reports.find(r => r.id === id) || null
})

const getStatusClass = (status: string) => {
  switch (status) {
    case 'draft': return 'bg-gray-100 text-gray-800'
    case 'under_review': return 'bg-yellow-100 text-yellow-800'
    case 'approved': return 'bg-green-100 text-green-800'
    case 'rejected': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getGroupLabel = (value: string) => {
  return productGroups.find(g => g.value === value)?.label || value
}

const year = computed(() => parseInt(report.value?.year || '2026'))

// Separate items: товары vs упаковка
const productItems = computed(() => {
  if (!report.value) return []
  return report.value.items.filter(i => !isPackagingGroup(i.wasteType))
})

const packagingItems = computed(() => {
  if (!report.value) return []
  return report.value.items.filter(i => isPackagingGroup(i.wasteType))
})

// Compute derived values for product item
const getItemNormative = (item: { wasteType: string }) => {
  return getNormativeForGroup(item.wasteType, year.value)
}

const getItemSubjectToRecycle = (item: { declared: string; wasteType: string }) => {
  const declared = parseFloat(item.declared) || 0
  const norm = getItemNormative(item)
  return declared * norm
}

const getItemTotalProcessed = (item: { processed: string }) => {
  return parseFloat(item.processed) || 0
}

const getItemDeficit = (item: { declared: string; processed: string; wasteType: string }) => {
  const subjectTo = getItemSubjectToRecycle(item)
  const total = getItemTotalProcessed(item)
  return Math.max(0, subjectTo - total)
}

// Totals for product items
const productTotals = computed(() => {
  const items = productItems.value
  const totalDeclared = items.reduce((s, i) => s + (parseFloat(i.declared) || 0), 0)
  const totalSubjectTo = items.reduce((s, i) => s + getItemSubjectToRecycle(i), 0)
  const totalProcessed = items.reduce((s, i) => s + getItemTotalProcessed(i), 0)
  const totalDeficit = items.reduce((s, i) => s + getItemDeficit(i), 0)
  return { totalDeclared, totalSubjectTo, totalProcessed, totalDeficit }
})

// Totals for packaging items
const packagingTotals = computed(() => {
  const items = packagingItems.value
  const totalDeclared = items.reduce((s, i) => s + (parseFloat(i.declared) || 0), 0)
  const totalSubjectTo = items.reduce((s, i) => s + getItemSubjectToRecycle(i), 0)
  const totalProcessed = items.reduce((s, i) => s + getItemTotalProcessed(i), 0)
  const totalDeficit = items.reduce((s, i) => s + getItemDeficit(i), 0)
  return { totalDeclared, totalSubjectTo, totalProcessed, totalDeficit }
})

const downloadExcel = () => {
  if (!report.value) return
  generateRecyclingReportExcel(report.value, {
    name: report.value.company || '',
    inn: report.value.inn || '',
    address: 'г. Бишкек, ул. Московская, 123',
  })
}

const printAreaRef = ref<HTMLElement | null>(null)

const downloadPdf = async () => {
  const el = printAreaRef.value
  if (!el) return
  const filename = `report-${report.value?.number || 'export'}.pdf`
  await downloadElementAsPdf(el, filename)
}

const handlePrint = () => {
  window.print()
}

const goBack = () => {
  const from = route.query.from as string
  const routes: Record<string, string> = {
    reports: '/business/reports',
    account: '/business/account',
  }
  router.push(routes[from] || '/business/reports')
}

onMounted(() => {
  if (route.query.print === 'true') {
    nextTick(() => { setTimeout(() => window.print(), 500) })
  }
})


const fmt = (n: number) => n.toFixed(2)
const fmtPercent = (n: number) => (n * 100).toFixed(1) + '%'
</script>

<template>
  <DashboardLayout
    role="business"
    :roleTitle="roleTitle"
    userName="ОсОО «ТехПром»"
    :menuItems="menuItems"
  >
    <!-- Not found -->
    <div v-if="!report" class="text-center py-16">
      <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
        <svg class="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h2 class="text-xl font-bold text-[#1e293b] mb-2">{{ $t('businessReportDetail.reportNotFound') }}</h2>
      <p class="text-[#64748b] mb-6">{{ $t('businessReportDetail.reportNotFoundDesc') }}</p>
      <button @click="goBack" class="btn-back">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
        {{ $t('common.back') }}
      </button>
    </div>

    <template v-else>
      <div ref="printAreaRef">
      <!-- Back link -->
      <button @click="goBack" class="btn-back mb-4 no-print">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
        {{ $t('common.back') }}
      </button>

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div class="flex items-center gap-3 mb-1">
            <h1 class="text-xl font-bold text-[#1e293b]">{{ report.number }}</h1>
            <span :class="['px-3 py-1 rounded-full text-xs font-medium', getStatusClass(report.status)]">
              {{ $t('status.' + (report.status === 'approved' ? 'approvedMasc' : report.status === 'rejected' ? 'rejectedMasc' : report.status === 'under_review' ? 'underReview' : report.status)) }}
            </span>
          </div>
          <div class="flex items-center gap-4 text-sm text-[#64748b]">
            <span>{{ $t('businessReportDetail.period') }}: <strong class="text-[#1e293b]">{{ report.year }} {{ $t('businessReportDetail.yearSuffix') }}</strong></span>
            <span>{{ $t('businessReportDetail.submissionDate') }}: <strong class="text-[#1e293b]">{{ report.date }}</strong></span>
          </div>
        </div>
        <div class="flex items-center gap-2 flex-wrap">
          <span class="text-sm text-[#64748b]">{{ $t('businessReportDetail.completion') }}:</span>
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
          <p class="font-medium text-red-800">{{ $t('businessReportDetail.rejectionReason') }}</p>
          <p class="text-sm text-red-700 mt-1">{{ report.rejectionReason }}</p>
        </div>
      </div>

      <!-- Section 1: General info -->
      <div class="rd-section mb-6">
        <h2 class="rd-section__title">{{ $t('businessReportDetail.generalInfo') }}</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <p class="rd-label">{{ $t('businessReportDetail.orgName') }}</p>
            <p class="rd-value">{{ report.company }}</p>
          </div>
          <div>
            <p class="rd-label">{{ $t('businessReportDetail.inn') }}</p>
            <p class="rd-value font-mono">{{ report.inn }}</p>
          </div>
          <div>
            <p class="rd-label">{{ $t('businessReportDetail.reportingPeriod') }}</p>
            <p class="rd-value">{{ report.year }} {{ $t('businessReportDetail.yearSuffix') }}</p>
          </div>
          <div>
            <p class="rd-label">{{ $t('businessReportDetail.address') }}</p>
            <p class="rd-value">г. Бишкек, ул. Московская, 123</p>
          </div>
          <div>
            <p class="rd-label">{{ $t('businessReportDetail.contactInfo') }}</p>
            <p class="rd-value">+996 555 123 456, info@techprom.kg</p>
          </div>
          <div>
            <p class="rd-label">{{ $t('businessReportDetail.payerType') }}</p>
            <p class="rd-value">{{ $t('businessReportDetail.importerProducer') }}</p>
          </div>
        </div>
      </div>

      <!-- Section 2: Product items table -->
      <div class="bg-white rounded-xl border border-[#e2e8f0] shadow-sm mb-6 overflow-hidden">
        <div class="px-5 py-4 border-b border-[#e2e8f0]">
          <h2 class="text-base font-semibold text-[#1e293b]">{{ $t('businessReportDetail.productInfoTitle') }}</h2>
          <p class="text-xs text-[#64748b] mt-1">{{ $t('businessReportDetail.productInfoSubtitle') }}</p>
        </div>

        <div v-if="productItems.length > 0" class="rd-table-wrap">
          <table class="rd-table">
            <thead>
              <tr>
                <th class="rd-th" style="min-width:40px">{{ $t('businessReportDetail.col1') }}<br><span class="rd-th-sub">{{ $t('businessReportDetail.colNum') }}</span></th>
                <th class="rd-th" style="min-width:180px">{{ $t('businessReportDetail.col2') }}<br><span class="rd-th-sub">{{ $t('businessReportDetail.colProductName') }}</span></th>
                <th class="rd-th" style="min-width:80px">{{ $t('businessReportDetail.col3') }}<br><span class="rd-th-sub">{{ $t('businessReportDetail.colGskpCode') }}</span></th>
                <th class="rd-th" style="min-width:140px">{{ $t('businessReportDetail.col4') }}<br><span class="rd-th-sub">{{ $t('businessReportDetail.colTnvedName') }}</span></th>
                <th class="rd-th" style="min-width:90px">{{ $t('businessReportDetail.col5') }}<br><span class="rd-th-sub">{{ $t('businessReportDetail.colTnvedCode') }}</span></th>
                <th class="rd-th rd-th--num" style="min-width:90px">{{ $t('businessReportDetail.col6') }}<br><span class="rd-th-sub">{{ $t('businessReportDetail.colReleasedKg') }}</span></th>
                <th class="rd-th rd-th--num" style="min-width:70px">{{ $t('businessReportDetail.col7') }}<br><span class="rd-th-sub">{{ $t('businessReportDetail.colNormative') }}</span></th>
                <th class="rd-th rd-th--num" style="min-width:100px">{{ $t('businessReportDetail.col8') }}<br><span class="rd-th-sub">{{ $t('businessReportDetail.colToRecycleKg') }}</span></th>
                <th class="rd-th rd-th--num" style="min-width:100px">{{ $t('businessReportDetail.col9') }}<br><span class="rd-th-sub">{{ $t('businessReportDetail.colRecycledKg') }}</span></th>
                <th class="rd-th rd-th--num" style="min-width:100px">{{ $t('businessReportDetail.col10') }}<br><span class="rd-th-sub">{{ $t('businessReportDetail.colPrevPeriod') }}</span></th>
                <th class="rd-th rd-th--num" style="min-width:100px">{{ $t('businessReportDetail.col11') }}<br><span class="rd-th-sub">{{ $t('businessReportDetail.colTotalRecycled') }}</span></th>
                <th class="rd-th rd-th--num" style="min-width:110px">{{ $t('businessReportDetail.col12') }}<br><span class="rd-th-sub">{{ $t('businessReportDetail.colRecyclingFeeKg') }}</span></th>
                <th class="rd-th" style="min-width:140px">{{ $t('businessReportDetail.col13') }}<br><span class="rd-th-sub">{{ $t('businessReportDetail.colDocuments') }}</span></th>
                <th class="rd-th" style="min-width:80px">{{ $t('businessReportDetail.col14') }}<br><span class="rd-th-sub">{{ $t('businessReportDetail.colNote') }}</span></th>
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
                <td class="rd-td" colspan="5"><strong>{{ $t('businessReportDetail.total') }}</strong></td>
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
          {{ $t('businessReportDetail.noProductData') }}
        </div>
      </div>

      <!-- Section 3: Packaging items table -->
      <div class="bg-white rounded-xl border border-[#e2e8f0] shadow-sm mb-6 overflow-hidden">
        <div class="px-5 py-4 border-b border-[#e2e8f0]">
          <h2 class="text-base font-semibold text-[#1e293b]">{{ $t('businessReportDetail.packagingInfoTitle') }}</h2>
        </div>

        <div v-if="packagingItems.length > 0" class="rd-table-wrap">
          <table class="rd-table">
            <thead>
              <tr>
                <th class="rd-th" style="min-width:40px">{{ $t('businessReportDetail.colNum') }}</th>
                <th class="rd-th" style="min-width:140px">{{ $t('businessReportDetail.colPackagingMaterial') }}</th>
                <th class="rd-th" style="min-width:80px">{{ $t('businessReportDetail.colLetterCode') }}</th>
                <th class="rd-th" style="min-width:70px">{{ $t('businessReportDetail.colDigitalCode') }}</th>
                <th class="rd-th" style="min-width:160px">{{ $t('common.name') }}</th>
                <th class="rd-th rd-th--num" style="min-width:90px">{{ $t('businessReportDetail.colReleasedKg') }}</th>
                <th class="rd-th rd-th--num" style="min-width:70px">{{ $t('businessReportDetail.colNormative') }}</th>
                <th class="rd-th rd-th--num" style="min-width:100px">{{ $t('businessReportDetail.colToRecycleKg') }}</th>
                <th class="rd-th rd-th--num" style="min-width:100px">{{ $t('businessReportDetail.colRecycledKg') }}</th>
                <th class="rd-th rd-th--num" style="min-width:90px">{{ $t('businessReportDetail.colPrevPeriod') }}</th>
                <th class="rd-th rd-th--num" style="min-width:100px">{{ $t('businessReportDetail.colTotalRecycled') }}</th>
                <th class="rd-th rd-th--num" style="min-width:110px">{{ $t('businessReportDetail.colRecyclingFeeKg') }}</th>
                <th class="rd-th" style="min-width:120px">{{ $t('businessReportDetail.colDocuments') }}</th>
                <th class="rd-th" style="min-width:80px">{{ $t('businessReportDetail.colNote') }}</th>
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
                <td class="rd-td" colspan="5"><strong>{{ $t('businessReportDetail.total') }}</strong></td>
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
          {{ $t('businessReportDetail.noPackagingData') }}
        </div>
      </div>

      <!-- Documents section -->
      <div v-if="report.files.length > 0" class="bg-white rounded-xl border border-[#e2e8f0] shadow-sm mb-6 overflow-hidden">
        <div class="px-5 py-4 border-b border-[#e2e8f0]">
          <h2 class="text-base font-semibold text-[#1e293b]">{{ $t('businessReportDetail.attachedDocuments') }} ({{ report.files.length }})</h2>
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

      <!-- Bottom actions -->
      <div class="flex flex-wrap items-center gap-3">
        <button
          @click="downloadExcel"
          class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full bg-[#059669] text-white hover:bg-[#047857] transition-colors shadow-sm"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
          {{ $t('common.downloadExcel') }}
        </button>
        <button
          @click="downloadPdf"
          class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full bg-[#8B5CF6] text-white hover:bg-[#7C3AED] transition-colors shadow-sm"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          {{ $t('common.downloadPdf') }}
        </button>
        <button
          @click="handlePrint"
          class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full border border-[#e2e8f0] text-[#475569] hover:bg-[#f8fafc] transition-colors"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
          {{ $t('common.print') }}
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

/* Table */
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

@media print {
  :deep(.dashboard-layout > aside),
  :deep(.dashboard-layout > main > header),
  :deep(.lg\:hidden) {
    display: none !important;
  }
  :deep(.lg\:ml-72) {
    margin-left: 0 !important;
  }
}
</style>
