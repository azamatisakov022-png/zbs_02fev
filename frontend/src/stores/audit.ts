import { reactive } from 'vue'

// ============ Types ============

export type AuditActionType = 'create' | 'update' | 'delete' | 'login' | 'logout' | 'view' | 'export' | 'import'
export type AuditStatus = 'success' | 'warning' | 'error'
export type AuditUserRole = 'admin' | 'employee' | 'business' | 'eco-operator' | 'system'

export type IntegrationService = 'TAX_SERVICE' | 'CUSTOMS_SERVICE' | 'BANKING' | 'NBKR_FX' | 'ERP_SYNC'
export type IntegrationStatus = 'success' | 'failure' | 'timeout'

export type SecurityEventType = 'failed_login' | 'account_locked' | 'role_change' | 'password_reset' |
  'suspicious_ip' | 'brute_force' | 'permission_escalation' | 'mfa_disabled' | 'api_key_created'
export type SecurityRiskLevel = 'low' | 'medium' | 'high' | 'critical'

// ============ Interfaces ============

export interface AuditEntry {
  id: number
  timestamp: string
  user: string
  userRole: AuditUserRole
  action: string
  actionType: AuditActionType
  entity: string
  entityId: string
  ipAddress: string
  details: string
  status: AuditStatus
}

export interface IntegrationAuditEntry {
  id: number
  timestamp: string
  serviceName: IntegrationService
  operation: string
  status: IntegrationStatus
  errorMessage?: string
  durationMs: number
  companyInn?: string
}

export interface SecurityEvent {
  id: number
  timestamp: string
  eventType: SecurityEventType
  riskLevel: SecurityRiskLevel
  user: string
  userRole: AuditUserRole
  ipAddress: string
  details: string
  resolved: boolean
  resolvedBy?: string
  resolvedAt?: string
}

export interface AuditFilters {
  dateFrom: string
  dateTo: string
  actionType: AuditActionType | ''
  entity: string
  status: AuditStatus | ''
  search: string
}

export interface SecurityFilters {
  riskLevel: SecurityRiskLevel | ''
  eventType: SecurityEventType | ''
  resolved: 'all' | 'resolved' | 'unresolved'
  search: string
}

export interface IntegrationFilters {
  service: IntegrationService | ''
  status: IntegrationStatus | ''
  search: string
}

// ============ Mock Data: Audit Entries ============

const mockAuditEntries: AuditEntry[] = [
  // --- Existing 40 entries from AdminAudit.vue ---
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

  // --- New entries 41-85 ---
  { id: 41, timestamp: '2025-01-31 17:20:44', user: 'Петрова А.С.', userRole: 'employee', action: 'Экспорт реестра', actionType: 'export', entity: 'Организации', entityId: 'EXPORT-ORG-0131', ipAddress: '192.168.1.105', details: 'Экспортирован полный реестр организаций-плательщиков (312 записей)', status: 'success' },
  { id: 42, timestamp: '2025-01-31 16:45:18', user: 'Система', userRole: 'system', action: 'Пакетное обновление', actionType: 'update', entity: 'Расчёты', entityId: 'BATCH-UPD-0131', ipAddress: '127.0.0.1', details: 'Пересчёт штрафных пеней для 28 просроченных платежей', status: 'success' },
  { id: 43, timestamp: '2025-01-31 15:30:55', user: 'Нурланова А.К.', userRole: 'employee', action: 'Изменение декларации', actionType: 'update', entity: 'Декларации', entityId: 'DEC-2025-0210', ipAddress: '192.168.1.112', details: 'Возврат декларации на доработку: ошибка в объёмах ввозимых товаров', status: 'warning' },
  { id: 44, timestamp: '2025-01-31 14:15:33', user: 'ОсОО "Зелёная Долина"', userRole: 'business', action: 'Загрузка документа', actionType: 'create', entity: 'Декларации', entityId: 'DOC-ATT-0987', ipAddress: '83.221.15.78', details: 'Загружен акт сверки взаимных расчётов за 2024 год', status: 'success' },
  { id: 45, timestamp: '2025-01-31 13:00:28', user: 'Касымов Р.Т.', userRole: 'eco-operator', action: 'Одобрение отчёта', actionType: 'update', entity: 'Отчёты', entityId: 'REC-REP-0185', ipAddress: '10.0.0.55', details: 'Отчёт о переработке ОсОО "ЭкоПласт" за декабрь 2024 одобрен', status: 'success' },
  { id: 46, timestamp: '2025-01-31 11:45:09', user: 'Иванов И.И.', userRole: 'admin', action: 'Блокировка пользователя', actionType: 'update', entity: 'Пользователи', entityId: 'USER-2890', ipAddress: '192.168.1.100', details: 'Временная блокировка пользователя ОсОО "Ош-Трейд" за нарушение условий', status: 'warning' },
  { id: 47, timestamp: '2025-01-31 10:30:15', user: 'Алиева Д.Н.', userRole: 'employee', action: 'Создание лицензии', actionType: 'create', entity: 'Лицензии', entityId: 'LIC-2025-0012', ipAddress: '192.168.1.108', details: 'Выдана лицензия на сбор отходов ОсОО "Чуй Ресурс" сроком на 3 года', status: 'success' },
  { id: 48, timestamp: '2025-01-31 09:15:41', user: 'Система', userRole: 'system', action: 'Проверка целостности', actionType: 'view', entity: 'Системные настройки', entityId: 'INTEGRITY-0131', ipAddress: '127.0.0.1', details: 'Проверка целостности базы данных: ошибок не обнаружено', status: 'success' },
  { id: 49, timestamp: '2025-01-30 17:55:22', user: 'Петрова А.С.', userRole: 'employee', action: 'Просмотр расчёта', actionType: 'view', entity: 'Расчёты', entityId: 'CALC-2025-0082', ipAddress: '192.168.1.105', details: 'Просмотр расчёта ОсОО "Бишкек Групп" — сумма 156 200 сом', status: 'success' },
  { id: 50, timestamp: '2025-01-30 16:40:33', user: 'Сидоров К.М.', userRole: 'business', action: 'Оплата утильсбора', actionType: 'create', entity: 'Расчёты', entityId: 'PAY-2025-0098', ipAddress: '85.117.23.45', details: 'Загружена квитанция об оплате утильсбора на сумму 42 800 сом', status: 'success' },
  { id: 51, timestamp: '2025-01-30 15:25:48', user: 'Нурланова А.К.', userRole: 'employee', action: 'Изменение справочника', actionType: 'update', entity: 'Справочники', entityId: 'REF-PRODUCT-045', ipAddress: '192.168.1.112', details: 'Обновлена группа товаров "Электроника": добавлены 5 подкатегорий', status: 'success' },
  { id: 52, timestamp: '2025-01-30 14:10:19', user: 'Касымов Р.Т.', userRole: 'eco-operator', action: 'Просмотр плательщика', actionType: 'view', entity: 'Организации', entityId: 'ORG-1567', ipAddress: '10.0.0.55', details: 'Просмотр карточки плательщика ОсОО "Токмок Экспресс"', status: 'success' },
  { id: 53, timestamp: '2025-01-30 12:55:36', user: 'Иванов И.И.', userRole: 'admin', action: 'Настройка уведомлений', actionType: 'update', entity: 'Системные настройки', entityId: 'CONFIG-NOTIFY-UPD', ipAddress: '192.168.1.100', details: 'Настроены шаблоны SMS-уведомлений для напоминания о платежах', status: 'success' },
  { id: 54, timestamp: '2025-01-30 11:40:52', user: 'Алиева Д.Н.', userRole: 'employee', action: 'Отклонение расчёта', actionType: 'update', entity: 'Расчёты', entityId: 'CALC-2025-0079', ipAddress: '192.168.1.108', details: 'Расчёт ОсОО "Нарын Сервис" отклонён: ошибка классификации отходов', status: 'warning' },
  { id: 55, timestamp: '2025-01-30 10:25:14', user: 'Система', userRole: 'system', action: 'Очистка сессий', actionType: 'delete', entity: 'Сессии', entityId: 'CLEANUP-SESSIONS-0130', ipAddress: '127.0.0.1', details: 'Удалено 234 истёкших пользовательских сессии', status: 'success' },
  { id: 56, timestamp: '2025-01-30 09:10:07', user: 'ОсОО "КыргызЭко"', userRole: 'business', action: 'Вход в систему', actionType: 'login', entity: 'Сессии', entityId: 'SESSION-97200', ipAddress: '212.42.105.18', details: 'Успешный вход в систему', status: 'success' },
  { id: 57, timestamp: '2025-01-29 17:35:29', user: 'Петрова А.С.', userRole: 'employee', action: 'Создание отчёта', actionType: 'create', entity: 'Отчёты', entityId: 'REP-2025-M01-003', ipAddress: '192.168.1.105', details: 'Сформирован ежемесячный отчёт по поступлениям за январь 2025', status: 'success' },
  { id: 58, timestamp: '2025-01-29 16:20:45', user: 'Нурланова А.К.', userRole: 'employee', action: 'Импорт организаций', actionType: 'import', entity: 'Организации', entityId: 'IMPORT-ORG-0044', ipAddress: '192.168.1.112', details: 'Импортировано 15 новых организаций из реестра Минюста КР', status: 'success' },
  { id: 59, timestamp: '2025-01-29 15:05:18', user: 'Касымов Р.Т.', userRole: 'eco-operator', action: 'Создание возврата', actionType: 'create', entity: 'Расчёты', entityId: 'REFUND-2025-0008', ipAddress: '10.0.0.55', details: 'Оформлен возврат переплаты ОсОО "ЭкоПласт" на сумму 12 500 сом', status: 'success' },
  { id: 60, timestamp: '2025-01-29 13:50:33', user: 'Иванов И.И.', userRole: 'admin', action: 'Обновление системы', actionType: 'update', entity: 'Системные настройки', entityId: 'SYS-UPDATE-0129', ipAddress: '192.168.1.100', details: 'Обновление системы до версии 2.4.1: исправления безопасности', status: 'success' },
  { id: 61, timestamp: '2025-01-29 12:35:47', user: 'Алиева Д.Н.', userRole: 'employee', action: 'Просмотр лицензии', actionType: 'view', entity: 'Лицензии', entityId: 'LIC-2024-0089', ipAddress: '192.168.1.108', details: 'Просмотр лицензии ОсОО "Иссык-Куль Экосервис" — истекает через 15 дней', status: 'warning' },
  { id: 62, timestamp: '2025-01-29 11:20:22', user: 'Система', userRole: 'system', action: 'Автоматический расчёт', actionType: 'create', entity: 'Расчёты', entityId: 'CALC-AUTO-0129', ipAddress: '127.0.0.1', details: 'Автоматический пересчёт задолженностей: 8 организаций с просрочкой', status: 'warning' },
  { id: 63, timestamp: '2025-01-29 10:05:58', user: 'Сидоров К.М.', userRole: 'business', action: 'Просмотр счёта', actionType: 'view', entity: 'Расчёты', entityId: 'INV-2025-0045', ipAddress: '85.117.23.45', details: 'Просмотр счёта на оплату утильсбора ОсОО "АлаТоо Трейд"', status: 'success' },
  { id: 64, timestamp: '2025-01-29 08:50:14', user: 'Петрова А.С.', userRole: 'employee', action: 'Вход в систему', actionType: 'login', entity: 'Сессии', entityId: 'SESSION-96980', ipAddress: '192.168.1.105', details: 'Успешный вход в систему', status: 'success' },
  { id: 65, timestamp: '2025-01-28 17:15:33', user: 'Нурланова А.К.', userRole: 'employee', action: 'Экспорт справочника', actionType: 'export', entity: 'Справочники', entityId: 'EXPORT-REF-WASTE', ipAddress: '192.168.1.112', details: 'Экспортирован справочник кодов отходов в Excel (456 записей)', status: 'success' },
  { id: 66, timestamp: '2025-01-28 16:00:48', user: 'Касымов Р.Т.', userRole: 'eco-operator', action: 'Удаление дубликата', actionType: 'delete', entity: 'Отчёты', entityId: 'REC-REP-DUP-0183', ipAddress: '10.0.0.55', details: 'Удалён дублирующий отчёт о переработке за ноябрь 2024', status: 'success' },
  { id: 67, timestamp: '2025-01-28 14:45:19', user: 'Иванов И.И.', userRole: 'admin', action: 'Создание справочника', actionType: 'create', entity: 'Справочники', entityId: 'REF-NEW-REGIONS', ipAddress: '192.168.1.100', details: 'Создан справочник регионов КР с привязкой к административным единицам', status: 'success' },
  { id: 68, timestamp: '2025-01-28 13:30:55', user: 'ОсОО "Зелёная Долина"', userRole: 'business', action: 'Создание декларации', actionType: 'create', entity: 'Декларации', entityId: 'DEC-2025-0198', ipAddress: '83.221.15.78', details: 'Подана ежеквартальная декларация за Q4 2024', status: 'success' },
  { id: 69, timestamp: '2025-01-28 12:15:41', user: 'Алиева Д.Н.', userRole: 'employee', action: 'Одобрение расчёта', actionType: 'update', entity: 'Расчёты', entityId: 'CALC-2025-0075', ipAddress: '192.168.1.108', details: 'Расчёт утильсбора ОсОО "Бишкек Пласт" одобрен — 67 300 сом', status: 'success' },
  { id: 70, timestamp: '2025-01-28 11:00:27', user: 'Система', userRole: 'system', action: 'Импорт курсов валют', actionType: 'import', entity: 'Справочники', entityId: 'IMPORT-FX-0128', ipAddress: '127.0.0.1', details: 'Импортированы курсы валют НБКР на 28.01.2025', status: 'success' },
  { id: 71, timestamp: '2025-01-28 09:45:13', user: 'Петрова А.С.', userRole: 'employee', action: 'Просмотр организации', actionType: 'view', entity: 'Организации', entityId: 'ORG-1890', ipAddress: '192.168.1.105', details: 'Просмотр карточки ОсОО "Джалал-Абад ЭкоСервис"', status: 'success' },
  { id: 72, timestamp: '2025-01-27 17:30:09', user: 'Нурланова А.К.', userRole: 'employee', action: 'Выход из системы', actionType: 'logout', entity: 'Сессии', entityId: 'SESSION-96500', ipAddress: '192.168.1.112', details: 'Завершение рабочей сессии', status: 'success' },
  { id: 73, timestamp: '2025-01-27 16:15:44', user: 'Касымов Р.Т.', userRole: 'eco-operator', action: 'Экспорт аналитики', actionType: 'export', entity: 'Отчёты', entityId: 'ANALYTICS-EXPORT-Q4', ipAddress: '10.0.0.55', details: 'Экспортирована аналитика переработки за Q4 2024 в PDF', status: 'success' },
  { id: 74, timestamp: '2025-01-27 15:00:28', user: 'Иванов И.И.', userRole: 'admin', action: 'Изменение ставки', actionType: 'update', entity: 'Ставки утильсбора', entityId: 'RATE-2025-003', ipAddress: '192.168.1.100', details: 'Установлена ставка для новой категории "Батарейки и аккумуляторы" — 950 сом/кг', status: 'success' },
  { id: 75, timestamp: '2025-01-27 13:45:16', user: 'Алиева Д.Н.', userRole: 'employee', action: 'Создание расчёта', actionType: 'create', entity: 'Расчёты', entityId: 'CALC-2025-0073', ipAddress: '192.168.1.108', details: 'Создан расчёт утильсбора для ОсОО "Ош Индастри" на сумму 98 700 сом', status: 'success' },
  { id: 76, timestamp: '2025-01-27 12:30:52', user: 'Система', userRole: 'system', action: 'Резервное копирование', actionType: 'export', entity: 'Системные настройки', entityId: 'BACKUP-20250127', ipAddress: '127.0.0.1', details: 'Создана резервная копия БД (размер: 2.3 ГБ)', status: 'success' },
  { id: 77, timestamp: '2025-01-27 11:15:38', user: 'Сидоров К.М.', userRole: 'business', action: 'Просмотр расчёта', actionType: 'view', entity: 'Расчёты', entityId: 'CALC-2025-0070', ipAddress: '85.117.23.45', details: 'Просмотр расчёта утильсбора ОсОО "АлаТоо Трейд" за Q4 2024', status: 'success' },
  { id: 78, timestamp: '2025-01-27 10:00:24', user: 'Петрова А.С.', userRole: 'employee', action: 'Импорт расчётов', actionType: 'import', entity: 'Расчёты', entityId: 'IMPORT-CALC-0127', ipAddress: '192.168.1.105', details: 'Импортировано 34 расчёта из модуля автоматического начисления', status: 'success' },
  { id: 79, timestamp: '2025-01-27 08:45:11', user: 'Нурланова А.К.', userRole: 'employee', action: 'Вход в систему', actionType: 'login', entity: 'Сессии', entityId: 'SESSION-96200', ipAddress: '192.168.1.112', details: 'Успешный вход в систему', status: 'success' },
  { id: 80, timestamp: '2025-01-26 16:55:37', user: 'Касымов Р.Т.', userRole: 'eco-operator', action: 'Изменение отчёта', actionType: 'update', entity: 'Отчёты', entityId: 'REC-REP-0180', ipAddress: '10.0.0.55', details: 'Внесены корректировки в отчёт о переработке: добавлены данные по стеклотаре', status: 'success' },
  { id: 81, timestamp: '2025-01-26 15:40:23', user: 'Иванов И.И.', userRole: 'admin', action: 'Создание пользователя', actionType: 'create', entity: 'Пользователи', entityId: 'USER-5240', ipAddress: '192.168.1.100', details: 'Создана учётная запись для ОсОО "Таласский Ресурс"', status: 'success' },
  { id: 82, timestamp: '2025-01-26 14:25:48', user: 'Алиева Д.Н.', userRole: 'employee', action: 'Просмотр декларации', actionType: 'view', entity: 'Декларации', entityId: 'DEC-2025-0195', ipAddress: '192.168.1.108', details: 'Просмотр декларации ОсОО "Каракол ЭкоГрупп"', status: 'success' },
  { id: 83, timestamp: '2025-01-26 13:10:14', user: 'Система', userRole: 'system', action: 'Отправка уведомлений', actionType: 'create', entity: 'Расчёты', entityId: 'NOTIFY-EXPIRY-0126', ipAddress: '127.0.0.1', details: 'Отправлено 5 уведомлений об истечении срока действия лицензий', status: 'success' },
  { id: 84, timestamp: '2025-01-26 11:55:39', user: 'ОсОО "Бишкек Групп"', userRole: 'business', action: 'Экспорт декларации', actionType: 'export', entity: 'Декларации', entityId: 'DEC-EXPORT-0195', ipAddress: '195.38.160.25', details: 'Экспортирована копия поданной декларации в PDF', status: 'success' },
  { id: 85, timestamp: '2025-01-26 10:40:05', user: 'Петрова А.С.', userRole: 'employee', action: 'Удаление черновика', actionType: 'delete', entity: 'Расчёты', entityId: 'CALC-DRAFT-0068', ipAddress: '192.168.1.105', details: 'Удалён ошибочный черновик расчёта для ОсОО "Нарын ЭкоТранс"', status: 'success' },
]

// ============ Mock Data: Integration Audit ============

const mockIntegrationEntries: IntegrationAuditEntry[] = [
  { id: 1, timestamp: '2025-02-03 14:20:05', serviceName: 'TAX_SERVICE', operation: 'verifyInn', status: 'success', durationMs: 245, companyInn: '01234567890123' },
  { id: 2, timestamp: '2025-02-03 14:18:33', serviceName: 'TAX_SERVICE', operation: 'verifyInn', status: 'success', durationMs: 312, companyInn: '09876543210987' },
  { id: 3, timestamp: '2025-02-03 13:55:12', serviceName: 'CUSTOMS_SERVICE', operation: 'getImportDeclarations', status: 'success', durationMs: 1850, companyInn: '01234567890123' },
  { id: 4, timestamp: '2025-02-03 12:30:44', serviceName: 'NBKR_FX', operation: 'getCurrencyRates', status: 'success', durationMs: 180 },
  { id: 5, timestamp: '2025-02-03 11:15:28', serviceName: 'BANKING', operation: 'checkPaymentStatus', status: 'success', durationMs: 520, companyInn: '05678901234567' },
  { id: 6, timestamp: '2025-02-03 10:45:19', serviceName: 'TAX_SERVICE', operation: 'getCompanyInfo', status: 'failure', errorMessage: 'Сервис временно недоступен (503)', durationMs: 5000, companyInn: '03456789012345' },
  { id: 7, timestamp: '2025-02-03 09:30:55', serviceName: 'ERP_SYNC', operation: 'syncOrganizations', status: 'success', durationMs: 3200 },
  { id: 8, timestamp: '2025-02-02 16:40:22', serviceName: 'CUSTOMS_SERVICE', operation: 'getImportDeclarations', status: 'timeout', errorMessage: 'Превышено время ожидания ответа (30с)', durationMs: 30000, companyInn: '07890123456789' },
  { id: 9, timestamp: '2025-02-02 15:25:18', serviceName: 'TAX_SERVICE', operation: 'verifyInn', status: 'success', durationMs: 198, companyInn: '02345678901234' },
  { id: 10, timestamp: '2025-02-02 14:10:44', serviceName: 'BANKING', operation: 'initiatePayment', status: 'success', durationMs: 890, companyInn: '01234567890123' },
  { id: 11, timestamp: '2025-02-02 13:00:33', serviceName: 'NBKR_FX', operation: 'getCurrencyRates', status: 'success', durationMs: 165 },
  { id: 12, timestamp: '2025-02-02 11:45:17', serviceName: 'TAX_SERVICE', operation: 'getDebtInfo', status: 'failure', errorMessage: 'ИНН не найден в реестре ГНС', durationMs: 340, companyInn: '99999999999999' },
  { id: 13, timestamp: '2025-02-01 16:30:28', serviceName: 'ERP_SYNC', operation: 'syncReferences', status: 'success', durationMs: 4500 },
  { id: 14, timestamp: '2025-02-01 15:15:44', serviceName: 'CUSTOMS_SERVICE', operation: 'getExportDeclarations', status: 'success', durationMs: 2100, companyInn: '04567890123456' },
  { id: 15, timestamp: '2025-02-01 14:00:19', serviceName: 'BANKING', operation: 'checkPaymentStatus', status: 'success', durationMs: 445, companyInn: '06789012345678' },
  { id: 16, timestamp: '2025-02-01 12:45:33', serviceName: 'TAX_SERVICE', operation: 'verifyInn', status: 'success', durationMs: 220, companyInn: '08901234567890' },
  { id: 17, timestamp: '2025-02-01 11:30:07', serviceName: 'NBKR_FX', operation: 'getCurrencyRates', status: 'failure', errorMessage: 'Ошибка парсинга XML-ответа НБКР', durationMs: 280 },
  { id: 18, timestamp: '2025-01-31 16:20:55', serviceName: 'ERP_SYNC', operation: 'syncCalculations', status: 'timeout', errorMessage: 'Превышено время ожидания: большой объём данных', durationMs: 30000 },
  { id: 19, timestamp: '2025-01-31 15:05:41', serviceName: 'TAX_SERVICE', operation: 'getCompanyInfo', status: 'success', durationMs: 385, companyInn: '01234567890123' },
  { id: 20, timestamp: '2025-01-31 13:50:28', serviceName: 'CUSTOMS_SERVICE', operation: 'getImportDeclarations', status: 'success', durationMs: 1650, companyInn: '05678901234567' },
  { id: 21, timestamp: '2025-01-31 12:35:14', serviceName: 'BANKING', operation: 'getAccountStatement', status: 'success', durationMs: 1200, companyInn: '01234567890123' },
  { id: 22, timestamp: '2025-01-30 16:15:33', serviceName: 'TAX_SERVICE', operation: 'verifyInn', status: 'success', durationMs: 195, companyInn: '03456789012345' },
  { id: 23, timestamp: '2025-01-30 14:00:48', serviceName: 'ERP_SYNC', operation: 'syncOrganizations', status: 'failure', errorMessage: 'Конфликт версий данных при синхронизации', durationMs: 2800 },
  { id: 24, timestamp: '2025-01-30 12:45:22', serviceName: 'NBKR_FX', operation: 'getCurrencyRates', status: 'success', durationMs: 155 },
  { id: 25, timestamp: '2025-01-29 15:30:17', serviceName: 'CUSTOMS_SERVICE', operation: 'getImportDeclarations', status: 'success', durationMs: 1920, companyInn: '02345678901234' },
]

// ============ Mock Data: Security Events ============

const mockSecurityEvents: SecurityEvent[] = [
  { id: 1, timestamp: '2025-02-03 11:45:21', eventType: 'failed_login', riskLevel: 'medium', user: 'ОсОО "БишкекРесайкл"', userRole: 'business', ipAddress: '91.185.10.22', details: 'Неверный пароль — попытка 3 из 5', resolved: true, resolvedBy: 'Система', resolvedAt: '2025-02-03 11:50:00' },
  { id: 2, timestamp: '2025-02-02 10:55:51', eventType: 'account_locked', riskLevel: 'high', user: 'ОсОО "Бишкек Пласт"', userRole: 'business', ipAddress: '195.38.160.10', details: 'Аккаунт заблокирован после 5 неудачных попыток входа', resolved: true, resolvedBy: 'Иванов И.И.', resolvedAt: '2025-02-02 14:30:00' },
  { id: 3, timestamp: '2025-02-03 08:30:25', eventType: 'role_change', riskLevel: 'medium', user: 'Касымов Р.Т.', userRole: 'eco-operator', ipAddress: '192.168.1.100', details: 'Роль изменена с "Эко-оператор" на "Старший эко-оператор" администратором Иванов И.И.', resolved: true, resolvedBy: 'Иванов И.И.', resolvedAt: '2025-02-03 08:30:25' },
  { id: 4, timestamp: '2025-02-02 09:15:33', eventType: 'suspicious_ip', riskLevel: 'high', user: 'unknown', userRole: 'system', ipAddress: '185.220.101.45', details: 'Попытка доступа к API с IP-адреса из сети Tor. Запрос заблокирован WAF.', resolved: false },
  { id: 5, timestamp: '2025-02-01 22:30:18', eventType: 'brute_force', riskLevel: 'critical', user: 'admin', userRole: 'admin', ipAddress: '103.75.190.12', details: 'Обнаружена серия из 47 попыток подбора пароля к учётной записи admin за 5 минут. IP заблокирован.', resolved: true, resolvedBy: 'Система', resolvedAt: '2025-02-01 22:30:20' },
  { id: 6, timestamp: '2025-02-01 16:45:09', eventType: 'password_reset', riskLevel: 'low', user: 'Сидоров К.М.', userRole: 'business', ipAddress: '85.117.23.45', details: 'Запрос на сброс пароля через email. Пароль успешно изменён.', resolved: true, resolvedBy: 'Сидоров К.М.', resolvedAt: '2025-02-01 16:52:00' },
  { id: 7, timestamp: '2025-01-31 14:20:33', eventType: 'failed_login', riskLevel: 'medium', user: 'Нурланова А.К.', userRole: 'employee', ipAddress: '192.168.1.112', details: 'Неверный пароль — возможно забыт после отпуска', resolved: true, resolvedBy: 'Нурланова А.К.', resolvedAt: '2025-01-31 14:25:00' },
  { id: 8, timestamp: '2025-01-31 03:15:44', eventType: 'suspicious_ip', riskLevel: 'critical', user: 'unknown', userRole: 'system', ipAddress: '45.155.205.89', details: 'Множественные запросы к /api/admin/* с подозрительного IP (Нидерланды). Сканирование портов обнаружено.', resolved: false },
  { id: 9, timestamp: '2025-01-30 11:40:52', eventType: 'permission_escalation', riskLevel: 'high', user: 'ОсОО "Ош-Трейд"', userRole: 'business', ipAddress: '91.195.240.18', details: 'Попытка доступа к API эндпоинту /admin/users — доступ запрещён. Возможная попытка эскалации привилегий.', resolved: true, resolvedBy: 'Система', resolvedAt: '2025-01-30 11:40:52' },
  { id: 10, timestamp: '2025-01-30 09:05:28', eventType: 'password_reset', riskLevel: 'low', user: 'Алиева Д.Н.', userRole: 'employee', ipAddress: '192.168.1.108', details: 'Плановая смена пароля (срок действия 90 дней)', resolved: true, resolvedBy: 'Алиева Д.Н.', resolvedAt: '2025-01-30 09:10:00' },
  { id: 11, timestamp: '2025-01-29 18:45:17', eventType: 'failed_login', riskLevel: 'medium', user: 'ОсОО "Каракол ЭкоГрупп"', userRole: 'business', ipAddress: '83.221.15.90', details: 'Неверный ИНН при попытке авторизации', resolved: true, resolvedBy: 'Система', resolvedAt: '2025-01-29 18:45:17' },
  { id: 12, timestamp: '2025-01-29 02:10:33', eventType: 'brute_force', riskLevel: 'critical', user: 'api-service', userRole: 'system', ipAddress: '178.62.194.33', details: 'Обнаружено 120 запросов к /api/auth/login за 3 минуты. IP заблокирован на 24 часа.', resolved: true, resolvedBy: 'Система', resolvedAt: '2025-01-29 02:10:35' },
  { id: 13, timestamp: '2025-01-28 15:30:22', eventType: 'api_key_created', riskLevel: 'medium', user: 'Иванов И.И.', userRole: 'admin', ipAddress: '192.168.1.100', details: 'Создан новый API-ключ для интеграции с ГНС КР (срок действия: 1 год)', resolved: true, resolvedBy: 'Иванов И.И.', resolvedAt: '2025-01-28 15:30:22' },
  { id: 14, timestamp: '2025-01-28 08:20:44', eventType: 'role_change', riskLevel: 'low', user: 'Петрова А.С.', userRole: 'employee', ipAddress: '192.168.1.100', details: 'Назначены дополнительные права: просмотр аналитических отчётов', resolved: true, resolvedBy: 'Иванов И.И.', resolvedAt: '2025-01-28 08:20:44' },
  { id: 15, timestamp: '2025-01-27 21:55:09', eventType: 'suspicious_ip', riskLevel: 'high', user: 'unknown', userRole: 'system', ipAddress: '94.102.49.170', details: 'Попытка SQL-инъекции в параметрах URL /api/declarations?id=1 OR 1=1. Запрос заблокирован.', resolved: true, resolvedBy: 'Система', resolvedAt: '2025-01-27 21:55:09' },
  { id: 16, timestamp: '2025-01-27 10:30:18', eventType: 'mfa_disabled', riskLevel: 'high', user: 'Касымов Р.Т.', userRole: 'eco-operator', ipAddress: '10.0.0.55', details: 'Двухфакторная аутентификация отключена пользователем. Рекомендовано включить обратно.', resolved: false },
  { id: 17, timestamp: '2025-01-26 14:15:33', eventType: 'failed_login', riskLevel: 'low', user: 'ОсОО "Токмок Экспресс"', userRole: 'business', ipAddress: '83.221.14.55', details: 'Неверный пароль — единичная попытка', resolved: true, resolvedBy: 'Система', resolvedAt: '2025-01-26 14:15:33' },
]

// ============ State ============

const state = reactive<{
  auditEntries: AuditEntry[]
  integrationEntries: IntegrationAuditEntry[]
  securityEvents: SecurityEvent[]
  loading: boolean
}>({
  auditEntries: [...mockAuditEntries],
  integrationEntries: [...mockIntegrationEntries],
  securityEvents: [...mockSecurityEvents],
  loading: false,
})

// ============ Functions ============

function getFilteredEntries(filters: Partial<AuditFilters>): AuditEntry[] {
  let result = [...state.auditEntries]

  if (filters.actionType) {
    result = result.filter(e => e.actionType === filters.actionType)
  }
  if (filters.entity) {
    result = result.filter(e => e.entity === filters.entity)
  }
  if (filters.status) {
    result = result.filter(e => e.status === filters.status)
  }
  if (filters.search) {
    const q = filters.search.toLowerCase()
    result = result.filter(e =>
      e.user.toLowerCase().includes(q) ||
      e.action.toLowerCase().includes(q) ||
      e.details.toLowerCase().includes(q) ||
      e.entityId.toLowerCase().includes(q)
    )
  }
  return result
}

function getAuditStats() {
  const entries = state.auditEntries
  return {
    total: entries.length,
    success: entries.filter(e => e.status === 'success').length,
    warnings: entries.filter(e => e.status === 'warning').length,
    errors: entries.filter(e => e.status === 'error').length,
  }
}

function getSecurityEvents(filters?: Partial<SecurityFilters>): SecurityEvent[] {
  let result = [...state.securityEvents]

  if (filters?.riskLevel) {
    result = result.filter(e => e.riskLevel === filters.riskLevel)
  }
  if (filters?.eventType) {
    result = result.filter(e => e.eventType === filters.eventType)
  }
  if (filters?.resolved === 'resolved') {
    result = result.filter(e => e.resolved)
  } else if (filters?.resolved === 'unresolved') {
    result = result.filter(e => !e.resolved)
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase()
    result = result.filter(e =>
      e.user.toLowerCase().includes(q) ||
      e.details.toLowerCase().includes(q) ||
      e.ipAddress.includes(q)
    )
  }
  return result
}

function getSecurityStats() {
  const events = state.securityEvents
  return {
    total: events.length,
    critical: events.filter(e => e.riskLevel === 'critical').length,
    high: events.filter(e => e.riskLevel === 'high').length,
    unresolved: events.filter(e => !e.resolved).length,
    failedLogins: events.filter(e => e.eventType === 'failed_login' || e.eventType === 'brute_force').length,
  }
}

function getIntegrationLog(filters?: Partial<IntegrationFilters>): IntegrationAuditEntry[] {
  let result = [...state.integrationEntries]

  if (filters?.service) {
    result = result.filter(e => e.serviceName === filters.service)
  }
  if (filters?.status) {
    result = result.filter(e => e.status === filters.status)
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase()
    result = result.filter(e =>
      e.operation.toLowerCase().includes(q) ||
      (e.companyInn && e.companyInn.includes(q)) ||
      (e.errorMessage && e.errorMessage.toLowerCase().includes(q))
    )
  }
  return result
}

function getIntegrationStats() {
  const entries = state.integrationEntries
  const successEntries = entries.filter(e => e.status === 'success')
  return {
    total: entries.length,
    success: successEntries.length,
    failures: entries.filter(e => e.status === 'failure').length,
    timeouts: entries.filter(e => e.status === 'timeout').length,
    avgDuration: entries.length > 0
      ? Math.round(entries.reduce((sum, e) => sum + e.durationMs, 0) / entries.length)
      : 0,
  }
}

function getUserActivity(userName: string): AuditEntry[] {
  return state.auditEntries.filter(e => e.user === userName)
}

function resolveSecurityEvent(id: number, resolvedBy: string) {
  const event = state.securityEvents.find(e => e.id === id)
  if (event) {
    event.resolved = true
    event.resolvedBy = resolvedBy
    event.resolvedAt = new Date().toISOString().replace('T', ' ').substring(0, 19)
  }
}

function getAnalyticsData() {
  const entries = state.auditEntries
  const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']

  // Activity by day of week
  const byDay: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }
  entries.forEach(e => {
    const d = new Date(e.timestamp.replace(' ', 'T'))
    if (!isNaN(d.getTime())) {
      byDay[d.getDay()] = (byDay[d.getDay()] || 0) + 1
    }
  })
  const activityByDay = [1, 2, 3, 4, 5, 6, 0].map(day => ({
    day: dayNames[day],
    count: byDay[day] || 0,
  }))

  // Top users
  const userCounts: Record<string, number> = {}
  entries.forEach(e => {
    if (e.userRole !== 'system') {
      userCounts[e.user] = (userCounts[e.user] || 0) + 1
    }
  })
  const topUsers = Object.entries(userCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([user, count]) => ({ user, count }))

  // Actions by type
  const typeCounts: Record<string, number> = {}
  entries.forEach(e => {
    typeCounts[e.actionType] = (typeCounts[e.actionType] || 0) + 1
  })
  const totalActions = entries.length || 1
  const actionsByType = Object.entries(typeCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([type, count]) => ({
      type: type as AuditActionType,
      count,
      percent: Math.round((count / totalActions) * 100),
    }))

  // Peak hours (simplified: count per hour across all days)
  const hourCounts: Record<number, number> = {}
  for (let h = 0; h < 24; h++) hourCounts[h] = 0
  entries.forEach(e => {
    const parts = e.timestamp.split(' ')
    if (parts[1]) {
      const hour = parseInt(parts[1].split(':')[0], 10)
      if (!isNaN(hour)) {
        hourCounts[hour] = (hourCounts[hour] || 0) + 1
      }
    }
  })
  const peakHours = Object.entries(hourCounts).map(([hour, count]) => ({
    hour: parseInt(hour, 10),
    count,
  }))

  // Status ratio
  const statusRatio = {
    success: entries.filter(e => e.status === 'success').length,
    warning: entries.filter(e => e.status === 'warning').length,
    error: entries.filter(e => e.status === 'error').length,
  }

  return {
    activityByDay,
    topUsers,
    actionsByType,
    peakHours,
    statusRatio,
    totalActions: entries.length,
  }
}

// ============ Export ============

export const auditStore = {
  state,
  getFilteredEntries,
  getAuditStats,
  getSecurityEvents,
  getSecurityStats,
  getIntegrationLog,
  getIntegrationStats,
  getUserActivity,
  getAnalyticsData,
  resolveSecurityEvent,
}
