package kg.eco.operator.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
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

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ReportItem that = (ReportItem) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
