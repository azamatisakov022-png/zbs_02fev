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
public class RecyclerCapacityResponse {

    private String wasteGroup;
    private String wasteCode;
    private BigDecimal monthlyCapacity;
    private BigDecimal annualCapacity;
    private BigDecimal currentLoad;
    private BigDecimal loadPercent;
    private String technology;
}
