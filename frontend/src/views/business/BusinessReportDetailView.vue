<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import { reportStore } from '../../stores/reports'
import { productGroups, getSubgroupByCode, isPackagingGroup } from '../../data/product-groups'
import { getNormativeForGroup } from '../../data/recycling-norms'
import { generateRecyclingReportExcel } from '../../utils/excelExport'
import { useBusinessMenu } from '../../composables/useRoleMenu'
import { toastStore } from '../../stores/toast'

const route = useRoute()
const router = useRouter()
const { roleTitle, menuItems } = useBusinessMenu()

const report = computed(() => {
  const id = Number(route.params.id)
  return reportStore.state.reports.find(r => r.id === id) || null
})

const getStatusClass = (status: string) => {
  switch (status) {
    case 'Черновик': return 'bg-gray-100 text-gray-800'
    case 'На проверке': return 'bg-yellow-100 text-yellow-800'
    case 'Принят': return 'bg-green-100 text-green-800'
    case 'Отклонён': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getGroupLabel = (value: string) => {
  return productGroups.find(g => g.value === value)?.label || value
}

const year = computed(() => parseInt(report.value?.year || '2026'))

// Separate items: товары vs упаковка
const productItems = computed(() => {
  if (!report.value) return []
  return report.value.items.filter(i => !isPackagingGroup(i.wasteType))
})

const packagingItems = computed(() => {
  if (!report.value) return []
  return report.value.items.filter(i => isPackagingGroup(i.wasteType))
})

// Compute derived values for product item
const getItemNormative = (item: { wasteType: string }) => {
  return getNormativeForGroup(item.wasteType, year.value)
}

const getItemSubjectToRecycle = (item: { declared: string; wasteType: string }) => {
  const declared = parseFloat(item.declared) || 0
  const norm = getItemNormative(item)
  return declared * norm
}

const getItemTotalProcessed = (item: { processed: string }) => {
  return parseFloat(item.processed) || 0
}

const getItemDeficit = (item: { declared: string; processed: string; wasteType: string }) => {
  const subjectTo = getItemSubjectToRecycle(item)
  const total = getItemTotalProcessed(item)
  return Math.max(0, subjectTo - total)
}

// Totals for product items
const productTotals = computed(() => {
  const items = productItems.value
  const totalDeclared = items.reduce((s, i) => s + (parseFloat(i.declared) || 0), 0)
  const totalSubjectTo = items.reduce((s, i) => s + getItemSubjectToRecycle(i), 0)
  const totalProcessed = items.reduce((s, i) => s + getItemTotalProcessed(i), 0)
  const totalDeficit = items.reduce((s, i) => s + getItemDeficit(i), 0)
  return { totalDeclared, totalSubjectTo, totalProcessed, totalDeficit }
})

// Totals for packaging items
const packagingTotals = computed(() => {
  const items = packagingItems.value
  const totalDeclared = items.reduce((s, i) => s + (parseFloat(i.declared) || 0), 0)
  const totalSubjectTo = items.reduce((s, i) => s + getItemSubjectToRecycle(i), 0)
  const totalProcessed = items.reduce((s, i) => s + getItemTotalProcessed(i), 0)
  const totalDeficit = items.reduce((s, i) => s + getItemDeficit(i), 0)
  return { totalDeclared, totalSubjectTo, totalProcessed, totalDeficit }
})

const downloadExcel = () => {
  if (!report.value) return
  generateRecyclingReportExcel(report.value, {
    name: report.value.company || '',
    inn: report.value.inn || '',
    address: 'г. Бишкек, ул. Московская, 123',
  })
}

const downloadPdf = () => {
  toastStore.show({ type: 'info', title: 'Скачивание PDF', message: 'Функция будет доступна в следующей версии' })
}

const goBack = () => {
  router.push('/business/reports')
}

const fmt = (n: number) => n.toFixed(2)
const fmtPercent = (n: number) => (n * 100).toFixed(1) + '%'
</script>

<template>
  <DashboardLayout
    role="business"
    :roleTitle="roleTitle"
    userName="ОсОО «ТехПром»"
    :menuItems="menuItems"
  >
    <!-- Not found -->
    <div v-if="!report" class="text-center py-16">
      <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
        <svg class="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h2 class="text-xl font-bold text-[#1e293b] mb-2">Отчёт не найден</h2>
      <p class="text-[#64748b] mb-6">Запрошенный отчёт не существует</p>
      <button @click="goBack" class="px-6 py-2.5 border border-[#e2e8f0] rounded-lg text-[#64748b] hover:bg-white">
        Назад к списку
      </button>
    </div>

    <template v-else>
      <!-- Back link -->
      <button @click="goBack" class="flex items-center gap-2 text-[#64748b] hover:text-[#1e293b] mb-4 text-sm">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Назад к списку отчётов
      </button>

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div class="flex items-center gap-3 mb-1">
            <h1 class="text-xl font-bold text-[#1e293b]">{{ report.number }}</h1>
            <span :class="['px-3 py-1 rounded-full text-xs font-medium', getStatusClass(report.status)]">
              {{ report.status }}
            </span>
          </div>
          <div class="flex items-center gap-4 text-sm text-[#64748b]">
            <span>Период: <strong class="text-[#1e293b]">{{ report.year }} год</strong></span>
            <span>Дата подачи: <strong class="text-[#1e293b]">{{ report.date }}</strong></span>
          </div>
        </div>
        <div class="flex items-center gap-2 flex-wrap">
          <span class="text-sm text-[#64748b]">Выполнение:</span>
          <span :class="[
            'text-lg font-bold',
            report.processingPercent >= 100 ? 'text-[#10b981]' : report.processingPercent >= 80 ? 'text-[#f59e0b]' : 'text-[#ef4444]'
          ]">{{ report.processingPercent }}%</span>
        </div>
      </div>

      <!-- Rejection reason -->
      <div v-if="report.status === 'Отклонён' && report.rejectionReason" class="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <svg class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div>
          <p class="font-medium text-red-800">Причина отклонения</p>
          <p class="text-sm text-red-700 mt-1">{{ report.rejectionReason }}</p>
        </div>
      </div>

      <!-- Section 1: General info -->
      <div class="rd-section mb-6">
        <h2 class="rd-section__title">Общие сведения</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <p class="rd-label">Наименование организации</p>
            <p class="rd-value">{{ report.company }}</p>
          </div>
          <div>
            <p class="rd-label">ИНН</p>
            <p class="rd-value font-mono">{{ report.inn }}</p>
          </div>
          <div>
            <p class="rd-label">Отчётный период</p>
            <p class="rd-value">{{ report.year }} год</p>
          </div>
          <div>
            <p class="rd-label">Адрес</p>
            <p class="rd-value">г. Бишкек, ул. Московская, 123</p>
          </div>
          <div>
            <p class="rd-label">Контактная информация</p>
            <p class="rd-value">+996 555 123 456, info@techprom.kg</p>
          </div>
          <div>
            <p class="rd-label">Тип плательщика</p>
            <p class="rd-value">Импортёр / Производитель</p>
          </div>
        </div>
      </div>

      <!-- Section 2: Product items table -->
      <div class="bg-white rounded-xl border border-[#e2e8f0] shadow-sm mb-6 overflow-hidden">
        <div class="px-5 py-4 border-b border-[#e2e8f0]">
          <h2 class="text-base font-semibold text-[#1e293b]">1. Информация о товарах (без упаковки товаров)</h2>
          <p class="text-xs text-[#64748b] mt-1">Приложение 1 к Порядку, утверждённому постановлением Кабинета Министров КР №563</p>
        </div>

        <div v-if="productItems.length > 0" class="rd-table-wrap">
          <table class="rd-table">
            <thead>
              <tr>
                <th class="rd-th" style="min-width:40px">Гр.1<br><span class="rd-th-sub">№ п/п</span></th>
                <th class="rd-th" style="min-width:180px">Гр.2<br><span class="rd-th-sub">Наименование товара</span></th>
                <th class="rd-th" style="min-width:80px">Гр.3<br><span class="rd-th-sub">Код ГСКП</span></th>
                <th class="rd-th" style="min-width:140px">Гр.4<br><span class="rd-th-sub">Наимен. ТН ВЭД</span></th>
                <th class="rd-th" style="min-width:90px">Гр.5<br><span class="rd-th-sub">Код ТН ВЭД</span></th>
                <th class="rd-th rd-th--num" style="min-width:90px">Гр.6<br><span class="rd-th-sub">Выпущено (кг)</span></th>
                <th class="rd-th rd-th--num" style="min-width:70px">Гр.7<br><span class="rd-th-sub">Норматив</span></th>
                <th class="rd-th rd-th--num" style="min-width:100px">Гр.8<br><span class="rd-th-sub">К перераб. (кг)</span></th>
                <th class="rd-th rd-th--num" style="min-width:100px">Гр.9<br><span class="rd-th-sub">Перераб. (кг)</span></th>
                <th class="rd-th rd-th--num" style="min-width:100px">Гр.10<br><span class="rd-th-sub">Пред. период</span></th>
                <th class="rd-th rd-th--num" style="min-width:100px">Гр.11<br><span class="rd-th-sub">Итого перераб.</span></th>
                <th class="rd-th rd-th--num" style="min-width:110px">Гр.12<br><span class="rd-th-sub">Утильсбор (кг)</span></th>
                <th class="rd-th" style="min-width:140px">Гр.13<br><span class="rd-th-sub">Документы</span></th>
                <th class="rd-th" style="min-width:80px">Гр.14<br><span class="rd-th-sub">Примечание</span></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in productItems" :key="item.id" class="rd-row">
                <td class="rd-td rd-td--center">{{ idx + 1 }}</td>
                <td class="rd-td">{{ getGroupLabel(item.wasteType) }}</td>
                <td class="rd-td font-mono">{{ getSubgroupByCode(item.wasteType, item.wasteCode)?.gskpCode || item.wasteCode }}</td>
                <td class="rd-td rd-td--small">{{ getSubgroupByCode(item.wasteType, item.wasteCode)?.tnvedName || '—' }}</td>
                <td class="rd-td font-mono">{{ getSubgroupByCode(item.wasteType, item.wasteCode)?.tnvedCode || item.wasteCode }}</td>
                <td class="rd-td rd-td--num">{{ fmt((parseFloat(item.declared) || 0) * 1000) }}</td>
                <td class="rd-td rd-td--num">{{ fmtPercent(getItemNormative(item)) }}</td>
                <td class="rd-td rd-td--num">{{ fmt(getItemSubjectToRecycle(item) * 1000) }}</td>
                <td class="rd-td rd-td--num">{{ fmt(getItemTotalProcessed(item) * 1000) }}</td>
                <td class="rd-td rd-td--num">0.00</td>
                <td class="rd-td rd-td--num">{{ fmt(getItemTotalProcessed(item) * 1000) }}</td>
                <td class="rd-td rd-td--num" :class="getItemDeficit(item) > 0 ? 'text-[#ef4444] font-semibold' : 'text-[#10b981]'">{{ fmt(getItemDeficit(item) * 1000) }}</td>
                <td class="rd-td rd-td--small">{{ item.contractNumber || '—' }}</td>
                <td class="rd-td rd-td--small">—</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="rd-row--total">
                <td class="rd-td" colspan="5"><strong>ИТОГО</strong></td>
                <td class="rd-td rd-td--num"><strong>{{ fmt(productTotals.totalDeclared * 1000) }}</strong></td>
                <td class="rd-td rd-td--num">—</td>
                <td class="rd-td rd-td--num"><strong>{{ fmt(productTotals.totalSubjectTo * 1000) }}</strong></td>
                <td class="rd-td rd-td--num"><strong>{{ fmt(productTotals.totalProcessed * 1000) }}</strong></td>
                <td class="rd-td rd-td--num"><strong>0.00</strong></td>
                <td class="rd-td rd-td--num"><strong>{{ fmt(productTotals.totalProcessed * 1000) }}</strong></td>
                <td class="rd-td rd-td--num" :class="productTotals.totalDeficit > 0 ? 'text-[#ef4444]' : 'text-[#10b981]'"><strong>{{ fmt(productTotals.totalDeficit * 1000) }}</strong></td>
                <td class="rd-td" colspan="2"></td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div v-else class="px-5 py-8 text-center text-sm text-[#64748b]">
          Нет данных о товарах
        </div>
      </div>

      <!-- Section 3: Packaging items table -->
      <div class="bg-white rounded-xl border border-[#e2e8f0] shadow-sm mb-6 overflow-hidden">
        <div class="px-5 py-4 border-b border-[#e2e8f0]">
          <h2 class="text-base font-semibold text-[#1e293b]">2. Информация об упаковке товаров</h2>
        </div>

        <div v-if="packagingItems.length > 0" class="rd-table-wrap">
          <table class="rd-table">
            <thead>
              <tr>
                <th class="rd-th" style="min-width:40px">№ п/п</th>
                <th class="rd-th" style="min-width:140px">Материал упаковки</th>
                <th class="rd-th" style="min-width:80px">Букв. обозн.</th>
                <th class="rd-th" style="min-width:70px">Цифр. код</th>
                <th class="rd-th" style="min-width:160px">Наименование</th>
                <th class="rd-th rd-th--num" style="min-width:90px">Выпущено (кг)</th>
                <th class="rd-th rd-th--num" style="min-width:70px">Норматив</th>
                <th class="rd-th rd-th--num" style="min-width:100px">К перераб. (кг)</th>
                <th class="rd-th rd-th--num" style="min-width:100px">Перераб. (кг)</th>
                <th class="rd-th rd-th--num" style="min-width:90px">Пред. период</th>
                <th class="rd-th rd-th--num" style="min-width:100px">Итого перераб.</th>
                <th class="rd-th rd-th--num" style="min-width:110px">Утильсбор (кг)</th>
                <th class="rd-th" style="min-width:120px">Документы</th>
                <th class="rd-th" style="min-width:80px">Примечание</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in packagingItems" :key="item.id" class="rd-row">
                <td class="rd-td rd-td--center">{{ idx + 1 }}</td>
                <td class="rd-td">{{ getSubgroupByCode(item.wasteType, item.wasteCode)?.packagingMaterial || '—' }}</td>
                <td class="rd-td font-mono">{{ getSubgroupByCode(item.wasteType, item.wasteCode)?.packagingLetterCode || '—' }}</td>
                <td class="rd-td font-mono">{{ getSubgroupByCode(item.wasteType, item.wasteCode)?.packagingDigitalCode || '—' }}</td>
                <td class="rd-td">{{ getGroupLabel(item.wasteType) }}</td>
                <td class="rd-td rd-td--num">{{ fmt((parseFloat(item.declared) || 0) * 1000) }}</td>
                <td class="rd-td rd-td--num">{{ fmtPercent(getItemNormative(item)) }}</td>
                <td class="rd-td rd-td--num">{{ fmt(getItemSubjectToRecycle(item) * 1000) }}</td>
                <td class="rd-td rd-td--num">{{ fmt(getItemTotalProcessed(item) * 1000) }}</td>
                <td class="rd-td rd-td--num">0.00</td>
                <td class="rd-td rd-td--num">{{ fmt(getItemTotalProcessed(item) * 1000) }}</td>
                <td class="rd-td rd-td--num" :class="getItemDeficit(item) > 0 ? 'text-[#ef4444] font-semibold' : 'text-[#10b981]'">{{ fmt(getItemDeficit(item) * 1000) }}</td>
                <td class="rd-td rd-td--small">{{ item.contractNumber || '—' }}</td>
                <td class="rd-td rd-td--small">—</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="rd-row--total">
                <td class="rd-td" colspan="5"><strong>ИТОГО</strong></td>
                <td class="rd-td rd-td--num"><strong>{{ fmt(packagingTotals.totalDeclared * 1000) }}</strong></td>
                <td class="rd-td rd-td--num">—</td>
                <td class="rd-td rd-td--num"><strong>{{ fmt(packagingTotals.totalSubjectTo * 1000) }}</strong></td>
                <td class="rd-td rd-td--num"><strong>{{ fmt(packagingTotals.totalProcessed * 1000) }}</strong></td>
                <td class="rd-td rd-td--num"><strong>0.00</strong></td>
                <td class="rd-td rd-td--num"><strong>{{ fmt(packagingTotals.totalProcessed * 1000) }}</strong></td>
                <td class="rd-td rd-td--num"><strong>{{ fmt(packagingTotals.totalDeficit * 1000) }}</strong></td>
                <td class="rd-td" colspan="2"></td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div v-else class="px-5 py-8 text-center text-sm text-[#64748b]">
          Нет данных об упаковке
        </div>
      </div>

      <!-- Documents section -->
      <div v-if="report.files.length > 0" class="bg-white rounded-xl border border-[#e2e8f0] shadow-sm mb-6 overflow-hidden">
        <div class="px-5 py-4 border-b border-[#e2e8f0]">
          <h2 class="text-base font-semibold text-[#1e293b]">Прикреплённые документы ({{ report.files.length }})</h2>
        </div>
        <div class="p-5 space-y-2">
          <div v-for="file in report.files" :key="file.id" class="flex items-center gap-3 bg-[#f8fafc] rounded-lg px-4 py-3 border border-[#e2e8f0]">
            <div class="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
              <svg class="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-[#1e293b] truncate">{{ file.name }}</p>
              <p class="text-xs text-[#64748b]">{{ file.size }}</p>
            </div>
            <button class="text-[#2563eb] hover:text-[#1d4ed8] text-sm font-medium flex-shrink-0">Скачать</button>
          </div>
        </div>
      </div>

      <!-- Bottom actions -->
      <div class="flex flex-wrap items-center gap-3">
        <button
          @click="downloadExcel"
          class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full bg-[#059669] text-white hover:bg-[#047857] transition-colors shadow-sm"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
          Скачать Excel
        </button>
        <button
          @click="downloadPdf"
          class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full bg-[#8B5CF6] text-white hover:bg-[#7C3AED] transition-colors shadow-sm"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          Скачать PDF
        </button>
        <button
          @click="goBack"
          class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full border border-[#e2e8f0] text-[#64748b] hover:bg-white transition-colors"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Назад к списку
        </button>
      </div>
    </template>
  </DashboardLayout>
</template>

<style scoped>
.rd-section {
  background: #F8FAFC;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
}
.rd-section__title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 16px;
}
.rd-label {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 2px;
}
.rd-value {
  font-size: 14px;
  color: #1e293b;
  font-weight: 500;
}

/* Table */
.rd-table-wrap {
  overflow-x: auto;
}
.rd-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.rd-th {
  background: #F1F5F9;
  padding: 8px 10px;
  font-weight: 600;
  color: #1e293b;
  border: 1px solid #e2e8f0;
  text-align: left;
  vertical-align: top;
  font-size: 12px;
  line-height: 1.3;
}
.rd-th-sub {
  font-weight: 400;
  font-size: 11px;
  color: #64748b;
}
.rd-th--num {
  text-align: right;
}
.rd-td {
  padding: 7px 10px;
  border: 1px solid #e2e8f0;
  color: #1e293b;
  vertical-align: top;
}
.rd-td--num {
  text-align: right;
  font-variant-numeric: tabular-nums;
}
.rd-td--center {
  text-align: center;
}
.rd-td--small {
  font-size: 12px;
  color: #64748b;
}
.rd-row:hover {
  background: #f8fafc;
}
.rd-row--total {
  background: #F1F5F9;
}
.rd-row--total .rd-td {
  font-weight: 600;
}
</style>
