<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function open() {
  router.push('/publications/waste-lifetime')
}
</script>

<template>
  <article
    class="promo"
    role="button"
    tabindex="0"
    aria-label="Открыть спецпроект Сколько живёт ваш мусор"
    @click="open"
    @keydown.enter.prevent="open"
    @keydown.space.prevent="open"
  >
    <div class="promo__mark" aria-hidden="true">
      <img class="promo__icon" src="/images/icons/waste-lifetime-recycle.png" alt="" />
    </div>
    <div class="promo__content">
      <h3 class="promo__title">
        Сколько живёт ваш мусор?
      </h3>
      <p class="promo__desc">
        Таймлайн разложения 24 категорий отходов: от 3 месяцев до 1 000 000 лет.
      </p>
      <div class="promo__meta" aria-hidden="true">
        <span>24 категории</span>
        <span>3 мес - 1 000 000 лет</span>
      </div>
    </div>
    <button class="promo__btn" @click.stop="open">
      Смотреть
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 8h10M9 4l4 4-4 4" />
      </svg>
    </button>
  </article>
</template>

<style scoped>
.promo {
  /* Фолбэки палитры — компонент работает и вне `.pubs-page` */
  --pub-brand: #0d9488;
  --pub-brand-700: #115e59;
  --pub-brand-100: #ccfbf1;
  --pub-brand-050: #ecfdf5;
  --pub-ink: #0c1713;
  --pub-ink-2: #2b3a34;
  --pub-ink-3: #566560;
  --pub-line: #e6ebe8;

  display: grid;
  grid-template-columns: 76px minmax(0, 1fr) auto;
  align-items: center;
  gap: 18px;
  min-height: 126px;
  background:
    linear-gradient(90deg, rgba(236, 253, 245, 0.96), rgba(255, 255, 255, 0.94) 52%, rgba(255, 251, 235, 0.78)),
    #ffffff;
  border: 1px solid var(--pub-line);
  border-radius: 16px;
  padding: 22px 24px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  isolation: isolate;
  box-shadow: 0 14px 44px -34px rgba(15, 23, 42, 0.35);
  transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
}

.promo::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 8% 50%, rgba(20, 184, 166, 0.16), transparent 28%),
    repeating-linear-gradient(90deg, rgba(15, 118, 110, 0.045) 0 1px, transparent 1px 72px);
  opacity: 0.72;
  z-index: 0;
  pointer-events: none;
}

.promo:hover {
  border-color: var(--pub-brand-100);
  box-shadow: 0 22px 60px -42px rgba(15, 23, 42, 0.45);
  transform: translateY(-2px);
}

.promo:focus-visible {
  outline: 3px solid var(--pub-brand-050);
  outline-offset: 3px;
}

.promo__mark {
  width: 76px;
  height: 76px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border: 1px solid rgba(20, 184, 166, 0.2);
  border-radius: 20px;
  background:
    radial-gradient(circle at 50% 50%, rgba(20, 184, 166, 0.1), transparent 58%),
    rgba(255, 255, 255, 0.86);
  position: relative;
  z-index: 1;
  overflow: hidden;
}

.promo__icon {
  width: 62px;
  height: 62px;
  object-fit: contain;
  display: block;
}

.promo__content {
  min-width: 0;
  position: relative;
  z-index: 1;
}

.promo__title {
  font-size: clamp(21px, 2.3vw, 28px);
  font-weight: 850;
  color: var(--pub-ink);
  margin: 0 0 5px;
  line-height: 1.12;
  letter-spacing: 0;
}

.promo__desc {
  margin: 0;
  font-size: 13.5px;
  color: var(--pub-ink-2);
  line-height: 1.5;
  max-width: 680px;
}

.promo__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.promo__meta span {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  border: 1px solid rgba(20, 184, 166, 0.18);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.66);
  color: var(--pub-ink-3);
  font-size: 11.5px;
  font-weight: 700;
  padding: 3px 10px;
}

.promo__btn {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 42px;
  padding: 0 18px;
  border-radius: 10px;
  background: var(--pub-brand);
  color: #fff;
  font-size: 13.5px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  white-space: nowrap;
  font-family: inherit;
  position: relative;
  z-index: 1;
  box-shadow: 0 12px 24px -18px rgba(0, 139, 122, 0.8);
  transition: background 0.16s ease, transform 0.16s ease;
}

.promo__btn:hover {
  background: var(--pub-brand-700);
  transform: translateX(2px);
}

@media (max-width: 800px) {
  .promo {
    grid-template-columns: 1fr;
    justify-items: start;
    padding: 24px 20px;
    gap: 16px;
  }

  .promo__btn {
    width: 100%;
    justify-content: center;
  }

  .promo__title {
    font-size: 22px;
  }
}
</style>
