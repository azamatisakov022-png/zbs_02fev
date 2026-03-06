<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { calculatePenalty } from '../../utils/penalty'
import { formatNum } from '../../utils/formatNumber'

const props = withDefaults(defineProps<{
  debtAmount: number
  dueDate: string | Date
  payerName?: string
  compact?: boolean
}>(), {
  compact: false,
})

const { t } = useI18n()

const penalty = computed(() => calculatePenalty(props.debtAmount, props.dueDate))
</script>

<template>
  <div class="penalty-calc" :class="{ 'penalty-calc--compact': compact }">
    <div class="penalty-calc__header">
      <span class="penalty-calc__icon">⚠️</span>
      <span class="penalty-calc__title">{{ t('penaltyInfo.title', 'Пеня за просрочку') }}</span>
    </div>

    <div v-if="penalty.overdueDays > 0" class="penalty-calc__body">
      <div v-if="payerName" class="penalty-calc__row">
        <span class="penalty-calc__label">{{ t('penalty.payer', 'Плательщик') }}</span>
        <span class="penalty-calc__value">{{ payerName }}</span>
      </div>
      <div class="penalty-calc__row">
        <span class="penalty-calc__label">{{ t('penaltyInfo.debtAmount', 'Сумма долга') }}</span>
        <span class="penalty-calc__value">{{ formatNum(debtAmount, 2) }} {{ t('penalty.som', 'сом') }}</span>
      </div>
      <div class="penalty-calc__row">
        <span class="penalty-calc__label">{{ t('penaltyInfo.overdueDays', 'Дней просрочки') }}</span>
        <span class="penalty-calc__value">{{ penalty.overdueDays }}</span>
      </div>
      <div class="penalty-calc__row">
        <span class="penalty-calc__label">{{ t('penaltyInfo.dailyPenalty', 'Пеня в день') }}</span>
        <span class="penalty-calc__value">{{ formatNum(penalty.dailyPenalty, 2) }} {{ t('penalty.som', 'сом') }}</span>
      </div>
      <div class="penalty-calc__sep"></div>
      <div class="penalty-calc__row penalty-calc__row--total">
        <span class="penalty-calc__label">{{ t('penaltyInfo.totalPenalty', 'Итого пеня') }}</span>
        <span class="penalty-calc__value penalty-calc__value--accent">{{ formatNum(penalty.totalPenalty, 2) }} {{ t('penalty.som', 'сом') }}</span>
      </div>
      <div v-if="penalty.capReached" class="penalty-calc__cap">
        {{ t('penaltyInfo.limitReached', 'Достигнут максимум пени') }}
      </div>
    </div>

    <div v-else class="penalty-calc__ok">
      ✅ {{ t('penaltyInfo.noPenalty', 'Просрочки нет') }}
    </div>
  </div>
</template>

<style scoped>
.penalty-calc {
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 12px;
  padding: 20px 24px;
}

.penalty-calc--compact {
  padding: 14px 18px;
}

.penalty-calc__header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
}

.penalty-calc__icon {
  font-size: 18px;
}

.penalty-calc__title {
  font-size: 15px;
  font-weight: 600;
  color: #92400e;
}

.penalty-calc__body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.penalty-calc__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}

.penalty-calc__row--total {
  font-weight: 700;
  font-size: 14px;
}

.penalty-calc__label {
  color: #78716c;
}

.penalty-calc__value {
  color: #1c1917;
  font-weight: 500;
}

.penalty-calc__value--accent {
  color: #d97706;
  font-weight: 700;
}

.penalty-calc__sep {
  border-top: 1px solid #fde68a;
  margin: 4px 0;
}

.penalty-calc__cap {
  font-size: 12px;
  color: #dc2626;
  font-weight: 500;
  margin-top: 4px;
}

.penalty-calc__ok {
  font-size: 14px;
  color: #15803d;
}
</style>
