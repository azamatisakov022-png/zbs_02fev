<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const goToTimeline = () => {
  router.push('/publications/waste-lifetime')
}

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    goToTimeline()
  }
}

// Анимация цифры 0 → 1 000 000 при появлении в viewport (vanilla rAF)
const rootEl = ref<HTMLElement | null>(null)
const counterDisplay = ref('0')
let rafId = 0
let observer: IntersectionObserver | null = null
let started = false

const formatRu = (n: number) => n.toLocaleString('ru-RU').replace(/,/g, ' ')

const runCounter = () => {
  if (started) return
  started = true
  const target = 1_000_000
  const duration = 1800
  const startTime = performance.now()
  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
  const tick = (now: number) => {
    const t = Math.min(1, (now - startTime) / duration)
    const value = Math.floor(easeOutCubic(t) * target)
    counterDisplay.value = formatRu(value)
    if (t < 1) rafId = requestAnimationFrame(tick)
    else counterDisplay.value = formatRu(target)
  }
  rafId = requestAnimationFrame(tick)
}

onMounted(() => {
  if (!rootEl.value) return
  if (typeof IntersectionObserver === 'undefined') {
    runCounter()
    return
  }
  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        runCounter()
        observer?.disconnect()
      }
    })
  }, { threshold: 0.3 })
  observer.observe(rootEl.value)
})

onBeforeUnmount(() => {
  if (rafId) cancelAnimationFrame(rafId)
  observer?.disconnect()
})

// 24 категории на timeline-bar - относительные позиции (0..1) на лог-шкале
// от 3 месяцев (~0.25 года) до 1 000 000 лет.
const timelinePoints: { pos: number; label: string; years: string }[] = [
  { pos: 0.00, label: 'Бумага', years: '3 мес' },
  { pos: 0.05, label: 'Картон', years: '6 мес' },
  { pos: 0.09, label: 'Огрызок яблока', years: '1 год' },
  { pos: 0.14, label: 'Окурок', years: '2 года' },
  { pos: 0.19, label: 'Шерсть', years: '3 года' },
  { pos: 0.25, label: 'Жвачка', years: '5 лет' },
  { pos: 0.31, label: 'Древесина', years: '10 лет' },
  { pos: 0.37, label: 'Кожа', years: '25 лет' },
  { pos: 0.42, label: 'Консерв. банка', years: '50 лет' },
  { pos: 0.47, label: 'Резина', years: '80 лет' },
  { pos: 0.51, label: 'Алюминий', years: '100 лет' },
  { pos: 0.55, label: 'Полиэтилен', years: '200 лет' },
  { pos: 0.60, label: 'Пакет', years: '400 лет' },
  { pos: 0.64, label: 'Пластик. бутылка', years: '450 лет' },
  { pos: 0.68, label: 'Леска', years: '600 лет' },
  { pos: 0.72, label: 'Подгузник', years: '500 лет' },
  { pos: 0.76, label: 'Пенопласт', years: '1000 лет' },
  { pos: 0.80, label: 'Батарейка', years: '110 лет' },
  { pos: 0.83, label: 'PET', years: '700 лет' },
  { pos: 0.87, label: 'Шприц', years: '500 лет' },
  { pos: 0.90, label: 'Капсула кофе', years: '500 лет' },
  { pos: 0.94, label: 'Стекло', years: '1 000 000 лет' },
  { pos: 0.97, label: 'Ртуть', years: '∞' },
  { pos: 1.00, label: 'Радиоактив.', years: '∞' },
]
</script>

<template>
  <article
    ref="rootEl"
    class="hero"
    role="button"
    tabindex="0"
    aria-label="Открыть спецпроект: Сколько живёт ваш мусор"
    @click="goToTimeline"
    @keydown="onKeydown"
  >
    <!-- Декоративные слои -->
    <div class="hero__grid" aria-hidden="true"></div>
    <div class="hero__glow hero__glow--teal" aria-hidden="true"></div>
    <div class="hero__glow hero__glow--amber" aria-hidden="true"></div>

    <div class="hero__content">
      <!-- Левая колонка: текст + CTA -->
      <div class="hero__left">
        <div class="eyebrow">
          <span class="eyebrow__dot" aria-hidden="true"></span>
          <span class="eyebrow__text">Спецпроект</span>
          <span class="eyebrow__divider" aria-hidden="true"></span>
          <span class="eyebrow__meta">Эко Оператор · 2026</span>
        </div>

        <h2 class="title">
          Сколько живёт<br />
          ваш&nbsp;мусор?
        </h2>

        <p class="lede">
          Интерактивный таймлайн разложения 24 категорий отходов&nbsp;-
          от трёх месяцев до миллиона лет.
        </p>

        <div class="cta-row">
          <span class="cta">
            <span class="cta__label">Открыть таймлайн</span>
            <span class="cta__arrow" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </span>
          </span>
          <div class="ministats">
            <span><b>24</b> категории</span>
            <span class="dotsep" aria-hidden="true">·</span>
            <span><b>4</b> фактора разложения</span>
          </div>
        </div>
      </div>

      <!-- Правая колонка: гигантская цифра -->
      <div class="hero__right">
        <div class="bignum">
          <div class="bignum__top">столько живёт</div>
          <div class="bignum__value" aria-label="1 000 000">
            <span class="bignum__digits">{{ counterDisplay }}</span>
          </div>
          <div class="bignum__unit">
            <span class="bignum__unit-text">лет</span>
            <span class="bignum__unit-line" aria-hidden="true"></span>
          </div>
          <div class="bignum__caption">
            обычная стеклянная бутылка<br />на свалке
          </div>
        </div>
      </div>
    </div>

    <!-- Timeline-bar внизу -->
    <div class="timeline" aria-hidden="true">
      <div class="timeline__track">
        <div class="timeline__fill"></div>
        <div
          v-for="(p, i) in timelinePoints"
          :key="i"
          class="timeline__dot"
          :class="{ 'timeline__dot--end': i === timelinePoints.length - 1 }"
          :style="{ left: (p.pos * 100) + '%' }"
        ></div>
      </div>
      <div class="timeline__labels">
        <span class="timeline__label timeline__label--start">3 месяца</span>
        <span class="timeline__label timeline__label--mid">100 лет</span>
        <span class="timeline__label timeline__label--end">1 000 000 лет</span>
      </div>
    </div>
  </article>
</template>

<style scoped>
.hero {
  position: relative;
  display: block;
  width: 100%;
  min-height: 400px;
  padding: 48px 56px 28px;
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  isolation: isolate;
  color: #0c1713;
  background:
    radial-gradient(120% 80% at 0% 0%, rgba(13, 148, 136, 0.10) 0%, transparent 55%),
    radial-gradient(90% 70% at 100% 100%, rgba(245, 158, 11, 0.10) 0%, transparent 60%),
    linear-gradient(135deg, #ecfdf5 0%, #ffffff 50%, #fffbeb 100%);
  border: 1px solid #a7f3d0;
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.8) inset,
    0 30px 60px -30px rgba(13, 148, 136, 0.18),
    0 10px 30px -10px rgba(15, 23, 42, 0.08);
  transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1),
              box-shadow 0.3s cubic-bezier(0.2, 0.8, 0.2, 1),
              border-color 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.hero:hover,
.hero:focus-visible {
  transform: translateY(-2px);
  border-color: #6ee7b7;
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.9) inset,
    0 40px 80px -30px rgba(13, 148, 136, 0.30),
    0 14px 36px -10px rgba(15, 23, 42, 0.12);
}

.hero:focus-visible {
  outline: 2px solid #0d9488;
  outline-offset: 3px;
}

/* --- Декор --- */
.hero__grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(13, 148, 136, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(13, 148, 136, 0.06) 1px, transparent 1px);
  background-size: 56px 56px;
  mask-image: radial-gradient(ellipse at 70% 40%, #000 30%, transparent 75%);
  pointer-events: none;
  z-index: 0;
}

.hero__glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
  z-index: 0;
}
.hero__glow--teal {
  width: 520px;
  height: 520px;
  right: -120px;
  top: -160px;
  background: radial-gradient(circle, rgba(13, 148, 136, 0.22) 0%, transparent 70%);
}
.hero__glow--amber {
  width: 260px;
  height: 260px;
  left: -80px;
  bottom: -100px;
  background: radial-gradient(circle, rgba(245, 158, 11, 0.18) 0%, transparent 70%);
}

/* --- Контент --- */
.hero__content {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
  gap: 40px;
  align-items: start;
}

.hero__left {
  display: flex;
  flex-direction: column;
  gap: 22px;
  padding-top: 4px;
}

/* Eyebrow */
.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #115e59;
}
.eyebrow__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ef4444;
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.18);
  animation: pulse 2.4s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.18); }
  50% { box-shadow: 0 0 0 7px rgba(239, 68, 68, 0.05); }
}
.eyebrow__divider {
  width: 1px;
  height: 12px;
  background: rgba(13, 148, 136, 0.32);
}
.eyebrow__meta {
  color: #566560;
  letter-spacing: 0.14em;
  font-weight: 600;
}

/* Title */
.title {
  font-family: 'Inter', sans-serif;
  font-weight: 800;
  font-size: clamp(40px, 4.4vw, 60px);
  line-height: 1.02;
  letter-spacing: -0.025em;
  color: #0c1713;
  margin: 0;
  text-wrap: balance;
}

/* Lede */
.lede {
  font-family: 'Inter', sans-serif;
  font-size: 17px;
  line-height: 1.55;
  color: #2b3a34;
  max-width: 460px;
  margin: 0;
  text-wrap: pretty;
}

/* CTA */
.cta-row {
  display: flex;
  align-items: center;
  gap: 22px;
  flex-wrap: wrap;
  margin-top: 6px;
}
.cta {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 22px 14px 24px;
  background: linear-gradient(135deg, #10b981 0%, #0d9488 100%);
  color: #ffffff;
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 15px;
  letter-spacing: 0.01em;
  border-radius: 999px;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.4) inset,
    0 12px 30px -8px rgba(16, 185, 129, 0.45);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.hero:hover .cta {
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.5) inset,
    0 16px 36px -8px rgba(16, 185, 129, 0.6);
}
.cta__arrow {
  display: inline-flex;
  transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.hero:hover .cta__arrow {
  transform: translateX(5px);
}

.ministats {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  color: #566560;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  letter-spacing: 0.02em;
}
.ministats b {
  color: #d97706;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}
.dotsep { color: rgba(13, 148, 136, 0.4); }

/* --- Big number --- */
.hero__right {
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  position: relative;
}
.bignum {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  position: relative;
  padding: 14px 0 10px 28px;
  border-left: 1px solid rgba(13, 148, 136, 0.22);
}
.bignum__top {
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #115e59;
  margin-bottom: 6px;
}
.bignum__value {
  font-family: 'Playfair Display', 'Inter', serif;
  font-weight: 900;
  font-size: clamp(72px, 9vw, 132px);
  line-height: 0.92;
  letter-spacing: -0.04em;
  background: linear-gradient(135deg, #0d9488 0%, #f59e0b 60%, #ef4444 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.bignum__digits {
  display: inline-block;
}
.bignum__unit {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 4px;
}
.bignum__unit-text {
  font-family: 'Inter', sans-serif;
  font-weight: 800;
  font-size: 28px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #d97706;
}
.bignum__unit-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, rgba(217, 119, 6, 0.5), transparent);
  min-width: 60px;
}
.bignum__caption {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  line-height: 1.5;
  color: #566560;
  margin-top: 14px;
  max-width: 240px;
}

/* --- Timeline --- */
.timeline {
  position: relative;
  z-index: 1;
  margin-top: 32px;
  padding-top: 18px;
  border-top: 1px solid rgba(13, 148, 136, 0.18);
}
.timeline__track {
  position: relative;
  height: 16px;
}
.timeline__fill {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 3px;
  background: linear-gradient(
    90deg,
    #10b981 0%,
    #f59e0b 55%,
    #ef4444 100%
  );
  border-radius: 3px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05);
}
.timeline__dot {
  position: absolute;
  top: 50%;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ffffff;
  border: 2px solid #0d9488;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.10);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.timeline__dot--end {
  width: 12px;
  height: 12px;
  background: #ef4444;
  border-color: #dc2626;
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.20);
}
.hero:hover .timeline__dot {
  transform: translate(-50%, -50%) scale(1.3);
}
.timeline__labels {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #566560;
  font-weight: 600;
}
.timeline__label--start { color: #10b981; }
.timeline__label--mid {
  color: #d97706;
}
.timeline__label--end {
  color: #dc2626;
  font-weight: 700;
}

/* --- Mobile --- */
@media (max-width: 800px) {
  .hero {
    min-height: 320px;
    padding: 28px 22px 22px;
    border-radius: 16px;
  }
  .hero__content {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  .hero__left {
    gap: 16px;
  }
  .title {
    font-size: 36px;
  }
  .lede {
    font-size: 15px;
  }
  .bignum {
    border-left: none;
    border-top: 1px solid rgba(13, 148, 136, 0.22);
    padding: 18px 0 0 0;
  }
  .bignum__value {
    font-size: 72px;
  }
  .bignum__unit-text { font-size: 22px; }
  .timeline { margin-top: 22px; }
  .timeline__label--mid { display: none; }
}

@media (prefers-reduced-motion: reduce) {
  .hero, .cta, .cta__arrow, .timeline__dot { transition: none; }
  .eyebrow__dot { animation: none; }
}
</style>
