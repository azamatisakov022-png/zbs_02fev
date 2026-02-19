package kg.eco.operator.controller;

import jakarta.validation.Valid;
import kg.eco.operator.dto.request.NotificationCreateRequest;
import kg.eco.operator.dto.response.CountResponse;
import kg.eco.operator.dto.response.NotificationResponse;
import kg.eco.operator.dto.response.SuccessResponse;
import kg.eco.operator.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * GET /notifications — Уведомления текущего пользователя
     */
    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getAll(
            Authentication auth,
            @RequestParam(required = false) Boolean unreadOnly) {

        return ResponseEntity.ok(notificationService.getAll(auth.getName(), unreadOnly));
    }

    /**
     * POST /notifications — Создать уведомление (для системы/админа)
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'ADMIN')")
    public ResponseEntity<NotificationResponse> create(
            @Valid @RequestBody NotificationCreateRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(notificationService.create(request));
    }

    /**
     * POST /notifications/{id}/read — Пометить как прочитанное
     */
    @PostMapping("/{id}/read")
    public ResponseEntity<SuccessResponse> markAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.markAsRead(id));
    }

    /**
     * POST /notifications/read-all — Прочитать все
     */
    @PostMapping("/read-all")
    public ResponseEntity<SuccessResponse> markAllAsRead(Authentication auth) {
        return ResponseEntity.ok(notificationService.markAllAsRead(auth.getName()));
    }

    /**
     * DELETE /notifications/{id} — Удалить уведомление
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        notificationService.delete(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * GET /notifications/unread-count — Количество непрочитанных
     */
    @GetMapping("/unread-count")
    public ResponseEntity<CountResponse> getUnreadCount(Authentication auth) {
        return ResponseEntity.ok(notificationService.getUnreadCount(auth.getName()));
    }

    /**
     * GET /notifications/by-role/{role} — Уведомления по роли
     */
    @GetMapping("/by-role/{role}")
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'ADMIN')")
    public ResponseEntity<List<NotificationResponse>> getByRole(@PathVariable String role) {
        return ResponseEntity.ok(notificationService.getByRole(role));
    }
}
