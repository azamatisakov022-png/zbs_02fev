<script setup lang="ts">
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import StatsCard from '../../components/dashboard/StatsCard.vue'
import { icons, statsIcons } from '../../utils/menuIcons'

const menuItems = [
  { id: 'dashboard', label: 'Главная', icon: icons.dashboard, route: '/employee' },
  { id: 'applications', label: 'Входящие заявки', icon: icons.inbox, route: '/employee/applications' },
  { id: 'organizations', label: 'Организации', icon: icons.building, route: '/employee/organizations' },
  { id: 'licenses', label: 'Лицензии', icon: icons.license, route: '/employee/licenses' },
  { id: 'reports', label: 'Отчётность', icon: icons.report, route: '/employee/reports' },
  { id: 'map', label: 'ГИС-карта', icon: icons.map, route: '/employee/map' },
  { id: 'analytics', label: 'Аналитика', icon: icons.analytics, route: '/employee/analytics' },
  { id: 'profile', label: 'Мой профиль', icon: icons.profile, route: '/employee/profile' },
]

const stats = [
  { title: 'Новых заявок', value: '23', icon: statsIcons.applications, color: 'blue' as const },
  { title: 'На рассмотрении', value: '47', icon: statsIcons.pending, color: 'orange' as const },
  { title: 'Одобрено за месяц', value: '156', icon: statsIcons.approved, color: 'green' as const },
  { title: 'Организаций в реестре', value: '342', icon: statsIcons.users, color: 'teal' as const },
]

const recentApplications = [
  { number: '2025-0124', company: 'ОсОО «НовоТрейд»', type: 'Регистрация плательщика РОП', time: '15 мин назад', status: 'Новая' },
  { number: '2025-0123', company: 'ОАО «ГринТех»', type: 'Продление лицензии на переработку', time: '1 час назад', status: 'На рассмотрении' },
  { number: '2025-0122', company: 'ИП Асанов Б.К.', type: 'Регистрация плательщика РОП', time: '2 часа назад', status: 'На рассмотрении' },
  { number: '2025-0121', company: 'ОсОО «ЭкоСервис»', type: 'Лицензия на переработку отходов', time: '3 часа назад', status: 'Одобрено' },
]

const getStatusClass = (status: string) => {
  switch (status) {
    case 'Новая': return 'bg-blue-100 text-blue-800'
    case 'На рассмотрении': return 'bg-yellow-100 text-yellow-800'
    case 'Одобрено': return 'bg-green-100 text-green-800'
    case 'Отклонено': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}
</script>

<template>
  <DashboardLayout
    role="employee"
    roleTitle="Сотрудник МПРЭТН"
    userName="Мамытова Айгуль"
    :menuItems="menuItems"
  >
    <div class="content__header mb-8">
      <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b] mb-2">Главная</h1>
      <p class="text-[#64748b]">Обработка заявок и управление реестрами</p>
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

    <!-- Quick Actions & Recent Applications -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- Quick Actions -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-[#e2e8f0]">
        <h3 class="text-lg font-semibold text-[#1e293b] mb-4">Быстрые действия</h3>
        <div class="space-y-3">
          <router-link to="/employee/applications" class="flex items-center gap-3 p-4 rounded-xl bg-[#f8fafc] hover:bg-blue-50 transition-colors">
            <div class="w-10 h-10 rounded-lg bg-[#2563eb] flex items-center justify-center text-white" v-html="icons.inbox"></div>
            <div>
              <span class="font-medium text-[#1e293b] block">Входящие заявки</span>
              <span class="text-sm text-[#64748b]">23 новых</span>
            </div>
          </router-link>
          <router-link to="/employee/organizations" class="flex items-center gap-3 p-4 rounded-xl bg-[#f8fafc] hover:bg-blue-50 transition-colors">
            <div class="w-10 h-10 rounded-lg bg-[#10b981] flex items-center justify-center text-white" v-html="icons.building"></div>
            <div>
              <span class="font-medium text-[#1e293b] block">Реестр организаций</span>
              <span class="text-sm text-[#64748b]">342 организации</span>
            </div>
          </router-link>
          <router-link to="/employee/licenses" class="flex items-center gap-3 p-4 rounded-xl bg-[#f8fafc] hover:bg-blue-50 transition-colors">
            <div class="w-10 h-10 rounded-lg bg-[#f59e0b] flex items-center justify-center text-white" v-html="icons.license"></div>
            <div>
              <span class="font-medium text-[#1e293b] block">Лицензии</span>
              <span class="text-sm text-[#64748b]">5 истекают в этом месяце</span>
            </div>
          </router-link>
        </div>
      </div>

      <!-- Pending Tasks -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-[#e2e8f0]">
        <h3 class="text-lg font-semibold text-[#1e293b] mb-4">Требует внимания</h3>
        <div class="space-y-3">
          <router-link to="/employee/applications" class="flex items-center justify-between p-4 rounded-xl bg-[#f8fafc] hover:bg-orange-50 transition-colors">
            <span class="font-medium text-[#1e293b]">Новые заявки на регистрацию</span>
            <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">15</span>
          </router-link>
          <router-link to="/employee/applications" class="flex items-center justify-between p-4 rounded-xl bg-[#f8fafc] hover:bg-orange-50 transition-colors">
            <span class="font-medium text-[#1e293b]">Заявки на лицензии</span>
            <span class="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">8</span>
          </router-link>
          <router-link to="/employee/licenses" class="flex items-center justify-between p-4 rounded-xl bg-[#f8fafc] hover:bg-orange-50 transition-colors">
            <span class="font-medium text-[#1e293b]">Лицензии с истекающим сроком</span>
            <span class="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">5</span>
          </router-link>
        </div>
      </div>
    </div>

    <!-- Recent Applications -->
    <div class="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] overflow-hidden">
      <div class="px-6 py-4 border-b border-[#e2e8f0] flex items-center justify-between">
        <h2 class="text-lg font-semibold text-[#1e293b]">Последние заявки</h2>
        <router-link to="/employee/applications" class="text-[#2563eb] text-sm font-medium hover:underline">
          Все заявки →
        </router-link>
      </div>
      <div class="divide-y divide-[#f1f5f9]">
        <div
          v-for="app in recentApplications"
          :key="app.number"
          class="px-6 py-4 flex items-center justify-between hover:bg-[#f8fafc] transition-colors"
        >
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-lg bg-[#f1f5f9] flex items-center justify-center">
              <span>📋</span>
            </div>
            <div>
              <p class="font-medium text-[#1e293b]">Заявка №{{ app.number }}</p>
              <p class="text-sm text-[#64748b]">{{ app.company }} — {{ app.type }}</p>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <span class="text-sm text-[#64748b] hidden sm:block">{{ app.time }}</span>
            <span :class="['px-3 py-1 rounded-full text-xs font-medium', getStatusClass(app.status)]">
              {{ app.status }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>
