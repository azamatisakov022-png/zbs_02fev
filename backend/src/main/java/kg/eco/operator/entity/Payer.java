package kg.eco.operator.entity;

import jakarta.persistence.*;
import kg.eco.operator.entity.enums.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "payers")
public class Payer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private PayerCategory category;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private PayerSubcategory subcategory;

    @Column(name = "product_groups", columnDefinition = "text[]")
    private String[] productGroups;

    @Column(name = "registration_date")
    private LocalDate registrationDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "reporting_status", length = 20)
    private ReportingStatus reportingStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "settlement_status", length = 20)
    private SettlementStatus settlementStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "system_status", length = 20)
    private SystemStatus systemStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", length = 20)
    private PaymentStatus paymentStatus;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
