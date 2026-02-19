<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import { useEmployeeMenu } from '../../composables/useRoleMenu'
import {
  payerStore,
  formatMoney,
  categoryLabels,
  categoryColors,
  subcategoryLabels,
  reportingLabels,
  reportingColors,
  settlementLabels,
  settlementColors,
  systemStatusLabels,
  systemStatusColors,
  declarationStatusLabels,
  declarationStatusColors,
  paymentStatusLabels,
  paymentStatusColors,
  type Payer,
} from '../../stores/payers'

const route = useRoute()
const router = useRouter()
const { roleTitle, menuItems } = useEmployeeMenu()

// --- Payer data ---
const payerId = computed(() => Number(route.params.id))
const payer = computed(() => payerStore.getById(payerId.value))

// --- Avatar color by category ---
const avatarBgClass = computed(() => {
  if (!payer.value) return 'bg-gray-400'
  const map: Record<string, string> = {
    importer: 'bg-blue-600',
    producer: 'bg-purple-600',
    both: 'bg-indigo-600',
  }
  return map[payer.value.category] || 'bg-gray-400'
})

const avatarLetter = computed(() => {
  if (!payer.value) return '?'
  return payer.value.shortName.charAt(0).toUpperCase()
})

// --- Settlement display ---
const settlementDisplay = computed(() => {
  if (!payer.value) return { text: '', colorClass: '' }
  const s = payer.value.settlementStatus
  if (s === 'clear') return { text: 'Без задолженности', colorClass: 'text-green-800' }
  if (s === 'overpaid') return { text: '+' + formatMoney(payer.value.settlementAmount) + ' сом', colorClass: 'text-blue-800' }
  return { text: '-' + formatMoney(payer.value.settlementAmount) + ' сом', colorClass: 'text-red-800' }
})

const settlementCardClass = computed(() => {
  if (!payer.value) return ''
  const s = payer.value.settlementStatus
  if (s === 'clear') return 'bg-green-50 border-green-200'
  if (s === 'overpaid') return 'bg-blue-50 border-blue-200'
  return 'bg-red-50 border-red-200'
})

// --- Declarations pagination ---
const declarationsPage = ref(1)
const declarationsPerPage = 10

const paginatedDeclarations = computed(() => {
  if (!payer.value) return []
  const start = (declarationsPage.value - 1) * declarationsPerPage
  return payer.value.declarations.slice(start, start + declarationsPerPage)
})

const totalDeclarationPages = computed(() => {
  if (!payer.value) return 0
  return Math.ceil(payer.value.declarations.length / declarationsPerPage)
})

// --- Audit log "show all" ---
const showAllAudit = ref(false)
const auditLogVisible = computed(() => {
  if (!payer.value) return []
  if (showAllAudit.value) return payer.value.auditLog
  return payer.value.auditLog.slice(0, 10)
})

// --- Comments ---
const newCommentText = ref('')

function addComment() {
  const text = newCommentText.value.trim()
  if (!text || !payer.value) return
  payerStore.addComment(payerId.value, 'Мамытова А.К.', text)
  newCommentText.value = ''
}

const sortedComments = computed(() => {
  if (!payer.value) return []
  return [...payer.value.comments].reverse()
})

// --- Document upload modal ---
const showUploadModal = ref(false)
const uploadDocName = ref('')
const uploadFile = ref<File | null>(null)
const uploadError = ref('')

function openUploadModal() {
  uploadDocName.value = ''
  uploadFile.value = null
  uploadError.value = ''
  showUploadModal.value = true
}

function closeUploadModal() {
  showUploadModal.value = false
}

function onFileSelected(e: Event) {
  const input = e.target as HTMLInputElement
  if (!input.files || !input.files[0]) return
  const file = input.files[0]
  const allowed = ['application/pdf', 'image/jpeg', 'image/png']
  if (!allowed.includes(file.type)) {
    uploadError.value = 'Допустимые форматы: PDF, JPG, PNG'
    uploadFile.value = null
    return
  }
  if (file.size > 10 * 1024 * 1024) {
    uploadError.value = 'Максимальный размер файла: 10 МБ'
    uploadFile.value = null
    return
  }
  uploadError.value = ''
  uploadFile.value = file
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' Б'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' КБ'
  return (bytes / (1024 * 1024)).toFixed(1) + ' МБ'
}

function submitUpload() {
  if (!uploadFile.value || !uploadDocName.value.trim() || !payer.value) return
  const ext = uploadFile.value.name.split('.').pop() || 'pdf'
  payerStore.addDocument(payerId.value, uploadDocName.value.trim(), ext, formatFileSize(uploadFile.value.size))
  closeUploadModal()
}

// --- Document helpers ---
function docIconColor(type: string): string {
  const t = type.toLowerCase()
  if (t === 'pdf') return 'bg-red-50 text-red-500'
  if (t === 'jpg' || t === 'jpeg' || t === 'png') return 'bg-blue-50 text-blue-500'
  return 'bg-gray-50 text-gray-500'
}

function docTypeLabel(type: string): string {
  return type.toUpperCase()
}
</script>

<template>
  <DashboardLayout
    role="employee"
    :roleTitle="roleTitle"
    userName="Мамытова Айгуль"
    :menuItems="menuItems"
  >
    <!-- ==================== NOT FOUND STATE ==================== -->
    <div v-if="!payer" class="text-center py-20">
      <p class="text-xl text-gray-500 mb-4">Плательщик не найден</p>
      <button
        @click="router.push('/ministry/payers')"
        class="btn-back"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
        Назад
      </button>
    </div>

    <!-- ==================== MAIN CONTENT ==================== -->
    <template v-else>
      <!-- Back button -->
      <div class="mb-6">
        <button
          @click="router.push('/ministry/payers')"
          class="btn-back"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
          Назад
        </button>
      </div>

      <!-- ==================== HEADER CARD ==================== -->
      <div class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div class="flex flex-col md:flex-row md:items-center gap-4">
          <!-- Avatar -->
          <div
            :class="['w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white flex-shrink-0', avatarBgClass]"
          >
            {{ avatarLetter }}
          </div>

          <!-- Center info -->
          <div class="flex-1 min-w-0">
            <h1 class="text-2xl font-bold text-gray-900">{{ payer.name }}</h1>
            <div class="flex flex-wrap items-center gap-3 mt-1">
              <span class="text-sm text-gray-500">ИНН: <span class="font-mono font-medium text-gray-700">{{ payer.inn }}</span></span>
              <span class="text-sm text-gray-500">Дата регистрации: <span class="font-medium text-gray-700">{{ payer.registeredAt }}</span></span>
            </div>
          </div>

          <!-- Right badges -->
          <div class="flex flex-wrap items-center gap-2 flex-shrink-0">
            <span :class="['px-2.5 py-0.5 rounded-full text-xs font-semibold', systemStatusColors[payer.systemStatus]]">
              {{ systemStatusLabels[payer.systemStatus] }}
            </span>
            <span :class="['px-2.5 py-0.5 rounded-full text-xs font-semibold', categoryColors[payer.category]]">
              {{ categoryLabels[payer.category] }}
            </span>
            <span
              v-if="payer.subcategory"
              class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700"
            >
              {{ subcategoryLabels[payer.subcategory] }}
            </span>
          </div>
        </div>
      </div>

      <!-- ==================== BLOCK 1: General Info ==================== -->
      <div class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 class="text-lg font-bold text-gray-900 mb-4">Общая информация</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-0">
          <!-- Left column -->
          <div class="flex justify-between py-2 border-b border-gray-100">
            <span class="text-sm text-gray-500">Полное наименование</span>
            <span class="text-sm font-medium text-gray-900 text-right">{{ payer.name }}</span>
          </div>
          <!-- Right column -->
          <div class="flex justify-between py-2 border-b border-gray-100">
            <span class="text-sm text-gray-500">Контактное лицо</span>
            <span class="text-sm font-medium text-gray-900 text-right">{{ payer.contactPerson }}</span>
          </div>

          <div class="flex justify-between py-2 border-b border-gray-100">
            <span class="text-sm text-gray-500">ОПФ</span>
            <span class="text-sm font-medium text-gray-900">{{ payer.opf }}</span>
          </div>
          <div class="flex justify-between py-2 border-b border-gray-100">
            <span class="text-sm text-gray-500">Телефон</span>
            <span class="text-sm font-medium text-gray-900">{{ payer.contactPhone }}</span>
          </div>

          <div class="flex justify-between py-2 border-b border-gray-100">
            <span class="text-sm text-gray-500">ИНН</span>
            <span class="text-sm font-medium text-gray-900 font-mono">{{ payer.inn }}</span>
          </div>
          <div class="flex justify-between py-2 border-b border-gray-100">
            <span class="text-sm text-gray-500">Email</span>
            <a :href="'mailto:' + payer.contactEmail" class="text-sm font-medium text-teal-600 hover:text-teal-700">{{ payer.contactEmail }}</a>
          </div>

          <div class="flex justify-between py-2 border-b border-gray-100">
            <span class="text-sm text-gray-500">Регион</span>
            <span class="text-sm font-medium text-gray-900 text-right">{{ payer.region }}</span>
          </div>
          <div class="flex justify-between py-2 border-b border-gray-100">
            <span class="text-sm text-gray-500">Руководитель</span>
            <span class="text-sm font-medium text-gray-900 text-right">{{ payer.director }}</span>
          </div>

          <div class="flex justify-between py-2 border-b border-gray-100">
            <span class="text-sm text-gray-500">Юридический адрес</span>
            <span class="text-sm font-medium text-gray-900 text-right max-w-xs">{{ payer.legalAddress }}</span>
          </div>
          <div class="flex justify-between py-2 border-b border-gray-100">
            <span class="text-sm text-gray-500">Должность</span>
            <span class="text-sm font-medium text-gray-900 text-right">{{ payer.directorPosition }}</span>
          </div>

          <div class="flex justify-between py-2 border-b border-gray-100">
            <span class="text-sm text-gray-500">Фактический адрес</span>
            <span class="text-sm font-medium text-gray-900 text-right max-w-xs">{{ payer.actualAddress }}</span>
          </div>
          <div class="flex justify-between py-2 border-b border-gray-100">
            <span class="text-sm text-gray-500">Веб-сайт</span>
            <a
              v-if="payer.website"
              :href="'https://' + payer.website"
              target="_blank"
              class="text-sm font-medium text-teal-600 hover:text-teal-700"
            >{{ payer.website }}</a>
            <span v-else class="text-sm text-gray-400">&mdash;</span>
          </div>

          <div class="flex justify-between py-2 border-b border-gray-100">
            <span class="text-sm text-gray-500">ОКЭД</span>
            <span class="text-sm font-medium text-gray-900 text-right max-w-xs">{{ payer.oked }}</span>
          </div>
          <div class="flex justify-between py-2 border-b border-gray-100">
            <span class="text-sm text-gray-500">Подкатегория</span>
            <span v-if="payer.subcategory" class="text-sm font-medium text-gray-900">{{ subcategoryLabels[payer.subcategory] }}</span>
            <span v-else class="text-sm text-gray-400">&mdash;</span>
          </div>
        </div>
      </div>

      <!-- ==================== BLOCK 2: Financial Summary ==================== -->
      <div class="mb-6">
        <h2 class="text-lg font-bold text-gray-900 mb-4">Финансовая сводка</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Charged -->
          <div class="bg-green-50 border border-green-200 rounded-xl p-4">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                </svg>
              </div>
              <p class="text-xs font-medium text-green-600">Начислено за 2026</p>
            </div>
            <p class="text-2xl font-bold text-green-800">{{ formatMoney(payer.totalCharged) }} <span class="text-sm font-medium">сом</span></p>
          </div>

          <!-- Paid -->
          <div class="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p class="text-xs font-medium text-blue-600">Оплачено за 2026</p>
            </div>
            <p class="text-2xl font-bold text-blue-800">{{ formatMoney(payer.totalPaid) }} <span class="text-sm font-medium">сом</span></p>
          </div>

          <!-- Settlement -->
          <div :class="['rounded-xl p-4 border', settlementCardClass]">
            <div class="flex items-center gap-3 mb-2">
              <div :class="['w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                payer.settlementStatus === 'clear' ? 'bg-green-100' : payer.settlementStatus === 'overpaid' ? 'bg-blue-100' : 'bg-red-100']">
                <svg class="w-5 h-5" :class="payer.settlementStatus === 'clear' ? 'text-green-600' : payer.settlementStatus === 'overpaid' ? 'text-blue-600' : 'text-red-600'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <p :class="['text-xs font-medium', payer.settlementStatus === 'clear' ? 'text-green-600' : payer.settlementStatus === 'overpaid' ? 'text-blue-600' : 'text-red-600']">Задолженность / Переплата</p>
            </div>
            <p :class="['text-2xl font-bold', settlementDisplay.colorClass]">{{ settlementDisplay.text }}</p>
          </div>

          <!-- Declarations count -->
          <div class="bg-purple-50 border border-purple-200 rounded-xl p-4">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p class="text-xs font-medium text-purple-600">Деклараций подано</p>
            </div>
            <p class="text-2xl font-bold text-purple-800">{{ payer.declarationsCount }}</p>
          </div>
        </div>
      </div>

      <!-- ==================== BLOCK 3: Declarations History ==================== -->
      <div class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 class="text-lg font-bold text-gray-900 mb-4">История деклараций</h2>
        <div v-if="payer.declarations.length > 0" class="overflow-x-auto">
          <table class="w-full text-sm border-collapse">
            <thead class="bg-gray-50">
              <tr>
                <th class="text-left px-4 py-3 font-medium text-gray-500 border-b border-gray-200"># декларации</th>
                <th class="text-left px-4 py-3 font-medium text-gray-500 border-b border-gray-200">Период</th>
                <th class="text-left px-4 py-3 font-medium text-gray-500 border-b border-gray-200">Тип операции</th>
                <th class="text-right px-4 py-3 font-medium text-gray-500 border-b border-gray-200">Масса, тонн</th>
                <th class="text-right px-4 py-3 font-medium text-gray-500 border-b border-gray-200">Сумма сбора</th>
                <th class="text-center px-4 py-3 font-medium text-gray-500 border-b border-gray-200">Статус</th>
                <th class="text-left px-4 py-3 font-medium text-gray-500 border-b border-gray-200">Дата подачи</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="d in paginatedDeclarations" :key="d.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-4 py-3 font-medium text-gray-900 border-b border-gray-100 whitespace-nowrap">{{ d.id }}</td>
                <td class="px-4 py-3 text-gray-700 border-b border-gray-100">{{ d.period }}</td>
                <td class="px-4 py-3 text-gray-700 border-b border-gray-100">{{ d.operationType }}</td>
                <td class="px-4 py-3 text-right text-gray-700 border-b border-gray-100">{{ d.mass }}</td>
                <td class="px-4 py-3 text-right font-medium text-gray-900 border-b border-gray-100 whitespace-nowrap">{{ formatMoney(d.amount) }} сом</td>
                <td class="px-4 py-3 text-center border-b border-gray-100">
                  <span :class="['px-2.5 py-0.5 rounded-full text-xs font-semibold', declarationStatusColors[d.status]]">
                    {{ declarationStatusLabels[d.status] }}
                  </span>
                </td>
                <td class="px-4 py-3 text-gray-700 border-b border-gray-100">{{ d.submittedAt || '&mdash;' }}</td>
              </tr>
            </tbody>
          </table>

          <!-- Pagination -->
          <div v-if="totalDeclarationPages > 1" class="flex items-center justify-center gap-2 mt-4">
            <button
              @click="declarationsPage--"
              :disabled="declarationsPage <= 1"
              class="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Назад
            </button>
            <span class="text-sm text-gray-500">Страница {{ declarationsPage }} из {{ totalDeclarationPages }}</span>
            <button
              @click="declarationsPage++"
              :disabled="declarationsPage >= totalDeclarationPages"
              class="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Далее
            </button>
          </div>
        </div>
        <p v-else class="text-sm text-gray-400 text-center py-6">Нет деклараций</p>
      </div>

      <!-- ==================== BLOCK 4: Payments History ==================== -->
      <div class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 class="text-lg font-bold text-gray-900 mb-4">История платежей</h2>
        <div v-if="payer.payments.length > 0" class="overflow-x-auto">
          <table class="w-full text-sm border-collapse">
            <thead class="bg-gray-50">
              <tr>
                <th class="text-left px-4 py-3 font-medium text-gray-500 border-b border-gray-200">Дата</th>
                <th class="text-left px-4 py-3 font-medium text-gray-500 border-b border-gray-200"># платежа</th>
                <th class="text-right px-4 py-3 font-medium text-gray-500 border-b border-gray-200">Сумма</th>
                <th class="text-left px-4 py-3 font-medium text-gray-500 border-b border-gray-200">Способ оплаты</th>
                <th class="text-center px-4 py-3 font-medium text-gray-500 border-b border-gray-200">Статус</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in payer.payments" :key="p.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-4 py-3 text-gray-700 border-b border-gray-100">{{ p.date }}</td>
                <td class="px-4 py-3 font-medium text-gray-900 border-b border-gray-100 whitespace-nowrap">{{ p.id }}</td>
                <td class="px-4 py-3 text-right font-medium text-gray-900 border-b border-gray-100 whitespace-nowrap">{{ formatMoney(p.amount) }} сом</td>
                <td class="px-4 py-3 text-gray-700 border-b border-gray-100">{{ p.method }}</td>
                <td class="px-4 py-3 text-center border-b border-gray-100">
                  <span :class="['px-2.5 py-0.5 rounded-full text-xs font-semibold', paymentStatusColors[p.status]]">
                    {{ paymentStatusLabels[p.status] }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else class="text-sm text-gray-400 text-center py-6">Нет платежей</p>
      </div>

      <!-- ==================== BLOCK 5: Audit Log ==================== -->
      <div class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 class="text-lg font-bold text-gray-900 mb-4">История изменений</h2>
        <div v-if="payer.auditLog.length > 0" class="overflow-x-auto">
          <table class="w-full text-sm border-collapse">
            <thead class="bg-gray-50">
              <tr>
                <th class="text-left px-4 py-3 font-medium text-gray-500 border-b border-gray-200">Дата и время</th>
                <th class="text-left px-4 py-3 font-medium text-gray-500 border-b border-gray-200">Действие</th>
                <th class="text-left px-4 py-3 font-medium text-gray-500 border-b border-gray-200">Кто изменил</th>
                <th class="text-left px-4 py-3 font-medium text-gray-500 border-b border-gray-200">Детали</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(entry, idx) in auditLogVisible" :key="idx" class="hover:bg-gray-50 transition-colors">
                <td class="px-4 py-3 text-gray-500 border-b border-gray-100 whitespace-nowrap">{{ entry.date }}</td>
                <td class="px-4 py-3 font-medium text-gray-900 border-b border-gray-100">{{ entry.action }}</td>
                <td class="px-4 py-3 text-gray-700 border-b border-gray-100">{{ entry.user }}</td>
                <td class="px-4 py-3 text-gray-600 border-b border-gray-100">{{ entry.details }}</td>
              </tr>
            </tbody>
          </table>
          <div v-if="payer.auditLog.length > 10 && !showAllAudit" class="mt-3 text-center">
            <button
              @click="showAllAudit = true"
              class="text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
            >
              Показать все ({{ payer.auditLog.length }})
            </button>
          </div>
        </div>
        <p v-else class="text-sm text-gray-400 text-center py-6">Нет записей</p>
      </div>

      <!-- ==================== BLOCK 6: Documents ==================== -->
      <div class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 class="text-lg font-bold text-gray-900 mb-4">Документы</h2>
        <div v-if="payer.documents.length > 0" class="space-y-2 mb-4">
          <div
            v-for="doc in payer.documents"
            :key="doc.id"
            class="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors"
          >
            <!-- File type icon -->
            <div :class="['w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', docIconColor(doc.type)]">
              <svg v-if="doc.type.toLowerCase() === 'pdf'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <svg v-else-if="['jpg','jpeg','png'].includes(doc.type.toLowerCase())" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>

            <!-- File info -->
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">{{ doc.name }}</p>
              <p class="text-xs text-gray-500">{{ docTypeLabel(doc.type) }} &middot; {{ doc.size }} &middot; {{ doc.uploadedAt }}</p>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-2 flex-shrink-0">
              <button class="text-xs font-medium text-teal-600 hover:text-teal-700 px-3 py-1.5 rounded-lg hover:bg-teal-50 transition-colors">
                Просмотр
              </button>
              <button class="text-xs font-medium text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
                Скачать
              </button>
            </div>
          </div>
        </div>
        <p v-else class="text-sm text-gray-400 text-center py-4 mb-4">Нет документов</p>

        <!-- Attach button -->
        <button
          @click="openUploadModal"
          class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-700 border border-green-300 rounded-lg hover:bg-green-50 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
          + Прикрепить документ
        </button>
      </div>

      <!-- ==================== Upload Modal ==================== -->
      <Teleport to="body">
        <div v-if="showUploadModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="fixed inset-0 bg-black/40" @click="closeUploadModal"></div>
          <div class="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6 z-10">
            <h3 class="text-lg font-bold text-gray-900 mb-4">Прикрепить документ</h3>

            <!-- Document name -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Название документа</label>
              <input
                v-model="uploadDocName"
                type="text"
                placeholder="Например: Свидетельство о регистрации"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <!-- File input -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Файл (PDF, JPG, PNG — макс. 10 МБ)</label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                @change="onFileSelected"
                class="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100 file:cursor-pointer cursor-pointer"
              />
              <p v-if="uploadFile" class="text-xs text-gray-500 mt-1">{{ uploadFile.name }} ({{ formatFileSize(uploadFile.size) }})</p>
              <p v-if="uploadError" class="text-xs text-red-500 mt-1">{{ uploadError }}</p>
            </div>

            <!-- Actions -->
            <div class="flex justify-end gap-3">
              <button
                @click="closeUploadModal"
                class="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Отмена
              </button>
              <button
                @click="submitUpload"
                :disabled="!uploadDocName.trim() || !uploadFile"
                class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Загрузить
              </button>
            </div>
          </div>
        </div>
      </Teleport>

      <!-- ==================== BLOCK 7: Comments ==================== -->
      <div class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div class="mb-4">
          <h2 class="text-lg font-bold text-gray-900 flex items-center gap-2">
            <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Комментарии сотрудников
          </h2>
          <p class="text-xs text-gray-400 mt-1">Видны только сотрудникам МПРЭТН</p>
        </div>

        <!-- Add comment form -->
        <div class="mb-6">
          <textarea
            v-model="newCommentText"
            rows="3"
            class="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
            placeholder="Добавить комментарий..."
          ></textarea>
          <div class="flex justify-end mt-2">
            <button
              @click="addComment"
              :disabled="!newCommentText.trim()"
              class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Добавить комментарий
            </button>
          </div>
        </div>

        <!-- Comments list -->
        <div v-if="sortedComments.length > 0" class="space-y-4">
          <div
            v-for="c in sortedComments"
            :key="c.id"
            class="bg-gray-50 rounded-lg border border-gray-100 p-4"
          >
            <div class="flex items-center gap-3 mb-2">
              <div class="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {{ c.author.charAt(0) }}
              </div>
              <div class="flex-1 min-w-0">
                <span class="text-sm font-semibold text-gray-900">{{ c.author }}</span>
                <span class="text-xs text-gray-400 ml-2">{{ c.date }}</span>
              </div>
            </div>
            <p class="text-sm text-gray-700 ml-11">{{ c.text }}</p>
          </div>
        </div>
        <p v-else class="text-sm text-gray-400 text-center py-4">Нет комментариев</p>
      </div>
    </template>
  </DashboardLayout>
</template>

<style scoped>
.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #6b7280;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: transparent;
  transition: all 0.15s;
}
.btn-back:hover {
  background: #f3f4f6;
  color: #374151;
  border-color: #9ca3af;
}
</style>
