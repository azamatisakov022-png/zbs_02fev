package kg.eco.operator.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Entity
@Table(name = "recycling_norms")
public class RecyclingNorm {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(nullable = false)
    private Integer year;

    @Column(name = "norm_percent", nullable = false, precision = 5, scale = 2)
    private BigDecimal normPercent;

    @Column(name = "resolution_number", length = 50)
    private String resolutionNumber;
}
