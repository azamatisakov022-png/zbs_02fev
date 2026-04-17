package kg.eco.operator.controller;

import jakarta.validation.Valid;
import kg.eco.operator.dto.request.ContestCreateRequest;
import kg.eco.operator.dto.request.ContestUpdateRequest;
import kg.eco.operator.dto.response.ContestResponse;
import kg.eco.operator.service.ContestService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * Управление конкурсами для сотрудников Эко Оператора (CRUD + публикация/закрытие).
 */
@RestController
@RequestMapping("/contests")
@RequiredArgsConstructor
public class ContestController {

    private final ContestService contestService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'ADMIN')")
    public ResponseEntity<List<ContestResponse>> getAll(
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(contestService.getAll(status));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'ADMIN')")
    public ResponseEntity<ContestResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(contestService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'ADMIN')")
    public ResponseEntity<ContestResponse> create(
            Authentication auth,
            @Valid @RequestBody ContestCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(contestService.create(auth.getName(), request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'ADMIN')")
    public ResponseEntity<ContestResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody ContestUpdateRequest request) {
        return ResponseEntity.ok(contestService.update(id, request));
    }

    @PostMapping("/{id}/publish")
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'ADMIN')")
    public ResponseEntity<ContestResponse> publish(@PathVariable Long id) {
        return ResponseEntity.ok(contestService.publish(id));
    }

    @PostMapping("/{id}/close")
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'ADMIN')")
    public ResponseEntity<ContestResponse> close(@PathVariable Long id) {
        return ResponseEntity.ok(contestService.close(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        contestService.delete(id);
        return ResponseEntity.noContent().build();
    }

    /** Загрузка PDF положения конкурса. */
    @PostMapping(value = "/{id}/regulations", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'ADMIN')")
    public ResponseEntity<ContestResponse> uploadRegulations(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(contestService.uploadRegulations(id, file));
    }

    @GetMapping("/{id}/regulations")
    @PreAuthorize("hasAnyRole('ECO_OPERATOR', 'ADMIN')")
    public ResponseEntity<InputStreamResource> downloadRegulations(@PathVariable Long id) {
        ContestService.DownloadResult result = contestService.downloadRegulations(id);
        String encoded = URLEncoder.encode(
                result.fileName() != null ? result.fileName() : "regulations.pdf",
                StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(result.contentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename*=UTF-8''" + encoded)
                .body(new InputStreamResource(result.stream()));
    }
}
