package kg.eco.operator.entity;

import jakarta.persistence.*;
import kg.eco.operator.entity.enums.InspectionStatus;
import kg.eco.operator.entity.enums.RecyclerStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "recyclers")
public class Recycler {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_name", nullable = false)
    private String companyName;

    @Column(name = "legal_form", length = 50)
    private String legalForm;

    @Column(nullable = false, unique = true, length = 14)
    private String inn;

    @Column(length = 100)
    private String region;

    private String address;

    private Double latitude;

    private Double longitude;

    @Column(length = 100)
    private String director;

    @Column(name = "director_position", length = 100)
    private String directorPosition;

    @Column(name = "contact_person", length = 100)
    private String contactPerson;

    @Column(name = "contact_position", length = 100)
    private String contactPosition;

    @Column(length = 30)
    private String phone;

    @Column(length = 100)
    private String email;

    @Column(name = "license_number", length = 50)
    private String licenseNumber;

    @Column(name = "license_date")
    private LocalDate licenseDate;

    @Column(name = "license_expiry")
    private LocalDate licenseExpiry;

    @Column(name = "license_issuer")
    private String licenseIssuer;

    @Column(name = "eco_passport_number", length = 50)
    private String ecoPassportNumber;

    @Column(name = "eco_passport_date")
    private LocalDate ecoPassportDate;

    @OneToMany(mappedBy = "recycler", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RecyclerCapacity> capacities = new ArrayList<>();

    @Column(name = "technologies", columnDefinition = "text[]")
    private String[] technologies;

    @Column(columnDefinition = "text")
    private String equipment;

    @Column(name = "territory_area", precision = 12, scale = 2)
    private BigDecimal territoryArea;

    @Column(name = "employees_count")
    private Integer employeesCount;

    @Column(name = "certifications", columnDefinition = "text[]")
    private String[] certifications;

    @Enumerated(EnumType.STRING)
    @Column(name = "inspection_status", length = 30)
    private InspectionStatus inspectionStatus;

    @Column(name = "last_inspection_date")
    private LocalDate lastInspectionDate;

    @Column(name = "inspection_remarks", columnDefinition = "text")
    private String inspectionRemarks;

    @Column(name = "next_inspection_date")
    private LocalDate nextInspectionDate;

    @Column(name = "volume_current_year", precision = 15, scale = 4)
    private BigDecimal volumeCurrentYear;

    @Column(name = "volume_previous_year", precision = 15, scale = 4)
    private BigDecimal volumePreviousYear;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RecyclerStatus status;

    @Column(name = "suspension_reason", columnDefinition = "text")
    private String suspensionReason;

    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;

    @Column(columnDefinition = "text")
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        lastUpdated = LocalDateTime.now();
        if (status == null) status = RecyclerStatus.ACTIVE;
    }

    @PreUpdate
    protected void onUpdate() {
        lastUpdated = LocalDateTime.now();
    }
}
