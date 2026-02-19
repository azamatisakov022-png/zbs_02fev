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
public class LandfillStatsResponse {

    private BigDecimal totalDesignCapacity;
    private BigDecimal totalCurrentVolume;
    private BigDecimal averageFillLevel;
    private long overfilledCount;
}
