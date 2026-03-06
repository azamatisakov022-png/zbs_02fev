import { defineStore } from 'pinia'
import api, { silentApi } from '../api/client'
import i18n from '../i18n'
import type { Notification, NotificationType, NotificationRole } from '@/types/notification'

export type { Notification, NotificationType, NotificationRole }

let nextId = 100000

function mapBackendNotification(n: any): Notification {
  return {
    id: n.id,
    type: ((n.type || 'info').toLowerCase()) as NotificationType,
    title: n.title || '',
    message: n.message || '',
    role: (n.role || 'business') as NotificationRole,
    createdAt: n.createdAt || new Date().toISOString(),
    read: n.isRead ?? n.read ?? false,
    referenceId: n.referenceId ?? undefined,
    referenceType: n.referenceType ?? undefined,
  }
}

export const useNotificationStore = defineStore('notifications', {
  state: () => ({
    notifications: [] as Notification[],
    loading: false,
  }),

  getters: {
    byRole(): (role: NotificationRole) => Notification[] {
      return (role: NotificationRole) =>
        this.notifications
          .filter(n => n.role === role)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    },

    unreadCount(): (role: NotificationRole) => number {
      return (role: NotificationRole) =>
        this.notifications.filter(n => n.role === role && !n.read).length
    },
  },

  actions: {
    add(notification: { type: NotificationType; title: string; message: string; role: NotificationRole; link?: string }): Notification {
      const n: Notification = {
        ...notification,
        id: nextId++,
        read: false,
        createdAt: new Date().toISOString(),
      }
      this.notifications.unshift(n)
      return n
    },

    remove(id: number) {
      this.notifications = this.notifications.filter(n => n.id !== id)
      silentApi.delete(`/notifications/${id}`).catch(() => {})
    },

    clear() {
      this.notifications = []
      nextId = 100000
    },

    markAsRead(id: number) {
      const n = this.notifications.find(n => n.id === id)
      if (n) n.read = true
      silentApi.post(`/notifications/${id}/read`).catch(() => {})
    },

    markAllAsRead(role: NotificationRole) {
      this.notifications.forEach(n => {
        if (n.role === role) n.read = true
      })
      silentApi.post('/notifications/read-all').catch(() => {})
    },

    async fetchAll() {
      this.loading = true
      try {
        const { data } = await api.get('/notifications')
        if (Array.isArray(data)) {
          const backendNotifications = data.map(mapBackendNotification)
          const localOnly = this.notifications.filter(n => n.id >= 100000)
          this.notifications = [...backendNotifications, ...localOnly]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        }
      } catch { /* silent */ } finally {
        this.loading = false
      }
    },
  },
})

export function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  const t = i18n.global.t as (key: string, params?: Record<string, any>) => string
  if (mins < 1) return t('time.justNow')
  if (mins < 60) return t('time.minutesAgo', { mins })
  if (hours < 24) return t('time.hoursAgo', { hours })
  if (days < 30) return t('time.daysAgo', { days })
  return new Date(isoString).toLocaleDateString('ru-RU')
}

export const notificationStore = {
  get state() {
    const store = useNotificationStore()
    return store
  },
  add(n: { type: NotificationType; title: string; message: string; role: NotificationRole; link?: string }) {
    return useNotificationStore().add(n)
  },
  remove(id: number) { useNotificationStore().remove(id) },
  clear() { useNotificationStore().clear() },
  getByRole(role: NotificationRole) { return useNotificationStore().byRole(role) },
  getUnreadCount(role: NotificationRole) { return useNotificationStore().unreadCount(role) },
  markAsRead(id: number) { useNotificationStore().markAsRead(id) },
  markAllAsRead(role: NotificationRole) { useNotificationStore().markAllAsRead(role) },
  formatRelativeTime,
  fetchAll() { return useNotificationStore().fetchAll() },
}
