package kg.eco.operator.entity;

import jakarta.persistence.*;
import kg.eco.operator.entity.enums.ContestStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "contests")
public class Contest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, columnDefinition = "text")
    private String description;

    @Column(columnDefinition = "text")
    private String conditions;

    @Column(name = "grant_amount", precision = 15, scale = 2)
    private BigDecimal grantAmount;

    @Column(name = "grant_currency", length = 10)
    private String grantCurrency;

    @Column(nullable = false)
    private LocalDateTime deadline;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ContestStatus status;

    @Column(name = "regulations_object_key", length = 255)
    private String regulationsObjectKey;

    @Column(name = "regulations_file_name", length = 255)
    private String regulationsFileName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id")
    private User createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = ContestStatus.DRAFT;
        if (grantCurrency == null) grantCurrency = "KGS";
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
