<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import { AppButton } from '../../components/ui'
import { LicenseStatus } from '../../constants/statuses'
import { useEmployeeMenu } from '../../composables/useRoleMenu'
import SectionGuide from '../../components/common/SectionGuide.vue'
import ConfirmDialog from '../../components/common/ConfirmDialog.vue'

const { roleTitle, menuItems } = useEmployeeMenu()
const { t } = useI18n()

// ─── Data types ───
interface License {
  id: number
  number: string
  company: string
  legalAddress: string
  actualAddress: string
  licenseType: string
  activities: string[]
  issuedAt: string
  expiresAt: string
  phone: string
  email: string
  contactPerson: string
  status: string
}

// ─── Dictionaries ───
const knownOrganizations = [
  'ОсОО «ЭкоПереработка»',
  'ОсОО «ГринРесайкл»',
  'ОАО «ЭкоТех»',
  'ОсОО «МеталлПром»',
  'ОАО «ГринТех»',
  'ОсОО «ПластПром»',
  'ОсОО «АвтоУтиль»',
  'ОсОО «СтеклоПром»',
  'ИП Сыдыков Н.А.',
  'ОсОО «ЧистыйГород»',
]

const licenseTypeOptions = computed(() => [
  t('employeeLicenses.typeCollection'),
  t('employeeLicenses.typeTransport'),
  t('employeeLicenses.typeRecycling'),
  t('employeeLicenses.typeNeutralization'),
  t('employeeLicenses.typePlacement'),
  t('employeeLicenses.typeComplex'),
])

const activityOptions = computed(() => [
  t('employeeLicenses.actCollectSort'),
  t('employeeLicenses.actPlastic'),
  t('employeeLicenses.actPaperCardboard'),
  t('employeeLicenses.actGlass'),
  t('employeeLicenses.actMetal'),
  t('employeeLicenses.actElectronics'),
  t('employeeLicenses.actTiresRubber'),
  t('employeeLicenses.actBatteries'),
  t('employeeLicenses.actHazardous'),
  t('employeeLicenses.actComplexRecycling'),
])

// ─── Mock licenses ───
let nextId = 9

const licenses = ref<License[]>([
  {
    id: 1, number: 'ЛП-2025-0062', company: 'ОсОО «ЭкоПереработка»',
    legalAddress: 'г. Бишкек, ул. Жибек Жолу, 142', actualAddress: 'г. Бишкек, ул. Ахунбаева, 98/1',
    licenseType: 'На переработку (утилизацию) отходов',
    activities: ['Переработка пластика', 'Переработка бумаги и картона'],
    issuedAt: '15.03.2025', expiresAt: '15.03.2027',
    phone: '+996 312 545 678', email: 'info@ecopererabotka.kg', contactPerson: 'Асанов Бакыт Маратович',
    status: LicenseStatus.VALID,
  },
  {
    id: 2, number: 'ЛП-2025-0058', company: 'ОсОО «ГринРесайкл»',
    legalAddress: 'г. Бишкек, пр. Чуй, 215а', actualAddress: 'г. Бишкек, пр. Чуй, 215а',
    licenseType: 'На переработку (утилизацию) отходов',
    activities: ['Переработка бумаги и картона'],
    issuedAt: '10.01.2025', expiresAt: '10.01.2027',
    phone: '+996 312 901 234', email: 'office@greenrecycle.kg', contactPerson: 'Жумабаев Эрлан Кубатович',
    status: LicenseStatus.VALID,
  },
  {
    id: 3, number: 'ЛП-2024-0045', company: 'ОАО «ЭкоТех»',
    legalAddress: 'г. Ош, ул. Ленина, 88', actualAddress: 'г. Ош, ул. Масалиева, 12',
    licenseType: 'Комплексная',
    activities: ['Переработка стекла', 'Сбор и сортировка', 'Переработка металла'],
    issuedAt: '20.06.2024', expiresAt: '20.02.2026',
    phone: '+996 3222 5 43 21', email: 'ecotech@mail.kg', contactPerson: 'Токтогулов Самат Абдиевич',
    status: LicenseStatus.EXPIRING,
  },
  {
    id: 4, number: 'ЛП-2024-0041', company: 'ОсОО «МеталлПром»',
    legalAddress: 'г. Бишкек, ул. Горького, 1/2', actualAddress: 'г. Бишкек, ул. Горького, 1/2',
    licenseType: 'На переработку (утилизацию) отходов',
    activities: ['Переработка металла', 'Переработка аккумуляторов'],
    issuedAt: '05.04.2024', expiresAt: '05.04.2026',
    phone: '+996 312 667 890', email: 'mp@metallprom.kg', contactPerson: 'Иванов Пётр Сергеевич',
    status: LicenseStatus.VALID,
  },
  {
    id: 5, number: 'ЛП-2023-0035', company: 'ОАО «ГринТех»',
    legalAddress: 'г. Каракол, ул. Токтогула, 50', actualAddress: 'г. Каракол, ул. Токтогула, 50',
    licenseType: 'На переработку (утилизацию) отходов',
    activities: ['Переработка электроники', 'Утилизация опасных отходов'],
    issuedAt: '01.09.2023', expiresAt: '01.09.2025',
    phone: '+996 3922 5 01 02', email: 'greentech@inbox.kg', contactPerson: 'Мамбетова Гульнара Алиевна',
    status: LicenseStatus.EXPIRED,
  },
  {
    id: 6, number: 'ЛП-2025-0070', company: 'ОсОО «ПластПром»',
    legalAddress: 'г. Бишкек, ул. Байтик Баатыра, 36', actualAddress: 'Чуйская обл., с. Лебединовка, ул. Центральная, 5',
    licenseType: 'На переработку (утилизацию) отходов',
    activities: ['Переработка пластика'],
    issuedAt: '28.01.2026', expiresAt: '28.01.2028',
    phone: '+996 557 123 456', email: 'plastprom@bk.ru', contactPerson: 'Касымов Нурлан Бейшенович',
    status: LicenseStatus.VALID,
  },
  {
    id: 7, number: 'ЛП-2025-0068', company: 'ОсОО «АвтоУтиль»',
    legalAddress: 'г. Бишкек, ул. Алма-Атинская, 200', actualAddress: 'г. Бишкек, ул. Алма-Атинская, 200',
    licenseType: 'На сбор отходов',
    activities: ['Переработка шин и резины', 'Сбор и сортировка'],
    issuedAt: '12.11.2025', expiresAt: '12.11.2027',
    phone: '+996 700 987 654', email: 'autoutil@gmail.com', contactPerson: 'Абдуллаев Тимур Ринатович',
    status: LicenseStatus.VALID,
  },
  {
    id: 8, number: 'ЛП-2026-0003', company: 'ОсОО «ЧистыйГород»',
    legalAddress: 'г. Джалал-Абад, ул. Эркиндик, 15', actualAddress: 'г. Джалал-Абад, ул. Эркиндик, 15',
    licenseType: 'Комплексная',
    activities: ['Комплексная переработка', 'Сбор и сортировка'],
    issuedAt: '', expiresAt: '',
    phone: '+996 772 111 222', email: 'clean@city.kg', contactPerson: 'Сулайманов Алмаз Бакирович',
    status: LicenseStatus.UNDER_REVIEW,
  },
])

// ─── Date helpers ───
function parseDDMMYYYY(s: string): Date | null {
  const parts = s.split('.')
  if (parts.length !== 3) return null
  return new Date(+parts[2], +parts[1] - 1, +parts[0])
}

function formatDateInput(dateStr: string): string {
  if (!dateStr) return ''
  const [d, m, y] = dateStr.split('.')
  return `${y}-${m}-${d}`
}

function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-')
  return `${d}.${m}.${y}`
}

function daysUntilExpiry(expiresAt: string): number | null {
  const d = parseDDMMYYYY(expiresAt)
  if (!d) return null
  const now = new Date(2026, 1, 12)
  return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

function expiryClass(expiresAt: string): string {
  const days = daysUntilExpiry(expiresAt)
  if (days === null) return 'text-[#94a3b8]'
  if (days < 0) return 'text-[#94a3b8] line-through'
  if (days <= 30) return 'text-[#ef4444] font-semibold'
  return 'text-[#1e293b]'
}

// ─── Status helpers ───
function getStatusClass(status: string): string {
  switch (status) {
    case 'valid': return 'bg-green-100 text-green-800'
    case 'expiring': return 'bg-orange-100 text-orange-800'
    case 'expired': return 'bg-red-100 text-red-800'
    case 'under_review': return 'bg-yellow-100 text-yellow-800'
    case 'revoked': return 'bg-gray-100 text-gray-600'
    default: return 'bg-gray-100 text-gray-800'
  }
}

// ─── Form state ───
const showForm = ref(false)
const editingId = ref<number | null>(null)
const companyMode = ref<'select' | 'manual'>('select')
const sameAddress = ref(false)
const showActivityDropdown = ref(false)

interface LicenseForm {
  number: string
  company: string
  companyManual: string
  legalAddress: string
  actualAddress: string
  licenseType: string
  activities: string[]
  issuedAt: string
  expiresAt: string
  phone: string
  email: string
  contactPerson: string
}

const form = ref<LicenseForm>({
  number: '', company: '', companyManual: '',
  legalAddress: '', actualAddress: '',
  licenseType: '', activities: [],
  issuedAt: '', expiresAt: '',
  phone: '', email: '', contactPerson: '',
})

function resetForm() {
  form.value = {
    number: '', company: '', companyManual: '',
    legalAddress: '', actualAddress: '',
    licenseType: '', activities: [],
    issuedAt: '', expiresAt: '',
    phone: '', email: '', contactPerson: '',
  }
  companyMode.value = 'select'
  sameAddress.value = false
  editingId.value = null
  showActivityDropdown.value = false
}

function openAddForm() {
  resetForm()
  showForm.value = true
}

function openEditForm(lic: License) {
  editingId.value = lic.id
  companyMode.value = knownOrganizations.includes(lic.company) ? 'select' : 'manual'
  form.value = {
    number: lic.number,
    company: knownOrganizations.includes(lic.company) ? lic.company : '',
    companyManual: knownOrganizations.includes(lic.company) ? '' : lic.company,
    legalAddress: lic.legalAddress,
    actualAddress: lic.actualAddress,
    licenseType: lic.licenseType,
    activities: [...lic.activities],
    issuedAt: formatDateInput(lic.issuedAt),
    expiresAt: formatDateInput(lic.expiresAt),
    phone: lic.phone,
    email: lic.email,
    contactPerson: lic.contactPerson,
  }
  sameAddress.value = lic.legalAddress === lic.actualAddress
  showForm.value = true
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function toggleActivity(act: string) {
  const idx = form.value.activities.indexOf(act)
  if (idx >= 0) form.value.activities.splice(idx, 1)
  else form.value.activities.push(act)
}

function onSameAddressChange() {
  if (sameAddress.value) form.value.actualAddress = form.value.legalAddress
}

function saveForm() {
  const company = companyMode.value === 'manual' ? form.value.companyManual : form.value.company
  if (!form.value.number || !company || !form.value.licenseType || form.value.activities.length === 0) return

  const actual = sameAddress.value ? form.value.legalAddress : form.value.actualAddress

  if (editingId.value !== null) {
    const lic = licenses.value.find(l => l.id === editingId.value)
    if (lic) {
      lic.number = form.value.number
      lic.company = company
      lic.legalAddress = form.value.legalAddress
      lic.actualAddress = actual
      lic.licenseType = form.value.licenseType
      lic.activities = [...form.value.activities]
      lic.issuedAt = formatDateDisplay(form.value.issuedAt)
      lic.expiresAt = formatDateDisplay(form.value.expiresAt)
      lic.phone = form.value.phone
      lic.email = form.value.email
      lic.contactPerson = form.value.contactPerson
    }
  } else {
    licenses.value.unshift({
      id: nextId++,
      number: form.value.number,
      company,
      legalAddress: form.value.legalAddress,
      actualAddress: actual,
      licenseType: form.value.licenseType,
      activities: [...form.value.activities],
      issuedAt: formatDateDisplay(form.value.issuedAt),
      expiresAt: formatDateDisplay(form.value.expiresAt),
      phone: form.value.phone,
      email: form.value.email,
      contactPerson: form.value.contactPerson,
      status: LicenseStatus.VALID,
    })
  }
  resetForm()
  showForm.value = false
}

function cancelForm() {
  resetForm()
  showForm.value = false
}

// Confirm dialog state
const confirmDialog = ref({
  visible: false,
  title: '',
  message: '',
  icon: 'danger' as 'warning' | 'danger' | 'info' | 'success',
  confirmText: '',
  confirmColor: 'red' as 'green' | 'red' | 'orange',
  onConfirm: () => {},
})
const handleConfirm = () => {
  confirmDialog.value.visible = false
  confirmDialog.value.onConfirm()
}
const handleCancel = () => {
  confirmDialog.value.visible = false
}

function annulLicense(lic: License) {
  confirmDialog.value = {
    visible: true,
    title: t('employeeLicenses.annulTitle'),
    message: t('employeeLicenses.annulMessage', { number: lic.number }),
    icon: 'danger',
    confirmText: t('employeeLicenses.annulBtn'),
    confirmColor: 'red',
    onConfirm: () => {
      lic.status = LicenseStatus.REVOKED
    },
  }
}

// ─── Search / filter ───
const searchQuery = ref('')
const filterType = ref('')
const filterStatus = ref('')

const filteredLicenses = computed(() => {
  let result = licenses.value
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(l =>
      l.company.toLowerCase().includes(q) || l.number.toLowerCase().includes(q)
    )
  }
  if (filterType.value) {
    result = result.filter(l => l.licenseType === filterType.value)
  }
  if (filterStatus.value) {
    result = result.filter(l => l.status === filterStatus.value)
  }
  return result
})

// ─── Tooltip state ───
const hoveredAddress = ref<number | null>(null)
const hoveredContact = ref<number | null>(null)
</script>

<template>
  <DashboardLayout
    role="employee"
    :roleTitle="roleTitle"
    userName="Мамытова Айгуль"
    :menuItems="menuItems"
  >
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div>
        <h1 class="text-2xl lg:text-3xl font-bold text-[#1e293b] mb-2">{{ $t('pages.employee.licensesTitle') }}</h1>
        <p class="text-[#64748b]">{{ $t('pages.employee.licensesSubtitle') }}</p>
      </div>
      <AppButton variant="primary" @click="openAddForm">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
        {{ $t('common.add') }}
      </AppButton>
    </div>

    <SectionGuide
      :title="$t('employeeLicenses.guideTitle')"
      :description="$t('employeeLicenses.guideDescription')"
      :actions="[$t('employeeLicenses.guideAction1'), $t('employeeLicenses.guideAction2'), $t('employeeLicenses.guideAction3'), $t('employeeLicenses.guideAction4')]"
      storageKey="employee-licenses"
    />

    <!-- ══ Form (add / edit) ══ -->
    <div v-if="showForm" class="bg-white rounded-2xl p-6 shadow-sm border border-[#e2e8f0] mb-6">
      <h3 class="text-lg font-bold text-[#1e293b] mb-5">
        {{ editingId ? $t('employeeLicenses.editTitle') : $t('employeeLicenses.newTitle') }}
      </h3>

      <!-- Row 1: Company + Number -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="lic-label">{{ $t('employeeLicenses.companyName') }} <span class="text-red-500">*</span></label>
          <div class="flex gap-2">
            <select
              v-if="companyMode === 'select'"
              v-model="form.company"
              class="lic-input flex-1 min-w-0"
            >
              <option value="">{{ $t('employeeLicenses.selectOrg') }}</option>
              <option v-for="org in knownOrganizations" :key="org" :value="org">{{ org }}</option>
            </select>
            <input
              v-else
              v-model="form.companyManual"
              type="text"
              :placeholder="$t('employeeLicenses.enterOrgName')"
              class="lic-input flex-1 min-w-0"
            />
            <button
              @click="companyMode = companyMode === 'select' ? 'manual' : 'select'"
              class="flex-shrink-0 px-3 py-2.5 border border-[#e2e8f0] rounded-xl hover:bg-gray-50 transition-colors"
              :title="companyMode === 'select' ? $t('employeeLicenses.enterManually') : $t('employeeLicenses.selectFromList')"
            >
              <svg class="w-5 h-5 text-[#64748b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path v-if="companyMode === 'select'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
              </svg>
            </button>
          </div>
        </div>
        <div>
          <label class="lic-label">{{ $t('employeeLicenses.licenseNumber') }} <span class="text-red-500">*</span></label>
          <input v-model="form.number" type="text" placeholder="ЛП-2026-0001" class="lic-input w-full" />
        </div>
      </div>

      <!-- Row 2: Addresses -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="lic-label">{{ $t('employeeLicenses.legalAddress') }} <span class="text-red-500">*</span></label>
          <input v-model="form.legalAddress" type="text" placeholder="г. Бишкек, ул. ..." class="lic-input w-full" />
        </div>
        <div>
          <label class="lic-label flex items-center gap-3">
            {{ $t('employeeLicenses.actualAddress') }}
            <label class="inline-flex items-center gap-1.5 cursor-pointer text-xs font-normal text-[#64748b]">
              <input type="checkbox" v-model="sameAddress" @change="onSameAddressChange" class="rounded border-gray-300" />
              {{ $t('employeeLicenses.sameAsLegal') }}
            </label>
          </label>
          <input
            v-model="form.actualAddress"
            type="text"
            placeholder="г. Бишкек, ул. ..."
            class="lic-input w-full"
            :disabled="sameAddress"
            :class="{ 'opacity-50': sameAddress }"
          />
        </div>
      </div>

      <!-- Row 3: License type + Activities -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="lic-label">{{ $t('employeeLicenses.licenseType') }} <span class="text-red-500">*</span></label>
          <select v-model="form.licenseType" class="lic-input w-full">
            <option value="">{{ $t('employeeLicenses.selectType') }}</option>
            <option v-for="lt in licenseTypeOptions" :key="lt" :value="lt">{{ lt }}</option>
          </select>
        </div>
        <div>
          <label class="lic-label">{{ $t('employeeLicenses.activityType') }} <span class="text-red-500">*</span> <span class="text-xs font-normal text-[#94a3b8]">({{ $t('employeeLicenses.multipleAllowed') }})</span></label>
          <div class="relative">
            <button
              type="button"
              @click="showActivityDropdown = !showActivityDropdown"
              class="lic-input w-full text-left flex items-center justify-between"
            >
              <span :class="form.activities.length ? 'text-[#1e293b]' : 'text-[#94a3b8]'">
                {{ form.activities.length ? form.activities.length + ' ' + $t('employeeLicenses.selected') : $t('employeeLicenses.selectActivities') }}
              </span>
              <svg class="w-4 h-4 text-[#94a3b8] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
            </button>
            <div v-if="showActivityDropdown" class="lic-dropdown">
              <label
                v-for="act in activityOptions"
                :key="act"
                class="lic-dropdown__item"
              >
                <input
                  type="checkbox"
                  :checked="form.activities.includes(act)"
                  @change="toggleActivity(act)"
                  class="rounded border-gray-300"
                />
                <span>{{ act }}</span>
              </label>
            </div>
          </div>
          <!-- Selected tags -->
          <div v-if="form.activities.length" class="flex flex-wrap gap-1.5 mt-2">
            <span
              v-for="act in form.activities"
              :key="act"
              class="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium"
            >
              {{ act }}
              <button @click="toggleActivity(act)" class="text-blue-400 hover:text-blue-700 font-bold">&times;</button>
            </span>
          </div>
        </div>
      </div>

      <!-- Row 4: Dates -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="lic-label">{{ $t('employeeLicenses.issuedDate') }} <span class="text-red-500">*</span></label>
          <input v-model="form.issuedAt" type="date" class="lic-input w-full" />
        </div>
        <div>
          <label class="lic-label">{{ $t('employeeLicenses.expiryDate') }} <span class="text-red-500">*</span></label>
          <input v-model="form.expiresAt" type="date" class="lic-input w-full" />
        </div>
      </div>

      <!-- Row 5: Contacts -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <div>
          <label class="lic-label">{{ $t('employeeLicenses.contactPhone') }}</label>
          <input v-model="form.phone" type="text" placeholder="+996 XXX XXX XXX" class="lic-input w-full" />
        </div>
        <div>
          <label class="lic-label">{{ $t('employeeLicenses.email') }}</label>
          <input v-model="form.email" type="text" placeholder="info@company.kg" class="lic-input w-full" />
        </div>
        <div>
          <label class="lic-label">{{ $t('employeeLicenses.contactPerson') }}</label>
          <input v-model="form.contactPerson" type="text" :placeholder="$t('employeeLicenses.contactPersonPlaceholder')" class="lic-input w-full" />
        </div>
      </div>

      <!-- Buttons -->
      <div class="flex items-center gap-3 pt-2 border-t border-[#f1f5f9]">
        <AppButton variant="primary" @click="saveForm" class="mt-4">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
          {{ $t('common.save') }}
        </AppButton>
        <AppButton variant="secondary" @click="cancelForm" class="mt-4">
          {{ $t('common.cancel') }}
        </AppButton>
      </div>
    </div>

    <!-- ══ Stats ══ -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
        <p class="text-sm text-[#64748b] mb-1">{{ $t('employeeLicenses.totalLicenses') }}</p>
        <p class="text-2xl font-bold text-[#1e293b]">{{ licenses.length }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
        <p class="text-sm text-[#64748b] mb-1">{{ $t('employeeLicenses.validCount') }}</p>
        <p class="text-2xl font-bold text-[#10b981]">{{ licenses.filter(l => l.status === 'valid').length }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
        <p class="text-sm text-[#64748b] mb-1">{{ $t('employeeLicenses.expiringSoon') }}</p>
        <p class="text-2xl font-bold text-[#f59e0b]">{{ licenses.filter(l => l.status === 'expiring').length }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
        <p class="text-sm text-[#64748b] mb-1">{{ $t('employeeLicenses.underReview') }}</p>
        <p class="text-2xl font-bold text-[#2563eb]">{{ licenses.filter(l => l.status === 'under_review').length }}</p>
      </div>
    </div>

    <!-- ══ Filters ══ -->
    <div class="bg-white rounded-2xl p-4 shadow-sm border border-[#e2e8f0] mb-6">
      <div class="flex flex-wrap gap-4">
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="$t('common.search')"
          class="flex-1 min-w-[200px] px-4 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb]"
        />
        <select v-model="filterType" class="px-4 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb]">
          <option value="">{{ $t('employeeLicenses.allLicenseTypes') }}</option>
          <option v-for="lt in licenseTypeOptions" :key="lt" :value="lt">{{ lt }}</option>
        </select>
        <select v-model="filterStatus" class="px-4 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#2563eb]">
          <option value="">{{ $t('employeeLicenses.allStatuses') }}</option>
          <option value="valid">{{ $t('status.valid') }}</option>
          <option value="expiring">{{ $t('status.expiring') }}</option>
          <option value="expired">{{ $t('status.expired') }}</option>
          <option value="under_review">{{ $t('status.underReview') }}</option>
          <option value="revoked">{{ $t('status.revoked') }}</option>
        </select>
      </div>
    </div>

    <!-- ══ Table ══ -->
    <div class="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] overflow-hidden">
      <div class="overflow-x-auto">
        <table class="lic-table">
          <thead>
            <tr>
              <th class="lic-th" style="width:36px">№</th>
              <th class="lic-th">{{ $t('employeeLicenses.thCompany') }}</th>
              <th class="lic-th">{{ $t('employeeLicenses.thLocation') }}</th>
              <th class="lic-th">{{ $t('employeeLicenses.licenseNumber') }}</th>
              <th class="lic-th">{{ $t('employeeLicenses.issuedDate') }}</th>
              <th class="lic-th">{{ $t('employeeLicenses.licenseType') }}</th>
              <th class="lic-th">{{ $t('employeeLicenses.activityType') }}</th>
              <th class="lic-th">{{ $t('employeeLicenses.thValidity') }}</th>
              <th class="lic-th">{{ $t('employeeLicenses.thContacts') }}</th>
              <th class="lic-th" style="width:170px">{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(lic, idx) in filteredLicenses" :key="lic.id" class="lic-tr">
              <td class="lic-td text-center text-[#94a3b8]">{{ idx + 1 }}</td>
              <td class="lic-td">
                <span class="font-semibold text-[#1e293b]">{{ lic.company }}</span>
              </td>
              <td class="lic-td relative" @mouseenter="hoveredAddress = lic.id" @mouseleave="hoveredAddress = null">
                <span class="text-[#1e293b] text-[13px]">{{ lic.legalAddress || '—' }}</span>
                <div
                  v-if="hoveredAddress === lic.id && lic.actualAddress && lic.actualAddress !== lic.legalAddress"
                  class="lic-tooltip"
                >
                  <span class="text-[#94a3b8] text-[10px] uppercase">{{ $t('employeeLicenses.actualAddress') }}:</span><br/>
                  {{ lic.actualAddress }}
                </div>
              </td>
              <td class="lic-td">
                <span class="font-mono font-medium text-[#2563eb] text-[13px]">{{ lic.number }}</span>
              </td>
              <td class="lic-td text-[13px]">{{ lic.issuedAt || '—' }}</td>
              <td class="lic-td text-[13px]">{{ lic.licenseType }}</td>
              <td class="lic-td">
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="act in lic.activities"
                    :key="act"
                    class="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[11px] font-medium leading-tight"
                  >{{ act }}</span>
                </div>
              </td>
              <td class="lic-td">
                <span :class="expiryClass(lic.expiresAt)" class="text-[13px]">{{ lic.expiresAt || '—' }}</span>
              </td>
              <td class="lic-td relative" @mouseenter="hoveredContact = lic.id" @mouseleave="hoveredContact = null">
                <span class="text-[13px] text-[#1e293b]">{{ lic.phone || '—' }}</span>
                <div
                  v-if="hoveredContact === lic.id && (lic.email || lic.contactPerson)"
                  class="lic-tooltip"
                >
                  <template v-if="lic.email"><span class="text-[#94a3b8] text-[10px] uppercase">Email:</span> {{ lic.email }}<br/></template>
                  <template v-if="lic.contactPerson"><span class="text-[#94a3b8] text-[10px] uppercase">{{ $t('employeeLicenses.contactLabel') }}:</span> {{ lic.contactPerson }}</template>
                </div>
              </td>
              <td class="lic-td">
                <div class="flex items-center gap-1.5">
                  <AppButton variant="ghost" size="sm" @click="openEditForm(lic)">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    {{ $t('common.edit') }}
                  </AppButton>
                  <AppButton
                    v-if="lic.status !== 'revoked' && lic.status !== 'expired'"
                    variant="danger" size="sm"
                    @click="annulLicense(lic)"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                    {{ $t('employeeLicenses.annulBtn') }}
                  </AppButton>
                </div>
              </td>
            </tr>
            <tr v-if="filteredLicenses.length === 0">
              <td colspan="10" class="py-12 text-center text-[#94a3b8]">{{ $t('employeeLicenses.noLicensesFound') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <ConfirmDialog
      :visible="confirmDialog.visible"
      :title="confirmDialog.title"
      :message="confirmDialog.message"
      :icon="confirmDialog.icon"
      :confirmText="confirmDialog.confirmText"
      :confirmColor="confirmDialog.confirmColor"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    />
  </DashboardLayout>
</template>

<style scoped>
/* ── Form elements ── */
.lic-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 5px;
}
.lic-input {
  display: block;
  padding: 9px 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  color: #1e293b;
  outline: none;
  transition: border-color 0.15s;
  background: white;
}
.lic-input:focus { border-color: #2563eb; }
.lic-input::placeholder { color: #94a3b8; }

/* Activity multiselect dropdown */
.lic-dropdown {
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
  padding: 6px 0;
}
.lic-dropdown__item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  font-size: 13px;
  color: #1e293b;
  cursor: pointer;
  transition: background 0.1s;
}
.lic-dropdown__item:hover { background: #f8fafc; }

/* ── Table ── */
.lic-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1100px;
}
.lic-th {
  padding: 12px 10px;
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
  white-space: nowrap;
}
.lic-tr {
  transition: background 0.1s;
}
.lic-tr:hover { background: #f8fafc; }
.lic-tr:not(:last-child) .lic-td { border-bottom: 1px solid #f1f5f9; }
.lic-td {
  padding: 10px 10px;
  font-size: 14px;
  color: #1e293b;
  vertical-align: top;
}

/* Tooltip */
.lic-tooltip {
  position: absolute;
  left: 0;
  bottom: calc(100% + 4px);
  z-index: 20;
  background: #1e293b;
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  line-height: 1.4;
  white-space: nowrap;
  pointer-events: none;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

@media (max-width: 767px) {
  .lic-tooltip {
    white-space: normal;
    max-width: 260px;
  }
}
</style>
