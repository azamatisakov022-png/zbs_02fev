package kg.eco.operator.entity;

import jakarta.persistence.*;
import kg.eco.operator.entity.enums.ProductGroupType;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@EqualsAndHashCode(of = "id")
@Entity
@Table(name = "product_groups")
public class ProductGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "group_number", nullable = false, unique = true)
    private Integer groupNumber;

    @Column(nullable = false, length = 500)
    private String name;

    @Column(nullable = false, length = 30)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ProductGroupType type;

    @Column(nullable = false, length = 20)
    private String unit;

    @Column(length = 1)
    private String sectionLetter;

    @Column(length = 200)
    private String sectionName;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "productGroup", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductSubgroup> subgroups = new ArrayList<>();

    @OneToMany(mappedBy = "productGroup", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductGroupRate> rates = new ArrayList<>();

    @OneToMany(mappedBy = "productGroup", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductGroupNorm> norms = new ArrayList<>();

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
