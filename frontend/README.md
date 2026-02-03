# Цифровой реестр отходов МПРЭТН КР

Веб-приложение для управления реестром отходов Министерства природных ресурсов, экологии и технического надзора Кыргызской Республики.

## Стек технологий

- **Vue 3** — фреймворк для построения пользовательского интерфейса
- **Vite** — сборщик проекта
- **TypeScript** — типизация
- **Tailwind CSS v4** — стилизация
- **Vue Router** — маршрутизация

## Установка

```bash
npm install
```

## Запуск в режиме разработки

```bash
npm run dev
```

Приложение будет доступно по адресу: http://localhost:5173

## Сборка для продакшена

```bash
npm run build
```

Собранные файлы будут в папке `dist/`.

## Структура проекта

```
frontend/
├── public/                    # Статические файлы
│   ├── images/               # Изображения
│   │   ├── about/           # Иллюстрации для страницы "О системе"
│   │   ├── features/        # Иконки для секции "Возможности"
│   │   ├── icons/           # Иконки (phone, clock, map-pin)
│   │   ├── social/          # Иконки социальных сетей
│   │   └── strategy/        # Иконки для секции "Стратегия"
│   └── favicon.svg          # Фавикон
│
├── src/
│   ├── components/          # Переиспользуемые компоненты
│   │   ├── icons/          # SVG-иконки как Vue компоненты
│   │   │   ├── IconCheck.vue
│   │   │   ├── IconChevron.vue
│   │   │   ├── IconFacebook.vue
│   │   │   ├── IconInstagram.vue
│   │   │   ├── IconLinkedin.vue
│   │   │   ├── IconTelegram.vue
│   │   │   └── IconYoutube.vue
│   │   │
│   │   ├── layout/         # Компоненты лейаута
│   │   │   ├── TheHeader.vue      # Шапка сайта
│   │   │   ├── TheNavigation.vue  # Навигационное меню
│   │   │   └── TheFooter.vue      # Подвал сайта
│   │   │
│   │   └── sections/       # Секции главной страницы
│   │       ├── HeroSection.vue
│   │       ├── FeaturesSection.vue
│   │       ├── EconomicsSection.vue
│   │       ├── StrategySection.vue
│   │       ├── ROPSection.vue
│   │       └── CTASection.vue
│   │
│   ├── router/             # Маршрутизация
│   │   └── index.ts
│   │
│   ├── views/              # Страницы приложения
│   │   ├── HomeView.vue           # Главная страница
│   │   ├── AboutView.vue          # О системе
│   │   ├── LegislationView.vue    # Законодательство
│   │   ├── LicensesView.vue       # Лицензии
│   │   ├── PublicationsView.vue   # Публикации
│   │   ├── RegistriesView.vue     # Реестры
│   │   ├── CalculatorView.vue     # Калькулятор
│   │   ├── ContestsView.vue       # Конкурсы и гранты
│   │   └── ReceptionPointsView.vue # Пункты приёма
│   │
│   ├── App.vue             # Корневой компонент
│   ├── main.ts             # Точка входа
│   └── style.css           # Глобальные стили + Tailwind
│
├── index.html              # HTML-шаблон
├── package.json            # Зависимости
├── tsconfig.json           # Конфигурация TypeScript
├── vite.config.ts          # Конфигурация Vite
└── tailwind.config.js      # Конфигурация Tailwind CSS
```

## Маршруты

| Путь | Страница | Описание |
|------|----------|----------|
| `/` | HomeView | Главная страница |
| `/about` | AboutView | О системе |
| `/legislation` | LegislationView | Нормативные документы |
| `/licenses` | LicensesView | Реестр лицензий |
| `/publications` | PublicationsView | Новости и публикации |
| `/registries` | RegistriesView | Реестры (плательщики, переработчики, полигоны) |
| `/calculator` | CalculatorView | Калькулятор утилизационного сбора |
| `/contests` | ContestsView | Конкурсы и гранты |
| `/reception-points` | ReceptionPointsView | Пункты приёма отходов |

## Цветовая схема

- **Основной (teal):** `#0e888d`
- **Акцент (orange):** `#fea629`
- **Тёмный текст:** `#415861`
- **Фон секций:** `#f8fafc`

## TODO для разработчика

- [ ] Подключить API для получения данных
- [ ] Реализовать логику калькулятора утилизационного сбора
- [ ] Добавить авторизацию и регистрацию
- [ ] Реализовать фильтрацию и поиск в реестрах
- [ ] Добавить пагинацию для таблиц
- [ ] Интегрировать карту с реальными данными пунктов приёма
