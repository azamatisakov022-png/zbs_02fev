<script setup lang="ts">
import TheHeader from '../components/layout/TheHeader.vue'
import TheNavigation from '../components/layout/TheNavigation.vue'
import TheFooter from '../components/layout/TheFooter.vue'
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { recyclerStore } from '../stores/recyclers'
import { productGroups } from '../data/product-groups'

const { t } = useI18n()

const searchQuery = ref('')
const filterWasteType = ref('')

const activeRecyclers = computed(() => {
  let result = recyclerStore.getActiveRecyclers()
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(r => r.name.toLowerCase().includes(q))
  }
  if (filterWasteType.value) {
    result = result.filter(r => r.wasteTypes.includes(filterWasteType.value))
  }
  return result
})

const getGroupShortLabel = (value: string) => {
  const label = productGroups.find(g => g.value === value)?.label || value
  const match = label.match(/^(\d+)\.\s*(.+)$/)
  if (match) {
    const name = match[2]
    return name.length > 30 ? name.substring(0, 30) + '...' : name
  }
  return label
}

const getGroupLabel = (value: string) => {
  return productGroups.find(g => g.value === value)?.label || value
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-[#f8fafc]">
    <TheHeader />
    <TheNavigation />

    <main class="flex-1">
      <div class="container-main py-8 lg:py-12">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-2xl md:text-3xl lg:text-4xl font-bold text-[#415861] uppercase mb-3">
            {{ $t('publicRecyclers.title') }}
          </h1>
          <p class="text-[#70868f] text-base lg:text-lg max-w-3xl">
            {{ $t('publicRecyclers.subtitle') }}
          </p>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p class="text-sm text-[#70868f] mb-1">{{ $t('publicRecyclers.activeRecyclers') }}</p>
            <p class="text-3xl font-bold text-[#0e888d]">{{ activeRecyclers.length }}</p>
          </div>
          <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p class="text-sm text-[#70868f] mb-1">{{ $t('publicRecyclers.wasteTypes') }}</p>
            <p class="text-3xl font-bold text-[#415861]">24</p>
          </div>
          <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p class="text-sm text-[#70868f] mb-1">{{ $t('publicRecyclers.regionsCoverage') }}</p>
            <p class="text-3xl font-bold text-[#415861]">4</p>
          </div>
        </div>

        <!-- Filters -->
        <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
          <div class="flex flex-wrap gap-4">
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="$t('publicRecyclers.searchPlaceholder')"
              class="flex-1 min-w-[200px] px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0e888d]"
            />
            <select v-model="filterWasteType" class="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0e888d]">
              <option value="">{{ $t('publicRecyclers.allWasteTypes') }}</option>
              <option v-for="group in productGroups" :key="group.value" :value="group.value">
                {{ group.label }}
              </option>
            </select>
          </div>
        </div>

        <!-- Recyclers List -->
        <div class="space-y-4">
          <div
            v-for="recycler in activeRecyclers"
            :key="recycler.id"
            class="bg-white rounded-2xl p-5 lg:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div class="flex flex-col lg:flex-row lg:items-start gap-4">
              <!-- Icon -->
              <div class="w-12 h-12 rounded-xl bg-[#e8f5f5] flex items-center justify-center flex-shrink-0">
                <svg class="w-6 h-6 text-[#0e888d]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>

              <!-- Main info -->
              <div class="flex-1 min-w-0">
                <div class="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                  <h3 class="text-lg font-bold text-[#415861]">{{ recycler.name }}</h3>
                  <span class="inline-flex px-3 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-medium w-fit">
                    {{ $t('status.active') }}
                  </span>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-3 text-sm">
                  <div>
                    <span class="text-[#70868f]">{{ $t('publicRecyclers.license') }}</span>
                    <span class="ml-1 font-medium text-[#415861]">{{ recycler.licenseNumber }}</span>
                  </div>
                  <div>
                    <span class="text-[#70868f]">{{ $t('publicRecyclers.validUntil') }}</span>
                    <span class="ml-1 font-medium text-[#415861]">{{ recycler.licenseExpiry }}</span>
                  </div>
                  <div>
                    <span class="text-[#70868f]">{{ $t('publicRecyclers.address') }}</span>
                    <span class="ml-1 text-[#415861]">{{ recycler.address }}</span>
                  </div>
                </div>

                <!-- Waste types -->
                <div class="flex flex-wrap gap-1.5">
                  <span
                    v-for="wt in recycler.wasteTypes"
                    :key="wt"
                    class="inline-block px-2.5 py-1 bg-[#f1f5f9] text-[#64748b] rounded-lg text-xs"
                    :title="getGroupLabel(wt)"
                  >
                    {{ getGroupShortLabel(wt) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeRecyclers.length === 0" class="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <p class="text-[#70868f]">{{ $t('publicRecyclers.notFound') }}</p>
        </div>

        <!-- Info block -->
        <div class="mt-8 bg-[#e8f5f5] rounded-2xl p-6 border border-[#0e888d]/10">
          <div class="flex items-start gap-3">
            <svg class="w-6 h-6 text-[#0e888d] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p class="font-medium text-[#415861] mb-1">{{ $t('publicRecyclers.howToJoinTitle') }}</p>
              <p class="text-sm text-[#70868f]">
                {{ $t('publicRecyclers.howToJoinText') }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>

    <TheFooter />
  </div>
</template>
