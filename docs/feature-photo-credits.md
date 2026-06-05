# Кредиты фотографий — секция «Основные направления деятельности»

Изображения карточек на главной (`frontend/src/components/sections/FeaturesSection.vue`)
заменены с ИИ-иллюстраций на реальные фотографии из открытых фотобанков.
Все изображения — со свободной лицензией для коммерческого/государственного
использования (атрибуция не обязательна, но указана для прозрачности).

Дата замены: 2026-06-05.

| Файл | Карточка | Источник | Лицензия |
|------|----------|----------|----------|
| `administration.webp` | Администрирование утилизационного сбора | Pexels (фото: Towfiqu barbhuiya) — https://www.pexels.com/photo/green-plant-between-a-pile-of-silver-coins-11391951/ | Pexels License (free commercial, без атрибуции) |
| `infrastructure.webp` | Развитие инфраструктуры обращения с отходами | Pexels (фото: K, Chattanooga) — https://www.pexels.com/photo/aerial-view-of-industrial-recycling-yard-in-chattanooga-29693630/ | Pexels License (free commercial, без атрибуции) |
| `recycling.webp` | Повышение уровня переработки | Pexels — https://www.pexels.com/photo/recycled-plastic-granules-in-hand-outdoors-34286024/ | Pexels License (free commercial, без атрибуции) |
| `education.webp` | Экологическое просвещение | Pexels — https://www.pexels.com/photo/people-hands-on-project-paper-7692755/ | Pexels License (free commercial, без атрибуции) |
| `monitoring.webp` | Мониторинг и контроль эффективности | Unsplash (фото: Vitaly Gariev) — https://unsplash.com/photos/four-people-collaborating-around-a-table-with-charts-M79HJGCKYk0 | Unsplash License (free commercial, без атрибуции) |

## Технические детали
- Источники скачаны как JPEG (ширина 1400px), приведены к единому формату
  **800×500 (cover, центрированный кроп)** и сконвертированы в **WebP** (q=82).
- Прежние ИИ-иллюстрации сохранены рядом как резерв: `*-3d.webp` (можно вернуть,
  поменяв пути в `FeaturesSection.vue`).
- Лицензии Pexels и Unsplash: https://www.pexels.com/license/ ,
  https://unsplash.com/license — обе разрешают коммерческое использование
  без обязательной атрибуции и без отдельного разрешения автора.

---

# Секция «Экономические аспекты» (главная)

Компонент `frontend/src/components/sections/EconomicsSection.vue`.
Дата замены: 2026-06-05.

| Файл | Секция | Источник | Лицензия |
|------|--------|----------|----------|
| `src/assets/images/green-forest-aerial.webp` | Экономические аспекты | Unsplash (фото: CHUTTERSNAP) — https://unsplash.com/photos/aerial-photography-of-green-forest-90fArTCswjQ | Unsplash License (free commercial, без атрибуции) |

- Источник скачан как JPEG (1400px), приведён к **1100×760 (cover, центр)**, WebP (q=72).
- Прежнее фото дерева сохранено как резерв: `src/assets/images/big-tree.jpg`.

---

# Секция «Расширенные обязательства производителей (РОП)» (главная)

Компонент `frontend/src/components/sections/ROPSection.vue`.
Дата локализации: 2026-06-05.

Прежде фото грузилось по удалённому URL `images.unsplash.com/photo-1542601906990-...`
(runtime-зависимость от внешнего сервиса). Локализовано — то же изображение теперь
локальный WebP-ассет.

| Файл | Секция | Источник | Лицензия |
|------|--------|----------|----------|
| `src/assets/images/rop-hands-plant.webp` | Расширенные обязательства производителей | Unsplash (`photo-1542601906990-b4d3fb778b09`) — ладони с ростком | Unsplash License (free commercial, без атрибуции) |

- Источник скачан как JPEG (1400px), приведён к **1100×760 (cover, центр)**, WebP (q=80).

---

# Секция «Стратегия и миссия» — иконки (главная)

Компонент `frontend/src/components/sections/StrategySection.vue`.
Дата замены: 2026-06-05.

3D-«глиняные» иллюстрации (`/images/strategy/*-3d-v2.webp`) заменены на единый
набор векторных иконок **Material Symbols Rounded (Google)** — инлайн-SVG, без
рантайм-зависимостей. Бирюзовый акцент (#0e888d) на мягкой подложке с обводкой.

| Карточка | Иконка (Material Symbols) |
|----------|---------------------------|
| Интегрированная система управления | `hub` |
| Экономическая устойчивость переработки | `savings` |
| Эко-культура населения и бизнеса | `groups` |
| Рост доли переработанных отходов | `trending_up` |
| Снижение объёмов захоронения | `trending_down` |
| Партнёрства государство–бизнес | `handshake` |
| Внедрение эко-инноваций | `lightbulb` |
| Прозрачность и цифровой контроль | `verified_user` |

- **Лицензия:** Material Symbols — Apache License 2.0 (свободно для коммерческого
  и государственного использования). https://github.com/google/material-design-icons
- viewBox исходников: `0 -960 960 960`, один `<path>` на иконку, `fill="currentColor"`.
- Прежние 3D-файлы сохранены как резерв в `/images/strategy/`.
- Почему иконки, а не фото: 8 абстрактных целей в плотной сетке — это паттерн
  «сетка иконок»; фото перегрузили бы страницу и хуже передают абстракции.
  Единый узнаваемый icon-set убирает «ИИ-привкус» 3D-рендеров.
