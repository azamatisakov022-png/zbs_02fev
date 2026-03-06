import { reactive, computed } from 'vue'
import { FeedbackStatus, FeedbackCategory, type FeedbackStatusType, type FeedbackCategoryType } from '../constants/statuses'
import { notificationStore } from './notifications'
import i18n from '../i18n'

export interface FeedbackComment {
  id: string
  timestamp: string
  author: string
  authorRole: 'citizen' | 'employee'
  text: string
  internal: boolean // internal comments visible only to employees
}

export interface FeedbackTimelineEntry {
  id: string
  timestamp: string
  status: FeedbackStatusType
  author: string
  comment?: string
}

export interface FeedbackAttachment {
  id: number
  fileName: string
  fileSize: number
  fileType: string
  dataUrl: string
}

export interface FeedbackItem {
  id: number
  ticketNumber: string
  createdAt: string
  updatedAt: string
  status: FeedbackStatusType
  category: FeedbackCategoryType

  // Applicant data
  fullName: string
  phone: string
  email: string
  region?: string

  // Request content
  subject: string
  message: string
  attachments: FeedbackAttachment[]
  latitude?: number
  longitude?: number
  locationAddress?: string

  // Employee response
  assignedTo?: string
  assignedName?: string
  response?: string
  respondedAt?: string

  // Timeline & comments
  timeline: FeedbackTimelineEntry[]
  comments: FeedbackComment[]
}

export interface FeedbackFilters {
  status: FeedbackStatusType | ''
  category: FeedbackCategoryType | ''
  search: string
  dateFrom: string
  dateTo: string
}

let nextId = 100

function generateTicketNumber(): string {
  const year = new Date().getFullYear()
  const num = String(Math.floor(10000 + Math.random() * 90000))
  return `OBR-${year}-${num}`
}

// Mock data
const mockItems: FeedbackItem[] = [
  {
    id: 1, ticketNumber: 'OBR-2026-00001', createdAt: '2026-02-01', updatedAt: '2026-02-05',
    status: FeedbackStatus.RESOLVED, category: FeedbackCategory.COMPLAINT,
    fullName: 'Асанов Бакыт Жумабекович', phone: '+996 555 123456', email: 'asanov@mail.kg', region: 'Бишкек',
    subject: 'Незаконный сброс отходов в реку Ала-Арча',
    message: 'В районе жилмассива "Ак-Босого" обнаружен незаконный сброс бытовых и строительных отходов в русло реки Ала-Арча. Нарушение продолжается с начала января 2026 года.',
    attachments: [], latitude: 42.8746, longitude: 74.5698, locationAddress: 'г. Бишкек, жилмассив Ак-Босого',
    assignedTo: 'emp-1', assignedName: 'Иванов А.С.',
    response: 'По Вашему обращению проведена проверка. Выявлен нарушитель — ООО "СтройМакс". Составлен протокол об административном правонарушении. Территория очищена.',
    respondedAt: '2026-02-05',
    timeline: [
      { id: 't1', timestamp: '2026-02-01T10:00:00', status: FeedbackStatus.NEW, author: 'Система' },
      { id: 't2', timestamp: '2026-02-01T14:30:00', status: FeedbackStatus.IN_PROGRESS, author: 'Иванов А.С.' },
      { id: 't3', timestamp: '2026-02-04T16:00:00', status: FeedbackStatus.UNDER_REVIEW, author: 'Иванов А.С.' },
      { id: 't4', timestamp: '2026-02-05T11:00:00', status: FeedbackStatus.RESOLVED, author: 'Петрова М.К.' },
    ],
    comments: [
      { id: 'c1', timestamp: '2026-02-01T14:35:00', author: 'Иванов А.С.', authorRole: 'employee', text: 'Направлена инспекция на место.', internal: true },
      { id: 'c2', timestamp: '2026-02-03T09:00:00', author: 'Иванов А.С.', authorRole: 'employee', text: 'Инспекция подтвердила факт нарушения. Составляется протокол.', internal: true },
    ],
  },
  {
    id: 2, ticketNumber: 'OBR-2026-00002', createdAt: '2026-02-03', updatedAt: '2026-02-03',
    status: FeedbackStatus.NEW, category: FeedbackCategory.INFO_REQUEST,
    fullName: 'Мамбетова Айгуль Сыдыковна', phone: '+996 700 654321', email: 'mambetova@gmail.com', region: 'Ош',
    subject: 'Как получить лицензию на переработку отходов?',
    message: 'Прошу разъяснить порядок получения лицензии на деятельность по переработке бытовых отходов для ООО "ЭкоПласт" в Ошской области.',
    attachments: [],
    timeline: [
      { id: 't5', timestamp: '2026-02-03T08:15:00', status: FeedbackStatus.NEW, author: 'Система' },
    ],
    comments: [],
  },
  {
    id: 3, ticketNumber: 'OBR-2026-00003', createdAt: '2026-02-05', updatedAt: '2026-02-10',
    status: FeedbackStatus.IN_PROGRESS, category: FeedbackCategory.VIOLATION_REPORT,
    fullName: 'Жунусов Эрмек Талантович', phone: '+996 555 789012', email: 'zhunusov@inbox.kg', region: 'Чуй',
    subject: 'Горение мусорного полигона в Сокулукском районе',
    message: 'Уже третий день горит мусорный полигон вблизи села Беловодское. Дым распространяется на жилые кварталы. Прошу принять срочные меры.',
    attachments: [], latitude: 42.8283, longitude: 74.0952, locationAddress: 'Чуйская обл., Сокулукский р-н, с. Беловодское',
    assignedTo: 'emp-2', assignedName: 'Сыдыков К.Б.',
    timeline: [
      { id: 't6', timestamp: '2026-02-05T07:00:00', status: FeedbackStatus.NEW, author: 'Система' },
      { id: 't7', timestamp: '2026-02-05T09:30:00', status: FeedbackStatus.IN_PROGRESS, author: 'Сыдыков К.Б.' },
    ],
    comments: [
      { id: 'c3', timestamp: '2026-02-05T09:35:00', author: 'Сыдыков К.Б.', authorRole: 'employee', text: 'Направлена бригада МЧС и экологическая инспекция.', internal: true },
      { id: 'c4', timestamp: '2026-02-06T15:00:00', author: 'Сыдыков К.Б.', authorRole: 'employee', text: 'Возгорание частично ликвидировано. Продолжаются работы.', internal: false },
    ],
  },
  {
    id: 4, ticketNumber: 'OBR-2026-00004', createdAt: '2026-02-07', updatedAt: '2026-02-12',
    status: FeedbackStatus.REJECTED, category: FeedbackCategory.COMPLAINT,
    fullName: 'Токтоматов Нурбек', phone: '+996 770 111222', email: 'tokto@mail.kg', region: 'Бишкек',
    subject: 'Жалоба на шум от мусоровозов',
    message: 'Мусоровозы начинают работу в 5 утра, что нарушает покой жителей. Прошу перенести время вывоза мусора.',
    attachments: [],
    response: 'Данный вопрос не входит в компетенцию Министерства природных ресурсов. Рекомендуем обратиться в муниципалитет г. Бишкек (Бишкекское управление «Тазалык»).',
    respondedAt: '2026-02-12',
    timeline: [
      { id: 't8', timestamp: '2026-02-07T06:00:00', status: FeedbackStatus.NEW, author: 'Система' },
      { id: 't9', timestamp: '2026-02-08T10:00:00', status: FeedbackStatus.IN_PROGRESS, author: 'Иванов А.С.' },
      { id: 't10', timestamp: '2026-02-12T14:00:00', status: FeedbackStatus.REJECTED, author: 'Иванов А.С.', comment: 'Не в компетенции МПРЭТН' },
    ],
    comments: [],
  },
  {
    id: 5, ticketNumber: 'OBR-2026-00005', createdAt: '2026-02-10', updatedAt: '2026-02-10',
    status: FeedbackStatus.NEW, category: FeedbackCategory.SUGGESTION,
    fullName: 'Калыкова Динара Маратовна', phone: '+996 559 333444', email: 'kalykova@gmail.com', region: 'Иссык-Куль',
    subject: 'Предложение по раздельному сбору отходов',
    message: 'Предлагаю установить контейнеры для раздельного сбора отходов (пластик, стекло, бумага) в центральной части г. Каракол. Готовы содействовать в реализации проекта.',
    attachments: [],
    timeline: [
      { id: 't11', timestamp: '2026-02-10T12:00:00', status: FeedbackStatus.NEW, author: 'Система' },
    ],
    comments: [],
  },
  {
    id: 6, ticketNumber: 'OBR-2026-00006', createdAt: '2026-02-12', updatedAt: '2026-02-15',
    status: FeedbackStatus.UNDER_REVIEW, category: FeedbackCategory.VIOLATION_REPORT,
    fullName: 'Абдылдаев Руслан Кенешович', phone: '+996 700 555666', email: 'abdyldaev@inbox.kg', region: 'Джалал-Абад',
    subject: 'Незаконная свалка вблизи водоёма',
    message: 'Обнаружена стихийная свалка бытовых отходов на берегу реки Куршаб в Ноокенском районе. Свалка находится в водоохранной зоне.',
    attachments: [], latitude: 41.0311, longitude: 72.0117,
    assignedTo: 'emp-1', assignedName: 'Иванов А.С.',
    timeline: [
      { id: 't12', timestamp: '2026-02-12T09:00:00', status: FeedbackStatus.NEW, author: 'Система' },
      { id: 't13', timestamp: '2026-02-13T11:00:00', status: FeedbackStatus.IN_PROGRESS, author: 'Иванов А.С.' },
      { id: 't14', timestamp: '2026-02-15T16:00:00', status: FeedbackStatus.UNDER_REVIEW, author: 'Иванов А.С.' },
    ],
    comments: [
      { id: 'c5', timestamp: '2026-02-14T10:00:00', author: 'Иванов А.С.', authorRole: 'employee', text: 'Проведена выездная проверка. Факт подтверждён. Готовится предписание.', internal: true },
    ],
  },
  {
    id: 7, ticketNumber: 'OBR-2026-00007', createdAt: '2026-02-14', updatedAt: '2026-02-14',
    status: FeedbackStatus.NEW, category: FeedbackCategory.INFO_REQUEST,
    fullName: 'Бекмуратова Салтанат', phone: '+996 555 777888', email: 'bekmuratova@mail.kg', region: 'Нарын',
    subject: 'Информация о нормативах утильсбора на 2026 год',
    message: 'Прошу предоставить актуальные нормативы утилизационного сбора на 2026 год для предприятий по переработке пластика.',
    attachments: [],
    timeline: [
      { id: 't15', timestamp: '2026-02-14T14:00:00', status: FeedbackStatus.NEW, author: 'Система' },
    ],
    comments: [],
  },
  {
    id: 8, ticketNumber: 'OBR-2026-00008', createdAt: '2026-02-16', updatedAt: '2026-02-20',
    status: FeedbackStatus.RESOLVED, category: FeedbackCategory.COMPLAINT,
    fullName: 'Орозбаев Азамат Кубанычбекович', phone: '+996 770 999111', email: 'orozbaev@gmail.com', region: 'Талас',
    subject: 'Загрязнение воздуха от сжигания отходов',
    message: 'Предприятие ОсОО "ТаласТрейд" систематически сжигает промышленные отходы на открытой территории, загрязняя воздух.',
    attachments: [],
    assignedTo: 'emp-2', assignedName: 'Сыдыков К.Б.',
    response: 'Проведена проверка. Предприятию выдано предписание о прекращении сжигания отходов и оборудовании специализированного места хранения. Наложен штраф.',
    respondedAt: '2026-02-20',
    timeline: [
      { id: 't16', timestamp: '2026-02-16T11:00:00', status: FeedbackStatus.NEW, author: 'Система' },
      { id: 't17', timestamp: '2026-02-17T09:00:00', status: FeedbackStatus.IN_PROGRESS, author: 'Сыдыков К.Б.' },
      { id: 't18', timestamp: '2026-02-19T17:00:00', status: FeedbackStatus.UNDER_REVIEW, author: 'Сыдыков К.Б.' },
      { id: 't19', timestamp: '2026-02-20T14:00:00', status: FeedbackStatus.RESOLVED, author: 'Петрова М.К.' },
    ],
    comments: [],
  },
  {
    id: 9, ticketNumber: 'OBR-2026-00009', createdAt: '2026-02-18', updatedAt: '2026-02-18',
    status: FeedbackStatus.NEW, category: FeedbackCategory.SUGGESTION,
    fullName: 'Эсенгулова Мээрим', phone: '+996 559 222333', email: 'esenkulova@mail.kg', region: 'Бишкек',
    subject: 'Предложение о создании экологического портала',
    message: 'Предлагаю создать единый портал экологической информации КР с данными о качестве воздуха, воды и состоянии полигонов ТБО в режиме реального времени.',
    attachments: [],
    timeline: [
      { id: 't20', timestamp: '2026-02-18T16:30:00', status: FeedbackStatus.NEW, author: 'Система' },
    ],
    comments: [],
  },
  {
    id: 10, ticketNumber: 'OBR-2026-00010', createdAt: '2026-02-20', updatedAt: '2026-02-25',
    status: FeedbackStatus.IN_PROGRESS, category: FeedbackCategory.COMPLAINT,
    fullName: 'Турдубаев Нурлан Сагынбаевич', phone: '+996 700 444555', email: 'turdubaev@inbox.kg', region: 'Баткен',
    subject: 'Отсутствие вывоза мусора в с. Кызыл-Кия',
    message: 'В городе Кызыл-Кия Баткенской области не производится регулярный вывоз бытовых отходов уже более месяца. Контейнерные площадки переполнены.',
    attachments: [],
    assignedTo: 'emp-1', assignedName: 'Иванов А.С.',
    timeline: [
      { id: 't21', timestamp: '2026-02-20T08:00:00', status: FeedbackStatus.NEW, author: 'Система' },
      { id: 't22', timestamp: '2026-02-21T10:00:00', status: FeedbackStatus.IN_PROGRESS, author: 'Иванов А.С.' },
    ],
    comments: [
      { id: 'c6', timestamp: '2026-02-22T11:00:00', author: 'Иванов А.С.', authorRole: 'employee', text: 'Направлен запрос в местное самоуправление Кызыл-Кия.', internal: false },
    ],
  },
  {
    id: 11, ticketNumber: 'OBR-2026-00011', createdAt: '2026-02-22', updatedAt: '2026-02-22',
    status: FeedbackStatus.NEW, category: FeedbackCategory.VIOLATION_REPORT,
    fullName: 'Касымов Данияр', phone: '+996 555 666777', email: 'kasymov@gmail.com', region: 'Чуй',
    subject: 'Слив промышленных стоков в канал',
    message: 'Завод по производству кирпича сливает неочищенные стоки в ирригационный канал рядом с селом Новопавловка.',
    attachments: [], latitude: 42.8130, longitude: 74.7150,
    timeline: [
      { id: 't23', timestamp: '2026-02-22T13:00:00', status: FeedbackStatus.NEW, author: 'Система' },
    ],
    comments: [],
  },
  {
    id: 12, ticketNumber: 'OBR-2026-00012', createdAt: '2026-02-25', updatedAt: '2026-02-28',
    status: FeedbackStatus.RESOLVED, category: FeedbackCategory.INFO_REQUEST,
    fullName: 'Шералиева Гульмира Асановна', phone: '+996 700 888999', email: 'sheralieva@mail.kg', region: 'Бишкек',
    subject: 'Запрос данных о количестве лицензированных переработчиков',
    message: 'Для подготовки дипломной работы прошу предоставить статистические данные о количестве лицензированных предприятий по переработке отходов в КР за 2023-2025 гг.',
    attachments: [],
    assignedTo: 'emp-2', assignedName: 'Сыдыков К.Б.',
    response: 'Информация направлена на указанный email. По данным реестра: 2023 г. — 47 предприятий, 2024 г. — 62 предприятия, 2025 г. — 78 предприятий.',
    respondedAt: '2026-02-28',
    timeline: [
      { id: 't24', timestamp: '2026-02-25T10:00:00', status: FeedbackStatus.NEW, author: 'Система' },
      { id: 't25', timestamp: '2026-02-26T09:00:00', status: FeedbackStatus.IN_PROGRESS, author: 'Сыдыков К.Б.' },
      { id: 't26', timestamp: '2026-02-28T15:00:00', status: FeedbackStatus.RESOLVED, author: 'Сыдыков К.Б.' },
    ],
    comments: [],
  },
]

const state = reactive<{
  items: FeedbackItem[]
  currentItem: FeedbackItem | null
  loading: boolean
  error: string | null
  filters: FeedbackFilters
}>({
  items: mockItems,
  currentItem: null,
  loading: false,
  error: null,
  filters: {
    status: '',
    category: '',
    search: '',
    dateFrom: '',
    dateTo: '',
  },
})

function fetchAll() {
  state.loading = true
  state.error = null
  // Simulate API call
  setTimeout(() => {
    state.loading = false
  }, 300)
}

function fetchById(id: number): FeedbackItem | undefined {
  const item = state.items.find(i => i.id === id)
  if (item) {
    state.currentItem = item
  }
  return item
}

function findByTicketAndEmail(ticketNumber: string, email: string): FeedbackItem | undefined {
  return state.items.find(
    i => i.ticketNumber.toLowerCase() === ticketNumber.toLowerCase() && i.email.toLowerCase() === email.toLowerCase()
  )
}

function create(data: {
  fullName: string
  phone: string
  email: string
  category: FeedbackCategoryType
  subject: string
  message: string
  attachments?: FeedbackAttachment[]
  latitude?: number
  longitude?: number
  locationAddress?: string
}): FeedbackItem {
  const now = new Date()
  const dateStr = now.toISOString().split('T')[0]
  const ticketNumber = generateTicketNumber()

  const item: FeedbackItem = {
    id: nextId++,
    ticketNumber,
    createdAt: dateStr,
    updatedAt: dateStr,
    status: FeedbackStatus.NEW,
    category: data.category,
    fullName: data.fullName,
    phone: data.phone,
    email: data.email,
    subject: data.subject,
    message: data.message,
    attachments: data.attachments || [],
    latitude: data.latitude,
    longitude: data.longitude,
    locationAddress: data.locationAddress,
    timeline: [
      {
        id: `t-${Date.now()}`,
        timestamp: now.toISOString(),
        status: FeedbackStatus.NEW,
        author: i18n.global.t('feedback.system') as string,
      },
    ],
    comments: [],
  }

  state.items.unshift(item)

  // Notify employee about new ticket
  const t = i18n.global.t as (key: string, params?: Record<string, any>) => string
  notificationStore.add({
    type: 'info',
    title: t('feedback.newTicketNotification'),
    message: `${item.ticketNumber}: ${item.subject}`,
    role: 'employee',
    link: `/employee/feedback/${item.id}`,
  })

  return item
}

function updateStatus(id: number, newStatus: FeedbackStatusType, author: string, comment?: string) {
  const item = state.items.find(i => i.id === id)
  if (!item) return

  item.status = newStatus
  item.updatedAt = new Date().toISOString().split('T')[0]

  item.timeline.push({
    id: `t-${Date.now()}`,
    timestamp: new Date().toISOString(),
    status: newStatus,
    author,
    comment,
  })
}

function assignTo(id: number, employeeId: string, employeeName: string) {
  const item = state.items.find(i => i.id === id)
  if (!item) return

  item.assignedTo = employeeId
  item.assignedName = employeeName
  if (item.status === FeedbackStatus.NEW) {
    updateStatus(id, FeedbackStatus.IN_PROGRESS, employeeName)
  }
}

function addResponse(id: number, responseText: string, author: string) {
  const item = state.items.find(i => i.id === id)
  if (!item) return

  item.response = responseText
  item.respondedAt = new Date().toISOString().split('T')[0]
  item.updatedAt = item.respondedAt
}

function addComment(id: number, data: { author: string; authorRole: 'citizen' | 'employee'; text: string; internal: boolean }) {
  const item = state.items.find(i => i.id === id)
  if (!item) return

  item.comments.push({
    id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    ...data,
  })
  item.updatedAt = new Date().toISOString().split('T')[0]
}

function getNewCount(): number {
  return state.items.filter(i => i.status === FeedbackStatus.NEW).length
}

function getFilteredItems(): FeedbackItem[] {
  let result = [...state.items]
  const f = state.filters

  if (f.status) {
    result = result.filter(i => i.status === f.status)
  }
  if (f.category) {
    result = result.filter(i => i.category === f.category)
  }
  if (f.search) {
    const s = f.search.toLowerCase()
    result = result.filter(i =>
      i.ticketNumber.toLowerCase().includes(s) ||
      i.fullName.toLowerCase().includes(s) ||
      i.subject.toLowerCase().includes(s)
    )
  }
  if (f.dateFrom) {
    result = result.filter(i => i.createdAt >= f.dateFrom)
  }
  if (f.dateTo) {
    result = result.filter(i => i.createdAt <= f.dateTo)
  }

  return result
}

function getDaysElapsed(createdAt: string): number {
  const created = new Date(createdAt)
  const now = new Date()
  return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
}

function getSlaColor(createdAt: string, status: FeedbackStatusType): string {
  if (status === FeedbackStatus.RESOLVED || status === FeedbackStatus.REJECTED) return ''
  const days = getDaysElapsed(createdAt)
  if (days > 30) return 'red'
  if (days >= 20) return 'yellow'
  return 'green'
}

export const feedbackStore = {
  state,
  fetchAll,
  fetchById,
  findByTicketAndEmail,
  create,
  updateStatus,
  assignTo,
  addResponse,
  addComment,
  getNewCount,
  getFilteredItems,
  getDaysElapsed,
  getSlaColor,
}
