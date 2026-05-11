<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import { useBusinessMenu } from '../../composables/useRoleMenu'
import { licenseStore } from '../../stores/licenses'
import type { License } from '../../types/licenses'
import { authStore } from '../../stores/auth'
import { publicLicensesApi } from '../../api/licenses'

const { roleTitle, menuItems, primaryAction } = useBusinessMenu()

const myLicenses = ref<License[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    // Подгружаем публичный реестр с фильтром по моему ИНН - эндпоинт без авторизации,
    // но нам достаточно публичной информации для ЛК заявителя.
    const res = await publicLicensesApi.listPublished({
      search: authStore.state.user?.inn || '',
      size: 100,
    })
    myLicenses.value = res.content.filter(
      l => l.applicantInn === authStore.state.user?.inn,
    )
  } finally {
    loading.value = false
  }
  await licenseStore.loadEnums()
})

function statusLabel(status: License['statusLabel']) {
  return {
    active: 'Действует',
    expiring: 'Истекает',
    expired: 'Истекла',
    revoked: 'Отозвана',
  }[status]
}

function statusClass(status: License['statusLabel']) {
  return {
    active: 'bg-emerald-100 text-emerald-800',
    expiring: 'bg-amber-100 text-amber-800',
    expired: 'bg-gray-100 text-gray-600',
    revoked: 'bg-rose-100 text-rose-800',
  }[status]
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('ru-RU')
}
</script>

<template>
  <DashboardLayout :role-title="roleTitle" :menu-items="menuItems" :primary-action="primaryAction">
    <div class="px-6 py-6">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">Мои лицензии</h1>
      <p class="text-sm text-gray-500 mb-6">Выданные на моё предприятие лицензии</p>

      <div v-if="loading" class="text-center py-12 text-gray-400">Загрузка…</div>
      <div v-else-if="myLicenses.length === 0" class="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <div class="text-gray-500">Лицензий пока не выдано</div>
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="l in myLicenses"
          :key="l.id"
          class="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div class="flex items-start justify-between mb-3">
            <div>
              <div class="text-xs text-gray-500 uppercase">{{ licenseStore.labelForLicenseType(l.licenseType) }}</div>
              <div class="text-xl font-bold text-gray-900 mt-1">{{ l.licenseNumber }}</div>
            </div>
            <span :class="['inline-flex px-2 py-1 text-xs font-medium rounded-full', statusClass(l.statusLabel)]">
              {{ statusLabel(l.statusLabel) }}
            </span>
          </div>
          <dl class="text-sm space-y-1">
            <div class="flex justify-between"><dt class="text-gray-500">Выдана</dt><dd>{{ formatDate(l.issuedAt) }}</dd></div>
            <div class="flex justify-between"><dt class="text-gray-500">Действует до</dt><dd>{{ formatDate(l.validUntil) }}</dd></div>
          </dl>
          <div class="mt-3 text-xs text-gray-500">
            <div v-for="a in l.activityTypes" :key="a">• {{ a }}</div>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>
