<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { AppPageHeader, AppAlert } from '../../components/ui'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import SkeletonLoader from '../../components/dashboard/SkeletonLoader.vue'
import { normativeTiers } from '../../data/recycling-norms'
import { useReportStore } from '../../stores/reports'
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
const reportStore = useReportStore()

const isLoading = ref(true)
onMounted(async () => {
  await Promise.all([reportStore.fetchAll(), accountStore.fetchAll(), accountStore.fetchDashboard()])
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
  return reportStore.businessReports
})

const editDraft = (id: number) => {
  router.push('/business/reports/create')
}

const handleDownloadPdf = () => {
  toastStore.show({ type: 'info', title: 'PDF', message: t('businessReports.pdfToast') })
}

const downloadReportExcel = (reportId: number) => {
  const report = reportStore.reports.find(r => r.id === reportId)
  if (!report) return
  const cp = accountStore.dashboard?.companyProfile
  generateRecyclingReportExcel(report, {
    name: report.company || companyData.value.name,
    inn: report.inn || cp?.inn || '',
    address: cp?.legalAddress || '',
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
    <AppPageHeader :title="$t('businessReports.pageTitle')" :subtitle="$t('businessReports.pageSubtitle')" />

    <ReportCtaBanner @create="startWizard" />

    <AppAlert variant="success" :title="$t('businessReports.hint')" class="mb-6">
      {{ $t('businessReports.hintText') }}
    </AppAlert>

    <template v-if="isLoading">
      <div class="skeleton-card"><SkeletonLoader variant="card" /></div>
      <SkeletonLoader variant="table" />
    </template>

    <template v-if="!isLoading">
      <ReportStatsGrid
        :yearNormativeStandard="yearNormativeStandard"
        :yearNormativeHigh="yearNormativeHigh"
      />

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

.skeleton-card {
  margin-bottom: 24px;
}
</style>
