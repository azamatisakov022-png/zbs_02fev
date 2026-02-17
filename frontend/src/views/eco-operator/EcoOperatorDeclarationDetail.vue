<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { declarationStore, type Declaration } from '../../stores/declarations'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import { AppButton, AppBadge } from '../../components/ui'
import { getStatusBadgeVariant } from '../../utils/statusVariant'
import { useEcoOperatorMenu } from '../../composables/useRoleMenu'
import { toastStore } from '../../stores/toast'
import { notificationStore } from '../../stores/notifications'

const route = useRoute()
const router = useRouter()
const { roleTitle, menuItems } = useEcoOperatorMenu()

// Declaration data
const declaration = ref<Declaration | undefined>(undefined)
const isLoading = ref(true)

onMounted(() => {
  const id = Number(route.params.id)
  declaration.value = declarationStore.getById(id)
  setTimeout(() => { isLoading.value = false }, 300)
})

// Modal states
const showApproveModal = ref(false)
const showRejectModal = ref(false)
const showReturnModal = ref(false)

const approveComment = ref('')
const rejectReason = ref('')
const returnComment = ref('')

// Toast state
const toastVisible = ref(false)
const toastMessage = ref('')
const toastType = ref<'success' | 'danger' | 'warning'>('success')

function showToast(message: string, type: 'success' | 'danger' | 'warning') {
  toastMessage.value = message
  toastType.value = type
  toastVisible.value = true
  setTimeout(() => { toastVisible.value = false }, 3000)
}

// Format currency
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('ru-RU').format(value)
}

function formatWithSign(value: number): string {
  const formatted = formatCurrency(Math.abs(value))
  if (value > 0) return '+' + formatted
  if (value < 0) return '-' + formatted
  return formatted
}

// Status badge variant with special handling for "На доработке"
function getDeclarationBadgeVariant(status: string): 'success' | 'warning' | 'danger' | 'info' | 'neutral' {
  if (status === 'На доработке') return 'warning'
  return getStatusBadgeVariant(status)
}

// History dot color
function getHistoryDotClass(action: string): string {
  const a = action.toLowerCase()
  if (a.includes('одобрен')) return 'bg-[#22C55E]'
  if (a.includes('отклонен')) return 'bg-[#EF4444]'
  if (a.includes('доработк') || a.includes('возвращен')) return 'bg-[#F59E0B]'
  return 'bg-[#3B82F6]'
}

// Actions
function handleApprove() {
  if (!declaration.value) return
  declarationStore.approveDeclaration(declaration.value.id, approveComment.value.trim() || undefined)
  declaration.value = declarationStore.getById(declaration.value.id)
  notificationStore.add({
    type: 'success',
    title: 'Декларация принята',
    message: 'Ваша декларация была успешно принята.',
    role: 'business'
  })
  showApproveModal.value = false
  approveComment.value = ''
  showToast('Декларация успешно одобрена', 'success')
  setTimeout(() => {
    router.push('/eco-operator/incoming-declarations')
  }, 1500)
}

function handleReject() {
  if (!declaration.value) return
  declarationStore.rejectDeclaration(declaration.value.id, rejectReason.value.trim())
  declaration.value = declarationStore.getById(declaration.value.id)
  notificationStore.add({
    type: 'error',
    title: 'Декларация отклонена',
    message: 'Декларация отклонена. Проверьте замечания и подайте повторно.',
    role: 'business'
  })
  showRejectModal.value = false
  rejectReason.value = ''
  showToast('Декларация отклонена', 'danger')
  setTimeout(() => {
    router.push('/eco-operator/incoming-declarations')
  }, 1500)
}

function handleReturn() {
  if (!declaration.value) return
  declarationStore.returnForRevision(declaration.value.id, returnComment.value.trim())
  declaration.value = declarationStore.getById(declaration.value.id)
  showReturnModal.value = false
  returnComment.value = ''
  showToast('Декларация возвращена на доработку', 'warning')
  setTimeout(() => {
    router.push('/eco-operator/incoming-declarations')
  }, 1500)
}

const isRejectValid = computed(() => rejectReason.value.trim().length >= 10)
const isReturnValid = computed(() => returnComment.value.trim().length >= 10)
</script>

<template>
  <DashboardLayout
    role="eco-operator"
    :roleTitle="roleTitle"
    userName="ОсОО «ЭкоПереработка»"
    :menuItems="menuItems"
  >
    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center py-20">
      <div class="w-8 h-8 border-4 border-[#22C55E] border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- Not found -->
    <div v-else-if="!declaration" class="text-center py-20">
      <div class="w-16 h-16 mx-auto mb-4 bg-[#f1f5f9] rounded-full flex items-center justify-center">
        <svg class="w-8 h-8 text-[#94a3b8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h2 class="text-xl font-bold text-[#1e293b] mb-2">Декларация не найдена</h2>
      <p class="text-[#64748b] mb-6">Запрашиваемая декларация не существует или была удалена.</p>
      <AppButton variant="primary" @click="router.push('/eco-operator/incoming-declarations')">
        Вернуться к списку
      </AppButton>
    </div>

    <!-- Main content -->
    <template v-else>
      <!-- HEADER -->
      <div class="mb-6">
        <button
          class="flex items-center gap-1 text-sm text-[#64748b] hover:text-[#1e293b] transition-colors mb-4"
          @click="router.push('/eco-operator/incoming-declarations')"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Входящие декларации
        </button>
        <div class="flex flex-wrap items-center gap-3 mb-1">
          <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b]">Декларация {{ declaration.number }}</h1>
          <AppBadge :variant="getDeclarationBadgeVariant(declaration.status)">{{ declaration.status }}</AppBadge>
        </div>
        <p class="text-[#64748b]">Подана {{ declaration.submittedAt }}, {{ declaration.submittedBy }}</p>
      </div>

      <!-- Result banner -->
      <div
        v-if="declaration.status === 'Одобрена'"
        class="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-start gap-3"
      >
        <div class="w-8 h-8 bg-[#22C55E] rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <p class="text-sm font-semibold text-green-900">Декларация одобрена {{ declaration.reviewDate }} сотрудником {{ declaration.reviewer }}</p>
          <p v-if="declaration.reviewComment" class="text-xs text-green-700 mt-1">{{ declaration.reviewComment }}</p>
        </div>
      </div>

      <div
        v-if="declaration.status === 'Отклонена'"
        class="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3"
      >
        <div class="w-8 h-8 bg-[#EF4444] rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <div>
          <p class="text-sm font-semibold text-red-900">Декларация отклонена {{ declaration.reviewDate }}: {{ declaration.reviewComment }}</p>
        </div>
      </div>

      <div
        v-if="declaration.status === 'На доработке'"
        class="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 flex items-start gap-3"
      >
        <div class="w-8 h-8 bg-[#F59E0B] rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <div>
          <p class="text-sm font-semibold text-orange-900">Возвращена на доработку {{ declaration.reviewDate }}: {{ declaration.reviewComment }}</p>
        </div>
      </div>

      <!-- BLOCK 1 - Данные плательщика -->
      <div class="bg-[#f8fafc] rounded-xl p-5 mb-6 border border-[#e2e8f0]">
        <h2 class="text-lg font-bold text-[#1e293b] mb-4">Данные плательщика</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <span class="text-[#64748b]">Наименование:</span>
            <span class="ml-2 font-medium text-[#1e293b]">{{ declaration.company }}</span>
          </div>
          <div>
            <span class="text-[#64748b]">ОПФ:</span>
            <span class="ml-2 font-medium text-[#1e293b]">{{ declaration.opf }}</span>
          </div>
          <div>
            <span class="text-[#64748b]">ИНН:</span>
            <span class="ml-2 font-mono font-medium text-[#1e293b]">{{ declaration.inn }}</span>
          </div>
          <div>
            <span class="text-[#64748b]">Адрес:</span>
            <span class="ml-2 font-medium text-[#1e293b]">{{ declaration.address }}</span>
          </div>
          <div>
            <span class="text-[#64748b]">Контактное лицо:</span>
            <span class="ml-2 font-medium text-[#1e293b]">{{ declaration.contactPerson }}</span>
          </div>
          <div>
            <span class="text-[#64748b]">Телефон:</span>
            <span class="ml-2 font-medium text-[#1e293b]">{{ declaration.phone }}</span>
          </div>
          <div class="sm:col-span-2">
            <span class="text-[#64748b]">Email:</span>
            <span class="ml-2 font-medium text-[#2563eb]">{{ declaration.email }}</span>
          </div>
        </div>
      </div>

      <!-- BLOCK 2 - Сводные данные декларации -->
      <div class="bg-white rounded-xl shadow-sm border border-[#e2e8f0] p-5 mb-6">
        <h2 class="text-lg font-bold text-[#1e293b] mb-4">Сводные данные декларации</h2>

        <!-- KPI Cards -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <!-- Расчётов за год -->
          <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 border border-blue-200 shadow-sm">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <p class="text-sm font-medium text-blue-800">Расчётов за год</p>
            </div>
            <p class="text-3xl font-bold text-blue-900">{{ declaration.calculationCount }}</p>
            <p class="text-xs text-blue-600 mt-1">за {{ declaration.reportingYear }} год</p>
          </div>

          <!-- Итого начислено -->
          <div class="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-5 border border-orange-200 shadow-sm">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p class="text-sm font-medium text-orange-800">Итого начислено</p>
            </div>
            <p class="text-3xl font-bold text-orange-900">{{ formatCurrency(declaration.totalCharged) }}</p>
            <p class="text-xs text-orange-600 mt-1">сом</p>
          </div>

          <!-- Итого оплачено -->
          <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-5 border border-green-200 shadow-sm">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p class="text-sm font-medium text-green-800">Итого оплачено</p>
            </div>
            <p class="text-3xl font-bold text-green-900">{{ formatCurrency(declaration.totalPaid) }}</p>
            <p class="text-xs text-green-600 mt-1">сом</p>
          </div>

          <!-- Сальдо -->
          <div :class="[
            'rounded-2xl p-5 border shadow-sm bg-gradient-to-br',
            declaration.balance >= 0
              ? 'from-green-50 to-green-100 border-green-200'
              : 'from-red-50 to-red-100 border-red-200'
          ]">
            <div class="flex items-center gap-3 mb-3">
              <div :class="[
                'w-10 h-10 rounded-xl flex items-center justify-center',
                declaration.balance >= 0 ? 'bg-green-500' : 'bg-red-500'
              ]">
                <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <p :class="['text-sm font-medium', declaration.balance >= 0 ? 'text-green-800' : 'text-red-800']">Сальдо</p>
            </div>
            <p :class="['text-3xl font-bold', declaration.balance >= 0 ? 'text-green-900' : 'text-red-900']">{{ formatWithSign(declaration.balance) }}</p>
            <p :class="['text-xs mt-1', declaration.balance >= 0 ? 'text-green-600' : 'text-red-600']">сом</p>
          </div>
        </div>

        <!-- Table: Расчёты -->
        <div class="mb-6">
          <h3 class="font-semibold text-[#1e293b] mb-3">Расчёты, вошедшие в декларацию</h3>
          <div class="overflow-x-auto border border-[#e2e8f0] rounded-xl">
            <table class="w-full text-sm border-collapse">
              <thead class="bg-[#f8fafc]">
                <tr class="text-left text-[#64748b]">
                  <th class="px-4 py-3 font-medium">&#8470; расчёта</th>
                  <th class="px-4 py-3 font-medium">Период</th>
                  <th class="px-4 py-3 font-medium">Категории</th>
                  <th class="px-4 py-3 font-medium text-right">Масса (т)</th>
                  <th class="px-4 py-3 font-medium text-right">Сумма (сом)</th>
                  <th class="px-4 py-3 font-medium">Статус расчёта</th>
                  <th class="px-4 py-3 font-medium">Дата принятия</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#e2e8f0]">
                <tr v-for="calc in declaration.calculations" :key="calc.number" class="hover:bg-[#f8fafc]">
                  <td class="px-4 py-3 font-mono font-medium text-[#2563eb]">{{ calc.number }}</td>
                  <td class="px-4 py-3 text-[#1e293b]">{{ calc.period }}</td>
                  <td class="px-4 py-3 text-[#64748b]">{{ calc.categories }}</td>
                  <td class="px-4 py-3 text-right font-medium text-[#1e293b]">{{ calc.mass }}</td>
                  <td class="px-4 py-3 text-right font-medium text-[#1e293b]">{{ formatCurrency(calc.amount) }}</td>
                  <td class="px-4 py-3">
                    <AppBadge :variant="getStatusBadgeVariant(calc.calcStatus)">{{ calc.calcStatus }}</AppBadge>
                  </td>
                  <td class="px-4 py-3 text-[#64748b]">{{ calc.acceptedDate }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Table: Отчёты о переработке -->
        <div v-if="declaration.reports.length > 0" class="mb-6">
          <h3 class="font-semibold text-[#1e293b] mb-3">Отчёты о переработке</h3>
          <div class="overflow-x-auto border border-[#e2e8f0] rounded-xl">
            <table class="w-full text-sm border-collapse">
              <thead class="bg-[#f8fafc]">
                <tr class="text-left text-[#64748b]">
                  <th class="px-4 py-3 font-medium">&#8470; отчёта</th>
                  <th class="px-4 py-3 font-medium">Период</th>
                  <th class="px-4 py-3 font-medium">Категории</th>
                  <th class="px-4 py-3 font-medium text-right">Переработано (т)</th>
                  <th class="px-4 py-3 font-medium text-right">Зачтено (сом)</th>
                  <th class="px-4 py-3 font-medium">Статус</th>
                  <th class="px-4 py-3 font-medium">Дата принятия</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#e2e8f0]">
                <tr v-for="report in declaration.reports" :key="report.number" class="hover:bg-[#f8fafc]">
                  <td class="px-4 py-3 font-mono font-medium text-[#2563eb]">{{ report.number }}</td>
                  <td class="px-4 py-3 text-[#1e293b]">{{ report.period }}</td>
                  <td class="px-4 py-3 text-[#64748b]">{{ report.categories }}</td>
                  <td class="px-4 py-3 text-right font-medium text-[#1e293b]">{{ report.processed }}</td>
                  <td class="px-4 py-3 text-right font-medium text-[#1e293b]">{{ formatCurrency(report.credited) }}</td>
                  <td class="px-4 py-3">
                    <AppBadge :variant="getStatusBadgeVariant(report.reportStatus)">{{ report.reportStatus }}</AppBadge>
                  </td>
                  <td class="px-4 py-3 text-[#64748b]">{{ report.acceptedDate }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Table: Платежи за год -->
        <div v-if="declaration.payments.length > 0">
          <h3 class="font-semibold text-[#1e293b] mb-3">Платежи за год</h3>
          <div class="overflow-x-auto border border-[#e2e8f0] rounded-xl">
            <table class="w-full text-sm border-collapse">
              <thead class="bg-[#f8fafc]">
                <tr class="text-left text-[#64748b]">
                  <th class="px-4 py-3 font-medium">Дата</th>
                  <th class="px-4 py-3 font-medium">&#8470; платежа</th>
                  <th class="px-4 py-3 font-medium text-right">Сумма (сом)</th>
                  <th class="px-4 py-3 font-medium">Способ</th>
                  <th class="px-4 py-3 font-medium">Статус</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#e2e8f0]">
                <tr v-for="payment in declaration.payments" :key="payment.number" class="hover:bg-[#f8fafc]">
                  <td class="px-4 py-3 text-[#1e293b]">{{ payment.date }}</td>
                  <td class="px-4 py-3 font-mono font-medium text-[#1e293b]">{{ payment.number }}</td>
                  <td class="px-4 py-3 text-right font-medium text-[#1e293b]">{{ formatCurrency(payment.amount) }}</td>
                  <td class="px-4 py-3 text-[#64748b]">{{ payment.method }}</td>
                  <td class="px-4 py-3">
                    <AppBadge :variant="getStatusBadgeVariant(payment.paymentStatus)">{{ payment.paymentStatus }}</AppBadge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- BLOCK 3 - Документы -->
      <div class="bg-white rounded-xl shadow-sm border border-[#e2e8f0] p-5 mb-6">
        <h2 class="text-lg font-bold text-[#1e293b] mb-4">Документы</h2>
        <template v-if="declaration.documents.length > 0">
          <div class="space-y-3">
            <div
              v-for="doc in declaration.documents"
              :key="doc.id"
              class="flex items-center gap-3 bg-[#f8fafc] rounded-lg px-4 py-3 border border-[#e2e8f0]"
            >
              <div class="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-[#1e293b] truncate">{{ doc.name }}</p>
                <p class="text-xs text-[#64748b]">{{ doc.size }} &middot; {{ doc.source }}</p>
              </div>
              <div class="flex items-center gap-2 flex-shrink-0">
                <button
                  class="text-[#2563eb] hover:text-[#1d4ed8] text-sm font-medium"
                  @click="toastStore.show({ type: 'info', title: 'Просмотр документа', message: 'Функция в разработке' })"
                >Просмотр</button>
                <button
                  class="text-[#2563eb] hover:text-[#1d4ed8] text-sm font-medium"
                  @click="toastStore.show({ type: 'info', title: 'Скачивание документа', message: 'Функция в разработке' })"
                >Скачать</button>
              </div>
            </div>
          </div>
        </template>
        <template v-else>
          <p class="text-sm text-[#64748b]">Документы не прикреплены</p>
        </template>
      </div>

      <!-- BLOCK 4 - История рассмотрения -->
      <div class="bg-white rounded-xl shadow-sm border border-[#e2e8f0] p-5 mb-24">
        <h2 class="text-lg font-bold text-[#1e293b] mb-4">История рассмотрения</h2>
        <div class="space-y-0">
          <div
            v-for="(entry, idx) in declaration.history"
            :key="entry.id"
            class="flex gap-4"
          >
            <!-- Timeline line + dot -->
            <div class="flex flex-col items-center">
              <div :class="['w-3 h-3 rounded-full flex-shrink-0 mt-1.5', getHistoryDotClass(entry.action)]"></div>
              <div
                v-if="idx < declaration.history.length - 1"
                class="w-0.5 bg-[#e2e8f0] flex-1 min-h-[32px]"
              ></div>
            </div>
            <!-- Content -->
            <div class="pb-5">
              <p class="text-sm font-medium text-[#1e293b]">{{ entry.action }}</p>
              <p class="text-xs text-[#64748b] mt-0.5">{{ entry.date }} &middot; {{ entry.user }}</p>
              <p v-if="entry.comment" class="text-xs text-[#64748b] mt-1 bg-[#f8fafc] rounded-lg px-3 py-2 border border-[#e2e8f0]">
                {{ entry.comment }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- STICKY ACTION BAR -->
      <div
        v-if="declaration.status === 'На рассмотрении'"
        class="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e2e8f0] shadow-lg z-50"
      >
        <div class="max-w-5xl mx-auto px-6 py-4 flex flex-wrap items-center justify-end gap-3">
          <button
            class="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#F59E0B] hover:bg-[#D97706] transition-colors"
            @click="showReturnModal = true"
          >
            <span class="flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              Вернуть на доработку
            </span>
          </button>
          <button
            class="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#EF4444] hover:bg-[#DC2626] transition-colors"
            @click="showRejectModal = true"
          >
            <span class="flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Отклонить
            </span>
          </button>
          <button
            class="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#22C55E] hover:bg-[#16A34A] transition-colors shadow-md"
            @click="showApproveModal = true"
          >
            <span class="flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Одобрить декларацию
            </span>
          </button>
        </div>
      </div>
    </template>

    <!-- MODALS -->

    <!-- Approve Modal -->
    <Teleport to="body">
      <div
        v-if="showApproveModal && declaration"
        class="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        @click.self="showApproveModal = false"
      >
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md" @click.stop>
          <div class="p-6 border-b border-[#e2e8f0]">
            <h2 class="text-lg font-bold text-[#1e293b]">Одобрить декларацию {{ declaration.number }}?</h2>
          </div>
          <div class="p-6 space-y-4">
            <p class="text-sm text-[#64748b]">Вы уверены, что хотите одобрить декларацию?</p>
            <div>
              <label class="block text-sm font-medium text-[#1e293b] mb-1.5">Комментарий (необязательно)</label>
              <textarea
                v-model="approveComment"
                rows="3"
                placeholder="Введите комментарий..."
                class="w-full px-4 py-3 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#22C55E] text-sm resize-none"
              ></textarea>
            </div>
          </div>
          <div class="flex justify-end gap-3 p-6 border-t border-[#e2e8f0]">
            <AppButton variant="secondary" @click="showApproveModal = false; approveComment = ''">
              Отмена
            </AppButton>
            <AppButton variant="primary" @click="handleApprove">
              Подтвердить
            </AppButton>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Reject Modal -->
    <Teleport to="body">
      <div
        v-if="showRejectModal && declaration"
        class="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        @click.self="showRejectModal = false"
      >
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md" @click.stop>
          <div class="p-6 border-b border-[#e2e8f0]">
            <h2 class="text-lg font-bold text-[#1e293b]">Отклонение декларации</h2>
          </div>
          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-[#1e293b] mb-1.5">Причина отклонения <span class="text-red-500">*</span></label>
              <textarea
                v-model="rejectReason"
                rows="4"
                placeholder="Укажите причину отклонения..."
                class="w-full px-4 py-3 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#EF4444] text-sm resize-none"
              ></textarea>
              <p v-if="rejectReason.trim().length > 0 && rejectReason.trim().length < 10" class="text-xs text-red-500 mt-1">
                Минимум 10 символов (введено {{ rejectReason.trim().length }})
              </p>
            </div>
          </div>
          <div class="flex justify-end gap-3 p-6 border-t border-[#e2e8f0]">
            <AppButton variant="secondary" @click="showRejectModal = false; rejectReason = ''">
              Отмена
            </AppButton>
            <AppButton variant="danger" :disabled="!isRejectValid" @click="handleReject">
              Отклонить
            </AppButton>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Return Modal -->
    <Teleport to="body">
      <div
        v-if="showReturnModal && declaration"
        class="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        @click.self="showReturnModal = false"
      >
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md" @click.stop>
          <div class="p-6 border-b border-[#e2e8f0]">
            <h2 class="text-lg font-bold text-[#1e293b]">Возврат на доработку</h2>
          </div>
          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-[#1e293b] mb-1.5">Комментарий <span class="text-red-500">*</span></label>
              <textarea
                v-model="returnComment"
                rows="4"
                placeholder="Укажите что нужно исправить..."
                class="w-full px-4 py-3 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#F59E0B] text-sm resize-none"
              ></textarea>
              <p v-if="returnComment.trim().length > 0 && returnComment.trim().length < 10" class="text-xs text-orange-500 mt-1">
                Минимум 10 символов (введено {{ returnComment.trim().length }})
              </p>
            </div>
          </div>
          <div class="flex justify-end gap-3 p-6 border-t border-[#e2e8f0]">
            <AppButton variant="secondary" @click="showReturnModal = false; returnComment = ''">
              Отмена
            </AppButton>
            <button
              class="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
              :class="isReturnValid ? 'bg-[#F59E0B] hover:bg-[#D97706] cursor-pointer' : 'bg-[#F59E0B]/50 cursor-not-allowed'"
              :disabled="!isReturnValid"
              @click="handleReturn"
            >
              Вернуть на доработку
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Toast -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        leave-active-class="transition-all duration-300 ease-in"
        enter-from-class="opacity-0 translate-y-[-16px]"
        enter-to-class="opacity-100 translate-y-0"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-[-16px]"
      >
        <div
          v-if="toastVisible"
          :class="[
            'fixed top-6 right-6 z-[200] px-5 py-3 rounded-xl shadow-lg text-white text-sm font-semibold',
            toastType === 'success' ? 'bg-[#22C55E]' : toastType === 'danger' ? 'bg-[#EF4444]' : 'bg-[#F59E0B]'
          ]"
        >
          {{ toastMessage }}
        </div>
      </Transition>
    </Teleport>
  </DashboardLayout>
</template>
