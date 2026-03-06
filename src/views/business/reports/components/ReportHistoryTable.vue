<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import DataTable from '@/components/dashboard/DataTable.vue'
import EmptyState from '@/components/dashboard/EmptyState.vue'
import { AppButton, AppBadge, AppActionMenu } from '@/components/ui'
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



const onRowClick = (row: any) => {
  router.push({ path: '/business/reports/' + row.id, query: { from: 'reports' } })
}
</script>

<template>
  <div class="history-card">
    <div class="history-card__header">
      <div class="history-card__title-wrap">
        <div class="history-card__icon">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <h2 class="history-card__title">{{ $t('businessReports.historyTitle') }}</h2>
          <p class="history-card__subtitle">{{ $t('businessReports.historySubtitle') }}</p>
        </div>
        <span v-if="reports.length > 0" class="history-card__count">{{ reports.length }}</span>
      </div>
      <AppButton
        variant="primary"
        bg="#10b981"
        @click="emit('create')"
        :icon="'<svg width=&quot;16&quot; height=&quot;16&quot; fill=&quot;none&quot; viewBox=&quot;0 0 24 24&quot; stroke=&quot;currentColor&quot; stroke-width=&quot;2&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; d=&quot;M12 4v16m8-8H4&quot; /></svg>'"
        :label="$t('businessReports.newReportBtn')"
      />
    </div>

    <DataTable :columns="columns" :data="reports" :actions="true" :rowClass="getRowClass" @row-click="onRowClick">
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
        <div class="cell-number">
          <span class="cell-number__value">{{ value }}</span>
        </div>
      </template>
      <template #cell-year="{ value }">
        <span class="cell-period">{{ value }} {{ $t('businessReports.yearSuffix') }}</span>
      </template>
      <template #cell-date="{ value }">
        <span class="cell-date">{{ value }}</span>
      </template>
      <template #cell-processingPercent="{ value }">
        <div class="cell-percent">
          <div class="cell-percent__bar">
            <div
              class="cell-percent__fill"
              :style="{ width: Math.min(value, 100) + '%' }"
              :class="[
                value >= 100 ? 'cell-percent__fill--green' :
                value >= 80 ? 'cell-percent__fill--amber' : 'cell-percent__fill--red'
              ]"
            ></div>
          </div>
          <span :class="['cell-percent__value', getPercentClass(value)]">{{ value }}%</span>
        </div>
      </template>
      <template #cell-status="{ value }">
        <div class="status-cell">
          <AppBadge :variant="getStatusBadgeVariant(value)" size="sm" :uppercase="true">
            <svg v-if="value === 'approved'" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
            <svg v-if="value === 'rejected'" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            <svg v-if="value === 'under_review'" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            {{ $t(statusI18nKey[value] || value) }}
          </AppBadge>
        </div>
      </template>
      <template #actions="{ row }">
        <div class="act-wrap" @click.stop>
          <template v-if="row.status === 'draft'">
            <AppButton
              variant="outline"
              size="sm"
              @click="emit('edit-draft', row.id)"
              :icon="'<svg width=&quot;14&quot; height=&quot;14&quot; fill=&quot;none&quot; viewBox=&quot;0 0 24 24&quot; stroke=&quot;currentColor&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; stroke-width=&quot;2&quot; d=&quot;M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z&quot; /></svg>'"
              :label="$t('businessReports.edit')"
            />
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
            <AppActionMenu
              :items="[
                { label: $t('businessReports.downloadPdf'), icon: '<svg width=&quot;14&quot; height=&quot;14&quot; fill=&quot;none&quot; viewBox=&quot;0 0 24 24&quot; stroke=&quot;currentColor&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; stroke-width=&quot;2&quot; d=&quot;M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4&quot; /></svg>' },
                { label: $t('businessReports.downloadExcel'), icon: '<svg width=&quot;14&quot; height=&quot;14&quot; fill=&quot;none&quot; viewBox=&quot;0 0 24 24&quot; stroke=&quot;currentColor&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; stroke-width=&quot;2&quot; d=&quot;M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z&quot; /></svg>' },
                { label: $t('businessReports.print'), icon: '<svg width=&quot;14&quot; height=&quot;14&quot; fill=&quot;none&quot; viewBox=&quot;0 0 24 24&quot; stroke=&quot;currentColor&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; stroke-width=&quot;2&quot; d=&quot;M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z&quot; /></svg>' }
              ]"
              @select="$event === 0 ? router.push({ path: '/business/reports/' + row.id, query: { from: 'reports', print: 'true' } }) : $event === 1 ? emit('download-excel', row.id) : router.push({ path: '/business/reports/' + row.id, query: { from: 'reports', print: 'true' } })"
            />
          </template>
          <template v-else-if="row.status === 'rejected'">
            <AppButton
              variant="warning"
              size="sm"
              @click="emit('edit-draft', row.id)"
              :icon="'<svg width=&quot;14&quot; height=&quot;14&quot; fill=&quot;none&quot; viewBox=&quot;0 0 24 24&quot; stroke=&quot;currentColor&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; stroke-width=&quot;2&quot; d=&quot;M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z&quot; /></svg>'"
              :label="$t('businessReports.fix')"
            />
            <router-link :to="{ path: '/business/reports/' + row.id, query: { from: 'reports' } }" class="act-btn act-btn--outline">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              {{ $t('businessReports.view') }}
            </router-link>
          </template>
        </div>
      </template>
    </DataTable>

    <template v-for="report in reports" :key="'rej-' + report.id">
      <div v-if="report.status === 'rejected' && report.rejectionReason" class="rej-banner">
        <svg class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div>
          <p class="font-medium text-red-800">{{ $t('businessReports.reportRejected', { number: report.number }) }}</p>
          <p class="text-sm text-red-700 mt-1">{{ report.rejectionReason }}</p>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.history-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03);
}

.history-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 28px;
  border-bottom: 1px solid #f1f5f9;
  background: linear-gradient(135deg, #f8fafc 0%, #fff 100%);
}

.history-card__title-wrap {
  display: flex;
  align-items: center;
  gap: 14px;
}

.history-card__icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #d1fae5, #ecfdf5);
  color: #059669;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.history-card__title {
  font-size: 25px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  line-height: 1.3;
}

.history-card__subtitle {
  font-size: 18px;
  color: #595e66;
  margin: 2px 0 0;
}

.history-card__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
  padding: 0 9px;
  border-radius: 14px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(16,185,129,0.3);
}

.history-card :deep(.dash-card) {
  border: none;
  border-radius: 0;
  box-shadow: none;
}

@media (max-width: 640px) {
  .history-card__header {
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
    padding: 18px 20px;
  }

  .history-card__new-btn {
    width: 100%;
    justify-content: center;
  }
}

.cell-number {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.cell-number__value {
  font-family: ui-monospace, SFMono-Regular, 'Cascadia Code', monospace;
  font-weight: 700;
  font-size: 15px;
  color: #0d2f79;
  letter-spacing: -0.01em;
}

.cell-period {
  display: inline-block;
  padding: 5px 14px;
  background: linear-gradient(135deg, #ecfdf5, #d1fae5);
  color: #065f46;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.cell-date {
  font-size: 15px;
  color: #64748b;
  font-weight: 500;
}

.cell-percent {
  display: flex;
  align-items: center;
  gap: 10px;
}
.cell-percent__bar {
  width: 60px;
  height: 6px;
  border-radius: 3px;
  background: #f1f5f9;
  overflow: hidden;
  flex-shrink: 0;
}
.cell-percent__fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}
.cell-percent__fill--green { background: linear-gradient(90deg, #10b981, #059669); }
.cell-percent__fill--amber { background: linear-gradient(90deg, #f59e0b, #d97706); }
.cell-percent__fill--red { background: linear-gradient(90deg, #ef4444, #dc2626); }
.cell-percent__value {
  font-weight: 700;
  font-size: 15px;
  min-width: 42px;
}

.status-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}


.act-wrap {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  align-items: center;
  flex-wrap: wrap;
}
.act-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 20px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 10px;
  cursor: pointer;
  white-space: nowrap;
  text-decoration: none;
  transition: all 0.2s ease;
}
.act-btn--filled {
  color: white;
  border: none;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}
.act-btn--outline {
  background: #fff;
  color: #475569;
  border: 1px solid #e2e8f0;
}
.act-btn--outline:hover {
  background: #f8fafc;
  border-color: #94a3b8;
  color: #1e293b;
}



.rej-banner {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin: 0 20px 16px;
  padding: 14px 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
}

:deep(.table-row) {
  cursor: pointer;
  transition: all 0.15s ease;
}
:deep(.table-row:hover) {
  background: #f8fafc !important;
}

:deep(.row-green td:first-child) {
  box-shadow: inset 4px 0 0 #22c55e;
}
:deep(.row-yellow td:first-child) {
  box-shadow: inset 4px 0 0 #f59e0b;
}
:deep(.row-red td:first-child) {
  box-shadow: inset 4px 0 0 #ef4444;
}
:deep(.row-red) {
  background: #fffbeb !important;
}
:deep(.row-red.table-row:hover) {
  background: #fef9c3 !important;
}
:deep(.row-gray td:first-child) {
  box-shadow: inset 4px 0 0 #d1d5db;
}
</style>
