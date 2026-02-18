<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { declarationStore, type Declaration } from '../../stores/declarations'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import DocumentPreviewModal, { type PreviewDocument } from '../../components/dashboard/DocumentPreviewModal.vue'
import { AppButton, AppBadge } from '../../components/ui'
import { getStatusBadgeVariant } from '../../utils/statusVariant'
import { useBusinessMenu } from '../../composables/useRoleMenu'
import { toastStore } from '../../stores/toast'

const route = useRoute()
const router = useRouter()
const { roleTitle, menuItems } = useBusinessMenu()

const declaration = ref<Declaration | undefined>(undefined)
const isLoading = ref(true)

onMounted(() => {
  const id = Number(route.params.id)
  declaration.value = declarationStore.getById(id)
  setTimeout(() => { isLoading.value = false }, 300)
})

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('ru-RU').format(value)
}

function formatWithSign(value: number): string {
  const formatted = formatCurrency(Math.abs(value))
  if (value > 0) return '+' + formatted
  if (value < 0) return '-' + formatted
  return formatted
}

function getDeclarationBadgeVariant(status: string): 'success' | 'warning' | 'danger' | 'info' | 'neutral' {
  if (status === 'На доработке') return 'warning'
  return getStatusBadgeVariant(status)
}

function getHistoryDotClass(action: string): string {
  const a = action.toLowerCase()
  if (a.includes('одобрен')) return 'bg-[#22C55E]'
  if (a.includes('отклонен')) return 'bg-[#EF4444]'
  if (a.includes('доработк') || a.includes('возвращен')) return 'bg-[#F59E0B]'
  return 'bg-[#3B82F6]'
}

function handleResubmit() {
  if (!declaration.value) return
  declarationStore.resubmitDeclaration(declaration.value.id)
  declaration.value = declarationStore.getById(declaration.value.id)
  toastStore.show({ type: 'success', title: 'Декларация повторно подана', message: 'Статус изменён на «На рассмотрении».' })
}

function handleDownloadPdf() {
  toastStore.show({ type: 'info', title: 'Скачивание PDF', message: 'Функция в разработке' })
}

function handlePrint() {
  toastStore.show({ type: 'info', title: 'Печать', message: 'Функция в разработке' })
}

// Document preview
const previewDoc = ref<PreviewDocument | null>(null)

</script>

<template>
  <DashboardLayout
    role="business"
    :roleTitle="roleTitle"
    userName="ОсОО «ТехПром»"
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
      <AppButton variant="primary" @click="router.push('/business/declarations')">
        Вернуться к списку
      </AppButton>
    </div>

    <!-- Main content -->
    <template v-else>
      <!-- HEADER -->
      <div class="mb-6">
        <button
          class="flex items-center gap-1 text-sm text-[#64748b] hover:text-[#1e293b] transition-colors mb-4"
          @click="router.push('/business/declarations')"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Мои декларации
        </button>
        <div class="flex flex-wrap items-center gap-3 mb-1">
          <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b]">Декларация {{ declaration.number }}</h1>
          <AppBadge :variant="getDeclarationBadgeVariant(declaration.status)">{{ declaration.status }}</AppBadge>
        </div>
        <p class="text-[#64748b]">Подана {{ declaration.submittedAt }}, {{ declaration.submittedBy }}</p>
      </div>

      <!-- Status banners -->
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
        <div class="flex-1">
          <p class="text-sm font-semibold text-red-900">Декларация отклонена {{ declaration.reviewDate }}: {{ declaration.reviewComment }}</p>
          <div class="mt-3">
            <AppButton variant="danger" size="sm" @click="handleResubmit">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Подать повторно
            </AppButton>
          </div>
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
        <div class="flex-1">
          <p class="text-sm font-semibold text-orange-900">Возвращена на доработку {{ declaration.reviewDate }}: {{ declaration.reviewComment }}</p>
          <div class="mt-3">
            <AppButton variant="primary" size="sm" @click="handleResubmit">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Подать повторно
            </AppButton>
          </div>
        </div>
      </div>

      <div
        v-if="declaration.status === 'На рассмотрении'"
        class="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3"
      >
        <div class="w-8 h-8 bg-[#3B82F6] rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p class="text-sm font-semibold text-blue-900">Декларация находится на рассмотрении у эко-оператора</p>
          <p class="text-xs text-blue-700 mt-1">Обычно рассмотрение занимает 3-5 рабочих дней. Вы получите уведомление о результате.</p>
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
                  @click="previewDoc = { name: doc.name, size: doc.size, source: doc.source }"
                >Просмотр</button>
                <button
                  class="text-[#2563eb] hover:text-[#1d4ed8] text-sm font-medium"
                  @click="toastStore.show({ type: 'info', title: 'Скачивание документа', message: 'Скачивание будет доступно после подключения файлового хранилища' })"
                >Скачать</button>
              </div>
            </div>
          </div>
        </template>
        <template v-else>
          <p class="text-sm text-[#64748b]">Документы не прикреплены</p>
        </template>
      </div>

      <!-- BLOCK 4 - История -->
      <div class="bg-white rounded-xl shadow-sm border border-[#e2e8f0] p-5 mb-6">
        <h2 class="text-lg font-bold text-[#1e293b] mb-4">История рассмотрения</h2>
        <div class="space-y-0">
          <div
            v-for="(entry, idx) in declaration.history"
            :key="entry.id"
            class="flex gap-4"
          >
            <div class="flex flex-col items-center">
              <div :class="['w-3 h-3 rounded-full flex-shrink-0 mt-1.5', getHistoryDotClass(entry.action)]"></div>
              <div
                v-if="idx < declaration.history.length - 1"
                class="w-0.5 bg-[#e2e8f0] flex-1 min-h-[32px]"
              ></div>
            </div>
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

      <!-- Action buttons at bottom -->
      <div class="flex flex-wrap items-center gap-3 mb-6">
        <AppButton variant="secondary" @click="router.push('/business/declarations')">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Назад к списку
        </AppButton>
        <AppButton v-if="declaration.status === 'Одобрена'" variant="outline" @click="handleDownloadPdf">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Скачать PDF
        </AppButton>
        <AppButton v-if="declaration.status === 'Одобрена'" variant="outline" @click="handlePrint">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Печать
        </AppButton>
      </div>
    </template>

    <DocumentPreviewModal :doc="previewDoc" @close="previewDoc = null" />
  </DashboardLayout>
</template>
