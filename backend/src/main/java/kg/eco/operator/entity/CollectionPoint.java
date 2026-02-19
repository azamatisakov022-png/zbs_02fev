package kg.eco.operator.entity;

import jakarta.persistence.*;
import kg.eco.operator.entity.enums.CollectionPointStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "collection_points")
public class CollectionPoint {

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

    @Column(name = "waste_types", columnDefinition = "text[]")
    private String[] wasteTypes;

    @Column(name = "operating_hours", length = 100)
    private String operatingHours;

    @Column(name = "contact_phone", length = 30)
    private String contactPhone;

    @Column(length = 200)
    private String operator;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CollectionPointStatus status;

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
