package kg.eco.operator.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class OffsetRequest {

    @NotNull
    @Positive
    private BigDecimal amount;

    @NotNull
    private Long reportId;
}
