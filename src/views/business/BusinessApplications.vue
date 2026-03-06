<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import DataTable from '../../components/dashboard/DataTable.vue'
import { AppButton, AppBadge, AppInput, AppSelect, AppCard } from '../../components/ui'
import { getStatusBadgeVariant } from '../../utils/statusVariant'
import { statusI18nKey } from '../../constants/statuses'
import { useAccountStore } from '../../stores/account'
import { useBusinessMenu } from '../../composables/useRoleMenu'

const { roleTitle, menuItems } = useBusinessMenu()
const accountStore = useAccountStore()
const { t } = useI18n()

onMounted(() => { accountStore.fetchAll() })

const columns = computed(() => [
  { key: 'number', label: t('businessApps.number'), width: '120px' },
  { key: 'type', label: t('businessApps.applicationType') },
  { key: 'submittedAt', label: t('businessApps.submittedAt'), width: '130px' },
  { key: 'status', label: t('common.status'), width: '150px' },
])

const filterType = ref('')
const filterStatus = ref('')

const typeOptions = computed(() => [
  { value: '', label: t('businessApps.allTypes') },
  { value: 'declaration', label: t('businessApps.declaration') },
  { value: 'registration', label: t('businessApps.registration') },
  { value: 'change', label: t('businessApps.dataChange') },
])

const statusOptions = computed(() => [
  { value: '', label: t('businessApps.allStatuses') },
  { value: 'pending', label: t('businessApps.underReview') },
  { value: 'approved', label: t('businessApps.approved') },
  { value: 'rejected', label: t('businessApps.rejected') },
])

const applications = ref([
  { id: 1, number: '2024-0345', type: 'Декларация за Q4 2024', submittedAt: '20.01.2025', status: 'approved' },
  { id: 2, number: '2024-0344', type: 'Изменение реквизитов', submittedAt: '18.01.2025', status: 'under_review' },
  { id: 3, number: '2024-0298', type: 'Декларация за Q3 2024', submittedAt: '15.10.2024', status: 'approved' },
  { id: 4, number: '2024-0201', type: 'Декларация за Q2 2024', submittedAt: '12.07.2024', status: 'approved' },
  { id: 5, number: '2024-0089', type: 'Регистрация плательщика', submittedAt: '05.03.2024', status: 'approved' },
])

</script>

<template>
  <DashboardLayout
    role="business"
    :roleTitle="roleTitle"
    :userName="accountStore.myAccount?.company || ''"
    :menuItems="menuItems"
  >
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <h2 class="bapp-title font-bold">{{ $t('businessApps.title') }}</h2>
      <AppButton variant="primary" :icon="'<svg class=&quot;w-5 h-5&quot; fill=&quot;none&quot; viewBox=&quot;0 0 24 24&quot; stroke=&quot;currentColor&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; stroke-width=&quot;2&quot; d=&quot;M12 4v16m8-8H4&quot; /></svg>'" :label="$t('businessApps.newApplication')" bg="#0e888d" />
    </div>

    <AppCard padding="sm" class="mb-6">
      <div class="flex flex-wrap gap-4">
        <AppInput :placeholder="$t('businessApps.searchByNumber')" :hideLabel="true" borderColor="#e5e7eb" focusColor="#0e888d" class="flex-1 min-w-[200px]" />
        <AppSelect v-model="filterType" :options="typeOptions" size="sm" :hideLabel="true" borderColor="#e5e7eb" focusColor="#0e888d" />
        <AppSelect v-model="filterStatus" :options="statusOptions" size="sm" :hideLabel="true" borderColor="#e5e7eb" focusColor="#0e888d" />
      </div>
    </AppCard>

    <!-- Table -->
    <DataTable :columns="columns" :data="applications" :actions="true">
      <template #cell-number="{ value }">
        <span class="bapp-number font-mono font-medium">{{ value }}</span>
      </template>
      <template #cell-status="{ value }">
        <AppBadge :variant="getStatusBadgeVariant(value)">{{ $t(statusI18nKey[value] || value) }}</AppBadge>
      </template>
      <template #actions="{ row }">
        <div class="flex items-center justify-end gap-2">
          <AppButton variant="icon-only" size="sm">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </AppButton>
          <AppButton variant="icon-only" size="sm">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </AppButton>
        </div>
      </template>
    </DataTable>
  </DashboardLayout>
</template>

<style scoped>
.bapp-title {
  font-size: 24px;
  color: #415861;
}
.bapp-number {
  color: #0e888d;
}
</style>
