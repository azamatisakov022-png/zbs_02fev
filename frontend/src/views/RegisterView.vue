<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { productGroups } from '../data/product-groups'
import { toastStore } from '../stores/toast'

const router = useRouter()

// Registration mode: 'choose' = initial screen, 'esi' = simplified after ESI, 'manual' = existing wizard
const registrationMode = ref<'choose' | 'esi' | 'manual'>('choose')
const isEsiLoading = ref(false)

// ESI mock data
const esiData = {
  inn: '02301200510234',
  shortName: 'ОсОО "ЭкоИмпорт Бишкек"',
  directorFullName: 'Асанов Бакыт Жумабекович',
  legalAddress: 'г. Бишкек, ул. Московская, 187',
  phone: '+996 312 90-12-34',
  email: 'info@ecoimport.kg',
}

// ESI simplified form
const esiForm = reactive({
  activityType: '',
  wasteCategories: [] as string[],
  recyclerCapacities: [] as { wasteType: string, capacityTons: number }[],
  confirmData: false,
})

interface WasteCategory {
  value: string
  label: string
}

interface WasteGroup {
  id: string
  letter: string
  title: string
  items: WasteCategory[]
}

const wasteGroups: WasteGroup[] = [
  {
    id: 'a',
    letter: 'А',
    title: 'Упаковка',
    items: [
      { value: 'a1', label: '1. Упаковка из пластмасс (ПЭТ, полиэтилен, полипропилен)' },
      { value: 'a2', label: '2. Упаковка из бумаги и картона' },
      { value: 'a3', label: '3. Упаковка из комбинированных материалов (тетрапак)' },
      { value: 'a4', label: '4. Упаковка из стекла' },
      { value: 'a5', label: '5. Упаковка из металла (алюминий, жесть)' },
      { value: 'a6', label: '6. Упаковка из дерева' },
      { value: 'a7', label: '7. Пластиковые пакеты и мешки' },
    ],
  },
  {
    id: 'b',
    letter: 'Б',
    title: 'Автотранспортные товары',
    items: [
      { value: 'b8', label: '8. Шины и покрышки пневматические' },
      { value: 'b9', label: '9. Аккумуляторы свинцовые (автотранспорт)' },
      { value: 'b10', label: '10. Аккумуляторы для электромобилей' },
      { value: 'b11', label: '11. Масла моторные отработанные' },
      { value: 'b12', label: '12. Масла трансмиссионные и гидравлические' },
      { value: 'b13', label: '13. Фильтры масляные и топливные' },
      { value: 'b14', label: '14. Антифризы и тормозные жидкости' },
    ],
  },
  {
    id: 'v',
    letter: 'В',
    title: 'Электроника и электрооборудование',
    items: [
      { value: 'v15', label: '15. Крупногабаритное электрооборудование (холодильники, стиральные машины)' },
      { value: 'v16', label: '16. Среднегабаритное электрооборудование (микроволновки, пылесосы)' },
      { value: 'v17', label: '17. Мелкогабаритное электрооборудование (фены, утюги, тостеры)' },
      { value: 'v18', label: '18. IT и телекоммуникационное оборудование (компьютеры, телефоны, планшеты)' },
      { value: 'v19', label: '19. Элементы питания (батарейки)' },
      { value: 'v20', label: '20. Ртутьсодержащие изделия (лампы, термометры)' },
    ],
  },
  {
    id: 'g',
    letter: 'Г',
    title: 'Прочие товары',
    items: [
      { value: 'g21', label: '21. Текстиль и одежда' },
      { value: 'g22', label: '22. Мебель' },
      { value: 'g23', label: '23. Нефтепродукты и смазочные материалы' },
      { value: 'g24', label: '24. Строительные материалы и отходы' },
    ],
  },
]

const esiFormErrors = reactive<Record<string, string>>({})

const handleEsiLogin = async () => {
  isEsiLoading.value = true
  await new Promise(resolve => setTimeout(resolve, 2000))
  isEsiLoading.value = false
  registrationMode.value = 'esi'
}

const toggleWasteCategory = (value: string) => {
  const idx = esiForm.wasteCategories.indexOf(value)
  if (idx === -1) {
    esiForm.wasteCategories.push(value)
  } else {
    esiForm.wasteCategories.splice(idx, 1)
  }
}

const isGroupAllSelected = (group: WasteGroup): boolean => {
  return group.items.every(item => esiForm.wasteCategories.includes(item.value))
}

const toggleGroupAll = (group: WasteGroup) => {
  if (isGroupAllSelected(group)) {
    // Deselect all in group
    for (const item of group.items) {
      const idx = esiForm.wasteCategories.indexOf(item.value)
      if (idx !== -1) esiForm.wasteCategories.splice(idx, 1)
    }
  } else {
    // Select all in group
    for (const item of group.items) {
      if (!esiForm.wasteCategories.includes(item.value)) {
        esiForm.wasteCategories.push(item.value)
      }
    }
  }
}

const validateEsiForm = (): boolean => {
  esiFormErrors.activityType = ''
  esiFormErrors.wasteCategories = ''

  if (!esiForm.activityType) {
    esiFormErrors.activityType = 'Выберите вид деятельности'
  }
  if (esiForm.wasteCategories.length === 0) {
    esiFormErrors.wasteCategories = 'Выберите хотя бы одну категорию'
  }

  return !esiFormErrors.activityType && !esiFormErrors.wasteCategories
}

const isEsiSubmitting = ref(false)
const isEsiSuccess = ref(false)
const esiRegistrationNumber = ref('')

const submitEsiRegistration = async () => {
  if (!esiForm.confirmData) {
    toastStore.show({ type: 'warning', title: 'Подтвердите согласие', message: 'Подтвердите согласие с условиями' })
    return
  }
  if (!validateEsiForm()) return

  isEsiSubmitting.value = true
  await new Promise(resolve => setTimeout(resolve, 2000))

  const num = String(Math.floor(Math.random() * 9000) + 1000)
  esiRegistrationNumber.value = `РЕГ-2026-${num}`

  isEsiSubmitting.value = false
  isEsiSuccess.value = true
}

const startManualRegistration = () => {
  registrationMode.value = 'manual'
}

// ===== Existing 5-step wizard logic (unchanged) =====

const currentStep = ref(1)
const totalSteps = 5

const steps = [
  { number: 1, title: 'Тип организации' },
  { number: 2, title: 'Данные организации' },
  { number: 3, title: 'Руководитель и контакты' },
  { number: 4, title: 'Документы' },
  { number: 5, title: 'Проверка и отправка' },
]

const orgTypeGroups = [
  {
    label: 'Хозяйственные общества',
    options: [
      { value: 'osoo', label: 'ОсОО (Общество с ограниченной ответственностью)' },
      { value: 'oao', label: 'ОАО (Открытое акционерное общество)' },
      { value: 'zao', label: 'ЗАО (Закрытое акционерное общество)' },
      { value: 'odo', label: 'ОДО (Общество с дополнительной ответственностью)' },
    ],
  },
  {
    label: 'Государственные и муниципальные',
    options: [
      { value: 'gp', label: 'ГП (Государственное предприятие)' },
      { value: 'mp', label: 'МП (Муниципальное предприятие)' },
    ],
  },
  {
    label: 'Кооперативы и товарищества',
    options: [
      { value: 'pk', label: 'ПК (Производственный кооператив)' },
      { value: 'pt', label: 'Полное товарищество' },
      { value: 'kt', label: 'Коммандитное товарищество' },
    ],
  },
  {
    label: 'Некоммерческие',
    options: [
      { value: 'oo', label: 'ОО (Общественное объединение)' },
      { value: 'of', label: 'ОФ (Общественный фонд)' },
      { value: 'uchrezhdenie', label: 'Учреждение' },
    ],
  },
  {
    label: 'Индивидуальные',
    options: [
      { value: 'ip', label: 'ИП (Индивидуальный предприниматель)' },
      { value: 'kfh', label: 'КФХ (Крестьянское (фермерское) хозяйство)' },
    ],
  },
  {
    label: 'Иностранные',
    options: [
      { value: 'filial', label: 'Филиал иностранного юридического лица' },
      { value: 'predstavitelstvo', label: 'Представительство иностранного юридического лица' },
    ],
  },
]

const orgTypes = orgTypeGroups.flatMap(g => g.options)

const individualOrgTypes = ['ip', 'kfh']

const isIndividual = computed(() => individualOrgTypes.includes(formData.orgType))

const activityTypes = [
  { value: 'importer', label: 'Импортёр' },
  { value: 'producer', label: 'Производитель' },
  { value: 'both', label: 'Импортёр и Производитель' },
  { value: 'recycler', label: 'Переработчик отходов' },
]

const formData = reactive({
  orgType: '',
  activityType: '',
  shortName: '',
  fullName: '',
  inn: '',
  okpo: '',
  // Individual (ИП/КФХ) fields
  lastName: '',
  firstName: '',
  middleName: '',
  passportSeries: '',
  passportNumber: '',
  passportIssuedBy: '',
  passportDate: '',
  selectedProductGroups: [] as string[],
  recyclerCapacities: [] as { wasteType: string, capacityTons: number }[],
  productNote: '',
  legalRegion: '',
  legalCity: '',
  legalStreet: '',
  legalBuilding: '',
  sameAddress: false,
  actualRegion: '',
  actualCity: '',
  actualStreet: '',
  actualBuilding: '',
  phone: '+996 ',
  email: '',
  directorFullName: '',
  directorPosition: '',
  directorPhone: '+996 ',
  contactFullName: '',
  contactPosition: '',
  contactPhone: '+996 ',
  contactEmail: '',
  confirmData: false,
})

const regions = [
  'г. Бишкек',
  'г. Ош',
  'Чуйская область',
  'Ошская область',
  'Джалал-Абадская область',
  'Иссык-Кульская область',
  'Нарынская область',
  'Таласская область',
  'Баткенская область',
]

const errors = reactive<Record<string, string>>({})

const validateINN = (inn: string): boolean => {
  return /^\d{14}$/.test(inn)
}

const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

const validatePhone = (phone: string): boolean => {
  return /^\+996\s?\d{3}\s?\d{2,3}\s?\d{2,3}\s?\d{2,3}$/.test(phone.replace(/\s+/g, ' ').trim()) ||
         /^\+996\d{9}$/.test(phone.replace(/\s/g, ''))
}

const validateStep1 = (): boolean => {
  errors.orgType = ''
  errors.activityType = ''
  if (!formData.orgType) errors.orgType = 'Выберите тип организации'
  if (!formData.activityType) errors.activityType = 'Выберите вид деятельности'
  return !errors.orgType && !errors.activityType
}

const validateStep2 = (): boolean => {
  errors.shortName = ''
  errors.fullName = ''
  errors.inn = ''
  errors.legalRegion = ''
  errors.legalCity = ''
  errors.phone = ''
  errors.email = ''
  errors.lastName = ''
  errors.firstName = ''
  errors.passportSeries = ''
  errors.passportNumber = ''
  errors.selectedProductGroups = ''

  if (isIndividual.value) {
    if (!formData.lastName.trim()) errors.lastName = 'Введите фамилию'
    if (!formData.firstName.trim()) errors.firstName = 'Введите имя'
    if (!formData.passportSeries.trim()) errors.passportSeries = 'Введите серию паспорта'
    if (!formData.passportNumber.trim()) errors.passportNumber = 'Введите номер паспорта'
  } else {
    if (!formData.shortName.trim()) errors.shortName = 'Введите краткое наименование'
    if (!formData.fullName.trim()) errors.fullName = 'Введите полное наименование'
  }
  if (!formData.inn.trim()) {
    errors.inn = 'Введите ИНН'
  } else if (!validateINN(formData.inn)) {
    errors.inn = 'ИНН должен содержать 14 цифр'
  }
  if (!formData.legalRegion) errors.legalRegion = 'Выберите область/город'
  if (!formData.legalCity.trim()) errors.legalCity = 'Введите город/район'
  if (!formData.phone || formData.phone === '+996 ') {
    errors.phone = 'Введите номер телефона'
  } else if (!validatePhone(formData.phone)) {
    errors.phone = 'Неверный формат телефона'
  }
  if (!formData.email.trim()) {
    errors.email = 'Введите email'
  } else if (!validateEmail(formData.email)) {
    errors.email = 'Неверный формат email'
  }
  if (formData.selectedProductGroups.length === 0) {
    errors.selectedProductGroups = 'Выберите хотя бы одну группу товаров'
  }
  return Object.keys(errors).filter(k => errors[k]).length === 0
}

const validateStep3 = (): boolean => {
  errors.directorFullName = ''
  errors.directorPosition = ''
  errors.directorPhone = ''
  errors.contactFullName = ''
  errors.contactPhone = ''
  errors.contactEmail = ''

  if (!formData.directorFullName.trim()) errors.directorFullName = 'Введите ФИО руководителя'
  if (!formData.directorPosition.trim()) errors.directorPosition = 'Введите должность'
  if (!formData.directorPhone || formData.directorPhone === '+996 ') errors.directorPhone = 'Введите телефон руководителя'
  if (!formData.contactFullName.trim()) errors.contactFullName = 'Введите ФИО контактного лица'
  if (!formData.contactPhone || formData.contactPhone === '+996 ') errors.contactPhone = 'Введите телефон контактного лица'
  if (!formData.contactEmail.trim()) {
    errors.contactEmail = 'Введите email контактного лица'
  } else if (!validateEmail(formData.contactEmail)) {
    errors.contactEmail = 'Неверный формат email'
  }
  return !errors.directorFullName && !errors.directorPosition && !errors.directorPhone &&
         !errors.contactFullName && !errors.contactPhone && !errors.contactEmail
}

interface UploadedFile {
  id: number
  name: string
  size: string
  type: string
  category: 'certificate' | 'extract' | 'license' | 'proxy'
  required: boolean
}

const uploadedFiles = ref<UploadedFile[]>([])
const isDragging = ref(false)
const activeUploadCategory = ref<UploadedFile['category']>('certificate')
let nextFileId = 1

const fileCategories = [
  { value: 'certificate', label: 'Свидетельство о регистрации', required: true },
  { value: 'extract', label: 'Выписка из реестра', required: false },
  { value: 'license', label: 'Лицензия (если есть)', required: false },
  { value: 'proxy', label: 'Доверенность (если регистрирует не руководитель)', required: false },
]

const handleDrop = (e: DragEvent) => {
  isDragging.value = false
  const files = e.dataTransfer?.files
  if (files) addFiles(files)
}

const handleFileSelect = (e: Event, category: UploadedFile['category']) => {
  activeUploadCategory.value = category
  const input = e.target as HTMLInputElement
  if (input.files) addFiles(input.files)
  input.value = ''
}

const addFiles = (files: FileList) => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png']
  const maxSize = 10 * 1024 * 1024

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    if (!allowedTypes.includes(file.type)) {
      toastStore.show({ type: 'warning', title: 'Недопустимый формат', message: `Файл \u00AB${file.name}\u00BB имеет недопустимый формат. Разрешены: PDF, JPG, PNG` })
      continue
    }
    if (file.size > maxSize) {
      toastStore.show({ type: 'warning', title: 'Файл слишком большой', message: `Файл \u00AB${file.name}\u00BB превышает максимальный размер 10 МБ` })
      continue
    }
    const category = fileCategories.find(c => c.value === activeUploadCategory.value)
    uploadedFiles.value.push({
      id: nextFileId++,
      name: file.name,
      size: formatFileSize(file.size),
      type: file.type,
      category: activeUploadCategory.value,
      required: category?.required || false
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

const getFilesForCategory = (category: string) => {
  return uploadedFiles.value.filter(f => f.category === category)
}

const hasRequiredDocuments = computed(() => {
  return uploadedFiles.value.some(f => f.category === 'certificate')
})

const nextStep = () => {
  let isValid = true
  if (currentStep.value === 1) isValid = validateStep1()
  else if (currentStep.value === 2) isValid = validateStep2()
  else if (currentStep.value === 3) isValid = validateStep3()

  if (isValid && currentStep.value < totalSteps) {
    currentStep.value++
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const goToStep = (step: number) => {
  if (step < currentStep.value) currentStep.value = step
}

const isSubmitting = ref(false)
const isSuccess = ref(false)
const registrationNumber = ref('')

const submitRegistration = async () => {
  if (!formData.confirmData) {
    toastStore.show({ type: 'warning', title: 'Подтвердите данные', message: 'Подтвердите достоверность введённых данных' })
    return
  }
  if (!hasRequiredDocuments.value) {
    toastStore.show({ type: 'warning', title: 'Отсутствует документ', message: 'Загрузите обязательный документ: Свидетельство о регистрации' })
    return
  }
  isSubmitting.value = true
  await new Promise(resolve => setTimeout(resolve, 2000))
  const num = String(Math.floor(Math.random() * 9000) + 1000)
  registrationNumber.value = `РЕГ-2026-${num}`
  isSubmitting.value = false
  isSuccess.value = true
}

const getOrgTypeLabel = (value: string) => {
  return orgTypes.find(t => t.value === value)?.label || value
}

const getActivityTypeLabel = (value: string) => {
  return activityTypes.find(t => t.value === value)?.label || value
}

const toggleProductGroup = (value: string) => {
  const idx = formData.selectedProductGroups.indexOf(value)
  if (idx === -1) {
    formData.selectedProductGroups.push(value)
  } else {
    formData.selectedProductGroups.splice(idx, 1)
  }
}

const allProductGroupsSelected = computed(() => formData.selectedProductGroups.length === productGroups.length)

const toggleAllProductGroups = () => {
  if (allProductGroupsSelected.value) {
    formData.selectedProductGroups = []
  } else {
    formData.selectedProductGroups = productGroups.map(g => g.value)
  }
}

const getProductGroupLabel = (value: string) => {
  return productGroups.find(g => g.value === value)?.label || value
}

// Recycler capacity helpers
const getEsiCapacityValue = (wasteType: string): number => {
  const cap = esiForm.recyclerCapacities.find(c => c.wasteType === wasteType)
  return cap ? cap.capacityTons : 0
}

const setEsiCapacityValue = (wasteType: string, value: string) => {
  const numVal = parseFloat(value) || 0
  const idx = esiForm.recyclerCapacities.findIndex(c => c.wasteType === wasteType)
  if (idx >= 0) {
    esiForm.recyclerCapacities[idx].capacityTons = numVal
  } else {
    esiForm.recyclerCapacities.push({ wasteType, capacityTons: numVal })
  }
}

const getManualCapacityValue = (groupValue: string): number => {
  const cap = formData.recyclerCapacities.find(c => c.wasteType === groupValue)
  return cap ? cap.capacityTons : 0
}

const setManualCapacityValue = (groupValue: string, value: string) => {
  const numVal = parseFloat(value) || 0
  const idx = formData.recyclerCapacities.findIndex(c => c.wasteType === groupValue)
  if (idx >= 0) {
    formData.recyclerCapacities[idx].capacityTons = numVal
  } else {
    formData.recyclerCapacities.push({ wasteType: groupValue, capacityTons: numVal })
  }
}

const getWasteCategoryLabel = (value: string): string => {
  for (const group of wasteGroups) {
    const item = group.items.find(i => i.value === value)
    if (item) {
      const match = item.label.match(/^\d+\.\s*(.+)$/)
      return match ? match[1] : item.label
    }
  }
  return value
}

const copyLegalToActual = () => {
  if (formData.sameAddress) {
    formData.actualRegion = formData.legalRegion
    formData.actualCity = formData.legalCity
    formData.actualStreet = formData.legalStreet
    formData.actualBuilding = formData.legalBuilding
  }
}

const goHome = () => {
  router.push('/')
}
</script>

<template>
  <div class="bg-[#f8fafc] py-8 lg:py-12">
    <div class="container-main">

      <!-- ==================== MODE: CHOOSE (Initial ESI Screen) ==================== -->
      <div v-if="registrationMode === 'choose' && !isEsiLoading" class="max-w-lg mx-auto py-8">
        <div class="text-center mb-8">
          <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b] mb-2">Регистрация плательщика утилизационного сбора</h1>
          <p class="text-[#64748b]">Выберите способ регистрации</p>
        </div>

        <!-- ESI Button -->
        <button
          @click="handleEsiLogin"
          class="w-full flex items-center justify-center gap-3 px-6 py-5 bg-[#0e888d] hover:bg-[#0a6b6f] text-white rounded-2xl font-semibold text-lg transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 mb-4"
        >
          <svg class="w-7 h-7 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2.18l7 3.12v4.7c0 4.83-3.23 9.36-7 10.57-3.77-1.21-7-5.74-7-10.57V6.3l7-3.12zM12 7a3 3 0 00-3 3v1H8v6h8v-6h-1v-1a3 3 0 00-3-3zm0 1.5a1.5 1.5 0 011.5 1.5v1h-3v-1A1.5 1.5 0 0112 8.5z"/>
          </svg>
          Зарегистрироваться через ЕСИ Түндүк
        </button>

        <p class="text-center text-sm text-[#64748b] mb-6">
          Быстрая регистрация — данные будут заполнены автоматически из ЕСИ
        </p>

        <!-- Divider -->
        <div class="flex items-center gap-4 my-6">
          <div class="flex-1 h-px bg-[#e2e8f0]"></div>
          <span class="text-sm text-[#70868f] font-medium">или</span>
          <div class="flex-1 h-px bg-[#e2e8f0]"></div>
        </div>

        <!-- Manual registration link -->
        <div class="text-center">
          <button
            @click="startManualRegistration"
            class="text-[#0e888d] text-sm font-medium hover:underline"
          >
            Зарегистрироваться без ЕСИ (заполнить вручную)
          </button>
        </div>

        <!-- Login link -->
        <div class="text-center mt-8">
          <p class="text-[#70868f] text-sm">
            Уже есть аккаунт?
            <router-link to="/login" class="text-[#0e888d] font-medium hover:underline">
              Войти
            </router-link>
          </p>
        </div>
      </div>

      <!-- ESI Loading -->
      <div v-if="isEsiLoading" class="max-w-lg mx-auto text-center py-20">
        <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-[#e8f5f5] flex items-center justify-center">
          <svg class="w-10 h-10 text-[#0e888d] animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <h2 class="text-xl font-semibold text-[#415861] mb-2">Подключение к ЕСИ Түндүк...</h2>
        <p class="text-[#70868f]">Получение данных организации</p>
      </div>

      <!-- ==================== MODE: ESI (Simplified Form) ==================== -->
      <div v-if="registrationMode === 'esi' && !isEsiLoading && !isEsiSuccess" class="max-w-3xl mx-auto">
        <div class="mb-6 text-center">
          <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b] mb-2">Регистрация через ЕСИ Түндүк</h1>
          <p class="text-[#64748b]">Проверьте данные и заполните дополнительную информацию</p>
        </div>

        <!-- ESI Data (readonly) -->
        <div class="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] overflow-hidden mb-6">
          <div class="px-6 py-4 bg-[#e8f5f5] border-b border-[#d1e7e8] flex items-center gap-2">
            <svg class="w-5 h-5 text-[#0e888d]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2.18l7 3.12v4.7c0 4.83-3.23 9.36-7 10.57-3.77-1.21-7-5.74-7-10.57V6.3l7-3.12z"/>
            </svg>
            <span class="font-semibold text-[#0e888d]">Данные из ЕСИ Түндүк</span>
            <span class="ml-auto text-xs text-[#0e888d] bg-[#d1e7e8] px-2 py-0.5 rounded-full">Подтверждено</span>
          </div>
          <div class="p-6 space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs text-[#64748b] mb-1">ИНН</label>
                <input
                  type="text"
                  :value="esiData.inn"
                  readonly
                  class="w-full px-4 py-3 border border-[#e2e8f0] rounded-xl bg-[#f8fafc] text-[#1e293b] font-mono cursor-not-allowed"
                />
              </div>
              <div>
                <label class="block text-xs text-[#64748b] mb-1">Наименование</label>
                <input
                  type="text"
                  :value="esiData.shortName"
                  readonly
                  class="w-full px-4 py-3 border border-[#e2e8f0] rounded-xl bg-[#f8fafc] text-[#1e293b] cursor-not-allowed"
                />
              </div>
              <div>
                <label class="block text-xs text-[#64748b] mb-1">ФИО руководителя</label>
                <input
                  type="text"
                  :value="esiData.directorFullName"
                  readonly
                  class="w-full px-4 py-3 border border-[#e2e8f0] rounded-xl bg-[#f8fafc] text-[#1e293b] cursor-not-allowed"
                />
              </div>
              <div>
                <label class="block text-xs text-[#64748b] mb-1">Юридический адрес</label>
                <input
                  type="text"
                  :value="esiData.legalAddress"
                  readonly
                  class="w-full px-4 py-3 border border-[#e2e8f0] rounded-xl bg-[#f8fafc] text-[#1e293b] cursor-not-allowed"
                />
              </div>
              <div>
                <label class="block text-xs text-[#64748b] mb-1">Телефон</label>
                <input
                  type="text"
                  :value="esiData.phone"
                  readonly
                  class="w-full px-4 py-3 border border-[#e2e8f0] rounded-xl bg-[#f8fafc] text-[#1e293b] cursor-not-allowed"
                />
              </div>
              <div>
                <label class="block text-xs text-[#64748b] mb-1">Email</label>
                <input
                  type="text"
                  :value="esiData.email"
                  readonly
                  class="w-full px-4 py-3 border border-[#e2e8f0] rounded-xl bg-[#f8fafc] text-[#1e293b] cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Additional fields to fill -->
        <div class="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] overflow-hidden mb-6">
          <div class="px-6 py-4 bg-[#f8fafc] border-b border-[#e2e8f0]">
            <span class="font-semibold text-[#1e293b]">Дополнительная информация</span>
          </div>
          <div class="p-6 space-y-6">
            <!-- Activity Type -->
            <div>
              <label class="block text-sm font-medium text-[#1e293b] mb-3">Вид деятельности *</label>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  v-for="type in activityTypes"
                  :key="type.value"
                  :class="[
                    'flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all',
                    esiForm.activityType === type.value
                      ? 'border-[#0e888d] bg-[#f0fdfa]'
                      : 'border-[#e2e8f0] hover:border-[#0e888d]/50'
                  ]"
                >
                  <input
                    type="radio"
                    v-model="esiForm.activityType"
                    :value="type.value"
                    class="w-5 h-5 text-[#0e888d] border-gray-300 focus:ring-[#0e888d]"
                  />
                  <span class="text-sm text-[#1e293b]">{{ type.label }}</span>
                </label>
              </div>
              <p v-if="esiFormErrors.activityType" class="mt-2 text-sm text-red-600">{{ esiFormErrors.activityType }}</p>
            </div>

            <!-- Waste Categories (24 группы по ПКМ КР №322) -->
            <div>
              <label class="block text-sm font-medium text-[#1e293b] mb-1">Категории товаров (группы отходов) *</label>
              <p class="text-xs text-[#64748b] mb-4">Согласно постановлению КМ КР №322. Выберите все применимые категории.</p>

              <div class="space-y-5">
                <div v-for="group in wasteGroups" :key="group.id" class="border border-[#e2e8f0] rounded-2xl overflow-hidden">
                  <!-- Group header -->
                  <div class="flex items-center justify-between px-4 py-3 bg-[#e8f5f5] border-b border-[#d1e7e8]">
                    <div class="flex items-center gap-2">
                      <span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#0e888d] text-white text-xs font-bold">{{ group.letter }}</span>
                      <span class="font-semibold text-[#0e888d] text-sm">ГРУППА {{ group.letter }} — {{ group.title }}</span>
                    </div>
                    <button
                      type="button"
                      @click="toggleGroupAll(group)"
                      :class="[
                        'text-xs font-medium px-3 py-1 rounded-lg transition-colors',
                        isGroupAllSelected(group)
                          ? 'bg-[#0e888d] text-white hover:bg-[#0a6b6f]'
                          : 'bg-white text-[#0e888d] border border-[#0e888d] hover:bg-[#f0fdfa]'
                      ]"
                    >
                      {{ isGroupAllSelected(group) ? 'Снять все' : 'Выбрать все' }}
                    </button>
                  </div>
                  <!-- Group items -->
                  <div class="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <label
                      v-for="item in group.items"
                      :key="item.value"
                      :class="[
                        'flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all',
                        esiForm.wasteCategories.includes(item.value)
                          ? 'border-[#0e888d] bg-[#f0fdfa]'
                          : 'border-[#e2e8f0] hover:border-[#0e888d]/50'
                      ]"
                    >
                      <input
                        type="checkbox"
                        :checked="esiForm.wasteCategories.includes(item.value)"
                        @change="toggleWasteCategory(item.value)"
                        class="w-5 h-5 mt-0.5 text-[#0e888d] border-gray-300 rounded focus:ring-[#0e888d] flex-shrink-0"
                      />
                      <span class="text-sm text-[#1e293b] leading-snug">{{ item.label }}</span>
                    </label>
                  </div>
                </div>
              </div>

              <p v-if="esiFormErrors.wasteCategories" class="mt-2 text-sm text-red-600">{{ esiFormErrors.wasteCategories }}</p>

              <!-- Recycler Capacities (ESI) -->
              <div v-if="esiForm.activityType === 'recycler' && esiForm.wasteCategories.length > 0" class="mt-6">
                <h3 class="text-base font-semibold text-[#1e293b] mb-1">Мощности переработки (т/год)</h3>
                <p class="text-sm text-[#64748b] mb-4">Укажите максимальную мощность переработки по каждому виду отходов</p>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div v-for="cat in esiForm.wasteCategories" :key="'esi-cap-' + cat" class="bg-[#f8fafc] rounded-lg p-3 border border-[#e2e8f0]">
                    <label class="block text-xs font-medium text-[#1e293b] mb-1.5">{{ getWasteCategoryLabel(cat) }}</label>
                    <div class="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        :value="getEsiCapacityValue(cat)"
                        @input="setEsiCapacityValue(cat, ($event.target as HTMLInputElement).value)"
                        placeholder="0"
                        class="flex-1 px-3 py-2 border border-[#e2e8f0] rounded-lg text-sm focus:outline-none focus:border-[#2563eb]"
                      />
                      <span class="text-xs text-[#94a3b8] whitespace-nowrap">т/год</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Confirm -->
            <label class="flex items-start gap-3 p-4 rounded-xl border-2 border-[#e2e8f0] cursor-pointer hover:border-[#0e888d]/50 transition-colors">
              <input
                type="checkbox"
                v-model="esiForm.confirmData"
                class="w-5 h-5 mt-0.5 text-[#0e888d] border-gray-300 rounded focus:ring-[#0e888d]"
              />
              <span class="text-sm text-[#1e293b]">
                Подтверждаю достоверность предоставленных данных и соглашаюсь с условиями обработки персональных данных
              </span>
            </label>
          </div>

          <!-- Submit -->
          <div class="px-6 py-4 bg-[#f8fafc] border-t border-[#e2e8f0] flex flex-col sm:flex-row justify-between gap-4">
            <button
              @click="registrationMode = 'choose'"
              class="flex items-center justify-center gap-2 px-5 py-2.5 border border-[#e2e8f0] rounded-lg text-[#64748b] hover:bg-white transition-colors"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              Назад
            </button>
            <button
              @click="submitEsiRegistration"
              :disabled="!esiForm.confirmData || isEsiSubmitting"
              class="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#10b981] text-white rounded-lg font-medium hover:bg-[#059669] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg v-if="isEsiSubmitting" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ isEsiSubmitting ? 'Отправка...' : 'Отправить заявку на регистрацию' }}
            </button>
          </div>
        </div>
      </div>

      <!-- ESI Success -->
      <div v-if="isEsiSuccess" class="max-w-2xl mx-auto text-center py-12">
        <div class="w-24 h-24 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
          <svg class="w-12 h-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b] mb-4">Заявка на регистрацию отправлена!</h1>

        <div class="bg-white rounded-2xl p-6 shadow-sm border border-[#e2e8f0] mb-8">
          <div class="text-center">
            <p class="text-sm text-[#64748b] mb-2">Номер заявки</p>
            <p class="text-2xl font-bold text-[#0e888d] font-mono mb-4">{{ esiRegistrationNumber }}</p>

            <div class="bg-[#f0fdf4] rounded-xl p-4 text-left">
              <p class="text-[#166534] text-sm">
                <strong>Ваша заявка будет рассмотрена в течение 3 рабочих дней.</strong><br><br>
                Уведомление о результате будет отправлено на email: <strong>{{ esiData.email }}</strong>
              </p>
            </div>
          </div>
        </div>

        <button
          @click="goHome"
          class="inline-flex items-center gap-2 px-8 py-4 bg-[#0e888d] text-white rounded-xl font-semibold hover:bg-[#0a6b6f] transition-colors"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Вернуться на главную
        </button>
      </div>

      <!-- ==================== MODE: MANUAL (Existing 5-step Wizard) ==================== -->
      <template v-if="registrationMode === 'manual'">
        <!-- Success Screen -->
        <div v-if="isSuccess" class="max-w-2xl mx-auto text-center py-12">
          <div class="w-24 h-24 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
            <svg class="w-12 h-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b] mb-4">Заявка на регистрацию отправлена!</h1>

          <div class="bg-white rounded-2xl p-6 shadow-sm border border-[#e2e8f0] mb-8">
            <div class="text-center">
              <p class="text-sm text-[#64748b] mb-2">Номер заявки</p>
              <p class="text-2xl font-bold text-[#0e888d] font-mono mb-4">{{ registrationNumber }}</p>

              <div class="bg-[#f0fdf4] rounded-xl p-4 text-left">
                <p class="text-[#166534] text-sm">
                  <strong>Ваша заявка будет рассмотрена в течение 3 рабочих дней.</strong><br><br>
                  Уведомление о результате будет отправлено на указанный email: <strong>{{ formData.email }}</strong>
                </p>
              </div>
            </div>
          </div>

          <button
            @click="goHome"
            class="inline-flex items-center gap-2 px-8 py-4 bg-[#0e888d] text-white rounded-xl font-semibold hover:bg-[#0a6b6f] transition-colors"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Вернуться на главную
          </button>
        </div>

        <!-- Registration Form -->
        <div v-else class="max-w-4xl mx-auto">
          <!-- Header -->
          <div class="mb-6 text-center">
            <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b] mb-2">Регистрация плательщика утилизационного сбора</h1>
            <p class="text-[#64748b]">Заполните форму для подачи заявки на регистрацию</p>
          </div>

          <!-- Progress Steps -->
          <div class="bg-white rounded-2xl p-4 lg:p-6 shadow-sm border border-[#e2e8f0] mb-6">
            <div class="flex items-center justify-between overflow-x-auto">
              <template v-for="(step, index) in steps" :key="step.number">
                <button
                  @click="goToStep(step.number)"
                  :class="[
                    'flex items-center gap-2 lg:gap-3 flex-shrink-0',
                    step.number <= currentStep ? 'cursor-pointer' : 'cursor-not-allowed'
                  ]"
                >
                  <div
                    :class="[
                      'w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center font-semibold text-sm lg:text-base transition-colors',
                      currentStep === step.number
                        ? 'bg-[#0e888d] text-white'
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
                      'hidden lg:block text-sm font-medium whitespace-nowrap',
                      currentStep >= step.number ? 'text-[#1e293b]' : 'text-[#64748b]'
                    ]"
                  >
                    {{ step.title }}
                  </span>
                </button>
                <div
                  v-if="index < steps.length - 1"
                  :class="[
                    'flex-1 h-1 mx-2 lg:mx-4 rounded-full min-w-[20px]',
                    currentStep > step.number ? 'bg-green-500' : 'bg-[#e2e8f0]'
                  ]"
                ></div>
              </template>
            </div>
          </div>

          <!-- Step Content -->
          <div class="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] overflow-hidden">
            <!-- Step 1: Organization Type -->
            <div v-if="currentStep === 1" class="p-6 lg:p-8">
              <h2 class="text-xl font-semibold text-[#1e293b] mb-6">Тип организации</h2>

              <div class="space-y-6">
                <div>
                  <label class="block text-sm font-medium text-[#1e293b] mb-3">Организационно-правовая форма *</label>
                  <div class="relative">
                    <select
                      v-model="formData.orgType"
                      :class="[
                        'reg-select',
                        errors.orgType ? 'reg-select--error' : '',
                        !formData.orgType ? 'text-[#94a3b8]' : 'text-[#1e293b]'
                      ]"
                    >
                      <option value="" disabled>Выберите организационно-правовую форму</option>
                      <optgroup v-for="group in orgTypeGroups" :key="group.label" :label="group.label">
                        <option v-for="opt in group.options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                      </optgroup>
                    </select>
                    <svg class="reg-select__chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                  <p v-if="errors.orgType" class="mt-2 text-sm text-red-600">{{ errors.orgType }}</p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-[#1e293b] mb-3">Вид деятельности *</label>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label
                      v-for="type in activityTypes"
                      :key="type.value"
                      :class="[
                        'flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all',
                        formData.activityType === type.value
                          ? 'border-[#0e888d] bg-[#f0fdfa]'
                          : 'border-[#e2e8f0] hover:border-[#0e888d]/50'
                      ]"
                    >
                      <input
                        type="radio"
                        v-model="formData.activityType"
                        :value="type.value"
                        class="w-5 h-5 text-[#0e888d] border-gray-300 focus:ring-[#0e888d]"
                      />
                      <span class="text-sm text-[#1e293b]">{{ type.label }}</span>
                    </label>
                  </div>
                  <p v-if="errors.activityType" class="mt-2 text-sm text-red-600">{{ errors.activityType }}</p>
                </div>
              </div>
            </div>

            <!-- Step 2: Organization Data -->
            <div v-if="currentStep === 2" class="p-6 lg:p-8">
              <h2 class="text-xl font-semibold text-[#1e293b] mb-6">{{ isIndividual ? 'Данные предпринимателя' : 'Данные организации' }}</h2>

              <div class="space-y-6">
                <!-- Individual (ИП/КФХ) fields -->
                <template v-if="isIndividual">
                  <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-[#1e293b] mb-2">Фамилия *</label>
                      <input
                        v-model="formData.lastName"
                        type="text"
                        placeholder="Асанов"
                        :class="[
                          'w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0e888d]/20',
                          errors.lastName ? 'border-red-300 focus:border-red-500' : 'border-[#e2e8f0] focus:border-[#0e888d]'
                        ]"
                      />
                      <p v-if="errors.lastName" class="mt-1 text-sm text-red-600">{{ errors.lastName }}</p>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-[#1e293b] mb-2">Имя *</label>
                      <input
                        v-model="formData.firstName"
                        type="text"
                        placeholder="Азамат"
                        :class="[
                          'w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0e888d]/20',
                          errors.firstName ? 'border-red-300 focus:border-red-500' : 'border-[#e2e8f0] focus:border-[#0e888d]'
                        ]"
                      />
                      <p v-if="errors.firstName" class="mt-1 text-sm text-red-600">{{ errors.firstName }}</p>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-[#1e293b] mb-2">Отчество</label>
                      <input
                        v-model="formData.middleName"
                        type="text"
                        placeholder="Бакытович"
                        class="w-full px-4 py-3 border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0e888d] focus:ring-2 focus:ring-[#0e888d]/20"
                      />
                    </div>
                  </div>
                  <div class="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-[#1e293b] mb-2">Серия паспорта *</label>
                      <input
                        v-model="formData.passportSeries"
                        type="text"
                        placeholder="AN"
                        maxlength="2"
                        :class="[
                          'w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0e888d]/20 font-mono uppercase',
                          errors.passportSeries ? 'border-red-300 focus:border-red-500' : 'border-[#e2e8f0] focus:border-[#0e888d]'
                        ]"
                      />
                      <p v-if="errors.passportSeries" class="mt-1 text-sm text-red-600">{{ errors.passportSeries }}</p>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-[#1e293b] mb-2">Номер паспорта *</label>
                      <input
                        v-model="formData.passportNumber"
                        type="text"
                        placeholder="1234567"
                        maxlength="7"
                        :class="[
                          'w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0e888d]/20 font-mono',
                          errors.passportNumber ? 'border-red-300 focus:border-red-500' : 'border-[#e2e8f0] focus:border-[#0e888d]'
                        ]"
                      />
                      <p v-if="errors.passportNumber" class="mt-1 text-sm text-red-600">{{ errors.passportNumber }}</p>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-[#1e293b] mb-2">Кем выдан</label>
                      <input
                        v-model="formData.passportIssuedBy"
                        type="text"
                        placeholder="МКК-50-11"
                        class="w-full px-4 py-3 border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0e888d] focus:ring-2 focus:ring-[#0e888d]/20"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-[#1e293b] mb-2">Дата выдачи</label>
                      <input
                        v-model="formData.passportDate"
                        type="date"
                        class="w-full px-4 py-3 border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0e888d] focus:ring-2 focus:ring-[#0e888d]/20"
                      />
                    </div>
                  </div>
                </template>

                <!-- Legal entity fields -->
                <template v-else>
                  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-[#1e293b] mb-2">Краткое наименование *</label>
                      <input
                        v-model="formData.shortName"
                        type="text"
                        placeholder="ОсОО «Название»"
                        :class="[
                          'w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0e888d]/20',
                          errors.shortName ? 'border-red-300 focus:border-red-500' : 'border-[#e2e8f0] focus:border-[#0e888d]'
                        ]"
                      />
                      <p v-if="errors.shortName" class="mt-1 text-sm text-red-600">{{ errors.shortName }}</p>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-[#1e293b] mb-2">Полное наименование *</label>
                      <input
                        v-model="formData.fullName"
                        type="text"
                        placeholder="Общество с ограниченной ответственностью «Название»"
                        :class="[
                          'w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0e888d]/20',
                          errors.fullName ? 'border-red-300 focus:border-red-500' : 'border-[#e2e8f0] focus:border-[#0e888d]'
                        ]"
                      />
                      <p v-if="errors.fullName" class="mt-1 text-sm text-red-600">{{ errors.fullName }}</p>
                    </div>
                  </div>
                </template>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-[#1e293b] mb-2">ИНН (14 цифр) *</label>
                    <input
                      v-model="formData.inn"
                      type="text"
                      maxlength="14"
                      placeholder="12345678901234"
                      :class="[
                        'w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0e888d]/20 font-mono',
                        errors.inn ? 'border-red-300 focus:border-red-500' : 'border-[#e2e8f0] focus:border-[#0e888d]'
                      ]"
                    />
                    <p v-if="errors.inn" class="mt-1 text-sm text-red-600">{{ errors.inn }}</p>
                  </div>
                  <div v-if="!isIndividual">
                    <label class="block text-sm font-medium text-[#1e293b] mb-2">ОКПО</label>
                    <input
                      v-model="formData.okpo"
                      type="text"
                      placeholder="12345678"
                      class="w-full px-4 py-3 border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0e888d] focus:ring-2 focus:ring-[#0e888d]/20 font-mono"
                    />
                  </div>
                </div>

                <!-- Виды продукции -->
                <div style="margin-top: 24px;">
                  <h3 class="pg-section-title">ВИДЫ ПРОДУКЦИИ</h3>
                  <p class="pg-subtitle">Укажите группы товаров, которые ваша организация ввозит или производит *</p>

                  <div
                    :class="['pg-grid-container', errors.selectedProductGroups ? 'pg-grid-container--error' : '']"
                  >
                    <label
                      v-for="group in productGroups"
                      :key="group.value"
                      :class="[
                        'pg-card',
                        formData.selectedProductGroups.includes(group.value) ? 'pg-card--checked' : ''
                      ]"
                    >
                      <input
                        type="checkbox"
                        :checked="formData.selectedProductGroups.includes(group.value)"
                        @change="toggleProductGroup(group.value)"
                        class="pg-checkbox"
                      />
                      <span class="pg-card-label">{{ group.label }}</span>
                    </label>
                  </div>

                  <div class="flex items-center justify-between mt-3">
                    <span class="pg-counter">
                      Выбрано: {{ formData.selectedProductGroups.length }} из {{ productGroups.length }} групп
                    </span>
                    <button
                      type="button"
                      @click="toggleAllProductGroups"
                      class="pg-toggle-btn"
                    >
                      {{ allProductGroupsSelected ? 'Снять все' : 'Выбрать все' }}
                    </button>
                  </div>

                  <p v-if="errors.selectedProductGroups" class="mt-2 text-sm text-red-600">{{ errors.selectedProductGroups }}</p>

                  <!-- Recycler Capacities (Manual) -->
                  <div v-if="formData.activityType === 'recycler' && formData.selectedProductGroups.length > 0" class="mt-6">
                    <h3 class="text-base font-semibold text-[#1e293b] mb-1">Мощности переработки (т/год)</h3>
                    <p class="text-sm text-[#64748b] mb-4">Укажите максимальную мощность переработки по каждой группе товаров</p>
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <div v-for="gv in formData.selectedProductGroups" :key="'manual-cap-' + gv" class="bg-[#f8fafc] rounded-lg p-3 border border-[#e2e8f0]">
                        <label class="block text-xs font-medium text-[#1e293b] mb-1.5">{{ productGroups.find(g => g.value === gv)?.label || gv }}</label>
                        <div class="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            :value="getManualCapacityValue(gv)"
                            @input="setManualCapacityValue(gv, ($event.target as HTMLInputElement).value)"
                            placeholder="0"
                            class="flex-1 px-3 py-2 border border-[#e2e8f0] rounded-lg text-sm focus:outline-none focus:border-[#2563eb]"
                          />
                          <span class="text-xs text-[#94a3b8] whitespace-nowrap">т/год</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="mt-4">
                    <label class="block text-sm font-medium text-[#1e293b] mb-1">Уточнение видов продукции (необязательно)</label>
                    <input
                      v-model="formData.productNote"
                      type="text"
                      placeholder="Например: ПЭТ-бутылки, полиэтиленовые пакеты, картонные коробки..."
                      class="w-full px-4 py-3 border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0e888d] focus:ring-2 focus:ring-[#0e888d]/20 text-sm"
                    />
                    <p class="mt-1 text-xs text-[#94a3b8]">Укажите конкретные виды товаров для более точного учёта</p>
                  </div>
                </div>

                <div>
                  <h3 class="text-sm font-semibold text-[#1e293b] mb-3 uppercase tracking-wide">Юридический адрес</h3>
                  <div class="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    <div>
                      <label class="block text-xs text-[#64748b] mb-1">Область/город *</label>
                      <select
                        v-model="formData.legalRegion"
                        :class="[
                          'w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e888d]/20',
                          errors.legalRegion ? 'border-red-300' : 'border-[#e2e8f0] focus:border-[#0e888d]'
                        ]"
                      >
                        <option value="">Выберите</option>
                        <option v-for="r in regions" :key="r" :value="r">{{ r }}</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-xs text-[#64748b] mb-1">Город/район *</label>
                      <input
                        v-model="formData.legalCity"
                        type="text"
                        :class="[
                          'w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e888d]/20',
                          errors.legalCity ? 'border-red-300' : 'border-[#e2e8f0] focus:border-[#0e888d]'
                        ]"
                      />
                    </div>
                    <div>
                      <label class="block text-xs text-[#64748b] mb-1">Улица</label>
                      <input
                        v-model="formData.legalStreet"
                        type="text"
                        class="w-full px-3 py-2.5 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#0e888d]"
                      />
                    </div>
                    <div>
                      <label class="block text-xs text-[#64748b] mb-1">Дом/офис</label>
                      <input
                        v-model="formData.legalBuilding"
                        type="text"
                        class="w-full px-3 py-2.5 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#0e888d]"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div class="flex items-center justify-between mb-3">
                    <h3 class="text-sm font-semibold text-[#1e293b] uppercase tracking-wide">Фактический адрес</h3>
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        v-model="formData.sameAddress"
                        @change="copyLegalToActual"
                        class="w-4 h-4 text-[#0e888d] border-gray-300 rounded focus:ring-[#0e888d]"
                      />
                      <span class="text-sm text-[#64748b]">Совпадает с юридическим</span>
                    </label>
                  </div>
                  <div class="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    <div>
                      <label class="block text-xs text-[#64748b] mb-1">Область/город</label>
                      <select
                        v-model="formData.actualRegion"
                        :disabled="formData.sameAddress"
                        class="w-full px-3 py-2.5 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#0e888d] disabled:bg-gray-100"
                      >
                        <option value="">Выберите</option>
                        <option v-for="r in regions" :key="r" :value="r">{{ r }}</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-xs text-[#64748b] mb-1">Город/район</label>
                      <input
                        v-model="formData.actualCity"
                        type="text"
                        :disabled="formData.sameAddress"
                        class="w-full px-3 py-2.5 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#0e888d] disabled:bg-gray-100"
                      />
                    </div>
                    <div>
                      <label class="block text-xs text-[#64748b] mb-1">Улица</label>
                      <input
                        v-model="formData.actualStreet"
                        type="text"
                        :disabled="formData.sameAddress"
                        class="w-full px-3 py-2.5 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#0e888d] disabled:bg-gray-100"
                      />
                    </div>
                    <div>
                      <label class="block text-xs text-[#64748b] mb-1">Дом/офис</label>
                      <input
                        v-model="formData.actualBuilding"
                        type="text"
                        :disabled="formData.sameAddress"
                        class="w-full px-3 py-2.5 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#0e888d] disabled:bg-gray-100"
                      />
                    </div>
                  </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-[#1e293b] mb-2">Контактный телефон *</label>
                    <input
                      v-model="formData.phone"
                      type="tel"
                      placeholder="+996 XXX XX XX XX"
                      :class="[
                        'w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0e888d]/20',
                        errors.phone ? 'border-red-300 focus:border-red-500' : 'border-[#e2e8f0] focus:border-[#0e888d]'
                      ]"
                    />
                    <p v-if="errors.phone" class="mt-1 text-sm text-red-600">{{ errors.phone }}</p>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-[#1e293b] mb-2">Email *</label>
                    <input
                      v-model="formData.email"
                      type="email"
                      placeholder="company@example.kg"
                      :class="[
                        'w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0e888d]/20',
                        errors.email ? 'border-red-300 focus:border-red-500' : 'border-[#e2e8f0] focus:border-[#0e888d]'
                      ]"
                    />
                    <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 3: Director & Contact -->
            <div v-if="currentStep === 3" class="p-6 lg:p-8">
              <h2 class="text-xl font-semibold text-[#1e293b] mb-6">Руководитель и контактное лицо</h2>

              <div class="space-y-8">
                <div>
                  <h3 class="text-sm font-semibold text-[#1e293b] mb-4 uppercase tracking-wide flex items-center gap-2">
                    <svg class="w-5 h-5 text-[#0e888d]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Руководитель организации
                  </h3>
                  <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div>
                      <label class="block text-xs text-[#64748b] mb-1">ФИО *</label>
                      <input
                        v-model="formData.directorFullName"
                        type="text"
                        placeholder="Иванов Иван Иванович"
                        :class="[
                          'w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e888d]/20',
                          errors.directorFullName ? 'border-red-300' : 'border-[#e2e8f0] focus:border-[#0e888d]'
                        ]"
                      />
                      <p v-if="errors.directorFullName" class="mt-1 text-xs text-red-600">{{ errors.directorFullName }}</p>
                    </div>
                    <div>
                      <label class="block text-xs text-[#64748b] mb-1">Должность *</label>
                      <input
                        v-model="formData.directorPosition"
                        type="text"
                        placeholder="Директор"
                        :class="[
                          'w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e888d]/20',
                          errors.directorPosition ? 'border-red-300' : 'border-[#e2e8f0] focus:border-[#0e888d]'
                        ]"
                      />
                      <p v-if="errors.directorPosition" class="mt-1 text-xs text-red-600">{{ errors.directorPosition }}</p>
                    </div>
                    <div>
                      <label class="block text-xs text-[#64748b] mb-1">Телефон *</label>
                      <input
                        v-model="formData.directorPhone"
                        type="tel"
                        placeholder="+996 XXX XX XX XX"
                        :class="[
                          'w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e888d]/20',
                          errors.directorPhone ? 'border-red-300' : 'border-[#e2e8f0] focus:border-[#0e888d]'
                        ]"
                      />
                      <p v-if="errors.directorPhone" class="mt-1 text-xs text-red-600">{{ errors.directorPhone }}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 class="text-sm font-semibold text-[#1e293b] mb-4 uppercase tracking-wide flex items-center gap-2">
                    <svg class="w-5 h-5 text-[#0e888d]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Контактное лицо
                  </h3>
                  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-xs text-[#64748b] mb-1">ФИО *</label>
                      <input
                        v-model="formData.contactFullName"
                        type="text"
                        placeholder="Петрова Анна Сергеевна"
                        :class="[
                          'w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e888d]/20',
                          errors.contactFullName ? 'border-red-300' : 'border-[#e2e8f0] focus:border-[#0e888d]'
                        ]"
                      />
                      <p v-if="errors.contactFullName" class="mt-1 text-xs text-red-600">{{ errors.contactFullName }}</p>
                    </div>
                    <div>
                      <label class="block text-xs text-[#64748b] mb-1">Должность</label>
                      <input
                        v-model="formData.contactPosition"
                        type="text"
                        placeholder="Бухгалтер"
                        class="w-full px-3 py-2.5 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#0e888d]"
                      />
                    </div>
                    <div>
                      <label class="block text-xs text-[#64748b] mb-1">Телефон *</label>
                      <input
                        v-model="formData.contactPhone"
                        type="tel"
                        placeholder="+996 XXX XX XX XX"
                        :class="[
                          'w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e888d]/20',
                          errors.contactPhone ? 'border-red-300' : 'border-[#e2e8f0] focus:border-[#0e888d]'
                        ]"
                      />
                      <p v-if="errors.contactPhone" class="mt-1 text-xs text-red-600">{{ errors.contactPhone }}</p>
                    </div>
                    <div>
                      <label class="block text-xs text-[#64748b] mb-1">Email *</label>
                      <input
                        v-model="formData.contactEmail"
                        type="email"
                        placeholder="contact@example.kg"
                        :class="[
                          'w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e888d]/20',
                          errors.contactEmail ? 'border-red-300' : 'border-[#e2e8f0] focus:border-[#0e888d]'
                        ]"
                      />
                      <p v-if="errors.contactEmail" class="mt-1 text-xs text-red-600">{{ errors.contactEmail }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 4: Documents -->
            <div v-if="currentStep === 4" class="p-6 lg:p-8">
              <h2 class="text-xl font-semibold text-[#1e293b] mb-6">Загрузка документов</h2>

              <div class="space-y-6">
                <div v-for="cat in fileCategories" :key="cat.value" class="border border-[#e2e8f0] rounded-xl p-4">
                  <div class="flex items-start justify-between mb-3">
                    <div>
                      <h3 class="font-medium text-[#1e293b]">
                        {{ cat.label }}
                        <span v-if="cat.required" class="text-red-500">*</span>
                      </h3>
                      <p class="text-xs text-[#64748b] mt-1">PDF, JPG, PNG до 10 МБ</p>
                    </div>
                    <label class="inline-flex items-center gap-2 bg-[#0e888d] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#0a6b6f] transition-colors cursor-pointer">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      Выбрать файл
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        class="hidden"
                        @change="(e) => handleFileSelect(e, cat.value as UploadedFile['category'])"
                      />
                    </label>
                  </div>

                  <div v-if="getFilesForCategory(cat.value).length > 0" class="space-y-2">
                    <div
                      v-for="file in getFilesForCategory(cat.value)"
                      :key="file.id"
                      class="flex items-center justify-between bg-[#f8fafc] rounded-lg px-3 py-2"
                    >
                      <div class="flex items-center gap-2">
                        <svg class="w-5 h-5 text-[#0e888d]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span class="text-sm text-[#1e293b]">{{ file.name }}</span>
                        <span class="text-xs text-[#64748b]">({{ file.size }})</span>
                      </div>
                      <button
                        @click="removeFile(file.id)"
                        class="text-red-500 hover:bg-red-50 p-1 rounded transition-colors"
                      >
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div v-else class="text-center py-4 text-sm text-[#64748b]">
                    Файл не загружен
                  </div>
                </div>

                <div
                  @dragover.prevent="isDragging = true; activeUploadCategory = 'certificate'"
                  @dragleave="isDragging = false"
                  @drop.prevent="handleDrop"
                  :class="[
                    'border-2 border-dashed rounded-xl p-6 text-center transition-colors',
                    isDragging ? 'border-[#0e888d] bg-[#f0fdfa]' : 'border-[#e2e8f0]'
                  ]"
                >
                  <svg class="w-10 h-10 text-[#64748b] mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p class="text-sm text-[#64748b]">Перетащите файлы сюда</p>
                </div>

                <div v-if="!hasRequiredDocuments" class="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                  <svg class="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p class="text-sm text-amber-800">Загрузите обязательный документ: <strong>Свидетельство о регистрации</strong></p>
                </div>
              </div>
            </div>

            <!-- Step 5: Review -->
            <div v-if="currentStep === 5" class="p-6 lg:p-8">
              <h2 class="text-xl font-semibold text-[#1e293b] mb-6">Проверка и отправка</h2>

              <div class="space-y-6">
                <div class="bg-[#f8fafc] rounded-xl p-5 border border-[#e2e8f0]">
                  <h3 class="font-medium text-[#1e293b] mb-4 flex items-center gap-2">
                    <svg class="w-5 h-5 text-[#0e888d]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Тип организации
                  </h3>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span class="text-[#64748b]">Организационно-правовая форма:</span>
                      <p class="font-medium text-[#1e293b]">{{ getOrgTypeLabel(formData.orgType) }}</p>
                    </div>
                    <div>
                      <span class="text-[#64748b]">Вид деятельности:</span>
                      <p class="font-medium text-[#1e293b]">{{ getActivityTypeLabel(formData.activityType) }}</p>
                    </div>
                  </div>
                </div>

                <div class="bg-[#f8fafc] rounded-xl p-5 border border-[#e2e8f0]">
                  <h3 class="font-medium text-[#1e293b] mb-4 flex items-center gap-2">
                    <svg class="w-5 h-5 text-[#0e888d]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {{ isIndividual ? 'Данные предпринимателя' : 'Данные организации' }}
                  </h3>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div v-if="isIndividual">
                      <span class="text-[#64748b]">ФИО:</span>
                      <p class="font-medium text-[#1e293b]">{{ formData.lastName }} {{ formData.firstName }} {{ formData.middleName }}</p>
                    </div>
                    <div v-if="isIndividual">
                      <span class="text-[#64748b]">Паспорт:</span>
                      <p class="font-medium text-[#1e293b] font-mono">{{ formData.passportSeries }} {{ formData.passportNumber }}</p>
                    </div>
                    <div v-if="!isIndividual">
                      <span class="text-[#64748b]">Наименование:</span>
                      <p class="font-medium text-[#1e293b]">{{ formData.shortName }}</p>
                    </div>
                    <div>
                      <span class="text-[#64748b]">ИНН:</span>
                      <p class="font-medium text-[#1e293b] font-mono">{{ formData.inn }}</p>
                    </div>
                    <div class="sm:col-span-2">
                      <span class="text-[#64748b]">Юридический адрес:</span>
                      <p class="font-medium text-[#1e293b]">
                        {{ formData.legalRegion }}, {{ formData.legalCity }}
                        <template v-if="formData.legalStreet">, {{ formData.legalStreet }}</template>
                        <template v-if="formData.legalBuilding">, {{ formData.legalBuilding }}</template>
                      </p>
                    </div>
                    <div>
                      <span class="text-[#64748b]">Телефон:</span>
                      <p class="font-medium text-[#1e293b]">{{ formData.phone }}</p>
                    </div>
                    <div>
                      <span class="text-[#64748b]">Email:</span>
                      <p class="font-medium text-[#1e293b]">{{ formData.email }}</p>
                    </div>
                  </div>
                </div>

                <div class="bg-[#f8fafc] rounded-xl p-5 border border-[#e2e8f0]">
                  <h3 class="font-medium text-[#1e293b] mb-4 flex items-center gap-2">
                    <svg class="w-5 h-5 text-[#0e888d]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Руководитель и контактное лицо
                  </h3>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span class="text-[#64748b]">Руководитель:</span>
                      <p class="font-medium text-[#1e293b]">{{ formData.directorFullName }}</p>
                      <p class="text-[#64748b]">{{ formData.directorPosition }}, {{ formData.directorPhone }}</p>
                    </div>
                    <div>
                      <span class="text-[#64748b]">Контактное лицо:</span>
                      <p class="font-medium text-[#1e293b]">{{ formData.contactFullName }}</p>
                      <p class="text-[#64748b]">{{ formData.contactPhone }}, {{ formData.contactEmail }}</p>
                    </div>
                  </div>
                </div>

                <div class="bg-[#f8fafc] rounded-xl p-5 border border-[#e2e8f0]">
                  <h3 class="font-medium text-[#1e293b] mb-4 flex items-center gap-2">
                    <svg class="w-5 h-5 text-[#0e888d]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    Виды продукции ({{ formData.selectedProductGroups.length }})
                  </h3>
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="gv in formData.selectedProductGroups"
                      :key="gv"
                      class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0]"
                    >
                      {{ getProductGroupLabel(gv) }}
                    </span>
                  </div>
                  <p v-if="formData.productNote" class="mt-3 text-sm text-[#64748b]">
                    <span class="font-medium text-[#1e293b]">Примечание:</span> {{ formData.productNote }}
                  </p>

                  <!-- Recycler capacities in review -->
                  <div v-if="formData.activityType === 'recycler' && formData.recyclerCapacities.length > 0">
                    <h4 class="font-medium text-[#1e293b] mb-2">Мощности переработки</h4>
                    <div class="space-y-1">
                      <div v-for="cap in formData.recyclerCapacities" :key="'review-cap-' + cap.wasteType" class="flex items-center justify-between text-sm">
                        <span class="text-[#64748b]">{{ productGroups.find(g => g.value === cap.wasteType)?.label || cap.wasteType }}</span>
                        <span class="font-medium text-[#1e293b]">{{ cap.capacityTons }} т/год</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="bg-[#f8fafc] rounded-xl p-5 border border-[#e2e8f0]">
                  <h3 class="font-medium text-[#1e293b] mb-4 flex items-center gap-2">
                    <svg class="w-5 h-5 text-[#0e888d]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    Прикреплённые документы ({{ uploadedFiles.length }})
                  </h3>
                  <div v-if="uploadedFiles.length > 0" class="space-y-2">
                    <div v-for="file in uploadedFiles" :key="file.id" class="flex items-center gap-2 text-sm text-[#1e293b]">
                      <svg class="w-4 h-4 text-[#0e888d]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                      {{ fileCategories.find(c => c.value === file.category)?.label }}: {{ file.name }}
                    </div>
                  </div>
                  <p v-else class="text-sm text-[#64748b]">Документы не прикреплены</p>
                </div>

                <label class="flex items-start gap-3 p-4 rounded-xl border-2 border-[#e2e8f0] cursor-pointer hover:border-[#0e888d]/50 transition-colors">
                  <input
                    type="checkbox"
                    v-model="formData.confirmData"
                    class="w-5 h-5 mt-0.5 text-[#0e888d] border-gray-300 rounded focus:ring-[#0e888d]"
                  />
                  <span class="text-sm text-[#1e293b]">
                    Подтверждаю достоверность предоставленных данных и соглашаюсь с условиями обработки персональных данных
                  </span>
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
              <button
                v-else
                @click="registrationMode = 'choose'"
                class="flex items-center justify-center gap-2 px-5 py-2.5 border border-[#e2e8f0] rounded-lg text-[#64748b] hover:bg-white transition-colors"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
                Назад
              </button>

              <div class="flex flex-col sm:flex-row gap-3">
                <button
                  v-if="currentStep < 5"
                  @click="nextStep"
                  class="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#0e888d] text-white rounded-lg font-medium hover:bg-[#0a6b6f] transition-colors"
                >
                  Далее
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <button
                  v-if="currentStep === 5"
                  @click="submitRegistration"
                  :disabled="!formData.confirmData || !hasRequiredDocuments || isSubmitting"
                  class="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#10b981] text-white rounded-lg font-medium hover:bg-[#059669] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg v-if="isSubmitting" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {{ isSubmitting ? 'Отправка...' : 'Отправить заявку на регистрацию' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </template>

    </div>
  </div>
</template>

<style scoped>
.reg-select {
  width: 100%;
  padding: 12px 40px 12px 16px;
  border: 1.5px solid #E2E8F0;
  border-radius: 10px;
  font-size: 14px;
  background: white;
  appearance: none;
  -webkit-appearance: none;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.reg-select:focus {
  outline: none;
  border-color: #22C55E;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
}
.reg-select--error {
  border-color: #fca5a5;
}
.reg-select--error:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}
.reg-select__chevron {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}
.pg-section-title {
  font-size: 11px;
  font-weight: 600;
  color: #94A3B8;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin-bottom: 12px;
}
.pg-subtitle {
  font-size: 13px;
  color: #64748B;
  margin-bottom: 12px;
}
.pg-grid-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 16px;
  max-height: 400px;
  overflow-y: auto;
}
.pg-grid-container--error {
  border-color: #fca5a5;
}
.pg-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 8px;
  background: white;
  border: 1px solid #E2E8F0;
  cursor: pointer;
  transition: all 0.2s;
}
.pg-card:hover {
  border-color: #22C55E;
  background: #F0FDF4;
}
.pg-card--checked {
  border-color: #22C55E;
  background: #F0FDF4;
  font-weight: 600;
}
.pg-checkbox {
  accent-color: #22C55E;
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  cursor: pointer;
}
.pg-card-label {
  font-size: 13px;
  color: #1E293B;
  line-height: 1.3;
}
.pg-counter {
  font-size: 12px;
  color: #64748B;
}
.pg-toggle-btn {
  font-size: 12px;
  color: #3B82F6;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}
.pg-toggle-btn:hover {
  text-decoration: underline;
}
@media (max-width: 640px) {
  .pg-grid-container {
    grid-template-columns: 1fr;
  }
}
</style>
