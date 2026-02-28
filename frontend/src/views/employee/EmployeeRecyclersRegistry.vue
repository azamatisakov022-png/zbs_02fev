<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import MapCoordinatePicker from '../../components/MapCoordinatePicker.vue'
import EmptyState from '../../components/dashboard/EmptyState.vue'
import { recyclerStore, type Recycler, type RecyclerStatus, type RecyclerCapacity } from '../../stores/recyclers'
import { productGroups } from '../../data/product-groups'
import { AppButton, AppBadge } from '../../components/ui'
import { getStatusBadgeVariant } from '../../utils/statusVariant'
import { useEmployeeMenu } from '../../composables/useRoleMenu'
import { toastStore } from '../../stores/toast'

const { roleTitle, menuItems } = useEmployeeMenu()
const { t } = useI18n()

// View state
const showAddForm = ref(false)
const searchQuery = ref('')
const filterStatus = ref('')
const filterWasteType = ref('')
const isEditing = ref(false)
const editingRecyclerId = ref<number | null>(null)
const showCoordPicker = ref(false)
const pickerCoords = ref<{ lat: number; lng: number } | null>(null)

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
  const map: Record<string, string> = { active: 'status.active', suspended: 'status.suspended', revoked: 'status.revoked' }
  return map[status] || status
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
  // Return just the number and short name
  const match = label.match(/^(\d+)\.\s*(.+)$/)
  if (match) {
    const name = match[2]
    return name.length > 25 ? name.substring(0, 25) + '...' : name
  }
  return label
}

// Capacity helpers
const getTotalCapacity = (recycler: Recycler) => recyclerStore.getTotalCapacity(recycler)
const getTotalLoad = (recycler: Recycler) => recyclerStore.getTotalLoad(recycler)
const getLoadPercent = (recycler: Recycler) => recyclerStore.getLoadPercent(recycler)

const getLoadColor = (percent: number): string => {
  if (percent >= 90) return '#EF4444'
  if (percent >= 70) return '#F59E0B'
  return '#10B981'
}

const totalCapacityAll = computed(() => {
  return recyclerStore.state.recyclers
    .filter(r => r.status === 'active')
    .reduce((sum, r) => sum + recyclerStore.getTotalCapacity(r), 0)
})

const getCapacityValue = (wasteType: string, field: 'capacityTons' | 'currentLoadTons'): number => {
  const cap = newRecycler.value.capacities?.find(c => c.wasteType === wasteType)
  return cap ? cap[field] : 0
}

const setCapacityValue = (wasteType: string, field: 'capacityTons' | 'currentLoadTons', value: string) => {
  if (!newRecycler.value.capacities) newRecycler.value.capacities = []
  const idx = newRecycler.value.capacities.findIndex(c => c.wasteType === wasteType)
  const numVal = parseFloat(value) || 0
  if (idx >= 0) {
    newRecycler.value.capacities[idx][field] = numVal
  } else {
    newRecycler.value.capacities.push({ wasteType, capacityTons: 0, currentLoadTons: 0, [field]: numVal })
  }
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
  capacities: [] as { wasteType: string, capacityTons: number, currentLoadTons: number }[],
  address: '',
  contactPhone: '',
  contactEmail: '',
  status: 'active' as RecyclerStatus,
  coordinates: null as { lat: number; lng: number } | null,
})

const resetForm = () => {
  newRecycler.value = {
    name: '',
    inn: '',
    licenseNumber: '',
    licenseDate: '',
    licenseExpiry: '',
    wasteTypes: [],
    capacities: [],
    address: '',
    contactPhone: '',
    contactEmail: '',
    status: 'active',
    coordinates: null,
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
  const dateStr = today.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' })
  recyclerStore.addRecycler({
    ...newRecycler.value,
    addedDate: dateStr,
    addedBy: 'Мамытова А.',
  })
  resetForm()
  showAddForm.value = false
}

const cancelForm = () => {
  resetForm()
  showAddForm.value = false
}

const openEditModal = (recycler: Recycler) => {
  isEditing.value = true
  editingRecyclerId.value = recycler.id
  newRecycler.value = {
    name: recycler.name,
    inn: recycler.inn,
    licenseNumber: recycler.licenseNumber,
    licenseDate: recycler.licenseDate,
    licenseExpiry: recycler.licenseExpiry,
    wasteTypes: [...recycler.wasteTypes],
    capacities: recycler.capacities ? recycler.capacities.map(c => ({ ...c })) : [],
    address: recycler.address,
    contactPhone: recycler.contactPhone,
    contactEmail: recycler.contactEmail,
    status: recycler.status,
    coordinates: recycler.coordinates ? { ...recycler.coordinates } : null,
  }
  showAddForm.value = true
}

const saveEdit = () => {
  if (!editingRecyclerId.value || !newRecycler.value.name || !newRecycler.value.inn) return
  recyclerStore.updateRecycler(editingRecyclerId.value, {
    ...newRecycler.value,
  })
  toastStore.show({ type: 'success', title: t('common.success'), message: t('employeeRecyclers.recyclerUpdated') })
  resetForm()
  showAddForm.value = false
  isEditing.value = false
  editingRecyclerId.value = null
}

const cancelEditForm = () => {
  resetForm()
  showAddForm.value = false
  isEditing.value = false
  editingRecyclerId.value = null
}

const onPickerConfirm = (coords: { lat: number; lng: number }) => {
  newRecycler.value.coordinates = coords
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
    role="employee"
    :roleTitle="roleTitle"
    userName="Мамытова Айгуль"
    :menuItems="menuItems"
  >
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div>
        <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b] mb-2">{{ $t('employeeRecyclers.title') }}</h1>
        <p class="text-[#64748b]">{{ $t('employeeRecyclers.subtitle') }}</p>
      </div>
      <AppButton variant="primary" @click="showAddForm = true">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        {{ $t('common.add') }}
      </AppButton>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
        <p class="text-sm text-[#64748b] mb-1">{{ $t('common.total') }}</p>
        <p class="text-2xl font-bold text-[#1e293b]">{{ counts.all }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
        <p class="text-sm text-[#64748b] mb-1">{{ $t('employeeRecyclers.statActive') }}</p>
        <p class="text-2xl font-bold text-[#10b981]">{{ counts.active }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
        <p class="text-sm text-[#64748b] mb-1">{{ $t('employeeRecyclers.statSuspended') }}</p>
        <p class="text-2xl font-bold text-[#f59e0b]">{{ counts.suspended }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
        <p class="text-sm text-[#64748b] mb-1">{{ $t('employeeRecyclers.statRevoked') }}</p>
        <p class="text-2xl font-bold text-[#ef4444]">{{ counts.revoked }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
        <p class="text-sm text-[#64748b] mb-1">{{ $t('employeeRecyclers.totalCapacity') }}</p>
        <p class="text-2xl font-bold text-[#2563eb]">{{ totalCapacityAll }} {{ $t('employeeRecyclers.tonsPerYear') }}</p>
      </div>
    </div>

    <!-- Add Form -->
    <div v-if="showAddForm" class="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] p-6 mb-6">
      <h2 class="text-lg font-semibold text-[#1e293b] mb-6">{{ isEditing ? $t('employeeRecyclers.editRecycler') : $t('employeeRecyclers.addRecycler') }}</h2>
      <div class="space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-[#1e293b] mb-1">{{ $t('employeeRecyclers.name') }} *</label>
            <input v-model="newRecycler.name" type="text" :placeholder="$t('employeeRecyclers.namePlaceholder')" class="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb] text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-[#1e293b] mb-1">{{ $t('employeeRecyclers.inn') }} *</label>
            <input v-model="newRecycler.inn" type="text" placeholder="01234567890123" class="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb] text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-[#1e293b] mb-1">{{ $t('employeeRecyclers.licenseNumber') }}</label>
            <input v-model="newRecycler.licenseNumber" type="text" :placeholder="$t('employeeRecyclers.licenseNumPlaceholder')" class="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb] text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-[#1e293b] mb-1">{{ $t('employeeRecyclers.licenseDate') }}</label>
            <input v-model="newRecycler.licenseDate" type="text" placeholder="01.01.2024" class="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb] text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-[#1e293b] mb-1">{{ $t('employeeRecyclers.licenseExpiry') }}</label>
            <input v-model="newRecycler.licenseExpiry" type="text" placeholder="01.01.2029" class="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb] text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-[#1e293b] mb-1">{{ $t('common.status') }}</label>
            <div class="flex items-center gap-4 mt-2">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" v-model="newRecycler.status" value="active" class="text-[#10b981]" />
                <span class="text-sm text-[#1e293b]">{{ $t('status.active') }}</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" v-model="newRecycler.status" value="suspended" class="text-[#f59e0b]" />
                <span class="text-sm text-[#1e293b]">{{ $t('status.suspended') }}</span>
              </label>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div class="sm:col-span-2 lg:col-span-1">
            <label class="block text-sm font-medium text-[#1e293b] mb-1">{{ $t('employeeRecyclers.legalAddress') }}</label>
            <input v-model="newRecycler.address" type="text" :placeholder="$t('employeeRecyclers.addressPlaceholder')" class="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb] text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-[#1e293b] mb-1">{{ $t('employeeRecyclers.phone') }}</label>
            <input v-model="newRecycler.contactPhone" type="text" placeholder="+996 555 ..." class="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb] text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-[#1e293b] mb-1">{{ $t('employeeRecyclers.email') }}</label>
            <input v-model="newRecycler.contactEmail" type="text" placeholder="info@company.kg" class="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb] text-sm" />
          </div>
        </div>

        <!-- Coordinates -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-[#1e293b] mb-1">{{ $t('employeeRecyclers.latitude') }}</label>
            <input :value="newRecycler.coordinates?.lat || ''" @input="(e: Event) => { const v = parseFloat((e.target as HTMLInputElement).value); if (!isNaN(v)) { if (!newRecycler.coordinates) newRecycler.coordinates = { lat: 0, lng: 0 }; newRecycler.coordinates.lat = v } }" type="number" step="0.0001" placeholder="42.8746" class="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb] text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-[#1e293b] mb-1">{{ $t('employeeRecyclers.longitude') }}</label>
            <input :value="newRecycler.coordinates?.lng || ''" @input="(e: Event) => { const v = parseFloat((e.target as HTMLInputElement).value); if (!isNaN(v)) { if (!newRecycler.coordinates) newRecycler.coordinates = { lat: 0, lng: 0 }; newRecycler.coordinates.lng = v } }" type="number" step="0.0001" placeholder="74.5698" class="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb] text-sm" />
          </div>
          <div class="flex items-end">
            <button type="button" @click="pickerCoords = newRecycler.coordinates; showCoordPicker = true" class="px-4 py-2 text-sm font-medium text-[#2563eb] border border-[#2563eb] rounded-lg hover:bg-[#2563eb]/5 transition-colors flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              {{ $t('employeeRecyclers.pickOnMap') }}
            </button>
          </div>
        </div>

        <!-- Waste Types multiselect -->
        <div>
          <label class="block text-sm font-medium text-[#1e293b] mb-2">{{ $t('employeeRecyclers.wasteTypes') }}</label>
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

        <!-- Capacities -->
        <div v-if="newRecycler.wasteTypes.length > 0">
          <label class="block text-sm font-medium text-[#1e293b] mb-2">{{ $t('employeeRecyclers.capacitiesLabel') }}</label>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div v-for="wt in newRecycler.wasteTypes" :key="'cap-' + wt" class="bg-[#f8fafc] rounded-lg p-3">
              <p class="text-xs font-medium text-[#1e293b] mb-2">{{ getGroupShortLabel(wt) }}</p>
              <div class="flex gap-2">
                <div class="flex-1">
                  <label class="block text-[10px] text-[#94a3b8] mb-0.5">{{ $t('employeeRecyclers.capacity') }}</label>
                  <input
                    type="number"
                    min="0"
                    :value="getCapacityValue(wt, 'capacityTons')"
                    @input="setCapacityValue(wt, 'capacityTons', ($event.target as HTMLInputElement).value)"
                    placeholder="0"
                    class="w-full px-2 py-1.5 border border-[#e2e8f0] rounded text-xs focus:outline-none focus:border-[#2563eb]"
                  />
                </div>
                <div class="flex-1">
                  <label class="block text-[10px] text-[#94a3b8] mb-0.5">{{ $t('employeeRecyclers.currentLoad') }}</label>
                  <input
                    type="number"
                    min="0"
                    :value="getCapacityValue(wt, 'currentLoadTons')"
                    @input="setCapacityValue(wt, 'currentLoadTons', ($event.target as HTMLInputElement).value)"
                    placeholder="0"
                    class="w-full px-2 py-1.5 border border-[#e2e8f0] rounded text-xs focus:outline-none focus:border-[#2563eb]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-3 pt-4 border-t border-[#e2e8f0]">
          <AppButton variant="primary" @click="isEditing ? saveEdit() : saveRecycler()" :disabled="!newRecycler.name || !newRecycler.inn">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            {{ $t('common.save') }}
          </AppButton>
          <AppButton variant="secondary" @click="isEditing ? cancelEditForm() : cancelForm()">
            {{ $t('common.cancel') }}
          </AppButton>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-2xl p-4 shadow-sm border border-[#e2e8f0] mb-6">
      <div class="flex flex-wrap gap-4">
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="$t('common.search')"
          class="flex-1 min-w-[200px] px-4 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb]"
        />
        <select v-model="filterStatus" class="px-4 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb]">
          <option value="">{{ $t('employeeRecyclers.allStatuses') }}</option>
          <option value="active">{{ $t('status.active') }}</option>
          <option value="suspended">{{ $t('status.suspended') }}</option>
          <option value="revoked">{{ $t('status.revoked') }}</option>
        </select>
        <select v-model="filterWasteType" class="px-4 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb]">
          <option value="">{{ $t('employeeRecyclers.allWasteTypes') }}</option>
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
              <th class="px-4 py-3 font-medium">{{ $t('employeeRecyclers.thName') }}</th>
              <th class="px-4 py-3 font-medium">{{ $t('employeeRecyclers.inn') }}</th>
              <th class="px-4 py-3 font-medium">{{ $t('employeeRecyclers.thLicense') }}</th>
              <th class="px-4 py-3 font-medium">{{ $t('employeeRecyclers.wasteTypes') }}</th>
              <th class="px-4 py-3 font-medium">{{ $t('employeeRecyclers.capacity') }}</th>
              <th class="px-4 py-3 font-medium">{{ $t('common.status') }}</th>
              <th class="px-4 py-3 font-medium">{{ $t('common.date') }}</th>
              <th class="px-4 py-3 font-medium text-right">{{ $t('common.actions') }}</th>
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
                <p class="text-xs text-[#64748b]">{{ $t('employeeRecyclers.until') }} {{ recycler.licenseExpiry }}</p>
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
                <div class="min-w-[120px]">
                  <div class="flex items-center justify-between text-xs mb-1">
                    <span class="text-[#64748b]">{{ getTotalLoad(recycler) }} / {{ getTotalCapacity(recycler) }} т</span>
                    <span class="font-medium" :style="{ color: getLoadColor(getLoadPercent(recycler)) }">{{ getLoadPercent(recycler) }}%</span>
                  </div>
                  <div class="w-full h-1.5 bg-[#f1f5f9] rounded-full overflow-hidden">
                    <div
                      class="h-full rounded-full transition-all"
                      :style="{ width: Math.min(getLoadPercent(recycler), 100) + '%', backgroundColor: getLoadColor(getLoadPercent(recycler)) }"
                    ></div>
                  </div>
                  <p class="text-[10px] text-[#94a3b8] mt-0.5">{{ $t('employeeRecyclers.available') }}: {{ getTotalCapacity(recycler) - getTotalLoad(recycler) }} {{ $t('employeeRecyclers.tonsPerYear') }}</p>
                </div>
              </td>
              <td class="px-4 py-3">
                <AppBadge :variant="getStatusBadgeVariant(recycler.status)">
                  {{ $t('status.' + recycler.status) }}
                </AppBadge>
              </td>
              <td class="px-4 py-3 text-xs text-[#64748b]">{{ recycler.addedDate }}</td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-end gap-2">
                  <AppButton variant="ghost" size="sm" @click="openEditModal(recycler)">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    {{ $t('common.edit') }}
                  </AppButton>
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
                    {{ recycler.status === 'active' ? $t('employeeRecyclers.suspend') : $t('employeeRecyclers.activate') }}
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
          :title="$t('employeeRecyclers.nothingFound')"
          :description="$t('employeeRecyclers.tryChangeSearch')"
          :actionLabel="$t('common.reset')"
          @action="resetAllFilters"
        />
        <EmptyState
          v-else
          icon='<svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>'
          :title="$t('employeeRecyclers.registryEmpty')"
          :description="$t('employeeRecyclers.addFirstRecycler')"
          :actionLabel="'+ ' + $t('common.add')"
          @action="showAddForm = true"
        />
      </div>
    </div>

    <MapCoordinatePicker
      :visible="showCoordPicker"
      :modelValue="pickerCoords"
      @update:visible="showCoordPicker = $event"
      @update:modelValue="onPickerConfirm"
    />
  </DashboardLayout>
</template>
