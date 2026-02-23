<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const emojis = ['🆕', '📊', '🏆', '📊']

const publications = computed(() =>
  Array.from({ length: 4 }, (_, i) => ({
    id: i + 1,
    emoji: emojis[i],
    title: t(`publications.items.${i}.title`),
    description: t(`publications.items.${i}.description`),
    date: t(`publications.items.${i}.date`),
  }))
)
</script>

<template>
  <div class="container-main">
  <div class="publications-section">
    <div class="publications-header-box">
      <div class="publications-title-group">
        <h1 class="section-title">
          {{ $t('publications.title') }}
        </h1>
        <p class="section-subtitle">
          {{ $t('publications.subtitle') }}
        </p>
      </div>
    </div>

    <div class="publications-scroll-container">
      <div class="publications-list">
        <div
          v-for="pub in publications"
          :key="pub.id"
          class="publication-card"
        >
          <div class="publication-card-content">
            <h3 class="publication-card-title">
              {{ pub.emoji }} {{ pub.title }}
            </h3>
            <p class="publication-card-desc">
              {{ pub.description }}
            </p>
          </div>
          <span class="publication-card-date">
            {{ pub.date }}
          </span>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>


<style scoped src="@/assets/styles/views/publication.css"></style>
