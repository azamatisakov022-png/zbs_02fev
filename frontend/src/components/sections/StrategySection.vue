<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

interface StrategyItem {
  id: number
  title: string
  icon: string
}

const { t } = useI18n()

const strategyItems = computed<StrategyItem[]>(() => [
  { id: 1, title: t('strategy.item1'), icon: '/images/strategy/category.svg' },
  { id: 2, title: t('strategy.item2'), icon: '/images/strategy/activity.svg' },
  { id: 3, title: t('strategy.item3'), icon: '/images/strategy/star.svg' },
  { id: 4, title: t('strategy.item4'), icon: '/images/strategy/dashboard.svg' },
  { id: 5, title: t('strategy.item5'), icon: '/images/strategy/chart.svg' },
  { id: 6, title: t('strategy.item6'), icon: '/images/strategy/users.svg' },
  { id: 7, title: t('strategy.item7'), icon: '/images/strategy/ecology.svg' },
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

      <!-- Strategy grid - first row (3 cards) -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-[30px] mb-5 lg:mb-[30px]">
        <div
          v-for="item in strategyItems.slice(0, 3)"
          :key="item.id"
          class="strategy-card flex flex-col"
        >
          <!-- Icon -->
          <div class="w-[50px] h-[50px] lg:w-[70px] lg:h-[70px] mb-4 lg:mb-[27px]">
            <img :src="item.icon" :alt="item.title" class="w-full h-full object-contain text-[#0e888d]" />
          </div>

          <h3 class="text-[#415861] text-base md:text-lg lg:text-[28px] lg:leading-[38px] font-medium">
            {{ item.title }}
          </h3>
        </div>
      </div>

      <!-- Strategy grid - second row (3 cards) -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-[30px] mb-5 lg:mb-[30px]">
        <div
          v-for="item in strategyItems.slice(3, 6)"
          :key="item.id"
          class="strategy-card flex flex-col"
        >
          <!-- Icon -->
          <div class="w-[50px] h-[50px] lg:w-[70px] lg:h-[70px] mb-4 lg:mb-[27px]">
            <img :src="item.icon" :alt="item.title" class="w-full h-full object-contain" />
          </div>

          <h3 class="text-[#415861] text-base md:text-lg lg:text-[28px] lg:leading-[38px] font-medium">
            {{ item.title }}
          </h3>
        </div>
      </div>

      <!-- Last item (single card) -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-[30px]">
        <div
          v-for="item in strategyItems.slice(6, 7)"
          :key="item.id"
          class="strategy-card flex flex-col"
        >
          <!-- Icon -->
          <div class="w-[50px] h-[50px] lg:w-[70px] lg:h-[70px] mb-4 lg:mb-[27px]">
            <img :src="item.icon" :alt="item.title" class="w-full h-full object-contain" />
          </div>

          <h3 class="text-[#415861] text-base md:text-lg lg:text-[28px] lg:leading-[38px] font-medium">
            {{ item.title }}
          </h3>
        </div>
      </div>
    </div>
  </section>
</template>
