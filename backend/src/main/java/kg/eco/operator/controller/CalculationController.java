package kg.eco.operator.controller;

import jakarta.validation.Valid;
import kg.eco.operator.dto.request.*;
import kg.eco.operator.dto.response.CalculationResponse;
import kg.eco.operator.dto.response.CountResponse;
import kg.eco.operator.dto.response.PaginatedResponse;
import kg.eco.operator.dto.response.SuccessResponse;
import kg.eco.operator.service.CalculationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/calculations")
@RequiredArgsConstructor
public class CalculationController {

    private final CalculationService calculationService;

    /**
     * GET /calculations — Список расчётов (пагинация, фильтры)
     */
    @GetMapping
    public ResponseEntity<PaginatedResponse<CalculationResponse>> list(
            Authentication auth,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String periodFrom,
            @RequestParam(required = false) String periodTo,
            @RequestParam(required = false) String productGroup) {

        return ResponseEntity.ok(calculationService.getCalculations(
                auth.getName(), page, pageSize, search, status, periodFrom, periodTo, productGroup));
    }

    /**
     * POST /calculations — Создать расчёт (business only)
     */
    @PostMapping
    @PreAuthorize("hasRole('BUSINESS')")
    public ResponseEntity<CalculationResponse> create(
            Authentication auth,
            @Valid @RequestBody CalculationCreateRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(calculationService.create(auth.getName(), request));
    }

    /**
     * GET /calculations/{id} — Получить расчёт по ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<CalculationResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(calculationService.getById(id));
    }

    /**
     * PUT /calculations/{id} — Обновить расчёт (business, draft/rejected)
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('BUSINESS')")
    public ResponseEntity<CalculationResponse> update(
            @PathVariable Long id,
            Authentication auth,
            @Valid @RequestBody CalculationCreateRequest request) {

        return ResponseEntity.ok(calculationService.update(id, auth.getName(), request));
    }

    /**
     * DELETE /calculations/{id} — Удалить черновик
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('BUSINESS')")
    public ResponseEntity<SuccessResponse> delete(@PathVariable Long id, Authentication auth) {
        calculationService.deleteDraft(id, auth.getName());
        return ResponseEntity.ok(SuccessResponse.ok("Расчёт удалён"));
    }

    /**
     * POST /calculations/{id}/submit — Подать на рассмотрение
     */
    @PostMapping("/{id}/submit")
    @PreAuthorize("hasRole('BUSINESS')")
    public ResponseEntity<CalculationResponse> submit(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(calculationService.submit(id, auth.getName()));
    }

    /**
     * POST /calculations/{id}/resubmit — Повторная подача после отклонения
     */
    @PostMapping("/{id}/resubmit")
    @PreAuthorize("hasRole('BUSINESS')")
    public ResponseEntity<CalculationResponse> resubmit(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(calculationService.resubmit(id, auth.getName()));
    }

    /**
     * POST /calculations/{id}/approve — Одобрить расчёт (eco_operator only)
     */
    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'EMPLOYEE')")
    public ResponseEntity<CalculationResponse> approve(
            @PathVariable Long id,
            Authentication auth,
            @RequestBody(required = false) ReviewRequest request) {

        return ResponseEntity.ok(calculationService.approve(id, auth.getName(), request));
    }

    /**
     * POST /calculations/{id}/reject — Отклонить расчёт (eco_operator only)
     */
    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'EMPLOYEE')")
    public ResponseEntity<CalculationResponse> reject(
            @PathVariable Long id,
            Authentication auth,
            @Valid @RequestBody ReviewRequest request) {

        return ResponseEntity.ok(calculationService.reject(id, auth.getName(), request));
    }

    /**
     * POST /calculations/{id}/payment — Добавить платёж (business)
     */
    @PostMapping("/{id}/payment")
    @PreAuthorize("hasRole('BUSINESS')")
    public ResponseEntity<CalculationResponse> submitPayment(
            @PathVariable Long id,
            Authentication auth,
            @ModelAttribute PaymentSubmitRequest request,
            @RequestParam(required = false) MultipartFile paymentDocument) {

        return ResponseEntity.ok(
                calculationService.submitPayment(id, auth.getName(), request, paymentDocument));
    }

    /**
     * POST /calculations/{id}/payment/approve — Подтвердить платёж (eco_operator)
     */
    @PostMapping("/{id}/payment/approve")
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'EMPLOYEE')")
    public ResponseEntity<CalculationResponse> approvePayment(
            @PathVariable Long id, Authentication auth) {

        return ResponseEntity.ok(calculationService.approvePayment(id, auth.getName()));
    }

    /**
     * POST /calculations/{id}/payment/reject — Отклонить платёж (eco_operator)
     */
    @PostMapping("/{id}/payment/reject")
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'EMPLOYEE')")
    public ResponseEntity<CalculationResponse> rejectPayment(
            @PathVariable Long id,
            Authentication auth,
            @RequestBody(required = false) ReviewRequest request) {

        return ResponseEntity.ok(calculationService.rejectPayment(id, auth.getName(), request));
    }

    /**
     * POST /calculations/{id}/mark-paid — Отметить как оплаченный (eco_operator)
     */
    @PostMapping("/{id}/mark-paid")
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'EMPLOYEE')")
    public ResponseEntity<CalculationResponse> markAsPaid(
            @PathVariable Long id, Authentication auth) {

        return ResponseEntity.ok(calculationService.markAsPaid(id, auth.getName()));
    }

    /**
     * POST /calculations/{id}/copy — Копировать расчёт
     */
    @PostMapping("/{id}/copy")
    @PreAuthorize("hasRole('BUSINESS')")
    public ResponseEntity<CalculationResponse> copy(
            @PathVariable Long id, Authentication auth) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(calculationService.copy(id, auth.getName()));
    }

    /**
     * PUT /calculations/{id}/items — Обновить позиции расчёта
     */
    @PutMapping("/{id}/items")
    @PreAuthorize("hasRole('BUSINESS')")
    public ResponseEntity<CalculationResponse> updateItems(
            @PathVariable Long id,
            Authentication auth,
            @Valid @RequestBody UpdateItemsRequest request) {

        return ResponseEntity.ok(calculationService.updateItems(id, auth.getName(), request));
    }

    /**
     * PUT /calculations/{id}/documents — Обновить документы расчёта
     */
    @PutMapping("/{id}/documents")
    @PreAuthorize("hasRole('BUSINESS')")
    public ResponseEntity<SuccessResponse> updateDocuments(
            @PathVariable Long id,
            Authentication auth,
            @RequestParam("files") MultipartFile[] files) {

        calculationService.updateDocuments(id, auth.getName(), files);
        return ResponseEntity.ok(SuccessResponse.ok("Документы обновлены"));
    }

    /**
     * GET /calculations/pending-count — Количество расчётов на рассмотрении
     */
    @GetMapping("/pending-count")
    public ResponseEntity<CountResponse> pendingCount(Authentication auth) {
        return ResponseEntity.ok(new CountResponse(
                calculationService.getPendingCount(auth.getName())));
    }

    /**
     * GET /calculations/review-count — Количество расчётов для проверки
     */
    @GetMapping("/review-count")
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'EMPLOYEE', 'ADMIN')")
    public ResponseEntity<CountResponse> reviewCount() {
        return ResponseEntity.ok(new CountResponse(calculationService.getReviewCount()));
    }
}
