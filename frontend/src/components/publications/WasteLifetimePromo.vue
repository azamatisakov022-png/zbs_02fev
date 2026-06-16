<script setup lang="ts">
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

// Рейтинг по сроку разложения; width - длина бара в % (логарифмическая шкала)
const rows = [
  { idx: '01', name: 'Газета', value: '1,5 мес', width: 6 },
  { idx: '02', name: 'Окурок', value: '10 лет', width: 28 },
  { idx: '03', name: 'Жестяная банка', value: '50 лет', width: 38 },
  { idx: '04', name: 'Пластиковый пакет', value: '300 лет', width: 49 },
  { idx: '05', name: 'Пластиковая бутылка', value: '450 лет', width: 54 },
  { idx: '06', name: 'Стекло', value: '1 000 000', width: 100, feat: true },
]
</script>

<template>
  <article
    role="button"
    tabindex="0"
    aria-label="Открыть спецпроект: Сколько живёт ваш мусор"
    class="promo-card group relative overflow-hidden rounded-[24px] lg:rounded-[26px] px-6 py-8 md:px-10 md:py-9 lg:px-11 cursor-pointer text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2D8B4E] focus-visible:outline-offset-2"
    @click="goToTimeline"
    @keydown="onKeydown"
  >
    <!-- мягкое свечение в углу -->
    <div class="promo-glow" aria-hidden="true"></div>

    <!-- Шапка блока -->
    <div class="relative z-[1] flex flex-wrap items-end justify-between gap-5 mb-7">
      <div>
        <div class="text-[12px] font-bold tracking-[0.18em] text-[#c8f5dd] mb-3">
          СПЕЦПРОЕКТ · ЭКО ОПЕРАТОР
        </div>
        <h3 class="text-2xl md:text-3xl lg:text-[32px] lg:leading-[1.1] font-extrabold tracking-[-0.02em] m-0">
          Сколько живёт ваш мусор?
        </h3>
        <p class="text-white/70 text-sm mt-2.5 max-w-[44ch] leading-[1.55]">
          Рейтинг 24 категорий отходов по сроку разложения - от недель до сотен тысяч лет.
        </p>
      </div>
      <span
        class="promo-cta inline-flex items-center gap-2.5 bg-white group-hover:bg-[#eef6f0] text-[#0f5e40] px-5 py-3 rounded-[12px] font-bold text-sm uppercase tracking-[0.03em] whitespace-nowrap transition-colors"
      >
        Открыть таймлайн
        <svg class="w-4 h-4 transition-transform duration-300 promo-arrow" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </span>
    </div>

    <!-- Рейтинг -->
    <div class="relative z-[1]">
      <div
        v-for="row in rows"
        :key="row.idx"
        class="grid grid-cols-[34px_1fr_104px] lg:grid-cols-[40px_1fr_124px] items-center gap-3 lg:gap-[18px] py-3 border-t border-white/10 last:border-b"
      >
        <span
          class="text-sm font-bold tabular-nums"
          :class="row.feat ? 'text-[#f2d486]' : 'text-white/40'"
        >{{ row.idx }}</span>
        <div>
          <div class="text-[14px] lg:text-[15px] font-semibold" :class="row.feat ? 'text-[#f2d486]' : 'text-white'">
            {{ row.name }}
          </div>
          <div class="h-[7px] rounded-[7px] bg-white/10 mt-2.5 overflow-hidden">
            <div
              class="h-full rounded-[7px]"
              :class="row.feat ? 'promo-bar-feat' : 'promo-bar'"
              :style="{ width: row.width + '%' }"
            ></div>
          </div>
        </div>
        <span
          class="text-right text-[15px] lg:text-[17px] font-extrabold tabular-nums"
          :class="row.feat ? 'text-[#f2d486]' : 'text-white'"
        >{{ row.value }}</span>
      </div>
    </div>
  </article>
</template>

<style scoped>
.promo-card {
  background: linear-gradient(135deg, #0d9488 0%, #10b981 100%);
}
.promo-glow {
  position: absolute;
  right: -120px;
  top: -120px;
  width: 360px;
  height: 360px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(127, 214, 163, 0.22), transparent 70%);
  pointer-events: none;
}
.promo-bar {
  background: linear-gradient(90deg, #bdebd0, #6fc995);
}
.promo-bar-feat {
  background: linear-gradient(90deg, #f0d28a, #d9a441);
}
.promo-card:hover .promo-arrow,
.promo-card:focus-visible .promo-arrow {
  transform: translateX(4px);
}

/* Мягкое пульсирующее свечение кнопки -привлекает внимание без резкого мигания */
.promo-cta {
  animation: promo-cta-glow 2.6s ease-in-out infinite;
}
@keyframes promo-cta-glow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(127, 214, 163, 0); }
  50% { box-shadow: 0 0 20px 2px rgba(127, 214, 163, 0.55); }
}
/* На наведении свечение выключаем, чтобы не конфликтовало с hover-цветом */
.promo-card:hover .promo-cta {
  animation: none;
}

@media (prefers-reduced-motion: reduce) {
  .promo-arrow { transition: none; }
  .promo-cta { animation: none; }
}
</style>
