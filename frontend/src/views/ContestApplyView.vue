<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import AppInput from '../components/ui/AppInput.vue'
import AppButton from '../components/ui/AppButton.vue'
import AppCard from '../components/ui/AppCard.vue'
import { contestStore } from '../stores/contests'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const contestId = computed(() => Number(route.params.id))

// Form state
const lastName = ref('')
const firstName = ref('')
const middleName = ref('')
const phone = ref('+996 ')
const email = ref('')
const document = ref<File | null>(null)
const consent = ref(false)

const errors = ref<Record<string, string>>({})
const loading = ref(false)
const submitted = ref(false)
const ticketNumber = ref('')

const contest = computed(() => contestStore.state.currentContest)

onMounted(async () => {
  if (!contest.value || contest.value.id !== contestId.value) {
    await contestStore.fetchPublicById(contestId.value)
  }
})

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const onFileSelect = (e: Event) => {
  const input = e.target as HTMLInputElement
  if (!input.files || !input.files[0]) return
  const f = input.files[0]
  errors.value.document = ''
  if (f.size > 10 * 1024 * 1024) {
    errors.value.document = t('contests.errors.documentTooLarge')
    input.value = ''
    return
  }
  const lower = f.name.toLowerCase()
  if (!lower.endsWith('.pdf') && !lower.endsWith('.doc') && !lower.endsWith('.docx')) {
    errors.value.document = t('contests.errors.documentBadFormat')
    input.value = ''
    return
  }
  document.value = f
  input.value = ''
}

const removeDocument = () => {
  document.value = null
}

const validate = (): boolean => {
  errors.value = {}
  if (!lastName.value.trim()) errors.value.lastName = t('contests.errors.lastNameRequired')
  if (!firstName.value.trim()) errors.value.firstName = t('contests.errors.firstNameRequired')
  if (!phone.value.trim()) errors.value.phone = t('contests.errors.phoneRequired')
  else if (!/^\+996[\s\d]{9,}$/.test(phone.value.replace(/\s/g, '').replace(/-/g, ''))
           && !/^\+996[\s\d-]{9,}$/.test(phone.value)) {
    // soft check: starts with +996
    if (!phone.value.trim().startsWith('+996')) {
      errors.value.phone = t('contests.errors.phoneInvalid')
    }
  }
  if (!email.value.trim()) errors.value.email = t('contests.errors.emailRequired')
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errors.value.email = t('contests.errors.emailInvalid')
  }
  if (!document.value) errors.value.document = t('contests.errors.documentRequired')
  if (!consent.value) errors.value.consent = t('contests.errors.consentRequired')
  return Object.keys(errors.value).length === 0
}

const submitForm = async () => {
  if (!validate() || !document.value) return
  loading.value = true
  try {
    const result = await contestStore.submitApplication(contestId.value, {
      lastName: lastName.value.trim(),
      firstName: firstName.value.trim(),
      middleName: middleName.value.trim() || undefined,
      phone: phone.value.trim(),
      email: email.value.trim(),
      file: document.value,
    })
    ticketNumber.value = result.number
    submitted.value = true
  } catch (e: any) {
    errors.value.submit = e?.response?.data?.message || t('contests.errors.submitFailed')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <main class="container-main py-8 lg:py-12">
      <!-- Success screen -->
      <div v-if="submitted" class="max-w-2xl mx-auto">
        <AppCard padding="lg">
          <div class="text-center py-8">
            <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg class="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 class="text-2xl font-bold text-gray-800 mb-3">{{ $t('contests.form.successTitle') }}</h2>
            <p class="text-gray-600 mb-6">{{ $t('contests.form.successDescription') }}</p>

            <div class="bg-gray-50 rounded-xl p-6 mb-4 inline-block">
              <p class="text-sm text-gray-500 mb-1">{{ $t('contests.form.yourNumber') }}</p>
              <p class="text-3xl font-bold text-[#0e888d] font-mono tracking-wider">{{ ticketNumber }}</p>
            </div>

            <p class="text-sm text-gray-500 mb-8">{{ $t('contests.form.successHint') }}</p>

            <div class="flex flex-col sm:flex-row gap-4 justify-center">
              <AppButton :label="$t('contests.form.checkStatusBtn')" variant="primary"
                         @click="router.push('/contests/status')" />
              <AppButton :label="$t('contests.form.backToContests')" variant="outline"
                         @click="router.push('/contests')" />
            </div>
          </div>
        </AppCard>
      </div>

      <!-- Form -->
      <div v-else class="max-w-3xl mx-auto">
        <button
          @click="router.push(`/contests/${contestId}`)"
          class="inline-flex items-center gap-2 text-[#0e888d] hover:text-[#0a6d71] font-medium mb-6"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          {{ $t('contests.detail.backToList') }}
        </button>

        <div class="mb-8">
          <h1 class="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">{{ $t('contests.form.title') }}</h1>
          <p v-if="contest" class="text-[#0e888d] text-base font-medium mb-1">{{ contest.title }}</p>
          <p class="text-gray-600">{{ $t('contests.form.description') }}</p>
        </div>

        <AppCard padding="lg">
          <form @submit.prevent="submitForm" class="space-y-6">
            <!-- Personal info -->
            <div>
              <h3 class="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-100">
                {{ $t('contests.form.personalInfo') }}
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <AppInput v-model="lastName" :label="$t('contests.form.lastName')"
                          :error="errors.lastName" required />
                <AppInput v-model="firstName" :label="$t('contests.form.firstName')"
                          :error="errors.firstName" required />
                <AppInput v-model="middleName" :label="$t('contests.form.middleName')" />
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <AppInput v-model="phone" :label="$t('contests.form.phone')"
                          :placeholder="$t('contests.form.phonePlaceholder')"
                          :error="errors.phone" required />
                <AppInput v-model="email" type="email" :label="$t('contests.form.email')"
                          :error="errors.email" required />
              </div>
            </div>

            <!-- Document -->
            <div>
              <h3 class="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-100">
                {{ $t('contests.form.document') }} <span class="text-red-500">*</span>
              </h3>
              <p class="text-xs text-gray-500 mb-3">{{ $t('contests.form.documentHint') }}</p>

              <label v-if="!document"
                     class="flex items-center justify-center gap-2 w-full px-4 py-6 border-2 border-dashed rounded-xl hover:border-[#0e888d] hover:bg-[#0e888d]/5 transition-colors cursor-pointer"
                     :class="errors.document ? 'border-red-300' : 'border-[#e2e8f0]'">
                <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                <span class="text-sm text-gray-500">{{ $t('contests.form.documentSelect') }}</span>
                <input type="file" class="hidden" @change="onFileSelect"
                       accept=".pdf,.doc,.docx" />
              </label>

              <div v-else class="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                <div class="flex items-center gap-3 min-w-0">
                  <svg class="w-5 h-5 text-[#0e888d] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div class="min-w-0">
                    <p class="text-sm font-medium text-gray-800 truncate">{{ document.name }}</p>
                    <p class="text-xs text-gray-500">{{ formatFileSize(document.size) }}</p>
                  </div>
                </div>
                <button type="button" @click="removeDocument"
                        class="text-red-400 hover:text-red-600 p-1">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <p v-if="errors.document" class="mt-1 text-sm text-red-500">{{ errors.document }}</p>
            </div>

            <!-- Consent -->
            <div>
              <label class="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" v-model="consent"
                       class="mt-1 w-4 h-4 text-[#0e888d] border-gray-300 rounded focus:ring-[#0e888d]" />
                <span class="text-sm text-gray-700">{{ $t('contests.form.consent') }}</span>
              </label>
              <p v-if="errors.consent" class="mt-1 text-sm text-red-500">{{ errors.consent }}</p>
            </div>

            <!-- Submit error -->
            <div v-if="errors.submit" class="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
              {{ errors.submit }}
            </div>

            <!-- Buttons -->
            <div class="pt-4 border-t border-gray-100 flex flex-col sm:flex-row gap-4">
              <AppButton type="submit" :label="$t('contests.form.submit')"
                         variant="primary" :loading="loading" size="lg" />
              <AppButton type="button" :label="$t('contests.form.cancel')" variant="ghost"
                         @click="router.push(`/contests/${contestId}`)" />
            </div>
          </form>
        </AppCard>
      </div>
    </main>
  </div>
</template>
