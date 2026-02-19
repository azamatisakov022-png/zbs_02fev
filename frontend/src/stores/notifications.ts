import { reactive, watch } from 'vue'
import api from '../api/client'

export type NotificationType = 'info' | 'success' | 'warning' | 'error'
export type NotificationRole = 'business' | 'eco-operator' | 'employee' | 'admin'

export interface Notification {
  id: number
  type: NotificationType
  title: string
  message: string
  role: NotificationRole
  createdAt: string
  read: boolean
  link?: string
}

const STORAGE_KEY = 'zbs_notifications'

function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return 'только что'
  if (mins < 60) return `${mins} мин назад`
  if (hours < 24) return `${hours} ч назад`
  if (days < 30) return `${days} дн назад`
  return new Date(isoString).toLocaleDateString('ru-RU')
}

function ago(hours: number): string {
  return new Date(Date.now() - hours * 3600000).toISOString()
}

const seedNotifications: Notification[] = [
  // Business
  { id: 1, type: 'success', title: 'Расчёт РС-2026-015 принят', message: 'Ваш расчёт утилизационного сбора за Q4 2025 принят и ожидает оплаты.', createdAt: ago(2), read: false, role: 'business', link: '/business/calculations/1' },
  { id: 2, type: 'warning', title: 'Срок подачи декларации за Q1', message: 'Срок подачи декларации за I квартал 2026 года — до 20 апреля 2026 г.', createdAt: ago(5), read: false, role: 'business' },
  { id: 3, type: 'success', title: 'Платёж подтверждён', message: 'Платёж ПП-00412 на сумму 6 322 сом подтверждён.', createdAt: ago(24), read: true, role: 'business', link: '/business/payments' },
  { id: 4, type: 'error', title: 'Расчёт РС-2026-024 отклонён', message: 'Неверно указана масса товаров в группе 6. Исправьте и отправьте повторно.', createdAt: ago(48), read: true, role: 'business' },
  { id: 5, type: 'info', title: 'Обновление нормативов', message: 'С 1 января 2026 года вступают в силу новые нормативы переработки.', createdAt: ago(72), read: true, role: 'business' },

  // Eco-Operator
  { id: 6, type: 'info', title: 'Новый расчёт от ОАО «СтройМаркет»', message: 'Расчёт РС-2026-018 на сумму 9 583 сом ожидает проверки.', createdAt: ago(1), read: false, role: 'eco-operator', link: '/eco-operator/calculations/2' },
  { id: 7, type: 'error', title: 'Отчёт №45 отклонён', message: 'Отчёт ОсОО «ПищеПром» отклонён: процент переработки ниже норматива.', createdAt: ago(3), read: false, role: 'eco-operator' },
  { id: 8, type: 'success', title: 'Оплата подтверждена', message: 'Платёж ОсОО «ТехПром» на сумму 6 322 сом успешно подтверждён.', createdAt: ago(6), read: false, role: 'eco-operator' },
  { id: 9, type: 'warning', title: 'Новый отчёт о переработке', message: 'ОАО «СтройМаркет» подал отчёт РП-2026-019 на проверку.', createdAt: ago(24), read: true, role: 'eco-operator', link: '/eco-operator/incoming-reports' },
  { id: 10, type: 'info', title: 'Расчёт от ОсОО «ПищеПром»', message: 'Новый расчёт РС-2026-021 на сумму 3 309 сом поступил на проверку.', createdAt: ago(48), read: true, role: 'eco-operator', link: '/eco-operator/calculations/3' },

  // Employee
  { id: 11, type: 'warning', title: 'Лицензия ОсОО «ТекстильРесайкл» истекает', message: 'Лицензия на переработку истекает через 30 дней. Требуется уведомление организации.', createdAt: ago(0.5), read: false, role: 'employee', link: '/employee/licenses' },
  { id: 12, type: 'info', title: 'Новая заявка на регистрацию', message: 'ОсОО «НовоТрейд» подал заявку на регистрацию плательщика РОП.', createdAt: ago(2), read: false, role: 'employee' },
  { id: 13, type: 'success', title: 'Лицензия выдана', message: 'Лицензия ОсОО «ЭкоСервис» на переработку отходов одобрена и выдана.', createdAt: ago(4), read: false, role: 'employee', link: '/employee/licenses' },
  { id: 14, type: 'info', title: 'Обновление реестра', message: 'В реестр переработчиков добавлено 3 новые организации за эту неделю.', createdAt: ago(24), read: true, role: 'employee' },
  { id: 15, type: 'warning', title: 'Просроченные заявки', message: '5 заявок ожидают рассмотрения более 7 дней.', createdAt: ago(24), read: true, role: 'employee' },

  // Admin
  { id: 16, type: 'error', title: 'Ошибка интеграции с ЕСИ', message: 'Сервис аутентификации ЕСИ недоступен. Последняя проверка: 10:45.', createdAt: ago(0.25), read: false, role: 'admin' },
  { id: 17, type: 'info', title: 'Новый пользователь зарегистрирован', message: 'ОсОО «НовоТрейд» (ИНН: 07654321098765) завершил регистрацию.', createdAt: ago(1), read: false, role: 'admin' },
  { id: 18, type: 'success', title: 'Резервное копирование выполнено', message: 'Автоматическое резервное копирование базы данных завершено успешно.', createdAt: ago(3), read: false, role: 'admin' },
  { id: 19, type: 'warning', title: 'Высокая нагрузка на сервер', message: 'Загрузка CPU превысила 85% в течение последних 15 минут.', createdAt: ago(5), read: true, role: 'admin' },
  { id: 20, type: 'info', title: 'Обновление системы', message: 'Запланировано техническое обслуживание на 15 февраля 2026 г., 02:00-04:00.', createdAt: ago(24), read: true, role: 'admin' },
]

function loadFromStorage(): Notification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return []
}

function saveToStorage(notifications: Notification[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications))
  } catch { /* ignore */ }
}

const stored = loadFromStorage()

const state = reactive<{ notifications: Notification[]; loading: boolean }>({
  loading: false,
  notifications: stored.length > 0 ? stored : seedNotifications,
})

watch(() => state.notifications, () => saveToStorage(state.notifications), { deep: true })

let nextId = Math.max(0, ...state.notifications.map(n => n.id)) + 1

function add(notification: { type: NotificationType; title: string; message: string; role: NotificationRole; link?: string }): Notification {
  const n: Notification = {
    ...notification,
    id: nextId++,
    read: false,
    createdAt: new Date().toISOString(),
  }
  state.notifications.unshift(n)
  api.post('/notifications', notification).catch(() => {})
  return n
}

function remove(id: number) {
  state.notifications = state.notifications.filter(n => n.id !== id)
  api.delete(`/notifications/${id}`).catch(() => {})
}

function getByRole(role: NotificationRole) {
  return state.notifications
    .filter(n => n.role === role)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

function getUnreadCount(role: NotificationRole) {
  return state.notifications.filter(n => n.role === role && !n.read).length
}

function markAsRead(id: number) {
  const n = state.notifications.find(n => n.id === id)
  if (n) n.read = true
  api.post(`/notifications/${id}/read`).catch(() => {})
}

function markAllAsRead(role: NotificationRole) {
  state.notifications.forEach(n => {
    if (n.role === role) n.read = true
  })
  api.post('/notifications/read-all').catch(() => {})
}

async function fetchAll(role?: NotificationRole) {
  state.loading = true
  try {
    const url = role ? `/notifications/by-role/${role}` : '/notifications'
    const { data } = await api.get(url)
    if (Array.isArray(data)) {
      state.notifications = data
    }
  } catch { /* keep local data */ } finally {
    state.loading = false
  }
}

export const notificationStore = { state, add, remove, getByRole, getUnreadCount, markAsRead, markAllAsRead, formatRelativeTime, fetchAll }
