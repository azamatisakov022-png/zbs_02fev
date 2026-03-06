<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import DataTable from '../../components/dashboard/DataTable.vue'
import EmptyState from '../../components/dashboard/EmptyState.vue'
import SkeletonLoader from '../../components/dashboard/SkeletonLoader.vue'
import { AppButton, AppBadge, AppAlert, AppPageHeader, AppCtaBanner, AppActionMenu } from '../../components/ui'
import Select from '@/components/ui/general/Select.vue'
import type { SelectOption } from '@/types/select'
import { getStatusBadgeVariant } from '../../utils/statusVariant'
import { declarationStore } from '../../stores/declarations'
import { useBusinessMenu } from '../../composables/useRoleMenu'
import { toastStore } from '../../stores/toast'
import { useRouter } from 'vue-router'
import { statusI18nKey } from '../../constants/statuses'
import { useAccountStore } from '../../stores/account'

const router = useRouter()
const { t } = useI18n()
const accountStore = useAccountStore()

const { roleTitle, menuItems } = useBusinessMenu()

const isLoading = ref(true)
onMounted(async () => {
  await accountStore.fetchAll()
  isLoading.value = false
})

const companyName = computed(() => accountStore.myAccount?.company || '')

const startWizard = () => {
  router.push('/business/declarations/create')
}

const columns = computed(() => [
  { key: 'number', label: t('businessDecl.colNumber'), width: '12%' },
  { key: 'year', label: t('businessDecl.colReportingYear'), width: '10%' },
  { key: 'calcCount', label: t('businessDecl.colCalcCount'), width: '10%' },
  { key: 'totalAmount', label: t('businessDecl.colTotalAmount'), width: '15%' },
  { key: 'submittedAt', label: t('businessDecl.colSubmittedAt'), width: '12%' },
  { key: 'status', label: t('businessDecl.colStatus'), width: '10%' },
])

const storeDeclarations = computed(() => declarationStore.getByCompany(companyName.value))

const declarations = computed(() =>
  storeDeclarations.value.map(d => ({
    id: d.id,
    number: d.number,
    year: d.reportingYear,
    calcCount: d.calculationCount,
    totalAmount: d.totalCharged,
    submittedAt: d.submittedAt,
    status: d.status,
    reviewComment: d.reviewComment,
    reviewDate: d.reviewDate,
    reviewer: d.reviewer,
  }))
)

const searchQuery = ref('')
const filterYear = ref('')
const filterStatus = ref('')

const yearFilterOptions = computed<SelectOption[]>(() => [
  { value: '', label: t('businessDecl.allYears') },
  { value: '2025', label: '2025' },
  { value: '2026', label: '2026' },
  { value: '2027', label: '2027' },
])

const statusFilterOptions = computed<SelectOption[]>(() => [
  { value: '', label: t('businessDecl.allStatuses') },
  { value: 'draft', label: t('status.draft') },
  { value: 'under_review', label: t('status.underReview') },
  { value: 'approved', label: t('status.approvedFem') },
  { value: 'rejected', label: t('status.rejectedFem') },
  { value: 'revision', label: t('status.revision') },
])

const filteredDeclarations = computed(() => {
  return declarations.value.filter(d => {
    if (searchQuery.value && !d.number.toLowerCase().includes(searchQuery.value.toLowerCase())) return false
    if (filterYear.value && d.year !== filterYear.value) return false
    if (filterStatus.value && d.status !== filterStatus.value) return false
    return true
  })
})

const hasActiveFilters = computed(() => {
  return searchQuery.value !== '' || filterYear.value !== '' || filterStatus.value !== ''
})

const isFilteredEmpty = computed(() => {
  return filteredDeclarations.value.length === 0 && declarations.value.length > 0 && hasActiveFilters.value
})

const resetFilters = () => {
  searchQuery.value = ''
  filterYear.value = ''
  filterStatus.value = ''
}

const getRowClass = (row: Record<string, any>) => {
  switch (row.status) {
    case 'approved': case 'signed': return 'row-green'
    case 'under_review': return 'row-yellow'
    case 'rejected': return 'row-red'
    case 'auto_generated': return 'row-blue'
    default: return 'row-gray'
  }
}



const handleDownloadPdf = (id: number) => {
  router.push({ path: '/business/declarations/' + id, query: { from: 'declarations', print: 'true' } })
}

const deleteDeclaration = (id: number) => {
  toastStore.show({ type: 'info', title: t('businessDecl.deleteToastTitle'), message: t('businessDecl.deleteToastMessage') })
}

const signDeclaration = (id: number) => {
  toastStore.show({ type: 'info', title: t('businessDecl.signToastTitle'), message: t('businessDecl.signToastMessage') })
}
</script>

<template>
  <DashboardLayout
    role="business"
    :roleTitle="roleTitle"
    :userName="companyName"
    :menuItems="menuItems"
  >
    <AppPageHeader :title="$t('businessDecl.title')" :subtitle="$t('businessDecl.subtitle')" />

    <AppCtaBanner :title="$t('businessDecl.ctaTitle')" :description="$t('businessDecl.ctaDescription')" color="blue" class="mb-6">
      <template #icon>
        <svg class="w-8 h-8 lg:w-10 lg:h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </template>
      <template #action>
        <AppButton variant="secondary" bg="white" color="#2563eb" font-size="16px" :icon="'<svg class=&quot;w-5 h-5&quot; fill=&quot;none&quot; viewBox=&quot;0 0 24 24&quot; stroke=&quot;currentColor&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; stroke-width=&quot;2&quot; d=&quot;M12 4v16m8-8H4&quot; /></svg>'" :label="$t('businessDecl.startFilling')" @click="startWizard" />
      </template>
    </AppCtaBanner>

    <AppAlert variant="info" :title="$t('businessDecl.autoFormTitle')" class="mb-6">
      {{ $t('businessDecl.autoFormDescription') }}
    </AppAlert>

    <div v-for="decl in storeDeclarations.filter(d => d.status === 'rejected' || d.status === 'revision')" :key="'banner-' + decl.id" class="mb-4">
      <div
        :class="[
          'rounded-xl p-4 flex items-start gap-3 border',
          decl.status === 'rejected' ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200'
        ]"
      >
        <div :class="['w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5', decl.status === 'rejected' ? 'bg-red-100' : 'bg-orange-100']">
          <svg v-if="decl.status === 'rejected'" class="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <svg v-else class="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div class="flex-1">
          <p :class="['bdecl-banner-title font-semibold', decl.status === 'rejected' ? 'text-red-900' : 'text-orange-900']">
            {{ decl.number }} — {{ decl.status === 'rejected' ? $t('status.rejectedFem') : $t('businessDecl.returnedForRevision') }}
            <span v-if="decl.reviewDate" class="font-normal">{{ $t('businessDecl.fromDate') }} {{ decl.reviewDate }}</span>
          </p>
          <p v-if="decl.reviewComment" :class="['bdecl-banner-comment mt-1', decl.status === 'rejected' ? 'text-red-700' : 'text-orange-700']">
            {{ decl.reviewComment }}
          </p>
        </div>
      </div>
    </div>

    <template v-if="isLoading">
      <div class="mb-6"><SkeletonLoader variant="card" /></div>
      <SkeletonLoader variant="table" />
    </template>

    <template v-if="!isLoading">
      <div class="bdecl-filter-card">
        <div class="flex flex-wrap gap-4">
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="$t('businessDecl.searchPlaceholder')"
            class="bdecl-search-input flex-1 px-4 py-2 border rounded-lg focus:outline-none"
          />
          <Select v-model="filterYear" :options="yearFilterOptions" size="sm" />
          <Select v-model="filterStatus" :options="statusFilterOptions" size="sm" />
        </div>
      </div>

      <div class="mb-4">
        <h2 class="bdecl-history-title font-semibold mb-4">{{ $t('businessDecl.historyTitle') }}</h2>
      </div>

      <div v-if="isFilteredEmpty" class="mb-6">
        <EmptyState
          :icon="'<svg class=&quot;w-10 h-10&quot; fill=&quot;none&quot; viewBox=&quot;0 0 40 40&quot; stroke=&quot;currentColor&quot; stroke-width=&quot;1.5&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; d=&quot;M35 35l-10-10m0 0A11.67 11.67 0 1025 25z&quot;/></svg>'"
          :title="$t('businessDecl.nothingFound')"
          :description="$t('businessDecl.nothingFoundHint')"
          :actionLabel="$t('businessDecl.resetFilters')"
          @action="resetFilters"
        />
      </div>

      <DataTable v-if="!isFilteredEmpty" :columns="columns" :data="filteredDeclarations" :actions="true" :rowClass="getRowClass">
        <template #empty>
          <EmptyState
            :icon="'<svg class=&quot;w-10 h-10&quot; fill=&quot;none&quot; viewBox=&quot;0 0 40 40&quot; stroke=&quot;currentColor&quot; stroke-width=&quot;1.5&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; d=&quot;M5 11.67v16.66A3.33 3.33 0 008.33 31.67h23.34A3.33 3.33 0 0035 28.33V15A3.33 3.33 0 0031.67 11.67H20l-3.33-3.34H8.33A3.33 3.33 0 005 11.67z&quot;/></svg>'"
            :title="$t('businessDecl.noDeclarations')"
            :description="$t('businessDecl.createDeclarationHint')"
            :actionLabel="$t('businessDecl.createDeclaration')"
            @action="startWizard()"
          />
        </template>
        <template #cell-number="{ value, row }">
          <button class="bdecl-number-link font-mono font-medium hover:underline cursor-pointer" @click="router.push({ path: '/business/declarations/' + row.id, query: { from: 'declarations' } })">{{ value }}</button>
        </template>
        <template #cell-year="{ value }">
          <span>{{ value }} {{ $t('businessDecl.yearSuffix') }}</span>
        </template>
        <template #cell-totalAmount="{ value }">
          <span class="bdecl-amount font-medium">{{ value.toLocaleString() }} {{ $t('businessDecl.som') }}</span>
        </template>
        <template #cell-status="{ value }">
          <AppBadge :variant="getStatusBadgeVariant(value)">{{ $t(statusI18nKey[value] || value) }}</AppBadge>
        </template>
        <template #actions="{ row }">
          <div class="act-wrap">
            <template v-if="row.status === 'under_review'">
              <router-link :to="{ path: '/business/declarations/' + row.id, query: { from: 'declarations' } }" class="act-btn act-btn--outline">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                {{ $t('businessDecl.view') }}
              </router-link>
            </template>
            <template v-else-if="row.status === 'approved' || row.status === 'signed'">
              <router-link :to="{ path: '/business/declarations/' + row.id, query: { from: 'declarations' } }" class="act-btn act-btn--outline">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                {{ $t('businessDecl.view') }}
              </router-link>
              <AppActionMenu
                :items="[
                  { label: $t('businessDecl.downloadPdf'), icon: '<svg width=&quot;14&quot; height=&quot;14&quot; fill=&quot;none&quot; viewBox=&quot;0 0 24 24&quot; stroke=&quot;currentColor&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; stroke-width=&quot;2&quot; d=&quot;M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4&quot; /></svg>' },
                  { label: $t('businessDecl.downloadExcel'), icon: '<svg width=&quot;14&quot; height=&quot;14&quot; fill=&quot;none&quot; viewBox=&quot;0 0 24 24&quot; stroke=&quot;currentColor&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; stroke-width=&quot;2&quot; d=&quot;M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z&quot; /></svg>' }
                ]"
                @select="$event === 0 ? handleDownloadPdf(row.id) : toastStore.show({ type: 'info', title: 'Excel', message: t('businessDecl.excelExportToast') })"
              />
            </template>
            <template v-else-if="row.status === 'rejected'">
              <router-link :to="{ path: '/business/declarations/' + row.id, query: { from: 'declarations' } }" class="act-btn act-btn--filled act-btn--orange">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                {{ $t('businessDecl.fix') }}
              </router-link>
              <router-link :to="{ path: '/business/declarations/' + row.id, query: { from: 'declarations' } }" class="act-btn act-btn--outline">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                {{ $t('businessDecl.view') }}
              </router-link>
            </template>
            <template v-else-if="row.status === 'draft'">
              <router-link :to="{ path: '/business/declarations/' + row.id, query: { from: 'declarations' } }" class="act-btn act-btn--filled act-btn--green">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                {{ $t('businessDecl.edit') }}
              </router-link>
              <router-link :to="{ path: '/business/declarations/' + row.id, query: { from: 'declarations' } }" class="act-btn act-btn--outline">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                {{ $t('businessDecl.view') }}
              </router-link>
              <AppActionMenu
                :items="[
                  { label: $t('businessDecl.deleteLabel'), icon: '<svg width=&quot;14&quot; height=&quot;14&quot; fill=&quot;none&quot; viewBox=&quot;0 0 24 24&quot; stroke=&quot;currentColor&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; stroke-width=&quot;2&quot; d=&quot;M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16&quot; /></svg>', danger: true }
                ]"
                @select="deleteDeclaration(row.id)"
              />
            </template>
            <template v-else-if="row.status === 'Автосформирована'">
              <AppButton variant="success" size="sm" :icon="'<svg width=&quot;14&quot; height=&quot;14&quot; fill=&quot;none&quot; viewBox=&quot;0 0 24 24&quot; stroke=&quot;currentColor&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; stroke-width=&quot;2&quot; d=&quot;M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z&quot; /></svg>'" :label="$t('businessDecl.sign')" @click="signDeclaration(row.id)" />
              <router-link :to="{ path: '/business/declarations/' + row.id, query: { from: 'declarations' } }" class="act-btn act-btn--outline">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                {{ $t('businessDecl.view') }}
              </router-link>
            </template>
            <template v-else>
              <router-link :to="{ path: '/business/declarations/' + row.id, query: { from: 'declarations' } }" class="act-btn act-btn--outline">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                {{ $t('businessDecl.view') }}
              </router-link>
            </template>
          </div>
        </template>
      </DataTable>
    </template>
  </DashboardLayout>
</template>

<style scoped>
.bdecl-filter-card {
  background: white;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  border: 1px solid #e2e8f0;
  margin-bottom: 24px;
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

:deep(.row-green) { border-left: 4px solid #22c55e !important; }
:deep(.row-yellow) { border-left: 4px solid #f59e0b !important; }
:deep(.row-red) { border-left: 4px solid #ef4444 !important; background: #fffbeb !important; }
:deep(.row-gray) { border-left: 4px solid #d1d5db !important; }
:deep(.row-blue) { border-left: 4px solid #3b82f6 !important; }

.act-wrap {
  display: flex; gap: 6px; justify-content: flex-end; align-items: center; flex-wrap: wrap;
}
.act-btn {
  display: inline-flex; align-items: center; gap: 5px; padding: 6px 14px;
  font-size: 14px; font-weight: 500; border-radius: 8px; cursor: pointer;
  white-space: nowrap; text-decoration: none; transition: all 0.15s ease;
}
.act-btn--filled { color: white; border: none; }
.act-btn--green { background: #22c55e; }
.act-btn--green:hover { background: #16a34a; box-shadow: 0 2px 8px rgba(34,197,94,0.25); }
.act-btn--orange { background: #f59e0b; }
.act-btn--orange:hover { background: #d97706; box-shadow: 0 2px 8px rgba(245,158,11,0.25); }
.act-btn--outline {
  background: transparent; color: #475569; border: 1px solid #e2e8f0;
}
.act-btn--outline:hover {
  background: #f8fafc; border-color: #cbd5e1; color: #1e293b;
}


.bdecl-info-title {
  font-size: 20px;
  color: #1e293b;
}
.bdecl-info-text {
  font-size: 20px;
  color: #1e293b;
}
.bdecl-banner-title {
  font-size: 16px;
}
.bdecl-banner-comment {
  font-size: 14px;
}
.bdecl-search-input {
  min-width: 200px;
  border-color: #e2e8f0;
}
.bdecl-search-input:focus {
  border-color: #2563eb;
}
.bdecl-history-title {
  font-size: 22px;
  color: #1e293b;
}
.bdecl-number-link {
  color: #2563eb;
}
.bdecl-amount {
  font-size: 18px;
}
</style>
