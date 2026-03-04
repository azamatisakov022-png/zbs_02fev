<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import SkeletonLoader from '../../components/dashboard/SkeletonLoader.vue'
import { normativeTiers } from '../../data/recycling-norms'
import { reportStore } from '../../stores/reports'
import { generateRecyclingReportExcel } from '../../utils/excelExport'
import { useBusinessMenu } from '../../composables/useRoleMenu'
import { toastStore } from '../../stores/toast'
import { useAccountStore } from '../../stores/account'
import ReportCtaBanner from './reports/components/ReportCtaBanner.vue'
import ReportStatsGrid from './reports/components/ReportStatsGrid.vue'
import ReportHistoryTable from './reports/components/ReportHistoryTable.vue'

const { t } = useI18n()
const router = useRouter()
const { roleTitle, menuItems } = useBusinessMenu()
const accountStore = useAccountStore()

const isLoading = ref(true)
onMounted(async () => {
  await Promise.all([reportStore.fetchAll(), accountStore.fetchAll()])
  isLoading.value = false
})

const companyData = computed(() => ({
  name: accountStore.myAccount?.company || '',
  inn: accountStore.myAccount?.inn || '',
}))

const yearNormativeHigh = computed(() => {
  return Math.round((normativeTiers.high[2026] || 0) * 100)
})
const yearNormativeStandard = computed(() => {
  return Math.round((normativeTiers.standard[2026] || 0) * 100)
})

const startWizard = () => {
  router.push('/business/reports/create')
}

const columns = computed(() => [
  { key: 'number', label: t('businessReports.colNumber'), width: '10%' },
  { key: 'year', label: t('businessReports.colPeriod'), width: '8%' },
  { key: 'date', label: t('businessReports.colDate'), width: '10%' },
  { key: 'processingPercent', label: t('businessReports.colFulfillment'), width: '10%' },
  { key: 'status', label: t('businessReports.colStatus'), width: '10%' },
])

const businessReports = computed(() => {
  return reportStore.getBusinessReports(companyData.value.name)
})

const editDraft = (id: number) => {
  router.push('/business/reports/create')
}

const handleDownloadPdf = () => {
  toastStore.show({ type: 'info', title: 'PDF', message: t('businessReports.pdfToast') })
}

const downloadReportExcel = (reportId: number) => {
  const report = reportStore.state.reports.find(r => r.id === reportId)
  if (!report) return
  generateRecyclingReportExcel(report, {
    name: report.company || companyData.value.name,
    inn: report.inn || '01234567890123',
    address: 'г. Бишкек, ул. Московская, 123',
  })
}
</script>

<template>
  <DashboardLayout
    role="business"
    :roleTitle="roleTitle"
    :userName="companyData.name"
    :menuItems="menuItems"
  >
    <div class="page-header">
      <h1 class="page-title">{{ $t('businessReports.pageTitle') }}</h1>
      <p class="page-subtitle">{{ $t('businessReports.pageSubtitle') }}</p>
    </div>

    <ReportCtaBanner @create="startWizard" />

    <div class="hint-banner">
      <div class="hint-banner__icon">
        <svg class="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div>
        <p class="hint-banner__title">{{ $t('businessReports.hint') }}</p>
        <p class="hint-banner__text">{{ $t('businessReports.hintText') }}</p>
      </div>
    </div>

    <template v-if="isLoading">
      <div class="skeleton-card"><SkeletonLoader variant="card" /></div>
      <SkeletonLoader variant="table" />
    </template>

    <template v-if="!isLoading">
      <ReportStatsGrid
        :yearNormativeStandard="yearNormativeStandard"
        :yearNormativeHigh="yearNormativeHigh"
      />

      <div class="history-header">
        <h2 class="history-title">{{ $t('businessReports.historyTitle') }}</h2>
      </div>

      <ReportHistoryTable
        :reports="businessReports"
        :columns="columns"
        @edit-draft="editDraft"
        @download-excel="downloadReportExcel"
        @download-pdf="handleDownloadPdf"
        @create="startWizard"
      />
    </template>
  </DashboardLayout>
</template>

<style scoped>
.page-header {
  margin-bottom: 24px;
}
.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
}
@media (min-width: 1024px) {
  .page-title {
    font-size: 34px;
  }
}
.page-subtitle {
  font-size: 18px;
  color: #64748b;
}

.hint-banner {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  margin-bottom: 24px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 12px;
}
.hint-banner__icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #dcfce7;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.hint-banner__title {
  font-size: 22px;
  font-weight: 700;
  color: #1e293b;
}
.hint-banner__text {
  font-size: 20px;
  font-weight: 500;
  color: #64748b;
}

.skeleton-card {
  margin-bottom: 24px;
}

.history-header {
  margin-bottom: 16px;
}
.history-title {
  font-size: 22px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 16px;
}

:deep(.row-green) { border-left: 4px solid #22c55e !important; }
:deep(.row-yellow) { border-left: 4px solid #f59e0b !important; }
:deep(.row-red) { border-left: 4px solid #ef4444 !important; background: #fffbeb !important; }
:deep(.row-gray) { border-left: 4px solid #d1d5db !important; }
</style>
