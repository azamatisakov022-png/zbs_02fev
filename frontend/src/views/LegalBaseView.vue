<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AppInput from '../components/ui/AppInput.vue'
import {
  legalDocuments,
  faqItems,
  legalCategoryKeys,
  faqCategoryKeys,
  hasSource,
  type LegalCategory,
  type FaqCategory,
  type LegalDocument,
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
  result.sort((a, b) => b.date.localeCompare(a.date))
  return result
})

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// ========== Document open: direct file (PDF preview / DOC-DOCX download), otherwise external URL ==========
//
// Note: we used to wrap DOC/DOCX in Google Docs Viewer
// (https://docs.google.com/gview?url=...&embedded=true), but that requires
// the file to be reachable from the public internet - it fails silently on
// localhost (Google's servers can't fetch http://localhost:5173/...).
// Direct file open works in every environment: PDFs preview in the browser,
// DOC/DOCX trigger a download. When the site goes to production with a real
// domain we can optionally re-introduce the viewer.
function openDoc(doc: LegalDocument): void {
  if (doc.localFile) {
    window.open(`/docs/laws/${doc.localFile}`, '_blank', 'noopener,noreferrer')
    return
  }
  if (doc.url) {
    window.open(doc.url, '_blank', 'noopener,noreferrer')
  }
}

function downloadDoc(doc: LegalDocument): void {
  if (!doc.localFile) return
  const link = document.createElement('a')
  link.href = `/docs/laws/${doc.localFile}`
  link.download = doc.localFile
  link.click()
}

// ========== Polish helpers (Lucide-style stroke icons + dot colors) ==========
type IconName =
  | 'scroll-text'
  | 'folder'
  | 'clipboard-list'
  | 'settings'
  | 'globe'
  | 'pin'
  | 'wallet'
  | 'recycle'
  | 'clipboard-check'
  | 'bar-chart-3'
  | 'file-text'
  | 'help-circle'

const iconPaths: Record<IconName, string> = {
  'scroll-text':
    '<path d="M15 12h-5"/><path d="M15 8h-5"/><path d="M19 17V5a2 2 0 0 0-2-2H4"/><path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3"/>',
  folder:
    '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
  'clipboard-list':
    '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>',
  settings:
    '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  globe:
    '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
  pin: '<path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/>',
  wallet:
    '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
  recycle:
    '<path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5"/><path d="M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12"/><path d="m14 16-3 3 3 3"/><path d="M8.293 13.596 7.196 9.5 3.1 10.598"/><path d="m9.344 5.811 1.093-1.892A1.83 1.83 0 0 1 11.985 3a1.784 1.784 0 0 1 1.546.888l3.943 6.843"/><path d="m13.378 9.633 4.096 1.098 1.097-4.096"/>',
  'clipboard-check':
    '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>',
  'bar-chart-3':
    '<path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
  'file-text':
    '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/>',
  'help-circle':
    '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
}

const categoryIcon = (cat: LegalCategory): IconName => {
  const map: Record<LegalCategory, IconName> = {
    laws: 'scroll-text',
    decrees: 'folder',
    regulations: 'clipboard-list',
    technical: 'settings',
    international: 'globe',
  }
  return map[cat] || 'file-text'
}

const faqCategoryIcon = (cat: FaqCategory): IconName => {
  const map: Record<FaqCategory, IconName> = {
    general: 'pin',
    payment: 'wallet',
    recycling: 'recycle',
    licensing: 'clipboard-check',
    reporting: 'bar-chart-3',
  }
  return map[cat] || 'help-circle'
}

const categoryDotColor = (cat: LegalCategory): string => {
  const map: Record<LegalCategory, string> = {
    laws: 'bg-[#0e888d]',
    decrees: 'bg-[#2D8B4E]',
    regulations: 'bg-[#415861]',
    technical: 'bg-[#fea629]',
    international: 'bg-[#0891b2]',
  }
  return map[cat] || 'bg-gray-400'
}

const faqCategoryDotColor = (cat: FaqCategory): string => {
  const map: Record<FaqCategory, string> = {
    general: 'bg-[#0e888d]',
    payment: 'bg-[#fea629]',
    recycling: 'bg-[#2D8B4E]',
    licensing: 'bg-[#415861]',
    reporting: 'bg-[#0891b2]',
  }
  return map[cat] || 'bg-gray-400'
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
              'inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200',
              activeTab === 'npa'
                ? 'bg-[#0e888d] text-white shadow-sm'
                : 'text-[#415861] hover:bg-gray-50'
            ]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16" height="16" viewBox="0 0 24 24"
              fill="none" stroke="currentColor"
              stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
              v-html="iconPaths['scroll-text']"
            />
            {{ $t('legalBase.tabNpa') }}
          </button>
          <button
            @click="activeTab = 'faq'"
            :class="[
              'inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200',
              activeTab === 'faq'
                ? 'bg-[#0e888d] text-white shadow-sm'
                : 'text-[#415861] hover:bg-gray-50'
            ]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16" height="16" viewBox="0 0 24 24"
              fill="none" stroke="currentColor"
              stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
              v-html="iconPaths['help-circle']"
            />
            {{ $t('legalBase.tabFaq') }}
          </button>
        </div>
      </div>

      <!-- ========== NPA TAB ========== -->
      <div v-if="activeTab === 'npa'">
        <!-- Search + filter -->
        <div class="bg-white rounded-xl border border-gray-100 p-4 mb-6">
          <div class="flex flex-col lg:flex-row gap-4">
            <div class="flex-1">
              <AppInput
                v-model="npaSearch"
                :placeholder="$t('legalBase.searchNpa')"
              />
            </div>
            <div class="flex items-center text-sm text-gray-500">
              {{ $t('legalBase.found') }}: <span class="font-bold text-[#0e888d] ml-1">{{ filteredDocuments.length }}</span>
            </div>
          </div>

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
          <article
            v-for="doc in filteredDocuments"
            :key="doc.id"
            :class="[
              'group bg-white rounded-lg border border-slate-200 p-5 transition-all duration-200',
              hasSource(doc)
                ? 'cursor-pointer hover:border-[#0e888d]/40 hover:-translate-y-[1px]'
                : 'opacity-90 hover:border-slate-300',
            ]"
            @click="hasSource(doc) && openDoc(doc)"
          >
            <!-- Header: badge · number · date -->
            <div class="flex items-center justify-between mb-3 gap-3">
              <div class="flex items-center gap-2 min-w-0">
                <span class="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full bg-slate-50 text-slate-700 border border-slate-200 flex-shrink-0">
                  <span :class="['w-1.5 h-1.5 rounded-full flex-shrink-0', categoryDotColor(doc.category)]" />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14" height="14" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor"
                    stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
                    v-html="iconPaths[categoryIcon(doc.category)]"
                  />
                  {{ $t(legalCategoryKeys[doc.category]) }}
                </span>
                <template v-if="doc.number && doc.number !== '-'">
                  <span class="text-slate-300 flex-shrink-0">·</span>
                  <span class="text-xs font-mono font-semibold text-[#0e888d] truncate">
                    {{ doc.number }}
                  </span>
                </template>
              </div>
              <div class="flex items-center gap-2 flex-shrink-0">
                <span
                  :class="[
                    'inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full',
                    doc.status === 'repealed' ? 'bg-slate-100 text-slate-500' : 'bg-emerald-50 text-emerald-700',
                  ]"
                >
                  <span :class="['w-1.5 h-1.5 rounded-full', doc.status === 'repealed' ? 'bg-slate-400' : 'bg-emerald-500']" />
                  {{ doc.status === 'repealed' ? $t('legalBase.statusRepealed') : $t('legalBase.statusActive') }}
                </span>
                <span class="text-xs text-gray-400">{{ formatDate(doc.date) }}</span>
              </div>
            </div>

            <h3 class="text-sm font-semibold text-[#415861] mb-2 leading-snug">{{ $t(doc.titleKey) }}</h3>
            <p v-if="doc.editionDate" class="text-[11px] text-gray-400 mb-1">{{ $t('legalBase.editionFrom') }} {{ formatDate(doc.editionDate) }}</p>

            <p class="text-xs text-gray-500 leading-relaxed mb-3">{{ $t(doc.descriptionKey) }}</p>

            <!-- Footer: open / download OR "source pending" -->
            <div class="flex items-center gap-3 flex-wrap">
              <!-- Local file: open via viewer + download -->
              <template v-if="doc.localFile">
                <span class="inline-flex items-center gap-1 text-xs text-[#0e888d] font-medium group-hover:underline">
                  {{ $t('legalBase.openDocument') }}
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
                <span class="text-slate-300">·</span>
                <button
                  type="button"
                  class="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-[#0e888d] font-medium transition-colors"
                  @click.stop="downloadDoc(doc)"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
                  </svg>
                  {{ doc.fileType?.toUpperCase() }}
                </button>
              </template>

              <!-- External URL only -->
              <span
                v-else-if="doc.url"
                class="inline-flex items-center gap-1 text-xs text-[#0e888d] font-medium group-hover:underline"
              >
                {{ $t('legalBase.viewOnSite') }}
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </span>

              <!-- Pending: no source -->
              <span
                v-else
                class="inline-flex items-center gap-1.5 text-xs text-slate-400 font-medium"
              >
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" stroke-width="1.5" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l2.5 2.5" />
                </svg>
                {{ $t('legalBase.fileNotReady') }}
              </span>
            </div>
          </article>
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
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                faqCategory === cat.value
                  ? 'bg-[#0e888d] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              ]"
            >
              <svg
                v-if="cat.value"
                xmlns="http://www.w3.org/2000/svg"
                width="14" height="14" viewBox="0 0 24 24"
                fill="none" stroke="currentColor"
                stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
                v-html="iconPaths[faqCategoryIcon(cat.value as FaqCategory)]"
              />
              {{ cat.label }}
              <span class="opacity-70">({{ cat.count }})</span>
            </button>
          </div>
        </div>

        <!-- FAQ Accordion -->
        <div v-if="filteredFaq.length" class="space-y-3">
          <div
            v-for="item in filteredFaq"
            :key="item.id"
            class="bg-white rounded-lg border overflow-hidden transition-all duration-200"
            :class="openFaqId === item.id ? 'border-[#0e888d]/40' : 'border-slate-200 hover:border-[#0e888d]/40'"
          >
            <button
              @click="toggleFaq(item.id)"
              class="w-full flex items-start gap-3 p-5 text-left hover:bg-gray-50/50 transition-colors"
            >
              <div class="flex-1 min-w-0">
                <span class="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full bg-slate-50 text-slate-700 border border-slate-200 mb-2">
                  <span :class="['w-1.5 h-1.5 rounded-full flex-shrink-0', faqCategoryDotColor(item.category)]" />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14" height="14" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor"
                    stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
                    v-html="iconPaths[faqCategoryIcon(item.category)]"
                  />
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
              <div class="px-5 pb-5">
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
