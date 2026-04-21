package kg.eco.operator.controller;

import jakarta.validation.Valid;
import kg.eco.operator.dto.request.ApproveLicenseApplicationRequest;
import kg.eco.operator.dto.request.RejectLicenseApplicationRequest;
import kg.eco.operator.dto.request.SiteVisitRequest;
import kg.eco.operator.dto.response.LicenseApplicationResponse;
import kg.eco.operator.entity.enums.LicenseApplicationStatus;
import kg.eco.operator.entity.enums.LicenseType;
import kg.eco.operator.service.LicenseApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * Админ-эндпоинты заявок на лицензию для сотрудников МПРЭТН.
 * Роли: EMPLOYEE, MINISTRY, ADMIN.
 */
@RestController
@RequestMapping("/admin/license-applications")
@RequiredArgsConstructor
public class AdminLicenseApplicationController {

    private final LicenseApplicationService applicationService;

    @GetMapping
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MINISTRY', 'ADMIN')")
    public ResponseEntity<List<LicenseApplicationResponse>> list(
            @RequestParam(required = false) LicenseApplicationStatus status,
            @RequestParam(required = false) LicenseType licenseType,
            @RequestParam(required = false) Boolean overdue) {
        return ResponseEntity.ok(applicationService.listAll(status, licenseType, overdue));
    }

    @GetMapping("/status-counts")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MINISTRY', 'ADMIN')")
    public ResponseEntity<Map<String, Long>> statusCounts() {
        return ResponseEntity.ok(applicationService.getStatusCounts());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MINISTRY', 'ADMIN')")
    public ResponseEntity<LicenseApplicationResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(applicationService.getById(id));
    }

    @PostMapping("/{id}/accept")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MINISTRY', 'ADMIN')")
    public ResponseEntity<LicenseApplicationResponse> accept(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(applicationService.acceptForReview(id, auth.getName()));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MINISTRY', 'ADMIN')")
    public ResponseEntity<LicenseApplicationResponse> reject(
            @PathVariable Long id,
            @Valid @RequestBody RejectLicenseApplicationRequest request,
            Authentication auth) {
        return ResponseEntity.ok(applicationService.reject(id, auth.getName(), request));
    }

    @PostMapping("/{id}/site-visit")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MINISTRY', 'ADMIN')")
    public ResponseEntity<LicenseApplicationResponse> siteVisit(
            @PathVariable Long id,
            @Valid @RequestBody SiteVisitRequest request,
            Authentication auth) {
        return ResponseEntity.ok(applicationService.recordSiteVisit(id, auth.getName(), request));
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MINISTRY', 'ADMIN')")
    public ResponseEntity<LicenseApplicationResponse> approve(
            @PathVariable Long id,
            @Valid @RequestBody ApproveLicenseApplicationRequest request,
            Authentication auth) {
        return ResponseEntity.ok(applicationService.approve(id, auth.getName(), request));
    }
}
