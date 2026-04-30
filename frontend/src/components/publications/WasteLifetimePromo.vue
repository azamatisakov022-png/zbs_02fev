<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function open() {
  router.push('/publications/waste-lifetime')
}
</script>

<template>
  <div class="promo" @click="open">
    <div class="promo__icon-box">
      <svg class="promo__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2L8.5 8h3v4h1V8h3L12 2z M12 22l3.5-6h-3v-4h-1v4h-3L12 22z M2 12l6 3.5v-3h4v-1H8v-3L2 12z M22 12l-6-3.5v3h-4v1h4v3l6-3.5z" />
        <circle cx="12" cy="12" r="9" stroke-dasharray="2 4" />
      </svg>
    </div>
    <div class="promo__content">
      <span class="promo__badge">Спецпроект</span>
      <h3 class="promo__title">
        Сколько живёт <span class="promo__title-accent">ваш мусор?</span>
      </h3>
      <p class="promo__desc">
        Интерактивный таймлайн: узнайте, сколько лет природе нужно на разложение
        каждой из 24 категорий отходов — от 3 месяцев до 1 000 000 лет.
      </p>
    </div>
    <button class="promo__btn" @click.stop="open">
      Смотреть
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 8h10M9 4l4 4-4 4" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.promo {
  display: flex;
  align-items: center;
  gap: 24px;
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 40%, #fef9c3 100%);
  border-radius: 18px;
  padding: 24px 28px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
  position: relative;
  overflow: hidden;
}
.promo:hover {
  border-color: var(--pub-brand);
  box-shadow: 0 12px 32px -16px rgba(16, 185, 129, 0.25);
  transform: translateY(-2px);
}
.promo__icon-box {
  width: 72px;
  height: 72px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 16px;
}
.promo__icon {
  width: 42px;
  height: 42px;
  color: var(--pub-brand-700);
}
.promo__content {
  flex: 1;
  min-width: 0;
}
.promo__badge {
  display: inline-block;
  background: var(--pub-brand);
  color: #fff;
  font-size: 9.5px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 8px;
}
.promo__title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 24px;
  font-weight: 800;
  color: var(--pub-ink);
  margin: 0 0 6px;
  line-height: 1.25;
  letter-spacing: -0.01em;
}
.promo__title-accent {
  background: linear-gradient(90deg, #0d9488, #f59e0b, #ef4444);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.promo__desc {
  margin: 0;
  font-size: 13.5px;
  color: var(--pub-ink-2);
  line-height: 1.55;
  max-width: 720px;
}
.promo__btn {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 11px 22px;
  border-radius: 10px;
  background: var(--pub-brand);
  color: #fff;
  font-size: 13.5px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  white-space: nowrap;
  font-family: inherit;
  transition: background 0.2s ease, transform 0.2s ease;
}
.promo__btn:hover {
  background: var(--pub-brand-700);
  transform: translateX(2px);
}

@media (max-width: 800px) {
  .promo {
    flex-direction: column;
    text-align: center;
    padding: 24px 20px;
    gap: 16px;
  }
  .promo__btn {
    width: 100%;
    justify-content: center;
  }
  .promo__title {
    font-size: 20px;
  }
}
</style>
