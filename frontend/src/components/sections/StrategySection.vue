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
  { id: 1, title: t('strategy.item1'), image: '/images/strategy/system-3d.webp' },
  { id: 2, title: t('strategy.item2'), image: '/images/strategy/economy-3d.webp' },
  { id: 3, title: t('strategy.item3'), image: '/images/strategy/culture-3d.webp' },
  { id: 4, title: t('strategy.item4'), image: '/images/strategy/recycling-growth-3d.webp' },
  { id: 5, title: t('strategy.item5'), image: '/images/strategy/landfill-reduction-3d.webp' },
  { id: 6, title: t('strategy.item6'), image: '/images/strategy/partnership-3d.webp' },
  { id: 7, title: t('strategy.item7'), image: '/images/strategy/innovation-3d.webp' },
])
</script>

<template>
  <section class="py-10 md:py-14 lg:py-[100px] bg-white">
    <div class="container-main">
      <!-- Section header -->
      <div class="text-center mb-8 md:mb-10 lg:mb-[50px]">
        <h2 class="text-2xl md:text-4xl lg:text-[50px] lg:leading-[68px] font-bold text-[#415861] mb-4 lg:mb-[30px]">
          {{ $t('strategy.title') }}
        </h2>
        <p class="text-[#415861] text-base md:text-lg lg:text-[28px] lg:leading-[38px] font-medium max-w-[1075px] mx-auto">
          {{ $t('strategy.mission') }}
        </p>
      </div>

      <div class="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-12 lg:gap-6 xl:gap-[30px]">
        <article
          v-for="item in strategyItems"
          :key="item.id"
          class="strategy-card flex flex-col"
          :class="item.id <= 4 ? 'md:col-span-1 lg:col-span-3' : item.id === 7 ? 'md:col-span-2 md:mx-auto md:max-w-[420px] lg:col-span-4 lg:mx-0 lg:max-w-none' : 'md:col-span-1 lg:col-span-4'"
        >
          <div class="mb-5 flex h-[150px] items-center justify-center overflow-hidden rounded-[18px] bg-white md:h-[170px] lg:h-[132px] xl:h-[164px]">
            <img :src="item.image" :alt="item.title" class="h-full w-full object-contain" />
          </div>

          <h3 class="text-[#415861] text-lg leading-[1.28] font-semibold md:text-xl lg:text-[18px] xl:text-[22px]">
            {{ item.title }}
          </h3>
        </article>
      </div>
    </div>
  </section>
</template>
