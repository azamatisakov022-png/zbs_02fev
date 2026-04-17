package kg.eco.operator.dto.request;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ContestUpdateRequest {

    private String title;
    private String description;
    private String conditions;
    private BigDecimal grantAmount;
    private String grantCurrency;
    private LocalDateTime deadline;
}
