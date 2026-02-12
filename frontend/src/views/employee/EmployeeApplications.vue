<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import DataTable from '../../components/dashboard/DataTable.vue'
import EmptyState from '../../components/dashboard/EmptyState.vue'
import SkeletonLoader from '../../components/dashboard/SkeletonLoader.vue'
import { icons } from '../../utils/menuIcons'

const menuItems = [
  { id: 'dashboard', label: 'Главная', icon: icons.dashboard, route: '/employee' },
  { id: 'applications', label: 'Входящие заявки', icon: icons.inbox, route: '/employee/applications' },
  { id: 'organizations', label: 'Организации', icon: icons.building, route: '/employee/organizations' },
  { id: 'licenses', label: 'Лицензии', icon: icons.license, route: '/employee/licenses' },
  { id: 'recyclers-registry', label: 'Реестр переработчиков', icon: icons.recycle, route: '/employee/recyclers-registry' },
  { id: 'reports', label: 'Отчётность', icon: icons.report, route: '/employee/reports' },
  { id: 'map', label: 'ГИС-карта', icon: icons.map, route: '/employee/map' },
  { id: 'analytics', label: 'Аналитика', icon: icons.analytics, route: '/employee/analytics' },
  { id: 'profile', label: 'Мой профиль', icon: icons.profile, route: '/employee/profile' },
]

// Loading state
const isLoading = ref(true)
onMounted(() => { setTimeout(() => { isLoading.value = false }, 500) })

const columns = [
  { key: 'number', label: 'Номер заявки', width: '10%' },
  { key: 'applicant', label: 'Заявитель', width: '18%' },
  { key: 'type', label: 'Тип заявки', width: '18%' },
  { key: 'submittedAt', label: 'Дата подачи', width: '10%' },
  { key: 'status', label: 'Статус', width: '10%' },
]

const applications = ref([
  { id: 1, number: '2024-0892', applicant: 'ОсОО "КыргызИмпорт"', type: 'Регистрация плательщика', submittedAt: '28.01.2025', status: 'На рассмотрении' },
  { id: 2, number: '2024-0891', applicant: 'ОАО "ГринТех"', type: 'Лицензия на переработку', submittedAt: '27.01.2025', status: 'На рассмотрении' },
  { id: 3, number: '2024-0890', applicant: 'ИП Жумабаева', type: 'Изменение данных', submittedAt: '26.01.2025', status: 'Одобрено' },
  { id: 4, number: '2024-0889', applicant: 'ОсОО "ЭкоПереработка"', type: 'Продление лицензии', submittedAt: '25.01.2025', status: 'Одобрено' },
  { id: 5, number: '2024-0888', applicant: 'ОсОО "МегаТрейд"', type: 'Регистрация плательщика', submittedAt: '24.01.2025', status: 'Отклонено' },
  { id: 6, number: '2024-0887', applicant: 'ЗАО "АвтоКомплект"', type: 'Регистрация плательщика', submittedAt: '23.01.2025', status: 'На рассмотрении' },
])

const getStatusClass = (status: string) => {
  switch (status) {
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
    roleTitle="Сотрудник МПРЭТН КР"
    userName="Мамытова Айгуль"
    :menuItems="menuItems"
  >
    <h2 class="text-2xl font-bold text-[#415861] mb-6">Входящие заявки</h2>

    <template v-if="isLoading">
      <div class="mb-6"><SkeletonLoader variant="card" /></div>
      <SkeletonLoader variant="table" />
    </template>

    <template v-if="!isLoading">
    <!-- Filters -->
    <div class="bg-white rounded-2xl p-4 shadow-sm border border-[#e5e7eb] mb-6">
      <div class="flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Поиск по номеру или заявителю..."
          class="flex-1 min-w-[200px] px-4 py-2 border border-[#e5e7eb] rounded-lg focus:outline-none focus:border-[#0e888d]"
        />
        <select class="px-4 py-2 border border-[#e5e7eb] rounded-lg focus:outline-none focus:border-[#0e888d]">
          <option value="">Все типы</option>
          <option value="registration">Регистрация плательщика</option>
          <option value="license">Лицензия на переработку</option>
          <option value="change">Изменение данных</option>
        </select>
        <select class="px-4 py-2 border border-[#e5e7eb] rounded-lg focus:outline-none focus:border-[#0e888d]">
          <option value="">Все статусы</option>
          <option value="pending">На рассмотрении</option>
          <option value="approved">Одобрено</option>
          <option value="rejected">Отклонено</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <DataTable :columns="columns" :data="applications" :actions="true">
      <template #cell-number="{ value }">
        <span class="font-mono font-medium text-[#0e888d]">{{ value }}</span>
      </template>
      <template #cell-status="{ value }">
        <span :class="['px-3 py-1 rounded-full text-xs font-medium', getStatusClass(value)]">
          {{ value }}
        </span>
      </template>
      <template #actions="{ row }">
        <div class="flex flex-wrap items-center justify-end gap-2">
          <button class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#3B82F6] text-white hover:bg-[#2563EB] transition-colors shadow-sm">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            Просмотреть
          </button>
          <button v-if="row.status === 'На рассмотрении'" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#10B981] text-white hover:bg-[#059669] transition-colors shadow-sm">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
            Одобрить
          </button>
          <button v-if="row.status === 'На рассмотрении'" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#EF4444] text-white hover:bg-[#DC2626] transition-colors shadow-sm">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            Отклонить
          </button>
        </div>
      </template>
      <template #empty>
        <EmptyState
          icon='<svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>'
          title="Нет заявок"
          description="Заявки появятся после регистрации организаций"
        />
      </template>
    </DataTable>
    </template>
  </DashboardLayout>
</template>
