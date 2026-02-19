package kg.eco.operator.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IncomeDataResponse {

    private String period;
    private BigDecimal charged;
    private BigDecimal collected;
    private BigDecimal refunded;
}
