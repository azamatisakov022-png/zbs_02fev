<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import QRCode from 'qrcode'
import { calculationStore, type PaymentData } from '../../stores/calculations'
import { PAYMENT_ACCOUNTS } from '../../config/payment-accounts'
import FileUploadZone from '../ui/FileUploadZone.vue'
import { formatNum } from '../../utils/formatNumber'
import { toastStore } from '../../stores/toast'
import { calculatePenalty, getOverdueDays } from '../../utils/penalty'

const props = defineProps<{
  calculationId: number
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  close: []
}>()

const { t } = useI18n()
const router = useRouter()

const calc = computed(() => calculationStore.getCalculationById(props.calculationId))

// File uploads
const feeFile = ref<{ fileName: string; fileType: string; fileDataUrl: string } | null>(null)
const penaltyFile = ref<{ fileName: string; fileType: string; fileDataUrl: string } | null>(null)
const feeSubmitting = ref(false)
const penaltySubmitting = ref(false)

// QR codes
const feeQrUrl = ref('')
const penaltyQrUrl = ref('')

// Dynamic penalty calculation: use fixed values if available, otherwise calculate from dueDate
const penaltyInfo = computed(() => {
  if (!calc.value) return null
  // If penalty was already frozen (after fee confirmation), use fixed values
  if (calc.value.penaltyFixedAmount && calc.value.penaltyFixedAmount > 0) {
    return { amount: calc.value.penaltyFixedAmount, days: calc.value.penaltyFixedDays || 0 }
  }
  // Otherwise calculate dynamically from dueDate
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

const feePurpose = computed(() => {
  if (!calc.value) return ''
  return t('paymentPanel.feePurposeText', { period: calc.value.period, number: calc.value.number })
})

const penaltyPurpose = computed(() => {
  if (!calc.value) return ''
  return t('paymentPanel.penaltyPurposeText', { number: calc.value.number, days: penaltyInfo.value?.days || 0 })
})

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

onMounted(generateQR)
watch(() => props.calculationId, generateQR)

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
  calculationStore.uploadFeeReceipt(calc.value.id, payment)
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
  calculationStore.uploadPenaltyReceipt(calc.value.id, payment)
  penaltySubmitting.value = false
  toastStore.show({ type: 'success', title: t('workflow.receiptUploaded') })
}

function copyRequisites(account: typeof PAYMENT_ACCOUNTS.utilization_fee, purpose: string) {
  const text = `${account.recipient}\n${account.bank}\n${account.account}\nБИК: ${account.bik}\nИНН: ${account.inn}\n${t('paymentPanel.paymentPurpose')}: ${purpose}`
  navigator.clipboard.writeText(text).then(() => {
    toastStore.show({ type: 'success', title: t('paymentPanel.copyRequisites') })
  })
}

function openFullPage() {
  router.push(`/business/calculations/${props.calculationId}/payment`)
}

function close() {
  emit('close')
}
</script>

<template>
  <div v-if="calc" class="pp">
    <!-- Top bar: close + fullpage -->
    <div class="pp__topbar">
      <span class="pp__topbar-title">{{ t('paymentPanel.paymentTitle') }}</span>
      <div class="pp__topbar-actions">
        <button class="pp__fullpage-link" @click="openFullPage">
          {{ t('paymentPanel.openFullPage') }} &rarr;
        </button>
        <button class="pp__close" @click="close" :title="t('paymentPanel.close')">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
    </div>

    <div class="pp__body">
      <!-- ═══ BLOCK 1: UTILIZATION FEE ═══ -->
      <div class="payment-section fee-section">
        <div class="payment-section-header">
          <div class="payment-section-number">1</div>
          <div class="payment-section-info">
            <div class="payment-section-title">{{ t('paymentPanel.tabFee') }}</div>
            <div class="payment-section-subtitle">{{ t('paymentPanel.feeSubtitle') }}</div>
          </div>
          <div class="payment-section-amount fee-amount">{{ formatNum(calc.totalAmount, 0) }} {{ t('common.som') }}</div>
          <div class="payment-section-status">
            <span v-if="feeStatus === 'confirmed'" class="status-badge status-badge--green">&#10003; {{ t('paymentPanel.statusConfirmed') }}</span>
            <span v-else-if="feeStatus === 'uploaded'" class="status-badge status-badge--blue">&#8987; {{ t('paymentPanel.statusUploaded') }}</span>
            <span v-else class="status-badge status-badge--red">&#x1F534; {{ t('paymentPanel.statusNotPaid') }}</span>
          </div>
        </div>

        <div class="payment-section-body">
          <div class="payment-section-left">
            <div class="requisites-card">
              <div class="req-row"><span class="req-key">{{ t('paymentPanel.recipient') }}</span><span class="req-val">{{ PAYMENT_ACCOUNTS.utilization_fee.recipient }}</span></div>
              <div class="req-row"><span class="req-key">{{ t('paymentPanel.bank') }}</span><span class="req-val">{{ PAYMENT_ACCOUNTS.utilization_fee.bank }}</span></div>
              <div class="req-row"><span class="req-key">{{ t('paymentPanel.account') }}</span><span class="req-val font-mono">{{ PAYMENT_ACCOUNTS.utilization_fee.account }}</span></div>
              <div class="req-row"><span class="req-key">{{ t('paymentPanel.bik') }}</span><span class="req-val font-mono">{{ PAYMENT_ACCOUNTS.utilization_fee.bik }}</span></div>
              <div class="req-row"><span class="req-key">{{ t('paymentPanel.inn') }}</span><span class="req-val font-mono">{{ PAYMENT_ACCOUNTS.utilization_fee.inn }}</span></div>
              <div class="req-row"><span class="req-key">{{ t('paymentPanel.paymentPurpose') }}</span><span class="req-val">{{ feePurpose }}</span></div>
            </div>
            <button @click="copyRequisites(PAYMENT_ACCOUNTS.utilization_fee, feePurpose)" class="copy-btn copy-btn--green">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              {{ t('paymentPanel.copyRequisites') }}
            </button>
            <!-- Upload receipt -->
            <div v-if="!feeDisabled" class="upload-receipt">
              <p class="upload-receipt-label">{{ t('paymentPanel.uploadFeeReceipt') }}</p>
              <FileUploadZone v-model="feeFile" :label="t('paymentPanel.uploadReceipt')" />
              <button
                v-if="feeFile"
                @click="submitFeeReceipt"
                :disabled="feeSubmitting"
                class="submit-btn submit-btn--green"
              >
                {{ t('paymentPanel.submitReceipt') }}
              </button>
            </div>
          </div>

          <div class="payment-section-right">
            <div v-if="feeQrUrl" class="qr-block">
              <img :src="feeQrUrl" alt="QR" />
              <p>{{ t('paymentPanel.qrHint') }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══ DIVIDER ═══ -->
      <div v-if="hasPenalty" class="payment-divider">
        <div class="divider-line"></div>
        <span class="divider-text">{{ t('paymentPanel.separateAccounts') }}</span>
        <div class="divider-line"></div>
      </div>

      <!-- ═══ BLOCK 2: PENALTY ═══ -->
      <div v-if="hasPenalty" class="payment-section penalty-section" :class="{ locked: !feePaid }">
        <div class="payment-section-header">
          <div class="payment-section-number penalty">2</div>
          <div class="payment-section-info">
            <div class="payment-section-title">{{ t('paymentPanel.penaltyTitle', { days: penaltyInfo?.days || 0 }) }}</div>
            <div class="payment-section-subtitle">{{ t('paymentPanel.penaltySubtitle') }}</div>
          </div>
          <div class="payment-section-amount penalty-amount">{{ formatNum(penaltyInfo?.amount || 0, 0) }} {{ t('common.som') }}</div>
          <div class="payment-section-status">
            <span v-if="!feePaid" class="status-badge status-badge--lock">&#x1F512; {{ t('paymentPanel.afterFeePayment') }}</span>
            <span v-else-if="penaltyStatus === 'confirmed'" class="status-badge status-badge--green">&#10003; {{ t('paymentPanel.statusConfirmed') }}</span>
            <span v-else-if="penaltyStatus === 'uploaded'" class="status-badge status-badge--blue">&#8987; {{ t('paymentPanel.statusUploaded') }}</span>
            <span v-else class="status-badge status-badge--red">&#x1F534; {{ t('paymentPanel.statusNotPaid') }}</span>
          </div>
        </div>

        <!-- Locked overlay -->
        <div v-if="!feePaid" class="locked-overlay">
          <div class="locked-content">
            <svg class="locked-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            <p class="locked-text">{{ t('paymentPanel.penaltyLockedDesc') }}</p>
          </div>
        </div>

        <!-- Unlocked content -->
        <div v-else class="payment-section-body">
          <div class="payment-section-left">
            <div class="requisites-card">
              <div class="req-row"><span class="req-key">{{ t('paymentPanel.recipient') }}</span><span class="req-val">{{ PAYMENT_ACCOUNTS.penalty.recipient }}</span></div>
              <div class="req-row"><span class="req-key">{{ t('paymentPanel.bank') }}</span><span class="req-val">{{ PAYMENT_ACCOUNTS.penalty.bank }}</span></div>
              <div class="req-row"><span class="req-key">{{ t('paymentPanel.account') }}</span><span class="req-val font-mono">{{ PAYMENT_ACCOUNTS.penalty.account }}</span></div>
              <div class="req-row"><span class="req-key">{{ t('paymentPanel.bik') }}</span><span class="req-val font-mono">{{ PAYMENT_ACCOUNTS.penalty.bik }}</span></div>
              <div class="req-row"><span class="req-key">{{ t('paymentPanel.paymentPurpose') }}</span><span class="req-val">{{ penaltyPurpose }}</span></div>
            </div>
            <button @click="copyRequisites(PAYMENT_ACCOUNTS.penalty, penaltyPurpose)" class="copy-btn copy-btn--red">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              {{ t('paymentPanel.copyRequisites') }}
            </button>
            <!-- Upload receipt -->
            <div v-if="!penaltyDisabled" class="upload-receipt">
              <p class="upload-receipt-label">{{ t('paymentPanel.uploadPenaltyReceipt') }}</p>
              <FileUploadZone v-model="penaltyFile" :label="t('paymentPanel.uploadReceipt')" />
              <button
                v-if="penaltyFile"
                @click="submitPenaltyReceipt"
                :disabled="penaltySubmitting"
                class="submit-btn submit-btn--red"
              >
                {{ t('paymentPanel.submitReceipt') }}
              </button>
            </div>
          </div>

          <div class="payment-section-right">
            <div v-if="penaltyQrUrl" class="qr-block">
              <img :src="penaltyQrUrl" alt="QR" />
              <p>{{ t('paymentPanel.qrHint') }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══ TOTAL ═══ -->
      <div class="payment-total">
        <div class="payment-total-row">
          <span>{{ t('paymentPanel.tabFee') }} &rarr; {{ PAYMENT_ACCOUNTS.utilization_fee.recipient }}</span>
          <span class="amount">{{ formatNum(calc.totalAmount, 0) }} {{ t('common.som') }}</span>
        </div>
        <div v-if="hasPenalty" class="payment-total-row penalty">
          <span>{{ t('paymentPanel.penaltyLabel', { days: penaltyInfo?.days || 0 }) }} &rarr; {{ PAYMENT_ACCOUNTS.penalty.recipient }}</span>
          <span class="amount">{{ formatNum(penaltyInfo?.amount || 0, 0) }} {{ t('common.som') }}</span>
        </div>
        <div class="payment-total-row total">
          <span>{{ t('paymentPanel.grandTotal') }}</span>
          <span class="amount">{{ formatNum(totalPayable, 0) }} {{ t('common.som') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pp {
  background: #f8fafc;
  border-top: 3px solid #059669;
  animation: ppSlideDown 0.3s ease-out;
}
@keyframes ppSlideDown {
  from { max-height: 0; opacity: 0; }
  to { max-height: 1200px; opacity: 1; }
}

.pp__topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  background: #fff;
  border-bottom: 1px solid #e2e8f0;
}
.pp__topbar-title {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
}
.pp__topbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.pp__fullpage-link {
  font-size: 12px;
  color: #64748b;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.15s;
  white-space: nowrap;
}
.pp__fullpage-link:hover {
  color: #2563eb;
  background: #eff6ff;
}
.pp__close {
  padding: 8px;
  color: #94a3b8;
  border-radius: 8px;
  cursor: pointer;
  background: none;
  border: none;
  transition: all 0.15s;
}
.pp__close:hover {
  color: #1e293b;
  background: #f1f5f9;
}

.pp__body {
  padding: 20px;
}

/* ===== Payment Section ===== */
.payment-section {
  border-radius: 12px;
  margin-bottom: 0;
  overflow: hidden;
}
.fee-section {
  border: 2px solid #a7f3d0;
  background: #f0fdf4;
}
.penalty-section {
  border: 2px solid #fecaca;
  background: #fef2f2;
}
.penalty-section.locked {
  border: 2px dashed #e2e8f0;
  background: #f8fafc;
}

.payment-section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(0,0,0,0.05);
}
.payment-section-info {
  flex: 1;
  min-width: 0;
}
.payment-section-number {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #10b981;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 16px;
  flex-shrink: 0;
}
.payment-section-number.penalty {
  background: #ef4444;
}
.payment-section-title {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
}
.payment-section-subtitle {
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
}
.payment-section-amount {
  font-size: 22px;
  font-weight: 900;
  white-space: nowrap;
  flex-shrink: 0;
}
.fee-amount { color: #059669; }
.penalty-amount { color: #dc2626; }

.payment-section-status {
  font-size: 13px;
  white-space: nowrap;
  flex-shrink: 0;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}
.status-badge--green { background: #dcfce7; color: #16a34a; }
.status-badge--blue { background: #dbeafe; color: #2563eb; }
.status-badge--red { background: #fee2e2; color: #dc2626; }
.status-badge--lock { background: #f1f5f9; color: #64748b; }

.payment-section-body {
  display: flex;
  gap: 24px;
  padding: 20px;
}
.payment-section-left { flex: 1; min-width: 0; }
.payment-section-right {
  width: 220px;
  flex-shrink: 0;
}

.requisites-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  font-size: 13px;
  line-height: 1.8;
}
.req-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 2px 0;
}
.req-key {
  color: #64748b;
  flex-shrink: 0;
  font-size: 12px;
}
.req-val {
  color: #1e293b;
  font-weight: 500;
  text-align: right;
  word-break: break-all;
  font-size: 12px;
}

.copy-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  background: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
}
.copy-btn--green {
  color: #059669;
  border: 1px solid #a7f3d0;
}
.copy-btn--green:hover { background: #ecfdf5; }
.copy-btn--red {
  color: #dc2626;
  border: 1px solid #fecaca;
}
.copy-btn--red:hover { background: #fef2f2; }

.upload-receipt {
  margin-top: 16px;
  padding: 16px;
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
}
.upload-receipt-label {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
}

.submit-btn {
  margin-top: 10px;
  padding: 10px 20px;
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s;
}
.submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.submit-btn--green { background: #059669; }
.submit-btn--green:hover:not(:disabled) { background: #047857; }
.submit-btn--red { background: #dc2626; }
.submit-btn--red:hover:not(:disabled) { background: #b91c1c; }

.qr-block {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
}
.qr-block img {
  width: 180px;
  height: 180px;
  margin: 0 auto;
}
.qr-block p {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 8px;
}

/* ===== Divider ===== */
.payment-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 20px 0;
}
.divider-line {
  flex: 1;
  height: 1px;
  background: #e2e8f0;
}
.divider-text {
  font-size: 12px;
  color: #94a3b8;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

/* ===== Locked overlay ===== */
.locked-overlay {
  padding: 32px;
  text-align: center;
}
.locked-content {
  max-width: 400px;
  margin: 0 auto;
}
.locked-icon {
  width: 48px;
  height: 48px;
  color: #94a3b8;
  margin: 0 auto 12px;
}
.locked-text {
  font-size: 14px;
  color: #64748b;
  line-height: 1.6;
}

/* ===== Total ===== */
.payment-total {
  background: #1e293b;
  color: white;
  border-radius: 10px;
  padding: 16px 20px;
  margin-top: 16px;
}
.payment-total-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 14px;
}
.payment-total-row .amount {
  font-weight: 700;
  white-space: nowrap;
}
.payment-total-row.penalty {
  color: #fbbf24;
}
.payment-total-row.total {
  border-top: 1px solid rgba(255,255,255,0.2);
  margin-top: 8px;
  padding-top: 10px;
  font-size: 18px;
  font-weight: 900;
}

/* ===== Responsive ===== */
@media (max-width: 768px) {
  .payment-section-body {
    flex-direction: column;
  }
  .payment-section-right {
    width: 100%;
  }
  .payment-section-header {
    flex-wrap: wrap;
    gap: 8px;
  }
  .payment-section-amount {
    font-size: 18px;
  }
  .payment-section-status {
    width: 100%;
  }
}
</style>
