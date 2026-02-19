package kg.eco.operator.controller;

import jakarta.validation.Valid;
import kg.eco.operator.dto.request.PayerCommentRequest;
import kg.eco.operator.dto.response.*;
import kg.eco.operator.service.PayerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/payers")
@RequiredArgsConstructor
public class PayerController {

    private final PayerService payerService;

    /**
     * GET /payers — Реестр плательщиков (пагинация, фильтры)
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'EMPLOYEE', 'ADMIN')")
    public ResponseEntity<PaginatedResponse<PayerResponse>> getAll(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String systemStatus,
            @RequestParam(required = false) String settlementStatus) {

        return ResponseEntity.ok(
                payerService.getAll(page, pageSize, search, region, category, systemStatus, settlementStatus));
    }

    /**
     * GET /payers/{id} — Карточка плательщика
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'EMPLOYEE', 'ADMIN')")
    public ResponseEntity<PayerResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(payerService.getById(id));
    }

    /**
     * POST /payers/{id}/comments — Добавить комментарий
     */
    @PostMapping("/{id}/comments")
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'EMPLOYEE', 'ADMIN')")
    public ResponseEntity<SuccessResponse> addComment(
            @PathVariable Long id,
            Authentication auth,
            @Valid @RequestBody PayerCommentRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(payerService.addComment(id, auth.getName(), request));
    }

    /**
     * POST /payers/{id}/documents — Прикрепить документ
     */
    @PostMapping("/{id}/documents")
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'EMPLOYEE', 'ADMIN')")
    public ResponseEntity<SuccessResponse> addDocument(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) String type) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(payerService.addDocument(id, file, type));
    }

    /**
     * GET /payers/stats — Статистика по плательщикам
     */
    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'EMPLOYEE', 'ADMIN')")
    public ResponseEntity<PayerStatsResponse> getStats() {
        return ResponseEntity.ok(payerService.getStats());
    }
}
