<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import AppInput from '../components/ui/AppInput.vue'
import AppButton from '../components/ui/AppButton.vue'
import AppCard from '../components/ui/AppCard.vue'
import SimpleSelect from '../components/ui/SimpleSelect.vue'
import MapCoordinatePicker from '../components/MapCoordinatePicker.vue'
import { feedbackStore, type FeedbackAttachment } from '../stores/feedback'
import { FeedbackCategory, type FeedbackCategoryType } from '../constants/statuses'

const { t } = useI18n()
const router = useRouter()

// Form state
const fullName = ref('')
const phone = ref('')
const email = ref('')
const category = ref<FeedbackCategoryType | ''>('')
const subject = ref('')
const message = ref('')
const documents = ref<{ name: string; size: number; type: string }[]>([])
const showMap = ref(false)
const coordinates = ref<{ lat: number; lng: number } | null>(null)
const locationAddress = ref('')

// Submit state
const loading = ref(false)
const submitted = ref(false)
const ticketNumber = ref('')
const errors = ref<Record<string, string>>({})

const categoryOptions = computed(() => [
  { value: '', label: t('feedback.selectCategory') },
  { value: FeedbackCategory.COMPLAINT, label: t('feedback.categories.complaint') },
  { value: FeedbackCategory.SUGGESTION, label: t('feedback.categories.suggestion') },
  { value: FeedbackCategory.INFO_REQUEST, label: t('feedback.categories.infoRequest') },
  { value: FeedbackCategory.VIOLATION_REPORT, label: t('feedback.categories.violationReport') },
])

const validate = (): boolean => {
  errors.value = {}
  if (!fullName.value.trim()) errors.value.fullName = t('feedback.errors.fullNameRequired')
  if (!phone.value.trim()) errors.value.phone = t('feedback.errors.phoneRequired')
  if (!email.value.trim()) errors.value.email = t('feedback.errors.emailRequired')
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) errors.value.email = t('feedback.errors.emailInvalid')
  if (!category.value) errors.value.category = t('feedback.errors.categoryRequired')
  if (!subject.value.trim()) errors.value.subject = t('feedback.errors.subjectRequired')
  if (!message.value.trim()) errors.value.message = t('feedback.errors.messageRequired')
  return Object.keys(errors.value).length === 0
}

const onFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files) return
  for (let i = 0; i < input.files.length; i++) {
    if (documents.value.length >= 5) break
    const file = input.files[i]
    if (!documents.value.find(d => d.name === file.name)) {
      documents.value.push({ name: file.name, size: file.size, type: file.type })
    }
  }
  input.value = ''
}

const removeDocument = (index: number) => {
  documents.value.splice(index, 1)
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const submitForm = () => {
  if (!validate()) return
  loading.value = true

  const attachments: FeedbackAttachment[] = documents.value.map((d, i) => ({
    id: i + 1,
    fileName: d.name,
    fileSize: d.size,
    fileType: d.type,
    dataUrl: '',
  }))

  setTimeout(() => {
    const item = feedbackStore.create({
      fullName: fullName.value,
      phone: phone.value,
      email: email.value,
      category: category.value as FeedbackCategoryType,
      subject: subject.value,
      message: message.value,
      attachments,
      latitude: coordinates.value?.lat,
      longitude: coordinates.value?.lng,
      locationAddress: locationAddress.value || undefined,
    })

    ticketNumber.value = item.ticketNumber
    submitted.value = true
    loading.value = false
  }, 800)
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
            <h2 class="text-2xl font-bold text-gray-800 mb-3">{{ $t('feedback.successTitle') }}</h2>
            <p class="text-gray-600 mb-6">{{ $t('feedback.successDescription') }}</p>

            <div class="bg-gray-50 rounded-xl p-6 mb-6 inline-block">
              <p class="text-sm text-gray-500 mb-1">{{ $t('feedback.yourTicketNumber') }}</p>
              <p class="text-3xl font-bold text-[#0e888d] font-mono tracking-wider">{{ ticketNumber }}</p>
            </div>

            <p class="text-sm text-gray-500 mb-8">{{ $t('feedback.successEmailNotice', { email: email }) }}</p>

            <div class="flex flex-col sm:flex-row gap-4 justify-center">
              <AppButton
                :label="$t('feedback.checkStatus')"
                variant="primary"
                @click="router.push('/feedback/status')"
              />
              <AppButton
                :label="$t('feedback.backToHome')"
                variant="outline"
                @click="router.push('/')"
              />
            </div>
          </div>
        </AppCard>
      </div>

      <!-- Form -->
      <div v-else class="max-w-3xl mx-auto">
        <div class="mb-8">
          <h1 class="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">{{ $t('feedback.formTitle') }}</h1>
          <p class="text-gray-600">{{ $t('feedback.formDescription') }}</p>
        </div>

        <AppCard padding="lg">
          <form @submit.prevent="submitForm" class="space-y-6">
            <!-- Personal info section -->
            <div>
              <h3 class="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-100">
                {{ $t('feedback.personalInfo') }}
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="md:col-span-2">
                  <AppInput
                    v-model="fullName"
                    :label="$t('feedback.fields.fullName')"
                    :placeholder="$t('feedback.placeholders.fullName')"
                    :error="errors.fullName"
                    required
                  />
                </div>
                <AppInput
                  v-model="phone"
                  :label="$t('feedback.fields.phone')"
                  :placeholder="$t('feedback.placeholders.phone')"
                  :error="errors.phone"
                  required
                />
                <AppInput
                  v-model="email"
                  type="email"
                  :label="$t('feedback.fields.email')"
                  :placeholder="$t('feedback.placeholders.email')"
                  :error="errors.email"
                  required
                />
              </div>
            </div>

            <!-- Request info section -->
            <div>
              <h3 class="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-100">
                {{ $t('feedback.requestInfo') }}
              </h3>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    {{ $t('feedback.fields.category') }} <span class="text-red-500">*</span>
                  </label>
                  <SimpleSelect
                    v-model="category"
                    :options="categoryOptions"
                    compact
                  />
                  <p v-if="errors.category" class="mt-1 text-sm text-red-500">{{ errors.category }}</p>
                </div>

                <AppInput
                  v-model="subject"
                  :label="$t('feedback.fields.subject')"
                  :placeholder="$t('feedback.placeholders.subject')"
                  :error="errors.subject"
                  required
                />

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    {{ $t('feedback.fields.message') }} <span class="text-red-500">*</span>
                  </label>
                  <textarea
                    v-model="message"
                    :placeholder="$t('feedback.placeholders.message')"
                    rows="5"
                    class="w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0e888d]/30 focus:border-[#0e888d] resize-y"
                    :class="errors.message ? 'border-red-300' : 'border-[#e2e8f0]'"
                  />
                  <p v-if="errors.message" class="mt-1 text-sm text-red-500">{{ errors.message }}</p>
                </div>
              </div>
            </div>

            <!-- File upload section -->
            <div>
              <h3 class="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-100">
                {{ $t('feedback.attachments') }}
              </h3>
              <label class="flex items-center justify-center gap-2 w-full px-4 py-4 border-2 border-dashed border-[#e2e8f0] rounded-xl hover:border-[#10b981] hover:bg-green-50 transition-colors cursor-pointer">
                <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                <span class="text-sm text-gray-500">{{ $t('feedback.selectFiles') }}</span>
                <input type="file" multiple class="hidden" @change="onFileSelect" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" />
              </label>
              <p class="text-xs text-gray-400 mt-1">{{ $t('feedback.maxFiles') }}</p>

              <div v-if="documents.length" class="mt-3 space-y-2">
                <div v-for="(doc, idx) in documents" :key="idx"
                  class="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2"
                >
                  <div class="flex items-center gap-2 min-w-0">
                    <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span class="text-sm text-gray-600 truncate">{{ doc.name }}</span>
                    <span class="text-xs text-gray-400">({{ formatFileSize(doc.size) }})</span>
                  </div>
                  <button type="button" @click="removeDocument(idx)" class="text-red-400 hover:text-red-600 p-1">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Location section -->
            <div>
              <h3 class="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-100">
                {{ $t('feedback.location') }}
              </h3>
              <p class="text-sm text-gray-500 mb-3">{{ $t('feedback.locationHint') }}</p>

              <div v-if="coordinates" class="bg-green-50 rounded-xl p-4 mb-3 flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-green-800">{{ $t('feedback.locationSelected') }}</p>
                  <p class="text-xs text-green-600">{{ coordinates.lat.toFixed(6) }}, {{ coordinates.lng.toFixed(6) }}</p>
                  <p v-if="locationAddress" class="text-xs text-green-600 mt-0.5">{{ locationAddress }}</p>
                </div>
                <button type="button" @click="coordinates = null; locationAddress = ''" class="text-red-400 hover:text-red-600 p-1">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <AppButton
                type="button"
                :label="coordinates ? $t('feedback.changeLocation') : $t('feedback.selectOnMap')"
                variant="outline"
                @click="showMap = true"
              />

              <MapCoordinatePicker
                v-model="coordinates"
                :visible="showMap"
                @update:visible="showMap = $event"
              />
            </div>

            <!-- Submit -->
            <div class="pt-4 border-t border-gray-100 flex flex-col sm:flex-row gap-4">
              <AppButton
                type="submit"
                :label="$t('feedback.submit')"
                variant="primary"
                :loading="loading"
                size="lg"
              />
              <AppButton
                type="button"
                :label="$t('feedback.checkStatusLink')"
                variant="ghost"
                @click="router.push('/feedback/status')"
              />
            </div>
          </form>
        </AppCard>
      </div>
    </main>
  </div>
</template>
