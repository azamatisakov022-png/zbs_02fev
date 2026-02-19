<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import DataTable from '../../components/dashboard/DataTable.vue'
import EmptyState from '../../components/dashboard/EmptyState.vue'
import SkeletonLoader from '../../components/dashboard/SkeletonLoader.vue'
import { AppButton, AppBadge } from '../../components/ui'
import { getStatusBadgeVariant } from '../../utils/statusVariant'
import { productGroups, productSubgroups, getSubgroupData, isPackagingGroup } from '../../data/product-groups'
import { calculationStore } from '../../stores/calculations'
import { reportStore } from '../../stores/reports'
import { declarationStore, type Declaration } from '../../stores/declarations'
import { useBusinessMenu } from '../../composables/useRoleMenu'
import { toastStore } from '../../stores/toast'
import { downloadElementAsPdf } from '../../utils/pdfExport'
import { notificationStore } from '../../stores/notifications'
import { useRouter } from 'vue-router'

const router = useRouter()

const { roleTitle, menuItems } = useBusinessMenu()

// Loading state
const isLoading = ref(true)
onMounted(() => { setTimeout(() => { isLoading.value = false }, 500) })

// View state
type ViewMode = 'list' | 'wizard' | 'success'
const viewMode = ref<ViewMode>('list')
const currentStep = ref(1)
const totalSteps = 3

const steps = [
  { number: 1, title: 'Основные данные' },
  { number: 2, title: 'Сводные данные' },
  { number: 3, title: 'Проверка и отправка' },
]

// Form data
const reportingYear = ref('2026')

const companyData = {
  name: 'ОсОО «ТехПром»',
  fullName: 'Общество с ограниченной ответственностью «ТехПром»',
  inn: '01234567890123',
  okpo: '29438765',
  registrationNumber: 'ПУС-2025-0042',
  registrationDate: '15.03.2025',
  legalAddress: 'г. Бишкек, ул. Московская, 123',
  actualAddress: 'г. Бишкек, ул. Московская, 123',
}

// Calculations for selected year (Принято / Оплачено)
const yearCalculations = computed(() => {
  return calculationStore.state.calculations.filter(c =>
    c.company === companyData.name &&
    c.year === reportingYear.value &&
    (c.status === 'Принято' || c.status === 'Оплачено')
  )
})

const hasCalculations = computed(() => yearCalculations.value.length > 0)

// Aggregated data by group+subgroup
const aggregatedItems = computed(() => {
  const map = new Map<string, {
    group: string
    groupLabel: string
    subgroup: string
    subgroupLabel: string
    tnvedCode: string
    mass: number
    rate: number
    amount: number
    paidAmount: number
  }>()

  for (const calc of yearCalculations.value) {
    const isPaid = calc.status === 'Оплачено'
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

// Totals
const totalMass = computed(() => aggregatedItems.value.reduce((s, i) => s + i.mass, 0))
const totalAmount = computed(() => yearCalculations.value.reduce((s, c) => s + c.totalAmount, 0))
const totalPaid = computed(() =>
  yearCalculations.value.filter(c => c.status === 'Оплачено').reduce((s, c) => s + c.totalAmount, 0)
)
const totalDebt = computed(() => totalAmount.value - totalPaid.value)

// Accepted recycling reports for the same company and year
const yearReports = computed(() => {
  return reportStore.state.reports.filter(r =>
    r.company === companyData.name &&
    r.year === reportingYear.value &&
    r.status === 'Принят'
  )
})

// Processed volume by group from accepted reports
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

// Step 3
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

const simulateEcp = () => {
  signedWithEcp.value = true
}

// Navigation
const nextStep = () => { if (currentStep.value < totalSteps) currentStep.value++ }
const prevStep = () => { if (currentStep.value > 1) currentStep.value-- }
const goToStep = (step: number) => { if (step <= currentStep.value) currentStep.value = step }

// Submission
const submittedDeclaration = ref({ number: '', date: '' })

const submitDeclaration = () => {
  const decl = declarationStore.addDeclaration({
    company: companyData.name,
    opf: 'ОсОО',
    inn: companyData.inn,
    address: companyData.legalAddress,
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
      mass: c.items.reduce((s, i) => s + (parseFloat(i.mass) || 0), 0),
      amount: c.totalAmount, calcStatus: c.status, acceptedDate: c.date,
    })),
    reports: yearReports.value.map(r => ({
      number: r.number, period: r.year, categories: r.items.map(i => i.wasteType).join(', '),
      processed: r.totalProcessed, credited: 0, reportStatus: r.status, acceptedDate: r.reviewDate || '—',
    })),
    payments: [],
    documents: [],
  }, 'На рассмотрении')
  notificationStore.add({
    type: 'info',
    title: 'Новая декларация',
    message: 'Получена новая декларация на проверку.',
    role: 'eco-operator',
    link: '/eco-operator/incoming-declarations'
  })
  submittedDeclaration.value = { number: decl.number, date: decl.submittedAt }
  viewMode.value = 'success'
}

const saveDraft = () => {
  declarationStore.addDeclaration({
    company: companyData.name,
    opf: 'ОсОО',
    inn: companyData.inn,
    address: companyData.legalAddress,
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
      mass: c.items.reduce((s, i) => s + (parseFloat(i.mass) || 0), 0),
      amount: c.totalAmount, calcStatus: c.status, acceptedDate: c.date,
    })),
    reports: yearReports.value.map(r => ({
      number: r.number, period: r.year, categories: r.items.map(i => i.wasteType).join(', '),
      processed: r.totalProcessed, credited: 0, reportStatus: r.status, acceptedDate: r.reviewDate || '—',
    })),
    payments: [],
    documents: [],
  }, 'Черновик')
  viewMode.value = 'list'
}

const startWizard = () => {
  currentStep.value = 1
  confirmData.value = false
  showDetails.value = false
  viewMode.value = 'wizard'
}

const backToList = () => {
  viewMode.value = 'list'
  currentStep.value = 1
  confirmData.value = false
}

const canProceedStep1 = computed(() => reportingYear.value && hasCalculations.value)

// List table
const columns = [
  { key: 'number', label: 'Номер', width: '12%' },
  { key: 'year', label: 'Отчётный год', width: '10%' },
  { key: 'calcCount', label: 'Расчётов', width: '10%' },
  { key: 'totalAmount', label: 'Общая сумма', width: '15%' },
  { key: 'submittedAt', label: 'Дата подачи', width: '12%' },
  { key: 'status', label: 'Статус', width: '10%' },
]

// Declarations from shared store filtered by company
const storeDeclarations = computed(() => declarationStore.getByCompany(companyData.name))

const declarations = computed(() =>
  storeDeclarations.value.map(d => ({
    id: d.id,
    number: d.number,
    year: d.reportingYear,
    calcCount: d.calculationCount,
    totalAmount: d.totalCharged,
    submittedAt: d.submittedAt,
    status: d.status,
    reviewComment: d.reviewComment,
    reviewDate: d.reviewDate,
    reviewer: d.reviewer,
  }))
)


// Filters
const searchQuery = ref('')
const filterYear = ref('')
const filterStatus = ref('')

const filteredDeclarations = computed(() => {
  return declarations.value.filter(d => {
    if (searchQuery.value && !d.number.toLowerCase().includes(searchQuery.value.toLowerCase())) return false
    if (filterYear.value && d.year !== filterYear.value) return false
    if (filterStatus.value && d.status !== filterStatus.value) return false
    return true
  })
})

const hasActiveFilters = computed(() => {
  return searchQuery.value !== '' || filterYear.value !== '' || filterStatus.value !== ''
})

const isFilteredEmpty = computed(() => {
  return filteredDeclarations.value.length === 0 && declarations.value.length > 0 && hasActiveFilters.value
})

const resetFilters = () => {
  searchQuery.value = ''
  filterYear.value = ''
  filterStatus.value = ''
}

// Row class for Variant 6 colored left border
const getRowClass = (row: Record<string, any>) => {
  switch (row.status) {
    case 'Принята': case 'Подписана': return 'row-green'
    case 'На проверке': return 'row-yellow'
    case 'Отклонена': return 'row-red'
    case 'Автосформирована': return 'row-blue'
    default: return 'row-gray'
  }
}

// ⋯ dropdown menu state
const openMenuId = ref<number | null>(null)
const toggleMenu = (id: number) => { openMenuId.value = openMenuId.value === id ? null : id }
const closeMenu = () => { openMenuId.value = null }

// Export / Print handlers
const handleDownloadPdf = (id: number) => {
  router.push({ path: '/business/declarations/' + id, query: { from: 'declarations', print: 'true' } })
}

const printAreaRef = ref<HTMLElement | null>(null)

const printPage = async () => {
  const el = printAreaRef.value
  if (!el) return
  await downloadElementAsPdf(el, 'declaration-detail.pdf')
}

const deleteDeclaration = (id: number) => {
  toastStore.show({ type: 'info', title: 'Удаление', message: 'Удаление деклараций будет доступно в следующем обновлении' })
}

const signDeclaration = (id: number) => {
  toastStore.show({ type: 'info', title: 'Подписание', message: 'Электронное подписание будет доступно в следующем обновлении' })
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
        <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b] mb-2">Декларации</h1>
        <p class="text-[#64748b]">Годовые декларации о товарах и упаковке</p>
      </div>

      <!-- CTA Banner -->
      <div class="mb-6 bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] rounded-2xl p-6 lg:p-8 text-white relative overflow-hidden">
        <div class="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div class="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        <div class="relative flex flex-col lg:flex-row lg:items-center gap-6">
          <div class="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <svg class="w-8 h-8 lg:w-10 lg:h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div class="flex-1">
            <h2 class="text-xl lg:text-2xl font-bold mb-2">Подать годовую декларацию</h2>
            <p class="text-white/80 text-sm lg:text-base">Декларация формируется автоматически из всех принятых расчётов утилизационного сбора за выбранный год.</p>
          </div>
          <button
            @click="startWizard"
            class="flex items-center justify-center gap-2 bg-white text-[#2563eb] px-6 py-3 lg:px-8 lg:py-4 rounded-xl font-semibold hover:bg-blue-50 transition-colors shadow-lg flex-shrink-0"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Начать заполнение
          </button>
        </div>
      </div>

      <!-- Info Alert -->
      <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <div class="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
          <svg class="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p class="font-medium text-[#1e293b]">Автоформирование</p>
          <p class="text-sm text-[#64748b]">Годовая декларация формируется автоматически из принятых расчётов утилизационного сбора. Данные агрегируются по группам товаров за выбранный отчётный год.</p>
        </div>
      </div>

      <!-- Review result banners from shared store -->
      <div v-for="decl in storeDeclarations.filter(d => d.status === 'Отклонена' || d.status === 'На доработке')" :key="'banner-' + decl.id" class="mb-4">
        <div
          :class="[
            'rounded-xl p-4 flex items-start gap-3 border',
            decl.status === 'Отклонена' ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200'
          ]"
        >
          <div :class="['w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5', decl.status === 'Отклонена' ? 'bg-red-100' : 'bg-orange-100']">
            <svg v-if="decl.status === 'Отклонена'" class="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <svg v-else class="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div class="flex-1">
            <p :class="['text-sm font-semibold', decl.status === 'Отклонена' ? 'text-red-900' : 'text-orange-900']">
              {{ decl.number }} — {{ decl.status === 'Отклонена' ? 'Отклонена' : 'Возвращена на доработку' }}
              <span v-if="decl.reviewDate" class="font-normal">от {{ decl.reviewDate }}</span>
            </p>
            <p v-if="decl.reviewComment" :class="['text-xs mt-1', decl.status === 'Отклонена' ? 'text-red-700' : 'text-orange-700']">
              {{ decl.reviewComment }}
            </p>
          </div>
        </div>
      </div>

      <template v-if="isLoading">
        <div class="mb-6"><SkeletonLoader variant="card" /></div>
        <SkeletonLoader variant="table" />
      </template>

      <template v-if="!isLoading">
      <!-- Filters -->
      <div class="bg-white rounded-2xl p-4 shadow-sm border border-[#e2e8f0] mb-6">
        <div class="flex flex-wrap gap-4">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Поиск по номеру..."
            class="flex-1 min-w-[200px] px-4 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb]"
          />
          <select v-model="filterYear" class="px-4 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb]">
            <option value="">Все годы</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
          </select>
          <select v-model="filterStatus" class="px-4 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb]">
            <option value="">Все статусы</option>
            <option value="Черновик">Черновик</option>
            <option value="На рассмотрении">На рассмотрении</option>
            <option value="Одобрена">Одобрена</option>
            <option value="Отклонена">Отклонена</option>
            <option value="На доработке">На доработке</option>
          </select>
        </div>
      </div>

      <!-- Table -->
      <div class="mb-4">
        <h2 class="text-lg font-semibold text-[#1e293b] mb-4">История деклараций</h2>
      </div>

      <!-- Search no results state -->
      <div v-if="isFilteredEmpty" class="mb-6">
        <EmptyState
          :icon="'<svg class=&quot;w-10 h-10&quot; fill=&quot;none&quot; viewBox=&quot;0 0 40 40&quot; stroke=&quot;currentColor&quot; stroke-width=&quot;1.5&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; d=&quot;M35 35l-10-10m0 0A11.67 11.67 0 1025 25z&quot;/></svg>'"
          title="Ничего не найдено"
          description="Попробуйте изменить параметры поиска"
          actionLabel="Сбросить фильтры"
          @action="resetFilters"
        />
      </div>

      <DataTable v-if="!isFilteredEmpty" :columns="columns" :data="filteredDeclarations" :actions="true" :rowClass="getRowClass">
        <template #empty>
          <EmptyState
            :icon="'<svg class=&quot;w-10 h-10&quot; fill=&quot;none&quot; viewBox=&quot;0 0 40 40&quot; stroke=&quot;currentColor&quot; stroke-width=&quot;1.5&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; d=&quot;M5 11.67v16.66A3.33 3.33 0 008.33 31.67h23.34A3.33 3.33 0 0035 28.33V15A3.33 3.33 0 0031.67 11.67H20l-3.33-3.34H8.33A3.33 3.33 0 005 11.67z&quot;/></svg>'"
            title="Нет деклараций"
            description="Сформируйте годовую декларацию"
            actionLabel="Создать декларацию"
            @action="startWizard()"
          />
        </template>
        <template #cell-number="{ value, row }">
          <button class="font-mono font-medium text-[#2563eb] hover:underline cursor-pointer" @click="router.push({ path: '/business/declarations/' + row.id, query: { from: 'declarations' } })">{{ value }}</button>
        </template>
        <template #cell-year="{ value }">
          <span>{{ value }} год</span>
        </template>
        <template #cell-totalAmount="{ value }">
          <span class="font-medium">{{ value.toLocaleString() }} сом</span>
        </template>
        <template #cell-status="{ value }">
          <AppBadge :variant="getStatusBadgeVariant(value)">{{ value }}</AppBadge>
        </template>
        <template #actions="{ row }">
          <div class="act-wrap">
            <!-- На проверке: [Просмотреть] -->
            <template v-if="row.status === 'На проверке'">
              <router-link :to="{ path: '/business/declarations/' + row.id, query: { from: 'declarations' } }" class="act-btn act-btn--outline">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                Просмотреть
              </router-link>
            </template>
            <!-- Принята: [Просмотреть] [⋯ → PDF, Excel] -->
            <template v-else-if="row.status === 'Принята' || row.status === 'Подписана'">
              <router-link :to="{ path: '/business/declarations/' + row.id, query: { from: 'declarations' } }" class="act-btn act-btn--outline">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                Просмотреть
              </router-link>
              <div class="act-more-wrap">
                <button class="act-more" @click.stop="toggleMenu(row.id)">&#x22EF;</button>
                <div v-if="openMenuId === row.id" class="act-dropdown" @mouseleave="closeMenu">
                  <button class="act-dropdown__item" @click="handleDownloadPdf(row.id); closeMenu()">
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Скачать PDF
                  </button>
                  <button class="act-dropdown__item" @click="toastStore.show({ type: 'info', title: 'Excel', message: 'Экспорт декларации в Excel будет доступен в следующем обновлении' }); closeMenu()">
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    Скачать Excel
                  </button>
                </div>
              </div>
            </template>
            <!-- Отклонена: [Исправить (orange)] [Просмотреть] -->
            <template v-else-if="row.status === 'Отклонена'">
              <router-link :to="{ path: '/business/declarations/' + row.id, query: { from: 'declarations' } }" class="act-btn act-btn--filled act-btn--orange">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                Исправить
              </router-link>
              <router-link :to="{ path: '/business/declarations/' + row.id, query: { from: 'declarations' } }" class="act-btn act-btn--outline">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                Просмотреть
              </router-link>
            </template>
            <!-- Черновик: [Редактировать (green)] [Просмотреть] [⋯ → Удалить] -->
            <template v-else-if="row.status === 'Черновик'">
              <router-link :to="{ path: '/business/declarations/' + row.id, query: { from: 'declarations' } }" class="act-btn act-btn--filled act-btn--green">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                Редактировать
              </router-link>
              <router-link :to="{ path: '/business/declarations/' + row.id, query: { from: 'declarations' } }" class="act-btn act-btn--outline">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                Просмотреть
              </router-link>
              <div class="act-more-wrap">
                <button class="act-more" @click.stop="toggleMenu(row.id)">&#x22EF;</button>
                <div v-if="openMenuId === row.id" class="act-dropdown" @mouseleave="closeMenu">
                  <button class="act-dropdown__item act-dropdown__item--red" @click="deleteDeclaration(row.id); closeMenu()">
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    Удалить
                  </button>
                </div>
              </div>
            </template>
            <!-- Автосформирована: [Подписать (green)] [Просмотреть] -->
            <template v-else-if="row.status === 'Автосформирована'">
              <button @click="signDeclaration(row.id)" class="act-btn act-btn--filled act-btn--green">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Подписать
              </button>
              <router-link :to="{ path: '/business/declarations/' + row.id, query: { from: 'declarations' } }" class="act-btn act-btn--outline">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                Просмотреть
              </router-link>
            </template>
            <!-- Fallback -->
            <template v-else>
              <router-link :to="{ path: '/business/declarations/' + row.id, query: { from: 'declarations' } }" class="act-btn act-btn--outline">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                Просмотреть
              </router-link>
            </template>
          </div>
        </template>
      </DataTable>
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
          <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b]">Годовая декларация о товарах и упаковке</h1>
        </div>

        <!-- Progress Steps -->
        <div class="bg-white rounded-2xl p-4 lg:p-6 shadow-sm border border-[#e2e8f0] mb-6">
          <div class="flex items-center justify-between">
            <template v-for="(step, index) in steps" :key="step.number">
              <button
                @click="goToStep(step.number)"
                :class="['flex items-center gap-2 lg:gap-3', step.number <= currentStep ? 'cursor-pointer' : 'cursor-not-allowed']"
              >
                <div
                  :class="[
                    'w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center font-semibold text-sm lg:text-base transition-colors',
                    currentStep === step.number
                      ? 'bg-[#2563eb] text-white'
                      : currentStep > step.number
                        ? 'bg-green-500 text-white'
                        : 'bg-[#e2e8f0] text-[#64748b]'
                  ]"
                >
                  <svg v-if="currentStep > step.number" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span v-else>{{ step.number }}</span>
                </div>
                <span :class="['hidden sm:block text-sm lg:text-base font-medium', currentStep >= step.number ? 'text-[#1e293b]' : 'text-[#64748b]']">
                  {{ step.title }}
                </span>
              </button>
              <div
                v-if="index < steps.length - 1"
                :class="['flex-1 h-1 mx-2 lg:mx-4 rounded-full', currentStep > step.number ? 'bg-green-500' : 'bg-[#e2e8f0]']"
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
              <!-- Year -->
              <div>
                <label class="block text-sm font-medium text-[#1e293b] mb-2">Отчётный год *</label>
                <select
                  v-model="reportingYear"
                  class="w-full px-4 py-3 border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20"
                >
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                  <option value="2028">2028</option>
                  <option value="2029">2029</option>
                  <option value="2030">2030</option>
                </select>
              </div>

              <!-- Company Data -->
              <div class="bg-[#f8fafc] rounded-xl p-5 border border-[#e2e8f0]">
                <div class="flex items-center gap-2 mb-4">
                  <svg class="w-5 h-5 text-[#2563eb]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <h3 class="font-medium text-[#1e293b]">Данные компании (из профиля)</h3>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs text-[#64748b] mb-1">Наименование</label>
                    <input type="text" :value="companyData.name" readonly class="w-full px-3 py-2 bg-white border border-[#e2e8f0] rounded-lg text-[#1e293b] cursor-not-allowed" />
                  </div>
                  <div>
                    <label class="block text-xs text-[#64748b] mb-1">ИНН</label>
                    <input type="text" :value="companyData.inn" readonly class="w-full px-3 py-2 bg-white border border-[#e2e8f0] rounded-lg text-[#1e293b] cursor-not-allowed" />
                  </div>
                  <div class="sm:col-span-2">
                    <label class="block text-xs text-[#64748b] mb-1">Адрес</label>
                    <input type="text" :value="companyData.legalAddress" readonly class="w-full px-3 py-2 bg-white border border-[#e2e8f0] rounded-lg text-[#1e293b] cursor-not-allowed" />
                  </div>
                </div>
              </div>

              <!-- Calculations Info -->
              <div v-if="hasCalculations" class="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
                <div class="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p class="font-medium text-green-800">
                    Найдено {{ yearCalculations.length }} расчёт{{ yearCalculations.length === 1 ? '' : yearCalculations.length < 5 ? 'а' : 'ов' }} со статусом Принято/Оплачено за {{ reportingYear }} год
                  </p>
                  <p class="text-sm text-green-700 mt-1">
                    Общая сумма: {{ totalAmount.toLocaleString() }} сом. Общая масса: {{ totalMass.toFixed(1) }} тонн.
                  </p>
                </div>
              </div>

              <div v-else class="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
                <div class="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <p class="font-medium text-yellow-800">За выбранный год не найдено принятых расчётов</p>
                  <p class="text-sm text-yellow-700 mt-1">Сначала подайте расчёты утилизационного сбора в разделе «Расчёт утильсбора».</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 2: Aggregated Data -->
          <div v-if="currentStep === 2" class="p-6 lg:p-8">
            <h2 class="text-xl font-semibold text-[#1e293b] mb-1">Итоговые данные за {{ reportingYear }} год</h2>
            <p class="text-sm text-[#64748b] mb-6">Данные автоматически агрегированы из {{ yearCalculations.length }} принятых расчётов</p>

            <!-- Aggregated Table -->
            <div class="overflow-x-auto mb-6">
              <table class="w-full text-sm">
                <thead>
                  <tr class="text-left text-[#64748b] bg-[#f8fafc]">
                    <th class="px-3 py-3 font-medium">Группа товаров</th>
                    <th class="px-3 py-3 font-medium">Подгруппа</th>
                    <th class="px-3 py-3 font-medium">Код ГСКП / Материал</th>
                    <th class="px-3 py-3 font-medium">Код ТН ВЭД / ТР ТС</th>
                    <th class="px-3 py-3 font-medium">Наименование</th>
                    <th class="px-3 py-3 font-medium text-right">Масса (т)</th>
                    <th class="px-3 py-3 font-medium text-right">Ставка (сом/т)</th>
                    <th class="px-3 py-3 font-medium text-right">Сумма (сом)</th>
                    <th class="px-3 py-3 font-medium text-right">Оплачено (сом)</th>
                    <th class="px-3 py-3 font-medium text-right">Остаток (сом)</th>
                  </tr>
                </thead>
                <tbody class="text-[#1e293b]">
                  <tr v-for="item in aggregatedItems" :key="item.group + item.subgroup" class="border-t border-[#e2e8f0]">
                    <td class="px-3 py-3 text-xs">{{ item.groupLabel }}</td>
                    <td class="px-3 py-3 text-xs">{{ item.subgroupLabel }}</td>
                    <template v-if="!isPackagingGroup(item.group)">
                      <td class="px-3 py-3 font-mono text-xs">{{ getSubgroupData(item.group, item.subgroup)?.gskpCode || '—' }}</td>
                      <td class="px-3 py-3 font-mono text-xs">{{ getSubgroupData(item.group, item.subgroup)?.tnvedCode || item.tnvedCode }}</td>
                      <td class="px-3 py-3 text-xs">{{ getSubgroupData(item.group, item.subgroup)?.tnvedName || '—' }}</td>
                    </template>
                    <template v-else>
                      <td class="px-3 py-3 text-xs">{{ getSubgroupData(item.group, item.subgroup)?.packagingMaterial || '—' }}</td>
                      <td class="px-3 py-3 font-mono text-xs">{{ getSubgroupData(item.group, item.subgroup)?.packagingLetterCode || '—' }}</td>
                      <td class="px-3 py-3 font-mono text-xs">{{ getSubgroupData(item.group, item.subgroup)?.packagingDigitalCode || '—' }}</td>
                    </template>
                    <td class="px-3 py-3 text-right font-medium">{{ item.mass.toFixed(1) }}</td>
                    <td class="px-3 py-3 text-right">{{ item.rate.toLocaleString() }}</td>
                    <td class="px-3 py-3 text-right font-medium">{{ item.amount.toLocaleString() }}</td>
                    <td class="px-3 py-3 text-right text-green-600">{{ item.paidAmount.toLocaleString() }}</td>
                    <td class="px-3 py-3 text-right" :class="item.amount - item.paidAmount > 0 ? 'text-red-600 font-medium' : 'text-[#64748b]'">
                      {{ (item.amount - item.paidAmount).toLocaleString() }}
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr class="border-t-2 border-[#1e293b] font-semibold bg-[#f8fafc]">
                    <td colspan="5" class="px-3 py-3">ИТОГО</td>
                    <td class="px-3 py-3 text-right">{{ totalMass.toFixed(1) }}</td>
                    <td class="px-3 py-3"></td>
                    <td class="px-3 py-3 text-right">{{ totalAmount.toLocaleString() }}</td>
                    <td class="px-3 py-3 text-right text-green-600">{{ totalPaid.toLocaleString() }}</td>
                    <td class="px-3 py-3 text-right" :class="totalDebt > 0 ? 'text-red-600' : 'text-[#64748b]'">{{ totalDebt.toLocaleString() }}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <!-- Details Accordion -->
            <div class="border border-[#e2e8f0] rounded-xl overflow-hidden mb-6">
              <button
                @click="showDetails = !showDetails"
                class="w-full flex items-center justify-between px-4 py-3 bg-[#f8fafc] hover:bg-[#f1f5f9] transition-colors"
              >
                <span class="font-medium text-[#1e293b] text-sm">Детализация по расчётам ({{ yearCalculations.length }})</span>
                <svg :class="['w-5 h-5 text-[#64748b] transition-transform', showDetails ? 'rotate-180' : '']" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div v-if="showDetails" class="p-4">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="text-left text-[#64748b]">
                      <th class="pb-2 font-medium">Номер расчёта</th>
                      <th class="pb-2 font-medium">Период</th>
                      <th class="pb-2 font-medium">Дата</th>
                      <th class="pb-2 font-medium text-right">Сумма (сом)</th>
                      <th class="pb-2 font-medium">Статус оплаты</th>
                    </tr>
                  </thead>
                  <tbody class="text-[#1e293b]">
                    <tr v-for="calc in yearCalculations" :key="calc.id" class="border-t border-[#e2e8f0]">
                      <td class="py-2 font-mono text-[#2563eb] font-medium">{{ calc.number }}</td>
                      <td class="py-2">{{ calc.period }}</td>
                      <td class="py-2">{{ calc.date }}</td>
                      <td class="py-2 text-right font-medium">{{ calc.totalAmount.toLocaleString() }}</td>
                      <td class="py-2">
                        <AppBadge :variant="calc.status === 'Оплачено' ? 'success' : 'warning'">
                          {{ calc.status === 'Оплачено' ? 'Оплачено' : 'Не оплачено' }}
                        </AppBadge>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Summary Cards -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border border-green-200">
                <p class="text-sm text-green-700 mb-1">Общая масса за год</p>
                <p class="text-2xl font-bold text-green-800">{{ totalMass.toFixed(1) }} т</p>
              </div>
              <div class="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-5 border border-orange-200">
                <p class="text-sm text-orange-700 mb-1">Начислено утильсбора</p>
                <p class="text-2xl font-bold text-orange-800">{{ totalAmount.toLocaleString() }} сом</p>
              </div>
              <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
                <p class="text-sm text-blue-700 mb-1">Оплачено</p>
                <p class="text-2xl font-bold text-blue-800">{{ totalPaid.toLocaleString() }} сом</p>
                <p v-if="totalDebt > 0" class="text-sm font-semibold text-red-600 mt-1">Задолженность: {{ totalDebt.toLocaleString() }} сом</p>
              </div>
            </div>

            <!-- Recycling Reports Integration -->
            <div v-if="yearReports.length > 0" class="bg-green-50 border border-green-200 rounded-xl p-5 mt-6">
              <div class="flex items-center gap-2 mb-4">
                <svg class="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <h3 class="font-medium text-green-800">Данные о переработке (из принятых отчётов: {{ yearReports.length }})</h3>
              </div>
              <div class="space-y-2">
                <div v-for="item in aggregatedItems" :key="'proc_' + item.group + item.subgroup" class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-sm py-1 border-b border-green-200 last:border-0">
                  <span class="text-green-900 font-medium">{{ item.groupLabel }}</span>
                  <div class="flex items-center gap-4 text-xs sm:text-sm">
                    <span class="text-[#64748b]">Задекл.: {{ item.mass.toFixed(1) }} т</span>
                    <span class="text-green-700 font-medium">Перераб.: {{ (processedByGroup.get(item.group) || 0).toFixed(1) }} т</span>
                    <span :class="[(processedByGroup.get(item.group) || 0) >= item.mass ? 'text-green-600' : 'text-orange-600', 'font-medium']">
                      {{ item.mass > 0 ? (((processedByGroup.get(item.group) || 0) / item.mass) * 100).toFixed(0) : 0 }}%
                    </span>
                  </div>
                </div>
              </div>
              <div class="mt-3 pt-3 border-t border-green-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 font-medium">
                <span class="text-green-900">Итого переработано</span>
                <span class="text-green-700">{{ totalProcessed.toFixed(1) }} т из {{ totalMass.toFixed(1) }} т ({{ totalMass > 0 ? ((totalProcessed / totalMass) * 100).toFixed(1) : 0 }}%)</span>
              </div>
            </div>

            <div v-else class="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mt-6 flex items-start gap-3">
              <svg class="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="text-sm text-yellow-800">Принятых отчётов о переработке за {{ reportingYear }} год пока нет. Данные о переработке будут отображены после принятия отчётов.</p>
            </div>
          </div>

          <!-- Step 3: Review & Submit -->
          <div v-if="currentStep === 3" class="p-6 lg:p-8">
            <h2 class="text-xl font-semibold text-[#1e293b] mb-6">Проверка и отправка</h2>

            <div class="space-y-6">
              <!-- Summary -->
              <div class="bg-[#f8fafc] rounded-xl p-5 border border-[#e2e8f0]">
                <h3 class="font-medium text-[#1e293b] mb-4 flex items-center gap-2">
                  <svg class="w-5 h-5 text-[#2563eb]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Сводная информация
                </h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
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
                  <div>
                    <span class="text-[#64748b]">Количество расчётов:</span>
                    <p class="font-medium text-[#1e293b]">{{ yearCalculations.length }}</p>
                  </div>
                  <div>
                    <span class="text-[#64748b]">Общая масса:</span>
                    <p class="font-medium text-[#1e293b]">{{ totalMass.toFixed(2) }} тонн</p>
                  </div>
                  <div>
                    <span class="text-[#64748b]">Общая сумма:</span>
                    <p class="font-medium text-[#1e293b]">{{ totalAmount.toLocaleString() }} сом</p>
                  </div>
                  <div>
                    <span class="text-[#64748b]">Оплачено:</span>
                    <p class="font-medium text-green-600">{{ totalPaid.toLocaleString() }} сом</p>
                  </div>
                  <div v-if="totalDebt > 0">
                    <span class="text-[#64748b]">Остаток:</span>
                    <p class="font-medium text-red-600">{{ totalDebt.toLocaleString() }} сом</p>
                  </div>
                </div>
              </div>

              <!-- Attached Documents -->
              <div class="bg-[#f8fafc] rounded-xl p-5 border border-[#e2e8f0]">
                <h3 class="font-medium text-[#1e293b] mb-3 flex items-center gap-2">
                  <svg class="w-5 h-5 text-[#2563eb]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  Прикреплённые документы
                </h3>
                <p class="text-xs text-[#64748b] mb-3">Прикрепите подтверждающие документы (акты, договоры, счета). PDF, JPG, PNG до 10 МБ.</p>

                <!-- File list -->
                <div v-if="attachedDocs.length > 0" class="space-y-2 mb-3">
                  <div v-for="doc in attachedDocs" :key="doc.id" class="flex items-center justify-between px-3 py-2 bg-white rounded-lg border border-[#e2e8f0]">
                    <div class="flex items-center gap-2">
                      <svg class="w-4 h-4 text-[#64748b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <span class="text-sm text-[#1e293b]">{{ doc.name }}</span>
                      <span class="text-xs text-[#94a3b8]">{{ doc.size }}</span>
                    </div>
                    <button @click="removeDoc(doc.id)" class="p-1 text-[#94a3b8] hover:text-red-500 transition-colors">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <!-- Upload button -->
                <label class="inline-flex items-center gap-2 px-4 py-2 border border-dashed border-[#94a3b8] rounded-lg text-sm text-[#64748b] hover:border-[#2563eb] hover:text-[#2563eb] cursor-pointer transition-colors">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Добавить файл
                  <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" class="hidden" @change="handleDocUpload" />
                </label>
              </div>

              <!-- ECP (Digital Signature) -->
              <div class="rounded-xl p-5 border" :class="signedWithEcp ? 'bg-green-50 border-green-200' : 'bg-[#f8fafc] border-[#e2e8f0]'">
                <h3 class="font-medium text-[#1e293b] mb-3 flex items-center gap-2">
                  <svg class="w-5 h-5" :class="signedWithEcp ? 'text-green-600' : 'text-[#64748b]'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Электронная цифровая подпись (ЭЦП)
                </h3>

                <div v-if="!signedWithEcp">
                  <p class="text-sm text-[#64748b] mb-3">Для отправки декларации необходимо подписать её электронной цифровой подписью.</p>
                  <button
                    @click="simulateEcp"
                    class="flex items-center gap-2 px-4 py-2.5 bg-[#2563eb] text-white rounded-lg text-sm font-medium hover:bg-[#1d4ed8] transition-colors"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Подписать ЭЦП
                  </button>
                </div>

                <div v-else class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <svg class="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p class="font-medium text-green-800">Документ подписан ЭЦП</p>
                    <p class="text-xs text-green-600">Сертификат: CN={{ companyData.name }}, ИНН={{ companyData.inn }}</p>
                  </div>
                </div>
              </div>

              <!-- Confirmation Checkbox -->
              <label class="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  v-model="confirmData"
                  class="mt-1 w-5 h-5 rounded border-[#e2e8f0] text-[#2563eb] focus:ring-[#2563eb]/20"
                />
                <span class="text-sm text-[#1e293b]">Подтверждаю достоверность предоставленных данных и соответствие их первичным документам</span>
              </label>
            </div>
          </div>

          <!-- Navigation Buttons -->
          <div class="px-6 lg:px-8 py-4 bg-[#f8fafc] border-t border-[#e2e8f0] flex flex-col-reverse sm:flex-row justify-between gap-3 sm:gap-4 sticky bottom-0 z-10 rounded-b-2xl">
            <AppButton
              v-if="currentStep > 1"
              variant="secondary"
              @click="prevStep"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              Назад
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
                Сохранить черновик
              </AppButton>

              <button
                v-if="currentStep < 3"
                @click="nextStep"
                :disabled="currentStep === 1 && !canProceedStep1"
                class="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#2563eb] text-white rounded-lg font-medium hover:bg-[#1d4ed8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Далее
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
                Отправить декларацию
              </AppButton>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- SUCCESS VIEW -->
    <template v-else-if="viewMode === 'success'">
      <div ref="printAreaRef" class="max-w-2xl mx-auto text-center py-12">
        <div class="w-24 h-24 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
          <svg class="w-12 h-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b] mb-4">Декларация успешно отправлена!</h1>

        <div class="bg-white rounded-2xl p-6 shadow-sm border border-[#e2e8f0] mb-8">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <p class="text-sm text-[#64748b] mb-1">Номер декларации</p>
              <p class="text-lg font-bold text-[#2563eb] font-mono">{{ submittedDeclaration.number }}</p>
            </div>
            <div>
              <p class="text-sm text-[#64748b] mb-1">Дата подачи</p>
              <p class="text-lg font-bold text-[#1e293b]">{{ submittedDeclaration.date }}</p>
            </div>
            <div>
              <p class="text-sm text-[#64748b] mb-1">Статус</p>
              <AppBadge variant="warning">На проверке</AppBadge>
            </div>
          </div>
        </div>

        <p class="text-[#64748b] mb-8">
          Ваша годовая декларация принята и направлена на проверку.<br />
          Вы получите уведомление о результате проверки.
        </p>

        <div class="flex flex-col sm:flex-row justify-center gap-4">
          <button @click="printPage" class="flex items-center justify-center gap-2 px-6 py-3 border border-[#e2e8f0] rounded-xl text-[#1e293b] hover:bg-[#f8fafc] transition-colors">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Скачать PDF
          </button>
          <button
            @click="backToList"
            class="flex items-center justify-center gap-2 px-6 py-3 bg-[#2563eb] text-white rounded-xl font-medium hover:bg-[#1d4ed8] transition-colors"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            Вернуться к списку
          </button>
        </div>
      </div>
    </template>
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

/* ── Row status stripes (Variant 6) ── */
:deep(.row-green) { border-left: 4px solid #22c55e !important; }
:deep(.row-yellow) { border-left: 4px solid #f59e0b !important; }
:deep(.row-red) { border-left: 4px solid #ef4444 !important; background: #fffbeb !important; }
:deep(.row-gray) { border-left: 4px solid #d1d5db !important; }
:deep(.row-blue) { border-left: 4px solid #3b82f6 !important; }

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
.act-btn--green { background: #22c55e; }
.act-btn--green:hover { background: #16a34a; box-shadow: 0 2px 8px rgba(34,197,94,0.25); }
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
.act-dropdown__item--red {
  color: #ef4444;
}
.act-dropdown__item--red:hover {
  background: #fef2f2;
}
</style>
