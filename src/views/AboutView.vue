<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const functions = computed(() =>
  Array.from({ length: 6 }, (_, i) => t(`about.functions.${i}`))
)
</script>

<template>
  <div class="about-page">
    <div class="container-main header-section">
      <div class="header-content">
        <h1 class="main-title">{{ $t('about.pageTitle') }}</h1>
        <p class="subtitle">
          {{ $t('about.pageSubtitle') }}
        </p>
      </div>
    </div>

    <div class="container-main px-4">
      <div class="cards-grid">

        <div class="info-card">
          <div class="accent-bar-top" />

          <div class="illustration-container">
            <img src="@/assets/images/about-goals.svg" alt="Goals" />
          </div>

          <div class="card-content">
            <h3 class="card-title">{{ $t('about.goalTitle') }}</h3>
            <p class="card-description">
              {{ $t('about.goalDescription') }}
            </p>
          </div>

          <div class="accent-bar-bottom" />
        </div>

        <div class="info-card">
          <div class="accent-bar-top" />

          <div class="illustration-container">
            <img src="@/assets/images/about-functions.svg" alt="Functions" />
          </div>

          <div class="card-content">
            <h3 class="card-title">{{ $t('about.functionsTitle') }}</h3>
            <ul class="functions-list">
              <li v-for="(func, index) in functions" :key="index">
                {{ func }}
              </li>
            </ul>
          </div>

          <div class="accent-bar-bottom" />
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped src="@/assets/styles/views/about.css"></style>
