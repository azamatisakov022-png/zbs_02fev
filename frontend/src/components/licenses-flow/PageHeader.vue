<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
  breadcrumb?: string[]
}>()
</script>

<template>
  <div class="page-header">
    <nav v-if="breadcrumb?.length" class="page-header__breadcrumb">
      <template v-for="(b, i) in breadcrumb" :key="i">
        <span class="page-header__bc-item" :class="{ 'page-header__bc-item--last': i === breadcrumb.length - 1 }">{{ b }}</span>
        <span v-if="i < breadcrumb.length - 1" class="page-header__bc-sep">›</span>
      </template>
    </nav>
    <div class="page-header__row">
      <div class="page-header__main">
        <h1 class="page-header__title">{{ title }}</h1>
        <p v-if="subtitle" class="page-header__subtitle">
          <slot name="subtitle">{{ subtitle }}</slot>
        </p>
        <p v-else-if="$slots.subtitle" class="page-header__subtitle">
          <slot name="subtitle" />
        </p>
      </div>
      <div v-if="$slots.right" class="page-header__right">
        <slot name="right" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-header {
  margin-bottom: 24px;
}
.page-header__breadcrumb {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--lf-ink-4);
  margin-bottom: 10px;
  flex-wrap: wrap;
}
.page-header__bc-item {
  color: var(--lf-ink-4);
}
.page-header__bc-item--last {
  color: var(--lf-ink-2);
  font-weight: 500;
}
.page-header__bc-sep {
  color: var(--lf-ink-4);
  opacity: 0.6;
}
.page-header__row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}
.page-header__title {
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.4px;
  margin: 0;
  color: var(--lf-ink);
}
.page-header__subtitle {
  margin: 4px 0 0;
  font-size: 13.5px;
  color: var(--lf-ink-3);
  line-height: 1.5;
}
.page-header__right {
  flex-shrink: 0;
}
</style>
