<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import DataTable from '../../components/dashboard/DataTable.vue'
import EmptyState from '../../components/dashboard/EmptyState.vue'
import SkeletonLoader from '../../components/dashboard/SkeletonLoader.vue'
import { icons } from '../../utils/menuIcons'
import { calculationStore } from '../../stores/calculations'
import { reportStore } from '../../stores/reports'
import { productGroups, productSubgroups, getSubgroupData, isPackagingGroup } from '../../data/product-groups'

const menuItems = computed(() => [
  { id: 'dashboard', label: 'Главная', icon: icons.dashboard, route: '/eco-operator' },
  { id: 'incoming-declarations', label: 'Входящие декларации', icon: icons.document, route: '/eco-operator/incoming-declarations' },
  { id: 'incoming-reports', label: 'Входящие отчёты', icon: icons.report, route: '/eco-operator/incoming-reports', badge: reportStore.getPendingCount() },
  { id: 'incoming-calculations', label: 'Входящие расчёты', icon: icons.calculator, route: '/eco-operator/incoming-calculations', badge: calculationStore.getPendingCount() },
  { id: 'licenses', label: 'Лицензии и документы', icon: icons.license, route: '/eco-operator/licenses' },
  { id: 'waste-types', label: 'Виды отходов', icon: icons.recycle, route: '/eco-operator/waste-types' },
  { id: 'my-reports', label: 'Мои отчёты', icon: icons.registries, route: '/eco-operator/my-reports' },
  { id: 'payments', label: 'Аналитика платежей', icon: icons.money, route: '/eco-operator/payments' },
  { id: 'analytics', label: 'Аналитика', icon: icons.analytics, route: '/eco-operator/analytics' },
  { id: 'profile', label: 'Профили компаний', icon: icons.profile, route: '/eco-operator/profile' },
])

// Loading state
const isLoading = ref(true)
onMounted(() => { setTimeout(() => { isLoading.value = false }, 500) })

const columns = [
  { key: 'number', label: 'Номер', width: '9%' },
  { key: 'company', label: 'Компания', width: '15%' },
  { key: 'type', label: 'Тип декларации', width: '18%' },
  { key: 'period', label: 'Период', width: '8%' },
  { key: 'submittedAt', label: 'Дата подачи', width: '9%' },
  { key: 'status', label: 'Статус', width: '10%' },
]

const declarations = ref([
  { id: 1, number: 'ДК-2026-052', company: 'ОсОО «ТехПром»', type: 'Декларация о товарах и упаковке', period: 'Q4 2025', submittedAt: '21.01.2026', status: 'Новая' },
  { id: 2, number: 'ДК-2026-051', company: 'ОАО «СтройМаркет»', type: 'Декларация о товарах и упаковке', period: 'Q4 2025', submittedAt: '20.01.2026', status: 'Новая' },
  { id: 3, number: 'ДК-2026-050', company: 'ОсОО «ПищеПром»', type: 'Декларация о товарах и упаковке', period: 'Q4 2025', submittedAt: '20.01.2026', status: 'На рассмотрении' },
  { id: 4, number: 'ДК-2026-048', company: 'ИП Иванов', type: 'Декларация о товарах и упаковке', period: 'Q4 2025', submittedAt: '19.01.2026', status: 'На рассмотрении' },
  { id: 5, number: 'ДК-2026-045', company: 'ОсОО «ТехПром»', type: 'Декларация о товарах и упаковке', period: 'Q3 2025', submittedAt: '15.10.2025', status: 'Принята' },
  { id: 6, number: 'ДК-2026-042', company: 'ОАО «МегаТорг»', type: 'Декларация о товарах и упаковке', period: 'Q4 2025', submittedAt: '14.01.2026', status: 'Принята' },
])

const getStatusClass = (status: string) => {
  switch (status) {
    case 'Новая': return 'bg-blue-100 text-blue-800'
    case 'На рассмотрении': return 'bg-yellow-100 text-yellow-800'
    case 'Принята': return 'bg-green-100 text-green-800'
    case 'Отклонена': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

// Detail view
const selectedDeclaration = ref<number | null>(null)

const declarationItems: Record<number, Array<{
  group: string
  subgroup: string
  mass: number
  rate: number
}>> = {
  1: [
    { group: 'group_1', subgroup: 'g1_corrugated_boxes', mass: 12.5, rate: 4600 },
    { group: 'group_4', subgroup: 'g4_tires_car', mass: 8.0, rate: 5100 },
    { group: 'group_19', subgroup: 'g19_pet_bottles', mass: 3.2, rate: 3800 },
  ],
  2: [
    { group: 'group_12', subgroup: 'g12_starter', mass: 5.0, rate: 6400 },
    { group: 'group_20', subgroup: 'g20_corrugated', mass: 15.0, rate: 3200 },
  ],
  3: [
    { group: 'group_7', subgroup: 'g7_monitors', mass: 2.0, rate: 12800 },
    { group: 'group_19', subgroup: 'g19_pp_packaging', mass: 6.5, rate: 3800 },
    { group: 'group_23', subgroup: 'g23_aluminum_cans', mass: 1.8, rate: 5600 },
  ],
  4: [
    { group: 'group_1', subgroup: 'g1_newspapers', mass: 4.0, rate: 4600 },
    { group: 'group_22', subgroup: 'g22_bottles', mass: 10.0, rate: 4200 },
  ],
  5: [
    { group: 'group_4', subgroup: 'g4_tires_truck', mass: 20.0, rate: 5100 },
  ],
  6: [
    { group: 'group_21', subgroup: 'g21_beverages', mass: 7.5, rate: 4800 },
    { group: 'group_5', subgroup: 'g5_lubricants', mass: 3.0, rate: 7200 },
  ],
}

const selectedItems = computed(() => {
  if (!selectedDeclaration.value) return []
  const items = declarationItems[selectedDeclaration.value] || []
  return items.map(item => {
    const groupObj = productGroups.find(g => g.value === item.group)
    const subObj = productSubgroups[item.group]?.find(s => s.value === item.subgroup)
    return {
      ...item,
      groupLabel: groupObj?.label || item.group,
      subgroupLabel: subObj?.label || '—',
      amount: item.mass * item.rate,
    }
  })
})

const selectedTotal = computed(() => selectedItems.value.reduce((s, i) => s + i.amount, 0))
const selectedTotalMass = computed(() => selectedItems.value.reduce((s, i) => s + i.mass, 0))

const openDetail = (id: number) => {
  selectedDeclaration.value = selectedDeclaration.value === id ? null : id
}
</script>

<template>
  <DashboardLayout
    role="eco-operator"
    roleTitle="ГП «Эко Оператор»"
    userName="ОсОО «ЭкоПереработка»"
    :menuItems="menuItems"
  >
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div>
        <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b] mb-2">Входящие декларации</h1>
        <p class="text-[#64748b]">Декларации о товарах и упаковке от плательщиков</p>
      </div>
      <div class="flex items-center gap-3">
        <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
          2 новых
        </span>
      </div>
    </div>

    <template v-if="isLoading">
      <div class="mb-6"><SkeletonLoader variant="card" /></div>
      <SkeletonLoader variant="table" />
    </template>

    <template v-if="!isLoading">
    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
        <p class="text-sm text-[#64748b] mb-1">Всего деклараций</p>
        <p class="text-2xl font-bold text-[#1e293b]">156</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
        <p class="text-sm text-[#64748b] mb-1">Новых</p>
        <p class="text-2xl font-bold text-[#2563eb]">12</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
        <p class="text-sm text-[#64748b] mb-1">На рассмотрении</p>
        <p class="text-2xl font-bold text-[#f59e0b]">8</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
        <p class="text-sm text-[#64748b] mb-1">Принято за месяц</p>
        <p class="text-2xl font-bold text-[#10b981]">45</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-2xl p-4 shadow-sm border border-[#e2e8f0] mb-6">
      <div class="flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Поиск по номеру или компании..."
          class="flex-1 min-w-[200px] px-4 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb]"
        />
        <select class="px-4 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb]">
          <option value="">Все периоды</option>
          <option value="2025">2025</option>
          <option value="2026">2026</option>
          <option value="2027">2027</option>
          <option value="2028">2028</option>
          <option value="2029">2029</option>
          <option value="2030">2030</option>
        </select>
        <select class="px-4 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb]">
          <option value="">Все статусы</option>
          <option value="new">Новая</option>
          <option value="review">На рассмотрении</option>
          <option value="accepted">Принята</option>
          <option value="rejected">Отклонена</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <DataTable :columns="columns" :data="declarations" :actions="true">
      <template #cell-number="{ value }">
        <span class="font-mono font-medium text-[#2563eb]">{{ value }}</span>
      </template>
      <template #cell-company="{ value }">
        <span class="font-medium text-[#1e293b]">{{ value }}</span>
      </template>
      <template #cell-status="{ value }">
        <span :class="['px-3 py-1 rounded-full text-xs font-medium', getStatusClass(value)]">
          {{ value }}
        </span>
      </template>
      <template #actions="{ row }">
        <div class="flex flex-wrap items-center justify-end gap-2">
          <button
            @click="openDetail(row.id)"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#3B82F6] text-white hover:bg-[#2563EB] transition-colors shadow-sm"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Детали
          </button>
          <button
            v-if="row.status === 'Новая' || row.status === 'На рассмотрении'"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#10B981] text-white hover:bg-[#059669] transition-colors shadow-sm"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            Принять
          </button>
          <button
            v-if="row.status === 'Новая' || row.status === 'На рассмотрении'"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#EF4444] text-white hover:bg-[#DC2626] transition-colors shadow-sm"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Отклонить
          </button>
        </div>
      </template>
      <template #empty>
        <EmptyState
          icon='<svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>'
          title="Нет входящих деклараций"
          description="Все декларации обработаны"
        />
      </template>
    </DataTable>

    <!-- Detail Panel -->
    <div v-if="selectedDeclaration" class="mt-6 bg-white rounded-2xl shadow-sm border border-[#e2e8f0] overflow-hidden">
      <div class="flex items-center justify-between px-6 py-4 bg-[#f8fafc] border-b border-[#e2e8f0]">
        <div>
          <h3 class="font-semibold text-[#1e293b]">
            Детали декларации {{ declarations.find(d => d.id === selectedDeclaration)?.number }}
          </h3>
          <p class="text-sm text-[#64748b] mt-0.5">
            {{ declarations.find(d => d.id === selectedDeclaration)?.company }} — {{ declarations.find(d => d.id === selectedDeclaration)?.period }}
          </p>
        </div>
        <button @click="selectedDeclaration = null" class="p-2 text-[#64748b] hover:text-[#1e293b] hover:bg-[#f1f5f9] rounded-lg transition-colors">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="p-6 overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-[#64748b] bg-[#f8fafc]">
              <th class="px-3 py-3 font-medium">Группа товаров</th>
              <th class="px-3 py-3 font-medium">Подгруппа</th>
              <th class="px-3 py-3 font-medium">Код ГСКП / Материал</th>
              <th class="px-3 py-3 font-medium">Код ТН ВЭД / ТР ТС</th>
              <th class="px-3 py-3 font-medium">Наименование</th>
              <th class="px-3 py-3 font-medium text-right">Масса (т)</th>
              <th class="px-3 py-3 font-medium text-right">Ставка (сом/т)</th>
              <th class="px-3 py-3 font-medium text-right">Сумма (сом)</th>
            </tr>
          </thead>
          <tbody class="text-[#1e293b]">
            <tr v-for="(item, idx) in selectedItems" :key="idx" class="border-t border-[#e2e8f0]">
              <td class="px-3 py-3 text-xs">{{ item.groupLabel }}</td>
              <td class="px-3 py-3 text-xs">{{ item.subgroupLabel }}</td>
              <template v-if="!isPackagingGroup(item.group)">
                <td class="px-3 py-3 font-mono text-xs">{{ getSubgroupData(item.group, item.subgroup)?.gskpCode || '—' }}</td>
                <td class="px-3 py-3 font-mono text-xs">{{ getSubgroupData(item.group, item.subgroup)?.tnvedCode || '—' }}</td>
                <td class="px-3 py-3 text-xs">{{ getSubgroupData(item.group, item.subgroup)?.tnvedName || '—' }}</td>
              </template>
              <template v-else>
                <td class="px-3 py-3 text-xs">{{ getSubgroupData(item.group, item.subgroup)?.packagingMaterial || '—' }}</td>
                <td class="px-3 py-3 font-mono text-xs">{{ getSubgroupData(item.group, item.subgroup)?.packagingLetterCode || '—' }}</td>
                <td class="px-3 py-3 font-mono text-xs">{{ getSubgroupData(item.group, item.subgroup)?.packagingDigitalCode || '—' }}</td>
              </template>
              <td class="px-3 py-3 text-right font-medium">{{ item.mass.toFixed(1) }}</td>
              <td class="px-3 py-3 text-right">{{ item.rate.toLocaleString() }}</td>
              <td class="px-3 py-3 text-right font-medium">{{ item.amount.toLocaleString() }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="border-t-2 border-[#1e293b] font-semibold bg-[#f8fafc]">
              <td colspan="5" class="px-3 py-3">ИТОГО</td>
              <td class="px-3 py-3 text-right">{{ selectedTotalMass.toFixed(1) }}</td>
              <td class="px-3 py-3"></td>
              <td class="px-3 py-3 text-right">{{ selectedTotal.toLocaleString() }}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
    </template>
  </DashboardLayout>
</template>
