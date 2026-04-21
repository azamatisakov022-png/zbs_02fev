package kg.eco.operator.controller;

import jakarta.validation.Valid;
import kg.eco.operator.dto.request.CreateLicenseApplicationRequest;
import kg.eco.operator.dto.request.SubmitLicenseApplicationRequest;
import kg.eco.operator.dto.response.LicenseApplicationResponse;
import kg.eco.operator.dto.response.PaymentIntentResponse;
import kg.eco.operator.entity.enums.LicenseDocumentType;
import kg.eco.operator.service.LicenseApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Эндпоинты заявок на лицензию для заявителя.
 * Роль: BUSINESS (с business_type = APPLICANT или BOTH).
 */
@RestController
@RequestMapping("/license-applications")
@RequiredArgsConstructor
public class LicenseApplicationController {

    private final LicenseApplicationService applicationService;

    @GetMapping("/my")
    @PreAuthorize("hasRole('BUSINESS')")
    public ResponseEntity<List<LicenseApplicationResponse>> my(Authentication auth) {
        return ResponseEntity.ok(applicationService.getMyApplications(auth.getName()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('BUSINESS')")
    public ResponseEntity<LicenseApplicationResponse> getMy(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(applicationService.getMyApplication(id, auth.getName()));
    }

    @PostMapping
    @PreAuthorize("hasRole('BUSINESS')")
    public ResponseEntity<LicenseApplicationResponse> create(
            @Valid @org.springframework.web.bind.annotation.RequestBody CreateLicenseApplicationRequest request,
            Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(applicationService.createDraft(auth.getName(), request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('BUSINESS')")
    public ResponseEntity<LicenseApplicationResponse> update(
            @PathVariable Long id,
            @Valid @org.springframework.web.bind.annotation.RequestBody CreateLicenseApplicationRequest request,
            Authentication auth) {
        return ResponseEntity.ok(applicationService.updateDraft(id, auth.getName(), request));
    }

    @PostMapping("/{id}/submit")
    @PreAuthorize("hasRole('BUSINESS')")
    public ResponseEntity<PaymentIntentResponse> submit(
            @PathVariable Long id,
            @Valid @org.springframework.web.bind.annotation.RequestBody SubmitLicenseApplicationRequest request,
            Authentication auth) {
        PaymentIntentResponse intent = applicationService.submit(id, auth.getName(), request);
        return ResponseEntity.ok(intent);
    }

    @PostMapping("/{id}/reopen")
    @PreAuthorize("hasRole('BUSINESS')")
    public ResponseEntity<LicenseApplicationResponse> reopen(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(applicationService.reopen(id, auth.getName()));
    }

    @PostMapping(value = "/{id}/documents", consumes = "multipart/form-data")
    @PreAuthorize("hasRole('BUSINESS')")
    public ResponseEntity<LicenseApplicationResponse> uploadDocument(
            @PathVariable Long id,
            @RequestParam("docType") LicenseDocumentType docType,
            @RequestPart("file") MultipartFile file,
            Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(applicationService.uploadDocument(id, auth.getName(), docType, file));
    }

    @DeleteMapping("/{applicationId}/documents/{docId}")
    @PreAuthorize("hasRole('BUSINESS')")
    public ResponseEntity<Void> deleteDocument(
            @PathVariable Long applicationId,
            @PathVariable Long docId,
            Authentication auth) {
        applicationService.deleteDocument(applicationId, docId, auth.getName());
        return ResponseEntity.noContent().build();
    }
}
