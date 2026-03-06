<script setup lang="ts">
import { computed, ref, watch, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import { useCalculationStore } from '../../stores/calculations'
import type { ProductItem, AttachedDocument, DocumentType, PaymentData } from '@/types/calculation'
import { getDocumentTypeLabel } from '@/types/calculation'
import Select from '@/components/ui/general/Select.vue'
import type { SelectOption } from '@/types/select'
import ProductGroupSelector from '../../components/ProductGroupSelector.vue'
import type { ProductSubgroup } from '../../data/product-groups'

const documentTypes: DocumentType[] = ['gtd', 'act', 'invoice_goods', 'invoice', 'contract', 'other']

const groupOptions = computed<SelectOption[]>(() =>
  productGroups.map(g => ({ value: g.value, label: g.label }))
)

const getSubgroupOptions = (groupValue: string): SelectOption[] => {
  const subs = productSubgroups[groupValue] || []
  return subs.map(s => ({ value: s.value, label: s.label }))
}

const docTypeOptions = computed<SelectOption[]>(() =>
  documentTypes.map(dt => ({ value: dt, label: getDocumentTypeLabel(dt) }))
)
import { useAccountStore } from '../../stores/account'
import { productGroups, productSubgroups, getSubgroupLabel, getSubgroupData } from '../../data/product-groups'
import TnvedCode from '../../components/TnvedCode.vue'
import { calculatePaymentDeadline, getRemainingDays, formatDateShort } from '../../utils/dateUtils'
import { generateCalculationExcel } from '../../utils/excelExport'
import { downloadElementAsPdf } from '../../utils/pdfExport'
import { useBusinessMenu } from '../../composables/useRoleMenu'
import { toastStore } from '../../stores/toast'
import ConfirmDialog from '../../components/common/ConfirmDialog.vue'
import { AppButton, AppCard, AppInput, AppAlert, AppTooltip } from '../../components/ui'
import CalculationTimeline from '../../components/CalculationTimeline.vue'
import { CalcStatus, statusI18nKey } from '../../constants/statuses'
import { getStatusBadgeVariant } from '../../utils/statusVariant'
import PenaltyInfo from '../../components/PenaltyInfo.vue'
import AuditLog from '../../components/AuditLog.vue'
import { getOverdueDays } from '../../utils/penalty'
import { formatNum } from '../../utils/formatNumber'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const { roleTitle, menuItems } = useBusinessMenu()
const account = useAccountStore()
const calcStore = useCalculationStore()

const calcId = computed(() => Number(route.params.id))
const calc = computed(() => calcStore.currentCalculation)

// ---- Inline editing state ----
const isEditing = ref(false)
const editItems = ref<ProductItem[]>([])
let editNextItemId = 100
const editDocuments = ref<AttachedDocument[]>([])
let docNextId = 100
const documentsChanged = ref(false)

function startEditing() {
  if (!calc.value) return
  editItems.value = calc.value.items.map(i => ({ ...i }))
  editNextItemId = Math.max(...editItems.value.map(i => i.id), 0) + 1
  editDocuments.value = calc.value.documents ? calc.value.documents.map(d => ({ ...d })) : []
  docNextId = Math.max(...editDocuments.value.map(d => d.id), 0) + 1
  documentsChanged.value = false
  isEditing.value = true
}

function cancelEditing() {
  isEditing.value = false
  editItems.value = []
  editDocuments.value = []
  documentsChanged.value = false
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

function onEditGroupChange(item: ProductItem, value: string) {
  item.group = value
  item.subgroup = ''
  item.tnvedCode = ''
  item.gskpCode = ''
  const group = productGroups.find(g => g.value === value)
  if (!group) return
  item.recyclingStandard = group.recyclingStandard
  item.rate = group.baseRate
  recalcItem(item)
}

function onEditSubgroupChange(item: ProductItem, value: string) {
  item.subgroup = value
}

function onEditSubgroupSelected(item: ProductItem, data: ProductSubgroup | null) {
  if (!data) return
  item.tnvedCode = data.tnvedCode || data.code || ''
  item.gskpCode = data.gskpCode || ''
  const group = productGroups.find(g => g.value === item.group)
  if (group) {
    item.rate = Math.round(group.baseRate * data.rateMultiplier)
  }
  recalcItem(item)
}

const editTotalAmount = computed(() => editItems.value.reduce((s, i) => s + i.amount, 0))

async function saveAsDraft() {
  if (!calc.value) return
  await calcStore.updateCalculation(calc.value.id, {
    items: editItems.value.map(i => ({ ...i })),
    totalAmount: editTotalAmount.value,
    documents: editDocuments.value,
    documentsChanged: documentsChanged.value,
  })
  isEditing.value = false
  if (route.query.edit) router.replace({ path: route.path, query: { from: route.query.from } })
}

async function saveAndSubmit() {
  if (!calc.value) return
  await calcStore.updateCalculation(calc.value.id, {
    items: editItems.value.map(i => ({ ...i })),
    totalAmount: editTotalAmount.value,
    documents: editDocuments.value,
    documentsChanged: documentsChanged.value,
  })
  calcStore.submitForReview(calc.value.id)
  isEditing.value = false
  if (route.query.edit) router.replace({ path: route.path, query: { from: route.query.from } })
}

// ---- Document upload state ----
const dragOver = ref(false)
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
const MAX_FILE_SIZE = 10 * 1024 * 1024

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' ' + t('calcDetail.sizeB')
  if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' ' + t('calcDetail.sizeKB')
  return (bytes / (1024 * 1024)).toFixed(1) + ' ' + t('calcDetail.sizeMB')
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
    toastStore.show({ type: 'error', title: t('calcDetail.maxFiles') })
    return
  }
  Array.from(files).forEach(file => {
    if (file.size > MAX_FILE_SIZE) {
      toastStore.show({ type: 'error', title: t('calcDetail.fileTooBig', { name: file.name }) })
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
        file,
      })
      documentsChanged.value = true
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
  documentsChanged.value = true
}

function changeDocType(doc: AttachedDocument, type: DocumentType) {
  doc.docType = type
}

onMounted(async () => {
  await account.fetchAll()
  await calcStore.fetchById(calcId.value)
  if (route.query.edit === 'true' && calc.value && (calc.value.status === CalcStatus.DRAFT || calc.value.status === CalcStatus.REJECTED || calc.value.status === CalcStatus.REVISION)) {
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
  const variant = getStatusBadgeVariant(status)
  return `badge badge-${variant}`
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
  if (s !== CalcStatus.DRAFT) d.submitted = calc.value.date
  if ([CalcStatus.UNDER_REVIEW, CalcStatus.APPROVED, CalcStatus.REJECTED, CalcStatus.PAYMENT_PENDING, CalcStatus.PAID, CalcStatus.PAYMENT_REJECTED].includes(s as any)) d.reviewed = calc.value.date
  if ([CalcStatus.APPROVED, CalcStatus.PAYMENT_PENDING, CalcStatus.PAID, CalcStatus.PAYMENT_REJECTED].includes(s as any)) { d.approved = calc.value.date; d.invoiced = calc.value.date }
  if (s === CalcStatus.PAID) d.paid = calc.value.paidAt || calc.value.date
  if (s === CalcStatus.REJECTED) d.rejected = calc.value.rejectedAt || calc.value.date
  return d
})

const payerTypeLabel = computed(() => {
  if (!calc.value) return ''
  return calc.value.payerType === 'importer' ? t('calcDetail.importer') : t('calcDetail.producer')
})

const periodLabel = computed(() => {
  if (!calc.value) return ''
  if (calc.value.payerType === 'importer' && calc.value.importDate) {
    return `${t('calcDetail.importLabel')}: ${calc.value.importDate}`
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
  return account.getReconciliationForCalculation(calc.value.id)
})

const isOverdue = computed(() => {
  if (!computedDueDate.value || !deadlineStatus.value) return false
  return deadlineStatus.value.overdue
})

const unpaidAmount = computed(() => {
  if (!calc.value) return 0
  return Math.max(0, reconciliation.value.difference)
})

const canEdit = computed(() => calc.value && (calc.value.status === CalcStatus.DRAFT || calc.value.status === CalcStatus.REJECTED || calc.value.status === CalcStatus.REVISION))

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

const showDeleteConfirm = ref(false)

const confirmDelete = async () => {
  if (!calc.value) return
  showDeleteConfirm.value = false
  await calcStore.deleteCalculation(calc.value.id)
  goBack()
}

const parentCalc = computed(() => {
  if (!calc.value?.parentId) return null
  return calcStore.getCalculationById(calc.value.parentId)
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

function goToPaymentPage() {
  if (!calc.value) return
  router.push(`/business/calculations/${calc.value.id}/payment`)
}

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
    paymentAmountError.value = t('calcDetail.amountMismatch', { amount: calc.value.totalAmount.toLocaleString() })
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
    toastStore.show({ type: 'warning', title: t('calcDetail.invalidFormat'), description: t('calcDetail.allowedFormats') })
    return
  }
  if (file.size > 10 * 1024 * 1024) {
    toastStore.show({ type: 'warning', title: t('calcDetail.fileTooLarge'), description: t('calcDetail.maxFileSize') })
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
  calcStore.submitPayment(calc.value.id, payment)
  closePayment()
  toastStore.show({ type: 'success', title: t('calcDetail.paymentDocSent'), description: t('calcDetail.paymentDocSentDesc') })
}
</script>

<template>
  <DashboardLayout
    role="business"
    :roleTitle="roleTitle"
    :userName="account.myAccount?.company || ''"
    :menuItems="menuItems"
  >
    <!-- Not found -->
    <div v-if="!calc" class="text-center py-20">
      <div class="w-20 h-20 mx-auto mb-6 rounded-full cdv-bg-muted flex items-center justify-center">
        <svg class="w-10 h-10 cdv-text-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 class="cdv-heading-22 font-bold mb-2">{{ $t('calcDetail.notFound') }}</h2>
      <p class="cdv-text-18 cdv-text-muted mb-6">{{ $t('calcDetail.notFoundDesc') }}</p>
      <AppButton variant="back" @click="goBack">
        {{ $t('common.back') }}
      </AppButton>
    </div>

    <template v-else>
      <div ref="printAreaRef">
      <!-- Header -->
      <div class="mb-6">
        <AppButton variant="back" class="mb-4 no-print" @click="goBack">
          {{ $t('common.back') }}
        </AppButton>
        <div class="flex flex-col sm:flex-row sm:items-center gap-3">
          <h1 class="cdv-page-title font-mono">{{ calc.number }}</h1>
          <span :class="getStatusClass(calc.status)" class="cdv-text-16">{{ $t(statusI18nKey[calc.status] || calc.status) }}</span>
          <span class="cdv-text-muted cdv-text-16">{{ $t('calcDetail.fromDate') }} {{ calc.date }}</span>
        </div>
      </div>

      <!-- Revision Banner -->
      <div v-if="calc.status === 'revision' && calc.revisionComment" class="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <div class="w-8 h-8 bg-amber-400 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <div>
          <p class="cdv-text-16 font-semibold text-amber-900">{{ $t('workflow.revisionBanner') }}</p>
          <p class="cdv-text-16 text-amber-800 mt-1">{{ calc.revisionComment }}</p>
          <button @click="startEditing" class="mt-2 cdv-text-16 font-medium text-amber-700 hover:text-amber-900 underline">
            {{ $t('calcDetail.editCalc') }}
          </button>
        </div>
      </div>

      <!-- Payer Data -->
      <div class="cdv-card">
        <h2 class="cdv-section-title mb-5 flex items-center gap-2">
          <svg class="w-5 h-5 cdv-text-amber" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          {{ $t('calcDetail.payerData') }}
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
          <div>
            <p class="cdv-label mb-1">{{ $t('calcDetail.payerType') }}</p>
            <p class="cdv-value">{{ payerTypeLabel }}</p>
          </div>
          <div>
            <p class="cdv-label mb-1">{{ $t('common.name') }}</p>
            <p class="cdv-value">{{ calc.company }}</p>
          </div>
          <div>
            <p class="cdv-label mb-1">{{ $t('calcDetail.inn') }}</p>
            <p class="cdv-value font-mono">{{ calc.inn }}</p>
          </div>
          <div>
            <p class="cdv-label mb-1">{{ $t('calcDetail.address') }}</p>
            <p class="cdv-value">{{ calc.address || '—' }}</p>
          </div>
          <div>
            <p class="cdv-label mb-1">{{ calc.payerType === 'importer' ? $t('calcDetail.importDate') : $t('calcDetail.calcPeriod') }}</p>
            <p class="cdv-value">{{ periodLabel }}</p>
          </div>
          <div>
            <p class="cdv-label mb-1">{{ $t('calcDetail.paymentDeadline') }}</p>
            <p class="cdv-text-18 font-medium" :style="{ color: deadlineStatus && (deadlineStatus.overdue || deadlineStatus.days <= 5) ? '#DC2626' : '#f59e0b' }">
              {{ dueDateFormatted }}
            </p>
            <p v-if="deadlineStatus" class="cdv-text-14 mt-0.5" :style="{ color: deadlineStatus.overdue ? '#DC2626' : '#94a3b8' }">
              <template v-if="deadlineStatus.overdue">{{ $t('calcDetail.overdueDays', { days: deadlineStatus.days }) }}</template>
              <template v-else>{{ $t('calcDetail.remainingDays', { days: deadlineStatus.days }) }}</template>
            </p>
          </div>
        </div>
      </div>

      <!-- Timeline -->
      <CalculationTimeline :status="calc.status" :dates="timelineDates" />

      <!-- Audit Log (payer view) -->
      <AuditLog v-if="calc.history && calc.history.length > 0" :entries="calc.history" viewerRole="payer" :compact="true" class="mb-6" />

      <!-- Products Table -->
      <div class="cdv-card cdv-card--flush" :class="{ 'ring-2 ring-blue-300': isEditing }">
        <div class="px-6 py-4 cdv-border-bottom flex items-center justify-between">
          <h2 class="cdv-section-title">{{ $t('calcDetail.productsAndPackaging') }}</h2>
          <span v-if="isEditing" class="cdv-text-14 font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{{ $t('calcDetail.editMode') }}</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full cdv-text-16">
            <thead class="cdv-bg-light">
              <tr class="text-left cdv-th-text uppercase">
                <th class="px-5 py-3 font-semibold">{{ $t('calcDetail.colGroupSubgroup') }}</th>
                <th class="px-5 py-3 font-semibold text-right">{{ $t('calcDetail.colVolume') }}</th>
                <th class="px-5 py-3 font-semibold text-right">{{ $t('calcDetail.colStandard') }}</th>
                <th class="px-5 py-3 font-semibold text-right">{{ $t('calcDetail.colToRecycle') }}</th>
                <th class="px-5 py-3 font-semibold text-right">{{ $t('calcDetail.colTransferred') }}</th>
                <th class="px-5 py-3 font-semibold text-right">{{ $t('calcDetail.colExported') }}</th>
                <th class="px-5 py-3 font-semibold text-right">{{ $t('calcDetail.colTaxable') }}</th>
                <th class="px-5 py-3 font-semibold text-right">{{ $t('calcDetail.colRate') }}</th>
                <th class="px-5 py-3 font-semibold text-right">{{ $t('calcDetail.colAmount') }}</th>
                <th v-if="isEditing" class="px-3 py-3 font-semibold w-10"></th>
              </tr>
            </thead>
            <tbody class="cdv-tbody-divide">
              <tr
                v-for="(item, index) in displayItems"
                :key="item.id"
                :class="index % 2 === 1 ? 'cdv-row-alt' : ''"
              >
                <!-- Group/Subgroup -->
                <td class="px-5 py-3 cdv-text-dark font-medium" :style="isEditing ? 'min-width: 340px' : ''">
                  <template v-if="isEditing">
                    <ProductGroupSelector
                      :group="item.group"
                      :subgroup="item.subgroup"
                      :showLabels="false"
                      :compact="true"
                      @update:group="(v: string) => onEditGroupChange(item, v)"
                      @update:subgroup="(v: string) => onEditSubgroupChange(item, v)"
                      @subgroup-selected="(data: ProductSubgroup | null) => onEditSubgroupSelected(item, data)"
                      accent-color="#3b82f6"
                    />
                  </template>
                  <template v-else>
                    {{ getGroupLabel(item.group) }}
                    <span v-if="item.subgroup" class="block cdv-text-14 cdv-text-muted">{{ getSubgroupLabel(item.group, item.subgroup) }}</span>
                    <span v-if="item.gskpCode" class="block cdv-text-14 cdv-text-light font-mono">{{ item.gskpCode }}</span>
                    <span v-if="item.tnvedCode" class="block cdv-text-14 cdv-text-light font-mono mt-0.5">{{ $t('calcDetail.tnved') }} <TnvedCode :code="item.tnvedCode" /></span>
                    <div v-if="item.documents && item.documents.length > 0" class="item-docs mt-2">
                      <a
                        v-for="doc in item.documents"
                        :key="doc.id"
                        :href="doc.url"
                        target="_blank"
                        class="item-docs__link"
                      >
                        <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/></svg>
                        <span class="truncate">{{ doc.name }}</span>
                      </a>
                    </div>
                  </template>
                </td>
                <!-- Volume -->
                <td class="px-5 py-3 text-right font-medium cdv-text-dark">
                  <AppInput v-if="isEditing" type="number" step="0.01" min="0" v-model="item.volume" @update:modelValue="recalcItem(item)" size="sm" hideLabel class="text-right" />
                  <template v-else>{{ formatNum(item.volume) }}</template>
                </td>
                <!-- Standard -->
                <td class="px-5 py-3 text-right cdv-text-muted">{{ item.recyclingStandard ?? '—' }}%</td>
                <!-- VolumeToRecycle -->
                <td class="px-5 py-3 text-right cdv-text-muted">{{ item.volumeToRecycle != null ? formatNum(item.volumeToRecycle) : '—' }}</td>
                <!-- Transferred -->
                <td class="px-5 py-3 text-right cdv-text-green">
                  <AppInput v-if="isEditing" type="number" step="0.01" min="0" v-model="item.transferredToRecycling" @update:modelValue="recalcItem(item)" size="sm" hideLabel class="text-right" />
                  <template v-else>{{ formatNum(item.transferredToRecycling || '0') }}</template>
                </td>
                <!-- Exported -->
                <td class="px-5 py-3 text-right cdv-text-blue">
                  <AppInput v-if="isEditing" type="number" step="0.01" min="0" v-model="item.exportedFromKR" @update:modelValue="recalcItem(item)" size="sm" hideLabel class="text-right" />
                  <template v-else>{{ formatNum(item.exportedFromKR || '0') }}</template>
                </td>
                <!-- Taxable -->
                <td class="px-5 py-3 text-right cdv-text-dark">{{ item.taxableVolume != null ? formatNum(item.taxableVolume) : '—' }}</td>
                <!-- Rate -->
                <td class="px-5 py-3 text-right cdv-text-muted">{{ formatNum(item.rate, 0) }}</td>
                <!-- Amount -->
                <td class="px-5 py-3 text-right font-bold cdv-text-amber">{{ formatNum(item.amount, 0) }}</td>
                <!-- Remove -->
                <td v-if="isEditing" class="px-3 py-3 text-center">
                  <AppButton v-if="editItems.length > 1" variant="icon-danger" size="sm" @click="removeRow(index)" :title="$t('calcDetail.deleteRow')">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                  </AppButton>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- Add row button -->
        <div v-if="isEditing" class="px-6 py-3 cdv-border-top cdv-bg-light">
          <AppButton variant="ghost" color="#2563eb" @click="addRow">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            {{ $t('common.addRow') }}
          </AppButton>
        </div>
      </div>

      <!-- Documents: Edit mode upload -->
      <AppCard v-if="isEditing" radius="sm" class="mb-6">
        <div class="flex items-center gap-3 mb-2">
          <div class="doc-section-icon">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/></svg>
          </div>
          <div>
            <h2 class="doc-section-title">{{ $t('calcDetail.supportingDocs') }}</h2>
            <p class="doc-section-subtitle">{{ $t('calcDetail.supportingDocsHint') }}</p>
          </div>
          <span v-if="editDocuments.length > 0" class="doc-section-count">{{ editDocuments.length }}</span>
        </div>

        <!-- Uploaded file list (shown ABOVE dropzone so user sees them immediately) -->
        <div v-if="editDocuments.length > 0" class="mb-4 space-y-2">
          <div v-for="doc in editDocuments" :key="doc.id" class="doc-file-row" :class="{ 'doc-file-row--new': doc.file }">
            <div class="doc-file-row__icon" :class="{ 'doc-file-row__icon--new': doc.file }">
              <svg v-if="doc.fileType.startsWith('image/')" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            </div>
            <div class="doc-file-row__info">
              <div class="doc-file-row__name">{{ doc.fileName }}</div>
              <div class="doc-file-row__meta">
                <span class="doc-file-row__size">{{ formatFileSize(doc.fileSize) }}</span>
                <span v-if="doc.file" class="doc-file-row__new-badge">NEW</span>
              </div>
            </div>
            <Select :modelValue="doc.docType" :options="docTypeOptions" variant="compact" @change="(v: string | number | null) => changeDocType(doc, v as DocumentType)" />
            <AppButton variant="icon-danger" size="sm" @click="removeDocument(doc.id)" :title="$t('common.delete')">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </AppButton>
          </div>
        </div>

        <!-- Drop zone -->
        <div
          class="doc-dropzone"
          :class="{ 'doc-dropzone--active': dragOver }"
          @dragover.prevent="dragOver = true"
          @dragleave.prevent="dragOver = false"
          @drop.prevent="handleFileDrop"
        >
          <svg class="w-12 h-12 text-blue-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
          <span class="text-[17px] font-medium text-slate-600">{{ $t('calcDetail.dropFilesHere') }}</span>
          <span class="text-[15px] text-slate-400">{{ $t('calcDetail.dropFilesFormats') }}</span>
          <label class="doc-dropzone__btn">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            {{ $t('calcDetail.chooseFiles') }}
            <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" class="hidden" @change="handleFileSelect" />
          </label>
        </div>
      </AppCard>

      <!-- Documents: View mode (read-only) -->
      <AppCard v-if="!isEditing && calc.documents && calc.documents.length > 0" radius="sm" class="mb-6">
        <h2 class="cdv-section-title mb-4 flex items-center gap-2">
          <svg class="w-5 h-5 cdv-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/></svg>
          {{ $t('calcDetail.supportingDocs') }} ({{ calc.documents.length }})
        </h2>
        <div class="space-y-2">
          <div v-for="doc in calc.documents" :key="doc.id" class="doc-file-row doc-file-row--readonly">
            <div class="doc-file-row__icon">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            </div>
            <div class="doc-file-row__name">{{ doc.fileName }}</div>
            <span class="doc-file-row__type-badge">{{ getDocumentTypeLabel(doc.docType) }}</span>
            <span class="doc-file-row__size">{{ formatFileSize(doc.fileSize) }}</span>
            <a v-if="doc.dataUrl" :href="doc.dataUrl" :download="doc.fileName" class="doc-file-row__download" :title="$t('common.download')">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            </a>
          </div>
        </div>
      </AppCard>

      <!-- Totals -->
      <div class="cdv-totals-section mb-6">
        <h2 class="cdv-section-title mb-5">{{ $t('calcDetail.calcTotals') }}</h2>
        <div class="cdv-totals-grid">
          <div class="cdv-stat cdv-stat--slate">
            <div class="cdv-stat__icon">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
            </div>
            <p class="cdv-stat__label">{{ $t('calcDetail.totalVolumeGr5') }}</p>
            <p class="cdv-stat__value">{{ totalVolume }} <span>{{ $t('calcDetail.tons') }}</span></p>
          </div>
          <div class="cdv-stat cdv-stat--emerald">
            <div class="cdv-stat__icon">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <p class="cdv-stat__label">{{ $t('calcDetail.transferredGr8') }}</p>
            <p class="cdv-stat__value">{{ totalTransferred }} <span>{{ $t('calcDetail.tons') }}</span></p>
          </div>
          <div class="cdv-stat cdv-stat--blue">
            <div class="cdv-stat__icon">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
            </div>
            <p class="cdv-stat__label">{{ $t('calcDetail.exportedGr9') }}</p>
            <p class="cdv-stat__value">{{ totalExported }} <span>{{ $t('calcDetail.tons') }}</span></p>
          </div>
          <div class="cdv-stat cdv-stat--indigo">
            <div class="cdv-stat__icon">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
            </div>
            <p class="cdv-stat__label">{{ $t('calcDetail.taxableGr10') }}</p>
            <p class="cdv-stat__value">{{ totalTaxableVolume }} <span>{{ $t('calcDetail.tons') }}</span></p>
          </div>
          <div class="cdv-stat cdv-stat--amber cdv-stat--main">
            <div class="cdv-stat__icon">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <p class="cdv-stat__label">{{ $t('calcDetail.totalPayableGr12') }}</p>
            <p class="cdv-stat__value">{{ displayTotalAmount.toLocaleString() }} <span>{{ $t('calcDetail.som') }}</span></p>
          </div>
        </div>
      </div>

      <!-- Графа 13: Сверка платежей -->
      <div class="g13-container mb-6">
        <div class="g13-header">
          <h3 class="g13-title">{{ $t('calcDetail.g13Title') }}</h3>
          <AppTooltip :text="$t('calcDetail.g13Tooltip')">
            <svg class="w-4 h-4 cdv-text-light cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </AppTooltip>
        </div>
        <div class="g13-cards">
          <div class="g13-card">
            <span class="g13-card__label">{{ $t('calcDetail.chargedForPeriod') }}</span>
            <span class="g13-card__value">{{ reconciliation.charged.toLocaleString() }} {{ $t('calcDetail.som') }}</span>
            <span class="g13-card__sub">{{ $t('calcDetail.fromPersonalAccount') }}</span>
          </div>
          <div class="g13-card">
            <span class="g13-card__label">{{ $t('calcDetail.paidForPeriod') }}</span>
            <span class="g13-card__value g13-card__value--green">{{ reconciliation.paid.toLocaleString() }} {{ $t('calcDetail.som') }}</span>
            <span class="g13-card__sub">{{ $t('calcDetail.fromPersonalAccount') }}</span>
          </div>
          <div :class="['g13-card g13-card--diff', reconciliation.difference > 0 ? 'g13-card--debt' : reconciliation.difference < 0 ? 'g13-card--overpay' : 'g13-card--zero']">
            <span class="g13-card__label">{{ $t('calcDetail.differenceLabel') }}</span>
            <span class="g13-card__value" :class="{ 'g13-card__value--red': reconciliation.difference > 0, 'g13-card__value--green': reconciliation.difference < 0, 'g13-card__value--gray': reconciliation.difference === 0 }">
              <template v-if="reconciliation.difference > 0">{{ $t('calcDetail.arrears') }}: +{{ reconciliation.difference.toLocaleString() }} {{ $t('calcDetail.som') }}</template>
              <template v-else-if="reconciliation.difference < 0">{{ $t('calcDetail.overpayment') }}: {{ Math.abs(reconciliation.difference).toLocaleString() }} {{ $t('calcDetail.som') }}</template>
              <template v-else>{{ $t('calcDetail.noDebt') }}</template>
            </span>
          </div>
        </div>
      </div>

      <AppAlert v-if="parentCalc" variant="warning" :title="$t('calcDetail.repeatCalc', { number: parentCalc.number })" class="mb-6">
        <span v-if="parentCalc.rejectionReason">{{ $t('calcDetail.rejectionReason') }}: {{ parentCalc.rejectionReason }}</span>
      </AppAlert>

      <!-- Rejection Comment -->
      <div v-if="calc.status === 'rejected' && calc.rejectionReason" class="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
        <div class="flex items-start gap-4">
          <div class="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0 cdv-emoji-icon">
            &#x274C;
          </div>
          <div class="flex-1">
            <h3 class="cdv-text-18 font-semibold text-red-800 mb-1">{{ $t('calcDetail.calcRejected') }}</h3>
            <p v-if="calc.rejectedBy || calc.rejectedAt" class="cdv-text-16 text-red-600 mb-2">
              <span v-if="calc.rejectedBy">{{ calc.rejectedBy }}</span>
              <span v-if="calc.rejectedAt"> &middot; {{ calc.rejectedAt }}</span>
            </p>
            <p class="cdv-text-18 text-red-700 mb-4">{{ calc.rejectionReason }}</p>
            <AppButton v-if="!isEditing" variant="warning" @click="startEditing">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              {{ $t('calcDetail.fix') }}
            </AppButton>
          </div>
        </div>
      </div>

      <!-- Payment rejection -->
      <div v-if="calc.status === 'payment_rejected' && calc.paymentRejectionReason" class="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
        <div class="flex items-start gap-4">
          <div class="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0 cdv-emoji-icon">
            &#x274C;
          </div>
          <div class="flex-1">
            <h3 class="cdv-text-18 font-semibold text-red-800 mb-1">{{ $t('calcDetail.paymentRejected') }}</h3>
            <p class="cdv-text-18 text-red-700">{{ calc.paymentRejectionReason }}</p>
            <AppButton variant="warning" class="mt-3" @click="openPayment">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
              {{ $t('calcDetail.confirmPaymentAgain') }}
            </AppButton>
          </div>
        </div>
      </div>

      <!-- Status block: На проверке -->
      <div v-if="calc.status === 'under_review'" class="status-block status-block--yellow mb-6">
        <div class="flex items-start gap-4">
          <div class="status-block__icon status-block__icon--yellow">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <h3 class="cdv-text-18 font-semibold text-amber-800">{{ $t('calcDetail.underReviewTitle') }}</h3>
            <p class="text-amber-700 cdv-text-16 mt-1">{{ $t('calcDetail.underReviewDesc') }}</p>
          </div>
        </div>
      </div>

      <!-- Status block: Принято (with payment) -->
      <div v-if="calc.status === 'approved'" class="status-block status-block--green mb-6">
        <div class="flex items-start gap-4">
          <div class="status-block__icon status-block__icon--green">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
          </div>
          <div class="flex-1">
            <h3 class="cdv-text-18 font-semibold text-green-800">{{ $t('calcDetail.calcApproved') }}</h3>
            <div class="mt-4 flex flex-col sm:flex-row sm:items-center gap-4">
              <div>
                <p class="cdv-text-16 text-green-700">{{ $t('calcDetail.amountToPay') }}</p>
                <p class="cdv-text-24 font-bold text-green-900">{{ calc.totalAmount.toLocaleString() }} {{ $t('calcDetail.som') }}</p>
              </div>
              <div v-if="computedDueDate">
                <p class="cdv-text-16 text-green-700">{{ $t('calcDetail.paymentDeadline') }}</p>
                <p class="cdv-text-18 font-semibold" :class="deadlineStatus && (deadlineStatus.overdue || deadlineStatus.days <= 5) ? 'text-red-600' : 'text-green-900'">
                  {{ dueDateFormatted }}
                  <span v-if="deadlineStatus" class="cdv-text-14 font-normal ml-1">
                    <template v-if="deadlineStatus.overdue">({{ $t('calcDetail.overdueDays', { days: deadlineStatus.days }) }})</template>
                    <template v-else>({{ $t('calcDetail.remainingDays', { days: deadlineStatus.days }) }})</template>
                  </span>
                </p>
              </div>
            </div>
            <div class="mt-4 flex flex-wrap gap-3">
              <AppButton variant="success" @click="openPayment">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                {{ $t('calcDetail.pay') }}
              </AppButton>
              <AppButton variant="outline" @click="mockAction(t('calcDetail.downloadingInvoice'))">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                {{ $t('calcDetail.downloadInvoice') }}
              </AppButton>
            </div>
          </div>
        </div>
      </div>

      <!-- Status block: Оплата на проверке -->
      <div v-if="calc.status === 'payment_pending'" class="status-block status-block--orange mb-6">
        <div class="flex items-start gap-4">
          <div class="status-block__icon status-block__icon--orange">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          </div>
          <div class="flex-1">
            <h3 class="cdv-text-18 font-semibold text-orange-800">{{ $t('calcDetail.paymentConfSent') }}</h3>
            <p class="text-orange-700 cdv-text-16 mt-1">{{ $t('calcDetail.paymentConfSentDesc') }}</p>
            <div v-if="calc.payment" class="mt-3 bg-white/60 rounded-lg p-3 border border-orange-200">
              <p class="cdv-text-16 text-orange-800">
                <span class="font-medium">{{ $t('calcDetail.document') }}:</span> {{ calc.payment.fileName }}
              </p>
              <p v-if="calc.payment.paymentDate" class="cdv-text-16 text-orange-800 mt-1">
                <span class="font-medium">{{ $t('calcDetail.paymentDateLabel') }}:</span> {{ calc.payment.paymentDate }}
              </p>
              <p v-if="calc.payment.paymentOrderNumber" class="cdv-text-16 text-orange-800 mt-1">
                <span class="font-medium">{{ $t('calcDetail.paymentOrder') }}:</span> {{ calc.payment.paymentOrderNumber }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Status block: Оплачено -->
      <div v-if="calc.status === 'paid'" class="status-block status-block--green mb-6">
        <div class="flex items-start gap-4">
          <div class="status-block__icon status-block__icon--green">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
          </div>
          <div>
            <h3 class="cdv-text-18 font-semibold text-green-800">{{ $t('calcDetail.paid') }}</h3>
            <p v-if="calc.paidAt" class="text-green-700 cdv-text-16 mt-1">{{ $t('calcDetail.paymentDateLabel') }}: {{ calc.paidAt }}</p>
          </div>
        </div>
      </div>

      <!-- Penalty block: shown when overdue with unpaid amount -->
      <PenaltyInfo
        v-if="isOverdue && unpaidAmount > 0 && computedDueDate"
        :debtAmount="unpaidAmount"
        :dueDate="computedDueDate"
        class="mb-6"
      />

      <!-- Action Bar -->
      <div class="cdv-action-bar sticky bottom-0 bg-white -mx-4 lg:-mx-8 px-4 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-3">
        <!-- Edit mode buttons -->
        <template v-if="isEditing">
          <AppButton variant="outline" @click="cancelEditing">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            {{ $t('common.cancel') }}
          </AppButton>
          <div class="flex flex-wrap items-center gap-2">
            <AppButton variant="outline" @click="saveAsDraft">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/></svg>
              {{ calc?.status === 'draft' ? $t('common.saveDraft') : $t('common.saveChanges') }}
            </AppButton>
            <AppButton variant="success" @click="saveAndSubmit">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
              {{ calc?.status === 'draft' ? $t('calcDetail.submitForReview') : $t('calcDetail.submitChanges') }}
            </AppButton>
          </div>
        </template>

        <!-- View mode buttons -->
        <template v-else>
          <AppButton variant="back" @click="goBack">
            {{ $t('common.back') }}
          </AppButton>

          <div class="flex flex-wrap items-center gap-2">
            <!-- Draft actions -->
            <template v-if="calc.status === 'draft'">
              <AppButton variant="primary" bg="#f59e0b" @click="startEditing">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                {{ $t('common.edit') }}
              </AppButton>
              <AppButton variant="danger" @click="showDeleteConfirm = true">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                {{ $t('common.delete') }}
              </AppButton>
              <AppButton variant="success" @click="calcStore.submitForReview(calc.id); toastStore.show({ type: 'success', title: t('calcDetail.calcSubmitted') })">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
                {{ $t('calcDetail.submitForReview') }}
              </AppButton>
            </template>

            <!-- under_review actions -->
            <template v-if="calc.status === 'under_review'">
              <AppButton variant="danger" @click="handleDownloadPdf()">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                {{ $t('common.downloadPdf') }}
              </AppButton>
              <AppButton variant="success" @click="downloadExcel">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                {{ $t('common.downloadExcel') }}
              </AppButton>
              <AppButton variant="warning" @click="mockAction(t('calcDetail.recallingCalc'))">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/></svg>
                {{ $t('calcDetail.recallCalc') }}
              </AppButton>
            </template>

            <!-- revision actions -->
            <template v-if="calc.status === 'revision'">
              <AppButton variant="warning" @click="startEditing">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                {{ $t('calcDetail.editCalc') }}
              </AppButton>
            </template>

            <!-- fee_paid / penalty_paid / completed status labels -->
            <template v-if="calc.status === 'fee_paid' || calc.status === 'penalty_paid'">
              <AppButton variant="primary" bg="#2563eb" @click="goToPaymentPage">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
                {{ $t('workflow.goToPayment') }}
              </AppButton>
            </template>

            <!-- approved actions -->
            <template v-if="calc.status === 'approved'">
              <AppButton variant="success" @click="goToPaymentPage">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
                {{ $t('calcDetail.pay') }}
              </AppButton>
              <AppButton variant="danger" @click="handleDownloadPdf()">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                {{ $t('common.downloadPdf') }}
              </AppButton>
              <AppButton variant="success" @click="downloadExcel">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                {{ $t('common.downloadExcel') }}
              </AppButton>
            </template>

            <!-- rejected actions -->
            <template v-if="calc.status === 'rejected'">
              <AppButton variant="warning" @click="startEditing">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                {{ $t('calcDetail.fix') }}
              </AppButton>
            </template>

            <!-- paid / payment_pending -->
            <template v-if="calc.status === 'paid' || calc.status === 'payment_pending'">
              <AppButton variant="danger" @click="handleDownloadPdf()">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                {{ $t('common.downloadPdf') }}
              </AppButton>
              <AppButton variant="success" @click="downloadExcel">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                {{ $t('common.downloadExcel') }}
              </AppButton>
              <AppButton variant="primary" bg="#2563eb" @click="handlePrint()">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                {{ $t('common.print') }}
              </AppButton>
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
            <h2 class="cdv-modal-title">{{ $t('calcDetail.paymentModalTitle', { number: calc?.number }) }}</h2>
            <AppButton variant="icon-only" size="sm" @click="closePayment">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </AppButton>
          </div>

          <div class="pay-modal__amount">
            {{ $t('calcDetail.amountToPay') }}: <strong>{{ calc?.totalAmount.toLocaleString() }} {{ $t('calcDetail.som') }}</strong>
          </div>

          <!-- Method tabs -->
          <div class="pay-tabs">
            <button :class="['pay-tab', paymentMethod === 'transfer' ? 'pay-tab--active' : '']" @click="paymentMethod = 'transfer'">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              {{ $t('calcDetail.bankTransfer') }}
            </button>
            <button :class="['pay-tab', paymentMethod === 'qr' ? 'pay-tab--active' : '']" @click="paymentMethod = 'qr'">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
              {{ $t('calcDetail.qrCode') }}
            </button>
            <button class="pay-tab pay-tab--disabled" disabled>
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
              {{ $t('calcDetail.cardPayment') }}
            </button>
          </div>

          <!-- Method: Bank transfer -->
          <div v-if="paymentMethod === 'transfer'" class="pay-body">
            <div class="pay-requisites">
              <h4 class="cdv-text-16 cdv-text-dark font-semibold mb-3">{{ $t('calcDetail.paymentRequisites') }}</h4>
              <table class="pay-req-table">
                <tr><td>{{ $t('calcDetail.recipient') }}</td><td>{{ $t('calcDetail.ecoOperator') }}</td></tr>
                <tr><td>{{ $t('calcDetail.inn') }}</td><td class="font-mono">01712202610151</td></tr>
                <tr><td>{{ $t('calcDetail.bank') }}</td><td>{{ $t('calcDetail.rskBank') }}</td></tr>
                <tr><td>{{ $t('calcDetail.bik') }}</td><td class="font-mono">017012</td></tr>
                <tr><td>{{ $t('calcDetail.account') }}</td><td class="font-mono">1091620100830049</td></tr>
                <tr><td>{{ $t('calcDetail.purpose') }}</td><td>{{ $t('calcDetail.paymentPurpose', { number: calc?.number }) }}</td></tr>
              </table>
            </div>

            <div class="space-y-4 mt-5">
              <div>
                <AppInput
                  v-model="paymentForm.paymentOrderNumber"
                  :label="$t('calcDetail.paymentOrderNum') + ' *'"
                  :placeholder="$t('calcDetail.paymentOrderPlaceholder')"
                  size="sm"
                />
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <AppInput
                    v-model="paymentForm.paymentDate"
                    type="date"
                    :label="$t('calcDetail.paymentDateLabel') + ' *'"
                    :placeholder="$t('calcDetail.datePlaceholder')"
                    min="2020-01-01"
                    :max="`${new Date().getFullYear() + 1}-12-31`"
                    size="sm"
                  />
                </div>
                <div>
                  <AppInput
                    v-model="paymentForm.payerBank"
                    :label="$t('calcDetail.payerBank') + ' *'"
                    :placeholder="$t('calcDetail.payerBankPlaceholder')"
                    size="sm"
                  />
                </div>
              </div>
              <div>
                <AppInput
                  v-model="paymentForm.transferAmount"
                  type="number"
                  :label="$t('calcDetail.transferAmountLabel') + ' *'"
                  :placeholder="String(calc?.totalAmount || '')"
                  :error="paymentAmountError || ''"
                  @update:modelValue="validatePaymentAmount"
                  size="sm"
                />
              </div>
              <div>
                <label class="pay-label">{{ $t('calcDetail.paymentScanLabel') }} *</label>
                <div
                  v-if="!paymentFile"
                  class="pay-dropzone"
                  :class="{ 'pay-dropzone--active': paymentDragOver }"
                  @dragover.prevent="paymentDragOver = true"
                  @dragleave="paymentDragOver = false"
                  @drop.prevent="handlePaymentFileDrop"
                >
                  <svg class="w-8 h-8 cdv-text-light mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                  <span class="cdv-text-16 cdv-text-muted">{{ $t('calcDetail.dropFileHere') }}</span>
                  <span class="cdv-text-14 cdv-text-light">{{ $t('calcDetail.dropFileFormats') }}</span>
                  <label class="pay-dropzone__btn">
                    {{ $t('calcDetail.chooseFile') }}
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" class="hidden" @change="handlePaymentFileSelect" />
                  </label>
                </div>
                <div v-else class="pay-file-row">
                  <div class="flex items-center gap-3 flex-1 min-w-0">
                    <div class="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <svg class="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <span class="cdv-text-16 cdv-text-dark font-medium truncate">{{ paymentFile.name }}</span>
                  </div>
                  <AppButton variant="icon-danger" size="sm" @click="paymentFile = null">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </AppButton>
                </div>
              </div>
              <div>
                <AppInput
                  v-model="paymentForm.comment"
                  type="textarea"
                  :rows="2"
                  :label="$t('calcDetail.comment')"
                  :placeholder="$t('calcDetail.optional')"
                  size="sm"
                />
              </div>
            </div>

            <div class="flex justify-end gap-3 mt-6 pt-5 cdv-border-top">
              <AppButton variant="outline" @click="closePayment">{{ $t('common.cancel') }}</AppButton>
              <AppButton variant="success" :disabled="!canSubmitPayment" @click="submitPaymentConfirmation">
                {{ $t('calcDetail.submitForReview') }}
              </AppButton>
            </div>
          </div>

          <!-- Method: QR -->
          <div v-else-if="paymentMethod === 'qr'" class="pay-body text-center">
            <div class="cdv-bg-light rounded-xl p-6 inline-block mx-auto">
              <div class="w-48 h-48 bg-white rounded-lg cdv-border flex items-center justify-center mx-auto mb-4">
                <p class="cdv-text-14 cdv-text-light px-4">{{ $t('calcDetail.qrPlaceholder') }}</p>
              </div>
              <p class="cdv-text-16 cdv-text-muted">{{ $t('calcDetail.scanQr') }}</p>
            </div>
            <p class="cdv-text-14 cdv-text-light mt-4">{{ $t('calcDetail.qrAvailableLater') }}</p>
          </div>
        </div>
      </div>
    </Teleport>
    <ConfirmDialog
      :visible="showDeleteConfirm"
      icon="danger"
      confirmColor="red"
      :title="$t('businessCalc.deleteConfirmTitle')"
      :message="$t('businessCalc.deleteConfirmMessage', { number: calc?.number })"
      :confirmText="$t('businessCalc.deleteBtn')"
      @confirm="confirmDelete"
      @cancel="showDeleteConfirm = false"
    />
  </DashboardLayout>
</template>

<style scoped>
.cdv-page-title {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
}
@media (min-width: 1024px) {
  .cdv-page-title { font-size: 34px; }
}
.cdv-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  border: 1px solid #e2e8f0;
  padding: 24px;
  margin-bottom: 24px;
}
.cdv-card--flush {
  padding: 0;
  overflow: hidden;
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
  font-size: 16px;
  font-weight: 600;
  color: #475569;
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
  font-size: 16px;
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
  font-size: 13px;
  color: #94A3B8;
}

/* Edit mode inputs */
.edit-input {
  width: 100%;
  min-width: 80px;
  padding: 6px 8px;
  border: 1px solid #CBD5E1;
  border-radius: 6px;
  font-size: 15px;
  background: #fff;
  color: #1e293b;
  transition: border-color 0.15s;
}
.edit-input:focus {
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
.doc-section-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: #EFF6FF;
  color: #3B82F6;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.doc-section-title {
  font-size: 22px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.3;
}
.doc-section-subtitle {
  font-size: 15px;
  color: #94a3b8;
  margin-top: 2px;
}
.doc-section-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 26px;
  height: 26px;
  padding: 0 8px;
  border-radius: 13px;
  background: #3B82F6;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
  margin-left: auto;
}

.doc-dropzone__btn {
  margin-top: 8px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 24px;
  background: #3B82F6;
  color: #fff;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.doc-dropzone__btn:hover {
  background: #2563EB;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.item-docs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.item-docs__link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  background: #eff6ff;
  color: #2563eb;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
  max-width: 200px;
  transition: background 0.15s;
}
.item-docs__link:hover {
  background: #dbeafe;
}

.doc-file-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 10px;
  transition: all 0.15s;
}
.doc-file-row--new {
  background: #F0FDF4;
  border-color: #BBF7D0;
}
.doc-file-row--readonly {
  background: #fff;
}
.doc-file-row__icon {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: #E2E8F0;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
}
.doc-file-row__icon--new {
  background: #DCFCE7;
  color: #16a34a;
}
.doc-file-row__info {
  flex: 1;
  min-width: 0;
}
.doc-file-row__name {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.doc-file-row__meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 2px;
}
.doc-file-row__new-badge {
  font-size: 11px;
  font-weight: 700;
  color: #16a34a;
  background: #DCFCE7;
  padding: 1px 6px;
  border-radius: 4px;
  letter-spacing: 0.05em;
}
.doc-file-row__type-badge {
  flex-shrink: 0;
  padding: 3px 10px;
  background: #E2E8F0;
  border-radius: 6px;
  font-size: 16px;
  color: #475569;
  font-weight: 500;
}
.doc-file-row__size {
  flex-shrink: 0;
  font-size: 14px;
  color: #94a3b8;
}
.doc-file-row__download {
  flex-shrink: 0;
  color: #3B82F6;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
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
.pay-modal__amount {
  padding: 16px 24px;
  background: #F8FAFC;
  font-size: 17px;
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
  font-size: 15px;
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
  font-size: 15px;
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
  font-size: 15px;
  font-weight: 500;
  color: #1E293B;
  margin-bottom: 6px;
}
.pay-input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #E2E8F0;
  border-radius: 10px;
  font-size: 16px;
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
  font-size: 15px;
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

.cdv-bg-muted {
  background-color: #f1f5f9;
}
.cdv-bg-light {
  background-color: #f8fafc;
}
.cdv-text-dark {
  color: #1e293b;
}
.cdv-text-muted {
  color: #64748b;
}
.cdv-text-light {
  color: #94a3b8;
}
.cdv-text-amber {
  color: #f59e0b;
}
.cdv-text-green {
  color: #10b981;
}
.cdv-text-blue {
  color: #2563eb;
}
.cdv-text-14 {
  font-size: 14px;
}
.cdv-text-16 {
  font-size: 16px;
}
.cdv-text-18 {
  font-size: 18px;
}
.cdv-text-24 {
  font-size: 24px;
}
.cdv-heading-22 {
  font-size: 22px;
  color: #1e293b;
}
.cdv-section-title {
  font-size: 22px;
  font-weight: 600;
  color: #1e293b;
}
.cdv-label {
  font-size: 14px;
  color: #64748b;
}
.cdv-value {
  font-size: 18px;
  font-weight: 500;
  color: #1e293b;
}
.cdv-totals-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 14px;
}
.cdv-stat {
  padding: 18px;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: box-shadow 0.2s;
}
.cdv-stat:hover {
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
}
.cdv-stat__icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.cdv-stat__label {
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  line-height: 1.3;
}
.cdv-stat__value {
  font-size: 24px;
  font-weight: 800;
  color: #1e293b;
  line-height: 1.2;
}
.cdv-stat__value span {
  font-size: 14px;
  font-weight: 500;
  color: #94a3b8;
}

.cdv-stat--slate { background: #f8fafc; border-color: #e2e8f0; }
.cdv-stat--slate .cdv-stat__icon { background: #e2e8f0; color: #475569; }

.cdv-stat--emerald { background: #ecfdf5; border-color: #a7f3d0; }
.cdv-stat--emerald .cdv-stat__icon { background: #d1fae5; color: #059669; }
.cdv-stat--emerald .cdv-stat__value { color: #059669; }

.cdv-stat--blue { background: #eff6ff; border-color: #bfdbfe; }
.cdv-stat--blue .cdv-stat__icon { background: #dbeafe; color: #2563eb; }
.cdv-stat--blue .cdv-stat__value { color: #2563eb; }

.cdv-stat--indigo { background: #eef2ff; border-color: #c7d2fe; }
.cdv-stat--indigo .cdv-stat__icon { background: #e0e7ff; color: #4f46e5; }
.cdv-stat--indigo .cdv-stat__value { color: #4338ca; }

.cdv-stat--amber { background: #fffbeb; border-color: #fde68a; }
.cdv-stat--amber .cdv-stat__icon { background: #fef3c7; color: #d97706; }
.cdv-stat--amber .cdv-stat__value { color: #b45309; }

.cdv-stat--main {
  background: linear-gradient(135deg, #fffbeb, #fef3c7);
  border-color: #fcd34d;
  box-shadow: 0 2px 8px rgba(245,158,11,0.12);
}
.cdv-stat--main .cdv-stat__value {
  font-size: 26px;
  color: #92400e;
}

@media (max-width: 1024px) {
  .cdv-totals-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 640px) {
  .cdv-totals-grid { grid-template-columns: repeat(2, 1fr); }
}
.cdv-modal-title {
  font-size: 22px;
  font-weight: 700;
  color: #1e293b;
}
.cdv-emoji-icon {
  font-size: 22px;
}
.cdv-border {
  border: 1px solid #e2e8f0;
}
.cdv-border-bottom {
  border-bottom: 1px solid #e2e8f0;
}
.cdv-border-top {
  border-top: 1px solid #e2e8f0;
}
.cdv-th-text {
  font-size: 13px;
  letter-spacing: 0.05em;
  color: #64748b;
}
.cdv-tbody-divide > tr + tr {
  border-top: 1px solid #e2e8f0;
}
.cdv-row-alt {
  background-color: #FAFBFC;
}
.cdv-action-bar {
  border-top: 1px solid #e2e8f0;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.05);
}
</style>
