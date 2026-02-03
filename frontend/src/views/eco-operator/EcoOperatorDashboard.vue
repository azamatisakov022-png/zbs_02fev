<script setup lang="ts">
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import StatsCard from '../../components/dashboard/StatsCard.vue'
import { icons, statsIcons } from '../../utils/menuIcons'

const menuItems = [
  { id: 'dashboard', label: 'Главная', icon: icons.dashboard, route: '/eco-operator' },
  { id: 'incoming-declarations', label: 'Входящие декларации', icon: icons.document, route: '/eco-operator/incoming-declarations' },
  { id: 'incoming-reports', label: 'Входящие отчёты', icon: icons.report, route: '/eco-operator/incoming-reports' },
  { id: 'enterprise', label: 'Моё предприятие', icon: icons.building, route: '/eco-operator/enterprise' },
  { id: 'licenses', label: 'Лицензии и документы', icon: icons.license, route: '/eco-operator/licenses' },
  { id: 'waste-types', label: 'Виды отходов', icon: icons.recycle, route: '/eco-operator/waste-types' },
  { id: 'my-reports', label: 'Мои отчёты', icon: icons.registries, route: '/eco-operator/my-reports' },
  { id: 'payments', label: 'Аналитика платежей', icon: icons.money, route: '/eco-operator/payments' },
  { id: 'analytics', label: 'Аналитика', icon: icons.analytics, route: '/eco-operator/analytics' },
  { id: 'profile', label: 'Профили компаний', icon: icons.profile, route: '/eco-operator/profile' },
]

const stats = [
  { title: 'Статус предприятия', value: 'Активен', icon: statsIcons.status, color: 'green' as const },
  { title: 'Новых деклараций', value: '12', icon: statsIcons.documents, color: 'blue' as const },
  { title: 'Принято за месяц', value: '387 т', icon: statsIcons.waste, color: 'teal' as const },
  { title: 'Срок лицензии', value: '15.08.2026', icon: statsIcons.calendar, color: 'orange' as const },
]

const recentDeclarations = [
  { company: 'ОсОО «ТехПром»', type: 'Декларация о товарах', date: '20.01.2025', status: 'Новая' },
  { company: 'ОАО «СтройМаркет»', type: 'Декларация об упаковке', date: '19.01.2025', status: 'На рассмотрении' },
  { company: 'ОсОО «ПищеПром»', type: 'Декларация о товарах', date: '18.01.2025', status: 'Принята' },
]

const getStatusClass = (status: string) => {
  switch (status) {
    case 'Новая': return 'bg-blue-100 text-blue-800'
    case 'На рассмотрении': return 'bg-yellow-100 text-yellow-800'
    case 'Принята': return 'bg-green-100 text-green-800'
    case 'Отклонена': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}
</script>

<template>
  <DashboardLayout
    role="eco-operator"
    roleTitle="Эко Оператор"
    userName="ОсОО «ЭкоПереработка»"
    :menuItems="menuItems"
  >
    <div class="content__header mb-8">
      <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b] mb-2">Главная</h1>
      <p class="text-[#64748b]">Приём и обработка деклараций от бизнеса</p>
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

    <!-- Quick Actions & Recent Declarations -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-[#e2e8f0]">
        <h3 class="text-lg font-semibold text-[#1e293b] mb-4">Быстрые действия</h3>
        <div class="space-y-3">
          <router-link to="/eco-operator/incoming-declarations" class="flex items-center gap-3 p-4 rounded-xl bg-[#f8fafc] hover:bg-[#e8f5f5] transition-colors">
            <div class="w-10 h-10 rounded-lg bg-[#2563eb] flex items-center justify-center text-white" v-html="icons.document"></div>
            <div>
              <span class="font-medium text-[#1e293b] block">Входящие декларации</span>
              <span class="text-sm text-[#64748b]">12 новых</span>
            </div>
          </router-link>
          <router-link to="/eco-operator/incoming-reports" class="flex items-center gap-3 p-4 rounded-xl bg-[#f8fafc] hover:bg-[#e8f5f5] transition-colors">
            <div class="w-10 h-10 rounded-lg bg-[#10b981] flex items-center justify-center text-white" v-html="icons.report"></div>
            <div>
              <span class="font-medium text-[#1e293b] block">Входящие отчёты</span>
              <span class="text-sm text-[#64748b]">5 новых</span>
            </div>
          </router-link>
          <router-link to="/eco-operator/my-reports" class="flex items-center gap-3 p-4 rounded-xl bg-[#f8fafc] hover:bg-[#e8f5f5] transition-colors">
            <div class="w-10 h-10 rounded-lg bg-[#f59e0b] flex items-center justify-center text-white" v-html="icons.registries"></div>
            <div>
              <span class="font-medium text-[#1e293b] block">Подать отчёт о переработке</span>
              <span class="text-sm text-[#64748b]">Отчётность за период</span>
            </div>
          </router-link>
        </div>
      </div>

      <div class="bg-white rounded-2xl p-6 shadow-sm border border-[#e2e8f0]">
        <h3 class="text-lg font-semibold text-[#1e293b] mb-4">Статистика переработки</h3>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-[#64748b]">Пластик</span>
            <div class="flex items-center gap-3">
              <div class="w-32 h-2 bg-[#f1f5f9] rounded-full overflow-hidden">
                <div class="h-full bg-[#2563eb] rounded-full" style="width: 75%"></div>
              </div>
              <span class="font-medium text-[#1e293b]">189 т</span>
            </div>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-[#64748b]">Бумага/картон</span>
            <div class="flex items-center gap-3">
              <div class="w-32 h-2 bg-[#f1f5f9] rounded-full overflow-hidden">
                <div class="h-full bg-[#10b981] rounded-full" style="width: 60%"></div>
              </div>
              <span class="font-medium text-[#1e293b]">124 т</span>
            </div>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-[#64748b]">Стекло</span>
            <div class="flex items-center gap-3">
              <div class="w-32 h-2 bg-[#f1f5f9] rounded-full overflow-hidden">
                <div class="h-full bg-[#f59e0b] rounded-full" style="width: 35%"></div>
              </div>
              <span class="font-medium text-[#1e293b]">52 т</span>
            </div>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-[#64748b]">Металл</span>
            <div class="flex items-center gap-3">
              <div class="w-32 h-2 bg-[#f1f5f9] rounded-full overflow-hidden">
                <div class="h-full bg-[#6366f1] rounded-full" style="width: 20%"></div>
              </div>
              <span class="font-medium text-[#1e293b]">22 т</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Declarations Table -->
    <div class="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] overflow-hidden mb-8">
      <div class="px-6 py-4 border-b border-[#e2e8f0] flex items-center justify-between">
        <h2 class="text-lg font-semibold text-[#1e293b]">Последние декларации</h2>
        <router-link to="/eco-operator/incoming-declarations" class="text-[#2563eb] text-sm font-medium hover:underline">
          Все декларации →
        </router-link>
      </div>
      <div class="divide-y divide-[#f1f5f9]">
        <div
          v-for="decl in recentDeclarations"
          :key="decl.company + decl.date"
          class="px-6 py-4 flex items-center justify-between hover:bg-[#f8fafc] transition-colors"
        >
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-lg bg-[#f1f5f9] flex items-center justify-center">
              <span>📋</span>
            </div>
            <div>
              <p class="font-medium text-[#1e293b]">{{ decl.company }}</p>
              <p class="text-sm text-[#64748b]">{{ decl.type }} • {{ decl.date }}</p>
            </div>
          </div>
          <span :class="['px-3 py-1 rounded-full text-xs font-medium', getStatusClass(decl.status)]">
            {{ decl.status }}
          </span>
        </div>
      </div>
    </div>

    <!-- License Info Banner -->
    <div class="bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] rounded-2xl p-6 text-white">
      <div class="flex items-start gap-4">
        <div class="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h4 class="font-semibold text-lg mb-1">Срок действия лицензии</h4>
          <p class="opacity-90">Ваша лицензия действительна до 15 августа 2026 года. Рекомендуем начать процесс продления не позднее чем за 3 месяца до истечения срока.</p>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>
