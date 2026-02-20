package kg.eco.operator.entity;

import jakarta.persistence.*;
import kg.eco.operator.entity.enums.ReportStatus;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "reports")
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String number;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recycler_id")
    private Recycler recycler;

    @Column(name = "submitter_inn", length = 14)
    private String submitterInn;

    @Column(length = 20)
    private String period;

    @OneToMany(mappedBy = "report", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ReportItem> items = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ReportStatus status;

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
        if (status == null) status = ReportStatus.DRAFT;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
