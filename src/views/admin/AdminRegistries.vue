<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import { AppButton } from '../../components/ui'
import { useAdminMenu } from '../../composables/useRoleMenu'

const { t } = useI18n()
const { roleTitle, menuItems } = useAdminMenu()

const registryCategories = computed(() => [
  { id: 'waste', name: t('adminRegistries.catWaste'), icon: '🗑️', count: 847, description: t('adminRegistries.catWasteDesc') },
  { id: 'tnved', name: t('adminRegistries.catTnved'), icon: '📦', count: 12453, description: t('adminRegistries.catTnvedDesc') },
  { id: 'regions', name: t('adminRegistries.catRegions'), icon: '🗺️', count: 52, description: t('adminRegistries.catRegionsDesc') },
  { id: 'rates', name: t('adminRegistries.catRates'), icon: '💰', count: 156, description: t('adminRegistries.catRatesDesc') },
  { id: 'normatives', name: t('adminRegistries.catNormatives'), icon: '📊', count: 48, description: t('adminRegistries.catNormativesDesc') },
  { id: 'activities', name: t('adminRegistries.catActivities'), icon: '🏭', count: 234, description: t('adminRegistries.catActivitiesDesc') },
  { id: 'documents', name: t('adminRegistries.catDocuments'), icon: '📄', count: 28, description: t('adminRegistries.catDocumentsDesc') },
  { id: 'statuses', name: t('adminRegistries.catStatuses'), icon: '🔄', count: 15, description: t('adminRegistries.catStatusesDesc') },
])

const selectedRegistry = ref<string | null>(null)
const searchQuery = ref('')
const filterClass = ref('')
const filterActive = ref('')

interface WasteCode {
  id: number
  code: string
  name: string
  class: number
  active: boolean
}

const wasteCodesData = ref<WasteCode[]>([
  { id: 1, code: '01 01 01', name: 'Отходы от добычи полезных ископаемых', class: 5, active: true },
  { id: 2, code: '02 01 01', name: 'Отходы от мытья и очистки', class: 5, active: true },
  { id: 3, code: '15 01 01', name: 'Бумажная и картонная упаковка', class: 5, active: true },
  { id: 4, code: '15 01 02', name: 'Пластмассовая упаковка', class: 5, active: true },
  { id: 5, code: '16 01 03', name: 'Изношенные шины', class: 4, active: true },
  { id: 6, code: '20 01 21', name: 'Люминесцентные лампы', class: 1, active: true },
])

const filteredData = computed(() => {
  return wasteCodesData.value.filter(item => {
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      if (!item.code.toLowerCase().includes(q) && !item.name.toLowerCase().includes(q)) return false
    }
    if (filterClass.value && item.class !== Number(filterClass.value)) return false
    if (filterActive.value === 'active' && !item.active) return false
    if (filterActive.value === 'inactive' && item.active) return false
    return true
  })
})

const showFilters = ref(false)

const getHazardClass = (hc: number) => {
  const classes: Record<number, string> = {
    1: 'bg-red-100 text-red-700', 2: 'bg-orange-100 text-orange-700',
    3: 'bg-yellow-100 text-yellow-700', 4: 'bg-blue-100 text-blue-700', 5: 'bg-green-100 text-green-700',
  }
  return classes[hc] || 'bg-gray-100 text-gray-700'
}

// --- Add/Edit Modal ---
const showFormModal = ref(false)
const isEditing = ref(false)
const editingId = ref<number | null>(null)

const form = reactive({ code: '', name: '', class: 5, active: true })
const formErrors = reactive<Record<string, string>>({})

function resetForm() {
  Object.assign(form, { code: '', name: '', class: 5, active: true })
  Object.keys(formErrors).forEach(k => delete formErrors[k])
}

function openAddModal() {
  resetForm()
  isEditing.value = false
  editingId.value = null
  showFormModal.value = true
}

function openEditModal(item: WasteCode) {
  resetForm()
  isEditing.value = true
  editingId.value = item.id
  Object.assign(form, { code: item.code, name: item.name, class: item.class, active: item.active })
  showFormModal.value = true
}

function validateForm(): boolean {
  Object.keys(formErrors).forEach(k => delete formErrors[k])
  if (!form.code.trim()) formErrors.code = t('adminRegistries.enterCode')
  if (!form.name.trim()) formErrors.name = t('adminRegistries.enterName')
  return Object.keys(formErrors).length === 0
}

function saveRecord() {
  if (!validateForm()) return
  if (isEditing.value && editingId.value) {
    const idx = wasteCodesData.value.findIndex(i => i.id === editingId.value)
    if (idx !== -1) wasteCodesData.value[idx] = { ...wasteCodesData.value[idx], ...form }
  } else {
    wasteCodesData.value.push({
      id: Math.max(0, ...wasteCodesData.value.map(i => i.id)) + 1,
      code: form.code.trim(), name: form.name.trim(), class: form.class, active: form.active,
    })
  }
  showFormModal.value = false
}

// --- Delete ---
const showDeleteConfirm = ref(false)
const deletingItem = ref<WasteCode | null>(null)

function confirmDelete(item: WasteCode) {
  deletingItem.value = item
  showDeleteConfirm.value = true
}

function deleteRecord() {
  if (deletingItem.value) {
    wasteCodesData.value = wasteCodesData.value.filter(i => i.id !== deletingItem.value!.id)
  }
  showDeleteConfirm.value = false
}

// --- Export ---
function exportData() {
  const headers = [t('adminRegistries.exportCode'), t('adminRegistries.exportName'), t('adminRegistries.exportHazardClass'), t('adminRegistries.exportStatus')]
  const rows = filteredData.value.map(i => [i.code, i.name, `${i.class} ${t('adminRegistries.classLabel')}`, i.active ? t('adminRegistries.active') : t('adminRegistries.inactive')])
  const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `registry_export_${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
}

// --- Import Modal ---
const showImportModal = ref(false)
const importFile = ref<File | null>(null)

function handleFileSelect(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files?.length) importFile.value = input.files[0]
}

function importData() {
  showImportModal.value = false
  importFile.value = null
}

function handleOverlay(e: MouseEvent, close: () => void) {
  if ((e.target as HTMLElement).classList.contains('modal-overlay')) close()
}
</script>

<template>
  <DashboardLayout role="admin" :roleTitle="roleTitle" userName="Иван Петров" :menuItems="menuItems">
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">{{ $t('adminRegistries.title') }}</h1>
          <p class="text-gray-600 mt-1">{{ $t('adminRegistries.subtitle') }}</p>
        </div>
        <div class="flex items-center gap-3">
          <AppButton variant="secondary" @click="showImportModal = true">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            {{ $t('adminRegistries.import') }}
          </AppButton>
          <AppButton variant="primary" @click="openAddModal">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
            {{ $t('adminRegistries.addRecord') }}
          </AppButton>
        </div>
      </div>

      <!-- Registry Cards -->
      <div v-if="!selectedRegistry" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div v-for="reg in registryCategories" :key="reg.id" @click="selectedRegistry = reg.id" class="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md hover:border-rose-200 transition-all cursor-pointer">
          <div class="flex items-start justify-between mb-3">
            <div class="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center text-2xl">{{ reg.icon }}</div>
            <span class="px-2 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded-full">{{ reg.count.toLocaleString() }}</span>
          </div>
          <h3 class="font-semibold text-gray-900">{{ reg.name }}</h3>
          <p class="text-sm text-gray-500 mt-1">{{ reg.description }}</p>
        </div>
      </div>

      <!-- Selected Registry View -->
      <div v-else class="space-y-4">
        <div class="flex items-center gap-4">
          <button @click="selectedRegistry = null" class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div>
            <h2 class="text-xl font-bold text-gray-900">{{ registryCategories.find(r => r.id === selectedRegistry)?.name }}</h2>
            <p class="text-sm text-gray-500">{{ filteredData.length }} {{ $t('adminRegistries.records') }}</p>
          </div>
        </div>

        <!-- Search and filters -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div class="flex items-center gap-4">
            <div class="flex-1 relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input v-model="searchQuery" type="text" :placeholder="$t('adminRegistries.searchPlaceholder')" class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500" />
            </div>
            <button @click="showFilters = !showFilters" :class="['px-4 py-2 rounded-lg transition-colors flex items-center gap-2', showFilters ? 'bg-rose-100 text-rose-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200']">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
              {{ $t('adminRegistries.filters') }}
            </button>
            <button @click="exportData" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              {{ $t('adminRegistries.export') }}
            </button>
          </div>
          <!-- Expanded filters -->
          <Transition name="slide">
            <div v-if="showFilters" class="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200">
              <select v-model="filterClass" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 text-sm">
                <option value="">{{ $t('adminRegistries.allHazardClasses') }}</option>
                <option value="1">{{ $t('adminRegistries.hazardClass1') }}</option><option value="2">{{ $t('adminRegistries.hazardClass2') }}</option>
                <option value="3">{{ $t('adminRegistries.hazardClass3') }}</option><option value="4">{{ $t('adminRegistries.hazardClass4') }}</option><option value="5">{{ $t('adminRegistries.hazardClass5') }}</option>
              </select>
              <select v-model="filterActive" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 text-sm">
                <option value="">{{ $t('adminRegistries.allStatuses') }}</option>
                <option value="active">{{ $t('adminRegistries.active') }}</option><option value="inactive">{{ $t('adminRegistries.inactive') }}</option>
              </select>
              <button @click="filterClass = ''; filterActive = ''" class="text-sm text-rose-600 hover:text-rose-700 font-medium">{{ $t('adminRegistries.reset') }}</button>
            </div>
          </Transition>
        </div>

        <!-- Data table -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{{ $t('adminRegistries.codeColumn') }}</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{{ $t('adminRegistries.nameColumn') }}</th>
                <th class="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{{ $t('adminRegistries.hazardClassColumn') }}</th>
                <th class="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{{ $t('adminRegistries.statusColumn') }}</th>
                <th class="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{{ $t('adminRegistries.actionsColumn') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="item in filteredData" :key="item.id" class="hover:bg-gray-50">
                <td class="px-6 py-4"><span class="font-mono text-sm text-rose-600 bg-rose-50 px-2 py-1 rounded">{{ item.code }}</span></td>
                <td class="px-6 py-4 text-sm text-gray-900">{{ item.name }}</td>
                <td class="px-6 py-4 text-center"><span :class="['px-2 py-1 rounded-full text-xs font-medium', getHazardClass(item.class)]">{{ item.class }} {{ $t('adminRegistries.classLabel') }}</span></td>
                <td class="px-6 py-4 text-center"><span :class="item.active ? 'text-green-600' : 'text-gray-400'">{{ item.active ? $t('adminRegistries.active') : $t('adminRegistries.inactive') }}</span></td>
                <td class="px-6 py-4">
                  <div class="flex items-center justify-center gap-2">
                    <AppButton variant="secondary" size="sm" @click="openEditModal(item)">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      {{ $t('adminRegistries.editBtn') }}
                    </AppButton>
                    <AppButton variant="danger" size="sm" @click="confirmDelete(item)">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      {{ $t('adminRegistries.deleteBtn') }}
                    </AppButton>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredData.length === 0">
                <td colspan="5" class="px-6 py-12 text-center text-gray-500">{{ $t('adminRegistries.noRecordsFound') }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ===== ADD/EDIT RECORD MODAL ===== -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showFormModal" class="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4" style="background:rgba(0,0,0,0.5);backdrop-filter:blur(4px);" @click="(e: MouseEvent) => handleOverlay(e, () => showFormModal = false)">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div class="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 class="text-lg font-bold text-gray-900">{{ isEditing ? $t('adminRegistries.editRecord') : $t('adminRegistries.addRecord') }}</h3>
              <button @click="showFormModal = false" class="p-2 text-gray-400 hover:text-gray-600 rounded-lg"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div class="p-6 space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('adminRegistries.codeColumn') }} <span class="text-red-500">*</span></label>
                <input v-model="form.code" type="text" :placeholder="$t('adminRegistries.codePlaceholder')" :class="['w-full px-4 py-2.5 border rounded-xl focus:outline-none font-mono', formErrors.code ? 'border-red-400 bg-red-50/50' : 'border-gray-300 focus:border-rose-500']" />
                <p v-if="formErrors.code" class="mt-1 text-xs text-red-500">{{ formErrors.code }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('adminRegistries.nameLabel') }} <span class="text-red-500">*</span></label>
                <input v-model="form.name" type="text" :placeholder="$t('adminRegistries.namePlaceholder')" :class="['w-full px-4 py-2.5 border rounded-xl focus:outline-none', formErrors.name ? 'border-red-400 bg-red-50/50' : 'border-gray-300 focus:border-rose-500']" />
                <p v-if="formErrors.name" class="mt-1 text-xs text-red-500">{{ formErrors.name }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('adminRegistries.hazardClassLabel') }}</label>
                <select v-model="form.class" class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-rose-500">
                  <option :value="1">{{ $t('adminRegistries.hazardClass1Full') }}</option>
                  <option :value="2">{{ $t('adminRegistries.hazardClass2Full') }}</option>
                  <option :value="3">{{ $t('adminRegistries.hazardClass3Full') }}</option>
                  <option :value="4">{{ $t('adminRegistries.hazardClass4Full') }}</option>
                  <option :value="5">{{ $t('adminRegistries.hazardClass5Full') }}</option>
                </select>
              </div>
              <label class="flex items-center gap-3 cursor-pointer">
                <input v-model="form.active" type="checkbox" class="w-5 h-5 rounded border-gray-300 text-rose-600 focus:ring-rose-500" />
                <span class="text-gray-700">{{ $t('adminRegistries.recordActive') }}</span>
              </label>
            </div>
            <div class="flex gap-3 p-6 border-t border-gray-200">
              <AppButton variant="secondary" class="flex-1" @click="showFormModal = false">{{ $t('adminRegistries.cancel') }}</AppButton>
              <AppButton variant="primary" class="flex-1" @click="saveRecord">{{ isEditing ? $t('adminRegistries.save') : $t('adminRegistries.add') }}</AppButton>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ===== DELETE CONFIRM ===== -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showDeleteConfirm && deletingItem" class="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4" style="background:rgba(0,0,0,0.5);backdrop-filter:blur(4px);" @click="(e: MouseEvent) => handleOverlay(e, () => showDeleteConfirm = false)">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm text-center p-8">
            <div class="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg class="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-2">{{ $t('adminRegistries.deleteRecordTitle') }}</h3>
            <p class="text-gray-500 text-sm mb-6">{{ deletingItem.code }} — {{ deletingItem.name }}</p>
            <div class="flex gap-3">
              <AppButton variant="secondary" class="flex-1" @click="showDeleteConfirm = false">{{ $t('adminRegistries.cancel') }}</AppButton>
              <AppButton variant="danger" class="flex-1" @click="deleteRecord">{{ $t('adminRegistries.deleteBtn') }}</AppButton>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ===== IMPORT MODAL ===== -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showImportModal" class="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4" style="background:rgba(0,0,0,0.5);backdrop-filter:blur(4px);" @click="(e: MouseEvent) => handleOverlay(e, () => showImportModal = false)">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div class="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 class="text-lg font-bold text-gray-900">{{ $t('adminRegistries.importDataTitle') }}</h3>
              <button @click="showImportModal = false" class="p-2 text-gray-400 hover:text-gray-600 rounded-lg"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div class="p-6 space-y-4">
              <p class="text-sm text-gray-600">{{ $t('adminRegistries.importDescription') }}</p>
              <div class="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-rose-400 transition-colors">
                <svg class="w-10 h-10 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                <p v-if="importFile" class="text-sm font-medium text-gray-900">{{ importFile.name }}</p>
                <p v-else class="text-sm text-gray-500 mb-2">{{ $t('adminRegistries.dragOrClick') }}</p>
                <input type="file" accept=".csv,.xlsx,.xls" class="hidden" id="import-file" @change="handleFileSelect" />
                <label for="import-file" class="inline-block px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-200 transition-colors">{{ $t('adminRegistries.selectFile') }}</label>
              </div>
            </div>
            <div class="flex gap-3 p-6 border-t border-gray-200">
              <AppButton variant="secondary" class="flex-1" @click="showImportModal = false">{{ $t('adminRegistries.cancel') }}</AppButton>
              <button @click="importData" :disabled="!importFile" :class="['flex-1 px-4 py-2.5 rounded-xl font-medium transition-colors', importFile ? 'bg-rose-600 text-white hover:bg-rose-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed']">{{ $t('adminRegistries.importBtn') }}</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </DashboardLayout>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.slide-enter-active, .slide-leave-active { transition: all 0.2s ease; }
.slide-enter-from, .slide-leave-to { opacity: 0; max-height: 0; margin-top: 0; padding-top: 0; }
.slide-enter-to { max-height: 100px; }
</style>
