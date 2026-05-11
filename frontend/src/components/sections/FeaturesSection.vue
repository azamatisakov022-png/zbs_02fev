<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface Feature {
  id: number
  title: string
  description: string
  image: string
}

const features = computed<Feature[]>(() => [
  {
    id: 1,
    title: t('features.items.title1'),
    description: t('features.items.desc1'),
    image: '/images/features/administration-3d.webp',
  },
  {
    id: 2,
    title: t('features.items.title2'),
    description: t('features.items.desc2'),
    image: '/images/features/infrastructure-3d.webp',
  },
  {
    id: 3,
    title: t('features.items.title3'),
    description: t('features.items.desc3'),
    image: '/images/features/recycling-3d.webp',
  },
  {
    id: 4,
    title: t('features.items.title4'),
    description: t('features.items.desc4'),
    image: '/images/features/education-3d.webp',
  },
  {
    id: 5,
    title: t('features.items.title5'),
    description: t('features.items.desc5'),
    image: '/images/features/monitoring-3d.webp',
  },
])
</script>

<template>
  <section class="py-10 md:py-14 lg:py-[80px] bg-white">
    <div class="container-main">
      <!-- Section header -->
      <div class="mb-8 md:mb-10 lg:mb-[48px]">
        <h2 class="text-2xl md:text-3xl lg:text-[40px] lg:leading-[55px] font-bold text-[#415861] mb-3 lg:mb-[20px]">
          {{ $t('features.title') }}
        </h2>
        <div class="section-title-underline"></div>
      </div>

      <!-- Features grid - 5 cards in a row on desktop -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 lg:gap-6">
        <div
          v-for="feature in features"
          :key="feature.id"
          class="feature-card flex flex-col"
        >
          <!-- Top accent -->
          <div class="feature-card-accent-top bg-[#0e888d]"></div>

          <!-- Image container -->
          <div class="mt-5 flex h-[120px] w-[55%] max-w-[160px] items-center justify-center self-center md:h-[140px] lg:h-[150px]">
            <img :src="feature.image" :alt="feature.title" class="w-full h-full object-contain" />
          </div>

          <!-- Content -->
          <div class="flex-1 flex flex-col items-center text-center px-4 lg:px-5 py-5 lg:pb-7">
            <h3 class="text-[#415861] text-base lg:text-[17px] lg:leading-[24px] font-semibold mb-2 lg:mb-3">
              {{ feature.title }}
            </h3>
            <p class="text-[#415861] text-sm lg:text-[14px] leading-[1.55]">
              {{ feature.description }}
            </p>
          </div>

          <!-- Bottom accent -->
          <div class="feature-card-accent-bottom bg-[#415861]"></div>
        </div>
      </div>
    </div>
  </section>
</template>
