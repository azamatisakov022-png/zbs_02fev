package kg.eco.operator.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ContestCreateRequest {

    @NotBlank
    private String title;

    @NotBlank
    private String description;

    private String conditions;

    @PositiveOrZero
    private BigDecimal grantAmount;

    private String grantCurrency;

    @NotNull
    private LocalDateTime deadline;
}
