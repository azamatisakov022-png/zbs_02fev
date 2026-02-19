package kg.eco.operator.entity;

import jakarta.persistence.*;
import kg.eco.operator.entity.enums.RefundReason;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Entity
@Table(name = "refund_items")
public class RefundItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "refund_id", nullable = false)
    private Refund refund;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "calculation_id")
    private Calculation calculation;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RefundReason reason;
}
