<script setup lang="ts">
import { ref, computed } from 'vue'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import DataTable from '../../components/dashboard/DataTable.vue'
import { icons } from '../../utils/menuIcons'
import { productGroups, productSubgroups, getSubgroupData, isPackagingGroup } from '../../data/product-groups'
import { calculationStore } from '../../stores/calculations'

const menuItems = [
  { id: 'dashboard', label: 'Главная', icon: icons.dashboard, route: '/business' },
  { id: 'calculator', label: 'Расчёт утильсбора', icon: icons.calculator, route: '/business/calculator' },
  { id: 'reports', label: 'Отчёты о переработке', icon: icons.report, route: '/business/reports' },
  { id: 'declarations', label: 'Декларации', icon: icons.document, route: '/business/declarations' },
  { id: 'payments', label: 'Платежи', icon: icons.payment, route: '/business/payments' },
  { id: 'documents', label: 'Документы', icon: icons.folder, route: '/business/documents' },
  { id: 'normatives', label: 'Нормативы и ставки', icon: icons.registries, route: '/business/normatives' },
  { id: 'profile', label: 'Профиль компании', icon: icons.building, route: '/business/profile' },
]

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
  inn: '01234567890123',
  address: 'г. Бишкек, ул. Московская, 123',
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
      const itemAmount = mass * item.rate
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

// Step 3
const confirmData = ref(false)
const showDetails = ref(false)

// Navigation
const nextStep = () => { if (currentStep.value < totalSteps) currentStep.value++ }
const prevStep = () => { if (currentStep.value > 1) currentStep.value-- }
const goToStep = (step: number) => { if (step <= currentStep.value) currentStep.value = step }

// Submission
const submittedDeclaration = ref({ number: '', date: '' })

const submitDeclaration = () => {
  const now = new Date()
  const num = String(Math.floor(Math.random() * 900) + 100)
  const decl = {
    id: declarations.value.length + 2,
    number: `ДК-${now.getFullYear()}-${num}`,
    year: reportingYear.value,
    calcCount: yearCalculations.value.length,
    totalAmount: totalAmount.value,
    submittedAt: now.toLocaleDateString('ru-RU'),
    status: 'На проверке',
  }
  declarations.value.unshift(decl)
  submittedDeclaration.value = { number: decl.number, date: decl.submittedAt }
  viewMode.value = 'success'
}

const saveDraft = () => {
  const now = new Date()
  const num = String(Math.floor(Math.random() * 900) + 100)
  declarations.value.unshift({
    id: declarations.value.length + 2,
    number: `ДК-${now.getFullYear()}-${num}`,
    year: reportingYear.value,
    calcCount: yearCalculations.value.length,
    totalAmount: totalAmount.value,
    submittedAt: now.toLocaleDateString('ru-RU'),
    status: 'Черновик',
  })
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

const declarations = ref([
  {
    id: 1,
    number: 'ДК-2026-089',
    year: '2025',
    calcCount: 2,
    totalAmount: 83950,
    submittedAt: '15.01.2026',
    status: 'Принята',
  },
])

const getStatusClass = (status: string) => {
  switch (status) {
    case 'На проверке': return 'bg-yellow-100 text-yellow-800'
    case 'Принята': return 'bg-green-100 text-green-800'
    case 'Отклонена': return 'bg-red-100 text-red-800'
    case 'Черновик': return 'bg-gray-100 text-gray-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

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
</script>

<template>
  <DashboardLayout
    role="business"
    roleTitle="Бизнес"
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
            <option value="На проверке">На проверке</option>
            <option value="Принята">Принята</option>
            <option value="Отклонена">Отклонена</option>
          </select>
        </div>
      </div>

      <!-- Table -->
      <div class="mb-4">
        <h2 class="text-lg font-semibold text-[#1e293b] mb-4">История деклараций</h2>
      </div>

      <DataTable :columns="columns" :data="filteredDeclarations" :actions="true">
        <template #cell-number="{ value }">
          <span class="font-mono font-medium text-[#2563eb]">{{ value }}</span>
        </template>
        <template #cell-year="{ value }">
          <span>{{ value }} год</span>
        </template>
        <template #cell-totalAmount="{ value }">
          <span class="font-medium">{{ value.toLocaleString() }} сом</span>
        </template>
        <template #cell-status="{ value }">
          <span :class="['px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap', getStatusClass(value)]">
            {{ value }}
          </span>
        </template>
        <template #actions>
          <div class="flex items-center justify-end gap-2">
            <button class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#3B82F6] text-white hover:bg-[#2563EB] transition-colors shadow-sm">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Просмотреть
            </button>
            <button class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#8B5CF6] text-white hover:bg-[#7C3AED] transition-colors shadow-sm">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Скачать PDF
            </button>
          </div>
        </template>
      </DataTable>
    </template>

    <!-- WIZARD VIEW -->
    <template v-else-if="viewMode === 'wizard'">
      <div class="max-w-4xl mx-auto">
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
        <div class="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] overflow-hidden">

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
                    <input type="text" :value="companyData.address" readonly class="w-full px-3 py-2 bg-white border border-[#e2e8f0] rounded-lg text-[#1e293b] cursor-not-allowed" />
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
                        <span :class="[
                          'px-2 py-0.5 rounded-full text-xs font-medium',
                          calc.status === 'Оплачено' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        ]">
                          {{ calc.status === 'Оплачено' ? 'Оплачено' : 'Не оплачено' }}
                        </span>
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

              <!-- Checkbox -->
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
          <div class="px-6 lg:px-8 py-4 bg-[#f8fafc] border-t border-[#e2e8f0] flex flex-col sm:flex-row justify-between gap-4">
            <button
              v-if="currentStep > 1"
              @click="prevStep"
              class="flex items-center justify-center gap-2 px-5 py-2.5 border border-[#e2e8f0] rounded-lg text-[#64748b] hover:bg-white transition-colors"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              Назад
            </button>
            <div v-else></div>

            <div class="flex flex-col sm:flex-row gap-3">
              <button
                v-if="currentStep === 3"
                @click="saveDraft"
                class="flex items-center justify-center gap-2 px-5 py-2.5 border border-[#e2e8f0] rounded-lg text-[#64748b] hover:bg-white transition-colors"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Сохранить черновик
              </button>

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

              <button
                v-if="currentStep === 3"
                @click="submitDeclaration"
                :disabled="!confirmData"
                class="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#10b981] text-white rounded-lg font-medium hover:bg-[#059669] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Отправить декларацию
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
              <span class="inline-block px-4 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                На проверке
              </span>
            </div>
          </div>
        </div>

        <p class="text-[#64748b] mb-8">
          Ваша годовая декларация принята и направлена на проверку.<br />
          Вы получите уведомление о результате проверки.
        </p>

        <div class="flex flex-col sm:flex-row justify-center gap-4">
          <button class="flex items-center justify-center gap-2 px-6 py-3 border border-[#e2e8f0] rounded-xl text-[#1e293b] hover:bg-[#f8fafc] transition-colors">
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
