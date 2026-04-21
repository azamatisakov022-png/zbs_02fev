package kg.eco.operator.dto.mapper;

import kg.eco.operator.dto.response.LicenseApplicationResponse;
import kg.eco.operator.dto.response.LicenseResponse;
import kg.eco.operator.dto.response.PaymentStatusResponse;
import kg.eco.operator.entity.License;
import kg.eco.operator.entity.LicenseApplication;
import kg.eco.operator.entity.LicenseApplicationDocument;
import kg.eco.operator.entity.LicensePayment;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Ручной маппер Entity ↔ DTO для модуля лицензий. Простой, без MapStruct,
 * чтобы не тащить новую зависимость (в проекте маппинги везде ручные).
 */
@Component
public class LicenseMapper {

    public LicenseApplicationResponse toResponse(
            LicenseApplication a,
            List<LicenseApplicationDocument> docs,
            LicensePayment payment,
            License license) {

        LicenseApplicationResponse.LicenseApplicationResponseBuilder b = LicenseApplicationResponse.builder()
                .id(a.getId())
                .status(a.getStatus())
                .applicantType(a.getApplicantType())
                .applicantId(a.getApplicantId())
                .applicantEntity(a.getApplicantEntity())
                .applicantName(a.getApplicantName())
                .applicantInn(a.getApplicantInn())
                .licenseType(a.getLicenseType())
                .activityTypes(a.getActivityTypes() != null ? Arrays.asList(a.getActivityTypes()) : Collections.emptyList())
                .legalAddress(a.getLegalAddress())
                .actualAddress(a.getActualAddress())
                .contactPhone(a.getContactPhone())
                .contactEmail(a.getContactEmail())
                .contactPerson(a.getContactPerson())
                .submittedAt(a.getSubmittedAt())
                .deadline(a.getDeadline())
                .reopenedCount(a.getReopenedCount())
                .siteVisitDone(a.getSiteVisitDone())
                .siteVisitDate(a.getSiteVisitDate())
                .siteVisitInspector(a.getSiteVisitInspector())
                .siteVisitComment(a.getSiteVisitComment())
                .rejectionReason(a.getRejectionReason())
                .rejectionComment(a.getRejectionComment())
                .createdAt(a.getCreatedAt())
                .updatedAt(a.getUpdatedAt());

        if (a.getDeadline() != null) {
            long days = ChronoUnit.DAYS.between(LocalDateTime.now(), a.getDeadline());
            b.daysLeft((int) days);
        }

        if (docs != null) {
            b.documents(docs.stream().map(this::toDocumentItem).collect(Collectors.toList()));
        }

        if (payment != null) {
            b.payment(LicenseApplicationResponse.PaymentSummary.builder()
                    .id(payment.getId())
                    .provider(payment.getProvider())
                    .status(payment.getStatus() != null ? payment.getStatus().name() : null)
                    .paymentMethod(payment.getPaymentMethod() != null ? payment.getPaymentMethod().name() : null)
                    .paidAt(payment.getPaidAt())
                    .receiptFileName(payment.getManualReceiptFileName())
                    .build());
        }

        if (license != null) {
            b.licenseId(license.getId())
                    .licenseNumber(license.getLicenseNumber())
                    .licenseHasDocument(license.getLicenseDocumentObjectKey() != null)
                    .licenseDocumentFileName(license.getLicenseDocumentFileName());
        }

        return b.build();
    }

    public LicenseApplicationResponse.DocumentItem toDocumentItem(LicenseApplicationDocument d) {
        return LicenseApplicationResponse.DocumentItem.builder()
                .id(d.getId())
                .docType(d.getDocType() != null ? d.getDocType().getValue() : null)
                .fileName(d.getFileName())
                .fileSize(d.getFileSize())
                .uploadedAt(d.getUploadedAt())
                .build();
    }

    public LicenseResponse toResponse(License l) {
        LicenseResponse.LicenseResponseBuilder b = LicenseResponse.builder()
                .id(l.getId())
                .licenseNumber(l.getLicenseNumber())
                .applicationId(l.getApplication() != null ? l.getApplication().getId() : null)
                .applicantType(l.getApplicantType())
                .applicantId(l.getApplicantId())
                .applicantName(l.getApplicantName())
                .applicantInn(l.getApplicantInn())
                .licenseType(l.getLicenseType())
                .activityTypes(l.getActivityTypes() != null ? Arrays.asList(l.getActivityTypes()) : Collections.emptyList())
                .legalAddress(l.getLegalAddress())
                .actualAddress(l.getActualAddress())
                .issuedAt(l.getIssuedAt())
                .validUntil(l.getValidUntil())
                .isPublished(l.getIsPublished())
                .isRevoked(l.getIsRevoked())
                .revokedAt(l.getRevokedAt())
                .revocationReason(l.getRevocationReason())
                .issuedByName(l.getIssuedBy() != null ? l.getIssuedBy().getCompanyName() : null)
                .statusLabel(computeStatusLabel(l))
                .hasDocument(l.getLicenseDocumentObjectKey() != null)
                .documentFileName(l.getLicenseDocumentFileName())
                .documentUploadedAt(l.getLicenseDocumentUploadedAt());
        return b.build();
    }

    private String computeStatusLabel(License l) {
        if (Boolean.TRUE.equals(l.getIsRevoked())) return "revoked";
        LocalDate today = LocalDate.now();
        if (l.getValidUntil().isBefore(today)) return "expired";
        long days = ChronoUnit.DAYS.between(today, l.getValidUntil());
        if (days <= 30) return "expiring";
        return "active";
    }

    public PaymentStatusResponse toPaymentStatus(LicensePayment p, LicenseApplication a) {
        return PaymentStatusResponse.builder()
                .paymentId(p.getId())
                .applicationId(a != null ? a.getId() : p.getApplication() != null ? p.getApplication().getId() : null)
                .applicationStatus(a != null && a.getStatus() != null ? a.getStatus().getValue() : null)
                .status(p.getStatus() != null ? p.getStatus().getValue() : null)
                .provider(p.getProvider())
                .amount(p.getAmount())
                .paidAt(p.getPaidAt())
                .receiptUrl(p.getReceiptUrl())
                .build();
    }
}
