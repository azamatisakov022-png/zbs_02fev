<script setup lang="ts">
interface StrategyItem {
  id: number
  title: string
  icon: string
}

const strategyItems: StrategyItem[] = [
  {
    id: 1,
    title: 'Cоздание интегрированной системы управления отходами',
    icon: '/images/strategy/category.svg',
  },
  {
    id: 2,
    title: 'Экономическая устойчивость переработки вторсырья',
    icon: '/images/strategy/activity.svg',
  },
  {
    id: 3,
    title: 'Формирование экологичной культуры населения и бизнеса',
    icon: '/images/strategy/star.svg',
  },
  {
    id: 4,
    title: 'Рост доли переработанных отходов',
    icon: '/images/strategy/dashboard.svg',
  },
  {
    id: 5,
    title: 'Снижение объёмов захоронения',
    icon: '/images/strategy/chart.svg',
  },
  {
    id: 6,
    title: 'Развитие партнёрств государство–бизнес–переработчики',
    icon: '/images/strategy/users.svg',
  },
  {
    id: 7,
    title: 'Внедрение экологических инноваций',
    icon: '/images/strategy/ecology.svg',
  },
]
</script>

<template>
  <section class="py-10 md:py-14 lg:py-[100px] bg-white">
    <div class="container-main">
      <!-- Section header -->
      <div class="text-center mb-8 md:mb-10 lg:mb-[50px]">
        <h2 class="text-2xl md:text-4xl lg:text-[50px] lg:leading-[68px] font-bold text-[#415861] mb-4 lg:mb-[30px]">
          Стратегия и миссия
        </h2>
        <p class="text-[#415861] text-base md:text-lg lg:text-[28px] lg:leading-[38px] font-medium max-w-[1075px] mx-auto">
          Миссия — создание современной системы обращения с отходами, обеспечивающей чистоту окружающей среды и устойчивое развитие страны.
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
