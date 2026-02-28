<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface License {
  id: string
  organization: string
  type: string
  issueDate: string
  expiryDate: string
  status: 'active' | 'pending' | 'expired'
}

// Statistics
const stats = {
  total: 47,
  active: 38,
  pending: 6,
  expired: 3
}

// Sample data
const licenses: License[] = [
  { id: 'ЛИЦ-2024-001', organization: 'ОсОО «ЭкоТранс»', type: 'Сбор и транспортировка', issueDate: '15.01.2024', expiryDate: '15.01.2029', status: 'active' },
  { id: 'ЛИЦ-2024-002', organization: 'ОсОО «ГринПлюс»', type: 'Переработка отходов', issueDate: '10.01.2024', expiryDate: '10.01.2029', status: 'active' },
  { id: 'ЛИЦ-2024-003', organization: 'ОсОО «ЭкоСервис»', type: 'Сбор и транспортировка', issueDate: '05.01.2024', expiryDate: '05.01.2029', status: 'pending' },
  { id: 'ЛИЦ-2023-045', organization: 'ОсОО «РециклКГ»', type: 'Утилизация', issueDate: '20.12.2023', expiryDate: '20.12.2028', status: 'active' },
  { id: 'ЛИЦ-2023-044', organization: 'ОсОО «КлинСити»', type: 'Сбор и транспортировка', issueDate: '15.12.2023', expiryDate: '15.12.2028', status: 'expired' },
  { id: 'ЛИЦ-2023-043', organization: 'ОсОО «ВэйстПро»', type: 'Переработка отходов', issueDate: '10.12.2023', expiryDate: '10.12.2028', status: 'active' },
  { id: 'ЛИЦ-2023-042', organization: 'ОсОО «ЭкоЛайн»', type: 'Сбор и транспортировка', issueDate: '05.12.2023', expiryDate: '05.12.2028', status: 'pending' },
  { id: 'ЛИЦ-2023-041', organization: 'ОсОО «ГринВэй»', type: 'Утилизация', issueDate: '01.12.2023', expiryDate: '01.12.2028', status: 'active' },
]

const getStatusLabel = (status: License['status']) => {
  switch (status) {
    case 'active': return t('status.valid')
    case 'pending': return t('status.review')
    case 'expired': return t('status.expired')
  }
}

const getStatusClass = (status: License['status']) => {
  switch (status) {
    case 'active': return 'bg-[#d4f5d4] text-[#0e888d]'
    case 'pending': return 'bg-[#fff1d1] text-[#b8860b]'
    case 'expired': return 'bg-[#ffdddc] text-[#c0392b]'
  }
}

const handleView = (_license: License) => {
  // TODO: Implement view logic
}

</script>

<template>
  <div class="py-10 lg:py-[60px]">
    <!-- Page header with button on same line -->
    <div class="container-main">
      <div>
        <h1 class="text-2xl md:text-[28px] lg:text-[30px] font-bold text-[#415861] uppercase mb-2 lg:mb-[8px]">
          {{ $t('publicLicenses.title') }}
        </h1>
        <p class="text-base md:text-lg lg:text-[20px] font-medium text-[#415861] mb-6 lg:mb-[30px]">
          {{ $t('publicLicenses.subtitle') }}
        </p>
      </div>
    </div>

    <!-- Statistics cards -->
    <div class="container-main">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-[30px] pb-8 lg:pb-[40px]">
        <!-- Total -->
        <div class="bg-white border-2 border-[#e5e5e5] rounded-[30px] p-6 text-center">
          <div class="text-4xl lg:text-[56px] font-bold text-[#415861] mb-2">{{ stats.total }}</div>
          <div class="text-sm lg:text-base font-medium text-[#415861]">{{ $t('publicLicenses.totalLicenses') }}</div>
        </div>
        <!-- Active -->
        <div class="bg-[#fff1d1] rounded-[30px] p-6 text-center">
          <div class="text-4xl lg:text-[56px] font-bold text-[#415861] mb-2">{{ stats.active }}</div>
          <div class="text-sm lg:text-base font-medium text-[#415861]">{{ $t('publicLicenses.activeLicenses') }}</div>
        </div>
        <!-- Pending -->
        <div class="bg-[#d4f5e9] rounded-[30px] p-6 text-center">
          <div class="text-4xl lg:text-[56px] font-bold text-[#415861] mb-2">{{ stats.pending }}</div>
          <div class="text-sm lg:text-base font-medium text-[#415861]">{{ $t('publicLicenses.pendingLicenses') }}</div>
        </div>
        <!-- Expired -->
        <div class="bg-[#ffdddc] rounded-[30px] p-6 text-center">
          <div class="text-4xl lg:text-[56px] font-bold text-[#415861] mb-2">{{ stats.expired }}</div>
          <div class="text-sm lg:text-base font-medium text-[#415861]">{{ $t('publicLicenses.expiredLicenses') }}</div>
        </div>
      </div>
    </div>

    <!-- Table section -->
    <div class="container-main">
      <!-- Desktop table -->
      <div class="hidden xl:block">
        <div class="bg-[#f5f5f5] flex flex-col gap-px">
          <!-- Table header -->
          <div class="flex gap-px">
            <div class="bg-[#f8fafc] flex items-center justify-center px-5 py-4 w-[140px]">
              <span class="text-[18px] font-medium text-black">№</span>
            </div>
            <div class="bg-[#f8fafc] flex items-center px-5 py-4 w-[200px]">
              <span class="text-[18px] font-medium text-black">{{ $t('publicLicenses.organization') }}</span>
            </div>
            <div class="bg-[#f8fafc] flex items-center px-5 py-4 flex-1">
              <span class="text-[18px] font-medium text-black">{{ $t('publicLicenses.licenseType') }}</span>
            </div>
            <div class="bg-[#f8fafc] flex items-center justify-center px-3 py-4 w-[130px]">
              <span class="text-[18px] font-medium text-black">{{ $t('publicLicenses.issueDate') }}</span>
            </div>
            <div class="bg-[#f8fafc] flex items-center justify-center px-3 py-4 w-[130px]">
              <span class="text-[18px] font-medium text-black">{{ $t('publicLicenses.validityPeriod') }}</span>
            </div>
            <div class="bg-[#f8fafc] flex items-center justify-center px-3 py-4 w-[140px]">
              <span class="text-[18px] font-medium text-black">{{ $t('publicLicenses.status') }}</span>
            </div>
            <div class="bg-[#f8fafc] flex items-center justify-center px-3 py-4 w-[120px]">
              <span class="text-[18px] font-medium text-black">{{ $t('publicLicenses.actions') }}</span>
            </div>
          </div>

          <!-- Table rows -->
          <div
            v-for="license in licenses"
            :key="license.id"
            class="flex gap-px"
          >
            <div class="bg-white flex items-center justify-center px-5 py-4 w-[140px]">
              <span class="text-[16px] font-medium text-black">{{ license.id }}</span>
            </div>
            <div class="bg-white flex items-center px-5 py-4 w-[200px]">
              <span class="text-[16px] font-medium text-black">{{ license.organization }}</span>
            </div>
            <div class="bg-white flex items-center px-5 py-4 flex-1">
              <span class="text-[16px] font-medium text-black">{{ license.type }}</span>
            </div>
            <div class="bg-white flex items-center justify-center px-3 py-4 w-[130px]">
              <span class="text-[16px] font-medium text-black">{{ license.issueDate }}</span>
            </div>
            <div class="bg-white flex items-center justify-center px-3 py-4 w-[130px]">
              <span class="text-[16px] font-medium text-black">{{ license.expiryDate }}</span>
            </div>
            <div class="bg-white flex items-center justify-center px-3 py-4 w-[140px]">
              <span
                :class="getStatusClass(license.status)"
                class="text-[12px] font-medium px-3 py-1 rounded-[8px]"
              >
                {{ getStatusLabel(license.status) }}
              </span>
            </div>
            <div class="bg-white flex items-center justify-center px-3 py-4 w-[120px]">
              <button
                @click="handleView(license)"
                class="text-[#0e888d] text-[14px] font-medium hover:underline"
              >
                {{ $t('publicLicenses.view') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Mobile/Tablet cards -->
      <div class="xl:hidden flex flex-col gap-4">
        <div
          v-for="license in licenses"
          :key="license.id"
          class="bg-white border border-[#f5f5f5] rounded-[20px] p-5 shadow-sm"
        >
          <div class="flex items-start justify-between mb-3">
            <span class="text-[#0e888d] font-bold text-sm">{{ license.id }}</span>
            <span
              :class="getStatusClass(license.status)"
              class="text-[11px] font-medium px-2 py-1 rounded-[6px]"
            >
              {{ getStatusLabel(license.status) }}
            </span>
          </div>
          <h3 class="text-[#415861] font-bold text-base mb-2">
            {{ license.organization }}
          </h3>
          <p class="text-[#415861] text-sm mb-3">{{ license.type }}</p>
          <div class="flex items-center gap-4 text-sm text-[#415861] mb-4">
            <div>
              <span class="opacity-60">{{ $t('publicLicenses.issued') }}</span> {{ license.issueDate }}
            </div>
            <div>
              <span class="opacity-60">{{ $t('publicLicenses.until') }}</span> {{ license.expiryDate }}
            </div>
          </div>
          <button
            @click="handleView(license)"
            class="w-full bg-[#0e888d] text-white text-sm font-medium py-2 rounded-[12px] hover:bg-[#0a6d71] transition-colors"
          >
            {{ $t('publicLicenses.view') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
