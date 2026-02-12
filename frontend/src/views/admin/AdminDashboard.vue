<script setup lang="ts">
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import StatsCard from '../../components/dashboard/StatsCard.vue'
import { icons, statsIcons } from '../../utils/menuIcons'

const menuItems = [
  { id: 'dashboard', label: 'Главная', icon: icons.dashboard, route: '/admin' },
  { id: 'users', label: 'Пользователи', icon: icons.users, route: '/admin/users' },
  { id: 'organizations', label: 'Организации', icon: icons.building, route: '/admin/organizations' },
  { id: 'declarations', label: 'Все декларации', icon: icons.document, route: '/admin/declarations' },
  { id: 'reports', label: 'Все отчёты', icon: icons.report, route: '/admin/reports' },
  { id: 'registries', label: 'Реестры и справочники', icon: icons.registries, route: '/admin/registries' },
  { id: 'calculations', label: 'Настройки расчётов', icon: icons.calculator, route: '/admin/calculations' },
  { id: 'analytics', label: 'Аналитика', icon: icons.analytics, route: '/admin/analytics' },
  { id: 'audit', label: 'Журнал действий', icon: icons.audit, route: '/admin/audit' },
  { id: 'settings', label: 'Настройки системы', icon: icons.settings, route: '/admin/settings' },
]

const stats = [
  { title: 'Организаций', value: '342', icon: statsIcons.users, color: 'blue' as const },
  { title: 'Деклараций за месяц', value: '1,247', icon: statsIcons.documents, color: 'teal' as const },
  { title: 'На проверке', value: '89', icon: statsIcons.applications, color: 'orange' as const },
  { title: 'Собрано утильсбора', value: '12.4 млн', icon: statsIcons.money, color: 'green' as const },
]

const recentActivity = [
  { action: 'Новая декларация', company: 'ОсОО «ТехПром»', time: '5 мин назад', type: 'declaration' },
  { action: 'Регистрация организации', company: 'ИП Асанов', time: '12 мин назад', type: 'registration' },
  { action: 'Отчёт принят', company: 'ОАО «СтройМаркет»', time: '25 мин назад', type: 'report' },
  { action: 'Оплата утильсбора', company: 'ОсОО «ПищеПром»', time: '1 час назад', type: 'payment' },
  { action: 'Декларация отклонена', company: 'ОсОО «МегаТорг»', time: '2 часа назад', type: 'rejected' },
]

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'declaration': return '📋'
    case 'registration': return '🏢'
    case 'report': return '📊'
    case 'payment': return '💰'
    case 'rejected': return '❌'
    default: return '📌'
  }
}

const pendingItems = [
  { type: 'Декларации на проверке', count: 45, route: '/admin/declarations' },
  { type: 'Отчёты на проверке', count: 23, route: '/admin/reports' },
  { type: 'Новые организации', count: 12, route: '/admin/organizations' },
  { type: 'Обращения пользователей', count: 9, route: '/admin/support' },
]
</script>

<template>
  <DashboardLayout
    role="admin"
    roleTitle="Администратор"
    userName="Иван Петров"
    :menuItems="menuItems"
  >
    <div class="content__header mb-8">
      <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b] mb-2">Панель управления</h1>
      <p class="text-[#64748b]">ГП «Эко Оператор» — обзор системы</p>
    </div>

    <!-- Stats Cards -->
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

    <!-- Quick Actions & Pending -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- Quick Actions -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-[#e2e8f0]">
        <h3 class="text-lg font-semibold text-[#1e293b] mb-4">Быстрые действия</h3>
        <div class="space-y-3">
          <router-link to="/admin/users" class="flex items-center gap-3 p-4 rounded-xl bg-[#f8fafc] hover:bg-blue-50 transition-colors">
            <div class="w-10 h-10 rounded-lg bg-[#2563eb] flex items-center justify-center text-white" v-html="icons.users"></div>
            <span class="font-medium text-[#1e293b]">Управление пользователями</span>
          </router-link>
          <router-link to="/admin/declarations" class="flex items-center gap-3 p-4 rounded-xl bg-[#f8fafc] hover:bg-blue-50 transition-colors">
            <div class="w-10 h-10 rounded-lg bg-[#10b981] flex items-center justify-center text-white" v-html="icons.document"></div>
            <span class="font-medium text-[#1e293b]">Проверка деклараций</span>
          </router-link>
          <router-link to="/admin/analytics" class="flex items-center gap-3 p-4 rounded-xl bg-[#f8fafc] hover:bg-blue-50 transition-colors">
            <div class="w-10 h-10 rounded-lg bg-[#f59e0b] flex items-center justify-center text-white" v-html="icons.analytics"></div>
            <span class="font-medium text-[#1e293b]">Выгрузить аналитику</span>
          </router-link>
        </div>
      </div>

      <!-- Pending Items -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-[#e2e8f0]">
        <h3 class="text-lg font-semibold text-[#1e293b] mb-4">Требует внимания</h3>
        <div class="space-y-3">
          <router-link
            v-for="item in pendingItems"
            :key="item.type"
            :to="item.route"
            class="flex items-center justify-between p-4 rounded-xl bg-[#f8fafc] hover:bg-orange-50 transition-colors"
          >
            <span class="font-medium text-[#1e293b]">{{ item.type }}</span>
            <span class="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
              {{ item.count }}
            </span>
          </router-link>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] overflow-hidden mb-8">
      <div class="px-6 py-4 border-b border-[#e2e8f0] flex items-center justify-between">
        <h2 class="text-lg font-semibold text-[#1e293b]">Последняя активность</h2>
        <router-link to="/admin/audit" class="text-[#2563eb] text-sm font-medium hover:underline">
          Журнал действий →
        </router-link>
      </div>
      <div class="divide-y divide-[#f1f5f9]">
        <div
          v-for="activity in recentActivity"
          :key="activity.company + activity.time"
          class="px-6 py-4 flex items-center justify-between hover:bg-[#f8fafc] transition-colors"
        >
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-lg bg-[#f1f5f9] flex items-center justify-center">
              <span>{{ getActivityIcon(activity.type) }}</span>
            </div>
            <div>
              <p class="font-medium text-[#1e293b]">{{ activity.action }}</p>
              <p class="text-sm text-[#64748b]">{{ activity.company }}</p>
            </div>
          </div>
          <span class="text-sm text-[#64748b]">{{ activity.time }}</span>
        </div>
      </div>
    </div>

    <!-- System Status Banner -->
    <div class="bg-gradient-to-r from-[#10b981] to-[#059669] rounded-2xl p-6 text-white">
      <div class="flex items-start gap-4">
        <div class="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h4 class="font-semibold text-lg mb-1">Система работает стабильно</h4>
          <p class="opacity-90">Все сервисы функционируют в штатном режиме. Последнее обновление базы данных: сегодня в 03:00.</p>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>
