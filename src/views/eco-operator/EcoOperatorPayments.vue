<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import { useEcoOperatorMenu } from '../../composables/useRoleMenu'

const { t } = useI18n()
const { roleTitle, menuItems } = useEcoOperatorMenu()

// Полный список 24 групп товаров
const productGroups = computed(() => [
  { number: 0, name: t('ecoPayments.allGroups') },
  { number: 1, name: t('ecoPayments.group1'), type: 'goods' },
  { number: 2, name: t('ecoPayments.group2'), type: 'goods' },
  { number: 3, name: t('ecoPayments.group3'), type: 'goods' },
  { number: 4, name: t('ecoPayments.group4'), type: 'goods' },
  { number: 5, name: t('ecoPayments.group5'), type: 'goods' },
  { number: 6, name: t('ecoPayments.group6'), type: 'goods' },
  { number: 7, name: t('ecoPayments.group7'), type: 'goods' },
  { number: 8, name: t('ecoPayments.group8'), type: 'goods' },
  { number: 9, name: t('ecoPayments.group9'), type: 'goods' },
  { number: 10, name: t('ecoPayments.group10'), type: 'goods' },
  { number: 11, name: t('ecoPayments.group11'), type: 'goods' },
  { number: 12, name: t('ecoPayments.group12'), type: 'goods' },
  { number: 13, name: t('ecoPayments.group13'), type: 'goods' },
  { number: 14, name: t('ecoPayments.group14'), type: 'goods' },
  { number: 15, name: t('ecoPayments.group15'), type: 'goods' },
  { number: 16, name: t('ecoPayments.group16'), type: 'goods' },
  { number: 17, name: t('ecoPayments.group17'), type: 'goods' },
  { number: 18, name: t('ecoPayments.group18'), type: 'goods' },
  { number: 19, name: t('ecoPayments.group19'), type: 'packaging' },
  { number: 20, name: t('ecoPayments.group20'), type: 'packaging' },
  { number: 21, name: t('ecoPayments.group21'), type: 'packaging' },
  { number: 22, name: t('ecoPayments.group22'), type: 'packaging' },
  { number: 23, name: t('ecoPayments.group23'), type: 'packaging' },
  { number: 24, name: t('ecoPayments.group24'), type: 'packaging' },
])

// Filters for payments
const paymentsFilters = ref({
  dateFrom: '2025-01-01',
  dateTo: '2025-12-31',
  groupNumber: 0,
  search: '',
})

// Filters for debts
const debtsFilters = ref({
  dateFrom: '2025-01-01',
  dateTo: '2025-12-31',
  minDebt: 0,
  search: '',
})

// Table refs for scrolling
const paymentsTableRef = ref<HTMLElement | null>(null)
const debtsTableRef = ref<HTMLElement | null>(null)

// Highlight states
const highlightPayments = ref(false)
const highlightDebts = ref(false)

// Show unique companies only filter
const showUniqueCompanies = ref(false)

// Payments data
interface Payment {
  id: number
  company: string
  inn: string
  groupNumber: number
  groupName: string
  period: string
  amount: number
  paymentDate: string
}

const paymentsData = ref<Payment[]>([
  { id: 1, company: 'ОсОО "БишкекПласт"', inn: '01234567891234', groupNumber: 6, groupName: 'Изделия пластмассовые упаковочные', period: 'I квартал 2025', amount: 117725, paymentDate: '2025-01-15' },
  { id: 2, company: 'ОсОО "ТаласПак"', inn: '08912345678901', groupNumber: 22, groupName: 'Упаковка из гофрокартона', period: 'I квартал 2025', amount: 92001, paymentDate: '2025-01-20' },
  { id: 3, company: 'ОАО "ОшМеталл"', inn: '03456789123456', groupNumber: 12, groupName: 'Аккумуляторы свинцовые', period: 'I квартал 2025', amount: 62009, paymentDate: '2025-01-25' },
  { id: 4, company: 'ИП "Асанов"', inn: '12345678901234', groupNumber: 8, groupName: 'Стекло полое', period: 'I квартал 2025', amount: 63285, paymentDate: '2025-01-28' },
  { id: 5, company: 'ОсОО "GreenPack"', inn: '04567891234567', groupNumber: 19, groupName: 'Упаковка полимерная (без галогенов)', period: 'I квартал 2025', amount: 48974, paymentDate: '2025-02-02' },
  { id: 6, company: 'ОсОО "АвтоШина"', inn: '09123456789012', groupNumber: 4, groupName: 'Шины, покрышки и камеры резиновые', period: 'I квартал 2025', amount: 555525, paymentDate: '2025-02-05' },
  { id: 7, company: 'ОсОО "ЭкоРесайкл"', inn: '02345678912345', groupNumber: 1, groupName: 'Изделия из гофрированной бумаги/картона', period: 'II квартал 2025', amount: 119825, paymentDate: '2025-04-12' },
  { id: 8, company: 'ОсОО "ИссыкКульЭко"', inn: '06789123456789', groupNumber: 2, groupName: 'Изделия из негофрированной бумаги/картона', period: 'II квартал 2025', amount: 123090, paymentDate: '2025-04-18' },
  { id: 9, company: 'ОсОО "ОшПластик"', inn: '11345678901234', groupNumber: 7, groupName: 'Изделия пластмассовые прочие', period: 'II квартал 2025', amount: 107878, paymentDate: '2025-04-22' },
  { id: 10, company: 'ОсОО "ЧуйСтрой"', inn: '05678912345678', groupNumber: 5, groupName: 'Изделия из резины (за исключением шин)', period: 'II квартал 2025', amount: 116474, paymentDate: '2025-05-10' },
  { id: 11, company: 'ОсОО "ДжАПласт"', inn: '13456789012345', groupNumber: 20, groupName: 'Упаковка полимерная (с галогенами)', period: 'II квартал 2025', amount: 95137, paymentDate: '2025-05-15' },
  { id: 12, company: 'ИП "Мамытова"', inn: '14567890123456', groupNumber: 3, groupName: 'Масла', period: 'II квартал 2025', amount: 37827, paymentDate: '2025-05-20' },
  { id: 13, company: 'ОсОО "ТехноМир"', inn: '15678901234567', groupNumber: 10, groupName: 'Мониторы, приемники телевизионные', period: 'III квартал 2025', amount: 101797, paymentDate: '2025-07-08' },
  { id: 14, company: 'ОсОО "БишкекПласт"', inn: '01234567891234', groupNumber: 6, groupName: 'Изделия пластмассовые упаковочные', period: 'III квартал 2025', amount: 125890, paymentDate: '2025-07-15' },
  { id: 15, company: 'ОсОО "АвтоШина"', inn: '09123456789012', groupNumber: 4, groupName: 'Шины, покрышки и камеры резиновые', period: 'III квартал 2025', amount: 612500, paymentDate: '2025-08-01' },
])

// Debts data
interface Debtor {
  id: number
  company: string
  inn: string
  expectedAmount: number
  paidAmount: number
  debt: number
  daysOverdue: number
  status: 'unpaid' | 'partial' | 'overdue'
}

const debtorsData = ref<Debtor[]>([
  { id: 1, company: 'ОсОО "ЭлектроРесурс"', inn: '10234567890123', expectedAmount: 116339, paidAmount: 0, debt: 116339, daysOverdue: 45, status: 'overdue' },
  { id: 2, company: 'ОАО "НарынМеталл"', inn: '07891234567890', expectedAmount: 220748, paidAmount: 0, debt: 220748, daysOverdue: 38, status: 'overdue' },
  { id: 3, company: 'ИП "Жумабеков"', inn: '23456789012345', expectedAmount: 55950, paidAmount: 0, debt: 55950, daysOverdue: 52, status: 'overdue' },
  { id: 4, company: 'ИП "Токтогулова"', inn: '34567890123456', expectedAmount: 44032, paidAmount: 0, debt: 44032, daysOverdue: 15, status: 'unpaid' },
  { id: 5, company: 'ОсОО "МегаТрейд"', inn: '45678901234567', expectedAmount: 188360, paidAmount: 100000, debt: 88360, daysOverdue: 22, status: 'partial' },
  { id: 6, company: 'ОсОО "ЭкоГласс"', inn: '56789012345678', expectedAmount: 84380, paidAmount: 0, debt: 84380, daysOverdue: 35, status: 'overdue' },
  { id: 7, company: 'ОсОО "ОшПлюс"', inn: '67890123456789', expectedAmount: 185175, paidAmount: 50000, debt: 135175, daysOverdue: 48, status: 'overdue' },
  { id: 8, company: 'ИП "Сыдыкова"', inn: '78901234567890', expectedAmount: 47090, paidAmount: 0, debt: 47090, daysOverdue: 28, status: 'overdue' },
  { id: 9, company: 'ОсОО "БаткенТорг"', inn: '89012345678901', expectedAmount: 71895, paidAmount: 30000, debt: 41895, daysOverdue: 18, status: 'partial' },
  { id: 10, company: 'ОсОО "ТехноСервис"', inn: '90123456789012', expectedAmount: 363560, paidAmount: 200000, debt: 163560, daysOverdue: 10, status: 'partial' },
])

// Monthly data for chart
const monthlyData = ref([
  { month: 'Янв', amount: 939519 },
  { month: 'Фев', amount: 48974 },
  { month: 'Мар', amount: 0 },
  { month: 'Апр', amount: 350793 },
  { month: 'Май', amount: 249438 },
  { month: 'Июн', amount: 0 },
  { month: 'Июл', amount: 227687 },
  { month: 'Авг', amount: 612500 },
  { month: 'Сен', amount: 0 },
  { month: 'Окт', amount: 0 },
  { month: 'Ноя', amount: 0 },
  { month: 'Дек', amount: 0 },
])

// Computed
const filteredPayments = computed(() => {
  let result = paymentsData.value.filter(p => {
    if (paymentsFilters.value.groupNumber > 0 && p.groupNumber !== paymentsFilters.value.groupNumber) return false
    if (paymentsFilters.value.search) {
      const query = paymentsFilters.value.search.toLowerCase()
      if (!p.company.toLowerCase().includes(query)) return false
    }
    return true
  })

  // Show unique companies only
  if (showUniqueCompanies.value) {
    const seen = new Set<string>()
    result = result.filter(p => {
      if (seen.has(p.inn)) return false
      seen.add(p.inn)
      return true
    })
  }

  return result
})

const filteredDebtors = computed(() => {
  return debtorsData.value.filter(d => {
    if (debtsFilters.value.minDebt > 0 && d.debt < debtsFilters.value.minDebt) return false
    if (debtsFilters.value.search) {
      const query = debtsFilters.value.search.toLowerCase()
      if (!d.company.toLowerCase().includes(query)) return false
    }
    return true
  }).sort((a, b) => b.debt - a.debt)
})

// Summary stats
const summaryStats = computed(() => {
  const totalPayments = paymentsData.value.reduce((sum, p) => sum + p.amount, 0)
  const totalDebt = debtorsData.value.reduce((sum, d) => sum + d.debt, 0)
  const payersCount = new Set(paymentsData.value.map(p => p.inn)).size
  const debtorsCount = debtorsData.value.length

  return {
    totalPayments,
    totalDebt,
    payersCount,
    debtorsCount,
  }
})

const paymentsTotals = computed(() => ({
  count: filteredPayments.value.length,
  amount: filteredPayments.value.reduce((sum, p) => sum + p.amount, 0),
}))

const debtorsTotals = computed(() => ({
  count: filteredDebtors.value.length,
  expected: filteredDebtors.value.reduce((sum, d) => sum + d.expectedAmount, 0),
  paid: filteredDebtors.value.reduce((sum, d) => sum + d.paidAmount, 0),
  debt: filteredDebtors.value.reduce((sum, d) => sum + d.debt, 0),
}))

// Year total for bar chart
const yearTotal = computed(() => monthlyData.value.reduce((sum, m) => sum + m.amount, 0))

// Total for pie chart (payments + debts)
const totalAmount = computed(() => summaryStats.value.totalPayments + summaryStats.value.totalDebt)

// Helpers
const formatNumber = (num: number) => num.toLocaleString()

const formatCompactNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'М'
  if (num >= 1000) return Math.round(num / 1000) + 'К'
  return num.toString()
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString()
}

const getDebtorStatusClass = (status: string) => {
  switch (status) {
    case 'unpaid': return 'bg-orange-100 text-orange-700'
    case 'partial': return 'bg-amber-100 text-amber-700'
    case 'overdue': return 'bg-red-100 text-red-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

const getDebtorStatusText = (status: string) => {
  switch (status) {
    case 'unpaid': return t('ecoPayments.statusUnpaid')
    case 'partial': return t('ecoPayments.statusPartial')
    case 'overdue': return t('ecoPayments.statusOverdue')
    default: return status
  }
}

// Card click handlers
const scrollToPayments = () => {
  showUniqueCompanies.value = false
  nextTick(() => {
    paymentsTableRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    highlightPayments.value = true
    setTimeout(() => { highlightPayments.value = false }, 2000)
  })
}

const scrollToDebts = () => {
  nextTick(() => {
    debtsTableRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    highlightDebts.value = true
    setTimeout(() => { highlightDebts.value = false }, 2000)
  })
}

const showUniquePayers = () => {
  showUniqueCompanies.value = true
  nextTick(() => {
    paymentsTableRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    highlightPayments.value = true
    setTimeout(() => { highlightPayments.value = false }, 2000)
  })
}

// Export functions for individual tables
const exportPaymentsReport = (format: 'excel' | 'pdf') => {
  if (format === 'excel') {
    let csvContent = '\uFEFF'
    csvContent += t('ecoPayments.csvPaymentsTitle') + '\n'
    csvContent += `${t('ecoPayments.csvPeriod')}:,${paymentsFilters.value.dateFrom} — ${paymentsFilters.value.dateTo}\n\n`
    csvContent += `${t('ecoPayments.csvCompany')},${t('ecoPayments.csvInn')},${t('ecoPayments.csvProductGroup')},${t('ecoPayments.csvPeriodCol')},${t('ecoPayments.csvAmount')},${t('ecoPayments.csvPaymentDate')}\n`

    filteredPayments.value.forEach(p => {
      csvContent += `"${p.company}",${p.inn},"${p.groupName}","${p.period}",${p.amount},"${formatDate(p.paymentDate)}"\n`
    })

    csvContent += `\n${t('ecoPayments.csvTotal')}:,,,,${paymentsTotals.value.amount},\n`
    csvContent += `\n${t('ecoPayments.csvGeneratedDate')}:,${new Date().toLocaleDateString()}\n`

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'report_payments.csv'
    link.click()
    URL.revokeObjectURL(link.href)
  } else {
    generatePDF('payments')
  }
}

const exportDebtsReport = (format: 'excel' | 'pdf') => {
  if (format === 'excel') {
    let csvContent = '\uFEFF'
    csvContent += t('ecoPayments.csvDebtsTitle') + '\n'
    csvContent += `${t('ecoPayments.csvPeriod')}:,${debtsFilters.value.dateFrom} — ${debtsFilters.value.dateTo}\n\n`
    csvContent += `${t('ecoPayments.csvCompany')},${t('ecoPayments.csvInn')},${t('ecoPayments.csvExpectedAmount')},${t('ecoPayments.csvPaid')},${t('ecoPayments.csvDebt')},${t('ecoPayments.csvDaysOverdue')},${t('ecoPayments.csvStatus')}\n`

    filteredDebtors.value.forEach(d => {
      csvContent += `"${d.company}",${d.inn},${d.expectedAmount},${d.paidAmount},${d.debt},${d.daysOverdue},"${getDebtorStatusText(d.status)}"\n`
    })

    csvContent += `\n${t('ecoPayments.csvTotal')}:,,${debtorsTotals.value.expected},${debtorsTotals.value.paid},${debtorsTotals.value.debt},,\n`
    csvContent += `\n${t('ecoPayments.csvGeneratedDate')}:,${new Date().toLocaleDateString()}\n`

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'report_debts.csv'
    link.click()
    URL.revokeObjectURL(link.href)
  } else {
    generatePDF('debts')
  }
}

// Full page export
const exportFullAnalytics = (format: 'excel' | 'pdf') => {
  if (format === 'excel') {
    let csvContent = '\uFEFF'
    csvContent += t('ecoPayments.csvFullReportTitle') + '\n'
    csvContent += `${t('ecoPayments.csvGeneratedDate')}:,${new Date().toLocaleDateString()}\n\n`

    // Summary
    csvContent += `=== ${t('ecoPayments.csvSummary')} ===\n`
    csvContent += `${t('ecoPayments.totalPayments')}:,${summaryStats.value.totalPayments} ${t('ecoPayments.som')}\n`
    csvContent += `${t('ecoPayments.totalDebt')}:,${summaryStats.value.totalDebt} ${t('ecoPayments.som')}\n`
    csvContent += `${t('ecoPayments.paidCompanies')}:,${summaryStats.value.payersCount}\n`
    csvContent += `${t('ecoPayments.debtors')}:,${summaryStats.value.debtorsCount}\n\n`

    // Monthly data
    csvContent += `=== ${t('ecoPayments.csvMonthlyPayments')} ===\n`
    csvContent += `${t('ecoPayments.csvMonth')},${t('ecoPayments.csvAmount')}\n`
    monthlyData.value.forEach(m => {
      csvContent += `${m.month},${m.amount}\n`
    })
    csvContent += `${t('ecoPayments.yearTotal')}:,${yearTotal.value}\n\n`

    // Payments
    csvContent += `=== ${t('ecoPayments.csvReceivedPayments')} ===\n`
    csvContent += `${t('ecoPayments.csvCompany')},${t('ecoPayments.csvInn')},${t('ecoPayments.csvProductGroup')},${t('ecoPayments.csvPeriodCol')},${t('ecoPayments.csvAmount')},${t('ecoPayments.csvPaymentDate')}\n`
    paymentsData.value.forEach(p => {
      csvContent += `"${p.company}",${p.inn},"${p.groupName}","${p.period}",${p.amount},"${formatDate(p.paymentDate)}"\n`
    })
    csvContent += `${t('ecoPayments.csvTotal')}:,,,,${summaryStats.value.totalPayments},\n\n`

    // Debts
    csvContent += `=== ${t('ecoPayments.csvDebtsSection')} ===\n`
    csvContent += `${t('ecoPayments.csvCompany')},${t('ecoPayments.csvInn')},${t('ecoPayments.csvExpectedAmount')},${t('ecoPayments.csvPaid')},${t('ecoPayments.csvDebt')},${t('ecoPayments.csvDaysOverdue')},${t('ecoPayments.csvStatus')}\n`
    debtorsData.value.forEach(d => {
      csvContent += `"${d.company}",${d.inn},${d.expectedAmount},${d.paidAmount},${d.debt},${d.daysOverdue},"${getDebtorStatusText(d.status)}"\n`
    })
    csvContent += `${t('ecoPayments.csvTotal')}:,,${debtorsTotals.value.expected},${debtorsTotals.value.paid},${summaryStats.value.totalDebt},,\n`

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'analytics_full_report.csv'
    link.click()
    URL.revokeObjectURL(link.href)
  } else {
    generatePDF('full')
  }
}

const generatePDF = (type: 'payments' | 'debts' | 'full') => {
  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  let content = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${t('ecoPayments.pdfTitle')}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; font-size: 12px; }
        h1 { color: #1e293b; font-size: 18px; margin-bottom: 5px; }
        h2 { color: #334155; font-size: 14px; margin: 20px 0 10px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; }
        .date { color: #64748b; margin-bottom: 20px; }
        .summary { display: flex; gap: 20px; margin-bottom: 20px; flex-wrap: wrap; }
        .summary-card { background: #f8fafc; padding: 12px 16px; border-radius: 8px; min-width: 150px; }
        .summary-card .label { color: #64748b; font-size: 11px; }
        .summary-card .value { font-size: 16px; font-weight: bold; margin-top: 4px; }
        .summary-card .value.green { color: #16a34a; }
        .summary-card .value.red { color: #dc2626; }
        .summary-card .value.blue { color: #2563eb; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { border: 1px solid #e2e8f0; padding: 6px 8px; text-align: left; }
        th { background: #f1f5f9; font-weight: 600; font-size: 10px; text-transform: uppercase; }
        .amount { text-align: right; }
        .total-row { background: #f0fdf4; font-weight: bold; }
        .total-row.debts { background: #fef2f2; }
        .chart-section { margin: 20px 0; padding: 15px; background: #f8fafc; border-radius: 8px; }
        .monthly-chart { display: flex; gap: 8px; align-items: flex-end; height: 100px; margin-top: 10px; }
        .bar { flex: 1; background: linear-gradient(to top, #84cc16, #a3e635); border-radius: 4px 4px 0 0; min-width: 20px; position: relative; }
        .bar-label { position: absolute; bottom: -20px; left: 50%; transform: translateX(-50%); font-size: 9px; color: #64748b; }
        .bar-value { position: absolute; top: -18px; left: 50%; transform: translateX(-50%); font-size: 8px; color: #334155; white-space: nowrap; }
        @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
      </style>
    </head>
    <body>
      <h1>${t('ecoPayments.pdfHeader')}</h1>
      <div class="date">${t('ecoPayments.csvGeneratedDate')}: ${new Date().toLocaleDateString()}</div>
  `

  if (type === 'full' || type === 'payments') {
    content += `
      <div class="summary">
        <div class="summary-card">
          <div class="label">${t('ecoPayments.totalPayments')}</div>
          <div class="value green">${formatNumber(summaryStats.value.totalPayments)} ${t('ecoPayments.som')}</div>
        </div>
        <div class="summary-card">
          <div class="label">${t('ecoPayments.totalDebt')}</div>
          <div class="value red">${formatNumber(summaryStats.value.totalDebt)} ${t('ecoPayments.som')}</div>
        </div>
        <div class="summary-card">
          <div class="label">${t('ecoPayments.paidCompanies')}</div>
          <div class="value blue">${summaryStats.value.payersCount}</div>
        </div>
        <div class="summary-card">
          <div class="label">${t('ecoPayments.debtors')}</div>
          <div class="value">${summaryStats.value.debtorsCount}</div>
        </div>
      </div>
    `
  }

  if (type === 'full') {
    content += `
      <div class="chart-section">
        <h2 style="margin-top: 0; border: none;">${t('ecoPayments.monthlyPayments2025')}</h2>
        <table>
          <tr>
            ${monthlyData.value.map(m => `<th style="text-align: center">${m.month}</th>`).join('')}
          </tr>
          <tr>
            ${monthlyData.value.map(m => `<td style="text-align: center">${m.amount > 0 ? formatCompactNumber(m.amount) : '—'}</td>`).join('')}
          </tr>
        </table>
        <div style="text-align: right; font-weight: bold; margin-top: 10px;">${t('ecoPayments.yearTotal')}: ${formatNumber(yearTotal.value)} ${t('ecoPayments.som')}</div>
      </div>
    `
  }

  if (type === 'full' || type === 'payments') {
    const payments = type === 'full' ? paymentsData.value : filteredPayments.value
    const total = type === 'full' ? summaryStats.value.totalPayments : paymentsTotals.value.amount

    content += `
      <h2>${t('ecoPayments.receivedPayments')}</h2>
      <table>
        <thead>
          <tr>
            <th>${t('ecoPayments.csvCompany')}</th>
            <th>${t('ecoPayments.csvInn')}</th>
            <th>${t('ecoPayments.csvProductGroup')}</th>
            <th>${t('ecoPayments.csvPeriodCol')}</th>
            <th class="amount">${t('ecoPayments.csvAmount')}</th>
            <th>${t('ecoPayments.csvPaymentDate')}</th>
          </tr>
        </thead>
        <tbody>
          ${payments.map(p => `
            <tr>
              <td>${p.company}</td>
              <td>${p.inn}</td>
              <td>№${p.groupNumber}: ${p.groupName}</td>
              <td>${p.period}</td>
              <td class="amount">${formatNumber(p.amount)} ${t('ecoPayments.som')}</td>
              <td>${formatDate(p.paymentDate)}</td>
            </tr>
          `).join('')}
          <tr class="total-row">
            <td colspan="4"><strong>${t('ecoPayments.csvTotal')} (${payments.length} ${t('ecoPayments.paymentsCount')})</strong></td>
            <td class="amount"><strong>${formatNumber(total)} ${t('ecoPayments.som')}</strong></td>
            <td></td>
          </tr>
        </tbody>
      </table>
    `
  }

  if (type === 'full' || type === 'debts') {
    const debtors = type === 'full' ? debtorsData.value : filteredDebtors.value
    const totals = type === 'full' ? {
      count: debtorsData.value.length,
      expected: debtorsData.value.reduce((s, d) => s + d.expectedAmount, 0),
      paid: debtorsData.value.reduce((s, d) => s + d.paidAmount, 0),
      debt: summaryStats.value.totalDebt,
    } : debtorsTotals.value

    content += `
      <h2>${t('ecoPayments.debtsTitle')}</h2>
      <table>
        <thead>
          <tr>
            <th>${t('ecoPayments.csvCompany')}</th>
            <th>${t('ecoPayments.csvInn')}</th>
            <th class="amount">${t('ecoPayments.csvExpectedAmount')}</th>
            <th class="amount">${t('ecoPayments.csvPaid')}</th>
            <th class="amount">${t('ecoPayments.csvDebt')}</th>
            <th>${t('ecoPayments.overdue')}</th>
            <th>${t('ecoPayments.csvStatus')}</th>
          </tr>
        </thead>
        <tbody>
          ${debtors.map(d => `
            <tr>
              <td>${d.company}</td>
              <td>${d.inn}</td>
              <td class="amount">${formatNumber(d.expectedAmount)}</td>
              <td class="amount">${formatNumber(d.paidAmount)}</td>
              <td class="amount" style="color: #dc2626; font-weight: bold;">${formatNumber(d.debt)}</td>
              <td>${d.daysOverdue} ${t('ecoPayments.days')}</td>
              <td>${getDebtorStatusText(d.status)}</td>
            </tr>
          `).join('')}
          <tr class="total-row debts">
            <td colspan="2"><strong>${t('ecoPayments.csvTotal')} (${totals.count} ${t('ecoPayments.debtorsCount')})</strong></td>
            <td class="amount"><strong>${formatNumber(totals.expected)}</strong></td>
            <td class="amount"><strong>${formatNumber(totals.paid)}</strong></td>
            <td class="amount" style="color: #dc2626;"><strong>${formatNumber(totals.debt)} ${t('ecoPayments.som')}</strong></td>
            <td colspan="2"></td>
          </tr>
        </tbody>
      </table>
    `
  }

  content += `
    </body>
    </html>
  `

  printWindow.document.write(content)
  printWindow.document.close()
  printWindow.onload = () => {
    printWindow.print()
  }
}

// Chart calculations
const maxMonthlyAmount = computed(() => Math.max(...monthlyData.value.map(m => m.amount)))
const paidPercent = computed(() => Math.round((summaryStats.value.totalPayments / (summaryStats.value.totalPayments + summaryStats.value.totalDebt)) * 100))
</script>

<template>
  <DashboardLayout
    role="eco-operator"
    :roleTitle="roleTitle"
    userName="ОсОО «ЭкоПереработка»"
    :menuItems="menuItems"
  >
    <div class="space-y-6">
      <!-- Header with Export Buttons -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">{{ $t('pages.ecoOperator.paymentsTitle') }}</h1>
          <p class="text-gray-600 mt-1">{{ $t('pages.ecoOperator.paymentsSubtitle') }}</p>
        </div>
        <div class="flex gap-2">
          <button
            @click="exportFullAnalytics('excel')"
            class="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {{ $t('common.downloadReportExcel') }}
          </button>
          <button
            @click="exportFullAnalytics('pdf')"
            class="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            {{ $t('common.downloadReportPdf') }}
          </button>
        </div>
      </div>

      <!-- Summary Cards - Interactive -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div
          @click="scrollToPayments"
          class="bg-white rounded-xl p-5 border border-gray-200 shadow-sm cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 hover:border-green-300"
        >
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p class="text-sm text-gray-500">{{ $t('ecoPayments.totalPayments') }}</p>
              <p class="text-xl font-bold text-green-600">{{ formatNumber(summaryStats.totalPayments) }} {{ $t('ecoPayments.som') }}</p>
            </div>
          </div>
        </div>

        <div
          @click="scrollToDebts"
          class="bg-white rounded-xl p-5 border border-gray-200 shadow-sm cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 hover:border-red-300"
        >
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p class="text-sm text-gray-500">{{ $t('ecoPayments.totalDebt') }}</p>
              <p class="text-xl font-bold text-red-600">{{ formatNumber(summaryStats.totalDebt) }} {{ $t('ecoPayments.som') }}</p>
            </div>
          </div>
        </div>

        <div
          @click="showUniquePayers"
          class="bg-white rounded-xl p-5 border border-gray-200 shadow-sm cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 hover:border-blue-300"
        >
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p class="text-sm text-gray-500">{{ $t('ecoPayments.paidCompanies') }}</p>
              <p class="text-xl font-bold text-blue-600">{{ summaryStats.payersCount }}</p>
            </div>
          </div>
        </div>

        <div
          @click="scrollToDebts"
          class="bg-white rounded-xl p-5 border border-gray-200 shadow-sm cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 hover:border-amber-300"
        >
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p class="text-sm text-gray-500">{{ $t('ecoPayments.debtors') }}</p>
              <p class="text-xl font-bold text-amber-600">{{ summaryStats.debtorsCount }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Bar Chart: Monthly Payments with amounts -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="font-semibold text-gray-900 mb-4">{{ $t('ecoPayments.monthlyPayments2025') }}</h3>
          <div class="flex items-end gap-2 h-56 pt-6">
            <div v-for="m in monthlyData" :key="m.month" class="flex-1 flex flex-col items-center">
              <div class="w-full flex flex-col items-center justify-end h-44 relative">
                <!-- Amount above bar -->
                <div
                  v-if="m.amount > 0"
                  class="absolute text-xs font-medium text-gray-700 whitespace-nowrap"
                  :style="{ bottom: `${maxMonthlyAmount > 0 ? (m.amount / maxMonthlyAmount) * 100 + 8 : 8}%` }"
                >
                  {{ formatCompactNumber(m.amount) }}
                </div>
                <div
                  class="w-full max-w-8 rounded-t transition-all"
                  :class="m.amount > 0 ? 'bg-gradient-to-t from-lime-500 to-lime-400' : 'bg-gray-200'"
                  :style="{ height: `${maxMonthlyAmount > 0 ? (m.amount / maxMonthlyAmount) * 100 : 0}%`, minHeight: m.amount > 0 ? '8px' : '4px' }"
                ></div>
              </div>
              <span class="text-xs text-gray-500 mt-2">{{ m.month }}</span>
            </div>
          </div>
          <div class="mt-6 pt-4 border-t border-gray-100 text-center">
            <span class="text-lg font-bold text-lime-600">{{ $t('ecoPayments.yearTotal') }}: {{ formatNumber(yearTotal) }} {{ $t('ecoPayments.som') }}</span>
          </div>
        </div>

        <!-- Pie Chart: Paid vs Debt with total inside -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="font-semibold text-gray-900 mb-4">{{ $t('ecoPayments.paidVsDebtRatio') }}</h3>
          <div class="flex items-center justify-center h-48">
            <div class="relative w-44 h-44">
              <svg viewBox="0 0 36 36" class="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#fecaca" stroke-width="3"/>
                <circle
                  cx="18" cy="18" r="15.9" fill="none"
                  stroke="#22c55e"
                  stroke-width="3"
                  :stroke-dasharray="`${paidPercent} ${100 - paidPercent}`"
                  stroke-dashoffset="0"
                />
              </svg>
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="text-center">
                  <div class="text-2xl font-bold text-gray-900">{{ formatCompactNumber(totalAmount) }}</div>
                  <div class="text-xs text-gray-500">{{ $t('ecoPayments.somTotal') }}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="mt-4 space-y-2">
            <div class="flex items-center justify-between p-2 bg-green-50 rounded-lg">
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-green-500"></span>
                <span class="text-sm text-gray-700">{{ $t('ecoPayments.paid') }} ({{ paidPercent }}%)</span>
              </div>
              <span class="font-bold text-green-600">{{ formatNumber(summaryStats.totalPayments) }} {{ $t('ecoPayments.som') }}</span>
            </div>
            <div class="flex items-center justify-between p-2 bg-red-50 rounded-lg">
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-red-300"></span>
                <span class="text-sm text-gray-700">{{ $t('ecoPayments.debtLabel') }} ({{ 100 - paidPercent }}%)</span>
              </div>
              <span class="font-bold text-red-600">{{ formatNumber(summaryStats.totalDebt) }} {{ $t('ecoPayments.som') }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Payments Block -->
      <div
        ref="paymentsTableRef"
        :class="[
          'bg-white rounded-xl shadow-sm border overflow-hidden transition-all duration-500',
          highlightPayments ? 'border-green-500 ring-4 ring-green-200' : 'border-gray-200'
        ]"
      >
        <div class="p-4 border-b border-gray-200 bg-green-50">
          <div class="flex items-center justify-between flex-wrap gap-3">
            <h3 class="font-semibold text-gray-900 flex items-center gap-2">
              <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ $t('ecoPayments.receivedPayments') }}
              <span v-if="showUniqueCompanies" class="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full ml-2">
                {{ $t('ecoPayments.uniqueCompanies') }}
                <button @click="showUniqueCompanies = false" class="ml-1 hover:text-blue-900">×</button>
              </span>
            </h3>
            <div class="flex gap-2">
              <button
                @click="exportPaymentsReport('excel')"
                class="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-1"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {{ $t('common.excel') }}
              </button>
              <button
                @click="exportPaymentsReport('pdf')"
                class="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-1"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                {{ $t('common.pdf') }}
              </button>
            </div>
          </div>
        </div>

        <!-- Filters with Search -->
        <div class="p-4 border-b border-gray-200 bg-gray-50">
          <div class="flex flex-wrap gap-4">
            <div class="flex-1 min-w-[200px]">
              <label class="block text-xs text-gray-500 mb-1">{{ $t('ecoPayments.searchByCompany') }}</label>
              <input
                v-model="paymentsFilters.search"
                type="text"
                :placeholder="$t('ecoPayments.enterCompanyName')"
                class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
              />
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">{{ $t('ecoPayments.periodFrom') }}</label>
              <input v-model="paymentsFilters.dateFrom" type="date" class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-lime-500" />
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">{{ $t('ecoPayments.periodTo') }}</label>
              <input v-model="paymentsFilters.dateTo" type="date" class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-lime-500" />
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">{{ $t('ecoPayments.productGroupLabel') }}</label>
              <select v-model="paymentsFilters.groupNumber" class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-lime-500">
                <option v-for="g in productGroups" :key="g.number" :value="g.number">
                  {{ g.number === 0 ? g.name : `№${g.number}: ${g.name}` }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{{ $t('ecoPayments.company') }}</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{{ $t('ecoPayments.inn') }}</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{{ $t('ecoPayments.productGroup') }}</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{{ $t('ecoPayments.period') }}</th>
                <th class="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">{{ $t('ecoPayments.amount') }}</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{{ $t('ecoPayments.paymentDate') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="p in filteredPayments" :key="p.id" class="hover:bg-gray-50">
                <td class="px-4 py-3 font-medium text-gray-900">{{ p.company }}</td>
                <td class="px-4 py-3 text-gray-600 font-mono text-sm">{{ p.inn }}</td>
                <td class="px-4 py-3 text-gray-600 text-sm">№{{ p.groupNumber }}: {{ p.groupName }}</td>
                <td class="px-4 py-3 text-gray-600">{{ p.period }}</td>
                <td class="px-4 py-3 text-right font-bold text-green-600">{{ formatNumber(p.amount) }} {{ $t('ecoPayments.som') }}</td>
                <td class="px-4 py-3 text-center text-gray-600">{{ formatDate(p.paymentDate) }}</td>
              </tr>
              <tr v-if="filteredPayments.length === 0">
                <td colspan="6" class="px-4 py-8 text-center text-gray-500">
                  {{ $t('ecoPayments.noPaymentsFound') }}
                </td>
              </tr>
            </tbody>
            <tfoot class="bg-green-100 border-t-2 border-green-300">
              <tr>
                <td colspan="4" class="px-4 py-3 font-bold text-gray-900 text-base">{{ $t('ecoPayments.total') }} ({{ paymentsTotals.count }} {{ $t('ecoPayments.paymentsCount') }}):</td>
                <td class="px-4 py-3 text-right font-bold text-green-700 text-lg">{{ formatNumber(paymentsTotals.amount) }} {{ $t('ecoPayments.som') }}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- Debts Block -->
      <div
        ref="debtsTableRef"
        :class="[
          'bg-white rounded-xl shadow-sm border overflow-hidden transition-all duration-500',
          highlightDebts ? 'border-red-500 ring-4 ring-red-200' : 'border-gray-200'
        ]"
      >
        <div class="p-4 border-b border-gray-200 bg-red-50">
          <div class="flex items-center justify-between flex-wrap gap-3">
            <h3 class="font-semibold text-gray-900 flex items-center gap-2">
              <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {{ $t('ecoPayments.debtsTitle') }}
            </h3>
            <div class="flex gap-2">
              <button
                @click="exportDebtsReport('excel')"
                class="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-1"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {{ $t('common.excel') }}
              </button>
              <button
                @click="exportDebtsReport('pdf')"
                class="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-1"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                {{ $t('common.pdf') }}
              </button>
            </div>
          </div>
        </div>

        <!-- Filters with Search -->
        <div class="p-4 border-b border-gray-200 bg-gray-50">
          <div class="flex flex-wrap gap-4">
            <div class="flex-1 min-w-[200px]">
              <label class="block text-xs text-gray-500 mb-1">{{ $t('ecoPayments.searchByCompany') }}</label>
              <input
                v-model="debtsFilters.search"
                type="text"
                :placeholder="$t('ecoPayments.enterCompanyName')"
                class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
              />
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">{{ $t('ecoPayments.periodFrom') }}</label>
              <input v-model="debtsFilters.dateFrom" type="date" class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-lime-500" />
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">{{ $t('ecoPayments.periodTo') }}</label>
              <input v-model="debtsFilters.dateTo" type="date" class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-lime-500" />
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">{{ $t('ecoPayments.minDebtAmount') }}</label>
              <input v-model.number="debtsFilters.minDebt" type="number" placeholder="0" class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-lime-500 w-40" />
            </div>
          </div>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{{ $t('ecoPayments.company') }}</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{{ $t('ecoPayments.inn') }}</th>
                <th class="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">{{ $t('ecoPayments.expectedAmount') }}</th>
                <th class="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">{{ $t('ecoPayments.paidCol') }}</th>
                <th class="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">{{ $t('ecoPayments.debtLabel') }}</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{{ $t('ecoPayments.overdue') }}</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{{ $t('ecoPayments.status') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="d in filteredDebtors" :key="d.id" class="hover:bg-gray-50">
                <td class="px-4 py-3 font-medium text-gray-900">{{ d.company }}</td>
                <td class="px-4 py-3 text-gray-600 font-mono text-sm">{{ d.inn }}</td>
                <td class="px-4 py-3 text-right text-gray-600">{{ formatNumber(d.expectedAmount) }}</td>
                <td class="px-4 py-3 text-right text-green-600">{{ formatNumber(d.paidAmount) }}</td>
                <td class="px-4 py-3 text-right font-bold text-red-600">{{ formatNumber(d.debt) }}</td>
                <td class="px-4 py-3 text-center">
                  <span :class="['font-bold', d.daysOverdue > 30 ? 'text-red-600' : d.daysOverdue > 14 ? 'text-amber-600' : 'text-gray-600']">
                    {{ d.daysOverdue }} {{ $t('ecoPayments.days') }}
                  </span>
                </td>
                <td class="px-4 py-3 text-center">
                  <span :class="['text-xs px-2 py-1 rounded-full font-medium', getDebtorStatusClass(d.status)]">
                    {{ getDebtorStatusText(d.status) }}
                  </span>
                </td>
              </tr>
              <tr v-if="filteredDebtors.length === 0">
                <td colspan="7" class="px-4 py-8 text-center text-gray-500">
                  {{ $t('ecoPayments.noDebtorsFound') }}
                </td>
              </tr>
            </tbody>
            <tfoot class="bg-red-100 border-t-2 border-red-300">
              <tr>
                <td colspan="2" class="px-4 py-3 font-bold text-gray-900 text-base">{{ $t('ecoPayments.total') }} ({{ debtorsTotals.count }} {{ $t('ecoPayments.debtorsCount') }}):</td>
                <td class="px-4 py-3 text-right font-bold text-gray-700">{{ formatNumber(debtorsTotals.expected) }}</td>
                <td class="px-4 py-3 text-right font-bold text-green-600">{{ formatNumber(debtorsTotals.paid) }}</td>
                <td class="px-4 py-3 text-right font-bold text-red-700 text-lg">{{ formatNumber(debtorsTotals.debt) }} {{ $t('ecoPayments.som') }}</td>
                <td colspan="2"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>
