<script setup lang="ts">
import { ref, computed, reactive, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import { useAdminMenu } from '../../composables/useRoleMenu'

const { t } = useI18n()
const { roleTitle, menuItems } = useAdminMenu()

// --- Types ---
interface NotificationTemplate {
  id: number
  name: string
  type: 'email' | 'sms' | 'push' | 'all'
  recipients: string[]
  subject: string
  body: string
  variables: string[]
  active: boolean
  createdAt: string
  updatedAt: string
}

// --- Available variables ---
const availableVariables = computed(() => [
  { key: '{company_name}', label: t('adminNotifications.varCompanyName') },
  { key: '{user_name}', label: t('adminNotifications.varUserName') },
  { key: '{amount}', label: t('adminNotifications.varAmount') },
  { key: '{date}', label: t('adminNotifications.varDate') },
  { key: '{deadline}', label: t('adminNotifications.varDeadline') },
  { key: '{status}', label: t('adminNotifications.varStatus') },
  { key: '{document_id}', label: t('adminNotifications.varDocumentId') },
  { key: '{period}', label: t('adminNotifications.varPeriod') },
])

// --- Recipient options ---
const recipientOptions = computed(() => [
  { value: 'payer', label: t('adminNotifications.recipientPayer') },
  { value: 'employee', label: t('adminNotifications.recipientEmployee') },
  { value: 'eco-operator', label: t('adminNotifications.recipientEcoOperator') },
  { value: 'admin', label: t('adminNotifications.recipientAdmin') },
])

// --- Template data ---
const templates = ref<NotificationTemplate[]>([
  {
    id: 1,
    name: 'Декларация принята',
    type: 'email',
    recipients: ['payer'],
    subject: 'Ваша декларация {document_id} принята',
    body: 'Уважаемый {user_name},\n\nСообщаем, что декларация {document_id} компании {company_name} была успешно принята {date}.\n\nСтатус: {status}\nПериод: {period}\n\nС уважением,\nГП Эко Оператор',
    variables: ['{company_name}', '{user_name}', '{document_id}', '{date}', '{status}', '{period}'],
    active: true,
    createdAt: '2025-01-10',
    updatedAt: '2025-02-01',
  },
  {
    id: 2,
    name: 'Срок подачи отчёта',
    type: 'email',
    recipients: ['payer', 'eco-operator'],
    subject: 'Напоминание: срок подачи отчёта за {period}',
    body: 'Уважаемый {user_name},\n\nНапоминаем, что крайний срок подачи отчёта за {period} - {deadline}.\n\nКомпания: {company_name}\n\nПожалуйста, подайте отчёт вовремя, чтобы избежать штрафных санкций.\n\nС уважением,\nГП Эко Оператор',
    variables: ['{company_name}', '{user_name}', '{period}', '{deadline}'],
    active: true,
    createdAt: '2025-01-10',
    updatedAt: '2025-01-28',
  },
  {
    id: 3,
    name: 'Платёж получен',
    type: 'all',
    recipients: ['payer'],
    subject: 'Платёж на сумму {amount} получен',
    body: 'Уважаемый {user_name},\n\nПодтверждаем получение платежа на сумму {amount} сом от компании {company_name}.\n\nДата: {date}\nID документа: {document_id}\nПериод: {period}\n\nСпасибо за своевременную оплату.\n\nС уважением,\nГП Эко Оператор',
    variables: ['{company_name}', '{user_name}', '{amount}', '{date}', '{document_id}', '{period}'],
    active: true,
    createdAt: '2025-01-12',
    updatedAt: '2025-01-30',
  },
  {
    id: 4,
    name: 'Новая регистрация',
    type: 'email',
    recipients: ['admin', 'employee'],
    subject: 'Новая регистрация: {company_name}',
    body: 'В системе зарегистрирована новая организация.\n\nНазвание: {company_name}\nДата регистрации: {date}\nОтветственное лицо: {user_name}\n\nТребуется проверка и одобрение регистрации.',
    variables: ['{company_name}', '{user_name}', '{date}'],
    active: true,
    createdAt: '2025-01-08',
    updatedAt: '2025-01-20',
  },
  {
    id: 5,
    name: 'Блокировка аккаунта',
    type: 'email',
    recipients: ['payer', 'admin'],
    subject: 'Аккаунт {user_name} заблокирован',
    body: 'Уважаемый {user_name},\n\nВаш аккаунт в системе ГП Эко Оператор был заблокирован {date}.\n\nПричина: {status}\n\nДля разблокировки обратитесь к администратору системы.\n\nС уважением,\nГП Эко Оператор',
    variables: ['{user_name}', '{date}', '{status}'],
    active: true,
    createdAt: '2025-01-15',
    updatedAt: '2025-02-01',
  },
  {
    id: 6,
    name: 'Расчёт утверждён',
    type: 'sms',
    recipients: ['payer'],
    subject: '',
    body: '{company_name}: расчёт утилизационного сбора за {period} утверждён. Сумма: {amount} сом. Срок оплаты: {deadline}.',
    variables: ['{company_name}', '{period}', '{amount}', '{deadline}'],
    active: true,
    createdAt: '2025-01-18',
    updatedAt: '2025-01-25',
  },
  {
    id: 7,
    name: 'Лицензия истекает',
    type: 'email',
    recipients: ['payer', 'eco-operator'],
    subject: 'Внимание: лицензия {company_name} истекает {deadline}',
    body: 'Уважаемый {user_name},\n\nСообщаем, что лицензия компании {company_name} (ID: {document_id}) истекает {deadline}.\n\nТекущий статус: {status}\n\nПожалуйста, своевременно продлите лицензию.\n\nС уважением,\nГП Эко Оператор',
    variables: ['{company_name}', '{user_name}', '{document_id}', '{deadline}', '{status}'],
    active: true,
    createdAt: '2025-01-20',
    updatedAt: '2025-02-02',
  },
  {
    id: 8,
    name: 'Системное обслуживание',
    type: 'all',
    recipients: ['payer', 'employee', 'eco-operator', 'admin'],
    subject: 'Плановое техническое обслуживание {date}',
    body: 'Уважаемые пользователи,\n\n{date} будет проводиться плановое техническое обслуживание системы.\n\nОриентировочное время простоя: с {deadline}.\n\nПриносим извинения за возможные неудобства.\n\nС уважением,\nАдминистрация ГП Эко Оператор',
    variables: ['{date}', '{deadline}'],
    active: false,
    createdAt: '2025-01-22',
    updatedAt: '2025-01-22',
  },
  {
    id: 9,
    name: 'Отчёт отклонён',
    type: 'email',
    recipients: ['payer'],
    subject: 'Отчёт {document_id} отклонён',
    body: 'Уважаемый {user_name},\n\nОтчёт {document_id} компании {company_name} за период {period} был отклонён.\n\nПричина: {status}\n\nПожалуйста, исправьте указанные замечания и подайте отчёт повторно до {deadline}.\n\nС уважением,\nГП Эко Оператор',
    variables: ['{company_name}', '{user_name}', '{document_id}', '{period}', '{status}', '{deadline}'],
    active: true,
    createdAt: '2025-01-25',
    updatedAt: '2025-02-01',
  },
  {
    id: 10,
    name: 'Напоминание об оплате',
    type: 'sms',
    recipients: ['payer'],
    subject: '',
    body: '{company_name}: напоминаем о необходимости оплаты утилизационного сбора за {period}. Сумма: {amount} сом. Крайний срок: {deadline}.',
    variables: ['{company_name}', '{period}', '{amount}', '{deadline}'],
    active: true,
    createdAt: '2025-01-28',
    updatedAt: '2025-02-02',
  },
  {
    id: 11,
    name: 'Смена пароля',
    type: 'push',
    recipients: ['payer', 'employee', 'eco-operator', 'admin'],
    subject: 'Смена пароля',
    body: '{user_name}, ваш пароль был успешно изменён {date}. Если вы не производили это действие, немедленно обратитесь к администратору.',
    variables: ['{user_name}', '{date}'],
    active: true,
    createdAt: '2025-01-30',
    updatedAt: '2025-01-30',
  },
  {
    id: 12,
    name: 'Приглашение в систему',
    type: 'email',
    recipients: ['payer', 'employee'],
    subject: 'Приглашение в систему ГП Эко Оператор',
    body: 'Уважаемый {user_name},\n\nВы были приглашены в автоматизированную систему учёта утилизационного сбора ГП Эко Оператор.\n\nКомпания: {company_name}\nДата регистрации: {date}\n\nДля активации аккаунта перейдите по ссылке ниже.\n\nС уважением,\nАдминистрация ГП Эко Оператор',
    variables: ['{company_name}', '{user_name}', '{date}'],
    active: false,
    createdAt: '2025-02-01',
    updatedAt: '2025-02-01',
  },
])

// --- Stats ---
const stats = computed(() => ({
  total: templates.value.length,
  active: templates.value.filter(t => t.active).length,
  email: templates.value.filter(t => t.type === 'email' || t.type === 'all').length,
  sms: templates.value.filter(t => t.type === 'sms' || t.type === 'all').length,
}))

// --- Filters ---
const searchQuery = ref('')
const filterType = ref('')
const filterStatus = ref('')

const filteredTemplates = computed(() => {
  return templates.value.filter(t => {
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      if (!t.name.toLowerCase().includes(q) && !t.subject.toLowerCase().includes(q)) return false
    }
    if (filterType.value && t.type !== filterType.value) return false
    if (filterStatus.value === 'active' && !t.active) return false
    if (filterStatus.value === 'inactive' && t.active) return false
    return true
  })
})

// --- Modal state ---
const showModal = ref(false)
const isEditing = ref(false)
const templateBodyRef = ref<HTMLTextAreaElement | null>(null)

const formData = reactive({
  id: 0,
  name: '',
  type: 'email' as 'email' | 'sms' | 'push' | 'all',
  recipients: [] as string[],
  subject: '',
  body: '',
  active: true,
})

const resetForm = () => {
  formData.id = 0
  formData.name = ''
  formData.type = 'email'
  formData.recipients = []
  formData.subject = ''
  formData.body = ''
  formData.active = true
}

const openCreateModal = () => {
  resetForm()
  isEditing.value = false
  showModal.value = true
}

const openEditModal = (template: NotificationTemplate) => {
  formData.id = template.id
  formData.name = template.name
  formData.type = template.type
  formData.recipients = [...template.recipients]
  formData.subject = template.subject
  formData.body = template.body
  formData.active = template.active
  isEditing.value = true
  showModal.value = true
}

const duplicateTemplate = (template: NotificationTemplate) => {
  formData.id = 0
  formData.name = template.name + ' ' + t('adminNotifications.copySuffix')
  formData.type = template.type
  formData.recipients = [...template.recipients]
  formData.subject = template.subject
  formData.body = template.body
  formData.active = false
  isEditing.value = false
  showModal.value = true
}

const saveTemplate = () => {
  const now = new Date().toISOString().split('T')[0]
  const usedVariables = availableVariables.value
    .filter(v => formData.body.includes(v.key) || formData.subject.includes(v.key))
    .map(v => v.key)

  if (isEditing.value) {
    const idx = templates.value.findIndex(t => t.id === formData.id)
    if (idx !== -1) {
      templates.value[idx] = {
        ...templates.value[idx],
        name: formData.name,
        type: formData.type,
        recipients: [...formData.recipients],
        subject: formData.subject,
        body: formData.body,
        variables: usedVariables,
        active: formData.active,
        updatedAt: now,
      }
    }
  } else {
    const newId = Math.max(...templates.value.map(t => t.id)) + 1
    templates.value.push({
      id: newId,
      name: formData.name,
      type: formData.type,
      recipients: [...formData.recipients],
      subject: formData.subject,
      body: formData.body,
      variables: usedVariables,
      active: formData.active,
      createdAt: now,
      updatedAt: now,
    })
  }
  showModal.value = false
}

const insertVariable = (variable: string) => {
  const textarea = templateBodyRef.value
  if (textarea) {
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const before = formData.body.substring(0, start)
    const after = formData.body.substring(end)
    formData.body = before + variable + after
    nextTick(() => {
      textarea.focus()
      textarea.selectionStart = start + variable.length
      textarea.selectionEnd = start + variable.length
    })
  } else {
    formData.body += variable
  }
}

// --- Delete confirmation ---
const showDeleteModal = ref(false)
const deleteTarget = ref<NotificationTemplate | null>(null)

const openDeleteModal = (template: NotificationTemplate) => {
  deleteTarget.value = template
  showDeleteModal.value = true
}

const confirmDelete = () => {
  if (deleteTarget.value) {
    templates.value = templates.value.filter(t => t.id !== deleteTarget.value!.id)
  }
  showDeleteModal.value = false
  deleteTarget.value = null
}

// --- Toggle template status ---
const toggleTemplateStatus = (template: NotificationTemplate) => {
  template.active = !template.active
  template.updatedAt = new Date().toISOString().split('T')[0]
}

// --- Preview ---
const previewBody = computed(() => {
  let text = formData.body
  const sampleValues: Record<string, string> = {
    '{company_name}': 'ОсОО "ЭкоСервис"',
    '{user_name}': 'Асанов А.К.',
    '{amount}': '45 000',
    '{date}': '03.02.2025',
    '{deadline}': '25.02.2025',
    '{status}': 'Одобрено',
    '{document_id}': 'DEC-2025-0042',
    '{period}': 'Январь 2025',
  }
  for (const [key, value] of Object.entries(sampleValues)) {
    text = text.replaceAll(key, value)
  }
  return text
})

const previewSubject = computed(() => {
  let text = formData.subject
  const sampleValues: Record<string, string> = {
    '{company_name}': 'ОсОО "ЭкоСервис"',
    '{user_name}': 'Асанов А.К.',
    '{amount}': '45 000',
    '{date}': '03.02.2025',
    '{deadline}': '25.02.2025',
    '{status}': 'Одобрено',
    '{document_id}': 'DEC-2025-0042',
    '{period}': 'Январь 2025',
  }
  for (const [key, value] of Object.entries(sampleValues)) {
    text = text.replaceAll(key, value)
  }
  return text
})

// --- Helpers ---
const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    email: 'Email',
    sms: 'SMS',
    push: 'Push',
    all: t('adminNotifications.typeAll'),
  }
  return labels[type] || type
}

const getTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    email: 'bg-blue-100 text-blue-700',
    sms: 'bg-green-100 text-green-700',
    push: 'bg-purple-100 text-purple-700',
    all: 'bg-amber-100 text-amber-700',
  }
  return colors[type] || 'bg-gray-100 text-gray-700'
}

const getRecipientLabel = (recipient: string) => {
  const labels: Record<string, string> = {
    payer: t('adminNotifications.recipientPayer'),
    employee: t('adminNotifications.recipientEmployee'),
    'eco-operator': t('adminNotifications.recipientEcoOperator'),
    admin: t('adminNotifications.recipientAdmin'),
  }
  return labels[recipient] || recipient
}

const handleOverlay = (e: MouseEvent) => {
  if (e.target === e.currentTarget) {
    showModal.value = false
    showDeleteModal.value = false
  }
}

const toggleRecipient = (value: string) => {
  const idx = formData.recipients.indexOf(value)
  if (idx === -1) {
    formData.recipients.push(value)
  } else {
    formData.recipients.splice(idx, 1)
  }
}

// --- Show preview panel ---
const showPreview = ref(false)
</script>

<template>
  <DashboardLayout
    role="admin"
    :roleTitle="roleTitle"
    userName="Иван Петров"
    :menuItems="menuItems"
  >
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-[#415861]">{{ $t('adminNotifications.pageTitle') }}</h1>
          <p class="text-[#64748b] mt-1">{{ $t('adminNotifications.pageSubtitle') }}</p>
        </div>
        <button
          @click="openCreateModal"
          class="px-5 py-2.5 bg-[#0e888d] text-white rounded-xl font-medium hover:bg-[#0b7276] transition-colors flex items-center gap-2 shadow-sm"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          {{ $t('adminNotifications.createTemplate') }}
        </button>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-[#64748b]">{{ $t('adminNotifications.totalTemplates') }}</p>
              <p class="text-2xl font-bold text-[#415861] mt-1">{{ stats.total }}</p>
            </div>
            <div class="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-[#64748b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-[#64748b]">{{ $t('adminNotifications.activeTemplates') }}</p>
              <p class="text-2xl font-bold text-[#0e888d] mt-1">{{ stats.active }}</p>
            </div>
            <div class="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-[#0e888d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-[#64748b]">{{ $t('adminNotifications.emailNotifications') }}</p>
              <p class="text-2xl font-bold text-blue-600 mt-1">{{ stats.email }}</p>
            </div>
            <div class="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-[#64748b]">{{ $t('adminNotifications.smsNotifications') }}</p>
              <p class="text-2xl font-bold text-green-600 mt-1">{{ stats.sms }}</p>
            </div>
            <div class="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] p-5">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Search -->
          <div>
            <label class="block text-sm font-medium text-[#415861] mb-1">{{ $t('adminNotifications.searchByName') }}</label>
            <div class="relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                v-model="searchQuery"
                type="text"
                :placeholder="$t('adminNotifications.searchPlaceholder')"
                class="w-full pl-9 pr-3 py-2 border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#0e888d] focus:border-[#0e888d] text-sm"
              />
            </div>
          </div>

          <!-- Type filter -->
          <div>
            <label class="block text-sm font-medium text-[#415861] mb-1">{{ $t('adminNotifications.notificationType') }}</label>
            <select
              v-model="filterType"
              class="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#0e888d] focus:border-[#0e888d] text-sm"
            >
              <option value="">{{ $t('adminNotifications.allTypes') }}</option>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="push">Push</option>
              <option value="all">{{ $t('adminNotifications.allChannels') }}</option>
            </select>
          </div>

          <!-- Status filter -->
          <div>
            <label class="block text-sm font-medium text-[#415861] mb-1">{{ $t('adminNotifications.status') }}</label>
            <select
              v-model="filterStatus"
              class="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#0e888d] focus:border-[#0e888d] text-sm"
            >
              <option value="">{{ $t('adminNotifications.allStatuses') }}</option>
              <option value="active">{{ $t('adminNotifications.statusActive') }}</option>
              <option value="inactive">{{ $t('adminNotifications.statusInactive') }}</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Templates Table -->
      <div class="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-[#f8fafc] border-b border-[#e2e8f0]">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wider">{{ $t('adminNotifications.colTemplateName') }}</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wider">{{ $t('adminNotifications.colType') }}</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wider">{{ $t('adminNotifications.colRecipients') }}</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wider">{{ $t('adminNotifications.colVariables') }}</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-[#64748b] uppercase tracking-wider">{{ $t('adminNotifications.colStatus') }}</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wider">{{ $t('adminNotifications.colUpdated') }}</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-[#64748b] uppercase tracking-wider">{{ $t('adminNotifications.colActions') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#e2e8f0]">
              <tr
                v-for="template in filteredTemplates"
                :key="template.id"
                class="hover:bg-[#f8fafc] transition-colors"
              >
                <!-- Name -->
                <td class="px-4 py-4">
                  <div class="text-sm font-semibold text-[#415861]">{{ template.name }}</div>
                  <div v-if="template.subject" class="text-xs text-[#64748b] mt-0.5 truncate max-w-[220px]" :title="template.subject">
                    {{ template.subject }}
                  </div>
                </td>

                <!-- Type -->
                <td class="px-4 py-4">
                  <span :class="['inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium', getTypeColor(template.type)]">
                    {{ getTypeLabel(template.type) }}
                  </span>
                </td>

                <!-- Recipients -->
                <td class="px-4 py-4">
                  <div class="flex flex-wrap gap-1">
                    <span
                      v-for="recipient in template.recipients"
                      :key="recipient"
                      class="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-[#415861]"
                    >
                      {{ getRecipientLabel(recipient) }}
                    </span>
                  </div>
                </td>

                <!-- Variables -->
                <td class="px-4 py-4">
                  <div class="flex flex-wrap gap-1 max-w-[200px]">
                    <span
                      v-for="variable in template.variables.slice(0, 3)"
                      :key="variable"
                      class="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-[#0e888d]/10 text-[#0e888d] font-mono"
                    >
                      {{ variable }}
                    </span>
                    <span
                      v-if="template.variables.length > 3"
                      class="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 text-[#64748b]"
                    >
                      +{{ template.variables.length - 3 }}
                    </span>
                  </div>
                </td>

                <!-- Status toggle -->
                <td class="px-4 py-4 text-center">
                  <button
                    @click="toggleTemplateStatus(template)"
                    :class="[
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                      template.active ? 'bg-[#0e888d]' : 'bg-gray-300'
                    ]"
                    :title="template.active ? $t('adminNotifications.statusActive') : $t('adminNotifications.statusInactive')"
                  >
                    <span
                      :class="[
                        'inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm',
                        template.active ? 'translate-x-6' : 'translate-x-1'
                      ]"
                    />
                  </button>
                  <div class="text-xs mt-1" :class="template.active ? 'text-[#0e888d]' : 'text-[#64748b]'">
                    {{ template.active ? $t('adminNotifications.statusActive') : $t('adminNotifications.statusInactive') }}
                  </div>
                </td>

                <!-- Updated -->
                <td class="px-4 py-4">
                  <div class="text-sm text-[#64748b]">{{ template.updatedAt }}</div>
                </td>

                <!-- Actions -->
                <td class="px-4 py-4">
                  <div class="flex items-center justify-center gap-1">
                    <button
                      @click="openEditModal(template)"
                      class="p-2 text-[#64748b] hover:text-[#0e888d] hover:bg-[#0e888d]/5 rounded-lg transition-colors"
                      :title="$t('adminNotifications.editTooltip')"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      @click="duplicateTemplate(template)"
                      class="p-2 text-[#64748b] hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      :title="$t('adminNotifications.duplicateTooltip')"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <button
                      @click="openDeleteModal(template)"
                      class="p-2 text-[#64748b] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      :title="$t('adminNotifications.deleteTooltip')"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty state -->
        <div v-if="filteredTemplates.length === 0" class="px-6 py-12 text-center">
          <svg class="w-12 h-12 text-[#e2e8f0] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p class="text-[#64748b] font-medium">{{ $t('adminNotifications.templatesNotFound') }}</p>
          <p class="text-sm text-[#64748b] mt-1">{{ $t('adminNotifications.tryChangeFilters') }}</p>
        </div>

        <!-- Table footer -->
        <div class="px-6 py-4 border-t border-[#e2e8f0] flex items-center justify-between bg-[#f8fafc]">
          <p class="text-sm text-[#64748b]">
            {{ $t('adminNotifications.shownOf', { filtered: filteredTemplates.length, total: templates.length }) }}
          </p>
        </div>
      </div>
    </div>

    <!-- Create / Edit Template Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click="handleOverlay">
          <div class="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[92vh] overflow-hidden flex flex-col">
            <!-- Modal Header -->
            <div class="p-6 border-b border-[#e2e8f0] flex-shrink-0">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-xl font-bold text-[#415861]">
                    {{ isEditing ? $t('adminNotifications.editTemplate') : $t('adminNotifications.createNotificationTemplate') }}
                  </h3>
                  <p class="text-sm text-[#64748b] mt-1">{{ $t('adminNotifications.fillTemplateParams') }}</p>
                </div>
                <button @click="showModal = false" class="p-2 text-[#64748b] hover:text-[#415861] rounded-lg hover:bg-gray-100 transition-colors">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Modal Body -->
            <div class="flex-1 overflow-y-auto p-6">
              <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Left column: form fields -->
                <div class="lg:col-span-2 space-y-5">
                  <!-- Template name -->
                  <div>
                    <label class="block text-sm font-medium text-[#415861] mb-1.5">{{ $t('adminNotifications.templateName') }}</label>
                    <input
                      v-model="formData.name"
                      type="text"
                      :placeholder="$t('adminNotifications.templateNamePlaceholder')"
                      class="w-full px-4 py-2.5 border border-[#e2e8f0] rounded-xl focus:ring-2 focus:ring-[#0e888d] focus:border-[#0e888d] text-sm"
                    />
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <!-- Type -->
                    <div>
                      <label class="block text-sm font-medium text-[#415861] mb-1.5">{{ $t('adminNotifications.notificationType') }}</label>
                      <select
                        v-model="formData.type"
                        class="w-full px-4 py-2.5 border border-[#e2e8f0] rounded-xl focus:ring-2 focus:ring-[#0e888d] focus:border-[#0e888d] text-sm"
                      >
                        <option value="email">Email</option>
                        <option value="sms">SMS</option>
                        <option value="push">{{ $t('adminNotifications.pushNotification') }}</option>
                        <option value="all">{{ $t('adminNotifications.allChannels') }}</option>
                      </select>
                    </div>

                    <!-- Active toggle -->
                    <div>
                      <label class="block text-sm font-medium text-[#415861] mb-1.5">{{ $t('adminNotifications.templateStatus') }}</label>
                      <div class="flex items-center gap-3 h-[42px]">
                        <button
                          @click="formData.active = !formData.active"
                          :class="[
                            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                            formData.active ? 'bg-[#0e888d]' : 'bg-gray-300'
                          ]"
                        >
                          <span
                            :class="[
                              'inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm',
                              formData.active ? 'translate-x-6' : 'translate-x-1'
                            ]"
                          />
                        </button>
                        <span class="text-sm" :class="formData.active ? 'text-[#0e888d] font-medium' : 'text-[#64748b]'">
                          {{ formData.active ? $t('adminNotifications.statusActive') : $t('adminNotifications.statusInactive') }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Recipients -->
                  <div>
                    <label class="block text-sm font-medium text-[#415861] mb-1.5">{{ $t('adminNotifications.recipients') }}</label>
                    <div class="flex flex-wrap gap-2">
                      <button
                        v-for="option in recipientOptions"
                        :key="option.value"
                        @click="toggleRecipient(option.value)"
                        :class="[
                          'px-3 py-2 rounded-xl text-sm font-medium border transition-colors',
                          formData.recipients.includes(option.value)
                            ? 'bg-[#0e888d] text-white border-[#0e888d]'
                            : 'bg-white text-[#415861] border-[#e2e8f0] hover:border-[#0e888d] hover:text-[#0e888d]'
                        ]"
                      >
                        {{ option.label }}
                      </button>
                    </div>
                  </div>

                  <!-- Subject (for email) -->
                  <div v-if="formData.type === 'email' || formData.type === 'all'">
                    <label class="block text-sm font-medium text-[#415861] mb-1.5">{{ $t('adminNotifications.emailSubject') }}</label>
                    <input
                      v-model="formData.subject"
                      type="text"
                      :placeholder="$t('adminNotifications.emailSubjectPlaceholder')"
                      class="w-full px-4 py-2.5 border border-[#e2e8f0] rounded-xl focus:ring-2 focus:ring-[#0e888d] focus:border-[#0e888d] text-sm"
                    />
                  </div>

                  <!-- Body -->
                  <div>
                    <label class="block text-sm font-medium text-[#415861] mb-1.5">{{ $t('adminNotifications.templateBody') }}</label>
                    <textarea
                      ref="templateBodyRef"
                      v-model="formData.body"
                      rows="10"
                      :placeholder="$t('adminNotifications.templateBodyPlaceholder')"
                      class="w-full px-4 py-3 border border-[#e2e8f0] rounded-xl focus:ring-2 focus:ring-[#0e888d] focus:border-[#0e888d] text-sm font-mono leading-relaxed resize-y"
                    ></textarea>
                  </div>

                  <!-- Preview toggle -->
                  <div>
                    <button
                      @click="showPreview = !showPreview"
                      class="flex items-center gap-2 text-sm font-medium text-[#0e888d] hover:text-[#0b7276] transition-colors"
                    >
                      <svg
                        :class="['w-4 h-4 transition-transform', showPreview ? 'rotate-90' : '']"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                      </svg>
                      {{ showPreview ? $t('adminNotifications.hidePreview') : $t('adminNotifications.showPreview') }}
                    </button>
                  </div>

                  <!-- Preview -->
                  <Transition name="slide">
                    <div v-if="showPreview" class="border border-[#e2e8f0] rounded-xl overflow-hidden">
                      <div class="bg-[#f8fafc] px-4 py-3 border-b border-[#e2e8f0]">
                        <div class="flex items-center gap-2">
                          <svg class="w-4 h-4 text-[#0e888d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span class="text-sm font-medium text-[#415861]">{{ $t('adminNotifications.previewWithSampleData') }}</span>
                        </div>
                      </div>
                      <div class="p-4">
                        <div v-if="formData.subject && (formData.type === 'email' || formData.type === 'all')" class="mb-3 pb-3 border-b border-[#e2e8f0]">
                          <p class="text-xs text-[#64748b] mb-1">{{ $t('adminNotifications.subjectLabel') }}</p>
                          <p class="text-sm font-medium text-[#415861]">{{ previewSubject }}</p>
                        </div>
                        <div class="text-sm text-[#415861] whitespace-pre-wrap leading-relaxed">{{ previewBody }}</div>
                      </div>
                    </div>
                  </Transition>
                </div>

                <!-- Right column: variables panel -->
                <div class="lg:col-span-1">
                  <div class="bg-[#f8fafc] rounded-xl border border-[#e2e8f0] p-4 sticky top-0">
                    <h4 class="text-sm font-semibold text-[#415861] mb-3 flex items-center gap-2">
                      <svg class="w-4 h-4 text-[#0e888d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      {{ $t('adminNotifications.availableVariables') }}
                    </h4>
                    <p class="text-xs text-[#64748b] mb-4">
                      {{ $t('adminNotifications.variableHint') }}
                    </p>
                    <div class="space-y-2">
                      <button
                        v-for="variable in availableVariables"
                        :key="variable.key"
                        @click="insertVariable(variable.key)"
                        class="w-full flex items-center justify-between px-3 py-2.5 bg-white border border-[#e2e8f0] rounded-lg hover:border-[#0e888d] hover:bg-[#0e888d]/5 transition-colors group"
                      >
                        <span class="text-xs font-mono text-[#0e888d] bg-[#0e888d]/10 px-2 py-0.5 rounded-full group-hover:bg-[#0e888d]/20 transition-colors">
                          {{ variable.key }}
                        </span>
                        <span class="text-xs text-[#64748b] ml-2 text-right">{{ variable.label }}</span>
                      </button>
                    </div>

                    <div class="mt-5 pt-4 border-t border-[#e2e8f0]">
                      <h4 class="text-xs font-semibold text-[#415861] mb-2 uppercase tracking-wider">{{ $t('adminNotifications.tipTitle') }}</h4>
                      <p class="text-xs text-[#64748b] leading-relaxed">
                        {{ $t('adminNotifications.tipText', { variable: '{company_name}' }) }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="p-6 border-t border-[#e2e8f0] flex items-center justify-between flex-shrink-0 bg-[#f8fafc]">
              <button
                @click="showModal = false"
                class="px-5 py-2.5 bg-white border border-[#e2e8f0] text-[#415861] rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                {{ $t('adminNotifications.cancel') }}
              </button>
              <div class="flex items-center gap-3">
                <button
                  @click="showPreview = !showPreview"
                  class="px-5 py-2.5 bg-white border border-[#e2e8f0] text-[#415861] rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {{ $t('adminNotifications.preview') }}
                </button>
                <button
                  @click="saveTemplate"
                  :disabled="!formData.name || !formData.body || formData.recipients.length === 0"
                  class="px-6 py-2.5 bg-[#0e888d] text-white rounded-xl font-medium hover:bg-[#0b7276] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  {{ isEditing ? $t('adminNotifications.saveChanges') : $t('adminNotifications.createTemplate') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showDeleteModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click="handleOverlay">
          <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div class="p-6 border-b border-[#e2e8f0]">
              <h3 class="text-xl font-bold text-[#415861]">{{ $t('adminNotifications.deleteTemplateTitle') }}</h3>
            </div>

            <div class="p-6">
              <div v-if="deleteTarget" class="space-y-4">
                <div class="flex items-center gap-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm text-red-800 font-medium">{{ $t('adminNotifications.deleteConfirmText') }}</p>
                    <p class="text-xs text-red-600 mt-1">{{ $t('adminNotifications.deleteIrreversible') }}</p>
                  </div>
                </div>

                <div class="p-4 bg-[#f8fafc] rounded-xl border border-[#e2e8f0]">
                  <p class="text-sm text-[#64748b]">{{ $t('adminNotifications.templateLabel') }}</p>
                  <p class="font-semibold text-[#415861]">{{ deleteTarget.name }}</p>
                  <div class="flex items-center gap-2 mt-2">
                    <span :class="['text-xs px-2 py-0.5 rounded-full font-medium', getTypeColor(deleteTarget.type)]">
                      {{ getTypeLabel(deleteTarget.type) }}
                    </span>
                    <span class="text-xs text-[#64748b]">
                      {{ deleteTarget.active ? $t('adminNotifications.statusActive') : $t('adminNotifications.statusInactive') }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div class="p-6 border-t border-[#e2e8f0] flex justify-end gap-3">
              <button
                @click="showDeleteModal = false"
                class="px-5 py-2.5 bg-white border border-[#e2e8f0] text-[#415861] rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                {{ $t('adminNotifications.cancel') }}
              </button>
              <button
                @click="confirmDelete"
                class="px-5 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {{ $t('adminNotifications.delete') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </DashboardLayout>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  max-height: 0;
  overflow: hidden;
}
.slide-enter-to,
.slide-leave-from {
  opacity: 1;
  max-height: 600px;
  overflow: hidden;
}
</style>
