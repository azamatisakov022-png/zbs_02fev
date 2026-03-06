<script setup lang="ts">
import { ref, computed, onMounted, type ComputedRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import { AppButton } from '../../components/ui'
import { notificationStore, type Notification, type NotificationRole } from '../../stores/notifications'
import { useBusinessMenu, useEcoOperatorMenu, useEmployeeMenu } from '../../composables/useRoleMenu'

const { t } = useI18n()
const router = useRouter()

const props = defineProps<{
  role: NotificationRole
}>()

const roleMenuMap: Record<string, () => ReturnType<typeof useBusinessMenu>> = {
  business: useBusinessMenu,
  'eco-operator': useEcoOperatorMenu,
  employee: useEmployeeMenu,
}

const { roleTitle, menuItems } = (roleMenuMap[props.role] || useBusinessMenu)()

onMounted(() => {
  notificationStore.fetchAll()
})

const filter = ref<'all' | 'unread'>('all')

const allNotifications = computed(() => notificationStore.getByRole(props.role))
const notifications = computed(() => {
  if (filter.value === 'unread') return allNotifications.value.filter(n => !n.read)
  return allNotifications.value
})

const unreadCount = computed(() => notificationStore.getUnreadCount(props.role))

function handleMarkAllRead() {
  notificationStore.markAllAsRead(props.role)
}

function handleMarkRead(id: number) {
  notificationStore.markAsRead(id)
}

function handleDelete(id: number) {
  notificationStore.remove(id)
}

function handleDeleteAllRead() {
  const readIds = notificationStore.getByRole(props.role).filter(n => n.read).map(n => n.id)
  readIds.forEach(id => notificationStore.remove(id))
}

const referenceRoutes: Record<string, Record<string, string>> = {
  business: {
    calculation: '/business/calculations',
    report: '/business/reports',
    declaration: '/business/declarations',
    refund: '/business/refunds',
  },
  'eco-operator': {
    calculation: '/eco-operator/calculations',
    report: '/eco-operator/reports',
    declaration: '/eco-operator/declarations',
    refund: '/eco-operator/refunds',
  },
  employee: {
    calculation: '/employee/calculations',
    report: '/employee/reports',
    declaration: '/employee/declarations',
    refund: '/employee/refunds',
  },
  admin: {
    calculation: '/admin/calculations',
    report: '/admin/reports',
    declaration: '/admin/declarations',
    refund: '/admin/refunds',
  },
}

function getNotificationLink(n: Notification): string | null {
  if (n.link) return n.link
  if (n.referenceId && n.referenceType) {
    const basePath = referenceRoutes[props.role]?.[n.referenceType]
    if (basePath) return `${basePath}/${n.referenceId}`
  }
  return null
}

function handleNavigate(n: Notification) {
  notificationStore.markAsRead(n.id)
  const link = getNotificationLink(n)
  if (link) router.push(link)
}

const typeConfig: ComputedRef<Record<string, { color: string; bg: string; icon: string; label: string }>> = computed(() => ({
  info: { color: '#2563eb', bg: '#eff6ff', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', label: t('notificationsPage.typeInfo') },
  success: { color: '#059669', bg: '#ecfdf5', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', label: t('notificationsPage.typeSuccess') },
  warning: { color: '#d97706', bg: '#fffbeb', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z', label: t('notificationsPage.typeWarning') },
  error: { color: '#dc2626', bg: '#fef2f2', icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z', label: t('notificationsPage.typeError') },
}))
</script>

<template>
  <DashboardLayout :role-title="roleTitle" :menu-items="menuItems" :role="role">
    <div class="np-page">
      <div class="np-header">
        <div>
          <h1 class="np-title">{{ t('notifications.pageTitle') }}</h1>
          <p class="np-subtitle">{{ t('notifications.pageSubtitle') }}</p>
        </div>
        <div class="np-actions">
          <AppButton
            v-if="unreadCount > 0"
            variant="outline"
            @click="handleMarkAllRead"
          >{{ t('notifications.readAll') }}</AppButton>
          <AppButton variant="secondary" @click="handleDeleteAllRead">{{ t('notifications.deleteAll') }}</AppButton>
        </div>
      </div>

      <div class="np-summary">
        <div class="np-summary-item">
          <span class="np-summary-count">{{ allNotifications.length }}</span>
          <span class="np-summary-label">{{ t('notifications.filterAll') }}</span>
        </div>
        <div class="np-summary-divider"></div>
        <div class="np-summary-item">
          <span class="np-summary-count np-summary-count--unread">{{ unreadCount }}</span>
          <span class="np-summary-label">{{ t('notifications.filterUnread') }}</span>
        </div>
      </div>

      <slot />

      <div class="np-filters">
        <button
          @click="filter = 'all'"
          class="np-filter-btn"
          :class="{ 'np-filter-btn--active': filter === 'all' }"
        >{{ t('notifications.filterAll') }} ({{ allNotifications.length }})</button>
        <button
          @click="filter = 'unread'"
          class="np-filter-btn"
          :class="{ 'np-filter-btn--active': filter === 'unread' }"
        >{{ t('notifications.filterUnread') }} ({{ unreadCount }})</button>
      </div>

      <div class="np-list">
        <div v-if="notifications.length === 0" class="np-empty">
          <div class="np-empty-icon">
            <svg class="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <p class="np-empty-text">{{ filter === 'unread' ? t('notifications.noUnread') : t('notifications.empty') }}</p>
        </div>

        <TransitionGroup
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 -translate-y-1"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div
            v-for="n in notifications"
            :key="n.id"
            @click="handleNavigate(n)"
            class="np-item"
            :class="{ 'np-item--unread': !n.read }"
          >
            <div
              class="np-item-icon"
              :style="{ backgroundColor: typeConfig[n.type].bg }"
            >
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" :stroke="typeConfig[n.type].color" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" :d="typeConfig[n.type].icon" />
              </svg>
            </div>

            <div class="np-item-content">
              <div class="np-item-title-row">
                <p class="np-item-title">{{ n.title }}</p>
                <span v-if="!n.read" class="np-unread-dot"></span>
              </div>
              <p class="np-item-message">{{ n.message }}</p>
              <div class="np-item-meta">
                <span class="np-item-time">{{ notificationStore.formatRelativeTime(n.createdAt) }}</span>
                <span
                  class="np-item-badge"
                  :style="{ color: typeConfig[n.type].color, backgroundColor: typeConfig[n.type].bg }"
                >{{ typeConfig[n.type].label }}</span>
              </div>
            </div>

            <div class="np-item-actions">
              <button
                v-if="getNotificationLink(n)"
                @click.stop="handleNavigate(n)"
                class="np-go-btn"
              >{{ t('notificationsPage.goTo') }}</button>
              <button
                @click.stop="handleDelete(n.id)"
                class="np-delete-btn"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </TransitionGroup>
      </div>
    </div>
  </DashboardLayout>
</template>

<style scoped>
.np-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.np-header {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
@media (min-width: 640px) {
  .np-header {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}
.np-title {
  font-size: 34px;
  font-weight: 700;
  color: #1e293b;
}
@media (min-width: 1024px) {
  .np-title {
    font-size: 40px;
  }
}
.np-subtitle {
  font-size: 24px;
  color: #64748b;
  margin-top: 4px;
}
.np-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.np-summary {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 16px 24px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}
.np-summary-item {
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.np-summary-count {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
}
.np-summary-count--unread {
  color: #0e888d;
}
.np-summary-label {
  font-size: 20px;
  color: #64748b;
}
.np-summary-divider {
  width: 1px;
  height: 32px;
  background: #e2e8f0;
}

.np-filters {
  display: flex;
  gap: 8px;
}
.np-filter-btn {
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 21px;
  font-weight: 500;
  transition: all 0.15s;
  background: #f1f5f9;
  color: #64748b;
}
.np-filter-btn:hover:not(.np-filter-btn--active) {
  background: #e2e8f0;
}
.np-filter-btn--active {
  background: #0e888d;
  color: #fff;
}

.np-list {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}
.np-empty {
  padding: 48px 24px;
  text-align: center;
}
.np-empty-icon {
  color: #cbd5e1;
  margin-bottom: 12px;
  display: flex;
  justify-content: center;
}
.np-empty-text {
  font-size: 21px;
  color: #94a3b8;
}

.np-item {
  display: flex;
  gap: 16px;
  padding: 16px 24px;
  cursor: pointer;
  transition: background-color 0.15s;
  border-bottom: 1px solid #f1f5f9;
  background: #fff;
}
.np-item:last-child {
  border-bottom: none;
}
.np-item:hover {
  background: #f8fafc;
}
.np-item--unread {
  background: rgba(14, 136, 141, 0.04);
}
.np-item--unread:hover {
  background: rgba(14, 136, 141, 0.07);
}
.np-item-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}
.np-item-content {
  flex: 1;
  min-width: 0;
}
.np-item-title-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}
.np-item-title {
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.3;
}
.np-unread-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #0e888d;
  flex-shrink: 0;
  margin-top: 6px;
}
.np-item-message {
  font-size: 21px;
  color: #64748b;
  margin-top: 4px;
}
.np-item-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}
.np-item-time {
  font-size: 18px;
  color: #94a3b8;
}
.np-item-badge {
  font-size: 17px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 9999px;
}
.np-item-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  align-self: center;
  flex-shrink: 0;
}
.np-go-btn {
  padding: 8px 16px;
  font-size: 21px;
  font-weight: 600;
  color: #0e888d;
  background: #f0fdfa;
  border-radius: 8px;
  transition: background-color 0.15s;
}
.np-go-btn:hover {
  background: #ccfbf1;
}
.np-delete-btn {
  padding: 8px;
  color: #94a3b8;
  border-radius: 8px;
  transition: all 0.15s;
}
.np-delete-btn:hover {
  color: #ef4444;
  background: #fef2f2;
}
</style>
