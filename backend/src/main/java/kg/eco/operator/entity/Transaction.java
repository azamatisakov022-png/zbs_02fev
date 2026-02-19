package kg.eco.operator.entity;

import jakarta.persistence.*;
import kg.eco.operator.entity.enums.ReferenceType;
import kg.eco.operator.entity.enums.TransactionType;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "transactions")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @Column(nullable = false)
    private LocalDate date;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TransactionType type;

    private String description;

    @Column(precision = 15, scale = 2)
    private BigDecimal debit;

    @Column(precision = 15, scale = 2)
    private BigDecimal credit;

    @Column(precision = 15, scale = 2)
    private BigDecimal balance;

    @Column(name = "reference_id")
    private Long referenceId;

    @Enumerated(EnumType.STRING)
    @Column(name = "reference_type", length = 20)
    private ReferenceType referenceType;
}
