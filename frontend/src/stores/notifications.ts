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
  notifications: stored.length > 0 ? stored : [],
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
