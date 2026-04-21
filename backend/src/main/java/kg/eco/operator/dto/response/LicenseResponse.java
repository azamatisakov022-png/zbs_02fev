package kg.eco.operator.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import kg.eco.operator.entity.enums.ApplicantType;
import kg.eco.operator.entity.enums.LicenseType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Выданная лицензия в ответе API (реестр, публичная страница, детали).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class LicenseResponse {

    private Long id;
    private String licenseNumber;      // ЛП-2026-0001
    private Long applicationId;

    private ApplicantType applicantType;
    private Long applicantId;
    private String applicantName;
    private String applicantInn;

    private LicenseType licenseType;
    private List<String> activityTypes;
    private String legalAddress;
    private String actualAddress;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate issuedAt;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate validUntil;

    private Boolean isPublished;
    private Boolean isRevoked;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime revokedAt;

    private String revocationReason;
    private String issuedByName;

    /** Вычисляемое: "active" | "expiring" (30 дней до конца) | "expired" | "revoked". */
    private String statusLabel;
}
