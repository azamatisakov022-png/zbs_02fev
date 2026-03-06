<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import AppInput from '../components/ui/AppInput.vue'
import AppButton from '../components/ui/AppButton.vue'
import AppCard from '../components/ui/AppCard.vue'
import { feedbackStore, type FeedbackItem } from '../stores/feedback'
import { FeedbackStatus } from '../constants/statuses'
import { statusI18nKey } from '../constants/statuses'

const { t } = useI18n()
const router = useRouter()

const ticketNumber = ref('')
const email = ref('')
const loading = ref(false)
const searched = ref(false)
const foundItem = ref<FeedbackItem | null>(null)
const error = ref('')

const statusColor = (status: string): string => {
  const map: Record<string, string> = {
    [FeedbackStatus.NEW]: 'bg-blue-100 text-blue-800',
    [FeedbackStatus.IN_PROGRESS]: 'bg-yellow-100 text-yellow-800',
    [FeedbackStatus.UNDER_REVIEW]: 'bg-purple-100 text-purple-800',
    [FeedbackStatus.RESOLVED]: 'bg-green-100 text-green-800',
    [FeedbackStatus.REJECTED]: 'bg-red-100 text-red-800',
  }
  return map[status] || 'bg-gray-100 text-gray-800'
}

const statusLabel = (status: string): string => {
  const key = statusI18nKey[status]
  return key ? t(key) : status
}

const formatDate = (dateStr: string): string => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const formatDateTime = (dateStr: string): string => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' +
    d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

const search = () => {
  error.value = ''
  if (!ticketNumber.value.trim() || !email.value.trim()) {
    error.value = t('feedback.errors.fillBothFields')
    return
  }

  loading.value = true
  searched.value = true

  setTimeout(() => {
    const item = feedbackStore.findByTicketAndEmail(ticketNumber.value.trim(), email.value.trim())
    foundItem.value = item || null
    if (!item) {
      error.value = t('feedback.errors.ticketNotFound')
    }
    loading.value = false
  }, 500)
}

const categoryLabel = (cat: string): string => {
  const map: Record<string, string> = {
    complaint: 'feedback.categories.complaint',
    suggestion: 'feedback.categories.suggestion',
    info_request: 'feedback.categories.infoRequest',
    violation_report: 'feedback.categories.violationReport',
  }
  return map[cat] ? t(map[cat]) : cat
}

const publicComments = computed(() => {
  if (!foundItem.value) return []
  return foundItem.value.comments.filter(c => !c.internal)
})
</script>

<template>
  <div class="bg-gray-50">
    <div class="container-main py-8 lg:py-12">
      <div class="max-w-2xl mx-auto">
        <div class="mb-8">
          <h1 class="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">{{ $t('feedback.statusTitle') }}</h1>
          <p class="text-gray-600">{{ $t('feedback.statusDescription') }}</p>
        </div>

        <!-- Search form -->
        <AppCard padding="lg" class="mb-6">
          <form @submit.prevent="search" class="space-y-4">
            <AppInput
              v-model="ticketNumber"
              :label="$t('feedback.fields.ticketNumber')"
              :placeholder="$t('feedback.placeholders.ticketNumber')"
              required
            />
            <AppInput
              v-model="email"
              type="email"
              :label="$t('feedback.fields.email')"
              :placeholder="$t('feedback.placeholders.emailForStatus')"
              required
            />
            <p v-if="error" class="text-sm text-red-500">{{ error }}</p>
            <div class="flex flex-col sm:flex-row gap-3">
              <AppButton
                type="submit"
                :label="$t('feedback.search')"
                variant="primary"
                :loading="loading"
              />
              <AppButton
                type="button"
                :label="$t('feedback.newRequest')"
                variant="outline"
                @click="router.push('/feedback')"
              />
            </div>
          </form>
        </AppCard>

        <!-- Results -->
        <div v-if="searched && foundItem && !loading">
          <!-- Status card -->
          <AppCard padding="lg" class="mb-6">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <p class="text-sm text-gray-500">{{ $t('feedback.ticketNumber') }}</p>
                <p class="text-xl font-bold font-mono text-[#0e888d]">{{ foundItem.ticketNumber }}</p>
              </div>
              <span :class="[statusColor(foundItem.status), 'px-4 py-2 rounded-full text-sm font-medium self-start']">
                {{ statusLabel(foundItem.status) }}
              </span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <p class="text-sm text-gray-500">{{ $t('feedback.fields.category') }}</p>
                <p class="text-sm font-medium text-gray-800">{{ categoryLabel(foundItem.category) }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">{{ $t('feedback.createdAt') }}</p>
                <p class="text-sm font-medium text-gray-800">{{ formatDate(foundItem.createdAt) }}</p>
              </div>
            </div>

            <div class="mb-4">
              <p class="text-sm text-gray-500 mb-1">{{ $t('feedback.fields.subject') }}</p>
              <p class="text-sm font-medium text-gray-800">{{ foundItem.subject }}</p>
            </div>

            <div>
              <p class="text-sm text-gray-500 mb-1">{{ $t('feedback.fields.message') }}</p>
              <p class="text-sm text-gray-700 whitespace-pre-wrap">{{ foundItem.message }}</p>
            </div>
          </AppCard>

          <!-- Response -->
          <AppCard v-if="foundItem.response" padding="lg" class="mb-6">
            <h3 class="text-lg font-semibold text-gray-700 mb-3">{{ $t('feedback.officialResponse') }}</h3>
            <p class="text-sm text-gray-700 whitespace-pre-wrap mb-2">{{ foundItem.response }}</p>
            <p v-if="foundItem.respondedAt" class="text-xs text-gray-400">
              {{ $t('feedback.respondedAt') }}: {{ formatDate(foundItem.respondedAt) }}
            </p>
          </AppCard>

          <!-- Public comments -->
          <AppCard v-if="publicComments.length" padding="lg" class="mb-6">
            <h3 class="text-lg font-semibold text-gray-700 mb-3">{{ $t('feedback.comments') }}</h3>
            <div class="space-y-3">
              <div v-for="comment in publicComments" :key="comment.id" class="bg-gray-50 rounded-lg p-3">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-sm font-medium text-gray-700">{{ comment.author }}</span>
                  <span class="text-xs text-gray-400">{{ formatDateTime(comment.timestamp) }}</span>
                </div>
                <p class="text-sm text-gray-600">{{ comment.text }}</p>
              </div>
            </div>
          </AppCard>

          <!-- Timeline -->
          <AppCard padding="lg">
            <h3 class="text-lg font-semibold text-gray-700 mb-4">{{ $t('feedback.timeline') }}</h3>
            <div class="relative">
              <div class="absolute left-[9px] top-3 bottom-3 w-0.5 bg-gray-200"></div>
              <div v-for="(entry, idx) in foundItem.timeline" :key="entry.id" class="relative flex gap-4 pb-4 last:pb-0">
                <div class="relative z-10 flex-shrink-0">
                  <div :class="[
                    'w-5 h-5 rounded-full border-2 border-white',
                    entry.status === 'resolved' ? 'bg-green-500' :
                    entry.status === 'rejected' ? 'bg-red-500' :
                    entry.status === 'in_progress' ? 'bg-yellow-500' :
                    entry.status === 'under_review' ? 'bg-purple-500' :
                    'bg-blue-500'
                  ]"></div>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <span :class="[statusColor(entry.status), 'text-xs px-2 py-0.5 rounded-full font-medium self-start']">
                      {{ statusLabel(entry.status) }}
                    </span>
                    <span class="text-xs text-gray-400">{{ formatDateTime(entry.timestamp) }}</span>
                  </div>
                  <p v-if="entry.comment" class="text-sm text-gray-600 mt-1">{{ entry.comment }}</p>
                </div>
              </div>
            </div>
          </AppCard>
        </div>
      </div>
    </div>
  </div>
</template>
