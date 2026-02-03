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
  { key: 'inn', label: 'ИНН', width: '140px' },
  { key: 'name', label: 'Наименование' },
  { key: 'type', label: 'Тип', width: '140px' },
  { key: 'region', label: 'Регион', width: '160px' },
  { key: 'registeredAt', label: 'Дата регистрации', width: '140px' },
  { key: 'status', label: 'Статус', width: '130px' },
]

const organizations = ref([
  { id: 1, inn: '01234567891234', name: 'ОсОО «ТехПром»', type: 'Бизнес', region: 'г. Бишкек', registeredAt: '15.03.2024', status: 'Активен' },
  { id: 2, inn: '01234567891235', name: 'ОсОО «ЭкоПереработка»', type: 'Эко Оператор', region: 'г. Бишкек', registeredAt: '10.02.2024', status: 'Активен' },
  { id: 3, inn: '01234567891236', name: 'ОАО «СтройМаркет»', type: 'Бизнес', region: 'Чуйская обл.', registeredAt: '22.01.2024', status: 'Активен' },
  { id: 4, inn: '01234567891237', name: 'ОсОО «ПищеПром»', type: 'Бизнес', region: 'г. Ош', registeredAt: '05.01.2024', status: 'Активен' },
  { id: 5, inn: '01234567891238', name: 'ИП Асанов Б.К.', type: 'Бизнес', region: 'г. Бишкек', registeredAt: '20.01.2025', status: 'На проверке' },
  { id: 6, inn: '01234567891239', name: 'ОсОО «ГринРесайкл»', type: 'Эко Оператор', region: 'Иссык-Кульская обл.', registeredAt: '18.12.2023', status: 'Активен' },
  { id: 7, inn: '01234567891240', name: 'ОАО «МегаТорг»', type: 'Бизнес', region: 'г. Бишкек', registeredAt: '01.11.2023', status: 'Заблокирован' },
])

const getStatusClass = (status: string) => {
  switch (status) {
    case 'Активен': return 'bg-green-100 text-green-800'
    case 'На проверке': return 'bg-yellow-100 text-yellow-800'
    case 'Заблокирован': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getTypeClass = (type: string) => {
  switch (type) {
    case 'Бизнес': return 'bg-blue-100 text-blue-800'
    case 'Эко Оператор': return 'bg-teal-100 text-teal-800'
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
        <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b] mb-2">Организации</h1>
        <p class="text-[#64748b]">Все зарегистрированные организации в системе</p>
      </div>
      <button class="flex items-center gap-2 bg-[#2563eb] text-white px-5 py-3 rounded-xl font-medium hover:bg-[#1d4ed8] transition-colors">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Добавить организацию
      </button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
        <p class="text-sm text-[#64748b] mb-1">Всего организаций</p>
        <p class="text-2xl font-bold text-[#1e293b]">342</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
        <p class="text-sm text-[#64748b] mb-1">Бизнес</p>
        <p class="text-2xl font-bold text-[#2563eb]">298</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
        <p class="text-sm text-[#64748b] mb-1">Эко Операторы</p>
        <p class="text-2xl font-bold text-[#0d9488]">44</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
        <p class="text-sm text-[#64748b] mb-1">На проверке</p>
        <p class="text-2xl font-bold text-[#f59e0b]">12</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-2xl p-4 shadow-sm border border-[#e2e8f0] mb-6">
      <div class="flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Поиск по ИНН или названию..."
          class="flex-1 min-w-[200px] px-4 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb]"
        />
        <select class="px-4 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb]">
          <option value="">Все типы</option>
          <option value="business">Бизнес</option>
          <option value="eco-operator">Эко Оператор</option>
        </select>
        <select class="px-4 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb]">
          <option value="">Все регионы</option>
          <option value="bishkek">г. Бишкек</option>
          <option value="chui">Чуйская обл.</option>
          <option value="osh">г. Ош</option>
          <option value="issyk-kul">Иссык-Кульская обл.</option>
        </select>
        <select class="px-4 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb]">
          <option value="">Все статусы</option>
          <option value="active">Активен</option>
          <option value="pending">На проверке</option>
          <option value="blocked">Заблокирован</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <DataTable :columns="columns" :data="organizations" :actions="true">
      <template #cell-inn="{ value }">
        <span class="font-mono text-[#64748b]">{{ value }}</span>
      </template>
      <template #cell-name="{ value }">
        <span class="font-medium text-[#1e293b]">{{ value }}</span>
      </template>
      <template #cell-type="{ value }">
        <span :class="['px-3 py-1 rounded-full text-xs font-medium', getTypeClass(value)]">
          {{ value }}
        </span>
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
            class="p-2 text-[#64748b] hover:bg-gray-100 rounded-lg transition-colors"
            title="Редактировать"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        </div>
      </template>
    </DataTable>
  </DashboardLayout>
</template>
