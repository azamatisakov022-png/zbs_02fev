<script setup lang="ts">
import { AppButton, AppAlert, AppBadge, AppInfoRow } from '../../components/ui'
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import QRCode from 'qrcode'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import { useAccountStore } from '../../stores/account'
import { useCalculationStore } from '../../stores/calculations'
import type { PaymentData } from '@/types/calculation'
import { useBusinessMenu } from '../../composables/useRoleMenu'
import { CalcStatus, statusI18nKey } from '../../constants/statuses'
import { getStatusBadgeVariant } from '../../utils/statusVariant'
import { PAYMENT_ACCOUNTS } from '../../config/payment-accounts'
import FileUploadZone from '../../components/ui/FileUploadZone.vue'
import AuditLog from '../../components/AuditLog.vue'
import { toastStore } from '../../stores/toast'
import { formatNum } from '../../utils/formatNumber'
import { calculatePenalty, getOverdueDays } from '../../utils/penalty'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { roleTitle, menuItems } = useBusinessMenu()
const accountStore = useAccountStore()
const calcStore = useCalculationStore()

const calcId = computed(() => Number(route.params.id))
const calc = computed(() => calcStore.getCalculationById(calcId.value))

// Fee payment form
const feeFile = ref<{ fileName: string; fileType: string; fileDataUrl: string } | null>(null)
const feeSubmitting = ref(false)

// Penalty payment form
const penaltyFile = ref<{ fileName: string; fileType: string; fileDataUrl: string } | null>(null)
const penaltySubmitting = ref(false)

// Dynamic penalty calculation: use fixed values if available, otherwise calculate from dueDate
const penaltyInfo = computed(() => {
  if (!calc.value) return null
  if (calc.value.penaltyFixedAmount && calc.value.penaltyFixedAmount > 0) {
    return { amount: calc.value.penaltyFixedAmount, days: calc.value.penaltyFixedDays || 0 }
  }
  if (calc.value.dueDate) {
    const days = getOverdueDays(calc.value.dueDate)
    if (days > 0) {
      const p = calculatePenalty(calc.value.totalAmount, calc.value.dueDate)
      return { amount: p.totalPenalty, days: p.overdueDays }
    }
  }
  return null
})

const hasPenalty = computed(() => {
  return penaltyInfo.value !== null && penaltyInfo.value.amount > 0
})

const feeStatus = computed(() => {
  if (!calc.value) return 'not_paid'
  if (calc.value.feeConfirmedAt) return 'confirmed'
  if (calc.value.feePayment) return 'uploaded'
  return 'not_paid'
})

const penaltyStatus = computed(() => {
  if (!calc.value) return 'not_paid'
  if (calc.value.penaltyConfirmedAt) return 'confirmed'
  if (calc.value.penaltyPayment) return 'uploaded'
  return 'not_paid'
})

const feeDisabled = computed(() => feeStatus.value !== 'not_paid')
const penaltyDisabled = computed(() => {
  if (!hasPenalty.value) return true
  if (feeStatus.value !== 'confirmed') return true
  return penaltyStatus.value !== 'not_paid'
})

const feePaid = computed(() => feeStatus.value === 'confirmed')

const totalPayable = computed(() => {
  if (!calc.value) return 0
  return calc.value.totalAmount + (penaltyInfo.value?.amount || 0)
})

// Payment purpose
const feePurpose = computed(() => {
  if (!calc.value) return ''
  return t('paymentView.feePurposeText', { period: calc.value.period, number: calc.value.number })
})

const penaltyPurpose = computed(() => {
  if (!calc.value) return ''
  return t('paymentView.penaltyPurposeText', { number: calc.value.number, days: penaltyInfo.value?.days || 0 })
})

// QR codes
const feeQrUrl = ref('')
const penaltyQrUrl = ref('')

async function generateQR() {
  if (!calc.value) return
  const feeAccount = PAYMENT_ACCOUNTS.utilization_fee
  const feeText = `Получатель: ${feeAccount.recipient}\nБанк: ${feeAccount.bank}\nСчёт: ${feeAccount.account}\nБИК: ${feeAccount.bik}\nСумма: ${calc.value.totalAmount}\nНазначение: ${feePurpose.value}`
  try {
    feeQrUrl.value = await QRCode.toDataURL(feeText, { width: 200, margin: 2, color: { dark: '#1e293b', light: '#ffffff' } })
  } catch { /* ignore */ }

  if (hasPenalty.value) {
    const penAccount = PAYMENT_ACCOUNTS.penalty
    const penText = `Получатель: ${penAccount.recipient}\nБанк: ${penAccount.bank}\nСчёт: ${penAccount.account}\nБИК: ${penAccount.bik}\nСумма: ${penaltyInfo.value?.amount || 0}\nНазначение: ${penaltyPurpose.value}`
    try {
      penaltyQrUrl.value = await QRCode.toDataURL(penText, { width: 200, margin: 2, color: { dark: '#1e293b', light: '#ffffff' } })
    } catch { /* ignore */ }
  }
}

onMounted(async () => { await accountStore.fetchAll(); await generateQR() })

function submitFeeReceipt() {
  if (!calc.value || !feeFile.value) return
  feeSubmitting.value = true
  const payment: PaymentData = {
    paymentOrderNumber: '',
    paymentDate: new Date().toISOString().split('T')[0],
    payerBank: '',
    transferAmount: calc.value.totalAmount,
    fileName: feeFile.value.fileName,
    fileType: feeFile.value.fileType,
    fileDataUrl: feeFile.value.fileDataUrl,
  }
  calcStore.uploadFeeReceipt(calc.value.id, payment)
  feeSubmitting.value = false
  toastStore.show({ type: 'success', title: t('workflow.receiptUploaded') })
}

function submitPenaltyReceipt() {
  if (!calc.value || !penaltyFile.value) return
  penaltySubmitting.value = true
  const payment: PaymentData = {
    paymentOrderNumber: '',
    paymentDate: new Date().toISOString().split('T')[0],
    payerBank: '',
    transferAmount: penaltyInfo.value?.amount || 0,
    fileName: penaltyFile.value.fileName,
    fileType: penaltyFile.value.fileType,
    fileDataUrl: penaltyFile.value.fileDataUrl,
  }
  calcStore.uploadPenaltyReceipt(calc.value.id, payment)
  penaltySubmitting.value = false
  toastStore.show({ type: 'success', title: t('workflow.receiptUploaded') })
}

function copyRequisites(account: typeof PAYMENT_ACCOUNTS.utilization_fee, purpose: string) {
  const text = `${account.recipient}\n${account.bank}\n${account.account}\nБИК: ${account.bik}\nИНН: ${account.inn}\n${t('paymentView.paymentPurpose')}: ${purpose}`
  navigator.clipboard.writeText(text).then(() => {
    toastStore.show({ type: 'success', title: t('paymentView.requisitesCopied') })
  })
}

function goBack() {
  router.push(`/business/calculations/${calcId.value}`)
}
</script>

<template>
  <DashboardLayout role="business" :roleTitle="roleTitle" :userName="accountStore.myAccount?.company || ''" :menuItems="menuItems">
    <div v-if="!calc" class="text-center py-20">
      <h2 class="pv-heading pv-heading--lg font-bold mb-2">{{ $t('calcDetail.notFound') }}</h2>
      <AppButton variant="primary" class="mt-4" @click="$router.push('/business/calculator')" :label="$t('common.back')" />
    </div>

    <template v-else>
      <!-- Header -->
      <div class="mb-6">
        <AppButton
          variant="back"
          class="mb-4"
          @click="goBack"
          :label="$t('paymentView.backToCalc')"
        />
        <div class="flex flex-col sm:flex-row sm:items-center gap-3">
          <h1 class="pv-heading pv-heading--lg font-bold">{{ $t('paymentView.title') }} {{ calc.number }}</h1>
          <AppBadge :variant="getStatusBadgeVariant(calc.status)">{{ $t(statusI18nKey[calc.status] || calc.status) }}</AppBadge>
          <span v-if="calc.approvedAt" class="pv-approved-date">{{ $t('paymentView.approvedDate') }}: {{ calc.approvedAt }}</span>
        </div>
      </div>

      <!-- Completed banner -->
      <AppAlert v-if="calc.status === 'completed'" variant="success" class="mb-6">
        {{ $t('paymentView.calcClosed') }}
      </AppAlert>

      <!-- ═══ BLOCK 1: UTILIZATION FEE ═══ -->
      <div class="pv-section pv-section--fee">
        <div class="pv-section-header">
          <div class="pv-section-number">1</div>
          <div class="pv-section-info">
            <div class="pv-section-title">{{ $t('paymentPanel.tabFee') }}</div>
            <div class="pv-section-subtitle">{{ $t('paymentPanel.feeSubtitle') }}</div>
          </div>
          <div class="pv-section-amount pv-amount--green">{{ formatNum(calc.totalAmount, 0) }} {{ $t('common.som') }}</div>
          <div class="pv-section-status">
            <AppBadge v-if="feeStatus === 'confirmed'" variant="success" size="lg">&#10003; {{ $t('paymentPanel.statusConfirmed') }}</AppBadge>
            <AppBadge v-else-if="feeStatus === 'uploaded'" variant="info" size="lg">&#8987; {{ $t('paymentPanel.statusUploaded') }}</AppBadge>
            <AppBadge v-else variant="danger" size="lg">&#x1F534; {{ $t('paymentPanel.statusNotPaid') }}</AppBadge>
          </div>
        </div>

        <div class="pv-section-body">
          <div class="pv-section-left">
            <div class="pv-req-card">
              <h4 class="pv-req-title">{{ $t('paymentView.requisites') }}</h4>
              <div class="pv-req-rows">
                <AppInfoRow :label="$t('paymentPanel.recipient')" :value="PAYMENT_ACCOUNTS.utilization_fee.recipient" />
                <AppInfoRow :label="$t('paymentPanel.bank')" :value="PAYMENT_ACCOUNTS.utilization_fee.bank" />
                <AppInfoRow :label="$t('paymentPanel.account')" :value="PAYMENT_ACCOUNTS.utilization_fee.account" :mono="true" />
                <AppInfoRow :label="$t('paymentPanel.bik')" :value="PAYMENT_ACCOUNTS.utilization_fee.bik" :mono="true" />
                <AppInfoRow :label="$t('paymentPanel.inn')" :value="PAYMENT_ACCOUNTS.utilization_fee.inn" :mono="true" />
                <AppInfoRow :label="$t('paymentPanel.paymentPurpose')" :value="feePurpose" />
              </div>
              <AppButton
                variant="outline"
                size="sm"
                class="mt-3"
                @click="copyRequisites(PAYMENT_ACCOUNTS.utilization_fee, feePurpose)"
                :icon="'<svg class=&quot;w-4 h-4&quot; fill=&quot;none&quot; viewBox=&quot;0 0 24 24&quot; stroke=&quot;currentColor&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; stroke-width=&quot;2&quot; d=&quot;M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z&quot; /></svg>'"
                :label="$t('paymentView.copyRequisites')"
              />
            </div>
            <!-- Upload zone -->
            <div v-if="!feeDisabled" class="pv-upload">
              <p class="pv-upload-label">{{ $t('paymentPanel.uploadFeeReceipt') }}</p>
              <FileUploadZone v-model="feeFile" :label="$t('workflow.uploadReceipt')" />
              <AppButton
                v-if="feeFile"
                variant="success"
                @click="submitFeeReceipt"
                :disabled="feeSubmitting"
                :label="$t('workflow.submitReceipt')"
                class="mt-3"
              />
            </div>
            <div v-else-if="feeStatus === 'confirmed'" class="pv-confirmed flex items-center gap-2 font-medium mt-4">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {{ $t('workflow.feeConfirmed') }}
            </div>
          </div>
          <div class="pv-section-right">
            <div v-if="feeQrUrl" class="pv-qr">
              <p class="pv-qr-title">{{ $t('paymentView.qrTitle') }}</p>
              <img :src="feeQrUrl" alt="QR" />
              <p class="pv-qr-hint">{{ $t('paymentView.qrHint') }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══ DIVIDER ═══ -->
      <div v-if="hasPenalty" class="pv-divider">
        <div class="pv-divider-line"></div>
        <span class="pv-divider-text">{{ $t('paymentPanel.separateAccounts') }}</span>
        <div class="pv-divider-line"></div>
      </div>

      <!-- ═══ BLOCK 2: PENALTY ═══ -->
      <div v-if="hasPenalty" class="pv-section pv-section--penalty" :class="{ 'pv-section--locked': !feePaid }">
        <div class="pv-section-header">
          <div class="pv-section-number pv-section-number--penalty">2</div>
          <div class="pv-section-info">
            <div class="pv-section-title">{{ $t('paymentPanel.penaltyTitle', { days: penaltyInfo?.days || 0 }) }}</div>
            <div class="pv-section-subtitle">{{ $t('paymentPanel.penaltySubtitle') }}</div>
          </div>
          <div class="pv-section-amount pv-amount--red">{{ formatNum(penaltyInfo?.amount || 0, 0) }} {{ $t('common.som') }}</div>
          <div class="pv-section-status">
            <AppBadge v-if="!feePaid" variant="neutral" size="lg">&#x1F512; {{ $t('paymentPanel.afterFeePayment') }}</AppBadge>
            <AppBadge v-else-if="penaltyStatus === 'confirmed'" variant="success" size="lg">&#10003; {{ $t('paymentPanel.statusConfirmed') }}</AppBadge>
            <AppBadge v-else-if="penaltyStatus === 'uploaded'" variant="info" size="lg">&#8987; {{ $t('paymentPanel.statusUploaded') }}</AppBadge>
            <AppBadge v-else variant="danger" size="lg">&#x1F534; {{ $t('paymentPanel.statusNotPaid') }}</AppBadge>
          </div>
        </div>

        <!-- Locked overlay -->
        <div v-if="!feePaid" class="pv-locked">
          <svg class="pv-locked-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          <p class="pv-locked-text">{{ $t('paymentPanel.penaltyLockedDesc') }}</p>
        </div>

        <!-- Unlocked content -->
        <div v-else class="pv-section-body">
          <div class="pv-section-left">
            <div class="pv-req-card">
              <h4 class="pv-req-title">{{ $t('paymentView.requisites') }}</h4>
              <div class="pv-req-rows">
                <AppInfoRow :label="$t('paymentPanel.recipient')" :value="PAYMENT_ACCOUNTS.penalty.recipient" />
                <AppInfoRow :label="$t('paymentPanel.bank')" :value="PAYMENT_ACCOUNTS.penalty.bank" />
                <AppInfoRow :label="$t('paymentPanel.account')" :value="PAYMENT_ACCOUNTS.penalty.account" :mono="true" />
                <AppInfoRow :label="$t('paymentPanel.bik')" :value="PAYMENT_ACCOUNTS.penalty.bik" :mono="true" />
                <AppInfoRow :label="$t('paymentPanel.paymentPurpose')" :value="penaltyPurpose" />
              </div>
              <AppButton
                variant="outline"
                size="sm"
                class="mt-3"
                @click="copyRequisites(PAYMENT_ACCOUNTS.penalty, penaltyPurpose)"
                :icon="'<svg class=&quot;w-4 h-4&quot; fill=&quot;none&quot; viewBox=&quot;0 0 24 24&quot; stroke=&quot;currentColor&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; stroke-width=&quot;2&quot; d=&quot;M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z&quot; /></svg>'"
                :label="$t('paymentView.copyRequisites')"
              />
            </div>
            <!-- Upload -->
            <div v-if="!penaltyDisabled" class="pv-upload">
              <p class="pv-upload-label">{{ $t('paymentPanel.uploadPenaltyReceipt') }}</p>
              <FileUploadZone v-model="penaltyFile" :label="$t('workflow.uploadReceipt')" />
              <AppButton
                v-if="penaltyFile"
                variant="danger"
                @click="submitPenaltyReceipt"
                :disabled="penaltySubmitting"
                :label="$t('workflow.submitReceipt')"
                class="mt-3"
              />
            </div>
            <div v-else-if="penaltyStatus === 'confirmed'" class="pv-confirmed flex items-center gap-2 font-medium mt-4">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {{ $t('workflow.penaltyConfirmed') }}
            </div>
          </div>
          <div class="pv-section-right">
            <div v-if="penaltyQrUrl" class="pv-qr">
              <p class="pv-qr-title">{{ $t('paymentView.qrTitle') }}</p>
              <img :src="penaltyQrUrl" alt="QR" />
              <p class="pv-qr-hint">{{ $t('paymentView.qrHint') }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══ TOTAL ═══ -->
      <div class="pv-total">
        <div class="pv-total-row">
          <span>{{ $t('paymentPanel.tabFee') }} &rarr; {{ PAYMENT_ACCOUNTS.utilization_fee.recipient }}</span>
          <span class="pv-total-amount">{{ formatNum(calc.totalAmount, 0) }} {{ $t('common.som') }}</span>
        </div>
        <div v-if="hasPenalty" class="pv-total-row pv-total-row--penalty">
          <span>{{ $t('paymentPanel.penaltyLabel', { days: penaltyInfo?.days || 0 }) }} &rarr; {{ PAYMENT_ACCOUNTS.penalty.recipient }}</span>
          <span class="pv-total-amount">{{ formatNum(penaltyInfo?.amount || 0, 0) }} {{ $t('common.som') }}</span>
        </div>
        <div class="pv-total-row pv-total-row--grand">
          <span>{{ $t('paymentPanel.grandTotal') }}</span>
          <span class="pv-total-amount">{{ formatNum(totalPayable, 0) }} {{ $t('common.som') }}</span>
        </div>
      </div>

      <!-- Audit Log -->
      <AuditLog v-if="calc.history && calc.history.length > 0" :entries="calc.history" viewerRole="payer" :compact="true" class="mt-6" />
    </template>
  </DashboardLayout>
</template>

<style scoped>
.pv-heading {
  color: #1e293b;
}
.pv-heading--lg {
  font-size: 22px;
}
.pv-approved-date {
  font-size: 14px;
  color: #64748b;
}
.pv-confirmed {
  color: #059669;
  font-size: 14px;
}

/* ===== Payment Sections ===== */
.pv-section {
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 0;
}
.pv-section--fee {
  border: 2px solid #a7f3d0;
  background: #f0fdf4;
}
.pv-section--penalty {
  border: 2px solid #fecaca;
  background: #fef2f2;
}
.pv-section--locked {
  border: 2px dashed #e2e8f0;
  background: #f8fafc;
}

.pv-section-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(0,0,0,0.05);
}
.pv-section-info { flex: 1; min-width: 0; }
.pv-section-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #10b981;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 20px;
  flex-shrink: 0;
}
.pv-section-number--penalty { background: #ef4444; }
.pv-section-title {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
}
.pv-section-subtitle {
  font-size: 17px;
  color: #64748b;
  margin-top: 2px;
}
.pv-section-amount {
  font-size: 30px;
  font-weight: 900;
  white-space: nowrap;
  flex-shrink: 0;
}
.pv-amount--green { color: #059669; }
.pv-amount--red { color: #dc2626; }

.pv-section-status { flex-shrink: 0; }

.pv-section-body {
  display: flex;
  gap: 24px;
  padding: 24px;
}
.pv-section-left { flex: 1; min-width: 0; }
.pv-section-right {
  width: 240px;
  flex-shrink: 0;
}

.pv-req-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
}
.pv-req-title {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 12px;
}
.pv-req-rows {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pv-upload {
  margin-top: 20px;
  padding: 20px;
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
}
.pv-upload-label {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 10px;
}

.pv-qr {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
}
.pv-qr-title {
  font-size: 17px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 10px;
}
.pv-qr img {
  width: 180px;
  height: 180px;
  margin: 0 auto;
}
.pv-qr-hint {
  font-size: 13px;
  color: #94a3b8;
  margin-top: 8px;
}

/* ===== Divider ===== */
.pv-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 24px 0;
}
.pv-divider-line {
  flex: 1;
  height: 1px;
  background: #e2e8f0;
}
.pv-divider-text {
  font-size: 14px;
  color: #94a3b8;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

/* ===== Locked ===== */
.pv-locked {
  padding: 40px;
  text-align: center;
}
.pv-locked-icon {
  width: 56px;
  height: 56px;
  color: #94a3b8;
  margin: 0 auto 16px;
}
.pv-locked-text {
  font-size: 17px;
  color: #64748b;
  line-height: 1.6;
  max-width: 450px;
  margin: 0 auto;
}

/* ===== Total ===== */
.pv-total {
  background: #1e293b;
  color: white;
  border-radius: 12px;
  padding: 20px 24px;
  margin-top: 24px;
}
.pv-total-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 16px;
}
.pv-total-amount {
  font-weight: 700;
  white-space: nowrap;
}
.pv-total-row--penalty {
  color: #fbbf24;
}
.pv-total-row--grand {
  border-top: 1px solid rgba(255,255,255,0.2);
  margin-top: 8px;
  padding-top: 12px;
  font-size: 20px;
  font-weight: 900;
}

/* ===== Responsive ===== */
@media (max-width: 768px) {
  .pv-section-body {
    flex-direction: column;
  }
  .pv-section-right {
    width: 100%;
  }
  .pv-section-header {
    flex-wrap: wrap;
    gap: 10px;
  }
  .pv-section-amount {
    font-size: 22px;
  }
  .pv-section-status {
    width: 100%;
  }
}
</style>
