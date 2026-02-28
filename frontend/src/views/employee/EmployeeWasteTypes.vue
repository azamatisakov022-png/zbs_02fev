<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import { useEmployeeMenu } from '../../composables/useRoleMenu'
import { toastStore } from '../../stores/toast'
import SectionGuide from '../../components/common/SectionGuide.vue'

const { t } = useI18n()
const { roleTitle, menuItems } = useEmployeeMenu()

// Filter
const searchQuery = ref('')
const selectedCategory = ref('all')

const categories = computed(() => [
  { id: 'all', name: t('employeeWasteTypes.allCategories') },
  { id: 'plastic', name: t('employeeWasteTypes.plastic') },
  { id: 'paper', name: t('employeeWasteTypes.paperCardboard') },
  { id: 'glass', name: t('employeeWasteTypes.glass') },
  { id: 'metal', name: t('employeeWasteTypes.metal') },
  { id: 'organic', name: t('employeeWasteTypes.organic') },
])

// Waste types data
interface WasteType {
  id: number
  code: string
  name: string
  category: string
  categoryName: string
  hazardClass: number
  description: string
  acceptedVolume: number
  processedVolume: number
  pricePerTon: number
  isActive: boolean
  processingMethods: string[]
  icon: string
}

const wasteTypes = ref<WasteType[]>([
  {
    id: 1, code: 'ПЛ-01', name: 'ПЭТ (полиэтилентерефталат)',
    category: 'plastic', categoryName: 'Пластик', hazardClass: 5,
    description: 'Пластиковые бутылки, контейнеры для пищевых продуктов',
    acceptedVolume: 1250, processedVolume: 1180, pricePerTon: 15000, isActive: true,
    processingMethods: ['Дробление', 'Мойка', 'Грануляция'], icon: '🧴',
  },
  {
    id: 2, code: 'ПЛ-02', name: 'ПП (полипропилен)',
    category: 'plastic', categoryName: 'Пластик', hazardClass: 5,
    description: 'Крышки, контейнеры, упаковка',
    acceptedVolume: 890, processedVolume: 845, pricePerTon: 12000, isActive: true,
    processingMethods: ['Дробление', 'Экструзия'], icon: '🥤',
  },
  {
    id: 3, code: 'ПЛ-03', name: 'ПЭ (полиэтилен)',
    category: 'plastic', categoryName: 'Пластик', hazardClass: 5,
    description: 'Плёнка, пакеты, мягкая упаковка',
    acceptedVolume: 670, processedVolume: 620, pricePerTon: 10000, isActive: true,
    processingMethods: ['Агломерация', 'Грануляция'], icon: '🛍️',
  },
  {
    id: 4, code: 'БМ-01', name: 'Гофрокартон',
    category: 'paper', categoryName: 'Бумага и картон', hazardClass: 5,
    description: 'Гофрированный картон, коробки',
    acceptedVolume: 2100, processedVolume: 2050, pricePerTon: 8000, isActive: true,
    processingMethods: ['Роспуск', 'Очистка', 'Формование'], icon: '📦',
  },
  {
    id: 5, code: 'БМ-02', name: 'Макулатура МС-1А',
    category: 'paper', categoryName: 'Бумага и картон', hazardClass: 5,
    description: 'Белая бумага, офисные документы',
    acceptedVolume: 450, processedVolume: 440, pricePerTon: 12000, isActive: true,
    processingMethods: ['Роспуск', 'Деинкинг', 'Отбеливание'], icon: '📄',
  },
  {
    id: 6, code: 'БМ-03', name: 'Макулатура МС-5Б',
    category: 'paper', categoryName: 'Бумага и картон', hazardClass: 5,
    description: 'Смешанная макулатура, газеты, журналы',
    acceptedVolume: 780, processedVolume: 750, pricePerTon: 6000, isActive: true,
    processingMethods: ['Роспуск', 'Очистка'], icon: '📰',
  },
  {
    id: 7, code: 'СТ-01', name: 'Стекло бесцветное',
    category: 'glass', categoryName: 'Стекло', hazardClass: 5,
    description: 'Прозрачные бутылки и банки',
    acceptedVolume: 560, processedVolume: 540, pricePerTon: 5000, isActive: true,
    processingMethods: ['Дробление', 'Сортировка', 'Переплавка'], icon: '🫙',
  },
  {
    id: 8, code: 'СТ-02', name: 'Стекло коричневое',
    category: 'glass', categoryName: 'Стекло', hazardClass: 5,
    description: 'Коричневые бутылки (пивные и др.)',
    acceptedVolume: 320, processedVolume: 310, pricePerTon: 4500, isActive: true,
    processingMethods: ['Дробление', 'Переплавка'], icon: '🍾',
  },
  {
    id: 9, code: 'МТ-01', name: 'Алюминий',
    category: 'metal', categoryName: 'Металл', hazardClass: 5,
    description: 'Алюминиевые банки, фольга',
    acceptedVolume: 180, processedVolume: 175, pricePerTon: 85000, isActive: true,
    processingMethods: ['Прессование', 'Переплавка'], icon: '🥫',
  },
  {
    id: 10, code: 'МТ-02', name: 'Жесть',
    category: 'metal', categoryName: 'Металл', hazardClass: 5,
    description: 'Консервные банки, жестяная тара',
    acceptedVolume: 240, processedVolume: 230, pricePerTon: 25000, isActive: true,
    processingMethods: ['Прессование', 'Переплавка'], icon: '🥫',
  },
  {
    id: 11, code: 'ОР-01', name: 'Пищевые отходы',
    category: 'organic', categoryName: 'Органика', hazardClass: 5,
    description: 'Остатки пищи, просроченные продукты',
    acceptedVolume: 890, processedVolume: 870, pricePerTon: 3000, isActive: false,
    processingMethods: ['Компостирование', 'Анаэробное сбраживание'], icon: '🥬',
  },
])

// Filtered waste types
const filteredWasteTypes = computed(() => {
  return wasteTypes.value.filter(wt => {
    const matchesSearch = !searchQuery.value ||
      wt.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      wt.code.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesCategory = selectedCategory.value === 'all' || wt.category === selectedCategory.value
    return matchesSearch && matchesCategory
  })
})

// Stats
const stats = computed(() => ({
  totalTypes: wasteTypes.value.filter(w => w.isActive).length,
  totalAccepted: wasteTypes.value.reduce((sum, w) => sum + w.acceptedVolume, 0),
  totalProcessed: wasteTypes.value.reduce((sum, w) => sum + w.processedVolume, 0),
  processingRate: Math.round(
    (wasteTypes.value.reduce((sum, w) => sum + w.processedVolume, 0) /
     wasteTypes.value.reduce((sum, w) => sum + w.acceptedVolume, 0)) * 100
  ),
}))

const formatNumber = (num: number) => num.toLocaleString()

const getHazardClass = (hazardClass: number) => {
  switch (hazardClass) {
    case 1: return { color: 'bg-red-100 text-red-700', label: t('employeeWasteTypes.hazardClass1') }
    case 2: return { color: 'bg-orange-100 text-orange-700', label: t('employeeWasteTypes.hazardClass2') }
    case 3: return { color: 'bg-yellow-100 text-yellow-700', label: t('employeeWasteTypes.hazardClass3') }
    case 4: return { color: 'bg-blue-100 text-blue-700', label: t('employeeWasteTypes.hazardClass4') }
    case 5: return { color: 'bg-teal-100 text-teal-700', label: t('employeeWasteTypes.hazardClass5') }
    default: return { color: 'bg-gray-100 text-gray-700', label: t('employeeWasteTypes.hazardClassUndefined') }
  }
}

// Modal
const showDetailsModal = ref(false)
const selectedWasteType = ref<WasteType | null>(null)

const openDetails = (wt: WasteType) => {
  selectedWasteType.value = wt
  showDetailsModal.value = true
}
</script>

<template>
  <DashboardLayout
    role="employee"
    :roleTitle="roleTitle"
    userName="Мамытова Айгуль"
    :menuItems="menuItems"
  >
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold text-gray-900">{{ $t('pages.employee.wasteTypesTitle') }}</h1>
        <p class="text-gray-600 mt-1">{{ $t('pages.employee.wasteTypesSubtitle') }}</p>
      </div>

      <SectionGuide
        :title="$t('employeeWasteTypes.guideTitle')"
        :description="$t('employeeWasteTypes.guideDescription')"
        :actions="[$t('employeeWasteTypes.guideAction1'), $t('employeeWasteTypes.guideAction2'), $t('employeeWasteTypes.guideAction3')]"
        storageKey="employee-waste-types"
      />

      <!-- Stats Banner -->
      <div class="rounded-2xl p-6 text-white" style="background: linear-gradient(135deg, #115E59, #0D9488);">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p class="text-teal-200 text-sm">{{ $t('employeeWasteTypes.wasteTypesCount') }}</p>
            <p class="text-3xl font-bold mt-1">{{ stats.totalTypes }}</p>
          </div>
          <div>
            <p class="text-teal-200 text-sm">{{ $t('employeeWasteTypes.acceptedTonsYear') }}</p>
            <p class="text-3xl font-bold mt-1">{{ formatNumber(stats.totalAccepted) }}</p>
          </div>
          <div>
            <p class="text-teal-200 text-sm">{{ $t('employeeWasteTypes.processedTonsYear') }}</p>
            <p class="text-3xl font-bold mt-1">{{ formatNumber(stats.totalProcessed) }}</p>
          </div>
          <div>
            <p class="text-teal-200 text-sm">{{ $t('employeeWasteTypes.processingPercent') }}</p>
            <p class="text-3xl font-bold mt-1">{{ stats.processingRate }}%</p>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex-1">
            <div class="relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                v-model="searchQuery"
                type="text"
                :placeholder="$t('common.search')"
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
          </div>
          <div class="flex gap-2 flex-wrap">
            <button
              v-for="cat in categories"
              :key="cat.id"
              @click="selectedCategory = cat.id"
              :class="[
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                selectedCategory === cat.id
                  ? 'bg-teal-100 text-teal-700 border-2 border-teal-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
              ]"
            >
              {{ cat.name }}
            </button>
          </div>
        </div>
      </div>

      <!-- Waste Types Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="wt in filteredWasteTypes"
          :key="wt.id"
          @click="openDetails(wt)"
          class="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer"
          :class="{ 'opacity-60': !wt.isActive }"
        >
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center text-2xl">
                {{ wt.icon }}
              </div>
              <div>
                <span class="text-xs font-mono text-teal-600 bg-teal-50 px-2 py-0.5 rounded">{{ wt.code }}</span>
                <h3 class="font-semibold text-gray-900 mt-1">{{ wt.name }}</h3>
              </div>
            </div>
            <span
              v-if="!wt.isActive"
              class="px-2 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded-full"
            >
              {{ $t('employeeWasteTypes.receptionStopped') }}
            </span>
          </div>

          <p class="text-sm text-gray-500 mb-4">{{ wt.description }}</p>

          <div class="space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">{{ $t('employeeWasteTypes.accepted') }}:</span>
              <span class="font-medium text-gray-900">{{ formatNumber(wt.acceptedVolume) }} {{ $t('employeeWasteTypes.tonsShort') }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">{{ $t('employeeWasteTypes.processed') }}:</span>
              <span class="font-medium text-gray-900">{{ formatNumber(wt.processedVolume) }} {{ $t('employeeWasteTypes.tonsShort') }}</span>
            </div>
            <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full"
                style="background: linear-gradient(90deg, #0D9488, #2DD4BF);"
                :style="{ width: `${(wt.processedVolume / wt.acceptedVolume) * 100}%` }"
              ></div>
            </div>
          </div>

          <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <span :class="['px-2 py-1 rounded-full text-xs font-medium', getHazardClass(wt.hazardClass).color]">
              {{ wt.hazardClass }} {{ $t('employeeWasteTypes.classLabel') }}
            </span>
            <span class="text-sm font-medium text-gray-900">{{ formatNumber(wt.pricePerTon) }} {{ $t('employeeWasteTypes.somPerTon') }}</span>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="filteredWasteTypes.length === 0" class="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-1">{{ $t('employeeWasteTypes.noWasteTypesFound') }}</h3>
        <p class="text-gray-500">{{ $t('employeeWasteTypes.tryChangingSearch') }}</p>
      </div>
    </div>

    <!-- Details Modal -->
    <Teleport to="body">
      <div v-if="showDetailsModal && selectedWasteType" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">{{ $t('employeeWasteTypes.wasteTypeInfo') }}</h3>
            <button @click="showDetailsModal = false" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="p-6 space-y-6">
            <div class="flex items-start gap-4">
              <div class="w-16 h-16 bg-teal-100 rounded-xl flex items-center justify-center text-3xl">
                {{ selectedWasteType.icon }}
              </div>
              <div>
                <span class="text-sm font-mono text-teal-600 bg-teal-50 px-2 py-1 rounded">{{ selectedWasteType.code }}</span>
                <h4 class="text-xl font-bold text-gray-900 mt-1">{{ selectedWasteType.name }}</h4>
                <p class="text-gray-500">{{ selectedWasteType.categoryName }}</p>
              </div>
            </div>

            <div>
              <h5 class="text-sm font-medium text-gray-500 mb-1">{{ $t('employeeWasteTypes.descriptionLabel') }}</h5>
              <p class="text-gray-900">{{ selectedWasteType.description }}</p>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="bg-gray-50 rounded-xl p-4">
                <p class="text-sm text-gray-500">{{ $t('employeeWasteTypes.hazardClassLabel') }}</p>
                <span :class="['px-2 py-1 rounded-full text-sm font-medium mt-1 inline-block', getHazardClass(selectedWasteType.hazardClass).color]">
                  {{ getHazardClass(selectedWasteType.hazardClass).label }}
                </span>
              </div>
              <div class="bg-gray-50 rounded-xl p-4">
                <p class="text-sm text-gray-500">{{ $t('employeeWasteTypes.receptionPrice') }}</p>
                <p class="text-xl font-bold text-gray-900">{{ formatNumber(selectedWasteType.pricePerTon) }} {{ $t('employeeWasteTypes.somPerTon') }}</p>
              </div>
              <div class="bg-gray-50 rounded-xl p-4">
                <p class="text-sm text-gray-500">{{ $t('employeeWasteTypes.acceptedPerYear') }}</p>
                <p class="text-xl font-bold text-gray-900">{{ formatNumber(selectedWasteType.acceptedVolume) }} {{ $t('employeeWasteTypes.tons') }}</p>
              </div>
              <div class="bg-gray-50 rounded-xl p-4">
                <p class="text-sm text-gray-500">{{ $t('employeeWasteTypes.processed') }}</p>
                <p class="text-xl font-bold text-gray-900">{{ formatNumber(selectedWasteType.processedVolume) }} {{ $t('employeeWasteTypes.tons') }}</p>
              </div>
            </div>

            <div>
              <div class="flex justify-between text-sm mb-2">
                <span class="text-gray-500">{{ $t('employeeWasteTypes.processingPercent') }}</span>
                <span class="font-medium text-teal-600">{{ Math.round((selectedWasteType.processedVolume / selectedWasteType.acceptedVolume) * 100) }}%</span>
              </div>
              <div class="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full"
                  style="background: linear-gradient(90deg, #0D9488, #2DD4BF);"
                  :style="{ width: `${(selectedWasteType.processedVolume / selectedWasteType.acceptedVolume) * 100}%` }"
                ></div>
              </div>
            </div>

            <div>
              <h5 class="text-sm font-medium text-gray-500 mb-3">{{ $t('employeeWasteTypes.processingMethods') }}</h5>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="method in selectedWasteType.processingMethods"
                  :key="method"
                  class="px-3 py-1.5 bg-teal-100 text-teal-700 rounded-lg text-sm font-medium"
                >
                  {{ method }}
                </span>
              </div>
            </div>

            <div class="p-4 rounded-xl" :class="selectedWasteType.isActive ? 'bg-teal-50 border border-teal-200' : 'bg-gray-50 border border-gray-200'">
              <div class="flex items-center gap-3">
                <svg v-if="selectedWasteType.isActive" class="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <svg v-else class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                <span :class="selectedWasteType.isActive ? 'text-teal-700' : 'text-gray-600'">
                  {{ selectedWasteType.isActive ? $t('employeeWasteTypes.activeReception') : $t('employeeWasteTypes.receptionPaused') }}
                </span>
              </div>
            </div>

            <div class="flex gap-3 pt-4 border-t border-gray-200">
              <button @click="toastStore.show({ type: 'info', title: $t('employeeWasteTypes.editToastTitle'), message: $t('employeeWasteTypes.editToastMessage') })" class="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors">
                {{ $t('common.edit') }}
              </button>
              <button @click="showDetailsModal = false" class="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                {{ $t('common.close') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </DashboardLayout>
</template>
