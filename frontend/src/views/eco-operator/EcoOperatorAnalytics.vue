<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import { icons } from '../../utils/menuIcons'
import { calculationStore } from '../../stores/calculations'
import { refundStore } from '../../stores/refunds'
import { reportStore } from '../../stores/reports'
import { productGroups, getSubgroupLabel } from '../../data/product-groups'

const menuItems = computed(() => [
  { id: 'dashboard', label: 'Главная', icon: icons.dashboard, route: '/eco-operator' },
  { id: 'incoming-calculations', label: 'Входящие расчёты', icon: icons.calculator, route: '/eco-operator/calculations', badge: calculationStore.getCalcReviewCount() },
  { id: 'incoming-declarations', label: 'Входящие декларации', icon: icons.document, route: '/eco-operator/incoming-declarations' },
  { id: 'incoming-reports', label: 'Входящие отчёты', icon: icons.report, route: '/eco-operator/incoming-reports', badge: reportStore.getPendingCount() },
  { id: 'refunds', label: 'Заявки на возврат', icon: icons.refund, route: '/eco-operator/refunds', badge: refundStore.getPendingRefundsCount() },
  { id: 'accounts', label: 'Лицевые счета', icon: icons.money, route: '/eco-operator/accounts' },
  { id: 'analytics', label: 'Аналитика и отчёты', icon: icons.analytics, route: '/eco-operator/analytics' },
  { id: 'profile', label: 'Профили компаний', icon: icons.profile, route: '/eco-operator/profile' },
  { id: 'recyclers-registry', label: 'Реестр переработчиков', icon: icons.recycle, route: '/eco-operator/recyclers' },
])

// ─── Tabs ───
type TabId = 'finance' | 'products' | 'reports'
const activeTab = ref<TabId>('finance')
const tabs: { id: TabId; label: string }[] = [
  { id: 'finance', label: 'Финансы' },
  { id: 'products', label: 'Товары и переработка' },
  { id: 'reports', label: 'Выгрузка отчётов' },
]

// ─── Period filter ───
type PeriodMode = 'month' | 'quarter' | 'year' | 'custom'
const activePeriodMode = ref<PeriodMode>('quarter')
const selectedQuarter = ref('q1_2026')
const customFrom = ref('')
const customTo = ref('')

// Generate quarter options from 2026 up to current year
const quarterOptions = computed(() => {
  const currentYear = new Date().getFullYear()
  const startYear = 2026
  const endYear = Math.max(startYear, currentYear)
  const opts: { key: string; label: string; year: number }[] = []
  for (let y = startYear; y <= endYear; y++) {
    for (let q = 1; q <= 4; q++) {
      opts.push({ key: `q${q}_${y}`, label: `Q${q} ${y}`, year: y })
    }
  }
  return opts
})

function parseDDMMYYYY(s: string): Date | null {
  const parts = s.split('.')
  if (parts.length !== 3) return null
  return new Date(+parts[2], +parts[1] - 1, +parts[0])
}

function getQuarterDates(key: string): [Date, Date] {
  const m = key.match(/^q(\d)_(\d{4})$/)
  if (!m) return [new Date(2026, 0, 1), new Date(2026, 2, 31)]
  const q = +m[1], y = +m[2]
  const startMonth = (q - 1) * 3
  const endMonth = startMonth + 2
  const endDay = new Date(y, endMonth + 1, 0).getDate() // last day of quarter
  return [new Date(y, startMonth, 1), new Date(y, endMonth, endDay)]
}

function getDateRange(): [Date, Date] {
  const now = new Date(2026, 1, 12)
  switch (activePeriodMode.value) {
    case 'month': return [new Date(2026, 1, 1), new Date(2026, 1, 28)]
    case 'quarter': return getQuarterDates(selectedQuarter.value)
    case 'year': return [new Date(2026, 0, 1), new Date(2026, 11, 31)]
    case 'custom': {
      const f = parseDDMMYYYY(customFrom.value)
      const t = parseDDMMYYYY(customTo.value)
      return [f || new Date(2026, 0, 1), t || now]
    }
  }
}

function isInRange(dateStr: string): boolean {
  const d = parseDDMMYYYY(dateStr)
  if (!d) return false
  const [from, to] = getDateRange()
  return d >= from && d <= to
}

// ─── Payer filter ───
const payerSearch = ref('')
const selectedPayer = ref<string | null>(null)
const showPayerSuggestions = ref(false)

const allPayers = computed(() => {
  const map = new Map<string, string>()
  calculationStore.state.calculations.forEach(c => {
    if (!map.has(c.company)) map.set(c.company, c.inn)
  })
  return Array.from(map.entries()).map(([company, inn]) => ({ company, inn }))
})

const filteredPayers = computed(() => {
  if (!payerSearch.value.trim()) return allPayers.value
  const q = payerSearch.value.toLowerCase()
  return allPayers.value.filter(p =>
    p.company.toLowerCase().includes(q) || p.inn.includes(q)
  )
})

function selectPayer(company: string) {
  selectedPayer.value = company
  payerSearch.value = ''
  showPayerSuggestions.value = false
}

function clearPayer() {
  selectedPayer.value = null
  payerSearch.value = ''
}

let blurTimeout: ReturnType<typeof setTimeout> | null = null
function onPayerBlur() {
  blurTimeout = setTimeout(() => { showPayerSuggestions.value = false }, 200)
}
function onPayerFocus() {
  if (blurTimeout) clearTimeout(blurTimeout)
  showPayerSuggestions.value = true
}

// ─── Filtered data from stores ───
const paidCalcs = computed(() =>
  calculationStore.state.calculations.filter(c =>
    (c.status === 'Оплачено' || c.status === 'Принято') && isInRange(c.date) &&
    (!selectedPayer.value || c.company === selectedPayer.value)
  )
)

const approvedRefunds = computed(() =>
  refundStore.state.refunds.filter(r =>
    (r.status === 'Одобрена' || r.status === 'На рассмотрении') && isInRange(r.date) &&
    (!selectedPayer.value || r.company === selectedPayer.value)
  )
)

// ─── Financial summary ───
const totalIncome = computed(() => paidCalcs.value.reduce((s, c) => s + c.totalAmount, 0))
const totalRefunded = computed(() => approvedRefunds.value.reduce((s, r) => s + r.totalRefund, 0))
const netIncome = computed(() => totalIncome.value - totalRefunded.value)
const avgCalc = computed(() => paidCalcs.value.length ? Math.round(totalIncome.value / paidCalcs.value.length) : 0)

// ─── Bar chart data — monthly mock with realistic dynamics ───
const chartMode = ref<'months' | 'quarters'>('months')

const monthlyMock = [
  { label: 'Янв', income: 1089128, refunds: 253 },
  { label: 'Фев', income: 620425, refunds: 1986 },
  { label: 'Мар', income: 480000, refunds: 0 },
  { label: 'Апр', income: 720000, refunds: 1200 },
  { label: 'Май', income: 890000, refunds: 3500 },
  { label: 'Июн', income: 1050000, refunds: 2800 },
  { label: 'Июл', income: 1180000, refunds: 1500 },
  { label: 'Авг', income: 960000, refunds: 4200 },
  { label: 'Сен', income: 1350000, refunds: 1800 },
  { label: 'Окт', income: 1520000, refunds: 2200 },
  { label: 'Ноя', income: 1680000, refunds: 3100 },
  { label: 'Дек', income: 1920000, refunds: 4500 },
]

const quarterlyMock = [
  { label: 'Q1', income: 2189553, refunds: 2239 },
  { label: 'Q2', income: 2660000, refunds: 7500 },
  { label: 'Q3', income: 3490000, refunds: 7500 },
  { label: 'Q4', income: 5120000, refunds: 9800 },
]

const chartData = computed(() => chartMode.value === 'months' ? monthlyMock : quarterlyMock)
const chartMaxVal = computed(() => Math.max(...chartData.value.map(d => Math.max(d.income, d.refunds))))

const hoveredBar = ref<number | null>(null)
const hoveredType = ref<'income' | 'refunds' | null>(null)

function fmtShort(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K'
  return String(n)
}

function fmtFull(n: number): string {
  return n.toLocaleString('ru-RU') + ' сом'
}

// ─── Top product groups ───
interface GroupAnalytics {
  group: string
  label: string
  calcCount: number
  totalMass: number
  totalAmount: number
  subgroups: { subgroup: string; label: string; count: number; mass: number; amount: number }[]
}

const groupRanking = computed<GroupAnalytics[]>(() => {
  const map = new Map<string, GroupAnalytics>()

  paidCalcs.value.forEach(calc => {
    calc.items.forEach(item => {
      let ga = map.get(item.group)
      if (!ga) {
        const gObj = productGroups.find(g => g.value === item.group)
        ga = { group: item.group, label: gObj?.label || item.group, calcCount: 0, totalMass: 0, totalAmount: 0, subgroups: [] }
        map.set(item.group, ga)
      }
      ga.totalMass += parseFloat(item.volume) || 0
      ga.totalAmount += item.amount

      let sg = ga.subgroups.find(s => s.subgroup === item.subgroup)
      if (!sg) {
        sg = { subgroup: item.subgroup, label: getSubgroupLabel(item.group, item.subgroup), count: 0, mass: 0, amount: 0 }
        ga.subgroups.push(sg)
      }
      sg.count++
      sg.mass += parseFloat(item.volume) || 0
      sg.amount += item.amount
    })
    // count each calc once per group it touches
    const groups = new Set(calc.items.map(i => i.group))
    groups.forEach(g => {
      const ga = map.get(g)
      if (ga) ga.calcCount++
    })
  })

  return Array.from(map.values()).sort((a, b) => b.totalAmount - a.totalAmount)
})

const totalGroupAmount = computed(() => groupRanking.value.reduce((s, g) => s + g.totalAmount, 0))

const expandedGroups = ref<Set<string>>(new Set())
function toggleGroup(g: string) {
  if (expandedGroups.value.has(g)) expandedGroups.value.delete(g)
  else expandedGroups.value.add(g)
}

// ─── Export dropdown ───
const showExportMenu = ref(false)

function doExport(format: string) {
  showExportMenu.value = false
  alert(`Отчёт формируется в формате ${format}...`)
}

// ─── Reports tab ───
const reportTemplates = [
  { id: 'period', title: 'Отчёт по поступлениям за период', description: 'Детализация всех поступлений утильсбора за выбранный период с фильтрацией по плательщикам и группам товаров', icon: 'money', color: '#22C55E' },
  { id: 'payers', title: 'Отчёт по плательщикам', description: 'Список плательщиков утильсбора с суммами начислений и оплат за выбранный период', icon: 'users', color: '#3B82F6' },
  { id: 'groups', title: 'Отчёт по группам товаров', description: 'Структура поступлений утильсбора в разрезе 24 групп товаров и подгрупп', icon: 'chart', color: '#F59E0B' },
  { id: 'summary', title: 'Сводный отчёт для руководства', description: 'Комплексный отчёт: финансовая сводка, товарная структура и динамика поступлений', icon: 'document', color: '#8B5CF6' },
]

const activeReportTemplate = ref<string | null>(null)
const isGeneratingReport = ref(false)
const reportPreviewReady = ref(false)
const reportDateFrom = ref('2026-01-01')
const reportDateTo = ref('2026-03-31')

function openReportTemplate(id: string) {
  activeReportTemplate.value = id
  isGeneratingReport.value = false
  reportPreviewReady.value = false
}

function backToReportList() {
  activeReportTemplate.value = null
  isGeneratingReport.value = false
  reportPreviewReady.value = false
}

function generateReport() {
  isGeneratingReport.value = true
  reportPreviewReady.value = false
  setTimeout(() => {
    isGeneratingReport.value = false
    reportPreviewReady.value = true
  }, 1500)
}

function downloadReportFile(_format: string) {
  alert('Функция будет реализована с серверной генерацией')
}

// Mock data for report previews
const periodReportMock = [
  { company: 'ОсОО "БишкекПласт"', inn: '01234567891234', group: 'Группа 6 — Пластмассовые упаковочные', amount: 117725, date: '15.01.2026' },
  { company: 'ОсОО "ТаласПак"', inn: '08912345678901', group: 'Группа 22 — Упаковка из гофрокартона', amount: 92001, date: '20.01.2026' },
  { company: 'ОАО "ОшМеталл"', inn: '03456789123456', group: 'Группа 12 — Аккумуляторы свинцовые', amount: 62009, date: '25.01.2026' },
  { company: 'ИП "Асанов"', inn: '12345678901234', group: 'Группа 8 — Стекло полое', amount: 63285, date: '28.01.2026' },
  { company: 'ОсОО "GreenPack"', inn: '04567891234567', group: 'Группа 19 — Упаковка полимерная', amount: 48974, date: '02.02.2026' },
  { company: 'ОсОО "АвтоШина"', inn: '09123456789012', group: 'Группа 4 — Шины и покрышки', amount: 555525, date: '05.02.2026' },
  { company: 'ОсОО "ЭкоРесайкл"', inn: '02345678912345', group: 'Группа 1 — Гофрированная бумага', amount: 119825, date: '12.03.2026' },
  { company: 'ОсОО "ИссыкКульЭко"', inn: '06789123456789', group: 'Группа 2 — Негофрированная бумага', amount: 123090, date: '18.03.2026' },
]

const payersReportMock = [
  { company: 'ОсОО "АвтоШина"', inn: '09123456789012', calcs: 3, total: 1168025 },
  { company: 'ОсОО "БишкекПласт"', inn: '01234567891234', calcs: 4, total: 243615 },
  { company: 'ОсОО "ЭкоРесайкл"', inn: '02345678912345', calcs: 2, total: 119825 },
  { company: 'ОсОО "ИссыкКульЭко"', inn: '06789123456789', calcs: 2, total: 123090 },
  { company: 'ОсОО "ТаласПак"', inn: '08912345678901', calcs: 3, total: 184002 },
  { company: 'ОАО "ОшМеталл"', inn: '03456789123456', calcs: 1, total: 62009 },
]

const groupsReportMock = [
  { number: 4, name: 'Шины, покрышки и камеры резиновые', amount: 1168025, share: 38.2 },
  { number: 6, name: 'Изделия пластмассовые упаковочные', amount: 243615, share: 8.0 },
  { number: 22, name: 'Упаковка из гофрокартона', amount: 184002, share: 6.0 },
  { number: 2, name: 'Изделия из негофрированной бумаги', amount: 123090, share: 4.0 },
  { number: 1, name: 'Изделия из гофрированной бумаги', amount: 119825, share: 3.9 },
  { number: 8, name: 'Стекло полое', amount: 63285, share: 2.1 },
]

const summaryReportMock = [
  { indicator: 'Поступления утильсбора за период', value: '1 182 434 сом' },
  { indicator: 'Возвраты за период', value: '2 239 сом' },
  { indicator: 'Чистые поступления', value: '1 180 195 сом' },
  { indicator: 'Количество расчётов', value: '15' },
  { indicator: 'Средняя сумма расчёта', value: '78 829 сом' },
  { indicator: 'Количество плательщиков', value: '12' },
  { indicator: 'Количество групп товаров', value: '18' },
  { indicator: 'Лидирующая группа товаров', value: 'Группа 4 — Шины (38.2%)' },
  { indicator: 'Динамика к предыдущему периоду', value: '+12.5%' },
  { indicator: 'Прогноз на следующий квартал', value: '1 350 000 сом' },
]

function getReportTemplateTitle(id: string): string {
  return reportTemplates.find(t => t.id === id)?.title || ''
}

// ─── Finance tab: Donut "По группам товаров" ───
const donutGroupColors = ['#22C55E', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#94A3B8']

const incomeByGroup = computed(() => {
  const map = new Map<string, { label: string; amount: number }>()
  paidCalcs.value.forEach(c => {
    c.items.forEach(item => {
      const gObj = productGroups.find(g => g.value === item.group)
      const label = gObj?.label || item.group
      const existing = map.get(item.group)
      if (existing) existing.amount += item.amount
      else map.set(item.group, { label, amount: item.amount })
    })
  })
  const sorted = Array.from(map.values()).sort((a, b) => b.amount - a.amount)
  const top6 = sorted.slice(0, 6)
  const restAmount = sorted.slice(6).reduce((s, g) => s + g.amount, 0)
  if (restAmount > 0) top6.push({ label: 'Прочие', amount: restAmount })
  return top6
})

const incomeByGroupTotal = computed(() => incomeByGroup.value.reduce((s, g) => s + g.amount, 0))

// ─── SVG Donut helpers ───
function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function describeArc(cx: number, cy: number, outerR: number, innerR: number, startAngle: number, endAngle: number): string {
  const sweep = Math.min(endAngle - startAngle, 359.999)
  const end = startAngle + sweep
  const sOuter = polarToCartesian(cx, cy, outerR, end)
  const eOuter = polarToCartesian(cx, cy, outerR, startAngle)
  const sInner = polarToCartesian(cx, cy, innerR, startAngle)
  const eInner = polarToCartesian(cx, cy, innerR, end)
  const large = sweep > 180 ? 1 : 0
  return [
    'M', sOuter.x, sOuter.y,
    'A', outerR, outerR, 0, large, 0, eOuter.x, eOuter.y,
    'L', sInner.x, sInner.y,
    'A', innerR, innerR, 0, large, 1, eInner.x, eInner.y,
    'Z'
  ].join(' ')
}

function segmentPush(startAngle: number, endAngle: number, distance: number) {
  const mid = (startAngle + endAngle) / 2
  const rad = ((mid - 90) * Math.PI) / 180
  return { x: distance * Math.cos(rad), y: distance * Math.sin(rad) }
}

// ─── Donut animation ───
const donutAnimProgress = ref(0)
const legendVisible = ref(false)
let animFrame: number | null = null

function startDonutAnimation() {
  donutAnimProgress.value = 0
  legendVisible.value = false
  const start = performance.now()
  const duration = 800

  function tick(now: number) {
    const elapsed = now - start
    const t = Math.min(elapsed / duration, 1)
    donutAnimProgress.value = 1 - Math.pow(1 - t, 3)
    if (t < 1) {
      animFrame = requestAnimationFrame(tick)
    } else {
      donutAnimProgress.value = 1
    }
  }
  animFrame = requestAnimationFrame(tick)
  setTimeout(() => { legendVisible.value = true }, 300)
}

onMounted(() => {
  startDonutAnimation()
})

watch(activeTab, () => {
  nextTick(() => startDonutAnimation())
})

// ─── Donut hover state ───
const hoveredGroupIdx = ref<number | null>(null)
const hoveredPayerIdx = ref<number | null>(null)
const hoveredMassIdx = ref<number | null>(null)
const donutTooltip = ref({ visible: false, x: 0, y: 0, label: '', value: '', pct: '', extra: '' })

function showDonutTooltip(event: MouseEvent, label: string, value: string, pct: string, extra: string = '') {
  const rect = (event.currentTarget as SVGElement).closest('.an-donut-svg-wrap')?.getBoundingClientRect()
  if (!rect) return
  donutTooltip.value = {
    visible: true,
    x: event.clientX - rect.left + 12,
    y: event.clientY - rect.top - 10,
    label, value, pct, extra
  }
}

function moveDonutTooltip(event: MouseEvent) {
  const rect = (event.currentTarget as SVGElement).closest('.an-donut-svg-wrap')?.getBoundingClientRect()
  if (!rect) return
  donutTooltip.value.x = event.clientX - rect.left + 12
  donutTooltip.value.y = event.clientY - rect.top - 10
}

function hideDonutTooltip() {
  donutTooltip.value.visible = false
}

interface DonutSegment {
  path: string
  color: string
  startAngle: number
  endAngle: number
  pushX: number
  pushY: number
}

const groupDonutSegments = computed<DonutSegment[]>(() => {
  const total = incomeByGroupTotal.value
  if (total === 0) return []
  const cx = 110, cy = 110, outerR = 88, innerR = 52
  let cumAngle = 0
  return incomeByGroup.value.map((g, i) => {
    const sweep = (g.amount / total) * 360 * donutAnimProgress.value
    const startAngle = cumAngle
    const endAngle = cumAngle + sweep
    cumAngle += (g.amount / total) * 360
    const push = segmentPush(startAngle, startAngle + (g.amount / total) * 360, 8)
    return {
      path: describeArc(cx, cy, outerR, innerR, startAngle, Math.max(endAngle, startAngle + 0.1)),
      color: donutGroupColors[i % donutGroupColors.length],
      startAngle,
      endAngle: startAngle + (g.amount / total) * 360,
      pushX: push.x,
      pushY: push.y
    }
  })
})

// ─── Finance tab: Donut "По типу плательщиков" ───
const payerTypeData = [
  { label: 'ОсОО', pct: 55, color: '#3B82F6' },
  { label: 'ОАО', pct: 20, color: '#22C55E' },
  { label: 'ИП', pct: 15, color: '#F59E0B' },
  { label: 'Прочие', pct: 10, color: '#94A3B8' },
]

const payerTypeWithAmounts = computed(() => {
  const total = totalIncome.value
  return payerTypeData.map(p => ({
    ...p,
    amount: Math.round(total * p.pct / 100)
  }))
})

const payerTypeTotal = computed(() => payerTypeWithAmounts.value.reduce((s, p) => s + p.amount, 0))

const payerDonutSegments = computed<DonutSegment[]>(() => {
  const cx = 110, cy = 110, outerR = 88, innerR = 52
  let cumAngle = 0
  return payerTypeData.map((p, i) => {
    const sweep = (p.pct / 100) * 360 * donutAnimProgress.value
    const startAngle = cumAngle
    const endAngle = cumAngle + sweep
    cumAngle += (p.pct / 100) * 360
    const push = segmentPush(startAngle, startAngle + (p.pct / 100) * 360, 8)
    return {
      path: describeArc(cx, cy, outerR, innerR, startAngle, Math.max(endAngle, startAngle + 0.1)),
      color: p.color,
      startAngle,
      endAngle: startAngle + (p.pct / 100) * 360,
      pushX: push.x,
      pushY: push.y
    }
  })
})

// ─── Finance tab: Top 10 payers ───
const showAllPayers = ref(false)

interface PayerSummary {
  company: string
  inn: string
  calcCount: number
  totalAmount: number
}

const payerRanking = computed<PayerSummary[]>(() => {
  const map = new Map<string, PayerSummary>()
  paidCalcs.value.forEach(c => {
    let p = map.get(c.company)
    if (!p) {
      p = { company: c.company, inn: c.inn, calcCount: 0, totalAmount: 0 }
      map.set(c.company, p)
    }
    p.calcCount++
    p.totalAmount += c.totalAmount
  })
  return Array.from(map.values()).sort((a, b) => b.totalAmount - a.totalAmount)
})

const topPayersTotalAmount = computed(() => payerRanking.value.reduce((s, p) => s + p.totalAmount, 0))

const visiblePayers = computed(() => showAllPayers.value ? payerRanking.value : payerRanking.value.slice(0, 10))

// ─── Finance tab: Debtors ───
const debtors = [
  { company: 'ОсОО «СтройИмпорт»', inn: '11234567890123', debt: 245800, overdueDays: 45, status: 'Просрочка' },
  { company: 'ИП Абдуллаев', inn: '22345678901234', debt: 178500, overdueDays: 32, status: 'Уведомление отправлено' },
  { company: 'ОсОО «МеталлТрейд»', inn: '33456789012345', debt: 156200, overdueDays: 28, status: 'Просрочка' },
  { company: 'ОАО «ПластПром»', inn: '44567890123456', debt: 98750, overdueDays: 15, status: 'Уведомление отправлено' },
  { company: 'ОсОО «ТекстильГрупп»', inn: '55678901234567', debt: 67300, overdueDays: 12, status: 'Просрочка' },
]

const totalDebt = computed(() => debtors.reduce((s, d) => s + d.debt, 0))

// ─── Finance tab: Horizontal bar chart by groups ───
const groupBarData = computed(() => groupRanking.value.slice(0, 8))
const groupBarMax = computed(() => Math.max(...groupBarData.value.map(g => g.totalAmount), 1))

// ─── Products tab: Donut by mass ───
const incomeByGroupMass = computed(() => {
  const map = new Map<string, { label: string; mass: number }>()
  paidCalcs.value.forEach(c => {
    c.items.forEach(item => {
      const gObj = productGroups.find(g => g.value === item.group)
      const label = gObj?.label || item.group
      const existing = map.get(item.group)
      if (existing) existing.mass += parseFloat(item.volume) || 0
      else map.set(item.group, { label, mass: parseFloat(item.volume) || 0 })
    })
  })
  const sorted = Array.from(map.values()).sort((a, b) => b.mass - a.mass)
  const top6 = sorted.slice(0, 6)
  const restMass = sorted.slice(6).reduce((s, g) => s + g.mass, 0)
  if (restMass > 0) top6.push({ label: 'Прочие', mass: restMass })
  return top6
})

const totalGroupMass = computed(() => incomeByGroupMass.value.reduce((s, g) => s + g.mass, 0))

const massDonutSegments = computed<DonutSegment[]>(() => {
  const total = totalGroupMass.value
  if (total === 0) return []
  const cx = 110, cy = 110, outerR = 88, innerR = 52
  let cumAngle = 0
  return incomeByGroupMass.value.map((g, i) => {
    const sweep = (g.mass / total) * 360 * donutAnimProgress.value
    const startAngle = cumAngle
    const endAngle = cumAngle + sweep
    cumAngle += (g.mass / total) * 360
    const push = segmentPush(startAngle, startAngle + (g.mass / total) * 360, 8)
    return {
      path: describeArc(cx, cy, outerR, innerR, startAngle, Math.max(endAngle, startAngle + 0.1)),
      color: donutGroupColors[i % donutGroupColors.length],
      startAngle,
      endAngle: startAngle + (g.mass / total) * 360,
      pushX: push.x,
      pushY: push.y
    }
  })
})

// Center display for group donut
const groupCenterValue = computed(() => {
  if (hoveredGroupIdx.value !== null && incomeByGroup.value[hoveredGroupIdx.value]) {
    return incomeByGroup.value[hoveredGroupIdx.value].amount
  }
  return Math.round(incomeByGroupTotal.value * donutAnimProgress.value)
})

const groupCenterLabel = computed(() => {
  if (hoveredGroupIdx.value !== null && incomeByGroup.value[hoveredGroupIdx.value]) {
    return incomeByGroup.value[hoveredGroupIdx.value].label
  }
  return 'Итого'
})

// Center display for payer type donut
const payerCenterValue = computed(() => {
  if (hoveredPayerIdx.value !== null && payerTypeWithAmounts.value[hoveredPayerIdx.value]) {
    return payerTypeWithAmounts.value[hoveredPayerIdx.value].amount
  }
  return Math.round(payerTypeTotal.value * donutAnimProgress.value)
})

const payerCenterLabel = computed(() => {
  if (hoveredPayerIdx.value !== null && payerTypeData[hoveredPayerIdx.value]) {
    return payerTypeData[hoveredPayerIdx.value].label
  }
  return 'Итого'
})

// Center display for mass donut
const massCenterValue = computed(() => {
  if (hoveredMassIdx.value !== null && incomeByGroupMass.value[hoveredMassIdx.value]) {
    return incomeByGroupMass.value[hoveredMassIdx.value].mass
  }
  return parseFloat((totalGroupMass.value * donutAnimProgress.value).toFixed(1))
})

const massCenterLabel = computed(() => {
  if (hoveredMassIdx.value !== null && incomeByGroupMass.value[hoveredMassIdx.value]) {
    return incomeByGroupMass.value[hoveredMassIdx.value].label
  }
  return 'Итого'
})

// Format center value for display
function fmtCenter(n: number, unit: string = 'сом'): string {
  if (unit === 'т') return n.toFixed(1) + ' т'
  return n.toLocaleString('ru-RU') + ' сом'
}

// ─── Products tab: Dynamic mock for rate and trend ───
function getAvgRate(totalAmount: number, totalMass: number): string {
  if (!totalMass) return '—'
  return Math.round(totalAmount / totalMass).toLocaleString('ru-RU')
}

// Seeded pseudo-random for stable mock trends per group
function mockTrend(seed: string): { value: number; up: boolean } {
  let hash = 0
  for (let i = 0; i < seed.length; i++) { hash = ((hash << 5) - hash) + seed.charCodeAt(i); hash |= 0 }
  const pct = ((Math.abs(hash) % 300) / 10) - 15 // -15 to +15
  return { value: Math.abs(Math.round(pct * 10) / 10), up: pct >= 0 }
}

// ─── Products tab: Top 10 subgroups by mass ───
interface SubgroupFlat {
  subgroup: string
  label: string
  parentGroup: string
  mass: number
  amount: number
}

const flatSubgroups = computed<SubgroupFlat[]>(() => {
  const result: SubgroupFlat[] = []
  groupRanking.value.forEach(ga => {
    ga.subgroups.forEach(sg => {
      result.push({
        subgroup: sg.subgroup,
        label: sg.label,
        parentGroup: ga.label,
        mass: sg.mass,
        amount: sg.amount,
      })
    })
  })
  return result.sort((a, b) => b.mass - a.mass).slice(0, 10)
})

const flatSubgroupMaxMass = computed(() => Math.max(...flatSubgroups.value.map(s => s.mass), 1))

// ─── Products tab: Recycling analysis ───
const recyclingKpis = computed(() => {
  const totalActual = recyclingComparison.reduce((s, r) => s + r.actual, 0)
  const totalRequired = recyclingComparison.reduce((s, r) => s + r.required, 0)
  const pct = totalRequired > 0 ? (totalActual / totalRequired * 100).toFixed(1) : '0'
  return [
    { title: 'Общий объём переработки', value: totalActual.toLocaleString('ru-RU') + ' т', icon: 'recycle', color: '#22C55E', bg: '#dcfce7' },
    { title: 'Целевой показатель', value: totalRequired.toLocaleString('ru-RU') + ' т', icon: 'target', color: '#3B82F6', bg: '#dbeafe' },
    { title: 'Выполнение норматива', value: pct + '%', icon: 'chart', color: parseFloat(pct) >= 100 ? '#22C55E' : '#F59E0B', bg: parseFloat(pct) >= 100 ? '#dcfce7' : '#fef3c7' },
  ]
})

const recyclingComparison = [
  { label: 'Пластик', required: 850, actual: 720 },
  { label: 'Бумага/картон', required: 600, actual: 580 },
  { label: 'Стекло', required: 400, actual: 310 },
  { label: 'Металл', required: 350, actual: 420 },
  { label: 'Текстиль', required: 200, actual: 150 },
  { label: 'Шины', required: 500, actual: 667 },
]

const recyclingChartMax = computed(() => Math.max(...recyclingComparison.map(r => Math.max(r.required, r.actual))))

const recyclingNorms = [
  { waste: 'Пластик', normPct: 25, factPct: 21.2, reqVol: 850, actVol: 720 },
  { waste: 'Бумага/картон', normPct: 20, factPct: 19.3, reqVol: 600, actVol: 580 },
  { waste: 'Стекло', normPct: 15, factPct: 10.3, reqVol: 400, actVol: 310 },
  { waste: 'Металл', normPct: 30, factPct: 35.0, reqVol: 350, actVol: 420 },
  { waste: 'Текстиль', normPct: 10, factPct: 7.5, reqVol: 200, actVol: 150 },
  { waste: 'Шины', normPct: 35, factPct: 44.5, reqVol: 500, actVol: 667 },
]

// ─── Bar chart hover state ───
const hoveredHbarIdx = ref<number | null>(null)
const hoveredSubbarIdx = ref<number | null>(null)
const hoveredRecyclingIdx = ref<number | null>(null)
const hoveredRecyclingType = ref<'required' | 'actual' | null>(null)

// Tooltip for bar charts
const barTooltip = ref({ visible: false, x: 0, y: 0, lines: [] as string[] })

function showBarTooltip(event: MouseEvent, lines: string[]) {
  const rect = (event.currentTarget as HTMLElement).closest('.an-chart-container, .an-hbar-list')?.getBoundingClientRect()
  if (!rect) {
    barTooltip.value = { visible: true, x: event.clientX, y: event.clientY - 60, lines }
    return
  }
  barTooltip.value = {
    visible: true,
    x: event.clientX - rect.left + 12,
    y: event.clientY - rect.top - 10,
    lines
  }
}

function moveBarTooltip(event: MouseEvent) {
  const rect = (event.currentTarget as HTMLElement).closest('.an-chart-container, .an-hbar-list')?.getBoundingClientRect()
  if (!rect) return
  barTooltip.value.x = event.clientX - rect.left + 12
  barTooltip.value.y = event.clientY - rect.top - 10
}

function hideBarTooltip() {
  barTooltip.value.visible = false
}

function exportTabData(tabName: string) {
  alert(`Выгрузка данных раздела «${tabName}» — функция будет реализована с серверной генерацией`)
}
</script>

<template>
  <DashboardLayout
    role="eco-operator"
    roleTitle="ГП «Эко Оператор»"
    userName="ОсОО «ЭкоПереработка»"
    :menuItems="menuItems"
  >
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b]">Аналитика и отчёты</h1>
        <p class="text-[#64748b] mt-1">Финансовая сводка, товарная структура и выгрузка отчётов</p>
      </div>
      <!-- Export button -->
      <div class="relative">
        <button
          @click="showExportMenu = !showExportMenu"
          class="an-export-btn"
        >
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          Выгрузить отчёт
        </button>
        <div v-if="showExportMenu" class="an-export-dropdown">
          <button @click="doExport('Excel')" class="an-export-dropdown__item">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Скачать Excel (.xlsx)
          </button>
          <button @click="doExport('PDF')" class="an-export-dropdown__item">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
            Скачать PDF
          </button>
        </div>
      </div>
    </div>

    <!-- Tab bar -->
    <div class="flex gap-1 border-b border-[#e2e8f0] mb-6">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        :class="[
          'px-5 py-3 text-sm font-semibold transition-colors relative',
          activeTab === tab.id
            ? 'text-[#22C55E] border-b-2 border-[#22C55E] -mb-px'
            : 'text-[#64748b] hover:text-[#1e293b]'
        ]"
      >{{ tab.label }}</button>
    </div>

    <!-- Shared filters (visible for finance and products tabs) -->
    <template v-if="activeTab !== 'reports'">
      <!-- Period filter (sticky) -->
      <div class="an-period-bar">
        <div class="an-period-chips">
          <button :class="['an-chip', activePeriodMode === 'month' ? 'an-chip--active' : '']" @click="activePeriodMode = 'month'">Этот месяц</button>
          <button :class="['an-chip', activePeriodMode === 'quarter' ? 'an-chip--active' : '']" @click="activePeriodMode = 'quarter'">Квартал</button>
          <button :class="['an-chip', activePeriodMode === 'year' ? 'an-chip--active' : '']" @click="activePeriodMode = 'year'">Этот год</button>
          <button :class="['an-chip', activePeriodMode === 'custom' ? 'an-chip--active' : '']" @click="activePeriodMode = 'custom'">Произвольный период</button>
        </div>
        <!-- Quarter picker row -->
        <div v-if="activePeriodMode === 'quarter'" class="an-quarter-row">
          <button
            v-for="q in quarterOptions"
            :key="q.key"
            :class="['an-qchip', selectedQuarter === q.key ? 'an-qchip--active' : '']"
            @click="selectedQuarter = q.key"
          >{{ q.label }}</button>
        </div>
        <!-- Custom date pickers -->
        <div v-if="activePeriodMode === 'custom'" class="an-period-custom">
          <label class="an-period-custom__label">С
            <input type="text" v-model="customFrom" placeholder="DD.MM.YYYY" class="an-period-custom__input" />
          </label>
          <label class="an-period-custom__label">По
            <input type="text" v-model="customTo" placeholder="DD.MM.YYYY" class="an-period-custom__input" />
          </label>
        </div>
      </div>

      <!-- Payer filter -->
      <div class="an-payer-bar">
        <div class="an-payer-field-wrap">
          <svg class="an-payer-icon" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" stroke-width="2"><circle cx="11" cy="11" r="8" /><path stroke-linecap="round" d="M21 21l-4.35-4.35" /></svg>
          <input
            v-if="!selectedPayer"
            v-model="payerSearch"
            @focus="onPayerFocus"
            @blur="onPayerBlur"
            placeholder="Поиск по наименованию или ИНН плательщика"
            class="an-payer-input"
          />
          <div v-else class="an-payer-badge">
            {{ selectedPayer }}
            <button @click="clearPayer" class="an-payer-badge__x">&times;</button>
          </div>
        </div>
        <!-- Autocomplete dropdown -->
        <div v-if="showPayerSuggestions && filteredPayers.length > 0 && !selectedPayer" class="an-payer-dropdown">
          <button
            v-for="p in filteredPayers"
            :key="p.company"
            @mousedown.prevent="selectPayer(p.company)"
            class="an-payer-dropdown__item"
          >
            <span class="an-payer-dropdown__name">{{ p.company }}</span>
            <span class="an-payer-dropdown__inn">ИНН: {{ p.inn }}</span>
          </button>
        </div>
      </div>
    </template>

    <!-- ═══════════════════════════════════════════ -->
    <!-- TAB 1: Финансы                              -->
    <!-- ═══════════════════════════════════════════ -->
    <template v-if="activeTab === 'finance'">
      <!-- Financial summary cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="an-card">
          <div class="an-card__icon an-card__icon--green">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
          </div>
          <div class="an-card__body">
            <span class="an-card__label">Поступило от утильсбора</span>
            <span class="an-card__value" style="color:#22C55E">{{ fmtFull(totalIncome) }}</span>
            <span class="an-card__sub">{{ paidCalcs.length }} расчётов</span>
          </div>
        </div>
        <div class="an-card">
          <div class="an-card__icon an-card__icon--red">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
          </div>
          <div class="an-card__body">
            <span class="an-card__label">Возвращено</span>
            <span class="an-card__value" style="color:#EF4444">{{ fmtFull(totalRefunded) }}</span>
            <span class="an-card__sub">{{ approvedRefunds.length }} возвратов</span>
          </div>
        </div>
        <div class="an-card">
          <div class="an-card__icon an-card__icon--blue">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div class="an-card__body">
            <span class="an-card__label">Чистые поступления</span>
            <span class="an-card__value" :style="{ color: netIncome >= 0 ? '#3B82F6' : '#EF4444' }">{{ fmtFull(netIncome) }}</span>
            <span class="an-card__sub">поступило минус возвраты</span>
          </div>
        </div>
        <div class="an-card">
          <div class="an-card__icon an-card__icon--gray">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
          </div>
          <div class="an-card__body">
            <span class="an-card__label">Средний расчёт</span>
            <span class="an-card__value" style="color:#64748B">{{ fmtFull(avgCalc) }}</span>
            <span class="an-card__sub">за период</span>
          </div>
        </div>
      </div>

      <!-- Bar chart -->
      <div class="an-chart-container mb-6">
        <div class="an-chart-header">
          <h2 class="an-section-title">Динамика поступлений</h2>
          <div class="an-toggle">
            <button :class="['an-toggle__btn', chartMode === 'months' ? 'an-toggle__btn--active' : '']" @click="chartMode = 'months'">По месяцам</button>
            <button :class="['an-toggle__btn', chartMode === 'quarters' ? 'an-toggle__btn--active' : '']" @click="chartMode = 'quarters'">По кварталам</button>
          </div>
        </div>
        <!-- Legend -->
        <div class="an-chart-legend">
          <span class="an-chart-legend__item"><span class="an-chart-legend__dot" style="background:#22C55E"></span> Поступления</span>
          <span class="an-chart-legend__item"><span class="an-chart-legend__dot" style="background:#EF4444"></span> Возвраты</span>
        </div>
        <!-- Chart area -->
        <div class="an-chart">
          <!-- Y-axis labels -->
          <div class="an-chart__yaxis">
            <span>{{ fmtShort(chartMaxVal) }}</span>
            <span>{{ fmtShort(Math.round(chartMaxVal * 0.75)) }}</span>
            <span>{{ fmtShort(Math.round(chartMaxVal * 0.5)) }}</span>
            <span>{{ fmtShort(Math.round(chartMaxVal * 0.25)) }}</span>
            <span>0</span>
          </div>
          <!-- Bars -->
          <div class="an-chart__bars">
            <div class="an-chart__grid-lines">
              <div class="an-chart__grid-line" style="bottom:25%"></div>
              <div class="an-chart__grid-line" style="bottom:50%"></div>
              <div class="an-chart__grid-line" style="bottom:75%"></div>
              <div class="an-chart__grid-line" style="bottom:100%"></div>
            </div>
            <div
              v-for="(item, idx) in chartData"
              :key="item.label"
              class="an-chart__group"
            >
              <div class="an-chart__bar-pair">
                <div
                  class="an-chart__bar an-chart__bar--income"
                  :style="{ height: (item.income / chartMaxVal * 100) + '%' }"
                  @mouseenter="hoveredBar = idx; hoveredType = 'income'"
                  @mouseleave="hoveredBar = null; hoveredType = null"
                >
                  <span class="an-chart__bar-val an-chart__bar-val--income">{{ fmtShort(item.income) }}</span>
                  <div v-if="hoveredBar === idx && hoveredType === 'income'" class="an-chart__tooltip">{{ fmtFull(item.income) }}</div>
                </div>
                <div
                  class="an-chart__bar an-chart__bar--refunds"
                  :style="{ height: (item.refunds / chartMaxVal * 100) + '%', minHeight: item.refunds > 0 ? '3px' : '0' }"
                  @mouseenter="hoveredBar = idx; hoveredType = 'refunds'"
                  @mouseleave="hoveredBar = null; hoveredType = null"
                >
                  <span v-if="item.refunds > 0" class="an-chart__bar-val an-chart__bar-val--refunds">{{ fmtShort(item.refunds) }}</span>
                  <div v-if="hoveredBar === idx && hoveredType === 'refunds'" class="an-chart__tooltip an-chart__tooltip--red">{{ fmtFull(item.refunds) }}</div>
                </div>
              </div>
              <span class="an-chart__xlabel">{{ item.label }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Структура поступлений: two donut charts ── -->
      <div class="an-chart-container mb-6">
        <h2 class="an-section-title mb-4">Структура поступлений</h2>
        <div class="an-donut-grid">
          <!-- Left donut: По группам товаров -->
          <div class="an-donut-section">
            <h3 class="an-donut-subtitle">По группам товаров</h3>
            <div class="an-donut-svg-wrap" style="position:relative">
              <svg viewBox="0 0 220 220" width="200" height="200" class="an-donut-svg">
                <path
                  v-for="(seg, i) in groupDonutSegments"
                  :key="'g-' + i"
                  :d="seg.path"
                  :fill="seg.color"
                  :style="{
                    transform: hoveredGroupIdx === i ? `translate(${seg.pushX}px, ${seg.pushY}px)` : 'translate(0,0)',
                    filter: hoveredGroupIdx !== null && hoveredGroupIdx !== i ? 'opacity(0.4)' : hoveredGroupIdx === i ? 'brightness(1.1)' : 'none',
                    transition: 'transform 0.3s ease, filter 0.3s ease',
                    cursor: 'pointer',
                    transformOrigin: '110px 110px'
                  }"
                  @mouseenter="hoveredGroupIdx = i; showDonutTooltip($event, incomeByGroup[i].label, incomeByGroup[i].amount.toLocaleString('ru-RU') + ' сом', (incomeByGroupTotal ? (incomeByGroup[i].amount / incomeByGroupTotal * 100).toFixed(1) : '0') + '%', paidCalcs.filter(c => c.items.some(it => { const gObj = productGroups.find(pg => pg.value === it.group); return (gObj?.label || it.group) === incomeByGroup[i].label })).length + ' расч.')"
                  @mousemove="moveDonutTooltip($event)"
                  @mouseleave="hoveredGroupIdx = null; hideDonutTooltip()"
                />
              </svg>
              <!-- Center value -->
              <div class="an-donut-center">
                <span class="an-donut-center__value">{{ fmtCenter(groupCenterValue) }}</span>
                <span class="an-donut-center__label">{{ groupCenterLabel }}</span>
              </div>
              <!-- Tooltip -->
              <div
                v-if="donutTooltip.visible && hoveredGroupIdx !== null"
                class="an-donut-tooltip"
                :style="{ left: donutTooltip.x + 'px', top: donutTooltip.y + 'px' }"
              >
                <div class="an-donut-tooltip__title">{{ donutTooltip.label }}</div>
                <div class="an-donut-tooltip__row">{{ donutTooltip.value }}</div>
                <div class="an-donut-tooltip__row">{{ donutTooltip.pct }}</div>
                <div v-if="donutTooltip.extra" class="an-donut-tooltip__row an-donut-tooltip__row--muted">{{ donutTooltip.extra }}</div>
              </div>
            </div>
            <div :class="['an-donut-legend', legendVisible ? 'an-donut-legend--visible' : '']">
              <div
                v-for="(g, i) in incomeByGroup"
                :key="'gl-' + i"
                :class="['an-donut-legend__item', hoveredGroupIdx === i ? 'an-donut-legend__item--active' : '']"
                @mouseenter="hoveredGroupIdx = i"
                @mouseleave="hoveredGroupIdx = null"
              >
                <span class="an-donut-legend__dot" :style="{ background: donutGroupColors[i % donutGroupColors.length] }"></span>
                <span class="an-donut-legend__label">{{ g.label }}</span>
                <span class="an-donut-legend__value">{{ g.amount.toLocaleString('ru-RU') }} сом</span>
                <span class="an-donut-legend__pct">{{ incomeByGroupTotal ? ((g.amount / incomeByGroupTotal) * 100).toFixed(1) : '0' }}%</span>
              </div>
            </div>
          </div>
          <!-- Right donut: По типу плательщиков -->
          <div class="an-donut-section">
            <h3 class="an-donut-subtitle">По типу плательщиков</h3>
            <div class="an-donut-svg-wrap" style="position:relative">
              <svg viewBox="0 0 220 220" width="200" height="200" class="an-donut-svg">
                <path
                  v-for="(seg, i) in payerDonutSegments"
                  :key="'p-' + i"
                  :d="seg.path"
                  :fill="seg.color"
                  :style="{
                    transform: hoveredPayerIdx === i ? `translate(${seg.pushX}px, ${seg.pushY}px)` : 'translate(0,0)',
                    filter: hoveredPayerIdx !== null && hoveredPayerIdx !== i ? 'opacity(0.4)' : hoveredPayerIdx === i ? 'brightness(1.1)' : 'none',
                    transition: 'transform 0.3s ease, filter 0.3s ease',
                    cursor: 'pointer',
                    transformOrigin: '110px 110px'
                  }"
                  @mouseenter="hoveredPayerIdx = i; showDonutTooltip($event, payerTypeWithAmounts[i].label, payerTypeWithAmounts[i].amount.toLocaleString('ru-RU') + ' сом', payerTypeData[i].pct + '%')"
                  @mousemove="moveDonutTooltip($event)"
                  @mouseleave="hoveredPayerIdx = null; hideDonutTooltip()"
                />
              </svg>
              <div class="an-donut-center">
                <span class="an-donut-center__value">{{ fmtCenter(payerCenterValue) }}</span>
                <span class="an-donut-center__label">{{ payerCenterLabel }}</span>
              </div>
              <div
                v-if="donutTooltip.visible && hoveredPayerIdx !== null"
                class="an-donut-tooltip"
                :style="{ left: donutTooltip.x + 'px', top: donutTooltip.y + 'px' }"
              >
                <div class="an-donut-tooltip__title">{{ donutTooltip.label }}</div>
                <div class="an-donut-tooltip__row">{{ donutTooltip.value }}</div>
                <div class="an-donut-tooltip__row">{{ donutTooltip.pct }}</div>
              </div>
            </div>
            <div :class="['an-donut-legend', legendVisible ? 'an-donut-legend--visible' : '']">
              <div
                v-for="(p, i) in payerTypeWithAmounts"
                :key="'pl-' + i"
                :class="['an-donut-legend__item', hoveredPayerIdx === i ? 'an-donut-legend__item--active' : '']"
                @mouseenter="hoveredPayerIdx = i"
                @mouseleave="hoveredPayerIdx = null"
              >
                <span class="an-donut-legend__dot" :style="{ background: p.color }"></span>
                <span class="an-donut-legend__label">{{ p.label }}</span>
                <span class="an-donut-legend__value">{{ p.amount.toLocaleString('ru-RU') }} сом</span>
                <span class="an-donut-legend__pct">{{ p.pct }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Топ-10 плательщиков ── -->
      <div class="an-chart-container mb-6">
        <h2 class="an-section-title mb-4">Топ-10 плательщиков по сумме утильсбора</h2>
        <div v-if="payerRanking.length === 0" class="py-12 text-center text-[#94a3b8]">Нет данных за выбранный период</div>
        <div v-else>
          <div class="an-tbl-header">
            <span class="an-tbl-col an-tbl-col--num">#</span>
            <span class="an-tbl-col an-tbl-col--name">Наименование</span>
            <span class="an-tbl-col an-tbl-col--num2">ИНН</span>
            <span class="an-tbl-col an-tbl-col--num2">Расчётов</span>
            <span class="an-tbl-col an-tbl-col--amount">Сумма (сом)</span>
            <span class="an-tbl-col an-tbl-col--share">Доля</span>
          </div>
          <div v-for="(p, idx) in visiblePayers" :key="p.company" class="an-tbl-row-wrap">
            <div class="an-tbl-row" style="cursor:default">
              <span class="an-tbl-col an-tbl-col--num">{{ idx + 1 }}</span>
              <span class="an-tbl-col an-tbl-col--name an-tbl-col--name-text">{{ p.company }}</span>
              <span class="an-tbl-col an-tbl-col--num2 an-tbl-col--mono">{{ p.inn }}</span>
              <span class="an-tbl-col an-tbl-col--num2">{{ p.calcCount }}</span>
              <span class="an-tbl-col an-tbl-col--amount an-tbl-col--bold" style="color:#22C55E">{{ p.totalAmount.toLocaleString('ru-RU') }}</span>
              <span class="an-tbl-col an-tbl-col--share">
                <span class="an-tbl-share-bar">
                  <span class="an-tbl-share-bar__fill" :style="{ width: (topPayersTotalAmount ? p.totalAmount / topPayersTotalAmount * 100 : 0) + '%' }"></span>
                </span>
                <span class="an-tbl-share-pct">{{ topPayersTotalAmount ? ((p.totalAmount / topPayersTotalAmount) * 100).toFixed(1) : '0' }}%</span>
              </span>
            </div>
          </div>
          <div v-if="payerRanking.length > 10" class="an-show-all-wrap">
            <button class="an-show-all-btn" @click="showAllPayers = !showAllPayers">
              {{ showAllPayers ? 'Свернуть' : 'Показать всех (' + payerRanking.length + ')' }}
              <svg :class="['an-show-all-icon', showAllPayers ? 'an-show-all-icon--open' : '']" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
            </button>
          </div>
        </div>
      </div>

      <!-- ── Топ должников ── -->
      <div class="an-chart-container mb-6 an-debtors-container">
        <div class="an-debtors-header">
          <h2 class="an-section-title">Организации с просроченной оплатой</h2>
          <span class="an-debtors-badge">{{ debtors.length }}</span>
        </div>
        <div class="an-debtors-total">
          Общая задолженность: <strong style="color:#EF4444">{{ totalDebt.toLocaleString('ru-RU') }} сом</strong>
        </div>
        <div class="an-tbl-header">
          <span class="an-tbl-col an-tbl-col--name">Наименование</span>
          <span class="an-tbl-col an-tbl-col--num2">ИНН</span>
          <span class="an-tbl-col an-tbl-col--amount">Задолженность</span>
          <span class="an-tbl-col an-tbl-col--num2">Дней</span>
          <span class="an-tbl-col an-tbl-col--status">Статус</span>
        </div>
        <div v-for="d in debtors" :key="d.inn" class="an-tbl-row-wrap">
          <div class="an-tbl-row" style="cursor:default">
            <span class="an-tbl-col an-tbl-col--name an-tbl-col--name-text">{{ d.company }}</span>
            <span class="an-tbl-col an-tbl-col--num2 an-tbl-col--mono">{{ d.inn }}</span>
            <span class="an-tbl-col an-tbl-col--amount" style="color:#EF4444;font-weight:700">{{ d.debt.toLocaleString('ru-RU') }}</span>
            <span class="an-tbl-col an-tbl-col--num2" style="color:#EF4444;font-weight:600">{{ d.overdueDays }}</span>
            <span class="an-tbl-col an-tbl-col--status">
              <span :class="['an-status-badge', d.status === 'Просрочка' ? 'an-status-badge--red' : 'an-status-badge--orange']">{{ d.status }}</span>
            </span>
          </div>
        </div>
      </div>

      <!-- ── Поступления по группам товаров — horizontal bars ── -->
      <div class="an-chart-container mb-6" style="position:relative">
        <h2 class="an-section-title mb-4">Поступления по группам товаров</h2>
        <div v-if="groupBarData.length === 0" class="py-12 text-center text-[#94a3b8]">Нет данных за выбранный период</div>
        <div v-else class="an-hbar-list">
          <div
            v-for="(g, idx) in groupBarData"
            :key="g.group"
            :class="['an-hbar-row', hoveredHbarIdx === idx ? 'an-hbar-row--active' : '', hoveredHbarIdx !== null && hoveredHbarIdx !== idx ? 'an-hbar-row--dimmed' : '']"
            @mouseenter="hoveredHbarIdx = idx; showBarTooltip($event, [g.label, g.totalAmount.toLocaleString('ru-RU') + ' сом', (totalGroupAmount ? (g.totalAmount / totalGroupAmount * 100).toFixed(1) : '0') + '% от общей суммы', g.calcCount + ' расчётов'])"
            @mousemove="moveBarTooltip($event)"
            @mouseleave="hoveredHbarIdx = null; hideBarTooltip()"
          >
            <span class="an-hbar-label">{{ g.label }}</span>
            <div class="an-hbar-track">
              <div class="an-hbar-fill" :style="{ width: (g.totalAmount / groupBarMax * 100) + '%', background: idx % 2 === 0 ? '#22C55E' : '#16A34A', filter: hoveredHbarIdx === idx ? 'brightness(1.15)' : 'none' }"></div>
            </div>
            <span class="an-hbar-value">{{ g.totalAmount.toLocaleString('ru-RU') }} сом</span>
          </div>
        </div>
        <!-- Tooltip -->
        <div v-if="barTooltip.visible && hoveredHbarIdx !== null" class="an-bar-tooltip" :style="{ left: barTooltip.x + 'px', top: barTooltip.y + 'px' }">
          <div v-for="(line, li) in barTooltip.lines" :key="li" :class="li === 0 ? 'an-bar-tooltip__title' : 'an-bar-tooltip__row'">{{ line }}</div>
        </div>
      </div>

      <!-- ── Finance tab export ── -->
      <div class="an-tab-export-row">
        <button class="an-tab-export-btn" @click="exportTabData('Финансы')">
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          Выгрузить данные
        </button>
      </div>
    </template>

    <!-- ═══════════════════════════════════════════ -->
    <!-- TAB 2: Товары и переработка                 -->
    <!-- ═══════════════════════════════════════════ -->
    <template v-if="activeTab === 'products'">

      <!-- ═══ Subsection A: Анализ по товарам ═══ -->
      <h2 class="an-subsection-title">
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
        Анализ по товарам
      </h2>

      <!-- A1: Donut chart — Структура ввоза/производства по группам -->
      <div class="an-chart-container mb-6">
        <h2 class="an-section-title mb-4">Структура ввоза/производства по группам</h2>
        <div class="an-donut-grid an-donut-grid--single">
          <div class="an-donut-section">
            <div class="an-donut-svg-wrap" style="position:relative">
              <svg viewBox="0 0 220 220" width="200" height="200" class="an-donut-svg">
                <path
                  v-for="(seg, i) in massDonutSegments"
                  :key="'m-' + i"
                  :d="seg.path"
                  :fill="seg.color"
                  :style="{
                    transform: hoveredMassIdx === i ? `translate(${seg.pushX}px, ${seg.pushY}px)` : 'translate(0,0)',
                    filter: hoveredMassIdx !== null && hoveredMassIdx !== i ? 'opacity(0.4)' : hoveredMassIdx === i ? 'brightness(1.1)' : 'none',
                    transition: 'transform 0.3s ease, filter 0.3s ease',
                    cursor: 'pointer',
                    transformOrigin: '110px 110px'
                  }"
                  @mouseenter="hoveredMassIdx = i; showDonutTooltip($event, incomeByGroupMass[i].label, incomeByGroupMass[i].mass.toFixed(1) + ' т', (totalGroupMass ? (incomeByGroupMass[i].mass / totalGroupMass * 100).toFixed(1) : '0') + '%')"
                  @mousemove="moveDonutTooltip($event)"
                  @mouseleave="hoveredMassIdx = null; hideDonutTooltip()"
                />
              </svg>
              <div class="an-donut-center">
                <span class="an-donut-center__value">{{ fmtCenter(massCenterValue, 'т') }}</span>
                <span class="an-donut-center__label">{{ massCenterLabel }}</span>
              </div>
              <div
                v-if="donutTooltip.visible && hoveredMassIdx !== null"
                class="an-donut-tooltip"
                :style="{ left: donutTooltip.x + 'px', top: donutTooltip.y + 'px' }"
              >
                <div class="an-donut-tooltip__title">{{ donutTooltip.label }}</div>
                <div class="an-donut-tooltip__row">{{ donutTooltip.value }}</div>
                <div class="an-donut-tooltip__row">{{ donutTooltip.pct }}</div>
              </div>
            </div>
            <div :class="['an-donut-legend', legendVisible ? 'an-donut-legend--visible' : '']">
              <div
                v-for="(g, i) in incomeByGroupMass"
                :key="'ml-' + i"
                :class="['an-donut-legend__item', hoveredMassIdx === i ? 'an-donut-legend__item--active' : '']"
                @mouseenter="hoveredMassIdx = i"
                @mouseleave="hoveredMassIdx = null"
              >
                <span class="an-donut-legend__dot" :style="{ background: donutGroupColors[i % donutGroupColors.length] }"></span>
                <span class="an-donut-legend__label">{{ g.label }}</span>
                <span class="an-donut-legend__value">{{ g.mass.toFixed(1) }} т</span>
                <span class="an-donut-legend__pct">{{ totalGroupMass ? ((g.mass / totalGroupMass) * 100).toFixed(1) : '0' }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- A2: Product groups ranking table (enhanced with 2 new columns) -->
      <div class="an-chart-container mb-6">
        <h2 class="an-section-title mb-4">Рейтинг групп товаров по сумме утильсбора</h2>

        <div v-if="groupRanking.length === 0" class="py-12 text-center text-[#94a3b8]">Нет данных за выбранный период</div>

        <div v-else>
          <!-- Table header -->
          <div class="an-tbl-header">
            <span class="an-tbl-col an-tbl-col--num">#</span>
            <span class="an-tbl-col an-tbl-col--name">Группа товаров</span>
            <span class="an-tbl-col an-tbl-col--num2">Расчётов</span>
            <span class="an-tbl-col an-tbl-col--num2">Масса (т)</span>
            <span class="an-tbl-col an-tbl-col--amount">Сумма (сом)</span>
            <span class="an-tbl-col an-tbl-col--rate">Ср. ставка</span>
            <span class="an-tbl-col an-tbl-col--trend">Динамика</span>
            <span class="an-tbl-col an-tbl-col--share">Доля</span>
            <span class="an-tbl-col an-tbl-col--chev"></span>
          </div>

          <!-- Rows -->
          <div
            v-for="(ga, idx) in groupRanking"
            :key="ga.group"
            class="an-tbl-row-wrap"
          >
            <div class="an-tbl-row" @click="toggleGroup(ga.group)">
              <span class="an-tbl-col an-tbl-col--num">{{ idx + 1 }}</span>
              <span class="an-tbl-col an-tbl-col--name an-tbl-col--name-text">{{ ga.label }}</span>
              <span class="an-tbl-col an-tbl-col--num2">{{ ga.calcCount }}</span>
              <span class="an-tbl-col an-tbl-col--num2">{{ ga.totalMass.toFixed(1) }}</span>
              <span class="an-tbl-col an-tbl-col--amount an-tbl-col--bold">{{ ga.totalAmount.toLocaleString('ru-RU') }}</span>
              <span class="an-tbl-col an-tbl-col--rate">{{ getAvgRate(ga.totalAmount, ga.totalMass) }}</span>
              <span class="an-tbl-col an-tbl-col--trend">
                <span :style="{ color: mockTrend(ga.group).up ? '#22C55E' : '#EF4444' }">
                  {{ mockTrend(ga.group).up ? '&#9650;' : '&#9660;' }}
                  {{ mockTrend(ga.group).value }}%
                </span>
              </span>
              <span class="an-tbl-col an-tbl-col--share">
                <span class="an-tbl-share-bar">
                  <span class="an-tbl-share-bar__fill" :style="{ width: (totalGroupAmount ? ga.totalAmount / totalGroupAmount * 100 : 0) + '%' }"></span>
                </span>
                <span class="an-tbl-share-pct">{{ (totalGroupAmount ? (ga.totalAmount / totalGroupAmount * 100).toFixed(1) : '0') }}%</span>
              </span>
              <span class="an-tbl-col an-tbl-col--chev">
                <svg :class="['an-tbl-chevron', expandedGroups.has(ga.group) ? 'an-tbl-chevron--open' : '']" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
              </span>
            </div>

            <!-- Expanded subgroups -->
            <div :class="['an-tbl-expand', expandedGroups.has(ga.group) ? 'an-tbl-expand--open' : '']">
              <div class="an-tbl-expand__inner">
                <div class="an-tbl-sub-header">
                  <span class="an-tbl-sub-col an-tbl-sub-col--name">Подгруппа</span>
                  <span class="an-tbl-sub-col an-tbl-sub-col--num">Кол-во</span>
                  <span class="an-tbl-sub-col an-tbl-sub-col--num">Масса (т)</span>
                  <span class="an-tbl-sub-col an-tbl-sub-col--num">Сумма (сом)</span>
                  <span class="an-tbl-sub-col an-tbl-sub-col--num">Ср. ставка</span>
                  <span class="an-tbl-sub-col an-tbl-sub-col--num">Динамика</span>
                  <span class="an-tbl-sub-col an-tbl-sub-col--num">Доля</span>
                </div>
                <div v-for="sg in ga.subgroups.sort((a, b) => b.amount - a.amount)" :key="sg.subgroup" class="an-tbl-sub-row">
                  <span class="an-tbl-sub-col an-tbl-sub-col--name">{{ sg.label }}</span>
                  <span class="an-tbl-sub-col an-tbl-sub-col--num">{{ sg.count }}</span>
                  <span class="an-tbl-sub-col an-tbl-sub-col--num">{{ sg.mass.toFixed(1) }}</span>
                  <span class="an-tbl-sub-col an-tbl-sub-col--num">{{ sg.amount.toLocaleString('ru-RU') }}</span>
                  <span class="an-tbl-sub-col an-tbl-sub-col--num">{{ sg.mass ? Math.round(sg.amount / sg.mass).toLocaleString('ru-RU') : '—' }}</span>
                  <span class="an-tbl-sub-col an-tbl-sub-col--num">
                    <span :style="{ color: mockTrend(sg.subgroup).up ? '#22C55E' : '#EF4444' }">
                      {{ mockTrend(sg.subgroup).up ? '&#9650;' : '&#9660;' }}
                      {{ mockTrend(sg.subgroup).value }}%
                    </span>
                  </span>
                  <span class="an-tbl-sub-col an-tbl-sub-col--num">{{ ga.totalAmount ? ((sg.amount / ga.totalAmount) * 100).toFixed(1) : '0' }}%</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Totals row -->
          <div class="an-tbl-footer">
            <span class="an-tbl-col an-tbl-col--num"></span>
            <span class="an-tbl-col an-tbl-col--name" style="font-weight:700">Итого</span>
            <span class="an-tbl-col an-tbl-col--num2">{{ groupRanking.reduce((s, g) => s + g.calcCount, 0) }}</span>
            <span class="an-tbl-col an-tbl-col--num2">{{ groupRanking.reduce((s, g) => s + g.totalMass, 0).toFixed(1) }}</span>
            <span class="an-tbl-col an-tbl-col--amount an-tbl-col--bold">{{ totalGroupAmount.toLocaleString('ru-RU') }}</span>
            <span class="an-tbl-col an-tbl-col--rate"></span>
            <span class="an-tbl-col an-tbl-col--trend"></span>
            <span class="an-tbl-col an-tbl-col--share"><span class="an-tbl-share-pct" style="font-weight:700">100%</span></span>
            <span class="an-tbl-col an-tbl-col--chev"></span>
          </div>
        </div>
      </div>

      <!-- A3: Топ-10 подгрупп по массе ввоза — horizontal bars -->
      <div class="an-chart-container mb-6" style="position:relative">
        <h2 class="an-section-title mb-4">Топ-10 подгрупп по массе ввоза</h2>
        <div v-if="flatSubgroups.length === 0" class="py-12 text-center text-[#94a3b8]">Нет данных за выбранный период</div>
        <div v-else class="an-hbar-list">
          <div
            v-for="(sg, idx) in flatSubgroups"
            :key="sg.subgroup + idx"
            :class="['an-hbar-row', hoveredSubbarIdx === idx ? 'an-hbar-row--active' : '', hoveredSubbarIdx !== null && hoveredSubbarIdx !== idx ? 'an-hbar-row--dimmed' : '']"
            @mouseenter="hoveredSubbarIdx = idx; showBarTooltip($event, [sg.label, sg.parentGroup, sg.mass.toFixed(1) + ' т', sg.amount.toLocaleString('ru-RU') + ' сом'])"
            @mousemove="moveBarTooltip($event)"
            @mouseleave="hoveredSubbarIdx = null; hideBarTooltip()"
          >
            <div class="an-hbar-label an-hbar-label--multi">
              <span>{{ sg.label }}</span>
              <span class="an-hbar-parent">{{ sg.parentGroup }}</span>
            </div>
            <div class="an-hbar-track">
              <div class="an-hbar-fill" :style="{ width: (sg.mass / flatSubgroupMaxMass * 100) + '%', background: '#0e888d', filter: hoveredSubbarIdx === idx ? 'brightness(1.15)' : 'none' }"></div>
            </div>
            <span class="an-hbar-value">{{ sg.mass.toFixed(1) }} т</span>
          </div>
        </div>
        <!-- Tooltip -->
        <div v-if="barTooltip.visible && hoveredSubbarIdx !== null" class="an-bar-tooltip" :style="{ left: barTooltip.x + 'px', top: barTooltip.y + 'px' }">
          <div v-for="(line, li) in barTooltip.lines" :key="li" :class="li === 0 ? 'an-bar-tooltip__title' : 'an-bar-tooltip__row'">{{ line }}</div>
        </div>
      </div>

      <!-- ═══ Subsection B: Анализ переработки ═══ -->
      <div class="an-recycling-divider"></div>
      <h2 class="an-subsection-title">
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
        Анализ переработки
      </h2>

      <!-- B1: 3 KPI cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div v-for="kpi in recyclingKpis" :key="kpi.title" class="an-card">
          <div class="an-card__icon" :style="{ background: kpi.bg, color: kpi.color }">
            <svg v-if="kpi.icon === 'recycle'" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            <svg v-if="kpi.icon === 'target'" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            <svg v-if="kpi.icon === 'chart'" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          </div>
          <div class="an-card__body">
            <span class="an-card__label">{{ kpi.title }}</span>
            <span class="an-card__value" :style="{ color: kpi.color }">{{ kpi.value }}</span>
          </div>
        </div>
      </div>

      <!-- B2: Grouped bar chart — Required vs Actual -->
      <div class="an-chart-container mb-6" style="position:relative">
        <div class="an-chart-header">
          <h2 class="an-section-title">Требуемый vs фактический объём переработки</h2>
        </div>
        <div class="an-chart-legend">
          <span class="an-chart-legend__item"><span class="an-chart-legend__dot" style="background:#3B82F6"></span> Требуемый</span>
          <span class="an-chart-legend__item"><span class="an-chart-legend__dot" style="background:#22C55E"></span> Фактический</span>
        </div>
        <div class="an-chart">
          <div class="an-chart__yaxis">
            <span>{{ fmtShort(recyclingChartMax) }}</span>
            <span>{{ fmtShort(Math.round(recyclingChartMax * 0.75)) }}</span>
            <span>{{ fmtShort(Math.round(recyclingChartMax * 0.5)) }}</span>
            <span>{{ fmtShort(Math.round(recyclingChartMax * 0.25)) }}</span>
            <span>0</span>
          </div>
          <div class="an-chart__bars">
            <div class="an-chart__grid-lines">
              <div class="an-chart__grid-line" style="bottom:25%"></div>
              <div class="an-chart__grid-line" style="bottom:50%"></div>
              <div class="an-chart__grid-line" style="bottom:75%"></div>
              <div class="an-chart__grid-line" style="bottom:100%"></div>
            </div>
            <div
              v-for="(item, idx) in recyclingComparison"
              :key="item.label"
              :class="['an-chart__group', hoveredRecyclingIdx !== null && hoveredRecyclingIdx !== idx ? 'an-chart__group--dimmed' : '']"
            >
              <div class="an-chart__bar-pair">
                <div
                  class="an-chart__bar"
                  :style="{
                    height: (item.required / recyclingChartMax * 100) + '%',
                    background: '#3B82F6',
                    filter: hoveredRecyclingIdx === idx && hoveredRecyclingType === 'required' ? 'brightness(1.2)' : 'none',
                    cursor: 'pointer'
                  }"
                  @mouseenter="hoveredRecyclingIdx = idx; hoveredRecyclingType = 'required'"
                  @mouseleave="hoveredRecyclingIdx = null; hoveredRecyclingType = null"
                >
                  <span class="an-chart__bar-val" style="color:#3B82F6">{{ item.required }}</span>
                  <div v-if="hoveredRecyclingIdx === idx && hoveredRecyclingType === 'required'" class="an-chart__tooltip" style="background:#1e40af">Требуемый: {{ item.required }} т</div>
                </div>
                <div
                  class="an-chart__bar"
                  :style="{
                    height: (item.actual / recyclingChartMax * 100) + '%',
                    background: '#22C55E',
                    filter: hoveredRecyclingIdx === idx && hoveredRecyclingType === 'actual' ? 'brightness(1.2)' : 'none',
                    cursor: 'pointer'
                  }"
                  @mouseenter="hoveredRecyclingIdx = idx; hoveredRecyclingType = 'actual'"
                  @mouseleave="hoveredRecyclingIdx = null; hoveredRecyclingType = null"
                >
                  <span class="an-chart__bar-val" style="color:#22C55E">{{ item.actual }}</span>
                  <div v-if="hoveredRecyclingIdx === idx && hoveredRecyclingType === 'actual'" class="an-chart__tooltip" style="background:#166534">Фактический: {{ item.actual }} т</div>
                </div>
              </div>
              <span class="an-chart__xlabel">{{ item.label }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- B3: Выполнение нормативов переработки — detailed table -->
      <div class="an-chart-container mb-6">
        <h2 class="an-section-title mb-4">Выполнение нормативов переработки</h2>
        <div class="an-report-table-wrap">
          <table class="an-report-table">
            <thead>
              <tr>
                <th>Вид отхода</th>
                <th class="text-right">Норматив (%)</th>
                <th class="text-right">Факт (%)</th>
                <th class="text-right">Отклонение</th>
                <th class="text-right">Объём требуемый (т)</th>
                <th class="text-right">Объём фактический (т)</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(n, i) in recyclingNorms"
                :key="i"
                :class="[
                  n.factPct >= n.normPct ? 'an-norm-row--met' : 'an-norm-row--unmet',
                  hoveredRecyclingIdx === i ? 'an-norm-row--highlighted' : '',
                  hoveredRecyclingIdx !== null && hoveredRecyclingIdx !== i ? 'an-norm-row--faded' : ''
                ]"
                @mouseenter="hoveredRecyclingIdx = i"
                @mouseleave="hoveredRecyclingIdx = null"
              >
                <td class="font-medium text-[#1e293b]">{{ n.waste }}</td>
                <td class="text-right text-[#64748b]">{{ n.normPct.toFixed(1) }}%</td>
                <td class="text-right font-semibold" :style="{ color: n.factPct >= n.normPct ? '#22C55E' : '#EF4444' }">{{ n.factPct.toFixed(1) }}%</td>
                <td class="text-right font-semibold" :style="{ color: (n.factPct - n.normPct) >= 0 ? '#22C55E' : '#EF4444' }">
                  {{ (n.factPct - n.normPct) >= 0 ? '+' : '' }}{{ (n.factPct - n.normPct).toFixed(1) }}%
                </td>
                <td class="text-right text-[#64748b]">{{ n.reqVol.toLocaleString('ru-RU') }}</td>
                <td class="text-right font-semibold" :style="{ color: n.actVol >= n.reqVol ? '#22C55E' : '#EF4444' }">{{ n.actVol.toLocaleString('ru-RU') }}</td>
                <td>
                  <span :class="['an-status-badge', n.factPct >= n.normPct ? 'an-status-badge--green' : 'an-status-badge--red']">
                    {{ n.factPct >= n.normPct ? 'Выполнен' : 'Не выполнен' }}
                  </span>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td class="font-bold">ИТОГО</td>
                <td></td>
                <td></td>
                <td></td>
                <td class="text-right font-bold">{{ recyclingNorms.reduce((s, n) => s + n.reqVol, 0).toLocaleString('ru-RU') }}</td>
                <td class="text-right font-bold text-[#22C55E]">{{ recyclingNorms.reduce((s, n) => s + n.actVol, 0).toLocaleString('ru-RU') }}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- B4: Products tab export -->
      <div class="an-tab-export-row">
        <button class="an-tab-export-btn" @click="exportTabData('Товары и переработка')">
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          Выгрузить данные
        </button>
      </div>
    </template>

    <!-- ═══════════════════════════════════════════ -->
    <!-- TAB 3: Выгрузка отчётов                     -->
    <!-- ═══════════════════════════════════════════ -->
    <template v-if="activeTab === 'reports'">
      <!-- Report detail view -->
      <div v-if="activeReportTemplate">
        <!-- Back button and title -->
        <div class="flex items-center gap-4 mb-6">
          <button @click="backToReportList" class="an-report-back-btn">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div>
            <h2 class="text-lg font-bold text-[#1e293b]">{{ getReportTemplateTitle(activeReportTemplate) }}</h2>
            <p class="text-sm text-[#94a3b8]">Настройте параметры и сформируйте отчёт</p>
          </div>
        </div>

        <!-- Period filter for report -->
        <div class="an-report-params">
          <div class="an-report-params__row">
            <label class="an-report-params__label">
              Период с
              <input type="date" v-model="reportDateFrom" class="an-report-params__input" />
            </label>
            <label class="an-report-params__label">
              Период по
              <input type="date" v-model="reportDateTo" class="an-report-params__input" />
            </label>
            <button @click="generateReport" :disabled="isGeneratingReport" class="an-report-generate-btn">
              <template v-if="isGeneratingReport">
                <span class="an-report-spinner"></span>
                Формирование...
              </template>
              <template v-else>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Сформировать
              </template>
            </button>
          </div>
        </div>

        <!-- Report preview -->
        <div v-if="reportPreviewReady" class="an-report-preview">
          <div class="an-report-preview__header">
            <h3 class="an-section-title">Предварительный просмотр</h3>
            <div class="flex gap-2">
              <button @click="downloadReportFile('excel')" class="an-report-dl-btn an-report-dl-btn--excel">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Скачать Excel
              </button>
              <button @click="downloadReportFile('pdf')" class="an-report-dl-btn an-report-dl-btn--pdf">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                Скачать PDF
              </button>
            </div>
          </div>

          <!-- Period report preview -->
          <div v-if="activeReportTemplate === 'period'" class="an-report-table-wrap">
            <table class="an-report-table">
              <thead>
                <tr>
                  <th>Компания</th>
                  <th>ИНН</th>
                  <th>Группа товаров</th>
                  <th class="text-right">Сумма (сом)</th>
                  <th>Дата</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, i) in periodReportMock" :key="i">
                  <td class="font-medium text-[#1e293b]">{{ row.company }}</td>
                  <td class="text-[#64748b] font-mono text-sm">{{ row.inn }}</td>
                  <td class="text-[#64748b] text-sm">{{ row.group }}</td>
                  <td class="text-right font-semibold text-[#22C55E]">{{ row.amount.toLocaleString('ru-RU') }}</td>
                  <td class="text-[#64748b]">{{ row.date }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3" class="font-bold">ИТОГО ({{ periodReportMock.length }} записей)</td>
                  <td class="text-right font-bold text-[#22C55E]">{{ periodReportMock.reduce((s, r) => s + r.amount, 0).toLocaleString('ru-RU') }}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- Payers report preview -->
          <div v-if="activeReportTemplate === 'payers'" class="an-report-table-wrap">
            <table class="an-report-table">
              <thead>
                <tr>
                  <th>Компания</th>
                  <th>ИНН</th>
                  <th class="text-right">Кол-во расчётов</th>
                  <th class="text-right">Общая сумма (сом)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, i) in payersReportMock" :key="i">
                  <td class="font-medium text-[#1e293b]">{{ row.company }}</td>
                  <td class="text-[#64748b] font-mono text-sm">{{ row.inn }}</td>
                  <td class="text-right text-[#64748b]">{{ row.calcs }}</td>
                  <td class="text-right font-semibold text-[#3B82F6]">{{ row.total.toLocaleString('ru-RU') }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="2" class="font-bold">ИТОГО ({{ payersReportMock.length }} плательщиков)</td>
                  <td class="text-right font-bold">{{ payersReportMock.reduce((s, r) => s + r.calcs, 0) }}</td>
                  <td class="text-right font-bold text-[#3B82F6]">{{ payersReportMock.reduce((s, r) => s + r.total, 0).toLocaleString('ru-RU') }}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- Groups report preview -->
          <div v-if="activeReportTemplate === 'groups'" class="an-report-table-wrap">
            <table class="an-report-table">
              <thead>
                <tr>
                  <th>Группа №</th>
                  <th>Наименование</th>
                  <th class="text-right">Сумма (сом)</th>
                  <th class="text-right">Доля (%)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, i) in groupsReportMock" :key="i">
                  <td class="font-medium text-[#1e293b]">{{ row.number }}</td>
                  <td class="text-[#1e293b]">{{ row.name }}</td>
                  <td class="text-right font-semibold text-[#F59E0B]">{{ row.amount.toLocaleString('ru-RU') }}</td>
                  <td class="text-right text-[#64748b]">{{ row.share.toFixed(1) }}%</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="2" class="font-bold">ИТОГО</td>
                  <td class="text-right font-bold text-[#F59E0B]">{{ groupsReportMock.reduce((s, r) => s + r.amount, 0).toLocaleString('ru-RU') }}</td>
                  <td class="text-right font-bold">100%</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- Summary report preview -->
          <div v-if="activeReportTemplate === 'summary'" class="an-report-table-wrap">
            <table class="an-report-table">
              <thead>
                <tr>
                  <th>Показатель</th>
                  <th class="text-right">Значение</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, i) in summaryReportMock" :key="i">
                  <td class="font-medium text-[#1e293b]">{{ row.indicator }}</td>
                  <td class="text-right font-semibold text-[#8B5CF6]">{{ row.value }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Report template cards grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div
          v-for="tmpl in reportTemplates"
          :key="tmpl.id"
          class="an-report-card"
          @click="openReportTemplate(tmpl.id)"
        >
          <div class="an-report-card__icon" :style="{ background: tmpl.color + '18', color: tmpl.color }">
            <!-- money icon -->
            <svg v-if="tmpl.icon === 'money'" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <!-- users icon -->
            <svg v-if="tmpl.icon === 'users'" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            <!-- chart icon -->
            <svg v-if="tmpl.icon === 'chart'" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            <!-- document icon -->
            <svg v-if="tmpl.icon === 'document'" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <h3 class="an-report-card__title">{{ tmpl.title }}</h3>
          <p class="an-report-card__desc">{{ tmpl.description }}</p>
          <button class="an-report-card__btn" :style="{ color: tmpl.color }">
            Сформировать отчёт
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
    </template>
  </DashboardLayout>
</template>

<style scoped>
/* ── Period bar (sticky) ── */
.an-period-bar {
  position: sticky;
  top: 0;
  z-index: 20;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 14px 20px;
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}
.an-period-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.an-chip {
  padding: 7px 16px;
  border-radius: 20px;
  border: 1.5px solid #e2e8f0;
  background: white;
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s;
}
.an-chip:hover { border-color: #94a3b8; }
.an-chip--active {
  background: #22C55E;
  border-color: #22C55E;
  color: white;
}
.an-period-custom { display: flex; gap: 10px; align-items: center; }
.an-period-custom__label { font-size: 13px; color: #64748b; display: flex; align-items: center; gap: 6px; }
.an-period-custom__input {
  width: 130px;
  padding: 6px 10px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 13px;
  outline: none;
}
.an-period-custom__input:focus { border-color: #22C55E; }

/* Quarter picker row */
.an-quarter-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  width: 100%;
  padding-top: 10px;
  border-top: 1px solid #f1f5f9;
  margin-top: 2px;
}
.an-qchip {
  padding: 5px 12px;
  border-radius: 16px;
  border: 1.5px solid #e2e8f0;
  background: white;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s;
}
.an-qchip:hover { border-color: #94a3b8; }
.an-qchip--active {
  background: #059669;
  border-color: #059669;
  color: white;
}

/* Payer filter bar */
.an-payer-bar {
  position: relative;
  margin-bottom: 20px;
}
.an-payer-field-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  background: white;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  padding: 10px 16px;
  transition: border-color 0.15s;
}
.an-payer-field-wrap:focus-within { border-color: #22C55E; }
.an-payer-icon { flex-shrink: 0; }
.an-payer-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  color: #1e293b;
  background: transparent;
}
.an-payer-input::placeholder { color: #94a3b8; }
.an-payer-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  padding: 5px 12px;
  font-size: 14px;
  font-weight: 500;
  color: #166534;
}
.an-payer-badge__x {
  border: none;
  background: none;
  color: #dc2626;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  line-height: 1;
  padding: 0 2px;
}
.an-payer-badge__x:hover { color: #991b1b; }
.an-payer-dropdown {
  position: absolute;
  left: 0;
  right: 0;
  top: calc(100% + 4px);
  z-index: 30;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  max-height: 260px;
  overflow-y: auto;
}
.an-payer-dropdown__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition: background 0.1s;
}
.an-payer-dropdown__item:hover { background: #f8fafc; }
.an-payer-dropdown__item:not(:last-child) { border-bottom: 1px solid #f1f5f9; }
.an-payer-dropdown__name { font-size: 14px; font-weight: 500; color: #1e293b; }
.an-payer-dropdown__inn { font-size: 12px; color: #94a3b8; white-space: nowrap; }

/* ── Financial cards ── */
.an-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 20px;
  display: flex;
  align-items: flex-start;
  gap: 14px;
}
.an-card__icon {
  width: 44px; height: 44px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.an-card__icon--green { background: #dcfce7; color: #22C55E; }
.an-card__icon--red { background: #fee2e2; color: #EF4444; }
.an-card__icon--blue { background: #dbeafe; color: #3B82F6; }
.an-card__icon--gray { background: #f1f5f9; color: #64748b; }
.an-card__body { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.an-card__label { font-size: 12px; color: #94a3b8; font-weight: 500; }
.an-card__value { font-size: 24px; font-weight: 800; line-height: 1.2; }
.an-card__sub { font-size: 12px; color: #94a3b8; }

/* ── Chart container ── */
.an-chart-container {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 24px;
}
.an-section-title { font-size: 16px; font-weight: 700; color: #1e293b; }
.an-chart-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.an-toggle { display: flex; background: #f1f5f9; border-radius: 8px; padding: 3px; }
.an-toggle__btn {
  padding: 6px 14px; border-radius: 6px; border: none; background: transparent;
  font-size: 13px; font-weight: 500; color: #64748b; cursor: pointer; transition: all 0.15s;
}
.an-toggle__btn--active { background: white; color: #1e293b; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.an-chart-legend { display: flex; gap: 20px; margin-bottom: 16px; }
.an-chart-legend__item { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #64748b; }
.an-chart-legend__dot { width: 10px; height: 10px; border-radius: 3px; }

/* Chart area */
.an-chart { display: flex; gap: 0; height: 300px; }
.an-chart__yaxis {
  display: flex; flex-direction: column; justify-content: space-between;
  width: 50px; flex-shrink: 0; padding-right: 8px;
  font-size: 11px; color: #94a3b8; text-align: right;
}
.an-chart__bars {
  flex: 1; display: flex; align-items: flex-end; gap: 4px;
  position: relative; border-left: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;
  padding: 0 8px;
}
.an-chart__grid-lines { position: absolute; inset: 0; pointer-events: none; }
.an-chart__grid-line { position: absolute; left: 0; right: 0; height: 1px; background: #f1f5f9; }
.an-chart__group {
  flex: 1; display: flex; flex-direction: column; align-items: center;
  min-width: 0; position: relative;
}
.an-chart__bar-pair {
  display: flex; gap: 3px; align-items: flex-end; width: 100%; height: 260px;
  justify-content: center;
}
.an-chart__bar {
  width: 40%; max-width: 32px; border-radius: 4px 4px 0 0;
  transition: height 0.3s ease; cursor: pointer; position: relative;
}
.an-chart__bar--income { background: #22C55E; }
.an-chart__bar--income:hover { background: #16A34A; }
.an-chart__bar--refunds { background: #EF4444; }
.an-chart__bar--refunds:hover { background: #DC2626; }
.an-chart__tooltip {
  position: absolute; bottom: calc(100% + 6px); left: 50%; transform: translateX(-50%);
  background: #1e293b; color: white; padding: 4px 10px; border-radius: 6px;
  font-size: 11px; white-space: nowrap; pointer-events: none; z-index: 10;
}
.an-chart__tooltip--red { background: #991B1B; }
.an-chart__bar-val {
  position: absolute;
  bottom: calc(100% + 3px);
  left: 50%;
  transform: translateX(-50%);
  font-size: 10px;
  font-weight: 600;
  white-space: nowrap;
  pointer-events: none;
  line-height: 1;
}
.an-chart__bar-val--income { color: #059669; }
.an-chart__bar-val--refunds { color: #EF4444; }
.an-chart__xlabel { font-size: 12px; color: #64748b; margin-top: 8px; }

/* ── Product groups table ── */
.an-tbl-header, .an-tbl-row, .an-tbl-footer {
  display: flex; align-items: center; gap: 8px; padding: 0 4px;
}
.an-tbl-header {
  padding-bottom: 10px; margin-bottom: 4px; border-bottom: 1px solid #e2e8f0;
}
.an-tbl-header .an-tbl-col {
  font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.04em;
}
.an-tbl-row-wrap {
  border-bottom: 1px solid #f1f5f9;
}
.an-tbl-row {
  padding: 12px 4px; cursor: pointer; border-radius: 8px; transition: background 0.15s;
}
.an-tbl-row:hover { background: #f8fafc; }
.an-tbl-footer {
  padding: 12px 4px; border-top: 2px solid #e2e8f0; margin-top: 4px;
  font-weight: 600; color: #1e293b;
}
.an-tbl-col { font-size: 14px; color: #1e293b; }
.an-tbl-col--num { width: 32px; text-align: center; flex-shrink: 0; }
.an-tbl-col--name { flex: 2; min-width: 0; }
.an-tbl-col--name-text { font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.an-tbl-col--num2 { width: 80px; text-align: right; flex-shrink: 0; }
.an-tbl-col--amount { width: 120px; text-align: right; flex-shrink: 0; }
.an-tbl-col--bold { font-weight: 700; color: #f59e0b; }
.an-tbl-col--share { width: 160px; display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.an-tbl-col--chev { width: 28px; flex-shrink: 0; display: flex; justify-content: center; }
.an-tbl-share-bar {
  flex: 1; height: 6px; background: #f1f5f9; border-radius: 3px; overflow: hidden;
}
.an-tbl-share-bar__fill { display: block; height: 100%; background: #22C55E; border-radius: 3px; }
.an-tbl-share-pct { font-size: 13px; color: #64748b; width: 42px; text-align: right; }
.an-tbl-chevron { color: #94a3b8; transition: transform 0.3s ease; }
.an-tbl-chevron--open { transform: rotate(180deg); color: #22C55E; }

/* Expandable subgroups */
.an-tbl-expand { max-height: 0; overflow: hidden; transition: max-height 0.3s ease; }
.an-tbl-expand--open { max-height: 600px; }
.an-tbl-expand__inner {
  padding: 12px 16px 16px 44px;
  background: #f8fafc;
  border-top: 1px dashed #e2e8f0;
}
.an-tbl-sub-header, .an-tbl-sub-row {
  display: flex; align-items: center; gap: 8px; padding: 6px 0;
}
.an-tbl-sub-header {
  border-bottom: 1px solid #e2e8f0; margin-bottom: 2px;
}
.an-tbl-sub-header .an-tbl-sub-col {
  font-size: 10px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.04em;
}
.an-tbl-sub-col { font-size: 13px; color: #374151; }
.an-tbl-sub-col--name { flex: 2; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.an-tbl-sub-col--num { width: 80px; text-align: right; flex-shrink: 0; }

/* ── Export button ── */
.an-export-btn {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 20px; border-radius: 12px; border: none;
  background: #8B5CF6; color: white; font-size: 14px; font-weight: 600;
  cursor: pointer; transition: background 0.15s;
}
.an-export-btn:hover { background: #7C3AED; }
.an-export-dropdown {
  position: absolute; right: 0; top: calc(100% + 6px); z-index: 30;
  background: white; border: 1px solid #e2e8f0; border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12); overflow: hidden; min-width: 220px;
}
.an-export-dropdown__item {
  display: flex; align-items: center; gap: 10px; width: 100%;
  padding: 12px 16px; border: none; background: transparent;
  font-size: 14px; color: #1e293b; cursor: pointer; text-align: left;
  transition: background 0.1s;
}
.an-export-dropdown__item:hover { background: #f8fafc; }

/* ── Reports tab — template cards ── */
.an-report-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.an-report-card:hover {
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
  transform: translateY(-2px);
  border-color: #cbd5e1;
}
.an-report-card__icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.an-report-card__title {
  font-size: 15px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.3;
}
.an-report-card__desc {
  font-size: 13px;
  color: #94a3b8;
  line-height: 1.5;
}
.an-report-card__btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: auto;
  padding-top: 8px;
  font-size: 13px;
  font-weight: 600;
  background: none;
  border: none;
  cursor: pointer;
  transition: opacity 0.15s;
}
.an-report-card__btn:hover { opacity: 0.8; }

/* ── Reports tab — detail view ── */
.an-report-back-btn {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #64748b;
  transition: all 0.15s;
}
.an-report-back-btn:hover { background: #f8fafc; color: #1e293b; border-color: #cbd5e1; }

.an-report-params {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 20px;
  margin-bottom: 20px;
}
.an-report-params__row {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 16px;
}
.an-report-params__label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
}
.an-report-params__input {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  color: #1e293b;
}
.an-report-params__input:focus { border-color: #22C55E; }

.an-report-generate-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  border-radius: 10px;
  border: none;
  background: #22C55E;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
  min-height: 42px;
}
.an-report-generate-btn:hover { background: #16A34A; }
.an-report-generate-btn:disabled { opacity: 0.7; cursor: wait; }

.an-report-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: an-spin 0.7s linear infinite;
}
@keyframes an-spin { to { transform: rotate(360deg); } }

.an-report-preview {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  overflow: hidden;
}
.an-report-preview__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.an-report-dl-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  border-radius: 8px;
  border: none;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.an-report-dl-btn--excel { background: #dcfce7; color: #166534; }
.an-report-dl-btn--excel:hover { background: #bbf7d0; }
.an-report-dl-btn--pdf { background: #fee2e2; color: #991b1b; }
.an-report-dl-btn--pdf:hover { background: #fecaca; }

.an-report-table-wrap {
  overflow-x: auto;
}
.an-report-table {
  width: 100%;
  border-collapse: collapse;
}
.an-report-table th {
  padding: 10px 16px;
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  text-align: left;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}
.an-report-table td {
  padding: 10px 16px;
  font-size: 14px;
  color: #1e293b;
  border-bottom: 1px solid #f1f5f9;
}
.an-report-table tbody tr:hover { background: #fafbfc; }
.an-report-table tfoot td {
  padding: 12px 16px;
  background: #f0fdf4;
  border-top: 2px solid #e2e8f0;
  border-bottom: none;
}

/* ── Donut charts ── */
.an-donut-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
}
.an-donut-grid--single {
  grid-template-columns: 1fr;
  max-width: 480px;
  margin: 0 auto;
}
.an-donut-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}
.an-donut-subtitle {
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  text-align: center;
}
.an-donut-svg-wrap {
  display: flex;
  justify-content: center;
  position: relative;
}
.an-donut-svg {
  display: block;
  overflow: visible;
}
.an-donut-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
  text-align: center;
  width: 90px;
}
.an-donut-center__value {
  font-size: 16px;
  font-weight: 800;
  color: #0F172A;
  line-height: 1.2;
  transition: all 0.3s ease;
  word-break: break-all;
}
.an-donut-center__label {
  font-size: 11px;
  color: #94A3B8;
  margin-top: 2px;
  line-height: 1.2;
  max-width: 90px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.an-donut-tooltip {
  position: absolute;
  z-index: 50;
  background: #1E293B;
  color: white;
  border-radius: 8px;
  padding: 10px 14px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
  font-size: 13px;
  pointer-events: none;
  white-space: nowrap;
  min-width: 140px;
}
.an-donut-tooltip__title {
  font-weight: 700;
  margin-bottom: 4px;
  font-size: 13px;
}
.an-donut-tooltip__row {
  font-size: 12px;
  color: #CBD5E1;
  line-height: 1.6;
}
.an-donut-tooltip__row--muted {
  color: #94A3B8;
  font-size: 11px;
}
.an-donut-legend {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 0.4s ease, transform 0.4s ease;
}
.an-donut-legend--visible {
  opacity: 1;
  transform: translateY(0);
}
.an-donut-legend__item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #475569;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 6px;
  transition: background 0.2s ease, font-weight 0.2s ease;
}
.an-donut-legend__item:hover,
.an-donut-legend__item--active {
  background: #F1F5F9;
  font-weight: 600;
}
.an-donut-legend__dot {
  width: 10px;
  height: 10px;
  border-radius: 3px;
  flex-shrink: 0;
}
.an-donut-legend__label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.an-donut-legend__value {
  font-weight: 600;
  color: #1e293b;
  white-space: nowrap;
}
.an-donut-legend__pct {
  width: 42px;
  text-align: right;
  color: #94a3b8;
  font-weight: 500;
  flex-shrink: 0;
}

/* ── Show all button ── */
.an-show-all-wrap {
  display: flex;
  justify-content: center;
  padding: 16px 0 4px;
}
.an-show-all-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: white;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s;
}
.an-show-all-btn:hover { background: #f8fafc; border-color: #cbd5e1; color: #1e293b; }
.an-show-all-icon { transition: transform 0.3s ease; color: #94a3b8; }
.an-show-all-icon--open { transform: rotate(180deg); }

/* ── Mono column style ── */
.an-tbl-col--mono {
  font-family: monospace;
  font-size: 12px;
  color: #64748b;
}

/* ── Debtors section ── */
.an-debtors-container {
  border-left: 3px solid #EF4444;
}
.an-debtors-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}
.an-debtors-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  border-radius: 12px;
  background: #fee2e2;
  color: #EF4444;
  font-size: 12px;
  font-weight: 700;
  padding: 0 6px;
}
.an-debtors-total {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 16px;
}

/* ── Status badges ── */
.an-status-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}
.an-status-badge--red { background: #fee2e2; color: #DC2626; }
.an-status-badge--orange { background: #fff7ed; color: #EA580C; }
.an-status-badge--green { background: #dcfce7; color: #16A34A; }

/* ── Status column ── */
.an-tbl-col--status {
  width: 200px;
  flex-shrink: 0;
}

/* ── Horizontal bar chart ── */
.an-hbar-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.an-hbar-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.an-hbar-label {
  width: 200px;
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 500;
  color: #1e293b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.an-hbar-label--multi {
  display: flex;
  flex-direction: column;
  gap: 1px;
  white-space: normal;
}
.an-hbar-parent {
  font-size: 11px;
  color: #94a3b8;
  font-weight: 400;
}
.an-hbar-track {
  flex: 1;
  height: 22px;
  background: #f1f5f9;
  border-radius: 4px;
  overflow: hidden;
}
.an-hbar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}
.an-hbar-value {
  width: 130px;
  flex-shrink: 0;
  text-align: right;
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
  white-space: nowrap;
}

/* ── Rate and trend columns ── */
.an-tbl-col--rate {
  width: 90px;
  text-align: right;
  flex-shrink: 0;
  font-size: 13px;
  color: #64748b;
}
.an-tbl-col--trend {
  width: 80px;
  text-align: right;
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 600;
}

/* ── Subsection titles ── */
.an-subsection-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 20px;
  padding-top: 8px;
}

/* ── Recycling divider ── */
.an-recycling-divider {
  border-top: 2px solid #e2e8f0;
  margin: 32px 0 24px;
}

/* ── Recycling norms row highlights ── */
.an-norm-row--met td { background: transparent; }
.an-norm-row--unmet td { background: #fef2f2; }
.an-norm-row--highlighted td {
  background: #eff6ff !important;
  transition: background 0.2s ease;
}
.an-norm-row--faded td {
  opacity: 0.45;
  transition: opacity 0.2s ease;
}

/* ── Horizontal bar hover effects ── */
.an-hbar-row {
  transition: opacity 0.2s ease, background 0.2s ease;
  cursor: pointer;
  padding: 6px 8px;
  border-radius: 8px;
  margin: -6px -8px;
  margin-bottom: 4px;
}
.an-hbar-row--active {
  background: #f8fafc;
}
.an-hbar-row--dimmed {
  opacity: 0.4;
}
.an-hbar-fill {
  transition: width 0.3s ease, filter 0.3s ease;
}

/* ── Bar chart tooltip ── */
.an-bar-tooltip {
  position: absolute;
  z-index: 50;
  background: #1E293B;
  color: white;
  border-radius: 8px;
  padding: 10px 14px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
  font-size: 13px;
  pointer-events: none;
  white-space: nowrap;
  min-width: 140px;
}
.an-bar-tooltip__title {
  font-weight: 700;
  margin-bottom: 4px;
  font-size: 13px;
}
.an-bar-tooltip__row {
  font-size: 12px;
  color: #CBD5E1;
  line-height: 1.6;
}

/* ── Grouped bar chart dim effect ── */
.an-chart__group {
  transition: opacity 0.2s ease;
}
.an-chart__group--dimmed {
  opacity: 0.35;
}
.an-chart__bar {
  transition: height 0.3s ease, filter 0.3s ease;
}

/* ── Tab export row ── */
.an-tab-export-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
  margin-bottom: 8px;
}
.an-tab-export-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  border-radius: 12px;
  border: none;
  background: #22C55E;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}
.an-tab-export-btn:hover { background: #16A34A; }

/* ── Mobile ── */
@media (max-width: 767px) {
  .an-card__value { font-size: 20px; }
  .an-tbl-col--share { display: none; }
  .an-tbl-col--rate { display: none; }
  .an-tbl-col--trend { display: none; }
  .an-tbl-col--status { width: auto; }
  .an-tbl-col--num2 { width: 60px; font-size: 12px; }
  .an-tbl-col--amount { width: 90px; font-size: 12px; }
  .an-chart__bar { max-width: 18px; }
  .an-chart__yaxis { width: 36px; font-size: 10px; }
  .an-report-params__row { flex-direction: column; }
  .an-donut-grid { grid-template-columns: 1fr; gap: 24px; }
  .an-donut-svg { width: 160px; height: 160px; }
  .an-donut-center__value { font-size: 14px; }
  .an-donut-center { width: 72px; }
  .an-hbar-label { width: 120px; font-size: 12px; }
  .an-hbar-value { width: 90px; font-size: 12px; }
}
</style>
