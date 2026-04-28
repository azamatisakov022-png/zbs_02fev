<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import { useBusinessMenu } from '../../composables/useRoleMenu'
import { licenseStore } from '../../stores/licenses'
import type { LicenseApplication, LicenseApplicationStatus } from '../../types/licenses'

const router = useRouter()
const { roleTitle, menuItems, primaryAction } = useBusinessMenu()

const statusFilter = ref<LicenseApplicationStatus | ''>('')

onMounted(async () => {
  await Promise.all([licenseStore.loadMyApplications(), licenseStore.loadEnums()])
})

const filtered = computed<LicenseApplication[]>(() =>
  licenseStore.state.myApplications.filter(a =>
    !statusFilter.value || a.status === statusFilter.value,
  ),
)

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

function openDetail(a: LicenseApplication) {
  router.push(`/business/license-applications/${a.id}`)
}

function createNew() {
  router.push('/business/license-applications/new')
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('ru-RU')
}
</script>

<template>
  <DashboardLayout :role-title="roleTitle" :menu-items="menuItems" :primary-action="primaryAction">
    <div class="px-6 py-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Мои заявки на лицензию</h1>
          <p class="text-sm text-gray-500 mt-1">Управление заявками на лицензию в сфере обращения с отходами</p>
        </div>
        <button
          @click="createNew"
          class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
        >
          + Подать заявку
        </button>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <label class="block text-sm text-gray-600 mb-1">Статус</label>
        <select
          v-model="statusFilter"
          class="px-3 py-2 border border-gray-300 rounded-md text-sm w-full max-w-xs"
        >
          <option value="">Все статусы</option>
          <option
            v-for="opt in licenseStore.state.applicationStatusesEnum"
            :key="opt.value"
            :value="opt.value"
          >
            {{ opt.labelRu }}
          </option>
        </select>
      </div>

      <!-- List -->
      <div v-if="licenseStore.state.loading" class="text-center py-12 text-gray-400">Загрузка…</div>
      <div v-else-if="filtered.length === 0" class="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <div class="text-gray-500 mb-4">У вас пока нет заявок</div>
        <button
          @click="createNew"
          class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium"
        >
          Подать первую заявку
        </button>
      </div>
      <div v-else class="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">№</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Вид лицензии</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Подана</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Срок рассм.</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="app in filtered"
              :key="app.id"
              class="hover:bg-gray-50 cursor-pointer"
              @click="openDetail(app)"
            >
              <td class="px-4 py-3 text-gray-900 font-medium">#{{ app.id }}</td>
              <td class="px-4 py-3 text-gray-700">{{ licenseStore.labelForLicenseType(app.licenseType) }}</td>
              <td class="px-4 py-3">
                <span :class="['inline-flex px-2 py-1 text-xs font-medium rounded-full', statusBadgeClass(app.status)]">
                  {{ licenseStore.labelForStatus(app.status) }}
                </span>
              </td>
              <td class="px-4 py-3 text-gray-600">{{ formatDate(app.submittedAt) }}</td>
              <td class="px-4 py-3 text-gray-600">
                <span v-if="app.daysLeft !== undefined && app.deadline" :class="app.daysLeft < 5 ? 'text-rose-600 font-medium' : ''">
                  {{ formatDate(app.deadline) }}
                  <span v-if="app.daysLeft < 0" class="text-xs">(просрочено)</span>
                  <span v-else-if="app.daysLeft >= 0" class="text-xs">(осталось {{ app.daysLeft }} дн.)</span>
                </span>
                <span v-else>—</span>
              </td>
              <td class="px-4 py-3">
                <button
                  @click.stop="openDetail(app)"
                  class="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                >
                  Открыть →
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </DashboardLayout>
</template>
