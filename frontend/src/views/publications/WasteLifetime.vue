<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'

/* ───────── Types ───────── */
interface WasteItem {
  id: number
  emoji: string
  groups: string
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

/* ───────── Data ───────── */
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
    harmText: 'Минимальный вред. При гниении выделяет метан, но объёмы незначительны. Типографская краска может содержать тяжёлые металлы.',
  },
  {
    id: 2, emoji: '🪵', groups: 'Гр. 24', name: 'Деревянная упаковка',
    yearsMin: 1, yearsMax: 15, dangerLevel: 1,
    description: 'Поддоны, ящики, деревянная тара. Необработанное дерево — 1–3 года, обработанное антисептиком — 10–15 лет.',
    factors: [
      { label: '💧 Влажность — главный катализатор', type: 'accelerate' },
      { label: '🦠 Грибки и термиты — разрушают', type: 'accelerate' },
      { label: '🔬 Пропитка — замедляет в 5–10 раз', type: 'slow' },
      { label: '💨 Кислород — необходим для гниения', type: 'accelerate' },
    ],
    harmLevel: 'low',
    harmText: 'Низкий вред при натуральной древесине. Пропитанное дерево выделяет формальдегид и хром, загрязняющие почву.',
  },
  {
    id: 3, emoji: '👕', groups: 'Гр. 17', name: 'Текстиль',
    yearsMin: 1, yearsMax: 200, dangerLevel: 2,
    description: 'Натуральные ткани (хлопок, лён, шерсть) — 1–5 лет. Синтетика (полиэстер, нейлон) — до 200 лет. Большинство современной одежды — смешанный состав.',
    factors: [
      { label: '🦠 Микроорганизмы — только натуральные', type: 'neutral' },
      { label: '☀️ УФ — крошит синтетику', type: 'accelerate' },
      { label: '💧 Влажность — ускоряет хлопок', type: 'accelerate' },
      { label: '🔬 Синтетика — не разлагается', type: 'slow' },
    ],
    harmLevel: 'medium',
    harmText: 'Синтетический текстиль — источник микропластика. При стирке одна куртка из флиса выделяет до 250 000 микрочастиц в воду.',
  },
  {
    id: 4, emoji: '👟', groups: 'Гр. 18', name: 'Обувь',
    yearsMin: 25, yearsMax: 80, dangerLevel: 2,
    description: 'Сэндвич из 10+ материалов: кожа, резина, ПВХ, ЭВА-пена, текстиль, клей. Каждый слой разлагается с разной скоростью.',
    factors: [
      { label: '🔬 Многослойность — замедляет', type: 'slow' },
      { label: '☀️ УФ — крошит резиновую подошву', type: 'accelerate' },
      { label: '💧 Влажность — разрушает кожу', type: 'accelerate' },
      { label: '🦠 Клеевые швы — барьер для бактерий', type: 'slow' },
    ],
    harmLevel: 'medium',
    harmText: 'Красители и клеи выделяют токсичные вещества. Хром из дублёной кожи загрязняет грунтовые воды.',
  },
  {
    id: 5, emoji: '🧃', groups: 'Гр. 23', name: 'Tetra Pak',
    yearsMin: 30, yearsMax: 100, dangerLevel: 3,
    description: 'Сэндвич из картона (75%), полиэтилена (20%) и алюминиевой фольги (5%). Природа не может разделить этот «пирог» на слои.',
    factors: [
      { label: '🔬 Многослойность — главный барьер', type: 'slow' },
      { label: '💧 Влажность — разрушает только картон', type: 'neutral' },
      { label: '🦠 Микроорганизмы — бессильны', type: 'slow' },
      { label: '☀️ УФ — медленно крошит пластик', type: 'accelerate' },
    ],
    harmLevel: 'medium',
    harmText: 'Алюминиевый слой не разлагается столетиями. Сэндвич фольги, пластика и картона — природа не знает, как его переварить.',
    highlight: 'Сэндвич фольги, пластика и картона не переваривается природой — она просто не знает рецепта.',
  },
  {
    id: 6, emoji: '🪑', groups: 'Гр. 16', name: 'Мебель',
    yearsMin: 30, yearsMax: 200, dangerLevel: 2,
    description: 'ДСП, МДФ, ЛДСП с ламинацией — 30–200 лет. Массив дерева без обработки — 15–30 лет. Мягкая мебель с поролоном — до 200 лет.',
    factors: [
      { label: '🔬 Ламинация и пропитка — барьер', type: 'slow' },
      { label: '💧 Влажность — разбухает ДСП', type: 'accelerate' },
      { label: '🦠 Грибки — разрушают массив', type: 'accelerate' },
      { label: '☀️ УФ — выцветание поверхности', type: 'neutral' },
    ],
    harmLevel: 'medium',
    harmText: 'Формальдегид из ДСП — канцероген класса 1 по классификации ВОЗ. При гниении выделяется в почву и грунтовые воды десятилетиями.',
  },
  {
    id: 7, emoji: '🛢️', groups: 'Гр. 3, 18', name: 'Масла и фильтры',
    yearsMin: 50, yearsMax: 100, dangerLevel: 4,
    description: 'Отработанные моторные, трансмиссионные масла и масляные фильтры. Не разлагаются, а накапливаются в почве.',
    factors: [
      { label: '🔬 Нефтепродукты — не разлагаются', type: 'slow' },
      { label: '💧 Вода — разносит загрязнение', type: 'accelerate' },
      { label: '🦠 Микроорганизмы — токсично для них', type: 'slow' },
      { label: '☀️ УФ — частичное разложение на поверхности', type: 'neutral' },
    ],
    harmLevel: 'high',
    harmText: 'Катастрофический вред. Нефтепродукты уничтожают микрофлору почвы, делая её мёртвой на десятилетия.',
    highlight: '1 литр отработанного масла отравляет 1 000 000 литров чистой воды — это годовой запас питьевой воды для 5 000 человек.',
  },
  {
    id: 8, emoji: '🥫', groups: 'Гр. 21', name: 'Металлическая упаковка',
    yearsMin: 50, yearsMax: 500, dangerLevel: 2,
    description: 'Жестяные банки — около 50 лет, алюминиевые — до 500 лет. Алюминий не ржавеет и не окисляется в обычных условиях.',
    factors: [
      { label: '💧 Влажность — ржавчина жести', type: 'accelerate' },
      { label: '💨 Кислород — ключ к коррозии', type: 'accelerate' },
      { label: '🔬 Алюминий — устойчив к коррозии', type: 'slow' },
      { label: '🦠 Микроорганизмы — не действуют', type: 'slow' },
    ],
    harmLevel: 'low',
    harmText: 'Относительно безопасны. При коррозии могут выделять следовые количества олова и цинка, но в малых дозах.',
  },
  {
    id: 9, emoji: '🔩', groups: 'Гр. 15', name: 'Стройматериалы (металл)',
    yearsMin: 50, yearsMax: 500, dangerLevel: 2,
    description: 'Арматура, профили, трубы. Чёрный металл — 50–100 лет (ржавеет), нержавеющая сталь и алюминий — до 500 лет.',
    factors: [
      { label: '💧 Влажность — главный враг стали', type: 'accelerate' },
      { label: '💨 Кислород — окисление металла', type: 'accelerate' },
      { label: '🔬 Сплавы — замедляют коррозию', type: 'slow' },
      { label: '🦠 Микроорганизмы — не действуют', type: 'slow' },
    ],
    harmLevel: 'low',
    harmText: 'Ржавчина безопасна для природы. Оцинкованные изделия выделяют цинк, который в больших концентрациях токсичен для водных организмов.',
  },
  {
    id: 10, emoji: '♻️', groups: 'Гр. 14, 19', name: 'Пластик',
    yearsMin: 100, yearsMax: 500, dangerLevel: 4,
    description: 'ПЭТ-бутылки, пакеты, плёнка, контейнеры. Не разлагается, а распадается на микропластик, проникающий в пищевую цепочку.',
    factors: [
      { label: '☀️ УФ — крошит на микропластик', type: 'accelerate' },
      { label: '🦠 Микроорганизмы — бессильны', type: 'slow' },
      { label: '💨 Без O₂ — почти вечен', type: 'slow' },
      { label: '🔬 Добавки — замедляют фотодеструкцию', type: 'slow' },
    ],
    harmLevel: 'high',
    harmText: 'Микропластик найден в крови человека, в плаценте, в снегах Тянь-Шаня и воде Иссык-Куля. Он не исчезает — только дробится мельче.',
    highlight: 'Человек съедает 5 граммов микропластика в неделю — это одна банковская карта.',
  },
  {
    id: 11, emoji: '🏗️', groups: 'Гр. 14', name: 'Стройматериалы (пластик)',
    yearsMin: 200, yearsMax: 500, dangerLevel: 3,
    description: 'ПВХ-трубы, сайдинг, утеплитель, линолеум. Промышленные полимеры особо устойчивы к разложению.',
    factors: [
      { label: '☀️ УФ — медленное разрушение', type: 'accelerate' },
      { label: '🔬 Стабилизаторы — защищают полимер', type: 'slow' },
      { label: '🦠 Микроорганизмы — не действуют', type: 'slow' },
      { label: '💧 Влажность — не влияет', type: 'neutral' },
    ],
    harmLevel: 'high',
    harmText: 'ПВХ при горении выделяет диоксины — одни из самых токсичных веществ, известных науке. Накапливаются в организме десятилетиями.',
  },
  {
    id: 12, emoji: '🧊', groups: 'Гр. 1, 2, 3, 4', name: 'Крупная бытовая техника',
    yearsMin: 100, yearsMax: 500, dangerLevel: 4,
    description: 'Холодильники, стиральные машины, плиты, посудомойки. Сплав металла, пластика, электроники и хладагентов.',
    factors: [
      { label: '💧 Влажность — ржавчина корпуса', type: 'accelerate' },
      { label: '🔬 Пластиковые детали — века', type: 'slow' },
      { label: '🦠 Микроорганизмы — не действуют', type: 'slow' },
      { label: '💨 Кислород — коррозия металла', type: 'accelerate' },
    ],
    harmLevel: 'high',
    harmText: 'Хладагенты (фреоны) в холодильниках — парниковые газы, в 1 000 раз мощнее CO₂. Один холодильник = 3 тонны выбросов CO₂-эквивалента.',
  },
  {
    id: 13, emoji: '📺', groups: 'Гр. 5, 7', name: 'ТВ и мониторы',
    yearsMin: 100, yearsMax: 500, dangerLevel: 4,
    description: 'Кинескопные, LED, LCD-экраны. Старые ЭЛТ-мониторы содержат до 2 кг свинца в стекле кинескопа.',
    factors: [
      { label: '🔬 Электроника — не разлагается', type: 'slow' },
      { label: '💧 Влажность — коррозия плат', type: 'accelerate' },
      { label: '🦠 Микроорганизмы — бессильны', type: 'slow' },
      { label: '☀️ УФ — крошит пластик корпуса', type: 'accelerate' },
    ],
    harmLevel: 'high',
    harmText: 'Свинец из ЭЛТ проникает в грунтовые воды. Ртуть из LED-подсветки испаряется. Бром из антипиренов — канцероген.',
  },
  {
    id: 14, emoji: '💻', groups: 'Гр. 6', name: 'Компьютеры',
    yearsMin: 100, yearsMax: 500, dangerLevel: 4,
    description: 'Системные блоки, ноутбуки. Содержат десятки ценных и опасных элементов: золото, палладий, свинец, ртуть, бериллий.',
    factors: [
      { label: '🔬 Печатные платы — не разлагаются', type: 'slow' },
      { label: '💧 Влажность — коррозия контактов', type: 'accelerate' },
      { label: '🦠 Микроорганизмы — бессильны', type: 'slow' },
      { label: '💨 Кислород — окисление припоя', type: 'neutral' },
    ],
    harmLevel: 'high',
    harmText: 'Печатные платы содержат бромированные антипирены — стойкие органические загрязнители, запрещённые Стокгольмской конвенцией.',
    highlight: '1 тонна печатных плат содержит больше золота, чем 1 тонна золотой руды — но 80% e-waste всё ещё попадает на свалки.',
  },
  {
    id: 15, emoji: '🖨️', groups: 'Гр. 8', name: 'Принтеры',
    yearsMin: 100, yearsMax: 500, dangerLevel: 3,
    description: 'Струйные, лазерные принтеры и картриджи. Тонер-порошок — мельчайшие частицы пластика с пигментом.',
    factors: [
      { label: '🔬 Электроника — не разлагается', type: 'slow' },
      { label: '💧 Влажность — замыкание плат', type: 'neutral' },
      { label: '☀️ УФ — крошит пластик', type: 'accelerate' },
      { label: '🦠 Микроорганизмы — бессильны', type: 'slow' },
    ],
    harmLevel: 'medium',
    harmText: 'Тонер канцерогенен при вдыхании. Картриджи содержат остатки чернил с тяжёлыми металлами — хромом и кадмием.',
  },
  {
    id: 16, emoji: '📱', groups: 'Гр. 9', name: 'Телефоны',
    yearsMin: 100, yearsMax: 500, dangerLevel: 4,
    description: 'Смартфоны, кнопочные телефоны. Компактный концентрат до 70 элементов таблицы Менделеева в одном устройстве.',
    factors: [
      { label: '🔬 Микросхемы — не разлагаются', type: 'slow' },
      { label: '💧 Влажность — коррозия', type: 'accelerate' },
      { label: '🦠 Микроорганизмы — бессильны', type: 'slow' },
      { label: '☀️ УФ — разрушает корпус', type: 'accelerate' },
    ],
    harmLevel: 'high',
    harmText: 'До 70 элементов таблицы Менделеева в одном устройстве. Литиевый аккумулятор может самовоспламениться на свалке.',
  },
  {
    id: 17, emoji: '🛞', groups: 'Гр. 11', name: 'Шины',
    yearsMin: 120, yearsMax: 140, dangerLevel: 3,
    description: 'Автомобильные шины — каркас из стальной проволоки, резина из синтетического каучука, сажа и десятки добавок.',
    factors: [
      { label: '☀️ УФ — крошит поверхность', type: 'accelerate' },
      { label: '🔬 Вулканизация — замедляет', type: 'slow' },
      { label: '🦠 Микроорганизмы — не действуют', type: 'slow' },
      { label: '💧 Влажность — не влияет', type: 'neutral' },
    ],
    harmLevel: 'medium',
    harmText: 'При истирании выделяют микрочастицы резины — второй по объёму источник микропластика после текстиля. Горящие шины — токсичный дым.',
    highlight: '120 лет — это 2 человеческие жизни. Шина, выброшенная сегодня, переживёт ваших правнуков.',
  },
  {
    id: 18, emoji: '🔋', groups: 'Гр. 12', name: 'Аккумуляторы',
    yearsMin: 100, yearsMax: 1000, dangerLevel: 5,
    description: 'Свинцово-кислотные (авто), литий-ионные (электроника), никель-кадмиевые. Концентрат тяжёлых металлов.',
    factors: [
      { label: '🔬 Тяжёлые металлы — вечны', type: 'slow' },
      { label: '💧 Вода — разносит свинец и кислоту', type: 'accelerate' },
      { label: '🦠 Микроорганизмы — гибнут', type: 'slow' },
      { label: '💨 Кислород — окисляет корпус', type: 'accelerate' },
    ],
    harmLevel: 'high',
    harmText: 'Свинец, ртуть, кадмий, литий — отравляют почву и воду навсегда. Свинец не выводится из организма и накапливается в костях.',
    highlight: 'Свинец, ртуть, литий — отравляют почву навсегда. «Навсегда» — это не метафора, а период полураспада.',
  },
  {
    id: 19, emoji: '🪫', groups: 'Гр. 13', name: 'Батарейки',
    yearsMin: 100, yearsMax: 500, dangerLevel: 5,
    description: 'Пальчиковые, мизинчиковые, «таблетки». Маленький размер — огромный ущерб. Корпус разрушается за 5–10 лет, но содержимое отравляет столетиями.',
    factors: [
      { label: '💧 Вода — вымывает тяжёлые металлы', type: 'accelerate' },
      { label: '🔬 Ртуть и кадмий — не разлагаются', type: 'slow' },
      { label: '💨 Кислород — коррозия корпуса', type: 'accelerate' },
      { label: '🦠 Микроорганизмы — гибнут рядом', type: 'slow' },
    ],
    harmLevel: 'high',
    harmText: 'Одна «таблетка» с ртутью загрязняет 400 литров воды. В Кыргызстане ежегодно выбрасывается более 10 млн батареек — почти все на свалки.',
    highlight: '1 батарейка отравляет 400 литров чистой воды — это 2 месяца питьевой воды для одного человека.',
  },
  {
    id: 20, emoji: '💡', groups: 'Гр. 10', name: 'Лампы',
    yearsMin: 100, yearsMax: 1000, dangerLevel: 4,
    description: 'Люминесцентные и энергосберегающие лампы содержат 3–5 мг ртути. LED-лампы безопаснее, но содержат электронику.',
    factors: [
      { label: '🔬 Стекло — тысячи лет', type: 'slow' },
      { label: '💧 Влажность — вымывает ртуть', type: 'accelerate' },
      { label: '🦠 Микроорганизмы — не действуют', type: 'slow' },
      { label: '☀️ УФ — не влияет', type: 'neutral' },
    ],
    harmLevel: 'high',
    harmText: 'Пары ртути из разбитой лампы — невидимая опасность. Вдыхание приводит к поражению нервной системы, почек и печени.',
    highlight: 'Пары ртути невидимы и без запаха — одна разбитая лампа отравляет 30 м³ воздуха.',
  },
  {
    id: 21, emoji: '🫙', groups: 'Гр. 20', name: 'Стекло',
    yearsMin: 1000, yearsMax: 1000000, dangerLevel: 3,
    description: 'Бутылки, банки, оконное стекло. Химически инертно — не вступает в реакцию с окружающей средой. Практически вечный материал.',
    factors: [
      { label: '🔬 Химическая инертность — вечно', type: 'slow' },
      { label: '💧 Влажность — не влияет', type: 'neutral' },
      { label: '🦠 Микроорганизмы — бессильны', type: 'slow' },
      { label: '☀️ УФ — не влияет', type: 'neutral' },
    ],
    harmLevel: 'medium',
    harmText: 'Само по себе безопасно, но осколки ранят животных и людей. Битое стекло фокусирует солнечный свет и вызывает пожары.',
    highlight: 'Бутылка времён Великого Шёлкового пути, проходившего через Кыргызстан, лежала бы на земле до сих пор.',
  },
]

// Sort by yearsMin ascending
const sortedItems = [...wasteItems].sort((a, b) => a.yearsMin - b.yearsMin)

/* ───────── Filters ───────── */
const filters: { key: FilterKey; label: string; emoji: string }[] = [
  { key: 'all', label: 'Все', emoji: '🔄' },
  { key: 'under15', label: 'До 15 лет', emoji: '🌱' },
  { key: 'y15_100', label: '15 – 100', emoji: '🌿' },
  { key: 'y100_500', label: '100 – 500', emoji: '🔥' },
  { key: 'over500', label: '500+', emoji: '☠️' },
]

function getFilterForItem(item: WasteItem): FilterKey {
  if (item.yearsMax <= 15) return 'under15'
  if (item.yearsMax > 15 && item.yearsMax <= 100) return 'y15_100'
  if (item.yearsMax > 100 && item.yearsMax <= 500) return 'y100_500'
  return 'over500'
}

const activeFilter = ref<FilterKey>('all')
const filteredData = computed(() => {
  if (activeFilter.value === 'all') return sortedItems
  return sortedItems.filter(item => getFilterForItem(item) === activeFilter.value)
})

/* ───────── Card expand/collapse ───────── */
const expandedId = ref<number | null>(null)
function toggleCard(id: number) {
  expandedId.value = expandedId.value === id ? null : id
}

/* ───────── Factor cards ───────── */
const factorExpanded = ref<number | null>(null)
function toggleFactor(idx: number) {
  factorExpanded.value = factorExpanded.value === idx ? null : idx
}

const factorCards = [
  {
    emoji: '☀️', title: 'УФ-излучение',
    summary: 'На поверхности в 5–10 раз быстрее, чем на глубине свалки',
    detail: 'В высокогорном Кыргызстане УФ-излучение на 30–50% выше равнины. Солнце крошит пластик в микропластик, попадающий в воду Иссык-Куля и ледники Тянь-Шаня.',
  },
  {
    emoji: '💨', title: 'Кислород',
    summary: 'Без O₂ на глубине разложение почти останавливается',
    detail: 'Анаэробное гниение без кислорода выделяет метан — парниковый газ, в 25 раз мощнее CO₂. Свалки КР — один из крупнейших источников метана в стране.',
  },
  {
    emoji: '💧', title: 'Влажность',
    summary: 'Катализатор коррозии и среда для микроорганизмов',
    detail: 'В засушливых регионах Кыргызстана гниение замедляется в 3–5 раз. Без воды бактерии не размножаются, а органика мумифицируется вместо разложения.',
  },
  {
    emoji: '🦠', title: 'Микроорганизмы',
    summary: 'Не умеют разлагать синтетику и стекло',
    detail: 'Синтетические полимеры — чужеродная пища для микробов. За 4 млрд лет эволюции природа не изобрела фермент для расщепления пластика.',
  },
]

/* ───────── Animated counters ───────── */
const counter1 = ref(0) // 24
const counter2 = ref(0) // 1000000
const counter3 = ref(0) // 400
const statsVisible = ref(false)

function animateCounter(target: number, setter: (v: number) => void, duration: number = 2000) {
  const startTime = performance.now()
  function tick(now: number) {
    const elapsed = now - startTime
    const progress = Math.min(elapsed / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3) // easeOutCubic
    setter(Math.round(eased * target))
    if (progress < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

onMounted(() => {
  nextTick(() => {
    const statsEl = document.querySelector('.wl-stats')
    if (!statsEl) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !statsVisible.value) {
          statsVisible.value = true
          animateCounter(24, v => counter1.value = v, 1200)
          animateCounter(1000000, v => counter2.value = v, 2500)
          animateCounter(400, v => counter3.value = v, 1800)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(statsEl)
  })
})

/* ───────── Helpers ───────── */
function formatYears(min: number, max: number): string {
  const fmt = (n: number): string => {
    if (n < 1) {
      const months = Math.round(n * 12)
      return `${months} мес`
    }
    if (n >= 1000000) return '1 000 000 лет'
    return `${n.toLocaleString('ru-RU')} ${n === 1 ? 'год' : n < 5 ? 'года' : 'лет'}`
  }
  if (min === max) return fmt(min)
  return `${fmt(min)} — ${fmt(max)}`
}

function formatNumber(n: number): string {
  return n.toLocaleString('ru-RU')
}

function logProgress(yearsMax: number): number {
  if (yearsMax <= 0) return 0
  return Math.min((Math.log10(yearsMax) / 6) * 100, 100)
}

function getBarColor(yearsMin: number): string {
  if (yearsMin <= 15) return '#2D8B4E'
  if (yearsMin <= 100) return '#F4A261'
  if (yearsMin <= 500) return '#E76F51'
  return '#C1121F'
}

function getDangerColor(level: number): string {
  const colors: Record<number, string> = {
    1: '#2D8B4E', 2: '#52B788', 3: '#F4A261', 4: '#E76F51', 5: '#C1121F',
  }
  return colors[level] || '#64748b'
}

function getHarmBg(level: string): string {
  if (level === 'high') return 'linear-gradient(135deg, #fef2f2 0%, #fff1f2 100%)'
  if (level === 'medium') return 'linear-gradient(135deg, #fff7ed 0%, #fffbeb 100%)'
  return 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)'
}
function getHarmBorder(level: string): string {
  if (level === 'high') return '#fecaca'
  if (level === 'medium') return '#fed7aa'
  return '#bbf7d0'
}
function getHarmTextColor(level: string): string {
  if (level === 'high') return '#991b1b'
  if (level === 'medium') return '#9a3412'
  return '#166534'
}
function getYearsColor(dangerLevel: number): string {
  if (dangerLevel <= 2) return '#2D8B4E'
  if (dangerLevel === 3) return '#E76F51'
  return '#C1121F'
}

function getFactorIcon(type: string): string {
  if (type === 'accelerate') return '⚡'
  if (type === 'slow') return '🐢'
  return '🔬'
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
          v-for="(f, idx) in factorCards"
          :key="idx"
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
        v-for="f in filters"
        :key="f.key"
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
          v-for="item in filteredData"
          :key="item.id"
          class="wl-card"
          :class="{ 'wl-card-open': expandedId === item.id }"
        >
          <!-- Collapsed header row — always visible, clickable -->
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
            <!-- Description -->
            <div class="wl-card-desc-section">
              <span class="wl-card-label">📋 Описание</span>
              <p class="wl-card-desc">{{ item.description }}</p>
            </div>

            <!-- Two columns: danger + factors -->
            <div class="wl-card-columns">
              <div class="wl-card-col-danger">
                <span class="wl-card-label">⚠️ Уровень опасности</span>
                <div class="wl-danger-bars">
                  <div
                    v-for="d in 5"
                    :key="d"
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
                    v-for="(fct, fi) in item.factors"
                    :key="fi"
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

            <!-- Harm block with left border -->
            <div class="wl-card-harm" :class="'wl-harm-' + item.harmLevel">
              <span class="wl-card-label" :style="{ color: getHarmTextColor(item.harmLevel) }">
                🔴 Вред для экологии
              </span>
              <p :style="{ color: getHarmTextColor(item.harmLevel) }">{{ item.harmText }}</p>
            </div>

            <!-- Highlight fact -->
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

/* ═══════ BASE ═══════ */
.wl {
  font-family: 'Onest', system-ui, -apple-system, sans-serif;
  background: #FAFAF7;
  color: #1e293b;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}
.wl-container {
  max-width: 1140px;
  margin: 0 auto;
  padding: 0 24px;
}

/* ═══════ HERO ═══════ */
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
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  margin-bottom: 24px;
  letter-spacing: 0.02em;
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
  font-weight: 400;
}

/* ═══════ STATS ═══════ */
.wl-stats {
  padding: 40px 0;
  border-bottom: 1px solid #f0f0ec;
}
.wl-stats-row {
  display: flex;
  justify-content: center;
  gap: 48px;
  flex-wrap: wrap;
}
.wl-stat { text-align: center; }
.wl-stat-num {
  font-weight: 900;
  font-size: clamp(26px, 4vw, 40px);
  display: block;
  line-height: 1.2;
  letter-spacing: -0.02em;
}
.wl-stat-label {
  font-size: 13px;
  color: #64748b;
  margin-top: 4px;
  display: block;
  font-weight: 500;
}

/* ═══════ FACTORS ═══════ */
.wl-factors-section { padding: 48px 0 36px; }
.wl-section-title {
  font-size: clamp(18px, 2.5vw, 24px);
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 20px;
}
.wl-factors-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}
.wl-factor-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 22px 18px 16px;
  cursor: pointer;
  transition: all 0.25s ease;
  position: relative;
}
.wl-factor-card:hover {
  border-color: #fea629;
  box-shadow: 0 4px 16px rgba(254,166,41,0.12);
}
.wl-factor-open {
  border-color: #fea629;
  box-shadow: 0 4px 20px rgba(254,166,41,0.15);
}
.wl-factor-emoji { font-size: 32px; display: block; margin-bottom: 10px; }
.wl-factor-title {
  font-size: 15px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 6px;
}
.wl-factor-summary {
  font-size: 13px;
  color: #64748b;
  line-height: 1.5;
  margin: 0 0 8px;
}
.wl-factor-detail {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #e2e8f0;
}
.wl-factor-detail p {
  font-size: 13px;
  color: #334155;
  line-height: 1.6;
  margin: 0;
}
.wl-factor-toggle {
  display: inline-block;
  font-size: 12px;
  font-weight: 600;
  color: #cb8521;
  margin-top: 6px;
}

/* ═══════ TIMELINE ═══════ */
.wl-timeline-section { padding: 0 0 36px; }
.wl-timeline-bar {
  height: 36px;
  border-radius: 18px;
  background: linear-gradient(90deg, #2D8B4E 0%, #52B788 20%, #fea629 45%, #E76F51 70%, #C1121F 100%);
}
.wl-timeline-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 11px;
  color: #64748b;
  font-weight: 600;
  letter-spacing: 0.02em;
}

/* ═══════ FILTERS ═══════ */
.wl-filters {
  display: flex;
  gap: 8px;
  padding: 0 0 28px;
  flex-wrap: wrap;
}
.wl-filter-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 8px 18px;
  border-radius: 24px;
  border: 1.5px solid #e2e8f0;
  background: #fff;
  font-family: 'Onest', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}
.wl-filter-pill:hover { border-color: #fea629; color: #cb8521; }
.wl-filter-active {
  background: #fea629;
  color: #fff;
  border-color: #fea629;
}
.wl-filter-emoji { font-size: 14px; }

/* ═══════ CARDS ═══════ */
.wl-cards-section { padding: 0 0 48px; }
.wl-cards-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.wl-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  overflow: hidden;
  transition: border-color 0.25s ease, box-shadow 0.25s ease;
  animation: wl-fadeSlideIn 0.35s ease both;
}
@keyframes wl-fadeSlideIn {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
.wl-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
}
.wl-card-open {
  border-color: #fea629;
  box-shadow: 0 4px 20px rgba(254,166,41,0.12);
}

/* ── Card header (collapsed row) ── */
.wl-card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  cursor: pointer;
  user-select: none;
  transition: background 0.15s ease;
}
.wl-card-header:hover {
  background: #fafbfc;
}
.wl-card-emoji {
  font-size: 24px;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8faf9;
  border-radius: 10px;
  flex-shrink: 0;
}
.wl-card-badge {
  font-size: 10px;
  font-weight: 700;
  color: #64748b;
  background: #f1f5f9;
  padding: 3px 8px;
  border-radius: 6px;
  letter-spacing: 0.03em;
  white-space: nowrap;
  flex-shrink: 0;
}
.wl-card-name {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

/* Inline mini timeline bar in header */
.wl-card-bar-inline {
  flex: 1;
  min-width: 40px;
  max-width: 140px;
  height: 5px;
  background: #f1f5f9;
  border-radius: 3px;
  overflow: hidden;
  flex-shrink: 1;
}
.wl-card-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.8s ease;
}

/* Years */
.wl-card-years {
  font-weight: 800;
  font-size: 13px;
  letter-spacing: -0.01em;
  flex-shrink: 0;
  white-space: nowrap;
}

/* Arrow */
.wl-card-arrow {
  font-size: 12px;
  color: #94a3b8;
  flex-shrink: 0;
  transition: transform 0.25s ease;
  line-height: 1;
}
.wl-arrow-up {
  transform: rotate(180deg);
}

/* ── Expanded body ── */
.wl-card-body {
  padding: 0 20px 20px;
  border-top: 1px solid #f1f5f9;
  animation: wl-bodyFadeIn 0.25s ease;
}
@keyframes wl-bodyFadeIn {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}
.wl-card-label {
  display: block;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  font-weight: 700;
  color: #64748b;
  margin-bottom: 8px;
}

/* Description section */
.wl-card-desc-section {
  padding-top: 16px;
  margin-bottom: 18px;
}
.wl-card-desc {
  font-size: 13px;
  color: #475569;
  line-height: 1.65;
  margin: 0;
}

/* Two columns: danger + factors */
.wl-card-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 18px;
}
.wl-card-col-danger {}
.wl-card-col-factors {}

/* Danger bars */
.wl-danger-bars {
  display: flex;
  gap: 4px;
  margin-bottom: 6px;
}
.wl-danger-seg {
  flex: 1;
  height: 8px;
  border-radius: 4px;
  transition: background 0.3s ease;
}
.wl-danger-text {
  font-size: 14px;
  font-weight: 800;
}

/* Factor tags */
.wl-factor-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}
.wl-factor-tag {
  font-size: 11px;
  padding: 4px 9px;
  border-radius: 8px;
  font-weight: 500;
  line-height: 1.3;
  border: 1px solid;
}
.wl-tag-accel {
  background: #f0fdf4;
  border-color: #bbf7d0;
  color: #166534;
}
.wl-tag-slow {
  background: #fef2f2;
  border-color: #fecaca;
  color: #991b1b;
}
.wl-tag-neutral {
  background: #f8fafc;
  border-color: #e2e8f0;
  color: #475569;
}

/* Harm block with left border */
.wl-card-harm {
  border-radius: 12px;
  padding: 14px 14px 14px 18px;
  margin-bottom: 12px;
  border-left: 4px solid;
}
.wl-harm-low {
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
  border-left-color: #2D8B4E;
}
.wl-harm-medium {
  background: linear-gradient(135deg, #fff7ed 0%, #fffbeb 100%);
  border-left-color: #E76F51;
}
.wl-harm-high {
  background: linear-gradient(135deg, #fef2f2 0%, #fff1f2 100%);
  border-left-color: #C1121F;
}
.wl-card-harm p {
  font-size: 13px;
  line-height: 1.6;
  margin: 0;
}

/* Highlight */
.wl-card-highlight {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  border: 1px solid #fde68a;
  border-radius: 12px;
  padding: 14px;
}
.wl-highlight-icon { font-size: 20px; flex-shrink: 0; margin-top: 1px; }
.wl-card-highlight p {
  font-size: 13px;
  color: #92400e;
  line-height: 1.6;
  margin: 0;
  font-weight: 600;
}

/* ═══════ CTA ═══════ */
.wl-cta-section { padding: 0 0 48px; }
.wl-cta {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 40%, #fef9c3 100%);
  border-radius: 24px;
  padding: 56px 40px;
  text-align: center;
}
.wl-cta-title {
  font-weight: 900;
  font-size: clamp(22px, 3vw, 32px);
  margin: 0 0 14px;
  line-height: 1.2;
  color: #111827;
}
.wl-cta-text {
  font-size: clamp(15px, 2vw, 18px);
  max-width: 580px;
  margin: 0 auto 32px;
  line-height: 1.6;
  color: #475569;
  font-weight: 500;
}
.wl-cta-visual {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
}
.wl-cta-old {
  font-size: clamp(28px, 4vw, 44px);
  font-weight: 900;
  opacity: 0.3;
  text-decoration: line-through;
  letter-spacing: -0.02em;
  color: #111827;
}
.wl-cta-arrow {
  font-size: clamp(24px, 3vw, 36px);
  font-weight: 700;
  color: #10b981;
  animation: wl-pulse 2s infinite;
}
.wl-cta-new {
  font-size: clamp(32px, 5vw, 52px);
  font-weight: 900;
  color: #10b981;
  letter-spacing: -0.02em;
}

@keyframes wl-pulse {
  0%, 100% { opacity: 0.6; transform: translateX(0); }
  50% { opacity: 1; transform: translateX(6px); }
}

/* ═══════ FOOTER ═══════ */
.wl-footer {
  text-align: center;
  padding: 32px 24px;
  border-top: 1px solid #e2e8f0;
  background: #fff;
}
.wl-footer p {
  font-size: 13px;
  color: #94a3b8;
  margin: 0;
  font-weight: 500;
}

/* ═══════ RESPONSIVE ═══════ */
@media (max-width: 1024px) {
  .wl-factors-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .wl-hero { padding: 40px 0 36px; }
  .wl-stats-row { gap: 24px; }
  .wl-factors-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
  .wl-cta { padding: 36px 24px; border-radius: 18px; }
  .wl-cta-visual { gap: 14px; }
  .wl-card-columns { grid-template-columns: 1fr; gap: 14px; }
  .wl-card-bar-inline { display: none; }
}

@media (max-width: 480px) {
  .wl-container { padding: 0 16px; }
  .wl-hero { padding: 32px 0 28px; }
  .wl-stats-row { flex-direction: column; gap: 16px; }
  .wl-factors-grid { grid-template-columns: 1fr; }
  .wl-filter-pill { font-size: 12px; padding: 6px 14px; }
  .wl-cta { padding: 28px 18px; border-radius: 14px; }
  .wl-card-header { gap: 8px; padding: 10px 12px; }
  .wl-card-badge { display: none; }
  .wl-card-body { padding: 0 14px 16px; }
}
</style>
