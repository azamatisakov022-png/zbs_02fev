<script setup lang="ts">
import type { MyCompany } from '../../api/companies'

defineProps<{
  company: MyCompany | null
  /** Когда true - компактный inline-вариант (используется в Шаге 1, заголовком). */
  compact?: boolean
}>()
</script>

<template>
  <div v-if="company" class="pc" :class="{ 'pc--compact': compact }">
    <div class="pc__icon">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16" />
        <path d="M9 7h1M9 11h1M9 15h1M14 7h1M14 11h1M14 15h1" />
      </svg>
    </div>
    <div class="pc__body">
      <div class="pc__title-row">
        <span class="pc__name">{{ company.companyName }}</span>
        <span v-if="company.legalForm" class="pc__form">{{ company.legalForm }}</span>
      </div>
      <div class="pc__meta">
        <span>ИНН <span class="mono">{{ company.inn }}</span></span>
        <span v-if="!compact && company.address" class="pc__sep">·</span>
        <span v-if="!compact && company.address" class="pc__addr">{{ company.address }}</span>
      </div>
      <div v-if="!compact && (company.director || company.phone || company.email)" class="pc__contacts">
        <span v-if="company.director">{{ company.director }}</span>
        <span v-if="company.director && (company.phone || company.email)" class="pc__sep">·</span>
        <span v-if="company.phone" class="mono">{{ company.phone }}</span>
        <span v-if="company.phone && company.email" class="pc__sep">·</span>
        <span v-if="company.email">{{ company.email }}</span>
      </div>
    </div>
    <slot name="action" />
  </div>
</template>

<style scoped>
.pc {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  padding: 14px 18px;
  background: var(--lf-bg);
  border: 1px solid var(--lf-line);
  border-radius: 12px;
}
.pc--compact {
  padding: 10px 14px;
  align-items: center;
  gap: 10px;
}
.pc__icon {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 9px;
  background: #fff;
  border: 1px solid var(--lf-line);
  display: grid;
  place-items: center;
  color: var(--lf-brand-700);
}
.pc--compact .pc__icon {
  width: 28px;
  height: 28px;
  border-radius: 7px;
}
.pc__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.pc__title-row {
  display: flex;
  align-items: baseline;
  gap: 10px;
  flex-wrap: wrap;
}
.pc__name {
  font-size: 14px;
  font-weight: 600;
  color: var(--lf-ink);
}
.pc__form {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.4px;
  color: var(--lf-brand-700);
  background: var(--lf-brand-050);
  padding: 2px 8px;
  border-radius: 999px;
  text-transform: uppercase;
}
.pc__meta {
  font-size: 12.5px;
  color: var(--lf-ink-3);
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.pc__contacts {
  font-size: 12px;
  color: var(--lf-ink-4);
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.pc__sep {
  opacity: 0.5;
}
.pc__addr {
  flex: 1;
  min-width: 0;
}
.mono {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
}
</style>
