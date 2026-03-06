<script setup lang="ts">
import type { CalculatorProductItem, CalculationResult, PayerType } from '@/types/calculator'
import { getGroupLabel } from '@/helpers/calculatorHelpers'
import { useProductGroupStore } from '@/stores/product-groups'
import { tnvedNotes, tnvedNotesSource } from '@/data/tnved-notes'
import { PAYMENT_ACCOUNTS } from '@/config/payment-accounts'
import TnvedCode from '@/components/TnvedCode.vue'
import PenaltyInfo from '@/components/PenaltyInfo.vue'
import { AppButton, AppTooltip } from '@/components/ui'
import { ref } from 'vue'

const groupStore = useProductGroupStore()

defineProps<{
  productItems: CalculatorProductItem[]
  calculationResult: CalculationResult
  totalAmount: number
  formattedTotalAmount: string
  payerType: PayerType
  calculationQuarter: string
  calculationYear: string
  importDate: string
  deadlineStatus: { days: number; overdue: boolean } | null
  isOverdue: boolean
  penaltyData: { overdueDays: number; totalPenalty: number; debtAmount: number; totalToPay: number } | null
  currentDeadline: Date | null
  totalVolume: string
  totalVolumeToRecycle: string
  totalTransferred: string
  totalExported: string
  totalTaxableVolume: string
  feePurpose: string
  penaltyPurpose: string
}>()

const emit = defineEmits<{
  (e: 'copy-requisites', type: 'utilization_fee' | 'penalty'): void
}>()

const tnvedNotesOpen = ref(false)
</script>

<template>
  <div class="p-6 lg:p-8">
    <h2 class="sres-section-title font-semibold text-slate-800 mb-6">{{ $t('businessCalc.resultTitle') }}</h2>

    <div class="bg-slate-50 rounded-xl p-5 border border-slate-200 mb-6">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <p class="sres-text font-semibold text-slate-800 mb-1">{{ $t('businessCalc.calcNumberLabel') }}</p>
          <p class="font-bold text-slate-800 font-mono">{{ calculationResult.number }}</p>
        </div>
        <div>
          <p class="sres-text font-semibold text-slate-800 mb-1">{{ $t('businessCalc.calcDateLabel') }}</p>
          <p class="font-bold text-slate-800">{{ calculationResult.date }}</p>
        </div>
        <div>
          <p class="sres-text font-semibold text-slate-800 mb-1">{{ $t('businessCalc.paymentDueLabel') }}</p>
          <p :class="['font-bold', deadlineStatus && (deadlineStatus.overdue || deadlineStatus.days <= 5) ? 'text-red-600' : 'text-amber-500']">
            {{ calculationResult.dueDate }}
          </p>
          <p v-if="deadlineStatus" :class="['sres-text font-semibold mt-0.5', deadlineStatus.overdue ? 'text-red-600' : 'text-slate-600']">
            <template v-if="deadlineStatus.overdue">{{ $t('businessCalc.overdueDays', { days: deadlineStatus.days }) }}</template>
            <template v-else>{{ $t('businessCalc.remainingDays', { days: deadlineStatus.days }) }}</template>
          </p>
        </div>
      </div>
    </div>

    <div class="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-6 text-white mb-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p class="text-white/80 mb-1">{{ $t('businessCalc.feeAmountLabel') }}</p>
          <p class="text-3xl lg:text-4xl font-bold">{{ formattedTotalAmount }}</p>
          <p v-if="isOverdue && penaltyData && penaltyData.overdueDays > 0" class="text-xs mt-1.5 text-red-200">
            {{ $t('payment.overduePreview', { days: penaltyData.overdueDays, penalty: penaltyData.totalPenalty.toLocaleString() }) }}
          </p>
        </div>
        <div class="flex items-center gap-2">
          <span class="px-4 py-2 bg-white/20 rounded-lg text-sm font-medium">
            {{ payerType === 'producer' ? calculationQuarter + ' ' + calculationYear : $t('businessCalc.importPrefix') + ' ' + (importDate ? new Date(importDate).toLocaleDateString() : '') }}
          </span>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden mb-6">
      <div class="px-5 py-4 border-b border-slate-200">
        <h3 class="font-semibold text-slate-800">{{ $t('businessCalc.detailsTitle') }}</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-slate-50">
            <tr class="text-left text-slate-500">
              <th class="px-4 py-3 font-medium">{{ $t('businessCalc.thGroupSubgroup') }}</th>
              <th class="px-4 py-3 font-medium text-right">{{ $t('businessCalc.thVolumeT') }}</th>
              <th class="px-4 py-3 font-medium text-right">{{ $t('businessCalc.thNormPct') }}</th>
              <th class="px-4 py-3 font-medium text-right">{{ $t('businessCalc.thToRecycleT') }}</th>
              <th class="px-4 py-3 font-medium text-right">{{ $t('businessCalc.thTransferredT') }}</th>
              <th class="px-4 py-3 font-medium text-right">{{ $t('businessCalc.thExportedT') }}</th>
              <th class="px-4 py-3 font-medium text-right">{{ $t('businessCalc.thTaxableT') }}</th>
              <th class="px-4 py-3 font-medium text-right">{{ $t('businessCalc.thRate') }}</th>
              <th class="px-4 py-3 font-medium text-right">{{ $t('businessCalc.thAmount') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <tr v-for="item in productItems.filter(i => i.group && i.volume)" :key="item.id" class="hover:bg-slate-50">
              <td class="px-4 py-3">
                <span class="text-slate-800 block">{{ getGroupLabel(item.group) }}</span>
                <span class="text-xs text-slate-400">{{ groupStore.getSubgroupName(item.group, item.subgroup) }}</span>
                <span v-if="item.tnvedCode" class="block text-xs text-slate-400 font-mono mt-0.5">ТН ВЭД <TnvedCode :code="item.tnvedCode" /></span>
              </td>
              <td class="px-4 py-3 text-right font-medium">{{ item.volume }}</td>
              <td class="px-4 py-3 text-right">{{ item.recyclingStandard }}%</td>
              <td class="px-4 py-3 text-right text-indigo-500">{{ item.volumeToRecycle.toFixed(2) }}</td>
              <td class="px-4 py-3 text-right text-emerald-500">{{ item.transferredToRecycling || '0' }}</td>
              <td class="px-4 py-3 text-right text-blue-600">{{ item.exportedFromKR || '0' }}</td>
              <td class="px-4 py-3 text-right font-medium">{{ item.taxableVolume.toFixed(2) }}</td>
              <td class="px-4 py-3 text-right">{{ item.rate.toLocaleString() }}</td>
              <td class="px-4 py-3 text-right font-bold text-amber-500">{{ item.amount.toLocaleString() }}</td>
            </tr>
          </tbody>
          <tfoot class="bg-slate-50 font-semibold">
            <tr>
              <td class="px-4 py-3">{{ $t('businessCalc.totalRow') }}</td>
              <td class="px-4 py-3 text-right">{{ totalVolume }}</td>
              <td class="px-4 py-3 text-right">—</td>
              <td class="px-4 py-3 text-right text-indigo-500">{{ totalVolumeToRecycle }}</td>
              <td class="px-4 py-3 text-right text-emerald-500">{{ totalTransferred }}</td>
              <td class="px-4 py-3 text-right text-blue-600">{{ totalExported }}</td>
              <td class="px-4 py-3 text-right">{{ totalTaxableVolume }}</td>
              <td class="px-4 py-3 text-right">—</td>
              <td class="px-4 py-3 text-right text-amber-500">{{ totalAmount.toLocaleString() }}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <div class="border border-slate-200 rounded-xl overflow-hidden">
      <button
        @click="tnvedNotesOpen = !tnvedNotesOpen"
        class="w-full flex items-center justify-between px-5 py-3.5 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
      >
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-sm font-medium text-slate-800">{{ $t('businessCalc.tnvedNotesTitle') }}</span>
        </div>
        <svg
          class="w-4 h-4 text-slate-400 transition-transform duration-200"
          :class="{ 'rotate-180': tnvedNotesOpen }"
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <Transition name="slide">
        <div v-if="tnvedNotesOpen" class="px-5 py-4 border-t border-slate-200 bg-white">
          <ul class="space-y-2">
            <li v-for="(text, key) in tnvedNotes" :key="key" class="flex gap-2 text-sm text-slate-600">
              <span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-50 text-blue-500 text-xs font-bold flex-shrink-0 mt-0.5">{{ key }}</span>
              <span>{{ text }}</span>
            </li>
          </ul>
          <p class="mt-3 text-xs text-slate-400 italic">{{ tnvedNotesSource }}</p>
        </div>
      </Transition>
    </div>

    <div class="g13-container mt-4">
      <div class="g13-header">
        <h3 class="g13-title">{{ $t('businessCalc.g13Title') }}</h3>
        <AppTooltip :text="$t('businessCalc.g13Tooltip')">
          <svg class="w-4 h-4 text-slate-400 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </AppTooltip>
      </div>
      <div class="g13-cards">
        <div class="g13-card">
          <span class="g13-card__label">{{ $t('businessCalc.g13Charged') }}</span>
          <span class="g13-card__value">0 {{ $t('businessCalc.som') }}</span>
          <span class="g13-card__sub">{{ $t('businessCalc.g13NotSubmitted') }}</span>
        </div>
        <div class="g13-card">
          <span class="g13-card__label">{{ $t('businessCalc.g13Paid') }}</span>
          <span class="g13-card__value g13-card__value--green">0 {{ $t('businessCalc.som') }}</span>
          <span class="g13-card__sub">{{ $t('businessCalc.g13NotSubmitted') }}</span>
        </div>
        <div class="g13-card g13-card--diff g13-card--zero">
          <span class="g13-card__label">{{ $t('businessCalc.g13Difference') }}</span>
          <span class="g13-card__value g13-card__value--gray">{{ $t('businessCalc.g13NoDebt') }}</span>
        </div>
      </div>
    </div>

    <PenaltyInfo
      v-if="isOverdue && penaltyData && penaltyData.overdueDays > 0"
      :debtAmount="totalAmount"
      :dueDate="currentDeadline"
      class="mt-6"
    />

    <div class="pay-details mt-6">
      <h3 class="pay-details__title">{{ $t('payment.paymentDetailsTitle') }}</h3>
      <div class="pay-details__cards">
        <div class="pay-card pay-card--fee">
          <div class="pay-card__head">
            <span class="pay-card__label">{{ $t('payment.payment1Title') }}</span>
            <span class="pay-card__amount pay-card__amount--green">{{ totalAmount.toLocaleString('ru-RU', { minimumFractionDigits: 2 }) }} {{ $t('penalty.som') }}</span>
          </div>
          <div class="pay-card__rows">
            <div class="pay-card__row"><span class="pay-card__key">{{ $t('payment.recipient') }}</span><span class="pay-card__val">{{ PAYMENT_ACCOUNTS.utilization_fee.recipient }}</span></div>
            <div class="pay-card__row"><span class="pay-card__key">{{ $t('payment.bankLabel') }}</span><span class="pay-card__val">{{ PAYMENT_ACCOUNTS.utilization_fee.bank }}</span></div>
            <div class="pay-card__row"><span class="pay-card__key">{{ $t('payment.accountNumber') }}</span><span class="pay-card__val font-mono">{{ PAYMENT_ACCOUNTS.utilization_fee.account }}</span></div>
            <div class="pay-card__row"><span class="pay-card__key">{{ $t('payment.bikLabel') }}</span><span class="pay-card__val font-mono">{{ PAYMENT_ACCOUNTS.utilization_fee.bik }}</span></div>
            <div class="pay-card__row"><span class="pay-card__key">{{ $t('payment.innLabel') }}</span><span class="pay-card__val font-mono">{{ PAYMENT_ACCOUNTS.utilization_fee.inn }}</span></div>
            <div class="pay-card__row"><span class="pay-card__key">{{ $t('payment.purposeLabel') }}</span><span class="pay-card__val text-xs">{{ feePurpose }}</span></div>
          </div>
          <div class="pay-card__actions">
            <AppButton
              variant="outline"
              size="sm"
              @click="emit('copy-requisites', 'utilization_fee')"
              :icon="'<svg class=&quot;w-4 h-4&quot; fill=&quot;none&quot; viewBox=&quot;0 0 24 24&quot; stroke=&quot;currentColor&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; stroke-width=&quot;2&quot; d=&quot;M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3&quot; /></svg>'"
              :label="$t('payment.copyRequisites')"
            />
            <AppButton
              variant="outline"
              size="sm"
              disabled
              :title="$t('payment.receiptTooltip')"
              :icon="'<svg class=&quot;w-4 h-4&quot; fill=&quot;none&quot; viewBox=&quot;0 0 24 24&quot; stroke=&quot;currentColor&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; stroke-width=&quot;2&quot; d=&quot;M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z&quot; /></svg>'"
              :label="$t('payment.downloadReceipt')"
            />
          </div>
        </div>
        <div v-if="isOverdue && penaltyData && penaltyData.overdueDays > 0" class="pay-card pay-card--penalty">
          <div class="pay-card__head">
            <span class="pay-card__label">{{ $t('payment.payment2Title') }}</span>
            <span class="pay-card__amount pay-card__amount--amber">{{ penaltyData.totalPenalty.toLocaleString('ru-RU', { minimumFractionDigits: 2 }) }} {{ $t('penalty.som') }}</span>
          </div>
          <div class="pay-card__rows">
            <div class="pay-card__row"><span class="pay-card__key">{{ $t('payment.recipient') }}</span><span class="pay-card__val">{{ PAYMENT_ACCOUNTS.penalty.recipient }}</span></div>
            <div class="pay-card__row"><span class="pay-card__key">{{ $t('payment.bankLabel') }}</span><span class="pay-card__val">{{ PAYMENT_ACCOUNTS.penalty.bank }}</span></div>
            <div class="pay-card__row"><span class="pay-card__key">{{ $t('payment.accountNumber') }}</span><span class="pay-card__val font-mono">{{ PAYMENT_ACCOUNTS.penalty.account }}</span></div>
            <div class="pay-card__row"><span class="pay-card__key">{{ $t('payment.bikLabel') }}</span><span class="pay-card__val font-mono">{{ PAYMENT_ACCOUNTS.penalty.bik }}</span></div>
            <div class="pay-card__row"><span class="pay-card__key">{{ $t('payment.purposeLabel') }}</span><span class="pay-card__val text-xs">{{ penaltyPurpose }}</span></div>
          </div>
          <div class="pay-card__actions">
            <AppButton
              variant="outline"
              size="sm"
              @click="emit('copy-requisites', 'penalty')"
              :icon="'<svg class=&quot;w-4 h-4&quot; fill=&quot;none&quot; viewBox=&quot;0 0 24 24&quot; stroke=&quot;currentColor&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; stroke-width=&quot;2&quot; d=&quot;M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3&quot; /></svg>'"
              :label="$t('payment.copyRequisites')"
            />
            <AppButton
              variant="outline"
              size="sm"
              disabled
              :title="$t('payment.receiptTooltip')"
              :icon="'<svg class=&quot;w-4 h-4&quot; fill=&quot;none&quot; viewBox=&quot;0 0 24 24&quot; stroke=&quot;currentColor&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; stroke-width=&quot;2&quot; d=&quot;M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z&quot; /></svg>'"
              :label="$t('payment.downloadReceipt')"
            />
          </div>
        </div>
      </div>
    </div>

    <div v-if="isOverdue && penaltyData && penaltyData.overdueDays > 0" class="summary-block mt-6">
      <h3 class="summary-block__title">{{ $t('payment.summaryTitle') }}</h3>
      <div class="summary-block__row">
        <div>
          <span>{{ $t('businessCalc.feeAmountLabel') }}</span>
          <p class="summary-block__sub">&rarr; {{ PAYMENT_ACCOUNTS.utilization_fee.recipient }}, {{ $t('payment.accountNumber').toLowerCase() }} ...{{ PAYMENT_ACCOUNTS.utilization_fee.account.slice(-4) }}</p>
        </div>
        <span class="font-bold">{{ totalAmount.toLocaleString('ru-RU', { minimumFractionDigits: 2 }) }} {{ $t('penalty.som') }}</span>
      </div>
      <div class="summary-block__row text-amber-400">
        <div>
          <span>{{ $t('payment.penaltyRowLabel', { days: penaltyData.overdueDays }) }}</span>
          <p class="summary-block__sub">&rarr; {{ PAYMENT_ACCOUNTS.penalty.recipient }}, {{ $t('payment.accountNumber').toLowerCase() }} ...{{ PAYMENT_ACCOUNTS.penalty.account.slice(-4) }}</p>
        </div>
        <span class="font-bold">{{ penaltyData.totalPenalty.toLocaleString('ru-RU', { minimumFractionDigits: 2 }) }} {{ $t('penalty.som') }}</span>
      </div>
      <div class="summary-block__sep"></div>
      <div class="summary-block__row summary-block__row--total">
        <span>{{ $t('payment.grandTotal') }}</span>
        <span>{{ penaltyData.totalToPay.toLocaleString('ru-RU', { minimumFractionDigits: 2 }) }} {{ $t('penalty.som') }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.slide-enter-active { transition: max-height 0.25s ease, opacity 0.2s ease; overflow: hidden; }
.slide-leave-active { transition: max-height 0.2s ease, opacity 0.15s ease; overflow: hidden; }
.slide-enter-from, .slide-leave-to { max-height: 0; opacity: 0; }
.slide-enter-to, .slide-leave-from { max-height: 500px; opacity: 1; }

.g13-container { background: var(--color-slate-50); border: 1px solid var(--color-slate-200); border-radius: var(--radius-lg); padding: 20px; }
.g13-header { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
.g13-title { font-size: 22px; font-weight: 600; color: var(--color-slate-800); }
.g13-cards { display: flex; gap: 16px; }
@media (max-width: 768px) { .g13-cards { flex-direction: column; } }
.g13-card {
  flex: 1; background: white; border: 1px solid var(--color-slate-200); border-radius: var(--radius-md);
  padding: 16px; display: flex; flex-direction: column; gap: 4px;
}
.g13-card--diff { border-left-width: 3px; }
.g13-card--zero { border-left-color: var(--color-slate-500); background: var(--color-slate-50); }
.g13-card__label { font-size: 15px; color: var(--color-slate-600); text-transform: uppercase; letter-spacing: 0.02em; font-weight: 600; }
.g13-card__value { font-size: 24px; font-weight: 700; color: var(--color-slate-800); }
.g13-card__value--green { color: #059669; }
.g13-card__value--gray { color: var(--color-slate-500); }
.g13-card__sub { font-size: 15px; color: var(--color-slate-500); font-weight: 500; }

.pay-details { background: var(--color-slate-50); border: 1px solid var(--color-slate-200); border-radius: 16px; padding: 24px; }
.pay-details__title { font-size: 24px; font-weight: 700; color: var(--color-slate-800); margin-bottom: 16px; }
.pay-details__cards { display: grid; grid-template-columns: 1fr; gap: 16px; }
@media (min-width: 768px) { .pay-details__cards { grid-template-columns: 1fr 1fr; } }

.pay-card { border-radius: 12px; padding: 20px; }
.pay-card--fee { background: #ecfdf5; border: 1px solid #a7f3d0; }
.pay-card--penalty { background: #fffbeb; border: 1px solid #fde68a; }
.pay-card__head { margin-bottom: 12px; }
.pay-card__label { display: block; font-size: 18px; font-weight: 600; color: var(--color-slate-600); margin-bottom: 4px; }
.pay-card__amount { display: block; font-size: 26px; font-weight: 900; }
.pay-card__amount--green { color: #059669; }
.pay-card__amount--amber { color: var(--color-calc-accent-dark); }
.pay-card__rows { margin-bottom: 12px; }
.pay-card__row {
  display: flex; justify-content: space-between; gap: 8px;
  padding: 4px 0; font-size: 16px; font-weight: 500; color: var(--color-slate-800);
}
.pay-card__key { color: var(--color-slate-600); flex-shrink: 0; }
.pay-card__val { text-align: right; word-break: break-all; }
.pay-card__actions { display: flex; flex-wrap: wrap; gap: 8px; }

.summary-block { background: var(--color-slate-800); color: #fff; border-radius: 12px; padding: 20px 24px; }
.summary-block__title { font-size: 20px; font-weight: 700; margin-bottom: 12px; }
.summary-block__row {
  display: flex; justify-content: space-between; align-items: flex-start;
  padding: 8px 0; font-size: 16px;
}
.summary-block__row--total { font-size: 18px; color: rgba(255,255,255,0.7); }
.summary-block__row--total span:last-child { font-size: 28px; font-weight: 900; color: #fff; }
.summary-block__sub { font-size: 14px; color: rgba(255,255,255,0.5); margin-top: 2px; }
.summary-block__sep { border-top: 1px solid rgba(255,255,255,0.2); margin: 4px 0; }

.sres-section-title {
  font-size: 27px;
}

.sres-text {
  font-size: 20px;
}
</style>
