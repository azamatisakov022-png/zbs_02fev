<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import SkeletonLoader from '../../components/dashboard/SkeletonLoader.vue'
import EmptyState from '../../components/dashboard/EmptyState.vue'
import { AppButton, AppBadge } from '../../components/ui'
import SimpleSelect from '../../components/ui/SimpleSelect.vue'
import AppInput from '../../components/ui/AppInput.vue'
import { useEmployeeMenu } from '../../composables/useRoleMenu'
import { feedbackStore, type FeedbackItem } from '../../stores/feedback'
import { FeedbackStatus, FeedbackCategory, statusI18nKey } from '../../constants/statuses'
import { toastStore } from '../../stores/toast'

const { roleTitle, menuItems } = useEmployeeMenu()
const { t } = useI18n()
const router = useRouter()

const isLoading = ref(true)
onMounted(() => {
  feedbackStore.fetchAll()
  setTimeout(() => { isLoading.value = false }, 500)
})

// Filters
const filterStatus = ref('')
const filterCategory = ref('')
const searchQuery = ref('')
const filterDateFrom = ref('')
const filterDateTo = ref('')

const statusOptions = computed(() => [
  { value: '', label: t('feedback.allStatuses') },
  { value: FeedbackStatus.NEW, label: t('status.new') },
  { value: FeedbackStatus.IN_PROGRESS, label: t('status.inProgress') },
  { value: FeedbackStatus.UNDER_REVIEW, label: t('status.underReview') },
  { value: FeedbackStatus.RESOLVED, label: t('status.resolved') },
  { value: FeedbackStatus.REJECTED, label: t('status.rejected') },
])

const categoryOptions = computed(() => [
  { value: '', label: t('feedback.allCategories') },
  { value: FeedbackCategory.COMPLAINT, label: t('feedback.categories.complaint') },
  { value: FeedbackCategory.SUGGESTION, label: t('feedback.categories.suggestion') },
  { value: FeedbackCategory.INFO_REQUEST, label: t('feedback.categories.infoRequest') },
  { value: FeedbackCategory.VIOLATION_REPORT, label: t('feedback.categories.violationReport') },
])

const filteredItems = computed(() => {
  let result = [...feedbackStore.state.items]

  if (filterStatus.value) {
    result = result.filter(i => i.status === filterStatus.value)
  }
  if (filterCategory.value) {
    result = result.filter(i => i.category === filterCategory.value)
  }
  if (searchQuery.value) {
    const s = searchQuery.value.toLowerCase()
    result = result.filter(i =>
      i.ticketNumber.toLowerCase().includes(s) ||
      i.fullName.toLowerCase().includes(s) ||
      i.subject.toLowerCase().includes(s)
    )
  }
  if (filterDateFrom.value) {
    result = result.filter(i => i.createdAt >= filterDateFrom.value)
  }
  if (filterDateTo.value) {
    result = result.filter(i => i.createdAt <= filterDateTo.value)
  }

  return result
})

// Stats
const stats = computed(() => ({
  total: feedbackStore.state.items.length,
  new: feedbackStore.state.items.filter(i => i.status === FeedbackStatus.NEW).length,
  inProgress: feedbackStore.state.items.filter(i => i.status === FeedbackStatus.IN_PROGRESS).length,
  resolved: feedbackStore.state.items.filter(i => i.status === FeedbackStatus.RESOLVED).length,
}))

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

const categoryLabel = (cat: string): string => {
  const map: Record<string, string> = {
    complaint: 'feedback.categories.complaint',
    suggestion: 'feedback.categories.suggestion',
    info_request: 'feedback.categories.infoRequest',
    violation_report: 'feedback.categories.violationReport',
  }
  return map[cat] ? t(map[cat]) : cat
}

const formatDate = (dateStr: string): string => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const getSlaClass = (item: FeedbackItem): string => {
  const color = feedbackStore.getSlaColor(item.createdAt, item.status)
  if (color === 'red') return 'text-red-600 font-semibold'
  if (color === 'yellow') return 'text-yellow-600 font-medium'
  return 'text-green-600'
}

const getDaysText = (item: FeedbackItem): string => {
  if (item.status === FeedbackStatus.RESOLVED || item.status === FeedbackStatus.REJECTED) return '—'
  const days = feedbackStore.getDaysElapsed(item.createdAt)
  return `${days} ${t('feedback.days')}`
}

const exportExcel = () => {
  toastStore.show({ type: 'info', title: t('feedback.exportStarted') })
}

const openDetail = (id: number) => {
  router.push(`/employee/feedback/${id}`)
}
</script>

<template>
  <DashboardLayout :roleTitle="roleTitle" :menuItems="menuItems">
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-xl lg:text-2xl font-bold text-gray-800">{{ $t('feedback.employeeTitle') }}</h1>
          <p class="text-sm text-gray-500 mt-1">{{ $t('feedback.employeeDescription') }}</p>
        </div>
        <AppButton
          :label="$t('feedback.exportExcel')"
          variant="outline"
          @click="exportExcel"
        />
      </div>

      <!-- Stats cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white rounded-xl p-4 border border-gray-100">
          <p class="text-sm text-gray-500">{{ $t('feedback.stats.total') }}</p>
          <p class="text-2xl font-bold text-gray-800">{{ stats.total }}</p>
        </div>
        <div class="bg-white rounded-xl p-4 border border-blue-100">
          <p class="text-sm text-blue-600">{{ $t('feedback.stats.new') }}</p>
          <p class="text-2xl font-bold text-blue-700">{{ stats.new }}</p>
        </div>
        <div class="bg-white rounded-xl p-4 border border-yellow-100">
          <p class="text-sm text-yellow-600">{{ $t('feedback.stats.inProgress') }}</p>
          <p class="text-2xl font-bold text-yellow-700">{{ stats.inProgress }}</p>
        </div>
        <div class="bg-white rounded-xl p-4 border border-green-100">
          <p class="text-sm text-green-600">{{ $t('feedback.stats.resolved') }}</p>
          <p class="text-2xl font-bold text-green-700">{{ stats.resolved }}</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-xl p-4 border border-gray-100">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <AppInput v-model="searchQuery" :placeholder="$t('feedback.searchPlaceholder')" />
          <SimpleSelect v-model="filterStatus" :options="statusOptions" compact />
          <SimpleSelect v-model="filterCategory" :options="categoryOptions" compact />
          <AppInput v-model="filterDateFrom" type="date" :placeholder="$t('feedback.dateFrom')" />
          <AppInput v-model="filterDateTo" type="date" :placeholder="$t('feedback.dateTo')" />
        </div>
      </div>

      <!-- Loading -->
      <SkeletonLoader v-if="isLoading" :rows="5" />

      <!-- Empty state -->
      <EmptyState
        v-else-if="filteredItems.length === 0"
        :title="$t('feedback.noItems')"
        :subtitle="$t('feedback.noItemsHint')"
      />

      <!-- Table -->
      <div v-else class="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50 text-left">
                <th class="px-4 py-3 font-medium text-gray-500">{{ $t('feedback.table.number') }}</th>
                <th class="px-4 py-3 font-medium text-gray-500">{{ $t('feedback.table.date') }}</th>
                <th class="px-4 py-3 font-medium text-gray-500">{{ $t('feedback.table.category') }}</th>
                <th class="px-4 py-3 font-medium text-gray-500 min-w-[200px]">{{ $t('feedback.table.subject') }}</th>
                <th class="px-4 py-3 font-medium text-gray-500">{{ $t('feedback.table.applicant') }}</th>
                <th class="px-4 py-3 font-medium text-gray-500">{{ $t('feedback.table.region') }}</th>
                <th class="px-4 py-3 font-medium text-gray-500">{{ $t('feedback.table.status') }}</th>
                <th class="px-4 py-3 font-medium text-gray-500">{{ $t('feedback.table.sla') }}</th>
                <th class="px-4 py-3 font-medium text-gray-500"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr
                v-for="item in filteredItems"
                :key="item.id"
                class="hover:bg-gray-50 cursor-pointer transition-colors"
                @click="openDetail(item.id)"
              >
                <td class="px-4 py-3 font-mono text-[#0e888d] font-medium whitespace-nowrap">{{ item.ticketNumber }}</td>
                <td class="px-4 py-3 text-gray-600 whitespace-nowrap">{{ formatDate(item.createdAt) }}</td>
                <td class="px-4 py-3 text-gray-700 whitespace-nowrap">{{ categoryLabel(item.category) }}</td>
                <td class="px-4 py-3 text-gray-800 max-w-[250px] truncate">{{ item.subject }}</td>
                <td class="px-4 py-3 text-gray-600 whitespace-nowrap">{{ item.fullName }}</td>
                <td class="px-4 py-3 text-gray-600 whitespace-nowrap">{{ item.region || '—' }}</td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <span :class="[statusColor(item.status), 'text-xs px-2 py-1 rounded-full font-medium']">
                    {{ statusLabel(item.status) }}
                  </span>
                </td>
                <td class="px-4 py-3 whitespace-nowrap" :class="getSlaClass(item)">
                  {{ getDaysText(item) }}
                </td>
                <td class="px-4 py-3 text-right">
                  <svg class="w-4 h-4 text-gray-400 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>
