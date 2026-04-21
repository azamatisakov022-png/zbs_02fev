<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { publicLicensesApi } from '../api/licenses'
import type { License, LicenseType, EnumItem } from '../types/licenses'

const licenses = ref<License[]>([])
const totalElements = ref(0)
const page = ref(0)
const size = ref(20)
const loading = ref(false)
const search = ref('')
const licenseTypes = ref<EnumItem<LicenseType>[]>([])

async function load() {
  loading.value = true
  try {
    const res = await publicLicensesApi.listPublished({
      search: search.value || undefined,
      page: page.value,
      size: size.value,
    })
    licenses.value = res.content
    totalElements.value = res.totalElements
    page.value = res.number
    size.value = res.size
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  licenseTypes.value = await publicLicensesApi.licenseTypes()
  await load()
})

const stats = computed(() => ({
  total: licenses.value.length,
  active: licenses.value.filter(l => l.statusLabel === 'active').length,
  expiring: licenses.value.filter(l => l.statusLabel === 'expiring').length,
  expired: licenses.value.filter(l => l.statusLabel === 'expired' || l.statusLabel === 'revoked').length,
}))

function licenseTypeLabel(t: LicenseType) {
  return licenseTypes.value.find(e => e.value === t)?.labelRu || t
}

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

let searchTimer: ReturnType<typeof setTimeout> | null = null
watch(search, () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    page.value = 0
    load()
  }, 400)
})

function goto(p: number) {
  if (p < 0) return
  const max = Math.ceil(totalElements.value / size.value) - 1
  if (p > max) return
  page.value = p
  load()
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-10">
      <div class="max-w-6xl mx-auto px-6">
        <h1 class="text-3xl font-bold mb-2">Реестр лицензий</h1>
        <p class="text-emerald-100">
          Публичный реестр лицензий в сфере обращения с отходами Кыргызской Республики.
          Поиск по номеру, ИНН или наименованию организации.
        </p>
      </div>
    </div>

    <div class="max-w-6xl mx-auto px-6 py-8">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div class="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div class="text-xs text-gray-500">Всего</div>
          <div class="text-2xl font-bold text-gray-900 mt-1">{{ totalElements }}</div>
        </div>
        <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-4 shadow-sm">
          <div class="text-xs text-emerald-700">Действующих</div>
          <div class="text-2xl font-bold text-emerald-900 mt-1">{{ stats.active }}</div>
        </div>
        <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-sm">
          <div class="text-xs text-amber-700">Истекают</div>
          <div class="text-2xl font-bold text-amber-900 mt-1">{{ stats.expiring }}</div>
        </div>
        <div class="bg-gray-100 border border-gray-200 rounded-xl p-4 shadow-sm">
          <div class="text-xs text-gray-700">Истекшие / отозваны</div>
          <div class="text-2xl font-bold text-gray-900 mt-1">{{ stats.expired }}</div>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-gray-200 p-4 shadow-sm mb-4">
        <input
          v-model="search"
          type="text"
          placeholder="Поиск по номеру лицензии (ЛП-2026-0001), ИНН или наименованию…"
          class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        />
      </div>

      <div v-if="loading" class="text-center py-12 text-gray-400">Загрузка…</div>
      <div v-else-if="licenses.length === 0" class="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500 shadow-sm">
        По вашему запросу лицензий не найдено
      </div>
      <div v-else class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">№ лицензии</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Организация</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Вид</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Выдана</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Действует до</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Статус</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="l in licenses" :key="l.id" class="hover:bg-gray-50">
              <td class="px-4 py-3 font-mono font-semibold text-gray-900">{{ l.licenseNumber }}</td>
              <td class="px-4 py-3">
                <div class="font-medium">{{ l.applicantName }}</div>
                <div class="text-xs text-gray-500">ИНН {{ l.applicantInn }}</div>
              </td>
              <td class="px-4 py-3">{{ licenseTypeLabel(l.licenseType) }}</td>
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

      <div v-if="totalElements > size" class="flex items-center justify-between mt-4 px-1">
        <div class="text-sm text-gray-500">
          Страница {{ page + 1 }} из {{ Math.ceil(totalElements / size) }}
        </div>
        <div class="flex gap-2">
          <button
            @click="goto(page - 1)"
            :disabled="page === 0"
            class="px-3 py-1.5 border border-gray-300 rounded-md text-sm disabled:opacity-40"
          >
            ← Назад
          </button>
          <button
            @click="goto(page + 1)"
            :disabled="page + 1 >= Math.ceil(totalElements / size)"
            class="px-3 py-1.5 border border-gray-300 rounded-md text-sm disabled:opacity-40"
          >
            Вперёд →
          </button>
        </div>
      </div>

      <p class="text-xs text-gray-400 text-center mt-6">
        Источник: Министерство природных ресурсов, экологии и технического надзора КР.
        Закон КР № 195 от 19.10.2023 «О лицензионно-разрешительной системе».
      </p>
    </div>
  </div>
</template>
