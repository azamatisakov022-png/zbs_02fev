<script setup lang="ts">
import { ref, computed } from 'vue'
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

interface AuditEntry {
  id: number
  timestamp: string
  user: string
  userRole: string
  action: string
  actionType: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'view' | 'export' | 'import'
  entity: string
  entityId: string
  ipAddress: string
  details: string
  status: 'success' | 'warning' | 'error'
}

const auditLog = ref<AuditEntry[]>([
  { id: 1, timestamp: '2025-02-03 14:32:15', user: 'Иванов И.И.', userRole: 'admin', action: 'Изменение ставки', actionType: 'update', entity: 'Ставки утильсбора', entityId: 'RATE-2025-001', ipAddress: '192.168.1.100', details: 'Изменена ставка для категории "Пластик" с 450 на 480 сом/кг', status: 'success' },
  { id: 2, timestamp: '2025-02-03 14:28:43', user: 'Петрова А.С.', userRole: 'employee', action: 'Одобрение декларации', actionType: 'update', entity: 'Декларации', entityId: 'DEC-2025-0234', ipAddress: '192.168.1.105', details: 'Декларация ОсОО "КыргызЭко" одобрена', status: 'success' },
  { id: 3, timestamp: '2025-02-03 14:15:22', user: 'Система', userRole: 'system', action: 'Автоматический импорт', actionType: 'import', entity: 'Курсы валют', entityId: 'IMPORT-FX-0203', ipAddress: '127.0.0.1', details: 'Импортированы курсы валют НБКР на 03.02.2025', status: 'success' },
  { id: 4, timestamp: '2025-02-03 13:58:10', user: 'Сидоров К.М.', userRole: 'business', action: 'Вход в систему', actionType: 'login', entity: 'Сессии', entityId: 'SESSION-98234', ipAddress: '85.117.23.45', details: 'Успешный вход с нового устройства', status: 'warning' },
  { id: 5, timestamp: '2025-02-03 13:45:33', user: 'Алиева Д.Н.', userRole: 'employee', action: 'Экспорт отчёта', actionType: 'export', entity: 'Отчёты', entityId: 'REP-2025-Q4-SUMM', ipAddress: '192.168.1.108', details: 'Экспортирован сводный отчёт за Q4 2024 в Excel', status: 'success' },
  { id: 6, timestamp: '2025-02-03 13:22:18', user: 'Иванов И.И.', userRole: 'admin', action: 'Создание пользователя', actionType: 'create', entity: 'Пользователи', entityId: 'USER-5234', ipAddress: '192.168.1.100', details: 'Создан новый сотрудник: Нурланова А.К.', status: 'success' },
  { id: 7, timestamp: '2025-02-03 12:55:07', user: 'Касымов Р.Т.', userRole: 'eco-operator', action: 'Отклонение отчёта', actionType: 'update', entity: 'Отчёты переработчиков', entityId: 'REC-REP-0189', ipAddress: '10.0.0.55', details: 'Отчёт отклонён: несоответствие данных по объёмам', status: 'warning' },
  { id: 8, timestamp: '2025-02-03 12:30:44', user: 'Петрова А.С.', userRole: 'employee', action: 'Удаление записи', actionType: 'delete', entity: 'Справочник отходов', entityId: 'WASTE-CODE-9999', ipAddress: '192.168.1.105', details: 'Удалён тестовый код отхода', status: 'success' },
  { id: 9, timestamp: '2025-02-03 11:45:21', user: 'ОсОО "БишкекРесайкл"', userRole: 'business', action: 'Неудачная попытка входа', actionType: 'login', entity: 'Сессии', entityId: 'SESSION-FAIL-234', ipAddress: '91.185.10.22', details: 'Неверный пароль (попытка 3 из 5)', status: 'error' },
  { id: 10, timestamp: '2025-02-03 11:20:55', user: 'Система', userRole: 'system', action: 'Резервное копирование', actionType: 'export', entity: 'База данных', entityId: 'BACKUP-20250203', ipAddress: '127.0.0.1', details: 'Создана резервная копия БД (размер: 2.4 ГБ)', status: 'success' },
  { id: 11, timestamp: '2025-02-03 10:55:12', user: 'Иванов И.И.', userRole: 'admin', action: 'Изменение настроек', actionType: 'update', entity: 'Системные настройки', entityId: 'CONFIG-EMAIL', ipAddress: '192.168.1.100', details: 'Обновлены настройки SMTP сервера', status: 'success' },
  { id: 12, timestamp: '2025-02-03 10:30:08', user: 'Нурланова А.К.', userRole: 'employee', action: 'Просмотр организации', actionType: 'view', entity: 'Организации', entityId: 'ORG-1234', ipAddress: '192.168.1.112', details: 'Просмотр карточки ОсОО "ЭкоТранс"', status: 'success' },
])

// Filters
const dateFrom = ref('2025-02-01')
const dateTo = ref('2025-02-03')
const selectedUser = ref('')
const selectedAction = ref('')
const selectedEntity = ref('')
const selectedStatus = ref('')
const searchQuery = ref('')

const actionTypes = [
  { value: 'create', label: 'Создание' },
  { value: 'update', label: 'Изменение' },
  { value: 'delete', label: 'Удаление' },
  { value: 'login', label: 'Вход' },
  { value: 'logout', label: 'Выход' },
  { value: 'view', label: 'Просмотр' },
  { value: 'export', label: 'Экспорт' },
  { value: 'import', label: 'Импорт' },
]

const entities = [
  'Пользователи',
  'Организации',
  'Декларации',
  'Отчёты',
  'Ставки утильсбора',
  'Справочники',
  'Системные настройки',
  'Сессии',
]

const statuses = [
  { value: 'success', label: 'Успешно' },
  { value: 'warning', label: 'Предупреждение' },
  { value: 'error', label: 'Ошибка' },
]

const filteredLog = computed(() => {
  return auditLog.value.filter(entry => {
    if (selectedAction.value && entry.actionType !== selectedAction.value) return false
    if (selectedEntity.value && entry.entity !== selectedEntity.value) return false
    if (selectedStatus.value && entry.status !== selectedStatus.value) return false
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      return entry.user.toLowerCase().includes(q) ||
        entry.action.toLowerCase().includes(q) ||
        entry.details.toLowerCase().includes(q) ||
        entry.entityId.toLowerCase().includes(q)
    }
    return true
  })
})

// Stats
const stats = computed(() => ({
  total: auditLog.value.length,
  success: auditLog.value.filter(e => e.status === 'success').length,
  warnings: auditLog.value.filter(e => e.status === 'warning').length,
  errors: auditLog.value.filter(e => e.status === 'error').length,
}))

const getActionTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    create: 'bg-green-100 text-green-700',
    update: 'bg-blue-100 text-blue-700',
    delete: 'bg-red-100 text-red-700',
    login: 'bg-purple-100 text-purple-700',
    logout: 'bg-gray-100 text-gray-700',
    view: 'bg-slate-100 text-slate-700',
    export: 'bg-amber-100 text-amber-700',
    import: 'bg-cyan-100 text-cyan-700',
  }
  return colors[type] || 'bg-gray-100 text-gray-700'
}

const getActionTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    create: 'Создание',
    update: 'Изменение',
    delete: 'Удаление',
    login: 'Вход',
    logout: 'Выход',
    view: 'Просмотр',
    export: 'Экспорт',
    import: 'Импорт',
  }
  return labels[type] || type
}

const getStatusIcon = (status: string) => {
  if (status === 'success') return '✓'
  if (status === 'warning') return '!'
  return '✕'
}

const getStatusColor = (status: string) => {
  if (status === 'success') return 'text-green-600 bg-green-100'
  if (status === 'warning') return 'text-amber-600 bg-amber-100'
  return 'text-red-600 bg-red-100'
}

const getRoleColor = (role: string) => {
  const colors: Record<string, string> = {
    admin: 'bg-rose-100 text-rose-700',
    employee: 'bg-sky-100 text-sky-700',
    business: 'bg-emerald-100 text-emerald-700',
    'eco-operator': 'bg-lime-100 text-lime-700',
    system: 'bg-slate-100 text-slate-700',
  }
  return colors[role] || 'bg-gray-100 text-gray-700'
}

const getRoleLabel = (role: string) => {
  const labels: Record<string, string> = {
    admin: 'Админ',
    employee: 'Сотрудник',
    business: 'Плательщик',
    'eco-operator': 'Эко-оператор',
    system: 'Система',
  }
  return labels[role] || role
}

// Detail modal
const showDetailModal = ref(false)
const selectedEntry = ref<AuditEntry | null>(null)

const openDetail = (entry: AuditEntry) => {
  selectedEntry.value = entry
  showDetailModal.value = true
}

// Export audit log to CSV
const exportAuditLog = () => {
  const bom = '\uFEFF'
  let csv = bom + 'ID;Дата и время;Пользователь;Роль;Тип действия;Действие;Объект;ID объекта;IP адрес;Детали;Статус\n'
  filteredLog.value.forEach(e => {
    csv += `${e.id};${e.timestamp};${e.user};${getRoleLabel(e.userRole)};${getActionTypeLabel(e.actionType)};${e.action};${e.entity};${e.entityId};${e.ipAddress};"${e.details}";${e.status === 'success' ? 'Успешно' : e.status === 'warning' ? 'Предупреждение' : 'Ошибка'}\n`
  })
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `audit_log_${dateFrom.value}_${dateTo.value}.csv`
  a.click()
  URL.revokeObjectURL(url)
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
          <h1 class="text-2xl font-bold text-gray-900">Журнал действий</h1>
          <p class="text-gray-600 mt-1">Аудит всех операций в системе</p>
        </div>
        <div class="flex items-center gap-3">
          <button @click="exportAuditLog" class="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Экспорт журнала
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">Всего записей</p>
              <p class="text-2xl font-bold text-gray-900 mt-1">{{ stats.total.toLocaleString() }}</p>
            </div>
            <div class="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">Успешных</p>
              <p class="text-2xl font-bold text-green-600 mt-1">{{ stats.success }}</p>
            </div>
            <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">Предупреждений</p>
              <p class="text-2xl font-bold text-amber-600 mt-1">{{ stats.warnings }}</p>
            </div>
            <div class="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">Ошибок</p>
              <p class="text-2xl font-bold text-red-600 mt-1">{{ stats.errors }}</p>
            </div>
            <div class="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div class="grid grid-cols-1 md:grid-cols-6 gap-4">
          <!-- Date Range -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">С даты</label>
            <input
              v-model="dateFrom"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">По дату</label>
            <input
              v-model="dateTo"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
            />
          </div>

          <!-- Action Type -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Тип действия</label>
            <select
              v-model="selectedAction"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
            >
              <option value="">Все типы</option>
              <option v-for="action in actionTypes" :key="action.value" :value="action.value">
                {{ action.label }}
              </option>
            </select>
          </div>

          <!-- Entity -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Объект</label>
            <select
              v-model="selectedEntity"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
            >
              <option value="">Все объекты</option>
              <option v-for="entity in entities" :key="entity" :value="entity">
                {{ entity }}
              </option>
            </select>
          </div>

          <!-- Status -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Статус</label>
            <select
              v-model="selectedStatus"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
            >
              <option value="">Все статусы</option>
              <option v-for="status in statuses" :key="status.value" :value="status.value">
                {{ status.label }}
              </option>
            </select>
          </div>

          <!-- Search -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Поиск</label>
            <div class="relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Поиск..."
                class="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Audit Log Table -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Время</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Пользователь</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Действие</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Объект</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Детали</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Статус</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Действия</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="entry in filteredLog" :key="entry.id" class="hover:bg-gray-50">
                <td class="px-4 py-3">
                  <div class="text-sm text-gray-900 font-medium">{{ entry.timestamp.split(' ')[1] }}</div>
                  <div class="text-xs text-gray-500">{{ entry.timestamp.split(' ')[0] }}</div>
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <div>
                      <div class="text-sm font-medium text-gray-900">{{ entry.user }}</div>
                      <span :class="['text-xs px-1.5 py-0.5 rounded', getRoleColor(entry.userRole)]">
                        {{ getRoleLabel(entry.userRole) }}
                      </span>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <span :class="['text-xs px-2 py-1 rounded-full font-medium', getActionTypeColor(entry.actionType)]">
                      {{ getActionTypeLabel(entry.actionType) }}
                    </span>
                  </div>
                  <div class="text-sm text-gray-700 mt-1">{{ entry.action }}</div>
                </td>
                <td class="px-4 py-3">
                  <div class="text-sm text-gray-900">{{ entry.entity }}</div>
                  <div class="text-xs text-gray-500 font-mono">{{ entry.entityId }}</div>
                </td>
                <td class="px-4 py-3">
                  <div class="text-sm text-gray-600 max-w-xs truncate" :title="entry.details">
                    {{ entry.details }}
                  </div>
                </td>
                <td class="px-4 py-3 text-center">
                  <span :class="['inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold', getStatusColor(entry.status)]">
                    {{ getStatusIcon(entry.status) }}
                  </span>
                </td>
                <td class="px-4 py-3 text-center">
                  <button
                    @click="openDetail(entry)"
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#3B82F6] text-white hover:bg-[#2563EB] transition-colors shadow-sm"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Подробнее
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <p class="text-sm text-gray-500">Показано {{ filteredLog.length }} записей</p>
          <div class="flex items-center gap-2">
            <button class="px-3 py-1 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">Назад</button>
            <button class="px-3 py-1 bg-rose-600 text-white rounded-lg">1</button>
            <button class="px-3 py-1 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">2</button>
            <button class="px-3 py-1 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">3</button>
            <button class="px-3 py-1 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">Далее</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <Teleport to="body">
      <div v-if="showDetailModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          <div class="p-6 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <h3 class="text-xl font-bold text-gray-900">Детали записи</h3>
              <button @click="showDetailModal = false" class="p-2 text-gray-400 hover:text-gray-600">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div v-if="selectedEntry" class="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-130px)]">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-sm text-gray-500">ID записи</label>
                <p class="font-mono text-gray-900">#{{ selectedEntry.id }}</p>
              </div>
              <div>
                <label class="text-sm text-gray-500">Дата и время</label>
                <p class="text-gray-900">{{ selectedEntry.timestamp }}</p>
              </div>
              <div>
                <label class="text-sm text-gray-500">Пользователь</label>
                <p class="text-gray-900">{{ selectedEntry.user }}</p>
              </div>
              <div>
                <label class="text-sm text-gray-500">Роль</label>
                <span :class="['text-xs px-2 py-1 rounded', getRoleColor(selectedEntry.userRole)]">
                  {{ getRoleLabel(selectedEntry.userRole) }}
                </span>
              </div>
              <div>
                <label class="text-sm text-gray-500">IP адрес</label>
                <p class="font-mono text-gray-900">{{ selectedEntry.ipAddress }}</p>
              </div>
              <div>
                <label class="text-sm text-gray-500">Статус</label>
                <span :class="['inline-flex items-center gap-1 text-sm px-2 py-1 rounded', getStatusColor(selectedEntry.status)]">
                  {{ getStatusIcon(selectedEntry.status) }}
                  {{ selectedEntry.status === 'success' ? 'Успешно' : selectedEntry.status === 'warning' ? 'Предупреждение' : 'Ошибка' }}
                </span>
              </div>
              <div>
                <label class="text-sm text-gray-500">Тип действия</label>
                <span :class="['text-xs px-2 py-1 rounded-full font-medium', getActionTypeColor(selectedEntry.actionType)]">
                  {{ getActionTypeLabel(selectedEntry.actionType) }}
                </span>
              </div>
              <div>
                <label class="text-sm text-gray-500">Действие</label>
                <p class="text-gray-900">{{ selectedEntry.action }}</p>
              </div>
              <div>
                <label class="text-sm text-gray-500">Объект</label>
                <p class="text-gray-900">{{ selectedEntry.entity }}</p>
              </div>
              <div>
                <label class="text-sm text-gray-500">ID объекта</label>
                <p class="font-mono text-rose-600">{{ selectedEntry.entityId }}</p>
              </div>
            </div>

            <div>
              <label class="text-sm text-gray-500">Подробности</label>
              <p class="text-gray-900 mt-1 p-3 bg-gray-50 rounded-lg">{{ selectedEntry.details }}</p>
            </div>
          </div>

          <div class="p-6 border-t border-gray-200 flex justify-end">
            <button
              @click="showDetailModal = false"
              class="px-4 py-2 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 transition-colors"
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </DashboardLayout>
</template>
