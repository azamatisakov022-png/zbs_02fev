<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import { useAdminMenu } from '../../composables/useRoleMenu'

const { roleTitle, menuItems } = useAdminMenu()

// --- Types ---
interface Permission {
  view: boolean
  create: boolean
  edit: boolean
  delete: boolean
}

interface Role {
  id: string
  name: string
  description: string
  color: string
  badgeClass: string
  userCount: number
  isSystem: boolean
}

// --- Roles ---
const roles: Role[] = [
  {
    id: 'admin',
    name: 'Администратор',
    description: 'Полный доступ ко всем модулям и настройкам системы',
    color: '#EF4444',
    badgeClass: 'bg-red-100 text-red-700 border-red-200',
    userCount: 2,
    isSystem: true,
  },
  {
    id: 'employee',
    name: 'Сотрудник МПРЭТН КР',
    description: 'Работа с реестрами, лицензиями и контроль переработчиков',
    color: '#3B82F6',
    badgeClass: 'bg-blue-100 text-blue-700 border-blue-200',
    userCount: 8,
    isSystem: true,
  },
  {
    id: 'eco-operator',
    name: 'ГП «Эко Оператор»',
    description: 'Управление декларациями, расчётами и отчётами переработки',
    color: '#10B981',
    badgeClass: 'bg-green-100 text-green-700 border-green-200',
    userCount: 5,
    isSystem: true,
  },
  {
    id: 'payer',
    name: 'Плательщик утильсбора',
    description: 'Подача деклараций, просмотр расчётов и совершение платежей',
    color: '#F59E0B',
    badgeClass: 'bg-orange-100 text-orange-700 border-orange-200',
    userCount: 124,
    isSystem: true,
  },
]

// --- Modules ---
const modules = [
  { id: 'users', label: 'Пользователи' },
  { id: 'organizations', label: 'Организации' },
  { id: 'declarations', label: 'Декларации' },
  { id: 'recycling-reports', label: 'Отчёты о переработке' },
  { id: 'calculations', label: 'Расчёты утильсбора' },
  { id: 'payments', label: 'Платежи' },
  { id: 'recyclers-registry', label: 'Реестр переработчиков' },
  { id: 'licenses', label: 'Лицензии и документы' },
  { id: 'references', label: 'Справочники' },
  { id: 'analytics', label: 'Аналитика' },
  { id: 'system-settings', label: 'Настройки системы' },
  { id: 'audit-log', label: 'Журнал аудита' },
]

const permissionLabels: { key: keyof Permission; label: string }[] = [
  { key: 'view', label: 'Просмотр' },
  { key: 'create', label: 'Создание' },
  { key: 'edit', label: 'Редактирование' },
  { key: 'delete', label: 'Удаление' },
]

// --- Permissions state ---
function buildDefaultPermissions(): Record<string, Record<string, Permission>> {
  const result: Record<string, Record<string, Permission>> = {}

  // Admin: all true
  result['admin'] = {}
  for (const mod of modules) {
    result['admin'][mod.id] = { view: true, create: true, edit: true, delete: true }
  }

  // Employee MPRETN
  result['employee'] = {}
  for (const mod of modules) {
    result['employee'][mod.id] = { view: false, create: false, edit: false, delete: false }
  }
  result['employee']['users'] = { view: true, create: false, edit: false, delete: false }
  result['employee']['organizations'] = { view: true, create: false, edit: true, delete: false }
  result['employee']['declarations'] = { view: true, create: false, edit: true, delete: false }
  result['employee']['recycling-reports'] = { view: true, create: false, edit: true, delete: false }
  result['employee']['calculations'] = { view: true, create: false, edit: false, delete: false }
  result['employee']['payments'] = { view: true, create: false, edit: false, delete: false }
  result['employee']['recyclers-registry'] = { view: true, create: true, edit: true, delete: true }
  result['employee']['licenses'] = { view: true, create: true, edit: true, delete: false }
  result['employee']['references'] = { view: true, create: true, edit: true, delete: false }
  result['employee']['analytics'] = { view: true, create: false, edit: false, delete: false }
  result['employee']['system-settings'] = { view: false, create: false, edit: false, delete: false }
  result['employee']['audit-log'] = { view: true, create: false, edit: false, delete: false }

  // Eco Operator
  result['eco-operator'] = {}
  for (const mod of modules) {
    result['eco-operator'][mod.id] = { view: false, create: false, edit: false, delete: false }
  }
  result['eco-operator']['users'] = { view: true, create: false, edit: false, delete: false }
  result['eco-operator']['organizations'] = { view: true, create: false, edit: false, delete: false }
  result['eco-operator']['declarations'] = { view: true, create: true, edit: true, delete: false }
  result['eco-operator']['recycling-reports'] = { view: true, create: true, edit: true, delete: true }
  result['eco-operator']['calculations'] = { view: true, create: true, edit: true, delete: false }
  result['eco-operator']['payments'] = { view: true, create: true, edit: true, delete: false }
  result['eco-operator']['recyclers-registry'] = { view: true, create: false, edit: false, delete: false }
  result['eco-operator']['licenses'] = { view: true, create: false, edit: false, delete: false }
  result['eco-operator']['references'] = { view: true, create: false, edit: false, delete: false }
  result['eco-operator']['analytics'] = { view: true, create: true, edit: false, delete: false }
  result['eco-operator']['system-settings'] = { view: false, create: false, edit: false, delete: false }
  result['eco-operator']['audit-log'] = { view: true, create: false, edit: false, delete: false }

  // Payer
  result['payer'] = {}
  for (const mod of modules) {
    result['payer'][mod.id] = { view: false, create: false, edit: false, delete: false }
  }
  result['payer']['users'] = { view: false, create: false, edit: false, delete: false }
  result['payer']['organizations'] = { view: true, create: false, edit: true, delete: false }
  result['payer']['declarations'] = { view: true, create: true, edit: true, delete: true }
  result['payer']['recycling-reports'] = { view: true, create: false, edit: false, delete: false }
  result['payer']['calculations'] = { view: true, create: false, edit: false, delete: false }
  result['payer']['payments'] = { view: true, create: true, edit: false, delete: false }
  result['payer']['recyclers-registry'] = { view: false, create: false, edit: false, delete: false }
  result['payer']['licenses'] = { view: true, create: true, edit: false, delete: false }
  result['payer']['references'] = { view: true, create: false, edit: false, delete: false }
  result['payer']['analytics'] = { view: true, create: false, edit: false, delete: false }
  result['payer']['system-settings'] = { view: false, create: false, edit: false, delete: false }
  result['payer']['audit-log'] = { view: false, create: false, edit: false, delete: false }

  return result
}

const permissions = reactive(buildDefaultPermissions())

// --- Selected role card ---
const selectedRoleId = ref<string | null>(null)

function selectRole(roleId: string) {
  selectedRoleId.value = selectedRoleId.value === roleId ? null : roleId
}

const selectedRole = computed(() => {
  if (!selectedRoleId.value) return null
  return roles.find(r => r.id === selectedRoleId.value) || null
})

const selectedRolePermissionSummary = computed(() => {
  if (!selectedRoleId.value) return []
  const rolePerms = permissions[selectedRoleId.value]
  if (!rolePerms) return []
  return modules.map(mod => {
    const p = rolePerms[mod.id]
    const activePerms: string[] = []
    if (p.view) activePerms.push('Просмотр')
    if (p.create) activePerms.push('Создание')
    if (p.edit) activePerms.push('Редактирование')
    if (p.delete) activePerms.push('Удаление')
    return {
      module: mod.label,
      permissions: activePerms,
      hasAccess: activePerms.length > 0,
    }
  })
})

// --- Toggle permission ---
function togglePermission(roleId: string, moduleId: string, permKey: keyof Permission) {
  if (roleId === 'admin') return
  permissions[roleId][moduleId][permKey] = !permissions[roleId][moduleId][permKey]
}

// --- Save ---
const isSaving = ref(false)
const showToast = ref(false)
const toastMessage = ref('')

function saveChanges() {
  isSaving.value = true
  setTimeout(() => {
    isSaving.value = false
    toastMessage.value = 'Изменения прав доступа успешно сохранены'
    showToast.value = true
    setTimeout(() => {
      showToast.value = false
    }, 3000)
  }, 1200)
}

// --- Create role modal ---
const showCreateModal = ref(false)

const newRoleForm = reactive({
  name: '',
  description: '',
  permissions: {} as Record<string, Permission>,
})

function openCreateModal() {
  newRoleForm.name = ''
  newRoleForm.description = ''
  newRoleForm.permissions = {}
  for (const mod of modules) {
    newRoleForm.permissions[mod.id] = { view: false, create: false, edit: false, delete: false }
  }
  showCreateModal.value = true
}

function closeCreateModal() {
  showCreateModal.value = false
}

function handleCreateOverlayClick(e: MouseEvent) {
  if ((e.target as HTMLElement).classList.contains('modal-overlay')) {
    closeCreateModal()
  }
}

const isCreateFormValid = computed(() => {
  return newRoleForm.name.trim().length >= 2 && newRoleForm.description.trim().length >= 5
})

function toggleNewRolePermission(moduleId: string, permKey: keyof Permission) {
  newRoleForm.permissions[moduleId][permKey] = !newRoleForm.permissions[moduleId][permKey]
}

const isCreating = ref(false)

function submitCreateRole() {
  if (!isCreateFormValid.value) return
  isCreating.value = true
  setTimeout(() => {
    isCreating.value = false
    showCreateModal.value = false
    toastMessage.value = `Роль "${newRoleForm.name}" успешно создана`
    showToast.value = true
    setTimeout(() => {
      showToast.value = false
    }, 3000)
  }, 1000)
}

// --- Permission count helpers ---
function getPermissionCount(roleId: string): { granted: number; total: number } {
  const rolePerms = permissions[roleId]
  if (!rolePerms) return { granted: 0, total: 0 }
  let granted = 0
  const total = modules.length * 4
  for (const mod of modules) {
    const p = rolePerms[mod.id]
    if (p.view) granted++
    if (p.create) granted++
    if (p.edit) granted++
    if (p.delete) granted++
  }
  return { granted, total }
}
</script>

<template>
  <DashboardLayout
    role="admin"
    :roleTitle="roleTitle"
    userName="Иван Петров"
    :menuItems="menuItems"
  >
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-[#415861]">Роли и права доступа</h1>
          <p class="text-[#64748b] mt-1">Управление ролями пользователей и настройка прав доступа к модулям системы</p>
        </div>
        <button
          @click="saveChanges"
          :disabled="isSaving"
          :class="[
            'flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-colors',
            isSaving
              ? 'bg-[#94a3b8] text-white cursor-not-allowed'
              : 'bg-[#0e888d] text-white hover:bg-[#0a6d71]'
          ]"
        >
          <svg v-if="isSaving" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          {{ isSaving ? 'Сохранение...' : 'Сохранить изменения' }}
        </button>
      </div>

      <!-- Role Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          v-for="role in roles"
          :key="role.id"
          @click="selectRole(role.id)"
          :class="[
            'bg-white rounded-2xl shadow-sm border-2 p-5 cursor-pointer transition-all duration-200',
            selectedRoleId === role.id
              ? 'border-[' + role.color + '] ring-2 ring-offset-1'
              : 'border-[#e2e8f0] hover:border-[#cbd5e1] hover:shadow-md',
          ]"
          :style="selectedRoleId === role.id ? { borderColor: role.color, '--tw-ring-color': role.color + '40' } : {}"
        >
          <div class="flex items-start justify-between mb-3">
            <span
              :class="['inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border', role.badgeClass]"
            >
              {{ role.name }}
            </span>
            <div
              v-if="role.id === 'admin'"
              class="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center"
              title="Системная роль (нельзя изменить)"
            >
              <svg class="w-3.5 h-3.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
          <p class="text-sm text-[#64748b] mb-4 line-clamp-1">{{ role.description }}</p>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1.5 text-sm text-[#415861]">
              <svg class="w-4 h-4 text-[#94a3b8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span class="font-medium">{{ role.userCount }}</span>
              <span class="text-[#94a3b8]">польз.</span>
            </div>
            <div class="text-xs text-[#94a3b8]">
              {{ getPermissionCount(role.id).granted }}/{{ getPermissionCount(role.id).total }} прав
            </div>
          </div>
        </div>
      </div>

      <!-- Selected Role Summary -->
      <Transition name="summary-slide">
        <div v-if="selectedRole" class="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] p-6">
          <div class="flex items-center gap-3 mb-4">
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center"
              :style="{ backgroundColor: selectedRole.color + '20' }"
            >
              <svg class="w-5 h-5" :style="{ color: selectedRole.color }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-bold text-[#415861]">{{ selectedRole.name }}</h3>
              <p class="text-sm text-[#64748b]">{{ selectedRole.description }}</p>
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div
              v-for="item in selectedRolePermissionSummary"
              :key="item.module"
              :class="[
                'rounded-xl p-3 border text-sm',
                item.hasAccess
                  ? 'bg-[#f0fdf4] border-[#bbf7d0]'
                  : 'bg-[#fef2f2] border-[#fecaca]'
              ]"
            >
              <div class="flex items-center gap-2 mb-1.5">
                <svg
                  v-if="item.hasAccess"
                  class="w-4 h-4 text-green-600 flex-shrink-0"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <svg
                  v-else
                  class="w-4 h-4 text-red-400 flex-shrink-0"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span class="font-medium text-[#415861]">{{ item.module }}</span>
              </div>
              <p v-if="item.hasAccess" class="text-xs text-[#64748b] ml-6">
                {{ item.permissions.join(', ') }}
              </p>
              <p v-else class="text-xs text-red-400 ml-6">Нет доступа</p>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Permission Matrix Table -->
      <div class="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] overflow-hidden">
        <div class="px-6 py-4 border-b border-[#e2e8f0]">
          <h2 class="text-lg font-bold text-[#415861]">Матрица прав доступа</h2>
          <p class="text-sm text-[#64748b] mt-0.5">Настройте разрешения для каждого модуля и роли</p>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-[#f8fafc]">
                <th class="px-6 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wider w-[220px] min-w-[200px]">
                  Модуль
                </th>
                <th
                  v-for="role in roles"
                  :key="role.id"
                  class="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider min-w-[180px]"
                  :style="{ color: role.color }"
                >
                  <div class="flex flex-col items-center gap-1">
                    <span
                      :class="['inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border', role.badgeClass]"
                    >
                      {{ role.name }}
                    </span>
                    <span class="text-[10px] text-[#94a3b8] font-normal normal-case">
                      П / С / Р / У
                    </span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(mod, idx) in modules"
                :key="mod.id"
                :class="idx % 2 === 0 ? 'bg-white' : 'bg-[#f8fafc]'"
                class="border-t border-[#f1f5f9] hover:bg-[#f0f9ff] transition-colors"
              >
                <td class="px-6 py-3">
                  <span class="text-sm font-medium text-[#415861]">{{ mod.label }}</span>
                </td>
                <td
                  v-for="role in roles"
                  :key="role.id"
                  class="px-4 py-3"
                >
                  <div class="flex items-center justify-center gap-2">
                    <button
                      v-for="perm in permissionLabels"
                      :key="perm.key"
                      @click="togglePermission(role.id, mod.id, perm.key)"
                      :disabled="role.id === 'admin'"
                      :title="perm.label"
                      :class="[
                        'w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150 text-xs font-bold',
                        permissions[role.id][mod.id][perm.key]
                          ? role.id === 'admin'
                            ? 'bg-red-100 text-red-600 cursor-not-allowed'
                            : 'bg-[#0e888d]/10 text-[#0e888d] hover:bg-[#0e888d]/20 cursor-pointer'
                          : role.id === 'admin'
                            ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                            : 'bg-gray-100 text-gray-300 hover:bg-gray-200 hover:text-gray-400 cursor-pointer',
                      ]"
                    >
                      <svg
                        v-if="permissions[role.id][mod.id][perm.key]"
                        class="w-4 h-4"
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                      <svg
                        v-else
                        class="w-3.5 h-3.5"
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- Legend -->
        <div class="px-6 py-3 border-t border-[#e2e8f0] bg-[#f8fafc]">
          <div class="flex flex-wrap items-center gap-4 text-xs text-[#64748b]">
            <span class="font-semibold text-[#415861]">Условные обозначения:</span>
            <span class="flex items-center gap-1">
              <span class="font-bold text-[#415861]">П</span> — Просмотр
            </span>
            <span class="flex items-center gap-1">
              <span class="font-bold text-[#415861]">С</span> — Создание
            </span>
            <span class="flex items-center gap-1">
              <span class="font-bold text-[#415861]">Р</span> — Редактирование
            </span>
            <span class="flex items-center gap-1">
              <span class="font-bold text-[#415861]">У</span> — Удаление
            </span>
            <span class="ml-auto flex items-center gap-2">
              <span class="inline-flex items-center gap-1">
                <span class="w-5 h-5 rounded bg-[#0e888d]/10 flex items-center justify-center">
                  <svg class="w-3 h-3 text-[#0e888d]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                Разрешено
              </span>
              <span class="inline-flex items-center gap-1">
                <span class="w-5 h-5 rounded bg-gray-100 flex items-center justify-center">
                  <svg class="w-3 h-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                  </svg>
                </span>
                Запрещено
              </span>
            </span>
          </div>
        </div>
      </div>

      <!-- Save Button (bottom) -->
      <div class="flex items-center justify-between bg-white rounded-2xl shadow-sm border border-[#e2e8f0] p-5">
        <p class="text-sm text-[#64748b]">
          Изменения вступят в силу немедленно после сохранения для всех пользователей с соответствующими ролями.
        </p>
        <button
          @click="saveChanges"
          :disabled="isSaving"
          :class="[
            'flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-colors',
            isSaving
              ? 'bg-[#94a3b8] text-white cursor-not-allowed'
              : 'bg-[#0e888d] text-white hover:bg-[#0a6d71]'
          ]"
        >
          <svg v-if="!isSaving" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          {{ isSaving ? 'Сохранение...' : 'Сохранить изменения' }}
        </button>
      </div>

      <!-- Create Role Section -->
      <div class="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] p-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 class="text-lg font-bold text-[#415861]">Создание новой роли</h2>
            <p class="text-sm text-[#64748b] mt-0.5">
              Создайте пользовательскую роль с индивидуальным набором прав доступа
            </p>
          </div>
          <button
            @click="openCreateModal"
            class="flex items-center gap-2 bg-[#415861] text-white px-5 py-3 rounded-xl font-medium hover:bg-[#354950] transition-colors"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Создать роль
          </button>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <Teleport to="body">
      <Transition name="toast-slide">
        <div
          v-if="showToast"
          class="fixed top-6 right-6 z-[100] flex items-center gap-3 bg-white rounded-2xl shadow-lg border border-[#e2e8f0] px-5 py-4 max-w-sm"
        >
          <div class="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p class="text-sm font-semibold text-[#415861]">Успешно</p>
            <p class="text-xs text-[#64748b] mt-0.5">{{ toastMessage }}</p>
          </div>
          <button @click="showToast = false" class="ml-2 p-1 text-[#94a3b8] hover:text-[#415861] transition-colors">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </Transition>

      <!-- Create Role Modal -->
      <Transition name="modal-fade">
        <div
          v-if="showCreateModal"
          class="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
          style="background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);"
          @click="handleCreateOverlayClick"
        >
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <!-- Modal Header -->
            <div class="flex items-center justify-between p-6 border-b border-[#f1f5f9]">
              <div>
                <h3 class="text-xl font-bold text-[#415861]">Создать новую роль</h3>
                <p class="text-sm text-[#64748b] mt-1">Укажите название, описание и набор прав доступа</p>
              </div>
              <button
                @click="closeCreateModal"
                class="p-2 text-[#94a3b8] hover:text-[#415861] hover:bg-[#f1f5f9] rounded-lg transition-colors"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Modal Body -->
            <div class="p-6 space-y-5">
              <!-- Name -->
              <div>
                <label class="block text-sm font-medium text-[#415861] mb-1.5">
                  Название роли <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="newRoleForm.name"
                  type="text"
                  placeholder="Например: Менеджер переработки"
                  class="w-full px-4 py-2.5 border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0e888d] transition-colors"
                />
              </div>

              <!-- Description -->
              <div>
                <label class="block text-sm font-medium text-[#415861] mb-1.5">
                  Описание роли <span class="text-red-500">*</span>
                </label>
                <textarea
                  v-model="newRoleForm.description"
                  rows="3"
                  placeholder="Опишите назначение и обязанности данной роли..."
                  class="w-full px-4 py-2.5 border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0e888d] resize-none transition-colors"
                ></textarea>
              </div>

              <!-- Permissions -->
              <div>
                <label class="block text-sm font-medium text-[#415861] mb-3">Права доступа по модулям</label>
                <div class="border border-[#e2e8f0] rounded-xl overflow-hidden overflow-x-auto">
                  <table class="w-full">
                    <thead>
                      <tr class="bg-[#f8fafc]">
                        <th class="px-4 py-2.5 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                          Модуль
                        </th>
                        <th
                          v-for="perm in permissionLabels"
                          :key="perm.key"
                          class="px-3 py-2.5 text-center text-xs font-semibold text-[#64748b] uppercase tracking-wider"
                        >
                          {{ perm.label }}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="(mod, idx) in modules"
                        :key="mod.id"
                        :class="idx % 2 === 0 ? 'bg-white' : 'bg-[#f8fafc]'"
                        class="border-t border-[#f1f5f9]"
                      >
                        <td class="px-4 py-2.5">
                          <span class="text-sm text-[#415861]">{{ mod.label }}</span>
                        </td>
                        <td
                          v-for="perm in permissionLabels"
                          :key="perm.key"
                          class="px-3 py-2.5 text-center"
                        >
                          <label class="inline-flex items-center justify-center cursor-pointer">
                            <input
                              type="checkbox"
                              :checked="newRoleForm.permissions[mod.id]?.[perm.key]"
                              @change="toggleNewRolePermission(mod.id, perm.key)"
                              class="w-4 h-4 rounded border-[#cbd5e1] text-[#0e888d] focus:ring-[#0e888d] cursor-pointer"
                            />
                          </label>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="flex items-center justify-end gap-3 p-6 border-t border-[#f1f5f9]">
              <button
                @click="closeCreateModal"
                class="px-5 py-2.5 text-[#64748b] border border-[#e2e8f0] rounded-xl font-medium hover:bg-[#f8fafc] transition-colors"
              >
                Отмена
              </button>
              <button
                @click="submitCreateRole"
                :disabled="!isCreateFormValid || isCreating"
                :class="[
                  'flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-colors',
                  isCreateFormValid && !isCreating
                    ? 'bg-[#0e888d] text-white hover:bg-[#0a6d71]'
                    : 'bg-[#e5e7eb] text-[#94a3b8] cursor-not-allowed'
                ]"
              >
                <svg v-if="isCreating" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {{ isCreating ? 'Создание...' : 'Создать роль' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </DashboardLayout>
</template>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.toast-slide-enter-active {
  transition: all 0.35s ease-out;
}
.toast-slide-leave-active {
  transition: all 0.25s ease-in;
}
.toast-slide-enter-from {
  opacity: 0;
  transform: translateX(100px);
}
.toast-slide-leave-to {
  opacity: 0;
  transform: translateX(100px);
}

.summary-slide-enter-active {
  transition: all 0.3s ease-out;
}
.summary-slide-leave-active {
  transition: all 0.2s ease-in;
}
.summary-slide-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}
.summary-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
