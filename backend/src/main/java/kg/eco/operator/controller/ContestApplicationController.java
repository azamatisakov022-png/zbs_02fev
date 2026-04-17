package kg.eco.operator.controller;

import jakarta.validation.Valid;
import kg.eco.operator.dto.request.ContestApplicationReviewRequest;
import kg.eco.operator.dto.response.ContestApplicationResponse;
import kg.eco.operator.dto.response.CountResponse;
import kg.eco.operator.service.ContestApplicationService;
import kg.eco.operator.service.ContestService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * Работа с заявками на конкурс — для сотрудников Эко Оператора.
 */
@RestController
@RequestMapping("/contests/applications")
@RequiredArgsConstructor
public class ContestApplicationController {

    private final ContestApplicationService applicationService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'ADMIN')")
    public ResponseEntity<List<ContestApplicationResponse>> getAll(
            @RequestParam(required = false) Long contestId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(applicationService.getAll(contestId, status, search));
    }

    @GetMapping("/pending-count")
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'ADMIN')")
    public ResponseEntity<CountResponse> getPendingCount() {
        return ResponseEntity.ok(applicationService.getPendingCount());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'ADMIN')")
    public ResponseEntity<ContestApplicationResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(applicationService.getById(id));
    }

    @PostMapping("/{id}/review")
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'ADMIN')")
    public ResponseEntity<ContestApplicationResponse> review(
            Authentication auth,
            @PathVariable Long id,
            @Valid @RequestBody ContestApplicationReviewRequest request) {
        return ResponseEntity.ok(applicationService.review(id, auth.getName(), request));
    }

    @GetMapping("/{id}/document")
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'ADMIN')")
    public ResponseEntity<InputStreamResource> downloadDocument(@PathVariable Long id) {
        ContestService.DownloadResult result = applicationService.downloadDocument(id);
        String encoded = URLEncoder.encode(
                result.fileName() != null ? result.fileName() : "document",
                StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(result.contentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename*=UTF-8''" + encoded)
                .body(new InputStreamResource(result.stream()));
    }
}
