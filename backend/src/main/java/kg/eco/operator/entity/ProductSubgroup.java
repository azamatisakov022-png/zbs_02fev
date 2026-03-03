package kg.eco.operator.entity;

import jakarta.persistence.*;
import kg.eco.operator.entity.enums.ProductGroupType;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@EqualsAndHashCode(of = "id")
@Entity
@Table(name = "product_subgroups")
public class ProductSubgroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_group_id", nullable = false)
    private ProductGroup productGroup;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String name;

    @Column(nullable = false, length = 30)
    private String gskpCode;

    @Column(length = 50)
    private String tnvedCode;

    @Column(columnDefinition = "TEXT")
    private String tnvedName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ProductGroupType type;

    @Column(nullable = false)
    private BigDecimal rateMultiplier;

    @Column(length = 200)
    private String packagingMaterial;

    @Column(length = 10)
    private String packagingLetterCode;

    @Column(length = 10)
    private String packagingDigitalCode;

    @Column(nullable = false)
    private Integer sortOrder;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
