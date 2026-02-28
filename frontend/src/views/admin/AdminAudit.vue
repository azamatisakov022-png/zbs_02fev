<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import EmptyState from '../../components/dashboard/EmptyState.vue'
import { AppButton } from '../../components/ui'
import { useAdminMenu } from '../../composables/useRoleMenu'

const { roleTitle, menuItems } = useAdminMenu()
const { t } = useI18n()

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
  { id: 3, timestamp: '2025-02-03 14:15:22', user: 'Система', userRole: 'system', action: 'Автоматический импорт', actionType: 'import', entity: 'Справочники', entityId: 'IMPORT-FX-0203', ipAddress: '127.0.0.1', details: 'Импортированы курсы валют НБКР на 03.02.2025', status: 'success' },
  { id: 4, timestamp: '2025-02-03 13:58:10', user: 'Сидоров К.М.', userRole: 'business', action: 'Вход в систему', actionType: 'login', entity: 'Сессии', entityId: 'SESSION-98234', ipAddress: '85.117.23.45', details: 'Успешный вход с нового устройства', status: 'warning' },
  { id: 5, timestamp: '2025-02-03 13:45:33', user: 'Алиева Д.Н.', userRole: 'employee', action: 'Экспорт отчёта', actionType: 'export', entity: 'Отчёты', entityId: 'REP-2025-Q4-SUMM', ipAddress: '192.168.1.108', details: 'Экспортирован сводный отчёт за Q4 2024 в Excel', status: 'success' },
  { id: 6, timestamp: '2025-02-03 13:22:18', user: 'Иванов И.И.', userRole: 'admin', action: 'Создание пользователя', actionType: 'create', entity: 'Пользователи', entityId: 'USER-5234', ipAddress: '192.168.1.100', details: 'Создан новый сотрудник: Нурланова А.К.', status: 'success' },
  { id: 7, timestamp: '2025-02-03 12:55:07', user: 'Касымов Р.Т.', userRole: 'eco-operator', action: 'Отклонение отчёта', actionType: 'update', entity: 'Отчёты', entityId: 'REC-REP-0189', ipAddress: '10.0.0.55', details: 'Отчёт отклонён: несоответствие данных по объёмам переработки', status: 'warning' },
  { id: 8, timestamp: '2025-02-03 12:30:44', user: 'Петрова А.С.', userRole: 'employee', action: 'Удаление записи', actionType: 'delete', entity: 'Справочники', entityId: 'WASTE-CODE-9999', ipAddress: '192.168.1.105', details: 'Удалён тестовый код отхода из справочника', status: 'success' },
  { id: 9, timestamp: '2025-02-03 11:45:21', user: 'ОсОО "БишкекРесайкл"', userRole: 'business', action: 'Неудачная попытка входа', actionType: 'login', entity: 'Сессии', entityId: 'SESSION-FAIL-234', ipAddress: '91.185.10.22', details: 'Неверный пароль (попытка 3 из 5)', status: 'error' },
  { id: 10, timestamp: '2025-02-03 11:20:55', user: 'Система', userRole: 'system', action: 'Резервное копирование', actionType: 'export', entity: 'Системные настройки', entityId: 'BACKUP-20250203', ipAddress: '127.0.0.1', details: 'Создана резервная копия БД (размер: 2.4 ГБ)', status: 'success' },
  { id: 11, timestamp: '2025-02-03 10:55:12', user: 'Иванов И.И.', userRole: 'admin', action: 'Изменение настроек', actionType: 'update', entity: 'Системные настройки', entityId: 'CONFIG-EMAIL', ipAddress: '192.168.1.100', details: 'Обновлены настройки SMTP сервера', status: 'success' },
  { id: 12, timestamp: '2025-02-03 10:30:08', user: 'Нурланова А.К.', userRole: 'employee', action: 'Просмотр организации', actionType: 'view', entity: 'Организации', entityId: 'ORG-1234', ipAddress: '192.168.1.112', details: 'Просмотр карточки ОсОО "ЭкоТранс"', status: 'success' },
  { id: 13, timestamp: '2025-02-03 10:05:44', user: 'Касымов Р.Т.', userRole: 'eco-operator', action: 'Создание отчёта', actionType: 'create', entity: 'Отчёты', entityId: 'REC-REP-0190', ipAddress: '10.0.0.55', details: 'Создан отчёт о переработке за январь 2025 для ОсОО "ЭкоПласт"', status: 'success' },
  { id: 14, timestamp: '2025-02-03 09:48:31', user: 'Алиева Д.Н.', userRole: 'employee', action: 'Импорт данных', actionType: 'import', entity: 'Организации', entityId: 'IMPORT-ORG-0045', ipAddress: '192.168.1.108', details: 'Импортировано 23 организации из реестра ГНС КР', status: 'success' },
  { id: 15, timestamp: '2025-02-03 09:30:17', user: 'Система', userRole: 'system', action: 'Автоматическая проверка', actionType: 'view', entity: 'Лицензии', entityId: 'LIC-CHECK-0203', ipAddress: '127.0.0.1', details: 'Проверка сроков действия лицензий: 3 истекают в течение 30 дней', status: 'warning' },
  { id: 16, timestamp: '2025-02-03 09:15:02', user: 'Сидоров К.М.', userRole: 'business', action: 'Создание декларации', actionType: 'create', entity: 'Декларации', entityId: 'DEC-2025-0235', ipAddress: '85.117.23.45', details: 'Подана декларация ОсОО "АлаТоо Трейд" за январь 2025', status: 'success' },
  { id: 17, timestamp: '2025-02-03 08:55:49', user: 'Нурланова А.К.', userRole: 'employee', action: 'Просмотр расчёта', actionType: 'view', entity: 'Расчёты', entityId: 'CALC-2025-0087', ipAddress: '192.168.1.112', details: 'Просмотр расчёта утильсбора для ОсОО "Южный Экспресс"', status: 'success' },
  { id: 18, timestamp: '2025-02-03 08:30:25', user: 'Иванов И.И.', userRole: 'admin', action: 'Обновление роли', actionType: 'update', entity: 'Пользователи', entityId: 'USER-4201', ipAddress: '192.168.1.100', details: 'Пользователю Касымов Р.Т. назначена роль "Старший эко-оператор"', status: 'success' },
  { id: 19, timestamp: '2025-02-03 08:12:03', user: 'Петрова А.С.', userRole: 'employee', action: 'Выход из системы', actionType: 'logout', entity: 'Сессии', entityId: 'SESSION-97801', ipAddress: '192.168.1.105', details: 'Завершение рабочей сессии', status: 'success' },
  { id: 20, timestamp: '2025-02-02 18:45:38', user: 'Система', userRole: 'system', action: 'Автоматический расчёт', actionType: 'create', entity: 'Расчёты', entityId: 'CALC-BATCH-0202', ipAddress: '127.0.0.1', details: 'Пакетный расчёт утильсбора: обработано 145 деклараций', status: 'success' },
  { id: 21, timestamp: '2025-02-02 17:30:12', user: 'Алиева Д.Н.', userRole: 'employee', action: 'Удаление дубликата', actionType: 'delete', entity: 'Организации', entityId: 'ORG-2087', ipAddress: '192.168.1.108', details: 'Удалена дублирующая запись ОсОО "НарынЭкоСервис"', status: 'success' },
  { id: 22, timestamp: '2025-02-02 16:55:44', user: 'ОсОО "КыргызЭко"', userRole: 'business', action: 'Экспорт квитанции', actionType: 'export', entity: 'Расчёты', entityId: 'PAY-2025-0112', ipAddress: '212.42.105.18', details: 'Экспортирована квитанция на оплату утильсбора за декабрь 2024', status: 'success' },
  { id: 23, timestamp: '2025-02-02 16:20:09', user: 'Иванов И.И.', userRole: 'admin', action: 'Изменение ставки', actionType: 'update', entity: 'Ставки утильсбора', entityId: 'RATE-2025-002', ipAddress: '192.168.1.100', details: 'Изменена ставка для категории "Стекло" с 120 на 135 сом/кг', status: 'success' },
  { id: 24, timestamp: '2025-02-02 15:48:33', user: 'Касымов Р.Т.', userRole: 'eco-operator', action: 'Просмотр лицензии', actionType: 'view', entity: 'Лицензии', entityId: 'LIC-ECO-0078', ipAddress: '10.0.0.55', details: 'Просмотр лицензии эко-оператора ОсОО "Зелёная Долина"', status: 'success' },
  { id: 25, timestamp: '2025-02-02 15:10:58', user: 'Нурланова А.К.', userRole: 'employee', action: 'Создание организации', actionType: 'create', entity: 'Организации', entityId: 'ORG-2088', ipAddress: '192.168.1.112', details: 'Зарегистрирована организация ОсОО "Иссык-Куль Ресурс"', status: 'success' },
  { id: 26, timestamp: '2025-02-02 14:35:21', user: 'Система', userRole: 'system', action: 'Ошибка синхронизации', actionType: 'import', entity: 'Справочники', entityId: 'SYNC-ERR-0202', ipAddress: '127.0.0.1', details: 'Ошибка при синхронизации справочника ОКВЭД: таймаут соединения', status: 'error' },
  { id: 27, timestamp: '2025-02-02 14:00:47', user: 'Петрова А.С.', userRole: 'employee', action: 'Отклонение декларации', actionType: 'update', entity: 'Декларации', entityId: 'DEC-2025-0229', ipAddress: '192.168.1.105', details: 'Декларация ОсОО "Ош-Сервис" отклонена: недостаточно документов', status: 'warning' },
  { id: 28, timestamp: '2025-02-02 13:25:14', user: 'Сидоров К.М.', userRole: 'business', action: 'Просмотр декларации', actionType: 'view', entity: 'Декларации', entityId: 'DEC-2025-0220', ipAddress: '85.117.23.45', details: 'Просмотр статуса декларации ОсОО "АлаТоо Трейд"', status: 'success' },
  { id: 29, timestamp: '2025-02-02 12:50:36', user: 'Иванов И.И.', userRole: 'admin', action: 'Удаление пользователя', actionType: 'delete', entity: 'Пользователи', entityId: 'USER-3019', ipAddress: '192.168.1.100', details: 'Деактивирована учётная запись уволенного сотрудника Жумабекова Б.А.', status: 'success' },
  { id: 30, timestamp: '2025-02-02 12:15:03', user: 'Алиева Д.Н.', userRole: 'employee', action: 'Вход в систему', actionType: 'login', entity: 'Сессии', entityId: 'SESSION-97650', ipAddress: '192.168.1.108', details: 'Успешный вход в систему', status: 'success' },
  { id: 31, timestamp: '2025-02-02 11:40:28', user: 'Касымов Р.Т.', userRole: 'eco-operator', action: 'Экспорт отчёта', actionType: 'export', entity: 'Отчёты', entityId: 'REC-REP-SUMM-Q4', ipAddress: '10.0.0.55', details: 'Экспортирован сводный отчёт эко-оператора за 4-й квартал 2024', status: 'success' },
  { id: 32, timestamp: '2025-02-02 10:55:51', user: 'ОсОО "Бишкек Пласт"', userRole: 'business', action: 'Неудачная попытка входа', actionType: 'login', entity: 'Сессии', entityId: 'SESSION-FAIL-235', ipAddress: '195.38.160.10', details: 'Учётная запись временно заблокирована (5 неудачных попыток)', status: 'error' },
  { id: 33, timestamp: '2025-02-02 10:20:14', user: 'Система', userRole: 'system', action: 'Обновление справочника', actionType: 'update', entity: 'Справочники', entityId: 'REF-WASTE-UPD', ipAddress: '127.0.0.1', details: 'Обновлён справочник кодов отходов: добавлено 8 новых позиций', status: 'success' },
  { id: 34, timestamp: '2025-02-01 17:45:09', user: 'Иванов И.И.', userRole: 'admin', action: 'Изменение настроек', actionType: 'update', entity: 'Системные настройки', entityId: 'CONFIG-BACKUP', ipAddress: '192.168.1.100', details: 'Изменено расписание резервного копирования: ежедневно в 03:00', status: 'success' },
  { id: 35, timestamp: '2025-02-01 16:30:42', user: 'Нурланова А.К.', userRole: 'employee', action: 'Одобрение декларации', actionType: 'update', entity: 'Декларации', entityId: 'DEC-2025-0218', ipAddress: '192.168.1.112', details: 'Декларация ОсОО "Токмок Индастри" одобрена после доработки', status: 'success' },
  { id: 36, timestamp: '2025-02-01 15:10:28', user: 'Петрова А.С.', userRole: 'employee', action: 'Создание расчёта', actionType: 'create', entity: 'Расчёты', entityId: 'CALC-2025-0086', ipAddress: '192.168.1.105', details: 'Создан расчёт утильсбора для ОсОО "Каракол ЭкоГрупп" на сумму 84 500 сом', status: 'success' },
  { id: 37, timestamp: '2025-02-01 14:25:55', user: 'Касымов Р.Т.', userRole: 'eco-operator', action: 'Импорт данных переработки', actionType: 'import', entity: 'Отчёты', entityId: 'IMPORT-REC-0134', ipAddress: '10.0.0.55', details: 'Импортированы данные о переработке за январь 2025: 56 записей', status: 'success' },
  { id: 38, timestamp: '2025-02-01 13:00:19', user: 'Система', userRole: 'system', action: 'Уведомление о задолженности', actionType: 'create', entity: 'Расчёты', entityId: 'NOTIFY-DEBT-0201', ipAddress: '127.0.0.1', details: 'Отправлено 12 уведомлений о просроченных платежах утильсбора', status: 'success' },
  { id: 39, timestamp: '2025-02-01 11:35:47', user: 'Алиева Д.Н.', userRole: 'employee', action: 'Удаление документа', actionType: 'delete', entity: 'Декларации', entityId: 'DEC-2025-DRAFT-009', ipAddress: '192.168.1.108', details: 'Удалён черновик декларации ОсОО "Джалал-Абад Сервис"', status: 'success' },
  { id: 40, timestamp: '2025-02-01 10:15:33', user: 'Иванов И.И.', userRole: 'admin', action: 'Создание роли', actionType: 'create', entity: 'Пользователи', entityId: 'ROLE-NEW-007', ipAddress: '192.168.1.100', details: 'Создана новая роль "Аудитор" с правами на просмотр журнала действий', status: 'success' },
])

// Filters
const dateFrom = ref('2025-02-01')
const dateTo = ref('2025-02-03')
const selectedUser = ref('')
const selectedAction = ref('')
const selectedEntity = ref('')
const selectedStatus = ref('')
const searchQuery = ref('')

const actionTypes = computed(() => [
  { value: 'create', label: t('audit.actionCreate') },
  { value: 'update', label: t('audit.actionUpdate') },
  { value: 'delete', label: t('audit.actionDelete') },
  { value: 'login', label: t('audit.actionLogin') },
  { value: 'logout', label: t('audit.actionLogout') },
  { value: 'view', label: t('audit.actionView') },
  { value: 'export', label: t('audit.actionExport') },
  { value: 'import', label: t('audit.actionImport') },
])

const entities = computed(() => [
  t('audit.entityUsers'),
  t('audit.entityOrgs'),
  t('audit.entityDeclarations'),
  t('audit.entityReports'),
  t('audit.entityRates'),
  t('audit.entityReferences'),
  t('audit.entitySettings'),
  t('audit.entitySessions'),
  t('audit.entityCalculations'),
  t('audit.entityLicenses'),
])

const statuses = computed(() => [
  { value: 'success', label: t('audit.statusSuccess') },
  { value: 'warning', label: t('audit.statusWarning') },
  { value: 'error', label: t('audit.statusError') },
])

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

// Pagination
const itemsPerPage = ref(15)
const currentPage = ref(1)

const totalPages = computed(() => Math.ceil(filteredLog.value.length / itemsPerPage.value))

const paginatedLog = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredLog.value.slice(start, end)
})

const paginationStart = computed(() => {
  if (filteredLog.value.length === 0) return 0
  return (currentPage.value - 1) * itemsPerPage.value + 1
})

const paginationEnd = computed(() => {
  const end = currentPage.value * itemsPerPage.value
  return end > filteredLog.value.length ? filteredLog.value.length : end
})

const pageNumbers = computed(() => {
  const pages: number[] = []
  for (let i = 1; i <= totalPages.value; i++) {
    pages.push(i)
  }
  return pages
})

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

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
    create: t('audit.actionCreate'),
    update: t('audit.actionUpdate'),
    delete: t('audit.actionDelete'),
    login: t('audit.actionLogin'),
    logout: t('audit.actionLogout'),
    view: t('audit.actionView'),
    export: t('audit.actionExport'),
    import: t('audit.actionImport'),
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
    admin: t('audit.roleAdmin'),
    employee: t('audit.roleEmployee'),
    business: t('audit.roleBusiness'),
    'eco-operator': t('audit.roleEcoOperator'),
    system: t('audit.roleSystem'),
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
  let csv = bom + `${t('audit.csvId')};${t('audit.csvDateTime')};${t('audit.csvUser')};${t('audit.csvRole')};${t('audit.csvActionType')};${t('audit.csvAction')};${t('audit.csvObject')};${t('audit.csvObjectId')};${t('audit.csvIpAddress')};${t('audit.csvDetails')};${t('audit.csvStatus')}\n`
  filteredLog.value.forEach(e => {
    csv += `${e.id};${e.timestamp};${e.user};${getRoleLabel(e.userRole)};${getActionTypeLabel(e.actionType)};${e.action};${e.entity};${e.entityId};${e.ipAddress};"${e.details}";${e.status === 'success' ? t('audit.statusSuccess') : e.status === 'warning' ? t('audit.statusWarning') : t('audit.statusError')}\n`
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
    :roleTitle="roleTitle"
    userName="Иван Петров"
    :menuItems="menuItems"
  >
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">{{ $t('audit.title') }}</h1>
          <p class="text-gray-600 mt-1">{{ $t('audit.subtitle') }}</p>
        </div>
        <div class="flex items-center gap-3">
          <AppButton variant="secondary" @click="exportAuditLog">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {{ $t('audit.exportLog') }}
          </AppButton>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">{{ $t('audit.totalRecords') }}</p>
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
              <p class="text-sm text-gray-500">{{ $t('audit.successful') }}</p>
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
              <p class="text-sm text-gray-500">{{ $t('audit.warnings') }}</p>
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
              <p class="text-sm text-gray-500">{{ $t('audit.errors') }}</p>
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
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('audit.dateFrom') }}</label>
            <input
              v-model="dateFrom"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0e888d] focus:border-[#0e888d]"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('audit.dateTo') }}</label>
            <input
              v-model="dateTo"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0e888d] focus:border-[#0e888d]"
            />
          </div>

          <!-- Action Type -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('audit.actionType') }}</label>
            <select
              v-model="selectedAction"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0e888d] focus:border-[#0e888d]"
            >
              <option value="">{{ $t('audit.allTypes') }}</option>
              <option v-for="action in actionTypes" :key="action.value" :value="action.value">
                {{ action.label }}
              </option>
            </select>
          </div>

          <!-- Entity -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('audit.object') }}</label>
            <select
              v-model="selectedEntity"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0e888d] focus:border-[#0e888d]"
            >
              <option value="">{{ $t('audit.allObjects') }}</option>
              <option v-for="entity in entities" :key="entity" :value="entity">
                {{ entity }}
              </option>
            </select>
          </div>

          <!-- Status -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('audit.statusLabel') }}</label>
            <select
              v-model="selectedStatus"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0e888d] focus:border-[#0e888d]"
            >
              <option value="">{{ $t('audit.allStatuses') }}</option>
              <option v-for="status in statuses" :key="status.value" :value="status.value">
                {{ status.label }}
              </option>
            </select>
          </div>

          <!-- Search -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('audit.search') }}</label>
            <div class="relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                v-model="searchQuery"
                type="text"
                :placeholder="$t('audit.searchPlaceholder')"
                class="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0e888d] focus:border-[#0e888d]"
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
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{{ $t('audit.time') }}</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{{ $t('audit.user') }}</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{{ $t('audit.action') }}</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{{ $t('audit.object') }}</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{{ $t('audit.details') }}</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{{ $t('audit.statusLabel') }}</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{{ $t('audit.actions') }}</th>
              </tr>
            </thead>
            <tbody v-if="filteredLog.length === 0">
              <tr>
                <td colspan="7">
                  <EmptyState
                    :title="$t('audit.emptyTitle')"
                    :description="$t('audit.emptyDescription')"
                    :actionLabel="$t('audit.resetFilters')"
                    @action="selectedAction = ''; selectedEntity = ''; selectedStatus = ''; searchQuery = ''"
                  />
                </td>
              </tr>
            </tbody>
            <tbody v-else class="divide-y divide-gray-200">
              <tr v-for="entry in paginatedLog" :key="entry.id" class="hover:bg-gray-50">
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
                  <AppButton variant="ghost" size="sm" @click="openDetail(entry)">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {{ $t('audit.viewDetails') }}
                  </AppButton>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <p class="text-sm text-gray-500">
            {{ $t('audit.showingRecords', { start: paginationStart, end: paginationEnd, total: filteredLog.length }) }}
          </p>
          <div class="flex items-center gap-2">
            <button
              @click="prevPage"
              :disabled="currentPage === 1"
              :class="[
                'px-3 py-1 border rounded-lg text-sm font-medium transition-colors',
                currentPage === 1
                  ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              ]"
            >
              {{ $t('audit.prev') }}
            </button>
            <button
              v-for="page in pageNumbers"
              :key="page"
              @click="goToPage(page)"
              :class="[
                'px-3 py-1 rounded-lg text-sm font-medium transition-colors',
                page === currentPage
                  ? 'bg-[#0e888d] text-white'
                  : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
              ]"
            >
              {{ page }}
            </button>
            <button
              @click="nextPage"
              :disabled="currentPage === totalPages"
              :class="[
                'px-3 py-1 border rounded-lg text-sm font-medium transition-colors',
                currentPage === totalPages
                  ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              ]"
            >
              {{ $t('audit.next') }}
            </button>
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
              <h3 class="text-xl font-bold text-gray-900">{{ $t('audit.entryDetails') }}</h3>
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
                <label class="text-sm text-gray-500">{{ $t('audit.entryId') }}</label>
                <p class="font-mono text-gray-900">#{{ selectedEntry.id }}</p>
              </div>
              <div>
                <label class="text-sm text-gray-500">{{ $t('audit.dateTime') }}</label>
                <p class="text-gray-900">{{ selectedEntry.timestamp }}</p>
              </div>
              <div>
                <label class="text-sm text-gray-500">{{ $t('audit.user') }}</label>
                <p class="text-gray-900">{{ selectedEntry.user }}</p>
              </div>
              <div>
                <label class="text-sm text-gray-500">{{ $t('audit.role') }}</label>
                <span :class="['text-xs px-2 py-1 rounded', getRoleColor(selectedEntry.userRole)]">
                  {{ getRoleLabel(selectedEntry.userRole) }}
                </span>
              </div>
              <div>
                <label class="text-sm text-gray-500">{{ $t('audit.ipAddress') }}</label>
                <p class="font-mono text-gray-900">{{ selectedEntry.ipAddress }}</p>
              </div>
              <div>
                <label class="text-sm text-gray-500">{{ $t('audit.statusLabel') }}</label>
                <span :class="['inline-flex items-center gap-1 text-sm px-2 py-1 rounded', getStatusColor(selectedEntry.status)]">
                  {{ getStatusIcon(selectedEntry.status) }}
                  {{ $t(selectedEntry.status === 'success' ? 'audit.statusSuccess' : selectedEntry.status === 'warning' ? 'audit.statusWarning' : 'audit.statusError') }}
                </span>
              </div>
              <div>
                <label class="text-sm text-gray-500">{{ $t('audit.actionType') }}</label>
                <span :class="['text-xs px-2 py-1 rounded-full font-medium', getActionTypeColor(selectedEntry.actionType)]">
                  {{ getActionTypeLabel(selectedEntry.actionType) }}
                </span>
              </div>
              <div>
                <label class="text-sm text-gray-500">{{ $t('audit.action') }}</label>
                <p class="text-gray-900">{{ selectedEntry.action }}</p>
              </div>
              <div>
                <label class="text-sm text-gray-500">{{ $t('audit.object') }}</label>
                <p class="text-gray-900">{{ selectedEntry.entity }}</p>
              </div>
              <div>
                <label class="text-sm text-gray-500">{{ $t('audit.objectId') }}</label>
                <p class="font-mono text-[#0e888d]">{{ selectedEntry.entityId }}</p>
              </div>
            </div>

            <div>
              <label class="text-sm text-gray-500">{{ $t('audit.detailedInfo') }}</label>
              <p class="text-gray-900 mt-1 p-3 bg-gray-50 rounded-lg">{{ selectedEntry.details }}</p>
            </div>
          </div>

          <div class="p-6 border-t border-gray-200 flex justify-end">
            <AppButton variant="primary" @click="showDetailModal = false">
              {{ $t('audit.close') }}
            </AppButton>
          </div>
        </div>
      </div>
    </Teleport>
  </DashboardLayout>
</template>
