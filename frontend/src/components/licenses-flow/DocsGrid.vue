<script setup lang="ts">
import type { DocumentItem } from '../../types/licenses'

defineProps<{
  docs: DocumentItem[]
  labelFor?: (d: DocumentItem) => string
}>()
defineEmits<{ (e: 'preview', d: DocumentItem): void }>()

function fmtSize(size?: number) {
  if (!size) return '-'
  if (size < 1024) return `${size} Б`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(0)} КБ`
  return `${(size / 1024 / 1024).toFixed(1)} МБ`
}
</script>

<template>
  <div class="docs-grid">
    <div
      v-for="d in docs"
      :key="d.id"
      class="docs-grid__item"
    >
      <div class="docs-grid__icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <path d="M14 2v6h6" />
        </svg>
      </div>
      <div class="docs-grid__info">
        <div class="docs-grid__label">{{ labelFor ? labelFor(d) : (d.docType || d.fileName) }}</div>
        <div class="docs-grid__size">{{ fmtSize(d.fileSize) }}</div>
      </div>
      <button type="button" class="docs-grid__btn" @click="$emit('preview', d)" title="Просмотр">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.docs-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  background: var(--lf-line-2);
}
.docs-grid__item {
  padding: 12px 18px;
  background: #fff;
  display: flex;
  gap: 12px;
  align-items: center;
}
.docs-grid__icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: var(--lf-brand-050);
  color: var(--lf-brand-700);
  display: grid;
  place-items: center;
  flex-shrink: 0;
}
.docs-grid__info {
  flex: 1;
  min-width: 0;
}
.docs-grid__label {
  font-size: 13px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--lf-ink);
}
.docs-grid__size {
  font-size: 11px;
  color: var(--lf-ink-4);
  margin-top: 2px;
}
.docs-grid__btn {
  border: none;
  background: transparent;
  color: var(--lf-ink-4);
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  display: grid;
  place-items: center;
}
.docs-grid__btn:hover {
  color: var(--lf-brand);
  background: var(--lf-brand-050);
}

@media (max-width: 640px) {
  .docs-grid {
    grid-template-columns: 1fr;
  }
}
</style>
