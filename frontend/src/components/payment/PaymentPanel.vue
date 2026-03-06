<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { PAYMENT_ACCOUNTS } from '../../config/payment-accounts'

defineProps<{
  calculationId: number | string
  modelValue?: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const { t } = useI18n()
</script>

<template>
  <div v-if="modelValue" class="payment-panel">
    <div class="payment-panel__header">
      <h4 class="payment-panel__title">{{ t('payment.title', 'Реквизиты для оплаты') }}</h4>
      <button class="payment-panel__close" @click="emit('close')">✕</button>
    </div>

    <div class="payment-panel__section">
      <h5 class="payment-panel__subtitle">{{ t('payment.utilizationFee', 'Утилизационный сбор') }}</h5>
      <div class="payment-panel__row">
        <span>{{ t('payment.recipient', 'Получатель') }}</span>
        <span>{{ PAYMENT_ACCOUNTS.utilization_fee.recipient }}</span>
      </div>
      <div class="payment-panel__row">
        <span>{{ t('payment.bankLabel', 'Банк') }}</span>
        <span>{{ PAYMENT_ACCOUNTS.utilization_fee.bank }}</span>
      </div>
      <div class="payment-panel__row">
        <span>{{ t('payment.accountNumber', 'Расчётный счёт') }}</span>
        <span class="font-mono">{{ PAYMENT_ACCOUNTS.utilization_fee.account }}</span>
      </div>
      <div class="payment-panel__row">
        <span>{{ t('payment.bikLabel', 'БИК') }}</span>
        <span class="font-mono">{{ PAYMENT_ACCOUNTS.utilization_fee.bik }}</span>
      </div>
      <div v-if="PAYMENT_ACCOUNTS.utilization_fee.inn" class="payment-panel__row">
        <span>{{ t('payment.innLabel', 'ИНН') }}</span>
        <span class="font-mono">{{ PAYMENT_ACCOUNTS.utilization_fee.inn }}</span>
      </div>
    </div>

    <div class="payment-panel__section">
      <h5 class="payment-panel__subtitle">{{ t('payment.penalty', 'Пеня') }}</h5>
      <div class="payment-panel__row">
        <span>{{ t('payment.recipient', 'Получатель') }}</span>
        <span>{{ PAYMENT_ACCOUNTS.penalty.recipient }}</span>
      </div>
      <div class="payment-panel__row">
        <span>{{ t('payment.bankLabel', 'Банк') }}</span>
        <span>{{ PAYMENT_ACCOUNTS.penalty.bank }}</span>
      </div>
      <div class="payment-panel__row">
        <span>{{ t('payment.accountNumber', 'Расчётный счёт') }}</span>
        <span class="font-mono">{{ PAYMENT_ACCOUNTS.penalty.account }}</span>
      </div>
      <div class="payment-panel__row">
        <span>{{ t('payment.bikLabel', 'БИК') }}</span>
        <span class="font-mono">{{ PAYMENT_ACCOUNTS.penalty.bik }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.payment-panel {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px 24px;
}

.payment-panel__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.payment-panel__title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.payment-panel__close {
  background: none;
  border: none;
  font-size: 18px;
  color: #64748b;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
}

.payment-panel__close:hover {
  background: #e2e8f0;
}

.payment-panel__section {
  margin-bottom: 16px;
}

.payment-panel__section:last-child {
  margin-bottom: 0;
}

.payment-panel__subtitle {
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 8px;
}

.payment-panel__row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  padding: 4px 0;
  border-bottom: 1px solid #f1f5f9;
}

.payment-panel__row span:first-child {
  color: #64748b;
}

.payment-panel__row span:last-child {
  color: #1e293b;
  font-weight: 500;
}

.font-mono {
  font-family: monospace;
}
</style>
