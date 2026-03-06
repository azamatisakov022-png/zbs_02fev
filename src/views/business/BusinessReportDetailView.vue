<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import { AppButton, AppAlert, AppBadge } from '../../components/ui'
import { useAccountStore } from '../../stores/account'
import { useReportStore } from '../../stores/reports'
import { getSubgroupByCode } from '../../data/product-groups'
import { generateRecyclingReportExcel } from '../../utils/excelExport'
import { downloadElementAsPdf } from '../../utils/pdfExport'
import { useBusinessMenu } from '../../composables/useRoleMenu'
import { ReportStatus } from '../../constants/statuses'
import { useProductGroupStore } from '../../stores/product-groups'
import {
  fmt, fmtPercent, getGroupLabel,
  getItemNormative, getItemSubjectToRecycle, getItemTotalProcessed, getItemDeficit,
  calculateItemTotals,
} from '../../helpers/reportHelpers'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { roleTitle, menuItems } = useBusinessMenu()
const accountStore = useAccountStore()
const reportStore = useReportStore()

const report = computed(() => {
  const id = Number(route.params.id)
  return reportStore.reports.find(r => r.id === id) || null
})

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'draft': return 'neutral' as const
    case 'under_review': return 'warning' as const
    case 'approved': return 'success' as const
    case 'rejected': return 'danger' as const
    default: return 'neutral' as const
  }
}

const productGroupStore = useProductGroupStore()
const year = computed(() => parseInt(report.value?.year || '2026'))

const productItems = computed(() => {
  if (!report.value) return []
  return report.value.items.filter(i => !productGroupStore.isPackagingGroup(i.wasteType))
})

const packagingItems = computed(() => {
  if (!report.value) return []
  return report.value.items.filter(i => productGroupStore.isPackagingGroup(i.wasteType))
})

const wrappedGetItemNormative = (item: { wasteType: string }) => getItemNormative(item.wasteType, year.value)
const wrappedGetItemSubjectToRecycle = (item: { declared: string; wasteType: string }) => getItemSubjectToRecycle(item as any, year.value)
const wrappedGetItemTotalProcessed = (item: { processed: string }) => getItemTotalProcessed(item as any)
const wrappedGetItemDeficit = (item: { declared: string; processed: string; wasteType: string }) => getItemDeficit(item as any, year.value)

const productTotals = computed(() => calculateItemTotals(productItems.value, year.value))
const packagingTotals = computed(() => calculateItemTotals(packagingItems.value, year.value))

const downloadExcel = () => {
  if (!report.value) return
  const cp = accountStore.dashboard?.companyProfile
  generateRecyclingReportExcel(report.value, {
    name: report.value.company || '',
    inn: report.value.inn || '',
    address: cp?.legalAddress || '',
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

onMounted(async () => {
  await Promise.all([accountStore.fetchAll(), accountStore.fetchDashboard()])
  if (route.query.print === 'true') {
    nextTick(() => { setTimeout(() => window.print(), 500) })
  }
})


</script>

<template>
  <DashboardLayout
    role="business"
    :roleTitle="roleTitle"
    :userName="accountStore.myAccount?.company || ''"
    :menuItems="menuItems"
  >
    <!-- Not found -->
    <div v-if="!report" class="text-center py-16">
      <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
        <svg class="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h2 class="brd-heading text-xl font-bold mb-2">{{ $t('businessReportDetail.reportNotFound') }}</h2>
      <p class="brd-muted mb-6">{{ $t('businessReportDetail.reportNotFoundDesc') }}</p>
      <AppButton
        variant="back"
        @click="goBack"
        :icon="'<svg width=&quot;16&quot; height=&quot;16&quot; viewBox=&quot;0 0 24 24&quot; fill=&quot;none&quot; stroke=&quot;currentColor&quot; stroke-width=&quot;2&quot; stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot;><path d=&quot;M19 12H5&quot;/><path d=&quot;M12 19l-7-7 7-7&quot;/></svg>'"
        :label="$t('common.back')"
      />
    </div>

    <template v-else>
      <div ref="printAreaRef">
      <!-- Back link -->
      <AppButton variant="back" class="mb-4 no-print" @click="goBack">
        {{ $t('common.back') }}
      </AppButton>

      <!-- Header -->
      <div class="brd-header mb-6">
        <div>
          <div class="flex items-center gap-3 mb-2">
            <h1 class="brd-page-title">{{ report.number }}</h1>
            <AppBadge :variant="getStatusVariant(report.status)">
              {{ $t('status.' + (report.status === 'approved' ? 'approvedMasc' : report.status === 'rejected' ? 'rejectedMasc' : report.status === 'under_review' ? 'underReview' : report.status)) }}
            </AppBadge>
          </div>
          <div class="brd-meta-row">
            <span>{{ $t('businessReportDetail.period') }}: <strong class="brd-meta-value">{{ report.year }} {{ $t('businessReportDetail.yearSuffix') }}</strong></span>
            <span>{{ $t('businessReportDetail.submissionDate') }}: <strong class="brd-meta-value">{{ report.date }}</strong></span>
          </div>
        </div>
        <div class="brd-completion">
          <span class="brd-completion__label">{{ $t('businessReportDetail.completion') }}:</span>
          <span :class="[
            'brd-completion__value',
            report.processingPercent >= 100 ? 'brd-text-success' : report.processingPercent >= 80 ? 'brd-text-warning' : 'brd-text-danger'
          ]">{{ report.processingPercent }}%</span>
        </div>
      </div>

      <!-- Rejection reason -->
      <AppAlert v-if="report.status === 'rejected' && report.rejectionReason" variant="error" :title="$t('businessReportDetail.rejectionReason')" class="mb-6">
        {{ report.rejectionReason }}
      </AppAlert>

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
            <p class="rd-value">{{ accountStore.dashboard?.companyProfile?.legalAddress || '' }}</p>
          </div>
          <div>
            <p class="rd-label">{{ $t('businessReportDetail.contactInfo') }}</p>
            <p class="rd-value">{{ accountStore.dashboard?.companyProfile?.phone || '' }}{{ accountStore.dashboard?.companyProfile?.email ? ', ' + accountStore.dashboard.companyProfile.email : '' }}</p>
          </div>
          <div>
            <p class="rd-label">{{ $t('businessReportDetail.payerType') }}</p>
            <p class="rd-value">{{ $t('businessReportDetail.importerProducer') }}</p>
          </div>
        </div>
      </div>

      <!-- Section 2: Product items table -->
      <div class="brd-card mb-6 overflow-hidden">
        <div class="brd-card-header">
          <div class="flex items-center gap-3">
            <div class="brd-card-header__icon brd-card-header__icon--blue">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
            </div>
            <div>
              <h2 class="brd-card-header__title">{{ $t('businessReportDetail.productInfoTitle') }}</h2>
              <p class="brd-card-header__subtitle">{{ $t('businessReportDetail.productInfoSubtitle') }}</p>
            </div>
          </div>
          <span v-if="productItems.length > 0" class="brd-card-header__count">{{ productItems.length }}</span>
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
                <td class="rd-td rd-td--num">{{ fmtPercent(wrappedGetItemNormative(item)) }}</td>
                <td class="rd-td rd-td--num">{{ fmt(wrappedGetItemSubjectToRecycle(item) * 1000) }}</td>
                <td class="rd-td rd-td--num">{{ fmt(wrappedGetItemTotalProcessed(item) * 1000) }}</td>
                <td class="rd-td rd-td--num">0.00</td>
                <td class="rd-td rd-td--num">{{ fmt(wrappedGetItemTotalProcessed(item) * 1000) }}</td>
                <td class="rd-td rd-td--num" :class="wrappedGetItemDeficit(item) > 0 ? 'brd-text-danger font-semibold' : 'brd-text-success'">{{ fmt(wrappedGetItemDeficit(item) * 1000) }}</td>
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
                <td class="rd-td rd-td--num" :class="productTotals.totalDeficit > 0 ? 'brd-text-danger' : 'brd-text-success'"><strong>{{ fmt(productTotals.totalDeficit * 1000) }}</strong></td>
                <td class="rd-td" colspan="2"></td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div v-else class="brd-muted px-5 py-8 text-center text-sm">
          {{ $t('businessReportDetail.noProductData') }}
        </div>
      </div>

      <!-- Section 3: Packaging items table -->
      <div class="brd-card mb-6 overflow-hidden">
        <div class="brd-card-header">
          <div class="flex items-center gap-3">
            <div class="brd-card-header__icon brd-card-header__icon--amber">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg>
            </div>
            <div>
              <h2 class="brd-card-header__title">{{ $t('businessReportDetail.packagingInfoTitle') }}</h2>
            </div>
          </div>
          <span v-if="packagingItems.length > 0" class="brd-card-header__count">{{ packagingItems.length }}</span>
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
                <td class="rd-td rd-td--num">{{ fmtPercent(wrappedGetItemNormative(item)) }}</td>
                <td class="rd-td rd-td--num">{{ fmt(wrappedGetItemSubjectToRecycle(item) * 1000) }}</td>
                <td class="rd-td rd-td--num">{{ fmt(wrappedGetItemTotalProcessed(item) * 1000) }}</td>
                <td class="rd-td rd-td--num">0.00</td>
                <td class="rd-td rd-td--num">{{ fmt(wrappedGetItemTotalProcessed(item) * 1000) }}</td>
                <td class="rd-td rd-td--num" :class="wrappedGetItemDeficit(item) > 0 ? 'brd-text-danger font-semibold' : 'brd-text-success'">{{ fmt(wrappedGetItemDeficit(item) * 1000) }}</td>
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
        <div v-else class="brd-muted px-5 py-8 text-center text-sm">
          {{ $t('businessReportDetail.noPackagingData') }}
        </div>
      </div>

      <!-- Documents section -->
      <div v-if="report.files.length > 0" class="brd-card mb-6 overflow-hidden">
        <div class="brd-card-header">
          <div class="flex items-center gap-3">
            <div class="brd-card-header__icon brd-card-header__icon--blue">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <h2 class="brd-card-header__title">{{ $t('businessReportDetail.attachedDocuments') }}</h2>
          </div>
          <span class="brd-card-header__count">{{ report.files.length }}</span>
        </div>
        <div class="brd-files-list">
          <div v-for="file in report.files" :key="file.id" class="brd-file-row">
            <div class="brd-file-icon">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div class="brd-file-info">
              <p class="brd-file-name">{{ file.name }}</p>
              <p class="brd-file-size">{{ file.size }}</p>
            </div>
            <AppButton variant="ghost" size="sm" :label="$t('common.download')" color="#2563eb" />
          </div>
        </div>
      </div>

      <!-- History section -->
      <div v-if="report.history && report.history.length > 0" class="brd-card mb-6 overflow-hidden">
        <div class="brd-card-header">
          <div class="flex items-center gap-3">
            <div class="brd-card-header__icon brd-card-header__icon--amber">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <h2 class="brd-card-header__title">{{ $t('reportHistory.title') }}</h2>
          </div>
        </div>
        <div class="brd-history-list">
          <div v-for="entry in report.history" :key="entry.id" class="brd-history-item">
            <div :class="[
              'brd-history-dot',
              entry.action.includes($t('reportAction.approved')) ? 'brd-history-dot--green' :
              entry.action.includes($t('reportAction.rejected')) ? 'brd-history-dot--red' :
              entry.action.includes($t('reportAction.returnedForRevision')) ? 'brd-history-dot--orange' : 'brd-history-dot--blue'
            ]"></div>
            <div>
              <p class="brd-history-action"><span class="font-semibold">{{ entry.action }}</span> — {{ entry.user }}</p>
              <p class="brd-history-date">{{ entry.date }}</p>
              <p v-if="entry.comment" class="brd-history-comment">{{ entry.comment }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom actions -->
      <div class="flex flex-wrap items-center gap-3">
        <AppButton
          variant="export"
          @click="downloadExcel"
          bg="#059669"
          :icon="'<svg class=&quot;w-5 h-5&quot; fill=&quot;none&quot; viewBox=&quot;0 0 24 24&quot; stroke=&quot;currentColor&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; stroke-width=&quot;2&quot; d=&quot;M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z&quot; /></svg>'"
          :label="$t('common.downloadExcel')"
        />
        <AppButton
          variant="export"
          @click="downloadPdf"
          bg="#8B5CF6"
          :icon="'<svg class=&quot;w-5 h-5&quot; fill=&quot;none&quot; viewBox=&quot;0 0 24 24&quot; stroke=&quot;currentColor&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; stroke-width=&quot;2&quot; d=&quot;M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4&quot; /></svg>'"
          :label="$t('common.downloadPdf')"
        />
        <AppButton
          variant="outline"
          @click="handlePrint"
          :icon="'<svg class=&quot;w-5 h-5&quot; fill=&quot;none&quot; viewBox=&quot;0 0 24 24&quot; stroke=&quot;currentColor&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; stroke-width=&quot;2&quot; d=&quot;M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z&quot; /></svg>'"
          :label="$t('common.print')"
        />
      </div>
      <div class="brd-bottom-actions no-print">
        <AppButton variant="back" @click="goBack">
          {{ $t('common.back') }}
        </AppButton>
      </div>
      </div>
    </template>
  </DashboardLayout>
</template>

<style scoped>
/* Header */
.brd-header {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
@media (min-width: 640px) {
  .brd-header {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}
.brd-page-title {
  font-size: 32px;
  font-weight: 800;
  color: #0f172a;
}
.brd-meta-row {
  display: flex;
  align-items: center;
  gap: 20px;
  font-size: 19px;
  color: #64748b;
}
.brd-meta-value {
  color: #1e293b;
}
.brd-completion {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.brd-completion__label {
  font-size: 19px;
  color: #64748b;
}
.brd-completion__value {
  font-size: 30px;
  font-weight: 700;
}

/* Bottom actions */
.brd-bottom-actions {
  border-top: 1px solid #e5e7eb;
  margin-top: 16px;
  padding-top: 16px;
}

/* General info section */
.rd-section {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
.rd-section__title {
  font-size: 24px;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 20px;
}
.rd-label {
  font-size: 16px;
  color: #94a3b8;
  margin-bottom: 6px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
.rd-value {
  font-size: 20px;
  color: #1e293b;
  font-weight: 600;
}

/* Table */
.rd-table-wrap {
  overflow-x: auto;
}
.rd-table {
  width: 100%;
  border-collapse: collapse;
}
.rd-th {
  background: #f8fafc;
  padding: 16px 14px;
  font-weight: 800;
  color: #0f172a;
  border-bottom: 2px solid #e2e8f0;
  border-right: 1px solid #f1f5f9;
  text-align: left;
  vertical-align: bottom;
  font-size: 17px;
  line-height: 1.35;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  white-space: nowrap;
}
.rd-th:last-child {
  border-right: none;
}
.rd-th-sub {
  font-weight: 500;
  font-size: 14px;
  color: #64748b;
  text-transform: none;
  letter-spacing: 0;
  display: block;
  margin-top: 3px;
}
.rd-th--num {
  text-align: right;
}
.rd-td {
  padding: 14px 14px;
  border-bottom: 1px solid #f1f5f9;
  color: #1e293b;
  vertical-align: middle;
  font-size: 18px;
}
.rd-td--num {
  text-align: right;
  font-variant-numeric: tabular-nums;
  font-weight: 600;
}
.rd-td--center {
  text-align: center;
  color: #94a3b8;
  font-weight: 600;
}
.rd-td--small {
  font-size: 16px;
  color: #64748b;
}
.rd-row {
  transition: background 0.15s;
}
.rd-row:hover {
  background: #f0fdf4;
}
.rd-row--total {
  background: #f8fafc;
  border-top: 2px solid #e2e8f0;
}
.rd-row--total .rd-td {
  font-weight: 700;
  font-size: 18px;
  color: #0f172a;
  padding: 16px 14px;
}

/* Utility colors */
.brd-heading {
  color: #1e293b;
}
.brd-muted {
  color: #64748b;
  font-size: 18px;
}
.brd-text-success {
  color: #10b981;
}
.brd-text-warning {
  color: #f59e0b;
}
.brd-text-danger {
  color: #ef4444;
}

/* Card */
.brd-card {
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.02);
}
.brd-card-header {
  padding: 22px 24px;
  border-bottom: 1px solid #e2e8f0;
  background: linear-gradient(135deg, #f8fafc 0%, #fff 100%);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.brd-card-header__icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.brd-card-header__icon--blue {
  background: linear-gradient(135deg, #dbeafe, #eff6ff);
  color: #2563eb;
}
.brd-card-header__icon--amber {
  background: linear-gradient(135deg, #fef3c7, #fffbeb);
  color: #d97706;
}
.brd-card-header__title {
  font-size: 24px;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.3;
}
.brd-card-header__subtitle {
  font-size: 17px;
  color: #64748b;
  margin-top: 3px;
}
.brd-card-header__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 0 10px;
  border-radius: 16px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(37,99,235,0.25);
}

/* Files */
.brd-files-list {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.brd-file-row {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 14px 18px;
  transition: all 0.15s;
}
.brd-file-row:hover {
  background: #eff6ff;
  border-color: #bfdbfe;
}
.brd-file-icon {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: #fef2f2;
  color: #ef4444;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.brd-file-info {
  flex: 1;
  min-width: 0;
}
.brd-file-name {
  font-size: 19px;
  font-weight: 600;
  color: #1e293b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.brd-file-size {
  font-size: 15px;
  color: #94a3b8;
  margin-top: 2px;
}

/* History */
.brd-history-list {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.brd-history-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.brd-history-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-top: 8px;
  flex-shrink: 0;
}
.brd-history-dot--green { background: #10b981; }
.brd-history-dot--red { background: #ef4444; }
.brd-history-dot--orange { background: #f59e0b; }
.brd-history-dot--blue { background: #3b82f6; }
.brd-history-action {
  font-size: 19px;
  color: #1e293b;
}
.brd-history-date {
  font-size: 16px;
  color: #94a3b8;
  margin-top: 2px;
}
.brd-history-comment {
  font-size: 17px;
  color: #64748b;
  margin-top: 4px;
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
