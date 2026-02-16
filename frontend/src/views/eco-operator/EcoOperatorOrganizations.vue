<script setup lang="ts">
import { ref, computed } from 'vue'
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
  { id: 'accounts', label: 'Лицевые счета', icon: icons.money, route: '/eco-operator/accounts' },
  { id: 'analytics', label: 'Аналитика и отчёты', icon: icons.analytics, route: '/eco-operator/analytics' },
  { id: 'profile', label: 'Профили компаний', icon: icons.profile, route: '/eco-operator/profile' },
  { id: 'recyclers-registry', label: 'Реестр переработчиков', icon: icons.recycle, route: '/eco-operator/recyclers' },
])

// Organization interface
interface Organization {
  id: number
  inn: string
  okpo: string
  shortName: string
  fullName: string
  type: string
  director: string
  contactPerson: string
  phone: string
  email: string
  legalRegion: string
  legalCity: string
  legalStreet: string
  legalBuilding: string
  actualRegion: string
  actualCity: string
  actualStreet: string
  actualBuilding: string
  gpsLat: string
  gpsLng: string
  activityType: string
  licenseNumber: string
  licenseExpiry: string
  status: string
  region: string
  registeredAt: string
}

// Initial organizations data
const organizations = ref<Organization[]>([
  {
    id: 1,
    inn: '01234567891234',
    okpo: '12345678',
    shortName: 'ОсОО «ТехПром»',
    fullName: 'Общество с ограниченной ответственностью «ТехПром»',
    type: 'Плательщик РОП',
    director: 'Асанов Бакыт Кадырович',
    contactPerson: 'Иванова Мария',
    phone: '+996 312 45-67-89',
    email: 'info@techprom.kg',
    legalRegion: 'г. Бишкек',
    legalCity: 'Бишкек',
    legalStreet: 'ул. Киевская',
    legalBuilding: '45',
    actualRegion: 'г. Бишкек',
    actualCity: 'Бишкек',
    actualStreet: 'ул. Киевская',
    actualBuilding: '45',
    gpsLat: '42.8746',
    gpsLng: '74.5698',
    activityType: 'Импорт пластиковой упаковки',
    licenseNumber: 'ЛЦ-2024/0156',
    licenseExpiry: '31.12.2025',
    status: 'Активен',
    region: 'г. Бишкек',
    registeredAt: '15.03.2024',
  },
  {
    id: 2,
    inn: '01234567891235',
    okpo: '12345679',
    shortName: 'ОсОО «ЭкоПереработка»',
    fullName: 'Общество с ограниченной ответственностью «ЭкоПереработка»',
    type: 'Эко Оператор',
    director: 'Мамытов Эрлан Асанович',
    contactPerson: 'Кыдыралиева Айгуль',
    phone: '+996 312 34-56-78',
    email: 'eco@pererabotka.kg',
    legalRegion: 'г. Бишкек',
    legalCity: 'Бишкек',
    legalStreet: 'ул. Жибек Жолу',
    legalBuilding: '555',
    actualRegion: 'г. Бишкек',
    actualCity: 'Бишкек',
    actualStreet: 'ул. Жибек Жолу',
    actualBuilding: '555',
    gpsLat: '42.8612',
    gpsLng: '74.5890',
    activityType: 'Переработка пластика и бумаги',
    licenseNumber: 'ЭО-2024/0012',
    licenseExpiry: '31.12.2026',
    status: 'Активен',
    region: 'г. Бишкек',
    registeredAt: '10.02.2024',
  },
  {
    id: 3,
    inn: '01234567891236',
    okpo: '12345680',
    shortName: 'ОАО «СтройМаркет»',
    fullName: 'Открытое акционерное общество «СтройМаркет»',
    type: 'Плательщик РОП',
    director: 'Токтосунов Азамат',
    contactPerson: 'Петрова Елена',
    phone: '+996 312 23-45-67',
    email: 'stroymarket@mail.kg',
    legalRegion: 'Чуйская обл.',
    legalCity: 'Токмок',
    legalStreet: 'ул. Промышленная',
    legalBuilding: '12',
    actualRegion: 'Чуйская обл.',
    actualCity: 'Токмок',
    actualStreet: 'ул. Промышленная',
    actualBuilding: '12',
    gpsLat: '42.8412',
    gpsLng: '75.2856',
    activityType: 'Производство строительных материалов',
    licenseNumber: 'ЛЦ-2024/0089',
    licenseExpiry: '30.06.2025',
    status: 'Активен',
    region: 'Чуйская обл.',
    registeredAt: '22.01.2024',
  },
  {
    id: 4,
    inn: '01234567891237',
    okpo: '12345681',
    shortName: 'ОсОО «ПищеПром»',
    fullName: 'Общество с ограниченной ответственностью «ПищеПром»',
    type: 'Производитель',
    director: 'Сыдыков Нурлан',
    contactPerson: 'Асанова Гульмира',
    phone: '+996 3222 5-12-34',
    email: 'pisheprom@osh.kg',
    legalRegion: 'г. Ош',
    legalCity: 'Ош',
    legalStreet: 'ул. Курманжан Датки',
    legalBuilding: '78',
    actualRegion: 'г. Ош',
    actualCity: 'Ош',
    actualStreet: 'ул. Курманжан Датки',
    actualBuilding: '78',
    gpsLat: '40.5283',
    gpsLng: '72.7985',
    activityType: 'Производство продуктов питания',
    licenseNumber: 'ПР-2023/0234',
    licenseExpiry: '31.12.2024',
    status: 'Активен',
    region: 'г. Ош',
    registeredAt: '05.01.2024',
  },
  {
    id: 5,
    inn: '01234567891238',
    okpo: '12345682',
    shortName: 'ИП Асанов Б.К.',
    fullName: 'Индивидуальный предприниматель Асанов Бакыт Кадырович',
    type: 'Плательщик РОП',
    director: 'Асанов Бакыт Кадырович',
    contactPerson: 'Асанов Бакыт',
    phone: '+996 555 12-34-56',
    email: 'asanov.bk@gmail.com',
    legalRegion: 'г. Бишкек',
    legalCity: 'Бишкек',
    legalStreet: 'ул. Московская',
    legalBuilding: '234',
    actualRegion: 'г. Бишкек',
    actualCity: 'Бишкек',
    actualStreet: 'ул. Московская',
    actualBuilding: '234',
    gpsLat: '42.8821',
    gpsLng: '74.5823',
    activityType: 'Торговля товарами',
    licenseNumber: '',
    licenseExpiry: '',
    status: 'На проверке',
    region: 'г. Бишкек',
    registeredAt: '20.01.2025',
  },
  {
    id: 6,
    inn: '01234567891239',
    okpo: '12345683',
    shortName: 'ОсОО «ГринРесайкл»',
    fullName: 'Общество с ограниченной ответственностью «ГринРесайкл»',
    type: 'Переработчик',
    director: 'Касымова Динара',
    contactPerson: 'Омуров Талант',
    phone: '+996 3922 5-67-89',
    email: 'green@recycle.kg',
    legalRegion: 'Иссык-Кульская обл.',
    legalCity: 'Каракол',
    legalStreet: 'ул. Гебзе',
    legalBuilding: '23',
    actualRegion: 'Иссык-Кульская обл.',
    actualCity: 'Каракол',
    actualStreet: 'ул. Гебзе',
    actualBuilding: '23',
    gpsLat: '42.4901',
    gpsLng: '78.3923',
    activityType: 'Переработка стекла',
    licenseNumber: 'ЛЦ-2023/0145',
    licenseExpiry: '31.12.2025',
    status: 'Активен',
    region: 'Иссык-Кульская обл.',
    registeredAt: '18.12.2023',
  },
])

// Filters
const searchQuery = ref('')
const filterType = ref('')
const filterRegion = ref('')
const filterStatus = ref('')

// Modals
const showViewModal = ref(false)
const showEditModal = ref(false)
const showDeleteConfirm = ref(false)
const showNotification = ref(false)
const notificationMessage = ref('')

// Selected/editing organization
const selectedOrg = ref<Organization | null>(null)
const isCreating = ref(false)

// Form data
const emptyForm = (): Organization => ({
  id: 0,
  inn: '',
  okpo: '',
  shortName: '',
  fullName: '',
  type: 'Плательщик РОП',
  director: '',
  contactPerson: '',
  phone: '',
  email: '',
  legalRegion: '',
  legalCity: '',
  legalStreet: '',
  legalBuilding: '',
  actualRegion: '',
  actualCity: '',
  actualStreet: '',
  actualBuilding: '',
  gpsLat: '',
  gpsLng: '',
  activityType: '',
  licenseNumber: '',
  licenseExpiry: '',
  status: 'На проверке',
  region: '',
  registeredAt: new Date().toLocaleDateString('ru-RU'),
})

const formData = ref<Organization>(emptyForm())

// Filtered organizations
const filteredOrganizations = computed(() => {
  return organizations.value.filter(org => {
    const matchesSearch = !searchQuery.value ||
      org.inn.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      org.shortName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      org.fullName.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesType = !filterType.value || org.type === filterType.value
    const matchesRegion = !filterRegion.value || org.region === filterRegion.value
    const matchesStatus = !filterStatus.value || org.status === filterStatus.value
    return matchesSearch && matchesType && matchesRegion && matchesStatus
  })
})

// Stats
const stats = computed(() => ({
  total: organizations.value.length,
  payers: organizations.value.filter(o => o.type === 'Плательщик РОП').length,
  ecoOperators: organizations.value.filter(o => o.type === 'Эко Оператор').length,
  recyclers: organizations.value.filter(o => o.type === 'Переработчик').length,
  producers: organizations.value.filter(o => o.type === 'Производитель').length,
  pending: organizations.value.filter(o => o.status === 'На проверке').length,
}))

// Regions list
const regions = ['г. Бишкек', 'г. Ош', 'Чуйская обл.', 'Ошская обл.', 'Джалал-Абадская обл.', 'Иссык-Кульская обл.', 'Нарынская обл.', 'Таласская обл.', 'Баткенская обл.']

// Organization types
const orgTypes = ['Плательщик РОП', 'Эко Оператор', 'Переработчик', 'Производитель']

// Statuses
const statuses = ['Активен', 'На проверке', 'Приостановлен']

// Status classes
const getStatusClass = (status: string) => {
  switch (status) {
    case 'Активен': return 'bg-green-100 text-green-800'
    case 'На проверке': return 'bg-yellow-100 text-yellow-800'
    case 'Приостановлен': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

// Type classes
const getTypeClass = (type: string) => {
  switch (type) {
    case 'Плательщик РОП': return 'bg-blue-100 text-blue-800'
    case 'Эко Оператор': return 'bg-teal-100 text-teal-800'
    case 'Переработчик': return 'bg-green-100 text-green-800'
    case 'Производитель': return 'bg-purple-100 text-purple-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

// Actions
const openView = (org: Organization) => {
  selectedOrg.value = org
  showViewModal.value = true
}

const openEdit = (org: Organization) => {
  isCreating.value = false
  formData.value = { ...org }
  showEditModal.value = true
}

const openCreate = () => {
  isCreating.value = true
  formData.value = emptyForm()
  formData.value.id = Math.max(...organizations.value.map(o => o.id)) + 1
  showEditModal.value = true
}

const openDelete = (org: Organization) => {
  selectedOrg.value = org
  showDeleteConfirm.value = true
}

const saveOrganization = () => {
  if (isCreating.value) {
    organizations.value.push({ ...formData.value })
    showNotification.value = true
    notificationMessage.value = 'Организация успешно создана'
  } else {
    const index = organizations.value.findIndex(o => o.id === formData.value.id)
    if (index !== -1) {
      organizations.value[index] = { ...formData.value }
    }
    showNotification.value = true
    notificationMessage.value = 'Данные организации обновлены'
  }
  showEditModal.value = false
  setTimeout(() => { showNotification.value = false }, 3000)
}

const deleteOrganization = () => {
  if (selectedOrg.value) {
    organizations.value = organizations.value.filter(o => o.id !== selectedOrg.value!.id)
    showDeleteConfirm.value = false
    showNotification.value = true
    notificationMessage.value = 'Организация удалена'
    setTimeout(() => { showNotification.value = false }, 3000)
  }
}

const copyLegalToActual = () => {
  formData.value.actualRegion = formData.value.legalRegion
  formData.value.actualCity = formData.value.legalCity
  formData.value.actualStreet = formData.value.legalStreet
  formData.value.actualBuilding = formData.value.legalBuilding
}
</script>

<template>
  <DashboardLayout
    role="eco-operator"
    roleTitle="Экологический оператор"
    userName="Нуркулов Алмаз"
    :menuItems="menuItems"
  >
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl lg:text-3xl font-bold text-gray-900">Организации</h1>
          <p class="text-gray-600 mt-1">Реестр зарегистрированных организаций</p>
        </div>
        <button
          @click="openCreate"
          class="flex items-center gap-2 px-5 py-2.5 bg-sky-600 text-white rounded-xl font-medium hover:bg-sky-700 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Добавить организацию
        </button>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <p class="text-sm text-gray-500 mb-1">Всего</p>
          <p class="text-2xl font-bold text-gray-900">{{ stats.total }}</p>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <p class="text-sm text-gray-500 mb-1">Плательщики РОП</p>
          <p class="text-2xl font-bold text-blue-600">{{ stats.payers }}</p>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <p class="text-sm text-gray-500 mb-1">Эко Операторы</p>
          <p class="text-2xl font-bold text-teal-600">{{ stats.ecoOperators }}</p>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <p class="text-sm text-gray-500 mb-1">Переработчики</p>
          <p class="text-2xl font-bold text-green-600">{{ stats.recyclers }}</p>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <p class="text-sm text-gray-500 mb-1">Производители</p>
          <p class="text-2xl font-bold text-purple-600">{{ stats.producers }}</p>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <p class="text-sm text-gray-500 mb-1">На проверке</p>
          <p class="text-2xl font-bold text-yellow-600">{{ stats.pending }}</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div class="flex flex-wrap gap-4">
          <div class="flex-1 min-w-[200px]">
            <div class="relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Поиск по ИНН или названию..."
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
          </div>
          <select v-model="filterType" class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500">
            <option value="">Все типы</option>
            <option v-for="t in orgTypes" :key="t" :value="t">{{ t }}</option>
          </select>
          <select v-model="filterRegion" class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500">
            <option value="">Все регионы</option>
            <option v-for="r in regions" :key="r" :value="r">{{ r }}</option>
          </select>
          <select v-model="filterStatus" class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500">
            <option value="">Все статусы</option>
            <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ИНН</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Наименование</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Тип</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Регион</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Дата рег.</th>
                <th class="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Статус</th>
                <th class="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Действия</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="org in filteredOrganizations" :key="org.id" class="hover:bg-gray-50">
                <td class="px-6 py-4">
                  <span class="font-mono text-sm text-gray-600">{{ org.inn }}</span>
                </td>
                <td class="px-6 py-4">
                  <span class="font-medium text-gray-900">{{ org.shortName }}</span>
                </td>
                <td class="px-6 py-4">
                  <span :class="['px-3 py-1 rounded-full text-xs font-medium', getTypeClass(org.type)]">
                    {{ org.type }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-600">{{ org.region }}</td>
                <td class="px-6 py-4 text-sm text-gray-600">{{ org.registeredAt }}</td>
                <td class="px-6 py-4 text-center">
                  <span :class="['px-3 py-1 rounded-full text-xs font-medium', getStatusClass(org.status)]">
                    {{ org.status }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center justify-center gap-2">
                    <button @click="openView(org)" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#3B82F6] text-white hover:bg-[#2563EB] transition-colors shadow-sm">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      Просмотреть
                    </button>
                    <button @click="openEdit(org)" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#F59E0B] text-white hover:bg-[#D97706] transition-colors shadow-sm">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      Редактировать
                    </button>
                    <button @click="openDelete(org)" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#EF4444] text-white hover:bg-[#DC2626] transition-colors shadow-sm">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      Удалить
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty state -->
        <div v-if="filteredOrganizations.length === 0" class="p-12 text-center">
          <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h3 class="text-lg font-medium text-gray-900 mb-1">Организации не найдены</h3>
          <p class="text-gray-500">Попробуйте изменить параметры поиска</p>
        </div>
      </div>
    </div>

    <!-- View Modal -->
    <Teleport to="body">
      <div v-if="showViewModal && selectedOrg" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
            <h3 class="text-lg font-semibold text-gray-900">Информация об организации</h3>
            <button @click="showViewModal = false" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="p-6 space-y-6">
            <!-- Header info -->
            <div class="flex items-start gap-4">
              <div class="w-16 h-16 bg-sky-100 rounded-xl flex items-center justify-center">
                <svg class="w-8 h-8 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div class="flex-1">
                <h4 class="text-xl font-bold text-gray-900">{{ selectedOrg.shortName }}</h4>
                <p class="text-gray-500 text-sm">{{ selectedOrg.fullName }}</p>
                <div class="flex items-center gap-2 mt-2">
                  <span :class="['px-3 py-1 rounded-full text-xs font-medium', getTypeClass(selectedOrg.type)]">{{ selectedOrg.type }}</span>
                  <span :class="['px-3 py-1 rounded-full text-xs font-medium', getStatusClass(selectedOrg.status)]">{{ selectedOrg.status }}</span>
                </div>
              </div>
            </div>

            <!-- Details grid -->
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-gray-50 rounded-xl p-4">
                <p class="text-sm text-gray-500 mb-1">ИНН</p>
                <p class="font-mono font-medium text-gray-900">{{ selectedOrg.inn }}</p>
              </div>
              <div class="bg-gray-50 rounded-xl p-4">
                <p class="text-sm text-gray-500 mb-1">ОКПО</p>
                <p class="font-mono font-medium text-gray-900">{{ selectedOrg.okpo }}</p>
              </div>
              <div class="bg-gray-50 rounded-xl p-4">
                <p class="text-sm text-gray-500 mb-1">Руководитель</p>
                <p class="font-medium text-gray-900">{{ selectedOrg.director }}</p>
              </div>
              <div class="bg-gray-50 rounded-xl p-4">
                <p class="text-sm text-gray-500 mb-1">Контактное лицо</p>
                <p class="font-medium text-gray-900">{{ selectedOrg.contactPerson }}</p>
              </div>
              <div class="bg-gray-50 rounded-xl p-4">
                <p class="text-sm text-gray-500 mb-1">Телефон</p>
                <p class="font-medium text-gray-900">{{ selectedOrg.phone }}</p>
              </div>
              <div class="bg-gray-50 rounded-xl p-4">
                <p class="text-sm text-gray-500 mb-1">Email</p>
                <p class="font-medium text-gray-900">{{ selectedOrg.email }}</p>
              </div>
            </div>

            <!-- Addresses -->
            <div class="space-y-4">
              <div class="bg-gray-50 rounded-xl p-4">
                <p class="text-sm text-gray-500 mb-1">Юридический адрес</p>
                <p class="font-medium text-gray-900">{{ selectedOrg.legalRegion }}, {{ selectedOrg.legalCity }}, {{ selectedOrg.legalStreet }}, {{ selectedOrg.legalBuilding }}</p>
              </div>
              <div class="bg-gray-50 rounded-xl p-4">
                <p class="text-sm text-gray-500 mb-1">Фактический адрес</p>
                <p class="font-medium text-gray-900">{{ selectedOrg.actualRegion }}, {{ selectedOrg.actualCity }}, {{ selectedOrg.actualStreet }}, {{ selectedOrg.actualBuilding }}</p>
              </div>
              <div class="bg-gray-50 rounded-xl p-4">
                <p class="text-sm text-gray-500 mb-1">GPS координаты</p>
                <p class="font-mono font-medium text-gray-900">{{ selectedOrg.gpsLat }}, {{ selectedOrg.gpsLng }}</p>
              </div>
            </div>

            <!-- Activity & License -->
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-gray-50 rounded-xl p-4">
                <p class="text-sm text-gray-500 mb-1">Вид деятельности</p>
                <p class="font-medium text-gray-900">{{ selectedOrg.activityType }}</p>
              </div>
              <div class="bg-gray-50 rounded-xl p-4">
                <p class="text-sm text-gray-500 mb-1">Дата регистрации</p>
                <p class="font-medium text-gray-900">{{ selectedOrg.registeredAt }}</p>
              </div>
              <div class="bg-gray-50 rounded-xl p-4">
                <p class="text-sm text-gray-500 mb-1">Номер лицензии</p>
                <p class="font-mono font-medium text-gray-900">{{ selectedOrg.licenseNumber || '—' }}</p>
              </div>
              <div class="bg-gray-50 rounded-xl p-4">
                <p class="text-sm text-gray-500 mb-1">Срок действия лицензии</p>
                <p class="font-medium text-gray-900">{{ selectedOrg.licenseExpiry || '—' }}</p>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex gap-3 pt-4 border-t border-gray-200">
              <button
                @click="showViewModal = false; openEdit(selectedOrg)"
                class="flex-1 px-4 py-2 bg-sky-600 text-white rounded-lg font-medium hover:bg-sky-700 transition-colors"
              >
                Редактировать
              </button>
              <button
                @click="showViewModal = false"
                class="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Edit/Create Modal -->
    <Teleport to="body">
      <div v-if="showEditModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ isCreating ? 'Новая организация' : 'Редактирование организации' }}
            </h3>
            <button @click="showEditModal = false" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="p-6 space-y-6">
            <!-- Basic info -->
            <div>
              <h4 class="text-sm font-semibold text-gray-700 uppercase mb-4">Основная информация</h4>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">ИНН *</label>
                  <input v-model="formData.inn" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">ОКПО</label>
                  <input v-model="formData.okpo" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Тип организации *</label>
                  <select v-model="formData.type" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500">
                    <option v-for="t in orgTypes" :key="t" :value="t">{{ t }}</option>
                  </select>
                </div>
                <div class="md:col-span-3">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Краткое наименование *</label>
                  <input v-model="formData.shortName" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500" />
                </div>
                <div class="md:col-span-3">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Полное наименование *</label>
                  <input v-model="formData.fullName" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500" />
                </div>
              </div>
            </div>

            <!-- Contact info -->
            <div>
              <h4 class="text-sm font-semibold text-gray-700 uppercase mb-4">Контактная информация</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Руководитель (ФИО) *</label>
                  <input v-model="formData.director" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Контактное лицо</label>
                  <input v-model="formData.contactPerson" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Телефон *</label>
                  <input v-model="formData.phone" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input v-model="formData.email" type="email" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500" />
                </div>
              </div>
            </div>

            <!-- Legal address -->
            <div>
              <h4 class="text-sm font-semibold text-gray-700 uppercase mb-4">Юридический адрес</h4>
              <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Область/город *</label>
                  <select v-model="formData.legalRegion" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500">
                    <option value="">Выберите</option>
                    <option v-for="r in regions" :key="r" :value="r">{{ r }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Город/село</label>
                  <input v-model="formData.legalCity" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Улица</label>
                  <input v-model="formData.legalStreet" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Дом</label>
                  <input v-model="formData.legalBuilding" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500" />
                </div>
              </div>
            </div>

            <!-- Actual address -->
            <div>
              <div class="flex items-center justify-between mb-4">
                <h4 class="text-sm font-semibold text-gray-700 uppercase">Фактический адрес</h4>
                <button @click="copyLegalToActual" type="button" class="text-sm text-sky-600 hover:text-sky-700">
                  Скопировать из юридического
                </button>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Область/город</label>
                  <select v-model="formData.actualRegion" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500">
                    <option value="">Выберите</option>
                    <option v-for="r in regions" :key="r" :value="r">{{ r }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Город/село</label>
                  <input v-model="formData.actualCity" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Улица</label>
                  <input v-model="formData.actualStreet" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Дом</label>
                  <input v-model="formData.actualBuilding" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500" />
                </div>
              </div>
            </div>

            <!-- GPS -->
            <div>
              <h4 class="text-sm font-semibold text-gray-700 uppercase mb-4">GPS координаты (для ГИС-карты)</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Широта (Latitude)</label>
                  <input v-model="formData.gpsLat" type="text" placeholder="42.8746" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Долгота (Longitude)</label>
                  <input v-model="formData.gpsLng" type="text" placeholder="74.5698" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500" />
                </div>
              </div>
            </div>

            <!-- Activity & License -->
            <div>
              <h4 class="text-sm font-semibold text-gray-700 uppercase mb-4">Деятельность и лицензия</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Вид деятельности</label>
                  <input v-model="formData.activityType" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Номер лицензии</label>
                  <input v-model="formData.licenseNumber" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Срок действия лицензии</label>
                  <input v-model="formData.licenseExpiry" type="text" placeholder="31.12.2025" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Регион (для фильтрации)</label>
                  <select v-model="formData.region" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500">
                    <option value="">Выберите</option>
                    <option v-for="r in regions" :key="r" :value="r">{{ r }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Статус *</label>
                  <select v-model="formData.status" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500">
                    <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex gap-3 pt-4 border-t border-gray-200">
              <button
                @click="saveOrganization"
                class="flex-1 px-4 py-2.5 bg-sky-600 text-white rounded-lg font-medium hover:bg-sky-700 transition-colors"
              >
                {{ isCreating ? 'Создать' : 'Сохранить' }}
              </button>
              <button
                @click="showEditModal = false"
                class="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Delete Confirmation -->
    <Teleport to="body">
      <div v-if="showDeleteConfirm && selectedOrg" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
          <div class="text-center">
            <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Удалить организацию?</h3>
            <p class="text-gray-500 mb-6">
              Вы уверены, что хотите удалить организацию <strong>{{ selectedOrg.shortName }}</strong>? Это действие нельзя отменить.
            </p>
            <div class="flex gap-3">
              <button
                @click="deleteOrganization"
                class="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Удалить
              </button>
              <button
                @click="showDeleteConfirm = false"
                class="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Notification -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="transform translate-y-2 opacity-0"
        enter-to-class="transform translate-y-0 opacity-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="transform translate-y-0 opacity-100"
        leave-to-class="transform translate-y-2 opacity-0"
      >
        <div v-if="showNotification" class="fixed bottom-6 right-6 z-50">
          <div class="bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span class="font-medium">{{ notificationMessage }}</span>
          </div>
        </div>
      </Transition>
    </Teleport>
  </DashboardLayout>
</template>
