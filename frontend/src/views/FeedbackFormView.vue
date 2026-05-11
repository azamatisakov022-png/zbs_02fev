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

// Drag-and-drop state for file zone
const isDragging = ref(false)

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

// Drag-and-drop handler - mirrors onFileSelect, doesn't replace it
const onFileDrop = (event: DragEvent) => {
  isDragging.value = false
  if (!event.dataTransfer?.files) return
  for (let i = 0; i < event.dataTransfer.files.length; i++) {
    if (documents.value.length >= 5) break
    const file = event.dataTransfer.files[i]
    if (!documents.value.find(d => d.name === file.name)) {
      documents.value.push({ name: file.name, size: file.size, type: file.type })
    }
  }
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
      <!-- Success screen - UNCHANGED -->
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
        <!-- Page header -->
        <div class="mb-8">
          <h1 class="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">{{ $t('feedback.formTitle') }}</h1>
          <p class="text-gray-600">{{ $t('feedback.formDescription') }}</p>
        </div>

        <AppCard padding="lg">
          <form @submit.prevent="submitForm" class="space-y-8">
            <!-- ───── SECTION 1: Personal info ───── -->
            <section>
              <div class="mb-4 pb-3 border-b border-gray-100">
                <div class="flex items-center gap-3">
                  <span class="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-[#0e888d]/10 text-[#0e888d]">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </span>
                  <h3 class="text-lg font-semibold text-gray-700">{{ $t('feedback.personalInfo') }}</h3>
                </div>
                <p class="mt-1.5 ml-12 text-sm text-gray-500">{{ $t('feedback.personalInfoHint') }}</p>
              </div>

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
            </section>

            <!-- ───── SECTION 2: Request info ───── -->
            <section>
              <div class="mb-4 pb-3 border-b border-gray-100">
                <div class="flex items-center gap-3">
                  <span class="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-[#0e888d]/10 text-[#0e888d]">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </span>
                  <h3 class="text-lg font-semibold text-gray-700">{{ $t('feedback.requestInfo') }}</h3>
                </div>
                <p class="mt-1.5 ml-12 text-sm text-gray-500">{{ $t('feedback.requestInfoHint') }}</p>
              </div>

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
            </section>

            <!-- ───── SECTION 3: Attachments (drag-and-drop) ───── -->
            <section>
              <div class="mb-4 pb-3 border-b border-gray-100">
                <div class="flex items-center gap-3">
                  <span class="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-[#0e888d]/10 text-[#0e888d]">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                      <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 17.98 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                    </svg>
                  </span>
                  <h3 class="text-lg font-semibold text-gray-700">{{ $t('feedback.attachments') }}</h3>
                </div>
                <p class="mt-1.5 ml-12 text-sm text-gray-500">{{ $t('feedback.attachmentsHint') }}</p>
              </div>

              <label
                class="flex flex-col items-center justify-center gap-2 w-full px-4 py-8 border-2 border-dashed rounded-xl transition-colors cursor-pointer"
                :class="isDragging ? 'border-[#0e888d] bg-[#0e888d]/5' : 'border-[#e2e8f0] hover:border-[#10b981] hover:bg-green-50'"
                @dragenter.prevent="isDragging = true"
                @dragover.prevent="isDragging = true"
                @dragleave.prevent="isDragging = false"
                @drop.prevent="onFileDrop"
              >
                <svg class="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                <span class="text-sm text-gray-600 font-medium">{{ $t('feedback.dropZoneTitle') }}</span>
                <span class="text-xs text-gray-400">{{ $t('feedback.dropZoneSubtitle') }}</span>
                <input type="file" multiple class="hidden" @change="onFileSelect" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" />
              </label>

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
            </section>

            <!-- ───── SECTION 4: Location ───── -->
            <section>
              <div class="mb-4 pb-3 border-b border-gray-100">
                <div class="flex items-center gap-3">
                  <span class="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-[#0e888d]/10 text-[#0e888d]">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M20 10c0 7-8 13-8 13s-8-6-8-13a8 8 0 0 1 16 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </span>
                  <h3 class="text-lg font-semibold text-gray-700">{{ $t('feedback.location') }}</h3>
                </div>
                <p class="mt-1.5 ml-12 text-sm text-gray-500">{{ $t('feedback.locationHint') }}</p>
              </div>

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
            </section>

            <!-- ───── Trust strip + Submit ───── -->
            <div class="pt-4 border-t border-gray-100">
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div class="flex items-start gap-3">
                  <span class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#0e888d]/10 text-[#0e888d] flex-shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </span>
                  <div>
                    <p class="text-sm font-semibold text-gray-700">{{ $t('feedback.trust.review.title') }}</p>
                    <p class="text-xs text-gray-500">{{ $t('feedback.trust.review.desc') }}</p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <span class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#0e888d]/10 text-[#0e888d] flex-shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                  </span>
                  <div>
                    <p class="text-sm font-semibold text-gray-700">{{ $t('feedback.trust.confidential.title') }}</p>
                    <p class="text-xs text-gray-500">{{ $t('feedback.trust.confidential.desc') }}</p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <span class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#0e888d]/10 text-[#0e888d] flex-shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m22 7-10 6L2 7" />
                    </svg>
                  </span>
                  <div>
                    <p class="text-sm font-semibold text-gray-700">{{ $t('feedback.trust.notify.title') }}</p>
                    <p class="text-xs text-gray-500">{{ $t('feedback.trust.notify.desc') }}</p>
                  </div>
                </div>
              </div>

              <div class="flex flex-col sm:flex-row gap-4">
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
            </div>
          </form>
        </AppCard>
      </div>
    </main>
  </div>
</template>
