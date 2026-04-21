package kg.eco.operator.controller;

import kg.eco.operator.dto.response.LicenseResponse;
import kg.eco.operator.entity.enums.LicenseType;
import kg.eco.operator.service.LicenseService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * Эндпоинты реестра выданных лицензий.
 *   /licenses                                — список (EMPLOYEE, MINISTRY, ADMIN, ECO_OPERATOR)
 *   /licenses/{id}                           — детали (EMPLOYEE, MINISTRY, ADMIN, ECO_OPERATOR)
 *   /licenses/{id}/visibility                — управление публикацией/отзывом (только МПРЭТН)
 *   /licenses/export.csv                     — выгрузка реестра (все роли с доступом к реестру)
 *
 * ЭкоОператор имеет read-only доступ для проверки лицензий у переработчиков,
 * с которыми взаимодействуют его клиенты.
 */
@RestController
@RequestMapping("/licenses")
@RequiredArgsConstructor
public class LicenseController {

    private final LicenseService licenseService;

    @GetMapping
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MINISTRY', 'ADMIN', 'ECO_OPERATOR')")
    public ResponseEntity<List<LicenseResponse>> list(
            @RequestParam(required = false) LicenseType licenseType) {
        return ResponseEntity.ok(licenseService.listAll(licenseType));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MINISTRY', 'ADMIN', 'ECO_OPERATOR')")
    public ResponseEntity<LicenseResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(licenseService.getById(id));
    }

    @PatchMapping("/{id}/visibility")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MINISTRY', 'ADMIN')")
    public ResponseEntity<LicenseResponse> updateVisibility(
            @PathVariable Long id,
            @RequestBody VisibilityUpdateRequest request,
            Authentication auth) {
        return ResponseEntity.ok(licenseService.updateVisibility(
                id, request.getIsPublished(), request.getIsRevoked(),
                request.getRevocationReason(), auth.getName()));
    }

    @GetMapping("/export.csv")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MINISTRY', 'ADMIN', 'ECO_OPERATOR')")
    public ResponseEntity<byte[]> exportCsv(@RequestParam(required = false) LicenseType licenseType) {
        byte[] bytes = licenseService.exportCsv(licenseType);
        String filename = "licenses-registry.csv";
        String encoded = URLEncoder.encode(filename, StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + filename + "\"; filename*=UTF-8''" + encoded)
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(bytes);
    }

    // ─── Загрузка и скачивание электронной копии подписанной лицензии ───

    @PostMapping(value = "/{id}/document", consumes = "multipart/form-data")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MINISTRY', 'ADMIN')")
    public ResponseEntity<LicenseResponse> uploadDocument(
            @PathVariable Long id,
            @RequestPart("file") MultipartFile file,
            Authentication auth) {
        return ResponseEntity.ok(licenseService.uploadDocument(id, file, auth.getName()));
    }

    @GetMapping("/{id}/document")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<InputStreamResource> downloadDocument(
            @PathVariable Long id,
            Authentication auth) {
        var result = licenseService.downloadDocument(id, auth.getName());
        String filename = result.fileName();
        String encoded = URLEncoder.encode(filename, StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + filename + "\"; filename*=UTF-8''" + encoded)
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(new InputStreamResource(result.stream()));
    }

    @Data
    public static class VisibilityUpdateRequest {
        private Boolean isPublished;
        private Boolean isRevoked;
        private String revocationReason;
    }
}
