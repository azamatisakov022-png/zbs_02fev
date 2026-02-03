<script setup lang="ts">
import { ref } from 'vue'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import DataTable from '../../components/dashboard/DataTable.vue'
import { icons } from '../../utils/menuIcons'

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

const columns = [
  { key: 'number', label: 'Номер', width: '130px' },
  { key: 'company', label: 'Компания' },
  { key: 'type', label: 'Тип отчёта' },
  { key: 'period', label: 'Период', width: '120px' },
  { key: 'submittedAt', label: 'Дата подачи', width: '130px' },
  { key: 'status', label: 'Статус', width: '150px' },
]

const reports = ref([
  { id: 1, number: 'РП-2025-018', company: 'ОсОО «ТехПром»', type: 'Отчёт о нормативах переработки', period: '2024 год', submittedAt: '21.01.2025', status: 'Новый' },
  { id: 2, number: 'РП-2025-017', company: 'ОАО «СтройМаркет»', type: 'Отчёт о нормативах переработки', period: '2024 год', submittedAt: '20.01.2025', status: 'Новый' },
  { id: 3, number: 'РП-2025-016', company: 'ОсОО «ПищеПром»', type: 'Отчёт о нормативах переработки', period: '2024 год', submittedAt: '19.01.2025', status: 'На проверке' },
  { id: 4, number: 'РП-2025-015', company: 'ИП Иванов', type: 'Отчёт о нормативах переработки', period: '2024 год', submittedAt: '18.01.2025', status: 'На проверке' },
  { id: 5, number: 'РП-2025-012', company: 'ОсОО «ТехПром»', type: 'Отчёт о нормативах переработки', period: '2023 год', submittedAt: '15.01.2025', status: 'Принят' },
  { id: 6, number: 'РП-2025-010', company: 'ОАО «МегаТорг»', type: 'Отчёт о нормативах переработки', period: '2024 год', submittedAt: '12.01.2025', status: 'Принят' },
])

const getStatusClass = (status: string) => {
  switch (status) {
    case 'Новый': return 'bg-blue-100 text-blue-800'
    case 'На проверке': return 'bg-yellow-100 text-yellow-800'
    case 'Принят': return 'bg-green-100 text-green-800'
    case 'Отклонён': return 'bg-red-100 text-red-800'
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
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div>
        <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b] mb-2">Входящие отчёты</h1>
        <p class="text-[#64748b]">Отчёты о нормативах переработки от бизнеса</p>
      </div>
      <div class="flex items-center gap-3">
        <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
          2 новых
        </span>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
        <p class="text-sm text-[#64748b] mb-1">Всего отчётов</p>
        <p class="text-2xl font-bold text-[#1e293b]">89</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
        <p class="text-sm text-[#64748b] mb-1">Новых</p>
        <p class="text-2xl font-bold text-[#2563eb]">5</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
        <p class="text-sm text-[#64748b] mb-1">На проверке</p>
        <p class="text-2xl font-bold text-[#f59e0b]">3</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
        <p class="text-sm text-[#64748b] mb-1">Принято за месяц</p>
        <p class="text-2xl font-bold text-[#10b981]">21</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-2xl p-4 shadow-sm border border-[#e2e8f0] mb-6">
      <div class="flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Поиск по номеру или компании..."
          class="flex-1 min-w-[200px] px-4 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb]"
        />
        <select class="px-4 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb]">
          <option value="">Все периоды</option>
          <option value="2024">2024 год</option>
          <option value="2023">2023 год</option>
        </select>
        <select class="px-4 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb]">
          <option value="">Все статусы</option>
          <option value="new">Новый</option>
          <option value="review">На проверке</option>
          <option value="accepted">Принят</option>
          <option value="rejected">Отклонён</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <DataTable :columns="columns" :data="reports" :actions="true">
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
            v-if="row.status === 'Новый' || row.status === 'На проверке'"
            class="p-2 text-[#10b981] hover:bg-green-50 rounded-lg transition-colors"
            title="Принять"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </button>
          <button
            v-if="row.status === 'Новый' || row.status === 'На проверке'"
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
