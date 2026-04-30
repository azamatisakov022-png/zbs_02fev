# «Сколько живёт ваш мусор?» — редизайн (бриф для Claude Design)

**Цель:** перерисовать промо-баннер на странице `/publications` и саму страницу `/publications/waste-lifetime`. Текущий визуал перегружен emoji-иконками и палитрой, которая выбивается из остального портала.

---

## Контекст

**Система:** АИС «Эко Оператор» при МПРЭТН Кыргызской Республики — государственный портал по обращению с отходами.

**Раздел «Сколько живёт ваш мусор?»** — образовательный спецпроект внутри раздела «Публикации». Интерактивный таймлайн на 21 категорию отходов: показывает сколько лет природа разлагает каждый материал, какие факторы влияют, какой вред наносится экологии Кыргызстана.

**Где живёт:**
- **Промо-баннер** `WasteLifetimePromo.vue` — постоянно висит сверху ленты `/publications` как «спецпроект».
- **Сама страница** `WasteLifetime.vue` — открывается по клику с баннера. URL `/publications/waste-lifetime`.

---

## Что не так с текущим дизайном (честно)

1. **Emoji повсюду** — нарушение глобального правила портала «иконки только линейные SVG, никаких emoji»:
   - 21 emoji в карточках отходов (📄🪵👕👟🧃🪑🛢️🥫🔩♻️🏗️🧊📺💻🖨️📱🛞🔋🪫💡🫙)
   - 4 emoji в карточках факторов (☀️💨💧🦠)
   - 5 emoji в фильтрах (🔄🌱🌿🔥☠️)
   - emoji в подписях факторов разложения внутри карточек (💧🦠☀️💨🔬)
   - emoji-маркеры разделов (📋⚠️🔬🔴💡)
   - В сумме страница похожа на детскую инфографику, а не на материал гос-портала.

2. **Палитра выбивается из портала.** Глобальный бренд АИС — teal/emerald `#0d9488 → #10b981`. Эта же страница активно использует оранжевый `#fea629`, красный `#C1121F`, тёмно-зелёный `#2D8B4E` как primary-цвета (фильтры, hover, акценты). Получается, страница живёт в своей вселенной.

3. **Визуальный хаос.** На одной странице:
   - 4 разных градиента (hero, harm-low, harm-medium, harm-high, highlight, CTA)
   - Подсветка hover оранжевая, активная категория оранжевая, года в карточках — красные/зелёные/оранжевые в зависимости от уровня
   - Ощущение «дашборда инфографики», а не редакционной long-read статьи.

4. **Промо-баннер на ленте** — мятно-жёлтый градиент с многоцветным `webkit-background-clip: text` на словах «ваш мусор?» (зелёный→оранжевый→красный). Привлекает внимание, но выглядит как реклама. Хочется спокойнее, в духе magazine-feature.

---

## Что хочется получить

### Общие принципы
- **Magazine-editorial** стиль (как у The Verge, NYT Climate, Stripe Press), а не «infographic dashboard».
- **Линейные SVG-иконки** вместо всех emoji. Один минимальный набор stroke-иконок (24×24, stroke-width 1.5–1.8).
- **Палитра портала** — `#0d9488` (brand), `#10b981` (accent), нейтральные слейты. Acid-цвета (оранжевый/красный) — только для семантики «уровень опасности», никаких UI-акцентов.
- **Типографика** — `Inter` для UI, `Playfair Display` для редакционных заголовков (этот шрифт уже подключён глобально).
- **Цветной градиент-таймлайн** (зелёный → жёлтый → красный) **оставить** — он семантически оправдан: показывает шкалу «безвреден → катастрофичен». Это единственное место, где цветовой спектр имеет смысл.
- **Никаких decorative emoji** ни в данных, ни в UI.

### Промо-баннер
- Спокойнее. Без многоцветного gradient-text на «ваш мусор?».
- Можно: фото-текстура (земля, пластик в природе) + текст; или строгий двухколоночный split с большим типографическим заголовком.
- CTA кнопка остаётся, но в брендовом teal `#0d9488`.

### Страница `/publications/waste-lifetime`
- **Hero**: заголовок serif (Playfair Display), подзаголовок sans, без рейнбоу-градиента. Hero-картинка опциональна (фото свалки/природы Тянь-Шаня).
- **Stats row** (24 / 1 000 000 / 400 л) — оставить, но в нейтральной типографике, цифры цвета `#0d9488`. Без оранжевых/красных подсветок.
- **4 фактора** — заменить ☀️💨💧🦠 на линейные SVG (солнце-stroke, ветер, капля, бактерия). Карточки белые с бордером, без оранжевого hover.
- **Timeline gradient bar** — оставить как есть (он несёт смысл).
- **Фильтры** — pills без emoji. Active state — teal-фон, не оранжевый.
- **Карточки отходов**:
  - Эмодзи-материал заменить на иконку категории (мини-SVG в круглой/квадратной плашке).
  - Бейдж группы (Гр. 22, 19) — ОК как есть, но цвет нейтральный slate.
  - Inline-таймлайн в строке — оставить (полезно).
  - В развёрнутом виде: `📋 Описание / ⚠️ Опасность / 🔬 Факторы / 🔴 Вред / 💡 Highlight` — заменить emoji на маленькие линейные иконки или вообще убрать (просто типографические подзаголовки uppercase).
  - Tag'и факторов разложения — без emoji в начале строки. Цвет тэга (зелёный/красный/нейтральный) уже несёт информацию.
- **CTA «500 лет → 5 мин»** — оставить, но тоже в брендовом teal вместо `#10b981` mint.
- **Footer** — упростить.

### Что оставить без изменений
- Всю **бизнес-логику** и **данные** (21 категория отходов, фильтры по диапазону лет, expand/collapse, animated counters).
- **Структуру разделов** (hero → stats → 4 фактора → timeline-gradient → filters → cards → CTA → footer).
- Анимации появления карточек (fade-up).

---

## Технический контекст

- **Стек:** Vue 3 + TypeScript, scoped CSS, Composition API.
- **Шрифты подключены глобально:** `Inter` (sans), `Playfair Display` (serif), `JetBrains Mono` (mono). Не подключайте `Onest` через `@import` — текущая страница его тащит, это лишний запрос.
- **Палитра портала** (см. `palette.css` ниже): `--pub-brand: #0d9488`, `--pub-brand-700: #0f766e`, `--pub-bg: #fafaf7`, `--pub-ink: #0f172a`, `--pub-line: #e2e8f0`.
- **Иконки:** stroke-icons типа Lucide / Feather. Можно прямо инлайн в SFC.

---

## Файлы (исходники)

### 1. `frontend/src/components/publications/palette.css` — токены

```css
/* Палитра модуля «Публикации». Подключается через
   `import './palette.css'` в скрипте PublicationsView и оборачивается
   в `.pubs-page` чтобы не утекать на остальной портал. */

.pubs-page {
  /* Brand */
  --pub-brand: #0d9488;        /* teal-600 */
  --pub-brand-700: #0f766e;    /* teal-700 */
  --pub-brand-100: #99f6e4;
  --pub-brand-050: #ecfdf5;

  /* Surfaces */
  --pub-bg: #fafaf7;           /* off-white page background */
  --pub-bg-2: #f1f5f4;         /* secondary surface */
  --pub-card: #ffffff;
  --pub-line: #e2e8f0;

  /* Ink (text) */
  --pub-ink: #0f172a;          /* primary text */
  --pub-ink-2: #334155;        /* secondary */
  --pub-ink-3: #64748b;        /* tertiary / meta */
  --pub-ink-4: #94a3b8;        /* faint / dividers */

  /* Category dots (only as 8px markers, NOT page accents) */
  --cat-news: #10b981;
  --cat-contest: #f59e0b;
  --cat-report: #0d9488;
  --cat-press: #475569;
}

/* Subtle fade-up that respects user preferences */
.fade-up {
  animation: pub-fade-up 0.45s cubic-bezier(0.2, 0.8, 0.2, 1) both;
}
@keyframes pub-fade-up {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
@media (prefers-reduced-motion: reduce) {
  .fade-up { animation: none; }
}

.serif {
  font-family: 'Playfair Display', Georgia, serif;
}
```

---

### 2. `frontend/src/components/publications/WasteLifetimePromo.vue` — баннер на ленте

```vue
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
```

---

### 3. `frontend/src/views/publications/WasteLifetime.vue` — страница (трим)

> ⚠️ Для краткости показаны 4 примера из массива `wasteItems` вместо всех 21. Остальные элементы имеют **ту же структуру** и редизайнить их не нужно — Claude Design просто получает общий шаблон карточки. Поля `emoji` в данных можно либо оставить (не рендерить), либо переименовать в `iconKey` под новые SVG.

```vue
<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'

/* ───────── Types ───────── */
interface WasteItem {
  id: number
  emoji: string                    // ← в редизайне заменить на iconKey: string
  groups: string                   // 'Гр. 22, 19'
  name: string
  yearsMin: number
  yearsMax: number
  dangerLevel: 1 | 2 | 3 | 4 | 5
  description: string
  factors: { label: string; type: 'accelerate' | 'slow' | 'neutral' }[]
  harmLevel: 'low' | 'medium' | 'high'
  harmText: string
  highlight?: string
}

type FilterKey = 'all' | 'under15' | 'y15_100' | 'y100_500' | 'over500'

/* ───────── Data (4 примера из 21 — структура одинакова) ───────── */
const wasteItems: WasteItem[] = [
  {
    id: 1, emoji: '📄', groups: 'Гр. 22, 19', name: 'Бумажные изделия',
    yearsMin: 0.08, yearsMax: 2, dangerLevel: 1,
    description: 'Газеты, офисная бумага, картон. Самый безопасный вид отходов — быстро разлагается во влажной среде благодаря целлюлозной структуре.',
    factors: [
      { label: '💧 Влажность — ускоряет', type: 'accelerate' },
      { label: '🦠 Микроорганизмы — главный фактор', type: 'accelerate' },
      { label: '☀️ УФ — ускоряет выцветание', type: 'accelerate' },
      { label: '💨 Без O₂ — замедляет в 5 раз', type: 'slow' },
    ],
    harmLevel: 'low',
    harmText: 'Минимальный вред. При гниении выделяет метан, но объёмы незначительны.',
  },
  {
    id: 10, emoji: '♻️', groups: 'Гр. 14, 19', name: 'Пластик',
    yearsMin: 100, yearsMax: 500, dangerLevel: 4,
    description: 'ПЭТ-бутылки, пакеты, плёнка, контейнеры. Не разлагается, а распадается на микропластик.',
    factors: [
      { label: '☀️ УФ — крошит на микропластик', type: 'accelerate' },
      { label: '🦠 Микроорганизмы — бессильны', type: 'slow' },
      { label: '💨 Без O₂ — почти вечен', type: 'slow' },
    ],
    harmLevel: 'high',
    harmText: 'Микропластик найден в крови человека, в плаценте, в снегах Тянь-Шаня и воде Иссык-Куля.',
    highlight: 'Человек съедает 5 граммов микропластика в неделю — это одна банковская карта.',
  },
  {
    id: 19, emoji: '🪫', groups: 'Гр. 13', name: 'Батарейки',
    yearsMin: 100, yearsMax: 500, dangerLevel: 5,
    description: 'Корпус разрушается за 5–10 лет, но содержимое отравляет столетиями.',
    factors: [
      { label: '💧 Вода — вымывает тяжёлые металлы', type: 'accelerate' },
      { label: '🔬 Ртуть и кадмий — не разлагаются', type: 'slow' },
    ],
    harmLevel: 'high',
    harmText: 'Одна «таблетка» с ртутью загрязняет 400 литров воды.',
    highlight: '1 батарейка отравляет 400 литров чистой воды.',
  },
  {
    id: 21, emoji: '🫙', groups: 'Гр. 20', name: 'Стекло',
    yearsMin: 1000, yearsMax: 1000000, dangerLevel: 3,
    description: 'Бутылки, банки, оконное стекло. Химически инертно. Практически вечный материал.',
    factors: [
      { label: '🔬 Химическая инертность — вечно', type: 'slow' },
      { label: '🦠 Микроорганизмы — бессильны', type: 'slow' },
    ],
    harmLevel: 'medium',
    harmText: 'Само по себе безопасно, но осколки ранят животных и людей.',
    highlight: 'Бутылка времён Великого Шёлкового пути лежала бы на земле до сих пор.',
  },
]

const sortedItems = [...wasteItems].sort((a, b) => a.yearsMin - b.yearsMin)

/* ───────── Filters ───────── */
const filters: { key: FilterKey; label: string; emoji: string }[] = [
  { key: 'all', label: 'Все', emoji: '🔄' },
  { key: 'under15', label: 'До 15 лет', emoji: '🌱' },
  { key: 'y15_100', label: '15 – 100', emoji: '🌿' },
  { key: 'y100_500', label: '100 – 500', emoji: '🔥' },
  { key: 'over500', label: '500+', emoji: '☠️' },
]
// ↑ В редизайне заменить emoji на SVG-иконки (или вовсе убрать)

function getFilterForItem(item: WasteItem): FilterKey {
  if (item.yearsMax <= 15) return 'under15'
  if (item.yearsMax > 15 && item.yearsMax <= 100) return 'y15_100'
  if (item.yearsMax > 100 && item.yearsMax <= 500) return 'y100_500'
  return 'over500'
}

const activeFilter = ref<FilterKey>('all')
const filteredData = computed(() =>
  activeFilter.value === 'all'
    ? sortedItems
    : sortedItems.filter(item => getFilterForItem(item) === activeFilter.value),
)

/* ───────── Card expand/collapse ───────── */
const expandedId = ref<number | null>(null)
const toggleCard = (id: number) => {
  expandedId.value = expandedId.value === id ? null : id
}

/* ───────── Factor cards (4 фактора) ───────── */
const factorExpanded = ref<number | null>(null)
const toggleFactor = (idx: number) => {
  factorExpanded.value = factorExpanded.value === idx ? null : idx
}
const factorCards = [
  {
    emoji: '☀️', title: 'УФ-излучение',
    summary: 'На поверхности в 5–10 раз быстрее, чем на глубине свалки',
    detail: 'В высокогорном Кыргызстане УФ-излучение на 30–50% выше равнины.',
  },
  {
    emoji: '💨', title: 'Кислород',
    summary: 'Без O₂ на глубине разложение почти останавливается',
    detail: 'Анаэробное гниение выделяет метан — газ в 25 раз мощнее CO₂.',
  },
  {
    emoji: '💧', title: 'Влажность',
    summary: 'Катализатор коррозии и среда для микроорганизмов',
    detail: 'В засушливых регионах гниение замедляется в 3–5 раз.',
  },
  {
    emoji: '🦠', title: 'Микроорганизмы',
    summary: 'Не умеют разлагать синтетику и стекло',
    detail: 'Природа за 4 млрд лет не изобрела фермент для пластика.',
  },
]
// ↑ В редизайне заменить emoji на SVG (Lucide-style stroke иконки)

/* ───────── Animated counters ───────── */
const counter1 = ref(0)
const counter2 = ref(0)
const counter3 = ref(0)
const statsVisible = ref(false)

function animateCounter(target: number, setter: (v: number) => void, duration = 2000) {
  const start = performance.now()
  function tick(now: number) {
    const p = Math.min((now - start) / duration, 1)
    const eased = 1 - Math.pow(1 - p, 3)
    setter(Math.round(eased * target))
    if (p < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

onMounted(() => {
  nextTick(() => {
    const el = document.querySelector('.wl-stats')
    if (!el) return
    new IntersectionObserver(([e], obs) => {
      if (e.isIntersecting && !statsVisible.value) {
        statsVisible.value = true
        animateCounter(24, v => counter1.value = v, 1200)
        animateCounter(1000000, v => counter2.value = v, 2500)
        animateCounter(400, v => counter3.value = v, 1800)
        obs.disconnect()
      }
    }, { threshold: 0.3 }).observe(el)
  })
})

/* ───────── Helpers ───────── */
function formatYears(min: number, max: number): string {
  const fmt = (n: number) => {
    if (n < 1) return `${Math.round(n * 12)} мес`
    if (n >= 1_000_000) return '1 000 000 лет'
    return `${n.toLocaleString('ru-RU')} ${n === 1 ? 'год' : n < 5 ? 'года' : 'лет'}`
  }
  return min === max ? fmt(min) : `${fmt(min)} — ${fmt(max)}`
}

function formatNumber(n: number): string {
  return n.toLocaleString('ru-RU')
}

function logProgress(yearsMax: number): number {
  if (yearsMax <= 0) return 0
  return Math.min((Math.log10(yearsMax) / 6) * 100, 100)
}

function getDangerColor(level: number): string {
  return ({ 1:'#2D8B4E', 2:'#52B788', 3:'#F4A261', 4:'#E76F51', 5:'#C1121F' } as const)[level as 1] ?? '#64748b'
}
function getHarmTextColor(level: string): string {
  return level === 'high' ? '#991b1b' : level === 'medium' ? '#9a3412' : '#166534'
}
function getYearsColor(d: number): string {
  return d <= 2 ? '#2D8B4E' : d === 3 ? '#E76F51' : '#C1121F'
}
function getFactorIcon(type: string): string {
  return type === 'accelerate' ? '⚡' : type === 'slow' ? '🐢' : '🔬'
  // ↑ В редизайне — заменить на SVG (стрелка-вверх / черепаха-замедление / нейтральная точка)
}
</script>

<template>
  <div class="wl">
    <!-- ═══════ HERO ═══════ -->
    <section class="wl-hero">
      <div class="wl-container">
        <div class="wl-hero-badge">🌿 Эко Оператор · Публикации</div>
        <h1 class="wl-hero-title">
          Сколько живёт ваш <span class="wl-hero-accent">мусор</span>?
        </h1>
        <p class="wl-hero-sub">
          Каждый товар однажды становится отходом. Узнайте, сколько столетий нужно природе —
          и какой вред это наносит экологии Кыргызстана.
        </p>
      </div>
    </section>

    <!-- ═══════ STATS ═══════ -->
    <section class="wl-stats">
      <div class="wl-container wl-stats-row">
        <div class="wl-stat">
          <span class="wl-stat-num" style="color: #fea629">{{ formatNumber(counter1) }}</span>
          <span class="wl-stat-label">категории отходов</span>
        </div>
        <div class="wl-stat">
          <span class="wl-stat-num" style="color: #E76F51">{{ formatNumber(counter2) }}</span>
          <span class="wl-stat-label">лет — стекло</span>
        </div>
        <div class="wl-stat">
          <span class="wl-stat-num" style="color: #C1121F">{{ formatNumber(counter3) }} л</span>
          <span class="wl-stat-label">воды отравит 1 батарейка</span>
        </div>
      </div>
    </section>

    <!-- ═══════ 4 FACTORS ═══════ -->
    <section class="wl-container wl-factors-section">
      <h2 class="wl-section-title">Что влияет на скорость разложения?</h2>
      <div class="wl-factors-grid">
        <div
          v-for="(f, idx) in factorCards" :key="idx"
          class="wl-factor-card"
          :class="{ 'wl-factor-open': factorExpanded === idx }"
          @click="toggleFactor(idx)"
        >
          <span class="wl-factor-emoji">{{ f.emoji }}</span>
          <h3 class="wl-factor-title">{{ f.title }}</h3>
          <p class="wl-factor-summary">{{ f.summary }}</p>
          <div v-if="factorExpanded === idx" class="wl-factor-detail">
            <p>{{ f.detail }}</p>
          </div>
          <span class="wl-factor-toggle">
            {{ factorExpanded === idx ? 'Скрыть ▴' : 'Подробнее ▾' }}
          </span>
        </div>
      </div>
    </section>

    <!-- ═══════ TIMELINE ═══════ -->
    <section class="wl-container wl-timeline-section">
      <div class="wl-timeline-bar"></div>
      <div class="wl-timeline-labels">
        <span>3 мес</span>
        <span>10 лет</span>
        <span>100 лет</span>
        <span>1 000 лет</span>
        <span>1 000 000 лет</span>
      </div>
    </section>

    <!-- ═══════ FILTERS ═══════ -->
    <section class="wl-container wl-filters">
      <button
        v-for="f in filters" :key="f.key"
        class="wl-filter-pill"
        :class="{ 'wl-filter-active': activeFilter === f.key }"
        @click="activeFilter = f.key"
      >
        <span class="wl-filter-emoji">{{ f.emoji }}</span> {{ f.label }}
      </button>
    </section>

    <!-- ═══════ CARDS GRID ═══════ -->
    <section class="wl-container wl-cards-section">
      <div class="wl-cards-grid">
        <div
          v-for="item in filteredData" :key="item.id"
          class="wl-card"
          :class="{ 'wl-card-open': expandedId === item.id }"
        >
          <!-- Collapsed header row -->
          <div class="wl-card-header" @click="toggleCard(item.id)">
            <span class="wl-card-emoji">{{ item.emoji }}</span>
            <span class="wl-card-badge">{{ item.groups }}</span>
            <h3 class="wl-card-name">{{ item.name }}</h3>
            <div class="wl-card-bar-inline">
              <div
                class="wl-card-bar-fill"
                :style="{ width: logProgress(item.yearsMax) + '%', background: getDangerColor(item.dangerLevel) }"
              ></div>
            </div>
            <span class="wl-card-years" :style="{ color: getYearsColor(item.dangerLevel) }">
              {{ formatYears(item.yearsMin, item.yearsMax) }}
            </span>
            <span class="wl-card-arrow" :class="{ 'wl-arrow-up': expandedId === item.id }">▼</span>
          </div>

          <!-- Expanded body -->
          <div v-if="expandedId === item.id" class="wl-card-body">
            <div class="wl-card-desc-section">
              <span class="wl-card-label">📋 Описание</span>
              <p class="wl-card-desc">{{ item.description }}</p>
            </div>

            <div class="wl-card-columns">
              <div class="wl-card-col-danger">
                <span class="wl-card-label">⚠️ Уровень опасности</span>
                <div class="wl-danger-bars">
                  <div
                    v-for="d in 5" :key="d"
                    class="wl-danger-seg"
                    :style="{ background: d <= item.dangerLevel ? getDangerColor(item.dangerLevel) : '#e2e8f0' }"
                  ></div>
                </div>
                <span class="wl-danger-text" :style="{ color: getDangerColor(item.dangerLevel) }">
                  {{ item.dangerLevel }}/5
                </span>
              </div>
              <div class="wl-card-col-factors">
                <span class="wl-card-label">🔬 Факторы разложения</span>
                <div class="wl-factor-tags">
                  <span
                    v-for="(fct, fi) in item.factors" :key="fi"
                    class="wl-factor-tag"
                    :class="{
                      'wl-tag-accel': fct.type === 'accelerate',
                      'wl-tag-slow': fct.type === 'slow',
                      'wl-tag-neutral': fct.type === 'neutral',
                    }"
                  >
                    {{ getFactorIcon(fct.type) }} {{ fct.label }}
                  </span>
                </div>
              </div>
            </div>

            <div class="wl-card-harm" :class="'wl-harm-' + item.harmLevel">
              <span class="wl-card-label" :style="{ color: getHarmTextColor(item.harmLevel) }">
                🔴 Вред для экологии
              </span>
              <p :style="{ color: getHarmTextColor(item.harmLevel) }">{{ item.harmText }}</p>
            </div>

            <div v-if="item.highlight" class="wl-card-highlight">
              <span class="wl-highlight-icon">💡</span>
              <p>{{ item.highlight }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════ CTA ═══════ -->
    <section class="wl-container wl-cta-section">
      <div class="wl-cta">
        <h2 class="wl-cta-title">Утилизационный сбор — это не налог</h2>
        <p class="wl-cta-text">
          Это плата за время, которое мы воруем у природы.
          Наша задача — превратить 500 лет гниения в 5 минут переработки.
        </p>
        <div class="wl-cta-visual">
          <span class="wl-cta-old">500 лет</span>
          <span class="wl-cta-arrow">→</span>
          <span class="wl-cta-new">5 мин</span>
        </div>
      </div>
    </section>

    <!-- ═══════ FOOTER ═══════ -->
    <footer class="wl-footer">
      <p>&copy; 2025 ГП Эко Оператор &middot; Кыргызская Республика</p>
    </footer>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600;700;800;900&display=swap');
/* ↑ В редизайне УБРАТЬ — портал использует Inter / Playfair Display, они уже подключены */

.wl {
  font-family: 'Onest', system-ui, -apple-system, sans-serif;
  background: #FAFAF7;
  color: #1e293b;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}
.wl-container { max-width: 1140px; margin: 0 auto; padding: 0 24px; }

/* HERO */
.wl-hero {
  background: linear-gradient(135deg, #F0FAF4 0%, #FAFAF7 100%);
  border-bottom: 1px solid #e2e8f0;
  padding: 56px 0 48px;
  text-align: center;
}
.wl-hero-badge {
  display: inline-block;
  background: #fff;
  border: 1px solid #d1d9e0;
  border-radius: 24px;
  padding: 7px 20px;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 24px;
}
.wl-hero-title {
  font-weight: 900;
  font-size: clamp(28px, 5vw, 48px);
  color: #1e293b;
  line-height: 1.15;
  margin: 0 0 18px;
}
.wl-hero-accent {
  background: linear-gradient(90deg, #10b981, #f59e0b, #ef4444);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.wl-hero-sub {
  font-size: clamp(15px, 2vw, 18px);
  color: #475569;
  max-width: 660px;
  margin: 0 auto;
  line-height: 1.7;
}

/* STATS */
.wl-stats { padding: 40px 0; border-bottom: 1px solid #f0f0ec; }
.wl-stats-row { display: flex; justify-content: center; gap: 48px; flex-wrap: wrap; }
.wl-stat { text-align: center; }
.wl-stat-num {
  font-weight: 900;
  font-size: clamp(26px, 4vw, 40px);
  display: block;
  letter-spacing: -0.02em;
}
.wl-stat-label { font-size: 13px; color: #64748b; margin-top: 4px; display: block; font-weight: 500; }

/* FACTORS */
.wl-factors-section { padding: 48px 0 36px; }
.wl-section-title { font-size: clamp(18px, 2.5vw, 24px); font-weight: 800; color: #1e293b; margin-bottom: 20px; }
.wl-factors-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
.wl-factor-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 22px 18px 16px;
  cursor: pointer;
  transition: all 0.25s ease;
}
.wl-factor-card:hover { border-color: #fea629; box-shadow: 0 4px 16px rgba(254,166,41,0.12); }
.wl-factor-open    { border-color: #fea629; box-shadow: 0 4px 20px rgba(254,166,41,0.15); }
.wl-factor-emoji   { font-size: 32px; display: block; margin-bottom: 10px; }
.wl-factor-title   { font-size: 15px; font-weight: 700; margin: 0 0 6px; }
.wl-factor-summary { font-size: 13px; color: #64748b; line-height: 1.5; margin: 0 0 8px; }
.wl-factor-detail  { margin-top: 10px; padding-top: 10px; border-top: 1px solid #e2e8f0; }
.wl-factor-toggle  { font-size: 12px; font-weight: 600; color: #cb8521; margin-top: 6px; }

/* TIMELINE */
.wl-timeline-section { padding: 0 0 36px; }
.wl-timeline-bar {
  height: 36px;
  border-radius: 18px;
  background: linear-gradient(90deg, #2D8B4E 0%, #52B788 20%, #fea629 45%, #E76F51 70%, #C1121F 100%);
}
.wl-timeline-labels { display: flex; justify-content: space-between; margin-top: 8px; font-size: 11px; color: #64748b; font-weight: 600; }

/* FILTERS */
.wl-filters { display: flex; gap: 8px; padding: 0 0 28px; flex-wrap: wrap; }
.wl-filter-pill {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 8px 18px;
  border-radius: 24px;
  border: 1.5px solid #e2e8f0;
  background: #fff;
  font-size: 13px; font-weight: 600;
  color: #64748b; cursor: pointer;
  transition: all 0.2s ease;
}
.wl-filter-pill:hover  { border-color: #fea629; color: #cb8521; }
.wl-filter-active      { background: #fea629; color: #fff; border-color: #fea629; }

/* CARDS */
.wl-cards-grid { display: grid; grid-template-columns: 1fr; gap: 8px; }
.wl-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  overflow: hidden;
  transition: border-color 0.25s ease, box-shadow 0.25s ease;
  animation: wl-fadeSlideIn 0.35s ease both;
}
@keyframes wl-fadeSlideIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
.wl-card:hover { border-color: #cbd5e1; box-shadow: 0 2px 12px rgba(0,0,0,0.04); }
.wl-card-open  { border-color: #fea629; box-shadow: 0 4px 20px rgba(254,166,41,0.12); }

.wl-card-header {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 16px;
  cursor: pointer;
}
.wl-card-emoji  { font-size: 24px; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; background: #f8faf9; border-radius: 10px; }
.wl-card-badge  { font-size: 10px; font-weight: 700; color: #64748b; background: #f1f5f9; padding: 3px 8px; border-radius: 6px; }
.wl-card-name   { font-size: 14px; font-weight: 700; margin: 0; }
.wl-card-bar-inline { flex: 1; min-width: 40px; max-width: 140px; height: 5px; background: #f1f5f9; border-radius: 3px; }
.wl-card-bar-fill { height: 100%; border-radius: 3px; }
.wl-card-years  { font-weight: 800; font-size: 13px; }
.wl-card-arrow  { font-size: 12px; color: #94a3b8; transition: transform 0.25s ease; }
.wl-arrow-up    { transform: rotate(180deg); }

.wl-card-body { padding: 0 20px 20px; border-top: 1px solid #f1f5f9; }
.wl-card-label { display: block; font-size: 10px; text-transform: uppercase; letter-spacing: 0.6px; font-weight: 700; color: #64748b; margin-bottom: 8px; }
.wl-card-desc-section { padding-top: 16px; margin-bottom: 18px; }
.wl-card-desc { font-size: 13px; color: #475569; line-height: 1.65; margin: 0; }
.wl-card-columns { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 18px; }

.wl-danger-bars { display: flex; gap: 4px; margin-bottom: 6px; }
.wl-danger-seg  { flex: 1; height: 8px; border-radius: 4px; }
.wl-danger-text { font-size: 14px; font-weight: 800; }

.wl-factor-tags { display: flex; flex-wrap: wrap; gap: 5px; }
.wl-factor-tag  { font-size: 11px; padding: 4px 9px; border-radius: 8px; font-weight: 500; border: 1px solid; }
.wl-tag-accel   { background: #f0fdf4; border-color: #bbf7d0; color: #166534; }
.wl-tag-slow    { background: #fef2f2; border-color: #fecaca; color: #991b1b; }
.wl-tag-neutral { background: #f8fafc; border-color: #e2e8f0; color: #475569; }

.wl-card-harm   { border-radius: 12px; padding: 14px 14px 14px 18px; margin-bottom: 12px; border-left: 4px solid; }
.wl-harm-low    { background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%); border-left-color: #2D8B4E; }
.wl-harm-medium { background: linear-gradient(135deg, #fff7ed 0%, #fffbeb 100%); border-left-color: #E76F51; }
.wl-harm-high   { background: linear-gradient(135deg, #fef2f2 0%, #fff1f2 100%); border-left-color: #C1121F; }

.wl-card-highlight { display: flex; align-items: flex-start; gap: 10px; background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); border: 1px solid #fde68a; border-radius: 12px; padding: 14px; }
.wl-highlight-icon { font-size: 20px; }
.wl-card-highlight p { font-size: 13px; color: #92400e; line-height: 1.6; margin: 0; font-weight: 600; }

/* CTA */
.wl-cta {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 40%, #fef9c3 100%);
  border-radius: 24px;
  padding: 56px 40px;
  text-align: center;
}
.wl-cta-title { font-weight: 900; font-size: clamp(22px, 3vw, 32px); margin: 0 0 14px; color: #111827; }
.wl-cta-text  { font-size: clamp(15px, 2vw, 18px); max-width: 580px; margin: 0 auto 32px; color: #475569; }
.wl-cta-visual { display: flex; align-items: center; justify-content: center; gap: 20px; }
.wl-cta-old   { font-size: clamp(28px, 4vw, 44px); font-weight: 900; opacity: 0.3; text-decoration: line-through; color: #111827; }
.wl-cta-arrow { font-size: clamp(24px, 3vw, 36px); color: #10b981; animation: wl-pulse 2s infinite; }
.wl-cta-new   { font-size: clamp(32px, 5vw, 52px); font-weight: 900; color: #10b981; }
@keyframes wl-pulse { 0%, 100% { opacity: 0.6; transform: translateX(0); } 50% { opacity: 1; transform: translateX(6px); } }

.wl-footer { text-align: center; padding: 32px 24px; border-top: 1px solid #e2e8f0; background: #fff; }
.wl-footer p { font-size: 13px; color: #94a3b8; }

@media (max-width: 1024px) { .wl-factors-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 768px) {
  .wl-hero { padding: 40px 0 36px; }
  .wl-stats-row { gap: 24px; }
  .wl-card-columns { grid-template-columns: 1fr; gap: 14px; }
  .wl-card-bar-inline { display: none; }
}
</style>
```

---

## Промпт для Claude Design (готовый, копировать целиком)

```
Перерисуй два компонента портала АИС «Эко Оператор» — промо-баннер и страницу
«Сколько живёт ваш мусор?». Текущий код в приложенном бриф-документе.

Жёсткие требования:
1. Убрать все emoji в UI и в данных. Заменить на линейные SVG-иконки в стиле
   Lucide / Feather (stroke-width 1.5–1.8, размер 24×24). Один минимальный
   набор иконок: 4 фактора разложения (солнце, ветер, капля, бактерия),
   5 фильтров (можно вообще без иконок), ~21 категория отходов
   (бумага, дерево, текстиль, обувь, упаковка, мебель, масло, металл,
   стройматериалы, пластик, техника, телефон, шина, батарея, лампа, стекло).
2. Палитра — портала: brand teal #0d9488, accent emerald #10b981. Acid-цвета
   (оранжевый, красный) — только как семантический индикатор уровня
   опасности 1–5. Hover/active состояния — teal, не оранжевый.
3. Шрифты: Inter (sans, UI), Playfair Display (serif, редакционные заголовки),
   JetBrains Mono (mono). НЕ подключай Onest через @import — он лишний.
4. Magazine-editorial стиль (long-read), а НЕ infographic dashboard.
   Меньше градиентов и закруглений, больше типографики и whitespace.
5. Цветовой gradient-bar таймлайна (зелёный→жёлтый→красный) — оставить,
   он несёт смысл шкалы «безвреден → катастрофичен».
6. Промо-баннер на ленте: убрать рейнбоу-градиент на тексте,
   сделать спокойнее (можно с фото-плашкой или строгим typographic split).
   CTA-кнопка в brand teal #0d9488.

Что НЕ менять:
- Структуру разделов (hero / stats / 4 фактора / timeline / фильтры / карточки / CTA / footer)
- Бизнес-логику (фильтры по диапазону лет, expand/collapse карточек, animated counters)
- Анимации появления (fade-up)
- Текст контента и цифры (24 категории / 1 000 000 лет / 400 л)

Отдай результат как два файла Vue 3 SFC (script setup lang="ts" + template + style scoped).
```

---

## Финальная проверка перед заменой кода

Когда Claude Design вернёт результат:

1. Сверить, что нет ни одного emoji-символа в `.vue` файлах:
   ```bash
   grep -P '[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}]' frontend/src/views/publications/WasteLifetime.vue
   grep -P '[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}]' frontend/src/components/publications/WasteLifetimePromo.vue
   ```
   (должно быть пусто)

2. Сверить, что не подключается `Onest` через `@import` — портал использует Inter/Playfair Display.

3. Сверить, что фильтры/hover/CTA используют `#0d9488` или `var(--pub-brand)`, а не `#fea629`.

4. Прокликать в браузере: фильтры работают, карточки раскрываются, счётчики анимируются при скролле в зону `.wl-stats`.
