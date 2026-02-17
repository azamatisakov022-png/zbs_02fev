<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import { AppButton, AppBadge } from '../../components/ui'
import { recyclerStore, type Recycler, type RecyclerCapacity, type InspectionStatus, type RecyclerDocument } from '../../stores/recyclers'
import { productGroups } from '../../data/product-groups'
import { generatedSubgroups } from '../../data/product-subgroups-generated'
import { useEcoOperatorMenu } from '../../composables/useRoleMenu'
import { toastStore } from '../../stores/toast'
import 'leaflet/dist/leaflet.css'
import { LMap, LTileLayer, LMarker, LPopup } from '@vue-leaflet/vue-leaflet'
import L from 'leaflet'

const route = useRoute()
const router = useRouter()
const { roleTitle, menuItems } = useEcoOperatorMenu()

// Get recycler by route param
const recyclerId = computed(() => Number(route.params.id))
const recycler = computed<Recycler | undefined>(() => recyclerStore.getRecyclerById(recyclerId.value))

// Helper functions
const getGroupLabel = (value: string): string => {
  return productGroups.find(g => g.value === value)?.label || value
}

const getStatusLabel = (status: string): string => recyclerStore.getStatusLabel(status as any)

const getStatusClass = (status: string): string => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800'
    case 'suspended': return 'bg-yellow-100 text-yellow-800'
    case 'revoked': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getLoadColor = (percent: number): string => {
  if (percent >= 90) return '#EF4444'
  if (percent >= 70) return '#F59E0B'
  return '#10B981'
}

// --- Accepted waste history (mock data) ---
interface AcceptedWasteEntry {
  date: string
  payer: string
  group: string
  volume: number
  actNumber: string
}

const acceptedWasteAllMap: Record<number, AcceptedWasteEntry[]> = {
  1: [
    { date: '15.01.2026', payer: 'ОсОО «БишкекПласт»', group: 'group_6', volume: 12.5, actNumber: 'АП-2026-0001' },
    { date: '12.01.2026', payer: 'ОсОО «ПакетСервис»', group: 'group_6', volume: 8.3, actNumber: 'АП-2026-0002' },
    { date: '08.01.2026', payer: 'ОсОО «КыргызТара»', group: 'group_7', volume: 15.0, actNumber: 'АП-2026-0003' },
    { date: '28.12.2025', payer: 'ОсОО «ФудПак»', group: 'group_19', volume: 6.7, actNumber: 'АП-2025-0145' },
    { date: '20.12.2025', payer: 'ОсОО «АзияТрейд»', group: 'group_1', volume: 4.2, actNumber: 'АП-2025-0144' },
    { date: '15.12.2025', payer: 'ОсОО «БишкекПласт»', group: 'group_6', volume: 10.1, actNumber: 'АП-2025-0143' },
    { date: '10.12.2025', payer: 'ОсОО «ПолиМир»', group: 'group_7', volume: 22.5, actNumber: 'АП-2025-0142' },
    { date: '01.12.2025', payer: 'ОсОО «ТоварСервис»', group: 'group_2', volume: 3.8, actNumber: 'АП-2025-0141' },
    { date: '25.11.2025', payer: 'ОсОО «КыргызТара»', group: 'group_20', volume: 5.4, actNumber: 'АП-2025-0140' },
    { date: '18.11.2025', payer: 'ОсОО «ПакетСервис»', group: 'group_6', volume: 9.0, actNumber: 'АП-2025-0139' },
    { date: '10.11.2025', payer: 'ОсОО «АзияТрейд»', group: 'group_19', volume: 7.3, actNumber: 'АП-2025-0138' },
    { date: '01.11.2025', payer: 'ОсОО «БишкекПласт»', group: 'group_6', volume: 14.8, actNumber: 'АП-2025-0137' },
    { date: '20.10.2025', payer: 'ОсОО «ФудПак»', group: 'group_7', volume: 11.2, actNumber: 'АП-2025-0136' },
    { date: '05.08.2025', payer: 'ОсОО «ТоварСервис»', group: 'group_1', volume: 2.5, actNumber: 'АП-2025-0120' },
    { date: '15.06.2025', payer: 'ОсОО «ПолиМир»', group: 'group_6', volume: 18.0, actNumber: 'АП-2025-0098' },
  ],
  2: [
    { date: '14.01.2026', payer: 'ОсОО «ТехноСервис»', group: 'group_9', volume: 2.1, actNumber: 'АП-2026-0010' },
    { date: '10.01.2026', payer: 'ОсОО «КомпьютерМаркет»', group: 'group_9', volume: 3.5, actNumber: 'АП-2026-0011' },
    { date: '05.01.2026', payer: 'ОсОО «ЭлектроДом»', group: 'group_10', volume: 4.8, actNumber: 'АП-2026-0012' },
    { date: '28.12.2025', payer: 'ОсОО «БишкекЭлектро»', group: 'group_11', volume: 1.2, actNumber: 'АП-2025-0200' },
    { date: '20.12.2025', payer: 'ОсОО «ТехноСервис»', group: 'group_13', volume: 0.8, actNumber: 'АП-2025-0199' },
    { date: '15.12.2025', payer: 'ОсОО «Мегаком»', group: 'group_16', volume: 2.3, actNumber: 'АП-2025-0198' },
    { date: '10.12.2025', payer: 'ОсОО «КомпьютерМаркет»', group: 'group_9', volume: 5.0, actNumber: 'АП-2025-0197' },
    { date: '01.12.2025', payer: 'ОсОО «ЭлектроДом»', group: 'group_10', volume: 3.2, actNumber: 'АП-2025-0196' },
    { date: '20.11.2025', payer: 'ОсОО «БишкекЭлектро»', group: 'group_11', volume: 1.5, actNumber: 'АП-2025-0195' },
    { date: '10.11.2025', payer: 'ОсОО «Мегаком»', group: 'group_16', volume: 1.8, actNumber: 'АП-2025-0194' },
    { date: '25.10.2025', payer: 'ОсОО «ТехноСервис»', group: 'group_9', volume: 4.1, actNumber: 'АП-2025-0193' },
    { date: '15.09.2025', payer: 'ОсОО «КомпьютерМаркет»', group: 'group_13', volume: 0.6, actNumber: 'АП-2025-0180' },
  ],
  3: [
    { date: '13.01.2026', payer: 'ОсОО «ПолиМир»', group: 'group_6', volume: 25.0, actNumber: 'АП-2026-0020' },
    { date: '09.01.2026', payer: 'ОсОО «КыргызТара»', group: 'group_7', volume: 18.5, actNumber: 'АП-2026-0021' },
    { date: '03.01.2026', payer: 'ОсОО «БишкекПласт»', group: 'group_6', volume: 30.2, actNumber: 'АП-2026-0022' },
    { date: '27.12.2025', payer: 'ОсОО «ФудПак»', group: 'group_19', volume: 12.0, actNumber: 'АП-2025-0250' },
    { date: '20.12.2025', payer: 'ОсОО «ПакетСервис»', group: 'group_6', volume: 22.8, actNumber: 'АП-2025-0249' },
    { date: '15.12.2025', payer: 'ОсОО «ПолиМир»', group: 'group_7', volume: 16.4, actNumber: 'АП-2025-0248' },
    { date: '08.12.2025', payer: 'ОсОО «КыргызТара»', group: 'group_6', volume: 28.0, actNumber: 'АП-2025-0247' },
    { date: '01.12.2025', payer: 'ОсОО «БишкекПласт»', group: 'group_19', volume: 9.5, actNumber: 'АП-2025-0246' },
    { date: '22.11.2025', payer: 'ОсОО «ФудПак»', group: 'group_7', volume: 20.1, actNumber: 'АП-2025-0245' },
    { date: '15.11.2025', payer: 'ОсОО «ПакетСервис»', group: 'group_6', volume: 35.0, actNumber: 'АП-2025-0244' },
    { date: '01.10.2025', payer: 'ОсОО «ПолиМир»', group: 'group_6', volume: 19.3, actNumber: 'АП-2025-0230' },
    { date: '15.07.2025', payer: 'ОсОО «КыргызТара»', group: 'group_7', volume: 14.7, actNumber: 'АП-2025-0200' },
  ],
  4: [
    { date: '12.01.2026', payer: 'ОсОО «МеталлТрейд»', group: 'group_23', volume: 35.0, actNumber: 'АП-2026-0030' },
    { date: '08.01.2026', payer: 'ОсОО «АккумСервис»', group: 'group_12', volume: 8.5, actNumber: 'АП-2026-0031' },
    { date: '03.01.2026', payer: 'ОсОО «БишкекМеталл»', group: 'group_23', volume: 42.0, actNumber: 'АП-2026-0032' },
    { date: '26.12.2025', payer: 'ОсОО «АвтоПарт»', group: 'group_13', volume: 5.2, actNumber: 'АП-2025-0300' },
    { date: '18.12.2025', payer: 'ОсОО «МеталлТрейд»', group: 'group_23', volume: 28.5, actNumber: 'АП-2025-0299' },
    { date: '12.12.2025', payer: 'ОсОО «АккумСервис»', group: 'group_12', volume: 6.8, actNumber: 'АП-2025-0298' },
    { date: '05.12.2025', payer: 'ОсОО «БишкекМеталл»', group: 'group_13', volume: 4.0, actNumber: 'АП-2025-0297' },
    { date: '28.11.2025', payer: 'ОсОО «АвтоПарт»', group: 'group_23', volume: 20.0, actNumber: 'АП-2025-0296' },
    { date: '20.11.2025', payer: 'ОсОО «МеталлТрейд»', group: 'group_12', volume: 10.3, actNumber: 'АП-2025-0295' },
    { date: '10.10.2025', payer: 'ОсОО «АккумСервис»', group: 'group_23', volume: 15.0, actNumber: 'АП-2025-0280' },
    { date: '20.08.2025', payer: 'ОсОО «БишкекМеталл»', group: 'group_23', volume: 38.0, actNumber: 'АП-2025-0260' },
  ],
  5: [
    { date: '11.01.2026', payer: 'ОсОО «СтеклоТара»', group: 'group_8', volume: 18.0, actNumber: 'АП-2026-0040' },
    { date: '06.01.2026', payer: 'ОсОО «НапиткиКР»', group: 'group_8', volume: 22.5, actNumber: 'АП-2026-0041' },
    { date: '30.12.2025', payer: 'ОсОО «ТокмокСтекло»', group: 'group_22', volume: 8.0, actNumber: 'АП-2025-0310' },
    { date: '22.12.2025', payer: 'ОсОО «СтеклоТара»', group: 'group_8', volume: 15.3, actNumber: 'АП-2025-0309' },
    { date: '15.12.2025', payer: 'ОсОО «НапиткиКР»', group: 'group_8', volume: 20.0, actNumber: 'АП-2025-0308' },
    { date: '08.12.2025', payer: 'ОсОО «ТокмокСтекло»', group: 'group_22', volume: 5.5, actNumber: 'АП-2025-0307' },
    { date: '01.12.2025', payer: 'ОсОО «СтеклоТара»', group: 'group_8', volume: 12.8, actNumber: 'АП-2025-0306' },
    { date: '20.11.2025', payer: 'ОсОО «НапиткиКР»', group: 'group_8', volume: 19.0, actNumber: 'АП-2025-0305' },
    { date: '10.11.2025', payer: 'ОсОО «ТокмокСтекло»', group: 'group_22', volume: 6.2, actNumber: 'АП-2025-0304' },
    { date: '15.09.2025', payer: 'ОсОО «СтеклоТара»', group: 'group_8', volume: 25.0, actNumber: 'АП-2025-0280' },
  ],
  6: [
    { date: '10.01.2026', payer: 'ОсОО «АвтоПарт»', group: 'group_4', volume: 14.0, actNumber: 'АП-2026-0050' },
    { date: '05.01.2026', payer: 'ОсОО «ШинСервис»', group: 'group_4', volume: 20.5, actNumber: 'АП-2026-0051' },
    { date: '02.01.2026', payer: 'ОсОО «АвтоМасла»', group: 'group_3', volume: 8.0, actNumber: 'АП-2026-0052' },
    { date: '28.12.2025', payer: 'ОсОО «АвтоПарт»', group: 'group_5', volume: 5.5, actNumber: 'АП-2025-0350' },
    { date: '20.12.2025', payer: 'ОсОО «ШинСервис»', group: 'group_4', volume: 18.0, actNumber: 'АП-2025-0349' },
    { date: '15.12.2025', payer: 'ОсОО «АвтоМасла»', group: 'group_3', volume: 10.2, actNumber: 'АП-2025-0348' },
    { date: '10.12.2025', payer: 'ОсОО «ФильтрПром»', group: 'group_18', volume: 3.0, actNumber: 'АП-2025-0347' },
    { date: '01.12.2025', payer: 'ОсОО «АвтоПарт»', group: 'group_4', volume: 16.5, actNumber: 'АП-2025-0346' },
    { date: '22.11.2025', payer: 'ОсОО «ШинСервис»', group: 'group_5', volume: 7.8, actNumber: 'АП-2025-0345' },
    { date: '15.11.2025', payer: 'ОсОО «АвтоМасла»', group: 'group_3', volume: 9.5, actNumber: 'АП-2025-0344' },
    { date: '05.11.2025', payer: 'ОсОО «ФильтрПром»', group: 'group_18', volume: 2.8, actNumber: 'АП-2025-0343' },
    { date: '20.09.2025', payer: 'ОсОО «АвтоПарт»', group: 'group_4', volume: 12.0, actNumber: 'АП-2025-0320' },
    { date: '10.07.2025', payer: 'ОсОО «ШинСервис»', group: 'group_4', volume: 25.0, actNumber: 'АП-2025-0290' },
  ],
  7: [
    { date: '08.01.2026', payer: 'ОсОО «ОшТекстиль»', group: 'group_5', volume: 0, actNumber: 'АП-2026-0060' },
    { date: '15.12.2025', payer: 'ОсОО «ОшТекстиль»', group: 'group_5', volume: 0, actNumber: 'АП-2025-0400' },
    { date: '10.05.2025', payer: 'ОсОО «ТканьСервис»', group: 'group_5', volume: 8.5, actNumber: 'АП-2025-0150' },
    { date: '20.04.2025', payer: 'ОсОО «ОшТекстиль»', group: 'group_5', volume: 12.0, actNumber: 'АП-2025-0140' },
    { date: '10.03.2025', payer: 'ОсОО «ТканьСервис»', group: 'group_5', volume: 6.3, actNumber: 'АП-2025-0120' },
    { date: '15.02.2025', payer: 'ОсОО «ОшТекстиль»', group: 'group_5', volume: 10.0, actNumber: 'АП-2025-0100' },
    { date: '20.01.2025', payer: 'ОсОО «ТканьСервис»', group: 'group_5', volume: 9.2, actNumber: 'АП-2025-0080' },
    { date: '10.12.2024', payer: 'ОсОО «ОшТекстиль»', group: 'group_5', volume: 7.8, actNumber: 'АП-2024-0900' },
    { date: '25.11.2024', payer: 'ОсОО «ТканьСервис»', group: 'group_5', volume: 11.5, actNumber: 'АП-2024-0880' },
    { date: '15.10.2024', payer: 'ОсОО «ОшТекстиль»', group: 'group_5', volume: 5.0, actNumber: 'АП-2024-0850' },
  ],
  8: [
    { date: '05.01.2026', payer: 'ОсОО «БишкекСтрой»', group: 'group_24', volume: 0, actNumber: 'АП-2026-0070' },
    { date: '20.12.2025', payer: 'ОсОО «СтройМатериал»', group: 'group_24', volume: 0, actNumber: 'АП-2025-0450' },
    { date: '10.03.2025', payer: 'ОсОО «БишкекСтрой»', group: 'group_24', volume: 45.0, actNumber: 'АП-2025-0130' },
    { date: '20.02.2025', payer: 'ОсОО «СтройМатериал»', group: 'group_24', volume: 60.0, actNumber: 'АП-2025-0110' },
    { date: '15.01.2025', payer: 'ОсОО «БишкекСтрой»', group: 'group_24', volume: 38.5, actNumber: 'АП-2025-0090' },
    { date: '10.12.2024', payer: 'ОсОО «СтройМатериал»', group: 'group_24', volume: 55.0, actNumber: 'АП-2024-0910' },
    { date: '20.11.2024', payer: 'ОсОО «БишкекСтрой»', group: 'group_24', volume: 42.0, actNumber: 'АП-2024-0890' },
    { date: '15.10.2024', payer: 'ОсОО «СтройМатериал»', group: 'group_24', volume: 50.5, actNumber: 'АП-2024-0860' },
    { date: '10.09.2024', payer: 'ОсОО «БишкекСтрой»', group: 'group_24', volume: 30.0, actNumber: 'АП-2024-0830' },
    { date: '05.08.2024', payer: 'ОсОО «СтройМатериал»', group: 'group_24', volume: 48.0, actNumber: 'АП-2024-0800' },
  ],
}

// Filters for accepted waste
const periodFilter = ref('all')
const groupFilter = ref('')
const currentPage = ref(1)
const perPage = 10

// Parse date string DD.MM.YYYY to Date
const parseDate = (dateStr: string): Date => {
  const parts = dateStr.split('.')
  return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]))
}

const filteredWaste = computed(() => {
  const all = acceptedWasteAllMap[recyclerId.value] || []
  let result = [...all]

  // Period filter
  if (periodFilter.value !== 'all') {
    const now = new Date(2026, 0, 17) // reference date
    let cutoff: Date
    switch (periodFilter.value) {
      case '3m':
        cutoff = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
        break
      case '6m':
        cutoff = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate())
        break
      case '1y':
        cutoff = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
        break
      default:
        cutoff = new Date(2000, 0, 1)
    }
    result = result.filter(entry => parseDate(entry.date) >= cutoff)
  }

  // Group filter
  if (groupFilter.value) {
    result = result.filter(entry => entry.group === groupFilter.value)
  }

  return result
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredWaste.value.length / perPage)))

const paginatedWaste = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return filteredWaste.value.slice(start, start + perPage)
})

const totalVolume = computed(() => {
  return filteredWaste.value.reduce((sum, entry) => sum + entry.volume, 0)
})

const pageNumbers = computed(() => {
  const pages: number[] = []
  for (let i = 1; i <= totalPages.value; i++) {
    pages.push(i)
  }
  return pages
})

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

// Reset page when filters change
const onPeriodChange = () => { currentPage.value = 1 }
const onGroupChange = () => { currentPage.value = 1 }

// Edit mode for capacities
const isEditingCapacities = ref(false)

const technologyOptions = [
  'Механическая переработка',
  'Термическая переработка',
  'Экструзия вторсырья',
  'Прессование и пакетирование',
  'Роспуск и прессование',
  'Химическая переработка',
  'Компостирование',
  'Пиролиз',
  'Измельчение (шредирование)',
  'Сортировка',
  'Грануляция',
  'Другое',
]

interface EditCapacityRow {
  id: number
  group: string
  subgroup: string
  technologies: string[]
  customTechnology: string
  capacityTons: number
  documentName: string
}

/** Parse stored technology string into array of known options */
const parseTechnologies = (raw: string): { techs: string[], custom: string } => {
  if (!raw) return { techs: [], custom: '' }
  const parts = raw.split(' | ').map(s => s.trim()).filter(Boolean)
  const techs: string[] = []
  let custom = ''
  for (const p of parts) {
    if (technologyOptions.includes(p) && p !== 'Другое') {
      techs.push(p)
    } else {
      if (!techs.includes('Другое')) techs.push('Другое')
      custom = p
    }
  }
  return { techs, custom }
}

/** Build technology string for saving */
const buildTechnologyString = (row: EditCapacityRow): string => {
  const parts = row.technologies.filter(t => t !== 'Другое')
  if (row.technologies.includes('Другое') && row.customTechnology.trim()) {
    parts.push(row.customTechnology.trim())
  }
  return parts.join(' | ')
}

const openTechDropdown = ref<number | null>(null)

const toggleTech = (row: EditCapacityRow, tech: string) => {
  const idx = row.technologies.indexOf(tech)
  if (idx >= 0) {
    row.technologies.splice(idx, 1)
    if (tech === 'Другое') row.customTechnology = ''
  } else {
    row.technologies.push(tech)
  }
}

const removeTech = (row: EditCapacityRow, tech: string) => {
  const idx = row.technologies.indexOf(tech)
  if (idx >= 0) {
    row.technologies.splice(idx, 1)
    if (tech === 'Другое') row.customTechnology = ''
  }
}

const getDisplayTechs = (row: EditCapacityRow): string[] => {
  return row.technologies.filter(t => t !== 'Другое').slice(0, 2)
}

const getExtraCount = (row: EditCapacityRow): number => {
  const visible = row.technologies.filter(t => t !== 'Другое')
  return Math.max(0, visible.length - 2)
}

const editRows = ref<EditCapacityRow[]>([])
let editNextRowId = 1

const startEditCapacities = () => {
  // Pre-populate from current recycler
  if (!recycler.value) return
  editRows.value = recycler.value.capacities.map((cap, idx) => {
    const rawTech = recycler.value?.technologies?.[cap.wasteType] || ''
    const parsed = parseTechnologies(rawTech)
    return {
      id: editNextRowId++,
      group: cap.wasteType,
      subgroup: '',
      technologies: parsed.techs,
      customTechnology: parsed.custom,
      capacityTons: cap.capacityTons,
      documentName: '',
    }
  })
  isEditingCapacities.value = true
}

const cancelEditCapacities = () => {
  isEditingCapacities.value = false
  editRows.value = []
}

const addEditRow = () => {
  editRows.value.push({ id: editNextRowId++, group: '', subgroup: '', technologies: [], customTechnology: '', capacityTons: 0, documentName: '' })
}

const removeEditRow = (id: number) => {
  editRows.value = editRows.value.filter(r => r.id !== id)
}

const getSubgroups = (groupValue: string) => generatedSubgroups[groupValue] || []

const editTotalCapacity = computed(() => editRows.value.reduce((s, r) => s + (r.capacityTons || 0), 0))

const saveCapacityEdits = () => {
  if (!recycler.value) return
  const validRows = editRows.value.filter(r => r.group && r.capacityTons > 0)
  if (validRows.length === 0) { toastStore.show({ type: 'warning', title: 'Ошибка валидации', message: 'Добавьте хотя бы одну мощность с указанной группой и объёмом > 0' }); return }

  const newCapacities = validRows.map(r => ({
    wasteType: r.group,
    capacityTons: r.capacityTons,
    currentLoadTons: recycler.value!.capacities.find(c => c.wasteType === r.group)?.currentLoadTons || 0,
  }))
  const newWasteTypes = [...new Set(validRows.map(r => r.group))]
  const newTechnologies: Record<string, string> = {}
  validRows.forEach(r => {
    const tech = buildTechnologyString(r)
    if (tech) newTechnologies[r.group] = tech
  })

  recyclerStore.updateRecycler(recyclerId.value, { capacities: newCapacities, wasteTypes: newWasteTypes, technologies: newTechnologies })
  isEditingCapacities.value = false
  editRows.value = []
}

// Capacity change history (mock)
const showHistory = ref(false)

interface CapacityChange {
  date: string
  group: string
  oldValue: number
  newValue: number
  changedBy: string
}

const capacityHistoryMap: Record<number, CapacityChange[]> = {
  1: [
    { date: '10.01.2025', group: 'group_6', oldValue: 400, newValue: 500, changedBy: 'Касымов Н.Б.' },
    { date: '15.06.2024', group: 'group_7', oldValue: 250, newValue: 300, changedBy: 'Касымов Н.Б.' },
    { date: '20.03.2024', group: 'group_19', oldValue: 200, newValue: 150, changedBy: 'Исманова Д.А.' },
    { date: '05.11.2023', group: 'group_1', oldValue: 0, newValue: 100, changedBy: 'Касымов Н.Б.' },
    { date: '01.04.2023', group: 'group_6', oldValue: 300, newValue: 400, changedBy: 'Исманова Д.А.' },
  ],
  2: [
    { date: '20.02.2025', group: 'group_9', oldValue: 150, newValue: 200, changedBy: 'Ибраимова А.С.' },
    { date: '10.09.2024', group: 'group_10', oldValue: 180, newValue: 150, changedBy: 'Исманова Д.А.' },
    { date: '05.05.2024', group: 'group_11', oldValue: 100, newValue: 120, changedBy: 'Ибраимова А.С.' },
    { date: '15.01.2024', group: 'group_16', oldValue: 0, newValue: 80, changedBy: 'Ибраимова А.С.' },
  ],
  3: [
    { date: '01.03.2025', group: 'group_6', oldValue: 700, newValue: 800, changedBy: 'Чотбаев А.У.' },
    { date: '15.10.2024', group: 'group_7', oldValue: 350, newValue: 400, changedBy: 'Чотбаев А.У.' },
    { date: '20.06.2024', group: 'group_19', oldValue: 300, newValue: 250, changedBy: 'Исманова Д.А.' },
    { date: '10.02.2024', group: 'group_6', oldValue: 600, newValue: 700, changedBy: 'Чотбаев А.У.' },
    { date: '01.09.2023', group: 'group_7', oldValue: 300, newValue: 350, changedBy: 'Исманова Д.А.' },
  ],
  4: [
    { date: '05.01.2025', group: 'group_23', oldValue: 500, newValue: 600, changedBy: 'Бактыгулов Э.Ж.' },
    { date: '20.08.2024', group: 'group_12', oldValue: 120, newValue: 100, changedBy: 'Исманова Д.А.' },
    { date: '10.03.2024', group: 'group_13', oldValue: 0, newValue: 80, changedBy: 'Бактыгулов Э.Ж.' },
  ],
  5: [
    { date: '12.02.2025', group: 'group_8', oldValue: 350, newValue: 400, changedBy: 'Сыдыков Б.К.' },
    { date: '01.07.2024', group: 'group_22', oldValue: 100, newValue: 150, changedBy: 'Сыдыков Б.К.' },
    { date: '15.11.2023', group: 'group_8', oldValue: 300, newValue: 350, changedBy: 'Исманова Д.А.' },
  ],
  6: [
    { date: '25.01.2025', group: 'group_4', oldValue: 300, newValue: 350, changedBy: 'Маматов А.Р.' },
    { date: '10.08.2024', group: 'group_3', oldValue: 200, newValue: 180, changedBy: 'Исманова Д.А.' },
    { date: '05.04.2024', group: 'group_5', oldValue: 0, newValue: 120, changedBy: 'Маматов А.Р.' },
  ],
  7: [
    { date: '20.04.2024', group: 'group_5', oldValue: 200, newValue: 250, changedBy: 'Жумабаев Н.К.' },
    { date: '10.01.2024', group: 'group_5', oldValue: 150, newValue: 200, changedBy: 'Исманова Д.А.' },
  ],
  8: [
    { date: '15.03.2024', group: 'group_24', oldValue: 400, newValue: 500, changedBy: 'Токтосунов М.А.' },
    { date: '01.10.2023', group: 'group_24', oldValue: 350, newValue: 400, changedBy: 'Исманова Д.А.' },
    { date: '20.05.2023', group: 'group_24', oldValue: 300, newValue: 350, changedBy: 'Токтосунов М.А.' },
  ],
}

const capacityHistory = computed(() => capacityHistoryMap[recyclerId.value] || [])

// Mini-map marker icon
const mapMarkerIcon = computed(() => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color:#2563eb;width:28px;height:28px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  })
})

const goToGisMap = () => {
  if (recycler.value?.coordinates) {
    router.push({ path: '/registries', query: { lat: String(recycler.value.coordinates.lat), lng: String(recycler.value.coordinates.lng), zoom: '15' } })
  }
}
</script>

<template>
  <DashboardLayout
    role="eco-operator"
    :roleTitle="roleTitle"
    userName="Исманова Динара"
    :menuItems="menuItems"
  >
    <!-- Not found state -->
    <div v-if="!recycler" class="text-center py-20">
      <div class="w-16 h-16 bg-[#fee2e2] rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-[#ef4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h2 class="text-xl font-semibold text-[#1e293b] mb-2">Переработчик не найден</h2>
      <p class="text-[#64748b] mb-6">Переработчик с указанным ID не существует в реестре.</p>
      <button @click="router.push('/eco-operator/recyclers')" class="px-6 py-2.5 bg-[#22C55E] text-white rounded-lg font-medium hover:bg-[#16a34a] transition-colors">
        Вернуться в реестр
      </button>
    </div>

    <!-- Main content -->
    <div v-else class="space-y-6">
      <!-- Back button -->
      <button @click="router.push('/eco-operator/recyclers')" class="flex items-center gap-2 text-[#64748b] hover:text-[#1e293b] mb-6 transition-colors">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        <span class="font-medium">Реестр переработчиков</span>
      </button>

      <!-- Header card -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-[#e2e8f0]">
        <div class="flex items-start justify-between flex-wrap gap-4">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 bg-[#f0fdf4] rounded-full flex items-center justify-center flex-shrink-0">
              <svg class="w-8 h-8 text-[#22C55E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-[#1e293b]">{{ recycler.name }}</h1>
              <p class="text-sm text-[#64748b] mt-1">{{ recycler.opf }} | ИНН: {{ recycler.inn }}</p>
            </div>
          </div>
          <div class="text-right flex flex-col items-end gap-2">
            <span :class="['inline-flex items-center px-3 py-1 rounded-full text-sm font-medium', getStatusClass(recycler.status)]">
              {{ getStatusLabel(recycler.status) }}
            </span>
            <p class="text-sm text-[#64748b]">Зарегистрирован: {{ recycler.addedDate }}</p>
          </div>
        </div>
      </div>

      <!-- BLOCK 1 - Общая информация -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-[#e2e8f0]">
        <h2 class="text-lg font-semibold text-[#1e293b] mb-4">Общая информация</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="bg-[#f8fafc] rounded-lg p-3">
            <p class="text-sm text-[#64748b]">Полное наименование</p>
            <p class="text-sm font-medium text-[#1e293b]">{{ recycler.fullName || recycler.name }}</p>
          </div>
          <div class="bg-[#f8fafc] rounded-lg p-3">
            <p class="text-sm text-[#64748b]">ОПФ</p>
            <p class="text-sm font-medium text-[#1e293b]">{{ recycler.opf }} — Общество с ограниченной ответственностью</p>
          </div>
          <div class="bg-[#f8fafc] rounded-lg p-3">
            <p class="text-sm text-[#64748b]">ИНН</p>
            <p class="text-sm font-medium text-[#1e293b] font-mono">{{ recycler.inn }}</p>
          </div>
          <div class="bg-[#f8fafc] rounded-lg p-3">
            <p class="text-sm text-[#64748b]">Юридический адрес</p>
            <p class="text-sm font-medium text-[#1e293b]">{{ recycler.legalAddress || recycler.address }}</p>
          </div>
          <div class="bg-[#f8fafc] rounded-lg p-3">
            <p class="text-sm text-[#64748b]">Фактический адрес</p>
            <p class="text-sm font-medium text-[#1e293b]">{{ recycler.actualAddress || recycler.address }}</p>
          </div>
          <div class="bg-[#f8fafc] rounded-lg p-3">
            <p class="text-sm text-[#64748b]">Телефон</p>
            <p class="text-sm font-medium text-[#1e293b]">{{ recycler.contactPhone }}</p>
          </div>
          <div class="bg-[#f8fafc] rounded-lg p-3">
            <p class="text-sm text-[#64748b]">Email</p>
            <p class="text-sm font-medium text-[#2563eb]">{{ recycler.contactEmail }}</p>
          </div>
          <div class="bg-[#f8fafc] rounded-lg p-3">
            <p class="text-sm text-[#64748b]">Веб-сайт</p>
            <p class="text-sm font-medium text-[#1e293b]">{{ recycler.website || '—' }}</p>
          </div>
          <div class="bg-[#f8fafc] rounded-lg p-3">
            <p class="text-sm text-[#64748b]">Руководитель</p>
            <p class="text-sm font-medium text-[#1e293b]">{{ recycler.directorName || '—' }}</p>
            <p class="text-xs text-[#64748b]" v-if="recycler.directorPosition">{{ recycler.directorPosition }}</p>
          </div>
          <div class="bg-[#f8fafc] rounded-lg p-3" v-if="recycler.contactPerson">
            <p class="text-sm text-[#64748b]">Контактное лицо</p>
            <p class="text-sm font-medium text-[#1e293b]">{{ recycler.contactPerson }}</p>
            <p class="text-xs text-[#64748b]" v-if="recycler.contactPosition">{{ recycler.contactPosition }}</p>
          </div>
        </div>
      </div>

      <!-- BLOCK 2 - Лицензия и разрешения -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-[#e2e8f0]">
        <h2 class="text-lg font-semibold text-[#1e293b] mb-4">Лицензия и разрешения</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div class="bg-[#f8fafc] rounded-lg p-3">
            <p class="text-sm text-[#64748b]">Номер лицензии</p>
            <p class="text-sm font-medium text-[#1e293b] font-mono">{{ recycler.licenseNumber }}</p>
          </div>
          <div class="bg-[#f8fafc] rounded-lg p-3">
            <p class="text-sm text-[#64748b]">Дата выдачи</p>
            <p class="text-sm font-medium text-[#1e293b]">{{ recycler.licenseDate }}</p>
          </div>
          <div class="bg-[#f8fafc] rounded-lg p-3">
            <p class="text-sm text-[#64748b]">Срок действия</p>
            <p class="text-sm font-medium text-[#1e293b]">{{ recycler.licenseExpiry }}</p>
          </div>
          <div class="bg-[#f8fafc] rounded-lg p-3">
            <p class="text-sm text-[#64748b]">Статус лицензии</p>
            <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1', getStatusClass(recycler.status)]">
              {{ getStatusLabel(recycler.status) }}
            </span>
          </div>
        </div>

        <div class="bg-[#f8fafc] rounded-lg p-3 mb-4" v-if="recycler.licenseAuthority">
          <p class="text-sm text-[#64748b]">Орган выдачи</p>
          <p class="text-sm font-medium text-[#1e293b]">{{ recycler.licenseAuthority }}</p>
        </div>

        <div v-if="recycler.licenseActivities?.length">
          <p class="text-sm font-medium text-[#1e293b] mb-3">Виды разрешённой деятельности</p>
          <ul class="space-y-2">
            <li v-for="(activity, idx) in recycler.licenseActivities" :key="idx" class="flex items-start gap-2">
              <svg class="w-5 h-5 text-[#22C55E] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span class="text-sm text-[#1e293b]">{{ activity }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- BLOCK - Экологический паспорт -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-[#e2e8f0]" v-if="recycler.ecoPassportNumber">
        <h2 class="text-lg font-semibold text-[#1e293b] mb-4">Экологический паспорт</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="bg-[#f8fafc] rounded-lg p-3">
            <p class="text-sm text-[#64748b]">Номер паспорта</p>
            <p class="text-sm font-medium text-[#1e293b] font-mono">{{ recycler.ecoPassportNumber }}</p>
          </div>
          <div class="bg-[#f8fafc] rounded-lg p-3">
            <p class="text-sm text-[#64748b]">Дата выдачи</p>
            <p class="text-sm font-medium text-[#1e293b]">{{ recycler.ecoPassportDate }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-[#e2e8f0]" v-else>
        <h2 class="text-lg font-semibold text-[#1e293b] mb-4">Экологический паспорт</h2>
        <div class="flex items-center gap-3 p-4 bg-[#fef3c7] rounded-lg border border-[#fbbf24]">
          <svg class="w-5 h-5 text-[#f59e0b] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span class="text-sm text-[#92400e]">Экологический паспорт не оформлен</span>
        </div>
      </div>

      <!-- BLOCK - Производственные данные -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-[#e2e8f0]">
        <h2 class="text-lg font-semibold text-[#1e293b] mb-4">Производственные данные</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div class="bg-[#f8fafc] rounded-lg p-3" v-if="recycler.equipment">
            <p class="text-sm text-[#64748b]">Оборудование</p>
            <p class="text-sm font-medium text-[#1e293b]">{{ recycler.equipment }}</p>
          </div>
          <div class="bg-[#f8fafc] rounded-lg p-3" v-if="recycler.productionArea">
            <p class="text-sm text-[#64748b]">Площадь территории</p>
            <p class="text-sm font-medium text-[#1e293b]">{{ recycler.productionArea.toLocaleString() }} м²</p>
          </div>
          <div class="bg-[#f8fafc] rounded-lg p-3">
            <p class="text-sm text-[#64748b]">Количество сотрудников</p>
            <p class="text-sm font-medium text-[#1e293b]">{{ recycler.employeesCount || '—' }}</p>
          </div>
          <div class="bg-[#f8fafc] rounded-lg p-3" v-if="recycler.certifications.length > 0">
            <p class="text-sm text-[#64748b]">Сертификаты</p>
            <div class="flex flex-wrap gap-1 mt-1">
              <span v-for="cert in recycler.certifications" :key="cert" class="inline-block px-2 py-0.5 bg-[#dbeafe] text-[#1d4ed8] rounded text-xs font-medium">{{ cert }}</span>
            </div>
          </div>
          <div class="bg-[#f8fafc] rounded-lg p-3" v-if="recycler.processingMethods.length > 0">
            <p class="text-sm text-[#64748b]">Методы переработки</p>
            <div class="flex flex-wrap gap-1 mt-1">
              <span v-for="method in recycler.processingMethods" :key="method" class="inline-block px-2 py-0.5 bg-[#f0fdf4] text-[#166534] rounded text-xs font-medium">{{ method }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- BLOCK 3 - Мощности переработки -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-[#e2e8f0]">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-[#1e293b]">Мощности переработки</h2>
          <button
            v-if="!isEditingCapacities"
            @click="startEditCapacities"
            class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#22C55E] rounded-lg hover:bg-[#16a34a] transition-colors"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Редактировать мощности
          </button>
        </div>

        <!-- Read-only table (when not editing) -->
        <div v-if="!isEditingCapacities" class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-[#64748b] bg-[#f8fafc] border-b border-[#e2e8f0]">
                <th class="px-4 py-3 font-medium">Группа отходов</th>
                <th class="px-4 py-3 font-medium">Технология переработки</th>
                <th class="px-4 py-3 font-medium text-right">Мощность (т/год)</th>
                <th class="px-4 py-3 font-medium text-right">Загрузка (т/год)</th>
                <th class="px-4 py-3 font-medium text-right">Свободно (т/год)</th>
                <th class="px-4 py-3 font-medium" style="min-width: 160px">Загруженность (%)</th>
              </tr>
            </thead>
            <tbody class="text-[#1e293b]">
              <tr v-for="cap in recycler.capacities" :key="cap.wasteType" class="border-t border-[#e2e8f0] hover:bg-[#f8fafc]">
                <td class="px-4 py-3">{{ getGroupLabel(cap.wasteType) }}</td>
                <td class="px-4 py-3 text-[#64748b]">{{ recycler.technologies?.[cap.wasteType] || '—' }}</td>
                <td class="px-4 py-3 text-right font-mono">{{ cap.capacityTons }}</td>
                <td class="px-4 py-3 text-right font-mono">{{ cap.currentLoadTons }}</td>
                <td class="px-4 py-3 text-right font-mono" :style="{ color: (cap.capacityTons - cap.currentLoadTons) <= 0 ? '#EF4444' : '#059669' }">
                  {{ Math.max(0, cap.capacityTons - cap.currentLoadTons) }}
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <div class="flex-1 h-2 bg-[#f1f5f9] rounded-full overflow-hidden">
                      <div
                        class="h-full rounded-full transition-all"
                        :style="{
                          width: Math.min(cap.capacityTons > 0 ? Math.round((cap.currentLoadTons / cap.capacityTons) * 100) : 0, 100) + '%',
                          backgroundColor: getLoadColor(cap.capacityTons > 0 ? Math.round((cap.currentLoadTons / cap.capacityTons) * 100) : 0)
                        }"
                      ></div>
                    </div>
                    <span
                      class="text-xs font-medium min-w-[36px] text-right"
                      :style="{ color: getLoadColor(cap.capacityTons > 0 ? Math.round((cap.currentLoadTons / cap.capacityTons) * 100) : 0) }"
                    >
                      {{ cap.capacityTons > 0 ? Math.round((cap.currentLoadTons / cap.capacityTons) * 100) : 0 }}%
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="border-t-2 border-[#e2e8f0] bg-[#f8fafc] font-semibold text-[#1e293b]">
                <td class="px-4 py-3">Итого</td>
                <td class="px-4 py-3"></td>
                <td class="px-4 py-3 text-right font-mono">{{ recyclerStore.getTotalCapacity(recycler) }}</td>
                <td class="px-4 py-3 text-right font-mono">{{ recyclerStore.getTotalLoad(recycler) }}</td>
                <td class="px-4 py-3 text-right font-mono" :style="{ color: '#059669' }">
                  {{ recyclerStore.getTotalCapacity(recycler) - recyclerStore.getTotalLoad(recycler) }}
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <div class="flex-1 h-2 bg-[#f1f5f9] rounded-full overflow-hidden">
                      <div
                        class="h-full rounded-full transition-all"
                        :style="{
                          width: Math.min(recyclerStore.getLoadPercent(recycler), 100) + '%',
                          backgroundColor: getLoadColor(recyclerStore.getLoadPercent(recycler))
                        }"
                      ></div>
                    </div>
                    <span
                      class="text-xs font-medium min-w-[36px] text-right"
                      :style="{ color: getLoadColor(recyclerStore.getLoadPercent(recycler)) }"
                    >
                      {{ recyclerStore.getLoadPercent(recycler) }}%
                    </span>
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Edit form (when editing) -->
        <div v-else>
          <div class="bg-[#fffbeb] border border-[#fbbf24] rounded-lg p-3 mb-4 flex items-center gap-2">
            <svg class="w-5 h-5 text-[#f59e0b] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="text-sm text-[#92400e]">Режим редактирования мощностей. Внесите изменения и нажмите «Сохранить изменения».</span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="text-left text-[#64748b] bg-[#f8fafc] border-b border-[#e2e8f0]">
                  <th class="px-3 py-3 font-medium">Группа отходов</th>
                  <th class="px-3 py-3 font-medium">Подгруппа</th>
                  <th class="px-3 py-3 font-medium">Технология</th>
                  <th class="px-3 py-3 font-medium text-right" style="min-width: 130px">Мощность т/год</th>
                  <th class="px-3 py-3 font-medium">Документ</th>
                  <th class="px-3 py-3 font-medium w-10"></th>
                </tr>
              </thead>
              <tbody class="text-[#1e293b]">
                <tr v-for="row in editRows" :key="row.id" class="border-t border-[#e2e8f0]">
                  <td class="px-3 py-2">
                    <select
                      v-model="row.group"
                      class="w-full px-2.5 py-2 border border-[#e2e8f0] rounded-lg text-sm focus:outline-none focus:border-[#2563eb] bg-white"
                    >
                      <option value="" disabled>Выберите группу</option>
                      <option v-for="g in productGroups" :key="g.value" :value="g.value">{{ g.label }}</option>
                    </select>
                  </td>
                  <td class="px-3 py-2">
                    <select
                      v-model="row.subgroup"
                      :disabled="!row.group || getSubgroups(row.group).length === 0"
                      class="w-full px-2.5 py-2 border border-[#e2e8f0] rounded-lg text-sm focus:outline-none focus:border-[#2563eb] bg-white disabled:bg-[#f1f5f9] disabled:text-[#94a3b8]"
                    >
                      <option value="">Все подгруппы</option>
                      <option v-for="sg in getSubgroups(row.group)" :key="sg.value" :value="sg.value">{{ sg.label }}</option>
                    </select>
                  </td>
                  <td class="px-3 py-2" style="min-width: 220px">
                    <div class="relative" @click.stop>
                      <div
                        @click="openTechDropdown = openTechDropdown === row.id ? null : row.id"
                        class="w-full min-h-[38px] px-2 py-1.5 border rounded-lg text-sm cursor-pointer bg-white flex flex-wrap gap-1 items-center"
                        :class="openTechDropdown === row.id ? 'border-[#2563eb] ring-1 ring-[#2563eb]/20' : 'border-[#e2e8f0]'"
                      >
                        <template v-if="row.technologies.length === 0">
                          <span class="text-[#94a3b8] text-sm">Выберите технологии</span>
                        </template>
                        <template v-else>
                          <span
                            v-for="tech in getDisplayTechs(row)"
                            :key="tech"
                            class="inline-flex items-center gap-0.5 bg-[#eff6ff] text-[#2563eb] px-2 py-0.5 rounded text-xs leading-tight max-w-[180px]"
                          >
                            <span class="truncate">{{ tech }}</span>
                            <button type="button" @click.stop="removeTech(row, tech)" class="ml-0.5 text-[#2563eb]/60 hover:text-red-500 flex-shrink-0">&times;</button>
                          </span>
                          <span v-if="row.technologies.includes('Другое')" class="inline-flex items-center gap-0.5 bg-[#f0fdf4] text-[#16a34a] px-2 py-0.5 rounded text-xs leading-tight">
                            <span class="truncate">{{ row.customTechnology || 'Другое' }}</span>
                            <button type="button" @click.stop="removeTech(row, 'Другое')" class="ml-0.5 text-[#16a34a]/60 hover:text-red-500 flex-shrink-0">&times;</button>
                          </span>
                          <span v-if="getExtraCount(row) > 0" class="text-[#64748b] text-xs whitespace-nowrap">+{{ getExtraCount(row) }}</span>
                        </template>
                        <svg class="w-4 h-4 text-[#94a3b8] ml-auto flex-shrink-0 transition-transform" :class="openTechDropdown === row.id ? 'rotate-180' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      <div v-if="openTechDropdown === row.id" class="fixed inset-0 z-40" @click="openTechDropdown = null"></div>
                      <div v-if="openTechDropdown === row.id" class="absolute top-full left-0 mt-1 w-full bg-white border border-[#e2e8f0] rounded-lg shadow-lg z-50 max-h-[240px] overflow-y-auto py-1">
                        <label
                          v-for="opt in technologyOptions"
                          :key="opt"
                          class="flex items-center gap-2.5 px-3 py-2 hover:bg-[#f8fafc] cursor-pointer text-sm transition-colors"
                          @click.stop
                        >
                          <input
                            type="checkbox"
                            :checked="row.technologies.includes(opt)"
                            @change="toggleTech(row, opt)"
                            class="w-4 h-4 rounded border-[#d1d5db] text-[#2563eb] focus:ring-[#2563eb]/20"
                          />
                          <span :class="row.technologies.includes(opt) ? 'text-[#1e293b] font-medium' : 'text-[#4b5563]'">{{ opt }}</span>
                        </label>
                      </div>
                      <input
                        v-if="row.technologies.includes('Другое')"
                        v-model="row.customTechnology"
                        type="text"
                        placeholder="Укажите свою технологию"
                        class="w-full mt-1.5 px-2.5 py-2 border border-[#e2e8f0] rounded-lg text-sm focus:outline-none focus:border-[#2563eb]"
                        @click.stop
                      />
                    </div>
                  </td>
                  <td class="px-3 py-2">
                    <input
                      v-model.number="row.capacityTons"
                      type="number"
                      min="0"
                      step="1"
                      placeholder="0"
                      class="w-full px-2.5 py-2 border border-[#e2e8f0] rounded-lg text-sm text-right font-mono focus:outline-none focus:border-[#2563eb]"
                    />
                  </td>
                  <td class="px-3 py-2">
                    <label class="flex items-center gap-2 cursor-pointer px-2.5 py-2 border border-dashed border-[#cbd5e1] rounded-lg hover:border-[#2563eb] transition-colors">
                      <svg class="w-4 h-4 text-[#64748b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      <span class="text-xs text-[#64748b] truncate">{{ row.documentName || 'Прикрепить' }}</span>
                      <input type="file" class="hidden" @change="row.documentName = ($event.target as HTMLInputElement)?.files?.[0]?.name || ''" />
                    </label>
                  </td>
                  <td class="px-3 py-2 text-center">
                    <button
                      @click="removeEditRow(row.id)"
                      class="p-1.5 text-[#ef4444] hover:bg-[#fee2e2] rounded-lg transition-colors"
                      title="Удалить строку"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="border-t-2 border-[#e2e8f0] bg-[#f8fafc] font-semibold text-[#1e293b]">
                  <td class="px-3 py-3" colspan="3">Итого мощность</td>
                  <td class="px-3 py-3 text-right font-mono">{{ editTotalCapacity }}</td>
                  <td class="px-3 py-3" colspan="2"></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div class="mt-4">
            <button
              @click="addEditRow"
              class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#22C55E] border border-[#22C55E] rounded-lg hover:bg-[#f0fdf4] transition-colors"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              + Добавить мощность
            </button>
          </div>

          <div class="flex items-center gap-3 mt-6 pt-4 border-t border-[#e2e8f0]">
            <button
              @click="saveCapacityEdits"
              class="px-6 py-2.5 text-sm font-medium text-white bg-[#22C55E] rounded-lg hover:bg-[#16a34a] transition-colors"
            >
              Сохранить изменения
            </button>
            <button
              @click="cancelEditCapacities"
              class="px-6 py-2.5 text-sm font-medium text-[#64748b] bg-white border border-[#e2e8f0] rounded-lg hover:bg-[#f8fafc] transition-colors"
            >
              Отмена
            </button>
          </div>
        </div>
      </div>

      <!-- BLOCK 3.5 - История изменений мощностей -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-[#e2e8f0]" v-if="capacityHistory.length > 0">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-[#1e293b]">История изменений мощностей</h2>
          <button
            @click="showHistory = !showHistory"
            class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#64748b] border border-[#e2e8f0] rounded-lg hover:bg-[#f8fafc] transition-colors"
          >
            <svg
              class="w-4 h-4 transition-transform"
              :class="{ 'rotate-180': showHistory }"
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
            {{ showHistory ? 'Скрыть историю' : 'Показать историю' }}
          </button>
        </div>

        <div v-if="showHistory" class="mt-4 overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-[#64748b] bg-[#f8fafc] border-b border-[#e2e8f0]">
                <th class="px-4 py-3 font-medium">Дата</th>
                <th class="px-4 py-3 font-medium">Группа отходов</th>
                <th class="px-4 py-3 font-medium text-right">Было (т/год)</th>
                <th class="px-4 py-3 font-medium text-right">Стало (т/год)</th>
                <th class="px-4 py-3 font-medium text-right">Изменение</th>
                <th class="px-4 py-3 font-medium">Кто изменил</th>
              </tr>
            </thead>
            <tbody class="text-[#1e293b]">
              <tr v-for="(change, idx) in capacityHistory" :key="idx" class="border-t border-[#e2e8f0] hover:bg-[#f8fafc]">
                <td class="px-4 py-3 text-[#64748b]">{{ change.date }}</td>
                <td class="px-4 py-3">
                  <span class="inline-block px-2 py-0.5 bg-[#f1f5f9] text-[#64748b] rounded text-xs">
                    {{ getGroupLabel(change.group) }}
                  </span>
                </td>
                <td class="px-4 py-3 text-right font-mono">{{ change.oldValue }}</td>
                <td class="px-4 py-3 text-right font-mono">{{ change.newValue }}</td>
                <td class="px-4 py-3 text-right font-mono font-medium" :style="{ color: change.newValue > change.oldValue ? '#16a34a' : change.newValue < change.oldValue ? '#ef4444' : '#64748b' }">
                  <span v-if="change.oldValue === 0">+ {{ change.newValue }}</span>
                  <span v-else-if="change.newValue > change.oldValue">+ {{ change.newValue - change.oldValue }}</span>
                  <span v-else-if="change.newValue < change.oldValue">- {{ change.oldValue - change.newValue }}</span>
                  <span v-else>0</span>
                </td>
                <td class="px-4 py-3 text-[#64748b]">{{ change.changedBy }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- BLOCK - Инспекции и проверки -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-[#e2e8f0]">
        <h2 class="text-lg font-semibold text-[#1e293b] mb-4">Инспекции и проверки</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <div class="bg-[#f8fafc] rounded-lg p-3">
            <p class="text-sm text-[#64748b]">Статус проверки</p>
            <span v-if="recycler.inspectionStatus" :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1', recycler.inspectionStatus === 'compliant' ? 'bg-green-100 text-green-800' : recycler.inspectionStatus === 'violations' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800']">
              {{ recyclerStore.getInspectionStatusLabel(recycler.inspectionStatus) }}
            </span>
            <p v-else class="text-sm font-medium text-[#94a3b8] mt-1">Не проводилась</p>
          </div>
          <div class="bg-[#f8fafc] rounded-lg p-3">
            <p class="text-sm text-[#64748b]">Дата последней проверки</p>
            <p class="text-sm font-medium text-[#1e293b]">{{ recycler.lastInspectionDate || '—' }}</p>
          </div>
          <div class="bg-[#f8fafc] rounded-lg p-3">
            <p class="text-sm text-[#64748b]">Дата следующей проверки</p>
            <p class="text-sm font-medium text-[#1e293b]">{{ recycler.nextInspectionDate || '—' }}</p>
          </div>
          <div class="bg-[#f8fafc] rounded-lg p-3">
            <p class="text-sm text-[#64748b]">Рейтинг</p>
            <p class="text-sm font-medium text-[#1e293b]">{{ recycler.rating }} / 5.0</p>
          </div>
        </div>
        <div v-if="recycler.inspectionRemarks" class="p-4 bg-[#fef2f2] rounded-lg border border-[#fecaca]">
          <div class="flex items-start gap-3">
            <svg class="w-5 h-5 text-[#ef4444] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <p class="text-sm font-medium text-[#991b1b]">Замечания проверки</p>
              <p class="text-sm text-[#7f1d1d] mt-1">{{ recycler.inspectionRemarks }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- BLOCK - Объёмы переработки -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-[#e2e8f0]">
        <h2 class="text-lg font-semibold text-[#1e293b] mb-4">Объёмы переработки</h2>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="bg-[#f0fdf4] rounded-xl p-4 border border-[#bbf7d0]">
            <p class="text-sm text-[#64748b] mb-1">Текущий год (2026)</p>
            <p class="text-2xl font-bold text-[#1e293b]">{{ recycler.processedCurrentYear.toLocaleString() }} т</p>
            <p class="text-xs text-[#64748b] mt-1">~ {{ recyclerStore.toMonthly(recycler.processedCurrentYear) }} т/мес</p>
          </div>
          <div class="bg-[#f8fafc] rounded-xl p-4 border border-[#e2e8f0]">
            <p class="text-sm text-[#64748b] mb-1">Предыдущий год (2025)</p>
            <p class="text-2xl font-bold text-[#1e293b]">{{ recycler.processedPreviousYear.toLocaleString() }} т</p>
            <p class="text-xs text-[#64748b] mt-1">~ {{ recyclerStore.toMonthly(recycler.processedPreviousYear) }} т/мес</p>
          </div>
          <div class="bg-[#f8fafc] rounded-xl p-4 border border-[#e2e8f0]">
            <p class="text-sm text-[#64748b] mb-1">Динамика</p>
            <p class="text-2xl font-bold" :class="recyclerStore.getVolumeChangePercent(recycler) >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'">
              {{ recyclerStore.getVolumeChangePercent(recycler) >= 0 ? '+' : '' }}{{ recyclerStore.getVolumeChangePercent(recycler) }}%
            </p>
            <p class="text-xs text-[#64748b] mt-1">по сравнению с 2025</p>
          </div>
        </div>
      </div>

      <!-- BLOCK - Причина приостановки/исключения -->
      <div v-if="recycler.suspensionReason" class="bg-white rounded-2xl p-6 shadow-sm border border-[#fecaca]">
        <h2 class="text-lg font-semibold text-[#ef4444] mb-4">Причина {{ recycler.status === 'revoked' ? 'исключения' : 'приостановки' }}</h2>
        <div class="p-4 bg-[#fef2f2] rounded-lg">
          <p class="text-sm text-[#7f1d1d]">{{ recycler.suspensionReason }}</p>
        </div>
      </div>

      <!-- BLOCK 4 - Принятые отходы (история) -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-[#e2e8f0]">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h2 class="text-lg font-semibold text-[#1e293b]">Принятые отходы (история)</h2>
          <div class="flex flex-wrap gap-3">
            <select
              v-model="periodFilter"
              @change="onPeriodChange"
              class="px-3 py-2 border border-[#e2e8f0] rounded-lg text-sm focus:outline-none focus:border-[#2563eb]"
            >
              <option value="3m">За 3 месяца</option>
              <option value="6m">За 6 месяцев</option>
              <option value="1y">За год</option>
              <option value="all">Все</option>
            </select>
            <select
              v-model="groupFilter"
              @change="onGroupChange"
              class="px-3 py-2 border border-[#e2e8f0] rounded-lg text-sm focus:outline-none focus:border-[#2563eb]"
            >
              <option value="">Все группы</option>
              <option v-for="wt in recycler.wasteTypes" :key="wt" :value="wt">
                {{ getGroupLabel(wt) }}
              </option>
            </select>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-[#64748b] bg-[#f8fafc] border-b border-[#e2e8f0]">
                <th class="px-4 py-3 font-medium">Дата</th>
                <th class="px-4 py-3 font-medium">Плательщик</th>
                <th class="px-4 py-3 font-medium">Группа товаров</th>
                <th class="px-4 py-3 font-medium text-right">Объём (тонн)</th>
                <th class="px-4 py-3 font-medium">Акт приёма</th>
              </tr>
            </thead>
            <tbody class="text-[#1e293b]">
              <tr v-for="entry in paginatedWaste" :key="entry.actNumber" class="border-t border-[#e2e8f0] hover:bg-[#f8fafc]">
                <td class="px-4 py-3 text-[#64748b]">{{ entry.date }}</td>
                <td class="px-4 py-3 font-medium">{{ entry.payer }}</td>
                <td class="px-4 py-3">
                  <span class="inline-block px-2 py-0.5 bg-[#f1f5f9] text-[#64748b] rounded text-xs">
                    {{ getGroupLabel(entry.group) }}
                  </span>
                </td>
                <td class="px-4 py-3 text-right font-mono">{{ entry.volume.toFixed(1) }}</td>
                <td class="px-4 py-3">
                  <button
                    @click="toastStore.show({ type: 'info', title: 'Просмотр акта', message: entry.actNumber + ' — функционал в разработке' })"
                    class="text-[#2563eb] hover:underline text-sm font-medium"
                  >
                    {{ entry.actNumber }}
                  </button>
                </td>
              </tr>
              <tr v-if="paginatedWaste.length === 0" class="border-t border-[#e2e8f0]">
                <td colspan="5" class="px-4 py-8 text-center text-[#64748b]">Нет данных за выбранный период</td>
              </tr>
            </tbody>
            <tfoot v-if="filteredWaste.length > 0">
              <tr class="border-t-2 border-[#e2e8f0] bg-[#f8fafc] font-semibold text-[#1e293b]">
                <td class="px-4 py-3" colspan="3">Итого за период ({{ filteredWaste.length }} записей)</td>
                <td class="px-4 py-3 text-right font-mono">{{ totalVolume.toFixed(1) }}</td>
                <td class="px-4 py-3"></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex items-center justify-center gap-1 mt-4 pt-4 border-t border-[#e2e8f0]">
          <button
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-3 py-1.5 text-sm rounded-lg border border-[#e2e8f0] text-[#64748b] hover:bg-[#f8fafc] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            &laquo;
          </button>
          <button
            v-for="page in pageNumbers"
            :key="page"
            @click="goToPage(page)"
            :class="[
              'px-3 py-1.5 text-sm rounded-lg border transition-colors',
              page === currentPage
                ? 'bg-[#22C55E] text-white border-[#22C55E]'
                : 'border-[#e2e8f0] text-[#64748b] hover:bg-[#f8fafc]'
            ]"
          >
            {{ page }}
          </button>
          <button
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="px-3 py-1.5 text-sm rounded-lg border border-[#e2e8f0] text-[#64748b] hover:bg-[#f8fafc] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            &raquo;
          </button>
        </div>
      </div>

      <!-- BLOCK 5 - Документы -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-[#e2e8f0]" v-if="recycler.documents?.length">
        <h2 class="text-lg font-semibold text-[#1e293b] mb-4">Документы</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div
            v-for="(doc, idx) in recycler.documents"
            :key="idx"
            class="flex items-center gap-3 bg-[#f8fafc] rounded-lg p-4 border border-[#e2e8f0]"
          >
            <!-- File icon -->
            <div
              :class="[
                'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                doc.type === 'pdf' ? 'bg-[#fee2e2]' : 'bg-[#dbeafe]'
              ]"
            >
              <svg v-if="doc.type === 'pdf'" class="w-5 h-5 text-[#ef4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <svg v-else class="w-5 h-5 text-[#2563eb]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <!-- File info -->
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-[#1e293b] truncate">{{ doc.name }}</p>
              <p class="text-xs text-[#64748b]">{{ doc.type.toUpperCase() }} | {{ doc.size }} | {{ doc.date }}</p>
            </div>
            <!-- Actions -->
            <div class="flex items-center gap-2 flex-shrink-0">
              <button
                @click="toastStore.show({ type: 'info', title: 'Просмотр документа', message: '«' + doc.name + '» — функционал в разработке' })"
                class="px-3 py-1.5 text-xs font-medium text-[#2563eb] bg-[#eff6ff] rounded-lg hover:bg-[#dbeafe] transition-colors"
              >
                Просмотр
              </button>
              <button
                @click="toastStore.show({ type: 'info', title: 'Скачивание документа', message: '«' + doc.name + '» — функционал в разработке' })"
                class="px-3 py-1.5 text-xs font-medium text-[#64748b] bg-white border border-[#e2e8f0] rounded-lg hover:bg-[#f8fafc] transition-colors"
              >
                Скачать
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- BLOCK 6 - География -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-[#e2e8f0]" v-if="recycler.coordinates">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-[#1e293b]">Расположение предприятия</h2>
          <button
            @click="goToGisMap"
            class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#22C55E] rounded-lg hover:bg-[#16a34a] transition-colors"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Показать на карте
          </button>
        </div>
        <div class="rounded-xl overflow-hidden border border-[#e2e8f0]">
          <LMap
            :center="[recycler.coordinates.lat, recycler.coordinates.lng]"
            :zoom="15"
            style="height: 300px; width: 100%;"
            :use-global-leaflet="false"
          >
            <LTileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap"
            />
            <LMarker
              :lat-lng="[recycler.coordinates.lat, recycler.coordinates.lng]"
              :icon="mapMarkerIcon"
            >
              <LPopup :options="{ maxWidth: 280 }">
                <div style="font-family: system-ui, sans-serif;">
                  <p style="font-weight: 600; font-size: 14px; margin: 0 0 4px 0; color: #1e293b;">{{ recycler.name }}</p>
                  <p style="font-size: 12px; margin: 0; color: #64748b;">{{ recycler.actualAddress || recycler.address }}</p>
                </div>
              </LPopup>
            </LMarker>
          </LMap>
        </div>
        <div class="mt-3 flex items-center justify-between">
          <p class="text-sm text-[#64748b]">{{ recycler.actualAddress || recycler.address }}</p>
          <p class="text-xs text-[#94a3b8] font-mono">{{ recycler.coordinates.lat.toFixed(4) }}, {{ recycler.coordinates.lng.toFixed(4) }}</p>
        </div>
      </div>

      <!-- BLOCK - Дополнительная информация -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-[#e2e8f0]">
        <h2 class="text-lg font-semibold text-[#1e293b] mb-4">Дополнительная информация</h2>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div class="bg-[#f8fafc] rounded-lg p-3">
            <p class="text-sm text-[#64748b]">Дата последнего обновления</p>
            <p class="text-sm font-medium text-[#1e293b]">{{ recycler.updatedAt }}</p>
          </div>
          <div class="bg-[#f8fafc] rounded-lg p-3">
            <p class="text-sm text-[#64748b]">Дата добавления в реестр</p>
            <p class="text-sm font-medium text-[#1e293b]">{{ recycler.addedDate }}</p>
          </div>
          <div class="bg-[#f8fafc] rounded-lg p-3">
            <p class="text-sm text-[#64748b]">Добавил</p>
            <p class="text-sm font-medium text-[#1e293b]">{{ recycler.addedBy }}</p>
          </div>
        </div>
        <div v-if="recycler.notes" class="mt-3 p-4 bg-[#fffbeb] rounded-lg border border-[#fbbf24]">
          <p class="text-sm font-medium text-[#92400e]">Примечания</p>
          <p class="text-sm text-[#78350f] mt-1">{{ recycler.notes }}</p>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<style scoped>
:deep(.custom-marker) {
  background: transparent !important;
  border: none !important;
}
</style>
