<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
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
  { key: 'name', label: 'ФИО' },
  { key: 'organization', label: 'Организация' },
  { key: 'role', label: 'Роль' },
  { key: 'status', label: 'Статус' },
  { key: 'registeredAt', label: 'Дата регистрации' },
]

const users = ref([
  { id: 1, name: 'Асанов Бакыт Жумабекович', organization: 'ОсОО "ЭкоПереработка"', role: 'Эко Оператор', status: 'Активен', registeredAt: '15.01.2025' },
  { id: 2, name: 'Мамытова Айгуль Сапарбековна', organization: 'МПРЭТН КР', role: 'Сотрудник МПРЭТН', status: 'Активен', registeredAt: '10.01.2025' },
  { id: 3, name: 'Токтогулов Эрлан Кубанычбекович', organization: 'ОсОО "КыргызИмпорт"', role: 'Бизнес', status: 'Активен', registeredAt: '05.01.2025' },
  { id: 4, name: 'Сыдыков Нурбек Алмазович', organization: 'ОАО "ГринТех"', role: 'Эко Оператор', status: 'Заблокирован', registeredAt: '28.12.2024' },
  { id: 5, name: 'Жумабаева Динара Болотовна', organization: 'ИП Жумабаева', role: 'Бизнес', status: 'Активен', registeredAt: '20.12.2024' },
  { id: 6, name: 'Кадыров Улан Маратович', organization: 'ОсОО "ТрансЛогистик"', role: 'Бизнес', status: 'Ожидает подтверждения', registeredAt: '18.12.2024' },
])

const getStatusClass = (status: string) => {
  switch (status) {
    case 'Активен': return 'bg-green-100 text-green-800'
    case 'Заблокирован': return 'bg-red-100 text-red-800'
    case 'Ожидает подтверждения': return 'bg-yellow-100 text-yellow-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

// --- Modal state ---
const showModal = ref(false)
const modalStep = ref<'form' | 'confirm' | 'success'>('form')

interface FormData {
  lastName: string
  firstName: string
  middleName: string
  organization: string
  role: string
  email: string
  phone: string
}

const form = reactive<FormData>({
  lastName: '',
  firstName: '',
  middleName: '',
  organization: '',
  role: '',
  email: '',
  phone: '',
})

const errors = reactive<Record<string, string>>({})

const rolePermissions: Record<string, { label: string; color: string; permissions: string[]; restrictions: string[] }> = {
  'Сотрудник МПРЭТН': {
    label: 'Сотрудник МПРЭТН',
    color: 'blue',
    permissions: [
      'Редактирование ГИС-карты',
      'Управление Реестром полигонов и свалок',
      'Просмотр аналитики и статистики',
    ],
    restrictions: [
      'Нет доступа к декларациям организаций',
      'Нет доступа к отчётам организаций',
    ],
  },
  'Эко Оператор': {
    label: 'Эко Оператор',
    color: 'teal',
    permissions: [
      'Просмотр и работа с отчётами',
      'Работа с декларациями организаций',
      'Формирование сводных отчётов',
    ],
    restrictions: [
      'Нет доступа к редактированию ГИС-карты',
      'Нет доступа к Реестру полигонов и свалок',
    ],
  },
  'Бизнес': {
    label: 'Бизнес',
    color: 'orange',
    permissions: [
      'Подача деклараций',
      'Просмотр собственных отчётов',
      'Управление профилем организации',
    ],
    restrictions: [
      'Ограниченный функционал',
      'Доступ только к собственным данным',
    ],
  },
}

const selectedRoleInfo = computed(() => {
  return form.role ? rolePermissions[form.role] : null
})

function validateField(field: keyof FormData) {
  delete errors[field]

  switch (field) {
    case 'lastName':
      if (!form.lastName.trim()) errors.lastName = 'Введите фамилию'
      else if (form.lastName.trim().length < 2) errors.lastName = 'Минимум 2 символа'
      break
    case 'firstName':
      if (!form.firstName.trim()) errors.firstName = 'Введите имя'
      else if (form.firstName.trim().length < 2) errors.firstName = 'Минимум 2 символа'
      break
    case 'organization':
      if (!form.organization.trim()) errors.organization = 'Введите организацию'
      break
    case 'role':
      if (!form.role) errors.role = 'Выберите роль'
      break
    case 'email':
      if (!form.email.trim()) {
        errors.email = 'Введите email'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
        errors.email = 'Некорректный формат email'
      }
      break
    case 'phone':
      if (!form.phone.trim()) {
        errors.phone = 'Введите номер телефона'
      } else if (!/^\+?[\d\s\-()]{7,18}$/.test(form.phone.trim())) {
        errors.phone = 'Некорректный формат телефона'
      }
      break
  }
}

function validateAll(): boolean {
  const fields: (keyof FormData)[] = ['lastName', 'firstName', 'organization', 'role', 'email', 'phone']
  fields.forEach(validateField)
  return Object.keys(errors).length === 0
}

const isFormValid = computed(() => {
  return form.lastName.trim() && form.firstName.trim() && form.organization.trim()
    && form.role && form.email.trim() && form.phone.trim()
})

function openModal() {
  Object.assign(form, { lastName: '', firstName: '', middleName: '', organization: '', role: '', email: '', phone: '' })
  Object.keys(errors).forEach(k => delete errors[k])
  modalStep.value = 'form'
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

function goToConfirm() {
  if (!validateAll()) return
  modalStep.value = 'confirm'
}

function goBackToForm() {
  modalStep.value = 'form'
}

function formatDate(date: Date): string {
  const d = date.getDate().toString().padStart(2, '0')
  const m = (date.getMonth() + 1).toString().padStart(2, '0')
  const y = date.getFullYear()
  return `${d}.${m}.${y}`
}

function submitUser() {
  const fullName = [form.lastName, form.firstName, form.middleName].filter(Boolean).join(' ')
  const newUser = {
    id: users.value.length + 1,
    name: fullName,
    organization: form.organization.trim(),
    role: form.role,
    status: 'Ожидает подтверждения',
    registeredAt: formatDate(new Date()),
  }
  users.value.unshift(newUser)
  modalStep.value = 'success'
}

function handleOverlayClick(e: MouseEvent) {
  if ((e.target as HTMLElement).classList.contains('modal-overlay')) {
    closeModal()
  }
}

// Phone mask: auto-add +996 prefix
watch(() => form.phone, (val, oldVal) => {
  if (val && !val.startsWith('+') && val.length === 1 && !oldVal) {
    form.phone = '+996 ' + val
  }
})
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
        @click="openModal"
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
          type="text"
          placeholder="Поиск по ФИО или организации..."
          class="flex-1 min-w-[200px] px-4 py-2 border border-[#e5e7eb] rounded-lg focus:outline-none focus:border-[#0e888d]"
        />
        <select class="px-4 py-2 border border-[#e5e7eb] rounded-lg focus:outline-none focus:border-[#0e888d]">
          <option value="">Все роли</option>
          <option value="admin">Администратор</option>
          <option value="employee">Сотрудник</option>
          <option value="business">Бизнес</option>
          <option value="eco-operator">Эко Оператор</option>
        </select>
        <select class="px-4 py-2 border border-[#e5e7eb] rounded-lg focus:outline-none focus:border-[#0e888d]">
          <option value="">Все статусы</option>
          <option value="active">Активен</option>
          <option value="blocked">Заблокирован</option>
          <option value="pending">Ожидает подтверждения</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <DataTable :columns="columns" :data="users" :actions="true">
      <template #cell-status="{ value }">
        <span :class="['px-3 py-1 rounded-full text-xs font-medium', getStatusClass(value)]">
          {{ value }}
        </span>
      </template>
      <template #actions="{ row }">
        <div class="flex items-center justify-end gap-2">
          <button
            class="p-2 text-[#0e888d] hover:bg-[#e8f5f5] rounded-lg transition-colors"
            title="Просмотреть"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <button
            class="p-2 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
            title="Назначить роль"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <button
            :class="[
              'p-2 rounded-lg transition-colors',
              row.status === 'Заблокирован' ? 'text-green-500 hover:bg-green-50' : 'text-red-500 hover:bg-red-50'
            ]"
            :title="row.status === 'Заблокирован' ? 'Разблокировать' : 'Заблокировать'"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </button>
        </div>
      </template>
    </DataTable>

    <!-- ========== MODAL: Добавить пользователя ========== -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div
          v-if="showModal"
          class="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
          style="background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);"
          @click="handleOverlayClick"
        >
          <Transition name="modal-scale" mode="out-in">
            <!-- ===== STEP 1: Form ===== -->
            <div
              v-if="modalStep === 'form'"
              key="form"
              class="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <!-- Header -->
              <div class="flex items-center justify-between p-6 border-b border-[#f1f5f9]">
                <div>
                  <h3 class="text-xl font-bold text-[#415861]">Добавить пользователя</h3>
                  <p class="text-sm text-[#64748b] mt-1">Заполните данные нового пользователя системы</p>
                </div>
                <button
                  @click="closeModal"
                  class="p-2 text-[#94a3b8] hover:text-[#415861] hover:bg-[#f1f5f9] rounded-lg transition-colors"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- Form body -->
              <div class="p-6 space-y-4">
                <!-- Фамилия -->
                <div>
                  <label class="block text-sm font-medium text-[#415861] mb-1.5">
                    Фамилия <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="form.lastName"
                    @blur="validateField('lastName')"
                    type="text"
                    placeholder="Введите фамилию"
                    :class="[
                      'w-full px-4 py-2.5 border rounded-xl focus:outline-none transition-colors',
                      errors.lastName ? 'border-red-400 focus:border-red-500 bg-red-50/50' : 'border-[#e5e7eb] focus:border-[#0e888d]'
                    ]"
                  />
                  <p v-if="errors.lastName" class="mt-1 text-xs text-red-500">{{ errors.lastName }}</p>
                </div>

                <!-- Имя -->
                <div>
                  <label class="block text-sm font-medium text-[#415861] mb-1.5">
                    Имя <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="form.firstName"
                    @blur="validateField('firstName')"
                    type="text"
                    placeholder="Введите имя"
                    :class="[
                      'w-full px-4 py-2.5 border rounded-xl focus:outline-none transition-colors',
                      errors.firstName ? 'border-red-400 focus:border-red-500 bg-red-50/50' : 'border-[#e5e7eb] focus:border-[#0e888d]'
                    ]"
                  />
                  <p v-if="errors.firstName" class="mt-1 text-xs text-red-500">{{ errors.firstName }}</p>
                </div>

                <!-- Отчество -->
                <div>
                  <label class="block text-sm font-medium text-[#415861] mb-1.5">Отчество</label>
                  <input
                    v-model="form.middleName"
                    type="text"
                    placeholder="Введите отчество (необязательно)"
                    class="w-full px-4 py-2.5 border border-[#e5e7eb] rounded-xl focus:outline-none focus:border-[#0e888d] transition-colors"
                  />
                </div>

                <!-- Организация -->
                <div>
                  <label class="block text-sm font-medium text-[#415861] mb-1.5">
                    Организация <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="form.organization"
                    @blur="validateField('organization')"
                    type="text"
                    placeholder='Например: ОсОО "ЭкоСервис"'
                    :class="[
                      'w-full px-4 py-2.5 border rounded-xl focus:outline-none transition-colors',
                      errors.organization ? 'border-red-400 focus:border-red-500 bg-red-50/50' : 'border-[#e5e7eb] focus:border-[#0e888d]'
                    ]"
                  />
                  <p v-if="errors.organization" class="mt-1 text-xs text-red-500">{{ errors.organization }}</p>
                </div>

                <!-- Роль -->
                <div>
                  <label class="block text-sm font-medium text-[#415861] mb-1.5">
                    Роль <span class="text-red-500">*</span>
                  </label>
                  <select
                    v-model="form.role"
                    @change="validateField('role')"
                    :class="[
                      'w-full px-4 py-2.5 border rounded-xl focus:outline-none transition-colors appearance-none bg-white',
                      errors.role ? 'border-red-400 focus:border-red-500 bg-red-50/50' : 'border-[#e5e7eb] focus:border-[#0e888d]',
                      !form.role ? 'text-[#9ca3af]' : 'text-[#415861]'
                    ]"
                  >
                    <option value="" disabled>Выберите роль</option>
                    <option value="Сотрудник МПРЭТН">Сотрудник МПРЭТН</option>
                    <option value="Эко Оператор">Эко Оператор</option>
                    <option value="Бизнес">Бизнес</option>
                  </select>
                  <p v-if="errors.role" class="mt-1 text-xs text-red-500">{{ errors.role }}</p>

                  <!-- Role preview -->
                  <Transition name="role-hint">
                    <div
                      v-if="selectedRoleInfo"
                      class="mt-3 p-3 rounded-xl border border-[#e5e7eb] bg-[#f8fafc]"
                    >
                      <p class="text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-2">Права доступа роли</p>
                      <div class="space-y-1">
                        <div
                          v-for="perm in selectedRoleInfo.permissions"
                          :key="perm"
                          class="flex items-start gap-2 text-sm text-[#415861]"
                        >
                          <svg class="w-4 h-4 text-[#0e888d] mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                          </svg>
                          {{ perm }}
                        </div>
                        <div
                          v-for="restr in selectedRoleInfo.restrictions"
                          :key="restr"
                          class="flex items-start gap-2 text-sm text-[#94a3b8]"
                        >
                          <svg class="w-4 h-4 text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          {{ restr }}
                        </div>
                      </div>
                    </div>
                  </Transition>
                </div>

                <!-- Email -->
                <div>
                  <label class="block text-sm font-medium text-[#415861] mb-1.5">
                    Email <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="form.email"
                    @blur="validateField('email')"
                    type="email"
                    placeholder="example@mail.kg"
                    :class="[
                      'w-full px-4 py-2.5 border rounded-xl focus:outline-none transition-colors',
                      errors.email ? 'border-red-400 focus:border-red-500 bg-red-50/50' : 'border-[#e5e7eb] focus:border-[#0e888d]'
                    ]"
                  />
                  <p v-if="errors.email" class="mt-1 text-xs text-red-500">{{ errors.email }}</p>
                </div>

                <!-- Телефон -->
                <div>
                  <label class="block text-sm font-medium text-[#415861] mb-1.5">
                    Телефон <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="form.phone"
                    @blur="validateField('phone')"
                    type="tel"
                    placeholder="+996 XXX XXX XXX"
                    :class="[
                      'w-full px-4 py-2.5 border rounded-xl focus:outline-none transition-colors',
                      errors.phone ? 'border-red-400 focus:border-red-500 bg-red-50/50' : 'border-[#e5e7eb] focus:border-[#0e888d]'
                    ]"
                  />
                  <p v-if="errors.phone" class="mt-1 text-xs text-red-500">{{ errors.phone }}</p>
                </div>
              </div>

              <!-- Footer -->
              <div class="flex items-center justify-end gap-3 p-6 border-t border-[#f1f5f9]">
                <button
                  @click="closeModal"
                  class="px-5 py-2.5 text-[#64748b] border border-[#e5e7eb] rounded-xl font-medium hover:bg-[#f8fafc] transition-colors"
                >
                  Отмена
                </button>
                <button
                  @click="goToConfirm"
                  :disabled="!isFormValid"
                  :class="[
                    'px-5 py-2.5 rounded-xl font-medium transition-colors',
                    isFormValid
                      ? 'bg-[#0e888d] text-white hover:bg-[#0a6d71]'
                      : 'bg-[#e5e7eb] text-[#94a3b8] cursor-not-allowed'
                  ]"
                >
                  Далее
                </button>
              </div>
            </div>

            <!-- ===== STEP 2: Confirmation ===== -->
            <div
              v-else-if="modalStep === 'confirm'"
              key="confirm"
              class="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <!-- Header -->
              <div class="flex items-center justify-between p-6 border-b border-[#f1f5f9]">
                <div>
                  <h3 class="text-xl font-bold text-[#415861]">Подтверждение</h3>
                  <p class="text-sm text-[#64748b] mt-1">Проверьте данные перед добавлением</p>
                </div>
                <button
                  @click="closeModal"
                  class="p-2 text-[#94a3b8] hover:text-[#415861] hover:bg-[#f1f5f9] rounded-lg transition-colors"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- Summary -->
              <div class="p-6 space-y-4">
                <!-- User info card -->
                <div class="bg-[#f8fafc] rounded-xl p-4 space-y-3">
                  <div class="flex items-center gap-3 mb-3">
                    <div class="w-12 h-12 rounded-full bg-[#0e888d] flex items-center justify-center text-white text-lg font-bold">
                      {{ form.lastName.charAt(0).toUpperCase() }}{{ form.firstName.charAt(0).toUpperCase() }}
                    </div>
                    <div>
                      <p class="font-semibold text-[#415861]">{{ form.lastName }} {{ form.firstName }} {{ form.middleName }}</p>
                      <p class="text-sm text-[#64748b]">{{ form.organization }}</p>
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p class="text-[#94a3b8]">Email</p>
                      <p class="text-[#415861] font-medium">{{ form.email }}</p>
                    </div>
                    <div>
                      <p class="text-[#94a3b8]">Телефон</p>
                      <p class="text-[#415861] font-medium">{{ form.phone }}</p>
                    </div>
                    <div>
                      <p class="text-[#94a3b8]">Статус</p>
                      <span class="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Ожидает подтверждения
                      </span>
                    </div>
                    <div>
                      <p class="text-[#94a3b8]">Дата регистрации</p>
                      <p class="text-[#415861] font-medium">{{ formatDate(new Date()) }}</p>
                    </div>
                  </div>
                </div>

                <!-- Role permissions card -->
                <div v-if="selectedRoleInfo" class="rounded-xl border-2 border-[#0e888d]/20 bg-[#e8f5f5]/30 p-4">
                  <div class="flex items-center gap-2 mb-3">
                    <svg class="w-5 h-5 text-[#0e888d]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <p class="font-semibold text-[#0e888d]">Назначаемая роль: {{ selectedRoleInfo.label }}</p>
                  </div>

                  <p class="text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-2">Права доступа</p>
                  <div class="space-y-1.5 mb-3">
                    <div
                      v-for="perm in selectedRoleInfo.permissions"
                      :key="perm"
                      class="flex items-start gap-2 text-sm text-[#415861]"
                    >
                      <svg class="w-4 h-4 text-[#0e888d] mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                      {{ perm }}
                    </div>
                  </div>

                  <p class="text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-2">Ограничения</p>
                  <div class="space-y-1.5">
                    <div
                      v-for="restr in selectedRoleInfo.restrictions"
                      :key="restr"
                      class="flex items-start gap-2 text-sm text-[#94a3b8]"
                    >
                      <svg class="w-4 h-4 text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      {{ restr }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Footer -->
              <div class="flex items-center justify-between p-6 border-t border-[#f1f5f9]">
                <button
                  @click="goBackToForm"
                  class="flex items-center gap-1.5 px-4 py-2.5 text-[#64748b] hover:text-[#415861] font-medium transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                  </svg>
                  Назад
                </button>
                <button
                  @click="submitUser"
                  class="flex items-center gap-2 px-6 py-2.5 bg-[#0e888d] text-white rounded-xl font-medium hover:bg-[#0a6d71] transition-colors"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Подтвердить и добавить
                </button>
              </div>
            </div>

            <!-- ===== STEP 3: Success ===== -->
            <div
              v-else-if="modalStep === 'success'"
              key="success"
              class="bg-white rounded-2xl shadow-2xl w-full max-w-md text-center"
            >
              <div class="p-8">
                <div class="w-16 h-16 rounded-full bg-[#e8f5f5] flex items-center justify-center mx-auto mb-4">
                  <svg class="w-8 h-8 text-[#0e888d]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 class="text-xl font-bold text-[#415861] mb-2">Пользователь добавлен</h3>
                <p class="text-[#64748b] mb-1">
                  <span class="font-medium text-[#415861]">{{ form.lastName }} {{ form.firstName }}</span>
                  успешно добавлен(а) в систему.
                </p>
                <p class="text-sm text-[#94a3b8]">
                  Роль: <span class="font-medium">{{ form.role }}</span> &middot; Статус: Ожидает подтверждения
                </p>
              </div>
              <div class="px-8 pb-8">
                <button
                  @click="closeModal"
                  class="w-full py-3 bg-[#0e888d] text-white rounded-xl font-medium hover:bg-[#0a6d71] transition-colors"
                >
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
/* Modal transitions */
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

/* Role hint transition */
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
