package kg.eco.operator.controller;

import kg.eco.operator.dto.response.UserProfileResponse;
import kg.eco.operator.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    /**
     * GET /admin/users — Список пользователей системы
     */
    @GetMapping("/users")
    public ResponseEntity<List<UserProfileResponse>> getUsers() {
        return ResponseEntity.ok(adminService.getUsers());
    }

    /**
     * GET /admin/notification-templates — Шаблоны уведомлений
     */
    @GetMapping("/notification-templates")
    public ResponseEntity<List<Map<String, Object>>> getNotificationTemplates() {
        return ResponseEntity.ok(adminService.getNotificationTemplates());
    }

    /**
     * POST /admin/notification-templates — Создать шаблон уведомления
     */
    @PostMapping("/notification-templates")
    public ResponseEntity<Map<String, Object>> createNotificationTemplate(
            @RequestBody Map<String, Object> request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(adminService.createNotificationTemplate(request));
    }

    /**
     * GET /admin/rates — Ставки утилизационного сбора по ПКМ №730
     */
    @GetMapping("/rates")
    public ResponseEntity<List<Map<String, Object>>> getRates() {
        return ResponseEntity.ok(adminService.getRates());
    }

    /**
     * PUT /admin/rates — Обновить ставки
     */
    @PutMapping("/rates")
    public ResponseEntity<Void> updateRates(@RequestBody List<Map<String, Object>> rates) {
        adminService.updateRates(rates);
        return ResponseEntity.ok().build();
    }

    /**
     * GET /admin/recycling-norms — Нормативы переработки по ПКМ №563
     */
    @GetMapping("/recycling-norms")
    public ResponseEntity<List<Map<String, Object>>> getRecyclingNorms() {
        return ResponseEntity.ok(adminService.getRecyclingNorms());
    }

    /**
     * GET /admin/settings — Системные настройки
     */
    @GetMapping("/settings")
    public ResponseEntity<Map<String, Object>> getSettings() {
        return ResponseEntity.ok(adminService.getSettings());
    }

    /**
     * PUT /admin/settings — Обновить настройки
     */
    @PutMapping("/settings")
    public ResponseEntity<Void> updateSettings(@RequestBody Map<String, Object> settings) {
        adminService.updateSettings(settings);
        return ResponseEntity.ok().build();
    }
}
