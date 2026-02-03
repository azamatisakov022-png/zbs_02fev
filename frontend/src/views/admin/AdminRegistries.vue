<script setup lang="ts">
import { ref, computed } from 'vue'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
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

// Registry categories
const registryCategories = ref([
  { id: 'waste', name: 'Классификатор отходов', icon: '🗑️', count: 847, description: 'Коды и классы отходов' },
  { id: 'tnved', name: 'Коды ТН ВЭД', icon: '📦', count: 12453, description: 'Товарная номенклатура' },
  { id: 'regions', name: 'Регионы и районы', icon: '🗺️', count: 52, description: 'Административное деление' },
  { id: 'rates', name: 'Ставки утильсбора', icon: '💰', count: 156, description: 'Тарифы по категориям' },
  { id: 'normatives', name: 'Нормативы переработки', icon: '📊', count: 48, description: 'Целевые показатели' },
  { id: 'activities', name: 'Виды деятельности', icon: '🏭', count: 234, description: 'ОКЭД коды' },
  { id: 'documents', name: 'Типы документов', icon: '📄', count: 28, description: 'Шаблоны и формы' },
  { id: 'statuses', name: 'Статусы и состояния', icon: '🔄', count: 15, description: 'Состояния объектов' },
])

const selectedRegistry = ref<string | null>(null)
const searchQuery = ref('')

// Sample data for selected registry
const wasteCodesData = ref([
  { id: 1, code: '01 01 01', name: 'Отходы от добычи полезных ископаемых', class: 5, active: true },
  { id: 2, code: '02 01 01', name: 'Отходы от мытья и очистки', class: 5, active: true },
  { id: 3, code: '15 01 01', name: 'Бумажная и картонная упаковка', class: 5, active: true },
  { id: 4, code: '15 01 02', name: 'Пластмассовая упаковка', class: 5, active: true },
  { id: 5, code: '16 01 03', name: 'Изношенные шины', class: 4, active: true },
  { id: 6, code: '20 01 21', name: 'Люминесцентные лампы', class: 1, active: true },
])

const filteredData = computed(() => {
  if (!searchQuery.value) return wasteCodesData.value
  const q = searchQuery.value.toLowerCase()
  return wasteCodesData.value.filter(item =>
    item.code.toLowerCase().includes(q) ||
    item.name.toLowerCase().includes(q)
  )
})

// Modal state
const showAddModal = ref(false)
const showImportModal = ref(false)

const getHazardClass = (hc: number) => {
  const classes: Record<number, string> = {
    1: 'bg-red-100 text-red-700',
    2: 'bg-orange-100 text-orange-700',
    3: 'bg-yellow-100 text-yellow-700',
    4: 'bg-blue-100 text-blue-700',
    5: 'bg-green-100 text-green-700',
  }
  return classes[hc] || 'bg-gray-100 text-gray-700'
}
</script>

<template>
  <DashboardLayout
    role="admin"
    roleTitle="Администратор"
    userName="Иван Петров"
    :menuItems="menuItems"
  >
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Реестры и справочники</h1>
          <p class="text-gray-600 mt-1">Управление справочными данными системы</p>
        </div>
        <div class="flex items-center gap-3">
          <button
            @click="showImportModal = true"
            class="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Импорт
          </button>
          <button
            @click="showAddModal = true"
            class="px-4 py-2 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 transition-colors flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Добавить запись
          </button>
        </div>
      </div>

      <!-- Registry Cards -->
      <div v-if="!selectedRegistry" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          v-for="reg in registryCategories"
          :key="reg.id"
          @click="selectedRegistry = reg.id"
          class="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md hover:border-rose-200 transition-all cursor-pointer"
        >
          <div class="flex items-start justify-between mb-3">
            <div class="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center text-2xl">
              {{ reg.icon }}
            </div>
            <span class="px-2 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded-full">
              {{ reg.count.toLocaleString() }}
            </span>
          </div>
          <h3 class="font-semibold text-gray-900">{{ reg.name }}</h3>
          <p class="text-sm text-gray-500 mt-1">{{ reg.description }}</p>
        </div>
      </div>

      <!-- Selected Registry View -->
      <div v-else class="space-y-4">
        <!-- Back button and title -->
        <div class="flex items-center gap-4">
          <button
            @click="selectedRegistry = null"
            class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h2 class="text-xl font-bold text-gray-900">
              {{ registryCategories.find(r => r.id === selectedRegistry)?.name }}
            </h2>
            <p class="text-sm text-gray-500">
              {{ registryCategories.find(r => r.id === selectedRegistry)?.count.toLocaleString() }} записей
            </p>
          </div>
        </div>

        <!-- Search and filters -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div class="flex items-center gap-4">
            <div class="flex-1 relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Поиск по коду или названию..."
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              />
            </div>
            <button class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              Фильтры
            </button>
            <button class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              Экспорт
            </button>
          </div>
        </div>

        <!-- Data table -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Код</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Наименование</th>
                <th class="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Класс опасности</th>
                <th class="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Статус</th>
                <th class="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Действия</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="item in filteredData" :key="item.id" class="hover:bg-gray-50">
                <td class="px-6 py-4">
                  <span class="font-mono text-sm text-rose-600 bg-rose-50 px-2 py-1 rounded">{{ item.code }}</span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-900">{{ item.name }}</td>
                <td class="px-6 py-4 text-center">
                  <span :class="['px-2 py-1 rounded-full text-xs font-medium', getHazardClass(item.class)]">
                    {{ item.class }} класс
                  </span>
                </td>
                <td class="px-6 py-4 text-center">
                  <span :class="item.active ? 'text-green-600' : 'text-gray-400'">
                    {{ item.active ? 'Активен' : 'Неактивен' }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center justify-center gap-2">
                    <button class="p-1.5 text-gray-400 hover:text-rose-600 transition-colors">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button class="p-1.5 text-gray-400 hover:text-red-600 transition-colors">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Pagination -->
          <div class="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p class="text-sm text-gray-500">Показано 1-6 из {{ filteredData.length }} записей</p>
            <div class="flex items-center gap-2">
              <button class="px-3 py-1 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">Назад</button>
              <button class="px-3 py-1 bg-rose-600 text-white rounded-lg">1</button>
              <button class="px-3 py-1 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">2</button>
              <button class="px-3 py-1 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">3</button>
              <button class="px-3 py-1 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">Далее</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>
