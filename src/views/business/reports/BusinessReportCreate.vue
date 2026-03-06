<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { AppButton } from '@/components/ui'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import DashboardLayout from '@/components/dashboard/DashboardLayout.vue'
import type { SelectOption } from '@/types/select'
import type { ViewMode } from '@/types/report'
import { productGroups, productSubgroups, type ProductSubgroup } from '@/data/product-groups'
import { getNormativeForGroup, normativeTiers } from '@/data/recycling-norms'
import { useReportStore, type ProcessingItem, type UploadedFile } from '@/stores/reports'
import InstructionDrawer from '@/components/InstructionDrawer.vue'
import { instructionReportHtml } from '@/data/instructionReport'
import { recyclerStore } from '@/stores/recyclers'
import { validators, scrollToFirstError } from '@/utils/validators'
import { useBusinessMenu } from '@/composables/useRoleMenu'
import { notificationStore } from '@/stores/notifications'
import { ReportStatus } from '@/constants/statuses'
import { useAccountStore } from '@/stores/account'
import {
  formatFileSize,
  getItemNormativePercent,
  getItemRequiredProcessing,
  getItemFulfillmentPercent,
  getItemRemainder,
  getItemStatus,
  getFulfillmentColor,
  getBaseRate,
  getWasteTypeLabel,
} from '@/helpers/reportHelpers'
import ReportStepProgress from './components/ReportStepProgress.vue'
import StepBasicData from './components/StepBasicData.vue'
import StepProcessingData from './components/StepProcessingData.vue'
import StepDocuments from './components/StepDocuments.vue'
import StepReview from './components/StepReview.vue'
import ReportSuccess from './components/ReportSuccess.vue'

const { t } = useI18n()
const router = useRouter()
const { roleTitle, menuItems } = useBusinessMenu()
const accountStore = useAccountStore()
const reportStore = useReportStore()

const isLoading = ref(true)
onMounted(async () => {
  await Promise.all([reportStore.fetchAll(), accountStore.fetchAll()])
  isLoading.value = false
})

const showInstruction = ref(false)
const formSubmitted = ref(false)

const viewMode = ref<ViewMode>('wizard')
const currentStep = ref(1)
const totalSteps = 4

const steps = computed(() => [
  { number: 1, title: t('businessReports.step1Title') },
  { number: 2, title: t('businessReports.step2Title') },
  { number: 3, title: t('businessReports.step3Title') },
  { number: 4, title: t('businessReports.step4Title') },
])

const reportingYear = ref('2026')

const yearOptions = computed<SelectOption[]>(() => [
  { value: '', label: t('businessReports.selectYear') },
  { value: '2025', label: '2025' },
  { value: '2026', label: '2026' },
  { value: '2027', label: '2027' },
])

const companyData = computed(() => ({
  name: accountStore.myAccount?.company || '',
  inn: accountStore.myAccount?.inn || '',
  address: '',
}))

const processingItems = ref<ProcessingItem[]>([
  { id: 1, wasteType: '', wasteCode: '', declared: '', processed: '', recycler: '', contractNumber: '', contractDate: '' }
])

const wasteTypes = productGroups.map(g => ({ value: g.value, label: g.label, code: g.code }))

const getRecyclersForItem = (item: ProcessingItem) => {
  const active = item.wasteType
    ? recyclerStore.getActiveRecyclersByGroup(item.wasteType)
    : recyclerStore.getActiveRecyclers()
  return active.map(r => {
    const freeCapacity = item.wasteType ? recyclerStore.getFreeCapacityForGroup(r, item.wasteType) : 0
    const totalCap = item.wasteType ? (recyclerStore.getCapacityForGroup(r, item.wasteType)?.capacityTons || 0) : 0
    const capLabel = item.wasteType && totalCap > 0 ? ` (${t('businessReports.freeCapacity', { free: freeCapacity, total: totalCap })})` : ''
    return {
      value: String(r.id),
      label: `${r.name} (${t('businessReports.inn')}: ${r.inn})` + capLabel,
    }
  })
}

const getRecyclerOptionsForItem = (item: ProcessingItem): SelectOption[] => {
  const recyclers = getRecyclersForItem(item)
  return [
    { value: '', label: t('businessReports.selectRecycler') },
    ...recyclers,
    { value: '__manual__', label: t('businessReports.manualEntry') },
  ]
}

const itemSubgroups = reactive<Record<number, string>>({})
const recyclerModes = reactive<Record<number, string>>({})

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

const onGroupChange = (itemId: number, value: string) => {
  const item = processingItems.value.find(i => i.id === itemId)
  if (!item) return
  item.wasteType = value
  itemSubgroups[item.id] = ''
  const group = productGroups.find(g => g.value === value)
  item.wasteCode = group?.code || ''
}

const onSubgroupChange = (itemId: number, value: string) => {
  const item = processingItems.value.find(i => i.id === itemId)
  if (!item) return
  itemSubgroups[item.id] = value
  const subs = productSubgroups[item.wasteType] || []
  const sub = subs.find(s => s.value === value)
  if (sub) {
    item.wasteCode = sub.code
  }
}

const onSubgroupSelected = (itemId: number, data: ProductSubgroup | null) => {
  if (data) {
    const item = processingItems.value.find(i => i.id === itemId)
    if (item) item.wasteCode = data.code
  }
}

const onRecyclerChange = (itemId: number) => {
  const item = processingItems.value.find(i => i.id === itemId)
  if (!item) return
  if (item.recycler === '__manual__') {
    item.recycler = ''
    recyclerModes[item.id] = 'manual'
  }
}

const switchToSelect = (itemId: number) => {
  const item = processingItems.value.find(i => i.id === itemId)
  if (!item) return
  item.recycler = ''
  recyclerModes[item.id] = 'select'
}

const updateItemField = (itemId: number, field: keyof ProcessingItem, value: string) => {
  const item = processingItems.value.find(i => i.id === itemId)
  if (item) (item as any)[field] = value
}

const getRecyclerLabel = (value: string) => {
  const id = parseInt(value)
  if (!isNaN(id)) {
    const r = recyclerStore.getRecyclerById(id)
    if (r) return r.name
  }
  return value
}

const importFromDeclaration = () => {
  const items = [
    { id: nextItemId++, wasteType: 'group_6', wasteCode: '3923', declared: '12.5', processed: '11.8', recycler: 'ecorecycle', contractNumber: 'ДГ-2024-045', contractDate: '2024-01-15' },
    { id: nextItemId++, wasteType: 'group_1', wasteCode: '4819 10', declared: '8.3', processed: '8.3', recycler: 'greentech', contractNumber: 'ДГ-2024-046', contractDate: '2024-01-15' },
    { id: nextItemId++, wasteType: 'group_8', wasteCode: '7010', declared: '5.2', processed: '5.0', recycler: 'glassprom', contractNumber: 'ДГ-2024-047', contractDate: '2024-02-01' },
  ]
  processingItems.value = items
}

const uploadedFiles = ref<UploadedFile[]>([])
const isDragging = ref(false)
let nextFileId = 1

const handleDrop = (e: DragEvent) => {
  isDragging.value = false
  const files = e.dataTransfer?.files
  if (files) addFiles(files)
}

const handleFileSelect = (e: Event) => {
  const input = e.target as HTMLInputElement
  if (input.files) addFiles(input.files)
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

const removeFile = (id: number) => {
  uploadedFiles.value = uploadedFiles.value.filter(f => f.id !== id)
}

const nextStep = () => {
  if (currentStep.value < totalSteps) currentStep.value++
}

const prevStep = () => {
  if (currentStep.value > 1) currentStep.value--
}

const goToStep = (step: number) => {
  if (step <= currentStep.value) currentStep.value = step
}

const submittedReport = ref<{ number: string; date: string }>({ number: '', date: '' })

const yearNum = computed(() => parseInt(reportingYear.value) || 2026)

const wrappedGetItemNormativePercent = (wasteType: string) => {
  return getItemNormativePercent(wasteType, yearNum.value)
}

const wrappedGetItemRequiredProcessing = (item: ProcessingItem) => {
  return getItemRequiredProcessing(item, yearNum.value)
}

const wrappedGetItemFulfillmentPercent = (item: ProcessingItem) => {
  return getItemFulfillmentPercent(item, yearNum.value)
}

const wrappedGetItemRemainder = (item: ProcessingItem) => {
  return getItemRemainder(item, yearNum.value)
}

const wrappedGetItemStatus = (item: ProcessingItem) => {
  return getItemStatus(item, yearNum.value)
}

const submitReport = async () => {
  formSubmitted.value = true
  if (hasErrors.value) {
    scrollToFirstError()
    return
  }
  const report = await reportStore.addReport({
    company: companyData.value.name,
    inn: companyData.value.inn,
    year: reportingYear.value,
    items: [...processingItems.value.filter(i => i.wasteType)],
    files: [...uploadedFiles.value],
    totalDeclared: parseFloat(totalDeclared.value),
    totalProcessed: parseFloat(totalProcessed.value),
    processingPercent: parseFloat(processingPercent.value),
  }, ReportStatus.UNDER_REVIEW)
  notificationStore.add({
    type: 'info',
    title: t('businessReports.notifNewReport'),
    message: t('businessReports.notifNewReportMsg', { company: companyData.value.name }),
    role: 'eco-operator',
    link: '/eco-operator/incoming-reports'
  })
  notificationStore.add({
    type: 'success',
    title: t('businessReports.notifReportSent'),
    message: t('businessReports.notifReportSentMsg'),
    role: 'business'
  })
  submittedReport.value = { number: report.number, date: report.date }
  viewMode.value = 'success'
}

const saveDraft = async () => {
  await reportStore.addReport({
    company: companyData.value.name,
    inn: companyData.value.inn,
    year: reportingYear.value,
    items: [...processingItems.value.filter(i => i.wasteType)],
    files: [...uploadedFiles.value],
    totalDeclared: parseFloat(totalDeclared.value) || 0,
    totalProcessed: parseFloat(totalProcessed.value) || 0,
    processingPercent: parseFloat(processingPercent.value) || 0,
  }, ReportStatus.DRAFT)
  router.push('/business/reports')
}

const backToList = () => {
  router.push('/business/reports')
}

const canProceedStep1 = computed(() => reportingYear.value)

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
  return Math.round((normativeTiers.high[yearNum.value] || 0) * 100)
})

const yearNormativeStandard = computed(() => {
  return Math.round((normativeTiers.standard[yearNum.value] || 0) * 100)
})

const weightedNormativePercent = computed(() => {
  const items = processingItems.value.filter(i => i.wasteType && parseFloat(i.declared) > 0)
  if (items.length === 0) return yearNormativeStandard.value
  const year = yearNum.value
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

const totalRequiredProcessing = computed(() => {
  return processingItems.value
    .filter(i => i.wasteType)
    .reduce((sum, item) => sum + wrappedGetItemRequiredProcessing(item), 0)
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
      const remainder = wrappedGetItemRemainder(item)
      const rate = getBaseRate(item.wasteType)
      return sum + Math.round(remainder * rate)
    }, 0)
})

const formErrors = computed(() => {
  const errors: Record<string, string> = {}
  if (!reportingYear.value) {
    errors['reportingYear'] = t('businessReports.errSelectPeriod')
  }
  const filledItems = processingItems.value.filter(i => i.wasteType)
  if (filledItems.length === 0) {
    errors['items'] = t('businessReports.errAddItem')
  }
  processingItems.value.forEach((item) => {
    if (!item.wasteType) return
    const declErr = validators.positiveNumber(item.declared, t('businessReports.declaredMass'))
    if (declErr) errors[`item_${item.id}_declared`] = declErr
    const procErr = validators.positiveNumber(item.processed, t('businessReports.processedMass'))
    if (procErr) errors[`item_${item.id}_processed`] = procErr
    const declVal = parseFloat(item.declared) || 0
    const procVal = parseFloat(item.processed) || 0
    if (declVal > 0 && procVal > declVal) {
      errors[`item_${item.id}_processed_exceed`] = t('businessReports.errProcessedExceed')
    }
    if (procVal > 0 && !item.recycler) {
      errors[`item_${item.id}_recycler`] = t('businessReports.errRecyclerRequired')
    }
    if (item.recycler && !item.contractNumber) {
      errors[`item_${item.id}_contract_warn`] = t('businessReports.warnContract')
    }
  })
  return errors
})

const hasErrors = computed(() => Object.keys(formErrors.value).filter(k => !k.endsWith('_warn')).length > 0)

const handlePrint = () => {
  window.print()
}
</script>

<template>
  <DashboardLayout
    role="business"
    :roleTitle="roleTitle"
    :userName="companyData.name"
    :menuItems="menuItems"
  >
    <template v-if="viewMode === 'wizard'">
      <div class="max-w-6xl mx-auto">
        <div class="mb-6">
          <AppButton
            variant="back"
            @click="backToList"
            :icon="'<svg class=&quot;w-5 h-5&quot; fill=&quot;none&quot; viewBox=&quot;0 0 24 24&quot; stroke=&quot;currentColor&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; stroke-width=&quot;2&quot; d=&quot;M10 19l-7-7m0 0l7-7m-7 7h18&quot; /></svg>'"
            :label="$t('businessReports.backToList')"
          />
          <div class="flex items-center justify-between gap-4">
            <h1 class="brc-page-title">{{ $t('businessReports.submitReportTitle') }}</h1>
            <AppButton
              variant="ghost"
              @click="showInstruction = true"
              :icon="'<svg class=&quot;w-4 h-4&quot; fill=&quot;none&quot; viewBox=&quot;0 0 24 24&quot; stroke=&quot;currentColor&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; stroke-width=&quot;2&quot; d=&quot;M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z&quot; /></svg>'"
              :label="$t('businessReports.instruction')"
              color="#2D8B4E"
            />
          </div>
        </div>

        <ReportStepProgress
          :steps="steps"
          :currentStep="currentStep"
          @goToStep="goToStep"
        />

        <div class="brc-card">
          <StepBasicData
            v-if="currentStep === 1"
            :reportingYear="reportingYear"
            :yearOptions="yearOptions"
            :companyData="companyData"
            :yearNormativeHigh="yearNormativeHigh"
            :yearNormativeStandard="yearNormativeStandard"
            :formSubmitted="formSubmitted"
            :formErrors="formErrors"
            @update:reportingYear="reportingYear = $event"
          />

          <StepProcessingData
            v-if="currentStep === 2"
            :processingItems="processingItems"
            :itemSubgroups="itemSubgroups"
            :recyclerModes="recyclerModes"
            :formSubmitted="formSubmitted"
            :formErrors="formErrors"
            :totalDeclared="totalDeclared"
            :totalProcessed="totalProcessed"
            :totalRequiredProcessing="totalRequiredProcessing"
            :overallFulfillmentPercent="overallFulfillmentPercent"
            :totalSurcharge="totalSurcharge"
            :weightedNormativePercent="weightedNormativePercent"
            :processingPercent="processingPercent"
            :getRecyclerOptionsForItem="getRecyclerOptionsForItem"
            :getItemNormativePercent="wrappedGetItemNormativePercent"
            :getItemRequiredProcessing="wrappedGetItemRequiredProcessing"
            :getItemFulfillmentPercent="wrappedGetItemFulfillmentPercent"
            :getFulfillmentColor="getFulfillmentColor"
            :getItemRemainder="wrappedGetItemRemainder"
            :getItemStatus="wrappedGetItemStatus"
            @importFromDeclaration="importFromDeclaration"
            @addItem="addProcessingItem"
            @removeItem="removeProcessingItem"
            @updateItemGroup="onGroupChange"
            @updateItemSubgroup="onSubgroupChange"
            @subgroupSelected="onSubgroupSelected"
            @updateItemDeclared="(id, val) => updateItemField(id, 'declared', val)"
            @updateItemProcessed="(id, val) => updateItemField(id, 'processed', val)"
            @updateItemRecycler="(id, val) => updateItemField(id, 'recycler', val)"
            @recyclerChange="onRecyclerChange"
            @switchToSelect="switchToSelect"
            @updateItemContractNumber="(id, val) => updateItemField(id, 'contractNumber', val)"
            @updateItemContractDate="(id, val) => updateItemField(id, 'contractDate', val)"
          />

          <StepDocuments
            v-if="currentStep === 3"
            :uploadedFiles="uploadedFiles"
            :isDragging="isDragging"
            @drop="handleDrop"
            @fileSelect="handleFileSelect"
            @removeFile="removeFile"
            @update:isDragging="isDragging = $event"
          />

          <StepReview
            v-if="currentStep === 4"
            :reportingYear="reportingYear"
            :companyData="companyData"
            :processingItems="processingItems"
            :uploadedFiles="uploadedFiles"
            :totalDeclared="totalDeclared"
            :totalProcessed="totalProcessed"
            :processingPercent="processingPercent"
            :weightedNormativePercent="weightedNormativePercent"
            :formSubmitted="formSubmitted"
            :formErrors="formErrors"
            :hasErrors="hasErrors"
            :getWasteTypeLabel="getWasteTypeLabel"
            :getRecyclerLabel="getRecyclerLabel"
            :getItemNormativePercent="wrappedGetItemNormativePercent"
          />

          <div class="wizard-footer">
            <div>
              <AppButton
                v-if="currentStep > 1"
                variant="outline"
                @click="prevStep"
                :icon="'<svg width=&quot;16&quot; height=&quot;16&quot; viewBox=&quot;0 0 24 24&quot; fill=&quot;none&quot; stroke=&quot;currentColor&quot; stroke-width=&quot;2&quot; stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot;><path d=&quot;M19 12H5&quot;/><path d=&quot;M12 19l-7-7 7-7&quot;/></svg>'"
                :label="$t('businessReports.back')"
              />
            </div>

            <div class="wizard-footer__right">
              <AppButton
                v-if="currentStep === 4"
                variant="outline"
                @click="saveDraft"
                :label="$t('businessReports.saveDraft')"
              />

              <AppButton
                v-if="currentStep < 4"
                variant="primary"
                bg="#10b981"
                :disabled="(currentStep === 1 && !canProceedStep1) || (currentStep === 2 && !canProceedStep2)"
                @click="nextStep"
                :label="$t('businessReports.next')"
                :icon="'<svg width=&quot;16&quot; height=&quot;16&quot; viewBox=&quot;0 0 24 24&quot; fill=&quot;none&quot; stroke=&quot;currentColor&quot; stroke-width=&quot;2&quot; stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot;><path d=&quot;M5 12h14&quot;/><path d=&quot;M12 5l7 7-7 7&quot;/></svg>'"
                icon-position="right"
              />

              <AppButton
                v-if="currentStep === 4"
                variant="primary"
                bg="#10b981"
                :disabled="formSubmitted && hasErrors"
                @click="submitReport"
                :label="$t('businessReports.signAndSubmit')"
              />
            </div>
          </div>
        </div>
      </div>
    </template>

    <template v-else-if="viewMode === 'success'">
      <ReportSuccess
        :reportNumber="submittedReport.number"
        :reportDate="submittedReport.date"
        @print="handlePrint"
        @backToList="backToList"
      />
    </template>

    <InstructionDrawer v-model="showInstruction" :title="$t('businessReports.instructionDrawerTitle')" :contentHtml="instructionReportHtml" />
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
.brc-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  border: 1px solid #e2e8f0;
}
.brc-page-title {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
}
@media (min-width: 1024px) {
  .brc-page-title { font-size: 34px; }
}
</style>
