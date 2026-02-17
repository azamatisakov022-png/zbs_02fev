import { reactive } from 'vue'

// ── Types ──────────────────────────────────────────────────

export type PayerCategory = 'importer' | 'producer' | 'both'
export type PayerSubcategory = 'eaeu' | 'thirdCountry'
export type ReportingStatus = 'onTime' | 'expected' | 'overdue'
export type SettlementStatus = 'clear' | 'overpaid' | 'debt'
export type SystemStatus = 'active' | 'suspended' | 'excluded'
export type DeclarationStatus = 'draft' | 'review' | 'approved' | 'rejected' | 'paid'
export type PaymentStatus = 'completed' | 'pending' | 'rejected'

export interface PayerDeclaration {
  id: string
  period: string
  operationType: string
  mass: number
  amount: number
  status: DeclarationStatus
  submittedAt: string
}

export interface PayerPayment {
  id: string
  date: string
  amount: number
  method: string
  status: PaymentStatus
}

export interface AuditEntry {
  date: string
  action: string
  user: string
  details: string
}

export interface PayerComment {
  id: number
  date: string
  author: string
  text: string
}

export interface PayerDocument {
  id: number
  name: string
  type: string
  size: string
  uploadedAt: string
}

export interface Payer {
  id: number
  name: string
  shortName: string
  opf: string
  inn: string
  region: string
  category: PayerCategory
  subcategory?: PayerSubcategory
  declarationsCount: number
  lastCalculationDate: string
  reportingStatus: ReportingStatus
  lastPaymentDate: string
  lastPaymentAmount: number
  totalCharged: number
  totalPaid: number
  settlementStatus: SettlementStatus
  settlementAmount: number
  registeredAt: string
  contactPerson: string
  contactPhone: string
  contactEmail: string
  legalAddress: string
  actualAddress: string
  director: string
  directorPosition: string
  website: string
  oked: string
  systemStatus: SystemStatus
  suspensionReason: string
  lastUpdated: string
  lastUpdatedBy: string
  declarations: PayerDeclaration[]
  payments: PayerPayment[]
  auditLog: AuditEntry[]
  comments: PayerComment[]
  documents: PayerDocument[]
}

// ── Labels ─────────────────────────────────────────────────

export const categoryLabels: Record<PayerCategory, string> = {
  importer: 'Импортер',
  producer: 'Производитель',
  both: 'Импортер и производитель',
}
export const categoryColors: Record<PayerCategory, string> = {
  importer: 'bg-blue-100 text-blue-800',
  producer: 'bg-purple-100 text-purple-800',
  both: 'bg-indigo-100 text-indigo-800',
}
export const subcategoryLabels: Record<PayerSubcategory, string> = {
  eaeu: 'Страны ЕАЭС',
  thirdCountry: 'Третьи страны',
}
export const reportingLabels: Record<ReportingStatus, string> = {
  onTime: 'Сдана вовремя',
  expected: 'Ожидается',
  overdue: 'Просрочена',
}
export const reportingColors: Record<ReportingStatus, string> = {
  onTime: 'bg-green-100 text-green-800',
  expected: 'bg-yellow-100 text-yellow-800',
  overdue: 'bg-red-100 text-red-800',
}
export const settlementLabels: Record<SettlementStatus, string> = {
  clear: 'Без задолженности',
  overpaid: 'Переплата',
  debt: 'Задолженность',
}
export const settlementColors: Record<SettlementStatus, string> = {
  clear: 'bg-green-100 text-green-800',
  overpaid: 'bg-blue-100 text-blue-800',
  debt: 'bg-red-100 text-red-800',
}
export const systemStatusLabels: Record<SystemStatus, string> = {
  active: 'Активен',
  suspended: 'Приостановлен',
  excluded: 'Исключён',
}
export const systemStatusColors: Record<SystemStatus, string> = {
  active: 'bg-green-100 text-green-800',
  suspended: 'bg-yellow-100 text-yellow-800',
  excluded: 'bg-red-100 text-red-800',
}
export const declarationStatusLabels: Record<DeclarationStatus, string> = {
  draft: 'Черновик',
  review: 'На рассмотрении',
  approved: 'Одобрена',
  rejected: 'Отклонена',
  paid: 'Оплачена',
}
export const declarationStatusColors: Record<DeclarationStatus, string> = {
  draft: 'bg-gray-100 text-gray-700',
  review: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  paid: 'bg-blue-100 text-blue-800',
}
export const paymentStatusLabels: Record<PaymentStatus, string> = {
  completed: 'Проведён',
  pending: 'Ожидает подтверждения',
  rejected: 'Отклонён',
}
export const paymentStatusColors: Record<PaymentStatus, string> = {
  completed: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  rejected: 'bg-red-100 text-red-800',
}

// ── Mock Data ──────────────────────────────────────────────

let nextCommentId = 100

const state = reactive<{ payers: Payer[] }>({
  payers: [
    {
      id: 1,
      name: 'ОсОО "Бишкек Импорт Трейд"',
      shortName: 'Бишкек Импорт Трейд',
      opf: 'ОсОО',
      inn: '02306200110024',
      region: 'г. Бишкек',
      category: 'importer',
      subcategory: 'thirdCountry',
      declarationsCount: 4,
      lastCalculationDate: '12.01.2026',
      reportingStatus: 'onTime',
      lastPaymentDate: '25.01.2026',
      lastPaymentAmount: 532000,
      totalCharged: 2450000,
      totalPaid: 2450000,
      settlementStatus: 'clear',
      settlementAmount: 0,
      registeredAt: '15.03.2024',
      contactPerson: 'Исаев Тимур Алексеевич',
      contactPhone: '+996 555 123 456',
      contactEmail: 'isaev@bishkekimport.kg',
      legalAddress: 'г. Бишкек, ул. Киевская, д. 107, оф. 302',
      actualAddress: 'г. Бишкек, ул. Киевская, д. 107, оф. 302',
      director: 'Касымов Руслан Бекович',
      directorPosition: 'Генеральный директор',
      website: 'www.bishkekimport.kg',
      oked: '46.90 — Неспециализированная оптовая торговля',
      systemStatus: 'active',
      suspensionReason: '',
      lastUpdated: '12.01.2026',
      lastUpdatedBy: 'Мамытова А.К.',
      declarations: [
        { id: 'ДЕК-2026-0001', period: 'Q1 2026', operationType: 'Импорт', mass: 12.5, amount: 625000, status: 'paid', submittedAt: '15.01.2026' },
        { id: 'ДЕК-2026-0008', period: 'Q2 2026', operationType: 'Импорт', mass: 10.8, amount: 540000, status: 'approved', submittedAt: '05.04.2026' },
        { id: 'ДЕК-2026-0015', period: 'Q3 2026', operationType: 'Импорт', mass: 14.2, amount: 710000, status: 'review', submittedAt: '10.07.2026' },
        { id: 'ДЕК-2026-0023', period: 'Q4 2026', operationType: 'Импорт', mass: 11.5, amount: 575000, status: 'draft', submittedAt: '' },
      ],
      payments: [
        { id: 'ПЛТ-2026-0001', date: '25.01.2026', amount: 625000, method: 'Банковский перевод', status: 'completed' },
        { id: 'ПЛТ-2026-0012', date: '18.04.2026', amount: 540000, method: 'Банковский перевод', status: 'completed' },
        { id: 'ПЛТ-2026-0025', date: '20.07.2026', amount: 710000, method: 'Онлайн оплата', status: 'completed' },
        { id: 'ПЛТ-2026-0038', date: '15.10.2026', amount: 575000, method: 'Банковский перевод', status: 'pending' },
      ],
      auditLog: [
        { date: '12.01.2026 14:30', action: 'Подана декларация', user: 'Исаев Т.А.', details: 'Декларация ДЕК-2026-0001 за Q1 2026' },
        { date: '18.01.2026 10:15', action: 'Декларация одобрена', user: 'Мамытова А.К.', details: 'ДЕК-2026-0001 одобрена' },
        { date: '25.01.2026 16:45', action: 'Платёж проведён', user: 'Система', details: 'ПЛТ-2026-0001 на сумму 625 000 сом' },
        { date: '05.04.2026 09:00', action: 'Подана декларация', user: 'Исаев Т.А.', details: 'Декларация ДЕК-2026-0008 за Q2 2026' },
        { date: '12.04.2026 11:20', action: 'Обновлены контактные данные', user: 'Исаев Т.А.', details: 'Изменён номер телефона' },
      ],
      comments: [
        { id: 1, date: '25.01.2026 14:30', author: 'Мамытова А.К.', text: 'Проверены документы, всё в порядке. Декларация за Q1 одобрена.' },
        { id: 2, date: '05.03.2026 10:15', author: 'Асанов Б.Т.', text: 'Отчётность за Q3 просрочена, направлено уведомление на email.' },
        { id: 3, date: '10.07.2026 09:00', author: 'Мамытова А.К.', text: 'Декларация за Q3 на рассмотрении, ожидаем подтверждающие документы.' },
      ],
      documents: [
        { id: 1, name: 'Свидетельство о регистрации', type: 'pdf', size: '1.2 МБ', uploadedAt: '15.03.2024' },
        { id: 2, name: 'Лицензия на импорт', type: 'pdf', size: '0.8 МБ', uploadedAt: '15.03.2024' },
        { id: 3, name: 'Доверенность контактного лица', type: 'jpg', size: '0.5 МБ', uploadedAt: '20.03.2024' },
      ],
    },
    {
      id: 2,
      name: 'ОАО "Кыргыз Электроникс"',
      shortName: 'Кыргыз Электроникс',
      opf: 'ОАО',
      inn: '01208200215089',
      region: 'г. Бишкек',
      category: 'both',
      subcategory: 'eaeu',
      declarationsCount: 3,
      lastCalculationDate: '05.03.2026',
      reportingStatus: 'overdue',
      lastPaymentDate: '10.02.2026',
      lastPaymentAmount: 412500,
      totalCharged: 3180000,
      totalPaid: 2856425,
      settlementStatus: 'debt',
      settlementAmount: 323575,
      registeredAt: '20.06.2023',
      contactPerson: 'Токтобекова Айзада Нурлановна',
      contactPhone: '+996 700 987 654',
      contactEmail: 'toktobekova@kgelectronics.kg',
      legalAddress: 'г. Бишкек, пр. Чуй, д. 215',
      actualAddress: 'г. Бишкек, ул. Абдрахманова, д. 170, оф. 5',
      director: 'Жумабеков Эркин Талантович',
      directorPosition: 'Председатель правления',
      website: 'www.kgelectronics.kg',
      oked: '26.20 — Производство компьютеров и периферии',
      systemStatus: 'active',
      suspensionReason: '',
      lastUpdated: '05.03.2026',
      lastUpdatedBy: 'Токтобекова А.Н.',
      declarations: [
        { id: 'ДЕК-2026-0003', period: 'Q1 2026', operationType: 'Импорт и производство', mass: 18.5, amount: 1125000, status: 'paid', submittedAt: '20.01.2026' },
        { id: 'ДЕК-2026-0011', period: 'Q2 2026', operationType: 'Импорт и производство', mass: 16.2, amount: 987500, status: 'paid', submittedAt: '12.04.2026' },
        { id: 'ДЕК-2026-0019', period: 'Q3 2026', operationType: 'Импорт', mass: 17.5, amount: 1067500, status: 'review', submittedAt: '05.07.2026' },
      ],
      payments: [
        { id: 'ПЛТ-2026-0003', date: '28.01.2026', amount: 1125000, method: 'Банковский перевод', status: 'completed' },
        { id: 'ПЛТ-2026-0014', date: '20.04.2026', amount: 987500, method: 'Банковский перевод', status: 'completed' },
        { id: 'ПЛТ-2026-0028', date: '10.02.2026', amount: 412500, method: 'Онлайн оплата', status: 'completed' },
      ],
      auditLog: [
        { date: '20.01.2026 08:45', action: 'Подана декларация', user: 'Токтобекова А.Н.', details: 'ДЕК-2026-0003 за Q1 2026' },
        { date: '25.01.2026 14:10', action: 'Декларация одобрена', user: 'Мамытова А.К.', details: 'ДЕК-2026-0003' },
        { date: '05.03.2026 09:30', action: 'Просрочена отчётность', user: 'Система', details: 'Отчёт за Q3 не подан в срок' },
      ],
      comments: [
        { id: 4, date: '15.02.2026 11:00', author: 'Мамытова А.К.', text: 'Необходимо направить уведомление о просроченной отчётности за Q3.' },
        { id: 5, date: '20.04.2026 16:45', author: 'Асанов Б.Т.', text: 'Компания запросила рассрочку платежа. Документы переданы на рассмотрение.' },
      ],
      documents: [
        { id: 4, name: 'Свидетельство о регистрации', type: 'pdf', size: '1.5 МБ', uploadedAt: '20.06.2023' },
        { id: 5, name: 'Устав предприятия', type: 'pdf', size: '2.1 МБ', uploadedAt: '20.06.2023' },
      ],
    },
    {
      id: 3,
      name: 'ИП Асанов Б.Т.',
      shortName: 'ИП Асанов',
      opf: 'ИП',
      inn: '22708198801234',
      region: 'Чуйская область',
      category: 'producer',
      declarationsCount: 2,
      lastCalculationDate: '18.02.2026',
      reportingStatus: 'onTime',
      lastPaymentDate: '20.02.2026',
      lastPaymentAmount: 95000,
      totalCharged: 185000,
      totalPaid: 210000,
      settlementStatus: 'overpaid',
      settlementAmount: 25000,
      registeredAt: '10.09.2024',
      contactPerson: 'Асанов Бакыт Турдубекович',
      contactPhone: '+996 551 456 789',
      contactEmail: 'asanov.bt@mail.kg',
      legalAddress: 'Чуйская обл., г. Кара-Балта, ул. Ленина, д. 45',
      actualAddress: 'Чуйская обл., г. Кара-Балта, ул. Ленина, д. 45',
      director: 'Асанов Бакыт Турдубекович',
      directorPosition: 'Индивидуальный предприниматель',
      website: '',
      oked: '22.22 — Производство пластмассовых изделий для упаковки',
      systemStatus: 'active',
      suspensionReason: '',
      lastUpdated: '20.02.2026',
      lastUpdatedBy: 'Асанов Б.Т.',
      declarations: [
        { id: 'ДЕК-2026-0005', period: 'Q1 2026', operationType: 'Производство', mass: 1.8, amount: 90000, status: 'paid', submittedAt: '28.01.2026' },
        { id: 'ДЕК-2026-0013', period: 'Q2 2026', operationType: 'Производство', mass: 1.9, amount: 95000, status: 'paid', submittedAt: '10.04.2026' },
      ],
      payments: [
        { id: 'ПЛТ-2026-0005', date: '05.02.2026', amount: 115000, method: 'Касса', status: 'completed' },
        { id: 'ПЛТ-2026-0016', date: '20.04.2026', amount: 95000, method: 'Касса', status: 'completed' },
      ],
      auditLog: [
        { date: '28.01.2026 11:00', action: 'Подана декларация', user: 'Асанов Б.Т.', details: 'ДЕК-2026-0005 за Q1 2026' },
        { date: '05.02.2026 15:30', action: 'Платёж проведён', user: 'Система', details: 'ПЛТ-2026-0005 на сумму 115 000 сом (переплата)' },
      ],
      comments: [],
      documents: [
        { id: 6, name: 'Свидетельство ИП', type: 'pdf', size: '0.4 МБ', uploadedAt: '10.09.2024' },
      ],
    },
    {
      id: 4,
      name: 'ОсОО "Ош Пластик"',
      shortName: 'Ош Пластик',
      opf: 'ОсОО',
      inn: '31505200310567',
      region: 'Ошская область',
      category: 'producer',
      declarationsCount: 4,
      lastCalculationDate: '08.01.2026',
      reportingStatus: 'onTime',
      lastPaymentDate: '15.01.2026',
      lastPaymentAmount: 287000,
      totalCharged: 1148000,
      totalPaid: 1148000,
      settlementStatus: 'clear',
      settlementAmount: 0,
      registeredAt: '01.02.2024',
      contactPerson: 'Эркинбеков Нурлан Маратович',
      contactPhone: '+996 773 222 333',
      contactEmail: 'erkinbekov@oshplastic.kg',
      legalAddress: 'г. Ош, ул. Курманжан Датки, д. 89',
      actualAddress: 'г. Ош, промзона Кара-Суу, участок 12',
      director: 'Абдуллаев Фарход Ильхомович',
      directorPosition: 'Директор',
      website: 'www.oshplastic.kg',
      oked: '22.21 — Производство пластмассовых плит и профилей',
      systemStatus: 'active',
      suspensionReason: '',
      lastUpdated: '08.01.2026',
      lastUpdatedBy: 'Эркинбеков Н.М.',
      declarations: [
        { id: 'ДЕК-2026-0002', period: 'Q1 2026', operationType: 'Производство', mass: 5.6, amount: 280000, status: 'paid', submittedAt: '12.01.2026' },
        { id: 'ДЕК-2026-0010', period: 'Q2 2026', operationType: 'Производство', mass: 5.9, amount: 295000, status: 'paid', submittedAt: '08.04.2026' },
        { id: 'ДЕК-2026-0017', period: 'Q3 2026', operationType: 'Производство', mass: 5.7, amount: 286000, status: 'paid', submittedAt: '10.07.2026' },
        { id: 'ДЕК-2026-0024', period: 'Q4 2026', operationType: 'Производство', mass: 5.7, amount: 287000, status: 'approved', submittedAt: '09.10.2026' },
      ],
      payments: [
        { id: 'ПЛТ-2026-0002', date: '20.01.2026', amount: 280000, method: 'Банковский перевод', status: 'completed' },
        { id: 'ПЛТ-2026-0013', date: '15.04.2026', amount: 295000, method: 'Банковский перевод', status: 'completed' },
        { id: 'ПЛТ-2026-0026', date: '18.07.2026', amount: 286000, method: 'Банковский перевод', status: 'completed' },
        { id: 'ПЛТ-2026-0039', date: '15.10.2026', amount: 287000, method: 'Банковский перевод', status: 'pending' },
      ],
      auditLog: [
        { date: '12.01.2026 09:15', action: 'Подана декларация', user: 'Эркинбеков Н.М.', details: 'ДЕК-2026-0002 за Q1 2026' },
        { date: '15.01.2026 13:40', action: 'Платёж проведён', user: 'Система', details: 'ПЛТ-2026-0002' },
      ],
      comments: [],
      documents: [
        { id: 7, name: 'Свидетельство о регистрации', type: 'pdf', size: '1.0 МБ', uploadedAt: '01.02.2024' },
      ],
    },
    {
      id: 5,
      name: 'ОсОО "Каракол Трейдинг"',
      shortName: 'Каракол Трейдинг',
      opf: 'ОсОО',
      inn: '04102200415023',
      region: 'Иссык-Кульская область',
      category: 'importer',
      subcategory: 'eaeu',
      declarationsCount: 2,
      lastCalculationDate: '20.02.2026',
      reportingStatus: 'expected',
      lastPaymentDate: '28.02.2026',
      lastPaymentAmount: 195000,
      totalCharged: 780000,
      totalPaid: 585000,
      settlementStatus: 'debt',
      settlementAmount: 195000,
      registeredAt: '12.08.2024',
      contactPerson: 'Чыныбаев Айбек Дастанович',
      contactPhone: '+996 550 333 444',
      contactEmail: 'chynybaev@karakoltrading.kg',
      legalAddress: 'г. Каракол, ул. Тоголок Молдо, д. 22',
      actualAddress: 'г. Каракол, ул. Тоголок Молдо, д. 22',
      director: 'Чыныбаев Айбек Дастанович',
      directorPosition: 'Директор',
      website: '',
      oked: '46.49 — Оптовая торговля бытовыми товарами',
      systemStatus: 'active',
      suspensionReason: '',
      lastUpdated: '20.02.2026',
      lastUpdatedBy: 'Чыныбаев А.Д.',
      declarations: [
        { id: 'ДЕК-2026-0006', period: 'Q1 2026', operationType: 'Импорт', mass: 7.8, amount: 390000, status: 'paid', submittedAt: '20.01.2026' },
        { id: 'ДЕК-2026-0014', period: 'Q2 2026', operationType: 'Импорт', mass: 7.8, amount: 390000, status: 'approved', submittedAt: '15.04.2026' },
      ],
      payments: [
        { id: 'ПЛТ-2026-0006', date: '28.01.2026', amount: 390000, method: 'Банковский перевод', status: 'completed' },
        { id: 'ПЛТ-2026-0017', date: '28.02.2026', amount: 195000, method: 'Онлайн оплата', status: 'completed' },
      ],
      auditLog: [
        { date: '20.01.2026 10:30', action: 'Подана декларация', user: 'Чыныбаев А.Д.', details: 'ДЕК-2026-0006 за Q1 2026' },
      ],
      comments: [],
      documents: [
        { id: 8, name: 'Свидетельство о регистрации', type: 'pdf', size: '0.9 МБ', uploadedAt: '12.08.2024' },
      ],
    },
    {
      id: 6,
      name: 'ОАО "Бишкек Мебель"',
      shortName: 'Бишкек Мебель',
      opf: 'ОАО',
      inn: '02309200617045',
      region: 'г. Бишкек',
      category: 'producer',
      declarationsCount: 3,
      lastCalculationDate: '15.03.2026',
      reportingStatus: 'onTime',
      lastPaymentDate: '20.03.2026',
      lastPaymentAmount: 156000,
      totalCharged: 468000,
      totalPaid: 468000,
      settlementStatus: 'clear',
      settlementAmount: 0,
      registeredAt: '05.01.2024',
      contactPerson: 'Сулайманова Гулзат Бейшеновна',
      contactPhone: '+996 312 654 321',
      contactEmail: 'sulaymanova@bm.kg',
      legalAddress: 'г. Бишкек, ул. Жибек-Жолу, д. 456',
      actualAddress: 'г. Бишкек, промзона Восточная, участок 7',
      director: 'Турдалиев Мирлан Кайратович',
      directorPosition: 'Президент',
      website: 'www.bishkekmebel.kg',
      oked: '31.01 — Производство мебели для офисов и предприятий',
      systemStatus: 'active',
      suspensionReason: '',
      lastUpdated: '15.03.2026',
      lastUpdatedBy: 'Сулайманова Г.Б.',
      declarations: [
        { id: 'ДЕК-2026-0004', period: 'Q1 2026', operationType: 'Производство', mass: 3.2, amount: 156000, status: 'paid', submittedAt: '18.01.2026' },
        { id: 'ДЕК-2026-0012', period: 'Q2 2026', operationType: 'Производство', mass: 3.1, amount: 156000, status: 'paid', submittedAt: '12.04.2026' },
        { id: 'ДЕК-2026-0020', period: 'Q3 2026', operationType: 'Производство', mass: 3.2, amount: 156000, status: 'paid', submittedAt: '08.07.2026' },
      ],
      payments: [
        { id: 'ПЛТ-2026-0004', date: '25.01.2026', amount: 156000, method: 'Банковский перевод', status: 'completed' },
        { id: 'ПЛТ-2026-0015', date: '18.04.2026', amount: 156000, method: 'Банковский перевод', status: 'completed' },
        { id: 'ПЛТ-2026-0027', date: '15.07.2026', amount: 156000, method: 'Банковский перевод', status: 'completed' },
      ],
      auditLog: [
        { date: '18.01.2026 08:30', action: 'Подана декларация', user: 'Сулайманова Г.Б.', details: 'ДЕК-2026-0004 за Q1 2026' },
      ],
      comments: [],
      documents: [
        { id: 9, name: 'Свидетельство о регистрации', type: 'pdf', size: '1.1 МБ', uploadedAt: '05.01.2024' },
      ],
    },
    {
      id: 7,
      name: 'ОсОО "Южный Текстиль"',
      shortName: 'Южный Текстиль',
      opf: 'ОсОО',
      inn: '31508200718091',
      region: 'Ошская область',
      category: 'importer',
      subcategory: 'thirdCountry',
      declarationsCount: 1,
      lastCalculationDate: '10.01.2026',
      reportingStatus: 'overdue',
      lastPaymentDate: '15.12.2025',
      lastPaymentAmount: 320000,
      totalCharged: 1560000,
      totalPaid: 890000,
      settlementStatus: 'debt',
      settlementAmount: 670000,
      registeredAt: '22.04.2024',
      contactPerson: 'Маматов Элдияр Кубанычбекович',
      contactPhone: '+996 778 111 222',
      contactEmail: 'mamatov@southtextile.kg',
      legalAddress: 'г. Ош, ул. Масалиева, д. 56',
      actualAddress: 'г. Ош, ул. Масалиева, д. 56',
      director: 'Маматов Элдияр Кубанычбекович',
      directorPosition: 'Директор',
      website: '',
      oked: '46.41 — Оптовая торговля текстильными изделиями',
      systemStatus: 'suspended',
      suspensionReason: 'Задолженность по утилизационному сбору свыше 6 месяцев',
      lastUpdated: '01.02.2026',
      lastUpdatedBy: 'Мамытова А.К.',
      declarations: [
        { id: 'ДЕК-2026-0007', period: 'Q1 2026', operationType: 'Импорт', mass: 25.0, amount: 780000, status: 'rejected', submittedAt: '10.01.2026' },
      ],
      payments: [
        { id: 'ПЛТ-2025-0089', date: '15.12.2025', amount: 320000, method: 'Банковский перевод', status: 'completed' },
      ],
      auditLog: [
        { date: '10.01.2026 09:00', action: 'Подана декларация', user: 'Маматов Э.К.', details: 'ДЕК-2026-0007 за Q1 2026' },
        { date: '15.01.2026 14:20', action: 'Декларация отклонена', user: 'Мамытова А.К.', details: 'Неполные данные в ДЕК-2026-0007' },
        { date: '01.02.2026 10:00', action: 'Статус изменён на "Приостановлен"', user: 'Мамытова А.К.', details: 'Задолженность свыше 6 месяцев' },
      ],
      comments: [
        { id: 3, date: '01.02.2026 10:15', author: 'Мамытова А.К.', text: 'Приостановлен из-за длительной задолженности. Направлено уведомление по email.' },
      ],
      documents: [
        { id: 10, name: 'Свидетельство о регистрации', type: 'pdf', size: '0.9 МБ', uploadedAt: '22.04.2024' },
      ],
    },
    {
      id: 8,
      name: 'ОсОО "Нарын Агро"',
      shortName: 'Нарын Агро',
      opf: 'ОсОО',
      inn: '05603200819034',
      region: 'Нарынская область',
      category: 'producer',
      declarationsCount: 2,
      lastCalculationDate: '12.02.2026',
      reportingStatus: 'onTime',
      lastPaymentDate: '18.02.2026',
      lastPaymentAmount: 52000,
      totalCharged: 104000,
      totalPaid: 104000,
      settlementStatus: 'clear',
      settlementAmount: 0,
      registeredAt: '15.11.2024',
      contactPerson: 'Турдубаев Нурбек Алмазбекович',
      contactPhone: '+996 559 777 888',
      contactEmail: 'turdubaev@narynagro.kg',
      legalAddress: 'г. Нарын, ул. Ленина, д. 12',
      actualAddress: 'г. Нарын, ул. Ленина, д. 12',
      director: 'Турдубаев Нурбек Алмазбекович',
      directorPosition: 'Директор',
      website: '',
      oked: '10.31 — Переработка и консервирование картофеля',
      systemStatus: 'active',
      suspensionReason: '',
      lastUpdated: '12.02.2026',
      lastUpdatedBy: 'Турдубаев Н.А.',
      declarations: [
        { id: 'ДЕК-2026-0009', period: 'Q1 2026', operationType: 'Производство', mass: 1.0, amount: 52000, status: 'paid', submittedAt: '25.01.2026' },
        { id: 'ДЕК-2026-0018', period: 'Q2 2026', operationType: 'Производство', mass: 1.0, amount: 52000, status: 'approved', submittedAt: '10.04.2026' },
      ],
      payments: [
        { id: 'ПЛТ-2026-0009', date: '05.02.2026', amount: 52000, method: 'Касса', status: 'completed' },
        { id: 'ПЛТ-2026-0019', date: '18.04.2026', amount: 52000, method: 'Касса', status: 'completed' },
      ],
      auditLog: [
        { date: '25.01.2026 12:00', action: 'Подана декларация', user: 'Турдубаев Н.А.', details: 'ДЕК-2026-0009 за Q1 2026' },
      ],
      comments: [],
      documents: [
        { id: 11, name: 'Свидетельство о регистрации', type: 'pdf', size: '0.6 МБ', uploadedAt: '15.11.2024' },
      ],
    },
    {
      id: 9,
      name: 'ОАО "Центр Авто"',
      shortName: 'Центр Авто',
      opf: 'ОАО',
      inn: '02311200920078',
      region: 'г. Бишкек',
      category: 'importer',
      subcategory: 'thirdCountry',
      declarationsCount: 4,
      lastCalculationDate: '05.01.2026',
      reportingStatus: 'onTime',
      lastPaymentDate: '12.01.2026',
      lastPaymentAmount: 1250000,
      totalCharged: 4870000,
      totalPaid: 4980000,
      settlementStatus: 'overpaid',
      settlementAmount: 110000,
      registeredAt: '10.05.2023',
      contactPerson: 'Бекмуратов Данияр Эрланович',
      contactPhone: '+996 555 999 000',
      contactEmail: 'bekmurat@centerauto.kg',
      legalAddress: 'г. Бишкек, ул. Ахунбаева, д. 98',
      actualAddress: 'г. Бишкек, ул. Ахунбаева, д. 98',
      director: 'Бекмуратов Данияр Эрланович',
      directorPosition: 'Генеральный директор',
      website: 'www.centerauto.kg',
      oked: '45.11 — Торговля автомобилями и лёгкими автотранспортными средствами',
      systemStatus: 'active',
      suspensionReason: '',
      lastUpdated: '12.01.2026',
      lastUpdatedBy: 'Бекмуратов Д.Э.',
      declarations: [
        { id: 'ДЕК-2026-0016', period: 'Q1 2026', operationType: 'Импорт', mass: 45.0, amount: 1250000, status: 'paid', submittedAt: '05.01.2026' },
        { id: 'ДЕК-2026-0021', period: 'Q2 2026', operationType: 'Импорт', mass: 42.0, amount: 1180000, status: 'paid', submittedAt: '05.04.2026' },
        { id: 'ДЕК-2026-0025', period: 'Q3 2026', operationType: 'Импорт', mass: 44.0, amount: 1220000, status: 'paid', submittedAt: '05.07.2026' },
        { id: 'ДЕК-2026-0030', period: 'Q4 2026', operationType: 'Импорт', mass: 44.0, amount: 1220000, status: 'review', submittedAt: '05.10.2026' },
      ],
      payments: [
        { id: 'ПЛТ-2026-0010', date: '12.01.2026', amount: 1250000, method: 'Банковский перевод', status: 'completed' },
        { id: 'ПЛТ-2026-0020', date: '12.04.2026', amount: 1180000, method: 'Банковский перевод', status: 'completed' },
        { id: 'ПЛТ-2026-0029', date: '12.07.2026', amount: 1330000, method: 'Банковский перевод', status: 'completed' },
        { id: 'ПЛТ-2026-0040', date: '12.10.2026', amount: 1220000, method: 'Банковский перевод', status: 'pending' },
      ],
      auditLog: [
        { date: '05.01.2026 08:00', action: 'Подана декларация', user: 'Бекмуратов Д.Э.', details: 'ДЕК-2026-0016 за Q1 2026' },
        { date: '12.01.2026 16:00', action: 'Платёж проведён', user: 'Система', details: 'ПЛТ-2026-0010' },
      ],
      comments: [],
      documents: [
        { id: 12, name: 'Свидетельство о регистрации', type: 'pdf', size: '1.3 МБ', uploadedAt: '10.05.2023' },
        { id: 13, name: 'Лицензия на импорт авто', type: 'pdf', size: '0.7 МБ', uploadedAt: '10.05.2023' },
      ],
    },
    {
      id: 10,
      name: 'ОсОО "Токмок Стройматериалы"',
      shortName: 'Токмок Стройматериалы',
      opf: 'ОсОО',
      inn: '02415201021056',
      region: 'Чуйская область',
      category: 'producer',
      declarationsCount: 3,
      lastCalculationDate: '10.03.2026',
      reportingStatus: 'onTime',
      lastPaymentDate: '18.03.2026',
      lastPaymentAmount: 178000,
      totalCharged: 534000,
      totalPaid: 534000,
      settlementStatus: 'clear',
      settlementAmount: 0,
      registeredAt: '20.07.2024',
      contactPerson: 'Орозбаев Кубаныч Маратович',
      contactPhone: '+996 770 444 555',
      contactEmail: 'orozbaev@tokmokstroy.kg',
      legalAddress: 'г. Токмок, ул. Промышленная, д. 15',
      actualAddress: 'г. Токмок, ул. Промышленная, д. 15',
      director: 'Орозбаев Кубаныч Маратович',
      directorPosition: 'Директор',
      website: '',
      oked: '23.61 — Производство изделий из бетона',
      systemStatus: 'active',
      suspensionReason: '',
      lastUpdated: '10.03.2026',
      lastUpdatedBy: 'Орозбаев К.М.',
      declarations: [
        { id: 'ДЕК-2026-0022', period: 'Q1 2026', operationType: 'Производство', mass: 3.5, amount: 178000, status: 'paid', submittedAt: '15.01.2026' },
        { id: 'ДЕК-2026-0026', period: 'Q2 2026', operationType: 'Производство', mass: 3.5, amount: 178000, status: 'paid', submittedAt: '10.04.2026' },
        { id: 'ДЕК-2026-0031', period: 'Q3 2026', operationType: 'Производство', mass: 3.5, amount: 178000, status: 'paid', submittedAt: '08.07.2026' },
      ],
      payments: [
        { id: 'ПЛТ-2026-0011', date: '25.01.2026', amount: 178000, method: 'Банковский перевод', status: 'completed' },
        { id: 'ПЛТ-2026-0021', date: '18.04.2026', amount: 178000, method: 'Банковский перевод', status: 'completed' },
        { id: 'ПЛТ-2026-0030', date: '15.07.2026', amount: 178000, method: 'Банковский перевод', status: 'completed' },
      ],
      auditLog: [{ date: '15.01.2026 09:00', action: 'Подана декларация', user: 'Орозбаев К.М.', details: 'ДЕК-2026-0022 за Q1 2026' }],
      comments: [],
      documents: [{ id: 14, name: 'Свидетельство о регистрации', type: 'pdf', size: '0.8 МБ', uploadedAt: '20.07.2024' }],
    },
    {
      id: 11,
      name: 'ИП Мамбетова А.К.',
      shortName: 'ИП Мамбетова',
      opf: 'ИП',
      inn: '22709199201567',
      region: 'г. Бишкек',
      category: 'importer',
      subcategory: 'eaeu',
      declarationsCount: 1,
      lastCalculationDate: '20.01.2026',
      reportingStatus: 'expected',
      lastPaymentDate: '25.01.2026',
      lastPaymentAmount: 68000,
      totalCharged: 204000,
      totalPaid: 136000,
      settlementStatus: 'debt',
      settlementAmount: 68000,
      registeredAt: '05.12.2024',
      contactPerson: 'Мамбетова Асель Кубанычбековна',
      contactPhone: '+996 555 666 777',
      contactEmail: 'mambetova.ak@mail.kg',
      legalAddress: 'г. Бишкек, ул. Московская, д. 178, кв. 12',
      actualAddress: 'г. Бишкек, ул. Московская, д. 178, кв. 12',
      director: 'Мамбетова Асель Кубанычбековна',
      directorPosition: 'Индивидуальный предприниматель',
      website: '',
      oked: '47.71 — Розничная торговля одеждой',
      systemStatus: 'active',
      suspensionReason: '',
      lastUpdated: '20.01.2026',
      lastUpdatedBy: 'Мамбетова А.К.',
      declarations: [
        { id: 'ДЕК-2026-0027', period: 'Q1 2026', operationType: 'Импорт', mass: 1.4, amount: 68000, status: 'paid', submittedAt: '20.01.2026' },
      ],
      payments: [
        { id: 'ПЛТ-2026-0022', date: '25.01.2026', amount: 68000, method: 'Онлайн оплата', status: 'completed' },
        { id: 'ПЛТ-2026-0033', date: '25.04.2026', amount: 68000, method: 'Онлайн оплата', status: 'completed' },
      ],
      auditLog: [{ date: '20.01.2026 14:00', action: 'Подана декларация', user: 'Мамбетова А.К.', details: 'ДЕК-2026-0027 за Q1 2026' }],
      comments: [],
      documents: [{ id: 15, name: 'Свидетельство ИП', type: 'pdf', size: '0.3 МБ', uploadedAt: '05.12.2024' }],
    },
    {
      id: 12,
      name: 'ОсОО "Джалал-Абад Пак"',
      shortName: 'Джалал-Абад Пак',
      opf: 'ОсОО',
      inn: '41003201122089',
      region: 'Джалал-Абадская область',
      category: 'producer',
      declarationsCount: 3,
      lastCalculationDate: '08.03.2026',
      reportingStatus: 'onTime',
      lastPaymentDate: '15.03.2026',
      lastPaymentAmount: 245000,
      totalCharged: 735000,
      totalPaid: 735000,
      settlementStatus: 'clear',
      settlementAmount: 0,
      registeredAt: '18.03.2024',
      contactPerson: 'Абдыкеримов Тынчтыкбек',
      contactPhone: '+996 772 888 999',
      contactEmail: 'abdykerimov@japak.kg',
      legalAddress: 'г. Джалал-Абад, ул. Токтогула, д. 34',
      actualAddress: 'г. Джалал-Абад, промзона, участок 5',
      director: 'Абдыкеримов Тынчтыкбек Женишбекович',
      directorPosition: 'Директор',
      website: 'www.japak.kg',
      oked: '17.21 — Производство гофрированной бумаги и картона',
      systemStatus: 'active',
      suspensionReason: '',
      lastUpdated: '08.03.2026',
      lastUpdatedBy: 'Абдыкеримов Т.',
      declarations: [
        { id: 'ДЕК-2026-0028', period: 'Q1 2026', operationType: 'Производство', mass: 4.8, amount: 245000, status: 'paid', submittedAt: '18.01.2026' },
        { id: 'ДЕК-2026-0032', period: 'Q2 2026', operationType: 'Производство', mass: 4.8, amount: 245000, status: 'paid', submittedAt: '12.04.2026' },
        { id: 'ДЕК-2026-0035', period: 'Q3 2026', operationType: 'Производство', mass: 4.8, amount: 245000, status: 'approved', submittedAt: '10.07.2026' },
      ],
      payments: [
        { id: 'ПЛТ-2026-0023', date: '25.01.2026', amount: 245000, method: 'Банковский перевод', status: 'completed' },
        { id: 'ПЛТ-2026-0034', date: '18.04.2026', amount: 245000, method: 'Банковский перевод', status: 'completed' },
        { id: 'ПЛТ-2026-0041', date: '15.07.2026', amount: 245000, method: 'Банковский перевод', status: 'completed' },
      ],
      auditLog: [{ date: '18.01.2026 10:00', action: 'Подана декларация', user: 'Абдыкеримов Т.', details: 'ДЕК-2026-0028 за Q1 2026' }],
      comments: [],
      documents: [{ id: 16, name: 'Свидетельство о регистрации', type: 'pdf', size: '0.7 МБ', uploadedAt: '18.03.2024' }],
    },
    {
      id: 13,
      name: 'ОАО "КыргызИмпортАвто"',
      shortName: 'КыргызИмпортАвто',
      opf: 'ОАО',
      inn: '02312201223012',
      region: 'г. Бишкек',
      category: 'importer',
      subcategory: 'thirdCountry',
      declarationsCount: 2,
      lastCalculationDate: '15.02.2026',
      reportingStatus: 'overdue',
      lastPaymentDate: '20.02.2026',
      lastPaymentAmount: 890000,
      totalCharged: 3780000,
      totalPaid: 3200000,
      settlementStatus: 'debt',
      settlementAmount: 580000,
      registeredAt: '01.03.2023',
      contactPerson: 'Жайлообаев Сагынбек Чингизович',
      contactPhone: '+996 700 111 222',
      contactEmail: 'zhailobaev@kgimportauto.kg',
      legalAddress: 'г. Бишкек, пр. Мира, д. 320',
      actualAddress: 'г. Бишкек, пр. Мира, д. 320',
      director: 'Жайлообаев Сагынбек Чингизович',
      directorPosition: 'Генеральный директор',
      website: 'www.kgimportauto.kg',
      oked: '45.11 — Торговля автомобилями',
      systemStatus: 'active',
      suspensionReason: '',
      lastUpdated: '15.02.2026',
      lastUpdatedBy: 'Жайлообаев С.Ч.',
      declarations: [
        { id: 'ДЕК-2026-0029', period: 'Q1 2026', operationType: 'Импорт', mass: 38.0, amount: 1890000, status: 'paid', submittedAt: '15.01.2026' },
        { id: 'ДЕК-2026-0033', period: 'Q2 2026', operationType: 'Импорт', mass: 37.8, amount: 1890000, status: 'review', submittedAt: '12.04.2026' },
      ],
      payments: [
        { id: 'ПЛТ-2026-0024', date: '25.01.2026', amount: 1890000, method: 'Банковский перевод', status: 'completed' },
        { id: 'ПЛТ-2026-0035', date: '20.04.2026', amount: 890000, method: 'Банковский перевод', status: 'completed' },
        { id: 'ПЛТ-2026-0042', date: '20.02.2026', amount: 420000, method: 'Онлайн оплата', status: 'rejected' },
      ],
      auditLog: [
        { date: '15.01.2026 08:30', action: 'Подана декларация', user: 'Жайлообаев С.Ч.', details: 'ДЕК-2026-0029 за Q1 2026' },
        { date: '20.02.2026 15:00', action: 'Платёж отклонён', user: 'Система', details: 'ПЛТ-2026-0042 — недостаточно средств' },
      ],
      comments: [
        { id: 4, date: '21.02.2026 09:00', author: 'Мамытова А.К.', text: 'Платёж отклонён банком. Связаться с организацией для уточнения реквизитов.' },
      ],
      documents: [
        { id: 17, name: 'Свидетельство о регистрации', type: 'pdf', size: '1.4 МБ', uploadedAt: '01.03.2023' },
        { id: 18, name: 'Лицензия на импорт', type: 'pdf', size: '0.9 МБ', uploadedAt: '01.03.2023' },
      ],
    },
    {
      id: 14,
      name: 'ОсОО "Таласская Долина"',
      shortName: 'Таласская Долина',
      opf: 'ОсОО',
      inn: '06207201324045',
      region: 'Таласская область',
      category: 'producer',
      declarationsCount: 1,
      lastCalculationDate: '05.01.2026',
      reportingStatus: 'overdue',
      lastPaymentDate: '10.12.2025',
      lastPaymentAmount: 45000,
      totalCharged: 180000,
      totalPaid: 90000,
      settlementStatus: 'debt',
      settlementAmount: 90000,
      registeredAt: '10.06.2024',
      contactPerson: 'Эшматов Бектур Сарыбаевич',
      contactPhone: '+996 558 222 333',
      contactEmail: 'eshmatov@talasdolina.kg',
      legalAddress: 'г. Талас, ул. Бердике Баатыра, д. 28',
      actualAddress: 'г. Талас, ул. Бердике Баатыра, д. 28',
      director: 'Эшматов Бектур Сарыбаевич',
      directorPosition: 'Директор',
      website: '',
      oked: '10.39 — Прочие виды переработки фруктов и овощей',
      systemStatus: 'suspended',
      suspensionReason: 'Непредоставление отчётности за 2 квартала подряд',
      lastUpdated: '15.02.2026',
      lastUpdatedBy: 'Мамытова А.К.',
      declarations: [
        { id: 'ДЕК-2026-0034', period: 'Q1 2026', operationType: 'Производство', mass: 0.9, amount: 45000, status: 'paid', submittedAt: '25.01.2026' },
      ],
      payments: [
        { id: 'ПЛТ-2025-0090', date: '10.12.2025', amount: 45000, method: 'Касса', status: 'completed' },
        { id: 'ПЛТ-2026-0036', date: '05.02.2026', amount: 45000, method: 'Касса', status: 'completed' },
      ],
      auditLog: [
        { date: '25.01.2026 11:00', action: 'Подана декларация', user: 'Эшматов Б.С.', details: 'ДЕК-2026-0034 за Q1 2026' },
        { date: '15.02.2026 10:00', action: 'Статус изменён на "Приостановлен"', user: 'Мамытова А.К.', details: 'Непредоставление отчётности' },
      ],
      comments: [
        { id: 5, date: '15.02.2026 10:30', author: 'Мамытова А.К.', text: 'Не предоставлены отчёты за Q2 и Q3 2025. Приостановлен до погашения задолженности.' },
      ],
      documents: [{ id: 19, name: 'Свидетельство о регистрации', type: 'pdf', size: '0.5 МБ', uploadedAt: '10.06.2024' }],
    },
    {
      id: 15,
      name: 'ОсОО "Баткен Фрукт"',
      shortName: 'Баткен Фрукт',
      opf: 'ОсОО',
      inn: '07108201425078',
      region: 'Баткенская область',
      category: 'producer',
      declarationsCount: 2,
      lastCalculationDate: '18.02.2026',
      reportingStatus: 'onTime',
      lastPaymentDate: '22.02.2026',
      lastPaymentAmount: 78000,
      totalCharged: 156000,
      totalPaid: 156000,
      settlementStatus: 'clear',
      settlementAmount: 0,
      registeredAt: '01.09.2024',
      contactPerson: 'Сатыбалдиев Канатбек Алмазович',
      contactPhone: '+996 771 333 444',
      contactEmail: 'satybaldiev@batkenfruit.kg',
      legalAddress: 'г. Баткен, ул. Айтматова, д. 10',
      actualAddress: 'г. Баткен, ул. Айтматова, д. 10',
      director: 'Сатыбалдиев Канатбек Алмазович',
      directorPosition: 'Директор',
      website: '',
      oked: '10.32 — Производство фруктовых и овощных соков',
      systemStatus: 'active',
      suspensionReason: '',
      lastUpdated: '18.02.2026',
      lastUpdatedBy: 'Сатыбалдиев К.А.',
      declarations: [
        { id: 'ДЕК-2026-0036', period: 'Q1 2026', operationType: 'Производство', mass: 1.5, amount: 78000, status: 'paid', submittedAt: '20.01.2026' },
        { id: 'ДЕК-2026-0037', period: 'Q2 2026', operationType: 'Производство', mass: 1.5, amount: 78000, status: 'approved', submittedAt: '12.04.2026' },
      ],
      payments: [
        { id: 'ПЛТ-2026-0025', date: '28.01.2026', amount: 78000, method: 'Банковский перевод', status: 'completed' },
        { id: 'ПЛТ-2026-0037', date: '22.04.2026', amount: 78000, method: 'Банковский перевод', status: 'completed' },
      ],
      auditLog: [{ date: '20.01.2026 09:30', action: 'Подана декларация', user: 'Сатыбалдиев К.А.', details: 'ДЕК-2026-0036 за Q1 2026' }],
      comments: [],
      documents: [{ id: 20, name: 'Свидетельство о регистрации', type: 'pdf', size: '0.6 МБ', uploadedAt: '01.09.2024' }],
    },
    {
      id: 16,
      name: 'ОсОО "Иссык-Куль Ресурс"',
      shortName: 'Иссык-Куль Ресурс',
      opf: 'ОсОО',
      inn: '04109201526034',
      region: 'Иссык-Кульская область',
      category: 'both',
      subcategory: 'thirdCountry',
      declarationsCount: 0,
      lastCalculationDate: '',
      reportingStatus: 'overdue',
      lastPaymentDate: '',
      lastPaymentAmount: 0,
      totalCharged: 950000,
      totalPaid: 0,
      settlementStatus: 'debt',
      settlementAmount: 950000,
      registeredAt: '15.04.2024',
      contactPerson: 'Калыбеков Медер Жапарович',
      contactPhone: '+996 550 555 666',
      contactEmail: 'kalybekov@ikresurs.kg',
      legalAddress: 'г. Каракол, ул. Гебзе, д. 55',
      actualAddress: 'г. Каракол, ул. Гебзе, д. 55',
      director: 'Калыбеков Медер Жапарович',
      directorPosition: 'Директор',
      website: '',
      oked: '38.11 — Сбор неопасных отходов',
      systemStatus: 'excluded',
      suspensionReason: 'Систематическое уклонение от уплаты утилизационного сбора, решение суда от 01.12.2025',
      lastUpdated: '01.12.2025',
      lastUpdatedBy: 'Мамытова А.К.',
      declarations: [],
      payments: [],
      auditLog: [
        { date: '15.04.2024 09:00', action: 'Регистрация в системе', user: 'Мамытова А.К.', details: 'Постановка на учёт' },
        { date: '01.08.2025 10:00', action: 'Статус изменён на "Приостановлен"', user: 'Мамытова А.К.', details: 'Невнесение утильсбора' },
        { date: '01.12.2025 14:00', action: 'Статус изменён на "Исключён"', user: 'Мамытова А.К.', details: 'Решение суда от 01.12.2025' },
      ],
      comments: [
        { id: 6, date: '01.12.2025 14:30', author: 'Мамытова А.К.', text: 'Организация исключена из реестра по решению суда. Все начисления переданы в службу взыскания.' },
      ],
      documents: [
        { id: 21, name: 'Решение суда', type: 'pdf', size: '2.3 МБ', uploadedAt: '01.12.2025' },
        { id: 22, name: 'Свидетельство о регистрации', type: 'pdf', size: '0.8 МБ', uploadedAt: '15.04.2024' },
      ],
    },
  ],
})

// ── Store API ──────────────────────────────────────────────

function getAll(): Payer[] {
  return state.payers
}

function getById(id: number): Payer | undefined {
  return state.payers.find(p => p.id === id)
}

function getTotal(): number {
  return state.payers.length
}

function getActiveCount(): number {
  return state.payers.filter(p => p.systemStatus === 'active').length
}

function getSuspendedCount(): number {
  return state.payers.filter(p => p.systemStatus === 'suspended').length
}

function getDebtCount(): number {
  return state.payers.filter(p => p.settlementStatus === 'debt').length
}

function getTotalCharged(): number {
  return state.payers.reduce((sum, p) => sum + p.totalCharged, 0)
}

function getTotalPaid(): number {
  return state.payers.reduce((sum, p) => sum + p.totalPaid, 0)
}

function addComment(payerId: number, author: string, text: string): void {
  const payer = state.payers.find(p => p.id === payerId)
  if (payer) {
    payer.comments.push({
      id: nextCommentId++,
      date: new Date().toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      author,
      text,
    })
  }
}

let nextDocId = 100

function addDocument(payerId: number, name: string, type: string, size: string): void {
  const payer = state.payers.find(p => p.id === payerId)
  if (payer) {
    payer.documents.push({
      id: nextDocId++,
      name,
      type,
      size,
      uploadedAt: new Date().toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    })
  }
}

export function formatMoney(value: number): string {
  return value.toLocaleString('ru-RU')
}

export const payerStore = {
  state,
  getAll,
  getById,
  getTotal,
  getActiveCount,
  getSuspendedCount,
  getDebtCount,
  getTotalCharged,
  getTotalPaid,
  addComment,
  addDocument,
}
