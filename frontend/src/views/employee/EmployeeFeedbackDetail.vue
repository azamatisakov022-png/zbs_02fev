<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import AppCard from '../../components/ui/AppCard.vue'
import { AppButton } from '../../components/ui'
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
const clarificationText = ref('')
const isSubmitting = ref(false)

// Редирект в другой отдел
const redirectDialogOpen = ref(false)
const redirectToDepartment = ref('')
const redirectComment = ref('')

const id = computed(() => Number(route.params.id))

const item = computed(() => feedbackStore.state.items.find(i => i.id === id.value) || null)

onMounted(() => {
  feedbackStore.fetchById(id.value)
  if (item.value) {
    responseText.value = item.value.response || ''
  }
})

// ─── Утилиты отображения ──────────────────────────────────────────

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
  if (!item.value) return { days: 0, color: '', remaining: 30 }
  const days = feedbackStore.getDaysElapsed(item.value.createdAt)
  const color = feedbackStore.getSlaColor(item.value.createdAt, item.value.status)
  const remaining = Math.max(0, 30 - days)
  return { days, color, remaining }
})

// ─── Action Mode — что показывать в правой панели ─────────────────
// Главная идея редизайна: правая колонка всегда отвечает на вопрос
// «что мне сейчас сделать?». Набор кнопок меняется по статусу.

type ActionMode = 'take_or_redirect' | 'respond' | 'clarification' | 'closed'

const actionMode = computed<ActionMode>(() => {
  if (!item.value) return 'closed'
  const s = item.value.status
  if (s === FeedbackStatus.NEW) return 'take_or_redirect'
  if (s === FeedbackStatus.UNDER_REVIEW) return 'clarification'
  if (s === FeedbackStatus.RESOLVED || s === FeedbackStatus.REJECTED) return 'closed'
  return 'respond'
})

const departments = [
  { value: 'ecooperator', label: 'ГП «Эко Оператор» (вопросы переработки)' },
  { value: 'local_gov', label: 'Местные органы власти' },
  { value: 'sanitary', label: 'Санитарно-эпидемиологическая служба' },
  { value: 'police', label: 'Органы внутренних дел' },
  { value: 'other', label: 'Другой отдел / ведомство' },
]

// ─── Действия ─────────────────────────────────────────────────────

const takeInWork = () => {
  if (!item.value) return
  feedbackStore.assignTo(item.value.id, 'emp-current', 'Сотрудник МПРЭТН')
  toastStore.show({ type: 'success', title: t('feedback.takenInWork') })
}

const resolveAndSend = () => {
  if (!item.value || !responseText.value.trim()) return
  isSubmitting.value = true
  setTimeout(() => {
    feedbackStore.addResponse(item.value!.id, responseText.value, 'Сотрудник МПРЭТН')
    feedbackStore.updateStatus(
      item.value!.id,
      FeedbackStatus.RESOLVED as any,
      'Сотрудник МПРЭТН',
      'Обращение решено, ответ отправлен гражданину',
    )
    toastStore.show({ type: 'success', title: 'Ответ отправлен, обращение закрыто' })
    isSubmitting.value = false
  }, 300)
}

const requestClarification = () => {
  if (!item.value || !clarificationText.value.trim()) return
  isSubmitting.value = true
  setTimeout(() => {
    feedbackStore.updateStatus(
      item.value!.id,
      FeedbackStatus.UNDER_REVIEW as any,
      'Сотрудник МПРЭТН',
      `Запрошено уточнение у гражданина: ${clarificationText.value}`,
    )
    clarificationText.value = ''
    toastStore.show({ type: 'success', title: 'Запрос уточнения отправлен' })
    isSubmitting.value = false
  }, 300)
}

const reopenFeedback = () => {
  if (!item.value) return
  feedbackStore.updateStatus(
    item.value.id,
    FeedbackStatus.IN_PROGRESS as any,
    'Сотрудник МПРЭТН',
    'Обращение переоткрыто',
  )
  toastStore.show({ type: 'success', title: 'Обращение переоткрыто' })
}

const openRedirectDialog = () => {
  redirectToDepartment.value = ''
  redirectComment.value = ''
  redirectDialogOpen.value = true
}

const confirmRedirect = () => {
  if (!item.value || !redirectToDepartment.value) return
  const dept = departments.find(d => d.value === redirectToDepartment.value)?.label || redirectToDepartment.value
  const comment = `Перенаправлено в: ${dept}${redirectComment.value ? ` · Комментарий: ${redirectComment.value}` : ''}`
  feedbackStore.updateStatus(
    item.value.id,
    FeedbackStatus.UNDER_REVIEW as any,
    'Сотрудник МПРЭТН',
    comment,
  )
  feedbackStore.addComment(item.value.id, {
    author: 'Сотрудник МПРЭТН',
    authorRole: 'employee',
    text: comment,
    internal: true,
  })
  redirectDialogOpen.value = false
  toastStore.show({ type: 'success', title: 'Обращение перенаправлено' })
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
</script>

<template>
  <DashboardLayout role="employee" :roleTitle="roleTitle" :menuItems="menuItems">
    <div v-if="!item" class="text-center py-12">
      <p class="text-gray-500">{{ $t('feedback.notFound') }}</p>
      <AppButton :label="$t('feedback.backToList')" variant="outline" class="mt-4" @click="router.push('/employee/feedback')" />
    </div>

    <div v-else class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center gap-3">
          <button @click="router.push('/employee/feedback')" class="text-gray-400 hover:text-gray-600" aria-label="Назад">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 class="text-xl font-bold text-gray-800 font-mono">{{ item.ticketNumber }}</h1>
            <p class="text-sm text-gray-500">Подано: {{ formatDate(item.createdAt) }}</p>
          </div>
        </div>
        <span :class="[statusColor(item.status), 'px-4 py-2 rounded-full text-sm font-medium']">
          {{ statusLabel(item.status) }}
        </span>
      </div>

      <!-- 2-column layout: left = data (read-only), right = actions -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <!-- ═════════════════════════════════════════════════════════ -->
        <!-- LEFT: Данные обращения (только чтение)                     -->
        <!-- ═════════════════════════════════════════════════════════ -->
        <div class="lg:col-span-2 space-y-6">

          <!-- 1. Заявитель -->
          <AppCard padding="lg">
            <h3 class="text-lg font-semibold text-gray-700 mb-4">{{ $t('feedback.applicantInfo') }}</h3>
            <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div><dt class="text-xs text-gray-400">{{ $t('feedback.fields.fullName') }}</dt><dd class="font-medium text-gray-800">{{ item.fullName }}</dd></div>
              <div><dt class="text-xs text-gray-400">{{ $t('feedback.fields.phone') }}</dt><dd class="text-gray-700">{{ item.phone }}</dd></div>
              <div><dt class="text-xs text-gray-400">{{ $t('feedback.fields.email') }}</dt><dd class="text-gray-700">{{ item.email }}</dd></div>
              <div v-if="item.region"><dt class="text-xs text-gray-400">{{ $t('feedback.table.region') }}</dt><dd class="text-gray-700">{{ item.region }}</dd></div>
            </dl>
          </AppCard>

          <!-- 2. Содержание обращения -->
          <AppCard padding="lg">
            <h3 class="text-lg font-semibold text-gray-700 mb-4">{{ $t('feedback.requestContent') }}</h3>

            <div class="mb-4">
              <p class="text-xs text-gray-400 mb-1">{{ $t('feedback.fields.category') }}</p>
              <span class="inline-block bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full">{{ categoryLabel(item.category) }}</span>
            </div>

            <div class="mb-4">
              <p class="text-xs text-gray-400 mb-1">{{ $t('feedback.fields.subject') }}</p>
              <p class="text-sm font-medium text-gray-800">{{ item.subject }}</p>
            </div>

            <div class="mb-4">
              <p class="text-xs text-gray-400 mb-1">{{ $t('feedback.fields.message') }}</p>
              <p class="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg p-4">{{ item.message }}</p>
            </div>

            <div v-if="item.attachments && item.attachments.length">
              <p class="text-xs text-gray-400 mb-2">{{ $t('feedback.attachments') }} ({{ item.attachments.length }})</p>
              <div class="space-y-1">
                <div v-for="att in item.attachments" :key="att.id" class="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                  <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                  <span class="text-sm text-gray-600">{{ att.fileName }}</span>
                </div>
              </div>
            </div>

            <div v-if="item.latitude && item.longitude" class="mt-4">
              <p class="text-xs text-gray-400 mb-2">{{ $t('feedback.location') }}</p>
              <div class="bg-green-50 rounded-lg p-3">
                <p class="text-sm text-green-800">
                  <svg class="w-4 h-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  {{ item.latitude.toFixed(6) }}, {{ item.longitude.toFixed(6) }}
                </p>
                <p v-if="item.locationAddress" class="text-xs text-green-600 mt-1 ml-5">{{ item.locationAddress }}</p>
              </div>
            </div>
          </AppCard>

          <!-- 3. Ответ гражданину (historical, показываем только если ответ есть) -->
          <AppCard v-if="item.response && item.respondedAt" padding="lg">
            <h3 class="text-lg font-semibold text-gray-700 mb-4">{{ $t('feedback.responseToApplicant') }}</h3>
            <div class="bg-green-50 rounded-lg p-4">
              <p class="text-sm text-green-800 whitespace-pre-wrap">{{ item.response }}</p>
              <p class="text-xs text-green-600 mt-2">{{ $t('feedback.respondedAt') }}: {{ formatDate(item.respondedAt) }}</p>
            </div>
          </AppCard>

          <!-- 4. История изменений (timeline) -->
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
                  <span :class="[statusColor(entry.status), 'text-xs px-2 py-0.5 rounded-full font-medium']">{{ statusLabel(entry.status) }}</span>
                  <p class="text-xs text-gray-400 mt-1">{{ formatDateTime(entry.timestamp) }} · {{ entry.author }}</p>
                  <p v-if="entry.comment" class="text-xs text-gray-600 mt-0.5 italic">{{ entry.comment }}</p>
                </div>
              </div>
            </div>
          </AppCard>

          <!-- 5. Внутренние комментарии (для коллег) -->
          <AppCard padding="lg">
            <h3 class="text-lg font-semibold text-gray-700 mb-4">
              {{ $t('feedback.internalComments') }}
              <span class="text-xs font-normal text-gray-400 ml-2">{{ $t('feedback.onlyForEmployees') }}</span>
            </h3>
            <div v-if="item.comments && item.comments.length" class="space-y-3 mb-4">
              <div v-for="comment in item.comments" :key="comment.id" :class="['rounded-lg p-3', comment.internal ? 'bg-amber-50 border border-amber-100' : 'bg-gray-50']">
                <div class="flex items-center justify-between mb-1">
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-medium text-gray-700">{{ comment.author }}</span>
                    <span v-if="comment.internal" class="text-[10px] bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded">{{ $t('feedback.internal') }}</span>
                  </div>
                  <span class="text-xs text-gray-400">{{ formatDateTime(comment.timestamp) }}</span>
                </div>
                <p class="text-sm text-gray-600">{{ comment.text }}</p>
              </div>
            </div>
            <p v-else class="text-sm text-gray-400 mb-4">{{ $t('feedback.noComments') }}</p>
            <div class="flex gap-2">
              <textarea v-model="internalComment" :placeholder="$t('feedback.placeholders.internalComment')" rows="2" class="flex-1 px-4 py-2 border border-[#e2e8f0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0e888d]/30 focus:border-[#0e888d] resize-none" />
              <AppButton :label="$t('feedback.addComment')" variant="outline" :disabled="!internalComment.trim()" @click="addInternalComment" />
            </div>
          </AppCard>
        </div>

        <!-- ═════════════════════════════════════════════════════════ -->
        <!-- RIGHT: Action Panel — меняется по статусу                  -->
        <!-- ═════════════════════════════════════════════════════════ -->
        <div class="space-y-6">

          <!-- Главная карточка действий -->
          <AppCard padding="lg">
            <h3 class="text-lg font-semibold text-gray-800 mb-1">Что делать сейчас</h3>
            <p class="text-xs text-gray-500 mb-4">Действия подобраны по текущему статусу обращения</p>

            <!-- Шаг 1: обращение новое, никто не взял — взять в работу ИЛИ перенаправить -->
            <template v-if="actionMode === 'take_or_redirect'">
              <div class="space-y-3">
                <button
                  @click="takeInWork"
                  class="w-full flex items-center justify-center gap-2 px-5 py-3 bg-[#0e888d] hover:bg-[#0c7377] text-white font-semibold rounded-xl shadow-sm transition-all"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                  Взять в работу
                </button>
                <div class="relative flex items-center py-1">
                  <div class="flex-1 border-t border-gray-200"></div>
                  <span class="px-3 text-xs text-gray-400 uppercase">или</span>
                  <div class="flex-1 border-t border-gray-200"></div>
                </div>
                <button
                  @click="openRedirectDialog"
                  class="w-full flex items-center justify-center gap-2 px-5 py-3 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-all"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  Перенаправить в другой отдел
                </button>
              </div>
              <p class="text-xs text-gray-500 mt-4 bg-blue-50 rounded-lg p-3">
                💡 Пока обращение не в работе, отвечать нельзя. Возьмите в работу или перенаправьте в компетентный орган.
              </p>
            </template>

            <!-- Шаг 2: обращение в работе — ответить и закрыть ИЛИ запросить уточнение -->
            <template v-else-if="actionMode === 'respond'">
              <div class="space-y-4">
                <div>
                  <label class="text-xs font-medium text-gray-600 mb-1.5 block">Ответ гражданину</label>
                  <textarea
                    v-model="responseText"
                    rows="6"
                    placeholder="Напишите ответ, который получит гражданин..."
                    class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0e888d]/30 focus:border-[#0e888d]"
                  />
                </div>
                <button
                  @click="resolveAndSend"
                  :disabled="!responseText.trim() || isSubmitting"
                  class="w-full flex items-center justify-center gap-2 px-5 py-3 bg-[#22C55E] hover:bg-[#16A34A] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-sm transition-all"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  Отправить ответ и закрыть
                </button>
                <div class="relative flex items-center py-1">
                  <div class="flex-1 border-t border-gray-200"></div>
                  <span class="px-3 text-xs text-gray-400 uppercase">или</span>
                  <div class="flex-1 border-t border-gray-200"></div>
                </div>
                <div>
                  <label class="text-xs font-medium text-gray-600 mb-1.5 block">Запросить уточнение у гражданина</label>
                  <textarea
                    v-model="clarificationText"
                    rows="2"
                    placeholder="Какая информация нужна от гражданина?"
                    class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0e888d]/30 focus:border-[#0e888d]"
                  />
                  <button
                    @click="requestClarification"
                    :disabled="!clarificationText.trim() || isSubmitting"
                    class="w-full mt-2 px-4 py-2 border-2 border-amber-300 hover:bg-amber-50 text-amber-800 font-medium rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Запросить уточнение
                  </button>
                </div>
              </div>
            </template>

            <!-- Шаг 3: ожидаем уточнения от гражданина -->
            <template v-else-if="actionMode === 'clarification'">
              <div class="bg-amber-50 rounded-lg p-4 mb-3">
                <p class="text-sm font-medium text-amber-900">⏳ Ожидаем уточнения от гражданина</p>
                <p class="text-xs text-amber-700 mt-1">Обращение было возвращено. Гражданин должен дополнить информацию.</p>
              </div>
              <button
                @click="feedbackStore.updateStatus(item.id, FeedbackStatus.IN_PROGRESS as any, 'Сотрудник МПРЭТН', 'Возобновлено рассмотрение')"
                class="w-full px-5 py-3 bg-[#0e888d] hover:bg-[#0c7377] text-white font-semibold rounded-xl shadow-sm"
              >
                Продолжить рассмотрение
              </button>
            </template>

            <!-- Шаг 4: закрытое обращение -->
            <template v-else-if="actionMode === 'closed'">
              <div :class="['rounded-lg p-4 mb-3', item.status === 'resolved' ? 'bg-green-50' : 'bg-red-50']">
                <p :class="['text-sm font-medium', item.status === 'resolved' ? 'text-green-900' : 'text-red-900']">
                  {{ item.status === 'resolved' ? '✓ Обращение решено' : '✗ Обращение отклонено' }}
                </p>
                <p v-if="item.respondedAt" :class="['text-xs mt-1', item.status === 'resolved' ? 'text-green-700' : 'text-red-700']">
                  {{ formatDate(item.respondedAt) }}
                </p>
              </div>
              <button
                @click="reopenFeedback"
                class="w-full px-4 py-2 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg text-sm"
              >
                Переоткрыть обращение
              </button>
            </template>
          </AppCard>

          <!-- SLA / сроки -->
          <AppCard padding="md">
            <p class="text-xs text-gray-400 uppercase tracking-wider mb-2">Срок ответа по закону</p>
            <p class="text-sm text-gray-800 font-medium">30 дней с момента подачи</p>
            <div class="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
              <div :class="[
                'w-2.5 h-2.5 rounded-full flex-shrink-0',
                slaInfo.color === 'red' ? 'bg-red-500' :
                slaInfo.color === 'yellow' ? 'bg-yellow-500' : 'bg-green-500'
              ]"></div>
              <span class="text-sm text-gray-700">
                Прошло: <span class="font-medium">{{ slaInfo.days }} дн.</span>
              </span>
            </div>
            <p v-if="item.status !== 'resolved' && item.status !== 'rejected'" class="text-xs text-gray-500 mt-1 ml-4">
              Осталось: {{ slaInfo.remaining }} дн.
            </p>
          </AppCard>

          <!-- Исполнитель -->
          <AppCard v-if="item.assignedName" padding="md">
            <p class="text-xs text-gray-400 uppercase tracking-wider mb-2">{{ $t('feedback.assignedTo') }}</p>
            <p class="text-sm font-medium text-gray-800">{{ item.assignedName }}</p>
          </AppCard>
        </div>
      </div>

      <!-- ═════════════════════════════════════════════════════════ -->
      <!-- Modal: перенаправить в отдел                                -->
      <!-- ═════════════════════════════════════════════════════════ -->
      <div v-if="redirectDialogOpen" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="redirectDialogOpen = false">
        <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
          <div class="flex items-center justify-between mb-5">
            <h3 class="text-lg font-bold text-gray-900">Перенаправить обращение</h3>
            <button @click="redirectDialogOpen = false" class="text-gray-400 hover:text-gray-600" aria-label="Закрыть">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div class="space-y-4">
            <div>
              <label class="text-sm font-medium text-gray-700 mb-2 block">Куда перенаправить</label>
              <div class="space-y-2">
                <label
                  v-for="dept in departments"
                  :key="dept.value"
                  :class="[
                    'flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all',
                    redirectToDepartment === dept.value
                      ? 'border-[#0e888d] bg-[#0e888d]/5'
                      : 'border-gray-200 hover:border-gray-300'
                  ]"
                >
                  <input type="radio" v-model="redirectToDepartment" :value="dept.value" class="mt-1" />
                  <span class="text-sm text-gray-800">{{ dept.label }}</span>
                </label>
              </div>
            </div>

            <div>
              <label class="text-sm font-medium text-gray-700 mb-2 block">Комментарий (опционально)</label>
              <textarea
                v-model="redirectComment"
                rows="3"
                placeholder="Почему перенаправляете? Какие действия ожидаете?"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0e888d]/30 focus:border-[#0e888d]"
              />
            </div>
          </div>

          <div class="flex gap-3 mt-6">
            <button
              @click="redirectDialogOpen = false"
              class="flex-1 px-4 py-2.5 border-2 border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-lg"
            >
              Отмена
            </button>
            <button
              @click="confirmRedirect"
              :disabled="!redirectToDepartment"
              class="flex-1 px-4 py-2.5 bg-[#0e888d] hover:bg-[#0c7377] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg"
            >
              Перенаправить
            </button>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>
