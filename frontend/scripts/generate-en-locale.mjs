/**
 * Script to generate en.json locale file from ru.json
 * Translates all Russian strings to English for the AIS CRO system
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ruPath = path.join(__dirname, '..', 'src', 'locales', 'ru.json')
const enPath = path.join(__dirname, '..', 'src', 'locales', 'en.json')

const ru = JSON.parse(fs.readFileSync(ruPath, 'utf8'))

// ============================================================
// COMPREHENSIVE RUSSIAN → ENGLISH TRANSLATION DICTIONARY
// ============================================================

const dict = new Map([
  // === COMMON ===
  ['Сохранить', 'Save'],
  ['Отмена', 'Cancel'],
  ['Удалить', 'Delete'],
  ['Редактировать', 'Edit'],
  ['Создать', 'Create'],
  ['Подать', 'Submit'],
  ['Отправить', 'Send'],
  ['Скачать', 'Download'],
  ['Экспорт', 'Export'],
  ['Импорт', 'Import'],
  ['Назад', 'Back'],
  ['Закрыть', 'Close'],
  ['Поиск', 'Search'],
  ['Фильтр', 'Filter'],
  ['Сбросить', 'Reset'],
  ['Повторить', 'Retry'],
  ['Выйти', 'Logout'],
  ['Применить', 'Apply'],
  ['Подтвердить', 'Confirm'],
  ['Добавить', 'Add'],
  ['Удалить', 'Delete'],
  ['Просмотреть', 'View'],
  ['Печать', 'Print'],
  ['Подробнее', 'Details'],
  ['Все', 'All'],
  ['Да', 'Yes'],
  ['Нет', 'No'],
  ['Загрузка...', 'Loading...'],
  ['Нет данных', 'No data'],
  ['Действия', 'Actions'],
  ['Статус', 'Status'],
  ['Дата', 'Date'],
  ['Период', 'Period'],
  ['Итого', 'Total'],
  ['Сумма', 'Amount'],
  ['Номер', 'Number'],
  ['Наименование', 'Name'],
  ['Описание', 'Description'],
  ['Тип', 'Type'],
  ['Регион', 'Region'],
  ['Все регионы', 'All regions'],
  ['С', 'From'],
  ['По', 'To'],
  ['С даты', 'From date'],
  ['По дату', 'To date'],
  ['Период с', 'Period from'],
  ['Период по', 'Period to'],
  ['Показано', 'Shown'],
  ['из', 'of'],
  ['записей', 'records'],
  ['Далее', 'Next'],
  ['Перейти к содержимому', 'Skip to content'],
  ['Основная навигация', 'Main navigation'],
  ['Меню', 'Menu'],
  ['Открыть меню', 'Open menu'],
  ['Выйти из системы', 'Log out'],
  ['Главная', 'Home'],
  ['Сформировать', 'Generate'],
  ['Формирование...', 'Generating...'],
  ['Параметры отчёта', 'Report parameters'],
  ['Найдено', 'Found'],
  ['объектов', 'objects'],
  ['сом', 'KGS'],
  ['дн.', 'days'],
  ['т', 't'],
  ['шт', 'pcs'],
  ['Назад к списку', 'Back to list'],
  ['Сохранить черновик', 'Save draft'],
  ['Добавить строку', 'Add row'],
  ['Отправить отчёт', 'Submit report'],
  ['Создать отчёт', 'Create report'],
  ['Скачать Excel', 'Download Excel'],
  ['Скачать PDF', 'Download PDF'],
  ['Скачать отчёт Excel', 'Download report (Excel)'],
  ['Скачать отчёт PDF', 'Download report (PDF)'],
  ['Выгрузить отчёт', 'Export report'],
  ['Выгрузить данные', 'Export data'],
  ['Детали', 'Details'],
  ['Принять', 'Accept'],
  ['Отклонить', 'Reject'],
  ['Успешно', 'Success'],
  ['Просмотр', 'Preview'],
  ['Все статусы', 'All statuses'],

  // Company info
  ['ГП Эко Оператор', 'SE Eco Operator'],
  ['ГП «Эко Оператор»', 'SE "Eco Operator"'],
  ['Государственное предприятие', 'State Enterprise'],
  ['Пн-Пт: 9:00 - 18:00', 'Mon-Fri: 9:00 AM - 6:00 PM'],
  ['Сб-Вс: выходной', 'Sat-Sun: closed'],
  ['г. Бишкек', 'Bishkek'],
  ['ул. Токтогула, 228', '228 Toktogul St.'],
  ['г. Бишкек, ул. Токтогула, 228', 'Bishkek, 228 Toktogul St.'],
  ['720040, г. Бишкек', '720040, Bishkek'],

  // === ROLES ===
  ['Плательщик', 'Payer'],
  ['Сотрудник МПРЭТН КР', 'MNRE KR Employee'],
  ['Администратор', 'Administrator'],

  // === NAV ===
  ['О портале', 'About'],
  ['Законодательство', 'Legislation'],
  ['Лицензии', 'Licenses'],
  ['Публикации', 'Publications'],
  ['ГИС-Карта', 'GIS Map'],
  ['Калькулятор РОП', 'EPR Calculator'],
  ['Конкурсы', 'Tenders'],
  ['Реестры', 'Registries'],
  ['Глоссарий', 'Glossary'],
  ['Регистрация', 'Registration'],
  ['Войти', 'Sign In'],
  ['Расчёт утильсбора', 'Fee Calculation'],
  ['Отчёты о переработке', 'Recycling Reports'],
  ['Декларации', 'Declarations'],
  ['Платежи', 'Payments'],
  ['Документы', 'Documents'],
  ['Нормативы и ставки', 'Norms & Rates'],
  ['Лицевой счёт', 'Account Statement'],
  ['Возврат утильсбора', 'Fee Refund'],
  ['Профиль компании', 'Company Profile'],
  ['Организации', 'Organizations'],
  ['Входящие декларации', 'Incoming Declarations'],
  ['Входящие расчёты', 'Incoming Calculations'],
  ['Реестр переработчиков', 'Recyclers Registry'],
  ['Полигоны ТБО', 'Landfills'],
  ['Аналитика и отчёты', 'Analytics & Reports'],
  ['Лицевые счета', 'Accounts'],
  ['Заявки на возврат', 'Refund Requests'],
  ['Реестр плательщиков', 'Payers Registry'],
  ['Профили компаний', 'Company Profiles'],
  ['Аналитика', 'Analytics'],
  ['Контроль исполнения', 'Compliance'],
  ['Виды отходов', 'Waste Types'],
  ['Полигоны и свалки', 'Landfills & Dumps'],
  ['Пункты приёма', 'Collection Points'],
  ['Отчётность', 'Reporting'],
  ['ГИС-карта', 'GIS Map'],
  ['Мой профиль', 'My Profile'],
  ['Пользователи', 'Users'],
  ['Роли и права', 'Roles & Permissions'],
  ['Справочники', 'References'],
  ['Журнал аудита', 'Audit Log'],
  ['Уведомления', 'Notifications'],
  ['Настройки системы', 'System Settings'],

  // === STATUSES ===
  ['Черновик', 'Draft'],
  ['На проверке', 'Under Review'],
  ['На рассмотрении', 'In Review'],
  ['Принято', 'Accepted'],
  ['Принят', 'Accepted'],
  ['Одобрена', 'Approved'],
  ['Отклонено', 'Rejected'],
  ['Отклонён', 'Rejected'],
  ['Отклонена', 'Rejected'],
  ['Оплачено', 'Paid'],
  ['Оплата на проверке', 'Payment Under Review'],
  ['Оплата отклонена', 'Payment Rejected'],
  ['На доработке', 'Revision Required'],
  ['Новая', 'New'],
  ['Новый', 'New'],
  ['Действует', 'Active'],
  ['Истекает', 'Expiring'],
  ['Истекла', 'Expired'],
  ['Аннулирован', 'Revoked'],
  ['Аннулирована', 'Revoked'],
  ['Активен', 'Active'],
  ['Активна', 'Active'],
  ['Заблокирован', 'Blocked'],
  ['Временно заблокирован', 'Temporarily Blocked'],
  ['Ожидает подтверждения', 'Pending Confirmation'],
  ['Деактивирован', 'Deactivated'],
  ['Деактивирована', 'Deactivated'],
  ['Приостановлен', 'Suspended'],
  ['Приостановлена', 'Suspended'],
  ['Закрыт', 'Closed'],
  ['Рекультивация', 'Reclamation'],
  ['Сбор оплачен', 'Fee Paid'],
  ['Пеня оплачена', 'Penalty Paid'],
  ['Принята', 'Accepted'],
  ['Подана', 'Submitted'],
  ['Подан', 'Submitted'],
  ['Отправлен', 'Sent'],
  ['Отправлена', 'Sent'],
  ['В обработке', 'Processing'],
  ['В работе', 'In Progress'],
  ['Завершён', 'Completed'],
  ['Завершена', 'Completed'],
  ['Отменено', 'Cancelled'],
  ['Отменена', 'Cancelled'],
  ['Неактивен', 'Inactive'],
  ['Неактивна', 'Inactive'],
  ['Выполнен', 'Fulfilled'],
  ['Близко к норме', 'Close to Norm'],
  ['Не выполнен', 'Not Fulfilled'],
  ['Частично', 'Partial'],
  ['Хорошее', 'Good'],
  ['Требует внимания', 'Warning'],
  ['Критическое', 'Critical'],
  ['Соответствует', 'Compliant'],
  ['Нарушения', 'Non-compliant'],

  // === VALIDATION ===
  ['{field} — обязательное поле', '{field} is required'],
  ['{field} — минимум {min} символов', '{field} must be at least {min} characters'],
  ['{field} — введите число', '{field} must be a number'],
  ['{field} — значение не может быть отрицательным', '{field} cannot be negative'],
  ['{field} не может превышать {max}', '{field} cannot exceed {max}'],
  ['ИНН должен содержать 14 цифр', 'TIN must contain 14 digits'],
  ['Некорректный email', 'Invalid email'],
  ['Формат: +996 XXX XXX XXX', 'Format: +996 XXX XXX XXX'],
  ['Максимальный размер файла: {max} МБ', 'Maximum file size: {max} MB'],
  ['Допустимые форматы: {types}', 'Allowed formats: {types}'],
  ['Выберите отчётный период', 'Select reporting period'],
  ['Добавьте хотя бы одну позицию', 'Add at least one item'],
  ['Заполните все обязательные поля в позициях', 'Fill in all required fields'],
  ['Укажите отчётный год', 'Select reporting year'],
  ['Комментарий должен быть не менее {min} символов', 'Comment must be at least {min} characters'],

  // === ERRORS ===
  ['Произошла ошибка при загрузке данных', 'An error occurred while loading data'],
  ['Непредвиденная ошибка', 'Unexpected error'],
  ['Ошибка сети. Проверьте подключение к интернету', 'Network error. Check your internet connection'],
  ['Доступ запрещён', 'Access denied'],
  ['Ошибка сервера', 'Server error'],
  ['Ошибка API', 'API error'],
  ['Ошибка авторизации', 'Authorization error'],
  ['Ошибка регистрации', 'Registration error'],

  // === NOT FOUND ===
  ['Страница не найдена', 'Page Not Found'],
  ['Запрашиваемая страница не существует или была перемещена', 'The requested page does not exist or has been moved'],
  ['На главную', 'Go to Home'],

  // PWA
  ['Нет подключения к интернету. Данные отображаются из кэша.', 'No internet connection. Data is displayed from cache.'],
  ['Доступно обновление приложения.', 'Application update available.'],
  ['Обновить', 'Update'],
])

// ============================================================
// PATTERN-BASED TRANSLATIONS
// ============================================================

const patterns = [
  // Common patterns
  [/^У вас пока нет (.+)$/, 'You have no $1 yet'],
  [/^Нет новых (.+)$/, 'No new $1'],
  [/^Нет (.+)$/, 'No $1'],
  [/^Ошибка (.+)$/, 'Error: $1'],
  [/^Подайте (.+)$/, 'Submit $1'],
  [/^Загрузка (.+)$/, 'Loading $1'],
  [/^Добавить (.+)$/, 'Add $1'],
  [/^Создать (.+)$/, 'Create $1'],
  [/^Удалить (.+)$/, 'Delete $1'],
  [/^Редактировать (.+)$/, 'Edit $1'],
  [/^Количество (.+)$/, 'Number of $1'],
  [/^Общая (.+)$/, 'Total $1'],
  [/^Дата (.+)$/, 'Date of $1'],
  [/^Статус (.+)$/, 'Status of $1'],
]

// ============================================================
// WORD-LEVEL DICTIONARY FOR COMPOUND TRANSLATIONS
// ============================================================

const wordDict = new Map([
  // Core terms
  ['утилизационного', 'recycling'],
  ['утилизационный', 'recycling'],
  ['утильсбора', 'recycling fee'],
  ['утильсбор', 'recycling fee'],
  ['сбора', 'fee'],
  ['сбор', 'fee'],
  ['расчёт', 'calculation'],
  ['расчёта', 'calculation'],
  ['расчётов', 'calculations'],
  ['расчёты', 'calculations'],
  ['отходов', 'waste'],
  ['отходы', 'waste'],
  ['переработки', 'recycling'],
  ['переработка', 'recycling'],
  ['переработчик', 'recycler'],
  ['переработчиков', 'recyclers'],
  ['переработчики', 'recyclers'],
  ['плательщик', 'payer'],
  ['плательщика', 'payer'],
  ['плательщиков', 'payers'],
  ['плательщики', 'payers'],
  ['организация', 'organization'],
  ['организации', 'organizations'],
  ['декларация', 'declaration'],
  ['декларации', 'declarations'],
  ['декларацию', 'declaration'],
  ['лицензия', 'license'],
  ['лицензии', 'licenses'],
  ['лицензий', 'licenses'],
  ['полигон', 'landfill'],
  ['полигона', 'landfill'],
  ['полигоны', 'landfills'],
  ['полигонов', 'landfills'],
  ['свалка', 'dump'],
  ['свалки', 'dumps'],
  ['пеня', 'penalty'],
  ['пени', 'penalty'],
  ['пеню', 'penalty'],
  ['возврат', 'refund'],
  ['возврата', 'refund'],
  ['возвратов', 'refunds'],
  ['платёж', 'payment'],
  ['платежа', 'payment'],
  ['платежи', 'payments'],
  ['платежей', 'payments'],
  ['отчёт', 'report'],
  ['отчёта', 'report'],
  ['отчёты', 'reports'],
  ['отчётов', 'reports'],
  ['отчётность', 'reporting'],
  ['аналитика', 'analytics'],
  ['аналитики', 'analytics'],
  ['министерство', 'Ministry'],
  ['министерства', 'Ministry'],
  ['сотрудник', 'employee'],
  ['сотрудника', 'employee'],
  ['администратор', 'administrator'],
  ['пользователь', 'user'],
  ['пользователя', 'user'],
  ['пользователи', 'users'],
  ['компания', 'company'],
  ['компании', 'company'],
  ['период', 'period'],
  ['периода', 'period'],
  ['дата', 'date'],
  ['даты', 'dates'],
  ['документ', 'document'],
  ['документа', 'document'],
  ['документы', 'documents'],
  ['документов', 'documents'],
  ['уведомление', 'notification'],
  ['уведомления', 'notifications'],
  ['настройки', 'settings'],
  ['справочник', 'reference'],
  ['справочники', 'references'],
  ['калькулятор', 'calculator'],
  ['реестр', 'registry'],
  ['реестра', 'registry'],
  ['реестры', 'registries'],
  ['профиль', 'profile'],
  ['профиля', 'profile'],
  ['счёт', 'account'],
  ['счёта', 'account'],
  ['счета', 'accounts'],
  ['карта', 'map'],
  ['карты', 'map'],
])

// ============================================================
// TRANSLATION FUNCTION
// ============================================================

function translate(value) {
  if (typeof value !== 'string') return value

  // 1. Exact match
  if (dict.has(value)) return dict.get(value)

  // 2. Pattern match
  for (const [pattern, replacement] of patterns) {
    if (pattern.test(value)) {
      return value.replace(pattern, replacement)
    }
  }

  // 3. If it's a very short string (1-3 words), try word-level translation
  const words = value.split(' ')
  if (words.length <= 3) {
    const translated = words.map(w => {
      const lower = w.toLowerCase()
      return wordDict.get(lower) || w
    }).join(' ')
    if (translated !== value) return translated
  }

  // 4. Return original (will need manual review)
  return value
}

function translateObject(obj) {
  if (typeof obj === 'string') return translate(obj)
  if (typeof obj !== 'object' || obj === null) return obj
  if (Array.isArray(obj)) return obj.map(translateObject)

  const result = {}
  for (const [key, value] of Object.entries(obj)) {
    result[key] = translateObject(value)
  }
  return result
}

// ============================================================
// MANUAL OVERRIDES FOR COMPLEX SECTIONS
// ============================================================

// Override entire sections that need precise translations
const manualOverrides = {
  common: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    submit: 'Submit',
    send: 'Send',
    download: 'Download',
    export: 'Export',
    import: 'Import',
    back: 'Back',
    close: 'Close',
    search: 'Search',
    filter: 'Filter',
    reset: 'Reset',
    retry: 'Retry',
    logout: 'Logout',
    apply: 'Apply',
    confirm: 'Confirm',
    add: 'Add',
    remove: 'Remove',
    view: 'View',
    print: 'Print',
    more: 'More',
    all: 'All',
    yes: 'Yes',
    no: 'No',
    loading: 'Loading...',
    noData: 'No data',
    actions: 'Actions',
    status: 'Status',
    date: 'Date',
    period: 'Period',
    total: 'Total',
    amount: 'Amount',
    number: 'Number',
    name: 'Name',
    description: 'Description',
    type: 'Type',
    region: 'Region',
    allRegions: 'All regions',
    from: 'From',
    to: 'To',
    dateFrom: 'From date',
    dateTo: 'To date',
    periodFrom: 'Period from',
    periodTo: 'Period to',
    shown: 'Shown',
    of: 'of',
    records: 'records',
    prev: 'Previous',
    next: 'Next',
    skipToContent: 'Skip to content',
    mainNav: 'Main navigation',
    menu: 'Menu',
    openMenu: 'Open menu',
    logoutSystem: 'Log out',
    home: 'Home',
    excel: 'Excel',
    pdf: 'PDF',
    generate: 'Generate',
    generating: 'Generating...',
    reportParams: 'Report Parameters',
    found: 'Found',
    objects: 'objects',
    som: 'KGS',
    days: 'days',
    tons: 't',
    pieces: 'pcs',
    percent: '%',
    backToList: 'Back to list',
    saveDraft: 'Save draft',
    addRow: 'Add row',
    sendReport: 'Submit report',
    createReport: 'Create report',
    downloadExcel: 'Download Excel',
    downloadPdf: 'Download PDF',
    downloadReportExcel: 'Download report (Excel)',
    downloadReportPdf: 'Download report (PDF)',
    exportReport: 'Export report',
    exportData: 'Export data',
    details: 'Details',
    accept: 'Accept',
    reject: 'Reject',
    success: 'Success',
    preview: 'Preview',
    companyName: 'SE Eco Operator',
    companyNameFull: 'SE "Eco Operator"',
    companyType: 'State Enterprise',
    workHours: 'Mon-Fri: 9:00 AM - 6:00 PM',
    weekendHours: 'Sat-Sun: closed',
    city: 'Bishkek',
    addressStreet: '228 Toktogul St.',
    addressFull: 'Bishkek, 228 Toktogul St.',
    addressZip: '720040, Bishkek',
    allStatuses: 'All statuses',
  },
  roles: {
    business: 'Payer',
    ecoOperator: 'SE "Eco Operator"',
    employee: 'MNRE KR Employee',
    admin: 'Administrator',
  },
  nav: {
    home: 'Home',
    about: 'About',
    legislation: 'Legislation',
    licenses: 'Licenses',
    publications: 'Publications',
    gisMap: 'GIS Map',
    calculator: 'EPR Calculator',
    contests: 'Tenders',
    registries: 'Registries',
    glossary: 'Glossary',
    registration: 'Registration',
    login: 'Sign In',
    business: {
      dashboard: 'Dashboard',
      calculator: 'Fee Calculation',
      reports: 'Recycling Reports',
      declarations: 'Declarations',
      payments: 'Payments',
      documents: 'Documents',
      normatives: 'Norms & Rates',
      account: 'Account Statement',
      refunds: 'Fee Refund',
      profile: 'Company Profile',
    },
    ecoOperator: {
      dashboard: 'Dashboard',
      organizations: 'Organizations',
      incomingDeclarations: 'Incoming Declarations',
      incomingReports: 'Recycling Reports',
      calculations: 'Incoming Calculations',
      recyclers: 'Recyclers Registry',
      landfills: 'Landfills',
      analytics: 'Analytics & Reports',
      accounts: 'Accounts',
      refunds: 'Refund Requests',
      payers: 'Payers Registry',
      profile: 'Company Profiles',
    },
    employee: {
      dashboard: 'Dashboard',
      analytics: 'Analytics',
      payers: 'Payers Registry',
      compliance: 'Compliance',
      licenses: 'Licenses',
      wasteTypes: 'Waste Types',
      landfills: 'Landfills & Dumps',
      landfillsTbo: 'Landfills',
      collectionPoints: 'Collection Points',
      reports: 'Reporting',
      map: 'GIS Map',
      profile: 'My Profile',
    },
    admin: {
      dashboard: 'Dashboard',
      users: 'Users',
      roles: 'Roles & Permissions',
      references: 'References',
      audit: 'Audit Log',
      notifications: 'Notifications',
      settings: 'System Settings',
    },
  },
  error: {
    loadingFailed: 'An error occurred while loading data',
    retry: 'Retry',
    unexpectedError: 'Unexpected error',
    networkError: 'Network error. Check your internet connection',
    accessDenied: 'Access denied',
    serverError: 'Server error',
    apiError: 'API error',
    authError: 'Authorization error',
    registrationError: 'Registration error',
  },
  notFound: {
    title: 'Page Not Found',
    description: 'The requested page does not exist or has been moved',
    goHome: 'Go to Home',
  },
  notifications: {
    title: 'Notifications',
    readAll: 'Mark all as read',
    empty: 'No notifications',
    viewAll: 'View all notifications',
  },
}

// ============================================================
// BUILD EN.JSON
// ============================================================

// Start with auto-translated version
const en = translateObject(ru)

// Apply manual overrides (deep merge)
function deepMerge(target, source) {
  for (const [key, value] of Object.entries(source)) {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      if (!target[key] || typeof target[key] !== 'object') {
        target[key] = {}
      }
      deepMerge(target[key], value)
    } else {
      target[key] = value
    }
  }
  return target
}

deepMerge(en, manualOverrides)

// ============================================================
// WRITE OUTPUT
// ============================================================

fs.writeFileSync(enPath, JSON.stringify(en, null, 2), 'utf8')

// Count translation coverage
let total = 0
let translated = 0
let untranslated = []

function countTranslations(obj, ruObj, path = '') {
  for (const [key, value] of Object.entries(obj)) {
    const currentPath = path ? `${path}.${key}` : key
    if (typeof value === 'string') {
      total++
      const ruValue = typeof ruObj === 'object' ? ruObj[key] : undefined
      if (value !== ruValue) {
        translated++
      } else {
        // Check if it's intentionally the same (numbers, codes, etc.)
        if (/^[\d\s%+.\-\/()]+$/.test(value) || /^[A-Z]{2,}/.test(value) || value.length <= 2) {
          translated++ // These are fine as-is
        } else {
          untranslated.push(currentPath)
        }
      }
    } else if (typeof value === 'object' && value !== null) {
      countTranslations(value, typeof ruObj === 'object' ? ruObj[key] : {}, currentPath)
    }
  }
}

countTranslations(en, ru)

const coverage = ((translated / total) * 100).toFixed(1)
console.log(`\n✅ en.json created: ${enPath}`)
console.log(`📊 Translation coverage: ${translated}/${total} (${coverage}%)`)
console.log(`📝 Untranslated strings: ${untranslated.length}`)
if (untranslated.length > 0 && untranslated.length <= 30) {
  console.log('\nUntranslated keys:')
  untranslated.forEach(k => console.log(`  - ${k}`))
}
if (untranslated.length > 30) {
  console.log(`\nFirst 30 untranslated keys:`)
  untranslated.slice(0, 30).forEach(k => console.log(`  - ${k}`))
  console.log(`  ... and ${untranslated.length - 30} more`)
}
