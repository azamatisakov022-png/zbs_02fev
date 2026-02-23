<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const obligations = computed(() =>
  Array.from({ length: 4 }, (_, i) => t(`producer.obligations.${i}`))
)
</script>

<template>
  <section class="producer-section">
    <div class="container-main">
      <div class="producer-header">
        <h2 class="home-page-title">
          {{ $t('producer.title') }}
        </h2>
        <div class="home-page-title-line" />
      </div>

      <div class="two-col-layout">
        <div class="two-col-content">
          <p class="section-intro-text">
            {{ $t('producer.intro') }}
          </p>

          <p class="section-intro-text">
            {{ $t('producer.ensures') }}
          </p>

          <div class="check-list">
            <div
              v-for="(obligation, index) in obligations"
              :key="index"
              class="check-item"
            >
              <img
                src="@/assets/images/icons/check-circle.svg"
                alt="check"
                class="check-icon"
              />
              <span class="section-info-text">
                {{ obligation }}
              </span>
            </div>
          </div>
        </div>

        <div class="two-col-image">
          <img
            src="@/assets/images/economic-hands.png"
            :alt="$t('producer.title')"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.producer-section {
  @apply mt-25;
}

.producer-header {
  @apply mb-12;
}

@media (max-width: 1024px) {
  .producer-section {
    @apply mt-15;
  }

  .producer-header {
    @apply mb-8;
  }
}

@media (max-width: 768px) {
  .producer-section {
    margin-top: 40px;
  }

  .producer-header {
    margin-bottom: 20px;
  }
}
</style>
