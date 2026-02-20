<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import SkeletonLoader from '../../components/dashboard/SkeletonLoader.vue'
import DataTable from '../../components/dashboard/DataTable.vue'
import EmptyState from '../../components/dashboard/EmptyState.vue'
import { AppBadge } from '../../components/ui'
import { getStatusBadgeVariant } from '../../utils/statusVariant'
import { productGroups, productSubgroups, type ProductSubgroup } from '../../data/product-groups'
import { getNormativeForGroup, normativeTiers } from '../../data/recycling-norms'
import ProductGroupSelector from '../../components/ProductGroupSelector.vue'
import { reportStore, type ProcessingItem } from '../../stores/reports'
import InstructionDrawer from '../../components/InstructionDrawer.vue'
import { instructionReportHtml } from '../../data/instructionReport'
import { recyclerStore } from '../../stores/recyclers'
import { generateRecyclingReportExcel } from '../../utils/excelExport'
import { validators, scrollToFirstError } from '../../utils/validators'
import { useBusinessMenu } from '../../composables/useRoleMenu'
import { toastStore } from '../../stores/toast'
import { notificationStore } from '../../stores/notifications'

const router = useRouter()
const { roleTitle, menuItems } = useBusinessMenu()

// Loading state
const isLoading = ref(true)
onMounted(() => { isLoading.value = false })

const showInstruction = ref(false)

// Validation state
const formSubmitted = ref(false)

// View state
type ViewMode = 'list' | 'wizard' | 'success'
const viewMode = ref<ViewMode>('list')
const currentStep = ref(1)
const totalSteps = 4

const steps = [
  { number: 1, title: 'Основные данные' },
  { number: 2, title: 'Данные о переработке' },
  { number: 3, title: 'Документы' },
  { number: 4, title: 'Проверка и отправка' },
]

// Form data - Step 1
const reportingYear = ref('2026')

// Company data (from profile - readonly)
const companyData = {
  name: 'ОсОО «ТехПром»',
  inn: '01234567890123',
  address: 'г. Бишкек, ул. Московская, 123',
  director: 'Иванов Иван Иванович',
  phone: '+996 555 123 456',
  email: 'info@techprom.kg'
}

// Form data - Step 2
const processingItems = ref<ProcessingItem[]>([
  { id: 1, wasteType: '', wasteCode: '', declared: '', processed: '', recycler: '', contractNumber: '', contractDate: '' }
])

// Lookup для getWasteTypeLabel
const wasteTypes = productGroups.map(g => ({ value: g.value, label: g.label, code: g.code }))

// Recyclers from shared store, filtered by active status and matching waste types
const getRecyclersForItem = (item: ProcessingItem) => {
  const active = item.wasteType
    ? recyclerStore.getActiveRecyclersByGroup(item.wasteType)
    : recyclerStore.getActiveRecyclers()
  return active.map(r => {
    const freeCapacity = item.wasteType ? recyclerStore.getFreeCapacityForGroup(r, item.wasteType) : 0
    const totalCap = item.wasteType ? (recyclerStore.getCapacityForGroup(r, item.wasteType)?.capacityTons || 0) : 0
    const capLabel = item.wasteType && totalCap > 0 ? ` (свободно ${freeCapacity} из ${totalCap} т/год)` : ''
    return {
      value: String(r.id),
      label: `${r.name} (ИНН: ${r.inn})` + capLabel,
    }
  })
}

// Tracking state per processing item
const itemSubgroups = reactive<Record<number, string>>({})
const recyclerModes = reactive<Record<number, string>>({})

const getSubgroupsForGroup = (groupValue: string) => {
  return productSubgroups[groupValue] || []
}

let nextItemId = 2

const addProcessingItem = () => {
  processingItems.value.push({
    id: nextItemId++,
    wasteType: '',
    wasteCode: '',
    declared: '',
    processed: '',
    recycler: '',
    contractNumber: '',
    contractDate: ''
  })
}

const removeProcessingItem = (id: number) => {
  if (processingItems.value.length > 1) {
    processingItems.value = processingItems.value.filter(item => item.id !== id)
  }
}

const onGroupChange = (item: ProcessingItem) => {
  itemSubgroups[item.id] = ''
  const group = productGroups.find(g => g.value === item.wasteType)
  item.wasteCode = group?.code || ''
}

const onSubgroupChange = (item: ProcessingItem) => {
  const subs = getSubgroupsForGroup(item.wasteType)
  const sub = subs.find(s => s.value === itemSubgroups[item.id])
  if (sub) {
    item.wasteCode = sub.code
  }
}

const onRecyclerChange = (item: ProcessingItem) => {
  if (item.recycler === '__manual__') {
    item.recycler = ''
    recyclerModes[item.id] = 'manual'
  }
}

const switchToSelect = (item: ProcessingItem) => {
  item.recycler = ''
  recyclerModes[item.id] = 'select'
}

const getRecyclerLabel = (value: string) => {
  const id = parseInt(value)
  if (!isNaN(id)) {
    const r = recyclerStore.getRecyclerById(id)
    if (r) return r.name
  }
  return value
}

const getWasteTypeLabel = (value: string) => {
  return wasteTypes.find(w => w.value === value)?.label || value
}

// Import from declaration mock
const importFromDeclaration = () => {
  const items = [
    { id: nextItemId++, wasteType: 'group_6', wasteCode: '3923', declared: '12.5', processed: '11.8', recycler: 'ecorecycle', contractNumber: 'ДГ-2024-045', contractDate: '2024-01-15' },
    { id: nextItemId++, wasteType: 'group_1', wasteCode: '4819 10', declared: '8.3', processed: '8.3', recycler: 'greentech', contractNumber: 'ДГ-2024-046', contractDate: '2024-01-15' },
    { id: nextItemId++, wasteType: 'group_8', wasteCode: '7010', declared: '5.2', processed: '5.0', recycler: 'glassprom', contractNumber: 'ДГ-2024-047', contractDate: '2024-02-01' },
  ]
  processingItems.value = items
}

// Form data - Step 3
interface UploadedFile {
  id: number
  name: string
  size: string
  type: string
}

const uploadedFiles = ref<UploadedFile[]>([])
const isDragging = ref(false)
let nextFileId = 1

const handleDrop = (e: DragEvent) => {
  isDragging.value = false
  const files = e.dataTransfer?.files
  if (files) {
    addFiles(files)
  }
}

const handleFileSelect = (e: Event) => {
  const input = e.target as HTMLInputElement
  if (input.files) {
    addFiles(input.files)
  }
}

const addFiles = (files: FileList) => {
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    uploadedFiles.value.push({
      id: nextFileId++,
      name: file.name,
      size: formatFileSize(file.size),
      type: file.type
    })
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const removeFile = (id: number) => {
  uploadedFiles.value = uploadedFiles.value.filter(f => f.id !== id)
}

// Navigation
const nextStep = () => {
  if (currentStep.value < totalSteps) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const goToStep = (step: number) => {
  if (step <= currentStep.value) {
    currentStep.value = step
  }
}

// Submission
const submittedReport = ref<{ number: string; date: string }>({
  number: '',
  date: ''
})

const submitReport = () => {
  formSubmitted.value = true
  if (hasErrors.value) {
    scrollToFirstError()
    return
  }
  const report = reportStore.addReport({
    company: companyData.name,
    inn: companyData.inn,
    year: reportingYear.value,
    items: [...processingItems.value.filter(i => i.wasteType)],
    files: [...uploadedFiles.value],
    totalDeclared: parseFloat(totalDeclared.value),
    totalProcessed: parseFloat(totalProcessed.value),
    processingPercent: parseFloat(processingPercent.value),
  }, 'На проверке')
  notificationStore.add({
    type: 'info',
    title: 'Новый входящий отчёт',
    message: `Поступил отчёт о переработке от ${companyData.name}. Требуется проверка.`,
    role: 'eco-operator',
    link: '/eco-operator/incoming-reports'
  })
  notificationStore.add({
    type: 'success',
    title: 'Отчёт отправлен',
    message: 'Ваш отчёт о переработке отправлен на проверку.',
    role: 'business'
  })
  submittedReport.value = {
    number: report.number,
    date: report.date,
  }
  viewMode.value = 'success'
}

const saveDraft = () => {
  reportStore.addReport({
    company: companyData.name,
    inn: companyData.inn,
    year: reportingYear.value,
    items: [...processingItems.value.filter(i => i.wasteType)],
    files: [...uploadedFiles.value],
    totalDeclared: parseFloat(totalDeclared.value) || 0,
    totalProcessed: parseFloat(totalProcessed.value) || 0,
    processingPercent: parseFloat(processingPercent.value) || 0,
  }, 'Черновик')
  viewMode.value = 'list'
}

const startWizard = () => {
  currentStep.value = 1
  viewMode.value = 'wizard'
}

const backToList = () => {
  viewMode.value = 'list'
  // Reset form
  currentStep.value = 1
  formSubmitted.value = false
  processingItems.value = [{ id: 1, wasteType: '', wasteCode: '', declared: '', processed: '', recycler: '', contractNumber: '', contractDate: '' }]
  uploadedFiles.value = []
  // Clear tracking state
  Object.keys(itemSubgroups).forEach(k => delete itemSubgroups[Number(k)])
  Object.keys(recyclerModes).forEach(k => delete recyclerModes[Number(k)])
}

// Computed
const canProceedStep1 = computed(() => {
  return reportingYear.value
})

const canProceedStep2 = computed(() => {
  return processingItems.value.some(item => item.wasteType && item.processed)
})

const totalDeclared = computed(() => {
  return processingItems.value
    .reduce((sum, item) => sum + (parseFloat(item.declared) || 0), 0)
    .toFixed(2)
})

const totalProcessed = computed(() => {
  return processingItems.value
    .reduce((sum, item) => sum + (parseFloat(item.processed) || 0), 0)
    .toFixed(2)
})

const processingPercent = computed(() => {
  const declared = parseFloat(totalDeclared.value)
  const processed = parseFloat(totalProcessed.value)
  if (declared === 0) return '0'
  return ((processed / declared) * 100).toFixed(1)
})

const yearNormativeHigh = computed(() => {
  const y = parseInt(reportingYear.value) || 2026
  return Math.round((normativeTiers.high[y] || 0) * 100)
})
const yearNormativeStandard = computed(() => {
  const y = parseInt(reportingYear.value) || 2026
  return Math.round((normativeTiers.standard[y] || 0) * 100)
})

const weightedNormativePercent = computed(() => {
  const items = processingItems.value.filter(i => i.wasteType && parseFloat(i.declared) > 0)
  if (items.length === 0) return yearNormativeStandard.value
  const year = parseInt(reportingYear.value) || 2026
  let weightedSum = 0
  let totalDecl = 0
  for (const item of items) {
    const declared = parseFloat(item.declared) || 0
    const normative = getNormativeForGroup(item.wasteType, year)
    weightedSum += declared * normative * 100
    totalDecl += declared
  }
  return totalDecl > 0 ? Math.round(weightedSum / totalDecl * 10) / 10 : yearNormativeStandard.value
})

const getItemNormativePercent = (wasteType: string) => {
  const year = parseInt(reportingYear.value) || 2026
  return getNormativeForGroup(wasteType, year) * 100
}

const getItemRequiredProcessing = (item: ProcessingItem) => {
  const declared = parseFloat(item.declared) || 0
  const normPercent = getItemNormativePercent(item.wasteType)
  return declared * normPercent / 100
}

const getItemFulfillmentPercent = (item: ProcessingItem) => {
  const required = getItemRequiredProcessing(item)
  const processed = parseFloat(item.processed) || 0
  if (required === 0) return 0
  return (processed / required) * 100
}

const getItemRemainder = (item: ProcessingItem) => {
  const required = getItemRequiredProcessing(item)
  const processed = parseFloat(item.processed) || 0
  return Math.max(0, required - processed)
}

const getItemStatus = (item: ProcessingItem) => {
  const required = getItemRequiredProcessing(item)
  const processed = parseFloat(item.processed) || 0
  if (processed >= required && required > 0) return 'fulfilled'
  if (processed > 0) return 'partial'
  return 'none'
}

const getFulfillmentColor = (percent: number) => {
  if (percent >= 100) return '#059669'
  if (percent >= 50) return '#CA8A04'
  return '#EF4444'
}

const getBaseRate = (wasteType: string) => {
  return productGroups.find(g => g.value === wasteType)?.baseRate || 0
}

// Summary computed values
const totalRequiredProcessing = computed(() => {
  return processingItems.value
    .filter(i => i.wasteType)
    .reduce((sum, item) => sum + getItemRequiredProcessing(item), 0)
})

const overallFulfillmentPercent = computed(() => {
  const total = totalRequiredProcessing.value
  const processed = parseFloat(totalProcessed.value)
  if (total === 0) return 0
  return (processed / total) * 100
})

const totalSurcharge = computed(() => {
  return processingItems.value
    .filter(i => i.wasteType)
    .reduce((sum, item) => {
      const remainder = getItemRemainder(item)
      const rate = getBaseRate(item.wasteType)
      return sum + Math.round(remainder * rate)
    }, 0)
})

// Form validation
const formErrors = computed(() => {
  const errors: Record<string, string> = {}

  // Reporting year: required
  if (!reportingYear.value) {
    errors['reportingYear'] = 'Выберите отчётный период'
  }

  // At least 1 item with a wasteType filled in
  const filledItems = processingItems.value.filter(i => i.wasteType)
  if (filledItems.length === 0) {
    errors['items'] = 'Добавьте хотя бы одну позицию'
  }

  // Per-item validation for numeric fields
  processingItems.value.forEach((item, index) => {
    // Only validate items that have been started (wasteType chosen)
    if (!item.wasteType) return

    const declErr = validators.positiveNumber(item.declared, 'Масса задекл.')
    if (declErr) {
      errors[`item_${item.id}_declared`] = declErr
    }

    const procErr = validators.positiveNumber(item.processed, 'Масса переработанная')
    if (procErr) {
      errors[`item_${item.id}_processed`] = procErr
    }

    // Processed cannot exceed declared
    const declVal = parseFloat(item.declared) || 0
    const procVal = parseFloat(item.processed) || 0
    if (declVal > 0 && procVal > declVal) {
      errors[`item_${item.id}_processed_exceed`] = 'Масса переработанная не может превышать массу задекларированную'
    }

    // Recycler required if processed mass > 0
    if (procVal > 0 && !item.recycler) {
      errors[`item_${item.id}_recycler`] = 'Укажите переработчика при наличии массы переработки'
    }

    // Warning: contract number if recycler selected (soft warning, not blocking)
    if (item.recycler && !item.contractNumber) {
      errors[`item_${item.id}_contract_warn`] = 'Рекомендуется указать № договора с переработчиком'
    }
  })

  return errors
})

const hasErrors = computed(() => Object.keys(formErrors.value).filter(k => !k.endsWith('_warn')).length > 0)

// Table data — from store
const columns = [
  { key: 'number', label: 'Номер', width: '10%' },
  { key: 'year', label: 'Период', width: '8%' },
  { key: 'date', label: 'Дата подачи', width: '10%' },
  { key: 'processingPercent', label: '% выполнения', width: '10%' },
  { key: 'status', label: 'Статус', width: '10%' },
]

const businessReports = computed(() => {
  return reportStore.getBusinessReports(companyData.name)
})


const getPercentClass = (percent: number) => {
  if (percent >= 100) return 'text-[#10b981]'
  if (percent >= 80) return 'text-[#f59e0b]'
  return 'text-[#ef4444]'
}

const getRowClass = (row: Record<string, any>) => {
  switch (row.status) {
    case 'Принят': return 'row-green'
    case 'На проверке': return 'row-yellow'
    case 'Отклонён': return 'row-red'
    default: return 'row-gray'
  }
}

// Actions on reports
const resubmitReport = (id: number) => {
  reportStore.submitForReview(id)
}

const editDraft = (id: number) => {
  const report = reportStore.state.reports.find(r => r.id === id)
  if (report) {
    reportingYear.value = report.year
    processingItems.value = report.items.length > 0 ? [...report.items] : [{ id: 1, wasteType: '', wasteCode: '', declared: '', processed: '', recycler: '', contractNumber: '', contractDate: '' }]
    uploadedFiles.value = [...report.files]
    currentStep.value = 1
    viewMode.value = 'wizard'
  }
}

// More menu (⋯)
const openMenuId = ref<number | null>(null)
const toggleMenu = (id: number) => {
  openMenuId.value = openMenuId.value === id ? null : id
}
const closeMenu = () => {
  openMenuId.value = null
}

// Export / Print handlers
const handleDownloadPdf = () => {
  toastStore.show({ type: 'info', title: 'PDF', message: 'Генерация PDF будет доступна в следующем обновлении' })
}

const handlePrint = () => {
  window.print()
}

const downloadReportExcel = (reportId: number) => {
  const report = reportStore.state.reports.find(r => r.id === reportId)
  if (!report) return
  generateRecyclingReportExcel(report, {
    name: report.company || 'ОсОО «ТехПром»',
    inn: report.inn || '01234567890123',
    address: 'г. Бишкек, ул. Московская, 123',
  })
}
</script>

<template>
  <DashboardLayout
    role="business"
    :roleTitle="roleTitle"
    userName="ОсОО «ТехПром»"
    :menuItems="menuItems"
  >
    <!-- LIST VIEW -->
    <template v-if="viewMode === 'list'">
      <div class="content__header mb-6">
        <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b] mb-2">Отчёты о переработке</h1>
        <p class="text-[#64748b]">Отчёты о выполнении нормативов переработки отходов</p>
      </div>

      <!-- CTA Banner -->
      <div class="mb-6 bg-gradient-to-r from-[#10b981] to-[#059669] rounded-2xl p-6 lg:p-8 text-white relative overflow-hidden">
        <div class="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div class="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        <div class="relative flex flex-col lg:flex-row lg:items-center gap-6">
          <div class="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <svg class="w-8 h-8 lg:w-10 lg:h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div class="flex-1">
            <h2 class="text-xl lg:text-2xl font-bold mb-2">Подать отчёт о переработке</h2>
            <p class="text-white/80 text-sm lg:text-base">Отчёт о выполнении нормативов переработки отходов от использования товаров и упаковки за отчётный год.</p>
          </div>
          <button
            @click="startWizard"
            class="flex items-center justify-center gap-2 bg-white text-[#10b981] px-6 py-3 lg:px-8 lg:py-4 rounded-xl font-semibold hover:bg-green-50 transition-colors shadow-lg flex-shrink-0"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Начать заполнение
          </button>
        </div>
      </div>

      <!-- Info Alert -->
      <div class="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <div class="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
          <svg class="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p class="font-medium text-[#1e293b]">Подсказка</p>
          <p class="text-sm text-[#64748b]">Отчетность представляется ежегодно до 1 апреля года, следующего за отчетным периодом.</p>
        </div>
      </div>

      <template v-if="isLoading">
        <div class="mb-6"><SkeletonLoader variant="card" /></div>
        <SkeletonLoader variant="table" />
      </template>

      <template v-if="!isLoading">
      <!-- Stats -->
      <div class="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
          <p class="text-sm text-[#64748b] mb-1">Норматив переработки</p>
          <p class="text-2xl font-bold text-[#1e293b]">{{ yearNormativeStandard }}%</p>
          <p class="text-xs text-[#94a3b8] mt-1">Группы 1–4: {{ yearNormativeHigh }}%</p>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
          <p class="text-sm text-[#64748b] mb-1">Декларировано за год</p>
          <p class="text-2xl font-bold text-[#2563eb]">26.0 т</p>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
          <p class="text-sm text-[#64748b] mb-1">Переработано</p>
          <p class="text-2xl font-bold text-[#10b981]">25.1 т</p>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
          <p class="text-sm text-[#64748b] mb-1">Выполнение норматива</p>
          <p class="text-2xl font-bold text-[#10b981]">96.5%</p>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
          <p class="text-sm text-[#64748b] mb-1">Средн. % выполнения</p>
          <p class="text-2xl font-bold text-[#059669]">96.5%</p>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
          <p class="text-sm text-[#64748b] mb-1">Доначисление утильсбора</p>
          <p class="text-2xl font-bold text-[#ef4444]">0 сом</p>
        </div>
      </div>

      <!-- Table -->
      <div class="mb-4">
        <h2 class="text-lg font-semibold text-[#1e293b] mb-4">История отчётов</h2>
      </div>

      <DataTable :columns="columns" :data="businessReports" :actions="true" :rowClass="getRowClass">
        <template #empty>
          <EmptyState
            :icon="'<svg class=&quot;w-10 h-10&quot; fill=&quot;none&quot; viewBox=&quot;0 0 40 40&quot; stroke=&quot;currentColor&quot; stroke-width=&quot;1.5&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; d=&quot;M15 28.33h10m-10 6.67h10M28.33 35H11.67a3.33 3.33 0 01-3.34-3.33V8.33A3.33 3.33 0 0111.67 5h9.31a1.67 1.67 0 011.18.49l9.02 9.02a1.67 1.67 0 01.49 1.18v15.98A3.33 3.33 0 0128.33 35z&quot;/></svg>'"
            title="Нет отчётов о переработке"
            description="Подайте отчёт о выполнении нормативов"
            actionLabel="Создать отчёт"
            @action="startWizard()"
          />
        </template>
        <template #cell-number="{ value }">
          <span class="font-mono font-medium text-[#2563eb]">{{ value }}</span>
        </template>
        <template #cell-year="{ value }">
          <span>{{ value }} год</span>
        </template>
        <template #cell-processingPercent="{ value }">
          <span :class="['font-semibold', getPercentClass(value)]">{{ value }}%</span>
        </template>
        <template #cell-status="{ value }">
          <AppBadge :variant="getStatusBadgeVariant(value)">{{ value }}</AppBadge>
        </template>
        <template #actions="{ row }">
          <div class="act-wrap">
            <!-- Черновик: [Редактировать (outline)] -->
            <template v-if="row.status === 'Черновик'">
              <button @click="editDraft(row.id)" class="act-btn act-btn--outline">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                Редактировать
              </button>
            </template>
            <!-- На проверке: [Просмотреть (outline)] -->
            <template v-else-if="row.status === 'На проверке'">
              <router-link :to="{ path: '/business/reports/' + row.id, query: { from: 'reports' } }" class="act-btn act-btn--outline">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                Просмотреть
              </router-link>
            </template>
            <!-- Принят: [Просмотреть (outline)] [⋯ → Скачать PDF, Excel, Печать] -->
            <template v-else-if="row.status === 'Принят'">
              <router-link :to="{ path: '/business/reports/' + row.id, query: { from: 'reports' } }" class="act-btn act-btn--outline">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                Просмотреть
              </router-link>
              <div class="act-more-wrap">
                <button class="act-more" @click.stop="toggleMenu(row.id)">&#x22EF;</button>
                <div v-if="openMenuId === row.id" class="act-dropdown" @mouseleave="closeMenu">
                  <button class="act-dropdown__item" @click="router.push({ path: '/business/reports/' + row.id, query: { from: 'reports', print: 'true' } }); closeMenu()">
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Скачать PDF
                  </button>
                  <button class="act-dropdown__item" @click="downloadReportExcel(row.id); closeMenu()">
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    Скачать Excel
                  </button>
                  <button class="act-dropdown__item" @click="router.push({ path: '/business/reports/' + row.id, query: { from: 'reports', print: 'true' } }); closeMenu()">
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                    Печать
                  </button>
                </div>
              </div>
            </template>
            <!-- Отклонён: [Исправить (filled orange)] [Просмотреть (outline)] -->
            <template v-else-if="row.status === 'Отклонён'">
              <button @click="editDraft(row.id)" class="act-btn act-btn--filled act-btn--orange">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                Исправить
              </button>
              <router-link :to="{ path: '/business/reports/' + row.id, query: { from: 'reports' } }" class="act-btn act-btn--outline">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                Просмотреть
              </router-link>
            </template>
          </div>
        </template>
      </DataTable>

      <!-- Rejection info for declined reports -->
      <template v-for="report in businessReports" :key="'rej-' + report.id">
        <div v-if="report.status === 'Отклонён' && report.rejectionReason" class="mt-4 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <svg class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p class="font-medium text-red-800">Отчёт {{ report.number }} отклонён</p>
            <p class="text-sm text-red-700 mt-1">{{ report.rejectionReason }}</p>
          </div>
        </div>
      </template>
      </template>
    </template>

    <!-- WIZARD VIEW -->
    <template v-else-if="viewMode === 'wizard'">
      <div class="max-w-6xl mx-auto">
        <!-- Header -->
        <div class="mb-6">
          <button @click="backToList" class="flex items-center gap-2 text-[#64748b] hover:text-[#1e293b] mb-4">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Назад к списку
          </button>
          <div class="flex items-center justify-between gap-4">
            <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b]">Подача отчёта о переработке</h1>
            <button @click="showInstruction = true" class="flex items-center gap-2 text-[#2D8B4E] hover:bg-[#ecfdf5] px-4 py-2 rounded-xl transition-colors text-sm font-medium flex-shrink-0">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Инструкция
            </button>
          </div>
        </div>

        <!-- Progress Steps -->
        <div class="bg-white rounded-2xl p-4 lg:p-6 shadow-sm border border-[#e2e8f0] mb-6">
          <div class="flex items-center justify-between">
            <template v-for="(step, index) in steps" :key="step.number">
              <button
                @click="goToStep(step.number)"
                :class="[
                  'flex items-center gap-2 lg:gap-3',
                  step.number <= currentStep ? 'cursor-pointer' : 'cursor-not-allowed'
                ]"
              >
                <div
                  :class="[
                    'w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center font-semibold text-sm lg:text-base transition-colors',
                    currentStep === step.number
                      ? 'bg-[#10b981] text-white'
                      : currentStep > step.number
                        ? 'bg-[#10b981] text-white'
                        : 'bg-[#e2e8f0] text-[#64748b]'
                  ]"
                >
                  <svg v-if="currentStep > step.number" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span v-else>{{ step.number }}</span>
                </div>
                <span
                  :class="[
                    'hidden sm:block text-sm lg:text-base font-medium',
                    currentStep >= step.number ? 'text-[#1e293b]' : 'text-[#64748b]'
                  ]"
                >
                  {{ step.title }}
                </span>
              </button>
              <div
                v-if="index < steps.length - 1"
                :class="[
                  'flex-1 h-1 mx-2 lg:mx-4 rounded-full',
                  currentStep > step.number ? 'bg-[#10b981]' : 'bg-[#e2e8f0]'
                ]"
              ></div>
            </template>
          </div>
        </div>

        <!-- Step Content -->
        <div class="bg-white rounded-2xl shadow-sm border border-[#e2e8f0]">
          <!-- Step 1: Basic Data -->
          <div v-if="currentStep === 1" class="p-6 lg:p-8">
            <h2 class="text-xl font-semibold text-[#1e293b] mb-6">Основные данные</h2>

            <div class="space-y-6">
              <!-- Reporting Period -->
              <div>
                <label class="block text-sm font-medium text-[#1e293b] mb-2">Отчётный год *</label>
                <select
                  v-model="reportingYear"
                  :class="[
                    'w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/20',
                    formSubmitted && formErrors['reportingYear'] ? 'vld-input--error' : 'border-[#e2e8f0]'
                  ]"
                >
                  <option value="">-- Выберите год --</option>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                  <option value="2028">2028</option>
                  <option value="2029">2029</option>
                  <option value="2030">2030</option>
                </select>
                <div v-if="formSubmitted && formErrors['reportingYear']" class="vld-error">
                  <svg class="vld-error__icon w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {{ formErrors['reportingYear'] }}
                </div>
              </div>

              <!-- Company Data -->
              <div class="bg-[#f8fafc] rounded-xl p-5 border border-[#e2e8f0]">
                <div class="flex items-center gap-2 mb-4">
                  <svg class="w-5 h-5 text-[#10b981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <h3 class="font-medium text-[#1e293b]">Данные компании (из профиля)</h3>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs text-[#64748b] mb-1">Наименование</label>
                    <input
                      type="text"
                      :value="companyData.name"
                      readonly
                      class="w-full px-3 py-2 bg-white border border-[#e2e8f0] rounded-lg text-[#1e293b] cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label class="block text-xs text-[#64748b] mb-1">ИНН</label>
                    <input
                      type="text"
                      :value="companyData.inn"
                      readonly
                      class="w-full px-3 py-2 bg-white border border-[#e2e8f0] rounded-lg text-[#1e293b] cursor-not-allowed"
                    />
                  </div>
                  <div class="sm:col-span-2">
                    <label class="block text-xs text-[#64748b] mb-1">Адрес</label>
                    <input
                      type="text"
                      :value="companyData.address"
                      readonly
                      class="w-full px-3 py-2 bg-white border border-[#e2e8f0] rounded-lg text-[#1e293b] cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <!-- Norms Info -->
              <div class="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
                <div class="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p class="font-medium text-[#1e293b]">Норматив переработки на {{ reportingYear }} год: группы 1–4 — {{ yearNormativeHigh }}%, группы 5–24 — {{ yearNormativeStandard }}%</p>
                  <p class="text-sm text-[#64748b]">Необходимо обеспечить переработку не менее установленного норматива от массы задекларированных товаров и упаковки</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 2: Processing Data -->
          <div v-if="currentStep === 2" class="p-6 lg:p-8">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 class="text-xl font-semibold text-[#1e293b]">Данные о переработке</h2>
              <button
                @click="importFromDeclaration"
                class="flex items-center gap-2 text-[#10b981] hover:bg-green-50 px-4 py-2 rounded-lg transition-colors"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Импорт из деклараций
              </button>
            </div>

            <div v-if="formSubmitted && formErrors['items']" class="vld-error mb-4">
              <svg class="vld-error__icon w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {{ formErrors['items'] }}
            </div>

            <div class="space-y-4">
              <div
                v-for="(item, index) in processingItems"
                :key="item.id"
                class="rounded-lg p-6 border border-[#e2e8f0] mb-5"
              >
                <div class="flex items-center justify-between mb-4">
                  <span class="text-sm font-medium text-[#64748b]">Позиция {{ index + 1 }}</span>
                  <button
                    v-if="processingItems.length > 1"
                    @click="removeProcessingItem(item.id)"
                    class="text-red-500 hover:bg-red-50 p-1 rounded transition-colors"
                  >
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <!-- Rows 1-3: Group, subgroup + auto-fields (vertical) -->
                <ProductGroupSelector
                  :group="item.wasteType"
                  :subgroup="itemSubgroups[item.id] || ''"
                  @update:group="(v: string) => { item.wasteType = v; onGroupChange(item) }"
                  @update:subgroup="(v: string) => { itemSubgroups[item.id] = v; onSubgroupChange(item) }"
                  @subgroup-selected="(data: ProductSubgroup | null) => { if (data) item.wasteCode = data.code }"
                  accent-color="#10b981"
                />

                <!-- Row 4: Declared mass (full width) -->
                <div class="mt-4">
                  <label class="block text-xs text-[#64748b] mb-1">Масса задекл. (т)</label>
                  <input
                    type="number"
                    v-model="item.declared"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    :class="[
                      'w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#10b981] text-sm',
                      formSubmitted && formErrors[`item_${item.id}_declared`] ? 'vld-input--error' : 'border-[#e2e8f0]'
                    ]"
                  />
                  <div v-if="formSubmitted && formErrors[`item_${item.id}_declared`]" class="vld-error">
                    <svg class="vld-error__icon w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {{ formErrors[`item_${item.id}_declared`] }}
                  </div>
                </div>

                <!-- Row 5: Normative + Required processing (readonly) -->
                <div v-if="item.wasteType" class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label class="block text-xs text-[#64748b] mb-1">Норматив переработки (%)</label>
                    <div class="w-full px-3 py-2 rounded-lg text-sm font-bold" style="background: #F0FDF4; border: 1px solid #D1FAE5; color: #059669;">
                      {{ getItemNormativePercent(item.wasteType).toFixed(1) }}%
                    </div>
                  </div>
                  <div>
                    <label class="block text-xs text-[#64748b] mb-1">К переработке (т)</label>
                    <div class="w-full px-3 py-2 rounded-lg text-sm font-semibold" style="background: #F8FAFC; border: 1px solid #E2E8F0; color: #1E293B;">
                      {{ getItemRequiredProcessing(item).toFixed(2) }}
                    </div>
                    <p class="text-[10px] text-[#94a3b8] mt-1">= {{ item.declared || '0' }} × {{ getItemNormativePercent(item.wasteType).toFixed(1) }}% / 100</p>
                  </div>
                </div>

                <!-- Row 6: Processing data — 4 fields at 25% each -->
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                  <div>
                    <label class="block text-xs text-[#64748b] mb-1">Масса переработанная (т)</label>
                    <input
                      type="number"
                      v-model="item.processed"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      :class="[
                        'w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#10b981] text-sm',
                        formSubmitted && formErrors[`item_${item.id}_processed`] ? 'vld-input--error' : 'border-[#e2e8f0]'
                      ]"
                    />
                    <div v-if="formSubmitted && formErrors[`item_${item.id}_processed`]" class="vld-error">
                      <svg class="vld-error__icon w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {{ formErrors[`item_${item.id}_processed`] }}
                    </div>
                    <div v-if="formSubmitted && formErrors[`item_${item.id}_processed_exceed`]" class="vld-error">
                      <svg class="vld-error__icon w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {{ formErrors[`item_${item.id}_processed_exceed`] }}
                    </div>
                  </div>
                  <div>
                    <label class="block text-xs text-[#64748b] mb-1">Переработчик</label>
                    <template v-if="recyclerModes[item.id] !== 'manual'">
                      <select
                        v-model="item.recycler"
                        @change="onRecyclerChange(item)"
                        class="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#10b981] text-sm"
                      >
                        <option value="">Выберите переработчика</option>
                        <option v-for="r in getRecyclersForItem(item)" :key="r.value" :value="r.value">
                          {{ r.label }}
                        </option>
                        <option value="__manual__">+ Ввести вручную</option>
                      </select>
                    </template>
                    <template v-else>
                      <div class="flex gap-1 min-w-0">
                        <input
                          type="text"
                          v-model="item.recycler"
                          placeholder="Название переработчика"
                          class="flex-1 min-w-0 px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#10b981] text-sm"
                        />
                        <button
                          @click="switchToSelect(item)"
                          type="button"
                          class="px-2 py-2 border border-[#e2e8f0] text-[#10b981] hover:bg-green-50 rounded-lg transition-colors flex-shrink-0"
                          title="Выбрать из списка"
                        >
                          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                          </svg>
                        </button>
                      </div>
                    </template>
                    <div v-if="formSubmitted && formErrors[`item_${item.id}_recycler`]" class="vld-error">
                      <svg class="vld-error__icon w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {{ formErrors[`item_${item.id}_recycler`] }}
                    </div>
                  </div>
                  <div>
                    <label class="block text-xs text-[#64748b] mb-1">№ договора</label>
                    <input
                      type="text"
                      v-model="item.contractNumber"
                      placeholder="ДГ-2024-001"
                      class="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#10b981] text-sm"
                    />
                    <div v-if="formSubmitted && formErrors[`item_${item.id}_contract_warn`]" class="mt-1 flex items-center gap-1 text-[11px] text-amber-600">
                      <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                      {{ formErrors[`item_${item.id}_contract_warn`] }}
                    </div>
                  </div>
                  <div>
                    <label class="block text-xs text-[#64748b] mb-1">Дата договора</label>
                    <input
                      type="date"
                      v-model="item.contractDate"
                      class="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#10b981] text-sm"
                    />
                  </div>
                </div>

                <!-- Item summary -->
                <div v-if="item.wasteType && item.declared && item.processed" class="mt-4 rounded-lg border p-4" :style="{ borderColor: getFulfillmentColor(getItemFulfillmentPercent(item)) + '40', background: getFulfillmentColor(getItemFulfillmentPercent(item)) + '08' }">
                  <div class="flex items-center gap-2 mb-3">
                    <svg class="w-4 h-4" :style="{ color: getFulfillmentColor(getItemFulfillmentPercent(item)) }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span class="text-xs font-semibold text-[#64748b] uppercase tracking-wide">Итог по позиции</span>
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <p class="text-[11px] text-[#94a3b8] mb-0.5">Выполнение норматива</p>
                      <p class="text-lg font-bold" :style="{ color: getFulfillmentColor(getItemFulfillmentPercent(item)) }">
                        {{ getItemFulfillmentPercent(item).toFixed(1) }}%
                      </p>
                      <!-- progress bar -->
                      <div class="mt-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div class="h-full rounded-full transition-all" :style="{ width: Math.min(getItemFulfillmentPercent(item), 100) + '%', background: getFulfillmentColor(getItemFulfillmentPercent(item)) }"></div>
                      </div>
                    </div>
                    <div>
                      <p class="text-[11px] text-[#94a3b8] mb-0.5">Остаток к переработке</p>
                      <p class="text-lg font-bold text-[#1e293b]">{{ getItemRemainder(item).toFixed(2) }} т</p>
                    </div>
                    <div>
                      <p class="text-[11px] text-[#94a3b8] mb-0.5">Статус</p>
                      <span v-if="getItemStatus(item) === 'fulfilled'" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                        Выполнен
                      </span>
                      <span v-else-if="getItemStatus(item) === 'partial'" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01" /></svg>
                        Частично
                      </span>
                      <span v-else class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        Не выполнен
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              @click="addProcessingItem"
              class="mt-4 flex items-center gap-2 text-[#10b981] hover:bg-green-50 px-4 py-2 rounded-lg transition-colors"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Добавить позицию
            </button>

            <!-- Summary: Сводка по отчёту -->
            <div class="mt-8 pt-6 border-t border-[#e2e8f0]">
              <div class="flex items-center gap-2 mb-4">
                <svg class="w-5 h-5 text-[#10b981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 class="text-base font-semibold text-[#1e293b]">Сводка по отчёту</h3>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <!-- KPI 1: Декларировано -->
                <div class="bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
                  <p class="text-xs text-[#64748b] mb-1">Декларировано</p>
                  <p class="text-xl font-bold text-[#2563eb]">{{ totalDeclared }} т</p>
                </div>
                <!-- KPI 2: К переработке -->
                <div class="bg-purple-50 rounded-xl p-4 text-center border border-purple-100">
                  <p class="text-xs text-[#64748b] mb-1">К переработке (по нормативу)</p>
                  <p class="text-xl font-bold text-[#7c3aed]">{{ totalRequiredProcessing.toFixed(2) }} т</p>
                </div>
                <!-- KPI 3: Переработано -->
                <div class="bg-green-50 rounded-xl p-4 text-center border border-green-100">
                  <p class="text-xs text-[#64748b] mb-1">Фактически переработано</p>
                  <p class="text-xl font-bold text-[#10b981]">{{ totalProcessed }} т</p>
                </div>
                <!-- KPI 4: Выполнение -->
                <div :class="[
                  'rounded-xl p-4 text-center border',
                  overallFulfillmentPercent >= 100 ? 'bg-emerald-50 border-emerald-100' : overallFulfillmentPercent >= 50 ? 'bg-amber-50 border-amber-100' : 'bg-red-50 border-red-100'
                ]">
                  <p class="text-xs text-[#64748b] mb-1">Выполнение норматива</p>
                  <p class="text-xl font-bold" :style="{ color: getFulfillmentColor(overallFulfillmentPercent) }">
                    {{ overallFulfillmentPercent.toFixed(1) }}%
                  </p>
                </div>
              </div>

              <!-- Surcharge estimate -->
              <div v-if="totalSurcharge > 0" class="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 flex items-start gap-3">
                <svg class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p class="font-medium text-red-800">Предварительный доначисление утильсбора</p>
                  <p class="text-lg font-bold text-red-700 mt-1">{{ totalSurcharge.toLocaleString('ru-RU') }} сом</p>
                  <p class="text-xs text-red-600 mt-1">Начисляется за невыполнение норматива переработки (остаток × базовая ставка)</p>
                </div>
              </div>

              <!-- Formula -->
              <div class="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4">
                <p class="text-xs text-[#94a3b8] mb-2 uppercase font-medium tracking-wide">Формула расчёта</p>
                <code class="block text-xs text-[#475569] font-mono leading-relaxed">
                  Выполнение (%) = Переработано / (Декларировано × Норматив / 100) × 100<br/>
                  Доначисление = Σ (Остаток_i × Ставка_i), где Остаток = max(0, Требуемое − Переработано)
                </code>
              </div>
            </div>
          </div>

          <!-- Step 3: Documents -->
          <div v-if="currentStep === 3" class="p-6 lg:p-8">
            <h2 class="text-xl font-semibold text-[#1e293b] mb-2">Подтверждающие документы</h2>
            <p class="text-sm text-[#64748b] mb-6">Загрузите акты приёма-передачи отходов, договоры с переработчиками и другие подтверждающие документы</p>

            <!-- Drop Zone -->
            <div
              @dragover.prevent="isDragging = true"
              @dragleave="isDragging = false"
              @drop.prevent="handleDrop"
              :class="[
                'border-2 border-dashed rounded-xl p-8 text-center transition-colors',
                isDragging ? 'border-[#10b981] bg-green-50' : 'border-[#e2e8f0] hover:border-[#10b981]'
              ]"
            >
              <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-[#f1f5f9] flex items-center justify-center">
                <svg class="w-8 h-8 text-[#64748b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p class="text-[#1e293b] font-medium mb-2">Перетащите файлы сюда</p>
              <p class="text-sm text-[#64748b] mb-4">или</p>
              <label class="inline-flex items-center gap-2 bg-[#10b981] text-white px-5 py-2.5 rounded-lg font-medium hover:bg-[#059669] transition-colors cursor-pointer">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Выбрать файлы
                <input
                  type="file"
                  multiple
                  class="hidden"
                  @change="handleFileSelect"
                />
              </label>
              <p class="text-xs text-[#64748b] mt-4">PDF, DOC, DOCX, XLS, XLSX, JPG, PNG до 10 МБ</p>
            </div>

            <!-- Required Documents Hint -->
            <div class="mt-6 bg-[#f8fafc] rounded-xl p-4 border border-[#e2e8f0]">
              <p class="font-medium text-[#1e293b] mb-2">Рекомендуемые документы:</p>
              <ul class="text-sm text-[#64748b] space-y-1">
                <li class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-[#10b981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4" />
                  </svg>
                  Акты приёма-передачи отходов переработчикам
                </li>
                <li class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-[#10b981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4" />
                  </svg>
                  Договоры на переработку отходов
                </li>
                <li class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-[#10b981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4" />
                  </svg>
                  Акты выполненных работ по переработке
                </li>
              </ul>
            </div>

            <!-- Uploaded Files -->
            <div v-if="uploadedFiles.length > 0" class="mt-6">
              <h3 class="text-sm font-medium text-[#1e293b] mb-3">Загруженные файлы ({{ uploadedFiles.length }})</h3>
              <div class="space-y-2">
                <div
                  v-for="file in uploadedFiles"
                  :key="file.id"
                  class="flex items-center justify-between bg-[#f8fafc] rounded-lg px-4 py-3 border border-[#e2e8f0]"
                >
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-lg bg-[#10b981]/10 flex items-center justify-center">
                      <svg class="w-5 h-5 text-[#10b981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-[#1e293b]">{{ file.name }}</p>
                      <p class="text-xs text-[#64748b]">{{ file.size }}</p>
                    </div>
                  </div>
                  <button
                    @click="removeFile(file.id)"
                    class="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                  >
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 4: Review -->
          <div v-if="currentStep === 4" class="p-6 lg:p-8">
            <h2 class="text-xl font-semibold text-[#1e293b] mb-6">Проверка и отправка</h2>

            <!-- Validation error banner -->
            <div v-if="formSubmitted && hasErrors" class="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3" data-validation-error>
              <svg class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p class="font-medium text-red-800">Обнаружены ошибки в форме</p>
                <ul class="mt-1 text-sm text-red-700 list-disc list-inside">
                  <li v-for="(msg, key) in formErrors" :key="key">{{ msg }}</li>
                </ul>
              </div>
            </div>

            <div class="space-y-6">
              <!-- Basic Data Summary -->
              <div class="bg-[#f8fafc] rounded-xl p-5 border border-[#e2e8f0]">
                <h3 class="font-medium text-[#1e293b] mb-4 flex items-center gap-2">
                  <svg class="w-5 h-5 text-[#10b981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Основные данные
                </h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span class="text-[#64748b]">Отчётный год:</span>
                    <p class="font-medium text-[#1e293b]">{{ reportingYear }}</p>
                  </div>
                  <div>
                    <span class="text-[#64748b]">Организация:</span>
                    <p class="font-medium text-[#1e293b]">{{ companyData.name }}</p>
                  </div>
                  <div>
                    <span class="text-[#64748b]">ИНН:</span>
                    <p class="font-medium text-[#1e293b]">{{ companyData.inn }}</p>
                  </div>
                </div>
              </div>

              <!-- Processing Summary -->
              <div class="bg-[#f8fafc] rounded-xl p-5 border border-[#e2e8f0]">
                <h3 class="font-medium text-[#1e293b] mb-4 flex items-center gap-2">
                  <svg class="w-5 h-5 text-[#10b981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Данные о переработке
                </h3>
                <div class="overflow-x-auto">
                  <table class="w-full text-sm border-collapse">
                    <thead>
                      <tr class="text-left text-[#64748b]">
                        <th class="px-3 py-2 pb-3" style="min-width: 250px">Группа товаров</th>
                        <th class="px-3 py-2 pb-3" style="min-width: 80px">Код</th>
                        <th class="px-3 py-2 pb-3 text-right" style="min-width: 100px">Деклар. (т)</th>
                        <th class="px-3 py-2 pb-3 text-right" style="min-width: 100px">Перераб. (т)</th>
                        <th class="px-3 py-2 pb-3 text-right" style="min-width: 80px">%</th>
                        <th class="px-3 py-2 pb-3" style="min-width: 150px">Переработчик</th>
                      </tr>
                    </thead>
                    <tbody class="text-[#1e293b]">
                      <tr v-for="item in processingItems.filter(i => i.wasteType)" :key="item.id" class="border-t border-[#e2e8f0]">
                        <td class="px-3 py-2">{{ getWasteTypeLabel(item.wasteType) }}</td>
                        <td class="px-3 py-2 font-mono text-xs">{{ item.wasteCode }}</td>
                        <td class="px-3 py-2 text-right">{{ item.declared }}</td>
                        <td class="px-3 py-2 text-right font-medium text-[#10b981]">{{ item.processed }}</td>
                        <td class="px-3 py-2 text-right font-semibold" :class="((parseFloat(item.processed) / parseFloat(item.declared)) * 100) >= getItemNormativePercent(item.wasteType) ? 'text-[#10b981]' : 'text-[#ef4444]'">
                          {{ ((parseFloat(item.processed) / parseFloat(item.declared)) * 100).toFixed(1) }}%
                        </td>
                        <td class="px-3 py-2 text-xs">{{ getRecyclerLabel(item.recycler) }}</td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr class="border-t-2 border-[#e2e8f0] font-semibold">
                        <td colspan="2" class="px-3 py-2 pt-3">Итого:</td>
                        <td class="px-3 py-2 pt-3 text-right">{{ totalDeclared }} т</td>
                        <td class="px-3 py-2 pt-3 text-right text-[#10b981]">{{ totalProcessed }} т</td>
                        <td class="px-3 py-2 pt-3 text-right" :class="parseFloat(processingPercent) >= weightedNormativePercent ? 'text-[#10b981]' : 'text-[#ef4444]'">{{ processingPercent }}%</td>
                        <td class="px-3 py-2"></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <!-- Norm Compliance -->
                <div :class="[
                  'mt-4 p-3 rounded-lg flex items-center gap-2',
                  parseFloat(processingPercent) >= weightedNormativePercent ? 'bg-green-100' : 'bg-yellow-100'
                ]">
                  <svg v-if="parseFloat(processingPercent) >= weightedNormativePercent" class="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <svg v-else class="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span :class="parseFloat(processingPercent) >= weightedNormativePercent ? 'text-green-800' : 'text-yellow-800'">
                    {{ parseFloat(processingPercent) >= weightedNormativePercent ? 'Норматив переработки выполнен' : 'Внимание: норматив переработки не выполнен' }}
                  </span>
                </div>
              </div>

              <!-- Documents Summary -->
              <div class="bg-[#f8fafc] rounded-xl p-5 border border-[#e2e8f0]">
                <h3 class="font-medium text-[#1e293b] mb-4 flex items-center gap-2">
                  <svg class="w-5 h-5 text-[#10b981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  Прикреплённые документы ({{ uploadedFiles.length }})
                </h3>
                <div v-if="uploadedFiles.length > 0" class="space-y-2">
                  <div v-for="file in uploadedFiles" :key="file.id" class="flex items-center gap-2 text-sm text-[#1e293b]">
                    <svg class="w-4 h-4 text-[#64748b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {{ file.name }} ({{ file.size }})
                  </div>
                </div>
                <p v-else class="text-sm text-[#64748b]">Документы не прикреплены</p>
              </div>
            </div>
          </div>

          <!-- Navigation Buttons -->
          <div class="wizard-footer">
            <div>
              <button
                v-if="currentStep > 1"
                class="wiz-btn-back"
                @click="prevStep"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
                Назад
              </button>
            </div>

            <div class="wizard-footer__right">
              <button
                v-if="currentStep === 4"
                class="wiz-btn-outline"
                @click="saveDraft"
              >
                Сохранить черновик
              </button>

              <button
                v-if="currentStep < 4"
                class="wiz-btn-primary"
                :disabled="(currentStep === 1 && !canProceedStep1) || (currentStep === 2 && !canProceedStep2)"
                @click="nextStep"
              >
                Далее
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
              </button>

              <button
                v-if="currentStep === 4"
                class="wiz-btn-primary"
                :disabled="formSubmitted && hasErrors"
                @click="submitReport"
              >
                Подписать и отправить
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- SUCCESS VIEW -->
    <template v-else-if="viewMode === 'success'">
      <div class="max-w-2xl mx-auto text-center py-12">
        <div class="w-24 h-24 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
          <svg class="w-12 h-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b] mb-4">Отчёт успешно отправлен!</h1>

        <div class="bg-white rounded-2xl p-6 shadow-sm border border-[#e2e8f0] mb-8">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <p class="text-sm text-[#64748b] mb-1">Номер отчёта</p>
              <p class="text-lg font-bold text-[#10b981] font-mono">{{ submittedReport.number }}</p>
            </div>
            <div>
              <p class="text-sm text-[#64748b] mb-1">Дата подачи</p>
              <p class="text-lg font-bold text-[#1e293b]">{{ submittedReport.date }}</p>
            </div>
            <div>
              <p class="text-sm text-[#64748b] mb-1">Статус</p>
              <AppBadge variant="warning">На проверке</AppBadge>
            </div>
          </div>
        </div>

        <p class="text-[#64748b] mb-8">
          Ваш отчёт о переработке принят и направлен на проверку.<br/>
          Вы получите уведомление о результате проверки.
        </p>

        <div class="flex flex-col sm:flex-row justify-center gap-4">
          <button @click="handlePrint" class="flex items-center justify-center gap-2 px-6 py-3 border border-[#e2e8f0] rounded-xl text-[#1e293b] hover:bg-[#f8fafc] transition-colors">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Скачать PDF
          </button>
          <button
            @click="backToList"
            class="flex items-center justify-center gap-2 px-6 py-3 bg-[#10b981] text-white rounded-xl font-medium hover:bg-[#059669] transition-colors"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            Вернуться к списку
          </button>
        </div>
      </div>
    </template>

    <InstructionDrawer v-model="showInstruction" title="Инструкция — Отчёт о переработке" :contentHtml="instructionReportHtml" />
  </DashboardLayout>
</template>

<style scoped>
@media print {
  .dashboard-layout > aside,
  .dashboard-layout > main > header,
  .lg\:hidden {
    display: none !important;
  }
  .lg\:ml-72 {
    margin-left: 0 !important;
  }
}

.vld-error {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #EF4444;
  margin-top: 4px;
  line-height: 1.3;
}
.vld-error__icon {
  flex-shrink: 0;
}
.vld-input--error {
  border-color: #EF4444 !important;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
}

/* ── Row status stripes (Variant 6) ── */
:deep(.row-green) { border-left: 4px solid #22c55e !important; }
:deep(.row-yellow) { border-left: 4px solid #f59e0b !important; }
:deep(.row-red) { border-left: 4px solid #ef4444 !important; background: #fffbeb !important; }
:deep(.row-gray) { border-left: 4px solid #d1d5db !important; }

/* ── Action buttons (Variant 6) ── */
.act-wrap {
  display: flex;
  gap: 6px;
  justify-content: flex-end;
  align-items: center;
  flex-wrap: wrap;
}
.act-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  white-space: nowrap;
  text-decoration: none;
  transition: all 0.15s ease;
}
.act-btn--filled {
  color: white;
  border: none;
}
.act-btn--orange { background: #f59e0b; }
.act-btn--orange:hover { background: #d97706; box-shadow: 0 2px 8px rgba(245,158,11,0.25); }
.act-btn--outline {
  background: transparent;
  color: #475569;
  border: 1px solid #e2e8f0;
}
.act-btn--outline:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #1e293b;
}

/* More menu (⋯) */
.act-more-wrap {
  position: relative;
}
.act-more {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 30px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: transparent;
  color: #9ca3af;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  letter-spacing: 2px;
  transition: all 0.15s;
}
.act-more:hover {
  background: #f3f4f6;
  color: #6b7280;
  border-color: #d1d5db;
}
.act-dropdown {
  position: absolute;
  right: 0;
  top: calc(100% + 4px);
  z-index: 10;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1), 0 4px 10px rgba(0,0,0,0.05);
  min-width: 170px;
  padding: 4px;
  overflow: hidden;
}
.act-dropdown__item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 400;
  color: #374151;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.1s;
  white-space: nowrap;
}
.act-dropdown__item:hover {
  background: #f3f4f6;
}

/* ── Wizard footer buttons ── */
.wizard-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
  border-radius: 0 0 12px 12px;
}
.wizard-footer__right {
  display: flex;
  gap: 10px;
}
.wiz-btn-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: transparent;
  color: #6b7280;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.wiz-btn-back:hover {
  background: #f3f4f6;
  color: #374151;
  border-color: #9ca3af;
}
.wiz-btn-outline {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  background: #fff;
  color: #374151;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.wiz-btn-outline:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}
.wiz-btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  background: #10b981;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.wiz-btn-primary:hover {
  background: #059669;
}
.wiz-btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
