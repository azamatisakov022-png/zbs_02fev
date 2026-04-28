<script setup lang="ts">
const systemGoal = {
  title: 'Цель системы',
  description: 'АИС помогает перевести ключевые процессы обращения с отходами в электронный формат: от подачи документов и ведения реестров до получения информации о лицензиях, объектах инфраструктуры и открытых данных.',
  highlights: [
    'повышение прозрачности процессов и доступности данных',
    'сокращение бумажного документооборота и сроков рассмотрения',
    'единые правила взаимодействия для организаций, ведомств и граждан',
  ],
}

const mainFunctions = {
  title: 'Основные функции',
  items: [
    'электронное оформление расчётов, деклараций, отчётов и заявлений',
    'цифровое сопровождение лицензирования и контроль статусов документов',
    'ведение реестров участников, объектов обращения с отходами и инфраструктуры',
    'интерактивная карта объектов, пунктов приёма и перерабатывающих организаций',
    'аналитика, мониторинг показателей, уведомления и журнал действий',
    'публикация правовой базы, справочных материалов, конкурсов и открытых данных',
  ],
}

</script>

<template>
  <div class="py-10 lg:py-[100px]">
    <!-- Page header -->
    <div class="container-main text-center">
      <h1 class="text-3xl md:text-4xl lg:text-[50px] lg:leading-[68px] font-bold text-[#415861] uppercase mb-4 lg:mb-[22px]">
        О портале АИС «ГП Эко Оператор»
      </h1>
      <p class="text-lg md:text-2xl lg:text-[30px] lg:leading-[41px] font-medium text-[#415861] max-w-[780px] mx-auto mb-10 lg:mb-[50px]">
        Единая цифровая платформа для обращения с отходами, лицензирования, открытых данных и межведомственного взаимодействия
      </p>
    </div>

    <!-- Cards section -->
    <div class="container-main">
      <div class="about-grid">

        <!-- System Goal Card -->
        <div class="about-card">
          <div class="about-card-accent-top"></div>

          <div class="about-card-illustration" aria-hidden="true">
            <div class="portal-illustration portal-illustration-goal">
              <img
                src="/images/about/goal-system-premium.png"
                alt=""
                class="portal-image"
                loading="lazy"
              />
            </div>
          </div>

          <div class="about-card-content">
            <h3 class="text-[#415861] text-xl lg:text-[24px] leading-[31px] font-medium uppercase mb-4">
              {{ systemGoal.title }}
            </h3>
            <p class="text-[#415861] text-sm lg:text-[15px] leading-relaxed text-center">
              {{ systemGoal.description }}
            </p>
            <ul class="about-highlights">
              <li v-for="item in systemGoal.highlights" :key="item">{{ item }}</li>
            </ul>
          </div>

          <div class="about-card-accent-bottom"></div>
        </div>

        <!-- Main Functions Card -->
        <div class="about-card">
          <div class="about-card-accent-top"></div>

          <div class="about-card-illustration" aria-hidden="true">
            <div class="portal-illustration portal-illustration-functions">
              <img
                src="/images/about/main-functions-premium.png"
                alt=""
                class="portal-image"
                loading="lazy"
              />
            </div>
          </div>

          <div class="about-card-content about-card-content-wide">
            <h3 class="text-[#415861] text-xl lg:text-[22px] leading-[31px] font-medium uppercase mb-4 text-center">
              {{ mainFunctions.title }}
            </h3>
            <ul class="functions-list">
              <li v-for="(item, index) in mainFunctions.items" :key="index">
                {{ item }}
              </li>
            </ul>
          </div>

          <div class="about-card-accent-bottom"></div>
        </div>
      </div>

      <!-- Glossary Link Card -->
      <div class="mt-10 lg:mt-[50px]">
        <router-link
          to="/glossary"
          class="block bg-gradient-to-r from-[#0e888d]/10 to-[#0e888d]/5 border border-[#0e888d]/20 rounded-2xl p-6 lg:p-8 hover:border-[#0e888d]/40 transition-colors group"
        >
          <div class="flex items-center justify-between gap-4">
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
            <svg class="w-6 h-6 text-[#0e888d] group-hover:translate-x-1 transition-transform flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.about-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 430px), 1fr));
  gap: 30px;
  align-items: stretch;
}

.about-card {
  background: white;
  border: 1px solid #e8eef0;
  border-radius: 24px;
  box-shadow: 0 16px 40px rgba(65, 88, 97, 0.08);
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.about-card-accent-top {
  width: 60px;
  height: 4px;
  background-color: #0e888d;
  border-radius: 2px;
  margin: 20px auto 0;
  flex-shrink: 0;
}

.about-card-accent-bottom {
  width: 60px;
  height: 4px;
  background-color: #415861;
  border-radius: 2px;
  margin: 0 auto 20px;
  flex-shrink: 0;
}

.about-card-illustration {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 24px;
  flex-shrink: 0;
}

.portal-illustration {
  width: min(100% - 28px, 500px);
  aspect-ratio: 16 / 9;
  height: auto;
  position: relative;
  border-radius: 28px;
  background: #f7fbfb;
  box-shadow: 0 22px 46px rgba(65, 88, 97, 0.13);
  overflow: hidden;
}

.portal-illustration::before {
  content: '';
  position: absolute;
  inset: 0;
  border: 1px solid rgba(14, 136, 141, 0.16);
  border-radius: inherit;
  pointer-events: none;
  z-index: 2;
}

.portal-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.about-card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: min(100% - 48px, 560px);
  margin: 0 auto;
  padding: 26px 0 34px;
  flex-grow: 1;
}

.about-card-content-wide {
  width: min(100% - 48px, 640px);
}

.about-highlights {
  display: grid;
  gap: 10px;
  margin-top: 18px;
  padding: 0;
  list-style: none;
  text-align: left;
}

.about-highlights li,
.functions-list li {
  position: relative;
  color: #415861;
  line-height: 1.45;
}

.about-highlights li {
  padding-left: 24px;
  font-size: 14px;
}

.about-highlights li::before,
.functions-list li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.55em;
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #0e888d;
}

.functions-list {
  width: 100%;
  padding: 0;
  margin: 0;
  list-style: none;
  text-align: left;
}

.functions-list li {
  break-inside: avoid;
  padding-left: 20px;
  margin-bottom: 11px;
  font-size: 14px;
}

@media (min-width: 1280px) {
  .functions-list {
    columns: 2;
    column-gap: 28px;
  }
}

@media (max-width: 767px) {
  .about-grid {
    gap: 24px;
  }

  .portal-illustration {
    width: min(100% - 28px, 390px);
  }

  .about-card-content,
  .about-card-content-wide {
    width: min(100% - 32px, 560px);
    padding-top: 22px;
  }
}
</style>
