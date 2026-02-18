<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import { useEmployeeMenu } from '../../composables/useRoleMenu'
import MapCoordinatePicker from '../../components/MapCoordinatePicker.vue'
import {
  collectionPointStore,
  type CollectionPoint,
  type CollectionPointStatus,
} from '../../stores/collectionPoints'

const { t } = useI18n()
const { roleTitle, menuItems } = useEmployeeMenu()

const searchQuery = ref('')
const filterRegion = ref('')
const filterStatus = ref('')
const filterWasteType = ref('')
const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref<number | null>(null)
const showDeleteConfirm = ref(false)
const deleteTargetId = ref<number | null>(null)
const pickerVisible = ref(false)

const regions = ['г. Бишкек', 'г. Ош', 'Чуйская область', 'Ошская область', 'Джалал-Абадская область', 'Иссык-Кульская область', 'Нарынская область', 'Таласская область', 'Баткенская область']
const wasteTypeOptions = ['Пластик', 'Бумага', 'Картон', 'Стекло', 'Металл', 'Алюминий', 'Электроника', 'Батарейки', 'Текстиль']

const form = ref({
  name: '',
  region: '',
  district: '',
  address: '',
  lat: 0,
  lng: 0,
  wasteTypes: [] as string[],
  workingHours: '',
  phone: '',
  email: '',
  organization: '',
  status: 'active' as CollectionPointStatus,
  notes: '',
})

const resetForm = () => {
  form.value = { name: '', region: '', district: '', address: '', lat: 0, lng: 0, wasteTypes: [], workingHours: '', phone: '', email: '', organization: '', status: 'active', notes: '' }
}

const filteredPoints = computed(() => {
  let result = collectionPointStore.state.points
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(p => p.name.toLowerCase().includes(q) || p.region.toLowerCase().includes(q) || p.address.toLowerCase().includes(q))
  }
  if (filterRegion.value) result = result.filter(p => p.region === filterRegion.value)
  if (filterStatus.value) result = result.filter(p => p.status === filterStatus.value)
  if (filterWasteType.value) result = result.filter(p => p.wasteTypes.includes(filterWasteType.value))
  return result
})

const totalCount = computed(() => collectionPointStore.state.points.length)
const activeCount = computed(() => collectionPointStore.state.points.filter(p => p.status === 'active').length)
const pausedCount = computed(() => collectionPointStore.state.points.filter(p => p.status === 'paused').length)
const closedCount = computed(() => collectionPointStore.state.points.filter(p => p.status === 'closed').length)

const getStatusLabel = (status: CollectionPointStatus) => {
  switch (status) {
    case 'active': return 'Активен'
    case 'paused': return 'Приостановлен'
    case 'closed': return 'Закрыт'
  }
}

const getStatusClass = (status: CollectionPointStatus) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800'
    case 'paused': return 'bg-yellow-100 text-yellow-800'
    case 'closed': return 'bg-gray-100 text-gray-800'
  }
}

const toggleWasteType = (wt: string) => {
  const idx = form.value.wasteTypes.indexOf(wt)
  if (idx >= 0) form.value.wasteTypes.splice(idx, 1)
  else form.value.wasteTypes.push(wt)
}

const openAdd = () => {
  isEditing.value = false
  editingId.value = null
  resetForm()
  showModal.value = true
}

const openEdit = (point: CollectionPoint) => {
  isEditing.value = true
  editingId.value = point.id
  form.value = {
    name: point.name,
    region: point.region,
    district: point.district,
    address: point.address,
    lat: point.lat,
    lng: point.lng,
    wasteTypes: [...point.wasteTypes],
    workingHours: point.workingHours,
    phone: point.phone,
    email: point.email,
    organization: point.organization,
    status: point.status,
    notes: point.notes,
  }
  showModal.value = true
}

const savePoint = () => {
  if (!form.value.name.trim()) return
  if (isEditing.value && editingId.value !== null) {
    collectionPointStore.updatePoint(editingId.value, { ...form.value })
  } else {
    collectionPointStore.addPoint({ ...form.value })
  }
  showModal.value = false
  resetForm()
}

const confirmDelete = (id: number) => {
  deleteTargetId.value = id
  showDeleteConfirm.value = true
}

const doDelete = () => {
  if (deleteTargetId.value !== null) {
    collectionPointStore.deletePoint(deleteTargetId.value)
  }
  showDeleteConfirm.value = false
  deleteTargetId.value = null
}

const cancelModal = () => {
  showModal.value = false
  resetForm()
}

const isFiltersActive = computed(() => !!(searchQuery.value || filterRegion.value || filterStatus.value || filterWasteType.value))
const resetAllFilters = () => { searchQuery.value = ''; filterRegion.value = ''; filterStatus.value = ''; filterWasteType.value = '' }

const onPickerConfirm = (coords: { lat: number; lng: number }) => {
  form.value.lat = coords.lat
  form.value.lng = coords.lng
}
</script>

<template>
  <DashboardLayout role="employee" :roleTitle="roleTitle" userName="Мамытова Айгуль" :menuItems="menuItems">
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b] mb-1">Реестр пунктов приёма вторсырья</h1>
          <p class="text-[#64748b] text-sm">Управление пунктами приёма вторичного сырья</p>
        </div>
        <button @click="openAdd" class="inline-flex items-center gap-2 px-4 py-2 bg-[#10b981] text-white text-sm font-medium rounded-lg hover:bg-[#059669] transition-colors">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
          Добавить
        </button>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <svg class="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            <div><p class="text-sm text-[#64748b]">Всего</p><p class="text-2xl font-bold text-[#1e293b]">{{ totalCount }}</p></div>
          </div>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <svg class="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div><p class="text-sm text-[#64748b]">Активных</p><p class="text-2xl font-bold text-[#10b981]">{{ activeCount }}</p></div>
          </div>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center">
              <svg class="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div><p class="text-sm text-[#64748b]">Приостановлено</p><p class="text-2xl font-bold text-[#f59e0b]">{{ pausedCount }}</p></div>
          </div>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <svg class="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
            </div>
            <div><p class="text-sm text-[#64748b]">Закрыто</p><p class="text-2xl font-bold text-[#64748b]">{{ closedCount }}</p></div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
        <div class="flex flex-wrap gap-3">
          <div class="relative flex-1 min-w-[200px]">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input v-model="searchQuery" type="text" placeholder="Поиск по названию, региону..." class="w-full pl-9 pr-4 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb] text-sm" />
          </div>
          <select v-model="filterRegion" class="px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb] text-sm bg-white">
            <option value="">Все регионы</option>
            <option v-for="r in regions" :key="r" :value="r">{{ r }}</option>
          </select>
          <select v-model="filterStatus" class="px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb] text-sm bg-white">
            <option value="">Все статусы</option>
            <option value="active">Активен</option>
            <option value="paused">Приостановлен</option>
            <option value="closed">Закрыт</option>
          </select>
          <select v-model="filterWasteType" class="px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb] text-sm bg-white">
            <option value="">Все виды отходов</option>
            <option v-for="wt in wasteTypeOptions" :key="wt" :value="wt">{{ wt }}</option>
          </select>
          <button v-if="isFiltersActive" @click="resetAllFilters" class="px-3 py-2 text-sm text-[#ef4444] hover:bg-red-50 rounded-lg transition-colors">Сбросить</button>
        </div>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-xl shadow-sm border border-[#e2e8f0] overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-[#64748b] bg-[#f8fafc] border-b border-[#e2e8f0]">
                <th class="px-4 py-3 font-medium">№</th>
                <th class="px-4 py-3 font-medium">Название</th>
                <th class="px-4 py-3 font-medium">Регион</th>
                <th class="px-4 py-3 font-medium">Адрес</th>
                <th class="px-4 py-3 font-medium">Виды отходов</th>
                <th class="px-4 py-3 font-medium">Режим работы</th>
                <th class="px-4 py-3 font-medium">Телефон</th>
                <th class="px-4 py-3 font-medium">Статус</th>
                <th class="px-4 py-3 font-medium text-right">Действия</th>
              </tr>
            </thead>
            <tbody class="text-[#1e293b]">
              <tr v-for="(point, idx) in filteredPoints" :key="point.id" class="border-t border-[#e2e8f0] hover:bg-[#f8fafc]">
                <td class="px-4 py-3 text-[#64748b]">{{ idx + 1 }}</td>
                <td class="px-4 py-3 font-medium">{{ point.name }}</td>
                <td class="px-4 py-3 text-[#64748b]">{{ point.region }}</td>
                <td class="px-4 py-3 text-[#64748b]">{{ point.address }}</td>
                <td class="px-4 py-3">
                  <div class="flex flex-wrap gap-1">
                    <span v-for="wt in point.wasteTypes.slice(0, 3)" :key="wt" class="inline-block px-2 py-0.5 bg-[#f1f5f9] text-[#64748b] rounded text-xs">{{ wt }}</span>
                    <span v-if="point.wasteTypes.length > 3" class="inline-block px-2 py-0.5 bg-[#e2e8f0] text-[#64748b] rounded text-xs">+{{ point.wasteTypes.length - 3 }}</span>
                  </div>
                </td>
                <td class="px-4 py-3 text-[#64748b]">{{ point.workingHours }}</td>
                <td class="px-4 py-3 text-[#64748b]">{{ point.phone }}</td>
                <td class="px-4 py-3">
                  <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', getStatusClass(point.status)]">{{ getStatusLabel(point.status) }}</span>
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center justify-end gap-1">
                    <button @click="openEdit(point)" class="p-1.5 text-[#64748b] hover:text-[#f59e0b] hover:bg-yellow-50 rounded-lg transition-colors" title="Редактировать">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                    <button @click="confirmDelete(point.id)" class="p-1.5 text-[#64748b] hover:text-[#ef4444] hover:bg-red-50 rounded-lg transition-colors" title="Удалить">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="filteredPoints.length === 0" class="text-center py-12 text-gray-500">
          <p class="text-lg font-medium">Нет пунктов приёма</p>
          <p class="text-sm mt-1">Нет данных, соответствующих выбранным фильтрам</p>
          <button v-if="isFiltersActive" @click="resetAllFilters" class="mt-4 px-4 py-2 text-sm text-[#2563eb] hover:bg-blue-50 rounded-lg transition-colors">Сбросить фильтры</button>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="cancelModal">
        <div class="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div class="px-6 py-4 border-b border-[#e2e8f0] flex items-center justify-between">
            <h3 class="text-lg font-semibold text-[#1e293b]">{{ isEditing ? 'Редактировать пункт приёма' : 'Добавить пункт приёма' }}</h3>
            <button @click="cancelModal" class="text-[#94a3b8] hover:text-[#64748b] transition-colors">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div class="p-6 space-y-5">
            <div>
              <label class="block text-sm font-medium text-[#1e293b] mb-1">Название <span class="text-red-500">*</span></label>
              <input v-model="form.name" type="text" placeholder="Пункт приёма «Название»" class="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb] text-sm" />
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-[#1e293b] mb-1">Регион</label>
                <select v-model="form.region" class="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb] text-sm bg-white">
                  <option value="">Выберите регион</option>
                  <option v-for="r in regions" :key="r" :value="r">{{ r }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-[#1e293b] mb-1">Район</label>
                <input v-model="form.district" type="text" placeholder="Район / город" class="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb] text-sm" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-[#1e293b] mb-1">Адрес</label>
              <input v-model="form.address" type="text" placeholder="ул. Пример, 123" class="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb] text-sm" />
            </div>
            <!-- Coordinates -->
            <div>
              <label class="block text-sm font-medium text-[#1e293b] mb-1">Координаты</label>
              <div class="flex items-end gap-3">
                <div class="flex-1 grid grid-cols-2 gap-3">
                  <input v-model.number="form.lat" type="number" step="0.0001" placeholder="Широта" class="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb] text-sm" />
                  <input v-model.number="form.lng" type="number" step="0.0001" placeholder="Долгота" class="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb] text-sm" />
                </div>
                <button @click="pickerVisible = true" type="button" class="px-3 py-2 text-sm font-medium text-[#2563eb] border border-[#2563eb] rounded-lg hover:bg-blue-50 transition-colors whitespace-nowrap">
                  Указать на карте
                </button>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-[#1e293b] mb-1">Организация</label>
              <input v-model="form.organization" type="text" placeholder="ОсОО «Название»" class="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb] text-sm" />
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-[#1e293b] mb-1">Режим работы</label>
                <input v-model="form.workingHours" type="text" placeholder="09:00-18:00" class="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb] text-sm" />
              </div>
              <div>
                <label class="block text-sm font-medium text-[#1e293b] mb-1">Телефон</label>
                <input v-model="form.phone" type="text" placeholder="+996 555 ..." class="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb] text-sm" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-[#1e293b] mb-1">Email</label>
              <input v-model="form.email" type="email" placeholder="info@example.kg" class="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb] text-sm" />
            </div>
            <!-- Waste Types -->
            <div>
              <label class="block text-sm font-medium text-[#1e293b] mb-2">Виды отходов</label>
              <div class="flex flex-wrap gap-2">
                <button v-for="wt in wasteTypeOptions" :key="wt" @click="toggleWasteType(wt)" :class="['px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors', form.wasteTypes.includes(wt) ? 'bg-[#2563eb] text-white border-[#2563eb]' : 'bg-white text-[#64748b] border-[#e2e8f0] hover:border-[#2563eb]']" type="button">{{ wt }}</button>
              </div>
            </div>
            <!-- Status -->
            <div>
              <label class="block text-sm font-medium text-[#1e293b] mb-2">Статус</label>
              <div class="flex items-center gap-4">
                <label class="flex items-center gap-2 cursor-pointer"><input type="radio" v-model="form.status" value="active" class="text-green-600" /><span class="text-sm">Активен</span></label>
                <label class="flex items-center gap-2 cursor-pointer"><input type="radio" v-model="form.status" value="paused" class="text-yellow-600" /><span class="text-sm">Приостановлен</span></label>
                <label class="flex items-center gap-2 cursor-pointer"><input type="radio" v-model="form.status" value="closed" class="text-gray-600" /><span class="text-sm">Закрыт</span></label>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-[#1e293b] mb-1">Примечания</label>
              <textarea v-model="form.notes" rows="2" class="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb] text-sm"></textarea>
            </div>
          </div>
          <div class="px-6 py-4 border-t border-[#e2e8f0] flex items-center justify-end gap-3">
            <button @click="cancelModal" class="px-4 py-2 text-sm font-medium text-[#64748b] bg-white border border-[#e2e8f0] rounded-lg hover:bg-[#f8fafc] transition-colors">Отмена</button>
            <button @click="savePoint" :disabled="!form.name.trim()" :class="['px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors', form.name.trim() ? 'bg-[#2563eb] hover:bg-[#1d4ed8]' : 'bg-[#94a3b8] cursor-not-allowed']">{{ isEditing ? 'Сохранить' : 'Добавить' }}</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Delete Confirm -->
    <Teleport to="body">
      <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 text-center">
          <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">Удалить запись?</h3>
          <p class="text-gray-600 mb-6">Вы уверены? Это действие нельзя отменить.</p>
          <div class="flex gap-3 justify-center">
            <button @click="showDeleteConfirm = false" class="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">Отмена</button>
            <button @click="doDelete" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium">Удалить</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Map Picker -->
    <MapCoordinatePicker
      :modelValue="form.lat && form.lng ? { lat: form.lat, lng: form.lng } : null"
      :visible="pickerVisible"
      @update:modelValue="onPickerConfirm"
      @update:visible="pickerVisible = $event"
    />
  </DashboardLayout>
</template>
