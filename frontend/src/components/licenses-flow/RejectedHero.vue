<script setup lang="ts">
defineProps<{
  reasonLabel?: string
  reasonDesc?: string
  inspectorComment?: string
  inspectorName?: string
  rejectedAt?: string
  reopening?: boolean
}>()
defineEmits<{ (e: 'reopen'): void; (e: 'message'): void }>()

function fmt(d?: string) {
  return d ? new Date(d).toLocaleDateString('ru-RU') : ''
}
</script>

<template>
  <div class="hero">
    <div class="hero__icon">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 9v4M12 17v.01" />
        <path d="M10.3 3.9L2.8 16.5c-.8 1.4.2 3.2 1.9 3.2h14.6c1.7 0 2.7-1.8 1.9-3.2L13.7 3.9c-.8-1.3-2.6-1.3-3.4 0z" />
      </svg>
    </div>
    <div class="hero__body">
      <div class="hero__eyebrow">Заявка отклонена</div>
      <h2 class="hero__title">{{ reasonLabel || 'Заявка отклонена' }}</h2>
      <p v-if="reasonDesc" class="hero__lead">{{ reasonDesc }}</p>
      <div v-if="inspectorComment" class="hero__comment">
        <div class="hero__comment-label">Комментарий инспектора</div>
        <div class="hero__comment-text">«{{ inspectorComment }}»</div>
        <div class="hero__comment-meta">
          <template v-if="inspectorName">- {{ inspectorName }}</template>
          <template v-if="inspectorName && rejectedAt">, </template>
          <template v-if="rejectedAt">{{ fmt(rejectedAt) }}</template>
        </div>
      </div>
      <div class="hero__actions">
        <button type="button" class="hero__btn hero__btn--primary" :disabled="reopening" @click="$emit('reopen')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />
          </svg>
          {{ reopening ? 'Обработка…' : 'Доработать и подать заново' }}
        </button>
        <button type="button" class="hero__btn hero__btn--ghost" @click="$emit('message')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
          Обсудить с инспектором
        </button>
      </div>
      <p class="hero__note">
        Платёж госпошлины сохраняется - повторная оплата не требуется.
      </p>
    </div>
  </div>
</template>

<style scoped>
.hero {
  padding: 24px 28px;
  border-radius: 14px;
  display: flex;
  gap: 20px;
  align-items: flex-start;
  background: linear-gradient(135deg, #fef2f2 0%, #fff 100%);
  border: 1px solid #fecaca;
}
.hero__icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: #fff;
  color: var(--lf-rose);
  border: 1px solid #fecaca;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}
.hero__body {
  flex: 1;
  min-width: 0;
}
.hero__eyebrow {
  font-size: 11px;
  font-weight: 700;
  color: var(--lf-rose);
  letter-spacing: 0.5px;
  text-transform: uppercase;
}
.hero__title {
  font-size: 22px;
  font-weight: 700;
  margin: 4px 0 6px;
  letter-spacing: -0.3px;
  color: #991b1b;
}
.hero__lead {
  font-size: 13.5px;
  color: var(--lf-ink-3);
  margin: 0;
  line-height: 1.55;
  max-width: 620px;
}
.hero__comment {
  margin-top: 14px;
  padding: 14px;
  background: #fff;
  border: 1px solid #fecaca;
  border-radius: 10px;
}
.hero__comment-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--lf-ink-3);
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin-bottom: 6px;
}
.hero__comment-text {
  font-size: 13.5px;
  color: var(--lf-ink-2);
  line-height: 1.55;
}
.hero__comment-meta {
  font-size: 11.5px;
  color: var(--lf-ink-4);
  margin-top: 8px;
}
.hero__actions {
  display: flex;
  gap: 10px;
  margin-top: 16px;
  flex-wrap: wrap;
}
.hero__btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 10px;
  font-size: 13.5px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  border: none;
  transition: filter 0.12s ease;
}
.hero__btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.hero__btn--primary {
  background: var(--lf-brand);
  color: #fff;
}
.hero__btn--primary:hover:not(:disabled) {
  filter: brightness(1.08);
}
.hero__btn--ghost {
  background: #fff;
  color: var(--lf-ink-2);
  border: 1px solid var(--lf-line);
}
.hero__btn--ghost:hover {
  background: var(--lf-bg);
}
.hero__note {
  font-size: 11.5px;
  color: var(--lf-ink-4);
  margin: 10px 0 0;
}

@media (max-width: 640px) {
  .hero {
    flex-direction: column;
    padding: 20px;
  }
  .hero__title {
    font-size: 18px;
  }
}
</style>
