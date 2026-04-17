<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { contestStore } from '../stores/contests'
import { ContestStatus } from '../constants/statuses'

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()

const isLoading = ref(true)
const contestId = computed(() => Number(route.params.id))
const contest = computed(() => contestStore.state.currentContest)

onMounted(async () => {
  await contestStore.fetchPublicById(contestId.value)
  isLoading.value = false
})

const formatDate = (iso: string): string => {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString(
    locale.value === 'ru' ? 'ru-RU' : locale.value === 'ky' ? 'ky-KG' : 'en-US',
    { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }
  )
}

const formatGrant = (amount?: number, currency?: string): string => {
  if (!amount) return '—'
  const c = currency === 'KGS' ? 'сом' : (currency || '')
  return `${amount.toLocaleString('ru-RU')} ${c}`.trim()
}

const isDeadlinePassed = computed(() => {
  if (!contest.value) return false
  return new Date(contest.value.deadline).getTime() < Date.now()
})

const isClosedOrPassed = computed(() => {
  if (!contest.value) return false
  return contest.value.status === ContestStatus.CLOSED || isDeadlinePassed.value
})

const downloadRegulations = () => {
  if (!contest.value) return
  window.open(contestStore.getRegulationsDownloadUrl(contest.value.id, true), '_blank')
}
</script>

<template>
  <div class="min-h-screen py-10 lg:py-12 bg-gray-50">
    <div class="container-main">
      <button
        @click="router.push('/contests')"
        class="inline-flex items-center gap-2 text-[#0e888d] hover:text-[#0a6d71] font-medium mb-6"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        {{ $t('contests.detail.backToList') }}
      </button>

      <!-- Loading -->
      <div v-if="isLoading" class="flex items-center justify-center py-16">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0e888d]"></div>
      </div>

      <!-- Not found -->
      <div v-else-if="!contest" class="bg-white rounded-[30px] p-10 text-center border border-gray-100">
        <p class="text-xl text-gray-600">{{ $t('contests.detail.notFound') }}</p>
      </div>

      <!-- Contest detail -->
      <div v-else class="bg-white rounded-[30px] overflow-hidden border border-gray-100">
        <!-- Hero -->
        <div class="relative bg-gradient-to-br from-[#0e888d] to-[#0a6d71] text-white p-8 lg:p-12">
          <div class="text-[80px] mb-4">🏆</div>
          <h1 class="text-2xl lg:text-3xl font-bold mb-3">{{ contest.title }}</h1>
          <div v-if="isClosedOrPassed"
               class="inline-block bg-white/20 backdrop-blur text-white px-4 py-2 rounded-full text-sm font-medium">
            {{ isDeadlinePassed ? $t('contests.detail.deadlinePassed') : $t('contests.detail.closed') }}
          </div>
        </div>

        <!-- Body -->
        <div class="p-8 lg:p-12 space-y-8">
          <!-- Key info -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div v-if="contest.grantAmount" class="bg-gray-50 rounded-2xl p-5">
              <p class="text-sm text-gray-500 mb-1">{{ $t('contests.detail.grant') }}</p>
              <p class="text-xl font-bold text-[#0e888d]">
                {{ formatGrant(contest.grantAmount, contest.grantCurrency) }}
              </p>
            </div>
            <div class="bg-gray-50 rounded-2xl p-5">
              <p class="text-sm text-gray-500 mb-1">{{ $t('contests.detail.deadline') }}</p>
              <p class="text-xl font-bold text-[#415861]">{{ formatDate(contest.deadline) }}</p>
            </div>
          </div>

          <!-- Description -->
          <div>
            <h2 class="text-lg font-semibold text-[#415861] mb-3 pb-2 border-b border-gray-100">
              {{ $t('contests.detail.description') }}
            </h2>
            <p class="text-gray-700 leading-relaxed whitespace-pre-line">{{ contest.description }}</p>
          </div>

          <!-- Conditions -->
          <div v-if="contest.conditions">
            <h2 class="text-lg font-semibold text-[#415861] mb-3 pb-2 border-b border-gray-100">
              {{ $t('contests.detail.conditions') }}
            </h2>
            <p class="text-gray-700 leading-relaxed whitespace-pre-line">{{ contest.conditions }}</p>
          </div>

          <!-- Regulations -->
          <div v-if="contest.hasRegulations">
            <h2 class="text-lg font-semibold text-[#415861] mb-3 pb-2 border-b border-gray-100">
              {{ $t('contests.detail.regulationsTitle') }}
            </h2>
            <button
              @click="downloadRegulations"
              class="inline-flex items-center gap-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl px-5 py-3 transition-colors"
            >
              <svg class="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div class="text-left">
                <p class="font-medium text-[#415861]">{{ $t('contests.detail.downloadRegulations') }}</p>
                <p class="text-xs text-gray-500">{{ contest.regulationsFileName }}</p>
              </div>
            </button>
          </div>

          <!-- Apply button -->
          <div class="pt-6 border-t border-gray-100">
            <button
              v-if="!isClosedOrPassed"
              @click="router.push(`/contests/${contest.id}/apply`)"
              class="w-full sm:w-auto bg-[#0e888d] hover:bg-[#0a6d71] text-white text-lg font-medium px-10 py-4 rounded-[20px] transition-colors"
            >
              {{ $t('contests.detail.applyButton') }}
            </button>
            <p v-else class="text-gray-500 text-center sm:text-left">
              {{ isDeadlinePassed ? $t('contests.detail.deadlinePassed') : $t('contests.detail.closed') }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
