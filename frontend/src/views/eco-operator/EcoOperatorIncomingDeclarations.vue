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
  { key: 'type', label: 'Тип декларации' },
  { key: 'period', label: 'Период', width: '120px' },
  { key: 'submittedAt', label: 'Дата подачи', width: '130px' },
  { key: 'status', label: 'Статус', width: '150px' },
]

const declarations = ref([
  { id: 1, number: 'ДК-2025-052', company: 'ОсОО «ТехПром»', type: 'Декларация о товарах и упаковке', period: 'Q4 2024', submittedAt: '21.01.2025', status: 'Новая' },
  { id: 2, number: 'ДК-2025-051', company: 'ОАО «СтройМаркет»', type: 'Декларация о товарах и упаковке', period: 'Q4 2024', submittedAt: '20.01.2025', status: 'Новая' },
  { id: 3, number: 'ДК-2025-050', company: 'ОсОО «ПищеПром»', type: 'Декларация о товарах и упаковке', period: 'Q4 2024', submittedAt: '20.01.2025', status: 'На рассмотрении' },
  { id: 4, number: 'ДК-2025-048', company: 'ИП Иванов', type: 'Декларация о товарах и упаковке', period: 'Q4 2024', submittedAt: '19.01.2025', status: 'На рассмотрении' },
  { id: 5, number: 'ДК-2025-045', company: 'ОсОО «ТехПром»', type: 'Декларация о товарах и упаковке', period: 'Q3 2024', submittedAt: '15.01.2025', status: 'Принята' },
  { id: 6, number: 'ДК-2025-042', company: 'ОАО «МегаТорг»', type: 'Декларация о товарах и упаковке', period: 'Q4 2024', submittedAt: '14.01.2025', status: 'Принята' },
])

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
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div>
        <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b] mb-2">Входящие декларации</h1>
        <p class="text-[#64748b]">Декларации о товарах и упаковке от бизнеса</p>
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
        <p class="text-sm text-[#64748b] mb-1">Всего деклараций</p>
        <p class="text-2xl font-bold text-[#1e293b]">156</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
        <p class="text-sm text-[#64748b] mb-1">Новых</p>
        <p class="text-2xl font-bold text-[#2563eb]">12</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
        <p class="text-sm text-[#64748b] mb-1">На рассмотрении</p>
        <p class="text-2xl font-bold text-[#f59e0b]">8</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
        <p class="text-sm text-[#64748b] mb-1">Принято за месяц</p>
        <p class="text-2xl font-bold text-[#10b981]">45</p>
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
          <option value="2025">2025</option>
          <option value="2024">2024</option>
        </select>
        <select class="px-4 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb]">
          <option value="">Все статусы</option>
          <option value="new">Новая</option>
          <option value="review">На рассмотрении</option>
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
            v-if="row.status === 'Новая' || row.status === 'На рассмотрении'"
            class="p-2 text-[#10b981] hover:bg-green-50 rounded-lg transition-colors"
            title="Принять"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </button>
          <button
            v-if="row.status === 'Новая' || row.status === 'На рассмотрении'"
            class="p-2 text-[#ef4444] hover:bg-red-50 rounded-lg transition-colors"
            title="Отклонить"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </template>
    </DataTable>
  </DashboardLayout>
</template>
