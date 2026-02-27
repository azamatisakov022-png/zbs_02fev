# ПОЛНЫЙ АУДИТ СОВМЕСТИМОСТИ ФРОНТЕНДА И БЭКЕНДА

**Дата**: 2026-02-27
**Проект**: АИС «ГП Эко Оператор»
**Swagger**: `_swagger и backend brief/swagger.yaml` (92 роута)
**Backend**: 14 контроллеров, 116 эндпоинтов
**Frontend**: 12 сторов, 61 уникальный API-вызов

---

## 1. ЭНДПОИНТЫ — SWAGGER vs БЭКЕНД

### 1.1 КРИТИЧЕСКОЕ: ОТСУТСТВУЮЩИЕ КОНТРОЛЛЕРЫ

| Модуль | Swagger | Backend | Статус |
|--------|---------|---------|--------|
| **DeclarationController** | 12 роутов | **НЕ СУЩЕСТВУЕТ** | **CRITICAL MISSING** |
| **GisController** | 1 роут (`/gis/objects`) | **НЕ СУЩЕСТВУЕТ** | **CRITICAL MISSING** |

### 1.2 МАРШРУТЫ В SWAGGER БЕЗ РЕАЛИЗАЦИИ В БЭКЕНДЕ

| Swagger путь | HTTP | Backend | Статус |
|---|---|---|---|
| `/declarations` | GET | Нет контроллера | MISSING |
| `/declarations` | POST | Нет контроллера | MISSING |
| `/declarations/{id}` | GET | Нет контроллера | MISSING |
| `/declarations/{id}/submit-draft` | POST | Нет контроллера | MISSING |
| `/declarations/{id}/submit` | POST | Нет контроллера | MISSING |
| `/declarations/{id}/approve` | POST | Нет контроллера | MISSING |
| `/declarations/{id}/reject` | POST | Нет контроллера | MISSING |
| `/declarations/{id}/return` | POST | Нет контроллера | MISSING |
| `/declarations/{id}/resubmit` | POST | Нет контроллера | MISSING |
| `/declarations/pending-count` | GET | Нет контроллера | MISSING |
| `/declarations/by-company/{companyId}` | GET | Нет контроллера | MISSING |
| `/gis/objects` | GET | Нет контроллера | MISSING |
| `/calculations/by-company/{companyId}` | GET | Нет эндпоинта | MISSING |
| `/reports/by-company/{companyId}` | GET | Нет эндпоинта | MISSING |
| `/reports/pending-count` | GET | Нет эндпоинта | MISSING |
| `/accounts/my` | GET | Есть в бэкенде | **NOT IN SWAGGER** |

### 1.3 ЭНДПОИНТЫ В БЭКЕНДЕ БЕЗ ОПИСАНИЯ В SWAGGER

| Backend путь | HTTP | Статус |
|---|---|---|
| `/calculations/{id}` | DELETE | NOT IN SWAGGER |
| `/accounts/my` | GET | NOT IN SWAGGER |
| `/dumps/public` | GET | NOT IN SWAGGER |
| `/collection-points/public` | GET | NOT IN SWAGGER |
| `/landfills/public` | GET | NOT IN SWAGGER |

### 1.4 ПОЛНАЯ ТАБЛИЦА СРАВНЕНИЯ

| Swagger путь | HTTP | Backend путь | Статус |
|---|---|---|---|
| `/auth/login` | POST | `/auth/login` | OK |
| `/auth/register` | POST | `/auth/register` | OK |
| `/auth/refresh` | POST | `/auth/refresh` | OK |
| `/auth/me` | GET | `/auth/me` | OK |
| `/calculations` | GET | `/calculations` | OK |
| `/calculations` | POST | `/calculations` | OK |
| `/calculations/{id}` | GET | `/calculations/{id}` | OK |
| `/calculations/{id}` | PUT | `/calculations/{id}` | OK |
| `/calculations/{id}/submit` | POST | `/calculations/{id}/submit` | OK |
| `/calculations/{id}/approve` | POST | `/calculations/{id}/approve` | OK |
| `/calculations/{id}/reject` | POST | `/calculations/{id}/reject` | OK |
| `/calculations/{id}/resubmit` | POST | `/calculations/{id}/resubmit` | OK |
| `/calculations/{id}/payment` | POST | `/calculations/{id}/payment` | OK |
| `/calculations/{id}/payment/approve` | POST | `/calculations/{id}/payment/approve` | OK |
| `/calculations/{id}/payment/reject` | POST | `/calculations/{id}/payment/reject` | OK |
| `/calculations/{id}/mark-paid` | POST | `/calculations/{id}/mark-paid` | OK |
| `/calculations/{id}/copy` | POST | `/calculations/{id}/copy` | OK |
| `/calculations/{id}/documents` | PUT | `/calculations/{id}/documents` | OK |
| `/calculations/{id}/items` | PUT | `/calculations/{id}/items` | OK |
| `/calculations/pending-count` | GET | `/calculations/pending-count` | OK |
| `/calculations/review-count` | GET | `/calculations/review-count` | OK |
| `/calculations/by-company/{companyId}` | GET | — | **MISSING** |
| `/reports` | GET | `/reports` | OK |
| `/reports` | POST | `/reports` | OK |
| `/reports/{id}/submit` | POST | `/reports/{id}/submit` | OK |
| `/reports/{id}/approve` | POST | `/reports/{id}/approve` | OK |
| `/reports/{id}/reject` | POST | `/reports/{id}/reject` | OK |
| `/reports/{id}/return` | POST | `/reports/{id}/return` | OK |
| `/reports/by-company/{companyId}` | GET | — | **MISSING** |
| `/reports/pending-count` | GET | — | **MISSING** |
| `/accounts` | GET | `/accounts` | OK |
| `/accounts/{companyId}` | GET | `/accounts/{companyId}` | OK |
| `/accounts/{companyId}/transactions` | GET | `/accounts/{companyId}/transactions` | OK |
| `/accounts/{companyId}/charge` | POST | `/accounts/{companyId}/charge` | OK |
| `/accounts/{companyId}/payment` | POST | `/accounts/{companyId}/payment` | OK |
| `/accounts/{companyId}/offset` | POST | `/accounts/{companyId}/offset` | OK |
| `/accounts/{companyId}/refund` | POST | `/accounts/{companyId}/refund` | OK |
| `/accounts/{companyId}/corrections` | POST | `/accounts/{companyId}/corrections` | OK |
| `/accounts/corrections/{id}/submit` | POST | `/accounts/corrections/{id}/submit` | OK |
| `/accounts/corrections/{id}/approve` | POST | `/accounts/corrections/{id}/approve` | OK |
| `/accounts/corrections/{id}/reject` | POST | `/accounts/corrections/{id}/reject` | OK |
| `/accounts/corrections/pending-count` | GET | `/accounts/corrections/pending-count` | OK |
| `/accounts/{companyId}/reconciliation/{calculationId}` | GET | `/accounts/{companyId}/reconciliation/{calculationId}` | OK |
| `/accounts/summary` | GET | `/accounts/summary` | OK |
| `/payers` | GET | `/payers` | OK |
| `/payers/{id}` | GET | `/payers/{id}` | OK |
| `/payers/{id}/comments` | POST | `/payers/{id}/comments` | OK |
| `/payers/{id}/documents` | POST | `/payers/{id}/documents` | OK |
| `/payers/stats` | GET | `/payers/stats` | OK |
| `/recyclers` | GET | `/recyclers` | OK |
| `/recyclers` | POST | `/recyclers` | OK |
| `/recyclers/{id}` | GET | `/recyclers/{id}` | OK |
| `/recyclers/{id}` | PUT | `/recyclers/{id}` | OK |
| `/recyclers/{id}/toggle-status` | POST | `/recyclers/{id}/toggle-status` | OK |
| `/recyclers/active` | GET | `/recyclers/active` | OK |
| `/recyclers/by-group/{wasteGroup}` | GET | `/recyclers/by-group/{wasteGroup}` | OK |
| `/recyclers/stats` | GET | `/recyclers/stats` | OK |
| `/recyclers/capacity/{wasteGroup}` | GET | `/recyclers/capacity/{wasteGroup}` | OK |
| `/refunds` | GET | `/refunds` | OK |
| `/refunds` | POST | `/refunds` | OK |
| `/refunds/{id}` | GET | `/refunds/{id}` | OK |
| `/refunds/{id}/approve` | POST | `/refunds/{id}/approve` | OK |
| `/refunds/{id}/reject` | POST | `/refunds/{id}/reject` | OK |
| `/refunds/pending-count` | GET | `/refunds/pending-count` | OK |
| `/notifications` | GET | `/notifications` | OK |
| `/notifications` | POST | `/notifications` | OK |
| `/notifications/{id}/read` | POST | `/notifications/{id}/read` | OK |
| `/notifications/read-all` | POST | `/notifications/read-all` | OK |
| `/notifications/{id}` | DELETE | `/notifications/{id}` | OK |
| `/notifications/unread-count` | GET | `/notifications/unread-count` | OK |
| `/notifications/by-role/{role}` | GET | `/notifications/by-role/{role}` | OK |
| `/dumps` | GET | `/dumps` | OK |
| `/dumps` | POST | `/dumps` | OK |
| `/dumps/{id}` | GET | `/dumps/{id}` | OK |
| `/dumps/{id}` | PUT | `/dumps/{id}` | OK |
| `/dumps/{id}` | DELETE | `/dumps/{id}` | OK |
| `/dumps/by-region/{region}` | GET | `/dumps/by-region/{region}` | OK |
| `/dumps/by-status/{status}` | GET | `/dumps/by-status/{status}` | OK |
| `/collection-points` | GET | `/collection-points` | OK |
| `/collection-points` | POST | `/collection-points` | OK |
| `/collection-points/{id}` | GET | `/collection-points/{id}` | OK |
| `/collection-points/{id}` | PUT | `/collection-points/{id}` | OK |
| `/collection-points/{id}` | DELETE | `/collection-points/{id}` | OK |
| `/collection-points/by-region/{region}` | GET | `/collection-points/by-region/{region}` | OK |
| `/collection-points/active` | GET | `/collection-points/active` | OK |
| `/landfills` | GET | `/landfills` | OK |
| `/landfills` | POST | `/landfills` | OK |
| `/landfills/{id}` | GET | `/landfills/{id}` | OK |
| `/landfills/{id}` | PUT | `/landfills/{id}` | OK |
| `/landfills/active` | GET | `/landfills/active` | OK |
| `/landfills/by-region/{region}` | GET | `/landfills/by-region/{region}` | OK |
| `/landfills/by-type/{type}` | GET | `/landfills/by-type/{type}` | OK |
| `/landfills/by-status/{status}` | GET | `/landfills/by-status/{status}` | OK |
| `/landfills/stats` | GET | `/landfills/stats` | OK |
| `/gis/objects` | GET | — | **MISSING** |
| `/analytics/summary` | GET | `/analytics/summary` | OK |
| `/analytics/income` | GET | `/analytics/income` | OK |
| `/analytics/recycling` | GET | `/analytics/recycling` | OK |
| `/analytics/regions` | GET | `/analytics/regions` | OK |
| `/analytics/export` | GET | `/analytics/export` | OK |
| `/admin/users` | GET | `/admin/users` | OK |
| `/admin/notification-templates` | GET | `/admin/notification-templates` | OK |
| `/admin/notification-templates` | POST | `/admin/notification-templates` | OK |
| `/admin/rates` | GET | `/admin/rates` | OK |
| `/admin/rates` | PUT | `/admin/rates` | OK |
| `/admin/recycling-norms` | GET | `/admin/recycling-norms` | OK |
| `/admin/settings` | GET | `/admin/settings` | OK |
| `/admin/settings` | PUT | `/admin/settings` | OK |
| `/public/calculator` | POST | `/public/calculator` | OK |
| `/public/recyclers` | GET | `/public/recyclers` | OK |
| `/public/landfills` | GET | `/public/landfills` | OK |
| `/public/collection-points` | GET | `/public/collection-points` | OK |
| `/public/rates` | GET | `/public/rates` | OK |
| `/public/faq` | GET | `/public/faq` | OK |

---

## 2. КРИТИЧЕСКОЕ: ENUM СЕРИАЛИЗАЦИЯ

**Все 25 enum в бэкенде сериализуются как UPPERCASE** (например `DRAFT`, `UNDER_REVIEW`), но swagger и фронтенд ожидают **lowercase** (`draft`, `under_review`).

Ни один enum не имеет `@JsonValue` аннотации. Jackson по умолчанию использует `.name()` — UPPERCASE.

| Enum | Backend значения | Swagger/Frontend ожидает |
|------|-----------------|------------------------|
| CalculationStatus | `DRAFT, SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED, PAID, PARTIALLY_PAID` | `draft, submitted, under_review, approved, rejected, paid, partially_paid` |
| DeclarationStatus | `DRAFT, SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED, REVISION_REQUESTED` | `draft, submitted, under_review, approved, rejected, revision_requested` |
| ReportStatus | `DRAFT, SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED, REVISION_REQUESTED` | `draft, submitted, under_review, approved, rejected, revision_requested` |
| TransactionType | `CHARGE, PAYMENT, OFFSET, REFUND, CORRECTION, PENALTY` | `charge, payment, offset, refund, correction, penalty` |
| DocumentType | `GTD, INVOICE, CONTRACT, ACT, OTHER` | `gtd, invoice, contract, act, other` |
| RoleEnum | `BUSINESS, ECO_OPERATOR, MINISTRY, ADMIN, EMPLOYEE` | `business, eco-operator, ministry, admin, employee, guest` |
| PayerCategory | `IMPORTER, PRODUCER, IMPORTER_PRODUCER` | `importer, producer, importer_producer` |
| RecyclerStatus | `ACTIVE, SUSPENDED, EXCLUDED` | `active, suspended, excluded` |
| SystemStatus | `ACTIVE, SUSPENDED, BLOCKED` | `active, suspended, blocked` |
| SettlementStatus | `SETTLED, DEBT, OVERPAID` | `settled, debt, overpaid` |
| NotificationType | `INFO, WARNING, SUCCESS, ERROR, DEADLINE, STATUS_CHANGE` | `info, warning, success, error, deadline, status_change` |
| PayerSubcategory | `LARGE, MEDIUM, SMALL, MICRO` | `large, medium, small, micro` |
| PaymentMethod | `BANK_TRANSFER, ONLINE, CASH` | `bank_transfer, online, cash` |
| PaymentStatus | `PAID, PARTIALLY_PAID, UNPAID, OVERDUE` | `paid, partially_paid, unpaid, overdue` |
| PaymentConfirmationStatus | `PENDING, CONFIRMED, REJECTED` | `pending, confirmed, rejected` |
| RefundStatus | `PENDING, APPROVED, REJECTED, PROCESSED` | `pending, approved, rejected, processed` |
| RefundReason | `EXPORT, RECYCLING, OVERPAYMENT, ERROR` | `export, recycling, overpayment, error` |
| CollectionPointStatus | `ACTIVE, INACTIVE, PLANNED` | `active, inactive, planned` |
| DumpStatus | `ACTIVE, UNDER_CLEANUP, CLEANED, MONITORING` | `active, under_cleanup, cleaned, monitoring` |
| LandfillStatus | `ACTIVE, CLOSED, PLANNED, RECULTIVATION` | `active, closed, planned, recultivation` |
| LandfillType | `MUNICIPAL, INDUSTRIAL, HAZARDOUS, MIXED` | `municipal, industrial, hazardous, mixed` |
| InspectionStatus | `COMPLIANT, VIOLATIONS_FOUND, REINSPECTION_REQUIRED, NOT_INSPECTED` | `compliant, violations_found, reinspection_required, not_inspected` |
| RecyclerDocumentType | `LICENSE, ECO_PASSPORT, CERTIFICATE, INSPECTION_ACT, OTHER` | `license, eco_passport, certificate, inspection_act, other` |
| ReferenceType | `CALCULATION, PAYMENT, REPORT, REFUND, CORRECTION` | `calculation, payment, report, refund, correction` |
| ReportingStatus | `ACTIVE, OVERDUE, SUSPENDED` | `active, overdue, suspended` |

### Дополнительно: RoleEnum

- Swagger имеет значение `eco-operator` (с дефисом), backend — `ECO_OPERATOR` (с подчёркиванием)
- Swagger имеет значение `guest` — в backend **ОТСУТСТВУЕТ**

---

## 3. RESPONSE DTO — РАСХОЖДЕНИЯ

### 3.1 LoginResponse
| Поле | Swagger | Backend | Статус |
|------|---------|---------|--------|
| token | string | String | OK |
| refreshToken | string | String | OK |
| user | UserProfile | UserProfileResponse | OK (тот же контракт) |
| role | UserRole ref | String | OK |
| expiresAt | date-time | LocalDateTime | OK |

### 3.2 ReportResponse
| Поле | Swagger | Backend | Статус |
|------|---------|---------|--------|
| id | integer | Long | OK |
| number | string | String | OK |
| recyclerId | integer | Long | OK |
| recyclerName | string | String | OK |
| period | string | String | OK |
| items | ProcessingItem[] | ReportItemResponse[] | OK (маппинг) |
| files | UploadedFile[] | — | **MISSING IN BACKEND** |
| history | ReportHistoryEntry[] | — | **MISSING IN BACKEND** |
| status | ReportStatus | String | OK |
| submittedAt | date-time | LocalDateTime | OK |
| createdAt | date-time | LocalDateTime | OK |
| **submitterInn** | — | String | **NOT IN SWAGGER** |
| **updatedAt** | — | LocalDateTime | **NOT IN SWAGGER** |

### 3.3 AccountResponse vs CompanyAccount (swagger)
| Поле | Swagger (CompanyAccount) | Backend (AccountResponse) | Статус |
|------|---------|---------|--------|
| id | integer | Long | OK |
| companyId | integer | Long | OK |
| companyName | string | String | OK |
| companyInn | string | String | OK |
| balance | number | BigDecimal | OK |
| totalCharged | number | BigDecimal | OK |
| totalPaid | number | BigDecimal | OK |
| totalOffset | number | BigDecimal | OK |
| transactions | AccountTransaction[] | AccountTransactionResponse[] | OK |
| lastUpdated | date-time | LocalDateTime | OK |

### 3.4 Notification
| Поле | Swagger | Backend | Статус |
|------|---------|---------|--------|
| referenceType | enum [calculation, declaration, report, refund, inspection] | String | **Backend может вернуть UPPERCASE** |

---

## 4. ФРОНТЕНД СТОРЫ — РАСХОЖДЕНИЯ С БЭКЕНДОМ

### 4.1 Расхождения URL

| Стор | Frontend URL | Backend URL | Статус |
|------|-------------|-------------|--------|
| account | `GET /accounts/corrections` | Нет такого эндпоинта | **MISSING** |
| declarations | `GET /declarations` | Нет DeclarationController | **MISSING** |
| declarations | `POST /declarations` | Нет DeclarationController | **MISSING** |
| declarations | `POST /declarations/{id}/*` | Нет DeclarationController | **MISSING** |

### 4.2 Расхождения полей (Frontend Interface vs Backend DTO)

**calculations.ts → CalculationResponse**:
- Frontend `Calculation.date` ← Backend `createdAt` (маппится)
- Frontend `Calculation.company` ← Backend `companyName` (маппится)
- Frontend `Calculation.inn` ← Backend `companyInn` (маппится)
- Frontend `ProductItem.group` ← Backend `productGroup`
- Frontend `ProductItem.subgroup` ← Backend `productSubgroup`
- Frontend `ProductItem.volume` ← Backend `quantity`
- Frontend `ProductItem.amount` ← Backend `amount`
- Frontend expects `status` as lowercase string (`draft`, `submitted`) — backend sends UPPERCASE

**reports.ts → ReportResponse**:
- Frontend `Report.company` ← Backend `recyclerName`
- Frontend `Report.inn` ← Backend `submitterInn`
- Frontend `Report.year` ← Backend `period`
- Frontend `ProcessingItem.wasteType` ← Backend `wasteGroup`
- Frontend `ProcessingItem.declared` ← Backend `volumeReceived`
- Frontend `ProcessingItem.processed` ← Backend `volumeProcessed`

**notifications.ts → NotificationResponse**:
- Frontend `Notification.read` ← Backend `isRead` (маппится)

### 4.3 API Client (client.ts)
- baseURL: `http://localhost:8081/api/v1` — Backend: port `8080`, context-path `/api/v1`
- **ПОРТ НЕ СОВПАДАЕТ**: Frontend ожидает `8081`, backend слушает на `8080`

---

## 5. ПАГИНАЦИЯ

| Параметр | Swagger | Backend | Статус |
|----------|---------|---------|--------|
| page | query param, default 1 | `@RequestParam int page` default 1 | OK |
| pageSize | query param, default 20 | `@RequestParam int pageSize` default 20 | OK |

**PaginatedResponse** поля:
| Поле | Swagger | Backend | Статус |
|------|---------|---------|--------|
| data | array | `List<T> data` | OK |
| total | integer | `long total` | OK |
| page | integer | `int page` | OK |
| pageSize | integer | `int pageSize` | OK |
| totalPages | integer | `int totalPages` | OK |

Пагинация используется в: GET /calculations, GET /payers, GET /recyclers, GET /reports, GET /declarations (swagger).
Backend: Calculations ✓, Payers ✓, Recyclers ✓, Reports ✓, Declarations — **НЕТ КОНТРОЛЛЕРА**.

---

## 6. ENUM ЗНАЧЕНИЯ — РАСХОЖДЕНИЯ

### Критические расхождения значений:

| Enum | Swagger | Backend | Разница |
|------|---------|---------|---------|
| RoleEnum/UserRole | `eco-operator` (дефис) | `ECO_OPERATOR` (подчёркивание) | **РАЗНЫЕ РАЗДЕЛИТЕЛИ** |
| RoleEnum/UserRole | Включает `guest` | НЕТ `guest` | **ОТСУТСТВУЕТ ЗНАЧЕНИЕ** |

### Case mismatch (ВСЕ ENUM):
Все 25 enum — UPPERCASE в backend vs lowercase в swagger. См. раздел 2.

---

## 7. ИТОГО: КРИТИЧЕСКИЕ РАСХОЖДЕНИЯ

### Блокирующие (фронтенд не работает):

1. **Нет DeclarationController** — весь модуль деклараций нерабочий (12 роутов)
2. **Все enum в UPPERCASE** — фронтенд не может распарсить статусы, типы, роли
3. **Нет GIS Controller** — карта ГИС не работает
4. **Нет /reports/pending-count** — счётчик отчётов не работает
5. **Нет /reports/by-company/{companyId}** — отчёты компании не загружаются
6. **Нет /calculations/by-company/{companyId}** — расчёты компании не загружаются
7. **Порт 8081 vs 8080** — фронтенд не может подключиться к бэкенду

### Важные:
8. ReportResponse не содержит `files` и `history`
9. RoleEnum не имеет значения `guest`
10. UserRole `eco-operator` (с дефисом) не совпадает с `ECO_OPERATOR` (подчёркивание)

---

## 8. ПЛАН ИСПРАВЛЕНИЙ

1. Добавить `@JsonValue` ко всем 25 enum для сериализации в lowercase
2. Добавить `GUEST` в RoleEnum
3. Настроить `eco-operator` маппинг через `@JsonValue("eco-operator")` для ECO_OPERATOR
4. Создать DeclarationController + DeclarationService + DeclarationResponse + DeclarationMapper
5. Создать GisController
6. Добавить эндпоинты: `/reports/pending-count`, `/reports/by-company/{companyId}`, `/calculations/by-company/{companyId}`
7. Добавить поля `files` и `history` в ReportResponse
8. Добавить `/accounts/my` в swagger (уже есть в бэкенде)
