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
public class ReconciliationResponse {

    private BigDecimal charged;
    private BigDecimal paid;
    private BigDecimal offset;
    private BigDecimal balance;
}
