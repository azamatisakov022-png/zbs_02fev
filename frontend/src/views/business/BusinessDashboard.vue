<script setup lang="ts">
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import { icons } from '../../utils/menuIcons'

const menuItems = [
  { id: 'dashboard', label: 'Главная', icon: icons.dashboard, route: '/business' },
  { id: 'reports', label: 'Отчёты', icon: icons.report, route: '/business/reports' },
  { id: 'declarations', label: 'Декларации', icon: icons.document, route: '/business/declarations' },
  { id: 'calculator', label: 'Расчёт утильсбора', icon: icons.calculator, route: '/business/calculator' },
  { id: 'payments', label: 'Платежи', icon: icons.payment, route: '/business/payments' },
  { id: 'documents', label: 'Документы', icon: icons.folder, route: '/business/documents' },
  { id: 'normatives', label: 'Нормативы переработки', icon: icons.registries, route: '/business/normatives' },
  { id: 'recyclers', label: 'Переработчики отходов', icon: icons.recycle, route: '/business/recyclers' },
  { id: 'profile', label: 'Профиль компании', icon: icons.building, route: '/business/profile' },
]

const actionCards = [
  {
    icon: '📝',
    title: 'Подать декларацию',
    description: 'Заполните и отправьте декларацию о товарах и упаковке',
    route: '/business/declarations/new',
    color: 'blue'
  },
  {
    icon: '📊',
    title: 'Подать отчёт о переработке',
    description: 'Отчёт о переработке отходов от использования товаров',
    route: '/business/reports/new',
    color: 'green'
  },
  {
    icon: '💰',
    title: 'Расчёт утилизационного сбора',
    description: 'Расчёт суммы утилизационного сбора за товары и упаковку',
    route: '/business/calculator',
    color: 'orange'
  }
]

const recentDocuments = [
  { name: 'Декларация Q4 2024', status: 'Принята', date: '20.01.2025', type: 'declaration' },
  { name: 'Отчёт о переработке 2024', status: 'На проверке', date: '18.01.2025', type: 'report' },
  { name: 'Расчёт утильсбора Q4', status: 'Оплачен', date: '15.01.2025', type: 'calculation' },
]

const getStatusClass = (status: string) => {
  switch (status) {
    case 'Принята': return 'bg-green-100 text-green-800'
    case 'На проверке': return 'bg-yellow-100 text-yellow-800'
    case 'Оплачен': return 'bg-blue-100 text-blue-800'
    case 'Отклонена': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}
</script>

<template>
  <DashboardLayout
    role="business"
    roleTitle="Бизнес"
    userName="ОсОО «ТехПром»"
    :menuItems="menuItems"
  >
    <div class="content__header mb-8">
      <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b] mb-2">Главная</h1>
      <p class="text-[#64748b]">Управление отчётами, декларациями и платежами</p>
    </div>

    <!-- Action Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <router-link
        v-for="card in actionCards"
        :key="card.title"
        :to="card.route"
        class="action-card group bg-white rounded-2xl p-6 shadow-sm border-2 border-transparent hover:border-[#2563eb] hover:shadow-lg transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
      >
        <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2563eb] to-[#3b82f6] opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-[#3b82f6] to-[#2563eb] flex items-center justify-center text-2xl mb-4">
          {{ card.icon }}
        </div>
        <h3 class="text-lg font-semibold text-[#1e293b] mb-2">{{ card.title }}</h3>
        <p class="text-sm text-[#64748b] leading-relaxed">{{ card.description }}</p>
      </router-link>
    </div>

    <!-- Stats Row -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div class="bg-white rounded-xl p-5 shadow-sm border border-[#e2e8f0]">
        <p class="text-sm text-[#64748b] mb-1">Декларации за год</p>
        <p class="text-2xl font-bold text-[#1e293b]">4</p>
      </div>
      <div class="bg-white rounded-xl p-5 shadow-sm border border-[#e2e8f0]">
        <p class="text-sm text-[#64748b] mb-1">Отчёты на проверке</p>
        <p class="text-2xl font-bold text-[#f59e0b]">1</p>
      </div>
      <div class="bg-white rounded-xl p-5 shadow-sm border border-[#e2e8f0]">
        <p class="text-sm text-[#64748b] mb-1">К оплате</p>
        <p class="text-2xl font-bold text-[#ef4444]">45 200 сом</p>
      </div>
      <div class="bg-white rounded-xl p-5 shadow-sm border border-[#e2e8f0]">
        <p class="text-sm text-[#64748b] mb-1">Оплачено за год</p>
        <p class="text-2xl font-bold text-[#10b981]">125 800 сом</p>
      </div>
    </div>

    <!-- Recent Documents -->
    <div class="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] overflow-hidden">
      <div class="px-6 py-4 border-b border-[#e2e8f0] flex items-center justify-between">
        <h2 class="text-lg font-semibold text-[#1e293b]">Последние документы</h2>
        <router-link to="/business/documents" class="text-[#2563eb] text-sm font-medium hover:underline">
          Все документы →
        </router-link>
      </div>
      <div class="divide-y divide-[#f1f5f9]">
        <div
          v-for="doc in recentDocuments"
          :key="doc.name"
          class="px-6 py-4 flex items-center justify-between hover:bg-[#f8fafc] transition-colors"
        >
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-lg bg-[#f1f5f9] flex items-center justify-center">
              <span v-if="doc.type === 'declaration'">📋</span>
              <span v-else-if="doc.type === 'report'">📊</span>
              <span v-else>💰</span>
            </div>
            <div>
              <p class="font-medium text-[#1e293b]">{{ doc.name }}</p>
              <p class="text-sm text-[#64748b]">{{ doc.date }}</p>
            </div>
          </div>
          <span :class="['px-3 py-1 rounded-full text-xs font-medium', getStatusClass(doc.status)]">
            {{ doc.status }}
          </span>
        </div>
      </div>
    </div>

    <!-- Info Banner -->
    <div class="mt-8 bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] rounded-2xl p-6 text-white">
      <div class="flex items-start gap-4">
        <div class="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 text-2xl">
          ℹ️
        </div>
        <div>
          <h4 class="font-semibold text-lg mb-1">Напоминание</h4>
          <p class="opacity-90">Срок подачи декларации за I квартал 2025 года — до 20 апреля 2025 г. Не забудьте своевременно подать отчётность.</p>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>
