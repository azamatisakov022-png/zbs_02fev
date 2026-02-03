<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import DataTable from '../../components/dashboard/DataTable.vue'
import { icons } from '../../utils/menuIcons'

const menuItems = [
  { id: 'dashboard', label: 'Главная', icon: icons.dashboard, route: '/business' },
  { id: 'reports', label: 'Отчёты', icon: icons.report, route: '/business/reports' },
  { id: 'declarations', label: 'Декларации', icon: icons.document, route: '/business/declarations' },
  { id: 'calculator', label: 'Расчёт утильсбора', icon: icons.calculator, route: '/business/calculator' },
  { id: 'payments', label: 'Платежи', icon: icons.payment, route: '/business/payments' },
  { id: 'documents', label: 'Документы', icon: icons.folder, route: '/business/documents' },
  { id: 'normatives', label: 'Нормативы переработки', icon: icons.registries, route: '/business/normatives' },
  { id: 'recyclers', label: 'Переработчики отходов', icon: icons.recycle, route: '/business/recyclers' },
  { id: 'profile', label: 'Профиль компании', icon: icons.building, route: '/business/profile' },
]

// View state
type ViewMode = 'list' | 'wizard' | 'result'
const viewMode = ref<ViewMode>('list')
const currentStep = ref(1)
const totalSteps = 3

const steps = [
  { number: 1, title: 'Период и данные' },
  { number: 2, title: 'Товары и упаковка' },
  { number: 3, title: 'Результат расчёта' },
]

// Form data - Step 1
const calculationQuarter = ref('')
const calculationYear = ref('2025')

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
interface ProductItem {
  id: number
  group: string
  subgroup: string
  tnvedCode: string
  mass: string
  rate: number
  amount: number
}

const productItems = ref<ProductItem[]>([
  { id: 1, group: '', subgroup: '', tnvedCode: '', mass: '', rate: 0, amount: 0 }
])

const productGroups = [
  { value: 'plastic', label: 'Пластик и изделия из пластика', code: '39', baseRate: 3500 },
  { value: 'paper', label: 'Бумага и картон', code: '48', baseRate: 1200 },
  { value: 'glass', label: 'Стекло и стеклянные изделия', code: '70', baseRate: 800 },
  { value: 'metal', label: 'Металлы и изделия из них', code: '72-83', baseRate: 2500 },
  { value: 'textile', label: 'Текстиль и текстильные изделия', code: '50-63', baseRate: 2000 },
  { value: 'electronics', label: 'Электроника и электрооборудование', code: '85', baseRate: 5000 },
  { value: 'tires', label: 'Шины и покрышки', code: '40', baseRate: 4500 },
  { value: 'batteries', label: 'Батареи и аккумуляторы', code: '85.06', baseRate: 8000 },
]

const productSubgroups: Record<string, Array<{ value: string; label: string; code: string; rateMultiplier: number }>> = {
  plastic: [
    { value: 'bottles', label: 'Бутылки ПЭТ', code: '3923.30', rateMultiplier: 1.0 },
    { value: 'packaging', label: 'Упаковочная плёнка', code: '3920.10', rateMultiplier: 1.2 },
    { value: 'containers', label: 'Контейнеры и тара', code: '3923.10', rateMultiplier: 0.9 },
  ],
  paper: [
    { value: 'cardboard', label: 'Гофрокартон', code: '4819.10', rateMultiplier: 1.0 },
    { value: 'paper_packaging', label: 'Бумажная упаковка', code: '4819.20', rateMultiplier: 1.1 },
    { value: 'labels', label: 'Этикетки', code: '4821.10', rateMultiplier: 0.8 },
  ],
  glass: [
    { value: 'bottles_glass', label: 'Стеклянные бутылки', code: '7010.90', rateMultiplier: 1.0 },
    { value: 'jars', label: 'Банки стеклянные', code: '7010.90', rateMultiplier: 0.9 },
  ],
  metal: [
    { value: 'cans_alu', label: 'Алюминиевые банки', code: '7612.90', rateMultiplier: 1.2 },
    { value: 'cans_steel', label: 'Жестяные банки', code: '7310.21', rateMultiplier: 1.0 },
    { value: 'foil', label: 'Фольга', code: '7607.11', rateMultiplier: 1.1 },
  ],
  textile: [
    { value: 'clothing', label: 'Одежда', code: '6201-6211', rateMultiplier: 1.0 },
    { value: 'fabric', label: 'Ткани', code: '5208-5212', rateMultiplier: 0.8 },
  ],
  electronics: [
    { value: 'phones', label: 'Телефоны', code: '8517.12', rateMultiplier: 1.5 },
    { value: 'computers', label: 'Компьютеры', code: '8471.30', rateMultiplier: 1.3 },
    { value: 'appliances', label: 'Бытовая техника', code: '8509', rateMultiplier: 1.0 },
  ],
  tires: [
    { value: 'car_tires', label: 'Автомобильные шины', code: '4011.10', rateMultiplier: 1.0 },
    { value: 'truck_tires', label: 'Грузовые шины', code: '4011.20', rateMultiplier: 1.2 },
  ],
  batteries: [
    { value: 'li_ion', label: 'Литий-ионные', code: '8506.50', rateMultiplier: 1.5 },
    { value: 'lead_acid', label: 'Свинцово-кислотные', code: '8507.10', rateMultiplier: 1.0 },
    { value: 'alkaline', label: 'Щелочные батарейки', code: '8506.10', rateMultiplier: 0.8 },
  ],
}

let nextProductId = 2

const addProductItem = () => {
  productItems.value.push({
    id: nextProductId++,
    group: '',
    subgroup: '',
    tnvedCode: '',
    mass: '',
    rate: 0,
    amount: 0
  })
}

const removeProductItem = (id: number) => {
  if (productItems.value.length > 1) {
    productItems.value = productItems.value.filter(item => item.id !== id)
  }
}

const updateItemRate = (item: ProductItem) => {
  const group = productGroups.find(g => g.value === item.group)
  if (!group) {
    item.rate = 0
    item.amount = 0
    return
  }

  let multiplier = 1
  if (item.subgroup) {
    const subgroups = productSubgroups[item.group]
    const sub = subgroups?.find(s => s.value === item.subgroup)
    if (sub) {
      item.tnvedCode = sub.code
      multiplier = sub.rateMultiplier
    }
  }

  item.rate = Math.round(group.baseRate * multiplier)
  calculateAmount(item)
}

const calculateAmount = (item: ProductItem) => {
  const mass = parseFloat(item.mass) || 0
  item.amount = Math.round(mass * item.rate)
}

const getSubgroupsForGroup = (group: string) => {
  return productSubgroups[group] || []
}

// Import from declaration mock
const importFromDeclaration = () => {
  productItems.value = [
    { id: nextProductId++, group: 'plastic', subgroup: 'bottles', tnvedCode: '3923.30', mass: '12.5', rate: 3500, amount: 43750 },
    { id: nextProductId++, group: 'paper', subgroup: 'cardboard', tnvedCode: '4819.10', mass: '8.3', rate: 1200, amount: 9960 },
    { id: nextProductId++, group: 'glass', subgroup: 'bottles_glass', tnvedCode: '7010.90', mass: '5.2', rate: 800, amount: 4160 },
  ]
}

// Computed
const canProceedStep1 = computed(() => {
  return calculationQuarter.value && calculationYear.value
})

const canProceedStep2 = computed(() => {
  return productItems.value.some(item => item.group && item.mass && parseFloat(item.mass) > 0)
})

const totalMass = computed(() => {
  return productItems.value
    .reduce((sum, item) => sum + (parseFloat(item.mass) || 0), 0)
    .toFixed(2)
})

const totalAmount = computed(() => {
  return productItems.value.reduce((sum, item) => sum + item.amount, 0)
})

const formattedTotalAmount = computed(() => {
  return totalAmount.value.toLocaleString('ru-RU') + ' сом'
})

const getGroupLabel = (value: string) => {
  return productGroups.find(g => g.value === value)?.label || value
}

const getSubgroupLabel = (group: string, subgroup: string) => {
  return productSubgroups[group]?.find(s => s.value === subgroup)?.label || subgroup
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

// Result
const calculationResult = ref({
  number: '',
  date: '',
  dueDate: ''
})

const performCalculation = () => {
  const now = new Date()
  const num = String(Math.floor(Math.random() * 900) + 100)
  const dueDate = new Date(now)
  dueDate.setDate(dueDate.getDate() + 30)

  calculationResult.value = {
    number: `РС-${now.getFullYear()}-${num}`,
    date: now.toLocaleDateString('ru-RU'),
    dueDate: dueDate.toLocaleDateString('ru-RU')
  }
  currentStep.value = 3
}

const saveCalculation = () => {
  viewMode.value = 'result'
}

const startWizard = () => {
  currentStep.value = 1
  viewMode.value = 'wizard'
}

const backToList = () => {
  viewMode.value = 'list'
  // Reset form
  currentStep.value = 1
  calculationQuarter.value = ''
  productItems.value = [{ id: 1, group: '', subgroup: '', tnvedCode: '', mass: '', rate: 0, amount: 0 }]
}

const goToPayment = () => {
  alert('Переход к оплате')
}

const createDeclaration = () => {
  alert('Создание декларации на основе расчёта')
}

// Watch for changes in mass to recalculate
watch(productItems, () => {
  productItems.value.forEach(item => {
    if (item.group && item.mass) {
      calculateAmount(item)
    }
  })
}, { deep: true })

// Table data for history
const columns = [
  { key: 'number', label: 'Номер', width: '120px' },
  { key: 'period', label: 'Период', width: '130px' },
  { key: 'amount', label: 'Сумма', width: '150px' },
  { key: 'createdAt', label: 'Дата расчёта', width: '130px' },
  { key: 'status', label: 'Статус', width: '140px' },
]

const calculations = ref([
  { id: 1, number: 'РС-2025-015', period: 'Q4 2024', amount: '45 200 сом', createdAt: '18.01.2025', status: 'Оплачен' },
  { id: 2, number: 'РС-2024-089', period: 'Q3 2024', amount: '38 750 сом', createdAt: '12.10.2024', status: 'Оплачен' },
  { id: 3, number: 'РС-2024-056', period: 'Q2 2024', amount: '41 300 сом', createdAt: '08.07.2024', status: 'Оплачен' },
  { id: 4, number: 'РС-2024-023', period: 'Q1 2024', amount: '35 800 сом', createdAt: '15.04.2024', status: 'Оплачен' },
])

const getStatusClass = (status: string) => {
  switch (status) {
    case 'Оплачен': return 'bg-green-100 text-green-800'
    case 'Ожидает оплаты': return 'bg-yellow-100 text-yellow-800'
    case 'Просрочен': return 'bg-red-100 text-red-800'
    case 'Черновик': return 'bg-gray-100 text-gray-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}
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
        <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b] mb-2">Расчёт утилизационного сбора</h1>
        <p class="text-[#64748b]">Расчёт суммы утилизационного сбора за товары и упаковку</p>
      </div>

      <!-- CTA Banner -->
      <div class="mb-6 bg-gradient-to-r from-[#f59e0b] to-[#d97706] rounded-2xl p-6 lg:p-8 text-white relative overflow-hidden">
        <div class="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div class="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        <div class="relative flex flex-col lg:flex-row lg:items-center gap-6">
          <div class="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <svg class="w-8 h-8 lg:w-10 lg:h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div class="flex-1">
            <h2 class="text-xl lg:text-2xl font-bold mb-2">Рассчитать утилизационный сбор</h2>
            <p class="text-white/80 text-sm lg:text-base">Узнайте сумму утилизационного сбора на основе массы товаров и упаковки. Ставки применяются автоматически согласно категории товара.</p>
          </div>
          <button
            @click="startWizard"
            class="flex items-center justify-center gap-2 bg-white text-[#f59e0b] px-6 py-3 lg:px-8 lg:py-4 rounded-xl font-semibold hover:bg-amber-50 transition-colors shadow-lg flex-shrink-0"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Начать расчёт
          </button>
        </div>
      </div>

      <!-- Info Alert -->
      <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <div class="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
          <svg class="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p class="font-medium text-[#1e293b]">Информация о расчёте</p>
          <p class="text-sm text-[#64748b]">Утилизационный сбор рассчитывается на основе массы товаров и упаковки по ставкам, установленным Правительством КР. После расчёта вы можете сразу перейти к оплате или создать декларацию.</p>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
          <p class="text-sm text-[#64748b] mb-1">Всего расчётов</p>
          <p class="text-2xl font-bold text-[#1e293b]">12</p>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
          <p class="text-sm text-[#64748b] mb-1">Оплачено за год</p>
          <p class="text-2xl font-bold text-[#10b981]">161 050 сом</p>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
          <p class="text-sm text-[#64748b] mb-1">К оплате</p>
          <p class="text-2xl font-bold text-[#f59e0b]">0 сом</p>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
          <p class="text-sm text-[#64748b] mb-1">Последний расчёт</p>
          <p class="text-2xl font-bold text-[#2563eb]">Q4 2024</p>
        </div>
      </div>

      <!-- Rates Info -->
      <div class="bg-white rounded-2xl p-5 shadow-sm border border-[#e2e8f0] mb-6">
        <h3 class="font-semibold text-[#1e293b] mb-4 flex items-center gap-2">
          <svg class="w-5 h-5 text-[#f59e0b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Актуальные ставки утилизационного сбора (сом/тонна)
        </h3>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div v-for="group in productGroups" :key="group.value" class="bg-[#f8fafc] rounded-lg p-3">
            <p class="text-xs text-[#64748b] mb-1">{{ group.label }}</p>
            <p class="font-bold text-[#1e293b]">{{ group.baseRate.toLocaleString() }} сом</p>
          </div>
        </div>
      </div>

      <!-- History Table -->
      <div class="mb-4">
        <h2 class="text-lg font-semibold text-[#1e293b] mb-4">История расчётов</h2>
      </div>

      <DataTable :columns="columns" :data="calculations" :actions="true">
        <template #cell-number="{ value }">
          <span class="font-mono font-medium text-[#2563eb]">{{ value }}</span>
        </template>
        <template #cell-amount="{ value }">
          <span class="font-semibold text-[#1e293b]">{{ value }}</span>
        </template>
        <template #cell-status="{ value }">
          <span :class="['px-3 py-1 rounded-full text-xs font-medium', getStatusClass(value)]">
            {{ value }}
          </span>
        </template>
        <template #actions="{ row }">
          <div class="flex items-center justify-end gap-2">
            <button
              class="p-2 text-[#2563eb] hover:bg-blue-50 rounded-lg transition-colors"
              title="Просмотреть"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
            <button
              class="p-2 text-[#64748b] hover:bg-gray-100 rounded-lg transition-colors"
              title="Скачать PDF"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
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
          <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b]">Расчёт утилизационного сбора</h1>
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
                      ? 'bg-[#f59e0b] text-white'
                      : currentStep > step.number
                        ? 'bg-[#f59e0b] text-white'
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
                  currentStep > step.number ? 'bg-[#f59e0b]' : 'bg-[#e2e8f0]'
                ]"
              ></div>
            </template>
          </div>
        </div>

        <!-- Step Content -->
        <div class="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] overflow-hidden">
          <!-- Step 1: Basic Data -->
          <div v-if="currentStep === 1" class="p-6 lg:p-8">
            <h2 class="text-xl font-semibold text-[#1e293b] mb-6">Период и данные плательщика</h2>

            <div class="space-y-6">
              <!-- Calculation Period -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-[#1e293b] mb-2">Расчётный период *</label>
                  <select
                    v-model="calculationQuarter"
                    class="w-full px-4 py-3 border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#f59e0b] focus:ring-2 focus:ring-[#f59e0b]/20"
                  >
                    <option value="">Выберите квартал</option>
                    <option value="Q1">I квартал</option>
                    <option value="Q2">II квартал</option>
                    <option value="Q3">III квартал</option>
                    <option value="Q4">IV квартал</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-[#1e293b] mb-2">Год *</label>
                  <select
                    v-model="calculationYear"
                    class="w-full px-4 py-3 border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#f59e0b] focus:ring-2 focus:ring-[#f59e0b]/20"
                  >
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                  </select>
                </div>
              </div>

              <!-- Company Data -->
              <div class="bg-[#f8fafc] rounded-xl p-5 border border-[#e2e8f0]">
                <div class="flex items-center gap-2 mb-4">
                  <svg class="w-5 h-5 text-[#f59e0b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <h3 class="font-medium text-[#1e293b]">Данные плательщика (из профиля)</h3>
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

              <!-- Info -->
              <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <div class="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p class="font-medium text-[#1e293b]">Срок уплаты</p>
                  <p class="text-sm text-[#64748b]">Утилизационный сбор уплачивается ежеквартально не позднее 20-го числа месяца, следующего за отчётным кварталом</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 2: Products -->
          <div v-if="currentStep === 2" class="p-6 lg:p-8">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 class="text-xl font-semibold text-[#1e293b]">Товары и упаковка</h2>
              <button
                @click="importFromDeclaration"
                class="flex items-center gap-2 text-[#f59e0b] hover:bg-amber-50 px-4 py-2 rounded-lg transition-colors"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Импорт из декларации
              </button>
            </div>

            <div class="space-y-4">
              <div
                v-for="(item, index) in productItems"
                :key="item.id"
                class="bg-[#f8fafc] rounded-xl p-4 border border-[#e2e8f0]"
              >
                <div class="flex items-center justify-between mb-4">
                  <span class="text-sm font-medium text-[#64748b]">Позиция {{ index + 1 }}</span>
                  <button
                    v-if="productItems.length > 1"
                    @click="removeProductItem(item.id)"
                    class="text-red-500 hover:bg-red-50 p-1 rounded transition-colors"
                  >
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                  <div class="lg:col-span-2">
                    <label class="block text-xs text-[#64748b] mb-1">Группа товара</label>
                    <select
                      v-model="item.group"
                      @change="item.subgroup = ''; item.tnvedCode = ''; updateItemRate(item)"
                      class="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#f59e0b] text-sm"
                    >
                      <option value="">Выберите группу</option>
                      <option v-for="group in productGroups" :key="group.value" :value="group.value">
                        {{ group.label }}
                      </option>
                    </select>
                  </div>
                  <div class="lg:col-span-2">
                    <label class="block text-xs text-[#64748b] mb-1">Подгруппа</label>
                    <select
                      v-model="item.subgroup"
                      @change="updateItemRate(item)"
                      :disabled="!item.group"
                      class="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#f59e0b] text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">Выберите подгруппу</option>
                      <option v-for="sub in getSubgroupsForGroup(item.group)" :key="sub.value" :value="sub.value">
                        {{ sub.label }}
                      </option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-xs text-[#64748b] mb-1">Код ТН ВЭД</label>
                    <input
                      type="text"
                      v-model="item.tnvedCode"
                      readonly
                      placeholder="Авто"
                      class="w-full px-3 py-2 bg-gray-50 border border-[#e2e8f0] rounded-lg text-sm cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label class="block text-xs text-[#64748b] mb-1">Масса (тонн)</label>
                    <input
                      type="number"
                      v-model="item.mass"
                      @input="calculateAmount(item)"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      class="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#f59e0b] text-sm"
                    />
                  </div>
                </div>

                <!-- Rate and Amount Row -->
                <div v-if="item.group" class="mt-3 pt-3 border-t border-[#e2e8f0] flex flex-wrap items-center gap-4 text-sm">
                  <div class="flex items-center gap-2">
                    <span class="text-[#64748b]">Ставка:</span>
                    <span class="font-medium text-[#1e293b]">{{ item.rate.toLocaleString() }} сом/т</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-[#64748b]">Сумма:</span>
                    <span class="font-bold text-[#f59e0b]">{{ item.amount.toLocaleString() }} сом</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              @click="addProductItem"
              class="mt-4 flex items-center gap-2 text-[#f59e0b] hover:bg-amber-50 px-4 py-2 rounded-lg transition-colors"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Добавить позицию
            </button>

            <!-- Summary -->
            <div class="mt-6 pt-4 border-t border-[#e2e8f0]">
              <div class="bg-gradient-to-r from-[#f59e0b]/10 to-[#d97706]/10 rounded-xl p-5 border border-[#f59e0b]/20">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <p class="text-sm text-[#64748b] mb-1">Общая масса</p>
                    <p class="text-xl font-bold text-[#1e293b]">{{ totalMass }} тонн</p>
                  </div>
                  <div class="text-right">
                    <p class="text-sm text-[#64748b] mb-1">Итого к оплате</p>
                    <p class="text-2xl font-bold text-[#f59e0b]">{{ formattedTotalAmount }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 3: Result -->
          <div v-if="currentStep === 3" class="p-6 lg:p-8">
            <h2 class="text-xl font-semibold text-[#1e293b] mb-6">Результат расчёта</h2>

            <!-- Calculation Info -->
            <div class="bg-[#f8fafc] rounded-xl p-5 border border-[#e2e8f0] mb-6">
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <p class="text-sm text-[#64748b] mb-1">Номер расчёта</p>
                  <p class="font-bold text-[#1e293b] font-mono">{{ calculationResult.number }}</p>
                </div>
                <div>
                  <p class="text-sm text-[#64748b] mb-1">Дата расчёта</p>
                  <p class="font-bold text-[#1e293b]">{{ calculationResult.date }}</p>
                </div>
                <div>
                  <p class="text-sm text-[#64748b] mb-1">Срок оплаты</p>
                  <p class="font-bold text-[#f59e0b]">{{ calculationResult.dueDate }}</p>
                </div>
              </div>
            </div>

            <!-- Amount Card -->
            <div class="bg-gradient-to-r from-[#f59e0b] to-[#d97706] rounded-2xl p-6 text-white mb-6">
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p class="text-white/80 mb-1">Сумма утилизационного сбора</p>
                  <p class="text-3xl lg:text-4xl font-bold">{{ formattedTotalAmount }}</p>
                </div>
                <div class="flex items-center gap-2">
                  <span class="px-4 py-2 bg-white/20 rounded-lg text-sm font-medium">
                    {{ calculationQuarter }} {{ calculationYear }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Breakdown -->
            <div class="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden mb-6">
              <div class="px-5 py-4 border-b border-[#e2e8f0]">
                <h3 class="font-semibold text-[#1e293b]">Детализация расчёта</h3>
              </div>
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead class="bg-[#f8fafc]">
                    <tr class="text-left text-[#64748b]">
                      <th class="px-5 py-3 font-medium">Категория</th>
                      <th class="px-5 py-3 font-medium">Подкатегория</th>
                      <th class="px-5 py-3 font-medium text-right">Масса (т)</th>
                      <th class="px-5 py-3 font-medium text-right">Ставка (сом/т)</th>
                      <th class="px-5 py-3 font-medium text-right">Сумма (сом)</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-[#e2e8f0]">
                    <tr v-for="item in productItems.filter(i => i.group && i.mass)" :key="item.id" class="hover:bg-[#f8fafc]">
                      <td class="px-5 py-3 text-[#1e293b]">{{ getGroupLabel(item.group) }}</td>
                      <td class="px-5 py-3 text-[#64748b]">{{ getSubgroupLabel(item.group, item.subgroup) }}</td>
                      <td class="px-5 py-3 text-right font-medium">{{ item.mass }}</td>
                      <td class="px-5 py-3 text-right">{{ item.rate.toLocaleString() }}</td>
                      <td class="px-5 py-3 text-right font-bold text-[#f59e0b]">{{ item.amount.toLocaleString() }}</td>
                    </tr>
                  </tbody>
                  <tfoot class="bg-[#f8fafc] font-semibold">
                    <tr>
                      <td colspan="2" class="px-5 py-3">Итого</td>
                      <td class="px-5 py-3 text-right">{{ totalMass }}</td>
                      <td class="px-5 py-3 text-right">—</td>
                      <td class="px-5 py-3 text-right text-[#f59e0b]">{{ totalAmount.toLocaleString() }}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <!-- Payment Info -->
            <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
              <div class="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div>
                <p class="font-medium text-[#1e293b]">Реквизиты для оплаты</p>
                <p class="text-sm text-[#64748b]">Получатель: Государственный экологический фонд КР<br/>ИНН: 00000000000000 | Р/с: 1234567890123456 | Банк: НБКР</p>
              </div>
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
              <!-- Step 1 & 2: Next -->
              <button
                v-if="currentStep === 1"
                @click="nextStep"
                :disabled="!canProceedStep1"
                class="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#f59e0b] text-white rounded-lg font-medium hover:bg-[#d97706] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Далее
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <button
                v-if="currentStep === 2"
                @click="performCalculation"
                :disabled="!canProceedStep2"
                class="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#f59e0b] text-white rounded-lg font-medium hover:bg-[#d97706] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Рассчитать
              </button>

              <!-- Step 3: Actions -->
              <template v-if="currentStep === 3">
                <button
                  @click="createDeclaration"
                  class="flex items-center justify-center gap-2 px-5 py-2.5 border border-[#e2e8f0] rounded-lg text-[#64748b] hover:bg-white transition-colors"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Создать декларацию
                </button>

                <button
                  @click="saveCalculation"
                  class="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#f59e0b] text-white rounded-lg font-medium hover:bg-[#d97706] transition-colors"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  Сохранить расчёт
                </button>

                <button
                  @click="goToPayment"
                  class="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#10b981] text-white rounded-lg font-medium hover:bg-[#059669] transition-colors"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Перейти к оплате
                </button>
              </template>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- RESULT VIEW (After Save) -->
    <template v-else-if="viewMode === 'result'">
      <div class="max-w-2xl mx-auto text-center py-12">
        <div class="w-24 h-24 mx-auto mb-6 rounded-full bg-amber-100 flex items-center justify-center">
          <svg class="w-12 h-12 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b] mb-4">Расчёт сохранён!</h1>

        <div class="bg-white rounded-2xl p-6 shadow-sm border border-[#e2e8f0] mb-8">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <p class="text-sm text-[#64748b] mb-1">Номер расчёта</p>
              <p class="text-lg font-bold text-[#f59e0b] font-mono">{{ calculationResult.number }}</p>
            </div>
            <div>
              <p class="text-sm text-[#64748b] mb-1">Сумма к оплате</p>
              <p class="text-lg font-bold text-[#1e293b]">{{ formattedTotalAmount }}</p>
            </div>
            <div>
              <p class="text-sm text-[#64748b] mb-1">Срок оплаты</p>
              <p class="text-lg font-bold text-[#f59e0b]">{{ calculationResult.dueDate }}</p>
            </div>
          </div>
        </div>

        <p class="text-[#64748b] mb-8">
          Расчёт утилизационного сбора сохранён.<br/>
          Вы можете оплатить сбор онлайн или скачать квитанцию для оплаты в банке.
        </p>

        <div class="flex flex-col sm:flex-row justify-center gap-4">
          <button class="flex items-center justify-center gap-2 px-6 py-3 border border-[#e2e8f0] rounded-xl text-[#1e293b] hover:bg-[#f8fafc] transition-colors">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Скачать квитанцию
          </button>
          <button
            @click="goToPayment"
            class="flex items-center justify-center gap-2 px-6 py-3 bg-[#10b981] text-white rounded-xl font-medium hover:bg-[#059669] transition-colors"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Оплатить онлайн
          </button>
          <button
            @click="backToList"
            class="flex items-center justify-center gap-2 px-6 py-3 bg-[#f59e0b] text-white rounded-xl font-medium hover:bg-[#d97706] transition-colors"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            К списку расчётов
          </button>
        </div>
      </div>
    </template>
  </DashboardLayout>
</template>
