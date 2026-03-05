<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import DataTable from '@/components/dashboard/DataTable.vue'
import EmptyState from '@/components/dashboard/EmptyState.vue'
import { AppBadge } from '@/components/ui'
import { getStatusBadgeVariant } from '@/utils/statusVariant'
import { statusI18nKey } from '@/constants/statuses'
import { getPercentClass, getRowClass } from '@/helpers/reportHelpers'
import type { Report } from '@/types/report'

const { t } = useI18n()
const router = useRouter()

defineProps<{
  reports: Report[]
  columns: { key: string; label: string; width?: string }[]
}>()

const emit = defineEmits<{
  (e: 'edit-draft', id: number): void
  (e: 'download-pdf', id: number): void
  (e: 'download-excel', id: number): void
  (e: 'view-report', id: number): void
  (e: 'create'): void
}>()

const openMenuId = ref<number | null>(null)
const toggleMenu = (id: number) => {
  openMenuId.value = openMenuId.value === id ? null : id
}
const closeMenu = () => {
  openMenuId.value = null
}
</script>

<template>
  <DataTable :columns="columns" :data="reports" :actions="true" :rowClass="getRowClass">
    <template #empty>
      <EmptyState
        :icon="'<svg class=&quot;w-10 h-10&quot; fill=&quot;none&quot; viewBox=&quot;0 0 40 40&quot; stroke=&quot;currentColor&quot; stroke-width=&quot;1.5&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; d=&quot;M15 28.33h10m-10 6.67h10M28.33 35H11.67a3.33 3.33 0 01-3.34-3.33V8.33A3.33 3.33 0 0111.67 5h9.31a1.67 1.67 0 011.18.49l9.02 9.02a1.67 1.67 0 01.49 1.18v15.98A3.33 3.33 0 0128.33 35z&quot;/></svg>'"
        :title="$t('businessReports.emptyTitle')"
        :description="$t('businessReports.emptyDescription')"
        :actionLabel="$t('businessReports.emptyAction')"
        @action="emit('create')"
      />
    </template>
    <template #cell-number="{ value }">
      <span class="rht-number font-mono font-medium">{{ value }}</span>
    </template>
    <template #cell-year="{ value }">
      <span>{{ value }} {{ $t('businessReports.yearSuffix') }}</span>
    </template>
    <template #cell-processingPercent="{ value }">
      <span :class="['font-semibold', getPercentClass(value)]">{{ value }}%</span>
    </template>
    <template #cell-status="{ value }">
      <AppBadge :variant="getStatusBadgeVariant(value)">{{ $t(statusI18nKey[value] || value) }}</AppBadge>
    </template>
    <template #actions="{ row }">
      <div class="act-wrap">
        <template v-if="row.status === 'draft'">
          <button @click="emit('edit-draft', row.id)" class="act-btn act-btn--outline">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            {{ $t('businessReports.edit') }}
          </button>
        </template>
        <template v-else-if="row.status === 'under_review'">
          <router-link :to="{ path: '/business/reports/' + row.id, query: { from: 'reports' } }" class="act-btn act-btn--outline">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            {{ $t('businessReports.view') }}
          </router-link>
        </template>
        <template v-else-if="row.status === 'approved'">
          <router-link :to="{ path: '/business/reports/' + row.id, query: { from: 'reports' } }" class="act-btn act-btn--outline">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            {{ $t('businessReports.view') }}
          </router-link>
          <div class="act-more-wrap">
            <button class="act-more" @click.stop="toggleMenu(row.id)">&#x22EF;</button>
            <div v-if="openMenuId === row.id" class="act-dropdown" @mouseleave="closeMenu">
              <button class="act-dropdown__item" @click="router.push({ path: '/business/reports/' + row.id, query: { from: 'reports', print: 'true' } }); closeMenu()">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                {{ $t('businessReports.downloadPdf') }}
              </button>
              <button class="act-dropdown__item" @click="emit('download-excel', row.id); closeMenu()">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                {{ $t('businessReports.downloadExcel') }}
              </button>
              <button class="act-dropdown__item" @click="router.push({ path: '/business/reports/' + row.id, query: { from: 'reports', print: 'true' } }); closeMenu()">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                {{ $t('businessReports.print') }}
              </button>
            </div>
          </div>
        </template>
        <template v-else-if="row.status === 'rejected'">
          <button @click="emit('edit-draft', row.id)" class="act-btn act-btn--filled act-btn--orange">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            {{ $t('businessReports.fix') }}
          </button>
          <router-link :to="{ path: '/business/reports/' + row.id, query: { from: 'reports' } }" class="act-btn act-btn--outline">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            {{ $t('businessReports.view') }}
          </router-link>
        </template>
      </div>
    </template>
  </DataTable>

  <template v-for="report in reports" :key="'rej-' + report.id">
    <div v-if="report.status === 'rejected' && report.rejectionReason" class="mt-4 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
      <svg class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <div>
        <p class="font-medium text-red-800">{{ $t('businessReports.reportRejected', { number: report.number }) }}</p>
        <p class="text-sm text-red-700 mt-1">{{ report.rejectionReason }}</p>
      </div>
    </div>
  </template>
</template>

<style scoped>
.act-wrap {
  display: flex;
  gap: 6px;
  justify-content: flex-end;
  align-items: center;
  flex-wrap: wrap;
}
.act-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 14px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  white-space: nowrap;
  text-decoration: none;
  transition: all 0.15s ease;
}
.act-btn--filled {
  color: white;
  border: none;
}
.act-btn--orange { background: #f59e0b; }
.act-btn--orange:hover { background: #d97706; box-shadow: 0 2px 8px rgba(245,158,11,0.25); }
.act-btn--outline {
  background: transparent;
  color: #475569;
  border: 1px solid #e2e8f0;
}
.act-btn--outline:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #1e293b;
}

.act-more-wrap {
  position: relative;
}
.act-more {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 30px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: transparent;
  color: #9ca3af;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  letter-spacing: 2px;
  transition: all 0.15s;
}
.act-more:hover {
  background: #f3f4f6;
  color: #6b7280;
  border-color: #d1d5db;
}
.act-dropdown {
  position: absolute;
  right: 0;
  top: calc(100% + 4px);
  z-index: 10;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1), 0 4px 10px rgba(0,0,0,0.05);
  min-width: 170px;
  padding: 4px;
  overflow: hidden;
}
.act-dropdown__item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  font-size: 15px;
  font-weight: 400;
  color: #374151;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.1s;
  white-space: nowrap;
}
.act-dropdown__item:hover {
  background: #f3f4f6;
}
.rht-number {
  color: #2563eb;
}
</style>
