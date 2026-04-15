package kg.eco.operator.service;

import kg.eco.operator.entity.AuditLog;
import kg.eco.operator.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/**
 * Централизованный хелпер для записи действий пользователей в audit_log.
 * Используется во всех ServiceImpl при CRUD-операциях над сущностями
 * (полигоны ТБО, переработчики, свалки, пункты приёма).
 *
 * Обязателен для гос-системы — журнал действий требуется по ТЗ Заказчика
 * (МПРЭТН КР).
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AuditLogger {

    private final AuditLogRepository repository;

    /**
     * Записать действие пользователя в audit_log.
     *
     * @param action      Тип действия (CREATE, UPDATE, DELETE, STATUS_CHANGE)
     * @param entityType  Тип сущности (LANDFILL, RECYCLER, DUMP, COLLECTION_POINT)
     * @param entityId    ID сущности
     * @param details     Подробное описание (например: "Создан полигон: Бишкек")
     */
    public void log(String action, String entityType, Long entityId, String details) {
        try {
            AuditLog entry = new AuditLog();
            entry.setAction(action);
            entry.setEntityType(entityType);
            entry.setEntityId(entityId);
            entry.setDetails(details);
            entry.setUserName(currentUserName());
            repository.save(entry);
        } catch (Exception e) {
            // Не ломаем основную операцию из-за ошибки журналирования —
            // только логируем в backend-логи.
            log.warn("Не удалось записать audit_log: action={}, entity={}#{}, error={}",
                    action, entityType, entityId, e.getMessage());
        }
    }

    /** Логин текущего пользователя из SecurityContext, либо "system" если нет. */
    private String currentUserName() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
                return auth.getName();
            }
        } catch (Exception ignored) {
            // ничего, fallback ниже
        }
        return "system";
    }
}
