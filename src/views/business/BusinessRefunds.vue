<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import DataTable from '../../components/dashboard/DataTable.vue'
import EmptyState from '../../components/dashboard/EmptyState.vue'
import SkeletonLoader from '../../components/dashboard/SkeletonLoader.vue'
import { AppButton, AppBadge, AppPageHeader, AppAlert, AppCtaBanner } from '../../components/ui'
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
    <AppPageHeader :title="$t('businessRefunds.pageTitle')" :subtitle="$t('businessRefunds.pageSubtitle')" />

    <AppCtaBanner :title="$t('businessRefunds.bannerTitle')" :description="$t('businessRefunds.bannerDescription')" color="green" class="mb-6">
      <template #icon>
        <svg class="w-8 h-8 lg:w-10 lg:h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
        </svg>
      </template>
      <template #action>
        <AppButton variant="secondary" bg="white" color="#059669" font-size="16px" :icon="'<svg class=&quot;w-5 h-5&quot; fill=&quot;none&quot; viewBox=&quot;0 0 24 24&quot; stroke=&quot;currentColor&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; stroke-width=&quot;2&quot; d=&quot;M12 4v16m8-8H4&quot; /></svg>'" :label="$t('businessRefunds.submitRefund')" @click="goToNewRefund" />
      </template>
    </AppCtaBanner>

    <AppAlert variant="warning" :title="$t('businessRefunds.infoTitle')" class="mb-6">
      {{ $t('businessRefunds.infoText') }}
    </AppAlert>

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
