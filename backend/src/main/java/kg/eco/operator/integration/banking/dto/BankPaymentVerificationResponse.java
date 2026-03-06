package kg.eco.operator.integration.banking.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class BankPaymentVerificationResponse {
    private PaymentVerificationStatus status;
    private String trackingId;
    private BigDecimal confirmedAmount;
    private LocalDate confirmedDate;
    private String bankReference;
    private String errorMessage;

    public enum PaymentVerificationStatus {
        CONFIRMED, NOT_FOUND, AMOUNT_MISMATCH, PENDING, ERROR
    }
}
