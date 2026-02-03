<script setup lang="ts">
import { ref } from 'vue'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import DataTable from '../../components/dashboard/DataTable.vue'
import { icons } from '../../utils/menuIcons'

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

const columns = [
  { key: 'number', label: 'Номер', width: '130px' },
  { key: 'company', label: 'Организация' },
  { key: 'type', label: 'Тип декларации' },
  { key: 'period', label: 'Период', width: '120px' },
  { key: 'submittedAt', label: 'Дата подачи', width: '130px' },
  { key: 'status', label: 'Статус', width: '150px' },
]

const declarations = ref([
  { id: 1, number: 'ДК-2025-052', company: 'ОсОО «ТехПром»', type: 'Декларация о товарах и упаковке', period: 'Q4 2024', submittedAt: '21.01.2025', status: 'На проверке' },
  { id: 2, number: 'ДК-2025-051', company: 'ОАО «СтройМаркет»', type: 'Декларация о товарах и упаковке', period: 'Q4 2024', submittedAt: '20.01.2025', status: 'На проверке' },
  { id: 3, number: 'ДК-2025-050', company: 'ОсОО «ПищеПром»', type: 'Декларация о товарах и упаковке', period: 'Q4 2024', submittedAt: '20.01.2025', status: 'Принята' },
  { id: 4, number: 'ДК-2025-048', company: 'ИП Асанов Б.К.', type: 'Декларация о товарах и упаковке', period: 'Q4 2024', submittedAt: '19.01.2025', status: 'Принята' },
  { id: 5, number: 'ДК-2025-045', company: 'ОсОО «ТехПром»', type: 'Декларация о товарах и упаковке', period: 'Q3 2024', submittedAt: '15.10.2024', status: 'Принята' },
  { id: 6, number: 'ДК-2025-042', company: 'ОАО «МегаТорг»', type: 'Декларация о товарах и упаковке', period: 'Q4 2024', submittedAt: '14.01.2025', status: 'Отклонена' },
])

const getStatusClass = (status: string) => {
  switch (status) {
    case 'На проверке': return 'bg-yellow-100 text-yellow-800'
    case 'Принята': return 'bg-green-100 text-green-800'
    case 'Отклонена': return 'bg-red-100 text-red-800'
    case 'Черновик': return 'bg-gray-100 text-gray-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}
</script>

<template>
  <DashboardLayout
    role="admin"
    roleTitle="Администратор"
    userName="Иван Петров"
    :menuItems="menuItems"
  >
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div>
        <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b] mb-2">Все декларации</h1>
        <p class="text-[#64748b]">Декларации о товарах и упаковке от всех организаций</p>
      </div>
      <button class="flex items-center gap-2 bg-[#10b981] text-white px-5 py-3 rounded-xl font-medium hover:bg-[#059669] transition-colors">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Экспорт в Excel
      </button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
        <p class="text-sm text-[#64748b] mb-1">Всего деклараций</p>
        <p class="text-2xl font-bold text-[#1e293b]">1,247</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
        <p class="text-sm text-[#64748b] mb-1">За текущий месяц</p>
        <p class="text-2xl font-bold text-[#2563eb]">156</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
        <p class="text-sm text-[#64748b] mb-1">На проверке</p>
        <p class="text-2xl font-bold text-[#f59e0b]">45</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
        <p class="text-sm text-[#64748b] mb-1">Отклонено</p>
        <p class="text-2xl font-bold text-[#ef4444]">8</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-2xl p-4 shadow-sm border border-[#e2e8f0] mb-6">
      <div class="flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Поиск по номеру или организации..."
          class="flex-1 min-w-[200px] px-4 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb]"
        />
        <select class="px-4 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb]">
          <option value="">Все периоды</option>
          <option value="q4-2024">Q4 2024</option>
          <option value="q3-2024">Q3 2024</option>
          <option value="q2-2024">Q2 2024</option>
          <option value="q1-2024">Q1 2024</option>
        </select>
        <select class="px-4 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb]">
          <option value="">Все статусы</option>
          <option value="pending">На проверке</option>
          <option value="accepted">Принята</option>
          <option value="rejected">Отклонена</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <DataTable :columns="columns" :data="declarations" :actions="true">
      <template #cell-number="{ value }">
        <span class="font-mono font-medium text-[#2563eb]">{{ value }}</span>
      </template>
      <template #cell-company="{ value }">
        <span class="font-medium text-[#1e293b]">{{ value }}</span>
      </template>
      <template #cell-status="{ value }">
        <span :class="['px-3 py-1 rounded-full text-xs font-medium', getStatusClass(value)]">
          {{ value }}
        </span>
      </template>
      <template #actions="{ row }">
        <div class="flex items-center justify-end gap-2">
          <button
            class="p-2 text-[#2563eb] hover:bg-blue-50 rounded-lg transition-colors"
            title="Просмотреть"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <button
            v-if="row.status === 'На проверке'"
            class="p-2 text-[#10b981] hover:bg-green-50 rounded-lg transition-colors"
            title="Принять"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </button>
          <button
            v-if="row.status === 'На проверке'"
            class="p-2 text-[#ef4444] hover:bg-red-50 rounded-lg transition-colors"
            title="Отклонить"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <button
            class="p-2 text-[#64748b] hover:bg-gray-100 rounded-lg transition-colors"
            title="Скачать PDF"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
        </div>
      </template>
    </DataTable>
  </DashboardLayout>
</template>
