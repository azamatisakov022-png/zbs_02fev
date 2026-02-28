<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import { AppButton, AppBadge } from '../../components/ui'
import { getStatusBadgeVariant } from '../../utils/statusVariant'
import { useEcoOperatorMenu } from '../../composables/useRoleMenu'
import { productGroups } from '../../data/product-groups'
import SectionGuide from '../../components/common/SectionGuide.vue'

const { t } = useI18n()
const { roleTitle, menuItems } = useEcoOperatorMenu()

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
  productGroupValues?: string[]
}

const getProductGroupLabel = (value: string) => {
  return productGroups.find(g => g.value === value)?.label || value
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
    status: 'active',
    region: 'г. Бишкек',
    registeredAt: '15.03.2024',
    productGroupValues: ['group_6', 'group_7', 'group_9', 'group_10', 'group_15', 'group_16'],
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
    status: 'active',
    region: 'г. Бишкек',
    registeredAt: '10.02.2024',
    productGroupValues: ['group_1', 'group_2', 'group_6', 'group_19', 'group_22'],
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
    status: 'active',
    region: 'Чуйская обл.',
    registeredAt: '22.01.2024',
    productGroupValues: ['group_4', 'group_5', 'group_8', 'group_24'],
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
    status: 'active',
    region: 'г. Ош',
    registeredAt: '05.01.2024',
    productGroupValues: ['group_19', 'group_20', 'group_21', 'group_22', 'group_23'],
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
    status: 'under_review',
    region: 'г. Бишкек',
    registeredAt: '20.01.2025',
    productGroupValues: ['group_3', 'group_6', 'group_7'],
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
    status: 'active',
    region: 'Иссык-Кульская обл.',
    registeredAt: '18.12.2023',
    productGroupValues: ['group_8', 'group_24'],
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
  status: 'under_review',
  region: '',
  registeredAt: new Date().toLocaleDateString(),
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
  pending: organizations.value.filter(o => o.status === 'under_review').length,
}))

// Regions list
const regions = ['г. Бишкек', 'г. Ош', 'Чуйская обл.', 'Ошская обл.', 'Джалал-Абадская обл.', 'Иссык-Кульская обл.', 'Нарынская обл.', 'Таласская обл.', 'Баткенская обл.']

// Organization types
const orgTypes = ['Плательщик РОП', 'Эко Оператор', 'Переработчик', 'Производитель']

const orgTypeLabels = computed<Record<string, string>>(() => ({
  'Плательщик РОП': t('ecoOrganizations.typePayer'),
  'Эко Оператор': t('ecoOrganizations.typeEcoOperator'),
  'Переработчик': t('ecoOrganizations.typeRecycler'),
  'Производитель': t('ecoOrganizations.typeProducer'),
}))

const getOrgTypeLabel = (type: string): string => orgTypeLabels.value[type] || type

// Statuses
const statuses = ['active', 'under_review', 'suspended']
const statusLabels = computed<Record<string, string>>(() => ({
  active: t('ecoOrganizations.statusActive'),
  under_review: t('ecoOrganizations.statusUnderReview'),
  suspended: t('ecoOrganizations.statusSuspended'),
}))

// Status classes
const getStatusClass = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800'
    case 'under_review': return 'bg-yellow-100 text-yellow-800'
    case 'suspended': return 'bg-red-100 text-red-800'
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
    notificationMessage.value = t('ecoOrganizations.orgCreated')
  } else {
    const index = organizations.value.findIndex(o => o.id === formData.value.id)
    if (index !== -1) {
      organizations.value[index] = { ...formData.value }
    }
    showNotification.value = true
    notificationMessage.value = t('ecoOrganizations.orgUpdated')
  }
  showEditModal.value = false
  setTimeout(() => { showNotification.value = false }, 3000)
}

const deleteOrganization = () => {
  if (selectedOrg.value) {
    organizations.value = organizations.value.filter(o => o.id !== selectedOrg.value!.id)
    showDeleteConfirm.value = false
    showNotification.value = true
    notificationMessage.value = t('ecoOrganizations.orgDeleted')
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
    :roleTitle="roleTitle"
    userName="Нуркулов Алмаз"
    :menuItems="menuItems"
  >
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl lg:text-3xl font-bold text-gray-900">{{ $t('pages.ecoOperator.organizationsTitle') }}</h1>
          <p class="text-gray-600 mt-1">{{ $t('pages.ecoOperator.organizationsSubtitle') }}</p>
        </div>
        <AppButton variant="primary" @click="openCreate">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          {{ $t('ecoOrganizations.addOrganization') }}
        </AppButton>
      </div>

      <SectionGuide
        :title="$t('ecoOrganizations.guideTitle')"
        :description="$t('ecoOrganizations.guideDescription')"
        :actions="[$t('ecoOrganizations.guideAction1'), $t('ecoOrganizations.guideAction2'), $t('ecoOrganizations.guideAction3')]"
        storageKey="eco-companies"
      />

      <!-- Stats -->
      <div class="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <p class="text-sm text-gray-500 mb-1">{{ $t('ecoOrganizations.statsTotal') }}</p>
          <p class="text-2xl font-bold text-gray-900">{{ stats.total }}</p>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <p class="text-sm text-gray-500 mb-1">{{ $t('ecoOrganizations.statsPayers') }}</p>
          <p class="text-2xl font-bold text-blue-600">{{ stats.payers }}</p>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <p class="text-sm text-gray-500 mb-1">{{ $t('ecoOrganizations.statsEcoOperators') }}</p>
          <p class="text-2xl font-bold text-teal-600">{{ stats.ecoOperators }}</p>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <p class="text-sm text-gray-500 mb-1">{{ $t('ecoOrganizations.statsRecyclers') }}</p>
          <p class="text-2xl font-bold text-green-600">{{ stats.recyclers }}</p>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <p class="text-sm text-gray-500 mb-1">{{ $t('ecoOrganizations.statsProducers') }}</p>
          <p class="text-2xl font-bold text-purple-600">{{ stats.producers }}</p>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <p class="text-sm text-gray-500 mb-1">{{ $t('ecoOrganizations.statsUnderReview') }}</p>
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
                :placeholder="$t('ecoOrganizations.searchPlaceholder')"
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
          </div>
          <select v-model="filterType" class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500">
            <option value="">{{ $t('ecoOrganizations.allTypes') }}</option>
            <option v-for="ot in orgTypes" :key="ot" :value="ot">{{ getOrgTypeLabel(ot) }}</option>
          </select>
          <select v-model="filterRegion" class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500">
            <option value="">{{ $t('ecoOrganizations.allRegions') }}</option>
            <option v-for="r in regions" :key="r" :value="r">{{ r }}</option>
          </select>
          <select v-model="filterStatus" class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500">
            <option value="">{{ $t('ecoOrganizations.allStatuses') }}</option>
            <option v-for="s in statuses" :key="s" :value="s">{{ statusLabels[s] || s }}</option>
          </select>
        </div>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{{ $t('ecoOrganizations.thInn') }}</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{{ $t('ecoOrganizations.thName') }}</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{{ $t('ecoOrganizations.thType') }}</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{{ $t('ecoOrganizations.thProductTypes') }}</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{{ $t('ecoOrganizations.thRegion') }}</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{{ $t('ecoOrganizations.thRegDate') }}</th>
                <th class="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{{ $t('ecoOrganizations.thStatus') }}</th>
                <th class="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{{ $t('ecoOrganizations.thActions') }}</th>
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
                  <AppBadge :variant="getStatusBadgeVariant(org.type)">{{ org.type }}</AppBadge>
                </td>
                <td class="px-6 py-4">
                  <div v-if="org.productGroupValues && org.productGroupValues.length > 0" class="flex flex-wrap gap-1 max-w-[260px]">
                    <span
                      v-for="gv in org.productGroupValues.slice(0, 2)"
                      :key="gv"
                      class="inline-block px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap"
                    >
                      {{ getProductGroupLabel(gv).replace(/^\d+\.\s*/, '') }}
                    </span>
                    <span
                      v-if="org.productGroupValues.length > 2"
                      class="inline-block px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-500 whitespace-nowrap"
                    >
                      +{{ org.productGroupValues.length - 2 }} {{ $t('ecoOrganizations.more') }}
                    </span>
                  </div>
                  <span v-else class="text-sm text-gray-400">—</span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-600">{{ org.region }}</td>
                <td class="px-6 py-4 text-sm text-gray-600">{{ org.registeredAt }}</td>
                <td class="px-6 py-4 text-center">
                  <AppBadge :variant="getStatusBadgeVariant(org.status)">{{ org.status }}</AppBadge>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center justify-center gap-2">
                    <AppButton variant="ghost" size="sm" @click="openView(org)">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      {{ $t('common.view') }}
                    </AppButton>
                    <AppButton variant="secondary" size="sm" @click="openEdit(org)">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      {{ $t('common.edit') }}
                    </AppButton>
                    <AppButton variant="danger" size="sm" @click="openDelete(org)">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      {{ $t('common.delete') }}
                    </AppButton>
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
          <h3 class="text-lg font-medium text-gray-900 mb-1">{{ $t('ecoOrganizations.orgsNotFound') }}</h3>
          <p class="text-gray-500">{{ $t('ecoOrganizations.tryChangeSearch') }}</p>
        </div>
      </div>
    </div>

    <!-- View Modal -->
    <Teleport to="body">
      <div v-if="showViewModal && selectedOrg" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
            <h3 class="text-lg font-semibold text-gray-900">{{ $t('ecoOrganizations.orgInfo') }}</h3>
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
                  <AppBadge :variant="getStatusBadgeVariant(selectedOrg.type)">{{ selectedOrg.type }}</AppBadge>
                  <AppBadge :variant="getStatusBadgeVariant(selectedOrg.status)">{{ selectedOrg.status }}</AppBadge>
                </div>
              </div>
            </div>

            <!-- Details grid -->
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-gray-50 rounded-xl p-4">
                <p class="text-sm text-gray-500 mb-1">{{ $t('ecoOrganizations.inn') }}</p>
                <p class="font-mono font-medium text-gray-900">{{ selectedOrg.inn }}</p>
              </div>
              <div class="bg-gray-50 rounded-xl p-4">
                <p class="text-sm text-gray-500 mb-1">{{ $t('ecoOrganizations.okpo') }}</p>
                <p class="font-mono font-medium text-gray-900">{{ selectedOrg.okpo }}</p>
              </div>
              <div class="bg-gray-50 rounded-xl p-4">
                <p class="text-sm text-gray-500 mb-1">{{ $t('ecoOrganizations.director') }}</p>
                <p class="font-medium text-gray-900">{{ selectedOrg.director }}</p>
              </div>
              <div class="bg-gray-50 rounded-xl p-4">
                <p class="text-sm text-gray-500 mb-1">{{ $t('ecoOrganizations.contactPerson') }}</p>
                <p class="font-medium text-gray-900">{{ selectedOrg.contactPerson }}</p>
              </div>
              <div class="bg-gray-50 rounded-xl p-4">
                <p class="text-sm text-gray-500 mb-1">{{ $t('ecoOrganizations.phone') }}</p>
                <p class="font-medium text-gray-900">{{ selectedOrg.phone }}</p>
              </div>
              <div class="bg-gray-50 rounded-xl p-4">
                <p class="text-sm text-gray-500 mb-1">{{ $t('ecoOrganizations.email') }}</p>
                <p class="font-medium text-gray-900">{{ selectedOrg.email }}</p>
              </div>
            </div>

            <!-- Addresses -->
            <div class="space-y-4">
              <div class="bg-gray-50 rounded-xl p-4">
                <p class="text-sm text-gray-500 mb-1">{{ $t('ecoOrganizations.legalAddress') }}</p>
                <p class="font-medium text-gray-900">{{ selectedOrg.legalRegion }}, {{ selectedOrg.legalCity }}, {{ selectedOrg.legalStreet }}, {{ selectedOrg.legalBuilding }}</p>
              </div>
              <div class="bg-gray-50 rounded-xl p-4">
                <p class="text-sm text-gray-500 mb-1">{{ $t('ecoOrganizations.actualAddress') }}</p>
                <p class="font-medium text-gray-900">{{ selectedOrg.actualRegion }}, {{ selectedOrg.actualCity }}, {{ selectedOrg.actualStreet }}, {{ selectedOrg.actualBuilding }}</p>
              </div>
              <div class="bg-gray-50 rounded-xl p-4">
                <p class="text-sm text-gray-500 mb-1">{{ $t('ecoOrganizations.gpsCoordinates') }}</p>
                <p class="font-mono font-medium text-gray-900">{{ selectedOrg.gpsLat }}, {{ selectedOrg.gpsLng }}</p>
              </div>
            </div>

            <!-- Activity & License -->
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-gray-50 rounded-xl p-4">
                <p class="text-sm text-gray-500 mb-1">{{ $t('ecoOrganizations.activityType') }}</p>
                <p class="font-medium text-gray-900">{{ selectedOrg.activityType }}</p>
              </div>
              <div class="bg-gray-50 rounded-xl p-4">
                <p class="text-sm text-gray-500 mb-1">{{ $t('ecoOrganizations.registrationDate') }}</p>
                <p class="font-medium text-gray-900">{{ selectedOrg.registeredAt }}</p>
              </div>
              <div class="bg-gray-50 rounded-xl p-4">
                <p class="text-sm text-gray-500 mb-1">{{ $t('ecoOrganizations.licenseNumber') }}</p>
                <p class="font-mono font-medium text-gray-900">{{ selectedOrg.licenseNumber || '—' }}</p>
              </div>
              <div class="bg-gray-50 rounded-xl p-4">
                <p class="text-sm text-gray-500 mb-1">{{ $t('ecoOrganizations.licenseExpiry') }}</p>
                <p class="font-medium text-gray-900">{{ selectedOrg.licenseExpiry || '—' }}</p>
              </div>
            </div>

            <!-- Product Groups -->
            <div v-if="selectedOrg.productGroupValues && selectedOrg.productGroupValues.length > 0">
              <p class="text-sm font-semibold text-gray-700 mb-2">{{ $t('ecoOrganizations.productTypes') }}</p>
              <div class="flex flex-wrap gap-1.5">
                <span
                  v-for="gv in selectedOrg.productGroupValues"
                  :key="gv"
                  class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"
                >
                  {{ getProductGroupLabel(gv) }}
                </span>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex gap-3 pt-4 border-t border-gray-200">
              <AppButton
                variant="primary"
                class="flex-1"
                @click="showViewModal = false; openEdit(selectedOrg)"
              >
                {{ $t('common.edit') }}
              </AppButton>
              <AppButton
                variant="secondary"
                class="flex-1"
                @click="showViewModal = false"
              >
                {{ $t('common.close') }}
              </AppButton>
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
              {{ isCreating ? $t('ecoOrganizations.newOrganization') : $t('ecoOrganizations.editOrganization') }}
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
              <h4 class="text-sm font-semibold text-gray-700 uppercase mb-4">{{ $t('ecoOrganizations.basicInfo') }}</h4>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('ecoOrganizations.inn') }} *</label>
                  <input v-model="formData.inn" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('ecoOrganizations.okpo') }}</label>
                  <input v-model="formData.okpo" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('ecoOrganizations.orgType') }} *</label>
                  <select v-model="formData.type" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500">
                    <option v-for="ot in orgTypes" :key="ot" :value="ot">{{ getOrgTypeLabel(ot) }}</option>
                  </select>
                </div>
                <div class="md:col-span-3">
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('ecoOrganizations.shortName') }} *</label>
                  <input v-model="formData.shortName" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500" />
                </div>
                <div class="md:col-span-3">
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('ecoOrganizations.fullName') }} *</label>
                  <input v-model="formData.fullName" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500" />
                </div>
              </div>
            </div>

            <!-- Contact info -->
            <div>
              <h4 class="text-sm font-semibold text-gray-700 uppercase mb-4">{{ $t('ecoOrganizations.contactInfo') }}</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('ecoOrganizations.directorFio') }} *</label>
                  <input v-model="formData.director" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('ecoOrganizations.contactPerson') }}</label>
                  <input v-model="formData.contactPerson" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('ecoOrganizations.phone') }} *</label>
                  <input v-model="formData.phone" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('ecoOrganizations.email') }} *</label>
                  <input v-model="formData.email" type="email" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500" />
                </div>
              </div>
            </div>

            <!-- Legal address -->
            <div>
              <h4 class="text-sm font-semibold text-gray-700 uppercase mb-4">{{ $t('ecoOrganizations.legalAddress') }}</h4>
              <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('ecoOrganizations.regionCity') }} *</label>
                  <select v-model="formData.legalRegion" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500">
                    <option value="">{{ $t('ecoOrganizations.select') }}</option>
                    <option v-for="r in regions" :key="r" :value="r">{{ r }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('ecoOrganizations.cityVillage') }}</label>
                  <input v-model="formData.legalCity" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('ecoOrganizations.street') }}</label>
                  <input v-model="formData.legalStreet" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('ecoOrganizations.building') }}</label>
                  <input v-model="formData.legalBuilding" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500" />
                </div>
              </div>
            </div>

            <!-- Actual address -->
            <div>
              <div class="flex items-center justify-between mb-4">
                <h4 class="text-sm font-semibold text-gray-700 uppercase">{{ $t('ecoOrganizations.actualAddress') }}</h4>
                <button @click="copyLegalToActual" type="button" class="text-sm text-sky-600 hover:text-sky-700">
                  {{ $t('ecoOrganizations.copyFromLegal') }}
                </button>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('ecoOrganizations.regionCity') }}</label>
                  <select v-model="formData.actualRegion" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500">
                    <option value="">{{ $t('ecoOrganizations.select') }}</option>
                    <option v-for="r in regions" :key="r" :value="r">{{ r }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('ecoOrganizations.cityVillage') }}</label>
                  <input v-model="formData.actualCity" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('ecoOrganizations.street') }}</label>
                  <input v-model="formData.actualStreet" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('ecoOrganizations.building') }}</label>
                  <input v-model="formData.actualBuilding" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500" />
                </div>
              </div>
            </div>

            <!-- GPS -->
            <div>
              <h4 class="text-sm font-semibold text-gray-700 uppercase mb-4">{{ $t('ecoOrganizations.gpsCoordinatesForMap') }}</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('ecoOrganizations.latitude') }}</label>
                  <input v-model="formData.gpsLat" type="text" placeholder="42.8746" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('ecoOrganizations.longitude') }}</label>
                  <input v-model="formData.gpsLng" type="text" placeholder="74.5698" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500" />
                </div>
              </div>
            </div>

            <!-- Activity & License -->
            <div>
              <h4 class="text-sm font-semibold text-gray-700 uppercase mb-4">{{ $t('ecoOrganizations.activityAndLicense') }}</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('ecoOrganizations.activityType') }}</label>
                  <input v-model="formData.activityType" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('ecoOrganizations.licenseNumber') }}</label>
                  <input v-model="formData.licenseNumber" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('ecoOrganizations.licenseExpiry') }}</label>
                  <input v-model="formData.licenseExpiry" type="text" placeholder="31.12.2025" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('ecoOrganizations.regionForFilter') }}</label>
                  <select v-model="formData.region" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500">
                    <option value="">{{ $t('ecoOrganizations.select') }}</option>
                    <option v-for="r in regions" :key="r" :value="r">{{ r }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('ecoOrganizations.status') }} *</label>
                  <select v-model="formData.status" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500">
                    <option v-for="s in statuses" :key="s" :value="s">{{ statusLabels[s] || s }}</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex gap-3 pt-4 border-t border-gray-200">
              <AppButton
                variant="primary"
                class="flex-1"
                @click="saveOrganization"
              >
                {{ isCreating ? $t('common.create') : $t('common.save') }}
              </AppButton>
              <AppButton
                variant="secondary"
                class="flex-1"
                @click="showEditModal = false"
              >
                {{ $t('common.cancel') }}
              </AppButton>
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
            <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ $t('ecoOrganizations.deleteOrgTitle') }}</h3>
            <p class="text-gray-500 mb-6">
              {{ $t('ecoOrganizations.deleteOrgConfirm') }} <strong>{{ selectedOrg.shortName }}</strong>{{ $t('ecoOrganizations.deleteOrgIrreversible') }}
            </p>
            <div class="flex gap-3">
              <AppButton
                variant="danger"
                class="flex-1"
                @click="deleteOrganization"
              >
                {{ $t('common.delete') }}
              </AppButton>
              <AppButton
                variant="secondary"
                class="flex-1"
                @click="showDeleteConfirm = false"
              >
                {{ $t('common.cancel') }}
              </AppButton>
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
