---
name: gen-api
description: Генерация нового API-эндпоинта (Controller + Service + DTO + Repository + Flyway миграция) по конвенциям проекта
---

# Генерация API-эндпоинта

Создай полный набор файлов для нового REST API эндпоинта, следуя конвенциям проекта.

## Аргументы

Пользователь указывает:
- **Название сущности** (например: `Payment`, `License`, `Inspection`)
- **Поля сущности** (опционально — если не указаны, спроси)
- **Роли доступа** (BUSINESS, ECO_OPERATOR, EMPLOYEE, ADMIN)

## Структура файлов для генерации

Все файлы в пакете `kg.eco.operator`:

### 1. Entity — `entity/{Name}.java`
```java
@Entity
@Table(name = "{names}")  // множественное число, snake_case
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
```
- Поля: `id` (Long, @GeneratedValue IDENTITY), указанные поля, `createdAt`, `updatedAt`
- Связи через @ManyToOne/@OneToMany с существующими сущностями (User, Company)

### 2. Repository — `repository/{Name}Repository.java`
```java
public interface {Name}Repository extends JpaRepository<{Name}, Long> {
```
- Добавить findBy-методы по ключевым полям

### 3. DTO Request — `dto/request/{Name}Request.java`
- Валидация: @NotNull, @NotBlank, @Size на всех полях
- Без id, createdAt, updatedAt

### 4. DTO Response — `dto/response/{Name}Response.java`
- Все поля включая id и даты
- Вложенные DTO вместо сырых entity-связей

### 5. Mapper — `dto/mapper/{Name}Mapper.java`
```java
@Mapper(componentModel = "spring")
public interface {Name}Mapper {
    {Name}Response toResponse({Name} entity);
    {Name} toEntity({Name}Request request);
}
```

### 6. Service — `service/{Name}Service.java` + `service/impl/{Name}ServiceImpl.java`
- Интерфейс + реализация
- CRUD методы: create, getById, getAll (с фильтрацией), update, delete
- @Transactional на записи
- Выбрасывать RuntimeException с понятными сообщениями

### 7. Controller — `controller/{Name}Controller.java`
```java
@RestController
@RequestMapping("/api/v1/{names}")  // множественное число, kebab-case
@RequiredArgsConstructor
```
- @PreAuthorize с указанными ролями
- @Valid на @RequestBody
- ResponseEntity для всех методов
- GET (list + byId), POST, PUT, DELETE

### 8. Flyway миграция — `resources/db/migration/V{next}__create_{names}_table.sql`
- Определить следующий номер миграции (текущий максимум — V8)
- CREATE TABLE с правильными типами PostgreSQL
- Внешние ключи с REFERENCES

## Правила

- Именование: entity — PascalCase, таблица — snake_case, endpoint — kebab-case
- Все строки через @Size с максимальной длиной
- Даты — LocalDateTime
- Денежные поля — BigDecimal
- Enum-поля — создать enum в `entity/enums/` + @Enumerated(EnumType.STRING)
- Логирование — через @Slf4j (Lombok)
