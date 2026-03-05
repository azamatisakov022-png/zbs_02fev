<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import DataTable from '../../components/dashboard/DataTable.vue'
import { AppBadge } from '../../components/ui'
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
      <button class="bapp-new-btn flex items-center gap-2 text-white px-5 py-3 rounded-xl font-medium transition-colors">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        {{ $t('businessApps.newApplication') }}
      </button>
    </div>

    <!-- Filters -->
    <div class="bapp-filter-card">
      <div class="flex flex-wrap gap-4">
        <input
          type="text"
          :placeholder="$t('businessApps.searchByNumber')"
          class="bapp-input flex-1 px-4 py-2 rounded-lg focus:outline-none"
        />
        <select class="bapp-select px-4 py-2 rounded-lg focus:outline-none">
          <option value="">{{ $t('businessApps.allTypes') }}</option>
          <option value="declaration">{{ $t('businessApps.declaration') }}</option>
          <option value="registration">{{ $t('businessApps.registration') }}</option>
          <option value="change">{{ $t('businessApps.dataChange') }}</option>
        </select>
        <select class="bapp-select px-4 py-2 rounded-lg focus:outline-none">
          <option value="">{{ $t('businessApps.allStatuses') }}</option>
          <option value="pending">{{ $t('businessApps.underReview') }}</option>
          <option value="approved">{{ $t('businessApps.approved') }}</option>
          <option value="rejected">{{ $t('businessApps.rejected') }}</option>
        </select>
      </div>
    </div>

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
          <button
            class="bapp-action-view p-2 rounded-lg transition-colors"
            :title="$t('common.view')"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <button
            class="bapp-action-download p-2 rounded-lg transition-colors"
            :title="$t('common.download')"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
        </div>
      </template>
    </DataTable>
  </DashboardLayout>
</template>

<style scoped>
.bapp-filter-card {
  background: white;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  border: 1px solid #e5e7eb;
  margin-bottom: 24px;
}
.bapp-title {
  font-size: 24px;
  color: #415861;
}
.bapp-new-btn {
  background: #0e888d;
}
.bapp-new-btn:hover {
  background: #0a6d71;
}
.bapp-input {
  min-width: 200px;
  border: 1px solid #e5e7eb;
}
.bapp-input:focus {
  border-color: #0e888d;
}
.bapp-select {
  border: 1px solid #e5e7eb;
}
.bapp-select:focus {
  border-color: #0e888d;
}
.bapp-number {
  color: #0e888d;
}
.bapp-action-view {
  color: #0e888d;
}
.bapp-action-view:hover {
  background: #e8f5f5;
}
.bapp-action-download {
  color: #70868f;
}
.bapp-action-download:hover {
  background: #f1f5f9;
}
</style>
