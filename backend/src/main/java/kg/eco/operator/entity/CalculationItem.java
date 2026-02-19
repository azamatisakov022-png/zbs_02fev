package kg.eco.operator.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Entity
@Table(name = "calculation_items")
public class CalculationItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "calculation_id", nullable = false)
    private Calculation calculation;

    @Column(name = "product_group", nullable = false)
    private String productGroup;

    @Column(name = "product_subgroup")
    private String productSubgroup;

    @Column(name = "tnved_code", length = 20)
    private String tnvedCode;

    @Column(name = "gskp_code", length = 20)
    private String gskpCode;

    @Column(name = "product_name")
    private String productName;

    @Column(precision = 15, scale = 4)
    private BigDecimal quantity;

    @Column(length = 20)
    private String unit;

    @Column(precision = 15, scale = 4)
    private BigDecimal weight;

    @Column(precision = 15, scale = 2)
    private BigDecimal rate;

    @Column(precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(name = "recycling_norm", precision = 5, scale = 2)
    private BigDecimal recyclingNorm;
}
