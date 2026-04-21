package kg.eco.operator.entity;

import jakarta.persistence.*;
import kg.eco.operator.entity.enums.ApplicantEntity;
import kg.eco.operator.entity.enums.ApplicantType;
import kg.eco.operator.entity.enums.LicenseApplicationStatus;
import kg.eco.operator.entity.enums.LicenseType;
import kg.eco.operator.entity.enums.RejectionReason;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Заявка на выдачу лицензии в сфере обращения с отходами.
 * Маппится на таблицу license_applications (миграция V18).
 *
 * Связь с заявителем — полиморфная (applicant_type + applicant_id):
 * FK проверяется на уровне сервиса, не в БД, чтобы поддержать тип OTHER
 * (иная организация, данных в реестрах нет — вводятся вручную).
 */
@Data
@Entity
@Table(name = "license_applications")
public class LicenseApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ─── заявитель ───
    @Enumerated(EnumType.STRING)
    @Column(name = "applicant_type", nullable = false, length = 20)
    private ApplicantType applicantType;

    /** nullable — для типа OTHER данных в реестрах нет. */
    @Column(name = "applicant_id")
    private Long applicantId;

    @Enumerated(EnumType.STRING)
    @Column(name = "applicant_entity", nullable = false, length = 20)
    private ApplicantEntity applicantEntity;

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

    @Column(name = "contact_phone", length = 30)
    private String contactPhone;

    @Column(name = "contact_email", length = 100)
    private String contactEmail;

    @Column(name = "contact_person", length = 100)
    private String contactPerson;

    // ─── процесс ───
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private LicenseApplicationStatus status = LicenseApplicationStatus.DRAFT;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    /** submitted_at + license_review_deadline_days (по умолчанию 30). */
    @Column
    private LocalDateTime deadline;

    @Column(name = "reopened_count", nullable = false)
    private Integer reopenedCount = 0;

    // ─── выезд на объект ───
    @Column(name = "site_visit_done", nullable = false)
    private Boolean siteVisitDone = false;

    @Column(name = "site_visit_date")
    private LocalDate siteVisitDate;

    /** ФИО инспектора/секретаря комиссии, текст (не FK). */
    @Column(name = "site_visit_inspector", length = 200)
    private String siteVisitInspector;

    @Column(name = "site_visit_comment", columnDefinition = "TEXT")
    private String siteVisitComment;

    // ─── отказ ───
    @Enumerated(EnumType.STRING)
    @Column(name = "rejection_reason", length = 30)
    private RejectionReason rejectionReason;

    @Column(name = "rejection_comment", columnDefinition = "TEXT")
    private String rejectionComment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rejection_decision_by_id")
    private User rejectionDecisionBy;

    @Column(name = "rejection_decision_at")
    private LocalDateTime rejectionDecisionAt;

    // ─── кем подана ───
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submitted_by_id")
    private User submittedBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
        if (status == null) status = LicenseApplicationStatus.DRAFT;
        if (reopenedCount == null) reopenedCount = 0;
        if (siteVisitDone == null) siteVisitDone = false;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
