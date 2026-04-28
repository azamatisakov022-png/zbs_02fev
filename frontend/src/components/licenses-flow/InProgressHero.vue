<script setup lang="ts">
defineProps<{ daysLeft?: number; statusLabel: string }>()
</script>

<template>
  <div class="hero hero--progress">
    <div class="hero__icon">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    </div>
    <div class="hero__body">
      <div class="hero__eyebrow">{{ statusLabel }}</div>
      <div class="hero__title">Ваша заявка в работе у инспектора</div>
      <div class="hero__lead">
        <template v-if="daysLeft !== undefined && daysLeft >= 0">
          До завершения рассмотрения осталось <b>{{ daysLeft }} дн.</b>
          Вы получите уведомление о каждом изменении статуса.
        </template>
        <template v-else-if="daysLeft !== undefined && daysLeft < 0">
          Срок рассмотрения был превышен на <b>{{ Math.abs(daysLeft) }} дн.</b>
          Инспектор завершит рассмотрение в ближайшее время.
        </template>
        <template v-else>
          Вы получите уведомление о каждом изменении статуса.
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hero {
  padding: 24px 28px;
  border-radius: 14px;
  display: flex;
  gap: 20px;
  align-items: center;
  border: 1px solid var(--lf-indigo-050);
  background: linear-gradient(135deg, var(--lf-indigo-050) 0%, #f8fafc 100%);
}
.hero__icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: #fff;
  color: var(--lf-indigo);
  display: grid;
  place-items: center;
  box-shadow: 0 4px 12px -4px rgba(79, 70, 229, 0.3);
  flex-shrink: 0;
}
.hero__body {
  flex: 1;
  min-width: 0;
}
.hero__eyebrow {
  font-size: 11px;
  font-weight: 700;
  color: var(--lf-indigo);
  letter-spacing: 0.5px;
  text-transform: uppercase;
}
.hero__title {
  font-size: 22px;
  font-weight: 700;
  margin-top: 4px;
  letter-spacing: -0.3px;
  color: var(--lf-ink);
}
.hero__lead {
  font-size: 13.5px;
  color: var(--lf-ink-3);
  margin-top: 6px;
  line-height: 1.55;
}
.hero__lead b {
  color: var(--lf-indigo);
}

@media (max-width: 640px) {
  .hero {
    flex-direction: column;
    align-items: flex-start;
    padding: 20px;
  }
  .hero__title {
    font-size: 18px;
  }
}
</style>
