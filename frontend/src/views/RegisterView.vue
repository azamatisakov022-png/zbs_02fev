<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { productGroups } from '../data/product-groups'
import { toastStore } from '../stores/toast'

const router = useRouter()
const { t } = useI18n()

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

// 24 группы продукции по ПКМ КР №322 — плоский список
const wasteItems = computed<WasteCategory[]>(() => [
  { value: 'g1', label: t('registerView.wasteG1') },
  { value: 'g2', label: t('registerView.wasteG2') },
  { value: 'g3', label: t('registerView.wasteG3') },
  { value: 'g4', label: t('registerView.wasteG4') },
  { value: 'g5', label: t('registerView.wasteG5') },
  { value: 'g6', label: t('registerView.wasteG6') },
  { value: 'g7', label: t('registerView.wasteG7') },
  { value: 'g8', label: t('registerView.wasteG8') },
  { value: 'g9', label: t('registerView.wasteG9') },
  { value: 'g10', label: t('registerView.wasteG10') },
  { value: 'g11', label: t('registerView.wasteG11') },
  { value: 'g12', label: t('registerView.wasteG12') },
  { value: 'g13', label: t('registerView.wasteG13') },
  { value: 'g14', label: t('registerView.wasteG14') },
  { value: 'g15', label: t('registerView.wasteG15') },
  { value: 'g16', label: t('registerView.wasteG16') },
  { value: 'g17', label: t('registerView.wasteG17') },
  { value: 'g18', label: t('registerView.wasteG18') },
  { value: 'g19', label: t('registerView.wasteG19') },
  { value: 'g20', label: t('registerView.wasteG20') },
  { value: 'g21', label: t('registerView.wasteG21') },
  { value: 'g22', label: t('registerView.wasteG22') },
  { value: 'g23', label: t('registerView.wasteG23') },
  { value: 'g24', label: t('registerView.wasteG24') },
])

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

const allWasteSelected = computed(() => esiForm.wasteCategories.length === wasteItems.value.length)

const toggleAllWaste = () => {
  if (allWasteSelected.value) {
    esiForm.wasteCategories.splice(0)
  } else {
    esiForm.wasteCategories.splice(0)
    esiForm.wasteCategories.push(...wasteItems.value.map(i => i.value))
  }
}

const validateEsiForm = (): boolean => {
  esiFormErrors.activityType = ''
  esiFormErrors.wasteCategories = ''

  if (!esiForm.activityType) {
    esiFormErrors.activityType = t('register.errors.selectActivityType')
  }
  if (esiForm.wasteCategories.length === 0) {
    esiFormErrors.wasteCategories = t('register.errors.selectAtLeastOneCategory')
  }

  return !esiFormErrors.activityType && !esiFormErrors.wasteCategories
}

const isEsiSubmitting = ref(false)
const isEsiSuccess = ref(false)
const esiRegistrationNumber = ref('')

const submitEsiRegistration = async () => {
  if (!esiForm.confirmData) {
    toastStore.show({ type: 'warning', title: t('register.toast.confirmAgreementTitle'), message: t('register.toast.confirmAgreementMessage') })
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

const steps = computed(() => [
  { number: 1, title: t('register.steps.orgType') },
  { number: 2, title: t('register.steps.orgData') },
  { number: 3, title: t('register.steps.directorContacts') },
  { number: 4, title: t('register.steps.documents') },
  { number: 5, title: t('register.steps.reviewSubmit') },
])

const orgTypeGroups = computed(() => [
  {
    label: t('register.orgTypeGroups.businessEntities'),
    options: [
      { value: 'osoo', label: t('register.orgTypes.osoo') },
      { value: 'oao', label: t('register.orgTypes.oao') },
      { value: 'zao', label: t('register.orgTypes.zao') },
      { value: 'odo', label: t('register.orgTypes.odo') },
    ],
  },
  {
    label: t('register.orgTypeGroups.stateAndMunicipal'),
    options: [
      { value: 'gp', label: t('register.orgTypes.gp') },
      { value: 'mp', label: t('register.orgTypes.mp') },
    ],
  },
  {
    label: t('register.orgTypeGroups.cooperatives'),
    options: [
      { value: 'pk', label: t('register.orgTypes.pk') },
      { value: 'pt', label: t('register.orgTypes.pt') },
      { value: 'kt', label: t('register.orgTypes.kt') },
    ],
  },
  {
    label: t('register.orgTypeGroups.nonCommercial'),
    options: [
      { value: 'oo', label: t('register.orgTypes.oo') },
      { value: 'of', label: t('register.orgTypes.of') },
      { value: 'uchrezhdenie', label: t('register.orgTypes.uchrezhdenie') },
    ],
  },
  {
    label: t('register.orgTypeGroups.individual'),
    options: [
      { value: 'ip', label: t('register.orgTypes.ip') },
      { value: 'kfh', label: t('register.orgTypes.kfh') },
    ],
  },
  {
    label: t('register.orgTypeGroups.foreign'),
    options: [
      { value: 'filial', label: t('register.orgTypes.filial') },
      { value: 'predstavitelstvo', label: t('register.orgTypes.predstavitelstvo') },
    ],
  },
])

const orgTypes = computed(() => orgTypeGroups.value.flatMap(g => g.options))

const individualOrgTypes = ['ip', 'kfh']

const isIndividual = computed(() => individualOrgTypes.includes(formData.orgType))

const activityTypes = computed(() => [
  { value: 'importer', label: t('register.activityTypes.importer') },
  { value: 'producer', label: t('register.activityTypes.producer') },
  { value: 'both', label: t('register.activityTypes.both') },
  { value: 'recycler', label: t('register.activityTypes.recycler') },
])

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

const regions = computed(() => [
  t('registerView.regionBishkek'),
  t('registerView.regionOsh'),
  t('registerView.regionChuy'),
  t('registerView.regionOshOblast'),
  t('registerView.regionJalalAbad'),
  t('registerView.regionIssykKul'),
  t('registerView.regionNaryn'),
  t('registerView.regionTalas'),
  t('registerView.regionBatken'),
])

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
  if (!formData.orgType) errors.orgType = t('register.errors.selectOrgType')
  if (!formData.activityType) errors.activityType = t('register.errors.selectActivityType')
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
    if (!formData.lastName.trim()) errors.lastName = t('register.errors.enterLastName')
    if (!formData.firstName.trim()) errors.firstName = t('register.errors.enterFirstName')
    if (!formData.passportSeries.trim()) errors.passportSeries = t('register.errors.enterPassportSeries')
    if (!formData.passportNumber.trim()) errors.passportNumber = t('register.errors.enterPassportNumber')
  } else {
    if (!formData.shortName.trim()) errors.shortName = t('register.errors.enterShortName')
    if (!formData.fullName.trim()) errors.fullName = t('register.errors.enterFullName')
  }
  if (!formData.inn.trim()) {
    errors.inn = t('register.errors.enterInn')
  } else if (!validateINN(formData.inn)) {
    errors.inn = t('register.errors.innFormat')
  }
  if (!formData.legalRegion) errors.legalRegion = t('register.errors.selectRegion')
  if (!formData.legalCity.trim()) errors.legalCity = t('register.errors.enterCity')
  if (!formData.phone || formData.phone === '+996 ') {
    errors.phone = t('register.errors.enterPhone')
  } else if (!validatePhone(formData.phone)) {
    errors.phone = t('register.errors.invalidPhone')
  }
  if (!formData.email.trim()) {
    errors.email = t('register.errors.enterEmail')
  } else if (!validateEmail(formData.email)) {
    errors.email = t('register.errors.invalidEmail')
  }
  if (formData.selectedProductGroups.length === 0) {
    errors.selectedProductGroups = t('register.errors.selectAtLeastOneProductGroup')
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

  if (!formData.directorFullName.trim()) errors.directorFullName = t('register.errors.enterDirectorFullName')
  if (!formData.directorPosition.trim()) errors.directorPosition = t('register.errors.enterPosition')
  if (!formData.directorPhone || formData.directorPhone === '+996 ') errors.directorPhone = t('register.errors.enterDirectorPhone')
  if (!formData.contactFullName.trim()) errors.contactFullName = t('register.errors.enterContactFullName')
  if (!formData.contactPhone || formData.contactPhone === '+996 ') errors.contactPhone = t('register.errors.enterContactPhone')
  if (!formData.contactEmail.trim()) {
    errors.contactEmail = t('register.errors.enterContactEmail')
  } else if (!validateEmail(formData.contactEmail)) {
    errors.contactEmail = t('register.errors.invalidEmail')
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

const fileCategories = computed(() => [
  { value: 'certificate', label: t('register.fileCategories.certificate'), required: true },
  { value: 'extract', label: t('register.fileCategories.extract'), required: false },
  { value: 'license', label: t('register.fileCategories.license'), required: false },
  { value: 'proxy', label: t('register.fileCategories.proxy'), required: false },
])

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
      toastStore.show({ type: 'warning', title: t('register.toast.invalidFormat'), message: t('register.toast.invalidFormatMessage', { name: file.name }) })
      continue
    }
    if (file.size > maxSize) {
      toastStore.show({ type: 'warning', title: t('register.toast.fileTooLarge'), message: t('register.toast.fileTooLargeMessage', { name: file.name }) })
      continue
    }
    const category = fileCategories.value.find(c => c.value === activeUploadCategory.value)
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
    toastStore.show({ type: 'warning', title: t('register.toast.confirmDataTitle'), message: t('register.toast.confirmDataMessage') })
    return
  }
  if (!hasRequiredDocuments.value) {
    toastStore.show({ type: 'warning', title: t('register.toast.missingDocument'), message: t('register.toast.missingDocumentMessage') })
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
  return orgTypes.value.find(t => t.value === value)?.label || value
}

const getActivityTypeLabel = (value: string) => {
  return activityTypes.value.find(t => t.value === value)?.label || value
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
  const item = wasteItems.value.find(i => i.value === value)
  if (item) {
    const match = item.label.match(/^\d+\.\s*(.+)$/)
    return match ? match[1] : item.label
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
          <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b] mb-2">{{ $t('register.title') }}</h1>
          <p class="text-[#64748b]">{{ $t('register.chooseMethod') }}</p>
        </div>

        <!-- ESI Button -->
        <button
          @click="handleEsiLogin"
          class="w-full flex items-center justify-center gap-3 px-6 py-5 bg-[#0e888d] hover:bg-[#0a6b6f] text-white rounded-2xl font-semibold text-lg transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 mb-4"
        >
          <svg class="w-7 h-7 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2.18l7 3.12v4.7c0 4.83-3.23 9.36-7 10.57-3.77-1.21-7-5.74-7-10.57V6.3l7-3.12zM12 7a3 3 0 00-3 3v1H8v6h8v-6h-1v-1a3 3 0 00-3-3zm0 1.5a1.5 1.5 0 011.5 1.5v1h-3v-1A1.5 1.5 0 0112 8.5z"/>
          </svg>
          {{ $t('register.registerViaEsi') }}
        </button>

        <p class="text-center text-sm text-[#64748b] mb-6">
          {{ $t('register.esiDescription') }}
        </p>

        <!-- Divider -->
        <div class="flex items-center gap-4 my-6">
          <div class="flex-1 h-px bg-[#e2e8f0]"></div>
          <span class="text-sm text-[#70868f] font-medium">{{ $t('register.or') }}</span>
          <div class="flex-1 h-px bg-[#e2e8f0]"></div>
        </div>

        <!-- Manual registration link -->
        <div class="text-center">
          <button
            @click="startManualRegistration"
            class="text-[#0e888d] text-sm font-medium hover:underline"
          >
            {{ $t('register.registerManual') }}
          </button>
        </div>

        <!-- Login link -->
        <div class="text-center mt-8">
          <p class="text-[#70868f] text-sm">
            {{ $t('register.alreadyHaveAccount') }}
            <router-link to="/login" class="text-[#0e888d] font-medium hover:underline">
              {{ $t('register.login') }}
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
        <h2 class="text-xl font-semibold text-[#415861] mb-2">{{ $t('register.connectingToEsi') }}</h2>
        <p class="text-[#70868f]">{{ $t('register.gettingOrgData') }}</p>
      </div>

      <!-- ==================== MODE: ESI (Simplified Form) ==================== -->
      <div v-if="registrationMode === 'esi' && !isEsiLoading && !isEsiSuccess" class="max-w-3xl mx-auto">
        <div class="mb-6 text-center">
          <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b] mb-2">{{ $t('register.esiTitle') }}</h1>
          <p class="text-[#64748b]">{{ $t('register.esiSubtitle') }}</p>
        </div>

        <!-- ESI Data (readonly) -->
        <div class="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] overflow-hidden mb-6">
          <div class="px-6 py-4 bg-[#e8f5f5] border-b border-[#d1e7e8] flex items-center gap-2">
            <svg class="w-5 h-5 text-[#0e888d]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2.18l7 3.12v4.7c0 4.83-3.23 9.36-7 10.57-3.77-1.21-7-5.74-7-10.57V6.3l7-3.12z"/>
            </svg>
            <span class="font-semibold text-[#0e888d]">{{ $t('register.esiDataTitle') }}</span>
            <span class="ml-auto text-xs text-[#0e888d] bg-[#d1e7e8] px-2 py-0.5 rounded-full">{{ $t('register.confirmed') }}</span>
          </div>
          <div class="p-6 space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs text-[#64748b] mb-1">{{ $t('register.inn') }}</label>
                <input
                  type="text"
                  :value="esiData.inn"
                  readonly
                  class="w-full px-4 py-3 border border-[#e2e8f0] rounded-xl bg-[#f8fafc] text-[#1e293b] font-mono cursor-not-allowed"
                />
              </div>
              <div>
                <label class="block text-xs text-[#64748b] mb-1">{{ $t('register.orgName') }}</label>
                <input
                  type="text"
                  :value="esiData.shortName"
                  readonly
                  class="w-full px-4 py-3 border border-[#e2e8f0] rounded-xl bg-[#f8fafc] text-[#1e293b] cursor-not-allowed"
                />
              </div>
              <div>
                <label class="block text-xs text-[#64748b] mb-1">{{ $t('register.directorFullName') }}</label>
                <input
                  type="text"
                  :value="esiData.directorFullName"
                  readonly
                  class="w-full px-4 py-3 border border-[#e2e8f0] rounded-xl bg-[#f8fafc] text-[#1e293b] cursor-not-allowed"
                />
              </div>
              <div>
                <label class="block text-xs text-[#64748b] mb-1">{{ $t('register.legalAddress') }}</label>
                <input
                  type="text"
                  :value="esiData.legalAddress"
                  readonly
                  class="w-full px-4 py-3 border border-[#e2e8f0] rounded-xl bg-[#f8fafc] text-[#1e293b] cursor-not-allowed"
                />
              </div>
              <div>
                <label class="block text-xs text-[#64748b] mb-1">{{ $t('register.phone') }}</label>
                <input
                  type="text"
                  :value="esiData.phone"
                  readonly
                  class="w-full px-4 py-3 border border-[#e2e8f0] rounded-xl bg-[#f8fafc] text-[#1e293b] cursor-not-allowed"
                />
              </div>
              <div>
                <label class="block text-xs text-[#64748b] mb-1">{{ $t('register.email') }}</label>
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
            <span class="font-semibold text-[#1e293b]">{{ $t('register.additionalInfo') }}</span>
          </div>
          <div class="p-6 space-y-6">
            <!-- Activity Type -->
            <div>
              <label class="block text-sm font-medium text-[#1e293b] mb-3">{{ $t('register.activityType') }} *</label>
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
              <label class="block text-sm font-medium text-[#1e293b] mb-1">{{ $t('register.wasteCategories') }} *</label>
              <p class="text-xs text-[#64748b] mb-4">{{ $t('register.wasteCategoriesHint') }}</p>

              <div class="border border-[#e2e8f0] rounded-2xl overflow-hidden">
                <!-- Header with "Выбрать все" -->
                <div class="flex items-center justify-between px-4 py-3 bg-[#e8f5f5] border-b border-[#d1e7e8]">
                  <span class="font-semibold text-[#0e888d] text-sm">{{ $t('register.productGroups24') }}</span>
                  <button
                    type="button"
                    @click="toggleAllWaste"
                    :class="[
                      'text-xs font-medium px-3 py-1 rounded-lg transition-colors',
                      allWasteSelected
                        ? 'bg-[#0e888d] text-white hover:bg-[#0a6b6f]'
                        : 'bg-white text-[#0e888d] border border-[#0e888d] hover:bg-[#f0fdfa]'
                    ]"
                  >
                    {{ allWasteSelected ? $t('register.deselectAll') : $t('register.selectAll') }}
                  </button>
                </div>
                <!-- Flat list in 2 columns -->
                <div class="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <label
                    v-for="item in wasteItems"
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

              <p v-if="esiFormErrors.wasteCategories" class="mt-2 text-sm text-red-600">{{ esiFormErrors.wasteCategories }}</p>

              <!-- Recycler Capacities (ESI) -->
              <div v-if="esiForm.activityType === 'recycler' && esiForm.wasteCategories.length > 0" class="mt-6">
                <h3 class="text-base font-semibold text-[#1e293b] mb-1">{{ $t('register.recyclingCapacity') }}</h3>
                <p class="text-sm text-[#64748b] mb-4">{{ $t('register.recyclingCapacityHint') }}</p>
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
                      <span class="text-xs text-[#94a3b8] whitespace-nowrap">{{ $t('register.tonsPerYear') }}</span>
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
                {{ $t('register.confirmDataAgreement') }}
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
              {{ $t('common.back') }}
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
              {{ isEsiSubmitting ? $t('register.sending') : $t('register.submitApplication') }}
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

        <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b] mb-4">{{ $t('register.applicationSent') }}</h1>

        <div class="bg-white rounded-2xl p-6 shadow-sm border border-[#e2e8f0] mb-8">
          <div class="text-center">
            <p class="text-sm text-[#64748b] mb-2">{{ $t('register.applicationNumber') }}</p>
            <p class="text-2xl font-bold text-[#0e888d] font-mono mb-4">{{ esiRegistrationNumber }}</p>

            <div class="bg-[#f0fdf4] rounded-xl p-4 text-left">
              <p class="text-[#166534] text-sm">
                <strong>{{ $t('register.reviewIn3Days') }}</strong><br><br>
                {{ $t('register.notificationWillBeSent') }} <strong>{{ esiData.email }}</strong>
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
          {{ $t('register.backToHome') }}
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

          <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b] mb-4">{{ $t('register.applicationSent') }}</h1>

          <div class="bg-white rounded-2xl p-6 shadow-sm border border-[#e2e8f0] mb-8">
            <div class="text-center">
              <p class="text-sm text-[#64748b] mb-2">{{ $t('register.applicationNumber') }}</p>
              <p class="text-2xl font-bold text-[#0e888d] font-mono mb-4">{{ registrationNumber }}</p>

              <div class="bg-[#f0fdf4] rounded-xl p-4 text-left">
                <p class="text-[#166534] text-sm">
                  <strong>{{ $t('register.reviewIn3Days') }}</strong><br><br>
                  {{ $t('register.notificationWillBeSentToEmail') }} <strong>{{ formData.email }}</strong>
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
            {{ $t('register.backToHome') }}
          </button>
        </div>

        <!-- Registration Form -->
        <div v-else class="max-w-4xl mx-auto">
          <!-- Header -->
          <div class="mb-6 text-center">
            <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b] mb-2">{{ $t('register.title') }}</h1>
            <p class="text-[#64748b]">{{ $t('register.manualSubtitle') }}</p>
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
              <h2 class="text-xl font-semibold text-[#1e293b] mb-6">{{ $t('register.steps.orgType') }}</h2>

              <div class="space-y-6">
                <div>
                  <label class="block text-sm font-medium text-[#1e293b] mb-3">{{ $t('register.orgLegalForm') }} *</label>
                  <div class="relative">
                    <select
                      v-model="formData.orgType"
                      :class="[
                        'reg-select',
                        errors.orgType ? 'reg-select--error' : '',
                        !formData.orgType ? 'text-[#94a3b8]' : 'text-[#1e293b]'
                      ]"
                    >
                      <option value="" disabled>{{ $t('register.selectOrgLegalForm') }}</option>
                      <optgroup v-for="group in orgTypeGroups" :key="group.label" :label="group.label">
                        <option v-for="opt in group.options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                      </optgroup>
                    </select>
                    <svg class="reg-select__chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                  <p v-if="errors.orgType" class="mt-2 text-sm text-red-600">{{ errors.orgType }}</p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-[#1e293b] mb-3">{{ $t('register.activityType') }} *</label>
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
              <h2 class="text-xl font-semibold text-[#1e293b] mb-6">{{ isIndividual ? $t('register.entrepreneurData') : $t('register.orgData') }}</h2>

              <div class="space-y-6">
                <!-- Individual (ИП/КФХ) fields -->
                <template v-if="isIndividual">
                  <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-[#1e293b] mb-2">{{ $t('register.lastName') }} *</label>
                      <input
                        v-model="formData.lastName"
                        type="text"
                        :placeholder="$t('register.placeholders.lastName')"
                        :class="[
                          'w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0e888d]/20',
                          errors.lastName ? 'border-red-300 focus:border-red-500' : 'border-[#e2e8f0] focus:border-[#0e888d]'
                        ]"
                      />
                      <p v-if="errors.lastName" class="mt-1 text-sm text-red-600">{{ errors.lastName }}</p>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-[#1e293b] mb-2">{{ $t('register.firstName') }} *</label>
                      <input
                        v-model="formData.firstName"
                        type="text"
                        :placeholder="$t('register.placeholders.firstName')"
                        :class="[
                          'w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0e888d]/20',
                          errors.firstName ? 'border-red-300 focus:border-red-500' : 'border-[#e2e8f0] focus:border-[#0e888d]'
                        ]"
                      />
                      <p v-if="errors.firstName" class="mt-1 text-sm text-red-600">{{ errors.firstName }}</p>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-[#1e293b] mb-2">{{ $t('register.middleName') }}</label>
                      <input
                        v-model="formData.middleName"
                        type="text"
                        :placeholder="$t('register.placeholders.middleName')"
                        class="w-full px-4 py-3 border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0e888d] focus:ring-2 focus:ring-[#0e888d]/20"
                      />
                    </div>
                  </div>
                  <div class="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-[#1e293b] mb-2">{{ $t('register.passportSeries') }} *</label>
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
                      <label class="block text-sm font-medium text-[#1e293b] mb-2">{{ $t('register.passportNumber') }} *</label>
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
                      <label class="block text-sm font-medium text-[#1e293b] mb-2">{{ $t('register.passportIssuedBy') }}</label>
                      <input
                        v-model="formData.passportIssuedBy"
                        type="text"
                        placeholder="МКК-50-11"
                        class="w-full px-4 py-3 border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0e888d] focus:ring-2 focus:ring-[#0e888d]/20"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-[#1e293b] mb-2">{{ $t('register.passportDate') }}</label>
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
                      <label class="block text-sm font-medium text-[#1e293b] mb-2">{{ $t('register.shortName') }} *</label>
                      <input
                        v-model="formData.shortName"
                        type="text"
                        :placeholder="$t('register.placeholders.shortName')"
                        :class="[
                          'w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0e888d]/20',
                          errors.shortName ? 'border-red-300 focus:border-red-500' : 'border-[#e2e8f0] focus:border-[#0e888d]'
                        ]"
                      />
                      <p v-if="errors.shortName" class="mt-1 text-sm text-red-600">{{ errors.shortName }}</p>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-[#1e293b] mb-2">{{ $t('register.fullName') }} *</label>
                      <input
                        v-model="formData.fullName"
                        type="text"
                        :placeholder="$t('register.placeholders.fullName')"
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
                    <label class="block text-sm font-medium text-[#1e293b] mb-2">{{ $t('register.inn14') }} *</label>
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
                    <label class="block text-sm font-medium text-[#1e293b] mb-2">{{ $t('register.okpo') }}</label>
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
                  <h3 class="pg-section-title">{{ $t('register.productTypes') }}</h3>
                  <p class="pg-subtitle">{{ $t('register.productTypesHint') }} *</p>

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
                      {{ $t('register.selected') }}: {{ formData.selectedProductGroups.length }} {{ $t('register.outOf') }} {{ productGroups.length }} {{ $t('register.groups') }}
                    </span>
                    <button
                      type="button"
                      @click="toggleAllProductGroups"
                      class="pg-toggle-btn"
                    >
                      {{ allProductGroupsSelected ? $t('register.deselectAll') : $t('register.selectAll') }}
                    </button>
                  </div>

                  <p v-if="errors.selectedProductGroups" class="mt-2 text-sm text-red-600">{{ errors.selectedProductGroups }}</p>

                  <!-- Recycler Capacities (Manual) -->
                  <div v-if="formData.activityType === 'recycler' && formData.selectedProductGroups.length > 0" class="mt-6">
                    <h3 class="text-base font-semibold text-[#1e293b] mb-1">{{ $t('register.recyclingCapacity') }}</h3>
                    <p class="text-sm text-[#64748b] mb-4">{{ $t('register.recyclingCapacityHintManual') }}</p>
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
                          <span class="text-xs text-[#94a3b8] whitespace-nowrap">{{ $t('register.tonsPerYear') }}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="mt-4">
                    <label class="block text-sm font-medium text-[#1e293b] mb-1">{{ $t('register.productNote') }}</label>
                    <input
                      v-model="formData.productNote"
                      type="text"
                      :placeholder="$t('register.placeholders.productNote')"
                      class="w-full px-4 py-3 border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0e888d] focus:ring-2 focus:ring-[#0e888d]/20 text-sm"
                    />
                    <p class="mt-1 text-xs text-[#94a3b8]">{{ $t('register.productNoteHint') }}</p>
                  </div>
                </div>

                <div>
                  <h3 class="text-sm font-semibold text-[#1e293b] mb-3 uppercase tracking-wide">{{ $t('register.legalAddress') }}</h3>
                  <div class="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    <div>
                      <label class="block text-xs text-[#64748b] mb-1">{{ $t('register.regionCity') }} *</label>
                      <select
                        v-model="formData.legalRegion"
                        :class="[
                          'w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e888d]/20',
                          errors.legalRegion ? 'border-red-300' : 'border-[#e2e8f0] focus:border-[#0e888d]'
                        ]"
                      >
                        <option value="">{{ $t('register.select') }}</option>
                        <option v-for="r in regions" :key="r" :value="r">{{ r }}</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-xs text-[#64748b] mb-1">{{ $t('register.cityDistrict') }} *</label>
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
                      <label class="block text-xs text-[#64748b] mb-1">{{ $t('register.street') }}</label>
                      <input
                        v-model="formData.legalStreet"
                        type="text"
                        class="w-full px-3 py-2.5 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#0e888d]"
                      />
                    </div>
                    <div>
                      <label class="block text-xs text-[#64748b] mb-1">{{ $t('register.buildingOffice') }}</label>
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
                    <h3 class="text-sm font-semibold text-[#1e293b] uppercase tracking-wide">{{ $t('register.actualAddress') }}</h3>
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        v-model="formData.sameAddress"
                        @change="copyLegalToActual"
                        class="w-4 h-4 text-[#0e888d] border-gray-300 rounded focus:ring-[#0e888d]"
                      />
                      <span class="text-sm text-[#64748b]">{{ $t('register.sameAsLegal') }}</span>
                    </label>
                  </div>
                  <div class="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    <div>
                      <label class="block text-xs text-[#64748b] mb-1">{{ $t('register.regionCity') }}</label>
                      <select
                        v-model="formData.actualRegion"
                        :disabled="formData.sameAddress"
                        class="w-full px-3 py-2.5 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#0e888d] disabled:bg-gray-100"
                      >
                        <option value="">{{ $t('register.select') }}</option>
                        <option v-for="r in regions" :key="r" :value="r">{{ r }}</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-xs text-[#64748b] mb-1">{{ $t('register.cityDistrict') }}</label>
                      <input
                        v-model="formData.actualCity"
                        type="text"
                        :disabled="formData.sameAddress"
                        class="w-full px-3 py-2.5 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#0e888d] disabled:bg-gray-100"
                      />
                    </div>
                    <div>
                      <label class="block text-xs text-[#64748b] mb-1">{{ $t('register.street') }}</label>
                      <input
                        v-model="formData.actualStreet"
                        type="text"
                        :disabled="formData.sameAddress"
                        class="w-full px-3 py-2.5 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#0e888d] disabled:bg-gray-100"
                      />
                    </div>
                    <div>
                      <label class="block text-xs text-[#64748b] mb-1">{{ $t('register.buildingOffice') }}</label>
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
                    <label class="block text-sm font-medium text-[#1e293b] mb-2">{{ $t('register.contactPhone') }} *</label>
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
                    <label class="block text-sm font-medium text-[#1e293b] mb-2">{{ $t('register.email') }} *</label>
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
              <h2 class="text-xl font-semibold text-[#1e293b] mb-6">{{ $t('register.directorAndContact') }}</h2>

              <div class="space-y-8">
                <div>
                  <h3 class="text-sm font-semibold text-[#1e293b] mb-4 uppercase tracking-wide flex items-center gap-2">
                    <svg class="w-5 h-5 text-[#0e888d]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {{ $t('register.orgDirector') }}
                  </h3>
                  <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div>
                      <label class="block text-xs text-[#64748b] mb-1">{{ $t('register.fullNameLabel') }} *</label>
                      <input
                        v-model="formData.directorFullName"
                        type="text"
                        :placeholder="$t('register.placeholders.directorFullName')"
                        :class="[
                          'w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e888d]/20',
                          errors.directorFullName ? 'border-red-300' : 'border-[#e2e8f0] focus:border-[#0e888d]'
                        ]"
                      />
                      <p v-if="errors.directorFullName" class="mt-1 text-xs text-red-600">{{ errors.directorFullName }}</p>
                    </div>
                    <div>
                      <label class="block text-xs text-[#64748b] mb-1">{{ $t('register.position') }} *</label>
                      <input
                        v-model="formData.directorPosition"
                        type="text"
                        :placeholder="$t('register.placeholders.position')"
                        :class="[
                          'w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e888d]/20',
                          errors.directorPosition ? 'border-red-300' : 'border-[#e2e8f0] focus:border-[#0e888d]'
                        ]"
                      />
                      <p v-if="errors.directorPosition" class="mt-1 text-xs text-red-600">{{ errors.directorPosition }}</p>
                    </div>
                    <div>
                      <label class="block text-xs text-[#64748b] mb-1">{{ $t('register.phone') }} *</label>
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
                    {{ $t('register.contactPerson') }}
                  </h3>
                  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-xs text-[#64748b] mb-1">{{ $t('register.fullNameLabel') }} *</label>
                      <input
                        v-model="formData.contactFullName"
                        type="text"
                        :placeholder="$t('register.placeholders.contactFullName')"
                        :class="[
                          'w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e888d]/20',
                          errors.contactFullName ? 'border-red-300' : 'border-[#e2e8f0] focus:border-[#0e888d]'
                        ]"
                      />
                      <p v-if="errors.contactFullName" class="mt-1 text-xs text-red-600">{{ errors.contactFullName }}</p>
                    </div>
                    <div>
                      <label class="block text-xs text-[#64748b] mb-1">{{ $t('register.position') }}</label>
                      <input
                        v-model="formData.contactPosition"
                        type="text"
                        :placeholder="$t('register.placeholders.contactPosition')"
                        class="w-full px-3 py-2.5 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#0e888d]"
                      />
                    </div>
                    <div>
                      <label class="block text-xs text-[#64748b] mb-1">{{ $t('register.phone') }} *</label>
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
                      <label class="block text-xs text-[#64748b] mb-1">{{ $t('register.email') }} *</label>
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
              <h2 class="text-xl font-semibold text-[#1e293b] mb-6">{{ $t('register.uploadDocuments') }}</h2>

              <div class="space-y-6">
                <div v-for="cat in fileCategories" :key="cat.value" class="border border-[#e2e8f0] rounded-xl p-4">
                  <div class="flex items-start justify-between mb-3">
                    <div>
                      <h3 class="font-medium text-[#1e293b]">
                        {{ cat.label }}
                        <span v-if="cat.required" class="text-red-500">*</span>
                      </h3>
                      <p class="text-xs text-[#64748b] mt-1">{{ $t('register.fileFormats') }}</p>
                    </div>
                    <label class="inline-flex items-center gap-2 bg-[#0e888d] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#0a6b6f] transition-colors cursor-pointer">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      {{ $t('register.selectFile') }}
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
                    {{ $t('register.fileNotUploaded') }}
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
                  <p class="text-sm text-[#64748b]">{{ $t('register.dragFilesHere') }}</p>
                </div>

                <div v-if="!hasRequiredDocuments" class="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                  <svg class="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p class="text-sm text-amber-800">{{ $t('register.uploadRequiredDoc') }}</p>
                </div>
              </div>
            </div>

            <!-- Step 5: Review -->
            <div v-if="currentStep === 5" class="p-6 lg:p-8">
              <h2 class="text-xl font-semibold text-[#1e293b] mb-6">{{ $t('register.steps.reviewSubmit') }}</h2>

              <div class="space-y-6">
                <div class="bg-[#f8fafc] rounded-xl p-5 border border-[#e2e8f0]">
                  <h3 class="font-medium text-[#1e293b] mb-4 flex items-center gap-2">
                    <svg class="w-5 h-5 text-[#0e888d]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    {{ $t('register.steps.orgType') }}
                  </h3>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span class="text-[#64748b]">{{ $t('register.orgLegalForm') }}:</span>
                      <p class="font-medium text-[#1e293b]">{{ getOrgTypeLabel(formData.orgType) }}</p>
                    </div>
                    <div>
                      <span class="text-[#64748b]">{{ $t('register.activityType') }}:</span>
                      <p class="font-medium text-[#1e293b]">{{ getActivityTypeLabel(formData.activityType) }}</p>
                    </div>
                  </div>
                </div>

                <div class="bg-[#f8fafc] rounded-xl p-5 border border-[#e2e8f0]">
                  <h3 class="font-medium text-[#1e293b] mb-4 flex items-center gap-2">
                    <svg class="w-5 h-5 text-[#0e888d]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {{ isIndividual ? $t('register.entrepreneurData') : $t('register.orgData') }}
                  </h3>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div v-if="isIndividual">
                      <span class="text-[#64748b]">{{ $t('register.fullNameLabel') }}:</span>
                      <p class="font-medium text-[#1e293b]">{{ formData.lastName }} {{ formData.firstName }} {{ formData.middleName }}</p>
                    </div>
                    <div v-if="isIndividual">
                      <span class="text-[#64748b]">{{ $t('register.passport') }}:</span>
                      <p class="font-medium text-[#1e293b] font-mono">{{ formData.passportSeries }} {{ formData.passportNumber }}</p>
                    </div>
                    <div v-if="!isIndividual">
                      <span class="text-[#64748b]">{{ $t('register.orgName') }}:</span>
                      <p class="font-medium text-[#1e293b]">{{ formData.shortName }}</p>
                    </div>
                    <div>
                      <span class="text-[#64748b]">{{ $t('register.inn') }}:</span>
                      <p class="font-medium text-[#1e293b] font-mono">{{ formData.inn }}</p>
                    </div>
                    <div class="sm:col-span-2">
                      <span class="text-[#64748b]">{{ $t('register.legalAddress') }}:</span>
                      <p class="font-medium text-[#1e293b]">
                        {{ formData.legalRegion }}, {{ formData.legalCity }}
                        <template v-if="formData.legalStreet">, {{ formData.legalStreet }}</template>
                        <template v-if="formData.legalBuilding">, {{ formData.legalBuilding }}</template>
                      </p>
                    </div>
                    <div>
                      <span class="text-[#64748b]">{{ $t('register.phone') }}:</span>
                      <p class="font-medium text-[#1e293b]">{{ formData.phone }}</p>
                    </div>
                    <div>
                      <span class="text-[#64748b]">{{ $t('register.email') }}:</span>
                      <p class="font-medium text-[#1e293b]">{{ formData.email }}</p>
                    </div>
                  </div>
                </div>

                <div class="bg-[#f8fafc] rounded-xl p-5 border border-[#e2e8f0]">
                  <h3 class="font-medium text-[#1e293b] mb-4 flex items-center gap-2">
                    <svg class="w-5 h-5 text-[#0e888d]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {{ $t('register.directorAndContact') }}
                  </h3>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span class="text-[#64748b]">{{ $t('register.director') }}:</span>
                      <p class="font-medium text-[#1e293b]">{{ formData.directorFullName }}</p>
                      <p class="text-[#64748b]">{{ formData.directorPosition }}, {{ formData.directorPhone }}</p>
                    </div>
                    <div>
                      <span class="text-[#64748b]">{{ $t('register.contactPerson') }}:</span>
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
                    {{ $t('register.productTypes') }} ({{ formData.selectedProductGroups.length }})
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
                    <span class="font-medium text-[#1e293b]">{{ $t('register.note') }}:</span> {{ formData.productNote }}
                  </p>

                  <!-- Recycler capacities in review -->
                  <div v-if="formData.activityType === 'recycler' && formData.recyclerCapacities.length > 0">
                    <h4 class="font-medium text-[#1e293b] mb-2">{{ $t('register.recyclingCapacityTitle') }}</h4>
                    <div class="space-y-1">
                      <div v-for="cap in formData.recyclerCapacities" :key="'review-cap-' + cap.wasteType" class="flex items-center justify-between text-sm">
                        <span class="text-[#64748b]">{{ productGroups.find(g => g.value === cap.wasteType)?.label || cap.wasteType }}</span>
                        <span class="font-medium text-[#1e293b]">{{ cap.capacityTons }} {{ $t('register.tonsPerYear') }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="bg-[#f8fafc] rounded-xl p-5 border border-[#e2e8f0]">
                  <h3 class="font-medium text-[#1e293b] mb-4 flex items-center gap-2">
                    <svg class="w-5 h-5 text-[#0e888d]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    {{ $t('register.attachedDocuments') }} ({{ uploadedFiles.length }})
                  </h3>
                  <div v-if="uploadedFiles.length > 0" class="space-y-2">
                    <div v-for="file in uploadedFiles" :key="file.id" class="flex items-center gap-2 text-sm text-[#1e293b]">
                      <svg class="w-4 h-4 text-[#0e888d]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                      {{ fileCategories.find(c => c.value === file.category)?.label }}: {{ file.name }}
                    </div>
                  </div>
                  <p v-else class="text-sm text-[#64748b]">{{ $t('register.noDocumentsAttached') }}</p>
                </div>

                <label class="flex items-start gap-3 p-4 rounded-xl border-2 border-[#e2e8f0] cursor-pointer hover:border-[#0e888d]/50 transition-colors">
                  <input
                    type="checkbox"
                    v-model="formData.confirmData"
                    class="w-5 h-5 mt-0.5 text-[#0e888d] border-gray-300 rounded focus:ring-[#0e888d]"
                  />
                  <span class="text-sm text-[#1e293b]">
                    {{ $t('register.confirmDataAgreement') }}
                  </span>
                </label>
              </div>
            </div>

            <!-- Navigation Buttons -->
            <div class="px-6 lg:px-8 py-4 bg-[#f8fafc] border-t border-[#e2e8f0] flex flex-col-reverse sm:flex-row justify-between gap-3 sm:gap-4 sticky bottom-0 z-10 rounded-b-2xl">
              <button
                v-if="currentStep > 1"
                @click="prevStep"
                class="flex items-center justify-center gap-2 px-5 py-2.5 border border-[#e2e8f0] rounded-lg text-[#64748b] hover:bg-white transition-colors"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
                {{ $t('common.back') }}
              </button>
              <button
                v-else
                @click="registrationMode = 'choose'"
                class="flex items-center justify-center gap-2 px-5 py-2.5 border border-[#e2e8f0] rounded-lg text-[#64748b] hover:bg-white transition-colors"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
                {{ $t('common.back') }}
              </button>

              <div class="flex flex-col sm:flex-row gap-3">
                <button
                  v-if="currentStep < 5"
                  @click="nextStep"
                  class="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#0e888d] text-white rounded-lg font-medium hover:bg-[#0a6b6f] transition-colors"
                >
                  {{ $t('common.next') }}
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
                  {{ isSubmitting ? $t('register.sending') : $t('register.submitApplication') }}
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
