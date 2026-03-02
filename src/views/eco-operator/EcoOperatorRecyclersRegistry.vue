<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import EmptyState from '../../components/dashboard/EmptyState.vue'
import { recyclerStore, type Recycler, type RecyclerStatus } from '../../stores/recyclers'
import { productGroups } from '../../data/product-groups'
import { generatedSubgroups } from '../../data/product-subgroups-generated'
import { AppButton, AppBadge } from '../../components/ui'
import { getStatusBadgeVariant } from '../../utils/statusVariant'
import { useEcoOperatorMenu } from '../../composables/useRoleMenu'
import SectionGuide from '../../components/common/SectionGuide.vue'

const { t } = useI18n()

const router = useRouter()
const { roleTitle, menuItems } = useEcoOperatorMenu()

// Navigate to recycler detail
const goToDetail = (recycler: Recycler) => {
  router.push('/eco-operator/recyclers/' + recycler.id)
}

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
    case 'active': return t('status.active')
    case 'suspended': return t('status.suspended')
    case 'revoked': return t('status.revoked')
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

// Capacity helpers
const getTotalCapacity = (recycler: Recycler) => recyclerStore.getTotalCapacity(recycler)
const getTotalLoad = (recycler: Recycler) => recyclerStore.getTotalLoad(recycler)
const getLoadPercent = (recycler: Recycler) => recyclerStore.getLoadPercent(recycler)

const getLoadColor = (percent: number): string => {
  if (percent >= 90) return '#EF4444'
  if (percent >= 70) return '#F59E0B'
  return '#10B981'
}

// Total capacity computed
const totalCapacityAll = computed(() => {
  return recyclerStore.state.recyclers
    .filter(r => r.status === 'active')
    .reduce((sum, r) => sum + recyclerStore.getTotalCapacity(r), 0)
})

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
})

// Capacity rows for the dynamic table
interface CapacityRow {
  id: number
  group: string
  subgroup: string
  technologies: string[]
  customTechnology: string
  capacityTons: number
  documentName: string
}

const technologyOptions = computed(() => [
  t('ecoRecyclersRegistry.techMechanical'),
  t('ecoRecyclersRegistry.techThermal'),
  t('ecoRecyclersRegistry.techExtrusion'),
  t('ecoRecyclersRegistry.techPressing'),
  t('ecoRecyclersRegistry.techDissolving'),
  t('ecoRecyclersRegistry.techChemical'),
  t('ecoRecyclersRegistry.techComposting'),
  t('ecoRecyclersRegistry.techPyrolysis'),
  t('ecoRecyclersRegistry.techShredding'),
  t('ecoRecyclersRegistry.techSorting'),
  t('ecoRecyclersRegistry.techGranulation'),
  t('ecoRecyclersRegistry.techOther'),
])

const capacityRows = ref<CapacityRow[]>([])
let nextRowId = 1
const capacityValidationError = ref('')

const addCapacityRow = () => {
  capacityRows.value.push({
    id: nextRowId++,
    group: '',
    subgroup: '',
    technologies: [],
    customTechnology: '',
    capacityTons: 0,
    documentName: '',
  })
  capacityValidationError.value = ''
}

const removeCapacityRow = (id: number) => {
  capacityRows.value = capacityRows.value.filter(r => r.id !== id)
}

const getSubgroups = (groupValue: string) => {
  return generatedSubgroups[groupValue] || []
}

const handleFileSelect = (row: CapacityRow, event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    row.documentName = input.files[0].name
  }
}

const openTechDropdown = ref<number | null>(null)

const toggleTech = (row: CapacityRow, tech: string) => {
  const idx = row.technologies.indexOf(tech)
  if (idx >= 0) {
    row.technologies.splice(idx, 1)
    if (tech === t('ecoRecyclersRegistry.techOther')) row.customTechnology = ''
  } else {
    row.technologies.push(tech)
  }
}

const removeTech = (row: CapacityRow, tech: string) => {
  const idx = row.technologies.indexOf(tech)
  if (idx >= 0) {
    row.technologies.splice(idx, 1)
    if (tech === t('ecoRecyclersRegistry.techOther')) row.customTechnology = ''
  }
}

const getDisplayTechs = (row: CapacityRow): string[] => {
  return row.technologies.filter(tech => tech !== t('ecoRecyclersRegistry.techOther')).slice(0, 2)
}

const getExtraCount = (row: CapacityRow): number => {
  const visible = row.technologies.filter(tech => tech !== t('ecoRecyclersRegistry.techOther'))
  return Math.max(0, visible.length - 2)
}

const totalCapacity = computed(() => {
  return capacityRows.value.reduce((sum, row) => sum + (row.capacityTons || 0), 0)
})

const isCapacityValid = computed(() => {
  if (capacityRows.value.length === 0) return false
  return capacityRows.value.some(row => row.group && row.capacityTons > 0)
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
  }
  capacityRows.value = []
  nextRowId = 1
  capacityValidationError.value = ''
}

const saveRecycler = () => {
  if (!newRecycler.value.name || !newRecycler.value.inn) return

  // Validate capacity rows
  if (capacityRows.value.length === 0) {
    capacityValidationError.value = t('ecoRecyclersRegistry.validationAddCapacity')
    return
  }
  const validRows = capacityRows.value.filter(r => r.group && r.capacityTons > 0)
  if (validRows.length === 0) {
    capacityValidationError.value = t('ecoRecyclersRegistry.validationFillCapacity')
    return
  }

  // Build wasteTypes from unique groups
  const uniqueGroups = [...new Set(validRows.map(r => r.group))]

  // Aggregate capacities by group
  const capacitiesMap: Record<string, number> = {}
  for (const row of validRows) {
    capacitiesMap[row.group] = (capacitiesMap[row.group] || 0) + row.capacityTons
  }
  const capacities = Object.entries(capacitiesMap).map(([wasteType, capacityTons]) => ({
    wasteType,
    capacityTons,
    currentLoadTons: 0,
  }))

  // Build technologies map
  const technologies: Record<string, string> = {}
  validRows.forEach(r => {
    const parts = r.technologies.filter(tech => tech !== t('ecoRecyclersRegistry.techOther'))
    if (r.technologies.includes(t('ecoRecyclersRegistry.techOther')) && r.customTechnology.trim()) {
      parts.push(r.customTechnology.trim())
    }
    if (parts.length > 0) technologies[r.group] = parts.join(' | ')
  })

  const today = new Date()
  const dateStr = today.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' })
  recyclerStore.addRecycler({
    ...newRecycler.value,
    wasteTypes: uniqueGroups,
    capacities,
    technologies,
    addedDate: dateStr,
    addedBy: t('ecoRecyclersRegistry.operatorGP'),
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
    :roleTitle="roleTitle"
    userName="Исманова Динара"
    :menuItems="menuItems"
  >
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div>
        <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b] mb-2">{{ $t('pages.ecoOperator.recyclersTitle') }}</h1>
        <p class="text-[#64748b]">{{ $t('pages.ecoOperator.recyclersSubtitle') }}</p>
      </div>
      <AppButton variant="primary" @click="showAddForm = true">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        {{ $t('ecoRecyclersRegistry.addRecycler') }}
      </AppButton>
    </div>

    <SectionGuide
      :title="$t('ecoRecyclersRegistry.guideTitle')"
      :description="$t('ecoRecyclersRegistry.guideDescription')"
      :actions="[$t('ecoRecyclersRegistry.guideAction1'), $t('ecoRecyclersRegistry.guideAction2'), $t('ecoRecyclersRegistry.guideAction3'), $t('ecoRecyclersRegistry.guideAction4')]"
      storageKey="eco-recyclers"
    />

    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
        <p class="text-sm text-[#64748b] mb-1">{{ $t('ecoRecyclersRegistry.statsTotal') }}</p>
        <p class="text-2xl font-bold text-[#1e293b]">{{ counts.all }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
        <p class="text-sm text-[#64748b] mb-1">{{ $t('ecoRecyclersRegistry.statsActive') }}</p>
        <p class="text-2xl font-bold text-[#10b981]">{{ counts.active }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
        <p class="text-sm text-[#64748b] mb-1">{{ $t('ecoRecyclersRegistry.statsSuspended') }}</p>
        <p class="text-2xl font-bold text-[#f59e0b]">{{ counts.suspended }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
        <p class="text-sm text-[#64748b] mb-1">{{ $t('ecoRecyclersRegistry.statsRevoked') }}</p>
        <p class="text-2xl font-bold text-[#ef4444]">{{ counts.revoked }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
        <p class="text-sm text-[#64748b] mb-1">{{ $t('ecoRecyclersRegistry.statsTotalCapacity') }}</p>
        <p class="text-2xl font-bold text-[#2563eb]">{{ totalCapacityAll }} {{ $t('ecoRecyclersRegistry.tonsPerYear') }}</p>
      </div>
    </div>

    <!-- Add Form -->
    <div v-if="showAddForm" class="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] p-6 mb-6">
      <h2 class="text-lg font-semibold text-[#1e293b] mb-6">{{ $t('ecoRecyclersRegistry.addRecyclerTitle') }}</h2>
      <div class="space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-[#1e293b] mb-1">{{ $t('ecoRecyclersRegistry.labelName') }}</label>
            <input v-model="newRecycler.name" type="text" :placeholder="$t('ecoRecyclersRegistry.placeholderName')" class="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb] text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-[#1e293b] mb-1">{{ $t('ecoRecyclersRegistry.labelInn') }}</label>
            <input v-model="newRecycler.inn" type="text" :placeholder="$t('ecoRecyclersRegistry.placeholderInn')" class="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb] text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-[#1e293b] mb-1">{{ $t('ecoRecyclersRegistry.labelLicenseNumber') }}</label>
            <input v-model="newRecycler.licenseNumber" type="text" :placeholder="$t('ecoRecyclersRegistry.placeholderLicense')" class="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb] text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-[#1e293b] mb-1">{{ $t('ecoRecyclersRegistry.labelLicenseDate') }}</label>
            <input v-model="newRecycler.licenseDate" type="text" :placeholder="$t('ecoRecyclersRegistry.placeholderLicenseDate')" class="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb] text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-[#1e293b] mb-1">{{ $t('ecoRecyclersRegistry.labelLicenseExpiry') }}</label>
            <input v-model="newRecycler.licenseExpiry" type="text" :placeholder="$t('ecoRecyclersRegistry.placeholderLicenseExpiry')" class="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb] text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-[#1e293b] mb-1">{{ $t('ecoRecyclersRegistry.labelStatus') }}</label>
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
            <label class="block text-sm font-medium text-[#1e293b] mb-1">{{ $t('ecoRecyclersRegistry.labelAddress') }}</label>
            <input v-model="newRecycler.address" type="text" :placeholder="$t('ecoRecyclersRegistry.placeholderAddress')" class="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb] text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-[#1e293b] mb-1">{{ $t('ecoRecyclersRegistry.labelPhone') }}</label>
            <input v-model="newRecycler.contactPhone" type="text" :placeholder="$t('ecoRecyclersRegistry.placeholderPhone')" class="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb] text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-[#1e293b] mb-1">{{ $t('ecoRecyclersRegistry.labelEmail') }}</label>
            <input v-model="newRecycler.contactEmail" type="text" :placeholder="$t('ecoRecyclersRegistry.placeholderEmail')" class="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb] text-sm" />
          </div>
        </div>

        <!-- Мощности переработки - dynamic table -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="block text-sm font-medium text-[#1e293b]">{{ $t('ecoRecyclersRegistry.capacitiesLabel') }}</label>
            <button
              @click="addCapacityRow"
              class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#2563eb] bg-[#eff6ff] border border-[#2563eb] rounded-lg hover:bg-[#dbeafe] transition-colors"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              {{ $t('ecoRecyclersRegistry.addCapacity') }}
            </button>
          </div>

          <div v-if="capacityRows.length > 0" class="overflow-x-auto border border-[#e2e8f0] rounded-lg">
            <table class="w-full text-sm">
              <thead>
                <tr class="text-left text-[#64748b] bg-[#f8fafc] border-b border-[#e2e8f0]">
                  <th class="px-3 py-2 font-medium text-xs">{{ $t('ecoRecyclersRegistry.thWasteGroup') }}</th>
                  <th class="px-3 py-2 font-medium text-xs">{{ $t('ecoRecyclersRegistry.thSubgroup') }}</th>
                  <th class="px-3 py-2 font-medium text-xs">{{ $t('ecoRecyclersRegistry.thTechnology') }}</th>
                  <th class="px-3 py-2 font-medium text-xs">{{ $t('ecoRecyclersRegistry.thCapacityTons') }}</th>
                  <th class="px-3 py-2 font-medium text-xs">{{ $t('ecoRecyclersRegistry.thDocument') }}</th>
                  <th class="px-3 py-2 font-medium text-xs w-10"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in capacityRows" :key="row.id" class="border-t border-[#e2e8f0]">
                  <td class="px-3 py-2">
                    <select
                      v-model="row.group"
                      @change="row.subgroup = ''"
                      class="w-full min-w-[200px] px-2 py-1.5 border border-[#e2e8f0] rounded text-xs focus:outline-none focus:border-[#2563eb] bg-white"
                    >
                      <option value="">{{ $t('ecoRecyclersRegistry.selectGroup') }}</option>
                      <option v-for="g in productGroups" :key="g.value" :value="g.value">{{ g.label }}</option>
                    </select>
                  </td>
                  <td class="px-3 py-2">
                    <select
                      v-model="row.subgroup"
                      :disabled="!row.group"
                      class="w-full min-w-[200px] px-2 py-1.5 border border-[#e2e8f0] rounded text-xs focus:outline-none focus:border-[#2563eb] bg-white disabled:bg-[#f8fafc] disabled:text-[#94a3b8]"
                    >
                      <option value="">{{ $t('ecoRecyclersRegistry.selectSubgroup') }}</option>
                      <option v-for="sg in getSubgroups(row.group)" :key="sg.value" :value="sg.value">{{ sg.label }}</option>
                    </select>
                  </td>
                  <td class="px-3 py-2" style="min-width: 220px">
                    <div class="relative" @click.stop>
                      <div
                        @click="openTechDropdown = openTechDropdown === row.id ? null : row.id"
                        class="w-full min-w-[220px] min-h-[30px] px-2 py-1 border rounded text-xs cursor-pointer bg-white flex flex-wrap gap-1 items-center"
                        :class="openTechDropdown === row.id ? 'border-[#2563eb] ring-1 ring-[#2563eb]/20' : 'border-[#e2e8f0]'"
                      >
                        <template v-if="row.technologies.length === 0">
                          <span class="text-[#94a3b8]">{{ $t('ecoRecyclersRegistry.selectTechnologies') }}</span>
                        </template>
                        <template v-else>
                          <span
                            v-for="tech in getDisplayTechs(row)"
                            :key="tech"
                            class="inline-flex items-center gap-0.5 bg-[#eff6ff] text-[#2563eb] px-1.5 py-0.5 rounded text-[11px] leading-tight max-w-[160px]"
                          >
                            <span class="truncate">{{ tech }}</span>
                            <button type="button" @click.stop="removeTech(row, tech)" class="ml-0.5 text-[#2563eb]/60 hover:text-red-500 flex-shrink-0">&times;</button>
                          </span>
                          <span v-if="row.technologies.includes(t('ecoRecyclersRegistry.techOther'))" class="inline-flex items-center gap-0.5 bg-[#f0fdf4] text-[#16a34a] px-1.5 py-0.5 rounded text-[11px] leading-tight">
                            <span class="truncate">{{ row.customTechnology || t('ecoRecyclersRegistry.techOther') }}</span>
                            <button type="button" @click.stop="removeTech(row, t('ecoRecyclersRegistry.techOther'))" class="ml-0.5 text-[#16a34a]/60 hover:text-red-500 flex-shrink-0">&times;</button>
                          </span>
                          <span v-if="getExtraCount(row) > 0" class="text-[#64748b] text-[11px] whitespace-nowrap">+{{ getExtraCount(row) }}</span>
                        </template>
                        <svg class="w-3.5 h-3.5 text-[#94a3b8] ml-auto flex-shrink-0 transition-transform" :class="openTechDropdown === row.id ? 'rotate-180' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      <div v-if="openTechDropdown === row.id" class="fixed inset-0 z-40" @click="openTechDropdown = null"></div>
                      <div v-if="openTechDropdown === row.id" class="absolute top-full left-0 mt-1 w-full bg-white border border-[#e2e8f0] rounded shadow-lg z-50 max-h-[240px] overflow-y-auto py-1">
                        <label
                          v-for="opt in technologyOptions"
                          :key="opt"
                          class="flex items-center gap-2 px-2.5 py-1.5 hover:bg-[#f8fafc] cursor-pointer text-xs transition-colors"
                          @click.stop
                        >
                          <input
                            type="checkbox"
                            :checked="row.technologies.includes(opt)"
                            @change="toggleTech(row, opt)"
                            class="w-3.5 h-3.5 rounded border-[#d1d5db] text-[#2563eb] focus:ring-[#2563eb]/20"
                          />
                          <span :class="row.technologies.includes(opt) ? 'text-[#1e293b] font-medium' : 'text-[#4b5563]'">{{ opt }}</span>
                        </label>
                      </div>
                      <input
                        v-if="row.technologies.includes(t('ecoRecyclersRegistry.techOther'))"
                        v-model="row.customTechnology"
                        type="text"
                        :placeholder="$t('ecoRecyclersRegistry.placeholderCustomTech')"
                        class="w-full mt-1 px-2 py-1.5 border border-[#e2e8f0] rounded text-xs focus:outline-none focus:border-[#2563eb]"
                        @click.stop
                      />
                    </div>
                  </td>
                  <td class="px-3 py-2">
                    <input
                      v-model.number="row.capacityTons"
                      type="number"
                      min="0"
                      placeholder="0"
                      class="w-full min-w-[100px] px-2 py-1.5 border border-[#e2e8f0] rounded text-xs focus:outline-none focus:border-[#2563eb]"
                    />
                  </td>
                  <td class="px-3 py-2">
                    <div class="flex items-center gap-2 min-w-[180px]">
                      <label class="inline-flex items-center gap-1 px-2 py-1.5 text-xs text-[#2563eb] bg-[#eff6ff] border border-[#e2e8f0] rounded cursor-pointer hover:bg-[#dbeafe] transition-colors">
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        {{ $t('ecoRecyclersRegistry.upload') }}
                        <input type="file" class="hidden" @change="handleFileSelect(row, $event)" />
                      </label>
                      <span v-if="row.documentName" class="text-xs text-[#64748b] truncate max-w-[120px]" :title="row.documentName">{{ row.documentName }}</span>
                    </div>
                  </td>
                  <td class="px-3 py-2 text-center">
                    <button
                      @click="removeCapacityRow(row.id)"
                      class="p-1 text-[#94a3b8] hover:text-[#ef4444] transition-colors rounded hover:bg-[#fef2f2]"
                      :title="$t('ecoRecyclersRegistry.deleteRow')"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="border-t border-[#e2e8f0] bg-[#f8fafc]">
                  <td colspan="3" class="px-3 py-2 text-xs font-semibold text-[#1e293b] text-right">{{ $t('ecoRecyclersRegistry.totalCapacity') }}</td>
                  <td class="px-3 py-2 text-xs font-bold text-[#2563eb]">{{ totalCapacity }} {{ $t('ecoRecyclersRegistry.tonsPerYear') }}</td>
                  <td colspan="2"></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div v-else class="text-sm text-[#94a3b8] py-4 text-center border border-dashed border-[#e2e8f0] rounded-lg">
            {{ $t('ecoRecyclersRegistry.emptyCapacityHint') }}
          </div>

          <p v-if="capacityValidationError" class="text-sm text-[#ef4444] mt-2">{{ capacityValidationError }}</p>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-3 pt-4 border-t border-[#e2e8f0]">
          <AppButton variant="primary" @click="saveRecycler" :disabled="!newRecycler.name || !newRecycler.inn || !isCapacityValid">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            {{ $t('common.save') }}
          </AppButton>
          <AppButton variant="secondary" @click="cancelForm">
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
          :placeholder="$t('ecoRecyclersRegistry.searchPlaceholder')"
          class="flex-1 min-w-[200px] px-4 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb]"
        />
        <select v-model="filterStatus" class="px-4 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb]">
          <option value="">{{ $t('ecoRecyclersRegistry.allStatuses') }}</option>
          <option value="active">{{ $t('status.active') }}</option>
          <option value="suspended">{{ $t('status.suspended') }}</option>
          <option value="revoked">{{ $t('status.revoked') }}</option>
        </select>
        <select v-model="filterWasteType" class="px-4 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb]">
          <option value="">{{ $t('ecoRecyclersRegistry.allWasteTypes') }}</option>
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
              <th class="px-4 py-3 font-medium">{{ $t('ecoRecyclersRegistry.thName') }}</th>
              <th class="px-4 py-3 font-medium">{{ $t('ecoRecyclersRegistry.thInn') }}</th>
              <th class="px-4 py-3 font-medium">{{ $t('ecoRecyclersRegistry.thLicense') }}</th>
              <th class="px-4 py-3 font-medium">{{ $t('ecoRecyclersRegistry.thWasteTypes') }}</th>
              <th class="px-4 py-3 font-medium">{{ $t('ecoRecyclersRegistry.thCapacity') }}</th>
              <th class="px-4 py-3 font-medium">{{ $t('ecoRecyclersRegistry.thStatus') }}</th>
              <th class="px-4 py-3 font-medium">{{ $t('ecoRecyclersRegistry.thDateAdded') }}</th>
              <th class="px-4 py-3 font-medium text-right">{{ $t('ecoRecyclersRegistry.thActions') }}</th>
              <th class="px-4 py-3 font-medium w-10"></th>
            </tr>
          </thead>
          <tbody class="text-[#1e293b]">
            <tr
              v-for="recycler in filteredRecyclers"
              :key="recycler.id"
              class="border-t border-[#e2e8f0] hover:bg-[#f0fdf4] cursor-pointer transition-all duration-150 hover:shadow-sm"
              @click="goToDetail(recycler)"
            >
              <td class="px-4 py-3">
                <div>
                  <span class="font-medium text-[#2563eb] hover:underline">{{ recycler.name }}</span>
                  <p class="text-xs text-[#64748b] mt-0.5">{{ recycler.address }}</p>
                </div>
              </td>
              <td class="px-4 py-3 font-mono text-xs">{{ recycler.inn }}</td>
              <td class="px-4 py-3">
                <p class="font-mono text-xs">{{ recycler.licenseNumber }}</p>
                <p class="text-xs text-[#64748b]">{{ $t('ecoRecyclersRegistry.until') }} {{ recycler.licenseExpiry }}</p>
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
                    <span class="text-[#64748b]">{{ getTotalLoad(recycler) }} / {{ getTotalCapacity(recycler) }} {{ $t('common.tons') }}</span>
                    <span class="font-medium" :style="{ color: getLoadColor(getLoadPercent(recycler)) }">{{ getLoadPercent(recycler) }}%</span>
                  </div>
                  <div class="w-full h-1.5 bg-[#f1f5f9] rounded-full overflow-hidden">
                    <div
                      class="h-full rounded-full transition-all"
                      :style="{ width: Math.min(getLoadPercent(recycler), 100) + '%', backgroundColor: getLoadColor(getLoadPercent(recycler)) }"
                    ></div>
                  </div>
                  <p class="text-[10px] text-[#94a3b8] mt-0.5">{{ $t('ecoRecyclersRegistry.available') }} {{ getTotalCapacity(recycler) - getTotalLoad(recycler) }} {{ $t('ecoRecyclersRegistry.tonsPerYear') }}</p>
                </div>
              </td>
              <td class="px-4 py-3">
                <AppBadge :variant="getStatusBadgeVariant(getStatusLabel(recycler.status))">{{ getStatusLabel(recycler.status) }}</AppBadge>
              </td>
              <td class="px-4 py-3 text-xs text-[#64748b]">{{ recycler.addedDate }}</td>
              <td class="px-4 py-3" @click.stop>
                <div class="flex items-center justify-end gap-2">
                  <AppButton variant="ghost" size="sm" @click="goToDetail(recycler)">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    {{ $t('common.edit') }}
                  </AppButton>
                  <AppButton v-if="recycler.status === 'active'" variant="secondary" size="sm" @click="handleToggleStatus(recycler)">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {{ $t('ecoRecyclersRegistry.suspend') }}
                  </AppButton>
                  <AppButton v-else-if="recycler.status !== 'revoked'" variant="primary" size="sm" @click="handleToggleStatus(recycler)">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    </svg>
                    {{ $t('ecoRecyclersRegistry.activate') }}
                  </AppButton>
                </div>
              </td>
              <td class="px-4 py-3 text-[#94a3b8]">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="filteredRecyclers.length === 0">
        <EmptyState
          v-if="isFiltersActive && recyclerStore.state.recyclers.length > 0"
          icon='<svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>'
          :title="$t('empty.noSearchResults')"
          :description="$t('empty.noSearchResultsDesc')"
          :actionLabel="$t('empty.resetFilters')"
          @action="resetAllFilters"
        />
        <EmptyState
          v-else
          icon='<svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>'
          :title="$t('ecoRecyclersRegistry.registryEmpty')"
          :description="$t('ecoRecyclersRegistry.addFirstRecycler')"
          :actionLabel="'+ ' + $t('common.add')"
          @action="showAddForm = true"
        />
      </div>
    </div>

  </DashboardLayout>
</template>
