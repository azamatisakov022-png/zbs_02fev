<script setup lang="ts">
import { ref, computed } from 'vue'
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
type ViewMode = 'list' | 'wizard' | 'success'
const viewMode = ref<ViewMode>('list')
const currentStep = ref(1)
const totalSteps = 4

const steps = [
  { number: 1, title: 'Основные данные' },
  { number: 2, title: 'Товары и упаковка' },
  { number: 3, title: 'Документы' },
  { number: 4, title: 'Проверка и отправка' },
]

// Form data - Step 1
const declarationType = ref('')
const declarationTypes = [
  { value: 'goods_packaging', label: 'Декларация о товарах и упаковке' },
  { value: 'import', label: 'Декларация об импорте товаров' },
  { value: 'production', label: 'Декларация о производстве товаров' },
]
const reportingQuarter = ref('')
const reportingYear = ref('2025')

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
}

const productItems = ref<ProductItem[]>([
  { id: 1, group: '', subgroup: '', tnvedCode: '', mass: '' }
])

const productGroups = [
  { value: 'plastic', label: 'Пластик и изделия из пластика', code: '39' },
  { value: 'paper', label: 'Бумага и картон', code: '48' },
  { value: 'glass', label: 'Стекло и стеклянные изделия', code: '70' },
  { value: 'metal', label: 'Металлы и изделия из них', code: '72-83' },
  { value: 'textile', label: 'Текстиль и текстильные изделия', code: '50-63' },
  { value: 'electronics', label: 'Электроника и электрооборудование', code: '85' },
]

const productSubgroups: Record<string, Array<{ value: string; label: string; code: string }>> = {
  plastic: [
    { value: 'bottles', label: 'Бутылки ПЭТ', code: '3923.30' },
    { value: 'packaging', label: 'Упаковочная плёнка', code: '3920.10' },
    { value: 'containers', label: 'Контейнеры и тара', code: '3923.10' },
  ],
  paper: [
    { value: 'cardboard', label: 'Гофрокартон', code: '4819.10' },
    { value: 'paper_packaging', label: 'Бумажная упаковка', code: '4819.20' },
    { value: 'labels', label: 'Этикетки', code: '4821.10' },
  ],
  glass: [
    { value: 'bottles_glass', label: 'Стеклянные бутылки', code: '7010.90' },
    { value: 'jars', label: 'Банки стеклянные', code: '7010.90' },
  ],
  metal: [
    { value: 'cans', label: 'Алюминиевые банки', code: '7612.90' },
    { value: 'steel_cans', label: 'Жестяные банки', code: '7310.21' },
  ],
  textile: [
    { value: 'clothing', label: 'Одежда', code: '6201-6211' },
    { value: 'fabric', label: 'Ткани', code: '5208-5212' },
  ],
  electronics: [
    { value: 'phones', label: 'Телефоны', code: '8517.12' },
    { value: 'computers', label: 'Компьютеры', code: '8471.30' },
    { value: 'appliances', label: 'Бытовая техника', code: '8509' },
  ],
}

let nextProductId = 2

const addProductItem = () => {
  productItems.value.push({
    id: nextProductId++,
    group: '',
    subgroup: '',
    tnvedCode: '',
    mass: ''
  })
}

const removeProductItem = (id: number) => {
  if (productItems.value.length > 1) {
    productItems.value = productItems.value.filter(item => item.id !== id)
  }
}

const updateTnvedCode = (item: ProductItem) => {
  if (item.subgroup && item.group) {
    const subgroups = productSubgroups[item.group]
    const found = subgroups?.find(s => s.value === item.subgroup)
    if (found) {
      item.tnvedCode = found.code
    }
  }
}

const getSubgroupsForGroup = (group: string) => {
  return productSubgroups[group] || []
}

// Import from calculation mock
const importFromCalculation = () => {
  productItems.value = [
    { id: nextProductId++, group: 'plastic', subgroup: 'bottles', tnvedCode: '3923.30', mass: '12.5' },
    { id: nextProductId++, group: 'paper', subgroup: 'cardboard', tnvedCode: '4819.10', mass: '8.3' },
    { id: nextProductId++, group: 'glass', subgroup: 'bottles_glass', tnvedCode: '7010.90', mass: '5.2' },
  ]
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
const submittedDeclaration = ref({
  number: '',
  date: ''
})

const submitDeclaration = () => {
  // Generate declaration number
  const now = new Date()
  const num = String(Math.floor(Math.random() * 900) + 100)
  submittedDeclaration.value = {
    number: `ДК-${now.getFullYear()}-${num}`,
    date: now.toLocaleDateString('ru-RU')
  }
  viewMode.value = 'success'
}

const saveDraft = () => {
  alert('Черновик сохранён')
}

const startWizard = () => {
  currentStep.value = 1
  viewMode.value = 'wizard'
}

const backToList = () => {
  viewMode.value = 'list'
  // Reset form
  currentStep.value = 1
  declarationType.value = ''
  reportingQuarter.value = ''
  productItems.value = [{ id: 1, group: '', subgroup: '', tnvedCode: '', mass: '' }]
  uploadedFiles.value = []
}

// Computed
const canProceedStep1 = computed(() => {
  return declarationType.value && reportingQuarter.value && reportingYear.value
})

const canProceedStep2 = computed(() => {
  return productItems.value.some(item => item.group && item.mass)
})

const totalMass = computed(() => {
  return productItems.value
    .reduce((sum, item) => sum + (parseFloat(item.mass) || 0), 0)
    .toFixed(2)
})

const getGroupLabel = (value: string) => {
  return productGroups.find(g => g.value === value)?.label || value
}

const getSubgroupLabel = (group: string, subgroup: string) => {
  return productSubgroups[group]?.find(s => s.value === subgroup)?.label || subgroup
}

const getDeclarationTypeLabel = (value: string) => {
  return declarationTypes.find(t => t.value === value)?.label || value
}

// Table data
const columns = [
  { key: 'number', label: 'Номер', width: '120px' },
  { key: 'type', label: 'Тип декларации' },
  { key: 'period', label: 'Период', width: '130px' },
  { key: 'submittedAt', label: 'Дата подачи', width: '130px' },
  { key: 'status', label: 'Статус', width: '140px' },
]

const declarations = ref([
  { id: 1, number: 'ДК-2025-045', type: 'Декларация о товарах и упаковке', period: 'Q4 2024', submittedAt: '20.01.2025', status: 'Принята' },
  { id: 2, number: 'ДК-2024-198', type: 'Декларация о товарах и упаковке', period: 'Q3 2024', submittedAt: '15.10.2024', status: 'Принята' },
  { id: 3, number: 'ДК-2024-134', type: 'Декларация о товарах и упаковке', period: 'Q2 2024', submittedAt: '12.07.2024', status: 'Принята' },
  { id: 4, number: 'ДК-2024-067', type: 'Декларация о товарах и упаковке', period: 'Q1 2024', submittedAt: '18.04.2024', status: 'Принята' },
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
        <p class="text-[#64748b]">Декларации о товарах и упаковке</p>
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
            <h2 class="text-xl lg:text-2xl font-bold mb-2">Подать новую декларацию</h2>
            <p class="text-white/80 text-sm lg:text-base">Заполните и отправьте декларацию о товарах и упаковке. Часть данных заполняется автоматически из профиля компании.</p>
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
          <p class="font-medium text-[#1e293b]">Автозаполнение</p>
          <p class="text-sm text-[#64748b]">При создании новой декларации данные компании (название, ИНН, адрес) заполняются автоматически из профиля. Вы также можете импортировать данные из ранее сделанного расчёта утилизационного сбора.</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-2xl p-4 shadow-sm border border-[#e2e8f0] mb-6">
        <div class="flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Поиск по номеру..."
            class="flex-1 min-w-[200px] px-4 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb]"
          />
          <select class="px-4 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb]">
            <option value="">Все периоды</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>
          <select class="px-4 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb]">
            <option value="">Все статусы</option>
            <option value="pending">На проверке</option>
            <option value="accepted">Принята</option>
            <option value="rejected">Отклонена</option>
          </select>
        </div>
      </div>

      <!-- Table -->
      <div class="mb-4">
        <h2 class="text-lg font-semibold text-[#1e293b] mb-4">История деклараций</h2>
      </div>

      <DataTable :columns="columns" :data="declarations" :actions="true">
        <template #cell-number="{ value }">
          <span class="font-mono font-medium text-[#2563eb]">{{ value }}</span>
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
          <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b]">Подача декларации</h1>
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
                  currentStep > step.number ? 'bg-green-500' : 'bg-[#e2e8f0]'
                ]"
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
              <!-- Declaration Type -->
              <div>
                <label class="block text-sm font-medium text-[#1e293b] mb-2">Тип декларации *</label>
                <select
                  v-model="declarationType"
                  class="w-full px-4 py-3 border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20"
                >
                  <option value="">Выберите тип декларации</option>
                  <option v-for="type in declarationTypes" :key="type.value" :value="type.value">
                    {{ type.label }}
                  </option>
                </select>
              </div>

              <!-- Reporting Period -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-[#1e293b] mb-2">Отчётный период *</label>
                  <select
                    v-model="reportingQuarter"
                    class="w-full px-4 py-3 border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20"
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
                    v-model="reportingYear"
                    class="w-full px-4 py-3 border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20"
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
                  <svg class="w-5 h-5 text-[#2563eb]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            </div>
          </div>

          <!-- Step 2: Products -->
          <div v-if="currentStep === 2" class="p-6 lg:p-8">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 class="text-xl font-semibold text-[#1e293b]">Товары и упаковка</h2>
              <button
                @click="importFromCalculation"
                class="flex items-center gap-2 text-[#2563eb] hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Импорт из расчёта утильсбора
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
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label class="block text-xs text-[#64748b] mb-1">Группа товара</label>
                    <select
                      v-model="item.group"
                      @change="item.subgroup = ''; item.tnvedCode = ''"
                      class="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb] text-sm"
                    >
                      <option value="">Выберите группу</option>
                      <option v-for="group in productGroups" :key="group.value" :value="group.value">
                        {{ group.label }}
                      </option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-xs text-[#64748b] mb-1">Подгруппа</label>
                    <select
                      v-model="item.subgroup"
                      @change="updateTnvedCode(item)"
                      :disabled="!item.group"
                      class="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb] text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      class="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb] text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              @click="addProductItem"
              class="mt-4 flex items-center gap-2 text-[#2563eb] hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Добавить позицию
            </button>

            <div class="mt-6 pt-4 border-t border-[#e2e8f0] flex justify-end">
              <div class="text-right">
                <span class="text-sm text-[#64748b]">Общая масса:</span>
                <span class="ml-2 text-lg font-bold text-[#1e293b]">{{ totalMass }} тонн</span>
              </div>
            </div>
          </div>

          <!-- Step 3: Documents -->
          <div v-if="currentStep === 3" class="p-6 lg:p-8">
            <h2 class="text-xl font-semibold text-[#1e293b] mb-6">Подтверждающие документы</h2>

            <!-- Drop Zone -->
            <div
              @dragover.prevent="isDragging = true"
              @dragleave="isDragging = false"
              @drop.prevent="handleDrop"
              :class="[
                'border-2 border-dashed rounded-xl p-8 text-center transition-colors',
                isDragging ? 'border-[#2563eb] bg-blue-50' : 'border-[#e2e8f0] hover:border-[#2563eb]'
              ]"
            >
              <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-[#f1f5f9] flex items-center justify-center">
                <svg class="w-8 h-8 text-[#64748b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p class="text-[#1e293b] font-medium mb-2">Перетащите файлы сюда</p>
              <p class="text-sm text-[#64748b] mb-4">или</p>
              <label class="inline-flex items-center gap-2 bg-[#2563eb] text-white px-5 py-2.5 rounded-lg font-medium hover:bg-[#1d4ed8] transition-colors cursor-pointer">
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
                    <div class="w-10 h-10 rounded-lg bg-[#2563eb]/10 flex items-center justify-center">
                      <svg class="w-5 h-5 text-[#2563eb]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

            <div class="space-y-6">
              <!-- Basic Data Summary -->
              <div class="bg-[#f8fafc] rounded-xl p-5 border border-[#e2e8f0]">
                <h3 class="font-medium text-[#1e293b] mb-4 flex items-center gap-2">
                  <svg class="w-5 h-5 text-[#2563eb]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Основные данные
                </h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span class="text-[#64748b]">Тип декларации:</span>
                    <p class="font-medium text-[#1e293b]">{{ getDeclarationTypeLabel(declarationType) }}</p>
                  </div>
                  <div>
                    <span class="text-[#64748b]">Отчётный период:</span>
                    <p class="font-medium text-[#1e293b]">{{ reportingQuarter }} {{ reportingYear }}</p>
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

              <!-- Products Summary -->
              <div class="bg-[#f8fafc] rounded-xl p-5 border border-[#e2e8f0]">
                <h3 class="font-medium text-[#1e293b] mb-4 flex items-center gap-2">
                  <svg class="w-5 h-5 text-[#2563eb]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  Товары и упаковка
                </h3>
                <div class="overflow-x-auto">
                  <table class="w-full text-sm">
                    <thead>
                      <tr class="text-left text-[#64748b]">
                        <th class="pb-2">Группа</th>
                        <th class="pb-2">Подгруппа</th>
                        <th class="pb-2">Код ТН ВЭД</th>
                        <th class="pb-2 text-right">Масса (т)</th>
                      </tr>
                    </thead>
                    <tbody class="text-[#1e293b]">
                      <tr v-for="item in productItems.filter(i => i.group)" :key="item.id" class="border-t border-[#e2e8f0]">
                        <td class="py-2">{{ getGroupLabel(item.group) }}</td>
                        <td class="py-2">{{ getSubgroupLabel(item.group, item.subgroup) }}</td>
                        <td class="py-2 font-mono">{{ item.tnvedCode }}</td>
                        <td class="py-2 text-right font-medium">{{ item.mass }}</td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr class="border-t-2 border-[#e2e8f0] font-semibold">
                        <td colspan="3" class="pt-2">Итого:</td>
                        <td class="pt-2 text-right">{{ totalMass }} т</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <!-- Documents Summary -->
              <div class="bg-[#f8fafc] rounded-xl p-5 border border-[#e2e8f0]">
                <h3 class="font-medium text-[#1e293b] mb-4 flex items-center gap-2">
                  <svg class="w-5 h-5 text-[#2563eb]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                v-if="currentStep === 4"
                @click="saveDraft"
                class="flex items-center justify-center gap-2 px-5 py-2.5 border border-[#e2e8f0] rounded-lg text-[#64748b] hover:bg-white transition-colors"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Сохранить черновик
              </button>

              <button
                v-if="currentStep < 4"
                @click="nextStep"
                :disabled="(currentStep === 1 && !canProceedStep1) || (currentStep === 2 && !canProceedStep2)"
                class="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#2563eb] text-white rounded-lg font-medium hover:bg-[#1d4ed8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Далее
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <button
                v-if="currentStep === 4"
                @click="submitDeclaration"
                class="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#10b981] text-white rounded-lg font-medium hover:bg-[#059669] transition-colors"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
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
          Ваша декларация принята и направлена на проверку.<br/>
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
