package kg.eco.operator.entity;

import jakarta.persistence.*;
import kg.eco.operator.entity.enums.DumpStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "dumps")
public class Dump {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(length = 100)
    private String region;

    private String address;

    private Double latitude;

    private Double longitude;

    @Column(precision = 12, scale = 2)
    private BigDecimal area;

    @Column(name = "estimated_volume", precision = 15, scale = 4)
    private BigDecimal estimatedVolume;

    @Column(name = "waste_types", columnDefinition = "text[]")
    private String[] wasteTypes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private DumpStatus status;

    @Column(name = "discovered_date")
    private LocalDate discoveredDate;

    @Column(name = "photos", columnDefinition = "text[]")
    private String[] photos;

    @Column(columnDefinition = "text")
    private String notes;

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
