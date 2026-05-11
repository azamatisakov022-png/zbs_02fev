<script setup lang="ts">
defineProps<{
  licenseNumber?: string
  issuedAt?: string
  licenseTypeLabel: string
  validUntil?: string
  hasDocument: boolean
}>()
defineEmits<{ (e: 'download'): void; (e: 'qr'): void }>()

function fmt(d?: string) {
  return d ? new Date(d).toLocaleDateString('ru-RU') : '-'
}
</script>

<template>
  <div class="hero">
    <div class="hero__halo" />
    <div class="hero__eyebrow">
      <span class="hero__eyebrow-line" />
      Министерство природных ресурсов, экологии и технического надзора КР
    </div>
    <h2 class="hero__title">Лицензия выдана</h2>
    <p class="hero__lead">
      Деятельность «{{ licenseTypeLabel }}» разрешена.
      <template v-if="validUntil">
        Действует до <b>{{ fmt(validUntil) }}</b>.
      </template>
    </p>
    <div class="hero__facts">
      <div>
        <div class="hero__fact-label">Номер лицензии</div>
        <div class="hero__fact-value mono">{{ licenseNumber || '-' }}</div>
      </div>
      <div>
        <div class="hero__fact-label">Дата выдачи</div>
        <div class="hero__fact-value mono">{{ fmt(issuedAt) }}</div>
      </div>
      <div>
        <div class="hero__fact-label">Статус</div>
        <div class="hero__fact-value hero__fact-value--status">
          <span class="hero__status-dot" />
          Действует
        </div>
      </div>
    </div>
    <div class="hero__actions">
      <button
        type="button"
        class="hero__btn hero__btn--accent"
        :disabled="!hasDocument"
        @click="$emit('download')"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 3v13M6 12l6 5 6-5M4 21h16" />
        </svg>
        <template v-if="hasDocument">Скачать лицензию (PDF)</template>
        <template v-else>PDF ещё готовится</template>
      </button>
      <button type="button" class="hero__btn hero__btn--ghost" @click="$emit('qr')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="6" height="6" /><rect x="15" y="3" width="6" height="6" />
          <rect x="3" y="15" width="6" height="6" /><rect x="12" y="12" width="3" height="3" />
          <rect x="18" y="18" width="3" height="3" />
        </svg>
        Показать QR для проверки
      </button>
    </div>
  </div>
</template>

<style scoped>
.hero {
  position: relative;
  padding: 32px 36px;
  border-radius: 14px;
  color: #fff;
  background: linear-gradient(135deg, #065f46 0%, #047857 70%, #0f766e 100%);
  overflow: hidden;
  border: none;
}
.hero__halo {
  position: absolute;
  top: -80px;
  right: -80px;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
}
.hero__eyebrow {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  opacity: 0.85;
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
}
.hero__eyebrow-line {
  width: 24px;
  height: 1px;
  background: #fff;
}
.hero__title {
  font-size: 36px;
  font-weight: 700;
  letter-spacing: -0.8px;
  line-height: 1.08;
  margin: 10px 0 8px;
  position: relative;
}
.hero__lead {
  font-size: 14.5px;
  opacity: 0.9;
  margin: 0;
  max-width: 520px;
  line-height: 1.5;
  position: relative;
}
.hero__lead b {
  font-weight: 600;
  opacity: 1;
}
.hero__facts {
  display: flex;
  gap: 32px;
  margin-top: 22px;
  flex-wrap: wrap;
  position: relative;
}
.hero__fact-label {
  font-size: 11px;
  opacity: 0.75;
  font-weight: 600;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}
.hero__fact-value {
  font-size: 17px;
  font-weight: 600;
  margin-top: 3px;
}
.hero__fact-value--status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.hero__status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #86efac;
  box-shadow: 0 0 0 3px rgba(134, 239, 172, 0.3);
  animation: pulse 2s infinite;
}
.hero__actions {
  display: flex;
  gap: 10px;
  margin-top: 24px;
  flex-wrap: wrap;
  position: relative;
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
  transition: filter 0.12s ease, opacity 0.12s ease;
}
.hero__btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.hero__btn--accent {
  background: var(--lf-accent);
  color: #fff;
  border: none;
  box-shadow: 0 4px 12px -4px rgba(245, 154, 46, 0.5);
}
.hero__btn--accent:hover:not(:disabled) {
  filter: brightness(1.05);
}
.hero__btn--ghost {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #fff;
}
.hero__btn--ghost:hover {
  background: rgba(255, 255, 255, 0.18);
}
.mono {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 3px rgba(134, 239, 172, 0.3); }
  50% { box-shadow: 0 0 0 6px rgba(134, 239, 172, 0.12); }
}

@media (max-width: 640px) {
  .hero {
    padding: 24px 22px;
  }
  .hero__title {
    font-size: 28px;
  }
  .hero__facts {
    gap: 20px;
  }
}
</style>
