<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import DataTable from '../../components/dashboard/DataTable.vue'
import { AppBadge } from '../../components/ui'
import { getStatusBadgeVariant } from '../../utils/statusVariant'
import { statusI18nKey } from '../../constants/statuses'
import { useBusinessMenu } from '../../composables/useRoleMenu'

const { roleTitle, menuItems } = useBusinessMenu()
const { t } = useI18n()

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
    userName="Токтогулов Эрлан"
    :menuItems="menuItems"
  >
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <h2 class="text-2xl font-bold text-[#415861]">{{ $t('businessApps.title') }}</h2>
      <button class="flex items-center gap-2 bg-[#0e888d] text-white px-5 py-3 rounded-xl font-medium hover:bg-[#0a6d71] transition-colors">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        {{ $t('businessApps.newApplication') }}
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-2xl p-4 shadow-sm border border-[#e5e7eb] mb-6">
      <div class="flex flex-wrap gap-4">
        <input
          type="text"
          :placeholder="$t('businessApps.searchByNumber')"
          class="flex-1 min-w-[200px] px-4 py-2 border border-[#e5e7eb] rounded-lg focus:outline-none focus:border-[#0e888d]"
        />
        <select class="px-4 py-2 border border-[#e5e7eb] rounded-lg focus:outline-none focus:border-[#0e888d]">
          <option value="">{{ $t('businessApps.allTypes') }}</option>
          <option value="declaration">{{ $t('businessApps.declaration') }}</option>
          <option value="registration">{{ $t('businessApps.registration') }}</option>
          <option value="change">{{ $t('businessApps.dataChange') }}</option>
        </select>
        <select class="px-4 py-2 border border-[#e5e7eb] rounded-lg focus:outline-none focus:border-[#0e888d]">
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
        <span class="font-mono font-medium text-[#0e888d]">{{ value }}</span>
      </template>
      <template #cell-status="{ value }">
        <AppBadge :variant="getStatusBadgeVariant(value)">{{ value }}</AppBadge>
      </template>
      <template #actions="{ row }">
        <div class="flex items-center justify-end gap-2">
          <button
            class="p-2 text-[#0e888d] hover:bg-[#e8f5f5] rounded-lg transition-colors"
            :title="$t('common.view')"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <button
            class="p-2 text-[#70868f] hover:bg-[#f1f5f9] rounded-lg transition-colors"
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
