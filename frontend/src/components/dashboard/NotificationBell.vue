<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { notificationStore, type Notification, type NotificationRole } from '../../stores/notifications'

const { t } = useI18n()
const router = useRouter()

const props = defineProps<{
  role: NotificationRole
}>()

const isOpen = ref(false)
const bellRef = ref<HTMLElement | null>(null)

const notificationsPagePaths: Record<string, string> = {
  business: '/business/notifications',
  'eco-operator': '/eco-operator/notifications',
  employee: '/employee/notifications',
  admin: '/admin/notifications',
}
const notificationsPagePath = computed(() => notificationsPagePaths[props.role] || '/admin/notifications')

const notifications = computed(() => notificationStore.getByRole(props.role).slice(0, 5))
const unreadCount = computed(() => notificationStore.getUnreadCount(props.role))

function toggle() {
  isOpen.value = !isOpen.value
}

function handleMarkAllRead() {
  notificationStore.markAllAsRead(props.role)
}

function handleMarkRead(id: number) {
  notificationStore.markAsRead(id)
}

function handleClickOutside(e: MouseEvent) {
  if (bellRef.value && !bellRef.value.contains(e.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

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
    isOpen.value = false
    router.push(link)
  }
}

const typeConfig = {
  info: { color: '#2563eb', bg: '#eff6ff', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  success: { color: '#059669', bg: '#ecfdf5', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
  warning: { color: '#d97706', bg: '#fffbeb', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z' },
  error: { color: '#dc2626', bg: '#fef2f2', icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z' },
}
</script>

<template>
  <div ref="bellRef" class="relative">
    <!-- Bell Button -->
    <button
      @click="toggle"
      class="relative p-2 text-[#4B5563] hover:bg-[#f1f5f9] rounded-lg transition-colors"
      :aria-label="t('notifications.title') + (unreadCount > 0 ? ', ' + t('notifications.unreadCount', { count: unreadCount }) : '')"
      :aria-expanded="isOpen"
    >
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      <!-- Badge -->
      <span
        v-if="unreadCount > 0"
        class="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none"
        aria-hidden="true"
      >{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
    </button>

    <!-- Dropdown -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-1"
    >
      <div
        v-if="isOpen"
        class="notification-dropdown absolute right-0 mt-2 w-[360px] max-h-[500px] bg-white rounded-xl shadow-lg border border-[#e2e8f0] overflow-hidden z-50 flex flex-col"
      >
        <!-- Header -->
        <div class="px-4 py-3 border-b border-[#e2e8f0] flex items-center justify-between flex-shrink-0">
          <h4 class="font-semibold text-[#1e293b]">{{ t('notifications.title') }}</h4>
          <button
            v-if="unreadCount > 0"
            @click="handleMarkAllRead"
            class="text-xs text-[#0e888d] hover:text-[#0a6d71] font-medium transition-colors"
          >{{ t('notifications.readAll') }}</button>
        </div>

        <!-- Notifications List -->
        <div class="overflow-y-auto flex-1">
          <div v-if="notifications.length === 0" class="px-4 py-8 text-center text-[#94a3b8] text-sm">
            {{ t('notifications.empty') }}
          </div>
          <div
            v-for="n in notifications"
            :key="n.id"
            @click="handleMarkRead(n.id)"
            :class="[
              'px-4 py-3 flex gap-3 cursor-pointer transition-colors border-b border-[#f1f5f9] last:border-0',
              n.read ? 'bg-white hover:bg-[#f8fafc]' : 'bg-blue-50/50 hover:bg-blue-50/70'
            ]"
          >
            <!-- Type icon -->
            <div
              class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
              :style="{ backgroundColor: typeConfig[n.type].bg }"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" :stroke="typeConfig[n.type].color" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" :d="typeConfig[n.type].icon" />
              </svg>
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start gap-2">
                <p class="text-sm font-medium text-[#1e293b] leading-tight">{{ n.title }}</p>
                <!-- Unread dot -->
                <span v-if="!n.read" class="w-2 h-2 rounded-full bg-[#0e888d] flex-shrink-0 mt-1"></span>
              </div>
              <p class="text-xs text-[#64748b] mt-1 line-clamp-2">{{ n.message }}</p>
              <div class="flex items-center gap-2 mt-1">
                <p class="text-[11px] text-[#94a3b8]">{{ notificationStore.formatRelativeTime(n.createdAt) }}</p>
                <button
                  v-if="getNotificationLink(n)"
                  @click.stop="handleNavigate(n)"
                  class="text-[11px] text-[#0e888d] hover:text-[#0a6d71] font-medium transition-colors"
                >{{ t('notifications.goTo') }} &rarr;</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer link -->
        <div class="px-4 py-2.5 border-t border-[#e2e8f0] flex-shrink-0 text-center">
          <router-link
            :to="notificationsPagePath"
            class="text-sm text-[#0e888d] hover:text-[#0a6d71] font-medium transition-colors"
            @click="isOpen = false"
          >{{ t('notifications.viewAll') }}</router-link>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* Mobile: full-width dropdown */
@media (max-width: 640px) {
  .notification-dropdown {
    position: fixed;
    left: 0;
    right: 0;
    top: 60px;
    width: 100%;
    max-height: calc(100vh - 80px);
    border-radius: 0 0 12px 12px;
  }
}
</style>
