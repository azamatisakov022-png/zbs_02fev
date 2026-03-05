<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import StatsCard from '../../components/dashboard/StatsCard.vue'
import { icons, statsIcons } from '../../utils/menuIcons'
import { useAdminMenu } from '../../composables/useRoleMenu'

const { t } = useI18n()
const { roleTitle, menuItems } = useAdminMenu()

const stats = computed(() => [
  { title: t('adminDashboard.users'), value: '342', icon: statsIcons.users, color: 'blue' as const },
  { title: t('adminDashboard.organizations'), value: '156', icon: statsIcons.applications, color: 'teal' as const },
  { title: t('adminDashboard.onReview'), value: '89', icon: statsIcons.pending, color: 'orange' as const },
  { title: t('adminDashboard.collectedFee'), value: t('adminDashboard.collectedFeeValue'), icon: statsIcons.money, color: 'green' as const },
])

interface AuditEntry {
  time: string
  user: string
  action: string
  status: 'success' | 'warning' | 'error'
}

const auditLog: AuditEntry[] = [
  { time: '14:32', user: 'Иванов И.И.', action: 'Изменение ставки утильсбора', status: 'success' },
  { time: '14:28', user: 'Петрова А.С.', action: 'Одобрение декларации', status: 'success' },
  { time: '14:15', user: 'Система', action: 'Автоимпорт курсов валют', status: 'success' },
  { time: '13:58', user: 'Сидоров К.М.', action: 'Вход с нового устройства', status: 'warning' },
  { time: '13:45', user: 'Алиева Д.Н.', action: 'Экспорт сводного отчёта', status: 'success' },
  { time: '13:22', user: 'Иванов И.И.', action: 'Создание пользователя', status: 'success' },
]

const statusConfig = computed(() => ({
  success: { label: t('adminDashboard.statusSuccess'), bg: 'bg-[#ecfdf5]', text: 'text-[#059669]', dot: 'bg-[#059669]' },
  warning: { label: t('adminDashboard.statusWarning'), bg: 'bg-[#fffbeb]', text: 'text-[#d97706]', dot: 'bg-[#d97706]' },
  error: { label: t('adminDashboard.statusError'), bg: 'bg-[#fef2f2]', text: 'text-[#dc2626]', dot: 'bg-[#dc2626]' },
}))

const pendingItems = computed(() => [
  { label: t('adminDashboard.declarationsOnReview'), count: 45, route: '/admin/references' },
  { label: t('adminDashboard.newOrganizations'), count: 12, route: '/admin/users' },
  { label: t('adminDashboard.calcsForApproval'), count: 23, route: '/admin/references' },
  { label: t('adminDashboard.expiringLicenses'), count: 7, route: '/admin/references' },
])

const quickActions = computed(() => [
  { label: t('adminDashboard.userManagement'), route: '/admin/users', icon: icons.users, bgColor: 'bg-[#2563eb]' },
  { label: t('adminDashboard.auditLog'), route: '/admin/audit', icon: icons.audit, bgColor: 'bg-[#059669]' },
  { label: t('adminDashboard.systemSettings'), route: '/admin/settings', icon: icons.settings, bgColor: 'bg-[#d97706]' },
])

interface SystemAlert {
  type: 'warning' | 'info' | 'error' | 'success'
  message: string
}

const systemAlerts: SystemAlert[] = [
  { type: 'warning', message: 'Лицензия ОсОО «ТекстильРесайкл» истекает через 7 дней' },
  { type: 'info', message: 'Запланировано обновление системы на 15.02.2026' },
  { type: 'error', message: 'Ошибка синхронизации с Нацстаткомом КР' },
  { type: 'success', message: 'Резервная копия БД создана успешно (2.4 ГБ)' },
]

const alertConfig = {
  warning: {
    border: 'border-l-[#d97706]',
    bg: 'bg-[#fffbeb]',
    dot: 'bg-[#d97706]',
    text: 'text-[#92400e]',
  },
  info: {
    border: 'border-l-[#2563eb]',
    bg: 'bg-[#eff6ff]',
    dot: 'bg-[#2563eb]',
    text: 'text-[#1e40af]',
  },
  error: {
    border: 'border-l-[#dc2626]',
    bg: 'bg-[#fef2f2]',
    dot: 'bg-[#dc2626]',
    text: 'text-[#991b1b]',
  },
  success: {
    border: 'border-l-[#059669]',
    bg: 'bg-[#ecfdf5]',
    dot: 'bg-[#059669]',
    text: 'text-[#065f46]',
  },
}
</script>

<template>
  <DashboardLayout
    role="admin"
    :roleTitle="roleTitle"
    userName="Иван Петров"
    :menuItems="menuItems"
  >
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b] mb-2">{{ $t('adminDashboard.title') }}</h1>
      <p class="text-[#64748b]">{{ $t('adminDashboard.subtitle') }}</p>
    </div>

    <!-- KPI Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatsCard
        v-for="stat in stats"
        :key="stat.title"
        :title="stat.title"
        :value="stat.value"
        :icon="stat.icon"
        :color="stat.color"
      />
    </div>

    <!-- Two-column: Audit Log & Pending Items -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- LEFT: Audit Log -->
      <div class="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] overflow-hidden">
        <div class="px-6 py-4 border-b border-[#e2e8f0] flex items-center justify-between">
          <h2 class="text-lg font-semibold text-[#1e293b]">{{ $t('adminDashboard.recentActions') }}</h2>
          <router-link to="/admin/audit" class="text-[#0e888d] text-sm font-medium hover:underline">
            {{ $t('adminDashboard.allRecords') }} &rarr;
          </router-link>
        </div>
        <div class="divide-y divide-[#f1f5f9]">
          <div
            v-for="(entry, idx) in auditLog"
            :key="idx"
            class="px-6 py-3 flex items-center gap-4 hover:bg-[#f8fafc] transition-colors"
          >
            <span class="text-sm text-[#94a3b8] font-mono w-12 flex-shrink-0">{{ entry.time }}</span>
            <span class="text-sm font-medium text-[#334155] w-28 flex-shrink-0 truncate">{{ entry.user }}</span>
            <span class="text-sm text-[#475569] flex-1 truncate">{{ entry.action }}</span>
            <span
              :class="[
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0',
                statusConfig[entry.status].bg,
                statusConfig[entry.status].text,
              ]"
            >
              <span :class="['w-1.5 h-1.5 rounded-full', statusConfig[entry.status].dot]"></span>
              {{ statusConfig[entry.status].label }}
            </span>
          </div>
        </div>
      </div>

      <!-- RIGHT: Pending Items -->
      <div class="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] overflow-hidden">
        <div class="px-6 py-4 border-b border-[#e2e8f0]">
          <h2 class="text-lg font-semibold text-[#1e293b]">{{ $t('adminDashboard.requiresAttention') }}</h2>
        </div>
        <div class="p-4 space-y-3">
          <router-link
            v-for="item in pendingItems"
            :key="item.label"
            :to="item.route"
            class="flex items-center justify-between p-4 rounded-xl bg-[#f8fafc] hover:bg-[#e8f5f5] transition-colors group"
          >
            <span class="font-medium text-[#334155] group-hover:text-[#0e888d] transition-colors">{{ item.label }}</span>
            <span class="flex items-center gap-2">
              <span class="px-3 py-1 bg-[#fff7ed] text-[#ea580c] rounded-full text-sm font-semibold">
                {{ item.count }}
              </span>
              <svg class="w-4 h-4 text-[#94a3b8] group-hover:text-[#0e888d] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </router-link>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
      <router-link
        v-for="action in quickActions"
        :key="action.label"
        :to="action.route"
        class="bg-white rounded-2xl p-6 shadow-sm border border-[#e2e8f0] hover:shadow-md hover:border-[#0e888d]/30 transition-all group"
      >
        <div class="flex items-center gap-4">
          <div
            :class="['w-12 h-12 rounded-xl flex items-center justify-center text-white flex-shrink-0 transition-transform group-hover:scale-110', action.bgColor]"
            v-html="action.icon"
          ></div>
          <span class="font-semibold text-[#1e293b] group-hover:text-[#0e888d] transition-colors">{{ action.label }}</span>
        </div>
      </router-link>
    </div>

    <!-- System Status Banner -->
    <div class="bg-gradient-to-r from-[#10b981] to-[#059669] rounded-2xl p-6 text-white mb-8">
      <div class="flex items-start gap-4">
        <div class="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h4 class="font-semibold text-lg mb-1">{{ $t('adminDashboard.systemStable') }}</h4>
          <p class="opacity-90">{{ $t('adminDashboard.systemStableDesc') }}</p>
        </div>
      </div>
    </div>

    <!-- System Alerts -->
    <div class="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] overflow-hidden">
      <div class="px-6 py-4 border-b border-[#e2e8f0]">
        <h2 class="text-lg font-semibold text-[#1e293b]">{{ $t('adminDashboard.systemNotifications') }}</h2>
      </div>
      <div class="p-4 space-y-3">
        <div
          v-for="(alert, idx) in systemAlerts"
          :key="idx"
          :class="[
            'flex items-center gap-3 px-5 py-4 rounded-xl border-l-4',
            alertConfig[alert.type].bg,
            alertConfig[alert.type].border,
          ]"
        >
          <span :class="['w-2 h-2 rounded-full flex-shrink-0', alertConfig[alert.type].dot]"></span>
          <span :class="['text-sm font-medium', alertConfig[alert.type].text]">{{ alert.message }}</span>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>
