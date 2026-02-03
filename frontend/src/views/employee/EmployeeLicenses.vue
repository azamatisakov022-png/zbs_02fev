<script setup lang="ts">
import { ref } from 'vue'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import DataTable from '../../components/dashboard/DataTable.vue'
import { icons } from '../../utils/menuIcons'

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

const columns = [
  { key: 'number', label: 'Номер лицензии', width: '150px' },
  { key: 'company', label: 'Организация' },
  { key: 'type', label: 'Тип лицензии' },
  { key: 'issuedAt', label: 'Дата выдачи', width: '130px' },
  { key: 'expiresAt', label: 'Срок действия', width: '130px' },
  { key: 'status', label: 'Статус', width: '140px' },
]

const licenses = ref([
  { id: 1, number: 'ЛП-2024-0045', company: 'ОсОО «ЭкоПереработка»', type: 'Переработка пластика', issuedAt: '15.08.2024', expiresAt: '15.08.2026', status: 'Действует' },
  { id: 2, number: 'ЛП-2024-0044', company: 'ОсОО «ГринРесайкл»', type: 'Переработка бумаги', issuedAt: '10.07.2024', expiresAt: '10.07.2026', status: 'Действует' },
  { id: 3, number: 'ЛП-2023-0038', company: 'ОАО «ЭкоТех»', type: 'Переработка стекла', issuedAt: '20.03.2023', expiresAt: '20.03.2025', status: 'Истекает' },
  { id: 4, number: 'ЛП-2023-0035', company: 'ОсОО «МеталлПром»', type: 'Переработка металла', issuedAt: '15.02.2023', expiresAt: '15.02.2025', status: 'Истекает' },
  { id: 5, number: 'ЛП-2022-0028', company: 'ИП Сыдыков Н.А.', type: 'Переработка пластика', issuedAt: '01.06.2022', expiresAt: '01.06.2024', status: 'Истекла' },
  { id: 6, number: 'ЛП-2024-0048', company: 'ОАО «ГринТех»', type: 'Переработка электроники', issuedAt: '', expiresAt: '', status: 'На рассмотрении' },
])

const getStatusClass = (status: string) => {
  switch (status) {
    case 'Действует': return 'bg-green-100 text-green-800'
    case 'Истекает': return 'bg-orange-100 text-orange-800'
    case 'Истекла': return 'bg-red-100 text-red-800'
    case 'На рассмотрении': return 'bg-yellow-100 text-yellow-800'
    case 'Отозвана': return 'bg-gray-100 text-gray-800'
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
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div>
        <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b] mb-2">Лицензии</h1>
        <p class="text-[#64748b]">Реестр лицензий на переработку отходов</p>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
        <p class="text-sm text-[#64748b] mb-1">Всего лицензий</p>
        <p class="text-2xl font-bold text-[#1e293b]">44</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
        <p class="text-sm text-[#64748b] mb-1">Действующих</p>
        <p class="text-2xl font-bold text-[#10b981]">38</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
        <p class="text-sm text-[#64748b] mb-1">Истекают в этом месяце</p>
        <p class="text-2xl font-bold text-[#f59e0b]">5</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
        <p class="text-sm text-[#64748b] mb-1">На рассмотрении</p>
        <p class="text-2xl font-bold text-[#2563eb]">3</p>
      </div>
    </div>

    <!-- Alert for expiring licenses -->
    <div class="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 flex items-start gap-3">
      <div class="text-xl">⚠️</div>
      <div>
        <p class="font-medium text-[#1e293b]">Внимание</p>
        <p class="text-sm text-[#64748b]">5 лицензий истекают в течение следующих 30 дней. Рекомендуется уведомить организации о необходимости продления.</p>
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
          <option value="">Все типы</option>
          <option value="plastic">Переработка пластика</option>
          <option value="paper">Переработка бумаги</option>
          <option value="glass">Переработка стекла</option>
          <option value="metal">Переработка металла</option>
          <option value="electronics">Переработка электроники</option>
        </select>
        <select class="px-4 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb]">
          <option value="">Все статусы</option>
          <option value="active">Действует</option>
          <option value="expiring">Истекает</option>
          <option value="expired">Истекла</option>
          <option value="pending">На рассмотрении</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <DataTable :columns="columns" :data="licenses" :actions="true">
      <template #cell-number="{ value }">
        <span class="font-mono font-medium text-[#2563eb]">{{ value }}</span>
      </template>
      <template #cell-company="{ value }">
        <span class="font-medium text-[#1e293b]">{{ value }}</span>
      </template>
      <template #cell-expiresAt="{ value }">
        <span :class="value ? '' : 'text-[#64748b]'">{{ value || '—' }}</span>
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
            v-if="row.status === 'На рассмотрении'"
            class="p-2 text-[#10b981] hover:bg-green-50 rounded-lg transition-colors"
            title="Одобрить"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </button>
          <button
            v-if="row.status === 'На рассмотрении'"
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
