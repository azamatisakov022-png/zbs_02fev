<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import { useEmployeeMenu } from '../../composables/useRoleMenu'
import { licenseStore } from '../../stores/licenses'
import { licenseRegistryApi } from '../../api/licenses'
import type {
  LicenseApplication,
  LicenseApplicationStatus,
  License,
  LicenseType,
} from '../../types/licenses'

const router = useRouter()
const { roleTitle, menuItems } = useEmployeeMenu()

const activeTab = ref<'applications' | 'licenses'>('applications')
const statusFilter = ref<LicenseApplicationStatus | ''>('')
const typeFilter = ref<LicenseType | ''>('')
const overdueOnly = ref(false)
const search = ref('')

onMounted(async () => {
  await licenseStore.loadEnums()
  await Promise.all([loadApplications(), licenseStore.loadStatusCounts(), loadLicenses()])
})

async function loadApplications() {
  await licenseStore.loadAdminApplications({
    status: statusFilter.value || undefined,
    licenseType: typeFilter.value || undefined,
    overdue: overdueOnly.value || undefined,
  })
}

async function loadLicenses() {
  await licenseStore.loadRegistry(typeFilter.value || undefined)
}

const filteredApps = computed<LicenseApplication[]>(() => {
  const s = search.value.toLowerCase().trim()
  if (!s) return licenseStore.state.adminApplications
  return licenseStore.state.adminApplications.filter(
    a =>
      a.applicantName.toLowerCase().includes(s) ||
      a.applicantInn.toLowerCase().includes(s),
  )
})

const filteredLicenses = computed<License[]>(() => {
  const s = search.value.toLowerCase().trim()
  if (!s) return licenseStore.state.adminLicenses
  return licenseStore.state.adminLicenses.filter(
    l =>
      l.licenseNumber.toLowerCase().includes(s) ||
      l.applicantName.toLowerCase().includes(s) ||
      l.applicantInn.toLowerCase().includes(s),
  )
})

function statusBadgeClass(s: LicenseApplicationStatus) {
  const map: Record<LicenseApplicationStatus, string> = {
    draft: 'bg-gray-100 text-gray-700',
    payment_pending: 'bg-amber-100 text-amber-800',
    submitted: 'bg-blue-100 text-blue-800',
    under_review: 'bg-indigo-100 text-indigo-800',
    site_visit_done: 'bg-cyan-100 text-cyan-800',
    approved: 'bg-emerald-100 text-emerald-800',
    rejected: 'bg-rose-100 text-rose-800',
  }
  return map[s] || 'bg-gray-100 text-gray-700'
}

function licenseBadgeClass(l: License) {
  return {
    active: 'bg-emerald-100 text-emerald-800',
    expiring: 'bg-amber-100 text-amber-800',
    expired: 'bg-gray-100 text-gray-600',
    revoked: 'bg-rose-100 text-rose-800',
  }[l.statusLabel]
}

function licenseStatusLabel(l: License) {
  return {
    active: 'Действует',
    expiring: 'Истекает',
    expired: 'Истекла',
    revoked: 'Отозвана',
  }[l.statusLabel]
}

function formatDate(d?: string) {
  return d ? new Date(d).toLocaleDateString('ru-RU') : '—'
}

async function downloadCsv() {
  const blob = await licenseRegistryApi.exportCsvUrl(typeFilter.value || undefined)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'licenses-registry.csv'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function openApp(a: LicenseApplication) {
  router.push(`/employee/license-applications/${a.id}`)
}
</script>

<template>
  <DashboardLayout :role-title="roleTitle" :menu-items="menuItems">
    <div class="px-6 py-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Лицензии</h1>
          <p class="text-sm text-gray-500 mt-1">Реестр выданных лицензий и заявок на рассмотрение</p>
        </div>
        <button
          v-if="activeTab === 'licenses'"
          @click="downloadCsv"
          class="px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg text-sm font-medium flex items-center gap-2"
        >
          📥 Экспорт в CSV
        </button>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6">
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div class="text-xs text-blue-700">Подано</div>
          <div class="text-2xl font-bold text-blue-900 mt-1">{{ licenseStore.state.statusCounts.submitted || 0 }}</div>
        </div>
        <div class="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <div class="text-xs text-indigo-700">На рассмотрении</div>
          <div class="text-2xl font-bold text-indigo-900 mt-1">{{ licenseStore.state.statusCounts.under_review || 0 }}</div>
        </div>
        <div class="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
          <div class="text-xs text-cyan-700">Выезд проведён</div>
          <div class="text-2xl font-bold text-cyan-900 mt-1">{{ licenseStore.state.statusCounts.site_visit_done || 0 }}</div>
        </div>
        <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <div class="text-xs text-emerald-700">Выдано</div>
          <div class="text-2xl font-bold text-emerald-900 mt-1">{{ licenseStore.state.statusCounts.approved || 0 }}</div>
        </div>
        <div class="bg-rose-50 border border-rose-200 rounded-lg p-4">
          <div class="text-xs text-rose-700">Просрочено</div>
          <div class="text-2xl font-bold text-rose-900 mt-1">{{ licenseStore.state.statusCounts.overdue || 0 }}</div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex border-b border-gray-200 mb-4">
        <button
          @click="activeTab = 'applications'"
          :class="[
            'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
            activeTab === 'applications'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-gray-500 hover:text-gray-700',
          ]"
        >
          Заявки ({{ licenseStore.state.adminApplications.length }})
        </button>
        <button
          @click="activeTab = 'licenses'"
          :class="[
            'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
            activeTab === 'licenses'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-gray-500 hover:text-gray-700',
          ]"
        >
          Выданные лицензии ({{ licenseStore.state.adminLicenses.length }})
        </button>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg border border-gray-200 p-4 mb-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <input
          v-model="search"
          type="text"
          placeholder="Поиск по ИНН, наименованию, номеру…"
          class="px-3 py-2 border border-gray-300 rounded-md text-sm md:col-span-2"
        />
        <select
          v-if="activeTab === 'applications'"
          v-model="statusFilter"
          @change="loadApplications"
          class="px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="">Все статусы</option>
          <option v-for="opt in licenseStore.state.applicationStatusesEnum" :key="opt.value" :value="opt.value">{{ opt.labelRu }}</option>
        </select>
        <select
          v-model="typeFilter"
          @change="activeTab === 'applications' ? loadApplications() : loadLicenses()"
          class="px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="">Все виды лицензий</option>
          <option v-for="opt in licenseStore.state.licenseTypesEnum" :key="opt.value" :value="opt.value">{{ opt.labelRu }}</option>
        </select>
        <label v-if="activeTab === 'applications'" class="flex items-center gap-2 text-sm text-gray-700 md:col-span-1">
          <input v-model="overdueOnly" type="checkbox" @change="loadApplications" />
          Только просроченные
        </label>
      </div>

      <!-- Applications Table -->
      <div v-if="activeTab === 'applications'">
        <div v-if="licenseStore.state.loading" class="text-center py-12 text-gray-400">Загрузка…</div>
        <div v-else-if="filteredApps.length === 0" class="bg-white rounded-lg border border-gray-200 p-12 text-center text-gray-500">
          Заявок не найдено
        </div>
        <div v-else class="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">№</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Заявитель</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Вид лицензии</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Оплата</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Подана</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Срок</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr
                v-for="a in filteredApps"
                :key="a.id"
                class="hover:bg-gray-50 cursor-pointer"
                @click="openApp(a)"
              >
                <td class="px-4 py-3 font-medium">#{{ a.id }}</td>
                <td class="px-4 py-3">
                  <div class="font-medium">{{ a.applicantName }}</div>
                  <div class="text-xs text-gray-500">ИНН {{ a.applicantInn }}</div>
                </td>
                <td class="px-4 py-3">{{ licenseStore.labelForLicenseType(a.licenseType) }}</td>
                <td class="px-4 py-3">
                  <span :class="['inline-flex px-2 py-1 text-xs font-medium rounded-full', statusBadgeClass(a.status)]">
                    {{ licenseStore.labelForStatus(a.status) }}
                  </span>
                </td>
                <td class="px-4 py-3 text-xs">
                  <span v-if="a.payment && a.payment.status === 'SUCCESS'" class="text-emerald-600">✓ Онлайн</span>
                  <span v-else-if="a.payment && a.payment.status === 'MANUAL_CONFIRMED'" class="text-emerald-600">✓ Подтв. вручную</span>
                  <span v-else-if="a.payment && a.payment.status === 'PENDING' && a.payment.paymentMethod === 'MANUAL_OFFLINE'" class="text-amber-600">Ждёт подтв.</span>
                  <span v-else-if="a.payment && a.payment.status === 'PENDING'" class="text-amber-600">Ожидание</span>
                  <span v-else class="text-gray-400">—</span>
                </td>
                <td class="px-4 py-3 text-gray-600">{{ formatDate(a.submittedAt) }}</td>
                <td class="px-4 py-3 text-xs">
                  <span v-if="a.daysLeft !== undefined && a.deadline" :class="a.daysLeft < 5 ? 'text-rose-600 font-medium' : 'text-gray-600'">
                    {{ formatDate(a.deadline) }}
                    <span v-if="a.daysLeft < 0" class="block">просрочено</span>
                    <span v-else class="block">{{ a.daysLeft }} дн.</span>
                  </span>
                  <span v-else>—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Licenses Table -->
      <div v-else>
        <div v-if="licenseStore.state.loading" class="text-center py-12 text-gray-400">Загрузка…</div>
        <div v-else-if="filteredLicenses.length === 0" class="bg-white rounded-lg border border-gray-200 p-12 text-center text-gray-500">
          Лицензий не найдено
        </div>
        <div v-else class="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">№ лицензии</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Заявитель</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Вид</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Выдана</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действует до</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="l in filteredLicenses" :key="l.id" class="hover:bg-gray-50">
                <td class="px-4 py-3 font-mono font-medium">{{ l.licenseNumber }}</td>
                <td class="px-4 py-3">
                  <div class="font-medium">{{ l.applicantName }}</div>
                  <div class="text-xs text-gray-500">ИНН {{ l.applicantInn }}</div>
                </td>
                <td class="px-4 py-3">{{ licenseStore.labelForLicenseType(l.licenseType) }}</td>
                <td class="px-4 py-3 text-gray-600">{{ formatDate(l.issuedAt) }}</td>
                <td class="px-4 py-3 text-gray-600">{{ formatDate(l.validUntil) }}</td>
                <td class="px-4 py-3">
                  <span :class="['inline-flex px-2 py-1 text-xs font-medium rounded-full', licenseBadgeClass(l)]">
                    {{ licenseStatusLabel(l) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>
