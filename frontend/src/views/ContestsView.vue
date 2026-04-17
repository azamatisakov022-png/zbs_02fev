<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { contestStore } from '../stores/contests'
import { ContestStatus } from '../constants/statuses'

const { t, locale } = useI18n()
const router = useRouter()

const isLoading = ref(true)

onMounted(async () => {
  await contestStore.fetchPublic()
  isLoading.value = false
})

const contests = computed(() => contestStore.state.publicContests)

const formatDate = (iso: string): string => {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString(
    locale.value === 'ru' ? 'ru-RU' : locale.value === 'ky' ? 'ky-KG' : 'en-US',
    { day: '2-digit', month: 'long', year: 'numeric' }
  )
}

const formatGrant = (amount?: number, currency?: string): string => {
  if (!amount) return '—'
  const c = currency === 'KGS' ? 'сом' : (currency || '')
  return `${amount.toLocaleString('ru-RU')} ${c}`.trim()
}

const isDeadlineSoon = (iso: string): boolean => {
  const days = Math.floor((new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  return days >= 0 && days <= 7
}

const goToDetail = (id: number) => router.push(`/contests/${id}`)
const goToApply = (id: number) => router.push(`/contests/${id}/apply`)
</script>

<template>
  <div class="py-10 lg:py-[60px]">
    <!-- Page header -->
    <div class="container-main">
      <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 class="text-2xl md:text-[28px] lg:text-[30px] font-bold text-[#415861] uppercase mb-2 lg:mb-[12px]">
            {{ $t('contests.title') }}
          </h1>
          <p class="text-base md:text-lg lg:text-[20px] font-medium text-[#415861]">
            {{ $t('contests.subtitle') }}
          </p>
        </div>
        <button
          @click="router.push('/contests/status')"
          class="text-[#0e888d] hover:text-[#0a6d71] font-medium text-base inline-flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          {{ $t('contests.list.checkStatusLink') }}
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="container-main pt-8 lg:pt-[40px]">
      <!-- Loading -->
      <div v-if="isLoading" class="flex items-center justify-center py-16">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0e888d]"></div>
      </div>

      <!-- Empty -->
      <div v-else-if="contests.length === 0"
           class="bg-white rounded-[30px] border border-gray-100 p-10 text-center">
        <div class="text-[60px] mb-4">🏆</div>
        <h2 class="text-xl font-bold text-[#415861] mb-2">{{ $t('contests.list.empty') }}</h2>
        <p class="text-gray-500">{{ $t('contests.list.emptyHint') }}</p>
      </div>

      <!-- Contests grid -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <article
          v-for="contest in contests"
          :key="contest.id"
          class="bg-white rounded-[30px] border border-gray-100 overflow-hidden flex flex-col hover:shadow-lg transition-shadow"
        >
          <div class="relative h-[200px] bg-gradient-to-br from-[#0e888d] to-[#0a6d71] flex items-center justify-center">
            <div class="text-[80px]">🏆</div>
            <div v-if="isDeadlineSoon(contest.deadline)"
                 class="absolute top-4 right-4 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              {{ $t('contests.list.deadline') }}: {{ formatDate(contest.deadline) }}
            </div>
          </div>

          <div class="p-6 lg:p-8 flex flex-col flex-1">
            <h2 class="text-xl lg:text-2xl font-bold text-[#415861] mb-3 leading-snug">
              {{ contest.title }}
            </h2>

            <p class="text-gray-600 text-base leading-relaxed mb-5 line-clamp-3">
              {{ contest.description }}
            </p>

            <div class="space-y-2 text-sm text-[#415861] mb-6">
              <div v-if="contest.grantAmount" class="flex items-start gap-2">
                <span class="text-gray-500 min-w-[120px]">{{ $t('contests.list.grant') }}:</span>
                <span class="font-semibold">{{ formatGrant(contest.grantAmount, contest.grantCurrency) }}</span>
              </div>
              <div class="flex items-start gap-2">
                <span class="text-gray-500 min-w-[120px]">{{ $t('contests.list.deadline') }}:</span>
                <span class="font-semibold">{{ formatDate(contest.deadline) }}</span>
              </div>
            </div>

            <div class="mt-auto flex flex-col sm:flex-row gap-3">
              <button
                @click="goToDetail(contest.id)"
                class="flex-1 bg-white border-2 border-[#0e888d] text-[#0e888d] hover:bg-[#0e888d] hover:text-white text-base font-medium py-3 rounded-[20px] transition-colors"
              >
                {{ $t('contests.list.details') }}
              </button>
              <button
                @click="goToApply(contest.id)"
                class="flex-1 bg-[#0e888d] hover:bg-[#0a6d71] text-white text-base font-medium py-3 rounded-[20px] transition-colors"
              >
                {{ $t('contests.list.applyNow') }}
              </button>
            </div>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>
