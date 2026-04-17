# АИС «ГП Эко Оператор»

Система администрирования утилизационного сбора (Кыргызская Республика).

## Структура проекта

```
backend/    — Java 21, Spring Boot 3.5, PostgreSQL 16, MinIO
frontend/   — Vue 3, TypeScript 5.9, Vite 7, Tailwind CSS 4
```

## Команды запуска

```bash
# Инфраструктура (PostgreSQL:5433, MinIO:9002)
docker-compose up -d postgres minio

# Backend (порт 8081 через Docker, 8080 напрямую)
cd backend && mvn spring-boot:run

# Frontend (порт 5173)
cd frontend && npm run dev
```

## Конвенции фронтенда

- **Composition API** — всегда `<script setup lang="ts">`, никогда Options API
- **Stores** — `reactive()` + `computed()` в `stores/`. НЕ Pinia, НЕ Vuex
- **API-клиент** — два Axios-инстанса в `api/client.ts`:
  - `api` — основной, показывает тосты при ошибках
  - `silentApi` — тихий, для фоновых запросов
- **Компоненты** — префикс `App` для UI-kit (`AppButton`, `AppInput`, `AppTable`)
- **i18n** — `vue-i18n`, два языка: `ru` и `ky`. Ключи в `locales/ru.json`, `locales/ky.json`
- **Стили** — Tailwind CSS 4 utility-классы. Кастомная палитра: teal (primary), amber (secondary)
- **Роутинг** — Vue Router 4, `meta: { requiresAuth, role }`, guard в `router/index.ts`

## Конвенции бэкенда

- **Пакет** — `kg.eco.operator`
- **Слои** — `controller/ → service/ → repository/ → entity/`
- **DTO** — разделение `request/` и `response/`, маппинг через MapStruct
- **Безопасность** — JWT (access + refresh), `@PreAuthorize` на методах
- **Миграции** — Flyway, файлы `V1__` ... `V8__` в `resources/db/migration/`
- **События** — Spring Application Events для уведомлений (`event/`)

## 4 роли пользователей

| Роль | Описание | Путь views |
|------|----------|------------|
| `business` | Плательщики сбора | `views/business/` |
| `eco-operator` | Оператор ГП | `views/eco-operator/` |
| `employee` / `ministry` | МПРЭТН | `views/employee/`, `views/ministry/` |
| `admin` | Администратор | `views/admin/` |

## API

- Base URL: `http://localhost:8081/api/v1`
- Спецификация: `swagger.yaml` в корне проекта
- CORS: localhost:5173, localhost:3000

## Важно

- Не редактировать `.env` файлы
- Не редактировать `package-lock.json`, `pom.xml` без явной просьбы
- Есть демо-режим в `authStore` — вход без бэкенда по специальным ИНН
