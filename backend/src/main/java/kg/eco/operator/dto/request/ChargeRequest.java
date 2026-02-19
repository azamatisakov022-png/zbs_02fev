package kg.eco.operator.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ChargeRequest {

    @NotNull
    @Positive
    private BigDecimal amount;

    @NotNull
    private Long calculationId;

    private String description;
}
