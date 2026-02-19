package kg.eco.operator.controller;

import jakarta.validation.Valid;
import kg.eco.operator.dto.request.RefundCreateRequest;
import kg.eco.operator.dto.request.RefundRejectRequest;
import kg.eco.operator.dto.response.CountResponse;
import kg.eco.operator.dto.response.RefundResponse;
import kg.eco.operator.service.RefundService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/refunds")
@RequiredArgsConstructor
public class RefundController {

    private final RefundService refundService;

    /**
     * GET /refunds — Список заявок на возврат
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'EMPLOYEE', 'ADMIN')")
    public ResponseEntity<List<RefundResponse>> getAll(
            @RequestParam(required = false) String status) {

        return ResponseEntity.ok(refundService.getAll(status));
    }

    /**
     * POST /refunds — Создать заявку на возврат
     */
    @PostMapping
    @PreAuthorize("hasRole('BUSINESS')")
    public ResponseEntity<RefundResponse> create(
            Authentication auth,
            @Valid @RequestBody RefundCreateRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(refundService.create(auth.getName(), request));
    }

    /**
     * GET /refunds/{id} — Заявка по ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<RefundResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(refundService.getById(id));
    }

    /**
     * POST /refunds/{id}/approve — Одобрить возврат
     */
    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'EMPLOYEE', 'ADMIN')")
    public ResponseEntity<RefundResponse> approve(@PathVariable Long id) {
        return ResponseEntity.ok(refundService.approve(id));
    }

    /**
     * POST /refunds/{id}/reject — Отклонить возврат
     */
    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'EMPLOYEE', 'ADMIN')")
    public ResponseEntity<RefundResponse> reject(
            @PathVariable Long id,
            @RequestBody(required = false) RefundRejectRequest request) {

        return ResponseEntity.ok(refundService.reject(id, request));
    }

    /**
     * GET /refunds/pending-count — Количество заявок на рассмотрении
     */
    @GetMapping("/pending-count")
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'EMPLOYEE', 'ADMIN')")
    public ResponseEntity<CountResponse> getPendingCount() {
        return ResponseEntity.ok(refundService.getPendingCount());
    }
}
