<script setup lang="ts">
import { ref } from 'vue'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import { icons } from '../../utils/menuIcons'

const menuItems = [
  { id: 'dashboard', label: 'Главная', icon: icons.dashboard, route: '/admin' },
  { id: 'users', label: 'Пользователи', icon: icons.users, route: '/admin/users' },
  { id: 'organizations', label: 'Организации', icon: icons.building, route: '/admin/organizations' },
  { id: 'declarations', label: 'Все декларации', icon: icons.document, route: '/admin/declarations' },
  { id: 'reports', label: 'Все отчёты', icon: icons.report, route: '/admin/reports' },
  { id: 'registries', label: 'Реестры и справочники', icon: icons.registries, route: '/admin/registries' },
  { id: 'calculations', label: 'Настройки расчётов', icon: icons.calculator, route: '/admin/calculations' },
  { id: 'analytics', label: 'Аналитика', icon: icons.analytics, route: '/admin/analytics' },
  { id: 'audit', label: 'Журнал действий', icon: icons.audit, route: '/admin/audit' },
  { id: 'settings', label: 'Настройки системы', icon: icons.settings, route: '/admin/settings' },
]

// Settings tabs
const activeTab = ref('general')
const tabs = [
  { id: 'general', label: 'Общие', icon: '⚙️' },
  { id: 'security', label: 'Безопасность', icon: '🔒' },
  { id: 'email', label: 'Email уведомления', icon: '📧' },
  { id: 'integrations', label: 'Интеграции', icon: '🔗' },
  { id: 'backup', label: 'Резервные копии', icon: '💾' },
  { id: 'maintenance', label: 'Обслуживание', icon: '🔧' },
]

// General settings
const generalSettings = ref({
  systemName: 'АИС Цифровой реестр отходов',
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
  senderName: 'АИС Цифровой реестр отходов',
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
const integrations = ref([
  { id: 'tunduk', name: 'Түндүк', status: 'active', lastSync: '2025-02-03 14:00', description: 'Интеграция с системой электронного взаимодействия «Түндүк»' },
  { id: 'nbkr', name: 'НБКР (курсы валют)', status: 'active', lastSync: '2025-02-03 09:00', description: 'Национальный банк Кыргызской Республики, автоматическое получение курсов валют' },
  { id: 'esf', name: 'ЭСФ', status: 'active', lastSync: '2025-02-03 12:30', description: 'Электронные счета-фактуры (СТС КР)' },
  { id: 'stat', name: 'Нацстатком КР', status: 'inactive', lastSync: '2025-01-15 10:00', description: 'Национальный статистический комитет Кыргызской Республики' },
  { id: 'payment', name: 'ЭЛСОМ / MBank', status: 'active', lastSync: '2025-02-03 13:45', description: 'Платёжные системы Кыргызстана' },
])

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
  message: 'Система находится на техническом обслуживании. Пожалуйста, повторите попытку позже.',
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
  uptime: '15 дней 7 часов',
})

const isSaving = ref(false)

const saveSettings = () => {
  isSaving.value = true
  setTimeout(() => {
    isSaving.value = false
  }, 1000)
}

const testEmailConnection = () => {
  alert('Тестовое письмо успешно отправлено!')
}

const createBackup = () => {
  alert('Резервная копия создаётся...')
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
    const idx = integrations.value.findIndex(i => i.id === selectedIntegration.value!.id)
    if (idx !== -1) {
      integrations.value[idx].status = selectedIntegration.value!.status === 'active' ? 'inactive' : 'active'
      selectedIntegration.value!.status = integrations.value[idx].status
    }
    integrationSaving.value = false
  }, 800)
}

const syncIntegration = () => {
  if (!selectedIntegration.value) return
  integrationSaving.value = true
  setTimeout(() => {
    const idx = integrations.value.findIndex(i => i.id === selectedIntegration.value!.id)
    if (idx !== -1) {
      const now = new Date()
      const ts = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`
      integrations.value[idx].lastSync = ts
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
  confirmTitle.value = 'Очистить кэш'
  confirmMessage.value = 'Будет очищен кэш приложения, шаблонов и маршрутов. Первые запросы после очистки могут выполняться медленнее.'
  confirmDone.value = false
  confirmResult.value = ''
  showConfirmModal.value = true
}

const openRestartQueues = () => {
  confirmAction.value = 'queues'
  confirmTitle.value = 'Перезапустить очереди'
  confirmMessage.value = 'Все задачи в очередях будут перезапущены. Выполняющиеся задачи будут прерваны и запущены заново.'
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
      confirmResult.value = 'Кэш успешно очищен. Удалено 156 МБ кэшированных данных.'
    } else {
      confirmResult.value = 'Очереди перезапущены. 3 воркера запущены, 12 задач в очереди.'
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
        'Улучшена производительность формирования отчётов',
        'Добавлена поддержка массового импорта деклараций',
        'Исправлена ошибка при расчёте утильсбора для категории "Электроника"',
        'Обновлены зависимости безопасности',
      ]
    }
  }, 2000)
}

// Backup download/restore
const downloadBackup = (backup: typeof recentBackups.value[0]) => {
  const blob = new Blob([`Резервная копия #${backup.id}\nДата: ${backup.date}\nРазмер: ${backup.size}\nТип: ${backup.type}\n\n[Имитация файла резервной копии]`], { type: 'application/octet-stream' })
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
    roleTitle="Администратор"
    userName="Иван Петров"
    :menuItems="menuItems"
  >
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Настройки системы</h1>
          <p class="text-gray-600 mt-1">Конфигурация и параметры системы</p>
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
          {{ isSaving ? 'Сохранение...' : 'Сохранить изменения' }}
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
            <h2 class="text-lg font-bold text-gray-900 mb-6">Общие настройки</h2>

            <div class="space-y-6">
              <div class="grid grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Название системы</label>
                  <input
                    v-model="generalSettings.systemName"
                    type="text"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Часовой пояс</label>
                  <select
                    v-model="generalSettings.timezone"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  >
                    <option value="Asia/Bishkek">Asia/Bishkek (UTC+6)</option>
                  </select>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Описание системы</label>
                <textarea
                  v-model="generalSettings.systemDescription"
                  rows="2"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                ></textarea>
              </div>

              <div class="grid grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Email поддержки</label>
                  <input
                    v-model="generalSettings.supportEmail"
                    type="email"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Телефон поддержки</label>
                  <input
                    v-model="generalSettings.supportPhone"
                    type="tel"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  />
                </div>
              </div>

              <div class="grid grid-cols-3 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Язык интерфейса</label>
                  <select
                    v-model="generalSettings.language"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  >
                    <option value="ru">Русский</option>
                    <option value="ky">Кыргызча</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Формат даты</label>
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
                  <label class="block text-sm font-medium text-gray-700 mb-2">Валюта</label>
                  <select
                    v-model="generalSettings.currency"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  >
                    <option value="KGS">Сом (с)</option>
                    <option value="USD">Доллар США ($)</option>
                    <option value="EUR">Евро (€)</option>
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Срок подачи деклараций (день месяца)</label>
                  <input
                    v-model="generalSettings.declarationDeadline"
                    type="number"
                    min="1"
                    max="31"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Срок подачи отчётов (день месяца)</label>
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
            <h2 class="text-lg font-bold text-gray-900 mb-6">Настройки безопасности</h2>

            <div class="space-y-6">
              <div class="grid grid-cols-3 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Таймаут сессии (минуты)</label>
                  <input
                    v-model="securitySettings.sessionTimeout"
                    type="number"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Макс. попыток входа</label>
                  <input
                    v-model="securitySettings.maxLoginAttempts"
                    type="number"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Блокировка (минуты)</label>
                  <input
                    v-model="securitySettings.lockoutDuration"
                    type="number"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  />
                </div>
              </div>

              <div class="border-t border-gray-200 pt-6">
                <h3 class="font-semibold text-gray-900 mb-4">Требования к паролю</h3>
                <div class="grid grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Минимальная длина</label>
                    <input
                      v-model="securitySettings.passwordMinLength"
                      type="number"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Срок действия (дни)</label>
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
                    <span class="text-gray-700">Требовать заглавные буквы</span>
                  </label>
                  <label class="flex items-center gap-3 cursor-pointer">
                    <input
                      v-model="securitySettings.requireNumbers"
                      type="checkbox"
                      class="w-5 h-5 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                    />
                    <span class="text-gray-700">Требовать цифры</span>
                  </label>
                  <label class="flex items-center gap-3 cursor-pointer">
                    <input
                      v-model="securitySettings.requireSpecialChars"
                      type="checkbox"
                      class="w-5 h-5 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                    />
                    <span class="text-gray-700">Требовать спецсимволы</span>
                  </label>
                  <label class="flex items-center gap-3 cursor-pointer">
                    <input
                      v-model="securitySettings.twoFactorRequired"
                      type="checkbox"
                      class="w-5 h-5 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                    />
                    <span class="text-gray-700">Обязательная двухфакторная аутентификация</span>
                  </label>
                </div>
              </div>

              <div class="border-t border-gray-200 pt-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">Белый список IP (по одному на строку)</label>
                <textarea
                  v-model="securitySettings.ipWhitelist"
                  rows="3"
                  placeholder="192.168.1.0/24&#10;10.0.0.0/8"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 font-mono text-sm"
                ></textarea>
                <p class="text-xs text-gray-500 mt-1">Оставьте пустым для разрешения всех IP</p>
              </div>
            </div>
          </div>

          <!-- Email Settings -->
          <div v-if="activeTab === 'email'" class="space-y-6">
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 class="text-lg font-bold text-gray-900 mb-6">Настройки SMTP</h2>

              <div class="space-y-6">
                <div class="grid grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">SMTP сервер</label>
                    <input
                      v-model="emailSettings.smtpHost"
                      type="text"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Порт</label>
                    <input
                      v-model="emailSettings.smtpPort"
                      type="number"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    />
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Имя пользователя</label>
                    <input
                      v-model="emailSettings.smtpUser"
                      type="text"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Пароль</label>
                    <input
                      v-model="emailSettings.smtpPassword"
                      type="password"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    />
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Имя отправителя</label>
                    <input
                      v-model="emailSettings.senderName"
                      type="text"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Email отправителя</label>
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
                    <span class="text-gray-700">Использовать TLS</span>
                  </label>
                  <button
                    @click="testEmailConnection"
                    class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    Тестовое письмо
                  </button>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 class="text-lg font-bold text-gray-900 mb-6">Уведомления по email</h2>

              <div class="grid grid-cols-2 gap-4">
                <label class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
                  <input
                    v-model="notificationSettings.newDeclaration"
                    type="checkbox"
                    class="w-5 h-5 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                  />
                  <span class="text-gray-700">Новые декларации</span>
                </label>
                <label class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
                  <input
                    v-model="notificationSettings.declarationApproved"
                    type="checkbox"
                    class="w-5 h-5 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                  />
                  <span class="text-gray-700">Одобренные декларации</span>
                </label>
                <label class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
                  <input
                    v-model="notificationSettings.declarationRejected"
                    type="checkbox"
                    class="w-5 h-5 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                  />
                  <span class="text-gray-700">Отклонённые декларации</span>
                </label>
                <label class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
                  <input
                    v-model="notificationSettings.reportDue"
                    type="checkbox"
                    class="w-5 h-5 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                  />
                  <span class="text-gray-700">Напоминания об отчётах</span>
                </label>
                <label class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
                  <input
                    v-model="notificationSettings.paymentReceived"
                    type="checkbox"
                    class="w-5 h-5 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                  />
                  <span class="text-gray-700">Поступления платежей</span>
                </label>
                <label class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
                  <input
                    v-model="notificationSettings.systemAlerts"
                    type="checkbox"
                    class="w-5 h-5 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                  />
                  <span class="text-gray-700">Системные уведомления</span>
                </label>
                <label class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
                  <input
                    v-model="notificationSettings.dailyDigest"
                    type="checkbox"
                    class="w-5 h-5 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                  />
                  <span class="text-gray-700">Ежедневная сводка</span>
                </label>
                <label class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
                  <input
                    v-model="notificationSettings.weeklyReport"
                    type="checkbox"
                    class="w-5 h-5 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                  />
                  <span class="text-gray-700">Еженедельный отчёт</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Integrations -->
          <div v-if="activeTab === 'integrations'" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 class="text-lg font-bold text-gray-900 mb-6">Внешние интеграции</h2>

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
                    <p class="text-xs text-gray-400 mt-1">Последняя синхронизация: {{ integration.lastSync }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <span :class="['px-3 py-1 rounded-full text-sm font-medium', getIntegrationStatusColor(integration.status)]">
                    {{ integration.status === 'active' ? 'Активно' : 'Отключено' }}
                  </span>
                  <button @click="openIntegrationModal(integration)" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors">
                    Настроить
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Backup -->
          <div v-if="activeTab === 'backup'" class="space-y-6">
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-lg font-bold text-gray-900">Резервное копирование</h2>
                <button
                  @click="createBackup"
                  class="px-4 py-2 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 transition-colors flex items-center gap-2"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Создать копию
                </button>
              </div>

              <div class="space-y-6">
                <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div class="flex items-center gap-3">
                    <span class="text-gray-700 font-medium">Автоматическое резервное копирование</span>
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

                <div class="grid grid-cols-3 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Частота</label>
                    <select
                      v-model="backupSettings.backupFrequency"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    >
                      <option value="hourly">Каждый час</option>
                      <option value="daily">Ежедневно</option>
                      <option value="weekly">Еженедельно</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Время</label>
                    <input
                      v-model="backupSettings.backupTime"
                      type="time"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Хранить (дней)</label>
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
                    <span class="text-gray-700">Включать файлы</span>
                  </label>
                  <label class="flex items-center gap-3 cursor-pointer">
                    <input
                      v-model="backupSettings.compression"
                      type="checkbox"
                      class="w-5 h-5 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                    />
                    <span class="text-gray-700">Сжатие</span>
                  </label>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 class="text-lg font-bold text-gray-900 mb-4">Последние резервные копии</h2>

              <table class="w-full">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Дата</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Размер</th>
                    <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Тип</th>
                    <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Статус</th>
                    <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Действия</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr v-for="backup in recentBackups" :key="backup.id" class="hover:bg-gray-50">
                    <td class="px-4 py-3 text-sm text-gray-900">{{ backup.date }}</td>
                    <td class="px-4 py-3 text-sm text-gray-600">{{ backup.size }}</td>
                    <td class="px-4 py-3 text-center">
                      <span :class="['text-xs px-2 py-1 rounded-full', backup.type === 'auto' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700']">
                        {{ backup.type === 'auto' ? 'Авто' : 'Вручную' }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-center">
                      <span class="text-green-600">✓</span>
                    </td>
                    <td class="px-4 py-3 text-center">
                      <div class="flex items-center justify-center gap-2">
                        <button @click="downloadBackup(backup)" class="p-1 text-gray-400 hover:text-rose-600 transition-colors" title="Скачать">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </button>
                        <button @click="openRestoreConfirm(backup)" class="p-1 text-gray-400 hover:text-rose-600 transition-colors" title="Восстановить">
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

          <!-- Maintenance -->
          <div v-if="activeTab === 'maintenance'" class="space-y-6">
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 class="text-lg font-bold text-gray-900 mb-6">Режим обслуживания</h2>

              <div class="space-y-6">
                <div class="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <div>
                    <p class="font-medium text-amber-800">Режим обслуживания</p>
                    <p class="text-sm text-amber-600">При включении пользователи не смогут войти в систему</p>
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
                  <label class="block text-sm font-medium text-gray-700 mb-2">Сообщение для пользователей</label>
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
                  <span class="text-gray-700">Разрешить вход администраторам</span>
                </label>

                <div class="grid grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Начало обслуживания</label>
                    <input
                      v-model="maintenanceMode.scheduledStart"
                      type="datetime-local"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Окончание обслуживания</label>
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
              <h2 class="text-lg font-bold text-gray-900 mb-6">Информация о системе</h2>

              <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div class="p-4 bg-gray-50 rounded-xl">
                  <p class="text-sm text-gray-500">Версия</p>
                  <p class="text-xl font-bold text-gray-900">{{ systemInfo.version }}</p>
                  <p class="text-xs text-gray-400">{{ systemInfo.buildDate }}</p>
                </div>
                <div class="p-4 bg-gray-50 rounded-xl">
                  <p class="text-sm text-gray-500">Аптайм</p>
                  <p class="text-xl font-bold text-green-600">{{ systemInfo.uptime }}</p>
                </div>
                <div class="p-4 bg-gray-50 rounded-xl">
                  <p class="text-sm text-gray-500">CPU</p>
                  <p class="text-xl font-bold text-gray-900">{{ systemInfo.cpuUsage }}</p>
                </div>
                <div class="p-4 bg-gray-50 rounded-xl">
                  <p class="text-sm text-gray-500">Память</p>
                  <p class="text-xl font-bold text-gray-900">{{ systemInfo.memoryUsage }}</p>
                </div>
              </div>

              <div class="mt-6 grid grid-cols-2 gap-4">
                <div class="p-4 border border-gray-200 rounded-xl">
                  <p class="text-sm text-gray-500">PHP</p>
                  <p class="font-medium text-gray-900">{{ systemInfo.phpVersion }}</p>
                </div>
                <div class="p-4 border border-gray-200 rounded-xl">
                  <p class="text-sm text-gray-500">База данных</p>
                  <p class="font-medium text-gray-900">{{ systemInfo.dbVersion }}</p>
                </div>
                <div class="p-4 border border-gray-200 rounded-xl">
                  <p class="text-sm text-gray-500">ОС сервера</p>
                  <p class="font-medium text-gray-900">{{ systemInfo.serverOS }}</p>
                </div>
                <div class="p-4 border border-gray-200 rounded-xl">
                  <p class="text-sm text-gray-500">Использование диска</p>
                  <p class="font-medium text-gray-900">{{ systemInfo.diskUsage }}</p>
                </div>
              </div>

              <div class="mt-6 flex gap-3">
                <button @click="openClearCache" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                  Очистить кэш
                </button>
                <button @click="openRestartQueues" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                  Перезапустить очереди
                </button>
                <button @click="checkUpdates" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                  Проверить обновления
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
                <h3 class="text-xl font-bold text-gray-900">Настройка интеграции</h3>
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
                <span class="text-gray-700 font-medium">Статус подключения</span>
                <span :class="['px-3 py-1 rounded-full text-sm font-medium', getIntegrationStatusColor(selectedIntegration.status)]">
                  {{ selectedIntegration.status === 'active' ? 'Активно' : 'Отключено' }}
                </span>
              </div>

              <div>
                <label class="text-sm text-gray-500">Последняя синхронизация</label>
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
                  {{ selectedIntegration.status === 'active' ? 'Отключить' : 'Включить' }}
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
                  Синхронизировать
                </button>
              </div>
            </div>

            <div class="p-6 border-t border-gray-200 flex justify-end">
              <button @click="showIntegrationModal = false" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                Закрыть
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
                <p class="text-sm text-amber-600 mt-3 p-3 bg-amber-50 rounded-lg">Вы уверены, что хотите продолжить?</p>
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
                  Отмена
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
                  {{ confirmProcessing ? 'Выполнение...' : 'Подтвердить' }}
                </button>
              </template>
              <template v-else>
                <button @click="showConfirmModal = false" class="px-4 py-2 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 transition-colors">
                  Готово
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
                <h3 class="text-xl font-bold text-gray-900">Проверка обновлений</h3>
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
                  <p class="text-gray-600">Проверка обновлений...</p>
                  <p class="text-sm text-gray-400 mt-1">Текущая версия: {{ systemInfo.version }}</p>
                </div>
              </template>
              <template v-else-if="updateResult">
                <template v-if="updateResult.hasUpdate">
                  <div class="p-4 bg-blue-50 border border-blue-200 rounded-xl mb-4">
                    <div class="flex items-center gap-2 mb-1">
                      <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span class="font-semibold text-blue-800">Доступно обновление</span>
                    </div>
                    <p class="text-blue-700">Версия {{ updateResult.version }}</p>
                  </div>
                  <h4 class="font-medium text-gray-900 mb-2">Что нового:</h4>
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
                    <p class="font-medium text-gray-900">Система обновлена</p>
                    <p class="text-sm text-gray-500 mt-1">Версия {{ systemInfo.version }} — последняя</p>
                  </div>
                </template>
              </template>
            </div>

            <div class="p-6 border-t border-gray-200 flex justify-end">
              <button @click="showUpdateModal = false" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                Закрыть
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
              <h3 class="text-xl font-bold text-gray-900">Восстановление из копии</h3>
            </div>

            <div class="p-6">
              <template v-if="!restoreDone">
                <div v-if="restoreTarget" class="p-4 bg-gray-50 rounded-xl mb-4">
                  <p class="text-sm text-gray-500">Копия от</p>
                  <p class="font-medium text-gray-900">{{ restoreTarget.date }}</p>
                  <p class="text-sm text-gray-500 mt-1">Размер: {{ restoreTarget.size }}</p>
                </div>
                <div class="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p class="text-sm text-red-700 font-medium">Внимание! Текущие данные будут заменены данными из резервной копии. Это действие необратимо.</p>
                </div>
              </template>
              <template v-else>
                <div class="text-center py-4">
                  <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p class="font-medium text-gray-900">Восстановление завершено</p>
                  <p class="text-sm text-gray-500 mt-1">Данные успешно восстановлены из копии от {{ restoreTarget?.date }}</p>
                </div>
              </template>
            </div>

            <div class="p-6 border-t border-gray-200 flex justify-end gap-3">
              <template v-if="!restoreDone">
                <button @click="showRestoreConfirm = false" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                  Отмена
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
                  {{ restoring ? 'Восстановление...' : 'Восстановить' }}
                </button>
              </template>
              <template v-else>
                <button @click="showRestoreConfirm = false" class="px-4 py-2 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 transition-colors">
                  Готово
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
