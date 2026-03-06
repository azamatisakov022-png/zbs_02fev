<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
  titleSize?: string
  subtitleSize?: string
  titleColor?: string
  subtitleColor?: string
}>()
</script>

<template>
  <div class="app-page-header">
    <h1 class="app-page-header__title" :style="{ fontSize: titleSize, color: titleColor }">
      {{ title }}
      <slot name="badge" />
    </h1>
    <p v-if="subtitle" class="app-page-header__subtitle" :style="{ fontSize: subtitleSize, color: subtitleColor }">
      {{ subtitle }}
    </p>
    <slot name="actions" />
  </div>
</template>

<style scoped>
.app-page-header {
  margin-bottom: 24px;
}
.app-page-header__title {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
}
@media (min-width: 1024px) {
  .app-page-header__title {
    font-size: 34px;
  }
}
.app-page-header__subtitle {
  font-size: 18px;
  color: #64748b;
}
</style>
