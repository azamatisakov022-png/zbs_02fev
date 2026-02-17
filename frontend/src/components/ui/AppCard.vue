<script setup lang="ts">
defineProps<{
  padding?: 'sm' | 'md' | 'lg'
  hoverable?: boolean
  selected?: boolean
}>()
</script>

<template>
  <div
    :class="[
      'app-card',
      `app-card--${padding || 'md'}`,
      { 'app-card--hoverable': hoverable, 'app-card--selected': selected }
    ]"
  >
    <slot />
  </div>
</template>

<style scoped>
.app-card {
  background: #fff;
  border: 1px solid #E2E8F0;
  border-radius: 14px;
  transition: all 0.2s ease;
}

.app-card--sm { padding: 12px; }
.app-card--md { padding: 20px; }
.app-card--lg { padding: 28px; }

.app-card--hoverable {
  cursor: pointer;
}
.app-card--hoverable:hover {
  border-color: #22C55E;
  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.1);
}

.app-card--selected {
  border-color: #22C55E;
  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.1);
}
</style>
