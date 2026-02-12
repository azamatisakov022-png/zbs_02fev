<script setup lang="ts">
import { ref, computed } from 'vue'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import { icons } from '../../utils/menuIcons'

const menuItems = [
  { id: 'dashboard', label: 'Главная', icon: icons.dashboard, route: '/employee' },
  { id: 'applications', label: 'Входящие заявки', icon: icons.inbox, route: '/employee/applications' },
  { id: 'organizations', label: 'Организации', icon: icons.building, route: '/employee/organizations' },
  { id: 'licenses', label: 'Лицензии', icon: icons.license, route: '/employee/licenses' },
  { id: 'recyclers-registry', label: 'Реестр переработчиков', icon: icons.recycle, route: '/employee/recyclers-registry' },
  { id: 'reports', label: 'Отчётность', icon: icons.report, route: '/employee/reports' },
  { id: 'map', label: 'ГИС-карта', icon: icons.map, route: '/employee/map' },
  { id: 'analytics', label: 'Аналитика', icon: icons.analytics, route: '/employee/analytics' },
  { id: 'profile', label: 'Мой профиль', icon: icons.profile, route: '/employee/profile' },
]

// Полный список 24 групп товаров (из калькулятора РОП)
const productGroups = [
  // Товары (группы 1-18)
  { number: 1, name: 'Изделия из гофрированной бумаги/картона', rate: 4793, type: 'goods' },
  { number: 2, name: 'Изделия из негофрированной бумаги/картона', rate: 5595, type: 'goods' },
  { number: 3, name: 'Масла', rate: 8406, type: 'goods' },
  { number: 4, name: 'Шины, покрышки и камеры резиновые', rate: 12345, type: 'goods' },
  { number: 5, name: 'Изделия из резины (за исключением шин)', rate: 17919, type: 'goods' },
  { number: 6, name: 'Изделия пластмассовые упаковочные', rate: 9418, type: 'goods' },
  { number: 7, name: 'Изделия пластмассовые прочие', rate: 11008, type: 'goods' },
  { number: 8, name: 'Стекло полое', rate: 4219, type: 'goods' },
  { number: 9, name: 'Компьютеры и периферийное оборудование', rate: 36356, type: 'goods' },
  { number: 10, name: 'Мониторы, приемники телевизионные', rate: 36356, type: 'goods' },
  { number: 11, name: 'Элементы первичные и батареи первичных элементов', rate: 135390, type: 'goods' },
  { number: 12, name: 'Аккумуляторы свинцовые', rate: 7471, type: 'goods' },
  { number: 13, name: 'Батареи аккумуляторные', rate: 147165, type: 'goods' },
  { number: 14, name: 'Оборудование электрическое осветительное', rate: 10859, type: 'goods' },
  { number: 15, name: 'Техника бытовая крупная', rate: 36356, type: 'goods' },
  { number: 16, name: 'Техника бытовая мелкая, инструмент ручной', rate: 36356, type: 'goods' },
  { number: 17, name: 'Оборудование холодильное и вентиляционное', rate: 36356, type: 'goods' },
  { number: 18, name: 'Фильтры для двигателей внутреннего сгорания', rate: 11030, type: 'goods' },
  // Упаковка (группы 19-24)
  { number: 19, name: 'Упаковка из полимерных материалов (без галогенов)', rate: 9418, type: 'packaging' },
  { number: 20, name: 'Упаковка из полимерных материалов (с галогенами)', rate: 12197, type: 'packaging' },
  { number: 21, name: 'Упаковка из комбинированных материалов', rate: 44573, type: 'packaging' },
  { number: 22, name: 'Упаковка из гофрированного картона', rate: 4973, type: 'packaging' },
  { number: 23, name: 'Упаковка из бумаги и негофрированного картона', rate: 5595, type: 'packaging' },
  { number: 24, name: 'Упаковка стеклянная', rate: 4219, type: 'packaging' },
]

// Регионы Кыргызстана
const regions = [
  'Все регионы',
  'Бишкек',
  'Ош',
  'Чуйская область',
  'Ошская область',
  'Джалал-Абадская область',
  'Иссык-Кульская область',
  'Нарынская область',
  'Таласская область',
  'Баткенская область',
]

// Активный тип отчёта
const activeReport = ref<'receipts' | 'products' | 'debtors' | null>(null)

// Флаг формирования отчёта
const isGenerating = ref(false)
const reportGenerated = ref(false)

// ========== ОТЧЁТ 1: ПОСТУПЛЕНИЯ ==========
const receiptsFilters = ref({
  dateFrom: '2025-01-01',
  dateTo: '2025-02-03',
  groupNumber: 0,
  subgroup: 'Все подгруппы',
  region: 'Все регионы',
  company: '',
})

// Подгруппы для выбранной группы товаров (динамический список)
const availableSubgroups = computed(() => {
  const subgroups = ['Все подгруппы']
  if (receiptsFilters.value.groupNumber === 0) {
    // Собираем уникальные подгруппы из всех записей
    const uniqueSubgroups = new Set(receiptsData.value.map(r => r.subgroup))
    return [...subgroups, ...Array.from(uniqueSubgroups)]
  }
  // Подгруппы для конкретной группы
  const groupSubgroups = new Set(
    receiptsData.value
      .filter(r => r.groupNumber === receiptsFilters.value.groupNumber)
      .map(r => r.subgroup)
  )
  return [...subgroups, ...Array.from(groupSubgroups)]
})

interface ReceiptRecord {
  id: number
  company: string
  inn: string
  region: string
  groupNumber: number
  groupName: string
  subgroup: string
  mass: number
  rate: number
  amount: number
  paymentDate: string
  status: 'paid' | 'partial' | 'overdue'
}

const receiptsData = ref<ReceiptRecord[]>([
  { id: 1, company: 'ОсОО "БишкекПласт"', inn: '01234567891234', region: 'Бишкек', groupNumber: 6, groupName: 'Изделия пластмассовые упаковочные', subgroup: 'ПЭТ бутылки', mass: 12.5, rate: 9418, amount: 117725, paymentDate: '2025-01-15', status: 'paid' },
  { id: 2, company: 'ОсОО "ЭкоРесайкл"', inn: '02345678912345', region: 'Бишкек', groupNumber: 1, groupName: 'Изделия из гофрированной бумаги/картона', subgroup: 'Коробки гофрированные', mass: 25.0, rate: 4793, amount: 119825, paymentDate: '2025-01-20', status: 'paid' },
  { id: 3, company: 'ОАО "ОшМеталл"', inn: '03456789123456', region: 'Ош', groupNumber: 12, groupName: 'Аккумуляторы свинцовые', subgroup: 'Автомобильные АКБ', mass: 8.3, rate: 7471, amount: 62009, paymentDate: '2025-01-25', status: 'paid' },
  { id: 4, company: 'ИП "Асанов"', inn: '12345678901234', region: 'Чуйская область', groupNumber: 8, groupName: 'Стекло полое', subgroup: 'Бутылки стеклянные', mass: 15.0, rate: 4219, amount: 63285, paymentDate: '2025-01-28', status: 'paid' },
  { id: 5, company: 'ОсОО "GreenPack"', inn: '04567891234567', region: 'Бишкек', groupNumber: 19, groupName: 'Упаковка из полимерных материалов (без галогенов)', subgroup: 'Плёнка ПП', mass: 5.2, rate: 9418, amount: 48974, paymentDate: '2025-01-30', status: 'paid' },
  { id: 6, company: 'ОсОО "АвтоШина"', inn: '09123456789012', region: 'Чуйская область', groupNumber: 4, groupName: 'Шины, покрышки и камеры резиновые', subgroup: 'Шины легковые', mass: 45.0, rate: 12345, amount: 555525, paymentDate: '2025-02-01', status: 'paid' },
  { id: 7, company: 'ОсОО "ТаласПак"', inn: '08912345678901', region: 'Таласская область', groupNumber: 22, groupName: 'Упаковка из гофрированного картона', subgroup: 'Коробки упаковочные', mass: 18.5, rate: 4973, amount: 92001, paymentDate: '2025-02-01', status: 'partial' },
  { id: 8, company: 'ОсОО "ЭлектроРесурс"', inn: '10234567890123', region: 'Бишкек', groupNumber: 9, groupName: 'Компьютеры и периферийное оборудование', subgroup: 'Системные блоки', mass: 3.2, rate: 36356, amount: 116339, paymentDate: '', status: 'overdue' },
  { id: 9, company: 'ОсОО "ИссыкКульЭко"', inn: '06789123456789', region: 'Иссык-Кульская область', groupNumber: 2, groupName: 'Изделия из негофрированной бумаги/картона', subgroup: 'Упаковка картонная', mass: 22.0, rate: 5595, amount: 123090, paymentDate: '2025-01-18', status: 'paid' },
  { id: 10, company: 'ОАО "НарынМеталл"', inn: '07891234567890', region: 'Нарынская область', groupNumber: 13, groupName: 'Батареи аккумуляторные', subgroup: 'Li-ion батареи', mass: 1.5, rate: 147165, amount: 220748, paymentDate: '', status: 'overdue' },
  { id: 11, company: 'ОсОО "ОшПластик"', inn: '11345678901234', region: 'Ошская область', groupNumber: 7, groupName: 'Изделия пластмассовые прочие', subgroup: 'Тара пластиковая', mass: 9.8, rate: 11008, amount: 107878, paymentDate: '2025-02-02', status: 'paid' },
  { id: 12, company: 'ОсОО "ЧуйСтрой"', inn: '05678912345678', region: 'Чуйская область', groupNumber: 5, groupName: 'Изделия из резины (за исключением шин)', subgroup: 'Резиновые изделия', mass: 6.5, rate: 17919, amount: 116474, paymentDate: '2025-01-22', status: 'partial' },
  { id: 13, company: 'ОсОО "ДжАПласт"', inn: '13456789012345', region: 'Джалал-Абадская область', groupNumber: 20, groupName: 'Упаковка из полимерных материалов (с галогенами)', subgroup: 'ПВХ плёнка', mass: 7.8, rate: 12197, amount: 95137, paymentDate: '2025-01-29', status: 'paid' },
  { id: 14, company: 'ИП "Мамытова"', inn: '14567890123456', region: 'Баткенская область', groupNumber: 3, groupName: 'Масла', subgroup: 'Моторные масла', mass: 4.5, rate: 8406, amount: 37827, paymentDate: '2025-02-02', status: 'paid' },
  { id: 15, company: 'ОсОО "ТехноМир"', inn: '15678901234567', region: 'Бишкек', groupNumber: 10, groupName: 'Мониторы, приемники телевизионные', subgroup: 'Мониторы LCD', mass: 2.8, rate: 36356, amount: 101797, paymentDate: '2025-01-27', status: 'paid' },
])

const filteredReceipts = computed(() => {
  return receiptsData.value.filter(r => {
    if (receiptsFilters.value.groupNumber > 0 && r.groupNumber !== receiptsFilters.value.groupNumber) return false
    if (receiptsFilters.value.subgroup !== 'Все подгруппы' && r.subgroup !== receiptsFilters.value.subgroup) return false
    if (receiptsFilters.value.region !== 'Все регионы' && r.region !== receiptsFilters.value.region) return false
    if (receiptsFilters.value.company) {
      const q = receiptsFilters.value.company.toLowerCase()
      if (!r.company.toLowerCase().includes(q) && !r.inn.includes(q)) return false
    }
    return true
  })
})

const receiptsTotals = computed(() => ({
  count: filteredReceipts.value.length,
  mass: filteredReceipts.value.reduce((s, r) => s + r.mass, 0),
  amount: filteredReceipts.value.reduce((s, r) => s + r.amount, 0),
  paid: filteredReceipts.value.filter(r => r.status === 'paid').reduce((s, r) => s + r.amount, 0),
}))

// ========== ОТЧЁТ 2: ПО ВИДАМ ТОВАРОВ ==========
const productsFilters = ref({
  dateFrom: '2025-01-01',
  dateTo: '2025-02-03',
  groupNumber: 0,
  region: 'Все регионы',
})

// Данные аналитики по всем 24 группам товаров
const fullProductsData = ref<ProductAnalytics[]>([
  // Товары (группы 1-18)
  { groupNumber: 1, groupName: 'Изделия из гофрированной бумаги/картона', type: 'goods', payers: 15, mass: 125.5, amount: 601697, percent: 5.3 },
  { groupNumber: 2, groupName: 'Изделия из негофрированной бумаги/картона', type: 'goods', payers: 12, mass: 98.0, amount: 548310, percent: 4.8 },
  { groupNumber: 3, groupName: 'Масла', type: 'goods', payers: 8, mass: 45.0, amount: 378270, percent: 3.3 },
  { groupNumber: 4, groupName: 'Шины, покрышки и камеры резиновые', type: 'goods', payers: 22, mass: 180.0, amount: 2222100, percent: 19.6 },
  { groupNumber: 5, groupName: 'Изделия из резины (за исключением шин)', type: 'goods', payers: 6, mass: 28.5, amount: 510692, percent: 4.5 },
  { groupNumber: 6, groupName: 'Изделия пластмассовые упаковочные', type: 'goods', payers: 18, mass: 75.0, amount: 706350, percent: 6.2 },
  { groupNumber: 7, groupName: 'Изделия пластмассовые прочие', type: 'goods', payers: 14, mass: 52.0, amount: 572416, percent: 5.0 },
  { groupNumber: 8, groupName: 'Стекло полое', type: 'goods', payers: 9, mass: 85.0, amount: 358615, percent: 3.2 },
  { groupNumber: 9, groupName: 'Компьютеры и периферийное оборудование', type: 'goods', payers: 5, mass: 8.5, amount: 309026, percent: 2.7 },
  { groupNumber: 10, groupName: 'Мониторы, приемники телевизионные', type: 'goods', payers: 4, mass: 6.2, amount: 225407, percent: 2.0 },
  { groupNumber: 11, groupName: 'Элементы первичные и батареи первичных элементов', type: 'goods', payers: 3, mass: 2.1, amount: 284319, percent: 2.5 },
  { groupNumber: 12, groupName: 'Аккумуляторы свинцовые', type: 'goods', payers: 7, mass: 35.0, amount: 261485, percent: 2.3 },
  { groupNumber: 13, groupName: 'Батареи аккумуляторные', type: 'goods', payers: 4, mass: 3.8, amount: 559227, percent: 4.9 },
  { groupNumber: 14, groupName: 'Оборудование электрическое осветительное', type: 'goods', payers: 6, mass: 12.5, amount: 135738, percent: 1.2 },
  { groupNumber: 15, groupName: 'Техника бытовая крупная', type: 'goods', payers: 8, mass: 25.0, amount: 908900, percent: 8.0 },
  { groupNumber: 16, groupName: 'Техника бытовая мелкая, инструмент ручной', type: 'goods', payers: 5, mass: 8.0, amount: 290848, percent: 2.6 },
  { groupNumber: 17, groupName: 'Оборудование холодильное и вентиляционное', type: 'goods', payers: 6, mass: 18.0, amount: 654408, percent: 5.8 },
  { groupNumber: 18, groupName: 'Фильтры для двигателей внутреннего сгорания', type: 'goods', payers: 9, mass: 15.0, amount: 165450, percent: 1.5 },
  // Упаковка (группы 19-24)
  { groupNumber: 19, groupName: 'Упаковка из полимерных материалов (без галогенов)', type: 'packaging', payers: 11, mass: 42.0, amount: 395556, percent: 3.5 },
  { groupNumber: 20, groupName: 'Упаковка из полимерных материалов (с галогенами)', type: 'packaging', payers: 5, mass: 18.0, amount: 219546, percent: 1.9 },
  { groupNumber: 21, groupName: 'Упаковка из комбинированных материалов', type: 'packaging', payers: 3, mass: 5.5, amount: 245152, percent: 2.2 },
  { groupNumber: 22, groupName: 'Упаковка из гофрированного картона', type: 'packaging', payers: 8, mass: 65.0, amount: 323245, percent: 2.8 },
  { groupNumber: 23, groupName: 'Упаковка из бумаги и негофрированного картона', type: 'packaging', payers: 6, mass: 38.0, amount: 212610, percent: 1.9 },
  { groupNumber: 24, groupName: 'Упаковка стеклянная', type: 'packaging', payers: 4, mass: 38.0, amount: 160322, percent: 1.4 },
])

interface ProductAnalytics {
  groupNumber: number
  groupName: string
  type: string
  payers: number
  mass: number
  amount: number
  percent: number
}

// productsData теперь определён в fullProductsData выше

const filteredProducts = computed(() => {
  let result = fullProductsData.value
  if (productsFilters.value.groupNumber > 0) {
    result = result.filter(p => p.groupNumber === productsFilters.value.groupNumber)
  }
  // Фильтр по региону применяется к общей сумме (упрощённо - коэффициент для демо)
  if (productsFilters.value.region !== 'Все регионы') {
    const regionCoefficients: Record<string, number> = {
      'Бишкек': 0.45,
      'Ош': 0.15,
      'Чуйская область': 0.12,
      'Ошская область': 0.08,
      'Джалал-Абадская область': 0.07,
      'Иссык-Кульская область': 0.05,
      'Нарынская область': 0.03,
      'Таласская область': 0.03,
      'Баткенская область': 0.02,
    }
    const coef = regionCoefficients[productsFilters.value.region] || 1
    result = result.map(p => ({
      ...p,
      payers: Math.round(p.payers * coef),
      mass: Math.round(p.mass * coef * 10) / 10,
      amount: Math.round(p.amount * coef),
    }))
  }
  return result.sort((a, b) => b.amount - a.amount)
})

const productsTotals = computed(() => ({
  payers: filteredProducts.value.reduce((s, p) => s + p.payers, 0),
  mass: filteredProducts.value.reduce((s, p) => s + p.mass, 0),
  amount: filteredProducts.value.reduce((s, p) => s + p.amount, 0),
}))

// ========== ОТЧЁТ 3: ДОЛЖНИКИ ==========
const debtorsFilters = ref({
  dateFrom: '2025-01-01',
  dateTo: '2025-02-03',
  minDebt: 0,
  region: 'Все регионы',
  groupNumber: 0,
})

interface DebtorRecord {
  id: number
  company: string
  inn: string
  contact: string
  phone: string
  region: string
  groupNumber: number
  groupName: string
  expectedAmount: number
  paidAmount: number
  debt: number
  daysOverdue: number
  status: 'unpaid' | 'partial' | 'overdue'
}

const debtorsData = ref<DebtorRecord[]>([
  { id: 1, company: 'ОсОО "ЭлектроРесурс"', inn: '10234567890123', contact: 'Касымов Б.А.', phone: '+996 555 123 456', region: 'Бишкек', groupNumber: 9, groupName: 'Компьютеры и периферийное оборудование', expectedAmount: 116339, paidAmount: 0, debt: 116339, daysOverdue: 15, status: 'overdue' },
  { id: 2, company: 'ОАО "НарынМеталл"', inn: '07891234567890', contact: 'Жумабеков К.Т.', phone: '+996 700 234 567', region: 'Нарынская область', groupNumber: 13, groupName: 'Батареи аккумуляторные', expectedAmount: 220748, paidAmount: 0, debt: 220748, daysOverdue: 12, status: 'overdue' },
  { id: 3, company: 'ОсОО "ТаласПак"', inn: '08912345678901', contact: 'Алиева Г.С.', phone: '+996 772 345 678', region: 'Таласская область', groupNumber: 22, groupName: 'Упаковка из гофрированного картона', expectedAmount: 92001, paidAmount: 46000, debt: 46001, daysOverdue: 5, status: 'partial' },
  { id: 4, company: 'ОсОО "ЧуйСтрой"', inn: '05678912345678', contact: 'Токтогулов М.Р.', phone: '+996 550 456 789', region: 'Чуйская область', groupNumber: 5, groupName: 'Изделия из резины (за исключением шин)', expectedAmount: 116474, paidAmount: 58000, debt: 58474, daysOverdue: 8, status: 'partial' },
  { id: 5, company: 'ИП "Жумабеков"', inn: '23456789012345', contact: 'Жумабеков Н.К.', phone: '+996 559 567 890', region: 'Ош', groupNumber: 2, groupName: 'Изделия из негофрированной бумаги/картона', expectedAmount: 55950, paidAmount: 0, debt: 55950, daysOverdue: 20, status: 'overdue' },
  { id: 6, company: 'ИП "Токтогулова"', inn: '34567890123456', contact: 'Токтогулова А.Б.', phone: '+996 705 678 901', region: 'Бишкек', groupNumber: 7, groupName: 'Изделия пластмассовые прочие', expectedAmount: 44032, paidAmount: 0, debt: 44032, daysOverdue: 3, status: 'unpaid' },
  { id: 7, company: 'ОсОО "МегаТрейд"', inn: '45678901234567', contact: 'Бекмуратов Э.С.', phone: '+996 777 789 012', region: 'Чуйская область', groupNumber: 6, groupName: 'Изделия пластмассовые упаковочные', expectedAmount: 188360, paidAmount: 100000, debt: 88360, daysOverdue: 7, status: 'partial' },
  { id: 8, company: 'ОсОО "ЭкоГласс"', inn: '56789012345678', contact: 'Саматова Д.Н.', phone: '+996 551 890 123', region: 'Иссык-Кульская область', groupNumber: 8, groupName: 'Стекло полое', expectedAmount: 84380, paidAmount: 0, debt: 84380, daysOverdue: 14, status: 'overdue' },
  { id: 9, company: 'ОсОО "ОшПлюс"', inn: '67890123456789', contact: 'Абдыкадыров Т.Б.', phone: '+996 556 901 234', region: 'Ошская область', groupNumber: 4, groupName: 'Шины, покрышки и камеры резиновые', expectedAmount: 185175, paidAmount: 50000, debt: 135175, daysOverdue: 18, status: 'overdue' },
  { id: 10, company: 'ИП "Сыдыкова"', inn: '78901234567890', contact: 'Сыдыкова А.К.', phone: '+996 708 012 345', region: 'Джалал-Абадская область', groupNumber: 19, groupName: 'Упаковка из полимерных материалов (без галогенов)', expectedAmount: 47090, paidAmount: 0, debt: 47090, daysOverdue: 10, status: 'overdue' },
  { id: 11, company: 'ОсОО "БаткенТорг"', inn: '89012345678901', contact: 'Маматов Р.Э.', phone: '+996 779 123 456', region: 'Баткенская область', groupNumber: 1, groupName: 'Изделия из гофрированной бумаги/картона', expectedAmount: 71895, paidAmount: 30000, debt: 41895, daysOverdue: 6, status: 'partial' },
  { id: 12, company: 'ОсОО "ТехноСервис"', inn: '90123456789012', contact: 'Калыков Б.Н.', phone: '+996 550 234 567', region: 'Бишкек', groupNumber: 15, groupName: 'Техника бытовая крупная', expectedAmount: 363560, paidAmount: 200000, debt: 163560, daysOverdue: 4, status: 'partial' },
])

const filteredDebtors = computed(() => {
  return debtorsData.value.filter(d => {
    if (debtorsFilters.value.minDebt > 0 && d.debt < debtorsFilters.value.minDebt) return false
    if (debtorsFilters.value.groupNumber > 0 && d.groupNumber !== debtorsFilters.value.groupNumber) return false
    if (debtorsFilters.value.region !== 'Все регионы' && d.region !== debtorsFilters.value.region) return false
    return true
  }).sort((a, b) => b.debt - a.debt)
})

const debtorsTotals = computed(() => ({
  count: filteredDebtors.value.length,
  expected: filteredDebtors.value.reduce((s, d) => s + d.expectedAmount, 0),
  paid: filteredDebtors.value.reduce((s, d) => s + d.paidAmount, 0),
  debt: filteredDebtors.value.reduce((s, d) => s + d.debt, 0),
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

  if (activeReport.value === 'receipts') {
    filename = 'report_receipts.csv'
    csvContent = 'Компания,ИНН,Регион,Группа товара,Подгруппа,Масса (т),Ставка,Сумма,Дата оплаты,Статус\n'
    filteredReceipts.value.forEach(r => {
      csvContent += `"${r.company}",${r.inn},"${r.region}","${r.groupName}","${r.subgroup}",${r.mass},${r.rate},${r.amount},"${r.paymentDate || '-'}","${getStatusLabel(r.status)}"\n`
    })
  } else if (activeReport.value === 'products') {
    filename = 'report_products.csv'
    csvContent = 'Группа,Наименование,Плательщиков,Масса (т),Сумма,Доля %\n'
    filteredProducts.value.forEach(p => {
      csvContent += `${p.groupNumber},"${p.groupName}",${p.payers},${p.mass},${p.amount},${p.percent}\n`
    })
  } else if (activeReport.value === 'debtors') {
    filename = 'report_debtors.csv'
    csvContent = 'Компания,ИНН,Контакт,Телефон,Регион,Группа товара,Ожидаемая сумма,Оплачено,Задолженность,Дней просрочки,Статус\n'
    filteredDebtors.value.forEach(d => {
      csvContent += `"${d.company}",${d.inn},"${d.contact}","${d.phone}","${d.region}","${d.groupName}",${d.expectedAmount},${d.paidAmount},${d.debt},${d.daysOverdue},"${getDebtorStatusLabel(d.status)}"\n`
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
  alert('Экспорт в PDF: функция будет реализована с серверной генерацией')
}

const sendNotifications = () => {
  alert(`Уведомления будут отправлены ${filteredDebtors.value.length} должникам`)
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    paid: 'bg-green-100 text-green-700',
    partial: 'bg-amber-100 text-amber-700',
    overdue: 'bg-red-100 text-red-700',
  }
  return colors[status] || 'bg-gray-100 text-gray-700'
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    paid: 'Оплачено',
    partial: 'Частично',
    overdue: 'Просрочено',
  }
  return labels[status] || status
}

const getDebtorStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    unpaid: 'bg-orange-100 text-orange-700',
    partial: 'bg-amber-100 text-amber-700',
    overdue: 'bg-red-100 text-red-700',
  }
  return colors[status] || 'bg-gray-100 text-gray-700'
}

const getDebtorStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    unpaid: 'Не оплачено',
    partial: 'Частично оплачено',
    overdue: 'Просрочено',
  }
  return labels[status] || status
}

const formatNumber = (num: number) => num.toLocaleString('ru-RU')

const selectReport = (type: 'receipts' | 'products' | 'debtors') => {
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
    roleTitle="Сотрудник МПРЭТН КР"
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
              {{ activeReport === 'receipts' ? 'Поступления утилизационного сбора' :
                 activeReport === 'products' ? 'Аналитика по группам товаров' :
                 activeReport === 'debtors' ? 'Компании с задолженностью' : 'Отчётность' }}
            </h1>
            <p class="text-gray-600 mt-1">
              {{ activeReport ? 'Формирование и выгрузка отчётов для контролирующих органов' : 'Выберите тип отчёта для формирования' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Report Type Cards -->
      <div v-if="!activeReport" class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Card 1: Receipts -->
        <div
          @click="selectReport('receipts')"
          class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-sky-300 transition-all cursor-pointer group"
        >
          <div class="w-14 h-14 bg-sky-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-sky-200 transition-colors">
            <svg class="w-7 h-7 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 class="text-lg font-bold text-gray-900 mb-2">Отчёт по поступлениям</h3>
          <p class="text-gray-500 text-sm mb-4">Детальная информация о поступлениях утилизационного сбора с фильтрацией по периоду, группам товаров и компаниям</p>
          <div class="flex items-center text-sky-600 font-medium text-sm">
            <span>Сформировать отчёт</span>
            <svg class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        <!-- Card 2: Products -->
        <div
          @click="selectReport('products')"
          class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div class="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-200 transition-colors">
            <svg class="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 class="text-lg font-bold text-gray-900 mb-2">Отчёт по видам товаров</h3>
          <p class="text-gray-500 text-sm mb-4">Сводная аналитика по 24 группам товаров: плательщики, объёмы, суммы поступлений с визуализацией</p>
          <div class="flex items-center text-emerald-600 font-medium text-sm">
            <span>Сформировать отчёт</span>
            <svg class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        <!-- Card 3: Debtors -->
        <div
          @click="selectReport('debtors')"
          class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-rose-300 transition-all cursor-pointer group"
        >
          <div class="w-14 h-14 bg-rose-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-rose-200 transition-colors">
            <svg class="w-7 h-7 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 class="text-lg font-bold text-gray-900 mb-2">Отчёт по должникам</h3>
          <p class="text-gray-500 text-sm mb-4">Список компаний с задолженностью по утилизационному сбору с возможностью отправки уведомлений</p>
          <div class="flex items-center text-rose-600 font-medium text-sm">
            <span>Сформировать отчёт</span>
            <svg class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>

      <!-- ========== ОТЧЁТ 1: ПОСТУПЛЕНИЯ ========== -->
      <template v-if="activeReport === 'receipts'">
        <!-- Filters -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="font-semibold text-gray-900 mb-4">Параметры отчёта</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Период с</label>
              <input v-model="receiptsFilters.dateFrom" type="date" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Период по</label>
              <input v-model="receiptsFilters.dateTo" type="date" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Группа товаров</label>
              <select v-model="receiptsFilters.groupNumber" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500">
                <option :value="0">Все группы (1-24)</option>
                <optgroup label="ТОВАРЫ (Группы 1-18)">
                  <option v-for="g in productGroups.filter(p => p.type === 'goods')" :key="g.number" :value="g.number">
                    №{{ g.number }}: {{ g.name }}
                  </option>
                </optgroup>
                <optgroup label="УПАКОВКА (Группы 19-24)">
                  <option v-for="g in productGroups.filter(p => p.type === 'packaging')" :key="g.number" :value="g.number">
                    №{{ g.number }}: {{ g.name }}
                  </option>
                </optgroup>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Подгруппа</label>
              <select v-model="receiptsFilters.subgroup" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500">
                <option v-for="s in availableSubgroups" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Регион</label>
              <select v-model="receiptsFilters.region" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500">
                <option v-for="r in regions" :key="r" :value="r">{{ r }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Компания / ИНН</label>
              <input v-model="receiptsFilters.company" type="text" placeholder="Поиск..." class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500" />
            </div>
            <div class="flex items-end">
              <button
                @click="generateReport"
                :disabled="isGenerating"
                class="w-full px-4 py-2 bg-sky-600 text-white rounded-lg font-medium hover:bg-sky-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <svg v-if="isGenerating" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isGenerating ? 'Формирование...' : 'Сформировать' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Results -->
        <div v-if="reportGenerated" class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <!-- Export buttons -->
          <div class="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <div class="text-sm text-gray-600">
              Найдено записей: <span class="font-semibold">{{ filteredReceipts.length }}</span>
            </div>
            <div class="flex gap-2">
              <button @click="exportToExcel" class="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Excel
              </button>
              <button @click="exportToPdf" class="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                PDF
              </button>
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
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Подгруппа</th>
                  <th class="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Масса (т)</th>
                  <th class="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Ставка</th>
                  <th class="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Сумма</th>
                  <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Дата оплаты</th>
                  <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Статус</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="r in filteredReceipts" :key="r.id" class="hover:bg-gray-50">
                  <td class="px-4 py-3 font-medium text-gray-900">{{ r.company }}</td>
                  <td class="px-4 py-3 text-gray-600 font-mono text-sm">{{ r.inn }}</td>
                  <td class="px-4 py-3 text-gray-600 text-sm">№{{ r.groupNumber }}: {{ r.groupName }}</td>
                  <td class="px-4 py-3 text-gray-600 text-sm">{{ r.subgroup }}</td>
                  <td class="px-4 py-3 text-right font-medium">{{ r.mass.toFixed(1) }}</td>
                  <td class="px-4 py-3 text-right text-gray-600">{{ formatNumber(r.rate) }}</td>
                  <td class="px-4 py-3 text-right font-bold text-gray-900">{{ formatNumber(r.amount) }} сом</td>
                  <td class="px-4 py-3 text-center text-gray-600">{{ r.paymentDate || '—' }}</td>
                  <td class="px-4 py-3 text-center">
                    <span :class="['text-xs px-2 py-1 rounded-full font-medium', getStatusColor(r.status)]">
                      {{ getStatusLabel(r.status) }}
                    </span>
                  </td>
                </tr>
              </tbody>
              <tfoot class="bg-sky-50 border-t-2 border-sky-200">
                <tr>
                  <td colspan="4" class="px-4 py-3 font-bold text-gray-900">ИТОГО за период:</td>
                  <td class="px-4 py-3 text-right font-bold text-gray-900">{{ receiptsTotals.mass.toFixed(1) }} т</td>
                  <td class="px-4 py-3"></td>
                  <td class="px-4 py-3 text-right font-bold text-sky-700 text-lg">{{ formatNumber(receiptsTotals.amount) }} сом</td>
                  <td colspan="2" class="px-4 py-3 text-center text-sm text-gray-600">Оплачено: {{ formatNumber(receiptsTotals.paid) }} сом</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </template>

      <!-- ========== ОТЧЁТ 2: ПО ВИДАМ ТОВАРОВ ========== -->
      <template v-if="activeReport === 'products'">
        <!-- Filters -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="font-semibold text-gray-900 mb-4">Параметры отчёта</h3>
          <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Период с</label>
              <input v-model="productsFilters.dateFrom" type="date" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Период по</label>
              <input v-model="productsFilters.dateTo" type="date" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Группа товаров</label>
              <select v-model="productsFilters.groupNumber" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                <option :value="0">Все группы (1-24)</option>
                <optgroup label="ТОВАРЫ (Группы 1-18)">
                  <option v-for="g in productGroups.filter(p => p.type === 'goods')" :key="g.number" :value="g.number">
                    №{{ g.number }}: {{ g.name }}
                  </option>
                </optgroup>
                <optgroup label="УПАКОВКА (Группы 19-24)">
                  <option v-for="g in productGroups.filter(p => p.type === 'packaging')" :key="g.number" :value="g.number">
                    №{{ g.number }}: {{ g.name }}
                  </option>
                </optgroup>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Регион</label>
              <select v-model="productsFilters.region" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
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
                {{ isGenerating ? 'Формирование...' : 'Сформировать' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Results -->
        <div v-if="reportGenerated" class="space-y-6">
          <!-- Charts -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Pie Chart placeholder -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 class="font-semibold text-gray-900 mb-4">Доля групп товаров в поступлениях</h3>
              <div class="flex items-center justify-center h-64">
                <div class="relative w-48 h-48">
                  <svg viewBox="0 0 36 36" class="w-full h-full">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" stroke-width="3"/>
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#0ea5e9" stroke-width="3" stroke-dasharray="30.4 69.6" stroke-dashoffset="25"/>
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#10b981" stroke-width="3" stroke-dasharray="9.7 90.3" stroke-dashoffset="-5.4"/>
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f59e0b" stroke-width="3" stroke-dasharray="8.2 91.8" stroke-dashoffset="-15.1"/>
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#8b5cf6" stroke-width="3" stroke-dasharray="7.8 92.2" stroke-dashoffset="-23.3"/>
                  </svg>
                  <div class="absolute inset-0 flex items-center justify-center">
                    <div class="text-center">
                      <div class="text-2xl font-bold text-gray-900">{{ formatNumber(productsTotals.amount) }}</div>
                      <div class="text-xs text-gray-500">сом</div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="mt-4 grid grid-cols-2 gap-2">
                <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-sky-500"></span><span class="text-xs text-gray-600">Шины (30.4%)</span></div>
                <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-emerald-500"></span><span class="text-xs text-gray-600">Пластик упак. (9.7%)</span></div>
                <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-amber-500"></span><span class="text-xs text-gray-600">Гофрокартон (8.2%)</span></div>
                <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-violet-500"></span><span class="text-xs text-gray-600">Пластик прочие (7.8%)</span></div>
              </div>
            </div>

            <!-- Bar Chart placeholder -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 class="font-semibold text-gray-900 mb-4">Топ-5 групп по сумме поступлений</h3>
              <div class="space-y-4">
                <div v-for="(p, i) in filteredProducts.slice(0, 5)" :key="p.groupNumber" class="flex items-center gap-4">
                  <div class="w-8 text-sm font-bold text-gray-500">{{ i + 1 }}</div>
                  <div class="flex-1">
                    <div class="flex justify-between mb-1">
                      <span class="text-sm font-medium text-gray-900">№{{ p.groupNumber }}: {{ p.groupName.substring(0, 30) }}...</span>
                      <span class="text-sm font-bold text-emerald-600">{{ formatNumber(p.amount) }}</span>
                    </div>
                    <div class="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        class="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full"
                        :style="{ width: `${filteredProducts[0] ? (p.amount / filteredProducts[0].amount) * 100 : 0}%` }"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Table -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div class="text-sm text-gray-600">Сводная таблица по группам товаров</div>
              <div class="flex gap-2">
                <button @click="exportToExcel" class="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Excel
                </button>
                <button @click="exportToPdf" class="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                  PDF
                </button>
              </div>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">№</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Группа товара</th>
                    <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Тип</th>
                    <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Плательщиков</th>
                    <th class="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Масса (т)</th>
                    <th class="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Сумма поступлений</th>
                    <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Доля</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr v-for="p in filteredProducts" :key="p.groupNumber" class="hover:bg-gray-50">
                    <td class="px-4 py-3 font-mono text-emerald-600">{{ p.groupNumber }}</td>
                    <td class="px-4 py-3 font-medium text-gray-900">{{ p.groupName }}</td>
                    <td class="px-4 py-3 text-center">
                      <span :class="['text-xs px-2 py-1 rounded-full', p.type === 'goods' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700']">
                        {{ p.type === 'goods' ? 'Товар' : 'Упаковка' }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-center text-gray-600">{{ p.payers }}</td>
                    <td class="px-4 py-3 text-right font-medium">{{ p.mass.toFixed(1) }}</td>
                    <td class="px-4 py-3 text-right font-bold text-gray-900">{{ formatNumber(p.amount) }} сом</td>
                    <td class="px-4 py-3 text-center">
                      <div class="flex items-center gap-2">
                        <div class="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div class="h-full bg-emerald-500 rounded-full" :style="{ width: `${p.percent}%` }"></div>
                        </div>
                        <span class="text-sm text-gray-600 w-12">{{ p.percent }}%</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
                <tfoot class="bg-emerald-50 border-t-2 border-emerald-200">
                  <tr>
                    <td colspan="3" class="px-4 py-3 font-bold text-gray-900">ИТОГО:</td>
                    <td class="px-4 py-3 text-center font-bold">{{ productsTotals.payers }}</td>
                    <td class="px-4 py-3 text-right font-bold">{{ productsTotals.mass.toFixed(1) }} т</td>
                    <td class="px-4 py-3 text-right font-bold text-emerald-700 text-lg">{{ formatNumber(productsTotals.amount) }} сом</td>
                    <td class="px-4 py-3 text-center font-bold">100%</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </template>

      <!-- ========== ОТЧЁТ 3: ДОЛЖНИКИ ========== -->
      <template v-if="activeReport === 'debtors'">
        <!-- Filters -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="font-semibold text-gray-900 mb-4">Параметры отчёта</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Период с</label>
              <input v-model="debtorsFilters.dateFrom" type="date" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Период по</label>
              <input v-model="debtorsFilters.dateTo" type="date" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Мин. задолженность (сом)</label>
              <input v-model.number="debtorsFilters.minDebt" type="number" placeholder="0" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Регион</label>
              <select v-model="debtorsFilters.region" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500">
                <option v-for="r in regions" :key="r" :value="r">{{ r }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Группа товаров</label>
              <select v-model="debtorsFilters.groupNumber" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500">
                <option :value="0">Все группы (1-24)</option>
                <optgroup label="ТОВАРЫ (Группы 1-18)">
                  <option v-for="g in productGroups.filter(p => p.type === 'goods')" :key="g.number" :value="g.number">
                    №{{ g.number }}: {{ g.name }}
                  </option>
                </optgroup>
                <optgroup label="УПАКОВКА (Группы 19-24)">
                  <option v-for="g in productGroups.filter(p => p.type === 'packaging')" :key="g.number" :value="g.number">
                    №{{ g.number }}: {{ g.name }}
                  </option>
                </optgroup>
              </select>
            </div>
            <div class="flex items-end">
              <button
                @click="generateReport"
                :disabled="isGenerating"
                class="w-full px-4 py-2 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <svg v-if="isGenerating" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isGenerating ? 'Формирование...' : 'Сформировать' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Results -->
        <div v-if="reportGenerated" class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <!-- Summary cards -->
          <div class="p-4 border-b border-gray-200 bg-rose-50">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div class="bg-white rounded-lg p-4 border border-rose-200">
                <p class="text-sm text-gray-500">Должников</p>
                <p class="text-2xl font-bold text-rose-600">{{ debtorsTotals.count }}</p>
              </div>
              <div class="bg-white rounded-lg p-4 border border-rose-200">
                <p class="text-sm text-gray-500">Ожидаемая сумма</p>
                <p class="text-2xl font-bold text-gray-900">{{ formatNumber(debtorsTotals.expected) }}</p>
              </div>
              <div class="bg-white rounded-lg p-4 border border-rose-200">
                <p class="text-sm text-gray-500">Оплачено</p>
                <p class="text-2xl font-bold text-green-600">{{ formatNumber(debtorsTotals.paid) }}</p>
              </div>
              <div class="bg-white rounded-lg p-4 border border-rose-200">
                <p class="text-sm text-gray-500">Общая задолженность</p>
                <p class="text-2xl font-bold text-rose-700">{{ formatNumber(debtorsTotals.debt) }} сом</p>
              </div>
            </div>
          </div>

          <!-- Export buttons -->
          <div class="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <div class="text-sm text-gray-600">
              Найдено должников: <span class="font-semibold text-rose-600">{{ filteredDebtors.length }}</span>
            </div>
            <div class="flex gap-2">
              <button @click="sendNotifications" class="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                Уведомить должников
              </button>
              <button @click="exportToExcel" class="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Excel
              </button>
              <button @click="exportToPdf" class="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                PDF
              </button>
            </div>
          </div>

          <!-- Table -->
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Компания</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ИНН</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Контактное лицо</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Телефон</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Группа товара</th>
                  <th class="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Ожидается</th>
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
                  <td class="px-4 py-3 text-gray-600">{{ d.contact }}</td>
                  <td class="px-4 py-3 text-gray-600 text-sm">{{ d.phone }}</td>
                  <td class="px-4 py-3 text-gray-600 text-sm">№{{ d.groupNumber }}: {{ d.groupName.substring(0, 25) }}...</td>
                  <td class="px-4 py-3 text-right text-gray-600">{{ formatNumber(d.expectedAmount) }}</td>
                  <td class="px-4 py-3 text-right text-green-600">{{ formatNumber(d.paidAmount) }}</td>
                  <td class="px-4 py-3 text-right font-bold text-rose-600">{{ formatNumber(d.debt) }}</td>
                  <td class="px-4 py-3 text-center">
                    <span :class="['font-bold', d.daysOverdue > 10 ? 'text-rose-600' : d.daysOverdue > 5 ? 'text-amber-600' : 'text-gray-600']">
                      {{ d.daysOverdue }} дн.
                    </span>
                  </td>
                  <td class="px-4 py-3 text-center">
                    <span :class="['text-xs px-2 py-1 rounded-full font-medium', getDebtorStatusColor(d.status)]">
                      {{ getDebtorStatusLabel(d.status) }}
                    </span>
                  </td>
                </tr>
              </tbody>
              <tfoot class="bg-rose-50 border-t-2 border-rose-200">
                <tr>
                  <td colspan="5" class="px-4 py-3 font-bold text-gray-900">ИТОГО должников: {{ debtorsTotals.count }}</td>
                  <td class="px-4 py-3 text-right font-bold">{{ formatNumber(debtorsTotals.expected) }}</td>
                  <td class="px-4 py-3 text-right font-bold text-green-600">{{ formatNumber(debtorsTotals.paid) }}</td>
                  <td class="px-4 py-3 text-right font-bold text-rose-700 text-lg">{{ formatNumber(debtorsTotals.debt) }} сом</td>
                  <td colspan="2"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </template>
    </div>
  </DashboardLayout>
</template>
