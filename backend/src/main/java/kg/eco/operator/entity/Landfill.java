package kg.eco.operator.entity;

import jakarta.persistence.*;
import kg.eco.operator.entity.enums.LandfillStatus;
import kg.eco.operator.entity.enums.LandfillType;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "landfills")
public class Landfill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LandfillType type;

    @Column(length = 100)
    private String region;

    private String address;

    private Double latitude;

    private Double longitude;

    @Column(precision = 12, scale = 2)
    private BigDecimal area;

    @Column(name = "design_capacity", precision = 15, scale = 2)
    private BigDecimal designCapacity;

    @Column(name = "current_volume", precision = 15, scale = 2)
    private BigDecimal currentVolume;

    @Column(name = "fill_percent", precision = 5, scale = 2)
    private BigDecimal fillPercent;

    @Column(name = "year_opened")
    private Integer yearOpened;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LandfillStatus status;

    @Column(length = 200)
    private String operator;

    // Infrastructure (embedded as JSON or separate columns)
    @Column(name = "has_weigh_station")
    private Boolean hasWeighStation;

    @Column(name = "has_fencing")
    private Boolean hasFencing;

    @Column(name = "has_access_road")
    private Boolean hasAccessRoad;

    @Column(name = "has_water_monitoring")
    private Boolean hasWaterMonitoring;

    @Column(name = "has_gas_collection")
    private Boolean hasGasCollection;

    @Column(name = "has_leachate_system")
    private Boolean hasLeachateSystem;

    // Equipment
    private Integer bulldozers;
    private Integer compactors;
    private Integer excavators;
    private Integer trucks;

    // Morphological composition (%)
    @Column(name = "morph_organic", precision = 5, scale = 2)
    private BigDecimal morphOrganic;

    @Column(name = "morph_paper", precision = 5, scale = 2)
    private BigDecimal morphPaper;

    @Column(name = "morph_plastic", precision = 5, scale = 2)
    private BigDecimal morphPlastic;

    @Column(name = "morph_glass", precision = 5, scale = 2)
    private BigDecimal morphGlass;

    @Column(name = "morph_metal", precision = 5, scale = 2)
    private BigDecimal morphMetal;

    @Column(name = "morph_textile", precision = 5, scale = 2)
    private BigDecimal morphTextile;

    @Column(name = "morph_other", precision = 5, scale = 2)
    private BigDecimal morphOther;

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
