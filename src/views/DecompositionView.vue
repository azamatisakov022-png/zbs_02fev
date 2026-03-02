<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import {
  decompositionData,
  getDangerColor,
  getEraColor,
  logProgress,
  formatYears,
  getFilterForItem,
  type DecompositionItem,
  type FilterKey
} from '../data/decomposition-data'

const { t } = useI18n()
const router = useRouter()

const activeFilter = ref<FilterKey>('all')
const expandedId = ref<number | null>(null)

const filteredData = computed(() => {
  if (activeFilter.value === 'all') return decompositionData
  return decompositionData.filter(item => getFilterForItem(item) === activeFilter.value)
})

function toggleExpand(id: number) {
  expandedId.value = expandedId.value === id ? null : id
}

function fmtYears(item: DecompositionItem): string {
  return formatYears(item.yearsMin, item.yearsMax, t)
}

function dangerLabel(level: number): string {
  return t(`decomposition.dangerLevel${level}`)
}

const filters: { key: FilterKey; labelKey: string; color: string }[] = [
  { key: 'all', labelKey: 'decomposition.filterAll', color: '#64748b' },
  { key: 'safe', labelKey: 'decomposition.filterSafe', color: '#10b981' },
  { key: 'medium', labelKey: 'decomposition.filterMedium', color: '#eab308' },
  { key: 'danger', labelKey: 'decomposition.filterDanger', color: '#f59e0b' },
  { key: 'critical', labelKey: 'decomposition.filterCritical', color: '#ef4444' },
]

const infoCards = [
  { emoji: '☀️', titleKey: 'decomposition.infoUV', descKey: 'decomposition.infoUVDesc' },
  { emoji: '💨', titleKey: 'decomposition.infoOxygen', descKey: 'decomposition.infoOxygenDesc' },
  { emoji: '💧', titleKey: 'decomposition.infoMoisture', descKey: 'decomposition.infoMoistureDesc' },
  { emoji: '🦠', titleKey: 'decomposition.infoMicro', descKey: 'decomposition.infoMicroDesc' },
]
</script>

<template>
  <div class="dp">
    <!-- HERO -->
    <section class="dp-hero">
      <div class="container-main">
        <div class="dp-hero-badge">{{ $t('decomposition.heroBadge') }}</div>
        <h1 class="dp-hero-title">
          {{ $t('decomposition.heroTitleStart') }}
          <span class="dp-hero-accent">{{ $t('decomposition.heroTitleAccent') }}</span>
        </h1>
        <p class="dp-hero-sub">{{ $t('decomposition.heroSubtitleText') }}</p>
      </div>
    </section>

    <!-- STATS -->
    <section class="container-main dp-stats">
      <div class="dp-stat">
        <span class="dp-stat-num" style="color:#10b981">24</span>
        <span class="dp-stat-lbl">{{ $t('decomposition.statCategories') }}</span>
      </div>
      <div class="dp-stat">
        <span class="dp-stat-num" style="color:#f59e0b">1 000 000</span>
        <span class="dp-stat-lbl">{{ $t('decomposition.statGlass') }}</span>
      </div>
      <div class="dp-stat">
        <span class="dp-stat-num" style="color:#ef4444">400 {{ $t('decomposition.liters') }}</span>
        <span class="dp-stat-lbl">{{ $t('decomposition.statBattery') }}</span>
      </div>
    </section>

    <!-- FACTORS INFO -->
    <section class="container-main dp-info-section">
      <h2 class="dp-section-title">{{ $t('decomposition.factorsTitle') }}</h2>
      <div class="dp-info-grid">
        <div v-for="c in infoCards" :key="c.emoji" class="dp-info-card">
          <span class="dp-info-emoji">{{ c.emoji }}</span>
          <h3 class="dp-info-title">{{ $t(c.titleKey) }}</h3>
          <p class="dp-info-desc">{{ $t(c.descKey) }}</p>
        </div>
      </div>
    </section>

    <!-- COLOR SCALE -->
    <section class="container-main dp-scale-section">
      <div class="dp-scale-bar"></div>
      <div class="dp-scale-labels">
        <span>{{ $t('decomposition.scaleMonths') }}</span>
        <span>{{ $t('decomposition.scale10') }}</span>
        <span>{{ $t('decomposition.scale100') }}</span>
        <span>{{ $t('decomposition.scale1000') }}</span>
        <span>{{ $t('decomposition.scale1M') }}</span>
      </div>
    </section>

    <!-- FILTERS -->
    <section class="container-main dp-filters">
      <button
        v-for="f in filters"
        :key="f.key"
        class="dp-filter-pill"
        :class="{ active: activeFilter === f.key }"
        :style="activeFilter === f.key ? { background: f.color, color: '#fff', borderColor: f.color } : {}"
        @click="activeFilter = f.key"
      >{{ $t(f.labelKey) }}</button>
    </section>

    <!-- LIST -->
    <section class="container-main dp-list">
      <div
        v-for="item in filteredData"
        :key="item.id"
        class="dp-item"
        :class="{ 'dp-item-open': expandedId === item.id }"
      >
        <!-- Collapsed header -->
        <div class="dp-item-header" @click="toggleExpand(item.id)">
          <div class="dp-item-emoji-box">
            <span>{{ item.emoji }}</span>
          </div>
          <div class="dp-item-meta">
            <span class="dp-item-id">#{{ item.id }}</span>
            <span
              class="dp-item-type"
              :class="item.type === 'packaging' ? 'dp-type-pkg' : 'dp-type-prod'"
            >{{ item.type === 'packaging' ? $t('decomposition.typePackaging') : $t('decomposition.typeProduct') }}</span>
          </div>
          <span class="dp-item-name">{{ $t(`decomposition.items.${item.key}.name`) }}</span>
          <div class="dp-item-bar">
            <div
              class="dp-item-bar-fill"
              :style="{ width: logProgress(item.yearsMax) + '%', background: getEraColor(item.yearsMin) }"
            ></div>
          </div>
          <span class="dp-item-years" :style="{ color: getEraColor(item.yearsMin) }">{{ fmtYears(item) }}</span>
          <span class="dp-item-arrow" :class="{ 'dp-arrow-up': expandedId === item.id }">▼</span>
        </div>

        <!-- Expanded body -->
        <div v-if="expandedId === item.id" class="dp-item-body">
          <!-- Description -->
          <div class="dp-detail-desc">
            <h4 class="dp-detail-label">📝 {{ $t('decomposition.descriptionLabel') }}</h4>
            <p>{{ $t(`decomposition.items.${item.key}.description`) }}</p>
          </div>

          <div class="dp-detail-grid">
            <!-- Danger level -->
            <div class="dp-detail-box">
              <h4 class="dp-detail-label">☠️ {{ $t('decomposition.dangerLevelLabel') }}</h4>
              <div class="dp-danger-bars">
                <div
                  v-for="d in 5"
                  :key="d"
                  class="dp-danger-seg"
                  :style="{ background: d <= item.dangerLevel ? getDangerColor(item.dangerLevel) : '#e2e8f0' }"
                ></div>
              </div>
              <span class="dp-danger-text" :style="{ color: getDangerColor(item.dangerLevel) }">
                {{ dangerLabel(item.dangerLevel) }} ({{ item.dangerLevel }}/5)
              </span>
            </div>

            <!-- Factors -->
            <div class="dp-detail-box">
              <h4 class="dp-detail-label">⚡ {{ $t('decomposition.factorsLabel') }}</h4>
              <div class="dp-factor-tags">
                <span class="dp-factor-tag">{{ $t(`decomposition.items.${item.key}.factor1`) }}</span>
                <span class="dp-factor-tag">{{ $t(`decomposition.items.${item.key}.factor2`) }}</span>
                <span class="dp-factor-tag">{{ $t(`decomposition.items.${item.key}.factor3`) }}</span>
                <span class="dp-factor-tag">{{ $t(`decomposition.items.${item.key}.factor4`) }}</span>
              </div>
            </div>
          </div>

          <!-- Harm -->
          <div class="dp-detail-harm">
            <h4 class="dp-detail-label dp-harm-label">🔴 {{ $t('decomposition.harmLabel') }}</h4>
            <p>{{ $t(`decomposition.items.${item.key}.harm`) }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="container-main dp-cta-section">
      <div class="dp-cta">
        <h3 class="dp-cta-title">{{ $t('decomposition.ctaTitle') }} 🌍</h3>
        <button class="dp-cta-btn" @click="router.push('/registries')">
          {{ $t('decomposition.ctaButton') }}
        </button>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ═══════ PAGE ═══════ */
.dp { background: #f8fafc; }

/* ═══════ HERO ═══════ */
.dp-hero {
  background: linear-gradient(135deg, #ecfdf5 0%, #fefce8 100%);
  border-bottom: 1px solid #e2e8f0;
  padding: 52px 0 44px;
  text-align: center;
}
.dp-hero-badge {
  display: inline-block;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 6px 16px;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  margin-bottom: 20px;
}
.dp-hero-title {
  font-family: 'Playfair Display', serif;
  font-weight: 900;
  font-size: clamp(26px, 5vw, 44px);
  color: #1e293b;
  line-height: 1.2;
  margin-bottom: 16px;
}
.dp-hero-accent {
  background: linear-gradient(90deg, #10b981, #f59e0b, #ef4444);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.dp-hero-sub {
  font-family: 'Source Sans 3', 'Inter', sans-serif;
  font-size: clamp(14px, 2vw, 17px);
  color: #475569;
  max-width: 640px;
  margin: 0 auto;
  line-height: 1.6;
}

/* ═══════ STATS ═══════ */
.dp-stats {
  display: flex;
  justify-content: center;
  gap: 40px;
  padding: 36px 0;
  flex-wrap: wrap;
}
.dp-stat { text-align: center; }
.dp-stat-num {
  font-family: 'Playfair Display', serif;
  font-weight: 900;
  font-size: clamp(24px, 4vw, 36px);
  display: block;
  line-height: 1.2;
}
.dp-stat-lbl {
  font-size: 13px;
  color: #64748b;
  margin-top: 4px;
  display: block;
}

/* ═══════ INFO CARDS ═══════ */
.dp-info-section { padding: 0 0 36px; }
.dp-section-title {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 16px;
}
.dp-info-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
.dp-info-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 18px;
}
.dp-info-emoji { font-size: 28px; display: block; margin-bottom: 8px; }
.dp-info-title { font-size: 14px; font-weight: 700; color: #1e293b; margin-bottom: 6px; }
.dp-info-desc { font-size: 12.5px; color: #64748b; line-height: 1.5; }

/* ═══════ COLOR SCALE ═══════ */
.dp-scale-section { padding: 0 0 28px; }
.dp-scale-bar {
  height: 10px;
  border-radius: 5px;
  background: linear-gradient(90deg, #10b981 0%, #84cc16 20%, #eab308 40%, #f59e0b 60%, #ef4444 80%, #991b1b 100%);
}
.dp-scale-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
  font-size: 11px;
  color: #64748b;
  font-weight: 500;
}

/* ═══════ FILTERS ═══════ */
.dp-filters {
  display: flex;
  gap: 8px;
  padding: 0 0 24px;
  flex-wrap: wrap;
}
.dp-filter-pill {
  padding: 7px 16px;
  border-radius: 20px;
  border: 1.5px solid #e2e8f0;
  background: #fff;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}
.dp-filter-pill:hover { border-color: #cbd5e1; }
.dp-filter-pill.active { border-color: currentColor; }

/* ═══════ LIST ═══════ */
.dp-list { padding: 0 0 40px; }

.dp-item {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  margin-bottom: 6px;
  background: #fff;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  overflow: hidden;
}
.dp-item:hover { border-color: #cbd5e1; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
.dp-item-open { border-color: #10b981; box-shadow: 0 2px 12px rgba(16,185,129,0.1); }

/* Header row */
.dp-item-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  user-select: none;
}
.dp-item-emoji-box {
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  border-radius: 10px;
  font-size: 26px;
}
.dp-item-meta {
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex-shrink: 0;
  min-width: 70px;
}
.dp-item-id { font-size: 11px; color: #94a3b8; font-weight: 600; }
.dp-item-type {
  font-size: 10px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 6px;
  width: fit-content;
}
.dp-type-prod { background: #f0f9ff; color: #0369a1; }
.dp-type-pkg { background: #fdf4ff; color: #a21caf; }

.dp-item-name {
  flex: 1;
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
  min-width: 0;
}
.dp-item-bar {
  width: 120px;
  height: 8px;
  background: #f1f5f9;
  border-radius: 4px;
  flex-shrink: 0;
  overflow: hidden;
}
.dp-item-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.6s ease;
}
.dp-item-years {
  font-family: 'Playfair Display', serif;
  font-weight: 900;
  font-size: 14px;
  white-space: nowrap;
  flex-shrink: 0;
  min-width: 100px;
  text-align: right;
}
.dp-item-arrow {
  font-size: 11px;
  color: #94a3b8;
  transition: transform 0.2s ease;
  flex-shrink: 0;
}
.dp-arrow-up { transform: rotate(180deg); }

/* Body */
.dp-item-body { padding: 0 16px 16px; }

.dp-detail-desc {
  margin-bottom: 14px;
}
.dp-detail-desc p {
  font-size: 13.5px;
  color: #475569;
  line-height: 1.7;
}
.dp-detail-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 700;
  color: #64748b;
  margin-bottom: 8px;
}

.dp-detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 14px;
}
.dp-detail-box {
  background: #f8fafc;
  border-radius: 10px;
  padding: 14px;
}

/* Danger bars */
.dp-danger-bars {
  display: flex;
  gap: 4px;
  margin-bottom: 8px;
}
.dp-danger-seg {
  flex: 1;
  height: 8px;
  border-radius: 4px;
  transition: background 0.3s ease;
}
.dp-danger-text {
  font-size: 13px;
  font-weight: 700;
}

/* Factors */
.dp-factor-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.dp-factor-tag {
  font-size: 12px;
  padding: 5px 10px;
  border-radius: 8px;
  background: #fff;
  border: 1px solid #e2e8f0;
  color: #475569;
  font-weight: 500;
  line-height: 1.3;
}

/* Harm */
.dp-detail-harm {
  background: linear-gradient(135deg, #fef2f2 0%, #fff7ed 100%);
  border: 1px solid #fecaca;
  border-radius: 10px;
  padding: 14px;
}
.dp-harm-label { color: #dc2626; }
.dp-detail-harm p {
  font-size: 13px;
  color: #9a3412;
  line-height: 1.6;
}

/* ═══════ CTA ═══════ */
.dp-cta-section { padding: 0 0 60px; }
.dp-cta {
  background: #fff;
  border: 2px solid #10b981;
  border-radius: 20px;
  padding: 40px;
  text-align: center;
}
.dp-cta-title {
  font-family: 'Playfair Display', serif;
  font-weight: 900;
  font-size: clamp(20px, 3vw, 28px);
  color: #1e293b;
  margin-bottom: 20px;
}
.dp-cta-btn {
  display: inline-block;
  padding: 14px 32px;
  border-radius: 12px;
  background: #10b981;
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;
}
.dp-cta-btn:hover {
  background: #059669;
  transform: translateY(-1px);
}

/* ═══════ RESPONSIVE ═══════ */
@media (max-width: 768px) {
  .dp-hero { padding: 36px 0 32px; }
  .dp-stats { gap: 20px; padding: 24px 0; }
  .dp-info-grid { grid-template-columns: 1fr 1fr; gap: 8px; }
  .dp-detail-grid { grid-template-columns: 1fr; }
  .dp-item-bar { display: none; }
  .dp-item-header { gap: 8px; padding: 10px 12px; }
  .dp-item-years { min-width: auto; font-size: 12px; }
  .dp-item-name { font-size: 13px; }
  .dp-cta { padding: 28px 20px; }
}

@media (max-width: 480px) {
  .dp-info-grid { grid-template-columns: 1fr; }
  .dp-stats { flex-direction: column; gap: 12px; }
  .dp-item-meta { display: none; }
  .dp-filter-pill { font-size: 12px; padding: 6px 12px; }
}
</style>
