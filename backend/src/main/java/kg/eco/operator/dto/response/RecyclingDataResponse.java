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
public class RecyclingDataResponse {

    private String wasteGroup;
    private BigDecimal volumeReceived;
    private BigDecimal volumeProcessed;
    private BigDecimal recyclingPercent;
    private BigDecimal norm;
}
