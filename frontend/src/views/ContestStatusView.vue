<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import AppInput from '../components/ui/AppInput.vue'
import AppButton from '../components/ui/AppButton.vue'
import AppCard from '../components/ui/AppCard.vue'
import { contestStore, type ContestApplicationStatusInfo } from '../stores/contests'
import { ContestApplicationStatus } from '../constants/statuses'

const { t, locale } = useI18n()
const router = useRouter()

const number = ref('')
const email = ref('')
const errors = ref<Record<string, string>>({})
const loading = ref(false)
const result = ref<ContestApplicationStatusInfo | null>(null)

const validate = (): boolean => {
  errors.value = {}
  if (!number.value.trim()) errors.value.number = t('contests.errors.numberRequired')
  if (!email.value.trim()) errors.value.email = t('contests.errors.emailRequired')
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errors.value.email = t('contests.errors.emailInvalid')
  }
  return Object.keys(errors.value).length === 0
}

const check = async () => {
  if (!validate()) return
  loading.value = true
  result.value = null
  try {
    result.value = await contestStore.checkApplicationStatus(number.value, email.value)
  } catch (e: any) {
    errors.value.check = e?.response?.data?.message || t('contests.errors.checkFailed')
  } finally {
    loading.value = false
  }
}

const reset = () => {
  result.value = null
  number.value = ''
  email.value = ''
  errors.value = {}
}

const formatDate = (iso?: string): string => {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString(
    locale.value === 'ru' ? 'ru-RU' : locale.value === 'ky' ? 'ky-KG' : 'en-US',
    { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }
  )
}

const statusInfo = (status: string) => {
  switch (status) {
    case ContestApplicationStatus.NEW:
      return { color: 'bg-blue-100 text-blue-800', label: t('contests.status.newStatus'), icon: '🕐' }
    case ContestApplicationStatus.UNDER_REVIEW:
      return { color: 'bg-yellow-100 text-yellow-800', label: t('contests.status.reviewStatus'), icon: '🔍' }
    case ContestApplicationStatus.APPROVED:
      return { color: 'bg-green-100 text-green-800', label: t('contests.status.approvedStatus'), icon: '✅' }
    case ContestApplicationStatus.REJECTED:
      return { color: 'bg-red-100 text-red-800', label: t('contests.status.rejectedStatus'), icon: '❌' }
    default:
      return { color: 'bg-gray-100 text-gray-800', label: status, icon: 'ℹ️' }
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <main class="container-main py-8 lg:py-12">
      <div class="max-w-2xl mx-auto">
        <button
          @click="router.push('/contests')"
          class="inline-flex items-center gap-2 text-[#0e888d] hover:text-[#0a6d71] font-medium mb-6"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          {{ $t('contests.detail.backToList') }}
        </button>

        <div class="mb-8">
          <h1 class="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
            {{ $t('contests.status.pageTitle') }}
          </h1>
          <p class="text-gray-600">{{ $t('contests.status.description') }}</p>
        </div>

        <!-- Form -->
        <AppCard v-if="!result" padding="lg">
          <form @submit.prevent="check" class="space-y-5">
            <AppInput v-model="number"
                      :label="$t('contests.status.numberLabel')"
                      :placeholder="$t('contests.status.numberPlaceholder')"
                      :error="errors.number" required />
            <AppInput v-model="email" type="email"
                      :label="$t('contests.status.emailLabel')"
                      :error="errors.email" required />

            <div v-if="errors.check" class="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
              {{ errors.check }}
            </div>

            <AppButton type="submit" :label="$t('contests.status.checkBtn')"
                       variant="primary" :loading="loading" size="lg" />
          </form>
        </AppCard>

        <!-- Result -->
        <AppCard v-else padding="lg">
          <div class="space-y-6">
            <h2 class="text-lg font-semibold text-gray-700 pb-2 border-b border-gray-100">
              {{ $t('contests.status.result') }}
            </h2>

            <div class="bg-gray-50 rounded-xl p-5">
              <p class="text-xs text-gray-500 mb-1">{{ $t('contests.status.numberLabel') }}</p>
              <p class="text-2xl font-bold text-[#0e888d] font-mono">{{ result.number }}</p>
              <p class="text-sm text-gray-600 mt-2">{{ result.contestTitle }}</p>
            </div>

            <div :class="['rounded-xl p-5 flex items-start gap-3', statusInfo(result.status).color]">
              <span class="text-2xl">{{ statusInfo(result.status).icon }}</span>
              <div>
                <p class="font-semibold">{{ statusInfo(result.status).label }}</p>
                <p v-if="result.comment" class="text-sm mt-1">{{ result.comment }}</p>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <p class="text-gray-500">{{ $t('contests.status.submitted') }}</p>
                <p class="font-medium text-gray-700">{{ formatDate(result.createdAt) }}</p>
              </div>
              <div v-if="result.reviewedAt">
                <p class="text-gray-500">{{ $t('contests.status.reviewedAt') }}</p>
                <p class="font-medium text-gray-700">{{ formatDate(result.reviewedAt) }}</p>
              </div>
            </div>

            <AppButton :label="$t('contests.status.newAnother')" variant="outline" @click="reset" />
          </div>
        </AppCard>
      </div>
    </main>
  </div>
</template>
