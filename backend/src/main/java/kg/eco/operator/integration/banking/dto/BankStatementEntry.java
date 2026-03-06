package kg.eco.operator.integration.banking.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class BankStatementEntry {
    private String transactionId;
    private LocalDate date;
    private BigDecimal amount;
    private String senderInn;
    private String senderName;
    private String senderBank;
    private String purpose;
    private String reference;
}
