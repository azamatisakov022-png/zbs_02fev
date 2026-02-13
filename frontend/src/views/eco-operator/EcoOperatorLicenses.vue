<script setup lang="ts">
import { ref, computed } from 'vue'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import { icons } from '../../utils/menuIcons'
import { calculationStore } from '../../stores/calculations'
import { reportStore } from '../../stores/reports'

const menuItems = computed(() => [
  { id: 'dashboard', label: 'Главная', icon: icons.dashboard, route: '/eco-operator' },
  { id: 'incoming-declarations', label: 'Входящие декларации', icon: icons.document, route: '/eco-operator/incoming-declarations' },
  { id: 'incoming-reports', label: 'Входящие отчёты', icon: icons.report, route: '/eco-operator/incoming-reports', badge: reportStore.getPendingCount() },
  { id: 'incoming-calculations', label: 'Входящие расчёты', icon: icons.calculator, route: '/eco-operator/incoming-calculations', badge: calculationStore.getPendingCount() },
  { id: 'licenses', label: 'Лицензии и документы', icon: icons.license, route: '/eco-operator/licenses' },
  { id: 'waste-types', label: 'Виды отходов', icon: icons.recycle, route: '/eco-operator/waste-types' },
  { id: 'my-reports', label: 'Мои отчёты', icon: icons.registries, route: '/eco-operator/my-reports' },
  { id: 'payments', label: 'Аналитика платежей', icon: icons.money, route: '/eco-operator/payments' },
  { id: 'analytics', label: 'Аналитика', icon: icons.analytics, route: '/eco-operator/analytics' },
  { id: 'profile', label: 'Профили компаний', icon: icons.profile, route: '/eco-operator/profile' },
])

// Tab state
const activeTab = ref<'licenses' | 'documents'>('licenses')

// Licenses data
interface License {
  id: number
  type: string
  number: string
  issuedBy: string
  issueDate: string
  expiryDate: string
  status: 'active' | 'expiring' | 'expired'
  wasteTypes: string[]
  activities: string[]
}

const licenses = ref<License[]>([
  {
    id: 1,
    type: 'Лицензия на сбор и переработку отходов',
    number: 'ЛЦ-2024/0156',
    issuedBy: 'Министерство природных ресурсов КР',
    issueDate: '2024-01-15',
    expiryDate: '2029-01-15',
    status: 'active',
    wasteTypes: ['Пластик (ПЭТ)', 'Пластик (ПП, ПЭ)', 'Бумага и картон'],
    activities: ['Сбор', 'Сортировка', 'Переработка', 'Хранение'],
  },
  {
    id: 2,
    type: 'Лицензия на обращение с опасными отходами',
    number: 'ЛЦ-2023/0089',
    issuedBy: 'Министерство природных ресурсов КР',
    issueDate: '2023-06-20',
    expiryDate: '2025-06-20',
    status: 'expiring',
    wasteTypes: ['Батареи и аккумуляторы', 'Электронные отходы'],
    activities: ['Сбор', 'Транспортировка', 'Обезвреживание'],
  },
  {
    id: 3,
    type: 'Разрешение на выбросы',
    number: 'РВ-2022/0234',
    issuedBy: 'Государственное агентство охраны окружающей среды',
    issueDate: '2022-03-10',
    expiryDate: '2024-03-10',
    status: 'expired',
    wasteTypes: [],
    activities: ['Эксплуатация оборудования'],
  },
])

// Documents data
interface Document {
  id: number
  name: string
  type: string
  uploadDate: string
  expiryDate: string | null
  status: 'valid' | 'expiring' | 'expired'
  fileSize: string
}

const documents = ref<Document[]>([
  {
    id: 1,
    name: 'Устав организации',
    type: 'Учредительный документ',
    uploadDate: '2023-01-10',
    expiryDate: null,
    status: 'valid',
    fileSize: '2.4 MB',
  },
  {
    id: 2,
    name: 'Свидетельство о регистрации',
    type: 'Регистрационный документ',
    uploadDate: '2023-01-10',
    expiryDate: null,
    status: 'valid',
    fileSize: '1.1 MB',
  },
  {
    id: 3,
    name: 'Сертификат ISO 14001:2015',
    type: 'Сертификат',
    uploadDate: '2023-05-15',
    expiryDate: '2026-05-15',
    status: 'valid',
    fileSize: '856 KB',
  },
  {
    id: 4,
    name: 'Сертификат ISO 9001:2015',
    type: 'Сертификат',
    uploadDate: '2023-05-15',
    expiryDate: '2025-05-15',
    status: 'expiring',
    fileSize: '912 KB',
  },
  {
    id: 5,
    name: 'Договор аренды помещения',
    type: 'Договор',
    uploadDate: '2024-01-01',
    expiryDate: '2025-12-31',
    status: 'valid',
    fileSize: '3.2 MB',
  },
  {
    id: 6,
    name: 'Страховой полис',
    type: 'Страхование',
    uploadDate: '2024-02-01',
    expiryDate: '2025-02-01',
    status: 'expiring',
    fileSize: '567 KB',
  },
])

// Stats
const stats = computed(() => ({
  activeLicenses: licenses.value.filter(l => l.status === 'active').length,
  expiringLicenses: licenses.value.filter(l => l.status === 'expiring').length,
  expiredLicenses: licenses.value.filter(l => l.status === 'expired').length,
  totalDocuments: documents.value.length,
}))

// Format date
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('ru-RU')
}

// Days until expiry
const daysUntilExpiry = (dateStr: string) => {
  const expiry = new Date(dateStr)
  const today = new Date()
  const diff = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  return diff
}

// Status badge class
const getStatusClass = (status: string) => {
  switch (status) {
    case 'active':
    case 'valid':
      return 'bg-green-100 text-green-700'
    case 'expiring':
      return 'bg-yellow-100 text-yellow-700'
    case 'expired':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'active':
    case 'valid':
      return 'Действует'
    case 'expiring':
      return 'Истекает'
    case 'expired':
      return 'Истекла'
    default:
      return status
  }
}

// Modal states
const showUploadModal = ref(false)
const showLicenseModal = ref(false)
const selectedLicense = ref<License | null>(null)

// Upload form
const uploadForm = ref({
  name: '',
  type: 'Сертификат',
  expiryDate: '',
  files: [] as File[],
})

const documentTypes = [
  'Учредительный документ',
  'Регистрационный документ',
  'Сертификат',
  'Договор',
  'Страхование',
  'Разрешение',
  'Прочее',
]

const openLicenseDetails = (license: License) => {
  selectedLicense.value = license
  showLicenseModal.value = true
}

const handleFileDrop = (event: DragEvent) => {
  event.preventDefault()
  const files = event.dataTransfer?.files
  if (files) {
    uploadForm.value.files = Array.from(files)
  }
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    uploadForm.value.files = Array.from(target.files)
  }
}

const submitUpload = () => {
  alert('Документ загружен!')
  showUploadModal.value = false
  uploadForm.value = { name: '', type: 'Сертификат', expiryDate: '', files: [] }
}
</script>

<template>
  <DashboardLayout
    role="eco-operator"
    roleTitle="ГП «Эко Оператор»"
    userName="ОсОО «ЭкоПереработка»"
    :menuItems="menuItems"
  >
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Лицензии и документы</h1>
          <p class="text-gray-600 mt-1">Управление разрешительной документацией</p>
        </div>
        <button
          @click="showUploadModal = true"
          class="px-4 py-2 bg-lime-600 text-white rounded-lg font-medium hover:bg-lime-700 transition-colors flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Загрузить документ
        </button>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900">{{ stats.activeLicenses }}</p>
              <p class="text-sm text-gray-500">Активных лицензий</p>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900">{{ stats.expiringLicenses }}</p>
              <p class="text-sm text-gray-500">Истекают скоро</p>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900">{{ stats.expiredLicenses }}</p>
              <p class="text-sm text-gray-500">Требуют продления</p>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900">{{ stats.totalDocuments }}</p>
              <p class="text-sm text-gray-500">Всего документов</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="border-b border-gray-200">
        <nav class="flex gap-8">
          <button
            @click="activeTab = 'licenses'"
            :class="[
              'pb-4 px-1 font-medium text-sm border-b-2 transition-colors',
              activeTab === 'licenses'
                ? 'border-lime-600 text-lime-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            ]"
          >
            Лицензии и разрешения
          </button>
          <button
            @click="activeTab = 'documents'"
            :class="[
              'pb-4 px-1 font-medium text-sm border-b-2 transition-colors',
              activeTab === 'documents'
                ? 'border-lime-600 text-lime-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            ]"
          >
            Документы компании
          </button>
        </nav>
      </div>

      <!-- Licenses Tab -->
      <div v-if="activeTab === 'licenses'" class="space-y-4">
        <div
          v-for="license in licenses"
          :key="license.id"
          class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
        >
          <div class="p-5">
            <div class="flex items-start justify-between">
              <div class="flex items-start gap-4">
                <div
                  class="w-12 h-12 rounded-xl flex items-center justify-center"
                  :class="license.status === 'active' ? 'bg-lime-100' : license.status === 'expiring' ? 'bg-yellow-100' : 'bg-red-100'"
                >
                  <svg
                    class="w-6 h-6"
                    :class="license.status === 'active' ? 'text-lime-600' : license.status === 'expiring' ? 'text-yellow-600' : 'text-red-600'"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900">{{ license.type }}</h3>
                  <p class="text-sm text-gray-500 mt-0.5">№ {{ license.number }}</p>
                  <p class="text-sm text-gray-500">{{ license.issuedBy }}</p>
                </div>
              </div>
              <span :class="['px-3 py-1 rounded-full text-sm font-medium', getStatusClass(license.status)]">
                {{ getStatusText(license.status) }}
              </span>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-100">
              <div>
                <p class="text-xs text-gray-500">Дата выдачи</p>
                <p class="text-sm font-medium text-gray-900">{{ formatDate(license.issueDate) }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500">Действует до</p>
                <p class="text-sm font-medium" :class="license.status === 'expired' ? 'text-red-600' : 'text-gray-900'">
                  {{ formatDate(license.expiryDate) }}
                </p>
              </div>
              <div>
                <p class="text-xs text-gray-500">Осталось дней</p>
                <p
                  class="text-sm font-medium"
                  :class="daysUntilExpiry(license.expiryDate) < 0 ? 'text-red-600' : daysUntilExpiry(license.expiryDate) < 90 ? 'text-yellow-600' : 'text-green-600'"
                >
                  {{ daysUntilExpiry(license.expiryDate) < 0 ? 'Истекла' : daysUntilExpiry(license.expiryDate) + ' дней' }}
                </p>
              </div>
              <div class="flex justify-end items-center">
                <button
                  @click="openLicenseDetails(license)"
                  class="text-lime-600 hover:text-lime-700 font-medium text-sm"
                >
                  Подробнее →
                </button>
              </div>
            </div>

            <!-- Activities tags -->
            <div class="flex flex-wrap gap-2 mt-4">
              <span
                v-for="activity in license.activities"
                :key="activity"
                class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
              >
                {{ activity }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Documents Tab -->
      <div v-if="activeTab === 'documents'" class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Документ</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Тип</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Загружен</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Действует до</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Статус</th>
              <th class="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Действия</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="doc in documents" :key="doc.id" class="hover:bg-gray-50">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-lime-50 rounded-lg flex items-center justify-center">
                    <svg class="w-5 h-5 text-lime-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">{{ doc.name }}</p>
                    <p class="text-sm text-gray-500">{{ doc.fileSize }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ doc.type }}</td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ formatDate(doc.uploadDate) }}</td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ doc.expiryDate ? formatDate(doc.expiryDate) : '—' }}</td>
              <td class="px-6 py-4">
                <span :class="['px-2 py-1 rounded-full text-xs font-medium', getStatusClass(doc.status)]">
                  {{ getStatusText(doc.status) }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center justify-center gap-2">
                  <button class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#3B82F6] text-white hover:bg-[#2563EB] transition-colors shadow-sm">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Просмотреть
                  </button>
                  <button class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#8B5CF6] text-white hover:bg-[#7C3AED] transition-colors shadow-sm">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Скачать
                  </button>
                  <button class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#EF4444] text-white hover:bg-[#DC2626] transition-colors shadow-sm">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Удалить
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- License Details Modal -->
    <Teleport to="body">
      <div v-if="showLicenseModal && selectedLicense" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">Детали лицензии</h3>
            <button @click="showLicenseModal = false" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="p-6 space-y-6">
            <div class="flex items-start gap-4">
              <div class="w-14 h-14 bg-lime-100 rounded-xl flex items-center justify-center">
                <svg class="w-7 h-7 text-lime-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div>
                <h4 class="text-xl font-bold text-gray-900">{{ selectedLicense.type }}</h4>
                <p class="text-gray-500">№ {{ selectedLicense.number }}</p>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="bg-gray-50 rounded-lg p-4">
                <p class="text-sm text-gray-500">Кем выдана</p>
                <p class="font-medium text-gray-900">{{ selectedLicense.issuedBy }}</p>
              </div>
              <div class="bg-gray-50 rounded-lg p-4">
                <p class="text-sm text-gray-500">Статус</p>
                <span :class="['px-2 py-1 rounded-full text-sm font-medium', getStatusClass(selectedLicense.status)]">
                  {{ getStatusText(selectedLicense.status) }}
                </span>
              </div>
              <div class="bg-gray-50 rounded-lg p-4">
                <p class="text-sm text-gray-500">Дата выдачи</p>
                <p class="font-medium text-gray-900">{{ formatDate(selectedLicense.issueDate) }}</p>
              </div>
              <div class="bg-gray-50 rounded-lg p-4">
                <p class="text-sm text-gray-500">Действует до</p>
                <p class="font-medium text-gray-900">{{ formatDate(selectedLicense.expiryDate) }}</p>
              </div>
            </div>

            <div>
              <h5 class="font-medium text-gray-900 mb-2">Виды разрешённой деятельности</h5>
              <div class="flex flex-wrap gap-2">
                <span v-for="activity in selectedLicense.activities" :key="activity" class="px-3 py-1.5 bg-lime-100 text-lime-700 rounded-lg text-sm font-medium">
                  {{ activity }}
                </span>
              </div>
            </div>

            <div v-if="selectedLicense.wasteTypes.length > 0">
              <h5 class="font-medium text-gray-900 mb-2">Виды отходов</h5>
              <div class="flex flex-wrap gap-2">
                <span v-for="wt in selectedLicense.wasteTypes" :key="wt" class="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                  {{ wt }}
                </span>
              </div>
            </div>

            <div class="flex gap-3 pt-4 border-t border-gray-200">
              <button class="flex-1 px-4 py-2 bg-lime-600 text-white rounded-lg font-medium hover:bg-lime-700 transition-colors">
                Скачать PDF
              </button>
              <button @click="showLicenseModal = false" class="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                Закрыть
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Upload Modal -->
    <Teleport to="body">
      <div v-if="showUploadModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl shadow-xl max-w-lg w-full">
          <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">Загрузить документ</h3>
            <button @click="showUploadModal = false" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Название документа *</label>
              <input
                v-model="uploadForm.name"
                type="text"
                placeholder="Введите название"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Тип документа</label>
              <select
                v-model="uploadForm.type"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
              >
                <option v-for="type in documentTypes" :key="type" :value="type">{{ type }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Срок действия (если есть)</label>
              <input
                v-model="uploadForm.expiryDate"
                type="date"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Файл *</label>
              <div
                @drop="handleFileDrop"
                @dragover.prevent
                class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-lime-500 transition-colors cursor-pointer"
              >
                <input type="file" class="hidden" id="file-upload" @change="handleFileSelect" />
                <label for="file-upload" class="cursor-pointer">
                  <svg class="w-10 h-10 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p v-if="uploadForm.files.length === 0" class="text-gray-500">
                    Перетащите файл или <span class="text-lime-600 font-medium">выберите</span>
                  </p>
                  <p v-else class="text-lime-600 font-medium">{{ uploadForm.files[0].name }}</p>
                </label>
              </div>
            </div>
          </div>
          <div class="px-6 py-4 border-t border-gray-200 flex gap-3">
            <button
              @click="showUploadModal = false"
              class="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Отмена
            </button>
            <button
              @click="submitUpload"
              :disabled="!uploadForm.name || uploadForm.files.length === 0"
              class="flex-1 px-4 py-2 bg-lime-600 text-white rounded-lg font-medium hover:bg-lime-700 transition-colors disabled:opacity-50"
            >
              Загрузить
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </DashboardLayout>
</template>
