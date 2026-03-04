<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import DashboardLayout from '@/components/dashboard/DashboardLayout.vue'
import { AppButton } from '@/components/ui'
import StepperProgress from '@/components/ui/StepperProgress.vue'
import DeclStepBasicData from './components/DeclStepBasicData.vue'
import DeclStepSummaryData from './components/DeclStepSummaryData.vue'
import DeclStepReview from './components/DeclStepReview.vue'
import DeclSuccess from './components/DeclSuccess.vue'
import type { SelectOption } from '@/types/select'
import { productGroups, productSubgroups, getSubgroupData, isPackagingGroup } from '@/data/product-groups'
import { useCalculationStore } from '@/stores/calculations'
import { reportStore } from '@/stores/reports'
import { declarationStore } from '@/stores/declarations'
import { useBusinessMenu } from '@/composables/useRoleMenu'
import { notificationStore } from '@/stores/notifications'
import { useAccountStore } from '@/stores/account'
import { CalcStatus, ReportStatus, DeclStatus } from '@/constants/statuses'
import { downloadElementAsPdf } from '@/utils/pdfExport'

const router = useRouter()
const { t } = useI18n()
const calcStore = useCalculationStore()
const accountStore = useAccountStore()
const { roleTitle, menuItems } = useBusinessMenu()

onMounted(async () => {
  await accountStore.fetchAll()
})

const currentStep = ref(1)
const totalSteps = 3
const viewMode = ref<'wizard' | 'success'>('wizard')

const steps = computed(() => [
  { number: 1, title: t('businessDecl.stepBasicData') },
  { number: 2, title: t('businessDecl.stepSummaryData') },
  { number: 3, title: t('businessDecl.stepReviewSubmit') },
])

const reportingYear = ref('2026')

const companyData = computed(() => ({
  name: accountStore.myAccount?.company || '',
  fullName: accountStore.myAccount?.company || '',
  inn: accountStore.myAccount?.inn || '',
  okpo: '',
  registrationNumber: '',
  registrationDate: '',
  legalAddress: '',
  actualAddress: '',
}))

const yearCalculations = computed(() => {
  return calcStore.calculations.filter(c =>
    c.company === companyData.value.name &&
    c.year === reportingYear.value &&
    (c.status === CalcStatus.APPROVED || c.status === CalcStatus.PAID)
  )
})

const hasCalculations = computed(() => yearCalculations.value.length > 0)

const aggregatedItems = computed(() => {
  const map = new Map<string, {
    group: string; groupLabel: string; subgroup: string; subgroupLabel: string
    tnvedCode: string; mass: number; rate: number; amount: number; paidAmount: number
  }>()

  for (const calc of yearCalculations.value) {
    const isPaid = calc.status === CalcStatus.PAID
    for (const item of calc.items) {
      const key = `${item.group}_${item.subgroup}`
      const mass = parseFloat(item.mass) || 0
      const itemAmount = item.amount
      const existing = map.get(key)

      if (existing) {
        existing.mass += mass
        existing.amount += itemAmount
        if (isPaid) existing.paidAmount += itemAmount
      } else {
        const groupObj = productGroups.find(g => g.value === item.group)
        const subObj = productSubgroups[item.group]?.find(s => s.value === item.subgroup)
        map.set(key, {
          group: item.group,
          groupLabel: groupObj?.label || item.group,
          subgroup: item.subgroup,
          subgroupLabel: subObj?.label || '—',
          tnvedCode: item.tnvedCode,
          mass,
          rate: item.rate,
          amount: itemAmount,
          paidAmount: isPaid ? itemAmount : 0,
        })
      }
    }
  }

  return Array.from(map.values())
})

const totalMass = computed(() => aggregatedItems.value.reduce((s, i) => s + i.mass, 0))
const totalAmount = computed(() => yearCalculations.value.reduce((s, c) => s + c.totalAmount, 0))
const totalPaid = computed(() =>
  yearCalculations.value.filter(c => c.status === CalcStatus.PAID).reduce((s, c) => s + c.totalAmount, 0)
)
const totalDebt = computed(() => totalAmount.value - totalPaid.value)

const yearReports = computed(() => {
  return reportStore.state.reports.filter(r =>
    r.company === companyData.value.name &&
    r.year === reportingYear.value &&
    r.status === ReportStatus.APPROVED
  )
})

const processedByGroup = computed(() => {
  const map = new Map<string, number>()
  for (const report of yearReports.value) {
    for (const item of report.items) {
      const current = map.get(item.wasteType) || 0
      map.set(item.wasteType, current + parseFloat(item.processed))
    }
  }
  return map
})

const totalProcessed = computed(() => {
  let sum = 0
  for (const val of processedByGroup.value.values()) sum += val
  return sum
})

const confirmData = ref(false)
const showDetails = ref(false)
const signedWithEcp = ref(false)
const attachedDocs = ref<{ id: number; name: string; size: string }[]>([])
let nextDocId = 1

const handleDocUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return
  for (const file of Array.from(input.files)) {
    if (file.size > 10 * 1024 * 1024) continue
    attachedDocs.value.push({
      id: nextDocId++,
      name: file.name,
      size: file.size < 1024 * 1024
        ? (file.size / 1024).toFixed(0) + ' KB'
        : (file.size / (1024 * 1024)).toFixed(1) + ' MB',
    })
  }
  input.value = ''
}

const removeDoc = (id: number) => {
  attachedDocs.value = attachedDocs.value.filter(d => d.id !== id)
}

const nextStep = () => { if (currentStep.value < totalSteps) currentStep.value++ }
const prevStep = () => { if (currentStep.value > 1) currentStep.value-- }
const goToStep = (step: number) => { if (step <= currentStep.value) currentStep.value = step }

const canProceedStep1 = computed(() => reportingYear.value && hasCalculations.value)

const yearFormOptions = computed<SelectOption[]>(() => [
  { value: '2025', label: '2025' },
  { value: '2026', label: '2026' },
  { value: '2027', label: '2027' },
  { value: '2028', label: '2028' },
  { value: '2029', label: '2029' },
  { value: '2030', label: '2030' },
])

const submittedDeclaration = ref({ number: '', date: '' })

const buildDeclPayload = () => ({
  company: companyData.value.name,
  opf: 'ОсОО',
  inn: companyData.value.inn,
  address: companyData.value.legalAddress,
  contactPerson: 'Абдыкеримов К.Б.',
  phone: '+996 555 12-34-56',
  email: 'info@techprom.kg',
  reportingYear: reportingYear.value,
  calculationCount: yearCalculations.value.length,
  totalCharged: totalAmount.value,
  totalPaid: totalPaid.value,
  balance: totalPaid.value - totalAmount.value,
  calculations: yearCalculations.value.map(c => ({
    number: c.number, period: c.period, categories: c.items.map(i => i.group).join(', '),
    mass: c.items.reduce((s: number, i: any) => s + (parseFloat(i.mass) || 0), 0),
    amount: c.totalAmount, calcStatus: c.status, acceptedDate: c.date,
  })),
  reports: yearReports.value.map(r => ({
    number: r.number, period: r.year, categories: r.items.map(i => i.wasteType).join(', '),
    processed: r.totalProcessed, credited: 0, reportStatus: r.status, acceptedDate: r.reviewDate || '—',
  })),
  payments: [],
  documents: [],
})

const submitDeclaration = () => {
  const decl = declarationStore.addDeclaration(buildDeclPayload(), DeclStatus.UNDER_REVIEW)
  notificationStore.add({
    type: 'info',
    title: t('businessDecl.notifNewDeclaration'),
    message: t('businessDecl.notifNewDeclMessage', { company: companyData.value.name }),
    role: 'eco-operator',
    link: '/eco-operator/incoming-declarations'
  })
  notificationStore.add({
    type: 'success',
    title: t('businessDecl.notifDeclSentTitle'),
    message: t('businessDecl.notifDeclSentMessage'),
    role: 'business'
  })
  submittedDeclaration.value = { number: decl.number, date: decl.submittedAt }
  viewMode.value = 'success'
}

const saveDraft = () => {
  declarationStore.addDeclaration(buildDeclPayload(), DeclStatus.DRAFT)
  router.push('/business/declarations')
}

const backToList = () => {
  router.push('/business/declarations')
}

const printAreaRef = ref<HTMLElement | null>(null)

const printPage = async () => {
  const el = printAreaRef.value
  if (!el) return
  await downloadElementAsPdf(el, 'declaration-detail.pdf')
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
          <button @click="backToList" class="flex items-center gap-2 text-[#1e293b] hover:text-[#2563eb] mb-4">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {{ $t('businessDecl.backToList') }}
          </button>
          <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b]">{{ $t('businessDecl.wizardTitle') }}</h1>
        </div>

        <StepperProgress
          :steps="steps"
          :currentStep="currentStep"
          accentColor="#2563eb"
          @go-to-step="goToStep"
        />

        <div class="bg-white rounded-2xl shadow-sm border border-[#e2e8f0]">
          <DeclStepBasicData
            v-if="currentStep === 1"
            :reportingYear="reportingYear"
            :yearFormOptions="yearFormOptions"
            :companyData="companyData"
            :hasCalculations="hasCalculations"
            :yearCalculationsCount="yearCalculations.length"
            :totalAmount="totalAmount"
            :totalMass="totalMass"
            @update:reportingYear="reportingYear = $event"
          />

          <DeclStepSummaryData
            v-if="currentStep === 2"
            :reportingYear="reportingYear"
            :yearCalculations="yearCalculations"
            :aggregatedItems="aggregatedItems"
            :totalMass="totalMass"
            :totalAmount="totalAmount"
            :totalPaid="totalPaid"
            :totalDebt="totalDebt"
            :yearReports="yearReports"
            :processedByGroup="processedByGroup"
            :totalProcessed="totalProcessed"
            :showDetails="showDetails"
            @update:showDetails="showDetails = $event"
          />

          <DeclStepReview
            v-if="currentStep === 3"
            :reportingYear="reportingYear"
            :companyData="companyData"
            :yearCalculationsCount="yearCalculations.length"
            :totalMass="totalMass"
            :totalAmount="totalAmount"
            :totalPaid="totalPaid"
            :totalDebt="totalDebt"
            :attachedDocs="attachedDocs"
            :signedWithEcp="signedWithEcp"
            :confirmData="confirmData"
            @upload="handleDocUpload"
            @removeDoc="removeDoc"
            @signEcp="signedWithEcp = true"
            @update:confirmData="confirmData = $event"
          />

          <div class="px-6 lg:px-8 py-4 bg-[#f8fafc] border-t border-[#e2e8f0] flex flex-col-reverse sm:flex-row justify-between gap-3 sm:gap-4 sticky bottom-0 z-10 rounded-b-2xl">
            <AppButton
              v-if="currentStep > 1"
              variant="secondary"
              @click="prevStep"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              {{ $t('businessDecl.back') }}
            </AppButton>
            <div v-else></div>

            <div class="flex flex-col sm:flex-row gap-3">
              <AppButton
                v-if="currentStep === 3"
                variant="secondary"
                @click="saveDraft"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                {{ $t('businessDecl.saveDraft') }}
              </AppButton>

              <button
                v-if="currentStep < 3"
                @click="nextStep"
                :disabled="currentStep === 1 && !canProceedStep1"
                class="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#2563eb] text-white rounded-lg font-medium hover:bg-[#1d4ed8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ $t('businessDecl.next') }}
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <AppButton
                v-if="currentStep === 3"
                variant="primary"
                :disabled="!confirmData || !signedWithEcp"
                @click="submitDeclaration"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ $t('businessDecl.submitDeclaration') }}
              </AppButton>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template v-else-if="viewMode === 'success'">
      <div ref="printAreaRef">
        <DeclSuccess
          :submittedDeclaration="submittedDeclaration"
          @print="printPage"
          @backToList="backToList"
        />
      </div>
    </template>
  </DashboardLayout>
</template>
