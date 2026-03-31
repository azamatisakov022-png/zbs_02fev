# АИС «ГП Эко Оператор» — Бриф для бэкенд-разработчика

## 1. О проекте

**АИС «ГП Эко Оператор»** — автоматизированная информационная система управления утилизационными сборами и обращения с отходами в Кыргызской Республике.

**Заказчик:** Министерство природных ресурсов, экологии и технического надзора КР (МПРЭТН)

**Текущее состояние:** Реализован полный фронтенд (Vue 3 + Pinia + TypeScript), задеплоен на Vercel. Бэкенд отсутствует — все данные хранятся в Pinia stores с моковыми записями (~114 записей).

## 2. Что нужно от бэкенда

Создать REST API, который заменит моковые stores. Фронтенд уже написан и ожидает API по спецификации из файла `swagger.yaml` (OpenAPI 3.0, 4105 строк, ~90 эндпоинтов).

## 3. Техническая архитектура

### Фронтенд (уже готов)
- **Фреймворк:** Vue 3 + Composition API
- **State:** Pinia (12 stores, 127 actions)
- **Язык:** TypeScript
- **Роутинг:** Vue Router (92 роута)
- **Деплой:** Vercel
- **Репозиторий:** https://gitlab.com/azamatisakov022-png/zbs_02fev

### Бэкенд (нужно создать)
- REST API (JSON)
- Авторизация: JWT Bearer tokens
- База данных: PostgreSQL (рекомендуется, структура описана в ТЗ раздел 8.2)
- Файловое хранилище: для документов (ГТД, платёжки, акты)

## 4. Роли пользователей (5 основных)

| Роль | Описание | Кол-во роутов |
|------|----------|---------------|
| Business (Плательщик) | Импортёр/производитель, платит утильсбор | 19 |
| Eco-Operator (Эко Оператор) | Администрирует сбор утильсбора | 23 |
| Ministry (МПРЭТН) | Министерство, надзор | 8 |
| Admin | Системный администратор | 14 |
| Employee | Сотрудник Эко Оператора | 10 |
| Guest (публичный) | Без авторизации | 14 |

## 5. Stores → API маппинг

Каждый Pinia store должен стать группой API-эндпоинтов:

### 5.1. calculations.ts → /api/v1/calculations
- **17 actions** (CRUD + workflow одобрения/отклонения + платежи)
- **12 моковых расчётов**
- Типы: DocumentType, CalculationStatus
- Интерфейсы: AttachedDocument, ProductItem, PaymentData, Calculation
- Бизнес-логика: расчёт утильсбора = Ставка × Масса × (1 - Норматив/100)

### 5.2. declarations.ts → /api/v1/declarations
- **9 actions** (CRUD + workflow)
- **6 моковых деклараций**
- Декларация = годовой свод всех расчётов и отчётов плательщика
- Workflow: draft → submitted → under_review → approved/rejected

### 5.3. reports.ts → /api/v1/reports
- **7 actions**
- **5 моковых отчётов**
- Отчёты о переработке от переработчиков
- Содержат позиции: вид отходов, объём принят/переработан, %

### 5.4. account.ts → /api/v1/accounts
- **21 action** (самый большой store)
- **7 лицевых счетов, 1 корректировка**
- Лицевой счёт = аналог налогового лицевого счёта
- Транзакции: начисление, оплата, зачёт, возврат, корректировка, пеня
- Баланс = Кредит - Дебет (отрицательный = задолженность)

### 5.5. payers.ts → /api/v1/payers
- **11 actions**
- **16 моковых плательщиков**
- 14 lookup-объектов (categoryLabels, statusColors и т.д.)
- Категории: импортёр, производитель, импортёр-производитель

### 5.6. recyclers.ts → /api/v1/recyclers
- **18 actions**
- **8 моковых переработчиков**
- Поля по ТЗ п.66-93 (28 полей: лицензия, мощности, инспекции и т.д.)
- Мощности переработки: по каждому виду отходов, тонн/месяц

### 5.7. refunds.ts → /api/v1/refunds
- **5 actions**
- **2 моковых заявки**
- Заявки на возврат утильсбора (экспорт, переработка, переплата, ошибка)

### 5.8. notifications.ts → /api/v1/notifications
- **7 actions**
- **20 моковых уведомлений** (по 5 на роль)
- localStorage-persisted на фронте
- Типы: info, warning, success, error, deadline, status_change

### 5.9. dumps.ts → /api/v1/dumps
- **7 actions**
- **13 моковых свалок**
- Несанкционированные свалки с геокоординатами

### 5.10. collectionPoints.ts → /api/v1/collection-points
- **7 actions**
- **22 моковых пункта приёма**
- Пункты приёма отходов с геокоординатами

### 5.11. landfills.ts → /api/v1/landfills
- **13 actions**
- **9 моковых полигонов**
- Полигоны ТБО: тип, ёмкость, заполненность, инфраструктура, оборудование

### 5.12. toast.ts → (только фронтенд)
- Всплывающие уведомления, бэкенд не нужен

## 6. Ключевая бизнес-логика

### 6.1. Формула расчёта утилизационного сбора
```
Усб = Сус × Мтв × (1 - Нпер/100)

где:
- Сус — ставка утилизационного сбора (сом/тонна) по ПКМ №730
- Мтв — масса товара (тонн)
- Нпер — норматив переработки (%) по ПКМ №322, зависит от года и группы
```

### 6.2. Ставки утилизационного сбора (ПКМ №730)
24 группы товаров/упаковки. Примеры:
- Стиральные машины: 15 000 сом/тонна
- Холодильники: 18 000 сом/тонна
- Мобильные телефоны: 30 000 сом/тонна
- Пластиковая упаковка: 12 000 сом/тонна

### 6.3. Нормативы переработки (ПКМ №322)
Различаются по годам (2025-2030) и группам:
- Группы 1-4: 2025=20%, 2026=30%, 2027=50%, 2028=60%, 2029=70%, 2030=80%
- Группы 5-24: 2025=10%, 2026=20%, 2027=40%, 2028=50%, 2029=70%, 2030=80%

### 6.4. Workflow документов
```
Расчёт: draft → submitted → under_review → approved/rejected → paid
Декларация: draft → submitted → under_review → approved/rejected/revision_requested
Отчёт: draft → submitted → under_review → approved/rejected/revision_requested
Корректировка: pending → approved/rejected
Возврат: pending → approved/rejected → processed
```

### 6.5. Лицевой счёт
- Каждый плательщик имеет лицевой счёт
- Начисления формируются при одобрении расчёта
- Оплата — подтверждение платёжного поручения
- Зачёт — при одобрении отчёта о переработке
- Переплата остаётся на счёте (кредитовое сальдо) для будущих периодов

### 5.13. detectedCompanies.ts → /api/v1/detected-companies

**Модуль выявления компаний через интеграции с ГТС и ГНС.**

Система автоматически находит компании-импортёры (через ГТС — Государственную таможенную службу) и компании-производители (через ГНС — Государственную налоговую службу), которые обязаны платить утилизационный сбор, но ещё не зарегистрированы в системе.

#### Эндпоинты

| Метод | Путь | Роли | Описание |
|-------|------|------|----------|
| GET | `/detected-companies` | ECO_OPERATOR, EMPLOYEE, ADMIN | Список выявленных компаний (пагинация, фильтры: status, source, search) |
| GET | `/detected-companies/{id}` | ECO_OPERATOR, EMPLOYEE, ADMIN | Детальная карточка компании |
| GET | `/detected-companies/stats` | ECO_OPERATOR, EMPLOYEE, ADMIN | Статистика: всего, новых, из ГТС, из ГНС |
| POST | `/detected-companies/{id}/notify` | ECO_OPERATOR, EMPLOYEE, ADMIN | Отправить уведомление компании (статус → `notified`) |
| POST | `/detected-companies/{id}/reject` | ECO_OPERATOR, EMPLOYEE, ADMIN | Отклонить. Body: `{ "reason": "текст" }` |
| POST | `/detected-companies/{id}/assign` | ECO_OPERATOR, ADMIN | Назначить сотрудника. Body: `{ "employeeId": 123 }` |
| POST | `/detected-companies/run-gts-monitoring` | ECO_OPERATOR, ADMIN | Ручной запуск мониторинга ГТС |
| POST | `/detected-companies/run-gns-monitoring` | ECO_OPERATOR, ADMIN | Ручной запуск мониторинга ГНС |

#### Источники данных (source)

| Значение | Описание | Расписание |
|----------|----------|------------|
| `gts` | Государственная таможенная служба — импортёры | Ежедневно в 02:00 |
| `gns` | Государственная налоговая служба — производители | Ежедневно в 03:00 |
| `manual` | Добавлено вручную | — |

#### Workflow статусов

```
new → notified → registration_submitted → under_review → approved
                                                        → rejected
                                                        → revision_requested
```

#### Логика мониторинга ГТС (таможня)
1. Запрашивает таможенные декларации за последние 3 дня из `CustomsServicePort`
2. Для каждого ИНН проверяет: нет ли уже в `detected_companies`
3. Проверяет статус в ГНС — ликвидированные пропускает
4. Получает полные данные компании из ГНС (название, адрес, директор, ОКЭД, ОКПО)
5. Собирает коды ТН ВЭД и суммарную массу из позиций декларации
6. Сохраняет с `source=gts`, `status=new`

#### Логика мониторинга ГНС (налоговая)
1. Запрашивает компании-производители по ОКЭД кодам из `TaxServicePort`
2. Коды ОКЭД производителей: 22.21-22.29, 17.21-17.29, 25.11-25.29, 20.41-20.42, 11.01-11.06, 10.81-10.84, 38.11, 38.21
3. Для каждого ИНН проверяет: нет ли уже в `detected_companies`
4. Ликвидированные пропускает
5. Сохраняет с `source=gns`, `status=new`

#### Ответ мониторинга (run-gts/gns-monitoring)
```json
{
  "success": true,
  "newCompaniesFound": 3,
  "message": "Мониторинг ГТС выполнен. Новых компаний: 3"
}
```

#### Модель данных (таблица detected_companies)

| Поле | Тип | Описание |
|------|-----|----------|
| id | BIGINT PK | Идентификатор |
| inn | VARCHAR(14) NOT NULL | ИНН компании |
| company_name | VARCHAR(500) | Наименование |
| legal_form | VARCHAR(100) | ОПФ (ОсОО, ОАО, ИП...) |
| legal_address | TEXT | Юридический адрес |
| director | VARCHAR(200) | Руководитель |
| phone | VARCHAR(50) | Телефон |
| email | VARCHAR(255) | Email |
| okpo_code | VARCHAR(20) | Код ОКПО |
| oked_codes | TEXT | Коды ОКЭД (через запятую) |
| source | VARCHAR(20) NOT NULL | gts / gns / manual |
| status | VARCHAR(30) NOT NULL | new / notified / registration_submitted / under_review / approved / rejected / revision_requested |
| tnved_codes | TEXT | Коды ТН ВЭД (через запятую, только для ГТС) |
| estimated_mass | DECIMAL(12,3) | Оценочная масса в кг (только для ГТС) |
| gns_status | VARCHAR(20) | Статус в ГНС (active / suspended / liquidated) |
| assigned_employee_id | BIGINT FK → users | Назначенный сотрудник |
| notified_at | TIMESTAMP | Дата отправки уведомления |
| notes | TEXT | Примечания |
| created_at | TIMESTAMP NOT NULL | Дата выявления |
| updated_at | TIMESTAMP NOT NULL | Дата обновления |

#### Интеграции (внешние сервисы)

| Сервис | Порт (интерфейс) | Конфигурация |
|--------|-------------------|--------------|
| ГТС (таможня) | `CustomsServicePort` | `integration.customs-service.base-url` (default: `http://localhost:8091/api/v1`) |
| ГНС (налоговая) | `TaxServicePort` | `integration.tax-service.base-url` (default: `http://localhost:8090/api/v1`) |

#### Доступ по ролям на фронтенде

| Роль | Просмотр списка | Карточка компании | Кнопки мониторинга ГТС/ГНС |
|------|-----------------|-------------------|-----------------------------|
| EMPLOYEE | /employee/detected-companies | /employee/detected-companies/{id} | Нет |
| ECO_OPERATOR | /eco-operator/detected-companies | /eco-operator/detected-companies/{id} | Да |
| ADMIN | (через employee маршрут) | (через employee маршрут) | Да |

#### Swagger UI

После пересборки бэкенда Swagger UI доступен по адресу:
```
http://localhost:8080/api/v1/swagger-ui/index.html
```
Зависимость `springdoc-openapi-starter-webmvc-ui:2.8.4` добавлена в `pom.xml`. Все эндпоинты `DetectedCompanyController` автоматически появятся в Swagger.

---

## 7. Структура БД (из ТЗ раздел 8.2)

Основные таблицы:
- `users` — пользователи системы
- `companies` — организации (плательщики, переработчики)
- `payers` — плательщики утилизационного сбора
- `categories` — 24 категории товаров/упаковки
- `rates` — ставки утильсбора (с историей изменений)
- `recycling_norms` — нормативы переработки по годам
- `declarations` — декларации
- `declaration_items` — позиции деклараций
- `calculations` — расчёты утильсбора
- `calculation_items` — позиции расчётов
- `payments` — платежи
- `reports` — отчёты о переработке
- `report_items` — позиции отчётов
- `accounts` — лицевые счета
- `transactions` — транзакции лицевых счетов
- `recyclers` — переработчики (28 полей по ТЗ п.66-93)
- `recycler_capacities` — мощности переработки
- `landfills` — полигоны ТБО
- `dumps` — несанкционированные свалки
- `collection_points` — пункты приёма
- `notifications` — уведомления
- `notification_templates` — шаблоны (12 штук)
- `documents` — прикреплённые файлы
- `detected_companies` — выявленные компании (мониторинг ГТС/ГНС)
- `audit_log` — журнал аудита

## 8. Файлы проекта

| Файл | Описание |
|------|----------|
| `swagger.yaml` | OpenAPI 3.0 спецификация — ВСЕ эндпоинты, схемы, параметры |
| `ТЗ_ЦРО.pdf` | Техническое задание от Министерства (97 страниц) |
| Фронтенд на GitLab | Все stores, интерфейсы, моковые данные |

## 9. Приоритеты реализации

### Фаза 1 (MVP)
1. Auth (JWT login/register/refresh)
2. Calculations CRUD + workflow
3. Payers CRUD
4. Accounts (начисление, оплата)

### Фаза 2
5. Declarations CRUD + workflow
6. Reports CRUD + workflow
7. Recyclers CRUD
8. Refunds

### Фаза 3
9. Notifications (генерация при событиях)
10. Analytics (агрегация данных)
11. GIS (отдача геоданных)
12. Admin (настройки, ставки, нормативы)
13. Export (Excel/PDF)

### Фаза 4 (интеграции — когда будут API)
14. ЕСИ/Түндүк — единая авторизация
15. ГНС — проверка ИНН
16. Казначейство — подтверждение платежей
17. ЭЦП — электронная подпись
18. Платёжная система — онлайн оплата

## 10. Контакты и ресурсы

- **GitLab (фронтенд):** https://gitlab.com/azamatisakov022-png/zbs_02fev
- **Swagger UI:** загрузить swagger.yaml на https://editor.swagger.io
- **Vercel (демо):** frontend-zeta-five-85.vercel.app
