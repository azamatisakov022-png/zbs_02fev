package kg.eco.operator.controller;

import kg.eco.operator.dto.request.ReviewRequest;
import kg.eco.operator.dto.response.CountResponse;
import kg.eco.operator.dto.response.DeclarationResponse;
import kg.eco.operator.dto.response.PaginatedResponse;
import kg.eco.operator.service.DeclarationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/declarations")
@RequiredArgsConstructor
public class DeclarationController {

    private final DeclarationService declarationService;

    @GetMapping
    public ResponseEntity<PaginatedResponse<DeclarationResponse>> list(
            Authentication auth,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer year) {
        boolean isBusiness = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_BUSINESS"));
        if (isBusiness) {
            return ResponseEntity.ok(declarationService.getMyDeclarations(auth.getName(), page, pageSize));
        }
        return ResponseEntity.ok(declarationService.getDeclarations(page, pageSize, search, status, year));
    }

    @PostMapping
    public ResponseEntity<DeclarationResponse> create(
            Authentication auth,
            @RequestBody Map<String, Object> body) {
        Integer year = body.get("year") != null ? Integer.parseInt(body.get("year").toString()) : null;
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(declarationService.create(auth.getName(), year));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DeclarationResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(declarationService.getById(id));
    }

    @PostMapping("/{id}/submit-draft")
    public ResponseEntity<DeclarationResponse> submitDraft(@PathVariable Long id) {
        return ResponseEntity.ok(declarationService.submitDraft(id));
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<DeclarationResponse> submit(@PathVariable Long id) {
        return ResponseEntity.ok(declarationService.submit(id));
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'EMPLOYEE')")
    public ResponseEntity<DeclarationResponse> approve(
            @PathVariable Long id,
            @RequestBody(required = false) ReviewRequest request) {
        return ResponseEntity.ok(declarationService.approve(id, request != null ? request.getComment() : null));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'EMPLOYEE')")
    public ResponseEntity<DeclarationResponse> reject(
            @PathVariable Long id,
            @RequestBody ReviewRequest request) {
        return ResponseEntity.ok(declarationService.reject(id, request.getComment()));
    }

    @PostMapping("/{id}/return")
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'EMPLOYEE')")
    public ResponseEntity<DeclarationResponse> returnForRevision(
            @PathVariable Long id,
            @RequestBody ReviewRequest request) {
        return ResponseEntity.ok(declarationService.returnForRevision(id, request.getComment()));
    }

    @PostMapping("/{id}/resubmit")
    public ResponseEntity<DeclarationResponse> resubmit(@PathVariable Long id) {
        return ResponseEntity.ok(declarationService.resubmit(id));
    }

    @GetMapping("/pending-count")
    public ResponseEntity<CountResponse> getPendingCount() {
        return ResponseEntity.ok(new CountResponse(declarationService.getPendingCount()));
    }

    @GetMapping("/by-company/{companyId}")
    public ResponseEntity<List<DeclarationResponse>> getByCompany(@PathVariable Long companyId) {
        return ResponseEntity.ok(declarationService.getByCompany(companyId));
    }
}
