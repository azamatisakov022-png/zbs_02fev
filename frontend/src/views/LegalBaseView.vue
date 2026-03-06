<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AppInput from '../components/ui/AppInput.vue'
import {
  legalDocuments,
  faqItems,
  legalCategoryKeys,
  faqCategoryKeys,
  type LegalCategory,
  type FaqCategory,
} from '../data/legal-base'

const { t } = useI18n()

// Active tab
const activeTab = ref<'npa' | 'faq'>('npa')

// ========== NPA SECTION ==========
const npaSearch = ref('')
const npaCategory = ref<LegalCategory | ''>('')

const npaCategories = computed(() => {
  const cats: { value: LegalCategory | ''; label: string; count: number }[] = [
    { value: '', label: t('legalBase.allDocuments'), count: legalDocuments.length },
  ]
  const keys = Object.keys(legalCategoryKeys) as LegalCategory[]
  for (const key of keys) {
    const count = legalDocuments.filter(d => d.category === key).length
    cats.push({ value: key, label: t(legalCategoryKeys[key]), count })
  }
  return cats
})

const filteredDocuments = computed(() => {
  let result = [...legalDocuments]
  if (npaCategory.value) {
    result = result.filter(d => d.category === npaCategory.value)
  }
  if (npaSearch.value) {
    const s = npaSearch.value.toLowerCase()
    result = result.filter(d =>
      t(d.titleKey).toLowerCase().includes(s) ||
      d.number.toLowerCase().includes(s) ||
      t(d.descriptionKey).toLowerCase().includes(s)
    )
  }
  // Sort by date descending
  result.sort((a, b) => b.date.localeCompare(a.date))
  return result
})

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const categoryColor = (cat: LegalCategory): string => {
  const map: Record<LegalCategory, string> = {
    laws: 'bg-blue-100 text-blue-800',
    decrees: 'bg-purple-100 text-purple-800',
    regulations: 'bg-green-100 text-green-800',
    technical: 'bg-orange-100 text-orange-800',
    international: 'bg-teal-100 text-teal-800',
  }
  return map[cat] || 'bg-gray-100 text-gray-800'
}

const categoryIcon = (cat: LegalCategory): string => {
  const map: Record<LegalCategory, string> = {
    laws: '📜',
    decrees: '📋',
    regulations: '📑',
    technical: '⚙️',
    international: '🌍',
  }
  return map[cat] || '📄'
}

// ========== FAQ SECTION ==========
const faqSearch = ref('')
const faqCategory = ref<FaqCategory | ''>('')
const openFaqId = ref<number | null>(null)

const faqCategories = computed(() => {
  const cats: { value: FaqCategory | ''; label: string; count: number }[] = [
    { value: '', label: t('legalBase.allQuestions'), count: faqItems.length },
  ]
  const keys = Object.keys(faqCategoryKeys) as FaqCategory[]
  for (const key of keys) {
    const count = faqItems.filter(f => f.category === key).length
    cats.push({ value: key, label: t(faqCategoryKeys[key]), count })
  }
  return cats
})

const filteredFaq = computed(() => {
  let result = [...faqItems]
  if (faqCategory.value) {
    result = result.filter(f => f.category === faqCategory.value)
  }
  if (faqSearch.value) {
    const s = faqSearch.value.toLowerCase()
    result = result.filter(f =>
      t(f.questionKey).toLowerCase().includes(s) ||
      t(f.answerKey).toLowerCase().includes(s)
    )
  }
  return result
})

const toggleFaq = (id: number) => {
  openFaqId.value = openFaqId.value === id ? null : id
}

const faqCategoryIcon = (cat: FaqCategory): string => {
  const map: Record<FaqCategory, string> = {
    general: '📌',
    payment: '💰',
    recycling: '♻️',
    licensing: '📋',
    reporting: '📊',
  }
  return map[cat] || '❓'
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <main class="container-main py-8 lg:py-12">
      <!-- Page header -->
      <div class="mb-8 text-center">
        <h1 class="text-2xl lg:text-3xl font-bold text-[#415861] mb-2">{{ $t('legalBase.title') }}</h1>
        <p class="text-[#70868f] text-base lg:text-lg max-w-3xl mx-auto">{{ $t('legalBase.subtitle') }}</p>
      </div>

      <!-- Tabs -->
      <div class="flex justify-center mb-8">
        <div class="inline-flex bg-white rounded-xl border border-gray-200 p-1">
          <button
            @click="activeTab = 'npa'"
            :class="[
              'px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200',
              activeTab === 'npa'
                ? 'bg-[#0e888d] text-white shadow-sm'
                : 'text-[#415861] hover:bg-gray-50'
            ]"
          >
            <span class="mr-2">📜</span>
            {{ $t('legalBase.tabNpa') }}
          </button>
          <button
            @click="activeTab = 'faq'"
            :class="[
              'px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200',
              activeTab === 'faq'
                ? 'bg-[#0e888d] text-white shadow-sm'
                : 'text-[#415861] hover:bg-gray-50'
            ]"
          >
            <span class="mr-2">❓</span>
            {{ $t('legalBase.tabFaq') }}
          </button>
        </div>
      </div>

      <!-- ========== NPA TAB ========== -->
      <div v-if="activeTab === 'npa'">
        <!-- Search + filter -->
        <div class="bg-white rounded-xl border border-gray-100 p-4 mb-6">
          <div class="flex flex-col lg:flex-row gap-4">
            <!-- Search -->
            <div class="flex-1">
              <AppInput
                v-model="npaSearch"
                :placeholder="$t('legalBase.searchNpa')"
              />
            </div>
            <!-- Counter -->
            <div class="flex items-center text-sm text-gray-500">
              {{ $t('legalBase.found') }}: <span class="font-bold text-[#0e888d] ml-1">{{ filteredDocuments.length }}</span>
            </div>
          </div>

          <!-- Category tabs -->
          <div class="flex flex-wrap gap-2 mt-4">
            <button
              v-for="cat in npaCategories"
              :key="cat.value"
              @click="npaCategory = cat.value"
              :class="[
                'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                npaCategory === cat.value
                  ? 'bg-[#0e888d] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              ]"
            >
              {{ cat.label }}
              <span class="ml-1 opacity-70">({{ cat.count }})</span>
            </button>
          </div>
        </div>

        <!-- Documents grid -->
        <div v-if="filteredDocuments.length" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="doc in filteredDocuments"
            :key="doc.id"
            class="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md hover:border-[#0e888d]/20 transition-all duration-200"
          >
            <!-- Category badge + date -->
            <div class="flex items-center justify-between mb-3">
              <span :class="[categoryColor(doc.category), 'text-[11px] px-2.5 py-1 rounded-full font-medium']">
                {{ categoryIcon(doc.category) }} {{ $t(legalCategoryKeys[doc.category]) }}
              </span>
              <span class="text-xs text-gray-400">{{ formatDate(doc.date) }}</span>
            </div>

            <!-- Title -->
            <h3 class="text-sm font-semibold text-[#415861] mb-1 leading-snug">{{ $t(doc.titleKey) }}</h3>

            <!-- Number -->
            <p class="text-xs text-[#0e888d] font-mono mb-2">{{ doc.number }}</p>

            <!-- Description -->
            <p class="text-xs text-gray-500 leading-relaxed mb-3">{{ $t(doc.descriptionKey) }}</p>

            <!-- Link -->
            <a
              v-if="doc.url"
              :href="doc.url"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1 text-xs text-[#0e888d] hover:text-[#065f46] font-medium transition-colors"
            >
              {{ $t('legalBase.viewOnSite') }}
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>

        <!-- Empty state -->
        <div v-else class="text-center py-12">
          <p class="text-gray-400 text-lg mb-2">{{ $t('legalBase.noResults') }}</p>
          <p class="text-gray-300 text-sm">{{ $t('legalBase.tryDifferentQuery') }}</p>
        </div>
      </div>

      <!-- ========== FAQ TAB ========== -->
      <div v-if="activeTab === 'faq'">
        <!-- Search + filter -->
        <div class="bg-white rounded-xl border border-gray-100 p-4 mb-6">
          <div class="flex flex-col lg:flex-row gap-4">
            <div class="flex-1">
              <AppInput
                v-model="faqSearch"
                :placeholder="$t('legalBase.searchFaq')"
              />
            </div>
            <div class="flex items-center text-sm text-gray-500">
              {{ $t('legalBase.found') }}: <span class="font-bold text-[#0e888d] ml-1">{{ filteredFaq.length }}</span>
            </div>
          </div>

          <!-- FAQ Category tabs -->
          <div class="flex flex-wrap gap-2 mt-4">
            <button
              v-for="cat in faqCategories"
              :key="cat.value"
              @click="faqCategory = cat.value"
              :class="[
                'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                faqCategory === cat.value
                  ? 'bg-[#0e888d] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              ]"
            >
              <span v-if="cat.value" class="mr-1">{{ faqCategoryIcon(cat.value as FaqCategory) }}</span>
              {{ cat.label }}
              <span class="ml-1 opacity-70">({{ cat.count }})</span>
            </button>
          </div>
        </div>

        <!-- FAQ Accordion -->
        <div v-if="filteredFaq.length" class="space-y-3">
          <div
            v-for="item in filteredFaq"
            :key="item.id"
            class="bg-white rounded-xl border border-gray-100 overflow-hidden transition-all duration-200"
            :class="openFaqId === item.id ? 'shadow-md border-[#0e888d]/20' : 'hover:border-gray-200'"
          >
            <!-- Question button -->
            <button
              @click="toggleFaq(item.id)"
              class="w-full flex items-start gap-3 p-5 text-left hover:bg-gray-50/50 transition-colors"
            >
              <span class="text-lg flex-shrink-0 mt-0.5">{{ faqCategoryIcon(item.category) }}</span>
              <div class="flex-1 min-w-0">
                <span :class="[
                  faqCategoryKeys[item.category] ? 'text-[10px] px-2 py-0.5 rounded-full font-medium mb-1 inline-block' : '',
                  item.category === 'general' ? 'bg-blue-50 text-blue-600' :
                  item.category === 'payment' ? 'bg-amber-50 text-amber-700' :
                  item.category === 'recycling' ? 'bg-green-50 text-green-700' :
                  item.category === 'licensing' ? 'bg-purple-50 text-purple-700' :
                  'bg-gray-50 text-gray-600'
                ]">
                  {{ $t(faqCategoryKeys[item.category]) }}
                </span>
                <p class="text-sm font-medium text-[#415861] leading-snug">{{ $t(item.questionKey) }}</p>
              </div>
              <svg
                :class="[
                  'w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-300 mt-0.5',
                  openFaqId === item.id ? 'rotate-180' : ''
                ]"
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <!-- Answer -->
            <div
              :style="{
                maxHeight: openFaqId === item.id ? '600px' : '0px',
                opacity: openFaqId === item.id ? 1 : 0,
                overflow: 'hidden',
                transition: 'max-height 300ms ease, opacity 300ms ease',
              }"
            >
              <div class="px-5 pb-5 pl-[52px]">
                <div class="border-t border-gray-100 pt-4">
                  <p class="text-sm text-[#70868f] leading-relaxed whitespace-pre-line">{{ $t(item.answerKey) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-else class="text-center py-12">
          <p class="text-gray-400 text-lg mb-2">{{ $t('legalBase.noResults') }}</p>
          <p class="text-gray-300 text-sm">{{ $t('legalBase.tryDifferentQuery') }}</p>
        </div>
      </div>
    </main>
  </div>
</template>
