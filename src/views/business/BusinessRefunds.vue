<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import DataTable from '../../components/dashboard/DataTable.vue'
import EmptyState from '../../components/dashboard/EmptyState.vue'
import SkeletonLoader from '../../components/dashboard/SkeletonLoader.vue'
import { AppButton, AppBadge } from '../../components/ui'
import { getStatusBadgeVariant } from '../../utils/statusVariant'
import { statusI18nKey } from '../../constants/statuses'
import { refundStore } from '../../stores/refunds'
import { useAccountStore } from '../../stores/account'
import { useBusinessMenu } from '../../composables/useRoleMenu'

const router = useRouter()
const { t } = useI18n()
const { roleTitle, menuItems } = useBusinessMenu()
const accountStore = useAccountStore()

const isLoading = ref(true)
onMounted(async () => { await accountStore.fetchAll(); isLoading.value = false })

// Table columns
const columns = computed(() => [
  { key: 'number', label: t('businessRefunds.colNumber'), width: '12%' },
  { key: 'date', label: t('businessRefunds.colDate'), width: '12%' },
  { key: 'calculationNumber', label: t('businessRefunds.colCalculation'), width: '15%' },
  { key: 'totalRefund', label: t('businessRefunds.colTotalRefund'), width: '15%' },
  { key: 'status', label: t('businessRefunds.colStatus'), width: '12%' },
])

// Filter refunds for the current company
const companyRefunds = computed(() => {
  return refundStore.state.refunds.filter(r => r.company === (accountStore.myAccount?.company || ''))
})

const hasRefunds = computed(() => companyRefunds.value.length > 0)


const formatAmount = (amount: number) => amount.toLocaleString() + ' ' + t('common.som')

const goToNewRefund = () => {
  router.push('/business/refunds/new')
}
</script>

<template>
  <DashboardLayout role="business" :roleTitle="roleTitle" :userName="accountStore.myAccount?.company || ''" :menuItems="menuItems">
    <div class="content__header mb-6">
      <h1 class="bref-page-title">{{ $t('businessRefunds.pageTitle') }}</h1>
      <p class="bref-page-subtitle">{{ $t('businessRefunds.pageSubtitle') }}</p>
    </div>

    <!-- Green CTA Banner -->
    <div class="bref-cta-banner">
      <div class="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
      <div class="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
      <div class="relative flex flex-col lg:flex-row lg:items-center gap-6">
        <div class="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <svg class="w-8 h-8 lg:w-10 lg:h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        </div>
        <div class="flex-1">
          <h2 class="bref-banner-title font-bold mb-2">{{ $t('businessRefunds.bannerTitle') }}</h2>
          <p class="bref-banner-desc text-white/80">{{ $t('businessRefunds.bannerDescription') }}</p>
        </div>
        <button
          @click="goToNewRefund"
          class="bref-cta-btn"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          {{ $t('businessRefunds.submitRefund') }}
        </button>
      </div>
    </div>

    <!-- Yellow Info Block -->
    <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
      <div class="flex items-start gap-3">
        <div class="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
          <svg class="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p class="bref-info-title font-medium mb-1">{{ $t('businessRefunds.infoTitle') }}</p>
          <p class="bref-text-secondary">{{ $t('businessRefunds.infoText') }}</p>
        </div>
      </div>
    </div>

    <template v-if="isLoading">
      <div class="mb-6"><SkeletonLoader variant="card" /></div>
      <SkeletonLoader variant="table" />
    </template>

    <template v-if="!isLoading">
      <!-- Table Header -->
      <div class="mb-4">
        <h2 class="bref-section-title font-semibold mb-4">{{ $t('businessRefunds.historyTitle') }}</h2>
      </div>

      <DataTable :columns="columns" :data="companyRefunds" :actions="true">
        <template #empty>
          <EmptyState
            :icon="'<svg class=&quot;w-10 h-10&quot; fill=&quot;none&quot; viewBox=&quot;0 0 40 40&quot; stroke=&quot;currentColor&quot; stroke-width=&quot;1.5&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; d=&quot;M5 15l10-10m0 0l10 10M15 5v20m-10 5h20a3.33 3.33 0 003.33-3.33V13.33A3.33 3.33 0 0025 10H5a3.33 3.33 0 00-3.33 3.33v13.34A3.33 3.33 0 005 30z&quot;/></svg>'"
            :title="$t('businessRefunds.emptyTitle')"
            :description="$t('businessRefunds.emptyDescription')"
            :actionLabel="$t('businessRefunds.emptyAction')"
            @action="goToNewRefund"
          />
        </template>
        <template #cell-number="{ value }">
          <span class="bref-cell-number font-mono font-medium">{{ value }}</span>
        </template>
        <template #cell-calculationNumber="{ value }">
          <span class="bref-cell-calc font-mono">{{ value }}</span>
        </template>
        <template #cell-totalRefund="{ value }">
          <span class="bref-cell-amount font-semibold">{{ formatAmount(value) }}</span>
        </template>
        <template #cell-status="{ value }">
          <AppBadge :variant="getStatusBadgeVariant(value)">{{ $t(statusI18nKey[value] || value) }}</AppBadge>
        </template>
        <template #actions="{ row }">
          <div class="flex items-center justify-end gap-2">
            <AppButton variant="ghost" size="sm">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {{ $t('businessRefunds.view') }}
            </AppButton>
          </div>
        </template>
      </DataTable>
    </template>
  </DashboardLayout>
</template>

<style scoped>
.bref-page-title {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
}
@media (min-width: 1024px) {
  .bref-page-title { font-size: 34px; }
}
.bref-page-subtitle {
  font-size: 18px;
  color: #64748b;
}
.bref-cta-banner {
  margin-bottom: 24px;
  background: linear-gradient(to right, #10b981, #059669);
  border-radius: 16px;
  padding: 24px 32px;
  color: white;
  position: relative;
  overflow: hidden;
}
@media (min-width: 1024px) {
  .bref-cta-banner { padding: 32px; }
}
.bref-cta-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: white;
  color: #059669;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  flex-shrink: 0;
  transition: background 0.15s;
}
@media (min-width: 1024px) {
  .bref-cta-btn { padding: 16px 32px; }
}
.bref-cta-btn:hover { background: #ecfdf5; }
.bref-banner-title {
  font-size: 22px;
}
@media (min-width: 1024px) {
  .bref-banner-title { font-size: 24px; }
}
.bref-banner-desc {
  font-size: 16px;
}
.bref-info-title {
  font-size: 18px;
  color: #1e293b;
}
.bref-text-secondary {
  font-size: 16px;
  color: #64748b;
}
.bref-section-title {
  font-size: 22px;
  color: #1e293b;
}
.bref-cell-number {
  font-size: 18px;
  color: #10b981;
}
.bref-cell-calc {
  font-size: 18px;
  color: #64748b;
}
.bref-cell-amount {
  font-size: 18px;
  color: #1e293b;
}

@media print {
  .dashboard-layout > aside,
  .dashboard-layout > main > header,
  .lg\:hidden {
    display: none !important;
  }
  .lg\:ml-72 {
    margin-left: 0 !important;
  }
}
</style>
