<script setup lang="ts">
import { ref, computed } from 'vue'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import { useEcoOperatorMenu } from '../../composables/useRoleMenu'
import { recyclerStore } from '../../stores/recyclers'
import { productGroups } from '../../data/product-groups'

const { roleTitle, menuItems } = useEcoOperatorMenu()

// View state
const currentView = ref<'list' | 'detail'>('list')
const selectedCompany = ref<Company | null>(null)

// Edit state
const isEditing = ref(false)
const saving = ref(false)
const showNotification = ref(false)

// Editable form data
interface EditFormData {
  director: string
  contactPerson: string
  contactPosition: string
  phone: string
  email: string
  website: string
  actualAddress: string
}

const editFormData = ref<EditFormData>({
  director: '',
  contactPerson: '',
  contactPosition: '',
  phone: '',
  email: '',
  website: '',
  actualAddress: '',
})

// Filters
const searchQuery = ref('')
const filterType = ref('all')
const filterRegion = ref('all')
const filterStatus = ref('all')

// Company types
const companyTypes = [
  { id: 'all', name: 'Все типы' },
  { id: 'importer', name: 'Импортёр' },
  { id: 'manufacturer', name: 'Производитель' },
  { id: 'recycler', name: 'Переработчик' },
]

// Regions
const regions = [
  { id: 'all', name: 'Все регионы' },
  { id: 'bishkek', name: 'г. Бишкек' },
  { id: 'osh', name: 'г. Ош' },
  { id: 'chui', name: 'Чуйская область' },
  { id: 'osh-obl', name: 'Ошская область' },
  { id: 'jalal-abad', name: 'Джалал-Абадская область' },
  { id: 'issyk-kul', name: 'Иссык-Кульская область' },
  { id: 'naryn', name: 'Нарынская область' },
  { id: 'talas', name: 'Таласская область' },
  { id: 'batken', name: 'Баткенская область' },
]

// Statuses
const statuses = [
  { id: 'all', name: 'Все статусы' },
  { id: 'active', name: 'Активен' },
  { id: 'suspended', name: 'Приостановлен' },
]

// Company interface
interface Company {
  id: number
  shortName: string
  fullName: string
  inn: string
  okpo: string
  type: 'importer' | 'manufacturer' | 'recycler'
  typeName: string
  region: string
  regionId: string
  legalAddress: string
  actualAddress: string
  director: string
  contactPerson: string
  contactPosition: string
  phone: string
  email: string
  website?: string
  activityType: string
  licenseNumber: string
  licenseExpiry: string
  registrationDate: string
  status: 'active' | 'suspended'
}

// Test data - 15 companies
const companiesData = ref<Company[]>([
  {
    id: 1,
    shortName: 'ОсОО "БишкекПласт"',
    fullName: 'Общество с ограниченной ответственностью "БишкекПласт"',
    inn: '01234567891234',
    okpo: '12345678',
    type: 'manufacturer',
    typeName: 'Производитель',
    region: 'г. Бишкек',
    regionId: 'bishkek',
    legalAddress: 'г. Бишкек, ул. Ахунбаева, д. 123',
    actualAddress: 'г. Бишкек, ул. Ахунбаева, д. 123, офис 5',
    director: 'Асанов Бакыт Жумабекович',
    contactPerson: 'Иванова Мария Петровна',
    contactPosition: 'Менеджер по экологии',
    phone: '+996 312 55-44-33',
    email: 'info@bishkekplast.kg',
    website: 'www.bishkekplast.kg',
    activityType: 'Производство пластиковой упаковки',
    licenseNumber: 'ЛП-2023/0156',
    licenseExpiry: '2028-05-15',
    registrationDate: '2020-03-10',
    status: 'active',
  },
  {
    id: 2,
    shortName: 'ОАО "ОшМеталл"',
    fullName: 'Открытое акционерное общество "ОшМеталл"',
    inn: '03456789123456',
    okpo: '23456789',
    type: 'recycler',
    typeName: 'Переработчик',
    region: 'г. Ош',
    regionId: 'osh',
    legalAddress: 'г. Ош, ул. Курманжан Датка, д. 45',
    actualAddress: 'г. Ош, промзона "Южная", участок 12',
    director: 'Мамытов Эрнис Токтогулович',
    contactPerson: 'Абдыкадыров Нурлан Сапарбекович',
    contactPosition: 'Главный инженер',
    phone: '+996 3222 5-55-55',
    email: 'info@oshmetal.kg',
    activityType: 'Переработка металлических отходов',
    licenseNumber: 'ЛП-2022/0089',
    licenseExpiry: '2027-08-20',
    registrationDate: '2019-06-15',
    status: 'active',
  },
  {
    id: 3,
    shortName: 'ОсОО "ЭкоРесайкл"',
    fullName: 'Общество с ограниченной ответственностью "ЭкоРесайкл"',
    inn: '02345678912345',
    okpo: '34567890',
    type: 'recycler',
    typeName: 'Переработчик',
    region: 'г. Бишкек',
    regionId: 'bishkek',
    legalAddress: 'г. Бишкек, ул. Жибек Жолу, д. 555',
    actualAddress: 'г. Бишкек, ул. Жибек Жолу, д. 555',
    director: 'Токтогулов Эрнис Бакытович',
    contactPerson: 'Асанова Айгуль Сапарбековна',
    contactPosition: 'Менеджер по работе с клиентами',
    phone: '+996 312 90-00-01',
    email: 'info@ecorecycle.kg',
    website: 'www.ecorecycle.kg',
    activityType: 'Переработка бумаги и картона',
    licenseNumber: 'ЛП-2024/0234',
    licenseExpiry: '2029-01-15',
    registrationDate: '2021-01-20',
    status: 'active',
  },
  {
    id: 4,
    shortName: 'ИП "Асанов"',
    fullName: 'Индивидуальный предприниматель Асанов Талант Бекович',
    inn: '12345678901234',
    okpo: '45678901',
    type: 'importer',
    typeName: 'Импортёр',
    region: 'г. Ош',
    regionId: 'osh',
    legalAddress: 'г. Ош, ул. Ленина, д. 78, кв. 12',
    actualAddress: 'г. Ош, рынок "Карасуу", павильон 45',
    director: 'Асанов Талант Бекович',
    contactPerson: 'Асанов Талант Бекович',
    contactPosition: 'Директор',
    phone: '+996 555 12-34-56',
    email: 'asanov.import@mail.ru',
    activityType: 'Импорт стеклянной тары',
    licenseNumber: 'ЛИ-2024/0045',
    licenseExpiry: '2026-12-31',
    registrationDate: '2022-04-05',
    status: 'active',
  },
  {
    id: 5,
    shortName: 'ОсОО "GreenPack"',
    fullName: 'Общество с ограниченной ответственностью "GreenPack"',
    inn: '04567891234567',
    okpo: '56789012',
    type: 'manufacturer',
    typeName: 'Производитель',
    region: 'г. Бишкек',
    regionId: 'bishkek',
    legalAddress: 'г. Бишкек, пр. Чуй, д. 200',
    actualAddress: 'г. Бишкек, пр. Чуй, д. 200, корп. 2',
    director: 'Сыдыкова Айнура Маратовна',
    contactPerson: 'Кулов Азамат Эркинбекович',
    contactPosition: 'Эколог',
    phone: '+996 312 66-77-88',
    email: 'eco@greenpack.kg',
    website: 'www.greenpack.kg',
    activityType: 'Производство экологичной упаковки',
    licenseNumber: 'ЛП-2023/0178',
    licenseExpiry: '2028-09-30',
    registrationDate: '2020-11-12',
    status: 'active',
  },
  {
    id: 6,
    shortName: 'ОсОО "АвтоШина"',
    fullName: 'Общество с ограниченной ответственностью "АвтоШина"',
    inn: '09123456789012',
    okpo: '67890123',
    type: 'importer',
    typeName: 'Импортёр',
    region: 'г. Бишкек',
    regionId: 'bishkek',
    legalAddress: 'г. Бишкек, ул. Фучика, д. 14А',
    actualAddress: 'г. Бишкек, ул. Фучика, д. 14А',
    director: 'Жумабеков Канат Асылбекович',
    contactPerson: 'Осмонова Гульнара Сапаровна',
    contactPosition: 'Бухгалтер',
    phone: '+996 312 45-67-89',
    email: 'office@avtoshina.kg',
    website: 'www.avtoshina.kg',
    activityType: 'Импорт автомобильных шин',
    licenseNumber: 'ЛИ-2022/0067',
    licenseExpiry: '2027-03-15',
    registrationDate: '2018-07-22',
    status: 'active',
  },
  {
    id: 7,
    shortName: 'ОсОО "ИссыкКульЭко"',
    fullName: 'Общество с ограниченной ответственностью "ИссыкКульЭко"',
    inn: '06789123456789',
    okpo: '78901234',
    type: 'recycler',
    typeName: 'Переработчик',
    region: 'Иссык-Кульская область',
    regionId: 'issyk-kul',
    legalAddress: 'г. Каракол, ул. Токтогула, д. 89',
    actualAddress: 'Иссык-Кульская обл., с. Тамчы, промзона',
    director: 'Эсенгулов Бакыт Жолдошевич',
    contactPerson: 'Алиева Назгуль Маратовна',
    contactPosition: 'Менеджер',
    phone: '+996 3922 5-12-34',
    email: 'info@issykkul-eco.kg',
    activityType: 'Переработка органических отходов',
    licenseNumber: 'ЛП-2023/0201',
    licenseExpiry: '2028-06-01',
    registrationDate: '2021-05-18',
    status: 'active',
  },
  {
    id: 8,
    shortName: 'ОАО "НарынМеталл"',
    fullName: 'Открытое акционерное общество "НарынМеталл"',
    inn: '07891234567890',
    okpo: '89012345',
    type: 'recycler',
    typeName: 'Переработчик',
    region: 'Нарынская область',
    regionId: 'naryn',
    legalAddress: 'г. Нарын, ул. Ленина, д. 56',
    actualAddress: 'г. Нарын, промзона "Северная"',
    director: 'Токтосунов Эмиль Кубанычбекович',
    contactPerson: 'Джумагулова Айпери Талантбековна',
    contactPosition: 'Инженер-эколог',
    phone: '+996 3522 5-00-11',
    email: 'naryn.metal@mail.kg',
    activityType: 'Переработка металлолома и аккумуляторов',
    licenseNumber: 'ЛП-2021/0145',
    licenseExpiry: '2026-11-20',
    registrationDate: '2017-09-05',
    status: 'suspended',
  },
  {
    id: 9,
    shortName: 'ОсОО "ТаласПак"',
    fullName: 'Общество с ограниченной ответственностью "ТаласПак"',
    inn: '08912345678901',
    okpo: '90123456',
    type: 'manufacturer',
    typeName: 'Производитель',
    region: 'Таласская область',
    regionId: 'talas',
    legalAddress: 'г. Талас, ул. Бердике Баатыра, д. 34',
    actualAddress: 'г. Талас, ул. Бердике Баатыра, д. 34',
    director: 'Молдобаев Нурбек Асанович',
    contactPerson: 'Керимова Жылдыз Болотовна',
    contactPosition: 'Администратор',
    phone: '+996 3422 5-22-33',
    email: 'talaspak@inbox.kg',
    activityType: 'Производство картонной упаковки',
    licenseNumber: 'ЛП-2024/0012',
    licenseExpiry: '2029-02-28',
    registrationDate: '2022-08-14',
    status: 'active',
  },
  {
    id: 10,
    shortName: 'ОсОО "ЧуйСтрой"',
    fullName: 'Общество с ограниченной ответственностью "ЧуйСтрой"',
    inn: '05678912345678',
    okpo: '01234567',
    type: 'manufacturer',
    typeName: 'Производитель',
    region: 'Чуйская область',
    regionId: 'chui',
    legalAddress: 'Чуйская обл., г. Токмок, ул. Промышленная, д. 15',
    actualAddress: 'Чуйская обл., г. Токмок, промзона',
    director: 'Ибраимов Кайрат Токторович',
    contactPerson: 'Сатыбалдиева Элиза Кубатовна',
    contactPosition: 'Специалист по РОП',
    phone: '+996 3138 5-11-22',
    email: 'chuistroy@mail.kg',
    activityType: 'Производство строительных материалов',
    licenseNumber: 'ЛП-2022/0098',
    licenseExpiry: '2027-07-10',
    registrationDate: '2019-03-25',
    status: 'suspended',
  },
  {
    id: 11,
    shortName: 'ИП "Жумабеков"',
    fullName: 'Индивидуальный предприниматель Жумабеков Алмаз Сапарбекович',
    inn: '23456789012345',
    okpo: '11223344',
    type: 'importer',
    typeName: 'Импортёр',
    region: 'Джалал-Абадская область',
    regionId: 'jalal-abad',
    legalAddress: 'г. Джалал-Абад, ул. Токтогула, д. 112',
    actualAddress: 'г. Джалал-Абад, рынок "Центральный"',
    director: 'Жумабеков Алмаз Сапарбекович',
    contactPerson: 'Жумабеков Алмаз Сапарбекович',
    contactPosition: 'ИП',
    phone: '+996 555 78-90-12',
    email: 'jumabek.import@gmail.com',
    activityType: 'Импорт бумажной продукции',
    licenseNumber: 'ЛИ-2025/0003',
    licenseExpiry: '2027-01-15',
    registrationDate: '2024-01-10',
    status: 'active',
  },
  {
    id: 12,
    shortName: 'ОсОО "ОшПластик"',
    fullName: 'Общество с ограниченной ответственностью "ОшПластик"',
    inn: '11345678901234',
    okpo: '22334455',
    type: 'manufacturer',
    typeName: 'Производитель',
    region: 'Ошская область',
    regionId: 'osh-obl',
    legalAddress: 'Ошская обл., г. Узген, ул. Масалиева, д. 67',
    actualAddress: 'Ошская обл., г. Узген, промзона "Восточная"',
    director: 'Каримов Рустам Маратович',
    contactPerson: 'Турсунова Айжан Болотовна',
    contactPosition: 'Эколог',
    phone: '+996 3233 5-44-55',
    email: 'oshplastik@mail.kg',
    activityType: 'Производство пластиковых изделий',
    licenseNumber: 'ЛП-2023/0167',
    licenseExpiry: '2028-04-20',
    registrationDate: '2020-06-30',
    status: 'active',
  },
  {
    id: 13,
    shortName: 'ОсОО "ТехноМир"',
    fullName: 'Общество с ограниченной ответственностью "ТехноМир"',
    inn: '15678901234567',
    okpo: '33445566',
    type: 'importer',
    typeName: 'Импортёр',
    region: 'г. Бишкек',
    regionId: 'bishkek',
    legalAddress: 'г. Бишкек, пр. Манаса, д. 40',
    actualAddress: 'г. Бишкек, ТЦ "Дордой Плаза", 3 этаж',
    director: 'Ли Александр Викторович',
    contactPerson: 'Козлова Ирина Сергеевна',
    contactPosition: 'Менеджер по закупкам',
    phone: '+996 312 98-76-54',
    email: 'import@technomir.kg',
    website: 'www.technomir.kg',
    activityType: 'Импорт электроники и бытовой техники',
    licenseNumber: 'ЛИ-2023/0089',
    licenseExpiry: '2028-08-15',
    registrationDate: '2019-11-08',
    status: 'active',
  },
  {
    id: 14,
    shortName: 'ИП "Токтогулова"',
    fullName: 'Индивидуальный предприниматель Токтогулова Айгуль Бекишевна',
    inn: '34567890123456',
    okpo: '44556677',
    type: 'importer',
    typeName: 'Импортёр',
    region: 'Баткенская область',
    regionId: 'batken',
    legalAddress: 'г. Баткен, ул. Советская, д. 23',
    actualAddress: 'г. Баткен, рынок "Баткен"',
    director: 'Токтогулова Айгуль Бекишевна',
    contactPerson: 'Токтогулова Айгуль Бекишевна',
    contactPosition: 'ИП',
    phone: '+996 555 33-44-55',
    email: 'toktogulova.a@mail.ru',
    activityType: 'Импорт текстильной продукции',
    licenseNumber: 'ЛИ-2024/0078',
    licenseExpiry: '2026-09-30',
    registrationDate: '2023-06-20',
    status: 'active',
  },
  {
    id: 15,
    shortName: 'ОсОО "ДжАПласт"',
    fullName: 'Общество с ограниченной ответственностью "ДжАПласт"',
    inn: '13456789012345',
    okpo: '55667788',
    type: 'manufacturer',
    typeName: 'Производитель',
    region: 'Джалал-Абадская область',
    regionId: 'jalal-abad',
    legalAddress: 'г. Джалал-Абад, ул. Эркиндик, д. 89',
    actualAddress: 'г. Джалал-Абад, промзона "Западная"',
    director: 'Усенов Мирбек Жолдошевич',
    contactPerson: 'Бекова Нургуль Маратовна',
    contactPosition: 'Главный бухгалтер',
    phone: '+996 3722 5-66-77',
    email: 'djaplast@inbox.kg',
    activityType: 'Производство полимерной упаковки',
    licenseNumber: 'ЛП-2024/0045',
    licenseExpiry: '2029-03-10',
    registrationDate: '2022-02-14',
    status: 'active',
  },
])

// Filtered companies
const filteredCompanies = computed(() => {
  return companiesData.value.filter(company => {
    // Search filter
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      if (!company.shortName.toLowerCase().includes(query) && !company.inn.includes(query)) {
        return false
      }
    }
    // Type filter
    if (filterType.value !== 'all' && company.type !== filterType.value) {
      return false
    }
    // Region filter
    if (filterRegion.value !== 'all' && company.regionId !== filterRegion.value) {
      return false
    }
    // Status filter
    if (filterStatus.value !== 'all' && company.status !== filterStatus.value) {
      return false
    }
    return true
  })
})

// Statistics
const stats = computed(() => ({
  total: companiesData.value.length,
  importers: companiesData.value.filter(c => c.type === 'importer').length,
  manufacturers: companiesData.value.filter(c => c.type === 'manufacturer').length,
  recyclers: companiesData.value.filter(c => c.type === 'recycler').length,
  active: companiesData.value.filter(c => c.status === 'active').length,
  suspended: companiesData.value.filter(c => c.status === 'suspended').length,
}))

// Helpers
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('ru-RU')
}

const getTypeColor = (type: string) => {
  switch (type) {
    case 'importer': return 'bg-blue-100 text-blue-700'
    case 'manufacturer': return 'bg-purple-100 text-purple-700'
    case 'recycler': return 'bg-green-100 text-green-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

const getStatusColor = (status: string) => {
  return status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
}

const getStatusText = (status: string) => {
  return status === 'active' ? 'Активен' : 'Приостановлен'
}

// Actions
const openCompanyDetail = (company: Company) => {
  selectedCompany.value = company
  currentView.value = 'detail'
}

const backToList = () => {
  selectedCompany.value = null
  currentView.value = 'list'
  isEditing.value = false
}

// Editing functions
const startEditing = () => {
  if (selectedCompany.value) {
    editFormData.value = {
      director: selectedCompany.value.director,
      contactPerson: selectedCompany.value.contactPerson,
      contactPosition: selectedCompany.value.contactPosition,
      phone: selectedCompany.value.phone,
      email: selectedCompany.value.email,
      website: selectedCompany.value.website || '',
      actualAddress: selectedCompany.value.actualAddress,
    }
    isEditing.value = true
  }
}

const cancelEditing = () => {
  isEditing.value = false
}

const saveChanges = async () => {
  if (!selectedCompany.value) return

  saving.value = true

  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000))

  // Update company data
  const index = companiesData.value.findIndex(c => c.id === selectedCompany.value!.id)
  if (index !== -1) {
    companiesData.value[index] = {
      ...companiesData.value[index],
      director: editFormData.value.director,
      contactPerson: editFormData.value.contactPerson,
      contactPosition: editFormData.value.contactPosition,
      phone: editFormData.value.phone,
      email: editFormData.value.email,
      website: editFormData.value.website || undefined,
      actualAddress: editFormData.value.actualAddress,
    }
    selectedCompany.value = companiesData.value[index]
  }

  saving.value = false
  isEditing.value = false

  // Show notification
  showNotification.value = true
  setTimeout(() => {
    showNotification.value = false
  }, 3000)
}

const isLicenseExpiring = (expiryDate: string) => {
  const expiry = new Date(expiryDate)
  const now = new Date()
  const monthsLeft = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)
  return monthsLeft <= 6 && monthsLeft > 0
}

const isLicenseExpired = (expiryDate: string) => {
  return new Date(expiryDate) < new Date()
}

const getRecyclerForCompany = (company: Company | null) => {
  if (!company || company.type !== 'recycler') return null
  // Try to match by similar name
  return recyclerStore.state.recyclers.find(r =>
    company.shortName.includes(r.name.replace(/ОсОО\s*«|»/g, '').trim()) ||
    r.name.includes(company.shortName.replace(/ОсОО\s*"|"/g, '').trim())
  ) || null
}

const matchedRecycler = computed(() => getRecyclerForCompany(selectedCompany.value))

const getCapacityGroupLabel = (value: string) => {
  return productGroups.find(g => g.value === value)?.label || value
}
</script>

<template>
  <DashboardLayout
    role="eco-operator"
    :roleTitle="roleTitle"
    userName="ОсОО «ЭкоПереработка»"
    :menuItems="menuItems"
  >
    <!-- List View -->
    <div v-if="currentView === 'list'" class="space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold text-gray-900">{{ $t('pages.ecoOperator.profileTitle') }}</h1>
        <p class="text-gray-600 mt-1">{{ $t('pages.ecoOperator.profileSubtitle') }}</p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div class="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <p class="text-sm text-gray-500">Всего компаний</p>
          <p class="text-2xl font-bold text-gray-900">{{ stats.total }}</p>
        </div>
        <div class="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <p class="text-sm text-gray-500">Импортёры</p>
          <p class="text-2xl font-bold text-blue-600">{{ stats.importers }}</p>
        </div>
        <div class="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <p class="text-sm text-gray-500">Производители</p>
          <p class="text-2xl font-bold text-purple-600">{{ stats.manufacturers }}</p>
        </div>
        <div class="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <p class="text-sm text-gray-500">Переработчики</p>
          <p class="text-2xl font-bold text-green-600">{{ stats.recyclers }}</p>
        </div>
        <div class="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <p class="text-sm text-gray-500">Активных</p>
          <p class="text-2xl font-bold text-green-600">{{ stats.active }}</p>
        </div>
        <div class="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <p class="text-sm text-gray-500">Приостановлено</p>
          <p class="text-2xl font-bold text-red-600">{{ stats.suspended }}</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
        <div class="flex flex-wrap gap-4">
          <div class="flex-1 min-w-[250px]">
            <label class="block text-xs text-gray-500 mb-1">Поиск по наименованию или ИНН</label>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Введите название или ИНН..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
            />
          </div>
          <div>
            <label class="block text-xs text-gray-500 mb-1">Тип компании</label>
            <select v-model="filterType" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500">
              <option v-for="t in companyTypes" :key="t.id" :value="t.id">{{ t.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs text-gray-500 mb-1">Регион</label>
            <select v-model="filterRegion" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500">
              <option v-for="r in regions" :key="r.id" :value="r.id">{{ r.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs text-gray-500 mb-1">Статус</label>
            <select v-model="filterStatus" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500">
              <option v-for="s in statuses" :key="s.id" :value="s.id">{{ s.name }}</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Companies Table -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Компания</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ИНН</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Тип</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Регион</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Контактное лицо</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Телефон</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Статус</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Действия</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr
                v-for="company in filteredCompanies"
                :key="company.id"
                class="hover:bg-gray-50 cursor-pointer"
                @click="openCompanyDetail(company)"
              >
                <td class="px-4 py-3">
                  <p class="font-medium text-gray-900">{{ company.shortName }}</p>
                </td>
                <td class="px-4 py-3 text-gray-600 font-mono text-sm">{{ company.inn }}</td>
                <td class="px-4 py-3">
                  <span :class="['text-xs px-2 py-1 rounded-full font-medium', getTypeColor(company.type)]">
                    {{ company.typeName }}
                  </span>
                </td>
                <td class="px-4 py-3 text-gray-600 text-sm">{{ company.region }}</td>
                <td class="px-4 py-3 text-gray-600 text-sm">{{ company.contactPerson }}</td>
                <td class="px-4 py-3 text-gray-600 text-sm">{{ company.phone }}</td>
                <td class="px-4 py-3 text-gray-600 text-sm">{{ company.email }}</td>
                <td class="px-4 py-3 text-center">
                  <span :class="['text-xs px-2 py-1 rounded-full font-medium', getStatusColor(company.status)]">
                    {{ getStatusText(company.status) }}
                  </span>
                </td>
                <td class="px-4 py-3 text-center">
                  <button
                    @click.stop="openCompanyDetail(company)"
                    class="text-lime-600 hover:text-lime-700 font-medium text-sm"
                  >
                    {{ $t('common.more') }}
                  </button>
                </td>
              </tr>
              <tr v-if="filteredCompanies.length === 0">
                <td colspan="9" class="px-4 py-8 text-center text-gray-500">
                  Компании не найдены
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="px-4 py-3 border-t border-gray-200 bg-gray-50 text-sm text-gray-600">
          Найдено компаний: {{ filteredCompanies.length }}
        </div>
      </div>
    </div>

    <!-- Detail View -->
    <div v-else-if="currentView === 'detail' && selectedCompany" class="space-y-6">
      <!-- Success Notification -->
      <Transition
        enter-active-class="transition ease-out duration-300"
        enter-from-class="opacity-0 translate-y-[-10px]"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-[-10px]"
      >
        <div
          v-if="showNotification"
          class="fixed top-4 right-4 z-50 bg-green-600 text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="font-medium">Данные успешно обновлены</span>
        </div>
      </Transition>

      <!-- Back Button & Edit Button -->
      <div class="flex items-center justify-between flex-wrap gap-4">
        <div class="flex items-center gap-4">
          <button
            @click="backToList"
            class="flex items-center gap-3 px-6 py-3 text-gray-700 bg-white border-2 border-gray-400 rounded-xl font-semibold text-base hover:bg-gray-50 hover:border-gray-500 hover:shadow-md transition-all"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {{ $t('common.back') }}
          </button>

          <button
            v-if="!isEditing"
            @click="startEditing"
            class="flex items-center gap-3 px-6 py-3 text-white bg-lime-600 border-2 border-lime-600 rounded-xl font-semibold text-base hover:bg-lime-700 hover:border-lime-700 hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            {{ $t('common.edit') }}
          </button>
        </div>

        <!-- Save/Cancel Buttons -->
        <div v-if="isEditing" class="flex items-center gap-4">
          <button
            @click="cancelEditing"
            class="flex items-center gap-2 px-6 py-3 text-gray-700 bg-white border-2 border-gray-400 rounded-xl font-semibold text-base hover:bg-gray-50 hover:border-gray-500 hover:shadow-md transition-all"
          >
            {{ $t('common.cancel') }}
          </button>
          <button
            @click="saveChanges"
            :disabled="saving"
            class="flex items-center gap-3 px-6 py-3 text-white bg-lime-600 border-2 border-lime-600 rounded-xl font-semibold text-base hover:bg-lime-700 hover:border-lime-700 hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
          >
            <svg v-if="saving" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            {{ saving ? $t('common.loading') : $t('common.save') }}
          </button>
        </div>
      </div>

      <!-- Company Header Card -->
      <div class="bg-gradient-to-r from-lime-600 to-green-600 rounded-2xl p-6 text-white">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h1 class="text-2xl font-bold">{{ selectedCompany.shortName }}</h1>
              <p class="text-lime-100">{{ selectedCompany.typeName }} | ИНН: {{ selectedCompany.inn }}</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <span :class="[
              'px-4 py-2 rounded-lg font-medium',
              selectedCompany.status === 'active' ? 'bg-white/20 text-white' : 'bg-red-500 text-white'
            ]">
              {{ getStatusText(selectedCompany.status) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Company Details Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Main Info -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-lime-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-lime-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900">Данные организации</h3>
            </div>
          </div>
          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Краткое наименование</label>
              <p class="text-gray-900">{{ selectedCompany.shortName }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Полное наименование</label>
              <p class="text-gray-900">{{ selectedCompany.fullName }}</p>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-500 mb-1">ИНН</label>
                <p class="text-gray-900 font-mono">{{ selectedCompany.inn }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 mb-1">ОКПО</label>
                <p class="text-gray-900 font-mono">{{ selectedCompany.okpo }}</p>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Вид деятельности</label>
              <p class="text-gray-900">{{ selectedCompany.activityType }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Тип компании</label>
              <span :class="['text-sm px-3 py-1 rounded-full font-medium', getTypeColor(selectedCompany.type)]">
                {{ selectedCompany.typeName }}
              </span>
            </div>
          </div>
        </div>

        <!-- Addresses -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900">Адреса</h3>
            </div>
          </div>
          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Регион</label>
              <p class="text-gray-900">{{ selectedCompany.region }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Юридический адрес</label>
              <p class="text-gray-900">{{ selectedCompany.legalAddress }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Фактический адрес</label>
              <input
                v-if="isEditing"
                v-model="editFormData.actualAddress"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
              />
              <p v-else class="text-gray-900">{{ selectedCompany.actualAddress }}</p>
            </div>
          </div>
        </div>

        <!-- Contacts -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900">Контакты</h3>
            </div>
          </div>
          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Руководитель</label>
              <input
                v-if="isEditing"
                v-model="editFormData.director"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
              />
              <p v-else class="text-gray-900">{{ selectedCompany.director }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Контактное лицо</label>
              <input
                v-if="isEditing"
                v-model="editFormData.contactPerson"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
              />
              <p v-else class="text-gray-900">{{ selectedCompany.contactPerson }}</p>
              <label v-if="isEditing" class="block text-sm font-medium text-gray-500 mb-1 mt-3">Должность</label>
              <input
                v-if="isEditing"
                v-model="editFormData.contactPosition"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
              />
              <p v-else class="text-sm text-gray-500">{{ selectedCompany.contactPosition }}</p>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-500 mb-1">Телефон</label>
                <input
                  v-if="isEditing"
                  v-model="editFormData.phone"
                  type="tel"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                />
                <p v-else class="text-gray-900">{{ selectedCompany.phone }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 mb-1">Email</label>
                <input
                  v-if="isEditing"
                  v-model="editFormData.email"
                  type="email"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                />
                <p v-else class="text-gray-900">{{ selectedCompany.email }}</p>
              </div>
            </div>
            <div v-if="selectedCompany.website || isEditing">
              <label class="block text-sm font-medium text-gray-500 mb-1">Веб-сайт</label>
              <input
                v-if="isEditing"
                v-model="editFormData.website"
                type="text"
                placeholder="www.example.kg"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
              />
              <p v-else class="text-lime-600">{{ selectedCompany.website }}</p>
            </div>
          </div>
        </div>

        <!-- License & Registration -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900">Лицензия и регистрация</h3>
            </div>
          </div>
          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Номер лицензии</label>
              <p class="text-gray-900 font-mono">{{ selectedCompany.licenseNumber }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Срок действия лицензии</label>
              <div class="flex items-center gap-2">
                <p :class="[
                  'font-medium',
                  isLicenseExpired(selectedCompany.licenseExpiry) ? 'text-red-600' :
                  isLicenseExpiring(selectedCompany.licenseExpiry) ? 'text-amber-600' : 'text-gray-900'
                ]">
                  {{ formatDate(selectedCompany.licenseExpiry) }}
                </p>
                <span v-if="isLicenseExpired(selectedCompany.licenseExpiry)" class="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
                  Истекла
                </span>
                <span v-else-if="isLicenseExpiring(selectedCompany.licenseExpiry)" class="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                  Истекает скоро
                </span>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Дата регистрации в системе</label>
              <p class="text-gray-900">{{ formatDate(selectedCompany.registrationDate) }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Статус</label>
              <span :class="['text-sm px-3 py-1 rounded-full font-medium', getStatusColor(selectedCompany.status)]">
                {{ getStatusText(selectedCompany.status) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Recycler Capacities (only for recycler type) -->
        <div v-if="selectedCompany.type === 'recycler' && matchedRecycler" class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden col-span-1 lg:col-span-2">
          <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900">Мощности переработки</h3>
            </div>
          </div>
          <div class="p-6">
            <!-- KPI row -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div class="bg-[#f0fdf4] rounded-xl p-4 border border-[#bbf7d0]">
                <p class="text-xs text-[#059669] font-medium mb-1">Общая мощность</p>
                <p class="text-xl font-bold text-gray-900">{{ recyclerStore.getTotalCapacity(matchedRecycler) }} т/год</p>
              </div>
              <div class="bg-[#eff6ff] rounded-xl p-4 border border-[#bfdbfe]">
                <p class="text-xs text-[#2563eb] font-medium mb-1">Текущая загрузка</p>
                <p class="text-xl font-bold text-gray-900">{{ recyclerStore.getTotalLoad(matchedRecycler) }} т/год</p>
              </div>
              <div class="rounded-xl p-4 border" :class="recyclerStore.getLoadPercent(matchedRecycler) >= 90 ? 'bg-red-50 border-red-200' : recyclerStore.getLoadPercent(matchedRecycler) >= 70 ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'">
                <p class="text-xs font-medium mb-1" :class="recyclerStore.getLoadPercent(matchedRecycler) >= 90 ? 'text-red-600' : recyclerStore.getLoadPercent(matchedRecycler) >= 70 ? 'text-amber-600' : 'text-green-600'">Загрузка</p>
                <p class="text-xl font-bold text-gray-900">{{ recyclerStore.getLoadPercent(matchedRecycler) }}%</p>
              </div>
            </div>

            <!-- Capacity table -->
            <table class="w-full text-sm">
              <thead>
                <tr class="text-left text-gray-500 border-b border-gray-200">
                  <th class="pb-2 font-medium">Вид отходов</th>
                  <th class="pb-2 font-medium text-right">Мощность (т/год)</th>
                  <th class="pb-2 font-medium text-right">Загрузка (т/год)</th>
                  <th class="pb-2 font-medium text-right">Свободно</th>
                  <th class="pb-2 font-medium" style="width: 140px">Загрузка</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="cap in matchedRecycler.capacities" :key="cap.wasteType" class="border-t border-gray-100">
                  <td class="py-2.5 text-gray-900">{{ getCapacityGroupLabel(cap.wasteType) }}</td>
                  <td class="py-2.5 text-right font-mono text-gray-900">{{ cap.capacityTons }}</td>
                  <td class="py-2.5 text-right font-mono text-gray-900">{{ cap.currentLoadTons }}</td>
                  <td class="py-2.5 text-right font-mono" :class="cap.capacityTons - cap.currentLoadTons <= 0 ? 'text-red-600' : 'text-green-600'">{{ Math.max(0, cap.capacityTons - cap.currentLoadTons) }}</td>
                  <td class="py-2.5">
                    <div class="flex items-center gap-2">
                      <div class="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div class="h-full rounded-full transition-all" :style="{ width: Math.min(Math.round((cap.currentLoadTons / cap.capacityTons) * 100), 100) + '%', backgroundColor: Math.round((cap.currentLoadTons / cap.capacityTons) * 100) >= 90 ? '#EF4444' : Math.round((cap.currentLoadTons / cap.capacityTons) * 100) >= 70 ? '#F59E0B' : '#10B981' }"></div>
                      </div>
                      <span class="text-xs font-medium min-w-[32px] text-right" :style="{ color: Math.round((cap.currentLoadTons / cap.capacityTons) * 100) >= 90 ? '#EF4444' : Math.round((cap.currentLoadTons / cap.capacityTons) * 100) >= 70 ? '#F59E0B' : '#10B981' }">{{ Math.round((cap.currentLoadTons / cap.capacityTons) * 100) }}%</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>
