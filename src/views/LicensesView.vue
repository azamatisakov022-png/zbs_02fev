<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Button from '@/components/ui/general/Button.vue'

const { t } = useI18n()

type LicenseStatus = 'active' | 'review' | 'expired'

const statusConfig = computed(() => ({
  active: { label: t('licenses.status.active'), bg: 'rgba(14,136,141,0.2)', text: '#0e888d' },
  review: { label: t('licenses.status.review'), bg: 'rgba(254,166,41,0.2)', text: '#fea629' },
  expired: { label: t('licenses.status.expired'), bg: 'rgba(255,86,82,0.2)', text: '#ff5652' },
}) as Record<LicenseStatus, { label: string; bg: string; text: string }>)

const stats = computed(() => [
  { number: 47, label: t('licenses.stats.total'), bg: 'bg-bg-light', text: 'text-text-main' },
  { number: 38, label: t('licenses.stats.active'), bg: 'bg-success-light', text: 'text-primary' },
  { number: 6, label: t('licenses.stats.review'), bg: 'bg-warning-light', text: 'text-accent' },
  { number: 3, label: t('licenses.stats.expired'), bg: 'bg-error-light', text: 'text-error' },
])

const licenses = Array.from({ length: 22 }, (_, i) => ({
  id: i + 1,
  number: 'ЛИЦ-2024-001',
  org: 'ОсОО «ЭкоТранс»',
  type: 'Сбор и транспортировка',
  issueDate: '15.01.2024',
  validUntil: '15.01.2029',
  status: (i === 2 ? 'review' : i === 10 ? 'expired' : 'active') as LicenseStatus,
}))
</script>

<template>
  <div class="licenses-page">
  <div class="container-main licenses-container">
    <!-- Title Section -->
    <div class="licenses-header">
      <div class="licenses-header-row">
        <div class="licenses-title-group">
          <h1 class="section-title">
            {{ $t('licenses.title') }}
          </h1>
          <p class="section-subtitle">
            {{ $t('licenses.subtitle') }}
          </p>
        </div>
        <Button tag="router-link" to="#" variant="primary" size="md" class="shrink-0">
          {{ $t('licenses.applyBtn') }}
        </Button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="licenses-stats">
      <div class="licenses-stats-grid">
        <div
          v-for="(stat, i) in stats"
          :key="i"
          :class="[stat.bg, 'stat-card']"
        >
          <span :class="['stat-number', stat.text]">
            {{ stat.number }}
          </span>
          <span :class="['stat-label', stat.text]">
            {{ stat.label }}
          </span>
        </div>
      </div>
    </div>

    <!-- Desktop Table -->
    <div class="licenses-table-desktop licenses-table-scroll">
      <div class="table-wrapper">
      <!-- Table Header -->
      <div class="table-header">
        <div class="table-cell w-[149px]">
          <span class="table-cell-text">{{ $t('licenses.table.number') }}</span>
        </div>
        <div class="table-cell w-[322px]">
          <span class="table-cell-text">{{ $t('licenses.table.organization') }}</span>
        </div>
        <div class="table-cell w-[282px] justify-center">
          <span class="table-cell-text">{{ $t('licenses.table.licenseType') }}</span>
        </div>
        <div class="table-cell w-[150px] justify-center">
          <span class="table-cell-text">{{ $t('licenses.table.issueDate') }}</span>
        </div>
        <div class="table-cell w-[150px] justify-center">
          <span class="table-cell-text">{{ $t('licenses.table.validUntil') }}</span>
        </div>
        <div class="table-cell w-[150px] justify-center">
          <span class="table-cell-text">{{ $t('licenses.table.status') }}</span>
        </div>
        <div class="table-cell w-[150px] justify-center">
          <span class="table-cell-text">{{ $t('licenses.table.actions') }}</span>
        </div>
      </div>

      <!-- Table Rows -->
      <div
        v-for="lic in licenses"
        :key="lic.id"
        class="table-row"
      >
        <div class="table-cell w-[149px]">
          <span class="table-cell-text">{{ lic.number }}</span>
        </div>
        <div class="table-cell w-[322px]">
          <span class="table-cell-text">{{ lic.org }}</span>
        </div>
        <div class="table-cell w-[282px]">
          <span class="table-cell-text">{{ lic.type }}</span>
        </div>
        <div class="table-cell w-[150px] justify-center">
          <span class="table-cell-text">{{ lic.issueDate }}</span>
        </div>
        <div class="table-cell w-[150px] justify-center">
          <span class="table-cell-text">{{ lic.validUntil }}</span>
        </div>
        <div class="table-cell w-[150px] justify-center">
          <span
            class="badge"
            :style="{ backgroundColor: statusConfig[lic.status].bg, color: statusConfig[lic.status].text }"
          >
            {{ statusConfig[lic.status].label }}
          </span>
        </div>
        <div class="table-cell w-[150px] justify-center">
          <Button variant="primary" size="xs">
            {{ $t('licenses.view') }}
          </Button>
        </div>
      </div>
    </div>
    </div>

    <!-- Mobile Cards -->
    <div class="licenses-cards-mobile">
      <div
        v-for="lic in licenses"
        :key="lic.id"
        class="license-card"
      >
        <div class="license-card-header">
          <span class="license-card-num">{{ lic.number }}</span>
          <span
            class="license-card-badge"
            :style="{ backgroundColor: statusConfig[lic.status].bg, color: statusConfig[lic.status].text }"
          >
            {{ statusConfig[lic.status].label }}
          </span>
        </div>
        <p class="license-card-org">{{ lic.org }}</p>
        <p class="license-card-type">{{ lic.type }}</p>
        <div class="license-card-dates">
          <span>
            <span class="date-label">{{ $t('licenses.table.issueDate') }}</span>
            {{ lic.issueDate }}
          </span>
          <span>
            <span class="date-label">{{ $t('licenses.table.validUntil') }}</span>
            {{ lic.validUntil }}
          </span>
        </div>
        <div class="license-card-actions">
          <Button variant="primary" size="xs">{{ $t('licenses.view') }}</Button>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>

<style scoped src="@/assets/styles/views/licenses.css"></style>
