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
    image: '/images/features/administration.svg',
  },
  {
    id: 2,
    title: t('features.items.title2'),
    description: t('features.items.desc2'),
    image: '/images/features/infrastructure.svg',
  },
  {
    id: 3,
    title: t('features.items.title3'),
    description: t('features.items.desc3'),
    image: '/images/features/recycling.svg',
  },
  {
    id: 4,
    title: t('features.items.title4'),
    description: t('features.items.desc4'),
    image: '/images/features/education.svg',
  },
  {
    id: 5,
    title: t('features.items.title5'),
    description: t('features.items.desc5'),
    image: '/images/features/monitoring.svg',
  },
])
</script>

<template>
  <section class="py-10 md:py-14 lg:py-[100px] bg-white">
    <div class="container-main">
      <!-- Section header -->
      <div class="mb-8 md:mb-10 lg:mb-[63px]">
        <h2 class="text-2xl md:text-3xl lg:text-[40px] lg:leading-[55px] font-bold text-[#415861] mb-3 lg:mb-[20px]">
          {{ $t('features.title') }}
        </h2>
        <div class="section-title-underline"></div>
      </div>

      <!-- Features grid - first row (3 cards) -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-[30px] mb-5 lg:mb-[30px]">
        <div
          v-for="feature in features.slice(0, 3)"
          :key="feature.id"
          class="feature-card flex flex-col"
        >
          <!-- Top accent -->
          <div class="feature-card-accent-top bg-[#0e888d]"></div>

          <!-- Image container -->
          <div class="h-[200px] md:h-[240px] lg:h-[267px] mx-[40px] lg:mx-[63px] mt-[39px] flex items-center justify-center">
            <img :src="feature.image" :alt="feature.title" class="w-full h-full object-contain" />
          </div>

          <!-- Content -->
          <div class="flex-1 flex flex-col items-center text-center px-6 lg:px-10 py-6 lg:pb-[40px]">
            <h3 class="text-[#415861] text-lg lg:text-[22px] lg:leading-[31px] font-medium mb-4 lg:mb-[25px]">
              {{ feature.title }}
            </h3>
            <p class="text-[#415861] text-xs leading-relaxed max-w-[248px] mb-4 lg:mb-[25px]">
              {{ feature.description }}
            </p>
            <a href="#" class="text-[#fea629] text-xs font-black uppercase hover:opacity-80 transition-opacity mt-auto">
              {{ $t('common.more') }}
            </a>
          </div>

          <!-- Bottom accent -->
          <div class="feature-card-accent-bottom bg-[#415861]"></div>
        </div>
      </div>

      <!-- Features grid - second row (2 cards centered) -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-[30px] lg:max-w-[1242px] lg:mx-auto">
        <div
          v-for="feature in features.slice(3, 5)"
          :key="feature.id"
          class="feature-card flex flex-col lg:w-[606px]"
        >
          <!-- Top accent -->
          <div class="feature-card-accent-top bg-[#0e888d]"></div>

          <!-- Image container - wider for bottom row -->
          <div class="h-[200px] md:h-[240px] lg:h-[267px] mx-[40px] lg:mx-[170px] mt-[39px] flex items-center justify-center">
            <img :src="feature.image" :alt="feature.title" class="w-full h-full object-contain" />
          </div>

          <!-- Content -->
          <div class="flex-1 flex flex-col items-center text-center px-6 lg:px-10 py-6 lg:pb-[40px]">
            <h3 class="text-[#415861] text-lg lg:text-[22px] lg:leading-[31px] font-medium mb-4 lg:mb-[25px]">
              {{ feature.title }}
            </h3>
            <p class="text-[#415861] text-xs leading-relaxed max-w-[248px] mb-4 lg:mb-[25px]">
              {{ feature.description }}
            </p>
            <a href="#" class="text-[#fea629] text-xs font-black uppercase hover:opacity-80 transition-opacity mt-auto">
              {{ $t('common.more') }}
            </a>
          </div>

          <!-- Bottom accent -->
          <div class="feature-card-accent-bottom bg-[#415861]"></div>
        </div>
      </div>
    </div>
  </section>
</template>
