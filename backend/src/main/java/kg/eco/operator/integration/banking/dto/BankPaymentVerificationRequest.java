package kg.eco.operator.integration.banking.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class BankPaymentVerificationRequest {
    private String paymentOrderNumber;
    private BigDecimal expectedAmount;
    private LocalDate paymentDate;
    private String payerInn;
    private String payerBankBik;
    private String targetAccount;
    private String targetBik;
    private String purpose;
}
