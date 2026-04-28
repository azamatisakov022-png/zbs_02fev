<script setup lang="ts">
import { computed } from 'vue'

type Kind = 'neutral' | 'success' | 'warn' | 'muted'

const props = withDefaults(
  defineProps<{
    kind?: Kind
    label: string
    value: number | string
    sub?: string
    hint?: string
    active?: boolean
  }>(),
  { kind: 'neutral', active: false }
)

defineEmits<{ (e: 'click'): void }>()

const palettes: Record<Kind, { bg: string; border: string; ink: string; sub: string; accent: string }> = {
  neutral: { bg: '#fff', border: 'var(--lr-line)', ink: 'var(--lr-ink)', sub: 'var(--lr-ink-3)', accent: 'var(--lr-ink-2)' },
  success: { bg: 'var(--lr-brand-025)', border: '#CFE8DB', ink: 'var(--lr-brand-700)', sub: 'var(--lr-brand-600)', accent: 'var(--lr-brand)' },
  warn: { bg: 'var(--lr-amber-050)', border: '#F5D99A', ink: '#7A4D0A', sub: 'var(--lr-amber)', accent: 'var(--lr-amber)' },
  muted: { bg: '#F1F3F1', border: '#E0E5E0', ink: '#3A4742', sub: 'var(--lr-ink-3)', accent: 'var(--lr-ink-3)' },
}
const p = computed(() => palettes[props.kind])
const boxShadow = computed(() =>
  props.active
    ? `0 0 0 2px ${p.value.accent}, 0 8px 24px -12px rgba(0,0,0,.12)`
    : '0 1px 2px rgba(12,23,19,.03)'
)
</script>

<template>
  <button
    class="stat-card"
    :style="{ background: p.bg, borderColor: p.border, boxShadow }"
    @click="$emit('click')"
  >
    <div class="stat-card__row">
      <div class="stat-card__label" :style="{ color: p.sub }">{{ label }}</div>
      <slot name="icon" />
    </div>
    <div class="stat-card__value-row">
      <div class="stat-card__value" :style="{ color: p.ink }">{{ value }}</div>
      <div v-if="sub" class="stat-card__sub" :style="{ color: p.sub }">{{ sub }}</div>
    </div>
    <div v-if="hint" class="stat-card__hint" :style="{ color: p.sub }">{{ hint }}</div>
    <slot />
  </button>
</template>

<style scoped>
.stat-card {
  text-align: left;
  border: 1px solid;
  border-radius: 14px;
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 128px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: transform 0.12s ease, box-shadow 0.12s ease;
  font-family: inherit;
}
.stat-card__row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.stat-card__label {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.2px;
}
.stat-card__value-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.stat-card__value {
  font-size: 40px;
  font-weight: 700;
  letter-spacing: -1.2px;
  line-height: 1;
}
.stat-card__sub {
  font-size: 13px;
  font-weight: 500;
}
.stat-card__hint {
  font-size: 12px;
  margin-top: auto;
}
</style>
