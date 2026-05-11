<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import SkeletonLoader from '../../components/dashboard/SkeletonLoader.vue'
import StatsCard from '../../components/dashboard/StatsCard.vue'
import { statsIcons } from '../../utils/menuIcons'
import { useEmployeeMenu } from '../../composables/useRoleMenu'
import SectionGuide from '../../components/common/SectionGuide.vue'
import { authStore } from '../../stores/auth'
import { licenseStore } from '../../stores/licenses'
import { feedbackStore } from '../../stores/feedback'
import { landfillStore, getFillPercent, type Landfill } from '../../stores/landfills'

const { t } = useI18n()
const { roleTitle, menuItems } = useEmployeeMenu()

// Имя пользователя берём из authStore (заполняется при логине).
const userName = computed(() => authStore.state.user?.companyName || '-')

// ─── Реальные метрики из stores ───────────────────────────────────

// Заявки в работе: суммируем status counts по «живым» статусам.
const pendingApplicationsCount = computed(() => {
  const counts = licenseStore.state.statusCounts || {}
  return (counts.submitted || 0) + (counts.under_review || 0) + (counts.site_visit_done || 0)
})

// Новые обращения граждан.
const newFeedbackCount = computed(() => feedbackStore.getNewCount())

// Полигоны в критичном заполнении (≥85%).
const criticalLandfillsCount = computed(() =>
  landfillStore.state.landfills.filter(l => getFillPercent(l) >= 85).length,
)

// Лицензии, у которых validUntil в ближайшие 30 дней (и ещё не истёк).
const expiringLicensesCount = computed(() => {
  const now = new Date()
  const in30 = new Date()
  in30.setDate(in30.getDate() + 30)
  return licenseStore.state.adminLicenses.filter(l => {
    if (!l.validUntil) return false
    const until = new Date(l.validUntil)
    return until >= now && until <= in30
  }).length
})

// ─── Stat-карточки ────────────────────────────────────────────────

const stats = computed(() => [
  { title: t('employeeDashboard.statPendingApplications'), value: String(pendingApplicationsCount.value), icon: statsIcons.users, color: 'blue' as const },
  { title: t('employeeDashboard.statNewFeedback'), value: String(newFeedbackCount.value), icon: statsIcons.approved, color: 'green' as const },
  { title: t('employeeDashboard.statCriticalLandfills'), value: String(criticalLandfillsCount.value), icon: statsIcons.capacity, color: 'purple' as const },
  { title: t('employeeDashboard.statExpiringLicenses'), value: String(expiringLicensesCount.value), icon: statsIcons.waste, color: 'orange' as const },
])

// ─── Блок «Требуют внимания» ──────────────────────────────────────

const alerts = computed(() => {
  const list: { text: string; severity: 'red' | 'orange' | 'blue'; route: string; count: number }[] = []
  if (pendingApplicationsCount.value > 0) {
    list.push({ text: t('employeeDashboard.alertPendingApplications'), severity: 'orange', route: '/employee/licenses', count: pendingApplicationsCount.value })
  }
  if (newFeedbackCount.value > 0) {
    list.push({ text: t('employeeDashboard.alertNewFeedback'), severity: 'blue', route: '/employee/feedback', count: newFeedbackCount.value })
  }
  if (criticalLandfillsCount.value > 0) {
    list.push({ text: t('employeeDashboard.alertCriticalLandfills'), severity: 'red', route: '/ministry/landfills', count: criticalLandfillsCount.value })
  }
  if (expiringLicensesCount.value > 0) {
    list.push({ text: t('employeeDashboard.alertExpiringLicenses'), severity: 'red', route: '/employee/licenses', count: expiringLicensesCount.value })
  }
  return list
})

// ─── Таблица полигонов: топ-5 по заполнению ───────────────────────

const topLandfills = computed(() => {
  const withPercent = landfillStore.state.landfills.map(l => ({
    landfill: l,
    fillPercent: getFillPercent(l),
  }))
  return withPercent
    .sort((a, b) => b.fillPercent - a.fillPercent)
    .slice(0, 5)
})

const getLandfillStatusLabel = (percent: number): string => {
  if (percent >= 85) return 'Критично'
  if (percent >= 70) return 'Внимание'
  return 'Норма'
}

const getLandfillStatusClass = (percent: number) => {
  if (percent >= 85) return 'bg-red-100 text-red-700'
  if (percent >= 70) return 'bg-amber-100 text-amber-700'
  return 'bg-green-100 text-green-700'
}

const getLandfillBarColor = (percent: number) => {
  if (percent >= 85) return 'bg-red-500'
  if (percent >= 70) return 'bg-amber-500'
  return 'bg-green-500'
}

const alertDotColor = (severity: string) => {
  switch (severity) {
    case 'red': return 'bg-red-500'
    case 'orange': return 'bg-orange-400'
    case 'blue': return 'bg-blue-500'
    default: return 'bg-gray-400'
  }
}

const alertBadgeClass = (severity: string) => {
  switch (severity) {
    case 'red': return 'bg-red-100 text-red-700'
    case 'orange': return 'bg-orange-100 text-orange-700'
    case 'blue': return 'bg-blue-100 text-blue-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

// ─── Загрузка данных при монтировании ─────────────────────────────

const isLoading = ref(true)
onMounted(async () => {
  try {
    // Параллельная загрузка. При ошибке любого stora - просто покажем 0,
    // dashboard не должен ломаться из-за одного неотвечающего эндпоинта.
    await Promise.allSettled([
      licenseStore.loadStatusCounts(),
      licenseStore.loadRegistry(),
      landfillStore.fetchAll(),
      feedbackStore.fetchAll(),
    ])
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <DashboardLayout
    role="employee"
    :roleTitle="roleTitle"
    :userName="userName"
    :menuItems="menuItems"
  >
    <div class="content__header mb-8">
      <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b] mb-2">{{ $t('pages.employee.dashboardTitle') }}</h1>
      <p class="text-[#64748b]">{{ $t('pages.employee.dashboardSubtitle') }}</p>
    </div>

    <SectionGuide
      :title="$t('employeeDashboard.guideTitle')"
      :description="$t('employeeDashboard.guideDescription')"
      :actions="[$t('employeeDashboard.guideAction1'), $t('employeeDashboard.guideAction2'), $t('employeeDashboard.guideAction3')]"
      storageKey="employee-dashboard"
    />

    <!-- Skeleton Loading -->
    <template v-if="isLoading">
      <div class="mb-8">
        <SkeletonLoader variant="card" />
      </div>
      <SkeletonLoader variant="table" />
    </template>

    <template v-else>
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          v-for="stat in stats"
          :key="stat.title"
          :title="stat.title"
          :value="stat.value"
          :icon="stat.icon"
          :color="stat.color"
        />
      </div>

      <!-- Alerts Block -->
      <div class="bg-white rounded-xl border border-[#e2e8f0] border-l-4 border-l-orange-400 shadow-sm mb-8">
        <div class="px-6 py-4 border-b border-[#f1f5f9]">
          <h2 class="text-lg font-semibold text-[#1e293b]">{{ $t('employeeDashboard.requireAttention') }}</h2>
        </div>
        <div v-if="alerts.length === 0" class="px-6 py-8 text-center text-sm text-[#64748b]">
          {{ $t('employeeDashboard.noAlerts') }}
        </div>
        <div v-else class="divide-y divide-[#f1f5f9]">
          <router-link
            v-for="(alert, idx) in alerts"
            :key="idx"
            :to="alert.route"
            class="flex items-center gap-3 px-6 py-3.5 hover:bg-[#f8fafc] transition-colors group"
          >
            <span :class="['w-2.5 h-2.5 rounded-full flex-shrink-0', alertDotColor(alert.severity)]"></span>
            <span class="text-sm text-[#1e293b] flex-1 group-hover:text-[#0e888d] transition-colors">{{ alert.text }}</span>
            <span :class="['px-2.5 py-0.5 rounded-full text-xs font-semibold flex-shrink-0', alertBadgeClass(alert.severity)]">
              {{ alert.count }}
            </span>
            <svg class="w-4 h-4 text-[#94a3b8] group-hover:text-[#0e888d] transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </router-link>
        </div>
      </div>

      <!-- Мониторинг полигонов: топ-5 по % заполнения -->
      <div class="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] overflow-hidden">
        <div class="px-6 py-4 border-b border-[#e2e8f0] flex items-center justify-between">
          <h2 class="text-lg font-semibold text-[#1e293b]">{{ $t('employeeDashboard.landfillMonitoring') }}</h2>
          <router-link to="/ministry/landfills" class="text-[#0e888d] text-sm font-medium hover:underline">
            {{ $t('employeeDashboard.allLandfills') }} &rarr;
          </router-link>
        </div>
        <div v-if="topLandfills.length === 0" class="px-6 py-8 text-center text-sm text-[#64748b]">
          {{ $t('employeeDashboard.noLandfills') }}
        </div>
        <div v-else class="divide-y divide-[#f1f5f9]">
          <div
            v-for="item in topLandfills"
            :key="item.landfill.id"
            class="px-6 py-4 hover:bg-[#f8fafc] transition-colors"
          >
            <div class="flex items-center justify-between mb-2">
              <div>
                <p class="font-medium text-[#1e293b]">{{ item.landfill.name }}</p>
                <p class="text-sm text-[#64748b]">{{ item.landfill.region }}</p>
              </div>
              <span :class="['text-xs px-2.5 py-1 rounded-full font-medium', getLandfillStatusClass(item.fillPercent)]">
                {{ getLandfillStatusLabel(item.fillPercent) }}
              </span>
            </div>
            <div class="flex items-center gap-3">
              <div class="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  :class="['h-full rounded-full transition-all', getLandfillBarColor(item.fillPercent)]"
                  :style="{ width: Math.min(item.fillPercent, 100) + '%' }"
                ></div>
              </div>
              <span class="text-sm font-medium text-[#64748b] w-10 text-right">{{ item.fillPercent }}%</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </DashboardLayout>
</template>
