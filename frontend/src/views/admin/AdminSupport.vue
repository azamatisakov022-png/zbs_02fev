<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import { useAdminMenu } from '../../composables/useRoleMenu'

const { t } = useI18n()
const { roleTitle, menuItems } = useAdminMenu()

interface Ticket {
  id: number
  ticketNumber: string
  subject: string
  description: string
  category: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'new' | 'in_progress' | 'waiting' | 'resolved' | 'closed'
  user: string
  userRole: string
  organization: string
  email: string
  phone: string
  createdAt: string
  updatedAt: string
  assignee: string | null
  messages: Array<{
    id: number
    author: string
    isSupport: boolean
    message: string
    timestamp: string
    attachments?: string[]
  }>
}

const tickets = ref<Ticket[]>([
  {
    id: 1,
    ticketNumber: 'TK-2025-0234',
    subject: 'Не могу загрузить декларацию',
    description: 'При попытке загрузки декларации за январь 2025 система выдаёт ошибку "Файл слишком большой"',
    category: 'technical',
    priority: 'high',
    status: 'new',
    user: 'Касымов Р.Т.',
    userRole: 'business',
    organization: 'ОсОО "БишкекПласт"',
    email: 'kasymov@bishkekplast.kg',
    phone: '+996 701 234 567',
    createdAt: '2025-02-03 14:25',
    updatedAt: '2025-02-03 14:25',
    assignee: null,
    messages: [
      { id: 1, author: 'Касымов Р.Т.', isSupport: false, message: 'При попытке загрузки декларации за январь 2025 система выдаёт ошибку "Файл слишком большой". Размер файла 15 МБ.', timestamp: '2025-02-03 14:25' }
    ]
  },
  {
    id: 2,
    ticketNumber: 'TK-2025-0233',
    subject: 'Вопрос по расчёту утилизационного сбора',
    description: 'Как рассчитывается сбор для комбинированной упаковки (картон + пластик)?',
    category: 'consultation',
    priority: 'medium',
    status: 'in_progress',
    user: 'Нурланова А.К.',
    userRole: 'business',
    organization: 'ИП "Нурланова"',
    email: 'nurlanova@mail.kg',
    phone: '+996 702 345 678',
    createdAt: '2025-02-03 11:40',
    updatedAt: '2025-02-03 13:15',
    assignee: 'Иванов И.И.',
    messages: [
      { id: 1, author: 'Нурланова А.К.', isSupport: false, message: 'Как рассчитывается сбор для комбинированной упаковки (картон + пластик)?', timestamp: '2025-02-03 11:40' },
      { id: 2, author: 'Иванов И.И.', isSupport: true, message: 'Добрый день! Для комбинированной упаковки расчёт производится по каждому материалу отдельно, исходя из процентного соотношения компонентов. Направляю вам инструкцию.', timestamp: '2025-02-03 13:15', attachments: ['instruction.pdf'] }
    ]
  },
  {
    id: 3,
    ticketNumber: 'TK-2025-0232',
    subject: 'Запрос на корректировку данных',
    description: 'Прошу изменить юридический адрес организации',
    category: 'data_change',
    priority: 'low',
    status: 'waiting',
    user: 'Сергеев П.А.',
    userRole: 'business',
    organization: 'ОсОО "ЭкоТранс"',
    email: 'sergeev@ecotrans.kg',
    phone: '+996 705 456 789',
    createdAt: '2025-02-02 16:30',
    updatedAt: '2025-02-03 10:00',
    assignee: 'Петрова А.С.',
    messages: [
      { id: 1, author: 'Сергеев П.А.', isSupport: false, message: 'Прошу изменить юридический адрес организации с ул. Чуй, 100 на ул. Манаса, 50.', timestamp: '2025-02-02 16:30' },
      { id: 2, author: 'Петрова А.С.', isSupport: true, message: 'Для изменения юридического адреса необходимо приложить скан свидетельства о регистрации с новым адресом.', timestamp: '2025-02-03 10:00' }
    ]
  },
  {
    id: 4,
    ticketNumber: 'TK-2025-0231',
    subject: 'Проблема с доступом к личному кабинету',
    description: 'Не приходит код подтверждения на телефон',
    category: 'access',
    priority: 'critical',
    status: 'resolved',
    user: 'Алиев М.К.',
    userRole: 'eco-operator',
    organization: 'ОсОО "GreenRecycle"',
    email: 'aliev@greenrecycle.kg',
    phone: '+996 700 567 890',
    createdAt: '2025-02-02 09:15',
    updatedAt: '2025-02-02 11:30',
    assignee: 'Иванов И.И.',
    messages: [
      { id: 1, author: 'Алиев М.К.', isSupport: false, message: 'Не приходит код подтверждения на телефон +996 700 567 890', timestamp: '2025-02-02 09:15' },
      { id: 2, author: 'Иванов И.И.', isSupport: true, message: 'Проверили настройки SMS-шлюза. Проблема была на стороне оператора. Повторите попытку.', timestamp: '2025-02-02 10:45' },
      { id: 3, author: 'Алиев М.К.', isSupport: false, message: 'Спасибо, всё работает!', timestamp: '2025-02-02 11:30' }
    ]
  },
  {
    id: 5,
    ticketNumber: 'TK-2025-0230',
    subject: 'Предложение по улучшению интерфейса',
    description: 'Было бы удобно добавить фильтр по датам в отчётах',
    category: 'suggestion',
    priority: 'low',
    status: 'closed',
    user: 'Темирова Г.С.',
    userRole: 'employee',
    organization: 'ГП "Оператор РОП"',
    email: 'temirova@rop.gov.kg',
    phone: '+996 312 123 456',
    createdAt: '2025-01-30 14:00',
    updatedAt: '2025-02-01 16:00',
    assignee: 'Иванов И.И.',
    messages: [
      { id: 1, author: 'Темирова Г.С.', isSupport: false, message: 'Было бы удобно добавить фильтр по датам в отчётах переработчиков.', timestamp: '2025-01-30 14:00' },
      { id: 2, author: 'Иванов И.И.', isSupport: true, message: 'Спасибо за предложение! Добавили в план развития на Q2 2025.', timestamp: '2025-02-01 16:00' }
    ]
  },
])

// Filters
const statusFilter = ref('')
const priorityFilter = ref('')
const categoryFilter = ref('')
const searchQuery = ref('')

const categories = computed(() => [
  { value: 'technical', label: t('adminSupport.catTechnical') },
  { value: 'consultation', label: t('adminSupport.catConsultation') },
  { value: 'data_change', label: t('adminSupport.catDataChange') },
  { value: 'access', label: t('adminSupport.catAccess') },
  { value: 'suggestion', label: t('adminSupport.catSuggestion') },
  { value: 'other', label: t('adminSupport.catOther') },
])

const priorities = computed(() => [
  { value: 'low', label: t('adminSupport.prioLow'), color: 'bg-slate-100 text-slate-700' },
  { value: 'medium', label: t('adminSupport.prioMedium'), color: 'bg-blue-100 text-blue-700' },
  { value: 'high', label: t('adminSupport.prioHigh'), color: 'bg-orange-100 text-orange-700' },
  { value: 'critical', label: t('adminSupport.prioCritical'), color: 'bg-red-100 text-red-700' },
])

const statuses = computed(() => [
  { value: 'new', label: t('adminSupport.statusNew'), color: 'bg-rose-100 text-rose-700' },
  { value: 'in_progress', label: t('adminSupport.statusInProgress'), color: 'bg-blue-100 text-blue-700' },
  { value: 'waiting', label: t('adminSupport.statusWaiting'), color: 'bg-amber-100 text-amber-700' },
  { value: 'resolved', label: t('adminSupport.statusResolved'), color: 'bg-green-100 text-green-700' },
  { value: 'closed', label: t('adminSupport.statusClosed'), color: 'bg-gray-100 text-gray-500' },
])

const filteredTickets = computed(() => {
  return tickets.value.filter(ticket => {
    if (statusFilter.value && ticket.status !== statusFilter.value) return false
    if (priorityFilter.value && ticket.priority !== priorityFilter.value) return false
    if (categoryFilter.value && ticket.category !== categoryFilter.value) return false
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      return ticket.ticketNumber.toLowerCase().includes(q) ||
        ticket.subject.toLowerCase().includes(q) ||
        ticket.user.toLowerCase().includes(q) ||
        ticket.organization.toLowerCase().includes(q)
    }
    return true
  })
})

// Stats
const stats = computed(() => ({
  total: tickets.value.length,
  new: tickets.value.filter(t => t.status === 'new').length,
  inProgress: tickets.value.filter(t => t.status === 'in_progress').length,
  waiting: tickets.value.filter(t => t.status === 'waiting').length,
  resolved: tickets.value.filter(t => t.status === 'resolved' || t.status === 'closed').length,
}))

// Detail modal
const showDetailModal = ref(false)
const selectedTicket = ref<Ticket | null>(null)
const newMessage = ref('')

const openTicket = (ticket: Ticket) => {
  selectedTicket.value = ticket
  showDetailModal.value = true
}

const sendMessage = () => {
  if (!newMessage.value.trim() || !selectedTicket.value) return

  selectedTicket.value.messages.push({
    id: selectedTicket.value.messages.length + 1,
    author: 'Иванов И.И.',
    isSupport: true,
    message: newMessage.value,
    timestamp: new Date().toLocaleString()
  })

  newMessage.value = ''
}

const getStatusColor = (status: string) => {
  return statuses.value.find(s => s.value === status)?.color || 'bg-gray-100 text-gray-700'
}

const getStatusLabel = (status: string) => {
  return statuses.value.find(s => s.value === status)?.label || status
}

const getPriorityColor = (priority: string) => {
  return priorities.value.find(p => p.value === priority)?.color || 'bg-gray-100 text-gray-700'
}

const getPriorityLabel = (priority: string) => {
  return priorities.value.find(p => p.value === priority)?.label || priority
}

const getCategoryLabel = (category: string) => {
  return categories.value.find(c => c.value === category)?.label || category
}

const getRoleColor = (role: string) => {
  const colors: Record<string, string> = {
    admin: 'bg-rose-100 text-rose-700',
    employee: 'bg-sky-100 text-sky-700',
    business: 'bg-emerald-100 text-emerald-700',
    'eco-operator': 'bg-lime-100 text-lime-700',
  }
  return colors[role] || 'bg-gray-100 text-gray-700'
}

const getRoleLabel = (role: string) => {
  const labels: Record<string, string> = {
    admin: t('adminSupport.roleAdmin'),
    employee: t('adminSupport.roleEmployee'),
    business: t('adminSupport.roleBusiness'),
    'eco-operator': t('adminSupport.roleEcoOperator'),
  }
  return labels[role] || role
}

const assignToMe = () => {
  if (selectedTicket.value) {
    selectedTicket.value.assignee = 'Иванов И.И.'
    selectedTicket.value.status = 'in_progress'
  }
}

const changeStatus = (status: Ticket['status']) => {
  if (selectedTicket.value) {
    selectedTicket.value.status = status
  }
}
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
          <h1 class="text-2xl font-bold text-gray-900">{{ $t('adminSupport.title') }}</h1>
          <p class="text-gray-600 mt-1">{{ $t('adminSupport.subtitle') }}</p>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">{{ $t('adminSupport.statTotal') }}</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.total }}</p>
            </div>
            <div class="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">{{ $t('adminSupport.statNew') }}</p>
              <p class="text-2xl font-bold text-rose-600">{{ stats.new }}</p>
            </div>
            <div class="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">{{ $t('adminSupport.statInProgress') }}</p>
              <p class="text-2xl font-bold text-blue-600">{{ stats.inProgress }}</p>
            </div>
            <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">{{ $t('adminSupport.statWaiting') }}</p>
              <p class="text-2xl font-bold text-amber-600">{{ stats.waiting }}</p>
            </div>
            <div class="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">{{ $t('adminSupport.statResolved') }}</p>
              <p class="text-2xl font-bold text-green-600">{{ stats.resolved }}</p>
            </div>
            <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div class="flex flex-wrap items-center gap-4">
          <div class="flex-1 min-w-[200px]">
            <div class="relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                v-model="searchQuery"
                type="text"
                :placeholder="$t('adminSupport.searchPlaceholder')"
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              />
            </div>
          </div>

          <select
            v-model="statusFilter"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
          >
            <option value="">{{ $t('adminSupport.allStatuses') }}</option>
            <option v-for="status in statuses" :key="status.value" :value="status.value">
              {{ status.label }}
            </option>
          </select>

          <select
            v-model="priorityFilter"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
          >
            <option value="">{{ $t('adminSupport.allPriorities') }}</option>
            <option v-for="priority in priorities" :key="priority.value" :value="priority.value">
              {{ priority.label }}
            </option>
          </select>

          <select
            v-model="categoryFilter"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
          >
            <option value="">{{ $t('adminSupport.allCategories') }}</option>
            <option v-for="category in categories" :key="category.value" :value="category.value">
              {{ category.label }}
            </option>
          </select>
        </div>
      </div>

      <!-- Tickets List -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{{ $t('adminSupport.thNumber') }}</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{{ $t('adminSupport.thSubject') }}</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{{ $t('adminSupport.thUser') }}</th>
              <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{{ $t('adminSupport.thCategory') }}</th>
              <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{{ $t('adminSupport.thPriority') }}</th>
              <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{{ $t('adminSupport.thStatus') }}</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{{ $t('adminSupport.thAssignee') }}</th>
              <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">{{ $t('adminSupport.thDate') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="ticket in filteredTickets"
              :key="ticket.id"
              @click="openTicket(ticket)"
              class="hover:bg-gray-50 cursor-pointer"
            >
              <td class="px-4 py-3">
                <span class="font-mono text-sm text-rose-600">{{ ticket.ticketNumber }}</span>
              </td>
              <td class="px-4 py-3">
                <div class="font-medium text-gray-900">{{ ticket.subject }}</div>
                <div class="text-sm text-gray-500 truncate max-w-xs">{{ ticket.description }}</div>
              </td>
              <td class="px-4 py-3">
                <div class="text-sm font-medium text-gray-900">{{ ticket.user }}</div>
                <div class="flex items-center gap-2 mt-1">
                  <span :class="['text-xs px-1.5 py-0.5 rounded', getRoleColor(ticket.userRole)]">
                    {{ getRoleLabel(ticket.userRole) }}
                  </span>
                  <span class="text-xs text-gray-500">{{ ticket.organization }}</span>
                </div>
              </td>
              <td class="px-4 py-3 text-center">
                <span class="text-sm text-gray-600">{{ getCategoryLabel(ticket.category) }}</span>
              </td>
              <td class="px-4 py-3 text-center">
                <span :class="['text-xs px-2 py-1 rounded-full font-medium', getPriorityColor(ticket.priority)]">
                  {{ getPriorityLabel(ticket.priority) }}
                </span>
              </td>
              <td class="px-4 py-3 text-center">
                <span :class="['text-xs px-2 py-1 rounded-full font-medium', getStatusColor(ticket.status)]">
                  {{ getStatusLabel(ticket.status) }}
                </span>
              </td>
              <td class="px-4 py-3">
                <span v-if="ticket.assignee" class="text-sm text-gray-700">{{ ticket.assignee }}</span>
                <span v-else class="text-sm text-gray-400">—</span>
              </td>
              <td class="px-4 py-3 text-center">
                <div class="text-sm text-gray-900">{{ ticket.createdAt.split(' ')[0] }}</div>
                <div class="text-xs text-gray-500">{{ ticket.createdAt.split(' ')[1] }}</div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Empty state -->
        <div v-if="filteredTickets.length === 0" class="p-12 text-center">
          <svg class="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <p class="text-gray-500">{{ $t('adminSupport.emptyState') }}</p>
        </div>

        <!-- Pagination -->
        <div class="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <p class="text-sm text-gray-500">{{ $t('adminSupport.shown') }} {{ filteredTickets.length }} {{ $t('adminSupport.tickets') }}</p>
          <div class="flex items-center gap-2">
            <button class="px-3 py-1 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">{{ $t('adminSupport.prevPage') }}</button>
            <button class="px-3 py-1 bg-rose-600 text-white rounded-lg">1</button>
            <button class="px-3 py-1 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">{{ $t('adminSupport.nextPage') }}</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Ticket Detail Modal -->
    <Teleport to="body">
      <div v-if="showDetailModal && selectedTicket" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          <!-- Modal Header -->
          <div class="p-6 border-b border-gray-200">
            <div class="flex items-start justify-between">
              <div>
                <div class="flex items-center gap-3 mb-2">
                  <span class="font-mono text-rose-600">{{ selectedTicket.ticketNumber }}</span>
                  <span :class="['text-xs px-2 py-1 rounded-full font-medium', getStatusColor(selectedTicket.status)]">
                    {{ getStatusLabel(selectedTicket.status) }}
                  </span>
                  <span :class="['text-xs px-2 py-1 rounded-full font-medium', getPriorityColor(selectedTicket.priority)]">
                    {{ getPriorityLabel(selectedTicket.priority) }}
                  </span>
                </div>
                <h3 class="text-xl font-bold text-gray-900">{{ selectedTicket.subject }}</h3>
              </div>
              <button @click="showDetailModal = false" class="p-2 text-gray-400 hover:text-gray-600">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Modal Content -->
          <div class="flex-1 overflow-y-auto">
            <div class="flex">
              <!-- Messages -->
              <div class="flex-1 p-6 border-r border-gray-200">
                <h4 class="font-semibold text-gray-900 mb-4">{{ $t('adminSupport.conversation') }}</h4>

                <div class="space-y-4 mb-6">
                  <div
                    v-for="message in selectedTicket.messages"
                    :key="message.id"
                    :class="[
                      'p-4 rounded-xl',
                      message.isSupport ? 'bg-rose-50 ml-8' : 'bg-gray-50 mr-8'
                    ]"
                  >
                    <div class="flex items-center justify-between mb-2">
                      <span class="font-medium text-gray-900">{{ message.author }}</span>
                      <span class="text-xs text-gray-500">{{ message.timestamp }}</span>
                    </div>
                    <p class="text-gray-700">{{ message.message }}</p>
                    <div v-if="message.attachments" class="mt-2 flex gap-2">
                      <span
                        v-for="file in message.attachments"
                        :key="file"
                        class="text-xs px-2 py-1 bg-white rounded border border-gray-200 text-gray-600"
                      >
                        📎 {{ file }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Reply Form -->
                <div class="border-t border-gray-200 pt-4">
                  <textarea
                    v-model="newMessage"
                    rows="3"
                    :placeholder="$t('adminSupport.replyPlaceholder')"
                    class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 resize-none"
                  ></textarea>
                  <div class="flex items-center justify-between mt-3">
                    <button class="text-gray-500 hover:text-gray-700">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                    </button>
                    <button
                      @click="sendMessage"
                      :disabled="!newMessage.trim()"
                      class="px-4 py-2 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {{ $t('adminSupport.sendBtn') }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- Sidebar -->
              <div class="w-72 p-6">
                <h4 class="font-semibold text-gray-900 mb-4">{{ $t('adminSupport.infoTitle') }}</h4>

                <div class="space-y-4">
                  <div>
                    <label class="text-xs text-gray-500 uppercase">{{ $t('adminSupport.labelUser') }}</label>
                    <p class="font-medium text-gray-900">{{ selectedTicket.user }}</p>
                    <span :class="['text-xs px-1.5 py-0.5 rounded', getRoleColor(selectedTicket.userRole)]">
                      {{ getRoleLabel(selectedTicket.userRole) }}
                    </span>
                  </div>

                  <div>
                    <label class="text-xs text-gray-500 uppercase">{{ $t('adminSupport.labelOrganization') }}</label>
                    <p class="text-gray-900">{{ selectedTicket.organization }}</p>
                  </div>

                  <div>
                    <label class="text-xs text-gray-500 uppercase">{{ $t('adminSupport.labelEmail') }}</label>
                    <p class="text-gray-900">{{ selectedTicket.email }}</p>
                  </div>

                  <div>
                    <label class="text-xs text-gray-500 uppercase">{{ $t('adminSupport.labelPhone') }}</label>
                    <p class="text-gray-900">{{ selectedTicket.phone }}</p>
                  </div>

                  <div>
                    <label class="text-xs text-gray-500 uppercase">{{ $t('adminSupport.labelCategory') }}</label>
                    <p class="text-gray-900">{{ getCategoryLabel(selectedTicket.category) }}</p>
                  </div>

                  <div>
                    <label class="text-xs text-gray-500 uppercase">{{ $t('adminSupport.labelCreated') }}</label>
                    <p class="text-gray-900">{{ selectedTicket.createdAt }}</p>
                  </div>

                  <div>
                    <label class="text-xs text-gray-500 uppercase">{{ $t('adminSupport.labelUpdated') }}</label>
                    <p class="text-gray-900">{{ selectedTicket.updatedAt }}</p>
                  </div>

                  <div>
                    <label class="text-xs text-gray-500 uppercase">{{ $t('adminSupport.labelAssignee') }}</label>
                    <p v-if="selectedTicket.assignee" class="text-gray-900">{{ selectedTicket.assignee }}</p>
                    <button
                      v-else
                      @click="assignToMe"
                      class="text-rose-600 hover:text-rose-700 font-medium"
                    >
                      {{ $t('adminSupport.takeInWork') }}
                    </button>
                  </div>
                </div>

                <div class="mt-6 pt-6 border-t border-gray-200">
                  <label class="text-xs text-gray-500 uppercase mb-2 block">{{ $t('adminSupport.changeStatus') }}</label>
                  <div class="flex flex-wrap gap-2">
                    <button
                      v-for="status in statuses"
                      :key="status.value"
                      @click="changeStatus(status.value as Ticket['status'])"
                      :class="[
                        'text-xs px-2 py-1 rounded-full font-medium transition-all',
                        selectedTicket.status === status.value
                          ? status.color + ' ring-2 ring-offset-1 ring-rose-300'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      ]"
                    >
                      {{ status.label }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </DashboardLayout>
</template>
