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
public class RecyclerStatsResponse {

    private long total;
    private long active;
    private long suspended;
    private BigDecimal totalCapacity;
    private BigDecimal totalLoad;
    private BigDecimal loadPercent;
}
