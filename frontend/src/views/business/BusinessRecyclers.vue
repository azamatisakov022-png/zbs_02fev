<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import { useBusinessMenu } from '../../composables/useRoleMenu'
import { recyclerStore, type Recycler } from '../../stores/recyclers'
import { toastStore } from '../../stores/toast'
import { productGroups } from '../../data/product-groups'

const { t } = useI18n()
const { roleTitle, menuItems } = useBusinessMenu()

// View mode
const viewMode = ref<'grid' | 'list'>('grid')

// Filters
const searchQuery = ref('')
const selectedRegion = ref('all')
const selectedWasteType = ref('all')

const regions = computed(() => [
  { id: 'all', name: t('businessRecyclers.regionAll') },
  { id: 'bishkek', name: t('businessRecyclers.regionBishkek') },
  { id: 'chui', name: t('businessRecyclers.regionChui') },
  { id: 'osh', name: t('businessRecyclers.regionOsh') },
  { id: 'osh-region', name: t('businessRecyclers.regionOshRegion') },
  { id: 'jalal-abad', name: t('businessRecyclers.regionJalalAbad') },
  { id: 'issyk-kul', name: t('businessRecyclers.regionIssykKul') },
  { id: 'naryn', name: t('businessRecyclers.regionNaryn') },
  { id: 'talas', name: t('businessRecyclers.regionTalas') },
  { id: 'batken', name: t('businessRecyclers.regionBatken') },
])

// Helper: get short label for a waste type group value
const getGroupShortLabel = (value: string) => {
  const label = productGroups.find(g => g.value === value)?.label || value
  const match = label.match(/^(\d+)\.\s*(.+)$/)
  if (match) {
    const name = match[2]
    return name.length > 20 ? name.substring(0, 20) + '...' : name
  }
  return label
}

// Filtered recyclers — only active from store
const filteredRecyclers = computed(() => {
  let result = recyclerStore.state.recyclers.filter(r => r.status === 'active')

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.fullName.toLowerCase().includes(q) ||
      r.inn.includes(q)
    )
  }
  if (selectedRegion.value !== 'all') {
    result = result.filter(r => r.region.toLowerCase().includes(selectedRegion.value.toLowerCase()))
  }
  if (selectedWasteType.value !== 'all') {
    result = result.filter(r => r.wasteTypes.includes(selectedWasteType.value))
  }
  return result
})

// Statistics
const stats = computed(() => ({
  total: recyclerStore.state.recyclers.filter(r => r.status === 'active').length,
  partners: 3,
  totalCapacity: recyclerStore.state.recyclers
    .filter(r => r.status === 'active')
    .reduce((sum, r) => sum + recyclerStore.getTotalCapacity(r), 0),
  regions: new Set(recyclerStore.state.recyclers.filter(r => r.status === 'active').map(r => r.region)).size,
}))

// Modal state
const showDetailsModal = ref(false)
const selectedRecycler = ref<Recycler | null>(null)
const showRequestModal = ref(false)

const openDetails = (recycler: Recycler) => {
  selectedRecycler.value = recycler
  showDetailsModal.value = true
}

const closeDetails = () => {
  showDetailsModal.value = false
  selectedRecycler.value = null
}

const openRequestModal = (recycler: Recycler) => {
  selectedRecycler.value = recycler
  showRequestModal.value = true
}

const closeRequestModal = () => {
  showRequestModal.value = false
}

// Request form
const requestForm = ref({
  wasteType: '',
  volume: '',
  frequency: 'once',
  message: '',
})

const submitRequest = () => {
  toastStore.show({ type: 'success', title: t('businessRecyclers.toastRequestSent'), message: t('businessRecyclers.toastRequestMessage', { name: selectedRecycler.value?.name }) })
  closeRequestModal()
  requestForm.value = { wasteType: '', volume: '', frequency: 'once', message: '' }
}

// Stars display
const getStars = (rating: number) => {
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5
  return { full: fullStars, half: hasHalfStar, empty: 5 - fullStars - (hasHalfStar ? 1 : 0) }
}
</script>

<template>
  <DashboardLayout
    role="business"
    :roleTitle="roleTitle"
    userName="ОсОО «ТехПром»"
    :menuItems="menuItems"
  >
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold text-gray-900">{{ $t('businessRecyclers.title') }}</h1>
        <p class="text-gray-600 mt-1">{{ $t('businessRecyclers.subtitle') }}</p>
      </div>

      <!-- CTA Banner -->
      <div class="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white">
        <div class="flex items-start justify-between">
          <div class="flex items-start gap-4">
            <div class="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <div>
              <h2 class="text-xl font-bold">{{ $t('businessRecyclers.catalogTitle') }}</h2>
              <p class="text-emerald-100 mt-1 max-w-2xl">
                {{ $t('businessRecyclers.catalogDesc') }}
              </p>
            </div>
          </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div class="bg-white/10 rounded-xl p-4">
            <p class="text-3xl font-bold">{{ stats.total }}</p>
            <p class="text-emerald-100 text-sm">{{ $t('businessRecyclers.statRecyclers') }}</p>
          </div>
          <div class="bg-white/10 rounded-xl p-4">
            <p class="text-3xl font-bold">{{ stats.partners }}</p>
            <p class="text-emerald-100 text-sm">{{ $t('businessRecyclers.statPartners') }}</p>
          </div>
          <div class="bg-white/10 rounded-xl p-4">
            <p class="text-3xl font-bold">{{ (stats.totalCapacity / 1000).toFixed(0) }}K</p>
            <p class="text-emerald-100 text-sm">{{ $t('businessRecyclers.statCapacity') }}</p>
          </div>
          <div class="bg-white/10 rounded-xl p-4">
            <p class="text-3xl font-bold">{{ stats.regions }}</p>
            <p class="text-emerald-100 text-sm">{{ $t('businessRecyclers.statRegions') }}</p>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div class="flex flex-col lg:flex-row gap-4">
          <!-- Search -->
          <div class="flex-1">
            <div class="relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                v-model="searchQuery"
                type="text"
                :placeholder="$t('businessRecyclers.searchPlaceholder')"
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          <!-- Region filter -->
          <select
            v-model="selectedRegion"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option v-for="region in regions" :key="region.id" :value="region.id">{{ region.name }}</option>
          </select>

          <!-- Waste type filter -->
          <select
            v-model="selectedWasteType"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="all">{{ $t('businessRecyclers.allWasteTypes') }}</option>
            <option v-for="group in productGroups" :key="group.value" :value="group.value">{{ group.label }}</option>
          </select>
        </div>

        <!-- View mode toggle -->
        <div class="flex items-center justify-end mt-4 pt-4 border-t border-gray-200">
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-500">{{ $t('businessRecyclers.viewLabel') }}</span>
            <button
              @click="viewMode = 'grid'"
              :class="[
                'p-2 rounded-lg transition-colors',
                viewMode === 'grid' ? 'bg-emerald-100 text-emerald-700' : 'text-gray-400 hover:text-gray-600'
              ]"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              @click="viewMode = 'list'"
              :class="[
                'p-2 rounded-lg transition-colors',
                viewMode === 'list' ? 'bg-emerald-100 text-emerald-700' : 'text-gray-400 hover:text-gray-600'
              ]"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Results count -->
      <div class="flex items-center justify-between">
        <p class="text-gray-600">
          {{ $t('businessRecyclers.foundCount') }} <span class="font-semibold text-gray-900">{{ filteredRecyclers.length }}</span> {{ $t('businessRecyclers.recyclersCount') }}
        </p>
      </div>

      <!-- Grid View -->
      <div v-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="recycler in filteredRecyclers"
          :key="recycler.id"
          class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
        >
          <!-- Header -->
          <div class="p-4 border-b border-gray-100">
            <div class="flex items-start gap-3">
              <div class="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg class="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="font-semibold text-gray-900 truncate">{{ recycler.name }}</h3>
                <p class="text-sm text-gray-500">{{ recycler.region }}</p>
              </div>
            </div>
          </div>

          <!-- Content -->
          <div class="p-4">
            <p class="text-sm text-gray-600 line-clamp-2 mb-3">{{ recycler.address }}</p>

            <!-- Waste types -->
            <div class="flex flex-wrap gap-1 mb-3">
              <span
                v-for="wt in recycler.wasteTypes.slice(0, 3)"
                :key="wt"
                class="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full"
              >
                {{ getGroupShortLabel(wt) }}
              </span>
              <span v-if="recycler.wasteTypes.length > 3" class="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">+{{ recycler.wasteTypes.length - 3 }}</span>
            </div>

            <!-- Rating -->
            <div class="flex items-center gap-2 mb-3">
              <div class="flex items-center">
                <template v-for="i in getStars(recycler.rating).full" :key="'full-' + i">
                  <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </template>
                <template v-if="getStars(recycler.rating).half">
                  <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <defs>
                      <linearGradient id="half">
                        <stop offset="50%" stop-color="currentColor" />
                        <stop offset="50%" stop-color="#D1D5DB" />
                      </linearGradient>
                    </defs>
                    <path fill="url(#half)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </template>
                <template v-for="i in getStars(recycler.rating).empty" :key="'empty-' + i">
                  <svg class="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </template>
              </div>
              <span class="text-sm font-medium text-gray-700">{{ recycler.rating }}</span>
            </div>

            <!-- Capacity -->
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>{{ $t('businessRecyclers.capacity') }} {{ recyclerStore.getTotalCapacity(recycler).toLocaleString() }} {{ $t('businessRecyclers.tonsPerYear') }}</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="px-4 py-3 bg-gray-50 border-t border-gray-100 flex gap-2">
            <button
              @click="openDetails(recycler)"
              class="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {{ $t('businessRecyclers.details') }}
            </button>
            <button
              @click="openRequestModal(recycler)"
              class="flex-1 px-3 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              {{ $t('businessRecyclers.sendRequest') }}
            </button>
          </div>
        </div>
      </div>

      <!-- List View -->
      <div v-if="viewMode === 'list'" class="space-y-3">
        <div
          v-for="recycler in filteredRecyclers"
          :key="recycler.id"
          class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
        >
          <div class="flex items-start gap-4">
            <div class="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg class="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <h3 class="font-semibold text-gray-900">{{ recycler.name }}</h3>
                  <p class="text-sm text-gray-500 mt-0.5">{{ recycler.region }} · {{ recycler.address }}</p>
                  <p class="text-sm text-gray-600 mt-2">{{ recycler.fullName }}</p>
                  <div class="flex flex-wrap items-center gap-4 mt-3">
                    <div class="flex flex-wrap gap-1">
                      <span
                        v-for="wt in recycler.wasteTypes.slice(0, 3)"
                        :key="wt"
                        class="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full"
                      >
                        {{ getGroupShortLabel(wt) }}
                      </span>
                      <span v-if="recycler.wasteTypes.length > 3" class="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">+{{ recycler.wasteTypes.length - 3 }}</span>
                    </div>
                    <div class="flex items-center gap-1">
                      <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span class="text-sm font-medium">{{ recycler.rating }}</span>
                    </div>
                    <span class="text-sm text-gray-500">{{ $t('businessRecyclers.capacity') }} {{ recyclerStore.getTotalCapacity(recycler).toLocaleString() }} {{ $t('businessRecyclers.tonsPerYear') }}</span>
                  </div>
                </div>
                <div class="flex gap-2 flex-shrink-0">
                  <button
                    @click="openDetails(recycler)"
                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {{ $t('businessRecyclers.details') }}
                  </button>
                  <button
                    @click="openRequestModal(recycler)"
                    class="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    {{ $t('businessRecyclers.requestShort') }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="filteredRecyclers.length === 0" class="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-1">{{ $t('businessRecyclers.emptyTitle') }}</h3>
        <p class="text-gray-500">{{ $t('businessRecyclers.emptyDesc') }}</p>
      </div>
    </div>

    <!-- Details Modal -->
    <Teleport to="body">
      <div v-if="showDetailsModal && selectedRecycler" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
            <h3 class="text-lg font-semibold text-gray-900">{{ $t('businessRecyclers.companyInfo') }}</h3>
            <button @click="closeDetails" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="p-6 space-y-6">
            <!-- Header -->
            <div class="flex items-start gap-4">
              <div class="w-16 h-16 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg class="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div class="flex-1">
                <h4 class="text-xl font-bold text-gray-900">{{ selectedRecycler.name }}</h4>
                <p class="text-gray-500 mt-1">{{ selectedRecycler.fullName }}</p>
                <div class="flex items-center gap-3 mt-2">
                  <div class="flex items-center gap-1">
                    <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span class="font-medium">{{ selectedRecycler.rating }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Info grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="bg-gray-50 rounded-xl p-4">
                <h5 class="text-sm font-medium text-gray-500 mb-3">{{ $t('businessRecyclers.contacts') }}</h5>
                <div class="space-y-2">
                  <div class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span class="text-sm text-gray-700">{{ selectedRecycler.address }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span class="text-sm text-gray-700">{{ selectedRecycler.contactPhone }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span class="text-sm text-gray-700">{{ selectedRecycler.contactEmail }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    <span class="text-sm text-gray-700">{{ selectedRecycler.website }}</span>
                  </div>
                </div>
              </div>

              <div class="bg-gray-50 rounded-xl p-4">
                <h5 class="text-sm font-medium text-gray-500 mb-3">{{ $t('businessRecyclers.aboutCompany') }}</h5>
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-500">{{ $t('businessRecyclers.employees') }}</span>
                    <span class="text-sm font-medium text-gray-700">{{ selectedRecycler.employeesCount }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-500">{{ $t('businessRecyclers.capacityLabel') }}</span>
                    <span class="text-sm font-medium text-gray-700">{{ recyclerStore.getTotalCapacity(selectedRecycler).toLocaleString() }} {{ $t('businessRecyclers.tonsPerYear') }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-500">{{ $t('businessRecyclers.regionLabel') }}</span>
                    <span class="text-sm font-medium text-gray-700">{{ selectedRecycler.region }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-500">{{ $t('businessRecyclers.innLabel') }}</span>
                    <span class="text-sm font-medium text-gray-700">{{ selectedRecycler.inn }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Waste types -->
            <div>
              <h5 class="text-sm font-medium text-gray-500 mb-3">{{ $t('businessRecyclers.acceptedWasteTypes') }}</h5>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="wt in selectedRecycler.wasteTypes"
                  :key="wt"
                  class="px-3 py-1.5 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-lg"
                >
                  {{ getGroupShortLabel(wt) }}
                </span>
              </div>
            </div>

            <!-- Processing methods -->
            <div>
              <h5 class="text-sm font-medium text-gray-500 mb-3">{{ $t('businessRecyclers.processingMethods') }}</h5>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="method in selectedRecycler.processingMethods"
                  :key="method"
                  class="px-3 py-1.5 bg-blue-100 text-blue-700 text-sm font-medium rounded-lg"
                >
                  {{ method }}
                </span>
              </div>
            </div>

            <!-- Certifications -->
            <div v-if="selectedRecycler.certifications.length > 0">
              <h5 class="text-sm font-medium text-gray-500 mb-3">{{ $t('businessRecyclers.certificates') }}</h5>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="cert in selectedRecycler.certifications"
                  :key="cert"
                  class="px-3 py-1.5 bg-amber-100 text-amber-700 text-sm font-medium rounded-lg flex items-center gap-1"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  {{ cert }}
                </span>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex gap-3 pt-4 border-t border-gray-200">
              <button
                @click="closeDetails(); openRequestModal(selectedRecycler)"
                class="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
              >
                {{ $t('businessRecyclers.sendRequest') }}
              </button>
              <button
                @click="closeDetails"
                class="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                {{ $t('common.close') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Request Modal -->
    <Teleport to="body">
      <div v-if="showRequestModal && selectedRecycler" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl shadow-xl max-w-lg w-full">
          <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">{{ $t('businessRecyclers.requestTitle') }}</h3>
              <p class="text-sm text-gray-500">{{ selectedRecycler.name }}</p>
            </div>
            <button @click="closeRequestModal" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('businessRecyclers.wasteTypeLabel') }}</label>
              <select
                v-model="requestForm.wasteType"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">{{ $t('businessRecyclers.selectWasteType') }}</option>
                <option v-for="wt in selectedRecycler.wasteTypes" :key="wt" :value="wt">{{ getGroupShortLabel(wt) }}</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('businessRecyclers.approxVolume') }}</label>
              <input
                v-model="requestForm.volume"
                type="text"
                :placeholder="$t('businessRecyclers.volumePlaceholder')"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('businessRecyclers.frequency') }}</label>
              <div class="flex gap-3">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" v-model="requestForm.frequency" value="once" class="text-emerald-600" />
                  <span class="text-sm text-gray-700">{{ $t('businessRecyclers.frequencyOnce') }}</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" v-model="requestForm.frequency" value="regular" class="text-emerald-600" />
                  <span class="text-sm text-gray-700">{{ $t('businessRecyclers.frequencyRegular') }}</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" v-model="requestForm.frequency" value="contract" class="text-emerald-600" />
                  <span class="text-sm text-gray-700">{{ $t('businessRecyclers.frequencyContract') }}</span>
                </label>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('businessRecyclers.comment') }}</label>
              <textarea
                v-model="requestForm.message"
                rows="3"
                :placeholder="$t('businessRecyclers.commentPlaceholder')"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              ></textarea>
            </div>

            <div class="bg-gray-50 rounded-lg p-4">
              <div class="flex items-start gap-3">
                <svg class="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="text-sm text-gray-600">
                  {{ $t('businessRecyclers.requestInfoText') }}
                </p>
              </div>
            </div>
          </div>
          <div class="px-6 py-4 border-t border-gray-200 flex gap-3">
            <button
              @click="closeRequestModal"
              class="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              {{ $t('common.cancel') }}
            </button>
            <button
              @click="submitRequest"
              :disabled="!requestForm.wasteType || !requestForm.volume"
              class="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ $t('businessRecyclers.sendRequest') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </DashboardLayout>
</template>
