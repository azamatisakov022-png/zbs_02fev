package kg.eco.operator.entity;

import jakarta.persistence.*;
import kg.eco.operator.entity.enums.DeclarationStatus;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "declarations")
public class Declaration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String number;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @Column(nullable = false)
    private Integer year;

    @OneToMany(mappedBy = "declaration", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DeclarationItem> items = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private DeclarationStatus status;

    @Column(name = "total_charged", precision = 15, scale = 2)
    private java.math.BigDecimal totalCharged;

    @Column(name = "total_paid", precision = 15, scale = 2)
    private java.math.BigDecimal totalPaid;

    @Column(name = "total_offset", precision = 15, scale = 2)
    private java.math.BigDecimal totalOffset;

    @Column(precision = 15, scale = 2)
    private java.math.BigDecimal balance;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = DeclarationStatus.DRAFT;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
