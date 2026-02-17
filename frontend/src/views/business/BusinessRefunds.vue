<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import DataTable from '../../components/dashboard/DataTable.vue'
import EmptyState from '../../components/dashboard/EmptyState.vue'
import SkeletonLoader from '../../components/dashboard/SkeletonLoader.vue'
import { AppButton, AppBadge } from '../../components/ui'
import { getStatusBadgeVariant } from '../../utils/statusVariant'
import { refundStore } from '../../stores/refunds'
import { useBusinessMenu } from '../../composables/useRoleMenu'

const router = useRouter()
const { roleTitle, menuItems } = useBusinessMenu()

// Loading state
const isLoading = ref(true)
onMounted(() => { setTimeout(() => { isLoading.value = false }, 500) })

// Table columns
const columns = [
  { key: 'number', label: 'Номер заявки', width: '12%' },
  { key: 'date', label: 'Дата подачи', width: '12%' },
  { key: 'calculationNumber', label: 'Связанный расчёт', width: '15%' },
  { key: 'totalRefund', label: 'Сумма возврата', width: '15%' },
  { key: 'status', label: 'Статус', width: '12%' },
]

// Filter refunds for the current company
const companyRefunds = computed(() => {
  return refundStore.state.refunds.filter(r => r.company === 'ОсОО «ТехПром»')
})

const hasRefunds = computed(() => companyRefunds.value.length > 0)


const formatAmount = (amount: number) => amount.toLocaleString('ru-RU') + ' сом'

const goToNewRefund = () => {
  router.push('/business/refunds/new')
}
</script>

<template>
  <DashboardLayout role="business" :roleTitle="roleTitle" userName="ОсОО «ТехПром»" :menuItems="menuItems">
    <div class="content__header mb-6">
      <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b] mb-2">Возврат утильсбора</h1>
      <p class="text-[#64748b]">Заявки на возврат утилизационного сбора за вывезенные товары</p>
    </div>

    <!-- Green CTA Banner -->
    <div class="mb-6 bg-gradient-to-r from-[#10b981] to-[#059669] rounded-2xl p-6 lg:p-8 text-white relative overflow-hidden">
      <div class="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
      <div class="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
      <div class="relative flex flex-col lg:flex-row lg:items-center gap-6">
        <div class="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <svg class="w-8 h-8 lg:w-10 lg:h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        </div>
        <div class="flex-1">
          <h2 class="text-xl lg:text-2xl font-bold mb-2">Возврат утилизационного сбора</h2>
          <p class="text-white/80 text-sm lg:text-base">Подайте заявку на возврат утильсбора за товары/упаковку, вывезенные с территории КР</p>
        </div>
        <button
          @click="goToNewRefund"
          class="flex items-center justify-center gap-2 bg-white text-[#059669] px-6 py-3 lg:px-8 lg:py-4 rounded-xl font-semibold hover:bg-green-50 transition-colors shadow-lg flex-shrink-0"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Подать заявку на возврат
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
          <p class="font-medium text-[#1e293b] mb-1">Информация о возврате</p>
          <p class="text-sm text-[#64748b]">Возврат утилизационного сбора осуществляется в случае вывоза товаров и/или упаковки товаров с территории Кыргызской Республики, за которые ранее был уплачен утилизационный сбор. Для возврата необходимо предоставить подтверждающие документы (ГТД на вывоз, инвойс, транспортные документы).</p>
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
        <h2 class="text-lg font-semibold text-[#1e293b] mb-4">История заявок на возврат</h2>
      </div>

      <DataTable :columns="columns" :data="companyRefunds" :actions="true">
        <template #empty>
          <EmptyState
            :icon="'<svg class=&quot;w-10 h-10&quot; fill=&quot;none&quot; viewBox=&quot;0 0 40 40&quot; stroke=&quot;currentColor&quot; stroke-width=&quot;1.5&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; d=&quot;M5 15l10-10m0 0l10 10M15 5v20m-10 5h20a3.33 3.33 0 003.33-3.33V13.33A3.33 3.33 0 0025 10H5a3.33 3.33 0 00-3.33 3.33v13.34A3.33 3.33 0 005 30z&quot;/></svg>'"
            title="Нет заявок на возврат"
            description="У вас пока нет заявок на возврат утилизационного сбора. Подайте заявку, если вы вывезли товары с территории КР."
            actionLabel="Подать заявку"
            @action="goToNewRefund"
          />
        </template>
        <template #cell-number="{ value }">
          <span class="font-mono font-medium text-[#10b981]">{{ value }}</span>
        </template>
        <template #cell-calculationNumber="{ value }">
          <span class="font-mono text-[#64748b]">{{ value }}</span>
        </template>
        <template #cell-totalRefund="{ value }">
          <span class="font-semibold text-[#1e293b]">{{ formatAmount(value) }}</span>
        </template>
        <template #cell-status="{ value }">
          <AppBadge :variant="getStatusBadgeVariant(value)">{{ value }}</AppBadge>
        </template>
        <template #actions="{ row }">
          <div class="flex items-center justify-end gap-2">
            <AppButton variant="ghost" size="sm">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Просмотреть
            </AppButton>
          </div>
        </template>
      </DataTable>
    </template>
  </DashboardLayout>
</template>

<style scoped>
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
