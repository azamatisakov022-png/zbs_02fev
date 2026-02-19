package kg.eco.operator.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class AccountRefundRequest {

    @NotNull
    @Positive
    private BigDecimal amount;

    @NotBlank
    private String reason;
}
