<script setup lang="ts">
import { ref, computed } from 'vue'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import EmptyState from '../../components/dashboard/EmptyState.vue'
import { icons } from '../../utils/menuIcons'
import { recyclerStore, type Recycler, type RecyclerStatus } from '../../stores/recyclers'
import { calculationStore } from '../../stores/calculations'
import { refundStore } from '../../stores/refunds'
import { reportStore } from '../../stores/reports'
import { productGroups } from '../../data/product-groups'

const menuItems = computed(() => [
  { id: 'dashboard', label: 'Главная', icon: icons.dashboard, route: '/eco-operator' },
  { id: 'incoming-calculations', label: 'Входящие расчёты', icon: icons.calculator, route: '/eco-operator/calculations', badge: calculationStore.getCalcReviewCount() },
  { id: 'incoming-declarations', label: 'Входящие декларации', icon: icons.document, route: '/eco-operator/incoming-declarations' },
  { id: 'incoming-reports', label: 'Входящие отчёты', icon: icons.report, route: '/eco-operator/incoming-reports', badge: reportStore.getPendingCount() },
  { id: 'refunds', label: 'Заявки на возврат', icon: icons.refund, route: '/eco-operator/refunds', badge: refundStore.getPendingRefundsCount() },
  { id: 'accounts', label: 'Лицевые счета', icon: icons.money, route: '/eco-operator/accounts' },
  { id: 'analytics', label: 'Аналитика и отчёты', icon: icons.analytics, route: '/eco-operator/analytics' },
  { id: 'profile', label: 'Профили компаний', icon: icons.profile, route: '/eco-operator/profile' },
  { id: 'recyclers-registry', label: 'Реестр переработчиков', icon: icons.recycle, route: '/eco-operator/recyclers' },
])

// View state
const showAddForm = ref(false)
const searchQuery = ref('')
const filterStatus = ref('')
const filterWasteType = ref('')

// Counts
const counts = computed(() => recyclerStore.getCounts())

// Filtered recyclers
const filteredRecyclers = computed(() => {
  let result = recyclerStore.state.recyclers
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(r => r.name.toLowerCase().includes(q) || r.inn.includes(q))
  }
  if (filterStatus.value) {
    result = result.filter(r => r.status === filterStatus.value)
  }
  if (filterWasteType.value) {
    result = result.filter(r => r.wasteTypes.includes(filterWasteType.value))
  }
  return result
})

// Status helpers
const getStatusLabel = (status: RecyclerStatus) => {
  switch (status) {
    case 'active': return 'Активен'
    case 'suspended': return 'Приостановлен'
    case 'revoked': return 'Аннулирован'
  }
}

const getStatusClass = (status: RecyclerStatus) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800'
    case 'suspended': return 'bg-yellow-100 text-yellow-800'
    case 'revoked': return 'bg-red-100 text-red-800'
  }
}

// Group label helper
const getGroupLabel = (value: string) => {
  return productGroups.find(g => g.value === value)?.label || value
}

const getGroupShortLabel = (value: string) => {
  const label = productGroups.find(g => g.value === value)?.label || value
  const match = label.match(/^(\d+)\.\s*(.+)$/)
  if (match) {
    const name = match[2]
    return name.length > 25 ? name.substring(0, 25) + '...' : name
  }
  return label
}

// Toggle status action
const handleToggleStatus = (recycler: Recycler) => {
  recyclerStore.toggleStatus(recycler.id)
}

// Add form
const newRecycler = ref({
  name: '',
  inn: '',
  licenseNumber: '',
  licenseDate: '',
  licenseExpiry: '',
  wasteTypes: [] as string[],
  address: '',
  contactPhone: '',
  contactEmail: '',
  status: 'active' as RecyclerStatus,
})

const resetForm = () => {
  newRecycler.value = {
    name: '',
    inn: '',
    licenseNumber: '',
    licenseDate: '',
    licenseExpiry: '',
    wasteTypes: [],
    address: '',
    contactPhone: '',
    contactEmail: '',
    status: 'active',
  }
}

const toggleWasteType = (groupValue: string) => {
  const idx = newRecycler.value.wasteTypes.indexOf(groupValue)
  if (idx >= 0) {
    newRecycler.value.wasteTypes.splice(idx, 1)
  } else {
    newRecycler.value.wasteTypes.push(groupValue)
  }
}

const saveRecycler = () => {
  if (!newRecycler.value.name || !newRecycler.value.inn) return
  const today = new Date()
  const dateStr = today.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
  recyclerStore.addRecycler({
    ...newRecycler.value,
    addedDate: dateStr,
    addedBy: 'Оператор ГП',
  })
  resetForm()
  showAddForm.value = false
}

const cancelForm = () => {
  resetForm()
  showAddForm.value = false
}

// Empty state helpers
const isFiltersActive = computed(() => !!(searchQuery.value || filterStatus.value || filterWasteType.value))

const resetAllFilters = () => {
  searchQuery.value = ''
  filterStatus.value = ''
  filterWasteType.value = ''
}
</script>

<template>
  <DashboardLayout
    role="eco-operator"
    roleTitle="ГП «Эко Оператор»"
    userName="Исманова Динара"
    :menuItems="menuItems"
  >
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div>
        <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b] mb-2">Реестр переработчиков</h1>
        <p class="text-[#64748b]">Лицензированные переработчики и утилизаторы отходов</p>
      </div>
      <button
        @click="showAddForm = true"
        class="flex items-center gap-2 bg-[#10b981] text-white px-5 py-2.5 rounded-xl font-medium hover:bg-[#059669] transition-colors shadow-sm flex-shrink-0"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Добавить переработчика
      </button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
        <p class="text-sm text-[#64748b] mb-1">Всего</p>
        <p class="text-2xl font-bold text-[#1e293b]">{{ counts.all }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
        <p class="text-sm text-[#64748b] mb-1">Активных</p>
        <p class="text-2xl font-bold text-[#10b981]">{{ counts.active }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
        <p class="text-sm text-[#64748b] mb-1">Приостановленных</p>
        <p class="text-2xl font-bold text-[#f59e0b]">{{ counts.suspended }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
        <p class="text-sm text-[#64748b] mb-1">Аннулированных</p>
        <p class="text-2xl font-bold text-[#ef4444]">{{ counts.revoked }}</p>
      </div>
    </div>

    <!-- Add Form -->
    <div v-if="showAddForm" class="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] p-6 mb-6">
      <h2 class="text-lg font-semibold text-[#1e293b] mb-6">Добавление переработчика</h2>
      <div class="space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-[#1e293b] mb-1">Наименование *</label>
            <input v-model="newRecycler.name" type="text" placeholder="ОсОО «Название»" class="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb] text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-[#1e293b] mb-1">ИНН *</label>
            <input v-model="newRecycler.inn" type="text" placeholder="01234567890123" class="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb] text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-[#1e293b] mb-1">Номер лицензии</label>
            <input v-model="newRecycler.licenseNumber" type="text" placeholder="ЛИЦ-2024-XXX" class="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb] text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-[#1e293b] mb-1">Дата выдачи лицензии</label>
            <input v-model="newRecycler.licenseDate" type="text" placeholder="01.01.2024" class="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb] text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-[#1e293b] mb-1">Срок действия лицензии</label>
            <input v-model="newRecycler.licenseExpiry" type="text" placeholder="01.01.2029" class="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb] text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-[#1e293b] mb-1">Статус</label>
            <div class="flex items-center gap-4 mt-2">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" v-model="newRecycler.status" value="active" class="text-[#10b981]" />
                <span class="text-sm text-[#1e293b]">Активен</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" v-model="newRecycler.status" value="suspended" class="text-[#f59e0b]" />
                <span class="text-sm text-[#1e293b]">Приостановлен</span>
              </label>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div class="sm:col-span-2 lg:col-span-1">
            <label class="block text-sm font-medium text-[#1e293b] mb-1">Юридический адрес</label>
            <input v-model="newRecycler.address" type="text" placeholder="г. Бишкек, ул. ..." class="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb] text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-[#1e293b] mb-1">Телефон</label>
            <input v-model="newRecycler.contactPhone" type="text" placeholder="+996 555 ..." class="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb] text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-[#1e293b] mb-1">Email</label>
            <input v-model="newRecycler.contactEmail" type="text" placeholder="info@company.kg" class="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb] text-sm" />
          </div>
        </div>

        <!-- Waste Types multiselect -->
        <div>
          <label class="block text-sm font-medium text-[#1e293b] mb-2">Виды отходов</label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="group in productGroups"
              :key="group.value"
              @click="toggleWasteType(group.value)"
              :class="[
                'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                newRecycler.wasteTypes.includes(group.value)
                  ? 'bg-[#2563eb] text-white border-[#2563eb]'
                  : 'bg-white text-[#64748b] border-[#e2e8f0] hover:border-[#2563eb]'
              ]"
            >
              {{ group.label }}
            </button>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-3 pt-4 border-t border-[#e2e8f0]">
          <button
            @click="saveRecycler"
            :disabled="!newRecycler.name || !newRecycler.inn"
            class="flex items-center gap-2 bg-[#10b981] text-white px-5 py-2.5 rounded-lg font-medium hover:bg-[#059669] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            Сохранить
          </button>
          <button
            @click="cancelForm"
            class="px-5 py-2.5 border border-[#e2e8f0] rounded-lg text-[#64748b] hover:bg-[#f8fafc] transition-colors"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-2xl p-4 shadow-sm border border-[#e2e8f0] mb-6">
      <div class="flex flex-wrap gap-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Поиск по названию или ИНН..."
          class="flex-1 min-w-[200px] px-4 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb]"
        />
        <select v-model="filterStatus" class="px-4 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb]">
          <option value="">Все статусы</option>
          <option value="active">Активен</option>
          <option value="suspended">Приостановлен</option>
          <option value="revoked">Аннулирован</option>
        </select>
        <select v-model="filterWasteType" class="px-4 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb]">
          <option value="">Все виды отходов</option>
          <option v-for="group in productGroups" :key="group.value" :value="group.value">
            {{ group.label }}
          </option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-[#64748b] bg-[#f8fafc] border-b border-[#e2e8f0]">
              <th class="px-4 py-3 font-medium">Наименование</th>
              <th class="px-4 py-3 font-medium">ИНН</th>
              <th class="px-4 py-3 font-medium">Лицензия</th>
              <th class="px-4 py-3 font-medium">Виды отходов</th>
              <th class="px-4 py-3 font-medium">Статус</th>
              <th class="px-4 py-3 font-medium">Дата добавления</th>
              <th class="px-4 py-3 font-medium text-right">Действия</th>
            </tr>
          </thead>
          <tbody class="text-[#1e293b]">
            <tr v-for="recycler in filteredRecyclers" :key="recycler.id" class="border-t border-[#e2e8f0] hover:bg-[#f8fafc]">
              <td class="px-4 py-3">
                <div>
                  <p class="font-medium">{{ recycler.name }}</p>
                  <p class="text-xs text-[#64748b] mt-0.5">{{ recycler.address }}</p>
                </div>
              </td>
              <td class="px-4 py-3 font-mono text-xs">{{ recycler.inn }}</td>
              <td class="px-4 py-3">
                <p class="font-mono text-xs">{{ recycler.licenseNumber }}</p>
                <p class="text-xs text-[#64748b]">до {{ recycler.licenseExpiry }}</p>
              </td>
              <td class="px-4 py-3">
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="wt in recycler.wasteTypes.slice(0, 3)"
                    :key="wt"
                    class="inline-block px-2 py-0.5 bg-[#f1f5f9] text-[#64748b] rounded text-xs"
                    :title="getGroupLabel(wt)"
                  >
                    {{ getGroupShortLabel(wt) }}
                  </span>
                  <span
                    v-if="recycler.wasteTypes.length > 3"
                    class="inline-block px-2 py-0.5 bg-[#e2e8f0] text-[#64748b] rounded text-xs"
                    :title="recycler.wasteTypes.slice(3).map(getGroupLabel).join(', ')"
                  >
                    +{{ recycler.wasteTypes.length - 3 }}
                  </span>
                </div>
              </td>
              <td class="px-4 py-3">
                <span :class="['px-3 py-1 rounded-full text-xs font-medium', getStatusClass(recycler.status)]">
                  {{ getStatusLabel(recycler.status) }}
                </span>
              </td>
              <td class="px-4 py-3 text-xs text-[#64748b]">{{ recycler.addedDate }}</td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-end gap-2">
                  <button
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#3B82F6] text-white hover:bg-[#2563EB] transition-colors shadow-sm"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Редактировать
                  </button>
                  <button
                    v-if="recycler.status !== 'revoked'"
                    @click="handleToggleStatus(recycler)"
                    :class="[
                      'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-white transition-colors shadow-sm',
                      recycler.status === 'active'
                        ? 'bg-[#F59E0B] hover:bg-[#D97706]'
                        : 'bg-[#10B981] hover:bg-[#059669]'
                    ]"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path v-if="recycler.status === 'active'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    </svg>
                    {{ recycler.status === 'active' ? 'Приостановить' : 'Активировать' }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="filteredRecyclers.length === 0">
        <EmptyState
          v-if="isFiltersActive && recyclerStore.state.recyclers.length > 0"
          icon='<svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>'
          title="Ничего не найдено"
          description="Попробуйте изменить параметры поиска"
          actionLabel="Сбросить фильтры"
          @action="resetAllFilters"
        />
        <EmptyState
          v-else
          icon='<svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>'
          title="Реестр пуст"
          description="Добавьте первого переработчика"
          actionLabel="+ Добавить"
          @action="showAddForm = true"
        />
      </div>
    </div>
  </DashboardLayout>
</template>
