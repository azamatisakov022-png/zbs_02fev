<script setup lang="ts">
const benefits = [
  'создание и развитие инфраструктуры переработки',
  'поддержку перерабатывающих предприятий',
  'внедрение инновационных технологий',
  'образовательные и социальные проекты',
  'повышение эффективности отрасли',
]
</script>

<template>
  <section class="py-10 md:py-14 lg:py-[100px] bg-white">
    <div class="container-main">
      <!-- Section header -->
      <div class="mb-8 md:mb-10 lg:mb-[75px]">
        <h2 class="text-2xl md:text-3xl lg:text-[40px] lg:leading-[55px] font-bold text-[#415861] mb-3 lg:mb-[20px]">
          Экономические аспекты
        </h2>
        <div class="section-title-underline"></div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-[66px] items-start">
        <!-- Image -->
        <div class="relative order-2 lg:order-1">
          <div class="rounded-[30px] lg:rounded-[50px] overflow-hidden h-[300px] md:h-[450px] lg:h-[653px] w-full lg:w-[620px]">
            <img
              src="/images/economics.jpg"
              alt="Экономические аспекты"
              class="w-full h-full object-cover"
            />
          </div>
        </div>

        <!-- Content -->
        <div class="order-1 lg:order-2 lg:w-[554px]">
          <p class="text-[#415861] text-lg md:text-xl lg:text-[33px] lg:leading-[1.5] font-medium mb-6 lg:mb-[20px]">
            Эко Оператор Кыргызстан формирует устойчивую финансовую модель, основанную на принципе «загрязнитель платит».
          </p>

          <h3 class="text-[#415861] text-base md:text-lg lg:text-[22px] lg:leading-[1.5] font-medium mb-6 lg:mb-[20px]">
            Средства утилизационного сбора направляются на:
          </h3>

          <ul class="space-y-4 lg:space-y-[22px]">
            <li
              v-for="(benefit, index) in benefits"
              :key="index"
              class="flex items-start gap-3 lg:gap-[12px]"
            >
              <img src="/images/check.svg" alt="check" class="w-6 h-6 lg:w-[34px] lg:h-[34px] flex-shrink-0" />
              <span class="text-[#415861] text-base md:text-lg lg:text-[24px] lg:leading-[1.5] font-medium">
                {{ benefit }}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>
