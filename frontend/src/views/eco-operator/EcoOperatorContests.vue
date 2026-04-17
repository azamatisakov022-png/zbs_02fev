<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import SkeletonLoader from '../../components/dashboard/SkeletonLoader.vue'
import EmptyState from '../../components/dashboard/EmptyState.vue'
import { AppButton } from '../../components/ui'
import { useEcoOperatorMenu } from '../../composables/useRoleMenu'
import { contestStore, type Contest } from '../../stores/contests'
import { ContestStatus } from '../../constants/statuses'
import { toastStore } from '../../stores/toast'

const { roleTitle, menuItems } = useEcoOperatorMenu()
const { t, locale } = useI18n()
const router = useRouter()

const isLoading = ref(true)
const activeTab = ref<'all' | 'published' | 'draft' | 'closed'>('all')

onMounted(async () => {
  await contestStore.fetchAll()
  isLoading.value = false
})

const filtered = computed<Contest[]>(() => {
  const list = contestStore.state.contests
  if (activeTab.value === 'all') return list
  if (activeTab.value === 'published') return list.filter(c => c.status === ContestStatus.PUBLISHED)
  if (activeTab.value === 'draft') return list.filter(c => c.status === ContestStatus.DRAFT)
  return list.filter(c => c.status === ContestStatus.CLOSED)
})

const counts = computed(() => ({
  all: contestStore.state.contests.length,
  published: contestStore.state.contests.filter(c => c.status === ContestStatus.PUBLISHED).length,
  draft: contestStore.state.contests.filter(c => c.status === ContestStatus.DRAFT).length,
  closed: contestStore.state.contests.filter(c => c.status === ContestStatus.CLOSED).length,
}))

const formatDate = (iso: string): string => {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString(
    locale.value === 'ru' ? 'ru-RU' : locale.value === 'ky' ? 'ky-KG' : 'en-US',
    { day: '2-digit', month: '2-digit', year: 'numeric' }
  )
}

const formatGrant = (a?: number, c?: string) =>
  a ? `${a.toLocaleString('ru-RU')} ${c === 'KGS' ? 'сом' : (c || '')}`.trim() : '—'

const statusBadge = (status: string): string => {
  const map: Record<string, string> = {
    [ContestStatus.DRAFT]: 'bg-gray-100 text-gray-700',
    [ContestStatus.PUBLISHED]: 'bg-green-100 text-green-700',
    [ContestStatus.CLOSED]: 'bg-red-100 text-red-700',
  }
  return map[status] || 'bg-gray-100 text-gray-700'
}

const statusLabel = (status: string): string =>
  t('contests.statuses.' + (status === 'draft' ? 'draft' : status === 'published' ? 'published' : 'closed'))

const goEdit = (id: number) => router.push(`/eco-operator/contests/${id}/edit`)
const goCreate = () => router.push('/eco-operator/contests/new')
const goApplications = () => router.push('/eco-operator/contests/applications')

const onPublish = async (c: Contest) => {
  if (!confirm(t('contests.employee.confirmPublish'))) return
  try {
    await contestStore.publish(c.id)
    toastStore.show({ type: 'success', title: t('contests.employee.publishSuccess') })
  } catch (e: any) {
    toastStore.show({ type: 'error', title: t('contests.employee.saveFailed'),
      message: e?.response?.data?.message || '' })
  }
}

const onClose = async (c: Contest) => {
  if (!confirm(t('contests.employee.confirmClose'))) return
  try {
    await contestStore.close(c.id)
    toastStore.show({ type: 'success', title: t('contests.employee.closeSuccess') })
  } catch (e: any) {
    toastStore.show({ type: 'error', title: t('contests.employee.saveFailed'),
      message: e?.response?.data?.message || '' })
  }
}

const onDelete = async (c: Contest) => {
  if (!confirm(t('contests.employee.confirmDelete'))) return
  try {
    await contestStore.remove(c.id)
    toastStore.show({ type: 'success', title: t('contests.employee.deleteSuccess') })
  } catch (e: any) {
    toastStore.show({ type: 'error', title: t('contests.employee.saveFailed'),
      message: e?.response?.data?.message || '' })
  }
}
</script>

<template>
  <DashboardLayout :roleTitle="roleTitle" :menuItems="menuItems">
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-xl lg:text-2xl font-bold text-gray-800">{{ $t('contests.employee.contestsTitle') }}</h1>
          <p class="text-sm text-gray-500 mt-1">{{ $t('contests.employee.contestsDescription') }}</p>
        </div>
        <div class="flex flex-wrap gap-3">
          <AppButton :label="$t('contests.employee.applicationsTab')"
                     variant="outline" @click="goApplications" />
          <AppButton :label="$t('contests.employee.newContest')"
                     variant="primary" @click="goCreate" />
        </div>
      </div>

      <!-- Tabs -->
      <div class="bg-white rounded-xl border border-gray-100 p-2 inline-flex gap-1 flex-wrap">
        <button v-for="tab in [
                  { id: 'all', label: $t('contests.employee.applicationsCount') === 'Заявок' ? 'Все' : 'All', count: counts.all },
                  { id: 'published', label: $t('contests.employee.publishedTab'), count: counts.published },
                  { id: 'draft', label: $t('contests.employee.draftsTab'), count: counts.draft },
                  { id: 'closed', label: $t('contests.employee.closedTab'), count: counts.closed },
                ]" :key="tab.id"
                @click="activeTab = tab.id as any"
                :class="['px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  activeTab === tab.id ? 'bg-[#2D8B4E] text-white' : 'text-gray-600 hover:bg-gray-50']">
          {{ tab.label }} ({{ tab.count }})
        </button>
      </div>

      <!-- Loading -->
      <SkeletonLoader v-if="isLoading" :rows="4" />

      <!-- Empty -->
      <EmptyState v-else-if="filtered.length === 0"
                  :title="$t('contests.employee.noContests')"
                  :subtitle="$t('contests.employee.noContestsHint')" />

      <!-- List -->
      <div v-else class="space-y-4">
        <div v-for="c in filtered" :key="c.id"
             class="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
          <div class="flex flex-col lg:flex-row gap-4 lg:items-start lg:justify-between">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-3 mb-2">
                <h3 class="text-lg font-semibold text-gray-800">{{ c.title }}</h3>
                <span :class="['text-xs px-2 py-1 rounded-full font-medium', statusBadge(c.status)]">
                  {{ statusLabel(c.status) }}
                </span>
              </div>
              <p class="text-sm text-gray-600 line-clamp-2 mb-3">{{ c.description }}</p>
              <div class="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500">
                <span>📅 {{ $t('contests.list.deadline') }}: <span class="font-medium text-gray-700">{{ formatDate(c.deadline) }}</span></span>
                <span v-if="c.grantAmount">💰 {{ $t('contests.list.grant') }}: <span class="font-medium text-gray-700">{{ formatGrant(c.grantAmount, c.grantCurrency) }}</span></span>
                <span>📥 {{ $t('contests.employee.applicationsCount') }}: <span class="font-medium text-gray-700">{{ c.applicationsCount ?? 0 }}</span></span>
              </div>
            </div>

            <div class="flex flex-wrap gap-2 lg:flex-col lg:items-end">
              <button @click="goEdit(c.id)"
                      class="text-sm font-medium text-[#2D8B4E] hover:text-[#236B3E]">
                {{ $t('contests.employee.editContest') }}
              </button>
              <button v-if="c.status === ContestStatus.DRAFT" @click="onPublish(c)"
                      class="text-sm font-medium text-blue-600 hover:text-blue-800">
                {{ $t('contests.employee.publishContest') }}
              </button>
              <button v-if="c.status === ContestStatus.PUBLISHED" @click="onClose(c)"
                      class="text-sm font-medium text-orange-600 hover:text-orange-800">
                {{ $t('contests.employee.closeContest') }}
              </button>
              <button v-if="c.status === ContestStatus.DRAFT" @click="onDelete(c)"
                      class="text-sm font-medium text-red-500 hover:text-red-700">
                {{ $t('contests.employee.deleteContest') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>
