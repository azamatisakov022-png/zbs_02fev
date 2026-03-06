<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import EmptyState from '../../components/dashboard/EmptyState.vue'
import { AppButton } from '../../components/ui'
import { useAdminMenu } from '../../composables/useRoleMenu'
import { auditStore, type AuditEntry, type AuditActionType, type AuditStatus, type SecurityEvent, type SecurityEventType, type SecurityRiskLevel, type IntegrationAuditEntry, type IntegrationService, type IntegrationStatus } from '../../stores/audit'

const { roleTitle, menuItems } = useAdminMenu()
const { t, locale: i18nLocale } = useI18n()

const dateLang = computed(() => {
  const map: Record<string, string> = { ru: 'ru-RU', ky: 'ky-KG', en: 'en-GB' }
  return map[(i18nLocale as any).value || 'ru'] || 'ru-RU'
})

// ============ Tabs ============
const activeTab = ref<'log' | 'security' | 'analytics'>('log')

// ============ TAB 1: Log ============
const dateFrom = ref('2025-01-26')
const dateTo = ref('2025-02-03')
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

const entities = computed(() => [
  t('auditPage.entityUsers'), t('auditPage.entityOrgs'), t('auditPage.entityDeclarations'),
  t('auditPage.entityReports'), t('auditPage.entityRates'), t('auditPage.entityReferences'),
  t('auditPage.entitySettings'), t('auditPage.entitySessions'), t('auditPage.entityCalculations'),
  t('auditPage.entityLicenses'),
])

const statuses = computed(() => [
  { value: 'success', label: t('auditPage.statusSuccess') },
  { value: 'warning', label: t('auditPage.statusWarning') },
  { value: 'error', label: t('auditPage.statusError') },
])

const filteredLog = computed(() => {
  return auditStore.getFilteredEntries({
    actionType: selectedAction.value || undefined,
    entity: selectedEntity.value || undefined,
    status: selectedStatus.value || undefined,
    search: searchQuery.value || undefined,
  } as any)
})

const stats = computed(() => auditStore.getAuditStats())

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
const pageNumbers = computed(() => {
  const pages: number[] = []
  const total = totalPages.value
  const current = currentPage.value
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    pages.push(1)
    if (current > 3) pages.push(-1)
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i)
    if (current < total - 2) pages.push(-1)
    pages.push(total)
  }
  return pages
})
const goToPage = (p: number) => { if (p >= 1 && p <= totalPages.value) currentPage.value = p }
const prevPage = () => { if (currentPage.value > 1) currentPage.value-- }
const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++ }

// Colors & labels
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
const getRoleColor = (r: string) => {
  const c: Record<string, string> = {
    admin: 'bg-rose-100 text-rose-700', employee: 'bg-sky-100 text-sky-700',
    business: 'bg-emerald-100 text-emerald-700', 'eco-operator': 'bg-lime-100 text-lime-700',
    system: 'bg-slate-100 text-slate-700',
  }
  return c[r] || 'bg-gray-100 text-gray-700'
}
const getRoleLabel = (r: string) => {
  const m: Record<string, string> = {
    admin: t('auditPage.roleAdmin'), employee: t('auditPage.roleEmployee'),
    business: t('auditPage.roleBusiness'), 'eco-operator': t('auditPage.roleEcoOperator'),
    system: t('auditPage.roleSystem'),
  }
  return m[r] || r
}

// Detail modal
const showDetailModal = ref(false)
const selectedEntry = ref<AuditEntry | null>(null)
const openDetail = (entry: AuditEntry) => { selectedEntry.value = entry; showDetailModal.value = true }

// CSV export
const exportAuditLog = () => {
  const bom = '\uFEFF'
  let csv = bom + `${t('auditPage.csvId')};${t('auditPage.csvDateTime')};${t('auditPage.csvUser')};${t('auditPage.csvRole')};${t('auditPage.csvActionType')};${t('auditPage.csvAction')};${t('auditPage.csvObject')};${t('auditPage.csvObjectId')};${t('auditPage.csvIpAddress')};${t('auditPage.csvDetails')};${t('auditPage.csvStatus')}\n`
  filteredLog.value.forEach(e => {
    csv += `${e.id};${e.timestamp};${e.user};${getRoleLabel(e.userRole)};${getActionTypeLabel(e.actionType)};${e.action};${e.entity};${e.entityId};${e.ipAddress};"${e.details}";${e.status === 'success' ? t('auditPage.statusSuccess') : e.status === 'warning' ? t('auditPage.statusWarning') : t('auditPage.statusError')}\n`
  })
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `audit_log_${dateFrom.value}_${dateTo.value}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ============ TAB 2: Security ============
const secRiskFilter = ref<SecurityRiskLevel | ''>('')
const secTypeFilter = ref<SecurityEventType | ''>('')
const secResolvedFilter = ref<'all' | 'resolved' | 'unresolved'>('all')
const secSearch = ref('')

const securityStats = computed(() => auditStore.getSecurityStats())
const filteredSecurity = computed(() => {
  return auditStore.getSecurityEvents({
    riskLevel: secRiskFilter.value || undefined,
    eventType: secTypeFilter.value || undefined,
    resolved: secResolvedFilter.value,
    search: secSearch.value || undefined,
  } as any)
})

const getRiskColor = (level: string) => {
  const c: Record<string, string> = {
    critical: 'bg-red-100 text-red-700', high: 'bg-orange-100 text-orange-700',
    medium: 'bg-yellow-100 text-yellow-700', low: 'bg-green-100 text-green-700',
  }
  return c[level] || 'bg-gray-100 text-gray-700'
}
const getRiskLabel = (level: string) => {
  const m: Record<string, string> = {
    critical: t('auditPage.riskCritical'), high: t('auditPage.riskHigh'),
    medium: t('auditPage.riskMedium'), low: t('auditPage.riskLow'),
  }
  return m[level] || level
}
const getEventTypeLabel = (type: string) => {
  const m: Record<string, string> = {
    failed_login: t('auditPage.eventFailedLogin'), account_locked: t('auditPage.eventAccountLocked'),
    role_change: t('auditPage.eventRoleChange'), password_reset: t('auditPage.eventPasswordReset'),
    suspicious_ip: t('auditPage.eventSuspiciousIp'), brute_force: t('auditPage.eventBruteForce'),
    permission_escalation: t('auditPage.eventPermissionEscalation'), mfa_disabled: t('auditPage.eventMfaDisabled'),
    api_key_created: t('auditPage.eventApiKeyCreated'),
  }
  return m[type] || type
}
const resolveEvent = (id: number) => { auditStore.resolveSecurityEvent(id, 'Иванов И.И.') }

const eventTypes = computed(() => [
  { value: 'failed_login', label: t('auditPage.eventFailedLogin') },
  { value: 'account_locked', label: t('auditPage.eventAccountLocked') },
  { value: 'role_change', label: t('auditPage.eventRoleChange') },
  { value: 'password_reset', label: t('auditPage.eventPasswordReset') },
  { value: 'suspicious_ip', label: t('auditPage.eventSuspiciousIp') },
  { value: 'brute_force', label: t('auditPage.eventBruteForce') },
  { value: 'permission_escalation', label: t('auditPage.eventPermissionEscalation') },
  { value: 'mfa_disabled', label: t('auditPage.eventMfaDisabled') },
  { value: 'api_key_created', label: t('auditPage.eventApiKeyCreated') },
])

// ============ TAB 3: Analytics ============
const analytics = computed(() => auditStore.getAnalyticsData())
const maxDayCount = computed(() => Math.max(...analytics.value.activityByDay.map(d => d.count), 1))
const maxUserCount = computed(() => analytics.value.topUsers.length > 0 ? analytics.value.topUsers[0].count : 1)
const maxHourCount = computed(() => Math.max(...analytics.value.peakHours.map(h => h.count), 1))
const getHeatIntensity = (count: number) => {
  if (count === 0) return 'bg-gray-100'
  const ratio = count / maxHourCount.value
  if (ratio < 0.25) return 'bg-[#0e888d]/20'
  if (ratio < 0.5) return 'bg-[#0e888d]/40'
  if (ratio < 0.75) return 'bg-[#0e888d]/60'
  return 'bg-[#0e888d]/90'
}
const statusTotal = computed(() => {
  const r = analytics.value.statusRatio
  return r.success + r.warning + r.error || 1
})
</script>

<template>
  <DashboardLayout role="admin" :roleTitle="roleTitle" userName="Иван Петров" :menuItems="menuItems">
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">{{ $t('auditPage.title') }}</h1>
          <p class="text-gray-600 mt-1">{{ $t('auditPage.subtitle') }}</p>
        </div>
        <div v-if="activeTab === 'log'" class="flex items-center gap-3">
          <AppButton variant="secondary" @click="exportAuditLog">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            {{ $t('auditPage.exportLog') }}
          </AppButton>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex border-b border-gray-200">
        <button
          v-for="tab in (['log', 'security', 'analytics'] as const)" :key="tab"
          @click="activeTab = tab"
          :class="[
            'px-5 py-3 text-sm font-medium border-b-2 transition-colors -mb-px',
            activeTab === tab
              ? 'border-[#0e888d] text-[#0e888d]'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          {{ tab === 'log' ? $t('auditPage.tabLog') : tab === 'security' ? $t('auditPage.tabSecurity') : $t('auditPage.tabAnalytics') }}
          <span v-if="tab === 'security' && securityStats.unresolved > 0" class="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
            {{ securityStats.unresolved }}
          </span>
        </button>
      </div>

      <!-- ==================== TAB: LOG ==================== -->
      <template v-if="activeTab === 'log'">
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500">{{ $t('auditPage.totalRecords') }}</p>
                <p class="text-2xl font-bold text-gray-900 mt-1">{{ stats.total.toLocaleString() }}</p>
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
          <div class="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('auditPage.dateFrom') }}</label>
              <input v-model="dateFrom" type="date" :lang="dateLang" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0e888d] focus:border-[#0e888d]" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('auditPage.dateTo') }}</label>
              <input v-model="dateTo" type="date" :lang="dateLang" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0e888d] focus:border-[#0e888d]" />
            </div>
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
                <option v-for="entity in entities" :key="entity" :value="entity">{{ entity }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('auditPage.statusLabel') }}</label>
              <select v-model="selectedStatus" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0e888d] focus:border-[#0e888d]">
                <option value="">{{ $t('auditPage.allStatuses') }}</option>
                <option v-for="s in statuses" :key="s.value" :value="s.value">{{ s.label }}</option>
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
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{{ $t('auditPage.user') }}</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{{ $t('auditPage.action') }}</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{{ $t('auditPage.object') }}</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{{ $t('auditPage.details') }}</th>
                  <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{{ $t('auditPage.statusLabel') }}</th>
                  <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{{ $t('auditPage.actions') }}</th>
                </tr>
              </thead>
              <tbody v-if="filteredLog.length === 0">
                <tr><td colspan="7">
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
                    <div class="text-sm font-medium text-gray-900">{{ entry.user }}</div>
                    <span :class="['text-xs px-1.5 py-0.5 rounded', getRoleColor(entry.userRole)]">{{ getRoleLabel(entry.userRole) }}</span>
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
                    <button @click="openDetail(entry)" class="text-[#0e888d] hover:text-[#0a6d71] text-sm font-medium">
                      {{ $t('auditPage.viewDetails') }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p class="text-sm text-gray-500">{{ $t('auditPage.showingRecords', { start: paginationStart, end: paginationEnd, total: filteredLog.length }) }}</p>
            <div class="flex items-center gap-1">
              <button @click="prevPage" :disabled="currentPage === 1" :class="['px-3 py-1 border rounded-lg text-sm font-medium transition-colors', currentPage === 1 ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-300 text-gray-600 hover:bg-gray-50']">{{ $t('auditPage.prev') }}</button>
              <template v-for="page in pageNumbers" :key="page">
                <span v-if="page === -1" class="px-2 text-gray-400">...</span>
                <button v-else @click="goToPage(page)" :class="['px-3 py-1 rounded-lg text-sm font-medium transition-colors', page === currentPage ? 'bg-[#0e888d] text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-50']">{{ page }}</button>
              </template>
              <button @click="nextPage" :disabled="currentPage === totalPages" :class="['px-3 py-1 border rounded-lg text-sm font-medium transition-colors', currentPage === totalPages ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-300 text-gray-600 hover:bg-gray-50']">{{ $t('auditPage.next') }}</button>
            </div>
          </div>
        </div>
      </template>

      <!-- ==================== TAB: SECURITY ==================== -->
      <template v-if="activeTab === 'security'">
        <!-- Security Stats -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500">{{ $t('auditPage.securityTotal') }}</p>
                <p class="text-2xl font-bold text-gray-900 mt-1">{{ securityStats.total }}</p>
              </div>
              <div class="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
            </div>
          </div>
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500">{{ $t('auditPage.securityCritical') }}</p>
                <p class="text-2xl font-bold text-red-600 mt-1">{{ securityStats.critical }}</p>
              </div>
              <div class="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
            </div>
          </div>
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500">{{ $t('auditPage.securityUnresolved') }}</p>
                <p class="text-2xl font-bold text-orange-600 mt-1">{{ securityStats.unresolved }}</p>
              </div>
              <div class="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
            </div>
          </div>
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500">{{ $t('auditPage.securityFailedLogins') }}</p>
                <p class="text-2xl font-bold text-purple-600 mt-1">{{ securityStats.failedLogins }}</p>
              </div>
              <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Security Filters -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('auditPage.filterRiskLevel') }}</label>
              <select v-model="secRiskFilter" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0e888d] focus:border-[#0e888d]">
                <option value="">{{ $t('auditPage.allRiskLevels') }}</option>
                <option value="critical">{{ $t('auditPage.riskCritical') }}</option>
                <option value="high">{{ $t('auditPage.riskHigh') }}</option>
                <option value="medium">{{ $t('auditPage.riskMedium') }}</option>
                <option value="low">{{ $t('auditPage.riskLow') }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('auditPage.filterEventType') }}</label>
              <select v-model="secTypeFilter" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0e888d] focus:border-[#0e888d]">
                <option value="">{{ $t('auditPage.allEventTypes') }}</option>
                <option v-for="et in eventTypes" :key="et.value" :value="et.value">{{ et.label }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('auditPage.filterResolved') }}</label>
              <select v-model="secResolvedFilter" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0e888d] focus:border-[#0e888d]">
                <option value="all">{{ $t('auditPage.allResolvedStatuses') }}</option>
                <option value="resolved">{{ $t('auditPage.onlyResolved') }}</option>
                <option value="unresolved">{{ $t('auditPage.onlyUnresolved') }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('auditPage.search') }}</label>
              <div class="relative">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input v-model="secSearch" type="text" :placeholder="$t('auditPage.searchPlaceholder')" class="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0e888d] focus:border-[#0e888d]" />
              </div>
            </div>
          </div>
        </div>

        <!-- Security Table -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{{ $t('auditPage.securityEventTime') }}</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{{ $t('auditPage.securityEventType') }}</th>
                  <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{{ $t('auditPage.securityRiskLevel') }}</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{{ $t('auditPage.securityUser') }}</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{{ $t('auditPage.securityIp') }}</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{{ $t('auditPage.securityDetails') }}</th>
                  <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{{ $t('auditPage.securityStatus') }}</th>
                  <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{{ $t('auditPage.securityActions') }}</th>
                </tr>
              </thead>
              <tbody v-if="filteredSecurity.length === 0">
                <tr><td colspan="8">
                  <EmptyState :title="$t('auditPage.emptyTitle')" :description="$t('auditPage.emptyDescription')" :actionLabel="$t('auditPage.resetFilters')" @action="secRiskFilter = ''; secTypeFilter = ''; secResolvedFilter = 'all'; secSearch = ''" />
                </td></tr>
              </tbody>
              <tbody v-else class="divide-y divide-gray-200">
                <tr v-for="ev in filteredSecurity" :key="ev.id" class="hover:bg-gray-50">
                  <td class="px-4 py-3">
                    <div class="text-sm text-gray-900 font-medium">{{ ev.timestamp.split(' ')[1] }}</div>
                    <div class="text-xs text-gray-500">{{ ev.timestamp.split(' ')[0] }}</div>
                  </td>
                  <td class="px-4 py-3">
                    <span class="text-sm font-medium text-gray-900">{{ getEventTypeLabel(ev.eventType) }}</span>
                  </td>
                  <td class="px-4 py-3 text-center">
                    <span :class="['text-xs px-2 py-1 rounded-full font-medium', getRiskColor(ev.riskLevel)]">{{ getRiskLabel(ev.riskLevel) }}</span>
                  </td>
                  <td class="px-4 py-3">
                    <div class="text-sm font-medium text-gray-900">{{ ev.user }}</div>
                    <span :class="['text-xs px-1.5 py-0.5 rounded', getRoleColor(ev.userRole)]">{{ getRoleLabel(ev.userRole) }}</span>
                  </td>
                  <td class="px-4 py-3">
                    <span class="text-sm font-mono text-gray-600">{{ ev.ipAddress }}</span>
                  </td>
                  <td class="px-4 py-3">
                    <div class="text-sm text-gray-600 max-w-xs" :title="ev.details">{{ ev.details }}</div>
                  </td>
                  <td class="px-4 py-3 text-center">
                    <span v-if="ev.resolved" class="text-xs px-2 py-1 rounded-full font-medium bg-green-100 text-green-700">{{ $t('auditPage.resolved') }}</span>
                    <span v-else class="text-xs px-2 py-1 rounded-full font-medium bg-red-100 text-red-700">{{ $t('auditPage.unresolved') }}</span>
                  </td>
                  <td class="px-4 py-3 text-center">
                    <button v-if="!ev.resolved" @click="resolveEvent(ev.id)" class="text-xs px-3 py-1.5 bg-[#0e888d] text-white rounded-lg hover:bg-[#0a6d71] transition-colors font-medium">
                      {{ $t('auditPage.markResolved') }}
                    </button>
                    <span v-else class="text-xs text-gray-400">{{ ev.resolvedBy }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>

      <!-- ==================== TAB: ANALYTICS ==================== -->
      <template v-if="activeTab === 'analytics'">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <!-- Activity by day of week -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">{{ $t('auditPage.activityByDay') }}</h3>
            <div class="space-y-3">
              <div v-for="day in analytics.activityByDay" :key="day.day" class="flex items-center gap-3">
                <span class="w-8 text-sm font-medium text-gray-600 text-right">{{ day.day }}</span>
                <div class="flex-1 bg-gray-100 rounded-full h-7 overflow-hidden">
                  <div class="h-full bg-[#0e888d] rounded-full flex items-center justify-end pr-2 transition-all duration-500" :style="{ width: Math.max((day.count / maxDayCount) * 100, day.count > 0 ? 8 : 0) + '%' }">
                    <span v-if="day.count > 0" class="text-xs font-bold text-white">{{ day.count }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Top 5 users -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">{{ $t('auditPage.topActiveUsers') }}</h3>
            <div class="space-y-3">
              <div v-for="(user, idx) in analytics.topUsers" :key="user.user" class="flex items-center gap-3">
                <span :class="['w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white', idx === 0 ? 'bg-[#0e888d]' : idx === 1 ? 'bg-[#0e888d]/80' : 'bg-[#0e888d]/60']">{{ idx + 1 }}</span>
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-medium text-gray-900 truncate">{{ user.user }}</div>
                  <div class="bg-gray-100 rounded-full h-2 mt-1">
                    <div class="h-full bg-[#0e888d] rounded-full transition-all duration-500" :style="{ width: (user.count / maxUserCount) * 100 + '%' }"></div>
                  </div>
                </div>
                <span class="text-sm font-bold text-gray-700 whitespace-nowrap">{{ user.count }}</span>
              </div>
            </div>
          </div>

          <!-- Actions by type -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">{{ $t('auditPage.actionsByType') }}</h3>
            <div class="space-y-3">
              <div v-for="item in analytics.actionsByType" :key="item.type" class="flex items-center gap-3">
                <span :class="['text-xs px-2 py-1 rounded-full font-medium w-24 text-center', getActionTypeColor(item.type)]">{{ getActionTypeLabel(item.type) }}</span>
                <div class="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                  <div :class="['h-full rounded-full transition-all duration-500', item.type === 'create' ? 'bg-green-500' : item.type === 'update' ? 'bg-blue-500' : item.type === 'delete' ? 'bg-red-500' : item.type === 'login' ? 'bg-purple-500' : item.type === 'view' ? 'bg-slate-400' : item.type === 'export' ? 'bg-amber-500' : item.type === 'import' ? 'bg-cyan-500' : 'bg-gray-400']" :style="{ width: item.percent + '%' }"></div>
                </div>
                <span class="text-sm text-gray-600 w-16 text-right">{{ item.count }} <span class="text-xs text-gray-400">({{ item.percent }}%)</span></span>
              </div>
            </div>
          </div>

          <!-- Status ratio -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">{{ $t('auditPage.statusRatio') }}</h3>
            <!-- Stacked bar -->
            <div class="flex rounded-full overflow-hidden h-10 mb-4">
              <div class="bg-green-500 flex items-center justify-center transition-all duration-500" :style="{ width: (analytics.statusRatio.success / statusTotal) * 100 + '%' }">
                <span v-if="analytics.statusRatio.success > 0" class="text-xs font-bold text-white">{{ Math.round((analytics.statusRatio.success / statusTotal) * 100) }}%</span>
              </div>
              <div class="bg-amber-500 flex items-center justify-center transition-all duration-500" :style="{ width: (analytics.statusRatio.warning / statusTotal) * 100 + '%' }">
                <span v-if="analytics.statusRatio.warning > 2" class="text-xs font-bold text-white">{{ Math.round((analytics.statusRatio.warning / statusTotal) * 100) }}%</span>
              </div>
              <div class="bg-red-500 flex items-center justify-center transition-all duration-500" :style="{ width: (analytics.statusRatio.error / statusTotal) * 100 + '%' }">
                <span v-if="analytics.statusRatio.error > 2" class="text-xs font-bold text-white">{{ Math.round((analytics.statusRatio.error / statusTotal) * 100) }}%</span>
              </div>
            </div>
            <!-- Legend -->
            <div class="flex items-center justify-center gap-6">
              <div class="flex items-center gap-2"><div class="w-3 h-3 rounded-full bg-green-500"></div><span class="text-sm text-gray-600">{{ $t('auditPage.statusSuccess') }} ({{ analytics.statusRatio.success }})</span></div>
              <div class="flex items-center gap-2"><div class="w-3 h-3 rounded-full bg-amber-500"></div><span class="text-sm text-gray-600">{{ $t('auditPage.statusWarning') }} ({{ analytics.statusRatio.warning }})</span></div>
              <div class="flex items-center gap-2"><div class="w-3 h-3 rounded-full bg-red-500"></div><span class="text-sm text-gray-600">{{ $t('auditPage.statusError') }} ({{ analytics.statusRatio.error }})</span></div>
            </div>
          </div>

          <!-- Peak hours (full width) -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">{{ $t('auditPage.peakHours') }}</h3>
            <div class="flex items-end gap-1">
              <div v-for="h in analytics.peakHours" :key="h.hour" class="flex-1 flex flex-col items-center gap-1">
                <span class="text-xs font-medium text-gray-600">{{ h.count }}</span>
                <div :class="['w-full rounded-t transition-all duration-500', h.count > 0 ? 'bg-[#0e888d]' : 'bg-gray-200']" :style="{ height: Math.max((h.count / maxHourCount) * 120, h.count > 0 ? 8 : 4) + 'px' }"></div>
                <span class="text-xs text-gray-400">{{ h.hour }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>
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
              <div><label class="text-sm text-gray-500">{{ $t('auditPage.user') }}</label><p class="text-gray-900">{{ selectedEntry.user }}</p></div>
              <div><label class="text-sm text-gray-500">{{ $t('auditPage.role') }}</label><span :class="['text-xs px-2 py-1 rounded', getRoleColor(selectedEntry.userRole)]">{{ getRoleLabel(selectedEntry.userRole) }}</span></div>
              <div><label class="text-sm text-gray-500">{{ $t('auditPage.ipAddress') }}</label><p class="font-mono text-gray-900">{{ selectedEntry.ipAddress }}</p></div>
              <div><label class="text-sm text-gray-500">{{ $t('auditPage.statusLabel') }}</label><span :class="['inline-flex items-center gap-1 text-sm px-2 py-1 rounded', getStatusColor(selectedEntry.status)]">{{ getStatusIcon(selectedEntry.status) }} {{ $t(selectedEntry.status === 'success' ? 'auditPage.statusSuccess' : selectedEntry.status === 'warning' ? 'auditPage.statusWarning' : 'auditPage.statusError') }}</span></div>
              <div><label class="text-sm text-gray-500">{{ $t('auditPage.actionType') }}</label><span :class="['text-xs px-2 py-1 rounded-full font-medium', getActionTypeColor(selectedEntry.actionType)]">{{ getActionTypeLabel(selectedEntry.actionType) }}</span></div>
              <div><label class="text-sm text-gray-500">{{ $t('auditPage.action') }}</label><p class="text-gray-900">{{ selectedEntry.action }}</p></div>
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
