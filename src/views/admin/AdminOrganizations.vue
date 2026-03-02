<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import DataTable from '../../components/dashboard/DataTable.vue'
import { AppButton, AppBadge } from '../../components/ui'
import { getStatusBadgeVariant } from '../../utils/statusVariant'
import { UserStatus } from '../../constants/statuses'
import { useAdminMenu } from '../../composables/useRoleMenu'

const { t } = useI18n()
const { roleTitle, menuItems } = useAdminMenu()

const columns = computed(() => [
  { key: 'inn', label: t('adminOrgs.colInn'), width: '10%' },
  { key: 'name', label: t('adminOrgs.colName'), width: '18%' },
  { key: 'type', label: t('adminOrgs.colType'), width: '8%' },
  { key: 'region', label: t('adminOrgs.colRegion'), width: '10%' },
  { key: 'registeredAt', label: t('adminOrgs.colRegisteredAt'), width: '10%' },
  { key: 'status', label: t('adminOrgs.colStatus'), width: '10%' },
])

interface Organization {
  id: number
  inn: string
  name: string
  type: string
  region: string
  registeredAt: string
  status: string
  address: string
  contactPerson: string
  phone: string
  email: string
}

const organizations = ref<Organization[]>([
  { id: 1, inn: '01234567891234', name: 'ОсОО "ТехПром"', type: 'Плательщик', region: 'г. Бишкек', registeredAt: '15.03.2024', status: UserStatus.ACTIVE, address: 'ул. Чуй, 100', contactPerson: 'Асанов Б.К.', phone: '+996 701 111 222', email: 'info@techprom.kg' },
  { id: 2, inn: '01234567891235', name: 'ОсОО "ЭкоПереработка"', type: 'Эко Оператор', region: 'г. Бишкек', registeredAt: '10.02.2024', status: UserStatus.ACTIVE, address: 'ул. Манаса, 50', contactPerson: 'Токтогулова А.С.', phone: '+996 702 333 444', email: 'eco@recycle.kg' },
  { id: 3, inn: '01234567891236', name: 'ОАО "СтройМаркет"', type: 'Плательщик', region: 'Чуйская обл.', registeredAt: '22.01.2024', status: UserStatus.ACTIVE, address: 'с. Беловодское, ул. Ленина, 15', contactPerson: 'Жумабеков Э.К.', phone: '+996 555 123 456', email: 'stroymarket@mail.kg' },
  { id: 4, inn: '01234567891237', name: 'ОсОО "ПищеПром"', type: 'Плательщик', region: 'г. Ош', registeredAt: '05.01.2024', status: UserStatus.ACTIVE, address: 'ул. Курманжан Датки, 22', contactPerson: 'Мамытов Р.Н.', phone: '+996 770 555 666', email: 'food@pischeprom.kg' },
  { id: 5, inn: '01234567891238', name: 'ИП Асанов Б.К.', type: 'Плательщик', region: 'г. Бишкек', registeredAt: '20.01.2025', status: UserStatus.PENDING, address: 'ул. Токтогула, 88', contactPerson: 'Асанов Б.К.', phone: '+996 700 777 888', email: 'asanov@mail.kg' },
  { id: 6, inn: '01234567891239', name: 'ОсОО "ГринРесайкл"', type: 'Эко Оператор', region: 'Иссык-Кульская обл.', registeredAt: '18.12.2023', status: UserStatus.ACTIVE, address: 'г. Каракол, ул. Гагарина, 5', contactPerson: 'Кыдыралиев С.М.', phone: '+996 705 111 333', email: 'green@recycle.kg' },
  { id: 7, inn: '01234567891240', name: 'ОАО "МегаТорг"', type: 'Плательщик', region: 'г. Бишкек', registeredAt: '01.11.2023', status: UserStatus.BLOCKED, address: 'пр. Мира, 200', contactPerson: 'Сыдыкова Д.А.', phone: '+996 312 999 000', email: 'mega@torg.kg' },
])

// --- Filters ---
const searchQuery = ref('')
const filterType = ref('')
const filterRegion = ref('')
const filterStatus = ref('')

const filteredOrganizations = computed(() => {
  return organizations.value.filter(org => {
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      if (!org.inn.includes(q) && !org.name.toLowerCase().includes(q)) return false
    }
    if (filterType.value && org.type !== filterType.value) return false
    if (filterRegion.value && org.region !== filterRegion.value) return false
    if (filterStatus.value && org.status !== filterStatus.value) return false
    return true
  })
})

// --- Type helper ---
const getTypeClass = (type: string) => {
  switch (type) {
    case 'Плательщик': return 'bg-blue-100 text-blue-800'
    case 'Эко Оператор': return 'bg-teal-100 text-teal-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

// --- Add/Edit Modal ---
const showFormModal = ref(false)
const isEditing = ref(false)
const editingId = ref<number | null>(null)

interface OrgForm {
  name: string
  inn: string
  address: string
  contactPerson: string
  phone: string
  email: string
  type: string
  region: string
}

const form = reactive<OrgForm>({
  name: '', inn: '', address: '', contactPerson: '', phone: '', email: '', type: '', region: '',
})
const errors = reactive<Record<string, string>>({})

function resetForm() {
  Object.assign(form, { name: '', inn: '', address: '', contactPerson: '', phone: '', email: '', type: '', region: '' })
  Object.keys(errors).forEach(k => delete errors[k])
}

function openAddModal() {
  resetForm()
  isEditing.value = false
  editingId.value = null
  showFormModal.value = true
}

function openEditModal(org: Organization) {
  resetForm()
  isEditing.value = true
  editingId.value = org.id
  Object.assign(form, {
    name: org.name, inn: org.inn, address: org.address, contactPerson: org.contactPerson,
    phone: org.phone, email: org.email, type: org.type, region: org.region,
  })
  showFormModal.value = true
}

function validateForm(): boolean {
  Object.keys(errors).forEach(k => delete errors[k])
  if (!form.name.trim()) errors.name = t('adminOrgs.errEnterName')
  if (!form.inn.trim()) errors.inn = t('adminOrgs.errEnterInn')
  else if (!/^\d{10,14}$/.test(form.inn.trim())) errors.inn = t('adminOrgs.errInnFormat')
  if (!form.address.trim()) errors.address = t('adminOrgs.errEnterAddress')
  if (!form.contactPerson.trim()) errors.contactPerson = t('adminOrgs.errEnterContactPerson')
  if (!form.phone.trim()) errors.phone = t('adminOrgs.errEnterPhone')
  if (!form.email.trim()) errors.email = t('adminOrgs.errEnterEmail')
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = t('adminOrgs.errInvalidEmail')
  if (!form.type) errors.type = t('adminOrgs.errSelectType')
  return Object.keys(errors).length === 0
}

function formatDate(date: Date): string {
  const d = date.getDate().toString().padStart(2, '0')
  const m = (date.getMonth() + 1).toString().padStart(2, '0')
  return `${d}.${m}.${date.getFullYear()}`
}

function saveOrganization() {
  if (!validateForm()) return
  if (isEditing.value && editingId.value) {
    const idx = organizations.value.findIndex(o => o.id === editingId.value)
    if (idx !== -1) {
      organizations.value[idx] = { ...organizations.value[idx], ...form }
    }
  } else {
    organizations.value.unshift({
      id: Math.max(...organizations.value.map(o => o.id)) + 1,
      ...form,
      registeredAt: formatDate(new Date()),
      status: UserStatus.PENDING,
    })
  }
  showFormModal.value = false
}

// --- View Modal ---
const showViewModal = ref(false)
const viewingOrg = ref<Organization | null>(null)

function openViewModal(org: Organization) {
  viewingOrg.value = org
  showViewModal.value = true
}

// --- Delete Confirm ---
const showDeleteConfirm = ref(false)
const deletingOrg = ref<Organization | null>(null)

function confirmDelete(org: Organization) {
  deletingOrg.value = org
  showDeleteConfirm.value = true
}

function deleteOrganization() {
  if (deletingOrg.value) {
    organizations.value = organizations.value.filter(o => o.id !== deletingOrg.value!.id)
  }
  showDeleteConfirm.value = false
  deletingOrg.value = null
}

function handleOverlay(e: MouseEvent, close: () => void) {
  if ((e.target as HTMLElement).classList.contains('modal-overlay')) close()
}
</script>

<template>
  <DashboardLayout
    role="admin"
    :roleTitle="roleTitle"
    userName="Иван Петров"
    :menuItems="menuItems"
  >
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div>
        <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b] mb-2">{{ $t('adminOrgs.title') }}</h1>
        <p class="text-[#64748b]">{{ $t('adminOrgs.subtitle') }}</p>
      </div>
      <AppButton variant="primary" @click="openAddModal">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        {{ $t('adminOrgs.addOrg') }}
      </AppButton>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
        <p class="text-sm text-[#64748b] mb-1">{{ $t('adminOrgs.totalOrgs') }}</p>
        <p class="text-2xl font-bold text-[#1e293b]">{{ organizations.length }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
        <p class="text-sm text-[#64748b] mb-1">{{ $t('adminOrgs.payers') }}</p>
        <p class="text-2xl font-bold text-[#2563eb]">{{ organizations.filter(o => o.type === 'Плательщик').length }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
        <p class="text-sm text-[#64748b] mb-1">{{ $t('adminOrgs.ecoOperators') }}</p>
        <p class="text-2xl font-bold text-[#0d9488]">{{ organizations.filter(o => o.type === 'Эко Оператор').length }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
        <p class="text-sm text-[#64748b] mb-1">{{ $t('adminOrgs.onReview') }}</p>
        <p class="text-2xl font-bold text-[#f59e0b]">{{ organizations.filter(o => o.status === 'pending').length }}</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-2xl p-4 shadow-sm border border-[#e2e8f0] mb-6">
      <div class="flex flex-wrap gap-4">
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="$t('adminOrgs.searchPlaceholder')"
          class="flex-1 min-w-[200px] px-4 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb]"
        />
        <select v-model="filterType" class="px-4 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb]">
          <option value="">{{ $t('adminOrgs.allTypes') }}</option>
          <option value="Плательщик">{{ $t('adminOrgs.typePayer') }}</option>
          <option value="Эко Оператор">{{ $t('adminOrgs.typeEcoOperator') }}</option>
        </select>
        <select v-model="filterRegion" class="px-4 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb]">
          <option value="">{{ $t('adminOrgs.allRegions') }}</option>
          <option value="г. Бишкек">г. Бишкек</option>
          <option value="Чуйская обл.">Чуйская обл.</option>
          <option value="г. Ош">г. Ош</option>
          <option value="Иссык-Кульская обл.">Иссык-Кульская обл.</option>
        </select>
        <select v-model="filterStatus" class="px-4 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb]">
          <option value="">{{ $t('adminOrgs.allStatuses') }}</option>
          <option value="active">{{ $t('status.active') }}</option>
          <option value="pending">{{ $t('status.pending') }}</option>
          <option value="blocked">{{ $t('status.blocked') }}</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <DataTable :columns="columns" :data="filteredOrganizations" :actions="true">
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
        <AppBadge :variant="getStatusBadgeVariant(value)">{{ $t('status.' + value) }}</AppBadge>
      </template>
      <template #actions="{ row }">
        <div class="flex items-center justify-end gap-2">
          <AppButton variant="ghost" size="sm" @click="openViewModal(row)">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            {{ $t('adminOrgs.btnView') }}
          </AppButton>
          <AppButton variant="secondary" size="sm" @click="openEditModal(row)">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            {{ $t('adminOrgs.btnEdit') }}
          </AppButton>
          <AppButton variant="danger" size="sm" @click="confirmDelete(row)">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            {{ $t('adminOrgs.btnDelete') }}
          </AppButton>
        </div>
      </template>
    </DataTable>

    <!-- ===== ADD/EDIT MODAL ===== -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showFormModal" class="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4" style="background:rgba(0,0,0,0.5);backdrop-filter:blur(4px);" @click="(e: MouseEvent) => handleOverlay(e, () => showFormModal = false)">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between p-6 border-b border-[#f1f5f9]">
              <div>
                <h3 class="text-xl font-bold text-[#1e293b]">{{ isEditing ? $t('adminOrgs.editTitle') : $t('adminOrgs.addTitle') }}</h3>
                <p class="text-sm text-[#64748b] mt-1">{{ isEditing ? $t('adminOrgs.editSubtitle') : $t('adminOrgs.addSubtitle') }}</p>
              </div>
              <button @click="showFormModal = false" class="p-2 text-[#94a3b8] hover:text-[#415861] hover:bg-[#f1f5f9] rounded-lg transition-colors">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div class="p-6 space-y-4">
              <div>
                <label class="block text-sm font-medium text-[#415861] mb-1.5">{{ $t('adminOrgs.labelName') }} <span class="text-red-500">*</span></label>
                <input v-model="form.name" type="text" placeholder='ОсОО "Название"' :class="['w-full px-4 py-2.5 border rounded-xl focus:outline-none transition-colors', errors.name ? 'border-red-400 bg-red-50/50' : 'border-[#e5e7eb] focus:border-[#2563eb]']" />
                <p v-if="errors.name" class="mt-1 text-xs text-red-500">{{ errors.name }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-[#415861] mb-1.5">{{ $t('adminOrgs.labelInn') }} <span class="text-red-500">*</span></label>
                <input v-model="form.inn" type="text" placeholder="01234567891234" :class="['w-full px-4 py-2.5 border rounded-xl focus:outline-none transition-colors font-mono', errors.inn ? 'border-red-400 bg-red-50/50' : 'border-[#e5e7eb] focus:border-[#2563eb]']" />
                <p v-if="errors.inn" class="mt-1 text-xs text-red-500">{{ errors.inn }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-[#415861] mb-1.5">{{ $t('adminOrgs.labelAddress') }} <span class="text-red-500">*</span></label>
                <input v-model="form.address" type="text" placeholder="г. Бишкек, ул. Чуй, 100" :class="['w-full px-4 py-2.5 border rounded-xl focus:outline-none transition-colors', errors.address ? 'border-red-400 bg-red-50/50' : 'border-[#e5e7eb] focus:border-[#2563eb]']" />
                <p v-if="errors.address" class="mt-1 text-xs text-red-500">{{ errors.address }}</p>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-[#415861] mb-1.5">{{ $t('adminOrgs.labelOrgType') }} <span class="text-red-500">*</span></label>
                  <select v-model="form.type" :class="['w-full px-4 py-2.5 border rounded-xl focus:outline-none transition-colors', errors.type ? 'border-red-400 bg-red-50/50' : 'border-[#e5e7eb] focus:border-[#2563eb]', !form.type ? 'text-[#9ca3af]' : '']">
                    <option value="" disabled>{{ $t('adminOrgs.selectType') }}</option>
                    <option value="Плательщик">{{ $t('adminOrgs.typePayer') }}</option>
                    <option value="Эко Оператор">{{ $t('adminOrgs.typeEcoOperator') }}</option>
                  </select>
                  <p v-if="errors.type" class="mt-1 text-xs text-red-500">{{ errors.type }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-[#415861] mb-1.5">{{ $t('adminOrgs.labelRegion') }}</label>
                  <select v-model="form.region" class="w-full px-4 py-2.5 border border-[#e5e7eb] rounded-xl focus:outline-none focus:border-[#2563eb]">
                    <option value="">{{ $t('adminOrgs.selectRegion') }}</option>
                    <option value="г. Бишкек">г. Бишкек</option>
                    <option value="Чуйская обл.">Чуйская обл.</option>
                    <option value="г. Ош">г. Ош</option>
                    <option value="Иссык-Кульская обл.">Иссык-Кульская обл.</option>
                    <option value="Нарынская обл.">Нарынская обл.</option>
                    <option value="Джалал-Абадская обл.">Джалал-Абадская обл.</option>
                    <option value="Таласская обл.">Таласская обл.</option>
                    <option value="Баткенская обл.">Баткенская обл.</option>
                    <option value="Ошская обл.">Ошская обл.</option>
                  </select>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-[#415861] mb-1.5">{{ $t('adminOrgs.labelContactPerson') }} <span class="text-red-500">*</span></label>
                <input v-model="form.contactPerson" type="text" placeholder="ФИО" :class="['w-full px-4 py-2.5 border rounded-xl focus:outline-none transition-colors', errors.contactPerson ? 'border-red-400 bg-red-50/50' : 'border-[#e5e7eb] focus:border-[#2563eb]']" />
                <p v-if="errors.contactPerson" class="mt-1 text-xs text-red-500">{{ errors.contactPerson }}</p>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-[#415861] mb-1.5">{{ $t('adminOrgs.labelPhone') }} <span class="text-red-500">*</span></label>
                  <input v-model="form.phone" type="tel" placeholder="+996 XXX XXX XXX" :class="['w-full px-4 py-2.5 border rounded-xl focus:outline-none transition-colors', errors.phone ? 'border-red-400 bg-red-50/50' : 'border-[#e5e7eb] focus:border-[#2563eb]']" />
                  <p v-if="errors.phone" class="mt-1 text-xs text-red-500">{{ errors.phone }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-[#415861] mb-1.5">{{ $t('adminOrgs.labelEmail') }} <span class="text-red-500">*</span></label>
                  <input v-model="form.email" type="email" placeholder="org@mail.kg" :class="['w-full px-4 py-2.5 border rounded-xl focus:outline-none transition-colors', errors.email ? 'border-red-400 bg-red-50/50' : 'border-[#e5e7eb] focus:border-[#2563eb]']" />
                  <p v-if="errors.email" class="mt-1 text-xs text-red-500">{{ errors.email }}</p>
                </div>
              </div>
            </div>
            <div class="flex items-center justify-end gap-3 p-6 border-t border-[#f1f5f9]">
              <AppButton variant="secondary" @click="showFormModal = false">{{ $t('adminOrgs.cancel') }}</AppButton>
              <AppButton variant="primary" @click="saveOrganization">{{ isEditing ? $t('adminOrgs.save') : $t('adminOrgs.add') }}</AppButton>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ===== VIEW MODAL ===== -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showViewModal && viewingOrg" class="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4" style="background:rgba(0,0,0,0.5);backdrop-filter:blur(4px);" @click="(e: MouseEvent) => handleOverlay(e, () => showViewModal = false)">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div class="flex items-center justify-between p-6 border-b border-[#f1f5f9]">
              <h3 class="text-xl font-bold text-[#1e293b]">{{ $t('adminOrgs.orgCard') }}</h3>
              <button @click="showViewModal = false" class="p-2 text-[#94a3b8] hover:text-[#415861] hover:bg-[#f1f5f9] rounded-lg transition-colors">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div class="p-6 space-y-4">
              <div class="flex items-center gap-4 mb-2">
                <div class="w-14 h-14 rounded-xl bg-[#2563eb] flex items-center justify-center text-white text-xl font-bold">{{ viewingOrg.name.charAt(0) }}</div>
                <div>
                  <p class="font-bold text-lg text-[#1e293b]">{{ viewingOrg.name }}</p>
                  <span :class="['px-3 py-1 rounded-full text-xs font-medium', getTypeClass(viewingOrg.type)]">{{ viewingOrg.type }}</span>
                  <AppBadge :variant="getStatusBadgeVariant(viewingOrg.status)" class="ml-2">{{ $t('status.' + viewingOrg.status) }}</AppBadge>
                </div>
              </div>
              <div class="bg-[#f8fafc] rounded-xl p-4 grid grid-cols-2 gap-3 text-sm">
                <div><p class="text-[#94a3b8]">{{ $t('adminOrgs.labelInnView') }}</p><p class="text-[#1e293b] font-mono font-medium">{{ viewingOrg.inn }}</p></div>
                <div><p class="text-[#94a3b8]">{{ $t('adminOrgs.labelRegionView') }}</p><p class="text-[#1e293b] font-medium">{{ viewingOrg.region }}</p></div>
                <div class="col-span-2"><p class="text-[#94a3b8]">{{ $t('adminOrgs.labelAddressView') }}</p><p class="text-[#1e293b] font-medium">{{ viewingOrg.address }}</p></div>
                <div><p class="text-[#94a3b8]">{{ $t('adminOrgs.labelContactPersonView') }}</p><p class="text-[#1e293b] font-medium">{{ viewingOrg.contactPerson }}</p></div>
                <div><p class="text-[#94a3b8]">{{ $t('adminOrgs.labelRegisteredAtView') }}</p><p class="text-[#1e293b] font-medium">{{ viewingOrg.registeredAt }}</p></div>
                <div><p class="text-[#94a3b8]">{{ $t('adminOrgs.labelPhoneView') }}</p><p class="text-[#1e293b] font-medium">{{ viewingOrg.phone }}</p></div>
                <div><p class="text-[#94a3b8]">{{ $t('adminOrgs.labelEmailView') }}</p><p class="text-[#1e293b] font-medium">{{ viewingOrg.email }}</p></div>
              </div>
            </div>
            <div class="flex items-center justify-end gap-3 p-6 border-t border-[#f1f5f9]">
              <AppButton variant="outline" @click="showViewModal = false; openEditModal(viewingOrg!)">{{ $t('adminOrgs.btnEditView') }}</AppButton>
              <AppButton variant="primary" @click="showViewModal = false">{{ $t('adminOrgs.btnClose') }}</AppButton>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ===== DELETE CONFIRM ===== -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showDeleteConfirm && deletingOrg" class="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4" style="background:rgba(0,0,0,0.5);backdrop-filter:blur(4px);" @click="(e: MouseEvent) => handleOverlay(e, () => showDeleteConfirm = false)">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md text-center">
            <div class="p-8">
              <div class="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 class="text-xl font-bold text-[#1e293b] mb-2">{{ $t('adminOrgs.deleteTitle') }}</h3>
              <p class="text-[#64748b]">{{ $t('adminOrgs.deleteConfirmText') }} <span class="font-medium text-[#1e293b]">{{ deletingOrg.name }}</span>{{ $t('adminOrgs.deleteIrreversible') }}</p>
            </div>
            <div class="flex items-center justify-center gap-3 px-8 pb-8">
              <AppButton variant="secondary" class="flex-1" @click="showDeleteConfirm = false">{{ $t('adminOrgs.cancel') }}</AppButton>
              <AppButton variant="danger" class="flex-1" @click="deleteOrganization">{{ $t('adminOrgs.btnDelete') }}</AppButton>
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
</style>
