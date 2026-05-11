<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

interface StrategyItem {
  id: number
  title: string
  image: string
}

const { t } = useI18n()

const strategyItems = computed<StrategyItem[]>(() => [
  { id: 1, title: t('strategy.item1'), image: '/images/strategy/system-3d-v2.webp' },
  { id: 2, title: t('strategy.item2'), image: '/images/strategy/economy-3d-v2.webp' },
  { id: 3, title: t('strategy.item3'), image: '/images/strategy/culture-3d-v2.webp' },
  { id: 4, title: t('strategy.item4'), image: '/images/strategy/recycling-growth-3d-v2.webp' },
  { id: 5, title: t('strategy.item5'), image: '/images/strategy/landfill-reduction-3d-v2.webp' },
  { id: 6, title: t('strategy.item6'), image: '/images/strategy/partnership-3d-v2.webp' },
  { id: 7, title: t('strategy.item7'), image: '/images/strategy/innovation-3d-v2.webp' },
  { id: 8, title: t('strategy.item8'), image: '/images/strategy/transparency-control-3d-v2.webp' },
])
</script>

<template>
  <section class="py-10 md:py-14 lg:py-[80px] bg-white">
    <div class="container-main">
      <!-- Section header -->
      <div class="mb-8 md:mb-10 lg:mb-[48px]">
        <h2 class="text-2xl md:text-3xl lg:text-[40px] lg:leading-[55px] font-bold text-[#415861] mb-3 lg:mb-[20px]">
          {{ $t('strategy.title') }}
        </h2>
        <div class="section-title-underline"></div>
        <p class="text-[#415861] text-sm md:text-base lg:text-[17px] lg:leading-[1.55] max-w-[760px] mt-4 lg:mt-[20px]">
          {{ $t('strategy.mission') }}
        </p>
      </div>

      <!-- Uniform grid: 1 / 2 / 3 / 4 columns -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 lg:gap-6">
        <article
          v-for="item in strategyItems"
          :key="item.id"
          class="strategy-card flex flex-col"
        >
          <div class="mb-4 flex h-[120px] w-[55%] max-w-[160px] items-center justify-center self-center md:h-[140px] lg:h-[150px]">
            <img :src="item.image" :alt="item.title" class="h-full w-full object-contain" />
          </div>

          <h3 class="text-[#415861] text-base lg:text-[17px] lg:leading-[24px] font-semibold text-center">
            {{ item.title }}
          </h3>
        </article>
      </div>
    </div>
  </section>
</template>
