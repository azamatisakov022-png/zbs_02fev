<script setup lang="ts">
import { ref, computed, type ComputedRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import { notificationStore, type Notification, type NotificationRole } from '../../stores/notifications'
import { useBusinessMenu, useEcoOperatorMenu, useEmployeeMenu } from '../../composables/useRoleMenu'

const { t } = useI18n()
const router = useRouter()

const props = defineProps<{
  role: NotificationRole
}>()

// Dynamically select menu based on role
const roleMenuMap: Record<string, () => ReturnType<typeof useBusinessMenu>> = {
  business: useBusinessMenu,
  'eco-operator': useEcoOperatorMenu,
  employee: useEmployeeMenu,
}

const { roleTitle, menuItems } = (roleMenuMap[props.role] || useBusinessMenu)()

const filter = ref<'all' | 'unread'>('all')

const notifications = computed(() => {
  const all = notificationStore.getByRole(props.role)
  if (filter.value === 'unread') return all.filter(n => !n.read)
  return all
})

const unreadCount = computed(() => notificationStore.getUnreadCount(props.role))

function handleMarkAllRead() {
  notificationStore.markAllAsRead(props.role)
}

function handleMarkRead(id: number) {
  notificationStore.markAsRead(id)
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
  const link = getNotificationLink(n)
  if (link) {
    notificationStore.markAsRead(n.id)
    router.push(link)
  }
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
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-[#1e293b]">{{ t('notifications.pageTitle') }}</h1>
          <p class="text-[#64748b] mt-1">{{ t('notifications.pageSubtitle') }}</p>
        </div>
        <div class="flex items-center gap-3">
          <button
            v-if="unreadCount > 0"
            @click="handleMarkAllRead"
            class="px-4 py-2 text-sm font-medium text-[#0e888d] bg-[#f0fdfa] rounded-lg hover:bg-[#ccfbf1] transition-colors"
          >{{ t('notifications.readAll') }}</button>
          <button
            @click="handleDeleteAllRead"
            class="px-4 py-2 text-sm font-medium text-[#64748b] bg-[#f1f5f9] rounded-lg hover:bg-[#e2e8f0] transition-colors"
          >{{ t('notifications.deleteAll') }}</button>
        </div>
      </div>

      <slot />

      <!-- Filters -->
      <div class="flex gap-2">
        <button
          @click="filter = 'all'"
          :class="[
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            filter === 'all' ? 'bg-[#0e888d] text-white' : 'bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0]'
          ]"
        >{{ t('notifications.filterAll') }} ({{ notificationStore.getByRole(role).length }})</button>
        <button
          @click="filter = 'unread'"
          :class="[
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            filter === 'unread' ? 'bg-[#0e888d] text-white' : 'bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0]'
          ]"
        >{{ t('notifications.filterUnread') }} ({{ unreadCount }})</button>
      </div>

      <!-- Notification List -->
      <div class="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden">
        <div v-if="notifications.length === 0" class="px-6 py-12 text-center">
          <svg class="w-12 h-12 mx-auto text-[#cbd5e1] mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <p class="text-[#94a3b8] text-sm">{{ filter === 'unread' ? t('notifications.noUnread') : t('notifications.empty') }}</p>
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
            @click="handleMarkRead(n.id)"
            :class="[
              'px-6 py-4 flex gap-4 cursor-pointer transition-colors border-b border-[#f1f5f9] last:border-0',
              n.read ? 'bg-white hover:bg-[#f8fafc]' : 'bg-blue-50/40 hover:bg-blue-50/60'
            ]"
          >
            <!-- Type icon -->
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
              :style="{ backgroundColor: typeConfig[n.type].bg }"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" :stroke="typeConfig[n.type].color" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" :d="typeConfig[n.type].icon" />
              </svg>
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start gap-2">
                <p class="text-sm font-semibold text-[#1e293b] leading-tight">{{ n.title }}</p>
                <span v-if="!n.read" class="w-2 h-2 rounded-full bg-[#0e888d] flex-shrink-0 mt-1.5"></span>
              </div>
              <p class="text-sm text-[#64748b] mt-1">{{ n.message }}</p>
              <div class="flex items-center gap-3 mt-2">
                <span class="text-xs text-[#94a3b8]">{{ notificationStore.formatRelativeTime(n.createdAt) }}</span>
                <span
                  class="text-[10px] font-medium px-2 py-0.5 rounded-full"
                  :style="{ color: typeConfig[n.type].color, backgroundColor: typeConfig[n.type].bg }"
                >{{ typeConfig[n.type].label }}</span>
              </div>
            </div>

            <!-- Link button -->
            <button
              v-if="getNotificationLink(n)"
              @click.stop="handleNavigate(n)"
              class="self-center px-3 py-1.5 text-xs font-medium text-[#0e888d] bg-[#f0fdfa] rounded-lg hover:bg-[#ccfbf1] transition-colors flex-shrink-0"
            >{{ t('notificationsPage.goTo') }}</button>
          </div>
        </TransitionGroup>
      </div>
    </div>
  </DashboardLayout>
</template>
