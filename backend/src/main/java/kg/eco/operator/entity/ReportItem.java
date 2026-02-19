package kg.eco.operator.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Entity
@Table(name = "report_items")
public class ReportItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_id", nullable = false)
    private Report report;

    @Column(name = "waste_group", nullable = false)
    private String wasteGroup;

    @Column(name = "waste_code", length = 20)
    private String wasteCode;

    @Column(name = "volume_received", precision = 15, scale = 4)
    private BigDecimal volumeReceived;

    @Column(name = "volume_processed", precision = 15, scale = 4)
    private BigDecimal volumeProcessed;

    @Column(name = "recycling_percent", precision = 5, scale = 2)
    private BigDecimal recyclingPercent;

    @Column(name = "recycling_norm", precision = 5, scale = 2)
    private BigDecimal recyclingNorm;

    @Column(length = 200)
    private String technology;
}
