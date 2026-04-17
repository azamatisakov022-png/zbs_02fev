<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import SkeletonLoader from '../../components/dashboard/SkeletonLoader.vue'
import EmptyState from '../../components/dashboard/EmptyState.vue'
import AppInput from '../../components/ui/AppInput.vue'
import SimpleSelect from '../../components/ui/SimpleSelect.vue'
import { useEcoOperatorMenu } from '../../composables/useRoleMenu'
import { contestStore } from '../../stores/contests'
import { ContestApplicationStatus } from '../../constants/statuses'

const { roleTitle, menuItems } = useEcoOperatorMenu()
const { t, locale } = useI18n()
const router = useRouter()

const isLoading = ref(true)
const filterContest = ref('')
const filterStatus = ref('')
const searchQuery = ref('')

onMounted(async () => {
  await Promise.all([
    contestStore.fetchAll(),
    contestStore.fetchApplications(),
  ])
  isLoading.value = false
})

const reload = async () => {
  await contestStore.fetchApplications({
    contestId: filterContest.value ? Number(filterContest.value) : undefined,
    status: filterStatus.value || undefined,
    search: searchQuery.value || undefined,
  })
}

const contestOptions = computed(() => [
  { value: '', label: t('contests.employee.allContests') },
  ...contestStore.state.contests.map(c => ({ value: String(c.id), label: c.title })),
])

const statusOptions = computed(() => [
  { value: '', label: t('contests.employee.allStatuses') },
  { value: ContestApplicationStatus.NEW, label: t('contests.statuses.new') },
  { value: ContestApplicationStatus.UNDER_REVIEW, label: t('contests.statuses.underReview') },
  { value: ContestApplicationStatus.APPROVED, label: t('contests.statuses.approved') },
  { value: ContestApplicationStatus.REJECTED, label: t('contests.statuses.rejected') },
])

const applications = computed(() => {
  let list = contestStore.state.applications
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(a =>
      a.number.toLowerCase().includes(q)
      || a.fullName.toLowerCase().includes(q)
      || a.email.toLowerCase().includes(q)
      || a.phone.toLowerCase().includes(q)
    )
  }
  return list
})

const stats = computed(() => {
  const items = contestStore.state.applications
  return {
    total: items.length,
    new: items.filter(a => a.status === ContestApplicationStatus.NEW).length,
    underReview: items.filter(a => a.status === ContestApplicationStatus.UNDER_REVIEW).length,
    approved: items.filter(a => a.status === ContestApplicationStatus.APPROVED).length,
    rejected: items.filter(a => a.status === ContestApplicationStatus.REJECTED).length,
  }
})

const formatDate = (iso: string): string => {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString(
    locale.value === 'ru' ? 'ru-RU' : locale.value === 'ky' ? 'ky-KG' : 'en-US',
    { day: '2-digit', month: '2-digit', year: 'numeric' }
  )
}

const statusBadge = (status: string): string => {
  const map: Record<string, string> = {
    [ContestApplicationStatus.NEW]: 'bg-blue-100 text-blue-800',
    [ContestApplicationStatus.UNDER_REVIEW]: 'bg-yellow-100 text-yellow-800',
    [ContestApplicationStatus.APPROVED]: 'bg-green-100 text-green-800',
    [ContestApplicationStatus.REJECTED]: 'bg-red-100 text-red-800',
  }
  return map[status] || 'bg-gray-100 text-gray-800'
}

const statusLabel = (status: string): string => {
  const map: Record<string, string> = {
    [ContestApplicationStatus.NEW]: 'contests.statuses.new',
    [ContestApplicationStatus.UNDER_REVIEW]: 'contests.statuses.underReview',
    [ContestApplicationStatus.APPROVED]: 'contests.statuses.approved',
    [ContestApplicationStatus.REJECTED]: 'contests.statuses.rejected',
  }
  return map[status] ? t(map[status]) : status
}

const openDetail = (id: number) => router.push(`/eco-operator/contests/applications/${id}`)
</script>

<template>
  <DashboardLayout :roleTitle="roleTitle" :menuItems="menuItems">
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-xl lg:text-2xl font-bold text-gray-800">{{ $t('contests.employee.applicationsTitle') }}</h1>
          <p class="text-sm text-gray-500 mt-1">{{ $t('contests.employee.applicationsDescription') }}</p>
        </div>
        <button @click="router.push('/eco-operator/contests')"
                class="text-sm text-[#2D8B4E] hover:text-[#236B3E] font-medium">
          ← {{ $t('contests.employee.contestsTitle') }}
        </button>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div class="bg-white rounded-xl p-4 border border-gray-100">
          <p class="text-sm text-gray-500">{{ $t('contests.employee.stats.total') }}</p>
          <p class="text-2xl font-bold text-gray-800">{{ stats.total }}</p>
        </div>
        <div class="bg-white rounded-xl p-4 border border-blue-100">
          <p class="text-sm text-blue-600">{{ $t('contests.employee.stats.new') }}</p>
          <p class="text-2xl font-bold text-blue-700">{{ stats.new }}</p>
        </div>
        <div class="bg-white rounded-xl p-4 border border-yellow-100">
          <p class="text-sm text-yellow-600">{{ $t('contests.employee.stats.underReview') }}</p>
          <p class="text-2xl font-bold text-yellow-700">{{ stats.underReview }}</p>
        </div>
        <div class="bg-white rounded-xl p-4 border border-green-100">
          <p class="text-sm text-green-600">{{ $t('contests.employee.stats.approved') }}</p>
          <p class="text-2xl font-bold text-green-700">{{ stats.approved }}</p>
        </div>
        <div class="bg-white rounded-xl p-4 border border-red-100">
          <p class="text-sm text-red-600">{{ $t('contests.employee.stats.rejected') }}</p>
          <p class="text-2xl font-bold text-red-700">{{ stats.rejected }}</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-xl p-4 border border-gray-100">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <SimpleSelect v-model="filterContest" :options="contestOptions" compact @update:modelValue="reload" />
          <SimpleSelect v-model="filterStatus" :options="statusOptions" compact @update:modelValue="reload" />
          <AppInput v-model="searchQuery" :placeholder="$t('contests.employee.searchPlaceholder')" />
        </div>
      </div>

      <!-- Loading -->
      <SkeletonLoader v-if="isLoading" :rows="5" />

      <!-- Empty -->
      <EmptyState v-else-if="applications.length === 0"
                  :title="$t('contests.employee.noApplications')"
                  :subtitle="$t('contests.employee.noApplicationsHint')" />

      <!-- Table -->
      <div v-else class="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50 text-left">
                <th class="px-4 py-3 font-medium text-gray-500">{{ $t('contests.employee.tableNumber') }}</th>
                <th class="px-4 py-3 font-medium text-gray-500">{{ $t('contests.employee.tableContest') }}</th>
                <th class="px-4 py-3 font-medium text-gray-500">{{ $t('contests.employee.tableApplicant') }}</th>
                <th class="px-4 py-3 font-medium text-gray-500">{{ $t('contests.employee.tablePhone') }}</th>
                <th class="px-4 py-3 font-medium text-gray-500">{{ $t('contests.employee.tableDate') }}</th>
                <th class="px-4 py-3 font-medium text-gray-500">{{ $t('contests.employee.tableStatus') }}</th>
                <th class="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="a in applications" :key="a.id"
                  class="hover:bg-gray-50 cursor-pointer transition-colors"
                  @click="openDetail(a.id)">
                <td class="px-4 py-3 font-mono text-[#2D8B4E] font-medium whitespace-nowrap">{{ a.number }}</td>
                <td class="px-4 py-3 text-gray-700 max-w-[200px] truncate">{{ a.contestTitle }}</td>
                <td class="px-4 py-3 text-gray-800">{{ a.fullName }}</td>
                <td class="px-4 py-3 text-gray-600 whitespace-nowrap">{{ a.phone }}</td>
                <td class="px-4 py-3 text-gray-600 whitespace-nowrap">{{ formatDate(a.createdAt) }}</td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <span :class="[statusBadge(a.status), 'text-xs px-2 py-1 rounded-full font-medium']">
                    {{ statusLabel(a.status) }}
                  </span>
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
