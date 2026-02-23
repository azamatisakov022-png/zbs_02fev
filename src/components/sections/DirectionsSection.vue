<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import direction1 from '@/assets/images/icons/direction-1.svg';
import direction2 from '@/assets/images/icons/direction-2.svg';
import direction3 from '@/assets/images/icons/direction-3.svg';
import direction4 from '@/assets/images/icons/direction-4.svg';
import direction5 from '@/assets/images/icons/direction-5.svg';

const { t } = useI18n()

const images = [direction1, direction2, direction3, direction4, direction5]
const hrefs = [
  '/directions/administration',
  '/directions/infrastructure',
  '/directions/recycling',
  '/directions/education',
  '/directions/monitoring',
]

const directions = computed(() =>
  Array.from({ length: 5 }, (_, i) => ({
    id: i + 1,
    title: t(`directions.items.${i}.title`),
    description: t(`directions.items.${i}.description`),
    image: images[i],
    href: hrefs[i],
  }))
)
</script>

<template>
  <section class="directions-section">
    <div class="container-main">
      <div class="directions-header">
        <h2 class="home-page-title">
          {{ $t('directions.title') }}
        </h2>
        <div class="home-page-title-line" />
      </div>

      <div class="directions-grid">
        <div
          v-for="direction in directions"
          :key="direction.id"
          class="direction-card"
        >
          <div class="card-accent-top" />

          <div class="direction-card-image-wrapper">
            <div class="direction-card-image">
              <img :src="direction.image" :alt="direction.title" class="w-full h-full object-contain" />
            </div>
          </div>

          <div class="direction-card-body">
            <h3 class="direction-card-title">{{ direction.title }}</h3>
            <p class="direction-card-desc">{{ direction.description }}</p>
            <router-link :to="direction.href" class="direction-card-link">
              {{ $t('directions.more') }}
            </router-link>
          </div>

          <div class="card-accent-bottom" />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.directions-section {
  @apply pt-25;
}

.directions-header {
  @apply mb-15;
}

.direction-card-image-wrapper {
  @apply flex justify-center pt-[38px] pb-5;
}

.direction-card-image {
  @apply relative w-[267px] h-[267px];
}

.direction-card-body {
  @apply flex flex-col items-center text-center px-10 pb-8 gap-6.5;
}

.direction-card-title {
  @apply text-h6 text-text-main uppercase;
}

.direction-card-desc {
  @apply text-caption-sm text-text-main leading-normal w-[248px];
}

.direction-card-link {
  @apply text-caption-sm font-black text-accent uppercase w-full text-center
         transition-opacity hover:opacity-80;
}

@media (max-width: 1024px) {
  .directions-section {
    @apply pt-15;
  }

  .directions-header {
    @apply mb-10;
  }

  .direction-card-title {
    font-size: 18px;
  }

  .direction-card-image {
    @apply w-[200px] h-[200px];
  }
}

@media (max-width: 768px) {
  .directions-section {
    padding-top: 40px;
  }

  .directions-header {
    margin-bottom: 24px;
  }

  .direction-card-title {
    font-size: 16px;
  }

  .direction-card-image {
    @apply w-[150px] h-[150px];
  }

  .direction-card-body {
    @apply px-5 pb-5 gap-3;
  }

  .direction-card-desc {
    @apply w-full;
  }
}
</style>
