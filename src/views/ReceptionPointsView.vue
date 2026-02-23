<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Button from '@/components/ui/general/Button.vue'
import Select from '@/components/ui/general/Select.vue'

const { t } = useI18n()

const selectedWasteType = ref('')
const selectedRegion = ref('')

const wasteTypeOptions = computed(() => [
  { value: '', label: t('reception.wasteTypes.all') },
  { value: 'plastic', label: t('reception.wasteTypes.plastic') },
  { value: 'glass', label: t('reception.wasteTypes.glass') },
  { value: 'metal', label: t('reception.wasteTypes.metal') },
  { value: 'paper', label: t('reception.wasteTypes.paper') },
  { value: 'batteries', label: t('reception.wasteTypes.batteries') },
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

const regions = computed(() => [
  { name: t('regions.mapLabels.talas'), count: 4, top: '11%', left: 'calc(50% - 198px)' },
  { name: t('regions.mapLabels.chuy'), count: 2, top: '4.5%', left: '50%' },
  { name: t('regions.mapLabels.issykKul'), count: 1, top: '20%', left: 'calc(50% + 201px)' },
  { name: t('regions.mapLabels.jalalAbad'), count: 7, top: '37.5%', left: 'calc(50% - 140px)' },
  { name: t('regions.mapLabels.naryn'), count: 7, top: '38%', left: 'calc(50% + 56px)' },
  { name: t('regions.mapLabels.osh'), count: 12, top: '67%', left: 'calc(50% - 44px)' },
  { name: t('regions.mapLabels.batken'), count: 19, top: '63%', left: 'calc(50% - 304px)' },
])

const receptionPoints = [
  {
    id: 1,
    name: 'ЭкоСбор-1',
    address: 'г. Бишкек, ул. Ахунбаева, 123',
    phone: '+996 312 123 456',
    tags: ['Пластик', 'Стекло', 'Металл'],
  },
  {
    id: 2,
    name: 'Чистый город',
    address: 'г. Бишкек, ул. Московская, 45',
    phone: '+996 312 654 321',
    tags: ['Пластик', 'Бумага'],
  },
  {
    id: 3,
    name: 'Второсырьё Ош',
    address: 'г. Бишкек, ул. Ахунбаева, 123',
    phone: '+996 312 123 456',
    tags: ['Стекло', 'Металл'],
  },
  {
    id: 4,
    name: 'Нарын-Эко',
    address: 'г. Бишкек, ул. Ахунбаева, 123',
    phone: '+996 312 123 456',
    tags: ['Пластик', 'Батарейки'],
  },
]

const allPoints = Array.from({ length: 20 }, (_, i) => ({
  ...receptionPoints[i % 4],
  id: i + 1,
}))
</script>

<template>
  <div class="container-main">
    <div class="section-header">
      <div class="section-header-content max-w-[664px]">
        <h1 class="section-title">
          {{ $t('reception.title') }}
        </h1>
        <p class="section-subtitle">
          {{ $t('reception.subtitle') }}
        </p>
      </div>
    </div>

    <!-- Filters -->
    <div class="reception-filters">
      <div class="reception-filters-row">

        <Select
          v-model="selectedWasteType"
          :options="wasteTypeOptions"
          :placeholder="$t('reception.wasteTypes.all')"
          variant="form"
          :label="$t('reception.wasteTypeLabel')"
          class="reception-filter-field"
        />

        <Select
          v-model="selectedRegion"
          :options="regionOptions"
          :placeholder="$t('regions.allRegions')"
          variant="form"
          :label="$t('reception.regionLabel')"
          class="reception-filter-field"
        />

        <Button variant="primary" size="lg" class="reception-find-btn">
          {{ $t('reception.findBtn') }}
        </Button>
      </div>
    </div>

    <!-- Map -->
    <div class="reception-map">
      <div class="map-container">
        <div class="map-inner">
          <img src="@/assets/images/icons/kyrgyzstan-map.svg" :alt="$t('reception.mapAlt')" class="w-full h-full object-contain" />
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

    <!-- Results Count -->
    <div class="reception-results-count">
      <h2 class="section-title">
        {{ $t('reception.foundPoints') }}
      </h2>
    </div>

    <!-- Cards Grid -->
    <div class="reception-cards-grid">
      <div
        v-for="point in allPoints"
        :key="point.id"
        class="card-base"
      >
        <h3 class="point-card-title">
          {{ point.name }}
        </h3>

        <div class="point-card-info">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" class="shrink-0">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#0e888d"/>
          </svg>
          <span class="point-card-text">
            {{ point.address }}
          </span>
        </div>

        <div class="point-card-info">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" class="shrink-0">
            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" fill="#0e888d"/>
          </svg>
          <span class="point-card-text">
            {{ point.phone }}
          </span>
        </div>

        <div class="point-card-tags">
          <span
            v-for="tag in point.tags"
            :key="tag"
            class="badge bg-success-bg text-primary"
          >
            {{ tag }}
          </span>
        </div>

        <div class="point-card-action">
          <Button variant="outline" size="sm" class="w-full">
            {{ $t('reception.onMap') }}
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped src="@/assets/styles/views/reception-points.css"></style>
