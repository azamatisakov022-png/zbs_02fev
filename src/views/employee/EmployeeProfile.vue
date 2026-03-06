<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import SectionGuide from '../../components/common/SectionGuide.vue'
import { useEmployeeMenu } from '../../composables/useRoleMenu'
import { toastStore } from '../../stores/toast'
import { authStore } from '../../stores/auth'
import { AppButton, AppInput, AppCard } from '../../components/ui'

const { t } = useI18n()
const router = useRouter()
const { roleTitle, menuItems } = useEmployeeMenu()

// User data
const userData = ref({
  firstName: 'Айгуль',
  lastName: 'Мамытова',
  middleName: 'Бакытовна',
  position: 'Ведущий специалист',
  department: 'Отдел учёта и контроля отходов',
  employeeId: 'ЭКО-2021-0456',
  email: 'a.mamytova@mpretn.gov.kg',
  phone: '+996 312 62-05-47',
  mobilePhone: '+996 555 12-34-56',
  startDate: '2021-03-15',
})

// Permissions
const permissions = computed(() => [
  { name: t('employeeProfile.permViewApplications'), granted: true },
  { name: t('employeeProfile.permProcessApplications'), granted: true },
  { name: t('employeeProfile.permIssueLicenses'), granted: true },
  { name: t('employeeProfile.permManageOrganizations'), granted: true },
  { name: t('employeeProfile.permEditRegistries'), granted: false },
  { name: t('employeeProfile.permAccessAnalytics'), granted: true },
  { name: t('employeeProfile.permExportData'), granted: true },
  { name: t('employeeProfile.permSystemAdmin'), granted: false },
])

// Activity log
const activityLog = ref([
  { action: 'Одобрена заявка #2024-1245', date: '2024-01-15 14:32', type: 'success' },
  { action: 'Выдана лицензия ЛЦ-2024/0089', date: '2024-01-15 11:20', type: 'success' },
  { action: 'Отклонена заявка #2024-1238', date: '2024-01-14 16:45', type: 'warning' },
  { action: 'Обновлены данные организации', date: '2024-01-14 10:15', type: 'info' },
  { action: 'Авторизация в системе', date: '2024-01-14 09:00', type: 'info' },
])

// Stats
const stats = ref({
  applicationsProcessed: 342,
  licensesIssued: 89,
  organizationsRegistered: 156,
  daysWorked: 720,
})

// Settings
const notificationSettings = ref({
  emailNotifications: true,
  newApplications: true,
  deadlineReminders: true,
  systemUpdates: false,
})

// Security
const securityData = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
  twoFactorEnabled: true,
})

// Edit state
const editingSection = ref<string | null>(null)
const saving = ref(false)

const saveSection = async () => {
  saving.value = true
  await new Promise(resolve => setTimeout(resolve, 1000))
  saving.value = false
  editingSection.value = null
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString()
}

const changePassword = async () => {
  if (securityData.value.newPassword !== securityData.value.confirmPassword) {
    toastStore.show({ type: 'error', title: t('employeeProfile.toastErrorTitle'), message: t('employeeProfile.toastPasswordMismatch') })
    return
  }
  saving.value = true
  await new Promise(resolve => setTimeout(resolve, 1000))
  saving.value = false
  securityData.value = { currentPassword: '', newPassword: '', confirmPassword: '', twoFactorEnabled: securityData.value.twoFactorEnabled }
  toastStore.show({ type: 'success', title: t('employeeProfile.toastPasswordChanged') })
}
</script>

<template>
  <DashboardLayout
    role="employee"
    :roleTitle="roleTitle"
    userName="Мамытова Айгуль"
    :menuItems="menuItems"
  >
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold text-gray-900">{{ $t('pages.employee.profileTitle') }}</h1>
        <p class="text-gray-600 mt-1">{{ $t('pages.employee.profileSubtitle') }}</p>
      </div>

      <SectionGuide
        :title="$t('employeeProfile.sectionGuideTitle')"
        :description="$t('employeeProfile.sectionGuideDesc')"
        :actions="[$t('employeeProfile.actionEditPersonal'), $t('employeeProfile.actionChangePassword'), $t('employeeProfile.actionNotificationSettings')]"
        storageKey="employee-profile"
      />

      <!-- Profile Card -->
      <div class="bg-gradient-to-r from-sky-600 to-blue-600 rounded-2xl p-6 text-white">
        <div class="flex items-center gap-6">
          <div class="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center">
            <span class="text-4xl font-bold">{{ userData.firstName[0] }}{{ userData.lastName[0] }}</span>
          </div>
          <div class="flex-1">
            <h2 class="text-2xl font-bold">{{ userData.lastName }} {{ userData.firstName }} {{ userData.middleName }}</h2>
            <p class="text-sky-100 mt-1">{{ userData.position }}</p>
            <p class="text-sky-200 text-sm">{{ userData.department }}</p>
            <div class="flex items-center gap-4 mt-3">
              <span class="px-3 py-1 bg-white/20 rounded-full text-sm">ID: {{ userData.employeeId }}</span>
              <span class="px-3 py-1 bg-white/20 rounded-full text-sm">{{ $t('employeeProfile.since') }} {{ formatDate(userData.startDate) }}</span>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="text-center p-4 bg-white/10 rounded-xl">
              <p class="text-3xl font-bold">{{ stats.applicationsProcessed }}</p>
              <p class="text-xs text-sky-100">{{ $t('employeeProfile.applicationsProcessed') }}</p>
            </div>
            <div class="text-center p-4 bg-white/10 rounded-xl">
              <p class="text-3xl font-bold">{{ stats.licensesIssued }}</p>
              <p class="text-xs text-sky-100">{{ $t('employeeProfile.licensesIssued') }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <AppCard radius="sm" padding="none" :title="$t('employeeProfile.personalData')" :headerBorder="true">
            <template #header-actions>
              <AppButton
                v-if="editingSection !== 'personal'"
                variant="ghost"
                size="sm"
                @click="editingSection = 'personal'"
              >
                {{ $t('common.edit') }}
              </AppButton>
            </template>
            <div class="p-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-500 mb-1">{{ $t('employeeProfile.lastName') }}</label>
                  <AppInput
                    v-if="editingSection === 'personal'"
                    v-model="userData.lastName"
                    hideLabel
                    labelColor="#6b7280"
                  />
                  <p v-else class="text-gray-900">{{ userData.lastName }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-500 mb-1">{{ $t('employeeProfile.firstName') }}</label>
                  <AppInput
                    v-if="editingSection === 'personal'"
                    v-model="userData.firstName"
                    hideLabel
                    labelColor="#6b7280"
                  />
                  <p v-else class="text-gray-900">{{ userData.firstName }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-500 mb-1">{{ $t('employeeProfile.middleName') }}</label>
                  <AppInput
                    v-if="editingSection === 'personal'"
                    v-model="userData.middleName"
                    hideLabel
                    labelColor="#6b7280"
                  />
                  <p v-else class="text-gray-900">{{ userData.middleName }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-500 mb-1">{{ $t('employeeProfile.position') }}</label>
                  <p class="text-gray-900">{{ userData.position }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-500 mb-1">{{ $t('employeeProfile.email') }}</label>
                  <p class="text-gray-900">{{ userData.email }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-500 mb-1">{{ $t('employeeProfile.workPhone') }}</label>
                  <AppInput
                    v-if="editingSection === 'personal'"
                    v-model="userData.phone"
                    type="tel"
                    hideLabel
                    labelColor="#6b7280"
                  />
                  <p v-else class="text-gray-900">{{ userData.phone }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-500 mb-1">{{ $t('employeeProfile.mobilePhone') }}</label>
                  <AppInput
                    v-if="editingSection === 'personal'"
                    v-model="userData.mobilePhone"
                    type="tel"
                    hideLabel
                    labelColor="#6b7280"
                  />
                  <p v-else class="text-gray-900">{{ userData.mobilePhone }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-500 mb-1">{{ $t('employeeProfile.startDate') }}</label>
                  <p class="text-gray-900">{{ formatDate(userData.startDate) }}</p>
                </div>
              </div>
              <div v-if="editingSection === 'personal'" class="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                <AppButton variant="secondary" @click="editingSection = null">{{ $t('common.cancel') }}</AppButton>
                <AppButton variant="primary" @click="saveSection" :disabled="saving" :loading="saving">{{ saving ? $t('common.loading') : $t('common.save') }}</AppButton>
              </div>
            </div>
          </AppCard>

          <AppCard radius="sm" padding="none" :title="$t('employeeProfile.notificationSettings')" :headerBorder="true">
            <div class="p-6 space-y-4">
              <label class="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <div>
                  <p class="font-medium text-gray-900">{{ $t('employeeProfile.emailNotifications') }}</p>
                  <p class="text-sm text-gray-500">{{ $t('employeeProfile.emailNotificationsDesc') }}</p>
                </div>
                <div class="relative">
                  <input type="checkbox" v-model="notificationSettings.emailNotifications" class="sr-only" />
                  <div :class="['w-11 h-6 rounded-full transition-colors', notificationSettings.emailNotifications ? 'bg-sky-600' : 'bg-gray-300']">
                    <div :class="['w-5 h-5 bg-white rounded-full shadow transform transition-transform', notificationSettings.emailNotifications ? 'translate-x-5' : 'translate-x-0.5']" style="margin-top: 2px;"></div>
                  </div>
                </div>
              </label>
              <label class="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <div>
                  <p class="font-medium text-gray-900">{{ $t('employeeProfile.newApplications') }}</p>
                  <p class="text-sm text-gray-500">{{ $t('employeeProfile.newApplicationsDesc') }}</p>
                </div>
                <div class="relative">
                  <input type="checkbox" v-model="notificationSettings.newApplications" class="sr-only" />
                  <div :class="['w-11 h-6 rounded-full transition-colors', notificationSettings.newApplications ? 'bg-sky-600' : 'bg-gray-300']">
                    <div :class="['w-5 h-5 bg-white rounded-full shadow transform transition-transform', notificationSettings.newApplications ? 'translate-x-5' : 'translate-x-0.5']" style="margin-top: 2px;"></div>
                  </div>
                </div>
              </label>
              <label class="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <div>
                  <p class="font-medium text-gray-900">{{ $t('employeeProfile.deadlineReminders') }}</p>
                  <p class="text-sm text-gray-500">{{ $t('employeeProfile.deadlineRemindersDesc') }}</p>
                </div>
                <div class="relative">
                  <input type="checkbox" v-model="notificationSettings.deadlineReminders" class="sr-only" />
                  <div :class="['w-11 h-6 rounded-full transition-colors', notificationSettings.deadlineReminders ? 'bg-sky-600' : 'bg-gray-300']">
                    <div :class="['w-5 h-5 bg-white rounded-full shadow transform transition-transform', notificationSettings.deadlineReminders ? 'translate-x-5' : 'translate-x-0.5']" style="margin-top: 2px;"></div>
                  </div>
                </div>
              </label>
            </div>
          </AppCard>

          <AppCard radius="sm" padding="none" :title="$t('employeeProfile.security')" :headerBorder="true">
            <div class="p-6 space-y-6">
              <div>
                <h4 class="font-medium text-gray-900 mb-4">{{ $t('employeeProfile.changePassword') }}</h4>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <AppInput v-model="securityData.currentPassword" type="password" :label="$t('employeeProfile.currentPassword')" placeholder="••••••••" labelColor="#6b7280" />
                  </div>
                  <div>
                    <AppInput v-model="securityData.newPassword" type="password" :label="$t('employeeProfile.newPassword')" placeholder="••••••••" labelColor="#6b7280" />
                  </div>
                  <div>
                    <AppInput v-model="securityData.confirmPassword" type="password" :label="$t('employeeProfile.confirmPassword')" placeholder="••••••••" labelColor="#6b7280" />
                  </div>
                </div>
                <AppButton variant="primary" class="mt-4" @click="changePassword" :disabled="!securityData.currentPassword || !securityData.newPassword">{{ $t('employeeProfile.changePasswordBtn') }}</AppButton>
              </div>

              <div class="pt-6 border-t border-gray-200">
                <div class="flex items-center justify-between">
                  <div>
                    <h4 class="font-medium text-gray-900">{{ $t('employeeProfile.twoFactorAuth') }}</h4>
                    <p class="text-sm text-gray-500">{{ $t('employeeProfile.twoFactorAuthDesc') }}</p>
                  </div>
                  <span class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">{{ $t('employeeProfile.twoFactorEnabled') }}</span>
                </div>
              </div>
            </div>
          </AppCard>
        </div>

        <div class="space-y-6">
          <AppCard radius="sm" padding="none" :title="$t('employeeProfile.accessRights')" :headerBorder="true">
            <div class="p-4">
              <div class="space-y-2">
                <div v-for="perm in permissions" :key="perm.name" class="flex items-center justify-between p-2">
                  <span class="text-sm" :class="perm.granted ? 'text-gray-900' : 'text-gray-400'">{{ perm.name }}</span>
                  <span v-if="perm.granted" class="text-green-500">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span v-else class="text-gray-300">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </AppCard>

          <AppCard radius="sm" padding="none" :title="$t('employeeProfile.recentActions')" :headerBorder="true">
            <div class="p-4">
              <div class="space-y-4">
                <div v-for="log in activityLog" :key="log.date" class="flex items-start gap-3">
                  <div
                    class="w-2 h-2 rounded-full mt-2"
                    :class="log.type === 'success' ? 'bg-green-500' : log.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'"
                  ></div>
                  <div>
                    <p class="text-sm text-gray-900">{{ log.action }}</p>
                    <p class="text-xs text-gray-500">{{ log.date }}</p>
                  </div>
                </div>
              </div>
              <AppButton variant="ghost" fullWidth class="mt-4" @click="toastStore.show({ type: 'info', title: $t('employeeProfile.toastLogTitle'), message: $t('employeeProfile.toastLogMessage') })">
                {{ $t('employeeProfile.showAll') }}
              </AppButton>
            </div>
          </AppCard>

          <AppCard radius="sm" padding="sm" :title="$t('employeeProfile.currentSession')">
            <div class="space-y-3">
              <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div class="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-900">Windows — Chrome</p>
                  <p class="text-xs text-gray-500">{{ $t('employeeProfile.sessionLocation') }}</p>
                </div>
              </div>
            </div>
            <AppButton variant="danger" fullWidth class="mt-4" @click="authStore.logout(); router.push('/login')">
              {{ $t('employeeProfile.logoutBtn') }}
            </AppButton>
          </AppCard>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>
