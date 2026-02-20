package kg.eco.operator.controller;

import kg.eco.operator.dto.request.ReviewRequest;
import kg.eco.operator.dto.response.PaginatedResponse;
import kg.eco.operator.dto.response.ReportResponse;
import kg.eco.operator.dto.response.SuccessResponse;
import kg.eco.operator.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    /**
     * GET /reports — Список отчётов о переработке (пагинация)
     */
    @GetMapping
    public ResponseEntity<PaginatedResponse<ReportResponse>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        return ResponseEntity.ok(reportService.getReports(page, pageSize));
    }

    /**
     * GET /reports/{id} — Отчёт по ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ReportResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(reportService.getById(id));
    }

    /**
     * POST /reports/{id}/submit — Подать отчёт на рассмотрение
     */
    @PostMapping("/{id}/submit")
    @PreAuthorize("hasRole('BUSINESS')")
    public ResponseEntity<ReportResponse> submit(@PathVariable Long id) {
        return ResponseEntity.ok(reportService.submit(id));
    }

    /**
     * POST /reports/{id}/approve — Одобрить отчёт
     */
    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'EMPLOYEE')")
    public ResponseEntity<ReportResponse> approve(
            @PathVariable Long id,
            @RequestBody(required = false) ReviewRequest request) {
        return ResponseEntity.ok(reportService.approve(id, request != null ? request.getComment() : null));
    }

    /**
     * POST /reports/{id}/reject — Отклонить отчёт
     */
    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'EMPLOYEE')")
    public ResponseEntity<ReportResponse> reject(
            @PathVariable Long id,
            @RequestBody ReviewRequest request) {
        return ResponseEntity.ok(reportService.reject(id, request.getComment()));
    }

    /**
     * POST /reports/{id}/return — Вернуть на доработку
     */
    @PostMapping("/{id}/return")
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'EMPLOYEE')")
    public ResponseEntity<ReportResponse> returnForRevision(
            @PathVariable Long id,
            @RequestBody ReviewRequest request) {
        return ResponseEntity.ok(reportService.returnForRevision(id, request.getComment()));
    }
}
