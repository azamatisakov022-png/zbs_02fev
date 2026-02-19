package kg.eco.operator.controller;

import jakarta.validation.Valid;
import kg.eco.operator.dto.request.*;
import kg.eco.operator.dto.response.*;
import kg.eco.operator.service.AccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    /**
     * GET /accounts — Все лицевые счета
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'EMPLOYEE', 'ADMIN')")
    public ResponseEntity<List<AccountResponse>> getAllAccounts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean hasDebt,
            @RequestParam(required = false) Boolean hasPositiveBalance) {

        return ResponseEntity.ok(accountService.getAllAccounts(search, hasDebt, hasPositiveBalance));
    }

    /**
     * GET /accounts/{companyId} — Лицевой счёт компании
     */
    @GetMapping("/{companyId}")
    public ResponseEntity<AccountResponse> getAccountByCompanyId(@PathVariable Long companyId) {
        return ResponseEntity.ok(accountService.getAccountByCompanyId(companyId));
    }

    /**
     * GET /accounts/{companyId}/transactions — Транзакции лицевого счёта
     */
    @GetMapping("/{companyId}/transactions")
    public ResponseEntity<List<AccountTransactionResponse>> getTransactions(
            @PathVariable Long companyId,
            @RequestParam(required = false) String periodFrom,
            @RequestParam(required = false) String periodTo) {

        return ResponseEntity.ok(accountService.getTransactions(companyId, periodFrom, periodTo));
    }

    /**
     * POST /accounts/{companyId}/charge — Начисление утильсбора
     */
    @PostMapping("/{companyId}/charge")
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'EMPLOYEE', 'ADMIN')")
    public ResponseEntity<SuccessResponse> addCharge(
            @PathVariable Long companyId,
            @Valid @RequestBody ChargeRequest request) {

        accountService.addCharge(companyId, request);
        return ResponseEntity.ok(SuccessResponse.ok("Начислено"));
    }

    /**
     * POST /accounts/{companyId}/payment — Зачисление оплаты
     */
    @PostMapping("/{companyId}/payment")
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'EMPLOYEE', 'ADMIN')")
    public ResponseEntity<SuccessResponse> addPayment(
            @PathVariable Long companyId,
            @Valid @RequestBody AccountPaymentRequest request) {

        accountService.addPayment(companyId, request);
        return ResponseEntity.ok(SuccessResponse.ok("Оплата зачислена"));
    }

    /**
     * POST /accounts/{companyId}/offset — Зачёт через переработку
     */
    @PostMapping("/{companyId}/offset")
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'EMPLOYEE', 'ADMIN')")
    public ResponseEntity<SuccessResponse> addOffset(
            @PathVariable Long companyId,
            @Valid @RequestBody OffsetRequest request) {

        accountService.addOffset(companyId, request);
        return ResponseEntity.ok(SuccessResponse.ok("Зачтено"));
    }

    /**
     * POST /accounts/{companyId}/refund — Запрос на возврат
     */
    @PostMapping("/{companyId}/refund")
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'EMPLOYEE', 'ADMIN')")
    public ResponseEntity<SuccessResponse> requestRefund(
            @PathVariable Long companyId,
            @Valid @RequestBody AccountRefundRequest request) {

        accountService.requestRefund(companyId, request);
        return ResponseEntity.ok(SuccessResponse.ok("Заявка создана"));
    }

    /**
     * POST /accounts/{companyId}/corrections — Создать корректировку
     */
    @PostMapping("/{companyId}/corrections")
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'EMPLOYEE', 'ADMIN')")
    public ResponseEntity<SuccessResponse> addCorrection(
            @PathVariable Long companyId,
            @RequestBody CorrectionCreateRequest request) {

        accountService.addCorrection(companyId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(SuccessResponse.ok("Корректировка создана"));
    }

    /**
     * POST /accounts/corrections/{id}/submit — Подать корректировку
     */
    @PostMapping("/corrections/{id}/submit")
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'EMPLOYEE', 'ADMIN')")
    public ResponseEntity<SuccessResponse> submitCorrection(@PathVariable Long id) {
        accountService.submitCorrection(id);
        return ResponseEntity.ok(SuccessResponse.ok("Подана"));
    }

    /**
     * POST /accounts/corrections/{id}/approve — Одобрить корректировку
     */
    @PostMapping("/corrections/{id}/approve")
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'EMPLOYEE', 'ADMIN')")
    public ResponseEntity<SuccessResponse> approveCorrection(@PathVariable Long id) {
        accountService.approveCorrection(id);
        return ResponseEntity.ok(SuccessResponse.ok("Одобрена"));
    }

    /**
     * POST /accounts/corrections/{id}/reject — Отклонить корректировку
     */
    @PostMapping("/corrections/{id}/reject")
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'EMPLOYEE', 'ADMIN')")
    public ResponseEntity<SuccessResponse> rejectCorrection(
            @PathVariable Long id,
            @RequestBody(required = false) CorrectionRejectRequest request) {

        accountService.rejectCorrection(id, request);
        return ResponseEntity.ok(SuccessResponse.ok("Отклонена"));
    }

    /**
     * GET /accounts/corrections/pending-count — Количество корректировок на рассмотрении
     */
    @GetMapping("/corrections/pending-count")
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'EMPLOYEE', 'ADMIN')")
    public ResponseEntity<CountResponse> getCorrectionsPendingCount() {
        return ResponseEntity.ok(accountService.getCorrectionsPendingCount());
    }

    /**
     * GET /accounts/{companyId}/reconciliation/{calculationId} — Сверка платежей
     */
    @GetMapping("/{companyId}/reconciliation/{calculationId}")
    public ResponseEntity<ReconciliationResponse> getReconciliation(
            @PathVariable Long companyId,
            @PathVariable Long calculationId) {

        return ResponseEntity.ok(accountService.getReconciliation(companyId, calculationId));
    }

    /**
     * GET /accounts/summary — Общая сводка по всем лицевым счетам
     */
    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'EMPLOYEE', 'ADMIN')")
    public ResponseEntity<AccountSummaryResponse> getSummary() {
        return ResponseEntity.ok(accountService.getSummary());
    }
}
