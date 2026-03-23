<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import { useCalculationStore } from '../../stores/calculations'
import type { Calculation } from '@/types/calculation'
import { productGroups, getSubgroupLabel, getSubgroupData, isPackagingGroup } from '../../data/product-groups'
import TnvedCode from '../../components/TnvedCode.vue'
import { generateCalculationExcel } from '../../utils/excelExport'
import { useAccountStore } from '../../stores/account'
import { useEcoOperatorMenu } from '../../composables/useRoleMenu'
import { CalcStatus, statusI18nKey } from '../../constants/statuses'
import { toastStore } from '../../stores/toast'
import { notificationStore } from '../../stores/notifications'
import CalculationTimeline from '../../components/CalculationTimeline.vue'
import AuditLog from '../../components/AuditLog.vue'
import { formatNum } from '../../utils/formatNumber'
import { calculatePenalty, getOverdueDays, PENALTY_DAILY_RATE } from '../../utils/penalty'
import { PAYMENT_ACCOUNTS } from '../../config/payment-accounts'
import PenaltyInfo from '../../components/PenaltyInfo.vue'
import { AppButton, AppModal, AppAlert, AppCard } from '../../components/ui'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const { roleTitle, menuItems } = useEcoOperatorMenu()
const account = useAccountStore()
const calcStore = useCalculationStore()

const calcId = computed(() => Number(route.params.id))
const calc = computed<Calculation | undefined>(() => calcStore.getCalculationById(calcId.value))

const getStatusClass = (status: string) => {
  switch (status) {
    case 'under_review': return 'bg-yellow-100 text-yellow-800'
    case 'submitted': return 'bg-yellow-100 text-yellow-800'
    case 'in_review': return 'bg-yellow-100 text-yellow-800'
    case 'approved': return 'bg-green-100 text-green-800'
    case 'rejected': return 'bg-red-100 text-red-800'
    case 'revision': return 'bg-amber-100 text-amber-800'
    case 'payment_pending': return 'bg-purple-100 text-purple-800'
    case 'paid': return 'bg-blue-100 text-blue-800'
    case 'fee_paid': return 'bg-blue-100 text-blue-800'
    case 'penalty_paid': return 'bg-green-100 text-green-800'
    case 'completed': return 'bg-green-100 text-green-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

// Timeline dates
const timelineDates = computed(() => {
  if (!calc.value) return {}
  const d: Record<string, string | undefined> = { created: calc.value.date }
  const s = calc.value.status
  if (s !== CalcStatus.DRAFT) d.submitted = calc.value.date
  if ([CalcStatus.UNDER_REVIEW, CalcStatus.APPROVED, CalcStatus.REJECTED, CalcStatus.PAYMENT_PENDING, CalcStatus.PAID, CalcStatus.PAYMENT_REJECTED, CalcStatus.IN_REVIEW, CalcStatus.REVISION, CalcStatus.FEE_PAID, CalcStatus.PENALTY_PAID, CalcStatus.COMPLETED].includes(s as any)) d.reviewed = calc.value.date
  if ([CalcStatus.APPROVED, CalcStatus.PAYMENT_PENDING, CalcStatus.PAID, CalcStatus.PAYMENT_REJECTED, CalcStatus.FEE_PAID, CalcStatus.PENALTY_PAID, CalcStatus.COMPLETED].includes(s as any)) { d.approved = calc.value.approvedAt || calc.value.date; d.invoiced = calc.value.date }
  if (s === CalcStatus.PAID) d.paid = calc.value.paidAt || calc.value.date
  if (s === CalcStatus.REJECTED) d.rejected = calc.value.rejectedAt || calc.value.date
  if (s === CalcStatus.FEE_PAID || s === CalcStatus.COMPLETED) d.feePaid = calc.value.feeConfirmedAt || calc.value.date
  if (s === CalcStatus.COMPLETED) d.completed = calc.value.penaltyConfirmedAt || calc.value.feeConfirmedAt || calc.value.date
  if (s === CalcStatus.REVISION) d.revision = calc.value.date
  return d
})

const payerTypeLabel = computed(() => {
  if (!calc.value) return ''
  return calc.value.payerType === 'importer' ? t('ecoCalcDetail.payerImporter') : t('ecoCalcDetail.payerProducer')
})

const getGroupLabel = (value: string) => productGroups.find(g => g.value === value)?.label || value

// Totals
const totalVolume = computed(() => {
  if (!calc.value) return 0
  return calc.value.items.reduce((s, i) => s + (parseFloat(i.volume) || 0), 0)
})
const totalVolumeToRecycle = computed(() => {
  if (!calc.value) return 0
  return calc.value.items.reduce((s, i) => s + (parseFloat(String(i.volumeToRecycle ?? '0')) || 0), 0)
})
const totalTransferredToRecycling = computed(() => {
  if (!calc.value) return 0
  return calc.value.items.reduce((s, i) => s + (parseFloat(i.transferredToRecycling || '0') || 0), 0)
})
const totalExportedFromKR = computed(() => {
  if (!calc.value) return 0
  return calc.value.items.reduce((s, i) => s + (parseFloat(i.exportedFromKR || '0') || 0), 0)
})
const totalTaxableVolume = computed(() => {
  if (!calc.value) return 0
  return calc.value.items.reduce((s, i) => s + (parseFloat(String(i.taxableVolume ?? '0')) || 0), 0)
})

const reconciliation = computed(() => {
  if (!calc.value) return { charged: 0, paid: 0, difference: 0 }
  return account.getReconciliationForCalculationGlobal(calc.value.id)
})

const penaltyData = computed(() => {
  if (!calc.value || !calc.value.dueDate) return null
  const days = getOverdueDays(calc.value.dueDate)
  if (days <= 0) return null
  return calculatePenalty(calc.value.totalAmount, calc.value.dueDate)
})

// Approve / Reject
const showApproveModal = ref(false)
const showRejectModal = ref(false)
const rejectionReason = ref('')
const showToast = ref(false)
const toastMessage = ref('')

// Assignment
const assignToMe = () => {
  if (!calc.value) return
  calcStore.assignToMe(calc.value.id, 'operator-1', 'Оператор')
  notificationStore.add({
    type: 'info',
    title: t('workflow.assignToMe'),
    message: `${calc.value.number}`,
    role: 'eco-operator'
  })
  toastMessage.value = t('workflow.assignToMe')
  showToast.value = true
  setTimeout(() => { showToast.value = false }, 3000)
}

const unassignCalc = () => {
  if (!calc.value) return
  calcStore.unassign(calc.value.id)
  toastMessage.value = t('workflow.returnToQueue')
  showToast.value = true
  setTimeout(() => { showToast.value = false }, 3000)
}

// Send to revision
const showRevisionModal = ref(false)
const revisionComment = ref('')

const openRevisionModal = () => {
  revisionComment.value = ''
  showRevisionModal.value = true
}

const sendToRevision = () => {
  if (!calc.value || revisionComment.value.trim().length < 10) return
  calcStore.sendToRevision(calc.value.id, revisionComment.value.trim())
  showRevisionModal.value = false
  toastMessage.value = t('workflow.sendToRevision')
  showToast.value = true
  setTimeout(() => { showToast.value = false }, 3000)
}

// Fee/Penalty confirmation
const confirmFee = () => {
  if (!calc.value) return
  calcStore.confirmFeePayment(calc.value.id)
  account.addPayment(calc.value.id, calc.value.number, calc.value.totalAmount)
  toastMessage.value = t('workflow.feeConfirmed')
  showToast.value = true
  setTimeout(() => { showToast.value = false }, 3000)
}

const confirmPenalty = () => {
  if (!calc.value) return
  calcStore.confirmPenaltyPayment(calc.value.id)
  account.addPenaltyPayment(calc.value.id, calc.value.number, calc.value.penaltyFixedAmount || 0)
  toastMessage.value = t('workflow.penaltyConfirmed')
  showToast.value = true
  setTimeout(() => { showToast.value = false }, 3000)
}

const openApproveModal = () => {
  showApproveModal.value = true
}

const approveCalc = () => {
  if (!calc.value) return
  calcStore.approveCalculation(calc.value.id)
  account.addCharge(calc.value.id, calc.value.number, calc.value.totalAmount)
  showApproveModal.value = false
  toastMessage.value = t('ecoCalcDetail.toastAccepted', { number: calc.value.number })
  showToast.value = true
  setTimeout(() => { showToast.value = false }, 3000)
}

const openRejectModal = () => {
  rejectionReason.value = ''
  showRejectModal.value = true
}

const rejectCalc = () => {
  if (!calc.value || rejectionReason.value.trim().length < 10) return
  calcStore.rejectCalculation(calc.value.id, rejectionReason.value.trim())
  showRejectModal.value = false
  toastMessage.value = t('ecoCalcDetail.toastRejected', { number: calc.value.number })
  showToast.value = true
  setTimeout(() => { showToast.value = false }, 3000)
}

const goBack = () => {
  const from = route.query.from as string
  const routes: Record<string, string> = {
    'incoming-calculations': '/eco-operator/calculations',
    accounts: '/eco-operator/payers',
  }
  router.push(routes[from] || '/eco-operator/calculations')
}

const downloadFile = (name: string) => {
  toastStore.show({ type: 'info', title: t('ecoCalcDetail.downloadFileToast'), message: name })
}

const downloadExcel = () => {
  if (!calc.value) return
  generateCalculationExcel(calc.value, {
    name: calc.value.company,
    inn: calc.value.inn,
    address: calc.value.address || '',
  }, reconciliation.value)
}
</script>

<template>
  <DashboardLayout role="eco-operator" :roleTitle="roleTitle" userName="ОсОО «ЭкоПереработка»" :menuItems="menuItems">
    <!-- Not Found -->
    <div v-if="!calc" class="text-center py-16">
      <p class="text-lg text-[#64748b] mb-4">{{ $t('ecoCalcDetail.notFound') }}</p>
      <AppButton variant="back" :label="$t('common.back')" @click="goBack" />
    </div>

    <template v-else>
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div class="flex items-center gap-3 mb-1">
            <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b]">{{ calc.number }}</h1>
            <span :class="['px-3 py-1 rounded-full text-xs font-medium', getStatusClass(calc.status)]">{{ $t(statusI18nKey[calc.status] || calc.status) }}</span>
          </div>
          <p class="text-[#64748b]">{{ $t('ecoCalcDetail.submissionDate') }} {{ calc.date }}</p>
        </div>
        <AppButton variant="back" :label="$t('common.back')" @click="goBack" />
      </div>

      <!-- Rejection reason block -->
      <AppAlert v-if="calc.status === 'rejected' && calc.rejectionReason" variant="error" :title="$t('ecoCalcDetail.rejectionReason')" class="mb-6">
        {{ calc.rejectionReason }}
      </AppAlert>

      <!-- Payer Data -->
      <AppCard class="mb-6">
        <h2 class="text-lg font-semibold text-[#1e293b] mb-4">{{ $t('ecoCalcDetail.payerData') }}</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div>
            <span class="text-[#64748b]">{{ $t('ecoCalcDetail.payerType') }}</span>
            <p class="font-medium text-[#1e293b] mt-0.5">{{ payerTypeLabel }}</p>
          </div>
          <div>
            <span class="text-[#64748b]">{{ $t('ecoCalcDetail.companyName') }}</span>
            <p class="font-medium text-[#1e293b] mt-0.5">{{ calc.company }}</p>
          </div>
          <div>
            <span class="text-[#64748b]">{{ $t('ecoCalcDetail.inn') }}</span>
            <p class="font-medium text-[#1e293b] font-mono mt-0.5">{{ calc.inn }}</p>
          </div>
          <div v-if="calc.address">
            <span class="text-[#64748b]">{{ $t('ecoCalcDetail.address') }}</span>
            <p class="font-medium text-[#1e293b] mt-0.5">{{ calc.address }}</p>
          </div>
          <div>
            <span class="text-[#64748b]">{{ calc.payerType === 'importer' ? $t('ecoCalcDetail.importDate') : $t('ecoCalcDetail.period') }}</span>
            <p class="font-medium text-[#1e293b] mt-0.5">{{ calc.payerType === 'importer' ? calc.importDate : calc.period }}</p>
          </div>
          <div v-if="calc.dueDate">
            <span class="text-[#64748b]">{{ $t('ecoCalcDetail.dueDate') }}</span>
            <p class="font-medium text-[#1e293b] mt-0.5">{{ calc.dueDate }}</p>
          </div>
        </div>
      </AppCard>

      <!-- Timeline -->
      <CalculationTimeline v-if="calc" :status="calc.status" :dates="timelineDates" />

      <!-- Items Table -->
      <div class="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] mb-6 overflow-hidden">
        <div class="px-6 py-4 border-b border-[#e2e8f0]">
          <h2 class="text-lg font-semibold text-[#1e293b]">{{ $t('ecoCalcDetail.goodsAndPackaging') }}</h2>
          <p class="text-sm text-[#64748b]">{{ calc.items.length }} {{ calc.items.length === 1 ? $t('ecoCalcDetail.itemSingular') : $t('ecoCalcDetail.itemPlural') }}</p>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-[#f8fafc]">
              <tr class="text-left text-[#64748b]">
                <th class="px-4 py-3 font-medium w-10">#</th>
                <th class="px-4 py-3 font-medium">{{ $t('ecoCalcDetail.thGroupSubgroup') }}</th>
                <th class="px-4 py-3 font-medium text-right whitespace-nowrap">{{ $t('ecoCalcDetail.thCol5Volume') }}</th>
                <th class="px-4 py-3 font-medium text-right whitespace-nowrap">{{ $t('ecoCalcDetail.thCol6Norm') }}</th>
                <th class="px-4 py-3 font-medium text-right whitespace-nowrap">{{ $t('ecoCalcDetail.thCol7ToRecycle') }}</th>
                <th class="px-4 py-3 font-medium text-right whitespace-nowrap">{{ $t('ecoCalcDetail.thCol8Transferred') }}</th>
                <th class="px-4 py-3 font-medium text-right whitespace-nowrap">{{ $t('ecoCalcDetail.thCol9Exported') }}</th>
                <th class="px-4 py-3 font-medium text-right whitespace-nowrap">{{ $t('ecoCalcDetail.thCol10Taxable') }}</th>
                <th class="px-4 py-3 font-medium text-right whitespace-nowrap">{{ $t('ecoCalcDetail.thCol11Rate') }}</th>
                <th class="px-4 py-3 font-medium text-right whitespace-nowrap">{{ $t('ecoCalcDetail.thCol12Amount') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#e2e8f0]">
              <tr v-for="(item, idx) in calc.items" :key="item.id" class="hover:bg-[#f8fafc]">
                <td class="px-4 py-3 text-[#94a3b8]">{{ idx + 1 }}</td>
                <td class="px-4 py-3 text-[#1e293b]">
                  <div class="font-medium">{{ getGroupLabel(item.group) }}</div>
                  <div class="text-xs text-[#64748b] truncate max-w-[220px]" :title="getSubgroupLabel(item.group, item.subgroup)">{{ getSubgroupLabel(item.group, item.subgroup) }}</div>
                  <div v-if="item.gskpCode" class="text-xs font-mono text-[#94a3b8] mt-0.5">{{ $t('ecoCalcDetail.gskpPrefix') }} {{ item.gskpCode }}</div>
                  <div v-if="item.tnvedCode" class="text-xs font-mono text-[#94a3b8] mt-0.5">{{ $t('ecoCalcDetail.tnvedPrefix') }} <TnvedCode :code="item.tnvedCode" /></div>
                </td>
                <td class="px-4 py-3 text-right font-medium text-[#1e293b]">{{ formatNum(item.volume) }}</td>
                <td class="px-4 py-3 text-right text-[#64748b]">{{ item.recyclingStandard != null ? item.recyclingStandard + '%' : '—' }}</td>
                <td class="px-4 py-3 text-right text-[#64748b]">{{ item.volumeToRecycle != null ? formatNum(item.volumeToRecycle) : '—' }}</td>
                <td class="px-4 py-3 text-right text-[#10b981] font-medium">{{ item.transferredToRecycling ? formatNum(item.transferredToRecycling) : '—' }}</td>
                <td class="px-4 py-3 text-right text-[#2563eb] font-medium">{{ item.exportedFromKR ? formatNum(item.exportedFromKR) : '—' }}</td>
                <td class="px-4 py-3 text-right font-medium text-[#1e293b]">{{ item.taxableVolume != null ? formatNum(item.taxableVolume) : '—' }}</td>
                <td class="px-4 py-3 text-right text-[#64748b]">{{ formatNum(item.rate, 0) }}</td>
                <td class="px-4 py-3 text-right font-bold text-[#f59e0b]">{{ formatNum(item.amount, 0) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Attached Documents -->
      <AppCard v-if="calc.attachedFiles && calc.attachedFiles.length > 0" class="mb-6">
        <h2 class="text-lg font-semibold text-[#1e293b] mb-4">{{ $t('ecoCalcDetail.attachedDocuments') }}</h2>
        <div class="space-y-2">
          <button
            v-for="(file, idx) in calc.attachedFiles"
            :key="idx"
            @click="downloadFile(file)"
            class="w-full flex items-center gap-3 p-3 bg-[#f8fafc] rounded-lg hover:bg-[#f1f5f9] transition-colors text-left"
          >
            <div class="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
              <svg class="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
            </div>
            <span class="text-sm font-medium text-[#2563eb] hover:underline">{{ file }}</span>
          </button>
        </div>
      </AppCard>

      <!-- Totals -->
      <div class="bg-gradient-to-r from-[#0e888d]/10 to-[#0e888d]/5 rounded-2xl p-6 border border-[#0e888d]/20 mb-6">
        <h2 class="text-lg font-semibold text-[#1e293b] mb-4">{{ $t('ecoCalcDetail.calculationTotals') }}</h2>
        <div class="grid grid-cols-2 lg:grid-cols-6 gap-4">
          <div>
            <p class="text-sm text-[#64748b] mb-1">{{ $t('ecoCalcDetail.totalVolumeLabel') }}</p>
            <p class="text-xl font-bold text-[#1e293b]">{{ formatNum(totalVolume) }} {{ $t('ecoCalcDetail.unitTon') }}</p>
          </div>
          <div>
            <p class="text-sm text-[#64748b] mb-1">{{ $t('ecoCalcDetail.totalToRecycleLabel') }}</p>
            <p class="text-xl font-bold text-[#64748b]">{{ formatNum(totalVolumeToRecycle) }} {{ $t('ecoCalcDetail.unitTon') }}</p>
          </div>
          <div>
            <p class="text-sm text-[#64748b] mb-1">{{ $t('ecoCalcDetail.totalTransferredLabel') }}</p>
            <p class="text-xl font-bold text-[#10b981]">{{ formatNum(totalTransferredToRecycling) }} {{ $t('ecoCalcDetail.unitTon') }}</p>
          </div>
          <div>
            <p class="text-sm text-[#64748b] mb-1">{{ $t('ecoCalcDetail.totalExportedLabel') }}</p>
            <p class="text-xl font-bold text-[#2563eb]">{{ formatNum(totalExportedFromKR) }} {{ $t('ecoCalcDetail.unitTon') }}</p>
          </div>
          <div>
            <p class="text-sm text-[#64748b] mb-1">{{ $t('ecoCalcDetail.totalTaxableLabel') }}</p>
            <p class="text-xl font-bold text-[#1e293b]">{{ formatNum(totalTaxableVolume) }} {{ $t('ecoCalcDetail.unitTon') }}</p>
          </div>
          <div>
            <p class="text-sm text-[#64748b] mb-1">{{ $t('ecoCalcDetail.totalPayableLabel') }}</p>
            <p class="text-2xl font-bold text-[#10b981]">{{ formatNum(calc.totalAmount, 0) }} {{ $t('ecoCalcDetail.unitSom') }}</p>
          </div>
        </div>
      </div>

      <!-- Penalty Block -->
      <PenaltyInfo v-if="penaltyData" :debtAmount="calc.totalAmount" :dueDate="calc.dueDate" class="my-4" />

      <!-- Payment Requisites -->
      <div v-if="penaltyData" style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 16px 20px; margin-bottom: 16px">
        <p style="font-size: 14px; font-weight: 600; color: #0c4a6e; margin-bottom: 10px">{{ $t('ecoCalcDetail.paymentRequisitesTitle') }}</p>
        <div style="font-size: 13px; color: #1e293b; display: flex; flex-direction: column; gap: 6px">
          <div>
            <span style="color: #64748b">{{ $t('ecoCalcDetail.feePaymentTo') }}:</span>
            <span style="font-weight: 600"> {{ formatNum(calc.totalAmount, 0) }} {{ $t('ecoCalcDetail.unitSom') }}</span>
            <span style="color: #64748b"> &rarr; {{ PAYMENT_ACCOUNTS.utilization_fee.recipient }}, р/с {{ PAYMENT_ACCOUNTS.utilization_fee.account }}</span>
          </div>
          <div>
            <span style="color: #64748b">{{ $t('ecoCalcDetail.penaltyPaymentTo') }}:</span>
            <span style="font-weight: 600; color: #ef4444"> {{ formatNum(penaltyData.totalPenalty, 0) }} {{ $t('ecoCalcDetail.unitSom') }}</span>
            <span style="color: #64748b"> &rarr; {{ PAYMENT_ACCOUNTS.penalty.recipient }}, р/с {{ PAYMENT_ACCOUNTS.penalty.account }}</span>
          </div>
        </div>
      </div>

      <!-- Графа 13: Сверка платежей -->
      <div class="g13-container mb-6">
        <div class="g13-header">
          <h3 class="g13-title">{{ $t('ecoCalcDetail.g13Title') }}</h3>
          <div class="g13-tooltip-wrap">
            <svg class="w-4 h-4 text-[#94a3b8] cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div class="g13-tooltip">{{ $t('ecoCalcDetail.g13Tooltip') }}</div>
          </div>
        </div>
        <div class="g13-cards">
          <div class="g13-card">
            <span class="g13-card__label">{{ $t('ecoCalcDetail.chargedForPeriod') }}</span>
            <span class="g13-card__value">{{ reconciliation.charged.toLocaleString() }} {{ $t('ecoCalcDetail.unitSom') }}</span>
            <span class="g13-card__sub">{{ $t('ecoCalcDetail.fromPersonalAccount') }}</span>
          </div>
          <div v-if="penaltyData" class="g13-card" style="border-left: 3px solid #d97706; background: #fffbeb">
            <span class="g13-card__label">{{ $t('ecoCalcDetail.penaltyG13Label') }}</span>
            <span class="g13-card__value g13-card__value--red">{{ penaltyData.totalPenalty.toLocaleString() }} {{ $t('ecoCalcDetail.unitSom') }}</span>
            <span class="g13-card__sub">{{ penaltyData.overdueDays }} {{ $t('ecoCalcDetail.penaltyCalendarDays') }}</span>
          </div>
          <div class="g13-card">
            <span class="g13-card__label">{{ $t('ecoCalcDetail.paidForPeriod') }}</span>
            <span class="g13-card__value g13-card__value--green">{{ reconciliation.paid.toLocaleString() }} {{ $t('ecoCalcDetail.unitSom') }}</span>
            <span class="g13-card__sub">{{ $t('ecoCalcDetail.fromPersonalAccount') }}</span>
          </div>
          <div :class="['g13-card g13-card--diff', (reconciliation.charged + (penaltyData ? penaltyData.totalPenalty : 0) - reconciliation.paid) > 0 ? 'g13-card--debt' : (reconciliation.charged + (penaltyData ? penaltyData.totalPenalty : 0) - reconciliation.paid) < 0 ? 'g13-card--overpay' : 'g13-card--zero']">
            <span class="g13-card__label">{{ penaltyData ? $t('ecoCalcDetail.debtWithPenalty') : $t('ecoCalcDetail.differenceLabel') }}</span>
            <span class="g13-card__value" :class="{ 'g13-card__value--red': (reconciliation.charged + (penaltyData ? penaltyData.totalPenalty : 0) - reconciliation.paid) > 0, 'g13-card__value--green': (reconciliation.charged + (penaltyData ? penaltyData.totalPenalty : 0) - reconciliation.paid) < 0, 'g13-card__value--gray': (reconciliation.charged + (penaltyData ? penaltyData.totalPenalty : 0) - reconciliation.paid) === 0 }">
              <template v-if="(reconciliation.charged + (penaltyData ? penaltyData.totalPenalty : 0) - reconciliation.paid) > 0">{{ $t('ecoCalcDetail.arrears') }} +{{ (reconciliation.charged + (penaltyData ? penaltyData.totalPenalty : 0) - reconciliation.paid).toLocaleString() }} {{ $t('ecoCalcDetail.unitSom') }}</template>
              <template v-else-if="(reconciliation.charged + (penaltyData ? penaltyData.totalPenalty : 0) - reconciliation.paid) < 0">{{ $t('ecoCalcDetail.overpayment') }} {{ Math.abs(reconciliation.charged + (penaltyData ? penaltyData.totalPenalty : 0) - reconciliation.paid).toLocaleString() }} {{ $t('ecoCalcDetail.unitSom') }}</template>
              <template v-else>{{ $t('ecoCalcDetail.noDebt') }}</template>
            </span>
          </div>
        </div>
      </div>

      <!-- Audit Log -->
      <AuditLog v-if="calc.history && calc.history.length > 0" :entries="calc.history" viewerRole="operator" :compact="true" class="mb-6" />

      <!-- Fee Payment Confirmation (when receipt uploaded) -->
      <AppCard v-if="calc.feePayment && calc.status !== 'completed' && !calc.feeConfirmedAt" borderColor="#bfdbfe" class="mb-6">
        <h3 class="text-base font-semibold text-[#1e293b] mb-3">{{ $t('workflow.confirmFeePayment') }}</h3>
        <div class="flex items-center gap-3 mb-4 p-3 bg-blue-50 rounded-lg">
          <svg class="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          <span class="text-sm font-medium text-blue-800">{{ calc.feePayment.fileName }}</span>
        </div>
        <div class="flex gap-3">
          <AppButton variant="success" :label="$t('workflow.confirmFeePayment')" @click="confirmFee" />
        </div>
      </AppCard>

      <!-- Penalty Payment Confirmation (when receipt uploaded) -->
      <AppCard v-if="calc.penaltyPayment && calc.status === 'fee_paid' && !calc.penaltyConfirmedAt" borderColor="#fecaca" class="mb-6">
        <h3 class="text-base font-semibold text-[#1e293b] mb-3">{{ $t('workflow.confirmPenaltyPayment') }}</h3>
        <div class="flex items-center gap-3 mb-4 p-3 bg-red-50 rounded-lg">
          <svg class="w-5 h-5 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          <span class="text-sm font-medium text-red-800">{{ calc.penaltyPayment.fileName }}</span>
        </div>
        <div class="flex gap-3">
          <AppButton variant="danger" :label="$t('workflow.confirmPenaltyPayment')" @click="confirmPenalty" />
        </div>
      </AppCard>

      <!-- Sticky Action Bar -->
      <div class="sticky bottom-0 bg-white border-t border-[#e2e8f0] -mx-6 lg:-mx-8 px-6 lg:px-8 py-4 flex items-center justify-between gap-4 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        <AppButton variant="back" :label="$t('common.back')" @click="goBack" />
                <AppButton variant="export" size="sm" :icon="'<svg class=&quot;w-4 h-4&quot; fill=&quot;none&quot; viewBox=&quot;0 0 24 24&quot; stroke=&quot;currentColor&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; stroke-width=&quot;2&quot; d=&quot;M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z&quot; /></svg>'" :label="$t('ecoCalcDetail.downloadExcel')" @click="downloadExcel" />

        <!-- Take assignment (submitted/under_review) -->
        <div v-if="calc.status === 'under_review' && !calc.assignedTo" class="flex items-center gap-3">
          <AppButton variant="primary" bg="#2563eb" :icon="'<svg class=&quot;w-4 h-4&quot; fill=&quot;none&quot; viewBox=&quot;0 0 24 24&quot; stroke=&quot;currentColor&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; stroke-width=&quot;2&quot; d=&quot;M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z&quot; /></svg>'" :label="$t('workflow.assignToMe')" @click="assignToMe" />
        </div>

        <!-- In review actions (assigned to me) -->
        <div v-if="calc.status === 'in_review'" class="flex items-center gap-3">
          <AppButton variant="secondary" :label="$t('workflow.returnToQueue')" @click="unassignCalc" />
          <AppButton variant="warning" :icon="'<svg class=&quot;w-4 h-4&quot; fill=&quot;none&quot; viewBox=&quot;0 0 24 24&quot; stroke=&quot;currentColor&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; stroke-width=&quot;2&quot; d=&quot;M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z&quot;/></svg>'" :label="$t('workflow.sendToRevision')" @click="openRevisionModal" />
          <AppButton variant="danger" :icon="'<svg class=&quot;w-4 h-4&quot; fill=&quot;none&quot; viewBox=&quot;0 0 24 24&quot; stroke=&quot;currentColor&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; stroke-width=&quot;2&quot; d=&quot;M6 18L18 6M6 6l12 12&quot; /></svg>'" :label="$t('ecoCalcDetail.reject')" @click="openRejectModal" />
          <AppButton variant="success" :icon="'<svg class=&quot;w-4 h-4&quot; fill=&quot;none&quot; viewBox=&quot;0 0 24 24&quot; stroke=&quot;currentColor&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; stroke-width=&quot;2&quot; d=&quot;M5 13l4 4L19 7&quot; /></svg>'" :label="$t('ecoCalcDetail.acceptCalc')" @click="openApproveModal" />
        </div>

        <!-- Legacy under_review with assignment -->
        <div v-if="calc.status === 'under_review' && calc.assignedTo" class="flex items-center gap-3">
          <AppButton variant="danger" :icon="'<svg class=&quot;w-4 h-4&quot; fill=&quot;none&quot; viewBox=&quot;0 0 24 24&quot; stroke=&quot;currentColor&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; stroke-width=&quot;2&quot; d=&quot;M6 18L18 6M6 6l12 12&quot; /></svg>'" :label="$t('ecoCalcDetail.reject')" @click="openRejectModal" />
          <AppButton variant="success" :icon="'<svg class=&quot;w-4 h-4&quot; fill=&quot;none&quot; viewBox=&quot;0 0 24 24&quot; stroke=&quot;currentColor&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; stroke-width=&quot;2&quot; d=&quot;M5 13l4 4L19 7&quot; /></svg>'" :label="$t('ecoCalcDetail.acceptCalc')" @click="openApproveModal" />
        </div>
      </div>
    </template>

    <!-- Reject Modal -->
    <AppModal :visible="showRejectModal" :title="$t('ecoCalcDetail.rejectCalcTitle')" size="md" @close="showRejectModal = false">
      <p class="text-sm text-[#64748b] mb-4">{{ $t('ecoCalcDetail.rejectCalcSubtitle', { number: calc?.number }) }}</p>
      <label class="block text-sm font-medium text-[#1e293b] mb-2">{{ $t('ecoCalcDetail.rejectionReasonLabel') }} <span class="text-[#EF4444]">*</span></label>
      <textarea
        v-model="rejectionReason"
        rows="4"
        :placeholder="$t('ecoCalcDetail.rejectionPlaceholder')"
        class="w-full px-4 py-3 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-red-400 text-sm resize-none"
      ></textarea>
      <p class="text-xs text-[#94a3b8] mt-1">{{ $t('ecoCalcDetail.rejectionMinChars', { count: rejectionReason.length }) }}</p>
      <template #footer>
        <AppButton variant="secondary" :label="$t('common.cancel')" @click="showRejectModal = false" />
        <AppButton variant="danger" :label="$t('ecoCalcDetail.reject')" :disabled="rejectionReason.trim().length < 10" @click="rejectCalc" />
      </template>
    </AppModal>

    <!-- Revision Modal -->
    <AppModal :visible="showRevisionModal" :title="$t('workflow.sendRevisionTitle')" size="md" @close="showRevisionModal = false">
      <p class="text-sm text-[#64748b] mb-4">{{ $t('workflow.sendRevisionSubtitle', { number: calc?.number }) }}</p>
      <label class="block text-sm font-medium text-[#1e293b] mb-2">
        {{ $t('workflow.revisionComment') }} <span class="text-[#EF4444]">*</span>
      </label>
      <textarea
        v-model="revisionComment"
        rows="4"
        :placeholder="$t('workflow.revisionCommentPlaceholder')"
        class="w-full px-4 py-3 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-amber-400 text-sm resize-none"
      ></textarea>
      <p class="text-xs text-[#94a3b8] mt-1">{{ revisionComment.length }} / 10+</p>
      <template #footer>
        <AppButton variant="secondary" :label="$t('common.cancel')" @click="showRevisionModal = false" />
        <AppButton variant="warning" :label="$t('workflow.sendToRevision')" :disabled="revisionComment.trim().length < 10" @click="sendToRevision" />
      </template>
    </AppModal>

    <!-- Approve Modal -->
    <AppModal :visible="showApproveModal" :title="$t('ecoCalcDetail.approveModalTitle')" size="md" @close="showApproveModal = false">
      <p class="text-sm text-[#64748b] mb-4">{{ calc?.number }}</p>
      <div class="space-y-3">
        <div class="flex justify-between text-sm">
          <span class="text-[#64748b]">{{ $t('ecoCalcDetail.approveModalFee') }}</span>
          <span class="font-semibold text-[#1e293b]">{{ formatNum(calc?.totalAmount || 0, 0) }} {{ $t('ecoCalcDetail.unitSom') }}</span>
        </div>
        <div v-if="penaltyData" class="flex justify-between text-sm">
          <span class="text-[#ef4444]">{{ $t('ecoCalcDetail.approveModalPenalty', { days: penaltyData.overdueDays }) }}</span>
          <span class="font-semibold text-[#ef4444]">{{ formatNum(penaltyData.totalPenalty, 0) }} {{ $t('ecoCalcDetail.unitSom') }}</span>
        </div>
        <div class="border-t border-[#e2e8f0] pt-3">
          <div class="flex justify-between">
            <span class="font-bold text-[#1e293b]">{{ $t('ecoCalcDetail.approveModalTotal') }}</span>
            <span class="font-bold text-lg text-[#1e293b]">{{ formatNum(penaltyData ? penaltyData.totalToPay : (calc?.totalAmount || 0), 0) }} {{ $t('ecoCalcDetail.unitSom') }}</span>
          </div>
        </div>
        <p class="text-xs text-[#94a3b8] mt-2">{{ $t('ecoCalcDetail.approveModalCharge') }}</p>
      </div>
      <template #footer>
        <AppButton variant="secondary" :label="$t('common.cancel')" @click="showApproveModal = false" />
        <AppButton variant="success" :label="$t('ecoCalcDetail.approveAndCharge')" @click="approveCalc" />
      </template>
    </AppModal>

    <!-- Toast -->
    <Teleport to="body">
      <Transition name="toast">
        <div v-if="showToast" class="fixed top-6 right-6 z-[200] bg-[#10b981] text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
          <span class="font-medium">{{ toastMessage }}</span>
        </div>
      </Transition>
    </Teleport>
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
.toast-enter-active { transition: all 0.3s ease-out; }
.toast-leave-active { transition: all 0.3s ease-in; }
.toast-enter-from { opacity: 0; transform: translateY(-20px); }
.toast-leave-to { opacity: 0; transform: translateY(-20px); }

/* Графа 13 styles */
.g13-container {
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 14px;
  padding: 20px;
}
.g13-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}
.g13-title {
  font-size: 14px;
  font-weight: 600;
  color: #475569;
}
.g13-tooltip-wrap {
  position: relative;
}
.g13-tooltip-wrap:hover .g13-tooltip {
  opacity: 1;
  visibility: visible;
}
.g13-tooltip {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: calc(100% + 8px);
  width: 320px;
  padding: 10px 14px;
  background: #1e293b;
  color: #f1f5f9;
  font-size: 12px;
  line-height: 1.5;
  border-radius: 8px;
  opacity: 0;
  visibility: hidden;
  transition: all 0.15s;
  z-index: 50;
  pointer-events: none;
}
.g13-cards {
  display: flex;
  gap: 16px;
}
@media (max-width: 768px) {
  .g13-cards { flex-direction: column; }
}
.g13-card {
  flex: 1;
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 10px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.g13-card--diff {
  border-left-width: 3px;
}
.g13-card--debt {
  border-left-color: #EF4444;
  background: #FEF2F2;
}
.g13-card--overpay {
  border-left-color: #059669;
  background: #F0FDF4;
}
.g13-card--zero {
  border-left-color: #64748B;
  background: #F8FAFC;
}
.g13-card__label {
  font-size: 12px;
  color: #94A3B8;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}
.g13-card__value {
  font-size: 20px;
  font-weight: 700;
  color: #1E293B;
}
.g13-card__value--green { color: #059669; }
.g13-card__value--red { color: #EF4444; }
.g13-card__value--gray { color: #64748B; }
.g13-card__sub {
  font-size: 11px;
  color: #94A3B8;
}
</style>
