<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import {
  decompositionData,
  eraThresholds,
  getDangerColor,
  getEraColor,
  logProgress,
  formatYears,
  type DecompositionItem
} from '../data/decomposition-data'

const { t } = useI18n()
const router = useRouter()

const revealedCards = ref<Set<number>>(new Set())
const cardRefs = ref<(HTMLElement | null)[]>([])
let observer: IntersectionObserver | null = null

function setCardRef(el: unknown, index: number) {
  cardRefs.value[index] = el as HTMLElement | null
}

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const idx = Number(entry.target.getAttribute('data-index'))
          if (!isNaN(idx)) {
            revealedCards.value.add(idx)
          }
          observer?.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.15 }
  )
  cardRefs.value.forEach((el) => {
    if (el) observer?.observe(el)
  })
})

onUnmounted(() => {
  observer?.disconnect()
})

function getFactorLabel(key: string): string {
  const map: Record<string, string> = {
    moisture: 'factorMoisture',
    microorganisms: 'factorMicroorganisms',
    sunlight: 'factorSunlight',
    temperature: 'factorTemperature',
    fungi: 'factorFungi',
    insects: 'factorInsects',
    chemicals: 'factorChemicals',
    oxidation: 'factorOxidation',
    friction: 'factorFriction',
    microplastics: 'factorMicroplastics',
    wildlife: 'factorWildlife',
    heavyMetals: 'factorHeavyMetals',
    soilContamination: 'factorSoilContamination',
    rareEarth: 'factorRareEarth',
    inert: 'factorInert',
  }
  return t(`decomposition.${map[key] || key}`)
}

function getDangerLabel(level: number): string {
  return t(`decomposition.dangerLevel${level}`)
}

function getEraLabel(key: string): string {
  const map: Record<string, string> = {
    weeks: 'eraWeeks',
    years: 'eraYears',
    decades: 'eraDecades',
    centuries: 'eraCenturies',
    millennia: 'eraMillennia',
  }
  return t(`decomposition.${map[key] || key}`)
}

function getItemName(item: DecompositionItem): string {
  return t(`decomposition.items.${item.key}.name`)
}

function getItemDescription(item: DecompositionItem): string {
  return t(`decomposition.items.${item.key}.description`)
}

function getFormattedYears(item: DecompositionItem): string {
  return formatYears(item.yearsMin, item.yearsMax, t)
}

function goToReceptionPoints() {
  router.push('/reception-points')
}
</script>

<template>
  <div class="decomposition-timeline">
    <!-- Hero -->
    <section class="dt-hero">
      <div class="container-main dt-hero-inner">
        <h2 class="dt-hero-title">{{ $t('decomposition.heroTitle') }}</h2>
        <p class="dt-hero-subtitle">{{ $t('decomposition.heroSubtitle') }}</p>
        <p class="dt-hero-desc">{{ $t('decomposition.heroDescription') }}</p>
      </div>
    </section>

    <!-- Legend -->
    <section class="container-main dt-legend-section">
      <h3 class="dt-legend-title">{{ $t('decomposition.legendTitle') }}</h3>
      <div class="dt-legend-grid">
        <div
          v-for="level in [1, 2, 3, 4, 5] as const"
          :key="level"
          class="dt-legend-item"
        >
          <span
            class="dt-legend-dot"
            :style="{ backgroundColor: getDangerColor(level) }"
          ></span>
          <span class="dt-legend-label">{{ getDangerLabel(level) }}</span>
        </div>
      </div>
      <div class="dt-era-bar">
        <div
          v-for="era in eraThresholds"
          :key="era.key"
          class="dt-era-segment"
          :style="{ backgroundColor: era.color + '18', borderColor: era.color }"
        >
          <span class="dt-era-text" :style="{ color: era.color }">{{ getEraLabel(era.key) }}</span>
        </div>
      </div>
    </section>

    <!-- Timeline -->
    <section class="container-main dt-timeline-section">
      <div class="dt-timeline-line"></div>
      <div
        v-for="(item, index) in decompositionData"
        :key="item.id"
        :ref="(el) => setCardRef(el, index)"
        :data-index="index"
        class="dt-card-wrapper"
        :class="[
          index % 2 === 0 ? 'dt-card-left' : 'dt-card-right',
          { 'dt-card-revealed': revealedCards.has(index) }
        ]"
      >
        <div class="dt-card-dot" :style="{ backgroundColor: getEraColor(item.yearsMin) }"></div>
        <div class="dt-card">
          <div class="dt-card-header">
            <span class="dt-card-emoji">{{ item.emoji }}</span>
            <div class="dt-card-title-block">
              <h4 class="dt-card-name">{{ getItemName(item) }}</h4>
              <span
                class="dt-card-type"
                :class="item.type === 'packaging' ? 'dt-type-packaging' : 'dt-type-product'"
              >
                {{ item.type === 'packaging' ? $t('decomposition.typePackaging') : $t('decomposition.typeProduct') }}
              </span>
            </div>
          </div>

          <p class="dt-card-desc">{{ getItemDescription(item) }}</p>

          <!-- Time -->
          <div class="dt-card-time-row">
            <span class="dt-card-time-label">{{ $t('decomposition.decompositionTime') }}</span>
            <span class="dt-card-time-value" :style="{ color: getEraColor(item.yearsMin) }">
              {{ getFormattedYears(item) }}
            </span>
          </div>

          <!-- Progress bar -->
          <div class="dt-progress-track">
            <div
              class="dt-progress-fill"
              :style="{
                width: logProgress(item.yearsMin) + '%',
                backgroundColor: getEraColor(item.yearsMin)
              }"
            ></div>
          </div>

          <!-- Danger level -->
          <div class="dt-card-danger-row">
            <span class="dt-card-danger-label">{{ $t('decomposition.dangerLevelLabel') }}</span>
            <span class="dt-danger-dots">
              <span
                v-for="d in 5"
                :key="d"
                class="dt-danger-dot"
                :style="{
                  backgroundColor: d <= item.dangerLevel ? getDangerColor(item.dangerLevel) : '#e2e8f0'
                }"
              ></span>
            </span>
          </div>

          <!-- Factors -->
          <div class="dt-card-factors">
            <span class="dt-card-factors-label">{{ $t('decomposition.factorsLabel') }}:</span>
            <div class="dt-factor-tags">
              <span
                v-for="fk in item.factorKeys"
                :key="fk"
                class="dt-factor-tag"
              >{{ getFactorLabel(fk) }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="dt-cta-section">
      <div class="container-main dt-cta-inner">
        <h3 class="dt-cta-title">{{ $t('decomposition.ctaTitle') }}</h3>
        <p class="dt-cta-text">{{ $t('decomposition.ctaText') }}</p>
        <button class="btn-primary dt-cta-btn" @click="goToReceptionPoints">
          {{ $t('decomposition.ctaButton') }}
        </button>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ═══════ Hero ═══════ */
.dt-hero {
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #f0f9ff 100%);
  padding: 60px 0 48px;
  text-align: center;
}
.dt-hero-title {
  font-family: 'Playfair Display', serif;
  font-weight: 900;
  font-size: clamp(28px, 5vw, 48px);
  color: #111827;
  margin-bottom: 12px;
  line-height: 1.2;
}
.dt-hero-subtitle {
  font-family: 'Source Sans 3', 'Inter', sans-serif;
  font-size: clamp(16px, 2.5vw, 20px);
  color: #2D8B4E;
  font-weight: 600;
  margin-bottom: 16px;
}
.dt-hero-desc {
  font-family: 'Source Sans 3', 'Inter', sans-serif;
  font-size: 16px;
  color: #4b5563;
  max-width: 640px;
  margin: 0 auto;
  line-height: 1.6;
}

/* ═══════ Legend ═══════ */
.dt-legend-section {
  padding: 40px 0 20px;
}
.dt-legend-title {
  font-size: 18px;
  font-weight: 700;
  color: #374151;
  margin-bottom: 16px;
}
.dt-legend-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 24px;
  margin-bottom: 24px;
}
.dt-legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}
.dt-legend-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  flex-shrink: 0;
}
.dt-legend-label {
  font-size: 14px;
  color: #4b5563;
  font-weight: 500;
}

/* ═══════ Era bar ═══════ */
.dt-era-bar {
  display: flex;
  gap: 4px;
  border-radius: 10px;
  overflow: hidden;
}
.dt-era-segment {
  flex: 1;
  padding: 8px 12px;
  border-left: 3px solid;
  text-align: center;
}
.dt-era-text {
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

/* ═══════ Timeline ═══════ */
.dt-timeline-section {
  position: relative;
  padding: 48px 0 60px;
}
.dt-timeline-line {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 3px;
  background: #e2e8f0;
  transform: translateX(-50%);
}

/* Card wrapper — zigzag */
.dt-card-wrapper {
  position: relative;
  display: flex;
  align-items: flex-start;
  margin-bottom: 40px;
  width: 50%;
  /* animation defaults */
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}
.dt-card-wrapper.dt-card-revealed {
  opacity: 1;
  transform: translateY(0);
}
.dt-card-left {
  margin-left: 0;
  padding-right: 40px;
  justify-content: flex-end;
}
.dt-card-right {
  margin-left: 50%;
  padding-left: 40px;
  justify-content: flex-start;
}

/* Dot on timeline */
.dt-card-dot {
  position: absolute;
  top: 24px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 0 0 0 2px #e2e8f0;
  z-index: 2;
}
.dt-card-left .dt-card-dot {
  right: -8px;
}
.dt-card-right .dt-card-dot {
  left: -8px;
}

/* Card */
.dt-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 24px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}
.dt-card:hover {
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
  transform: translateY(-2px);
}

/* Card header */
.dt-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
.dt-card-emoji {
  font-size: 36px;
  line-height: 1;
  flex-shrink: 0;
}
.dt-card-title-block {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.dt-card-name {
  font-size: 17px;
  font-weight: 700;
  color: #111827;
  line-height: 1.3;
}
.dt-card-type {
  display: inline-block;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
  width: fit-content;
}
.dt-type-product {
  background: #dbeafe;
  color: #1e40af;
}
.dt-type-packaging {
  background: #fef3c7;
  color: #92400e;
}

/* Card description */
.dt-card-desc {
  font-size: 13.5px;
  color: #4b5563;
  line-height: 1.55;
  margin-bottom: 16px;
}

/* Time row */
.dt-card-time-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 8px;
}
.dt-card-time-label {
  font-size: 12px;
  color: #9ca3af;
  font-weight: 500;
}
.dt-card-time-value {
  font-size: 16px;
  font-weight: 700;
}

/* Progress bar */
.dt-progress-track {
  height: 6px;
  background: #f1f5f9;
  border-radius: 3px;
  margin-bottom: 14px;
  overflow: hidden;
}
.dt-progress-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.8s ease;
}

/* Danger level */
.dt-card-danger-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.dt-card-danger-label {
  font-size: 12px;
  color: #9ca3af;
  font-weight: 500;
}
.dt-danger-dots {
  display: flex;
  gap: 4px;
}
.dt-danger-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  transition: background-color 0.3s ease;
}

/* Factors */
.dt-card-factors {
  border-top: 1px solid #f1f5f9;
  padding-top: 12px;
}
.dt-card-factors-label {
  font-size: 12px;
  color: #9ca3af;
  font-weight: 500;
  display: block;
  margin-bottom: 8px;
}
.dt-factor-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.dt-factor-tag {
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #64748b;
  font-weight: 500;
}

/* ═══════ CTA ═══════ */
.dt-cta-section {
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
  padding: 60px 0;
  text-align: center;
}
.dt-cta-title {
  font-family: 'Playfair Display', serif;
  font-weight: 900;
  font-size: clamp(22px, 4vw, 32px);
  color: #111827;
  margin-bottom: 12px;
}
.dt-cta-text {
  font-size: 16px;
  color: #4b5563;
  max-width: 520px;
  margin: 0 auto 24px;
  line-height: 1.6;
}
.dt-cta-btn {
  font-size: 15px;
}

/* ═══════ Responsive: mobile single-column ═══════ */
@media (max-width: 768px) {
  .dt-hero {
    padding: 40px 0 32px;
  }
  .dt-legend-section {
    padding: 24px 0 12px;
  }
  .dt-era-bar {
    flex-direction: column;
    gap: 6px;
  }
  .dt-era-segment {
    border-left: 3px solid;
    text-align: left;
    padding: 6px 12px;
  }
  .dt-timeline-line {
    left: 20px;
  }
  .dt-card-wrapper {
    width: 100%;
    margin-left: 0 !important;
    padding-left: 48px !important;
    padding-right: 0 !important;
    justify-content: flex-start !important;
    margin-bottom: 24px;
  }
  .dt-card-wrapper .dt-card-dot {
    left: 12px !important;
    right: auto !important;
  }
  .dt-card {
    max-width: 100%;
    padding: 18px;
  }
  .dt-card-emoji {
    font-size: 28px;
  }
  .dt-card-name {
    font-size: 15px;
  }
  .dt-cta-section {
    padding: 40px 0;
  }
}
</style>
