package kg.eco.operator.entity;

import jakarta.persistence.*;
import kg.eco.operator.entity.enums.ApplicantType;
import kg.eco.operator.entity.enums.LicenseType;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Выданная лицензия в сфере обращения с отходами.
 * Запись создаётся только при одобрении заявки (LicenseApplicationStatus=APPROVED).
 * Маппится на таблицу licenses (миграция V19).
 *
 * Номер формируется сервисом в формате ЛП-{YYYY}-{NNNN} через license_number_counters.
 */
@Data
@Entity
@Table(name = "licenses")
public class License {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "license_number", nullable = false, unique = true, length = 20)
    private String licenseNumber;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false, unique = true)
    private LicenseApplication application;

    // ─── данные заявителя (дублируются для устойчивости) ───
    @Enumerated(EnumType.STRING)
    @Column(name = "applicant_type", nullable = false, length = 20)
    private ApplicantType applicantType;

    @Column(name = "applicant_id")
    private Long applicantId;

    @Column(name = "applicant_name", nullable = false, length = 255)
    private String applicantName;

    @Column(name = "applicant_inn", nullable = false, length = 14)
    private String applicantInn;

    // ─── параметры лицензии ───
    @Enumerated(EnumType.STRING)
    @Column(name = "license_type", nullable = false, length = 20)
    private LicenseType licenseType;

    @Column(name = "activity_types", nullable = false, columnDefinition = "text[]")
    private String[] activityTypes;

    @Column(name = "legal_address", nullable = false, columnDefinition = "TEXT")
    private String legalAddress;

    @Column(name = "actual_address", nullable = false, columnDefinition = "TEXT")
    private String actualAddress;

    // ─── срок действия ───
    @Column(name = "issued_at", nullable = false)
    private LocalDate issuedAt;

    /** Бессрочных лицензий не бывает. */
    @Column(name = "valid_until", nullable = false)
    private LocalDate validUntil;

    // ─── публикация и отзыв ───
    @Column(name = "is_published", nullable = false)
    private Boolean isPublished = true;

    @Column(name = "is_revoked", nullable = false)
    private Boolean isRevoked = false;

    @Column(name = "revoked_at")
    private LocalDateTime revokedAt;

    @Column(name = "revocation_reason", columnDefinition = "TEXT")
    private String revocationReason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "issued_by_id")
    private User issuedBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
        if (isPublished == null) isPublished = true;
        if (isRevoked == null) isRevoked = false;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
