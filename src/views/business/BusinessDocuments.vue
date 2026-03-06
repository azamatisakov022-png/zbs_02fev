<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import EmptyState from '../../components/dashboard/EmptyState.vue'
import DocumentPreviewModal, { type PreviewDocument } from '../../components/dashboard/DocumentPreviewModal.vue'
import { AppButton, AppBadge, AppInput, AppPageHeader, AppModal, AppCtaBanner, AppStatCard, AppSelect } from '../../components/ui'
import { getStatusBadgeVariant } from '../../utils/statusVariant'
import { statusI18nKey } from '../../constants/statuses'
import { useAccountStore } from '../../stores/account'
import { useBusinessMenu } from '../../composables/useRoleMenu'
import { toastStore } from '../../stores/toast'
import ConfirmDialog from '../../components/common/ConfirmDialog.vue'

const { roleTitle, menuItems } = useBusinessMenu()
const accountStore = useAccountStore()
const { t } = useI18n()

onMounted(() => { accountStore.fetchAll() })

// View state
const showUploadModal = ref(false)
const activeCategory = ref('all')
const searchQuery = ref('')
const filterType = ref('')
const filterYear = ref('')

const typeFilterOptions = computed(() => [
  { value: '', label: t('businessDocs.allTypes') },
  { value: 'pdf', label: 'PDF' },
  { value: 'doc', label: 'DOC/DOCX' },
  { value: 'xls', label: 'XLS/XLSX' },
])

const yearFilterOptions = computed(() => [
  { value: '', label: t('businessDocs.allTime') },
  { value: '2025', label: '2025' },
  { value: '2026', label: '2026' },
  { value: '2027', label: '2027' },
  { value: '2028', label: '2028' },
  { value: '2029', label: '2029' },
  { value: '2030', label: '2030' },
])

// Document categories
const categories = computed(() => [
  { id: 'all', name: t('businessDocs.allDocuments'), icon: 'folder', count: 24, color: 'gray' },
  { id: 'declarations', name: t('businessDocs.declarations'), icon: 'document', count: 8, color: 'blue' },
  { id: 'reports', name: t('businessDocs.reports'), icon: 'chart', count: 4, color: 'green' },
  { id: 'calculations', name: t('businessDocs.calculations'), icon: 'calculator', count: 5, color: 'amber' },
  { id: 'contracts', name: t('businessDocs.contracts'), icon: 'contract', count: 3, color: 'purple' },
  { id: 'acts', name: t('businessDocs.acts'), icon: 'clipboard', count: 4, color: 'teal' },
])

// Documents data
interface Document {
  id: number
  name: string
  category: string
  type: string
  size: string
  uploadedAt: string
  status: string
}

const documents = ref<Document[]>([
  { id: 1, name: 'Декларация ДК-2025-045.pdf', category: 'declarations', type: 'PDF', size: '245 KB', uploadedAt: '20.01.2025', status: 'Подписан' },
  { id: 2, name: 'Отчёт РП-2025-012.pdf', category: 'reports', type: 'PDF', size: '512 KB', uploadedAt: '18.01.2025', status: 'Подписан' },
  { id: 3, name: 'Расчёт РС-2025-015.pdf', category: 'calculations', type: 'PDF', size: '128 KB', uploadedAt: '18.01.2025', status: 'Подписан' },
  { id: 4, name: 'Договор с ЭкоРесайкл.pdf', category: 'contracts', type: 'PDF', size: '1.2 MB', uploadedAt: '15.01.2025', status: 'Действует' },
  { id: 5, name: 'Акт приёма-передачи №45.pdf', category: 'acts', type: 'PDF', size: '89 KB', uploadedAt: '12.01.2025', status: 'Подписан' },
  { id: 6, name: 'Декларация ДК-2024-198.pdf', category: 'declarations', type: 'PDF', size: '234 KB', uploadedAt: '15.10.2024', status: 'Подписан' },
  { id: 7, name: 'Расчёт РС-2024-089.pdf', category: 'calculations', type: 'PDF', size: '156 KB', uploadedAt: '12.10.2024', status: 'Подписан' },
  { id: 8, name: 'Квитанция ПЛ-2025-0156.pdf', category: 'calculations', type: 'PDF', size: '67 KB', uploadedAt: '18.01.2025', status: 'Оплачен' },
])

const filteredDocuments = computed(() => {
  let result = documents.value

  if (activeCategory.value !== 'all') {
    result = result.filter(d => d.category === activeCategory.value)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(d => d.name.toLowerCase().includes(query))
  }

  return result
})

// Upload functionality
const isDragging = ref(false)
const uploadedFiles = ref<Array<{ id: number; name: string; size: string; progress: number; status: string }>>([])
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
    const fileObj = {
      id: nextFileId++,
      name: file.name,
      size: formatFileSize(file.size),
      progress: 0,
      status: 'uploading'
    }
    uploadedFiles.value.push(fileObj)
    simulateUpload(fileObj)
  }
}

const simulateUpload = (file: { id: number; progress: number; status: string }) => {
  const interval = setInterval(() => {
    file.progress += Math.random() * 30
    if (file.progress >= 100) {
      file.progress = 100
      file.status = 'complete'
      clearInterval(interval)
    }
  }, 300)
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const removeUploadedFile = (id: number) => {
  uploadedFiles.value = uploadedFiles.value.filter(f => f.id !== id)
}

const closeUploadModal = () => {
  showUploadModal.value = false
  uploadedFiles.value = []
}

const finishUpload = () => {
  // Add uploaded files to documents list
  uploadedFiles.value.forEach(file => {
    if (file.status === 'complete') {
      documents.value.unshift({
        id: Date.now() + Math.random(),
        name: file.name,
        category: 'acts',
        type: file.name.split('.').pop()?.toUpperCase() || 'FILE',
        size: file.size,
        uploadedAt: new Date().toLocaleDateString(),
        status: t('businessDocs.statusUploaded')
      })
    }
  })
  closeUploadModal()
}

const getCategoryColor = (category: string) => {
  const cat = categories.value.find(c => c.id === category)
  return cat?.color || 'gray'
}

const getCategoryName = (category: string) => {
  const cat = categories.value.find(c => c.id === category)
  return cat?.name || category
}


// Document preview modal
const previewDoc = ref<PreviewDocument | null>(null)

const viewDocument = (doc: Document) => {
  previewDoc.value = {
    name: doc.name,
    type: doc.type,
    size: doc.size,
    date: doc.uploadedAt,
    status: doc.status,
    category: getCategoryName(doc.category),
  }
}

const downloadDocument = (doc: Document) => {
  toastStore.show({ type: 'info', title: t('businessDocs.downloading'), message: t('businessDocs.downloadAvailableAfterStorage') })
}

// Confirm dialog state
const confirmDialog = ref({
  visible: false,
  title: '',
  message: '',
  icon: 'danger' as 'warning' | 'danger' | 'info' | 'success',
  confirmText: '',
  confirmColor: 'red' as 'green' | 'red' | 'orange',
  onConfirm: () => {},
})
const handleConfirm = () => {
  confirmDialog.value.visible = false
  confirmDialog.value.onConfirm()
}
const handleCancel = () => {
  confirmDialog.value.visible = false
}

const deleteDocument = (doc: Document) => {
  confirmDialog.value = {
    visible: true,
    title: t('businessDocs.deleteDocTitle'),
    message: t('businessDocs.deleteDocMessage', { name: doc.name }),
    icon: 'danger',
    confirmText: t('common.delete'),
    confirmColor: 'red',
    onConfirm: () => {
      documents.value = documents.value.filter(d => d.id !== doc.id)
    },
  }
}

const hasActiveFilters = computed(() => {
  return searchQuery.value !== '' || activeCategory.value !== 'all'
})

const isFilteredEmpty = computed(() => {
  return filteredDocuments.value.length === 0 && documents.value.length > 0 && hasActiveFilters.value
})

const isAbsolutelyEmpty = computed(() => {
  return documents.value.length === 0
})

const resetDocFilters = () => {
  searchQuery.value = ''
  activeCategory.value = 'all'
}
</script>

<template>
  <DashboardLayout role="business" :roleTitle="roleTitle" :userName="accountStore.myAccount?.company || ''" :menuItems="menuItems">
    <AppPageHeader :title="$t('businessDocs.title')" :subtitle="$t('businessDocs.subtitle')" titleSize="40px" subtitleSize="22px" />

    <AppCtaBanner :title="$t('businessDocs.uploadDocuments')" :description="$t('businessDocs.uploadDescription')" color="sky" class="mb-6">
      <template #icon>
        <svg class="w-8 h-8 lg:w-10 lg:h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      </template>
      <template #action>
        <AppButton variant="secondary" bg="white" color="#0ea5e9" font-size="16px" :icon="'<svg class=&quot;w-5 h-5&quot; fill=&quot;none&quot; viewBox=&quot;0 0 24 24&quot; stroke=&quot;currentColor&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; stroke-width=&quot;2&quot; d=&quot;M12 4v16m8-8H4&quot; /></svg>'" :label="$t('businessDocs.uploadFiles')" @click="showUploadModal = true" />
      </template>
    </AppCtaBanner>

    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <AppStatCard :label="$t('businessDocs.totalDocuments')" :value="String(documents.length)" />
      <AppStatCard :label="$t('businessDocs.declarations')" :value="String(documents.filter(d => d.category === 'declarations').length)" color="blue" />
      <AppStatCard :label="$t('businessDocs.reports')" :value="String(documents.filter(d => d.category === 'reports').length)" color="green" />
      <AppStatCard :label="$t('businessDocs.contracts')" :value="String(documents.filter(d => d.category === 'contracts').length)" color="purple" />
    </div>

    <!-- Categories -->
    <div class="bd-section mb-6">
      <div class="flex flex-wrap gap-2">
        <button
          v-for="category in categories"
          :key="category.id"
          @click="activeCategory = category.id"
          :class="[
            'bdoc-category-btn flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors',
            activeCategory === category.id
              ? 'bdoc-category-btn--active'
              : 'bdoc-category-btn--inactive'
          ]"
        >
          <svg v-if="category.icon === 'folder'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
          <svg v-if="category.icon === 'document'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          <svg v-if="category.icon === 'chart'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          <svg v-if="category.icon === 'calculator'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
          <svg v-if="category.icon === 'contract'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          <svg v-if="category.icon === 'clipboard'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          {{ category.name }}
          <span :class="[
            'bdoc-category-count px-1.5 py-0.5 rounded',
            activeCategory === category.id ? 'bg-white/20' : 'bdoc-category-count--inactive'
          ]">{{ category.count }}</span>
        </button>
      </div>
    </div>

    <!-- Search & Filters -->
    <div class="bd-section mb-6">
      <div class="bdoc-filter-bar">
        <div class="bdoc-filter-bar__search">
          <AppInput
            v-model="searchQuery"
            :placeholder="$t('businessDocs.searchPlaceholder')"
            size="sm"
            borderColor="#e2e8f0"
            focusColor="#0ea5e9"
            hideLabel
          >
            <template #prefix>
              <svg class="w-4 h-4" style="color: #94a3b8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </template>
          </AppInput>
        </div>
        <div class="bdoc-filter-bar__select">
          <AppSelect v-model="filterType" :options="typeFilterOptions" :placeholder="$t('businessDocs.allTypes')" size="sm" borderColor="#e2e8f0" focusColor="#0ea5e9" hideLabel />
        </div>
        <div class="bdoc-filter-bar__select">
          <AppSelect v-model="filterYear" :options="yearFilterOptions" :placeholder="$t('businessDocs.allTime')" size="sm" borderColor="#e2e8f0" focusColor="#0ea5e9" hideLabel />
        </div>
      </div>
    </div>

    <!-- Documents List -->
    <div class="bd-card overflow-hidden">
      <div class="bd-card__header">
        <h2 class="bdoc-list-title font-semibold">
          {{ activeCategory === 'all' ? $t('businessDocs.allDocuments') : getCategoryName(activeCategory) }}
          <span class="bdoc-list-count font-normal">({{ filteredDocuments.length }})</span>
        </h2>
      </div>

      <!-- Desktop document list -->
      <div v-if="filteredDocuments.length > 0" class="bdoc-list-divider hidden md:block">
        <div
          v-for="doc in filteredDocuments"
          :key="doc.id"
          class="bdoc-doc-row px-6 py-4 flex items-center gap-4 transition-colors"
        >
          <!-- Icon -->
          <div :class="[
            'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
            doc.type === 'PDF' ? 'bg-red-100' : doc.type === 'DOC' || doc.type === 'DOCX' ? 'bg-blue-100' : 'bg-green-100'
          ]">
            <svg v-if="doc.type === 'PDF'" class="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <svg v-else class="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <p class="bdoc-doc-name font-medium truncate">{{ doc.name }}</p>
            <div class="bdoc-doc-meta flex items-center gap-3">
              <span>{{ doc.type }}</span>
              <span>&middot;</span>
              <span>{{ doc.size }}</span>
              <span>&middot;</span>
              <span>{{ doc.uploadedAt }}</span>
            </div>
          </div>

          <!-- Category Badge -->
          <span :class="[
            'bdoc-category-badge hidden sm:inline-block px-2 py-1 rounded font-medium',
            getCategoryColor(doc.category) === 'blue' ? 'bg-blue-100 text-blue-800' :
            getCategoryColor(doc.category) === 'green' ? 'bg-green-100 text-green-800' :
            getCategoryColor(doc.category) === 'amber' ? 'bg-amber-100 text-amber-800' :
            getCategoryColor(doc.category) === 'purple' ? 'bg-purple-100 text-purple-800' :
            getCategoryColor(doc.category) === 'teal' ? 'bg-teal-100 text-teal-800' :
            'bg-gray-100 text-gray-800'
          ]">
            {{ getCategoryName(doc.category) }}
          </span>

          <!-- Status -->
          <AppBadge :variant="getStatusBadgeVariant(doc.status)">{{ $t(statusI18nKey[doc.status] || doc.status) }}</AppBadge>

          <!-- Actions -->
          <div class="flex items-center gap-2">
            <AppButton variant="ghost" size="sm" @click="viewDocument(doc)">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {{ $t('common.view') }}
            </AppButton>
            <AppButton variant="outline" size="sm" @click="downloadDocument(doc)">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {{ $t('common.download') }}
            </AppButton>
            <AppButton variant="danger" size="sm" @click="deleteDocument(doc)">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              {{ $t('common.delete') }}
            </AppButton>
          </div>
        </div>
      </div>

      <!-- Mobile document cards -->
      <div v-if="filteredDocuments.length > 0" class="bdoc-list-divider md:hidden">
        <div
          v-for="doc in filteredDocuments"
          :key="'m-' + doc.id"
          class="p-4 space-y-3"
        >
          <div class="flex items-start gap-3">
            <div :class="[
              'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
              doc.type === 'PDF' ? 'bg-red-100' : doc.type === 'DOC' || doc.type === 'DOCX' ? 'bg-blue-100' : 'bg-green-100'
            ]">
              <svg v-if="doc.type === 'PDF'" class="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <svg v-else class="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <p class="bdoc-doc-name font-medium truncate">{{ doc.name }}</p>
              <p class="bdoc-doc-meta mt-0.5">{{ doc.type }} &middot; {{ doc.size }} &middot; {{ doc.uploadedAt }}</p>
            </div>
            <AppBadge :variant="getStatusBadgeVariant(doc.status)">{{ $t(statusI18nKey[doc.status] || doc.status) }}</AppBadge>
          </div>
          <div class="flex gap-2">
            <AppButton variant="ghost" size="sm" class="flex-1" @click="viewDocument(doc)">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              {{ $t('businessDocs.preview') }}
            </AppButton>
            <AppButton variant="outline" size="sm" class="flex-1" @click="downloadDocument(doc)">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              {{ $t('common.download') }}
            </AppButton>
            <AppButton variant="danger" size="sm" @click="deleteDocument(doc)">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </AppButton>
          </div>
        </div>
      </div>

      <div v-else-if="isFilteredEmpty">
        <EmptyState
          :icon="'<svg class=&quot;w-10 h-10&quot; fill=&quot;none&quot; viewBox=&quot;0 0 40 40&quot; stroke=&quot;currentColor&quot; stroke-width=&quot;1.5&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; d=&quot;M35 35l-10-10m0 0A11.67 11.67 0 1025 25z&quot;/></svg>'"
          :title="$t('businessDocs.nothingFound')"
          :description="$t('businessDocs.tryChangeSearch')"
          :actionLabel="$t('businessDocs.resetFilters')"
          @action="resetDocFilters"
        />
      </div>
      <div v-else-if="isAbsolutelyEmpty">
        <EmptyState
          :icon="'<svg class=&quot;w-10 h-10&quot; fill=&quot;none&quot; viewBox=&quot;0 0 40 40&quot; stroke=&quot;currentColor&quot; stroke-width=&quot;1.5&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; d=&quot;M15 28.33h10m-10 6.67h10M28.33 35H11.67a3.33 3.33 0 01-3.34-3.33V8.33A3.33 3.33 0 0111.67 5h9.31a1.67 1.67 0 011.18.49l9.02 9.02a1.67 1.67 0 01.49 1.18v15.98A3.33 3.33 0 0128.33 35z&quot;/></svg>'"
          :title="$t('businessDocs.noDocuments')"
          :description="$t('businessDocs.docsWillAppear')"
        />
      </div>
    </div>

    <!-- Document Preview Modal -->
    <DocumentPreviewModal :doc="previewDoc" @close="previewDoc = null" />

    <AppModal :visible="showUploadModal" :title="$t('businessDocs.uploadingDocuments')" size="lg" @close="closeUploadModal">
      <div>
        <div
          @dragover.prevent="isDragging = true"
          @dragleave="isDragging = false"
          @drop.prevent="handleDrop"
          :class="[
            'border-2 border-dashed rounded-xl p-8 text-center transition-colors mb-6',
            isDragging ? 'bdoc-dropzone--active bg-sky-50' : 'bdoc-dropzone--idle'
          ]"
        >
          <div class="bdoc-dropzone-icon w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center">
            <svg class="w-8 h-8 bdoc-muted-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <p class="bdoc-doc-name font-medium mb-2">{{ $t('businessDocs.dragFilesHere') }}</p>
          <p class="bdoc-doc-meta mb-4">{{ $t('businessDocs.or') }}</p>
          <label class="bdoc-upload-btn inline-flex items-center gap-2 text-white px-5 py-2.5 rounded-lg font-medium transition-colors cursor-pointer">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            {{ $t('businessDocs.selectFiles') }}
            <input type="file" multiple class="hidden" @change="handleFileSelect" />
          </label>
          <p class="bdoc-doc-meta mt-4">{{ $t('businessDocs.fileSizeLimit') }}</p>
        </div>

        <div v-if="uploadedFiles.length > 0" class="space-y-3">
          <h3 class="bdoc-upload-heading font-medium">{{ $t('businessDocs.uploadingFiles') }}</h3>
          <div
            v-for="file in uploadedFiles"
            :key="file.id"
            class="bdoc-file-card rounded-lg p-4"
          >
            <div class="flex items-center gap-3 mb-2">
              <div class="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="bdoc-upload-heading font-medium truncate">{{ file.name }}</p>
                <p class="bdoc-doc-meta">{{ file.size }}</p>
              </div>
              <div v-if="file.status === 'complete'" class="text-green-500">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <AppButton variant="icon-danger" size="sm" @click="removeUploadedFile(file.id)">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </AppButton>
            </div>
            <div v-if="file.status === 'uploading'" class="bdoc-progress-track h-1.5 rounded-full overflow-hidden">
              <div
                class="bdoc-progress-bar h-full rounded-full transition-all duration-300"
                :style="{ width: `${file.progress}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <AppButton variant="secondary" @click="closeUploadModal">
          {{ $t('common.cancel') }}
        </AppButton>
        <AppButton
          variant="primary"
          :label="$t('businessDocs.upload')"
          :disabled="uploadedFiles.length === 0 || uploadedFiles.some(f => f.status === 'uploading')"
          @click="finishUpload"
        />
      </template>
    </AppModal>
    <ConfirmDialog
      :visible="confirmDialog.visible"
      :title="confirmDialog.title"
      :message="confirmDialog.message"
      :icon="confirmDialog.icon"
      :confirmText="confirmDialog.confirmText"
      :confirmColor="confirmDialog.confirmColor"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    />
  </DashboardLayout>
</template>

<style scoped>
.bd-section {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  border: 1px solid #e2e8f0;
}
.bd-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  border: 1px solid #e2e8f0;
}
.bd-card__header {
  padding: 16px 24px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.bd-modal__footer {
  padding: 16px 24px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
.bdoc-category-btn {
  font-size: 21px;
}
.bdoc-category-btn--active {
  background: #0ea5e9;
  color: #fff;
}
.bdoc-category-btn--inactive {
  background: #f1f5f9;
  color: #64748b;
}
.bdoc-category-btn--inactive:hover {
  background: #e2e8f0;
}
.bdoc-category-count {
  font-size: 21px;
}
.bdoc-category-count--inactive {
  background: #e2e8f0;
}
.bdoc-filter-bar {
  display: flex;
  gap: 12px;
  align-items: stretch;
}
.bdoc-filter-bar__search {
  flex: 1;
  min-width: 200px;
}
.bdoc-filter-bar__select {
  width: 180px;
  flex-shrink: 0;
}
@media (max-width: 768px) {
  .bdoc-filter-bar {
    flex-direction: column;
  }
  .bdoc-filter-bar__select {
    width: 100%;
  }
}
.bdoc-list-title {
  font-size: 28px;
  color: #1e293b;
}
.bdoc-list-count {
  font-size: 22px;
  color: #64748b;
}
.bdoc-list-divider > * + * {
  border-top: 1px solid #f1f5f9;
}
.bdoc-doc-row:hover {
  background: #f8fafc;
}
.bdoc-doc-name {
  font-size: 22px;
  color: #1e293b;
}
.bdoc-doc-meta {
  font-size: 21px;
  color: #64748b;
}
.bdoc-category-badge {
  font-size: 21px;
}
.bdoc-muted-text {
  color: #64748b;
}
.bdoc-dropzone--active {
  border-color: #0ea5e9;
}
.bdoc-dropzone--idle {
  border-color: #e2e8f0;
}
.bdoc-dropzone--idle:hover {
  border-color: #0ea5e9;
}
.bdoc-dropzone-icon {
  background: #f1f5f9;
}
.bdoc-upload-btn {
  background: #0ea5e9;
}
.bdoc-upload-btn:hover {
  background: #0284c7;
}
.bdoc-upload-heading {
  font-size: 21px;
  color: #1e293b;
}
.bdoc-file-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}
.bdoc-progress-track {
  background: #e2e8f0;
}
.bdoc-progress-bar {
  background: #0ea5e9;
}
.bdoc-modal {
  max-height: 90vh;
}
</style>
