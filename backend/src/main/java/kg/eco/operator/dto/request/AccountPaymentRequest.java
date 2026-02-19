package kg.eco.operator.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class AccountPaymentRequest {

    @NotNull
    @Positive
    private BigDecimal amount;

    private LocalDate paymentDate;

    private String documentNumber;
}
