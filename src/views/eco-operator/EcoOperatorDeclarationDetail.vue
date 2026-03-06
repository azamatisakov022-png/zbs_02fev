<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { declarationStore, type Declaration } from '../../stores/declarations'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import DocumentPreviewModal, { type PreviewDocument } from '../../components/dashboard/DocumentPreviewModal.vue'
import { AppButton, AppBadge, AppModal, AppAlert, AppCard } from '../../components/ui'
import { getStatusBadgeVariant } from '../../utils/statusVariant'
import { DeclStatus, statusI18nKey } from '../../constants/statuses'
import { useEcoOperatorMenu } from '../../composables/useRoleMenu'
import { toastStore } from '../../stores/toast'
import { notificationStore } from '../../stores/notifications'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const { roleTitle, menuItems } = useEcoOperatorMenu()

// Declaration data
const declaration = ref<Declaration | undefined>(undefined)
const isLoading = ref(true)

onMounted(() => {
  const id = Number(route.params.id)
  declaration.value = declarationStore.getById(id)
  setTimeout(() => { isLoading.value = false }, 300)
})

// Document preview
const previewDoc = ref<PreviewDocument | null>(null)

// Modal states
const showApproveModal = ref(false)
const showRejectModal = ref(false)
const showReturnModal = ref(false)

const approveComment = ref('')
const rejectReason = ref('')
const returnComment = ref('')

// Toast state
const toastVisible = ref(false)
const toastMessage = ref('')
const toastType = ref<'success' | 'danger' | 'warning'>('success')

function showToast(message: string, type: 'success' | 'danger' | 'warning') {
  toastMessage.value = message
  toastType.value = type
  toastVisible.value = true
  setTimeout(() => { toastVisible.value = false }, 3000)
}

// Format currency
function formatCurrency(value: number): string {
  return new Intl.NumberFormat().format(value)
}

function formatWithSign(value: number): string {
  const formatted = formatCurrency(Math.abs(value))
  if (value > 0) return '+' + formatted
  if (value < 0) return '-' + formatted
  return formatted
}

// Status badge variant with special handling for "На доработке"
function getDeclarationBadgeVariant(status: string): 'success' | 'warning' | 'danger' | 'info' | 'neutral' {
  if (status === DeclStatus.REVISION) return 'warning'
  return getStatusBadgeVariant(status)
}

// History dot color
function getHistoryDotClass(action: string): string {
  const a = action.toLowerCase()
  if (a.includes('одобрен')) return 'bg-[#22C55E]'
  if (a.includes('отклонен')) return 'bg-[#EF4444]'
  if (a.includes('доработк') || a.includes('возвращен')) return 'bg-[#F59E0B]'
  return 'bg-[#3B82F6]'
}

// Actions
function handleApprove() {
  if (!declaration.value) return
  declarationStore.approveDeclaration(declaration.value.id, approveComment.value.trim() || undefined)
  declaration.value = declarationStore.getById(declaration.value.id)
  notificationStore.add({
    type: 'success',
    title: t('ecoDeclarationDetail.notifApprovedTitle'),
    message: t('ecoDeclarationDetail.notifApprovedMessage'),
    role: 'business'
  })
  showApproveModal.value = false
  approveComment.value = ''
  showToast(t('ecoDeclarationDetail.toastApproved'), 'success')
  setTimeout(() => {
    router.push('/eco-operator/incoming-declarations')
  }, 1500)
}

function handleReject() {
  if (!declaration.value) return
  declarationStore.rejectDeclaration(declaration.value.id, rejectReason.value.trim())
  declaration.value = declarationStore.getById(declaration.value.id)
  notificationStore.add({
    type: 'warning',
    title: t('ecoDeclarationDetail.notifRejectedTitle'),
    message: t('ecoDeclarationDetail.notifRejectedMessage', { reason: rejectReason.value.trim() }),
    role: 'business'
  })
  showRejectModal.value = false
  rejectReason.value = ''
  showToast(t('ecoDeclarationDetail.toastRejected'), 'danger')
  setTimeout(() => {
    router.push('/eco-operator/incoming-declarations')
  }, 1500)
}

function handleReturn() {
  if (!declaration.value) return
  declarationStore.returnForRevision(declaration.value.id, returnComment.value.trim())
  declaration.value = declarationStore.getById(declaration.value.id)
  showReturnModal.value = false
  returnComment.value = ''
  showToast(t('ecoDeclarationDetail.toastReturned'), 'warning')
  setTimeout(() => {
    router.push('/eco-operator/incoming-declarations')
  }, 1500)
}

const isRejectValid = computed(() => rejectReason.value.trim().length >= 10)
const isReturnValid = computed(() => returnComment.value.trim().length >= 10)
</script>

<template>
  <DashboardLayout
    role="eco-operator"
    :roleTitle="roleTitle"
    userName="ОсОО «ЭкоПереработка»"
    :menuItems="menuItems"
  >
    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center py-20">
      <div class="w-8 h-8 border-4 border-[#22C55E] border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- Not found -->
    <div v-else-if="!declaration" class="text-center py-20">
      <div class="w-16 h-16 mx-auto mb-4 bg-[#f1f5f9] rounded-full flex items-center justify-center">
        <svg class="w-8 h-8 text-[#94a3b8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h2 class="text-xl font-bold text-[#1e293b] mb-2">{{ $t('ecoDeclarationDetail.notFound') }}</h2>
      <p class="text-[#64748b] mb-6">{{ $t('ecoDeclarationDetail.notFoundDescription') }}</p>
      <AppButton variant="primary" @click="router.push('/eco-operator/incoming-declarations')">
        {{ $t('ecoDeclarationDetail.backToList') }}
      </AppButton>
    </div>

    <!-- Main content -->
    <template v-else>
      <!-- HEADER -->
      <div class="mb-6">
        <AppButton
          variant="back"
          size="sm"
          :icon="'<svg class=\'w-4 h-4\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'currentColor\'><path stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M15 19l-7-7 7-7\' /></svg>'"
          :label="$t('ecoDeclarationDetail.incomingDeclarations')"
          @click="router.push('/eco-operator/incoming-declarations')"
        />
        <div class="flex flex-wrap items-center gap-3 mb-1">
          <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b]">{{ $t('ecoDeclarationDetail.declarationNumber', { number: declaration.number }) }}</h1>
          <AppBadge :variant="getDeclarationBadgeVariant(declaration.status)">{{ $t(statusI18nKey[declaration.status] || declaration.status) }}</AppBadge>
        </div>
        <p class="text-[#64748b]">{{ $t('ecoDeclarationDetail.submittedAt', { date: declaration.submittedAt, submittedBy: declaration.submittedBy }) }}</p>
      </div>

      <!-- Result banner -->
      <AppAlert
        v-if="declaration.status === 'approved'"
        variant="success"
        :title="$t('ecoDeclarationDetail.approvedBanner', { date: declaration.reviewDate, reviewer: declaration.reviewer })"
        class="mb-6"
      >
        <span v-if="declaration.reviewComment">{{ declaration.reviewComment }}</span>
      </AppAlert>

      <AppAlert
        v-if="declaration.status === 'rejected'"
        variant="error"
        class="mb-6"
      >
        {{ $t('ecoDeclarationDetail.rejectedBanner', { date: declaration.reviewDate, comment: declaration.reviewComment }) }}
      </AppAlert>

      <AppAlert
        v-if="declaration.status === 'revision'"
        variant="warning"
        bg="#fff7ed"
        borderColor="#fed7aa"
        color="#9a3412"
        class="mb-6"
      >
        {{ $t('ecoDeclarationDetail.returnedBanner', { date: declaration.reviewDate, comment: declaration.reviewComment }) }}
      </AppAlert>

      <!-- BLOCK 1 - Данные плательщика -->
      <div class="bg-[#f8fafc] rounded-xl p-5 mb-6 border border-[#e2e8f0]">
        <h2 class="text-lg font-bold text-[#1e293b] mb-4">{{ $t('ecoDeclarationDetail.payerData') }}</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <span class="text-[#64748b]">{{ $t('ecoDeclarationDetail.companyName') }}</span>
            <span class="ml-2 font-medium text-[#1e293b]">{{ declaration.company }}</span>
          </div>
          <div>
            <span class="text-[#64748b]">{{ $t('ecoDeclarationDetail.opf') }}</span>
            <span class="ml-2 font-medium text-[#1e293b]">{{ declaration.opf }}</span>
          </div>
          <div>
            <span class="text-[#64748b]">{{ $t('ecoDeclarationDetail.inn') }}</span>
            <span class="ml-2 font-mono font-medium text-[#1e293b]">{{ declaration.inn }}</span>
          </div>
          <div>
            <span class="text-[#64748b]">{{ $t('ecoDeclarationDetail.address') }}</span>
            <span class="ml-2 font-medium text-[#1e293b]">{{ declaration.address }}</span>
          </div>
          <div>
            <span class="text-[#64748b]">{{ $t('ecoDeclarationDetail.contactPerson') }}</span>
            <span class="ml-2 font-medium text-[#1e293b]">{{ declaration.contactPerson }}</span>
          </div>
          <div>
            <span class="text-[#64748b]">{{ $t('ecoDeclarationDetail.phone') }}</span>
            <span class="ml-2 font-medium text-[#1e293b]">{{ declaration.phone }}</span>
          </div>
          <div class="sm:col-span-2">
            <span class="text-[#64748b]">{{ $t('ecoDeclarationDetail.email') }}</span>
            <span class="ml-2 font-medium text-[#2563eb]">{{ declaration.email }}</span>
          </div>
        </div>
      </div>

      <AppCard radius="sm" class="mb-6">
        <h2 class="text-lg font-bold text-[#1e293b] mb-4">{{ $t('ecoDeclarationDetail.summaryData') }}</h2>

        <!-- KPI Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <!-- Расчётов за год -->
          <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 border border-blue-200 shadow-sm">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <p class="text-sm font-medium text-blue-800">{{ $t('ecoDeclarationDetail.calculationsPerYear') }}</p>
            </div>
            <p class="text-3xl font-bold text-blue-900">{{ declaration.calculationCount }}</p>
            <p class="text-xs text-blue-600 mt-1">{{ $t('ecoDeclarationDetail.forYear', { year: declaration.reportingYear }) }}</p>
          </div>

          <!-- Итого начислено -->
          <div class="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-5 border border-orange-200 shadow-sm">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p class="text-sm font-medium text-orange-800">{{ $t('ecoDeclarationDetail.totalCharged') }}</p>
            </div>
            <p class="text-3xl font-bold text-orange-900">{{ formatCurrency(declaration.totalCharged) }}</p>
            <p class="text-xs text-orange-600 mt-1">{{ $t('ecoDeclarationDetail.som') }}</p>
          </div>

          <!-- Итого оплачено -->
          <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-5 border border-green-200 shadow-sm">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p class="text-sm font-medium text-green-800">{{ $t('ecoDeclarationDetail.totalPaid') }}</p>
            </div>
            <p class="text-3xl font-bold text-green-900">{{ formatCurrency(declaration.totalPaid) }}</p>
            <p class="text-xs text-green-600 mt-1">{{ $t('ecoDeclarationDetail.som') }}</p>
          </div>

          <!-- Сальдо -->
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
              <p :class="['text-sm font-medium', declaration.balance >= 0 ? 'text-green-800' : 'text-red-800']">{{ $t('ecoDeclarationDetail.balance') }}</p>
            </div>
            <p :class="['text-3xl font-bold', declaration.balance >= 0 ? 'text-green-900' : 'text-red-900']">{{ formatWithSign(declaration.balance) }}</p>
            <p :class="['text-xs mt-1', declaration.balance >= 0 ? 'text-green-600' : 'text-red-600']">{{ $t('ecoDeclarationDetail.som') }}</p>
          </div>
        </div>

        <!-- Table: Расчёты -->
        <div class="mb-6">
          <h3 class="font-semibold text-[#1e293b] mb-3">{{ $t('ecoDeclarationDetail.calculationsInDeclaration') }}</h3>
          <div class="overflow-x-auto border border-[#e2e8f0] rounded-xl">
            <table class="w-full text-sm border-collapse">
              <thead class="bg-[#f8fafc]">
                <tr class="text-left text-[#64748b]">
                  <th class="px-4 py-3 font-medium">{{ $t('ecoDeclarationDetail.colCalcNumber') }}</th>
                  <th class="px-4 py-3 font-medium">{{ $t('ecoDeclarationDetail.colPeriod') }}</th>
                  <th class="px-4 py-3 font-medium">{{ $t('ecoDeclarationDetail.colCategories') }}</th>
                  <th class="px-4 py-3 font-medium text-right">{{ $t('ecoDeclarationDetail.colMassTons') }}</th>
                  <th class="px-4 py-3 font-medium text-right">{{ $t('ecoDeclarationDetail.colAmountSom') }}</th>
                  <th class="px-4 py-3 font-medium">{{ $t('ecoDeclarationDetail.colCalcStatus') }}</th>
                  <th class="px-4 py-3 font-medium">{{ $t('ecoDeclarationDetail.colAcceptedDate') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#e2e8f0]">
                <tr v-for="calc in declaration.calculations" :key="calc.number" class="hover:bg-[#f8fafc]">
                  <td class="px-4 py-3 font-mono font-medium text-[#2563eb]">{{ calc.number }}</td>
                  <td class="px-4 py-3 text-[#1e293b]">{{ calc.period }}</td>
                  <td class="px-4 py-3 text-[#64748b]">{{ calc.categories }}</td>
                  <td class="px-4 py-3 text-right font-medium text-[#1e293b]">{{ calc.mass }}</td>
                  <td class="px-4 py-3 text-right font-medium text-[#1e293b]">{{ formatCurrency(calc.amount) }}</td>
                  <td class="px-4 py-3">
                    <AppBadge :variant="getStatusBadgeVariant(calc.calcStatus)">{{ $t(statusI18nKey[calc.calcStatus] || calc.calcStatus) }}</AppBadge>
                  </td>
                  <td class="px-4 py-3 text-[#64748b]">{{ calc.acceptedDate }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Table: Отчёты о переработке -->
        <div v-if="declaration.reports.length > 0" class="mb-6">
          <h3 class="font-semibold text-[#1e293b] mb-3">{{ $t('ecoDeclarationDetail.recyclingReports') }}</h3>
          <div class="overflow-x-auto border border-[#e2e8f0] rounded-xl">
            <table class="w-full text-sm border-collapse">
              <thead class="bg-[#f8fafc]">
                <tr class="text-left text-[#64748b]">
                  <th class="px-4 py-3 font-medium">{{ $t('ecoDeclarationDetail.colReportNumber') }}</th>
                  <th class="px-4 py-3 font-medium">{{ $t('ecoDeclarationDetail.colPeriod') }}</th>
                  <th class="px-4 py-3 font-medium">{{ $t('ecoDeclarationDetail.colCategories') }}</th>
                  <th class="px-4 py-3 font-medium text-right">{{ $t('ecoDeclarationDetail.colProcessedTons') }}</th>
                  <th class="px-4 py-3 font-medium text-right">{{ $t('ecoDeclarationDetail.colCreditedSom') }}</th>
                  <th class="px-4 py-3 font-medium">{{ $t('ecoDeclarationDetail.colStatus') }}</th>
                  <th class="px-4 py-3 font-medium">{{ $t('ecoDeclarationDetail.colAcceptedDate') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#e2e8f0]">
                <tr v-for="report in declaration.reports" :key="report.number" class="hover:bg-[#f8fafc]">
                  <td class="px-4 py-3 font-mono font-medium text-[#2563eb]">{{ report.number }}</td>
                  <td class="px-4 py-3 text-[#1e293b]">{{ report.period }}</td>
                  <td class="px-4 py-3 text-[#64748b]">{{ report.categories }}</td>
                  <td class="px-4 py-3 text-right font-medium text-[#1e293b]">{{ report.processed }}</td>
                  <td class="px-4 py-3 text-right font-medium text-[#1e293b]">{{ formatCurrency(report.credited) }}</td>
                  <td class="px-4 py-3">
                    <AppBadge :variant="getStatusBadgeVariant(report.reportStatus)">{{ $t(statusI18nKey[report.reportStatus] || report.reportStatus) }}</AppBadge>
                  </td>
                  <td class="px-4 py-3 text-[#64748b]">{{ report.acceptedDate }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Table: Платежи за год -->
        <div v-if="declaration.payments.length > 0">
          <h3 class="font-semibold text-[#1e293b] mb-3">{{ $t('ecoDeclarationDetail.paymentsForYear') }}</h3>
          <div class="overflow-x-auto border border-[#e2e8f0] rounded-xl">
            <table class="w-full text-sm border-collapse">
              <thead class="bg-[#f8fafc]">
                <tr class="text-left text-[#64748b]">
                  <th class="px-4 py-3 font-medium">{{ $t('ecoDeclarationDetail.colDate') }}</th>
                  <th class="px-4 py-3 font-medium">{{ $t('ecoDeclarationDetail.colPaymentNumber') }}</th>
                  <th class="px-4 py-3 font-medium text-right">{{ $t('ecoDeclarationDetail.colPaymentAmountSom') }}</th>
                  <th class="px-4 py-3 font-medium">{{ $t('ecoDeclarationDetail.colMethod') }}</th>
                  <th class="px-4 py-3 font-medium">{{ $t('ecoDeclarationDetail.colStatus') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#e2e8f0]">
                <tr v-for="payment in declaration.payments" :key="payment.number" class="hover:bg-[#f8fafc]">
                  <td class="px-4 py-3 text-[#1e293b]">{{ payment.date }}</td>
                  <td class="px-4 py-3 font-mono font-medium text-[#1e293b]">{{ payment.number }}</td>
                  <td class="px-4 py-3 text-right font-medium text-[#1e293b]">{{ formatCurrency(payment.amount) }}</td>
                  <td class="px-4 py-3 text-[#64748b]">{{ payment.method }}</td>
                  <td class="px-4 py-3">
                    <AppBadge :variant="getStatusBadgeVariant(payment.paymentStatus)">{{ $t(statusI18nKey[payment.paymentStatus] || payment.paymentStatus) }}</AppBadge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </AppCard>

      <AppCard radius="sm" class="mb-6">
        <h2 class="text-lg font-bold text-[#1e293b] mb-4">{{ $t('ecoDeclarationDetail.documents') }}</h2>
        <template v-if="declaration.documents.length > 0">
          <div class="space-y-3">
            <div
              v-for="doc in declaration.documents"
              :key="doc.id"
              class="flex items-center gap-3 bg-[#f8fafc] rounded-lg px-4 py-3 border border-[#e2e8f0]"
            >
              <div class="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-[#1e293b] truncate">{{ doc.name }}</p>
                <p class="text-xs text-[#64748b]">{{ doc.size }} &middot; {{ doc.source }}</p>
              </div>
              <div class="flex items-center gap-2 flex-shrink-0">
                <AppButton
                  variant="ghost"
                  size="sm"
                  :label="$t('ecoDeclarationDetail.preview')"
                  @click="previewDoc = { name: doc.name, size: doc.size, source: doc.source }"
                />
                <AppButton
                  variant="ghost"
                  size="sm"
                  :label="$t('ecoDeclarationDetail.downloadLabel')"
                  @click="toastStore.show({ type: 'info', title: $t('ecoDeclarationDetail.downloading'), message: $t('ecoDeclarationDetail.downloadAvailableAfterStorage') })"
                />
              </div>
            </div>
          </div>
        </template>
        <template v-else>
          <p class="text-sm text-[#64748b]">{{ $t('ecoDeclarationDetail.noDocuments') }}</p>
        </template>
      </AppCard>

      <AppCard radius="sm" class="mb-24">
        <h2 class="text-lg font-bold text-[#1e293b] mb-4">{{ $t('ecoDeclarationDetail.reviewHistory') }}</h2>
        <div class="space-y-0">
          <div
            v-for="(entry, idx) in declaration.history"
            :key="entry.id"
            class="flex gap-4"
          >
            <!-- Timeline line + dot -->
            <div class="flex flex-col items-center">
              <div :class="['w-3 h-3 rounded-full flex-shrink-0 mt-1.5', getHistoryDotClass(entry.action)]"></div>
              <div
                v-if="idx < declaration.history.length - 1"
                class="w-0.5 bg-[#e2e8f0] flex-1 min-h-[32px]"
              ></div>
            </div>
            <!-- Content -->
            <div class="pb-5">
              <p class="text-sm font-medium text-[#1e293b]">{{ entry.action }}</p>
              <p class="text-xs text-[#64748b] mt-0.5">{{ entry.date }} &middot; {{ entry.user }}</p>
              <p v-if="entry.comment" class="text-xs text-[#64748b] mt-1 bg-[#f8fafc] rounded-lg px-3 py-2 border border-[#e2e8f0]">
                {{ entry.comment }}
              </p>
            </div>
          </div>
        </div>
      </AppCard>

      <!-- STICKY ACTION BAR -->
      <div
        v-if="declaration.status === 'under_review'"
        class="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e2e8f0] shadow-lg z-50"
      >
        <div class="max-w-5xl mx-auto px-6 py-4 flex flex-wrap items-center justify-end gap-3">
          <AppButton
            variant="warning"
            :icon="'<svg class=\'w-4 h-4\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'currentColor\'><path stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6\' /></svg>'"
            :label="$t('ecoDeclarationDetail.returnForRevision')"
            @click="showReturnModal = true"
          />
          <AppButton
            variant="danger"
            :icon="'<svg class=\'w-4 h-4\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'currentColor\'><path stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M6 18L18 6M6 6l12 12\' /></svg>'"
            :label="$t('ecoDeclarationDetail.reject')"
            @click="showRejectModal = true"
          />
          <AppButton
            variant="success"
            :icon="'<svg class=\'w-4 h-4\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'currentColor\'><path stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M5 13l4 4L19 7\' /></svg>'"
            :label="$t('ecoDeclarationDetail.approveDeclaration')"
            @click="showApproveModal = true"
          />
        </div>
      </div>
    </template>

    <!-- MODALS -->

    <!-- Approve Modal -->
    <AppModal :visible="showApproveModal && !!declaration" :title="declaration ? $t('ecoDeclarationDetail.approveTitle', { number: declaration.number }) : ''" size="md" @close="showApproveModal = false">
      <div class="space-y-4">
        <p class="text-sm text-[#64748b]">{{ $t('ecoDeclarationDetail.approveConfirmText') }}</p>
        <div>
          <label class="block text-sm font-medium text-[#1e293b] mb-1.5">{{ $t('ecoDeclarationDetail.commentOptional') }}</label>
          <textarea
            v-model="approveComment"
            rows="3"
            :placeholder="$t('ecoDeclarationDetail.enterComment')"
            class="w-full px-4 py-3 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#22C55E] text-sm resize-none"
          ></textarea>
        </div>
      </div>
      <template #footer>
        <AppButton variant="secondary" @click="showApproveModal = false; approveComment = ''">
          {{ $t('common.cancel') }}
        </AppButton>
        <AppButton variant="primary" @click="handleApprove">
          {{ $t('common.confirm') }}
        </AppButton>
      </template>
    </AppModal>

    <!-- Reject Modal -->
    <AppModal :visible="showRejectModal && !!declaration" :title="$t('ecoDeclarationDetail.rejectTitle')" size="md" @close="showRejectModal = false">
      <div>
        <label class="block text-sm font-medium text-[#1e293b] mb-1.5">{{ $t('ecoDeclarationDetail.rejectReasonLabel') }} <span class="text-red-500">*</span></label>
        <textarea
          v-model="rejectReason"
          rows="4"
          :placeholder="$t('ecoDeclarationDetail.rejectReasonPlaceholder')"
          class="w-full px-4 py-3 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#EF4444] text-sm resize-none"
        ></textarea>
        <p v-if="rejectReason.trim().length > 0 && rejectReason.trim().length < 10" class="text-xs text-red-500 mt-1">
          {{ $t('ecoDeclarationDetail.minChars', { count: rejectReason.trim().length }) }}
        </p>
      </div>
      <template #footer>
        <AppButton variant="secondary" @click="showRejectModal = false; rejectReason = ''">
          {{ $t('common.cancel') }}
        </AppButton>
        <AppButton variant="danger" :disabled="!isRejectValid" @click="handleReject">
          {{ $t('ecoDeclarationDetail.reject') }}
        </AppButton>
      </template>
    </AppModal>

    <!-- Return Modal -->
    <AppModal :visible="showReturnModal && !!declaration" :title="$t('ecoDeclarationDetail.returnTitle')" size="md" @close="showReturnModal = false">
      <div>
        <label class="block text-sm font-medium text-[#1e293b] mb-1.5">{{ $t('ecoDeclarationDetail.commentLabel') }} <span class="text-red-500">*</span></label>
        <textarea
          v-model="returnComment"
          rows="4"
          :placeholder="$t('ecoDeclarationDetail.returnCommentPlaceholder')"
          class="w-full px-4 py-3 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#F59E0B] text-sm resize-none"
        ></textarea>
        <p v-if="returnComment.trim().length > 0 && returnComment.trim().length < 10" class="text-xs text-orange-500 mt-1">
          {{ $t('ecoDeclarationDetail.minChars', { count: returnComment.trim().length }) }}
        </p>
      </div>
      <template #footer>
        <AppButton variant="secondary" @click="showReturnModal = false; returnComment = ''">
          {{ $t('common.cancel') }}
        </AppButton>
        <AppButton
          variant="warning"
          :disabled="!isReturnValid"
          :label="$t('ecoDeclarationDetail.returnForRevision')"
          @click="handleReturn"
        />
      </template>
    </AppModal>

    <!-- Toast -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        leave-active-class="transition-all duration-300 ease-in"
        enter-from-class="opacity-0 translate-y-[-16px]"
        enter-to-class="opacity-100 translate-y-0"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-[-16px]"
      >
        <div
          v-if="toastVisible"
          :class="[
            'fixed top-6 right-6 z-[200] px-5 py-3 rounded-xl shadow-lg text-white text-sm font-semibold',
            toastType === 'success' ? 'bg-[#22C55E]' : toastType === 'danger' ? 'bg-[#EF4444]' : 'bg-[#F59E0B]'
          ]"
        >
          {{ toastMessage }}
        </div>
      </Transition>
    </Teleport>

    <DocumentPreviewModal :doc="previewDoc" @close="previewDoc = null" />
  </DashboardLayout>
</template>
