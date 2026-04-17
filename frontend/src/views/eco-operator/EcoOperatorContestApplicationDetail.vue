<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import { AppButton } from '../../components/ui'
import AppCard from '../../components/ui/AppCard.vue'
import { useEcoOperatorMenu } from '../../composables/useRoleMenu'
import { contestStore } from '../../stores/contests'
import { ContestApplicationStatus } from '../../constants/statuses'
import { toastStore } from '../../stores/toast'

const { roleTitle, menuItems } = useEcoOperatorMenu()
const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()

const id = computed(() => Number(route.params.id))
const isLoading = ref(true)
const comment = ref('')
const saving = ref(false)

const app = computed(() => contestStore.state.currentApplication)

onMounted(async () => {
  await contestStore.fetchApplicationById(id.value)
  if (app.value?.comment) comment.value = app.value.comment
  isLoading.value = false
})

const formatDate = (iso?: string): string => {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString(
    locale.value === 'ru' ? 'ru-RU' : locale.value === 'ky' ? 'ky-KG' : 'en-US',
    { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }
  )
}

const formatFileSize = (bytes?: number): string => {
  if (!bytes) return ''
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const statusBadge = (status?: string): string => {
  const map: Record<string, string> = {
    [ContestApplicationStatus.NEW]: 'bg-blue-100 text-blue-800',
    [ContestApplicationStatus.UNDER_REVIEW]: 'bg-yellow-100 text-yellow-800',
    [ContestApplicationStatus.APPROVED]: 'bg-green-100 text-green-800',
    [ContestApplicationStatus.REJECTED]: 'bg-red-100 text-red-800',
  }
  return status ? (map[status] || 'bg-gray-100') : 'bg-gray-100'
}

const statusLabel = (status?: string): string => {
  const map: Record<string, string> = {
    [ContestApplicationStatus.NEW]: 'contests.statuses.new',
    [ContestApplicationStatus.UNDER_REVIEW]: 'contests.statuses.underReview',
    [ContestApplicationStatus.APPROVED]: 'contests.statuses.approved',
    [ContestApplicationStatus.REJECTED]: 'contests.statuses.rejected',
  }
  return status && map[status] ? t(map[status]) : (status || '')
}

const isFinal = computed(() =>
  app.value?.status === ContestApplicationStatus.APPROVED
  || app.value?.status === ContestApplicationStatus.REJECTED
)

const downloadDocument = () => {
  if (!app.value) return
  window.open(contestStore.getDocumentDownloadUrl(app.value.id), '_blank')
}

const review = async (status: string) => {
  if (!app.value) return
  if (status === ContestApplicationStatus.REJECTED && !comment.value.trim()) {
    toastStore.show({ type: 'warning', title: t('contests.employee.rejectionRequiresComment') })
    return
  }
  saving.value = true
  try {
    await contestStore.reviewApplication(app.value.id, {
      status: status as any,
      comment: comment.value.trim() || undefined,
    })
    toastStore.show({ type: 'success', title: t('contests.employee.reviewSuccess') })
  } catch (e: any) {
    toastStore.show({ type: 'error', title: t('contests.employee.saveFailed'),
      message: e?.response?.data?.message || '' })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <DashboardLayout :roleTitle="roleTitle" :menuItems="menuItems">
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <button @click="router.push('/eco-operator/contests/applications')"
                class="inline-flex items-center gap-2 text-[#2D8B4E] hover:text-[#236B3E] font-medium mb-3 text-sm">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          {{ $t('contests.employee.applicationsTitle') }}
        </button>
        <h1 class="text-xl lg:text-2xl font-bold text-gray-800">
          {{ $t('contests.employee.applicationDetail') }}
        </h1>
      </div>

      <div v-if="isLoading" class="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-500">
        Загрузка...
      </div>

      <div v-else-if="!app" class="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-500">
        Заявка не найдена
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left: applicant info -->
        <div class="lg:col-span-2 space-y-6">
          <AppCard padding="lg">
            <div class="flex items-start justify-between mb-4">
              <div>
                <p class="text-xs text-gray-500 mb-1">{{ $t('contests.employee.tableNumber') }}</p>
                <p class="text-2xl font-bold text-[#2D8B4E] font-mono">{{ app.number }}</p>
              </div>
              <span :class="[statusBadge(app.status), 'text-xs px-3 py-1 rounded-full font-medium']">
                {{ statusLabel(app.status) }}
              </span>
            </div>
            <p class="text-sm text-gray-500">{{ $t('contests.employee.tableContest') }}</p>
            <p class="font-medium text-gray-800 mb-3">{{ app.contestTitle }}</p>
            <p class="text-sm text-gray-500">{{ $t('contests.employee.tableDate') }}</p>
            <p class="font-medium text-gray-800">{{ formatDate(app.createdAt) }}</p>
          </AppCard>

          <AppCard padding="lg">
            <h3 class="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-100">
              {{ $t('contests.employee.applicantContacts') }}
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p class="text-gray-500">{{ $t('contests.form.lastName') }}</p>
                <p class="font-medium text-gray-800">{{ app.lastName }}</p>
              </div>
              <div>
                <p class="text-gray-500">{{ $t('contests.form.firstName') }}</p>
                <p class="font-medium text-gray-800">{{ app.firstName }}</p>
              </div>
              <div v-if="app.middleName">
                <p class="text-gray-500">{{ $t('contests.form.middleName') }}</p>
                <p class="font-medium text-gray-800">{{ app.middleName }}</p>
              </div>
              <div>
                <p class="text-gray-500">{{ $t('contests.form.phone') }}</p>
                <p class="font-medium text-gray-800">{{ app.phone }}</p>
              </div>
              <div class="sm:col-span-2">
                <p class="text-gray-500">{{ $t('contests.form.email') }}</p>
                <p class="font-medium text-gray-800">{{ app.email }}</p>
              </div>
            </div>
          </AppCard>

          <AppCard padding="lg">
            <h3 class="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-100">
              {{ $t('contests.form.document') }}
            </h3>
            <button @click="downloadDocument"
                    class="inline-flex items-center gap-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl px-5 py-3 transition-colors">
              <svg class="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div class="text-left">
                <p class="font-medium text-gray-800">{{ $t('contests.employee.downloadDocument') }}</p>
                <p class="text-xs text-gray-500">{{ app.documentFileName }} • {{ formatFileSize(app.documentSize) }}</p>
              </div>
            </button>
          </AppCard>
        </div>

        <!-- Right: review actions -->
        <div class="space-y-6">
          <AppCard padding="lg">
            <h3 class="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-100">
              {{ $t('contests.employee.reviewSection') }}
            </h3>

            <div class="mb-4">
              <p class="text-xs text-gray-500 mb-1">{{ $t('contests.employee.currentStatus') }}</p>
              <span :class="[statusBadge(app.status), 'text-xs px-3 py-1 rounded-full font-medium inline-block']">
                {{ statusLabel(app.status) }}
              </span>
            </div>

            <div v-if="app.reviewedBy" class="mb-4 text-sm">
              <p class="text-gray-500">{{ $t('contests.employee.reviewedBy') }}</p>
              <p class="font-medium text-gray-800">{{ app.reviewedBy }}</p>
              <p class="text-xs text-gray-500 mt-1">{{ formatDate(app.reviewedAt) }}</p>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ $t('contests.employee.commentLabel') }}
              </label>
              <textarea v-model="comment" rows="4" :disabled="isFinal"
                        :placeholder="$t('contests.employee.commentPlaceholder')"
                        class="w-full px-4 py-3 border border-[#e2e8f0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2D8B4E]/30 focus:border-[#2D8B4E] resize-y disabled:bg-gray-50 disabled:text-gray-500" />
            </div>

            <div v-if="!isFinal" class="space-y-2">
              <AppButton v-if="app.status === ContestApplicationStatus.NEW"
                         :label="$t('contests.employee.moveToReview')"
                         variant="outline" :loading="saving" class="w-full"
                         @click="review(ContestApplicationStatus.UNDER_REVIEW)" />
              <AppButton :label="$t('contests.employee.approveBtn')"
                         variant="primary" :loading="saving" class="w-full"
                         @click="review(ContestApplicationStatus.APPROVED)" />
              <AppButton :label="$t('contests.employee.rejectBtn')"
                         variant="danger" :loading="saving" class="w-full"
                         @click="review(ContestApplicationStatus.REJECTED)" />
            </div>
            <div v-else class="text-sm text-gray-500 italic">
              Заявка уже рассмотрена и не может быть изменена.
            </div>
          </AppCard>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>
