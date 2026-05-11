<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ updatedAt?: Date }>()

const updatedLabel = computed(() => {
  const d = props.updatedAt || new Date()
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`
})
</script>

<template>
  <section class="hero-wrap">
    <div class="hero-inner">
      <div class="hero__pill">
        <span class="hero__pill-dot" />
        Открытые данные · обновлено {{ updatedLabel }}
      </div>
      <h1 class="hero__title">Реестр лицензий</h1>
      <p class="hero__lead">
        Публичный реестр лицензий в сфере обращения с отходами Кыргызской Республики.
        Поиск по номеру, ИНН или наименованию организации.
      </p>
      <div class="hero__chips">
        <span class="info-chip">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 19V5a2 2 0 0 1 2-2h14v18H6a2 2 0 0 1-2-2z" /><path d="M8 7h8M8 11h8" />
          </svg>
          Закон КР № 195 от 19.10.2023
        </span>
        <span class="info-chip">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 3l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3z" /><path d="M9 12l2 2 4-4" />
          </svg>
          Данные верифицированы Минприроды
        </span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-wrap {
  padding-top: 32px;
}
.hero-inner {
  color: #fff;
  background: linear-gradient(135deg, #0d9488 0%, #10b981 100%);
  border-radius: 16px;
  padding: 28px 32px 32px;
  text-align: center;
  position: relative;
  overflow: hidden;
}
.hero__pill {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.25);
  font-size: 12px;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}
.hero__pill-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #7df0b4;
}
.hero__title {
  font-size: 32px;
  line-height: 1.1;
  letter-spacing: -0.6px;
  margin: 10px 0 6px;
  font-weight: 700;
}
.hero__lead {
  font-size: 14px;
  line-height: 1.5;
  max-width: 620px;
  color: rgba(255, 255, 255, 0.88);
  margin: 0 auto;
}
.hero__chips {
  display: flex;
  gap: 8px;
  margin-top: 16px;
  flex-wrap: wrap;
  justify-content: center;
}
.info-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.22);
  color: rgba(255, 255, 255, 0.94);
  font-size: 12px;
}

@media (max-width: 700px) {
  .hero__title {
    font-size: 24px;
  }
  .hero-inner {
    padding: 22px 18px 26px;
  }
}
</style>
