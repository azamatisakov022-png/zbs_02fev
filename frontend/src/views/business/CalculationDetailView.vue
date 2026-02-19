<script setup lang="ts">
import { computed, ref, watch, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import { calculationStore, type ProductItem, type AttachedDocument, type DocumentType, type PaymentData, documentTypeLabels } from '../../stores/calculations'
import { accountStore } from '../../stores/account'
import { productGroups, productSubgroups, getSubgroupLabel, getSubgroupData } from '../../data/product-groups'
import TnvedCode from '../../components/TnvedCode.vue'
import { calculatePaymentDeadline, getRemainingDays, formatDateShort } from '../../utils/dateUtils'
import { generateCalculationExcel } from '../../utils/excelExport'
import { downloadElementAsPdf } from '../../utils/pdfExport'
import { useBusinessMenu } from '../../composables/useRoleMenu'
import { toastStore } from '../../stores/toast'
import CalculationTimeline from '../../components/CalculationTimeline.vue'

const router = useRouter()
const route = useRoute()
const { roleTitle, menuItems } = useBusinessMenu()

const calcId = computed(() => Number(route.params.id))
const calc = computed(() => calculationStore.getCalculationById(calcId.value))

// ---- Inline editing state ----
const isEditing = ref(false)
const editItems = ref<ProductItem[]>([])
let editNextItemId = 100
const editDocuments = ref<AttachedDocument[]>([])
let docNextId = 100

function startEditing() {
  if (!calc.value) return
  editItems.value = calc.value.items.map(i => ({ ...i }))
  editNextItemId = Math.max(...editItems.value.map(i => i.id), 0) + 1
  editDocuments.value = calc.value.documents ? calc.value.documents.map(d => ({ ...d })) : []
  docNextId = Math.max(...editDocuments.value.map(d => d.id), 0) + 1
  isEditing.value = true
}

function cancelEditing() {
  isEditing.value = false
  editItems.value = []
  editDocuments.value = []
  if (route.query.edit) {
    router.replace({ path: route.path })
  }
}

function recalcItem(item: ProductItem) {
  const vol = parseFloat(item.volume) || 0
  item.volumeToRecycle = Math.round(vol * item.recyclingStandard / 100 * 100) / 100
  const transferred = parseFloat(item.transferredToRecycling) || 0
  const exported = parseFloat(item.exportedFromKR) || 0
  item.taxableVolume = Math.max(0, Math.round((item.volumeToRecycle - transferred - exported) * 100) / 100)
  item.amount = Math.round(item.taxableVolume * item.rate)
}

function addRow() {
  const defaultGroup = productGroups[0]
  const subs = productSubgroups[defaultGroup.value] || []
  const defaultSub = subs[0]
  const rate = defaultSub ? Math.round(defaultGroup.baseRate * defaultSub.rateMultiplier) : defaultGroup.baseRate
  const newItem: ProductItem = {
    id: editNextItemId++,
    group: defaultGroup.value,
    subgroup: defaultSub?.value || '',
    gskpCode: defaultSub?.gskpCode || '',
    tnvedCode: defaultSub?.tnvedCode || '',
    volume: '0',
    recyclingStandard: defaultGroup.recyclingStandard,
    volumeToRecycle: 0,
    transferredToRecycling: '0',
    exportedFromKR: '0',
    taxableVolume: 0,
    rate,
    amount: 0,
  }
  editItems.value.push(newItem)
}

function removeRow(index: number) {
  if (editItems.value.length <= 1) return
  editItems.value.splice(index, 1)
}

function onGroupChange(item: ProductItem) {
  const group = productGroups.find(g => g.value === item.group)
  if (!group) return
  item.recyclingStandard = group.recyclingStandard
  const subs = productSubgroups[item.group] || []
  const sub = subs[0]
  item.subgroup = sub?.value || ''
  item.gskpCode = sub?.gskpCode || ''
  item.tnvedCode = sub?.tnvedCode || ''
  item.rate = sub ? Math.round(group.baseRate * sub.rateMultiplier) : group.baseRate
  recalcItem(item)
}

function onSubgroupChange(item: ProductItem) {
  const group = productGroups.find(g => g.value === item.group)
  if (!group) return
  const sub = getSubgroupData(item.group, item.subgroup)
  if (sub) {
    item.gskpCode = sub.gskpCode || ''
    item.tnvedCode = sub.tnvedCode || ''
    item.rate = Math.round(group.baseRate * sub.rateMultiplier)
  }
  recalcItem(item)
}

const editTotalAmount = computed(() => editItems.value.reduce((s, i) => s + i.amount, 0))

function saveAsDraft() {
  if (!calc.value) return
  calculationStore.updateCalculationItems(calc.value.id, editItems.value.map(i => ({ ...i })), editTotalAmount.value)
  calculationStore.updateCalculationDocuments(calc.value.id, editDocuments.value.map(d => ({ ...d })))
  isEditing.value = false
  if (route.query.edit) router.replace({ path: route.path, query: { from: route.query.from } })
  toastStore.show({ type: 'success', title: 'Черновик сохранён' })
}

function saveAndSubmit() {
  if (!calc.value) return
  calculationStore.updateCalculationItems(calc.value.id, editItems.value.map(i => ({ ...i })), editTotalAmount.value)
  calculationStore.updateCalculationDocuments(calc.value.id, editDocuments.value.map(d => ({ ...d })))
  calculationStore.submitForReview(calc.value.id)
  isEditing.value = false
  if (route.query.edit) router.replace({ path: route.path, query: { from: route.query.from } })
  toastStore.show({ type: 'success', title: 'Расчёт отправлен на проверку' })
}

// ---- Document upload state ----
const dragOver = ref(false)
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
const MAX_FILE_SIZE = 10 * 1024 * 1024

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' Б'
  if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' КБ'
  return (bytes / (1024 * 1024)).toFixed(1) + ' МБ'
}

function handleFileDrop(e: DragEvent) {
  dragOver.value = false
  if (e.dataTransfer?.files) processFiles(e.dataTransfer.files)
}

function handleFileSelect(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files) processFiles(input.files)
  input.value = ''
}

function processFiles(files: FileList) {
  if (editDocuments.value.length + files.length > 10) {
    toastStore.show({ type: 'error', title: 'Максимум 10 файлов' })
    return
  }
  Array.from(files).forEach(file => {
    if (file.size > MAX_FILE_SIZE) {
      toastStore.show({ type: 'error', title: `Файл "${file.name}" превышает 10 МБ` })
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      editDocuments.value.push({
        id: docNextId++,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        docType: guessDocType(file.name),
        dataUrl: reader.result as string,
      })
      toastStore.show({ type: 'success', title: 'Документ прикреплён' })
    }
    reader.readAsDataURL(file)
  })
}

function guessDocType(name: string): DocumentType {
  const lower = name.toLowerCase()
  if (lower.includes('гтд') || lower.includes('gtd') || lower.includes('декларац')) return 'gtd'
  if (lower.includes('акт') || lower.includes('приём')) return 'act'
  if (lower.includes('наклад')) return 'invoice_goods'
  if (lower.includes('инвойс') || lower.includes('invoice')) return 'invoice'
  if (lower.includes('договор') || lower.includes('контракт')) return 'contract'
  return 'other'
}

function removeDocument(id: number) {
  editDocuments.value = editDocuments.value.filter(d => d.id !== id)
}

function changeDocType(doc: AttachedDocument, type: DocumentType) {
  doc.docType = type
}

// Auto-enter edit mode if ?edit=true
onMounted(() => {
  if (route.query.edit === 'true' && calc.value && (calc.value.status === 'Черновик' || calc.value.status === 'Отклонено')) {
    startEditing()
  }
  if (route.query.print === 'true') {
    nextTick(() => { setTimeout(() => window.print(), 500) })
  }
})

// ---- Original computed ----
const getGroupLabel = (value: string) => {
  return productGroups.find(g => g.value === value)?.label || value
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'Черновик': return 'badge badge-neutral'
    case 'На проверке': return 'badge badge-warning'
    case 'Принято': return 'badge badge-success'
    case 'Отклонено': return 'badge badge-danger'
    case 'Оплата на проверке': return 'badge badge-purple'
    case 'Оплачено': return 'badge badge-info'
    case 'Оплата отклонена': return 'badge badge-danger'
    default: return 'badge badge-neutral'
  }
}

const displayItems = computed(() => isEditing.value ? editItems.value : (calc.value?.items || []))

const totalVolume = computed(() => {
  return displayItems.value.reduce((s, i) => s + (parseFloat(i.volume) || 0), 0).toFixed(2)
})

const totalTransferred = computed(() => {
  return displayItems.value.reduce((s, i) => s + (parseFloat(i.transferredToRecycling || '0') || 0), 0).toFixed(2)
})

const totalExported = computed(() => {
  return displayItems.value.reduce((s, i) => s + (parseFloat(i.exportedFromKR || '0') || 0), 0).toFixed(2)
})

const totalTaxableVolume = computed(() => {
  return displayItems.value.reduce((s, i) => s + (i.taxableVolume || 0), 0).toFixed(2)
})

const displayTotalAmount = computed(() => isEditing.value ? editTotalAmount.value : (calc.value?.totalAmount || 0))

// Timeline dates
const timelineDates = computed(() => {
  if (!calc.value) return {}
  const d: Record<string, string | undefined> = { created: calc.value.date }
  const s = calc.value.status
  if (s !== 'Черновик') d.submitted = calc.value.date
  if (['На проверке', 'Принято', 'Отклонено', 'Оплата на проверке', 'Оплачено', 'Оплата отклонена'].includes(s)) d.reviewed = calc.value.date
  if (['Принято', 'Оплата на проверке', 'Оплачено', 'Оплата отклонена'].includes(s)) { d.approved = calc.value.date; d.invoiced = calc.value.date }
  if (s === 'Оплачено') d.paid = calc.value.paidAt || calc.value.date
  if (s === 'Отклонено') d.rejected = calc.value.rejectedAt || calc.value.date
  return d
})

const payerTypeLabel = computed(() => {
  if (!calc.value) return ''
  return calc.value.payerType === 'importer' ? 'Импортёр' : 'Производитель'
})

const periodLabel = computed(() => {
  if (!calc.value) return ''
  if (calc.value.payerType === 'importer' && calc.value.importDate) {
    return `Ввоз: ${calc.value.importDate}`
  }
  return calc.value.period
})

const computedDueDate = computed(() => {
  if (!calc.value) return null
  const pt = calc.value.payerType || 'producer'
  const deadline = calculatePaymentDeadline(pt, {
    quarter: calc.value.quarter,
    year: calc.value.year,
    importDate: calc.value.importDate,
  })
  return deadline
})

const dueDateFormatted = computed(() => {
  if (!computedDueDate.value) return calc.value?.dueDate || '—'
  return formatDateShort(computedDueDate.value)
})

const deadlineStatus = computed(() => {
  if (!computedDueDate.value) return null
  return getRemainingDays(computedDueDate.value)
})

const reconciliation = computed(() => {
  if (!calc.value) return { charged: 0, paid: 0, difference: 0 }
  return accountStore.getReconciliationForCalculation(calc.value.id)
})

const canEdit = computed(() => calc.value && (calc.value.status === 'Черновик' || calc.value.status === 'Отклонено'))

const goBack = () => {
  const from = route.query.from as string
  const routes: Record<string, string> = {
    account: '/business/account',
    calculations: '/business/calculator',
    declarations: '/business/declarations',
    documents: '/business/documents',
  }
  router.push(routes[from] || '/business/calculator')
}


const printAreaRef = ref<HTMLElement | null>(null)

const handleDownloadPdf = async () => {
  const el = printAreaRef.value
  if (!el) return
  const filename = `calculation-${calc.value?.number || 'export'}.pdf`
  await downloadElementAsPdf(el, filename)
}

const handlePrint = () => {
  window.print()
}

const mockAction = (action: string) => {
  toastStore.show({ type: 'info', title: action })
}

const parentCalc = computed(() => {
  if (!calc.value?.parentId) return null
  return calculationStore.getCalculationById(calc.value.parentId)
})

const downloadExcel = () => {
  if (!calc.value) return
  generateCalculationExcel(calc.value, {
    name: calc.value.company,
    inn: calc.value.inn,
    address: calc.value.address || '',
  }, reconciliation.value)
}

const availableSubgroups = (groupValue: string) => {
  return productSubgroups[groupValue] || []
}

// ---- Payment modal ----
const showPaymentModal = ref(false)
const paymentMethod = ref<'transfer' | 'qr' | 'card'>('transfer')
const paymentForm = ref({
  paymentOrderNumber: '',
  paymentDate: '',
  payerBank: '',
  transferAmount: '',
  comment: '',
})
const paymentFile = ref<{ name: string; type: string; dataUrl: string } | null>(null)
const paymentDragOver = ref(false)
const paymentAmountError = ref('')

function openPayment() {
  paymentMethod.value = 'transfer'
  paymentForm.value = { paymentOrderNumber: '', paymentDate: '', payerBank: '', transferAmount: '', comment: '' }
  paymentFile.value = null
  paymentAmountError.value = ''
  showPaymentModal.value = true
}

function closePayment() {
  showPaymentModal.value = false
}

const canSubmitPayment = computed(() => {
  return paymentForm.value.paymentOrderNumber.trim()
    && paymentForm.value.paymentDate
    && paymentForm.value.payerBank.trim()
    && paymentForm.value.transferAmount
    && paymentFile.value
    && !paymentAmountError.value
})

function validatePaymentAmount() {
  const amount = parseFloat(paymentForm.value.transferAmount)
  if (!amount || !calc.value) {
    paymentAmountError.value = ''
    return
  }
  if (amount !== calc.value.totalAmount) {
    paymentAmountError.value = `Сумма не совпадает с суммой расчёта (${calc.value.totalAmount.toLocaleString('ru-RU')} сом)`
  } else {
    paymentAmountError.value = ''
  }
}

function handlePaymentFileDrop(e: DragEvent) {
  paymentDragOver.value = false
  const file = e.dataTransfer?.files[0]
  if (file) processPaymentFile(file)
}

function handlePaymentFileSelect(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) processPaymentFile(file)
  if (input) input.value = ''
}

function processPaymentFile(file: File) {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png']
  if (!allowedTypes.includes(file.type)) {
    toastStore.show({ type: 'warning', title: 'Недопустимый формат', description: 'Допустимые форматы: PDF, JPG, PNG' })
    return
  }
  if (file.size > 10 * 1024 * 1024) {
    toastStore.show({ type: 'warning', title: 'Файл слишком большой', description: 'Максимальный размер: 10 МБ' })
    return
  }
  const reader = new FileReader()
  reader.onload = () => {
    paymentFile.value = { name: file.name, type: file.type, dataUrl: reader.result as string }
  }
  reader.readAsDataURL(file)
}

function submitPaymentConfirmation() {
  if (!calc.value || !paymentFile.value) return
  const payment: PaymentData = {
    paymentOrderNumber: paymentForm.value.paymentOrderNumber.trim(),
    paymentDate: paymentForm.value.paymentDate,
    payerBank: paymentForm.value.payerBank.trim(),
    transferAmount: parseFloat(paymentForm.value.transferAmount),
    fileName: paymentFile.value.name,
    fileType: paymentFile.value.type,
    fileDataUrl: paymentFile.value.dataUrl,
    comment: paymentForm.value.comment.trim() || undefined,
  }
  calculationStore.submitPayment(calc.value.id, payment)
  closePayment()
  toastStore.show({ type: 'success', title: 'Документ об оплате отправлен', description: 'Эко Оператор проверит поступление средств.' })
}
</script>

<template>
  <DashboardLayout
    role="business"
    :roleTitle="roleTitle"
    userName="ОсОО «ТехПром»"
    :menuItems="menuItems"
  >
    <!-- Not found -->
    <div v-if="!calc" class="text-center py-20">
      <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-[#f1f5f9] flex items-center justify-center">
        <svg class="w-10 h-10 text-[#94a3b8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 class="text-xl font-bold text-[#1e293b] mb-2">Расчёт не найден</h2>
      <p class="text-[#64748b] mb-6">Расчёт с указанным номером не существует</p>
      <button @click="goBack" class="btn-back">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
        Назад
      </button>
    </div>

    <template v-else>
      <div ref="printAreaRef">
      <!-- Header -->
      <div class="mb-6">
        <button @click="goBack" class="btn-back mb-4 no-print">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
          Назад
        </button>
        <div class="flex flex-col sm:flex-row sm:items-center gap-3">
          <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b] font-mono">{{ calc.number }}</h1>
          <span :class="getStatusClass(calc.status)" class="text-sm">{{ calc.status }}</span>
          <span class="text-[#64748b] text-sm">от {{ calc.date }}</span>
        </div>
      </div>

      <!-- Payer Data -->
      <div class="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] p-6 mb-6">
        <h2 class="text-lg font-semibold text-[#1e293b] mb-5 flex items-center gap-2">
          <svg class="w-5 h-5 text-[#f59e0b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          Данные плательщика
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
          <div>
            <p class="text-xs text-[#64748b] mb-1">Тип плательщика</p>
            <p class="font-medium text-[#1e293b]">{{ payerTypeLabel }}</p>
          </div>
          <div>
            <p class="text-xs text-[#64748b] mb-1">Наименование</p>
            <p class="font-medium text-[#1e293b]">{{ calc.company }}</p>
          </div>
          <div>
            <p class="text-xs text-[#64748b] mb-1">ИНН</p>
            <p class="font-medium text-[#1e293b] font-mono">{{ calc.inn }}</p>
          </div>
          <div>
            <p class="text-xs text-[#64748b] mb-1">Адрес</p>
            <p class="font-medium text-[#1e293b]">{{ calc.address || '—' }}</p>
          </div>
          <div>
            <p class="text-xs text-[#64748b] mb-1">{{ calc.payerType === 'importer' ? 'Дата ввоза' : 'Расчётный период' }}</p>
            <p class="font-medium text-[#1e293b]">{{ periodLabel }}</p>
          </div>
          <div>
            <p class="text-xs text-[#64748b] mb-1">Срок оплаты</p>
            <p class="font-medium" :style="{ color: deadlineStatus && (deadlineStatus.overdue || deadlineStatus.days <= 5) ? '#DC2626' : '#f59e0b' }">
              {{ dueDateFormatted }}
            </p>
            <p v-if="deadlineStatus" class="text-xs mt-0.5" :style="{ color: deadlineStatus.overdue ? '#DC2626' : '#94a3b8' }">
              <template v-if="deadlineStatus.overdue">Просрочено на {{ deadlineStatus.days }} дн.!</template>
              <template v-else>Осталось {{ deadlineStatus.days }} дн.</template>
            </p>
          </div>
        </div>
      </div>

      <!-- Timeline -->
      <CalculationTimeline v-if="!isEditing" :status="calc.status" :dates="timelineDates" />

      <!-- Products Table -->
      <div class="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] overflow-hidden mb-6" :class="{ 'ring-2 ring-blue-300': isEditing }">
        <div class="px-6 py-4 border-b border-[#e2e8f0] flex items-center justify-between">
          <h2 class="text-lg font-semibold text-[#1e293b]">Товары и упаковка</h2>
          <span v-if="isEditing" class="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">Режим редактирования</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-[#f8fafc]">
              <tr class="text-left text-[11px] tracking-[0.05em] uppercase text-[#64748b]">
                <th class="px-5 py-3 font-semibold">Группа/подгруппа</th>
                <th class="px-5 py-3 font-semibold text-right">Гр.5 Объём (т)</th>
                <th class="px-5 py-3 font-semibold text-right">Гр.6 Норматив (%)</th>
                <th class="px-5 py-3 font-semibold text-right">Гр.7 К перераб. (т)</th>
                <th class="px-5 py-3 font-semibold text-right">Гр.8 Передано (т)</th>
                <th class="px-5 py-3 font-semibold text-right">Гр.9 Вывезено (т)</th>
                <th class="px-5 py-3 font-semibold text-right">Гр.10 Облагаемый (т)</th>
                <th class="px-5 py-3 font-semibold text-right">Гр.11 Ставка</th>
                <th class="px-5 py-3 font-semibold text-right">Гр.12 Сумма</th>
                <th v-if="isEditing" class="px-3 py-3 font-semibold w-10"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#e2e8f0]">
              <tr
                v-for="(item, index) in displayItems"
                :key="item.id"
                :class="index % 2 === 1 ? 'bg-[#FAFBFC]' : ''"
              >
                <!-- Group/Subgroup -->
                <td class="px-5 py-3 text-[#1e293b] font-medium">
                  <template v-if="isEditing">
                    <select v-model="item.group" @change="onGroupChange(item)" class="edit-select mb-1">
                      <option v-for="g in productGroups" :key="g.value" :value="g.value">{{ g.label }}</option>
                    </select>
                    <select v-model="item.subgroup" @change="onSubgroupChange(item)" class="edit-select text-xs">
                      <option v-for="s in availableSubgroups(item.group)" :key="s.value" :value="s.value">{{ s.label }}</option>
                    </select>
                  </template>
                  <template v-else>
                    {{ getGroupLabel(item.group) }}
                    <span v-if="item.subgroup" class="block text-xs text-[#64748b]">{{ getSubgroupLabel(item.group, item.subgroup) }}</span>
                    <span v-if="item.gskpCode" class="block text-xs text-[#94a3b8] font-mono">{{ item.gskpCode }}</span>
                    <span v-if="item.tnvedCode" class="block text-xs text-[#94a3b8] font-mono mt-0.5">ТН ВЭД <TnvedCode :code="item.tnvedCode" /></span>
                  </template>
                </td>
                <!-- Volume -->
                <td class="px-5 py-3 text-right font-medium text-[#1e293b]">
                  <input v-if="isEditing" type="number" step="0.01" min="0" v-model="item.volume" @input="recalcItem(item)" class="edit-input text-right" />
                  <template v-else>{{ item.volume }}</template>
                </td>
                <!-- Standard -->
                <td class="px-5 py-3 text-right text-[#64748b]">{{ item.recyclingStandard ?? '—' }}%</td>
                <!-- VolumeToRecycle -->
                <td class="px-5 py-3 text-right text-[#64748b]">{{ item.volumeToRecycle ?? '—' }}</td>
                <!-- Transferred -->
                <td class="px-5 py-3 text-right text-[#10b981]">
                  <input v-if="isEditing" type="number" step="0.01" min="0" v-model="item.transferredToRecycling" @input="recalcItem(item)" class="edit-input text-right" />
                  <template v-else>{{ item.transferredToRecycling || '0' }}</template>
                </td>
                <!-- Exported -->
                <td class="px-5 py-3 text-right text-[#2563eb]">
                  <input v-if="isEditing" type="number" step="0.01" min="0" v-model="item.exportedFromKR" @input="recalcItem(item)" class="edit-input text-right" />
                  <template v-else>{{ item.exportedFromKR || '0' }}</template>
                </td>
                <!-- Taxable -->
                <td class="px-5 py-3 text-right text-[#1e293b]">{{ item.taxableVolume ?? '—' }}</td>
                <!-- Rate -->
                <td class="px-5 py-3 text-right text-[#64748b]">{{ item.rate.toLocaleString() }}</td>
                <!-- Amount -->
                <td class="px-5 py-3 text-right font-bold text-[#f59e0b]">{{ item.amount.toLocaleString() }}</td>
                <!-- Remove -->
                <td v-if="isEditing" class="px-3 py-3 text-center">
                  <button v-if="editItems.length > 1" @click="removeRow(index)" class="text-red-400 hover:text-red-600 transition-colors" title="Удалить строку">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- Add row button -->
        <div v-if="isEditing" class="px-6 py-3 border-t border-[#e2e8f0] bg-[#f8fafc]">
          <button @click="addRow" class="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            Добавить строку
          </button>
        </div>
      </div>

      <!-- Documents: Edit mode upload -->
      <div v-if="isEditing" class="bg-white rounded-xl shadow-sm border border-[#e2e8f0] p-6 mb-6">
        <h2 class="text-lg font-semibold text-[#1e293b] mb-1 flex items-center gap-2">
          <svg class="w-5 h-5 text-[#64748b]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/></svg>
          Подтверждающие документы
        </h2>
        <p class="text-sm text-[#94a3b8] mb-4">Прикрепите ГТД, акты приёма-передачи, накладные и другие документы</p>

        <!-- Drop zone -->
        <div
          class="doc-dropzone"
          :class="{ 'doc-dropzone--active': dragOver }"
          @dragover.prevent="dragOver = true"
          @dragleave.prevent="dragOver = false"
          @drop.prevent="handleFileDrop"
        >
          <svg class="w-10 h-10 text-[#94a3b8] mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
          <span class="text-sm text-[#64748b]">Перетащите файлы сюда или нажмите</span>
          <span class="text-xs text-[#94a3b8]">PDF, JPG, PNG, DOC — до 10 МБ, макс. 10 файлов</span>
          <label class="doc-dropzone__btn">
            Выбрать файлы
            <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" class="hidden" @change="handleFileSelect" />
          </label>
        </div>

        <!-- Uploaded file list -->
        <div v-if="editDocuments.length > 0" class="mt-4 space-y-2">
          <div v-for="doc in editDocuments" :key="doc.id" class="doc-file-row">
            <div class="doc-file-row__icon">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            </div>
            <div class="doc-file-row__name">{{ doc.fileName }}</div>
            <select :value="doc.docType" @change="changeDocType(doc, ($event.target as HTMLSelectElement).value as DocumentType)" class="doc-file-row__type">
              <option v-for="(label, key) in documentTypeLabels" :key="key" :value="key">{{ label }}</option>
            </select>
            <span class="doc-file-row__size">{{ formatFileSize(doc.fileSize) }}</span>
            <button @click="removeDocument(doc.id)" class="doc-file-row__delete" title="Удалить">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Documents: View mode (read-only) -->
      <div v-if="!isEditing && calc.documents && calc.documents.length > 0" class="bg-white rounded-xl shadow-sm border border-[#e2e8f0] p-6 mb-6">
        <h2 class="text-lg font-semibold text-[#1e293b] mb-4 flex items-center gap-2">
          <svg class="w-5 h-5 text-[#64748b]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/></svg>
          Подтверждающие документы ({{ calc.documents.length }})
        </h2>
        <div class="space-y-2">
          <div v-for="doc in calc.documents" :key="doc.id" class="doc-file-row doc-file-row--readonly">
            <div class="doc-file-row__icon">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            </div>
            <div class="doc-file-row__name">{{ doc.fileName }}</div>
            <span class="doc-file-row__type-badge">{{ documentTypeLabels[doc.docType] }}</span>
            <span class="doc-file-row__size">{{ formatFileSize(doc.fileSize) }}</span>
            <a v-if="doc.dataUrl" :href="doc.dataUrl" :download="doc.fileName" class="doc-file-row__download" title="Скачать">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            </a>
          </div>
        </div>
      </div>

      <!-- Totals -->
      <div class="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] p-6 mb-6">
        <h2 class="text-lg font-semibold text-[#1e293b] mb-5">Итоги расчёта</h2>
        <div class="grid grid-cols-2 lg:grid-cols-5 gap-6">
          <div>
            <p class="text-sm text-[#64748b] mb-1">Общий объём (Гр.5)</p>
            <p class="text-xl font-bold text-[#1e293b]">{{ totalVolume }} тонн</p>
          </div>
          <div>
            <p class="text-sm text-[#64748b] mb-1">Передано на переработку (Гр.8)</p>
            <p class="text-xl font-bold text-[#10b981]">{{ totalTransferred }} тонн</p>
          </div>
          <div>
            <p class="text-sm text-[#64748b] mb-1">Вывезено из КР (Гр.9)</p>
            <p class="text-xl font-bold text-[#2563eb]">{{ totalExported }} тонн</p>
          </div>
          <div>
            <p class="text-sm text-[#64748b] mb-1">Облагаемый объём (Гр.10)</p>
            <p class="text-xl font-bold text-[#1e293b]">{{ totalTaxableVolume }} тонн</p>
          </div>
          <div>
            <p class="text-sm text-[#64748b] mb-1">Итого к оплате (Гр.12)</p>
            <p class="text-2xl font-bold text-[#10b981]">{{ displayTotalAmount.toLocaleString('ru-RU') }} сом</p>
          </div>
        </div>
      </div>

      <!-- Графа 13: Сверка платежей -->
      <div class="g13-container mb-6">
        <div class="g13-header">
          <h3 class="g13-title">Графа 13. Сверка платежей за отчётный период</h3>
          <div class="g13-tooltip-wrap">
            <svg class="w-4 h-4 text-[#94a3b8] cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div class="g13-tooltip">Заполняется автоматически на основании данных лицевого счёта. Для производителей — по суммам ежеквартальных платежей, для импортёров — по суммам платежей при фактическом ввозе товаров.</div>
          </div>
        </div>
        <div class="g13-cards">
          <div class="g13-card">
            <span class="g13-card__label">Начислено за период</span>
            <span class="g13-card__value">{{ reconciliation.charged.toLocaleString('ru-RU') }} сом</span>
            <span class="g13-card__sub">Из лицевого счёта</span>
          </div>
          <div class="g13-card">
            <span class="g13-card__label">Уплачено за период</span>
            <span class="g13-card__value g13-card__value--green">{{ reconciliation.paid.toLocaleString('ru-RU') }} сом</span>
            <span class="g13-card__sub">Из лицевого счёта</span>
          </div>
          <div :class="['g13-card g13-card--diff', reconciliation.difference > 0 ? 'g13-card--debt' : reconciliation.difference < 0 ? 'g13-card--overpay' : 'g13-card--zero']">
            <span class="g13-card__label">Разница (начислено − уплачено)</span>
            <span class="g13-card__value" :class="{ 'g13-card__value--red': reconciliation.difference > 0, 'g13-card__value--green': reconciliation.difference < 0, 'g13-card__value--gray': reconciliation.difference === 0 }">
              <template v-if="reconciliation.difference > 0">Недоимка: +{{ reconciliation.difference.toLocaleString('ru-RU') }} сом</template>
              <template v-else-if="reconciliation.difference < 0">Переплата: {{ Math.abs(reconciliation.difference).toLocaleString('ru-RU') }} сом</template>
              <template v-else>Задолженность отсутствует</template>
            </span>
          </div>
        </div>
      </div>

      <!-- Parent rejection banner (for copies of rejected calculations) -->
      <div v-if="parentCalc" class="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <div class="flex items-start gap-4">
          <div class="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0 text-lg">
            &#x26A0;&#xFE0F;
          </div>
          <div>
            <h3 class="font-semibold text-amber-800 mb-1">Повторный расчёт (на основе {{ parentCalc.number }})</h3>
            <p v-if="parentCalc.rejectionReason" class="text-amber-700 text-sm">Причина отклонения: {{ parentCalc.rejectionReason }}</p>
          </div>
        </div>
      </div>

      <!-- Rejection Comment -->
      <div v-if="calc.status === 'Отклонено' && calc.rejectionReason" class="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
        <div class="flex items-start gap-4">
          <div class="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0 text-lg">
            &#x274C;
          </div>
          <div class="flex-1">
            <h3 class="font-semibold text-red-800 mb-1">Расчёт отклонён</h3>
            <p v-if="calc.rejectedBy || calc.rejectedAt" class="text-sm text-red-600 mb-2">
              <span v-if="calc.rejectedBy">{{ calc.rejectedBy }}</span>
              <span v-if="calc.rejectedAt"> &middot; {{ calc.rejectedAt }}</span>
            </p>
            <p class="text-red-700 mb-4">{{ calc.rejectionReason }}</p>
            <button v-if="!isEditing" @click="startEditing" class="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              Исправить
            </button>
          </div>
        </div>
      </div>

      <!-- Payment rejection -->
      <div v-if="calc.status === 'Оплата отклонена' && calc.paymentRejectionReason" class="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
        <div class="flex items-start gap-4">
          <div class="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0 text-lg">
            &#x274C;
          </div>
          <div class="flex-1">
            <h3 class="font-semibold text-red-800 mb-1">Оплата отклонена</h3>
            <p class="text-red-700">{{ calc.paymentRejectionReason }}</p>
            <button @click="openPayment" class="mt-3 inline-flex items-center gap-2 px-5 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
              Подтвердить оплату повторно
            </button>
          </div>
        </div>
      </div>

      <!-- Status block: На проверке -->
      <div v-if="calc.status === 'На проверке'" class="status-block status-block--yellow mb-6">
        <div class="flex items-start gap-4">
          <div class="status-block__icon status-block__icon--yellow">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <h3 class="font-semibold text-amber-800">Расчёт на проверке у Эко Оператора</h3>
            <p class="text-amber-700 text-sm mt-1">Ожидайте результат. Эко Оператор проверит расчёт в течение 3 рабочих дней.</p>
          </div>
        </div>
      </div>

      <!-- Status block: Принято (with payment) -->
      <div v-if="calc.status === 'Принято'" class="status-block status-block--green mb-6">
        <div class="flex items-start gap-4">
          <div class="status-block__icon status-block__icon--green">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
          </div>
          <div class="flex-1">
            <h3 class="font-semibold text-green-800">Расчёт принят</h3>
            <div class="mt-4 flex flex-col sm:flex-row sm:items-center gap-4">
              <div>
                <p class="text-sm text-green-700">Сумма к оплате</p>
                <p class="text-2xl font-bold text-green-900">{{ calc.totalAmount.toLocaleString('ru-RU') }} сом</p>
              </div>
              <div v-if="computedDueDate">
                <p class="text-sm text-green-700">Срок оплаты</p>
                <p class="font-semibold" :class="deadlineStatus && (deadlineStatus.overdue || deadlineStatus.days <= 5) ? 'text-red-600' : 'text-green-900'">
                  {{ dueDateFormatted }}
                  <span v-if="deadlineStatus" class="text-xs font-normal ml-1">
                    <template v-if="deadlineStatus.overdue">(просрочено на {{ deadlineStatus.days }} дн.!)</template>
                    <template v-else>(осталось {{ deadlineStatus.days }} дн.)</template>
                  </span>
                </p>
              </div>
            </div>
            <div class="mt-4 flex flex-wrap gap-3">
              <button @click="openPayment" class="inline-flex items-center gap-2 px-5 py-2.5 bg-[#10b981] text-white rounded-lg text-sm font-semibold hover:bg-[#059669] transition-colors shadow-sm">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                Оплатить
              </button>
              <button @click="mockAction('Скачивание счёта')" class="inline-flex items-center gap-2 px-5 py-2.5 border border-green-300 text-green-800 rounded-lg text-sm font-medium hover:bg-green-50 transition-colors">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Скачать счёт
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Status block: Оплата на проверке -->
      <div v-if="calc.status === 'Оплата на проверке'" class="status-block status-block--orange mb-6">
        <div class="flex items-start gap-4">
          <div class="status-block__icon status-block__icon--orange">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          </div>
          <div class="flex-1">
            <h3 class="font-semibold text-orange-800">Подтверждение оплаты отправлено</h3>
            <p class="text-orange-700 text-sm mt-1">Эко Оператор проверяет поступление средств.</p>
            <div v-if="calc.payment" class="mt-3 bg-white/60 rounded-lg p-3 border border-orange-200">
              <p class="text-sm text-orange-800">
                <span class="font-medium">Документ:</span> {{ calc.payment.fileName }}
              </p>
              <p v-if="calc.payment.paymentDate" class="text-sm text-orange-800 mt-1">
                <span class="font-medium">Дата оплаты:</span> {{ calc.payment.paymentDate }}
              </p>
              <p v-if="calc.payment.paymentOrderNumber" class="text-sm text-orange-800 mt-1">
                <span class="font-medium">Платёжное поручение:</span> {{ calc.payment.paymentOrderNumber }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Status block: Оплачено -->
      <div v-if="calc.status === 'Оплачено'" class="status-block status-block--green mb-6">
        <div class="flex items-start gap-4">
          <div class="status-block__icon status-block__icon--green">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
          </div>
          <div>
            <h3 class="font-semibold text-green-800">Оплачено</h3>
            <p v-if="calc.paidAt" class="text-green-700 text-sm mt-1">Дата оплаты: {{ calc.paidAt }}</p>
          </div>
        </div>
      </div>

      <!-- Action Bar -->
      <div class="sticky bottom-0 bg-white border-t border-[#e2e8f0] -mx-4 lg:-mx-8 px-4 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-3" style="box-shadow: 0 -4px 12px rgba(0,0,0,0.05)">
        <!-- Edit mode buttons -->
        <template v-if="isEditing">
          <button @click="cancelEditing" class="btn-action btn-action-ghost text-sm">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            Отмена
          </button>
          <div class="flex flex-wrap items-center gap-2">
            <button @click="saveAsDraft" class="btn-action btn-action-secondary text-sm">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/></svg>
              Сохранить черновик
            </button>
            <button @click="saveAndSubmit" class="btn-action btn-action-primary text-sm" style="background: #10b981; border-color: #10b981;">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
              Отправить на проверку
            </button>
          </div>
        </template>

        <!-- View mode buttons -->
        <template v-else>
          <button @click="goBack" class="btn-back">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
            Назад
          </button>

          <div class="flex flex-wrap items-center gap-2">
            <!-- Draft actions -->
            <template v-if="calc.status === 'Черновик'">
              <button @click="startEditing" class="btn-action btn-action-primary text-sm">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                Редактировать
              </button>
              <button @click="mockAction('Удаление расчёта')" class="btn-action btn-action-danger text-sm">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                Удалить
              </button>
              <button @click="calculationStore.submitForReview(calc.id); toastStore.show({ type: 'success', title: 'Расчёт отправлен на проверку' })" class="btn-action btn-action-primary text-sm" style="background: #10b981; border-color: #10b981;">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
                Отправить на проверку
              </button>
            </template>

            <!-- На проверке actions -->
            <template v-if="calc.status === 'На проверке'">
              <button @click="handleDownloadPdf()" class="btn-pdf">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                Скачать PDF
              </button>
              <button @click="downloadExcel" class="btn-excel">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                Скачать Excel
              </button>
              <button @click="mockAction('Отзыв расчёта')" class="btn-action btn-action-warning text-sm">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/></svg>
                Отозвать расчёт
              </button>
            </template>

            <!-- Принято actions -->
            <template v-if="calc.status === 'Принято'">
              <button @click="openPayment" class="btn-action btn-action-primary text-sm" style="background: #10b981; border-color: #10b981;">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
                Оплатить
              </button>
              <button @click="handleDownloadPdf()" class="btn-pdf">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                Скачать PDF
              </button>
              <button @click="downloadExcel" class="btn-excel">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                Скачать Excel
              </button>
            </template>

            <!-- Отклонено actions -->
            <template v-if="calc.status === 'Отклонено'">
              <button @click="startEditing" class="btn-action text-sm" style="background:#f59e0b; color:#fff; border:1px solid #f59e0b;">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                Исправить
              </button>
            </template>

            <!-- Оплачено / Оплата на проверке -->
            <template v-if="calc.status === 'Оплачено' || calc.status === 'Оплата на проверке'">
              <button @click="handleDownloadPdf()" class="btn-pdf">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                Скачать PDF
              </button>
              <button @click="downloadExcel" class="btn-excel">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                Скачать Excel
              </button>
              <button @click="handlePrint()" class="btn-print">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                Печать
              </button>
            </template>
          </div>
        </template>
      </div>
      </div>
    </template>

    <!-- Payment Modal -->
    <Teleport to="body">
      <div v-if="showPaymentModal" class="pay-overlay" @click.self="closePayment">
        <div class="pay-modal">
          <div class="pay-modal__header">
            <h2 class="text-xl font-bold text-[#1e293b]">Оплата расчёта {{ calc?.number }}</h2>
            <button @click="closePayment" class="pay-modal__close">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div class="pay-modal__amount">
            Сумма к оплате: <strong>{{ calc?.totalAmount.toLocaleString('ru-RU') }} сом</strong>
          </div>

          <!-- Method tabs -->
          <div class="pay-tabs">
            <button :class="['pay-tab', paymentMethod === 'transfer' ? 'pay-tab--active' : '']" @click="paymentMethod = 'transfer'">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              Банковский перевод
            </button>
            <button :class="['pay-tab', paymentMethod === 'qr' ? 'pay-tab--active' : '']" @click="paymentMethod = 'qr'">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
              QR-код
            </button>
            <button class="pay-tab pay-tab--disabled" disabled>
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
              Картой (Q2 2026)
            </button>
          </div>

          <!-- Method: Bank transfer -->
          <div v-if="paymentMethod === 'transfer'" class="pay-body">
            <div class="pay-requisites">
              <h4 class="text-sm font-semibold text-[#1e293b] mb-3">Реквизиты для оплаты</h4>
              <table class="pay-req-table">
                <tr><td>Получатель</td><td>ГП «Эко Оператор»</td></tr>
                <tr><td>ИНН</td><td class="font-mono">01712202610151</td></tr>
                <tr><td>Банк</td><td>ОАО «РСК Банк»</td></tr>
                <tr><td>БИК</td><td class="font-mono">017012</td></tr>
                <tr><td>Р/с</td><td class="font-mono">1091620100830049</td></tr>
                <tr><td>Назначение</td><td>Утилизационный сбор по расчёту {{ calc?.number }}</td></tr>
              </table>
            </div>

            <div class="space-y-4 mt-5">
              <div>
                <label class="pay-label">Номер платёжного поручения *</label>
                <input v-model="paymentForm.paymentOrderNumber" type="text" placeholder="ПП-00412" class="pay-input" />
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="pay-label">Дата оплаты *</label>
                  <input v-model="paymentForm.paymentDate" type="text" placeholder="дд.мм.гггг" onfocus="this.type='date'" onblur="if(!this.value)this.type='text'" class="pay-input" />
                </div>
                <div>
                  <label class="pay-label">Банк плательщика *</label>
                  <input v-model="paymentForm.payerBank" type="text" placeholder="Оптима Банк" class="pay-input" />
                </div>
              </div>
              <div>
                <label class="pay-label">Сумма перевода (сом) *</label>
                <input v-model="paymentForm.transferAmount" @input="validatePaymentAmount" type="number" :placeholder="String(calc?.totalAmount || '')" class="pay-input" :class="{ 'pay-input--error': paymentAmountError }" />
                <p v-if="paymentAmountError" class="text-xs text-red-600 mt-1">{{ paymentAmountError }}</p>
              </div>
              <div>
                <label class="pay-label">Скан/фото платёжного поручения *</label>
                <div
                  v-if="!paymentFile"
                  class="pay-dropzone"
                  :class="{ 'pay-dropzone--active': paymentDragOver }"
                  @dragover.prevent="paymentDragOver = true"
                  @dragleave="paymentDragOver = false"
                  @drop.prevent="handlePaymentFileDrop"
                >
                  <svg class="w-8 h-8 text-[#94a3b8] mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                  <span class="text-sm text-[#64748b]">Перетащите файл или нажмите</span>
                  <span class="text-xs text-[#94a3b8]">PDF, JPG, PNG — до 10 МБ</span>
                  <label class="pay-dropzone__btn">
                    Выбрать файл
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" class="hidden" @change="handlePaymentFileSelect" />
                  </label>
                </div>
                <div v-else class="pay-file-row">
                  <div class="flex items-center gap-3 flex-1 min-w-0">
                    <div class="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <svg class="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <span class="text-sm font-medium text-[#1e293b] truncate">{{ paymentFile.name }}</span>
                  </div>
                  <button @click="paymentFile = null" class="p-1.5 text-red-500 hover:bg-red-50 rounded-lg flex-shrink-0">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
              <div>
                <label class="pay-label">Комментарий</label>
                <textarea v-model="paymentForm.comment" rows="2" placeholder="Необязательно" class="pay-input"></textarea>
              </div>
            </div>

            <div class="flex justify-end gap-3 mt-6 pt-5 border-t border-[#e2e8f0]">
              <button @click="closePayment" class="px-5 py-2.5 border border-[#e2e8f0] rounded-lg text-[#64748b] hover:bg-[#f8fafc] text-sm transition-colors">Отмена</button>
              <button @click="submitPaymentConfirmation" :disabled="!canSubmitPayment" class="px-6 py-2.5 bg-[#10b981] text-white rounded-lg font-medium text-sm hover:bg-[#059669] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                Отправить на проверку
              </button>
            </div>
          </div>

          <!-- Method: QR -->
          <div v-else-if="paymentMethod === 'qr'" class="pay-body text-center">
            <div class="bg-[#f8fafc] rounded-xl p-6 inline-block mx-auto">
              <div class="w-48 h-48 bg-white rounded-lg border border-[#e2e8f0] flex items-center justify-center mx-auto mb-4">
                <p class="text-xs text-[#94a3b8] px-4">QR-код для оплаты будет сгенерирован при подключении платёжной системы</p>
              </div>
              <p class="text-sm text-[#64748b]">Отсканируйте QR-код в мобильном банке</p>
            </div>
            <p class="text-xs text-[#94a3b8] mt-4">Функция будет доступна после интеграции с платёжной системой</p>
          </div>
        </div>
      </div>
    </Teleport>
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
.btn-pdf,
.btn-print {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  color: #fff;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-pdf {
  background: #DC2626;
}
.btn-pdf:hover {
  background: #B91C1C;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
}

.btn-excel {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #059669;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn-excel:hover {
  background: #047857;
  box-shadow: 0 3px 10px rgba(5,150,105,0.3);
}

.btn-print {
  background: #2563EB;
}
.btn-print:hover {
  background: #1D4ED8;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

/* Графа 13 styles */
.g13-container {
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 14px;
  padding: 20px;
}
.g13-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}
.g13-title {
  font-size: 14px;
  font-weight: 600;
  color: #475569;
}
.g13-tooltip-wrap {
  position: relative;
}
.g13-tooltip-wrap:hover .g13-tooltip {
  opacity: 1;
  visibility: visible;
}
.g13-tooltip {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: calc(100% + 8px);
  width: 320px;
  padding: 10px 14px;
  background: #1e293b;
  color: #f1f5f9;
  font-size: 12px;
  line-height: 1.5;
  border-radius: 8px;
  opacity: 0;
  visibility: hidden;
  transition: all 0.15s;
  z-index: 50;
  pointer-events: none;
}
.g13-cards {
  display: flex;
  gap: 16px;
}
@media (max-width: 768px) {
  .g13-cards { flex-direction: column; }
}
.g13-card {
  flex: 1;
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 10px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.g13-card--diff {
  border-left-width: 3px;
}
.g13-card--debt {
  border-left-color: #EF4444;
  background: #FEF2F2;
}
.g13-card--overpay {
  border-left-color: #059669;
  background: #F0FDF4;
}
.g13-card--zero {
  border-left-color: #64748B;
  background: #F8FAFC;
}
.g13-card__label {
  font-size: 12px;
  color: #94A3B8;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}
.g13-card__value {
  font-size: 20px;
  font-weight: 700;
  color: #1E293B;
}
.g13-card__value--green { color: #059669; }
.g13-card__value--red { color: #EF4444; }
.g13-card__value--gray { color: #64748B; }
.g13-card__sub {
  font-size: 11px;
  color: #94A3B8;
}

/* Edit mode inputs */
.edit-input {
  width: 100%;
  min-width: 80px;
  padding: 6px 8px;
  border: 1px solid #CBD5E1;
  border-radius: 6px;
  font-size: 13px;
  background: #fff;
  color: #1e293b;
  transition: border-color 0.15s;
}
.edit-input:focus {
  outline: none;
  border-color: #3B82F6;
  box-shadow: 0 0 0 2px rgba(59,130,246,0.15);
}
.edit-select {
  width: 100%;
  min-width: 160px;
  padding: 5px 8px;
  border: 1px solid #CBD5E1;
  border-radius: 6px;
  font-size: 12px;
  background: #fff;
  color: #1e293b;
  transition: border-color 0.15s;
}
.edit-select:focus {
  outline: none;
  border-color: #3B82F6;
  box-shadow: 0 0 0 2px rgba(59,130,246,0.15);
}
/* Hide number input spinners */
.edit-input[type="number"]::-webkit-inner-spin-button,
.edit-input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.edit-input[type="number"] {
  -moz-appearance: textfield;
}

/* Document upload */
.doc-dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 28px 16px;
  border: 2px dashed #CBD5E1;
  border-radius: 12px;
  background: #F8FAFC;
  transition: all 0.15s;
  cursor: pointer;
}
.doc-dropzone--active {
  border-color: #3B82F6;
  background: #EFF6FF;
}
.doc-dropzone__btn {
  margin-top: 8px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
  background: #3B82F6;
  color: #fff;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}
.doc-dropzone__btn:hover {
  background: #2563EB;
}

.doc-file-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
}
.doc-file-row--readonly {
  background: #fff;
}
.doc-file-row__icon {
  flex-shrink: 0;
  color: #64748b;
}
.doc-file-row__name {
  flex: 1;
  font-size: 13px;
  font-weight: 500;
  color: #1e293b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}
.doc-file-row__type {
  flex-shrink: 0;
  padding: 4px 8px;
  border: 1px solid #CBD5E1;
  border-radius: 6px;
  font-size: 12px;
  background: #fff;
  color: #475569;
}
.doc-file-row__type-badge {
  flex-shrink: 0;
  padding: 3px 10px;
  background: #E2E8F0;
  border-radius: 6px;
  font-size: 12px;
  color: #475569;
  font-weight: 500;
}
.doc-file-row__size {
  flex-shrink: 0;
  font-size: 12px;
  color: #94a3b8;
  min-width: 50px;
  text-align: right;
}
.doc-file-row__delete {
  flex-shrink: 0;
  color: #EF4444;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.15s;
}
.doc-file-row__delete:hover {
  background: #FEE2E2;
}
.doc-file-row__download {
  flex-shrink: 0;
  color: #3B82F6;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.15s;
}
.doc-file-row__download:hover {
  background: #EFF6FF;
}

/* Status blocks */
.status-block {
  border-radius: 16px;
  padding: 24px;
  border: 1px solid;
}
.status-block--yellow {
  background: #FFFBEB;
  border-color: #FDE68A;
}
.status-block--green {
  background: #F0FDF4;
  border-color: #BBF7D0;
}
.status-block--orange {
  background: #FFF7ED;
  border-color: #FED7AA;
}
.status-block__icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.status-block__icon--yellow {
  background: #FEF3C7;
  color: #D97706;
}
.status-block__icon--green {
  background: #DCFCE7;
  color: #16A34A;
}
.status-block__icon--orange {
  background: #FFEDD5;
  color: #EA580C;
}

/* Payment modal */
.pay-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}
.pay-modal {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 640px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px rgba(0,0,0,0.15);
}
.pay-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #E2E8F0;
}
.pay-modal__close {
  color: #94A3B8;
  padding: 4px;
  border-radius: 8px;
  transition: all 0.15s;
}
.pay-modal__close:hover {
  background: #F1F5F9;
  color: #475569;
}
.pay-modal__amount {
  padding: 16px 24px;
  background: #F8FAFC;
  font-size: 15px;
  color: #475569;
  border-bottom: 1px solid #E2E8F0;
}
.pay-tabs {
  display: flex;
  gap: 4px;
  padding: 12px 24px;
  border-bottom: 1px solid #E2E8F0;
  background: #F8FAFC;
}
.pay-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #64748B;
  background: transparent;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.15s;
}
.pay-tab:hover {
  background: #fff;
  color: #1E293B;
}
.pay-tab--active {
  background: #fff;
  color: #1E293B;
  border-color: #E2E8F0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}
.pay-tab--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.pay-body {
  padding: 24px;
}
.pay-requisites {
  background: #F0F9FF;
  border: 1px solid #BAE6FD;
  border-radius: 10px;
  padding: 16px;
}
.pay-req-table {
  width: 100%;
  font-size: 13px;
}
.pay-req-table td {
  padding: 4px 0;
  vertical-align: top;
}
.pay-req-table td:first-child {
  color: #64748B;
  width: 120px;
  padding-right: 12px;
}
.pay-req-table td:last-child {
  color: #1E293B;
  font-weight: 500;
}
.pay-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #1E293B;
  margin-bottom: 6px;
}
.pay-input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #E2E8F0;
  border-radius: 10px;
  font-size: 14px;
  color: #1E293B;
  transition: all 0.15s;
}
.pay-input:focus {
  outline: none;
  border-color: #F59E0B;
  box-shadow: 0 0 0 3px rgba(245,158,11,0.12);
}
.pay-input--error {
  border-color: #EF4444;
}
.pay-input--error:focus {
  border-color: #EF4444;
  box-shadow: 0 0 0 3px rgba(239,68,68,0.12);
}
.pay-dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 24px 16px;
  border: 2px dashed #CBD5E1;
  border-radius: 10px;
  background: #F8FAFC;
  transition: all 0.15s;
  cursor: pointer;
}
.pay-dropzone--active {
  border-color: #F59E0B;
  background: #FFFBEB;
}
.pay-dropzone__btn {
  margin-top: 6px;
  display: inline-flex;
  padding: 7px 16px;
  background: #3B82F6;
  color: #fff;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}
.pay-dropzone__btn:hover {
  background: #2563EB;
}
.pay-file-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 10px;
}
</style>
