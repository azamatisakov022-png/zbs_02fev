<script setup lang="ts">
import { CATEGORY_COLORS, CATEGORY_LABELS, type PublicationCategory } from '../../types/publications'

defineProps<{ category: PublicationCategory; size?: 'sm' | 'md' }>()
</script>

<template>
  <span class="cat-pill" :class="size === 'sm' ? 'cat-pill--sm' : ''">
    <span class="cat-pill__dot" :style="{ background: CATEGORY_COLORS[category] }" />
    {{ CATEGORY_LABELS[category] }}
  </span>
</template>

<style scoped>
.cat-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--pub-ink-2);
}
.cat-pill--sm {
  font-size: 10.5px;
  gap: 7px;
}
.cat-pill__dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  flex-shrink: 0;
}
</style>
