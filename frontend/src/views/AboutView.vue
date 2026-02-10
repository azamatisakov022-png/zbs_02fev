<script setup lang="ts">
const systemGoal = {
  title: 'Цель системы',
  description: 'Снижение барьеров при выдаче лицензий, обеспечение прозрачности деятельности предприятий, эффективное взаимодействие с плательщиками утилизационного сбора и публикация открытых данных.'
}

const mainFunctions = {
  title: 'Основные функции',
  items: [
    'Ведение реестров плательщиков и переработчиков',
    'Онлайн-калькулятор утилизационного сбора',
    'Выдача и контроль лицензий',
    'Интерактивная ГИС-карта объектов',
    'Проведение конкурсов и грантов',
    'Публикация открытых данных'
  ]
}
</script>

<template>
  <div class="py-10 lg:py-[100px]">
    <!-- Page header -->
    <div class="container-main text-center">
      <h1 class="text-3xl md:text-4xl lg:text-[50px] lg:leading-[68px] font-bold text-[#415861] uppercase mb-4 lg:mb-[22px]">
        О портале АИС «ЦРО»
      </h1>
      <p class="text-lg md:text-2xl lg:text-[30px] lg:leading-[41px] font-medium text-[#415861] max-w-[601px] mx-auto mb-10 lg:mb-[50px]">
        Автоматизированная информационная система «Цифровой реестр отходов»
      </p>
    </div>

    <!-- Cards section -->
    <div class="container-main">
      <!-- CSS Grid with equal columns and stretch -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-[30px] items-stretch">

        <!-- System Goal Card -->
        <div class="about-card">
          <!-- Top accent - centered, 160px wide -->
          <div class="about-card-accent-top"></div>

          <!-- Illustration - 267x267px, centered, top: 38px -->
          <div class="about-card-illustration">
            <div class="w-[267px] h-[267px] relative overflow-hidden">
              <!-- Background -->
              <img src="/images/about/goal-bg.svg" alt="" class="absolute" style="inset: 15.24% 12.23% 19.71% 13.77%;" />
              <!-- Shadow -->
              <img src="/images/about/goal-shadow.svg" alt="" class="absolute" style="inset: 80.21% 11.22% 15.26% 11.22%;" />
              <!-- Device 4 -->
              <img src="/images/about/goal-device4.svg" alt="" class="absolute" style="inset: 23.46% 49.34% 53.09% 36.65%;" />
              <!-- Device 3 -->
              <img src="/images/about/goal-device3.svg" alt="" class="absolute" style="inset: 49.37% 37.11% 17.08% 25.5%;" />
              <!-- Device 2 -->
              <img src="/images/about/goal-device2.svg" alt="" class="absolute" style="inset: 27.75% 64.71% 46.69% 13.99%;" />
              <!-- Device 1 -->
              <img src="/images/about/goal-device1.svg" alt="" class="absolute" style="inset: 64.76% 50.4% 17.1% 14.22%;" />
              <!-- Character -->
              <img src="/images/about/goal-character.svg" alt="" class="absolute" style="inset: 36.18% 12.79% 17.44% 56.25%;" />
              <!-- Target -->
              <img src="/images/about/goal-target.svg" alt="" class="absolute" style="inset: 30.56% 31.43% 54.75% 53.68%;" />
            </div>
          </div>

          <!-- Content - centered text -->
          <div class="about-card-content">
            <h3 class="text-[#415861] text-xl lg:text-[24px] leading-[31px] font-medium uppercase mb-[25px]">
              {{ systemGoal.title }}
            </h3>
            <p class="text-[#415861] text-sm lg:text-[14px] leading-normal text-center">
              {{ systemGoal.description }}
            </p>
          </div>

          <!-- Bottom accent - centered, 160px wide -->
          <div class="about-card-accent-bottom"></div>
        </div>

        <!-- Main Functions Card -->
        <div class="about-card">
          <!-- Top accent - centered, 160px wide -->
          <div class="about-card-accent-top"></div>

          <!-- Illustration - 267x267px, centered, top: 38px -->
          <div class="about-card-illustration">
            <div class="w-[267px] h-[267px] relative overflow-hidden">
              <!-- Background -->
              <img src="/images/about/func-bg.svg" alt="" class="absolute" style="inset: 11% 0 19.71% 0;" />
              <!-- Shadow -->
              <img src="/images/about/func-shadow.svg" alt="" class="absolute" style="inset: 80.87% 11.22% 14.6% 11.22%;" />
              <!-- Screen -->
              <img src="/images/about/func-screen.svg" alt="" class="absolute" style="inset: 12.53% 32.02% 48.4% 11.19%;" />
              <!-- Character -->
              <img src="/images/about/func-character.svg" alt="" class="absolute" style="inset: 28.47% 11.08% 17.23% 56.99%;" />
              <!-- Plant -->
              <img src="/images/about/func-plant.svg" alt="" class="absolute" style="inset: 65.21% 69.06% 17.5% 11.24%;" />
              <!-- Desk -->
              <img src="/images/about/func-desk.svg" alt="" class="absolute" style="inset: 61.51% 35.31% 17.21% 24.68%;" />
            </div>
          </div>

          <!-- Content - title centered, list left-aligned -->
          <div class="about-card-content">
            <h3 class="text-[#415861] text-xl lg:text-[22px] leading-[31px] font-medium uppercase mb-[25px] text-center">
              {{ mainFunctions.title }}
            </h3>
            <ul class="text-[#415861] text-xs lg:text-[12px] leading-normal list-disc pl-[18px] text-left">
              <li v-for="(item, index) in mainFunctions.items" :key="index" class="mb-0">
                {{ item }}
              </li>
            </ul>
          </div>

          <!-- Bottom accent - centered, 160px wide -->
          <div class="about-card-accent-bottom"></div>
        </div>
      </div>

      <!-- Glossary Link Card -->
      <div class="mt-10 lg:mt-[50px]">
        <router-link
          to="/glossary"
          class="block bg-gradient-to-r from-[#0e888d]/10 to-[#0e888d]/5 border border-[#0e888d]/20 rounded-2xl p-6 lg:p-8 hover:border-[#0e888d]/40 transition-colors group"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 lg:w-14 lg:h-14 bg-[#0e888d] rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h3 class="text-lg lg:text-xl font-semibold text-[#415861] group-hover:text-[#0e888d] transition-colors">
                  Глоссарий
                </h3>
                <p class="text-sm text-gray-500">
                  Сокращения и условные обозначения, используемые в системе
                </p>
              </div>
            </div>
            <svg class="w-6 h-6 text-[#0e888d] group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* About page card styles - exact Figma values */
.about-card {
  background: white;
  border: 1px solid #f5f5f5;
  border-radius: 30px;
  box-shadow: 2px 5px 20px 0px rgba(0, 0, 0, 0.03);
  position: relative;
  /* No overflow: hidden - allow content to be visible */
  /* No fixed height - auto-adjust to content, grid stretch makes them equal */
  display: flex;
  flex-direction: column;
}

/* Top accent bar - short, centered inside card */
.about-card-accent-top {
  width: 60px;
  height: 4px;
  background-color: #0e888d;
  border-radius: 2px;
  margin: 20px auto 0;
  flex-shrink: 0;
}

/* Bottom accent bar - short, centered inside card */
.about-card-accent-bottom {
  width: 60px;
  height: 4px;
  background-color: #415861;
  border-radius: 2px;
  margin: 0 auto 20px;
  flex-shrink: 0;
}

/* Illustration container - 267x267px, centered */
.about-card-illustration {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  flex-shrink: 0;
}

@media (max-width: 767px) {
  .about-card-illustration > div {
    width: 200px;
    height: 200px;
  }
}

/* Content area - 248px wide, centered */
.about-card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 248px;
  margin: 0 auto;
  padding: 24px 0 24px;
  flex-grow: 1;
}

@media (min-width: 1024px) {
  .about-card-content {
    padding-top: 34px;
    padding-bottom: 40px;
  }
}
</style>
