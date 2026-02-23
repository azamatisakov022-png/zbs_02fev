<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const ctaButtons = computed(() => [
  { label: t('cta.registries'), href: '/registries' },
  { label: t('cta.calculator'), href: '/calculator' },
  { label: t('cta.contact'), href: '/contact' },
])

</script>

<template>
  <section class="py-8">
    <div class="container-main">
      <div class="cta-banner">
        <h2 class="cta-title">
          {{ $t('cta.title') }}
        </h2>
        <p class="cta-description">
          {{ $t('cta.description') }}
        </p>

        <div class="cta-buttons">
          <router-link
            v-for="button in ctaButtons"
            :key="button.href"
            :to="button.href"
            class="cta-btn"
          >
            {{ button.label }}
          </router-link>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.cta-banner {
  @apply bg-primary rounded-6xl py-15 px-[151px] text-center;
}

.cta-title {
  @apply text-h1 font-bold text-white uppercase mb-6;
}

.cta-description {
  @apply text-h2 font-medium text-white leading-normal mb-10 max-w-[1057px] mx-auto;
}

.cta-btn {
  @apply bg-white/30 text-white text-body-sm font-medium uppercase px-7.5 py-3.5 rounded-4xl transition-colors duration-300;
}

.cta-btn:hover {
  @apply bg-white/40;
}

.cta-buttons {
  @apply flex justify-center gap-10;
}

@media (max-width: 1024px) {
  .cta-banner {
    @apply px-15 py-12;
  }

  .cta-title {
    @apply text-h3;
  }

  .cta-description {
    @apply text-h4 mb-8;
  }

  .cta-buttons {
    @apply gap-4;
  }

  .cta-btn {
    @apply text-caption px-5 py-3;
  }
}

@media (max-width: 768px) {
  .cta-banner {
    @apply px-6 py-10 rounded-3xl;
  }

  .cta-title {
    @apply text-h5 mb-4;
  }

  .cta-description {
    @apply text-body mb-6;
  }

  .cta-buttons {
    @apply flex-col items-center gap-3;
  }

  .cta-btn {
    @apply w-full text-center text-caption-sm px-4 py-3;
  }
}
</style>
