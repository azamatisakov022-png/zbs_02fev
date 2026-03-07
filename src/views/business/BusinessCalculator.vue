<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import SkeletonLoader from '../../components/dashboard/SkeletonLoader.vue'
import { useCalculationStore } from '../../stores/calculations'
import { useProductGroupStore } from '../../stores/product-groups'
import { useAccountStore } from '../../stores/account'
import { CalcStatus } from '../../constants/statuses'
import { formatNum } from '../../utils/formatNumber'
import InstructionDrawer from '../../components/InstructionDrawer.vue'
import { instructionCalculationHtml } from '../../data/instructionCalculation'
import { useBusinessMenu } from '../../composables/useRoleMenu'
import ConfirmDialog from '../../components/common/ConfirmDialog.vue'
import { AppButton, AppPageHeader, AppCtaBanner, AppStatCard } from '../../components/ui'
import CalculationHistory from './components/calculator/CalculationHistory.vue'
import type { ConfirmDialogState } from '@/types/calculator'
import { toastStore } from '../../stores/toast'         

const { roleTitle, menuItems } = useBusinessMenu()
useI18n()
const router = useRouter()
const account = useAccountStore()
const calcStore = useCalculationStore()
const productGroupStore = useProductGroupStore()

const isLoading = ref(true)
onMounted(async () => {
  await Promise.all([
    account.fetchAll(),
    calcStore.fetchMyCalc(),
    productGroupStore.fetchGroups(),
  ])
  isLoading.value = false
})

const viewMode = ref<'list'>('list')

const showDraftNotification = ref(false)

const confirmDialog = ref<ConfirmDialogState>({
  visible: false,
  title: '',
  message: '',
  icon: 'warning',
  confirmText: '',
  confirmColor: 'green',
  onConfirm: () => {},
})
const handleConfirm = () => {
  confirmDialog.value.visible = false
  confirmDialog.value.onConfirm()
}
const handleCancel = () => {
  confirmDialog.value.visible = false
}

const showRates = ref(false)
const showInstruction = ref(false)

const companyName = computed(() => account.myAccount?.company || '')

const startWizard = () => {
  router.push('/business/calculator/calculate')
}

const totalCalcsCount = computed(() => calcStore.myCalculations.length)
const totalPaidAmount = computed(() => {
  return calcStore.myCalculations
    .filter(c => c.status === CalcStatus.PAID || c.status === CalcStatus.COMPLETED)
    .reduce((sum, c) => sum + c.totalAmount, 0)
})
const totalToPayAmount = computed(() => {
  return calcStore.myCalculations
    .filter(c => c.status === CalcStatus.APPROVED || c.status === CalcStatus.FEE_PAID)
    .reduce((sum, c) => sum + c.totalAmount, 0)
})
const lastCalcPeriod = computed(() => {
  if (calcStore.myCalculations.length === 0) return '—'
  return calcStore.myCalculations[0].period || '—'
})
</script>

<template>
  <DashboardLayout
    role="business"
    :roleTitle="roleTitle"
    :userName="companyName"
    :menuItems="menuItems"
  >
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showDraftNotification" class="draft-toast">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          {{ $t('businessCalc.draftSaved') }}
        </div>
      </Transition>
    </Teleport>

    <template v-if="viewMode === 'list'">
      <AppPageHeader :title="$t('businessCalc.pageTitle')" :subtitle="$t('businessCalc.pageSubtitle')" />

      <AppCtaBanner :title="$t('businessCalc.bannerTitle')" :description="$t('businessCalc.bannerDescription')" color="amber" class="mb-6">
        <template #icon>
          <svg class="w-8 h-8 lg:w-10 lg:h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </template>
        <template #action>
          <AppButton variant="secondary" bg="white" color="#d97706" font-size="16px" @click="startWizard" :icon="'<svg class=&quot;w-5 h-5&quot; fill=&quot;none&quot; viewBox=&quot;0 0 24 24&quot; stroke=&quot;currentColor&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; stroke-width=&quot;2&quot; d=&quot;M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z&quot; /></svg>'" :label="$t('businessCalc.startCalc')" />
        </template>
      </AppCtaBanner>

      <div class="info-alert">
        <div class="info-alert__icon">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p class="info-alert__title">{{ $t('businessCalc.infoTitle') }}</p>
          <p class="info-alert__text">{{ $t('businessCalc.infoDescription') }}
            <button @click="showInstruction = true" class="info-alert__link">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {{ $t('businessCalc.instructionLink') }}
            </button>
          </p>
        </div>
      </div>

      <template v-if="isLoading">
        <div class="mb-6"><SkeletonLoader variant="card" /></div>
        <SkeletonLoader variant="table" />
      </template>

      <template v-if="!isLoading">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <AppStatCard :label="$t('businessCalc.totalCalcs')" :value="String(totalCalcsCount)" />
        <AppStatCard :label="$t('businessCalc.paidForYear')" :value="formatNum(totalPaidAmount, 0) + ' ' + $t('businessCalc.som')" color="green" />
        <AppStatCard :label="$t('businessCalc.toPay')" :value="formatNum(totalToPayAmount, 0) + ' ' + $t('businessCalc.som')" color="amber" />
        <AppStatCard :label="$t('businessCalc.lastCalc')" :value="lastCalcPeriod" color="blue" />
      </div>

      <CalculationHistory @new-calc="startWizard" />

      <div class="rates-section">
        <button @click="showRates = !showRates" class="rates-toggle">
          <div class="rates-toggle__left">
            <svg class="rates-toggle__icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="rates-toggle__title">{{ $t('businessCalc.ratesTitle') }}</span>
            <span v-if="!showRates" class="rates-toggle__hint">{{ $t('businessCalc.ratesExpand') }}</span>
          </div>
          <svg :class="['rates-toggle__chevron', showRates && 'rates-toggle__chevron--open']" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          leave-active-class="transition-all duration-200 ease-in"
          enter-from-class="max-h-0 opacity-0"
          enter-to-class="bcalc-max-h-expanded opacity-100"
          leave-from-class="bcalc-max-h-expanded opacity-100"
          leave-to-class="max-h-0 opacity-0"
        >
          <div v-show="showRates" class="rates-collapse">
            <div class="rates-body">
              <div class="rates-grid">
                <div v-for="group in productGroupStore.groups" :key="group.id" class="rate-card">
                  <p class="rate-card__label">{{ group.groupNumber }}. {{ group.name }}</p>
                  <p class="rate-card__value">{{ group.currentRate.toLocaleString() }} {{ $t('businessCalc.som') }}</p>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
      </template>
    </template>

    <InstructionDrawer v-model="showInstruction" :title="$t('businessCalc.instructionDrawerTitle')" :contentHtml="instructionCalculationHtml" />
    <ConfirmDialog
      :visible="confirmDialog.visible"
      :title="confirmDialog.title"
      :message="confirmDialog.message"
      :icon="confirmDialog.icon"
      :confirmText="confirmDialog.confirmText"
      :confirmColor="confirmDialog.confirmColor"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    />
  </DashboardLayout>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* ── Draft toast ── */
.draft-toast {
  position: fixed;
  top: 1.5rem;
  right: 1.5rem;
  z-index: 200;
  background: #16a34a;
  color: #fff;
  padding: 12px 24px;
  border-radius: var(--radius-lg);
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 16px;
  font-weight: 500;
}


/* ── Info alert ── */
.info-alert {
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: var(--radius-lg);
  padding: 16px;
  margin-bottom: 24px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.info-alert__icon {
  flex-shrink: 0;
  color: #f59e0b;
  margin-top: 2px;
}
.info-alert__title {
  font-size: 15px;
  font-weight: 700;
  color: #92400e;
  margin: 0 0 4px;
}
.info-alert__text {
  font-size: 14px;
  font-weight: 500;
  color: #a16207;
  margin: 0;
}
.info-alert__link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #d97706;
  font-weight: 600;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  font-size: inherit;
  text-decoration: underline;
  text-underline-offset: 2px;
}
.info-alert__link:hover {
  color: #92400e;
}

/* ── Rates section ── */
.rates-section {
  margin-top: 24px;
  border-radius: 16px;
  border: 1px solid var(--color-slate-200);
  overflow: hidden;
}
.rates-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: var(--color-slate-50);
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background var(--transition-fast);
}
.rates-toggle:hover {
  background: var(--color-slate-100);
}
.rates-toggle__left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.rates-toggle__icon {
  width: 20px;
  height: 20px;
  color: var(--color-slate-400);
}
.rates-toggle__title {
  font-size: 16px;
  font-weight: 500;
  color: var(--color-slate-500);
}
.rates-toggle__hint {
  font-size: 14px;
  color: var(--color-slate-400);
  margin-left: 8px;
}
@media (max-width: 639px) {
  .rates-toggle__hint { display: none; }
}
.rates-toggle__chevron {
  width: 20px;
  height: 20px;
  color: var(--color-slate-400);
  transition: transform 0.3s ease;
}
.rates-toggle__chevron--open {
  transform: rotate(180deg);
}
.rates-collapse {
  overflow: hidden;
}
.rates-body {
  padding: 12px 20px 20px;
  background: #fff;
  border-top: 1px solid var(--color-slate-200);
}
.rates-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
@media (min-width: 640px) {
  .rates-grid { grid-template-columns: repeat(4, 1fr); }
}
.rate-card {
  background: var(--color-slate-50);
  border-radius: var(--radius-md);
  padding: 12px;
}
.rate-card__label {
  font-size: 15px;
  color: var(--color-slate-500);
  margin: 0 0 4px;
}
.rate-card__value {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-slate-800);
  margin: 0;
}

.bcalc-max-h-expanded {
  max-height: 500px;
}
</style>
