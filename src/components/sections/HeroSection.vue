<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import slider1 from '@/assets/images/slider_1.png'

const { t } = useI18n()

const slides = computed(() => [
  {
    tag: t('hero.slides.0.tag'),
    image: slider1,
    title: t('hero.slides.0.title'),
    description: [
      t('hero.slides.0.desc1'),
      t('hero.slides.0.desc2'),
      t('hero.slides.0.desc3'),
    ],
  },
  {
    tag: t('hero.slides.1.tag'),
    image: slider1,
    title: t('hero.slides.1.title'),
    description: [
      t('hero.slides.1.desc1'),
      t('hero.slides.1.desc2'),
    ],
  },
  {
    tag: t('hero.slides.2.tag'),
    image: slider1,
    title: t('hero.slides.2.title'),
    description: [
      t('hero.slides.2.desc1'),
    ],
  },
])
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
                {{ $t('hero.cardTitle') }}
              </h3>
              <router-link to="/contract" class="hero-card-link">
                <span class="hero-card-link-text">{{ $t('hero.cardLink') }}</span>
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
  z-index: 2;
}

.hero-tag-text {
  @apply text-body-sm text-white uppercase;
}

.hero-title {
  @apply absolute top-[112px] left-[50px] text-display text-white uppercase;
  z-index: 2;
}

.hero-description {
  @apply absolute top-[220px] left-[50px] text-body text-white leading-normal;
  width: 506px;
  /* Prevent overlap with pagination — stop 80px above bottom */
  max-height: calc(100% - 220px - 80px);
  overflow: hidden;
  z-index: 2;
}

.hero-card {
  @apply absolute top-1/2 -translate-y-1/2 right-[50px] w-[285px] h-[210px] bg-white/10 rounded-3xl shadow-hero;
  z-index: 2;
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

/* ── Large desktop to ~1280px — description narrows to avoid card ── */
@media (max-width: 1280px) {
  .hero-description {
    width: 420px;
  }

  .hero-card {
    right: 30px;
    @apply w-[250px] h-[200px];
  }

  .hero-card-content {
    @apply h-[180px] p-5;
  }
}

/* ── Tablet (≤1024px) ── */
@media (max-width: 1024px) {
  .hero-container {
    @apply h-[540px];
  }

  .hero-tag {
    left: 30px;
    @apply px-4 py-2.5;
  }

  .hero-title {
    left: 30px;
    top: 100px;
    @apply text-h1;
  }

  .hero-description {
    left: 30px;
    top: 170px;
    width: 380px;
    @apply text-caption;
    max-height: calc(100% - 170px - 80px);
  }

  .hero-card {
    right: 24px;
    @apply w-[220px] h-[175px];
  }

  .hero-card-content {
    @apply h-[155px] p-4;
  }

  .hero-card-title {
    @apply text-body font-black mt-2 leading-tight;
  }

  .hero-card-link {
    @apply mt-2;
  }
}

/* ── Small tablet / large mobile (≤768px) ── */
@media (max-width: 768px) {
  .hero-section {
    @apply py-3;
  }

  .hero-container {
    @apply h-[560px] rounded-3xl;
  }

  .hero-tag {
    top: 20px;
    left: 20px;
    @apply px-3 py-2;
  }

  .hero-tag-text {
    @apply text-caption-sm;
  }

  .hero-title {
    top: 72px;
    left: 20px;
    @apply text-h2;
  }

  .hero-description {
    top: 130px;
    left: 20px;
    width: calc(100% - 40px);
    @apply text-caption-sm;
    max-height: 160px;
  }

  .hero-card {
    top: auto;
    bottom: 70px;
    left: 20px;
    right: 20px;
    transform: none;
    width: calc(100% - 40px);
    @apply h-[130px];
  }

  .hero-card-content {
    position: absolute;
    top: 8px;
    left: 8px;
    right: 8px;
    bottom: 8px;
    height: auto;
    @apply p-4 flex flex-row items-center justify-between;
  }

  .hero-card-title {
    @apply text-caption font-black mt-0 leading-tight;
  }

  .hero-card-link {
    @apply mt-0;
  }
}

/* ── Small mobile (≤480px) ── */
@media (max-width: 480px) {
  .hero-container {
    @apply h-[500px];
    border-radius: 20px;
  }

  .hero-title {
    top: 65px;
    @apply text-h3;
  }

  .hero-description {
    top: 110px;
    @apply text-caption-sm;
    max-height: 130px;
  }

  .hero-card {
    bottom: 60px;
    @apply h-[110px];
  }

  .hero-card-content {
    @apply p-3;
  }

  .hero-card-title {
    @apply text-caption-sm;
  }
}
</style>
