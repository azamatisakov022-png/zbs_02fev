package kg.eco.operator.integration.banking.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
public class BankStatementResponse {
    private String accountNumber;
    private LocalDate periodFrom;
    private LocalDate periodTo;
    private BigDecimal openingBalance;
    private BigDecimal closingBalance;
    private List<BankStatementEntry> entries;
}
