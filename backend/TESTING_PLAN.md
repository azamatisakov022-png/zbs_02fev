# План тестирования бэкенда

## Что такое тесты и зачем они нужны

Тесты — это код, который проверяет что твой код работает правильно. Вместо того чтобы каждый раз запускать приложение и вручную кликать — ты пишешь тест один раз, и он проверяет всё автоматически за секунды.

**Запуск всех тестов:**
```bash
./gradlew test
```

**Запуск одного теста:**
```bash
./gradlew test --tests "kg.eco.operator.service.AuthServiceTest"
```

---

## Структура файлов

Тесты лежат в `src/test/java/` — зеркально к основному коду:

```
backend/src/test/java/kg/eco/operator/
├── service/              ← тесты сервисов (основные)
│   ├── AuthServiceTest.java
│   ├── CalculationServiceTest.java
│   └── ...
├── controller/           ← тесты контроллеров (API)
│   ├── AuthControllerTest.java
│   └── ...
└── mapper/               ← тесты маппёров
    ├── CalculationMapperTest.java
    └── ...
```

---

## Этап 1: Сервисы (самое важное)

Сервис — это где живёт бизнес-логика. Тестируем **без запуска приложения**, подставляя моки (заглушки) вместо базы данных.

### Шаблон теста сервиса

```java
package kg.eco.operator.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)   // подключаем Mockito
class AuthServiceTest {

    @Mock                               // заглушка вместо реальной БД
    private UserRepository userRepository;

    @InjectMocks                        // сюда подставятся моки
    private AuthServiceImpl authService;

    @Test
    void login_правильныйПароль_возвращаетТокен() {
        // 1. Подготовка данных
        // 2. Настройка мока
        // 3. Вызов метода
        // 4. Проверка результата
    }

    @Test
    void login_неправильныйПароль_кидаетОшибку() {
        // ...
    }
}
```

### Что тестировать в каждом сервисе

---

### 1. AuthService — авторизация
**Файл:** `AuthServiceTest.java`

| Метод | Что проверить |
|-------|--------------|
| `login()` | Правильный логин/пароль → возвращает токен |
| `login()` | Неправильный пароль → кидает ошибку |
| `login()` | Несуществующий пользователь → кидает ошибку |
| `register()` | Новый пользователь → создаётся, возвращает ответ |
| `register()` | Email уже занят → кидает ошибку |
| `register()` | Пустой email / пароль → кидает ошибку (валидация) |
| `refresh()` | Валидный refresh token → возвращает новый access token |
| `refresh()` | Истёкший refresh token → кидает ошибку |
| `getCurrentUser()` | Авторизованный пользователь → возвращает профиль |

---

### 2. CalculationService — расчёты (самый сложный)
**Файл:** `CalculationServiceTest.java`

| Метод | Что проверить |
|-------|--------------|
| `create()` | Создание черновика → статус DRAFT |
| `create()` | Пустые обязательные поля → ошибка |
| `submit()` | Черновик → статус SUBMITTED |
| `submit()` | Уже отправленный → ошибка (нельзя повторно) |
| `approve()` | Отправленный → статус APPROVED |
| `approve()` | Черновик → ошибка (нельзя одобрить черновик) |
| `reject()` | Отправленный + причина → статус REJECTED |
| `reject()` | Без причины → ошибка |
| `deleteDraft()` | Черновик → удаляется |
| `deleteDraft()` | Не черновик → ошибка (нельзя удалить отправленный) |
| `calculatePenalty()` | Просроченный платёж → правильная сумма пени |
| `calculatePenalty()` | Не просроченный → пеня = 0 |
| `copy()` | Существующий расчёт → новый черновик с теми же данными |
| `getById()` | Существующий id → возвращает расчёт |
| `getById()` | Несуществующий id → ошибка 404 |

---

### 3. AccountService — лицевые счета
**Файл:** `AccountServiceTest.java`

| Метод | Что проверить |
|-------|--------------|
| `getAccountByInn()` | Существующий ИНН → возвращает счёт |
| `getAccountByInn()` | Несуществующий ИНН → ошибка |
| `addCharge()` | Начисление → баланс увеличивается, транзакция создаётся |
| `addCharge()` | Отрицательная сумма → ошибка |
| `addPayment()` | Оплата → баланс уменьшается |
| `addPayment()` | Сумма больше долга → ошибка или переплата |
| `addOffset()` | Взаимозачёт → обе стороны обновляются |
| `requestRefund()` | Есть переплата → заявка создаётся |
| `getTransactions()` | Есть транзакции → возвращает список |
| `getTransactions()` | Нет транзакций → пустой список (не ошибка!) |
| `getSummary()` | Возвращает итоги (начисления, оплаты, баланс) |

---

### 4. DeclarationService — декларации
**Файл:** `DeclarationServiceTest.java`

| Метод | Что проверить |
|-------|--------------|
| `create()` | Создание → статус DRAFT |
| `submit()` | Черновик → SUBMITTED |
| `submit()` | Уже отправленная → ошибка |
| `approve()` | Отправленная → APPROVED |
| `reject()` | Отправленная + причина → REJECTED |
| `returnForRevision()` | Отправленная → RETURNED |
| `resubmit()` | Возвращённая → SUBMITTED (повторная отправка) |
| `getMyDeclarations()` | Текущий пользователь → его декларации |
| `getByCompany()` | Компания → все её декларации |

---

### 5. ReportService — отчёты по переработке
**Файл:** `ReportServiceTest.java`

Тот же workflow что и декларации:

| Метод | Что проверить |
|-------|--------------|
| `create()` | Создание → статус DRAFT |
| `submit()` | DRAFT → SUBMITTED |
| `approve()` | SUBMITTED → APPROVED |
| `reject()` | SUBMITTED → REJECTED |
| `returnForRevision()` | SUBMITTED → RETURNED |
| `getMyReports()` | Возвращает отчёты текущего пользователя |

---

### 6. RecyclerService — переработчики
**Файл:** `RecyclerServiceTest.java`

| Метод | Что проверить |
|-------|--------------|
| `create()` | Создание → сохраняется в БД |
| `getById()` | Существующий → возвращает |
| `getById()` | Несуществующий → ошибка |
| `update()` | Обновление → данные меняются |
| `toggleStatus()` | ACTIVE → INACTIVE и обратно |
| `getActive()` | Возвращает только активных |
| `getStats()` | Считает правильную статистику |

---

### 7. PayerService — плательщики
**Файл:** `PayerServiceTest.java`

| Метод | Что проверить |
|-------|--------------|
| `getAll()` | Есть данные → возвращает список с пагинацией |
| `getById()` | Существующий → возвращает |
| `getById()` | Несуществующий → ошибка |
| `addComment()` | Комментарий → сохраняется |
| `addDocument()` | Документ → сохраняется |
| `getStats()` | Статистика считается правильно |

---

### 8. RefundService — возвраты
**Файл:** `RefundServiceTest.java`

| Метод | Что проверить |
|-------|--------------|
| `create()` | Создание → статус PENDING |
| `approve()` | PENDING → APPROVED, деньги возвращаются |
| `reject()` | PENDING → REJECTED |
| `reject()` | Уже одобренный → ошибка |
| `getPendingCount()` | Считает только ожидающие |

---

### 9. NotificationService — уведомления
**Файл:** `NotificationServiceTest.java`

| Метод | Что проверить |
|-------|--------------|
| `create()` | Создание → сохраняется |
| `markAsRead()` | Непрочитанное → прочитанное |
| `markAsRead()` | Уже прочитанное → ничего не ломается |
| `markAllAsRead()` | Все непрочитанные → прочитанные |
| `delete()` | Удаляется |
| `getUnreadCount()` | Считает только непрочитанные |

---

### 10. Остальные сервисы

| Сервис | Файл | Основные проверки |
|--------|-------|-------------------|
| LandfillService | `LandfillServiceTest.java` | CRUD + фильтрация по региону/типу/статусу |
| DumpService | `DumpServiceTest.java` | CRUD + фильтрация по региону/статусу |
| CollectionPointService | `CollectionPointServiceTest.java` | CRUD + фильтрация по региону |
| PublicService | `PublicServiceTest.java` | Все публичные методы без авторизации |
| AnalyticsService | `AnalyticsServiceTest.java` | Агрегация данных, правильные суммы |
| AdminService | `AdminServiceTest.java` | CRUD настроек, шаблонов, ставок |
| FileStorageService | `FileStorageServiceTest.java` | Upload/download + защита от path traversal |

---

## Этап 2: Маппёры

Маппёры преобразуют Entity → DTO. Тесты простые — создаёшь Entity, вызываешь маппёр, проверяешь что поля правильно переложились.

**Файлы для тестов:**

| Маппёр | Что проверить |
|--------|--------------|
| `AccountMapper` | Entity → Response: все поля на месте |
| `CalculationMapper` | Entity → Response: статус, суммы, items |
| `CollectionPointMapper` | Entity → Response: координаты, адрес |
| `DumpMapper` | Entity → Response |
| `LandfillMapper` | Entity → Response |
| `NotificationMapper` | Entity → Response |
| `PayerMapper` | Entity → Response |
| `RecyclerMapper` | Entity → Response |
| `RefundMapper` | Entity → Response: items, суммы |

### Шаблон теста маппёра

```java
@Test
void toResponse_всеПоляЗаполнены_маппитПравильно() {
    // Создаём Entity
    Calculation entity = new Calculation();
    entity.setId(1L);
    entity.setStatus(CalculationStatus.DRAFT);
    entity.setTotalAmount(BigDecimal.valueOf(5000));

    // Вызываем маппёр
    CalculationResponse response = calculationMapper.toResponse(entity);

    // Проверяем
    assertEquals(1L, response.getId());
    assertEquals("DRAFT", response.getStatus());
    assertEquals(BigDecimal.valueOf(5000), response.getTotalAmount());
}

@Test
void toResponse_nullПоля_неПадает() {
    Calculation entity = new Calculation();
    // Не заполняем поля

    // Не должен кинуть NullPointerException
    assertDoesNotThrow(() -> calculationMapper.toResponse(entity));
}
```

---

## Этап 3: Контроллеры (API тесты)

Контроллеры проверяем через `MockMvc` — он имитирует HTTP-запросы без реального запуска сервера.

### Шаблон теста контроллера

```java
@WebMvcTest(AuthController.class)       // поднимает только контроллер
@AutoConfigureMockMvc(addFilters = false) // отключает security для простоты
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean                             // мок сервиса
    private AuthService authService;

    @Test
    void login_правильныеДанные_возвращает200() throws Exception {
        // Настраиваем мок
        when(authService.login(any())).thenReturn(new LoginResponse("token123"));

        // Отправляем запрос
        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"test@test.com\",\"password\":\"pass123\"}"))
            .andExpect(status().isOk())                    // статус 200
            .andExpect(jsonPath("$.token").value("token123")); // есть токен
    }

    @Test
    void login_пустойEmail_возвращает400() throws Exception {
        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"\",\"password\":\"pass123\"}"))
            .andExpect(status().isBadRequest());           // статус 400
    }
}
```

### Что тестировать в каждом контроллере

| Контроллер | Эндпоинты | Приоритет |
|-----------|-----------|-----------|
| `AuthController` | POST /login, POST /register, POST /refresh, GET /me | Высокий |
| `CalculationController` | CRUD + workflow (submit/approve/reject) | Высокий |
| `AccountController` | Начисления, оплаты, баланс | Высокий |
| `DeclarationController` | CRUD + workflow | Средний |
| `ReportController` | CRUD + workflow | Средний |
| `PayerController` | GET список, GET по id | Средний |
| `RecyclerController` | CRUD + toggle status | Средний |
| `RefundController` | CRUD + approve/reject | Средний |
| `PublicController` | Все GET (без авторизации) | Средний |
| `NotificationController` | CRUD + mark as read | Низкий |
| `LandfillController` | CRUD + фильтры | Низкий |
| `DumpController` | CRUD + фильтры | Низкий |
| `CollectionPointController` | CRUD + фильтры | Низкий |
| `AdminController` | Настройки, ставки | Низкий |
| `AnalyticsController` | GET аналитика | Низкий |
| `GisController` | GET объекты карты | Низкий |

---

## Порядок работы

### Неделя 1 — Базовые сервисы
- [ ] `AuthServiceTest` — 9 тестов
- [ ] `CalculationServiceTest` — 15 тестов
- [ ] `AccountServiceTest` — 11 тестов

### Неделя 2 — Workflow сервисы
- [ ] `DeclarationServiceTest` — 9 тестов
- [ ] `ReportServiceTest` — 6 тестов
- [ ] `RefundServiceTest` — 5 тестов
- [ ] `NotificationServiceTest` — 6 тестов

### Неделя 3 — CRUD сервисы + маппёры
- [ ] `RecyclerServiceTest` — 7 тестов
- [ ] `PayerServiceTest` — 6 тестов
- [ ] `LandfillServiceTest`, `DumpServiceTest`, `CollectionPointServiceTest`
- [ ] Все маппёры (9 файлов)

### Неделя 4 — Контроллеры
- [ ] `AuthControllerTest`
- [ ] `CalculationControllerTest`
- [ ] `AccountControllerTest`
- [ ] Остальные по приоритету

---

## Полезные правила

1. **Один тест = одна проверка.** Не пиши тест который проверяет 10 вещей сразу.

2. **Название теста = что он проверяет.** Хорошо: `login_неправильныйПароль_кидаетОшибку()`. Плохо: `test1()`.

3. **Каждый тест независим.** Тесты не должны зависеть друг от друга или от порядка запуска.

4. **Тестируй и ошибки тоже.** Если метод может кинуть ошибку — проверь что он её кидает.

5. **Запускай тесты часто.** После каждого нового теста делай `./gradlew test`. Не накапливай.

6. **Не тестируй геттеры/сеттеры.** Тестируй только логику — то, что может сломаться.

---

## Что гуглить если застрял

- `"JUnit 5 tutorial на русском"` — основы
- `"Mockito примеры на русском"` — как делать моки
- `"Spring Boot MockMvc тестирование"` — тесты контроллеров
- `"assertThrows JUnit 5"` — как проверить что метод кидает ошибку
- `"@WebMvcTest Spring Boot"` — как тестировать контроллер без запуска всего приложения
