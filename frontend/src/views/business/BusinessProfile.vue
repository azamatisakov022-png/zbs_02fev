<script setup lang="ts">
import { ref, computed } from 'vue'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import { icons } from '../../utils/menuIcons'

const menuItems = [
  { id: 'dashboard', label: 'Главная', icon: icons.dashboard, route: '/business' },
  { id: 'account', label: 'Лицевой счёт', icon: icons.money, route: '/business/account' },
  { id: 'calculator', label: 'Расчёт утильсбора', icon: icons.calculator, route: '/business/calculator' },
  { id: 'reports', label: 'Отчёты о переработке', icon: icons.report, route: '/business/reports' },
  { id: 'declarations', label: 'Декларации', icon: icons.document, route: '/business/declarations' },
  { id: 'payments', label: 'Платежи', icon: icons.payment, route: '/business/payments' },
  { id: 'documents', label: 'Документы', icon: icons.folder, route: '/business/documents' },
  { id: 'normatives', label: 'Нормативы и ставки', icon: icons.registries, route: '/business/normatives' },
  { id: 'profile', label: 'Профиль компании', icon: icons.building, route: '/business/profile' },
]

// Company data
const companyData = ref({
  name: 'ОсОО «ТехПром»',
  fullName: 'Общество с ограниченной ответственностью «ТехПром»',
  inn: '01234567891234',
  okpo: '12345678',
  registrationNumber: 'ГРП-12345-2020',
  registrationDate: '2020-03-15',
  legalAddress: 'г. Бишкек, ул. Киевская, д. 107, офис 205',
  actualAddress: 'г. Бишкек, ул. Киевская, д. 107, офис 205',
  activityType: 'Производство и импорт электроники',
  okved: '26.20 - Производство компьютеров и периферийного оборудования',
})

const contactData = ref({
  phone: '+996 312 123-456',
  additionalPhone: '+996 555 123-456',
  email: 'info@techprom.kg',
  website: 'www.techprom.kg',
  fax: '+996 312 123-457',
})

const representativeData = ref({
  directorName: 'Асанов Алмаз Бекович',
  directorPosition: 'Генеральный директор',
  contactPersonName: 'Иванова Мария Петровна',
  contactPersonPosition: 'Главный бухгалтер',
  contactPersonPhone: '+996 555 987-654',
  contactPersonEmail: 'm.ivanova@techprom.kg',
})

const bankData = ref({
  bankName: 'ОАО «РСК Банк»',
  bik: '109001',
  accountNumber: '1091620000123456',
  correspondentAccount: '',
})

const notificationSettings = ref({
  emailNotifications: true,
  smsNotifications: false,
  declarationReminders: true,
  paymentReminders: true,
  newsAndUpdates: false,
  reportDeadlines: true,
})

const securityData = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
  twoFactorEnabled: false,
})

// Edit states
const editingSection = ref<string | null>(null)
const saving = ref(false)

// Verification status
const verificationStatus = ref<'verified' | 'pending' | 'not_verified'>('verified')

// Profile completion
const profileCompletion = computed(() => {
  let filled = 0
  let total = 0

  // Check company data
  Object.values(companyData.value).forEach(val => {
    total++
    if (val) filled++
  })

  // Check contact data
  Object.values(contactData.value).forEach(val => {
    total++
    if (val) filled++
  })

  // Check representative data
  Object.values(representativeData.value).forEach(val => {
    total++
    if (val) filled++
  })

  // Check bank data
  Object.values(bankData.value).forEach(val => {
    total++
    if (val) filled++
  })

  return Math.round((filled / total) * 100)
})

const startEditing = (section: string) => {
  editingSection.value = section
}

const cancelEditing = () => {
  editingSection.value = null
}

const saveSection = async () => {
  saving.value = true
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000))
  saving.value = false
  editingSection.value = null
}

const changePassword = async () => {
  if (securityData.value.newPassword !== securityData.value.confirmPassword) {
    alert('Пароли не совпадают')
    return
  }
  saving.value = true
  await new Promise(resolve => setTimeout(resolve, 1000))
  saving.value = false
  securityData.value.currentPassword = ''
  securityData.value.newPassword = ''
  securityData.value.confirmPassword = ''
  alert('Пароль успешно изменён')
}

const toggleTwoFactor = () => {
  securityData.value.twoFactorEnabled = !securityData.value.twoFactorEnabled
}
</script>

<template>
  <DashboardLayout
    role="business"
    roleTitle="Плательщик"
    userName="ОсОО «ТехПром»"
    :menuItems="menuItems"
  >
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Профиль компании</h1>
          <p class="text-gray-600 mt-1">Управление данными вашей организации</p>
        </div>
        <div class="flex items-center gap-3">
          <!-- Verification Badge -->
          <div
            v-if="verificationStatus === 'verified'"
            class="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg border border-green-200"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span class="font-medium">Верифицирован</span>
          </div>
          <div
            v-else-if="verificationStatus === 'pending'"
            class="flex items-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg border border-yellow-200"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="font-medium">На проверке</span>
          </div>
          <div
            v-else
            class="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg border border-red-200"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span class="font-medium">Не верифицирован</span>
          </div>
        </div>
      </div>

      <!-- Profile Completion Banner -->
      <div class="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-2xl p-6 text-white">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h2 class="text-xl font-bold">Заполненность профиля: {{ profileCompletion }}%</h2>
              <p class="text-teal-100 mt-1">
                {{ profileCompletion === 100 ? 'Отлично! Все данные заполнены' : 'Заполните все данные для полноценной работы в системе' }}
              </p>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <!-- Progress Circle -->
            <div class="relative w-20 h-20">
              <svg class="w-20 h-20 transform -rotate-90">
                <circle cx="40" cy="40" r="36" stroke="rgba(255,255,255,0.2)" stroke-width="8" fill="none" />
                <circle
                  cx="40" cy="40" r="36"
                  stroke="white"
                  stroke-width="8"
                  fill="none"
                  :stroke-dasharray="226"
                  :stroke-dashoffset="226 - (226 * profileCompletion / 100)"
                  stroke-linecap="round"
                />
              </svg>
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-lg font-bold">{{ profileCompletion }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Company Information -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900">Данные организации</h3>
          </div>
          <button
            v-if="editingSection !== 'company'"
            @click="startEditing('company')"
            class="text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Редактировать
          </button>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Краткое наименование</label>
              <input
                v-if="editingSection === 'company'"
                v-model="companyData.name"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
              <p v-else class="text-gray-900">{{ companyData.name }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Полное наименование</label>
              <input
                v-if="editingSection === 'company'"
                v-model="companyData.fullName"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
              <p v-else class="text-gray-900">{{ companyData.fullName }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">ИНН</label>
              <input
                v-if="editingSection === 'company'"
                v-model="companyData.inn"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
              <p v-else class="text-gray-900 font-mono">{{ companyData.inn }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">ОКПО</label>
              <input
                v-if="editingSection === 'company'"
                v-model="companyData.okpo"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
              <p v-else class="text-gray-900 font-mono">{{ companyData.okpo }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Регистрационный номер</label>
              <input
                v-if="editingSection === 'company'"
                v-model="companyData.registrationNumber"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
              <p v-else class="text-gray-900 font-mono">{{ companyData.registrationNumber }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Дата регистрации</label>
              <input
                v-if="editingSection === 'company'"
                v-model="companyData.registrationDate"
                type="date"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
              <p v-else class="text-gray-900">{{ new Date(companyData.registrationDate).toLocaleDateString('ru-RU') }}</p>
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-500 mb-1">Юридический адрес</label>
              <input
                v-if="editingSection === 'company'"
                v-model="companyData.legalAddress"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
              <p v-else class="text-gray-900">{{ companyData.legalAddress }}</p>
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-500 mb-1">Фактический адрес</label>
              <input
                v-if="editingSection === 'company'"
                v-model="companyData.actualAddress"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
              <p v-else class="text-gray-900">{{ companyData.actualAddress }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Вид деятельности</label>
              <input
                v-if="editingSection === 'company'"
                v-model="companyData.activityType"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
              <p v-else class="text-gray-900">{{ companyData.activityType }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">ОКВЭД</label>
              <input
                v-if="editingSection === 'company'"
                v-model="companyData.okved"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
              <p v-else class="text-gray-900">{{ companyData.okved }}</p>
            </div>
          </div>
          <!-- Edit Actions -->
          <div v-if="editingSection === 'company'" class="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              @click="cancelEditing"
              class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Отмена
            </button>
            <button
              @click="saveSection"
              :disabled="saving"
              class="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ saving ? 'Сохранение...' : 'Сохранить' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Contact Information -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900">Контактная информация</h3>
          </div>
          <button
            v-if="editingSection !== 'contact'"
            @click="startEditing('contact')"
            class="text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Редактировать
          </button>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Основной телефон</label>
              <input
                v-if="editingSection === 'contact'"
                v-model="contactData.phone"
                type="tel"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
              <p v-else class="text-gray-900">{{ contactData.phone }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Дополнительный телефон</label>
              <input
                v-if="editingSection === 'contact'"
                v-model="contactData.additionalPhone"
                type="tel"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
              <p v-else class="text-gray-900">{{ contactData.additionalPhone || '—' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Факс</label>
              <input
                v-if="editingSection === 'contact'"
                v-model="contactData.fax"
                type="tel"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
              <p v-else class="text-gray-900">{{ contactData.fax || '—' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Email</label>
              <input
                v-if="editingSection === 'contact'"
                v-model="contactData.email"
                type="email"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
              <p v-else class="text-gray-900">{{ contactData.email }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Веб-сайт</label>
              <input
                v-if="editingSection === 'contact'"
                v-model="contactData.website"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
              <p v-else class="text-gray-900">{{ contactData.website || '—' }}</p>
            </div>
          </div>
          <!-- Edit Actions -->
          <div v-if="editingSection === 'contact'" class="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              @click="cancelEditing"
              class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Отмена
            </button>
            <button
              @click="saveSection"
              :disabled="saving"
              class="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ saving ? 'Сохранение...' : 'Сохранить' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Representative Information -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900">Представители</h3>
          </div>
          <button
            v-if="editingSection !== 'representative'"
            @click="startEditing('representative')"
            class="text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Редактировать
          </button>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Director -->
            <div class="bg-gray-50 rounded-xl p-5">
              <h4 class="font-medium text-gray-900 mb-4 flex items-center gap-2">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Руководитель
              </h4>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-500 mb-1">ФИО</label>
                  <input
                    v-if="editingSection === 'representative'"
                    v-model="representativeData.directorName"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                  <p v-else class="text-gray-900">{{ representativeData.directorName }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-500 mb-1">Должность</label>
                  <input
                    v-if="editingSection === 'representative'"
                    v-model="representativeData.directorPosition"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                  <p v-else class="text-gray-900">{{ representativeData.directorPosition }}</p>
                </div>
              </div>
            </div>

            <!-- Contact Person -->
            <div class="bg-gray-50 rounded-xl p-5">
              <h4 class="font-medium text-gray-900 mb-4 flex items-center gap-2">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Контактное лицо
              </h4>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-500 mb-1">ФИО</label>
                  <input
                    v-if="editingSection === 'representative'"
                    v-model="representativeData.contactPersonName"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                  <p v-else class="text-gray-900">{{ representativeData.contactPersonName }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-500 mb-1">Должность</label>
                  <input
                    v-if="editingSection === 'representative'"
                    v-model="representativeData.contactPersonPosition"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                  <p v-else class="text-gray-900">{{ representativeData.contactPersonPosition }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-500 mb-1">Телефон</label>
                  <input
                    v-if="editingSection === 'representative'"
                    v-model="representativeData.contactPersonPhone"
                    type="tel"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                  <p v-else class="text-gray-900">{{ representativeData.contactPersonPhone }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-500 mb-1">Email</label>
                  <input
                    v-if="editingSection === 'representative'"
                    v-model="representativeData.contactPersonEmail"
                    type="email"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                  <p v-else class="text-gray-900">{{ representativeData.contactPersonEmail }}</p>
                </div>
              </div>
            </div>
          </div>
          <!-- Edit Actions -->
          <div v-if="editingSection === 'representative'" class="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              @click="cancelEditing"
              class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Отмена
            </button>
            <button
              @click="saveSection"
              :disabled="saving"
              class="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ saving ? 'Сохранение...' : 'Сохранить' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Bank Details -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900">Банковские реквизиты</h3>
          </div>
          <button
            v-if="editingSection !== 'bank'"
            @click="startEditing('bank')"
            class="text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Редактировать
          </button>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Наименование банка</label>
              <input
                v-if="editingSection === 'bank'"
                v-model="bankData.bankName"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
              <p v-else class="text-gray-900">{{ bankData.bankName }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">БИК</label>
              <input
                v-if="editingSection === 'bank'"
                v-model="bankData.bik"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
              <p v-else class="text-gray-900 font-mono">{{ bankData.bik }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Расчётный счёт</label>
              <input
                v-if="editingSection === 'bank'"
                v-model="bankData.accountNumber"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
              <p v-else class="text-gray-900 font-mono">{{ bankData.accountNumber }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Корреспондентский счёт</label>
              <input
                v-if="editingSection === 'bank'"
                v-model="bankData.correspondentAccount"
                type="text"
                placeholder="Не указан"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
              <p v-else class="text-gray-900 font-mono">{{ bankData.correspondentAccount || '—' }}</p>
            </div>
          </div>
          <!-- Edit Actions -->
          <div v-if="editingSection === 'bank'" class="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              @click="cancelEditing"
              class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Отмена
            </button>
            <button
              @click="saveSection"
              :disabled="saving"
              class="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ saving ? 'Сохранение...' : 'Сохранить' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Notification Settings -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900">Настройки уведомлений</h3>
          </div>
        </div>
        <div class="p-6">
          <div class="space-y-4">
            <label class="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
              <div>
                <p class="font-medium text-gray-900">Email-уведомления</p>
                <p class="text-sm text-gray-500">Получать уведомления на электронную почту</p>
              </div>
              <div class="relative">
                <input type="checkbox" v-model="notificationSettings.emailNotifications" class="sr-only" />
                <div :class="[
                  'w-11 h-6 rounded-full transition-colors',
                  notificationSettings.emailNotifications ? 'bg-teal-600' : 'bg-gray-300'
                ]">
                  <div :class="[
                    'w-5 h-5 bg-white rounded-full shadow transform transition-transform',
                    notificationSettings.emailNotifications ? 'translate-x-5' : 'translate-x-0.5'
                  ]" style="margin-top: 2px;"></div>
                </div>
              </div>
            </label>

            <label class="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
              <div>
                <p class="font-medium text-gray-900">SMS-уведомления</p>
                <p class="text-sm text-gray-500">Получать SMS о важных событиях</p>
              </div>
              <div class="relative">
                <input type="checkbox" v-model="notificationSettings.smsNotifications" class="sr-only" />
                <div :class="[
                  'w-11 h-6 rounded-full transition-colors',
                  notificationSettings.smsNotifications ? 'bg-teal-600' : 'bg-gray-300'
                ]">
                  <div :class="[
                    'w-5 h-5 bg-white rounded-full shadow transform transition-transform',
                    notificationSettings.smsNotifications ? 'translate-x-5' : 'translate-x-0.5'
                  ]" style="margin-top: 2px;"></div>
                </div>
              </div>
            </label>

            <label class="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
              <div>
                <p class="font-medium text-gray-900">Напоминания о декларациях</p>
                <p class="text-sm text-gray-500">Уведомлять о сроках подачи деклараций</p>
              </div>
              <div class="relative">
                <input type="checkbox" v-model="notificationSettings.declarationReminders" class="sr-only" />
                <div :class="[
                  'w-11 h-6 rounded-full transition-colors',
                  notificationSettings.declarationReminders ? 'bg-teal-600' : 'bg-gray-300'
                ]">
                  <div :class="[
                    'w-5 h-5 bg-white rounded-full shadow transform transition-transform',
                    notificationSettings.declarationReminders ? 'translate-x-5' : 'translate-x-0.5'
                  ]" style="margin-top: 2px;"></div>
                </div>
              </div>
            </label>

            <label class="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
              <div>
                <p class="font-medium text-gray-900">Напоминания об оплате</p>
                <p class="text-sm text-gray-500">Уведомлять о сроках оплаты утильсбора</p>
              </div>
              <div class="relative">
                <input type="checkbox" v-model="notificationSettings.paymentReminders" class="sr-only" />
                <div :class="[
                  'w-11 h-6 rounded-full transition-colors',
                  notificationSettings.paymentReminders ? 'bg-teal-600' : 'bg-gray-300'
                ]">
                  <div :class="[
                    'w-5 h-5 bg-white rounded-full shadow transform transition-transform',
                    notificationSettings.paymentReminders ? 'translate-x-5' : 'translate-x-0.5'
                  ]" style="margin-top: 2px;"></div>
                </div>
              </div>
            </label>

            <label class="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
              <div>
                <p class="font-medium text-gray-900">Сроки отчётности</p>
                <p class="text-sm text-gray-500">Напоминать о приближающихся сроках сдачи отчётов</p>
              </div>
              <div class="relative">
                <input type="checkbox" v-model="notificationSettings.reportDeadlines" class="sr-only" />
                <div :class="[
                  'w-11 h-6 rounded-full transition-colors',
                  notificationSettings.reportDeadlines ? 'bg-teal-600' : 'bg-gray-300'
                ]">
                  <div :class="[
                    'w-5 h-5 bg-white rounded-full shadow transform transition-transform',
                    notificationSettings.reportDeadlines ? 'translate-x-5' : 'translate-x-0.5'
                  ]" style="margin-top: 2px;"></div>
                </div>
              </div>
            </label>

            <label class="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
              <div>
                <p class="font-medium text-gray-900">Новости и обновления</p>
                <p class="text-sm text-gray-500">Получать информацию об изменениях в законодательстве</p>
              </div>
              <div class="relative">
                <input type="checkbox" v-model="notificationSettings.newsAndUpdates" class="sr-only" />
                <div :class="[
                  'w-11 h-6 rounded-full transition-colors',
                  notificationSettings.newsAndUpdates ? 'bg-teal-600' : 'bg-gray-300'
                ]">
                  <div :class="[
                    'w-5 h-5 bg-white rounded-full shadow transform transition-transform',
                    notificationSettings.newsAndUpdates ? 'translate-x-5' : 'translate-x-0.5'
                  ]" style="margin-top: 2px;"></div>
                </div>
              </div>
            </label>
          </div>
        </div>
      </div>

      <!-- Security Settings -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900">Безопасность</h3>
          </div>
        </div>
        <div class="p-6 space-y-6">
          <!-- Change Password -->
          <div>
            <h4 class="font-medium text-gray-900 mb-4">Изменение пароля</h4>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-500 mb-1">Текущий пароль</label>
                <input
                  v-model="securityData.currentPassword"
                  type="password"
                  placeholder="••••••••"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 mb-1">Новый пароль</label>
                <input
                  v-model="securityData.newPassword"
                  type="password"
                  placeholder="••••••••"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 mb-1">Подтвердите пароль</label>
                <input
                  v-model="securityData.confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
            </div>
            <button
              @click="changePassword"
              :disabled="!securityData.currentPassword || !securityData.newPassword || !securityData.confirmPassword || saving"
              class="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Изменить пароль
            </button>
          </div>

          <!-- Two-Factor Authentication -->
          <div class="pt-6 border-t border-gray-200">
            <div class="flex items-center justify-between">
              <div>
                <h4 class="font-medium text-gray-900">Двухфакторная аутентификация</h4>
                <p class="text-sm text-gray-500 mt-1">Дополнительная защита вашего аккаунта</p>
              </div>
              <button
                @click="toggleTwoFactor"
                :class="[
                  'px-4 py-2 rounded-lg font-medium transition-colors',
                  securityData.twoFactorEnabled
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-teal-600 text-white hover:bg-teal-700'
                ]"
              >
                {{ securityData.twoFactorEnabled ? 'Отключить' : 'Включить' }}
              </button>
            </div>
            <div
              v-if="securityData.twoFactorEnabled"
              class="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3"
            >
              <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span class="text-green-700">Двухфакторная аутентификация включена</span>
            </div>
          </div>

          <!-- Session Info -->
          <div class="pt-6 border-t border-gray-200">
            <h4 class="font-medium text-gray-900 mb-4">Активные сессии</h4>
            <div class="space-y-3">
              <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                    <svg class="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">Windows — Chrome</p>
                    <p class="text-sm text-gray-500">Бишкек, Кыргызстан · Текущая сессия</p>
                  </div>
                </div>
                <span class="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">Активна</span>
              </div>
              <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                    <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">iOS — Safari</p>
                    <p class="text-sm text-gray-500">Бишкек, Кыргызстан · 2 дня назад</p>
                  </div>
                </div>
                <button class="text-red-600 hover:text-red-700 text-sm font-medium">Завершить</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>
