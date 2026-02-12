<script setup lang="ts">
import { ref, computed } from 'vue'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import DataTable from '../../components/dashboard/DataTable.vue'
import { icons } from '../../utils/menuIcons'
import { calculationStore } from '../../stores/calculations'
import { reportStore, type Report } from '../../stores/reports'
import { productGroups, getSubgroupByCode, isPackagingGroup } from '../../data/product-groups'

const menuItems = computed(() => [
  { id: 'dashboard', label: 'Главная', icon: icons.dashboard, route: '/eco-operator' },
  { id: 'incoming-declarations', label: 'Входящие декларации', icon: icons.document, route: '/eco-operator/incoming-declarations' },
  { id: 'incoming-reports', label: 'Входящие отчёты', icon: icons.report, route: '/eco-operator/incoming-reports', badge: reportStore.getPendingCount() },
  { id: 'incoming-calculations', label: 'Входящие расчёты', icon: icons.calculator, route: '/eco-operator/incoming-calculations', badge: calculationStore.getPendingCount() },
  { id: 'enterprise', label: 'Моё предприятие', icon: icons.building, route: '/eco-operator/enterprise' },
  { id: 'licenses', label: 'Лицензии и документы', icon: icons.license, route: '/eco-operator/licenses' },
  { id: 'waste-types', label: 'Виды отходов', icon: icons.recycle, route: '/eco-operator/waste-types' },
  { id: 'my-reports', label: 'Мои отчёты', icon: icons.registries, route: '/eco-operator/my-reports' },
  { id: 'payments', label: 'Аналитика платежей', icon: icons.money, route: '/eco-operator/payments' },
  { id: 'analytics', label: 'Аналитика', icon: icons.analytics, route: '/eco-operator/analytics' },
  { id: 'profile', label: 'Профили компаний', icon: icons.profile, route: '/eco-operator/profile' },
])

const columns = [
  { key: 'number', label: 'Номер', width: '9%' },
  { key: 'company', label: 'Организация', width: '15%' },
  { key: 'inn', label: 'ИНН', width: '11%' },
  { key: 'year', label: 'Период', width: '7%' },
  { key: 'date', label: 'Дата подачи', width: '9%' },
  { key: 'processingPercent', label: '% выполн.', width: '8%' },
  { key: 'status', label: 'Статус', width: '10%' },
]

// Filters
const searchQuery = ref('')
const statusFilter = ref('')
const periodFilter = ref('')

const filteredReports = computed(() => {
  let list = reportStore.state.reports.filter(r => r.status !== 'Черновик')
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(r => r.number.toLowerCase().includes(q) || r.company.toLowerCase().includes(q) || r.inn.includes(q))
  }
  if (statusFilter.value) {
    list = list.filter(r => r.status === statusFilter.value)
  }
  if (periodFilter.value) {
    list = list.filter(r => r.year === periodFilter.value)
  }
  return list
})

// Stats
const totalCount = computed(() => reportStore.state.reports.filter(r => r.status !== 'Черновик').length)
const pendingCount = computed(() => reportStore.state.reports.filter(r => r.status === 'На проверке').length)
const approvedCount = computed(() => reportStore.state.reports.filter(r => r.status === 'Принят').length)
const rejectedCount = computed(() => reportStore.state.reports.filter(r => r.status === 'Отклонён').length)

const getStatusClass = (status: string) => {
  switch (status) {
    case 'Черновик': return 'bg-gray-100 text-gray-800'
    case 'На проверке': return 'bg-yellow-100 text-yellow-800'
    case 'Принят': return 'bg-green-100 text-green-800'
    case 'Отклонён': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getPercentClass = (percent: number) => {
  if (percent >= 100) return 'text-[#10b981] font-semibold'
  if (percent >= 80) return 'text-[#f59e0b] font-semibold'
  return 'text-[#ef4444] font-semibold'
}

const getWasteTypeLabel = (value: string) => {
  return productGroups.find(g => g.value === value)?.label || value
}

// Detail modal
const selectedReport = ref<Report | null>(null)
const showDetail = ref(false)
const rejectionReason = ref('')
const showRejectForm = ref(false)

const openDetail = (row: any) => {
  const report = reportStore.state.reports.find(r => r.id === row.id)
  if (report) {
    selectedReport.value = report
    showDetail.value = true
    showRejectForm.value = false
    rejectionReason.value = ''
  }
}

const closeDetail = () => {
  showDetail.value = false
  selectedReport.value = null
  showRejectForm.value = false
  rejectionReason.value = ''
}

const approveReport = () => {
  if (selectedReport.value) {
    reportStore.approveReport(selectedReport.value.id)
    closeDetail()
  }
}

const rejectReport = () => {
  if (selectedReport.value && rejectionReason.value.trim()) {
    reportStore.rejectReport(selectedReport.value.id, rejectionReason.value.trim())
    closeDetail()
  }
}
</script>

<template>
  <DashboardLayout
    role="eco-operator"
    roleTitle="ГП «Эко Оператор»"
    userName="ОсОО «ЭкоПереработка»"
    :menuItems="menuItems"
  >
    <div class="mb-6">
      <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b] mb-2">Входящие отчёты о переработке</h1>
      <p class="text-[#64748b]">Отчёты о выполнении нормативов переработки от бизнеса</p>
    </div>

    <!-- Gradient Stat Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-5 border border-yellow-200 shadow-sm">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p class="text-sm font-medium text-yellow-800">На проверке</p>
        </div>
        <p class="text-3xl font-bold text-yellow-900">{{ pendingCount }}</p>
        <p class="text-xs text-yellow-600 mt-1">отчётов ожидают проверки</p>
      </div>
      <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-5 border border-green-200 shadow-sm">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p class="text-sm font-medium text-green-800">Принято</p>
        </div>
        <p class="text-3xl font-bold text-green-900">{{ approvedCount }}</p>
        <p class="text-xs text-green-600 mt-1">отчётов принято</p>
      </div>
      <div class="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-5 border border-red-200 shadow-sm">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p class="text-sm font-medium text-red-800">Отклонено</p>
        </div>
        <p class="text-3xl font-bold text-red-900">{{ rejectedCount }}</p>
        <p class="text-xs text-red-600 mt-1">отчётов отклонено</p>
      </div>
      <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 border border-blue-200 shadow-sm">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <p class="text-sm font-medium text-blue-800">Всего отчётов</p>
        </div>
        <p class="text-3xl font-bold text-blue-900">{{ totalCount }}</p>
        <p class="text-xs text-blue-600 mt-1">всего получено</p>
      </div>
    </div>

    <!-- Yellow Alert Banner -->
    <div v-if="pendingCount > 0" class="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-center gap-3">
      <div class="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center flex-shrink-0">
        <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      </div>
      <div>
        <p class="text-sm font-semibold text-yellow-900">Требуется внимание</p>
        <p class="text-xs text-yellow-700">{{ pendingCount }} {{ pendingCount === 1 ? 'новый отчёт' : 'новых отчётов' }} на проверке. Проверьте данные и примите решение.</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-2xl p-4 shadow-sm border border-[#e2e8f0] mb-6">
      <div class="flex flex-wrap gap-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Поиск по номеру, компании или ИНН..."
          class="flex-1 min-w-[200px] px-4 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb]"
        />
        <select v-model="statusFilter" class="px-4 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb]">
          <option value="">Все статусы</option>
          <option value="На проверке">На проверке</option>
          <option value="Принят">Принят</option>
          <option value="Отклонён">Отклонён</option>
        </select>
        <select v-model="periodFilter" class="px-4 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb]">
          <option value="">Все периоды</option>
          <option value="2024">2024</option>
          <option value="2025">2025</option>
          <option value="2026">2026</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <DataTable :columns="columns" :data="filteredReports" :actions="true">
      <template #cell-number="{ value }">
        <span class="font-mono font-medium text-[#2563eb]">{{ value }}</span>
      </template>
      <template #cell-company="{ value }">
        <span class="font-medium text-[#1e293b]">{{ value }}</span>
      </template>
      <template #cell-year="{ value }">
        <span>{{ value }} год</span>
      </template>
      <template #cell-processingPercent="{ value }">
        <span :class="getPercentClass(value)">{{ value }}%</span>
      </template>
      <template #cell-status="{ value }">
        <span :class="['px-3 py-1 rounded-full text-xs font-medium', getStatusClass(value)]">
          {{ value }}
        </span>
      </template>
      <template #actions="{ row }">
        <div class="flex items-center justify-end gap-2">
          <button
            @click="openDetail(row)"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#3B82F6] text-white hover:bg-[#2563EB] transition-colors shadow-sm"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Детали
          </button>
          <button
            v-if="row.status === 'На проверке'"
            @click="openDetail(row)"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#F59E0B] text-white hover:bg-[#D97706] transition-colors shadow-sm"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            Проверить
          </button>
        </div>
      </template>
    </DataTable>

    <!-- Detail Modal -->
    <Teleport to="body">
      <div v-if="showDetail && selectedReport" class="fixed inset-0 bg-black/50 z-[100] flex items-start justify-center pt-8 overflow-y-auto" @click.self="closeDetail">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 mb-8">
          <!-- Modal Header -->
          <div class="flex items-center justify-between p-6 border-b border-[#e2e8f0]">
            <div>
              <h2 class="text-xl font-bold text-[#1e293b]">Отчёт {{ selectedReport.number }}</h2>
              <p class="text-sm text-[#64748b]">от {{ selectedReport.date }}</p>
            </div>
            <div class="flex items-center gap-3">
              <span :class="['px-3 py-1 rounded-full text-xs font-medium', getStatusClass(selectedReport.status)]">
                {{ selectedReport.status }}
              </span>
              <button @click="closeDetail" class="p-2 text-[#64748b] hover:bg-gray-100 rounded-lg">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Modal Body -->
          <div class="p-6 space-y-6">
            <!-- Company Info -->
            <div class="bg-[#f8fafc] rounded-xl p-4 border border-[#e2e8f0]">
              <h3 class="font-semibold text-[#1e293b] mb-3">Данные организации</h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <span class="text-[#64748b]">Организация:</span>
                  <span class="ml-2 font-medium text-[#1e293b]">{{ selectedReport.company }}</span>
                </div>
                <div>
                  <span class="text-[#64748b]">ИНН:</span>
                  <span class="ml-2 font-medium text-[#1e293b]">{{ selectedReport.inn }}</span>
                </div>
                <div>
                  <span class="text-[#64748b]">Отчётный период:</span>
                  <span class="ml-2 font-medium text-[#1e293b]">{{ selectedReport.year }} год</span>
                </div>
                <div>
                  <span class="text-[#64748b]">Дата подачи:</span>
                  <span class="ml-2 font-medium text-[#1e293b]">{{ selectedReport.date }}</span>
                </div>
              </div>
            </div>

            <!-- Processing Summary Cards -->
            <div class="grid grid-cols-3 gap-4">
              <div class="bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
                <p class="text-xs text-[#64748b] mb-1">Декларировано</p>
                <p class="text-xl font-bold text-[#2563eb]">{{ selectedReport.totalDeclared }} т</p>
              </div>
              <div class="bg-green-50 rounded-xl p-4 text-center border border-green-100">
                <p class="text-xs text-[#64748b] mb-1">Переработано</p>
                <p class="text-xl font-bold text-[#10b981]">{{ selectedReport.totalProcessed }} т</p>
              </div>
              <div :class="[
                'rounded-xl p-4 text-center border',
                selectedReport.processingPercent >= 100 ? 'bg-green-50 border-green-100' : selectedReport.processingPercent >= 80 ? 'bg-yellow-50 border-yellow-100' : 'bg-red-50 border-red-100'
              ]">
                <p class="text-xs text-[#64748b] mb-1">Выполнение</p>
                <p :class="[
                  'text-xl font-bold',
                  selectedReport.processingPercent >= 100 ? 'text-[#10b981]' : selectedReport.processingPercent >= 80 ? 'text-[#f59e0b]' : 'text-[#ef4444]'
                ]">{{ selectedReport.processingPercent }}%</p>
              </div>
            </div>

            <!-- Processing Items Table -->
            <div>
              <h3 class="font-semibold text-[#1e293b] mb-3">Детализация переработки</h3>
              <div class="overflow-x-auto border border-[#e2e8f0] rounded-xl">
                <table class="w-full text-sm">
                  <thead class="bg-[#f8fafc]">
                    <tr class="text-left text-[#64748b]">
                      <th class="px-4 py-3 font-medium">Группа товаров</th>
                      <th class="px-4 py-3 font-medium">Код ГСКП / Материал</th>
                      <th class="px-4 py-3 font-medium">Код ТН ВЭД / ТР ТС</th>
                      <th class="px-4 py-3 font-medium">Наименование</th>
                      <th class="px-4 py-3 font-medium text-right">Деклар. (т)</th>
                      <th class="px-4 py-3 font-medium text-right">Перераб. (т)</th>
                      <th class="px-4 py-3 font-medium text-right">%</th>
                      <th class="px-4 py-3 font-medium">Переработчик</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-[#e2e8f0]">
                    <tr v-for="item in selectedReport.items" :key="item.id" class="hover:bg-[#f8fafc]">
                      <td class="px-4 py-3 text-[#1e293b]">{{ getWasteTypeLabel(item.wasteType) }}</td>
                      <template v-if="!isPackagingGroup(item.wasteType)">
                        <td class="px-4 py-3 font-mono text-xs text-[#64748b]">{{ getSubgroupByCode(item.wasteType, item.wasteCode)?.gskpCode || '—' }}</td>
                        <td class="px-4 py-3 font-mono text-xs text-[#64748b]">{{ item.wasteCode }}</td>
                        <td class="px-4 py-3 text-xs text-[#64748b]">{{ getSubgroupByCode(item.wasteType, item.wasteCode)?.tnvedName || '—' }}</td>
                      </template>
                      <template v-else>
                        <td class="px-4 py-3 text-xs text-[#64748b]">{{ getSubgroupByCode(item.wasteType, item.wasteCode)?.packagingMaterial || '—' }}</td>
                        <td class="px-4 py-3 font-mono text-xs text-[#64748b]">{{ getSubgroupByCode(item.wasteType, item.wasteCode)?.packagingLetterCode || '—' }}</td>
                        <td class="px-4 py-3 font-mono text-xs text-[#64748b]">{{ getSubgroupByCode(item.wasteType, item.wasteCode)?.packagingDigitalCode || '—' }}</td>
                      </template>
                      <td class="px-4 py-3 text-right font-medium">{{ item.declared }}</td>
                      <td class="px-4 py-3 text-right font-medium text-[#10b981]">{{ item.processed }}</td>
                      <td class="px-4 py-3 text-right font-semibold" :class="parseFloat(item.processed) / parseFloat(item.declared) >= 1 ? 'text-[#10b981]' : 'text-[#f59e0b]'">
                        {{ ((parseFloat(item.processed) / parseFloat(item.declared)) * 100).toFixed(1) }}%
                      </td>
                      <td class="px-4 py-3 text-xs text-[#64748b]">{{ item.recycler }}</td>
                    </tr>
                  </tbody>
                  <tfoot class="bg-[#f8fafc] font-semibold">
                    <tr>
                      <td colspan="4" class="px-4 py-3">Итого</td>
                      <td class="px-4 py-3 text-right">{{ selectedReport.totalDeclared }} т</td>
                      <td class="px-4 py-3 text-right text-[#10b981]">{{ selectedReport.totalProcessed }} т</td>
                      <td class="px-4 py-3 text-right" :class="selectedReport.processingPercent >= 100 ? 'text-[#10b981]' : 'text-[#f59e0b]'">{{ selectedReport.processingPercent }}%</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <!-- Documents -->
            <div v-if="selectedReport.files.length > 0" class="bg-[#f8fafc] rounded-xl p-4 border border-[#e2e8f0]">
              <h3 class="font-semibold text-[#1e293b] mb-3">Прикреплённые документы ({{ selectedReport.files.length }})</h3>
              <div class="space-y-2">
                <div v-for="file in selectedReport.files" :key="file.id" class="flex items-center gap-3 bg-white rounded-lg px-4 py-3 border border-[#e2e8f0]">
                  <div class="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                    <svg class="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div class="flex-1">
                    <p class="text-sm font-medium text-[#1e293b]">{{ file.name }}</p>
                    <p class="text-xs text-[#64748b]">{{ file.size }}</p>
                  </div>
                  <button class="text-[#2563eb] hover:text-[#1d4ed8] text-sm font-medium">Скачать</button>
                </div>
              </div>
            </div>
            <div v-else class="bg-[#f8fafc] rounded-xl p-4 border border-[#e2e8f0]">
              <h3 class="font-semibold text-[#1e293b] mb-2">Прикреплённые документы</h3>
              <p class="text-sm text-[#64748b]">Документы не прикреплены</p>
            </div>

            <!-- Rejection reason if rejected -->
            <div v-if="selectedReport.status === 'Отклонён' && selectedReport.rejectionReason" class="bg-red-50 border border-red-200 rounded-xl p-4">
              <p class="font-medium text-red-800 mb-1">Причина отклонения</p>
              <p class="text-sm text-red-700">{{ selectedReport.rejectionReason }}</p>
            </div>

            <!-- Reject Form -->
            <div v-if="showRejectForm" class="bg-red-50 border border-red-200 rounded-xl p-4">
              <h3 class="font-semibold text-red-800 mb-3">Укажите причину отклонения</h3>
              <textarea
                v-model="rejectionReason"
                rows="3"
                placeholder="Опишите причину отклонения отчёта..."
                class="w-full px-4 py-3 border border-red-200 rounded-lg focus:outline-none focus:border-red-400 text-sm"
              ></textarea>
              <div class="flex justify-end gap-3 mt-3">
                <button @click="showRejectForm = false" class="px-4 py-2 text-[#64748b] hover:bg-white rounded-lg text-sm">
                  Отмена
                </button>
                <button
                  @click="rejectReport"
                  :disabled="!rejectionReason.trim()"
                  class="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Подтвердить отклонение
                </button>
              </div>
            </div>
          </div>

          <!-- Modal Footer: Review actions -->
          <div v-if="selectedReport.status === 'На проверке' && !showRejectForm" class="flex justify-end gap-3 p-6 border-t border-[#e2e8f0]">
            <button
              @click="showRejectForm = true"
              class="flex items-center gap-2 px-5 py-2.5 border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Отклонить отчёт
            </button>
            <button
              @click="approveReport"
              class="flex items-center gap-2 px-5 py-2.5 bg-[#10b981] text-white rounded-lg font-medium hover:bg-[#059669] transition-colors"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Принять отчёт
            </button>
          </div>

          <!-- Close button for other statuses -->
          <div v-else-if="selectedReport.status !== 'На проверке'" class="flex justify-end p-6 border-t border-[#e2e8f0]">
            <button @click="closeDetail" class="px-5 py-2.5 border border-[#e2e8f0] rounded-lg text-[#64748b] hover:bg-gray-50">
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </DashboardLayout>
</template>
