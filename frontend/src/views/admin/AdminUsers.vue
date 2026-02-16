<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import DataTable from '../../components/dashboard/DataTable.vue'
import EmptyState from '../../components/dashboard/EmptyState.vue'
import { icons } from '../../utils/menuIcons'

const menuItems = [
  { id: 'dashboard', label: 'Главная', icon: icons.dashboard, route: '/admin' },
  { id: 'users', label: 'Пользователи', icon: icons.users, route: '/admin/users' },
  { id: 'roles', label: 'Роли и права', icon: icons.shield, route: '/admin/roles' },
  { id: 'references', label: 'Справочники', icon: icons.registries, route: '/admin/references' },
  { id: 'audit', label: 'Журнал аудита', icon: icons.audit, route: '/admin/audit' },
  { id: 'notifications', label: 'Уведомления', icon: icons.notification, route: '/admin/notifications' },
  { id: 'settings', label: 'Настройки системы', icon: icons.settings, route: '/admin/settings' },
]

// --- Types ---
interface RoleHistoryEntry {
  date: string
  oldRole: string
  newRole: string
  changedBy: string
}

interface StatusHistoryEntry {
  date: string
  action: string
  changedBy: string
  reason: string
}

interface User {
  id: number
  name: string
  organization: string
  role: string
  status: string
  registeredAt: string
  email: string
  phone: string
  roleHistory: RoleHistoryEntry[]
  statusHistory: StatusHistoryEntry[]
}

// --- Columns ---
const columns = [
  { key: 'name', label: 'ФИО', width: '15%' },
  { key: 'organization', label: 'Организация', width: '15%' },
  { key: 'role', label: 'Роль', width: '12%' },
  { key: 'status', label: 'Статус', width: '10%' },
  { key: 'registeredAt', label: 'Дата регистрации', width: '10%' },
]

// --- Users data ---
let nextId = 9

const users = ref<User[]>([
  {
    id: 1, name: 'Асанов Бакыт Жумабекович', organization: 'ОсОО "ЭкоПереработка"',
    role: 'ГП «Эко Оператор»', status: 'Активен', registeredAt: '15.01.2025',
    email: 'asanov@eco.kg', phone: '+996 555 123 456',
    roleHistory: [
      { date: '15.01.2025', oldRole: '—', newRole: 'ГП «Эко Оператор»', changedBy: 'Система (регистрация)' },
    ],
    statusHistory: [
      { date: '15.01.2025', action: 'Активирован', changedBy: 'Система', reason: 'Регистрация подтверждена' },
    ],
  },
  {
    id: 2, name: 'Мамытова Айгуль Сапарбековна', organization: 'МПРЭТН КР',
    role: 'Сотрудник МПРЭТН КР', status: 'Активен', registeredAt: '10.01.2025',
    email: 'mamytova@mpretn.kg', phone: '+996 555 234 567',
    roleHistory: [
      { date: '10.01.2025', oldRole: '—', newRole: 'Сотрудник МПРЭТН КР', changedBy: 'Система (регистрация)' },
    ],
    statusHistory: [
      { date: '10.01.2025', action: 'Активирован', changedBy: 'Система', reason: 'Регистрация подтверждена' },
    ],
  },
  {
    id: 3, name: 'Токтогулов Эрлан Кубанычбекович', organization: 'ОсОО "КыргызИмпорт"',
    role: 'Плательщик', status: 'Активен', registeredAt: '05.01.2025',
    email: 'toktogul@kyrgyzimport.kg', phone: '+996 700 345 678',
    roleHistory: [
      { date: '05.01.2025', oldRole: '—', newRole: 'Плательщик', changedBy: 'Система (регистрация)' },
    ],
    statusHistory: [
      { date: '05.01.2025', action: 'Активирован', changedBy: 'Система', reason: 'Регистрация подтверждена' },
    ],
  },
  {
    id: 4, name: 'Сыдыков Нурбек Алмазович', organization: 'ОАО "ГринТех"',
    role: 'ГП «Эко Оператор»', status: 'Заблокирован', registeredAt: '28.12.2024',
    email: 'sydykov@greentech.kg', phone: '+996 770 456 789',
    roleHistory: [
      { date: '28.12.2024', oldRole: '—', newRole: 'ГП «Эко Оператор»', changedBy: 'Система (регистрация)' },
    ],
    statusHistory: [
      { date: '28.12.2024', action: 'Активирован', changedBy: 'Система', reason: 'Регистрация подтверждена' },
      { date: '15.01.2025', action: 'Заблокирован', changedBy: 'Иван Петров', reason: 'Нарушение правил' },
    ],
  },
  {
    id: 5, name: 'Жумабаева Динара Болотовна', organization: 'ИП Жумабаева',
    role: 'Плательщик', status: 'Активен', registeredAt: '20.12.2024',
    email: 'jumabaeva@mail.kg', phone: '+996 550 567 890',
    roleHistory: [
      { date: '20.12.2024', oldRole: '—', newRole: 'Плательщик', changedBy: 'Система (регистрация)' },
    ],
    statusHistory: [
      { date: '20.12.2024', action: 'Активирован', changedBy: 'Система', reason: 'Регистрация подтверждена' },
    ],
  },
  {
    id: 6, name: 'Кадыров Улан Маратович', organization: 'ОсОО "ТрансЛогистик"',
    role: 'Плательщик', status: 'Ожидает подтверждения', registeredAt: '18.12.2024',
    email: 'kadyrov@translog.kg', phone: '+996 555 678 901',
    roleHistory: [],
    statusHistory: [
      { date: '18.12.2024', action: 'Зарегистрирован', changedBy: 'Система', reason: 'Ожидает подтверждения администратором' },
    ],
  },
  {
    id: 7, name: 'Исаков Тимур Бакирович', organization: 'МПРЭТН КР',
    role: 'Сотрудник МПРЭТН КР', status: 'Деактивирован', registeredAt: '01.06.2024',
    email: 'isakov@mpretn.kg', phone: '+996 700 789 012',
    roleHistory: [
      { date: '01.06.2024', oldRole: '—', newRole: 'Сотрудник МПРЭТН КР', changedBy: 'Система (регистрация)' },
    ],
    statusHistory: [
      { date: '01.06.2024', action: 'Активирован', changedBy: 'Система', reason: 'Регистрация подтверждена' },
      { date: '10.12.2024', action: 'Деактивирован', changedBy: 'Иван Петров', reason: 'Увольнение' },
    ],
  },
  {
    id: 8, name: 'Бейшеналиева Гулнур Маратовна', organization: 'ОсОО "ЭкоСервис"',
    role: 'Плательщик', status: 'Деактивирован', registeredAt: '15.03.2024',
    email: 'beishenalieva@ecoservice.kg', phone: '+996 550 890 123',
    roleHistory: [
      { date: '15.03.2024', oldRole: '—', newRole: 'Плательщик', changedBy: 'Система (регистрация)' },
    ],
    statusHistory: [
      { date: '15.03.2024', action: 'Активирован', changedBy: 'Система', reason: 'Регистрация подтверждена' },
      { date: '20.11.2024', action: 'Деактивирован', changedBy: 'Иван Петров', reason: 'Увольнение' },
    ],
  },
])

// --- Status helpers ---
const getStatusClass = (status: string) => {
  switch (status) {
    case 'Активен': return 'bg-green-100 text-green-800'
    case 'Временно заблокирован': return 'bg-orange-100 text-orange-800'
    case 'Заблокирован': return 'bg-red-100 text-red-800'
    case 'Ожидает подтверждения': return 'bg-yellow-100 text-yellow-800'
    case 'Деактивирован': return 'bg-gray-200 text-gray-500'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getRowClass = (row: Record<string, any>) => {
  return row.status === 'Деактивирован' ? 'opacity-60' : ''
}

// --- Filters ---
const searchQuery = ref('')
const filterRole = ref('')
const filterStatus = ref('')

const filteredUsers = computed(() => {
  let result = users.value
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(u => u.name.toLowerCase().includes(q) || u.organization.toLowerCase().includes(q))
  }
  if (filterRole.value) {
    result = result.filter(u => u.role === filterRole.value)
  }
  if (filterStatus.value) {
    result = result.filter(u => u.status === filterStatus.value)
  }
  return result
})

// --- Modal state ---
type ModalType = 'none' | 'addUser' | 'viewUser' | 'changeRole' | 'blockUser' | 'unblockUser' | 'restoreUser' | 'deleteUser'
const activeModal = ref<ModalType>('none')
const selectedUser = ref<User | null>(null)

function closeModal() {
  activeModal.value = 'none'
}

function handleOverlayClick(e: MouseEvent) {
  if ((e.target as HTMLElement).classList.contains('modal-overlay')) {
    closeModal()
  }
}

// --- View user ---
function openViewUser(user: User) {
  selectedUser.value = user
  activeModal.value = 'viewUser'
}

// --- Change role ---
const changeRoleForm = reactive({ newRole: '', reason: '' })
const roleOptions = ['Плательщик', 'Сотрудник МПРЭТН КР', 'ГП «Эко Оператор»', 'Администратор']

function openChangeRole(user: User) {
  selectedUser.value = user
  changeRoleForm.newRole = ''
  changeRoleForm.reason = ''
  activeModal.value = 'changeRole'
}

function submitChangeRole() {
  if (!selectedUser.value || !changeRoleForm.newRole || !changeRoleForm.reason.trim()) return
  const user = users.value.find(u => u.id === selectedUser.value!.id)
  if (!user) return
  const oldRole = user.role
  user.roleHistory.push({
    date: formatDate(new Date()),
    oldRole,
    newRole: changeRoleForm.newRole,
    changedBy: 'Иван Петров (Администратор)',
  })
  user.role = changeRoleForm.newRole
  activeModal.value = 'none'
}

// --- Block user ---
const blockReasons = ['Увольнение', 'Перевод на другую должность', 'Нарушение правил', 'Другое']
const blockDurations = ['1 неделя', '1 месяц', '3 месяца', '6 месяцев', 'До ручной разблокировки']
const blockForm = reactive({ reason: '', customReason: '', blockType: 'temporary' as 'temporary' | 'permanent', duration: '' })

function openBlockUser(user: User) {
  selectedUser.value = user
  blockForm.reason = ''
  blockForm.customReason = ''
  blockForm.blockType = 'temporary'
  blockForm.duration = ''
  activeModal.value = 'blockUser'
}

const blockReasonText = computed(() => blockForm.reason === 'Другое' ? blockForm.customReason.trim() : blockForm.reason)

const isBlockFormValid = computed(() => {
  if (!blockReasonText.value) return false
  if (blockForm.blockType === 'temporary' && !blockForm.duration) return false
  return true
})

function submitBlockUser() {
  if (!selectedUser.value || !isBlockFormValid.value) return
  const user = users.value.find(u => u.id === selectedUser.value!.id)
  if (!user) return
  const newStatus = blockForm.blockType === 'temporary' ? 'Временно заблокирован' : 'Заблокирован'
  const durationSuffix = blockForm.blockType === 'temporary' ? ` (${blockForm.duration})` : ''
  user.statusHistory.push({
    date: formatDate(new Date()),
    action: newStatus,
    changedBy: 'Иван Петров (Администратор)',
    reason: blockReasonText.value + durationSuffix,
  })
  user.status = newStatus
  activeModal.value = 'none'
}

// --- Unblock user ---
function openUnblockUser(user: User) {
  selectedUser.value = user
  activeModal.value = 'unblockUser'
}

function submitUnblockUser() {
  if (!selectedUser.value) return
  const user = users.value.find(u => u.id === selectedUser.value!.id)
  if (!user) return
  user.statusHistory.push({
    date: formatDate(new Date()),
    action: 'Разблокирован',
    changedBy: 'Иван Петров (Администратор)',
    reason: '',
  })
  user.status = 'Активен'
  activeModal.value = 'none'
}

// --- Restore user ---
function openRestoreUser(user: User) {
  selectedUser.value = user
  activeModal.value = 'restoreUser'
}

function submitRestoreUser() {
  if (!selectedUser.value) return
  const user = users.value.find(u => u.id === selectedUser.value!.id)
  if (!user) return
  user.statusHistory.push({
    date: formatDate(new Date()),
    action: 'Восстановлен',
    changedBy: 'Иван Петров (Администратор)',
    reason: '',
  })
  user.status = 'Активен'
  activeModal.value = 'none'
}

// --- Delete user ---
const deleteConfirmText = ref('')

function openDeleteUser(user: User) {
  selectedUser.value = user
  deleteConfirmText.value = ''
  activeModal.value = 'deleteUser'
}

function submitDeleteUser() {
  if (!selectedUser.value || deleteConfirmText.value !== 'УДАЛИТЬ') return
  users.value = users.value.filter(u => u.id !== selectedUser.value!.id)
  activeModal.value = 'none'
}

// --- Add user (existing functionality, adapted) ---
const addUserStep = ref<'form' | 'confirm' | 'success'>('form')

interface AddUserFormData {
  lastName: string
  firstName: string
  middleName: string
  organization: string
  role: string
  email: string
  phone: string
}

const addUserForm = reactive<AddUserFormData>({
  lastName: '', firstName: '', middleName: '', organization: '', role: '', email: '', phone: '',
})

const addUserErrors = reactive<Record<string, string>>({})

const rolePermissions: Record<string, { label: string; permissions: string[]; restrictions: string[] }> = {
  'Сотрудник МПРЭТН КР': {
    label: 'Сотрудник МПРЭТН КР',
    permissions: ['Просмотр заявок и лицензий', 'Работа с реестром переработчиков', 'Просмотр аналитики'],
    restrictions: ['Нет доступа к декларациям организаций', 'Нет доступа к финансовым данным'],
  },
  'ГП «Эко Оператор»': {
    label: 'ГП «Эко Оператор»',
    permissions: ['Работа с отчётами и декларациями', 'Управление расчётами', 'Формирование сводных отчётов'],
    restrictions: ['Нет доступа к ГИС-карте', 'Нет доступа к реестру полигонов'],
  },
  'Плательщик': {
    label: 'Плательщик',
    permissions: ['Подача деклараций', 'Просмотр собственных отчётов', 'Управление профилем организации'],
    restrictions: ['Ограниченный функционал', 'Доступ только к собственным данным'],
  },
  'Администратор': {
    label: 'Администратор',
    permissions: ['Полный доступ ко всем разделам', 'Управление пользователями', 'Настройки системы'],
    restrictions: [],
  },
}

const selectedAddRoleInfo = computed(() => addUserForm.role ? rolePermissions[addUserForm.role] : null)

function validateAddField(field: keyof AddUserFormData) {
  delete addUserErrors[field]
  switch (field) {
    case 'lastName':
      if (!addUserForm.lastName.trim()) addUserErrors.lastName = 'Введите фамилию'
      else if (addUserForm.lastName.trim().length < 2) addUserErrors.lastName = 'Минимум 2 символа'
      break
    case 'firstName':
      if (!addUserForm.firstName.trim()) addUserErrors.firstName = 'Введите имя'
      else if (addUserForm.firstName.trim().length < 2) addUserErrors.firstName = 'Минимум 2 символа'
      break
    case 'organization':
      if (!addUserForm.organization.trim()) addUserErrors.organization = 'Введите организацию'
      break
    case 'role':
      if (!addUserForm.role) addUserErrors.role = 'Выберите роль'
      break
    case 'email':
      if (!addUserForm.email.trim()) addUserErrors.email = 'Введите email'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addUserForm.email.trim())) addUserErrors.email = 'Некорректный формат email'
      break
    case 'phone':
      if (!addUserForm.phone.trim()) addUserErrors.phone = 'Введите номер телефона'
      else if (!/^\+?[\d\s\-()]{7,18}$/.test(addUserForm.phone.trim())) addUserErrors.phone = 'Некорректный формат телефона'
      break
  }
}

function validateAddAll(): boolean {
  const fields: (keyof AddUserFormData)[] = ['lastName', 'firstName', 'organization', 'role', 'email', 'phone']
  fields.forEach(validateAddField)
  return Object.keys(addUserErrors).length === 0
}

const isAddFormValid = computed(() => {
  return addUserForm.lastName.trim() && addUserForm.firstName.trim() && addUserForm.organization.trim()
    && addUserForm.role && addUserForm.email.trim() && addUserForm.phone.trim()
})

function openAddUser() {
  Object.assign(addUserForm, { lastName: '', firstName: '', middleName: '', organization: '', role: '', email: '', phone: '' })
  Object.keys(addUserErrors).forEach(k => delete addUserErrors[k])
  addUserStep.value = 'form'
  activeModal.value = 'addUser'
}

function goToAddConfirm() {
  if (!validateAddAll()) return
  addUserStep.value = 'confirm'
}

function goBackToAddForm() {
  addUserStep.value = 'form'
}

function submitAddUser() {
  const fullName = [addUserForm.lastName, addUserForm.firstName, addUserForm.middleName].filter(Boolean).join(' ')
  const newUser: User = {
    id: nextId++,
    name: fullName,
    organization: addUserForm.organization.trim(),
    role: addUserForm.role,
    status: 'Ожидает подтверждения',
    registeredAt: formatDate(new Date()),
    email: addUserForm.email.trim(),
    phone: addUserForm.phone.trim(),
    roleHistory: [],
    statusHistory: [
      { date: formatDate(new Date()), action: 'Зарегистрирован', changedBy: 'Иван Петров (Администратор)', reason: 'Создан администратором' },
    ],
  }
  users.value.unshift(newUser)
  addUserStep.value = 'success'
}

// --- Helpers ---
function formatDate(date: Date): string {
  const d = date.getDate().toString().padStart(2, '0')
  const m = (date.getMonth() + 1).toString().padStart(2, '0')
  const y = date.getFullYear()
  return `${d}.${m}.${y}`
}

watch(() => addUserForm.phone, (val, oldVal) => {
  if (val && !val.startsWith('+') && val.length === 1 && !oldVal) {
    addUserForm.phone = '+996 ' + val
  }
})

// Empty state helpers
const isFiltersActive = computed(() => !!(searchQuery.value || filterRole.value || filterStatus.value))

const resetUserFilters = () => {
  searchQuery.value = ''
  filterRole.value = ''
  filterStatus.value = ''
}
</script>

<template>
  <DashboardLayout
    role="admin"
    roleTitle="Администратор"
    userName="Иван Петров"
    :menuItems="menuItems"
  >
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <h2 class="text-2xl font-bold text-[#415861]">Пользователи</h2>
      <button
        @click="openAddUser"
        class="flex items-center gap-2 bg-[#0e888d] text-white px-5 py-3 rounded-xl font-medium hover:bg-[#0a6d71] transition-colors"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Добавить пользователя
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-2xl p-4 shadow-sm border border-[#e5e7eb] mb-6">
      <div class="flex flex-wrap gap-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Поиск по ФИО или организации..."
          class="flex-1 min-w-[200px] px-4 py-2 border border-[#e5e7eb] rounded-lg focus:outline-none focus:border-[#0e888d]"
        />
        <select v-model="filterRole" class="px-4 py-2 border border-[#e5e7eb] rounded-lg focus:outline-none focus:border-[#0e888d]">
          <option value="">Все роли</option>
          <option value="Администратор">Администратор</option>
          <option value="Сотрудник МПРЭТН КР">Сотрудник МПРЭТН КР</option>
          <option value="ГП «Эко Оператор»">ГП «Эко Оператор»</option>
          <option value="Плательщик">Плательщик</option>
        </select>
        <select v-model="filterStatus" class="px-4 py-2 border border-[#e5e7eb] rounded-lg focus:outline-none focus:border-[#0e888d]">
          <option value="">Все статусы</option>
          <option value="Активен">Активен</option>
          <option value="Ожидает подтверждения">Ожидает подтверждения</option>
          <option value="Временно заблокирован">Временно заблокирован</option>
          <option value="Заблокирован">Заблокирован</option>
          <option value="Деактивирован">Деактивирован</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <DataTable :columns="columns" :data="filteredUsers" :actions="true" :rowClass="getRowClass">
      <template #cell-status="{ value }">
        <span :class="['px-3 py-1 rounded-full text-xs font-medium', getStatusClass(value)]">
          {{ value }}
        </span>
      </template>
      <template #actions="{ row }">
        <div class="flex items-center justify-end gap-2">
          <!-- Просмотреть (green) — always -->
          <button @click="openViewUser(row)" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#10B981] text-white hover:bg-[#059669] transition-colors shadow-sm">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            Просмотреть
          </button>
          <!-- Роль (blue) — not for deactivated -->
          <button v-if="row.status !== 'Деактивирован'" @click="openChangeRole(row)" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#3B82F6] text-white hover:bg-[#2563EB] transition-colors shadow-sm">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Роль
          </button>
          <!-- Заблокировать (orange) — for active / pending -->
          <button v-if="row.status === 'Активен' || row.status === 'Ожидает подтверждения'" @click="openBlockUser(row)" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#F59E0B] text-white hover:bg-[#D97706] transition-colors shadow-sm">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
            Заблокировать
          </button>
          <!-- Разблокировать — for blocked or temporarily blocked -->
          <button v-if="row.status === 'Заблокирован' || row.status === 'Временно заблокирован'" @click="openUnblockUser(row)" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#10B981] text-white hover:bg-[#059669] transition-colors shadow-sm">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Разблокировать
          </button>
          <!-- Восстановить — for deactivated -->
          <button v-if="row.status === 'Деактивирован'" @click="openRestoreUser(row)" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#10B981] text-white hover:bg-[#059669] transition-colors shadow-sm">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            Восстановить
          </button>
          <!-- Удалить (red, trash icon) — always -->
          <button @click="openDeleteUser(row)" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#EF4444] text-white hover:bg-[#DC2626] transition-colors shadow-sm">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            Удалить
          </button>
        </div>
      </template>
      <template #empty>
        <EmptyState
          v-if="isFiltersActive && users.length > 0"
          icon='<svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>'
          title="Ничего не найдено"
          description="Попробуйте изменить параметры поиска"
          actionLabel="Сбросить фильтры"
          @action="resetUserFilters"
        />
        <EmptyState
          v-else
          icon='<svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>'
          title="Нет пользователей"
          description="Пользователи появятся после регистрации"
        />
      </template>
    </DataTable>

    <!-- ==================== MODALS ==================== -->
    <Teleport to="body">
      <!-- ===== VIEW USER ===== -->
      <div
        v-if="activeModal === 'viewUser' && selectedUser"
        class="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
        style="background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);"
        @click="handleOverlayClick"
      >
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between p-6 border-b border-[#f1f5f9]">
            <h3 class="text-xl font-bold text-[#415861]">Информация о пользователе</h3>
            <button @click="closeModal" class="p-2 text-[#94a3b8] hover:text-[#415861] hover:bg-[#f1f5f9] rounded-lg transition-colors">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div class="p-6 space-y-6">
            <!-- User info -->
            <div class="bg-[#f8fafc] rounded-xl p-5">
              <div class="flex items-center gap-4 mb-4">
                <div class="w-14 h-14 rounded-full bg-[#0e888d] flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                  {{ selectedUser.name.split(' ').slice(0, 2).map((n: string) => n[0]).join('') }}
                </div>
                <div>
                  <p class="text-lg font-bold text-[#415861]">{{ selectedUser.name }}</p>
                  <p class="text-sm text-[#64748b]">{{ selectedUser.organization }}</p>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p class="text-[#94a3b8] mb-0.5">Роль</p>
                  <p class="font-medium text-[#415861]">{{ selectedUser.role }}</p>
                </div>
                <div>
                  <p class="text-[#94a3b8] mb-0.5">Статус</p>
                  <span :class="['inline-block px-3 py-0.5 rounded-full text-xs font-medium', getStatusClass(selectedUser.status)]">{{ selectedUser.status }}</span>
                </div>
                <div>
                  <p class="text-[#94a3b8] mb-0.5">Дата регистрации</p>
                  <p class="font-medium text-[#415861]">{{ selectedUser.registeredAt }}</p>
                </div>
                <div>
                  <p class="text-[#94a3b8] mb-0.5">Email</p>
                  <p class="font-medium text-[#415861]">{{ selectedUser.email }}</p>
                </div>
                <div>
                  <p class="text-[#94a3b8] mb-0.5">Телефон</p>
                  <p class="font-medium text-[#415861]">{{ selectedUser.phone }}</p>
                </div>
              </div>
            </div>

            <!-- Role history -->
            <div>
              <h4 class="text-sm font-semibold text-[#415861] uppercase tracking-wide mb-3">История изменений роли</h4>
              <div v-if="selectedUser.roleHistory.length" class="border border-[#e5e7eb] rounded-xl overflow-hidden">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="bg-[#f8fafc]">
                      <th class="px-4 py-2.5 text-left font-medium text-[#64748b]">Дата</th>
                      <th class="px-4 py-2.5 text-left font-medium text-[#64748b]">Изменение</th>
                      <th class="px-4 py-2.5 text-left font-medium text-[#64748b]">Кем изменено</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(entry, i) in selectedUser.roleHistory" :key="i" class="border-t border-[#f1f5f9]">
                      <td class="px-4 py-2.5 text-[#415861] whitespace-nowrap">{{ entry.date }}</td>
                      <td class="px-4 py-2.5 text-[#415861]">{{ entry.oldRole }} &rarr; {{ entry.newRole }}</td>
                      <td class="px-4 py-2.5 text-[#64748b]">{{ entry.changedBy }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p v-else class="text-sm text-[#94a3b8]">Нет записей</p>
            </div>

            <!-- Status history -->
            <div>
              <h4 class="text-sm font-semibold text-[#415861] uppercase tracking-wide mb-3">История статусов</h4>
              <div v-if="selectedUser.statusHistory.length" class="border border-[#e5e7eb] rounded-xl overflow-hidden">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="bg-[#f8fafc]">
                      <th class="px-4 py-2.5 text-left font-medium text-[#64748b]">Дата</th>
                      <th class="px-4 py-2.5 text-left font-medium text-[#64748b]">Действие</th>
                      <th class="px-4 py-2.5 text-left font-medium text-[#64748b]">Кем</th>
                      <th class="px-4 py-2.5 text-left font-medium text-[#64748b]">Причина</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(entry, i) in selectedUser.statusHistory" :key="i" class="border-t border-[#f1f5f9]">
                      <td class="px-4 py-2.5 text-[#415861] whitespace-nowrap">{{ entry.date }}</td>
                      <td class="px-4 py-2.5">
                        <span :class="[
                          'px-2 py-0.5 rounded-full text-xs font-medium',
                          entry.action === 'Активирован' || entry.action === 'Разблокирован' || entry.action === 'Восстановлен' ? 'bg-green-100 text-green-800' :
                          entry.action === 'Временно заблокирован' ? 'bg-orange-100 text-orange-800' :
                          entry.action === 'Заблокирован' ? 'bg-red-100 text-red-800' :
                          entry.action === 'Деактивирован' ? 'bg-gray-200 text-gray-500' :
                          'bg-yellow-100 text-yellow-800'
                        ]">{{ entry.action }}</span>
                      </td>
                      <td class="px-4 py-2.5 text-[#64748b]">{{ entry.changedBy }}</td>
                      <td class="px-4 py-2.5 text-[#64748b]">{{ entry.reason || '—' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p v-else class="text-sm text-[#94a3b8]">Нет записей</p>
            </div>
          </div>

          <div class="flex justify-end p-6 border-t border-[#f1f5f9]">
            <button @click="closeModal" class="px-5 py-2.5 bg-[#0e888d] text-white rounded-xl font-medium hover:bg-[#0a6d71] transition-colors">
              Закрыть
            </button>
          </div>
        </div>
      </div>

      <!-- ===== CHANGE ROLE ===== -->
      <div
        v-if="activeModal === 'changeRole' && selectedUser"
        class="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
        style="background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);"
        @click="handleOverlayClick"
      >
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md">
          <div class="flex items-center justify-between p-6 border-b border-[#f1f5f9]">
            <h3 class="text-xl font-bold text-[#415861]">Изменить роль пользователя</h3>
            <button @click="closeModal" class="p-2 text-[#94a3b8] hover:text-[#415861] hover:bg-[#f1f5f9] rounded-lg transition-colors">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div class="p-6 space-y-4">
            <p class="text-sm text-[#415861]">Пользователь: <span class="font-semibold">{{ selectedUser.name }}</span></p>
            <div>
              <label class="block text-sm font-medium text-[#415861] mb-1.5">Текущая роль</label>
              <div class="w-full px-4 py-2.5 bg-[#f8fafc] border border-[#e5e7eb] rounded-xl text-[#94a3b8]">{{ selectedUser.role }}</div>
            </div>
            <div>
              <label class="block text-sm font-medium text-[#415861] mb-1.5">Новая роль <span class="text-red-500">*</span></label>
              <select v-model="changeRoleForm.newRole" class="w-full px-4 py-2.5 border border-[#e5e7eb] rounded-xl focus:outline-none focus:border-[#0e888d]">
                <option value="" disabled>Выберите роль</option>
                <option v-for="r in roleOptions" :key="r" :value="r" :disabled="r === selectedUser.role">{{ r }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-[#415861] mb-1.5">Причина изменения <span class="text-red-500">*</span></label>
              <textarea
                v-model="changeRoleForm.reason"
                rows="3"
                placeholder="Укажите причину изменения роли..."
                class="w-full px-4 py-2.5 border border-[#e5e7eb] rounded-xl focus:outline-none focus:border-[#0e888d] resize-none"
              ></textarea>
            </div>
          </div>
          <div class="flex items-center justify-end gap-3 p-6 border-t border-[#f1f5f9]">
            <button @click="closeModal" class="px-5 py-2.5 text-[#64748b] border border-[#e5e7eb] rounded-xl font-medium hover:bg-[#f8fafc] transition-colors">
              Отмена
            </button>
            <button
              @click="submitChangeRole"
              :disabled="!changeRoleForm.newRole || !changeRoleForm.reason.trim()"
              :class="[
                'px-5 py-2.5 rounded-xl font-medium transition-colors',
                changeRoleForm.newRole && changeRoleForm.reason.trim()
                  ? 'bg-[#0e888d] text-white hover:bg-[#0a6d71]'
                  : 'bg-[#e5e7eb] text-[#94a3b8] cursor-not-allowed'
              ]"
            >
              Сохранить
            </button>
          </div>
        </div>
      </div>

      <!-- ===== BLOCK USER ===== -->
      <div
        v-if="activeModal === 'blockUser' && selectedUser"
        class="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
        style="background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);"
        @click="handleOverlayClick"
      >
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between p-6 border-b border-[#f1f5f9]">
            <h3 class="text-xl font-bold text-[#415861]">Блокировка пользователя</h3>
            <button @click="closeModal" class="p-2 text-[#94a3b8] hover:text-[#415861] hover:bg-[#f1f5f9] rounded-lg transition-colors">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div class="p-6 space-y-4">
            <div class="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <p class="text-sm text-[#415861]">Вы уверены что хотите заблокировать пользователя <span class="font-semibold">{{ selectedUser.name }}</span>?</p>
            </div>

            <!-- Block type -->
            <div>
              <label class="block text-sm font-medium text-[#415861] mb-2">Тип блокировки</label>
              <div class="space-y-2">
                <label class="flex items-start gap-3 p-3 rounded-xl border cursor-pointer select-none transition-colors"
                  :class="blockForm.blockType === 'temporary' ? 'border-[#F59E0B] bg-orange-50/50' : 'border-[#e5e7eb] hover:bg-[#f8fafc]'"
                >
                  <input v-model="blockForm.blockType" type="radio" value="temporary" class="mt-0.5 w-4 h-4 text-[#F59E0B] focus:ring-[#F59E0B]" />
                  <div>
                    <p class="text-sm font-medium text-[#415861]">Временно заблокировать</p>
                    <p class="text-xs text-[#94a3b8] mt-0.5">Пользователь не может войти, но учётная запись сохраняется и может быть разблокирована в любой момент</p>
                  </div>
                </label>
                <label class="flex items-start gap-3 p-3 rounded-xl border cursor-pointer select-none transition-colors"
                  :class="blockForm.blockType === 'permanent' ? 'border-[#EF4444] bg-red-50/50' : 'border-[#e5e7eb] hover:bg-[#f8fafc]'"
                >
                  <input v-model="blockForm.blockType" type="radio" value="permanent" class="mt-0.5 w-4 h-4 text-[#EF4444] focus:ring-[#EF4444]" />
                  <div>
                    <p class="text-sm font-medium text-[#415861]">Заблокировать навсегда</p>
                    <p class="text-xs text-[#94a3b8] mt-0.5">Полная блокировка без возможности входа. Разблокировка только администратором</p>
                  </div>
                </label>
              </div>
            </div>

            <!-- Duration (only for temporary) -->
            <div v-if="blockForm.blockType === 'temporary'">
              <label class="block text-sm font-medium text-[#415861] mb-1.5">Срок блокировки <span class="text-red-500">*</span></label>
              <select v-model="blockForm.duration" class="w-full px-4 py-2.5 border border-[#e5e7eb] rounded-xl focus:outline-none focus:border-[#0e888d]">
                <option value="" disabled>Выберите срок</option>
                <option v-for="d in blockDurations" :key="d" :value="d">{{ d }}</option>
              </select>
            </div>

            <!-- Reason -->
            <div>
              <label class="block text-sm font-medium text-[#415861] mb-1.5">Причина блокировки <span class="text-red-500">*</span></label>
              <select v-model="blockForm.reason" class="w-full px-4 py-2.5 border border-[#e5e7eb] rounded-xl focus:outline-none focus:border-[#0e888d]">
                <option value="" disabled>Выберите причину</option>
                <option v-for="r in blockReasons" :key="r" :value="r">{{ r }}</option>
              </select>
            </div>
            <div v-if="blockForm.reason === 'Другое'">
              <label class="block text-sm font-medium text-[#415861] mb-1.5">Укажите причину <span class="text-red-500">*</span></label>
              <textarea
                v-model="blockForm.customReason"
                rows="2"
                placeholder="Опишите причину блокировки..."
                class="w-full px-4 py-2.5 border border-[#e5e7eb] rounded-xl focus:outline-none focus:border-[#0e888d] resize-none"
              ></textarea>
            </div>
          </div>
          <div class="flex items-center justify-end gap-3 p-6 border-t border-[#f1f5f9]">
            <button @click="closeModal" class="px-5 py-2.5 text-[#64748b] border border-[#e5e7eb] rounded-xl font-medium hover:bg-[#f8fafc] transition-colors">
              Отмена
            </button>
            <button
              @click="submitBlockUser"
              :disabled="!isBlockFormValid"
              :class="[
                'px-5 py-2.5 rounded-xl font-medium transition-colors',
                isBlockFormValid
                  ? blockForm.blockType === 'permanent' ? 'bg-[#EF4444] text-white hover:bg-[#DC2626]' : 'bg-[#F59E0B] text-white hover:bg-[#D97706]'
                  : 'bg-[#e5e7eb] text-[#94a3b8] cursor-not-allowed'
              ]"
            >
              {{ blockForm.blockType === 'permanent' ? 'Заблокировать навсегда' : 'Временно заблокировать' }}
            </button>
          </div>
        </div>
      </div>

      <!-- ===== UNBLOCK USER ===== -->
      <div
        v-if="activeModal === 'unblockUser' && selectedUser"
        class="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
        style="background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);"
        @click="handleOverlayClick"
      >
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md">
          <div class="flex items-center justify-between p-6 border-b border-[#f1f5f9]">
            <h3 class="text-xl font-bold text-[#415861]">Разблокировка пользователя</h3>
            <button @click="closeModal" class="p-2 text-[#94a3b8] hover:text-[#415861] hover:bg-[#f1f5f9] rounded-lg transition-colors">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div class="p-6">
            <div class="bg-green-50 border border-green-200 rounded-xl p-4">
              <p class="text-sm text-[#415861]">Разблокировать пользователя <span class="font-semibold">{{ selectedUser.name }}</span>?</p>
              <p class="text-xs text-[#64748b] mt-1">Пользователь снова получит доступ к системе.</p>
            </div>
          </div>
          <div class="flex items-center justify-end gap-3 p-6 border-t border-[#f1f5f9]">
            <button @click="closeModal" class="px-5 py-2.5 text-[#64748b] border border-[#e5e7eb] rounded-xl font-medium hover:bg-[#f8fafc] transition-colors">
              Отмена
            </button>
            <button @click="submitUnblockUser" class="px-5 py-2.5 bg-[#10B981] text-white rounded-xl font-medium hover:bg-[#059669] transition-colors">
              Разблокировать
            </button>
          </div>
        </div>
      </div>

      <!-- ===== RESTORE USER ===== -->
      <div
        v-if="activeModal === 'restoreUser' && selectedUser"
        class="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
        style="background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);"
        @click="handleOverlayClick"
      >
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md">
          <div class="flex items-center justify-between p-6 border-b border-[#f1f5f9]">
            <h3 class="text-xl font-bold text-[#415861]">Восстановление пользователя</h3>
            <button @click="closeModal" class="p-2 text-[#94a3b8] hover:text-[#415861] hover:bg-[#f1f5f9] rounded-lg transition-colors">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div class="p-6">
            <div class="bg-green-50 border border-green-200 rounded-xl p-4">
              <p class="text-sm text-[#415861]">Восстановить деактивированную учётную запись пользователя <span class="font-semibold">{{ selectedUser.name }}</span>?</p>
              <p class="text-xs text-[#64748b] mt-1">Пользователь снова получит доступ к системе со статусом «Активен».</p>
            </div>
          </div>
          <div class="flex items-center justify-end gap-3 p-6 border-t border-[#f1f5f9]">
            <button @click="closeModal" class="px-5 py-2.5 text-[#64748b] border border-[#e5e7eb] rounded-xl font-medium hover:bg-[#f8fafc] transition-colors">
              Отмена
            </button>
            <button @click="submitRestoreUser" class="px-5 py-2.5 bg-[#10B981] text-white rounded-xl font-medium hover:bg-[#059669] transition-colors">
              Восстановить
            </button>
          </div>
        </div>
      </div>

      <!-- ===== DELETE USER ===== -->
      <div
        v-if="activeModal === 'deleteUser' && selectedUser"
        class="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
        style="background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);"
        @click="handleOverlayClick"
      >
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md">
          <div class="flex items-center justify-between p-6 border-b border-[#f1f5f9]">
            <h3 class="text-xl font-bold text-[#EF4444]">Удаление пользователя</h3>
            <button @click="closeModal" class="p-2 text-[#94a3b8] hover:text-[#415861] hover:bg-[#f1f5f9] rounded-lg transition-colors">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div class="p-6 space-y-4">
            <div class="bg-red-50 border border-red-200 rounded-xl p-4">
              <div class="flex items-start gap-3">
                <svg class="w-6 h-6 text-[#EF4444] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                <div>
                  <p class="font-semibold text-[#415861] mb-1">Вы уверены что хотите удалить пользователя {{ selectedUser.name }}?</p>
                  <p class="text-sm text-[#64748b]">Это действие необратимо. Все данные пользователя будут удалены.</p>
                </div>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-[#415861] mb-1.5">Для подтверждения введите <span class="font-mono font-bold text-[#EF4444]">УДАЛИТЬ</span></label>
              <input
                v-model="deleteConfirmText"
                type="text"
                placeholder="УДАЛИТЬ"
                class="w-full px-4 py-2.5 border border-[#e5e7eb] rounded-xl focus:outline-none focus:border-[#EF4444]"
              />
            </div>
          </div>
          <div class="flex items-center justify-end gap-3 p-6 border-t border-[#f1f5f9]">
            <button @click="closeModal" class="px-5 py-2.5 text-[#64748b] border border-[#e5e7eb] rounded-xl font-medium hover:bg-[#f8fafc] transition-colors">
              Отмена
            </button>
            <button
              @click="submitDeleteUser"
              :disabled="deleteConfirmText !== 'УДАЛИТЬ'"
              :class="[
                'px-5 py-2.5 rounded-xl font-medium transition-colors',
                deleteConfirmText === 'УДАЛИТЬ'
                  ? 'bg-[#EF4444] text-white hover:bg-[#DC2626]'
                  : 'bg-[#e5e7eb] text-[#94a3b8] cursor-not-allowed'
              ]"
            >
              Удалить навсегда
            </button>
          </div>
        </div>
      </div>

      <!-- ===== ADD USER (3-step wizard) ===== -->
      <Transition name="modal-fade">
        <div
          v-if="activeModal === 'addUser'"
          class="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
          style="background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);"
          @click="handleOverlayClick"
        >
          <Transition name="modal-scale" mode="out-in">
            <!-- STEP 1: Form -->
            <div v-if="addUserStep === 'form'" key="form" class="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div class="flex items-center justify-between p-6 border-b border-[#f1f5f9]">
                <div>
                  <h3 class="text-xl font-bold text-[#415861]">Добавить пользователя</h3>
                  <p class="text-sm text-[#64748b] mt-1">Заполните данные нового пользователя системы</p>
                </div>
                <button @click="closeModal" class="p-2 text-[#94a3b8] hover:text-[#415861] hover:bg-[#f1f5f9] rounded-lg transition-colors">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div class="p-6 space-y-4">
                <!-- Фамилия -->
                <div>
                  <label class="block text-sm font-medium text-[#415861] mb-1.5">Фамилия <span class="text-red-500">*</span></label>
                  <input v-model="addUserForm.lastName" @blur="validateAddField('lastName')" type="text" placeholder="Введите фамилию"
                    :class="['w-full px-4 py-2.5 border rounded-xl focus:outline-none transition-colors', addUserErrors.lastName ? 'border-red-400 focus:border-red-500 bg-red-50/50' : 'border-[#e5e7eb] focus:border-[#0e888d]']"
                  />
                  <p v-if="addUserErrors.lastName" class="mt-1 text-xs text-red-500">{{ addUserErrors.lastName }}</p>
                </div>
                <!-- Имя -->
                <div>
                  <label class="block text-sm font-medium text-[#415861] mb-1.5">Имя <span class="text-red-500">*</span></label>
                  <input v-model="addUserForm.firstName" @blur="validateAddField('firstName')" type="text" placeholder="Введите имя"
                    :class="['w-full px-4 py-2.5 border rounded-xl focus:outline-none transition-colors', addUserErrors.firstName ? 'border-red-400 focus:border-red-500 bg-red-50/50' : 'border-[#e5e7eb] focus:border-[#0e888d]']"
                  />
                  <p v-if="addUserErrors.firstName" class="mt-1 text-xs text-red-500">{{ addUserErrors.firstName }}</p>
                </div>
                <!-- Отчество -->
                <div>
                  <label class="block text-sm font-medium text-[#415861] mb-1.5">Отчество</label>
                  <input v-model="addUserForm.middleName" type="text" placeholder="Введите отчество (необязательно)" class="w-full px-4 py-2.5 border border-[#e5e7eb] rounded-xl focus:outline-none focus:border-[#0e888d] transition-colors" />
                </div>
                <!-- Организация -->
                <div>
                  <label class="block text-sm font-medium text-[#415861] mb-1.5">Организация <span class="text-red-500">*</span></label>
                  <input v-model="addUserForm.organization" @blur="validateAddField('organization')" type="text" placeholder='Например: ОсОО "ЭкоСервис"'
                    :class="['w-full px-4 py-2.5 border rounded-xl focus:outline-none transition-colors', addUserErrors.organization ? 'border-red-400 focus:border-red-500 bg-red-50/50' : 'border-[#e5e7eb] focus:border-[#0e888d]']"
                  />
                  <p v-if="addUserErrors.organization" class="mt-1 text-xs text-red-500">{{ addUserErrors.organization }}</p>
                </div>
                <!-- Роль -->
                <div>
                  <label class="block text-sm font-medium text-[#415861] mb-1.5">Роль <span class="text-red-500">*</span></label>
                  <select v-model="addUserForm.role" @change="validateAddField('role')"
                    :class="['w-full px-4 py-2.5 border rounded-xl focus:outline-none transition-colors appearance-none bg-white', addUserErrors.role ? 'border-red-400 focus:border-red-500 bg-red-50/50' : 'border-[#e5e7eb] focus:border-[#0e888d]', !addUserForm.role ? 'text-[#9ca3af]' : 'text-[#415861]']"
                  >
                    <option value="" disabled>Выберите роль</option>
                    <option value="Плательщик">Плательщик</option>
                    <option value="Сотрудник МПРЭТН КР">Сотрудник МПРЭТН КР</option>
                    <option value="ГП «Эко Оператор»">ГП «Эко Оператор»</option>
                    <option value="Администратор">Администратор</option>
                  </select>
                  <p v-if="addUserErrors.role" class="mt-1 text-xs text-red-500">{{ addUserErrors.role }}</p>
                  <Transition name="role-hint">
                    <div v-if="selectedAddRoleInfo" class="mt-3 p-3 rounded-xl border border-[#e5e7eb] bg-[#f8fafc]">
                      <p class="text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-2">Права доступа роли</p>
                      <div class="space-y-1">
                        <div v-for="perm in selectedAddRoleInfo.permissions" :key="perm" class="flex items-start gap-2 text-sm text-[#415861]">
                          <svg class="w-4 h-4 text-[#0e888d] mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                          {{ perm }}
                        </div>
                        <div v-for="restr in selectedAddRoleInfo.restrictions" :key="restr" class="flex items-start gap-2 text-sm text-[#94a3b8]">
                          <svg class="w-4 h-4 text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                          {{ restr }}
                        </div>
                      </div>
                    </div>
                  </Transition>
                </div>
                <!-- Email -->
                <div>
                  <label class="block text-sm font-medium text-[#415861] mb-1.5">Email <span class="text-red-500">*</span></label>
                  <input v-model="addUserForm.email" @blur="validateAddField('email')" type="email" placeholder="example@mail.kg"
                    :class="['w-full px-4 py-2.5 border rounded-xl focus:outline-none transition-colors', addUserErrors.email ? 'border-red-400 focus:border-red-500 bg-red-50/50' : 'border-[#e5e7eb] focus:border-[#0e888d]']"
                  />
                  <p v-if="addUserErrors.email" class="mt-1 text-xs text-red-500">{{ addUserErrors.email }}</p>
                </div>
                <!-- Телефон -->
                <div>
                  <label class="block text-sm font-medium text-[#415861] mb-1.5">Телефон <span class="text-red-500">*</span></label>
                  <input v-model="addUserForm.phone" @blur="validateAddField('phone')" type="tel" placeholder="+996 XXX XXX XXX"
                    :class="['w-full px-4 py-2.5 border rounded-xl focus:outline-none transition-colors', addUserErrors.phone ? 'border-red-400 focus:border-red-500 bg-red-50/50' : 'border-[#e5e7eb] focus:border-[#0e888d]']"
                  />
                  <p v-if="addUserErrors.phone" class="mt-1 text-xs text-red-500">{{ addUserErrors.phone }}</p>
                </div>
              </div>
              <div class="flex items-center justify-end gap-3 p-6 border-t border-[#f1f5f9]">
                <button @click="closeModal" class="px-5 py-2.5 text-[#64748b] border border-[#e5e7eb] rounded-xl font-medium hover:bg-[#f8fafc] transition-colors">Отмена</button>
                <button @click="goToAddConfirm" :disabled="!isAddFormValid"
                  :class="['px-5 py-2.5 rounded-xl font-medium transition-colors', isAddFormValid ? 'bg-[#0e888d] text-white hover:bg-[#0a6d71]' : 'bg-[#e5e7eb] text-[#94a3b8] cursor-not-allowed']"
                >Далее</button>
              </div>
            </div>

            <!-- STEP 2: Confirmation -->
            <div v-else-if="addUserStep === 'confirm'" key="confirm" class="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div class="flex items-center justify-between p-6 border-b border-[#f1f5f9]">
                <div>
                  <h3 class="text-xl font-bold text-[#415861]">Подтверждение</h3>
                  <p class="text-sm text-[#64748b] mt-1">Проверьте данные перед добавлением</p>
                </div>
                <button @click="closeModal" class="p-2 text-[#94a3b8] hover:text-[#415861] hover:bg-[#f1f5f9] rounded-lg transition-colors">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div class="p-6 space-y-4">
                <div class="bg-[#f8fafc] rounded-xl p-4 space-y-3">
                  <div class="flex items-center gap-3 mb-3">
                    <div class="w-12 h-12 rounded-full bg-[#0e888d] flex items-center justify-center text-white text-lg font-bold">
                      {{ addUserForm.lastName.charAt(0).toUpperCase() }}{{ addUserForm.firstName.charAt(0).toUpperCase() }}
                    </div>
                    <div>
                      <p class="font-semibold text-[#415861]">{{ addUserForm.lastName }} {{ addUserForm.firstName }} {{ addUserForm.middleName }}</p>
                      <p class="text-sm text-[#64748b]">{{ addUserForm.organization }}</p>
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-3 text-sm">
                    <div><p class="text-[#94a3b8]">Email</p><p class="text-[#415861] font-medium">{{ addUserForm.email }}</p></div>
                    <div><p class="text-[#94a3b8]">Телефон</p><p class="text-[#415861] font-medium">{{ addUserForm.phone }}</p></div>
                    <div><p class="text-[#94a3b8]">Роль</p><p class="text-[#415861] font-medium">{{ addUserForm.role }}</p></div>
                    <div><p class="text-[#94a3b8]">Статус</p><span class="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Ожидает подтверждения</span></div>
                  </div>
                </div>
                <div v-if="selectedAddRoleInfo" class="rounded-xl border-2 border-[#0e888d]/20 bg-[#e8f5f5]/30 p-4">
                  <div class="flex items-center gap-2 mb-3">
                    <svg class="w-5 h-5 text-[#0e888d]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    <p class="font-semibold text-[#0e888d]">Назначаемая роль: {{ selectedAddRoleInfo.label }}</p>
                  </div>
                  <p class="text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-2">Права доступа</p>
                  <div class="space-y-1.5 mb-3">
                    <div v-for="perm in selectedAddRoleInfo.permissions" :key="perm" class="flex items-start gap-2 text-sm text-[#415861]">
                      <svg class="w-4 h-4 text-[#0e888d] mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                      {{ perm }}
                    </div>
                  </div>
                  <template v-if="selectedAddRoleInfo.restrictions.length">
                    <p class="text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-2">Ограничения</p>
                    <div class="space-y-1.5">
                      <div v-for="restr in selectedAddRoleInfo.restrictions" :key="restr" class="flex items-start gap-2 text-sm text-[#94a3b8]">
                        <svg class="w-4 h-4 text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        {{ restr }}
                      </div>
                    </div>
                  </template>
                </div>
              </div>
              <div class="flex items-center justify-between p-6 border-t border-[#f1f5f9]">
                <button @click="goBackToAddForm" class="flex items-center gap-1.5 px-4 py-2.5 text-[#64748b] hover:text-[#415861] font-medium transition-colors">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
                  Назад
                </button>
                <button @click="submitAddUser" class="flex items-center gap-2 px-6 py-2.5 bg-[#0e888d] text-white rounded-xl font-medium hover:bg-[#0a6d71] transition-colors">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                  Подтвердить и добавить
                </button>
              </div>
            </div>

            <!-- STEP 3: Success -->
            <div v-else-if="addUserStep === 'success'" key="success" class="bg-white rounded-2xl shadow-2xl w-full max-w-md text-center">
              <div class="p-8">
                <div class="w-16 h-16 rounded-full bg-[#e8f5f5] flex items-center justify-center mx-auto mb-4">
                  <svg class="w-8 h-8 text-[#0e888d]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 class="text-xl font-bold text-[#415861] mb-2">Пользователь добавлен</h3>
                <p class="text-[#64748b] mb-1">
                  <span class="font-medium text-[#415861]">{{ addUserForm.lastName }} {{ addUserForm.firstName }}</span>
                  успешно добавлен(а) в систему.
                </p>
                <p class="text-sm text-[#94a3b8]">
                  Роль: <span class="font-medium">{{ addUserForm.role }}</span> &middot; Статус: Ожидает подтверждения
                </p>
              </div>
              <div class="px-8 pb-8">
                <button @click="closeModal" class="w-full py-3 bg-[#0e888d] text-white rounded-xl font-medium hover:bg-[#0a6d71] transition-colors">
                  Закрыть
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </DashboardLayout>
</template>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-scale-enter-active {
  transition: all 0.25s ease-out;
}
.modal-scale-leave-active {
  transition: all 0.15s ease-in;
}
.modal-scale-enter-from {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}
.modal-scale-leave-to {
  opacity: 0;
  transform: scale(0.97) translateY(-5px);
}

.role-hint-enter-active {
  transition: all 0.3s ease-out;
}
.role-hint-leave-active {
  transition: all 0.2s ease-in;
}
.role-hint-enter-from {
  opacity: 0;
  max-height: 0;
  transform: translateY(-8px);
}
.role-hint-enter-to {
  max-height: 300px;
}
.role-hint-leave-to {
  opacity: 0;
  max-height: 0;
}
</style>
