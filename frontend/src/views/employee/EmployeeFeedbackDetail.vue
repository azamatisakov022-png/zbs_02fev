<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import AppCard from '../../components/ui/AppCard.vue'
import { AppButton } from '../../components/ui'
import SimpleSelect from '../../components/ui/SimpleSelect.vue'
import { useEmployeeMenu } from '../../composables/useRoleMenu'
import { feedbackStore } from '../../stores/feedback'
import { FeedbackStatus, statusI18nKey } from '../../constants/statuses'
import { toastStore } from '../../stores/toast'

const { roleTitle, menuItems } = useEmployeeMenu()
const { t, locale: i18nLocale } = useI18n()
const router = useRouter()
const route = useRoute()

const responseText = ref('')
const internalComment = ref('')
const selectedStatus = ref('')
const isSubmitting = ref(false)

const id = computed(() => Number(route.params.id))

// Computed from store reactive state — guarantees the template always reflects current data
const item = computed(() => {
  return feedbackStore.state.items.find(i => i.id === id.value) || null
})

onMounted(() => {
  feedbackStore.fetchById(id.value)
  if (item.value) {
    selectedStatus.value = item.value.status
    responseText.value = item.value.response || ''
  }
})

const statusOptions = computed(() => [
  { value: FeedbackStatus.NEW, label: t('status.new') },
  { value: FeedbackStatus.IN_PROGRESS, label: t('status.inProgress') },
  { value: FeedbackStatus.UNDER_REVIEW, label: t('status.underReview') },
  { value: FeedbackStatus.RESOLVED, label: t('status.resolved') },
  { value: FeedbackStatus.REJECTED, label: t('status.rejected') },
])

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

const localeMap: Record<string, string> = { ru: 'ru-RU', ky: 'ky-KG', en: 'en-GB' }
const dateLang = computed(() => localeMap[(i18nLocale as any).value || 'ru'] || 'ru-RU')

const formatDate = (dateStr: string): string => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString(dateLang.value, { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const formatDateTime = (dateStr: string): string => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString(dateLang.value, { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' +
    d.toLocaleTimeString(dateLang.value, { hour: '2-digit', minute: '2-digit' })
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

const slaInfo = computed(() => {
  if (!item.value) return { days: 0, color: '', text: '' }
  const days = feedbackStore.getDaysElapsed(item.value.createdAt)
  const color = feedbackStore.getSlaColor(item.value.createdAt, item.value.status)
  const remaining = Math.max(0, 30 - days)
  return { days, color, remaining }
})

const changeStatus = () => {
  if (!item.value || selectedStatus.value === item.value.status) return
  isSubmitting.value = true

  setTimeout(() => {
    feedbackStore.updateStatus(item.value!.id, selectedStatus.value as any, 'Сотрудник МПРЭТН')
    // item is computed from store — status updates automatically
    toastStore.show({ type: 'success', title: t('feedback.statusUpdated') })
    isSubmitting.value = false
  }, 300)
}

const sendResponse = () => {
  if (!item.value || !responseText.value.trim()) return
  isSubmitting.value = true

  setTimeout(() => {
    feedbackStore.addResponse(item.value!.id, responseText.value, 'Сотрудник МПРЭТН')
    // item is computed from store — response/respondedAt update automatically
    toastStore.show({ type: 'success', title: t('feedback.responseSent') })
    isSubmitting.value = false
  }, 300)
}

const addInternalComment = () => {
  if (!item.value || !internalComment.value.trim()) return

  feedbackStore.addComment(item.value.id, {
    author: 'Сотрудник МПРЭТН',
    authorRole: 'employee',
    text: internalComment.value,
    internal: true,
  })
  internalComment.value = ''
  toastStore.show({ type: 'success', title: t('feedback.commentAdded') })
}

const takeInWork = () => {
  if (!item.value) return
  feedbackStore.assignTo(item.value.id, 'emp-current', 'Сотрудник МПРЭТН')
  // item is computed from store — status, assignedTo, assignedName update automatically
  selectedStatus.value = FeedbackStatus.IN_PROGRESS
  toastStore.show({ type: 'success', title: t('feedback.takenInWork') })
}
</script>

<template>
  <DashboardLayout :roleTitle="roleTitle" :menuItems="menuItems">
    <div v-if="!item" class="text-center py-12">
      <p class="text-gray-500">{{ $t('feedback.notFound') }}</p>
      <AppButton :label="$t('feedback.backToList')" variant="outline" class="mt-4" @click="router.push('/employee/feedback')" />
    </div>

    <div v-else class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center gap-3">
          <button @click="router.push('/employee/feedback')" class="text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 class="text-xl font-bold text-gray-800 font-mono">{{ item.ticketNumber }}</h1>
            <p class="text-sm text-gray-500">{{ formatDate(item.createdAt) }}</p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <span :class="[statusColor(item.status), 'px-4 py-2 rounded-full text-sm font-medium']">
            {{ statusLabel(item.status) }}
          </span>
          <button
            v-if="item.status === 'new' && !item.assignedTo"
            class="inline-flex items-center gap-2 px-5 py-2.5 bg-[#22C55E] hover:bg-[#16A34A] text-white font-semibold rounded-xl shadow-sm transition-all duration-200"
            @click="takeInWork"
          >
            {{ $t('feedback.takeInWork') }}
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left column: main content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Request content -->
          <AppCard padding="lg">
            <h3 class="text-lg font-semibold text-gray-700 mb-4">{{ $t('feedback.requestContent') }}</h3>

            <div class="mb-4">
              <p class="text-sm text-gray-500 mb-1">{{ $t('feedback.fields.category') }}</p>
              <span class="inline-block bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full">
                {{ categoryLabel(item.category) }}
              </span>
            </div>

            <div class="mb-4">
              <p class="text-sm text-gray-500 mb-1">{{ $t('feedback.fields.subject') }}</p>
              <p class="text-sm font-medium text-gray-800">{{ item.subject }}</p>
            </div>

            <div class="mb-4">
              <p class="text-sm text-gray-500 mb-1">{{ $t('feedback.fields.message') }}</p>
              <p class="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg p-4">{{ item.message }}</p>
            </div>

            <!-- Attachments -->
            <div v-if="item.attachments.length">
              <p class="text-sm text-gray-500 mb-2">{{ $t('feedback.attachments') }} ({{ item.attachments.length }})</p>
              <div class="space-y-1">
                <div v-for="att in item.attachments" :key="att.id" class="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                  <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  <span class="text-sm text-gray-600">{{ att.fileName }}</span>
                </div>
              </div>
            </div>

            <!-- Location -->
            <div v-if="item.latitude && item.longitude" class="mt-4">
              <p class="text-sm text-gray-500 mb-2">{{ $t('feedback.location') }}</p>
              <div class="bg-green-50 rounded-lg p-3">
                <p class="text-sm text-green-800">
                  <svg class="w-4 h-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {{ item.latitude.toFixed(6) }}, {{ item.longitude.toFixed(6) }}
                </p>
                <p v-if="item.locationAddress" class="text-xs text-green-600 mt-1 ml-5">{{ item.locationAddress }}</p>
              </div>
            </div>
          </AppCard>

          <!-- Response to citizen -->
          <AppCard padding="lg">
            <h3 class="text-lg font-semibold text-gray-700 mb-4">{{ $t('feedback.responseToApplicant') }}</h3>

            <div v-if="item.response && item.respondedAt" class="bg-green-50 rounded-lg p-4 mb-4">
              <p class="text-sm text-green-800 whitespace-pre-wrap">{{ item.response }}</p>
              <p class="text-xs text-green-600 mt-2">{{ $t('feedback.respondedAt') }}: {{ formatDate(item.respondedAt) }}</p>
            </div>

            <div>
              <textarea
                v-model="responseText"
                :placeholder="$t('feedback.placeholders.response')"
                rows="4"
                class="w-full px-4 py-3 border border-[#e2e8f0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0e888d]/30 focus:border-[#0e888d] resize-y"
              />
              <AppButton
                :label="item.response ? $t('feedback.updateResponse') : $t('feedback.sendResponse')"
                variant="primary"
                class="mt-2"
                :loading="isSubmitting"
                :disabled="!responseText.trim()"
                @click="sendResponse"
              />
            </div>
          </AppCard>

          <!-- Internal comments -->
          <AppCard padding="lg">
            <h3 class="text-lg font-semibold text-gray-700 mb-4">
              {{ $t('feedback.internalComments') }}
              <span class="text-xs font-normal text-gray-400 ml-2">{{ $t('feedback.onlyForEmployees') }}</span>
            </h3>

            <div v-if="item.comments.length" class="space-y-3 mb-4">
              <div v-for="comment in item.comments" :key="comment.id"
                :class="[
                  'rounded-lg p-3',
                  comment.internal ? 'bg-amber-50 border border-amber-100' : 'bg-gray-50'
                ]"
              >
                <div class="flex items-center justify-between mb-1">
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-medium text-gray-700">{{ comment.author }}</span>
                    <span v-if="comment.internal" class="text-[10px] bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded">
                      {{ $t('feedback.internal') }}
                    </span>
                  </div>
                  <span class="text-xs text-gray-400">{{ formatDateTime(comment.timestamp) }}</span>
                </div>
                <p class="text-sm text-gray-600">{{ comment.text }}</p>
              </div>
            </div>
            <p v-else class="text-sm text-gray-400 mb-4">{{ $t('feedback.noComments') }}</p>

            <div class="flex gap-2">
              <textarea
                v-model="internalComment"
                :placeholder="$t('feedback.placeholders.internalComment')"
                rows="2"
                class="flex-1 px-4 py-2 border border-[#e2e8f0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0e888d]/30 focus:border-[#0e888d] resize-none"
              />
              <AppButton
                :label="$t('feedback.addComment')"
                variant="outline"
                :disabled="!internalComment.trim()"
                @click="addInternalComment"
              />
            </div>
          </AppCard>
        </div>

        <!-- Right column: sidebar -->
        <div class="space-y-6">
          <!-- Applicant info -->
          <AppCard padding="lg">
            <h3 class="text-lg font-semibold text-gray-700 mb-4">{{ $t('feedback.applicantInfo') }}</h3>
            <div class="space-y-3">
              <div>
                <p class="text-xs text-gray-400">{{ $t('feedback.fields.fullName') }}</p>
                <p class="text-sm font-medium text-gray-800">{{ item.fullName }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-400">{{ $t('feedback.fields.phone') }}</p>
                <p class="text-sm text-gray-700">{{ item.phone }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-400">{{ $t('feedback.fields.email') }}</p>
                <p class="text-sm text-gray-700">{{ item.email }}</p>
              </div>
              <div v-if="item.region">
                <p class="text-xs text-gray-400">{{ $t('feedback.table.region') }}</p>
                <p class="text-sm text-gray-700">{{ item.region }}</p>
              </div>
            </div>
          </AppCard>

          <!-- Status management -->
          <AppCard padding="lg">
            <h3 class="text-lg font-semibold text-gray-700 mb-4">{{ $t('feedback.changeStatus') }}</h3>

            <div class="mb-3">
              <SimpleSelect v-model="selectedStatus" :options="statusOptions" compact />
            </div>
            <AppButton
              :label="$t('feedback.applyStatus')"
              variant="primary"
              full-width
              :loading="isSubmitting"
              :disabled="selectedStatus === item.status"
              @click="changeStatus"
            />

            <!-- SLA indicator -->
            <div class="mt-4 pt-4 border-t border-gray-100">
              <p class="text-xs text-gray-400 mb-1">{{ $t('feedback.slaDeadline') }}</p>
              <div class="flex items-center gap-2">
                <div :class="[
                  'w-3 h-3 rounded-full',
                  slaInfo.color === 'red' ? 'bg-red-500' :
                  slaInfo.color === 'yellow' ? 'bg-yellow-500' :
                  'bg-green-500'
                ]"></div>
                <span :class="[
                  'text-sm font-medium',
                  slaInfo.color === 'red' ? 'text-red-600' :
                  slaInfo.color === 'yellow' ? 'text-yellow-600' :
                  'text-green-600'
                ]">
                  {{ slaInfo.days }} {{ $t('feedback.daysElapsed') }}
                  <template v-if="item.status !== 'resolved' && item.status !== 'rejected'">
                    ({{ $t('feedback.daysRemaining', { days: slaInfo.remaining }) }})
                  </template>
                </span>
              </div>
            </div>

            <!-- Assigned -->
            <div v-if="item.assignedName" class="mt-4 pt-4 border-t border-gray-100">
              <p class="text-xs text-gray-400 mb-1">{{ $t('feedback.assignedTo') }}</p>
              <p class="text-sm font-medium text-gray-700">{{ item.assignedName }}</p>
            </div>
          </AppCard>

          <!-- Timeline -->
          <AppCard padding="lg">
            <h3 class="text-lg font-semibold text-gray-700 mb-4">{{ $t('feedback.timeline') }}</h3>
            <div class="relative">
              <div class="absolute left-[9px] top-3 bottom-3 w-0.5 bg-gray-200"></div>
              <div v-for="entry in item.timeline" :key="entry.id" class="relative flex gap-3 pb-4 last:pb-0">
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
                  <span :class="[statusColor(entry.status), 'text-xs px-2 py-0.5 rounded-full font-medium']">
                    {{ statusLabel(entry.status) }}
                  </span>
                  <p class="text-xs text-gray-400 mt-1">{{ formatDateTime(entry.timestamp) }}</p>
                  <p class="text-xs text-gray-500">{{ entry.author }}</p>
                  <p v-if="entry.comment" class="text-xs text-gray-600 mt-0.5 italic">{{ entry.comment }}</p>
                </div>
              </div>
            </div>
          </AppCard>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>
