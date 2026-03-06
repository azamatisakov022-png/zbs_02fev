<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAccountStore } from '../../stores/account'
import { declarationStore, type Declaration } from '../../stores/declarations'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import DocumentPreviewModal, { type PreviewDocument } from '../../components/dashboard/DocumentPreviewModal.vue'
import { AppButton, AppBadge, AppCard, AppAlert } from '../../components/ui'
import { getStatusBadgeVariant } from '../../utils/statusVariant'
import { statusI18nKey } from '../../constants/statuses'
import { useBusinessMenu } from '../../composables/useRoleMenu'
import { toastStore } from '../../stores/toast'
import { downloadElementAsPdf } from '../../utils/pdfExport'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { roleTitle, menuItems } = useBusinessMenu()
const accountStore = useAccountStore()

const goBack = () => {
  const from = route.query.from as string
  const routes: Record<string, string> = {
    declarations: '/business/declarations',
    account: '/business/account',
  }
  router.push(routes[from] || '/business/declarations')
}


const declaration = ref<Declaration | undefined>(undefined)
const isLoading = ref(true)

onMounted(async () => {
  await accountStore.fetchAll()
  const id = Number(route.params.id)
  declaration.value = declarationStore.getById(id)
  setTimeout(() => { isLoading.value = false }, 300)
  if (route.query.print === 'true') {
    nextTick(() => { setTimeout(() => window.print(), 500) })
  }
})

function formatCurrency(value: number): string {
  return new Intl.NumberFormat().format(value)
}

function formatWithSign(value: number): string {
  const formatted = formatCurrency(Math.abs(value))
  if (value > 0) return '+' + formatted
  if (value < 0) return '-' + formatted
  return formatted
}

function getDeclarationBadgeVariant(status: string): 'success' | 'warning' | 'danger' | 'info' | 'neutral' {
  if (status === 'revision') return 'warning'
  return getStatusBadgeVariant(status)
}

function getHistoryDotClass(action: string): string {
  const a = action.toLowerCase()
  if (a.includes('одобрен')) return 'bdd-dot-success'
  if (a.includes('отклонен')) return 'bdd-dot-danger'
  if (a.includes('доработк') || a.includes('возвращен')) return 'bdd-dot-warning'
  return 'bdd-dot-info'
}

function handleResubmit() {
  if (!declaration.value) return
  declarationStore.resubmitDeclaration(declaration.value.id)
  declaration.value = declarationStore.getById(declaration.value.id)
  toastStore.show({ type: 'success', title: t('businessDeclDetail.toastResubmittedTitle'), message: t('businessDeclDetail.toastResubmittedMessage') })
}

const printAreaRef = ref<HTMLElement | null>(null)

async function handleDownloadPdf() {
  const el = printAreaRef.value
  if (!el) return
  const filename = `declaration-${declaration.value?.number || 'export'}.pdf`
  await downloadElementAsPdf(el, filename)
}

function handlePrint() {
  window.print()
}

// Document preview
const previewDoc = ref<PreviewDocument | null>(null)

</script>

<template>
  <DashboardLayout
    role="business"
    :roleTitle="roleTitle"
    :userName="accountStore.myAccount?.company || ''"
    :menuItems="menuItems"
  >
    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center py-20">
      <div class="bdd-spinner w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- Not found -->
    <div v-else-if="!declaration" class="text-center py-20">
      <div class="bdd-notfound-icon w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center">
        <svg class="bdd-notfound-icon-svg w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h2 class="bdd-text-24 font-bold bdd-text-dark mb-2">{{ $t('businessDeclDetail.notFound') }}</h2>
      <p class="bdd-text-muted mb-6">{{ $t('businessDeclDetail.notFoundDesc') }}</p>
      <AppButton variant="back" :icon="'<svg width=&quot;16&quot; height=&quot;16&quot; viewBox=&quot;0 0 24 24&quot; fill=&quot;none&quot; stroke=&quot;currentColor&quot; stroke-width=&quot;2&quot; stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot;><path d=&quot;M19 12H5&quot;/><path d=&quot;M12 19l-7-7 7-7&quot;/></svg>'" :label="$t('common.back')" @click="goBack" />
    </div>

    <!-- Main content -->
    <template v-else>
      <div ref="printAreaRef">
      <!-- HEADER -->
      <div class="mb-6">
        <button @click="goBack" class="btn-back mb-4 no-print">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
          {{ $t('common.back') }}
        </button>
        <div class="flex flex-wrap items-center gap-3 mb-1">
          <h1 class="bdd-page-title">{{ $t('businessDeclDetail.declaration') }} {{ declaration.number }}</h1>
          <AppBadge :variant="getDeclarationBadgeVariant(declaration.status)">{{ $t(statusI18nKey[declaration.status] || declaration.status) }}</AppBadge>
        </div>
        <p class="bdd-text-18 bdd-text-muted">{{ $t('businessDeclDetail.submittedAt') }} {{ declaration.submittedAt }}, {{ declaration.submittedBy }}</p>
      </div>

      <!-- Status banners -->
      <AppAlert
        v-if="declaration.status === 'approved'"
        variant="success"
        :title="$t('businessDeclDetail.approvedBanner', { date: declaration.reviewDate, reviewer: declaration.reviewer })"
        class="mb-6"
      >
        <span v-if="declaration.reviewComment">{{ declaration.reviewComment }}</span>
      </AppAlert>

      <div
        v-if="declaration.status === 'rejected'"
        class="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3"
      >
        <div class="bdd-status-icon-danger w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <div class="flex-1">
          <p class="bdd-text-16 font-semibold text-red-900">{{ $t('businessDeclDetail.rejectedBanner', { date: declaration.reviewDate }) }}: {{ declaration.reviewComment }}</p>
          <div class="mt-3">
            <AppButton variant="danger" size="sm" @click="handleResubmit">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {{ $t('businessDeclDetail.resubmit') }}
            </AppButton>
          </div>
        </div>
      </div>

      <div
        v-if="declaration.status === 'revision'"
        class="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 flex items-start gap-3"
      >
        <div class="bdd-status-icon-warning w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <div class="flex-1">
          <p class="bdd-text-16 font-semibold text-orange-900">{{ $t('businessDeclDetail.revisionBanner', { date: declaration.reviewDate }) }}: {{ declaration.reviewComment }}</p>
          <div class="mt-3">
            <AppButton variant="primary" size="sm" @click="handleResubmit">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {{ $t('businessDeclDetail.resubmit') }}
            </AppButton>
          </div>
        </div>
      </div>

      <AppAlert
        v-if="declaration.status === 'under_review'"
        variant="info"
        :title="$t('businessDeclDetail.underReviewBanner')"
        class="mb-6"
      >
        {{ $t('businessDeclDetail.underReviewBannerDesc') }}
      </AppAlert>

      <!-- BLOCK 1 - Данные плательщика -->
      <div class="bdd-section bdd-section--muted">
        <h2 class="bdd-section-title mb-4">{{ $t('businessDeclDetail.payerData') }}</h2>
        <div class="bdd-text-16 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span class="bdd-text-muted">{{ $t('businessDeclDetail.companyName') }}:</span>
            <span class="bdd-text-dark ml-2 font-medium">{{ declaration.company }}</span>
          </div>
          <div>
            <span class="bdd-text-muted">{{ $t('businessDeclDetail.opf') }}:</span>
            <span class="bdd-text-dark ml-2 font-medium">{{ declaration.opf }}</span>
          </div>
          <div>
            <span class="bdd-text-muted">{{ $t('businessDeclDetail.inn') }}:</span>
            <span class="bdd-text-dark ml-2 font-mono font-medium">{{ declaration.inn }}</span>
          </div>
          <div>
            <span class="bdd-text-muted">{{ $t('businessDeclDetail.address') }}:</span>
            <span class="bdd-text-dark ml-2 font-medium">{{ declaration.address }}</span>
          </div>
          <div>
            <span class="bdd-text-muted">{{ $t('businessDeclDetail.contactPerson') }}:</span>
            <span class="bdd-text-dark ml-2 font-medium">{{ declaration.contactPerson }}</span>
          </div>
          <div>
            <span class="bdd-text-muted">{{ $t('businessDeclDetail.phone') }}:</span>
            <span class="bdd-text-dark ml-2 font-medium">{{ declaration.phone }}</span>
          </div>
          <div class="sm:col-span-2">
            <span class="bdd-text-muted">{{ $t('businessDeclDetail.email') }}:</span>
            <span class="bdd-text-link ml-2 font-medium">{{ declaration.email }}</span>
          </div>
        </div>
      </div>

      <!-- BLOCK 2 - Сводные данные декларации -->
      <AppCard radius="sm" class="mb-6">
        <h2 class="bdd-section-title mb-4">{{ $t('businessDeclDetail.summaryData') }}</h2>

        <!-- KPI Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 border border-blue-200 shadow-sm">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <p class="bdd-text-16 font-medium text-blue-800">{{ $t('businessDeclDetail.calcPerYear') }}</p>
            </div>
            <p class="bdd-text-24 font-bold text-blue-900">{{ declaration.calculationCount }}</p>
            <p class="bdd-text-14 text-blue-600 mt-1">{{ $t('businessDeclDetail.forYear', { year: declaration.reportingYear }) }}</p>
          </div>

          <div class="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-5 border border-orange-200 shadow-sm">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p class="bdd-text-16 font-medium text-orange-800">{{ $t('businessDeclDetail.totalCharged') }}</p>
            </div>
            <p class="bdd-text-24 font-bold text-orange-900">{{ formatCurrency(declaration.totalCharged) }}</p>
            <p class="bdd-text-14 text-orange-600 mt-1">{{ $t('businessDeclDetail.som') }}</p>
          </div>

          <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-5 border border-green-200 shadow-sm">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p class="bdd-text-16 font-medium text-green-800">{{ $t('businessDeclDetail.totalPaid') }}</p>
            </div>
            <p class="bdd-text-24 font-bold text-green-900">{{ formatCurrency(declaration.totalPaid) }}</p>
            <p class="bdd-text-14 text-green-600 mt-1">{{ $t('businessDeclDetail.som') }}</p>
          </div>

          <div :class="[
            'rounded-2xl p-5 border shadow-sm bg-gradient-to-br',
            declaration.balance >= 0
              ? 'from-green-50 to-green-100 border-green-200'
              : 'from-red-50 to-red-100 border-red-200'
          ]">
            <div class="flex items-center gap-3 mb-3">
              <div :class="[
                'w-10 h-10 rounded-xl flex items-center justify-center',
                declaration.balance >= 0 ? 'bg-green-500' : 'bg-red-500'
              ]">
                <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <p :class="['bdd-text-16 font-medium', declaration.balance >= 0 ? 'text-green-800' : 'text-red-800']">{{ $t('businessDeclDetail.balance') }}</p>
            </div>
            <p :class="['text-3xl font-bold', declaration.balance >= 0 ? 'text-green-900' : 'text-red-900']">{{ formatWithSign(declaration.balance) }}</p>
            <p :class="['bdd-text-14 mt-1', declaration.balance >= 0 ? 'text-green-600' : 'text-red-600']">{{ $t('businessDeclDetail.som') }}</p>
          </div>
        </div>

        <!-- Table: Расчёты -->
        <div class="mb-6">
          <h3 class="bdd-subsection-title mb-3">{{ $t('businessDeclDetail.calculationsInDecl') }}</h3>
          <div class="bdd-table-wrap overflow-x-auto rounded-xl">
            <table class="bdd-table w-full border-collapse">
              <thead class="bdd-table-head">
                <tr class="bdd-table-head-row text-left">
                  <th class="px-4 py-3 font-medium">{{ $t('businessDeclDetail.thCalcNumber') }}</th>
                  <th class="px-4 py-3 font-medium">{{ $t('businessDeclDetail.thPeriod') }}</th>
                  <th class="px-4 py-3 font-medium">{{ $t('businessDeclDetail.thCategories') }}</th>
                  <th class="px-4 py-3 font-medium text-right">{{ $t('businessDeclDetail.thMass') }}</th>
                  <th class="px-4 py-3 font-medium text-right">{{ $t('businessDeclDetail.thAmount') }}</th>
                  <th class="px-4 py-3 font-medium">{{ $t('businessDeclDetail.thCalcStatus') }}</th>
                  <th class="px-4 py-3 font-medium">{{ $t('businessDeclDetail.thAcceptedDate') }}</th>
                </tr>
              </thead>
              <tbody class="bdd-table-body divide-y">
                <tr v-for="calc in declaration.calculations" :key="calc.number" class="bdd-table-row-hover">
                  <td class="bdd-text-link px-4 py-3 font-mono font-medium">{{ calc.number }}</td>
                  <td class="bdd-text-dark px-4 py-3">{{ calc.period }}</td>
                  <td class="bdd-text-muted px-4 py-3">{{ calc.categories }}</td>
                  <td class="bdd-text-dark px-4 py-3 text-right font-medium">{{ calc.mass }}</td>
                  <td class="bdd-text-dark px-4 py-3 text-right font-medium">{{ formatCurrency(calc.amount) }}</td>
                  <td class="px-4 py-3">
                    <AppBadge :variant="getStatusBadgeVariant(calc.calcStatus)">{{ $t(statusI18nKey[calc.calcStatus] || calc.calcStatus) }}</AppBadge>
                  </td>
                  <td class="bdd-text-muted px-4 py-3">{{ calc.acceptedDate }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Table: Отчёты о переработке -->
        <div v-if="declaration.reports.length > 0" class="mb-6">
          <h3 class="bdd-subsection-title mb-3">{{ $t('businessDeclDetail.recyclingReports') }}</h3>
          <div class="bdd-table-wrap overflow-x-auto rounded-xl">
            <table class="bdd-table w-full border-collapse">
              <thead class="bdd-table-head">
                <tr class="bdd-table-head-row text-left">
                  <th class="px-4 py-3 font-medium">{{ $t('businessDeclDetail.thReportNumber') }}</th>
                  <th class="px-4 py-3 font-medium">{{ $t('businessDeclDetail.thPeriod') }}</th>
                  <th class="px-4 py-3 font-medium">{{ $t('businessDeclDetail.thCategories') }}</th>
                  <th class="px-4 py-3 font-medium text-right">{{ $t('businessDeclDetail.thProcessed') }}</th>
                  <th class="px-4 py-3 font-medium text-right">{{ $t('businessDeclDetail.thCredited') }}</th>
                  <th class="px-4 py-3 font-medium">{{ $t('businessDeclDetail.thStatus') }}</th>
                  <th class="px-4 py-3 font-medium">{{ $t('businessDeclDetail.thAcceptedDate') }}</th>
                </tr>
              </thead>
              <tbody class="bdd-table-body divide-y">
                <tr v-for="report in declaration.reports" :key="report.number" class="bdd-table-row-hover">
                  <td class="bdd-text-link px-4 py-3 font-mono font-medium">{{ report.number }}</td>
                  <td class="bdd-text-dark px-4 py-3">{{ report.period }}</td>
                  <td class="bdd-text-muted px-4 py-3">{{ report.categories }}</td>
                  <td class="bdd-text-dark px-4 py-3 text-right font-medium">{{ report.processed }}</td>
                  <td class="bdd-text-dark px-4 py-3 text-right font-medium">{{ formatCurrency(report.credited) }}</td>
                  <td class="px-4 py-3">
                    <AppBadge :variant="getStatusBadgeVariant(report.reportStatus)">{{ $t(statusI18nKey[report.reportStatus] || report.reportStatus) }}</AppBadge>
                  </td>
                  <td class="bdd-text-muted px-4 py-3">{{ report.acceptedDate }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Table: Платежи за год -->
        <div v-if="declaration.payments.length > 0">
          <h3 class="bdd-subsection-title mb-3">{{ $t('businessDeclDetail.paymentsForYear') }}</h3>
          <div class="bdd-table-wrap overflow-x-auto rounded-xl">
            <table class="bdd-table w-full border-collapse">
              <thead class="bdd-table-head">
                <tr class="bdd-table-head-row text-left">
                  <th class="px-4 py-3 font-medium">{{ $t('businessDeclDetail.thDate') }}</th>
                  <th class="px-4 py-3 font-medium">{{ $t('businessDeclDetail.thPaymentNumber') }}</th>
                  <th class="px-4 py-3 font-medium text-right">{{ $t('businessDeclDetail.thAmount') }}</th>
                  <th class="px-4 py-3 font-medium">{{ $t('businessDeclDetail.thMethod') }}</th>
                  <th class="px-4 py-3 font-medium">{{ $t('businessDeclDetail.thStatus') }}</th>
                </tr>
              </thead>
              <tbody class="bdd-table-body divide-y">
                <tr v-for="payment in declaration.payments" :key="payment.number" class="bdd-table-row-hover">
                  <td class="bdd-text-dark px-4 py-3">{{ payment.date }}</td>
                  <td class="bdd-text-dark px-4 py-3 font-mono font-medium">{{ payment.number }}</td>
                  <td class="bdd-text-dark px-4 py-3 text-right font-medium">{{ formatCurrency(payment.amount) }}</td>
                  <td class="bdd-text-muted px-4 py-3">{{ payment.method }}</td>
                  <td class="px-4 py-3">
                    <AppBadge :variant="getStatusBadgeVariant(payment.paymentStatus)">{{ $t(statusI18nKey[payment.paymentStatus] || payment.paymentStatus) }}</AppBadge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </AppCard>

      <!-- BLOCK 3 - Документы -->
      <AppCard radius="sm" class="mb-6">
        <h2 class="bdd-section-title mb-4">{{ $t('businessDeclDetail.documents') }}</h2>
        <template v-if="declaration.documents.length > 0">
          <div class="space-y-3">
            <div
              v-for="doc in declaration.documents"
              :key="doc.id"
              class="bdd-doc-row flex items-center gap-3 rounded-lg px-4 py-3"
            >
              <div class="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="bdd-text-16 bdd-text-dark font-medium truncate">{{ doc.name }}</p>
                <p class="bdd-text-14 bdd-text-muted">{{ doc.size }} &middot; {{ doc.source }}</p>
              </div>
              <div class="flex items-center gap-2 flex-shrink-0">
                <AppButton variant="ghost" size="sm" :label="$t('businessDeclDetail.preview')" @click="previewDoc = { name: doc.name, size: doc.size, source: doc.source }" />
                <AppButton variant="ghost" size="sm" :label="$t('businessDeclDetail.download')" @click="toastStore.show({ type: 'info', title: $t('businessDeclDetail.toastDownloadTitle'), message: $t('businessDeclDetail.toastDownloadMessage') })" />
              </div>
            </div>
          </div>
        </template>
        <template v-else>
          <p class="bdd-text-16 bdd-text-muted">{{ $t('businessDeclDetail.noDocuments') }}</p>
        </template>
      </AppCard>

      <!-- BLOCK 4 - История -->
      <AppCard radius="sm" class="mb-6">
        <h2 class="bdd-section-title mb-4">{{ $t('businessDeclDetail.reviewHistory') }}</h2>
        <div class="space-y-0">
          <div
            v-for="(entry, idx) in declaration.history"
            :key="entry.id"
            class="flex gap-4"
          >
            <div class="flex flex-col items-center">
              <div :class="['w-3 h-3 rounded-full flex-shrink-0 mt-1.5', getHistoryDotClass(entry.action)]"></div>
              <div
                v-if="idx < declaration.history.length - 1"
                class="bdd-timeline-line w-0.5 flex-1"
              ></div>
            </div>
            <div class="pb-5">
              <p class="bdd-text-16 bdd-text-dark font-medium">{{ entry.action }}</p>
              <p class="bdd-text-14 bdd-text-muted mt-0.5">{{ entry.date }} &middot; {{ entry.user }}</p>
              <p v-if="entry.comment" class="bdd-history-comment bdd-text-14 bdd-text-muted mt-1 rounded-lg px-3 py-2">
                {{ entry.comment }}
              </p>
            </div>
          </div>
        </div>
      </AppCard>

      <!-- Action buttons at bottom -->
      <div v-if="declaration.status === 'approved'" class="flex flex-wrap items-center gap-3 mb-4">
        <AppButton variant="outline" @click="handleDownloadPdf">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {{ $t('businessDeclDetail.downloadPdf') }}
        </AppButton>
        <AppButton variant="outline" @click="handlePrint">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          {{ $t('common.print') }}
        </AppButton>
      </div>
      <div style="border-top: 1px solid #e5e7eb; margin-top: 16px; padding-top: 16px;" class="mb-6">
        <button @click="goBack" class="btn-back">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
          {{ $t('common.back') }}
        </button>
      </div>
      </div>
    </template>

    <DocumentPreviewModal :doc="previewDoc" @close="previewDoc = null" />
  </DashboardLayout>
</template>

<style scoped>
.bdd-page-title {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
}
@media (min-width: 1024px) {
  .bdd-page-title { font-size: 34px; }
}
.bdd-section--muted {
  background: #f8fafc;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  border: 1px solid #e2e8f0;
}
.bdd-text-14 {
  font-size: 14px;
}
.bdd-text-16 {
  font-size: 16px;
}
.bdd-text-18 {
  font-size: 18px;
}
.bdd-text-22 {
  font-size: 22px;
}
.bdd-text-24 {
  font-size: 24px;
}
.bdd-text-muted {
  color: #64748b;
}
.bdd-text-dark {
  color: #1e293b;
}
.bdd-text-link {
  color: #2563eb;
}
.bdd-section-title {
  font-size: 22px;
  font-weight: 700;
  color: #1e293b;
}
.bdd-subsection-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}
.bdd-spinner {
  border-color: #22C55E;
}
.bdd-notfound-icon {
  background: #f1f5f9;
}
.bdd-notfound-icon-svg {
  color: #94a3b8;
}
.bdd-status-icon-success {
  background: #22C55E;
}
.bdd-status-icon-danger {
  background: #EF4444;
}
.bdd-status-icon-warning {
  background: #F59E0B;
}
.bdd-status-icon-info {
  background: #3B82F6;
}
.bdd-dot-success {
  background: #22C55E;
}
.bdd-dot-danger {
  background: #EF4444;
}
.bdd-dot-warning {
  background: #F59E0B;
}
.bdd-dot-info {
  background: #3B82F6;
}
.bdd-table-wrap {
  border: 1px solid #e2e8f0;
}
.bdd-table {
  font-size: 16px;
}
.bdd-table-head {
  background: #f8fafc;
}
.bdd-table-head-row {
  color: #64748b;
}
.bdd-table-body > :not([hidden]) ~ :not([hidden]) {
  border-color: #e2e8f0;
}
.bdd-table-row-hover:hover {
  background: #f8fafc;
}
.bdd-doc-row {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}
.bdd-timeline-line {
  background: #e2e8f0;
  min-height: 32px;
}
.bdd-history-comment {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}
</style>
