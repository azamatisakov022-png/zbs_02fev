<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import SkeletonLoader from '../../components/dashboard/SkeletonLoader.vue'
import StatsCard from '../../components/dashboard/StatsCard.vue'
import PieChart from '../../components/charts/PieChart.vue'
import { icons, statsIcons } from '../../utils/menuIcons'
import { useEmployeeMenu } from '../../composables/useRoleMenu'

const { roleTitle, menuItems } = useEmployeeMenu()

const stats = [
  { title: 'Зарегистрировано организаций', value: '342', icon: statsIcons.users, color: 'blue' as const },
  { title: 'Действующих лицензий', value: '48', icon: statsIcons.approved, color: 'green' as const },
  { title: 'Полигонов на контроле', value: '12', icon: statsIcons.capacity, color: 'purple' as const },
  { title: 'Видов отходов в реестре', value: '24', icon: statsIcons.waste, color: 'orange' as const },
]

const alerts = [
  { text: '2 лицензии истекают в ближайшие 30 дней', severity: 'red', route: '/employee/licenses', count: 2 },
  { text: '1 полигон превышает допустимую нагрузку', severity: 'red', route: '/employee/landfills', count: 1 },
  { text: '3 полигона заполнены более чем на 80%', severity: 'red', route: '/employee/landfills', count: 3 },
  { text: '4 лицензии требуют продления в этом квартале', severity: 'orange', route: '/employee/licenses', count: 4 },
  { text: '2 вида отходов без установленных нормативов', severity: 'blue', route: '/employee/waste-types', count: 2 },
]

const quickActions = [
  { label: 'Контроль исполнения', subtitle: 'Нормативы и лицензии', icon: icons.compliance, color: '#0e888d', route: '/employee/compliance' },
  { label: 'Лицензии', subtitle: '5 истекают', icon: icons.license, color: '#f59e0b', route: '/employee/licenses' },
  { label: 'Полигоны и свалки', subtitle: '12 объектов', icon: icons.landfill, color: '#7c3aed', route: '/employee/landfills' },
]

const wasteTypePie = [
  { label: 'Пластик', value: 189, color: '#2563eb' },
  { label: 'Бумага/картон', value: 124, color: '#10b981' },
  { label: 'Стекло', value: 52, color: '#f59e0b' },
  { label: 'Металл', value: 22, color: '#6366f1' },
  { label: 'Прочее', value: 14, color: '#94a3b8' },
]

const landfillMonitoring = [
  { name: 'Полигон «Бишкек-Север»', region: 'Бишкек', fillPercent: 65, status: 'Норма' },
  { name: 'Полигон «Бишкек-Юг»', region: 'Бишкек', fillPercent: 86, status: 'Внимание' },
  { name: 'Полигон «Ош»', region: 'Ош', fillPercent: 70, status: 'Норма' },
  { name: 'Свалка «Ош-2»', region: 'Ош', fillPercent: 90, status: 'Критично' },
]

const getLandfillStatusClass = (status: string) => {
  switch (status) {
    case 'Норма': return 'bg-green-100 text-green-700'
    case 'Внимание': return 'bg-amber-100 text-amber-700'
    case 'Критично': return 'bg-red-100 text-red-700'
    default: return 'bg-gray-100 text-gray-700'
  }
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

const isLoading = ref(true)
onMounted(() => {
  setTimeout(() => { isLoading.value = false }, 500)
})
</script>

<template>
  <DashboardLayout
    role="employee"
    :roleTitle="roleTitle"
    userName="Мамытова Айгуль"
    :menuItems="menuItems"
  >
    <div class="content__header mb-8">
      <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b] mb-2">{{ $t('pages.employee.dashboardTitle') }}</h1>
      <p class="text-[#64748b]">{{ $t('pages.employee.dashboardSubtitle') }}</p>
    </div>

    <!-- Skeleton Loading -->
    <template v-if="isLoading">
      <div class="mb-8">
        <SkeletonLoader variant="card" />
      </div>
      <div class="mb-8">
        <SkeletonLoader variant="chart" />
      </div>
      <SkeletonLoader variant="table" />
    </template>

    <template v-else>
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
          <h2 class="text-lg font-semibold text-[#1e293b]">Требуют внимания</h2>
        </div>
        <div class="divide-y divide-[#f1f5f9]">
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

      <!-- Quick Actions & Pie Chart -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- Quick Actions -->
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-[#e2e8f0]">
          <h3 class="text-lg font-semibold text-[#1e293b] mb-4">Быстрые действия</h3>
          <div class="space-y-3">
            <router-link
              v-for="action in quickActions"
              :key="action.route"
              :to="action.route"
              class="flex items-center gap-3 p-4 rounded-xl bg-[#f8fafc] hover:bg-[#e8f5f5] transition-colors group"
            >
              <div
                class="w-10 h-10 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                :style="{ backgroundColor: action.color }"
                v-html="action.icon"
              ></div>
              <div class="min-w-0">
                <span class="font-medium text-[#1e293b] block group-hover:text-[#0e888d] transition-colors">{{ action.label }}</span>
                <span class="text-sm text-[#64748b]">{{ action.subtitle }}</span>
              </div>
              <svg class="w-4 h-4 text-[#94a3b8] ml-auto flex-shrink-0 group-hover:text-[#0e888d] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </router-link>
          </div>
        </div>

        <!-- Pie Chart -->
        <PieChart
          :data="wasteTypePie"
          :size="200"
          title="Доля переработки по видам отходов"
        />
      </div>

      <!-- Мониторинг полигонов -->
      <div class="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] overflow-hidden">
        <div class="px-6 py-4 border-b border-[#e2e8f0] flex items-center justify-between">
          <h2 class="text-lg font-semibold text-[#1e293b]">Мониторинг полигонов</h2>
          <router-link to="/employee/landfills" class="text-[#0e888d] text-sm font-medium hover:underline">
            Все полигоны &rarr;
          </router-link>
        </div>
        <div class="divide-y divide-[#f1f5f9]">
          <div
            v-for="landfill in landfillMonitoring"
            :key="landfill.name"
            class="px-6 py-4 hover:bg-[#f8fafc] transition-colors"
          >
            <div class="flex items-center justify-between mb-2">
              <div>
                <p class="font-medium text-[#1e293b]">{{ landfill.name }}</p>
                <p class="text-sm text-[#64748b]">{{ landfill.region }}</p>
              </div>
              <span :class="['text-xs px-2.5 py-1 rounded-full font-medium', getLandfillStatusClass(landfill.status)]">
                {{ landfill.status }}
              </span>
            </div>
            <div class="flex items-center gap-3">
              <div class="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  :class="['h-full rounded-full transition-all', getLandfillBarColor(landfill.fillPercent)]"
                  :style="{ width: landfill.fillPercent + '%' }"
                ></div>
              </div>
              <span class="text-sm font-medium text-[#64748b] w-10 text-right">{{ landfill.fillPercent }}%</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </DashboardLayout>
</template>
