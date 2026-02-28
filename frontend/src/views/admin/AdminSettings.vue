<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import { useAdminMenu } from '../../composables/useRoleMenu'
import { toastStore } from '../../stores/toast'

const { t } = useI18n()
const { roleTitle, menuItems } = useAdminMenu()

// Settings tabs
const activeTab = ref('general')
const tabs = computed(() => [
  { id: 'general', label: t('adminSettings.tabs.general'), icon: '⚙️' },
  { id: 'security', label: t('adminSettings.tabs.security'), icon: '🔒' },
  { id: 'email', label: t('adminSettings.tabs.email'), icon: '📧' },
  { id: 'integrations', label: t('adminSettings.tabs.integrations'), icon: '🔗' },
  { id: 'backup', label: t('adminSettings.tabs.backup'), icon: '💾' },
  { id: 'maintenance', label: t('adminSettings.tabs.maintenance'), icon: '🔧' },
])

// General settings
const generalSettings = ref({
  systemName: 'ГП Эко Оператор',
  systemDescription: 'Автоматизированная информационная система учёта отходов и утилизационного сбора',
  supportEmail: 'support@eco.gov.kg',
  supportPhone: '+996 (312) 123-456',
  timezone: 'Asia/Bishkek',
  language: 'ru',
  dateFormat: 'DD.MM.YYYY',
  currency: 'KGS',
  declarationDeadline: 25,
  reportDeadline: 15,
})

// Security settings
const securitySettings = ref({
  sessionTimeout: 30,
  maxLoginAttempts: 5,
  lockoutDuration: 15,
  passwordMinLength: 8,
  requireUppercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  passwordExpiry: 90,
  twoFactorRequired: false,
  ipWhitelist: '',
})

// Email settings
const emailSettings = ref({
  smtpHost: 'smtp.gov.kg',
  smtpPort: 587,
  smtpUser: 'noreply@eco.gov.kg',
  smtpPassword: '********',
  useTLS: true,
  senderName: 'ГП Эко Оператор',
  senderEmail: 'noreply@eco.gov.kg',
})

// Notification settings
const notificationSettings = ref({
  newDeclaration: true,
  declarationApproved: true,
  declarationRejected: true,
  reportDue: true,
  paymentReceived: true,
  systemAlerts: true,
  dailyDigest: false,
  weeklyReport: true,
})

// Integration settings
const integrationsData = ref([
  { id: 'tunduk', nameKey: 'Түндүк', status: 'active', lastSync: '2025-02-03 14:00', descKey: 'adminSettings.integrations.tundukDesc' },
  { id: 'nbkr', nameKey: 'adminSettings.nbkrName', status: 'active', lastSync: '2025-02-03 09:00', descKey: 'adminSettings.integrations.nbkrDesc' },
  { id: 'esf', nameKey: 'adminSettings.esfName', status: 'active', lastSync: '2025-02-03 12:30', descKey: 'adminSettings.integrations.esfDesc' },
  { id: 'stat', nameKey: 'adminSettings.statName', status: 'inactive', lastSync: '2025-01-15 10:00', descKey: 'adminSettings.integrations.statDesc' },
  { id: 'payment', nameKey: 'adminSettings.paymentName', status: 'active', lastSync: '2025-02-03 13:45', descKey: 'adminSettings.integrations.paymentDesc' },
])
const integrations = computed(() => integrationsData.value.map(item => ({
  ...item,
  name: item.nameKey === 'Түндүк' ? 'Түндүк' : t(item.nameKey),
  description: t(item.descKey),
})))

// Backup settings
const backupSettings = ref({
  autoBackup: true,
  backupFrequency: 'daily',
  backupTime: '03:00',
  retentionDays: 30,
  backupLocation: '/backups/eco_registry',
  includeFiles: true,
  compression: true,
})

const recentBackups = ref([
  { id: 1, date: '2025-02-03 03:00', size: '2.4 GB', status: 'success', type: 'auto' },
  { id: 2, date: '2025-02-02 03:00', size: '2.3 GB', status: 'success', type: 'auto' },
  { id: 3, date: '2025-02-01 03:00', size: '2.3 GB', status: 'success', type: 'auto' },
  { id: 4, date: '2025-01-31 15:30', size: '2.2 GB', status: 'success', type: 'manual' },
  { id: 5, date: '2025-01-31 03:00', size: '2.2 GB', status: 'success', type: 'auto' },
])

// Maintenance mode
const maintenanceMode = ref({
  enabled: false,
  message: t('adminSettings.defaultMaintenanceMessage'),
  allowAdmins: true,
  scheduledStart: '',
  scheduledEnd: '',
})

const systemInfo = ref({
  version: '2.5.1',
  buildDate: '2025-01-28',
  phpVersion: '8.2.15',
  dbVersion: 'PostgreSQL 15.4',
  serverOS: 'Ubuntu 22.04 LTS',
  diskUsage: '45%',
  memoryUsage: '62%',
  cpuUsage: '28%',
  uptime: t('adminSettings.uptimeValue'),
})

const isSaving = ref(false)

const saveSettings = () => {
  isSaving.value = true
  setTimeout(() => {
    isSaving.value = false
  }, 1000)
}

const testEmailConnection = () => {
  toastStore.show({ type: 'success', title: t('adminSettings.email.testEmailSent') })
}

const createBackup = () => {
  toastStore.show({ type: 'info', title: t('adminSettings.backup.backupToastTitle'), message: t('adminSettings.backup.backupToastMessage') })
}

const getIntegrationStatusColor = (status: string) => {
  return status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
}

// Integration configure modal
const showIntegrationModal = ref(false)
const selectedIntegration = ref<typeof integrations.value[0] | null>(null)
const integrationSaving = ref(false)

const openIntegrationModal = (integration: typeof integrations.value[0]) => {
  selectedIntegration.value = { ...integration }
  showIntegrationModal.value = true
}

const handleOverlay = (e: MouseEvent) => {
  if (e.target === e.currentTarget) {
    showIntegrationModal.value = false
    showConfirmModal.value = false
    showUpdateModal.value = false
  }
}

const toggleIntegrationStatus = () => {
  if (!selectedIntegration.value) return
  integrationSaving.value = true
  setTimeout(() => {
    const idx = integrationsData.value.findIndex(i => i.id === selectedIntegration.value!.id)
    if (idx !== -1) {
      integrationsData.value[idx].status = selectedIntegration.value!.status === 'active' ? 'inactive' : 'active'
      selectedIntegration.value!.status = integrationsData.value[idx].status
    }
    integrationSaving.value = false
  }, 800)
}

const syncIntegration = () => {
  if (!selectedIntegration.value) return
  integrationSaving.value = true
  setTimeout(() => {
    const idx = integrationsData.value.findIndex(i => i.id === selectedIntegration.value!.id)
    if (idx !== -1) {
      const now = new Date()
      const ts = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`
      integrationsData.value[idx].lastSync = ts
      selectedIntegration.value!.lastSync = ts
    }
    integrationSaving.value = false
  }, 1200)
}

// Confirm modal for maintenance actions
const showConfirmModal = ref(false)
const confirmAction = ref<'cache' | 'queues' | null>(null)
const confirmTitle = ref('')
const confirmMessage = ref('')
const confirmProcessing = ref(false)
const confirmDone = ref(false)
const confirmResult = ref('')

const openClearCache = () => {
  confirmAction.value = 'cache'
  confirmTitle.value = t('adminSettings.maintenance.clearCacheTitle')
  confirmMessage.value = t('adminSettings.maintenance.clearCacheMessage')
  confirmDone.value = false
  confirmResult.value = ''
  showConfirmModal.value = true
}

const openRestartQueues = () => {
  confirmAction.value = 'queues'
  confirmTitle.value = t('adminSettings.maintenance.restartQueuesTitle')
  confirmMessage.value = t('adminSettings.maintenance.restartQueuesMessage')
  confirmDone.value = false
  confirmResult.value = ''
  showConfirmModal.value = true
}

const executeConfirmAction = () => {
  confirmProcessing.value = true
  setTimeout(() => {
    confirmProcessing.value = false
    confirmDone.value = true
    if (confirmAction.value === 'cache') {
      confirmResult.value = t('adminSettings.maintenance.cacheCleared')
    } else {
      confirmResult.value = t('adminSettings.maintenance.queuesRestarted')
    }
  }, 1500)
}

// Check updates modal
const showUpdateModal = ref(false)
const updateChecking = ref(false)
const updateResult = ref<{ hasUpdate: boolean; version: string; changes: string[] } | null>(null)

const checkUpdates = () => {
  showUpdateModal.value = true
  updateChecking.value = true
  updateResult.value = null
  setTimeout(() => {
    updateChecking.value = false
    updateResult.value = {
      hasUpdate: true,
      version: '2.6.0',
      changes: [
        t('adminSettings.maintenance.updateChange1'),
        t('adminSettings.maintenance.updateChange2'),
        t('adminSettings.maintenance.updateChange3'),
        t('adminSettings.maintenance.updateChange4'),
      ]
    }
  }, 2000)
}

// Backup download/restore
const downloadBackup = (backup: typeof recentBackups.value[0]) => {
  const blob = new Blob([`Backup #${backup.id}\nDate: ${backup.date}\nSize: ${backup.size}\nType: ${backup.type}`], { type: 'application/octet-stream' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `backup_${backup.date.replace(/[: ]/g, '_')}.sql.gz`
  a.click()
  URL.revokeObjectURL(url)
}

const showRestoreConfirm = ref(false)
const restoreTarget = ref<typeof recentBackups.value[0] | null>(null)
const restoring = ref(false)
const restoreDone = ref(false)

const openRestoreConfirm = (backup: typeof recentBackups.value[0]) => {
  restoreTarget.value = backup
  restoreDone.value = false
  showRestoreConfirm.value = true
}

const executeRestore = () => {
  restoring.value = true
  setTimeout(() => {
    restoring.value = false
    restoreDone.value = true
  }, 2500)
}
</script>

<template>
  <DashboardLayout
    role="admin"
    :roleTitle="roleTitle"
    userName="Иван Петров"
    :menuItems="menuItems"
  >
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">{{ $t('adminSettings.pageTitle') }}</h1>
          <p class="text-gray-600 mt-1">{{ $t('adminSettings.pageSubtitle') }}</p>
        </div>
        <button
          @click="saveSettings"
          :disabled="isSaving"
          class="px-6 py-2 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <svg v-if="isSaving" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          {{ isSaving ? $t('adminSettings.saving') : $t('adminSettings.saveChanges') }}
        </button>
      </div>

      <div class="flex gap-6">
        <!-- Tabs Sidebar -->
        <div class="w-64 flex-shrink-0">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[
                'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors',
                activeTab === tab.id
                  ? 'bg-rose-50 text-rose-700'
                  : 'text-gray-600 hover:bg-gray-50'
              ]"
            >
              <span class="text-xl">{{ tab.icon }}</span>
              <span class="font-medium">{{ tab.label }}</span>
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="flex-1">
          <!-- General Settings -->
          <div v-if="activeTab === 'general'" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 class="text-lg font-bold text-gray-900 mb-6">{{ $t('adminSettings.general.title') }}</h2>

            <div class="space-y-6">
              <div class="grid grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('adminSettings.general.systemName') }}</label>
                  <input
                    v-model="generalSettings.systemName"
                    type="text"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('adminSettings.general.timezone') }}</label>
                  <select
                    v-model="generalSettings.timezone"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  >
                    <option value="Asia/Bishkek">Asia/Bishkek (UTC+6)</option>
                  </select>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('adminSettings.general.systemDescription') }}</label>
                <textarea
                  v-model="generalSettings.systemDescription"
                  rows="2"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                ></textarea>
              </div>

              <div class="grid grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('adminSettings.general.supportEmail') }}</label>
                  <input
                    v-model="generalSettings.supportEmail"
                    type="email"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('adminSettings.general.supportPhone') }}</label>
                  <input
                    v-model="generalSettings.supportPhone"
                    type="tel"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('adminSettings.general.interfaceLanguage') }}</label>
                  <select
                    v-model="generalSettings.language"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  >
                    <option value="ru">{{ $t('adminSettings.general.langRu') }}</option>
                    <option value="ky">{{ $t('adminSettings.general.langKy') }}</option>
                    <option value="en">{{ $t('adminSettings.general.langEn') }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('adminSettings.general.dateFormat') }}</label>
                  <select
                    v-model="generalSettings.dateFormat"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  >
                    <option value="DD.MM.YYYY">DD.MM.YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('adminSettings.general.currency') }}</label>
                  <select
                    v-model="generalSettings.currency"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  >
                    <option value="KGS">{{ $t('adminSettings.general.currencyKGS') }}</option>
                    <option value="USD">{{ $t('adminSettings.general.currencyUSD') }}</option>
                    <option value="EUR">{{ $t('adminSettings.general.currencyEUR') }}</option>
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('adminSettings.general.declarationDeadline') }}</label>
                  <input
                    v-model="generalSettings.declarationDeadline"
                    type="number"
                    min="1"
                    max="31"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('adminSettings.general.reportDeadline') }}</label>
                  <input
                    v-model="generalSettings.reportDeadline"
                    type="number"
                    min="1"
                    max="31"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Security Settings -->
          <div v-if="activeTab === 'security'" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 class="text-lg font-bold text-gray-900 mb-6">{{ $t('adminSettings.security.title') }}</h2>

            <div class="space-y-6">
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('adminSettings.security.sessionTimeout') }}</label>
                  <input
                    v-model="securitySettings.sessionTimeout"
                    type="number"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('adminSettings.security.maxLoginAttempts') }}</label>
                  <input
                    v-model="securitySettings.maxLoginAttempts"
                    type="number"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('adminSettings.security.lockoutDuration') }}</label>
                  <input
                    v-model="securitySettings.lockoutDuration"
                    type="number"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  />
                </div>
              </div>

              <div class="border-t border-gray-200 pt-6">
                <h3 class="font-semibold text-gray-900 mb-4">{{ $t('adminSettings.security.passwordRequirements') }}</h3>
                <div class="grid grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('adminSettings.security.minLength') }}</label>
                    <input
                      v-model="securitySettings.passwordMinLength"
                      type="number"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('adminSettings.security.passwordExpiry') }}</label>
                    <input
                      v-model="securitySettings.passwordExpiry"
                      type="number"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    />
                  </div>
                </div>

                <div class="mt-4 space-y-3">
                  <label class="flex items-center gap-3 cursor-pointer">
                    <input
                      v-model="securitySettings.requireUppercase"
                      type="checkbox"
                      class="w-5 h-5 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                    />
                    <span class="text-gray-700">{{ $t('adminSettings.security.requireUppercase') }}</span>
                  </label>
                  <label class="flex items-center gap-3 cursor-pointer">
                    <input
                      v-model="securitySettings.requireNumbers"
                      type="checkbox"
                      class="w-5 h-5 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                    />
                    <span class="text-gray-700">{{ $t('adminSettings.security.requireNumbers') }}</span>
                  </label>
                  <label class="flex items-center gap-3 cursor-pointer">
                    <input
                      v-model="securitySettings.requireSpecialChars"
                      type="checkbox"
                      class="w-5 h-5 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                    />
                    <span class="text-gray-700">{{ $t('adminSettings.security.requireSpecialChars') }}</span>
                  </label>
                  <label class="flex items-center gap-3 cursor-pointer">
                    <input
                      v-model="securitySettings.twoFactorRequired"
                      type="checkbox"
                      class="w-5 h-5 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                    />
                    <span class="text-gray-700">{{ $t('adminSettings.security.require2FA') }}</span>
                  </label>
                </div>
              </div>

              <div class="border-t border-gray-200 pt-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('adminSettings.security.ipWhitelist') }}</label>
                <textarea
                  v-model="securitySettings.ipWhitelist"
                  rows="3"
                  placeholder="192.168.1.0/24&#10;10.0.0.0/8"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 font-mono text-sm"
                ></textarea>
                <p class="text-xs text-gray-500 mt-1">{{ $t('adminSettings.security.ipWhitelistHint') }}</p>
              </div>
            </div>
          </div>

          <!-- Email Settings -->
          <div v-if="activeTab === 'email'" class="space-y-6">
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 class="text-lg font-bold text-gray-900 mb-6">{{ $t('adminSettings.email.smtpTitle') }}</h2>

              <div class="space-y-6">
                <div class="grid grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('adminSettings.email.smtpServer') }}</label>
                    <input
                      v-model="emailSettings.smtpHost"
                      type="text"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('adminSettings.email.port') }}</label>
                    <input
                      v-model="emailSettings.smtpPort"
                      type="number"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    />
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('adminSettings.email.username') }}</label>
                    <input
                      v-model="emailSettings.smtpUser"
                      type="text"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('adminSettings.email.password') }}</label>
                    <input
                      v-model="emailSettings.smtpPassword"
                      type="password"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    />
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('adminSettings.email.senderName') }}</label>
                    <input
                      v-model="emailSettings.senderName"
                      type="text"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('adminSettings.email.senderEmail') }}</label>
                    <input
                      v-model="emailSettings.senderEmail"
                      type="email"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    />
                  </div>
                </div>

                <div class="flex items-center justify-between">
                  <label class="flex items-center gap-3 cursor-pointer">
                    <input
                      v-model="emailSettings.useTLS"
                      type="checkbox"
                      class="w-5 h-5 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                    />
                    <span class="text-gray-700">{{ $t('adminSettings.email.useTLS') }}</span>
                  </label>
                  <button
                    @click="testEmailConnection"
                    class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    {{ $t('adminSettings.email.testEmail') }}
                  </button>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 class="text-lg font-bold text-gray-900 mb-6">{{ $t('adminSettings.email.notificationsTitle') }}</h2>

              <div class="grid grid-cols-2 gap-4">
                <label class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
                  <input
                    v-model="notificationSettings.newDeclaration"
                    type="checkbox"
                    class="w-5 h-5 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                  />
                  <span class="text-gray-700">{{ $t('adminSettings.email.newDeclarations') }}</span>
                </label>
                <label class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
                  <input
                    v-model="notificationSettings.declarationApproved"
                    type="checkbox"
                    class="w-5 h-5 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                  />
                  <span class="text-gray-700">{{ $t('adminSettings.email.approvedDeclarations') }}</span>
                </label>
                <label class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
                  <input
                    v-model="notificationSettings.declarationRejected"
                    type="checkbox"
                    class="w-5 h-5 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                  />
                  <span class="text-gray-700">{{ $t('adminSettings.email.rejectedDeclarations') }}</span>
                </label>
                <label class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
                  <input
                    v-model="notificationSettings.reportDue"
                    type="checkbox"
                    class="w-5 h-5 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                  />
                  <span class="text-gray-700">{{ $t('adminSettings.email.reportReminders') }}</span>
                </label>
                <label class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
                  <input
                    v-model="notificationSettings.paymentReceived"
                    type="checkbox"
                    class="w-5 h-5 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                  />
                  <span class="text-gray-700">{{ $t('adminSettings.email.paymentReceived') }}</span>
                </label>
                <label class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
                  <input
                    v-model="notificationSettings.systemAlerts"
                    type="checkbox"
                    class="w-5 h-5 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                  />
                  <span class="text-gray-700">{{ $t('adminSettings.email.systemAlerts') }}</span>
                </label>
                <label class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
                  <input
                    v-model="notificationSettings.dailyDigest"
                    type="checkbox"
                    class="w-5 h-5 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                  />
                  <span class="text-gray-700">{{ $t('adminSettings.email.dailyDigest') }}</span>
                </label>
                <label class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
                  <input
                    v-model="notificationSettings.weeklyReport"
                    type="checkbox"
                    class="w-5 h-5 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                  />
                  <span class="text-gray-700">{{ $t('adminSettings.email.weeklyReport') }}</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Integrations -->
          <div v-if="activeTab === 'integrations'" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 class="text-lg font-bold text-gray-900 mb-6">{{ $t('adminSettings.integrations.title') }}</h2>

            <div class="space-y-4">
              <div
                v-for="integration in integrations"
                :key="integration.id"
                class="flex items-center justify-between p-4 border border-gray-200 rounded-xl"
              >
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                    <span class="text-2xl">🔗</span>
                  </div>
                  <div>
                    <h3 class="font-semibold text-gray-900">{{ integration.name }}</h3>
                    <p class="text-sm text-gray-500">{{ integration.description }}</p>
                    <p class="text-xs text-gray-400 mt-1">{{ $t('adminSettings.integrations.lastSync') }}: {{ integration.lastSync }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <span :class="['px-3 py-1 rounded-full text-sm font-medium', getIntegrationStatusColor(integration.status)]">
                    {{ integration.status === 'active' ? $t('adminSettings.integrations.statusActive') : $t('adminSettings.integrations.statusInactive') }}
                  </span>
                  <button @click="openIntegrationModal(integration)" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors">
                    {{ $t('adminSettings.integrations.configure') }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Backup -->
          <div v-if="activeTab === 'backup'" class="space-y-6">
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-lg font-bold text-gray-900">{{ $t('adminSettings.backup.title') }}</h2>
                <button
                  @click="createBackup"
                  class="px-4 py-2 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 transition-colors flex items-center gap-2"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  {{ $t('adminSettings.backup.createBackup') }}
                </button>
              </div>

              <div class="space-y-6">
                <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div class="flex items-center gap-3">
                    <span class="text-gray-700 font-medium">{{ $t('adminSettings.backup.autoBackup') }}</span>
                  </div>
                  <button
                    @click="backupSettings.autoBackup = !backupSettings.autoBackup"
                    :class="[
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                      backupSettings.autoBackup ? 'bg-rose-600' : 'bg-gray-300'
                    ]"
                  >
                    <span
                      :class="[
                        'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                        backupSettings.autoBackup ? 'translate-x-6' : 'translate-x-1'
                      ]"
                    />
                  </button>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('adminSettings.backup.frequency') }}</label>
                    <select
                      v-model="backupSettings.backupFrequency"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    >
                      <option value="hourly">{{ $t('adminSettings.backup.frequencyHourly') }}</option>
                      <option value="daily">{{ $t('adminSettings.backup.frequencyDaily') }}</option>
                      <option value="weekly">{{ $t('adminSettings.backup.frequencyWeekly') }}</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('adminSettings.backup.time') }}</label>
                    <input
                      v-model="backupSettings.backupTime"
                      type="time"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('adminSettings.backup.retentionDays') }}</label>
                    <input
                      v-model="backupSettings.retentionDays"
                      type="number"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    />
                  </div>
                </div>

                <div class="flex gap-4">
                  <label class="flex items-center gap-3 cursor-pointer">
                    <input
                      v-model="backupSettings.includeFiles"
                      type="checkbox"
                      class="w-5 h-5 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                    />
                    <span class="text-gray-700">{{ $t('adminSettings.backup.includeFiles') }}</span>
                  </label>
                  <label class="flex items-center gap-3 cursor-pointer">
                    <input
                      v-model="backupSettings.compression"
                      type="checkbox"
                      class="w-5 h-5 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                    />
                    <span class="text-gray-700">{{ $t('adminSettings.backup.compression') }}</span>
                  </label>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 class="text-lg font-bold text-gray-900 mb-4">{{ $t('adminSettings.backup.recentTitle') }}</h2>

              <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{{ $t('adminSettings.backup.tableDate') }}</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{{ $t('adminSettings.backup.tableSize') }}</th>
                    <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{{ $t('adminSettings.backup.tableType') }}</th>
                    <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{{ $t('adminSettings.backup.tableStatus') }}</th>
                    <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{{ $t('adminSettings.backup.tableActions') }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr v-for="backup in recentBackups" :key="backup.id" class="hover:bg-gray-50">
                    <td class="px-4 py-3 text-sm text-gray-900">{{ backup.date }}</td>
                    <td class="px-4 py-3 text-sm text-gray-600">{{ backup.size }}</td>
                    <td class="px-4 py-3 text-center">
                      <span :class="['text-xs px-2 py-1 rounded-full', backup.type === 'auto' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700']">
                        {{ backup.type === 'auto' ? $t('adminSettings.backup.typeAuto') : $t('adminSettings.backup.typeManual') }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-center">
                      <span class="text-green-600">✓</span>
                    </td>
                    <td class="px-4 py-3 text-center">
                      <div class="flex items-center justify-center gap-2">
                        <button @click="downloadBackup(backup)" class="p-1 text-gray-400 hover:text-rose-600 transition-colors" :title="$t('adminSettings.backup.download')">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </button>
                        <button @click="openRestoreConfirm(backup)" class="p-1 text-gray-400 hover:text-rose-600 transition-colors" :title="$t('adminSettings.backup.restore')">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
              </div>
            </div>
          </div>

          <!-- Maintenance -->
          <div v-if="activeTab === 'maintenance'" class="space-y-6">
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 class="text-lg font-bold text-gray-900 mb-6">{{ $t('adminSettings.maintenance.title') }}</h2>

              <div class="space-y-6">
                <div class="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <div>
                    <p class="font-medium text-amber-800">{{ $t('adminSettings.maintenance.maintenanceMode') }}</p>
                    <p class="text-sm text-amber-600">{{ $t('adminSettings.maintenance.maintenanceModeHint') }}</p>
                  </div>
                  <button
                    @click="maintenanceMode.enabled = !maintenanceMode.enabled"
                    :class="[
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                      maintenanceMode.enabled ? 'bg-amber-500' : 'bg-gray-300'
                    ]"
                  >
                    <span
                      :class="[
                        'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                        maintenanceMode.enabled ? 'translate-x-6' : 'translate-x-1'
                      ]"
                    />
                  </button>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('adminSettings.maintenance.userMessage') }}</label>
                  <textarea
                    v-model="maintenanceMode.message"
                    rows="3"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  ></textarea>
                </div>

                <label class="flex items-center gap-3 cursor-pointer">
                  <input
                    v-model="maintenanceMode.allowAdmins"
                    type="checkbox"
                    class="w-5 h-5 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                  />
                  <span class="text-gray-700">{{ $t('adminSettings.maintenance.allowAdmins') }}</span>
                </label>

                <div class="grid grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('adminSettings.maintenance.scheduledStart') }}</label>
                    <input
                      v-model="maintenanceMode.scheduledStart"
                      type="datetime-local"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('adminSettings.maintenance.scheduledEnd') }}</label>
                    <input
                      v-model="maintenanceMode.scheduledEnd"
                      type="datetime-local"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 class="text-lg font-bold text-gray-900 mb-6">{{ $t('adminSettings.maintenance.systemInfoTitle') }}</h2>

              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                <div class="p-4 bg-gray-50 rounded-xl">
                  <p class="text-sm text-gray-500">{{ $t('adminSettings.maintenance.version') }}</p>
                  <p class="text-xl font-bold text-gray-900">{{ systemInfo.version }}</p>
                  <p class="text-xs text-gray-400">{{ systemInfo.buildDate }}</p>
                </div>
                <div class="p-4 bg-gray-50 rounded-xl">
                  <p class="text-sm text-gray-500">{{ $t('adminSettings.maintenance.uptime') }}</p>
                  <p class="text-xl font-bold text-green-600">{{ systemInfo.uptime }}</p>
                </div>
                <div class="p-4 bg-gray-50 rounded-xl">
                  <p class="text-sm text-gray-500">CPU</p>
                  <p class="text-xl font-bold text-gray-900">{{ systemInfo.cpuUsage }}</p>
                </div>
                <div class="p-4 bg-gray-50 rounded-xl">
                  <p class="text-sm text-gray-500">{{ $t('adminSettings.maintenance.memory') }}</p>
                  <p class="text-xl font-bold text-gray-900">{{ systemInfo.memoryUsage }}</p>
                </div>
              </div>

              <div class="mt-6 grid grid-cols-2 gap-4">
                <div class="p-4 border border-gray-200 rounded-xl">
                  <p class="text-sm text-gray-500">PHP</p>
                  <p class="font-medium text-gray-900">{{ systemInfo.phpVersion }}</p>
                </div>
                <div class="p-4 border border-gray-200 rounded-xl">
                  <p class="text-sm text-gray-500">{{ $t('adminSettings.maintenance.database') }}</p>
                  <p class="font-medium text-gray-900">{{ systemInfo.dbVersion }}</p>
                </div>
                <div class="p-4 border border-gray-200 rounded-xl">
                  <p class="text-sm text-gray-500">{{ $t('adminSettings.maintenance.serverOS') }}</p>
                  <p class="font-medium text-gray-900">{{ systemInfo.serverOS }}</p>
                </div>
                <div class="p-4 border border-gray-200 rounded-xl">
                  <p class="text-sm text-gray-500">{{ $t('adminSettings.maintenance.diskUsage') }}</p>
                  <p class="font-medium text-gray-900">{{ systemInfo.diskUsage }}</p>
                </div>
              </div>

              <div class="mt-6 flex gap-3">
                <button @click="openClearCache" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                  {{ $t('adminSettings.maintenance.clearCache') }}
                </button>
                <button @click="openRestartQueues" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                  {{ $t('adminSettings.maintenance.restartQueues') }}
                </button>
                <button @click="checkUpdates" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                  {{ $t('adminSettings.maintenance.checkUpdates') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Integration Configure Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showIntegrationModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click="handleOverlay">
          <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
            <div class="p-6 border-b border-gray-200">
              <div class="flex items-center justify-between">
                <h3 class="text-xl font-bold text-gray-900">{{ $t('adminSettings.integrations.modalTitle') }}</h3>
                <button @click="showIntegrationModal = false" class="p-2 text-gray-400 hover:text-gray-600">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div v-if="selectedIntegration" class="p-6 space-y-5">
              <div class="p-4 bg-gray-50 rounded-xl">
                <h4 class="font-semibold text-gray-900">{{ selectedIntegration.name }}</h4>
                <p class="text-sm text-gray-500 mt-1">{{ selectedIntegration.description }}</p>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-gray-700 font-medium">{{ $t('adminSettings.integrations.connectionStatus') }}</span>
                <span :class="['px-3 py-1 rounded-full text-sm font-medium', getIntegrationStatusColor(selectedIntegration.status)]">
                  {{ selectedIntegration.status === 'active' ? $t('adminSettings.integrations.statusActive') : $t('adminSettings.integrations.statusInactive') }}
                </span>
              </div>

              <div>
                <label class="text-sm text-gray-500">{{ $t('adminSettings.integrations.lastSyncLabel') }}</label>
                <p class="font-medium text-gray-900">{{ selectedIntegration.lastSync }}</p>
              </div>

              <div class="flex gap-3">
                <button
                  @click="toggleIntegrationStatus"
                  :disabled="integrationSaving"
                  :class="[
                    'flex-1 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50',
                    selectedIntegration.status === 'active'
                      ? 'bg-red-50 text-red-700 hover:bg-red-100'
                      : 'bg-green-50 text-green-700 hover:bg-green-100'
                  ]"
                >
                  {{ selectedIntegration.status === 'active' ? $t('adminSettings.integrations.disable') : $t('adminSettings.integrations.enable') }}
                </button>
                <button
                  @click="syncIntegration"
                  :disabled="integrationSaving || selectedIntegration.status !== 'active'"
                  class="flex-1 px-4 py-2 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <svg v-if="integrationSaving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ $t('adminSettings.integrations.sync') }}
                </button>
              </div>
            </div>

            <div class="p-6 border-t border-gray-200 flex justify-end">
              <button @click="showIntegrationModal = false" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                {{ $t('adminSettings.maintenance.close') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Confirm Action Modal (Cache / Queues) -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showConfirmModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click="handleOverlay">
          <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div class="p-6 border-b border-gray-200">
              <h3 class="text-xl font-bold text-gray-900">{{ confirmTitle }}</h3>
            </div>

            <div class="p-6">
              <template v-if="!confirmDone">
                <p class="text-gray-600">{{ confirmMessage }}</p>
                <p class="text-sm text-amber-600 mt-3 p-3 bg-amber-50 rounded-lg">{{ $t('adminSettings.maintenance.confirmPrompt') }}</p>
              </template>
              <template v-else>
                <div class="text-center">
                  <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p class="text-gray-900 font-medium">{{ confirmResult }}</p>
                </div>
              </template>
            </div>

            <div class="p-6 border-t border-gray-200 flex justify-end gap-3">
              <template v-if="!confirmDone">
                <button @click="showConfirmModal = false" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                  {{ $t('adminSettings.maintenance.cancel') }}
                </button>
                <button
                  @click="executeConfirmAction"
                  :disabled="confirmProcessing"
                  class="px-4 py-2 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <svg v-if="confirmProcessing" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ confirmProcessing ? $t('adminSettings.maintenance.processing') : $t('adminSettings.maintenance.confirm') }}
                </button>
              </template>
              <template v-else>
                <button @click="showConfirmModal = false" class="px-4 py-2 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 transition-colors">
                  {{ $t('adminSettings.maintenance.done') }}
                </button>
              </template>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Check Updates Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showUpdateModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click="handleOverlay">
          <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div class="p-6 border-b border-gray-200">
              <div class="flex items-center justify-between">
                <h3 class="text-xl font-bold text-gray-900">{{ $t('adminSettings.maintenance.checkUpdates') }}</h3>
                <button @click="showUpdateModal = false" class="p-2 text-gray-400 hover:text-gray-600">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div class="p-6">
              <template v-if="updateChecking">
                <div class="text-center py-8">
                  <svg class="w-12 h-12 animate-spin text-rose-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p class="text-gray-600">{{ $t('adminSettings.maintenance.checkingUpdates') }}</p>
                  <p class="text-sm text-gray-400 mt-1">{{ $t('adminSettings.maintenance.currentVersion') }}: {{ systemInfo.version }}</p>
                </div>
              </template>
              <template v-else-if="updateResult">
                <template v-if="updateResult.hasUpdate">
                  <div class="p-4 bg-blue-50 border border-blue-200 rounded-xl mb-4">
                    <div class="flex items-center gap-2 mb-1">
                      <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span class="font-semibold text-blue-800">{{ $t('adminSettings.maintenance.updateAvailable') }}</span>
                    </div>
                    <p class="text-blue-700">{{ $t('adminSettings.maintenance.versionLabel') }} {{ updateResult.version }}</p>
                  </div>
                  <h4 class="font-medium text-gray-900 mb-2">{{ $t('adminSettings.maintenance.whatsNew') }}</h4>
                  <ul class="space-y-2">
                    <li v-for="(change, idx) in updateResult.changes" :key="idx" class="flex items-start gap-2 text-sm text-gray-600">
                      <span class="text-green-500 mt-0.5">+</span>
                      {{ change }}
                    </li>
                  </ul>
                </template>
                <template v-else>
                  <div class="text-center py-4">
                    <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p class="font-medium text-gray-900">{{ $t('adminSettings.maintenance.systemUpToDate') }}</p>
                    <p class="text-sm text-gray-500 mt-1">{{ $t('adminSettings.maintenance.latestVersion', { version: systemInfo.version }) }}</p>
                  </div>
                </template>
              </template>
            </div>

            <div class="p-6 border-t border-gray-200 flex justify-end">
              <button @click="showUpdateModal = false" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                {{ $t('adminSettings.maintenance.close') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Restore Backup Confirm Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showRestoreConfirm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click="(e: MouseEvent) => { if (e.target === e.currentTarget) showRestoreConfirm = false }">
          <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div class="p-6 border-b border-gray-200">
              <h3 class="text-xl font-bold text-gray-900">{{ $t('adminSettings.restoreModal.title') }}</h3>
            </div>

            <div class="p-6">
              <template v-if="!restoreDone">
                <div v-if="restoreTarget" class="p-4 bg-gray-50 rounded-xl mb-4">
                  <p class="text-sm text-gray-500">{{ $t('adminSettings.restoreModal.backupFrom') }}</p>
                  <p class="font-medium text-gray-900">{{ restoreTarget.date }}</p>
                  <p class="text-sm text-gray-500 mt-1">{{ $t('adminSettings.restoreModal.size') }}: {{ restoreTarget.size }}</p>
                </div>
                <div class="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p class="text-sm text-red-700 font-medium">{{ $t('adminSettings.restoreModal.warning') }}</p>
                </div>
              </template>
              <template v-else>
                <div class="text-center py-4">
                  <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p class="font-medium text-gray-900">{{ $t('adminSettings.restoreModal.restoreComplete') }}</p>
                  <p class="text-sm text-gray-500 mt-1">{{ $t('adminSettings.restoreModal.restoreSuccess', { date: restoreTarget?.date }) }}</p>
                </div>
              </template>
            </div>

            <div class="p-6 border-t border-gray-200 flex justify-end gap-3">
              <template v-if="!restoreDone">
                <button @click="showRestoreConfirm = false" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                  {{ $t('adminSettings.restoreModal.cancel') }}
                </button>
                <button
                  @click="executeRestore"
                  :disabled="restoring"
                  class="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <svg v-if="restoring" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ restoring ? $t('adminSettings.restoreModal.restoring') : $t('adminSettings.restoreModal.restoreBtn') }}
                </button>
              </template>
              <template v-else>
                <button @click="showRestoreConfirm = false" class="px-4 py-2 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 transition-colors">
                  {{ $t('adminSettings.restoreModal.done') }}
                </button>
              </template>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </DashboardLayout>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
