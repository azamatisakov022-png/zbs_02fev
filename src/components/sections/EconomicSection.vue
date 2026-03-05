<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const benefits = computed(() =>
  Array.from({ length: 5 }, (_, i) => t(`economic.benefits.${i}`))
)
</script>

<template>
  <section class="economic-section">
    <div class="container-main">
      <div class="economic-header">
        <h2 class="home-page-title">{{ $t('economic.title') }}</h2>
        <div class="home-page-title-line" />
      </div>

      <div class="two-col-layout">
        <div class="two-col-image">
          <img
            src="@/assets/images/economic-hands.png"
            :alt="$t('economic.title')"
          />
        </div>

        <div class="two-col-content">
          <p class="section-intro-text">
            {{ $t('economic.intro') }}
          </p>

          <p class="section-intro-text">
            {{ $t('economic.fundsIntro') }}
          </p>

          <div class="check-list">
            <div
              v-for="(benefit, index) in benefits"
              :key="index"
              class="check-item"
            >
              <img
                src="@/assets/images/icons/check-circle.svg"
                alt="check"
                class="check-icon"
              />
              <span class="section-info-text">
                {{ benefit }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.economic-section {
  @apply pt-25;
}

.economic-header {
  @apply mb-15;
}

@media (max-width: 1024px) {
  .economic-section {
    @apply pt-15;
  }

  .economic-header {
    @apply mb-10;
  }
}

@media (max-width: 768px) {
  .economic-section {
    padding-top: 40px;
  }

  .economic-header {
    margin-bottom: 24px;
  }
}
</style>
