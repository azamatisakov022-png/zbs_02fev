package kg.eco.operator.integration.banking.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class BankStatementRequest {
    private String accountNumber;
    private String bik;
    private LocalDate periodFrom;
    private LocalDate periodTo;
}
