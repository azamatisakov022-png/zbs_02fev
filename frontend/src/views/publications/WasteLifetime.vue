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
    description: 'Газеты, офисная бумага, картон. Самый безопасный вид отходов - быстро разлагается во влажной среде благодаря целлюлозной структуре.',
    factors: [
      { label: '💧 Влажность - ускоряет', type: 'accelerate' },
      { label: '🦠 Микроорганизмы - главный фактор', type: 'accelerate' },
      { label: '☀️ УФ - ускоряет выцветание', type: 'accelerate' },
      { label: '💨 Без O₂ - замедляет в 5 раз', type: 'slow' },
    ],
    harmLevel: 'low',
    harmText: 'Минимальный вред. При гниении выделяет метан, но объёмы незначительны. Типографская краска может содержать тяжёлые металлы.',
  },
  {
    id: 2, emoji: '🪵', groups: 'Гр. 24', name: 'Деревянная упаковка',
    yearsMin: 1, yearsMax: 15, dangerLevel: 1,
    description: 'Поддоны, ящики, деревянная тара. Необработанное дерево - 1–3 года, обработанное антисептиком - 10–15 лет.',
    factors: [
      { label: '💧 Влажность - главный катализатор', type: 'accelerate' },
      { label: '🦠 Грибки и термиты - разрушают', type: 'accelerate' },
      { label: '🔬 Пропитка - замедляет в 5–10 раз', type: 'slow' },
      { label: '💨 Кислород - необходим для гниения', type: 'accelerate' },
    ],
    harmLevel: 'low',
    harmText: 'Низкий вред при натуральной древесине. Пропитанное дерево выделяет формальдегид и хром, загрязняющие почву.',
  },
  {
    id: 3, emoji: '👕', groups: 'Гр. 17', name: 'Текстиль',
    yearsMin: 1, yearsMax: 200, dangerLevel: 2,
    description: 'Натуральные ткани (хлопок, лён, шерсть) - 1–5 лет. Синтетика (полиэстер, нейлон) - до 200 лет. Большинство современной одежды - смешанный состав.',
    factors: [
      { label: '🦠 Микроорганизмы - только натуральные', type: 'neutral' },
      { label: '☀️ УФ - крошит синтетику', type: 'accelerate' },
      { label: '💧 Влажность - ускоряет хлопок', type: 'accelerate' },
      { label: '🔬 Синтетика - не разлагается', type: 'slow' },
    ],
    harmLevel: 'medium',
    harmText: 'Синтетический текстиль - источник микропластика. При стирке одна куртка из флиса выделяет до 250 000 микрочастиц в воду.',
  },
  {
    id: 4, emoji: '👟', groups: 'Гр. 18', name: 'Обувь',
    yearsMin: 25, yearsMax: 80, dangerLevel: 2,
    description: 'Сэндвич из 10+ материалов: кожа, резина, ПВХ, ЭВА-пена, текстиль, клей. Каждый слой разлагается с разной скоростью.',
    factors: [
      { label: '🔬 Многослойность - замедляет', type: 'slow' },
      { label: '☀️ УФ - крошит резиновую подошву', type: 'accelerate' },
      { label: '💧 Влажность - разрушает кожу', type: 'accelerate' },
      { label: '🦠 Клеевые швы - барьер для бактерий', type: 'slow' },
    ],
    harmLevel: 'medium',
    harmText: 'Красители и клеи выделяют токсичные вещества. Хром из дублёной кожи загрязняет грунтовые воды.',
  },
  {
    id: 5, emoji: '🧃', groups: 'Гр. 23', name: 'Tetra Pak',
    yearsMin: 30, yearsMax: 100, dangerLevel: 3,
    description: 'Сэндвич из картона (75%), полиэтилена (20%) и алюминиевой фольги (5%). Природа не может разделить этот «пирог» на слои.',
    factors: [
      { label: '🔬 Многослойность - главный барьер', type: 'slow' },
      { label: '💧 Влажность - разрушает только картон', type: 'neutral' },
      { label: '🦠 Микроорганизмы - бессильны', type: 'slow' },
      { label: '☀️ УФ - медленно крошит пластик', type: 'accelerate' },
    ],
    harmLevel: 'medium',
    harmText: 'Алюминиевый слой не разлагается столетиями. Сэндвич фольги, пластика и картона - природа не знает, как его переварить.',
    highlight: 'Сэндвич фольги, пластика и картона не переваривается природой - она просто не знает рецепта.',
  },
  {
    id: 6, emoji: '🪑', groups: 'Гр. 16', name: 'Мебель',
    yearsMin: 30, yearsMax: 200, dangerLevel: 2,
    description: 'ДСП, МДФ, ЛДСП с ламинацией - 30–200 лет. Массив дерева без обработки - 15–30 лет. Мягкая мебель с поролоном - до 200 лет.',
    factors: [
      { label: '🔬 Ламинация и пропитка - барьер', type: 'slow' },
      { label: '💧 Влажность - разбухает ДСП', type: 'accelerate' },
      { label: '🦠 Грибки - разрушают массив', type: 'accelerate' },
      { label: '☀️ УФ - выцветание поверхности', type: 'neutral' },
    ],
    harmLevel: 'medium',
    harmText: 'Формальдегид из ДСП - канцероген класса 1 по классификации ВОЗ. При гниении выделяется в почву и грунтовые воды десятилетиями.',
  },
  {
    id: 7, emoji: '🛢️', groups: 'Гр. 3, 18', name: 'Масла и фильтры',
    yearsMin: 50, yearsMax: 100, dangerLevel: 4,
    description: 'Отработанные моторные, трансмиссионные масла и масляные фильтры. Не разлагаются, а накапливаются в почве.',
    factors: [
      { label: '🔬 Нефтепродукты - не разлагаются', type: 'slow' },
      { label: '💧 Вода - разносит загрязнение', type: 'accelerate' },
      { label: '🦠 Микроорганизмы - токсично для них', type: 'slow' },
      { label: '☀️ УФ - частичное разложение на поверхности', type: 'neutral' },
    ],
    harmLevel: 'high',
    harmText: 'Катастрофический вред. Нефтепродукты уничтожают микрофлору почвы, делая её мёртвой на десятилетия.',
    highlight: '1 литр отработанного масла отравляет 1 000 000 литров чистой воды - это годовой запас питьевой воды для 5 000 человек.',
  },
  {
    id: 8, emoji: '🥫', groups: 'Гр. 21', name: 'Металлическая упаковка',
    yearsMin: 50, yearsMax: 500, dangerLevel: 2,
    description: 'Жестяные банки - около 50 лет, алюминиевые - до 500 лет. Алюминий не ржавеет и не окисляется в обычных условиях.',
    factors: [
      { label: '💧 Влажность - ржавчина жести', type: 'accelerate' },
      { label: '💨 Кислород - ключ к коррозии', type: 'accelerate' },
      { label: '🔬 Алюминий - устойчив к коррозии', type: 'slow' },
      { label: '🦠 Микроорганизмы - не действуют', type: 'slow' },
    ],
    harmLevel: 'low',
    harmText: 'Относительно безопасны. При коррозии могут выделять следовые количества олова и цинка, но в малых дозах.',
  },
  {
    id: 9, emoji: '🔩', groups: 'Гр. 15', name: 'Стройматериалы (металл)',
    yearsMin: 50, yearsMax: 500, dangerLevel: 2,
    description: 'Арматура, профили, трубы. Чёрный металл - 50–100 лет (ржавеет), нержавеющая сталь и алюминий - до 500 лет.',
    factors: [
      { label: '💧 Влажность - главный враг стали', type: 'accelerate' },
      { label: '💨 Кислород - окисление металла', type: 'accelerate' },
      { label: '🔬 Сплавы - замедляют коррозию', type: 'slow' },
      { label: '🦠 Микроорганизмы - не действуют', type: 'slow' },
    ],
    harmLevel: 'low',
    harmText: 'Ржавчина безопасна для природы. Оцинкованные изделия выделяют цинк, который в больших концентрациях токсичен для водных организмов.',
  },
  {
    id: 10, emoji: '♻️', groups: 'Гр. 14, 19', name: 'Пластик',
    yearsMin: 100, yearsMax: 500, dangerLevel: 4,
    description: 'ПЭТ-бутылки, пакеты, плёнка, контейнеры. Не разлагается, а распадается на микропластик, проникающий в пищевую цепочку.',
    factors: [
      { label: '☀️ УФ - крошит на микропластик', type: 'accelerate' },
      { label: '🦠 Микроорганизмы - бессильны', type: 'slow' },
      { label: '💨 Без O₂ - почти вечен', type: 'slow' },
      { label: '🔬 Добавки - замедляют фотодеструкцию', type: 'slow' },
    ],
    harmLevel: 'high',
    harmText: 'Микропластик найден в крови человека, в плаценте, в снегах Тянь-Шаня и воде Иссык-Куля. Он не исчезает - только дробится мельче.',
    highlight: 'Человек съедает 5 граммов микропластика в неделю - это одна банковская карта.',
  },
  {
    id: 11, emoji: '🏗️', groups: 'Гр. 14', name: 'Стройматериалы (пластик)',
    yearsMin: 200, yearsMax: 500, dangerLevel: 3,
    description: 'ПВХ-трубы, сайдинг, утеплитель, линолеум. Промышленные полимеры особо устойчивы к разложению.',
    factors: [
      { label: '☀️ УФ - медленное разрушение', type: 'accelerate' },
      { label: '🔬 Стабилизаторы - защищают полимер', type: 'slow' },
      { label: '🦠 Микроорганизмы - не действуют', type: 'slow' },
      { label: '💧 Влажность - не влияет', type: 'neutral' },
    ],
    harmLevel: 'high',
    harmText: 'ПВХ при горении выделяет диоксины - одни из самых токсичных веществ, известных науке. Накапливаются в организме десятилетиями.',
  },
  {
    id: 12, emoji: '🧊', groups: 'Гр. 1, 2, 3, 4', name: 'Крупная бытовая техника',
    yearsMin: 100, yearsMax: 500, dangerLevel: 4,
    description: 'Холодильники, стиральные машины, плиты, посудомойки. Сплав металла, пластика, электроники и хладагентов.',
    factors: [
      { label: '💧 Влажность - ржавчина корпуса', type: 'accelerate' },
      { label: '🔬 Пластиковые детали - века', type: 'slow' },
      { label: '🦠 Микроорганизмы - не действуют', type: 'slow' },
      { label: '💨 Кислород - коррозия металла', type: 'accelerate' },
    ],
    harmLevel: 'high',
    harmText: 'Хладагенты (фреоны) в холодильниках - парниковые газы, в 1 000 раз мощнее CO₂. Один холодильник = 3 тонны выбросов CO₂-эквивалента.',
  },
  {
    id: 13, emoji: '📺', groups: 'Гр. 5, 7', name: 'ТВ и мониторы',
    yearsMin: 100, yearsMax: 500, dangerLevel: 4,
    description: 'Кинескопные, LED, LCD-экраны. Старые ЭЛТ-мониторы содержат до 2 кг свинца в стекле кинескопа.',
    factors: [
      { label: '🔬 Электроника - не разлагается', type: 'slow' },
      { label: '💧 Влажность - коррозия плат', type: 'accelerate' },
      { label: '🦠 Микроорганизмы - бессильны', type: 'slow' },
      { label: '☀️ УФ - крошит пластик корпуса', type: 'accelerate' },
    ],
    harmLevel: 'high',
    harmText: 'Свинец из ЭЛТ проникает в грунтовые воды. Ртуть из LED-подсветки испаряется. Бром из антипиренов - канцероген.',
  },
  {
    id: 14, emoji: '💻', groups: 'Гр. 6', name: 'Компьютеры',
    yearsMin: 100, yearsMax: 500, dangerLevel: 4,
    description: 'Системные блоки, ноутбуки. Содержат десятки ценных и опасных элементов: золото, палладий, свинец, ртуть, бериллий.',
    factors: [
      { label: '🔬 Печатные платы - не разлагаются', type: 'slow' },
      { label: '💧 Влажность - коррозия контактов', type: 'accelerate' },
      { label: '🦠 Микроорганизмы - бессильны', type: 'slow' },
      { label: '💨 Кислород - окисление припоя', type: 'neutral' },
    ],
    harmLevel: 'high',
    harmText: 'Печатные платы содержат бромированные антипирены - стойкие органические загрязнители, запрещённые Стокгольмской конвенцией.',
    highlight: '1 тонна печатных плат содержит больше золота, чем 1 тонна золотой руды - но 80% e-waste всё ещё попадает на свалки.',
  },
  {
    id: 15, emoji: '🖨️', groups: 'Гр. 8', name: 'Принтеры',
    yearsMin: 100, yearsMax: 500, dangerLevel: 3,
    description: 'Струйные, лазерные принтеры и картриджи. Тонер-порошок - мельчайшие частицы пластика с пигментом.',
    factors: [
      { label: '🔬 Электроника - не разлагается', type: 'slow' },
      { label: '💧 Влажность - замыкание плат', type: 'neutral' },
      { label: '☀️ УФ - крошит пластик', type: 'accelerate' },
      { label: '🦠 Микроорганизмы - бессильны', type: 'slow' },
    ],
    harmLevel: 'medium',
    harmText: 'Тонер канцерогенен при вдыхании. Картриджи содержат остатки чернил с тяжёлыми металлами - хромом и кадмием.',
  },
  {
    id: 16, emoji: '📱', groups: 'Гр. 9', name: 'Телефоны',
    yearsMin: 100, yearsMax: 500, dangerLevel: 4,
    description: 'Смартфоны, кнопочные телефоны. Компактный концентрат до 70 элементов таблицы Менделеева в одном устройстве.',
    factors: [
      { label: '🔬 Микросхемы - не разлагаются', type: 'slow' },
      { label: '💧 Влажность - коррозия', type: 'accelerate' },
      { label: '🦠 Микроорганизмы - бессильны', type: 'slow' },
      { label: '☀️ УФ - разрушает корпус', type: 'accelerate' },
    ],
    harmLevel: 'high',
    harmText: 'До 70 элементов таблицы Менделеева в одном устройстве. Литиевый аккумулятор может самовоспламениться на свалке.',
  },
  {
    id: 17, emoji: '🛞', groups: 'Гр. 11', name: 'Шины',
    yearsMin: 120, yearsMax: 140, dangerLevel: 3,
    description: 'Автомобильные шины - каркас из стальной проволоки, резина из синтетического каучука, сажа и десятки добавок.',
    factors: [
      { label: '☀️ УФ - крошит поверхность', type: 'accelerate' },
      { label: '🔬 Вулканизация - замедляет', type: 'slow' },
      { label: '🦠 Микроорганизмы - не действуют', type: 'slow' },
      { label: '💧 Влажность - не влияет', type: 'neutral' },
    ],
    harmLevel: 'medium',
    harmText: 'При истирании выделяют микрочастицы резины - второй по объёму источник микропластика после текстиля. Горящие шины - токсичный дым.',
    highlight: '120 лет - это 2 человеческие жизни. Шина, выброшенная сегодня, переживёт ваших правнуков.',
  },
  {
    id: 18, emoji: '🔋', groups: 'Гр. 12', name: 'Аккумуляторы',
    yearsMin: 100, yearsMax: 1000, dangerLevel: 5,
    description: 'Свинцово-кислотные (авто), литий-ионные (электроника), никель-кадмиевые. Концентрат тяжёлых металлов.',
    factors: [
      { label: '🔬 Тяжёлые металлы - вечны', type: 'slow' },
      { label: '💧 Вода - разносит свинец и кислоту', type: 'accelerate' },
      { label: '🦠 Микроорганизмы - гибнут', type: 'slow' },
      { label: '💨 Кислород - окисляет корпус', type: 'accelerate' },
    ],
    harmLevel: 'high',
    harmText: 'Свинец, ртуть, кадмий, литий - отравляют почву и воду навсегда. Свинец не выводится из организма и накапливается в костях.',
    highlight: 'Свинец, ртуть, литий - отравляют почву навсегда. «Навсегда» - это не метафора, а период полураспада.',
  },
  {
    id: 19, emoji: '🪫', groups: 'Гр. 13', name: 'Батарейки',
    yearsMin: 100, yearsMax: 500, dangerLevel: 5,
    description: 'Пальчиковые, мизинчиковые, «таблетки». Маленький размер - огромный ущерб. Корпус разрушается за 5–10 лет, но содержимое отравляет столетиями.',
    factors: [
      { label: '💧 Вода - вымывает тяжёлые металлы', type: 'accelerate' },
      { label: '🔬 Ртуть и кадмий - не разлагаются', type: 'slow' },
      { label: '💨 Кислород - коррозия корпуса', type: 'accelerate' },
      { label: '🦠 Микроорганизмы - гибнут рядом', type: 'slow' },
    ],
    harmLevel: 'high',
    harmText: 'Одна «таблетка» с ртутью загрязняет 400 литров воды. В Кыргызстане ежегодно выбрасывается более 10 млн батареек - почти все на свалки.',
    highlight: '1 батарейка отравляет 400 литров чистой воды - это 2 месяца питьевой воды для одного человека.',
  },
  {
    id: 20, emoji: '💡', groups: 'Гр. 10', name: 'Лампы',
    yearsMin: 100, yearsMax: 1000, dangerLevel: 4,
    description: 'Люминесцентные и энергосберегающие лампы содержат 3–5 мг ртути. LED-лампы безопаснее, но содержат электронику.',
    factors: [
      { label: '🔬 Стекло - тысячи лет', type: 'slow' },
      { label: '💧 Влажность - вымывает ртуть', type: 'accelerate' },
      { label: '🦠 Микроорганизмы - не действуют', type: 'slow' },
      { label: '☀️ УФ - не влияет', type: 'neutral' },
    ],
    harmLevel: 'high',
    harmText: 'Пары ртути из разбитой лампы - невидимая опасность. Вдыхание приводит к поражению нервной системы, почек и печени.',
    highlight: 'Пары ртути невидимы и без запаха - одна разбитая лампа отравляет 30 м³ воздуха.',
  },
  {
    id: 21, emoji: '🫙', groups: 'Гр. 20', name: 'Стекло',
    yearsMin: 1000, yearsMax: 1000000, dangerLevel: 3,
    description: 'Бутылки, банки, оконное стекло. Химически инертно - не вступает в реакцию с окружающей средой. Практически вечный материал.',
    factors: [
      { label: '🔬 Химическая инертность - вечно', type: 'slow' },
      { label: '💧 Влажность - не влияет', type: 'neutral' },
      { label: '🦠 Микроорганизмы - бессильны', type: 'slow' },
      { label: '☀️ УФ - не влияет', type: 'neutral' },
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
    detail: 'Анаэробное гниение без кислорода выделяет метан - парниковый газ, в 25 раз мощнее CO₂. Свалки КР - один из крупнейших источников метана в стране.',
  },
  {
    emoji: '💧', title: 'Влажность',
    summary: 'Катализатор коррозии и среда для микроорганизмов',
    detail: 'В засушливых регионах Кыргызстана гниение замедляется в 3–5 раз. Без воды бактерии не размножаются, а органика мумифицируется вместо разложения.',
  },
  {
    emoji: '🦠', title: 'Микроорганизмы',
    summary: 'Не умеют разлагать синтетику и стекло',
    detail: 'Синтетические полимеры - чужеродная пища для микробов. За 4 млрд лет эволюции природа не изобрела фермент для расщепления пластика.',
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
  return `${fmt(min)} - ${fmt(max)}`
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
  if (type === 'accelerate') return 'ACC'
  if (type === 'slow') return 'SLOW'
  return 'LAB'
}

const materialCodes: Record<number, string> = {
  1: 'PP', 2: 'WD', 3: 'TX', 4: 'SH', 5: 'TP', 6: 'FR', 7: 'OL',
  8: 'AL', 9: 'MT', 10: 'PL', 11: 'PV', 12: 'AP', 13: 'TV', 14: 'PC',
  15: 'PR', 16: 'PH', 17: 'TR', 18: 'AB', 19: 'BT', 20: 'LG', 21: 'GL',
}

const featuredItem = computed(() => {
  return filteredData.value.find(item => item.id === expandedId.value) || filteredData.value[0] || sortedItems[0]
})

function getMaterialCode(item: WasteItem): string {
  return materialCodes[item.id] || item.name.slice(0, 2).toUpperCase()
}

function getFactorCode(idx: number): string {
  return ['UV', 'O2', 'H2O', 'BIO'][idx] || 'ENV'
}

function getFilterCode(key: FilterKey): string {
  const codes: Record<FilterKey, string> = {
    all: 'ALL',
    under15: '<15',
    y15_100: '15+',
    y100_500: '100+',
    over500: '500+',
  }
  return codes[key]
}

function cleanFactorLabel(label: string): string {
  return label.replace(/^\S+\s+/, '')
}
</script>

<template>
  <div class="wl">
    <section class="wl-hero">
      <div class="wl-container">
        <div class="wl-hero-shell">
          <div class="wl-hero-copy">
            <div class="wl-hero-badge">Спецпроект · Эко Оператор</div>
            <h1 class="wl-hero-title">
              Сколько живёт ваш <span class="wl-hero-accent">мусор</span>?
            </h1>
            <p class="wl-hero-sub">
              Узнайте, сколько времени природе нужно на разложение разных отходов
              и какой след они оставляют в экосистемах Кыргызстана.
            </p>
          </div>
          <div class="wl-hero-orbit" aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </section>

    <section class="wl-stats">
      <div class="wl-container wl-stats-row">
        <div class="wl-stat">
          <span class="wl-stat-kicker">Каталог</span>
          <span class="wl-stat-num">{{ formatNumber(counter1) }}</span>
          <span class="wl-stat-label">категории отходов</span>
        </div>
        <div class="wl-stat">
          <span class="wl-stat-kicker">Максимум</span>
          <span class="wl-stat-num">{{ formatNumber(counter2) }}</span>
          <span class="wl-stat-label">лет - стекло</span>
        </div>
        <div class="wl-stat">
          <span class="wl-stat-kicker">Риск</span>
          <span class="wl-stat-num">{{ formatNumber(counter3) }} л</span>
          <span class="wl-stat-label">отравленной воды</span>
        </div>
      </div>
    </section>

    <section class="wl-container wl-exhibit-section">
      <div class="wl-exhibit">
        <div class="wl-exhibit-grid" aria-hidden="true"></div>
        <div class="wl-scanline" aria-hidden="true"></div>

        <div class="wl-exhibit-head">
          <div>
            <span class="wl-module-eyebrow">Interactive timeline</span>
            <h2 class="wl-module-title">Период распада: от месяцев до геологического времени</h2>
          </div>
          <div class="wl-live-chip">
            <span class="wl-live-dot"></span>
            Активная модель
          </div>
        </div>

        <div class="wl-sensors">
          <button
            v-for="(f, idx) in factorCards"
            :key="idx"
            class="wl-sensor"
            :class="{ 'wl-sensor-active': factorExpanded === idx }"
            type="button"
            @click="toggleFactor(idx)"
          >
            <span class="wl-sensor-code">{{ getFactorCode(idx) }}</span>
            <span class="wl-sensor-body">
              <span class="wl-sensor-title">{{ f.title }}</span>
              <span class="wl-sensor-summary">{{ f.summary }}</span>
            </span>
          </button>
        </div>

        <div v-if="factorExpanded !== null" class="wl-sensor-detail">
          <span>{{ getFactorCode(factorExpanded) }}</span>
          <p>{{ factorCards[factorExpanded].detail }}</p>
        </div>

        <div class="wl-time-stage">
          <div class="wl-featured">
            <span class="wl-featured-code">{{ getMaterialCode(featuredItem) }}</span>
            <div>
              <span class="wl-featured-label">Сейчас в фокусе</span>
              <strong>{{ featuredItem.name }}</strong>
              <small>{{ formatYears(featuredItem.yearsMin, featuredItem.yearsMax) }}</small>
            </div>
          </div>
          <div class="wl-timeline-wrap">
            <div class="wl-timeline-ruler">
              <span>3 мес</span>
              <span>10 лет</span>
              <span>100 лет</span>
              <span>1 000 лет</span>
              <span>1 000 000 лет</span>
            </div>
            <div class="wl-timeline-bar">
              <div class="wl-timeline-flow"></div>
              <div
                class="wl-timeline-cursor"
                :style="{ left: logProgress(featuredItem.yearsMax) + '%' }"
              ></div>
            </div>
          </div>
        </div>

        <div class="wl-filters">
          <button
            v-for="f in filters"
            :key="f.key"
            class="wl-filter-pill"
            :class="{ 'wl-filter-active': activeFilter === f.key }"
            type="button"
            @click="activeFilter = f.key"
          >
            <span>{{ getFilterCode(f.key) }}</span>
            {{ f.label }}
          </button>
        </div>

        <div class="wl-cards-grid">
          <div
            v-for="item in filteredData"
            :key="item.id"
            class="wl-card"
            :class="{ 'wl-card-open': expandedId === item.id }"
          >
            <div class="wl-card-header" @click="toggleCard(item.id)">
              <span class="wl-card-code">{{ getMaterialCode(item) }}</span>
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
              <span class="wl-card-arrow" :class="{ 'wl-arrow-up': expandedId === item.id }"></span>
            </div>

            <div v-if="expandedId === item.id" class="wl-card-body">
              <div class="wl-card-desc-section">
                <span class="wl-card-label">Описание</span>
                <p class="wl-card-desc">{{ item.description }}</p>
              </div>

              <div class="wl-card-columns">
                <div class="wl-card-col-danger">
                  <span class="wl-card-label">Уровень опасности</span>
                  <div class="wl-danger-bars">
                    <div
                      v-for="d in 5"
                      :key="d"
                      class="wl-danger-seg"
                      :style="{ background: d <= item.dangerLevel ? getDangerColor(item.dangerLevel) : 'rgba(148, 163, 184, 0.2)' }"
                    ></div>
                  </div>
                  <span class="wl-danger-text" :style="{ color: getDangerColor(item.dangerLevel) }">
                    {{ item.dangerLevel }}/5
                  </span>
                </div>
                <div class="wl-card-col-factors">
                  <span class="wl-card-label">Факторы разложения</span>
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
                      <span>{{ getFactorIcon(fct.type) }}</span>
                      {{ cleanFactorLabel(fct.label) }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="wl-card-harm" :class="'wl-harm-' + item.harmLevel">
                <span class="wl-card-label" :style="{ color: getHarmTextColor(item.harmLevel) }">
                  Вред для экологии
                </span>
                <p :style="{ color: getHarmTextColor(item.harmLevel) }">{{ item.harmText }}</p>
              </div>

              <div v-if="item.highlight" class="wl-card-highlight">
                <span class="wl-highlight-label">Факт</span>
                <p>{{ item.highlight }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="wl-container wl-cta-section">
      <div class="wl-cta">
        <h2 class="wl-cta-title">Утилизационный сбор - это не налог</h2>
        <p class="wl-cta-text">
          Это плата за время, которое мы воруем у природы.
          Наша задача - превратить 500 лет гниения в 5 минут переработки.
        </p>
        <div class="wl-cta-visual">
          <span class="wl-cta-old">500 лет</span>
          <span class="wl-cta-arrow">-</span>
          <span class="wl-cta-new">5 мин</span>
        </div>
      </div>
    </section>

    <footer class="wl-footer">
      <p>&copy; 2025 ГП Эко Оператор &middot; Кыргызская Республика</p>
    </footer>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600;700;800;900&display=swap');

/* Hybrid premium shell + light timeline exhibit */
.wl {
  font-family: 'Onest', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #ffffff;
  color: #13251f;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

.wl-container {
  max-width: 1180px;
  width: 100%;
  margin: 0 auto;
  padding: 0 24px;
}

.wl-hero {
  padding: 34px 0 18px;
  background: transparent;
  border-bottom: 0;
  text-align: left;
}

.wl-hero-shell {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 240px;
  gap: 34px;
  min-height: 270px;
  overflow: hidden;
  border: 1px solid rgba(195, 213, 204, 0.72);
  border-radius: 28px;
  background: linear-gradient(115deg, rgba(236, 253, 245, 0.96) 0%, rgba(241, 250, 229, 0.92) 50%, rgba(255, 246, 197, 0.9) 100%);
  box-shadow: 0 22px 70px rgba(15, 23, 42, 0.08);
  padding: 42px 46px;
}

.wl-hero-shell::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.62), transparent 36%),
    repeating-linear-gradient(90deg, rgba(15, 118, 110, 0.06) 0 1px, transparent 1px 74px);
  pointer-events: none;
}

.wl-hero-copy {
  position: relative;
  z-index: 1;
  align-self: center;
}

.wl-hero-badge {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  border: 0;
  border-radius: 999px;
  padding: 5px 12px;
  background: #008b7a;
  color: #ffffff;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  box-shadow: none;
  margin-bottom: 16px;
}

.wl-hero-title {
  max-width: 760px;
  font-size: clamp(34px, 5.4vw, 64px);
  font-weight: 900;
  color: #0f172a;
  line-height: 0.98;
  letter-spacing: 0;
  margin: 0 0 20px;
}

.wl-hero-accent {
  background: linear-gradient(90deg, #07866f 0%, #ef9c2f 52%, #f05d43 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.wl-hero-sub {
  max-width: 620px;
  margin: 0;
  color: #365047;
  font-size: 17px;
  font-weight: 500;
}

.wl-hero-orbit {
  position: relative;
  z-index: 1;
  width: min(100%, 220px);
  aspect-ratio: 1;
  align-self: center;
  justify-self: center;
  border: 1px solid rgba(0, 139, 122, 0.22);
  border-radius: 50%;
  background:
    radial-gradient(circle at 50% 50%, rgba(0, 139, 122, 0.24) 0 8px, transparent 9px),
    radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.75) 0 38px, transparent 39px),
    conic-gradient(from 90deg, rgba(0, 139, 122, 0.02), rgba(0, 139, 122, 0.36), rgba(239, 156, 47, 0.32), rgba(240, 93, 67, 0.32), rgba(0, 139, 122, 0.02));
  box-shadow: inset 0 0 40px rgba(255, 255, 255, 0.78);
  animation: wl-orbit 18s linear infinite;
}

.wl-hero-orbit span {
  position: absolute;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #008b7a;
  box-shadow: 0 0 24px rgba(0, 139, 122, 0.48);
}

.wl-hero-orbit span:nth-child(1) { top: 19%; left: 24%; }
.wl-hero-orbit span:nth-child(2) { right: 16%; top: 43%; background: #ef9c2f; }
.wl-hero-orbit span:nth-child(3) { left: 45%; bottom: 13%; background: #f05d43; }

.wl-stats {
  padding: 18px 0 22px;
  border-bottom: 0;
}

.wl-stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.wl-stat {
  min-height: 122px;
  border: 1px solid #e3ebe6;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.86);
  box-shadow: 0 16px 44px rgba(15, 23, 42, 0.05);
  padding: 20px 22px;
  text-align: left;
}

.wl-stat-kicker {
  display: block;
  color: #708078;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.wl-stat-num {
  display: block;
  color: #0f172a;
  font-size: clamp(27px, 4vw, 44px);
  font-weight: 900;
  line-height: 1.2;
  letter-spacing: 0;
  margin-top: 8px;
}

.wl-stat-label {
  display: block;
  color: #5f7068;
  font-size: 13px;
  font-weight: 700;
  margin-top: 4px;
}

.wl-exhibit-section {
  padding: 24px 0 48px;
}

.wl-exhibit {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(180, 213, 198, 0.9);
  border-radius: 28px;
  background:
    radial-gradient(circle at 12% 14%, rgba(20, 184, 166, 0.18), transparent 30%),
    radial-gradient(circle at 92% 18%, rgba(245, 158, 11, 0.15), transparent 28%),
    linear-gradient(140deg, rgba(248, 255, 251, 0.98) 0%, rgba(236, 253, 245, 0.96) 48%, rgba(255, 251, 235, 0.95) 100%);
  box-shadow: 0 30px 84px rgba(15, 23, 42, 0.1);
  color: #10251f;
  padding: 30px;
}

.wl-exhibit-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(15, 118, 110, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(15, 118, 110, 0.08) 1px, transparent 1px);
  background-size: 46px 46px;
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.9), transparent 82%);
  pointer-events: none;
}

.wl-scanline {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 180px;
  transform: skewX(-18deg);
  background: linear-gradient(90deg, transparent, rgba(20, 184, 166, 0.16), transparent);
  animation: wl-scan 7s ease-in-out infinite;
  pointer-events: none;
}

.wl-exhibit-head,
.wl-sensors,
.wl-sensor-detail,
.wl-time-stage,
.wl-filters,
.wl-cards-grid {
  position: relative;
  z-index: 1;
}

.wl-exhibit-head {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  align-items: flex-start;
  margin-bottom: 24px;
}

.wl-module-eyebrow {
  display: block;
  color: #008b7a;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.wl-module-title {
  max-width: 760px;
  margin: 0;
  color: #0f172a;
  font-size: clamp(24px, 3vw, 38px);
  line-height: 1.08;
  letter-spacing: 0;
  font-weight: 900;
}

.wl-live-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 34px;
  padding: 7px 12px;
  border: 1px solid rgba(20, 184, 166, 0.28);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  color: #0f766e;
  font-size: 12px;
  font-weight: 800;
  white-space: nowrap;
}

.wl-live-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #14b8a6;
  box-shadow: 0 0 18px rgba(20, 184, 166, 0.7);
}

.wl-sensors {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.wl-sensor {
  display: grid;
  grid-template-columns: 54px minmax(0, 1fr);
  gap: 12px;
  align-items: center;
  min-height: 96px;
  border: 1px solid rgba(180, 213, 198, 0.78);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.72);
  color: #0f172a;
  font-family: inherit;
  text-align: left;
  padding: 14px;
  cursor: pointer;
  box-shadow: 0 12px 34px rgba(15, 23, 42, 0.05);
  transition: transform 0.25s ease, border-color 0.25s ease, background 0.25s ease;
}

.wl-sensor:hover,
.wl-sensor-active {
  transform: translateY(-2px);
  border-color: rgba(20, 184, 166, 0.62);
  background: rgba(236, 253, 245, 0.92);
}

.wl-sensor-code {
  display: grid;
  place-items: center;
  width: 54px;
  height: 54px;
  border-radius: 16px;
  background:
    radial-gradient(circle, rgba(20, 184, 166, 0.2), transparent 62%),
    #e6fffa;
  color: #0f766e;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.05em;
}

.wl-sensor-title {
  display: block;
  color: #0f172a;
  font-size: 14px;
  font-weight: 850;
  line-height: 1.25;
}

.wl-sensor-summary {
  display: block;
  margin-top: 5px;
  color: #64748b;
  font-size: 12px;
  line-height: 1.35;
}

.wl-sensor-detail {
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr);
  gap: 14px;
  align-items: start;
  margin-top: 12px;
  border: 1px solid rgba(20, 184, 166, 0.24);
  border-radius: 16px;
  background: rgba(240, 253, 250, 0.78);
  padding: 14px 16px;
}

.wl-sensor-detail span {
  display: grid;
  place-items: center;
  height: 34px;
  border-radius: 10px;
  background: rgba(20, 184, 166, 0.12);
  color: #0f766e;
  font-size: 11px;
  font-weight: 900;
}

.wl-sensor-detail p {
  margin: 0;
  color: #475569;
  font-size: 13px;
  line-height: 1.55;
}

.wl-time-stage {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  gap: 18px;
  align-items: stretch;
  margin-top: 18px;
}

.wl-featured {
  display: flex;
  gap: 14px;
  align-items: center;
  min-height: 142px;
  border: 1px solid rgba(20, 184, 166, 0.28);
  border-radius: 22px;
  background:
    linear-gradient(135deg, rgba(20, 184, 166, 0.12), rgba(245, 158, 11, 0.08)),
    rgba(255, 255, 255, 0.7);
  padding: 18px;
}

.wl-featured-code {
  display: grid;
  place-items: center;
  width: 70px;
  height: 70px;
  border-radius: 20px;
  background: #ffffff;
  color: #0f766e;
  font-weight: 950;
  letter-spacing: 0.06em;
  box-shadow: 0 0 32px rgba(94, 234, 212, 0.28);
}

.wl-featured-label {
  display: block;
  color: #64748b;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.wl-featured strong {
  display: block;
  margin-top: 4px;
  color: #0f172a;
  font-size: 20px;
  line-height: 1.15;
}

.wl-featured small {
  display: block;
  margin-top: 7px;
  color: #d97706;
  font-size: 13px;
  font-weight: 850;
}

.wl-timeline-wrap {
  min-height: 142px;
  border: 1px solid rgba(180, 213, 198, 0.72);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.72);
  padding: 26px 22px;
}

.wl-timeline-ruler {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  color: #64748b;
  font-size: 11px;
  font-weight: 850;
  margin-bottom: 24px;
}

.wl-timeline-bar {
  position: relative;
  height: 40px;
  border-radius: 999px;
  overflow: hidden;
  background: linear-gradient(90deg, #16a34a 0%, #14b8a6 24%, #f59e0b 48%, #f97316 70%, #dc2626 100%);
  box-shadow: 0 16px 42px rgba(245, 158, 11, 0.16);
}

.wl-timeline-flow {
  position: absolute;
  inset: 0;
  background:
    repeating-linear-gradient(115deg, transparent 0 18px, rgba(255, 255, 255, 0.16) 18px 19px),
    linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.28), transparent);
  background-size: 160px 100%, 260px 100%;
  animation: wl-flow 5s linear infinite;
}

.wl-timeline-cursor {
  position: absolute;
  top: -10px;
  width: 2px;
  height: 60px;
  border-radius: 2px;
  background: #ffffff;
  box-shadow: 0 0 0 7px rgba(255, 255, 255, 0.34), 0 0 32px rgba(15, 118, 110, 0.45);
  transform: translateX(-1px);
  transition: left 0.45s ease;
}

.wl-filters {
  display: flex;
  gap: 9px;
  padding: 20px 0 18px;
  flex-wrap: wrap;
}

.wl-filter-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 38px;
  padding: 8px 15px;
  border-radius: 999px;
  border: 1px solid rgba(180, 213, 198, 0.82);
  background: rgba(255, 255, 255, 0.78);
  color: #40524a;
  font-family: inherit;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease, color 0.2s ease;
  white-space: nowrap;
}

.wl-filter-pill span {
  display: grid;
  place-items: center;
  min-width: 32px;
  height: 20px;
  border-radius: 999px;
  background: rgba(20, 184, 166, 0.12);
  color: #0f766e;
  font-size: 10px;
  font-weight: 950;
  letter-spacing: 0.04em;
}

.wl-filter-pill:hover,
.wl-filter-active {
  border-color: rgba(20, 184, 166, 0.72);
  background: #008b7a;
  color: #ffffff;
}

.wl-cards-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

.wl-card {
  border: 1px solid rgba(180, 213, 198, 0.72);
  border-radius: 18px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.72);
  transition: border-color 0.25s ease, background 0.25s ease, transform 0.25s ease;
  animation: wl-fadeSlideIn 0.36s ease both;
}

.wl-card:hover,
.wl-card-open {
  transform: translateY(-1px);
  border-color: rgba(20, 184, 166, 0.55);
  background: rgba(255, 255, 255, 0.94);
}

.wl-card-header {
  display: grid;
  grid-template-columns: 46px auto minmax(140px, 1fr) minmax(80px, 170px) auto 18px;
  align-items: center;
  gap: 11px;
  min-height: 70px;
  padding: 11px 16px;
  cursor: pointer;
  user-select: none;
}

.wl-card-header:hover {
  background: transparent;
}

.wl-card-code {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border: 1px solid rgba(20, 184, 166, 0.28);
  border-radius: 14px;
  background: rgba(224, 242, 241, 0.78);
  color: #0f766e;
  font-size: 11px;
  font-weight: 950;
  letter-spacing: 0.04em;
}

.wl-card-badge {
  font-size: 10px;
  font-weight: 850;
  color: #64748b;
  background: rgba(226, 232, 240, 0.74);
  padding: 4px 8px;
  border-radius: 999px;
  letter-spacing: 0.02em;
  white-space: nowrap;
}

.wl-card-name {
  min-width: 0;
  margin: 0;
  color: #0f172a;
  font-size: 15px;
  font-weight: 850;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.wl-card-bar-inline {
  height: 6px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(226, 232, 240, 0.78);
  max-width: none;
}

.wl-card-bar-fill {
  height: 100%;
  border-radius: 999px;
  box-shadow: 0 0 16px currentColor;
  transition: width 0.8s ease;
}

.wl-card-years {
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 0;
  white-space: nowrap;
}

.wl-card-arrow {
  width: 10px;
  height: 10px;
  border-right: 2px solid #64748b;
  border-bottom: 2px solid #64748b;
  transform: rotate(45deg);
}

.wl-arrow-up {
  transform: rotate(225deg);
  border-color: #99f6e4;
}

.wl-card-body {
  padding: 0 18px 18px 75px;
  border-top: 1px solid rgba(180, 213, 198, 0.56);
}

.wl-card-label {
  display: block;
  color: #64748b;
  font-size: 10px;
  letter-spacing: 0.08em;
  font-weight: 900;
  margin-bottom: 8px;
  text-transform: uppercase;
}

.wl-card-desc-section {
  padding-top: 16px;
  margin-bottom: 18px;
}

.wl-card-desc {
  max-width: 860px;
  color: #475569;
  font-size: 13px;
  line-height: 1.65;
  margin: 0;
}

.wl-card-columns {
  display: grid;
  grid-template-columns: minmax(180px, 0.78fr) minmax(0, 1.4fr);
  gap: 18px;
  margin-bottom: 16px;
}

.wl-danger-bars {
  display: flex;
  gap: 5px;
  margin-bottom: 7px;
}

.wl-danger-seg {
  flex: 1;
  height: 9px;
  border-radius: 999px;
  transition: background 0.3s ease;
}

.wl-danger-text {
  font-size: 14px;
  font-weight: 950;
}

.wl-factor-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.wl-factor-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid;
  border-radius: 999px;
  padding: 5px 10px;
  font-size: 11px;
  font-weight: 750;
  line-height: 1.25;
}

.wl-factor-tag span {
  font-size: 9px;
  font-weight: 950;
  letter-spacing: 0.04em;
}

.wl-tag-accel {
  background: rgba(20, 184, 166, 0.1);
  border-color: rgba(20, 184, 166, 0.24);
  color: #0f766e;
}

.wl-tag-slow {
  background: rgba(248, 113, 113, 0.1);
  border-color: rgba(248, 113, 113, 0.22);
  color: #991b1b;
}

.wl-tag-neutral {
  background: rgba(148, 163, 184, 0.1);
  border-color: rgba(148, 163, 184, 0.22);
  color: #475569;
}

.wl-card-harm {
  border: 1px solid;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.7);
  padding: 14px 16px;
  margin-bottom: 12px;
}

.wl-harm-low { border-color: rgba(45, 139, 78, 0.34); }
.wl-harm-medium { border-color: rgba(244, 162, 97, 0.36); }
.wl-harm-high { border-color: rgba(193, 18, 31, 0.38); }

.wl-card-harm p {
  font-size: 13px;
  line-height: 1.6;
  margin: 0;
}

.wl-card-highlight {
  display: grid;
  grid-template-columns: 54px minmax(0, 1fr);
  gap: 12px;
  align-items: start;
  border: 1px solid rgba(217, 119, 6, 0.22);
  border-radius: 16px;
  background: rgba(251, 191, 36, 0.1);
  padding: 14px;
}

.wl-highlight-label {
  display: grid;
  place-items: center;
  height: 28px;
  border-radius: 999px;
  background: rgba(251, 191, 36, 0.18);
  color: #92400e;
  font-size: 10px;
  font-weight: 950;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.wl-card-highlight p {
  color: #92400e;
  font-size: 13px;
  font-weight: 750;
  line-height: 1.6;
  margin: 0;
}

.wl-cta-section {
  padding: 0 0 48px;
}

.wl-cta {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 24px;
  align-items: center;
  border: 1px solid #dce8e1;
  background: #ffffff;
  box-shadow: 0 18px 60px rgba(15, 23, 42, 0.06);
  padding: 36px 40px;
  text-align: left;
}

.wl-cta-title {
  color: #0f172a;
  font-size: clamp(22px, 3vw, 32px);
  font-weight: 900;
  letter-spacing: 0;
  line-height: 1.15;
  margin: 0 0 10px;
}

.wl-cta-text {
  color: #52635b;
  font-size: 16px;
  font-weight: 550;
  line-height: 1.65;
  max-width: 620px;
  margin: 0;
}

.wl-cta-visual {
  display: grid;
  grid-template-columns: auto 38px auto;
  gap: 10px;
  min-width: 260px;
}

.wl-cta-old,
.wl-cta-new {
  display: grid;
  place-items: center;
  min-height: 62px;
  border-radius: 16px;
  padding: 0 18px;
  font-size: 22px;
  font-weight: 950;
  letter-spacing: 0;
}

.wl-cta-old {
  background: #f1f5f9;
  color: #94a3b8;
}

.wl-cta-arrow {
  width: 38px;
  height: 2px;
  background: #14b8a6;
  color: transparent;
  animation: wl-pulse 2s infinite;
}

.wl-cta-new {
  background: #ecfdf5;
  color: #047857;
  box-shadow: inset 0 0 0 1px #bbf7d0;
}

.wl-footer {
  text-align: center;
  padding: 32px 24px;
  border-top: 1px solid #e2e8f0;
  background: #ffffff;
}

.wl-footer p {
  color: #94a3b8;
  font-size: 13px;
  font-weight: 600;
  margin: 0;
}

@keyframes wl-orbit {
  to { transform: rotate(360deg); }
}

@keyframes wl-scan {
  0% { left: -220px; opacity: 0; }
  16% { opacity: 1; }
  58% { opacity: 1; }
  100% { left: calc(100% + 220px); opacity: 0; }
}

@keyframes wl-flow {
  to { background-position: 160px 0, 260px 0; }
}

@keyframes wl-fadeSlideIn {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes wl-bodyFadeIn {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes wl-pulse {
  0%, 100% { opacity: 0.45; transform: scaleX(0.8); }
  50% { opacity: 1; transform: scaleX(1); }
}

@media (max-width: 1024px) {
  .wl-hero-shell {
    grid-template-columns: 1fr;
    padding: 36px;
  }

  .wl-hero-orbit {
    position: absolute;
    right: -42px;
    bottom: -60px;
    width: 190px;
    opacity: 0.72;
  }

  .wl-sensors {
    grid-template-columns: repeat(2, 1fr);
  }

  .wl-time-stage {
    grid-template-columns: 1fr;
  }

  .wl-card-header {
    grid-template-columns: 46px auto minmax(120px, 1fr) auto 18px;
  }

  .wl-card-bar-inline {
    display: none;
  }

  .wl-cta {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .wl-container {
    padding: 0 18px;
  }

  .wl-hero {
    padding: 24px 0 18px;
  }

  .wl-hero-shell {
    min-height: 0;
    border-radius: 22px;
    padding: 28px;
  }

  .wl-hero-sub {
    font-size: 15px;
  }

  .wl-stats-row {
    display: grid;
    grid-template-columns: 1fr;
  }

  .wl-exhibit {
    border-radius: 22px;
    padding: 22px;
  }

  .wl-exhibit-head {
    flex-direction: column;
  }

  .wl-sensors {
    grid-template-columns: 1fr;
  }

  .wl-timeline-ruler {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
  }

  .wl-card-header {
    grid-template-columns: 42px minmax(0, 1fr) auto 16px;
    gap: 9px;
  }

  .wl-card-badge {
    display: none;
  }

  .wl-card-name {
    white-space: normal;
  }

  .wl-card-years {
    font-size: 12px;
  }

  .wl-card-body {
    padding: 0 14px 16px;
  }

  .wl-card-columns {
    grid-template-columns: 1fr;
  }

  .wl-cta {
    padding: 28px;
  }
}

@media (max-width: 480px) {
  .wl-container {
    padding: 0 14px;
  }

  .wl-hero {
    padding-top: 18px;
  }

  .wl-hero-shell {
    padding: 24px 20px;
  }

  .wl-hero-title {
    font-size: 34px;
  }

  .wl-exhibit {
    padding: 16px;
  }

  .wl-featured {
    align-items: flex-start;
  }

  .wl-featured-code {
    width: 54px;
    height: 54px;
    border-radius: 16px;
  }

  .wl-timeline-wrap {
    padding: 18px 14px;
  }

  .wl-card-header {
    grid-template-columns: 38px minmax(0, 1fr) 16px;
  }

  .wl-card-years {
    grid-column: 2 / 3;
  }

  .wl-cta-visual {
    min-width: 0;
    grid-template-columns: 1fr 28px 1fr;
  }
}

</style>
