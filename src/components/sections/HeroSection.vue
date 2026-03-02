<script setup lang="ts">

import slider1 from '@/assets/images/slider_1.png'

const slides = [
  {
    tag: '🌱 Устойчивое развитие',
    image:slider1,
    title: 'О нас',
    description: [
      'Эко Оператор Кыргызстан — национальный оператор в сфере управления отходами, созданный для развития экологически устойчивой системы переработки и утилизации отходов на территории страны.',
      'Мы объединяем государственные органы, бизнес-сообщество, перерабатывающие предприятия и общественность с целью создания эффективной и прозрачной экосистемы обращения с отходами.',
      'Наша деятельность направлена на внедрение современных стандартов переработки, поддержку экологической инфраструктуры и реализацию механизмов расширенной ответственности производителей.',
    ],
  },
  {
    tag: '♻ Экология',
        image:slider1,
    title: 'Наша миссия',
    description: [
      'Создание современной системы обращения с отходами.',
      'Поддержка переработки и устойчивого развития.',
    ],
  },
  {
    tag: '🏭 Производители',
        image:slider1,
    title: 'РОП',
    description: [
      'Реализация механизмов расширенной ответственности производителей.',
    ],
  },
]
</script>

<template>
  <section class="hero-section">
    <Slider
      :slides="slides"
      height="100%"
      :autoplay="false"
      :show-arrows="false"
      :show-pagination="true"
    >
      <template #slide="{ slide }">
        <div class="hero-container">
          <img
            :src="slide.image"
            alt="Hero"
            class="hero-bg-image"
          />

          <div class="hero-tag">
            <span class="hero-tag-text">{{ slide.tag }}</span>
          </div>

          <h1 class="hero-title">{{ slide.title }}</h1>

          <div class="hero-description">
            <p v-for="(text, i) in slide.description" :key="i">
              {{ text }}
            </p>
          </div>

          <div class="hero-card">
            <div class="hero-card-accent-top" />
            <div class="hero-card-content">
              <h3 class="hero-card-title">
                ЗАКЛЮЧИТЬ<br />ДОГОВОР/ПОДАТЬ<br />ОТЧЕТ
              </h3>
              <router-link to="/contract" class="hero-card-link">
                <span class="hero-card-link-text">Подробнее</span>
                <img src="@/assets/images/icons/hero-arrow.svg" alt="" class="hero-card-arrow" />
              </router-link>
            </div>
            <div class="hero-card-accent-bottom" />
          </div>
        </div>
      </template>
    </Slider>
  </section>
</template>

<style scoped>
.hero-section {
  @apply py-5;
}

.hero-container {
  @apply relative w-full h-[640px] rounded-6xl overflow-hidden;
}

.hero-bg-image {
  @apply absolute inset-0 w-full h-full object-cover;
}

.hero-tag {
  @apply absolute top-7.5 left-[50px] bg-white/10 px-5 py-3.5 rounded-4xl;
}

.hero-tag-text {
  @apply text-body-sm text-white uppercase;
}

.hero-title {
  @apply absolute top-[112px] left-[50px] text-display text-white uppercase;
}

.hero-description {
  @apply absolute top-[220px] left-[50px] w-[506px] text-body text-white leading-normal;
}

.hero-card {
  @apply absolute top-1/2 -translate-y-1/2 right-[50px] w-[285px] h-[210px] bg-white/10 rounded-3xl shadow-hero;
}

.hero-card-accent-top {
  @apply absolute top-0 left-1/2 -translate-x-1/2 w-[161px] h-[5px] bg-accent rounded-b-[5px];
}

.hero-card-accent-bottom {
  @apply absolute bottom-0 left-1/2 -translate-x-1/2 w-[161px] h-[5px] bg-primary rounded-t-[5px];
}

.hero-card-content {
  @apply absolute top-[10px] left-[10px] right-[10px] h-[190px] bg-bg-neutral/30 rounded-3xl p-7.5;
}

.hero-card-title {
  @apply text-body-lg font-black text-white uppercase leading-[25px] mt-6;
}

.hero-card-link {
  @apply flex items-center gap-2 mt-4;
}

.hero-card-link-text {
  @apply text-caption-sm font-black text-white uppercase;
}

.hero-card-arrow {
  @apply w-[21px] h-[9px];
}

.hero-pagination {
  @apply absolute bottom-7 left-1/2 -translate-x-1/2 flex items-center gap-2;
}

.hero-dot {
  @apply w-7.5 h-[7px] bg-divider rounded-[7px] transition-all;
}

.hero-dot.is-active {
  @apply w-[34px] h-[9px] bg-accent;
}

/* ── Tablet (≤1024px) ── */
@media (max-width: 1024px) {
  .hero-container {
    @apply h-[500px];
  }

  .hero-description {
    @apply w-[400px];
  }

  .hero-card {
    @apply w-[240px] h-[180px] right-[30px];
  }

  .hero-card-content {
    @apply h-[160px] p-5;
  }

  .hero-card-title {
    @apply text-body font-black mt-3;
  }
}

/* ── Mobile (≤768px) ── */
@media (max-width: 768px) {
  .hero-section {
    @apply py-3;
  }

  .hero-container {
    @apply h-[520px] rounded-3xl;
  }

  .hero-tag {
    @apply top-5 left-5 px-3 py-2;
  }

  .hero-tag-text {
    @apply text-caption-sm;
  }

  .hero-title {
    @apply top-[80px] left-5 text-h1;
  }

  .hero-description {
    @apply top-[150px] left-5 w-[calc(100%-40px)] text-caption;
  }

  .hero-card {
    @apply static translate-y-0 w-[calc(100%-40px)] h-auto mx-5 mt-auto;
    position: absolute;
    bottom: 20px;
    left: 0;
    right: 0;
    top: auto;
    transform: none;
    margin: 0 20px;
    width: calc(100% - 40px);
    height: auto;
  }

  .hero-card-content {
    @apply relative top-auto left-auto right-auto h-auto p-5;
    position: relative;
    inset: auto;
    height: auto;
    margin: 10px;
  }

  .hero-card-title {
    @apply text-body mt-2 leading-tight;
  }

  .hero-card-link {
    @apply mt-2;
  }
}
</style>
