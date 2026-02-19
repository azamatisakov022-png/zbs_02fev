# АИС «ГП Эко Оператор» — Backend API

REST API для автоматизированной информационной системы управления утилизационным сбором
Кыргызской Республики.

## Технологии

- **Java 21**, **Spring Boot 3.5**
- **Spring Security** — JWT (access + refresh tokens), ролевая модель
- **Spring Data JPA** + **PostgreSQL 16**
- **Flyway** — миграции БД (V1–V5)
- **MinIO** — хранение файлов (S3-совместимое)
- **Apache POI** — экспорт Excel-отчётов
- **MapStruct** — маппинг DTO ↔ Entity
- **Lombok**

---

## Быстрый старт

### Вариант 1: Docker Compose (рекомендуется)

```bash
# Из корня проекта (где docker-compose.yml)
docker compose up -d
```

Это поднимет 3 сервиса:

| Сервис | URL | Логин / Пароль |
|---|---|---|
| **Backend API** | http://localhost:8080/api/v1 | — |
| **PostgreSQL** | localhost:5432 | `eco` / `eco123` |
| **MinIO Console** | http://localhost:9001 | `minioadmin` / `minioadmin` |
| **MinIO API** | http://localhost:9000 | `minioadmin` / `minioadmin` |

### Вариант 2: Локальный запуск

1. Создайте базу данных PostgreSQL:

```sql
CREATE USER eco WITH PASSWORD 'eco123';
CREATE DATABASE eco_operator OWNER eco;
```

2. Запустите MinIO (опционально):

```bash
docker run -d --name minio -p 9000:9000 -p 9001:9001 \
  minio/minio server /data --console-address ":9001"
```

3. Запустите приложение:

```bash
cd backend
mvn spring-boot:run
```

---

## Переменные окружения

| Переменная | По умолчанию | Описание |
|---|---|---|
| `DB_USERNAME` | `eco` | Пользователь PostgreSQL |
| `DB_PASSWORD` | `eco123` | Пароль PostgreSQL |
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://localhost:5432/eco_operator` | JDBC URL |
| `JWT_SECRET` | (dev default) | Секрет для подписи JWT-токенов |
| `MINIO_ENDPOINT` | `http://localhost:9000` | Адрес MinIO |
| `MINIO_ACCESS_KEY` | `minioadmin` | MinIO access key |
| `MINIO_SECRET_KEY` | `minioadmin` | MinIO secret key |
| `MINIO_BUCKET` | `eco-operator` | Имя бакета MinIO |

---

## Тестовые пользователи

При первом запуске Flyway создаёт 5 тестовых пользователей.
**Пароль для всех: `test123`**

| ИНН (логин) | Роль | Компания |
|---|---|---|
| `02312200210134` | `BUSINESS` | ОсОО "Бишкек Трейд" |
| `01234500010001` | `ECO_OPERATOR` | ГП "Эко Оператор" |
| `00100100010001` | `MINISTRY` | МПРЭТН КР |
| `00000000000001` | `ADMIN` | Системный администратор |
| `01234500010002` | `EMPLOYEE` | ГП "Эко Оператор" (филиал) |

### Пример авторизации

```bash
# Логин
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"inn": "00000000000001", "password": "test123"}'

# Ответ: { "accessToken": "eyJ...", "refreshToken": "..." }

# Использование токена
curl http://localhost:8080/api/v1/admin/users \
  -H "Authorization: Bearer <accessToken>"
```

---

## API Модули (13 контроллеров)

| Модуль | Базовый путь | Эндпоинтов | Описание |
|---|---|---|---|
| Auth | `/auth` | 3 | Регистрация, логин, refresh token |
| Calculations | `/calculations` | ~10 | Расчёты утилизационного сбора |
| Accounts | `/accounts` | 14 | Лицевые счета, транзакции |
| Payers | `/payers` | 5 | Реестр плательщиков |
| Recyclers | `/recyclers` | 9 | Реестр переработчиков |
| Refunds | `/refunds` | 6 | Заявки на возврат |
| Notifications | `/notifications` | 7 | Уведомления |
| Landfills | `/landfills` | 9 | Полигоны ТБО |
| Dumps | `/dumps` | 7 | Несанкционированные свалки |
| Collection Points | `/collection-points` | 7 | Пункты приёма |
| Analytics | `/analytics` | 5 | Аналитика, отчёты, Excel-экспорт |
| Admin | `/admin` | 8 | Ставки, нормативы, настройки |
| Public | `/public` | 6 | Публичные эндпоинты (без авторизации) |

### Публичные эндпоинты (без авторизации)

```
POST /api/v1/public/calculator        — Калькулятор утилизационного сбора
GET  /api/v1/public/recyclers          — Реестр переработчиков
GET  /api/v1/public/landfills          — Реестр полигонов
GET  /api/v1/public/collection-points  — Пункты приёма
GET  /api/v1/public/rates              — Ставки по ПКМ №730
GET  /api/v1/public/faq                — Часто задаваемые вопросы
```

---

## Сборка

```bash
cd backend
mvn clean package -DskipTests
java -jar target/eco-operator-1.0.0-SNAPSHOT.jar
```

## Структура проекта

```
backend/
├── src/main/java/kg/eco/operator/
│   ├── config/          — SecurityConfig, MinioConfig, CorsConfig
│   ├── controller/      — 13 REST-контроллеров
│   ├── dto/
│   │   ├── request/     — Request DTO
│   │   ├── response/    — Response DTO
│   │   └── mapper/      — MapStruct-маpперы
│   ├── entity/          — JPA-сущности
│   │   └── enums/       — Перечисления
│   ├── event/           — Spring Events (авто-уведомления)
│   ├── repository/      — Spring Data JPA репозитории
│   ├── security/        — JWT filter, UserDetailsService
│   └── service/
│       └── impl/        — Реализация сервисов
├── src/main/resources/
│   ├── application.yml  — Конфигурация
│   └── db/migration/    — Flyway-миграции (V1–V5)
├── Dockerfile           — Multi-stage build
└── pom.xml
```
