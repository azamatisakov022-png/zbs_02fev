package kg.eco.operator.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "accounts")
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false, unique = true)
    private Company company;

    @Column(precision = 15, scale = 2)
    private BigDecimal balance;

    @Column(name = "total_charged", precision = 15, scale = 2)
    private BigDecimal totalCharged;

    @Column(name = "total_paid", precision = 15, scale = 2)
    private BigDecimal totalPaid;

    @Column(name = "total_offset", precision = 15, scale = 2)
    private BigDecimal totalOffset;

    @OneToMany(mappedBy = "account", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Transaction> transactions = new ArrayList<>();

    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        lastUpdated = LocalDateTime.now();
        if (balance == null) balance = BigDecimal.ZERO;
        if (totalCharged == null) totalCharged = BigDecimal.ZERO;
        if (totalPaid == null) totalPaid = BigDecimal.ZERO;
        if (totalOffset == null) totalOffset = BigDecimal.ZERO;
    }

    @PreUpdate
    protected void onUpdate() {
        lastUpdated = LocalDateTime.now();
    }
}
