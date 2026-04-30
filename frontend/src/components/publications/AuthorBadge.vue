<script setup lang="ts">
import { AUTHOR_LABELS, AUTHOR_FULL_LABELS, type PublicationAuthorOrg } from '../../types/publications'

withDefaults(
  defineProps<{
    author: PublicationAuthorOrg
    full?: boolean
    size?: 'sm' | 'md'
  }>(),
  { full: false, size: 'md' }
)
</script>

<template>
  <span class="author" :class="[`author--${author.toLowerCase()}`, size === 'sm' ? 'author--sm' : '']">
    <svg v-if="author === 'MPRETN'" class="author__icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
      <rect x="2.5" y="3" width="11" height="11" rx="0.5" />
      <path d="M5 3v11M11 3v11M2.5 7h11M2.5 10.5h11" />
      <rect x="6.5" y="11.5" width="3" height="2.5" />
    </svg>
    <svg v-else class="author__icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
      <path d="M13.5 2.5C13.5 8 9.5 13 3 13.5 3 8 7 3 13.5 2.5z" />
      <path d="M3 13.5L8 8.5" />
    </svg>
    {{ full ? AUTHOR_FULL_LABELS[author] : AUTHOR_LABELS[author] }}
  </span>
</template>

<style scoped>
.author {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  font-weight: 600;
}
.author--sm {
  font-size: 11.5px;
  gap: 6px;
}
.author__icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}
.author--sm .author__icon {
  width: 12px;
  height: 12px;
}
.author--mpretn {
  color: var(--pub-ink-2);
}
.author--eco_operator {
  color: var(--pub-brand-700);
}
.author--admin_generic {
  color: var(--pub-ink-3);
}
</style>
