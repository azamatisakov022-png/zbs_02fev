<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import EmptyState from '../../components/dashboard/EmptyState.vue'
import { AppButton } from '../../components/ui'
import { useEmployeeMenu } from '../../composables/useRoleMenu'
import { auditStore, type AuditEntry, type AuditActionType, type AuditStatus } from '../../stores/audit'

const { roleTitle, menuItems } = useEmployeeMenu()
const { t } = useI18n()

// Current user (in production — from authStore)
const currentUser = 'Алиева Д.Н.'

// All entries for this user
const userEntries = computed(() => auditStore.getUserActivity(currentUser))

// Filters
const selectedAction = ref<AuditActionType | ''>('')
const selectedEntity = ref('')
const selectedStatus = ref<AuditStatus | ''>('')
const searchQuery = ref('')

const actionTypes = computed(() => [
  { value: 'create', label: t('auditPage.actionCreate') },
  { value: 'update', label: t('auditPage.actionUpdate') },
  { value: 'delete', label: t('auditPage.actionDelete') },
  { value: 'login', label: t('auditPage.actionLogin') },
  { value: 'logout', label: t('auditPage.actionLogout') },
  { value: 'view', label: t('auditPage.actionView') },
  { value: 'export', label: t('auditPage.actionExport') },
  { value: 'import', label: t('auditPage.actionImport') },
])

const userEntityList = computed(() => {
  const set = new Set(userEntries.value.map(e => e.entity))
  return [...set].sort()
})

const filteredLog = computed(() => {
  let result = userEntries.value
  if (selectedAction.value) result = result.filter(e => e.actionType === selectedAction.value)
  if (selectedEntity.value) result = result.filter(e => e.entity === selectedEntity.value)
  if (selectedStatus.value) result = result.filter(e => e.status === selectedStatus.value)
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(e =>
      e.action.toLowerCase().includes(q) ||
      e.details.toLowerCase().includes(q) ||
      e.entityId.toLowerCase().includes(q)
    )
  }
  return result
})

// Stats
const stats = computed(() => ({
  total: userEntries.value.length,
  success: userEntries.value.filter(e => e.status === 'success').length,
  warnings: userEntries.value.filter(e => e.status === 'warning').length,
  errors: userEntries.value.filter(e => e.status === 'error').length,
}))

// Pagination
const itemsPerPage = ref(15)
const currentPage = ref(1)
const totalPages = computed(() => Math.ceil(filteredLog.value.length / itemsPerPage.value))
const paginatedLog = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredLog.value.slice(start, start + itemsPerPage.value)
})
const paginationStart = computed(() => filteredLog.value.length === 0 ? 0 : (currentPage.value - 1) * itemsPerPage.value + 1)
const paginationEnd = computed(() => Math.min(currentPage.value * itemsPerPage.value, filteredLog.value.length))
const goToPage = (p: number) => { if (p >= 1 && p <= totalPages.value) currentPage.value = p }

// Colors
const getActionTypeColor = (type: string) => {
  const c: Record<string, string> = {
    create: 'bg-green-100 text-green-700', update: 'bg-blue-100 text-blue-700',
    delete: 'bg-red-100 text-red-700', login: 'bg-purple-100 text-purple-700',
    logout: 'bg-gray-100 text-gray-700', view: 'bg-slate-100 text-slate-700',
    export: 'bg-amber-100 text-amber-700', import: 'bg-cyan-100 text-cyan-700',
  }
  return c[type] || 'bg-gray-100 text-gray-700'
}
const getActionTypeLabel = (type: string) => {
  const m: Record<string, string> = {
    create: t('auditPage.actionCreate'), update: t('auditPage.actionUpdate'),
    delete: t('auditPage.actionDelete'), login: t('auditPage.actionLogin'),
    logout: t('auditPage.actionLogout'), view: t('auditPage.actionView'),
    export: t('auditPage.actionExport'), import: t('auditPage.actionImport'),
  }
  return m[type] || type
}
const getStatusIcon = (s: string) => s === 'success' ? '✓' : s === 'warning' ? '!' : '✕'
const getStatusColor = (s: string) => s === 'success' ? 'text-green-600 bg-green-100' : s === 'warning' ? 'text-amber-600 bg-amber-100' : 'text-red-600 bg-red-100'

// Detail modal
const showDetailModal = ref(false)
const selectedEntry = ref<AuditEntry | null>(null)
const openDetail = (entry: AuditEntry) => { selectedEntry.value = entry; showDetailModal.value = true }

// CSV export
const exportPersonalLog = () => {
  const bom = '\uFEFF'
  let csv = bom + `${t('auditPage.csvId')};${t('auditPage.csvDateTime')};${t('auditPage.csvActionType')};${t('auditPage.csvAction')};${t('auditPage.csvObject')};${t('auditPage.csvObjectId')};${t('auditPage.csvDetails')};${t('auditPage.csvStatus')}\n`
  filteredLog.value.forEach(e => {
    csv += `${e.id};${e.timestamp};${getActionTypeLabel(e.actionType)};${e.action};${e.entity};${e.entityId};"${e.details}";${e.status}\n`
  })
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `my_activity_log.csv`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <DashboardLayout role="employee" :roleTitle="roleTitle" userName="Алиева Д.Н." :menuItems="menuItems">
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">{{ $t('employeeAudit.title') }}</h1>
          <p class="text-gray-600 mt-1">{{ $t('employeeAudit.subtitle') }}</p>
        </div>
        <AppButton variant="secondary" @click="exportPersonalLog">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          {{ $t('employeeAudit.exportPersonal') }}
        </AppButton>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">{{ $t('auditPage.totalRecords') }}</p>
              <p class="text-2xl font-bold text-gray-900 mt-1">{{ stats.total }}</p>
            </div>
            <div class="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">{{ $t('auditPage.successful') }}</p>
              <p class="text-2xl font-bold text-green-600 mt-1">{{ stats.success }}</p>
            </div>
            <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">{{ $t('auditPage.warnings') }}</p>
              <p class="text-2xl font-bold text-amber-600 mt-1">{{ stats.warnings }}</p>
            </div>
            <div class="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">{{ $t('auditPage.errors') }}</p>
              <p class="text-2xl font-bold text-red-600 mt-1">{{ stats.errors }}</p>
            </div>
            <div class="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('auditPage.actionType') }}</label>
            <select v-model="selectedAction" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0e888d] focus:border-[#0e888d]">
              <option value="">{{ $t('auditPage.allTypes') }}</option>
              <option v-for="a in actionTypes" :key="a.value" :value="a.value">{{ a.label }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('auditPage.object') }}</label>
            <select v-model="selectedEntity" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0e888d] focus:border-[#0e888d]">
              <option value="">{{ $t('auditPage.allObjects') }}</option>
              <option v-for="entity in userEntityList" :key="entity" :value="entity">{{ entity }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('auditPage.statusLabel') }}</label>
            <select v-model="selectedStatus" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0e888d] focus:border-[#0e888d]">
              <option value="">{{ $t('auditPage.allStatuses') }}</option>
              <option value="success">{{ $t('auditPage.statusSuccess') }}</option>
              <option value="warning">{{ $t('auditPage.statusWarning') }}</option>
              <option value="error">{{ $t('auditPage.statusError') }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('auditPage.search') }}</label>
            <div class="relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input v-model="searchQuery" type="text" :placeholder="$t('auditPage.searchPlaceholder')" class="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0e888d] focus:border-[#0e888d]" />
            </div>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{{ $t('auditPage.time') }}</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{{ $t('auditPage.action') }}</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{{ $t('auditPage.object') }}</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{{ $t('auditPage.details') }}</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{{ $t('auditPage.statusLabel') }}</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{{ $t('auditPage.actions') }}</th>
              </tr>
            </thead>
            <tbody v-if="filteredLog.length === 0">
              <tr><td colspan="6">
                <EmptyState :title="$t('auditPage.emptyTitle')" :description="$t('auditPage.emptyDescription')" :actionLabel="$t('auditPage.resetFilters')" @action="selectedAction = ''; selectedEntity = ''; selectedStatus = ''; searchQuery = ''" />
              </td></tr>
            </tbody>
            <tbody v-else class="divide-y divide-gray-200">
              <tr v-for="entry in paginatedLog" :key="entry.id" class="hover:bg-gray-50">
                <td class="px-4 py-3">
                  <div class="text-sm text-gray-900 font-medium">{{ entry.timestamp.split(' ')[1] }}</div>
                  <div class="text-xs text-gray-500">{{ entry.timestamp.split(' ')[0] }}</div>
                </td>
                <td class="px-4 py-3">
                  <span :class="['text-xs px-2 py-1 rounded-full font-medium', getActionTypeColor(entry.actionType)]">{{ getActionTypeLabel(entry.actionType) }}</span>
                  <div class="text-sm text-gray-700 mt-1">{{ entry.action }}</div>
                </td>
                <td class="px-4 py-3">
                  <div class="text-sm text-gray-900">{{ entry.entity }}</div>
                  <div class="text-xs text-gray-500 font-mono">{{ entry.entityId }}</div>
                </td>
                <td class="px-4 py-3">
                  <div class="text-sm text-gray-600 max-w-xs truncate" :title="entry.details">{{ entry.details }}</div>
                </td>
                <td class="px-4 py-3 text-center">
                  <span :class="['inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold', getStatusColor(entry.status)]">{{ getStatusIcon(entry.status) }}</span>
                </td>
                <td class="px-4 py-3 text-center">
                  <button @click="openDetail(entry)" class="text-[#0e888d] hover:text-[#0a6d71] text-sm font-medium">{{ $t('auditPage.viewDetails') }}</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <p class="text-sm text-gray-500">{{ $t('auditPage.showingRecords', { start: paginationStart, end: paginationEnd, total: filteredLog.length }) }}</p>
          <div class="flex items-center gap-1">
            <button @click="currentPage > 1 && currentPage--" :disabled="currentPage === 1" :class="['px-3 py-1 border rounded-lg text-sm font-medium', currentPage === 1 ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-300 text-gray-600 hover:bg-gray-50']">{{ $t('auditPage.prev') }}</button>
            <button v-for="p in totalPages" :key="p" @click="goToPage(p)" :class="['px-3 py-1 rounded-lg text-sm font-medium', p === currentPage ? 'bg-[#0e888d] text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-50']">{{ p }}</button>
            <button @click="currentPage < totalPages && currentPage++" :disabled="currentPage === totalPages" :class="['px-3 py-1 border rounded-lg text-sm font-medium', currentPage === totalPages ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-300 text-gray-600 hover:bg-gray-50']">{{ $t('auditPage.next') }}</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <Teleport to="body">
      <div v-if="showDetailModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="showDetailModal = false">
        <div class="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          <div class="p-6 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <h3 class="text-xl font-bold text-gray-900">{{ $t('auditPage.entryDetails') }}</h3>
              <button @click="showDetailModal = false" class="p-2 text-gray-400 hover:text-gray-600"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
          </div>
          <div v-if="selectedEntry" class="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-130px)]">
            <div class="grid grid-cols-2 gap-4">
              <div><label class="text-sm text-gray-500">{{ $t('auditPage.entryId') }}</label><p class="font-mono text-gray-900">#{{ selectedEntry.id }}</p></div>
              <div><label class="text-sm text-gray-500">{{ $t('auditPage.dateTime') }}</label><p class="text-gray-900">{{ selectedEntry.timestamp }}</p></div>
              <div><label class="text-sm text-gray-500">{{ $t('auditPage.actionType') }}</label><span :class="['text-xs px-2 py-1 rounded-full font-medium', getActionTypeColor(selectedEntry.actionType)]">{{ getActionTypeLabel(selectedEntry.actionType) }}</span></div>
              <div><label class="text-sm text-gray-500">{{ $t('auditPage.statusLabel') }}</label><span :class="['inline-flex items-center gap-1 text-sm px-2 py-1 rounded', getStatusColor(selectedEntry.status)]">{{ getStatusIcon(selectedEntry.status) }} {{ $t(selectedEntry.status === 'success' ? 'auditPage.statusSuccess' : selectedEntry.status === 'warning' ? 'auditPage.statusWarning' : 'auditPage.statusError') }}</span></div>
              <div><label class="text-sm text-gray-500">{{ $t('auditPage.object') }}</label><p class="text-gray-900">{{ selectedEntry.entity }}</p></div>
              <div><label class="text-sm text-gray-500">{{ $t('auditPage.objectId') }}</label><p class="font-mono text-[#0e888d]">{{ selectedEntry.entityId }}</p></div>
            </div>
            <div>
              <label class="text-sm text-gray-500">{{ $t('auditPage.detailedInfo') }}</label>
              <p class="text-gray-900 mt-1 p-3 bg-gray-50 rounded-lg">{{ selectedEntry.details }}</p>
            </div>
          </div>
          <div class="p-6 border-t border-gray-200 flex justify-end">
            <AppButton variant="primary" @click="showDetailModal = false">{{ $t('auditPage.close') }}</AppButton>
          </div>
        </div>
      </div>
    </Teleport>
  </DashboardLayout>
</template>
