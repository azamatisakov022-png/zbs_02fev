package kg.eco.operator.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Entity
@Table(name = "recycler_capacities")
public class RecyclerCapacity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recycler_id", nullable = false)
    private Recycler recycler;

    @Column(name = "waste_group", nullable = false)
    private String wasteGroup;

    @Column(name = "waste_code", length = 20)
    private String wasteCode;

    @Column(name = "monthly_capacity", nullable = false, precision = 15, scale = 4)
    private BigDecimal monthlyCapacity;

    @Column(name = "annual_capacity", precision = 15, scale = 4)
    private BigDecimal annualCapacity;

    @Column(name = "current_load", precision = 15, scale = 4)
    private BigDecimal currentLoad;

    @Column(name = "load_percent", precision = 5, scale = 2)
    private BigDecimal loadPercent;

    @Column(length = 200)
    private String technology;
}
