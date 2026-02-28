<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import SectionGuide from '../../components/common/SectionGuide.vue'
import SkeletonLoader from '../../components/dashboard/SkeletonLoader.vue'
import EmptyState from '../../components/dashboard/EmptyState.vue'
import { AppButton, AppBadge } from '../../components/ui'
import { getStatusBadgeVariant } from '../../utils/statusVariant'
import { useEmployeeMenu } from '../../composables/useRoleMenu'
import { toastStore } from '../../stores/toast'

const { roleTitle, menuItems } = useEmployeeMenu()
const { t } = useI18n()

// Loading state
const isLoading = ref(true)
onMounted(() => { setTimeout(() => { isLoading.value = false }, 500) })

// Регионы Кыргызстана
const regions = computed(() => [
  t('employeeReports.allRegions'),
  t('employeeReports.regionBishkek'),
  t('employeeReports.regionOsh'),
  t('employeeReports.regionChuy'),
  t('employeeReports.regionOshObl'),
  t('employeeReports.regionJalalAbad'),
  t('employeeReports.regionIssykKul'),
  t('employeeReports.regionNaryn'),
  t('employeeReports.regionTalas'),
  t('employeeReports.regionBatken'),
])

// Активный тип отчёта
const activeReport = ref<'summary' | 'landfills' | 'licenses' | 'normatives' | 'regions' | null>(null)

// Флаг формирования отчёта
const isGenerating = ref(false)
const reportGenerated = ref(false)

// ========== ОТЧЁТ 1: СВОДНЫЙ ДЛЯ РУКОВОДСТВА ==========
const summaryFilters = ref({
  dateFrom: '2025-01-01',
  dateTo: '2025-02-03',
})

interface SummaryRow {
  id: number
  indicator: string
  unit: string
  value: string
  change: string
  changeType: 'positive' | 'negative' | 'neutral'
}

const summaryData = ref<SummaryRow[]>([
  { id: 1, indicator: 'Зарегистрировано организаций', unit: 'шт', value: '342', change: '+15 за период', changeType: 'positive' },
  { id: 2, indicator: 'Лицензированных субъектов', unit: 'шт', value: '48', change: '+3', changeType: 'positive' },
  { id: 3, indicator: 'Действующих лицензий', unit: 'шт', value: '48', change: '-2', changeType: 'negative' },
  { id: 4, indicator: 'Истекающих лицензий (30 дней)', unit: 'шт', value: '5', change: '+1', changeType: 'negative' },
  { id: 5, indicator: 'Полигонов на контроле', unit: 'шт', value: '12', change: '0', changeType: 'neutral' },
  { id: 6, indicator: 'Полигонов с превышением нагрузки', unit: 'шт', value: '1', change: '-1', changeType: 'positive' },
  { id: 7, indicator: 'Средняя заполненность полигонов', unit: '%', value: '64.2', change: '+3.1', changeType: 'negative' },
  { id: 8, indicator: 'Общий объём переработки', unit: 'тонн', value: '1 215.6', change: '+87.3', changeType: 'positive' },
  { id: 9, indicator: 'Выполнение нормативов (среднее)', unit: '%', value: '72.4', change: '+2.1', changeType: 'positive' },
  { id: 10, indicator: 'Видов отходов в реестре', unit: 'шт', value: '24', change: '+2', changeType: 'positive' },
  { id: 11, indicator: 'Нарушений выявлено', unit: 'шт', value: '7', change: '-2', changeType: 'positive' },
  { id: 12, indicator: 'Переработчиков зарегистрировано', unit: 'шт', value: '48', change: '+3', changeType: 'positive' },
])

const getSummaryChangeColor = (changeType: string) => {
  if (changeType === 'positive') return 'text-green-600'
  if (changeType === 'negative') return 'text-red-600'
  return 'text-gray-500'
}

// ========== ОТЧЁТ 2: СОСТОЯНИЕ ПОЛИГОНОВ ==========
const landfillsFilters = ref({
  dateFrom: '2025-01-01',
  dateTo: '2025-02-03',
  region: '',
  status: 'all',
})

interface LandfillRow {
  id: number
  name: string
  region: string
  type: 'Полигон' | 'Свалка'
  capacityTotal: number
  capacityUsed: number
  fillPercent: number
  condition: 'good' | 'warning' | 'critical'
  compliant: boolean
  lastInspection: string
}

const landfillsData = ref<LandfillRow[]>([
  { id: 1, name: 'Полигон «Бишкек-Север»', region: 'г. Бишкек', type: 'Полигон', capacityTotal: 500000, capacityUsed: 325000, fillPercent: 65, condition: 'good', compliant: true, lastInspection: '2025-12-15' },
  { id: 2, name: 'Полигон «Бишкек-Юг»', region: 'г. Бишкек', type: 'Полигон', capacityTotal: 350000, capacityUsed: 301000, fillPercent: 86, condition: 'warning', compliant: true, lastInspection: '2025-11-20' },
  { id: 3, name: 'Полигон «Ош»', region: 'г. Ош', type: 'Полигон', capacityTotal: 280000, capacityUsed: 196000, fillPercent: 70, condition: 'good', compliant: true, lastInspection: '2025-12-01' },
  { id: 4, name: 'Свалка «Ош-2»', region: 'г. Ош', type: 'Свалка', capacityTotal: 120000, capacityUsed: 108000, fillPercent: 90, condition: 'critical', compliant: false, lastInspection: '2025-10-10' },
  { id: 5, name: 'Полигон «Токмок»', region: 'Чуйская обл.', type: 'Полигон', capacityTotal: 200000, capacityUsed: 170000, fillPercent: 85, condition: 'warning', compliant: true, lastInspection: '2025-11-05' },
  { id: 6, name: 'Свалка «Кара-Балта»', region: 'Чуйская обл.', type: 'Свалка', capacityTotal: 80000, capacityUsed: 72000, fillPercent: 90, condition: 'critical', compliant: false, lastInspection: '2025-09-15' },
  { id: 7, name: 'Полигон «Джалал-Абад»', region: 'Джалал-Абадская обл.', type: 'Полигон', capacityTotal: 180000, capacityUsed: 99000, fillPercent: 55, condition: 'good', compliant: true, lastInspection: '2025-12-10' },
  { id: 8, name: 'Полигон «Каракол»', region: 'Иссык-Кульская обл.', type: 'Полигон', capacityTotal: 150000, capacityUsed: 82500, fillPercent: 55, condition: 'good', compliant: true, lastInspection: '2025-11-28' },
  { id: 9, name: 'Свалка «Нарын»', region: 'Нарынская обл.', type: 'Свалка', capacityTotal: 60000, capacityUsed: 51000, fillPercent: 85, condition: 'warning', compliant: false, lastInspection: '2025-08-20' },
  { id: 10, name: 'Полигон «Талас»', region: 'Таласская обл.', type: 'Полигон', capacityTotal: 100000, capacityUsed: 45000, fillPercent: 45, condition: 'good', compliant: true, lastInspection: '2025-12-05' },
  { id: 11, name: 'Полигон «Баткен»', region: 'Баткенская обл.', type: 'Полигон', capacityTotal: 90000, capacityUsed: 58500, fillPercent: 65, condition: 'good', compliant: true, lastInspection: '2025-11-10' },
  { id: 12, name: 'Полигон «Ошская обл.»', region: 'Ошская обл.', type: 'Полигон', capacityTotal: 160000, capacityUsed: 136000, fillPercent: 85, condition: 'warning', compliant: true, lastInspection: '2025-10-25' },
])

const filteredLandfills = computed(() => {
  return landfillsData.value.filter(l => {
    if (landfillsFilters.value.region && landfillsFilters.value.region !== regions.value[0]) {
      // Match region loosely
      const filterRegion = landfillsFilters.value.region.toLowerCase()
      const dataRegion = l.region.toLowerCase()
      if (!dataRegion.includes(filterRegion) && !filterRegion.includes(dataRegion.replace('обл.', '').replace('г. ', '').trim())) {
        // More specific matching
        const regionMap: Record<string, string[]> = {
          'бишкек': ['г. бишкек'],
          'ош': ['г. ош'],
          'чуйская область': ['чуйская обл.'],
          'ошская область': ['ошская обл.'],
          'джалал-абадская область': ['джалал-абадская обл.'],
          'иссык-кульская область': ['иссык-кульская обл.'],
          'нарынская область': ['нарынская обл.'],
          'таласская область': ['таласская обл.'],
          'баткенская область': ['баткенская обл.'],
        }
        const matches = regionMap[filterRegion] || []
        if (!matches.some(m => dataRegion === m)) return false
      }
    }
    if (landfillsFilters.value.status === 'compliant' && !l.compliant) return false
    if (landfillsFilters.value.status === 'non-compliant' && l.compliant) return false
    return true
  })
})

const landfillsSummary = computed(() => ({
  total: filteredLandfills.value.length,
  avgFill: filteredLandfills.value.length > 0
    ? (filteredLandfills.value.reduce((s, l) => s + l.fillPercent, 0) / filteredLandfills.value.length).toFixed(1)
    : '0',
  violations: filteredLandfills.value.filter(l => !l.compliant).length,
  critical: filteredLandfills.value.filter(l => l.condition === 'critical').length,
}))

const getConditionColor = (condition: string) => {
  const colors: Record<string, string> = {
    good: 'bg-green-100 text-green-700',
    warning: 'bg-amber-100 text-amber-700',
    critical: 'bg-red-100 text-red-700',
  }
  return colors[condition] || 'bg-gray-100 text-gray-700'
}

const getConditionLabel = (condition: string) => {
  const labels: Record<string, string> = {
    good: t('employeeReports.conditionGood'),
    warning: t('employeeReports.conditionWarning'),
    critical: t('employeeReports.conditionCritical'),
  }
  return labels[condition] || condition
}

const getFillColor = (percent: number) => {
  if (percent > 85) return 'bg-red-500'
  if (percent >= 70) return 'bg-amber-500'
  return 'bg-green-500'
}

// ========== ОТЧЁТ 3: ЛИЦЕНЗИИ ==========
const licensesFilters = ref({
  dateFrom: '2025-01-01',
  dateTo: '2025-02-03',
  region: '',
  status: 'all',
})

interface LicenseReportRow {
  id: number
  company: string
  inn: string
  licenseNumber: string
  activity: string
  region: string
  issueDate: string
  expiryDate: string
  status: 'active' | 'expiring' | 'expired' | 'revoked'
}

const licensesReportData = ref<LicenseReportRow[]>([
  { id: 1, company: 'ОсОО «ЭкоРесайкл»', inn: '02345678912345', licenseNumber: 'Л-2024-001', activity: 'Переработка пластика', region: 'Бишкек', issueDate: '2024-03-15', expiryDate: '2027-03-15', status: 'active' },
  { id: 2, company: 'ОАО «ГринТех»', inn: '09876543210987', licenseNumber: 'Л-2023-018', activity: 'Переработка бумаги и картона', region: 'Бишкек', issueDate: '2023-06-01', expiryDate: '2026-06-01', status: 'active' },
  { id: 3, company: 'ОсОО «ТекстильРесайкл»', inn: '11234567890123', licenseNumber: 'Л-2022-042', activity: 'Переработка текстиля', region: 'Чуйская обл.', issueDate: '2022-09-10', expiryDate: '2025-09-10', status: 'expired' },
  { id: 4, company: 'ОсОО «СтеклоПром»', inn: '03456789012345', licenseNumber: 'Л-2024-007', activity: 'Переработка стекла', region: 'Ош', issueDate: '2024-01-20', expiryDate: '2027-01-20', status: 'active' },
  { id: 5, company: 'ИП Касымов Б.А.', inn: '10234567890123', licenseNumber: 'Л-2023-033', activity: 'Сбор и транспортировка отходов', region: 'Бишкек', issueDate: '2023-11-01', expiryDate: '2026-02-28', status: 'expiring' },
  { id: 6, company: 'ОсОО «МеталлСервис»', inn: '04567891234567', licenseNumber: 'Л-2024-012', activity: 'Переработка металлов', region: 'Иссык-Кульская обл.', issueDate: '2024-05-15', expiryDate: '2027-05-15', status: 'active' },
  { id: 7, company: 'ОсОО «АвтоУтиль»', inn: '05678912345678', licenseNumber: 'Л-2022-029', activity: 'Утилизация автотранспорта', region: 'Чуйская обл.', issueDate: '2022-04-01', expiryDate: '2025-04-01', status: 'expiring' },
  { id: 8, company: 'ОсОО «ЭлектроУтиль»', inn: '06789012345678', licenseNumber: 'Л-2023-051', activity: 'Утилизация электроники', region: 'Бишкек', issueDate: '2023-08-20', expiryDate: '2026-08-20', status: 'active' },
  { id: 9, company: 'ОсОО «БиоЭнерго»', inn: '07890123456789', licenseNumber: 'Л-2021-015', activity: 'Переработка органических отходов', region: 'Ошская обл.', issueDate: '2021-12-01', expiryDate: '2024-12-01', status: 'expired' },
  { id: 10, company: 'ОсОО «ХимОтходы»', inn: '08901234567890', licenseNumber: 'Л-2022-038', activity: 'Обезвреживание опасных отходов', region: 'Джалал-Абадская обл.', issueDate: '2022-07-10', expiryDate: '2025-07-10', status: 'revoked' },
])

const filteredLicenses = computed(() => {
  return licensesReportData.value.filter(l => {
    if (licensesFilters.value.region && licensesFilters.value.region !== regions.value[0]) {
      const filterRegion = licensesFilters.value.region.toLowerCase()
      const dataRegion = l.region.toLowerCase()
      if (!dataRegion.includes(filterRegion) && !filterRegion.includes(dataRegion.replace('обл.', '').replace('г. ', '').trim())) {
        const regionMap: Record<string, string[]> = {
          'бишкек': ['бишкек'],
          'ош': ['ош'],
          'чуйская область': ['чуйская обл.'],
          'ошская область': ['ошская обл.'],
          'джалал-абадская область': ['джалал-абадская обл.'],
          'иссык-кульская область': ['иссык-кульская обл.'],
          'нарынская область': ['нарынская обл.'],
          'таласская область': ['таласская обл.'],
          'баткенская область': ['баткенская обл.'],
        }
        const matches = regionMap[filterRegion] || []
        if (!matches.some(m => dataRegion === m)) return false
      }
    }
    if (licensesFilters.value.status !== 'all' && l.status !== licensesFilters.value.status) return false
    return true
  })
})

const licensesSummary = computed(() => ({
  total: filteredLicenses.value.length,
  active: filteredLicenses.value.filter(l => l.status === 'active').length,
  expiring: filteredLicenses.value.filter(l => l.status === 'expiring').length,
  expiredRevoked: filteredLicenses.value.filter(l => l.status === 'expired' || l.status === 'revoked').length,
}))

const getLicenseStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    expiring: 'bg-amber-100 text-amber-700',
    expired: 'bg-red-100 text-red-700',
    revoked: 'bg-gray-100 text-gray-700',
  }
  return colors[status] || 'bg-gray-100 text-gray-700'
}

const getLicenseStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    active: t('employeeReports.licStatusActive'),
    expiring: t('employeeReports.licStatusExpiring'),
    expired: t('employeeReports.licStatusExpired'),
    revoked: t('employeeReports.licStatusRevoked'),
  }
  return labels[status] || status
}

// ========== ОТЧЁТ 4: ВЫПОЛНЕНИЕ НОРМАТИВОВ ==========
const normativesFilters = ref({
  dateFrom: '2025-01-01',
  dateTo: '2025-02-03',
  region: '',
})

interface NormativeRow {
  id: number
  wasteType: string
  targetPercent: number
  actualPercent: number
  volume: number
  recycled: number
  status: 'fulfilled' | 'partial' | 'failed'
}

const normativesData = ref<NormativeRow[]>([
  { id: 1, wasteType: 'Пластик ПЭТ', targetPercent: 15, actualPercent: 18.2, volume: 245.0, recycled: 44.6, status: 'fulfilled' },
  { id: 2, wasteType: 'Пластик ПП/ПЭ', targetPercent: 12, actualPercent: 9.8, volume: 189.0, recycled: 18.5, status: 'partial' },
  { id: 3, wasteType: 'Бумага и картон', targetPercent: 20, actualPercent: 22.5, volume: 312.0, recycled: 70.2, status: 'fulfilled' },
  { id: 4, wasteType: 'Стекло', targetPercent: 15, actualPercent: 14.1, volume: 156.0, recycled: 22.0, status: 'partial' },
  { id: 5, wasteType: 'Металлы чёрные', targetPercent: 25, actualPercent: 31.0, volume: 98.0, recycled: 30.4, status: 'fulfilled' },
  { id: 6, wasteType: 'Металлы цветные', targetPercent: 20, actualPercent: 24.5, volume: 45.0, recycled: 11.0, status: 'fulfilled' },
  { id: 7, wasteType: 'Шины и резина', targetPercent: 10, actualPercent: 7.2, volume: 178.0, recycled: 12.8, status: 'partial' },
  { id: 8, wasteType: 'Электроника (WEEE)', targetPercent: 8, actualPercent: 5.1, volume: 34.0, recycled: 1.7, status: 'failed' },
  { id: 9, wasteType: 'Аккумуляторы и батареи', targetPercent: 15, actualPercent: 12.3, volume: 12.0, recycled: 1.5, status: 'partial' },
  { id: 10, wasteType: 'Масла отработанные', targetPercent: 18, actualPercent: 19.7, volume: 67.0, recycled: 13.2, status: 'fulfilled' },
])

const normativesSummary = computed(() => ({
  total: normativesData.value.length,
  fulfilled: normativesData.value.filter(n => n.status === 'fulfilled').length,
  partial: normativesData.value.filter(n => n.status === 'partial').length,
  failed: normativesData.value.filter(n => n.status === 'failed').length,
}))

const getNormStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    fulfilled: 'bg-green-100 text-green-700',
    partial: 'bg-amber-100 text-amber-700',
    failed: 'bg-red-100 text-red-700',
  }
  return colors[status] || 'bg-gray-100 text-gray-700'
}

const getNormStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    fulfilled: t('employeeReports.normFulfilled'),
    partial: t('employeeReports.normPartial'),
    failed: t('employeeReports.normFailed'),
  }
  return labels[status] || status
}

// ========== ОТЧЁТ 5: ПО РЕГИОНАМ ==========
const regionsFilters = ref({
  dateFrom: '2025-01-01',
  dateTo: '2025-02-03',
})

interface RegionRow {
  id: number
  region: string
  organizations: number
  recyclers: number
  landfills: number
  licenses: number
  volume: number
  normPercent: number
  share: number
}

const regionsData = ref<RegionRow[]>([
  { id: 1, region: 'г. Бишкек', organizations: 154, recyclers: 22, landfills: 2, licenses: 18, volume: 547.0, normPercent: 78.5, share: 45 },
  { id: 2, region: 'г. Ош', organizations: 51, recyclers: 8, landfills: 2, licenses: 8, volume: 182.3, normPercent: 71.2, share: 15 },
  { id: 3, region: 'Чуйская обл.', organizations: 41, recyclers: 6, landfills: 2, licenses: 6, volume: 145.9, normPercent: 69.8, share: 12 },
  { id: 4, region: 'Ошская обл.', organizations: 27, recyclers: 4, landfills: 1, licenses: 4, volume: 97.2, normPercent: 65.3, share: 8 },
  { id: 5, region: 'Джалал-Абадская обл.', organizations: 24, recyclers: 3, landfills: 1, licenses: 3, volume: 85.1, normPercent: 62.7, share: 7 },
  { id: 6, region: 'Иссык-Кульская обл.', organizations: 17, recyclers: 2, landfills: 1, licenses: 3, volume: 60.8, normPercent: 58.4, share: 5 },
  { id: 7, region: 'Нарынская обл.', organizations: 10, recyclers: 1, landfills: 1, licenses: 2, volume: 36.5, normPercent: 55.1, share: 3 },
  { id: 8, region: 'Таласская обл.', organizations: 10, recyclers: 1, landfills: 1, licenses: 2, volume: 36.5, normPercent: 53.8, share: 3 },
  { id: 9, region: 'Баткенская обл.', organizations: 8, recyclers: 1, landfills: 1, licenses: 2, volume: 24.3, normPercent: 48.6, share: 2 },
])

const regionsTotals = computed(() => ({
  organizations: regionsData.value.reduce((s, r) => s + r.organizations, 0),
  recyclers: regionsData.value.reduce((s, r) => s + r.recyclers, 0),
  landfills: regionsData.value.reduce((s, r) => s + r.landfills, 0),
  licenses: regionsData.value.reduce((s, r) => s + r.licenses, 0),
  volume: regionsData.value.reduce((s, r) => s + r.volume, 0),
}))

// Функции
const generateReport = async () => {
  isGenerating.value = true
  await new Promise(resolve => setTimeout(resolve, 1500))
  isGenerating.value = false
  reportGenerated.value = true
}

const exportToExcel = () => {
  let csvContent = ''
  let filename = ''

  if (activeReport.value === 'summary') {
    filename = 'report_summary.csv'
    csvContent = `${t('employeeReports.thIndicator')},${t('employeeReports.thUnit')},${t('employeeReports.thValue')},${t('employeeReports.thChange')}\n`
    summaryData.value.forEach(r => {
      csvContent += `"${r.indicator}","${r.unit}","${r.value}","${r.change}"\n`
    })
  } else if (activeReport.value === 'landfills') {
    filename = 'report_landfills.csv'
    csvContent = `${t('common.name')},${t('common.region')},${t('common.type')},${t('employeeReports.thCapacity')},${t('employeeReports.thFilled')},${t('employeeReports.thFillPercent')},${t('employeeReports.thCondition')},${t('employeeReports.thCompliance')},${t('employeeReports.thInspection')}\n`
    filteredLandfills.value.forEach(l => {
      csvContent += `"${l.name}","${l.region}","${l.type}",${l.capacityTotal},${l.capacityUsed},${l.fillPercent},"${getConditionLabel(l.condition)}","${l.compliant ? t('common.yes') : t('common.no')}","${l.lastInspection}"\n`
    })
  } else if (activeReport.value === 'licenses') {
    filename = 'report_licenses.csv'
    csvContent = `${t('employeeReports.thOrganization')},${t('employeeReports.thInn')},${t('employeeReports.thLicenseNumber')},${t('employeeReports.thActivity')},${t('common.region')},${t('employeeReports.thIssued')},${t('employeeReports.thValidUntil')},${t('common.status')}\n`
    filteredLicenses.value.forEach(l => {
      csvContent += `"${l.company}","${l.inn}","${l.licenseNumber}","${l.activity}","${l.region}","${l.issueDate}","${l.expiryDate}","${getLicenseStatusLabel(l.status)}"\n`
    })
  } else if (activeReport.value === 'normatives') {
    filename = 'report_normatives.csv'
    csvContent = `${t('employeeReports.thWasteType')},${t('employeeReports.thNormPercent')},${t('employeeReports.thFactPercent')},${t('employeeReports.thGenerationVolume')},${t('employeeReports.thRecycled')},${t('common.status')}\n`
    normativesData.value.forEach(n => {
      csvContent += `"${n.wasteType}",${n.targetPercent},${n.actualPercent},${n.volume},${n.recycled},"${getNormStatusLabel(n.status)}"\n`
    })
  } else if (activeReport.value === 'regions') {
    filename = 'report_regions.csv'
    csvContent = `${t('common.region')},${t('employeeReports.thOrganizations')},${t('employeeReports.thRecyclers')},${t('employeeReports.thLandfills')},${t('employeeReports.thLicenses')},${t('employeeReports.thRecyclingVolume')},${t('employeeReports.thNormCompliance')},${t('employeeReports.thShare')} %\n`
    regionsData.value.forEach(r => {
      csvContent += `"${r.region}",${r.organizations},${r.recyclers},${r.landfills},${r.licenses},${r.volume},${r.normPercent},${r.share}\n`
    })
  }

  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
  URL.revokeObjectURL(link.href)
}

const exportToPdf = () => {
  window.print()
}

const formatNumber = (num: number) => num.toLocaleString()

const selectReport = (type: 'summary' | 'landfills' | 'licenses' | 'normatives' | 'regions') => {
  activeReport.value = type
  reportGenerated.value = false
}

const goBack = () => {
  activeReport.value = null
  reportGenerated.value = false
}
</script>

<template>
  <DashboardLayout
    role="employee"
    :roleTitle="roleTitle"
    userName="Алиева Динара"
    :menuItems="menuItems"
  >
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button
            v-if="activeReport"
            @click="goBack"
            class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">
              {{ activeReport === 'summary' ? $t('employeeReports.summaryTitle') :
                 activeReport === 'landfills' ? $t('employeeReports.landfillsTitle') :
                 activeReport === 'licenses' ? $t('employeeReports.licensesTitle') :
                 activeReport === 'normatives' ? $t('employeeReports.normativesTitle') :
                 activeReport === 'regions' ? $t('employeeReports.regionsTitle') : $t('pages.employee.reportsTitle') }}
            </h1>
            <p class="text-gray-600 mt-1">
              {{ activeReport ? $t('employeeReports.activeSubtitle') : $t('employeeReports.selectSubtitle') }}
            </p>
          </div>
        </div>
      </div>

      <SectionGuide
        :title="$t('employeeReports.guideTitle')"
        :description="$t('employeeReports.guideDescription')"
        :actions="[$t('employeeReports.guideAction1'), $t('employeeReports.guideAction2'), $t('employeeReports.guideAction3')]"
        storageKey="employee-reports"
      />

      <template v-if="isLoading">
        <div class="mb-6"><SkeletonLoader variant="card" /></div>
        <SkeletonLoader variant="table" />
      </template>

      <template v-if="!isLoading">
      <!-- Report Type Cards -->
      <div v-if="!activeReport" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <!-- Card 1: Summary for Management -->
        <div
          @click="selectReport('summary')"
          class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-purple-300 transition-all cursor-pointer group"
        >
          <div class="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
            <svg class="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 class="text-lg font-bold text-gray-900 mb-2">{{ $t('employeeReports.summaryTitle') }}</h3>
          <p class="text-gray-500 text-sm mb-4">{{ $t('employeeReports.summaryDesc') }}</p>
          <div class="flex items-center text-purple-600 font-medium text-sm">
            <span>{{ $t('employeeReports.generateReport') }}</span>
            <svg class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        <!-- Card 2: Landfills -->
        <div
          @click="selectReport('landfills')"
          class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-violet-300 transition-all cursor-pointer group"
        >
          <div class="w-14 h-14 bg-violet-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-violet-200 transition-colors">
            <svg class="w-7 h-7 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <h3 class="text-lg font-bold text-gray-900 mb-2">{{ $t('employeeReports.landfillsTitle') }}</h3>
          <p class="text-gray-500 text-sm mb-4">{{ $t('employeeReports.landfillsDesc') }}</p>
          <div class="flex items-center text-violet-600 font-medium text-sm">
            <span>{{ $t('employeeReports.generateReport') }}</span>
            <svg class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        <!-- Card 3: Licenses -->
        <div
          @click="selectReport('licenses')"
          class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group"
        >
          <div class="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
            <svg class="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 class="text-lg font-bold text-gray-900 mb-2">{{ $t('employeeReports.licensesTitle') }}</h3>
          <p class="text-gray-500 text-sm mb-4">{{ $t('employeeReports.licensesDesc') }}</p>
          <div class="flex items-center text-blue-600 font-medium text-sm">
            <span>{{ $t('employeeReports.generateReport') }}</span>
            <svg class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        <!-- Card 4: Normatives -->
        <div
          @click="selectReport('normatives')"
          class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div class="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-200 transition-colors">
            <svg class="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 class="text-lg font-bold text-gray-900 mb-2">{{ $t('employeeReports.normativesTitle') }}</h3>
          <p class="text-gray-500 text-sm mb-4">{{ $t('employeeReports.normativesDesc') }}</p>
          <div class="flex items-center text-emerald-600 font-medium text-sm">
            <span>{{ $t('employeeReports.generateReport') }}</span>
            <svg class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        <!-- Card 5: Regional Distribution -->
        <div
          @click="selectReport('regions')"
          class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-indigo-300 transition-all cursor-pointer group"
        >
          <div class="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-200 transition-colors">
            <svg class="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <h3 class="text-lg font-bold text-gray-900 mb-2">{{ $t('employeeReports.regionsTitle') }}</h3>
          <p class="text-gray-500 text-sm mb-4">{{ $t('employeeReports.regionsDesc') }}</p>
          <div class="flex items-center text-indigo-600 font-medium text-sm">
            <span>{{ $t('employeeReports.generateReport') }}</span>
            <svg class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>

      <!-- ========== ОТЧЁТ 1: СВОДНЫЙ ДЛЯ РУКОВОДСТВА ========== -->
      <template v-if="activeReport === 'summary'">
        <!-- Filters -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="font-semibold text-gray-900 mb-4">{{ $t('employeeReports.reportParams') }}</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('common.period') }}</label>
              <input v-model="summaryFilters.dateFrom" type="date" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('common.period') }}</label>
              <input v-model="summaryFilters.dateTo" type="date" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500" />
            </div>
            <div class="flex items-end">
              <button
                @click="generateReport"
                :disabled="isGenerating"
                class="w-full px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <svg v-if="isGenerating" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isGenerating ? $t('common.generating') : $t('common.generate') }}
              </button>
            </div>
          </div>
        </div>

        <!-- Results -->
        <div v-if="reportGenerated" class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <!-- Export buttons -->
          <div class="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <div class="text-sm text-gray-600">
              {{ $t('employeeReports.summaryForPeriod') }}: <span class="font-semibold">{{ summaryFilters.dateFrom }}</span> — <span class="font-semibold">{{ summaryFilters.dateTo }}</span>
            </div>
            <div class="flex flex-wrap gap-2">
              <AppButton variant="primary" size="sm" @click="exportToExcel">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                {{ $t('common.excel') }}
              </AppButton>
              <AppButton variant="danger" size="sm" @click="exportToPdf">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                {{ $t('common.pdf') }}
              </AppButton>
            </div>
          </div>

          <!-- Table -->
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-8">№</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{{ $t('employeeReports.thIndicator') }}</th>
                  <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{{ $t('employeeReports.thUnit') }}</th>
                  <th class="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">{{ $t('employeeReports.thValue') }}</th>
                  <th class="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">{{ $t('employeeReports.thChange') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="r in summaryData" :key="r.id" class="hover:bg-gray-50">
                  <td class="px-4 py-3 text-gray-500 font-mono text-sm">{{ r.id }}</td>
                  <td class="px-4 py-3 font-medium text-gray-900">{{ r.indicator }}</td>
                  <td class="px-4 py-3 text-center text-gray-500">{{ r.unit }}</td>
                  <td class="px-4 py-3 text-right font-bold text-gray-900">{{ r.value }}</td>
                  <td class="px-4 py-3 text-right">
                    <span :class="['font-semibold', getSummaryChangeColor(r.changeType)]">
                      {{ r.change }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>

      <!-- ========== ОТЧЁТ 2: СОСТОЯНИЕ ПОЛИГОНОВ ========== -->
      <template v-if="activeReport === 'landfills'">
        <!-- Filters -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="font-semibold text-gray-900 mb-4">{{ $t('employeeReports.reportParams') }}</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('common.period') }}</label>
              <input v-model="landfillsFilters.dateFrom" type="date" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('common.period') }}</label>
              <input v-model="landfillsFilters.dateTo" type="date" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('common.region') }}</label>
              <select v-model="landfillsFilters.region" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500">
                <option v-for="r in regions" :key="r" :value="r">{{ r }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('common.status') }}</label>
              <select v-model="landfillsFilters.status" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500">
                <option value="all">{{ $t('common.all') }}</option>
                <option value="compliant">{{ $t('employeeReports.compliant') }}</option>
                <option value="non-compliant">{{ $t('employeeReports.nonCompliant') }}</option>
              </select>
            </div>
            <div class="flex items-end">
              <button
                @click="generateReport"
                :disabled="isGenerating"
                class="w-full px-4 py-2 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <svg v-if="isGenerating" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isGenerating ? $t('common.generating') : $t('common.generate') }}
              </button>
            </div>
          </div>
        </div>

        <!-- Results -->
        <div v-if="reportGenerated" class="space-y-6">
          <!-- Summary cards -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <p class="text-sm text-gray-500">{{ $t('employeeReports.totalObjects') }}</p>
              <p class="text-2xl font-bold text-violet-600">{{ landfillsSummary.total }}</p>
            </div>
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <p class="text-sm text-gray-500">{{ $t('employeeReports.avgFill') }}</p>
              <p class="text-2xl font-bold text-gray-900">{{ landfillsSummary.avgFill }}%</p>
            </div>
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <p class="text-sm text-gray-500">{{ $t('employeeReports.withViolations') }}</p>
              <p class="text-2xl font-bold text-amber-600">{{ landfillsSummary.violations }}</p>
            </div>
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <p class="text-sm text-gray-500">{{ $t('employeeReports.criticalState') }}</p>
              <p class="text-2xl font-bold text-red-600">{{ landfillsSummary.critical }}</p>
            </div>
          </div>

          <!-- Table -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div class="text-sm text-gray-600">
                {{ $t('employeeReports.foundObjects') }}: <span class="font-semibold">{{ filteredLandfills.length }}</span>
              </div>
              <div class="flex flex-wrap gap-2">
                <AppButton variant="primary" size="sm" @click="exportToExcel">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  {{ $t('common.excel') }}
                </AppButton>
                <AppButton variant="danger" size="sm" @click="exportToPdf">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                  {{ $t('common.pdf') }}
                </AppButton>
              </div>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{{ $t('common.name') }}</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{{ $t('common.region') }}</th>
                    <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{{ $t('common.type') }}</th>
                    <th class="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">{{ $t('employeeReports.thCapacity') }}</th>
                    <th class="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">{{ $t('employeeReports.thFilled') }}</th>
                    <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{{ $t('employeeReports.thFillPercent') }}</th>
                    <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{{ $t('employeeReports.thCondition') }}</th>
                    <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{{ $t('employeeReports.thCompliance') }}</th>
                    <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{{ $t('employeeReports.thInspection') }}</th>
                  </tr>
                </thead>
                <tbody v-if="filteredLandfills.length === 0">
                  <tr>
                    <td colspan="9">
                      <EmptyState
                        :title="$t('employeeReports.emptySearchTitle')"
                        :description="$t('employeeReports.emptyLandfillsDesc')"
                        :actionLabel="$t('common.reset')"
                        @action="landfillsFilters.region = ''; landfillsFilters.status = 'all'"
                      />
                    </td>
                  </tr>
                </tbody>
                <tbody v-else class="divide-y divide-gray-200">
                  <tr v-for="l in filteredLandfills" :key="l.id" class="hover:bg-gray-50">
                    <td class="px-4 py-3 font-medium text-gray-900">{{ l.name }}</td>
                    <td class="px-4 py-3 text-gray-600 text-sm">{{ l.region }}</td>
                    <td class="px-4 py-3 text-center">
                      <span :class="['text-xs px-2 py-1 rounded-full font-medium', l.type === 'Полигон' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700']">
                        {{ l.type }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-right text-gray-600">{{ formatNumber(l.capacityTotal) }}</td>
                    <td class="px-4 py-3 text-right text-gray-600">{{ formatNumber(l.capacityUsed) }}</td>
                    <td class="px-4 py-3">
                      <div class="flex items-center gap-2">
                        <div class="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div :class="['h-full rounded-full', getFillColor(l.fillPercent)]" :style="{ width: `${l.fillPercent}%` }"></div>
                        </div>
                        <span class="text-sm font-medium text-gray-700 w-10 text-right">{{ l.fillPercent }}%</span>
                      </div>
                    </td>
                    <td class="px-4 py-3 text-center">
                      <AppBadge :variant="getStatusBadgeVariant(l.condition)">
                        {{ getConditionLabel(l.condition) }}
                      </AppBadge>
                    </td>
                    <td class="px-4 py-3 text-center">
                      <span :class="['text-xs px-2 py-1 rounded-full font-medium', l.compliant ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700']">
                        {{ l.compliant ? $t('common.yes') : $t('common.no') }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-center text-gray-600 text-sm">{{ l.lastInspection }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </template>

      <!-- ========== ОТЧЁТ 3: ЛИЦЕНЗИИ ========== -->
      <template v-if="activeReport === 'licenses'">
        <!-- Filters -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="font-semibold text-gray-900 mb-4">{{ $t('employeeReports.reportParams') }}</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('common.period') }}</label>
              <input v-model="licensesFilters.dateFrom" type="date" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('common.period') }}</label>
              <input v-model="licensesFilters.dateTo" type="date" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('common.region') }}</label>
              <select v-model="licensesFilters.region" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option v-for="r in regions" :key="r" :value="r">{{ r }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('common.status') }}</label>
              <select v-model="licensesFilters.status" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="all">{{ $t('common.all') }}</option>
                <option value="active">{{ $t('employeeReports.licStatusActive') }}</option>
                <option value="expiring">{{ $t('employeeReports.licStatusExpiring') }}</option>
                <option value="expired">{{ $t('employeeReports.licStatusExpired') }}</option>
                <option value="revoked">{{ $t('employeeReports.licStatusRevoked') }}</option>
              </select>
            </div>
            <div class="flex items-end">
              <button
                @click="generateReport"
                :disabled="isGenerating"
                class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <svg v-if="isGenerating" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isGenerating ? $t('common.generating') : $t('common.generate') }}
              </button>
            </div>
          </div>
        </div>

        <!-- Results -->
        <div v-if="reportGenerated" class="space-y-6">
          <!-- Summary cards -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <p class="text-sm text-gray-500">{{ $t('employeeReports.totalLicenses') }}</p>
              <p class="text-2xl font-bold text-blue-600">{{ licensesSummary.total }}</p>
            </div>
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <p class="text-sm text-gray-500">{{ $t('employeeReports.activeLicenses') }}</p>
              <p class="text-2xl font-bold text-green-600">{{ licensesSummary.active }}</p>
            </div>
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <p class="text-sm text-gray-500">{{ $t('employeeReports.expiring30') }}</p>
              <p class="text-2xl font-bold text-amber-600">{{ licensesSummary.expiring }}</p>
            </div>
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <p class="text-sm text-gray-500">{{ $t('employeeReports.expiredRevoked') }}</p>
              <p class="text-2xl font-bold text-red-600">{{ licensesSummary.expiredRevoked }}</p>
            </div>
          </div>

          <!-- Table -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div class="text-sm text-gray-600">
                {{ $t('employeeReports.foundLicenses') }}: <span class="font-semibold">{{ filteredLicenses.length }}</span>
              </div>
              <div class="flex flex-wrap gap-2">
                <AppButton variant="primary" size="sm" @click="exportToExcel">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  {{ $t('common.excel') }}
                </AppButton>
                <AppButton variant="danger" size="sm" @click="exportToPdf">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                  {{ $t('common.pdf') }}
                </AppButton>
              </div>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{{ $t('employeeReports.thOrganization') }}</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{{ $t('employeeReports.thInn') }}</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{{ $t('employeeReports.thLicenseNumber') }}</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{{ $t('employeeReports.thActivity') }}</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{{ $t('common.region') }}</th>
                    <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{{ $t('employeeReports.thIssued') }}</th>
                    <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{{ $t('employeeReports.thValidUntil') }}</th>
                    <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{{ $t('common.status') }}</th>
                  </tr>
                </thead>
                <tbody v-if="filteredLicenses.length === 0">
                  <tr>
                    <td colspan="8">
                      <EmptyState
                        :title="$t('employeeReports.emptySearchTitle')"
                        :description="$t('employeeReports.emptyLicensesDesc')"
                        :actionLabel="$t('common.reset')"
                        @action="licensesFilters.region = ''; licensesFilters.status = 'all'"
                      />
                    </td>
                  </tr>
                </tbody>
                <tbody v-else class="divide-y divide-gray-200">
                  <tr v-for="l in filteredLicenses" :key="l.id" class="hover:bg-gray-50">
                    <td class="px-4 py-3 font-medium text-gray-900">{{ l.company }}</td>
                    <td class="px-4 py-3 text-gray-600 font-mono text-sm">{{ l.inn }}</td>
                    <td class="px-4 py-3 text-blue-600 font-medium">{{ l.licenseNumber }}</td>
                    <td class="px-4 py-3 text-gray-600 text-sm">{{ l.activity }}</td>
                    <td class="px-4 py-3 text-gray-600 text-sm">{{ l.region }}</td>
                    <td class="px-4 py-3 text-center text-gray-600 text-sm">{{ l.issueDate }}</td>
                    <td class="px-4 py-3 text-center text-gray-600 text-sm">{{ l.expiryDate }}</td>
                    <td class="px-4 py-3 text-center">
                      <AppBadge :variant="getStatusBadgeVariant(l.status)">
                        {{ getLicenseStatusLabel(l.status) }}
                      </AppBadge>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </template>

      <!-- ========== ОТЧЁТ 4: ВЫПОЛНЕНИЕ НОРМАТИВОВ ========== -->
      <template v-if="activeReport === 'normatives'">
        <!-- Filters -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="font-semibold text-gray-900 mb-4">{{ $t('employeeReports.reportParams') }}</h3>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('common.period') }}</label>
              <input v-model="normativesFilters.dateFrom" type="date" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('common.period') }}</label>
              <input v-model="normativesFilters.dateTo" type="date" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('common.region') }}</label>
              <select v-model="normativesFilters.region" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                <option v-for="r in regions" :key="r" :value="r">{{ r }}</option>
              </select>
            </div>
            <div class="flex items-end">
              <button
                @click="generateReport"
                :disabled="isGenerating"
                class="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <svg v-if="isGenerating" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isGenerating ? $t('common.generating') : $t('common.generate') }}
              </button>
            </div>
          </div>
        </div>

        <!-- Results -->
        <div v-if="reportGenerated" class="space-y-6">
          <!-- Summary cards -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <p class="text-sm text-gray-500">{{ $t('employeeReports.wasteTypes') }}</p>
              <p class="text-2xl font-bold text-emerald-600">{{ normativesSummary.total }}</p>
            </div>
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <p class="text-sm text-gray-500">{{ $t('employeeReports.meetNorm') }}</p>
              <p class="text-2xl font-bold text-green-600">{{ normativesSummary.fulfilled }}</p>
            </div>
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <p class="text-sm text-gray-500">{{ $t('employeeReports.partialNorm') }}</p>
              <p class="text-2xl font-bold text-amber-600">{{ normativesSummary.partial }}</p>
            </div>
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <p class="text-sm text-gray-500">{{ $t('employeeReports.failNorm') }}</p>
              <p class="text-2xl font-bold text-red-600">{{ normativesSummary.failed }}</p>
            </div>
          </div>

          <!-- Table -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div class="text-sm text-gray-600">
                {{ $t('employeeReports.wasteTypes') }}: <span class="font-semibold">{{ normativesData.length }}</span>
              </div>
              <div class="flex flex-wrap gap-2">
                <AppButton variant="primary" size="sm" @click="exportToExcel">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  {{ $t('common.excel') }}
                </AppButton>
                <AppButton variant="danger" size="sm" @click="exportToPdf">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                  {{ $t('common.pdf') }}
                </AppButton>
              </div>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{{ $t('employeeReports.thWasteType') }}</th>
                    <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{{ $t('employeeReports.thNormPercent') }}</th>
                    <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{{ $t('employeeReports.thFactPercent') }}</th>
                    <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase w-48">{{ $t('employeeReports.thFulfillment') }}</th>
                    <th class="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">{{ $t('employeeReports.thGenerationVolume') }}</th>
                    <th class="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">{{ $t('employeeReports.thRecycled') }}</th>
                    <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{{ $t('common.status') }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr v-for="n in normativesData" :key="n.id" class="hover:bg-gray-50">
                    <td class="px-4 py-3 font-medium text-gray-900">{{ n.wasteType }}</td>
                    <td class="px-4 py-3 text-center text-gray-600">{{ n.targetPercent }}%</td>
                    <td class="px-4 py-3 text-center font-bold" :class="n.actualPercent >= n.targetPercent ? 'text-green-600' : 'text-amber-600'">{{ n.actualPercent }}%</td>
                    <td class="px-4 py-3">
                      <div class="flex items-center gap-2">
                        <div class="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden relative">
                          <!-- Target marker -->
                          <div class="absolute top-0 bottom-0 w-0.5 bg-gray-400 z-10" :style="{ left: `${Math.min(n.targetPercent * 2, 100)}%` }"></div>
                          <!-- Actual bar -->
                          <div
                            :class="['h-full rounded-full', n.actualPercent >= n.targetPercent ? 'bg-green-500' : n.status === 'failed' ? 'bg-red-400' : 'bg-amber-400']"
                            :style="{ width: `${Math.min(n.actualPercent * 2, 100)}%` }"
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td class="px-4 py-3 text-right text-gray-600">{{ n.volume.toFixed(1) }}</td>
                    <td class="px-4 py-3 text-right text-gray-600">{{ n.recycled.toFixed(1) }}</td>
                    <td class="px-4 py-3 text-center">
                      <AppBadge :variant="getStatusBadgeVariant(n.status)">
                        {{ getNormStatusLabel(n.status) }}
                      </AppBadge>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </template>

      <!-- ========== ОТЧЁТ 5: ПО РЕГИОНАМ ========== -->
      <template v-if="activeReport === 'regions'">
        <!-- Filters -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="font-semibold text-gray-900 mb-4">{{ $t('employeeReports.reportParams') }}</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('common.period') }}</label>
              <input v-model="regionsFilters.dateFrom" type="date" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('common.period') }}</label>
              <input v-model="regionsFilters.dateTo" type="date" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div class="flex items-end">
              <button
                @click="generateReport"
                :disabled="isGenerating"
                class="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <svg v-if="isGenerating" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isGenerating ? $t('common.generating') : $t('common.generate') }}
              </button>
            </div>
          </div>
        </div>

        <!-- Results -->
        <div v-if="reportGenerated" class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <!-- Export buttons -->
          <div class="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <div class="text-sm text-gray-600">
              {{ $t('employeeReports.distributionBy') }} <span class="font-semibold">{{ regionsData.length }}</span> {{ $t('employeeReports.regionsCount') }}
            </div>
            <div class="flex flex-wrap gap-2">
              <AppButton variant="primary" size="sm" @click="exportToExcel">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                {{ $t('common.excel') }}
              </AppButton>
              <AppButton variant="danger" size="sm" @click="exportToPdf">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                {{ $t('common.pdf') }}
              </AppButton>
            </div>
          </div>

          <!-- Table -->
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{{ $t('common.region') }}</th>
                  <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{{ $t('employeeReports.thOrganizations') }}</th>
                  <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{{ $t('employeeReports.thRecyclers') }}</th>
                  <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{{ $t('employeeReports.thLandfills') }}</th>
                  <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{{ $t('employeeReports.thLicenses') }}</th>
                  <th class="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">{{ $t('employeeReports.thRecyclingVolume') }}</th>
                  <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{{ $t('employeeReports.thNormCompliance') }}</th>
                  <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{{ $t('employeeReports.thShare') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="r in regionsData" :key="r.id" class="hover:bg-gray-50">
                  <td class="px-4 py-3 font-medium text-gray-900">{{ r.region }}</td>
                  <td class="px-4 py-3 text-center text-gray-600">{{ r.organizations }}</td>
                  <td class="px-4 py-3 text-center text-gray-600">{{ r.recyclers }}</td>
                  <td class="px-4 py-3 text-center text-gray-600">{{ r.landfills }}</td>
                  <td class="px-4 py-3 text-center text-gray-600">{{ r.licenses }}</td>
                  <td class="px-4 py-3 text-right font-medium">{{ r.volume.toFixed(1) }}</td>
                  <td class="px-4 py-3 text-center">
                    <span :class="['font-medium', r.normPercent >= 70 ? 'text-green-600' : r.normPercent >= 55 ? 'text-amber-600' : 'text-red-600']">
                      {{ r.normPercent }}%
                    </span>
                  </td>
                  <td class="px-4 py-3 text-center">
                    <div class="flex items-center gap-2">
                      <div class="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div class="h-full bg-indigo-500 rounded-full" :style="{ width: `${r.share}%` }"></div>
                      </div>
                      <span class="text-sm text-gray-600 w-10">{{ r.share }}%</span>
                    </div>
                  </td>
                </tr>
              </tbody>
              <tfoot class="bg-indigo-50 border-t-2 border-indigo-200">
                <tr>
                  <td class="px-4 py-3 font-bold text-gray-900">{{ $t('common.total') }}:</td>
                  <td class="px-4 py-3 text-center font-bold">{{ regionsTotals.organizations }}</td>
                  <td class="px-4 py-3 text-center font-bold">{{ regionsTotals.recyclers }}</td>
                  <td class="px-4 py-3 text-center font-bold">{{ regionsTotals.landfills }}</td>
                  <td class="px-4 py-3 text-center font-bold">{{ regionsTotals.licenses }}</td>
                  <td class="px-4 py-3 text-right font-bold text-indigo-700">{{ regionsTotals.volume.toFixed(1) }} т</td>
                  <td class="px-4 py-3 text-center font-bold">—</td>
                  <td class="px-4 py-3 text-center font-bold">100%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </template>
      </template>
    </div>
  </DashboardLayout>
</template>
