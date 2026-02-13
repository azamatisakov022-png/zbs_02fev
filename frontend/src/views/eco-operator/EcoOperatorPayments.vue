<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import { icons } from '../../utils/menuIcons'
import { calculationStore } from '../../stores/calculations'
import { refundStore } from '../../stores/refunds'
import { reportStore } from '../../stores/reports'

const menuItems = computed(() => [
  { id: 'dashboard', label: 'Главная', icon: icons.dashboard, route: '/eco-operator' },
  { id: 'incoming-calculations', label: 'Входящие расчёты', icon: icons.calculator, route: '/eco-operator/calculations', badge: calculationStore.getCalcReviewCount() },
  { id: 'incoming-declarations', label: 'Входящие декларации', icon: icons.document, route: '/eco-operator/incoming-declarations' },
  { id: 'incoming-reports', label: 'Входящие отчёты', icon: icons.report, route: '/eco-operator/incoming-reports', badge: reportStore.getPendingCount() },
  { id: 'refunds', label: 'Заявки на возврат', icon: icons.refund, route: '/eco-operator/refunds', badge: refundStore.getPendingRefundsCount() },
  { id: 'licenses', label: 'Лицензии и документы', icon: icons.license, route: '/eco-operator/licenses' },
  { id: 'waste-types', label: 'Виды отходов', icon: icons.recycle, route: '/eco-operator/waste-types' },
  { id: 'my-reports', label: 'Мои отчёты', icon: icons.registries, route: '/eco-operator/my-reports' },
  { id: 'payments', label: 'Аналитика платежей', icon: icons.money, route: '/eco-operator/payments' },
  { id: 'analytics', label: 'Аналитика', icon: icons.analytics, route: '/eco-operator/analytics' },
  { id: 'profile', label: 'Профили компаний', icon: icons.profile, route: '/eco-operator/profile' },
])

// Полный список 24 групп товаров
const productGroups = [
  { number: 0, name: 'Все группы' },
  { number: 1, name: 'Изделия из гофрированной бумаги/картона', type: 'goods' },
  { number: 2, name: 'Изделия из негофрированной бумаги/картона', type: 'goods' },
  { number: 3, name: 'Масла', type: 'goods' },
  { number: 4, name: 'Шины, покрышки и камеры резиновые', type: 'goods' },
  { number: 5, name: 'Изделия из резины (за исключением шин)', type: 'goods' },
  { number: 6, name: 'Изделия пластмассовые упаковочные', type: 'goods' },
  { number: 7, name: 'Изделия пластмассовые прочие', type: 'goods' },
  { number: 8, name: 'Стекло полое', type: 'goods' },
  { number: 9, name: 'Компьютеры и периферийное оборудование', type: 'goods' },
  { number: 10, name: 'Мониторы, приемники телевизионные', type: 'goods' },
  { number: 11, name: 'Элементы первичные и батареи', type: 'goods' },
  { number: 12, name: 'Аккумуляторы свинцовые', type: 'goods' },
  { number: 13, name: 'Батареи аккумуляторные', type: 'goods' },
  { number: 14, name: 'Оборудование электрическое осветительное', type: 'goods' },
  { number: 15, name: 'Техника бытовая крупная', type: 'goods' },
  { number: 16, name: 'Техника бытовая мелкая, инструмент', type: 'goods' },
  { number: 17, name: 'Оборудование холодильное и вентиляционное', type: 'goods' },
  { number: 18, name: 'Фильтры для ДВС', type: 'goods' },
  { number: 19, name: 'Упаковка полимерная (без галогенов)', type: 'packaging' },
  { number: 20, name: 'Упаковка полимерная (с галогенами)', type: 'packaging' },
  { number: 21, name: 'Упаковка комбинированная', type: 'packaging' },
  { number: 22, name: 'Упаковка из гофрокартона', type: 'packaging' },
  { number: 23, name: 'Упаковка из бумаги/картона', type: 'packaging' },
  { number: 24, name: 'Упаковка стеклянная', type: 'packaging' },
]

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
const formatNumber = (num: number) => num.toLocaleString('ru-RU')

const formatCompactNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'М'
  if (num >= 1000) return Math.round(num / 1000) + 'К'
  return num.toString()
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('ru-RU')
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
    case 'unpaid': return 'Не оплачено'
    case 'partial': return 'Частично'
    case 'overdue': return 'Просрочено'
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
    csvContent += 'Отчёт по поступлениям утилизационного сбора\n'
    csvContent += `Период:,${paymentsFilters.value.dateFrom} — ${paymentsFilters.value.dateTo}\n\n`
    csvContent += 'Компания,ИНН,Группа товара,Период,Сумма,Дата оплаты\n'

    filteredPayments.value.forEach(p => {
      csvContent += `"${p.company}",${p.inn},"${p.groupName}","${p.period}",${p.amount},"${formatDate(p.paymentDate)}"\n`
    })

    csvContent += `\nИТОГО:,,,,${paymentsTotals.value.amount},\n`
    csvContent += `\nДата формирования:,${new Date().toLocaleDateString('ru-RU')}\n`

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
    csvContent += 'Отчёт по задолженностям\n'
    csvContent += `Период:,${debtsFilters.value.dateFrom} — ${debtsFilters.value.dateTo}\n\n`
    csvContent += 'Компания,ИНН,Ожидаемая сумма,Оплачено,Задолженность,Дней просрочки,Статус\n'

    filteredDebtors.value.forEach(d => {
      csvContent += `"${d.company}",${d.inn},${d.expectedAmount},${d.paidAmount},${d.debt},${d.daysOverdue},"${getDebtorStatusText(d.status)}"\n`
    })

    csvContent += `\nИТОГО:,,${debtorsTotals.value.expected},${debtorsTotals.value.paid},${debtorsTotals.value.debt},,\n`
    csvContent += `\nДата формирования:,${new Date().toLocaleDateString('ru-RU')}\n`

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
    csvContent += 'ПОЛНЫЙ ОТЧЁТ ПО АНАЛИТИКЕ ПЛАТЕЖЕЙ\n'
    csvContent += `Дата формирования:,${new Date().toLocaleDateString('ru-RU')}\n\n`

    // Summary
    csvContent += '=== СВОДКА ===\n'
    csvContent += `Общая сумма поступлений:,${summaryStats.value.totalPayments} сом\n`
    csvContent += `Общая задолженность:,${summaryStats.value.totalDebt} сом\n`
    csvContent += `Оплативших компаний:,${summaryStats.value.payersCount}\n`
    csvContent += `Должников:,${summaryStats.value.debtorsCount}\n\n`

    // Monthly data
    csvContent += '=== ПОСТУПЛЕНИЯ ПО МЕСЯЦАМ ===\n'
    csvContent += 'Месяц,Сумма\n'
    monthlyData.value.forEach(m => {
      csvContent += `${m.month},${m.amount}\n`
    })
    csvContent += `Всего за год:,${yearTotal.value}\n\n`

    // Payments
    csvContent += '=== ПОСТУПИВШИЕ ПЛАТЕЖИ ===\n'
    csvContent += 'Компания,ИНН,Группа товара,Период,Сумма,Дата оплаты\n'
    paymentsData.value.forEach(p => {
      csvContent += `"${p.company}",${p.inn},"${p.groupName}","${p.period}",${p.amount},"${formatDate(p.paymentDate)}"\n`
    })
    csvContent += `ИТОГО:,,,,${summaryStats.value.totalPayments},\n\n`

    // Debts
    csvContent += '=== ЗАДОЛЖЕННОСТИ ===\n'
    csvContent += 'Компания,ИНН,Ожидаемая сумма,Оплачено,Задолженность,Дней просрочки,Статус\n'
    debtorsData.value.forEach(d => {
      csvContent += `"${d.company}",${d.inn},${d.expectedAmount},${d.paidAmount},${d.debt},${d.daysOverdue},"${getDebtorStatusText(d.status)}"\n`
    })
    csvContent += `ИТОГО:,,${debtorsTotals.value.expected},${debtorsTotals.value.paid},${summaryStats.value.totalDebt},,\n`

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
      <title>Отчёт по аналитике платежей</title>
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
      <h1>Аналитика платежей — Эко Оператор</h1>
      <div class="date">Дата формирования: ${new Date().toLocaleDateString('ru-RU')}</div>
  `

  if (type === 'full' || type === 'payments') {
    content += `
      <div class="summary">
        <div class="summary-card">
          <div class="label">Общая сумма поступлений</div>
          <div class="value green">${formatNumber(summaryStats.value.totalPayments)} сом</div>
        </div>
        <div class="summary-card">
          <div class="label">Общая задолженность</div>
          <div class="value red">${formatNumber(summaryStats.value.totalDebt)} сом</div>
        </div>
        <div class="summary-card">
          <div class="label">Оплативших компаний</div>
          <div class="value blue">${summaryStats.value.payersCount}</div>
        </div>
        <div class="summary-card">
          <div class="label">Должников</div>
          <div class="value">${summaryStats.value.debtorsCount}</div>
        </div>
      </div>
    `
  }

  if (type === 'full') {
    content += `
      <div class="chart-section">
        <h2 style="margin-top: 0; border: none;">Поступления по месяцам (2025)</h2>
        <table>
          <tr>
            ${monthlyData.value.map(m => `<th style="text-align: center">${m.month}</th>`).join('')}
          </tr>
          <tr>
            ${monthlyData.value.map(m => `<td style="text-align: center">${m.amount > 0 ? formatCompactNumber(m.amount) : '—'}</td>`).join('')}
          </tr>
        </table>
        <div style="text-align: right; font-weight: bold; margin-top: 10px;">Всего за год: ${formatNumber(yearTotal.value)} сом</div>
      </div>
    `
  }

  if (type === 'full' || type === 'payments') {
    const payments = type === 'full' ? paymentsData.value : filteredPayments.value
    const total = type === 'full' ? summaryStats.value.totalPayments : paymentsTotals.value.amount

    content += `
      <h2>Поступившие платежи</h2>
      <table>
        <thead>
          <tr>
            <th>Компания</th>
            <th>ИНН</th>
            <th>Группа товара</th>
            <th>Период</th>
            <th class="amount">Сумма</th>
            <th>Дата оплаты</th>
          </tr>
        </thead>
        <tbody>
          ${payments.map(p => `
            <tr>
              <td>${p.company}</td>
              <td>${p.inn}</td>
              <td>№${p.groupNumber}: ${p.groupName}</td>
              <td>${p.period}</td>
              <td class="amount">${formatNumber(p.amount)} сом</td>
              <td>${formatDate(p.paymentDate)}</td>
            </tr>
          `).join('')}
          <tr class="total-row">
            <td colspan="4"><strong>ИТОГО (${payments.length} платежей)</strong></td>
            <td class="amount"><strong>${formatNumber(total)} сом</strong></td>
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
      <h2>Задолженности</h2>
      <table>
        <thead>
          <tr>
            <th>Компания</th>
            <th>ИНН</th>
            <th class="amount">Ожидаемая сумма</th>
            <th class="amount">Оплачено</th>
            <th class="amount">Задолженность</th>
            <th>Просрочка</th>
            <th>Статус</th>
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
              <td>${d.daysOverdue} дн.</td>
              <td>${getDebtorStatusText(d.status)}</td>
            </tr>
          `).join('')}
          <tr class="total-row debts">
            <td colspan="2"><strong>ИТОГО (${totals.count} должников)</strong></td>
            <td class="amount"><strong>${formatNumber(totals.expected)}</strong></td>
            <td class="amount"><strong>${formatNumber(totals.paid)}</strong></td>
            <td class="amount" style="color: #dc2626;"><strong>${formatNumber(totals.debt)} сом</strong></td>
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
    roleTitle="ГП «Эко Оператор»"
    userName="ОсОО «ЭкоПереработка»"
    :menuItems="menuItems"
  >
    <div class="space-y-6">
      <!-- Header with Export Buttons -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Аналитика платежей</h1>
          <p class="text-gray-600 mt-1">Поступления утилизационного сбора и задолженности</p>
        </div>
        <div class="flex gap-2">
          <button
            @click="exportFullAnalytics('excel')"
            class="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Скачать отчёт Excel
          </button>
          <button
            @click="exportFullAnalytics('pdf')"
            class="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Скачать отчёт PDF
          </button>
        </div>
      </div>

      <!-- Summary Cards - Interactive -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
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
              <p class="text-sm text-gray-500">Общая сумма поступлений</p>
              <p class="text-xl font-bold text-green-600">{{ formatNumber(summaryStats.totalPayments) }} сом</p>
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
              <p class="text-sm text-gray-500">Общая задолженность</p>
              <p class="text-xl font-bold text-red-600">{{ formatNumber(summaryStats.totalDebt) }} сом</p>
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
              <p class="text-sm text-gray-500">Оплативших компаний</p>
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
              <p class="text-sm text-gray-500">Должников</p>
              <p class="text-xl font-bold text-amber-600">{{ summaryStats.debtorsCount }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Bar Chart: Monthly Payments with amounts -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="font-semibold text-gray-900 mb-4">Поступления по месяцам (2025)</h3>
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
            <span class="text-lg font-bold text-lime-600">Всего за год: {{ formatNumber(yearTotal) }} сом</span>
          </div>
        </div>

        <!-- Pie Chart: Paid vs Debt with total inside -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="font-semibold text-gray-900 mb-4">Соотношение оплачено / задолженность</h3>
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
                  <div class="text-xs text-gray-500">сом всего</div>
                </div>
              </div>
            </div>
          </div>
          <div class="mt-4 space-y-2">
            <div class="flex items-center justify-between p-2 bg-green-50 rounded-lg">
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-green-500"></span>
                <span class="text-sm text-gray-700">Оплачено ({{ paidPercent }}%)</span>
              </div>
              <span class="font-bold text-green-600">{{ formatNumber(summaryStats.totalPayments) }} сом</span>
            </div>
            <div class="flex items-center justify-between p-2 bg-red-50 rounded-lg">
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-red-300"></span>
                <span class="text-sm text-gray-700">Задолженность ({{ 100 - paidPercent }}%)</span>
              </div>
              <span class="font-bold text-red-600">{{ formatNumber(summaryStats.totalDebt) }} сом</span>
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
              Поступившие платежи
              <span v-if="showUniqueCompanies" class="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full ml-2">
                Уникальные компании
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
                Excel
              </button>
              <button
                @click="exportPaymentsReport('pdf')"
                class="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-1"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                PDF
              </button>
            </div>
          </div>
        </div>

        <!-- Filters with Search -->
        <div class="p-4 border-b border-gray-200 bg-gray-50">
          <div class="flex flex-wrap gap-4">
            <div class="flex-1 min-w-[200px]">
              <label class="block text-xs text-gray-500 mb-1">Поиск по компании</label>
              <input
                v-model="paymentsFilters.search"
                type="text"
                placeholder="Введите название компании..."
                class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
              />
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">Период с</label>
              <input v-model="paymentsFilters.dateFrom" type="date" class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-lime-500" />
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">Период по</label>
              <input v-model="paymentsFilters.dateTo" type="date" class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-lime-500" />
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">Группа товаров</label>
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
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Компания</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ИНН</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Группа товара</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Период</th>
                <th class="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Сумма</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Дата оплаты</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="p in filteredPayments" :key="p.id" class="hover:bg-gray-50">
                <td class="px-4 py-3 font-medium text-gray-900">{{ p.company }}</td>
                <td class="px-4 py-3 text-gray-600 font-mono text-sm">{{ p.inn }}</td>
                <td class="px-4 py-3 text-gray-600 text-sm">№{{ p.groupNumber }}: {{ p.groupName }}</td>
                <td class="px-4 py-3 text-gray-600">{{ p.period }}</td>
                <td class="px-4 py-3 text-right font-bold text-green-600">{{ formatNumber(p.amount) }} сом</td>
                <td class="px-4 py-3 text-center text-gray-600">{{ formatDate(p.paymentDate) }}</td>
              </tr>
              <tr v-if="filteredPayments.length === 0">
                <td colspan="6" class="px-4 py-8 text-center text-gray-500">
                  Платежи не найдены
                </td>
              </tr>
            </tbody>
            <tfoot class="bg-green-100 border-t-2 border-green-300">
              <tr>
                <td colspan="4" class="px-4 py-3 font-bold text-gray-900 text-base">ИТОГО ({{ paymentsTotals.count }} платежей):</td>
                <td class="px-4 py-3 text-right font-bold text-green-700 text-lg">{{ formatNumber(paymentsTotals.amount) }} сом</td>
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
              Задолженности
            </h3>
            <div class="flex gap-2">
              <button
                @click="exportDebtsReport('excel')"
                class="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-1"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Excel
              </button>
              <button
                @click="exportDebtsReport('pdf')"
                class="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-1"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                PDF
              </button>
            </div>
          </div>
        </div>

        <!-- Filters with Search -->
        <div class="p-4 border-b border-gray-200 bg-gray-50">
          <div class="flex flex-wrap gap-4">
            <div class="flex-1 min-w-[200px]">
              <label class="block text-xs text-gray-500 mb-1">Поиск по компании</label>
              <input
                v-model="debtsFilters.search"
                type="text"
                placeholder="Введите название компании..."
                class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
              />
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">Период с</label>
              <input v-model="debtsFilters.dateFrom" type="date" class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-lime-500" />
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">Период по</label>
              <input v-model="debtsFilters.dateTo" type="date" class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-lime-500" />
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">Мин. сумма задолженности</label>
              <input v-model.number="debtsFilters.minDebt" type="number" placeholder="0" class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-lime-500 w-40" />
            </div>
          </div>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Компания</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ИНН</th>
                <th class="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Ожидаемая сумма</th>
                <th class="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Оплачено</th>
                <th class="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Задолженность</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Просрочка</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Статус</th>
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
                    {{ d.daysOverdue }} дн.
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
                  Должники не найдены
                </td>
              </tr>
            </tbody>
            <tfoot class="bg-red-100 border-t-2 border-red-300">
              <tr>
                <td colspan="2" class="px-4 py-3 font-bold text-gray-900 text-base">ИТОГО ({{ debtorsTotals.count }} должников):</td>
                <td class="px-4 py-3 text-right font-bold text-gray-700">{{ formatNumber(debtorsTotals.expected) }}</td>
                <td class="px-4 py-3 text-right font-bold text-green-600">{{ formatNumber(debtorsTotals.paid) }}</td>
                <td class="px-4 py-3 text-right font-bold text-red-700 text-lg">{{ formatNumber(debtorsTotals.debt) }} сом</td>
                <td colspan="2"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>
