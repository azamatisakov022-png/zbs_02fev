<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import category from '@/assets/images/icons/category.svg';
import activity from '@/assets/images/icons/activity.svg';
import star from '@/assets/images/icons/star.svg';
import chart from '@/assets/images/icons/chart.svg';
import chartDown from '@/assets/images/icons/chart-down.svg';
import users from '@/assets/images/icons/users.svg';
import ecology from '@/assets/images/icons/ecology.svg';

const { t } = useI18n()

const icons = [category, activity, star, chart, chartDown, users, ecology]
const flipIcons = [false, false, false, false, true, false, false]

const missionCards = computed(() =>
  Array.from({ length: 7 }, (_, i) => ({
    id: i + 1,
    title: t(`strategy.item${i + 1}`),
    icon: icons[i],
    flipIcon: flipIcons[i],
  }))
)
</script>

<template>
  <section class="mission-section">
    <div class="container-main">
      <div class="mission-header">
        <h2 class="page-title">{{ $t('strategy.title') }}</h2>
        <p class="mission-subtitle">
          {{ $t('strategy.mission') }}
        </p>
      </div>

      <div class="mission-grid">
        <div
          v-for="card in missionCards.slice(0, 3)"
          :key="card.id"
          class="mission-card"
        >
          <div :class="['mission-card-icon', { 'is-flipped': card.flipIcon }]">
            <img :src="card.icon" alt="" />
          </div>
          <h3 class="mission-card-title">{{ card.title }}</h3>
        </div>
      </div>

      <div class="mission-grid">
        <div
          v-for="card in missionCards.slice(3, 6)"
          :key="card.id"
          class="mission-card"
        >
          <div :class="['mission-card-icon', { 'is-flipped': card.flipIcon }]">
            <img :src="card.icon" alt="" />
          </div>
          <h3 class="mission-card-title">{{ card.title }}</h3>
        </div>
      </div>

      <div class="mission-grid">
        <div class="mission-card">
          <div class="mission-card-icon">
            <img :src="missionCards[6].icon" alt="" />
          </div>
          <h3 class="mission-card-title">{{ missionCards[6].title }}</h3>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.mission-section {
  @apply mt-37.5 mb-25;
}

.mission-header {
  @apply text-center mb-12;
}

.mission-subtitle {
  @apply text-h3 text-text-main max-w-[1075px] mx-auto leading-normal;
}

@media (max-width: 1024px) {
  .mission-section {
    @apply mt-25 mb-15;
  }

  .mission-subtitle {
    @apply text-h5;
  }
}

@media (max-width: 768px) {
  .mission-section {
    margin-top: 40px;
    margin-bottom: 32px;
  }

  .mission-header {
    @apply mb-6;
  }

  .mission-subtitle {
    font-size: 16px;
    line-height: 1.5;
  }
}
</style>
