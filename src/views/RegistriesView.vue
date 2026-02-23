<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Select from '@/components/ui/general/Select.vue'
import Button from '@/components/ui/general/Button.vue'
import Input from '@/components/ui/general/Input.vue'

const { t } = useI18n()

type RegistryStatus = 'active' | 'review' | 'suspended'

const statusConfig = computed(() => ({
  active: { label: t('registriesPage.status.active'), bg: 'rgba(14,136,141,0.2)', text: '#0e888d' },
  review: { label: t('registriesPage.status.review'), bg: 'rgba(255,183,27,0.2)', text: '#fea629' },
  suspended: { label: t('registriesPage.status.suspended'), bg: 'rgba(255,86,82,0.2)', text: '#ff5652' },
}) as Record<RegistryStatus, { label: string; bg: string; text: string }>)

const tabs = computed(() => [
  { id: 'payers', label: t('registriesPage.tabs.payers'), count: 1247 },
  { id: 'processors', label: t('registriesPage.tabs.processors'), count: 89 },
  { id: 'polygons', label: t('registriesPage.tabs.polygons'), count: 47 },
])

const regions = computed(() => [
  { name: t('regions.mapLabels.talas'), count: 4, top: '11%', left: 'calc(50% - 198px)' },
  { name: t('regions.mapLabels.chuy'), count: 2, top: '4.5%', left: '50%' },
  { name: t('regions.mapLabels.issykKul'), count: 1, top: '20%', left: 'calc(50% + 201px)' },
  { name: t('regions.mapLabels.jalalAbad'), count: 7, top: '37.5%', left: 'calc(50% - 140px)' },
  { name: t('regions.mapLabels.naryn'), count: 7, top: '38%', left: 'calc(50% + 56px)' },
  { name: t('regions.mapLabels.osh'), count: 12, top: '67%', left: 'calc(50% - 44px)' },
  { name: t('regions.mapLabels.batken'), count: 19, top: '63%', left: 'calc(50% - 304px)' },
])

const registries = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  name: 'ОсОО «ЭкоИмпорт»',
  region: 'г. Бишкек',
  activity: 'Импорт пластиковой упаковки',
  status: (i === 3 ? 'review' : i === 7 ? 'suspended' : 'active') as RegistryStatus,
}))

const activeTab = ref('payers')

const typeOptions = computed(() => [
  { value: '', label: t('registriesPage.typeOptions.all') },
  { value: 'payers', label: t('registriesPage.typeOptions.payers') },
  { value: 'processors', label: t('registriesPage.typeOptions.processors') },
  { value: 'polygons', label: t('registriesPage.typeOptions.polygons') },
])

const regionOptions = computed(() => [
  { value: '', label: t('regions.allRegions') },
  { value: 'bishkek', label: t('regions.bishkek') },
  { value: 'chuy', label: t('regions.chuy') },
  { value: 'osh', label: t('regions.osh') },
  { value: 'jalal-abad', label: t('regions.jalalAbad') },
  { value: 'naryn', label: t('regions.naryn') },
  { value: 'talas', label: t('regions.talas') },
  { value: 'issyk-kul', label: t('regions.issykKul') },
  { value: 'batken', label: t('regions.batken') },
])

const searchQuery = ref('')
const selectedType = ref('')
const selectedRegion = ref('')
</script>

<template>
 <div class="registries-page">
   <div class="container-main registries-container">
    <!-- Title Section -->
    <div class="section-header pb-10">
      <div class="registries-title-group">
        <h1 class="section-title">
          {{ $t('registriesPage.title') }}
        </h1>
        <p class="section-subtitle">
          {{ $t('registriesPage.subtitle') }}
        </p>
      </div>
    </div>

    <!-- Search/Filter Bar -->
    <div class="registries-filter-bar">
      <div class="registries-filter-row">
        <span class="registries-filter-title">
          {{ $t('registriesPage.gisTitle') }}
        </span>
        <div class="registries-filter-controls">
          <div class="registries-filter-group">
            <Input
              v-model="searchQuery"
              type="text"
              :placeholder="$t('registriesPage.searchPlaceholder')"
              variant="outlined"
              class="registries-search-input"
            />
            <Select
              v-model="selectedType"
              :options="typeOptions"
              :placeholder="$t('registriesPage.typeOptions.all')"
            />
            <Select
              v-model="selectedRegion"
              :options="regionOptions"
              :placeholder="$t('regions.allRegions')"
            />
          </div>
          <Button variant="primary" size="sm" class="registries-search-btn">
            {{ $t('registriesPage.findBtn') }}
          </Button>
        </div>
      </div>
    </div>

    <!-- Map Section -->
    <div class="registries-map">
      <div class="map-container">
        <div class="map-inner">
          <img src="@/assets/images/icons/kyrgyzstan-map.svg" :alt="$t('registriesPage.mapAlt')" class="w-full h-full object-contain" />
        </div>

        <div
          v-for="region in regions"
          :key="region.name"
          class="map-label"
          :style="{ top: region.top, left: region.left }"
        >
          <span class="map-count">
            {{ region.count }}
          </span>
          <span class="map-subtitle">
            {{ region.name }}
          </span>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="registries-tabs">
      <div class="registries-tabs-row">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            activeTab === tab.id
              ? 'btn-filter-active'
              : 'btn-filter hover:bg-bg-table'
          ]"
        >
          {{ tab.label }} ({{ tab.count }})
        </button>
      </div>
    </div>

    <!-- Desktop Table -->
    <div class="registries-table-desktop registries-table-scroll">
      <div class="table-wrapper">
        <!-- Table Header -->
        <div class="table-header">
          <div class="table-cell w-[78px] justify-center">
            <span class="table-cell-text">{{ $t('registriesPage.table.number') }}</span>
          </div>
          <div class="table-cell w-[465px]">
            <span class="table-cell-text">{{ $t('registriesPage.table.name') }}</span>
          </div>
          <div class="table-cell w-[190px]">
            <span class="table-cell-text">{{ $t('registriesPage.table.region') }}</span>
          </div>
          <div class="table-cell flex-1">
            <span class="table-cell-text">{{ $t('registriesPage.table.activity') }}</span>
          </div>
          <div class="table-cell w-[150px] justify-center">
            <span class="table-cell-text">{{ $t('registriesPage.table.status') }}</span>
          </div>
          <div class="table-cell w-[150px] justify-center">
            <span class="table-cell-text">{{ $t('registriesPage.table.actions') }}</span>
          </div>
        </div>

        <!-- Table Rows -->
        <div
          v-for="item in registries"
          :key="item.id"
          class="table-row"
        >
          <div class="table-cell w-[78px] justify-center">
            <span class="table-cell-text">{{ item.id }}</span>
          </div>
          <div class="table-cell w-[465px]">
            <span class="table-cell-text">{{ item.name }}</span>
          </div>
          <div class="table-cell w-[190px]">
            <span class="table-cell-text">{{ item.region }}</span>
          </div>
          <div class="table-cell flex-1">
            <span class="table-cell-text">{{ item.activity }}</span>
          </div>
          <div class="table-cell w-[150px] justify-center">
            <span
              class="badge"
              :style="{ backgroundColor: statusConfig[item.status].bg, color: statusConfig[item.status].text }"
            >
              {{ statusConfig[item.status].label }}
            </span>
          </div>
          <div class="table-cell w-[150px] justify-center">
            <Button variant="primary" size="xs">
              {{ $t('registriesPage.view') }}
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Cards -->
    <div class="registries-cards-mobile">
      <div
        v-for="item in registries"
        :key="item.id"
        class="registry-card"
      >
        <div class="registry-card-header">
          <span class="registry-card-num">№ {{ item.id }}</span>
          <span
            class="registry-card-badge"
            :style="{ backgroundColor: statusConfig[item.status].bg, color: statusConfig[item.status].text }"
          >
            {{ statusConfig[item.status].label }}
          </span>
        </div>
        <p class="registry-card-name">{{ item.name }}</p>
        <p class="registry-card-info">{{ item.region }} · {{ item.activity }}</p>
        <div class="registry-card-actions">
          <Button variant="primary" size="xs">{{ $t('registriesPage.view') }}</Button>
        </div>
      </div>
    </div>
  </div>
 </div>
</template>

<style scoped src="@/assets/styles/views/registries.css"></style>
