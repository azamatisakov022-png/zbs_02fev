<script setup lang="ts">
import { ref, computed } from 'vue'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import DataTable from '../../components/dashboard/DataTable.vue'
import { icons } from '../../utils/menuIcons'

const menuItems = [
  { id: 'dashboard', label: 'Главная', icon: icons.dashboard, route: '/admin' },
  { id: 'users', label: 'Пользователи', icon: icons.users, route: '/admin/users' },
  { id: 'organizations', label: 'Организации', icon: icons.building, route: '/admin/organizations' },
  { id: 'declarations', label: 'Все декларации', icon: icons.document, route: '/admin/declarations' },
  { id: 'reports', label: 'Все отчёты', icon: icons.report, route: '/admin/reports' },
  { id: 'registries', label: 'Реестры и справочники', icon: icons.registries, route: '/admin/registries' },
  { id: 'calculations', label: 'Настройки расчётов', icon: icons.calculator, route: '/admin/calculations' },
  { id: 'analytics', label: 'Аналитика', icon: icons.analytics, route: '/admin/analytics' },
  { id: 'audit', label: 'Журнал действий', icon: icons.audit, route: '/admin/audit' },
  { id: 'settings', label: 'Настройки системы', icon: icons.settings, route: '/admin/settings' },
]

const columns = [
  { key: 'number', label: 'Номер', width: '130px' },
  { key: 'company', label: 'Организация' },
  { key: 'type', label: 'Тип отчёта' },
  { key: 'period', label: 'Период', width: '120px' },
  { key: 'submittedAt', label: 'Дата подачи', width: '130px' },
  { key: 'status', label: 'Статус', width: '150px' },
]

interface Report {
  id: number; number: string; company: string; type: string; period: string; submittedAt: string; status: string
  recycledTons?: string; categories?: string
}

const reports = ref<Report[]>([
  { id: 1, number: 'РП-2025-018', company: 'ОсОО "ТехПром"', type: 'Отчёт о нормативах переработки', period: '2024 год', submittedAt: '21.01.2025', status: 'На проверке', recycledTons: '145.2 т', categories: '5 категорий' },
  { id: 2, number: 'РП-2025-017', company: 'ОАО "СтройМаркет"', type: 'Отчёт о нормативах переработки', period: '2024 год', submittedAt: '20.01.2025', status: 'На проверке', recycledTons: '89.7 т', categories: '3 категории' },
  { id: 3, number: 'РП-2025-016', company: 'ОсОО "ПищеПром"', type: 'Отчёт о нормативах переработки', period: '2024 год', submittedAt: '19.01.2025', status: 'Принят', recycledTons: '210.5 т', categories: '6 категорий' },
  { id: 4, number: 'РП-2025-015', company: 'ИП Асанов Б.К.', type: 'Отчёт о нормативах переработки', period: '2024 год', submittedAt: '18.01.2025', status: 'Принят', recycledTons: '32.1 т', categories: '2 категории' },
  { id: 5, number: 'РП-2025-012', company: 'ОсОО "ТехПром"', type: 'Отчёт о нормативах переработки', period: '2023 год', submittedAt: '15.01.2024', status: 'Принят', recycledTons: '120.8 т', categories: '5 категорий' },
  { id: 6, number: 'РП-2025-010', company: 'ОАО "МегаТорг"', type: 'Отчёт о нормативах переработки', period: '2024 год', submittedAt: '12.01.2025', status: 'Отклонён', recycledTons: '78.4 т', categories: '4 категории' },
])

const searchQuery = ref('')
const filterPeriod = ref('')
const filterStatus = ref('')

const filteredReports = computed(() => {
  return reports.value.filter(r => {
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      if (!r.number.toLowerCase().includes(q) && !r.company.toLowerCase().includes(q)) return false
    }
    if (filterPeriod.value && r.period !== filterPeriod.value) return false
    if (filterStatus.value && r.status !== filterStatus.value) return false
    return true
  })
})

const getStatusClass = (status: string) => {
  switch (status) {
    case 'На проверке': return 'bg-yellow-100 text-yellow-800'
    case 'Принят': return 'bg-green-100 text-green-800'
    case 'Отклонён': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

// View
const showViewModal = ref(false)
const viewingReport = ref<Report | null>(null)

function openView(report: Report) {
  viewingReport.value = report
  showViewModal.value = true
}

// Accept/Reject
const showConfirmModal = ref(false)
const confirmAction = ref<'accept' | 'reject'>('accept')
const confirmReport = ref<Report | null>(null)
const rejectReason = ref('')

function openConfirm(report: Report, action: 'accept' | 'reject') {
  confirmReport.value = report
  confirmAction.value = action
  rejectReason.value = ''
  showConfirmModal.value = true
}

function executeAction() {
  if (confirmReport.value) {
    confirmReport.value.status = confirmAction.value === 'accept' ? 'Принят' : 'Отклонён'
  }
  showConfirmModal.value = false
}

function exportToExcel() {
  const headers = ['Номер', 'Организация', 'Тип', 'Период', 'Дата подачи', 'Статус']
  const rows = filteredReports.value.map(r => [r.number, r.company, r.type, r.period, r.submittedAt, r.status])
  const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `reports_${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
}

function downloadPdf(report: Report) {
  const blob = new Blob([`Отчёт ${report.number}\nОрганизация: ${report.company}\nПериод: ${report.period}`], { type: 'text/plain' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${report.number}.txt`
  link.click()
}

function handleOverlay(e: MouseEvent, close: () => void) {
  if ((e.target as HTMLElement).classList.contains('modal-overlay')) close()
}
</script>

<template>
  <DashboardLayout role="admin" roleTitle="Администратор" userName="Иван Петров" :menuItems="menuItems">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div>
        <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b] mb-2">Все отчёты</h1>
        <p class="text-[#64748b]">Отчёты о нормативах переработки от всех организаций</p>
      </div>
      <button @click="exportToExcel" class="flex items-center gap-2 bg-[#10b981] text-white px-5 py-3 rounded-xl font-medium hover:bg-[#059669] transition-colors">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
        Экспорт в Excel
      </button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]"><p class="text-sm text-[#64748b] mb-1">Всего отчётов</p><p class="text-2xl font-bold text-[#1e293b]">{{ reports.length }}</p></div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]"><p class="text-sm text-[#64748b] mb-1">Принято</p><p class="text-2xl font-bold text-[#10b981]">{{ reports.filter(r => r.status === 'Принят').length }}</p></div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]"><p class="text-sm text-[#64748b] mb-1">На проверке</p><p class="text-2xl font-bold text-[#f59e0b]">{{ reports.filter(r => r.status === 'На проверке').length }}</p></div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]"><p class="text-sm text-[#64748b] mb-1">Отклонено</p><p class="text-2xl font-bold text-[#ef4444]">{{ reports.filter(r => r.status === 'Отклонён').length }}</p></div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-2xl p-4 shadow-sm border border-[#e2e8f0] mb-6">
      <div class="flex flex-wrap gap-4">
        <input v-model="searchQuery" type="text" placeholder="Поиск по номеру или организации..." class="flex-1 min-w-[200px] px-4 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb]" />
        <select v-model="filterPeriod" class="px-4 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb]">
          <option value="">Все периоды</option><option value="2024 год">2024 год</option><option value="2023 год">2023 год</option>
        </select>
        <select v-model="filterStatus" class="px-4 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb]">
          <option value="">Все статусы</option><option value="На проверке">На проверке</option><option value="Принят">Принят</option><option value="Отклонён">Отклонён</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <DataTable :columns="columns" :data="filteredReports" :actions="true">
      <template #cell-number="{ value }"><span class="font-mono font-medium text-[#2563eb]">{{ value }}</span></template>
      <template #cell-company="{ value }"><span class="font-medium text-[#1e293b]">{{ value }}</span></template>
      <template #cell-status="{ value }"><span :class="['px-3 py-1 rounded-full text-xs font-medium', getStatusClass(value)]">{{ value }}</span></template>
      <template #actions="{ row }">
        <div class="flex items-center justify-end gap-2">
          <button @click="openView(row)" class="p-2 text-[#2563eb] hover:bg-blue-50 rounded-lg transition-colors" title="Просмотреть">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
          </button>
          <button v-if="row.status === 'На проверке'" @click="openConfirm(row, 'accept')" class="p-2 text-[#10b981] hover:bg-green-50 rounded-lg transition-colors" title="Принять">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
          </button>
          <button v-if="row.status === 'На проверке'" @click="openConfirm(row, 'reject')" class="p-2 text-[#ef4444] hover:bg-red-50 rounded-lg transition-colors" title="Отклонить">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <button @click="downloadPdf(row)" class="p-2 text-[#64748b] hover:bg-gray-100 rounded-lg transition-colors" title="Скачать">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          </button>
        </div>
      </template>
    </DataTable>

    <!-- View Modal -->
    <Teleport to="body">
      <div v-if="showViewModal && viewingReport" class="modal-overlay fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" style="backdrop-filter:blur(4px);" @click="(e: MouseEvent) => handleOverlay(e, () => showViewModal = false)">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
          <div class="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <p class="font-mono text-[#2563eb] font-medium">{{ viewingReport.number }}</p>
              <h3 class="text-lg font-bold text-[#1e293b]">{{ viewingReport.type }}</h3>
            </div>
            <button @click="showViewModal = false" class="p-2 text-gray-400 hover:text-gray-600 rounded-lg"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
          <div class="p-6">
            <div class="bg-[#f8fafc] rounded-xl p-4 grid grid-cols-2 gap-4 text-sm">
              <div><p class="text-[#94a3b8]">Организация</p><p class="text-[#1e293b] font-medium">{{ viewingReport.company }}</p></div>
              <div><p class="text-[#94a3b8]">Период</p><p class="text-[#1e293b] font-medium">{{ viewingReport.period }}</p></div>
              <div><p class="text-[#94a3b8]">Дата подачи</p><p class="text-[#1e293b] font-medium">{{ viewingReport.submittedAt }}</p></div>
              <div><p class="text-[#94a3b8]">Статус</p><span :class="['px-3 py-1 rounded-full text-xs font-medium', getStatusClass(viewingReport.status)]">{{ viewingReport.status }}</span></div>
              <div><p class="text-[#94a3b8]">Переработано</p><p class="text-[#1e293b] font-bold">{{ viewingReport.recycledTons }}</p></div>
              <div><p class="text-[#94a3b8]">Категории</p><p class="text-[#1e293b] font-medium">{{ viewingReport.categories }}</p></div>
            </div>
          </div>
          <div class="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
            <button v-if="viewingReport.status === 'На проверке'" @click="showViewModal = false; openConfirm(viewingReport!, 'reject')" class="px-5 py-2.5 text-red-600 border border-red-300 rounded-xl font-medium hover:bg-red-50">Отклонить</button>
            <button v-if="viewingReport.status === 'На проверке'" @click="showViewModal = false; openConfirm(viewingReport!, 'accept')" class="px-5 py-2.5 bg-[#10b981] text-white rounded-xl font-medium hover:bg-[#059669]">Принять</button>
            <button v-else @click="showViewModal = false" class="px-5 py-2.5 bg-[#2563eb] text-white rounded-xl font-medium hover:bg-[#1d4ed8]">Закрыть</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Confirm Modal -->
    <Teleport to="body">
      <div v-if="showConfirmModal && confirmReport" class="modal-overlay fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" style="backdrop-filter:blur(4px);" @click="(e: MouseEvent) => handleOverlay(e, () => showConfirmModal = false)">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md">
          <div class="p-6 text-center">
            <div :class="['w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4', confirmAction === 'accept' ? 'bg-green-100' : 'bg-red-100']">
              <svg v-if="confirmAction === 'accept'" class="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
              <svg v-else class="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </div>
            <h3 class="text-xl font-bold text-[#1e293b] mb-2">{{ confirmAction === 'accept' ? 'Принять отчёт?' : 'Отклонить отчёт?' }}</h3>
            <p class="text-[#64748b]"><span class="font-medium text-[#1e293b]">{{ confirmReport.number }}</span> от {{ confirmReport.company }}</p>
          </div>
          <div v-if="confirmAction === 'reject'" class="px-6 pb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Причина отклонения</label>
            <textarea v-model="rejectReason" rows="3" placeholder="Укажите причину отклонения..." class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 resize-none"></textarea>
          </div>
          <div class="flex items-center justify-center gap-3 px-6 pb-6">
            <button @click="showConfirmModal = false" class="flex-1 px-5 py-2.5 text-[#64748b] border border-[#e5e7eb] rounded-xl font-medium hover:bg-[#f8fafc]">Отмена</button>
            <button @click="executeAction" :class="['flex-1 px-5 py-2.5 text-white rounded-xl font-medium', confirmAction === 'accept' ? 'bg-[#10b981] hover:bg-[#059669]' : 'bg-red-500 hover:bg-red-600']">
              {{ confirmAction === 'accept' ? 'Принять' : 'Отклонить' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </DashboardLayout>
</template>
