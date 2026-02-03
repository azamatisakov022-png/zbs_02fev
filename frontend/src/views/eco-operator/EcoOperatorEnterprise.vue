<script setup lang="ts">
import { ref } from 'vue'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import { icons } from '../../utils/menuIcons'

const menuItems = [
  { id: 'dashboard', label: 'Главная', icon: icons.dashboard, route: '/eco-operator' },
  { id: 'incoming-declarations', label: 'Входящие декларации', icon: icons.document, route: '/eco-operator/incoming-declarations' },
  { id: 'incoming-reports', label: 'Входящие отчёты', icon: icons.report, route: '/eco-operator/incoming-reports' },
  { id: 'enterprise', label: 'Моё предприятие', icon: icons.building, route: '/eco-operator/enterprise' },
  { id: 'licenses', label: 'Лицензии и документы', icon: icons.license, route: '/eco-operator/licenses' },
  { id: 'waste-types', label: 'Виды отходов', icon: icons.recycle, route: '/eco-operator/waste-types' },
  { id: 'my-reports', label: 'Мои отчёты', icon: icons.registries, route: '/eco-operator/my-reports' },
  { id: 'payments', label: 'Аналитика платежей', icon: icons.money, route: '/eco-operator/payments' },
  { id: 'analytics', label: 'Аналитика', icon: icons.analytics, route: '/eco-operator/analytics' },
  { id: 'profile', label: 'Профили компаний', icon: icons.profile, route: '/eco-operator/profile' },
]

const isEditing = ref(false)

const enterpriseData = ref({
  name: 'ОсОО "ЭкоПереработка"',
  region: 'Чуйская область, г. Бишкек',
  activityType: 'Переработка пластиковых отходов',
  inn: '01234567891234',
  director: 'Асанов Бакыт Жумабекович',
  phone: '+996 555 123 456',
  email: 'info@ecopererabotka.kg',
  address: 'г. Бишкек, ул. Промышленная, 45',
  capacity: '500 тонн/месяц',
  wasteTypes: ['Пластик (ПЭТ)', 'Пластик (ПНД)', 'Бумага', 'Картон'],
  licenseNumber: 'ЛП-2024-0045',
  licenseDate: '15.08.2024 — 15.08.2026',
})
</script>

<template>
  <DashboardLayout
    role="eco-operator"
    roleTitle="Эко Оператор"
    userName="ОсОО «ЭкоПереработка»"
    :menuItems="menuItems"
  >
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <h2 class="text-2xl font-bold text-[#415861]">Моё предприятие</h2>
      <button
        @click="isEditing = !isEditing"
        :class="[
          'flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-colors',
          isEditing
            ? 'bg-green-500 text-white hover:bg-green-600'
            : 'bg-[#0e888d] text-white hover:bg-[#0a6d71]'
        ]"
      >
        <svg v-if="!isEditing" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        {{ isEditing ? 'Сохранить' : 'Редактировать' }}
      </button>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-[#e5e7eb] overflow-hidden">
      <!-- Header -->
      <div class="bg-gradient-to-r from-[#0e888d] to-[#0a6d71] p-6 text-white">
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center">
            <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <h3 class="text-xl font-bold">{{ enterpriseData.name }}</h3>
            <p class="opacity-90">{{ enterpriseData.activityType }}</p>
          </div>
        </div>
      </div>

      <!-- Form -->
      <div class="p-6 lg:p-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Left Column -->
          <div class="space-y-5">
            <div>
              <label class="block text-sm font-medium text-[#70868f] mb-2">Наименование</label>
              <input
                v-model="enterpriseData.name"
                :disabled="!isEditing"
                :class="[
                  'w-full px-4 py-3 rounded-xl border-2 transition-colors',
                  isEditing
                    ? 'border-[#e5e7eb] focus:border-[#0e888d] focus:outline-none bg-white'
                    : 'border-transparent bg-[#f8fafc] text-[#415861]'
                ]"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-[#70868f] mb-2">Регион</label>
              <input
                v-model="enterpriseData.region"
                :disabled="!isEditing"
                :class="[
                  'w-full px-4 py-3 rounded-xl border-2 transition-colors',
                  isEditing
                    ? 'border-[#e5e7eb] focus:border-[#0e888d] focus:outline-none bg-white'
                    : 'border-transparent bg-[#f8fafc] text-[#415861]'
                ]"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-[#70868f] mb-2">Вид деятельности</label>
              <input
                v-model="enterpriseData.activityType"
                :disabled="!isEditing"
                :class="[
                  'w-full px-4 py-3 rounded-xl border-2 transition-colors',
                  isEditing
                    ? 'border-[#e5e7eb] focus:border-[#0e888d] focus:outline-none bg-white'
                    : 'border-transparent bg-[#f8fafc] text-[#415861]'
                ]"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-[#70868f] mb-2">ИНН</label>
              <input
                v-model="enterpriseData.inn"
                :disabled="!isEditing"
                :class="[
                  'w-full px-4 py-3 rounded-xl border-2 transition-colors font-mono',
                  isEditing
                    ? 'border-[#e5e7eb] focus:border-[#0e888d] focus:outline-none bg-white'
                    : 'border-transparent bg-[#f8fafc] text-[#415861]'
                ]"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-[#70868f] mb-2">Мощность переработки</label>
              <input
                v-model="enterpriseData.capacity"
                :disabled="!isEditing"
                :class="[
                  'w-full px-4 py-3 rounded-xl border-2 transition-colors',
                  isEditing
                    ? 'border-[#e5e7eb] focus:border-[#0e888d] focus:outline-none bg-white'
                    : 'border-transparent bg-[#f8fafc] text-[#415861]'
                ]"
              />
            </div>
          </div>

          <!-- Right Column -->
          <div class="space-y-5">
            <div>
              <label class="block text-sm font-medium text-[#70868f] mb-2">Руководитель</label>
              <input
                v-model="enterpriseData.director"
                :disabled="!isEditing"
                :class="[
                  'w-full px-4 py-3 rounded-xl border-2 transition-colors',
                  isEditing
                    ? 'border-[#e5e7eb] focus:border-[#0e888d] focus:outline-none bg-white'
                    : 'border-transparent bg-[#f8fafc] text-[#415861]'
                ]"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-[#70868f] mb-2">Телефон</label>
              <input
                v-model="enterpriseData.phone"
                :disabled="!isEditing"
                :class="[
                  'w-full px-4 py-3 rounded-xl border-2 transition-colors',
                  isEditing
                    ? 'border-[#e5e7eb] focus:border-[#0e888d] focus:outline-none bg-white'
                    : 'border-transparent bg-[#f8fafc] text-[#415861]'
                ]"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-[#70868f] mb-2">Email</label>
              <input
                v-model="enterpriseData.email"
                :disabled="!isEditing"
                :class="[
                  'w-full px-4 py-3 rounded-xl border-2 transition-colors',
                  isEditing
                    ? 'border-[#e5e7eb] focus:border-[#0e888d] focus:outline-none bg-white'
                    : 'border-transparent bg-[#f8fafc] text-[#415861]'
                ]"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-[#70868f] mb-2">Адрес</label>
              <input
                v-model="enterpriseData.address"
                :disabled="!isEditing"
                :class="[
                  'w-full px-4 py-3 rounded-xl border-2 transition-colors',
                  isEditing
                    ? 'border-[#e5e7eb] focus:border-[#0e888d] focus:outline-none bg-white'
                    : 'border-transparent bg-[#f8fafc] text-[#415861]'
                ]"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-[#70868f] mb-2">Номер лицензии</label>
              <div class="px-4 py-3 rounded-xl bg-[#f8fafc] text-[#415861] font-mono">
                {{ enterpriseData.licenseNumber }}
              </div>
            </div>
          </div>
        </div>

        <!-- Waste Types -->
        <div class="mt-6">
          <label class="block text-sm font-medium text-[#70868f] mb-3">Виды перерабатываемых отходов</label>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="type in enterpriseData.wasteTypes"
              :key="type"
              class="px-4 py-2 rounded-full bg-[#e8f5f5] text-[#0e888d] font-medium text-sm"
            >
              {{ type }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>
