<script setup lang="ts">
import { ref, computed } from 'vue'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import EmptyState from '../../components/dashboard/EmptyState.vue'
import { icons } from '../../utils/menuIcons'

const menuItems = [
  { id: 'dashboard', label: 'Главная', icon: icons.dashboard, route: '/business' },
  { id: 'calculator', label: 'Расчёт утильсбора', icon: icons.calculator, route: '/business/calculator' },
  { id: 'reports', label: 'Отчёты о переработке', icon: icons.report, route: '/business/reports' },
  { id: 'declarations', label: 'Декларации', icon: icons.document, route: '/business/declarations' },
  { id: 'payments', label: 'Платежи', icon: icons.payment, route: '/business/payments' },
  { id: 'refunds', label: 'Возврат утильсбора', icon: icons.refund, route: '/business/refunds' },
  { id: 'documents', label: 'Документы', icon: icons.folder, route: '/business/documents' },
  { id: 'normatives', label: 'Нормативы и ставки', icon: icons.registries, route: '/business/normatives' },
  { id: 'profile', label: 'Профиль компании', icon: icons.building, route: '/business/profile' },
]

// View state
const showUploadModal = ref(false)
const activeCategory = ref('all')
const searchQuery = ref('')

// Document categories
const categories = [
  { id: 'all', name: 'Все документы', icon: 'folder', count: 24, color: 'gray' },
  { id: 'declarations', name: 'Декларации', icon: 'document', count: 8, color: 'blue' },
  { id: 'reports', name: 'Отчёты', icon: 'chart', count: 4, color: 'green' },
  { id: 'calculations', name: 'Расчёты', icon: 'calculator', count: 5, color: 'amber' },
  { id: 'contracts', name: 'Договоры', icon: 'contract', count: 3, color: 'purple' },
  { id: 'acts', name: 'Акты', icon: 'clipboard', count: 4, color: 'teal' },
]

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
        uploadedAt: new Date().toLocaleDateString('ru-RU'),
        status: 'Загружен'
      })
    }
  })
  closeUploadModal()
}

const getCategoryColor = (category: string) => {
  const cat = categories.find(c => c.id === category)
  return cat?.color || 'gray'
}

const getCategoryName = (category: string) => {
  const cat = categories.find(c => c.id === category)
  return cat?.name || category
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'Подписан': return 'bg-green-100 text-green-800'
    case 'Действует': return 'bg-blue-100 text-blue-800'
    case 'Оплачен': return 'bg-purple-100 text-purple-800'
    case 'Загружен': return 'bg-gray-100 text-gray-800'
    case 'Истёк': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const downloadDocument = (doc: Document) => {
  alert(`Скачивание: ${doc.name}`)
}

const viewDocument = (doc: Document) => {
  alert(`Просмотр: ${doc.name}`)
}

const deleteDocument = (doc: Document) => {
  if (confirm(`Удалить документ "${doc.name}"?`)) {
    documents.value = documents.value.filter(d => d.id !== doc.id)
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
  <DashboardLayout role="business" roleTitle="Плательщик" userName="ОсОО «ТехПром»" :menuItems="menuItems">
    <div class="content__header mb-6">
      <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b] mb-2">Документы</h1>
      <p class="text-[#64748b]">Управление документами компании</p>
    </div>

    <!-- CTA Banner -->
    <div class="mb-6 bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] rounded-2xl p-6 lg:p-8 text-white relative overflow-hidden">
      <div class="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
      <div class="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
      <div class="relative flex flex-col lg:flex-row lg:items-center gap-6">
        <div class="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <svg class="w-8 h-8 lg:w-10 lg:h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <div class="flex-1">
          <h2 class="text-xl lg:text-2xl font-bold mb-2">Загрузить документы</h2>
          <p class="text-white/80 text-sm lg:text-base">Загрузите договоры, акты и другие подтверждающие документы. Поддерживаются форматы PDF, DOC, DOCX, XLS, XLSX.</p>
        </div>
        <button
          @click="showUploadModal = true"
          class="flex items-center justify-center gap-2 bg-white text-[#0ea5e9] px-6 py-3 lg:px-8 lg:py-4 rounded-xl font-semibold hover:bg-sky-50 transition-colors shadow-lg flex-shrink-0"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Загрузить файлы
        </button>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
        <p class="text-sm text-[#64748b] mb-1">Всего документов</p>
        <p class="text-2xl font-bold text-[#1e293b]">{{ documents.length }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
        <p class="text-sm text-[#64748b] mb-1">Декларации</p>
        <p class="text-2xl font-bold text-[#2563eb]">{{ documents.filter(d => d.category === 'declarations').length }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
        <p class="text-sm text-[#64748b] mb-1">Отчёты</p>
        <p class="text-2xl font-bold text-[#10b981]">{{ documents.filter(d => d.category === 'reports').length }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
        <p class="text-sm text-[#64748b] mb-1">Договоры</p>
        <p class="text-2xl font-bold text-[#8b5cf6]">{{ documents.filter(d => d.category === 'contracts').length }}</p>
      </div>
    </div>

    <!-- Categories -->
    <div class="bg-white rounded-2xl p-4 shadow-sm border border-[#e2e8f0] mb-6">
      <div class="flex flex-wrap gap-2">
        <button
          v-for="category in categories"
          :key="category.id"
          @click="activeCategory = category.id"
          :class="[
            'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors',
            activeCategory === category.id
              ? 'bg-[#0ea5e9] text-white'
              : 'bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0]'
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
            'text-xs px-1.5 py-0.5 rounded',
            activeCategory === category.id ? 'bg-white/20' : 'bg-[#e2e8f0]'
          ]">{{ category.count }}</span>
        </button>
      </div>
    </div>

    <!-- Search -->
    <div class="bg-white rounded-2xl p-4 shadow-sm border border-[#e2e8f0] mb-6">
      <div class="flex flex-wrap gap-4">
        <div class="flex-1 min-w-[250px] relative">
          <svg class="w-5 h-5 text-[#64748b] absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Поиск по названию документа..."
            class="w-full pl-10 pr-4 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#0ea5e9]"
          />
        </div>
        <select class="px-4 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#0ea5e9]">
          <option value="">Все типы</option>
          <option value="pdf">PDF</option>
          <option value="doc">DOC/DOCX</option>
          <option value="xls">XLS/XLSX</option>
        </select>
        <select class="px-4 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#0ea5e9]">
          <option value="">За всё время</option>
          <option value="2025">2025</option>
          <option value="2026">2026</option>
          <option value="2027">2027</option>
          <option value="2028">2028</option>
          <option value="2029">2029</option>
          <option value="2030">2030</option>
        </select>
      </div>
    </div>

    <!-- Documents List -->
    <div class="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] overflow-hidden">
      <div class="px-6 py-4 border-b border-[#e2e8f0] flex items-center justify-between">
        <h2 class="font-semibold text-[#1e293b]">
          {{ activeCategory === 'all' ? 'Все документы' : getCategoryName(activeCategory) }}
          <span class="text-[#64748b] font-normal">({{ filteredDocuments.length }})</span>
        </h2>
      </div>

      <div v-if="filteredDocuments.length > 0" class="divide-y divide-[#f1f5f9]">
        <div
          v-for="doc in filteredDocuments"
          :key="doc.id"
          class="px-6 py-4 flex items-center gap-4 hover:bg-[#f8fafc] transition-colors"
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
            <p class="font-medium text-[#1e293b] truncate">{{ doc.name }}</p>
            <div class="flex items-center gap-3 text-sm text-[#64748b]">
              <span>{{ doc.type }}</span>
              <span>•</span>
              <span>{{ doc.size }}</span>
              <span>•</span>
              <span>{{ doc.uploadedAt }}</span>
            </div>
          </div>

          <!-- Category Badge -->
          <span :class="[
            'hidden sm:inline-block px-2 py-1 rounded text-xs font-medium',
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
          <span :class="['px-3 py-1 rounded-full text-xs font-medium', getStatusClass(doc.status)]">
            {{ doc.status }}
          </span>

          <!-- Actions -->
          <div class="flex items-center gap-2">
            <button
              @click="viewDocument(doc)"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#3B82F6] text-white hover:bg-[#2563EB] transition-colors shadow-sm"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Просмотреть
            </button>
            <button
              @click="downloadDocument(doc)"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#8B5CF6] text-white hover:bg-[#7C3AED] transition-colors shadow-sm"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Скачать
            </button>
            <button
              @click="deleteDocument(doc)"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#EF4444] text-white hover:bg-[#DC2626] transition-colors shadow-sm"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Удалить
            </button>
          </div>
        </div>
      </div>

      <div v-else-if="isFilteredEmpty">
        <EmptyState
          :icon="'<svg class=&quot;w-10 h-10&quot; fill=&quot;none&quot; viewBox=&quot;0 0 40 40&quot; stroke=&quot;currentColor&quot; stroke-width=&quot;1.5&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; d=&quot;M35 35l-10-10m0 0A11.67 11.67 0 1025 25z&quot;/></svg>'"
          title="Ничего не найдено"
          description="Попробуйте изменить параметры поиска"
          actionLabel="Сбросить фильтры"
          @action="resetDocFilters"
        />
      </div>
      <div v-else-if="isAbsolutelyEmpty">
        <EmptyState
          :icon="'<svg class=&quot;w-10 h-10&quot; fill=&quot;none&quot; viewBox=&quot;0 0 40 40&quot; stroke=&quot;currentColor&quot; stroke-width=&quot;1.5&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; d=&quot;M15 28.33h10m-10 6.67h10M28.33 35H11.67a3.33 3.33 0 01-3.34-3.33V8.33A3.33 3.33 0 0111.67 5h9.31a1.67 1.67 0 011.18.49l9.02 9.02a1.67 1.67 0 01.49 1.18v15.98A3.33 3.33 0 0128.33 35z&quot;/></svg>'"
          title="Нет документов"
          description="Документы появятся после завершения расчётов"
        />
      </div>
    </div>

    <!-- Upload Modal -->
    <div
      v-if="showUploadModal"
      class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      @click.self="closeUploadModal"
    >
      <div class="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-[#e2e8f0] flex items-center justify-between">
          <h2 class="text-xl font-semibold text-[#1e293b]">Загрузка документов</h2>
          <button @click="closeUploadModal" class="p-2 text-[#64748b] hover:bg-[#f1f5f9] rounded-lg">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Content -->
        <div class="p-6 overflow-y-auto flex-1">
          <!-- Drop Zone -->
          <div
            @dragover.prevent="isDragging = true"
            @dragleave="isDragging = false"
            @drop.prevent="handleDrop"
            :class="[
              'border-2 border-dashed rounded-xl p-8 text-center transition-colors mb-6',
              isDragging ? 'border-[#0ea5e9] bg-sky-50' : 'border-[#e2e8f0] hover:border-[#0ea5e9]'
            ]"
          >
            <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-[#f1f5f9] flex items-center justify-center">
              <svg class="w-8 h-8 text-[#64748b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p class="text-[#1e293b] font-medium mb-2">Перетащите файлы сюда</p>
            <p class="text-sm text-[#64748b] mb-4">или</p>
            <label class="inline-flex items-center gap-2 bg-[#0ea5e9] text-white px-5 py-2.5 rounded-lg font-medium hover:bg-[#0284c7] transition-colors cursor-pointer">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Выбрать файлы
              <input type="file" multiple class="hidden" @change="handleFileSelect" />
            </label>
            <p class="text-xs text-[#64748b] mt-4">PDF, DOC, DOCX, XLS, XLSX до 10 МБ</p>
          </div>

          <!-- Uploaded Files -->
          <div v-if="uploadedFiles.length > 0" class="space-y-3">
            <h3 class="text-sm font-medium text-[#1e293b]">Загружаемые файлы</h3>
            <div
              v-for="file in uploadedFiles"
              :key="file.id"
              class="bg-[#f8fafc] rounded-lg p-4 border border-[#e2e8f0]"
            >
              <div class="flex items-center gap-3 mb-2">
                <div class="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-[#1e293b] truncate">{{ file.name }}</p>
                  <p class="text-xs text-[#64748b]">{{ file.size }}</p>
                </div>
                <div v-if="file.status === 'complete'" class="text-green-500">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <button
                  @click="removeUploadedFile(file.id)"
                  class="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div v-if="file.status === 'uploading'" class="h-1.5 bg-[#e2e8f0] rounded-full overflow-hidden">
                <div
                  class="h-full bg-[#0ea5e9] rounded-full transition-all duration-300"
                  :style="{ width: `${file.progress}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-[#e2e8f0] flex justify-end gap-3">
          <button
            @click="closeUploadModal"
            class="px-5 py-2.5 border border-[#e2e8f0] rounded-lg text-[#64748b] hover:bg-[#f8fafc] transition-colors"
          >
            Отмена
          </button>
          <button
            @click="finishUpload"
            :disabled="uploadedFiles.length === 0 || uploadedFiles.some(f => f.status === 'uploading')"
            class="px-5 py-2.5 bg-[#0ea5e9] text-white rounded-lg font-medium hover:bg-[#0284c7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Загрузить
          </button>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>
