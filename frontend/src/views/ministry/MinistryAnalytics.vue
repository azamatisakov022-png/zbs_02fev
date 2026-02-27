<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import SkeletonLoader from '../../components/dashboard/SkeletonLoader.vue'
import { AppBadge } from '../../components/ui'
import { useEmployeeMenu } from '../../composables/useRoleMenu'
import { productGroups } from '../../data/product-groups'
import { getNormativeForGroup } from '../../data/recycling-norms'
import { toastStore } from '../../stores/toast'
import { analyticsStore } from '../../stores/analytics'
import SectionGuide from '../../components/common/SectionGuide.vue'

const { roleTitle, menuItems } = useEmployeeMenu()

// ─── Loading ───
const isLoading = ref(true)
onMounted(async () => {
  await analyticsStore.fetchAll('month')
  isLoading.value = false
})

// ─── Tabs ───
const activeTab = ref<'summary' | 'recycling' | 'regional'>('summary')
const tabs = [
  { key: 'summary' as const, label: 'Общая сводка' },
  { key: 'recycling' as const, label: 'Переработка и нормативы' },
  { key: 'regional' as const, label: 'Региональная статистика' },
]

// ─── Filters ───
const periodMode = ref<'month' | 'quarter' | 'year' | 'custom'>('year')
const regionFilter = ref('all')
const customFrom = ref('')
const customTo = ref('')

const regions = [
  { value: 'all', label: 'Все регионы' },
  { value: 'bishkek', label: 'г. Бишкек' },
  { value: 'osh_city', label: 'г. Ош' },
  { value: 'chuy', label: 'Чуйская область' },
  { value: 'issyk_kul', label: 'Иссык-Кульская область' },
  { value: 'naryn', label: 'Нарынская область' },
  { value: 'talas', label: 'Таласская область' },
  { value: 'batken', label: 'Баткенская область' },
  { value: 'jalal_abad', label: 'Джалал-Абадская область' },
  { value: 'osh', label: 'Ошская область' },
]

// ─── Regional Data (from backend analytics) ───
interface RegionDataItem {
  key: string
  name: string
  shortName: string
  recyclers: number
  landfills: number
  dumps: number
  wasteVolume: number
}

const regionKeyMap: Record<string, { key: string; shortName: string }> = {
  'г. Бишкек': { key: 'bishkek', shortName: 'Бишкек' },
  'Чуйская область': { key: 'chuy', shortName: 'Чуйская' },
  'г. Ош': { key: 'osh_city', shortName: 'г. Ош' },
  'Ошская область': { key: 'osh', shortName: 'Ошская' },
  'Джалал-Абадская область': { key: 'jalal_abad', shortName: 'Жалал-Абад' },
  'Джалал-Абадская обл.': { key: 'jalal_abad', shortName: 'Жалал-Абад' },
  'Иссык-Кульская область': { key: 'issyk_kul', shortName: 'Иссык-Куль' },
  'Иссык-Кульская обл.': { key: 'issyk_kul', shortName: 'Иссык-Куль' },
  'Баткенская область': { key: 'batken', shortName: 'Баткен' },
  'Нарынская область': { key: 'naryn', shortName: 'Нарын' },
  'Таласская область': { key: 'talas', shortName: 'Талас' },
}

const regionDataFallback: RegionDataItem[] = [
  { key: 'bishkek', name: 'г. Бишкек', shortName: 'Бишкек', recyclers: 12, landfills: 1, dumps: 3, wasteVolume: 4850 },
  { key: 'chuy', name: 'Чуйская область', shortName: 'Чуйская', recyclers: 8, landfills: 3, dumps: 12, wasteVolume: 2340 },
  { key: 'osh_city', name: 'г. Ош', shortName: 'г. Ош', recyclers: 5, landfills: 1, dumps: 2, wasteVolume: 1280 },
  { key: 'osh', name: 'Ошская область', shortName: 'Ошская', recyclers: 4, landfills: 2, dumps: 18, wasteVolume: 980 },
  { key: 'jalal_abad', name: 'Джалал-Абадская обл.', shortName: 'Жалал-Абад', recyclers: 3, landfills: 2, dumps: 15, wasteVolume: 820 },
  { key: 'issyk_kul', name: 'Иссык-Кульская обл.', shortName: 'Иссык-Куль', recyclers: 2, landfills: 1, dumps: 8, wasteVolume: 540 },
  { key: 'batken', name: 'Баткенская область', shortName: 'Баткен', recyclers: 1, landfills: 1, dumps: 11, wasteVolume: 340 },
  { key: 'naryn', name: 'Нарынская область', shortName: 'Нарын', recyclers: 0, landfills: 1, dumps: 9, wasteVolume: 180 },
  { key: 'talas', name: 'Таласская область', shortName: 'Талас', recyclers: 0, landfills: 1, dumps: 7, wasteVolume: 120 },
]

const regionData = computed<RegionDataItem[]>(() => {
  const backendRegions = analyticsStore.state.regions
  if (!backendRegions.length) return regionDataFallback
  return backendRegions.map(r => {
    const mapped = regionKeyMap[r.region] || { key: r.region.toLowerCase().replace(/\s+/g, '_'), shortName: r.region }
    return {
      key: mapped.key,
      name: r.region,
      shortName: mapped.shortName,
      recyclers: r.recyclersCount,
      landfills: r.landfillsCount,
      dumps: r.dumpsCount,
      wasteVolume: r.totalWaste,
    }
  })
})

const filteredRegions = computed(() => {
  if (regionFilter.value === 'all') return regionData.value
  return regionData.value.filter(r => r.key === regionFilter.value)
})

// ─── KPI Summary ───
const totalWaste = computed(() => filteredRegions.value.reduce((s, r) => s + r.wasteVolume, 0))
const totalRecyclers = computed(() => filteredRegions.value.reduce((s, r) => s + r.recyclers, 0))
const totalLandfills = computed(() => filteredRegions.value.reduce((s, r) => s + r.landfills, 0))
const totalDumps = computed(() => filteredRegions.value.reduce((s, r) => s + r.dumps, 0))

// ─── Dump status donut data ───
const dumpStatusData = [
  { label: 'Ликвидировано', value: 23, color: '#22C55E' },
  { label: 'В процессе', value: 18, color: '#F59E0B' },
  { label: 'Не начато', value: 44, color: '#EF4444' },
]
const totalDumpStatus = dumpStatusData.reduce((s, c) => s + c.value, 0)

function getDumpDonutPath(startAngle: number, endAngle: number, r: number, cx: number, cy: number): string {
  const start = { x: cx + r * Math.cos(startAngle), y: cy + r * Math.sin(startAngle) }
  const end = { x: cx + r * Math.cos(endAngle), y: cy + r * Math.sin(endAngle) }
  const large = endAngle - startAngle > Math.PI ? 1 : 0
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y}`
}

const dumpDonutArcs = computed(() => {
  const arcs: { d: string; color: string; label: string; pct: string }[] = []
  let cumAngle = -Math.PI / 2
  for (const cat of dumpStatusData) {
    const pct = cat.value / totalDumpStatus
    const angle = pct * 2 * Math.PI
    arcs.push({
      d: getDumpDonutPath(cumAngle, cumAngle + angle, 70, 100, 100),
      color: cat.color,
      label: cat.label,
      pct: (pct * 100).toFixed(1),
    })
    cumAngle += angle
  }
  return arcs
})

// ─── Tab 2: Recycling normatives for all 24 categories ───
const normYear = 2025

// Build a map from backend recycling data for quick lookup
const recyclingFactMap = computed(() => {
  const map = new Map<string, { fact: number; norm: number }>()
  analyticsStore.state.recycling.forEach(r => {
    // Try to match by wasteGroup name to product group label
    const matchedGroup = productGroups.find(g => g.label.toLowerCase().includes(r.wasteGroup.toLowerCase()) || r.wasteGroup.toLowerCase().includes(g.label.toLowerCase()))
    if (matchedGroup) {
      map.set(matchedGroup.value, { fact: r.recyclingPercent, norm: r.norm })
    }
  })
  return map
})

const categoryNorms = computed(() => {
  const factMapFallback: Record<string, number> = {
    group_1: 38.2, group_2: 35.1, group_3: 22.5, group_4: 18.7,
    group_5: 12.3, group_6: 8.1, group_7: 11.5, group_8: 9.8,
    group_9: 15.2, group_10: 7.4, group_11: 6.2, group_12: 13.8,
    group_13: 10.1, group_14: 5.9, group_15: 8.7, group_16: 4.3,
    group_17: 9.2, group_18: 7.8,
    group_19: 14.5, group_20: 3.2, group_21: 6.8, group_22: 18.3,
    group_23: 12.1, group_24: 28.0,
  }
  return productGroups.map(g => {
    const normFraction = getNormativeForGroup(g.value, normYear)
    const normPercent = Math.round(normFraction * 100)
    const backendData = recyclingFactMap.value.get(g.value)
    const fact = backendData?.fact ?? (factMapFallback[g.value] || 5.0)
    const fulfillment = normPercent > 0 ? Math.round((fact / normPercent) * 100) : 0
    const status = fulfillment >= 100 ? 'fulfilled' : fulfillment >= 70 ? 'lagging' : 'failed'
    return { group: g, normPercent, fact, fulfillment, status }
  })
})

const recyclingKpis = computed(() => {
  const fulfilled = categoryNorms.value.filter(c => c.status === 'fulfilled').length
  const failed = categoryNorms.value.filter(c => c.status === 'failed').length
  const avgFulfillment = Math.round(categoryNorms.value.reduce((s, c) => s + c.fulfillment, 0) / categoryNorms.value.length)
  return { fulfilled, failed, avgFulfillment, belowPlan: categoryNorms.value.filter(c => c.status !== 'fulfilled').length }
})

// ─── Monthly recycling data for area chart ───
const recyclingMonthly = [
  { month: 'Янв', plan: 950, fact: 820 },
  { month: 'Фев', plan: 980, fact: 860 },
  { month: 'Мар', plan: 1050, fact: 940 },
  { month: 'Апр', plan: 1080, fact: 1020 },
  { month: 'Май', plan: 1120, fact: 1080 },
  { month: 'Июн', plan: 1100, fact: 1050 },
  { month: 'Июл', plan: 1060, fact: 990 },
  { month: 'Авг', plan: 1090, fact: 1030 },
  { month: 'Сен', plan: 1150, fact: 1120 },
  { month: 'Окт', plan: 1180, fact: 1100 },
  { month: 'Ноя', plan: 1050, fact: 980 },
  { month: 'Дек', plan: 1040, fact: 960 },
]
const maxRecycling = Math.max(...recyclingMonthly.map(d => Math.max(d.plan, d.fact)))

function areaPolyline(data: number[], maxVal: number, w: number, h: number): string {
  const step = w / (data.length - 1)
  return data.map((v, i) => `${i * step},${h - (v / maxVal) * h}`).join(' ')
}

function areaPolygon(data: number[], maxVal: number, w: number, h: number): string {
  const step = w / (data.length - 1)
  const line = data.map((v, i) => `${i * step},${h - (v / maxVal) * h}`).join(' ')
  return `0,${h} ${line} ${w},${h}`
}

// ─── Tab 3: Regional sorting ───
const sortCol = ref('recyclers')
const sortDir = ref<'asc' | 'desc'>('desc')

const sortedRegions = computed(() => {
  const list = [...filteredRegions.value]
  list.sort((a, b) => {
    const va = (a as any)[sortCol.value] ?? 0
    const vb = (b as any)[sortCol.value] ?? 0
    return sortDir.value === 'desc' ? vb - va : va - vb
  })
  return list
})

function toggleSort(col: string) {
  if (sortCol.value === col) {
    sortDir.value = sortDir.value === 'desc' ? 'asc' : 'desc'
  } else {
    sortCol.value = col
    sortDir.value = 'desc'
  }
}

// ─── Format helpers ───
function fmt(n: number): string { return n.toLocaleString('ru-RU') }
function fmtM(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + ' млн'
  if (n >= 1_000) return (n / 1_000).toFixed(0) + ' тыс'
  return fmt(n)
}

// ─── Export stub ───
function exportReport() {
  toastStore.show({ type: 'info', title: 'Экспорт', message: 'Выгрузка отчёта будет доступна в следующем обновлении' })
}
</script>

<template>
  <DashboardLayout
    role="employee"
    :roleTitle="roleTitle"
    userName="Касымова Н.Р."
    :menuItems="menuItems"
  >
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b] mb-2">Аналитика управления отходами</h1>
      <p class="text-[#64748b]">Сводные показатели системы РОП Кыргызской Республики</p>
    </div>

    <SectionGuide
      title="Аналитика управления отходами"
      description="Сводные показатели экологической инфраструктуры Кыргызской Республики."
      :actions="['Анализ переработки и нормативов', 'Региональная статистика', 'Мониторинг инфраструктуры', 'Выгрузка отчётов']"
      storageKey="ministry-analytics"
    />

    <!-- Filters -->
    <div class="bg-white rounded-2xl p-4 shadow-sm border border-[#e2e8f0] mb-6">
      <div class="flex flex-wrap items-center gap-3">
        <!-- Period -->
        <div class="flex items-center gap-1 bg-[#f8fafc] rounded-xl p-1">
          <button v-for="p in [
            { key: 'month', label: 'Месяц' },
            { key: 'quarter', label: 'Квартал' },
            { key: 'year', label: 'Год' },
            { key: 'custom', label: 'Произвольный' },
          ]" :key="p.key"
            @click="periodMode = p.key as any"
            :class="['px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              periodMode === p.key ? 'bg-white text-[#1e293b] shadow-sm' : 'text-[#64748b] hover:text-[#1e293b]']">
            {{ p.label }}
          </button>
        </div>
        <!-- Custom dates -->
        <template v-if="periodMode === 'custom'">
          <input type="date" v-model="customFrom" class="px-3 py-1.5 border border-[#e2e8f0] rounded-lg text-xs focus:outline-none focus:border-[#10b981]" />
          <span class="text-xs text-[#94a3b8]">—</span>
          <input type="date" v-model="customTo" class="px-3 py-1.5 border border-[#e2e8f0] rounded-lg text-xs focus:outline-none focus:border-[#10b981]" />
        </template>
        <!-- Region -->
        <select v-model="regionFilter" class="px-3 py-1.5 border border-[#e2e8f0] rounded-lg text-xs focus:outline-none focus:border-[#10b981]">
          <option v-for="r in regions" :key="r.value" :value="r.value">{{ r.label }}</option>
        </select>
        <!-- Export -->
        <button @click="exportReport" class="ml-auto flex items-center gap-1.5 px-4 py-1.5 bg-[#10b981] text-white rounded-lg text-xs font-medium hover:bg-[#059669] transition-colors">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          Выгрузить отчёт
        </button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex gap-1 bg-[#f8fafc] rounded-xl p-1 mb-6 border border-[#e2e8f0]">
      <button v-for="tab in tabs" :key="tab.key" @click="activeTab = tab.key"
        :class="['flex-1 py-2.5 rounded-lg text-sm font-medium transition-all',
          activeTab === tab.key
            ? 'bg-white text-[#1e293b] shadow-sm'
            : 'text-[#64748b] hover:text-[#1e293b]']">
        {{ tab.label }}
      </button>
    </div>

    <template v-if="isLoading">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SkeletonLoader v-for="i in 4" :key="i" variant="card" />
      </div>
      <SkeletonLoader variant="table" />
    </template>

    <template v-if="!isLoading">
      <!-- ═══════════ TAB 1: GENERAL SUMMARY ═══════════ -->
      <template v-if="activeTab === 'summary'">
        <!-- KPI Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <!-- Recyclers -->
          <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 border border-green-200 shadow-sm">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              </div>
            </div>
            <p class="text-2xl font-bold text-green-900">{{ fmt(totalRecyclers) }}</p>
            <p class="text-xs text-green-700">Переработчиков активных</p>
          </div>
          <!-- Landfills -->
          <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 border border-blue-200 shadow-sm">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              </div>
            </div>
            <p class="text-2xl font-bold text-blue-900">{{ fmt(totalLandfills) }}</p>
            <p class="text-xs text-blue-700">Полигонов</p>
          </div>
          <!-- Dumps -->
          <div class="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-4 border border-orange-200 shadow-sm">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
            </div>
            <p class="text-2xl font-bold text-orange-900">{{ fmt(totalDumps) }}</p>
            <p class="text-xs text-orange-700">Свалок</p>
          </div>
          <!-- Licenses -->
          <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4 border border-purple-200 shadow-sm">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
            </div>
            <p class="text-2xl font-bold text-purple-900">47</p>
            <p class="text-xs text-purple-700">Лицензий действующих</p>
            <p class="text-xs text-purple-500 mt-1">5 истекают в ближайший месяц</p>
          </div>
        </div>

        <!-- Charts Row 1 -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <!-- Horizontal Bar: Recycling capacity by region -->
          <div class="bg-white rounded-2xl p-5 shadow-sm border border-[#e2e8f0]">
            <h3 class="text-base font-bold text-[#1e293b] mb-4">Мощности переработки по регионам</h3>
            <div class="space-y-2.5">
              <div v-for="r in [...regionData].sort((a,b) => b.recyclers - a.recyclers)" :key="'rec-'+r.key" class="flex items-center gap-3">
                <span class="text-xs text-[#64748b] w-20 truncate flex-shrink-0">{{ r.shortName }}</span>
                <div class="flex-1 h-6 bg-[#f1f5f9] rounded-lg overflow-hidden">
                  <div class="h-full rounded-lg transition-all bg-gradient-to-r from-[#22C55E] to-[#10b981]"
                    :style="{ width: regionData[0].recyclers > 0 ? (r.recyclers / [...regionData].sort((a,b) => b.recyclers - a.recyclers)[0].recyclers * 100) + '%' : '0%' }"></div>
                </div>
                <span class="text-xs font-semibold text-[#1e293b] w-6 text-right">{{ r.recyclers }}</span>
              </div>
            </div>
          </div>

          <!-- Landfill status -->
          <div class="bg-white rounded-2xl p-5 shadow-sm border border-[#e2e8f0]">
            <h3 class="text-base font-bold text-[#1e293b] mb-4">Состояние полигонов</h3>
            <div class="space-y-5">
              <div>
                <div class="flex items-center justify-between mb-1">
                  <span class="text-sm text-[#64748b]">Всего полигонов</span>
                  <span class="text-sm font-bold text-[#1e293b]">13</span>
                </div>
              </div>
              <div>
                <div class="flex items-center justify-between mb-1.5">
                  <span class="text-sm text-[#64748b]">Средняя заполненность</span>
                  <span class="text-sm font-bold text-[#1e293b]">67%</span>
                </div>
                <div class="w-full h-3 bg-[#f1f5f9] rounded-full overflow-hidden">
                  <div class="h-full rounded-full bg-gradient-to-r from-[#22C55E] to-[#F59E0B]" style="width: 67%"></div>
                </div>
              </div>
              <div>
                <div class="flex items-center justify-between mb-1.5">
                  <span class="text-sm text-[#64748b]">Критическая заполненность (&gt;80%)</span>
                  <span class="text-sm font-bold text-red-600">3 полигона</span>
                </div>
                <div class="w-full h-3 bg-[#f1f5f9] rounded-full overflow-hidden">
                  <div class="h-full rounded-full bg-red-500" :style="{ width: (3 / 13 * 100) + '%' }"></div>
                </div>
                <p class="text-xs text-[#94a3b8] mt-1.5">Бишкек (89%), Чуйская (83%), г. Ош (81%)</p>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#f1f5f9]">
                <div class="text-center">
                  <p class="text-lg font-bold text-green-600">6</p>
                  <p class="text-xs text-[#64748b]">Норма (&lt;60%)</p>
                </div>
                <div class="text-center">
                  <p class="text-lg font-bold text-yellow-600">4</p>
                  <p class="text-xs text-[#64748b]">Внимание (60-80%)</p>
                </div>
                <div class="text-center">
                  <p class="text-lg font-bold text-red-600">3</p>
                  <p class="text-xs text-[#64748b]">Критично (&gt;80%)</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts Row 2 -->
        <div class="grid grid-cols-1 lg:grid-cols-1 gap-6">
          <!-- Donut: Dump liquidation status -->
          <div class="bg-white rounded-2xl p-5 shadow-sm border border-[#e2e8f0]">
            <h3 class="text-base font-bold text-[#1e293b] mb-4">Статус ликвидации свалок</h3>
            <div class="flex items-center gap-6">
              <div class="relative flex-shrink-0">
                <svg viewBox="0 0 200 200" width="180" height="180">
                  <path v-for="(arc, i) in dumpDonutArcs" :key="i" :d="arc.d" fill="none" :stroke="arc.color" stroke-width="28" stroke-linecap="round" />
                  <text x="100" y="95" text-anchor="middle" fill="#1e293b" font-size="28" font-weight="700">{{ totalDumpStatus }}</text>
                  <text x="100" y="115" text-anchor="middle" fill="#94a3b8" font-size="11">всего</text>
                </svg>
              </div>
              <div class="space-y-3 flex-1">
                <div v-for="cat in dumpStatusData" :key="cat.label" class="flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full flex-shrink-0" :style="{ background: cat.color }"></span>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-[#1e293b] truncate">{{ cat.label }}</p>
                    <p class="text-xs text-[#64748b]">{{ cat.value }} ({{ ((cat.value / totalDumpStatus) * 100).toFixed(1) }}%)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- ═══════════ TAB 2: RECYCLING & NORMATIVES ═══════════ -->
      <template v-if="activeTab === 'recycling'">
        <!-- KPI Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-5 border border-green-200 shadow-sm">
            <p class="text-xs text-green-700 mb-1">Переработчиков активных</p>
            <p class="text-3xl font-bold text-green-900">{{ totalRecyclers }}</p>
          </div>
          <div class="bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl p-5 border border-teal-200 shadow-sm">
            <p class="text-xs text-teal-700 mb-1">Переработано всего</p>
            <p class="text-3xl font-bold text-teal-900">{{ fmt(totalWaste) }} т</p>
          </div>
          <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 border border-blue-200 shadow-sm">
            <p class="text-xs text-blue-700 mb-1">Выполнение нормативов</p>
            <p class="text-3xl font-bold text-blue-900">{{ recyclingKpis.avgFulfillment }}%</p>
          </div>
          <div class="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-5 border border-orange-200 shadow-sm">
            <p class="text-xs text-orange-700 mb-1">Категорий ниже плана</p>
            <p class="text-3xl font-bold text-orange-900">{{ recyclingKpis.belowPlan }} из 24</p>
          </div>
        </div>

        <!-- Normative fulfillment table -->
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-[#e2e8f0] mb-6">
          <h3 class="text-base font-bold text-[#1e293b] mb-4">Выполнение нормативов переработки по категориям ({{ normYear }})</h3>
          <div class="overflow-x-auto">
            <table class="w-full text-sm border-collapse">
              <thead>
                <tr class="text-left text-[#64748b] bg-[#f8fafc]">
                  <th class="px-3 py-2.5 font-medium rounded-tl-lg">Категория</th>
                  <th class="px-3 py-2.5 font-medium text-center">Норматив {{ normYear }}</th>
                  <th class="px-3 py-2.5 font-medium text-center">Факт</th>
                  <th class="px-3 py-2.5 font-medium text-center">Выполнение</th>
                  <th class="px-3 py-2.5 font-medium text-center rounded-tr-lg">Статус</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="c in categoryNorms" :key="c.group.value" class="border-t border-[#f1f5f9] hover:bg-[#f8fafc]">
                  <td class="px-3 py-2.5 text-[#1e293b] text-xs">{{ c.group.label }}</td>
                  <td class="px-3 py-2.5 text-center font-medium">{{ c.normPercent }}%</td>
                  <td class="px-3 py-2.5 text-center font-medium">{{ c.fact }}%</td>
                  <td class="px-3 py-2.5 text-center">
                    <div class="flex items-center gap-2 justify-center">
                      <div class="w-16 h-2 bg-[#f1f5f9] rounded-full overflow-hidden">
                        <div class="h-full rounded-full transition-all" :style="{
                          width: Math.min(c.fulfillment, 100) + '%',
                          background: c.status === 'fulfilled' ? '#22C55E' : c.status === 'lagging' ? '#F59E0B' : '#EF4444'
                        }"></div>
                      </div>
                      <span class="text-xs font-semibold" :class="{
                        'text-green-600': c.status === 'fulfilled',
                        'text-yellow-600': c.status === 'lagging',
                        'text-red-600': c.status === 'failed',
                      }">{{ c.fulfillment }}%</span>
                    </div>
                  </td>
                  <td class="px-3 py-2.5 text-center">
                    <span v-if="c.status === 'fulfilled'" class="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">Выполнен</span>
                    <span v-else-if="c.status === 'lagging'" class="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">Отставание</span>
                    <span v-else class="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">Не выполнен</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Area chart: Recycling dynamics -->
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-[#e2e8f0]">
          <h3 class="text-base font-bold text-[#1e293b] mb-4">Динамика переработки (тонн)</h3>
          <svg viewBox="0 0 600 240" class="w-full" preserveAspectRatio="xMidYMid meet">
            <!-- Grid -->
            <line v-for="i in 5" :key="'rgl'+i" x1="40" x2="580" :y1="10 + (i-1)*45" :y2="10 + (i-1)*45" stroke="#f1f5f9" stroke-width="1" />
            <!-- Y labels -->
            <text v-for="(v,i) in [1200,900,600,300,0]" :key="'ryl'+i" x="36" :y="14 + i*45" text-anchor="end" fill="#94a3b8" font-size="10">{{ v }}</text>
            <!-- Area: fact -->
            <polygon :points="areaPolygon(recyclingMonthly.map(d=>d.fact), maxRecycling, 540, 190)" transform="translate(40,10)" fill="#d1fae5" opacity="0.6" />
            <polyline :points="areaPolyline(recyclingMonthly.map(d=>d.fact), maxRecycling, 540, 190)" transform="translate(40,10)" fill="none" stroke="#22C55E" stroke-width="2.5" />
            <!-- Line: plan (dashed) -->
            <polyline :points="areaPolyline(recyclingMonthly.map(d=>d.plan), maxRecycling, 540, 190)" transform="translate(40,10)" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="6,4" />
            <!-- X labels -->
            <text v-for="(d, i) in recyclingMonthly" :key="'rxl'+i" :x="40 + i * (540/11)" y="220" text-anchor="middle" fill="#94a3b8" font-size="9">{{ d.month }}</text>
          </svg>
          <div class="flex items-center gap-4 mt-3 justify-center">
            <span class="flex items-center gap-1.5 text-xs text-[#64748b]"><span class="w-6 h-0.5 bg-[#94a3b8] inline-block" style="border-top:1.5px dashed #94a3b8"></span>План</span>
            <span class="flex items-center gap-1.5 text-xs text-[#64748b]"><span class="w-3 h-3 rounded bg-[#d1fae5] border border-[#22C55E]"></span>Факт</span>
          </div>
        </div>
      </template>

      <!-- ═══════════ TAB 3: REGIONAL STATISTICS ═══════════ -->
      <template v-if="activeTab === 'regional'">
        <!-- Region infrastructure overview -->
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-[#e2e8f0] mb-6">
          <h3 class="text-base font-bold text-[#1e293b] mb-4">Инфраструктура по регионам</h3>
          <div class="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3">
            <button v-for="r in regionData" :key="r.key"
              @click="regionFilter = regionFilter === r.key ? 'all' : r.key"
              :class="['rounded-xl p-3 border-2 transition-all text-center cursor-pointer',
                regionFilter === r.key ? 'border-[#10b981] shadow-md scale-105' : 'border-transparent hover:border-[#e2e8f0]']"
              style="background: rgba(34, 197, 94, 0.08)">
              <div class="w-8 h-8 mx-auto rounded-full mb-1.5 flex items-center justify-center text-white text-xs font-bold"
                style="background: #22C55E">
                {{ r.recyclers + r.landfills }}
              </div>
              <p class="text-xs font-medium text-[#1e293b] truncate">{{ r.shortName }}</p>
              <p class="text-[10px] text-[#64748b]">{{ r.recyclers + r.landfills }} объектов</p>
            </button>
          </div>
        </div>

        <!-- Sortable region table -->
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-[#e2e8f0] mb-6">
          <h3 class="text-base font-bold text-[#1e293b] mb-4">Детальная статистика по регионам</h3>
          <div class="overflow-x-auto">
            <table class="w-full text-sm border-collapse">
              <thead>
                <tr class="text-left text-[#64748b] bg-[#f8fafc] text-xs">
                  <th class="px-3 py-2.5 font-medium rounded-tl-lg">Регион</th>
                  <th class="px-3 py-2.5 font-medium text-right cursor-pointer hover:text-[#1e293b]" @click="toggleSort('recyclers')">
                    Переработчиков
                    <span v-if="sortCol==='recyclers'" class="ml-0.5">{{ sortDir==='desc' ? '↓' : '↑' }}</span>
                  </th>
                  <th class="px-3 py-2.5 font-medium text-right cursor-pointer hover:text-[#1e293b]" @click="toggleSort('landfills')">
                    Полигонов
                    <span v-if="sortCol==='landfills'" class="ml-0.5">{{ sortDir==='desc' ? '↓' : '↑' }}</span>
                  </th>
                  <th class="px-3 py-2.5 font-medium text-right cursor-pointer hover:text-[#1e293b]" @click="toggleSort('dumps')">
                    Свалок
                    <span v-if="sortCol==='dumps'" class="ml-0.5">{{ sortDir==='desc' ? '↓' : '↑' }}</span>
                  </th>
                  <th class="px-3 py-2.5 font-medium text-right cursor-pointer hover:text-[#1e293b] rounded-tr-lg" @click="toggleSort('wasteVolume')">
                    Объём отходов (т)
                    <span v-if="sortCol==='wasteVolume'" class="ml-0.5">{{ sortDir==='desc' ? '↓' : '↑' }}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in sortedRegions" :key="r.key"
                  class="border-t border-[#f1f5f9] hover:bg-[#f8fafc] cursor-pointer transition-colors"
                  @click="regionFilter = r.key">
                  <td class="px-3 py-2.5 font-medium text-[#1e293b]">{{ r.name }}</td>
                  <td class="px-3 py-2.5 text-right">{{ r.recyclers }}</td>
                  <td class="px-3 py-2.5 text-right">{{ r.landfills }}</td>
                  <td class="px-3 py-2.5 text-right">{{ r.dumps }}</td>
                  <td class="px-3 py-2.5 text-right font-medium">{{ fmt(r.wasteVolume) }} т</td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="bg-[#f8fafc] font-semibold border-t-2 border-[#e2e8f0]">
                  <td class="px-3 py-2.5 text-[#1e293b]">ИТОГО</td>
                  <td class="px-3 py-2.5 text-right">{{ filteredRegions.reduce((s,r) => s+r.recyclers,0) }}</td>
                  <td class="px-3 py-2.5 text-right">{{ filteredRegions.reduce((s,r) => s+r.landfills,0) }}</td>
                  <td class="px-3 py-2.5 text-right">{{ filteredRegions.reduce((s,r) => s+r.dumps,0) }}</td>
                  <td class="px-3 py-2.5 text-right">{{ fmt(filteredRegions.reduce((s,r) => s+r.wasteVolume,0)) }} т</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <!-- Two charts: waste distribution + infrastructure -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Stacked bar: Waste by region -->
          <div class="bg-white rounded-2xl p-5 shadow-sm border border-[#e2e8f0]">
            <h3 class="text-base font-bold text-[#1e293b] mb-4">Распределение отходов по регионам</h3>
            <div class="space-y-2.5">
              <div v-for="r in [...regionData].sort((a,b) => b.wasteVolume - a.wasteVolume)" :key="'waste-'+r.key" class="flex items-center gap-3">
                <span class="text-xs text-[#64748b] w-20 truncate flex-shrink-0">{{ r.shortName }}</span>
                <div class="flex-1 h-6 bg-[#f1f5f9] rounded-lg overflow-hidden">
                  <div class="h-full rounded-lg transition-all bg-gradient-to-r from-[#22C55E] to-[#10b981]"
                    :style="{ width: (r.wasteVolume / regionData[0].wasteVolume * 100) + '%' }"></div>
                </div>
                <span class="text-xs font-semibold text-[#1e293b] w-14 text-right">{{ fmt(r.wasteVolume) }} т</span>
              </div>
            </div>
          </div>

          <!-- Grouped bar: Infrastructure -->
          <div class="bg-white rounded-2xl p-5 shadow-sm border border-[#e2e8f0]">
            <h3 class="text-base font-bold text-[#1e293b] mb-4">Инфраструктура по регионам</h3>
            <div class="space-y-2.5">
              <div v-for="r in [...regionData].sort((a,b) => (b.recyclers+b.landfills) - (a.recyclers+a.landfills))" :key="'infra-'+r.key"
                class="flex items-center gap-3">
                <span class="text-xs text-[#64748b] w-20 truncate flex-shrink-0">{{ r.shortName }}</span>
                <div class="flex-1 flex gap-0.5">
                  <div v-if="r.recyclers" class="h-5 bg-[#22C55E] rounded-l" :style="{ width: r.recyclers * 8 + 'px' }"
                    :title="'Переработчиков: ' + r.recyclers"></div>
                  <div v-if="r.landfills" class="h-5 bg-[#3B82F6]" :style="{ width: r.landfills * 8 + 'px' }"
                    :title="'Полигонов: ' + r.landfills"></div>
                  <div v-if="r.dumps" class="h-5 bg-[#F59E0B] rounded-r" :style="{ width: Math.min(r.dumps, 20) * 5 + 'px' }"
                    :title="'Свалок: ' + r.dumps"></div>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-4 mt-4 justify-center text-xs text-[#64748b]">
              <span class="flex items-center gap-1"><span class="w-3 h-3 rounded bg-[#22C55E]"></span>Переработчики</span>
              <span class="flex items-center gap-1"><span class="w-3 h-3 rounded bg-[#3B82F6]"></span>Полигоны</span>
              <span class="flex items-center gap-1"><span class="w-3 h-3 rounded bg-[#F59E0B]"></span>Свалки</span>
            </div>
          </div>
        </div>
      </template>
    </template>
  </DashboardLayout>
</template>
