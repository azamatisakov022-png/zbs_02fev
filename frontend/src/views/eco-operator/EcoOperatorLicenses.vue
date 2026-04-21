<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import { useEcoOperatorMenu } from '../../composables/useRoleMenu'
import { licenseStore } from '../../stores/licenses'
import { licenseRegistryApi } from '../../api/licenses'
import type { License, LicenseType } from '../../types/licenses'

/**
 * Реестр выданных лицензий для ЭкоОператора (read-only).
 * Используется для проверки наличия лицензии у переработчиков,
 * полигонов и пунктов приёма, с которыми взаимодействуют клиенты.
 */

const { roleTitle, menuItems } = useEcoOperatorMenu()

const typeFilter = ref<LicenseType | ''>('')
const search = ref('')

onMounted(async () => {
  await licenseStore.loadEnums()
  await licenseStore.loadRegistry()
})

async function changeType() {
  await licenseStore.loadRegistry(typeFilter.value || undefined)
}

const filtered = computed<License[]>(() => {
  const s = search.value.toLowerCase().trim()
  if (!s) return licenseStore.state.adminLicenses
  return licenseStore.state.adminLicenses.filter(
    l =>
      l.licenseNumber.toLowerCase().includes(s) ||
      l.applicantName.toLowerCase().includes(s) ||
      l.applicantInn.toLowerCase().includes(s),
  )
})

const activeCount = computed(() => filtered.value.filter(l => l.statusLabel === 'active').length)
const expiringCount = computed(() => filtered.value.filter(l => l.statusLabel === 'expiring').length)
const expiredCount = computed(() => filtered.value.filter(l => l.statusLabel === 'expired' || l.statusLabel === 'revoked').length)

function statusLabel(l: License) {
  return {
    active: 'Действует',
    expiring: 'Истекает',
    expired: 'Истекла',
    revoked: 'Отозвана',
  }[l.statusLabel]
}

function statusClass(l: License) {
  return {
    active: 'bg-emerald-100 text-emerald-800',
    expiring: 'bg-amber-100 text-amber-800',
    expired: 'bg-gray-100 text-gray-600',
    revoked: 'bg-rose-100 text-rose-800',
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
</script>

<template>
  <DashboardLayout role="eco-operator" :role-title="roleTitle" :menu-items="menuItems">
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Реестр лицензий</h1>
          <p class="text-sm text-gray-500 mt-1">
            Проверка наличия действующих лицензий у переработчиков, полигонов и пунктов приёма.
            Просмотр только для чтения — выдача и отзыв лицензий производится сотрудниками МПРЭТН.
          </p>
        </div>
        <button
          @click="downloadCsv"
          class="px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg text-sm font-medium flex items-center gap-2"
        >
          📥 Экспорт в CSV
        </button>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div class="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div class="text-xs text-gray-500">Всего</div>
          <div class="text-2xl font-bold text-gray-900 mt-1">{{ filtered.length }}</div>
        </div>
        <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-4 shadow-sm">
          <div class="text-xs text-emerald-700">Действующих</div>
          <div class="text-2xl font-bold text-emerald-900 mt-1">{{ activeCount }}</div>
        </div>
        <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-sm">
          <div class="text-xs text-amber-700">Истекают скоро</div>
          <div class="text-2xl font-bold text-amber-900 mt-1">{{ expiringCount }}</div>
        </div>
        <div class="bg-gray-100 border border-gray-200 rounded-xl p-4 shadow-sm">
          <div class="text-xs text-gray-700">Истёкшие / отозваны</div>
          <div class="text-2xl font-bold text-gray-900 mt-1">{{ expiredCount }}</div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-xl border border-gray-200 p-4 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          v-model="search"
          type="text"
          placeholder="Поиск по № лицензии, ИНН, наименованию…"
          class="px-3 py-2 border border-gray-300 rounded-md text-sm md:col-span-2"
        />
        <select
          v-model="typeFilter"
          @change="changeType"
          class="px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="">Все виды лицензий</option>
          <option v-for="opt in licenseStore.state.licenseTypesEnum" :key="opt.value" :value="opt.value">{{ opt.labelRu }}</option>
        </select>
      </div>

      <!-- Table -->
      <div v-if="licenseStore.state.loading" class="text-center py-12 text-gray-400">Загрузка…</div>
      <div v-else-if="filtered.length === 0" class="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500 shadow-sm">
        Лицензий не найдено
      </div>
      <div v-else class="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">№ лицензии</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Заявитель</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Вид</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Выдана</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Действует до</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Статус</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="l in filtered" :key="l.id" class="hover:bg-gray-50">
              <td class="px-4 py-3 font-mono font-medium">{{ l.licenseNumber }}</td>
              <td class="px-4 py-3">
                <div class="font-medium">{{ l.applicantName }}</div>
                <div class="text-xs text-gray-500">ИНН {{ l.applicantInn }}</div>
              </td>
              <td class="px-4 py-3">{{ licenseStore.labelForLicenseType(l.licenseType) }}</td>
              <td class="px-4 py-3 text-gray-600">{{ formatDate(l.issuedAt) }}</td>
              <td class="px-4 py-3 text-gray-600">{{ formatDate(l.validUntil) }}</td>
              <td class="px-4 py-3">
                <span :class="['inline-flex px-2 py-1 text-xs font-medium rounded-full', statusClass(l)]">
                  {{ statusLabel(l) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </DashboardLayout>
</template>
